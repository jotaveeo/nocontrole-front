import { useState, useEffect, useMemo } from 'react';
import { API_ENDPOINTS, makeApiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Category, Transaction } from '@/types';

interface CategoryLimit {
  id: string;
  categoriaId: string;
  limite: number;
  periodo: 'mensal' | 'anual';
  ativo: boolean;
  categoria?: Category;
}

interface CategoryLimitWithStats extends CategoryLimit {
  name: string;
  icon: string;
  spent: number;
  remaining: number;
  percentage: number;
  transactions: number;
  status: 'safe' | 'warning' | 'exceeded';
}

interface UseCategoryLimitsProps {
  categories?: Category[];
  transactions?: Transaction[];
}

export const useCategoryLimits = (props: UseCategoryLimitsProps = {}) => {
  const { toast } = useToast();
  const [limits, setLimits] = useState<CategoryLimit[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar limites da API
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        setLoading(true);
        const response = await makeApiRequest(API_ENDPOINTS.LIMITS);
        
        if (response && Array.isArray(response)) {
          setLimits(response);
        } else if (response?.data && Array.isArray(response.data)) {
          setLimits(response.data);
        }
      } catch (error) {
        console.error('Erro ao carregar limites:', error);
        toast({
          title: 'Erro ao carregar limites',
          description: 'Não foi possível carregar os limites de categoria.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLimits();
  }, [toast]);

  // Salvar limite
  const saveLimit = async (limitData: Omit<CategoryLimit, 'id'>) => {
    try {
      const response = await makeApiRequest(API_ENDPOINTS.LIMITS, {
        method: 'POST',
        body: JSON.stringify(limitData),
      });

      if (response) {
        const newLimit = response.data || response;
        setLimits(prev => [...prev, newLimit]);
        
        toast({
          title: 'Limite salvo',
          description: 'O limite de categoria foi salvo com sucesso.',
          variant: 'default',
        });
        
        return true;
      }
    } catch (error) {
      console.error('Erro ao salvar limite:', error);
      toast({
        title: 'Erro ao salvar limite',
        description: 'Não foi possível salvar o limite de categoria.',
        variant: 'destructive',
      });
    }
    
    return false;
  };

  // Atualizar limite
  const updateLimit = async (id: string, limitData: Partial<CategoryLimit>) => {
    try {
      const response = await makeApiRequest(`${API_ENDPOINTS.LIMITS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(limitData),
      });

      if (response) {
        setLimits(prev => prev.map(limit => 
          limit.id === id ? { ...limit, ...limitData } : limit
        ));
        
        toast({
          title: 'Limite atualizado',
          description: 'O limite de categoria foi atualizado com sucesso.',
          variant: 'default',
        });
        
        return true;
      }
    } catch (error) {
      console.error('Erro ao atualizar limite:', error);
      toast({
        title: 'Erro ao atualizar limite',
        description: 'Não foi possível atualizar o limite de categoria.',
        variant: 'destructive',
      });
    }
    
    return false;
  };

  // Excluir limite
  const deleteLimit = async (id: string) => {
    try {
      await makeApiRequest(`${API_ENDPOINTS.LIMITS}/${id}`, {
        method: 'DELETE',
      });

      setLimits(prev => prev.filter(limit => limit.id !== id));
      
      toast({
        title: 'Limite excluído',
        description: 'O limite de categoria foi excluído com sucesso.',
        variant: 'default',
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir limite:', error);
      toast({
        title: 'Erro ao excluir limite',
        description: 'Não foi possível excluir o limite de categoria.',
        variant: 'destructive',
      });
    }
    
    return false;
  };

  // Calcular estatísticas dos limites
  const limitsWithStats = useMemo((): CategoryLimitWithStats[] => {
    if (!limits.length) return [];

    const { categories = [], transactions = [] } = props;
    
    if (!categories.length || !transactions.length) {
      return [];
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return limits
      .filter(limit => limit.ativo)
      .map(limit => {
        const category = categories.find(cat => cat.id === limit.categoriaId);
        
        if (!category) {
          return null;
        }

        // Filtrar transações da categoria no período atual
        const categoryTransactions = transactions.filter(transaction => {
          if (transaction.tipo !== 'despesa' || transaction.categoriaId !== category.id) {
            return false;
          }

          const transactionDate = new Date(transaction.data);
          
          if (limit.periodo === 'mensal') {
            return (
              transactionDate.getMonth() === currentMonth &&
              transactionDate.getFullYear() === currentYear
            );
          } else {
            return transactionDate.getFullYear() === currentYear;
          }
        });

        // Calcular valores
        const spent = categoryTransactions.reduce((sum, t) => sum + t.valor, 0);
        const remaining = limit.limite - spent;
        const percentage = limit.limite > 0 ? (spent / limit.limite) * 100 : 0;

        // Determinar status
        let status: 'safe' | 'warning' | 'exceeded' = 'safe';
        if (percentage >= 100) {
          status = 'exceeded';
        } else if (percentage >= 80) {
          status = 'warning';
        }

        return {
          ...limit,
          name: category.nome,
          icon: category.icone || '📊',
          spent,
          remaining,
          percentage: Math.min(percentage, 100),
          transactions: categoryTransactions.length,
          status,
        };
      })
      .filter(Boolean) as CategoryLimitWithStats[];
  }, [limits, props.categories, props.transactions]);

  // Resumo geral dos limites
  const summary = useMemo(() => {
    const stats = limitsWithStats;
    
    return {
      total: stats.length,
      safe: stats.filter(l => l.status === 'safe').length,
      warning: stats.filter(l => l.status === 'warning').length,
      exceeded: stats.filter(l => l.status === 'exceeded').length,
      totalBudget: stats.reduce((sum, l) => sum + l.limite, 0),
      totalSpent: stats.reduce((sum, l) => sum + l.spent, 0),
    };
  }, [limitsWithStats]);

  return {
    limits: limitsWithStats,
    rawLimits: limits,
    summary,
    loading,
    saveLimit,
    updateLimit,
    deleteLimit,
  };
};
