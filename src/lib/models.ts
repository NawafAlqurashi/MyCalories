import { db } from "./db";

export type MealSource = "photo" | "manual";

export interface Meal {
  id: number;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: MealSource;
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

export function listMeals(days = 14): Meal[] {
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
  notes?: string | null;
}): Meal {
  const result = db
    .prepare(
      `INSERT INTO meals (name, grams, calories, protein, carbs, fat, source, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.name,
      input.grams,
      input.calories,
      input.protein,
      input.carbs,
      input.fat,
      input.source,
      input.notes ?? null
    );
  return db
    .prepare(`SELECT * FROM meals WHERE id = ?`)
    .get(result.lastInsertRowid) as unknown as Meal;
}

export function deleteMeal(id: number): void {
  db.prepare(`DELETE FROM meals WHERE id = ?`).run(id);
}

export function todaysMeals(): Meal[] {
  return db
    .prepare(
      `SELECT * FROM meals WHERE date(logged_at) = date('now') ORDER BY logged_at DESC`
    )
    .all() as unknown as Meal[];
}

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
  const result = db
    .prepare(`INSERT INTO exercises (name) VALUES (?)`)
    .run(name);
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
      .prepare(
        `SELECT * FROM workout_logs WHERE exercise_id = ? ORDER BY logged_at ASC`
      )
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
    .run(
      input.exerciseId,
      input.weight,
      input.reps,
      input.sets,
      input.notes ?? null
    );
  return db
    .prepare(`SELECT * FROM workout_logs WHERE id = ?`)
    .get(result.lastInsertRowid) as unknown as WorkoutLog;
}

export function deleteWorkoutLog(id: number): void {
  db.prepare(`DELETE FROM workout_logs WHERE id = ?`).run(id);
}

export function todayTotals() {
  const meals = todaysMeals();
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
