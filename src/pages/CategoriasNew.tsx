import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Tag, Download, Loader2, Grid, List, 
         Car, Home, Utensils, ShoppingBag, Coffee, Heart, DollarSign, 
         Gamepad2, BookOpen, Plane, Music, MapPin, Phone, Wifi, 
         Shirt, Baby, PiggyBank, CreditCard, Building2, Banknote,
         Fuel, Lightbulb, Droplets, Flame, Hospital, Pill, Stethoscope,
         Dumbbell, Brain, GraduationCap, Film, Tv, Target, Scissors,
         Palette, University, Shield, FileText, AlertTriangle, Gift,
         Dog, TrendingUp, UserCheck, HeartHandshake, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFinanceExtended } from "@/hooks/useFinanceExtended";
import { apiClient } from "@/lib/api";
import { PageLayout, StatsGrid, ContentGrid, ResponsiveCard } from "@/components/ui/page-layout";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { SummaryCard } from "@/components/SummaryCard";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/types/finance";

interface CategoryStats {
  totalCategories: number;
  incomeCategories: number;
  expenseCategories: number;
  mostUsed: Category[];
  recentlyCreated: Category[];
}

// Mapeamento de nomes de ícones para componentes Lucide
const iconMap: Record<string, React.ComponentType<{className?: string}>> = {
  // Transporte
  car: Car,
  fuel: Fuel,
  
  // Casa e Utilidades
  home: Home,
  lightbulb: Lightbulb,
  droplets: Droplets,
  flame: Flame,
  phone: Phone,
  wifi: Wifi,
  
  // Alimentação
  utensils: Utensils,
  'shopping-bag': ShoppingBag,
  coffee: Coffee,
  
  // Saúde
  hospital: Hospital,
  pill: Pill,
  stethoscope: Stethoscope,
  dumbbell: Dumbbell,
  brain: Brain,
  
  // Educação
  'graduation-cap': GraduationCap,
  'book-open': BookOpen,
  
  // Lazer
  film: Film,
  tv: Tv,
  gamepad2: Gamepad2,
  target: Target,
  plane: Plane,
  music: Music,
  'map-pin': MapPin,
  
  // Vestuário
  shirt: Shirt,
  scissors: Scissors,
  palette: Palette,
  
  // Financeiro
  'dollar-sign': DollarSign,
  'credit-card': CreditCard,
  'piggy-bank': PiggyBank,
  banknote: Banknote,
  building2: Building2,
  university: University,
  shield: Shield,
  calculator: Calculator,
  'trending-up': TrendingUp,
  
  // Família
  baby: Baby,
  heart: Heart,
  'heart-handshake': HeartHandshake,
  gift: Gift,
  dog: Dog,
  
  // Outros
  'file-text': FileText,
  'alert-triangle': AlertTriangle,
  'user-check': UserCheck,
  tag: Tag
};

// Função para renderizar ícone dinamicamente
const renderIcon = (iconName: string, className: string = "w-6 h-6") => {
  // Se o iconName for um emoji (detecção mais ampla)
  if (iconName && iconName.length >= 1 && iconName.length <= 4) {
    // Testa se contém caracteres Unicode de emoji
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F100}-\u{1F1FF}]|[\u{1F200}-\u{1F2FF}]|[\u{1F680}-\u{1F6FF}]/u;
    if (emojiRegex.test(iconName)) {
      return <span className={`${className} flex items-center justify-center`}>{iconName}</span>;
    }
  }
  
  // Se for um nome de ícone Lucide, busca no mapeamento
  const IconComponent = iconMap[iconName];
  if (IconComponent) {
    return <IconComponent className={className} />;
  }
  
  // Fallback para ícone padrão
  return <Tag className={className} />;
};

