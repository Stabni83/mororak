// client/src/app/dashboard/(dashboard)/notes/[id]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Clock, Download, Bookmark, ArrowRight, Highlighter, FileText } from "lucide-react";
import { api } from "@/lib/api";

export default function NoteReaderPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = Number(params.id);

  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const todayStr = new Date().toISOString().slice(0, 10);

  // تایمر مطالعه (بازیابی از لوکال استوریج برای جلوگیری از صفر شدن با رفرش)
  const [seconds, setSeconds] = useState(() => {
    if (typeof window === "undefined") return 0;
    const savedData = localStorage.getItem(`study_time_${noteId}_${todayStr}`);
    return savedData ? Number(savedData) : 0;
  });

  const [isActive, setIsActive] = useState(true);
  const [targetMinutes, setTargetMinutes] = useState<number | null>(null);

  // نوت‌ها و هایلایت‌ها
  const [personalNote, setPersonalNote] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  const secondsRef = useRef(seconds);
  secondsRef.current = seconds;

  useEffect(() => {
    async function fetchNote() {
      if (!noteId) return;
      try {
        const notesList = await api.notes.getAll();
        if (Array.isArray(notesList)) {
          const found = notesList.find((n: any) => Number(n.id) === noteId);
          setNote(found || null);
        } else if (notesList && typeof notesList === "object") {
          setNote(notesList);
        }
      } catch (err: any) {
        console.error("Error fetching note:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNote();
  }, [noteId]);

  // ارسال زمان مطالعه به سرور هنگام ترک صفحه یا بستن (هر 1 دقیقه و موقع Unmount)
  useEffect(() => {
    const saveToDatabase = async () => {
      if (secondsRef.current > 0 && api.users?.logStudyTime) {
        try {
          await api.users.logStudyTime({
            note_id: noteId,
            date: todayStr,
            seconds: secondsRef.current,
          });
        } catch (err: any) {
          console.error("Failed to log study time:", err);
        }
      }
    };

    const dbInterval = setInterval(saveToDatabase, 60000); // هر 1 دقیقه ذخیره در دیتابیس

    return () => {
      clearInterval(dbInterval);
      saveToDatabase(); // ذخیره نهایی هنگام خروج
    };
  }, [noteId, todayStr]);

  // مدیریت تایمر و ذخیره محلی ثانیه‌ها
  useEffect(() => {
    let interval: any = null;
    if (isActive && noteId) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const nextVal = prev + 1;
          const finalVal = nextVal >= 86400 ? 0 : nextVal; // ریست خودکار پس از 24 ساعت
          
          localStorage.setItem(`study_time_${noteId}_${todayStr}`, String(finalVal));

          if (targetMinutes && finalVal >= targetMinutes * 60) {
            setIsActive(false);
            alert("زمان مطالعه‌ی تعیین شده به پایان رسید!");
          }
          return finalVal;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, targetMinutes, noteId, todayStr]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsActive(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      setIsActive(false);
    };
  }, []);

  const handleHighlightSelection = () => {
    const selection = window.getSelection()?.toString();
    if (selection && selection.trim().length > 0) {
      setHighlights((prev) => [...prev, selection]);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([note?.content || ""], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${note?.title || "note"}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  if (loading) return <div className="p-10 text-center">در حال بارگذاری جزوه...</div>;
  if (!note) return <div className="p-10 text-center">جزوه یافت نشد.</div>;

  return (
    <div>
      <Header title={note.title} subtitle="مطالعه جزوه و یادداشت‌برداری" />

      <div className="p-6 max-w-4xl mx-auto">
        <Card className="flex items-center justify-between mb-6 bg-surface/85 sticky top-4 z-10 backdrop-blur">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowRight size={16} /> بازگشت
            </Button>
            <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-lg border border-border">
              <Clock size={16} className="text-primary animate-pulse" />
              <span className="text-sm font-bold font-mono" dir="ltr">
                {String(Math.floor(seconds / 3600)).padStart(2, "0")}:
                {String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:
                {String(seconds % 60).padStart(2, "0")}
              </span>
              <button 
                onClick={() => setIsActive(!isActive)} 
                className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold ml-2"
              >
                {isActive ? "توقف" : "ادامه"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select 
              onChange={(e) => setTargetMinutes(e.target.value ? Number(e.target.value) : null)}
              className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background"
            >
              <option value="">بدون هدف زمانی</option>
              <option value="15">هدف: ۱۵ دقیقه</option>
              <option value="30">هدف: ۳۰ دقیقه</option>
              <option value="60">هدف: ۱ ساعت</option>
            </select>

            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download size={14} /> دانلود فایل
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsSaved(!isSaved)}
              className={isSaved ? "border-primary text-primary" : ""}
            >
              <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} /> ذخیره
            </Button>
          </div>
        </Card>

        <Card className="mb-6">
          <div 
            onMouseUp={handleHighlightSelection}
            className="prose max-w-none text-sm leading-loose text-text select-text"
          >
            <h2 className="text-lg font-bold mb-4">{note.title}</h2>
            <div className="whitespace-pre-line">{note.content}</div>
          </div>

          {highlights.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
                <Highlighter size={14} /> متن‌های هایلایت‌شده:
              </p>
              <ul className="list-disc list-inside text-xs text-text-secondary space-y-1">
                {highlights.map((h, i) => (
                  <li key={i} className="bg-yellow-50 dark:bg-yellow-950/30 p-1.5 rounded">{h}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card>
          <p className="text-xs font-bold mb-2 flex items-center gap-1">
            <FileText size={14} /> یادداشت شخصی برای این جزوه
          </p>
          <textarea
            value={personalNote}
            onChange={(e) => setPersonalNote(e.target.value)}
            placeholder="برداشت‌ها یا نکات مهم خود را اینجا بنویسید..."
            rows={3}
            className="w-full border border-border rounded-lg p-3 text-sm bg-background focus:outline-none focus:border-primary resize-none"
          />
        </Card>
      </div>
    </div>
  );
}