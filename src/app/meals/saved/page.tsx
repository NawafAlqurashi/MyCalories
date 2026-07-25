import { Trash2 } from "lucide-react";
import { listSavedMeals } from "@/lib/models";
import { logSavedMeal, removeSavedMeal } from "./actions";

export const dynamic = "force-dynamic";

export default function SavedMealsPage() {
  const savedMeals = listSavedMeals();

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <h1 className="text-2xl font-semibold">Meals</h1>
      <p className="text-sm text-foreground/40">
        Saved meals — tap to log again instantly.
      </p>

      {savedMeals.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-foreground/40">
          No saved meals yet. Check &quot;Save as a reusable meal template&quot; when logging a
          meal to add one here.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {savedMeals.map((meal) => (
          <div
            key={meal.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-surface border border-border px-4 py-3"
          >
            <form
              action={async () => {
                "use server";
                await logSavedMeal(meal.id);
              }}
              className="min-w-0 flex-1"
            >
              <button type="submit" className="w-full text-left">
                <p className="truncate text-sm font-medium">{meal.name}</p>
                <p className="text-xs text-foreground/40">
                  {meal.grams}g · {Math.round(meal.calories)} kcal · P{Math.round(meal.protein)} C
                  {Math.round(meal.carbs)} F{Math.round(meal.fat)}
                </p>
              </button>
            </form>
            <form
              action={async () => {
                "use server";
                await removeSavedMeal(meal.id);
              }}
            >
              <button type="submit" className="text-foreground/30 hover:text-danger" aria-label="Delete">
                <Trash2 size={16} />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
