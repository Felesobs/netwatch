"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Alert, AlertStatus } from "@/types";
import { queryKeys } from "./query-keys";

export function useAlerts(status?: AlertStatus) {
  return useQuery({
    queryKey: queryKeys.alerts(status),
    queryFn: () =>
      apiFetch<Alert[]>(`/api/alerts${status ? `?status=${status}` : ""}`),
    refetchInterval: 60_000,
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch<Alert>(`/api/alerts/${id}`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
