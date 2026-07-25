import { NextRequest } from "next/server";
import { listProducts, upsertProduct } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(listProducts());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { barcode, name, brand, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g } = body;

  if (!name || typeof caloriesPer100g !== "number") {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const product = upsertProduct({
    barcode: barcode ?? null,
    name,
    brand: brand ?? null,
    caloriesPer100g,
    proteinPer100g: proteinPer100g ?? 0,
    carbsPer100g: carbsPer100g ?? 0,
    fatPer100g: fatPer100g ?? 0,
  });

  return Response.json(product, { status: 201 });
}
