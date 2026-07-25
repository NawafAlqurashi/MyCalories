import Link from "next/link";
import { Camera, Dumbbell, Plus } from "lucide-react";
import { listWorkoutLogs, todaysMeals, todayTotals, listExercises } from "@/lib/models";

export const dynamic = "force-dynamic";

function macroPct(value: number, of: number) {
  if (of <= 0) return 0;
  return Math.min(100, Math.round((value / of) * 100));
}

export default function DashboardPage() {
  const totals = todayTotals();
  const meals = todaysMeals();
  const recentWorkouts = listWorkoutLogs().slice(0, 4);
  const exercises = listExercises();
  const exerciseName = (id: number) =>
    exercises.find((e) => e.id === id)?.name ?? "Exercise";

  // Simple reference targets so the rings have something to fill toward.
  const targets = { calories: 2200, protein: 150, carbs: 220, fat: 70 };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <header>
        <p className="text-sm text-foreground/50">{today}</p>
        <h1 className="text-2xl font-semibold">Today</h1>
      </header>

      <section className="rounded-2xl bg-surface border border-border p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-3xl font-bold tabular-nums">
              {Math.round(totals.calories)}
              <span className="text-base font-medium text-foreground/40"> / {targets.calories} kcal</span>
            </p>
          </div>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${macroPct(totals.calories, targets.calories)}%` }}
          />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Protein", value: totals.protein, target: targets.protein, color: "bg-protein" },
            { label: "Carbs", value: totals.carbs, target: targets.carbs, color: "bg-carbs" },
            { label: "Fat", value: totals.fat, target: targets.fat, color: "bg-fat" },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium text-foreground/70">{m.label}</span>
                <span className="tabular-nums text-foreground/40">{Math.round(m.value)}g</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={`h-full rounded-full ${m.color}`}
                  style={{ width: `${macroPct(m.value, m.target)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link
          href="/meals/new"
          className="flex flex-col items-start gap-2 rounded-2xl bg-accent text-white p-4"
        >
          <Camera size={20} />
          <span className="text-sm font-semibold">Log a meal</span>
        </Link>
        <Link
          href="/gym"
          className="flex flex-col items-start gap-2 rounded-2xl bg-surface border border-border p-4"
        >
          <Dumbbell size={20} />
          <span className="text-sm font-semibold">Log a workout</span>
        </Link>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground/60">Today&apos;s meals</h2>
          <Link href="/meals" className="text-xs font-medium text-accent">
            See all
          </Link>
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {meals.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-foreground/40">
              No meals logged yet today.
            </p>
          )}
          {meals.slice(0, 4).map((meal) => (
            <div
              key={meal.id}
              className="flex items-center justify-between rounded-xl bg-surface border border-border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{meal.name}</p>
                <p className="text-xs text-foreground/40">{meal.grams}g</p>
              </div>
              <p className="text-sm font-semibold tabular-nums">{Math.round(meal.calories)} kcal</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground/60">Recent workouts</h2>
          <Link href="/gym" className="text-xs font-medium text-accent">
            See all
          </Link>
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {recentWorkouts.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-foreground/40">
              No workouts logged yet.
            </p>
          )}
          {recentWorkouts.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between rounded-xl bg-surface border border-border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{exerciseName(log.exercise_id)}</p>
                <p className="text-xs text-foreground/40">
                  {log.sets} × {log.reps} reps
                </p>
              </div>
              <p className="text-sm font-semibold tabular-nums">{log.weight} kg</p>
            </div>
          ))}
        </div>
      </section>

      <Link
        href="/gym/exercises/new"
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-foreground/50"
      >
        <Plus size={16} /> Add a new exercise
      </Link>
    </div>
  );
}
