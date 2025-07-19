import { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  Home,
  Utensils,
  Gamepad2,
  Music,
  Car,
  Heart,
  Smartphone,
  Wifi,
  ShoppingBag,
  Coffee,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, makeApiRequest } from "@/lib/api";

interface FixedExpense {
  id: string;
  descricao: string;
  valor: number;
  diaVencimento: number;
  categoria_id: string;
  ativo: boolean;
  observacoes?: string;
}

interface Category {
  id: string;
  nome: string;
  cor: string;
  tipo: 'receita' | 'despesa';
}

const categoryIcons = {
  "Casa": Home,
  "Alimentação": Utensils,
  "Transporte": Car,
  "Saúde": Heart,
  "Educação": Coffee,
  "Lazer": Gamepad2,
  "Assinaturas": Music,
  "Tecnologia": Smartphone,
  "Internet": Wifi,
  "Compras": ShoppingBag,
  "Outros": AlertCircle,
};

const GastosFixosNew = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    valor: "",
    diaVencimento: "",
    categoria: "",
    ativo: true,
    observacoes: "",
  });

  // Carregar gastos fixos e categorias da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar gastos fixos
        const expensesData = await makeApiRequest(API_ENDPOINTS.FIXED_EXPENSES);
        if (expensesData.success) {
          // Verificar se a resposta é da nova API com paginação
          const expensesArray = expensesData.data?.data || expensesData.data || [];
          // Mapear campos se necessário (MongoDB → Frontend)
          const mappedExpenses = Array.isArray(expensesArray) ? expensesArray.map(expense => ({
            id: expense.id || expense._id,
            descricao: expense.descricao || expense.description,
            valor: expense.valor || expense.value || expense.amount,
            diaVencimento: expense.diaVencimento || expense.dueDay,
            categoria_id: expense.categoria_id || expense.category_id,
            ativo: expense.ativo !== undefined ? expense.ativo : expense.active !== undefined ? expense.active : true,
            observacoes: expense.observacoes || expense.notes
          })) : [];
          setExpenses(mappedExpenses);
        }

        // Carregar categorias
        const categoriesData = await makeApiRequest(API_ENDPOINTS.CATEGORIES);
        if (categoriesData.success) {
          const categoriesArray = categoriesData.data?.categorias || categoriesData.data?.data || categoriesData.data || [];
          // Mapear campos se necessário
          const mappedCategories = Array.isArray(categoriesArray) ? categoriesArray.map(cat => ({
            id: cat.id || cat._id,
            nome: cat.nome || cat.name,
            cor: cat.cor || cat.color,
            tipo: cat.tipo || cat.type
          })) : [];
          setCategories(mappedCategories.filter((cat: Category) => cat.tipo === 'despesa'));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os gastos fixos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const expenseData = {
        descricao: formData.nome,
        valor: parseFloat(formData.valor),
        diaVencimento: parseInt(formData.diaVencimento),
        categoria_id: formData.categoria,
        ativo: formData.ativo,
        observacoes: formData.observacoes || null,
      };

      // Validação
      if (expenseData.valor <= 0) {
        toast({
          title: "Valor inválido",
          description: "O valor deve ser maior que zero.",
          variant: "destructive",
        });
        return;
      }

      if (expenseData.diaVencimento < 1 || expenseData.diaVencimento > 31) {
        toast({
          title: "Dia de vencimento inválido",
          description: "O dia deve estar entre 1 e 31.",
          variant: "destructive",
        });
        return;
      }

      if (editingExpense) {
        // Atualizar gasto existente
        const data = await makeApiRequest(`${API_ENDPOINTS.FIXED_EXPENSES}/${editingExpense}`, {
          method: 'PUT',
          body: JSON.stringify(expenseData),
        });
        
        if (data.success) {
          setExpenses(expenses.map(expense => 
            expense.id === editingExpense ? { ...expense, ...expenseData } : expense
          ));
          toast({
            title: "Gasto atualizado",
            description: "O gasto fixo foi editado com sucesso.",
          });
        }
      } else {
        // Criar novo gasto
        const data = await makeApiRequest(API_ENDPOINTS.FIXED_EXPENSES, {
          method: 'POST',
          body: JSON.stringify(expenseData),
        });
        
        if (data.success) {
          setExpenses([...expenses, data.data]);
          toast({
            title: "Gasto criado",
            description: "O novo gasto fixo foi adicionado com sucesso.",
          });
        }
      }

      setFormData({
        nome: "",
        valor: "",
        diaVencimento: "",
        categoria: "",
        ativo: true,
        observacoes: "",
      });
      setEditingExpense(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar gasto:', error);
      toast({
        title: "Erro ao salvar gasto",
        description: "Não foi possível salvar o gasto fixo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Tem certeza que deseja excluir este gasto fixo?')) return;
    
    try {
      const data = await makeApiRequest(`${API_ENDPOINTS.FIXED_EXPENSES}/${expenseId}`, {
        method: 'DELETE',
      });
      
      if (data.success) {
        setExpenses(expenses.filter(expense => expense.id !== expenseId));
        toast({
          title: "Gasto excluído",
          description: "O gasto fixo foi removido com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir gasto:', error);
      toast({
        title: "Erro ao excluir gasto",
        description: "Não foi possível excluir o gasto fixo.",
        variant: "destructive",
      });
    }
  };

  const handleEditExpense = (expense: FixedExpense) => {
    setFormData({
      nome: expense.descricao,
      valor: expense.valor.toString(),
      diaVencimento: expense.diaVencimento.toString(),
      categoria: expense.categoria_id,
      ativo: expense.ativo,
      observacoes: expense.observacoes || "",
    });
    setEditingExpense(expense.id);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (expenseId: string) => {
    try {
      const expense = expenses.find(e => e.id === expenseId);
      if (!expense) return;

      const data = await makeApiRequest(`${API_ENDPOINTS.FIXED_EXPENSES}/${expenseId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...expense,
          ativo: !expense.ativo,
        }),
      });
      
      if (data.success) {
        setExpenses(expenses.map(e => 
          e.id === expenseId ? { ...e, ativo: !e.ativo } : e
        ));
        toast({
          title: expense.ativo ? "Gasto desativado" : "Gasto ativado",
          description: `O gasto fixo foi ${expense.ativo ? 'desativado' : 'ativado'} com sucesso.`,
        });
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do gasto fixo.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.nome || 'Categoria não encontrada';
  };

  const getCategoryIcon = (categoryId: string) => {
    const categoryName = getCategoryName(categoryId);
    const IconComponent = categoryIcons[categoryName as keyof typeof categoryIcons] || AlertCircle;
    return <IconComponent className="h-4 w-4" />;
  };

  const getTotalActiveExpenses = () => {
    return expenses
      .filter(expense => expense.ativo)
      .reduce((sum, expense) => sum + expense.valor, 0);
  };

  const getTotalInactiveExpenses = () => {
    return expenses
      .filter(expense => !expense.ativo)
      .reduce((sum, expense) => sum + expense.valor, 0);
  };

  const getUpcomingExpenses = () => {
    const today = new Date();
    const currentDay = today.getDate();
    
    return expenses
      .filter(expense => expense.ativo && expense.diaVencimento >= currentDay)
      .sort((a, b) => a.diaVencimento - b.diaVencimento)
      .slice(0, 3);
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
                Gastos Fixos
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Gerencie suas despesas recorrentes mensais
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Gasto Fixo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingExpense ? "Editar Gasto Fixo" : "Novo Gasto Fixo"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingExpense ? "Edite as informações do gasto fixo." : "Adicione um novo gasto fixo recorrente."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Ex: Aluguel"
                        required
                        maxLength={100}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="valor">Valor</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valor}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                        placeholder="0,00"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="diaVencimento">Dia de Vencimento</Label>
                      <Select
                        value={formData.diaVencimento}
                        onValueChange={(value) => setFormData({ ...formData, diaVencimento: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o dia" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()}>
                              Dia {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="categoria">Categoria</Label>
                      <Select
                        value={formData.categoria}
                        onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Input
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      placeholder="Observações opcionais"
                      maxLength={255}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ativo"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="ativo" className="text-sm font-medium">
                      Gasto ativo
                    </Label>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingExpense(null);
                        setFormData({
                          nome: "",
                          valor: "",
                          diaVencimento: "",
                          categoria: "",
                          ativo: true,
                          observacoes: "",
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {editingExpense ? "Atualizar" : "Criar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Gastos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(getTotalActiveExpenses())}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Gastos Inativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {formatCurrency(getTotalInactiveExpenses())}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Gastos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {expenses.filter(e => e.ativo).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {expenses.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximos Vencimentos */}
        {getUpcomingExpenses().length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Vencimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getUpcomingExpenses().map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(expense.categoria_id)}
                      <div>
                        <div className="font-medium">{expense.descricao}</div>
                        <div className="text-sm text-muted-foreground">
                          Vence dia {expense.diaVencimento}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">
                        {formatCurrency(expense.valor)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Gastos Fixos */}
        <Card>
          <CardHeader>
            <CardTitle>Seus Gastos Fixos</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhum gasto fixo cadastrado.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Adicione seus gastos recorrentes para um melhor controle financeiro.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.descricao}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(expense.categoria_id)}
                            <span>{getCategoryName(expense.categoria_id)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-red-600">
                          {formatCurrency(expense.valor)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            Dia {expense.diaVencimento}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={expense.ativo ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleToggleStatus(expense.id)}
                          >
                            {expense.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {expense.observacoes || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditExpense(expense)}
                              title="Editar gasto"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteExpense(expense.id)}
                              title="Excluir gasto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GastosFixosNew;
