import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;

  showLabel?: boolean;

  color?: "primary" | "success" | "secondary";

  className?: string;
}

const colorStyles = {
  primary: "bg-primary",
  success: "bg-success",
  secondary: "bg-secondary",
};

export default function ProgressBar({
  value,
  showLabel = false,
  color = "primary",
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("flex items-center gap-2", className)}>

      {/* Track — پس‌زمینه خاکستری نوار */}
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">

        {/* Fill — بخش پر شده */}
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            colorStyles[color]
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>

      {/* درصد — اختیاری */}
      {showLabel && (
        <span className="text-xs font-semibold text-text-secondary w-8 text-left">
          {clampedValue}٪
        </span>
      )}

    </div>
  );
}
