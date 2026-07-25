"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Mic, MessageSquare, Pencil, PencilLine, Square } from "lucide-react";

type Mode = "photo" | "voice" | "text" | "manual";

// Minimal shape of the (non-standard, not in TS lib.dom) Web Speech API.
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: { results: { [i: number]: { [i: number]: { transcript: string } } } }) => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface Estimate {
  foodName: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mock: boolean;
}

const MODE_TABS: { key: Mode; label: string; icon: typeof Camera }[] = [
  { key: "photo", label: "Photo", icon: Camera },
  { key: "voice", label: "Voice", icon: Mic },
  { key: "text", label: "Text", icon: MessageSquare },
  { key: "manual", label: "Manual", icon: PencilLine },
];

export default function MealForm({ initialMode = "photo" }: { initialMode?: Mode }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>(initialMode);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [grams, setGrams] = useState("300");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [listening, setListening] = useState(false);

  function switchMode(m: Mode) {
    setMode(m);
    setEstimate(null);
    setError(null);
  }

  function handleFile(file: File | null) {
    setImageFile(file);
    setEstimate(null);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function startListening() {
    const SpeechRecognitionImpl: SpeechRecognitionCtor | undefined =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;

    if (!SpeechRecognitionImpl) {
      setError("Voice input isn't supported in this browser — try typing instead.");
      return;
    }

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setError("Couldn't hear that. Try again or type it in.");
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  }

  async function analyze() {
    setError(null);
    const gramsNum = Number(grams);
    if (!gramsNum || gramsNum <= 0) {
      setError("Enter the meal's weight in grams.");
      return;
    }
    if (!imageFile && !description.trim()) {
      setError(
        mode === "photo" ? "Add a photo or describe the meal." : "Describe the meal first."
      );
      return;
    }

    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.set("grams", String(gramsNum));
      if (description.trim()) formData.set("description", description.trim());
      if (mode === "photo" && imageFile) formData.set("image", imageFile);

      const res = await fetch("/api/analyze-meal", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setEstimate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  async function saveMeal(source: "photo" | "manual" | "voice" | "text") {
    if (!estimate) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: estimate.foodName,
        grams: estimate.grams,
        calories: estimate.calories,
        protein: estimate.protein,
        carbs: estimate.carbs,
        fat: estimate.fat,
      };
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, source: source === "text" ? "manual" : source }),
      });
      if (!res.ok) throw new Error("Could not save meal");

      if (saveAsTemplate) {
        await fetch("/api/saved-meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      router.push("/meals");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save meal");
    } finally {
      setSaving(false);
    }
  }

  function updateEstimateField(field: keyof Estimate, value: string) {
    if (!estimate) return;
    setEstimate({ ...estimate, [field]: field === "foodName" ? value : Number(value) });
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <h1 className="text-2xl font-semibold">Log a meal</h1>

      <div className="grid grid-cols-4 gap-1 rounded-xl bg-surface-muted p-1">
        {MODE_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
              mode === key ? "bg-surface shadow-sm" : "text-foreground/40"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {!estimate && mode === "photo" && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-10 text-foreground/50"
          >
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Selected meal" className="max-h-48 rounded-xl object-contain" />
            ) : (
              <>
                <Camera size={28} />
                <span className="text-sm font-medium">Take or choose a photo</span>
                <span className="text-xs text-foreground/30">Meal photo or nutrition label</span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional: describe the meal (e.g. grilled chicken breast, white rice, olive oil)"
            rows={2}
            className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm placeholder:text-foreground/30"
          />
          <GramsField grams={grams} setGrams={setGrams} />
          {error && <p className="text-sm text-danger">{error}</p>}
          <AnalyzeButton onClick={analyze} analyzing={analyzing} />
        </div>
      )}

      {!estimate && mode === "voice" && (
        <div className="flex flex-col gap-4">
          <button
            onClick={startListening}
            className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-10 ${
              listening ? "border-accent text-accent" : "border-border text-foreground/50"
            }`}
          >
            {listening ? <Square size={28} /> : <Mic size={28} />}
            <span className="text-sm font-medium">
              {listening ? "Listening… tap to stop" : "Tap to speak"}
            </span>
            <span className="text-xs text-foreground/30">Describe what you ate</span>
          </button>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Your transcribed meal will appear here — edit as needed"
            rows={3}
            className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm placeholder:text-foreground/30"
          />
          <GramsField grams={grams} setGrams={setGrams} />
          {error && <p className="text-sm text-danger">{error}</p>}
          <AnalyzeButton onClick={analyze} analyzing={analyzing} />
        </div>
      )}

      {!estimate && mode === "text" && (
        <div className="flex flex-col gap-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your meal, e.g. 2 scrambled eggs with avocado toast"
            rows={4}
            autoFocus
            className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm placeholder:text-foreground/30"
          />
          <GramsField grams={grams} setGrams={setGrams} />
          {error && <p className="text-sm text-danger">{error}</p>}
          <AnalyzeButton onClick={analyze} analyzing={analyzing} />
        </div>
      )}

      {!estimate && mode === "manual" && (
        <ManualEntry grams={grams} setGrams={setGrams} onSubmit={(values) => setEstimate({ ...values, mock: false })} />
      )}

      {estimate && (
        <div className="flex flex-col gap-4">
          {estimate.mock && (
            <p className="rounded-xl bg-accent-soft px-3.5 py-2.5 text-xs text-accent">
              Demo estimate — add an ANTHROPIC_API_KEY to get real analysis. Values below are editable.
            </p>
          )}

          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <input
                value={estimate.foodName}
                onChange={(e) => updateEstimateField("foodName", e.target.value)}
                className="flex-1 bg-transparent text-lg font-semibold outline-none"
              />
              <Pencil size={14} className="text-foreground/30" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Grams" value={estimate.grams} onChange={(v) => updateEstimateField("grams", v)} />
              <Field label="Calories" value={estimate.calories} onChange={(v) => updateEstimateField("calories", v)} />
              <Field label="Protein (g)" value={estimate.protein} onChange={(v) => updateEstimateField("protein", v)} />
              <Field label="Carbs (g)" value={estimate.carbs} onChange={(v) => updateEstimateField("carbs", v)} />
              <Field label="Fat (g)" value={estimate.fat} onChange={(v) => updateEstimateField("fat", v)} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground/60">
            <input
              type="checkbox"
              checked={saveAsTemplate}
              onChange={(e) => setSaveAsTemplate(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Save as a reusable meal template
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => setEstimate(null)}
              className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-foreground/60"
            >
              Back
            </button>
            <button
              onClick={() => saveMeal(mode)}
              disabled={saving}
              className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save meal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyzeButton({ onClick, analyzing }: { onClick: () => void; analyzing: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={analyzing}
      className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
    >
      {analyzing ? <Loader2 size={16} className="animate-spin" /> : null}
      {analyzing ? "Analyzing…" : "Analyze"}
    </button>
  );
}

function GramsField({ grams, setGrams }: { grams: string; setGrams: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-2.5">
      <span className="text-sm font-medium text-foreground/60">Weight</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          inputMode="decimal"
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
          className="w-20 bg-transparent text-right text-sm font-semibold outline-none"
        />
        <span className="text-sm text-foreground/40">g</span>
      </div>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-foreground/40">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg bg-surface-muted px-2.5 py-2 text-sm font-semibold outline-none"
      />
    </label>
  );
}

function ManualEntry({
  grams,
  setGrams,
  onSubmit,
}: {
  grams: string;
  setGrams: (v: string) => void;
  onSubmit: (values: {
    foodName: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <TextInput label="Meal name" value={name} onChange={setName} placeholder="e.g. Chicken & rice bowl" />
      <div className="grid grid-cols-2 gap-3">
        <TextInput label="Grams" value={grams} onChange={setGrams} type="number" />
        <TextInput label="Calories" value={calories} onChange={setCalories} type="number" />
        <TextInput label="Protein (g)" value={protein} onChange={setProtein} type="number" />
        <TextInput label="Carbs (g)" value={carbs} onChange={setCarbs} type="number" />
        <TextInput label="Fat (g)" value={fat} onChange={setFat} type="number" />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        onClick={() => {
          if (!name.trim() || !grams || !calories) {
            setError("Meal name, grams, and calories are required.");
            return;
          }
          onSubmit({
            foodName: name.trim(),
            grams: Number(grams),
            calories: Number(calories),
            protein: Number(protein || 0),
            carbs: Number(carbs || 0),
            fat: Number(fat || 0),
          });
        }}
        className="rounded-xl bg-accent py-3 text-sm font-semibold text-white"
      >
        Review & save
      </button>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-foreground/40">{label}</span>
      <input
        type={type}
        inputMode={type === "number" ? "decimal" : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-foreground/30"
      />
    </label>
  );
}
