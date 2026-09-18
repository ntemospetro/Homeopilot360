import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { getDb } from './firebaseConfig';
import { Therapist, PatientCase, PackagePlan } from '../types';

/**
 * Strips all undefined fields recursively so Firestore never rejects documents.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        result[key] = sanitizeForFirestore(value);
      }
    }
    return result as T;
  }
  return data;
}

let isInitialized = false;
let unsubTherapists: Unsubscribe | null = null;
let unsubCases: Unsubscribe | null = null;

export type CloudSyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';
let currentSyncStatus: CloudSyncStatus = 'idle';

export function getCloudSyncStatus(): CloudSyncStatus {
  return currentSyncStatus;
}

function setSyncStatus(status: CloudSyncStatus) {
  currentSyncStatus = status;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('homoeo_cloud_sync_status', { detail: { status } }));
  }
}

/**
 * Initialize Cloud Synchronization.
 * 1. Synchronizes therapists and cases with Firestore.
 * 2. Seeds initial data into Firestore if Firestore is currently empty.
 * 3. Listens in real-time for changes made on any other device or deploy.
 */
export async function initCloudSync(
  getLocalTherapists: () => Therapist[],
  saveLocalTherapists: (therapists: Therapist[]) => void,
  getLocalCases: () => PatientCase[],
  saveLocalCases: (cases: PatientCase[]) => void,
  getLocalPackages?: () => PackagePlan[],
  saveLocalPackages?: (packages: PackagePlan[]) => void
): Promise<void> {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  const db = getDb();
  if (!db) {
    console.warn('[CloudSync] Firebase DB is not available, operating in local-only mode.');
    setSyncStatus('offline');
    return;
  }

  setSyncStatus('syncing');

  try {
    // 1. THERAPISTS SYNC
    const therapistsCol = collection(db, 'therapists');
    const therapistsSnap = await getDocs(therapistsCol);

    if (therapistsSnap.empty) {
      // First-time seed: push existing local therapists to Firestore
      const localTherapists = getLocalTherapists();
      if (localTherapists.length > 0) {
        console.log(`[CloudSync] Initial seed: uploading ${localTherapists.length} therapists to Firestore...`);
        const batch = writeBatch(db);
        for (const th of localTherapists) {
          const ref = doc(db, 'therapists', th.id);
          batch.set(ref, sanitizeForFirestore(th));
        }
        await batch.commit();
      }
    } else {
      // Cloud has therapists: merge them into local storage
      const cloudTherapists: Therapist[] = [];
      therapistsSnap.forEach(snap => {
        cloudTherapists.push(snap.data() as Therapist);
      });
      const localTherapists = getLocalTherapists();
      
      // Union by ID (cloud authoritative, plus any local-only pending items)
      const mergedMap = new Map<string, Therapist>();
      for (const th of localTherapists) {
        mergedMap.set(th.id, th);
      }
      for (const th of cloudTherapists) {
        mergedMap.set(th.id, th);
      }
      const mergedList = Array.from(mergedMap.values());
      saveLocalTherapists(mergedList);
    }

    // Real-time listener for Therapists
    unsubTherapists = onSnapshot(therapistsCol, (snapshot) => {
      if (!snapshot.empty) {
        const cloudTherapists: Therapist[] = [];
        snapshot.forEach(snap => {
          cloudTherapists.push(snap.data() as Therapist);
        });
        saveLocalTherapists(cloudTherapists);
      }
    }, (err) => {
      console.warn('[CloudSync] Therapists listener warning:', err);
    });

    // 2. CASES SYNC
    const casesCol = collection(db, 'cases');
    const casesSnap = await getDocs(casesCol);

    if (casesSnap.empty) {
      // First-time seed: push existing local cases to Firestore
      const localCases = getLocalCases();
      if (localCases.length > 0) {
        console.log(`[CloudSync] Initial seed: uploading ${localCases.length} patient cases to Firestore...`);
        const batch = writeBatch(db);
        for (const c of localCases) {
          const ref = doc(db, 'cases', c.id);
          batch.set(ref, sanitizeForFirestore(c));
        }
        await batch.commit();
      }
    } else {
      // Cloud has cases: merge them into local storage
      const cloudCases: PatientCase[] = [];
      casesSnap.forEach(snap => {
        cloudCases.push(snap.data() as PatientCase);
      });
      const localCases = getLocalCases();

      const mergedMap = new Map<string, PatientCase>();
      for (const c of localCases) {
        mergedMap.set(c.id, c);
      }
      for (const c of cloudCases) {
        mergedMap.set(c.id, c);
      }
      const mergedList = Array.from(mergedMap.values());
      saveLocalCases(mergedList);
    }

    // Real-time listener for Cases
    unsubCases = onSnapshot(casesCol, (snapshot) => {
      if (!snapshot.empty) {
        const cloudCases: PatientCase[] = [];
        snapshot.forEach(snap => {
          cloudCases.push(snap.data() as PatientCase);
        });
        saveLocalCases(cloudCases);
      }
    }, (err) => {
      console.warn('[CloudSync] Cases listener warning:', err);
    });

    // 3. PACKAGES SYNC (optional)
    if (getLocalPackages && saveLocalPackages) {
      try {
        const packagesCol = collection(db, 'packages');
        const pkgSnap = await getDocs(packagesCol);
        if (pkgSnap.empty) {
          const localPkgs = getLocalPackages();
          if (localPkgs.length > 0) {
            const batch = writeBatch(db);
            for (const p of localPkgs) {
              const ref = doc(db, 'packages', p.id);
              batch.set(ref, sanitizeForFirestore(p));
            }
            await batch.commit();
          }
        } else {
          const cloudPkgs: PackagePlan[] = [];
          pkgSnap.forEach(snap => cloudPkgs.push(snap.data() as PackagePlan));
          saveLocalPackages(cloudPkgs);
        }
      } catch (pkgErr) {
        console.warn('[CloudSync] Package sync skipped:', pkgErr);
      }
    }

    setSyncStatus('synced');
    console.log('[CloudSync] Firestore cloud database synchronized successfully.');
  } catch (error) {
    console.error('[CloudSync] Error during cloud synchronization:', error);
    setSyncStatus('error');
  }
}

