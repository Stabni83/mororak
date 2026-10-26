"use client";

/**
 * "My Library": lets the user upload their own PDFs/photos and lists what
 * they've uploaded so far, with a resume-where-you-left-off shortcut for
 * PDFs that already have a bookmarked page.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { api } from "@/lib/api";
import { getSubjectColor } from "@/lib/utils";
import type { Resource, SubjectItem } from "@/types";
import { SUBJECT_LABELS, SUBJECTS } from "@/types";
import { FileText, Image as ImageIcon, UploadCloud, Trash2, Library as LibraryIcon } from "lucide-react";

const ACCEPTED_TYPES = "application/pdf,image/jpeg,image/png,image/webp";

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} کیلوبایت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`;
}

function formatDate(value?: string | null): string {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("fa-IR", { month: "long", day: "numeric" }).format(new Date(value));
  } catch {
    return "";
  }
}

export default function LibraryPage() {
  const fallbackSubjects: SubjectItem[] = SUBJECTS.map((slug, position) => ({
    id: position + 1,
    slug,
    name: SUBJECT_LABELS[slug],
    position,
    is_active: true,
  }));
  const [subjects, setSubjects] = useState<SubjectItem[]>(fallbackSubjects);
  const [resources, setResources] = useState<Resource[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | "pdf" | "image">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    api.catalog.subjects().then((items) => { if (items?.length) setSubjects(items); }).catch(() => undefined);
  }, []);

  async function loadResources() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.resources.list(typeFilter !== "all" ? { resource_type: typeFilter } : undefined);
      setResources(data || []);
    } catch (err: any) {
      setError(err?.message || "خطا در دریافت فایل‌ها");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setUploadError("یک فایل PDF یا عکس انتخاب کن");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      await api.resources.upload({
        title: title.trim() || file.name,
        subject: subject || undefined,
        file,
      });
      setTitle("");
      setSubject("");
      setFile(null);
      const fileInput = document.getElementById("resource-file-input") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      await loadResources();
    } catch (err: any) {
      setUploadError(err?.message || "آپلود فایل انجام نشد");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubjectChange(id: number, value: string) {
    try {
      const updated = await api.resources.update(id, { subject: value || null });
      setResources((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err: any) {
      setError(err?.message || "تغییر درس انجام نشد");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("این فایل حذف بشه؟")) return;
    try {
      await api.resources.remove(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      setError(err?.message || "حذف فایل انجام نشد");
    }
  }

  return (
    <div>
      <Header title="کتابخانه‌ی من" subtitle="فایل‌های PDF و عکس‌هایی که خودت آپلود کردی" />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Card padding="lg">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <UploadCloud size={18} className="text-primary" /> آپلود فایل جدید
          </h2>
          <form onSubmit={handleUpload} className="grid md:grid-cols-3 gap-3 items-end">
            <Input
              label="عنوان"
              placeholder="مثلاً جزوه‌ی فصل ۳"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-text-secondary">درس (اختیاری)</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-background text-sm px-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">بدون درس</option>
                {subjects.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-text-secondary">فایل (PDF یا عکس)</label>
              <input
                id="resource-file-input"
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-text-secondary file:ml-3 file:px-3 file:py-2 file:rounded-md file:border-0 file:bg-primary/10 file:text-primary file:text-xs file:font-semibold file:cursor-pointer"
              />
            </div>
            <div className="md:col-span-3 flex items-center justify-between">
              {uploadError ? (
                <span className="text-xs text-danger font-medium">{uploadError}</span>
              ) : (
                <span className="text-[11px] text-text-muted">حداکثر حجم مجاز: ۵۰ مگابایت</span>
              )}
              <Button type="submit" size="sm" disabled={uploading}>
                {uploading ? "در حال آپلود..." : "آپلود فایل"}
              </Button>
            </div>
          </form>
        </Card>

        <div className="flex items-center gap-2">
          {[
            { key: "all", label: "همه" },
            { key: "pdf", label: "PDF ها" },
            { key: "image", label: "عکس‌ها" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key as typeof typeFilter)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                typeFilter === tab.key
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-text-secondary hover:border-primary/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-surface/50 border border-border rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-danger/10 border border-danger/20 text-danger rounded-lg text-center text-sm">{error}</div>
        ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => {
              const colors = getSubjectColor(resource.subject || "بدون-درس");
              const Icon = resource.resource_type === "pdf" ? FileText : ImageIcon;
              const canResume = resource.resource_type === "pdf" && !!resource.last_page && resource.last_page > 1;
              return (
                <Card key={resource.id} hoverable padding="md" className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors.bg} ${colors.text}`}>
                        <Icon size={18} />
                      </span>
                      <button
                        type="button"
                        aria-label="حذف فایل"
                        title="حذف فایل"
                        onClick={() => void handleDelete(resource.id)}
                        className="shrink-0 rounded-lg p-1.5 text-text-muted hover:text-danger hover:bg-danger/5 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <Link href={`/dashboard/library/${resource.id}`} className="block cursor-pointer">
                      <h3 className="text-sm font-bold mb-1.5 leading-snug hover:text-primary transition-colors line-clamp-2">
                        {resource.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="text-[11px] text-text-muted">{formatSize(resource.size_bytes)}</span>
                      {resource.created_at && (
                        <span className="text-[11px] text-text-muted">{formatDate(resource.created_at)}</span>
                      )}
                    </div>
                    <select
                      value={resource.subject || ""}
                      onChange={(e) => void handleSubjectChange(resource.id, e.target.value)}
                      aria-label="دسته‌بندی درس"
                      className="w-full h-8 rounded-md border border-border bg-background text-xs px-2 mb-3 focus:outline-none focus:border-primary"
                    >
                      <option value="">بدون درس</option>
                      {subjects.map((s) => (
                        <option key={s.slug} value={s.slug}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <Link href={`/dashboard/library/${resource.id}`} className="block">
                    <Button variant="outline" size="sm" fullWidth>
                      {canResume ? `ادامه از صفحه ${resource.last_page}` : "مشاهده"}
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <LibraryIcon size={36} className="text-text-muted mb-3" />
            <p className="text-sm font-semibold mb-1">هنوز فایلی آپلود نکردی</p>
            <p className="text-xs text-text-muted">از فرم بالا یه PDF یا عکس اضافه کن</p>
          </div>
        )}
      </div>
    </div>
  );
}
