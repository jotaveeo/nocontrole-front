import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  Transaction, 
  Category, 
  Goal, 
  Debt, 
  FixedExpense, 
  Investment, 
  Card, 
  Income,
  FinancialSummary 
} from '@/types';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Estado do contexto
interface FinanceState {
  // Dados
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  debts: Debt[];
  fixedExpenses: FixedExpense[];
  investments: Investment[];
  cards: Card[];
  incomes: Income[];
  
  // Estados de loading
  loading: {
    transactions: boolean;
    categories: boolean;
    goals: boolean;
    debts: boolean;
    fixedExpenses: boolean;
    investments: boolean;
    cards: boolean;
    incomes: boolean;
  };
  
  // Erros
  errors: {
    transactions?: string;
    categories?: string;
    goals?: string;
    debts?: string;
    fixedExpenses?: string;
    investments?: string;
    cards?: string;
    incomes?: string;
  };
  
  // Resumo financeiro
  summary: FinancialSummary | null;
}

// Ações do reducer
type FinanceAction =
  | { type: 'SET_LOADING'; entity: keyof FinanceState['loading']; loading: boolean }
  | { type: 'SET_ERROR'; entity: keyof FinanceState['errors']; error: string | undefined }
  | { type: 'SET_TRANSACTIONS'; transactions: Transaction[] }
  | { type: 'ADD_TRANSACTION'; transaction: Transaction }
  | { type: 'UPDATE_TRANSACTION'; transaction: Transaction }
  | { type: 'DELETE_TRANSACTION'; id: string }
  | { type: 'SET_CATEGORIES'; categories: Category[] }
  | { type: 'ADD_CATEGORY'; category: Category }
  | { type: 'UPDATE_CATEGORY'; category: Category }
  | { type: 'DELETE_CATEGORY'; id: string }
  | { type: 'SET_GOALS'; goals: Goal[] }
  | { type: 'ADD_GOAL'; goal: Goal }
  | { type: 'UPDATE_GOAL'; goal: Goal }
  | { type: 'DELETE_GOAL'; id: string }
  | { type: 'SET_DEBTS'; debts: Debt[] }
  | { type: 'ADD_DEBT'; debt: Debt }
  | { type: 'UPDATE_DEBT'; debt: Debt }
  | { type: 'DELETE_DEBT'; id: string }
  | { type: 'SET_FIXED_EXPENSES'; fixedExpenses: FixedExpense[] }
  | { type: 'ADD_FIXED_EXPENSE'; fixedExpense: FixedExpense }
  | { type: 'UPDATE_FIXED_EXPENSE'; fixedExpense: FixedExpense }
  | { type: 'DELETE_FIXED_EXPENSE'; id: string }
  | { type: 'SET_INVESTMENTS'; investments: Investment[] }
  | { type: 'ADD_INVESTMENT'; investment: Investment }
  | { type: 'UPDATE_INVESTMENT'; investment: Investment }
  | { type: 'DELETE_INVESTMENT'; id: string }
  | { type: 'SET_CARDS'; cards: Card[] }
  | { type: 'ADD_CARD'; card: Card }
  | { type: 'UPDATE_CARD'; card: Card }
  | { type: 'DELETE_CARD'; id: string }
  | { type: 'SET_INCOMES'; incomes: Income[] }
  | { type: 'ADD_INCOME'; income: Income }
  | { type: 'UPDATE_INCOME'; income: Income }
  | { type: 'DELETE_INCOME'; id: string }
  | { type: 'SET_SUMMARY'; summary: FinancialSummary };

// Estado inicial
const initialState: FinanceState = {
  transactions: [],
  categories: [],
  goals: [],
  debts: [],
  fixedExpenses: [],
  investments: [],
  cards: [],
  incomes: [],
  loading: {
    transactions: false,
    categories: false,
    goals: false,
    debts: false,
    fixedExpenses: false,
    investments: false,
    cards: false,
    incomes: false,
  },
  errors: {},
  summary: null,
};

