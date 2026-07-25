import Link from "next/link";
import { formatWeekday, formatDayNumber, weekDates, todayISO } from "@/lib/dates";

export default function WeekStrip({
  selected,
  loggedDates,
}: {
  selected: string;
  loggedDates: Set<string>;
}) {
  const days = weekDates(selected);
  const today = todayISO();

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const isSelected = day === selected;
          const hasLog = loggedDates.has(day);
          const isToday = day === today;
          return (
            <Link
              key={day}
              href={`/?date=${day}`}
              className="flex flex-col items-center gap-1.5"
            >
              <span className={`text-xs ${isSelected ? "font-semibold text-accent" : "text-foreground/40"}`}>
                {formatWeekday(day)}
              </span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-transform ${
                  isSelected
                    ? "card-shadow scale-105 bg-gradient-to-br from-[var(--ring-from)] to-[var(--ring-to)] text-white"
                    : hasLog
                      ? "border-2 border-accent/40 text-foreground"
                      : "text-foreground/50"
                } ${isToday && !isSelected ? "ring-1 ring-accent/40" : ""}`}
              >
                {formatDayNumber(day)}
              </span>
            </Link>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-foreground/40">This week</p>
    </div>
  );
}
