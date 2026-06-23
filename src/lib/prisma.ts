import { PrismaClient } from "@prisma/client";

/**
 * Next.js dev mode hot-reloads modules on every file save, which would
 * otherwise instantiate a fresh PrismaClient (and a fresh connection pool)
 * per reload. We stash the instance on `globalThis` in development so it
 * survives hot reloads; in production each serverless invocation gets a
 * clean module scope, so no caching is needed there.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
