"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireGymAdmin } from "@/lib/auth";

function revalidateRoutine(gymSlug: string, clientId: number) {
  revalidatePath(`/g/${gymSlug}/admin/clientes`);
  revalidatePath(`/g/${gymSlug}/admin/clientes/${clientId}`);
}

export async function addRoutineExercise(clientId: number, exerciseId: string) {
  const { gym, gymId } = await requireGymAdmin();

  const owned = await prisma.client.findFirst({ where: { id: clientId, gymId } });
  if (!owned) return;

  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise) return;

  const existing = await prisma.routineExercise.findFirst({
    where: { clientId, gymId, exerciseId },
  });
  if (existing) return;

  const last = await prisma.routineExercise.aggregate({
    where: { clientId, gymId },
    _max: { order: true },
  });

  await prisma.routineExercise.create({
    data: {
      clientId,
      gymId,
      exerciseId,
      sets: 3,
      reps: "12",
      rest: "60",
      order: (last._max.order ?? -1) + 1,
    },
  });

  revalidateRoutine(gym.slug, clientId);
}

export async function removeRoutineExercise(routineId: number) {
  const { gym, gymId } = await requireGymAdmin();

  const routine = await prisma.routineExercise.findFirst({
    where: { id: routineId, gymId },
  });
  if (!routine) return;

  await prisma.routineExercise.delete({ where: { id: routineId } });

  const siblings = await prisma.routineExercise.findMany({
    where: { clientId: routine.clientId, gymId },
    orderBy: { order: "asc" },
  });
  await prisma.$transaction(
    siblings.map((s, i) =>
      prisma.routineExercise.update({
        where: { id: s.id },
        data: { order: i },
      })
    )
  );

  revalidateRoutine(gym.slug, routine.clientId);
}

export async function updateRoutineExercise(
  routineId: number,
  data: { sets: number; reps: string; rest: string; notes?: string }
) {
  const { gym, gymId } = await requireGymAdmin();

  const routine = await prisma.routineExercise.findFirst({
    where: { id: routineId, gymId },
  });
  if (!routine) return;

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

  revalidateRoutine(gym.slug, routine.clientId);
}

export async function moveRoutineExercise(
  routineId: number,
  direction: "up" | "down"
) {
  const { gym, gymId } = await requireGymAdmin();

  const routine = await prisma.routineExercise.findFirst({
    where: { id: routineId, gymId },
  });
  if (!routine) return;

  const siblings = await prisma.routineExercise.findMany({
    where: { clientId: routine.clientId, gymId },
    orderBy: { order: "asc" },
  });

  const index = siblings.findIndex((s) => s.id === routineId);
  const swapIndex =
    direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= siblings.length) return;

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

  revalidateRoutine(gym.slug, routine.clientId);
}