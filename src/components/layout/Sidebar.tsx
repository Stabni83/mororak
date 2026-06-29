"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { SUBJECT_LABELS, type Subject } from "@/types";
import Logo from "@/components/ui/Logo";
import {
  Home,
  HelpCircle,
  FileText,
  Bookmark,
  ChevronDown,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
  hasCategories?: boolean;
}

const navItems: NavItem[] = [
  { label: "داشبورد", href: "/dashboard", icon: Home },
  { label: "سوالات", href: "/dashboard/questions", icon: HelpCircle, hasCategories: true },
  { label: "جزوات", href: "/dashboard/notes", icon: FileText, hasCategories: true },
  { label: "ذخیره‌شده", href: "/saved", icon: Bookmark },
];

const subjectList: Subject[] = ["algorithm", "data-structure", "os", "network", "database"];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useSidebar();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    navItems.forEach((item) => {
      if (item.hasCategories && pathname.startsWith(item.href)) {
        setExpanded((prev) => ({ ...prev, [item.href]: true }));
      }
    });
  }, [pathname]);

  function toggleExpand(href: string) {
    setExpanded((prev) => ({ ...prev, [href]: !prev[href] }));
  }

  function goToSubject(basePath: string, subject: Subject | "all") {
    const query = subject === "all" ? "" : `?subject=${subject}`;
    router.push(`${basePath}${query}`);
    close();
  }

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
          "w-64 bg-surface border-l border-border flex flex-col",
          "transition-transform duration-200",
          isOpen ? "translate-x-0" : "translate-x-full",
          "lg:translate-x-0 lg:static lg:z-auto"
        )}
      >
        {/* لوگو */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0">
          <Logo size="sm" />
          <span className="text-base font-bold text-primary">مرورک</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            const isExpanded = !!expanded[item.href];

            return (
              <div key={item.href}>
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "flex-1 flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150",
                      isActive
                        ? "bg-primary/8 text-primary font-semibold"
                        : "text-text-secondary hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    <Icon size={18} strokeWidth={2.2} />
                    {item.label}
                  </Link>

                  {item.hasCategories && (
                    <button
                      onClick={() => toggleExpand(item.href)}
                      className="w-8 h-8 flex items-center justify-center text-text-muted
                                 hover:text-primary transition-colors shrink-0"
                      aria-label="نمایش دسته‌بندی‌ها"
                    >
                      <ChevronDown
                        size={15}
                        className={cn(
                          "transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>
                  )}
                </div>

                {item.hasCategories && (
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      isExpanded ? "max-h-96 opacity-100 mt-0.5" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="flex flex-col gap-0.5 pr-3 pl-1 border-r-2 border-border mr-[1.15rem]">
                      <button
                        onClick={() => goToSubject(item.href, "all")}
                        className="text-right px-3 py-1.5 rounded text-xs text-text-secondary
                                   hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        همه دروس
                      </button>
                      {subjectList.map((subject) => (
                        <button
                          key={subject}
                          onClick={() => goToSubject(item.href, subject)}
                          className="text-right px-3 py-1.5 rounded text-xs text-text-secondary
                                     hover:text-primary hover:bg-primary/5 transition-colors"
                        >
                          {SUBJECT_LABELS[subject]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}