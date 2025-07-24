// Cliente HTTP unificado para o sistema financeiro
import { Logger } from "@/utils/logger";

// Configuração para modo de desenvolvimento (quando backend não está disponível)
const DEVELOPMENT_MODE = false; // Mude para true se quiser testar sem backend

// Logger para API
const apiLogger = new Logger("API");

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: string | FormData;
  headers?: Record<string, string>;
}

// Endpoints da API baseados no backend Flask
export const API_ENDPOINTS = {
  // Cofrinho
  PIGGY_BANK: '/api/piggybank',
  // Autenticação
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH_TOKEN: '/api/auth/refresh',
  
  // Usuários
  USER_PROFILE: '/api/users/profile',
  USER_DASHBOARD: '/api/users/dashboard',
  USER_SETTINGS: '/api/users/settings',
  
  // Transações
  TRANSACTIONS: '/api/transactions',
  TRANSACTIONS_BULK: '/api/transactions/bulk',
  TRANSACTIONS_SUMMARY: '/api/transactions/summary',
  
  // Categorias
  CATEGORIES: '/api/categories',
  CATEGORIES_DEFAULT: '/api/categories/default',
  CATEGORIES_DELETE_ALL: '/api/categories/all',
  
  // Receitas
  INCOMES: '/api/incomes',
  INCOMES_SUMMARY: '/api/incomes/summary',
  
  // Metas
  GOALS: '/api/goals',
  GOALS_SUMMARY: '/api/goals/summary',
  
  // Dívidas
  DEBTS: '/api/debts',
  DEBTS_SUMMARY: '/api/debts/summary',
  
  // Gastos Fixos
  FIXED_EXPENSES: '/api/fixed-expenses',
  FIXED_EXPENSES_SUMMARY: '/api/fixed-expenses/summary',
  
  // Investimentos
  INVESTMENTS: '/api/investments',
  INVESTMENTS_SUMMARY: '/api/investments/summary',
  INVESTMENTS_PORTFOLIO: '/api/investments/portfolio',
  
  // Cartões
  CARDS: '/api/cards',
  CARDS_SUMMARY: '/api/cards/summary',
  
  // Wishlist
  WISHLIST: '/api/wishlist',
  WISHLIST_SUMMARY: '/api/wishlist/summary',
  
  // Limites
  LIMITS: '/api/category-limits',
  LIMITS_CHECK: '/api/limits/check',
  LIMITS_SUMMARY: '/api/limits/summary',
  
  // Importação
  IMPORT_CSV_TEMPLATE: '/api/import/csv/template',
  IMPORT_CSV_UPLOAD: '/api/import/csv/upload',
  IMPORT_CSV_PREVIEW: '/api/import/csv/preview',
  IMPORT_CSV_IMPORT: '/api/import/csv/import',
  
  // Relatórios
  REPORTS_DASHBOARD: '/api/reports/dashboard',
  REPORTS_FINANCIAL_SUMMARY: '/api/reports/financial-summary',
  REPORTS_CASH_FLOW: '/api/reports/cash-flow',
  REPORTS_CATEGORY_ANALYSIS: '/api/reports/category-analysis',
  REPORTS_GOALS_PROGRESS: '/api/reports/goals-progress',
  REPORTS_EXPORT: '/api/reports/export',
} as const;

// Configuração base da API
const API_BASE_URL = 'http://localhost:3000';

