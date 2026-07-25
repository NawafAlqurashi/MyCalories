"use server";

import { revalidatePath } from "next/cache";
import { deleteProduct } from "@/lib/models";

export async function removeProduct(id: number) {
  deleteProduct(id);
  revalidatePath("/products");
}
