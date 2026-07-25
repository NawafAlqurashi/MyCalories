"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { upsertProfile } from "@/lib/models";
import type { ActivityLevel, Goal, Sex } from "@/lib/targets";

export async function saveProfile(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim() || null;
  const sex = String(formData.get("sex") ?? "male") as Sex;
  const weightKg = Number(formData.get("weightKg"));
  const heightCm = Number(formData.get("heightCm"));
  const age = Number(formData.get("age"));
  const activityLevel = String(formData.get("activityLevel") ?? "moderate") as ActivityLevel;
  const goal = String(formData.get("goal") ?? "maintain") as Goal;

  if (!weightKg || !heightCm || !age) return;

  upsertProfile({ name, sex, weightKg, heightCm, age, activityLevel, goal });
  revalidatePath("/");
  revalidatePath("/settings");
  redirect("/");
}
