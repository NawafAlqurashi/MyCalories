import type { Recipe } from "@/lib/models";
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from "@/lib/mealTypes";

export default function RecipeForm({
  recipe,
  action,
}: {
  recipe?: Recipe;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground/40">Recipe name</span>
        <input
          name="name"
          defaultValue={recipe?.name}
          placeholder="e.g. Grilled chicken & rice bowl"
          required
          className="rounded-xl border border-border bg-surface px-3.5 py-3 text-sm outline-none placeholder:text-foreground/30"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground/40">
          Meal type (so it shows up when browsing ideas for that meal)
        </span>
        <select
          name="mealType"
          defaultValue={recipe?.meal_type ?? ""}
          className="rounded-xl border border-border bg-surface px-3.5 py-3 text-sm outline-none"
        >
          <option value="">Any meal</option>
          {MEAL_TYPE_ORDER.map((type) => (
            <option key={type} value={type}>
              {MEAL_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground/40">
          Ingredients (one per line — used to build your shopping list)
        </span>
        <textarea
          name="ingredients"
          defaultValue={recipe?.ingredients}
          placeholder={"200g chicken breast\n1 cup rice\n1 avocado\nOlive oil"}
          rows={5}
          className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none placeholder:text-foreground/30"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground/40">How to prepare it</span>
        <textarea
          name="instructions"
          defaultValue={recipe?.instructions}
          placeholder={"1. Season chicken and grill 6-7 min per side\n2. Cook rice per package instructions\n3. Slice avocado and combine"}
          rows={6}
          className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none placeholder:text-foreground/30"
        />
      </label>

      <div>
        <span className="text-xs font-medium text-foreground/40">Nutrition (optional, per serving)</span>
        <div className="mt-1.5 grid grid-cols-4 gap-2">
          <NumberField name="calories" label="kcal" defaultValue={recipe?.calories} />
          <NumberField name="protein" label="protein" defaultValue={recipe?.protein} />
          <NumberField name="carbs" label="carbs" defaultValue={recipe?.carbs} />
          <NumberField name="fat" label="fat" defaultValue={recipe?.fat} />
        </div>
      </div>

      <button type="submit" className="rounded-xl bg-accent py-3 text-sm font-semibold text-white">
        {recipe ? "Save changes" : "Save recipe"}
      </button>
    </form>
  );
}

function NumberField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: number | null;
}) {
  return (
    <label className="flex flex-col gap-1">
      <input
        name={name}
        type="number"
        step="0.1"
        inputMode="decimal"
        defaultValue={defaultValue ?? ""}
        className="rounded-lg bg-surface-muted px-2 py-2 text-center text-sm font-semibold outline-none"
      />
      <span className="text-center text-[10px] text-foreground/40">{label}</span>
    </label>
  );
}
