import { prisma } from "@/lib/prisma";
import type { ReportBucket, ReportGranularity, ReportResult } from "@/types";
import { formatIsoDate, parseIsoDate } from "@/utils";

function startOfWeekUtc(date: Date): Date {
  const result = new Date(date);
  const day = result.getUTCDay();
  const diff = (day + 6) % 7; // ISO week: Monday start
  result.setUTCDate(result.getUTCDate() - diff);
  return result;
}

function bucketKeyFor(date: Date, granularity: ReportGranularity): string {
  if (granularity === "daily") return formatIsoDate(date);
  if (granularity === "weekly") return formatIsoDate(startOfWeekUtc(date));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function bucketLabel(key: string, granularity: ReportGranularity): string {
  if (granularity === "monthly") {
    const [year, month] = key.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  const date = parseIsoDate(key);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function bucketRange(
  key: string,
  granularity: ReportGranularity,
): { periodStart: Date; periodEnd: Date } {
  if (granularity === "daily") {
    const d = parseIsoDate(key);
    return { periodStart: d, periodEnd: d };
  }
  if (granularity === "weekly") {
    const start = parseIsoDate(key);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    return { periodStart: start, periodEnd: end };
  }
  const [year, month] = key.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return { periodStart: start, periodEnd: end };
}

export async function generateReport(
  userId: string,
  from: string,
  to: string,
  granularity: ReportGranularity,
): Promise<ReportResult> {
  const fromDate = parseIsoDate(from);
  const toDate = parseIsoDate(to);

  const records = await prisma.usageRecord.findMany({
    where: { userId, date: { gte: fromDate, lte: toDate } },
    orderBy: { date: "asc" },
    select: { date: true, uploadGb: true, downloadGb: true },
  });

  const buckets = new Map<string, { uploadGb: number; downloadGb: number }>();

  for (const record of records) {
    const key = bucketKeyFor(record.date, granularity);
    const existing = buckets.get(key) ?? { uploadGb: 0, downloadGb: 0 };
    existing.uploadGb += record.uploadGb.toNumber();
    existing.downloadGb += record.downloadGb.toNumber();
    buckets.set(key, existing);
  }

  const sortedKeys = Array.from(buckets.keys()).sort();
  const resultBuckets: ReportBucket[] = sortedKeys.map((key) => {
    const { uploadGb, downloadGb } = buckets.get(key)!;
    const { periodStart, periodEnd } = bucketRange(key, granularity);
    return {
      label: bucketLabel(key, granularity),
      periodStart: formatIsoDate(periodStart),
      periodEnd: formatIsoDate(periodEnd),
      uploadGb: Math.round(uploadGb * 100) / 100,
      downloadGb: Math.round(downloadGb * 100) / 100,
      totalGb: Math.round((uploadGb + downloadGb) * 100) / 100,
    };
  });

  const totalUploadGb = resultBuckets.reduce((sum, b) => sum + b.uploadGb, 0);
  const totalDownloadGb = resultBuckets.reduce((sum, b) => sum + b.downloadGb, 0);

  return {
    range: { from, to },
    granularity,
    buckets: resultBuckets,
    totalUploadGb: Math.round(totalUploadGb * 100) / 100,
    totalDownloadGb: Math.round(totalDownloadGb * 100) / 100,
    totalGb: Math.round((totalUploadGb + totalDownloadGb) * 100) / 100,
  };
}
