import { cn } from "@/utils";

export interface UsageRingProps {
  percent: number; // 0-100+, values over 100 render as a full ring in danger tone
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * A single restrained progress ring (deliberately not a multi-ring Activity-
 * style cluster — this app tracks one quantity, so one ring). Color
 * transitions from accent -> warning -> danger as the percentage crosses
 * 90% / 100%, giving an at-a-glance severity read without extra UI.
 */
export function UsageRing({
  percent,
  size = 180,
  strokeWidth = 14,
  className,
  children,
}: UsageRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(percent, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;

  const tone =
    percent >= 100
      ? "var(--color-danger)"
      : percent >= 90
        ? "var(--color-warning)"
        : "var(--color-accent)";

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={`${Math.round(percent)}% of monthly quota used`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease-out, stroke 0.3s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
