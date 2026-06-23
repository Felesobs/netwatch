import { withErrorHandling, apiSuccess } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { NotFoundError } from "@/lib/api";
import { dismissAlert } from "@/services";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const PATCH = withErrorHandling(async (_request: Request, { params }: RouteParams) => {
  const session = await requireSession();
  const { id } = await params;

  const alert = await dismissAlert(session.userId, id);
  if (!alert) throw new NotFoundError("Alert");

  return apiSuccess(alert);
});
