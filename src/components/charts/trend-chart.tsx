"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReportBucket } from "@/types";
import { ChartTooltip } from "./chart-tooltip";
import { EmptyState } from "@/components/ui";
import { TrendingUp } from "lucide-react";

export interface TrendChartProps {
  buckets: ReportBucket[];
  unit: string;
}

export function TrendChart({ buckets, unit }: TrendChartProps) {
  if (buckets.length === 0) {
    return (
      <EmptyState
        icon={<TrendingUp className="size-5" aria-hidden="true" />}
        title="Not enough data for a trend yet"
        description="Trends appear once you have usage logged across multiple periods."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={buckets} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "var(--color-ink-secondary)" }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--color-ink-secondary)" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={(props) => <ChartTooltip {...props} unit={unit} />} />
        <Line
          type="monotone"
          dataKey="totalGb"
          stroke="var(--color-accent)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--color-accent)", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
