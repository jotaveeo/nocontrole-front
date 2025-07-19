
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit, Trash2, Settings, Zap, Target } from 'lucide-react'
import { useAutoCategorization } from '@/hooks/useAutoCategorization'
import { useFinanceExtendedContext } from '@/contexts/FinanceExtendedContext'
import { useToast } from '@/hooks/use-toast'
import { CategorizationRule } from '@/types/categorization'

export const CategorizationRules = () => {
  const { rules, addRule, updateRule, deleteRule, historyPatterns } = useAutoCategorization()
  const { categories } = useFinanceExtendedContext()
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<CategorizationRule | null>(null)
  const [newRule, setNewRule] = useState({
    name: '',
    keywords: [''],
    category: '',
    type: 'expense' as 'income' | 'expense' | 'both',
    isActive: true,
    priority: 1
  })

  const handleAddKeyword = () => {
    setNewRule(prev => ({
      ...prev,
      keywords: [...prev.keywords, '']
    }))
  }

  const handleRemoveKeyword = (index: number) => {
    setNewRule(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }))
  }

  const handleUpdateKeyword = (index: number, value: string) => {
    setNewRule(prev => ({
      ...prev,
      keywords: prev.keywords.map((keyword, i) => i === index ? value : keyword)
    }))
  }

  const handleSaveRule = () => {
    const filteredKeywords = newRule.keywords.filter(k => k.trim())
    
    if (!newRule.name.trim() || !newRule.category || filteredKeywords.length === 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, categoria e pelo menos uma palavra-chave.',
        variant: 'destructive'
      })
      return
    }

    const ruleData = {
      ...newRule,
      keywords: filteredKeywords
    }

    if (editingRule) {
      updateRule(editingRule.id, ruleData)
      toast({
        title: 'Regra atualizada',
        description: 'A regra de categorização foi atualizada com sucesso.'
      })
    } else {
      addRule(ruleData)
      toast({
        title: 'Regra criada',
        description: 'Nova regra de categorização criada com sucesso.'
      })
    }

    handleCloseDialog()
  }

  const handleEditRule = (rule: CategorizationRule) => {
    setEditingRule(rule)
    setNewRule({
      name: rule.name,
      keywords: rule.keywords,
      category: rule.category,
      type: rule.type || 'expense',
      isActive: rule.isActive,
      priority: rule.priority
    })
    setIsDialogOpen(true)
  }

  const handleDeleteRule = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta regra?')) {
      deleteRule(id)
      toast({
        title: 'Regra excluída',
        description: 'A regra de categorização foi removida.'
      })
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingRule(null)
    setNewRule({
      name: '',
      keywords: [''],
      category: '',
      type: 'expense',
      isActive: true,
      priority: 1
    })
  }

  const activeRules = rules.filter(rule => rule.isActive)
  const inactiveRules = rules.filter(rule => !rule.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Regras de Categorização
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure regras automáticas para categorizar suas transações
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Editar Regra' : 'Nova Regra de Categorização'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="rule-name">Nome da Regra</Label>
                <Input
                  id="rule-name"
                  value={newRule.name}
                  onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Pagamentos Uber"
                />
              </div>

              <div>
                <Label>Categoria</Label>
                <Select 
                  value={newRule.category} 
                  onValueChange={(value) => setNewRule(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo de Transação</Label>
                <Select 
                  value={newRule.type} 
                  onValueChange={(value: 'income' | 'expense' | 'both') => 
                    setNewRule(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Despesas</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Palavras-chave</Label>
                <div className="space-y-2">
                  {newRule.keywords.map((keyword, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={keyword}
                        onChange={(e) => handleUpdateKeyword(index, e.target.value)}
                        placeholder="palavra-chave"
                      />
                      {newRule.keywords.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveKeyword(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddKeyword}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar palavra-chave
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="rule-active">Regra ativa</Label>
                <Switch
                  id="rule-active"
                  checked={newRule.isActive}
                  onCheckedChange={(checked) => 
                    setNewRule(prev => ({ ...prev, isActive: checked }))
                  }
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleSaveRule} className="flex-1">
                  {editingRule ? 'Atualizar' : 'Criar'} Regra
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Regras Ativas</p>
                <p className="text-xl font-semibold">{activeRules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Padrões Histórico</p>
                <p className="text-xl font-semibold">{historyPatterns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Settings className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Regras</p>
                <p className="text-xl font-semibold">{rules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Regras Ativas ({activeRules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeRules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{rule.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {rule.type === 'both' ? 'Ambos' : rule.type === 'expense' ? 'Despesa' : 'Receita'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Categoria: {rule.category}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {rule.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRule(rule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {activeRules.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma regra ativa. Crie sua primeira regra para automatizar a categorização.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inactive Rules */}
      {inactiveRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Regras Inativas ({inactiveRules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveRules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg opacity-60">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge variant="outline" className="text-xs">Inativa</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Categoria: {rule.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRule(rule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
