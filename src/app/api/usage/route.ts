import { withErrorHandling, apiSuccess } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { usageQuerySchema, usageRecordCreateSchema } from "@/lib/validation";
import { createUsageRecord, listUsageRecords } from "@/services";

export const GET = withErrorHandling(async (request: Request) => {
  const session = await requireSession();
  const { searchParams } = new URL(request.url);
  const query = usageQuerySchema.parse(Object.fromEntries(searchParams));

  const result = await listUsageRecords(session.userId, query);
  return apiSuccess(result);
});

export const POST = withErrorHandling(async (request: Request) => {
  const session = await requireSession();
  const body = await request.json();
  const input = usageRecordCreateSchema.parse(body);

  const record = await createUsageRecord(session.userId, input);
  return apiSuccess(record, 201);
});
