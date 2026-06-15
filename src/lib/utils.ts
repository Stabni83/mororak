import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ═══════════════════════════════════════════════
// cn() — ترکیب کلاس‌های Tailwind
//
// مشکل: اگر بنویسیم className="p-4 p-6" تضاد ایجاد می‌شود
// راه‌حل: cn("p-4", "p-6") → فقط "p-6" را نگه می‌دارد
//
// مثال استفاده:
//   cn("bg-white rounded", isActive && "bg-primary text-white")
// ═══════════════════════════════════════════════
export function cn(...inputs: ClassValue[]): string {
  // clsx: کلاس‌های شرطی را مدیریت می‌کند
  // twMerge: تضادهای Tailwind را حل می‌کند
  return twMerge(clsx(inputs));
}

// ═══════════════════════════════════════════════
// formatDate — تبدیل تاریخ به فارسی
// مثال: "۱۴۰۳/۱/۱۵"
// ═══════════════════════════════════════════════
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

// ═══════════════════════════════════════════════
// truncate — کوتاه کردن متن طولانی
// مثال: truncate("این یک متن خیلی طولانی است", 20) → "این یک متن خیلی..."
// ═══════════════════════════════════════════════
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

// ═══════════════════════════════════════════════
// getSubjectColor — رنگ هر درس برای badge و تگ
// ═══════════════════════════════════════════════
export function getSubjectColor(subject: string): {
  bg: string;
  text: string;
} {
  const colorMap: Record<string, { bg: string; text: string }> = {
    algorithm: { bg: "bg-primary/10", text: "text-primary" },
    "data-structure": { bg: "bg-secondary/10", text: "text-secondary" },
    os: { bg: "bg-accent/10", text: "text-accent" },
    network: { bg: "bg-green-50", text: "text-green-700" },
    database: { bg: "bg-amber-50", text: "text-amber-700" },
  };

  return colorMap[subject] ?? { bg: "bg-gray-100", text: "text-gray-600" };
}