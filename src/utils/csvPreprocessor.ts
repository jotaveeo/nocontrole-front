// Utilitário para processamento de CSV do sistema financeiro

interface CSVTransaction {
  data: string;
  descricao: string;
  valor: number;
  tipo?: 'receita' | 'despesa';
}

interface ProcessedTransaction extends CSVTransaction {
  valorOriginal: string;
  dataOriginal: string;
  descricaoOriginal: string;
}

interface CSVProcessingResult {
  transactions: ProcessedTransaction[];
  errors: string[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    receitas: number;
    despesas: number;
  };
}

// Função para detectar separador do CSV
export const detectCSVSeparator = (csvText: string): string => {
  const separators = [',', ';', '\t', '|'];
  const lines = csvText.split('\n').slice(0, 5); // Analisar apenas as primeiras 5 linhas
  
  let bestSeparator = ',';
  let maxColumns = 0;
  
  for (const separator of separators) {
    let totalColumns = 0;
    let validLines = 0;
    
    for (const line of lines) {
      if (line.trim()) {
        const columns = line.split(separator).length;
        if (columns > 1) {
          totalColumns += columns;
          validLines++;
        }
      }
    }
    
    const avgColumns = validLines > 0 ? totalColumns / validLines : 0;
    if (avgColumns > maxColumns) {
      maxColumns = avgColumns;
      bestSeparator = separator;
    }
  }
  
  return bestSeparator;
};

// Função para normalizar data
export const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Remove espaços e caracteres especiais
  const cleaned = dateStr.trim().replace(/[^\d\/\-\.]/g, '');
  
  // Padrões de data suportados
  const patterns = [
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/, // DD/MM/YYYY
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})$/, // DD/MM/YY
    /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/, // YYYY/MM/DD
    /^(\d{2})(\d{2})(\d{4})$/, // DDMMYYYY
    /^(\d{4})(\d{2})(\d{2})$/, // YYYYMMDD
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      let day, month, year;
      
      if (pattern.source.startsWith('^(\\d{4})')) {
        // Formato YYYY-MM-DD
        year = match[1];
        month = match[2];
        day = match[3];
      } else {
        // Formato DD-MM-YYYY
        day = match[1];
        month = match[2];
        year = match[3];
      }
      
      // Converter ano de 2 dígitos para 4 dígitos
      if (year.length === 2) {
        const currentYear = new Date().getFullYear();
        const currentCentury = Math.floor(currentYear / 100) * 100;
        year = (parseInt(year) + currentCentury).toString();
      }
      
      // Validar data
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (date.getFullYear() == parseInt(year) && 
          date.getMonth() == parseInt(month) - 1 && 
          date.getDate() == parseInt(day)) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
  }
  
  return '';
};

// Função para normalizar valor monetário
export const normalizeValue = (valueStr: string): number => {
  if (!valueStr) return 0;
  
  // Remove espaços e caracteres não numéricos exceto vírgula, ponto e sinal negativo
  let cleaned = valueStr.toString().trim().replace(/[^\d,.\-+]/g, '');
  
  // Detectar se é negativo
  const isNegative = cleaned.includes('-') || cleaned.startsWith('(');
  
  // Remove sinais
  cleaned = cleaned.replace(/[\-+()]/g, '');
  
  // Detectar formato brasileiro (vírgula como decimal)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Formato: 1.234,56
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // Formato: 1,234.56
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    // Verificar se vírgula é separador decimal ou de milhares
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Vírgula como decimal: 123,45
      cleaned = cleaned.replace(',', '.');
    } else {
      // Vírgula como separador de milhares: 1,234
      cleaned = cleaned.replace(/,/g, '');
    }
  }
  
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : (isNegative ? -value : value);
};

