import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

export const FIREBASE_CONFIG = {
  projectId: "gen-lang-client-0954439437",
  appId: "1:1021774327269:web:273231150cd0e60982d30c",
  apiKey: "AIzaSyACtfbpcnDT54BwH7qQUmGzHVKDfCzyjDw",
  authDomain: "gen-lang-client-0954439437.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-homopraxissaas-0b5b8380-3389-4b27-b75d-32eb59f3393f",
  storageBucket: "gen-lang-client-0954439437.firebasestorage.app",
  messagingSenderId: "1021774327269",
  measurementId: "",
  oAuthClientId: "1021774327269-8b0896vopkmpphipklvjksmtqlg6ig81.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

let dbInstance: Firestore | null = null;

export function getDb(): Firestore | null {
  if (typeof window === 'undefined') return null;
  if (dbInstance) return dbInstance;

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);
    try {
      if (FIREBASE_CONFIG.firestoreDatabaseId) {
        dbInstance = getFirestore(app, FIREBASE_CONFIG.firestoreDatabaseId);
      } else {
        dbInstance = getFirestore(app);
      }
    } catch (e) {
      console.warn('[Firebase] Named database init fallback to default:', e);
      dbInstance = getFirestore(app);
    }
    return dbInstance;
  } catch (err) {
    console.error('[Firebase] Failed to initialize Firebase app:', err);
    return null;
  }
}
