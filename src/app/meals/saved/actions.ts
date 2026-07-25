"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMeal, deleteSavedMeal, getSavedMeal } from "@/lib/models";

export async function logSavedMeal(id: number) {
  const saved = getSavedMeal(id);
  if (!saved) return;

  createMeal({
    name: saved.name,
    grams: saved.grams,
    calories: saved.calories,
    protein: saved.protein,
    carbs: saved.carbs,
    fat: saved.fat,
    source: "manual",
  });

  revalidatePath("/");
  revalidatePath("/meals");
  redirect("/meals");
}

export async function quickLogSavedMeal(id: number) {
  const saved = getSavedMeal(id);
  if (!saved) return;

  createMeal({
    name: saved.name,
    grams: saved.grams,
    calories: saved.calories,
    protein: saved.protein,
    carbs: saved.carbs,
    fat: saved.fat,
    source: "manual",
  });

  revalidatePath("/");
  revalidatePath("/meals");
}

export async function removeSavedMeal(id: number) {
  deleteSavedMeal(id);
  revalidatePath("/meals/saved");
}
