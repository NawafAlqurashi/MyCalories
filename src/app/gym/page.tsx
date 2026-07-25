import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { listExercises, listWorkoutLogs } from "@/lib/models";

export const dynamic = "force-dynamic";

export default function GymPage() {
  const exercises = listExercises();
  const allLogs = listWorkoutLogs();

  const lastLogFor = (exerciseId: number) =>
    [...allLogs]
      .filter((l) => l.exercise_id === exerciseId)
      .sort((a, b) => (a.logged_at < b.logged_at ? 1 : -1))[0];

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gym</h1>
        <Link
          href="/gym/exercises/new"
          className="flex items-center gap-1 rounded-full bg-accent px-3.5 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> Exercise
        </Link>
      </header>

      {exercises.length === 0 && (
        <p className="rounded-2xl bg-surface-muted p-4 text-sm text-foreground/40">
          No exercises yet. Add one to start tracking your lifts.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {exercises.map((exercise) => {
          const last = lastLogFor(exercise.id);
          return (
            <Link
              key={exercise.id}
              href={`/gym/${exercise.id}`}
              className="card-shadow flex items-center justify-between rounded-2xl bg-surface px-4 py-3.5"
            >
              <div>
                <p className="text-sm font-medium">{exercise.name}</p>
                <p className="text-xs text-foreground/40">
                  {last ? `Last: ${last.weight}kg × ${last.reps} × ${last.sets}` : "No logs yet"}
                </p>
              </div>
              <ChevronRight size={18} className="text-foreground/30" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
