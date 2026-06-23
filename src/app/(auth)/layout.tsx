import { Wifi } from "lucide-react";

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-(--radius-md) bg-accent text-accent-ink">
          <Wifi className="size-4.5" aria-hidden="true" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-ink-primary">NetWatch</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
