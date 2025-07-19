import {
  TrendingUp,
  Target,
  Star,
  PieChart,
  Download,
  CreditCard,
  Shield,
  PiggyBank,
  Users,
  Calendar,
  Heart,
  Wallet,
  FileText,
  Bell,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const funcionalidades = [
  {
    icon: <TrendingUp className="w-7 h-7 text-primary" />,
    title: "Controle de Gastos Automático",
    description:
      "Categorização inteligente das suas despesas com insights em tempo real.",
    example: "Veja para onde seu dinheiro está indo sem esforço manual.",
  },
  {
    icon: <Target className="w-7 h-7 text-primary" />,
    title: "Limite de Categoria Inteligente",
    description:
      "Defina limites por categoria e receba alertas antes de estourar o orçamento.",
    example:
      "Receba avisos quando estiver perto de gastar demais em alimentação.",
  },
  {
    icon: <Star className="w-7 h-7 text-primary" />,
    title: "Mural de Metas e Wishlist",
    description:
      "Visualize seus objetivos e acompanhe o progresso de forma gamificada.",
    example:
      "Crie metas como 'Viajar' ou 'Comprar um notebook' e acompanhe seu avanço.",
  },
  {
    icon: <PieChart className="w-7 h-7 text-primary" />,
    title: "Relatórios e Gráficos Personalizados",
    description:
      "Dashboards intuitivos com análises detalhadas do seu dinheiro.",
    example: "Visualize gráficos de despesas por categoria, mês ou tipo.",
  },
  {
    icon: <Download className="w-7 h-7 text-primary" />,
    title: "Exportação Fácil",
    description:
      "Exporte seus dados em CSV, Excel ou PDF com apenas um clique.",
    example: "Baixe relatórios para compartilhar ou analisar fora do sistema.",
  },
  {
    icon: <CreditCard className="w-7 h-7 text-primary" />,
    title: "Gestão de Cartões de Crédito",
    description:
      "Controle limites, datas de vencimento e gastos de múltiplos cartões.",
    example: "Gerencie todos os seus cartões em um só lugar.",
  },
  {
    icon: <Shield className="w-7 h-7 text-primary" />,
    title: "Backup e Segurança",
    description: "Seus dados protegidos com criptografia e backup automático.",
    example: "Tranquilidade total: seus dados estão sempre seguros.",
  },
  {
    icon: <PiggyBank className="w-7 h-7 text-primary" />,
    title: "Cofrinho Digital",
    description: "Registre e acompanhe suas economias mensais de forma visual.",
    example: "Veja quanto conseguiu poupar mês a mês.",
  },
  {
    icon: <TrendingUp className="w-7 h-7 text-primary" />,
    title: "Investimentos Centralizados",
    description:
      "Monitore seus investimentos e veja a evolução do seu patrimônio.",
    example: "Acompanhe aplicações, corretoras e evolução dos valores.",
  },
  {
    icon: <Calendar className="w-7 h-7 text-primary" />,
    title: "Calendário Financeiro",
    description:
      "Visualize vencimentos, metas e eventos importantes em um calendário.",
    example: "Nunca mais perca um vencimento de conta ou meta.",
  },
  {
    icon: <Heart className="w-7 h-7 text-primary" />,
    title: "Lista de Desejos",
    description: "Gerencie desejos de consumo e tome decisões conscientes.",
    example: "Adicione itens, defina prioridade e analise antes de comprar.",
  },
  {
    icon: <Wallet className="w-7 h-7 text-primary" />,
    title: "Categorias Personalizadas",
    description: "Crie e edite categorias para organizar suas transações.",
    example: "Adapte o sistema à sua realidade financeira.",
  },
  {
    icon: <FileText className="w-7 h-7 text-primary" />,
    title: "Histórico Completo",
    description: "Consulte e filtre todas as transações já realizadas.",
    example: "Encontre rapidamente qualquer lançamento antigo.",
  },
  {
    icon: <Bell className="w-7 h-7 text-primary" />,
    title: "Notificações Inteligentes",
    description: "Receba alertas sobre vencimentos, metas e limites atingidos.",
    example: "Fique sempre informado sobre sua vida financeira.",
  },
];

const Funcionalidades = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto p-4 lg:p-8 max-w-6xl">
      <div className="mb-10 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-foreground">
          Funcionalidades do NoControle
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Descubra tudo o que você pode fazer para transformar sua vida
          financeira.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {funcionalidades.map((func, idx) => (
          <Card
            key={idx}
            className="flex flex-col md:flex-row items-start gap-4 p-6 shadow-lg hover:shadow-xl transition-shadow rounded-2xl bg-white/90"
          >
            <div className="flex-shrink-0">{func.icon}</div>
            <div>
              <CardTitle className="text-lg font-semibold mb-1">
                {func.title}
              </CardTitle>
              <CardDescription className="mb-1">
                {func.description}
              </CardDescription>
              <span className="text-xs text-muted-foreground">
                {func.example}
              </span>
            </div>
          </Card>
        ))}
      </div>
      <div className="text-center mt-12">
        <Button asChild size="lg" className="px-8">
          <Link to="/cadastro">
            Começar de Graça <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>
      </div>
    </div>
  </div>
);

export default Funcionalidades;
