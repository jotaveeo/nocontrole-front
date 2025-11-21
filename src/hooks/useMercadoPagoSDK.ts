/**
 * 🔐 MercadoPago SDK V2 - Hook Simplificado
 * 
 * @description Hook React para gerenciar o SDK do MercadoPago de forma segura
 * 
 * @features
 * - ✅ Inicialização automática via NPM (@mercadopago/sdk-js)
 * - ✅ Device ID gerado pelo SDK (advancedFraudPrevention)
 * - ✅ Validação de Public Key
 * - ✅ Logs detalhados para debug
 * - ✅ Retry automático (10 tentativas)
 * - ❌ SEM fallback - Falha se Device ID não for gerado
 * 
 * @usage
 * ```tsx
 * const { mp, deviceId, isReady, error } = useMercadoPagoSDK();
 * 
 * if (!isReady) return <Loading />;
 * if (error) return <Error message={error} />;
 * if (!deviceId) return <Error message="Device ID não gerado" />;
 * 
 * // Usar mp.cardForm() para criar formulário seguro
 * const cardForm = mp.cardForm({ ... });
 * ```
 * 
 * @see https://www.mercadopago.com.br/developers/pt/docs/sdks-library/client-side/javascript
 */

import { useEffect, useState, useCallback } from 'react';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import { MERCADOPAGO_CONFIG } from '@/config/mercadopago';
import { Logger } from '@/utils/logger';

const logger = new Logger('MercadoPago SDK');

// ========================================
// TIPOS TYPESCRIPT
// ========================================

declare global {
  interface Window {
    MercadoPago: any;
    MP_DEVICE_SESSION_ID?: string;
  }
}

/**
 * Instância do SDK MercadoPago (apenas métodos essenciais)
 */
interface MercadoPagoInstance {
  cardForm: (config: CardFormConfig) => CardFormInstance;
  getIdentificationTypes: () => Promise<IdentificationType[]>;
  getPaymentMethods: (options: { bin: string }) => Promise<PaymentMethod>;
  getInstallments: (options: InstallmentOptions) => Promise<Installment[]>;
  getIssuers: (options: { paymentMethodId: string; bin: string }) => Promise<Issuer[]>;
}

interface CardFormConfig {
  amount: string;
  iframe: boolean;
  form: {
    id: string;
    cardNumber: FieldConfig;
    expirationDate: FieldConfig;
    securityCode: FieldConfig;
    cardholderName: FieldConfig;
    issuer: FieldConfig;
    installments: FieldConfig;
    identificationType: FieldConfig;
    identificationNumber: FieldConfig;
    cardholderEmail: FieldConfig;
  };
  callbacks: CardFormCallbacks;
}

interface FieldConfig {
  id: string;
  placeholder?: string;
  style?: Record<string, string>;
}

interface CardFormCallbacks {
  onFormMounted?: (error: any) => void;
  onSubmit?: (event: any) => void;
  onFetching?: (resource: string) => void;
  onValidityChange?: (error: any, field: string) => void;
  onError?: (error: any) => void;
}

interface CardFormInstance {
  mount: () => void;
  unmount: () => void;
  createCardToken: () => Promise<{ token: string }>;
  getCardFormData: () => CardFormData;
}

interface CardFormData {
  installments: number;
  paymentMethodId: string;
  issuerId: string;
  cardholderEmail: string;
  identificationType: string;
  identificationNumber: string;
}

interface IdentificationType {
  id: string;
  name: string;
  type: string;
  min_length: number;
  max_length: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  payment_type_id: string;
  thumbnail: string;
}

interface InstallmentOptions {
  amount: string;
  locale: string;
  bin: string;
  processingMode: string;
}

interface Installment {
  installments: number;
  installment_rate: number;
  discount_rate: number;
  labels: string[];
  min_allowed_amount: number;
  max_allowed_amount: number;
  recommended_message: string;
  installment_amount: number;
  total_amount: number;
}

interface Issuer {
  id: string;
  name: string;
  thumbnail: string;
}

/**
 * Retorno do hook useMercadoPagoSDK
 */
interface UseMercadoPagoSDKReturn {
  /** Instância do SDK MercadoPago (null se não carregado) */
  mp: MercadoPagoInstance | null;
  
  /** Device ID gerado pelo SDK (null se não gerado, 'generating' se em processo) */
  deviceId: string | null;
  
  /** SDK está pronto para uso */
  isReady: boolean;
  
  /** Mensagem de erro (se houver) */
  error: string | null;
  
  /** Public Key configurada */
  publicKey: string;
  
  /** Função para buscar Device ID manualmente */
  getDeviceFingerprint: () => string | null;
}

// ========================================
// HOOK PRINCIPAL
// ========================================

/**
 * Hook para gerenciar o SDK MercadoPago V2
 * 
 * @returns {UseMercadoPagoSDKReturn} Objeto com mp, deviceId, isReady, error, publicKey
 */
