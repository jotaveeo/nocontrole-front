import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Save, Loader2 } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { API_ENDPOINTS, makeApiRequest } from "@/lib/api";
import { NovoLancamentoSkeleton } from "@/components/skeletons";

interface Category {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  tipo: "receita" | "despesa";
  ativo: boolean;
}

const NovoLancamento = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    tipo: "despesa" as "receita" | "despesa",
    valor: "",
    descricao: "",
    categoriaId: "",
    data: new Date().toISOString().split("T")[0],
    observacoes: "",
  });

  const [loading, setLoading] = useState(false);

  // Carregar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("=== DEBUG CATEGORIAS ===");
        console.log("Usuário atual:", user);
        console.log("Token disponível:", !!localStorage.getItem("token"));

        // Não precisa mais enviar usuario_id - vem do token JWT
        const endpoint = API_ENDPOINTS.CATEGORIES;

        console.log("Endpoint completo:", endpoint);

        const data = await makeApiRequest(endpoint);
        console.log("Resposta completa da API:", data);

        if (data.success) {
          console.log("Todas as categorias recebidas:", data.data);

          // 🔧 CORREÇÃO: A API retorna data.data.categorias, não data.data diretamente
          let categoriasList = [];

          if (Array.isArray(data.data)) {
            // Se data.data é um array direto
            categoriasList = data.data;
          } else if (data.data && data.data.categorias) {
            // Se data.data tem propriedade categorias (caso atual)
            categoriasList = data.data.categorias;
          } else if (data.data && Array.isArray(data.data.data)) {
            // Fallback para outras estruturas
            categoriasList = data.data.data;
          }

          console.log("📋 Categorias extraídas:", categoriasList);
          console.log(
            "📊 Tipo de categoriasList:",
            typeof categoriasList,
            Array.isArray(categoriasList)
          );

          // � NORMALIZAR: Converter campos mapeados pelo backend para o formato esperado pelo frontend
          const categoriasNormalizadas = categoriasList.map((cat: any) => ({
            id: cat.id || cat._id,
            nome: cat.nome || cat.name || "",
            icone: cat.icone || cat.icon || "",
            cor: cat.cor || cat.color || "#000000",
            tipo: cat.tipo || cat.type || "despesa",
            ativo:
              cat.ativo !== undefined
                ? cat.ativo
                : cat.active !== undefined
                ? cat.active
                : true,
          }));

          console.log("✨ Categorias normalizadas:", categoriasNormalizadas);

          // �🔍 DEBUG DETALHADO: Mostrar cada categoria normalizada individualmente
          categoriasNormalizadas.forEach((cat, index) => {
            console.log(`🏷️ Categoria Normalizada ${index}:`, {
              id: cat.id,
              nome: cat.nome,
              tipo: cat.tipo,
              icone: cat.icone,
              cor: cat.cor,
              ativo: cat.ativo,
            });
          });

          // Filtrar apenas por ativo
          const activeCategories = categoriasNormalizadas.filter(
            (cat: Category) => cat.ativo !== false
          );
          console.log("✅ Categorias ativas finais:", activeCategories);

          setCategories(activeCategories);
        } else {
          console.error("Erro na resposta:", data.message);
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        toast({
          title: "Erro ao carregar categorias",
          description: "Não foi possível carregar as categorias.",
          variant: "destructive",
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    // Sempre tentar carregar, mesmo sem usuário (para debug)
    fetchCategories();
  }, [toast, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast({
        title: "Usuário não autenticado",
        description: "Faça login para criar lançamentos.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.valor || !formData.descricao || !formData.categoriaId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.valor) <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    // 🔧 Validação adicional dos campos
    if (!formData.categoriaId || formData.categoriaId.length !== 24) {
      toast({
        title: "Categoria inválida",
        description: "Selecione uma categoria válida.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.descricao.trim()) {
      toast({
        title: "Descrição inválida",
        description: "A descrição não pode estar vazia.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // 🔧 Validação da data antes de formatar
      const dataValida = new Date(formData.data);
      if (isNaN(dataValida.getTime())) {
        throw new Error("Data inválida");
      }

      const transactionData = {
        // usuario_id agora vem do token JWT
        categoria_id: formData.categoriaId,
        tipo: formData.tipo,
        valor: parseFloat(formData.valor),
        descricao: formData.descricao.trim(),
        data: dataValida.toISOString(), // 🔧 Garantir formato ISO correto
        observacoes: formData.observacoes?.trim() || "", // 🔧 Limpar espaços e valor padrão
      };

      console.log("=== DEBUG ENVIO TRANSAÇÃO ===");
      console.log("Dados sendo enviados:", transactionData);
      console.log("Usuário:", user);
      console.log("🔍 Validação detalhada dos campos:");
      console.log("- categoria_id:", {
        valor: transactionData.categoria_id,
        length: transactionData.categoria_id?.length,
        isValid: transactionData.categoria_id?.length === 24,
        isString: typeof transactionData.categoria_id === "string",
      });
      console.log("- tipo:", {
        valor: transactionData.tipo,
        isValid: ["receita", "despesa"].includes(transactionData.tipo),
        isString: typeof transactionData.tipo === "string",
      });
      console.log("- valor:", {
        valor: transactionData.valor,
        type: typeof transactionData.valor,
        isNumber: typeof transactionData.valor === "number",
        isPositive: transactionData.valor > 0,
        isNotNaN: !isNaN(transactionData.valor),
      });
      console.log("- descricao:", {
        valor: transactionData.descricao,
        length: transactionData.descricao?.length,
        isString: typeof transactionData.descricao === "string",
        isNotEmpty: transactionData.descricao?.trim().length > 0,
      });
      console.log("- data:", {
        valor: transactionData.data,
        isISO: transactionData.data?.includes("T"),
        isValid: !isNaN(new Date(transactionData.data).getTime()),
        isString: typeof transactionData.data === "string",
      });
      console.log("- observacoes:", {
        valor: transactionData.observacoes,
        type: typeof transactionData.observacoes,
        isString: typeof transactionData.observacoes === "string",
      });

      // 🔧 Validação final antes do envio
      const validacoes = {
        categoria_id: transactionData.categoria_id?.length === 24,
        tipo: ["receita", "despesa"].includes(transactionData.tipo),
        valor:
          typeof transactionData.valor === "number" &&
          transactionData.valor > 0 &&
          !isNaN(transactionData.valor),
        descricao:
          typeof transactionData.descricao === "string" &&
          transactionData.descricao.trim().length > 0,
        data:
          typeof transactionData.data === "string" &&
          !isNaN(new Date(transactionData.data).getTime()),
        observacoes: typeof transactionData.observacoes === "string",
      };

      console.log("✅ Resultado das validações:", validacoes);
      console.log(
        "✅ Todas válidas:",
        Object.values(validacoes).every((v) => v === true)
      );

      if (!Object.values(validacoes).every((v) => v === true)) {
        const camposInvalidos = Object.entries(validacoes)
          .filter(([_, valid]) => !valid)
          .map(([campo, _]) => campo);

        console.error("❌ Campos inválidos:", camposInvalidos);
        toast({
          title: "Dados inválidos",
          description: `Campos com problema: ${camposInvalidos.join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      const data = await makeApiRequest(API_ENDPOINTS.TRANSACTIONS, {
        method: "POST",
        body: JSON.stringify(transactionData),
      });

      if (data.success) {
        toast({
          title: "Lançamento criado",
          description: `${
            formData.tipo === "receita" ? "Receita" : "Despesa"
          } de R$ ${parseFloat(formData.valor).toFixed(
            2
          )} adicionada com sucesso.`,
        });
        navigate("/dashboard");
      } else {
        console.error("❌ Erro na resposta da API:", data);
        throw new Error(data.message || "Erro ao criar lançamento");
      }
    } catch (error) {
      console.error("❌ Erro ao criar lançamento:", error);

      // 🔍 Debug adicional para erros 400
      if (error.message?.includes("400")) {
        console.error("🔍 Erro 400 - Possíveis problemas:");
        console.error("1. categoria_id inválido:", formData.categoriaId);
        console.error("2. valor inválido:", formData.valor);
        console.error("3. campos obrigatórios faltando");
      }

      toast({
        title: "Erro ao criar lançamento",
        description: error.message?.includes("400")
          ? "Dados inválidos. Verifique se todos os campos estão preenchidos corretamente."
          : "Não foi possível criar o lançamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ FILTRO SIMPLES: Agora que os dados estão normalizados, usar filtro direto
  const filteredCategories = categories.filter(
    (cat) => cat.tipo === formData.tipo
  );

  // 🔍 DEBUG: Verificar categorias filtradas (simplificado)
  console.log("🔍 DEBUG FILTRO CATEGORIAS (NORMALIZADO):");
  console.log("- Tipo selecionado:", formData.tipo);
  console.log("- Total categorias disponíveis:", categories.length);
  console.log("- Categorias filtradas:", filteredCategories.length);
  console.log(
    "- Categorias disponíveis:",
    categories.map((c) => ({
      id: c.id,
      nome: c.nome,
      tipo: c.tipo,
      ativo: c.ativo,
    }))
  );
  console.log(
    "- Categorias filtradas:",
    filteredCategories.map((c) => ({
      id: c.id,
      nome: c.nome,
      tipo: c.tipo,
      ativo: c.ativo,
    }))
  );

  if (loadingCategories) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <NovoLancamentoSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 lg:p-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <BackButton />
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Novo Lançamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: "receita" | "despesa") => {
                    setFormData({ ...formData, tipo: value, categoriaId: "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="despesa">
                      <span className="flex items-center gap-2">
                        <span className="text-red-500">📉</span>
                        Despesa
                      </span>
                    </SelectItem>
                    <SelectItem value="receita">
                      <span className="flex items-center gap-2">
                        <span className="text-green-500">📈</span>
                        Receita
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                  placeholder="0,00"
                  required
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  placeholder="Descreva o lançamento..."
                  required
                  maxLength={255}
                />
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={formData.categoriaId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoriaId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.length === 0 ? (
                      <SelectItem value="no-category" disabled>
                        Nenhuma categoria de {formData.tipo} encontrada
                      </SelectItem>
                    ) : (
                      filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className="flex items-center gap-2">
                            <span style={{ color: category.cor }}>
                              {category.icone}
                            </span>
                            {category.nome}
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {filteredCategories.length === 0 && (
                  <div className="text-sm text-muted-foreground p-4 border rounded">
                    <p>Nenhuma categoria de {formData.tipo} encontrada.</p>
                    <p className="mt-2">
                      <strong>Debug Info:</strong>
                      <br />- Total categorias: {categories.length}
                      <br />- Usuário logado: {user?.id ? "Sim" : "Não"}
                      <br />- Categorias do tipo {formData.tipo}:{" "}
                      {filteredCategories.length}
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-sm mt-2"
                      onClick={() => navigate("/categorias")}
                    >
                      Criar categoria
                    </Button>
                  </div>
                )}
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) =>
                    setFormData({ ...formData, data: e.target.value })
                  }
                  required
                />
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  placeholder="Observações adicionais (opcional)..."
                  rows={3}
                  maxLength={500}
                />
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NovoLancamento;