// Função para detectar tipo de transação baseado no valor
export const detectTransactionType = (value: number, description: string): 'receita' | 'despesa' => {
  // Se o valor é positivo, geralmente é receita
  if (value > 0) {
    // Verificar palavras-chave que indicam despesa mesmo com valor positivo
    const expenseKeywords = ['pagamento', 'compra', 'débito', 'saque', 'transferência enviada'];
    const lowerDesc = description.toLowerCase();
    
    for (const keyword of expenseKeywords) {
      if (lowerDesc.includes(keyword)) {
        return 'despesa';
      }
    }
    
    return 'receita';
  } else {
    // Valor negativo geralmente é despesa
    return 'despesa';
  }
};

// Função para mapear colunas automaticamente
export const mapColumns = (headers: string[]): Record<string, number> => {
  const mapping: Record<string, number> = {};
  
  const patterns = {
    data: /^(data|date|dt|dia|when)$/i,
    descricao: /^(descri[çc][ãa]o|description|desc|hist[óo]rico|memo|detail)$/i,
    valor: /^(valor|value|amount|quantia|montante|vlr)$/i,
    tipo: /^(tipo|type|category|categoria)$/i,
  };
  
  headers.forEach((header, index) => {
    const cleanHeader = header.trim().toLowerCase();
    
    for (const [field, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleanHeader)) {
        mapping[field] = index;
        break;
      }
    }
  });
  
  return mapping;
};

