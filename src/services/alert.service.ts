import type { Settings } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Alert, AlertThreshold, MonthlySummary } from "@/types";
import { parseIsoDate, formatDataAmount } from "@/utils";
import { mapAlert } from "./mappers";

const ALL_THRESHOLDS: AlertThreshold[] = [50, 80, 90, 100];

/**
 * Checks the current summary's percentage-of-quota against the user's
 * configured thresholds and creates any newly-crossed alerts. Idempotent:
 * the unique constraint on (userId, periodStart, threshold, channel)
 * means re-evaluating an already-triggered threshold is a no-op.
 */
export async function evaluateAlertsForPeriod(
  userId: string,
  summary: MonthlySummary,
  settings: Settings,
): Promise<Alert[]> {
  if (!summary.quotaGb || summary.percentOfQuota === null) return [];

  const crossedThresholds = ALL_THRESHOLDS.filter(
    (threshold) =>
      settings.notifyThresholds.includes(threshold) &&
      summary.percentOfQuota! >= threshold,
  );

  if (crossedThresholds.length === 0) return [];

  const channels: Array<"BROWSER" | "IN_APP"> = [
    ...(settings.browserNotifications ? (["BROWSER"] as const) : []),
    ...(settings.inAppNotifications ? (["IN_APP"] as const) : []),
  ];

  if (channels.length === 0) return [];

  const periodStart = parseIsoDate(summary.periodStart);
  const created: Alert[] = [];

  for (const threshold of crossedThresholds) {
    for (const channel of channels) {
      const message = buildAlertMessage(threshold, summary);
      try {
        const alert = await prisma.alert.create({
          data: {
            userId,
            threshold,
            channel,
            status: "TRIGGERED",
            periodStart,
            message,
            triggeredAt: new Date(),
          },
        });
        created.push(mapAlert(alert));
      } catch (error) {
        // P2002 = unique constraint violation, meaning this threshold/
        // channel was already triggered this period. Expected and safe
        // to ignore; re-throw anything else.
        if (
          !(error instanceof Error) ||
          !("code" in error) ||
          (error as { code?: string }).code !== "P2002"
        ) {
          throw error;
        }
      }
    }
  }

  return created;
}

function buildAlertMessage(
  threshold: AlertThreshold,
  summary: MonthlySummary,
): string {
  const used = formatDataAmount(summary.totalGb, "GB");
  const quota = formatDataAmount(summary.quotaGb ?? 0, "GB");
  if (threshold >= 100) {
    return `You've reached your monthly quota: ${used} of ${quota} used.`;
  }
  return `You've used ${threshold}% of your monthly quota (${used} of ${quota}).`;
}

export async function listAlerts(
  userId: string,
  options: { status?: "PENDING" | "TRIGGERED" | "DISMISSED" } = {},
): Promise<Alert[]> {
  const alerts = await prisma.alert.findMany({
    where: { userId, ...(options.status && { status: options.status }) },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return alerts.map(mapAlert);
}

export async function dismissAlert(userId: string, alertId: string): Promise<Alert | null> {
  const existing = await prisma.alert.findFirst({
    where: { id: alertId, userId },
  });
  if (!existing) return null;

  const updated = await prisma.alert.update({
    where: { id: alertId },
    data: { status: "DISMISSED" },
  });
  return mapAlert(updated);
}
