"use client";

import { useState } from "react";
import { Plus, Upload, Download } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Card, Button } from "@/components/ui";
import { UsageTable, UsageDialog, ImportDialog } from "@/components/usage";
import { useUsageRecords, useSettings } from "@/hooks";
import { useUsageDialogStore } from "@/stores";

const PAGE_SIZE = 20;

export default function UsagePage() {
  const [page, setPage] = useState(1);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const openCreate = useUsageDialogStore((state) => state.openCreate);
  const { data: settings } = useSettings();
  const unit = settings?.usageUnit ?? "GB";

  const { data, isLoading } = useUsageRecords({
    page,
    pageSize: PAGE_SIZE,
    sort: "date_desc",
  });

  const totalPages = data?.totalPages ?? 1;

  return (
    <>
      <PageHeader
        title="Usage"
        description="Add, edit, and import your daily internet usage."
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsImportOpen(true)}
              className="hidden sm:inline-flex"
            >
              <Upload className="size-4" aria-hidden="true" />
              Import
            </Button>
            <a href="/api/usage/export" download>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Download className="size-4" aria-hidden="true" />
                Export
              </Button>
            </a>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" aria-hidden="true" />
              Add record
            </Button>
          </>
        }
      />

      <div className="space-y-4 p-4 md:p-8">
        <div className="flex gap-2 sm:hidden">
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => setIsImportOpen(true)}>
            <Upload className="size-4" aria-hidden="true" />
            Import
          </Button>
          <a href="/api/usage/export" download className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              <Download className="size-4" aria-hidden="true" />
              Export
            </Button>
          </a>
        </div>

        <Card>
          <UsageTable records={data?.items ?? []} unit={unit} isLoading={isLoading} />

          {data && data.total > 0 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-ink-secondary">
                Page {data.page} of {totalPages} · {data.total} record{data.total === 1 ? "" : "s"}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <UsageDialog />
      <ImportDialog open={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </>
  );
}
