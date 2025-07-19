import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacidade = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto p-4 lg:p-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-2">
            Política de Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-base text-muted-foreground">
          <section>
            <h2 className="font-semibold text-lg mb-2">1. Coleta de Dados</h2>
            <p>
              Coletamos apenas informações essenciais para funcionamento do
              NoControle, como nome, e-mail e dados financeiros cadastrados
              por você.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">
              2. Uso das Informações
            </h2>
            <p>
              Seus dados são utilizados exclusivamente para fornecer os serviços
              da plataforma, gerar relatórios e personalizar sua experiência.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">3. Compartilhamento</h2>
            <p>
              Não compartilhamos suas informações pessoais com terceiros, exceto
              quando exigido por lei.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">4. Segurança</h2>
            <p>
              Utilizamos criptografia e práticas de segurança para proteger seus
              dados contra acesso não autorizado.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">
              5. Direitos do Usuário
            </h2>
            <p>
              Você pode solicitar a exclusão ou alteração dos seus dados a
              qualquer momento, conforme a LGPD.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">6. Contato</h2>
            <p>
              Em caso de dúvidas, entre em contato pelo e-mail:{" "}
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

export default Privacidade;
