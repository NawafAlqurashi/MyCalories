import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const globalForDb = globalThis as unknown as { __mycaloriesDb?: DatabaseSync };

function sleepSync(ms: number) {
  const arr = new Int32Array(new SharedArrayBuffer(4));
  Atomics.wait(arr, 0, 0, ms);
}

// Next.js's build-time "collect page data" step imports every route module
// in several parallel worker processes, so the very first open/schema-create
// against the shared SQLite file can race across processes. Retry with
// backoff instead of failing the build on a transient "database is locked".
function openDbWithRetry(dbPath: string): DatabaseSync {
  let lastError: unknown;
  for (let attempt = 0; attempt < 10; attempt++) {
    let db: DatabaseSync | undefined;
    try {
      db = new DatabaseSync(dbPath);
      db.exec(`PRAGMA busy_timeout = 5000;`);
      db.exec(`PRAGMA journal_mode = WAL;`);
      initSchema(db);
      return db;
    } catch (error) {
      lastError = error;
      try {
        db?.close();
      } catch {
        // ignore
      }
      sleepSync(50 * (attempt + 1));
    }
  }
  throw lastError;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      grams REAL NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      source TEXT NOT NULL DEFAULT 'manual',
      meal_type TEXT NOT NULL DEFAULT 'snack',
      notes TEXT,
      logged_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS workout_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
      weight REAL NOT NULL,
      reps INTEGER NOT NULL,
      sets INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      logged_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT,
      sex TEXT NOT NULL DEFAULT 'male',
      weight_kg REAL,
      height_cm REAL,
      age INTEGER,
      activity_level TEXT NOT NULL DEFAULT 'moderate',
      goal TEXT NOT NULL DEFAULT 'maintain',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT UNIQUE,
      name TEXT NOT NULL,
      brand TEXT,
      calories_per_100g REAL NOT NULL,
      protein_per_100g REAL NOT NULL,
      carbs_per_100g REAL NOT NULL,
      fat_per_100g REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS saved_meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      grams REAL NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const cols = db.prepare(`PRAGMA table_info(meals)`).all() as unknown as { name: string }[];
  if (!cols.some((c) => c.name === "meal_type")) {
    db.exec(`ALTER TABLE meals ADD COLUMN meal_type TEXT NOT NULL DEFAULT 'snack';`);
  }
}

function openDb(): DatabaseSync {
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  return openDbWithRetry(path.join(dataDir, "app.db"));
}

export const db = globalForDb.__mycaloriesDb ?? openDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__mycaloriesDb = db;
}
