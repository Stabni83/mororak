// "use client" یعنی این کامپوننت در مرورگر اجرا می‌شود
// در Next.js App Router، کامپوننت‌هایی که event داریم باید این را داشته باشند
"use client";

import { cn } from "@/lib/utils";

// ─── تعریف Props ──────────────────────────────
// ButtonHTMLAttributes یعنی همه props استاندارد HTML button را هم قبول می‌کنیم
// مثل onClick، disabled، type و...
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // variant مشخص می‌کند دکمه چه ظاهری داشته باشد
  variant?: "primary" | "ghost" | "outline";

  // size برای اندازه‌های مختلف
  size?: "sm" | "md" | "lg";

  // fullWidth برای دکمه‌هایی که باید عرض کامل بگیرند (مثل فرم‌ها)
  fullWidth?: boolean;
}

// ─── استایل‌های هر variant ───────────────────
// این آبجکت‌ها کلاس‌های Tailwind مناسب هر حالت را نگه می‌دارند
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

// ─── Component ───────────────────────────────
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
        // استایل‌های پایه که همه دکمه‌ها دارند
        "inline-flex items-center justify-center gap-2",
        "rounded-md font-semibold",
        "transition-all duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        // استایل variant انتخاب‌شده
        variantStyles[variant],
        // استایل size انتخاب‌شده
        sizeStyles[size],
        // اگر fullWidth باشد عرض کامل می‌گیرد
        fullWidth && "w-full",
        // کلاس‌های سفارشی از بیرون (با اولویت بالاتر)
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}