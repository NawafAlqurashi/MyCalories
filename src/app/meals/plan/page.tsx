import Link from "next/link";
import { ChefHat, ShoppingBasket } from "lucide-react";
import { getMealPlan, listRecipes } from "@/lib/models";
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from "@/lib/mealTypes";
import { WEEKDAY_LABELS } from "@/lib/planCategories";
import { saveMealPlan } from "./actions";

export const dynamic = "force-dynamic";

export default function MealPlanPage() {
  const plan = getMealPlan();
  const recipes = listRecipes();

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Weekly meal plan</h1>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/meals/recipes"
          className="card-shadow flex items-center gap-2 rounded-2xl bg-surface p-3.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white">
            <ChefHat size={16} />
          </span>
          <span className="text-sm font-semibold">Recipes</span>
        </Link>
        <Link
          href="/meals/shopping-list"
          className="card-shadow flex items-center gap-2 rounded-2xl bg-surface p-3.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <ShoppingBasket size={16} />
          </span>
          <span className="text-sm font-semibold">Shopping list</span>
        </Link>
      </div>

      {recipes.length === 0 && (
        <p className="rounded-2xl bg-surface-muted p-4 text-sm text-foreground/50">
          Add a <Link href="/meals/recipes/new" className="font-medium text-accent">recipe</Link> first,
          then assign it to days below.
        </p>
      )}

      <form action={saveMealPlan} className="flex flex-col gap-3">
        {WEEKDAY_LABELS.map((dayLabel, dayOfWeek) => (
          <div key={dayOfWeek} className="card-shadow rounded-2xl bg-surface p-3.5">
            <p className="mb-2 text-sm font-semibold">{dayLabel}</p>
            <div className="flex flex-col gap-2">
              {MEAL_TYPE_ORDER.map((mealType) => {
                const slot = plan.find((s) => s.day_of_week === dayOfWeek && s.meal_type === mealType);
                return (
                  <div key={mealType} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-xs text-foreground/40">
                      {MEAL_TYPE_LABELS[mealType]}
                    </span>
                    <select
                      name={`recipe_${dayOfWeek}_${mealType}`}
                      defaultValue={slot?.recipe_id ?? ""}
                      className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none"
                    >
                      <option value="">—</option>
                      {recipes.map((recipe) => (
                        <option key={recipe.id} value={recipe.id}>
                          {recipe.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <button type="submit" className="mt-2 rounded-xl bg-accent py-3 text-sm font-semibold text-white">
          Save plan
        </button>
      </form>
    </div>
  );
}
