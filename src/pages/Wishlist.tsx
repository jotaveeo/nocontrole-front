import React, { useState, useEffect } from 'react'
import { PageLayout, StatsGrid, ContentGrid, ResponsiveCard, EmptyState } from '../components/ui/page-layout'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Heart, CheckCircle, X, ShoppingCart, AlertTriangle, Clock, DollarSign, TrendingUp, Loader2 } from 'lucide-react'
import { API_ENDPOINTS, makeApiRequest } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface WishlistItem {
  _id: string
  nome: string
  descricao?: string
  valor: number
  valorEconomizado: number
  prioridade: number
  status: 'desejando' | 'economizando' | 'comprado' | 'cancelado'
  categoria?: string
  link?: string
  imagem?: string
  dataDesejada?: string
  dataCompra?: string
  tags: string[]
  ativo: boolean
  createdAt: string
  updatedAt: string
  // Virtuals do backend
  progresso?: number
  valorRestante?: number
  metaAtingida?: boolean
  diasDesejada?: number
  atrasado?: boolean
}

interface Category {
  id: string
  nome: string
  tipo: 'receita' | 'despesa'
}

const Wishlist = () => {
  const { toast } = useToast()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valor: '',
    valorEconomizado: '',
    categoria: 'none',
    prioridade: 2,
    status: 'desejando' as 'desejando' | 'economizando' | 'comprado' | 'cancelado',
    link: '',
    imagem: '',
    dataDesejada: '',
    tags: [] as string[]
  })

  const statusColors = {
    desejando: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    economizando: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    comprado: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }

  const statusLabels = {
    desejando: 'Desejando',
    economizando: 'Economizando',
    comprado: 'Comprado',
    cancelado: 'Cancelado'
  }

  // Carregar dados
  useEffect(() => {
    fetchWishlistItems()
    fetchCategories()
  }, [])

  const fetchWishlistItems = async () => {
    try {
      // Usar endpoint que já filtra itens ativos no backend
      const response = await makeApiRequest(`${API_ENDPOINTS.WISHLIST}?ativo=true`)
      if (response.success) {
        const rawItems = response.data?.data || response.data || []
        // Normalizar dados do backend para frontend
        const items = rawItems.map((item: any) => ({
          _id: item._id || item.id,
          nome: item.nome || item.item || '',
          descricao: item.descricao || '',
          categoria: item.categoria || item.categoria_id || '',
          prioridade: item.prioridade || 2,
          status: item.status || 'desejando',
          createdAt: item.createdAt || item.dataCriacao || '',
          updatedAt: item.updatedAt || item.createdAt || '',
          valorEconomizado: item.valorEconomizado || 0,
          valor: item.valor || 0,
          link: item.link || '',
          imagem: item.imagem || '',
          dataDesejada: item.dataDesejada || '',
          dataCompra: item.dataCompra || '',
          tags: item.tags || [],
          ativo: item.ativo !== undefined ? item.ativo : true,
          progresso: item.progresso || 0,
          valorRestante: item.valorRestante || (item.valor || 0) - (item.valorEconomizado || 0),
          metaAtingida: item.metaAtingida || false,
          diasDesejada: item.diasDesejada || null,
          atrasado: item.atrasado || false
        }))
        // Filtrar apenas itens ativos (não deletados)
        const activeItems = items.filter(item => item.ativo !== false)
        setWishlistItems(activeItems)
      }
    } catch (error) {
      console.error('Erro ao carregar wishlist:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await makeApiRequest(API_ENDPOINTS.CATEGORIES)
      if (response.success) {
        // Normalizar para garantir que sempre seja um array de categorias
        const catsRaw = response.data?.categorias || response.data?.data || response.data || [];
        const cats = Array.isArray(catsRaw)
          ? catsRaw.map(cat => ({
              id: cat.id || cat._id,
              nome: cat.nome || cat.name,
              tipo: cat.tipo || cat.type
            }))
          : [];
        setCategories(cats);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      valor: '',
      valorEconomizado: '',
      categoria: 'none',
      prioridade: 2,
      status: 'desejando',
      link: '',
      imagem: '',
      dataDesejada: '',
      tags: []
    })
    setEditingItem(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value || '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.valor) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const itemData = {
        nome: formData.nome,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        valorEconomizado: parseFloat(formData.valorEconomizado) || 0,
        categoria: formData.categoria === 'none' ? undefined : formData.categoria,
        prioridade: formData.prioridade,
        status: formData.status,
        link: formData.link,
        imagem: formData.imagem,
        dataDesejada: formData.dataDesejada || undefined,
        tags: formData.tags
      }

      if (editingItem) {
        // Atualizar item existente
        const response = await makeApiRequest(`${API_ENDPOINTS.WISHLIST}/${editingItem._id}`, {
          method: 'PUT',
          body: JSON.stringify(itemData)
        })

        if (response.success) {
          toast({
            title: "Sucesso",
            description: "Item atualizado com sucesso"
          })
          fetchWishlistItems()
        }
      } else {
        // Criar novo item
        const response = await makeApiRequest(API_ENDPOINTS.WISHLIST, {
          method: 'POST',
          body: JSON.stringify(itemData)
        })

        if (response.success) {
          toast({
            title: "Sucesso",
            description: "Item adicionado à wishlist"
          })
          fetchWishlistItems()
        }
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar item:', error)
      toast({
        title: "Erro",
        description: "Erro ao salvar item",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: WishlistItem) => {
    setEditingItem(item)
    setFormData({
      nome: item.nome || '',
      descricao: item.descricao || '',
      valor: item.valor ? item.valor.toString() : '',
      valorEconomizado: item.valorEconomizado ? item.valorEconomizado.toString() : '0',
      categoria: item.categoria || 'none',
      prioridade: item.prioridade || 2,
      status: item.status || 'desejando',
      link: item.link || '',
      imagem: item.imagem || '',
      dataDesejada: item.dataDesejada || '',
      tags: item.tags || []
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return

    try {
      const response = await makeApiRequest(`${API_ENDPOINTS.WISHLIST}/${id}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        // Remover da lista local imediatamente para feedback visual rápido
        setWishlistItems(prev => prev.filter(item => item._id !== id))
        
        toast({
          title: "Sucesso",
          description: "Item removido da wishlist"
        })
        
        // Recarregar da API para garantir sincronização
        setTimeout(() => fetchWishlistItems(), 100)
      } else {
        throw new Error(response.message || 'Erro ao excluir item')
      }
    } catch (error) {
      console.error('Erro ao excluir item:', error)
      toast({
        title: "Erro",
        description: "Erro ao excluir item",
        variant: "destructive"
      })
    }
  }

  const totalValue = wishlistItems.reduce((sum, item) => sum + item.valor, 0)
  const savedValue = wishlistItems.reduce((sum, item) => sum + (item.valorEconomizado || 0), 0)
  const boughtItems = wishlistItems.filter(item => item.status === 'comprado').length

  return (
    <PageLayout title="Wishlist" subtitle="Gerencie seus desejos e economias">
      <StatsGrid>
        <ResponsiveCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wishlistItems.length}</div>
          </CardContent>
        </ResponsiveCard>

        <ResponsiveCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </ResponsiveCard>

        <ResponsiveCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economizado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {savedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </ResponsiveCard>

        <ResponsiveCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comprados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boughtItems}</div>
          </CardContent>
        </ResponsiveCard>
      </StatsGrid>

      <ContentGrid>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold">Meus Desejos</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item na Wishlist'}</DialogTitle>
                <DialogDescription>
                  {editingItem 
                    ? 'Atualize as informações do item da sua wishlist.'
                    : 'Adicione um novo item à sua wishlist com nome, preço estimado e prioridade.'
                  }
                </DialogDescription>
              </DialogHeader>
              {/* ...existing code... */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Item</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome || ''}
                    onChange={handleInputChange}
                    placeholder="Ex: iPhone 15 Pro"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição (opcional)</Label>
                  <Input
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    placeholder="Detalhes sobre o item"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">Preço Estimado</Label>
                  <Input
                    id="valor"
                    name="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorEconomizado">Valor Economizado</Label>
                  <Input
                    id="valorEconomizado"
                    name="valorEconomizado"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valorEconomizado}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select
                    value={formData.prioridade.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, prioridade: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Baixa</SelectItem>
                      <SelectItem value="2">2 - Média</SelectItem>
                      <SelectItem value="3">3 - Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria (opcional)</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem categoria</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Link (opcional)</Label>
                  <Input
                    id="link"
                    name="link"
                    type="url"
                    value={formData.link || ''}
                    onChange={handleInputChange}
                    placeholder="https://exemplo.com/produto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataDesejada">Data Desejada (opcional)</Label>
                  <Input
                    id="dataDesejada"
                    name="dataDesejada"
                    type="date"
                    value={formData.dataDesejada || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingItem ? 'Salvando...' : 'Adicionando...'}
                      </>
                    ) : (
                      editingItem ? 'Salvar Alterações' : 'Adicionar Item'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {wishlistItems.length === 0 ? (
          <EmptyState
            icon={<Heart />}
            title="Nenhum item na wishlist"
            description="Adicione itens que você deseja comprar para começar a planejar suas economias."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {wishlistItems.map((item) => {
              // Buscar categoria pelo id
              const categoria = categories.find(cat => cat.id === item.categoria);
              return (
                <Card key={item._id} className="hover:shadow-lg transition-shadow border border-zinc-800 dark:border-zinc-700 bg-zinc-900/80 dark:bg-zinc-900/80 rounded-xl">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-bold text-white truncate max-w-[70%]">{item.nome}</CardTitle>
                        <Badge className={statusColors[item.status]}>{statusLabels[item.status]}</Badge>
                      </div>
                      {categoria && (
                        <Badge variant="secondary" className="w-fit text-xs px-2 py-1 bg-purple-900/30 text-purple-300 font-medium">
                          {categoria.nome}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {item.descricao && (
                        <p className="text-sm text-zinc-400 line-clamp-2">{item.descricao}</p>
                      )}
                      <div className="flex flex-row items-center justify-between gap-2">
                        <span className="text-2xl font-bold text-green-400">
                          R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          Prioridade {item.prioridade}
                        </Badge>
                      </div>
                      {item.valorEconomizado > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-green-500 font-semibold">
                              Economizado: R$ {item.valorEconomizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-blue-400">
                              {item.progresso?.toFixed(1) || ((item.valorEconomizado / item.valor) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(item.progresso || ((item.valorEconomizado / item.valor) * 100), 100)}%` }}
                            ></div>
                          </div>
                          {item.valorRestante > 0 && (
                            <div className="text-xs text-gray-400">
                              Restante: R$ {(item.valorRestante || (item.valor - item.valorEconomizado)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>
                      )}
                      {item.dataDesejada && (
                        <div className="text-xs text-yellow-400">
                          📅 Desejada para: {new Date(item.dataDesejada).toLocaleDateString('pt-BR')}
                          {item.atrasado && <span className="text-red-400 ml-2">⚠️ Atrasada</span>}
                        </div>
                      )}
                      {item.link && (
                        <div className="text-xs">
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            🔗 Ver produto
                          </a>
                        </div>
                      )}
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                          className="rounded-md"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item._id)}
                          className="rounded-md"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ContentGrid>
    </PageLayout>
  )
}

export default Wishlist
