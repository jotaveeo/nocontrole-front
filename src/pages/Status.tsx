import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";

const status = {
  online: true,
  lastChecked: "2025-06-01 14:32",
  incidents: [],
};

const Status = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto p-4 lg:p-8 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-2 flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-primary" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-base text-muted-foreground">
          <div className="flex items-center gap-2">
            {status.online ? (
              <>
                <CheckCircle className="text-green-600 w-5 h-5" />
                <span className="font-semibold text-green-700">
                  Operando normalmente
                </span>
              </>
            ) : (
              <>
                <XCircle className="text-red-600 w-5 h-5" />
                <span className="font-semibold text-red-700">
                  Instabilidade detectada
                </span>
              </>
            )}
          </div>
          <div className="text-sm">
            Última verificação: {status.lastChecked}
          </div>
          {status.incidents.length > 0 ? (
            <div className="space-y-2">
              <AlertTriangle className="text-yellow-600 w-4 h-4 inline" />{" "}
              <span className="font-semibold text-yellow-700">
                Incidentes recentes:
              </span>
              <ul className="list-disc ml-6">
                {status.incidents.map((inc, i) => (
                  <li key={i}>{inc}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-green-700 text-sm">
              Nenhum incidente registrado.
            </div>
          )}
          <div className="pt-4">
            <a
              href="https://status.seusite.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Ver monitoramento em tempo real
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Status;
