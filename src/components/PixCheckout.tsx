/**
 * Componente de Checkout PIX Personalizado
 * Exibe QR Code e Pix Copia e Cola sem redirecionar para Mercado Pago
 */

import { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { MERCADOPAGO_CONFIG } from '@/config/mercadopago';
import { useMercadoPagoSDK } from '@/hooks/useMercadoPagoSDK';

interface PixCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  planName: string;
}

interface PixPaymentData {
  paymentId: string; // ID do pagamento no Mercado Pago
  status: string; // "pending", "approved", "rejected"
  amount: number; // Valor em reais (10.00)
  qrCode: string; // Código PIX Copia e Cola
  qrCodeBase64: string; // Imagem QR Code em base64
  ticketUrl: string; // URL do ticket no Mercado Pago (backup)
  expiresAt: string; // Data de expiração ISO
  validityDays: number; // Dias de validade (30)
}

export function PixCheckout({ isOpen, onClose, amount, planName }: PixCheckoutProps) {
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [checkingPayment, setCheckingPayment] = useState(false);
  const { toast } = useToast();
  const { isReady: sdkReady, deviceId, error: sdkError } = useMercadoPagoSDK();

  // Criar pagamento PIX ao abrir o modal
  useEffect(() => {
    if (isOpen && !pixData && sdkReady) {
      createPixPayment();
    }
  }, [isOpen, sdkReady]);

  // Countdown timer
  useEffect(() => {
    if (!pixData?.expiresAt) return;

    const interval = setInterval(() => {
      const expiration = new Date(pixData.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = expiration - now;

      if (diff <= 0) {
        setTimeRemaining('Expirado');
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [pixData?.expiresAt]);

  // Verificar status do pagamento automaticamente
  useEffect(() => {
    if (!isOpen || !pixData?.paymentId) return;

    const checkInterval = setInterval(async () => {
      await checkPaymentStatus();
    }, 5000); // Verifica a cada 5 segundos

    return () => clearInterval(checkInterval);
  }, [isOpen, pixData?.paymentId]);

  const createPixPayment = async () => {
    setLoading(true);
    try {
      // Enviar dados necessários para criar o pagamento PIX
      const response = await apiClient.post(MERCADOPAGO_CONFIG.pixEndpoint, {
        amount: amount,
        description: `${planName} - NoControle`,
        planType: 'pix',
        deviceId: deviceId, // Device ID para prevenção de fraude
      });

      if (response.success && response.data) {
        setPixData({
          paymentId: response.data.paymentId,
          status: response.data.status || 'pending',
          amount: response.data.amount,
          qrCode: response.data.qrCode,
          qrCodeBase64: response.data.qrCodeBase64,
          ticketUrl: response.data.ticketUrl,
          expiresAt: response.data.expiresAt,
          validityDays: response.data.validityDays || 30,
        });
      } else {
        throw new Error('Erro ao criar pagamento PIX');
      }
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      toast({
        title: 'Erro ao gerar PIX',
        description: 'Não foi possível gerar o código PIX. Tente novamente.',
        variant: 'destructive',
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!pixData?.paymentId || checkingPayment) return;

    setCheckingPayment(true);
    try {
      const response = await apiClient.get(
        `${MERCADOPAGO_CONFIG.pixStatusEndpoint}/${pixData.paymentId}`
      );

      if (response.success && response.data?.status === 'approved') {
        toast({
          title: '✅ Pagamento Confirmado!',
          description: 'Seu plano foi ativado com sucesso.',
        });
        onClose();
        // Redirecionar ou recarregar página
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setCheckingPayment(false);
    }
  };

  const handleCopyPixCode = async () => {
    if (!pixData?.qrCode) return;

    try {
      await navigator.clipboard.writeText(pixData.qrCode);
      setCopied(true);
      toast({
        title: 'Código copiado!',
        description: 'Cole no seu app de pagamentos para pagar',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o código',
        variant: 'destructive',
      });
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            💳 Pagamento via PIX
          </DialogTitle>
          <DialogDescription>
            {planName} - {formatAmount(amount)}
          </DialogDescription>
        </DialogHeader>

        {!sdkReady ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Inicializando Mercado Pago...</p>
            {sdkError && (
              <p className="text-sm text-red-500 mt-2">Erro: {sdkError}</p>
            )}
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Gerando código PIX...</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Device ID: {deviceId}</p>
          </div>
        ) : pixData ? (
          <div className="space-y-6">
            {/* Timer */}
            <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Expira em: {timeRemaining}
              </span>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                Escaneie o QR Code com seu app de pagamentos
              </p>
              <div className="bg-white p-4 rounded-lg shadow-md">
                {pixData.qrCodeBase64 ? (
                  <img
                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                    alt="QR Code PIX"
                    className="w-64 h-64"
                  />
                ) : pixData.qrCode ? (
                  <img
                    src={pixData.qrCode}
                    alt="QR Code PIX"
                    className="w-64 h-64"
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-400">QR Code não disponível</p>
                  </div>
                )}
              </div>
            </div>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                  ou
                </span>
              </div>
            </div>

            {/* Pix Copia e Cola */}
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Copie e cole o código no seu app de pagamentos
              </p>
              <div className="relative">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-mono break-all text-gray-700 dark:text-gray-300">
                    {pixData.qrCode}
                  </p>
                </div>
                <Button
                  onClick={handleCopyPixCode}
                  className="w-full mt-3"
                  variant={copied ? 'default' : 'outline'}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar Código PIX
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Instruções */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-yellow-900 dark:text-yellow-200">
                  <p className="font-semibold">Importante:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Válido até {new Date(pixData.expiresAt).toLocaleString('pt-BR')}</li>
                    <li>Após o pagamento, seu acesso será liberado automaticamente</li>
                    <li>O plano tem validade de {pixData.validityDays} dias</li>
                    <li>Você receberá confirmação por email</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Verificação Manual */}
            <Button
              onClick={checkPaymentStatus}
              variant="ghost"
              className="w-full"
              disabled={checkingPayment}
            >
              {checkingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando pagamento...
                </>
              ) : (
                'Já paguei - Verificar agora'
              )}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
