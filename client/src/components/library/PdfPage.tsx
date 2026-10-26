"use client";

/**
 * One page of a PDF inside the continuous-scroll viewer.
 *
 * - Only pages near the viewport are actually drawn (and pages that scroll far
 *   away are released), so a 500-page book doesn't eat all the memory.
 * - A thin line across the middle of the screen decides which page is
 *   "current": whichever page crosses it reports itself via onActive.
 * - Drawn at devicePixelRatio so text stays sharp on HiDPI screens.
 */
import { useEffect, useRef, useState } from "react";

interface PdfPageProps {
  pdf: any;
  pageNumber: number;
  width: number; // CSS pixel width of the page
  estimatedHeight: number; // used until the real page is drawn
  onActive: (page: number) => void;
  registerRef: (page: number, el: HTMLDivElement | null) => void;
}

export default function PdfPage({ pdf, pageNumber, width, estimatedHeight, onActive, registerRef }: PdfPageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(false);
  const [renderedHeight, setRenderedHeight] = useState<number | null>(null);
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    registerRef(pageNumber, el);

    const nearObserver = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: "1500px 0px",
    });
    nearObserver.observe(el);

    // Zero-height "reading line" in the middle of the viewport.
    const activeObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onActiveRef.current(pageNumber);
      },
      { rootMargin: "-49% 0px -49% 0px" }
    );
    activeObserver.observe(el);

    return () => {
      nearObserver.disconnect();
      activeObserver.disconnect();
      registerRef(pageNumber, null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!near) {
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
      setRenderedHeight(null);
      return;
    }

    let cancelled = false;
    let task: any = null;

    (async () => {
      const page = await pdf.getPage(pageNumber);
      if (cancelled) return;

      const base = page.getViewport({ scale: 1 });
      const cssScale = width / base.width;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const viewport = page.getViewport({ scale: cssScale * dpr });

      // Draw off-screen first, then copy: avoids pdf.js's "same canvas used by
      // two render() calls" error when zooming quickly, and avoids flicker.
      const off = document.createElement("canvas");
      off.width = Math.floor(viewport.width);
      off.height = Math.floor(viewport.height);
      task = page.render({ canvasContext: off.getContext("2d")!, viewport });
      try {
        await task.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") console.error("PDF page render failed:", err);
        return;
      }
      if (cancelled) return;

      const visible = canvasRef.current;
      if (!visible) return;
      visible.width = off.width;
      visible.height = off.height;
      visible.style.width = `${width}px`;
      visible.style.height = `${Math.floor(off.height / dpr)}px`;
      visible.getContext("2d")!.drawImage(off, 0, 0);
      setRenderedHeight(Math.floor(off.height / dpr));
    })();

    return () => {
      cancelled = true;
      if (task) task.cancel();
    };
  }, [near, width, pdf, pageNumber]);

  return (
    <div
      ref={wrapperRef}
      data-page={pageNumber}
      className="bg-white rounded-md shadow-card mb-4 overflow-hidden shrink-0"
      style={{ width, height: renderedHeight ?? estimatedHeight, scrollMarginTop: 110 }}
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
