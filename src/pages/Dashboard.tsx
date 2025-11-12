import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SummaryCard } from "@/components/SummaryCard";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PlusCircle,
  Target,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { API_ENDPOINTS, makeApiRequest } from "@/lib/api";
import {
  PageLayout,
  StatsGrid,
  ContentGrid,
  ResponsiveCard,
} from "@/components/ui/page-layout";
import { formatCurrency, safeSum, parseToNumber } from "@/utils/formatters";
import { DashboardSkeleton } from "@/components/skeletons";

interface Transaction {
  id: string;
  tipo: "receita" | "despesa";
  valor: number;
  descricao: string;
  data: string;
  observacoes?: string;
  categoria?: {
    id: string;
    nome: string;
    icone: string;
    cor: string;
  };
}

interface Category {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  tipo: "receita" | "despesa";
  ativo: boolean;
}

interface Goal {
  id: string;
  nome: string;
  valorAlvo: number;
  valorAtual: number;
  prazo: string;
  descricao?: string;
  ativo: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados da API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Não precisa mais enviar usuario_id - vem do token JWT
        const categoriesEndpoint = API_ENDPOINTS.CATEGORIES;

        const [transactionsData, categoriesData, goalsData] = await Promise.all(
          [
            makeApiRequest(API_ENDPOINTS.TRANSACTIONS, { method: "GET" }),
            makeApiRequest(categoriesEndpoint, { method: "GET" }),
            makeApiRequest(API_ENDPOINTS.GOALS, { method: "GET" }),
          ]
        );

        // Função auxiliar para extrair dados da resposta da API
        const extractData = (response: any, dataPath?: string) => {
          if (!response.success) return [];
          const data = dataPath
            ? response.data?.[dataPath]
            : response.data?.data || response.data;
          return Array.isArray(data) ? data : [];
        };

        setTransactions(extractData(transactionsData));
        setCategories(extractData(categoriesData, "categorias"));
        setGoals(extractData(goalsData));
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  // Função auxiliar para calcular totais por tipo
  const calculateTotalsByType = (transactionsList: Transaction[]) => {
    const income = safeSum(
      ...transactionsList
        .filter((t) => t.tipo === "receita")
        .map((t) => parseToNumber(t.valor))
    );

    const expenses = safeSum(
      ...transactionsList
        .filter((t) => t.tipo === "despesa")
        .map((t) => parseToNumber(t.valor))
    );

    return { income, expenses };
  };

  // Calcular saldo
  const getBalance = () => {
    const { income, expenses } = calculateTotalsByType(transactions);
    return income - expenses;
  };

