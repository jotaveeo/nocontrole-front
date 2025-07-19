
import { useState, useEffect } from 'react'
import { CategorizationRule, HistoryPattern, AutoCategorizationResult } from '@/types/categorization'
import { Transaction } from '@/types/finance'
import { useFinanceExtendedContext } from '@/contexts/FinanceExtendedContext'

// Regras padrão baseadas nos dados do Nubank
const defaultRules: Omit<CategorizationRule, 'id' | 'createdAt'>[] = [
  // Transporte
  { name: 'Uber', keywords: ['uber', 'UBER'], category: 'Transporte', type: 'expense', isActive: true, priority: 1 },
  { name: '99', keywords: ['99app', '99 ', '99taxi'], category: 'Transporte', type: 'expense', isActive: true, priority: 1 },
  
  // Alimentação - Delivery
  { name: 'iFood', keywords: ['ifood', 'IFOOD', 'via NuPay - iFood'], category: 'Alimentação', type: 'expense', isActive: true, priority: 1 },
  
  // Alimentação - Restaurantes/Lanchonetes
  { name: 'McDonald\'s', keywords: ['mc donalds', 'mcdonalds', 'mcdonald'], category: 'Alimentação', type: 'expense', isActive: true, priority: 1 },
  { name: 'Cafeterias', keywords: ['cafe premium', 'cafe ', 'cafeteria'], category: 'Alimentação', type: 'expense', isActive: true, priority: 1 },
  
  // Supermercados
  { name: 'Supermercados', keywords: ['superm', 'supermercado', 'mercado', 'paulo bel'], category: 'Supermercado', type: 'expense', isActive: true, priority: 1 },
  { name: 'Extra', keywords: ['extra hiper', 'extra '], category: 'Supermercado', type: 'expense', isActive: true, priority: 1 },
  
  // Vestuário
  { name: 'Lojas Renner', keywords: ['lojas renner', 'renner'], category: 'Roupas', type: 'expense', isActive: true, priority: 1 },
  
  // Entretenimento
  { name: 'Sorveteria', keywords: ['sorveteria', 'acaiteria', 'açaí', 'acai'], category: 'Lazer', type: 'expense', isActive: true, priority: 1 },
  
  // Financeiro - Cartões
  { name: 'Mandacaru Cartões', keywords: ['mandacaru administradora', 'cartoes s/a'], category: 'Cartão de Crédito', type: 'expense', isActive: true, priority: 1 },
  
  // Investimentos/Aplicações
  { name: 'RDB', keywords: ['aplicação rdb', 'resgate rdb'], category: 'Investimentos', type: 'both', isActive: true, priority: 1 },
  
  // Transferências Pessoais
  { name: 'Transferências Recebidas', keywords: ['transferência recebida'], category: 'Transferências', type: 'income', isActive: true, priority: 1 },
  { name: 'Transferências PIX', keywords: ['pix -', 'enviada pelo pix'], category: 'Transferências', type: 'expense', isActive: true, priority: 1 },
  
  // Pagamentos Digitais
  { name: 'PagSeguro', keywords: ['pagseguro internet'], category: 'Outros', type: 'expense', isActive: true, priority: 1 },
  { name: 'Mercado Pago', keywords: ['mercado pago'], category: 'Outros', type: 'expense', isActive: true, priority: 1 },
  
  // Reembolsos
  { name: 'Reembolsos', keywords: ['reembolso recebido'], category: 'Reembolsos', type: 'income', isActive: true, priority: 1 },
]

