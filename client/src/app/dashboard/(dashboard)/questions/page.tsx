"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { SUBJECT_LABELS, SUBJECTS, type Subject, type SubjectItem } from "@/types";
import { api } from "@/lib/api";
import { Bookmark, Brain, Search, X } from "lucide-react";

export default function QuestionsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const activeSubject = params.get("subject") || "all";
  const [subjects, setSubjects] = useState<SubjectItem[]>(SUBJECTS.map((slug, position) => ({ id: position + 1, slug, name: SUBJECT_LABELS[slug], position, is_active: true })));
  const [questions, setQuestions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.catalog.subjects().then(data => { if (data?.length) setSubjects(data); }).catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.questions.list({ subject: activeSubject })
      .then(data => setQuestions(data || []))
      .finally(() => setLoading(false));
  }, [activeSubject]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return questions;
    return questions.filter(q => `${q.text} ${q.explanation || ""}`.toLowerCase().includes(term));
  }, [questions, search]);

  const subjectLabel = (slug: string) => subjects.find(s => s.slug === slug)?.name || SUBJECT_LABELS[slug as Subject] || slug;

  return (
    <div>
      <Header title="سؤالات" subtitle="مرور و تمرین سؤال‌ها؛ جستجو در متن و توضیحات پاسخ" />
      <main className="p-6 max-w-5xl mx-auto">
        <div className="relative mb-6 max-w-2xl mx-auto">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجوی متن سؤال یا توضیحات پاسخ..." className="w-full h-12 border border-border rounded-xl bg-surface pr-12 pl-10 text-sm shadow-card focus:outline-none focus:border-primary/50" />
          {search && <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"><X size={16}/></button>}
        </div>
        <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-1">
          <button onClick={() => router.push("/dashboard/questions")} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${activeSubject === "all" ? "bg-primary text-white" : "bg-surface border border-border"}`}>همه</button>
          {subjects.map(subject => <button key={subject.slug} onClick={() => router.push(`/dashboard/questions?subject=${encodeURIComponent(subject.slug)}`)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${activeSubject === subject.slug ? "bg-primary text-white" : "bg-surface border border-border"}`}>{subject.name}</button>)}
        </div>
        <div className="flex items-center justify-between mb-5"><h2 className="text-base font-bold">{activeSubject === "all" ? "همه سوالات" : subjectLabel(activeSubject)}</h2><span className="text-xs text-text-muted">{filtered.length} سؤال</span></div>
        {loading ? <div className="text-center py-16 text-sm text-text-muted">در حال دریافت سوالات...</div> : filtered.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{filtered.map(q => <Card key={q.id} hoverable padding="md"><div className="flex items-start justify-between gap-3"><Badge className="bg-primary/10 text-primary border-0">{subjectLabel(q.subject)}</Badge><button onClick={async () => { const r = await api.questions.save(q.id); setQuestions(prev => prev.map(item => item.id === q.id ? {...item, is_saved: r.is_saved} : item)); }} className={q.is_saved ? "text-primary" : "text-text-muted"}><Bookmark size={18} fill={q.is_saved ? "currentColor" : "none"}/></button></div><button onClick={() => router.push(`/dashboard/questions/${q.id}`)} className="mt-4 text-right w-full"><h3 className="text-sm font-bold leading-7 hover:text-primary">{q.text}</h3><p className="mt-2 text-xs text-text-muted line-clamp-2">{q.explanation}</p></button></Card>)}</div> : <div className="py-16 text-center"><Brain size={34} className="mx-auto text-text-muted"/><p className="mt-3 text-sm font-semibold">سوالی پیدا نشد</p><p className="text-xs text-text-muted mt-1">عبارت جستجو یا درس را تغییر بده.</p></div>}
      </main>
    </div>
  );
}
