// src/app/dashboard/(dashboard)/questions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CodeBlock from "@/components/ui/CodeBlock";
import ProgressBar from "@/components/ui/ProgressBar";
import { cn, getSubjectColor } from "@/lib/utils";
import { SUBJECT_LABELS, DIFFICULTY_LABELS, type Subject, type Difficulty } from "@/types";
import { Search, CheckCircle2, Bookmark, Check, X, HelpCircle } from "lucide-react";
import { api } from "@/lib/api";

interface QuestionItem {
  id: string;
  subject: Subject;
  difficulty: Difficulty;
  text: string;
  options: string[];
  correct_option_id?: number;
  explanation?: string;
  code_example?: string;
}

const difficulties: Difficulty[] = ["beginner", "intermediate", "advanced"];

interface OptionItemProps {
  id: number;
  text: string;
  letter: string;
  state: "default" | "selected" | "correct" | "wrong";
  onClick: () => void;
}

function OptionItem({ id, text, letter, state, onClick }: OptionItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={state === "correct" || state === "wrong"}
      className={cn(
        "flex items-center gap-3 w-full p-3 rounded-md border text-right",
        "transition-all duration-150",
        state === "default" && "border-border hover:border-primary/40 hover:bg-primary/3",
        state === "selected" && "border-primary bg-primary/5",
        state === "correct" && "border-success bg-green-50",
        state === "wrong" && "border-danger bg-red-50"
      )}
    >
      <span className={cn(
        "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
        state === "default" && "border border-border text-text-muted",
        state === "selected" && "border border-primary text-primary",
        state === "correct" && "bg-success text-white",
        state === "wrong" && "bg-danger text-white"
      )}>
        {letter}
      </span>

      <span className="text-sm flex-1">{text}</span>

      {state === "correct" && <Check size={14} className="text-success" strokeWidth={3} />}
      {state === "wrong" && <X size={14} className="text-danger" strokeWidth={3} />}
    </button>
  );
}

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject") as Subject | null;

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [personalNote, setPersonalNote] = useState("");
  const [activeSubject, setActiveSubject] = useState<Subject | "all">(subjectParam ?? "all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setActiveSubject(subjectParam ?? "all");
  }, [subjectParam]);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        let data: QuestionItem[] = [];
        if (typeof (api as any).questions?.list === "function") {
          data = await (api as any).questions.list({
            subject: activeSubject !== "all" ? activeSubject : undefined,
            difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined
          });
        } else if (typeof (api as any).get === "function") {
          let endpoint = "/questions?";
          const params = new URLSearchParams();
          if (activeSubject !== "all") params.append("subject", activeSubject);
          if (selectedDifficulty !== "all") params.append("difficulty", selectedDifficulty);
          data = await (api as any).get(endpoint + params.toString());
        }
        setQuestions(data || []);
        setCurrentIndex(0);
        setSelectedOption(null);
        setShowAnswer(false);
        setError(null);
      } catch (err: any) {
        setError(err.message || "خطا در دریافت سوالات");
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [activeSubject, selectedDifficulty]);

  const currentQuestion = questions[currentIndex];
  const letters = ["الف", "ب", "ج", "د"];

  function getOptionState(optionIndex: number): OptionItemProps["state"] {
    if (!showAnswer) {
      return selectedOption === optionIndex ? "selected" : "default";
    }
    if (optionIndex === currentQuestion?.correct_option_id) return "correct";
    if (optionIndex === selectedOption) return "wrong";
    return "default";
  }

  function handleSelectOption(optionIndex: number) {
    if (showAnswer) return;
    setSelectedOption(optionIndex);
  }

  async function handleRevealAnswer() {
    if (selectedOption === null || !currentQuestion) return;
    try {
      if (typeof (api as any).questions?.answer === "function") {
        await (api as any).questions.answer(currentQuestion.id, selectedOption);
      } else if (typeof (api as any).post === "function") {
        await (api as any).post(`/questions/${currentQuestion.id}/answer`, { selected_option_id: selectedOption });
      }
      setShowAnswer(true);
    } catch (err: any) {
      setShowAnswer(true);
    }
  }

  async function handleToggleSave() {
    if (!currentQuestion) return;
    try {
      if (typeof (api as any).questions?.save === "function") {
        await (api as any).questions.save(currentQuestion.id);
      } else if (typeof (api as any).post === "function") {
        await (api as any).post(`/questions/${currentQuestion.id}/save`);
      }
      setIsSaved(!isSaved);
    } catch (err: any) {
      setIsSaved(!isSaved);
    }
  }

  const subjectColors = currentQuestion ? getSubjectColor(currentQuestion.subject) : { bg: "bg-primary/10", text: "text-primary" };

  return (
    <div>
      <Header title="سوالات" subtitle={currentQuestion ? SUBJECT_LABELS[currentQuestion.subject] : "مرور سوالات"} />

      <div className="p-6 max-w-5xl mx-auto">
        <div className="relative mb-6 max-w-2xl mx-auto">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="دنبال چه سوالی هستی؟"
            className="w-full h-12 border border-border rounded-xl bg-surface pr-12 pl-4 text-sm placeholder:text-text-muted shadow-card focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>

        <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubject("all")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeSubject === "all" ? "bg-primary text-white" : "bg-surface border border-border text-text-secondary"
            }`}
          >
            همه دروس
          </button>
          {(Object.keys(SUBJECT_LABELS) as Subject[]).map((subject) => (
            <button
              key={subject}
              onClick={() => setActiveSubject(subject)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeSubject === subject ? "bg-primary text-white" : "bg-surface border border-border text-text-secondary"
              }`}
            >
              {SUBJECT_LABELS[subject]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-xs text-text-muted shrink-0">سطح:</span>
          <button
            onClick={() => setSelectedDifficulty("all")}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${selectedDifficulty === "all" ? "bg-primary text-white border-primary" : "border-border text-text-secondary"}`}
          >
            همه
          </button>
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${selectedDifficulty === d ? "bg-primary text-white border-primary" : "border-border text-text-secondary"}`}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-64 bg-surface/50 border border-border rounded-lg animate-pulse" />
        ) : error ? (
          <div className="p-6 bg-danger/10 border border-danger/20 text-danger rounded-lg text-center text-sm">{error}</div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <HelpCircle size={36} className="text-text-muted mb-3" />
            <p className="text-sm font-semibold mb-1">سوالی یافت نشد</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="primary" className={`${subjectColors.bg} ${subjectColors.text} border-0`}>
                  {SUBJECT_LABELS[currentQuestion.subject]}
                </Badge>
                <Badge variant="neutral">
                  {DIFFICULTY_LABELS[currentQuestion.difficulty]}
                </Badge>
                <span className="text-xs text-text-muted">سوال {currentIndex + 1} از {questions.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">پیشرفت</span>
                <ProgressBar value={Math.round(((currentIndex + 1) / questions.length) * 100)} showLabel className="w-24" />
              </div>
            </div>

            <div className="bg-surface border border-border rounded-lg p-6">
              <p className="text-base font-bold leading-relaxed mb-5">
                {currentQuestion.text}
              </p>

              <div className="flex flex-col gap-2.5 mb-5">
                {currentQuestion.options.map((optText, i) => (
                  <OptionItem
                    key={i}
                    id={i}
                    text={optText}
                    letter={letters[i] || String(i + 1)}
                    state={getOptionState(i)}
                    onClick={() => handleSelectOption(i)}
                  />
                ))}
              </div>

              {showAnswer && (
                <div className="border border-primary/20 bg-primary/3 rounded-md p-4 mb-4">
                  <p className="text-sm font-bold text-primary mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> پاسخ تشریحی
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed mb-3">
                    {currentQuestion.explanation || "توضیحی ثبت نشده است."}
                  </p>
                  {currentQuestion.code_example && (
                    <CodeBlock
                      code={currentQuestion.code_example}
                      language="python"
                      title="نمونه کد"
                    />
                  )}
                </div>
              )}

              {showAnswer && (
                <div className="mb-4">
                  <label className="text-xs font-semibold text-text-muted block mb-1.5">
                    یادداشت شخصی
                  </label>
                  <textarea
                    value={personalNote}
                    onChange={(e) => setPersonalNote(e.target.value)}
                    placeholder="نکته‌ای که می‌خوای یادت بمونه رو بنویس..."
                    rows={2}
                    className="w-full border border-border rounded-md p-3 text-sm bg-background text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleSave}
                    className={isSaved ? "border-primary text-primary" : ""}
                  >
                    <span className="flex items-center gap-1.5">
                      <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
                      {isSaved ? "ذخیره شد" : "ذخیره"}
                    </span>
                  </Button>

                  {!showAnswer && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRevealAnswer}
                      disabled={selectedOption === null}
                    >
                      مشاهده پاسخ
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentIndex > 0) {
                        setCurrentIndex(currentIndex - 1);
                        setSelectedOption(null);
                        setShowAnswer(false);
                      }
                    }}
                    disabled={currentIndex === 0}
                  >
                    ← قبلی
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (currentIndex < questions.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                        setSelectedOption(null);
                        setShowAnswer(false);
                      }
                    }}
                    disabled={currentIndex === questions.length - 1}
                  >
                    بعدی ←
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}