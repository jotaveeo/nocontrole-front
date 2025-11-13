// Tipos de plano do sistema
export type PlanType = "free" | "pix" | "monthly" | "annual";
export type PlanStatus =
  | "active"
  | "expired"
  | "cancelled"
  | "trial"
  | "pending";

// Interface para limites do plano FREE
export interface PlanLimits {
  transactions_per_month: number;
  cards: number;
  goals: number;
  categories: number;
  fixed_expenses: number;
  investments: number;
  debts: number;
  wishlist_items: number;
  advanced_reports: boolean;
  export_data: boolean;
  ai_insights: boolean;
  auto_categorization: boolean;
  multi_currency: boolean;
  priority_support: boolean;
}

// Interface para uso atual do plano
export interface PlanUsage {
  month_year: string; // "2025-11"
  transactions: number;
  cards: number;
  goals: number;
  reports: number;
  exports: number;
}

// Interface para informações de trial
export interface TrialInfo {
  used: boolean;
  available: boolean;
  start_date?: string;
  end_date?: string;
}

// Interface para informações completas do plano
export interface UserPlan {
  user_id: number;
  plan: {
    type: PlanType;
    status: PlanStatus;
    name: string;
    start_date: string | null;
    end_date: string | null;
    days_remaining: number | null;
    auto_renew: boolean;
  };
  limits?: PlanLimits | "unlimited";
  usage?: PlanUsage;
  trial: TrialInfo;
}

// Interface para assinatura
export interface Subscription {
  id: number;
  plan_type: PlanType;
  status: PlanStatus;
  payment_method: "pix" | "credit_card";
  amount: number;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}

// Tipos antigos (manter compatibilidade)
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
    id: "free",
    name: "🎯 Teste Grátis",
    price: "GRÁTIS",
    period: "7 dias",
    description: "🚀 Experimente TODAS as funcionalidades PREMIUM por 7 dias!",
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
  pix: {
    id: "pix",
    name: "💳 Plano PIX",
    price: "R$ 19,90",
    period: "/mês",
    description: "💰 Pagamento via PIX - Ativação imediata!",
    features: {
      maxCategories: -1,
      maxGoals: -1,
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
  monthly: {
    id: "monthly",
    name: "💎 Plano Mensal",
    price: "R$ 24,90",
    period: "/mês",
    description: "✨ Controle total das suas finanças - Cancele quando quiser!",
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
  annual: {
    id: "annual",
    name: "🏆 Plano Anual",
    price: "12x R$ 20,90",
    period: "/mês",
    description:
      "🔥 MELHOR OFERTA! Economize R$ 48 por ano - Apenas R$ 250,80/ano",
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
