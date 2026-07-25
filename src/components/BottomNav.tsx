"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, Settings } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/gym", label: "Gym", icon: Dumbbell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.8}
                className={active ? "text-accent" : "text-foreground/40"}
              />
              <span className={active ? "text-accent" : "text-foreground/40"}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
