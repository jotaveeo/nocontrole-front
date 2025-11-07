import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Loader2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AuthStatus() {
  const { user, loading, signOut } = useGoogleAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 text-sm text-gray-500 dark:text-gray-400">
        <Loader2 className="animate-spin w-4 h-4" />
        <span className="hidden sm:inline">Verificando...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 py-1.5 px-3 bg-white/70 dark:bg-zinc-800/70 rounded-lg shadow-sm border border-gray-200/50 dark:border-zinc-700/50">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-6 h-6 rounded-full border border-gray-300 dark:border-zinc-700"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-primary" />
            </div>
          )}
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-medium text-gray-900 dark:text-white text-xs">
              {user.displayName || "Usuário"}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {user.email}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="hidden sm:flex h-8 text-xs"
        >
          Sair
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link to="/login">Entrar</Link>
      </Button>
      <Button variant="default" size="sm" className="hidden sm:flex" asChild>
        <Link to="/cadastro">Criar Conta</Link>
      </Button>
    </div>
  );
}
