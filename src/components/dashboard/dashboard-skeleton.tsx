import { Skeleton } from "@/components/ui";

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4 md:p-8">
      <Skeleton className="h-56 w-full" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
