"use client";

import { Input, Label, Select } from "@/components/ui";
import type { ReportGranularity } from "@/types";

export interface DateRangeFormProps {
  from: string;
  to: string;
  granularity: ReportGranularity;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onGranularityChange: (value: ReportGranularity) => void;
}

export function DateRangeForm({
  from,
  to,
  granularity,
  onFromChange,
  onToChange,
  onGranularityChange,
}: DateRangeFormProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="report-from">From</Label>
        <Input
          id="report-from"
          type="date"
          value={from}
          max={to}
          onChange={(event) => onFromChange(event.target.value)}
        />
      </div>
      <div className="flex-1">
        <Label htmlFor="report-to">To</Label>
        <Input
          id="report-to"
          type="date"
          value={to}
          min={from}
          onChange={(event) => onToChange(event.target.value)}
        />
      </div>
      <div className="flex-1">
        <Label htmlFor="report-granularity">Granularity</Label>
        <Select
          id="report-granularity"
          value={granularity}
          onChange={(event) => onGranularityChange(event.target.value as ReportGranularity)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </Select>
      </div>
    </div>
  );
}
