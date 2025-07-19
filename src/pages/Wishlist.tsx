import React, { useState, useEffect } from 'react'
import { PageLayout, StatsGrid, ContentGrid, ResponsiveCard, EmptyState } from '../components/ui/page-layout'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Heart, CheckCircle, X, ShoppingCart, AlertTriangle, Clock, DollarSign, TrendingUp } from 'lucide-react'
import { API_ENDPOINTS, makeApiRequest } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface WishlistItem {
  id: string
  item: string
  descricao: string
  valor: number
  valorEconomizado?: number
  prioridade: number
  status: 'desejando' | 'economizando' | 'comprado' | 'cancelado'
  categoria_id: string
  dataCriacao: string
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
    item: '',
    descricao: '',
    valor: '',
    categoria_id: '',
    prioridade: 1,
    status: 'desejando' as 'desejando' | 'economizando' | 'comprado' | 'cancelado'
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
      const response = await makeApiRequest(API_ENDPOINTS.WISHLIST)
      if (response.success) {
        const items = response.data?.data || response.data || []
        setWishlistItems(items)
      }
    } catch (error) {
      console.error('Erro ao carregar wishlist:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await makeApiRequest(API_ENDPOINTS.CATEGORIES)
      if (response.success) {
        const cats = response.data?.categorias || response.data?.data || []
        setCategories(cats)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      item: '',
      descricao: '',
      valor: '',
      categoria_id: '',
      prioridade: 1,
      status: 'desejando'
    })
    setEditingItem(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.item || !formData.valor || !formData.categoria_id) {
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
        item: formData.item,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        categoria_id: formData.categoria_id,
        prioridade: formData.prioridade,
        status: formData.status
      }

      if (editingItem) {
        // Atualizar item existente
        const response = await makeApiRequest(`${API_ENDPOINTS.WISHLIST}/${editingItem.id}`, {
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
      item: item.item,
      descricao: item.descricao,
      valor: item.valor.toString(),
      categoria_id: item.categoria_id,
      prioridade: item.prioridade,
      status: item.status
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return

    try {
      await makeApiRequest(`${API_ENDPOINTS.WISHLIST}/${id}`, {
        method: 'DELETE'
      })
      
      toast({
        title: "Sucesso",
        description: "Item removido da wishlist"
      })
      fetchWishlistItems()
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
        <div className="flex justify-between items-center">
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
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="item">Nome do Item *</Label>
                  <Input
                    id="item"
                    value={formData.item}
                    onChange={(e) => setFormData(prev => ({ ...prev, item: e.target.value }))}
                    placeholder="Ex: iPhone 15"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Motivo pelo qual deseja este item..."
                  />
                </div>

                <div>
                  <Label htmlFor="valor">Valor *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="categoria_id">Categoria *</Label>
                  <Select value={formData.categoria_id} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select value={formData.prioridade.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, prioridade: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Baixa</SelectItem>
                      <SelectItem value="2">2 - Baixa-Média</SelectItem>
                      <SelectItem value="3">3 - Média</SelectItem>
                      <SelectItem value="4">4 - Alta-Média</SelectItem>
                      <SelectItem value="5">5 - Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'desejando' | 'economizando' | 'comprado' | 'cancelado') => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desejando">Desejando</SelectItem>
                      <SelectItem value="economizando">Economizando</SelectItem>
                      <SelectItem value="comprado">Comprado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : (editingItem ? 'Atualizar' : 'Adicionar')}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.item}</CardTitle>
                    <Badge className={statusColors[item.status]}>
                      {statusLabels[item.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{item.descricao}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">
                        R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <Badge variant="outline">
                        Prioridade {item.prioridade}
                      </Badge>
                    </div>
                    {item.valorEconomizado && item.valorEconomizado > 0 && (
                      <div className="text-sm text-green-600">
                        Economizado: R$ {item.valorEconomizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ContentGrid>
    </PageLayout>
  )
}

export default Wishlist
