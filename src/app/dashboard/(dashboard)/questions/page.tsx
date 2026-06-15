"use client";

// صفحه سوالات — مهم‌ترین صفحه پروژه
// "use client" چون کاربر با گزینه‌ها تعامل می‌کند و state داریم

import { useState } from "react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CodeBlock from "@/components/ui/CodeBlock";
import ProgressBar from "@/components/ui/ProgressBar";
import { cn, getSubjectColor } from "@/lib/utils";
import { SUBJECT_LABELS, DIFFICULTY_LABELS, type Subject, type Difficulty } from "@/types";

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

const subjects: Subject[] = ["algorithm", "data-structure", "os", "network", "database"];
const difficulties: Difficulty[] = ["beginner", "intermediate", "advanced"];

// ─── کامپوننت گزینه ──────────────────────────
interface OptionItemProps {
  id: string;
  text: string;
  letter: string;
  // وضعیت: انتخاب‌شده، درست، اشتباه، یا عادی
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
        // استایل هر وضعیت
        state === "default"  && "border-border hover:border-primary/40 hover:bg-primary/3",
        state === "selected" && "border-primary bg-primary/5",
        state === "correct"  && "border-success bg-green-50",
        state === "wrong"    && "border-danger bg-red-50"
      )}
    >
      {/* حرف گزینه */}
      <span className={cn(
        "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0",
        state === "default"  && "border border-border text-text-muted",
        state === "selected" && "border border-primary text-primary",
        state === "correct"  && "bg-success text-white",
        state === "wrong"    && "bg-danger text-white"
      )}>
        {letter}
      </span>

      <span className="text-sm flex-1">{text}</span>

      {/* نشانگر درست/اشتباه */}
      {state === "correct" && <span className="text-success text-xs font-bold">✓</span>}
      {state === "wrong"   && <span className="text-danger text-xs font-bold">✗</span>}
    </button>
  );
}

// ─── صفحه اصلی سوالات ────────────────────────
export default function QuestionsPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [personalNote, setPersonalNote] = useState("");
  const [activeSubject, setActiveSubject] = useState<Subject | "all">("all");

  const letters = ["الف", "ب", "ج", "د"];

  // وضعیت هر گزینه را مشخص می‌کند
  function getOptionState(optionId: string): OptionItemProps["state"] {
    if (!showAnswer) {
      return selectedOption === optionId ? "selected" : "default";
    }
    if (optionId === sampleQuestion.correctOptionId) return "correct";
    if (optionId === selectedOption) return "wrong";
    return "default";
  }

  function handleSelectOption(optionId: string) {
    if (showAnswer) return; // بعد از نمایش پاسخ قابل تغییر نیست
    setSelectedOption(optionId);
  }

  function handleRevealAnswer() {
    if (!selectedOption) return; // باید قبلاً گزینه انتخاب شده باشد
    setShowAnswer(true);
  }

  const subjectColors = getSubjectColor(sampleQuestion.subject);

  return (
    <div>
      <Header title="سوالات" subtitle="الگوریتم — گراف" />

      <div className="flex gap-0">

        {/* ─── سایدبار فیلتر ─── */}
        <aside className="w-48 min-h-screen border-l border-border bg-surface p-4 flex-shrink-0">
          <p className="text-xs font-bold text-text-muted mb-4">فیلترها</p>

          {/* فیلتر درس */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-text-muted mb-2">درس</p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveSubject("all")}
                className={cn(
                  "text-right px-2 py-1.5 rounded text-xs transition-colors",
                  activeSubject === "all"
                    ? "bg-primary/8 text-primary font-semibold"
                    : "text-text-secondary hover:text-primary"
                )}
              >
                همه دروس
              </button>
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSubject(s)}
                  className={cn(
                    "text-right px-2 py-1.5 rounded text-xs transition-colors",
                    activeSubject === s
                      ? "bg-primary/8 text-primary font-semibold"
                      : "text-text-secondary hover:text-primary"
                  )}
                >
                  {SUBJECT_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* فیلتر سطح */}
          <div>
            <p className="text-xs font-semibold text-text-muted mb-2">سطح</p>
            <div className="flex flex-col gap-1">
              {difficulties.map((d) => (
                <button
                  key={d}
                  className="text-right px-2 py-1.5 rounded text-xs
                             text-text-secondary hover:text-primary transition-colors"
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ─── محتوای اصلی ─── */}
        <main className="flex-1 p-6">

          {/* header سوال */}
          <div className="flex items-center justify-between mb-4">
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

            {/* نوار پیشرفت */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">پیشرفت</span>
              <ProgressBar value={35} showLabel className="w-24" />
            </div>
          </div>

          {/* کارت سوال */}
          <div className="bg-surface border border-border rounded-lg p-6">

            {/* متن سوال */}
            <p className="text-base font-bold leading-relaxed mb-5">
              {sampleQuestion.text}
            </p>

            {/* گزینه‌ها */}
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

            {/* ─── پاسخ تشریحی ─── */}
            {/* showAnswer با انیمیشن ظاهر می‌شود */}
            {showAnswer && (
              <div className="border border-primary/20 bg-primary/3 rounded-md p-4 mb-4">
                <p className="text-sm font-bold text-primary mb-2">✅ پاسخ تشریحی</p>
                <p className="text-sm text-text-secondary leading-relaxed mb-3">
                  {sampleQuestion.explanation}
                </p>
                {/* کد نمونه */}
                {sampleQuestion.codeExample && (
                  <CodeBlock
                    code={sampleQuestion.codeExample}
                    language="python"
                    title="پیاده‌سازی BFS"
                  />
                )}
              </div>
            )}

            {/* ─── یادداشت شخصی ─── */}
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

            {/* ─── دکمه‌های اکشن ─── */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {/* دکمه ذخیره */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSaved(!isSaved)}
                  className={isSaved ? "border-primary text-primary" : ""}
                >
                  {isSaved ? "🔖 ذخیره شد" : "🔖 ذخیره"}
                </Button>

                {/* دکمه نمایش پاسخ — فقط وقتی گزینه انتخاب شده */}
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

              {/* ناوبری سوالات */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">← قبلی</Button>
                <Button variant="primary" size="sm">بعدی ←</Button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}