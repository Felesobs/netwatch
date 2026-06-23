import { cookies } from "next/headers";
import { withErrorHandling, apiSuccess } from "@/lib/api";
import { sessionCookieOptions } from "@/lib/auth";

export const POST = withErrorHandling(async () => {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieOptions.name);
  return apiSuccess({ loggedOut: true });
});
