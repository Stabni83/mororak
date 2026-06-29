"use client";

// صفحه سوالات — مهم‌ترین صفحه پروژه

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CodeBlock from "@/components/ui/CodeBlock";
import ProgressBar from "@/components/ui/ProgressBar";
import { cn, getSubjectColor } from "@/lib/utils";
import { SUBJECT_LABELS, DIFFICULTY_LABELS, type Subject, type Difficulty } from "@/types";
import { Search, CheckCircle2, Bookmark, Check, X } from "lucide-react";

// ─── داده نمونه یک سوال ──────────────────────
// TODO: از API دریافت می‌شود
const sampleQuestion = {
  id: "q1",
  subject: "algorithm" as Subject,
  difficulty: "intermediate" as Difficulty,
  text: "پیچیدگی زمانی الگوریتم BFS روی یک گراف با V راس و E یال چقدر است؟",
  options: [
    { id: "a", text: "O(V²)" },
    { id: "b", text: "O(V + E)" },
    { id: "c", text: "O(E log V)" },
    { id: "d", text: "O(V log E)" },
  ],
  correctOptionId: "b",
  explanation:
    "در BFS هر راس دقیقاً یک بار بازدید می‌شود که O(V) هزینه دارد. همچنین هر یال یک بار بررسی می‌شود که O(E) هزینه دارد. در مجموع پیچیدگی O(V + E) است.",
  codeExample: `from collections import deque

def bfs(graph: dict, start: str) -> list:
    """پیمایش BFS روی گراف"""
    visited = set()      # O(V) فضا
    queue = deque([start])
    result = []

    while queue:          # هر راس یک بار: O(V)
        node = queue.popleft()
        if node not in visited:
            visited.add(node)
            result.append(node)
            # هر یال یک بار بررسی می‌شود: O(E)
            queue.extend(graph.get(node, []))

    return result  # پیچیدگی کل: O(V + E)`,
};

const difficulties: Difficulty[] = ["beginner", "intermediate", "advanced"];

// ─── کامپوننت گزینه ──────────────────────────
interface OptionItemProps {
  id: string;
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
        state === "default"  && "border-border hover:border-primary/40 hover:bg-primary/3",
        state === "selected" && "border-primary bg-primary/5",
        state === "correct"  && "border-success bg-green-50",
        state === "wrong"    && "border-danger bg-red-50"
      )}
    >
      <span className={cn(
        "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
        state === "default"  && "border border-border text-text-muted",
        state === "selected" && "border border-primary text-primary",
        state === "correct"  && "bg-success text-white",
        state === "wrong"    && "bg-danger text-white"
      )}>
        {letter}
      </span>

      <span className="text-sm flex-1">{text}</span>

      {state === "correct" && <Check size={14} className="text-success" strokeWidth={3} />}
      {state === "wrong"   && <X size={14} className="text-danger" strokeWidth={3} />}
    </button>
  );
}

// ─── صفحه اصلی سوالات ────────────────────────
export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject") as Subject | null;

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [personalNote, setPersonalNote] = useState("");
  const [activeSubject, setActiveSubject] = useState<Subject | "all">(subjectParam ?? "all");
  const [search, setSearch] = useState("");

  // وقتی از سایدبار subject جدید انتخاب می‌شود (تغییر URL)، state رو همگام کن
  useEffect(() => {
    setActiveSubject(subjectParam ?? "all");
  }, [subjectParam]);

  const letters = ["الف", "ب", "ج", "د"];

  function getOptionState(optionId: string): OptionItemProps["state"] {
    if (!showAnswer) {
      return selectedOption === optionId ? "selected" : "default";
    }
    if (optionId === sampleQuestion.correctOptionId) return "correct";
    if (optionId === selectedOption) return "wrong";
    return "default";
  }

  function handleSelectOption(optionId: string) {
    if (showAnswer) return;
    setSelectedOption(optionId);
  }

  function handleRevealAnswer() {
    if (!selectedOption) return;
    setShowAnswer(true);
  }

  const subjectColors = getSubjectColor(sampleQuestion.subject);

  return (
    <div>
      <Header title="سوالات" subtitle="الگوریتم — گراف" />

      <div className="p-6 max-w-5xl mx-auto">

        {/* ─── جستجوی بزرگ ─── */}
        <div className="relative mb-6 max-w-2xl mx-auto">
          <Search
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="دنبال چه سوالی هستی؟"
            className="w-full h-12 border border-border rounded-xl bg-surface
                       pr-12 pl-4 text-sm placeholder:text-text-muted shadow-card
                       focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10
                       transition-all"
          />
        </div>

        {/* ─── چیپ‌های دسته‌بندی سریع (مکمل سایدبار) ─── */}
        <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubject("all")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeSubject === "all"
                ? "bg-primary text-white"
                : "bg-surface border border-border text-text-secondary hover:border-primary/40"
            }`}
          >
            همه دروس
          </button>
          {(Object.keys(SUBJECT_LABELS) as Subject[]).map((subject) => (
            <button
              key={subject}
              onClick={() => setActiveSubject(subject)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeSubject === subject
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-secondary hover:border-primary/40"
              }`}
            >
              {SUBJECT_LABELS[subject]}
            </button>
          ))}
        </div>

        {/* ─── چیپ‌های سطح ─── */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-xs text-text-muted shrink-0">سطح:</span>
          {difficulties.map((d) => (
            <button
              key={d}
              className="px-3 py-1 rounded-full text-xs border border-border
                         text-text-secondary hover:border-primary/40 transition-colors"
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>

        {/* header سوال */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="primary"
              className={`${subjectColors.bg} ${subjectColors.text} border-0`}>
              {SUBJECT_LABELS[sampleQuestion.subject]}
            </Badge>
            <Badge variant="neutral">
              {DIFFICULTY_LABELS[sampleQuestion.difficulty]}
            </Badge>
            <span className="text-xs text-text-muted">سوال ۳ از ۲۸</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">پیشرفت</span>
            <ProgressBar value={35} showLabel className="w-24" />
          </div>
        </div>

        {/* کارت سوال */}
        <div className="bg-surface border border-border rounded-lg p-6">

          <p className="text-base font-bold leading-relaxed mb-5">
            {sampleQuestion.text}
          </p>

          <div className="flex flex-col gap-2.5 mb-5">
            {sampleQuestion.options.map((option, i) => (
              <OptionItem
                key={option.id}
                id={option.id}
                text={option.text}
                letter={letters[i]}
                state={getOptionState(option.id)}
                onClick={() => handleSelectOption(option.id)}
              />
            ))}
          </div>

          {showAnswer && (
            <div className="border border-primary/20 bg-primary/3 rounded-md p-4 mb-4">
              <p className="text-sm font-bold text-primary mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> پاسخ تشریحی
              </p>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">
                {sampleQuestion.explanation}
              </p>
              {sampleQuestion.codeExample && (
                <CodeBlock
                  code={sampleQuestion.codeExample}
                  language="python"
                  title="پیاده‌سازی BFS"
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
                className="w-full border border-border rounded-md p-3 text-sm
                           bg-background text-text placeholder:text-text-muted
                           focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSaved(!isSaved)}
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
                  disabled={!selectedOption}
                >
                  مشاهده پاسخ
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">← قبلی</Button>
              <Button variant="primary" size="sm">بعدی ←</Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}