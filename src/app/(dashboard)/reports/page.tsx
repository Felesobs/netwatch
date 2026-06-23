"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, CardContent, Button } from "@/components/ui";
import { DateRangeForm, ReportTable, exportReportToCsv, exportReportToPdf } from "@/components/reports";
import { useReport, useSettings } from "@/hooks";
import { formatIsoDate } from "@/utils";
import type { ReportGranularity } from "@/types";
import { cn } from "@/utils";

type Preset = "month" | "quarter" | "custom";

function presetRange(preset: Preset): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);

  if (preset === "month") {
    from.setUTCDate(1);
  } else if (preset === "quarter") {
    from.setUTCMonth(from.getUTCMonth() - 2, 1);
  } else {
    from.setUTCDate(from.getUTCDate() - 29);
  }

  return { from: formatIsoDate(from), to: formatIsoDate(to) };
}

export default function ReportsPage() {
  const [preset, setPreset] = useState<Preset>("month");
  const [range, setRange] = useState(() => presetRange("month"));
  const [granularity, setGranularity] = useState<ReportGranularity>("daily");

  const { data: settings } = useSettings();
  const unit = settings?.usageUnit ?? "GB";

  const { data: report, isLoading } = useReport(range.from, range.to, granularity);

  function selectPreset(next: Preset) {
    setPreset(next);
    if (next !== "custom") {
      setRange(presetRange(next));
    }
  }

  return (
    <>
      <PageHeader
        title="Reports"
        description="Generate and export usage reports for any period."
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              disabled={!report}
              onClick={() => report && exportReportToCsv(report, unit)}
            >
              <FileText className="size-4" aria-hidden="true" />
              CSV
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!report}
              onClick={() => report && exportReportToPdf(report, unit)}
            >
              <Download className="size-4" aria-hidden="true" />
              PDF
            </Button>
          </>
        }
      />

      <div className="space-y-4 p-4 md:p-8">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex gap-1 rounded-(--radius-md) bg-canvas p-1">
              {(["month", "quarter", "custom"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectPreset(value)}
                  className={cn(
                    "flex-1 rounded-(--radius-sm) px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                    preset === value
                      ? "bg-surface text-ink-primary shadow-(--shadow-sm)"
                      : "text-ink-secondary hover:text-ink-primary",
                  )}
                  aria-pressed={preset === value}
                >
                  {value === "month" ? "This month" : value === "quarter" ? "This quarter" : "Custom range"}
                </button>
              ))}
            </div>

            <DateRangeForm
              from={range.from}
              to={range.to}
              granularity={granularity}
              onFromChange={(value) => {
                setPreset("custom");
                setRange((prev) => ({ ...prev, from: value }));
              }}
              onToChange={(value) => {
                setPreset("custom");
                setRange((prev) => ({ ...prev, to: value }));
              }}
              onGranularityChange={setGranularity}
            />
          </CardContent>
        </Card>

        <Card>
          <ReportTable report={report} unit={unit} isLoading={isLoading} />
        </Card>
      </div>
    </>
  );
}
