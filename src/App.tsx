import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FinanceExtendedProvider } from "@/contexts/FinanceExtendedContext";
import { PlanProvider } from "@/contexts/PlanContext";
import { AuthProvider } from "@/hooks/useAuth";
import { PlanSelector } from "@/components/PlanSelector";

// Páginas atualizadas com design responsivo
import Dashboard from "./pages/Dashboard";
import HistoricoUpdated from "./pages/HistoricoUpdated";
import Categorias from "./pages/Categorias";
import Wishlist from "./pages/Wishlist";
import Cartoes from "./pages/Cartoes";

// Páginas existentes
import NovoLancamento from "./pages/NovoLancamento";
import Importar from "./pages/Importar";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Metas from "./pages/Metas";
import Calendario from "./pages/Calendario";
import Limites from "./pages/Limites";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Cofrinho from "./pages/Cofrinho";
import Dividas from "./pages/Dividas";
import Investimentos from "./pages/Investimentos";
import Receitas from "./pages/Receitas";
import Funcionalidades from "./pages/Funcionalidades";
import Privacidade from "./pages/Privacidade";
import Termos from "./pages/Termos";
import LGPD from "./pages/Lgpd";
import Status from "./pages/Status";
import GastosFixos from "./pages/GastosFixos";

const queryClient = new QueryClient();

// Componente wrapper para páginas protegidas com sidebar
const ProtectedPage = ({ children, showPlanSelector = false }: { children: React.ReactNode; showPlanSelector?: boolean }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-sidebar-border p-2 lg:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex-1 overflow-auto">
          {showPlanSelector && (
            <div className="p-4 pb-0">
              <PlanSelector />
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PlanProvider>
          <FinanceExtendedProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/funcionalidades" element={<Funcionalidades />} />
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="/termos" element={<Termos />} />
              <Route path="/lgpd" element={<LGPD />} />
              <Route path="/status" element={<Status />} />

              {/* Protected Routes with Sidebar */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedPage showPlanSelector={true}>
                    <div className="p-4">
                      <Dashboard />
                    </div>
                  </ProtectedPage>
                }
              />
              <Route
                path="/lancamento"
                element={
                  <ProtectedPage>
                    <NovoLancamento />
                  </ProtectedPage>
                }
              />
              <Route
                path="/historico"
                element={
                  <ProtectedPage>
                    <HistoricoUpdated />
                  </ProtectedPage>
                }
              />
              <Route
                path="/importar"
                element={
                  <ProtectedPage>
                    <Importar />
                  </ProtectedPage>
                }
              />
              <Route
                path="/relatorios"
                element={
                  <ProtectedPage>
                    <Relatorios />
                  </ProtectedPage>
                }
              />
              <Route
                path="/categorias"
                element={
                  <ProtectedPage>
                    <Categorias/>
                  </ProtectedPage>
                }
              />
              <Route
                path="/configuracoes"
                element={
                  <ProtectedPage>
                    <Configuracoes />
                  </ProtectedPage>
                }
              />
              <Route
                path="/metas"
                element={
                  <ProtectedPage>
                    <Metas />
                  </ProtectedPage>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedPage>
                    <Wishlist />
                  </ProtectedPage>
                }
              />
              <Route
                path="/calendario"
                element={
                  <ProtectedPage>
                    <Calendario />
                  </ProtectedPage>
                }
              />
              <Route
                path="/limites"
                element={
                  <ProtectedPage>
                    <Limites />
                  </ProtectedPage>
                }
              />
              <Route
                path="/cofrinho"
                element={
                  <ProtectedPage>
                    <Cofrinho />
                  </ProtectedPage>
                }
              />
              <Route
                path="/dividas"
                element={
                  <ProtectedPage>
                    <Dividas />
                  </ProtectedPage>
                }
              />
              <Route
                path="/cartoes"
                element={
                  <ProtectedPage>
                    <Cartoes />
                  </ProtectedPage>
                }
              />
              <Route
                path="/investimentos"
                element={
                  <ProtectedPage>
                    <Investimentos />
                  </ProtectedPage>
                }
              />
              <Route
                path="/receitas"
                element={
                  <ProtectedPage>
                    <Receitas />
                  </ProtectedPage>
                }
              />
              <Route
                path="/gastosfixos"
                element={
                  <ProtectedPage>
                    <GastosFixos />
                  </ProtectedPage>
                }
              />
              {/* 404 - Must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </FinanceExtendedProvider>
      </PlanProvider>
    </AuthProvider>
  </TooltipProvider>
  </QueryClientProvider>
);

export default App;
