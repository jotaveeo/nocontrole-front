import { useState, useEffect } from "react";
import { Receipt, Plus, Trash2, Edit, Calendar, Loader2 } from "lucide-react";
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
import { DividasSkeleton } from "@/components/skeletons";

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

interface Debt {
  _id: string;
  descricao: string;
  credor: string;
  valorTotal: number;
  valorPago: number;
  dataVencimento: string;
  parcelaAtual: number;
  totalParcelas: number;
  valorParcela: number;
  status: string;
  valorRestante?: number;
  progresso?: number;
  vencida?: boolean;
  diasVencimento?: number;
  categoria?: string;
  juros?: number;
  proximaRevisao?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DividasNew = () => {
  const { toast } = useToast();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<string | null>(null);

  // Garante que ao setar editingDebt, o Dialog abre
  useEffect(() => {
    if (editingDebt) {
      setIsDialogOpen(true);
    }
  }, [editingDebt]);

  const [formData, setFormData] = useState({
    descricao: "",
    credor: "",
    valorTotal: "",
    valorPago: "",
    dataVencimento: "",
    parcelaAtual: "",
    totalParcelas: "",
    valorParcela: "",
    status: "ativa",
  });

  // Carregar dívidas da API
  useEffect(() => {
    const fetchDebts = async () => {
      try {
        const data = await makeApiRequest(API_ENDPOINTS.DEBTS);
        if (data.success) {
          // Verificar se a resposta é da nova API com paginação
          const debtsArray = data.data?.data || data.data || [];
          // Mapear campos se necessário (MongoDB → Frontend)
          const mappedDebts = Array.isArray(debtsArray) ? debtsArray.map(debt => ({
            _id: debt._id || debt.id,
            descricao: debt.descricao || debt.description,
            credor: debt.credor || debt.creditor,
            valorTotal: debt.valorTotal || debt.totalValue,
            valorPago: debt.valorPago || debt.paidValue || 0,
            dataVencimento: debt.dataVencimento || debt.dueDate,
            parcelaAtual: debt.parcelaAtual || debt.currentInstallment || 1,
            totalParcelas: debt.totalParcelas || debt.totalInstallments || debt.parcelas || 1,
            valorParcela: debt.valorParcela || debt.installmentValue,
            status: ["ativa", "paga", "vencida", "negociada"].includes(debt.status) ? debt.status : "ativa",
            valorRestante: debt.valorRestante,
            progresso: debt.progresso,
            vencida: debt.vencida,
            diasVencimento: debt.diasVencimento,
            categoria: debt.categoria,
            juros: debt.juros,
            proximaRevisao: debt.proximaRevisao,
            createdAt: debt.createdAt,
            updatedAt: debt.updatedAt,
          })) : [];
          setDebts(mappedDebts);
        }
      } catch (error) {
        console.error('Erro ao carregar dívidas:', error);
        toast({
          title: "Erro ao carregar dívidas",
          description: "Não foi possível carregar as dívidas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDebts();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Garante que o status enviado é válido
      const statusValido = ["ativa", "paga", "vencida", "negociada"].includes(formData.status)
        ? formData.status
        : "ativa";
      const debtData = {
        descricao: formData.descricao,
        credor: formData.credor,
        valorTotal: parseFloat(formData.valorTotal),
        valorPago: parseFloat(formData.valorPago) || 0,
        dataVencimento: formData.dataVencimento,
        parcelaAtual: parseInt(formData.parcelaAtual) || 1,
        totalParcelas: parseInt(formData.totalParcelas) || 1,
        valorParcela: parseFloat(formData.valorParcela),
        status: statusValido,
      };

      // Validação
      if (debtData.valorTotal <= 0) {
        toast({
          title: "Valor total inválido",
          description: "O valor total deve ser maior que zero.",
          variant: "destructive",
        });
        return;
      }

      if (debtData.valorPago > debtData.valorTotal) {
        toast({
          title: "Valor pago inválido",
          description: "O valor pago não pode ser maior que o valor total.",
          variant: "destructive",
        });
        return;
      }

      if (debtData.parcelaAtual > debtData.totalParcelas) {
        toast({
          title: "Parcela atual inválida",
          description: "A parcela atual não pode ser maior que o total de parcelas.",
          variant: "destructive",
        });
        return;
      }

      if (editingDebt) {
        // Atualizar dívida existente
        const data = await makeApiRequest(`${API_ENDPOINTS.DEBTS}/${editingDebt}`, {
          method: 'PUT',
          body: JSON.stringify(debtData),
        });
        if (data.success && data.data) {
          setDebts(prevDebts => {
            if (!Array.isArray(prevDebts)) return [{ ...data.data }];
            // Atualiza a dívida editada e mantém a ordem
            return prevDebts.map(debt =>
              debt._id === data.data._id ? { ...debt, ...data.data } : debt
            );
          });
          toast({
            title: "Dívida atualizada",
            description: "A dívida foi editada com sucesso.",
          });
        } else {
          toast({
            title: "Erro ao atualizar",
            description: data.message || "Não foi possível atualizar a dívida.",
            variant: "destructive",
          });
        }
      } else {
        // Criar nova dívida
        const data = await makeApiRequest(API_ENDPOINTS.DEBTS, {
          method: 'POST',
          body: JSON.stringify(debtData),
        });
        if (data.success && data.data) {
          // Evita duplicidade caso o backend retorne uma dívida já existente
          setDebts(prevDebts => {
            if (!Array.isArray(prevDebts)) return [data.data];
            if (prevDebts.some(d => d._id === data.data._id)) return prevDebts;
            return [...prevDebts, data.data];
          });
          toast({
            title: "Dívida criada",
            description: "A nova dívida foi adicionada com sucesso.",
          });
        } else {
          toast({
            title: "Erro ao criar",
            description: data.message || "Não foi possível criar a dívida.",
            variant: "destructive",
          });
        }
      }

      setFormData({
        descricao: "",
        credor: "",
        valorTotal: "",
        valorPago: "",
        dataVencimento: "",
        parcelaAtual: "",
        totalParcelas: "",
        valorParcela: "",
        status: "ativa",
      });
      setEditingDebt(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar dívida:', error);
      toast({
        title: "Erro ao salvar dívida",
        description: "Não foi possível salvar a dívida.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDebt = async (debtId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta dívida?')) return;
    try {
      const data = await makeApiRequest(`${API_ENDPOINTS.DEBTS}/${debtId}`, {
        method: 'DELETE',
      });
      if (data.success) {
        setDebts(prevDebts => {
          if (!Array.isArray(prevDebts)) return [];
          // Remove a dívida da lista
          return prevDebts.filter(debt => debt._id !== debtId);
        });
        // Se estava editando essa dívida, fecha o dialog e limpa o form
        if (editingDebt === debtId) {
          setEditingDebt(null);
          setIsDialogOpen(false);
          setFormData({
            descricao: "",
            credor: "",
            valorTotal: "",
            valorPago: "",
            dataVencimento: "",
            parcelaAtual: "",
            totalParcelas: "",
            valorParcela: "",
            status: "ativa",
          });
        }
        toast({
          title: "Dívida excluída",
          description: "A dívida foi removida com sucesso.",
        });
      } else {
        toast({
          title: "Erro ao excluir",
          description: data.message || "Não foi possível excluir a dívida.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir dívida:', error);
      toast({
        title: "Erro ao excluir dívida",
        description: "Não foi possível excluir a dívida.",
        variant: "destructive",
      });
    }
  };

  const handleEditDebt = (debt: Debt) => {
    // Garante que o status editável é válido e sempre string
    let statusValido = "ativa";
    if (typeof debt.status === "string" && ["ativa", "paga", "vencida", "negociada"].includes(debt.status)) {
      statusValido = debt.status;
    }
    setFormData({
      descricao: debt.descricao || "",
      credor: debt.credor || "",
      valorTotal: typeof debt.valorTotal === "number" ? debt.valorTotal.toString() : debt.valorTotal ? String(debt.valorTotal) : "",
      valorPago: typeof debt.valorPago === "number" ? debt.valorPago.toString() : debt.valorPago ? String(debt.valorPago) : "",
      dataVencimento: debt.dataVencimento || "",
      parcelaAtual: typeof debt.parcelaAtual === "number" ? debt.parcelaAtual.toString() : debt.parcelaAtual ? String(debt.parcelaAtual) : "",
      totalParcelas: typeof debt.totalParcelas === "number" ? debt.totalParcelas.toString() : debt.totalParcelas ? String(debt.totalParcelas) : "",
      valorParcela: typeof debt.valorParcela === "number" ? debt.valorParcela.toString() : debt.valorParcela ? String(debt.valorParcela) : "",
      status: statusValido,
    });
    setEditingDebt(debt._id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
      case 'ativa':
        return <Badge variant="destructive">Pendente</Badge>;
      case 'parcial':
        return <Badge variant="secondary">Parcial</Badge>;
      case 'pago':
      case 'quitada':
        return <Badge variant="default">Pago</Badge>;
      case 'vencida':
        return <Badge variant="destructive">Vencida</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgressPercentage = (debt: Debt) => {
    if (typeof debt.progresso === 'number') return Math.round(debt.progresso);
    if (debt.valorTotal > 0) return Math.round((debt.valorPago / debt.valorTotal) * 100);
    return 0;
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
                Dívidas
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Controle suas dívidas e parcelas
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Dívida
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingDebt ? "Editar Dívida" : "Nova Dívida"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Input
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        placeholder="Ex: Financiamento do carro"
                        required
                        maxLength={100}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="credor">Credor</Label>
                      <Input
                        id="credor"
                        value={formData.credor}
                        onChange={(e) => setFormData({ ...formData, credor: e.target.value })}
                        placeholder="Ex: Banco do Brasil"
                        required
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="valorTotal">Valor Total</Label>
                      <Input
                        id="valorTotal"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valorTotal}
                        onChange={(e) => setFormData({ ...formData, valorTotal: e.target.value })}
                        placeholder="0,00"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="valorPago">Valor Pago</Label>
                      <Input
                        id="valorPago"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valorPago}
                        onChange={(e) => setFormData({ ...formData, valorPago: e.target.value })}
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="parcelaAtual">Parcela Atual</Label>
                      <Input
                        id="parcelaAtual"
                        type="number"
                        min="1"
                        value={formData.parcelaAtual}
                        onChange={(e) => setFormData({ ...formData, parcelaAtual: e.target.value })}
                        placeholder="1"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="totalParcelas">Total Parcelas</Label>
                      <Input
                        id="totalParcelas"
                        type="number"
                        min="1"
                        value={formData.totalParcelas}
                        onChange={(e) => setFormData({ ...formData, totalParcelas: e.target.value })}
                        placeholder="1"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="valorParcela">Valor Parcela</Label>
                      <Input
                        id="valorParcela"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valorParcela}
                        onChange={(e) => setFormData({ ...formData, valorParcela: e.target.value })}
                        placeholder="0,00"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="dataVencimento">Data Vencimento</Label>
                      <Input
                        id="dataVencimento"
                        type="date"
                        value={formData.dataVencimento}
                        onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativa">Ativa</SelectItem>
                          <SelectItem value="paga">Paga</SelectItem>
                          <SelectItem value="vencida">Vencida</SelectItem>
                          <SelectItem value="negociada">Negociada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingDebt(null);
                        setFormData({
                          descricao: "",
                          credor: "",
                          valorTotal: "",
                          valorPago: "",
                          dataVencimento: "",
                          parcelaAtual: "",
                          totalParcelas: "",
                          valorParcela: "",
                          status: "ativa",
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {editingDebt ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Resumo das Dívidas */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total em Dívidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(debts.reduce((sum, debt) => sum + debt.valorTotal, 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(debts.reduce((sum, debt) => sum + debt.valorPago, 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Restante</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(Array.isArray(debts) ? debts.reduce((sum, debt) => sum + (debt.valorTotal - debt.valorPago), 0) : 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Dívidas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Array.isArray(debts) ? debts.filter(debt => debt.status !== 'pago').length : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Dívidas */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Dívidas</CardTitle>
          </CardHeader>
          <CardContent>
            {debts.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhuma dívida cadastrada.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Registre suas dívidas para ter controle total das suas finanças.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Credor</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead>Parcelas</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(debts) ? debts.map((debt) => (
                      <TableRow key={debt._id}>
                        <TableCell className="font-medium">
                          {debt.descricao}
                          {debt.vencida && (
                            <Badge variant="destructive" className="ml-2">Vencida</Badge>
                          )}
                          {typeof debt.diasVencimento === 'number' && (
                            <Badge variant={debt.diasVencimento <= 3 ? 'destructive' : 'secondary'} className="ml-2">
                              {debt.diasVencimento > 0
                                ? `Vence em ${debt.diasVencimento} dias`
                                : 'Vence hoje'}
                            </Badge>
                          )}
                          {debt.categoria && (
                            <Badge variant="secondary" className="ml-2">{debt.categoria}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{debt.credor}</TableCell>
                        <TableCell>
                          {formatCurrency(debt.valorTotal)}
                          {typeof debt.valorRestante === 'number' && (
                            <div className="text-xs text-muted-foreground">Restante: {formatCurrency(debt.valorRestante)}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${getProgressPercentage(debt)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {getProgressPercentage(debt)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {debt.parcelaAtual}/{debt.totalParcelas}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(debt.dataVencimento)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(debt.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditDebt(debt)}
                              title="Editar dívida"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteDebt(debt._id)}
                              title="Excluir dívida"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nenhuma dívida encontrada
                        </TableCell>
                      </TableRow>
                    )}
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

export default DividasNew;
