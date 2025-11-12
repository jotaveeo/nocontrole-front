/**
 * Utilitários para MercadoPago SDK V2
 * Funções helper para trabalhar com o SDK
 */

import { Logger } from '@/utils/logger';

const logger = new Logger('MercadoPago Utils');

/**
 * Obtém o Device ID dos cookies do MercadoPago
 * Usado para prevenção de fraudes
 */
export function getDeviceId(): string | null {
  try {
    const cookies = document.cookie.split(';');
    const deviceCookie = cookies.find(c => c.trim().startsWith('_mp_device_id='));
    
    if (deviceCookie) {
      const deviceId = deviceCookie.split('=')[1];
      return deviceId;
    }
    
    return null;
  } catch (error) {
    logger.error('Erro ao obter Device ID:', error);
    return null;
  }
}

/**
 * Valida número de cartão usando algoritmo de Luhn
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d+$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Valida CVV
 */
export function validateCVV(cvv: string, cardBrand?: string): boolean {
  if (cardBrand === 'amex') {
    return /^\d{4}$/.test(cvv);
  }
  return /^\d{3}$/.test(cvv);
}

/**
 * Valida data de expiração (MM/AA)
 */
export function validateExpirationDate(expiration: string): boolean {
  const [month, year] = expiration.split('/');
  
  if (!month || !year) {
    return false;
  }

  const monthNum = parseInt(month, 10);
  const yearNum = parseInt('20' + year, 10);

  if (monthNum < 1 || monthNum > 12) {
    return false;
  }

  const now = new Date();
  const expirationDate = new Date(yearNum, monthNum - 1);

  return expirationDate > now;
}

/**
 * Formata número de cartão (adiciona espaços)
 */
export function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g);
  return chunks ? chunks.join(' ') : cleaned;
}

/**
 * Formata data de expiração (MM/AA)
 */
export function formatExpirationDate(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length >= 2) {
    return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
  }
  
  return cleaned;
}

/**
 * Identifica bandeira do cartão pelo BIN (primeiros 6 dígitos)
 */
export function identifyCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  const bin = cleaned.substring(0, 6);

  const patterns: Record<string, RegExp> = {
    visa: /^4/,
    mastercard: /^(5[1-5]|2[2-7])/,
    amex: /^3[47]/,
    elo: /^(4011|4312|4389|4514|4576|5041|5066|5090|6277|6362|6363|6504|6505|6507|6509|6516|6550)/,
    hipercard: /^(3841|6062)/,
    diners: /^(30|36|38)/,
    discover: /^(6011|65)/,
  };

  for (const [brand, pattern] of Object.entries(patterns)) {
    if (pattern.test(bin)) {
      return brand;
    }
  }

  return 'unknown';
}

/**
 * Mascara número de cartão para exibição segura
 * Exemplo: 1234 **** **** 5678
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  const first4 = cleaned.substring(0, 4);
  const last4 = cleaned.substring(cleaned.length - 4);
  return `${first4} **** **** ${last4}`;
}

/**
 * Valida se o SDK do MercadoPago está disponível
 */
export function isMercadoPagoSDKLoaded(): boolean {
  return typeof window !== 'undefined' && typeof window.MercadoPago !== 'undefined';
}

/**
 * Aguarda o SDK do MercadoPago carregar
 */
export function waitForMercadoPagoSDK(timeout = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isMercadoPagoSDKLoaded()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isMercadoPagoSDKLoaded()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        logger.error('Timeout ao aguardar SDK do MercadoPago');
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Tipos de documento aceitos pelo MercadoPago
 */
export const DOCUMENT_TYPES = {
  BR: [
    { id: 'CPF', name: 'CPF', minLength: 11, maxLength: 11 },
    { id: 'CNPJ', name: 'CNPJ', minLength: 14, maxLength: 14 },
  ],
} as const;

/**
 * Valida CPF
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned[10])) return false;

  return true;
}

/**
 * Formata CPF (000.000.000-00)
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Valida CNPJ
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14 || /^(\d)\1+$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  let pos = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleaned[12])) return false;

  sum = 0;
  pos = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleaned[13])) return false;

  return true;
}

/**
 * Formata CNPJ (00.000.000/0000-00)
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}
