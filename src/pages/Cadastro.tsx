import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { Loader2, LogIn } from "lucide-react";
import { API_ENDPOINTS, makeApiRequest } from "@/lib/api";

const Cadastro = () => {
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // Validação de email
  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validação de senha forte
  const isPasswordValid = (password: string) =>
    password.length >= 6 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      alert("O nome é obrigatório.");
      return;
    }
    if (!isEmailValid(form.email)) {
      alert("Digite um e-mail válido.");
      return;
    }
    if (!isPasswordValid(form.senha)) {
      alert(
        "A senha deve ter pelo menos 6 caracteres, incluindo uma letra maiúscula, uma minúscula e um número."
      );
      return;
    }

    setLoading(true);
    
    try {
      const data = await makeApiRequest(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          name: form.nome,
          email: form.email,
          password: form.senha,
        }),
      });

      if (data.success) {
        // Salvar tokens se retornados na resposta
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          localStorage.setItem('expires_at', data.expires_at);
          localStorage.setItem('user', JSON.stringify(data.data || data.user));
        }
        
        alert("Conta criada com sucesso!");
        navigate("/login");
      } else {
        alert(data.message || data.error || "Erro ao criar conta. Tente novamente.");
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      alert("Erro de conexão. Verifique se o servidor está rodando.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (error) {
      alert("Erro ao autenticar com Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-400 via-violet-700 to-violet-950 relative overflow-hidden">
      {/* Overlay opcional para reforçar contraste */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />
      <Card
        className="w-full max-w-md shadow-lg backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border border-white/40 dark:border-zinc-700/40 relative z-10"
      >
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
            Criar Conta no <span className="text-violet-700">NoControle</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                required
                autoComplete="name"
                value={form.nome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nome: e.target.value }))
                }
                aria-label="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                aria-label="E-mail"
              />
            </div>
            <div>
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete="new-password"
                required
                value={form.senha}
                onChange={(e) =>
                  setForm((f) => ({ ...f, senha: e.target.value }))
                }
                aria-label="Senha"
              />
              <span className="text-xs text-muted-foreground">
                Mínimo 6 caracteres, incluindo maiúscula, minúscula e número.
              </span>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>
          <Button
            type="button"
            className="w-full mt-2"
            onClick={handleGoogleSignIn}
            variant="outline"
            disabled={googleLoading}
            aria-label="Entrar com Google"
          >
            {googleLoading ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-4 w-4 mr-2"
              />
            )}
            {googleLoading ? "Entrando..." : "Entrar com Google"}
          </Button>
          <div className="text-center text-sm mt-4">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cadastro;
