import { describe, expect, it } from "vitest";
import {
  daysBetweenInclusive,
  formatIsoDate,
  getBillingCycleRange,
  getPreviousBillingCycleRange,
  parseIsoDate,
  predictCycleTotal,
} from "@/utils/billing-cycle";

describe("parseIsoDate / formatIsoDate", () => {
  it("round-trips an ISO date string", () => {
    expect(formatIsoDate(parseIsoDate("2026-03-15"))).toBe("2026-03-15");
  });

  it("parses dates as UTC midnight regardless of local timezone", () => {
    const date = parseIsoDate("2026-01-01");
    expect(date.getUTCHours()).toBe(0);
    expect(date.getUTCDate()).toBe(1);
  });
});

describe("getBillingCycleRange", () => {
  it("returns the current-month range when reference date is on/after the cycle day", () => {
    const { start, end } = getBillingCycleRange(parseIsoDate("2026-06-15"), 1);
    expect(formatIsoDate(start)).toBe("2026-06-01");
    expect(formatIsoDate(end)).toBe("2026-06-30");
  });

  it("returns the previous-month-to-current-month range when reference date is before the cycle day", () => {
    // Cycle resets on the 20th; June 5 falls before that, so the active
    // cycle started May 20 and runs through June 19.
    const { start, end } = getBillingCycleRange(parseIsoDate("2026-06-05"), 20);
    expect(formatIsoDate(start)).toBe("2026-05-20");
    expect(formatIsoDate(end)).toBe("2026-06-19");
  });

  it("clamps billing cycle day to 28 to avoid variable month-length bugs", () => {
    const { start } = getBillingCycleRange(parseIsoDate("2026-02-28"), 31);
    expect(formatIsoDate(start)).toBe("2026-02-28");
  });

  it("handles a cycle day of 1 across a year boundary", () => {
    const { start, end } = getBillingCycleRange(parseIsoDate("2026-01-01"), 1);
    expect(formatIsoDate(start)).toBe("2026-01-01");
    expect(formatIsoDate(end)).toBe("2026-01-31");
  });
});

describe("getPreviousBillingCycleRange", () => {
  it("returns the cycle immediately preceding the given start", () => {
    const currentStart = parseIsoDate("2026-06-01");
    const { start, end } = getPreviousBillingCycleRange(currentStart, 1);
    expect(formatIsoDate(start)).toBe("2026-05-01");
    expect(formatIsoDate(end)).toBe("2026-05-31");
  });

  it("works correctly across a January boundary", () => {
    const currentStart = parseIsoDate("2026-01-01");
    const { start, end } = getPreviousBillingCycleRange(currentStart, 1);
    expect(formatIsoDate(start)).toBe("2025-12-01");
    expect(formatIsoDate(end)).toBe("2025-12-31");
  });
});

describe("daysBetweenInclusive", () => {
  it("counts both endpoints", () => {
    expect(
      daysBetweenInclusive(parseIsoDate("2026-06-01"), parseIsoDate("2026-06-01")),
    ).toBe(1);
    expect(
      daysBetweenInclusive(parseIsoDate("2026-06-01"), parseIsoDate("2026-06-30")),
    ).toBe(30);
  });
});

describe("predictCycleTotal", () => {
  it("projects linearly from the daily average", () => {
    // 50GB over 10 days = 5GB/day average; over a 30-day cycle that's 150GB.
    expect(predictCycleTotal(50, 10, 30)).toBe(150);
  });

  it("returns 0 when no days have elapsed", () => {
    expect(predictCycleTotal(0, 0, 30)).toBe(0);
  });
});
