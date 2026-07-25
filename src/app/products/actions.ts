"use server";

import { revalidatePath } from "next/cache";
import { createMeal, deleteProduct, getProduct } from "@/lib/models";

export async function removeProduct(id: number) {
  deleteProduct(id);
  revalidatePath("/products");
}

export async function quickLogProduct(id: number) {
  const product = getProduct(id);
  if (!product) return;

  createMeal({
    name: product.name,
    grams: 100,
    calories: product.calories_per_100g,
    protein: product.protein_per_100g,
    carbs: product.carbs_per_100g,
    fat: product.fat_per_100g,
    source: "barcode",
  });

  revalidatePath("/");
  revalidatePath("/meals");
}
