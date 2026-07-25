import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getMealPlan } from "@/lib/models";
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from "@/lib/mealTypes";

export default function WeeklyMealPlanCard() {
  const today = new Date().getDay();
  const todaySlots = getMealPlan().filter((slot) => slot.day_of_week === today);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground/60">This week&apos;s meals</h2>
        <Link href="/meals/plan" className="text-xs font-medium text-accent">
          View plan
        </Link>
      </div>
      <Link
        href="/meals/plan"
        className="card-shadow mt-2 flex items-center justify-between gap-3 rounded-2xl bg-surface p-4"
      >
        <div className="flex-1 divide-y divide-border">
          {MEAL_TYPE_ORDER.map((mealType) => {
            const slot = todaySlots.find((s) => s.meal_type === mealType);
            return (
              <div key={mealType} className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0">
                <span className="text-xs font-medium text-foreground/40">{MEAL_TYPE_LABELS[mealType]}</span>
                <span className={`text-sm ${slot?.recipe_name ? "font-medium" : "text-foreground/30"}`}>
                  {slot?.recipe_name ?? "Not planned"}
                </span>
              </div>
            );
          })}
        </div>
        <ChevronRight size={18} className="shrink-0 text-foreground/30" />
      </Link>
    </section>
  );
}