const CategoriasNew = () => {
  const { toast } = useToast();
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    createDefaultCategories,
    reloadCategories,
    reactivateAllCategories,
    isLoading,
    isInitialized
  } = useFinanceExtended();

  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [formData, setFormData] = useState({
    name: '',
    icon: '📦',
    color: '#6B7280',
    type: 'expense' as 'income' | 'expense',
  });
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isReactivatingAll, setIsReactivatingAll] = useState(false);

  // Calcular estatísticas automaticamente
  useEffect(() => {
    if (categories && categories.length > 0) {
      const incomeCategories = categories.filter(cat => cat.type === 'income');
      const expenseCategories = categories.filter(cat => cat.type === 'expense');
      
      const stats: CategoryStats = {
        totalCategories: categories.length,
        incomeCategories: incomeCategories.length,
        expenseCategories: expenseCategories.length,
        mostUsed: categories.slice(0, 5), // Primeiras 5 como exemplo
        recentlyCreated: categories.slice(-5) // Últimas 5
      };
      setStats(stats);
    } else {
      setStats({
        totalCategories: 0,
        incomeCategories: 0,
        expenseCategories: 0,
        mostUsed: [],
        recentlyCreated: []
      });
    }
  }, [categories]);

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formData.name,
          icon: formData.icon,
          color: formData.color,
          type: formData.type
        });
        toast({
          title: "Sucesso",
          description: "Categoria atualizada!",
        });
      } else {
        await addCategory({
          name: formData.name,
          icon: formData.icon,
          color: formData.color,
          type: formData.type
        });
        toast({
          title: "Sucesso",
          description: "Categoria criada!",
        });
      }
      
      // Recarregar categorias do banco de dados para mostrar a nova categoria
      await reloadCategories();
      
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar categoria. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    console.log('🗑️ Iniciando exclusão da categoria:', id);
    
    try {
      await deleteCategory(id);
      
      console.log('✅ Categoria excluída com sucesso, recarregando...');
      // Recarregar categorias do banco de dados para refletir a exclusão
      await reloadCategories();
      
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      });
    } catch (error: any) {
      console.error('❌ Erro ao excluir categoria:', error);
      
      let errorMessage = "Erro ao excluir categoria.";
      if (error.message?.includes('foreign key') || error.message?.includes('chave estrangeira')) {
        errorMessage = "Esta categoria não pode ser excluída pois está sendo usada em transações.";
      } else if (error.status === 500) {
        errorMessage = "Erro interno do servidor. Esta categoria pode estar sendo usada em outros registros.";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Função para apagar todas as categorias do usuário logado
  const handleDeleteAllCategories = async () => {
    if (!confirm('Tem certeza que deseja apagar TODAS as categorias? Essa ação não pode ser desfeita.')) return;
    setIsDeletingAll(true);
    try {
      // Chama o método do hook para deletar todas as categorias (agora via apiClient)
      const result = await apiClient.deleteAllCategories();
      if (result.success) {
        // Limpa todos os dados financeiros relacionados para evitar dados órfãos
        if (typeof window !== 'undefined') {
          localStorage.removeItem('financeflow_transactions');
          localStorage.removeItem('financeflow_goals');
          localStorage.removeItem('financeflow_wishlist');
          localStorage.removeItem('financeflow_piggybank');
          localStorage.removeItem('financeflow_debts');
          localStorage.removeItem('financeflow_creditcards');
          localStorage.removeItem('financeflow_limits');
          localStorage.removeItem('financeflow_investments');
          localStorage.removeItem('financeflow_fixedexpenses');
          localStorage.removeItem('financeflow_incomesources');
        }
        toast({
          title: 'Sucesso',
          description: `${result.data?.deletedCount || 'Todas'} categorias apagadas! Todos os dados financeiros vinculados também foram limpos.`,
        });
        await reloadCategories();
      } else {
        toast({
          title: 'Erro',
          description: result.message || 'Erro ao apagar todas as categorias.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao apagar todas as categorias.',
        variant: 'destructive'
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    console.log('✏️ Editando categoria:', category);
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type === 'both' ? 'expense' : category.type // Fix para tipo 'both'
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      icon: '📦',
      color: '#6B7280',
      type: 'expense'
    });
  };

  const handleCreateDefaultCategories = async () => {
    if (!confirm('Isso irá criar categorias padrão. Continuar?')) return;

    try {
      const result = await createDefaultCategories();
      
      if (result.success) {
        // Recarregar categorias do banco de dados para mostrar as categorias padrão criadas
        await reloadCategories();
        
        toast({
          title: "Sucesso",
          description: result.message,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Erro ao criar categorias padrão:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar categorias padrão.",
        variant: "destructive",
      });
    }
  };

  // Filtrar categorias com filtros avançados
  const filteredCategories = categories.filter(cat => {
    // Filtro por tipo
    if (filterType !== 'all' && cat.type !== filterType) return false;
    
    return true;
  });

  // Configuração das colunas da tabela
  const tableColumns = [
    {
      key: "icon",
      label: "Ícone",
      render: (value: string, row: Category) => (
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
          style={{ backgroundColor: row.color + '20' }}
        >
          {value}
        </div>
      )
    },
    {
      key: "name",
      label: "Nome",
      sortable: true
    },
    {
      key: "type",
      label: "Tipo",
      render: (value: string) => (
        <Badge variant={value === "income" ? "default" : "destructive"}>
          {value === "income" ? "Receita" : "Despesa"}
        </Badge>
      )
    },
    {
      key: "color",
      label: "Cor",
      hideOnMobile: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-full border border-gray-300"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm font-mono">{value}</span>
        </div>
      )
    },
    {
      key: "actions",
      label: "Ações",
      render: (value: any, row: Category) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEditCategory(row)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDeleteCategory(row.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )
    }
  ];

  const incomeCategories = filteredCategories.filter(cat => cat.type === 'income');
  const expenseCategories = filteredCategories.filter(cat => cat.type === 'expense');

  const handleReactivateAllCategories = async () => {
    if (!confirm('Deseja restaurar todas as categorias apagadas?')) return;
    setIsReactivatingAll(true);
    const result = await reactivateAllCategories();
    if (result.success) {
      toast({
        title: 'Sucesso',
        description: result.message,
      });
    } else {
      toast({
        title: 'Erro',
        description: result.message,
        variant: 'destructive'
      });
    }
    setIsReactivatingAll(false);
  };

  return (
    <PageLayout
      title="Categorias"
      subtitle="Organize suas transações com categorias personalizadas"
      loading={isLoading}
      actions={
        <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:gap-2">
          <div className="flex w-full sm:w-auto gap-2">
            <div className="flex rounded-md border w-fit">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
            <Button onClick={handleCreateDefaultCategories} variant="outline" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Criar categorias padrão
            </Button>
            <Button variant="destructive" onClick={handleDeleteAllCategories} disabled={isDeletingAll || isLoading} className="w-full sm:w-auto">
              {isDeletingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Apagar todas
            </Button>
          </div>
        </div>
      }
    >
      {/* Cards de Resumo */}
      <StatsGrid>
        <SummaryCard
          title="Total de Categorias"
          value={stats?.totalCategories || categories.length}
          icon={<Tag className="h-4 w-4" />}
          trend="neutral"
          description="Categorias cadastradas"
          formatAsCurrency={false}
        />
        <SummaryCard
          title="Categorias de Receita"
          value={stats?.incomeCategories || incomeCategories.length}
          icon={<Plus className="h-4 w-4" />}
          trend="up"
          description="Para organizar ganhos"
          formatAsCurrency={false}
        />
        <SummaryCard
          title="Categorias de Despesa"
          value={stats?.expenseCategories || expenseCategories.length}
          icon={<Trash2 className="h-4 w-4" />}
          trend="down"
          description="Para organizar gastos"
          formatAsCurrency={false}
        />
        <SummaryCard
          title="Mais Utilizadas"
          value={stats?.mostUsed?.length || 0}
          icon={<Tag className="h-4 w-4" />}
          trend="neutral"
          description="Com mais transações"
          formatAsCurrency={false}
        />
      </StatsGrid>

      {/* Filtros e Ações */}
      <ResponsiveCard className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 w-full lg:w-auto">
            <Select value={filterType} onValueChange={(value: 'all' | 'income' | 'expense') => setFilterType(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Nenhum botão extra aqui, apenas filtros */}
        </div>
      </ResponsiveCard>

      {/* Lista de Categorias */}
      {!Array.isArray(categories) || categories.length === 0 ? (
        <ResponsiveCard className="text-center py-12">
          <div className="space-y-4">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">Nenhuma categoria encontrada</h3>
              <p className="text-muted-foreground">
                Crie sua primeira categoria ou carregue as categorias padrão
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </div>
          </div>
        </ResponsiveCard>
      ) : viewMode === 'grid' ? (
        <ContentGrid columns={3}>
          {filteredCategories.map((category) => (
            <ResponsiveCard key={category.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    {renderIcon(category.icon, "w-6 h-6")}
                  </div>
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <Badge variant={category.type === "income" ? "default" : "destructive"} className="text-xs">
                      {category.type === "income" ? "Receita" : "Despesa"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteCategory(category.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-mono">{category.color}</span>
              </div>
            </ResponsiveCard>
          ))}
        </ContentGrid>
      ) : (
        <ResponsiveTable
          data={filteredCategories}
          columns={tableColumns}
        />
      )}

      {/* Dialog para criar/editar categoria */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome da categoria"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Ícone</Label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="Digite um emoji ou ícone (ex: 💰, 🍽️, 🏠)"
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Você pode usar qualquer emoji ou símbolo. Exemplos: 💰 🏠 🍽️ 🚗 📱 ✈️ 🎮 📚
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#6B7280"
                  className="font-mono text-sm flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Use o seletor de cor ou digite um código hexadecimal (ex: #FF5733)
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button onClick={handleSaveCategory} disabled={!formData.name.trim()}>
                {editingCategory ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default CategoriasNew;
