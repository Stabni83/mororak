"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { api } from "@/lib/api";
import { BookOpen, HelpCircle, Loader2, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { SUBJECT_LABELS, type Subject } from "@/types";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"note" | "question">("note");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // فرم جزوه
  const [noteTitle, setNoteTitle] = useState("");
  const [noteSubject, setNoteSubject] = useState<Subject>("algorithm");
  const [noteContent, setNoteContent] = useState("");

  // فرم سوال جدید (مطابق با دیتابیس)
  const [questionSubject, setQuestionSubject] = useState<Subject>("algorithm");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [questionText, setQuestionText] = useState("");
  // آرایه‌ای از گزینه‌ها (مثلاً ۴ گزینه)
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctOptionId, setCorrectOptionId] = useState<number>(0);
  const [explanation, setExplanation] = useState("");
  const [codeExample, setCodeExample] = useState("");

  async function handleCreateNote(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await api.notes.create({ 
        title: noteTitle, 
        subject: noteSubject, 
        content: noteContent 
      });
      
      setSuccessMessage("جزوه با موفقیت ثبت شد!");
      setNoteTitle("");
      setNoteContent("");
    } catch (err: any) {
      setErrorMessage(err.message || "خطا در ثبت جزوه");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateQuestion(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    // بررسی اینکه گزینه‌ها خالی نباشند
    if (options.some(opt => opt.trim() === "")) {
      setErrorMessage("لطفاً متن تمام گزینه‌ها را پر کنید.");
      setLoading(false);
      return;
    }

    try {
      // ارسال داده‌ها دقیقاً مطابق با ستون‌های دیتابیس
      await api.questions.create({ 
        subject: questionSubject,
        difficulty: difficulty,
        text: questionText,
        options: options, // ذخیره به صورت JSON در دیتابیس
        correct_option_id: correctOptionId,
        explanation: explanation,
        code_example: codeExample || null
      });
      
      setSuccessMessage("سوال چهارگزینه‌ای با موفقیت ثبت شد!");
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectOptionId(0);
      setExplanation("");
      setCodeExample("");
    } catch (err: any) {
      setErrorMessage(err.message || "خطا در ثبت سوال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="پنل مدیریت ادمین" subtitle="بارگذاری محتوا، جزوات و سوالات" />

      <div className="p-6 max-w-4xl mx-auto w-full flex-1">
        {/* تب‌های جابجایی */}
        <div className="flex gap-4 mb-6 border-b border-border pb-3">
          <button
            onClick={() => { setActiveTab("note"); setSuccessMessage(""); setErrorMessage(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "note"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:bg-primary/5 hover:text-primary"
            }`}
          >
            <BookOpen size={18} />
            <span>افزودن جزوه جدید</span>
          </button>
          
          <button
            onClick={() => { setActiveTab("question"); setSuccessMessage(""); setErrorMessage(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "question"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:bg-primary/5 hover:text-primary"
            }`}
          >
            <HelpCircle size={18} />
            <span>افزودن سوال جدید</span>
          </button>
        </div>

        {/* پیغام‌های موفقیت یا خطا */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* کارت فرم */}
        <Card className="p-6 md:p-8">
          {activeTab === "note" ? (
            <form onSubmit={handleCreateNote} className="flex flex-col gap-5 text-right">
              <h2 className="text-lg font-bold text-text border-b border-border pb-3">ثبت جزوه آموزشی جدید</h2>
              
              <Input
                label="عنوان جزوه"
                type="text"
                placeholder="مثلاً: خلاصه فصل اول ساختمان داده"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text">انتخاب درس</label>
                <select
                  value={noteSubject}
                  onChange={(e) => setNoteSubject(e.target.value as Subject)}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {Object.entries(SUBJECT_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text">محتوای کامل جزوه</label>
                <textarea
                  rows={8}
                  placeholder="متن، توضیحات و نکات مهم جزوه را اینجا وارد کنید..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl p-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
                  required
                />
              </div>

              <Button type="submit" variant="primary" disabled={loading} className="flex items-center justify-center gap-2 mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "انتشار جزوه"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCreateQuestion} className="flex flex-col gap-5 text-right">
              <h2 className="text-lg font-bold text-text border-b border-border pb-3">ثبت سوال چهارگزینه‌ای جدید</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text">انتخاب درس</label>
                  <select
                    value={questionSubject}
                    onChange={(e) => setQuestionSubject(e.target.value as Subject)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {Object.entries(SUBJECT_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text">سطح سختی</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="easy">آسان</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">سخت</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text">صورت سوال</label>
                <textarea
                  rows={4}
                  placeholder="متن سوال را اینجا بنویسید..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl p-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
                  required
                />
              </div>

              {/* مدیریت گزینه‌ها و مشخص کردن پاسخ صحیح */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-text">گزینه‌ها (تیک گزینه صحیح را انتخاب کنید)</label>
                {options.map((optionText, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctOptionId === index}
                      onChange={() => setCorrectOptionId(index)}
                      className="w-4 h-4 text-primary focus:ring-primary/20 cursor-pointer"
                      title="انتخاب به عنوان پاسخ صحیح"
                    />
                    <input
                      type="text"
                      placeholder={`گزینه ${index + 1}`}
                      value={optionText}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        setOptions(newOptions);
                      }}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOptions = options.filter((_, i) => i !== index);
                          setOptions(newOptions);
                          if (correctOptionId >= index && correctOptionId > 0) {
                            setCorrectOptionId(correctOptionId - 1);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="حذف گزینه"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setOptions([...options, ""])}
                    className="self-start flex items-center gap-1 text-xs text-primary font-semibold mt-1 hover:underline"
                  >
                    <Plus size={14} /> افزودن گزینه جدید
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text">توضیح پاسخ (تشریحی)</label>
                <textarea
                  rows={3}
                  placeholder="چرا این گزینه درست است؟ توضیح دهید..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl p-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text">مثال کد (اختیاری)</label>
                <textarea
                  rows={3}
                  placeholder="کد یا الگوریتم مرتبط با سوال (اختیاری)..."
                  value={codeExample}
                  onChange={(e) => setCodeExample(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl p-3 text-sm font-mono text-text focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
                />
              </div>

              <Button type="submit" variant="primary" disabled={loading} className="flex items-center justify-center gap-2 mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ذخیره سوال"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}