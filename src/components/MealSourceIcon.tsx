import { Camera, Mic, MessageSquare, Barcode } from "lucide-react";
import type { MealSource } from "@/lib/models";

const STYLES: Record<MealSource, { icon: typeof Camera; bg: string }> = {
  photo: { icon: Camera, bg: "bg-orange-500" },
  voice: { icon: Mic, bg: "bg-pink-500" },
  manual: { icon: MessageSquare, bg: "bg-teal-600" },
  barcode: { icon: Barcode, bg: "bg-indigo-500" },
};

export default function MealSourceIcon({ source }: { source: MealSource }) {
  const { icon: Icon, bg } = STYLES[source] ?? STYLES.manual;
  return (
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg} text-white`}>
      <Icon size={18} />
    </span>
  );
}
