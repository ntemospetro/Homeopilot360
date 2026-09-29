import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

async function runEdgeCasesAndServerFlowTests() {
  console.log('========================================================================');
  console.log(' FIRESTORE EMULATOR TEST: EDGE-CASES & SERVER-FLOW AUDIT                ');
  console.log('========================================================================\n');

  const rulesContent = fs.readFileSync(path.join(process.cwd(), 'firestore.rules.final'), 'utf8');

  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-edge-cases-audit',
    firestore: {
      rules: rulesContent,
      host: '127.0.0.1',
      port: 8085
    }
  });

  const anonDb = testEnv.unauthenticatedContext().firestore();
  const userA = testEnv.authenticatedContext('user_A_therapist_mueller');
  const userB = testEnv.authenticatedContext('user_B_therapist_schmidt');
  const admin = testEnv.authenticatedContext('admin_user', {
    email: 'ntemos.petros@gmail.com',
    email_verified: true
  });

  const userADb = userA.firestore();
  const userBDb = userB.firestore();
  const adminDb = admin.firestore();

  // Seed baseline data using admin/server context
  await testEnv.withSecurityRulesDisabled(async (adminContext) => {
    const sDb = adminContext.firestore();

    // 1. Packages
    await sDb.collection('packages').doc('pkg_pro').set({
      id: 'pkg_pro',
      name: 'Praxis Pro',
      priceEur: 89.00
    });

    // 2. Legacy Cases
    // Fall A: Nur ownerUid vorhanden (therapistId fehlt)
    await sDb.collection('cases').doc('case_missing_therapist').set({
      id: 'case_missing_therapist',
      ownerUid: 'user_A_therapist_mueller',
      patientName: 'Patient Ohne TherapistId'
    });

    // Fall B: Nur therapistId vorhanden (ownerUid fehlt / Legacy-Altdaten)
    await sDb.collection('cases').doc('case_legacy_no_owner').set({
      id: 'case_legacy_no_owner',
      therapistId: 'user_A_therapist_mueller',
      patientName: 'Patient Legacy Altdaten'
    });

    // Fall C: Widersprüchliche Felder (ownerUid: user_A, aber therapistId: user_B)
    await sDb.collection('cases').doc('case_conflicting_ids').set({
      id: 'case_conflicting_ids',
      ownerUid: 'user_A_therapist_mueller',
      therapistId: 'user_B_therapist_schmidt',
      patientName: 'Patient Widerspruch'
    });

    // Fall D: Beide Felder fehlen
    await sDb.collection('cases').doc('case_unassigned_corrupt').set({
      id: 'case_unassigned_corrupt',
      patientName: 'Patient Ohne IDs'
    });
  });

  try {
    // -------------------------------------------------------------------------
    // BEREICH 1: packages (Tarife und Pläne)
    // -------------------------------------------------------------------------
    console.log('[GRUPPE 1: PACKAGES]');
    console.log('  1.1 Anonymer Besucher liest Pakete...');
    await assertSucceeds(anonDb.collection('packages').doc('pkg_pro').get());
    console.log('      -> BESTANDEN: Pakete öffentlich einsehbar.');

    console.log('  1.2 Angemeldeter Standardbenutzer versucht Tarifpreis zu ändern...');
    await assertFails(userADb.collection('packages').doc('pkg_pro').update({ priceEur: 1.00 }));
    console.log('      -> BESTANDEN: Unberechtigte Änderung verwehrt (PERMISSION_DENIED).');

    console.log('  1.3 Admin aktualisiert Tarif...');
    await assertSucceeds(adminDb.collection('packages').doc('pkg_pro').update({ priceEur: 99.00 }));
    console.log('      -> BESTANDEN: Admin darf Pakete verwalten.');

    // -------------------------------------------------------------------------
    // BEREICH 2: therapists (Therapeutenprofile)
    // -------------------------------------------------------------------------
    console.log('\n[GRUPPE 2: THERAPISTS]');
    console.log('  2.1 Anonymer Besucher versucht Therapeutenprofile zu lesen (Scraping)...');
    await assertFails(anonDb.collection('therapists').doc('user_A_therapist_mueller').get());
    console.log('      -> BESTANDEN: Anonymes Scraping verwehrt (PERMISSION_DENIED).');

    console.log('  2.2 Anonymer Besucher versucht Therapeutenprofil anzulegen...');
    await assertFails(anonDb.collection('therapists').doc('fake_therapist').set({ name: 'Fake' }));
    console.log('      -> BESTANDEN: Anonymes Anlegen verwehrt (PERMISSION_DENIED).');

    console.log('  2.3 Benutzer A legt sein eigenes Profil an...');
    await assertSucceeds(userADb.collection('therapists').doc('user_A_therapist_mueller').set({
      id: 'user_A_therapist_mueller',
      authUid: 'user_A_therapist_mueller',
      name: 'Dr. Müller'
    }));
    console.log('      -> BESTANDEN: Eigenes Profil anlegen erlaubt.');

    console.log('  2.4 Benutzer B versucht Profil von A zu manipulieren...');
    await assertFails(userBDb.collection('therapists').doc('user_A_therapist_mueller').update({ name: 'Gehackt' }));
    console.log('      -> BESTANDEN: Fremde Profiländerung verwehrt (PERMISSION_DENIED).');

    // -------------------------------------------------------------------------
    // BEREICH 3: cases (Fehlende & widersprüchliche Felder)
    // -------------------------------------------------------------------------
    console.log('\n[GRUPPE 3: CASES - FEHLENDE & WIDERSPRÜCHLICHE FELDER]');
    
    console.log('  3.1 Fall nur mit ownerUid (therapistId fehlt):');
    await assertSucceeds(userADb.collection('cases').doc('case_missing_therapist').get());
    await assertFails(userBDb.collection('cases').doc('case_missing_therapist').get());
    console.log('      -> BESTANDEN: Benutzer A liest erfolgreich; Benutzer B geblockt.');

    console.log('  3.2 Legacy-Fall nur mit therapistId (ownerUid fehlt):');
    await assertSucceeds(userADb.collection('cases').doc('case_legacy_no_owner').get());
    await assertFails(userBDb.collection('cases').doc('case_legacy_no_owner').get());
    console.log('      -> BESTANDEN: Benutzer A liest Altdaten erfolgreich; Benutzer B geblockt.');

    console.log('  3.3 Widersprüchlicher Fall (ownerUid: user_A, therapistId: user_B):');
    await assertSucceeds(userADb.collection('cases').doc('case_conflicting_ids').get());
    await assertFails(userBDb.collection('cases').doc('case_conflicting_ids').get());
    console.log('      -> BESTANDEN: ownerUid ist maßgeblich! Benutzer A darf lesen; Benutzer B wird trotz passender therapistId abgewiesen!');

    console.log('  3.4 Korrupter Fall (weder ownerUid noch therapistId vorhanden):');
    await assertFails(userADb.collection('cases').doc('case_unassigned_corrupt').get());
    await assertFails(userBDb.collection('cases').doc('case_unassigned_corrupt').get());
    console.log('      -> BESTANDEN: Beide Benutzer geblockt (keine offene Hintertür).');

    console.log('  3.5 Migration: Benutzer A migriert Legacy-Fall und trägt sichere ownerUid ein:');
    await assertSucceeds(userADb.collection('cases').doc('case_legacy_no_owner').update({
      ownerUid: 'user_A_therapist_mueller',
      notes: 'Aktualisiert'
    }));
    console.log('      -> BESTANDEN: Berechtigte Nachqualifizierung von Altdaten erlaubt.');

    console.log('  3.6 Angreifer B versucht Legacy-Fall von A zu kapern:');
    await assertFails(userBDb.collection('cases').doc('case_legacy_no_owner').update({
      ownerUid: 'user_B_therapist_schmidt'
    }));
    console.log('      -> BESTANDEN: Übernahme von Altfällen durch Dritte abgewiesen (PERMISSION_DENIED).');

    // -------------------------------------------------------------------------
    // BEREICH 4: Serverseitiger Zahlungs- & Guthabenablauf
    // -------------------------------------------------------------------------
    console.log('\n[GRUPPE 4: REGULÄRER SERVER-ZAHLUNGS- & GUTHABENABLAUF]');
    
    // Server-Kontext führt verifizierten Stripe-Guthaben-Workflow aus
    await testEnv.withSecurityRulesDisabled(async (adminContext) => {
      const sDb = adminContext.firestore();
      // Server schreibt verifizierten Zahlungsbeleg
      await sDb.collection('billing_payments').doc('stripe_pay_live_01').set({
        id: 'stripe_pay_live_01',
        therapistId: 'user_A_therapist_mueller',
        amountEur: 100.00,
        status: 'succeeded',
        stripeSessionId: 'cs_live_real_verified_session',
        createdAt: new Date().toISOString()
      });
      // Server verbucht neues Guthaben
      await sDb.collection('therapist_balances').doc('user_A_therapist_mueller').set({
        therapistId: 'user_A_therapist_mueller',
        balanceEur: 120.00,
        totalDepositedEur: 120.00,
        isLowBalance: false,
        lastDepositAt: new Date().toISOString()
      });
    });

    console.log('  4.1 Benutzer A ruft sein aktualisiertes Guthaben und Beleg ab:');
    const balDoc = await userADb.collection('therapist_balances').doc('user_A_therapist_mueller').get();
    const payDoc = await userADb.collection('billing_payments').doc('stripe_pay_live_01').get();
    console.log(`      -> Guthaben erfolgreich gelesen: ${balDoc.data()?.balanceEur} €`);
    console.log(`      -> Beleg erfolgreich gelesen: ${payDoc.data()?.amountEur} € (${payDoc.data()?.status})`);

    console.log('  4.2 Client versucht direkte unberechtigte Buchung auf Guthaben...');
    await assertFails(userADb.collection('therapist_balances').doc('user_A_therapist_mueller').set({ balanceEur: 5000 }));
    console.log('      -> BESTANDEN: Clientseitige Fälschung blockiert (PERMISSION_DENIED).');

    console.log('  4.3 Angreifer B versucht Beleg von A zu lesen oder zu verändern...');
    await assertFails(userBDb.collection('billing_payments').doc('stripe_pay_live_01').get());
    await assertFails(userBDb.collection('billing_payments').doc('stripe_pay_live_01').update({ therapistId: 'user_B' }));
    console.log('      -> BESTANDEN: Fremder Zugriff und Hijacking strikt abgewiesen (PERMISSION_DENIED).');

    console.log('\n========================================================================');
    console.log(' ERGEBNIS: ALLE 15 AUDIT-TESTS IM EMULATOR ERFOLGREICH BESTANDEN!       ');
    console.log('========================================================================\n');
  } finally {
    await testEnv.cleanup();
  }
}

runEdgeCasesAndServerFlowTests().catch(err => {
  console.error("Fehler im Edge-Case-Test:", err);
  process.exit(1);
});
