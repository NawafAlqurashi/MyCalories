import { addExercise } from "../../actions";

export default function NewExercisePage() {
  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <h1 className="text-2xl font-semibold">New exercise</h1>
      <form action={addExercise} className="flex flex-col gap-3">
        <input
          name="name"
          placeholder="e.g. Bench press"
          autoFocus
          className="rounded-xl border border-border bg-surface px-3.5 py-3 text-sm outline-none placeholder:text-foreground/30"
        />
        <button
          type="submit"
          className="rounded-xl bg-accent py-3 text-sm font-semibold text-white"
        >
          Add exercise
        </button>
      </form>
    </div>
  );
}
