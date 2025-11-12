import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const AssinaturaSucesso = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Simular verificação da sessão (você pode chamar o backend aqui se quiser)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Confirmando seu pagamento...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Aguarde enquanto processamos sua assinatura
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-lg w-full">
        {/* Ícone de Sucesso */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
          🎉 Assinatura Confirmada!
        </h1>

        {/* Descrição */}
        <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-6">
          Obrigado por confiar no <span className="font-bold text-primary">NoControle</span>!
          <br />
          Seu acesso premium está <span className="font-semibold">liberado</span>.
        </p>

        {/* Informações Adicionais */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-medium mb-1">📧 Confirmação enviada!</p>
              <p>
                Você receberá um email com os detalhes da sua assinatura e nota fiscal.
              </p>
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            ✨ Agora você tem acesso a:
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Relatórios avançados ilimitados
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Todas as funcionalidades premium
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Suporte prioritário
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              7 dias grátis para testar
            </li>
          </ul>
        </div>

        {/* Botão Principal */}
        <Button 
          size="lg" 
          className="w-full bg-primary hover:bg-primary/90 mb-4" 
          asChild
        >
          <Link to="/dashboard">
            Começar a usar agora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>

        {/* Info do Session ID (debug) */}
        {sessionId && (
          <div className="text-center text-xs text-gray-400 mb-4">
            ID da sessão: {sessionId.substring(0, 20)}...
          </div>
        )}

        {/* Suporte */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Dúvidas? <Link to="/configuracoes" className="text-primary hover:underline">Entre em contato com o suporte</Link>
        </div>
      </div>
    </div>
  );
};

export default AssinaturaSucesso;
