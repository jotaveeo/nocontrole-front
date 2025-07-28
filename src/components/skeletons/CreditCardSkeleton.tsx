import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CreditCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-1/3" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function CreditCardPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header com botão de adicionar */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>

      {/* Grid de cartões */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <CreditCardSkeleton key={i} />
        ))}
      </div>

      {/* Resumo de gastos */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
