
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Crown, Zap, Gift } from "lucide-react";
import { PLANS, PlanType } from "@/types/plans";
import { usePlan } from "@/contexts/PlanContext";

export const PlanSelector: React.FC = () => {
  const { currentPlan, setCurrentPlan, isDevMode, setDevMode } = usePlan();

  const handlePlanChange = (planId: PlanType) => {
    setCurrentPlan(planId);
  };

  const getPlanIcon = (planType: PlanType) => {
    switch (planType) {
      case 'free':
        return <Gift className="w-5 h-5 text-green-500" />;
      case 'essencial':
        return <Zap className="w-5 h-5 text-blue-500" />;
      case 'plus':
        return <Crown className="w-5 h-5 text-purple-500" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  if (!isDevMode) {
    return null;
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Settings className="w-5 h-5" />
          Seletor de Plano (Dev Mode)
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Switch
            id="dev-mode"
            checked={isDevMode}
            onCheckedChange={setDevMode}
          />
          <Label htmlFor="dev-mode" className="text-sm">
            Modo Desenvolvedor
          </Label>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.values(PLANS).map((plan) => (
            <Button
              key={plan.id}
              variant={currentPlan === plan.id ? "default" : "outline"}
              onClick={() => handlePlanChange(plan.id)}
              className="h-auto p-3 flex flex-col items-start space-y-1"
            >
              <div className="flex items-center gap-2 w-full">
                {getPlanIcon(plan.id)}
                <span className="font-medium">{plan.name}</span>
                {plan.popular && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    Popular
                  </Badge>
                )}
              </div>
              <div className="text-sm text-left opacity-75">
                {plan.price}
                {plan.period}
              </div>
            </Button>
          ))}
        </div>
        <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
          Plano atual: <strong>{PLANS[currentPlan].name}</strong> - 
          Use este seletor para testar diferentes experiências de usuário
        </div>
      </CardContent>
    </Card>
  );
};
