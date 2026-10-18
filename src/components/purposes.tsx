import { Briefcase, Clapperboard, Code2, Gamepad2, Home, Palette, type LucideIcon } from "lucide-react";
import type { Purpose } from "@/lib/types";

/** Icons and default budgets (LKR). Titles and descriptions live in the i18n dictionaries. */
export const purposeCards: { id: Purpose; Icon: LucideIcon; budget: number }[] = [
  { id: "personal", Icon: Home, budget: 210000 },
  { id: "office", Icon: Briefcase, budget: 180000 },
  { id: "graphic-design", Icon: Palette, budget: 450000 },
  { id: "gaming", Icon: Gamepad2, budget: 420000 },
  { id: "video-editing", Icon: Clapperboard, budget: 570000 },
  { id: "programming", Icon: Code2, budget: 330000 },
];
