import { withErrorHandling, apiSuccess } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { reportRequestSchema } from "@/lib/validation";
import { generateReport } from "@/services";

export const GET = withErrorHandling(async (request: Request) => {
  const session = await requireSession();
  const { searchParams } = new URL(request.url);
  const input = reportRequestSchema.parse(Object.fromEntries(searchParams));

  const report = await generateReport(
    session.userId,
    input.from,
    input.to,
    input.granularity,
  );
  return apiSuccess(report);
});
