import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Trash2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface CategoryLimit {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  spent: number;
  budget: number;
  percentage: number;
  remaining: number;
  transactions: number;
  status: 'safe' | 'warning' | 'exceeded';
}

interface CategoryLimitCardProps {
  category: CategoryLimit;
  onEdit: (category: CategoryLimit) => void;
  onDelete: (category: CategoryLimit) => void;
}

export const CategoryLimitCard: React.FC<CategoryLimitCardProps> = ({
  category,
  onEdit,
  onDelete
}) => {
  const getStatusColor = () => {
    switch (category.status) {
      case 'safe':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'exceeded':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (category.status) {
      case 'safe':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      case 'exceeded':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  const getProgressColor = () => {
    if (category.percentage >= 100) return 'bg-red-500';
    if (category.percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className={`border-l-4 ${getStatusColor()} hover:shadow-md transition-all duration-200 hover:scale-[1.02]`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{category.icon}</span>
            <div>
              <h3 className="font-semibold text-sm">{category.name}</h3>
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">
                  {category.transactions} transações
                </p>
                {getStatusIcon()}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onEdit(category)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar limite da categoria</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={() => onDelete(category)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remover limite personalizado</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            <span>Gasto:</span>
            <span className="font-semibold text-destructive">
              R$ {category.spent.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span>Orçamento:</span>
            <span className="font-semibold">
              R$ {category.budget.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="space-y-1">
            <Progress 
              value={category.percentage} 
              className="h-2"
            />
            <div className="flex justify-between text-xs">
              <span
                className={
                  category.remaining >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {category.remaining >= 0 ? "Restante:" : "Excesso:"}
              </span>
              <span
                className={`font-semibold ${
                  category.remaining >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                R$ {Math.abs(category.remaining).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="text-center">
            <Badge
              variant="outline"
              className={`text-xs ${
                category.status === "safe"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : category.status === "warning"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {category.percentage.toFixed(0)}% utilizado
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
