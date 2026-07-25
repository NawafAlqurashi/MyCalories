"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setMealPlan, type MealType } from "@/lib/models";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export async function saveMealPlan(formData: FormData) {
  const entries: { dayOfWeek: number; mealType: MealType; recipeId: number | null }[] = [];

  for (let day = 0; day < 7; day++) {
    for (const mealType of MEAL_TYPES) {
      const raw = String(formData.get(`recipe_${day}_${mealType}`) ?? "");
      entries.push({ dayOfWeek: day, mealType, recipeId: raw ? Number(raw) : null });
    }
  }

  setMealPlan(entries);
  revalidatePath("/meals/plan");
  revalidatePath("/meals/shopping-list");
  revalidatePath("/");
  redirect("/meals/plan");
}
