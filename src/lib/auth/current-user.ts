import { cookies } from "next/headers";
import { sessionCookieOptions, verifySessionToken } from "./session";

/**
 * Reads and verifies the session cookie for the current request. Returns
 * `null` if there is no session or it failed verification (expired,
 * tampered, wrong signature) — callers decide whether that's a 401 or a
 * redirect.
 */
export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieOptions.name)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Throws `UnauthorizedError` (caught by the route's error handler) if unauthenticated. */
export async function requireSession() {
  const session = await getCurrentSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}
