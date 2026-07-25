import Link from "next/link";
import { Pencil } from "lucide-react";
import type { DayPlan } from "@/lib/models";
import { PLAN_CATEGORY_EMOJI, PLAN_CATEGORY_STYLE, WEEKDAY_LABELS } from "@/lib/planCategories";

export default function WeekPlanStrip({ plan }: { plan: DayPlan[] }) {
  const today = new Date().getDay();
  const todayPlan = plan.find((p) => p.day_of_week === today);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground/60">This week&apos;s plan</h2>
        <Link href="/gym/schedule" className="flex items-center gap-1 text-xs font-medium text-accent">
          <Pencil size={12} /> Edit
        </Link>
      </div>

      <div className="card-shadow rounded-2xl bg-surface p-4">
        {todayPlan && (
          <p className="mb-3 text-sm font-semibold">
            Today: {PLAN_CATEGORY_EMOJI[todayPlan.category]}{" "}
            {todayPlan.label || (todayPlan.category === "rest" ? "Rest day" : "")}
          </p>
        )}
        <div className="grid grid-cols-7 gap-1.5">
          {plan.map((day) => {
            const isToday = day.day_of_week === today;
            return (
              <div key={day.day_of_week} className="flex flex-col items-center gap-1.5">
                <span className={`text-xs ${isToday ? "font-semibold text-accent" : "text-foreground/40"}`}>
                  {WEEKDAY_LABELS[day.day_of_week]}
                </span>
                <span
                  className={`flex h-11 w-11 flex-col items-center justify-center rounded-xl text-base ${
                    PLAN_CATEGORY_STYLE[day.category]
                  } ${isToday ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""}`}
                >
                  {PLAN_CATEGORY_EMOJI[day.category]}
                </span>
                <span className="line-clamp-1 max-w-[3.2rem] text-center text-[10px] text-foreground/40">
                  {day.label || (day.category === "rest" ? "Rest" : "")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
