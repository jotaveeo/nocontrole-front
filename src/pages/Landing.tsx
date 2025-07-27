import {
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  TrendingUp,
  Target,
  PieChart,
  Download,
  Users,
  MessageCircle,
  PiggyBank,
  CreditCard,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthStatus from "@/components/AuthStatus";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Landing = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Verificar tema inicial
  useEffect(() => {
    const isDarkMode =
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle do tema
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const benefits = [
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: "Controle de Gastos Automático",
      description:
        "Categorização inteligente das suas despesas com insights em tempo real.",
    },
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: "Limite de Categoria Inteligente",
      description:
        "Defina limites por categoria e receba alertas antes de estourar o orçamento.",
    },
    {
      icon: <Star className="w-8 h-8 text-primary" />,
      title: "Mural de Metas e Wishlist",
      description:
        "Visualize seus objetivos e acompanhe o progresso de forma gamificada.",
    },
    {
      icon: <PieChart className="w-8 h-8 text-primary" />,
      title: "Relatórios e Gráficos Personalizados",
      description:
        "Dashboards intuitivos com análises detalhadas do seu dinheiro.",
    },
    {
      icon: <Download className="w-8 h-8 text-primary" />,
      title: "Exportação Fácil",
      description:
        "Exporte seus dados em CSV, Excel ou PDF com apenas um clique.",
    },
    {
      icon: <CreditCard className="w-8 h-8 text-primary" />,
      title: "Gestão de Cartões de Crédito",
      description:
        "Controle limites, datas de vencimento e gastos de múltiplos cartões.",
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Backup e Segurança",
      description:
        "Seus dados protegidos com criptografia e backup automático.",
    },
    {
      icon: <PiggyBank className="w-8 h-8 text-primary" />,
      title: "Cofrinho Digital",
      description:
        "Registre e acompanhe suas economias mensais de forma visual.",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: "Investimentos Centralizados",
      description:
        "Monitore seus investimentos e veja a evolução do seu patrimônio.",
    },
  ];

  const plans = [
    {
      name: "💎 Plano Mensal",
      price: "R$ 24,90",
      period: "/mês - 7 Dias Grátis",
      description:
        "✨ Controle total das suas finanças - Cancele quando quiser!",
      features: [
        "Relatórios avançados ilimitados",
        "Metas financeiras ilimitadas",
        "Wishlist e mural de desejos",
        "Categorias personalizadas",
        "Sincronização entre dispositivos",
        "Gestão de cartões de crédito",
        "Limites por categoria inteligentes",
        "Cofrinho digital",
        "Investimentos centralizados",
        "Calendário financeiro",
      ],
      cta: "Assinar Mensal",
      popular: false,
    },
    {
      name: "🏆 Plano Anual",
      price: "12x R$ 20,90",
      period: "/mês",
      description:
        "🔥 MELHOR OFERTA! Economize R$ 48 por ano - Apenas R$ 250,80/ano",
      features: [
        "💰 Economize R$ 48 comparado ao mensal",
        "🔓 Tudo do plano mensal incluído",
        "👥 Múltiplas contas e usuários",
        "🤖 Automações e regras inteligentes",
        "📊 Relatórios avançados e insights com IA",
        "💬 Suporte VIP 24/7 prioritário",
        "🔄 Sincronização entre dispositivos",
        "☁️ Backup automático em nuvem",
      ],
      cta: "Assinar Anual",
      popular: true,
    },
  ];

  const testimonials = [
    {
      name: "Marina Silva",
      role: "Freelancer Designer",
      content:
        "Finalmente consegui organizar minha renda variável! O NoControle me ajudou a economizar R$ 800 no primeiro mês.",
      rating: 5,
    },
    {
      name: "João Santos",
      role: "Estudante de Engenharia",
      content:
        "Saí do vermelho em 3 meses usando as metas do app. Agora já tenho minha reserva de emergência!",
      rating: 5,
    },
    {
      name: "Ana Costa",
      role: "Pequena Investidora",
      content:
        "Os relatórios são incríveis! Descobri onde estava perdendo dinheiro e aumentei meus investimentos em 40%.",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "Como funciona a integração com meu banco?",
      answer:
        "Não realizamos integração direta com bancos. Você pode exportar seus dados bancários ou planilhas (CSV, Excel) e importar facilmente no NoControle para acompanhar suas finanças.",
    },
    {
      question: "Posso cancelar quando quiser?",
      answer:
        "Sim! Não há fidelidade. Você pode cancelar a qualquer momento e continuar usando até o fim do período pago.",
    },
    {
      question: "Meus dados estão seguros?",
      answer:
        "Utilizamos criptografia bancária e certificação SSL. Seus dados ficam no Brasil e seguem a LGPD rigorosamente.",
    },
    {
      question: "Tem app mobile?",
      answer:
        "Ainda em desenvolvimento, mas nosso site possui estrutura totalmente responsiva e pode ser acessado de qualquer dispositivo.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-colors w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
            aria-label="Logo NoControle"
          >
            <TrendingUp className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            NoControle
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
          <Button variant="outline" className="hidden md:flex" asChild>
            <Link to="/login">Já tenho conta</Link>
          </Button>
          <AuthStatus />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20">
          ✨ Mais de 10.000 pessoas já organizaram suas finanças
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Seu dinheiro sob controle, <br />
          <span className="text-primary">sua vida em equilíbrio.</span>
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Organize, visualize, defina metas e elimine dívidas. Tudo em um só
          lugar, de forma simples e inteligente.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-lg px-8"
            asChild
          >
            <Link to="/Cadastro">
              Comece de Graça Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-lg px-8"
            onClick={() => setShowDemo(true)}
          >
            Ver Demonstração
          </Button>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          💳 Sem cartão de crédito • 🔒 100% seguro • ⚡ Setup em 2 minutos
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16" aria-labelledby="benefits-title">
        <div className="text-center mb-16">
          <h2 id="benefits-title" className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Por que milhares escolhem o NoControle?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Recursos pensados para quem quer ter controle total da vida financeira, com praticidade, segurança e visão completa do seu dinheiro.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow rounded-2xl bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
              role="region"
              aria-label={benefit.title}
              tabIndex={0}
            >
              <CardHeader className="flex flex-col items-center">
                <div className="mb-4" aria-hidden="true">{benefit.icon}</div>
                <CardTitle className="text-xl text-center dark:text-white">
                  {benefit.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-center">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-10 bg-white dark:bg-gray-800 rounded-3xl my-16 shadow-sm">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Planos que cabem no seu bolso
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300">
            Comece grátis e evolua conforme sua necessidade
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative flex flex-col h-full ${
                plan.popular
                  ? "border-primary shadow-xl scale-105"
                  : "border-gray-200 dark:border-gray-700"
              } dark:bg-gray-900 transition-transform duration-200`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Mais Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg sm:text-xl md:text-2xl dark:text-white">
                  {plan.name}
                </CardTitle>
                <div className="py-4 flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold dark:text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                      {plan.period}
                    </span>
                  )}
                </div>
                <CardDescription className="dark:text-gray-300 text-sm sm:text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <ul className="space-y-2 sm:space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm md:text-base dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full mt-auto ${
                    plan.popular
                      ? "bg-primary hover:bg-primary/90"
                      : "variant-outline"
                  } text-sm sm:text-base py-3 sm:py-4`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={async () => {
                    let planPayload;
                    if (plan.popular) {
                      planPayload = {
                        reason: "Plano Anual",
                        auto_recurring: {
                          frequency: 12,
                          frequency_type: "months",
                          transaction_amount: 250.8,
                          currency_id: "BRL",
                        },
                        back_url: "https://nocontrole-front.netlify.app/assinatura-sucesso",
                      };
                    } else {
                      planPayload = {
                        reason: "Plano Mensal",
                        auto_recurring: {
                          frequency: 1,
                          frequency_type: "months",
                          transaction_amount: 24.9,
                          currency_id: "BRL",
                        },
                        back_url: "https://nocontrole-front.netlify.app/assinatura-sucesso",
                      };
                    }
                    try {
                      const res = await fetch(
                        "http://localhost:3000/api/mercadoPagoSubscriptions/plan",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(planPayload),
                        }
                      );
                      const data = await res.json();
                      if (data.success) {
                        // Redireciona automaticamente para o checkout Mercado Pago
                        if (data.data?.init_point) {
                          window.location.href = data.data.init_point;
                        } else {
                          alert(
                            "Plano criado! ID: " +
                              (data.data?.id || data.data?.plan?.id || "")
                          );
                        }
                      } else {
                        alert("Erro ao criar plano!");
                      }
                    } catch (err) {
                      alert("Erro ao conectar ao backend!");
                    }
                  }}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            O que nossos usuários dizem
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Histórias reais de transformação financeira
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg dark:bg-gray-800">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-800 rounded-3xl my-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Tire suas dúvidas sobre o NoControle
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-xl bg-white dark:bg-gray-900 shadow-sm transition-all"
              open={index === 0}
            >
              <summary className="flex items-center gap-2 px-6 py-4 cursor-pointer text-lg font-medium text-gray-900 dark:text-white group-open:rounded-t-xl group-open:bg-primary/10 dark:group-open:bg-primary/20 transition-colors">
                <MessageCircle className="w-5 h-5 text-primary" />
                {faq.question}
              </summary>
              <div className="px-6 pb-4 pt-2 text-gray-600 dark:text-gray-300 text-base">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 text-center bg-gradient-to-r from-primary to-blue-700 rounded-3xl my-16 text-white shadow-xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow">
          Pronto para transformar sua vida financeira?
        </h2>
        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          Junte-se a milhares de pessoas que já conquistaram o controle do
          próprio dinheiro com o NoControle.
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="text-lg px-8 font-semibold shadow-lg hover:scale-105 transition-transform"
          asChild
        >
          <a href="/cadastro">
            Começar Minha Jornada Financeira
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </Button>
        <div className="mt-6 text-sm opacity-80 flex flex-col sm:flex-row gap-2 justify-center items-center">
          <span>✅ 7 dias grátis</span>
          <span className="hidden sm:inline">•</span>
          <span>✅ Cancele quando quiser</span>
          <span className="hidden sm:inline">•</span>
          <span>✅ Suporte 24/7</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t dark:border-gray-700">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold dark:text-white">NoControle</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              A plataforma mais completa para controle financeiro pessoal.
            </p>
            <div className="mt-4">
              <span className="inline-block bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-semibold">
                +10.000 usuários
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 dark:text-white">Produto</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link to="/funcionalidades" className="hover:underline">
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link to="/#pricing" className="hover:underline">
                  Preços
                </Link>
              </li>
              <li>
                <Link to="/#faq" className="hover:underline">
                  Segurança
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 dark:text-white">Suporte</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a
                  href="https://t.me/FinanciSuporte"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary font-semibold hover:underline"
                >
                  Suporte via Telegram
                </a>
              </li>
              <li>
                <a
                  href="mailto:jotasuportetec@gmail.com"
                  className="flex items-center gap-2 text-primary font-semibold hover:underline"
                >
                  Via email
                </a>
              </li>
              <li>
                <Link to="/status" className="hover:underline">
                  Status do Sistema
                </Link>
              </li>
              <li>
                <a
                  href="https://t.me/FinanciSuporte"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Comunidade
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 dark:text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link to="/privacidade" className="hover:underline">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos" className="hover:underline">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/lgpd" className="hover:underline">
                  LGPD
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 NoControle. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Shield className="w-4 h-4" />
            <span>Dados protegidos por criptografia bancária</span>
          </div>
        </div>
      </footer>

      {/* Mobile CTA Fixed */}
      <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
        <Button
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 shadow-lg"
          asChild
        >
          <Link to="/cadastro">
            Começar de Graça
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>
      </div>

      {showDemo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 dark:text-gray-400"
              onClick={() => setShowDemo(false)}
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4 dark:text-white">
              Demonstração do NoControle
            </h3>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src="https://www.youtube.com/embed/SEU_VIDEO_ID"
                title="Demonstração"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-64"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
