/**
 * Hook para gerenciar plano do usuário
 * Verifica limites, status do plano, usage, etc
 */

import { useState, useEffect, useCallback } from 'react';
import { getUserPlan } from '@/lib/api';
import { UserPlan, PlanType, PlanLimits } from '@/types/plans';
import { Logger } from '@/utils/logger';

const logger = new Logger('usePlan');

interface UsePlanReturn {
  plan: UserPlan;
  loading: boolean;
  error: string | null;
  isPremium: boolean;
  isFree: boolean;
  canUseFeature: (feature: string) => boolean;
  hasReachedLimit: (feature: 'transactions' | 'cards' | 'goals') => { reached: boolean; current: number; limit: number };
  refreshPlan: () => Promise<void>;
  upgrade: () => void;
}

// Plano FREE padrão para fallback
const DEFAULT_FREE_PLAN: UserPlan = {
  user_id: 0,
  plan: {
    type: 'free',
    status: 'active',
    name: 'Plano FREE',
    start_date: null,
    end_date: null,
    days_remaining: null,
    auto_renew: false,
  },
  limits: {
    transactions_per_month: 10,
    cards: 2,
    goals: 3,
    categories: 10,
    fixed_expenses: 5,
    investments: 3,
    debts: 3,
    wishlist_items: 5,
    advanced_reports: false,
    export_data: false,
    ai_insights: false,
    auto_categorization: false,
    multi_currency: false,
    priority_support: false,
  },
  usage: {
    month_year: new Date().toISOString().slice(0, 7),
    transactions: 0,
    cards: 0,
    goals: 0,
    reports: 0,
    exports: 0,
  },
  trial: {
    used: false,
    available: true,
  },
};

export function usePlan(): UsePlanReturn {
  const [plan, setPlan] = useState<UserPlan>(DEFAULT_FREE_PLAN);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar plano do usuário
  const fetchPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUserPlan();

      if (response.success && response.data) {
        setPlan(response.data);
        logger.info('✅ Plano carregado:', response.data);
      } else {
        throw new Error('Erro ao carregar plano');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      logger.error('❌ Erro ao buscar plano:', err);
      setError(errorMessage);
      
      // Fallback: assumir plano FREE
      setPlan(DEFAULT_FREE_PLAN);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar plano ao montar
  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  // Verificar se é premium
  const isPremium = plan?.plan.type !== 'free';
  const isFree = plan?.plan.type === 'free';

  // Verificar se pode usar feature
  const canUseFeature = useCallback(
    (feature: string): boolean => {
      if (!plan) return false;
      if (isPremium) return true; // Premium tem acesso a tudo

      // Plano FREE - verificar limites
      if (plan.limits === 'unlimited') return true;

      const limits = plan.limits as PlanLimits;
      
      // Features booleanas
      if (feature === 'advanced_reports') return limits.advanced_reports;
      if (feature === 'export_data') return limits.export_data;
      if (feature === 'ai_insights') return limits.ai_insights;
      if (feature === 'auto_categorization') return limits.auto_categorization;
      if (feature === 'multi_currency') return limits.multi_currency;
      if (feature === 'priority_support') return limits.priority_support;

      return true; // Features básicas liberadas
    },
    [plan, isPremium]
  );

  // Verificar se atingiu limite
  const hasReachedLimit = useCallback(
    (feature: 'transactions' | 'cards' | 'goals'): { reached: boolean; current: number; limit: number } => {
      if (isPremium) {
        return { reached: false, current: 0, limit: Infinity };
      }

      if (plan.limits === 'unlimited') {
        return { reached: false, current: 0, limit: Infinity };
      }

      const limits = plan.limits as PlanLimits;
      const usage = plan.usage;

      if (!usage) {
        return { reached: false, current: 0, limit: 0 };
      }

      // Verificar limites de quantidade
      if (feature === 'transactions') {
        const current = usage.transactions;
        const limit = limits.transactions_per_month;
        return { reached: current >= limit, current, limit };
      }

      if (feature === 'cards') {
        const current = usage.cards;
        const limit = limits.cards;
        return { reached: current >= limit, current, limit };
      }

      if (feature === 'goals') {
        const current = usage.goals;
        const limit = limits.goals;
        return { reached: current >= limit, current, limit };
      }

      if (feature === 'reports') {
        const current = usage.reports;
        const limit = 0; // FREE não tem relatórios
        return { reached: !limits.advanced_reports, current, limit };
      }

      if (feature === 'exports') {
        const current = usage.exports;
        const limit = 0; // FREE não tem exportação
        return { reached: !limits.export_data, current, limit };
      }

      return { reached: false, current: 0, limit: 0 };
    },
    [plan, isPremium]
  );

  // Redirecionar para página de upgrade
  const upgrade = useCallback(() => {
    window.location.href = '/';
  }, []);

  return {
    plan,
    loading,
    error,
    isPremium,
    isFree,
    canUseFeature,
    hasReachedLimit,
    refreshPlan: fetchPlan,
    upgrade,
  };
}
