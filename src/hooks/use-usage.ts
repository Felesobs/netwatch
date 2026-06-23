"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import type {
  UsageRecordCreateInput,
  UsageRecordUpdateInput,
} from "@/lib/validation";
import type { PaginatedResult, UsageRecord } from "@/types";
import { queryKeys } from "./query-keys";

export interface UsageListParams {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  provider?: string;
  sort?: "date_asc" | "date_desc";
  [key: string]: unknown;
}

function buildQueryString(params: UsageListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return search.toString();
}

export function useUsageRecords(params: UsageListParams = {}) {
  return useQuery({
    queryKey: queryKeys.usageList(params),
    queryFn: () =>
      apiFetch<PaginatedResult<UsageRecord>>(`/api/usage?${buildQueryString(params)}`),
    placeholderData: (previousData) => previousData,
  });
}

function useInvalidateUsageQueries() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["usage"] });
    queryClient.invalidateQueries({ queryKey: queryKeys.summary });
    queryClient.invalidateQueries({ queryKey: ["report"] });
    queryClient.invalidateQueries({ queryKey: ["alerts"] });
  };
}

export function useCreateUsageRecord() {
  const invalidate = useInvalidateUsageQueries();

  return useMutation({
    mutationFn: (input: UsageRecordCreateInput) =>
      apiFetch<UsageRecord>("/api/usage", { method: "POST", body: input }),
    onSuccess: () => {
      invalidate();
      toast.success("Usage record added");
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : "Couldn't add the record");
    },
  });
}

export function useUpdateUsageRecord() {
  const invalidate = useInvalidateUsageQueries();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UsageRecordUpdateInput }) =>
      apiFetch<UsageRecord>(`/api/usage/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => {
      invalidate();
      toast.success("Usage record updated");
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : "Couldn't update the record");
    },
  });
}

export function useDeleteUsageRecord() {
  const invalidate = useInvalidateUsageQueries();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ deleted: true }>(`/api/usage/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      toast.success("Usage record deleted");
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : "Couldn't delete the record");
    },
  });
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
}

export function useImportUsageCsv() {
  const invalidate = useInvalidateUsageQueries();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiFetch<ImportResult>("/api/usage/import", { method: "POST", body: formData });
    },
    onSuccess: (result) => {
      invalidate();
      if (result.errors.length > 0) {
        toast.warning(`Imported ${result.imported} rows with ${result.errors.length} skipped`);
      } else {
        toast.success(`Imported ${result.imported} rows`);
      }
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : "Import failed");
    },
  });
}
