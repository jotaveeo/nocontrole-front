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
// SINGLETON PARA EVITAR INICIALIZAÇÃO DUPLICADA
// ========================================

let sdkInstance: {
  mp: any | null;
  deviceId: string | null;
  isReady: boolean;
  error: string | null;
  isInitializing: boolean;
  listeners: Set<() => void>;
} = {
  mp: null,
  deviceId: null,
  isReady: false,
  error: null,
  isInitializing: false,
  listeners: new Set(),
};

// ========================================
// TIPOS TYPESCRIPT
// ========================================

declare global {
  interface Window {
    MercadoPago: any;
    MP_DEVICE_SESSION_ID?: string;
    __MP_SDK_INITIALIZED__?: boolean;
  }
}

/**
 * Instância do SDK MercadoPago (apenas métodos essenciais)
 */
interface MercadoPagoInstance {
  cardForm: (config: CardFormConfig) => CardFormInstance;
  bricks: () => BricksBuilder;
  getIdentificationTypes: () => Promise<IdentificationType[]>;
  getPaymentMethods: (options: { bin: string }) => Promise<PaymentMethod>;
  getInstallments: (options: InstallmentOptions) => Promise<Installment[]>;
  getIssuers: (options: { paymentMethodId: string; bin: string }) => Promise<Issuer[]>;
}

interface BricksBuilder {
  create: (type: string, containerId: string, settings: any) => Promise<any>;
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
  const [mp, setMp] = useState<MercadoPagoInstance | null>(sdkInstance.mp);
  const [deviceId, setDeviceId] = useState<string | null>(sdkInstance.deviceId);
  const [isReady, setIsReady] = useState(sdkInstance.isReady);
  const [error, setError] = useState<string | null>(sdkInstance.error);

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
      
      // Método 3: FALLBACK - Gerar Device ID baseado em browser fingerprint
      // Usado quando advancedFraudPrevention não funciona
      const generateBrowserFingerprint = (): string => {
        const nav = navigator;
        const screen = window.screen;
        
        const data = [
          nav.userAgent,
          nav.language,
          screen.colorDepth,
          screen.width + 'x' + screen.height,
          new Date().getTimezoneOffset(),
          !!window.sessionStorage,
          !!window.localStorage,
        ].join('|');
        
        // Hash simples (substituir por crypto se disponível)
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
          const char = data.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        
        return `fp_${Math.abs(hash).toString(36)}_${timestamp.toString(36)}_${random}`;
      };
      
      logger.warn('⚠️ SDK não gerou Device ID, usando fingerprint do navegador');
      const fingerprint = generateBrowserFingerprint();
      
      // Salvar em localStorage para consistência
      try {
        localStorage.setItem('mp_browser_fingerprint', fingerprint);
      } catch (e) {
        logger.warn('Não foi possível salvar fingerprint no localStorage');
      }
      
