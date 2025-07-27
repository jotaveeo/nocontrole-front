import { Button } from "@/components/ui/button";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export default function GoogleLoginButton() {
  const { user, loading, error, signIn, signOut } = useGoogleAuth();

  if (loading) return <div>Carregando...</div>;

  if (user) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div>Bem-vindo, {user.displayName || user.email}!</div>
        <Button onClick={signOut} variant="outline">Sair</Button>
      </div>
    );
  }

  return (
    <Button onClick={signIn} className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-2">
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
      Entrar com Google
    </Button>
  );
}
