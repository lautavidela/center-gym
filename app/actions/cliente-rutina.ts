"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";
import { isValidDay } from "@/lib/routines";

export type RoutineItemsResult =
  | { ok: false; message: string }
  | { ok: true; routine: RoutineItemClient[] };

export type RoutineItemClient = {
  id: number;
  day: number;
  sets: number;
  reps: string;
  rest: string;
  notes: string | null;
  order: number;
  exercise: {
    id: string;
    name: string;
    muscle: string | null;
    bodyPart: string | null;
    equipment: string | null;
    gifUrl: string;
  };
};

async function authorize(
  gymId: number,
  rawDni: string,
  pin: string
): Promise<
  | { ok: false; message: string }
  | {
      ok: true;
      client: { id: number; gymId: number };
      gymSlug: string;
    }
> {
  const gym = await prisma.gym.findUnique({ where: { id: gymId } });
  if (!gym) return { ok: false, message: "Gimnasio inválido." };

  const dni = rawDni.replace(/\D/g, "");
  if (!dni) return { ok: false, message: "DNI inválido." };

  const client = await prisma.client.findFirst({ where: { gymId, dni } });
  if (!client) return { ok: false, message: "No encontramos un socio con ese DNI." };
  if (!client.pinHash) return { ok: false, message: "Todavía no creaste tu PIN." };
  if (!verifyPassword(pin, client.pinHash))
    return { ok: false, message: "PIN incorrecto." };

  return { ok: true, client, gymSlug: gym.slug };
}

function revalidateClient(gymSlug: string, clientId: number) {
  try {
    revalidatePath(`/g/${gymSlug}/admin/clientes`);
    revalidatePath(`/g/${gymSlug}/admin/clientes/${clientId}`);
    revalidatePath(`/g/${gymSlug}/admin/rutinas`);
    revalidatePath(`/g/${gymSlug}/admin/rutinas/${clientId}`);
  } catch {
    /* fuera del runtime de Next (scripts) no hay cache store */
  }
}

async function getRoutine(clientId: number): Promise<RoutineItemClient[]> {
  const rows = await prisma.routineExercise.findMany({
    where: { clientId },
    orderBy: [{ day: "asc" }, { order: "asc" }],
    include: { exercise: true },
  });
  return rows.map((r) => ({
    id: r.id,
    day: r.day,
    sets: r.sets,
    reps: r.reps,
    rest: r.rest,
    notes: r.notes,
    order: r.order,
    exercise: {
      id: r.exercise.id,
      name: r.exercise.name,
      muscle: r.exercise.muscle,
      bodyPart: r.exercise.bodyPart,
      equipment: r.exercise.equipment,
      gifUrl: r.exercise.gifUrl,
    },
  }));
}

export async function agregarEjercicio(
  gymId: number,
  dni: string,
  pin: string,
  exerciseId: string,
  day: number
): Promise<RoutineItemsResult> {
  const auth = await authorize(gymId, dni, pin);
  if (!auth.ok) return auth;
  if (!isValidDay(day)) return { ok: false, message: "Día inválido." };

  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise) return { ok: false, message: "Ejercicio no encontrado." };

  const existing = await prisma.routineExercise.findFirst({
    where: { clientId: auth.client.id, gymId, exerciseId, day },
  });
  if (existing) return { ok: false, message: "Ese ejercicio ya está ese día." };

  const last = await prisma.routineExercise.aggregate({
    where: { clientId: auth.client.id, gymId, day },
    _max: { order: true },
  });

  await prisma.routineExercise.create({
    data: {
      clientId: auth.client.id,
      gymId,
      exerciseId,
      day,
      sets: 3,
      reps: "12",
      rest: "60",
      order: (last._max.order ?? -1) + 1,
    },
  });

  revalidateClient(auth.gymSlug, auth.client.id);
  return { ok: true, routine: await getRoutine(auth.client.id) };
}

export async function quitarEjercicio(
  gymId: number,
  dni: string,
  pin: string,
  routineId: number
): Promise<RoutineItemsResult> {
  const auth = await authorize(gymId, dni, pin);
  if (!auth.ok) return auth;

  const routine = await prisma.routineExercise.findFirst({
    where: { id: routineId, clientId: auth.client.id, gymId },
  });
  if (!routine) return { ok: false, message: "Ejercicio no encontrado." };

  await prisma.routineExercise.delete({ where: { id: routineId } });

  const siblings = await prisma.routineExercise.findMany({
    where: { clientId: auth.client.id, gymId, day: routine.day },
    orderBy: { order: "asc" },
  });
  await prisma.$transaction(
    siblings.map((s, i) =>
      prisma.routineExercise.update({ where: { id: s.id }, data: { order: i } })
    )
  );

  revalidateClient(auth.gymSlug, auth.client.id);
  return { ok: true, routine: await getRoutine(auth.client.id) };
}

export async function editarEjercicio(
  gymId: number,
  dni: string,
  pin: string,
  routineId: number,
  data: { sets: number; reps: string; rest: string; notes?: string }
): Promise<RoutineItemsResult> {
  const auth = await authorize(gymId, dni, pin);
  if (!auth.ok) return auth;

  const routine = await prisma.routineExercise.findFirst({
    where: { id: routineId, clientId: auth.client.id, gymId },
  });
  if (!routine) return { ok: false, message: "Ejercicio no encontrado." };

  const sets = Number.isInteger(data.sets) && data.sets > 0 ? data.sets : 3;

  await prisma.routineExercise.update({
    where: { id: routineId },
    data: {
      sets,
      reps: String(data.reps ?? "").trim() || "12",
      rest: String(data.rest ?? "").trim() || "60",
      notes: String(data.notes ?? "").trim() || null,
    },
  });

  revalidateClient(auth.gymSlug, auth.client.id);
  return { ok: true, routine: await getRoutine(auth.client.id) };
}

export async function moverEjercicio(
  gymId: number,
  dni: string,
  pin: string,
  routineId: number,
  direction: "up" | "down"
): Promise<RoutineItemsResult> {
  const auth = await authorize(gymId, dni, pin);
  if (!auth.ok) return auth;

  const routine = await prisma.routineExercise.findFirst({
    where: { id: routineId, clientId: auth.client.id, gymId },
  });
  if (!routine) return { ok: false, message: "Ejercicio no encontrado." };

  const siblings = await prisma.routineExercise.findMany({
    where: { clientId: auth.client.id, gymId, day: routine.day },
    orderBy: { order: "asc" },
  });

  const index = siblings.findIndex((s) => s.id === routineId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= siblings.length)
    return { ok: true, routine: await getRoutine(auth.client.id) };

  const other = siblings[swapIndex];
  await prisma.$transaction([
    prisma.routineExercise.update({
      where: { id: routineId },
      data: { order: other.order },
    }),
    prisma.routineExercise.update({
      where: { id: other.id },
      data: { order: routine.order },
    }),
  ]);

  revalidateClient(auth.gymSlug, auth.client.id);
  return { ok: true, routine: await getRoutine(auth.client.id) };
}