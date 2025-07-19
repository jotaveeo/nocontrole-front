import { useState, useEffect } from "react";
import { DollarSign, Plus, Trash2, Edit, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, makeApiRequest } from "@/lib/api";

interface Income {
  id: string;
  fonte: string;
  tipo: string;
  valor: number;
  data: string;
  recorrente: boolean;
  observacoes?: string;
}

const incomeTypes = [
  "Salário",
  "Freelance",
  "Vendas",
  "Apostas",
  "Investimentos",
  "Outros",
];

const ReceitasNew = () => {
  const { toast } = useToast();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fonte: "",
    tipo: "",
    valor: "",
    data: "",
    recorrente: false,
    observacoes: "",
  });

  // Função helper para resetar o formulário
  const resetFormData = () => {
    setFormData({
      fonte: "",
      tipo: "",
      valor: "",
      data: "",
      recorrente: false,
      observacoes: "",
    });
  };

  // Função para controlar abertura/fechamento do dialog
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingIncome(null);
      resetFormData();
    }
  };

  // Carregar receitas da API
  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        console.log('Carregando receitas...');
        const data = await makeApiRequest(API_ENDPOINTS.INCOMES);
        console.log('Dados recebidos da API:', data);
        
        if (data.success) {
          console.log('Receitas carregadas:', data.data);
          // Tratar resposta paginada ou array direto
          const incomesArray = data.data?.data || data.data || [];
          // Mapear campos se necessário (MongoDB → Frontend)
          const mappedIncomes = Array.isArray(incomesArray) ? incomesArray.map(income => ({
            id: income.id || income._id,
            fonte: income.fonte || income.source,
            tipo: income.tipo || income.type,
            valor: income.valor || income.value || income.amount,
            data: income.data || income.dataRecebimento || income.date,
            recorrente: income.recorrente !== undefined ? income.recorrente : income.recurring !== undefined ? income.recurring : false,
            observacoes: income.observacoes || income.notes
          })) : [];
          setIncomes(mappedIncomes);
        } else {
          console.error('API retornou sucesso false:', data);
        }
      } catch (error) {
        console.error('Erro ao carregar receitas:', error);
        toast({
          title: "Erro ao carregar receitas",
          description: "Não foi possível carregar as receitas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIncomes();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const incomeData = {
        fonte: formData.fonte,
        tipo: formData.tipo,
        valor: parseFloat(formData.valor),
        data: formData.data,
        recorrente: formData.recorrente,
        observacoes: formData.observacoes || null,
      };

      // Validação
      if (incomeData.valor <= 0) {
        toast({
          title: "Valor inválido",
          description: "O valor deve ser maior que zero.",
          variant: "destructive",
        });
        return;
      }

      if (editingIncome) {
        // Atualizar receita existente
        const data = await makeApiRequest(`${API_ENDPOINTS.INCOMES}/${editingIncome}`, {
          method: 'PUT',
          body: JSON.stringify(incomeData),
        });
        
        if (data.success) {
          setIncomes(incomes.map(income => 
            income.id === editingIncome ? { ...income, ...incomeData } : income
          ));
          toast({
            title: "Receita atualizada",
            description: "A receita foi editada com sucesso.",
          });
        }
      } else {
        // Criar nova receita
        const data = await makeApiRequest(API_ENDPOINTS.INCOMES, {
          method: 'POST',
          body: JSON.stringify(incomeData),
        });
        
        if (data.success) {
          setIncomes([...incomes, data.data]);
          toast({
            title: "Receita criada",
            description: "A nova receita foi adicionada com sucesso.",
          });
        }
      }

      resetFormData();
      setEditingIncome(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      toast({
        title: "Erro ao salvar receita",
        description: "Não foi possível salvar a receita.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIncome = async (incomeId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta receita?')) return;
    
    try {
      const data = await makeApiRequest(`${API_ENDPOINTS.INCOMES}/${incomeId}`, {
        method: 'DELETE',
      });
      
      if (data.success) {
        setIncomes(incomes.filter(income => income.id !== incomeId));
        toast({
          title: "Receita excluída",
          description: "A receita foi removida com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      toast({
        title: "Erro ao excluir receita",
        description: "Não foi possível excluir a receita.",
        variant: "destructive",
      });
    }
  };

  const handleEditIncome = (income: Income) => {
    setFormData({
      fonte: income.fonte || "",
      tipo: income.tipo || "",
      valor: income.valor ? income.valor.toString() : "",
      data: income.data || "",
      recorrente: income.recorrente || false,
      observacoes: income.observacoes || "",
    });
    setEditingIncome(income.id);
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const getTotalIncome = () => {
    return incomes.reduce((sum, income) => sum + income.valor, 0);
  };

  const getRecurrentIncome = () => {
    return incomes
      .filter(income => income.recorrente)
      .reduce((sum, income) => sum + income.valor, 0);
  };

  const getThisMonthIncome = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return incomes
      .filter(income => {
        try {
          if (!income.data) return false;
          const incomeDate = new Date(income.data);
          if (isNaN(incomeDate.getTime())) return false;
          return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
        } catch (error) {
          console.error('Erro ao filtrar receitas do mês:', error);
          return false;
        }
      })
      .reduce((sum, income) => sum + income.valor, 0);
  };

  const getAverageIncome = () => {
    return incomes.length > 0 ? getTotalIncome() / incomes.length : 0;
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
                Receitas
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Gerencie suas fontes de renda
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Receita
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingIncome ? "Editar Receita" : "Nova Receita"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fonte">Fonte</Label>
                      <Input
                        id="fonte"
                        value={formData.fonte || ""}
                        onChange={(e) => setFormData({ ...formData, fonte: e.target.value })}
                        placeholder="Ex: Salário empresa XYZ"
                        required
                        maxLength={100}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select
                        value={formData.tipo || ""}
                        onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {incomeTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="valor">Valor</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valor || ""}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                        placeholder="0,00"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="data">Data</Label>
                      <Input
                        id="data"
                        type="date"
                        value={formData.data || ""}
                        onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Input
                      id="observacoes"
                      value={formData.observacoes || ""}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      placeholder="Observações opcionais"
                      maxLength={255}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="recorrente"
                      checked={formData.recorrente}
                      onChange={(e) => setFormData({ ...formData, recorrente: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="recorrente" className="text-sm font-medium">
                      Receita recorrente
                    </Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingIncome(null);
                        resetFormData();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {editingIncome ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Resumo das Receitas */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(getTotalIncome())}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Receitas Recorrentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(getRecurrentIncome())}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(getThisMonthIncome())}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Receita Média</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(getAverageIncome())}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Receitas */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            {incomes.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhuma receita cadastrada.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Adicione suas fontes de renda para acompanhar suas entradas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fonte</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Recorrente</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomes
                      .sort((a, b) => {
                        try {
                          const dateA = new Date(a.data);
                          const dateB = new Date(b.data);
                          
                          // Se as datas são inválidas, colocar no final
                          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
                          if (isNaN(dateA.getTime())) return 1;
                          if (isNaN(dateB.getTime())) return -1;
                          
                          return dateB.getTime() - dateA.getTime();
                        } catch (error) {
                          console.error('Erro ao ordenar receitas:', error);
                          return 0;
                        }
                      })
                      .map((income) => (
                        <TableRow key={income.id}>
                          <TableCell className="font-medium">{income.fonte}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{income.tipo}</Badge>
                          </TableCell>
                          <TableCell className="font-bold text-green-600">
                            {formatCurrency(income.valor)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(income.data)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {income.recorrente ? (
                              <Badge variant="secondary">Sim</Badge>
                            ) : (
                              <Badge variant="outline">Não</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {income.observacoes || "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditIncome(income)}
                                title="Editar receita"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteIncome(income.id)}
                                title="Excluir receita"
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

export default ReceitasNew;
