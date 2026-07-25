import Link from "next/link";
import { Trash2 } from "lucide-react";
import { listProducts } from "@/lib/models";
import { removeProduct } from "./actions";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  const products = listProducts();

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <h1 className="text-2xl font-semibold">Products</h1>
      <p className="text-sm text-foreground/40">
        Foods you&apos;ve scanned before — tap to log again.
      </p>

      {products.length === 0 && (
        <p className="rounded-2xl bg-surface-muted p-4 text-sm text-foreground/40">
          No saved products yet. Scan a barcode to add one.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="card-shadow flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3"
          >
            <Link
              href={product.barcode ? `/meals/scan?barcode=${encodeURIComponent(product.barcode)}` : "#"}
              className="min-w-0 flex-1"
            >
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="text-xs text-foreground/40">
                {product.brand ? `${product.brand} · ` : ""}
                {Math.round(product.calories_per_100g)} kcal/100g
              </p>
            </Link>
            <form
              action={async () => {
                "use server";
                await removeProduct(product.id);
              }}
            >
              <button type="submit" className="text-foreground/30 hover:text-danger" aria-label="Delete product">
                <Trash2 size={16} />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
