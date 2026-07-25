import { NextRequest } from "next/server";
import { createWorkoutLog, listWorkoutLogs } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const exerciseId = request.nextUrl.searchParams.get("exerciseId");
  return Response.json(listWorkoutLogs(exerciseId ? Number(exerciseId) : undefined));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { exerciseId, weight, reps, sets, notes } = body;

  if (!exerciseId || typeof weight !== "number" || typeof reps !== "number") {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const log = createWorkoutLog({
    exerciseId: Number(exerciseId),
    weight,
    reps,
    sets: sets ?? 1,
    notes: notes ?? null,
  });

  return Response.json(log, { status: 201 });
}
