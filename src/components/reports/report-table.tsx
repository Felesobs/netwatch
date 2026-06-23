import { EmptyState, Skeleton } from "@/components/ui";
import { formatDataAmount } from "@/utils";
import type { ReportResult, UsageUnit } from "@/types";
import { FileBarChart } from "lucide-react";

export interface ReportTableProps {
  report: ReportResult | undefined;
  unit: UsageUnit;
  isLoading: boolean;
}

export function ReportTable({ report, unit, isLoading }: ReportTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!report || report.buckets.length === 0) {
    return (
      <EmptyState
        icon={<FileBarChart className="size-5" aria-hidden="true" />}
        title="No data for this range"
        description="Choose a different date range or granularity."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-ink-tertiary">
            <th scope="col" className="px-4 py-3">Period</th>
            <th scope="col" className="px-4 py-3 text-right">Upload</th>
            <th scope="col" className="px-4 py-3 text-right">Download</th>
            <th scope="col" className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {report.buckets.map((bucket) => (
            <tr key={bucket.periodStart} className="hover:bg-canvas">
              <td className="px-4 py-3 text-ink-primary">{bucket.label}</td>
              <td className="tabular-data px-4 py-3 text-right text-ink-secondary">
                {formatDataAmount(bucket.uploadGb, unit)}
              </td>
              <td className="tabular-data px-4 py-3 text-right text-ink-secondary">
                {formatDataAmount(bucket.downloadGb, unit)}
              </td>
              <td className="tabular-data px-4 py-3 text-right font-medium text-ink-primary">
                {formatDataAmount(bucket.totalGb, unit)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border-strong font-medium">
            <td className="px-4 py-3 text-ink-primary">Total</td>
            <td className="tabular-data px-4 py-3 text-right text-ink-primary">
              {formatDataAmount(report.totalUploadGb, unit)}
            </td>
            <td className="tabular-data px-4 py-3 text-right text-ink-primary">
              {formatDataAmount(report.totalDownloadGb, unit)}
            </td>
            <td className="tabular-data px-4 py-3 text-right text-ink-primary">
              {formatDataAmount(report.totalGb, unit)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
