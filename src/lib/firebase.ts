// filepath: src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";

// ⚠️ IMPORTANTE: Migre essas credenciais para .env em produção
// Use variáveis de ambiente com prefixo VITE_ para Vite
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyCUtzY69nzrAwG2XLi_83HUPXp5qxM6hGs",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "financicontrol.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "financicontrol",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "financicontrol.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "203671489875",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:203671489875:web:6184364bf416dce71ca5a6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YW4TWYY3MP",
};

const app = initializeApp(firebaseConfig);

// Inicializar Analytics apenas em produção
let analytics;
if (typeof window !== "undefined" && import.meta.env.PROD) {
  analytics = getAnalytics(app);
}

export { analytics };
export const auth = getAuth(app);

// Configurar persistência local
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Erro ao configurar persistência:", error);
  });

// Configurar provider do Google
export const googleProvider = new GoogleAuthProvider();

// Configurações adicionais do Google Provider
googleProvider.setCustomParameters({
  prompt: "select_account", // Sempre mostra seletor de conta
});
