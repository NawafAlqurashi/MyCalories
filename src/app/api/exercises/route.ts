import { NextRequest } from "next/server";
import { getOrCreateExercise, listExercises } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(listExercises());
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return Response.json({ error: "Exercise name is required" }, { status: 400 });
  }
  const exercise = getOrCreateExercise(name.trim());
  return Response.json(exercise, { status: 201 });
}
