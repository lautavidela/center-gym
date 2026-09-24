import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { searchExercises } from "@/lib/exercise-search";

export async function GET(request: NextRequest) {
  const auth = await getCurrentUser();
  if (!auth) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!auth.user.gymId) {
    return NextResponse.json({ error: "El usuario no pertenece a un gimnasio" }, { status: 403 });
  }

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const exercises = await searchExercises(q);

  return NextResponse.json({ exercises });
}