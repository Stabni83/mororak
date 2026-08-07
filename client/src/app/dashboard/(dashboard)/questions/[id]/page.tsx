"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Bookmark, ArrowRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function QuestionReaderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const questionId = Number(id);
  const [q, setQ] = useState<any>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.questions.get(questionId)
      .then(setQ)
      .catch(e => setError(e?.message || "خطا در دریافت سؤال"))
      .finally(() => setLoading(false));
  }, [questionId]);

  async function toggleSave() {
    const r = await api.questions.save(questionId);
    setQ((v: any) => ({ ...v, is_saved: r.is_saved }));
  }

  async function answer(optionId: number) {
    if (answering) return;
    setSelected(optionId);
    setAnswering(true);
    try {
      const r = await api.questions.answer(questionId, optionId);
      setResult(r);
    } catch (e: any) {
      setError(e?.message || "ثبت پاسخ انجام نشد");
    } finally {
      setAnswering(false);
    }
  }

  if (loading) return <div className="p-10 text-center"><Loader2 className="mx-auto animate-spin text-primary" /></div>;
  if (error || !q) return <div className="p-10 text-center text-sm text-danger">{error || "سؤال یافت نشد"}</div>;

  return (
    <div>
      <Header title="سؤال ذخیره‌شده" subtitle="این سؤال را همین‌جا پاسخ بده و تحلیلش را ببین" />
      <main className="p-6 max-w-3xl mx-auto">
        <Card>
          <div className="flex justify-between items-start gap-3">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowRight size={15}/> بازگشت
            </Button>
            <Button variant="outline" size="sm" onClick={() => void toggleSave()} className={q.is_saved ? "border-primary text-primary" : ""}>
              <Bookmark size={14} fill={q.is_saved ? "currentColor" : "none"}/>
              {q.is_saved ? "ذخیره‌شده" : "ذخیره"}
            </Button>
          </div>

          <div className="mt-6">
            <p className="text-lg font-bold leading-8">{q.text}</p>
            <div className="mt-6 space-y-3">
              {(q.options || []).map((option: any, i: number) => {
                const text = typeof option === "string" ? option : option.text;
                const isSelected = selected === i;
                const isCorrect = result && result.correct_option_id === i;
                const isWrongSelected = result && isSelected && !result.is_correct;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => void answer(i)}
                    disabled={answering || Boolean(result)}
                    className={`w-full text-right p-4 rounded-xl border transition-all ${
                      isCorrect
                        ? "border-emerald-500 bg-emerald-50"
                        : isWrongSelected
                          ? "border-red-500 bg-red-50"
                          : isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm leading-7">{text}</span>
                      {isCorrect && <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
                      {isWrongSelected && <XCircle size={18} className="text-red-600 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {result && (
            <div className={`mt-6 rounded-xl border p-5 ${result.is_correct ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {result.is_correct ? <CheckCircle2 size={18} className="text-emerald-600" /> : <XCircle size={18} className="text-red-600" />}
                {result.is_correct ? "پاسخ شما درست بود" : "پاسخ شما نادرست بود"}
              </div>
              <p className="mt-3 text-sm leading-7">
                <strong>تحلیل پاسخ:</strong> {result.explanation || q.explanation || "تحلیلی برای این سؤال ثبت نشده است."}
              </p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
