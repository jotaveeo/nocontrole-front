import { useState, useEffect, createContext, useContext } from "react";
import { API_ENDPOINTS, makeApiRequest } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
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

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        // Adicionar token ao userData se não estiver presente
        if (!userData.token) {
          userData.token = storedToken;
        }
        setUser(userData);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      const data = await makeApiRequest(API_ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify({ email, senha }),
      });

      if (data.success) {
        const userData = {
          id: data.data.id,
          name: data.data.nome,
          email: data.data.email,
          token: data.data.token,
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", data.data.token);
        return true;
      } else {
        throw new Error(data.message || "Erro no login");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
