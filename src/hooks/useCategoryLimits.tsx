
import { useState, useEffect } from "react";
import { useFinanceExtendedContext } from "@/contexts/FinanceExtendedContext";
import { API_ENDPOINTS, makeApiRequest } from "@/lib/api";

interface CategoryLimit {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  spent: number;
  budget: number;
  percentage: number;
  remaining: number;
  transactions: number;
  status: "safe" | "warning" | "exceeded";
  categoryId?: string;
}

interface ApiLimit {
  id: string;
  categoria_id: string;
  valorLimite: number;
  valorGasto: number;
  periodo: string;
  ativo: boolean;
}

export const useCategoryLimits = () => {
  const { transactions, categories } = useFinanceExtendedContext();
  const [selectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());
  const [customLimits, setCustomLimits] = useState<{ [key: string]: number }>({});
  const [apiLimits, setApiLimits] = useState<ApiLimit[]>([]);
  const [loading, setLoading] = useState(true);

  // Load limits from API
  useEffect(() => {
    const loadApiLimits = async () => {
      try {
        const response = await makeApiRequest(API_ENDPOINTS.LIMITS);
        if (response.success && Array.isArray(response.data)) {
          setApiLimits(response.data);
        }
      } catch (error) {
        console.error('Erro ao carregar limites da API:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApiLimits();
  }, [transactions]);

  // Load custom limits from localStorage (fallback)
  useEffect(() => {
    const loadCustomLimits = () => {
      const saved = localStorage.getItem("financeflow_custom_limits");
      setCustomLimits(saved ? JSON.parse(saved) : {});
    };

    loadCustomLimits();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "financeflow_custom_limits") {
        loadCustomLimits();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [categories]);

  // Update custom limits - save to API and localStorage
  const updateCustomLimits = async (newLimits: { [key: string]: number }) => {
    // Update all limits with merge
    const updatedLimits = { ...customLimits, ...newLimits };
    setCustomLimits(updatedLimits);
    localStorage.setItem("financeflow_custom_limits", JSON.stringify(updatedLimits));

    // Save to API
    try {
      for (const [categoryName, limitValue] of Object.entries(newLimits)) {
        const category = categories.find(cat => cat.name === categoryName);
        if (category) {
          const existingLimit = apiLimits.find(limit => limit.categoria_id === category.id);
          
          if (existingLimit) {
            // Update existing limit
            await makeApiRequest(`${API_ENDPOINTS.LIMITS}/${existingLimit.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                valorLimite: limitValue,
                periodo: 'mensal',
                ativo: true
              }),
            });
          } else {
            // Create new limit
            await makeApiRequest(API_ENDPOINTS.LIMITS, {
              method: 'POST',
              body: JSON.stringify({
                categoria_id: category.id,
                valorLimite: limitValue,
                periodo: 'mensal'
              }),
            });
          }
        }
      }

      // Reload API limits
      const response = await makeApiRequest(API_ENDPOINTS.LIMITS);
      if (response.success && Array.isArray(response.data)) {
        setApiLimits(response.data);
      }
    } catch (error) {
      console.error('Erro ao salvar limite na API:', error);
      throw error; // Re-throw para que o componente possa capturar
    }
  };

  // Get default limit for a category
  const getDefaultLimit = (categoryName: string) => {
    const defaultLimits: { [key: string]: number } = {
      Alimentação: 800,
      Supermercado: 600,
      Restaurantes: 300,
      Transporte: 400,
      Combustível: 300,
      Moradia: 1200,
      Aluguel: 1500,
      "Contas Básicas": 400,
      "Energia Elétrica": 200,
      Água: 100,
      Internet: 100,
      Telefone: 80,
      Gás: 80,
      Saúde: 300,
      Medicamentos: 150,
      "Plano de Saúde": 400,
      Academia: 100,
      Educação: 200,
      Cursos: 300,
      Livros: 100,
      Lazer: 250,
      Cinema: 100,
      Streaming: 50,
      Viagens: 500,
      Roupas: 200,
      Sapatos: 150,
      Cabeleireiro: 80,
      Cosméticos: 100,
      "Cartão de Crédito": 1000,
      Empréstimos: 500,
      Seguros: 200,
      Pets: 150,
      Presentes: 200,
    };

    return defaultLimits[categoryName] || 300;
  };

  // Calculate category limits
  const getCategoryLimits = (): CategoryLimit[] => {
    // Adaptar transações do backend para o formato esperado
    // Função para normalizar nomes (remover acentos e deixar minúsculo)
    const normalize = (str: string) => str?.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

    const adaptedTransactions = Array.isArray(transactions) ? transactions.map((t: any) => {
      const categoryName = t.categoria_nome || t.category || t.nome || t.name;
      let categoryId = t.categoria_id || t.categoryId || t.categoria || t.category_id || null;
      if (!categoryId && categoryName && Array.isArray(categories)) {
        const normalized = normalize(categoryName);
        const found = categories.find((cat) => normalize(cat.name) === normalized);
        if (found) categoryId = found.id;
      }
      return {
        ...t,
        type: t.tipo === 'receita' ? 'income' : 'expense',
        amount: parseFloat(t.valor || t.amount || 0),
        date: t.data || t.date,
        categoryId,
        category: categoryName
      };
    }) : [];

    console.log('Debug limites:', {
      transactions: transactions,
      adaptedTransactions: adaptedTransactions,
      categories: categories,
      apiLimits: apiLimits,
      customLimits: customLimits
    });

    return categories
      .filter((cat) => cat.type === "expense")
      .map((category) => {
        const categoryTransactions = adaptedTransactions.filter((t) => {
          const transactionDate = new Date(t.date);
          // Compara pelo id da categoria para garantir correspondência
          return (
            t.categoryId === category.id &&
            t.type === "expense" &&
            transactionDate.getMonth() === selectedMonth &&
            transactionDate.getFullYear() === selectedYear
          );
        });

        const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        // Get budget from API limits first, then fallback to custom limits, then default
        const apiLimit = apiLimits.find(limit => limit.categoria_id === category.id && limit.ativo);
        const budget = apiLimit ? parseFloat(apiLimit.valorLimite.toString()) : 
                      customLimits[category.name] ?? 
                      getDefaultLimit(category.name);
        
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
        const remaining = budget - spent;

        return {
          id: category.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
          type: category.type,
          spent,
          budget,
          percentage: Math.min(percentage, 100),
          remaining,
          transactions: categoryTransactions.length,
          status:
            percentage >= 100
              ? "exceeded"
              : percentage >= 80
              ? "warning"
              : "safe",
          categoryId: category.id
        } as CategoryLimit;
      });
  };

  // Delete limit from API and localStorage
  const deleteLimit = async (categoryName: string) => {
    try {
      const category = categories.find(cat => cat.name === categoryName);
      if (category) {
        const existingLimit = apiLimits.find(limit => limit.categoria_id === category.id);
        
        if (existingLimit) {
          await makeApiRequest(`${API_ENDPOINTS.LIMITS}/${existingLimit.id}`, {
            method: 'DELETE',
          });
        }
      }

      // Remove from localStorage
      const newLimits = { ...customLimits };
      delete newLimits[categoryName];
      setCustomLimits(newLimits);
      localStorage.setItem("financeflow_custom_limits", JSON.stringify(newLimits));

      // Reload API limits
      const response = await makeApiRequest(API_ENDPOINTS.LIMITS);
      if (response.success && Array.isArray(response.data)) {
        setApiLimits(response.data);
      }
    } catch (error) {
      console.error('Erro ao deletar limite:', error);
    }
  };

  return {
    categoryLimits: getCategoryLimits(),
    customLimits,
    updateCustomLimits,
    deleteLimit,
    selectedMonth,
    selectedYear,
    loading,
    apiLimits,
  };
};
