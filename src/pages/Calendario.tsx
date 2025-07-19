
import { useState } from "react";
import {
  Calendar as CalendarIcon,
  TrendingUp,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/BackButton";
import { useFinanceExtendedContext } from "@/contexts/FinanceExtendedContext";

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const Calendario = () => {
  const { transactions, debts, fixedExpenses } = useFinanceExtendedContext();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Função para adaptar dados do backend para o formato esperado pelo frontend
  const adaptBackendData = () => {
    // Adaptar transações: backend retorna {tipo: 'receita'/'despesa', valor, data} 
    // frontend espera {type: 'income'/'expense', amount, date}
    const adaptedTransactions = Array.isArray(transactions) ? transactions.map((t: any) => ({
      ...t,
      type: t.tipo === 'receita' ? 'income' : 'expense',
      amount: parseFloat(t.valor || 0),
      date: t.data
    })) : [];

    // Adaptar dívidas: backend pode retornar {valorTotal, valorPago, status}
    // frontend espera {currentAmount, status}
    const adaptedDebts = Array.isArray(debts) ? debts.map((d: any) => ({
      ...d,
      currentAmount: parseFloat(d.valorTotal || d.currentAmount || 0) - parseFloat(d.valorPago || 0),
      status: d.status === 'pendente' ? 'active' : d.status
    })) : [];

    // Adaptar gastos fixos: backend pode retornar {valor, ativo}
    // frontend espera {amount, isActive}
    const adaptedFixedExpenses = Array.isArray(fixedExpenses) ? fixedExpenses.map((f: any) => ({
      ...f,
      amount: parseFloat(f.valor || f.amount || 0),
      isActive: f.ativo !== undefined ? f.ativo : f.isActive
    })) : [];

    return {
      transactions: adaptedTransactions,
      debts: adaptedDebts,
      fixedExpenses: adaptedFixedExpenses
    };
  };

  const { transactions: adaptedTransactions, debts: adaptedDebts, fixedExpenses: adaptedFixedExpenses } = adaptBackendData();

  // Debug: Log dos dados carregados
  console.log('Dados do calendário:', {
    transactions: transactions,
    debts: debts,
    fixedExpenses: fixedExpenses,
    adaptedTransactions: adaptedTransactions,
    adaptedDebts: adaptedDebts,
    adaptedFixedExpenses: adaptedFixedExpenses
  });

  // Função para calcular os totais por mês
  const getMonthSummary = (monthIdx: number) => {
    const receitas = adaptedTransactions
      .filter(
        (t) => 
          t.type === "income" && 
          new Date(t.date).getMonth() === monthIdx &&
          new Date(t.date).getFullYear() === selectedYear
      )
      .reduce((sum, t) => sum + t.amount, 0);

    // Usar adaptedFixedExpenses para gastos fixos
    const gastosFixos = adaptedFixedExpenses
      .filter(
        (f) =>
          f.isActive &&
          // Assumindo que gastos fixos se aplicam a todos os meses do ano selecionado
          selectedYear === new Date().getFullYear()
      )
      .reduce((sum, f) => sum + f.amount, 0);

    // Gastos variáveis são todas as despesas que não estão nos gastos fixos
    const gastosVariaveis = adaptedTransactions
      .filter(
        (t) =>
          t.type === "expense" &&
          new Date(t.date).getMonth() === monthIdx &&
          new Date(t.date).getFullYear() === selectedYear
      )
      .reduce((sum, t) => sum + t.amount, 0);

    // Usar currentAmount das dívidas ativas (não há campo date, então consideramos todas as ativas)
    const dividas = adaptedDebts
      .filter(d => d.status === 'active')
      .reduce((sum, d) => sum + d.currentAmount, 0) / 12; // Dividindo por 12 meses

    const balanco = receitas - gastosFixos - gastosVariaveis - dividas;

    return { receitas, gastosFixos, gastosVariaveis, dividas, balanco };
  };

  // Calcular totais do ano
  const getYearTotals = () => {
    let totalReceitas = 0;
    let totalGastosFixos = 0;
    let totalGastosVariaveis = 0;
    let totalDividas = 0;

    for (let i = 0; i < 12; i++) {
      const monthData = getMonthSummary(i);
      totalReceitas += monthData.receitas;
      totalGastosFixos += monthData.gastosFixos;
      totalGastosVariaveis += monthData.gastosVariaveis;
      totalDividas += monthData.dividas;
    }

    return {
      totalReceitas,
      totalGastosFixos,
      totalGastosVariaveis,
      totalDividas,
      totalBalanco: totalReceitas - totalGastosFixos - totalGastosVariaveis - totalDividas,
    };
  };

  const yearTotals = getYearTotals();
  const availableYears = [2023, 2024, 2025];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <BackButton />
        </div>

        <div
          className="mb-6 lg:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
                Controle do Ano - Mês por mês
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Acompanhe seu resumo financeiro mensal do ano de {selectedYear}
              </p>
            </div>
            <Select 
              value={selectedYear.toString()} 
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4 text-green-500" />
                Total de Ganhos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {yearTotals.totalReceitas.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4 text-red-500" />
                Total Gastos Fixos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {yearTotals.totalGastosFixos.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-500" />
                Total Gastos Variáveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                R$ {yearTotals.totalGastosVariaveis.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-500" />
                Total Dívidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                R$ {yearTotals.totalDividas.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Balanço Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                yearTotals.totalBalanco >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                R$ {yearTotals.totalBalanco.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Finance Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Resumo Mensal {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-4 py-3 font-semibold">Mês</th>
                    <th className="text-right px-4 py-3 font-semibold text-green-700">
                      Total de Ganhos
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-red-700">
                      Total Gastos Fixos
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-orange-700">
                      Total Gastos Variáveis
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-purple-700">
                      Total Dívidas
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-blue-700">
                      Balanço
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {months.map((month, idx) => {
                    const {
                      receitas,
                      gastosFixos,
                      gastosVariaveis,
                      dividas,
                      balanco,
                    } = getMonthSummary(idx);
                    
                    const hasData = receitas > 0 || gastosFixos > 0 || gastosVariaveis > 0 || dividas > 0;
                    const currentMonth = new Date().getMonth();
                    const isCurrentMonth = idx === currentMonth && selectedYear === new Date().getFullYear();

                    return (
                      <tr 
                        key={month} 
                        className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${
                          isCurrentMonth ? "bg-blue-50 dark:bg-blue-950/20" : ""
                        } ${
                          hasData ? "font-medium" : "text-muted-foreground"
                        }`}
                      >
                        <td className="px-4 py-3 flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                          {month} {selectedYear}
                          {isCurrentMonth && (
                            <Badge variant="secondary" className="text-xs">
                              Atual
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600">
                          R$ {receitas.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600">
                          R$ {gastosFixos.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right text-orange-600">
                          R$ {gastosVariaveis.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right text-purple-600">
                          R$ {dividas.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-bold flex items-center justify-end gap-1 ${
                            balanco >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {balanco < 0 && <AlertCircle className="h-4 w-4" />}
                          R$ {balanco.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/80 font-bold text-base border-t-2">
                    <td className="px-4 py-4 font-bold">TOTAL {selectedYear}</td>
                    <td className="px-4 py-4 text-right text-green-600">
                      R$ {yearTotals.totalReceitas.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-4 text-right text-red-600">
                      R$ {yearTotals.totalGastosFixos.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-4 text-right text-orange-600">
                      R$ {yearTotals.totalGastosVariaveis.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-4 text-right text-purple-600">
                      R$ {yearTotals.totalDividas.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className={`px-4 py-4 text-right font-bold text-lg ${
                      yearTotals.totalBalanco >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      R$ {yearTotals.totalBalanco.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Insights */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Insights do Ano {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Melhor Mês (Balanço)</p>
                <p className="text-lg font-bold text-green-600">
                  {(() => {
                    let bestMonth = 0;
                    let bestBalance = getMonthSummary(0).balanco;
                    for (let i = 1; i < 12; i++) {
                      const balance = getMonthSummary(i).balanco;
                      if (balance > bestBalance) {
                        bestBalance = balance;
                        bestMonth = i;
                      }
                    }
                    return bestBalance > 0 ? months[bestMonth] : "Nenhum";
                  })()}
                </p>
              </div>
              
              <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Mês com Mais Gastos</p>
                <p className="text-lg font-bold text-red-600">
                  {(() => {
                    let worstMonth = 0;
                    let worstExpenses = getMonthSummary(0).gastosFixos + getMonthSummary(0).gastosVariaveis;
                    for (let i = 1; i < 12; i++) {
                      const expenses = getMonthSummary(i).gastosFixos + getMonthSummary(i).gastosVariaveis;
                      if (expenses > worstExpenses) {
                        worstExpenses = expenses;
                        worstMonth = i;
                      }
                    }
                    return worstExpenses > 0 ? months[worstMonth] : "Nenhum";
                  })()}
                </p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Média Mensal</p>
                <p className="text-lg font-bold text-blue-600">
                  R$ {(yearTotals.totalBalanco / 12).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendario;
