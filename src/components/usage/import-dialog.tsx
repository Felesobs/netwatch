"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Dialog, Button } from "@/components/ui";
import { useImportUsageCsv } from "@/hooks";

export interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ImportDialog({ open, onClose }: ImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const importCsv = useImportUsageCsv();

  function handleImport() {
    if (!selectedFile) return;
    importCsv.mutate(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
        onClose();
      },
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Import usage from CSV"
      description="Columns required: date, uploadGb, downloadGb. Optional: provider, notes."
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-(--radius-md) border-2 border-dashed border-border-strong px-6 py-8 text-center transition-colors hover:border-accent hover:bg-accent-subtle/30"
        >
          <Upload className="size-5 text-ink-tertiary" aria-hidden="true" />
          <span className="text-sm font-medium text-ink-primary">
            {selectedFile ? selectedFile.name : "Choose a CSV file"}
          </span>
          <span className="text-xs text-ink-tertiary">Max 2MB, up to 5,000 rows</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
        />

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!selectedFile} isLoading={importCsv.isPending}>
            Import
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