export function useMercadoPagoSDK(): UseMercadoPagoSDKReturn {
  const [mp, setMp] = useState<MercadoPagoInstance | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // FUNÇÃO: Buscar Device ID
  // ========================================
  
  /**
   * Busca o Device ID gerado pelo SDK do MercadoPago
   * 
   * @returns Device ID (string) ou null se não gerado
   */
  const getDeviceFingerprint = useCallback((): string | null => {
    try {
      // Método 1: Buscar em window.MP_DEVICE_SESSION_ID (padrão do SDK)
      const deviceIdFromWindow = window.MP_DEVICE_SESSION_ID;
      
      if (deviceIdFromWindow) {
        logger.debug('✅ Device ID encontrado em window.MP_DEVICE_SESSION_ID:', deviceIdFromWindow);
        return deviceIdFromWindow;
      }
      
      // Método 2: Buscar em cookies (fallback)
      const cookies = document.cookie.split(';');
      const cookieNames = ['_mp_device_id', 'mp_device_id', '_mpcid'];
      
      for (const name of cookieNames) {
        const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
        if (cookie) {
          const value = cookie.split('=')[1]?.trim();
          if (value) {
            logger.debug(`✅ Device ID encontrado no cookie ${name}:`, value);
            return value;
          }
        }
      }
      
      return null;
    } catch (err) {
      logger.error('❌ Erro ao buscar Device ID:', err);
      return null;
    }
  }, []);

  // ========================================
  // EFEITO: Inicializar SDK
  // ========================================
  
  useEffect(() => {
    let isMounted = true;
    
    const initializeMercadoPago = async () => {
      try {
        // Validar Public Key
        const publicKey = MERCADOPAGO_CONFIG.publicKey;
        if (!publicKey || publicKey.includes('YOUR-PUBLIC-KEY')) {
          const errorMsg = 'Public Key não configurada. Configure VITE_MERCADOPAGO_PUBLIC_KEY no .env';
          logger.error('❌', errorMsg);
          setError(errorMsg);
          return;
        }

        logger.info('🚀 Inicializando MercadoPago SDK V2');
        logger.debug('🔑 Public Key:', publicKey.substring(0, 20) + '...');

        // Carregar SDK
        await loadMercadoPago();
        
        if (!window.MercadoPago) {
          throw new Error('SDK não carregou corretamente');
        }

        logger.info('✅ SDK carregado');

        // Inicializar SDK com advancedFraudPrevention
        const mercadopago = new window.MercadoPago(publicKey, {
          locale: 'pt-BR',
          advancedFraudPrevention: true, // Gera Device ID automaticamente
        });

        if (!isMounted) return;
        
        setMp(mercadopago);
        setIsReady(true);
        
        logger.info('✅ SDK inicializado (advancedFraudPrevention: true)');
        logger.info('⏳ Aguardando Device ID...');

        // Polling para Device ID (10 tentativas = 12 segundos)
        let attempts = 0;
        const maxAttempts = 10;
        
        const pollDeviceId = () => {
          if (!isMounted) return;
          
          attempts++;
          const id = getDeviceFingerprint();
          
          if (id) {
            setDeviceId(id);
            logger.info('✅ Device ID capturado:', id);
            return;
          }
          
          if (attempts < maxAttempts) {
            setDeviceId('generating');
            setTimeout(pollDeviceId, 1000);
          } else {
            setDeviceId(null);
            const errorMsg = 'Device ID não foi gerado. Recarregue a página.';
            setError(errorMsg);
            logger.error('❌ FALHA:', errorMsg);
            logger.error('💡 Causas possíveis: Public Key inválida, bloqueador de anúncios, problemas de rede');
          }
        };
        
        setTimeout(pollDeviceId, 2000);

      } catch (err) {
        if (!isMounted) return;
        
        const errorMsg = err instanceof Error ? err.message : 'Erro ao inicializar SDK';
        logger.error('❌ Erro:', errorMsg);
        setError(errorMsg);
      }
    };

    if (document.readyState === 'complete') {
      initializeMercadoPago();
    } else {
      window.addEventListener('load', initializeMercadoPago);
      return () => {
        isMounted = false;
        window.removeEventListener('load', initializeMercadoPago);
      };
    }
  }, [getDeviceFingerprint]);

  // ========================================
  // RETORNO DO HOOK
  // ========================================
  
  return {
    mp,
    deviceId,
    isReady,
    error,
    publicKey: MERCADOPAGO_CONFIG.publicKey,
    getDeviceFingerprint,
  };
}

// ========================================
// HOOKS AUXILIARES
// ========================================

/**
 * Hook simplificado para obter apenas o Device ID
 * 
 * @returns Device ID ou null
 * 
 * @example
 * ```tsx
 * const deviceId = useMercadoPagoDeviceId();
 * 
 * if (!deviceId) {
 *   return <p>Carregando sistema de segurança...</p>;
 * }
 * ```
 */
export function useMercadoPagoDeviceId(): string | null {
  const { deviceId } = useMercadoPagoSDK();
  return deviceId;
}
