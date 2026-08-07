"use client";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { SUBJECT_LABELS, type Subject } from "@/types";
import { getSubjectColor } from "@/lib/utils";

interface NoteItem {
  id: string | number;
  title: string;
  subject: Subject;
}

interface SavedNotesCardProps {
  savedNotes: NoteItem[];
}

function ListItem({ id, title, subject }: { id: string | number; title: string; subject: Subject }) {
  const colors = getSubjectColor(subject);
  return (
    <Link
      href={`/dashboard/notes/${id}`}
      className="flex items-center gap-3 py-2.5 border-b border-border last:border-0 hover:bg-background/70 rounded-lg px-2 -mx-2 transition-colors"
      aria-label={`باز کردن جزوه ${title}`}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${colors.bg.replace("/10", "")}`} />
      <span className="text-sm flex-1 truncate text-text">{title}</span>
      <Badge variant="primary" className={`${colors.bg} ${colors.text} border-0`}>
        {SUBJECT_LABELS[subject] || subject}
      </Badge>
    </Link>
  );
}

export default function SavedNotesCard({ savedNotes }: SavedNotesCardProps) {
  return (
    <Card className="shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold">جزوات ذخیره‌شده</h2>
        <Link href="/dashboard/notes" className="text-xs text-primary font-semibold hover:underline">
          همه ({savedNotes.length})
        </Link>
      </div>
      {savedNotes.length > 0 ? (
        savedNotes.slice(0, 3).map((note, index) => (
          <ListItem key={note.id || index} id={note.id} title={note.title} subject={note.subject} />
        ))
      ) : (
        <p className="text-xs text-text-muted py-4 text-center">هنوز جزوه‌ای ذخیره نکرده‌اید.</p>
      )}
    </Card>
  );
}
