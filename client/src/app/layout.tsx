import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "مرورک | پلتفرم یادگیری فعال",
  description: "سامانه آموزش و مرور فعال برای دانشجویان مهندسی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-vazirmatn bg-background text-text antialiased">
        {children}
      </body>
    </html>
  );
}