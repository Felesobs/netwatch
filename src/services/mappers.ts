import type { Prisma } from "@prisma/client";
import type {
  Alert,
  MonthlySummary,
  UsageRecord,
  UserSettings,
  AlertThreshold,
} from "@/types";
import { formatIsoDate } from "@/utils";

type PrismaUsageRecord = {
  id: string;
  userId: string;
  date: Date;
  uploadGb: Prisma.Decimal;
  downloadGb: Prisma.Decimal;
  provider: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function mapUsageRecord(record: PrismaUsageRecord): UsageRecord {
  return {
    id: record.id,
    userId: record.userId,
    date: formatIsoDate(record.date),
    uploadGb: record.uploadGb.toNumber(),
    downloadGb: record.downloadGb.toNumber(),
    provider: record.provider ?? "",
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

type PrismaMonthlySummary = {
  id: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  totalUploadGb: Prisma.Decimal;
  totalDownloadGb: Prisma.Decimal;
  totalGb: Prisma.Decimal;
  quotaGb: Prisma.Decimal | null;
  daysElapsed: number;
  daysRemaining: number;
  dailyAverageGb: Prisma.Decimal;
  predictedTotalGb: Prisma.Decimal;
};

export function mapMonthlySummary(
  summary: PrismaMonthlySummary,
): MonthlySummary {
  const quotaGb = summary.quotaGb?.toNumber() ?? null;
  const totalGb = summary.totalGb.toNumber();
  return {
    id: summary.id,
    userId: summary.userId,
    periodStart: formatIsoDate(summary.periodStart),
    periodEnd: formatIsoDate(summary.periodEnd),
    totalUploadGb: summary.totalUploadGb.toNumber(),
    totalDownloadGb: summary.totalDownloadGb.toNumber(),
    totalGb,
    quotaGb,
    daysElapsed: summary.daysElapsed,
    daysRemaining: summary.daysRemaining,
    dailyAverageGb: summary.dailyAverageGb.toNumber(),
    predictedTotalGb: summary.predictedTotalGb.toNumber(),
    percentOfQuota: quotaGb ? (totalGb / quotaGb) * 100 : null,
  };
}

type PrismaAlert = {
  id: string;
  userId: string;
  threshold: number;
  channel: "BROWSER" | "IN_APP";
  status: "PENDING" | "TRIGGERED" | "DISMISSED";
  periodStart: Date;
  message: string;
  createdAt: Date;
  triggeredAt: Date | null;
};

export function mapAlert(alert: PrismaAlert): Alert {
  return {
    id: alert.id,
    userId: alert.userId,
    threshold: alert.threshold as AlertThreshold,
    channel: alert.channel,
    status: alert.status,
    periodStart: formatIsoDate(alert.periodStart),
    message: alert.message,
    createdAt: alert.createdAt.toISOString(),
    triggeredAt: alert.triggeredAt?.toISOString() ?? null,
  };
}

type PrismaSettings = {
  id: string;
  userId: string;
  billingCycleDay: number;
  usageUnit: "MB" | "GB" | "TB";
  quotaGb: Prisma.Decimal | null;
  theme: "LIGHT" | "DARK" | "SYSTEM";
  browserNotifications: boolean;
  inAppNotifications: boolean;
  notifyThresholds: number[];
};

export function mapSettings(settings: PrismaSettings): UserSettings {
  return {
    id: settings.id,
    userId: settings.userId,
    billingCycleDay: settings.billingCycleDay,
    usageUnit: settings.usageUnit,
    quotaGb: settings.quotaGb?.toNumber() ?? null,
    theme: settings.theme.toLowerCase() as UserSettings["theme"],
    browserNotifications: settings.browserNotifications,
    inAppNotifications: settings.inAppNotifications,
    notifyThresholds: settings.notifyThresholds as AlertThreshold[],
  };
}
