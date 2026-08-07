"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { api } from "@/lib/api";
import { BookOpen, HelpCircle, ClipboardList, Loader2, CheckCircle2, Plus, Trash2, LibraryBig, Settings2 } from "lucide-react";
import { SUBJECT_LABELS, SUBJECTS, type SubjectItem, type FilterDefinition, type FilterFieldType, type FilterScope } from "@/types";
import type { Question } from "@/types/question";

type Tab = "note" | "question" | "exam" | "catalog";
type ExamQuestionSource = "existing" | "new";

const selectClass = "w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm";
const textareaClass = "w-full bg-surface border border-border rounded-xl p-3 text-sm resize-y";
const fallbackSubjects: SubjectItem[] = SUBJECTS.map((slug, position) => ({ id: position + 1, slug, name: SUBJECT_LABELS[slug], position, is_active: true }));

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(searchParams.get("tab") === "exam" ? "exam" : "note");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [subjects, setSubjects] = useState<SubjectItem[]>(fallbackSubjects);
  const [filters, setFilters] = useState<FilterDefinition[]>([]);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteSubject, setNoteSubject] = useState("algorithm");
  const [noteContent, setNoteContent] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("");

  const [questionSubject, setQuestionSubject] = useState("algorithm");
  const [difficulty, setDifficulty] = useState("beginner");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctOptionId, setCorrectOptionId] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [codeExample, setCodeExample] = useState("");

  const [examTitle, setExamTitle] = useState("");
  const [examAuthor, setExamAuthor] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [examSubject, setExamSubject] = useState("algorithm");
  const [examType, setExamType] = useState<"practice" | "timed">("practice");
  const [timeLimit, setTimeLimit] = useState(30);
  const [questionSource, setQuestionSource] = useState<ExamQuestionSource>("existing");
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [examFilterValues, setExamFilterValues] = useState<Record<string, unknown>>({});

  const [newSubjectSlug, setNewSubjectSlug] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newFilterKey, setNewFilterKey] = useState("");
  const [newFilterName, setNewFilterName] = useState("");
  const [newFilterType, setNewFilterType] = useState<FilterFieldType>("select");
  const [newFilterOptions, setNewFilterOptions] = useState("");
  const [newFilterScope, setNewFilterScope] = useState<FilterScope>("exams");

  const refreshCatalog = async () => {
    const [subjectData, filterData] = await Promise.all([
      api.catalog.subjects(true).catch(() => fallbackSubjects),
      api.catalog.filters("all", true).catch(() => []),
    ]);
    setSubjects(subjectData?.length ? subjectData : fallbackSubjects);
    setFilters(filterData || []);
    if (subjectData?.length && !subjectData.some((s: SubjectItem) => s.slug === examSubject && s.is_active)) setExamSubject(subjectData.find((s: SubjectItem) => s.is_active)?.slug || "algorithm");
  };

  useEffect(() => { void refreshCatalog(); }, []);

  useEffect(() => {
    if (activeTab !== "exam") return;
    if (questionSource === "new") {
      setQuestionSubject(examSubject);
      return;
    }
    api.questions.list({ subject: examSubject, mine: true }).then(setAvailableQuestions).catch(() => setAvailableQuestions([]));
  }, [activeTab, examSubject, questionSource]);

  const resetMessages = () => { setSuccessMessage(""); setErrorMessage(""); };
  const resetQuestionForm = () => { setQuestionText(""); setOptions(["", "", "", ""]); setCorrectOptionId(0); setExplanation(""); setCodeExample(""); };
  const validateQuestion = () => {
    if (!questionText.trim()) return "صورت سؤال را وارد کنید.";
    if (options.length < 2 || options.some((option) => !option.trim())) return "تمام گزینه‌ها باید پر شوند.";
    if (!explanation.trim()) return "توضیح پاسخ را وارد کنید.";
    return null;
  };

  async function createNote(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); resetMessages();
    try { await api.notes.create({ title: noteTitle, subject: noteSubject, content: noteContent, author: noteAuthor.trim() || "مرورک" }); setSuccessMessage("جزوه با موفقیت ثبت شد."); setNoteTitle(""); setNoteContent(""); setNoteAuthor(""); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : "ثبت جزوه ناموفق بود."); }
    finally { setLoading(false); }
  }

  async function createQuestion() {
    const validationError = validateQuestion(); if (validationError) { setErrorMessage(validationError); return; }
    setLoading(true); resetMessages();
    try {
      await api.questions.create({ subject: questionSubject, difficulty, text: questionText.trim(), options, correct_option_id: correctOptionId, explanation: explanation.trim(), code_example: codeExample || null });
      setSuccessMessage("سؤال با موفقیت ثبت شد."); resetQuestionForm();
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "ثبت سؤال ناموفق بود."); }
    finally { setLoading(false); }
  }

  async function createQuestionForExam() {
    const validationError = validateQuestion(); if (validationError) { setErrorMessage(validationError); return; }
    setLoading(true); resetMessages();
    try {
      const question = await api.questions.create<Question>({ subject: examSubject, difficulty, text: questionText.trim(), options, correct_option_id: correctOptionId, explanation: explanation.trim(), code_example: codeExample || null });
      setAvailableQuestions((current) => [question, ...current]); setSelectedQuestions((current) => [...current, question.id]); resetQuestionForm(); setQuestionSource("existing"); setSuccessMessage("سؤال ساخته شد و به آزمون اضافه شد.");
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "ساخت سؤال ناموفق بود."); }
    finally { setLoading(false); }
  }

  async function createExam(e: React.FormEvent) {
    e.preventDefault(); if (!selectedQuestions.length) { setErrorMessage("حداقل یک سؤال به آزمون اضافه کنید."); return; }
    setLoading(true); resetMessages();
    try {
      await api.exams.create({ title: examTitle.trim(), author: examAuthor.trim() || "مرورک", description: examDescription || null, subject: examSubject, exam_type: examType, time_limit_seconds: examType === "timed" ? timeLimit * 60 : null, show_answers_immediately: examType === "practice", is_published: true, filter_values: examFilterValues, questions: selectedQuestions.map((id, index) => ({ question_id: id, position: index + 1, points: 1 })) });
      setSuccessMessage("آزمون با موفقیت ساخته شد."); setExamTitle(""); setExamAuthor(""); setExamDescription(""); setSelectedQuestions([]); setExamFilterValues({});
    } catch (error) { setErrorMessage(error instanceof Error ? error.message : "ساخت آزمون ناموفق بود."); }
    finally { setLoading(false); }
  }

  async function createSubject() {
    if (!newSubjectSlug.trim() || !newSubjectName.trim()) { setErrorMessage("نام و شناسه درس را وارد کنید."); return; }
    setLoading(true); resetMessages();
    try { await api.catalog.createSubject({ slug: newSubjectSlug, name: newSubjectName }); setNewSubjectSlug(""); setNewSubjectName(""); await refreshCatalog(); setSuccessMessage("درس جدید اضافه شد و در فیلترها قرار گرفت."); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : "افزودن درس ناموفق بود."); }
    finally { setLoading(false); }
  }

  async function createFilter() {
    if (!newFilterKey.trim() || !newFilterName.trim()) { setErrorMessage("نام و کلید فیلتر را وارد کنید."); return; }
    setLoading(true); resetMessages();
    try { await api.catalog.createFilter({ key: newFilterKey, name: newFilterName, field_type: newFilterType, options: newFilterOptions.split(",").map(x => x.trim()).filter(Boolean), scope: newFilterScope }); setNewFilterKey(""); setNewFilterName(""); setNewFilterOptions(""); await refreshCatalog(); setSuccessMessage("فیلتر جدید ساخته شد."); }
    catch (error) { setErrorMessage(error instanceof Error ? error.message : "افزودن فیلتر ناموفق بود."); }
    finally { setLoading(false); }
  }

  function toggleQuestion(questionId: number, checked: boolean) { setSelectedQuestions((current) => checked ? [...current, questionId] : current.filter((id) => id !== questionId)); }
  function updateOption(index: number, value: string) { setOptions((current) => current.map((option, optionIndex) => optionIndex === index ? value : option)); }
  function removeOption(index: number) { setOptions((current) => current.filter((_, optionIndex) => optionIndex !== index)); setCorrectOptionId((current) => current === index ? 0 : current > index ? current - 1 : current); }

  const renderQuestionEditor = (submitLabel: string, onSubmit: () => void) => (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-bold border-b border-border pb-3">ثبت سؤال چهارگزینه‌ای</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <select value={questionSubject} onChange={(event) => setQuestionSubject(event.target.value)} className={selectClass}>{subjects.filter(s => s.is_active).map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select>
        <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className={selectClass}><option value="beginner">مقدماتی</option><option value="intermediate">متوسط</option><option value="advanced">پیشرفته</option></select>
      </div>
      <textarea rows={4} value={questionText} onChange={(event) => setQuestionText(event.target.value)} placeholder="صورت سؤال" className={textareaClass} required />
      <div className="space-y-2">
        {options.map((text, index) => <div key={`option-${index}`} className="flex gap-2 items-center"><input type="radio" checked={correctOptionId === index} onChange={() => setCorrectOptionId(index)} /><input value={text} onChange={(event) => updateOption(index, event.target.value)} placeholder={`گزینه ${index + 1}`} className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-sm" required />{options.length > 2 && <button type="button" onClick={() => removeOption(index)} className="text-text-muted hover:text-red-500"><Trash2 size={16} /></button>}</div>)}
        {options.length < 6 && <button type="button" onClick={() => setOptions((current) => [...current, ""])} className="text-primary text-xs flex items-center gap-1"><Plus size={14} />افزودن گزینه</button>}
      </div>
      <textarea rows={3} value={explanation} onChange={(event) => setExplanation(event.target.value)} placeholder="توضیح پاسخ" className={textareaClass} required />
      <textarea rows={3} value={codeExample} onChange={(event) => setCodeExample(event.target.value)} placeholder="مثال کد اختیاری" className={`${textareaClass} font-mono`} />
      <Button type="button" onClick={onSubmit} variant="primary" disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : submitLabel}</Button>
    </div>
  );

  const activeExamFilters = filters.filter(f => f.is_active && (f.scope === "exams" || f.scope === "all"));

  return <div className="min-h-screen bg-background flex flex-col">
    <Header title="پنل مدیریت ادمین" subtitle="مدیریت جزوات، سوالات، آزمون‌ها، درس‌ها و فیلترها" />
    <div className="p-6 max-w-5xl mx-auto w-full flex-1">
      <div className="flex gap-2 mb-6 border-b border-border pb-3 overflow-x-auto">
        {(["note", "question", "exam", "catalog"] as Tab[]).map((tab) => {
          const config = { note: { label: "جزوه", icon: BookOpen }, question: { label: "سؤال", icon: HelpCircle }, exam: { label: "آزمون", icon: ClipboardList }, catalog: { label: "درس و فیلتر", icon: Settings2 } }[tab];
          const Icon = config.icon;
          return <button key={tab} onClick={() => { setActiveTab(tab); resetMessages(); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${activeTab === tab ? "bg-primary text-white" : "text-text-secondary hover:bg-primary/5"}`}><Icon size={18} />{config.label}</button>;
        })}
      </div>
      {successMessage && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2"><CheckCircle2 size={16} />{successMessage}</div>}
      {errorMessage && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">{errorMessage}</div>}

      <Card className="p-6 md:p-8">
        {activeTab === "note" && <form onSubmit={createNote} className="flex flex-col gap-5"><h2 className="text-lg font-bold border-b border-border pb-3">ثبت جزوه آموزشی جدید</h2><Input label="عنوان جزوه" type="text" value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} required /><Input label="نام نویسنده" type="text" value={noteAuthor} onChange={(event) => setNoteAuthor(event.target.value)} placeholder="مثلاً: علی رضایی" /><select value={noteSubject} onChange={(event) => setNoteSubject(event.target.value)} className={selectClass}>{subjects.filter(s => s.is_active).map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><textarea rows={10} value={noteContent} onChange={(event) => setNoteContent(event.target.value)} placeholder="محتوای جزوه" className={textareaClass} required /><Button type="submit" variant="primary" disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "انتشار جزوه"}</Button></form>}
        {activeTab === "question" && renderQuestionEditor("ذخیره سؤال", () => { void createQuestion(); })}
        {activeTab === "exam" && <form onSubmit={createExam} className="flex flex-col gap-5"><h2 className="text-lg font-bold border-b border-border pb-3">ساخت آزمون</h2><Input label="عنوان آزمون" type="text" value={examTitle} onChange={(event) => setExamTitle(event.target.value)} required /><Input label="نام نویسنده" type="text" value={examAuthor} onChange={(event) => setExamAuthor(event.target.value)} placeholder="مثلاً: علی رضایی" /><textarea rows={3} value={examDescription} onChange={(event) => setExamDescription(event.target.value)} placeholder="توضیح آزمون" className={textareaClass} /><div className="grid md:grid-cols-2 gap-4"><select value={examSubject} onChange={(event) => setExamSubject(event.target.value)} className={selectClass}>{subjects.filter(s => s.is_active).map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><select value={examType} onChange={(event) => setExamType(event.target.value as "practice" | "timed")} className={selectClass}><option value="practice">کتاب تست / تمرینی</option><option value="timed">آزمون زمان‌دار</option></select></div>{examType === "timed" && <Input label="زمان به دقیقه" type="number" min={1} value={String(timeLimit)} onChange={(event) => setTimeLimit(Number(event.target.value))} />}
          {activeExamFilters.length > 0 && <div className="rounded-xl border border-border p-4"><h3 className="text-sm font-bold mb-3">مقادیر فیلترهای این آزمون</h3><div className="grid md:grid-cols-2 gap-4">{activeExamFilters.map(filter => <div key={filter.id}><label className="block text-xs text-text-muted mb-1.5">{filter.name}</label>{filter.field_type === "select" && <select value={String(examFilterValues[filter.key] ?? "")} onChange={e => setExamFilterValues(v => ({...v, [filter.key]: e.target.value}))} className={selectClass}><option value="">انتخاب کنید</option>{filter.options.map(o => <option key={o} value={o}>{o}</option>)}</select>}{filter.field_type === "number" && <input type="number" value={String(examFilterValues[filter.key] ?? "")} onChange={e => setExamFilterValues(v => ({...v, [filter.key]: e.target.value === "" ? "" : Number(e.target.value)}))} className={selectClass}/>} {filter.field_type === "text" && <input value={String(examFilterValues[filter.key] ?? "")} onChange={e => setExamFilterValues(v => ({...v, [filter.key]: e.target.value}))} className={selectClass}/>} {filter.field_type === "boolean" && <select value={String(examFilterValues[filter.key] ?? "")} onChange={e => setExamFilterValues(v => ({...v, [filter.key]: e.target.value === "true"}))} className={selectClass}><option value="">انتخاب کنید</option><option value="true">بله</option><option value="false">خیر</option></select>} {filter.field_type === "multi_select" && <select value={String(examFilterValues[filter.key] ?? "")} onChange={e => setExamFilterValues(v => ({...v, [filter.key]: e.target.value ? [e.target.value] : []}))} className={selectClass}><option value="">انتخاب کنید</option>{filter.options.map(o => <option key={o} value={o}>{o}</option>)}</select>}</div>)}</div></div>}
          <div className="rounded-xl border border-border p-4 space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold text-sm">سؤال‌های آزمون</h3><p className="text-xs text-text-muted mt-1">از سؤال‌های قبلی انتخاب کن یا سؤال جدید بساز.</p></div><div className="flex gap-2"><button type="button" onClick={() => { setQuestionSource("existing"); resetMessages(); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${questionSource === "existing" ? "bg-primary text-white" : "bg-primary/5 text-primary"}`}><LibraryBig size={15}/>سؤال‌های قبلی من</button><button type="button" onClick={() => { setQuestionSource("new"); resetMessages(); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${questionSource === "new" ? "bg-primary text-white" : "bg-primary/5 text-primary"}`}><Plus size={15}/>ساخت سؤال جدید</button></div></div>{questionSource === "existing" ? <div className="max-h-80 overflow-y-auto space-y-2">{!availableQuestions.length && <div className="text-xs text-text-muted py-6 text-center">هنوز سؤال ثبت‌شده‌ای برای این درس نداری.</div>}{availableQuestions.map(question => <label key={question.id} className="flex gap-3 items-start rounded-lg border border-border p-3 cursor-pointer hover:border-primary/40"><input type="checkbox" checked={selectedQuestions.includes(question.id)} onChange={event => toggleQuestion(question.id, event.target.checked)} /><span className="text-sm leading-6">{question.text}</span></label>)}</div> : <div className="pt-2">{renderQuestionEditor("ساخت و افزودن به آزمون", () => { void createQuestionForExam(); })}</div>}<div className="pt-3 border-t border-border text-xs text-text-secondary">{selectedQuestions.length} سؤال برای آزمون انتخاب شده است.</div></div><Button type="submit" variant="primary" disabled={loading || !selectedQuestions.length}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ساخت آزمون"}</Button></form>}
        {activeTab === "catalog" && <div className="space-y-8"><section><h2 className="text-lg font-bold">مدیریت درس‌ها</h2><p className="text-xs text-text-muted mt-1">هر درسی که اضافه می‌کنی خودکار در فیلتر آزمون‌ها، جزوات، سوالات و سایدبار نمایش داده می‌شود.</p><div className="grid md:grid-cols-3 gap-3 mt-4"><input value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="نام درس، مثلا هوش مصنوعی" className={selectClass}/><input value={newSubjectSlug} onChange={e => setNewSubjectSlug(e.target.value)} placeholder="شناسه انگلیسی، مثلا ai" className={selectClass}/><Button type="button" onClick={() => void createSubject()} disabled={loading}><Plus size={16}/>افزودن درس</Button></div><div className="mt-4 space-y-2">{subjects.map(item => <div key={item.id} className="flex items-center justify-between border border-border rounded-xl p-3"><span className="text-sm">{item.name}<span className="text-[10px] text-text-muted mr-2">{item.slug}</span></span><button type="button" onClick={() => api.catalog.toggleSubject(item.id).then(refreshCatalog).catch(e => setErrorMessage(e.message))} className={`text-xs ${item.is_active ? "text-danger" : "text-success"}`}>{item.is_active ? "غیرفعال کردن" : "فعال کردن"}</button></div>)}</div></section><section className="border-t border-border pt-7"><h2 className="text-lg font-bold">فیلترهای قابل توسعه</h2><p className="text-xs text-text-muted mt-1">نوع فیلتر را انتخاب کن؛ بعدا می‌توانی قیمت، سطح، مدرس، نوع محتوا یا هر ویژگی دیگری بسازی.</p><div className="grid md:grid-cols-5 gap-3 mt-4"><input value={newFilterName} onChange={e => setNewFilterName(e.target.value)} placeholder="نام فیلتر" className={selectClass}/><input value={newFilterKey} onChange={e => setNewFilterKey(e.target.value)} placeholder="کلید مثلا price" className={selectClass}/><select value={newFilterType} onChange={e => setNewFilterType(e.target.value as FilterFieldType)} className={selectClass}><option value="select">انتخابی</option><option value="multi_select">چندانتخابی</option><option value="number">عددی</option><option value="text">متنی</option><option value="boolean">بله / خیر</option></select><select value={newFilterScope} onChange={e => setNewFilterScope(e.target.value as FilterScope)} className={selectClass}><option value="exams">آزمون‌ها</option><option value="notes">جزوات</option><option value="questions">سوالات</option><option value="all">همه</option></select><input value={newFilterOptions} onChange={e => setNewFilterOptions(e.target.value)} placeholder="گزینه‌ها با , جدا شوند" className={selectClass}/></div><Button type="button" onClick={() => void createFilter()} className="mt-3" disabled={loading}><Plus size={16}/>افزودن فیلتر</Button><div className="mt-4 space-y-2">{filters.map(filter => <div key={filter.id} className="flex items-center justify-between border border-border rounded-xl p-3"><div><span className="text-sm font-semibold">{filter.name}</span><span className="text-[10px] text-text-muted mr-2">{filter.key} · {filter.field_type} · {filter.scope}</span></div><button type="button" onClick={() => api.catalog.toggleFilter(filter.id).then(refreshCatalog).catch(e => setErrorMessage(e.message))} className={`text-xs ${filter.is_active ? "text-danger" : "text-success"}`}>{filter.is_active ? "غیرفعال کردن" : "فعال کردن"}</button></div>)}</div></section></div>}
      </Card>
    </div>
  </div>;
}
