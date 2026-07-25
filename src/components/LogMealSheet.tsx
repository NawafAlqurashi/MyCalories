"use client";

import Link from "next/link";
import {
  X,
  Camera,
  Mic,
  MessageSquare,
  Barcode,
  ShoppingCart,
  UtensilsCrossed,
  ClipboardList,
  CalendarDays,
  Pencil,
} from "lucide-react";

const quickActions = [
  { href: "/meals/new?mode=photo", label: "Photo", sub: "Snap a meal", icon: Camera, bg: "bg-orange-500" },
  { href: "/meals/new?mode=voice", label: "Voice", sub: "Describe it", icon: Mic, bg: "bg-pink-600" },
  { href: "/meals/new?mode=text", label: "Text", sub: "Type it in", icon: MessageSquare, bg: "bg-teal-600" },
];

const collection = [
  { href: "/products", label: "Products", sub: "Your collection", icon: ShoppingCart, bg: "bg-blue-600" },
  { href: "/meals/saved", label: "Meals", sub: "Saved meals", icon: UtensilsCrossed, bg: "bg-orange-500" },
  { href: "/meals/plan", label: "Plan", sub: "Weekly meals", icon: CalendarDays, bg: "bg-emerald-600" },
  { href: "/meals", label: "History", sub: "Past meals", icon: ClipboardList, bg: "bg-violet-600" },
];

export default function LogMealSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-black/50"
      />
      <div className="animate-sheet-up card-shadow-lg relative z-10 w-full max-w-md rounded-t-3xl bg-surface p-5 pb-8">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Log a new meal</h2>
          <button onClick={onClose} aria-label="Close" className="text-foreground/40">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              onClick={onClose}
              className="card-shadow flex flex-col items-center gap-2 rounded-2xl bg-surface px-2 py-4 text-center active:scale-95 transition-transform"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.bg} text-white`}>
                <a.icon size={20} />
              </span>
              <span className="text-sm font-semibold">{a.label}</span>
              <span className="text-xs text-foreground/40">{a.sub}</span>
            </Link>
          ))}
        </div>

        <Link
          href="/meals/scan"
          onClick={onClose}
          className="card-shadow mt-3 flex items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 active:scale-[0.98] transition-transform"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Barcode size={20} />
          </span>
          <div>
            <p className="text-sm font-semibold">Scan barcode</p>
            <p className="text-xs text-foreground/40">Log packaged foods in seconds</p>
          </div>
        </Link>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-foreground/40">
          From your collection
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {collection.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              onClick={onClose}
              className="card-shadow flex flex-col items-center gap-2 rounded-2xl bg-surface px-2 py-4 text-center active:scale-95 transition-transform"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.bg} text-white`}>
                <a.icon size={20} />
              </span>
              <span className="text-sm font-semibold">{a.label}</span>
              <span className="text-xs text-foreground/40">{a.sub}</span>
            </Link>
          ))}
        </div>

        <Link
          href="/meals/new?mode=manual"
          onClick={onClose}
          className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-accent"
        >
          Know the nutrition? Enter it manually <Pencil size={14} />
        </Link>
      </div>
    </div>
  );
}
