// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Plus, Edit, Trash2, Tag, Download, Loader2, Grid, List } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/hooks/useAuth";
// import { API_ENDPOINTS, makeApiRequest } from "@/lib/api";
// import { PageLayout, StatsGrid, ContentGrid, ResponsiveCard } from "@/components/ui/page-layout";
// import { ResponsiveTable } from "@/components/ui/responsive-table";
// import { SummaryCard } from "@/components/SummaryCard";
// import { Badge } from "@/components/ui/badge";

// interface Category {
//   id: string;
//   nome: string;
//   icone: string;
//   cor: string;
//   tipo: "receita" | "despesa";
//   ativo: boolean;
// }

// const defaultCategories: Category[] = [
//   // Categorias de Receita
//   { id: '1', nome: 'Salário', icone: '💰', cor: '#10B981', tipo: 'receita', ativo: true },
//   { id: '2', nome: 'Freelance', icone: '💻', cor: '#3B82F6', tipo: 'receita', ativo: true },
//   { id: '3', nome: 'Investimentos', icone: '📈', cor: '#8B5CF6', tipo: 'receita', ativo: true },
//   { id: '4', nome: 'Comissões', icone: '🤝', cor: '#06B6D4', tipo: 'receita', ativo: true },
//   { id: '5', nome: 'Aluguel Recebido', icone: '🏠', cor: '#84CC16', tipo: 'receita', ativo: true },
//   { id: '6', nome: 'Vendas', icone: '🛍️', cor: '#F59E0B', tipo: 'receita', ativo: true },
//   { id: '7', nome: '13º Salário', icone: '🎁', cor: '#EC4899', tipo: 'receita', ativo: true },
//   { id: '8', nome: 'Férias', icone: '🏖️', cor: '#14B8A6', tipo: 'receita', ativo: true },
//   { id: '9', nome: 'Bonificação', icone: '🏆', cor: '#F97316', tipo: 'receita', ativo: true },
//   { id: '10', nome: 'Restituição IR', icone: '📋', cor: '#6366F1', tipo: 'receita', ativo: true },
//   { id: '11', nome: 'Pensão Recebida', icone: '👨‍👩‍👧‍👦', cor: '#8B5CF6', tipo: 'receita', ativo: true },
//   { id: '12', nome: 'Renda Extra', icone: '💪', cor: '#10B981', tipo: 'receita', ativo: true },

//   // Categorias de Despesa - Essenciais
//   { id: '13', nome: 'Alimentação', icone: '🍽️', cor: '#EF4444', tipo: 'despesa', ativo: true },
//   { id: '14', nome: 'Supermercado', icone: '🛒', cor: '#DC2626', tipo: 'despesa', ativo: true },
//   { id: '15', nome: 'Transporte', icone: '🚗', cor: '#F59E0B', tipo: 'despesa', ativo: true },
//   { id: '16', nome: 'Combustível', icone: '⛽', cor: '#D97706', tipo: 'despesa', ativo: true },
//   { id: '17', nome: 'Moradia', icone: '🏠', cor: '#F97316', tipo: 'despesa', ativo: true },
//   { id: '18', nome: 'Aluguel', icone: '🔑', cor: '#EA580C', tipo: 'despesa', ativo: true },
//   { id: '19', nome: 'Contas Básicas', icone: '📄', cor: '#7C2D12', tipo: 'despesa', ativo: true },
//   { id: '20', nome: 'Internet', icone: '🌐', cor: '#1F2937', tipo: 'despesa', ativo: true },
//   { id: '21', nome: 'Energia Elétrica', icone: '⚡', cor: '#FBBF24', tipo: 'despesa', ativo: true },
//   { id: '22', nome: 'Água', icone: '💧', cor: '#3B82F6', tipo: 'despesa', ativo: true },
//   { id: '23', nome: 'Gás', icone: '🔥', cor: '#F59E0B', tipo: 'despesa', ativo: true },
//   { id: '24', nome: 'Telefone', icone: '📱', cor: '#10B981', tipo: 'despesa', ativo: true },
  
//   // Saúde e Bem-estar
//   { id: '25', nome: 'Plano de Saúde', icone: '🏥', cor: '#DC2626', tipo: 'despesa', ativo: true },
//   { id: '26', nome: 'Medicamentos', icone: '💊', cor: '#B91C1C', tipo: 'despesa', ativo: true },
//   { id: '27', nome: 'Consultas Médicas', icone: '👨‍⚕️', cor: '#7F1D1D', tipo: 'despesa', ativo: true },
//   { id: '28', nome: 'Academia', icone: '🏋️', cor: '#059669', tipo: 'despesa', ativo: true },
//   { id: '29', nome: 'Dentista', icone: '🦷', cor: '#065F46', tipo: 'despesa', ativo: true },
  
