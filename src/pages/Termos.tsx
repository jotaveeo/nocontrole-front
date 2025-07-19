import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Termos = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto p-4 lg:p-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-2">
            Termos de Uso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-base text-muted-foreground">
          <section>
            <h2 className="font-semibold text-lg mb-2">
              1. Aceitação dos Termos
            </h2>
            <p>
              Ao criar uma conta ou utilizar o NoControle, você concorda com
              estes Termos de Uso e com a Política de Privacidade.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">2. Uso da Plataforma</h2>
            <p>
              O NoControle é destinado ao uso pessoal para organização
              financeira. Não é permitido utilizar o sistema para fins ilícitos
              ou que violem leis vigentes.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">
              3. Cadastro e Segurança
            </h2>
            <p>
              Você é responsável por manter suas credenciais seguras. Não
              compartilhe sua senha com terceiros.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">
              4. Propriedade Intelectual
            </h2>
            <p>
              Todo o conteúdo, marca, layout e funcionalidades do NoControle
              são protegidos por direitos autorais e não podem ser reproduzidos
              sem autorização.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">
              5. Limitação de Responsabilidade
            </h2>
            <p>
              O NoControle não se responsabiliza por decisões financeiras
              tomadas com base nas informações fornecidas pela plataforma.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">
              6. Cancelamento e Exclusão
            </h2>
            <p>
              Você pode cancelar sua conta a qualquer momento. Seus dados serão
              excluídos conforme a Política de Privacidade.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">
              7. Alterações nos Termos
            </h2>
            <p>
              Os termos podem ser atualizados periodicamente. Notificaremos
              sobre mudanças relevantes por e-mail ou na plataforma.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-lg mb-2">8. Contato</h2>
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

export default Termos;
