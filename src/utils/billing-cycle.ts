/**
 * Billing cycles don't have to align with calendar months — a user can set
 * `billingCycleDay` (1-28) as the day their cycle resets. These helpers
 * compute the cycle window containing any given date.
 *
 * All dates are treated as UTC midnight to avoid timezone-dependent
 * off-by-one errors when a user's local time crosses midnight near a
 * cycle boundary.
 */

export function toUtcMidnight(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Returns the [start, end] (inclusive) of the billing cycle that contains
 * `referenceDate`, given a cycle reset day (clamped to 28 to sidestep
 * variable month lengths entirely).
 */
export function getBillingCycleRange(
  referenceDate: Date,
  billingCycleDay: number,
): { start: Date; end: Date } {
  const cycleDay = Math.min(Math.max(billingCycleDay, 1), 28);
  const ref = toUtcMidnight(referenceDate);

  const refYear = ref.getUTCFullYear();
  const refMonth = ref.getUTCMonth();
  const refDay = ref.getUTCDate();

  let start: Date;
  if (refDay >= cycleDay) {
    start = new Date(Date.UTC(refYear, refMonth, cycleDay));
  } else {
    start = new Date(Date.UTC(refYear, refMonth - 1, cycleDay));
  }

  const end = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, cycleDay - 1),
  );

  return { start, end };
}

export function getPreviousBillingCycleRange(
  currentStart: Date,
  billingCycleDay: number,
): { start: Date; end: Date } {
  const dayBeforeStart = new Date(currentStart);
  dayBeforeStart.setUTCDate(dayBeforeStart.getUTCDate() - 1);
  return getBillingCycleRange(dayBeforeStart, billingCycleDay);
}

export function daysBetweenInclusive(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / msPerDay) + 1;
}

/**
 * Linear projection: at the current daily average, how much usage will
 * accumulate by the end of the billing cycle. Returns the *projected total*
 * for the full cycle, not just the remaining days.
 */
export function predictCycleTotal(
  totalSoFarGb: number,
  daysElapsed: number,
  totalDaysInCycle: number,
): number {
  if (daysElapsed <= 0) return 0;
  const dailyAverage = totalSoFarGb / daysElapsed;
  return dailyAverage * totalDaysInCycle;
}
