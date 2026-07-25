"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateExercise, createWorkoutLog, deleteWorkoutLog } from "@/lib/models";
import { redirect } from "next/navigation";

export async function addExercise(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const exercise = getOrCreateExercise(name);
  revalidatePath("/gym");
  redirect(`/gym/${exercise.id}`);
}

export async function logSet(formData: FormData) {
  const exerciseId = Number(formData.get("exerciseId"));
  const weight = Number(formData.get("weight"));
  const reps = Number(formData.get("reps"));
  const sets = Number(formData.get("sets") || 1);

  if (!exerciseId || !weight || !reps) return;

  createWorkoutLog({ exerciseId, weight, reps, sets });
  revalidatePath(`/gym/${exerciseId}`);
  revalidatePath("/gym");
  revalidatePath("/");
}

export async function removeWorkoutLog(id: number, exerciseId: number) {
  deleteWorkoutLog(id);
  revalidatePath(`/gym/${exerciseId}`);
  revalidatePath("/gym");
  revalidatePath("/");
}
