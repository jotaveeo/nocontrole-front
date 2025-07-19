import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { useFinanceExtendedContext } from "@/contexts/FinanceExtendedContext";
import { useToast } from "@/hooks/use-toast";
import { useAutoCategorization } from '@/hooks/useAutoCategorization';
import { 
  preprocessTransaction, 
  processBancoDoBrasilCSV,
  normalizeText,
  tokenizeDescription 
} from '@/utils/csvPreprocessor';
import { API_ENDPOINTS, makeApiRequest } from '@/lib/api';

const Importar = () => {
  const { addTransaction } = useFinanceExtendedContext();
  const { categorizeTransaction } = useAutoCategorization();
  const { toast } = useToast();

  const [fileContent, setFileContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importStats, setImportStats] = useState<{
    total: number;
    success: number;
    errors: number;
  } | null>(null);
  const [manualTransaction, setManualTransaction] = useState({
    date: "",
    description: "",
    amount: 0,
    type: "expense" as "income" | "expense",
    category: "",
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setImportStats(null);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        
        // Check if it's Banco do Brasil format
        if (text.includes('Data,"Lançamento","Detalhes"')) {
          handleBancoDoBrasilCSV(text);
          return;
        }
        
        // Handle generic CSV format
        handleGenericCSV(text);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Erro ao ler arquivo",
        description: "Não foi possível ler o arquivo selecionado.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleBancoDoBrasilCSV = async (csvContent: string) => {
    try {
      const preprocessedTransactions = processBancoDoBrasilCSV(csvContent);
      
      console.log('Preprocessed BB transactions:', preprocessedTransactions.length);
      
      if (preprocessedTransactions.length === 0) {
        toast({
          title: "Nenhuma transação válida",
          description: "Não foi possível importar transações do arquivo do Banco do Brasil.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      let addedCount = 0;
      let errorCount = 0;
      let lowConfidenceCount = 0;
      const transactions = [];

      // First, prepare all transactions
      for (const preprocessed of preprocessedTransactions) {
        try {
          // Use auto-categorization on cleaned description
          const categorizationResult = categorizeTransaction(
            preprocessed.cleanedDescription, 
            preprocessed.type
          );

          const transaction = {
            date: preprocessed.date,
            description: preprocessed.originalDescription,
            amount: preprocessed.normalizedAmount,
            type: preprocessed.type,
            category: categorizationResult.category,
            autoCategorizationResult: {
              ...categorizationResult,
              preprocessingConfidence: preprocessed.confidence,
              cleanedDescription: preprocessed.cleanedDescription,
              tokens: preprocessed.tokens
            }
          };

          transactions.push(transaction);

          if (preprocessed.confidence < 0.7) {
            lowConfidenceCount++;
          }
        } catch (error) {
          console.error('Error processing transaction:', error);
          errorCount++;
        }
      }

      // Use bulk import for better performance
      if (transactions.length > 10) {
        try {
          const response = await makeApiRequest('/transacoes/bulk-import', {
            method: 'POST',
            body: JSON.stringify({ 
              transactions: transactions.map(t => ({
                date: t.date,
                description: t.description,
                amount: t.amount,
                type: t.type,
                category: t.category
              }))
            })
          });

          if (response?.success) {
            const stats = response.data;
            addedCount = stats.success;
            errorCount += stats.errors;
          } else {
            throw new Error(response?.message || 'Erro na importação em lote');
          }
        } catch (error) {
          console.warn('Bulk import failed, falling back to individual imports:', error);
          const result = await importOneByOne(transactions);
          addedCount = result.success;
          errorCount += result.errors;
        }
      } else {
        // Import one by one for small datasets
        const result = await importOneByOne(transactions);
        addedCount = result.success;
        errorCount += result.errors;
      }

      setImportStats({
        total: preprocessedTransactions.length,
        success: addedCount,
        errors: errorCount
      });

      toast({
        title: "Importação Banco do Brasil concluída",
        description: `${addedCount} transações importadas com pré-processamento inteligente${lowConfidenceCount > 0 ? `. ${lowConfidenceCount} transações com baixa confiança.` : '.'}`,
      });

      console.log('Added BB transactions:', addedCount);
      console.log('Low confidence transactions:', lowConfidenceCount);

    } catch (error) {
      console.error('Error processing Banco do Brasil CSV:', error);
      toast({
        title: "Erro na importação",
        description: "Erro ao processar arquivo do Banco do Brasil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenericCSV = async (text: string) => {
    try {
      const rows = text.split('\n');
      
      if (rows.length < 2) {
        toast({
          title: "Arquivo inválido",
          description: "O arquivo deve conter pelo menos uma linha de dados além do cabeçalho.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const header = rows[0].split(',').map(col => col.trim().replace(/"/g, ''));
      console.log('CSV Header:', header);
      
      const transactions = [];
      const errors = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        try {
          const columns = row.split(',').map(col => col.trim().replace(/"/g, ''));
          
          if (columns.length < 3) {
            errors.push(`Linha ${i + 1}: dados insuficientes`);
            continue;
          }

          const dateIndex = header.findIndex(h => 
            h.toLowerCase().includes('data') || 
            h.toLowerCase().includes('date')
          );
          const descIndex = header.findIndex(h => 
            h.toLowerCase().includes('descri') || 
            h.toLowerCase().includes('description') ||
            h.toLowerCase().includes('estabelecimento') ||
            h.toLowerCase().includes('histórico')
          );
          const amountIndex = header.findIndex(h => 
            h.toLowerCase().includes('valor') || 
            h.toLowerCase().includes('amount') ||
            h.toLowerCase().includes('quantia')
          );

          if (dateIndex === -1 || descIndex === -1 || amountIndex === -1) {
            errors.push(`Linha ${i + 1}: colunas obrigatórias não encontradas`);
            continue;
          }

          const dateStr = columns[dateIndex];
          const description = columns[descIndex];
          const amountStr = columns[amountIndex];

          // Use preprocessing for better data quality
          const preprocessed = preprocessTransaction(dateStr, description, amountStr);

          if (preprocessed.normalizedAmount === 0) {
            errors.push(`Linha ${i + 1}: valor inválido (${amountStr})`);
            continue;
          }

          // Use categorization on cleaned description
          const categorizationResult = categorizeTransaction(
            preprocessed.cleanedDescription, 
            preprocessed.type
          );

          const transaction = {
            date: preprocessed.date,
            description: preprocessed.originalDescription,
            amount: preprocessed.normalizedAmount,
            type: preprocessed.type,
            category: categorizationResult.category,
            autoCategorizationResult: {
              ...categorizationResult,
              preprocessingConfidence: preprocessed.confidence,
              cleanedDescription: preprocessed.cleanedDescription,
              tokens: preprocessed.tokens
            }
          };

          transactions.push(transaction);
        } catch (error) {
          errors.push(`Linha ${i + 1}: erro ao processar dados`);
        }
      }

      console.log('Parsed transactions:', transactions.length);
      console.log('Errors:', errors.length);

      if (transactions.length === 0) {
        toast({
          title: "Nenhuma transação válida",
          description: "Não foi possível importar nenhuma transação do arquivo.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      let addedCount = 0;
      let errorCount = 0;

      // Use bulk import for better performance if many transactions
      if (transactions.length > 10) {
        try {
          const response = await makeApiRequest('/transacoes/bulk-import', {
            method: 'POST',
            body: JSON.stringify({ 
              transactions: transactions.map(t => ({
                date: t.date,
                description: t.description,
                amount: t.amount,
                type: t.type,
                category: t.category
              }))
            })
          });

          if (response?.success) {
            const stats = response.data;
            addedCount = stats.success;
            errorCount = stats.errors + errors.length;
          } else {
            throw new Error(response?.message || 'Erro na importação em lote');
          }
        } catch (error) {
          console.warn('Bulk import failed, falling back to individual imports:', error);
          const result = await importOneByOne(transactions);
          addedCount = result.success;
          errorCount = result.errors + errors.length;
        }
      } else {
        // Import one by one for small datasets
        const result = await importOneByOne(transactions);
        addedCount = result.success;
        errorCount = result.errors + errors.length;
      }

      setImportStats({
        total: transactions.length,
        success: addedCount,
        errors: errorCount + errors.length
      });

      console.log('Added transactions:', addedCount);

      toast({
        title: "Importação concluída",
        description: `${addedCount} transações importadas com pré-processamento${errors.length > 0 ? `. ${errors.length} linhas com erro.` : '.'}`,
      });

      if (errors.length > 0) {
        console.warn('Import errors:', errors);
      }
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast({
        title: "Erro na importação",
        description: "Erro ao processar arquivo CSV.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextImport = async () => {
    if (!fileContent.trim()) {
      toast({
        title: "Conteúdo vazio",
        description: "Cole o conteúdo do arquivo antes de importar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setImportStats(null);

    try {
      // Check if it's Banco do Brasil format
      if (fileContent.includes('Data,"Lançamento","Detalhes"')) {
        await handleBancoDoBrasilCSV(fileContent);
      } else {
        await handleGenericCSV(fileContent);
      }

      setFileContent("");
    } catch (error) {
      console.error('Error processing text import:', error);
      toast({
        title: "Erro na importação",
        description: "Erro ao processar o conteúdo colado.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleAddManualTransaction = async () => {
    if (!manualTransaction.date || !manualTransaction.description || manualTransaction.amount <= 0) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Preprocess manual transaction description
      const tokens = tokenizeDescription(manualTransaction.description);
      const cleanedDescription = normalizeText(manualTransaction.description);

      const transactionWithPreprocessing = {
        ...manualTransaction,
        preprocessingData: {
          cleanedDescription,
          tokens,
          originalDescription: manualTransaction.description
        }
      };

      // Try to add via API first, fall back to local context
      try {
        await makeApiRequest(API_ENDPOINTS.TRANSACTIONS, {
          method: 'POST',
          body: JSON.stringify(transactionWithPreprocessing)
        });
      } catch (apiError) {
        console.warn('API failed, using local storage:', apiError);
        addTransaction(transactionWithPreprocessing);
      }

      setManualTransaction({
        date: "",
        description: "",
        amount: 0,
        type: "expense",
        category: "",
      });
      setIsModalOpen(false);
      toast({
        title: "Transação adicionada",
        description: "A transação manual foi adicionada com sucesso.",
      });
    } catch (error) {
      console.error('Error adding manual transaction:', error);
      toast({
        title: "Erro ao adicionar",
        description: "Erro ao adicionar a transação manual.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for individual transaction import
  const importOneByOne = async (transactions: any[]) => {
    let successCount = 0;
    let errorCount = 0;

    for (const transaction of transactions) {
      try {
        // Try to add via API first, fall back to local context
        try {
          await makeApiRequest('/transacoes', {
            method: 'POST',
            body: JSON.stringify({
              tipo: transaction.type || 'expense',
              valor: transaction.amount,
              descricao: transaction.description,
              categoria_id: transaction.category || '62',
              data: new Date(transaction.date).toISOString(),
              recorrente: false
            })
          });
        } catch (apiError) {
          console.warn('API failed, using local storage:', apiError);
          if (addTransaction) {
            addTransaction(transaction);
          }
        }
        successCount++;
      } catch (error) {
        console.error('Error adding transaction:', error);
        errorCount++;
      }
    }

    return { success: successCount, errors: errorCount };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-6 max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <BackButton />
        </div>

        <div
          className="mb-6 lg:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Importar Transações
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Importe com pré-processamento inteligente e categorização automática
              </p>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 w-full sm:w-auto" disabled={isLoading}>
                  <Plus className="h-4 w-4" />
                  Adicionar Manualmente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Transação Manualmente</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="date">Data</Label>
                    <Input
                      type="date"
                      id="date"
                      value={manualTransaction.date}
                      onChange={(e) =>
                        setManualTransaction({
                          ...manualTransaction,
                          date: e.target.value,
                        })
                      }
                      className="mt-1"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={manualTransaction.description}
                      onChange={(e) =>
                        setManualTransaction({
                          ...manualTransaction,
                          description: e.target.value,
                        })
                      }
                      placeholder="Ex: Supermercado"
                      className="mt-1"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Valor</Label>
                    <Input
                      type="number"
                      step="0.01"
                      id="amount"
                      value={manualTransaction.amount || ''}
                      onChange={(e) =>
                        setManualTransaction({
                          ...manualTransaction,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Ex: 100.00"
                      className="mt-1"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <select
                      id="type"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                      value={manualTransaction.type}
                      onChange={(e) =>
                        setManualTransaction({
                          ...manualTransaction,
                          type: e.target.value as "income" | "expense",
                        })
                      }
                      disabled={isLoading}
                    >
                      <option value="expense">Despesa</option>
                      <option value="income">Receita</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    onClick={handleAddManualTransaction}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      'Adicionar'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Import Statistics */}
        {importStats && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Resultado da Importação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-500">{importStats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">{importStats.success}</div>
                  <div className="text-sm text-muted-foreground">Sucesso</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{importStats.errors}</div>
                  <div className="text-sm text-muted-foreground">Erros</div>
                </div>
              </div>
              {importStats.success > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✅ {importStats.success} transações foram importadas com sucesso!
                  </p>
                </div>
              )}
              {importStats.errors > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ {importStats.errors} transações tiveram problemas durante a importação.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader className="px-4 lg:px-6 py-4">
            <CardTitle className="text-base lg:text-lg flex items-center gap-2">
              <Upload className="h-4 w-4 lg:h-5 lg:w-5" />
              Importar de Arquivo CSV
              {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6">
            <p className="text-sm text-muted-foreground mb-4">
              Suporte especial para Banco do Brasil e outros formatos CSV.
            </p>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full"
              disabled={isLoading}
            />
            {isLoading && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando arquivo...
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 lg:px-6 py-4">
            <CardTitle className="text-base lg:text-lg flex items-center gap-2">
              <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
              Importar de Texto
              {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6">
            <p className="text-sm text-muted-foreground mb-4">
              Cole o conteúdo do seu arquivo CSV ou extrato bancário aqui.
            </p>
            <Textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              placeholder="Cole o conteúdo aqui..."
              className="w-full"
              disabled={isLoading}
            />
            <Button 
              className="mt-4 w-full" 
              onClick={handleTextImport}
              disabled={isLoading || !fileContent.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Importar com Pré-processamento'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card>
          <CardHeader className="px-4 lg:px-6 py-4">
            <CardTitle className="text-base lg:text-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 lg:h-5 lg:w-5" />
              Dicas de Formatação
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6">
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Formato CSV Genérico:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Colunas obrigatórias: Data, Descrição, Valor</li>
                  <li>Formato de data aceito: DD/MM/AAAA ou AAAA-MM-DD</li>
                  <li>Valores com vírgula ou ponto decimal</li>
                  <li>Primeira linha deve conter cabeçalhos</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Exemplo CSV:</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-xs">
                  Data,Descrição,Valor<br/>
                  15/07/2025,Supermercado ABC,150.50<br/>
                  16/07/2025,Salário,3000.00<br/>
                  17/07/2025,Posto de gasolina,-80.00
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Funcionalidades Automáticas:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>🤖 Categorização automática baseada na descrição</li>
                  <li>🧹 Limpeza e normalização de texto</li>
                  <li>💰 Detecção automática de receitas e despesas</li>
                  <li>🏦 Suporte especializado para Banco do Brasil</li>
                  <li>📊 Análise de confiança dos dados importados</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Importar;
