// src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// فرض: فایل وزیرمتن را دانلود کرده و در public/fonts قرار داده‌اید
const vazir = localFont({
  src: "../../public/fonts/Vazirmatn-Regular.woff2",
  display: "swap",
});

export const metadata: Metadata = {
  title: "مرورک | آموزش عمیق کامپیوتر",
  description: "پلتفرم یادگیری بر پایه Active Recall برای دانشجویان کامپیوتر",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.className} bg-[#ecf2fe] text-black min-h-screen`}>
        {children}
      </body>
    </html>
  );
}