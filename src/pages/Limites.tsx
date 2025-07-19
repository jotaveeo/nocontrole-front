import { useState } from "react";
import { Shield, AlertTriangle, TrendingUp, TrendingDown, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCategoryLimits } from "@/hooks/useCategoryLimits.tsx";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Limites = () => {
  const navigate = useNavigate();
  const {
    categoryLimits,
    updateCustomLimits,
    deleteLimit,
    loading,
  } = useCategoryLimits();
  const { toast } = useToast();
  
  const [editingCategory, setEditingCategory] = useState(null);
  const [limitValue, setLimitValue] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Group categories by status - com verificação de segurança
  const safeCategories = (categoryLimits || []).filter((cat) => cat.status === "safe");
  const warningCategories = (categoryLimits || []).filter((cat) => cat.status === "warning");
  const exceededCategories = (categoryLimits || []).filter((cat) => cat.status === "exceeded");

  const handleEditLimit = (category) => {
    setEditingCategory(category);
    setLimitValue(category.budget.toString());
    setIsEditDialogOpen(true);
  };

  const handleSaveLimit = async () => {
    if (!editingCategory || !limitValue) return;
    
    try {
      const newLimitValue = parseFloat(limitValue);
      if (newLimitValue <= 0) {
        toast({
          title: "Valor inválido",
          description: "O valor do limite deve ser maior que zero.",
          variant: "destructive",
        });
        return;
      }

      await updateCustomLimits({
        [editingCategory.name]: newLimitValue,
      });

      toast({
        title: "Limite atualizado",
        description: `Limite da categoria ${editingCategory.name} atualizado para R$ ${newLimitValue.toFixed(2)}.`,
      });

      setIsEditDialogOpen(false);
      setEditingCategory(null);
      setLimitValue("");
    } catch (error) {
      toast({
        title: "Erro ao atualizar limite",
        description: "Não foi possível atualizar o limite da categoria.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLimit = async (category) => {
    try {
      await deleteLimit(category.name);
      toast({
        title: "Limite removido",
        description: `Limite da categoria ${category.name} foi removido.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao remover limite",
        description: "Não foi possível remover o limite da categoria.",
        variant: "destructive",
      });
    }
  };

  const currentDate = new Date();
  const monthYear = currentDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando limites...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Controle de Limites
            </h1>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground">
            Monitore seus gastos por categoria e mantenha o controle do seu orçamento
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Período: {monthYear}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dentro do Limite</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{safeCategories.length}</div>
              <p className="text-xs text-muted-foreground">categorias seguras</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atenção (80%+)</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{warningCategories.length}</div>
              <p className="text-xs text-muted-foreground">próximas do limite</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Limite Excedido</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{exceededCategories.length}</div>
              <p className="text-xs text-muted-foreground">acima do limite</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categorias</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(categoryLimits || []).length}</div>
              <p className="text-xs text-muted-foreground">com limites definidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dentro do Limite */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-green-700">
                <Shield className="h-4 w-4" />
                Dentro do Limite
                <Badge variant="secondary" className="ml-auto">
                  {safeCategories.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {safeCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Nenhuma categoria neste status</p>
                  <p className="text-xs mt-1">
                    Suas categorias aparecerão aqui quando estiverem dentro do orçamento
                  </p>
                </div>
              ) : (
                safeCategories.map((category) => (
                  <CategoryLimitCard
                    key={category.id}
                    category={category}
                    onEdit={handleEditLimit}
                    onDelete={handleDeleteLimit}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Atenção (80%+) */}
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-yellow-700">
                <AlertTriangle className="h-4 w-4" />
                Atenção (80%+)
                <Badge variant="secondary" className="ml-auto">
                  {warningCategories.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {warningCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Nenhuma categoria neste status</p>
                  <p className="text-xs mt-1">
                    Categorias próximas do limite aparecerão aqui
                  </p>
                </div>
              ) : (
                warningCategories.map((category) => (
                  <CategoryLimitCard
                    key={category.id}
                    category={category}
                    onEdit={handleEditLimit}
                    onDelete={handleDeleteLimit}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Limite Excedido */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-red-700">
                <TrendingDown className="h-4 w-4" />
                Limite Excedido
                <Badge variant="secondary" className="ml-auto">
                  {exceededCategories.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {exceededCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Nenhuma categoria neste status</p>
                  <p className="text-xs mt-1">
                    Categorias que excederam o limite aparecerão aqui
                  </p>
                </div>
              ) : (
                exceededCategories.map((category) => (
                  <CategoryLimitCard
                    key={category.id}
                    category={category}
                    onEdit={handleEditLimit}
                    onDelete={handleDeleteLimit}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Limit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Editar Limite - {editingCategory?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="limit-value">Valor do Limite (R$)</Label>
                <Input
                  id="limit-value"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={limitValue}
                  onChange={(e) => setLimitValue(e.target.value)}
                  placeholder="1000.00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Limite mensal para esta categoria
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveLimit} className="flex-1">
                  Salvar Limite
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Componente para o card de categoria
const CategoryLimitCard = ({ category, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "safe":
        return "border-l-green-500";
      case "warning":
        return "border-l-yellow-500";
      case "exceeded":
        return "border-l-red-500";
      default:
        return "border-l-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "safe":
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      case "exceeded":
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className={`border-l-4 ${getStatusColor(category.status)} border rounded-lg p-4 bg-card hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{category.icon}</span>
          <div>
            <h3 className="font-semibold text-sm">{category.name}</h3>
            <div className="flex items-center gap-1">
              <p className="text-xs text-muted-foreground">
                {category.transactions} transações
              </p>
              {getStatusIcon(category.status)}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onEdit(category)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar limite da categoria</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover limite</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover o limite da categoria "{category.name}"?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(category)}>
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs">
          <span>Gasto:</span>
          <span className="font-semibold text-destructive">
            R$ {category.spent.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex justify-between text-xs">
          <span>Orçamento:</span>
          <span className="font-semibold">
            R$ {category.budget.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="space-y-1">
          <Progress 
            value={Math.min(category.percentage, 100)} 
            className="h-2"
          />
          <div className="flex justify-between text-xs">
            <span
              className={
                category.remaining >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {category.remaining >= 0 ? "Restante:" : "Excesso:"}
            </span>
            <span
              className={`font-semibold ${
                category.remaining >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              R$ {Math.abs(category.remaining).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className="text-center">
          <Badge
            variant="outline"
            className={`text-xs ${
              category.status === "safe"
                ? "bg-green-50 text-green-700 border-green-200"
                : category.status === "warning"
                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {category.percentage.toFixed(0)}% utilizado
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default Limites;
