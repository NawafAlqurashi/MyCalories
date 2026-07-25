"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Barcode, Loader2, Video, VideoOff } from "lucide-react";

// Minimal shape of the (non-standard, not in TS lib.dom) Shape Detection API.
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (options?: { formats: string[] }) => BarcodeDetectorLike;

interface LookupResult {
  barcode: string;
  name: string;
  brand: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

export default function BarcodeScanner({ initialBarcode }: { initialBarcode?: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraSupported, setCameraSupported] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannerSupported, setScannerSupported] = useState(true);
  const [manualBarcode, setManualBarcode] = useState("");
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [product, setProduct] = useState<LookupResult | null>(null);
  const [grams, setGrams] = useState("100");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialBarcode) {
      performLookup(initialBarcode);
      return;
    }

    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;
    let found = false;
    let detecting = false;

    async function start() {
      const Ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor })
        .BarcodeDetector;
      if (!Ctor) {
        setScannerSupported(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const detector = new Ctor({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"],
        });

        interval = setInterval(async () => {
          if (!videoRef.current || found || detecting) return;
          detecting = true;
          try {
            const results = await detector.detect(videoRef.current);
            if (results.length > 0 && !found) {
              found = true;
              if (interval) clearInterval(interval);
              performLookup(results[0].rawValue);
            }
          } catch {
            // ignore transient detection errors
          } finally {
            detecting = false;
          }
        }, 600);
      } catch {
        setCameraSupported(false);
        setCameraError("Camera access denied — enter the barcode number manually below.");
      }
    }

    start();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function performLookup(barcode: string) {
    if (!barcode.trim() || lookingUp) return;
    setLookingUp(true);
    setLookupError(null);
    try {
      const res = await fetch(`/api/products/lookup?barcode=${encodeURIComponent(barcode.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Lookup failed");
      setProduct(data);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLookingUp(false);
    }
  }

  async function logProduct() {
    if (!product) return;
    const gramsNum = Number(grams);
    if (!gramsNum || gramsNum <= 0) {
      setLookupError("Enter the weight in grams.");
      return;
    }
    setSaving(true);
    try {
      const ratio = gramsNum / 100;
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          grams: gramsNum,
          calories: Math.round(product.caloriesPer100g * ratio),
          protein: Math.round(product.proteinPer100g * ratio * 10) / 10,
          carbs: Math.round(product.carbsPer100g * ratio * 10) / 10,
          fat: Math.round(product.fatPer100g * ratio * 10) / 10,
          source: "barcode",
        }),
      });
      if (!res.ok) throw new Error("Could not save meal");
      router.push("/meals");
      router.refresh();
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "Could not save meal");
    } finally {
      setSaving(false);
    }
  }

  if (product) {
    const ratio = Number(grams || 0) / 100;
    return (
      <div className="flex flex-col gap-4 px-4 pt-6">
        <h1 className="text-2xl font-semibold">Scan barcode</h1>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-lg font-semibold">{product.name}</p>
          {product.brand && <p className="text-sm text-foreground/40">{product.brand}</p>}
          <p className="mt-1 text-xs text-foreground/30">Barcode {product.barcode}</p>

          <label className="mt-4 flex items-center justify-between rounded-xl border border-border px-3.5 py-2.5">
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

          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-base font-bold tabular-nums">
                {Math.round(product.caloriesPer100g * ratio)}
              </p>
              <p className="text-[11px] text-foreground/40">kcal</p>
            </div>
            <div>
              <p className="text-base font-bold tabular-nums text-protein">
                {Math.round(product.proteinPer100g * ratio * 10) / 10}g
              </p>
              <p className="text-[11px] text-foreground/40">protein</p>
            </div>
            <div>
              <p className="text-base font-bold tabular-nums text-carbs">
                {Math.round(product.carbsPer100g * ratio * 10) / 10}g
              </p>
              <p className="text-[11px] text-foreground/40">carbs</p>
            </div>
            <div>
              <p className="text-base font-bold tabular-nums text-fat">
                {Math.round(product.fatPer100g * ratio * 10) / 10}g
              </p>
              <p className="text-[11px] text-foreground/40">fat</p>
            </div>
          </div>
        </div>

        {lookupError && <p className="text-sm text-danger">{lookupError}</p>}

        <button
          onClick={logProduct}
          disabled={saving}
          className="rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Log this meal"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-semibold">Scan barcode</h1>

      {scannerSupported && cameraSupported ? (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-black">
          <video ref={videoRef} muted playsInline className="aspect-square w-full object-cover" />
          {lookingUp && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <Loader2 className="animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-10 text-foreground/40">
          {cameraSupported ? <VideoOff size={28} /> : <Video size={28} />}
          <p className="text-sm">
            {scannerSupported
              ? "Camera unavailable — enter the barcode number instead."
              : "Live barcode scanning isn't supported in this browser — enter the number instead."}
          </p>
        </div>
      )}
      {cameraError && <p className="text-xs text-foreground/40">{cameraError}</p>}

      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5">
        <Barcode size={18} className="text-foreground/40" />
        <input
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
          inputMode="numeric"
          placeholder="Enter barcode number"
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      {lookupError && <p className="text-sm text-danger">{lookupError}</p>}
      <button
        onClick={() => performLookup(manualBarcode)}
        disabled={lookingUp || !manualBarcode.trim()}
        className="rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {lookingUp ? "Looking up…" : "Look up"}
      </button>
    </div>
  );
}
