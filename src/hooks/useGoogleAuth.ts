import { useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged, User, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function useGoogleAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setIdToken(token);
          // Salvar no localStorage para uso em requisições API
          localStorage.setItem('firebase_id_token', token);
        } catch (err) {
          console.error('Erro ao obter token:', err);
          toast({
            title: "Erro de autenticação",
            description: "Não foi possível obter o token de acesso.",
            variant: "destructive",
          });
        }
      } else {
        setIdToken(null);
        setGoogleAccessToken(null);
        localStorage.removeItem('firebase_id_token');
      }
    });
    return () => unsubscribe();
  }, [toast]);

  const signIn = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      setGoogleAccessToken(credential?.accessToken || null);
      
      if (result.user) {
        const token = await result.user.getIdToken();
        setIdToken(token);
        localStorage.setItem('firebase_id_token', token);
        
        toast({
          title: "✅ Login realizado com sucesso!",
          description: `Bem-vindo, ${result.user.displayName || result.user.email}!`,
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao fazer login com Google";
      setError(errorMessage);
      
      // Mensagens de erro mais amigáveis
      let userMessage = "Não foi possível fazer login com Google.";
      if (err.code === 'auth/popup-closed-by-user') {
        userMessage = "Login cancelado. Tente novamente.";
      } else if (err.code === 'auth/popup-blocked') {
        userMessage = "Popup bloqueado. Permita popups e tente novamente.";
      } else if (err.code === 'auth/network-request-failed') {
        userMessage = "Erro de conexão. Verifique sua internet.";
      }
      
      toast({
        title: "Erro no login",
        description: userMessage,
        variant: "destructive",
      });
      
      console.error('Erro no login Google:', err);
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setError(null);
    try {
      await signOut(auth);
      localStorage.removeItem('firebase_id_token');
      
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      });
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao fazer logout";
      setError(errorMessage);
      
      toast({
        title: "Erro ao sair",
        description: "Não foi possível fazer logout. Tente novamente.",
        variant: "destructive",
      });
      
      console.error('Erro no logout:', err);
    }
  };

  return { user, loading, error, signIn, signOut: signOutUser, idToken, googleAccessToken };
}
