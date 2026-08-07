"use client";
import Link from "next/link";
import type { Note } from "@/types/note";
import { FileText, Bookmark } from "lucide-react";

export default function NoteGrid({ notes, onSave }: { notes: Note[]; onSave?: (id: number) => void }) {
  if (!notes.length) return <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-muted">جزوه‌ای پیدا نشد.</div>;
  return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{notes.map(note => (
    <article key={note.id} className="rounded-xl border border-border bg-surface p-5 shadow-card hover:shadow-hover transition-shadow">
      <div className="flex items-start justify-between gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><FileText size={20}/></div>{onSave && <button onClick={() => onSave(note.id)} className={note.is_saved ? "text-primary" : "text-text-muted"} aria-label="ذخیره جزوه"><Bookmark size={18} fill={note.is_saved ? "currentColor" : "none"}/></button>}</div>
      <Link href={`/dashboard/notes/${note.slug}`} className="block mt-4 text-base font-bold text-text hover:text-primary">{note.title}</Link>
      <p className="mt-2 text-xs text-text-muted line-clamp-3">{note.content}</p>
      <p className="mt-2 text-[11px] text-text-muted">نویسنده: {note.author || "مرورک"}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-text-muted"><span>{note.subject}</span><span>{note.reading_time} دقیقه</span></div>
    </article>
  ))}</div>;
}
