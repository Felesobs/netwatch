import { cookies } from "next/headers";
import { withErrorHandling, apiSuccess, apiError } from "@/lib/api";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { authenticateUser } from "@/services";
import { authRateLimiter, getClientIp } from "@/lib/rate-limiter";

export const POST = withErrorHandling(async (request: Request) => {
  const { allowed } = authRateLimiter.check(getClientIp(request));
  if (!allowed) {
    return apiError(
      "RATE_LIMITED",
      "Too many login attempts. Please wait 15 minutes before trying again.",
      429,
    );
  }

  const body = await request.json();
  const input = loginSchema.parse(body);

  const user = await authenticateUser(input);
  if (!user) {
    return apiError("INVALID_CREDENTIALS", "Incorrect email or password", 401);
  }

  const token = await createSessionToken({ userId: user.id, email: user.email });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieOptions.name, token, sessionCookieOptions);

  return apiSuccess(user);
});
