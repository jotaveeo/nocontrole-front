import { useState, useCallback, useMemo } from 'react';
import { Category } from '@/types';

interface CategorizationRule {
  keywords: string[];
  categoryId: string;
  confidence: number;
}

interface CategorizationResult {
  categoryId: string | null;
  confidence: number;
  suggestedCategory?: Category;
}

// Regras padrão de categorização
const DEFAULT_RULES: CategorizationRule[] = [
  // Alimentação
  {
    keywords: ['restaurante', 'lanchonete', 'padaria', 'supermercado', 'mercado', 'ifood', 'uber eats', 'delivery', 'pizza', 'hamburguer', 'comida', 'alimento'],
    categoryId: 'alimentacao',
    confidence: 0.9,
  },
  
  // Transporte
  {
    keywords: ['uber', 'taxi', 'combustivel', 'gasolina', 'posto', 'onibus', 'metro', 'estacionamento', 'pedagio', 'transporte'],
    categoryId: 'transporte',
    confidence: 0.9,
  },
  
  // Saúde
  {
    keywords: ['farmacia', 'hospital', 'clinica', 'medico', 'dentista', 'laboratorio', 'exame', 'consulta', 'medicamento', 'saude'],
    categoryId: 'saude',
    confidence: 0.9,
  },
  
  // Educação
  {
    keywords: ['escola', 'faculdade', 'universidade', 'curso', 'livro', 'material escolar', 'educacao', 'ensino'],
    categoryId: 'educacao',
    confidence: 0.9,
  },
  
  // Lazer
  {
    keywords: ['cinema', 'teatro', 'show', 'festa', 'bar', 'balada', 'viagem', 'hotel', 'lazer', 'entretenimento'],
    categoryId: 'lazer',
    confidence: 0.8,
  },
  
  // Casa
  {
    keywords: ['luz', 'agua', 'gas', 'internet', 'telefone', 'condominio', 'aluguel', 'iptu', 'casa', 'moradia'],
    categoryId: 'casa',
    confidence: 0.9,
  },
  
  // Vestuário
  {
    keywords: ['roupa', 'sapato', 'calcado', 'vestuario', 'moda', 'loja de roupa', 'boutique'],
    categoryId: 'vestuario',
    confidence: 0.8,
  },
  
  // Tecnologia
  {
    keywords: ['celular', 'computador', 'notebook', 'tablet', 'tecnologia', 'eletronico', 'software', 'aplicativo'],
    categoryId: 'tecnologia',
    confidence: 0.8,
  },
  
  // Receitas
  {
    keywords: ['salario', 'salário', 'bonus', 'bônus', 'freelance', 'dividendo', 'renda', 'receita', 'pagamento recebido'],
    categoryId: 'salario',
    confidence: 0.9,
  },
];

interface UseAutoCategorizationProps {
  categories?: Category[];
}