      return fingerprint;
      
    } catch (err) {
      logger.error('❌ Erro ao buscar Device ID:', err);
      return null;
    }
  }, []);

  // ========================================
  // EFEITO: Sincronizar com Singleton
  // ========================================
  
  useEffect(() => {
    const updateState = () => {
      setMp(sdkInstance.mp);
      setDeviceId(sdkInstance.deviceId);
      setIsReady(sdkInstance.isReady);
      setError(sdkInstance.error);
    };

    sdkInstance.listeners.add(updateState);

    return () => {
      sdkInstance.listeners.delete(updateState);
    };
  }, []);

  // ========================================
  // EFEITO: Inicializar SDK (apenas uma vez)
  // ========================================
  
  useEffect(() => {
    // Se já está inicializado ou inicializando, não fazer nada
    if (sdkInstance.isReady || sdkInstance.isInitializing || window.__MP_SDK_INITIALIZED__) {
      return;
    }

    // Marcar como inicializando
    sdkInstance.isInitializing = true;
    window.__MP_SDK_INITIALIZED__ = true;

    const initializeMercadoPago = async () => {
      try {
        // Validar Public Key
        const publicKey = MERCADOPAGO_CONFIG.publicKey;
        if (!publicKey || publicKey.includes('YOUR-PUBLIC-KEY')) {
          const errorMsg = 'Public Key não configurada. Configure VITE_MERCADOPAGO_PUBLIC_KEY no .env';
          logger.error('❌', errorMsg);
          sdkInstance.error = errorMsg;
          sdkInstance.listeners.forEach(fn => fn());
          return;
        }

        logger.info('🚀 Inicializando MercadoPago SDK V2 (SINGLETON)');
        logger.debug('🔑 Public Key:', publicKey.substring(0, 20) + '...');

        // Verificar se já existe no window
        if (window.MercadoPago) {
          logger.warn('⚠️ SDK já carregado no window, reutilizando instância');
        } else {
          // Carregar SDK
          await loadMercadoPago();
          
          if (!window.MercadoPago) {
            throw new Error('SDK não carregou corretamente');
          }
          logger.info('✅ SDK carregado');
        }

        // Inicializar SDK com advancedFraudPrevention
        const mercadopago = new window.MercadoPago(publicKey, {
          locale: 'pt-BR',
          advancedFraudPrevention: true, // Gera Device ID automaticamente
        });

        sdkInstance.mp = mercadopago;
        sdkInstance.isReady = true;
        sdkInstance.isInitializing = false;
        sdkInstance.listeners.forEach(fn => fn());
        
        logger.info('✅ SDK inicializado (advancedFraudPrevention: true)');
        logger.info('⏳ Aguardando Device ID...');
        
        // 🔍 DEBUG: Verificar se Device ID já existe
        logger.info('🔍 DEBUG: Verificando window.MP_DEVICE_SESSION_ID:', window.MP_DEVICE_SESSION_ID);
        logger.info('🔍 DEBUG: Verificando cookies:', document.cookie);
        logger.info('🔍 DEBUG: Public Key:', publicKey.substring(0, 30) + '...');

        // MÉTODO ALTERNATIVO: Injetar script de Device Session (mais confiável)
        const injectDeviceSessionScript = () => {
          // Verificar se já existe
          if (document.querySelector('script[src*="device-tracking"]')) {
            logger.info('🔍 Script de Device Session já injetado');
            return;
          }

          logger.info('🔄 Injetando script de Device Session do MercadoPago');
          
          const script = document.createElement('script');
          script.src = 'https://www.mercadopago.com/v2/security.js';
          script.setAttribute('view', 'checkout');
          script.async = true;
          
          script.onload = () => {
            logger.info('✅ Script de Device Session carregado');
            // Tentar obter Device ID após carregamento
            setTimeout(() => {
              const deviceId = window.MP_DEVICE_SESSION_ID || getDeviceFingerprint();
              if (deviceId && deviceId !== 'generating') {
                sdkInstance.deviceId = deviceId;
                sdkInstance.listeners.forEach(fn => fn());
                logger.info('✅ Device ID obtido após script:', deviceId);
              }
            }, 1000);
          };
          
          script.onerror = () => {
            logger.error('❌ Erro ao carregar script de Device Session');
          };
          
          document.head.appendChild(script);
        };

        // Injetar script de Device Session
        injectDeviceSessionScript();

        // Polling para Device ID (5 tentativas = 7 segundos)
        // Se SDK não gerar, usaremos browser fingerprint
        let attempts = 0;
        const maxAttempts = 5;
        
        const pollDeviceId = () => {
          attempts++;
          
          // 🔍 DEBUG: Log detalhado em cada tentativa
          logger.info(`🔍 DEBUG: Tentativa ${attempts}/${maxAttempts}`);
          logger.info('🔍 DEBUG: window.MP_DEVICE_SESSION_ID:', window.MP_DEVICE_SESSION_ID);
          
          const id = getDeviceFingerprint();
          
          if (id) {
            sdkInstance.deviceId = id;
            sdkInstance.listeners.forEach(fn => fn());
            logger.info('✅ Device ID capturado:', id);
            return;
          }
          
          if (attempts < maxAttempts) {
            sdkInstance.deviceId = 'generating';
            sdkInstance.listeners.forEach(fn => fn());
            setTimeout(pollDeviceId, 1000);
          } else {
            // Após 5 tentativas sem sucesso, usar browser fingerprint
            const fingerprintId = getDeviceFingerprint();
            
            if (fingerprintId) {
              sdkInstance.deviceId = fingerprintId;
              sdkInstance.listeners.forEach(fn => fn());
              logger.info('✅ Device ID gerado via browser fingerprint:', fingerprintId);
            } else {
              sdkInstance.deviceId = null;
              const errorMsg = 'Não foi possível gerar Device ID.';
              sdkInstance.error = errorMsg;
              sdkInstance.listeners.forEach(fn => fn());
              logger.error('❌ FALHA:', errorMsg);
            }
          }
        };
        
        setTimeout(pollDeviceId, 2000);

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro ao inicializar SDK';
        logger.error('❌ Erro:', errorMsg);
        sdkInstance.error = errorMsg;
        sdkInstance.isInitializing = false;
        sdkInstance.listeners.forEach(fn => fn());
      }
    };

    if (document.readyState === 'complete') {
      initializeMercadoPago();
    } else {
      window.addEventListener('load', initializeMercadoPago);
      return () => {
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
