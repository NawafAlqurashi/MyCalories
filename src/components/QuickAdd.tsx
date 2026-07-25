import { Package, UtensilsCrossed } from "lucide-react";
import { listSavedMeals, listProducts } from "@/lib/models";
import { quickLogSavedMeal } from "@/app/meals/saved/actions";
import { quickLogProduct } from "@/app/products/actions";

export default function QuickAdd() {
  const savedMeals = listSavedMeals().slice(0, 6);
  const products = listProducts().slice(0, 6);

  if (savedMeals.length === 0 && products.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground/60">Quick add</h2>
      <div className="mt-2 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
        {savedMeals.map((meal) => (
          <form
            key={`saved-${meal.id}`}
            action={async () => {
              "use server";
              await quickLogSavedMeal(meal.id);
            }}
            className="shrink-0"
          >
            <button
              type="submit"
              className="card-shadow flex w-28 flex-col gap-1.5 rounded-2xl bg-surface p-3 text-left active:scale-95 transition-transform"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
                <UtensilsCrossed size={15} />
              </span>
              <span className="line-clamp-2 text-xs font-semibold leading-tight">{meal.name}</span>
              <span className="text-[11px] text-foreground/40">{Math.round(meal.calories)} kcal</span>
            </button>
          </form>
        ))}
        {products.map((product) => (
          <form
            key={`product-${product.id}`}
            action={async () => {
              "use server";
              await quickLogProduct(product.id);
            }}
            className="shrink-0"
          >
            <button
              type="submit"
              className="card-shadow flex w-28 flex-col gap-1.5 rounded-2xl bg-surface p-3 text-left active:scale-95 transition-transform"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Package size={15} />
              </span>
              <span className="line-clamp-2 text-xs font-semibold leading-tight">{product.name}</span>
              <span className="text-[11px] text-foreground/40">
                {Math.round(product.calories_per_100g)} kcal/100g
              </span>
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
