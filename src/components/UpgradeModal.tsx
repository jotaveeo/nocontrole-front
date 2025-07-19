
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Zap } from "lucide-react";
import { PLANS, PlanType } from "@/types/plans";
import { usePlan } from "@/contexts/PlanContext";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPlan: PlanType;
  feature: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  requiredPlan,
  feature,
}) => {
  const { setCurrentPlan, isDevMode } = usePlan();
  const plan = PLANS[requiredPlan];

  const handleUpgrade = () => {
    if (isDevMode) {
      setCurrentPlan(requiredPlan);
      onClose();
    } else {
      // In production, redirect to payment page
      window.open('/pagamento', '_blank');
    }
  };

  const getPlanIcon = (planType: PlanType) => {
    switch (planType) {
      case 'essencial':
        return <Zap className="w-5 h-5 text-blue-500" />;
      case 'plus':
        return <Crown className="w-5 h-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const featuresList = [
    requiredPlan === 'essencial' && 'Acesso total por 30 dias',
    requiredPlan === 'essencial' && 'Relatórios ilimitados',
    requiredPlan === 'essencial' && 'Categorias ilimitadas',
    requiredPlan === 'essencial' && 'Metas ilimitadas',
    requiredPlan === 'essencial' && 'Cancele quando quiser',
    requiredPlan === 'plus' && 'Acesso total por 1 ano',
    requiredPlan === 'plus' && 'Economize R$ 48 por ano',
    requiredPlan === 'plus' && 'Todas as funcionalidades',
    requiredPlan === 'plus' && 'Suporte prioritário',
    requiredPlan === 'plus' && 'Melhor custo-benefício',
  ].filter(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {getPlanIcon(requiredPlan)}
            <DialogTitle>Upgrade para {plan.name}</DialogTitle>
            {plan.popular && (
              <Badge className="bg-primary/10 text-primary">Mais Popular</Badge>
            )}
          </div>
          <DialogDescription>
            Para usar <strong>{feature}</strong>, você precisa do plano {plan.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {plan.price}
              {plan.period && (
                <span className="text-lg text-gray-500">{plan.period}</span>
              )}
            </div>
            <p className="text-sm text-gray-600">{plan.description}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">O que você ganha:</h4>
            <ul className="space-y-1">
              {featuresList.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleUpgrade} className="flex-1">
              {isDevMode ? 'Ativar (Dev)' : 'Fazer Upgrade'}
            </Button>
          </div>

          {isDevMode && (
            <div className="text-xs text-center text-orange-600 bg-orange-50 p-2 rounded">
              Modo desenvolvedor ativo - upgrade simulado
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
