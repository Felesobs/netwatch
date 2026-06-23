"use client";

import { useEffect } from "react";

/**
 * Registers the service worker on mount. Kept as its own tiny client
 * component (rather than inline in the root layout) so it's trivially easy
 * to remove or feature-flag without touching layout markup.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  }, []);

  return null;
}
