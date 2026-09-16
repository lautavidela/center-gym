import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await getCurrentUser();
  if (!auth) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!auth.user.gymId) {
    return NextResponse.json({ error: "El usuario no pertenece a un gimnasio" }, { status: 403 });
  }

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const query = q.trim();
  if (!query) return NextResponse.json({ exercises: [] });

  const exercises = await prisma.exercise.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { muscle: { contains: query, mode: "insensitive" } },
        { bodyPart: { contains: query, mode: "insensitive" } },
        { equipment: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    exercises: exercises.map((e) => ({
      id: e.id,
      name: e.name,
      muscle: e.muscle,
      bodyPart: e.bodyPart,
      equipment: e.equipment,
      gifUrl: e.gifUrl,
    })),
  });
}