// Reducer
const financeReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.entity]: action.loading,
        },
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.entity]: action.error,
        },
      };
      
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.transactions };
      
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.transaction] };
      
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.transaction.id ? action.transaction : t
        ),
      };
      
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.id),
      };
      
    case 'SET_CATEGORIES':
      return { ...state, categories: action.categories };
      
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.category] };
      
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c => 
          c.id === action.category.id ? action.category : c
        ),
      };
      
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.id),
      };
      
    case 'SET_GOALS':
      return { ...state, goals: action.goals };
      
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.goal] };
      
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g => 
          g.id === action.goal.id ? action.goal : g
        ),
      };
      
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.id),
      };
      
    case 'SET_DEBTS':
      return { ...state, debts: action.debts };
      
    case 'ADD_DEBT':
      return { ...state, debts: [...state.debts, action.debt] };
      
    case 'UPDATE_DEBT':
      return {
        ...state,
        debts: state.debts.map(d => 
          d.id === action.debt.id ? action.debt : d
        ),
      };
      
    case 'DELETE_DEBT':
      return {
        ...state,
        debts: state.debts.filter(d => d.id !== action.id),
      };
      
    case 'SET_FIXED_EXPENSES':
      return { ...state, fixedExpenses: action.fixedExpenses };
      
    case 'ADD_FIXED_EXPENSE':
      return { ...state, fixedExpenses: [...state.fixedExpenses, action.fixedExpense] };
      
    case 'UPDATE_FIXED_EXPENSE':
      return {
        ...state,
        fixedExpenses: state.fixedExpenses.map(f => 
          f.id === action.fixedExpense.id ? action.fixedExpense : f
        ),
      };
      
    case 'DELETE_FIXED_EXPENSE':
      return {
        ...state,
        fixedExpenses: state.fixedExpenses.filter(f => f.id !== action.id),
      };
      
    case 'SET_INVESTMENTS':
      return { ...state, investments: action.investments };
      
    case 'ADD_INVESTMENT':
      return { ...state, investments: [...state.investments, action.investment] };
      
    case 'UPDATE_INVESTMENT':
      return {
        ...state,
        investments: state.investments.map(i => 
          i.id === action.investment.id ? action.investment : i
        ),
      };
      
    case 'DELETE_INVESTMENT':
      return {
        ...state,
        investments: state.investments.filter(i => i.id !== action.id),
      };
      
    case 'SET_CARDS':
      return { ...state, cards: action.cards };
      
    case 'ADD_CARD':
      return { ...state, cards: [...state.cards, action.card] };
      
    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map(c => 
          c.id === action.card.id ? action.card : c
        ),
      };
      
    case 'DELETE_CARD':
      return {
        ...state,
        cards: state.cards.filter(c => c.id !== action.id),
      };
      
    case 'SET_INCOMES':
      return { ...state, incomes: action.incomes };
      
    case 'ADD_INCOME':
      return { ...state, incomes: [...state.incomes, action.income] };
      
    case 'UPDATE_INCOME':
      return {
        ...state,
        incomes: state.incomes.map(i => 
          i.id === action.income.id ? action.income : i
        ),
      };
      
    case 'DELETE_INCOME':
      return {
        ...state,
        incomes: state.incomes.filter(i => i.id !== action.id),
      };
      
    case 'SET_SUMMARY':
      return { ...state, summary: action.summary };
      
    default:
      return state;
  }
};

// Contexto
interface FinanceContextType extends FinanceState {
  // Ações para transações
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Ações para categorias
  fetchCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Ações para metas
  fetchGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Ações para dívidas
  fetchDebts: () => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id'>) => Promise<void>;
  updateDebt: (debt: Debt) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  
  // Ações para gastos fixos
  fetchFixedExpenses: () => Promise<void>;
  addFixedExpense: (fixedExpense: Omit<FixedExpense, 'id'>) => Promise<void>;
  updateFixedExpense: (fixedExpense: FixedExpense) => Promise<void>;
  deleteFixedExpense: (id: string) => Promise<void>;
  
