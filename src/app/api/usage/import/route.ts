import Papa from "papaparse";
import { withErrorHandling, apiSuccess, apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { csvImportRowSchema, type CsvImportRow } from "@/lib/validation";
import { bulkImportUsageRecords } from "@/services";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_ROWS = 5000;

/**
 * Expects a multipart/form-data upload with a single `file` field containing
 * a CSV with headers: date, uploadGb, downloadGb, provider (optional), notes
 * (optional). Existing (date, provider) pairs are updated; new ones are
 * inserted — see `bulkImportUsageRecords`.
 */
export const POST = withErrorHandling(async (request: Request) => {
  const session = await requireSession();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return apiError("VALIDATION_ERROR", "No file was provided", 422);
  }
  if (file.size > MAX_FILE_BYTES) {
    return apiError("VALIDATION_ERROR", "File exceeds the 2MB limit", 422);
  }

  const ALLOWED_MIME_TYPES = ["text/csv", "text/plain", "application/csv", "application/vnd.ms-excel"];
  const hasValidExtension = file.name.toLowerCase().endsWith(".csv");
  const hasValidMime = !file.type || ALLOWED_MIME_TYPES.includes(file.type);

  if (!hasValidExtension || !hasValidMime) {
    return apiError("VALIDATION_ERROR", "Only .csv files are supported", 422);
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    return apiError(
      "VALIDATION_ERROR",
      `CSV parsing failed: ${parsed.errors[0].message}`,
      422,
    );
  }

  if (parsed.data.length > MAX_ROWS) {
    return apiError(
      "VALIDATION_ERROR",
      `CSV contains too many rows (max ${MAX_ROWS})`,
      422,
    );
  }

  const validRows: CsvImportRow[] = [];
  const parseErrors: Array<{ row: number; message: string }> = [];

  parsed.data.forEach((rawRow, index) => {
    const result = csvImportRowSchema.safeParse(rawRow);
    if (result.success) {
      validRows.push(result.data);
    } else {
      parseErrors.push({
        row: index + 2, // +1 for header row, +1 for 1-indexing
        message: result.error.issues[0]?.message ?? "Invalid row",
      });
    }
  });

  const importResult = await bulkImportUsageRecords(session.userId, validRows);

  return apiSuccess({
    ...importResult,
    errors: [...parseErrors, ...importResult.errors].sort((a, b) => a.row - b.row),
  });
});
