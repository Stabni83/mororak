"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import Logo from "@/components/ui/Logo";
import {
  LayoutDashboard,
  FileText,
  Settings,
  ArrowRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const adminNavItems: NavItem[] = [
  { label: "داشبورد مدیریت", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "مدیریت جزوات و سوالات", href: "/admin/notes", icon: FileText },
  { label: "تنظیمات سیستم", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 right-0 h-screen z-30",
          "w-64 bg-surface border-l border-border flex flex-col shrink-0",
          "transition-transform duration-200",
          isOpen ? "translate-x-0" : "translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto"
        )}
      >
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0">
          <Logo size="sm" />
          <span className="text-base font-bold text-primary">مدیریت مرورک</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150",
                  isActive
                    ? "bg-primary/8 text-primary font-semibold"
                    : "text-text-secondary hover:bg-primary/5 hover:text-primary"
                )}
              >
                <Icon size={18} strokeWidth={2.2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border shrink-0">
          <Link
            href="/dashboard"
            onClick={close}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <ArrowRight size={18} strokeWidth={2.2} />
            <span>بازگشت به پنل کاربری</span>
          </Link>
        </div>
      </aside>
    </>
  );
}