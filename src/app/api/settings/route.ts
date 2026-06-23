import { withErrorHandling, apiSuccess } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { settingsUpdateSchema } from "@/lib/validation";
import { getOrCreateSettings, updateSettings } from "@/services";

export const GET = withErrorHandling(async () => {
  const session = await requireSession();
  const settings = await getOrCreateSettings(session.userId);
  return apiSuccess(settings);
});

export const PATCH = withErrorHandling(async (request: Request) => {
  const session = await requireSession();
  const body = await request.json();
  const input = settingsUpdateSchema.parse(body);

  const settings = await updateSettings(session.userId, input);
  return apiSuccess(settings);
});
