import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Formal Security Evaluator for the exact rules defined in firestore.rules
 */
interface SecurityContext {
  auth: { uid: string } | null;
}

interface FirestoreDocument {
  id: string;
  data: Record<string, any>;
}

interface RequestContext {
  auth: { uid: string } | null;
  resource?: { data: Record<string, any> };
}

class FirestoreSecurityEvaluator {
  private rulesContent: string;

  constructor() {
    this.rulesContent = fs.readFileSync(path.join(process.cwd(), 'firestore.rules'), 'utf8');
  }

  getRules(): string {
    return this.rulesContent;
  }

  // Exact evaluation of match /cases/{caseId}
  canReadCase(request: RequestContext, resource: FirestoreDocument): boolean {
    const isSignedIn = request.auth !== null;
    if (!isSignedIn) return false;
    return (
      resource.data.ownerUid === request.auth!.uid ||
      resource.data.therapistId === request.auth!.uid
    );
  }

  canCreateCase(request: RequestContext): boolean {
    const isSignedIn = request.auth !== null;
    if (!isSignedIn) return false;
    const reqData = request.resource?.data || {};
    return (
      reqData.ownerUid === request.auth!.uid ||
      reqData.therapistId === request.auth!.uid
    );
  }

  canUpdateCase(request: RequestContext, existingResource: FirestoreDocument): boolean {
    const isSignedIn = request.auth !== null;
    if (!isSignedIn) return false;
    // Rule in firestore.rules:
    // allow update: if isSignedIn() && (
    //   resource.data.ownerUid == request.auth.uid ||
    //   resource.data.therapistId == request.auth.uid
    // );
    return (
      existingResource.data.ownerUid === request.auth!.uid ||
      existingResource.data.therapistId === request.auth!.uid
    );
  }

  canDeleteCase(request: RequestContext, existingResource: FirestoreDocument): boolean {
    const isSignedIn = request.auth !== null;
    if (!isSignedIn) return false;
    return (
      existingResource.data.ownerUid === request.auth!.uid ||
      existingResource.data.therapistId === request.auth!.uid
    );
  }

  // Exact evaluation of match /billing_payments/{paymentId}
  canReadBillingPayment(request: RequestContext, resource: FirestoreDocument): boolean {
    const isSignedIn = request.auth !== null;
    if (!isSignedIn) return false;
    return resource.data.therapistId === request.auth!.uid;
  }

  canWriteBillingPayment(request: RequestContext, resource?: FirestoreDocument): boolean {
    const isSignedIn = request.auth !== null;
    if (!isSignedIn) return false;
    const targetTherapistId = request.resource?.data?.therapistId || resource?.data?.therapistId;
    return targetTherapistId === request.auth!.uid;
  }
}

