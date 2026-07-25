"use server";

import { revalidatePath } from "next/cache";
import { deleteMeal } from "@/lib/models";

export async function removeMeal(id: number) {
  deleteMeal(id);
  revalidatePath("/meals");
  revalidatePath("/");
}
