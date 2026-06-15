"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { cn, getSubjectColor } from "@/lib/utils";
import { SUBJECT_LABELS, type Subject } from "@/types";

// ─── داده نمونه ──────────────────────────────
const notes = [
  { id: "1", title: "مرتب‌سازی و پیچیدگی", subject: "algorithm" as Subject, readingTime: 5, questionCount: 12, preview: "QuickSort، MergeSort، HeapSort و مقایسه کامل پیچیدگی زمانی" },
  { id: "2", title: "درخت‌های جستجو",      subject: "data-structure" as Subject, readingTime: 8, questionCount: 16, preview: "BST، AVL Tree، Red-Black Tree با مثال و پیاده‌سازی" },
  { id: "3", title: "مدیریت فرآیندها",     subject: "os" as Subject,            readingTime: 6, questionCount: 9,  preview: "Scheduling الگوریتم‌ها، Deadlock و راه‌حل‌ها" },
  { id: "4", title: "مدل TCP/IP",           subject: "network" as Subject,       readingTime: 7, questionCount: 11, preview: "لایه‌ها، پروتکل‌ها، TCP vs UDP با جزئیات" },
  { id: "5", title: "گراف — BFS و DFS",    subject: "algorithm" as Subject,     readingTime: 6, questionCount: 14, preview: "پیمایش گراف با پیاده‌سازی کامل در Python" },
  { id: "6", title: "نرمال‌سازی",          subject: "database" as Subject,      readingTime: 5, questionCount: 8,  preview: "1NF تا 3NF با مثال‌های کاربردی و تمرین" },
];

const subjectCounts: Record<Subject | "all", number> = {
  all: notes.length,
  algorithm: notes.filter(n => n.subject === "algorithm").length,
  "data-structure": notes.filter(n => n.subject === "data-structure").length,
  os: notes.filter(n => n.subject === "os").length,
  network: notes.filter(n => n.subject === "network").length,
  database: notes.filter(n => n.subject === "database").length,
};

// ─── کامپوننت کارت جزوه ──────────────────────
function NoteCard({ note }: { note: typeof notes[0] }) {
  const colors = getSubjectColor(note.subject);

  return (
    <Card hoverable padding="md">
      {/* تگ موضوع */}
      <Badge className={`${colors.bg} ${colors.text} border-0 mb-3`}>
        {SUBJECT_LABELS[note.subject]}
      </Badge>

      <h3 className="text-sm font-bold mb-1.5 leading-snug">{note.title}</h3>
      <p className="text-xs text-text-muted leading-relaxed mb-3">{note.preview}</p>

      {/* footer کارت */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-text-muted">⏱ {note.readingTime} دقیقه</span>
        <span className="text-xs text-primary font-semibold">
          {note.questionCount} سوال
        </span>
      </div>
    </Card>
  );
}

// ─── صفحه جزوات ──────────────────────────────
export default function NotesPage() {
  const [activeSubject, setActiveSubject] = useState<Subject | "all">("all");
  const [search, setSearch] = useState("");

  // فیلتر کردن جزوات بر اساس subject و جستجو
  const filtered = notes.filter((note) => {
    const matchesSubject = activeSubject === "all" || note.subject === activeSubject;
    const matchesSearch =
      note.title.includes(search) || note.preview.includes(search);
    return matchesSubject && matchesSearch;
  });

  return (
    <div>
      <Header title="جزوات" subtitle="مطالعه و مرور مفاهیم" />

      <div className="flex">

        {/* ─── سایدبار دسته‌بندی ─── */}
        <aside className="w-52 min-h-screen border-l border-border bg-surface p-4 flex-shrink-0">

          {/* جستجو */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو..."
            className="w-full h-9 border border-border rounded-md bg-background
                       px-3 text-xs placeholder:text-text-muted
                       focus:outline-none focus:border-primary/50 mb-4"
          />

          <p className="text-xs font-bold text-text-muted mb-2">دسته‌بندی</p>

          {/* آیتم همه */}
          <button
            onClick={() => setActiveSubject("all")}
            className={cn(
              "w-full flex items-center justify-between px-2 py-2 rounded text-xs mb-1",
              activeSubject === "all"
                ? "bg-primary/8 text-primary font-semibold"
                : "text-text-secondary hover:text-primary"
            )}
          >
            <span>همه جزوات</span>
            <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded font-bold">
              {subjectCounts.all}
            </span>
          </button>

          {/* آیتم‌های درس */}
          {(Object.keys(SUBJECT_LABELS) as Subject[]).map((subject) => (
            <button
              key={subject}
              onClick={() => setActiveSubject(subject)}
              className={cn(
                "w-full flex items-center justify-between px-2 py-2 rounded text-xs mb-1",
                activeSubject === subject
                  ? "bg-primary/8 text-primary font-semibold"
                  : "text-text-secondary hover:text-primary"
              )}
            >
              <span>{SUBJECT_LABELS[subject]}</span>
              <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded font-bold">
                {subjectCounts[subject]}
              </span>
            </button>
          ))}
        </aside>

        {/* ─── محتوای اصلی — گرید جزوات ─── */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold">
              {activeSubject === "all" ? "همه جزوات" : SUBJECT_LABELS[activeSubject]}
            </h2>
            <span className="text-xs text-text-muted">{filtered.length} جزوه</span>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          ) : (
            // حالت خالی — وقتی نتیجه‌ای نیست
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm font-semibold mb-1">نتیجه‌ای پیدا نشد</p>
              <p className="text-xs text-text-muted">جستجوی دیگری امتحان کن</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}