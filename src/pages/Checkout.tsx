/**
 * Página de Checkout Minimalista
 * Estilo Stripe/MercadoPago - Focado em conversão
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Crown, Zap, Sparkles, Check, ArrowLeft, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PixCheckout } from '@/components/PixCheckout';
import { CreditCardCheckout } from '@/components/CreditCardCheckout';
import { getAllPlans, type PlanConfig } from '@/config/mercadopago';
import { useAuth } from '@/hooks/useAuth';

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(null);
  const [showPixCheckout, setShowPixCheckout] = useState(false);
  const [showCreditCardCheckout, setShowCreditCardCheckout] = useState(false);

  const plans = getAllPlans();

  // Detectar plano via URL
  useEffect(() => {
    const planType = searchParams.get('plan');
    if (planType) {
      const plan = plans.find(p => p.planType === planType);
      if (plan) setSelectedPlan(plan);
    } else {
      // Selecionar mensal por padrão
      setSelectedPlan(plans.find(p => p.planType === 'monthly') || plans[0]);
    }
  }, [searchParams]);

  const handlePayment = () => {
    if (!selectedPlan) return;
    
    if (selectedPlan.planType === 'pix') {
      setShowPixCheckout(true);
    } else {
      setShowCreditCardCheckout(true);
    }
  };

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'pix': return <Zap className="w-5 h-5" />;
      case 'monthly': return <Crown className="w-5 h-5" />;
      case 'annual': return <Sparkles className="w-5 h-5" />;
      default: return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Simples */}
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar</span>
          </button>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4 text-green-600" />
            <span>Pagamento Seguro</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {/* Layout: 2 colunas - Planos (60%) + Resumo (40%) */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Coluna Esquerda - Seleção de Planos */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Escolha seu plano
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Acesso completo a todas as funcionalidades Premium
              </p>
            </div>

            {/* Cards de Planos */}
            <div className="space-y-3">
              {plans.map((plan) => {
                const isSelected = selectedPlan?.planType === plan.planType;
                const isPopular = plan.planType === 'monthly';
                const hasDiscount = plan.planType === 'annual';

                return (
                  <button
                    key={plan.planType}
                    onClick={() => setSelectedPlan(plan)}
                    className={`
                      w-full text-left p-5 rounded-lg border-2 transition-all
                      ${isSelected 
                        ? 'border-primary bg-primary/5 shadow-lg' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`
                          p-2 rounded-lg 
                          ${isSelected ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}
                        `}>
                          {getPlanIcon(plan.planType)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {plan.name}
                            </h3>
                            {isPopular && (
                              <Badge className="bg-primary text-white">Mais Popular</Badge>
                            )}
                            {hasDiscount && (
                              <Badge variant="secondary">Economize R$ 48</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {plan.planType === 'pix' && 'Pagamento único, 30 dias de acesso'}
                            {plan.planType === 'monthly' && 'Renovação automática mensal'}
                            {plan.planType === 'annual' && '12 meses, melhor custo-benefício'}
                          </p>

                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              {formatPrice(plan.price)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {plan.planType === 'pix' && '/ 30 dias'}
                              {plan.planType === 'monthly' && '/ mês'}
                              {plan.planType === 'annual' && '/ ano'}
                            </span>
                            {plan.planType === 'annual' && (
                              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                (R$ 20,90/mês)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1
                        ${isSelected 
                          ? 'border-primary bg-primary' 
                          : 'border-gray-300 dark:border-gray-600'
                        }
                      `}>
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Features Incluídas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Incluído no Premium
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Transações ilimitadas',
                  'Cartões ilimitados',
                  'Metas ilimitadas',
                  'Relatórios avançados',
                  'Categorização com IA',
                  'Exportação de dados',
                  'Suporte prioritário',
                  'Backup automático',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna Direita - Resumo e Pagamento */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Card do Resumo */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Resumo
                </h3>

                {selectedPlan ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedPlan.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedPlan.planType === 'pix' && 'Pagamento via PIX'}
                          {selectedPlan.planType === 'monthly' && 'Cartão de crédito'}
                          {selectedPlan.planType === 'annual' && 'Cartão de crédito'}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(selectedPlan.price)}
                      </p>
                    </div>

                    {selectedPlan.planType === 'annual' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Desconto anual</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">-R$ 48,00</span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-baseline mb-6">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(selectedPlan.price)}
                        </span>
                      </div>

                      <Button 
                        onClick={handlePayment}
                        className="w-full h-12 text-base font-semibold"
                        size="lg"
                      >
                        Continuar para pagamento
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Selecione um plano</p>
                )}
              </div>

              {/* Badges de Confiança */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Garantia de 7 dias</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span>Pagamento 100% seguro</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modais de Pagamento */}
      {selectedPlan && showPixCheckout && (
        <PixCheckout
          isOpen={showPixCheckout}
          onClose={() => setShowPixCheckout(false)}
          amount={selectedPlan.price}
          planName={selectedPlan.name}
        />
      )}

      {selectedPlan && showCreditCardCheckout && (
        <CreditCardCheckout
          isOpen={showCreditCardCheckout}
          onClose={() => setShowCreditCardCheckout(false)}
          amount={selectedPlan.price}
          planName={selectedPlan.name}
          planType={selectedPlan.planType as 'monthly' | 'annual'}
        />
      )}
    </div>
  );
}
