import { describe, expect, it } from "vitest";
import { formatDataAmount, formatPercent, gbToUnit, unitToGb } from "@/utils/format";

describe("gbToUnit / unitToGb", () => {
  it("converts GB to MB and back", () => {
    expect(gbToUnit(1, "MB")).toBeCloseTo(1024, 5);
    expect(unitToGb(1024, "MB")).toBeCloseTo(1, 5);
  });

  it("converts GB to TB and back", () => {
    expect(gbToUnit(1024, "TB")).toBeCloseTo(1, 5);
    expect(unitToGb(1, "TB")).toBeCloseTo(1024, 5);
  });

  it("is a no-op for GB", () => {
    expect(gbToUnit(42, "GB")).toBe(42);
    expect(unitToGb(42, "GB")).toBe(42);
  });
});

describe("formatDataAmount", () => {
  it("formats with the unit suffix", () => {
    expect(formatDataAmount(10, "GB")).toBe("10 GB");
  });

  it("uses more decimal precision for small values", () => {
    expect(formatDataAmount(0.567, "GB")).toBe("0.57 GB");
  });

  it("uses no decimals for large values", () => {
    expect(formatDataAmount(523, "GB")).toBe("523 GB");
  });
});

describe("formatPercent", () => {
  it("formats whole percentages by default", () => {
    expect(formatPercent(42.7)).toBe("43%");
  });

  it("respects requested fraction digits", () => {
    expect(formatPercent(42.73, 1)).toBe("42.7%");
  });
});
