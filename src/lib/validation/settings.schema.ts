import { z } from "zod";

export const settingsUpdateSchema = z.object({
  billingCycleDay: z.coerce.number().int().min(1).max(28).optional(),
  usageUnit: z.enum(["MB", "GB", "TB"]).optional(),
  quotaGb: z.coerce.number().positive().max(1_000_000).nullable().optional(),
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),
  browserNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  notifyThresholds: z
    .array(z.union([z.literal(50), z.literal(80), z.literal(90), z.literal(100)]))
    .optional(),
});

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const reportRequestSchema = z.object({
  from: isoDate,
  to: isoDate,
  granularity: z.enum(["daily", "weekly", "monthly"]).default("daily"),
});

export type ReportRequestInput = z.infer<typeof reportRequestSchema>;

export const reportExportSchema = reportRequestSchema.extend({
  format: z.enum(["csv", "pdf"]),
});

export type ReportExportInput = z.infer<typeof reportExportSchema>;
