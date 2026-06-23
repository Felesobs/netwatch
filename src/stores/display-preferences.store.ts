import { create } from "zustand";
import type { UsageUnit } from "@/types";

/**
 * Mirrors `UserSettings.usageUnit` from the server for instant, optimistic
 * UI updates (switching the unit shouldn't wait on a round trip). The
 * settings page is responsible for keeping this in sync after a successful
 * PATCH — see `useUpdateSettings` in `src/hooks/use-settings.ts`.
 */
interface DisplayPreferencesState {
  usageUnit: UsageUnit;
  setUsageUnit: (unit: UsageUnit) => void;
}

export const useDisplayPreferencesStore = create<DisplayPreferencesState>((set) => ({
  usageUnit: "GB",
  setUsageUnit: (unit) => set({ usageUnit: unit }),
}));
