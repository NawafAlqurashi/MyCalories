import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { listMeals } from "@/lib/models";
import MealSourceIcon from "@/components/MealSourceIcon";
import { removeMeal } from "./actions";

export const dynamic = "force-dynamic";

function groupByDay(meals: ReturnType<typeof listMeals>) {
  const groups = new Map<string, typeof meals>();
  for (const meal of meals) {
    const day = new Date(meal.logged_at + "Z").toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(meal);
  }
  return groups;
}

export default function MealsPage() {
  const meals = listMeals(30);
  const groups = groupByDay(meals);

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">History</h1>
        <Link
          href="/meals/new"
          className="flex items-center gap-1 rounded-full bg-accent px-3.5 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> Add
        </Link>
      </header>

      {meals.length === 0 && (
        <p className="rounded-2xl bg-surface-muted p-4 text-sm text-foreground/40">
          No meals logged yet. Tap Add to log your first meal.
        </p>
      )}

      {[...groups.entries()].map(([day, dayMeals]) => (
        <section key={day} className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/40">
            {day}
          </h2>
          {dayMeals.map((meal) => (
            <div
              key={meal.id}
              className="card-shadow flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3"
            >
              <MealSourceIcon source={meal.source} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{meal.name}</p>
                <p className="text-xs text-foreground/40">
                  {meal.grams}g · P{Math.round(meal.protein)} · C{Math.round(meal.carbs)} · F{Math.round(meal.fat)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold tabular-nums">{Math.round(meal.calories)} kcal</p>
                <form
                  action={async () => {
                    "use server";
                    await removeMeal(meal.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-foreground/30 hover:text-danger"
                    aria-label="Delete meal"
                  >
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
