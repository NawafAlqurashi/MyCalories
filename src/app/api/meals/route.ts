import { NextRequest } from "next/server";
import { createMeal, listMeals } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(listMeals());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, grams, calories, protein, carbs, fat, source, notes } = body;

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
    source: source === "photo" ? "photo" : "manual",
    notes: notes ?? null,
  });

  return Response.json(meal, { status: 201 });
}
