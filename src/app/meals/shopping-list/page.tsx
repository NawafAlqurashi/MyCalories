import Link from "next/link";
import { getShoppingList } from "@/lib/models";
import ShoppingList from "@/components/ShoppingList";

export const dynamic = "force-dynamic";

export default function ShoppingListPage() {
  const items = getShoppingList();

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <h1 className="text-2xl font-semibold">Shopping list</h1>
      <p className="-mt-3 text-sm text-foreground/40">
        Built automatically from the recipes in your{" "}
        <Link href="/meals/plan" className="font-medium text-accent">
          weekly meal plan
        </Link>
        .
      </p>

      <ShoppingList items={items} />
    </div>
  );
}
