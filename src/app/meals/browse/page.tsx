import Link from "next/link";
import { listRecipes, type MealType } from "@/lib/models";
import MealBrowser from "@/components/MealBrowser";

export const dynamic = "force-dynamic";

function inferMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 16) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialType: MealType =
    type === "breakfast" || type === "lunch" || type === "dinner" || type === "snack"
      ? type
      : inferMealType();

  const recipes = listRecipes();

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <h1 className="text-2xl font-semibold">Meal ideas</h1>
      <p className="-mt-3 text-sm text-foreground/40">
        Pick a meal type and calorie range to browse your{" "}
        <Link href="/meals/recipes" className="font-medium text-accent">
          recipes
        </Link>{" "}
        — tap one to see its ingredients and prep steps.
      </p>

      <MealBrowser recipes={recipes} initialType={initialType} />
    </div>
  );
}
