"use client";

// usePathname از Next.js — صفحه جاری را می‌دهد تا nav item فعال را مشخص کنیم
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── تعریف آیتم‌های منو ──────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: string; // ایموجی به عنوان آیکون ساده
}

// لیست منو — اگر بخواهیم آیتم اضافه کنیم فقط اینجا تغییر می‌دهیم
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
  // pathname = آدرس صفحه جاری — مثلاً "/dashboard" یا "/questions"
  const pathname = usePathname();

  return (
    <aside className="w-56 h-screen bg-surface border-l border-border flex flex-col sticky top-0">

      {/* لوگو */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">
          م
        </div>
        <span className="text-base font-bold text-primary">مرورک</span>
      </div>

      {/* آیتم‌های اصلی منو */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          // startsWith برای اینکه /questions/123 هم active باشد
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm",
                "transition-all duration-150",
                isActive
                  // حالت فعال — پس‌زمینه آبی کم‌رنگ
                  ? "bg-primary/8 text-primary font-semibold"
                  // حالت غیر فعال
                  : "text-text-secondary hover:bg-primary/5 hover:text-primary"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* آیتم‌های پایین sidebar — پروفایل و تنظیمات */}
      <div className="px-3 py-4 border-t border-border flex flex-col gap-1">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
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
  );
}