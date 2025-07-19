// Cliente HTTP unificado para o sistema financeiro
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: string;
  headers?: Record<string, string>;
}

// Endpoints da API
export const API_ENDPOINTS = {
  // Autenticação
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  
  // Transações
  TRANSACTIONS: '/api/transactions',
  
  // Categorias
  CATEGORIES: '/api/categories',
  
  // Receitas
  INCOMES: '/api/incomes',
  
  // Metas
  GOALS: '/api/goals',
  
  // Dívidas
  DEBTS: '/api/debts',
  
  // Gastos Fixos
  FIXED_EXPENSES: '/api/fixed-expenses',
  
  // Investimentos
  INVESTMENTS: '/api/investments',
  
  // Cartões
  CARDS: '/api/cards',
  
  // Wishlist
  WISHLIST: '/api/wishlist',
  
  // Limites
  LIMITS: '/api/limits',
  
  // Relatórios
  REPORTS: '/api/reports',
  
  // Cofrinho
  PIGGY_BANK: '/api/piggy-bank',
} as const;

// Configuração base da API
const API_BASE_URL = 'http://localhost:3001';

// Cliente HTTP com interceptors
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Interceptor para adicionar token de autenticação
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Interceptor para tratamento de erros
  private handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado - redirecionar para login
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Token expirado');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Método principal para fazer requisições
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('API Request Error:', error);
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
}

// Instância global do cliente
export const apiClient = new ApiClient();

// Função de conveniência para compatibilidade com código existente
export const makeApiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...((localStorage.getItem('token') || localStorage.getItem('authToken')) && { 
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}` 
        }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      if (response.status === 409) {
        const errorData = await response.json().catch(() => ({ message: 'Conflict' }));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Conflict'}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Verificar se o usuário está autenticado
export const isAuthenticated = (): boolean => {
  return !!(localStorage.getItem('token') || localStorage.getItem('authToken'));
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
