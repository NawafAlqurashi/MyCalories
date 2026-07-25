"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  X,
  Camera,
  Mic,
  MessageSquare,
  Barcode,
  ShoppingCart,
  UtensilsCrossed,
  ClipboardList,
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
  { href: "/meals", label: "History", sub: "Past meals", icon: ClipboardList, bg: "bg-violet-600" },
];

export default function LogMealSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center">
        <div className="flex w-full max-w-md justify-end px-4">
          <button
            onClick={() => setOpen(true)}
            aria-label="Log a new meal"
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg"
          >
            <Plus size={26} />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-surface p-5 pb-8">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Log a new meal</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-foreground/40">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {quickActions.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface px-2 py-4 text-center"
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
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5"
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
            <div className="mt-2 grid grid-cols-3 gap-3">
              {collection.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface px-2 py-4 text-center"
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
              onClick={() => setOpen(false)}
              className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-accent"
            >
              Know the nutrition? Enter it manually <Pencil size={14} />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
