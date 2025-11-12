import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function WishlistItemSkeleton() {
  return (
    <Card>
      <div className="flex gap-4 p-4">
        {/* Imagem do item */}
        <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
        
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          
          {/* Preço e prioridade */}
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function WishlistPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-7 w-24" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-7 w-24" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-7 w-24" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-7 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Lista de Desejos */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <WishlistItemSkeleton key={i} />
        ))}
      </div>

      {/* Botão flutuante */}
      <div className="fixed bottom-6 right-6">
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
    </div>
  );
}
