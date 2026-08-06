import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;

  // variant رنگ badge را تعیین می‌کند
  variant?: "primary" | "secondary" | "accent" | "success" | "warning" | "neutral";

  className?: string;
}

// رنگ هر variant
const variantStyles = {
  primary:  "bg-primary/10 text-primary border border-primary/20",
  secondary:"bg-secondary/10 text-secondary border border-secondary/20",
  accent:   "bg-accent/10 text-accent border border-accent/20",
  success:  "bg-green-50 text-green-700 border border-green-200",
  warning:  "bg-amber-50 text-amber-700 border border-amber-200",
  neutral:  "bg-gray-100 text-gray-600 border border-gray-200",
};

export default function Badge({
  children,
  variant = "primary",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        // پایه — کوچک، گرد، فونت bold
        "inline-flex items-center px-2 py-0.5",
        "rounded-full text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}