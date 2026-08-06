// client/src/components/dashboard/ContinueLearning.tsx
"use client";

import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Zap } from "lucide-react";

interface ContinueLearningProps {
  progress: {
    progress_percentage?: number;
    total_questions?: number;
  } | null;
}

export default function ContinueLearning({ progress }: ContinueLearningProps) {
  const successRate = progress?.progress_percentage || 0;
  const answeredCount = progress?.total_questions || 0;

  return (
    <Card className="flex items-center gap-4 mb-5 shadow-card">
      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
        <Zap size={22} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted mb-0.5">ادامه بده</p>
        <p className="text-sm font-bold truncate">مسیر یادگیری فعال</p>
        <p className="text-xs text-text-secondary mt-0.5">
          {answeredCount > 0 ? `تا کنون ${answeredCount} سوال ثبت شده است` : "هنوز سوالی ثبت نکرده‌اید"}
        </p>
        <ProgressBar value={successRate} showLabel className="mt-2" />
      </div>
      <Link href="/dashboard/questions">
        <Button variant="primary" size="sm" className="shrink-0">
          ادامه ←
        </Button>
      </Link>
    </Card>
  );
}