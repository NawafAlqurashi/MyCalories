"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import type { MealType, Recipe } from "@/lib/models";
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from "@/lib/mealTypes";

export default function MealBrowser({
  recipes,
  initialType,
}: {
  recipes: Recipe[];
  initialType: MealType;
}) {
  const [type, setType] = useState<MealType>(initialType);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const filtered = useMemo(() => {
    const minNum = min ? Number(min) : null;
    const maxNum = max ? Number(max) : null;
    const hasRange = minNum !== null || maxNum !== null;

    return recipes.filter((recipe) => {
      if (recipe.meal_type && recipe.meal_type !== type) return false;
      if (hasRange) {
        if (recipe.calories == null) return false;
        if (minNum !== null && recipe.calories < minNum) return false;
        if (maxNum !== null && recipe.calories > maxNum) return false;
      }
      return true;
    });
  }, [recipes, type, min, max]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-1 rounded-xl bg-surface-muted p-1">
        {MEAL_TYPE_ORDER.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-lg py-2 text-xs font-semibold transition-colors ${
              type === t ? "card-shadow bg-surface text-foreground" : "text-foreground/40"
            }`}
          >
            {MEAL_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="card-shadow flex items-center gap-3 rounded-2xl bg-surface p-3.5">
        <Flame size={16} className="shrink-0 text-foreground/40" />
        <span className="text-xs font-medium text-foreground/50">Calorie range</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder="Min"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          className="w-16 min-w-0 rounded-lg bg-surface-muted px-2 py-1.5 text-center text-sm outline-none"
        />
        <span className="text-foreground/30">–</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder="Max"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          className="w-16 min-w-0 rounded-lg bg-surface-muted px-2 py-1.5 text-center text-sm outline-none"
        />
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface-muted p-6 text-center">
          <span className="text-2xl">🍽️</span>
          <p className="text-sm text-foreground/50">
            No {MEAL_TYPE_LABELS[type].toLowerCase()} ideas match that range yet. Try widening it,
            or add a new recipe.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/meals/recipes/${recipe.id}`}
            className="card-shadow flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{recipe.name}</p>
              <p className="text-xs text-foreground/40">
                {recipe.ingredients.split("\n").filter(Boolean).length} ingredients
              </p>
            </div>
            {recipe.calories != null && (
              <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold tabular-nums">
                {Math.round(recipe.calories)} kcal
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
