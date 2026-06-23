"use client";

import { useState, type FormEvent } from "react";
import { Button, Input, Label, Select } from "@/components/ui";
import { SettingsSection } from "./settings-section";
import type { UserSettings } from "@/types";
import { useUpdateSettings } from "@/hooks";

export function BillingSettingsForm({ settings }: { settings: UserSettings }) {
  const updateSettings = useUpdateSettings();
  const [billingCycleDay, setBillingCycleDay] = useState(String(settings.billingCycleDay));
  const [usageUnit, setUsageUnit] = useState(settings.usageUnit);
  const [quotaGb, setQuotaGb] = useState(settings.quotaGb !== null ? String(settings.quotaGb) : "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    updateSettings.mutate({
      billingCycleDay: Number(billingCycleDay),
      usageUnit,
      quotaGb: quotaGb ? Number(quotaGb) : null,
    });
  }

  return (
    <SettingsSection
      title="Billing & quota"
      description="Configure your billing cycle reset day and monthly data quota."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="billingCycleDay">Billing cycle reset day</Label>
            <Select
              id="billingCycleDay"
              value={billingCycleDay}
              onChange={(event) => setBillingCycleDay(event.target.value)}
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  Day {day} of each month
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="usageUnit">Display unit</Label>
            <Select
              id="usageUnit"
              value={usageUnit}
              onChange={(event) => setUsageUnit(event.target.value as UserSettings["usageUnit"])}
            >
              <option value="MB">Megabytes (MB)</option>
              <option value="GB">Gigabytes (GB)</option>
              <option value="TB">Terabytes (TB)</option>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="quotaGb">Monthly quota (GB)</Label>
          <Input
            id="quotaGb"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            placeholder="Leave blank for no quota"
            value={quotaGb}
            onChange={(event) => setQuotaGb(event.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" isLoading={updateSettings.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}
