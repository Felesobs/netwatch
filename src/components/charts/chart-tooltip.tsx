import type { TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { formatDataAmount } from "@/utils";
import type { UsageUnit } from "@/types";

interface ChartTooltipProps extends TooltipContentProps<ValueType, NameType> {
  unit: string;
}

export function ChartTooltip({ active, payload, label, unit }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-(--radius-md) border border-border bg-surface-raised px-3 py-2 shadow-(--shadow-md)">
      <p className="text-xs font-medium text-ink-secondary">{label}</p>
      <div className="mt-1 space-y-0.5">
        {payload.map((entry) => (
          <p key={String(entry.dataKey)} className="tabular-data text-sm text-ink-primary">
            <span className="text-ink-secondary">{formatSeriesLabel(String(entry.dataKey))}:</span>{" "}
            {formatDataAmount(Number(entry.value), unit as UsageUnit)}
          </p>
        ))}
      </div>
    </div>
  );
}

function formatSeriesLabel(key: string): string {
  switch (key) {
    case "uploadGb":
      return "Upload";
    case "downloadGb":
      return "Download";
    case "totalGb":
      return "Total";
    default:
      return key;
  }
}
