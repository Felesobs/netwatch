/**
 * Centralized query keys. Keeping these in one place prevents typos that
 * silently break cache invalidation (e.g. invalidating "usage" in one file
 * and "usageRecords" in another).
 */
export const queryKeys = {
  currentUser: ["auth", "me"] as const,
  usageList: (params: Record<string, unknown>) => ["usage", "list", params] as const,
  summary: ["summary"] as const,
  alerts: (status?: string) => ["alerts", status ?? "all"] as const,
  settings: ["settings"] as const,
  report: (from: string, to: string, granularity: string) =>
    ["report", from, to, granularity] as const,
};