// Função principal para processar CSV genérico
export const processGenericCSV = (csvText: string): CSVProcessingResult => {
  const result: CSVProcessingResult = {
    transactions: [],
    errors: [],
    summary: {
      total: 0,
      valid: 0,
      invalid: 0,
      receitas: 0,
      despesas: 0,
    },
  };

  try {
    if (!csvText || !csvText.trim()) {
      result.errors.push('Arquivo CSV vazio');
      return result;
    }

    // Detectar separador automaticamente
    const separator = detectCSVSeparator(csvText);
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      result.errors.push('CSV deve ter pelo menos uma linha de cabeçalho e uma linha de dados');
      return result;
    }

    // Processar cabeçalho
    const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, ''));
    const columnMapping = mapColumns(headers);
    
    // Verificar se temos as colunas essenciais
    if (!columnMapping.data || !columnMapping.descricao || !columnMapping.valor) {
      result.errors.push('CSV deve conter colunas para data, descrição e valor');
      return result;
    }

    // Processar linhas de dados
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      result.summary.total++;
      
      try {
        const columns = line.split(separator).map(col => col.trim().replace(/"/g, ''));
        
        // Extrair dados das colunas
        const dataOriginal = columns[columnMapping.data] || '';
        const descricaoOriginal = columns[columnMapping.descricao] || '';
        const valorOriginal = columns[columnMapping.valor] || '';
        const tipoOriginal = columnMapping.tipo ? columns[columnMapping.tipo] || '' : '';
        
        // Normalizar dados
        const data = normalizeDate(dataOriginal);
        const descricao = descricaoOriginal.trim();
        const valor = normalizeValue(valorOriginal);
        
        // Detectar tipo se não fornecido
        let tipo: 'receita' | 'despesa' = 'despesa';
        if (tipoOriginal) {
          const tipoLower = tipoOriginal.toLowerCase();
          if (tipoLower.includes('receita') || tipoLower.includes('entrada') || tipoLower.includes('crédito')) {
            tipo = 'receita';
          }
        } else {
          tipo = detectTransactionType(valor, descricao);
        }
        
        // Validar dados processados
        if (!data) {
          result.errors.push(`Linha ${i + 1}: Data inválida "${dataOriginal}"`);
          result.summary.invalid++;
          continue;
        }
        
        if (!descricao) {
          result.errors.push(`Linha ${i + 1}: Descrição vazia`);
          result.summary.invalid++;
          continue;
        }
        
        if (valor === 0) {
          result.errors.push(`Linha ${i + 1}: Valor inválido "${valorOriginal}"`);
          result.summary.invalid++;
          continue;
        }
        
        // Adicionar transação processada
        const transaction: ProcessedTransaction = {
          data,
          descricao,
          valor: Math.abs(valor), // Sempre valor positivo, tipo determina se é receita/despesa
          tipo,
          valorOriginal,
          dataOriginal,
          descricaoOriginal,
        };
        
        result.transactions.push(transaction);
        result.summary.valid++;
        
        if (tipo === 'receita') {
          result.summary.receitas++;
        } else {
          result.summary.despesas++;
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        result.errors.push(`Linha ${i + 1}: ${errorMessage}`);
        result.summary.invalid++;
      }
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    result.errors.push(`Erro ao processar CSV: ${errorMessage}`);
  }

  return result;
};

// Função para processar CSV do Nubank
export const processNubankCSV = (csvText: string): CSVProcessingResult => {
  // Implementação específica para formato do Nubank
  const result = processGenericCSV(csvText);
  
  // Pós-processamento específico do Nubank
  result.transactions = result.transactions.map(transaction => {
    let { descricao } = transaction;
    
    // Limpar descrições específicas do Nubank
    descricao = descricao.replace(/^(Pagamento|Compra no débito|PIX)\s*-\s*/i, '');
    descricao = descricao.replace(/\s*-\s*\d{2}\/\d{2}$/, ''); // Remove data no final
    
    return {
      ...transaction,
      descricao: descricao.trim(),
    };
  });
  
  return result;
};

// Função para processar CSV do Inter
export const processInterCSV = (csvText: string): CSVProcessingResult => {
  // Implementação específica para formato do Inter
  return processGenericCSV(csvText);
};

// Função para processar CSV do Bradesco
export const processBradescoCSV = (csvText: string): CSVProcessingResult => {
  // Implementação específica para formato do Bradesco
  return processGenericCSV(csvText);
};

// Legacy exports para compatibilidade com código existente
export interface PreprocessedTransaction {
  originalDescription: string;
  cleanedDescription: string;
  tokens: string[];
  normalizedAmount: number;
  date: string;
  type: 'income' | 'expense';
  confidence: number;
}

// Common typos and their corrections for Brazilian Portuguese
const COMMON_TYPOS: { [key: string]: string } = {
  'supermercado': 'supermercado',
  'suoermercado': 'supermercado',
  'supermerkado': 'supermercado',
  'restaurante': 'restaurante',
  'restorant': 'restaurante',
  'farmacia': 'farmácia',
  'gasolina': 'gasolina',
  'gasosa': 'gasolina',
  'transporte': 'transporte',
  'trasporte': 'transporte',
  'pagamento': 'pagamento',
  'pagmento': 'pagamento',
  'recebimento': 'recebimento',
  'recebimeto': 'recebimento',
};

// Words to remove during tokenization
const STOP_WORDS = [
  'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos',
  'para', 'por', 'com', 'sem', 'via', 'pelo', 'pela', 'pelos', 'pelas',
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
  'e', 'ou', 'mas', 'que', 'se', 'como', 'quando', 'onde'
];

// Normalize text by removing special characters and converting to lowercase
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

// Correct common typos
export const correctTypos = (text: string): string => {
  let corrected = text;
  Object.entries(COMMON_TYPOS).forEach(([typo, correction]) => {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    corrected = corrected.replace(regex, correction);
  });
  return corrected;
};

// Tokenize text into meaningful parts
export const tokenizeDescription = (description: string): string[] => {
  const normalized = normalizeText(description);
  const corrected = correctTypos(normalized);
  
  const tokens = corrected
    .split(' ')
    .filter(token => 
      token.length > 2 && 
      !STOP_WORDS.includes(token) &&
      !/^\d+$/.test(token) // Remove pure numbers
    )
    .map(token => token.trim())
    .filter(Boolean);
  
  return [...new Set(tokens)]; // Remove duplicates
};

// Parse different date formats
export const parseDate = (dateStr: string): string => {
  // Handle DD/MM/YYYY format
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear.padStart(4, '20')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Handle other formats or return as-is
  return dateStr;
};

// Parse amount with different formats
export const parseAmount = (amountStr: string): number => {
  // Remove currency symbols and normalize decimal separators
  const cleanAmount = amountStr
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '') // Remove thousands separator
    .replace(',', '.'); // Convert decimal separator
  
  return Math.abs(parseFloat(cleanAmount)) || 0;
};