/**
 * Save a single therapist directly to Firestore in the background.
 */
export async function cloudSaveTherapist(therapist: Therapist): Promise<void> {
  const db = getDb();
  if (!db || !therapist?.id) return;
  try {
    const ref = doc(db, 'therapists', therapist.id);
    await setDoc(ref, sanitizeForFirestore(therapist), { merge: true });
  } catch (err) {
    console.warn(`[CloudSync] Failed to save therapist ${therapist.id} to Firestore:`, err);
  }
}

/**
 * Delete a therapist from Firestore.
 */
export async function cloudDeleteTherapist(therapistId: string): Promise<void> {
  const db = getDb();
  if (!db || !therapistId) return;
  try {
    const ref = doc(db, 'therapists', therapistId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn(`[CloudSync] Failed to delete therapist ${therapistId} from Firestore:`, err);
  }
}

/**
 * Save a patient case directly to Firestore in the background.
 */
export async function cloudSaveCase(patientCase: PatientCase): Promise<void> {
  const db = getDb();
  if (!db || !patientCase?.id) return;
  try {
    const ref = doc(db, 'cases', patientCase.id);
    await setDoc(ref, sanitizeForFirestore(patientCase), { merge: true });
  } catch (err) {
    console.warn(`[CloudSync] Failed to save case ${patientCase.id} to Firestore:`, err);
  }
}

/**
 * Delete a patient case from Firestore.
 */
export async function cloudDeleteCase(caseId: string): Promise<void> {
  const db = getDb();
  if (!db || !caseId) return;
  try {
    const ref = doc(db, 'cases', caseId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn(`[CloudSync] Failed to delete case ${caseId} from Firestore:`, err);
  }
}

/**
 * Delete multiple patient cases from Firestore.
 */
export async function cloudDeleteCases(caseIds: string[]): Promise<void> {
  const db = getDb();
  if (!db || caseIds.length === 0) return;
  try {
    const batch = writeBatch(db);
    for (const id of caseIds) {
      batch.delete(doc(db, 'cases', id));
    }
    await batch.commit();
  } catch (err) {
    console.warn('[CloudSync] Failed to batch delete cases from Firestore:', err);
  }
}

/**
 * Save Stripe billing balance to Firestore.
 */
export async function cloudSaveTherapistBalance(therapistId: string, balanceData: any): Promise<void> {
  const db = getDb();
  if (!db || !therapistId) return;
  try {
    const ref = doc(db, 'therapist_balances', therapistId);
    await setDoc(ref, sanitizeForFirestore(balanceData), { merge: true });
  } catch (err) {
    console.warn(`[CloudSync] Failed to save balance for ${therapistId}:`, err);
  }
}

/**
 * Save Stripe payment log to Firestore.
 */
export async function cloudSavePaymentLog(paymentLog: any): Promise<void> {
  const db = getDb();
  if (!db || !paymentLog?.id) return;
  try {
    const ref = doc(db, 'billing_payments', paymentLog.id);
    await setDoc(ref, sanitizeForFirestore(paymentLog), { merge: true });
  } catch (err) {
    console.warn(`[CloudSync] Failed to save payment log ${paymentLog.id}:`, err);
  }
}

/**
 * Save a single package plan directly to Firestore in the background.
 */
export async function cloudSavePackagePlan(plan: PackagePlan): Promise<void> {
  const db = getDb();
  if (!db || !plan?.id) return;
  try {
    const ref = doc(db, 'packages', plan.id);
    await setDoc(ref, sanitizeForFirestore(plan), { merge: true });
  } catch (err) {
    console.warn(`[CloudSync] Failed to save package plan ${plan.id} to Firestore:`, err);
  }
}

/**
 * Delete a package plan from Firestore.
 */
export async function cloudDeletePackagePlan(planId: string): Promise<void> {
  const db = getDb();
  if (!db || !planId) return;
  try {
    const ref = doc(db, 'packages', planId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn(`[CloudSync] Failed to delete package plan ${planId} from Firestore:`, err);
  }
}
