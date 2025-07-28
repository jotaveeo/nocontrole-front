import { useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged, User, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";


export function useGoogleAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  // Monitorar mudanças no estado de autenticação
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      
      try {
        if (firebaseUser) {
          // Limpar qualquer timeout pendente
          if (timeoutId) clearTimeout(timeoutId);
          
          // Atualizar user primeiro para evitar estado intermediário
          setUser(firebaseUser);
          
          // Gerenciar token com retry
          const getTokenWithRetry = async (retries = 3) => {
            try {
              const token = await firebaseUser.getIdToken(false);
              if (token && isMounted) {
                setIdToken(token);
                localStorage.setItem('authToken', token);
              }
            } catch (err) {
              if (retries > 0 && isMounted) {
                // Esperar 1 segundo antes de tentar novamente
                await new Promise(resolve => setTimeout(resolve, 1000));
                return getTokenWithRetry(retries - 1);
              }
              throw err;
            }
          };
          
          await getTokenWithRetry();
        } else {
          // Dar um tempo antes de limpar os dados para evitar flashes
          timeoutId = setTimeout(() => {
            if (isMounted) {
              setUser(null);
              setIdToken(null);
              localStorage.removeItem('authToken');
            }
          }, 100);
        }
      } catch (err: any) {
        console.error("Erro ao verificar autenticação:", err);
        if (isMounted) {
          if (err?.code === 'auth/quota-exceeded') {
            setError("Limite de tentativas excedido. Tente novamente em alguns minutos.");
          } else {
            setError("Erro ao verificar autenticação");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const signIn = async () => {
    // Previne múltiplas tentativas enquanto carrega
    if (loading) return;
    
    setError(null);
    setLoading(true);
    
    try {
      // Limpar qualquer token antigo
      localStorage.removeItem('authToken');
      
      // Usar uma Promise com timeout para garantir que o popup não fique aberto indefinidamente
      const signInPromise = new Promise(async (resolve, reject) => {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      // Timeout de 2 minutos
      const timeoutPromise = new Promise((_, reject) => {
        const timeout = setTimeout(() => {
          clearTimeout(timeout);
          reject(new Error('auth/timeout'));
        }, 120000);
      });

      // Race entre o login e o timeout
      const result = await Promise.race([signInPromise, timeoutPromise]) as any;
      
      if (!result?.user) {
        throw new Error('auth/no-user-data');
      }
      
      const token = await result.user.getIdToken();
      setIdToken(token);
      localStorage.setItem('authToken', token);
      
      // Pequeno delay para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (err: any) {
      console.error("Erro no login:", err);
      
      const errorMessages: Record<string, string> = {
        'auth/quota-exceeded': 'Limite de tentativas excedido. Aguarde alguns minutos.',
        'auth/popup-closed-by-user': 'Login cancelado',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
        'auth/internal-error': 'Erro interno. Tente novamente em alguns instantes',
        'auth/timeout': 'Tempo limite excedido. Tente novamente.',
        'auth/no-user-data': 'Erro ao obter dados do usuário. Tente novamente.',
        'auth/popup-closed': 'Login cancelado'
      };

      setError(errorMessages[err.code] || 'Erro ao fazer login. Tente novamente');
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setError(null);
    setLoading(true);
    
    try {
      await signOut(auth);
      localStorage.removeItem('authToken');
    } catch (err: any) {
      console.error("Erro ao fazer logout:", err);
      setError('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, signIn, signOut: signOutUser, idToken };
}
