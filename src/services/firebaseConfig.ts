import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import appletConfig from '../../firebase-applet-config.json';

export const FIREBASE_CONFIG = appletConfig || {
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

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  if (!appInstance) {
    try {
      appInstance = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);
    } catch (e) {
      console.error('[Firebase] Failed to initialize App:', e);
      return null;
    }
  }
  return appInstance;
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  if (authInstance) return authInstance;
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    authInstance = getAuth(app);
    return authInstance;
  } catch (err) {
    console.error('[Firebase] Failed to initialize Auth:', err);
    return null;
  }
}

export function getDb(): Firestore | null {
  if (typeof window === 'undefined') return null;
  if (dbInstance) return dbInstance;

  try {
    const app = getFirebaseApp();
    if (!app) return null;
    const dbId = FIREBASE_CONFIG.firestoreDatabaseId || undefined;
    try {
      // experimentalForceLongPolling avoids WebChannel stream buffering and
      // prevents "Could not reach Cloud Firestore backend" connection errors in iframe/sandboxed environments.
      dbInstance = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true
      }, dbId);
    } catch {
      // If already initialized with different settings or not supported
      try {
        dbInstance = getFirestore(app, dbId);
      } catch (e2) {
        console.warn('[Firebase] Fallback getFirestore:', e2);
        dbInstance = getFirestore(app);
      }
    }
    return dbInstance;
  } catch (err) {
    console.error('[Firebase] Failed to initialize Firebase Firestore:', err);
    return null;
  }
}

