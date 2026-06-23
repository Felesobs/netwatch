import Papa from "papaparse";
import { withErrorHandling } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseIsoDate, formatIsoDate } from "@/utils";
import type { UsageRecord } from "@/types";

export const GET = withErrorHandling(async (request: Request) => {
  const session = await requireSession();
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // We explicitly type the array elements as our domain UsageRecord so the
  // subsequent .map does not get an implicit `any` from the un-generated
  // Prisma client (which hasn't been run yet in this sandbox). Once
  // `prisma generate` runs on the user's machine the Prisma return type
  // will match this shape exactly — the mapper below enforces that.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawRows: any[] = await prisma.usageRecord.findMany({
    where: {
      userId: session.userId,
      ...(from && { date: { gte: parseIsoDate(from) } }),
      ...(to && {
        date: { ...(from && { gte: parseIsoDate(from) }), lte: parseIsoDate(to) },
      }),
    },
    orderBy: { date: "asc" },
  });

  const records: UsageRecord[] = rawRows.map((r) => ({
    id: r.id as string,
    userId: r.userId as string,
    date: formatIsoDate(r.date as Date),
    uploadGb: Number(r.uploadGb),
    downloadGb: Number(r.downloadGb),
    provider: (r.provider as string | null) ?? "",
    notes: r.notes as string | null,
    createdAt: (r.createdAt as Date).toISOString(),
    updatedAt: (r.updatedAt as Date).toISOString(),
  }));

  const csv = Papa.unparse(
    records.map((r) => ({
      date: r.date,
      uploadGb: r.uploadGb,
      downloadGb: r.downloadGb,
      totalGb: r.uploadGb + r.downloadGb,
      provider: r.provider ?? "",
      notes: r.notes ?? "",
    })),
  );

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="netwatch-usage-${formatIsoDate(new Date())}.csv"`,
    },
  });
});
