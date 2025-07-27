import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Loader2 } from "lucide-react";

export default function AuthStatus() {
  const { user, loading } = useGoogleAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-2 px-2 text-sm text-gray-500 dark:text-gray-400">
        <Loader2 className="animate-spin w-5 h-5 mr-2" />
        <span>Verificando sessão...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 py-2 px-2 bg-white/70 dark:bg-zinc-800/70 rounded-lg shadow-sm">
        {user.photoURL && (
          <img src={user.photoURL} alt="Avatar" className="w-7 h-7 rounded-full border border-gray-300 dark:border-zinc-700" />
        )}
        <div className="flex flex-col leading-tight">
          <span className="font-medium text-gray-900 dark:text-white text-sm">
            {user.displayName || "Usuário"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 px-2 text-gray-500 dark:text-gray-400 text-sm">
      Nenhum usuário logado.
    </div>
  );
}
