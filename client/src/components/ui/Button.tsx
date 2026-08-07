"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";

  size?: "sm" | "md" | "lg";

  fullWidth?: boolean;
}

const variantStyles = {
  primary:
    "bg-primary text-white hover:opacity-90 active:scale-95 shadow-sm",
  ghost:
    "border border-primary text-primary hover:bg-primary/5 active:scale-95",
  outline:
    "border border-border text-text-secondary hover:border-primary hover:text-primary active:scale-95",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

export default function Button({
  variant = "primary",   // مقدار پیش‌فرض: primary
  size = "md",
  fullWidth = false,
  className,             // اجازه می‌دهد کلاس سفارشی از بیرون اضافه شود
  children,
  ...props               // بقیه props مثل onClick به button می‌رسند
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "rounded-md font-semibold",
        "transition-all duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