//   // Educação
//   { id: '30', nome: 'Cursos', icone: '📚', cor: '#7C3AED', tipo: 'despesa', ativo: true },
//   { id: '31', nome: 'Livros', icone: '📖', cor: '#6D28D9', tipo: 'despesa', ativo: true },
//   { id: '32', nome: 'Material Escolar', icone: '✏️', cor: '#5B21B6', tipo: 'despesa', ativo: true },
  
//   // Entretenimento
//   { id: '33', nome: 'Streaming', icone: '🎬', cor: '#DC2626', tipo: 'despesa', ativo: true },
//   { id: '34', nome: 'Cinema', icone: '🎭', cor: '#B91C1C', tipo: 'despesa', ativo: true },
//   { id: '35', nome: 'Jogos', icone: '🎮', cor: '#991B1B', tipo: 'despesa', ativo: true },
//   { id: '36', nome: 'Restaurantes', icone: '🍴', cor: '#7F1D1D', tipo: 'despesa', ativo: true },
//   { id: '37', nome: 'Viagens', icone: '✈️', cor: '#450A0A', tipo: 'despesa', ativo: true },
  
//   // Vestuário e Cuidados
//   { id: '38', nome: 'Roupas', icone: '👕', cor: '#EC4899', tipo: 'despesa', ativo: true },
//   { id: '39', nome: 'Calçados', icone: '👟', cor: '#DB2777', tipo: 'despesa', ativo: true },
//   { id: '40', nome: 'Cabelo', icone: '💇', cor: '#BE185D', tipo: 'despesa', ativo: true },
//   { id: '41', nome: 'Cosméticos', icone: '💄', cor: '#9D174D', tipo: 'despesa', ativo: true },
  
//   // Outros
//   { id: '42', nome: 'Impostos', icone: '📋', cor: '#374151', tipo: 'despesa', ativo: true },
//   { id: '43', nome: 'Seguros', icone: '🛡️', cor: '#1F2937', tipo: 'despesa', ativo: true },
//   { id: '44', nome: 'Doações', icone: '❤️', cor: '#EF4444', tipo: 'despesa', ativo: true },
//   { id: '45', nome: 'Pets', icone: '🐕', cor: '#F59E0B', tipo: 'despesa', ativo: true },
//   { id: '46', nome: 'Manutenção', icone: '🔧', cor: '#6B7280', tipo: 'despesa', ativo: true },
//   { id: '47', nome: 'Presentes', icone: '🎁', cor: '#EC4899', tipo: 'despesa', ativo: true },
//   { id: '48', nome: 'Emergência', icone: '🚨', cor: '#DC2626', tipo: 'despesa', ativo: true },
//   { id: '49', nome: 'Investimentos', icone: '💰', cor: '#10B981', tipo: 'despesa', ativo: true },
//   { id: '50', nome: 'Outros', icone: '📦', cor: '#6B7280', tipo: 'despesa', ativo: true }
// ];

// const iconOptions = [
//   '💰', '💸', '🏠', '🚗', '🍽️', '🛒', '⚽', '🎮', '📱', '💊',
//   '🎓', '✈️', '🎬', '👕', '💄', '🐕', '🔧', '📋', '❤️', '🎁',
//   '📚', '🏋️', '🍴', '🎭', '👟', '💇', '🛡️', '🚨', '📦', '⚡',
//   '💧', '🔥', '🌐', '📄', '🔑', '⛽', '🛍️', '🤝', '📈', '🏆',
//   '🏖️', '👨‍👩‍👧‍👦', '💪', '🏥', '👨‍⚕️', '🦷', '📖', '✏️', '💻'
// ];

// const colorOptions = [
//   '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
//   '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
//   '#DC2626', '#D97706', '#059669', '#2563EB', '#7C3AED',
//   '#DB2777', '#0891B2', '#65A30D', '#EA580C', '#4F46E5'
// ];

