import { getProfile, getTargets } from "@/lib/models";
import { ACTIVITY_LABELS, GOAL_LABELS } from "@/lib/targets";
import { saveProfile } from "./actions";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const profile = getProfile();
  const targets = getTargets();

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {targets && (
        <section className="card-shadow rounded-2xl bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/40">
            Your daily targets
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-lg font-bold tabular-nums">{targets.calories}</p>
              <p className="text-[11px] text-foreground/40">kcal</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums text-protein">{targets.protein}g</p>
              <p className="text-[11px] text-foreground/40">protein</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums text-carbs">{targets.carbs}g</p>
              <p className="text-[11px] text-foreground/40">carbs</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums text-fat">{targets.fat}g</p>
              <p className="text-[11px] text-foreground/40">fat</p>
            </div>
          </div>
        </section>
      )}

      <form action={saveProfile} className="flex flex-col gap-4">
        <TextField name="name" label="Your name" defaultValue={profile.name ?? ""} />

        <div>
          <span className="text-xs font-medium text-foreground/40">Sex</span>
          <div className="mt-1.5 flex rounded-xl bg-surface-muted p-1">
            {(["male", "female"] as const).map((s) => (
              <label
                key={s}
                className="flex-1 has-[:checked]:bg-surface has-[:checked]:shadow-sm rounded-lg py-2 text-center text-sm font-semibold capitalize"
              >
                <input
                  type="radio"
                  name="sex"
                  value={s}
                  defaultChecked={profile.sex === s}
                  className="hidden"
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <TextField
            name="weightKg"
            label="Weight (kg)"
            type="number"
            step="0.1"
            defaultValue={profile.weight_kg ?? ""}
          />
          <TextField
            name="heightCm"
            label="Height (cm)"
            type="number"
            defaultValue={profile.height_cm ?? ""}
          />
          <TextField name="age" label="Age" type="number" defaultValue={profile.age ?? ""} />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground/40">Activity level</span>
          <select
            name="activityLevel"
            defaultValue={profile.activity_level}
            className="rounded-xl border border-border bg-surface px-3.5 py-3 text-sm outline-none"
          >
            {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground/40">Goal</span>
          <select
            name="goal"
            defaultValue={profile.goal}
            className="rounded-xl border border-border bg-surface px-3.5 py-3 text-sm outline-none"
          >
            {Object.entries(GOAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="rounded-xl bg-accent py-3 text-sm font-semibold text-white">
          Save & recalculate targets
        </button>
      </form>
    </div>
  );
}

function TextField({
  name,
  label,
  defaultValue,
  type = "text",
  step,
}: {
  name: string;
  label: string;
  defaultValue: string | number;
  type?: string;
  step?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-foreground/40">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        inputMode={type === "number" ? "decimal" : undefined}
        defaultValue={defaultValue}
        required
        className="rounded-xl border border-border bg-surface px-3.5 py-3 text-sm outline-none"
      />
    </label>
  );
}
