"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, Settings, Plus } from "lucide-react";
import LogMealSheet from "./LogMealSheet";

const sideItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/gym", label: "Gym", icon: Dumbbell },
];

const rightItems = [{ href: "/settings", label: "Settings", icon: Settings }];

export default function BottomNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <nav className="sticky bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {sideItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium"
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 1.8} className={active ? "text-accent" : "text-foreground/40"} />
                <span className={active ? "text-accent" : "text-foreground/40"}>{label}</span>
              </Link>
            );
          })}

          <div className="flex flex-1 flex-col items-center justify-center">
            <button
              onClick={() => setSheetOpen(true)}
              aria-label="Log a new meal"
              className="card-shadow-lg -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ring-from)] to-[var(--ring-to)] text-white active:scale-95 transition-transform"
            >
              <Plus size={26} />
            </button>
          </div>

          {rightItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium"
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 1.8} className={active ? "text-accent" : "text-foreground/40"} />
                <span className={active ? "text-accent" : "text-foreground/40"}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <LogMealSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
