/**
 * Configuração do Mercado Pago
 * Documentação: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro
 */

export interface MercadoPagoConfig {
  publicKey: string;
  pixEndpoint: string;
  subscriptionEndpoint: string;
  pixStatusEndpoint: string;
  subscriptionStatusEndpoint: string;
}

export interface PlanConfig {
  id: string;
  name: string;
  price: number;
  priceInCents: number;
  displayPrice: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  badge?: string;
  badgeColor?: string;
  externalReference: string; // Referência para identificar o plano no backend
  planType: 'pix' | 'monthly' | 'annual'; // Tipo de plano para o backend
}

// Configuração do Mercado Pago
// IMPORTANTE: Em produção, mova a PUBLIC_KEY para variáveis de ambiente
export const MERCADOPAGO_CONFIG: MercadoPagoConfig = {
  // Public Key de TESTE - substitua pela de produção quando subir
  publicKey: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || 'APP_USR-1d826adb-a245-47dd-9bfa-c1d69819a8ac',
  pixEndpoint: '/api/mercadopago/pix/create',
  subscriptionEndpoint: '/api/mercadopago/subscription/create',
  pixStatusEndpoint: '/api/mercadopago/pix/status',
  subscriptionStatusEndpoint: '/api/mercadopago/subscription/status',
};

// Configuração dos planos disponíveis
export const PLANS: Record<string, PlanConfig> = {
  PREMIUM_MONTHLY: {
    id: 'premium_monthly',
    name: '💎 Plano Mensal',
    price: 15.90,
    priceInCents: 1590,
    displayPrice: 'R$ 15,90',
    period: '/mês',
    description: '✨ Controle total das suas finanças - Cancele quando quiser!',
    features: [
      'Relatórios avançados ilimitados',
      'Metas financeiras ilimitadas',
      'Wishlist e mural de desejos',
      'Categorias personalizadas',
      'Sincronização entre dispositivos',
      'Gestão de cartões de crédito',
      'Limites por categoria inteligentes',
      'Cofrinho digital',
      'Investimentos centralizados',
      'Calendário financeiro',
    ],
    cta: 'Assinar Mensal',
    popular: false,
    externalReference: 'nocontrole_premium_monthly',
    planType: 'monthly',
  },
  
  PREMIUM_ANNUAL: {
    id: 'premium_annual',
    name: '🏆 Plano Anual',
    price: 162.00,
    priceInCents: 16200,
    displayPrice: '12x R$ 13,50',
    period: '/mês',
    description: '🔥 MELHOR OFERTA! Economize R$ 28,80 por ano - Apenas R$ 162,00/ano',
    features: [
      'Economize R$ 28,80 comparado ao mensal',
      'Tudo do plano mensal incluído',
      'mais recursos exclusivos em breve...',
    ],
    cta: 'Assinar Anual',
    popular: true,
    externalReference: 'nocontrole_premium_annual',
    planType: 'annual',
  },
  
  PREMIUM_PIX_30_DAYS: {
    id: 'premium_pix_30_days',
    name: '⚡ Plano PIX - 30 Dias',
    price: 10.00,
    priceInCents: 1000,
    displayPrice: 'R$ 10,00',
    period: 'válido por 30 dias',
    description: '💳 Pagamento único via PIX - Sem renovação automática',
    features: [
      '✅ Acesso completo por 30 dias',
      '✅ Todos os recursos Premium incluídos',
      '✅ Pagamento instantâneo via PIX',
      '✅ Sem necessidade de cartão',
      '⚠️ Renovação manual necessária',
      '⚠️ Acesso suspenso após 30 dias',
      '📱 Notificação antes do vencimento',
      '🔄 Pode renovar a qualquer momento',
    ],
    cta: 'Pagar com PIX',
    popular: false,
    badge: 'Pagamento Único',
    badgeColor: 'bg-green-500',
    externalReference: 'nocontrole_premium_pix_30days',
    planType: 'pix',
  },
};

/**
 * Obter configuração de um plano pelo ID
 */
export function getPlanById(planId: string): PlanConfig | undefined {
  return Object.values(PLANS).find(plan => plan.id === planId);
}

/**
 * Obter todos os planos como array
 */
export function getAllPlans(): PlanConfig[] {
  return Object.values(PLANS);
}

/**
 * Formatar preço em centavos para formato brasileiro
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

/**
 * Validar se uma Public Key do Mercado Pago é válida
 */
export function isValidPublicKey(key: string): boolean {
  return key.startsWith('TEST-') || key.startsWith('APP_USR-');
}

/**
 * Obter URL de inicialização do Checkout Pro
 * Essa URL será retornada pelo backend após criar a preferência
 */
export function getCheckoutUrl(preferenceId: string, isSandbox = false): string {
  const baseUrl = isSandbox 
    ? 'https://sandbox.mercadopago.com.br'
    : 'https://www.mercadopago.com.br';
  
  return `${baseUrl}/checkout/v1/redirect?pref_id=${preferenceId}`;
}

/**
 * Status possíveis de um pagamento no Mercado Pago
 */
export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  AUTHORIZED = 'authorized',
  IN_PROCESS = 'in_process',
  IN_MEDIATION = 'in_mediation',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  CHARGED_BACK = 'charged_back',
}

/**
 * Traduzir status do pagamento para português
 */
export function translatePaymentStatus(status: PaymentStatus): string {
  const translations: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'Pendente',
    [PaymentStatus.APPROVED]: 'Aprovado',
    [PaymentStatus.AUTHORIZED]: 'Autorizado',
    [PaymentStatus.IN_PROCESS]: 'Em processamento',
    [PaymentStatus.IN_MEDIATION]: 'Em mediação',
    [PaymentStatus.REJECTED]: 'Rejeitado',
    [PaymentStatus.CANCELLED]: 'Cancelado',
    [PaymentStatus.REFUNDED]: 'Reembolsado',
    [PaymentStatus.CHARGED_BACK]: 'Estornado',
  };
  
  return translations[status] || status;
}
