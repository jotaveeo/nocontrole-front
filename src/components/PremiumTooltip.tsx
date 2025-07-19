
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock, Crown, Zap } from "lucide-react";
import { PlanType } from "@/types/plans";

interface PremiumTooltipProps {
  children: React.ReactNode;
  feature: string;
  requiredPlan: PlanType;
  description?: string;
}

export const PremiumTooltip: React.FC<PremiumTooltipProps> = ({
  children,
  feature,
  requiredPlan,
  description
}) => {
  const getPlanIcon = () => {
    switch (requiredPlan) {
      case 'essencial':
        return <Zap className="w-3 h-3 text-blue-500" />;
      case 'plus':
        return <Crown className="w-3 h-3 text-purple-500" />;
      default:
        return <Lock className="w-3 h-3" />;
    }
  };

  const getPlanName = () => {
    switch (requiredPlan) {
      case 'essencial':
        return 'Mensal';
      case 'plus':
        return 'Anual';
      default:
        return 'Premium';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="flex items-start gap-2">
            {getPlanIcon()}
            <div>
              <p className="font-medium text-sm">
                {feature} - Plano {getPlanName()}
              </p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Faça upgrade para desbloquear este recurso
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
