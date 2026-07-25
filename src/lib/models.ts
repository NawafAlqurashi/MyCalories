import { db } from "./db";
import { calculateTargets, type ActivityLevel, type Goal, type Sex, type Targets } from "./targets";

export type MealSource = "photo" | "manual" | "voice" | "barcode";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Meal {
  id: number;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: MealSource;
  meal_type: MealType;
  notes: string | null;
  logged_at: string;
}

export interface Exercise {
  id: number;
  name: string;
  created_at: string;
}

export interface WorkoutLog {
  id: number;
  exercise_id: number;
  weight: number;
  reps: number;
  sets: number;
  notes: string | null;
  logged_at: string;
}

export type PlanCategory = "gym" | "sport" | "cardio" | "rest";

export interface DayPlan {
  day_of_week: number;
  label: string;
  category: PlanCategory;
}

export interface Profile {
  id: number;
  name: string | null;
  sex: Sex;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  activity_level: ActivityLevel;
  goal: Goal;
  updated_at: string;
}

export interface Product {
  id: number;
  barcode: string | null;
  name: string;
  brand: string | null;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  created_at: string;
}

export interface SavedMeal {
  id: number;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
}

// ---- Meals ----

export function listMeals(days = 30): Meal[] {
  return db
    .prepare(
      `SELECT * FROM meals WHERE logged_at >= datetime('now', ?) ORDER BY logged_at DESC`
    )
    .all(`-${days} days`) as unknown as Meal[];
}

