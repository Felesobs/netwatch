import type { ReactNode } from "react";
import { cn } from "@/utils";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-canvas text-ink-tertiary">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium text-ink-primary">{title}</p>
        {description && (
          <p className="max-w-xs text-sm text-ink-secondary">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