// const CategoriasResponsive = () => {
//   const { toast } = useToast();
//   const { user } = useAuth();
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(false); // Inicia como false, não loading
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingCategory, setEditingCategory] = useState<Category | null>(null);
//   const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
//   const [filterType, setFilterType] = useState<'all' | 'receita' | 'despesa'>('all');
//   const [formData, setFormData] = useState({
//     nome: '',
//     icone: '📦',
//     cor: '#6B7280',
//     tipo: 'despesa' as 'receita' | 'despesa'
//   });

//   // Removido useEffect automático - categorias só carregam quando solicitado

//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const response = await makeApiRequest(API_ENDPOINTS.CATEGORIES);
      
//       if (response.success) {
//         // Verificar se response.data é um array ou objeto com propriedade categorias
//         let categoriesData = response.data || [];
//         if (categoriesData.categorias && Array.isArray(categoriesData.categorias)) {
//           categoriesData = categoriesData.categorias;
//         } else if (categoriesData.data && Array.isArray(categoriesData.data)) {
//           categoriesData = categoriesData.data;
//         }
        
//         // Mapear campos do backend (inglês) para frontend (português) se necessário
//         const mappedCategories = Array.isArray(categoriesData) ? categoriesData.map(cat => ({
//           id: cat.id || cat._id,
//           nome: cat.nome || cat.name,
//           icone: cat.icone || cat.icon,
//           cor: cat.cor || cat.color,
//           tipo: cat.tipo || cat.type,
//           ativo: cat.ativo !== undefined ? cat.ativo : cat.active !== undefined ? cat.active : true,
//           descricao: cat.descricao || cat.description,
//           ordem: cat.ordem || cat.order || 0
//         })) : [];
        
//         setCategories(mappedCategories);
//       } else {
//         console.error('Erro ao carregar categorias:', response.message);
//         setCategories([]);
//       }
//     } catch (error) {
//       console.error('Erro ao carregar categorias:', error);
//       toast({
//         title: "Erro",
//         description: "Erro ao carregar categorias. Usando categorias padrão.",
//         variant: "destructive",
//       });
//       // Em caso de erro, usar categorias padrão
//       setCategories(defaultCategories);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveCategory = async () => {
//     try {
//       const url = editingCategory 
//         ? `${API_ENDPOINTS.CATEGORIES}/${editingCategory.id}`
//         : API_ENDPOINTS.CATEGORIES;
      
//       const method = editingCategory ? 'PUT' : 'POST';
      
//       const bodyData = {
//         nome: formData.nome,
//         icone: formData.icone,
//         cor: formData.cor,
//         tipo: formData.tipo,
//         ativo: true
//       };

//       const response = editingCategory 
//         ? await makeApiRequest(url, { method, body: JSON.stringify(bodyData) })
//         : await makeApiRequest(url, { method: 'POST', body: JSON.stringify(bodyData) });

//       if (response.success) {
//         toast({
//           title: "Sucesso",
//           description: editingCategory ? "Categoria atualizada!" : "Categoria criada!",
//         });
        
//         fetchCategories();
//         handleCloseDialog();
//       } else {
//         throw new Error(response.message);
//       }
//     } catch (error) {
//       console.error('Erro ao salvar categoria:', error);
//       toast({
//         title: "Erro",
//         description: "Erro ao salvar categoria. Tente novamente.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleDeleteCategory = async (id: string) => {
//     if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

//     try {
//       const response = await makeApiRequest(`${API_ENDPOINTS.CATEGORIES}/${id}`, { method: 'DELETE' });
      
//       if (response.success) {
//         toast({
//           title: "Sucesso",
//           description: "Categoria excluída com sucesso!",
//         });
//         fetchCategories();
//       } else {
//         throw new Error(response.message);
//       }
//     } catch (error: any) {
//       console.error('Erro ao excluir categoria:', error);
      
//       // Tratar erro 500 ou erro de chave estrangeira
//       let errorMessage = "Erro ao excluir categoria.";
//       if (error.message?.includes('foreign key') || error.message?.includes('chave estrangeira') || 
//           (error.status === 500 && error.message?.includes('violates foreign key constraint'))) {
//         errorMessage = "Esta categoria não pode ser excluída pois está sendo usada em transações ou outros registros.";
//       } else if (error.status === 500) {
//         errorMessage = "Erro interno do servidor. Esta categoria pode estar sendo usada em outros registros.";
//       }
      
//       toast({
//         title: "Erro",
//         description: errorMessage,
//         variant: "destructive",
//       });
//     }
//   };

