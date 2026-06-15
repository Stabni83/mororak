"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "داشبورد",    href: "/dashboard",  icon: "🏠" },
  { label: "سوالات",     href: "/questions",  icon: "❓" },
  { label: "جزوات",      href: "/notes",      icon: "📄" },
  { label: "ذخیره‌شده", href: "/saved",      icon: "🔖" },
];

const bottomNavItems: NavItem[] = [
  { label: "پروفایل",   href: "/profile",    icon: "👤" },
  { label: "تنظیمات",   href: "/settings",   icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Overlay — فقط موبایل */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* دکمه همبرگر — فقط موبایل */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-30 lg:hidden
                   w-9 h-9 bg-surface border border-border rounded-md
                   flex items-center justify-center text-text-secondary
                   hover:text-primary transition-colors"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* سایدبار */}
      <aside className={cn(
        "fixed lg:sticky top-0 right-0 h-screen z-30",
        "w-56 bg-surface border-l border-border flex flex-col",
        "transition-transform duration-200",
        // موبایل: پیش‌فرض بسته، با isOpen باز میشه
        isOpen ? "translate-x-0" : "translate-x-full",
        // دسکتاپ: همیشه نمایش
        "lg:translate-x-0 lg:static lg:z-auto"
      )}>

        {/* لوگو */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
            م
          </div>
          <span className="text-base font-bold text-primary">مرورک</span>
        </div>

        {/* منو */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm",
                  "transition-all duration-150",
                  isActive
                    ? "bg-primary/8 text-primary font-semibold"
                    : "text-text-secondary hover:bg-primary/5 hover:text-primary"
                )}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* پایین */}
        <div className="px-3 py-4 border-t border-border flex flex-col gap-1">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm
                         text-text-secondary hover:bg-primary/5 hover:text-primary
                         transition-all duration-150"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}