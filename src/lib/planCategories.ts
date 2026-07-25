import type { PlanCategory } from "./models";

export const PLAN_CATEGORIES: { value: PlanCategory; label: string; emoji: string }[] = [
  { value: "gym", label: "Gym", emoji: "💪" },
  { value: "sport", label: "Sport", emoji: "🎾" },
  { value: "cardio", label: "Cardio", emoji: "🏃" },
  { value: "rest", label: "Rest", emoji: "😴" },
];

export const PLAN_CATEGORY_EMOJI: Record<PlanCategory, string> = {
  gym: "💪",
  sport: "🎾",
  cardio: "🏃",
  rest: "😴",
};

export const PLAN_CATEGORY_STYLE: Record<PlanCategory, string> = {
  gym: "bg-gradient-to-br from-[var(--ring-from)] to-[var(--ring-to)] text-white",
  sport: "bg-carbs text-white",
  cardio: "bg-protein text-white",
  rest: "bg-surface-muted text-foreground/40",
};

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