//   const handleEditCategory = (category: Category) => {
//     setEditingCategory(category);
//     setFormData({
//       nome: category.nome,
//       icone: category.icone,
//       cor: category.cor,
//       tipo: category.tipo
//     });
//     setIsDialogOpen(true);
//   };

//   const handleCloseDialog = () => {
//     setIsDialogOpen(false);
//     setEditingCategory(null);
//     setFormData({
//       nome: '',
//       icone: '📦',
//       cor: '#6B7280',
//       tipo: 'despesa'
//     });
//   };

//   const handleInstallDefaults = async () => {
//     if (!confirm('Isso irá carregar e adicionar as categorias padrão. Continuar?')) return;

//     try {
//       setLoading(true);
      
//       // Primeiro, buscar categorias existentes
//       const existingCategoriesResponse = await makeApiRequest(API_ENDPOINTS.CATEGORIES);
//       const existingCategoriesRaw = existingCategoriesResponse.data?.categorias || existingCategoriesResponse.data?.data || [];
      
//       // Mapear categorias existentes para garantir estrutura consistente
//       const existingCategories = Array.isArray(existingCategoriesRaw) ? existingCategoriesRaw.map(cat => ({
//         id: cat.id || cat._id,
//         nome: cat.nome || cat.name,
//         tipo: cat.tipo || cat.type
//       })) : [];
      
//       const existingNames = new Set(existingCategories.map((cat: any) => cat.nome?.toLowerCase()).filter(Boolean));
      
//       let successCount = 0;
//       let skipCount = 0;
      
//       // Filtrar categorias que ainda não existem
//       const categoriesToCreate = defaultCategories.filter(cat => 
//         !existingNames.has(cat.nome.toLowerCase())
//       );
      
//       console.log(`Tentando criar ${categoriesToCreate.length} de ${defaultCategories.length} categorias...`);
      
//       // Processar categorias uma por vez
//       for (const cat of categoriesToCreate) {
//         try {
//           await makeApiRequest(API_ENDPOINTS.CATEGORIES, {
//             method: 'POST',
//             body: JSON.stringify({
//               nome: cat.nome,
//               icone: cat.icone,
//               cor: cat.cor,
//               tipo: cat.tipo,
//               ativo: true
//             })
//           });
//           successCount++;
//           console.log(`Categoria "${cat.nome}" criada com sucesso`);
//         } catch (error: any) {
//           // Se for erro 409 (conflito/duplicata), apenas ignorar
//           if (error.message?.includes('409') || error.message?.includes('Conflict')) {
//             skipCount++;
//             console.log(`Categoria "${cat.nome}" já existe, pulando...`);
//           } else {
//             console.error(`Erro ao criar categoria "${cat.nome}":`, error);
//             // Para outros erros, re-lançar
//             throw error;
//           }
//         }
//       }
      
//       skipCount += (defaultCategories.length - categoriesToCreate.length);
      
//       toast({
//         title: "Sucesso",
//         description: `${successCount} categorias criadas, ${skipCount} já existiam.`,
//       });
      
//       // Após instalar, carregar todas as categorias para exibir
//       fetchCategories();
//     } catch (error) {
//       console.error('Erro ao instalar categorias padrão:', error);
//       toast({
//         title: "Erro", 
//         description: "Erro ao instalar categorias padrão.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filtrar categorias
//   const filteredCategories = Array.isArray(categories) ? categories.filter(cat => {
//     if (filterType === 'all') return true;
//     return cat.tipo === filterType;
//   }) : [];

//   // Configuração das colunas da tabela
//   const tableColumns = [
//     {
//       key: "icone",
//       label: "Ícone",
//       render: (value: string, row: Category) => (
//         <div 
//           className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
//           style={{ backgroundColor: row.cor + '20' }}
//         >
//           {value}
//         </div>
//       )
//     },
//     {
//       key: "nome",
//       label: "Nome",
//       sortable: true
//     },
//     {
//       key: "tipo",
//       label: "Tipo",
//       render: (value: string) => (
//         <Badge variant={value === "receita" ? "default" : "destructive"}>
//           {value === "receita" ? "Receita" : "Despesa"}
//         </Badge>
//       )
//     },
//     {
//       key: "cor",
//       label: "Cor",
//       hideOnMobile: true,
//       render: (value: string) => (
//         <div className="flex items-center gap-2">
//           <div 
//             className="w-6 h-6 rounded-full border border-gray-300"
//             style={{ backgroundColor: value }}
//           />
//           <span className="text-sm font-mono">{value}</span>
//         </div>
//       )
//     }
//   ];

