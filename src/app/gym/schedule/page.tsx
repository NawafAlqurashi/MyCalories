import { getWeeklyPlan } from "@/lib/models";
import { PLAN_CATEGORIES, WEEKDAY_LABELS } from "@/lib/planCategories";
import { saveWeeklyPlan } from "../actions";

export const dynamic = "force-dynamic";

export default function SchedulePage() {
  const plan = getWeeklyPlan();

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <h1 className="text-2xl font-semibold">Weekly plan</h1>
      <p className="text-sm text-foreground/40">
        Set what each day looks like — a gym split, a sport, cardio, or rest. Shows up on your
        Gym tab every week.
      </p>

      <form action={saveWeeklyPlan} className="flex flex-col gap-3">
        {plan.map((day) => (
          <div key={day.day_of_week} className="card-shadow flex items-center gap-3 rounded-2xl bg-surface p-3.5">
            <span className="w-10 shrink-0 text-sm font-semibold text-foreground/60">
              {WEEKDAY_LABELS[day.day_of_week]}
            </span>
            <input
              name={`label_${day.day_of_week}`}
              defaultValue={day.label}
              placeholder="e.g. Upper body, Padel, Rest"
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-foreground/30"
            />
            <select
              name={`category_${day.day_of_week}`}
              defaultValue={day.category}
              className="shrink-0 rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none"
            >
              {PLAN_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button type="submit" className="mt-2 rounded-xl bg-accent py-3 text-sm font-semibold text-white">
          Save plan
        </button>
      </form>
    </div>
  );
}
