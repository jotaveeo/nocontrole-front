/**
 * Hook customizado para gerenciar pagamentos via Mercado Pago
 * Integração com Checkout Pro para assinaturas e PIX personalizado
 */

import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { MERCADOPAGO_CONFIG, type PlanConfig } from '@/config/mercadopago';
import { apiClient } from '@/lib/api';

interface PixResponseData {
  preferenceId: string;
  initPoint: string;
  amount: number;
  validityDays: number;
}

interface SubscriptionResponseData {
  subscriptionId: string;
  planId: string;
  initPoint: string;
  status: string;
  amount: number;
}

interface StatusData {
  active: boolean;
  daysRemaining?: number;
  message: string;
}

interface UseMercadoPagoReturn {
  loading: boolean;
  error: string | null;
  createPayment: (plan: PlanConfig, onPixPayment?: () => void) => Promise<void>;
  checkPixStatus: () => Promise<StatusData | null>;
  checkSubscriptionStatus: () => Promise<StatusData | null>;
}

export function useMercadoPago(): UseMercadoPagoReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Criar pagamento PIX (plano de 30 dias)
   * Agora retorna os dados para exibição no modal personalizado
   */
  const createPixPayment = useCallback(async () => {
    const response = await apiClient.post(
      MERCADOPAGO_CONFIG.pixEndpoint,
      {} // Não precisa enviar body para PIX
    );

    if (!response.success || !response.data) {
      throw new Error('Erro ao criar pagamento PIX');
    }

    return response.data;
  }, []);

  /**
   * Criar assinatura (planos mensal ou anual)
   */
  const createSubscription = useCallback(async (planType: 'monthly' | 'annual') => {
    const response = await apiClient.post(
      MERCADOPAGO_CONFIG.subscriptionEndpoint,
      { planType }
    );

    if (!response.success || !response.data?.initPoint) {
      throw new Error('Erro ao criar assinatura');
    }

    return response.data.initPoint as string;
  }, []);

  /**
   * Criar pagamento baseado no tipo de plano
   * PIX: Abre modal personalizado (onPixPayment callback)
   * Assinaturas: Redireciona para o Checkout Pro
   */
  const createPayment = useCallback(async (plan: PlanConfig, onPixPayment?: () => void) => {
    setLoading(true);
    setError(null);

    try {
      // Validar Public Key
      if (!MERCADOPAGO_CONFIG.publicKey || MERCADOPAGO_CONFIG.publicKey.includes('YOUR-PUBLIC-KEY')) {
        throw new Error('Chave pública do Mercado Pago não configurada');
      }

      // Decidir qual endpoint usar baseado no tipo de plano
      if (plan.planType === 'pix') {
        // Plano PIX - R$ 10,00 (30 dias)
        // Abre modal personalizado ao invés de redirecionar
        if (onPixPayment) {
          onPixPayment();
        } else {
          toast({
            title: 'Gerando PIX...',
            description: 'Preparando seu código PIX',
          });
        }
      } else {
        // Assinatura (mensal ou anual)
        const initPoint = await createSubscription(plan.planType);
        
        toast({
          title: 'Redirecionando para assinatura',
          description: `Plano ${plan.planType === 'monthly' ? 'Mensal' : 'Anual'} - ${plan.displayPrice}`,
        });

        // Aguardar 1 segundo para o usuário ver o toast
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Redirecionar para o Checkout Pro do Mercado Pago
        window.location.href = initPoint;
      }

    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erro ao processar pagamento';
      
      setError(errorMessage);
      
      toast({
        title: 'Erro ao processar pagamento',
        description: errorMessage,
        variant: 'destructive',
      });

      console.error('Erro ao criar pagamento:', err);
    } finally {
      setLoading(false);
    }
  }, [createPixPayment, createSubscription, toast]);

  /**
   * Verificar status do pagamento PIX
   */
  const checkPixStatus = useCallback(async (): Promise<StatusData | null> => {
    try {
      const response = await apiClient.get(
        MERCADOPAGO_CONFIG.pixStatusEndpoint
      );
      
      if (response.success && response.data) {
        return response.data as StatusData;
      }
      
      return null;
    } catch (err) {
      console.error('Erro ao verificar status PIX:', err);
      return null;
    }
  }, []);

  /**
   * Verificar status da assinatura
   */
  const checkSubscriptionStatus = useCallback(async (): Promise<StatusData | null> => {
    try {
      const response = await apiClient.get(
        MERCADOPAGO_CONFIG.subscriptionStatusEndpoint
      );
      
      if (response.success && response.data) {
        return response.data as StatusData;
      }
      
      return null;
    } catch (err) {
      console.error('Erro ao verificar status da assinatura:', err);
      return null;
    }
  }, []);

  return {
    loading,
    error,
    createPayment,
    checkPixStatus,
    checkSubscriptionStatus,
  };
}
