import { Button } from "@/components/ui/button";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Loader2, LogOut } from "lucide-react";

export default function GoogleLoginButton() {
  const { user, loading, signIn, signOut } = useGoogleAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Loader2 className="animate-spin w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Verificando autenticação...
        </span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3 w-full">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 border-primary/20"
            />
          )}
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {user.displayName || "Usuário"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </span>
          </div>
        </div>
        <Button
          onClick={signOut}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={signIn}
      className="w-full bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 flex items-center justify-center gap-2 shadow-sm transition-all"
      size="lg"
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
