import Link from "next/link";
import Image from "next/image";
import {
  mealsForDate,
  totalsFor,
  groupMealsByType,
  getTargets,
  getProfile,
  loggedDates,
  currentStreak,
  type MealType,
} from "@/lib/models";
import { todayISO, formatShortDate } from "@/lib/dates";
import MacroCards from "@/components/MacroCards";
import WeekStrip from "@/components/WeekStrip";
import MealSourceIcon from "@/components/MealSourceIcon";
import QuickAdd from "@/components/QuickAdd";

export const dynamic = "force-dynamic";

const DEFAULT_TARGETS = { calories: 2000, protein: 130, carbs: 220, fat: 65 };

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const selectedDate = date ?? todayISO();

  const profile = getProfile();
  const targets = getTargets() ?? DEFAULT_TARGETS;
  const meals = mealsForDate(selectedDate);
  const totals = totalsFor(meals);
  const grouped = groupMealsByType(meals);
  const logged = loggedDates();
  const streak = currentStreak();

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={44}
            height={44}
            className="rounded-xl"
          />
          <div>
            <p className="text-lg font-bold leading-tight">MyCalories</p>
            <p className="text-sm text-foreground/50">
              {greeting()}{profile.name ? `, ${profile.name}` : ""} 👋
            </p>
          </div>
        </div>
        {streak > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1.5 text-sm font-semibold text-amber-500">
            ⚡ {streak}
          </span>
        )}
      </header>

      <WeekStrip selected={selectedDate} loggedDates={logged} />

      {!getTargets() && (
        <Link
          href="/settings"
          className="rounded-xl bg-accent-soft px-3.5 py-2.5 text-xs font-medium text-accent"
        >
          Set up your weight & goal in Settings to get personalized targets →
        </Link>
      )}

      <MacroCards totals={totals} targets={targets} />

      <QuickAdd />

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground/60">
            Meals ({meals.length}) {selectedDate !== todayISO() ? `· ${formatShortDate(selectedDate)}` : ""}
          </h2>
          <Link href="/meals" className="text-xs font-medium text-accent">
            View all
          </Link>
        </div>

        {meals.length === 0 && (
          <div className="mt-2 flex flex-col items-center gap-2 rounded-2xl bg-surface-muted p-6 text-center">
            <span className="text-2xl">🍽️</span>
            <p className="text-sm text-foreground/50">
              No meals logged {selectedDate === todayISO() ? "yet today" : "on this day"}.
              <br />
              Tap the <span className="font-semibold text-accent">+</span> button below to add one.
            </p>
          </div>
        )}

        <div className="mt-2 flex flex-col gap-4">
          {(["breakfast", "lunch", "dinner", "snack"] as MealType[])
            .filter((type) => grouped[type].length > 0)
            .map((type) => {
              const groupMeals = grouped[type];
              const groupTotals = totalsFor(groupMeals);
              return (
                <div key={type} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{MEAL_TYPE_LABELS[type]}</h3>
                    <div className="flex gap-1.5 text-[11px] text-foreground/40">
                      <span className="rounded-full bg-surface-muted px-2 py-0.5">
                        {Math.round(groupTotals.calories)}
                      </span>
                      <span className="rounded-full bg-surface-muted px-2 py-0.5">
                        {Math.round(groupTotals.protein)}g
                      </span>
                      <span className="rounded-full bg-surface-muted px-2 py-0.5">
                        {Math.round(groupTotals.carbs)}g
                      </span>
                      <span className="rounded-full bg-surface-muted px-2 py-0.5">
                        {Math.round(groupTotals.fat)}g
                      </span>
                    </div>
                  </div>
                  {groupMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="card-shadow flex items-center gap-3 rounded-2xl bg-surface px-3.5 py-3"
                    >
                      <MealSourceIcon source={meal.source} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{meal.name}</p>
                        <p className="text-xs text-foreground/40">
                          {new Date(meal.logged_at + "Z").toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="mt-1 flex gap-1.5 text-[11px] text-foreground/50">
                          <span>🔥{Math.round(meal.calories)}</span>
                          <span>🍗{Math.round(meal.protein)}g</span>
                          <span>🌾{Math.round(meal.carbs)}g</span>
                          <span>🥑{Math.round(meal.fat)}g</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
}
