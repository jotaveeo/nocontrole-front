import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCardsSkeleton } from "./CardSkeleton";
import { DashboardChartsSkeleton } from "./ChartSkeleton";
import { TableSkeleton } from "./TableSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>

      {/* Cards */}
      <DashboardCardsSkeleton />

      {/* Charts */}
      <DashboardChartsSkeleton />

      {/* Table */}
      <TableSkeleton />
    </div>
  );
}
