import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

async function verifyFixedRules() {
  console.log('========================================================================');
  console.log(' FIRESTORE EMULATOR TEST: VERIFIKATION DER KORRIGIERTEN REGELN          ');
  console.log('========================================================================\n');

  const fixedRulesContent = fs.readFileSync(path.join(process.cwd(), 'firestore.rules.fixed'), 'utf8');

  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-fixed-rules-test',
    firestore: {
      rules: fixedRulesContent,
      host: '127.0.0.1',
      port: 8085
    }
  });

  const userA = testEnv.authenticatedContext('user_A_therapist_mueller');
  const userB = testEnv.authenticatedContext('user_B_therapist_schmidt');
  const userADb = userA.firestore();
  const userBDb = userB.firestore();

  // Test environment as admin/server context to seed verified server records
  await testEnv.withSecurityRulesDisabled(async (adminContext) => {
    const adminDb = adminContext.firestore();
    // 1. Initialer Server-Zahlungsbeleg für A (status: succeeded)
    await adminDb.collection('billing_payments').doc('server_pay_001').set({
      id: 'server_pay_001',
      therapistId: 'user_A_therapist_mueller',
      amountEur: 50.00,
      status: 'succeeded',
      createdAt: new Date().toISOString()
    });

    // 2. Initiales Server-Guthaben für A (50.00 €)
    await adminDb.collection('therapist_balances').doc('user_A_therapist_mueller').set({
      therapistId: 'user_A_therapist_mueller',
      balanceEur: 50.00,
      isLowBalance: false
    });
  });

  try {
    // TEST 1: Lesen eigener Zahlungsbelege durch A
    console.log('[TEST 1] Benutzer A liest eigenen Beleg...');
    await assertSucceeds(userADb.collection('billing_payments').doc('server_pay_001').get());
    console.log('  -> BESTANDEN: Lesen eigener Belege erlaubt.');

    // TEST 2: Lesen fremder Zahlungsbelege durch B
    console.log('[TEST 2] Benutzer B versucht Beleg von A zu lesen...');
    await assertFails(userBDb.collection('billing_payments').doc('server_pay_001').get());
    console.log('  -> BESTANDEN: Lesen fremder Belege verweigert (PERMISSION_DENIED).');

    // TEST 3: Angreifer B versucht Besitzerwechsel (Hijacking) auf Beleg von A
    console.log('[TEST 3] Angreifer B versucht Besitzerwechsel (therapistId: user_B)...');
    await assertFails(userBDb.collection('billing_payments').doc('server_pay_001').update({
      therapistId: 'user_B_therapist_schmidt',
      amountEur: 50000.00
    }));
    console.log('  -> BESTANDEN: Besitzübernahme strikt abgewiesen (PERMISSION_DENIED).');

    // TEST 4: Benutzer A versucht eigenen Beleg-Status oder Betrag zu manipulieren
    console.log('[TEST 4] Benutzer A versucht status oder amountEur nachträglich zu verändern...');
    await assertFails(userADb.collection('billing_payments').doc('server_pay_001').update({
      amountEur: 99999.00
    }));
    console.log('  -> BESTANDEN: Nachträgliche Manipulation durch Benutzer abgewiesen (PERMISSION_DENIED).');

    // TEST 5: Löschen von Belegen durch Benutzer
    console.log('[TEST 5] Benutzer versucht Beleg zu löschen...');
    await assertFails(userADb.collection('billing_payments').doc('server_pay_001').delete());
    console.log('  -> BESTANDEN: Löschen von Zahlungsbelegen verboten (PERMISSION_DENIED).');

    // TEST 6: Client-Manipulation des Token-Guthabens (therapist_balances)
    console.log('[TEST 6] Benutzer A versucht sein Token-Guthaben direkt auf 999.999 € zu setzen...');
    await assertFails(userADb.collection('therapist_balances').doc('user_A_therapist_mueller').set({
      balanceEur: 999999.00
    }));
    console.log('  -> BESTANDEN: Direktes Client-Schreiben auf Guthaben verweigert (PERMISSION_DENIED).');

    // TEST 7: Lesen des eigenen Guthabens
    console.log('[TEST 7] Benutzer A liest eigenes Guthaben...');
    await assertSucceeds(userADb.collection('therapist_balances').doc('user_A_therapist_mueller').get());
    console.log('  -> BESTANDEN: Eigenes Guthaben einsehbar.');

    // TEST 8: Lesen des fremden Guthabens durch B
    console.log('[TEST 8] Benutzer B versucht Guthaben von A zu lesen...');
    await assertFails(userBDb.collection('therapist_balances').doc('user_A_therapist_mueller').get());
    console.log('  -> BESTANDEN: Fremdes Guthaben verborgen (PERMISSION_DENIED).');

    // TEST 9: Fälle (cases) - Besitzwechsel-Schutz bei Update
    console.log('[TEST 9] Fälle: Benutzer A legt Fall an...');
    await assertSucceeds(userADb.collection('cases').doc('case_001').set({
      id: 'case_001',
      ownerUid: 'user_A_therapist_mueller',
      therapistId: 'user_A_therapist_mueller',
      patientName: 'Max Mustermann'
    }));

    console.log('[TEST 10] Fälle: Benutzer A aktualisiert Symptome (Besitz bleibt unverändert)...');
    await assertSucceeds(userADb.collection('cases').doc('case_001').update({
      symptoms: 'Kopfschmerz gebessert'
    }));
    console.log('  -> BESTANDEN: Normales Update durch Eigentümer erlaubt.');

    console.log('[TEST 11] Fälle: Versuchter Besitzerwechsel von ownerUid auf user_B...');
    await assertFails(userADb.collection('cases').doc('case_001').update({
      ownerUid: 'user_B_therapist_schmidt'
    }));
    console.log('  -> BESTANDEN: Besitzerwechsel bei Fällen strikt abgewiesen (PERMISSION_DENIED).');

    console.log('\n========================================================================');
    console.log(' ERGEBNIS: ALLE 11 SICHERHEITSTESTS IM EMULATOR ERFOLGREICH BESTANDEN!   ');
    console.log('========================================================================');
  } finally {
    await testEnv.cleanup();
  }
}

verifyFixedRules().catch(err => {
  console.error("Fehler im Verifikationstest:", err);
  process.exit(1);
});
