import { NextRequest } from "next/server";
import { createSavedMeal, listSavedMeals } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(listSavedMeals());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, grams, calories, protein, carbs, fat } = body;

  if (!name || typeof grams !== "number" || typeof calories !== "number") {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const saved = createSavedMeal({
    name,
    grams,
    calories,
    protein: protein ?? 0,
    carbs: carbs ?? 0,
    fat: fat ?? 0,
  });

  return Response.json(saved, { status: 201 });
}
