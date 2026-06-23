"use client";

import { PageHeader } from "@/components/layout";
import {
  UsageSummaryHero,
  StatGrid,
  HistoricalComparisonCard,
  UsageChartsPanel,
  DashboardSkeleton,
} from "@/components/dashboard";
import { useSummary, useSettings } from "@/hooks";
import { EmptyState } from "@/components/ui";
import { AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const { data: comparison, isLoading: summaryLoading, isError } = useSummary();
  const { data: settings } = useSettings();
  const unit = settings?.usageUnit ?? "GB";

  if (summaryLoading) {
    return (
      <>
        <PageHeader title="Dashboard" description="Your current billing period at a glance." />
        <DashboardSkeleton />
      </>
    );
  }

  if (isError || !comparison) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <EmptyState
          icon={<AlertTriangle className="size-5" aria-hidden="true" />}
          title="Couldn't load your dashboard"
          description="Please refresh the page or try again shortly."
          className="mx-4 mt-8 rounded-(--radius-lg) border border-border bg-surface md:mx-8"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" description="Your current billing period at a glance." />
      <div className="space-y-4 p-4 md:space-y-6 md:p-8">
        <UsageSummaryHero summary={comparison.current} unit={unit} />
        <StatGrid summary={comparison.current} unit={unit} />
        <HistoricalComparisonCard comparison={comparison} unit={unit} />
        <UsageChartsPanel unit={unit} />
      </div>
    </>
  );
}
