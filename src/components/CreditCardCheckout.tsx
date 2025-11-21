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
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 gap-0">
        {/* Header Moderno */}
        <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 p-6 border-b">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Pagamento Seguro
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {planName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatAmount(amount)}
              </p>
            </div>
          </div>
          
          {/* Badge PCI Compliant */}
          <div className="flex items-center gap-2 mt-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-green-200 dark:border-green-800">
            <Lock className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              Criptografia de ponta a ponta • PCI DSS Level 1
            </span>
          </div>
        </div>

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
          <div className="p-6">
            <form id="mp-card-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              {/* Seção: Dados do Cartão */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
                    Dados do Cartão
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
                </div>

                {/* Número do Cartão */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Número do Cartão
                  </Label>
                  <div 
                    id="mp-card-number" 
                    className="h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all"
                  ></div>
                </div>

                {/* Validade e CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Validade
                    </Label>
                    <div 
                      id="mp-expiration-date" 
                      className="h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all"
                    ></div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      CVV
                    </Label>
                    <div 
                      id="mp-security-code" 
                      className="h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all"
                    ></div>
                  </div>
                </div>
              </div>

              {/* Seção: Dados Pessoais */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
                    Seus Dados
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
                </div>

                {/* Nome */}
                <div>
                  <Label htmlFor="form-checkout__cardholderName" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Nome no Cartão
                  </Label>
                  <input
                    type="text"
                    id="form-checkout__cardholderName"
                    className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    placeholder="Nome como está no cartão"
                  />
                </div>

                {/* E-mail */}
                <div>
                  <Label htmlFor="form-checkout__cardholderEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    E-mail
                  </Label>
                  <input
                    type="email"
                    id="form-checkout__cardholderEmail"
                    className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    placeholder="seu@email.com"
                  />
                </div>

                {/* CPF/CNPJ */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="form-checkout__identificationType" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Tipo
                    </Label>
                    <select
                      id="form-checkout__identificationType"
                      className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    >
                      <option value="CPF">CPF</option>
                      <option value="CNPJ">CNPJ</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="form-checkout__identificationNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Documento
                    </Label>
                    <input
                      type="text"
                      id="form-checkout__identificationNumber"
                      className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Pagamento */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2">
                    Opções
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Banco */}
                  <div>
                    <Label htmlFor="form-checkout__issuer" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Banco
                    </Label>
                    <select
                      id="form-checkout__issuer"
                      className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    ></select>
                  </div>

                  {/* Parcelas */}
                  <div>
                    <Label htmlFor="form-checkout__installments" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Parcelas
                    </Label>
                    <select
                      id="form-checkout__installments"
                      className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    ></select>
                  </div>
                </div>
              </div>

              {/* Garantias */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900">
                <div className="flex gap-3">
                  <div className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      Pagamento 100% Seguro
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <span>Criptografia de ponta a ponta</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <span>Certificado PCI DSS Level 1</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <span>Processado pelo MercadoPago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de Pagamento */}
              <Button
                type="submit"
                className="w-full h-14 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                size="lg"
                disabled={!formReady || processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Pagar {formatAmount(amount)}
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                Transação protegida • Cancele quando quiser
              </p>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