// Cliente HTTP com interceptors
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private backendAvailable: boolean = true;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Verificar se o backend está disponível
  async checkBackendHealth(): Promise<boolean> {
    if (DEVELOPMENT_MODE) return false;
    
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      });
      this.backendAvailable = response.ok;
      return response.ok;
    } catch {
      this.backendAvailable = false;
      return false;
    }
  }

  // Interceptor para adicionar token de autenticação
  private getAuthHeaders(): Record<string, string> {
    const accessToken = localStorage.getItem('access_token');
    const expiresAt = localStorage.getItem('expires_at');
    
    // Verificar se token existe e não expirou
    if (!accessToken || !expiresAt) {
      apiLogger.warn("⚠️ No access token or expiration found");
      return {};
    }
    
    const expirationTime = parseInt(expiresAt) * 1000;
    const now = Date.now();
    
    if (now >= expirationTime) {
      apiLogger.warn("⚠️ Token expired, clearing localStorage");
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('expires_at');
      localStorage.removeItem('user');
      return {};
    }
    
    apiLogger.debug("🔑 Using access token for request");
    return { Authorization: `Bearer ${accessToken}` };
  }

  // Interceptor para tratamento de erros
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    apiLogger.debug("🌐 Response status:", response.status, response.statusText);
    
    if (!response.ok) {
      if (response.status === 401) {
        apiLogger.info("🔒 Erro 401 detectado - Token inválido ou expirado");
        
        // Só fazer logout automático se for uma rota de autenticação crítica
        const url = response.url;
        const isCriticalAuthRoute = url.includes('/auth/') || url.includes('/me');
        
        if (isCriticalAuthRoute) {
          apiLogger.warn("❌ Erro 401 em rota crítica, fazendo logout");
          // Limpar todos os dados de autenticação
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('expires_at');
          localStorage.removeItem('user');
          localStorage.removeItem('token'); // Limpar tokens antigos também
          localStorage.removeItem('authToken');
          
          // Redirecionar para login
          window.location.href = '/login';
          throw new Error('Token expirado ou inválido');
        } else {
          apiLogger.debug("⚠️ Erro 401 em rota não crítica, continuando");
          // Para rotas não críticas, apenas retornar erro sem fazer logout
        }
      }
      
      // Tentar extrair mensagem de erro do backend
      try {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      } catch (jsonError) {
        // Se não conseguir fazer parse do JSON, usar status como erro
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    
    // O backend Flask retorna diretamente o objeto ou array
    // Vamos padronizar para o formato ApiResponse esperado pelo frontend
    if (data && typeof data === 'object' && !data.hasOwnProperty('success')) {
      return {
        success: true,
        data: data as T,
        message: 'Operação realizada com sucesso'
      };
    }
    
    return data;
  }

  // Método principal para fazer requisições
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    apiLogger.debug("🌐 Request:", options.method || 'GET', url);
    
    // Para FormData, não definir Content-Type (o browser define automaticamente com boundary)
    const isFormData = options.body instanceof FormData;
    const authHeaders = this.getAuthHeaders();
    const headers = {
      ...(isFormData ? {} : this.defaultHeaders),
      ...authHeaders,
      ...options.headers,
    };

    apiLogger.debug("🔑 Auth Headers:", authHeaders);
    apiLogger.debug("🔑 Final Headers:", headers);

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      apiLogger.error('❌ Request Error:', error);
      
      // Se for erro de rede (Failed to fetch), não considerar como erro de auth
      if (error instanceof Error && error.message === 'Failed to fetch') {
        return {
          success: false,
          error: 'Erro de conexão com o servidor. Verifique se o backend está rodando.',
          message: 'Erro de conexão com o servidor'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Métodos de conveniência
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Hard delete de todas as categorias do usuário
  async deleteAllCategories(): Promise<ApiResponse<any>> {
    return this.delete(API_ENDPOINTS.CATEGORIES_DELETE_ALL);
  }

  // Métodos específicos para operações comuns do backend
  
  // Transações
  async getTransactions(filters?: { 
    startDate?: string; 
    endDate?: string; 
    categoryId?: string; 
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.get(`${API_ENDPOINTS.TRANSACTIONS}${query}`);
  }

  async createBulkTransactions(transactions: any[]): Promise<ApiResponse<any>> {
    return this.post(API_ENDPOINTS.TRANSACTIONS_BULK, { transactions });
  }

  // Metas
  async updateGoalProgress(goalId: string, progress: number): Promise<ApiResponse<any>> {
    return this.post(`${API_ENDPOINTS.GOALS}/${goalId}/progress`, { progress });
  }

  // Dívidas
  async recordDebtPayment(debtId: string, amount: number, date?: string): Promise<ApiResponse<any>> {
    return this.post(`${API_ENDPOINTS.DEBTS}/${debtId}/payment`, { amount, date });
  }

  // Gastos Fixos
  async payFixedExpense(expenseId: string, amount: number, date?: string): Promise<ApiResponse<any>> {
    return this.post(`${API_ENDPOINTS.FIXED_EXPENSES}/${expenseId}/pay`, { amount, date });
  }

  // Investimentos
  async updateInvestmentValue(investmentId: string, currentValue: number): Promise<ApiResponse<any>> {
    return this.post(`${API_ENDPOINTS.INVESTMENTS}/${investmentId}/update-value`, { currentValue });
  }

  // Wishlist
  async addWishlistSavings(itemId: string, amount: number): Promise<ApiResponse<any>> {
    return this.post(`${API_ENDPOINTS.WISHLIST}/${itemId}/add-savings`, { amount });
  }

  // Cartões
  async getCardUsage(cardId: string): Promise<ApiResponse<any>> {
    return this.get(`${API_ENDPOINTS.CARDS}/${cardId}/usage`);
  }

  // Importação CSV
  async uploadCSV(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request(API_ENDPOINTS.IMPORT_CSV_UPLOAD, {
      method: 'POST',
      body: formData as any,
      headers: {}, // Não definir Content-Type para FormData
    });
  }

  async previewCSV(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request(API_ENDPOINTS.IMPORT_CSV_PREVIEW, {
      method: 'POST',
      body: formData as any,
      headers: {},
    });
  }

  async importCSV(importData: any): Promise<ApiResponse<any>> {
    return this.post(API_ENDPOINTS.IMPORT_CSV_IMPORT, importData);
  }

  // Relatórios
  async getDashboardData(): Promise<ApiResponse<any>> {
    return this.get(API_ENDPOINTS.REPORTS_DASHBOARD);
  }

  async getFinancialSummary(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.get(`${API_ENDPOINTS.REPORTS_FINANCIAL_SUMMARY}${query}`);
  }

  async getCashFlow(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.get(`${API_ENDPOINTS.REPORTS_CASH_FLOW}${query}`);
  }

  async getCategoryAnalysis(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.get(`${API_ENDPOINTS.REPORTS_CATEGORY_ANALYSIS}${query}`);
  }

  async exportReport(format: 'pdf' | 'excel' | 'csv', reportType: string, filters?: any): Promise<ApiResponse<any>> {
    return this.post(API_ENDPOINTS.REPORTS_EXPORT, { format, reportType, filters });
  }
}

// Instância global do cliente
export const apiClient = new ApiClient();

// Função de conveniência para compatibilidade com código existente
export const makeApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // --- LOGS DE CONSOLE REMOVIDOS PARA PRODUÇÃO ---
    const accessToken = localStorage.getItem('access_token');
    const expiresAt = localStorage.getItem('expires_at');
    let authHeaders = {};
    if (accessToken && expiresAt) {
      const expirationTime = parseInt(expiresAt) * 1000;
      const now = Date.now();
      if (now < expirationTime) {
        authHeaders = { 'Authorization': `Bearer ${accessToken}` };
      }
    }
    const finalHeaders = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: finalHeaders,
      ...options,
    });
    if (!response.ok) {
      
      if (response.status === 401) {
        // Para 401, tentar renovar o token primeiro
        const isCriticalAuthRoute = endpoint.includes('/auth/') || endpoint.includes('/me');
        
        if (!isCriticalAuthRoute) {
          // Tentar renovar o token
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken })
              });
              
              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                
                if (refreshData.success && refreshData.access_token) {
                  // Salvar novo token
                  localStorage.setItem('access_token', refreshData.access_token);
                  localStorage.setItem('expires_at', refreshData.expires_at);
                  
                  if (refreshData.refresh_token) {
                    localStorage.setItem('refresh_token', refreshData.refresh_token);
                  }
                  
                  // Refazer a requisição com o novo token
                  const newAuthHeaders = { 'Authorization': `Bearer ${refreshData.access_token}` };
                  const newFinalHeaders = {
                    'Content-Type': 'application/json',
                    ...newAuthHeaders,
                    ...options.headers,
                  };
                  
                  const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                    headers: newFinalHeaders,
                    ...options,
                  });
                  
                  if (retryResponse.ok) {
                    const retryData = await retryResponse.json();
                    return {
                      success: true,
                      data: retryData,
                      message: 'Operação realizada com sucesso'
                    };
                  }
                }
              }
            } catch (refreshError) {
              // Silencioso - não logar erro de renovação
            }
          }
        }
        
        // Se chegou aqui, não conseguiu renovar ou é rota crítica
        if (isCriticalAuthRoute) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('expires_at');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          throw new Error('Sessão expirada. Faça login novamente.');
        }
      }
      
      if (response.status === 403) {
        // Silencioso para 403
      }
      
      if (response.status === 409) {
        const errorData = await response.json().catch(() => ({ message: 'Conflict' }));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Conflict'}`);
      }
      
      // Tentar extrair mensagem de erro do backend
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
      // erro do backend
      throw new Error(errorMessage);
    }

    const data = await response.json();
    // O backend Flask retorna diretamente o objeto ou array
    // Vamos padronizar para o formato ApiResponse esperado pelo frontend
    if (data && typeof data === 'object' && !data.hasOwnProperty('success')) {
      return {
        success: true,
        data: data,
        message: 'Operação realizada com sucesso'
      };
    }
    return data;
  } catch (error) {
    apiLogger.error('❌ Error:', error);
    
    // Retornar no formato ApiResponse para consistência
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

// Verificar se o usuário está autenticado
export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem('access_token');
  const expiresAt = localStorage.getItem('expires_at');
  
  if (!accessToken || !expiresAt) return false;
  
  const expirationTime = parseInt(expiresAt) * 1000;
  const now = Date.now();
  
  return now < expirationTime;
};

// Obter dados do usuário do localStorage
export const getUserData = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

// Hook para loading state global
let globalLoadingState = false;
const loadingListeners: ((loading: boolean) => void)[] = [];

export const setGlobalLoading = (loading: boolean) => {
  globalLoadingState = loading;
  loadingListeners.forEach(listener => listener(loading));
};
