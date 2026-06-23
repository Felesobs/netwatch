"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReportBucket } from "@/types";
import { ChartTooltip } from "./chart-tooltip";
import { EmptyState } from "@/components/ui";
import { ArrowUpDown } from "lucide-react";

export interface UploadDownloadChartProps {
  buckets: ReportBucket[];
  unit: string;
}

export function UploadDownloadChart({ buckets, unit }: UploadDownloadChartProps) {
  if (buckets.length === 0) {
    return (
      <EmptyState
        icon={<ArrowUpDown className="size-5" aria-hidden="true" />}
        title="No upload/download data yet"
        description="This breaks down your traffic once usage records are logged."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={buckets} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
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
        <Legend
          wrapperStyle={{ fontSize: 12, color: "var(--color-ink-secondary)" }}
          formatter={(value) => (value === "downloadGb" ? "Download" : "Upload")}
        />
        <Area
          type="monotone"
          dataKey="downloadGb"
          stackId="1"
          stroke="var(--color-success)"
          fill="url(#downloadGradient)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="uploadGb"
          stackId="1"
          stroke="var(--color-accent)"
          fill="url(#uploadGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