//   const receitaCategories = filteredCategories.filter(cat => cat.tipo === 'receita');
//   const despesaCategories = filteredCategories.filter(cat => cat.tipo === 'despesa');

//   return (
//     <PageLayout
//       title="Categorias"
//       subtitle="Organize suas transações com categorias personalizadas"
//       loading={loading}
//       actions={
//         <div className="flex flex-col sm:flex-row gap-2">
//           <div className="flex rounded-md border">
//             <Button
//               variant={viewMode === 'grid' ? 'default' : 'outline'}
//               size="sm"
//               onClick={() => setViewMode('grid')}
//               className="rounded-r-none"
//             >
//               <Grid className="h-4 w-4" />
//             </Button>
//             <Button
//               variant={viewMode === 'table' ? 'default' : 'outline'}
//               size="sm"
//               onClick={() => setViewMode('table')}
//               className="rounded-l-none"
//             >
//               <List className="h-4 w-4" />
//             </Button>
//           </div>
//           <Button onClick={() => setIsDialogOpen(true)}>
//             <Plus className="h-4 w-4 mr-2" />
//             Nova Categoria
//           </Button>
//         </div>
//       }
//     >
//       {/* Cards de Resumo */}
//       <StatsGrid>
//         <SummaryCard
//           title="Total de Categorias"
//           value={Array.isArray(categories) ? categories.length : 0}
//           icon={<Tag className="h-4 w-4" />}
//           trend="neutral"
//           description="Categorias cadastradas"
//           formatAsCurrency={false}
//         />
//         <SummaryCard
//           title="Categorias de Receita"
//           value={receitaCategories.length}
//           icon={<Tag className="h-4 w-4" />}
//           trend="up"
//           description="Para organizar ganhos"
//           formatAsCurrency={false}
//         />
//         <SummaryCard
//           title="Categorias de Despesa"
//           value={despesaCategories.length}
//           icon={<Tag className="h-4 w-4" />}
//           trend="down"
//           description="Para organizar gastos"
//           formatAsCurrency={false}
//         />
//         <SummaryCard
//           title="Categorias Ativas"
//           value={Array.isArray(categories) ? categories.filter(cat => cat.ativo).length : 0}
//           icon={<Tag className="h-4 w-4" />}
//           trend="neutral"
//           description="Em uso atualmente"
//           formatAsCurrency={false}
//         />
//       </StatsGrid>

//       {/* Filtros e Ações */}
//       <ResponsiveCard className="mb-6">
//         <div className="flex flex-col sm:flex-row justify-between gap-4">
//           <Select value={filterType} onValueChange={(value: 'all' | 'receita' | 'despesa') => setFilterType(value)}>
//             <SelectTrigger className="w-full sm:w-48">
//               <SelectValue placeholder="Filtrar por tipo" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">Todas</SelectItem>
//               <SelectItem value="receita">Receitas</SelectItem>
//               <SelectItem value="despesa">Despesas</SelectItem>
//             </SelectContent>
//           </Select>
          
//           <div className="flex flex-col sm:flex-row gap-2">
//             <Button 
//               variant="outline" 
//               onClick={fetchCategories}
//               className="w-full sm:w-auto"
//               disabled={loading}
//             >
//               {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Tag className="h-4 w-4 mr-2" />}
//               Carregar Existentes
//             </Button>
//             <Button 
//               variant="outline" 
//               onClick={handleInstallDefaults}
//               className="w-full sm:w-auto"
//               disabled={loading}
//             >
//               {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
//               Instalar Padrões
//             </Button>
//           </div>
//         </div>
//       </ResponsiveCard>

