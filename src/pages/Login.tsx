import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const { signIn, user, loading: googleLoading, error } = useGoogleAuth();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Validação básica de email
  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailValid(form.email)) {
      alert("Digite um e-mail válido.");
      return;
    }
    if (!form.senha) {
      alert("Digite sua senha.");
      return;
    }

    setLoading(true);
    
    try {
      const success = await login(form.email, form.senha);
      if (success) {
        navigate("/dashboard");
      } else {
        alert("Email ou senha incorretos.");
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert("Erro de conexão. Verifique se o servidor está rodando.");
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleSignIn = async () => {
    await signIn();
    // O redirecionamento será feito pelo useEffect abaixo
  };

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tl from-violet-950 via-violet-700 to-violet-400 relative overflow-hidden">
      {/* Overlay para contraste */}
      <div className="absolute inset-0 bg-white/30 dark:bg-black/30 z-0" />
      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full max-w-md shadow-lg backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border border-white/40 dark:border-zinc-700/40 relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
              Entrar no <span className="text-violet-700">NoControle</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-6"
              onSubmit={handleSubmit}
              autoComplete="on"
            >
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
                  autoComplete="current-password"
                  required
                  value={form.senha}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, senha: e.target.value }))
                  }
                  aria-label="Senha"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {loading ? "Entrando..." : "Entrar"}
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
            {error && (
              <div className="text-red-500 text-xs text-center mt-2">{error}</div>
            )}
            <div className="text-center text-sm mt-4">
              Não tem conta?{" "}
              <Link to="/cadastro" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
