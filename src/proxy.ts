import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieOptions, verifySessionToken } from "@/lib/auth/session";

/**
 * Route protection proxy (Next.js 16+ renamed `middleware.ts` to
 * `proxy.ts` — see https://nextjs.org/docs/app/api-reference/file-conventions/proxy).
 * Runs on Node.js, not the Edge runtime, so this stays a fast,
 * cookie-only JWT check; full session/permission checks that need
 * database access happen in the route handlers and server components
 * themselves, not here.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/usage", "/reports", "/settings"];
const AUTH_PAGES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(sessionCookieOptions.name)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/usage/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
