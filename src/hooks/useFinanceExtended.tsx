import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { 
  Transaction, 
  Category, 
  FinancialGoal, 
  WishlistItem, 
  PiggyBankEntry, 
  Debt, 
  CreditCard, 
  CategoryLimit, 
  Investment, 
  FixedExpense, 
  IncomeSource 
} from '@/types/finance'
import { API_ENDPOINTS, makeApiRequest } from '@/lib/api'

const defaultCategories: Category[] = [
  // Categorias de Receita
  { id: '1', name: 'Salário', icon: '💰', color: '#10B981', type: 'income' },
  { id: '2', name: 'Freelance', icon: '💻', color: '#3B82F6', type: 'income' },
  { id: '3', name: 'Investimentos', icon: '📈', color: '#8B5CF6', type: 'income' },
  { id: '4', name: 'Comissões', icon: '🤝', color: '#06B6D4', type: 'income' },
  { id: '5', name: 'Aluguel Recebido', icon: '🏠', color: '#84CC16', type: 'income' },
  { id: '6', name: 'Vendas', icon: '🛍️', color: '#F59E0B', type: 'income' },
  { id: '7', name: '13º Salário', icon: '🎁', color: '#EC4899', type: 'income' },
  { id: '8', name: 'Férias', icon: '🏖️', color: '#14B8A6', type: 'income' },
  { id: '9', name: 'Bonificação', icon: '🏆', color: '#F97316', type: 'income' },
  { id: '10', name: 'Restituição IR', icon: '📋', color: '#6366F1', type: 'income' },
  { id: '11', name: 'Pensão Recebida', icon: '👨‍👩‍👧‍👦', color: '#8B5CF6', type: 'income' },
  { id: '12', name: 'Renda Extra', icon: '💪', color: '#10B981', type: 'income' },

  // Categorias de Despesa - Essenciais
  { id: '13', name: 'Alimentação', icon: '🍽️', color: '#EF4444', type: 'expense' },
  { id: '14', name: 'Supermercado', icon: '🛒', color: '#DC2626', type: 'expense' },
  { id: '15', name: 'Transporte', icon: '🚗', color: '#F59E0B', type: 'expense' },
  { id: '16', name: 'Combustível', icon: '⛽', color: '#D97706', type: 'expense' },
  { id: '17', name: 'Moradia', icon: '🏠', color: '#F97316', type: 'expense' },
  { id: '18', name: 'Aluguel', icon: '🔑', color: '#EA580C', type: 'expense' },
  { id: '19', name: 'Contas Básicas', icon: '📄', color: '#7C2D12', type: 'expense' },
  { id: '20', name: 'Energia Elétrica', icon: '💡', color: '#FCD34D', type: 'expense' },
  { id: '21', name: 'Água', icon: '💧', color: '#0EA5E9', type: 'expense' },
  { id: '22', name: 'Internet', icon: '📶', color: '#3B82F6', type: 'expense' },
  { id: '23', name: 'Telefone', icon: '📱', color: '#6366F1', type: 'expense' },
  { id: '24', name: 'Gás', icon: '🔥', color: '#F59E0B', type: 'expense' },

  // Saúde e Bem-estar
  { id: '25', name: 'Saúde', icon: '🏥', color: '#06B6D4', type: 'expense' },
  { id: '26', name: 'Medicamentos', icon: '💊', color: '#0891B2', type: 'expense' },
  { id: '27', name: 'Plano de Saúde', icon: '🩺', color: '#0E7490', type: 'expense' },
  { id: '28', name: 'Academia', icon: '💪', color: '#DC2626', type: 'expense' },
  { id: '29', name: 'Terapia', icon: '🧠', color: '#7C3AED', type: 'expense' },

  // Educação e Desenvolvimento
  { id: '30', name: 'Educação', icon: '📚', color: '#84CC16', type: 'expense' },
  { id: '31', name: 'Cursos', icon: '🎓', color: '#65A30D', type: 'expense' },
  { id: '32', name: 'Livros', icon: '📖', color: '#16A34A', type: 'expense' },
  { id: '33', name: 'Material Escolar', icon: '✏️', color: '#15803D', type: 'expense' },

  // Lazer e Entretenimento
  { id: '34', name: 'Lazer', icon: '🎮', color: '#EC4899', type: 'expense' },
  { id: '35', name: 'Cinema', icon: '🎬', color: '#DB2777', type: 'expense' },
  { id: '36', name: 'Streaming', icon: '📺', color: '#BE185D', type: 'expense' },
  { id: '37', name: 'Jogos', icon: '🎯', color: '#9D174D', type: 'expense' },
  { id: '38', name: 'Viagens', icon: '✈️', color: '#0EA5E9', type: 'expense' },
  { id: '39', name: 'Restaurantes', icon: '🍕', color: '#F97316', type: 'expense' },
  { id: '40', name: 'Bares', icon: '🍺', color: '#EA580C', type: 'expense' },

  // Vestuário e Cuidados Pessoais
  { id: '41', name: 'Roupas', icon: '👕', color: '#8B5CF6', type: 'expense' },
  { id: '42', name: 'Sapatos', icon: '👟', color: '#7C3AED', type: 'expense' },
  { id: '43', name: 'Cabeleireiro', icon: '💇', color: '#EC4899', type: 'expense' },
  { id: '44', name: 'Cosméticos', icon: '💄', color: '#DB2777', type: 'expense' },

  // Financeiro
  { id: '45', name: 'Cartão de Crédito', icon: '💳', color: '#EF4444', type: 'expense' },
  { id: '46', name: 'Empréstimos', icon: '🏦', color: '#DC2626', type: 'expense' },
  { id: '47', name: 'Financiamentos', icon: '🏠', color: '#B91C1C', type: 'expense' },
  { id: '48', name: 'Taxas Bancárias', icon: '🏛️', color: '#991B1B', type: 'expense' },
  { id: '49', name: 'Seguros', icon: '🛡️', color: '#7F1D1D', type: 'expense' },

  // Impostos e Obrigações
  { id: '50', name: 'Impostos', icon: '📊', color: '#374151', type: 'expense' },
  { id: '51', name: 'IPTU', icon: '🏘️', color: '#4B5563', type: 'expense' },
  { id: '52', name: 'IPVA', icon: '🚙', color: '#6B7280', type: 'expense' },
  { id: '53', name: 'Multas', icon: '⚠️', color: '#9CA3AF', type: 'expense' },

  // Família e Pets
  { id: '54', name: 'Crianças', icon: '👶', color: '#FCD34D', type: 'expense' },
  { id: '55', name: 'Pets', icon: '🐕', color: '#FBBF24', type: 'expense' },
  { id: '56', name: 'Presentes', icon: '🎁', color: '#F59E0B', type: 'expense' },

  // Investimentos e Poupança
  { id: '57', name: 'Poupança', icon: '🐷', color: '#10B981', type: 'expense' },
  { id: '58', name: 'Investimentos', icon: '📈', color: '#059669', type: 'expense' },
  { id: '59', name: 'Previdência', icon: '👴', color: '#047857', type: 'expense' },

  // Diversos
  { id: '60', name: 'Doações', icon: '❤️', color: '#F87171', type: 'expense' },
  { id: '61', name: 'Assinaturas', icon: '📝', color: '#6366F1', type: 'expense' },
  { id: '62', name: 'Outros', icon: '📦', color: '#9CA3AF', type: 'expense' },
];

