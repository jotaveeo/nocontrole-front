
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { usePlan } from '@/contexts/PlanContext';
import { useFinanceExtendedContext } from '@/contexts/FinanceExtendedContext';

export const PlanUsageStats: React.FC = () => {
  const { currentPlan, features } = usePlan();
  const { categories, transactions } = useFinanceExtendedContext();

  const categoryCount = categories.length;
  const categoryLimit = features.maxCategories;

  const getCategoryUsagePercentage = () => {
    if (categoryLimit === -1) return 0;
    return Math.min((categoryCount / categoryLimit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Uso do Plano</span>
          <Badge variant="outline" className="capitalize">
            {currentPlan}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Categorias */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Categorias</span>
            <span className={`text-sm ${getUsageColor(getCategoryUsagePercentage())}`}>
              {categoryCount}{categoryLimit !== -1 ? `/${categoryLimit}` : ' (ilimitado)'}
            </span>
          </div>
          {categoryLimit !== -1 && (
            <Progress 
              value={getCategoryUsagePercentage()} 
              className="h-2"
            />
          )}
        </div>

        {/* Transações (exemplo) */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Transações este mês</span>
            <span className="text-sm text-muted-foreground">
              {transactions.length} (ilimitado)
            </span>
          </div>
        </div>

        {/* Features disponíveis */}
        <div className="pt-2 border-t">
          <span className="text-sm font-medium mb-2 block">Recursos Disponíveis</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-1 ${features.hasReports ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${features.hasReports ? 'bg-green-500' : 'bg-gray-300'}`} />
              Relatórios
            </div>
            <div className={`flex items-center gap-1 ${features.hasWhatsAppAlerts ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${features.hasWhatsAppAlerts ? 'bg-green-500' : 'bg-gray-300'}`} />
              Alertas WhatsApp
            </div>
            <div className={`flex items-center gap-1 ${features.hasMultipleAccounts ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${features.hasMultipleAccounts ? 'bg-green-500' : 'bg-gray-300'}`} />
              Múltiplas Contas
            </div>
            <div className={`flex items-center gap-1 ${features.hasCloudBackup ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${features.hasCloudBackup ? 'bg-green-500' : 'bg-gray-300'}`} />
              Backup Nuvem
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
