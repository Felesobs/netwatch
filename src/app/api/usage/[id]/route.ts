import { withErrorHandling, apiSuccess } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { usageRecordUpdateSchema } from "@/lib/validation";
import { deleteUsageRecord, updateUsageRecord } from "@/services";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const PATCH = withErrorHandling(async (request: Request, { params }: RouteParams) => {
  const session = await requireSession();
  const { id } = await params;
  const body = await request.json();
  const input = usageRecordUpdateSchema.parse(body);

  const record = await updateUsageRecord(session.userId, id, input);
  return apiSuccess(record);
});

export const DELETE = withErrorHandling(async (_request: Request, { params }: RouteParams) => {
  const session = await requireSession();
  const { id } = await params;

  await deleteUsageRecord(session.userId, id);
  return apiSuccess({ deleted: true });
});
