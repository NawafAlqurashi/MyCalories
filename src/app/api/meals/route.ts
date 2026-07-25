import { NextRequest } from "next/server";
import { createMeal, listMeals, type MealSource, type MealType } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_SOURCES: MealSource[] = ["photo", "manual", "voice", "barcode"];
const VALID_MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export async function GET() {
  return Response.json(listMeals());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, grams, calories, protein, carbs, fat, source, mealType, notes } = body;

  if (!name || typeof grams !== "number" || typeof calories !== "number") {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const meal = createMeal({
    name,
    grams,
    calories,
    protein: protein ?? 0,
    carbs: carbs ?? 0,
    fat: fat ?? 0,
    source: VALID_SOURCES.includes(source) ? source : "manual",
    mealType: VALID_MEAL_TYPES.includes(mealType) ? mealType : undefined,
    notes: notes ?? null,
  });

  return Response.json(meal, { status: 201 });
}
