// ═══════════════════════════════════════════════
// تعریف انواع داده‌های پروژه
// با interface مشخص می‌کنیم هر آبجکت چه شکلی دارد
// ═══════════════════════════════════════════════

// ─── کاربر ───────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ─── درس ─────────────────────────────────────
// as const می‌گوید این مقادیر ثابت هستند
export const SUBJECTS = [
  "algorithm",
  "data-structure",
  "os",
  "network",
  "database",
] as const;

// Union type از مقادیر SUBJECTS — فقط این ۵ مقدار مجاز است
export type Subject = (typeof SUBJECTS)[number];

// نام فارسی هر درس برای نمایش در UI
export const SUBJECT_LABELS: Record<Subject, string> = {
  algorithm: "الگوریتم",
  "data-structure": "ساختمان داده",
  os: "سیستم‌عامل",
  network: "شبکه",
  database: "پایگاه داده",
};

// ─── سطح سختی ────────────────────────────────
export type Difficulty = "beginner" | "intermediate" | "advanced";

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "مقدماتی",
  intermediate: "متوسط",
  advanced: "پیشرفته",
};

// ─── گزینه سوال ──────────────────────────────
export interface QuestionOption {
  id: string;       // شناسه یکتا — مثلاً "a", "b", "c", "d"
  text: string;     // متن گزینه
}

// ─── سوال ────────────────────────────────────
export interface Question {
  id: string;
  subject: Subject;
  difficulty: Difficulty;
  text: string;               // متن سوال
  options: QuestionOption[];  // لیست گزینه‌ها (معمولاً ۴ تا)
  correctOptionId: string;    // id گزینه درست
  explanation: string;        // پاسخ تشریحی
  codeExample?: string;       // کد نمونه (اختیاری — با ? مشخص می‌شود)
  noteId?: string;            // لینک به جزوه مرتبط (اختیاری)
  createdAt: Date;
}

// ─── جزوه ────────────────────────────────────
export interface Note {
  id: string;
  slug: string;             // URL-friendly نام — مثلاً "quicksort-algorithm"
  title: string;
  subject: Subject;
  content: string;          // محتوای markdown جزوه
  readingTime: number;      // زمان مطالعه به دقیقه
  questionCount: number;    // تعداد سوال‌های مرتبط
  createdAt: Date;
}

// ─── وضعیت پاسخ کاربر ────────────────────────
// این interface نشان می‌دهد کاربر به یک سوال چه جوابی داده
export interface UserAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  answeredAt: Date;
  personalNote?: string;    // یادداشت شخصی کاربر روی این سوال
}

// ─── سوال ذخیره‌شده ───────────────────────────
export interface SavedQuestion {
  questionId: string;
  savedAt: Date;
}