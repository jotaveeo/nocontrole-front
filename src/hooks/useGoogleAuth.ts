import { useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged, User, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";


export function useGoogleAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setIdToken(token);
      } else {
        setIdToken(null);
        setGoogleAccessToken(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      setGoogleAccessToken(credential?.accessToken || null);
      if (result.user) {
        const token = await result.user.getIdToken();
        setIdToken(token);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signOutUser = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { user, loading, error, signIn, signOut: signOutUser, idToken, googleAccessToken };
}
