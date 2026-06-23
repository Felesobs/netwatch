"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { SettingsSection } from "./settings-section";
import { cn } from "@/utils";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function AppearanceSettingsForm() {
  const { theme, setTheme } = useTheme();

  return (
    <SettingsSection title="Appearance" description="Choose how NetWatch looks on this device.">
      <div className="grid grid-cols-3 gap-3">
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-pressed={isActive}
              className={cn(
                "flex flex-col items-center gap-2 rounded-(--radius-md) border px-4 py-4 text-sm font-medium transition-colors",
                isActive
                  ? "border-accent bg-accent-subtle text-accent"
                  : "border-border-strong text-ink-secondary hover:bg-canvas",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>
    </SettingsSection>
  );
}
