"use client";

import { useState, type FormEvent } from "react";
import { Button, Input, Label, FieldError } from "@/components/ui";
import { usageRecordCreateSchema } from "@/lib/validation";
import type { UsageRecord } from "@/types";
import { formatIsoDate } from "@/utils";

export interface UsageFormValues {
  date: string;
  uploadGb: string;
  downloadGb: string;
  provider: string;
  notes: string;
}

function defaultValues(record?: UsageRecord): UsageFormValues {
  if (record) {
    return {
      date: record.date,
      uploadGb: String(record.uploadGb),
      downloadGb: String(record.downloadGb),
      provider: record.provider ?? "",
      notes: record.notes ?? "",
    };
  }
  return {
    date: formatIsoDate(new Date()),
    uploadGb: "",
    downloadGb: "",
    provider: "",
    notes: "",
  };
}

export interface UsageFormProps {
  record?: UsageRecord;
  onSubmit: (values: {
    date: string;
    uploadGb: number;
    downloadGb: number;
    provider?: string | null;
    notes?: string | null;
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function UsageForm({ record, onSubmit, onCancel, isSubmitting }: UsageFormProps) {
  const [values, setValues] = useState<UsageFormValues>(() => defaultValues(record));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof UsageFormValues>(key: K, value: UsageFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const parsed = usageRecordCreateSchema.safeParse({
      date: values.date,
      uploadGb: Number(values.uploadGb),
      downloadGb: Number(values.downloadGb),
      provider: values.provider || undefined,
      notes: values.notes || undefined,
    });

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={values.date}
          max={formatIsoDate(new Date())}
          onChange={(event) => update("date", event.target.value)}
          hasError={Boolean(errors.date)}
        />
        <FieldError message={errors.date} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="uploadGb">Upload (GB)</Label>
          <Input
            id="uploadGb"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={values.uploadGb}
            onChange={(event) => update("uploadGb", event.target.value)}
            hasError={Boolean(errors.uploadGb)}
          />
          <FieldError message={errors.uploadGb} />
        </div>
        <div>
          <Label htmlFor="downloadGb">Download (GB)</Label>
          <Input
            id="downloadGb"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={values.downloadGb}
            onChange={(event) => update("downloadGb", event.target.value)}
            hasError={Boolean(errors.downloadGb)}
          />
          <FieldError message={errors.downloadGb} />
        </div>
      </div>

      <div>
        <Label htmlFor="provider">Provider (optional)</Label>
        <Input
          id="provider"
          placeholder="e.g. Comcast Xfinity"
          value={values.provider}
          onChange={(event) => update("provider", event.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input
          id="notes"
          placeholder="e.g. Heavy streaming weekend"
          value={values.notes}
          onChange={(event) => update("notes", event.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {record ? "Save changes" : "Add record"}
        </Button>
      </div>
    </form>
  );
}
