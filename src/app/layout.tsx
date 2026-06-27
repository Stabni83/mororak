// این فایل Root Layout است — دور تمام صفحات می‌پیچد
// در Next.js App Router این یک قرارداد است و باید وجود داشته باشد

import type { Metadata } from "next";
import "../styles/globals.css";

// ═══════════════════════════════════════════════
// Metadata — اطلاعاتی که در تب مرورگر و SEO نشان داده می‌شود
// ═══════════════════════════════════════════════
export const metadata: Metadata = {
  title: {
    // %s جای نام صفحه را می‌گیرد — مثلاً: "داشبورد | مرورک"
    template: "%s | مرورک",
    default: "مرورک — یادگیری هوشمند مهندسی کامپیوتر",
  },
  description:
    "یه مرور کوچولو برای تسلط بیشتر قبل از امتحان — پلتفرم فارسی Active Recall برای مهندسی کامپیوتر",
  keywords: ["مهندسی کامپیوتر", "ساختمان داده", "الگوریتم", "سیستم‌عامل", "شبکه"],
};

// ═══════════════════════════════════════════════
// RootLayout Component
// children = محتوای هر صفحه‌ای که داخل این layout رندر می‌شود
// ═══════════════════════════════════════════════
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // lang="fa" به مرورگر می‌گوید زبان فارسی است (برای screen reader و SEO)
    // dir="rtl" جهت کل صفحه را راست به چپ می‌کند
    <html lang="fa" dir="rtl">
      <head>
        {/* پیش‌لود فونت Vazirmatn برای سرعت بارگذاری بهتر */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-vazir bg-background text-text antialiased">
        {children}
      </body>
    </html>
  );
}