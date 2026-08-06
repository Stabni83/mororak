"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface SidebarSubItem {
  label: string;
  // وقتی کلیک می‌شود این تابع صدا زده می‌شود (مثلاً تغییر activeSubject در صفحه)
  onClick: () => void;
  isActive?: boolean;
  count?: number;
}

interface SidebarContextValue {
  // باز/بسته بودن سایدبار در موبایل
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;

  // زیرمنوی فعلی — هر صفحه (notes/questions) با useEffect این را ست می‌کند
  subItems: SidebarSubItem[] | null;
  setSubItems: (items: SidebarSubItem[] | null) => void;

  // کدام لینک اصلی سایدبار باز/expand شده — معمولاً هم‌نام مسیر فعلی
  expandedHref: string | null;
  setExpandedHref: (href: string | null) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [subItems, setSubItems] = useState<SidebarSubItem[] | null>(null);
  const [expandedHref, setExpandedHref] = useState<string | null>(null);

  const value: SidebarContextValue = {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
    subItems,
    setSubItems,
    expandedHref,
    setExpandedHref,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar باید داخل SidebarProvider استفاده شود");
  }
  return ctx;
}


export function useSidebarSubItems(href: string, items: SidebarSubItem[]) {
  const { setSubItems, setExpandedHref } = useSidebar();

  useEffect(() => {
    setExpandedHref(href);
    setSubItems(items);

    return () => {
      setSubItems(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [href, JSON.stringify(items.map((i) => ({ l: i.label, a: i.isActive, c: i.count })))]);
}