"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createRecipe, deleteRecipe, updateRecipe, type MealType } from "@/lib/models";

function parseNum(value: FormDataEntryValue | null): number | null {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

function parseMealType(value: FormDataEntryValue | null): MealType | null {
  const str = String(value ?? "").trim();
  return str === "breakfast" || str === "lunch" || str === "dinner" || str === "snack" ? str : null;
}

export async function saveNewRecipe(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const ingredients = String(formData.get("ingredients") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();
  if (!name) return;

  createRecipe({
    name,
    mealType: parseMealType(formData.get("mealType")),
    ingredients,
    instructions,
    calories: parseNum(formData.get("calories")),
    protein: parseNum(formData.get("protein")),
    carbs: parseNum(formData.get("carbs")),
    fat: parseNum(formData.get("fat")),
  });

  revalidatePath("/meals/recipes");
  revalidatePath("/meals/plan");
  revalidatePath("/meals/browse");
  redirect("/meals/recipes");
}

export async function saveExistingRecipe(id: number, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const ingredients = String(formData.get("ingredients") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();
  if (!name) return;

  updateRecipe(id, {
    name,
    mealType: parseMealType(formData.get("mealType")),
    ingredients,
    instructions,
    calories: parseNum(formData.get("calories")),
    protein: parseNum(formData.get("protein")),
    carbs: parseNum(formData.get("carbs")),
    fat: parseNum(formData.get("fat")),
  });

  revalidatePath("/meals/recipes");
  revalidatePath("/meals/plan");
  revalidatePath("/meals/shopping-list");
  revalidatePath("/meals/browse");
  redirect("/meals/recipes");
}

export async function removeRecipe(id: number) {
  deleteRecipe(id);
  revalidatePath("/meals/recipes");
  revalidatePath("/meals/plan");
  revalidatePath("/meals/shopping-list");
  revalidatePath("/meals/browse");
}
