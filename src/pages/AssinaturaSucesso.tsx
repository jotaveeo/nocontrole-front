import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AssinaturaSucesso = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Assinatura realizada com sucesso!</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Obrigado por confiar no NoControle!<br />
          Seu acesso premium está liberado.
        </p>
        <Button size="lg" className="w-full bg-primary hover:bg-primary/90" asChild>
          <Link to="/dashboard">
            Ir para o Dashboard
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Em caso de dúvidas, entre em contato com o suporte.
        </div>
      </div>
    </div>
  );
};

export default AssinaturaSucesso;
