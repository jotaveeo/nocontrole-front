
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CategoryLimit {
  id: string;
  name: string;
  spent: number;
  budget: number;
  percentage: number;
  remaining: number;
  transactions: number;
  status: "safe" | "warning" | "exceeded";
}

interface LimitsSummaryStatsProps {
  safeCategories: CategoryLimit[];
  warningCategories: CategoryLimit[];
  exceededCategories: CategoryLimit[];
  categoryLimits: CategoryLimit[];
}

export const LimitsSummaryStats = ({
  safeCategories,
  warningCategories,
  exceededCategories,
  categoryLimits
}: LimitsSummaryStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="border-l-4 border-l-green-500 cursor-help hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {safeCategories.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dentro do Limite
                  </p>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Categorias que estão utilizando menos de 80% do orçamento</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="border-l-4 border-l-yellow-500 cursor-help hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {warningCategories.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Em Atenção</p>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Categorias que estão utilizando entre 80% e 100% do orçamento</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="border-l-4 border-l-red-500 cursor-help hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {exceededCategories.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Limite Excedido</p>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Categorias que já ultrapassaram o limite do orçamento</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="border-l-4 border-l-primary cursor-help hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {categoryLimits
                      .reduce((sum, cat) => sum + cat.budget, 0)
                      .toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                  </p>
                  <p className="text-xs text-muted-foreground">Orçamento Total</p>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Soma de todos os limites definidos para este mês</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
