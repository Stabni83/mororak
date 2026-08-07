"use client";

import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { ClipboardCheck, Zap } from "lucide-react";

interface ContinueLearningProps {
  progress: {
    progress_percentage?: number;
    total_questions?: number;
    recent_visits?: { exam?: { title?: string; score?: number | null; answered_questions?: number; total_questions?: number; status?: string } | null };
  } | null;
}

export default function ContinueLearning({ progress }: ContinueLearningProps) {
  const successRate = progress?.progress_percentage || 0;
  const answeredCount = progress?.total_questions || 0;
  const recentExam = progress?.recent_visits?.exam;

  return (
    <Card className="flex items-center gap-4 mb-5 shadow-card">
      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
        <Zap size={22} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted mb-0.5">ادامه بده</p>
        <p className="text-sm font-bold truncate">مسیر یادگیری فعال</p>
        <p className="text-xs text-text-secondary mt-0.5">
          {recentExam
            ? `آخرین فعالیت: ${recentExam.title}${recentExam.score != null ? ` · نتیجه ${recentExam.score}%` : ""}`
            : answeredCount > 0
              ? `تا کنون ${answeredCount} پاسخ ثبت شده است`
              : "هنوز فعالیتی ثبت نشده است"}
        </p>
        <ProgressBar value={successRate} showLabel className="mt-2" />
      </div>
      <Link href={recentExam ? "/dashboard/exams" : "/dashboard/questions"}>
        <Button variant="primary" size="sm" className="shrink-0">
          <ClipboardCheck size={15} /> ادامه ←
        </Button>
      </Link>
    </Card>
  );
}
