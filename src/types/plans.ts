export type PlanType = 'free' | 'essencial' | 'plus';

export interface PlanFeatures {
  maxCategories: number;
  maxGoals: number;
  hasReports: boolean;
  hasWhatsAppAlerts: boolean;
  hasPrioritySupport: boolean;
  hasMultipleAccounts: boolean;
  hasUnlimitedGoals: boolean;
  hasAutomations: boolean;
  hasCloudBackup: boolean;
  hasCustomThemes: boolean;
  hasVipSupport: boolean;
  hasFamilyBudget: boolean;
  dashboard: boolean;
  newLaunch: boolean;
  history: boolean;
  hasGoals: boolean;
  hasWishlist: boolean;
  hasPiggyBank: boolean;
  hasDebts: boolean;
  hasCreditCards: boolean;
  hasCalendar: boolean;
  hasLimits: boolean;
  hasFixedExpenses: boolean;
  hasInvestments: boolean;
  hasIncomeSources: boolean;
  hasImport: boolean;
  hasCategories: boolean;
  hasSettings: boolean;
}

export interface Plan {
  id: PlanType;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: PlanFeatures;
  popular?: boolean;
}

export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: 'free',
    name: '🎯 Teste Grátis',
    price: 'GRÁTIS',
    period: '7 dias',
    description: '🚀 Experimente TODAS as funcionalidades PREMIUM por 7 dias!',
    features: {
      maxCategories: -1, // unlimited durante o teste
      maxGoals: -1, // unlimited durante o teste
      hasReports: true,
      hasWhatsAppAlerts: true,
      hasPrioritySupport: true,
      hasMultipleAccounts: true,
      hasUnlimitedGoals: true,
      hasAutomations: true,
      hasCloudBackup: true,
      hasCustomThemes: true,
      hasVipSupport: true,
      hasFamilyBudget: true,
      dashboard: true,
      newLaunch: true,
      history: true,
      hasGoals: true,
      hasWishlist: true,
      hasPiggyBank: true,
      hasDebts: true,
      hasCreditCards: true,
      hasCalendar: true,
      hasLimits: true,
      hasFixedExpenses: true,
      hasInvestments: true,
      hasIncomeSources: true,
      hasImport: true,
      hasCategories: true,
      hasSettings: true,
    },
  },
  essencial: {
    id: 'essencial',
    name: '💎 Plano Mensal',
    price: 'R$ 24,90',
    period: '/mês',
    description: '✨ Controle total das suas finanças - Cancele quando quiser!',
    popular: false,
    features: {
      maxCategories: -1, // unlimited
      maxGoals: -1, // unlimited
      hasReports: true,
      hasWhatsAppAlerts: true,
      hasPrioritySupport: true,
      hasMultipleAccounts: true,
      hasUnlimitedGoals: true,
      hasAutomations: true,
      hasCloudBackup: true,
      hasCustomThemes: true,
      hasVipSupport: true,
      hasFamilyBudget: true,
      dashboard: true,
      newLaunch: true,
      history: true,
      hasGoals: true,
      hasWishlist: true,
      hasPiggyBank: true,
      hasDebts: true,
      hasCreditCards: true,
      hasCalendar: true,
      hasLimits: true,
      hasFixedExpenses: true,
      hasInvestments: true,
      hasIncomeSources: true,
      hasImport: true,
      hasCategories: true,
      hasSettings: true,
    },
  },
  plus: {
    id: 'plus',
    name: '🏆 Plano Anual',
    price: '12x R$ 20,90',
    period: '/mês',
    description: '🔥 MELHOR OFERTA! Economize R$ 48 por ano - Apenas R$ 250,80/ano',
    popular: true,
    features: {
      maxCategories: -1, // unlimited
      maxGoals: -1, // unlimited
      hasReports: true,
      hasWhatsAppAlerts: true,
      hasPrioritySupport: true,
      hasMultipleAccounts: true,
      hasUnlimitedGoals: true,
      hasAutomations: true,
      hasCloudBackup: true,
      hasCustomThemes: true,
      hasVipSupport: true,
      hasFamilyBudget: true,
      dashboard: true,
      newLaunch: true,
      history: true,
      hasGoals: true,
      hasWishlist: true,
      hasPiggyBank: true,
      hasDebts: true,
      hasCreditCards: true,
      hasCalendar: true,
      hasLimits: true,
      hasFixedExpenses: true,
      hasInvestments: true,
      hasIncomeSources: true,
      hasImport: true,
      hasCategories: true,
      hasSettings: true,
    },
  },
};


