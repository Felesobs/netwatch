import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui";
import { cn } from "@/utils";

export interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  trend?: { value: string; tone: "positive" | "negative" | "neutral" };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink-secondary">{label}</p>
          {icon && <div className="text-ink-tertiary">{icon}</div>}
        </div>
        <p className="tabular-data text-2xl font-semibold tracking-tight text-ink-primary">
          {value}
        </p>
        {trend && (
          <p
            className={cn(
              "text-xs font-medium",
              trend.tone === "positive" && "text-success",
              trend.tone === "negative" && "text-danger",
              trend.tone === "neutral" && "text-ink-tertiary",
            )}
          >
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
