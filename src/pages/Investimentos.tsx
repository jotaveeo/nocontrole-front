import { useState, useEffect } from "react";
import { TrendingUp, Plus, Trash2, Edit, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, safeSum, parseToNumber } from "@/utils/formatters";
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
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, makeApiRequest } from "@/lib/api";

interface Investment {
  id: string;
  nome: string;
  tipo: string;
  valorInvestido: number;
  valorAtual: number;
  dataInvestimento: string;
  rentabilidade: number;
  instituicao: string;
  ativo: boolean;
}

const investmentTypes = [
  "Renda Fixa",
  "Renda Variável",
  "Fundo Imobiliário",
  "Previdência",
  "Cripto",
  "Outro",
];

const InvestimentosNew = () => {
  const { toast } = useToast();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    tipo: "",
    valorInvestido: "",
    valorAtual: "",
    dataInvestimento: "",
    rentabilidade: "",
    instituicao: "",
  });

  // Carregar investimentos da API
  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const data = await makeApiRequest(API_ENDPOINTS.INVESTMENTS);
        if (data.success) {
          // Tratar resposta paginada ou array direto
          const investmentsArray = data.data?.data || data.data || [];
          // Mapear campos se necessário (MongoDB → Frontend)
          const mappedInvestments = Array.isArray(investmentsArray) ? investmentsArray.map(inv => ({
            id: inv.id || inv._id,
            nome: inv.nome || inv.descricao || inv.name,
            tipo: inv.tipo || inv.type,
            valorInvestido: inv.valorInvestido || inv.investedValue,
            valorAtual: inv.valorAtual || inv.currentValue,
            dataInvestimento: inv.dataInvestimento || inv.dataCompra || inv.investmentDate,
            rentabilidade: inv.rentabilidade || inv.profitability || 0,
            instituicao: inv.instituicao || inv.institution || inv.corretora,
            ativo: inv.ativo !== undefined ? inv.ativo : inv.active !== undefined ? inv.active : true
          })) : [];
          setInvestments(mappedInvestments);
        }
      } catch (error) {
        console.error('Erro ao carregar investimentos:', error);
        toast({
          title: "Erro ao carregar investimentos",
          description: "Não foi possível carregar os investimentos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const investmentData = {
        nome: formData.nome,
        tipo: formData.tipo,
        valorInvestido: parseToNumber(formData.valorInvestido),
        valorAtual: parseToNumber(formData.valorAtual) || parseToNumber(formData.valorInvestido),
        dataInvestimento: formData.dataInvestimento,
        rentabilidade: parseToNumber(formData.rentabilidade) || 0,
        instituicao: formData.instituicao,
      };

      // Validação
      if (investmentData.valorInvestido <= 0) {
        toast({
          title: "Valor investido inválido",
          description: "O valor investido deve ser maior que zero.",
          variant: "destructive",
        });
        return;
      }

      if (investmentData.valorAtual < 0) {
        toast({
          title: "Valor atual inválido",
          description: "O valor atual não pode ser negativo.",
          variant: "destructive",
        });
        return;
      }

      if (editingInvestment) {
        // Atualizar investimento existente
        const data = await makeApiRequest(`${API_ENDPOINTS.INVESTMENTS}/${editingInvestment}`, {
          method: 'PUT',
          body: JSON.stringify(investmentData),
        });
        
        if (data.success) {
          setInvestments(investments.map(inv => 
            inv.id === editingInvestment ? { ...inv, ...investmentData } : inv
          ));
          toast({
            title: "Investimento atualizado",
            description: "O investimento foi editado com sucesso.",
          });
        }
      } else {
        // Criar novo investimento
        const data = await makeApiRequest(API_ENDPOINTS.INVESTMENTS, {
          method: 'POST',
          body: JSON.stringify(investmentData),
        });
        
        if (data.success) {
          setInvestments([...investments, data.data]);
          toast({
            title: "Investimento criado",
            description: "O novo investimento foi adicionado com sucesso.",
          });
        }
      }

      setFormData({
        nome: "",
        tipo: "",
        valorInvestido: "",
        valorAtual: "",
        dataInvestimento: "",
        rentabilidade: "",
        instituicao: "",
      });
      setEditingInvestment(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar investimento:', error);
      toast({
        title: "Erro ao salvar investimento",
        description: "Não foi possível salvar o investimento.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInvestment = async (investmentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este investimento?')) return;
    
    try {
      const data = await makeApiRequest(`${API_ENDPOINTS.INVESTMENTS}/${investmentId}`, {
        method: 'DELETE',
      });
      
      if (data.success) {
        setInvestments(investments.filter(inv => inv.id !== investmentId));
        toast({
          title: "Investimento excluído",
          description: "O investimento foi removido com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir investimento:', error);
      toast({
        title: "Erro ao excluir investimento",
        description: "Não foi possível excluir o investimento.",
        variant: "destructive",
      });
    }
  };

  const handleEditInvestment = (investment: Investment) => {
    setFormData({
      nome: investment.nome,
      tipo: investment.tipo,
      valorInvestido: investment.valorInvestido.toString(),
      valorAtual: investment.valorAtual.toString(),
      dataInvestimento: investment.dataInvestimento,
      rentabilidade: investment.rentabilidade.toString(),
      instituicao: investment.instituicao,
    });
    setEditingInvestment(investment.id);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getReturnPercentage = (investment: Investment) => {
    const returnValue = investment.valorAtual - investment.valorInvestido;
    const returnPercentage = (returnValue / investment.valorInvestido) * 100;
    return returnPercentage;
  };

  const getReturnBadge = (investment: Investment) => {
    const returnPercentage = getReturnPercentage(investment);
    
    if (returnPercentage > 0) {
      return (
        <Badge variant="default" className="bg-green-500 text-white">
          +{returnPercentage.toFixed(2)}%
        </Badge>
      );
    } else if (returnPercentage < 0) {
      return (
        <Badge variant="destructive">
          {returnPercentage.toFixed(2)}%
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          0,00%
        </Badge>
      );
    }
  };

  const getTotalInvested = () => {
    return safeSum(investments.map(inv => parseToNumber(inv.valorInvestido)));
  };

  const getTotalCurrentValue = () => {
    return safeSum(investments.map(inv => parseToNumber(inv.valorAtual)));
  };

  const getTotalReturn = () => {
    return getTotalCurrentValue() - getTotalInvested();
  };

  const getTotalReturnPercentage = () => {
    const totalInvested = getTotalInvested();
    if (totalInvested === 0) return 0;
    return (getTotalReturn() / totalInvested) * 100;
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
                Investimentos
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Acompanhe seus investimentos e rentabilidade
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Investimento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingInvestment ? "Editar Investimento" : "Novo Investimento"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nome">Nome do Investimento</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Ex: Tesouro Selic 2029"
                        required
                        maxLength={100}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="instituicao">Instituição</Label>
                      <Input
                        id="instituicao"
                        value={formData.instituicao}
                        onChange={(e) => setFormData({ ...formData, instituicao: e.target.value })}
                        placeholder="Ex: Clear, XP, BTG"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {investmentTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="rentabilidade">Rentabilidade (%)</Label>
                      <Input
                        id="rentabilidade"
                        type="number"
                        step="0.01"
                        value={formData.rentabilidade}
                        onChange={(e) => setFormData({ ...formData, rentabilidade: e.target.value })}
                        placeholder="Ex: 12.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="valorInvestido">Valor Investido</Label>
                      <Input
                        id="valorInvestido"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valorInvestido}
                        onChange={(e) => setFormData({ ...formData, valorInvestido: e.target.value })}
                        placeholder="0,00"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="valorAtual">Valor Atual</Label>
                      <Input
                        id="valorAtual"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valorAtual}
                        onChange={(e) => setFormData({ ...formData, valorAtual: e.target.value })}
                        placeholder="0,00"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="dataInvestimento">Data do Investimento</Label>
                      <Input
                        id="dataInvestimento"
                        type="date"
                        value={formData.dataInvestimento}
                        onChange={(e) => setFormData({ ...formData, dataInvestimento: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingInvestment(null);
                        setFormData({
                          nome: "",
                          tipo: "",
                          valorInvestido: "",
                          valorAtual: "",
                          dataInvestimento: "",
                          rentabilidade: "",
                          instituicao: "",
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {editingInvestment ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Resumo dos Investimentos */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(getTotalInvested())}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(getTotalCurrentValue())}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Retorno</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTotalReturn() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {getTotalReturn() >= 0 ? '+' : ''}{formatCurrency(getTotalReturn())}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Rentabilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTotalReturnPercentage() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {getTotalReturnPercentage() >= 0 ? '+' : ''}{getTotalReturnPercentage().toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Investimentos */}
        <Card>
          <CardHeader>
            <CardTitle>Seus Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhum investimento cadastrado.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Adicione seus investimentos para acompanhar sua rentabilidade.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Investimento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor Investido</TableHead>
                      <TableHead>Valor Atual</TableHead>
                      <TableHead>Rentabilidade</TableHead>
                      <TableHead>Data Investimento</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investments.map((investment) => (
                      <TableRow key={investment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{investment.nome}</div>
                            {investment.instituicao && (
                              <div className="text-sm text-muted-foreground">
                                {investment.instituicao}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{investment.tipo}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(investment.valorInvestido)}</TableCell>
                        <TableCell>{formatCurrency(investment.valorAtual)}</TableCell>
                        <TableCell>
                          {investment.rentabilidade}%
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(investment.dataInvestimento)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditInvestment(investment)}
                              title="Editar investimento"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteInvestment(investment.id)}
                              title="Excluir investimento"
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

export default InvestimentosNew;
