"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { ServiceWorkerRegistration } from "./service-worker-registration";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <ToastProvider />
        <ServiceWorkerRegistration />
      </QueryProvider>
    </ThemeProvider>
  );
}
