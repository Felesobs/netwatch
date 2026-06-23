"use client";

import { Pencil, Trash2, FileQuestion } from "lucide-react";
import { Button, EmptyState, Skeleton } from "@/components/ui";
import { formatDataAmount } from "@/utils";
import type { UsageRecord, UsageUnit } from "@/types";
import { useUsageDialogStore } from "@/stores";
import { useDeleteUsageRecord } from "@/hooks";
import { useState } from "react";

export type UsageTableProps = {
  records: UsageRecord[];
  unit: UsageUnit;
  isLoading: boolean;
}

export function UsageTable({ records, unit, isLoading }: UsageTableProps) {
  const openEdit = useUsageDialogStore((state) => state.openEdit);
  const deleteRecord = useDeleteUsageRecord();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={<FileQuestion className="size-5" aria-hidden="true" />}
        title="No usage records"
        description="Add your first record or import a CSV to get started."
      />
    );
  }

  function confirmDelete(id: string) {
    if (pendingDeleteId === id) {
      deleteRecord.mutate(id);
      setPendingDeleteId(null);
    } else {
      setPendingDeleteId(id);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-ink-tertiary">
            <th scope="col" className="px-4 py-3">Date</th>
            <th scope="col" className="px-4 py-3 text-right">Upload</th>
            <th scope="col" className="px-4 py-3 text-right">Download</th>
            <th scope="col" className="px-4 py-3 text-right">Total</th>
            <th scope="col" className="hidden px-4 py-3 sm:table-cell">Provider</th>
            <th scope="col" className="px-4 py-3 text-right">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {records.map((record) => (
            <tr key={record.id} className="transition-colors hover:bg-canvas">
              <td className="px-4 py-3 text-ink-primary">
                {new Date(record.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </td>
              <td className="tabular-data px-4 py-3 text-right text-ink-secondary">
                {formatDataAmount(record.uploadGb, unit)}
              </td>
              <td className="tabular-data px-4 py-3 text-right text-ink-secondary">
                {formatDataAmount(record.downloadGb, unit)}
              </td>
              <td className="tabular-data px-4 py-3 text-right font-medium text-ink-primary">
                {formatDataAmount(record.uploadGb + record.downloadGb, unit)}
              </td>
              <td className="hidden px-4 py-3 text-ink-secondary sm:table-cell">
                {record.provider || "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 px-0"
                    onClick={() => openEdit(record)}
                    aria-label={`Edit record from ${record.date}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      pendingDeleteId === record.id
                        ? "h-8 px-2 text-xs text-danger"
                        : "h-8 w-8 px-0 text-ink-tertiary hover:text-danger"
                    }
                    onClick={() => confirmDelete(record.id)}
                    aria-label={`Delete record from ${record.date}`}
                  >
                    {pendingDeleteId === record.id ? (
                      "Confirm?"
                    ) : (
                      <Trash2 className="size-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
