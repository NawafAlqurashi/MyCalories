"use client";

import { useEffect, useState } from "react";

interface Item {
  text: string;
  recipeNames: string[];
}

const STORAGE_KEY = "mycalories:shopping-list-checked";

export default function ShoppingList({ items }: { items: Item[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setChecked(JSON.parse(raw));
      } catch {
        // ignore
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked, hydrated]);

  function toggle(text: string) {
    setChecked((prev) => ({ ...prev, [text]: !prev[text] }));
  }

  const remaining = items.filter((i) => !checked[i.text]).length;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface-muted p-6 text-center">
        <span className="text-2xl">🛒</span>
        <p className="text-sm text-foreground/50">
          Your shopping list is empty. Assign recipes to days in your weekly meal plan and their
          ingredients will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-foreground/40">{remaining} of {items.length} left to grab</p>
      {items.map((item) => (
        <button
          key={item.text}
          onClick={() => toggle(item.text)}
          className="card-shadow flex items-center gap-3 rounded-xl bg-surface px-4 py-3 text-left"
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs text-white ${
              checked[item.text] ? "border-accent bg-accent" : "border-border"
            }`}
          >
            {checked[item.text] ? "✓" : ""}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`text-sm ${checked[item.text] ? "text-foreground/30 line-through" : ""}`}>
              {item.text}
            </p>
            <p className="text-[11px] text-foreground/30">{item.recipeNames.join(", ")}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
