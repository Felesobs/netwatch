"use client";

import { PageHeader } from "@/components/layout";
import { Skeleton } from "@/components/ui";
import {
  BillingSettingsForm,
  AppearanceSettingsForm,
  NotificationSettingsForm,
} from "@/components/settings";
import { useSettings } from "@/hooks";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();

  return (
    <>
      <PageHeader title="Settings" description="Manage your billing cycle, display, and notification preferences." />
      <div className="max-w-2xl space-y-4 p-4 md:p-8">
        {isLoading || !settings ? (
          <>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </>
        ) : (
          <>
            <BillingSettingsForm settings={settings} />
            <AppearanceSettingsForm />
            <NotificationSettingsForm settings={settings} />
          </>
        )}
      </div>
    </>
  );
}
