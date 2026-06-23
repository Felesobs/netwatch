"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReportBucket } from "@/types";
import { ChartTooltip } from "./chart-tooltip";
import { EmptyState } from "@/components/ui";
import { BarChart3 } from "lucide-react";

export interface DailyUsageChartProps {
  buckets: ReportBucket[];
  unit: string;
}

export function DailyUsageChart({ buckets, unit }: DailyUsageChartProps) {
  if (buckets.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 className="size-5" aria-hidden="true" />}
        title="No usage data yet"
        description="Add a usage record to see your daily trend here."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={buckets} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "var(--color-ink-secondary)" }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--color-ink-secondary)" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          content={(props) => <ChartTooltip {...props} unit={unit} />}
          cursor={{ fill: "var(--color-canvas)" }}
        />
        <Bar dataKey="totalGb" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
