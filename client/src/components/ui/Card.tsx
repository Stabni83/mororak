"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;

  padding?: "none" | "sm" | "md" | "lg";

  hoverable?: boolean;

  className?: string;

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
        "bg-surface border border-border rounded-md shadow-card",

        paddingStyles[padding],

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
