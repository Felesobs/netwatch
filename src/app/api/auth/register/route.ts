import { cookies } from "next/headers";
import { withErrorHandling, apiSuccess } from "@/lib/api";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { registerUser } from "@/services";
import { authRateLimiter, getClientIp } from "@/lib/rate-limiter";

export const POST = withErrorHandling(async (request: Request) => {
  const { allowed } = authRateLimiter.check(getClientIp(request));
  if (!allowed) {
    return apiSuccess(
      { message: "If the email is available, your account will be created shortly." },
      202,
    );
    // Note: we return 202 rather than 429 for registration to avoid
    // leaking whether rate limiting is active, which would confirm
    // that registration requests are being made from this IP.
  }

  const body = await request.json();
  const input = registerSchema.parse(body);

  const user = await registerUser(input);
  const token = await createSessionToken({ userId: user.id, email: user.email });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieOptions.name, token, sessionCookieOptions);

  return apiSuccess(user, 201);
});
