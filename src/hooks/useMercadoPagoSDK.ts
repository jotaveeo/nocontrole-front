/**
 * Hook para gerenciar MercadoPago SDK V2
 * Inicializa o SDK, obtém Device ID e fornece métodos para pagamento
 * Documentação: https://www.mercadopago.com.br/developers/pt/docs/sdks-library/client-side/javascript
 */

import { useEffect, useState, useCallback } from 'react';
import { MERCADOPAGO_CONFIG } from '@/config/mercadopago';
import { Logger } from '@/utils/logger';

const logger = new Logger('MercadoPago SDK');

// Tipos do MercadoPago SDK V2
declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface MercadoPagoInstance {
  // Core methods
  getIdentificationTypes: () => Promise<any[]>;
  getPaymentMethods: (options: { bin: string }) => Promise<any>;
  getInstallments: (options: any) => Promise<any>;
  getIssuers: (options: { paymentMethodId: string; bin: string }) => Promise<any>;
  
  // Card Form
  cardForm: (config: any) => any;
  
  // Bricks (UI Components)
  bricks: () => any;
  
  // Utils
  fields: {
    create: (type: string, options: any) => any;
  };
}

interface UseMercadoPagoSDKReturn {
  mp: MercadoPagoInstance | null;
  deviceId: string | null;
  isReady: boolean;
  error: string | null;
  publicKey: string;
  getDeviceFingerprint: () => string | null;
}

export function useMercadoPagoSDK(): UseMercadoPagoSDKReturn {
  const [mp, setMp] = useState<MercadoPagoInstance | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para obter Device Fingerprint dos cookies
  const getDeviceFingerprint = useCallback((): string | null => {
    try {
      const cookies = document.cookie.split(';');
      const deviceCookie = cookies.find(c => c.trim().startsWith('_mp_device_id='));
      
      if (deviceCookie) {
        const deviceValue = deviceCookie.split('=')[1];
        logger.debug('🔍 Device ID encontrado:', deviceValue);
        return deviceValue;
      }
      
      logger.warn('⚠️ Device ID ainda não gerado');
      return null;
    } catch (err) {
      logger.error('❌ Erro ao obter device fingerprint:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeMercadoPago = async () => {
      try {
        // Verificar se o SDK foi carregado
        if (typeof window.MercadoPago === 'undefined') {
          logger.error('❌ MercadoPago SDK não foi carregado');
          logger.info('💡 Verifique se o script está no index.html: <script src="https://sdk.mercadopago.com/js/v2"></script>');
          setError('SDK do Mercado Pago não disponível');
          return;
        }

        // Verificar se a Public Key está configurada
        const publicKey = MERCADOPAGO_CONFIG.publicKey;
        if (!publicKey || publicKey.includes('YOUR-PUBLIC-KEY')) {
          logger.error('❌ Public Key do Mercado Pago não configurada');
          logger.info('💡 Configure VITE_MERCADOPAGO_PUBLIC_KEY no arquivo .env');
          setError('Chave pública não configurada');
          return;
        }

        logger.info('🔑 Inicializando Mercado Pago SDK V2...');
        logger.debug('📍 Public Key:', publicKey.substring(0, 20) + '...');

        // Inicializar o SDK com configurações
        const mercadopago = new window.MercadoPago(publicKey, {
          locale: 'pt-BR',
          advancedFraudPrevention: true, // Habilita prevenção avançada de fraude
        });

        setMp(mercadopago);

        // Aguardar um pouco para o SDK gerar o Device ID
        setTimeout(() => {
          const fingerprint = getDeviceFingerprint();
          if (fingerprint) {
            setDeviceId(fingerprint);
            logger.info('✅ Device ID capturado:', fingerprint);
          } else {
            setDeviceId('generating'); // Ainda sendo gerado
            logger.debug('⏳ Device ID sendo gerado...');
          }
        }, 1000);

        logger.info('✅ MercadoPago SDK V2 inicializado com sucesso');
        logger.debug('🛡️ Prevenção de fraude: ATIVA');
        logger.debug('🌎 Locale: pt-BR');
        
        setIsReady(true);

      } catch (err) {
        logger.error('❌ Erro ao inicializar MercadoPago SDK:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    };

    // Aguardar carregamento completo do DOM
    if (document.readyState === 'complete') {
      initializeMercadoPago();
    } else {
      window.addEventListener('load', initializeMercadoPago);
      return () => window.removeEventListener('load', initializeMercadoPago);
    }
  }, [getDeviceFingerprint]);

  return {
    mp,
    deviceId,
    isReady,
    error,
    publicKey: MERCADOPAGO_CONFIG.publicKey,
    getDeviceFingerprint,
  };
}

/**
 * Hook para obter o Device ID do MercadoPago
 * Usado para enviar junto com requisições de pagamento
 */
export function useMercadoPagoDeviceId(): string | null {
  const { deviceId, isReady } = useMercadoPagoSDK();
  
  useEffect(() => {
    if (isReady && deviceId) {
      logger.info('✅ Device ID pronto para uso');
    }
  }, [isReady, deviceId]);

  return deviceId;
}
