"use client";

import { UsageRing, Badge } from "@/components/ui";
import { Card, CardContent } from "@/components/ui";
import { formatDataAmount, formatPercent } from "@/utils";
import type { MonthlySummary, UsageUnit } from "@/types";

export interface UsageSummaryHeroProps {
  summary: MonthlySummary;
  unit: UsageUnit;
}

export function UsageSummaryHero({ summary, unit }: UsageSummaryHeroProps) {
  const percent = summary.percentOfQuota;
  const hasQuota = summary.quotaGb !== null;

  const statusTone =
    percent === null ? "neutral" : percent >= 100 ? "danger" : percent >= 90 ? "warning" : "accent";
  const statusLabel =
    percent === null
      ? "No quota set"
      : percent >= 100
        ? "Quota exceeded"
        : percent >= 90
          ? "Approaching limit"
          : "On track";

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:items-center sm:justify-around">
        <UsageRing percent={percent ?? 0} size={176} strokeWidth={14}>
          <span className="tabular-data text-3xl font-semibold text-ink-primary">
            {percent !== null ? formatPercent(percent, 0) : "—"}
          </span>
          <span className="text-xs text-ink-secondary">of quota</span>
        </UsageRing>

        <div className="w-full max-w-xs space-y-4 text-center sm:text-left">
          <div>
            <Badge tone={statusTone}>{statusLabel}</Badge>
          </div>
          <div>
            <p className="tabular-data text-3xl font-semibold tracking-tight text-ink-primary">
              {formatDataAmount(summary.totalGb, unit)}
            </p>
            <p className="text-sm text-ink-secondary">
              {hasQuota
                ? `of ${formatDataAmount(summary.quotaGb!, unit)} this period`
                : "used this period"}
            </p>
          </div>
          <p className="text-xs text-ink-tertiary">
            {summary.periodStart} – {summary.periodEnd} · {summary.daysRemaining} day
            {summary.daysRemaining === 1 ? "" : "s"} remaining
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
