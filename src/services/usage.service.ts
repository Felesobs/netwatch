import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/api";
import type {
  UsageQueryInput,
  UsageRecordCreateInput,
  UsageRecordUpdateInput,
} from "@/lib/validation";
import type { PaginatedResult, UsageRecord } from "@/types";
import { parseIsoDate } from "@/utils";
import { mapUsageRecord } from "./mappers";
import { recomputeSummaryForDate } from "./summary.service";

export async function listUsageRecords(
  userId: string,
  query: UsageQueryInput,
): Promise<PaginatedResult<UsageRecord>> {
  const where: Prisma.UsageRecordWhereInput = {
    userId,
    ...(query.from && { date: { gte: parseIsoDate(query.from) } }),
    ...(query.to && {
      date: { ...(query.from && { gte: parseIsoDate(query.from) }), lte: parseIsoDate(query.to) },
    }),
    ...(query.provider && {
      provider: { contains: query.provider, mode: "insensitive" },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.usageRecord.findMany({
      where,
      orderBy: { date: query.sort === "date_asc" ? "asc" : "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.usageRecord.count({ where }),
  ]);

  return {
    items: items.map(mapUsageRecord),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(Math.ceil(total / query.pageSize), 1),
  };
}

export async function createUsageRecord(
  userId: string,
  input: UsageRecordCreateInput,
): Promise<UsageRecord> {
  const date = parseIsoDate(input.date);

  const created = await prisma.usageRecord.create({
    data: {
      userId,
      date,
      uploadGb: new Prisma.Decimal(input.uploadGb),
      downloadGb: new Prisma.Decimal(input.downloadGb),
      provider: input.provider ?? "",
      notes: input.notes ?? null,
    },
  });

  await recomputeSummaryForDate(userId, date);
  return mapUsageRecord(created);
}

export async function updateUsageRecord(
  userId: string,
  recordId: string,
  input: UsageRecordUpdateInput,
): Promise<UsageRecord> {
  const existing = await prisma.usageRecord.findFirst({
    where: { id: recordId, userId },
  });
  if (!existing) throw new NotFoundError("Usage record");

  const newDate = input.date ? parseIsoDate(input.date) : undefined;

  const updated = await prisma.usageRecord.update({
    where: { id: recordId },
    data: {
      ...(newDate && { date: newDate }),
      ...(input.uploadGb !== undefined && {
        uploadGb: new Prisma.Decimal(input.uploadGb),
      }),
      ...(input.downloadGb !== undefined && {
        downloadGb: new Prisma.Decimal(input.downloadGb),
      }),
      ...(input.provider !== undefined && { provider: input.provider }),
      ...(input.notes !== undefined && { notes: input.notes }),
    },
  });

  // Recompute both the old and new period in case the edit moved the
  // record across a billing-cycle boundary.
  await recomputeSummaryForDate(userId, existing.date);
  if (newDate && newDate.getTime() !== existing.date.getTime()) {
    await recomputeSummaryForDate(userId, newDate);
  }

  return mapUsageRecord(updated);
}

export async function deleteUsageRecord(
  userId: string,
  recordId: string,
): Promise<void> {
  const existing = await prisma.usageRecord.findFirst({
    where: { id: recordId, userId },
  });
  if (!existing) throw new NotFoundError("Usage record");

  await prisma.usageRecord.delete({ where: { id: recordId } });
  await recomputeSummaryForDate(userId, existing.date);
}

export interface BulkImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
}

/**
 * Imports usage rows from a parsed CSV, upserting on (userId, date,
 * provider) so re-importing the same export is idempotent rather than
 * creating duplicates.
 */
export async function bulkImportUsageRecords(
  userId: string,
  rows: UsageRecordCreateInput[],
): Promise<BulkImportResult> {
  let imported = 0;
  const errors: BulkImportResult["errors"] = [];
  const affectedDates = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const date = parseIsoDate(row.date);
      await prisma.usageRecord.upsert({
        where: {
          userId_date_provider: {
            userId,
            date,
            provider: row.provider ?? "",
          },
        },
        create: {
          userId,
          date,
          uploadGb: new Prisma.Decimal(row.uploadGb),
          downloadGb: new Prisma.Decimal(row.downloadGb),
          provider: row.provider ?? "",
          notes: row.notes ?? null,
        },
        update: {
          uploadGb: new Prisma.Decimal(row.uploadGb),
          downloadGb: new Prisma.Decimal(row.downloadGb),
          notes: row.notes ?? null,
        },
      });
      affectedDates.add(row.date);
      imported++;
    } catch (error) {
      errors.push({
        row: i + 1,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Recompute once per distinct billing cycle touched, not once per row.
  const recomputed = new Set<string>();
  for (const dateStr of affectedDates) {
    const date = parseIsoDate(dateStr);
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    if (recomputed.has(key)) continue;
    recomputed.add(key);
    await recomputeSummaryForDate(userId, date);
  }

  return { imported, skipped: rows.length - imported, errors };
}
