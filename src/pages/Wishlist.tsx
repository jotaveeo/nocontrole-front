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
              </DialogHeader>
              {/* ...existing code... */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ...existing code... */}
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
              const categoria = categories.find(cat => cat.id === item.categoria_id);
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow border border-zinc-800 dark:border-zinc-700 bg-zinc-900/80 dark:bg-zinc-900/80 rounded-xl">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg font-bold text-white truncate max-w-[70%]">{item.item}</CardTitle>
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
                      {item.valorEconomizado && item.valorEconomizado > 0 && (
                        <div className="text-sm text-green-500 font-semibold">
                          Economizado: R$ {item.valorEconomizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                          onClick={() => handleDelete(item.id)}
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
