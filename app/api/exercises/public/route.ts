import { NextRequest, NextResponse } from "next/server";
import { searchExercises } from "@/lib/exercise-search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const exercises = await searchExercises(q);

  return NextResponse.json({ exercises });
}