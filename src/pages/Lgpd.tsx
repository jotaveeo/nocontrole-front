import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LGPD = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto p-4 lg:p-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-2">
            LGPD – Lei Geral de Proteção de Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-base text-muted-foreground">
          <section>
            <h2 className="font-semibold text-lg mb-2">O que é a LGPD?</h2>
            <p>
              A Lei Geral de Proteção de Dados Pessoais (LGPD – Lei nº
              13.709/2018) regula o tratamento de dados pessoais no Brasil,
              garantindo mais transparência, segurança e controle para você
              sobre suas informações.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">
              Principais direitos do titular
            </h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Confirmação e acesso aos seus dados pessoais.</li>
              <li>
                Correção de dados incompletos, inexatos ou desatualizados.
              </li>
              <li>
                Anonimização, bloqueio ou eliminação de dados desnecessários ou
                tratados em desconformidade.
              </li>
              <li>
                Portabilidade dos dados a outro fornecedor de serviço ou
                produto.
              </li>
              <li>Informação sobre compartilhamento de dados.</li>
              <li>Revogação do consentimento a qualquer momento.</li>
            </ul>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">
              Como tratamos seus dados
            </h2>
            <p>
              Seus dados são coletados e utilizados apenas para o funcionamento
              do NoControle, respeitando os princípios de finalidade,
              necessidade, transparência e segurança. Não compartilhamos suas
              informações com terceiros sem sua autorização.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">Segurança</h2>
            <p>
              Adotamos medidas técnicas e administrativas para proteger seus
              dados contra acessos não autorizados, perdas ou vazamentos,
              conforme exigido pela LGPD.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">Contato e dúvidas</h2>
            <p>
              Para exercer seus direitos ou tirar dúvidas sobre privacidade e
              proteção de dados, entre em contato pelo e-mail:{" "}
              <a
                href="mailto:jotasuportetec@gmail.com"
                className="text-primary underline"
              >
                jotasuportetec@gmail.com
              </a>
            </p>
          </section>
          <div className="text-xs text-muted-foreground pt-4">
            Última atualização: Junho de 2025
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default LGPD;