export const useAutoCategorization = () => {
  const { transactions, categories } = useFinanceExtendedContext()
  const [rules, setRules] = useState<CategorizationRule[]>([])
  const [historyPatterns, setHistoryPatterns] = useState<HistoryPattern[]>([])

  // Carregar dados do localStorage
  useEffect(() => {
    const savedRules = localStorage.getItem('financeflow_categorization_rules')
    const savedHistory = localStorage.getItem('financeflow_categorization_history')
    
    if (savedRules) {
      setRules(JSON.parse(savedRules))
    } else {
      // Criar regras padrão na primeira vez
      const initialRules = defaultRules.map(rule => ({
        ...rule,
        id: Date.now().toString() + Math.random(),
        createdAt: new Date().toISOString()
      }))
      setRules(initialRules)
    }
    
    if (savedHistory) {
      setHistoryPatterns(JSON.parse(savedHistory))
    }
  }, [])

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('financeflow_categorization_rules', JSON.stringify(rules))
  }, [rules])

  useEffect(() => {
    localStorage.setItem('financeflow_categorization_history', JSON.stringify(historyPatterns))
  }, [historyPatterns])

  // Atualizar padrões do histórico baseado nas transações existentes
  useEffect(() => {
    updateHistoryPatterns()
  }, [transactions])

  const updateHistoryPatterns = () => {
    const patterns: Record<string, HistoryPattern> = {}
    
    transactions
      .filter(t => t.category && t.category !== 'Sem categoria')
      .forEach(transaction => {
        const key = transaction.description.toLowerCase().trim()
        if (patterns[key]) {
          patterns[key].count++
          patterns[key].lastUsed = transaction.date
        } else {
          patterns[key] = {
            description: transaction.description,
            category: transaction.category,
            count: 1,
            lastUsed: transaction.date
          }
        }
      })
    
    setHistoryPatterns(Object.values(patterns))
  }

  const categorizeTransaction = (description: string, type: 'income' | 'expense'): AutoCategorizationResult => {
    const lowerDesc = description.toLowerCase()
    
    // 1. Tentar aplicar regras manuais (prioridade mais alta)
    const activeRules = rules
      .filter(rule => rule.isActive && (rule.type === type || rule.type === 'both'))
      .sort((a, b) => a.priority - b.priority)
    
    for (const rule of activeRules) {
      for (const keyword of rule.keywords) {
        if (lowerDesc.includes(keyword.toLowerCase())) {
          return {
            matched: true,
            category: rule.category,
            confidence: 0.9,
            rule: rule.name,
            source: 'rule'
          }
        }
      }
    }
    
    // 2. Tentar usar histórico (busca por similaridade)
    const historyMatch = historyPatterns
      .sort((a, b) => b.count - a.count) // Ordenar por frequência
      .find(pattern => {
        const patternWords = pattern.description.toLowerCase().split(' ')
        const descWords = lowerDesc.split(' ')
        
        // Verificar se há palavras em comum
        const commonWords = patternWords.filter(word => 
          word.length > 3 && descWords.some(dWord => dWord.includes(word) || word.includes(dWord))
        )
        
        return commonWords.length >= Math.min(2, patternWords.length * 0.5)
      })
    
    if (historyMatch) {
      return {
        matched: true,
        category: historyMatch.category,
        confidence: Math.min(0.8, historyMatch.count * 0.1),
        source: 'history'
      }
    }
    
    // 3. Não encontrou correspondência
    return {
      matched: false,
      category: 'Sem categoria',
      confidence: 0,
      source: 'manual'
    }
  }

  const addRule = (rule: Omit<CategorizationRule, 'id' | 'createdAt'>) => {
    const newRule: CategorizationRule = {
      ...rule,
      id: Date.now().toString() + Math.random(),
      createdAt: new Date().toISOString()
    }
    setRules(prev => [...prev, newRule])
  }

  const updateRule = (id: string, updates: Partial<CategorizationRule>) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ))
  }

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(rule => rule.id !== id))
  }

  const categorizeMultipleTransactions = (transactions: Omit<Transaction, 'id' | 'createdAt' | 'category'>[]) => {
    return transactions.map(transaction => {
      const result = categorizeTransaction(transaction.description, transaction.type)
      return {
        ...transaction,
        category: result.category,
        autoCategorizationResult: result
      }
    })
  }

  const createRuleFromTransaction = (description: string, category: string, type: 'income' | 'expense') => {
    // Extrair palavras-chave da descrição
    const words = description.toLowerCase().split(' ')
    const keywords = words.filter(word => word.length > 3 && !['para', 'pelo', 'pela', 'com', 'via'].includes(word))
    
    const newRule: Omit<CategorizationRule, 'id' | 'createdAt'> = {
      name: `Regra para ${category}`,
      keywords: keywords.slice(0, 3), // Pegar as 3 primeiras palavras relevantes
      category,
      type,
      isActive: true,
      priority: rules.length + 1
    }
    
    addRule(newRule)
  }

  return {
    rules,
    historyPatterns,
    addRule,
    updateRule,
    deleteRule,
    categorizeTransaction,
    categorizeMultipleTransactions,
    createRuleFromTransaction,
    updateHistoryPatterns
  }
}
