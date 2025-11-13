/**
 * Componente de Estatísticas de Uso do Plano
 * Mostra uso atual vs limites do plano FREE
 * Usado no Dashboard e página de Configurações
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Receipt, 
  Target, 
  Crown, 
  TrendingUp, 
  FileText,
  Download,
  Sparkles
} from 'lucide-react';
import { usePlan } from '@/hooks/usePlan';
import { cn } from '@/lib/utils';
import type { PlanLimits } from '@/types/plans';

interface PlanUsageStatsProps {
  showUpgradeButton?: boolean;
  onUpgrade?: () => void;
  variant?: 'default' | 'compact';
}

export function PlanUsageStats({ 
  showUpgradeButton = true, 
  onUpgrade,
  variant = 'default' 
}: PlanUsageStatsProps) {
  const { plan, loading, isPremium, isFree, hasReachedLimit, upgrade } = usePlan();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getUsageColor = (current: number, limit: number) => {
    if (limit === -1) return 'text-green-600'; // Ilimitado
    const percentage = (current / limit) * 100;
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressValue = (current: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getPlanBadgeColor = () => {
    switch (plan.plan.type) {
      case 'free':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'pix':
        return 'bg-cyan-100 text-cyan-700 border-cyan-300';
      case 'monthly':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'annual':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getLimitValue = (key: keyof PlanLimits): number => {
    if (plan.limits === 'unlimited') return -1;
    return plan.limits?.[key] as number ?? -1;
  };

  const getBooleanLimit = (key: keyof PlanLimits): boolean => {
    if (plan.limits === 'unlimited') return true;
    return plan.limits?.[key] as boolean ?? false;
  };

  const usageItems = [
    {
      icon: Receipt,
      label: 'Transações',
      current: plan.usage?.transactions ?? 0,
      limit: getLimitValue('transactions_per_month'),
      color: 'text-blue-600',
    },
    {
      icon: CreditCard,
      label: 'Cartões',
      current: plan.usage?.cards ?? 0,
      limit: getLimitValue('cards'),
      color: 'text-purple-600',
    },
    {
      icon: Target,
      label: 'Metas',
      current: plan.usage?.goals ?? 0,
      limit: getLimitValue('goals'),
      color: 'text-green-600',
    },
  ];

  const premiumFeatures = [
    {
      icon: TrendingUp,
      label: 'Relatórios Avançados',
      available: getBooleanLimit('advanced_reports'),
    },
    {
      icon: FileText,
      label: 'Categorização IA',
      available: getBooleanLimit('auto_categorization'),
    },
    {
      icon: Download,
      label: 'Exportar Dados',
      available: getBooleanLimit('export_data'),
    },
    {
      icon: Sparkles,
      label: 'Prioridade',
      available: getBooleanLimit('priority_support'),
    },
  ];

  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        {usageItems.map((item) => {
          const Icon = item.icon;
          const isUnlimited = item.limit === -1;
          const percentage = getProgressValue(item.current, item.limit);
          
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn('w-4 h-4', item.color)} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className={cn(
                  'text-sm font-semibold',
                  getUsageColor(item.current, item.limit)
                )}>
                  {item.current}{!isUnlimited && `/${item.limit}`}
                  {isUnlimited && ' ∞'}
                </span>
              </div>
              {!isUnlimited && (
                <Progress value={percentage} className="h-1.5" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Uso do Plano
            </CardTitle>
            <CardDescription className="mt-1">
              {isPremium ? 'Você tem acesso Premium!' : 'Monitore seus limites'}
            </CardDescription>
          </div>
          <Badge variant="outline" className={cn('font-semibold', getPlanBadgeColor())}>
            {plan.plan.type === 'free' && '🆓 FREE'}
            {plan.plan.type === 'pix' && '⚡ PIX'}
            {plan.plan.type === 'monthly' && '💎 MENSAL'}
            {plan.plan.type === 'annual' && '🏆 ANUAL'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Uso de Recursos */}
        <div className="space-y-4">
          {usageItems.map((item) => {
            const Icon = item.icon;
            const isUnlimited = item.limit === -1;
            const percentage = getProgressValue(item.current, item.limit);
            const limitInfo = hasReachedLimit(
              item.label.toLowerCase() as 'transactions' | 'cards' | 'goals'
            );
            
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('w-4 h-4', item.color)} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className={cn(
                    'text-sm font-semibold',
                    getUsageColor(item.current, item.limit)
                  )}>
                    {item.current}{!isUnlimited && `/${item.limit}`}
                    {isUnlimited && ' (ilimitado)'}
                  </span>
                </div>
                
                {!isUnlimited && (
                  <>
                    <Progress 
                      value={percentage} 
                      className={cn(
                        'h-2',
                        limitInfo.reached && 'bg-red-100'
                      )} 
                    />
                    {limitInfo.reached && (
                      <p className="text-xs text-red-600 mt-1">
                        ⚠️ Limite atingido! Faça upgrade para continuar.
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Features Premium (apenas para FREE) */}
        {isFree && (
          <div className="pt-4 border-t space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Desbloqueie com Premium:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {premiumFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.label}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <Icon className="w-3 h-3" />
                    <span>{feature.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Features Ativas (Premium) */}
        {isPremium && (
          <div className="pt-4 border-t space-y-3">
            <p className="text-sm font-medium text-green-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Recursos Premium Ativos:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {premiumFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.label}
                    className="flex items-center gap-2 text-xs text-green-700"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <Icon className="w-3 h-3" />
                    <span>{feature.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botão de Upgrade */}
        {showUpgradeButton && isFree && (
          <Button
            onClick={onUpgrade || upgrade}
            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
          >
            <Crown className="w-4 h-4 mr-2" />
            Fazer Upgrade Agora
          </Button>
        )}

        {/* Info de Status Premium */}
        {isPremium && plan.plan.end_date && (
          <div className="text-xs text-center text-muted-foreground pt-2 border-t">
            {plan.plan.status === 'trial' && '🎉 Período de teste ativo'}
            {plan.plan.status === 'active' && plan.plan.type === 'pix' && (
              <>Expira em: {new Date(plan.plan.end_date).toLocaleDateString('pt-BR')}</>
            )}
            {plan.plan.status === 'active' && plan.plan.type === 'monthly' && (
              <>Renova em: {new Date(plan.plan.end_date).toLocaleDateString('pt-BR')}</>
            )}
            {plan.plan.status === 'active' && plan.plan.type === 'annual' && (
              <>Válido até: {new Date(plan.plan.end_date).toLocaleDateString('pt-BR')}</>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
