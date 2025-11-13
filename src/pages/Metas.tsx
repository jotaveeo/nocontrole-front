import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, safeSum, parseToNumber } from "@/utils/formatters";
import { MetasPageSkeleton } from "@/components/skeletons";
import { usePlan } from "@/hooks/usePlan";
import { UpgradeModal } from "@/components/UpgradeModal";
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  Archive,
  CheckCircle,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, makeApiRequest } from "@/lib/api";

interface Goal {
  id: string;
  nome: string;
  valorAlvo: number | string;
  valorAtual: number | string;
  prazo: string;
  descricao?: string;
  ativo: boolean;
  dataCriacao: string;
}

const Metas = () => {
  const { toast } = useToast();
  const { hasReachedLimit } = usePlan();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    valorAlvo: "",
    valorAtual: "",
    prazo: "",
    descricao: "",
    ativo: true,
  });

  // Carregar metas da API
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const data = await makeApiRequest(API_ENDPOINTS.GOALS);
        if (data.success) {
          // Tratar resposta paginada ou array direto
          const goalsArray = data.data?.data || data.data || [];
          // Mapear campos se necessário (MongoDB → Frontend)
          const mappedGoals = Array.isArray(goalsArray) ? goalsArray.map(goal => ({
            id: goal.id || goal._id,
            nome: goal.nome || goal.titulo || goal.title,
            valorAlvo: goal.valorAlvo || goal.valorMeta || goal.targetValue,
            valorAtual: goal.valorAtual || goal.currentValue,
            prazo: goal.prazo || goal.dataFim || goal.endDate,
            descricao: goal.descricao || goal.description,
            ativo: goal.ativo !== undefined ? goal.ativo : goal.active !== undefined ? goal.active : true,
            dataCriacao: goal.dataCriacao || goal.dataInicio || goal.createdAt
          })) : [];
          setGoals(mappedGoals);
        }
      } catch (error) {
        console.error('Erro ao carregar metas:', error);
        toast({
          title: "Erro ao carregar metas",
          description: "Não foi possível carregar as metas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ⚠️ VERIFICAÇÃO DE LIMITE DO PLANO FREE (apenas ao criar nova meta)
    if (!editingGoal) {
      const limitCheck = hasReachedLimit('goals');
      if (limitCheck.reached) {
        toast({
          title: "Limite atingido",
          description: `Você atingiu o limite de ${limitCheck.limit} metas do plano FREE. Faça upgrade para criar mais metas.`,
          variant: "destructive",
        });
        setShowUpgradeModal(true);
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(true);

    try {
      const goalData = {
        nome: formData.nome,
        valorAlvo: parseToNumber(formData.valorAlvo),
        valorAtual: parseToNumber(formData.valorAtual || "0"),
        prazo: formData.prazo,
        descricao: formData.descricao || null,
        ativo: formData.ativo,
      };

      if (editingGoal) {
        // Atualizar meta existente
        const data = await makeApiRequest(`${API_ENDPOINTS.GOALS}/${editingGoal}`, {
          method: 'PUT',
          body: JSON.stringify(goalData),
        });
        
        if (data.success) {
          setGoals(Array.isArray(goals) ? goals.map(goal => 
            goal.id === editingGoal ? { ...goal, ...goalData } : goal
          ) : []);
          toast({
            title: "Meta atualizada",
            description: "A meta foi editada com sucesso.",
          });
        }
      } else {
        // Criar nova meta
        const data = await makeApiRequest(API_ENDPOINTS.GOALS, {
          method: 'POST',
          body: JSON.stringify(goalData),
        });
        
        if (data.success) {
          setGoals([...goals, data.data]);
          toast({
            title: "Meta criada",
            description: "A nova meta foi adicionada com sucesso.",
          });
        }
      }

      setFormData({
        nome: "",
        valorAlvo: "",
        valorAtual: "",
        prazo: "",
        descricao: "",
        ativo: true,
      });
      setEditingGoal(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      toast({
        title: "Erro ao salvar meta",
        description: "Não foi possível salvar a meta.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;
    
    try {
      const data = await makeApiRequest(`${API_ENDPOINTS.GOALS}/${goalId}`, {
        method: 'DELETE',
      });
      
      if (data.success) {
        setGoals(Array.isArray(goals) ? goals.filter(goal => goal.id !== goalId) : []);
        toast({
          title: "Meta excluída",
          description: "A meta foi removida com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      toast({
        title: "Erro ao excluir meta",
        description: "Não foi possível excluir a meta.",
        variant: "destructive",
      });
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setFormData({
      nome: goal.nome,
      valorAlvo: (goal.valorAlvo || 0).toString(),
      valorAtual: (goal.valorAtual || 0).toString(),
      prazo: goal.prazo,
      descricao: goal.descricao || "",
      ativo: goal.ativo,
    });
    setEditingGoal(goal.id);
    setIsDialogOpen(true);
  };

  const handleUpdateProgress = async (goalId: string, newValue: number) => {
    try {
      const goal = Array.isArray(goals) ? goals.find(g => g.id === goalId) : null;
      if (!goal) return;

      const data = await makeApiRequest(`${API_ENDPOINTS.GOALS}/${goalId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...goal,
          valorAtual: newValue,
        }),
      });
      
      if (data.success) {
        setGoals(Array.isArray(goals) ? goals.map(g => 
          g.id === goalId ? { ...g, valorAtual: newValue } : g
        ) : []);
        toast({
          title: "Progresso atualizado",
          description: "O progresso da meta foi atualizado.",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro ao atualizar progresso",
        description: "Não foi possível atualizar o progresso.",
        variant: "destructive",
      });
    }
  };

  const activeGoals = Array.isArray(goals) ? goals.filter(goal => goal.ativo) : [];
  const completedGoals = Array.isArray(goals) ? goals.filter(goal => !goal.ativo || parseToNumber(goal.valorAtual) >= parseToNumber(goal.valorAlvo)) : [];

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const valorAtual = parseToNumber(goal.valorAtual);
    const valorAlvo = parseToNumber(goal.valorAlvo);
    const progress = valorAlvo > 0 ? (valorAtual / valorAlvo) * 100 : 0;
    const isCompleted = progress >= 100;
    const isOverdue = new Date(goal.prazo) < new Date() && !isCompleted;

    return (
      <Card className={
        isCompleted
          ? 'border-green-200 bg-green-50 dark:bg-[#232136]'
          : isOverdue
          ? 'border-red-200 bg-red-50 dark:bg-[#2a1a1a]'
          : ''
      }>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{goal.nome}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isCompleted ? "default" : isOverdue ? "destructive" : "secondary"}>
                {isCompleted ? "Concluída" : isOverdue ? "Vencida" : "Ativa"}
              </Badge>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleEditGoal(goal)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteGoal(goal.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progresso</span>
                <span className="text-sm font-bold">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Atual: {formatCurrency(valorAtual)}</span>
              <span>Meta: {formatCurrency(valorAlvo)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Prazo: {new Date(goal.prazo).toLocaleDateString('pt-BR')}</span>
            </div>

            {goal.descricao && (
              <p className="text-sm text-muted-foreground">{goal.descricao}</p>
            )}

            {!isCompleted && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Valor para adicionar"
                  className="h-8"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      const currentValue = parseToNumber(goal.valorAtual);
                      const newValue = currentValue + parseToNumber(input.value || "0");
                      if (newValue >= 0) {
                        handleUpdateProgress(goal.id, newValue);
                        input.value = "";
                      }
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                    if (input) {
                      const currentValue = parseToNumber(goal.valorAtual);
                      const newValue = currentValue + parseToNumber(input.value || "0");
                      if (newValue >= 0) {
                        handleUpdateProgress(goal.id, newValue);
                        input.value = "";
                      }
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 lg:p-6">
        <MetasPageSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <BackButton />
        </div>

        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Metas Financeiras
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Defina e acompanhe seus objetivos financeiros
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingGoal ? "Editar Meta" : "Nova Meta"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nome">Nome da Meta</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Viagem para Europa"
                      required
                      maxLength={100}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="valorAlvo">Valor Alvo</Label>
                    <Input
                      id="valorAlvo"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valorAlvo}
                      onChange={(e) => setFormData({ ...formData, valorAlvo: e.target.value })}
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
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="prazo">Prazo</Label>
                    <Input
                      id="prazo"
                      type="date"
                      value={formData.prazo}
                      onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descricao">Descrição (opcional)</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descrição da meta..."
                      rows={3}
                      maxLength={500}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingGoal(null);
                        setFormData({
                          nome: "",
                          valorAlvo: "",
                          valorAtual: "",
                          prazo: "",
                          descricao: "",
                          ativo: true,
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {editingGoal ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Metas Ativas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas Ativas ({activeGoals.length})
          </h2>
          {activeGoals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhuma meta ativa encontrada.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Crie sua primeira meta para começar a organizar seus objetivos financeiros.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </div>

        {/* Metas Concluídas */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Metas Concluídas ({completedGoals.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {completedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Upgrade */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        highlightPlan="monthly"
      />
    </div>
  );
};

export default Metas;
