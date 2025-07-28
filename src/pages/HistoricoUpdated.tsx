import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Trash2, 
  Edit, 
  Calendar,
  Loader2,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HistoricoSkeleton } from "@/components/skeletons";
import { API_ENDPOINTS, makeApiRequest } from "@/lib/api";
import { PageLayout, StatsGrid, ResponsiveCard } from "@/components/ui/page-layout";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { SummaryCard } from "@/components/SummaryCard";
import { Link } from "react-router-dom";

interface Transaction {
  id: string;
  tipo: 'receita' | 'despesa';
  valor: number;
  descricao: string;
  categoria?: {
    id: string;
    nome: string;
  };
  data: string;
  observacoes?: string;
  recorrente?: boolean;
}

interface Category {
  id: string;
  nome: string;
  cor: string;
  tipo: 'receita' | 'despesa';
}

const HistoricoUpdated = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    tipo: 'despesa' as 'receita' | 'despesa',
    valor: '',
    descricao: '',
    categoria: '',
    data: '',
    recorrente: false
  });

  // Função utilitária para garantir que o valor seja um número válido
  const ensureNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(ensureNumber(value));
    } catch (error) {
      console.error('Erro ao formatar moeda:', error);
      return `R$ ${ensureNumber(value).toFixed(2)}`;
    }
  };

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [transactionsData, categoriesData] = await Promise.all([
          makeApiRequest(API_ENDPOINTS.TRANSACTIONS),
          makeApiRequest(API_ENDPOINTS.CATEGORIES),
        ]);

        if (transactionsData.success) {
          // Tratar resposta paginada ou array direto
          const transactionsArray = transactionsData.data?.data || transactionsData.data || [];
          // Mapear campos se necessário
          const mappedTransactions = Array.isArray(transactionsArray) ? transactionsArray.map(trans => ({
            id: trans.id || trans._id,
            tipo: trans.tipo || trans.type,
            valor: trans.valor || trans.value || trans.amount,
            descricao: trans.descricao || trans.description,
            categoria: trans.categoria || trans.category ? {
              id: (trans.categoria || trans.category).id || (trans.categoria || trans.category)._id,
              nome: (trans.categoria || trans.category).nome || (trans.categoria || trans.category).name
            } : undefined,
            data: trans.data || trans.date,
            observacoes: trans.observacoes || trans.notes,
            recorrente: trans.recorrente !== undefined ? trans.recorrente : trans.recurring
          })) : [];
          setTransactions(mappedTransactions);
        }
        if (categoriesData.success) {
          // Tratar resposta de categorias
          const categoriesArray = categoriesData.data?.categorias || categoriesData.data || [];
          // Mapear campos se necessário
          const mappedCategories = Array.isArray(categoriesArray) ? categoriesArray.map(cat => ({
            id: cat.id || cat._id,
            nome: cat.nome || cat.name,
            tipo: cat.tipo || cat.type,
            cor: cat.cor || cat.color,
            icone: cat.icone || cat.icon,
            ativo: cat.ativo !== undefined ? cat.ativo : cat.active !== undefined ? cat.active : true
          })) : [];
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar os dados. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar transações
  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    
    return transactions.filter(transaction => {
      const matchesSearch = transaction.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.categoria?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || transaction.tipo === filterType;
      const matchesCategory = filterCategory === "all" || transaction.categoria?.id === filterCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchTerm, filterType, filterCategory]);

  // Calcular totais
  const getTotalIncome = () => {
    return filteredTransactions
      .filter(t => t.tipo === 'receita')
      .reduce((total, t) => total + ensureNumber(t.valor), 0);
  };

  const getTotalExpense = () => {
    return filteredTransactions
      .filter(t => t.tipo === 'despesa')
      .reduce((total, t) => total + ensureNumber(t.valor), 0);
  };

  // Handlers
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditForm({
      tipo: transaction.tipo,
      valor: transaction.valor.toString(),
      descricao: transaction.descricao,
      categoria: typeof transaction.categoria === 'object' && transaction.categoria !== null
        ? transaction.categoria.id
        : (typeof transaction.categoria === 'string' ? transaction.categoria : ''),
      data: transaction.data.split('T')[0], // Formato YYYY-MM-DD
      recorrente: transaction.recorrente || false
    });
  };

  const handleUpdateTransaction = async () => {
    if (!editingTransaction) return;

    try {
      setSubmitting(true);
      
      // Enviar sempre o campo 'categoria' no payload
      const response = await makeApiRequest(
        `${API_ENDPOINTS.TRANSACTIONS}/${editingTransaction.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            tipo: editForm.tipo,
            valor: parseFloat(editForm.valor),
            descricao: editForm.descricao,
            categoria: editForm.categoria, // padronizado
            data: editForm.data,
            observacoes: '',
            recorrente: editForm.recorrente
          })
        }
      );

      if (response.success) {
        // Atualizar lista local
        setTransactions(prev => prev.map(t => 
          t.id === editingTransaction.id 
            ? { 
                ...t, 
                tipo: editForm.tipo,
                valor: parseFloat(editForm.valor),
                descricao: editForm.descricao,
                categoria: categories.find(cat => cat.id === editForm.categoria)
                  ? { id: editForm.categoria, nome: categories.find(cat => cat.id === editForm.categoria)!.nome }
                  : (typeof editForm.categoria === 'string' ? { id: editForm.categoria, nome: 'Sem categoria' } : undefined),
                data: editForm.data,
                recorrente: editForm.recorrente
              }
            : t
        ));
        setEditingTransaction(null);
        toast({
          title: "Sucesso",
          description: "Transação atualizada com sucesso!",
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar transação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    try {
      const response = await makeApiRequest(
        `${API_ENDPOINTS.TRANSACTIONS}/${id}`,
        {
          method: 'DELETE'
        }
      );

      if (response.success) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        toast({
          title: "Sucesso",
          description: "Transação excluída com sucesso!",
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir transação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Configuração das colunas da tabela
  const tableColumns = [
    {
      key: "tipo",
      label: "Tipo",
      render: (value: string) => (
        <Badge variant={value === "receita" ? "default" : "destructive"}>
          {value === "receita" ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {value === "receita" ? "Receita" : "Despesa"}
        </Badge>
      )
    },
    {
      key: "descricao",
      label: "Descrição",
      sortable: true
    },
    {
      key: "categoria",
      label: "Categoria",
      hideOnMobile: true,
      render: (value: any, row: Transaction) => {
        return row.categoria?.nome || "Sem categoria";
      }
    },
    {
      key: "valor",
      label: "Valor",
      sortable: true,
      render: (value: number, row: Transaction) => (
        <span className={`font-medium ${
          row.tipo === "receita" ? "text-green-600" : "text-red-600"
        }`}>
          {formatCurrency(value)}
        </span>
      )
    },
    {
      key: "data",
      label: "Data",
      sortable: true,
      hideOnMobile: true,
      render: (value: string) => {
        try {
          return new Date(value).toLocaleDateString('pt-BR');
        } catch {
          return 'Data inválida';
        }
      }
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-4 lg:p-6">
        <HistoricoSkeleton />
      </div>
    );
  }

  return (
    <PageLayout
      title="Histórico de Transações"
      subtitle="Visualize e gerencie todas as suas transações"
      actions={
        <Button asChild>
          <Link to="/lancamento">
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Link>
        </Button>
      }
    >
      {/* Cards de Resumo */}
      <StatsGrid>
        <SummaryCard
          title="Total de Transações"
          value={filteredTransactions.length}
          icon={<Calendar className="h-4 w-4" />}
          trend="neutral"
          description="Transações encontradas"
          formatAsCurrency={false}
        />
        <SummaryCard
          title="Total Receitas"
          value={getTotalIncome()}
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
          description="Receitas no período"
        />
        <SummaryCard
          title="Total Despesas"
          value={getTotalExpense()}
          icon={<TrendingDown className="h-4 w-4" />}
          trend="down"
          description="Despesas no período"
        />
        <SummaryCard
          title="Saldo Líquido"
          value={getTotalIncome() - getTotalExpense()}
          icon={<DollarSign className="h-4 w-4" />}
          trend={getTotalIncome() - getTotalExpense() >= 0 ? "up" : "down"}
          description="Resultado do período"
        />
      </StatsGrid>

      {/* Filtros */}
      <ResponsiveCard 
        title="Filtros de Pesquisa"
        description="Use os filtros para encontrar transações específicas"
        className="mb-6"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </ResponsiveCard>

      {/* Tabela Responsiva de Transações */}
      <ResponsiveTable
        data={filteredTransactions}
        columns={tableColumns}
        searchable={false} // Já temos search customizado
        filterable={true}
        exportable={true}
        emptyMessage="Nenhuma transação encontrada. Ajuste os filtros ou adicione novas transações."
        searchKeys={["descricao", "categoria"]}
        actions={(row: Transaction) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditTransaction(row)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteTransaction(row.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      />

      {/* Dialog de Edição */}
      <Dialog open={editingTransaction !== null} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={editForm.tipo} onValueChange={(value: 'receita' | 'despesa') => setEditForm({ ...editForm, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={editForm.valor}
                onChange={(e) => setEditForm({ ...editForm, valor: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={editForm.descricao}
                onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={editForm.categoria} onValueChange={(value) => setEditForm({ ...editForm, categoria: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(cat => cat.tipo === editForm.tipo)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={editForm.data}
                onChange={(e) => setEditForm({ ...editForm, data: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recorrente"
                checked={editForm.recorrente}
                onChange={(e) => setEditForm({ ...editForm, recorrente: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="recorrente" className="text-sm font-medium">
                Transação recorrente
              </Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingTransaction(null)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUpdateTransaction}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default HistoricoUpdated;
