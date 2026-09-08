// src/lib/firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const pick = (pub, vite) =>
  (import.meta.env[pub] ?? import.meta.env[vite] ?? "").toString().trim();

const cfg = {
  apiKey:            pick("PUBLIC_FIREBASE_API_KEY",            "VITE_FIREBASE_API_KEY"),
  authDomain:        pick("PUBLIC_FIREBASE_AUTH_DOMAIN",        "VITE_FIREBASE_AUTH_DOMAIN"),
  projectId:         pick("PUBLIC_FIREBASE_PROJECT_ID",         "VITE_FIREBASE_PROJECT_ID"),
  storageBucket:     pick("PUBLIC_FIREBASE_STORAGE_BUCKET",     "VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: pick("PUBLIC_FIREBASE_MESSAGING_SENDER_ID","VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId:             pick("PUBLIC_FIREBASE_APP_ID",             "VITE_FIREBASE_APP_ID"),
  measurementId:     pick("PUBLIC_FIREBASE_MEASUREMENT_ID",     "VITE_FIREBASE_MEASUREMENT_ID"),
};


// Log SOLO para confirmar en el NAVEGADOR; bórralo luego
if (typeof window !== "undefined") {
  console.table({ from: "client", hasApiKey: !!cfg.apiKey, apiKeyLen: cfg.apiKey?.length || 0, projectId: cfg.projectId });
}


const app = getApps().length ? getApp() : initializeApp(cfg);

export { app };
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
