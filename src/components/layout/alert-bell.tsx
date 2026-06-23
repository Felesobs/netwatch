"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useAlerts, useDismissAlert } from "@/hooks";
import { cn } from "@/utils";
import { Button } from "@/components/ui";

export function AlertBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { data: alerts = [] } = useAlerts("TRIGGERED");
  const dismissAlert = useDismissAlert();

  const hasAlerts = alerts.length > 0;

  // Close on outside click
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  // Close on Escape and return focus to trigger
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`Notifications${hasAlerts ? ` (${alerts.length} unread)` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="relative flex size-9 items-center justify-center rounded-(--radius-md) text-ink-secondary transition-colors hover:bg-canvas hover:text-ink-primary"
      >
        <Bell className="size-4.5" aria-hidden="true" />
        {hasAlerts && (
          <span
            className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger"
            aria-hidden="true"
          />
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-80 rounded-(--radius-lg) border border-border bg-surface-raised shadow-(--shadow-lg)"
        >
          <div className="border-b border-border p-4">
            <p className="text-sm font-semibold text-ink-primary">Notifications</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!hasAlerts ? (
              <p className="p-4 text-sm text-ink-secondary">You&apos;re all caught up.</p>
            ) : (
              <ul className="divide-y divide-border">
                {alerts.map((alert) => (
                  <li key={alert.id} className="p-4">
                    <p className="text-sm text-ink-primary">{alert.message}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-ink-tertiary">
                        {new Date(alert.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn("h-7 px-2 text-xs")}
                        onClick={() => {
                          dismissAlert.mutate(alert.id);
                        }}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
