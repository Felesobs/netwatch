import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-canvas text-ink-tertiary">
        <WifiOff className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-ink-primary">You&apos;re offline</h1>
        <p className="max-w-xs text-sm text-ink-secondary">
          NetWatch needs a connection to load fresh data. Reconnect and try again.
        </p>
      </div>
    </div>
  );
}
