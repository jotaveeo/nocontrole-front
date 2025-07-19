// Tipos TypeScript para o sistema financeiro

// Tipos base
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// Usuário
export interface User extends BaseEntity {
  nome: string;
  email: string;
  avatar?: string;
  configuracoes?: UserSettings;
}

export interface UserSettings {
  tema: 'light' | 'dark' | 'system';
  moeda: string;
  idioma: string;
  notificacoes: boolean;
}

// Categoria
export interface Category extends BaseEntity {
  nome: string;
  cor: string;
  icone?: string;
  tipo: 'receita' | 'despesa';
  ativo: boolean;
  descricao?: string;
}

// Transação
export interface Transaction extends BaseEntity {
  tipo: 'receita' | 'despesa';
  valor: number;
  descricao: string;
  data: string;
  categoria?: Category;
  categoriaId?: string;
  cartao?: Card;
  cartaoId?: string;
  recorrente: boolean;
  observacoes?: string;
  tags?: string[];
  anexos?: string[];
  status: 'pendente' | 'confirmada' | 'cancelada';
}

// Receita
export interface Income extends BaseEntity {
  fonte: string;
  tipo: string;
  valor: number;
  data: string;
  recorrente: boolean;
  observacoes?: string;
  categoria?: Category;
  categoriaId?: string;
}

// Meta
export interface Goal extends BaseEntity {
  nome: string;
  valorAlvo: number;
  valorAtual: number;
  prazo: string;
  descricao?: string;
  ativo: boolean;
  categoria?: Category;
  categoriaId?: string;
  progresso?: number;
}

// Dívida
export interface Debt extends BaseEntity {
  credor: string;
  valorTotal: number;
  valorPago: number;
  valorRestante: number;
  dataVencimento: string;
  juros?: number;
  parcelas?: number;
  parcelaAtual?: number;
  status: 'ativa' | 'paga' | 'vencida';
  observacoes?: string;
  categoria?: Category;
  categoriaId?: string;
}

// Gasto Fixo
export interface FixedExpense extends BaseEntity {
  nome: string;
  valor: number;
  diaVencimento: number;
  ativo: boolean;
  categoria?: Category;
  categoriaId?: string;
  observacoes?: string;
  proximoVencimento?: string;
}

// Investimento
export interface Investment extends BaseEntity {
  nome: string;
  tipo: string;
  valorInvestido: number;
  valorAtual: number;
  dataInvestimento: string;
  rentabilidade?: number;
  observacoes?: string;
  ativo: boolean;
}

// Cartão
export interface Card extends BaseEntity {
  nome: string;
  bandeira: string;
  limite: number;
  diaVencimento: number;
  diaFechamento: number;
  ativo: boolean;
  cor?: string;
}

// Wishlist
export interface WishlistItem extends BaseEntity {
  item: string;
  descricao: string;
  valor: number;
  valorEconomizado?: number;
  prioridade: number;
  status: 'desejando' | 'economizando' | 'comprado' | 'cancelado';
  categoria?: Category;
  categoriaId?: string;
}

// Limite de Categoria
export interface CategoryLimit extends BaseEntity {
  categoria: Category;
  categoriaId: string;
  limite: number;
  gastoAtual: number;
  periodo: 'mensal' | 'anual';
  ativo: boolean;
}

// Tipos para relatórios
export interface MonthlyReport {
  mes: number;
  ano: number;
  receitas: number;
  despesas: number;
  saldo: number;
  transacoes: number;
}

export interface CategoryReport {
  categoria: Category;
  valor: number;
  porcentagem: number;
  transacoes: number;
}

export interface FinancialSummary {
  saldoAtual: number;
  receitasMes: number;
  despesasMes: number;
  metasAtivas: number;
  dividasAtivas: number;
  investimentoTotal: number;
}

// Tipos para formulários
export interface TransactionForm {
  tipo: 'receita' | 'despesa';
  valor: string;
  descricao: string;
  data: string;
  categoriaId: string;
  cartaoId?: string;
  recorrente: boolean;
  observacoes?: string;
}

export interface CategoryForm {
  nome: string;
  cor: string;
  icone?: string;
  tipo: 'receita' | 'despesa';
  descricao?: string;
}

export interface GoalForm {
  nome: string;
  valorAlvo: string;
  valorAtual: string;
  prazo: string;
  descricao?: string;
  categoriaId?: string;
}

export interface IncomeForm {
  fonte: string;
  tipo: string;
  valor: string;
  data: string;
  recorrente: boolean;
  observacoes?: string;
  categoriaId?: string;
}

// Tipos para filtros
export interface TransactionFilter {
  tipo?: 'receita' | 'despesa';
  categoriaId?: string;
  cartaoId?: string;
  dataInicio?: string;
  dataFim?: string;
  valorMin?: number;
  valorMax?: number;
  recorrente?: boolean;
  status?: 'pendente' | 'confirmada' | 'cancelada';
}

export interface ReportFilter {
  periodo: 'mes' | 'ano' | 'personalizado';
  dataInicio?: string;
  dataFim?: string;
  categorias?: string[];
  tipo?: 'receita' | 'despesa';
}

// Tipos para paginação
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos para notificações
export interface Notification extends BaseEntity {
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  lida: boolean;
  acao?: {
    label: string;
    url: string;
  };
}

// Tipos para configurações do sistema
export interface SystemConfig {
  versao: string;
  manutencao: boolean;
  funcionalidades: {
    importacao: boolean;
    exportacao: boolean;
    notificacoes: boolean;
    relatorios: boolean;
  };
}

// Tipos para validação
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// Tipos para estados de loading
export interface LoadingState {
  isLoading: boolean;
  operation?: string;
}

// Tipos para erros
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Tipos para contexto da aplicação
export interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: LoadingState;
  error: AppError | null;
  notifications: Notification[];
}

// Tipos para hooks customizados
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseFormResult<T> {
  values: T;
  errors: ValidationError[];
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void>) => Promise<void>;
  reset: () => void;
}
