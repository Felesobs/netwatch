import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { HistoricalComparison, MonthlySummary } from "@/types";
import {
  daysBetweenInclusive,
  getBillingCycleRange,
  getPreviousBillingCycleRange,
  parseIsoDate,
  predictCycleTotal,
  toUtcMidnight,
} from "@/utils";
import { mapMonthlySummary } from "./mappers";
import { evaluateAlertsForPeriod } from "./alert.service";

// How stale the daysElapsed/prediction values are allowed to get before
// we recompute on read. 1 hour is well within a day's granularity.
const SUMMARY_STALE_MS = 60 * 60 * 1000;

export async function recomputeSummaryForDate(
  userId: string,
  affectedDate: Date,
): Promise<MonthlySummary> {
  const settings = await prisma.settings.findUnique({ where: { userId } });
  const billingCycleDay = settings?.billingCycleDay ?? 1;
  const quotaGb = settings?.quotaGb ?? null;

  const { start, end } = getBillingCycleRange(affectedDate, billingCycleDay);
  const summary = await computeAndPersistSummary(userId, start, end, quotaGb);

  if (settings) {
    await evaluateAlertsForPeriod(userId, summary, settings);
  }

  return summary;
}

async function computeAndPersistSummary(
  userId: string,
  periodStart: Date,
  periodEnd: Date,
  quotaGb: Prisma.Decimal | null,
): Promise<MonthlySummary> {
  const aggregate = await prisma.usageRecord.aggregate({
    where: { userId, date: { gte: periodStart, lte: periodEnd } },
    _sum: { uploadGb: true, downloadGb: true },
  });

  const totalUploadGb = aggregate._sum.uploadGb ?? new Prisma.Decimal(0);
  const totalDownloadGb = aggregate._sum.downloadGb ?? new Prisma.Decimal(0);
  const totalGb = totalUploadGb.add(totalDownloadGb);

  const today = toUtcMidnight(new Date());
  const totalDaysInCycle = daysBetweenInclusive(periodStart, periodEnd);
  const effectiveToday =
    today < periodStart ? periodStart : today > periodEnd ? periodEnd : today;
  const daysElapsed = daysBetweenInclusive(periodStart, effectiveToday);
  const daysRemaining = Math.max(totalDaysInCycle - daysElapsed, 0);

  const dailyAverageGb =
    daysElapsed > 0 ? totalGb.toNumber() / daysElapsed : 0;
  const predictedTotalGb = predictCycleTotal(
    totalGb.toNumber(),
    daysElapsed,
    totalDaysInCycle,
  );

  const persisted = await prisma.monthlySummary.upsert({
    where: { userId_periodStart: { userId, periodStart } },
    create: {
      userId, periodStart, periodEnd, totalUploadGb, totalDownloadGb, totalGb,
      quotaGb, daysElapsed, daysRemaining,
      dailyAverageGb: new Prisma.Decimal(dailyAverageGb.toFixed(4)),
      predictedTotalGb: new Prisma.Decimal(predictedTotalGb.toFixed(4)),
    },
    update: {
      totalUploadGb, totalDownloadGb, totalGb, quotaGb, daysElapsed, daysRemaining,
      dailyAverageGb: new Prisma.Decimal(dailyAverageGb.toFixed(4)),
      predictedTotalGb: new Prisma.Decimal(predictedTotalGb.toFixed(4)),
    },
  });

  return mapMonthlySummary(persisted);
}

/**
 * Single entry point for the dashboard summary endpoint. Fetches settings
 * once and threads them through all sub-calls to eliminate the 3× repeated
 * `settings.findUnique` that the previous implementation had.
 *
 * Also avoids writing on every GET: daysElapsed and the prediction only
 * need recomputing once per day, not once per page load. We check the
 * `updatedAt` timestamp and skip the upsert if the row is fresh.
 */
export async function getHistoricalComparison(
  userId: string,
): Promise<HistoricalComparison> {
  // Single settings fetch for the entire operation.
  const settings = await prisma.settings.findUnique({ where: { userId } });
  const billingCycleDay = settings?.billingCycleDay ?? 1;
  const quotaGb = settings?.quotaGb ?? null;

  const { start, end } = getBillingCycleRange(new Date(), billingCycleDay);

  // Check if existing current-period summary is fresh enough to serve as-is.
  const existing = await prisma.monthlySummary.findUnique({
    where: { userId_periodStart: { userId, periodStart: start } },
  });

  const isStale =
    !existing ||
    Date.now() - existing.updatedAt.getTime() > SUMMARY_STALE_MS;

  const current = isStale
    ? await computeAndPersistSummary(userId, start, end, quotaGb)
    : mapMonthlySummary(existing);

  // Trigger alert evaluation only when we actually recomputed.
  if (isStale && settings) {
    await evaluateAlertsForPeriod(userId, current, settings);
  }

  const currentStart = parseIsoDate(current.periodStart);
  const { start: prevStart, end: prevEnd } = getPreviousBillingCycleRange(
    currentStart,
    billingCycleDay,
  );

  const previousRecord = await prisma.monthlySummary.findUnique({
    where: { userId_periodStart: { userId, periodStart: prevStart } },
  });

  let previous: MonthlySummary | null = previousRecord
    ? mapMonthlySummary(previousRecord)
    : null;

  if (!previous) {
    const hasRecords = await prisma.usageRecord.findFirst({
      where: { userId, date: { gte: prevStart, lte: prevEnd } },
      select: { id: true },
    });
    if (hasRecords) {
      previous = await computeAndPersistSummary(userId, prevStart, prevEnd, quotaGb);
    }
  }

  const percentChange =
    previous && previous.totalGb > 0
      ? ((current.totalGb - previous.totalGb) / previous.totalGb) * 100
      : null;

  return { current, previous, percentChange };
}