export const useFinanceExtended = () => {
  // Usar o hook de autenticação para verificar se usuário está logado
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  
  // State management for all financial data
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([]) // Inicia vazio
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([])
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [piggyBankEntries, setPiggyBankEntries] = useState<PiggyBankEntry[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [categoryLimits, setCategoryLimits] = useState<CategoryLimit[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load data from localStorage and API
  useEffect(() => {
    if (isInitialized) return // Evita re-execução do carregamento inicial
    
    const loadData = (key: string, setter: Function, defaultValue: any = []) => {
      try {
        const saved = localStorage.getItem(`financeflow_${key}`)
        if (saved) {
          const parsed = JSON.parse(saved)
          setter(parsed)
        } else if (key === 'categories') {
          setter(defaultCategories)
        } else {
          setter(defaultValue)
        }
      } catch (error) {
        // erro ao carregar do localStorage
        if (key === 'categories') {
          setter(defaultCategories)
        } else {
          setter(defaultValue)
        }
      }
    }

    const loadDataFromAPI = async (endpoint: string, setter: Function) => {
      // Verificar se há token válido antes de fazer requisições
      const accessToken = localStorage.getItem('access_token')
      if (!accessToken) {
        // sem token, não carrega
        return
      }
      
      try {
        // carregando dados da API
        
        const response = await makeApiRequest(endpoint, {
          method: 'GET'
        });
        
        // resposta recebida
        
        // A API retorna {success, message, data}, precisamos extrair o campo data
        let data = response.data || response;
        
        // Se data é um objeto com propriedade 'data' (estrutura paginada), extrair o array
        if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
          data = data.data;
        } else if (data && typeof data === 'object' && data.categorias && Array.isArray(data.categorias)) {
          // Para categorias que vêm com estrutura {categorias: []}
          data = data.categorias;
        }
        
        // Para categorias, aplicar mapeamento de campos (Backend → Frontend)
        if (endpoint === API_ENDPOINTS.CATEGORIES && Array.isArray(data)) {
          // categorias carregadas
          data = data.map((cat: any) => ({
            id: cat.id || cat._id,
            name: cat.nome, // Backend sempre usa "nome"
            icon: cat.icone, // Backend sempre usa "icone"
            color: cat.cor, // Backend sempre usa "cor"
            type: (cat.tipo === 'receita' ? 'income' : 'expense') as 'income' | 'expense' // Conversão de tipo necessária
          }));
        }
        
        // Garantir que data é um array
        if (Array.isArray(data)) {
          setter(data);
        } else {
          // data não é array
          setter([]);
        }
      } catch (error) {
        // erro ao carregar da API
        // Fallback para localStorage se API falhar
        const key = endpoint.replace('/', '');
        loadData(key, setter);
        
        // Adicionar dados de exemplo para wishlist se não há dados
        if (endpoint === API_ENDPOINTS.WISHLIST) {
          const savedWishlist = localStorage.getItem('financeflow_wishlist');
          if (!savedWishlist) {
            const exampleWishlist = [
              {
                id: '1',
                title: 'casa',
                estimatedPrice: 4500,
                reason: 'compra',
                urgency: 'medium' as const,
                priority: 5,
                decisionDate: '2025-07-24', // Uma semana a partir de hoje
                category: 'undefined' as const,
                status: 'thinking' as const,
                createdAt: new Date().toISOString()
              },
              {
                id: '2',
                title: 'iphone',
                estimatedPrice: 10000,
                reason: 'trabalho',
                urgency: 'medium' as const,
                priority: 5,
                decisionDate: '2025-07-24', // Uma semana a partir de hoje
                category: 'undefined' as const,
                status: 'rejected' as const,
                createdAt: new Date().toISOString()
              },
              {
                id: '3',
                title: 'compra',
                estimatedPrice: 323,
                reason: 'compra',
                urgency: 'low' as const,
                priority: 1,
                decisionDate: '2025-07-18', // Hoje
                category: 'undefined' as const,
                status: 'thinking' as const,
                createdAt: new Date().toISOString()
              }
            ];
            setter(exampleWishlist);
          }
        }
      }
    }

    const initializeData = async () => {
      // Não inicializar se ainda está carregando autenticação
      if (authLoading) {
        return;
      }
      
      setIsLoading(true)
      
      // Verificar se há token válido antes de fazer requisições
      const accessToken = localStorage.getItem('access_token')
      
      try {
        if (isAuthenticated && accessToken && user) {
          // Só carregar da API se estiver autenticado
          await Promise.all([
            loadDataFromAPI(API_ENDPOINTS.TRANSACTIONS, setTransactions),
            loadDataFromAPI(API_ENDPOINTS.CATEGORIES, setCategories),
            loadDataFromAPI(API_ENDPOINTS.WISHLIST, setWishlistItems),
            loadDataFromAPI(API_ENDPOINTS.DEBTS, setDebts),
            loadDataFromAPI(API_ENDPOINTS.LIMITS, setCategoryLimits),
            loadDataFromAPI(API_ENDPOINTS.FIXED_EXPENSES, setFixedExpenses)
          ]);
        } else {
          // Se não autenticado, usar categorias padrão para interface funcionar
          setCategories(defaultCategories);
        }
        
        // Carregar dados que não dependem da API (sempre carregar) - exceto categorias
        loadData('goals', setFinancialGoals)
        loadData('creditcards', setCreditCards)
        loadData('investments', setInvestments)
        loadData('incomesources', setIncomeSources)
      } catch (error) {
        // erro ao inicializar dados
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    initializeData()
  }, [isInitialized, isAuthenticated, authLoading, user])

  // Save data to localStorage - with error handling (only after initialization)
  const saveToLocalStorage = (key: string, data: any) => {
    if (!isInitialized) return // Não salvar durante a inicialização
    try {
      localStorage.setItem(`financeflow_${key}`, JSON.stringify(data))
    } catch (error) {
      // erro ao salvar no localStorage
    }
  }

  useEffect(() => saveToLocalStorage('transactions', transactions), [transactions, isInitialized])
  useEffect(() => saveToLocalStorage('categories', categories), [categories, isInitialized])
  useEffect(() => saveToLocalStorage('goals', financialGoals), [financialGoals, isInitialized])
  useEffect(() => saveToLocalStorage('wishlist', wishlistItems), [wishlistItems, isInitialized])
  useEffect(() => saveToLocalStorage('piggybank', piggyBankEntries), [piggyBankEntries, isInitialized])
  useEffect(() => saveToLocalStorage('debts', debts), [debts, isInitialized])
  useEffect(() => saveToLocalStorage('creditcards', creditCards), [creditCards, isInitialized])
  useEffect(() => saveToLocalStorage('limits', categoryLimits), [categoryLimits, isInitialized])
  useEffect(() => saveToLocalStorage('investments', investments), [investments, isInitialized])
  useEffect(() => saveToLocalStorage('fixedexpenses', fixedExpenses), [fixedExpenses, isInitialized])
  useEffect(() => saveToLocalStorage('incomesources', incomeSources), [incomeSources, isInitialized])

  // Transaction management - Fixed to auto-generate createdAt and force re-render
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    }
    setTransactions(prev => [newTransaction, ...prev])
  }

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  // Categories management - com integração ao backend
  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      
      // Converter do formato frontend para backend (conforme documentação API)
      const backendCategory = {
        nome: category.name,
        icone: category.icon,
        cor: category.color,
        tipo: category.type === 'income' ? 'receita' : 'despesa',
        ativo: true,
        descricao: "" // Campo obrigatório no backend
      };
      
      // payload preparado

      const response = await makeApiRequest(API_ENDPOINTS.CATEGORIES, {
        method: 'POST',
        body: JSON.stringify(backendCategory)
      });
      if (response.success) {
        await reloadCategories();
      } else {
        const newCategory: Category = {
          ...category,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        };
        setCategories(prev => [...prev, newCategory]);
      }
    } catch (error) {
      const newCategory: Category = {
        ...category,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      };
      setCategories(prev => [...prev, newCategory]);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      
      // Converter atualizações para formato backend (conforme documentação API)
      const backendUpdates: any = {};
      if (updates.name) backendUpdates.nome = updates.name;
      if (updates.icon) backendUpdates.icone = updates.icon;
      if (updates.color) backendUpdates.cor = updates.color;
      if (updates.type) backendUpdates.tipo = updates.type === 'income' ? 'receita' : 'despesa';
      // Manter ativo como true por padrão
      backendUpdates.ativo = true;

      // payload de atualização preparado

      const response = await makeApiRequest(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(backendUpdates)
      });
      if (response.success) {
        await reloadCategories();
      } else {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      }
    } catch (error) {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      
      const response = await makeApiRequest(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
        method: 'DELETE'
      });
      if (response.success) {
        await reloadCategories();
      } else {
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  // Goals management
  const addFinancialGoal = (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    }
    setFinancialGoals(prev => [...prev, newGoal])
  }

  const updateFinancialGoal = (id: string, updates: Partial<FinancialGoal>) => {
    setFinancialGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g))
  }

  const deleteFinancialGoal = (id: string) => {
    setFinancialGoals(prev => prev.filter(g => g.id !== id))
  }

  // Wishlist
  const addWishlistItem = async (item: Omit<WishlistItem, 'id' | 'createdAt'>) => {
    try {
      const response = await makeApiRequest(API_ENDPOINTS.WISHLIST, {
        method: 'POST',
        body: JSON.stringify(item)
      });
      const newItem = response.data || response;
      setWishlistItems(prev => [newItem, ...prev]);
    } catch (error) {
      const localItem: WishlistItem = {
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      setWishlistItems(prev => [localItem, ...prev]);
    }
  }

  const updateWishlistItem = async (id: string, updates: Partial<WishlistItem>) => {
    try {
      const response = await makeApiRequest(`${API_ENDPOINTS.WISHLIST}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      const updatedItem = response.data || response;
      setWishlistItems(prev => prev.map(item => item.id === id ? updatedItem : item));
    } catch (error) {
      setWishlistItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    }
  }

  const deleteWishlistItem = async (id: string) => {
    try {
      await makeApiRequest(`${API_ENDPOINTS.WISHLIST}/${id}`, {
        method: 'DELETE'
      });
      setWishlistItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      setWishlistItems(prev => prev.filter(item => item.id !== id));
    }
  }

  // PiggyBank
  const addPiggyBankEntry = (entry: Omit<PiggyBankEntry, 'id' | 'createdAt'>) => {
    const newEntry: PiggyBankEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    }
    setPiggyBankEntries(prev => [newEntry, ...prev])
  }

  const updatePiggyBankEntry = (id: string, updates: Partial<PiggyBankEntry>) => {
    setPiggyBankEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }

  const deletePiggyBankEntry = (id: string) => {
    setPiggyBankEntries(prev => prev.filter(e => e.id !== id))
  }

  // Debts
  const addDebt = (debt: Omit<Debt, 'id' | 'createdAt'>) => {
    const newDebt: Debt = {
      ...debt,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    }
    setDebts(prev => [newDebt, ...prev])
  }

  const updateDebt = (id: string, updates: Partial<Debt>) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))
  }

  const deleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id))
  }

  // Credit Cards
  const addCreditCard = (card: Omit<CreditCard, 'id' | 'createdAt'>) => {
    const newCard: CreditCard = {
      ...card,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    }
    setCreditCards(prev => [newCard, ...prev])
  }

  const updateCreditCard = (id: string, updates: Partial<CreditCard>) => {
    setCreditCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const deleteCreditCard = (id: string) => {
    setCreditCards(prev => prev.filter(c => c.id !== id))
  }

  // Fixed Expenses
  const addFixedExpense = (expense: Omit<FixedExpense, 'id' | 'createdAt'>) => {
    const newExpense: FixedExpense = {
      ...expense,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    }
    setFixedExpenses(prev => [newExpense, ...prev])
  }

  const updateFixedExpense = (id: string, updates: Partial<FixedExpense>) => {
    setFixedExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }

  const deleteFixedExpense = (id: string) => {
    setFixedExpenses(prev => prev.filter(e => e.id !== id))
  }

  // Income Sources
  const addIncomeSource = (source: Omit<IncomeSource, 'id' | 'createdAt'>) => {
    const newSource: IncomeSource = {
      ...source,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    }
    setIncomeSources(prev => [newSource, ...prev])
  }

  const updateIncomeSource = (id: string, updates: Partial<IncomeSource>) => {
    setIncomeSources(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const deleteIncomeSource = (id: string) => {
    setIncomeSources(prev => prev.filter(s => s.id !== id))
  }

  // Category Limits
  const addCategoryLimit = (limit: Omit<CategoryLimit, 'id'>) => {
    const newLimit: CategoryLimit = {
      ...limit,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }
    setCategoryLimits(prev => [newLimit, ...prev])
  }

  const updateCategoryLimit = (id: string, updates: Partial<CategoryLimit>) => {
    setCategoryLimits(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
  }

  const deleteCategoryLimit = (id: string) => {
    setCategoryLimits(prev => prev.filter(l => l.id !== id))
  }

  // Investments
  const addInvestment = (investment: Omit<Investment, 'id' | 'createdAt'>) => {
    const newInvestment: Investment = {
      ...investment,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    }
    setInvestments(prev => [newInvestment, ...prev])
  }

  const updateInvestment = (id: string, updates: Partial<Investment>) => {
    setInvestments(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(i => i.id !== id))
  }

  // Função para criar categorias padrão via backend
  const createDefaultCategories = async () => {
    try {
      // 1. Buscar todas as categorias existentes
      const response = await makeApiRequest(API_ENDPOINTS.CATEGORIES, { method: 'GET' });
      let existing = response.data || response;
      if (existing && typeof existing === 'object' && existing.data && Array.isArray(existing.data)) {
        existing = existing.data;
      } else if (existing && typeof existing === 'object' && existing.categorias && Array.isArray(existing.categorias)) {
        existing = existing.categorias;
      }
      // 2. Excluir todas as categorias existentes
      if (Array.isArray(existing)) {
        for (const cat of existing) {
          const id = cat.id || cat._id;
          if (id) {
            try {
              await makeApiRequest(`${API_ENDPOINTS.CATEGORIES}/${id}`, { method: 'DELETE' });
            } catch {}
          }
        }
      }
      // 3. Criar todas as categorias padrão
      let createdCount = 0;
      let errorCount = 0;
      for (const category of defaultCategories) {
        try {
          const backendCategory = {
            nome: category.name,
            icone: category.icon,
            cor: category.color,
            tipo: category.type === 'income' ? 'receita' : 'despesa',
            ativo: true,
            descricao: `Categoria ${category.name} criada automaticamente`
          };
          const resp = await makeApiRequest(API_ENDPOINTS.CATEGORIES, {
            method: 'POST',
            body: JSON.stringify(backendCategory)
          });
          if (resp.success) {
            createdCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }
      await reloadCategories();
      if (createdCount > 0) {
        return {
          success: true,
          message: `${createdCount} categorias padrão criadas com sucesso!${errorCount > 0 ? ` (${errorCount} falharam)` : ''}`
        };
      } else {
        return { success: false, message: 'Não foi possível criar nenhuma categoria padrão' };
      }
    } catch (error) {
      return { success: false, message: 'Erro ao criar categorias padrão' };
    }
  };

  // Função para recarregar categorias da API
  const reloadCategories = async () => {
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      console.log('No access token found, skipping categories reload')
      return
    }
    
    try {
      // Buscar todas as categorias - sem parâmetros primeiro para debugar
      console.log('🔍 Recarregando categorias da API...');
      const response = await makeApiRequest(API_ENDPOINTS.CATEGORIES);
      console.log('📦 Resposta completa da API:', response);
      
      let data = response;
      
      // Debug: mostrar estrutura da resposta
      console.log('🔧 Estrutura da resposta:', {
        hasData: !!response.data,
        hasCategorias: !!(response.categorias),
        responseType: typeof response,
        responseKeys: Object.keys(response || {})
      });
      
      // Verificar diferentes estruturas de resposta
      if (response && response.data) {
        data = response.data;
        console.log('✅ Usando response.data');
      } else if (response && response.categorias) {
        data = response.categorias;
        console.log('✅ Usando response.categorias');
      } else if (Array.isArray(response)) {
        data = response;
        console.log('✅ Response já é array');
      }
      
      console.log('📋 Data final para processar:', data);
      
      // Aplicar mapeamento de campos (Backend → Frontend)
      if (Array.isArray(data)) {
        console.log(`✅ Processando ${data.length} categorias da API`);
        const mappedCategories = data.map((cat: any) => ({
          id: cat.id || cat._id,
          name: cat.nome, // Backend sempre usa "nome"
          icon: cat.icone, // Backend sempre usa "icone" 
          color: cat.cor, // Backend sempre usa "cor"
          type: (cat.tipo === 'receita' ? 'income' : 'expense') as 'income' | 'expense' // Conversão de tipo
        }));
        console.log('🎯 Categorias mapeadas:', mappedCategories);
        setCategories(mappedCategories);
      } else {
        console.warn('⚠️ Data não é um array, setando vazio. Data:', data);
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ Error reloading categories:', error);
    }
  }

  // Função para reativar todas as categorias do usuário (soft undelete)
  const reactivateAllCategories = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/api/categories/reactivate-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        await reloadCategories();
        return { success: true, message: `${result.updatedCount || 'Todas'} categorias reativadas!` };
      } else {
        return { success: false, message: result.message || 'Erro ao reativar categorias.' };
      }
    } catch (error) {
      return { success: false, message: 'Erro ao reativar categorias.' };
    }
  };

  return {
    // State
    transactions,
    categories,
    financialGoals,
    wishlistItems,
    piggyBankEntries,
    debts,
    creditCards,
    categoryLimits,
    investments,
    fixedExpenses,
    incomeSources,
    
    // Loading state
    isLoading,
    isInitialized,

    // Transaction methods
    addTransaction,
    updateTransaction,
    deleteTransaction,

    // Category methods
    addCategory,
    updateCategory,
    deleteCategory,

    // Goal methods
    addFinancialGoal,
    updateFinancialGoal,
    deleteFinancialGoal,

    // Wishlist methods
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,

    // PiggyBank methods
    addPiggyBankEntry,
    updatePiggyBankEntry,
    deletePiggyBankEntry,

    // Debt methods
    addDebt,
    updateDebt,
    deleteDebt,

    // Credit Card methods
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,

    // Fixed Expense methods
    addFixedExpense,
    updateFixedExpense,
    deleteFixedExpense,

    // Income Source methods
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,

    // Category Limit methods
    addCategoryLimit,
    updateCategoryLimit,
    deleteCategoryLimit,

    // Investment methods
    addInvestment,
    updateInvestment,
    deleteInvestment,

    // Utility methods
    reloadCategories,
    createDefaultCategories,
    reactivateAllCategories,
  }
}
