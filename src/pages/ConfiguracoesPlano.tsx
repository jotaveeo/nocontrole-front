/**
 * Página de Configurações do Plano
 * Permite visualizar, gerenciar e fazer upgrade do plano
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { usePlan } from '@/hooks/usePlan';
import { BackButton } from '@/components/BackButton';
import { PlanUsageStats } from '@/components/PlanUsageStats';
import { UpgradeModal } from '@/components/UpgradeModal';
import { cancelPlan } from '@/lib/api';
import {
  Crown,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Shield,
  Zap,
  Sparkles,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConfiguracoesPlano() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { plan, loading, isPremium, isFree, upgrade } = usePlan();
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const getPlanIcon = () => {
    switch (plan.plan.type) {
      case 'pix':
        return <Zap className="w-5 h-5 text-cyan-600" />;
      case 'monthly':
        return <Crown className="w-5 h-5 text-purple-600" />;
      case 'annual':
        return <Sparkles className="w-5 h-5 text-amber-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
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

  const getStatusBadge = () => {
    switch (plan.plan.status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'trial':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
            <Sparkles className="w-3 h-3 mr-1" />
            Período de Teste
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Expirado
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-orange-100 text-orange-700 border-orange-300">
            <AlertCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Pendente
          </Badge>
        );
    }
  };

  const getPlanName = () => {
    switch (plan.plan.type) {
      case 'free':
        return 'Plano FREE';
      case 'pix':
        return 'Plano PIX - 30 Dias';
      case 'monthly':
        return 'Plano Premium Mensal';
      case 'annual':
        return 'Plano Premium Anual';
      default:
        return 'Plano Desconhecido';
    }
  };

  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      const response = await cancelPlan('Cancelamento solicitado pelo usuário');

      if (response.success) {
        toast({
          title: "Assinatura cancelada",
          description: "Sua assinatura foi cancelada com sucesso. Você ainda pode usar o plano até o final do período.",
        });
        // Recarregar a página ou refetch do plano
        window.location.reload();
      } else {
        throw new Error(response.error || 'Erro ao cancelar assinatura');
      }
    } catch (error) {
      toast({
        title: "Erro ao cancelar",
        description: error instanceof Error ? error.message : "Não foi possível cancelar sua assinatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
      setShowCancelDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <BackButton />
        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="h-8 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <BackButton />

      <div className="mt-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="w-8 h-8 text-primary" />
            Gerenciar Plano
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize e gerencie sua assinatura
          </p>
        </div>

        {/* Grid Principal */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Coluna Principal - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card do Plano Atual */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center',
                      plan.plan.type === 'free' ? 'bg-gray-100' :
                      plan.plan.type === 'pix' ? 'bg-cyan-100' :
                      plan.plan.type === 'monthly' ? 'bg-purple-100' :
                      'bg-amber-100'
                    )}>
                      {getPlanIcon()}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getPlanName()}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {isFree ? 'Versão gratuita com recursos limitados' : 'Acesso completo a todos os recursos'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant="outline" className={cn('font-semibold', getPlanBadgeColor())}>
                      {plan.plan.type === 'free' && '🆓 FREE'}
                      {plan.plan.type === 'pix' && '⚡ PIX'}
                      {plan.plan.type === 'monthly' && '💎 MENSAL'}
                      {plan.plan.type === 'annual' && '🏆 ANUAL'}
                    </Badge>
                    {getStatusBadge()}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Informações de Data */}
                {isPremium && (
                  <>
                    <Separator />
                    <div className="grid gap-4 md:grid-cols-2">
                      {plan.plan.start_date && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Data de Início</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(plan.plan.start_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      )}

                      {plan.plan.end_date && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">
                              {plan.plan.type === 'pix' ? 'Expira em' : 
                               plan.plan.auto_renew ? 'Renova em' : 'Válido até'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(plan.plan.end_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      )}

                      {plan.plan.days_remaining !== null && plan.plan.days_remaining >= 0 && (
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Dias Restantes</p>
                            <p className={cn(
                              'text-sm font-semibold',
                              plan.plan.days_remaining <= 7 ? 'text-red-600' :
                              plan.plan.days_remaining <= 15 ? 'text-yellow-600' :
                              'text-green-600'
                            )}>
                              {plan.plan.days_remaining} dias
                            </p>
                          </div>
                        </div>
                      )}

                      {plan.plan.auto_renew && (
                        <div className="flex items-start gap-3">
                          <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Renovação Automática</p>
                            <p className="text-sm text-green-600 font-semibold">
                              ✓ Ativada
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Ações */}
                <Separator />
                <div className="flex flex-wrap gap-3">
                  {isFree && (
                    <Button
                      onClick={() => setShowUpgradeModal(true)}
                      className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Fazer Upgrade
                    </Button>
                  )}

                  {isPremium && plan.plan.status === 'active' && (
                    <>
                      {plan.plan.type === 'pix' && (
                        <Button
                          onClick={() => setShowUpgradeModal(true)}
                          variant="outline"
                          className="flex-1"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Renovar Plano
                        </Button>
                      )}

                      {(plan.plan.type === 'monthly' || plan.plan.type === 'annual') && (
                        <Button
                          onClick={() => setShowUpgradeModal(true)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Mudar de Plano
                        </Button>
                      )}

                      {plan.plan.auto_renew && (
                        <Button
                          onClick={() => setShowCancelDialog(true)}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancelar Assinatura
                        </Button>
                      )}
                    </>
                  )}

                  {isPremium && plan.plan.status === 'expired' && (
                    <Button
                      onClick={() => setShowUpgradeModal(true)}
                      className="flex-1"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Renovar Agora
                    </Button>
                  )}
                </div>

                {/* Aviso de Expiração */}
                {isPremium && plan.plan.days_remaining !== null && 
                 plan.plan.days_remaining <= 7 && plan.plan.days_remaining > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">
                        Seu plano expira em breve!
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Renove agora para continuar aproveitando todos os recursos Premium.
                      </p>
                    </div>
                  </div>
                )}

                {/* Aviso de Expirado */}
                {isPremium && plan.plan.status === 'expired' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        Seu plano expirou
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        Renove agora para recuperar o acesso aos recursos Premium.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Benefícios do Plano */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {isFree ? 'Recursos do Plano FREE' : 'Seus Benefícios Premium'}
                </CardTitle>
                <CardDescription>
                  {isFree 
                    ? 'Confira o que você tem acesso no plano gratuito'
                    : 'Todos os recursos incluídos no seu plano'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {isFree ? (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>10 transações por mês</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>2 cartões de crédito</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>3 metas financeiras</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <XCircle className="w-4 h-4 text-gray-400" />
                        <span>Relatórios avançados</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <XCircle className="w-4 h-4 text-gray-400" />
                        <span>Categorização automática com IA</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <XCircle className="w-4 h-4 text-gray-400" />
                        <span>Exportação de dados</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Transações ilimitadas</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Cartões ilimitados</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Metas ilimitadas</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Relatórios avançados</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Categorização automática com IA</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Exportação de dados (CSV/Excel)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Suporte prioritário</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Insights com inteligência artificial</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - 1/3 */}
          <div className="space-y-6">
            {/* Card de Uso */}
            <PlanUsageStats
              showUpgradeButton={isFree}
              onUpgrade={() => setShowUpgradeModal(true)}
            />

            {/* Links Úteis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Links Úteis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/configuracoes')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Configurações Gerais
                </Button>
                {isFree && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-primary"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Ver Todos os Planos
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Upgrade */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        highlightPlan={plan.plan.type === 'pix' ? 'monthly' : 'annual'}
      />

      {/* Dialog de Cancelamento */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Cancelar Assinatura?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Tem certeza que deseja cancelar sua assinatura Premium?
              </p>
              <p className="font-semibold">
                Você ainda poderá usar o plano até {plan.plan.end_date && new Date(plan.plan.end_date).toLocaleDateString('pt-BR')}.
              </p>
              <p className="text-sm">
                Após o cancelamento, sua assinatura não será renovada automaticamente e você voltará para o plano FREE.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={canceling}>
              Manter Assinatura
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={canceling}
              className="bg-destructive hover:bg-destructive/90"
            >
              {canceling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Confirmar Cancelamento'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
