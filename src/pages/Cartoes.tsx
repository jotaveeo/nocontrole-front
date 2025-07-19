import React, { useState, useEffect } from 'react'
import { PageLayout, StatsGrid, ContentGrid, ResponsiveCard, EmptyState } from '../components/ui/page-layout'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { API_ENDPOINTS, makeApiRequest } from "@/lib/api"
import { formatCurrency, safeSum, parseToNumber } from "@/utils/formatters"
import {
  CreditCard,
  Calendar,
  Target,
  Star,
  Plus,
  Trash2,
  Edit,
  Loader2,
  DollarSign,
  AlertCircle
} from 'lucide-react'

interface CreditCard {
  id: string;
  nome: string;
  limite: number;
  diaVencimento?: number; // Compatibilidade com versões antigas
  diaVencimentoFatura?: number; // Campo correto do backend
  cor: string;
  principal: boolean;
  ativo: boolean;
}

const Cartoes = () => {
  const { toast } = useToast()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nome: "",
    limite: "",
    diaVencimento: "",
    cor: "#3b82f6",
    principal: false,
    ativo: true,
  })

  // Carregar cartões da API
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await makeApiRequest(API_ENDPOINTS.CARDS)
        if (data.success) {
          console.log('Cartões carregados:', data.data) // Para debug
          // Verificar se a resposta é da nova API com paginação
          const cardsArray = data.data?.data || data.data || [];
          // Mapear campos se necessário (MongoDB → Frontend)
          const mappedCards = Array.isArray(cardsArray) ? cardsArray.map(card => ({
            id: card.id || card._id,
            nome: card.nome || card.name,
            limite: card.limite || card.limit,
            diaVencimento: card.diaVencimento || card.vencimento || card.dueDate,
            diaVencimentoFatura: card.diaVencimentoFatura || card.vencimento || card.dueDate,
            cor: card.cor || card.color || '#3b82f6',
            principal: card.principal !== undefined ? card.principal : card.primary !== undefined ? card.primary : false,
            ativo: card.ativo !== undefined ? card.ativo : card.active !== undefined ? card.active : true
          })) : [];
          setCards(mappedCards);
        }
      } catch (error) {
        console.error('Erro ao carregar cartões:', error)
        toast({
          title: "Erro ao carregar cartões",
          description: "Não foi possível carregar os cartões.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [toast])

  const resetForm = () => {
    setFormData({
      nome: "",
      limite: "",
      diaVencimento: "",
      cor: "#3b82f6",
      principal: false,
      ativo: true,
    })
    setEditingCard(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const cardData = {
        nome: formData.nome,
        limite: parseToNumber(formData.limite),
        diaVencimento: parseInt(formData.diaVencimento),
        cor: formData.cor,
        principal: formData.principal,
        ativo: formData.ativo,
      }

      // Validação
      if (!formData.diaVencimento || cardData.diaVencimento < 1 || cardData.diaVencimento > 31) {
        toast({
          title: "Dia de vencimento inválido",
          description: "Por favor, selecione um dia de vencimento entre 1 e 31.",
          variant: "destructive",
        })
        setSubmitting(false)
        return
      }

      if (cardData.limite <= 0) {
        toast({
          title: "Limite inválido",
          description: "O limite deve ser maior que zero.",
          variant: "destructive",
        })
        setSubmitting(false)
        return
      }

      // Se definir como principal, remover principal de outros cartões
      if (cardData.principal) {
        const updatedCards = cards.map(card => ({ ...card, principal: false }))
        setCards(updatedCards)
      }

      if (editingCard) {
        // Atualizar cartão existente
        const data = await makeApiRequest(`${API_ENDPOINTS.CARDS}/${editingCard}`, {
          method: 'PUT',
          body: JSON.stringify(cardData),
        })
        
        if (data.success) {
          setCards(cards.map(card => 
            card.id === editingCard ? { ...card, ...cardData } : 
            cardData.principal ? { ...card, principal: false } : card
          ))
          toast({
            title: "Cartão atualizado",
            description: "O cartão foi editado com sucesso.",
          })
        }
      } else {
        // Criar novo cartão
        const data = await makeApiRequest(API_ENDPOINTS.CARDS, {
          method: 'POST',
          body: JSON.stringify(cardData),
        })
        
        if (data.success) {
          setCards([...cards.map(card => cardData.principal ? { ...card, principal: false } : card), data.data])
          toast({
            title: "Cartão criado",
            description: "O cartão foi criado com sucesso.",
          })
        }
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Erro ao salvar cartão:', error)
      toast({
        title: "Erro ao salvar cartão",
        description: "Não foi possível salvar o cartão.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cartão?')) return

    try {
      const data = await makeApiRequest(`${API_ENDPOINTS.CARDS}/${cardId}`, {
        method: 'DELETE',
      })
      
      if (data.success) {
        setCards(cards.filter(card => card.id !== cardId))
        toast({
          title: "Cartão excluído",
          description: "O cartão foi excluído com sucesso.",
        })
      }
    } catch (error) {
      console.error('Erro ao excluir cartão:', error)
      toast({
        title: "Erro ao excluir cartão",
        description: "Não foi possível excluir o cartão.",
        variant: "destructive",
      })
    }
  }

  const handleEditCard = (card: CreditCard) => {
    setFormData({
      nome: card.nome || "",
      limite: (card.limite || 0).toString(),
      diaVencimento: ((card.diaVencimentoFatura || card.diaVencimento) || "").toString(),
      cor: card.cor || "#3b82f6",
      principal: card.principal || false,
      ativo: card.ativo !== undefined ? card.ativo : true,
    })
    setEditingCard(card.id)
    setIsDialogOpen(true)
  }

  const handleSetMainCard = async (cardId: string) => {
    try {
      const card = cards.find(c => c.id === cardId)
      if (!card) return

      const data = await makeApiRequest(`${API_ENDPOINTS.CARDS}/${cardId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...card,
          principal: true,
        }),
      })
      
      if (data.success) {
        setCards(cards.map(c => ({
          ...c,
          principal: c.id === cardId
        })))
        toast({
          title: "Cartão principal definido",
          description: `${card.nome} foi definido como cartão principal.`,
        })
      }
    } catch (error) {
      console.error('Erro ao definir cartão principal:', error)
      toast({
        title: "Erro ao definir cartão principal",
        description: "Não foi possível definir o cartão como principal.",
        variant: "destructive",
      })
    }
  }

  // Estatísticas
  const totalLimite = Array.isArray(cards) ? safeSum(cards.filter(card => card.ativo).map(card => parseToNumber(card.limite))) : 0
  const cartaoAtivos = Array.isArray(cards) ? cards.filter(card => card.ativo) : []
  const cartaoPrincipal = Array.isArray(cards) ? cards.find(card => card.principal) : null

  if (loading) {
    return (
      <PageLayout title="Cartões de Crédito" loading={true}>
        <div />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Cartões de Crédito"
      subtitle="Gerencie seus cartões de crédito e débito"
      actions={
        <Button onClick={() => {
          resetForm()
          setIsDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cartão
        </Button>
      }
    >
      <StatsGrid>
        <ResponsiveCard title="Total de Cartões">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
            <div>
              <div className="text-2xl font-bold">{cards.length}</div>
              <p className="text-xs text-muted-foreground">cartões cadastrados</p>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard title="Limite Total">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-muted-foreground" />
            <div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalLimite)}
              </div>
              <p className="text-xs text-muted-foreground">disponível</p>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard title="Cartões Ativos">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-muted-foreground" />
            <div>
              <div className="text-2xl font-bold">{cartaoAtivos.length}</div>
              <p className="text-xs text-muted-foreground">em uso</p>
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard title="Principal">
          <div className="flex items-center space-x-2">
            <Star className="h-8 w-8 text-muted-foreground" />
            <div>
              <div className="text-lg font-bold">
                {cartaoPrincipal ? cartaoPrincipal.nome : 'Nenhum'}
              </div>
              <p className="text-xs text-muted-foreground">cartão principal</p>
            </div>
          </div>
        </ResponsiveCard>
      </StatsGrid>

      <ContentGrid columns={3}>
        {Array.isArray(cards) && cards.length > 0 ? (
          cards.map((card) => (
            <ResponsiveCard key={card.id}>
              <div className="space-y-4">
                {/* Header do cartão com design de cartão de crédito */}
                <div 
                  className="relative p-4 rounded-lg text-white shadow-lg"
                  style={{ backgroundColor: card.cor }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-6 w-6" />
                      <span className="font-medium text-sm">CRÉDITO</span>
                    </div>
                    <div className="flex gap-1">
                      {card.principal && (
                        <Star className="h-4 w-4 fill-current" />
                      )}
                      {!card.ativo && (
                        <AlertCircle className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">{card.nome}</h3>
                    <div className="text-sm opacity-90">
                      Limite: {formatCurrency(parseToNumber(card.limite))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs opacity-90">
                      <Calendar className="h-3 w-3" />
                      <span>Vence dia {card.diaVencimentoFatura || card.diaVencimento || 'N/A'}</span>
                    </div>
                    <div className="text-xs opacity-75">
                      •••• •••• •••• ••••
                    </div>
                  </div>
                </div>

                {/* Badges de status */}
                <div className="flex flex-wrap gap-2">
                  {card.principal && (
                    <Badge variant="default" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Principal
                    </Badge>
                  )}
                  <Badge variant={card.ativo ? "secondary" : "outline"} className="text-xs">
                    {card.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  {!card.principal && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetMainCard(card.id)}
                      className="flex-1"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Principal
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCard(card)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCard(card.id)}
                    className="px-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </ResponsiveCard>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon={<CreditCard className="h-12 w-12 text-muted-foreground" />}
              title="Nenhum cartão cadastrado"
              description="Adicione seu primeiro cartão para começar a organizar suas finanças."
              action={
                <Button onClick={() => {
                  resetForm()
                  setIsDialogOpen(true)
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Cartão
                </Button>
              }
            />
          </div>
        )}
      </ContentGrid>

      {/* Dialog para adicionar/editar cartão */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) {
          resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? "Editar Cartão" : "Novo Cartão"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Cartão</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Nubank, Itaú..."
                required
                maxLength={50}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="limite">Limite (R$)</Label>
                <Input
                  id="limite"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.limite}
                  onChange={(e) => setFormData({ ...formData, limite: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diaVencimento">Dia de Vencimento *</Label>
                <Select
                  value={formData.diaVencimento}
                  onValueChange={(value) => setFormData({ ...formData, diaVencimento: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        Dia {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cor">Cor do Cartão</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="cor"
                  type="color"
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  className="w-20 h-10 p-1 border rounded-md"
                  required
                />
                <div className="flex-1">
                  <div 
                    className="w-full h-10 rounded-md border flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: formData.cor }}
                  >
                    Preview
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="principal"
                checked={formData.principal}
                onChange={(e) => setFormData({ ...formData, principal: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="principal" className="text-sm font-medium">
                Definir como cartão principal
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="ativo" className="text-sm font-medium">
                Cartão ativo
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm()
                  setIsDialogOpen(false)
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editingCard ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}

export default Cartoes
