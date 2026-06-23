import type { ReactNode } from "react";
import { AlertBell } from "./alert-bell";
import { ThemeToggle } from "./theme-toggle";

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-ink-primary">
            {title}
          </h1>
          {description && (
            <p className="hidden truncate text-sm text-ink-secondary sm:block">{description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {actions}
          <AlertBell />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
