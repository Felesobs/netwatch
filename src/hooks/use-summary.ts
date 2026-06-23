"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { HistoricalComparison } from "@/types";
import { queryKeys } from "./query-keys";

export type { HistoricalComparison };

export function useSummary() {
  return useQuery({
    queryKey: queryKeys.summary,
    queryFn: () => apiFetch<HistoricalComparison>("/api/summary"),
    refetchInterval: 5 * 60_000,
  });
}
