/**
 * Lightweight in-memory sliding-window rate limiter.
 *
 * Limitations (acceptable for this use case):
 * - State is per-process, so it doesn't share across Vercel function instances.
 *   For stronger brute-force protection, swap the Map for a Redis/Upstash store.
 * - Resets on server restart. Fine for a personal app; document the limitation.
 *
 * Usage:
 *   const result = authRateLimiter.check(ip);
 *   if (!result.allowed) return apiError("RATE_LIMITED", "Too many attempts", 429);
 */

interface WindowEntry {
  timestamps: number[];
}

export interface RateLimiterOptions {
  /** Maximum requests allowed within the window. */
  maxRequests: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

export class RateLimiter {
  private readonly store = new Map<string, WindowEntry>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(options: RateLimiterOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
  }

  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    const entry = this.store.get(key) ?? { timestamps: [] };
    // Evict timestamps outside the window
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    entry.timestamps.push(now);
    this.store.set(key, entry);

    const remaining = Math.max(0, this.maxRequests - entry.timestamps.length);
    const oldest = entry.timestamps[0] ?? now;
    const resetAt = oldest + this.windowMs;

    return { allowed: entry.timestamps.length <= this.maxRequests, remaining, resetAt };
  }
}

/**
 * 10 attempts per IP per 15 minutes on auth endpoints.
 * Aggressive enough to stop credential stuffing; lenient enough for
 * legitimate users who mistype their password a few times.
 */
export const authRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000,
});

/**
 * Extracts the best available client IP from a Next.js Request.
 * Falls back to a static string in environments where none is available
 * (local dev without a reverse proxy) — this means rate limiting is
 * per-process rather than per-IP in dev, which is fine.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local"
  );
}
