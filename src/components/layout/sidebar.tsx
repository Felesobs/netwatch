"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wifi, LogOut } from "lucide-react";
import { cn } from "@/utils";
import { NAV_ITEMS } from "./nav-items";
import { useCurrentUser, useLogout } from "@/hooks";

export function Sidebar() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex size-8 items-center justify-center rounded-(--radius-sm) bg-accent text-accent-ink">
          <Wifi className="size-4" aria-hidden="true" />
        </div>
        <span className="text-base font-semibold tracking-tight">NetWatch</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-(--radius-md) px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent-subtle text-accent"
                  : "text-ink-secondary hover:bg-canvas hover:text-ink-primary",
              )}
            >
              <Icon className="size-4.5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between gap-2 rounded-(--radius-md) px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink-primary">
              {user?.name ?? "Account"}
            </p>
            <p className="truncate text-xs text-ink-secondary">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => logout.mutate()}
            aria-label="Sign out"
            className="shrink-0 rounded-(--radius-sm) p-2 text-ink-tertiary transition-colors hover:bg-canvas hover:text-ink-primary"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
