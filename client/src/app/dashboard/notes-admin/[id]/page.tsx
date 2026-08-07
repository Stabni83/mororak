"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { SUBJECT_LABELS, type Subject } from "@/types";
import { getSubjectColor } from "@/lib/utils";
import { api } from "@/lib/api";
import { ArrowRight, BookOpen, Loader2, Calendar } from "lucide-react";

interface NoteDetail {
  id: string | number;
  title: string;
  content: string;
  subject: Subject;
  author?: string;
  created_at?: string;
}

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params?.id;

  const [note, setNote] = useState<NoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNoteDetail() {
      if (!noteId) return;
      try {
        setLoading(true);
        const data = (api.notes as any).getById
          ? await (api.notes as any).getById(noteId)
          : await (api as any).get?.(`/notes/${noteId}`);

        setNote(data);
      } catch (err: any) {
        setError(err.message || "خطا در دریافت اطلاعات جزوه.");
      } finally {
        setLoading(false);
      }
    }

    fetchNoteDetail();
  }, [noteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header title="جزئیات جزوه" subtitle="در حال بارگذاری..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header title="خطا" subtitle="جزوه یافت نشد" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm text-red-600 mb-4">{error || "جزوه مورد نظر وجود ندارد یا حذف شده است."}</p>
          <Button variant="primary" onClick={() => router.push("/dashboard/notes")}>
            بازگشت به لیست جزوات
          </Button>
        </div>
      </div>
    );
  }

  const colors = getSubjectColor(note.subject);

  return (
    <div>
      <Header
        title={note.title}
        subtitle={`${SUBJECT_LABELS[note.subject] || "جزوه آموزشی"} · نویسنده: ${note.author || "مرورک"}`}
      />

      <div className="p-6 max-w-4xl mx-auto">
        {/* دکمه بازگشت */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs text-text-secondary hover:text-primary mb-6 transition-colors"
        >
          <ArrowRight size={16} />
          <span>بازگشت به صفحه قبل</span>
        </button>

        <Card className="p-6 md:p-8">
          {/* هدر جزوه داخل کارت */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-text">{note.title}</h1>
                {note.created_at && (
                  <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                    <Calendar size={13} />
                    <span>تاریخ ایجاد: {new Date(note.created_at).toLocaleDateString("fa-IR")}</span><span className="mx-1">·</span><span>نویسنده: {note.author || "مرورک"}</span>
                  </div>
                )}
              </div>
            </div>

            <Badge variant="primary" className={`${colors.bg} ${colors.text} border-0 px-3 py-1 text-xs`}>
              {SUBJECT_LABELS[note.subject] || note.subject}
            </Badge>
          </div>

          {/* محتوای اصلی جزوه */}
          <div className="prose prose-sm max-w-none text-text leading-relaxed whitespace-pre-wrap">
            {note.content || "محتوایی برای این جزوه ثبت نشده است."}
          </div>
        </Card>
      </div>
    </div>
  );
}
