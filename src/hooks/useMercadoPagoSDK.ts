/**
 * Hook para gerenciar MercadoPago SDK V2
 * Inicializa o SDK via NPM, obtém Device ID e fornece métodos para pagamento
 * Documentação: https://www.mercadopago.com.br/developers/pt/docs/sdks-library/client-side/javascript
 * 
 * ✅ Requisitos do Teste de Qualidade MercadoPago:
 * 1. Instalação via NPM: @mercadopago/sdk-js
 * 2. Inicialização com Public Key e locale
 * 3. Device ID gerado automaticamente pelo SDK
 * 4. advancedFraudPrevention habilitado
 */

import { useEffect, useState, useCallback } from 'react';
import { loadMercadoPago } from '@mercadopago/sdk-js';
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

  // Função para gerar Device ID de fallback baseado no navegador
  const generateFallbackDeviceId = useCallback((): string => {
    try {
      const nav = window.navigator;
      const screen = window.screen;
      
      // Coletar informações do navegador
      const components = [
        nav.userAgent,
        nav.language,
        screen.colorDepth,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        !!window.sessionStorage,
        !!window.localStorage,
      ];
      
      // Gerar um hash simples
      const str = components.join('|');
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      
      const deviceId = 'fallback_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
      logger.info('🔧 Device ID de fallback gerado:', deviceId);
      return deviceId;
    } catch (err) {
      logger.error('❌ Erro ao gerar fallback:', err);
      return 'fallback_' + Date.now().toString(36);
    }
  }, []);

  // Função para obter Device Fingerprint dos cookies
  const getDeviceFingerprint = useCallback((): string | null => {
    try {
      // Método 1: Tentar pegar de todos os cookies do MercadoPago
      const cookies = document.cookie.split(';');
      logger.debug('🍪 Cookies disponíveis:', cookies.length);
      
      // Tentar diferentes nomes de cookie
      const possibleCookieNames = ['_mp_device_id', '_device_id', 'mp_device_id', '_mpcid'];
      
      for (const cookieName of possibleCookieNames) {
        const deviceCookie = cookies.find(c => c.trim().startsWith(cookieName + '='));
        if (deviceCookie) {
          const deviceValue = deviceCookie.split('=')[1];
          logger.info(`✅ Device ID encontrado no cookie ${cookieName}:`, deviceValue);
          return deviceValue;
        }
      }
      
      // Método 2: Verificar se há algum cookie do MercadoPago
      const mpCookies = cookies.filter(c => c.toLowerCase().includes('mp') || c.toLowerCase().includes('mercado'));
      if (mpCookies.length > 0) {
        logger.debug('🔍 Cookies do MercadoPago encontrados:', mpCookies);
      }
      
      logger.warn('⚠️ Device ID ainda não gerado nos cookies');
      return null;
    } catch (err) {
      logger.error('❌ Erro ao obter device fingerprint:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeMercadoPago = async () => {
      try {
        logger.info('🚀 Carregando MercadoPago SDK via NPM...');

        // Verificar se a Public Key está configurada
        const publicKey = MERCADOPAGO_CONFIG.publicKey;
        if (!publicKey || publicKey.includes('YOUR-PUBLIC-KEY')) {
          logger.error('❌ Public Key do Mercado Pago não configurada');
          logger.info('💡 Configure VITE_MERCADOPAGO_PUBLIC_KEY no arquivo .env');
          setError('Chave pública não configurada');
          return;
        }

        // ✅ REQUISITO 1: Carregar SDK via NPM
        await loadMercadoPago();
        logger.info('✅ SDK carregado via @mercadopago/sdk-js');

        // Verificar se o SDK foi carregado corretamente
        if (typeof window.MercadoPago === 'undefined') {
          logger.error('❌ MercadoPago SDK não foi carregado após loadMercadoPago()');
          setError('Falha ao carregar SDK do Mercado Pago');
          return;
        }

        logger.info('🔑 Inicializando Mercado Pago SDK V2...');
        logger.debug('📍 Public Key:', publicKey.substring(0, 20) + '...');

        // ✅ REQUISITO 2: Inicializar com Public Key e configurações
        // ✅ REQUISITO 3: advancedFraudPrevention = true (gera Device ID automaticamente)
        const mercadopago = new window.MercadoPago(publicKey, {
          locale: 'pt-BR', // Define idioma dos placeholders e mensagens
          advancedFraudPrevention: true, // ⚠️ CRÍTICO: Habilita Device ID automático
        });

        setMp(mercadopago);

        logger.info('✅ MercadoPago SDK V2 inicializado com sucesso');
        logger.debug('🛡️ advancedFraudPrevention: HABILITADO (Device ID automático)');
        logger.debug('🌎 Locale: pt-BR');
        
        setIsReady(true);

        // Aguardar Device ID ser gerado (até 3 tentativas)
        let attempts = 0;
        const maxAttempts = 6;
        const checkDeviceId = () => {
          attempts++;
          const fingerprint = getDeviceFingerprint();
          
          if (fingerprint) {
            setDeviceId(fingerprint);
            logger.info('✅ Device ID capturado:', fingerprint);
          } else if (attempts < maxAttempts) {
            logger.debug(`⏳ Device ID sendo gerado... (tentativa ${attempts}/${maxAttempts})`);
            setDeviceId('generating');
            setTimeout(checkDeviceId, 1000);
          } else {
            // Após todas as tentativas, gerar um Device ID de fallback
            logger.warn('⚠️ Device ID do MercadoPago não foi gerado após 6 tentativas');
            logger.info('🔧 Gerando Device ID de fallback baseado no navegador');
            const fallbackId = generateFallbackDeviceId();
            setDeviceId(fallbackId);
          }
        };
        
        // Primeira tentativa após 1 segundo
        setTimeout(checkDeviceId, 1000);

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
