import { withErrorHandling, apiSuccess } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getHistoricalComparison } from "@/services";

export const GET = withErrorHandling(async () => {
  const session = await requireSession();
  const comparison = await getHistoricalComparison(session.userId);
  return apiSuccess(comparison);
});
