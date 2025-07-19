// Design System para FinanciFlow
// Padrões de layout e responsividade

export const DESIGN_TOKENS = {
  // Espaçamentos
  spacing: {
    xs: "0.5rem",      // 8px
    sm: "1rem",        // 16px
    md: "1.5rem",      // 24px
    lg: "2rem",        // 32px
    xl: "3rem",        // 48px
    "2xl": "4rem",     // 64px
  },
  
  // Breakpoints
  breakpoints: {
    sm: "640px",
    md: "768px", 
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  
  // Container widths
  containers: {
    sm: "max-w-2xl",
    md: "max-w-4xl", 
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  },
  
  // Grid layouts
  grids: {
    cols1: "grid-cols-1",
    cols2: "grid-cols-1 md:grid-cols-2",
    cols3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    cols4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    responsive2: "grid-cols-1 sm:grid-cols-2",
    responsive3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    responsive4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }
};

// Layout padrão para páginas
export const PAGE_LAYOUT = {
  // Container principal
  container: "min-h-screen bg-background",
  
  // Wrapper interno
  wrapper: "container mx-auto p-4 lg:p-6 max-w-6xl",
  
  // Header da página
  header: {
    container: "mb-6 lg:mb-8",
    backButton: "mb-6 flex items-center gap-4",
    titleSection: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
    title: "text-2xl lg:text-3xl font-bold text-foreground mb-2",
    subtitle: "text-sm lg:text-base text-muted-foreground",
    actions: "flex flex-col sm:flex-row gap-2 sm:gap-4",
  },
  
  // Cards e seções
  cards: {
    default: "mb-6",
    grid: "grid gap-4 md:gap-6 mb-6",
    stats: "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6",
    summary: "grid gap-4 md:grid-cols-3 mb-6",
  },
  
  // Tabelas
  table: {
    container: "overflow-x-auto",
    responsive: "min-w-full lg:min-w-0",
  },
  
  // Formulários
  form: {
    grid: "grid gap-4 md:grid-cols-2",
    field: "grid gap-2",
    actions: "flex flex-col sm:flex-row justify-end gap-2",
  },
  
  // Loading state
  loading: {
    container: "container mx-auto p-4 max-w-6xl",
    center: "flex items-center justify-center min-h-[200px]",
  },
  
  // Empty state
  empty: {
    center: "text-center py-8 lg:py-12",
    icon: "h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-4 text-muted-foreground",
    title: "text-lg lg:text-xl font-medium text-foreground mb-2",
    description: "text-sm lg:text-base text-muted-foreground",
  }
};

// Componentes responsivos comuns
export const RESPONSIVE_COMPONENTS = {
  // Botões
  button: {
    primary: "w-full sm:w-auto",
    secondary: "w-full sm:w-auto",
    icon: "h-8 w-8 sm:h-10 sm:w-10",
  },
  
  // Inputs
  input: {
    default: "w-full",
    search: "w-full lg:max-w-sm",
  },
  
  // Badges
  badge: {
    responsive: "text-xs sm:text-sm",
  },
  
  // Icons
  icon: {
    sm: "h-4 w-4",
    md: "h-5 w-5 lg:h-6 lg:w-6",
    lg: "h-6 w-6 lg:h-8 lg:w-8",
  }
};

export default {
  DESIGN_TOKENS,
  PAGE_LAYOUT,
  RESPONSIVE_COMPONENTS
};
