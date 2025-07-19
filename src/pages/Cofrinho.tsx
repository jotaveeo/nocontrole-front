import { useState, useEffect } from "react";
import { PiggyBank, Calendar, BarChart2, Trash2, Plus, Edit, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { formatCurrency, safeSum, parseToNumber } from "@/utils/formatters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, makeApiRequest } from "@/lib/api";

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

interface PiggyBankEntry {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  mes: number;
  ano: number;
}

const CofrinhoNew = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<PiggyBankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    data: new Date().toISOString().split('T')[0], // Data atual como padrão
  });

  // Carregar entradas do cofrinho da API
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await makeApiRequest(API_ENDPOINTS.PIGGY_BANK);
        if (data.success) {
          // Tratar resposta paginada ou array direto
          const entriesArray = data.data?.data || data.data || [];
          const validEntries = Array.isArray(entriesArray) ? entriesArray : [];
          
          // Mapear campos se necessário (MongoDB → Frontend)
          const mappedEntries = validEntries.map((entry: any) => {
            const entryDate = entry.data || entry.date || entry.dataInicio;
            const date = new Date(entryDate);
            
            // Validar data
            const validDate = !isNaN(date.getTime()) ? date : new Date();
            
            return {
              id: entry.id || entry._id,
              descricao: entry.descricao || entry.objetivo || entry.description,
              valor: parseToNumber(entry.valor || entry.valorAtual || entry.amount || entry.value),
              data: entryDate || new Date().toISOString().split('T')[0],
              mes: validDate.getMonth() + 1,
              ano: validDate.getFullYear()
            };
          });
          
          setEntries(mappedEntries);
        } else {
          // Se a API falhar, tentar carregar do localStorage
          const localEntries = JSON.parse(localStorage.getItem('piggyBankEntries') || '[]');
          setEntries(localEntries);
        }
      } catch (error) {
        console.error('Erro ao carregar entradas do cofrinho:', error);
        
        // Fallback para localStorage em caso de erro
        try {
          const localEntries = JSON.parse(localStorage.getItem('piggyBankEntries') || '[]');
          setEntries(localEntries);
        } catch (localError) {
          console.error('Erro ao carregar dados locais:', localError);
          setEntries([]);
        }
        
        toast({
          title: "Erro ao carregar cofrinho",
          description: "Não foi possível carregar as entradas do cofrinho.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validar se a data foi fornecida
      if (!formData.data) {
        toast({
          title: "Data obrigatória",
          description: "Por favor, informe a data da economia.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const date = new Date(formData.data);
      
      // Validar se a data é válida
      if (isNaN(date.getTime())) {
        toast({
          title: "Data inválida",
          description: "Por favor, informe uma data válida.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const entryData = {
        descricao: formData.descricao,
        valor: parseToNumber(formData.valor),
        data: formData.data,
        mes: date.getMonth() + 1,
        ano: date.getFullYear(),
      };

      // Validação
      if (entryData.valor <= 0) {
        toast({
          title: "Valor inválido",
          description: "O valor deve ser maior que zero.",
          variant: "destructive",
        });
        return;
      }

      if (editingEntry) {
        // Atualizar entrada existente
        const data = await makeApiRequest(`${API_ENDPOINTS.PIGGY_BANK}/${editingEntry}`, {
          method: 'PUT',
          body: JSON.stringify(entryData),
        });
        
        if (data.success) {
          setEntries(prevEntries => {
            if (!Array.isArray(prevEntries)) return [{ ...entryData, id: editingEntry }];
            return prevEntries.map(entry => 
              entry.id === editingEntry ? { ...entry, ...entryData } : entry
            );
          });
          toast({
            title: "Entrada atualizada",
            description: "A entrada do cofrinho foi editada com sucesso.",
          });
        }
      } else {
        // Criar nova entrada
        const data = await makeApiRequest(API_ENDPOINTS.PIGGY_BANK, {
          method: 'POST',
          body: JSON.stringify(entryData),
        });
        
        if (data.success) {
          setEntries([...entries, data.data]);
          toast({
            title: "Entrada criada",
            description: "A nova entrada foi adicionada ao cofrinho.",
          });
        }
      }

      setFormData({
        descricao: "",
        valor: "",
        data: new Date().toISOString().split('T')[0], // Manter data atual como padrão
      });
      setEditingEntry(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar entrada:', error);
      toast({
        title: "Erro ao salvar entrada",
        description: "Não foi possível salvar a entrada do cofrinho.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta entrada?')) return;
    
    try {
      const data = await makeApiRequest(`${API_ENDPOINTS.PIGGY_BANK}/${entryId}`, {
        method: 'DELETE',
      });
      
      if (data.success) {
        setEntries(prevEntries => {
          if (!Array.isArray(prevEntries)) return [];
          return prevEntries.filter(entry => entry.id !== entryId);
        });
        toast({
          title: "Entrada excluída",
          description: "A entrada foi removida do cofrinho.",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir entrada:', error);
      toast({
        title: "Erro ao excluir entrada",
        description: "Não foi possível excluir a entrada do cofrinho.",
        variant: "destructive",
      });
    }
  };

  const handleEditEntry = (entry: PiggyBankEntry) => {
    // Validar a data antes de usar
    let validDate = entry.data;
    if (!validDate || isNaN(new Date(validDate).getTime())) {
      console.warn('Data inválida na entrada, usando data atual:', entry);
      validDate = new Date().toISOString().split('T')[0];
    }
    
    setFormData({
      descricao: entry.descricao,
      valor: entry.valor.toString(),
      data: validDate,
    });
    setEditingEntry(entry.id);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return 'Data não informada';
    }
    
    try {
      const date = new Date(dateString);
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        console.warn('Data inválida encontrada:', dateString);
        return 'Data inválida';
      }
      
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error, 'dateString:', dateString);
      return 'Data inválida';
    }
  };

  const getTotal = () => {
    if (!Array.isArray(entries)) return 0;
    return safeSum(entries.map(entry => parseToNumber(entry.valor)));
  };

  const getMonthlyData = () => {
    const monthlyTotals = Array(12).fill(0);
    if (!Array.isArray(entries)) return monthlyTotals;
    
    entries.forEach(entry => {
      // Validar se o mês é válido (1-12)
      if (entry.mes && entry.mes >= 1 && entry.mes <= 12) {
        const valor = parseToNumber(entry.valor);
        monthlyTotals[entry.mes - 1] += valor;
      } else {
        console.warn('Entrada com mês inválido:', entry);
      }
    });
    return monthlyTotals;
  };

  const getCurrentYearTotal = () => {
    if (!Array.isArray(entries)) return 0;
    const currentYear = new Date().getFullYear();
    return safeSum(
      entries
        .filter(entry => entry.ano === currentYear)
        .map(entry => parseToNumber(entry.valor))
    );
  };

  const getLastMonthTotal = () => {
    if (!Array.isArray(entries)) return 0;
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    
    return safeSum(
      entries
        .filter(entry => entry.mes === lastMonth + 1 && entry.ano === year)
        .map(entry => parseToNumber(entry.valor))
    );
  };

  const getThisMonthTotal = () => {
    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const year = now.getFullYear();
    
    return safeSum(
      entries
        .filter(entry => entry.mes === thisMonth && entry.ano === year)
        .map(entry => parseToNumber(entry.valor))
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
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
                Cofrinho
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Acompanhe suas economias mensais
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Entrada
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingEntry ? "Editar Entrada" : "Nova Entrada"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Ex: Economia do mês"
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
                  <div className="grid gap-2">
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingEntry(null);
                        setFormData({
                          descricao: "",
                          valor: "",
                          data: new Date().toISOString().split('T')[0], // Manter data atual como padrão
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {editingEntry ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(getTotal())}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Este Ano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(getCurrentYearTotal())}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(getThisMonthTotal())}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Mês Passado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(getLastMonthTotal())}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Entradas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Suas Economias
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <PiggyBank className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhuma entrada no cofrinho.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Comece a guardar suas economias para alcançar seus objetivos.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Mês/Ano</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries
                      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                      .map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{entry.descricao}</TableCell>
                          <TableCell className="font-bold text-green-600">
                            {formatCurrency(entry.valor)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(entry.data)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {months[entry.mes - 1]} {entry.ano}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditEntry(entry)}
                                title="Editar entrada"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteEntry(entry.id)}
                                title="Excluir entrada"
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

export default CofrinhoNew;
