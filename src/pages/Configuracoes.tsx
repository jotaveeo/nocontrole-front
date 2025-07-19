import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { getUserSettings, saveUserSettings } from "@/utils/userSettings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { CategorizationRules } from "@/components/CategorizationRules";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_ENDPOINTS, makeApiRequest } from "@/lib/api";
import { Loader2, Download, Upload, Moon, Sun, Monitor } from "lucide-react";

const Configuracoes = () => {
  const { toast } = useToast();
  const { theme, setTheme, isDark } = useTheme();
  
  // Estados para dados
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Estados para dialogs
  const [deleteAllTransactionsDialogOpen, setDeleteAllTransactionsDialogOpen] = useState(false);
  const [deleteAllCategoriesDialogOpen, setDeleteAllCategoriesDialogOpen] = useState(false);
  
  // Estados para configurações
  const [notifications, setNotifications] = useState(() => {
    const settings = getUserSettings();
    return settings.notifications;
  });

  // Salvar configurações quando mudarem
  useEffect(() => {
    saveUserSettings({ notifications });
  }, [notifications]);

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Carregar transações
        const transactionsData = await makeApiRequest(API_ENDPOINTS.TRANSACTIONS);
        if (transactionsData.success) {
          // Verificar se a resposta é da nova API com paginação
          const transactionsArray = transactionsData.data?.data || transactionsData.data || [];
          setTransactions(Array.isArray(transactionsArray) ? transactionsArray : []);
        }

        // Carregar categorias
        const categoriesData = await makeApiRequest(API_ENDPOINTS.CATEGORIES);
        if (categoriesData.success) {
          // Verificar se a resposta é da nova API com paginação  
          const categoriesArray = categoriesData.data?.data || categoriesData.data || [];
          setCategories(Array.isArray(categoriesArray) ? categoriesArray : []);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as informações.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleDeleteAllTransactions = async () => {
    if (transactions.length === 0) {
      toast({
        title: "Nenhuma transação para excluir",
        description: "Não há transações para serem excluídas.",
        variant: "destructive",
      });
      return;
    }

    try {
      setDeleting(true);
      
      // Verificar se transactions é um array válido
      if (!Array.isArray(transactions)) {
        toast({
          title: "Erro",
          description: "Nenhuma transação encontrada para excluir.",
          variant: "destructive",
        });
        return;
      }
      
      // Deletar cada transação individualmente
      const deletePromises = transactions.map(async (transaction) => {
        try {
          await makeApiRequest(`${API_ENDPOINTS.TRANSACTIONS}/${transaction.id}`, {
            method: 'DELETE'
          });
          return { success: true, transaction };
        } catch (error) {
          return { success: false, transaction, error };
        }
      });
      
      const results = await Promise.all(deletePromises);
      const failedTransactions = results.filter(result => !result.success);
      const successfulTransactions = results.filter(result => result.success);
      
      if (failedTransactions.length > 0) {
        toast({
          title: "Erro ao excluir transações",
          description: `${failedTransactions.length} transação(ões) não puderam ser excluídas.`,
          variant: "destructive",
        });
        
        // Atualizar a lista removendo apenas as transações que foram excluídas com sucesso
        const remainingTransactions = Array.isArray(transactions) ? transactions.filter(transaction => 
          !successfulTransactions.some(result => result.transaction.id === transaction.id)
        ) : [];
        setTransactions(remainingTransactions);
      } else {
        // Todas as transações foram excluídas
        setTransactions([]);
        toast({
          title: "Transações excluídas",
          description: "Todas as transações foram excluídas com sucesso.",
        });
      }
      
      setDeleteAllTransactionsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao excluir transações:', error);
      toast({
        title: "Erro ao excluir transações",
        description: "Ocorreu um erro inesperado ao tentar excluir as transações.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAllCategories = async () => {
    if (categories.length === 0) {
      toast({
        title: "Nenhuma categoria para excluir",
        description: "Não há categorias para serem excluídas.",
        variant: "destructive",
      });
      return;
    }

    try {
      setDeleting(true);
      
      // Verificar se categories é um array válido
      if (!Array.isArray(categories)) {
        toast({
          title: "Erro",
          description: "Nenhuma categoria encontrada para excluir.",
          variant: "destructive",
        });
        return;
      }
      
      // Deletar cada categoria individualmente
      const deletePromises = categories.map(async (category) => {
        try {
          await makeApiRequest(`${API_ENDPOINTS.CATEGORIES}/${category.id}`, {
            method: 'DELETE'
          });
          return { success: true, category };
        } catch (error) {
          return { success: false, category, error };
        }
      });
      
      const results = await Promise.all(deletePromises);
      const failedCategories = results.filter(result => !result.success);
      const successfulCategories = results.filter(result => result.success);
      
      if (failedCategories.length > 0) {
        // Algumas categorias não puderam ser excluídas
        const errorCategory = failedCategories[0];
        const errorMessage = errorCategory.error?.message || '';
        
        if (errorMessage.includes('foreign key') || errorMessage.includes('chave estrangeira')) {
          toast({
            title: "Não é possível excluir todas as categorias",
            description: `Algumas categorias estão sendo usadas em transações, gastos fixos ou outros registros. Exclua primeiro os registros que usam essas categorias.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao excluir categorias",
            description: `${failedCategories.length} categoria(s) não puderam ser excluídas.`,
            variant: "destructive",
          });
        }
        
        // Atualizar a lista removendo apenas as categorias que foram excluídas com sucesso
        const remainingCategories = Array.isArray(categories) ? categories.filter(category => 
          !successfulCategories.some(result => result.category.id === category.id)
        ) : [];
        setCategories(remainingCategories);
      } else {
        // Todas as categorias foram excluídas
        setCategories([]);
        toast({
          title: "Categorias excluídas",
          description: "Todas as categorias foram excluídas com sucesso.",
        });
      }
      
      setDeleteAllCategoriesDialogOpen(false);
    } catch (error) {
      console.error('Erro ao excluir categorias:', error);
      toast({
        title: "Erro ao excluir categorias",
        description: "Ocorreu um erro inesperado ao tentar excluir as categorias.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      
      // Preparar dados para exportação
      const exportData = {
        transactions: transactions.map(t => ({
          id: t.id,
          tipo: t.tipo,
          valor: t.valor,
          descricao: t.descricao,
          categoria: categories.find(c => c.id === t.categoria_id)?.nome || 'Sem categoria',
          data: t.data,
          recorrente: t.recorrente
        })),
        categories: categories.map(c => ({
          id: c.id,
          nome: c.nome,
          tipo: c.tipo,
          cor: c.cor
        })),
        exportDate: new Date().toISOString(),
        totalTransactions: transactions.length,
        totalCategories: categories.length
      };
      
      // Converter para JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Criar e baixar arquivo
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financiflow_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Dados exportados",
        description: "Seus dados foram exportados com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        console.log('Dados importados:', data);
        
        toast({
          title: "Dados importados",
          description: "Funcionalidade de importação em desenvolvimento.",
        });
      } catch (error) {
        console.error('Erro ao importar dados:', error);
        toast({
          title: "Erro ao importar",
          description: "Arquivo inválido ou corrompido.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Limpar o input
    event.target.value = '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 lg:p-6 max-w-4xl">
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-6 max-w-4xl">
        {/* Header */}
        <BackButton />
        <div className="mb-6 flex items-center gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Configurações
          </h1>
        </div>

        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="categorization">Categorização</TabsTrigger>
            <TabsTrigger value="dados">Dados</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Preferências Gerais</CardTitle>
                <CardDescription>
                  Ajuste as configurações básicas do seu aplicativo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="theme">Tema</Label>
                    <p className="text-sm text-muted-foreground">
                      Escolha o tema da interface
                    </p>
                  </div>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Claro
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Escuro
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          Sistema
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="notifications">Notificações</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações sobre seus gastos
                    </p>
                  </div>
                  <Switch 
                    id="notifications" 
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Estatísticas da Conta</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{transactions.length}</div>
                      <div className="text-sm text-muted-foreground">Transações</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{categories.length}</div>
                      <div className="text-sm text-muted-foreground">Categorias</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categorization">
            <CategorizationRules />
          </TabsContent>

          <TabsContent value="dados" className="space-y-6">
            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Dados</CardTitle>
                <CardDescription>
                  Exclua ou exporte seus dados financeiros.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Export/Import Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Backup e Restauração</h4>
                  <div className="grid gap-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleExportData}
                      disabled={exporting || transactions.length === 0}
                    >
                      {exporting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Exportar Dados (JSON)
                    </Button>
                    
                    <Label htmlFor="import-data" className="cursor-pointer">
                      <div className="flex w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground">
                        <Upload className="mr-2 h-4 w-4" />
                        Importar Dados
                      </div>
                    </Label>
                    <Input
                      id="import-data"
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </div>
                </div>

                <Separator />

                {/* Delete Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-destructive">Zona Perigosa</h4>
                  <p className="text-sm text-muted-foreground">
                    Estas ações não podem ser desfeitas. Use com cuidado.
                  </p>
                <AlertDialog
                  open={deleteAllTransactionsDialogOpen}
                  onOpenChange={setDeleteAllTransactionsDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Excluir Todas as Transações
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá excluir todas as suas transações. Esta
                        ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllTransactions}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog
                  open={deleteAllCategoriesDialogOpen}
                  onOpenChange={setDeleteAllCategoriesDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Excluir Todas as Categorias
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá excluir todas as suas categorias. Esta
                        ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllCategories}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Configuracoes;
