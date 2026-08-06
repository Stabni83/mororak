import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { box: "w-7 h-7", text: "text-sm", radius: "rounded-sm" },
  md: { box: "w-9 h-9", text: "text-base", radius: "rounded-lg" },
  lg: { box: "w-14 h-14", text: "text-2xl", radius: "rounded-xl" },
};


export default function Logo({ size = "sm", className }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div
      className={cn(
        s.box,
        s.radius,
        "aspect-square shrink-0 bg-primary flex items-center justify-center",
        "text-white font-extrabold",
        s.text,
        className
      )}
    >
      م
    </div>
  );
}