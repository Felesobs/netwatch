import Papa from "papaparse";
import type { ReportResult, UsageUnit } from "@/types";
import { gbToUnit } from "@/utils";

function buildRows(report: ReportResult, unit: UsageUnit) {
  return report.buckets.map((bucket) => ({
    Period: bucket.label,
    [`Upload (${unit})`]: gbToUnit(bucket.uploadGb, unit).toFixed(2),
    [`Download (${unit})`]: gbToUnit(bucket.downloadGb, unit).toFixed(2),
    [`Total (${unit})`]: gbToUnit(bucket.totalGb, unit).toFixed(2),
  }));
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportReportToCsv(report: ReportResult, unit: UsageUnit) {
  const csv = Papa.unparse(buildRows(report, unit));
  triggerDownload(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    `netwatch-report-${report.range.from}-to-${report.range.to}.csv`,
  );
}

export async function exportReportToPdf(report: ReportResult, unit: UsageUnit) {
  // Dynamic import keeps jsPDF (~29MB on disk, ~300KB gzipped) out of the
  // initial bundle. It only loads when the user explicitly clicks Export PDF.
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("NetWatch Usage Report", 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `${report.range.from} to ${report.range.to} · ${report.granularity}`,
    14,
    25,
  );

  autoTable(doc, {
    startY: 32,
    head: [["Period", `Upload (${unit})`, `Download (${unit})`, `Total (${unit})`]],
    body: report.buckets.map((bucket) => [
      bucket.label,
      gbToUnit(bucket.uploadGb, unit).toFixed(2),
      gbToUnit(bucket.downloadGb, unit).toFixed(2),
      gbToUnit(bucket.totalGb, unit).toFixed(2),
    ]),
    foot: [[
      "Total",
      gbToUnit(report.totalUploadGb, unit).toFixed(2),
      gbToUnit(report.totalDownloadGb, unit).toFixed(2),
      gbToUnit(report.totalGb, unit).toFixed(2),
    ]],
    headStyles: { fillColor: [0, 102, 255] },
    footStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: "bold" },
    styles: { fontSize: 9 },
  });

  doc.save(`netwatch-report-${report.range.from}-to-${report.range.to}.pdf`);
}
