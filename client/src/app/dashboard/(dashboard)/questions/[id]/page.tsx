// client/src/app/dashboard/(dashboard)/exams/page.tsx
"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { SUBJECT_LABELS, type Subject } from "@/types";
import { Clock, CheckCircle2, Award, Play } from "lucide-react";
import { api } from "@/lib/api";

export default function ExamsListPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [examTimer, setExamTimer] = useState(0);

  useEffect(() => {

    async function loadExams() {
      try {
        const questions = await api.questions.list();

        const grouped = questions.reduce((acc: any, q: any) => {
          if (!acc[q.subject]) acc[q.subject] = [];
          acc[q.subject].push(q);
          return acc;
        }, {});

        const examList = Object.keys(grouped).map((subj) => ({
          id: subj,
          title: `آزمون تخصصی ${SUBJECT_LABELS[subj as Subject] || subj}`,
          subject: subj,
          questions: grouped[subj],
        }));
        setExams(examList);
      } catch (err) {
        console.error("Error loading exams:", err);
      }
    }
    loadExams();
  }, []);


  useEffect(() => {
    let timer: any;
    if (selectedExam && !submitted) {
      timer = setInterval(() => setExamTimer((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [selectedExam, submitted]);

  if (selectedExam) {
    const questions = selectedExam.questions;
    const currentQ = questions[currentQuestionIndex];

    return (
      <div>
        <Header title={selectedExam.title} subtitle="در حال برگزاری آزمون" />
        <div className="p-6 max-w-3xl mx-auto">
          <Card className="flex items-center justify-between mb-4 bg-surface">
            <span className="text-xs text-text-muted">سوال {currentQuestionIndex + 1} از {questions.length}</span>
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Clock size={16} />
              {String(Math.floor(examTimer / 60)).padStart(2, "0")}:{String(examTimer % 60).padStart(2, "0")}
            </div>
          </Card>

          <Card className="mb-4">
            <p className="text-base font-bold mb-4">{currentQ.text}</p>
            <div className="flex flex-col gap-2.5">
              {currentQ.options.map((opt: string, idx: number) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: idx })}
                    className={`p-3 text-right rounded-lg border text-sm transition-all ${
                      isSelected ? "border-primary bg-primary/10 font-bold" : "border-border hover:border-primary/40"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              قبلی
            </Button>
            {currentQuestionIndex < questions.length - 1 ? (
              <Button 
                variant="primary" 
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              >
                بعدی
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={() => setSubmitted(true)}
              >

              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="آزمون‌ها" subtitle="انتخاب و شرکت در آزمون‌های تخصصی" />
      <div className="p-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map((exam) => (
          <Card key={exam.id} hoverable className="flex flex-col justify-between">
            <div>
              <Badge variant="primary" className="mb-2">{SUBJECT_LABELS[exam.subject as keyof typeof SUBJECT_LABELS] || exam.subject}</Badge>
              <h3 className="text-sm font-bold mb-1">{exam.title}</h3>
              <p className="text-xs text-text-muted mb-4">تعداد سوالات: {exam.questions.length} سوال</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setSelectedExam(exam)} className="w-full">
              <Play size={14} /> شروع آزمون
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}