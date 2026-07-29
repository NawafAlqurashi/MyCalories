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

function insight(remaining: number) {
  if (remaining > 50) return `${Math.round(remaining)} kcal left today`;
  if (remaining >= -50) return "Right on target today 🎯";
  return `${Math.round(Math.abs(remaining))} kcal over today`;
}

const MACROS = [
  { key: "protein", label: "Protein", emoji: "🍗", bg: "bg-protein/15", bar: "bg-protein", text: "text-protein" },
  { key: "carbs", label: "Carbs", emoji: "🌾", bg: "bg-carbs/15", bar: "bg-carbs", text: "text-carbs" },
  { key: "fat", label: "Fat", emoji: "🥑", bg: "bg-fat/15", bar: "bg-fat", text: "text-fat" },
] as const;

export default function MacroCards({
  totals,
  targets,
}: {
  totals: Totals;
  targets: Totals;
}) {
  const [mode, setMode] = useState<"consumed" | "remaining">("consumed");
  const remaining = targets.calories - totals.calories;
  const caloriePct = pct(totals.calories, targets.calories);
  const calorieValue =
    mode === "consumed" ? Math.round(totals.calories) : Math.max(0, Math.round(remaining));

  return (
    <section className="flex flex-col gap-3">
      <div className="card-shadow-lg rounded-3xl bg-surface p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/40">
              <span className="text-sm">🔥</span> Calories
            </p>
            <p className="mt-1 text-[2.15rem] font-extrabold leading-none tabular-nums">
              {calorieValue}
              <span className="ml-1.5 text-sm font-semibold text-foreground/35">
                {mode === "consumed" ? `/ ${Math.round(targets.calories)}` : "kcal left"}
              </span>
            </p>
          </div>
          <span className="mb-1 shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">
            {caloriePct}%
          </span>
        </div>

        <div className="mt-3.5 h-4 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--ring-from)] to-[var(--ring-to)] transition-all duration-500"
            style={{ width: `${caloriePct}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-foreground/50">{insight(remaining)}</p>

        <div className="mt-5 flex flex-col gap-3.5">
          {MACROS.map((m) => {
            const consumed = totals[m.key];
            const target = targets[m.key];
            const value =
              mode === "consumed" ? Math.round(consumed) : Math.max(0, Math.round(target - consumed));
            const p = pct(consumed, target);
            return (
              <div key={m.key} className="flex items-center gap-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm ${m.bg}`}>
                  {m.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium text-foreground/50">{m.label}</span>
                    <span className={`text-xs font-bold tabular-nums ${m.text}`}>
                      {value}
                      <span className="font-medium text-foreground/35">
                        g{mode === "consumed" ? ` / ${Math.round(target)}g` : ""}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={`h-full rounded-full ${m.bar} transition-all duration-500`}
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex rounded-full bg-surface-muted p-1">
        {(["consumed", "remaining"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold capitalize transition-colors ${
              mode === m ? "card-shadow bg-surface text-foreground" : "text-foreground/40"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </section>
  );
}
