import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date");

const nonNegativeGb = z
  .number({ message: "Must be a number" })
  .nonnegative("Must be zero or greater")
  .max(1_000_000, "Value is unreasonably large")
  .finite();

export const usageRecordCreateSchema = z.object({
  date: isoDate,
  uploadGb: nonNegativeGb,
  downloadGb: nonNegativeGb,
  provider: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export type UsageRecordCreateInput = z.infer<typeof usageRecordCreateSchema>;

export const usageRecordUpdateSchema = usageRecordCreateSchema.partial();

export type UsageRecordUpdateInput = z.infer<typeof usageRecordUpdateSchema>;

export const usageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  from: isoDate.optional(),
  to: isoDate.optional(),
  provider: z.string().trim().max(100).optional(),
  sort: z.enum(["date_asc", "date_desc"]).default("date_desc"),
});

export type UsageQueryInput = z.infer<typeof usageQuerySchema>;

export const csvImportRowSchema = z.object({
  date: isoDate,
  uploadGb: z.coerce.number().nonnegative().finite(),
  downloadGb: z.coerce.number().nonnegative().finite(),
  provider: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type CsvImportRow = z.infer<typeof csvImportRowSchema>;