export const useAutoCategorization = (props: UseAutoCategorizationProps = {}) => {
  const [customRules, setCustomRules] = useState<CategorizationRule[]>([]);

  // Combinar regras padrão com regras customizadas
  const allRules = useMemo(() => {
    return [...DEFAULT_RULES, ...customRules];
  }, [customRules]);

  // Função para normalizar texto
  const normalizeText = useCallback((text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, ' ') // Remove pontuação
      .replace(/\s+/g, ' ') // Remove espaços extras
      .trim();
  }, []);

  // Função principal de categorização
  const categorizeTransaction = useCallback((description: string): CategorizationResult => {
    if (!description) {
      return { categoryId: null, confidence: 0 };
    }

    const { categories = [] } = props;
    const normalizedDescription = normalizeText(description);
    let bestMatch: CategorizationResult = { categoryId: null, confidence: 0 };

    // Verificar regras de categorização
    for (const rule of allRules) {
      for (const keyword of rule.keywords) {
        const normalizedKeyword = normalizeText(keyword);
        
        if (normalizedDescription.includes(normalizedKeyword)) {
          // Encontrar categoria correspondente
          const category = categories.find(cat => 
            cat.id === rule.categoryId || 
            normalizeText(cat.nome).includes(normalizedKeyword)
          );

          if (category && rule.confidence > bestMatch.confidence) {
            bestMatch = {
              categoryId: category.id,
              confidence: rule.confidence,
              suggestedCategory: category,
            };
          }
        }
      }
    }

    // Se não encontrou pela regra, tentar busca por similaridade de nome
    if (bestMatch.confidence < 0.5) {
      for (const category of categories) {
        const normalizedCategoryName = normalizeText(category.nome);
        
        // Verificar se o nome da categoria está na descrição
        if (normalizedDescription.includes(normalizedCategoryName)) {
          bestMatch = {
            categoryId: category.id,
            confidence: 0.7,
            suggestedCategory: category,
          };
          break;
        }

        // Verificar palavras-chave da categoria
        const categoryWords = normalizedCategoryName.split(' ');
        let matches = 0;
        
        for (const word of categoryWords) {
          if (word.length > 2 && normalizedDescription.includes(word)) {
            matches++;
          }
        }
        
        if (matches > 0) {
          const confidence = Math.min(0.6, (matches / categoryWords.length) * 0.8);
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              categoryId: category.id,
              confidence,
              suggestedCategory: category,
            };
          }
        }
      }
    }

    return bestMatch;
  }, [allRules, normalizeText, props.categories]);

  // Função para adicionar regra customizada
  const addCustomRule = useCallback((rule: CategorizationRule) => {
    setCustomRules(prev => [...prev, rule]);
  }, []);

  // Função para remover regra customizada
  const removeCustomRule = useCallback((index: number) => {
    setCustomRules(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Função para categorizar em lote
  const categorizeBatch = useCallback((descriptions: string[]): CategorizationResult[] => {
    return descriptions.map(description => categorizeTransaction(description));
  }, [categorizeTransaction]);

  // Função para aprender com categorização manual
  const learnFromManualCategorization = useCallback((
    description: string, 
    categoryId: string, 
    category?: Category
  ) => {
    const normalizedDescription = normalizeText(description);
    const words = normalizedDescription.split(' ').filter(word => word.length > 2);
    
    // Criar regra baseada nas palavras mais significativas
    const significantWords = words.slice(0, 3); // Pegar até 3 palavras mais relevantes
    
    const newRule: CategorizationRule = {
      keywords: significantWords,
      categoryId,
      confidence: 0.7,
    };

    // Verificar se regra similar já existe
    const similarRule = customRules.find(rule => 
      rule.categoryId === categoryId &&
      rule.keywords.some(keyword => significantWords.includes(keyword))
    );

    if (!similarRule) {
      addCustomRule(newRule);
    }
  }, [normalizeText, customRules, addCustomRule]);

  // Função para obter estatísticas de categorização
  const getCategorizationStats = useCallback((descriptions: string[]) => {
    const results = categorizeBatch(descriptions);
    const categorized = results.filter(r => r.categoryId !== null).length;
    const highConfidence = results.filter(r => r.confidence >= 0.8).length;
    const mediumConfidence = results.filter(r => r.confidence >= 0.5 && r.confidence < 0.8).length;
    const lowConfidence = results.filter(r => r.confidence > 0 && r.confidence < 0.5).length;

    return {
      total: descriptions.length,
      categorized,
      uncategorized: descriptions.length - categorized,
      highConfidence,
      mediumConfidence,
      lowConfidence,
      accuracy: descriptions.length > 0 ? categorized / descriptions.length : 0,
    };
  }, [categorizeBatch]);

  return {
    categorizeTransaction,
    categorizeBatch,
    addCustomRule,
    removeCustomRule,
    learnFromManualCategorization,
    getCategorizationStats,
    customRules,
    allRules,
  };
};
