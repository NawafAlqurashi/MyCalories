import { NextRequest } from "next/server";
import { findProductByBarcode, upsertProduct } from "@/lib/models";
import { lookupBarcode } from "@/lib/openFoodFacts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("barcode");
  if (!barcode) {
    return Response.json({ error: "Missing barcode" }, { status: 400 });
  }

  const cached = findProductByBarcode(barcode);
  if (cached) {
    return Response.json({
      barcode,
      name: cached.name,
      brand: cached.brand,
      caloriesPer100g: cached.calories_per_100g,
      proteinPer100g: cached.protein_per_100g,
      carbsPer100g: cached.carbs_per_100g,
      fatPer100g: cached.fat_per_100g,
      cached: true,
    });
  }

  try {
    const product = await lookupBarcode(barcode);
    if (!product) {
      return Response.json({ error: "Product not found for that barcode" }, { status: 404 });
    }
    upsertProduct({
      barcode: product.barcode,
      name: product.name,
      brand: product.brand,
      caloriesPer100g: product.caloriesPer100g,
      proteinPer100g: product.proteinPer100g,
      carbsPer100g: product.carbsPer100g,
      fatPer100g: product.fatPer100g,
    });
    return Response.json({ ...product, cached: false });
  } catch (error) {
    console.error("barcode lookup failed", error);
    return Response.json({ error: "Lookup failed. Check your connection and try again." }, { status: 502 });
  }
}
