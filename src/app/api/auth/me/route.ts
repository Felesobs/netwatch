import { withErrorHandling, apiSuccess, apiError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { getUserById } from "@/services";

export const GET = withErrorHandling(async () => {
  const session = await requireSession();
  const user = await getUserById(session.userId);
  if (!user) {
    return apiError("NOT_FOUND", "User not found", 404);
  }
  return apiSuccess(user);
});
