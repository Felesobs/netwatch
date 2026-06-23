"use client";

import { Dialog } from "@/components/ui";
import { UsageForm } from "./usage-form";
import { useUsageDialogStore } from "@/stores";
import { useCreateUsageRecord, useUpdateUsageRecord } from "@/hooks";

export function UsageDialog() {
  const mode = useUsageDialogStore((state) => state.mode);
  const close = useUsageDialogStore((state) => state.close);

  const createRecord = useCreateUsageRecord();
  const updateRecord = useUpdateUsageRecord();

  const isOpen = mode !== null;
  const editingRecord = mode && mode.record !== null ? mode.record : undefined;
  const isSubmitting = createRecord.isPending || updateRecord.isPending;

  function handleSubmit(values: {
    date: string;
    uploadGb: number;
    downloadGb: number;
    provider?: string | null;
    notes?: string | null;
  }) {
    if (editingRecord) {
      updateRecord.mutate(
        { id: editingRecord.id, input: values },
        { onSuccess: close },
      );
    } else {
      createRecord.mutate(values, { onSuccess: close });
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={close}
      title={editingRecord ? "Edit usage record" : "Add usage record"}
      description={
        editingRecord
          ? "Update the upload and download amounts for this day."
          : "Log upload and download usage for a specific day."
      }
    >
      <UsageForm
        key={editingRecord?.id ?? "create"}
        record={editingRecord}
        onSubmit={handleSubmit}
        onCancel={close}
        isSubmitting={isSubmitting}
      />
    </Dialog>
  );
}
