
export interface CategorizationRule {
  id: string
  name: string
  keywords: string[]
  category: string
  type?: 'income' | 'expense' | 'both'
  isActive: boolean
  createdAt: string
  priority: number
}

export interface HistoryPattern {
  description: string
  category: string
  count: number
  lastUsed: string
}

export interface AutoCategorizationResult {
  matched: boolean
  category: string
  confidence: number
  rule?: string
  source: 'rule' | 'history' | 'manual'
}
