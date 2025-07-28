import { Button } from "@/components/ui/button";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export default function GoogleLoginButton() {
  const { user, loading, error, signIn, signOut } = useGoogleAuth();

  if (loading) {
    return (
      <Button disabled className="w-full">
        <span className="animate-spin mr-2">⌛</span>
        Carregando...
      </Button>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-red-500 text-sm">{error}</p>
        <Button 
          onClick={signIn} 
          variant="outline"
          className="w-full"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'Usuário'} 
              className="w-6 h-6 rounded-full"
            />
          )}
          <span>Olá, {user.displayName || user.email?.split('@')[0] || 'Usuário'}!</span>
        </div>
        <Button 
          onClick={signOut} 
          variant="outline"
          className="w-full"
        >
          Sair da conta
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={signIn} 
      variant="outline"
      className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-2"
    >
      <img 
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
        alt="Google" 
        className="w-5 h-5" 
      />
      Entrar com Google
    </Button>
  );
}
