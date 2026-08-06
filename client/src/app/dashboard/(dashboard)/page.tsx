// client/src/app/dashboard/(dashboard)/page.tsx
"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { SUBJECT_LABELS, type Subject } from "@/types";
import ActivityChart from "@/components/dashboard/ActivityChart";
import ContinueLearning from "@/components/dashboard/ContinueLearning";
import SavedNotesCard from "@/components/dashboard/RecentNotes";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any>(null);
  const [activityData, setActivityData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [notesRes, progressRes] = await Promise.all([
          api.notes.getSaved().catch(() => []),
          api.users.getProgress().catch(() => null)
        ]);

        setSavedNotes(notesRes || []);
        setProgressData(progressRes);

      const weeklyActivity = progressRes?.weekly_activity || [
        { day: "شنبه", questions: 120, study_minutes: 450 },
        { day: "یکشنبه", questions: 300, study_minutes: 720 },
        { day: "دوشنبه", questions: 50, study_minutes: 180 },
        { day: "سه‌شنبه", questions: 800, study_minutes: 1100 },
        { day: "چهارشنبه", questions: 450, study_minutes: 600 },
        { day: "پنج‌شنبه", questions: 950, study_minutes: 1300 },
        { day: "جمعه", questions: 200, study_minutes: 300 },
      ];
      setActivityData(weeklyActivity);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div>
      <Header title="داشبورد" subtitle="خوش آمدید" />

      <div className="p-6 max-w-5xl mx-auto">
        {/* نمودار فعالیت هفتگی (آبی: سوالات، قرمز: ساعت مطالعه) */}
        <ActivityChart data={activityData} />
        
        {/* کامپوننت ادامه یادگیری */}
        <ContinueLearning progress={progressData} />

        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* کامپوننت جزوات ذخیره‌شده */}
          <SavedNotesCard savedNotes={savedNotes} />
        </div>

        {/* درس‌های پیشنهادی پویا */}
        <Card className="shadow-card">
          <h2 className="text-sm font-bold mb-3">درس‌های پیشنهادی برای مرور</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {progressData?.suggested_subjects && progressData.suggested_subjects.length > 0 ? (
              progressData.suggested_subjects.map((subj: string, idx: number) => (
                <Link
                  key={idx}
                  href={`/dashboard/notes?subject=${subj}`}
                  className="p-3 bg-background border border-border rounded-md hover:border-primary/30 transition-all block"
                >
                  <p className="text-sm font-semibold mb-1 truncate">{SUBJECT_LABELS[subj as Subject] || subj}</p>
                  <p className="text-xs text-text-muted">موضوع فعال در سامانه</p>
                </Link>
              ))
            ) : (
              <p className="text-xs text-text-muted py-2 text-center">هنوز درسی ثبت نشده است.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}