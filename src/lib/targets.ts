export type Sex = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type Goal = "lose" | "maintain" | "gain";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (little/no exercise)",
  light: "Light (1-3 days/week)",
  moderate: "Moderate (3-5 days/week)",
  active: "Active (6-7 days/week)",
  very_active: "Very active (hard exercise daily)",
};

export const GOAL_LABELS: Record<Goal, string> = {
  lose: "Lose weight",
  maintain: "Maintain weight",
  gain: "Gain weight",
};

export interface Targets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function calculateTargets(profile: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}): Targets {
  const { sex, weightKg, heightCm, age, activityLevel, goal } = profile;

  // Mifflin-St Jeor
  const bmr =
    sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];

  const goalAdjustment = goal === "lose" ? -500 : goal === "gain" ? 300 : 0;
  const calories = Math.max(1200, Math.round(tdee + goalAdjustment));

  const protein = Math.round(weightKg * 1.8);
  const fat = Math.round((calories * 0.25) / 9);
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const carbs = Math.max(0, Math.round((calories - proteinCalories - fatCalories) / 4));

  return { calories, protein, carbs, fat };
}
