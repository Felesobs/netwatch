"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { SettingsUpdateInput } from "@/lib/validation";
import type { UserSettings } from "@/types";
import { useDisplayPreferencesStore } from "@/stores";
import { queryKeys } from "./query-keys";

export function useSettings() {
  const setUsageUnit = useDisplayPreferencesStore((state) => state.setUsageUnit);

  const query = useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => apiFetch<UserSettings>("/api/settings"),
    staleTime: 5 * 60_000,
  });

  // Keep the Zustand display-unit mirror in sync once settings load, so
  // every component reading the unit gets it without prop drilling.
  useEffect(() => {
    if (query.data) setUsageUnit(query.data.usageUnit);
  }, [query.data, setUsageUnit]);

  return query;
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const setUsageUnit = useDisplayPreferencesStore((state) => state.setUsageUnit);

  return useMutation({
    mutationFn: (input: SettingsUpdateInput) =>
      apiFetch<UserSettings>("/api/settings", { method: "PATCH", body: input }),
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.settings, settings);
      queryClient.invalidateQueries({ queryKey: queryKeys.summary });
      setUsageUnit(settings.usageUnit);
      toast.success("Settings saved");
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : "Couldn't save settings");
    },
  });
}
