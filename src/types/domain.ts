/**
 * Core domain types for NetWatch.
 *
 * These mirror the Prisma models but are kept as hand-written types so that
 * API boundaries (request/response shapes) can diverge intentionally from
 * the database representation (e.g. Decimal -> number, Date -> ISO string)
 * without leaking Prisma types into client components.
 */

export type UsageUnit = "GB" | "MB" | "TB";

export type ThemePreference = "light" | "dark" | "system";

export type AlertThreshold = 50 | 80 | 90 | 100;

export type AlertChannel = "BROWSER" | "IN_APP";

export type AlertStatus = "PENDING" | "TRIGGERED" | "DISMISSED";

/**
 * A single day's recorded usage. Upload/download are stored in GB at the
 * persistence layer (see prisma/schema.prisma) and converted for display
 * according to the user's `usageUnit` preference.
 */
export interface UsageRecord {
  id: string;
  userId: string;
  date: string; // ISO date (YYYY-MM-DD), always normalized to UTC midnight
  uploadGb: number;
  downloadGb: number;
  /** Empty string means "no provider specified". Never null. */
  provider: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UsageRecordInput = Pick<
  UsageRecord,
  "date" | "uploadGb" | "downloadGb"
> &
  Partial<Pick<UsageRecord, "provider" | "notes">>;

export type UsageRecordUpdate = Partial<UsageRecordInput>;

/**
 * Precomputed/derived aggregate for a calendar month, keyed by the user's
 * billing cycle. Persisted as a materialized cache (MonthlySummary) and
 * refreshed on write, so dashboard reads stay O(1).
 */
export interface MonthlySummary {
  id: string;
  userId: string;
  periodStart: string; // ISO date — first day of the billing cycle
  periodEnd: string; // ISO date — last day of the billing cycle
  totalUploadGb: number;
  totalDownloadGb: number;
  totalGb: number;
  quotaGb: number | null;
  daysElapsed: number;
  daysRemaining: number;
  dailyAverageGb: number;
  predictedTotalGb: number;
  percentOfQuota: number | null;
}

export interface Alert {
  id: string;
  userId: string;
  threshold: AlertThreshold;
  channel: AlertChannel;
  status: AlertStatus;
  periodStart: string;
  message: string;
  createdAt: string;
  triggeredAt: string | null;
}

export interface UserSettings {
  id: string;
  userId: string;
  billingCycleDay: number; // 1-28, day of month the cycle resets
  usageUnit: UsageUnit;
  quotaGb: number | null;
  theme: ThemePreference;
  browserNotifications: boolean;
  inAppNotifications: boolean;
  notifyThresholds: AlertThreshold[];
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

/** Standard envelope returned by every API route. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DateRange {
  from: string; // ISO date
  to: string; // ISO date
}

export interface HistoricalComparison {
  current: MonthlySummary;
  previous: MonthlySummary | null;
  percentChange: number | null;
}

export type ReportGranularity = "daily" | "weekly" | "monthly";

export interface ReportRequest {
  range: DateRange;
  granularity: ReportGranularity;
}

export interface ReportBucket {
  label: string;
  periodStart: string;
  periodEnd: string;
  uploadGb: number;
  downloadGb: number;
  totalGb: number;
}

export interface ReportResult {
  range: DateRange;
  granularity: ReportGranularity;
  buckets: ReportBucket[];
  totalUploadGb: number;
  totalDownloadGb: number;
  totalGb: number;
}
