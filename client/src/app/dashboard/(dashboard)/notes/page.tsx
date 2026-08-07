"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { getSubjectColor } from "@/lib/utils";
import { SUBJECT_LABELS, SUBJECTS, type Subject, type SubjectItem } from "@/types";
import { Search, Clock, HelpCircle, BookOpen, Bookmark } from "lucide-react";
import { api } from "@/lib/api";

interface NoteItem {
  id: string;
  title: string;
  slug: string;
  subject: Subject;
  content: string;
  author?: string;
  reading_time: number;
  questionCount?: number;
  is_saved?: boolean;
}

function NoteCard({ note, onSave }: { note: NoteItem; onSave: (id: number) => Promise<void> }) {
  const colors = getSubjectColor(note.subject);

  return (
    <Card hoverable padding="md" className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge className={`${colors.bg} ${colors.text} border-0`}>
            {SUBJECT_LABELS[note.subject] || note.subject}
          </Badge>
          <button
            type="button"
            aria-label={note.is_saved ? "حذف از ذخیره‌شده‌ها" : "ذخیره جزوه"}
            title={note.is_saved ? "حذف از ذخیره‌شده‌ها" : "ذخیره جزوه"}
            onClick={() => void onSave(Number(note.id))}
            className={`shrink-0 rounded-lg p-1.5 transition-colors ${note.is_saved ? "text-primary bg-primary/10" : "text-text-muted hover:text-primary hover:bg-primary/5"}`}
          >
            <Bookmark size={18} fill={note.is_saved ? "currentColor" : "none"} />
          </button>
        </div>

        <Link href={`/dashboard/notes/${note.id}`} className="block cursor-pointer">
          <h3 className="text-sm font-bold mb-1.5 leading-snug hover:text-primary transition-colors">{note.title}</h3>
          <p className="text-xs text-text-muted leading-relaxed mb-3 line-clamp-2">{note.content}</p>
          <p className="text-[11px] text-text-muted">نویسنده: {note.author || "مرورک"}</p>
        </Link>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
        <span className="text-xs text-text-muted flex items-center gap-1"><Clock size={12} /> {note.reading_time || 5} دقیقه</span>
        <span className="text-xs text-primary font-semibold flex items-center gap-1"><HelpCircle size={12} /> {note.questionCount || 0} سوال</span>
      </div>
    </Card>
  );
}

export default function NotesPage() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject") as Subject | null;

  const fallbackSubjects: SubjectItem[] = SUBJECTS.map((slug, position) => ({ id: position + 1, slug, name: SUBJECT_LABELS[slug], position, is_active: true }));
  const [subjects, setSubjects] = useState<SubjectItem[]>(fallbackSubjects);
  const [activeSubject, setActiveSubject] = useState<string>(subjectParam ?? "all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActiveSubject(subjectParam ?? "all");
  }, [subjectParam]);

  useEffect(() => {
    api.catalog.subjects().then((items) => { if (items?.length) setSubjects(items); }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function fetchNotes() {
      try {
        setLoading(true);
        let data: NoteItem[] = [];
        if (typeof (api as any).notes?.list === "function") {
          data = await (api as any).notes.list({ ...(activeSubject !== "all" ? { subject: activeSubject } : {}), ...(debouncedSearch ? { search: debouncedSearch } : {}) });
        } else if (typeof (api as any).get === "function") {
          let endpoint = "/notes";
          const query = new URLSearchParams();
          if (activeSubject !== "all") query.set("subject", activeSubject);
          if (debouncedSearch) query.set("search", debouncedSearch);
          if (query.toString()) endpoint += `?${query.toString()}`;
          data = await (api as any).get(endpoint);
        }
        setNotes(data || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || "خطا در دریافت جزوات");
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, [activeSubject, debouncedSearch]);

  const handleSave = async (id: number) => {
    try {
      const updated = await api.notes.toggleSave(id);
      setNotes((current) => current.map((note) => Number(note.id) === id ? { ...note, is_saved: updated.is_saved } : note));
    } catch (err: any) {
      setError(err.message || "ذخیره جزوه انجام نشد");
    }
  };

  const activeSubjectLabel = subjects.find((s) => s.slug === activeSubject)?.name || SUBJECT_LABELS[activeSubject as Subject] || activeSubject;

  const filtered = notes.filter((note) => {
    return (
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) || (note.author || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div>
      <Header title="جزوات" subtitle="مطالعه و مرور مفاهیم؛ جستجو بر اساس نام جزوه، نویسنده یا متن" />

      <div className="p-6 max-w-5xl mx-auto">
        <div className="relative mb-6 max-w-2xl mx-auto">
          <Search
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی نام جزوه، نویسنده یا متن..."
            className="w-full h-12 border border-border rounded-xl bg-surface
                       pr-12 pl-4 text-sm placeholder:text-text-muted shadow-card
                       focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10
                       transition-all"
          />
        </div>

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
          {subjects.map((subject) => (
            <button
              key={subject.slug}
              onClick={() => setActiveSubject(subject.slug)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeSubject === subject.slug
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-secondary hover:border-primary/40"
              }`}
            >
              {subject.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold">
            {activeSubject === "all" ? "همه جزوات" : activeSubjectLabel}
          </h2>
          <span className="text-xs text-text-muted">{filtered.length} جزوه</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 bg-surface/50 border border-border rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-danger/10 border border-danger/20 text-danger rounded-lg text-center text-sm">
            {error}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((note) => (
              <NoteCard key={note.id} note={note} onSave={handleSave} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen size={36} className="text-text-muted mb-3" />
            <p className="text-sm font-semibold mb-1">نتیجه‌ای پیدا نشد</p>
            <p className="text-xs text-text-muted">جستجوی دیگری امتحان کن</p>
          </div>
        )}
      </div>
    </div>
  );
}
