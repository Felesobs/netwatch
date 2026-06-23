import { create } from "zustand";
import type { UsageRecord } from "@/types";

interface UsageDialogState {
  /** `null` = closed, no record = create mode, with record = edit mode. */
  mode: null | { record: null } | { record: UsageRecord };
  openCreate: () => void;
  openEdit: (record: UsageRecord) => void;
  close: () => void;
}

export const useUsageDialogStore = create<UsageDialogState>((set) => ({
  mode: null,
  openCreate: () => set({ mode: { record: null } }),
  openEdit: (record) => set({ mode: { record } }),
  close: () => set({ mode: null }),
}));

interface MobileNavState {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

export const useMobileNavStore = create<MobileNavState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
}));