  // Obter receitas e despesas do mês atual
  const getCurrentMonthData = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.data);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    return calculateTotalsByType(currentMonthTransactions);
  };

  // Tipos auxiliares para melhor tipagem
  type CategoryTotal = {
    total: number;
    color: string;
    icon: string;
  };

  type CategoryTotals = Record<string, CategoryTotal>;

  // Obter despesas por categoria
  const getCategoryExpenses = () => {
    const defaultColor = "#6B7280";
    const defaultIcon = "📦";
    const maxCategories = 5;

    const categoryTotals = transactions
      .filter((t) => t.tipo === "despesa")
      .reduce<CategoryTotals>((acc, transaction) => {
        const categoryName = transaction.categoria?.nome || "Sem categoria";

        acc[categoryName] = {
          total:
            (acc[categoryName]?.total || 0) + parseToNumber(transaction.valor),
          color: transaction.categoria?.cor || defaultColor,
          icon: transaction.categoria?.icone || defaultIcon,
        };
        return acc;
      }, {});

    return limitResults(
      Object.entries(categoryTotals).sort(([, a], [, b]) => b.total - a.total),
      maxCategories
    );
  };

  // Funções auxiliares de classificação e filtragem
  const sortByDate = (a: Transaction, b: Transaction) =>
    new Date(b.data).getTime() - new Date(a.data).getTime();
  const limitResults = (array: any[], limit: number) => array.slice(0, limit);

  // Obter transações recentes
  const getRecentTransactions = () =>
    limitResults(transactions.sort(sortByDate), 5);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const balance = getBalance();
  const { income, expenses } = getCurrentMonthData();
  const categoryExpenses = getCategoryExpenses();
  const recentTransactions = getRecentTransactions();

  return (
    <PageLayout
      title={`Olá, ${user?.name || "Usuário"}! 👋`}
      subtitle="Aqui está um resumo das suas finanças"
      showBackButton={false}
      actions={
        <Button asChild>
          <Link to="/lancamento">
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Lançamento
          </Link>
        </Button>
      }
    >
      {/* Cards de Resumo */}
      <StatsGrid>
        <SummaryCard
          title="Saldo Total"
          value={balance}
          icon={<DollarSign className="h-4 w-4" />}
          trend={balance >= 0 ? "up" : "down"}
          description={balance >= 0 ? "Saldo positivo" : "Saldo negativo"}
        />
        <SummaryCard
          title="Receitas do Mês"
          value={income}
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
          description="Receitas deste mês"
        />
        <SummaryCard
          title="Despesas do Mês"
          value={expenses}
          icon={<TrendingDown className="h-4 w-4" />}
          trend="down"
          description="Despesas deste mês"
        />
        <SummaryCard
          title="Metas Ativas"
          value={goals.filter((g) => g.ativo).length}
          icon={<Target className="h-4 w-4" />}
          trend="neutral"
          description="Objetivos em andamento"
          formatAsCurrency={false}
        />
      </StatsGrid>

      {/* Botões de Ação Rápida */}
      <ContentGrid columns={4} className="mb-6">
        <Button asChild className="h-20 flex-col gap-2">
          <Link to="/categorias">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm">Categorias</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col gap-2">
          <Link to="/metas">
            <Target className="h-5 w-5" />
            <span className="text-sm">Metas</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col gap-2">
          <Link to="/relatorios">
            <Calendar className="h-5 w-5" />
            <span className="text-sm">Relatórios</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col gap-2">
          <Link to="/historico">
            <Eye className="h-5 w-5" />
            <span className="text-sm">Histórico</span>
          </Link>
        </Button>
      </ContentGrid>

      <ContentGrid columns={2}>
        {/* Despesas por Categoria */}
        <ResponsiveCard
          title="Principais Despesas"
          description="Categorias com maiores gastos"
        >
          {categoryExpenses.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhuma despesa registrada
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryExpenses.map(([category, data]) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: data.color + "20" }}
                    >
                      {data.icon}
                    </div>
                    <span className="font-medium">{category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {formatCurrency(data.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ResponsiveCard>

        {/* Transações Recentes */}
        <ResponsiveCard
          title="Transações Recentes"
          description="Últimas movimentações"
        >
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhuma transação registrada
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{
                        backgroundColor:
                          transaction.categoria?.cor + "20" || "#6B728020",
                      }}
                    >
                      {transaction.categoria?.icone || "📦"}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.data).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold flex items-center gap-1 ${
                        transaction.tipo === "receita"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.tipo === "receita" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {formatCurrency(transaction.valor)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ResponsiveCard>
      </ContentGrid>

      {/* Metas em Andamento */}
      {goals.filter((g) => g.ativo).length > 0 && (
        <ResponsiveCard
          title="Metas em Andamento"
          description="Objetivos financeiros ativos"
          className="mt-6"
        >
          <ContentGrid columns={2}>
            {goals
              .filter((g) => g.ativo)
              .slice(0, 4)
              .map((goal) => {
                const progress =
                  goal.valorAlvo > 0
                    ? (parseToNumber(goal.valorAtual) /
                        parseToNumber(goal.valorAlvo)) *
                      100
                    : 0;
                return (
                  <div
                    key={goal.id}
                    className="p-4 border rounded-lg bg-background"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{goal.nome}</h4>
                      <Badge
                        variant={progress >= 100 ? "default" : "secondary"}
                      >
                        {progress.toFixed(0)}%
                      </Badge>
                    </div>
                    <Progress value={progress} className="mb-3" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(goal.valorAtual)}</span>
                      <span>{formatCurrency(goal.valorAlvo)}</span>
                    </div>
                  </div>
                );
              })}
          </ContentGrid>
        </ResponsiveCard>
      )}
    </PageLayout>
  );
};

export default Dashboard;
