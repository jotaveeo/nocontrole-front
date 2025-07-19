
export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: 'income' | 'expense' | 'both'
}

export interface FinancialGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: string
  description: string
  status: 'active' | 'completed' | 'archived'
  createdAt: string
}

export interface WishlistItem {
  id: string
  title: string
  estimatedPrice: number
  reason: string
  urgency: 'low' | 'medium' | 'high'
  priority: number
  decisionDate: string
  category: 'necessary' | 'superfluous' | 'undefined'
  status: 'thinking' | 'approved' | 'rejected' | 'purchased'
  createdAt: string
}

export interface PiggyBankEntry {
  id: string
  amount: number
  description: string
  source: string
  date: string
  createdAt: string
}

export interface Debt {
  id: string
  creditor: string
  originalAmount: number
  currentAmount: number
  interestRate: number
  status: 'active' | 'negotiated' | 'paid'
  nextReviewDate?: string
  notes?: string
  createdAt: string
}

export interface CreditCard {
  id: string
  name: string
  limit: number
  currentBalance: number
  closingDay: number
  dueDay: number
  createdAt: string
}

export interface CategoryLimit {
  id: string
  categoryName: string
  monthlyLimit: number
  currentSpent: number
  month: string
  year: string
}

export interface Investment {
  id: string
  name: string
  type: string
  investedAmount: number
  currentValue: number
  profitLoss: number
  applicationDate: string
  createdAt: string
}

export interface FixedExpense {
  id: string
  description: string
  amount: number
  category: string
  dayOfMonth: number
  isActive: boolean
  createdAt: string
}

export interface IncomeSource {
  id: string
  source: string
  amount: number
  frequency: 'monthly' | 'weekly' | 'annual' | 'sporadic'
  description: string
  isActive: boolean
  createdAt: string
}
