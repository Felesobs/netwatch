import type { UsageUnit } from "@/types";

/**
 * All persistence and computation happens in GB. These helpers only convert
 * at the display boundary, so arithmetic never accumulates rounding error
 * across unit conversions.
 */
const GB_PER_MB = 1 / 1024;
const GB_PER_TB = 1024;

export function gbToUnit(valueGb: number, unit: UsageUnit): number {
  switch (unit) {
    case "MB":
      return valueGb / GB_PER_MB;
    case "TB":
      return valueGb / GB_PER_TB;
    case "GB":
    default:
      return valueGb;
  }
}

export function unitToGb(value: number, unit: UsageUnit): number {
  switch (unit) {
    case "MB":
      return value * GB_PER_MB;
    case "TB":
      return value * GB_PER_TB;
    case "GB":
    default:
      return value;
  }
}

/**
 * Formats a GB quantity for display in the user's preferred unit, choosing
 * sensible decimal precision (whole numbers don't need decimals; small
 * values need more precision to stay informative).
 */
export function formatDataAmount(
  valueGb: number,
  unit: UsageUnit = "GB",
): string {
  const converted = gbToUnit(valueGb, unit);
  const precision = converted >= 100 ? 0 : converted >= 10 ? 1 : 2;
  return `${converted.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  })} ${unit}`;
}

/** Auto-selects the most readable unit for a given GB value (used in charts/tooltips). */
export function formatDataAmountAuto(valueGb: number): string {
  if (valueGb >= GB_PER_TB) return formatDataAmount(valueGb, "TB");
  if (valueGb < 1) return formatDataAmount(valueGb, "MB");
  return formatDataAmount(valueGb, "GB");
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`;
}
