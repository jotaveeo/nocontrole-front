/**
 * Exemplo de Payment Brick (Método Recomendado MercadoPago)
 * 
 * Payment Brick é o método mais moderno e recomendado pelo MercadoPago.
 * Ele resolve automaticamente:
 * - Layout e UX
 * - Validação de campos
 * - Tokenização
 * - Device ID
 * - PCI Compliance
 * 
 * Documentação: https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/payment-brick
 */

import { useEffect, useRef, useState } from 'react';
import { useMercadoPagoSDK } from '@/hooks/useMercadoPagoSDK';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Logger } from '@/utils/logger';
import { apiClient } from '@/lib/api';

const logger = new Logger('Payment Brick');

interface PaymentBrickExampleProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  planName: string;
  planType: 'monthly' | 'annual';
}

/**
 * Exemplo de uso do Payment Brick
 * Este é o método MAIS RECOMENDADO pelo MercadoPago
 */
export function PaymentBrickExample({
  isOpen,
  onClose,
  amount,
  planName,
  planType,
}: PaymentBrickExampleProps) {
  const { mp, isReady, deviceId } = useMercadoPagoSDK();
  const [isProcessing, setIsProcessing] = useState(false);
  const brickRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !isReady || !mp) return;

    const initializePaymentBrick = async () => {
      try {
        logger.info('🧱 Inicializando Payment Brick...');

        // Limpar brick anterior se existir
        if (brickRef.current) {
          await brickRef.current.unmount();
        }

        // Criar o Brick Builder
        const bricksBuilder = mp.bricks();

        // ✅ Configuração do Payment Brick
        const settings = {
          initialization: {
            amount: amount, // Valor total a ser pago
            payer: {
              email: '', // Usuário preenche no brick
            },
          },
          customization: {
            visual: {
              style: {
                theme: 'default', // 'default' | 'dark' | 'bootstrap' | 'flat'
              },
            },
            paymentMethods: {
              // Habilitar apenas cartão de crédito
              creditCard: 'all', // Aceita todos os cartões
              debitCard: 'none', // Desabilita débito
              ticket: 'none', // Desabilita boleto
              bankTransfer: 'none', // Desabilita transferência
            },
          },
          callbacks: {
            onReady: () => {
              logger.info('✅ Payment Brick carregado e pronto');
            },
            onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
              logger.info('📝 Formulário submetido', { selectedPaymentMethod });
              logger.debug('📦 FormData (já tokenizado):', formData);

              setIsProcessing(true);

              try {
                // ✅ IMPORTANTE: formData já vem com:
                // - token (cartão tokenizado)
                // - Device ID (automático)
                // - Dados do pagador

                // Adicionar informações extras
                const paymentData = {
                  ...formData,
                  planType: planType,
                  planName: planName,
                  statement_descriptor: 'NOCONTROLE',
                  device_id: deviceId, // Garantir que Device ID está presente
                };

                logger.info('🚀 Enviando pagamento ao backend...');
                
                // Enviar ao backend
                const response = await apiClient.post(
                  '/api/mercadopago/payment-brick/process',
                  paymentData
                );

                logger.info('✅ Pagamento processado com sucesso', response.data);

                // Fechar modal e mostrar sucesso
                onClose();
                window.location.href = '/assinatura-sucesso';

                return response.data;
              } catch (error: any) {
                logger.error('❌ Erro ao processar pagamento:', error);
                throw error; // Payment Brick mostra erro automaticamente
              } finally {
                setIsProcessing(false);
              }
            },
            onError: (error: any) => {
              logger.error('❌ Erro no Payment Brick:', error);
              setIsProcessing(false);
            },
          },
        };

        // ✅ Renderizar o Payment Brick
        brickRef.current = await bricksBuilder.create(
          'payment', // Tipo do brick
          'payment-brick-container', // ID do container
          settings
        );

        logger.info('✅ Payment Brick renderizado com sucesso');
      } catch (error) {
        logger.error('❌ Erro ao inicializar Payment Brick:', error);
      }
    };

    initializePaymentBrick();

    // Cleanup
    return () => {
      if (brickRef.current) {
        brickRef.current.unmount().catch(console.error);
      }
    };
  }, [isOpen, isReady, mp, amount, planName, planType, deviceId, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Pagamento - {planName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo do Pedido */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {planName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {planType === 'monthly' ? 'Renovação mensal' : 'Pagamento anual'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  R$ {amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Container do Payment Brick */}
          <div id="payment-brick-container" className="min-h-[400px]">
            {!isReady && (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Carregando formulário seguro...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Informações de Segurança */}
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">Pagamento 100% Seguro</p>
              <p className="text-xs">
                Certificado PCI DSS Level 1. Seus dados nunca passam pelo nosso servidor.
              </p>
            </div>
          </div>

          {/* Botão Cancelar */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 🎯 VANTAGENS DO PAYMENT BRICK:
 * 
 * 1. ✅ Tudo automático:
 *    - Layout responsivo
 *    - Validação de campos
 *    - Detecção de bandeira do cartão
 *    - Cálculo de parcelamento
 *    - Tokenização
 *    - Device ID
 * 
 * 2. ✅ PCI Compliant:
 *    - Dados do cartão nunca chegam ao seu frontend
 *    - Apenas token é enviado ao backend
 * 
 * 3. ✅ UX Otimizada:
 *    - Interface testada e aprovada pelo MercadoPago
 *    - Mensagens de erro em PT-BR
 *    - Loading states automáticos
 * 
 * 4. ✅ Manutenção Zero:
 *    - MercadoPago mantém o componente atualizado
 *    - Novos recursos aparecem automaticamente
 * 
 * 
 * 📚 DOCUMENTAÇÃO COMPLETA:
 * https://www.mercadopago.com.br/developers/pt/docs/checkout-bricks/payment-brick
 */
