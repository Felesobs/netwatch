"use client";

import { useCallback, useSyncExternalStore } from "react";

export type NotificationPermissionState = NotificationPermission | "unsupported";

const noopSubscribe = () => () => {};

function getPermissionSnapshot(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export function useBrowserNotifications() {
  // Permission can only change via requestPermission() (handled below) or
  // browser site-settings UI, which doesn't fire a JS event we can
  // subscribe to — so we snapshot on each render rather than push updates.
  const permission = useSyncExternalStore(
    noopSubscribe,
    getPermissionSnapshot,
    () => "unsupported" as const,
  );

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported" as const;
    }
    return Notification.requestPermission();
  }, []);

  const notify = useCallback((title: string, options?: NotificationOptions) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    new Notification(title, { icon: "/icons/icon-192.png", ...options });
  }, []);

  return { permission, requestPermission, notify };
}
