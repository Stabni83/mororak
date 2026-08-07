"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { SUBJECT_LABELS, type Subject } from "@/types";
import ActivityChart from "@/components/dashboard/ActivityChart";
import ContinueLearning from "@/components/dashboard/ContinueLearning";
import { api } from "@/lib/api";
import { BookOpen, ClipboardCheck, ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  const [progressData, setProgressData] = useState<any>(null);
  const [activityData, setActivityData] = useState<any[]>([]);

  useEffect(() => {
    api.users.getProgress().then((data) => {
      setProgressData(data);
      setActivityData(data?.weekly_activity || []);
    }).catch((err) => console.error("Error fetching dashboard data:", err));
  }, []);

  const recentExam = progressData?.recent_visits?.exam;
  const recentNote = progressData?.recent_visits?.note;

  return <div>
    <Header title="داشبورد" subtitle="خوش آمدید" />
    <div className="p-6 max-w-5xl mx-auto">
      <ActivityChart data={activityData} />
      <ContinueLearning progress={progressData} />

      <Card className="shadow-card mb-4">
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-sm font-bold">آخرین بازدیدها</h2><p className="text-xs text-text-muted mt-1">آخرین آزمون و جزوه‌ای که استفاده کرده‌اید</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recentExam ? <Link href={recentExam.href} className="rounded-xl border border-border p-4 hover:border-primary/40 transition-all flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><ClipboardCheck size={19}/></div><div className="min-w-0 flex-1"><p className="text-xs text-text-muted mb-1">آخرین آزمون</p><p className="text-sm font-bold truncate">{recentExam.title}</p>{recentExam.score != null && <p className="text-[11px] text-primary mt-1">نتیجه: {recentExam.score}%</p>}</div><ArrowLeft size={15} className="text-text-muted"/></Link> : <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-text-muted">هنوز آزمونی نداده‌اید.</div>}
          {recentNote ? <Link href={recentNote.href} className="rounded-xl border border-border p-4 hover:border-primary/40 transition-all flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><BookOpen size={19}/></div><div className="min-w-0 flex-1"><p className="text-xs text-text-muted mb-1">آخرین جزوه</p><p className="text-sm font-bold truncate">{recentNote.title}</p><p className="text-[11px] text-text-muted mt-1">مطالعه شده در {recentNote.visited_at}</p></div><ArrowLeft size={15} className="text-text-muted"/></Link> : <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-text-muted">هنوز جزوه‌ای مطالعه نکرده‌اید.</div>}
        </div>
      </Card>

      <Card className="shadow-card">
        <h2 className="text-sm font-bold mb-3">درس‌های پیشنهادی برای مرور</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {progressData?.suggested_subjects?.length ? progressData.suggested_subjects.map((subj: string, idx: number) => <Link key={idx} href={`/dashboard/notes?subject=${subj}`} className="p-3 bg-background border border-border rounded-md hover:border-primary/30 transition-all block"><p className="text-sm font-semibold mb-1 truncate">{SUBJECT_LABELS[subj as Subject] || subj}</p><p className="text-xs text-text-muted">موضوع فعال در سامانه</p></Link>) : <p className="text-xs text-text-muted py-2 text-center">هنوز درسی ثبت نشده است.</p>}
        </div>
      </Card>
    </div>
  </div>;
}
