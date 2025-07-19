
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Crown, Zap } from 'lucide-react';
import { usePlan } from '@/contexts/PlanContext';
import { PlanType } from '@/types/plans';

interface PlanLimitWarningProps {
  currentCount: number;
  limit: number;
  itemName: string;
  requiredPlan: PlanType;
  onUpgrade?: () => void;
}

export const PlanLimitWarning: React.FC<PlanLimitWarningProps> = ({
  currentCount,
  limit,
  itemName,
  requiredPlan,
  onUpgrade,
}) => {
  const { currentPlan } = usePlan();
  
  if (limit === -1 || currentCount < limit * 0.8) {
    return null;
  }

  const isAtLimit = currentCount >= limit;
  const remaining = Math.max(0, limit - currentCount);

  const getPlanIcon = () => {
    switch (requiredPlan) {
      case 'essencial':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'plus':
        return <Crown className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <Alert className={`mb-4 ${isAtLimit ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        {isAtLimit ? `Limite de ${itemName} atingido` : `Limite de ${itemName} próximo`}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="mb-3">
          {isAtLimit ? (
            <p>Você atingiu o limite de {limit} {itemName.toLowerCase()} do plano {currentPlan}.</p>
          ) : (
            <p>Você tem {remaining} {itemName.toLowerCase()} restantes de {limit} no plano {currentPlan}.</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm">
            {getPlanIcon()}
            <span>Upgrade para {requiredPlan}</span>
          </div>
          {onUpgrade && (
            <Button 
              size="sm" 
              variant={isAtLimit ? "default" : "outline"}
              onClick={onUpgrade}
            >
              Fazer Upgrade
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