//       {/* Conteúdo Principal */}
//       {Array.isArray(categories) && categories.length === 0 && !loading ? (
//         <ResponsiveCard className="text-center py-12">
//           <div className="flex flex-col items-center gap-4">
//             <Tag className="h-16 w-16 text-muted-foreground" />
//             <div>
//               <h3 className="text-lg font-medium mb-2">Nenhuma categoria encontrada</h3>
//               <p className="text-muted-foreground mb-6">
//                 Comece criando uma nova categoria ou instale as categorias padrão.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-2 justify-center">
//                 <Button onClick={() => setIsDialogOpen(true)}>
//                   <Plus className="h-4 w-4 mr-2" />
//                   Nova Categoria
//                 </Button>
//                 <Button variant="outline" onClick={handleInstallDefaults} disabled={loading}>
//                   {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
//                   Instalar Padrões
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </ResponsiveCard>
//       ) : viewMode === 'grid' ? (
//         <ContentGrid columns={3}>
//           {filteredCategories.map((category) => (
//             <ResponsiveCard key={category.id} className="hover:shadow-md transition-shadow">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   <div 
//                     className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
//                     style={{ backgroundColor: category.cor + '20' }}
//                   >
//                     {category.icone}
//                   </div>
//                   <div>
//                     <h3 className="font-medium">{category.nome}</h3>
//                     <Badge variant={category.tipo === "receita" ? "default" : "destructive"} className="text-xs">
//                       {category.tipo === "receita" ? "Receita" : "Despesa"}
//                     </Badge>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
//                     <Edit className="h-3 w-3" />
//                   </Button>
//                   <Button size="sm" variant="outline" onClick={() => handleDeleteCategory(category.id)}>
//                     <Trash2 className="h-3 w-3" />
//                   </Button>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                 <div 
//                   className="w-4 h-4 rounded-full border"
//                   style={{ backgroundColor: category.cor }}
//                 />
//                 <span className="font-mono">{category.cor}</span>
//               </div>
//             </ResponsiveCard>
//           ))}
//         </ContentGrid>
//       ) : (
//         <ResponsiveTable
//           data={filteredCategories}
//           columns={tableColumns}
//           searchable={true}
//           filterable={true}
//           exportable={true}
//           emptyMessage="Nenhuma categoria encontrada. Crie uma nova categoria para começar."
//           searchKeys={["nome", "tipo"]}
//           actions={(row: Category) => (
//             <div className="flex gap-2">
//               <Button size="sm" variant="outline" onClick={() => handleEditCategory(row)}>
//                 <Edit className="h-3 w-3" />
//               </Button>
//               <Button size="sm" variant="outline" onClick={() => handleDeleteCategory(row.id)}>
//                 <Trash2 className="h-3 w-3" />
//               </Button>
//             </div>
//           )}
//         />
//       )}

//       {/* Dialog de Criação/Edição */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>
//               {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
//             </DialogTitle>
//           </DialogHeader>
//           <div className="grid gap-4 py-4">
//             <div className="grid gap-2">
//               <Label htmlFor="nome">Nome</Label>
//               <Input
//                 id="nome"
//                 value={formData.nome}
//                 onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
//                 placeholder="Nome da categoria"
//               />
//             </div>
            
//             <div className="grid gap-2">
//               <Label htmlFor="tipo">Tipo</Label>
//               <Select value={formData.tipo} onValueChange={(value: 'receita' | 'despesa') => setFormData({ ...formData, tipo: value })}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="receita">Receita</SelectItem>
//                   <SelectItem value="despesa">Despesa</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
            
//             <div className="grid gap-2">
//               <Label>Ícone</Label>
//               <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
//                 {iconOptions.map((icon) => (
//                   <Button
//                     key={icon}
//                     variant={formData.icone === icon ? "default" : "outline"}
//                     size="sm"
//                     className="w-8 h-8 p-0"
//                     onClick={() => setFormData({ ...formData, icone: icon })}
//                   >
//                     {icon}
//                   </Button>
//                 ))}
//               </div>
//             </div>
            
//             <div className="grid gap-2">
//               <Label>Cor</Label>
//               <div className="grid grid-cols-5 gap-2">
//                 {colorOptions.map((color) => (
//                   <Button
//                     key={color}
//                     variant="outline"
//                     size="sm"
//                     className="w-full h-8 p-0 border-2"
//                     style={{ 
//                       backgroundColor: color,
//                       borderColor: formData.cor === color ? '#000' : 'transparent'
//                     }}
//                     onClick={() => setFormData({ ...formData, cor: color })}
//                   />
//                 ))}
//               </div>
//               <Input
//                 value={formData.cor}
//                 onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
//                 placeholder="#6B7280"
//                 className="font-mono text-sm mt-2"
//               />
//             </div>
            
//             <div className="flex justify-end gap-2 pt-4">
//               <Button variant="outline" onClick={handleCloseDialog}>
//                 Cancelar
//               </Button>
//               <Button onClick={handleSaveCategory} disabled={!formData.nome.trim()}>
//                 {editingCategory ? 'Atualizar' : 'Criar'}
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </PageLayout>
//   );
// };

// export default CategoriasResponsive;
