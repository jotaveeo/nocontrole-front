import React from 'react';
import { Card } from '@/components/ui/card';
import { PAGE_LAYOUT } from '@/lib/design-system';
import { BackButton } from '@/components/BackButton';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function PageLayout({
  children,
  title,
  subtitle,
  showBackButton = true,
  backTo = "/dashboard",
  actions,
  loading = false,
  className = ""
}: PageLayoutProps) {
  if (loading) {
    return (
      <div className={PAGE_LAYOUT.loading.container}>
        <div className={PAGE_LAYOUT.loading.center}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${PAGE_LAYOUT.container} ${className}`}>
      <div className={PAGE_LAYOUT.wrapper}>
        <div className={PAGE_LAYOUT.header.container}>
          {showBackButton && (
            <div className={PAGE_LAYOUT.header.backButton}>
              <BackButton to={backTo} />
            </div>
          )}
          
          <div className={PAGE_LAYOUT.header.titleSection}>
            <div>
              <h1 className={PAGE_LAYOUT.header.title}>
                {title}
              </h1>
              {subtitle && (
                <p className={PAGE_LAYOUT.header.subtitle}>
                  {subtitle}
                </p>
              )}
            </div>
            
            {actions && (
              <div className={PAGE_LAYOUT.header.actions}>
                {actions}
              </div>
            )}
          </div>
        </div>
        
        {children}
      </div>
    </div>
  );
}

interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StatsGrid({ children, className = "" }: StatsGridProps) {
  return (
    <div className={`${PAGE_LAYOUT.cards.stats} ${className}`}>
      {children}
    </div>
  );
}

interface ContentGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function ContentGrid({ children, columns = 1, className = "" }: ContentGridProps) {
  const gridClass = {
    1: "grid gap-4 md:gap-6",
    2: "grid gap-4 md:gap-6 md:grid-cols-2", 
    3: "grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3",
    4: "grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  }[columns];
  
  return (
    <div className={`${gridClass} ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function ResponsiveCard({ 
  children, 
  className = "",
  title,
  description 
}: ResponsiveCardProps) {
  return (
    <Card className={`p-4 lg:p-6 ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg lg:text-xl font-semibold mb-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm lg:text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </Card>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={PAGE_LAYOUT.empty.center}>
      {icon && (
        <div className={PAGE_LAYOUT.empty.icon}>
          {icon}
        </div>
      )}
      <h3 className={PAGE_LAYOUT.empty.title}>
        {title}
      </h3>
      {description && (
        <p className={PAGE_LAYOUT.empty.description}>
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}
