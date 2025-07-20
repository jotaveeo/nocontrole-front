import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Logger } from "@/utils/logger";

// Logger para rotas privadas
const routeLogger = new Logger("PRIVATE_ROUTE");

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Debug localStorage no PrivateRoute também
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");

  routeLogger.debug("🛡️ Estado:", {
    isAuthenticated,
    loading,
    user: user ? user.email : null,
    currentPath: location.pathname,
    localStorageUser: storedUser ? "EXISTS" : "NULL",
    localStorageToken: storedToken ? "EXISTS" : "NULL"
  });

  if (loading) {
    routeLogger.debug("⏳ Loading...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    routeLogger.info("❌ Não autenticado, redirecionando para login");
    // Redireciona para login mantendo a rota atual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  routeLogger.debug("✅ Autenticado, renderizando página");
  return <>{children}</>;
};

export default PrivateRoute;
