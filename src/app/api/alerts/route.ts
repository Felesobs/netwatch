import { withErrorHandling, apiSuccess } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { listAlerts } from "@/services";

export const GET = withErrorHandling(async (request: Request) => {
  const session = await requireSession();
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "PENDING" || statusParam === "TRIGGERED" || statusParam === "DISMISSED"
      ? statusParam
      : undefined;

  const alerts = await listAlerts(session.userId, { status });
  return apiSuccess(alerts);
});
