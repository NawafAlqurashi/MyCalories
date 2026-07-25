"use client";

import { useState } from "react";

interface Totals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function pct(value: number, of: number) {
  if (of <= 0) return 0;
  return Math.min(100, Math.round((value / of) * 100));
}

export default function MacroCards({
  totals,
  targets,
}: {
  totals: Totals;
  targets: Totals;
}) {
  const [mode, setMode] = useState<"consumed" | "remaining">("consumed");

  const calorieValue =
    mode === "consumed" ? Math.round(totals.calories) : Math.max(0, Math.round(targets.calories - totals.calories));

  const macros = [
    { key: "protein", label: "Protein", emoji: "🍗", color: "bg-protein", textColor: "text-protein" },
    { key: "fat", label: "Fat", emoji: "🥑", color: "bg-fat", textColor: "text-fat" },
    { key: "carbs", label: "Carbs", emoji: "🌾", color: "bg-carbs", textColor: "text-carbs" },
  ] as const;

  return (
    <section className="flex flex-col gap-3">
      <div className="rounded-2xl bg-surface border border-border p-5">
        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground/60">
          🔥 Calories
        </p>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-orange-500 transition-all"
            style={{ width: `${pct(totals.calories, targets.calories)}%` }}
          />
        </div>
        <p className="mt-2 text-3xl font-bold tabular-nums">
          {calorieValue}
          <span className="text-base font-medium text-foreground/40">
            {mode === "consumed" ? ` / ${Math.round(targets.calories)} kcal` : " kcal left"}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {macros.map((m) => {
          const consumed = totals[m.key];
          const target = targets[m.key];
          const value = mode === "consumed" ? Math.round(consumed) : Math.max(0, Math.round(target - consumed));
          return (
            <div key={m.key} className="rounded-2xl bg-surface border border-border p-3.5">
              <p className="flex items-center gap-1 text-xs font-medium text-foreground/60">
                <span>{m.emoji}</span> {m.label}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={`h-full rounded-full ${m.color}`}
                  style={{ width: `${pct(consumed, target)}%` }}
                />
              </div>
              <p className={`mt-2 text-lg font-bold tabular-nums ${m.textColor}`}>
                {value}
                <span className="text-xs font-medium text-foreground/40">
                  {mode === "consumed" ? `/${Math.round(target)}g` : "g"}
                </span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex rounded-xl bg-surface-muted p-1">
        {(["consumed", "remaining"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-colors ${
              mode === m ? "bg-surface shadow-sm" : "text-foreground/40"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </section>
  );
}
