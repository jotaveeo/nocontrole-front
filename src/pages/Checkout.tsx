/**
 * Página de Checkout Profissional
 * Centraliza toda a jornada de compra com estratégias de marketing
 * Acessível tanto da Landing quanto do Dashboard
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Crown, Zap, Sparkles, Check, X, Shield, 
  CreditCard, Clock, TrendingUp, Star, Users,
  ArrowLeft, Lock, BadgeCheck, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PixCheckout } from '@/components/PixCheckout';
import { CreditCardCheckout } from '@/components/CreditCardCheckout';
import { getAllPlans, type PlanConfig } from '@/config/mercadopago';
import { useAuth } from '@/hooks/useAuth';
import { usePlan } from '@/hooks/usePlan';

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { plan: currentPlan } = usePlan();
  
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(null);
  const [showPixCheckout, setShowPixCheckout] = useState(false);
  const [showCreditCardCheckout, setShowCreditCardCheckout] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const plans = getAllPlans();
  const pixPlan = plans.find(p => p.planType === 'pix');
  const monthlyPlan = plans.find(p => p.planType === 'monthly');
  const annualPlan = plans.find(p => p.planType === 'annual');

  // Detectar plano selecionado via URL
  useEffect(() => {
    const planType = searchParams.get('plan');
    if (planType) {
      const plan = plans.find(p => p.planType === planType);
      if (plan) setSelectedPlan(plan);
    }
  }, [searchParams]);

  const handleSelectPlan = (plan: PlanConfig) => {
    setSelectedPlan(plan);
    // Scroll suave até o resumo
    document.getElementById('order-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePayment = () => {
    if (!selectedPlan) return;

    if (selectedPlan.planType === 'pix') {
      setShowPixCheckout(true);
    } else {
      setShowCreditCardCheckout(true);
    }
  };

  const features = [
    { icon: TrendingUp, text: 'Transações ilimitadas', premium: true },
    { icon: CreditCard, text: 'Cartões ilimitados', premium: true },
    { icon: Star, text: 'Metas ilimitadas', premium: true },
    { icon: Shield, text: 'Relatórios avançados', premium: true },
    { icon: Sparkles, text: 'IA de Categorização', premium: true },
    { icon: BadgeCheck, text: 'Exportação de dados', premium: true },
    { icon: Users, text: 'Suporte prioritário', premium: true },
    { icon: Lock, text: 'Backup automático', premium: true },
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Empreendedora',
      text: 'Mudou completamente como controlo minhas finanças. Em 3 meses economizei R$ 2.400!',
      rating: 5,
    },
    {
      name: 'João Santos',
      role: 'Desenvolvedor',
      text: 'A IA de categorização é incrível. Economizo horas todo mês.',
      rating: 5,
    },
    {
      name: 'Ana Costa',
      role: 'Designer',
      text: 'Interface linda e intuitiva. Vale cada centavo!',
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: 'Posso cancelar a qualquer momento?',
      a: 'Sim! Você pode cancelar sua assinatura quando quiser, sem multas ou taxas. Você continua tendo acesso até o fim do período pago.',
    },
    {
      q: 'O que acontece após o período do PIX expirar?',
      a: 'Você voltará ao plano FREE com limites. Pode renovar via PIX novamente ou assinar o plano mensal/anual.',
    },
    {
      q: 'Qual a diferença entre os planos?',
      a: 'PIX: Pagamento único, 30 dias de acesso, sem renovação automática. Mensal/Anual: Renovação automática, mais econômico no longo prazo.',
    },
    {
      q: 'Meus dados estão seguros?',
      a: 'Sim! Usamos criptografia de ponta a ponta e somos certificados PCI DSS Level 1. Seus dados de pagamento nunca passam pelo nosso servidor.',
    },
    {
      q: 'Posso mudar de plano depois?',
      a: 'Sim! Você pode fazer upgrade ou downgrade a qualquer momento. No upgrade, creditamos o valor proporcional do plano anterior.',
    },
    {
      q: 'Tem garantia de reembolso?',
      a: 'Sim! 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do seu dinheiro.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Checkout Seguro
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Planos e Informações */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <Badge variant="secondary" className="mb-2">
                🔥 Oferta Especial
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Desbloqueie Todo o Potencial
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Junte-se a mais de <strong>10.000 usuários</strong> que já transformaram suas finanças
              </p>
            </div>

            {/* Comparação de Planos */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* PIX */}
              {pixPlan && (
                <Card 
                  className={`relative cursor-pointer transition-all hover:shadow-xl ${
                    selectedPlan?.planType === 'pix' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectPlan(pixPlan)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="w-8 h-8 text-cyan-500" />
                    </div>
                    <CardTitle>Plano PIX</CardTitle>
                    <CardDescription>Ideal para experimentar</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-3xl font-bold">R$ 19,90</span>
                      <span className="text-gray-500 dark:text-gray-400">/30 dias</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Pagamento único via PIX
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Acesso instantâneo
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        30 dias de Premium
                      </li>
                      <li className="flex items-center gap-2">
                        <X className="w-4 h-4 text-gray-400" />
                        Sem renovação automática
                      </li>
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={selectedPlan?.planType === 'pix' ? 'default' : 'outline'}
                    >
                      {selectedPlan?.planType === 'pix' ? 'Selecionado' : 'Selecionar'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Mensal */}
              {monthlyPlan && (
                <Card 
                  className={`relative cursor-pointer transition-all hover:shadow-xl ${
                    selectedPlan?.planType === 'monthly' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectPlan(monthlyPlan)}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-primary">
                      Mais Popular
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Crown className="w-8 h-8 text-purple-500" />
                    </div>
                    <CardTitle>Plano Mensal</CardTitle>
                    <CardDescription>Para quem quer controle</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-3xl font-bold">R$ 24,90</span>
                      <span className="text-gray-500 dark:text-gray-400">/mês</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Renovação automática
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Cancele quando quiser
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Acesso Premium vitalício
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Suporte prioritário
                      </li>
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={selectedPlan?.planType === 'monthly' ? 'default' : 'outline'}
                    >
                      {selectedPlan?.planType === 'monthly' ? 'Selecionado' : 'Selecionar'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Anual */}
              {annualPlan && (
                <Card 
                  className={`relative cursor-pointer transition-all hover:shadow-xl ${
                    selectedPlan?.planType === 'annual' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectPlan(annualPlan)}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-amber-600 to-orange-500">
                      💰 Economize R$ 48
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Sparkles className="w-8 h-8 text-amber-500" />
                    </div>
                    <CardTitle>Plano Anual</CardTitle>
                    <CardDescription>Melhor custo-benefício</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-3xl font-bold">R$ 250,80</span>
                      <span className="text-gray-500 dark:text-gray-400">/ano</span>
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        R$ 20,90/mês
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        2 meses grátis
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Economia de R$ 48/ano
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Renovação automática
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Suporte VIP
                      </li>
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={selectedPlan?.planType === 'annual' ? 'default' : 'outline'}
                    >
                      {selectedPlan?.planType === 'annual' ? 'Selecionado' : 'Selecionar'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Features Premium */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Tudo que você ganha no Premium
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <feature.icon className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Depoimentos */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">
                O Que Nossos Usuários Dizem
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {testimonials.map((testimonial, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm italic text-gray-600 dark:text-gray-400">
                        "{testimonial.text}"
                      </p>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-gray-500">{testimonial.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Frequentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {faqs.map((faq, i) => (
                  <div key={i} className="border rounded-lg">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="font-medium">{faq.q}</span>
                      {expandedFaq === i ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {expandedFaq === i && (
                      <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Resumo do Pedido (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card id="order-summary" className="border-2">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPlan ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Plano Selecionado:
                        </span>
                        <Badge>{selectedPlan.name}</Badge>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>R$ {selectedPlan.price.toFixed(2)}</span>
                        </div>
                        {selectedPlan.planType === 'annual' && (
                          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                            <span>Desconto</span>
                            <span>- R$ 48,00</span>
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>R$ {selectedPlan.price.toFixed(2)}</span>
                      </div>

                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handlePayment}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Finalizar Compra
                      </Button>

                      {/* Badges de Confiança */}
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            7 dias de garantia
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Lock className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Pagamento 100% seguro
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <BadgeCheck className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Certificado PCI DSS
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Ativação imediata
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Crown className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Selecione um plano para continuar</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Banner de Urgência */}
              <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">Oferta por Tempo Limitado</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Preços promocionais válidos apenas hoje. Não perca!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

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
