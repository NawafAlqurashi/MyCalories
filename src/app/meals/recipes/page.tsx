import Link from "next/link";
import { Plus, Trash2, ChefHat } from "lucide-react";
import { listRecipes } from "@/lib/models";
import { MEAL_TYPE_LABELS } from "@/lib/mealTypes";
import { removeRecipe } from "./actions";

export const dynamic = "force-dynamic";

export default function RecipesPage() {
  const recipes = listRecipes();

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Recipes</h1>
        <Link
          href="/meals/recipes/new"
          className="flex items-center gap-1 rounded-full bg-accent px-3.5 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> Recipe
        </Link>
      </header>
      <p className="-mt-3 text-sm text-foreground/40">
        Build recipes here, then assign them to days in your{" "}
        <Link href="/meals/plan" className="font-medium text-accent">
          weekly meal plan
        </Link>
        .
      </p>

      {recipes.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface-muted p-6 text-center">
          <ChefHat size={24} className="text-foreground/30" />
          <p className="text-sm text-foreground/50">
            No recipes yet. Add one with its ingredients and prep steps.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="card-shadow flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3.5"
          >
            <Link href={`/meals/recipes/${recipe.id}`} className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {recipe.taste === "sweet" ? "🍯 " : recipe.taste === "savory" ? "🧂 " : ""}
                {recipe.name}
              </p>
              <p className="text-xs text-foreground/40">
                {recipe.meal_type ? `${MEAL_TYPE_LABELS[recipe.meal_type]} · ` : ""}
                {recipe.ingredients.split("\n").filter(Boolean).length} ingredients
                {recipe.calories ? ` · ${Math.round(recipe.calories)} kcal` : ""}
              </p>
            </Link>
            <form
              action={async () => {
                "use server";
                await removeRecipe(recipe.id);
              }}
            >
              <button type="submit" className="text-foreground/30 hover:text-danger" aria-label="Delete recipe">
                <Trash2 size={16} />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
