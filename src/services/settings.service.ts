import { prisma } from "@/lib/prisma";
import type { SettingsUpdateInput } from "@/lib/validation";
import type { UserSettings } from "@/types";
import { mapSettings } from "./mappers";

export async function getOrCreateSettings(userId: string): Promise<UserSettings> {
  const settings = await prisma.settings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  return mapSettings(settings);
}

export async function updateSettings(
  userId: string,
  input: SettingsUpdateInput,
): Promise<UserSettings> {
  // Single upsert: creates the row with defaults if it doesn't exist (race-
  // safe), then applies the partial update. Eliminates the previous
  // find-then-update pattern which had a TOCTOU race under concurrent requests.
  const updated = await prisma.settings.upsert({
    where: { userId },
    create: {
      userId,
      ...(input.billingCycleDay !== undefined && { billingCycleDay: input.billingCycleDay }),
      ...(input.usageUnit !== undefined && { usageUnit: input.usageUnit }),
      ...(input.quotaGb !== undefined && { quotaGb: input.quotaGb }),
      ...(input.theme !== undefined && { theme: input.theme }),
      ...(input.browserNotifications !== undefined && { browserNotifications: input.browserNotifications }),
      ...(input.inAppNotifications !== undefined && { inAppNotifications: input.inAppNotifications }),
      ...(input.notifyThresholds !== undefined && { notifyThresholds: input.notifyThresholds }),
    },
    update: {
      ...(input.billingCycleDay !== undefined && { billingCycleDay: input.billingCycleDay }),
      ...(input.usageUnit !== undefined && { usageUnit: input.usageUnit }),
      ...(input.quotaGb !== undefined && { quotaGb: input.quotaGb }),
      ...(input.theme !== undefined && { theme: input.theme }),
      ...(input.browserNotifications !== undefined && { browserNotifications: input.browserNotifications }),
      ...(input.inAppNotifications !== undefined && { inAppNotifications: input.inAppNotifications }),
      ...(input.notifyThresholds !== undefined && { notifyThresholds: input.notifyThresholds }),
    },
  });

  return mapSettings(updated);
}
