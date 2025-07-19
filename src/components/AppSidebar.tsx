import {
  TrendingUp,
  BarChart3,
  Calendar,
  CreditCard,
  FileText,
  Home,
  PlusCircle,
  Settings,
  Upload,
  Target,
  Heart,
  PiggyBank,
  Receipt,
  Wallet,
  CalendarDays,
  Shield,
  DollarSign,
  ShieldBan,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { PlanBadge } from "@/components/PlanBadge";
import { UpgradeModal } from "@/components/UpgradeModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePlan } from "@/contexts/PlanContext";
import { useState } from "react";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Novo Lançamento", url: "/lancamento", icon: PlusCircle },
  { title: "Histórico", url: "/historico", icon: FileText },
];

const planningItems = [
  { title: "Metas Financeiras", url: "/metas", icon: Target },
  { title: "Lista de Desejos", url: "/wishlist", icon: Heart },
  { title: "Meu Cofrinho", url: "/cofrinho", icon: PiggyBank },
];

const controlItems = [
  { title: "Minhas Dívidas", url: "/dividas", icon: Receipt },
  { title: "Cartões de Crédito", url: "/cartoes", icon: CreditCard },
  { title: "Resumo Calendário", url: "/calendario", icon: CalendarDays },
  { title: "Limites de Gastos", url: "/limites", icon: Shield },
  { title: "Gastos Fixos", url: "/gastosfixos", icon: ShieldBan },
];

const investmentItems = [
  { title: "Investimentos", url: "/investimentos", icon: TrendingUp },
  { title: "Fontes de Receita", url: "/receitas", icon: DollarSign },
];

const reportItems = [
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Importar", url: "/importar", icon: Upload },
];

const systemItems = [
  { title: "Categorias", url: "/categorias", icon: Wallet },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const sidebar = useSidebar();
  const { canAccess } = usePlan();
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    requiredPlan: 'essencial' | 'plus';
    feature: string;
  }>({
    isOpen: false,
    requiredPlan: 'essencial',
    feature: '',
  });

  const handleMenuClick = () => {
    if (sidebar?.isMobile) {
      sidebar.setOpenMobile(false);
    }
  };

  const handleRestrictedClick = (feature: string, requiredPlan: 'essencial' | 'plus') => {
    setUpgradeModal({
      isOpen: true,
      requiredPlan,
      feature,
    });
  };

  const getRestrictedItems = () => {
    const restrictedItems = [];
    
    if (!canAccess('hasReports')) {
      restrictedItems.push('/relatorios');
    }
    
    return restrictedItems;
  };

  const isRestricted = (url: string) => {
    return getRestrictedItems().includes(url);
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border p-4 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center shadow">
            <TrendingUp className="h-5 w-5 text-black" aria-label="Logo" />
            {/* <img src="favicon.svg" alt="" /> */}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">NoControle</h2>
            <p className="text-xs text-blue-100">Seu dinheiro sob controle</p>
          </div>
        </div>
      </SidebarHeader>
        <SidebarContent className="py-4">
          <SidebarGroup>
            <SidebarGroupLabel>Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild={!isRestricted(item.url)}
                      isActive={location.pathname === item.url}
                      className={
                        location.pathname === item.url
                          ? "bg-primary/10 text-primary font-semibold"
                          : ""
                      }
                    >
                      {isRestricted(item.url) ? (
                        <div
                          className="flex items-center gap-2 cursor-pointer opacity-60"
                          onClick={() => handleRestrictedClick(item.title, 'essencial')}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <PlanBadge requiredPlan="essencial" className="ml-auto" />
                        </div>
                      ) : (
                        <Link to={item.url} onClick={handleMenuClick}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <div className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Planejamento</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {planningItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className={
                      location.pathname === item.url
                        ? "bg-primary/10 text-primary font-semibold"
                        : ""
                    }
                  >
                    <Link to={item.url} onClick={handleMenuClick}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Controle</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {controlItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className={
                      location.pathname === item.url
                        ? "bg-primary/10 text-primary font-semibold"
                        : ""
                    }
                  >
                    <Link to={item.url} onClick={handleMenuClick}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Investimentos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {investmentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className={
                      location.pathname === item.url
                        ? "bg-primary/10 text-primary font-semibold"
                        : ""
                    }
                  >
                    <Link to={item.url} onClick={handleMenuClick}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="my-2" />

            <SidebarGroup>
            <SidebarGroupLabel>Relatórios</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
              {reportItems.map((item) => (
              <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
                className={
                location.pathname === item.url
                ? "bg-primary/10 text-primary font-semibold"
                : ""
                }
              >
                <Link to={item.url} onClick={handleMenuClick}>
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              </SidebarMenuItem>
              ))}
              </SidebarMenu>
            </SidebarGroupContent>
            </SidebarGroup>

          <div className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className={
                      location.pathname === item.url
                        ? "bg-primary/10 text-primary font-semibold"
                        : ""
                    }
                  >
                    <Link to={item.url} onClick={handleMenuClick}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="flex items-center justify-between p-2">
          <span className="text-sm text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>
      </Sidebar>

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal(prev => ({ ...prev, isOpen: false }))}
        requiredPlan={upgradeModal.requiredPlan}
        feature={upgradeModal.feature}
      />
    </>
  );
}
