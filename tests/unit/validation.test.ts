import { describe, expect, it } from "vitest";
import { usageRecordCreateSchema } from "@/lib/validation/usage.schema";
import { registerSchema } from "@/lib/validation/auth.schema";

describe("usageRecordCreateSchema", () => {
  it("accepts a valid record", () => {
    const result = usageRecordCreateSchema.safeParse({
      date: "2026-06-01",
      uploadGb: 1.5,
      downloadGb: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed date", () => {
    const result = usageRecordCreateSchema.safeParse({
      date: "06/01/2026",
      uploadGb: 1,
      downloadGb: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative usage values", () => {
    const result = usageRecordCreateSchema.safeParse({
      date: "2026-06-01",
      uploadGb: -1,
      downloadGb: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects unreasonably large values", () => {
    const result = usageRecordCreateSchema.safeParse({
      date: "2026-06-01",
      uploadGb: 10_000_000,
      downloadGb: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("normalizes email to lowercase and trims whitespace", () => {
    const result = registerSchema.safeParse({
      name: "  Ada  ",
      email: "  ADA@Example.com ",
      password: "supersecure1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ada@example.com");
    }
  });

  it("rejects short passwords", () => {
    const result = registerSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});
