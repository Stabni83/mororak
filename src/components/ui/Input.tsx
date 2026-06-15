"use client";

import { cn } from "@/lib/utils";

// InputHTMLAttributes یعنی همه props استاندارد input مثل
// type, placeholder, value, onChange, disabled را هم قبول می‌کنیم
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // label — متنی که بالای input نشان داده می‌شود
  label?: string;

  // error — پیغام خطا زیر input (مثلاً "ایمیل نامعتبر است")
  error?: string;

  // hint — راهنمای کوچک زیر input (مثلاً "حداقل ۸ کاراکتر")
  hint?: string;

  // icon — آیکون داخل input (اختیاری)
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  icon,
  className,
  id,
  ...props   // بقیه props مثل type, placeholder, onChange
}: InputProps) {
  // اگر id نداشتیم از name استفاده می‌کنیم
  // id برای اتصال label به input لازم است
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5 w-full">

      {/* Label — اگر تعریف شده باشد نشان می‌دهد */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-text-secondary"
        >
          {label}
        </label>
      )}

      {/* wrapper برای input و icon */}
      <div className="relative">

        {/* آیکون — اگر تعریف شده در سمت راست (RTL) قرار می‌گیرد */}
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          className={cn(
            // استایل پایه
            "w-full h-10 rounded-md border text-sm",
            "bg-background text-text",
            "placeholder:text-text-muted",
            "transition-all duration-150",
            "focus:outline-none focus:ring-2",

            // فاصله راست اگر icon داریم
            icon ? "pr-9 pl-3" : "px-3",

            // حالت عادی — border خاکستری، focus آبی
            !error && "border-border focus:border-primary focus:ring-primary/10",

            // حالت خطا — border قرمز
            error && "border-danger focus:border-danger focus:ring-danger/10",

            className
          )}
          {...props}
        />
      </div>

      {/* پیغام خطا — فقط اگر error وجود داشته باشد */}
      {error && (
        <p className="text-xs text-danger font-medium">{error}</p>
      )}

      {/* راهنما — فقط اگر hint وجود داشته باشد و خطایی نباشد */}
      {hint && !error && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}

    </div>
  );
}