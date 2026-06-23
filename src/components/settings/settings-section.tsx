import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui";

export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-ink-primary">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-ink-secondary">{description}</p>}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className="text-sm font-medium text-ink-primary">{label}</p>
        {description && <p className="text-xs text-ink-secondary">{description}</p>}
      </div>
      {children}
    </div>
  );
}
