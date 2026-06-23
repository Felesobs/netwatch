"use client";

import { lazy, Suspense, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useReport } from "@/hooks";
import { cn, formatIsoDate } from "@/utils";
import type { ReportGranularity, UsageUnit } from "@/types";

// Lazy-load each chart variant: Recharts is ~8.8MB on disk. Splitting by
// chart type means the initial dashboard bundle only includes the code for
// the active tab, not all three renderers at once.
const DailyUsageChart = lazy(() =>
  import("@/components/charts/daily-usage-chart").then((m) => ({ default: m.DailyUsageChart })),
);
const TrendChart = lazy(() =>
  import("@/components/charts/trend-chart").then((m) => ({ default: m.TrendChart })),
);
const UploadDownloadChart = lazy(() =>
  import("@/components/charts/upload-download-chart").then((m) => ({
    default: m.UploadDownloadChart,
  })),
);

type ChartTab = "daily" | "weekly" | "monthly" | "uploadDownload";

const TABS: { id: ChartTab; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "uploadDownload", label: "Upload vs Download" },
];

function granularityForTab(tab: ChartTab): ReportGranularity {
  if (tab === "weekly") return "weekly";
  if (tab === "monthly") return "monthly";
  return "daily";
}

function rangeForTab(tab: ChartTab): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  if (tab === "monthly") {
    from.setUTCMonth(from.getUTCMonth() - 11);
  } else if (tab === "weekly") {
    from.setUTCDate(from.getUTCDate() - 7 * 12);
  } else {
    from.setUTCDate(from.getUTCDate() - 29);
  }
  return { from: formatIsoDate(from), to: formatIsoDate(to) };
}

const CHART_HEIGHT = "h-[280px]";

function ChartFallback() {
  return (
    <div className={`flex ${CHART_HEIGHT} items-center justify-center text-sm text-ink-tertiary`}>
      Loading chart…
    </div>
  );
}

export interface UsageChartsPanelProps {
  unit: UsageUnit;
}

export function UsageChartsPanel({ unit }: UsageChartsPanelProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>("daily");

  const { from, to } = useMemo(() => rangeForTab(activeTab), [activeTab]);
  const granularity = granularityForTab(activeTab);
  const { data: report, isLoading } = useReport(from, to, granularity);

  const buckets = report?.buckets ?? [];

  return (
    <Card>
      <CardHeader className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base font-semibold text-ink-primary">Usage trends</CardTitle>
        <div className="flex gap-1 overflow-x-auto rounded-(--radius-md) bg-canvas p-1 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 rounded-(--radius-sm) px-3 py-1.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-surface text-ink-primary shadow-(--shadow-sm)"
                  : "text-ink-secondary hover:text-ink-primary",
              )}
              aria-pressed={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartFallback />
        ) : (
          <Suspense fallback={<ChartFallback />}>
            {activeTab === "uploadDownload" ? (
              <UploadDownloadChart buckets={buckets} unit={unit} />
            ) : activeTab === "daily" ? (
              <DailyUsageChart buckets={buckets} unit={unit} />
            ) : (
              <TrendChart buckets={buckets} unit={unit} />
            )}
          </Suspense>
        )}
      </CardContent>
    </Card>
  );
}
