"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  // children = هر محتوایی که داخل کارت می‌رود
  children: React.ReactNode;

  // padding سفارشی — گاهی می‌خواهیم کارت بدون padding باشد
  // مثلاً وقتی تصویر کامل پر می‌کند
  padding?: "none" | "sm" | "md" | "lg";

  // hover effect — برای کارت‌های کلیک‌پذیر
  hoverable?: boolean;

  // کلاس سفارشی از بیرون
  className?: string;

  // برای کلیک روی کارت
  onClick?: () => void;
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",   // پیش‌فرض
  lg: "p-6",
};

export default function Card({
  children,
  padding = "md",
  hoverable = false,
  className,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        // استایل پایه — سفید، border ظریف، گوشه گرد
        "bg-surface border border-border rounded-md shadow-card",

        // padding انتخاب‌شده
        paddingStyles[padding],

        // اگر hoverable باشد، hover effect اضافه می‌شود
        hoverable && [
          "cursor-pointer",
          "transition-all duration-150",
          "hover:shadow-hover hover:border-primary/20",
        ],

        className
      )}
    >
      {children}
    </div>
  );
}