"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { getSubjectColor } from "@/lib/utils";
import { SUBJECT_LABELS, type Subject } from "@/types";
import { Search, Clock, HelpCircle } from "lucide-react";

// ─── داده نمونه ──────────────────────────────
const notes = [
  { id: "1", title: "مرتب‌سازی و پیچیدگی", subject: "algorithm" as Subject, readingTime: 5, questionCount: 12, preview: "QuickSort، MergeSort، HeapSort و مقایسه کامل پیچیدگی زمانی" },
  { id: "2", title: "درخت‌های جستجو",      subject: "data-structure" as Subject, readingTime: 8, questionCount: 16, preview: "BST، AVL Tree، Red-Black Tree با مثال و پیاده‌سازی" },
  { id: "3", title: "مدیریت فرآیندها",     subject: "os" as Subject,            readingTime: 6, questionCount: 9,  preview: "Scheduling الگوریتم‌ها، Deadlock و راه‌حل‌ها" },
  { id: "4", title: "مدل TCP/IP",           subject: "network" as Subject,       readingTime: 7, questionCount: 11, preview: "لایه‌ها، پروتکل‌ها، TCP vs UDP با جزئیات" },
  { id: "5", title: "گراف — BFS و DFS",    subject: "algorithm" as Subject,     readingTime: 6, questionCount: 14, preview: "پیمایش گراف با پیاده‌سازی کامل در Python" },
  { id: "6", title: "نرمال‌سازی",          subject: "database" as Subject,      readingTime: 5, questionCount: 8,  preview: "1NF تا 3NF با مثال‌های کاربردی و تمرین" },
];

// ─── کامپوننت کارت جزوه ──────────────────────
function NoteCard({ note }: { note: typeof notes[0] }) {
  const colors = getSubjectColor(note.subject);

  return (
    <Card hoverable padding="md">
      <Badge className={`${colors.bg} ${colors.text} border-0 mb-3`}>
        {SUBJECT_LABELS[note.subject]}
      </Badge>

      <h3 className="text-sm font-bold mb-1.5 leading-snug">{note.title}</h3>
      <p className="text-xs text-text-muted leading-relaxed mb-3">{note.preview}</p>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-text-muted flex items-center gap-1">
          <Clock size={12} /> {note.readingTime} دقیقه
        </span>
        <span className="text-xs text-primary font-semibold flex items-center gap-1">
          <HelpCircle size={12} /> {note.questionCount} سوال
        </span>
      </div>
    </Card>
  );
}

// ─── صفحه جزوات ──────────────────────────────
export default function NotesPage() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject") as Subject | null;

  const [activeSubject, setActiveSubject] = useState<Subject | "all">(subjectParam ?? "all");
  const [search, setSearch] = useState("");

  // وقتی از سایدبار subject جدید انتخاب می‌شود (تغییر URL)، state رو همگام کن
  useEffect(() => {
    setActiveSubject(subjectParam ?? "all");
  }, [subjectParam]);

  const filtered = notes.filter((note) => {
    const matchesSubject = activeSubject === "all" || note.subject === activeSubject;
    const matchesSearch =
      note.title.includes(search) || note.preview.includes(search);
    return matchesSubject && matchesSearch;
  });

  return (
    <div>
      <Header title="جزوات" subtitle="مطالعه و مرور مفاهیم" />

      <div className="p-6 max-w-5xl mx-auto">
        {/* ─── جستجوی بزرگ ─── */}
        <div className="relative mb-6 max-w-2xl mx-auto">
          <Search
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="دنبال چه جزوه‌ای هستی؟"
            className="w-full h-12 border border-border rounded-xl bg-surface
                       pr-12 pl-4 text-sm placeholder:text-text-muted shadow-card
                       focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10
                       transition-all"
          />
        </div>

        {/* ─── چیپ‌های دسته‌بندی سریع (مکمل سایدبار) ─── */}
        <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubject("all")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeSubject === "all"
                ? "bg-primary text-white"
                : "bg-surface border border-border text-text-secondary hover:border-primary/40"
            }`}
          >
            همه
          </button>
          {(Object.keys(SUBJECT_LABELS) as Subject[]).map((subject) => (
            <button
              key={subject}
              onClick={() => setActiveSubject(subject)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeSubject === subject
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-secondary hover:border-primary/40"
              }`}
            >
              {SUBJECT_LABELS[subject]}
            </button>
          ))}
        </div>

        {/* ─── هدر نتایج ─── */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold">
            {activeSubject === "all" ? "همه جزوات" : SUBJECT_LABELS[activeSubject]}
          </h2>
          <span className="text-xs text-text-muted">{filtered.length} جزوه</span>
        </div>

        {/* ─── گرید جزوات ─── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={36} className="text-text-muted mb-3" />
            <p className="text-sm font-semibold mb-1">نتیجه‌ای پیدا نشد</p>
            <p className="text-xs text-text-muted">جستجوی دیگری امتحان کن</p>
          </div>
        )}
      </div>
    </div>
  );
}