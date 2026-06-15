import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { SUBJECT_LABELS, type Subject } from "@/types";
import { getSubjectColor } from "@/lib/utils";
import ActivityChart from "@/components/dashboard/ActivityChart";

const recentNotes = [
  { id: "1", title: "مرتب‌سازی — QuickSort", subject: "algorithm" as Subject },
  { id: "2", title: "صف و پشته",             subject: "data-structure" as Subject },
  { id: "3", title: "Deadlock چیست؟",        subject: "os" as Subject },
];

const savedQuestions = [
  { id: "1", text: "پیچیدگی Dijkstra چقدر است؟", subject: "algorithm" as Subject },
  { id: "2", text: "TCP vs UDP چه فرقی دارند؟",  subject: "network" as Subject },
  { id: "3", text: "مدیریت حافظه در OS",         subject: "os" as Subject },
];

const suggestedCourses = [
  { title: "گراف — BFS و DFS", subject: "algorithm" as Subject, count: 28 },
  { title: "حافظه مجازی",     subject: "os" as Subject,        count: 21 },
  { title: "Hashing",          subject: "data-structure" as Subject, count: 18 },
];

function ContinueLearning() {
  return (
    <Card className="flex items-center gap-4 mb-5">
      <div className="w-12 h-12 bg-primary/8 rounded-xl flex items-center
                      justify-center text-2xl flex-shrink-0">
        ⚡
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted mb-0.5">ادامه بده</p>
        <p className="text-sm font-bold truncate">ساختمان داده — درخت AVL</p>
        <p className="text-xs text-text-secondary mt-0.5">فصل ۴ · ۱۲ سوال باقی‌مانده</p>
        <ProgressBar value={65} showLabel className="mt-2" />
      </div>
      <Button variant="primary" size="sm" className="flex-shrink-0">
        <Link href="/questions">ادامه ←</Link>
      </Button>
    </Card>
  );
}

function ListItem({ title, subject }: { title: string; subject: Subject }) {
  const colors = getSubjectColor(subject);
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.bg.replace("/10","")}`} />
      <span className="text-sm flex-1 truncate">{title}</span>
      <Badge variant="primary" className={`${colors.bg} ${colors.text} border-0`}>
        {SUBJECT_LABELS[subject]}
      </Badge>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <Header title="داشبورد" subtitle="سلام، علی 👋" />
      <div className="p-6">
        <ActivityChart />
        <ContinueLearning />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold">آخرین جزوات</h2>
              <Link href="/notes" className="text-xs text-primary font-semibold">همه</Link>
            </div>
            {recentNotes.map((note) => (
              <ListItem key={note.id} title={note.title} subject={note.subject} />
            ))}
          </Card>
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold">سوالات ذخیره‌شده</h2>
              <Link href="/saved" className="text-xs text-primary font-semibold">همه</Link>
            </div>
            {savedQuestions.map((q) => (
              <ListItem key={q.id} title={q.text} subject={q.subject} />
            ))}
          </Card>
        </div>
        <Card>
          <h2 className="text-sm font-bold mb-3">درس‌های پیشنهادی</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestedCourses.map((course) => (
              <Link
                key={course.title}
                href={`/notes?subject=${course.subject}`}
                className="p-3 bg-background border border-border rounded-md
                           hover:border-primary/30 transition-all"
              >
                <p className="text-sm font-semibold mb-1">{course.title}</p>
                <p className="text-xs text-text-muted">
                  {course.count} سوال · {SUBJECT_LABELS[course.subject]}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}