  // Ações para investimentos
  fetchInvestments: () => Promise<void>;
  addInvestment: (investment: Omit<Investment, 'id'>) => Promise<void>;
  updateInvestment: (investment: Investment) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  
  // Ações para cartões
  fetchCards: () => Promise<void>;
  addCard: (card: Omit<Card, 'id'>) => Promise<void>;
  updateCard: (card: Card) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  
  // Ações para receitas
  fetchIncomes: () => Promise<void>;
  addIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  updateIncome: (income: Income) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  
  // Ações para resumo
  fetchSummary: () => Promise<void>;
  
  // Ação para carregar todos os dados
  fetchAllData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Provider
interface FinanceProviderProps {
  children: ReactNode;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const { toast } = useToast();
  
  // Função genérica para fazer fetch
  const fetchData = async <T,>(
    endpoint: string,
    entity: keyof FinanceState['loading'],
    setAction: (data: T[]) => FinanceAction
  ) => {
    dispatch({ type: 'SET_LOADING', entity, loading: true });
    dispatch({ type: 'SET_ERROR', entity, error: undefined });
    
    try {
      const response = await apiClient.get<T[]>(endpoint);
      
      if (response.success && response.data) {
        dispatch(setAction(response.data));
      } else {
        throw new Error(response.error || 'Erro ao carregar dados');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      dispatch({ type: 'SET_ERROR', entity, error: errorMessage });
      toast({
        title: 'Erro ao carregar dados',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', entity, loading: false });
    }
  };
  
  // Função genérica para adicionar item
  const addItem = async <T extends { id: string }>(
    endpoint: string,
    data: Omit<T, 'id'>,
    addAction: (item: T) => FinanceAction,
    successMessage: string
  ) => {
    try {
      const response = await apiClient.post<T>(endpoint, data);
      
      if (response.success && response.data) {
        dispatch(addAction(response.data));
        toast({
          title: 'Sucesso',
          description: successMessage,
          variant: 'default',
        });
      } else {
        throw new Error(response.error || 'Erro ao adicionar item');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Função genérica para atualizar item
  const updateItem = async <T extends { id: string }>(
    endpoint: string,
    data: T,
    updateAction: (item: T) => FinanceAction,
    successMessage: string
  ) => {
    try {
      const response = await apiClient.put<T>(`${endpoint}/${data.id}`, data);
      
      if (response.success && response.data) {
        dispatch(updateAction(response.data));
        toast({
          title: 'Sucesso',
          description: successMessage,
          variant: 'default',
        });
      } else {
        throw new Error(response.error || 'Erro ao atualizar item');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Função genérica para deletar item
  const deleteItem = async (
    endpoint: string,
    id: string,
    deleteAction: (id: string) => FinanceAction,
    successMessage: string
  ) => {
    try {
      const response = await apiClient.delete(`${endpoint}/${id}`);
      
      if (response.success) {
        dispatch(deleteAction(id));
        toast({
          title: 'Sucesso',
          description: successMessage,
          variant: 'default',
        });
      } else {
        throw new Error(response.error || 'Erro ao deletar item');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Implementação das ações
  const fetchTransactions = () => fetchData<Transaction>(API_ENDPOINTS.TRANSACTIONS, 'transactions', (data) => ({ type: 'SET_TRANSACTIONS', transactions: data }));
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => addItem(API_ENDPOINTS.TRANSACTIONS, transaction, (data) => ({ type: 'ADD_TRANSACTION', transaction: data }), 'Transação adicionada com sucesso');
  const updateTransaction = (transaction: Transaction) => updateItem(API_ENDPOINTS.TRANSACTIONS, transaction, (data) => ({ type: 'UPDATE_TRANSACTION', transaction: data }), 'Transação atualizada com sucesso');
  const deleteTransaction = (id: string) => deleteItem(API_ENDPOINTS.TRANSACTIONS, id, (id) => ({ type: 'DELETE_TRANSACTION', id }), 'Transação removida com sucesso');
  
  const fetchCategories = () => fetchData<Category>(API_ENDPOINTS.CATEGORIES, 'categories', (data) => ({ type: 'SET_CATEGORIES', categories: data }));
  const addCategory = (category: Omit<Category, 'id'>) => addItem(API_ENDPOINTS.CATEGORIES, category, (data) => ({ type: 'ADD_CATEGORY', category: data }), 'Categoria adicionada com sucesso');
  const updateCategory = (category: Category) => updateItem(API_ENDPOINTS.CATEGORIES, category, (data) => ({ type: 'UPDATE_CATEGORY', category: data }), 'Categoria atualizada com sucesso');
  const deleteCategory = (id: string) => deleteItem(API_ENDPOINTS.CATEGORIES, id, (id) => ({ type: 'DELETE_CATEGORY', id }), 'Categoria removida com sucesso');
  
  const fetchGoals = () => fetchData<Goal>(API_ENDPOINTS.GOALS, 'goals', (data) => ({ type: 'SET_GOALS', goals: data }));
  const addGoal = (goal: Omit<Goal, 'id'>) => addItem(API_ENDPOINTS.GOALS, goal, (data) => ({ type: 'ADD_GOAL', goal: data }), 'Meta adicionada com sucesso');
  const updateGoal = (goal: Goal) => updateItem(API_ENDPOINTS.GOALS, goal, (data) => ({ type: 'UPDATE_GOAL', goal: data }), 'Meta atualizada com sucesso');
  const deleteGoal = (id: string) => deleteItem(API_ENDPOINTS.GOALS, id, (id) => ({ type: 'DELETE_GOAL', id }), 'Meta removida com sucesso');
  
  const fetchDebts = () => fetchData<Debt>(API_ENDPOINTS.DEBTS, 'debts', (data) => ({ type: 'SET_DEBTS', debts: data }));
  const addDebt = (debt: Omit<Debt, 'id'>) => addItem(API_ENDPOINTS.DEBTS, debt, (data) => ({ type: 'ADD_DEBT', debt: data }), 'Dívida adicionada com sucesso');
  const updateDebt = (debt: Debt) => updateItem(API_ENDPOINTS.DEBTS, debt, (data) => ({ type: 'UPDATE_DEBT', debt: data }), 'Dívida atualizada com sucesso');
  const deleteDebt = (id: string) => deleteItem(API_ENDPOINTS.DEBTS, id, (id) => ({ type: 'DELETE_DEBT', id }), 'Dívida removida com sucesso');
  
  const fetchFixedExpenses = () => fetchData<FixedExpense>(API_ENDPOINTS.FIXED_EXPENSES, 'fixedExpenses', (data) => ({ type: 'SET_FIXED_EXPENSES', fixedExpenses: data }));
  const addFixedExpense = (fixedExpense: Omit<FixedExpense, 'id'>) => addItem(API_ENDPOINTS.FIXED_EXPENSES, fixedExpense, (data) => ({ type: 'ADD_FIXED_EXPENSE', fixedExpense: data }), 'Gasto fixo adicionado com sucesso');
  const updateFixedExpense = (fixedExpense: FixedExpense) => updateItem(API_ENDPOINTS.FIXED_EXPENSES, fixedExpense, (data) => ({ type: 'UPDATE_FIXED_EXPENSE', fixedExpense: data }), 'Gasto fixo atualizado com sucesso');
  const deleteFixedExpense = (id: string) => deleteItem(API_ENDPOINTS.FIXED_EXPENSES, id, (id) => ({ type: 'DELETE_FIXED_EXPENSE', id }), 'Gasto fixo removido com sucesso');
  
  const fetchInvestments = () => fetchData<Investment>(API_ENDPOINTS.INVESTMENTS, 'investments', (data) => ({ type: 'SET_INVESTMENTS', investments: data }));
  const addInvestment = (investment: Omit<Investment, 'id'>) => addItem(API_ENDPOINTS.INVESTMENTS, investment, (data) => ({ type: 'ADD_INVESTMENT', investment: data }), 'Investimento adicionado com sucesso');
  const updateInvestment = (investment: Investment) => updateItem(API_ENDPOINTS.INVESTMENTS, investment, (data) => ({ type: 'UPDATE_INVESTMENT', investment: data }), 'Investimento atualizado com sucesso');
  const deleteInvestment = (id: string) => deleteItem(API_ENDPOINTS.INVESTMENTS, id, (id) => ({ type: 'DELETE_INVESTMENT', id }), 'Investimento removido com sucesso');
  
  const fetchCards = () => fetchData<Card>(API_ENDPOINTS.CARDS, 'cards', (data) => ({ type: 'SET_CARDS', cards: data }));
  const addCard = (card: Omit<Card, 'id'>) => addItem(API_ENDPOINTS.CARDS, card, (data) => ({ type: 'ADD_CARD', card: data }), 'Cartão adicionado com sucesso');
  const updateCard = (card: Card) => updateItem(API_ENDPOINTS.CARDS, card, (data) => ({ type: 'UPDATE_CARD', card: data }), 'Cartão atualizado com sucesso');
  const deleteCard = (id: string) => deleteItem(API_ENDPOINTS.CARDS, id, (id) => ({ type: 'DELETE_CARD', id }), 'Cartão removido com sucesso');
  
  const fetchIncomes = () => fetchData<Income>(API_ENDPOINTS.INCOMES, 'incomes', (data) => ({ type: 'SET_INCOMES', incomes: data }));
  const addIncome = (income: Omit<Income, 'id'>) => addItem(API_ENDPOINTS.INCOMES, income, (data) => ({ type: 'ADD_INCOME', income: data }), 'Receita adicionada com sucesso');
  const updateIncome = (income: Income) => updateItem(API_ENDPOINTS.INCOMES, income, (data) => ({ type: 'UPDATE_INCOME', income: data }), 'Receita atualizada com sucesso');
  const deleteIncome = (id: string) => deleteItem(API_ENDPOINTS.INCOMES, id, (id) => ({ type: 'DELETE_INCOME', id }), 'Receita removida com sucesso');
  
  const fetchSummary = async () => {
    try {
      const response = await apiClient.get<FinancialSummary>('/api/summary');
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_SUMMARY', summary: response.data });
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  };
  
  const fetchAllData = async () => {
    await Promise.all([
      fetchTransactions(),
      fetchCategories(),
      fetchGoals(),
      fetchDebts(),
      fetchFixedExpenses(),
      fetchInvestments(),
      fetchCards(),
      fetchIncomes(),
      fetchSummary(),
    ]);
  };
  
  // Carregar dados iniciais
  useEffect(() => {
    fetchAllData();
  }, []);
  
  const value: FinanceContextType = {
    ...state,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    fetchDebts,
    addDebt,
    updateDebt,
    deleteDebt,
    fetchFixedExpenses,
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,
    fetchInvestments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    fetchCards,
    addCard,
    updateCard,
    deleteCard,
    fetchIncomes,
    addIncome,
    updateIncome,
    deleteIncome,
    fetchSummary,
    fetchAllData,
  };
  
  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinanceContext = () => {
  const context = useContext(FinanceContext);
  
  if (context === undefined) {
    throw new Error('useFinanceContext deve ser usado dentro de um FinanceProvider');
  }
  
  return context;
};

// Alias para compatibilidade com código existente
export const useFinanceExtendedContext = useFinanceContext;
