"use client";

import { useSidebar } from "@/context/SidebarContext";

interface HeaderProps {
  // عنوان صفحه جاری — هر صفحه عنوان خودش را می‌دهد
  title: string;
  // زیرعنوان اختیاری
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { toggle } = useSidebar();

  return (
    <header className="h-14 bg-bg border-b border-border px-4
                       flex items-center justify-between sticky top-0 z-10">

      <div className="flex items-center gap-3">
        {/* دکمه همبرگر — فقط موبایل */}
        <button
          onClick={toggle}
          className="lg:hidden w-8 h-8 flex items-center justify-center
                     text-text-secondary hover:text-primary transition-colors"
        >
          ☰
        </button>

        {/* عنوان صفحه */}
        <div>
          <h1 className="text-base font-bold text-text">{title}</h1>
          {subtitle && (
            <p className="text-xs text-text-muted">{subtitle}</p>
          )}
        </div>
      </div>

      {/* سمت چپ header — آواتار */}
      <div className="flex items-center gap-3">

        {/* آواتار کاربر */}
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20
                        flex items-center justify-center
                        text-sm font-bold text-primary cursor-pointer">
          ع
        </div>

      </div>
    </header>
  );
}