export interface OffProduct {
  barcode: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

interface OffApiResponse {
  status: number;
  product?: {
    product_name?: string;
    brands?: string;
    nutriments?: {
      "energy-kcal_100g"?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
    };
  };
}

export async function lookupBarcode(barcode: string): Promise<OffProduct | null> {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
    { headers: { "User-Agent": "MyCalories/1.0 (personal calorie tracker)" } }
  );
  if (!res.ok) return null;

  const data: OffApiResponse = await res.json();
  if (data.status !== 1 || !data.product) return null;

  const n = data.product.nutriments ?? {};
  const caloriesPer100g = n["energy-kcal_100g"];
  if (caloriesPer100g == null) return null;

  return {
    barcode,
    name: data.product.product_name?.trim() || "Unknown product",
    brand: data.product.brands?.trim() || null,
    caloriesPer100g,
    proteinPer100g: n.proteins_100g ?? 0,
    carbsPer100g: n.carbohydrates_100g ?? 0,
    fatPer100g: n.fat_100g ?? 0,
  };
}
