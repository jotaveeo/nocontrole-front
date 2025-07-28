// filepath: src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCUtzY69nzrAwG2XLi_83HUPXp5qxM6hGs",
  authDomain: "financicontrol.firebaseapp.com",
  projectId: "financicontrol",
  storageBucket: "financicontrol.firebasestorage.app",
  messagingSenderId: "203671489875",
  appId: "1:203671489875:web:6184364bf416dce71ca5a6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configurar persistência local
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Erro ao configurar persistência:", error);
  });

// Configurar provider do Google
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Adicionar parâmetros para evitar problemas de COOP
  auth_type: 'popup',
  access_type: 'offline'
});