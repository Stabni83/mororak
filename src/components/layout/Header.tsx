"use client";

import { useSidebar } from "@/context/SidebarContext";
import { Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { toggle } = useSidebar();

  return (
    <header className="h-14 bg-bg border-b border-border px-4
                       flex items-center justify-between sticky top-0 z-10">

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="lg:hidden w-8 h-8 flex items-center justify-center
                     text-text-secondary hover:text-primary transition-colors"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="text-base font-bold text-text">{title}</h1>
          {subtitle && (
            <p className="text-xs text-text-muted">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20
                        flex items-center justify-center
                        text-sm font-bold text-primary cursor-pointer">
          ع
        </div>
      </div>
    </header>
  );
}