import { PatientCase } from '../types';

const DB_NAME = 'homeo_pilot_360_db';
const DB_VERSION = 1;
const STORE_NAME = 'keyval_store';
const CASES_STORE_KEY = 'patient_cases_v1';

/**
 * Safely opens or creates the IndexedDB database.
 */
function openDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('[IndexedDB] Failed to open database:', request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('[IndexedDB] Initialization exception:', err);
      resolve(null);
    }
  });
}

/**
 * Saves a key-value pair to IndexedDB.
 */
export async function saveItemToIndexedDB(key: string, value: unknown): Promise<void> {
  const db = await openDatabase();
  if (!db) return;

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);

      req.onsuccess = () => resolve();
      req.onerror = () => {
        console.warn(`[IndexedDB] Error putting key "${key}":`, req.error);
        reject(req.error);
      };
      tx.onabort = () => reject(tx.error);
    } catch (err) {
      console.warn(`[IndexedDB] Exception putting key "${key}":`, err);
      resolve();
    }
  });
}

/**
 * Loads a value by key from IndexedDB.
 */
export async function loadItemFromIndexedDB<T = unknown>(key: string): Promise<T | null> {
  const db = await openDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve((req.result as T) ?? null);
      };
      req.onerror = () => {
        console.warn(`[IndexedDB] Error reading key "${key}":`, req.error);
        resolve(null);
      };
    } catch (err) {
      console.warn(`[IndexedDB] Exception reading key "${key}":`, err);
      resolve(null);
    }
  });
}

/**
 * Removes an item from IndexedDB.
 */
export async function removeItemFromIndexedDB(key: string): Promise<void> {
  const db = await openDatabase();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);

      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Asynchronously persists full-fidelity patient cases into IndexedDB.
 */
export async function saveCasesToIndexedDB(cases: PatientCase[]): Promise<void> {
  if (!Array.isArray(cases)) return;
  await saveItemToIndexedDB(CASES_STORE_KEY, cases);
}

/**
 * Loads cached patient cases from IndexedDB if available.
 */
export async function loadCasesFromIndexedDB(): Promise<PatientCase[] | null> {
  const cases = await loadItemFromIndexedDB<PatientCase[]>(CASES_STORE_KEY);
  if (Array.isArray(cases) && cases.length > 0) {
    return cases;
  }
  return null;
}
