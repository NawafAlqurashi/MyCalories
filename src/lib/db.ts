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
  `);
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
