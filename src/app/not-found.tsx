import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-canvas text-ink-tertiary">
        <Compass className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-ink-primary">Page not found</h1>
        <p className="max-w-sm text-sm text-ink-secondary">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Link href="/dashboard">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
