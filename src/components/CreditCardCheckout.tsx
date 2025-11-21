/**
 * Componente de Formulário de Cartão de Crédito
 * Usa Secure Fields do MercadoPago para PCI Compliance
 * Os dados do cartão NUNCA passam pelo nosso servidor
 */

import { useState, useEffect, useRef } from 'react';
import { CreditCard, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMercadoPagoSDK } from '@/hooks/useMercadoPagoSDK';
import { validateCPF, formatCPF } from '@/utils/mercadopago';
import { apiClient } from '@/lib/api';
import { Logger } from '@/utils/logger';

const logger = new Logger('CreditCardForm');

interface CreditCardCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  planName: string;
  planType: 'monthly' | 'annual';
}

interface CardFormInstance {
  mount: () => void;
  unmount: () => void;
  createCardToken: () => Promise<{ token: string }>;
  getCardFormData: () => any;
}

export function CreditCardCheckout({
  isOpen,
  onClose,
  amount,
  planName,
  planType,
}: CreditCardCheckoutProps): JSX.Element {
  const { mp, isReady, deviceId, error: sdkError } = useMercadoPagoSDK();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [formReady, setFormReady] = useState(false);
  
  // Dados do titular
  const [cardholderName, setCardholderName] = useState('');
  const [identificationType, setIdentificationType] = useState('CPF');
  const [identificationNumber, setIdentificationNumber] = useState('');
  const [email, setEmail] = useState('');
  
  // Referências para os Secure Fields
  const cardNumberRef = useRef<HTMLDivElement>(null);
  const expirationDateRef = useRef<HTMLDivElement>(null);
  const securityCodeRef = useRef<HTMLDivElement>(null);
  const cardFormRef = useRef<CardFormInstance | null>(null);

  // Inicializar Card Form com Secure Fields
  useEffect(() => {
    if (!isOpen || !isReady || !mp) return;

    const initializeCardForm = async () => {
      try {
        setLoading(true);
        logger.info('🔐 Inicializando Secure Fields (PCI Compliant)...');

        // ✅ ESTILO DOS SECURE FIELDS (CSS via JS - necessário para iframes)
        const style = {
          color: 'rgb(17, 24, 39)', // gray-900
          fontSize: '16px',
          fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
          fontWeight: '400',
          placeholderColor: 'rgb(156, 163, 175)', // gray-400
          '::placeholder': {
            color: 'rgb(156, 163, 175)',
          },
        };

        // ✅ CONFIGURAÇÃO DO CARD FORM COM SECURE FIELDS
        const cardForm = mp.cardForm({
          amount: amount.toString(),
          iframe: true, // ⚠️ CRÍTICO: Ativa os Secure Fields (iframes isolados)
          form: {
            id: 'mp-card-form',
            cardNumber: {
              id: 'mp-card-number',
              placeholder: 'Número do cartão',
              style: style, // Aplica estilo CSS
            },
            expirationDate: {
              id: 'mp-expiration-date',
              placeholder: 'MM/AA',
              style: style,
            },
            securityCode: {
              id: 'mp-security-code',
              placeholder: 'CVV',
              style: style,
            },
            cardholderName: {
              id: 'form-checkout__cardholderName',
              placeholder: 'Nome impresso no cartão',
            },
            issuer: {
              id: 'form-checkout__issuer',
              placeholder: 'Banco emissor',
            },
            installments: {
              id: 'form-checkout__installments',
              placeholder: 'Parcelas',
            },
            identificationType: {
              id: 'form-checkout__identificationType',
            },
            identificationNumber: {
              id: 'form-checkout__identificationNumber',
              placeholder: 'CPF',
            },
            cardholderEmail: {
              id: 'form-checkout__cardholderEmail',
              placeholder: 'E-mail',
            },
          },
          callbacks: {
            onFormMounted: (error: any) => {
              if (error) {
                logger.error('❌ Erro ao montar Secure Fields:', error);
                toast({
                  title: 'Erro ao carregar formulário seguro',
                  description: 'Verifique sua conexão e tente novamente',
                  variant: 'destructive',
                });
                setLoading(false);
                return;
              }
              logger.info('✅ Secure Fields montados com sucesso (iframes isolados)');
              logger.info('🔒 PCI Compliant: Dados do cartão NÃO passam pelo nosso código');
              setFormReady(true);
              setLoading(false);
            },
            onSubmit: async (event: any) => {
              event.preventDefault();
              await handleSubmit();
            },
            onFetching: (resource: string) => {
              logger.debug('⏳ Buscando:', resource);
            },
            onValidityChange: (error: any, field: string) => {
              if (error) {
                logger.warn(`⚠️ Validação falhou em ${field}:`, error);
              }
            },
            onError: (error: any) => {
              logger.error('❌ Erro no Card Form:', error);
              // Códigos de erro do MercadoPago:
              // 205: parameter cardNumber can not be null/empty
              // 208/209: parameter cardExpiration can not be null/empty
              // 213: parameter docNumber can not be null/empty
              // E01: parameter cardNumber invalid
              const errorMessages: Record<string, string> = {
                '205': 'Digite o número do cartão',
                '208': 'Digite a data de validade',
                '209': 'Digite a data de validade',
                '212': 'Selecione o tipo de documento',
                '213': 'Digite o CPF/CNPJ',
                'E01': 'Número do cartão inválido',
              };
              
              const message = errorMessages[error.code] || error.message || 'Erro ao processar cartão';
              toast({
                title: 'Erro de validação',
                description: message,
                variant: 'destructive',
              });
            },
          },
        });

        cardFormRef.current = cardForm;

      } catch (error) {
        logger.error('❌ Erro ao inicializar Card Form:', error);
        toast({
          title: 'Erro ao inicializar formulário',
          description: 'Por favor, recarregue a página',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    initializeCardForm();

    // Cleanup
    return () => {
      if (cardFormRef.current) {
        try {
          cardFormRef.current.unmount();
        } catch (error) {
          logger.warn('Erro ao desmontar Card Form:', error);
        }
      }
    };
  }, [isOpen, isReady, mp, amount]);

  const handleSubmit = async () => {
    if (!cardFormRef.current) {
      toast({
        title: 'Erro',
        description: 'Formulário não inicializado',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      logger.info('🔐 Tokenizando cartão...');

      // Criar token seguro do cartão (PCI Compliant)
      const { token } = await cardFormRef.current.createCardToken();
      logger.info('✅ Token criado:', token.substring(0, 20) + '...');

      // Obter dados do formulário
      const formData = cardFormRef.current.getCardFormData();
      logger.debug('📋 Dados do formulário:', formData);

      // Verificar Device ID
      if (!deviceId) {
        logger.warn('⚠️ Device ID não disponível - pode afetar aprovação');
      } else {
        logger.info('✅ Device ID:', deviceId);
      }

      // Enviar para o backend (apenas o token, não os dados do cartão)
      const response = await apiClient.post('/api/mercadopago/subscription/create', {
        cardToken: token,
        planType,
        amount,
        installments: formData.installments || 1,
        paymentMethodId: formData.paymentMethodId,
        issuerId: formData.issuerId,
        deviceId: deviceId, // ✅ CRÍTICO: Device ID para antifraude
        statement_descriptor: 'NOCONTROLE', // Aparece na fatura do cartão (máx 22 caracteres)
        items: [
          {
            id: planType === 'monthly' ? 'premium_monthly' : 'premium_annual',
            title: planName,
            description: `Plano Premium ${planType === 'monthly' ? 'Mensal' : 'Anual'} - Sistema de Controle Financeiro NoControle - Acesso completo a todas funcionalidades`,
            category_id: 'digital_services', // Categoria para melhorar aprovação (serviços digitais)
            quantity: 1,
            unit_price: amount,
          }
        ],
        payer: {
          email: formData.cardholderEmail,
          identification: {
            type: formData.identificationType,
            number: formData.identificationNumber,
          },
        },
      });

      if (response.success) {
        toast({
          title: '✅ Pagamento Aprovado!',
          description: 'Seu plano foi ativado com sucesso.',
        });
        
        logger.info('✅ Pagamento aprovado');
        
        // Redirecionar para dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        throw new Error(response.error || 'Erro ao processar pagamento');
      }

    } catch (error) {
      logger.error('❌ Erro ao processar pagamento:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao processar pagamento';

      toast({
        title: 'Erro no Pagamento',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatAmount = (amountInReais: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amountInReais);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pagamento com Cartão de Crédito
          </DialogTitle>
          <DialogDescription>
            {planName} - {formatAmount(amount)}
          </DialogDescription>
        </DialogHeader>

        {sdkError ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Erro: {sdkError}</p>
          </div>
        ) : !isReady || loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {!isReady ? 'Inicializando Mercado Pago...' : 'Carregando formulário seguro...'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Device ID: {deviceId}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Badge PCI Compliance */}
            <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-200">
                🔒 Formulário Seguro - PCI Compliant
              </span>
            </div>

            {/* Formulário */}
            <form id="mp-card-form" className="space-y-4">
              {/* Secure Fields - Campos do Cartão */}
              <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Dados do Cartão (Criptografado)
                </h3>

                {/* Número do Cartão */}
                <div>
                  <Label htmlFor="mp-card-number">Número do Cartão</Label>
                  <div id="mp-card-number" className="mt-1"></div>
                </div>

                {/* Data de Expiração e CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mp-expiration-date">Validade</Label>
                    <div id="mp-expiration-date" className="mt-1"></div>
                  </div>
                  <div>
                    <Label htmlFor="mp-security-code">CVV</Label>
                    <div id="mp-security-code" className="mt-1"></div>
                  </div>
                </div>
              </div>

              {/* Nome do Titular */}
              <div>
                <Label htmlFor="form-checkout__cardholderName">
                  Nome do Titular
                </Label>
                <input
                  type="text"
                  id="form-checkout__cardholderName"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800"
                  placeholder="Nome como está no cartão"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="form-checkout__cardholderEmail">E-mail</Label>
                <input
                  type="email"
                  id="form-checkout__cardholderEmail"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800"
                  placeholder="seu@email.com"
                />
              </div>

              {/* CPF/CNPJ */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="form-checkout__identificationType">Tipo</Label>
                  <select
                    id="form-checkout__identificationType"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800"
                  >
                    <option value="CPF">CPF</option>
                    <option value="CNPJ">CNPJ</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="form-checkout__identificationNumber">Número</Label>
                  <input
                    type="text"
                    id="form-checkout__identificationNumber"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              {/* Banco Emissor */}
              <div>
                <Label htmlFor="form-checkout__issuer">Banco Emissor</Label>
                <select
                  id="form-checkout__issuer"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800"
                ></select>
              </div>

              {/* Parcelas */}
              <div>
                <Label htmlFor="form-checkout__installments">Parcelas</Label>
                <select
                  id="form-checkout__installments"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800"
                ></select>
              </div>

              {/* Informações de Segurança */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm text-blue-900 dark:text-blue-200">
                    <p className="font-semibold">Segurança Garantida:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Seus dados são criptografados de ponta a ponta</li>
                      <li>Certificado PCI DSS Level 1 (máxima segurança)</li>
                      <li>Os dados do cartão nunca passam pelo nosso servidor</li>
                      <li>Processamento seguro pelo Mercado Pago</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botão de Pagamento */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!formReady || processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando Pagamento...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Pagar {formatAmount(amount)} com Segurança
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