export function createMeal(input: {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: MealSource;
  mealType?: MealType;
  notes?: string | null;
}): Meal {
  const result = db
    .prepare(
      `INSERT INTO meals (name, grams, calories, protein, carbs, fat, source, meal_type, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.name,
      input.grams,
      input.calories,
      input.protein,
      input.carbs,
      input.fat,
      input.source,
      input.mealType ?? inferMealType(),
      input.notes ?? null
    );
  return db
    .prepare(`SELECT * FROM meals WHERE id = ?`)
    .get(result.lastInsertRowid) as unknown as Meal;
}

export function inferMealType(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 16) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

export function deleteMeal(id: number): void {
  db.prepare(`DELETE FROM meals WHERE id = ?`).run(id);
}

export function mealsForDate(date: string): Meal[] {
  return db
    .prepare(`SELECT * FROM meals WHERE date(logged_at) = date(?) ORDER BY logged_at ASC`)
    .all(date) as unknown as Meal[];
}

export function totalsFor(meals: Meal[]) {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function loggedDates(days = 60): Set<string> {
  const rows = db
    .prepare(
      `SELECT DISTINCT date(logged_at) as d FROM meals WHERE logged_at >= datetime('now', ?)`
    )
    .all(`-${days} days`) as unknown as { d: string }[];
  return new Set(rows.map((r) => r.d));
}

export function currentStreak(): number {
  const dates = loggedDates();
  const today = new Date().toISOString().slice(0, 10);
  let cursor = dates.has(today)
    ? today
    : new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = new Date(new Date(cursor).getTime() - 86400000).toISOString().slice(0, 10);
  }
  return streak;
}

export function groupMealsByType(meals: Meal[]): Record<MealType, Meal[]> {
  const groups: Record<MealType, Meal[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  for (const meal of meals) {
    groups[meal.meal_type].push(meal);
  }
  return groups;
}

// ---- Exercises & workouts ----

export function listExercises(): Exercise[] {
  return db
    .prepare(`SELECT * FROM exercises ORDER BY name ASC`)
    .all() as unknown as Exercise[];
}

export function getOrCreateExercise(name: string): Exercise {
  const existing = db
    .prepare(`SELECT * FROM exercises WHERE name = ?`)
    .get(name) as unknown as Exercise | undefined;
  if (existing) return existing;
  const result = db.prepare(`INSERT INTO exercises (name) VALUES (?)`).run(name);
  return db
    .prepare(`SELECT * FROM exercises WHERE id = ?`)
    .get(result.lastInsertRowid) as unknown as Exercise;
}

export function getExercise(id: number): Exercise | undefined {
  return db
    .prepare(`SELECT * FROM exercises WHERE id = ?`)
    .get(id) as unknown as Exercise | undefined;
}

export function deleteExercise(id: number): void {
  db.prepare(`DELETE FROM exercises WHERE id = ?`).run(id);
}

export function listWorkoutLogs(exerciseId?: number): WorkoutLog[] {
  if (exerciseId) {
    return db
      .prepare(`SELECT * FROM workout_logs WHERE exercise_id = ? ORDER BY logged_at ASC`)
      .all(exerciseId) as unknown as WorkoutLog[];
  }
  return db
    .prepare(`SELECT * FROM workout_logs ORDER BY logged_at DESC LIMIT 20`)
    .all() as unknown as WorkoutLog[];
}

export function createWorkoutLog(input: {
  exerciseId: number;
  weight: number;
  reps: number;
  sets: number;
  notes?: string | null;
}): WorkoutLog {
  const result = db
    .prepare(
      `INSERT INTO workout_logs (exercise_id, weight, reps, sets, notes)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(input.exerciseId, input.weight, input.reps, input.sets, input.notes ?? null);
  return db
    .prepare(`SELECT * FROM workout_logs WHERE id = ?`)
    .get(result.lastInsertRowid) as unknown as WorkoutLog;
}

export function deleteWorkoutLog(id: number): void {
  db.prepare(`DELETE FROM workout_logs WHERE id = ?`).run(id);
}

// ---- Weekly plan (recurring schedule: e.g. Wed = Upper, Thu = Padel, Fri = Rest) ----

export function getWeeklyPlan(): DayPlan[] {
  return db
    .prepare(`SELECT * FROM weekly_plan ORDER BY day_of_week ASC`)
    .all() as unknown as DayPlan[];
}

export function setWeeklyPlan(days: { dayOfWeek: number; label: string; category: PlanCategory }[]): void {
  const stmt = db.prepare(
    `UPDATE weekly_plan SET label = ?, category = ? WHERE day_of_week = ?`
  );
  for (const d of days) stmt.run(d.label.trim(), d.category, d.dayOfWeek);
}

// ---- Profile & targets ----

const DEFAULT_PROFILE: Profile = {
  id: 1,
  name: null,
  sex: "male",
  weight_kg: null,
  height_cm: null,
  age: null,
  activity_level: "moderate",
  goal: "maintain",
  updated_at: new Date().toISOString(),
};

export function getProfile(): Profile {
  const row = db.prepare(`SELECT * FROM profile WHERE id = 1`).get() as unknown as
    | Profile
    | undefined;
  return row ?? DEFAULT_PROFILE;
}

export function upsertProfile(input: {
  name: string | null;
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}): Profile {
  db.prepare(
    `INSERT INTO profile (id, name, sex, weight_kg, height_cm, age, activity_level, goal, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       sex = excluded.sex,
       weight_kg = excluded.weight_kg,
       height_cm = excluded.height_cm,
       age = excluded.age,
       activity_level = excluded.activity_level,
       goal = excluded.goal,
       updated_at = datetime('now')`
  ).run(
    input.name,
    input.sex,
    input.weightKg,
    input.heightCm,
    input.age,
    input.activityLevel,
    input.goal
  );
  return getProfile();
}

export function getTargets(): Targets | null {
  const profile = getProfile();
  if (!profile.weight_kg || !profile.height_cm || !profile.age) return null;
  return calculateTargets({
    sex: profile.sex,
    weightKg: profile.weight_kg,
    heightCm: profile.height_cm,
    age: profile.age,
    activityLevel: profile.activity_level,
    goal: profile.goal,
  });
}

// ---- Products (barcode-scanned foods) ----

export function findProductByBarcode(barcode: string): Product | undefined {
  return db
    .prepare(`SELECT * FROM products WHERE barcode = ?`)
    .get(barcode) as unknown as Product | undefined;
}

export function getProduct(id: number): Product | undefined {
  return db.prepare(`SELECT * FROM products WHERE id = ?`).get(id) as unknown as Product | undefined;
}

export function listProducts(): Product[] {
  return db
    .prepare(`SELECT * FROM products ORDER BY created_at DESC`)
    .all() as unknown as Product[];
}

export function upsertProduct(input: {
  barcode?: string | null;
  name: string;
  brand?: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}): Product {
  if (input.barcode) {
    const existing = findProductByBarcode(input.barcode);
    if (existing) return existing;
  }
  const result = db
    .prepare(
      `INSERT INTO products (barcode, name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.barcode ?? null,
      input.name,
      input.brand ?? null,
      input.caloriesPer100g,
      input.proteinPer100g,
      input.carbsPer100g,
      input.fatPer100g
    );
  return db
    .prepare(`SELECT * FROM products WHERE id = ?`)
    .get(result.lastInsertRowid) as unknown as Product;
}

export function deleteProduct(id: number): void {
  db.prepare(`DELETE FROM products WHERE id = ?`).run(id);
}

// ---- Saved meal templates ----

export function listSavedMeals(): SavedMeal[] {
  return db
    .prepare(`SELECT * FROM saved_meals ORDER BY created_at DESC`)
    .all() as unknown as SavedMeal[];
}

export function createSavedMeal(input: {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}): SavedMeal {
  const result = db
    .prepare(
      `INSERT INTO saved_meals (name, grams, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(input.name, input.grams, input.calories, input.protein, input.carbs, input.fat);
  return db
    .prepare(`SELECT * FROM saved_meals WHERE id = ?`)
    .get(result.lastInsertRowid) as unknown as SavedMeal;
}

export function getSavedMeal(id: number): SavedMeal | undefined {
  return db
    .prepare(`SELECT * FROM saved_meals WHERE id = ?`)
    .get(id) as unknown as SavedMeal | undefined;
}

export function deleteSavedMeal(id: number): void {
  db.prepare(`DELETE FROM saved_meals WHERE id = ?`).run(id);
}
