"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { ReportGranularity, ReportResult } from "@/types";
import { queryKeys } from "./query-keys";

export function useReport(from: string, to: string, granularity: ReportGranularity) {
  return useQuery({
    queryKey: queryKeys.report(from, to, granularity),
    queryFn: () =>
      apiFetch<ReportResult>(
        `/api/reports?from=${from}&to=${to}&granularity=${granularity}`,
      ),
    enabled: Boolean(from && to),
  });
}
