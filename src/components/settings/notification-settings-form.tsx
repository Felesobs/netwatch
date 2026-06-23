"use client";

import { useState } from "react";
import { SettingsSection, SettingsRow } from "./settings-section";
import { Switch, Badge, Button } from "@/components/ui";
import type { AlertThreshold, UserSettings } from "@/types";
import { useUpdateSettings } from "@/hooks";
import { useBrowserNotifications } from "@/hooks";

const THRESHOLDS: AlertThreshold[] = [50, 80, 90, 100];

export function NotificationSettingsForm({ settings }: { settings: UserSettings }) {
  const updateSettings = useUpdateSettings();
  const { permission, requestPermission } = useBrowserNotifications();

  const [thresholds, setThresholds] = useState<Set<AlertThreshold>>(
    new Set(settings.notifyThresholds),
  );
  const [browserNotifications, setBrowserNotifications] = useState(settings.browserNotifications);
  const [inAppNotifications, setInAppNotifications] = useState(settings.inAppNotifications);

  function persist(next: Partial<{
    notifyThresholds: AlertThreshold[];
    browserNotifications: boolean;
    inAppNotifications: boolean;
  }>) {
    updateSettings.mutate(next);
  }

  function toggleThreshold(threshold: AlertThreshold) {
    const next = new Set(thresholds);
    if (next.has(threshold)) {
      next.delete(threshold);
    } else {
      next.add(threshold);
    }
    setThresholds(next);
    persist({ notifyThresholds: Array.from(next).sort((a, b) => a - b) });
  }

  async function handleBrowserToggle(checked: boolean) {
    if (checked && permission !== "granted") {
      const result = await requestPermission();
      if (result !== "granted") return;
    }
    setBrowserNotifications(checked);
    persist({ browserNotifications: checked });
  }

  return (
    <SettingsSection
      title="Notifications"
      description="Get alerted when your usage crosses important thresholds."
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-ink-primary">Alert thresholds</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {THRESHOLDS.map((threshold) => {
            const isActive = thresholds.has(threshold);
            return (
              <button
                key={threshold}
                type="button"
                onClick={() => toggleThreshold(threshold)}
                aria-pressed={isActive}
              >
                <Badge tone={isActive ? "accent" : "neutral"} className="cursor-pointer px-3 py-1.5">
                  {threshold}%
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <SettingsRow
          label="In-app notifications"
          description="Show a bell badge and toast when a threshold is crossed."
        >
          <Switch
            checked={inAppNotifications}
            onCheckedChange={(checked) => {
              setInAppNotifications(checked);
              persist({ inAppNotifications: checked });
            }}
            label="Toggle in-app notifications"
          />
        </SettingsRow>

        <SettingsRow
          label="Browser notifications"
          description={
            permission === "denied"
              ? "Blocked by your browser. Enable notifications for this site to use this."
              : "Get a system notification even when this tab isn't focused."
          }
        >
          {permission === "unsupported" ? (
            <Badge tone="neutral">Not supported</Badge>
          ) : (
            <Switch
              checked={browserNotifications && permission === "granted"}
              onCheckedChange={handleBrowserToggle}
              disabled={permission === "denied"}
              label="Toggle browser notifications"
            />
          )}
        </SettingsRow>

        {permission === "default" && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => requestPermission()}
          >
            Enable browser notifications
          </Button>
        )}
      </div>
    </SettingsSection>
  );
}
