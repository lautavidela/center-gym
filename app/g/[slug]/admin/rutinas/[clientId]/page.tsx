import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { adminPath } from "@/lib/gyms";
import ClientRoutine from "@/components/client-routine";

export const metadata: Metadata = {
  title: "Rutina",
};

export default async function RutinaClientePage({
  params,
}: {
  params: Promise<{ slug: string; clientId: string }>;
}) {
  const { slug, clientId } = await params;
  const id = Number(clientId);

  const client = await prisma.client.findFirst({
    where: { id, gym: { slug } },
    include: {
      routineExercises: {
        orderBy: [{ day: "asc" }, { order: "asc" }],
        include: { exercise: true },
      },
    },
  });
  if (!client) notFound();

  const initialRoutines = client.routineExercises.map((r) => ({
    id: r.id,
    exerciseId: r.exerciseId,
    day: r.day,
    sets: r.sets,
    reps: r.reps,
    rest: r.rest,
    notes: r.notes,
    order: r.order,
    exercise: {
      name: r.exercise.name,
      muscle: r.exercise.muscle,
      bodyPart: r.exercise.bodyPart,
      equipment: r.exercise.equipment,
      gifUrl: r.exercise.gifUrl,
    },
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Link
          href={adminPath(slug, "/rutinas")}
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          ← Todas las rutinas
        </Link>
        <h1 className="mt-1 text-xl font-black sm:text-2xl">
          Rutina de {client.name}
        </h1>
        <p className="text-sm text-zinc-500">
          {client.dni ? `DNI ${client.dni}` : "Sin DNI"} · armá los ejercicios
          por día. El socio los va a ver en su consulta por DNI.
        </p>
      </div>

      <ClientRoutine clientId={client.id} initialRoutines={initialRoutines} />
    </div>
  );
}