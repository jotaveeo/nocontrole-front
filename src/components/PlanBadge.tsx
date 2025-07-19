
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePlan } from "@/contexts/PlanContext";

interface PlanBadgeProps {
  feature?: keyof typeof import("@/types/plans").PLANS.free.features;
  requiredPlan?: import("@/types/plans").PlanType;
  className?: string;
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({ 
  feature, 
  requiredPlan = 'essencial',
  className = "" 
}) => {
  const { canAccess, currentPlan } = usePlan();

  // If feature is provided, check if user can access it
  if (feature && canAccess(feature)) {
    return null;
  }

  // If no feature provided, check if current plan is lower than required
  if (!feature && currentPlan !== 'free') {
    return null;
  }

  return (
    <Badge 
      variant="secondary" 
      className={`bg-orange-100 text-orange-800 border-orange-200 ${className}`}
    >
      <Lock className="w-3 h-3 mr-1" />
      {requiredPlan === 'essencial' ? 'Mensal' : 'Anual'}
    </Badge>
  );
};
