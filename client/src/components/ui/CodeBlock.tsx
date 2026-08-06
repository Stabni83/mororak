"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  // کد برنامه
  code: string;

  // زبان برنامه‌نویسی — برای نمایش در header
  language?: string;

  // عنوان اختیاری
  title?: string;

  className?: string;
}

export default function CodeBlock({
  code,
  language = "python",
  title,
  className,
}: CodeBlockProps) {
  // state برای کپی کردن کد
  // وقتی کاربر کپی می‌کند متن دکمه تغییر می‌کند
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    // بعد از ۲ ثانیه به حالت اولیه برمی‌گردد
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn("rounded-md overflow-hidden border border-border", className)}>

      {/* Header — نام زبان و دکمه کپی */}
      <div className="flex items-center justify-between px-4 py-2 bg-text">
        <span className="text-xs font-mono text-text-muted/60 text-white/50">
          {title ?? language}
        </span>

        <button
          onClick={handleCopy}
          className="text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          {/* وقتی کپی شد ✓ نشان می‌دهد */}
          {copied ? "✓ کپی شد" : "کپی"}
        </button>
      </div>

      {/* بلوک کد — LTR و فونت monospace */}
      <pre
        className={cn(
          "p-4 overflow-x-auto",
          // پس‌زمینه تیره — کد روی زمینه تاریک خواناتر است
          "bg-gray-950 text-green-300",
          // کد همیشه LTR است حتی در صفحه RTL
          "direction-ltr text-left",
          "text-sm leading-relaxed"
        )}
        dir="ltr"
      >
        <code>{code}</code>
      </pre>

    </div>
  );
}