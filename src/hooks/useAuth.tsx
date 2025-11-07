import { useState, useEffect, createContext, useContext } from "react";
import { API_ENDPOINTS, makeApiRequest } from "@/lib/api";
import { authLogger } from "@/utils/logger";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  getAccessToken: () => string | null;
  isTokenValid: () => boolean;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para verificar se o token é válido
  const isTokenValid = (): boolean => {
    const expiresAt = localStorage.getItem('expires_at');
    if (!expiresAt) return false;
    
    const expirationTime = parseInt(expiresAt) * 1000; // Converter para millisegundos
    const now = Date.now();
    
    return now < expirationTime;
  };

  // Função para obter o access token
  const getAccessToken = (): string | null => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      authLogger.warn("❌ No access token found");
      return null;
    }
    
    if (!isTokenValid()) {
      authLogger.warn("❌ Token expired");
      // Tentar renovar o token antes de fazer logout
      refreshToken();
      return null;
    }
    
    return token;
  };

  // Função para renovar o token usando refresh_token
  const refreshToken = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      authLogger.warn("❌ No refresh token found");
      logout();
      return false;
    }
    
    try {
      authLogger.info("🔄 Tentando renovar token...");
      
      const response = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.access_token) {
          // Salvar novo token
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('expires_at', data.expires_at);
          
          // Manter o refresh_token se um novo foi fornecido
          if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
          }
          
          authLogger.info("✅ Token renovado com sucesso");
          return true;
        }
      }
      
      authLogger.warn("❌ Falha ao renovar token");
      logout();
      return false;
    } catch (error) {
      authLogger.error("❌ Erro ao renovar token:", error);
      logout();
      return false;
    }
  };

  // Função para migrar dados do sistema antigo
  const migrateOldData = () => {
    const oldUserName = localStorage.getItem("financi_user_name");
    
    if (oldUserName && !localStorage.getItem("access_token")) {
      authLogger.info("🔄 Dados antigos encontrados, mas é necessário fazer login novamente");
      
      // Limpar dados antigos em vez de criar tokens temporários
      localStorage.removeItem("financi_user_name");
      localStorage.removeItem("financi_user_email");
      localStorage.removeItem("financi_user_id");
      
      // Não criar tokens temporários - o backend não os aceita
      authLogger.info("✨ Dados antigos limpos. Faça login para continuar.");
      return null;
    }
    
    return null;
  };

  // Função para verificar se o usuário está autenticado
  const checkAuthStatus = () => {
    const accessToken = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");
    
    return !!(accessToken && userId && isTokenValid());
  };

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage
    const checkAuth = async () => {
      const accessToken = localStorage.getItem("access_token");
      const userId = localStorage.getItem("user_id");
      const storedUser = localStorage.getItem("user");
      
      // Verificar se há dados do sistema antigo
      const oldUserName = localStorage.getItem("financi_user_name");
      
      if (accessToken && userId && isTokenValid()) {
        try {
          // Se há dados de usuário salvos, usar eles
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } else {
            // Token válido mas sem dados do usuário - buscar do backend
            authLogger.info("🔄 Buscando dados do usuário...");
            
            try {
              const response = await fetch('http://localhost:3000/api/auth/me', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (response.ok) {
                const userData = await response.json();
                if (userData.success) {
                  // Salvar dados do usuário no localStorage
                  localStorage.setItem('user', JSON.stringify(userData.data));
                  setUser(userData.data);
                  authLogger.info("✅ Usuário autenticado:", userData.data.email);
                } else {
                  // Fallback: criar usuário básico
                  const basicUser = {
                    id: userId,
                    name: oldUserName || "Usuário",
                    email: "user@temp.com"
                  };
                  localStorage.setItem("user", JSON.stringify(basicUser));
                  setUser(basicUser);
                }
              } else {
                // Se for 401, criar usuário básico e deixar o sistema de renovação automática lidar com o token
                if (response.status === 401) {
                  const basicUser = {
                    id: userId,
                    name: oldUserName || "Usuário",
                    email: "user@temp.com"
                  };
                  localStorage.setItem("user", JSON.stringify(basicUser));
                  setUser(basicUser);
                } else {
                  // Para outros erros, fazer logout
                  logout();
                }
                return;
              }
            } catch (fetchError) {
              // Em caso de erro de rede, criar usuário básico temporário
              const basicUser = {
                id: userId,
                name: oldUserName || "Usuário",
                email: "user@temp.com"
              };
              localStorage.setItem("user", JSON.stringify(basicUser));
              setUser(basicUser);
            }
          }
        } catch (error) {
          authLogger.error("❌ Erro ao fazer parse dos dados do usuário:", error);
          // Limpar dados corrompidos
          logout();
        }
      } else {
        // Tentar migrar dados antigos
        const migratedUser = migrateOldData();
        if (migratedUser) {
          setUser(migratedUser);
        } else {
          // Se não há dados, garantir que user seja null
          setUser(null);
        }
      }
      setLoading(false);
    };

    // Pequeno delay para garantir que o localStorage esteja disponível
    setTimeout(checkAuth, 100);

    // Listener para mudanças no localStorage (caso o usuário faça logout em outra aba)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === 'user_id' || e.key === 'user') {
        authLogger.debug("🔄 localStorage mudou, recarregando auth");
        if (!checkAuthStatus()) {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      const data = await makeApiRequest(API_ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify({ email, password: senha }), // Backend espera 'password'
      });

      if (data.success) {
        // Salvar tokens JWT conforme especificação do backend
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_id', data.data?.id || data.data?._id);
        localStorage.setItem('expires_at', data.expires_at);

        const userData = {
          id: data.data?.id || data.data?._id,
          name: data.data?.name,
          email: data.data?.email,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        
        authLogger.info("✅ Login realizado com sucesso");
        return true;
      } else {
        throw new Error(data.message || data.error || "Erro no login");
      }
    } catch (error) {
      authLogger.error("❌ Erro no login:", error);
      return false;
    }
  };

  const logout = () => {
    authLogger.info("🚪 Fazendo logout");
    setUser(null);
    
    // Limpar todos os tokens JWT
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("expires_at");
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Limpar token antigo também
    localStorage.removeItem("authToken"); // Limpar authToken também
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: (() => {
          const hasUser = !!user;
          const authStatus = checkAuthStatus();
          return hasUser && authStatus;
        })(),
        loading,
        login,
        logout,
        getAccessToken,
        isTokenValid,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
