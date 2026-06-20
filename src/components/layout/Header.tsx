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
      <header className="h-14 bg-bg border-b border-border
                  px-4 flex items-center justify-between
                  sticky top-0 z-50">

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

      {/* سمت چپ header — جستجو و آواتار */}
      <div className="flex items-center gap-3">

        {/* باکس جستجو */}
        <div className="flex items-center gap-2 bg-surface border border-border
                        rounded-md px-3 py-1.5 text-sm text-text-muted
                        hover:border-primary/30 transition-colors cursor-text">
          <span className="text-xs">🔍</span>
          <span>جستجو...</span>
        </div>

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