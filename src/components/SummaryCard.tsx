import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  description?: string;
  className?: string;
  formatAsCurrency?: boolean;
}

export const SummaryCard = ({
  title,
  value,
  icon,
  trend,
  description,
  className = "",
  formatAsCurrency = true,
}: SummaryCardProps) => {
  const formatValue = (val: number | string) => {
    if (typeof val === "string") return val;
    if (formatAsCurrency) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(val);
    }
    return val.toString();
  };

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-lg focus-within:ring-2 focus-within:ring-primary/40 ${className}`}
      tabIndex={0}
      aria-label={title}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 lg:px-6 pt-4 lg:pt-6">
        <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground leading-tight">
          {title}
        </CardTitle>
        <div className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6">
        <div
          className="text-lg lg:text-2xl font-bold leading-tight break-all"
          aria-live="polite"
        >
          {formatValue(value)}
        </div>
        {description && (
          <div className="flex items-center gap-1 mt-1">
            <span
              className={`text-xs lg:text-sm font-medium ${
                trend === "up" 
                  ? "text-green-600" 
                  : trend === "down" 
                  ? "text-red-600" 
                  : "text-muted-foreground"
              }`}
            >
              {description}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
