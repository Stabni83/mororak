export * from "./user";
export * from "./note";
export * from "./question";
export * from "./exam";
export const SUBJECTS = ["algorithm", "data-structure", "os", "network", "database"] as const;
export type Subject = (typeof SUBJECTS)[number];
export const SUBJECT_LABELS: Record<Subject, string> = { algorithm: "الگوریتم", "data-structure": "ساختمان داده", os: "سیستم‌عامل", network: "شبکه", database: "پایگاه داده" };
export const DIFFICULTY_LABELS = { beginner: "مقدماتی", intermediate: "متوسط", advanced: "پیشرفته" } as const;

export * from "./catalog";
