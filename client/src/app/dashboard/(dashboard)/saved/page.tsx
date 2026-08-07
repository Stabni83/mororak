"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import { api } from "@/lib/api";
import { SUBJECT_LABELS, type Subject } from "@/types";
import { Bookmark, FileQuestion, FileText, ClipboardList, ExternalLink } from "lucide-react";

type SavedItem = { type: "note" | "question" | "exam" | "file"; id: number; title: string; href: string; subject?: string | null; saved_at?: string };

const labels: Record<SavedItem["type"], string> = { note: "جزوه", question: "سؤال", exam: "آزمون", file: "فایل" };

export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [filter, setFilter] = useState<"all" | SavedItem["type"]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.users.getSaved()
      .then((data) => setItems((data || []).filter((item: SavedItem) => item.type !== "exam")))
      .catch((err) => setError(err?.message || "خطا در دریافت ذخیره‌شده‌ها"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => filter === "all" ? items : items.filter((item) => item.type === filter), [items, filter]);

  return (
    <div>
      <Header title="ذخیره‌شده‌ها" subtitle="سؤال‌ها و جزوات ذخیره‌شده در یکجا" />
      <main className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "note", "question"] as const).map((key) => (
            <button key={key} onClick={() => setFilter(key)} className={`px-4 py-2 rounded-full text-xs font-semibold ${filter === key ? "bg-primary text-white" : "bg-surface border border-border text-text-secondary"}`}>
              {key === "all" ? "همه" : labels[key]}
            </button>
          ))}
        </div>

        {loading ? <div className="py-16 text-center text-sm text-text-muted">در حال دریافت ذخیره‌شده‌ها...</div> : error ? <div className="rounded-xl border border-danger/20 bg-danger/5 p-8 text-center text-sm text-danger">{error}</div> : !filtered.length ? (
          <Card className="py-16 text-center"><Bookmark className="mx-auto text-text-muted" size={34}/><p className="mt-3 font-semibold text-sm">هنوز چیزی ذخیره نکرده‌اید</p><p className="mt-1 text-xs text-text-muted">با آیکون ذخیره، موارد موردنیاز خود را اینجا نگه دارید.</p></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const Icon = item.type === "note" ? FileText : item.type === "exam" ? ClipboardList : item.type === "question" ? FileQuestion : FileText;
              return <Link key={`${item.type}-${item.id}`} href={item.href} className="block">
                <Card className="h-full hover:border-primary/40 hover:shadow-hover transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon size={19}/></div>
                    <span className="text-[11px] px-2 py-1 rounded-full bg-background border border-border text-text-muted">{labels[item.type]}</span>
                  </div>
                  <h2 className="mt-4 text-sm font-bold leading-6 line-clamp-2">{item.title}</h2>
                  {item.subject && <p className="mt-2 text-xs text-text-muted">{SUBJECT_LABELS[item.subject as Subject] || item.subject}</p>}
                  <div className="mt-4 flex items-center justify-between text-xs text-primary font-semibold"><span>{item.type === "question" ? "پاسخ دادن و دیدن تحلیل" : "باز کردن"}</span><ExternalLink size={14}/></div>
                </Card>
              </Link>;
            })}
          </div>
        )}
      </main>
    </div>
  );
}
