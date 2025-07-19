import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseChart } from "@/components/ExpenseChart";
import { TrendChart } from "@/components/TrendChart";
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Loader2,
  PieChart,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, makeApiRequest } from "@/lib/api";

interface Transaction {
  id: string;
  tipo: "receita" | "despesa";
  valor: number;
  descricao: string;
  categoria?: {
    id: string;
    nome: string;
  };
  data: string;
  cartao?: string;
  recorrente: boolean;
  meta?: string;
}

interface Category {
  id: string;
  nome: string;
  cor: string;
  tipo: "receita" | "despesa";
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface CategoryExpenseData {
  name: string;
  amount: number;
  color: string;
  type: string;
}

const RelatoriosNew = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPeriod, setSelectedPeriod] = useState("year");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("07");

  // Carregar dados da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Carregando dados de relatórios...");

        // Carregar transações
        const transactionsData = await makeApiRequest(
          API_ENDPOINTS.TRANSACTIONS
        );
        console.log("Dados de transações recebidos:", transactionsData);

        if (transactionsData.success) {
          console.log('Transações recebidas detalhadamente:', transactionsData.data);
          transactionsData.data.forEach((t, index) => {
            console.log(`Transação ${index}:`, {
              id: t.id,
              tipo: t.tipo,
              valor: t.valor,
              data: t.data,
              categoria: t.categoria,
              descricao: t.descricao
            });
          });
          setTransactions(transactionsData.data || []);
        } else {
          console.error(
            "API retornou sucesso false para transações:",
            transactionsData
          );
        }

        // Carregar categorias
        const categoriesData = await makeApiRequest(API_ENDPOINTS.CATEGORIES);
        console.log("Dados de categorias recebidos:", categoriesData);

        if (categoriesData.success) {
          console.log('Categorias recebidas detalhadamente:', categoriesData.data);
          categoriesData.data.forEach((c, index) => {
            console.log(`Categoria ${index}:`, {
              id: c.id,
              nome: c.nome,
              tipo: c.tipo,
              cor: c.cor
            });
          });
          setCategories(categoriesData.data || []);
        } else {
          console.error(
            "API retornou sucesso false para categorias:",
            categoriesData
          );
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados para os relatórios.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Funções de processamento de dados
  const getFilteredTransactions = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    console.log('Filtrando transações com:', {
      selectedPeriod,
      selectedYear,
      selectedMonth,
      totalTransactions: transactions.length
    });

    const filtered = transactions.filter((transaction) => {
      try {
        if (!transaction || !transaction.data) {
          console.log('Transação sem data:', transaction);
          return false;
        }

        const transactionDate = new Date(transaction.data);
        if (isNaN(transactionDate.getTime())) {
          console.log('Data inválida:', transaction.data);
          return false;
        }

        console.log('Processando transação:', {
          id: transaction.id,
          data: transaction.data,
          dataFormatada: transactionDate,
          ano: transactionDate.getFullYear(),
          mes: transactionDate.getMonth()
        });

        if (selectedPeriod === "year") {
          const match = transactionDate.getFullYear() === parseInt(selectedYear);
          console.log(`Ano ${transactionDate.getFullYear()} === ${selectedYear}? ${match}`);
          return match;
        } else if (selectedPeriod === "month") {
          const yearMatch = transactionDate.getFullYear() === parseInt(selectedYear);
          const monthMatch = transactionDate.getMonth() === parseInt(selectedMonth) - 1;
          const match = yearMatch && monthMatch;
          console.log(`Mês/Ano ${transactionDate.getMonth() + 1}/${transactionDate.getFullYear()} === ${selectedMonth}/${selectedYear}? ${match}`);
          return match;
        } else {
          // Último mês
          const match = transactionDate.getFullYear() === currentYear &&
                       transactionDate.getMonth() === currentMonth;
          console.log(`Mês atual ${transactionDate.getMonth() + 1}/${transactionDate.getFullYear()} === ${currentMonth + 1}/${currentYear}? ${match}`);
          return match;
        }
      } catch (error) {
        console.error("Erro ao filtrar transação:", error, transaction);
        return false;
      }
    });

    console.log('Transações filtradas:', filtered.length, filtered);
    return filtered;
  };

  const getCategoryData = (): CategoryExpenseData[] => {
    const filteredTransactions = getFilteredTransactions();
    
    console.log('Processando categorias:', {
      totalCategorias: categories.length,
      transacoesFiltradas: filteredTransactions.length
    });

    const categoryData = categories
      .map((category) => {
        try {
          const categoryTransactions = filteredTransactions.filter(
            (t) => t && t.categoria?.id === category.id
          );
          
          console.log(`Categoria ${category.nome}:`, {
            id: category.id,
            transacoes: categoryTransactions.length,
            transacoesDetalhes: categoryTransactions
          });
          
          const amount = categoryTransactions.reduce((sum, t) => {
            if (t && t.tipo === "despesa" && typeof t.valor === "number") {
              return sum + t.valor;
            }
            return sum;
          }, 0);

          const result = {
            name: category.nome || "Sem nome",
            amount,
            color: category.cor || "#8884d8",
            type: category.tipo || "despesa",
          };
          
          console.log(`Resultado categoria ${category.nome}:`, result);
          
          return result;
        } catch (error) {
          console.error("Erro ao processar categoria:", error, category);
          return {
            name: "Erro",
            amount: 0,
            color: "#8884d8",
            type: "despesa",
          };
        }
      })
      .filter((item) => item.amount > 0);

    console.log('Dados de categoria finais:', categoryData);
    return categoryData;
  };

  const getMonthlyData = (): MonthlyData[] => {
    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    const currentYear = parseInt(selectedYear);

    const monthlyData: MonthlyData[] = [];

    for (let month = 0; month < 12; month++) {
      const monthTransactions = transactions.filter((transaction) => {
        try {
          if (!transaction || !transaction.data) return false;
          const transactionDate = new Date(transaction.data);
          if (isNaN(transactionDate.getTime())) return false;
          return (
            transactionDate.getFullYear() === currentYear &&
            transactionDate.getMonth() === month
          );
        } catch (error) {
          console.error(
            "Erro ao filtrar transação mensal:",
            error,
            transaction
          );
          return false;
        }
      });

      const income = monthTransactions
        .filter((t) => t && t.tipo === "receita")
        .reduce((sum, t) => {
          if (t && typeof t.valor === "number") {
            return sum + t.valor;
          }
          return sum;
        }, 0);

      const expenses = monthTransactions
        .filter((t) => t && t.tipo === "despesa")
        .reduce((sum, t) => {
          if (t && typeof t.valor === "number") {
            return sum + t.valor;
          }
          return sum;
        }, 0);

      monthlyData.push({
        month: monthNames[month],
        income,
        expenses,
      });
    }

    return monthlyData;
  };

  const getTotalIncome = () => {
    const filtered = getFilteredTransactions();
    const receitas = filtered.filter((t) => t && t.tipo === "receita");
    
    const total = receitas.reduce((sum, t) => {
      if (t && typeof t.valor === "number") {
        return sum + t.valor;
      }
      return sum;
    }, 0);
    
    console.log('Total de receitas:', {
      transacoesFiltradas: filtered.length,
      receitas: receitas.length,
      total
    });
    
    return total;
  };

  const getTotalExpenses = () => {
    const filtered = getFilteredTransactions();
    const despesas = filtered.filter((t) => t && t.tipo === "despesa");
    
    const total = despesas.reduce((sum, t) => {
      if (t && typeof t.valor === "number") {
        return sum + t.valor;
      }
      return sum;
    }, 0);
    
    console.log('Total de despesas:', {
      transacoesFiltradas: filtered.length,
      despesas: despesas.length,
      total
    });
    
    return total;
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getAverageExpense = () => {
    const filteredTransactions = getFilteredTransactions();
    const expenses = filteredTransactions.filter(
      (t) => t && t.tipo === "despesa"
    );

    if (expenses.length === 0) return 0;

    const totalExpenses = expenses.reduce((sum, t) => {
      if (t && typeof t.valor === "number") {
        return sum + t.valor;
      }
      return sum;
    }, 0);

    return totalExpenses / expenses.length;
  };

  const getTopExpenseCategory = () => {
    const categoryData = getCategoryData();
    return categoryData.length > 0
      ? categoryData.reduce((max, cat) => (cat.amount > max.amount ? cat : max))
      : null;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleExportReport = () => {
    try {
      const filteredTransactions = getFilteredTransactions();
      const csvContent = [
        ["Data", "Tipo", "Descrição", "Categoria", "Valor"].join(","),
        ...filteredTransactions.map((t) => {
          try {
            const data =
              t && t.data
                ? new Date(t.data).toLocaleDateString("pt-BR")
                : "Data inválida";
            const tipo = t && t.tipo ? t.tipo : "N/A";
            const descricao =
              t && t.descricao ? t.descricao.replace(/,/g, ";") : "N/A";
            const categoria =
              (t &&
                t.categoria &&
                categories.find((c) => c.id === t.categoria.id)?.nome) ||
              "N/A";
            const valor =
              t && typeof t.valor === "number"
                ? t.valor.toFixed(2).replace(".", ",")
                : "0,00";

            return [data, tipo, descricao, categoria, valor].join(",");
          } catch (error) {
            console.error("Erro ao processar transação para CSV:", error, t);
            return ["Erro", "Erro", "Erro", "Erro", "0,00"].join(",");
          }
        }),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `relatorio_${selectedPeriod}_${selectedYear}_${selectedMonth}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Relatório exportado",
        description: "O relatório foi baixado como arquivo CSV.",
      });
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      toast({
        title: "Erro ao exportar relatório",
        description: "Não foi possível gerar o arquivo CSV.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  const categoryExpenses = getCategoryData().filter(
    (item) => item.type === "despesa"
  );
  const monthlyExpenses = getMonthlyData();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();
  const averageExpense = getAverageExpense();
  const topExpenseCategory = getTopExpenseCategory();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <BackButton />
        </div>

        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Relatórios
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Análise detalhada das suas finanças
              </p>
            </div>
            <Button
              onClick={handleExportReport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mês específico</SelectItem>
                  <SelectItem value="year">Ano completo</SelectItem>
                  <SelectItem value="current">Último mês</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
              {selectedPeriod === "month" && (
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">Janeiro</SelectItem>
                    <SelectItem value="02">Fevereiro</SelectItem>
                    <SelectItem value="03">Março</SelectItem>
                    <SelectItem value="04">Abril</SelectItem>
                    <SelectItem value="05">Maio</SelectItem>
                    <SelectItem value="06">Junho</SelectItem>
                    <SelectItem value="07">Julho</SelectItem>
                    <SelectItem value="08">Agosto</SelectItem>
                    <SelectItem value="09">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  balance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(balance)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Gasto Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(averageExpense)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Despesas por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryExpenses.length > 0 ? (
                <ExpenseChart
                  data={categoryExpenses}
                  title="Despesas por Categoria"
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma despesa encontrada para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Evolução Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart data={monthlyExpenses} />
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Insights Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Categoria com Maior Gasto
                </h4>
                <p className="text-sm text-blue-700">
                  {topExpenseCategory
                    ? `${topExpenseCategory.name}: ${formatCurrency(
                        topExpenseCategory.amount
                      )}`
                    : "Nenhuma despesa encontrada"}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  Taxa de Economia
                </h4>
                <p className="text-sm text-green-700">
                  {totalIncome > 0
                    ? `${((balance / totalIncome) * 100).toFixed(
                        1
                      )}% do total de receitas`
                    : "Sem dados de receita"}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">
                  Transações no Período
                </h4>
                <p className="text-sm text-yellow-700">
                  {getFilteredTransactions().length} transações registradas
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">
                  Status Financeiro
                </h4>
                <p className="text-sm text-purple-700">
                  {balance >= 0
                    ? "Saldo positivo - Situação favorável"
                    : "Saldo negativo - Atenção necessária"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RelatoriosNew;
