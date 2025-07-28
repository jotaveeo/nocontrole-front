import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function HistoricoSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filtros e Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2 w-full sm:w-auto">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-32" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-32" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-32" />
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Transações */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Cabeçalho da tabela */}
            <div className="grid grid-cols-[1fr,auto,auto] gap-4 py-2 border-b">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            
            {/* Linhas da tabela */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr,auto,auto] gap-4 py-2">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Paginação */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