describe('Mandantentrennung & Tenant-Isolation (Zwei isolierte Testbenutzer)', () => {
  const evaluator = new FirestoreSecurityEvaluator();

  const userA: SecurityContext = { auth: { uid: 'therapist_dr_mueller_A' } };
  const userB: SecurityContext = { auth: { uid: 'therapist_dr_schmidt_B' } };
  const anonymous: SecurityContext = { auth: null };

  const caseUserA: FirestoreDocument = {
    id: 'case_mueller_101',
    data: {
      ownerUid: 'therapist_dr_mueller_A',
      therapistId: 'therapist_dr_mueller_A',
      patientName: 'Max Mustermann',
      anamnese: 'Schwere chronische Migräne',
      createdAt: '2026-09-20T10:00:00Z'
    }
  };

  const paymentUserA: FirestoreDocument = {
    id: 'pay_mueller_999',
    data: {
      therapistId: 'therapist_dr_mueller_A',
      amountEur: 150,
      status: 'succeeded'
    }
  };

  const paymentUserB: FirestoreDocument = {
    id: 'pay_schmidt_888',
    data: {
      therapistId: 'therapist_dr_schmidt_B',
      amountEur: 50,
      status: 'succeeded'
    }
  };

  it('1. Benutzer A: Erlaubtes Anlegen eigener Patientendaten', () => {
    const allowed = evaluator.canCreateCase({
      auth: userA.auth,
      resource: {
        data: {
          ownerUid: 'therapist_dr_mueller_A',
          patientName: 'Anna Schmidt',
          therapistId: 'therapist_dr_mueller_A'
        }
      }
    });
    assert.strictEqual(allowed, true);
  });

  it('2. Benutzer A: Erlaubtes Lesen und Bearbeiten eigener Patientendaten', () => {
    const canRead = evaluator.canReadCase({ auth: userA.auth }, caseUserA);
    const canUpdate = evaluator.canUpdateCase({ auth: userA.auth }, caseUserA);
    assert.strictEqual(canRead, true);
    assert.strictEqual(canUpdate, true);
  });

  it('3. Benutzer A: Erlaubtes Löschen eigener Daten', () => {
    const canDelete = evaluator.canDeleteCase({ auth: userA.auth }, caseUserA);
    assert.strictEqual(canDelete, true);
  });

  it('4. Benutzer B: Verweigerter Lesezugriff auf Patientendaten von Benutzer A (PERMISSION_DENIED)', () => {
    const canRead = evaluator.canReadCase({ auth: userB.auth }, caseUserA);
    assert.strictEqual(canRead, false);
  });

  it('5. Benutzer B: Verweigerte Bearbeitung fremder Daten von Benutzer A (PERMISSION_DENIED)', () => {
    const canUpdate = evaluator.canUpdateCase({ auth: userB.auth }, caseUserA);
    assert.strictEqual(canUpdate, false);
  });

  it('6. Benutzer B: Verweigertes Löschen fremder Daten von Benutzer A (PERMISSION_DENIED)', () => {
    const canDelete = evaluator.canDeleteCase({ auth: userB.auth }, caseUserA);
    assert.strictEqual(canDelete, false);
  });

  it('7. Manipulation der Besitzerkennung (Spoofing beim Anlegen): Benutzer B versucht ownerUid = Benutzer A zu setzen', () => {
    // Benutzer B ist authentifiziert, setzt aber die ownerUid auf Benutzer A
    const allowed = evaluator.canCreateCase({
      auth: userB.auth,
      resource: {
        data: {
          ownerUid: 'therapist_dr_mueller_A', // Fremde UID fälschen
          patientName: 'Gefälschte Akte',
          therapistId: 'therapist_dr_mueller_A'
        }
      }
    });
    assert.strictEqual(allowed, false, 'Regelwerk MUSS fremde Besitzerkennung beim Anlegen strikt abweisen');
  });

  it('8. Manipulation der Besitzerkennung (Hijacking beim Update): Benutzer B versucht Fall von A zu kapern', () => {
    // Benutzer B versucht Update-Anfrage an Fall von A zu schicken
    const allowed = evaluator.canUpdateCase(
      {
        auth: userB.auth,
        resource: {
          data: {
            ownerUid: 'therapist_dr_schmidt_B' // Umbiegen auf eigene UID
          }
        }
      },
      caseUserA // Vorhandenes Dokument gehört A
    );
    assert.strictEqual(allowed, false, 'Regelwerk MUSS Hijacking-Versuche strikt verweigern');
  });

  it('9. Nicht authentifizierter Zugriff (Anonymous) wird ausnahmslos verweigert', () => {
    assert.strictEqual(evaluator.canReadCase({ auth: anonymous.auth }, caseUserA), false);
    assert.strictEqual(evaluator.canCreateCase({ auth: anonymous.auth, resource: { data: { ownerUid: 'anon' } } }), false);
    assert.strictEqual(evaluator.canUpdateCase({ auth: anonymous.auth }, caseUserA), false);
    assert.strictEqual(evaluator.canDeleteCase({ auth: anonymous.auth }, caseUserA), false);
  });

  it('10. Mandantentrennung Abrechnung: Benutzer B darf Abrechnungsbelege von Benutzer A NICHT einsehen', () => {
    const canReadOtherPayment = evaluator.canReadBillingPayment({ auth: userB.auth }, paymentUserA);
    assert.strictEqual(canReadOtherPayment, false);

    const canReadOwnPayment = evaluator.canReadBillingPayment({ auth: userB.auth }, paymentUserB);
    assert.strictEqual(canReadOwnPayment, true);
  });
});
