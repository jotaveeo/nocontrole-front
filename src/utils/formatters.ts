// Utilitários de formatação para o sistema financeiro

/**
 * Formata um valor numérico como moeda brasileira
 */
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

/**
 * Formata um valor numérico como moeda sem o símbolo
 */
export const formatNumber = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

/**
 * Converte string para número de forma segura - versão melhorada
 */
export const parseToNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || value === '') return 0;
  
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  
  // Remove caracteres não numéricos exceto vírgula e ponto
  const cleanValue = value.replace(/[^\d,.-]/g, '');
  
  // Substitui vírgula por ponto para conversão
  const normalizedValue = cleanValue.replace(',', '.');
  
  const parsed = parseFloat(normalizedValue);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Soma valores de forma segura - versão melhorada
 */
export const safeSum = (...values: (number | string | null | undefined)[]): number => {
  return values.reduce<number>((sum, value) => {
    if (value === null || value === undefined || value === '') return sum;
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
    return sum + (isNaN(numValue) ? 0 : numValue);
  }, 0);
};

/**
 * Formata uma data para o padrão ISO (YYYY-MM-DD)
 */
export const formatDateISO = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};

/**
 * Formata data e hora
 */
export const formatDateTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }
    
    return dateObj.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'Data inválida';
  }
};

export const formatPercentage = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '0%';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(numValue / 100);
};

// Função para formatar tipo de investimento
export const formatInvestmentType = (type: string): string => {
  const types: { [key: string]: string } = {
    'renda_fixa': 'Renda Fixa',
    'renda_variavel': 'Renda Variável',
    'cdb': 'CDB',
    'lci': 'LCI',
    'lca': 'LCA',
    'tesouro_direto': 'Tesouro Direto',
    'acoes': 'Ações',
    'fundos': 'Fundos',
    'criptomoedas': 'Criptomoedas',
    'outros': 'Outros'
  };
  
  return types[type] || type;
};

/**
 * Função para calcular média segura
 */
export const safeAverage = (values: (number | string | null | undefined)[]): number => {
  const validValues = values.filter(v => {
    if (v === null || v === undefined || v === '') return false;
    const numValue = typeof v === 'string' ? parseFloat(v.replace(/[^\d.-]/g, '')) : v;
    return !isNaN(numValue);
  });
  
  if (validValues.length === 0) return 0;
  
  return safeSum(...validValues) / validValues.length;
};

/**
 * Trunca texto com reticências
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitaliza primeira letra
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formata nome próprio (primeira letra de cada palavra maiúscula)
 */
export const formatProperName = (name: string): string => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Remove acentos de uma string
 */
export const removeAccents = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

/**
 * Gera slug a partir de um texto
 */
export const generateSlug = (text: string): string => {
  return removeAccents(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Formata CPF
 */
export const formatCPF = (cpf: string): string => {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) {
    return cpf;
  }
  
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata CNPJ
 */
export const formatCNPJ = (cnpj: string): string => {
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) {
    return cnpj;
  }
  
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Formata telefone
 */
export const formatPhone = (phone: string): string => {
  const numbers = phone.replace(/\D/g, '');
  
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

/**
 * Formata CEP
 */
export const formatCEP = (cep: string): string => {
  const numbers = cep.replace(/\D/g, '');
  
  if (numbers.length !== 8) {
    return cep;
  }
  
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

/**
 * Calcula diferença entre datas em dias
 */
export const daysDifference = (date1: string | Date, date2: string | Date): number => {
  try {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
};

/**
 * Verifica se uma data está no passado
 */
export const isDateInPast = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dateObj < today;
  } catch (error) {
    return false;
  }
};

/**
 * Verifica se uma data está no futuro
 */
export const isDateInFuture = (date: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    return dateObj > today;
  } catch (error) {
    return false;
  }
};

/**
 * Obtém o primeiro dia do mês
 */
export const getFirstDayOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Obtém o último dia do mês
 */
export const getLastDayOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Gera array de meses para seletores
 */
export const getMonthsArray = (): Array<{ value: number; label: string }> => {
  return [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' },
  ];
};

/**
 * Gera array de anos para seletores
 */
export const getYearsArray = (startYear?: number, endYear?: number): Array<{ value: number; label: string }> => {
  const currentYear = new Date().getFullYear();
  const start = startYear || currentYear - 5;
  const end = endYear || currentYear + 5;
  
  const years = [];
  for (let year = end; year >= start; year--) {
    years.push({ value: year, label: year.toString() });
  }
  
  return years;
};

/**
 * Garante que um valor seja um número válido
 */
export const ensureNumber = (value: any, fallback: number = 0): number => {
  const num = parseToNumber(value);
  return isNaN(num) ? fallback : num;
};
