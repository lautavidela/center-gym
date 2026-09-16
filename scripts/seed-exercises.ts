import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const prisma = new PrismaClient();

type DatasetExercise = {
  id: string;
  slug: string;
  name: string;
  muscle: string;
  bodyPart: string;
  equipment: string;
  category: string;
  secondaryMuscles: string[];
  instructions: string[];
  file: string;
  gifUrl: string;
};

async function main() {
  const raw = readFileSync(resolve("assets/exercises.json"), "utf8");
  const data = JSON.parse(raw) as { count: number; exercises: DatasetExercise[] };

  const rows = data.exercises.map((e) => ({
    id: e.id,
    name: e.name,
    muscle: e.muscle || null,
    bodyPart: e.bodyPart || null,
    equipment: e.equipment || null,
    gifUrl: e.gifUrl,
    instructions: e.instructions.length > 0 ? e.instructions.join("\n") : null,
  }));

  const result = await prisma.exercise.createMany({
    data: rows,
    skipDuplicates: true,
  });

  const total = await prisma.exercise.count();
  console.log(`Catálogo de ejercicios: ${total} en DB (${result.count} insertados en esta corrida)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());