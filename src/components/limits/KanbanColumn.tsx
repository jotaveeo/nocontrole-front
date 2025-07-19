import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CategoryLimitCard } from "@/components/CategoryLimitCard";
import { LucideIcon } from "lucide-react";

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
  status: "safe" | "warning" | "exceeded";
}

interface KanbanColumnProps {
  title: string;
  categories: CategoryLimit[];
  bgColor: string;
  textColor: string;
  icon: LucideIcon;
  onEdit: (category: CategoryLimit) => void;
  onDelete: (category: CategoryLimit) => void;
}

export const KanbanColumn = ({
  title,
  categories,
  bgColor,
  textColor,
  icon: Icon,
  onEdit,
  onDelete
}: KanbanColumnProps) => (
  <Card className="h-fit">
    <CardHeader className="pb-3">
      <CardTitle className={`text-base flex items-center gap-2 ${textColor}`}>
        <Icon className="h-4 w-4" />
        {title}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-help">
              <Badge variant="secondary" className="ml-auto">
                {categories.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{categories.length} categorias neste status</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {categories.map((category) => (
        <CategoryLimitCard
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {categories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">Nenhuma categoria neste status</p>
          <p className="text-xs mt-1">
            {title === "Dentro do Limite" 
              ? "Suas categorias aparecerão aqui quando estiverem dentro do orçamento"
              : title === "Atenção (80%+)"
              ? "Categorias próximas do limite aparecerão aqui"
              : "Categorias que excederam o limite aparecerão aqui"
            }
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);
