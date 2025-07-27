// filepath: src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCUtzY69nzrAwG2XLi_83HUPXp5qxM6hGs",
  authDomain: "financicontrol.firebaseapp.com",
  projectId: "financicontrol",
  storageBucket: "financicontrol.firebasestorage.app",
  messagingSenderId: "203671489875",
  appId: "1:203671489875:web:6184364bf416dce71ca5a6",
  measurementId: "G-YW4TWYY3MP"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();