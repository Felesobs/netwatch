import { ArrowUp, ArrowDown, Gauge, TrendingUp } from "lucide-react";
import { StatCard } from "./stat-card";
import { formatDataAmount } from "@/utils";
import type { MonthlySummary, UsageUnit } from "@/types";

export interface StatGridProps {
  summary: MonthlySummary;
  unit: UsageUnit;
}

export function StatGrid({ summary, unit }: StatGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard
        label="Uploaded"
        value={formatDataAmount(summary.totalUploadGb, unit)}
        icon={<ArrowUp className="size-4" aria-hidden="true" />}
      />
      <StatCard
        label="Downloaded"
        value={formatDataAmount(summary.totalDownloadGb, unit)}
        icon={<ArrowDown className="size-4" aria-hidden="true" />}
      />
      <StatCard
        label="Daily average"
        value={formatDataAmount(summary.dailyAverageGb, unit)}
        icon={<Gauge className="size-4" aria-hidden="true" />}
      />
      <StatCard
        label="Predicted month-end"
        value={formatDataAmount(summary.predictedTotalGb, unit)}
        icon={<TrendingUp className="size-4" aria-hidden="true" />}
        trend={
          summary.quotaGb
            ? {
                value:
                  summary.predictedTotalGb > summary.quotaGb
                    ? "Trending over quota"
                    : "Trending under quota",
                tone: summary.predictedTotalGb > summary.quotaGb ? "negative" : "positive",
              }
            : undefined
        }
      />
    </div>
  );
}
