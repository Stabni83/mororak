"use client";

/**
 * Viewer for a single uploaded resource (PDF or image). Reuses the same
 * study-timer pattern as the Note reader (see notes/[id]/page.tsx), but logs
 * time against resource_id instead of note_id, and additionally saves/
 * restores the current PDF page as a "continue where you left off" bookmark.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PdfPage from "@/components/library/PdfPage";
import { api } from "@/lib/api";
import type { Resource } from "@/types";
import { Clock, ArrowRight, ChevronRight, ChevronLeft, FileText, ZoomIn, ZoomOut } from "lucide-react";

export default function ResourceViewerPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = Number(params.id);

  const [resource, setResource] = useState<Resource | null>(null);
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ---- PDF rendering state ----
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageAspect, setPageAspect] = useState(1.414); // height/width of page 1 (A4 default)
  const [containerWidth, setContainerWidth] = useState(0);
  const [jumpInput, setJumpInput] = useState<string | null>(null);
  const pdfReady = !!pdfDoc;

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const pageNumRef = useRef(1);
  pageNumRef.current = pageNum;
  // While the viewer is still jumping to the saved page, ignore "current page"
  // reports so the bookmark isn't overwritten with page 1.
  const trackingRef = useRef(false);

  // "site" = our own pdf.js renderer (tracks pages automatically).
  // "browser" = the browser's built-in PDF viewer (best font fidelity, e.g. Persian
  // fonts); there the user sets the bookmark page by hand.
  const [viewMode, setViewMode] = useState<"site" | "browser">(() => {
    if (typeof window === "undefined") return "site";
    return localStorage.getItem("pdf_view_mode") === "browser" ? "browser" : "site";
  });
  const [browserPdfUrl, setBrowserPdfUrl] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState("");

  // ---- Study timer state (same pattern as the Note reader) ----
  const todayStr = new Date().toISOString().slice(0, 10);
  const [seconds, setSeconds] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem(`study_time_resource_${resourceId}_${todayStr}`);
    return saved ? Number(saved) : 0;
  });
  const [isActive, setIsActive] = useState(true);
  const secondsRef = useRef(seconds);
  secondsRef.current = seconds;

  // Load resource metadata + file bytes once.
  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    async function load() {
      if (!resourceId) return;
      try {
        setLoading(true);
        setLoadError(null);
        const [meta, blob] = await Promise.all([
          api.resources.get(resourceId),
          api.resources.getFileBlob(resourceId),
        ]);
        if (!active) return;
        setResource(meta);
        setFileBlob(blob);
        if (meta.resource_type === "image") {
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
        } else {
          setPageNum(meta.last_page && meta.last_page > 0 ? meta.last_page : 1);
        }
      } catch (err: any) {
        if (active) setLoadError(err?.message || "دریافت فایل با خطا مواجه شد");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [resourceId]);

  // Load the PDF document (pdf.js) once we have the raw bytes.
  useEffect(() => {
    if (!fileBlob || resource?.resource_type !== "pdf") return;
    let cancelled = false;

    async function loadPdf() {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await fileBlob!.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        throw new Error(`فایل در مرورگر خالی خوانده شد (blob=${fileBlob!.size} بایت)`);
      }
      // Hand pdf.js its own copy: it transfers (detaches) the buffer it receives.
      const bytes = new Uint8Array(arrayBuffer.slice(0));
      // cMaps + standard fonts: without them pdf.js can't map/draw many Persian/Arabic
      // fonts correctly (letters come out scrambled or wrong).
      const assetBase = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}`;
      const pdf = await pdfjsLib.getDocument({
        data: bytes,
        cMapUrl: `${assetBase}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `${assetBase}/standard_fonts/`,
        disableFontFace: true,
      }).promise;
      if (cancelled) return;
      const first = await pdf.getPage(1);
      const vp = first.getViewport({ scale: 1 });
      if (cancelled) return;
      setPageAspect(vp.height / vp.width);
      setNumPages(pdf.numPages);
      setPdfDoc(pdf);
    }

    loadPdf().catch((err) => setLoadError(err?.message || "نمایش PDF با خطا مواجه شد"));
    return () => { cancelled = true; };
  }, [fileBlob, resource]);

  // Measure how wide the reading area is (pages are drawn at this width x zoom).
  useEffect(() => {
    if (viewMode !== "site") return;
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContainerWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [viewMode, loading, resource?.resource_type]);

  function scrollToPage(page: number, behavior: ScrollBehavior = "auto") {
    pageRefs.current[page]?.scrollIntoView({ behavior, block: "start" });
  }

  // On open (and when switching back from the browser viewer): jump to the saved
  // page, then start tracking the visible page. The second jump fixes small
  // layout shifts once nearby pages have been drawn at their real height.
  const hasWidth = containerWidth > 0;
  useEffect(() => {
    if (viewMode !== "site" || !pdfDoc || !hasWidth) return;
    trackingRef.current = false;
    const t1 = window.setTimeout(() => scrollToPage(pageNumRef.current), 80);
    const t2 = window.setTimeout(() => scrollToPage(pageNumRef.current), 600);
    const t3 = window.setTimeout(() => { trackingRef.current = true; }, 1000);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3); trackingRef.current = false; };
  }, [viewMode, pdfDoc, hasWidth]);

  const handleActivePage = useCallback((page: number) => {
    if (trackingRef.current) setPageNum(page);
  }, []);

  const registerPageRef = useCallback((page: number, el: HTMLDivElement | null) => {
    pageRefs.current[page] = el;
  }, []);

  function changeZoom(next: number) {
    const keepPage = pageNumRef.current;
    setZoom(next);
    // Widths change, so heights shift; re-anchor on the page being read.
    window.setTimeout(() => scrollToPage(keepPage), 60);
  }

  // Blob URL for the browser's built-in viewer.
  useEffect(() => {
    if (viewMode !== "browser" || !fileBlob || resource?.resource_type !== "pdf") return;
    const url = URL.createObjectURL(new Blob([fileBlob], { type: "application/pdf" }));
    setBrowserPdfUrl(url);
    return () => { URL.revokeObjectURL(url); setBrowserPdfUrl(null); };
  }, [viewMode, fileBlob, resource]);

  function switchMode(next: "site" | "browser") {
    setViewMode(next);
    localStorage.setItem("pdf_view_mode", next);
  }

  function applyBrowserPage() {
    const n = parseInt(pageInput, 10);
    if (!n || n < 1) return;
    setPageNum(numPages ? Math.min(n, numPages) : n);
  }

  // Save the current page as a bookmark, debounced so we don't spam the API
  // on every single click while flipping through pages quickly.
  const saveProgress = useCallback((page: number, total: number | null) => {
    if (!resourceId) return;
    void api.resources.updateProgress(resourceId, {
      last_page: page,
      ...(total ? { total_pages: total } : {}),
    }).catch(() => undefined);
  }, [resourceId]);

  useEffect(() => {
    if (!pdfReady) return;
    const timer = window.setTimeout(() => saveProgress(pageNum, numPages), 600);
    return () => window.clearTimeout(timer);
  }, [pageNum, numPages, pdfReady, saveProgress]);

  function goToPage(next: number) {
    if (!numPages) return;
    const target = Math.min(Math.max(1, next), numPages);
    setPageNum(target);
    scrollToPage(target, "smooth");
  }

  // ---- Study timer: tick every second, persist to DB every 60s, same as notes ----
  useEffect(() => {
    const saveToDatabase = async () => {
      if (secondsRef.current > 0) {
        try {
          await api.users.logStudyTime({ resource_id: resourceId, date: todayStr, seconds: secondsRef.current });
        } catch (err) {
          console.error("Failed to log study time:", err);
        }
      }
    };
    const dbInterval = setInterval(saveToDatabase, 60000);
    return () => {
      clearInterval(dbInterval);
      saveToDatabase();
    };
  }, [resourceId, todayStr]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && resourceId) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1 >= 86400 ? 0 : prev + 1;
          localStorage.setItem(`study_time_resource_${resourceId}_${todayStr}`, String(next));
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, resourceId, todayStr]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) setIsActive(false);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      setIsActive(false);
    };
  }, []);

  if (loading) return <div className="p-10 text-center">در حال بارگذاری فایل...</div>;
  if (loadError) return (
    <div className="p-10 max-w-xl mx-auto text-center">
      <p className="text-sm font-semibold text-red-600 mb-3">{loadError}</p>
      <Button variant="outline" size="sm" onClick={() => router.back()}>بازگشت</Button>
    </div>
  );
  if (!resource) return <div className="p-10 text-center">فایل یافت نشد.</div>;

  return (
    <div>
      <Header title={resource.title} subtitle="مطالعه‌ی فایل شخصی" />

      <div className="p-6 max-w-5xl mx-auto">
        <Card className="flex items-center justify-between mb-6 bg-surface/85 sticky top-4 z-10 backdrop-blur flex-wrap gap-3">
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

          {resource.resource_type === "pdf" && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => switchMode(viewMode === "site" ? "browser" : "site")}
                className="text-xs bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg font-semibold"
                title="اگه حروف فارسی درست نمایش داده نمی‌شن، نمایشگر مرورگر رو امتحان کن"
              >
                {viewMode === "site" ? "نمایشگر مرورگر" : "نمایشگر سایت"}
              </button>
              {viewMode === "browser" && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-text-secondary">صفحه‌ی فعلی:</span>
                  <input
                    type="number"
                    min={1}
                    max={numPages || undefined}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") applyBrowserPage(); }}
                    placeholder={String(pageNum)}
                    className="w-16 h-8 rounded-md border border-border bg-background text-xs text-center"
                    dir="ltr"
                  />
                  <button onClick={applyBrowserPage} className="text-xs bg-primary text-white px-2.5 py-1.5 rounded-lg font-semibold">
                    برو و ذخیره
                  </button>
                  {numPages && <span className="text-xs text-text-muted" dir="ltr">/ {numPages}</span>}
                </div>
              )}
            </div>
          )}
          {resource.resource_type === "pdf" && numPages && viewMode === "site" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeZoom(Math.max(0.75, +(zoom - 0.25).toFixed(2)))}
                disabled={zoom <= 0.75}
                className="p-1.5 rounded-lg border border-border text-text-secondary disabled:opacity-40 hover:border-primary/40"
                aria-label="کوچک‌نمایی"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-xs font-semibold w-10 text-center" dir="ltr">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => changeZoom(Math.min(3, +(zoom + 0.25).toFixed(2)))}
                disabled={zoom >= 3}
                className="p-1.5 rounded-lg border border-border text-text-secondary disabled:opacity-40 hover:border-primary/40"
                aria-label="بزرگ‌نمایی"
              >
                <ZoomIn size={16} />
              </button>
              <span className="w-px h-5 bg-border mx-1" />
              <button
                onClick={() => goToPage(pageNum - 1)}
                disabled={pageNum <= 1}
                className="p-1.5 rounded-lg border border-border text-text-secondary disabled:opacity-40 hover:border-primary/40"
                aria-label="صفحه قبل"
              >
                <ChevronRight size={16} />
              </button>
              <div className="flex items-center gap-1" dir="ltr">
                <input
                  type="number"
                  min={1}
                  max={numPages}
                  value={jumpInput ?? String(pageNum)}
                  onFocus={() => setJumpInput("")}
                  onBlur={() => setJumpInput(null)}
                  onChange={(e) => setJumpInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const n = parseInt(jumpInput || "", 10);
                      if (n) goToPage(n);
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="w-12 h-7 rounded-md border border-border bg-background text-xs text-center font-semibold"
                />
                <span className="text-xs font-semibold">/ {numPages}</span>
              </div>
              <button
                onClick={() => goToPage(pageNum + 1)}
                disabled={pageNum >= numPages}
                className="p-1.5 rounded-lg border border-border text-text-secondary disabled:opacity-40 hover:border-primary/40"
                aria-label="صفحه بعد"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}
        </Card>

        <Card className="flex justify-start overflow-x-auto">
          {resource.resource_type === "pdf" && viewMode === "browser" ? (
            browserPdfUrl ? (
              <iframe
                key={`${browserPdfUrl}-${pageNum}`}
                src={`${browserPdfUrl}#page=${pageNum}`}
                title={resource.title}
                className="w-full h-[80vh] rounded-md border-0"
              />
            ) : null
          ) : resource.resource_type === "pdf" ? (
            <div ref={containerRef} className="w-full min-w-0">
              {!pdfReady && <div className="py-16 flex flex-col items-center gap-2 text-text-muted text-sm"><FileText size={28} /> در حال آماده‌سازی PDF...</div>}
              {pdfReady && hasWidth && numPages && (
                <div className="w-max min-w-full flex flex-col items-center">
                  {Array.from({ length: numPages }, (_, i) => (
                    <PdfPage
                      key={i + 1}
                      pdf={pdfDoc}
                      pageNumber={i + 1}
                      width={Math.floor(containerWidth * zoom)}
                      estimatedHeight={Math.floor(containerWidth * zoom * pageAspect)}
                      onActive={handleActivePage}
                      registerRef={registerPageRef}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={resource.title} className="max-w-full rounded-md" />
          ) : null}
        </Card>
      </div>
    </div>
  );
}