// Determine transaction type based on description and amount
export const determineTransactionType = (description: string, originalAmount: string): 'income' | 'expense' => {
  const lowerDesc = description.toLowerCase();
  const isNegative = originalAmount.includes('-');
  
  // Keywords that indicate income
  const incomeKeywords = [
    'deposito', 'recebido', 'recebimento', 'credito', 'salario',
    'transferencia recebida', 'pix recebido', 'resgate', 'entrada'
  ];
  
  // Keywords that indicate expense
  const expenseKeywords = [
    'pagamento', 'compra', 'debito', 'saque', 'transferencia enviada',
    'pix enviado', 'aplicacao', 'saida'
  ];
  
  const hasIncomeKeyword = incomeKeywords.some(keyword => lowerDesc.includes(keyword));
  const hasExpenseKeyword = expenseKeywords.some(keyword => lowerDesc.includes(keyword));
  
  if (hasIncomeKeyword) return 'income';
  if (hasExpenseKeyword) return 'expense';
  
  // Fallback to amount sign
  return isNegative ? 'expense' : 'income';
};

// Main preprocessing function
export const preprocessTransaction = (
  date: string,
  description: string,
  amount: string,
  type?: string
): PreprocessedTransaction => {
  const cleanedDescription = correctTypos(normalizeText(description));
  const tokens = tokenizeDescription(description);
  const normalizedAmount = parseAmount(amount);
  const parsedDate = parseDate(date);
  const transactionType = type ? 
    (type.toLowerCase().includes('entrada') ? 'income' : 'expense') :
    determineTransactionType(description, amount);
  
  // Calculate confidence based on text quality
  const confidence = calculateConfidence(description, tokens);
  
  return {
    originalDescription: description,
    cleanedDescription,
    tokens,
    normalizedAmount,
    date: parsedDate,
    type: transactionType,
    confidence
  };
};

// Calculate confidence score for the preprocessing
const calculateConfidence = (originalDescription: string, tokens: string[]): number => {
  let confidence = 0.5; // Base confidence
  
  // Increase confidence if description has meaningful content
  if (originalDescription.length > 5) confidence += 0.2;
  if (tokens.length > 0) confidence += 0.2;
  if (tokens.length > 2) confidence += 0.1;
  
  // Decrease confidence for very short or unclear descriptions
  if (originalDescription.length < 3) confidence -= 0.3;
  if (tokens.length === 0) confidence -= 0.4;
  
  return Math.max(0, Math.min(1, confidence));
};

// Process Banco do Brasil CSV format
export const processBancoDoBrasilCSV = (csvContent: string): PreprocessedTransaction[] => {
  const lines = csvContent.split('\n');
  const transactions: PreprocessedTransaction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
      
      if (columns.length < 6) continue;
      
      const [date, lancamento, detalhes, documento, valor, tipoLancamento] = columns;
      
      // Skip balance lines and empty entries
      if (!date || date === '00/00/0000' || valor === '0,00' || 
          lancamento.includes('Saldo') || !valor) {
        continue;
      }
      
      // Combine description from available fields
      const description = [lancamento, detalhes].filter(Boolean).join(' - ');
      
      const preprocessed = preprocessTransaction(date, description, valor, tipoLancamento);
      transactions.push(preprocessed);
      
    } catch (error) {
      console.warn(`Error processing line ${i + 1}:`, error);
    }
  }
  
  return transactions;
};