"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { SUBJECT_LABELS, SUBJECTS, type Subject, type FilterDefinition, type SubjectItem } from "@/types";
import { api } from "@/lib/api";
import type { Exam } from "@/types/exam";
import { Clock3, ClipboardCheck, Search, SlidersHorizontal, X } from "lucide-react";

const fallbackSubjects: SubjectItem[] = SUBJECTS.map((slug, position) => ({
  slug,
  position,
  id: position + 1,
  name: SUBJECT_LABELS[slug],
  is_active: true,
}));

export default function ExamsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const subject = params.get("subject") || "all";
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>(fallbackSubjects);
  const [filters, setFilters] = useState<FilterDefinition[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState("all");
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    Promise.all([
      api.catalog.subjects().catch(() => fallbackSubjects),
      api.catalog.filters("exams").catch(() => []),
    ]).then(([subjectData, filterData]) => {
      setSubjects(subjectData?.length ? subjectData : fallbackSubjects);
      setFilters(filterData || []);
    });
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const queryFilters: Record<string, string> = {};
    Object.entries(dynamicValues).forEach(([key, value]) => {
      if (value !== "") queryFilters[`filter_${key}`] = value;
    });

    api.exams.list({
      subject,
      exam_type: type,
      search: debouncedSearch || undefined,
      ...queryFilters,
    })
      .then(data => active && setExams(data || []))
      .catch(err => active && setError(err?.message || "خطا در دریافت آزمون‌ها"))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [subject, type, debouncedSearch, dynamicValues]);

  const chooseSubject = (value: string) => {
    router.push(value === "all" ? "/dashboard/exams" : `/dashboard/exams?subject=${encodeURIComponent(value)}`);
  };

  const subjectLabel = (slug: string) =>
    subjects.find(s => s.slug === slug)?.name || SUBJECT_LABELS[slug as Subject] || slug;

  const visibleFilters = useMemo(() => filters.filter(f => f.is_active), [filters]);

  return (
    <div>
      <Header title="آزمون‌ها" subtitle="تمرین و مرور آزمون‌ها" />
      <main className="p-6 max-w-5xl mx-auto">
        <div className="relative mb-6 max-w-2xl mx-auto">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="دنبال چه آزمونی هستی؟"
            className="w-full h-12 border border-border rounded-xl bg-surface pr-12 pl-10 text-sm placeholder:text-text-muted shadow-card focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary" aria-label="پاک کردن جستجو">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto pb-1">
          <button onClick={() => chooseSubject("all")} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${subject === "all" ? "bg-primary text-white" : "bg-surface border border-border text-text-secondary hover:border-primary/40"}`}>همه</button>
          {subjects.map(s => (
            <button key={s.slug} onClick={() => chooseSubject(s.slug)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${subject === s.slug ? "bg-primary text-white" : "bg-surface border border-border text-text-secondary hover:border-primary/40"}`}>
              {s.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-1">
          {[{ value: "all", label: "همه" }, { value: "practice", label: "کتاب تست" }, { value: "timed", label: "آزمون زمان‌دار" }].map(item => (
            <button key={item.value} onClick={() => setType(item.value)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${type === item.value ? "bg-primary text-white" : "bg-surface border border-border text-text-secondary hover:border-primary/40"}`}>
              {item.label}
            </button>
          ))}
        </div>

        {visibleFilters.length > 0 && (
          <div className="mb-6 rounded-xl border border-border bg-surface p-4 shadow-card">
            <div className="flex items-center gap-2 mb-4 text-sm font-bold"><SlidersHorizontal size={16} className="text-primary" /> فیلترها</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleFilters.map(filter => (
                <div key={filter.id}>
                  <label className="block text-xs text-text-muted mb-1.5">{filter.name}</label>
                  {filter.field_type === "number" ? (
                    <div className="flex gap-2">
                      <input type="number" value={dynamicValues[`${filter.key}__min`] || ""} onChange={e => setDynamicValues(v => ({ ...v, [`${filter.key}__min`]: e.target.value }))} placeholder="از" className="w-1/2 rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary/50" />
                      <input type="number" value={dynamicValues[`${filter.key}__max`] || ""} onChange={e => setDynamicValues(v => ({ ...v, [`${filter.key}__max`]: e.target.value }))} placeholder="تا" className="w-1/2 rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary/50" />
                    </div>
                  ) : filter.field_type === "text" ? (
                    <input value={dynamicValues[filter.key] || ""} onChange={e => setDynamicValues(v => ({ ...v, [filter.key]: e.target.value }))} placeholder={filter.name} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary/50" />
                  ) : filter.field_type === "boolean" ? (
                    <select value={dynamicValues[filter.key] || ""} onChange={e => setDynamicValues(v => ({ ...v, [filter.key]: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs">
                      <option value="">همه</option><option value="true">بله</option><option value="false">خیر</option>
                    </select>
                  ) : (
                    <select value={dynamicValues[filter.key] || ""} onChange={e => setDynamicValues(v => ({ ...v, [filter.key]: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs">
                      <option value="">همه</option>
                      {filter.options.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold">{subject === "all" ? "همه آزمون‌ها" : subjectLabel(subject)}</h2>
          <span className="text-xs text-text-muted">{exams.length} آزمون</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map(n => <div key={n} className="h-48 bg-surface/50 border border-border rounded-lg animate-pulse" />)}</div>
        ) : error ? (
          <div className="p-6 bg-danger/10 border border-danger/20 text-danger rounded-lg text-center text-sm">{error}</div>
        ) : exams.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map(exam => (
              <Card key={exam.id} hoverable padding="md" className="h-full flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Badge className="bg-primary/10 text-primary border-0">{subjectLabel(exam.subject)}</Badge>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><ClipboardCheck size={18} /></div>
                </div>
                <button onClick={() => router.push(`/dashboard/exams/${exam.id}`)} className="text-right block">
                  <h3 className="text-sm font-bold mb-1.5 leading-snug hover:text-primary transition-colors">{exam.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{exam.description || "تمرین و سنجش دانسته‌ها"}</p>
                  <p className="mt-2 text-[11px] text-text-muted">نویسنده: {exam.author || "مرورک"}</p>
                </button>
                <div className="flex items-center justify-between pt-3 border-t border-border mt-auto text-xs text-text-muted">
                  <span>{exam.question_count} سؤال</span>
                  {exam.exam_type === "timed" ? <span className="flex items-center gap-1"><Clock3 size={12} /> {Math.ceil((exam.time_limit_seconds || 0) / 60)} دقیقه</span> : <span>بدون زمان</span>}
                </div>
                <button onClick={() => router.push(`/dashboard/exams/${exam.id}`)} className="mt-3 w-full rounded-lg bg-primary text-white py-2.5 text-sm font-semibold">{exam.exam_type === "timed" ? "شروع آزمون" : "شروع کتاب تست"}</button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardCheck size={36} className="text-text-muted mb-3" />
            <p className="text-sm font-semibold mb-1">نتیجه‌ای پیدا نشد</p>
            <p className="text-xs text-text-muted">عبارت جستجو یا فیلترها را تغییر بده.</p>
          </div>
        )}
      </main>
    </div>
  );
}
