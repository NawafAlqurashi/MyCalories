"use client";

import { useState } from "react";
import Ring from "./Ring";

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

export default function MacroCards({
  totals,
  targets,
}: {
  totals: Totals;
  targets: Totals;
}) {
  const [mode, setMode] = useState<"consumed" | "remaining">("consumed");
  const remaining = targets.calories - totals.calories;

  const calorieValue =
    mode === "consumed" ? Math.round(totals.calories) : Math.max(0, Math.round(remaining));

  const macros = [
    { key: "protein", label: "Protein", emoji: "🍗", color: "var(--protein)", textColor: "text-protein" },
    { key: "carbs", label: "Carbs", emoji: "🌾", color: "var(--carbs)", textColor: "text-carbs" },
    { key: "fat", label: "Fat", emoji: "🥑", color: "var(--fat)", textColor: "text-fat" },
  ] as const;

  return (
    <section className="flex flex-col gap-3">
      <div className="card-shadow-lg rounded-3xl bg-surface p-5">
        <div className="flex items-center gap-5">
          <Ring size={128} strokeWidth={12} progress={pct(totals.calories, targets.calories)} gradient>
            <div className="flex flex-col items-center">
              <span className="text-2xl">🔥</span>
              <span className="text-2xl font-extrabold tabular-nums leading-tight">{calorieValue}</span>
              <span className="text-[11px] text-foreground/40">
                {mode === "consumed" ? `of ${Math.round(targets.calories)}` : "kcal left"}
              </span>
            </div>
          </Ring>

          <div className="flex flex-1 flex-col gap-2.5">
            <p className="text-sm font-semibold text-foreground/80">{insight(remaining)}</p>
            <div className="flex gap-3">
              {macros.map((m) => {
                const consumed = totals[m.key];
                const target = targets[m.key];
                const value = mode === "consumed" ? Math.round(consumed) : Math.max(0, Math.round(target - consumed));
                return (
                  <div key={m.key} className="flex flex-col items-center gap-1">
                    <Ring size={54} strokeWidth={6} progress={pct(consumed, target)} color={m.color}>
                      <span className="text-base">{m.emoji}</span>
                    </Ring>
                    <p className={`text-xs font-bold tabular-nums ${m.textColor}`}>
                      {value}
                      <span className="font-medium text-foreground/40">g</span>
                    </p>
                    <p className="text-[10px] text-foreground/40">{m.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
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
