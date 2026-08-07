"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { ExamDetail, ExamResult, PracticeAnswerResult } from "@/types/exam";
import { Bookmark, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Eye, ListChecks, XCircle } from "lucide-react";

type AnswerMap = Record<string, number>;
type AnalysisMap = Record<string, PracticeAnswerResult>;

function optionData(option: any, index: number) {
  return {
    id: typeof option === "string" ? index : Number(option.id),
    text: typeof option === "string" ? option : option.text,
  };
}

export default function ExamRunner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [analysis, setAnalysis] = useState<AnalysisMap>({});
  const [index, setIndex] = useState(0);
  const [viewAll, setViewAll] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [elapsedPractice, setElapsedPractice] = useState(0);
  const [practiceScore, setPracticeScore] = useState(0);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingQuestion, setSavingQuestion] = useState<number | null>(null);
  const [savedQuestions, setSavedQuestions] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const examData = await api.exams.get(Number(id)) as ExamDetail;
        if (!active) return;
        setExam(examData);
        setSavedQuestions(Object.fromEntries(examData.questions.map(item => [item.question.id, Boolean(item.question.is_saved)])));
        const attempt = await api.exams.start(Number(id));
        if (!active) return;
        if (attempt?.id) setAttemptId(attempt.id);
        const startedAt = attempt?.started_at ? new Date(attempt.started_at).getTime() : Date.now();
        const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
        if (examData.exam_type === "timed") {
          setRemaining(Math.max(0, (examData.time_limit_seconds || 0) - elapsed));
        } else {
          setRemaining(null);
          setElapsedPractice(elapsed);
          setPracticeScore(Number(attempt?.score || 0));
        }
      } catch (err: any) {
        if (active) setError(err?.message || "شروع آزمون با خطای سرور مواجه شد.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (!exam || exam.exam_type !== "practice" || result) return;
    const timer = window.setInterval(() => setElapsedPractice(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [exam, result]);

  useEffect(() => {
    if (!exam || exam.exam_type !== "timed" || result || remaining === null) return;
    if (remaining <= 0) {
      void finishTimed();
      return;
    }
    const timer = window.setInterval(() => setRemaining(value => value === null ? null : Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [exam, remaining, result]);

  const current = exam?.questions[index];
  const answeredCount = Object.keys(answers).length;
  const percent = exam ? Math.round((answeredCount / Math.max(1, exam.question_count)) * 100) : 0;


  async function selectAnswer(questionId: number, optionId: number) {
    if (!exam || submitting) return;
    setAnswers(prev => ({ ...prev, [String(questionId)]: optionId }));

    if (exam.exam_type !== "practice") return;

    try {
      setError(null);
      const response = await api.exams.practiceAnswer(exam.id, questionId, optionId) as PracticeAnswerResult;
      setAnalysis(prev => ({ ...prev, [String(questionId)]: response }));
      setPracticeScore(Number(response.attempt?.score || 0));
      setElapsedPractice(Number(response.attempt?.duration_seconds || elapsedPractice));
    } catch (err: any) {
      setError(err?.message || "ثبت پاسخ انجام نشد.");
    }
  }

  async function toggleQuestionSave(questionId: number) {
    try {
      setSavingQuestion(questionId);
      const response = await api.questions.save(questionId);
      setSavedQuestions(prev => ({ ...prev, [questionId]: response.is_saved }));
    } catch (err: any) {
      setError(err?.message || "ذخیره سؤال انجام نشد.");
    } finally {
      setSavingQuestion(null);
    }
  }

  async function finishTimed() {
    if (!exam || exam.exam_type !== "timed" || !attemptId || result || submitting) return;
    try {
      setSubmitting(true);
      setError(null);
      const data = await api.exams.submit(exam.id, attemptId, answers) as ExamResult;
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "ثبت نتیجه آزمون انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-sm text-text-muted">در حال دریافت آزمون...</div>;

  if (error && !exam) return (
    <div>
      <Header title="خطا در آزمون" />
      <main className="p-6 max-w-2xl mx-auto"><section className="rounded-xl border border-danger/20 bg-danger/5 p-8 text-center"><p className="text-sm text-danger leading-7">{error}</p><button onClick={() => window.location.reload()} className="mt-5 rounded-lg bg-primary text-white px-6 py-2.5 text-sm">تلاش دوباره</button></section></main>
    </div>
  );

  if (!exam) return <div className="p-8 text-center">آزمون یافت نشد.</div>;

  if (result) return (
    <div>
      <Header title="نتیجه آزمون" subtitle={exam.title} />
      <main className="p-6 max-w-4xl mx-auto">
        <Card className="p-7 text-center">
          <h1 className="text-xl font-bold">{exam.title}</h1>
          <div className="mt-6 text-4xl font-extrabold text-primary">{result.score ?? 0}%</div>
          <div className="grid grid-cols-3 gap-3 mt-7">
            <div className="rounded-lg bg-success/10 p-4"><CheckCircle2 className="mx-auto text-success"/><strong className="block mt-2">{result.correct_count}</strong><span className="text-xs text-text-muted">صحیح</span></div>
            <div className="rounded-lg bg-danger/10 p-4"><XCircle className="mx-auto text-danger"/><strong className="block mt-2">{result.wrong_count}</strong><span className="text-xs text-text-muted">غلط</span></div>
            <div className="rounded-lg bg-primary/10 p-4"><strong className="block mt-1 text-primary">{result.unanswered_count}</strong><span className="text-xs text-text-muted">بی‌پاسخ</span></div>
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={() => router.push("/dashboard/exams")}>بازگشت به آزمون‌ها</Button>
            <Button variant="outline" onClick={() => { setResult(null); setIndex(0); }}>مرور پاسخ‌ها</Button>
          </div>
        </Card>

        <Card className="mt-5">
          <div className="flex items-center gap-2 mb-4"><ListChecks size={18} className="text-primary"/><h2 className="font-bold text-sm">تحلیل پاسخ‌ها</h2></div>
          <div className="space-y-4">
            {exam.questions.map((item, i) => {
              const answer = result.answers[String(item.question.id)];
              return <div key={item.id} className="rounded-xl border border-border p-4">
                <div className="text-xs text-text-muted">سؤال {i + 1}</div>
                <p className="mt-1 text-sm font-semibold leading-7">{item.question.text}</p>
                <div className={`mt-3 rounded-lg p-3 text-xs ${answer?.is_correct ? "bg-success/10 text-success" : answer?.selected_option_id == null ? "bg-background text-text-muted" : "bg-danger/10 text-danger"}`}>
                  {answer?.is_correct ? "پاسخ صحیح بود." : answer?.selected_option_id == null ? "این سؤال بی‌پاسخ ماند." : "پاسخ انتخابی صحیح نبود."}
                </div>
                {item.question.explanation && <p className="mt-3 text-xs text-text-secondary leading-7"><strong>تحلیل:</strong> {item.question.explanation}</p>}
              </div>;
            })}
          </div>
        </Card>
      </main>
    </div>
  );

  const renderQuestion = (item: typeof exam.questions[number], questionIndex: number) => {
    const questionId = item.question.id;
    const selected = answers[String(questionId)];
    const response = analysis[String(questionId)];
    const options = item.question.options || [];
    const saved = savedQuestions[questionId] || false;

    return (
      <Card key={item.id} className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-text-muted">سؤال {questionIndex + 1}</div>
            <h2 className="mt-2 text-lg font-bold leading-8">{item.question.text}</h2>
          </div>
          <button type="button" onClick={() => void toggleQuestionSave(questionId)} disabled={savingQuestion === questionId} className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${saved ? "border-primary bg-primary/10 text-primary" : "border-border text-text-secondary hover:border-primary/40 hover:text-primary"}`}>
            <Bookmark size={15} fill={saved ? "currentColor" : "none"} /> {saved ? "ذخیره‌شده" : "ذخیره سؤال"}
          </button>
        </div>

        <div className="mt-6 space-y-2">
          {options.map((option: any, optionIndex: number) => {
            const itemOption = optionData(option, optionIndex);
            const isSelected = selected === itemOption.id;
            const isCorrect = exam.exam_type === "practice" && item.question.correct_option_id === itemOption.id;
            return <button key={itemOption.id} type="button" onClick={() => void selectAnswer(questionId, itemOption.id)} className={`w-full text-right p-3.5 rounded-xl border text-sm transition-all ${isSelected ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"} ${exam.exam_type === "practice" && response && isCorrect ? "border-success bg-success/10 text-success" : ""}`}>
              {itemOption.text}
            </button>;
          })}
        </div>

        {exam.exam_type === "practice" && response && (
          <div className={`mt-5 rounded-xl p-4 ${response.is_correct ? "bg-success/10 border border-success/20" : "bg-danger/10 border border-danger/20"}`}>
            <div className="flex items-center gap-2 text-sm font-bold">{response.is_correct ? <CheckCircle2 size={17} className="text-success"/> : <XCircle size={17} className="text-danger"/>}{response.is_correct ? "پاسخ صحیح" : "پاسخ اشتباه"}</div>
            {response.explanation && <p className="mt-2 text-xs leading-7 text-text-secondary"><strong>تحلیل پاسخ:</strong> {response.explanation}</p>}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div>
      <Header title={exam.title} subtitle={`${exam.author || "مرورک"} · ${exam.exam_type === "practice" ? "کتاب تست بدون زمان" : `${index + 1} از ${exam.question_count}`}`} />
      <main className="p-6 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs text-text-muted">
          <div className="flex items-center gap-4">
            <span>{answeredCount} از {exam.question_count} سؤال پاسخ داده شده</span>
            {exam.exam_type === "practice" && <span className="flex items-center gap-1 text-primary font-semibold"><Clock3 size={15}/>{Math.floor(elapsedPractice / 60)}:{String(elapsedPractice % 60).padStart(2, "0")}</span>}
            {exam.exam_type === "practice" && <span className="font-semibold text-primary">امتیاز: {practiceScore}%</span>}
          </div>
          {remaining !== null && <span className="flex items-center gap-1 text-primary font-semibold"><Clock3 size={15}/>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</span>}
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden mb-5"><div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} /></div>

        {error && <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 p-3 text-xs text-danger">{error}</div>}

        {exam.exam_type === "practice" && (
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 text-xs text-text-muted"><Eye size={15}/> تحلیل پاسخ‌ها بعد از انتخاب گزینه نمایش داده می‌شود.</div>
            <button type="button" onClick={() => setViewAll(v => !v)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold hover:border-primary/40">
              <ListChecks size={15}/>{viewAll ? "نمایش سؤال به سؤال" : "نمایش همه سؤال‌ها"}
            </button>
          </div>
        )}

        {viewAll && exam.exam_type === "practice" ? (
          <div className="space-y-4">{exam.questions.map((item, i) => renderQuestion(item, i))}</div>
        ) : current ? (
          renderQuestion(current, index)
        ) : null}

        <div className="flex items-center justify-between mt-5 gap-3">
          <Button variant="outline" onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={viewAll || index === 0}><ChevronRight size={16}/> قبلی</Button>
          {exam.exam_type === "timed" ? (
            index === exam.questions.length - 1 ? <Button variant="primary" onClick={() => void finishTimed()} disabled={submitting}>{submitting ? "در حال ثبت..." : "پایان آزمون"}</Button> : <Button variant="primary" onClick={() => setIndex(i => i + 1)}>سؤال بعدی <ChevronLeft size={16}/></Button>
          ) : (
            index === exam.questions.length - 1 ? <Button variant="primary" onClick={() => setViewAll(true)}>مشاهده تحلیل‌ها <ListChecks size={16}/></Button> : <Button variant="primary" onClick={() => setIndex(i => i + 1)}>سؤال بعدی <ChevronLeft size={16}/></Button>
          )}
        </div>
        {!viewAll && exam.questions.length > 1 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {exam.questions.map((item, i) => <button key={item.id} type="button" onClick={() => setIndex(i)} className={`w-8 h-8 rounded-full text-xs font-semibold ${i === index ? "bg-primary text-white" : answers[String(item.question.id)] !== undefined ? "bg-primary/10 text-primary" : "bg-surface border border-border text-text-muted"}`}>{i + 1}</button>)}
          </div>
        )}
        {exam.exam_type === "practice" && <p className="mt-6 text-center text-xs text-text-muted">این کتاب تست پایان آزمون ندارد؛ هر پاسخی که می‌دهی همان لحظه ثبت و تحلیل می‌شود.</p>}

        <div className="mt-6 flex justify-start">
          <Button variant="outline" onClick={() => router.back()}><ChevronRight size={16}/> بازگشت</Button>
        </div>
      </main>
    </div>
  );
}
