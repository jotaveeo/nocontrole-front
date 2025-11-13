/**
 * Modal de Upgrade - Mostra planos disponíveis
 * Integrado com os componentes PixCheckout e CreditCardCheckout
 */

import { useState } from 'react';
import { Crown, Check, Zap, Gift, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PixCheckout } from '@/components/PixCheckout';
import { CreditCardCheckout } from '@/components/CreditCardCheckout';
import { getAllPlans } from '@/config/mercadopago';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightPlan?: 'pix' | 'monthly' | 'annual';
}

export function UpgradeModal({ isOpen, onClose, highlightPlan }: UpgradeModalProps) {
  const [showPixCheckout, setShowPixCheckout] = useState(false);
  const [showCreditCardCheckout, setShowCreditCardCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const availablePlans = getAllPlans();

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    
    if (plan.planType === 'pix') {
      setShowPixCheckout(true);
    } else {
      setShowCreditCardCheckout(true);
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'pix':
        return <Zap className="w-5 h-5" />;
      case 'monthly':
        return <Crown className="w-5 h-5" />;
      case 'annual':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'pix':
        return 'from-cyan-500 to-blue-500';
      case 'monthly':
        return 'from-purple-500 to-pink-500';
      case 'annual':
        return 'from-amber-500 to-orange-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  if (showPixCheckout && selectedPlan) {
    return (
      <PixCheckout
        isOpen={showPixCheckout}
        onClose={() => {
          setShowPixCheckout(false);
          setSelectedPlan(null);
          onClose();
        }}
        amount={selectedPlan.price}
        planName={selectedPlan.name}
      />
    );
  }

  if (showCreditCardCheckout && selectedPlan) {
    return (
      <CreditCardCheckout
        isOpen={showCreditCardCheckout}
        onClose={() => {
          setShowCreditCardCheckout(false);
          setSelectedPlan(null);
          onClose();
        }}
        amount={selectedPlan.price}
        planName={selectedPlan.name}
        planType={selectedPlan.planType}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="w-6 h-6 text-primary" />
            Escolha seu Plano Premium
          </DialogTitle>
          <DialogDescription>
            Desbloqueie recursos ilimitados e leve seu controle financeiro para o próximo nível
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {availablePlans.map((plan) => {
            const isHighlighted = plan.planType === highlightPlan;
            const isPopular = plan.popular;

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative transition-all hover:shadow-lg',
                  isHighlighted && 'ring-2 ring-primary',
                  isPopular && 'border-primary'
                )}
              >
                {/* Badge Popular */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white px-3 py-1">
                      ⭐ Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  {/* Ícone do Plano */}
                  <div className={cn(
                    'mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2',
                    'bg-gradient-to-r text-white',
                    getPlanColor(plan.planType)
                  )}>
                    {getPlanIcon(plan.planType)}
                  </div>

                  {/* Nome do Plano */}
                  <CardTitle className="text-xl">{plan.name}</CardTitle>

                  {/* Preço */}
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.displayPrice}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  {/* Descrição */}
                  <CardDescription className="mt-2 min-h-[40px]">
                    {plan.description}
                  </CardDescription>

                  {/* Badge de Economia (apenas anual) */}
                  {plan.planType === 'annual' && (
                    <Badge variant="outline" className="mt-2 border-green-500 text-green-700">
                      💰 Economize R$ 48/ano
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features */}
                  <ul className="space-y-2 mb-4">
                    {plan.features.slice(0, 6).map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Botão */}
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    className={cn(
                      'w-full',
                      isPopular && 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90'
                    )}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Informações Adicionais */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold">Cancele quando quiser</p>
              <p className="text-muted-foreground">Sem fidelidade</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold">Pagamento Seguro</p>
              <p className="text-muted-foreground">Mercado Pago</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold">Ativação Imediata</p>
              <p className="text-muted-foreground">Acesso instantâneo</p>
            </div>
          </div>
        </div>

        {/* Garantia */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>🔒 Seus dados são criptografados e protegidos</p>
          <p>💳 Aceitamos PIX e Cartão de Crédito</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Versão simplificada do modal (para usar em alertas)
 */
interface QuickUpgradeProps {
  onUpgrade: () => void;
  featureName?: string;
}

export function QuickUpgrade({ onUpgrade, featureName }: QuickUpgradeProps) {
  return (
    <div className="text-center space-y-4 p-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
        <Crown className="w-8 h-8 text-primary" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {featureName ? `${featureName} é Premium` : 'Recurso Premium'}
        </h3>
        <p className="text-muted-foreground">
          Faça upgrade para desbloquear este recurso e muito mais
        </p>
      </div>

      <div className="space-y-2">
        <Button onClick={onUpgrade} className="w-full">
          <Crown className="w-4 h-4 mr-2" />
          Ver Planos Premium
        </Button>
        <p className="text-xs text-muted-foreground">
          A partir de R$ 10,00
        </p>
      </div>
    </div>
  );
}
