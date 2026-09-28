import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirebaseAuth } from './firebaseConfig';
import { Therapist } from '../types';
import { getTherapists, updateTherapist, setActiveTherapistId } from './storage';

/**
 * Service to handle secure Firebase Authentication for Therapists
 * seamlessly with Just-In-Time (JIT) provisioning.
 */
export class FirebaseAuthService {
  private static currentUser: User | null = null;
  private static listeners: Array<(user: User | null) => void> = [];

  static init() {
    const auth = getFirebaseAuth();
    if (!auth) return;

    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.listeners.forEach(fn => fn(user));
    });
  }

  static getCurrentUser(): User | null {
    const auth = getFirebaseAuth();
    return auth?.currentUser || this.currentUser;
  }

  static subscribe(fn: (user: User | null) => void): () => void {
    this.listeners.push(fn);
    fn(this.getCurrentUser());
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  /**
   * JIT (Just-In-Time) Authentication for Therapist:
   * 1. Attempts sign-in to Firebase Auth.
   * 2. If user not found in Firebase Auth, creates the account in Firebase Auth.
   * 3. Links the generated authUid to the Therapist record.
   */
  static async authenticateTherapist(
    therapist: Therapist, 
    plainPassword: string
  ): Promise<{ success: boolean; authUid?: string; error?: string }> {
    const auth = getFirebaseAuth();
    if (!auth) {
      // Offline / Fallback mode
      return { success: true, authUid: therapist.authUid || therapist.id };
    }

    const email = therapist.email.trim().toLowerCase();
    const password = plainPassword.trim();

    try {
      // Try to sign in first
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
      
      // Update local and cloud record if authUid missing
      if (!therapist.authUid || therapist.authUid !== uid) {
        updateTherapist(therapist.id, { authUid: uid });
      }
      return { success: true, authUid: uid };
    } catch (err: any) {
      // If user does not exist in Firebase Auth yet, provision JIT
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        try {
          const createCred = await createUserWithEmailAndPassword(auth, email, password);
          const uid = createCred.user.uid;
          updateTherapist(therapist.id, { authUid: uid });
          return { success: true, authUid: uid };
        } catch (createErr: any) {
          // If creation fails because email is already in use with another password,
          // return invalid password
          if (createErr?.code === 'auth/email-already-in-use') {
            return { success: false, error: 'invalid_password' };
          }
          console.warn('[FirebaseAuthService] JIT account creation notice:', createErr?.message);
          return { success: true, authUid: therapist.authUid || therapist.id };
        }
      }
      
      if (err?.code === 'auth/wrong-password') {
        return { success: false, error: 'invalid_password' };
      }

      console.warn('[FirebaseAuthService] Auth notice, proceeding in offline-tolerant mode:', err?.message);
      return { success: true, authUid: therapist.authUid || therapist.id };
    }
  }

  /**
   * Register a brand-new Therapist with Firebase Auth
   */
  static async registerTherapist(email: string, plainPassword: string): Promise<string | null> {
    const auth = getFirebaseAuth();
    if (!auth) return null;

    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), plainPassword.trim());
      return res.user.uid;
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        try {
          const loginRes = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), plainPassword.trim());
          return loginRes.user.uid;
        } catch {
          return null;
        }
      }
      console.warn('[FirebaseAuthService] Registration notice:', err?.message);
      return null;
    }
  }

  static async signOut(): Promise<void> {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        console.warn('[FirebaseAuthService] SignOut notice:', e);
      }
    }
  }
}
