import { Card, CardContent } from "@/components/ui";
import { formatDataAmount, formatPercent } from "@/utils";
import type { UsageUnit } from "@/types";
import type { HistoricalComparison } from "@/hooks/use-summary";
import { cn } from "@/utils";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

export interface HistoricalComparisonCardProps {
  comparison: HistoricalComparison;
  unit: UsageUnit;
}

export function HistoricalComparisonCard({ comparison, unit }: HistoricalComparisonCardProps) {
  const { previous, percentChange } = comparison;

  if (!previous) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm font-medium text-ink-secondary">Historical comparison</p>
          <p className="mt-2 text-sm text-ink-tertiary">
            Not enough history yet — this will populate once you have data from a previous
            billing period.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isUp = (percentChange ?? 0) > 0;
  const isFlat = percentChange === null || Math.abs(percentChange) < 0.5;

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-secondary">vs. previous period</p>
          <p className="tabular-data mt-1 text-xl font-semibold text-ink-primary">
            {formatDataAmount(previous.totalGb, unit)}
          </p>
          <p className="text-xs text-ink-tertiary">
            {previous.periodStart} – {previous.periodEnd}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
            isFlat
              ? "bg-canvas text-ink-secondary"
              : isUp
                ? "bg-danger-subtle text-danger"
                : "bg-success-subtle text-success",
          )}
        >
          {isFlat ? (
            <Minus className="size-3.5" aria-hidden="true" />
          ) : isUp ? (
            <TrendingUp className="size-3.5" aria-hidden="true" />
          ) : (
            <TrendingDown className="size-3.5" aria-hidden="true" />
          )}
          {percentChange !== null ? formatPercent(Math.abs(percentChange), 1) : "—"}
        </div>
      </CardContent>
    </Card>
  );
}
