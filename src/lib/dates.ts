// All dates are treated as plain "YYYY-MM-DD" calendar days in UTC, matching
// how SQLite's date(logged_at) truncates our datetime('now') timestamps.

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function toUTCDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const date = toUTCDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toISO(date);
}

// Sunday-start week containing the given date.
export function startOfWeek(iso: string): string {
  const date = toUTCDate(iso);
  return addDays(iso, -date.getUTCDay());
}

export function weekDates(iso: string): string[] {
  const start = startOfWeek(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatWeekday(iso: string): string {
  return toUTCDate(iso).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

export function formatDayNumber(iso: string): number {
  return toUTCDate(iso).getUTCDate();
}

export function formatLongDate(iso: string): string {
  return toUTCDate(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatShortDate(iso: string): string {
  return toUTCDate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function isSameDay(a: string, b: string): boolean {
  return a === b;
}
