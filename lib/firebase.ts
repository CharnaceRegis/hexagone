import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Les variables sont définies dans le fichier .env à la racine du projet.
// En Expo, les variables exposées au client doivent être préfixées par EXPO_PUBLIC_.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Avertissement explicite si une variable manque (cas .env vide ou Expo pas redémarré)
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.warn(
    "[Firebase] ⚠️ Variables d'env manquantes :",
    missingKeys.join(", "),
    "→ vérifie ton fichier .env et redémarre Expo (npm start)."
  );
}

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
