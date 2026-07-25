import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { getExercise, listWorkoutLogs } from "@/lib/models";
import ProgressChart from "@/components/ProgressChart";
import { logSet, removeWorkoutLog } from "../actions";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;
  const id = Number(exerciseId);
  const exercise = getExercise(id);
  if (!exercise) notFound();

  const logs = listWorkoutLogs(id);
  const chartData = logs.map((log) => ({
    date: new Date(log.logged_at + "Z").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    weight: log.weight,
  }));

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <h1 className="text-2xl font-semibold">{exercise.name}</h1>

      <ProgressChart data={chartData} />

      <form action={logSet} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        <input type="hidden" name="exerciseId" value={exercise.id} />
        <p className="text-sm font-semibold text-foreground/60">Log a set</p>
        <div className="grid grid-cols-3 gap-3">
          <NumberField name="weight" label="Weight (kg)" step="0.5" />
          <NumberField name="reps" label="Reps" defaultValue={8} />
          <NumberField name="sets" label="Sets" defaultValue={1} />
        </div>
        <button type="submit" className="rounded-xl bg-accent py-2.5 text-sm font-semibold text-white">
          Save set
        </button>
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/40">
          History
        </h2>
        {logs.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-foreground/40">
            No sets logged yet.
          </p>
        )}
        {[...logs].reverse().map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between rounded-xl bg-surface border border-border px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">
                {log.weight} kg × {log.reps} reps × {log.sets} sets
              </p>
              <p className="text-xs text-foreground/40">
                {new Date(log.logged_at + "Z").toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <form
              action={async () => {
                "use server";
                await removeWorkoutLog(log.id, exercise.id);
              }}
            >
              <button type="submit" className="text-foreground/30 hover:text-danger" aria-label="Delete set">
                <Trash2 size={16} />
              </button>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}

function NumberField({
  name,
  label,
  defaultValue,
  step,
}: {
  name: string;
  label: string;
  defaultValue?: number;
  step?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-foreground/40">{label}</span>
      <input
        name={name}
        type="number"
        step={step}
        inputMode="decimal"
        defaultValue={defaultValue}
        required
        className="rounded-lg bg-surface-muted px-2.5 py-2 text-sm font-semibold outline-none"
      />
    </label>
  );
}
