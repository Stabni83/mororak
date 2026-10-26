/**
 * Small shared frontend helpers.
 *
 * This file was missing for the same reason lib/api.ts was: the old
 * .gitignore's generic `lib/` rule was also matching client/src/lib/ and
 * excluding the whole folder from git. Now that .gitignore is fixed, keep
 * this file tracked.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names safely (later classes win over earlier ones). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

interface SubjectColor {
  bg: string;
  text: string;
}

// A small rotating palette. Subjects are admin-managed (see backend/models/catalog.py)
// so we can't hardcode one color per subject - instead we deterministically
// pick a color from this palette based on the subject's slug, so the same
// subject always gets the same color across the whole app.
const SUBJECT_COLOR_PALETTE: SubjectColor[] = [
  { bg: "bg-blue-500/10", text: "text-blue-600" },
  { bg: "bg-purple-500/10", text: "text-purple-600" },
  { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  { bg: "bg-amber-500/10", text: "text-amber-600" },
  { bg: "bg-rose-500/10", text: "text-rose-600" },
  { bg: "bg-cyan-500/10", text: "text-cyan-600" },
  { bg: "bg-indigo-500/10", text: "text-indigo-600" },
  { bg: "bg-orange-500/10", text: "text-orange-600" },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // keep it a 32-bit int
  }
  return Math.abs(hash);
}

/** Deterministic bg/text Tailwind classes for a subject slug, used on badges and dots. */
export function getSubjectColor(subject?: string | null): SubjectColor {
  if (!subject) return SUBJECT_COLOR_PALETTE[0];
  const index = hashString(subject) % SUBJECT_COLOR_PALETTE.length;
  return SUBJECT_COLOR_PALETTE[index];
}

// Same order as SUBJECT_COLOR_PALETTE above, as hex values for charts (Recharts can't use Tailwind classes).
const SUBJECT_HEX_PALETTE = ["#2563eb", "#9333ea", "#059669", "#d97706", "#e11d48", "#0891b2", "#4f46e5", "#ea580c"];

/** Chart color for a subject slug; matches the badge color from getSubjectColor. */
export function getSubjectHex(subject?: string | null): string {
  if (!subject || subject === "none") return "#94a3b8";
  return SUBJECT_HEX_PALETTE[hashString(subject) % SUBJECT_HEX_PALETTE.length];
}
