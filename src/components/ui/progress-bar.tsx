import { cn } from "@/utils";

export interface ProgressBarProps {
  value: number; // 0-100, may exceed 100 (clamped visually, not numerically)
  className?: string;
  label?: string;
}

export function ProgressBar({ value, className, label }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const tone =
    value >= 100 ? "bg-danger" : value >= 90 ? "bg-warning" : "bg-accent";

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-canvas",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", tone)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
