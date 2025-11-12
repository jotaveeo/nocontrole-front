import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <div className="aspect-[4/3] w-full rounded-lg border p-4">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}

export function DashboardChartsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  );
}
