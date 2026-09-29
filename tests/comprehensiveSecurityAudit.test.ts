import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

async function runComprehensiveAudit() {
  console.log('========================================================================');
  console.log(' FIRESTORE EMULATOR: UMFASSENDES ABSCHLIESSENDES SICHERHEITS-AUDIT      ');
  console.log('========================================================================\n');

  const rulesContent = fs.readFileSync(path.join(process.cwd(), 'firestore.rules.final'), 'utf8');

  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-final-audit',
    firestore: {
      rules: rulesContent,
      host: '127.0.0.1',
      port: 8085
    }
  });

  const anonDb = testEnv.unauthenticatedContext().firestore();
  const userAContext = testEnv.authenticatedContext('user_A_therapist_mueller', {
    email: 'mueller@praxis-berlin.de',
    email_verified: true
  });
  const userBContext = testEnv.authenticatedContext('user_B_therapist_schmidt', {
    email: 'schmidt@praxis-hamburg.de',
    email_verified: true
  });
  // Angreifer mit unbestätigter Admin-E-Mail
  const unverifiedAttackerContext = testEnv.authenticatedContext('attacker_spoofed_uid', {
    email: 'ntemos.petros@gmail.com',
    email_verified: false // WICHTIG: Nicht verifiziert!
  });
  // Verifizierter Admin
  const verifiedAdminContext = testEnv.authenticatedContext('verified_admin_uid', {
    email: 'ntemos.petros@gmail.com',
    email_verified: true
  });
  // Vertrauenswürdiger Admin via /admins-Dokument
  const trustedDocAdminContext = testEnv.authenticatedContext('trusted_doc_admin_uid', {
    email: 'custom-admin@praxis.de',
    email_verified: true
  });

  const userADb = userAContext.firestore();
  const userBDb = userBContext.firestore();
  const attackerDb = unverifiedAttackerContext.firestore();
  const verifiedAdminDb = verifiedAdminContext.firestore();
  const trustedDocAdminDb = trustedDocAdminContext.firestore();

  // Testdaten über Sicherheits-Bypass (Server-Kontext) initialisieren
  await testEnv.withSecurityRulesDisabled(async (adminContext) => {
    const sDb = adminContext.firestore();

    // Vertrauenswürdige Admin-Zuordnung in /admins/
    await sDb.collection('admins').doc('trusted_doc_admin_uid').set({
      role: 'superadmin',
      grantedAt: new Date().toISOString()
    });

    // Privates Therapeutenprofil für A (inkl. sensibler Daten)
    await sDb.collection('therapists').doc('user_A_therapist_mueller').set({
      id: 'user_A_therapist_mueller',
      authUid: 'user_A_therapist_mueller',
      vorname: 'Katharina',
      nachname: 'Müller',
      telefon: '+49 30 12345678',
      adresse: 'Kurfürstendamm 100, 10707 Berlin',
      email: 'mueller@praxis-berlin.de',
      tarifPrice: 89.00
    });

    // Öffentliches Verzeichnis-Profil für A
    await sDb.collection('public_therapists').doc('user_A_therapist_mueller').set({
      id: 'user_A_therapist_mueller',
      displayName: 'Praxis Dr. Müller',
      specialty: 'Klassische Homöopathie'
    });

    // Pakete
    await sDb.collection('packages').doc('pkg_standard').set({
      id: 'pkg_standard',
      name: 'Standard-Paket',
      priceEur: 49.00
    });

    // Zahlungsbeleg für A
    await sDb.collection('billing_payments').doc('server_pay_9001').set({
      id: 'server_pay_9001',
      therapistId: 'user_A_therapist_mueller',
      amountEur: 75.00,
      status: 'succeeded'
    });

    // Guthaben für A
    await sDb.collection('therapist_balances').doc('user_A_therapist_mueller').set({
      therapistId: 'user_A_therapist_mueller',
      balanceEur: 75.00,
      isLowBalance: false
    });
  });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Therapeutenprofile - Private Daten vs. Öffentliches Verzeichnis
    // -------------------------------------------------------------------------
    console.log('[PUNKT 1: THERAPEUTENPROFILE - PRIVATSPHÄRE]');
    console.log('  1.1 Therapeut A liest eigenes privates Profil:');
    await assertSucceeds(userADb.collection('therapists').doc('user_A_therapist_mueller').get());
    console.log('      -> BESTANDEN: Eigener Zugriff erlaubt.');

    console.log('  1.2 Therapeut B versucht privates Profil von A zu lesen:');
    await assertFails(userBDb.collection('therapists').doc('user_A_therapist_mueller').get());
    console.log('      -> BESTANDEN: Fremder Zugriff auf private Daten strikt verwehrt (PERMISSION_DENIED).');

    console.log('  1.3 Admin liest privates Profil von A:');
    await assertSucceeds(verifiedAdminDb.collection('therapists').doc('user_A_therapist_mueller').get());
    console.log('      -> BESTANDEN: Autorisierter Admin hat berechtigten Einblick.');

    console.log('  1.4 Therapeut B liest öffentliches Profil von A in /public_therapists:');
    await assertSucceeds(userBDb.collection('public_therapists').doc('user_A_therapist_mueller').get());
    console.log('      -> BESTANDEN: Öffentliches Verzeichnis für Therapeuten einsehbar.');

    // -------------------------------------------------------------------------
    // TEST 2: Trennung von Update und Delete bei therapists
    // -------------------------------------------------------------------------
    console.log('\n[PUNKT 2: TRENNUNG VON UPDATE UND DELETE BEI THERAPISTS]');
    console.log('  2.1 Therapeut A aktualisiert eigenes Profil (Telefonnummer):');
    await assertSucceeds(userADb.collection('therapists').doc('user_A_therapist_mueller').update({
      telefon: '+49 30 87654321'
    }));
    console.log('      -> BESTANDEN: Profilaktualisierung durch Inhaber erlaubt.');

    console.log('  2.2 Angreifer B versucht Profil von A zu löschen:');
    await assertFails(userBDb.collection('therapists').doc('user_A_therapist_mueller').delete());
    console.log('      -> BESTANDEN: Fremdes Löschen strikt verwehrt (PERMISSION_DENIED).');

    console.log('  2.3 Inhaber A löscht eigenes Profil (ohne request.resource Fehler):');
    await assertSucceeds(userADb.collection('therapists').doc('user_A_therapist_mueller').delete());
    console.log('      -> BESTANDEN: Eigenes Löschen ohne NullPointer-Fehler erfolgreich.');

    // -------------------------------------------------------------------------
    // TEST 3: Admin-Vergabe & Schutz vor unbestätigten E-Mail-Adressen
    // -------------------------------------------------------------------------
    console.log('\n[PUNKT 3: ADMIN-VERGABE & UNBESTÄTIGTE E-MAIL-ADRESSEN]');
    console.log('  3.1 Angreifer mit unbestätigter Admin-E-Mail (email_verified: false) versucht Pakete zu ändern:');
    await assertFails(attackerDb.collection('packages').doc('pkg_standard').update({ priceEur: 1.00 }));
    console.log('      -> BESTANDEN: Unbestätigte E-Mail verleiht KEINE Admin-Rechte (PERMISSION_DENIED).');

    console.log('  3.2 Angreifer versucht unberechtigte Selbstvergabe (Schreiben in /admins/{attackerUid}):');
    await assertFails(attackerDb.collection('admins').doc('attacker_spoofed_uid').set({ role: 'admin' }));
    console.log('      -> BESTANDEN: Selbstvergabe in /admins/ strikt geblockt (PERMISSION_DENIED).');

    console.log('  3.3 Verifizierter Admin (email_verified: true) aktualisiert Paket:');
    await assertSucceeds(verifiedAdminDb.collection('packages').doc('pkg_standard').update({ priceEur: 59.00 }));
    console.log('      -> BESTANDEN: Verifizierter Admin berechtigt.');

    console.log('  3.4 Vertrauenswürdig hinterlegter Admin (via /admins/ Dokument) aktualisiert Paket:');
    await assertSucceeds(trustedDocAdminDb.collection('packages').doc('pkg_standard').update({ priceEur: 69.00 }));
    console.log('      -> BESTANDEN: Vertrauenswürdige Admin-Zuordnung erfolgreich aktiv.');

    // -------------------------------------------------------------------------
    // TEST 4: Finanzdaten & Token-Guthaben (Strikter Serverablauf)
    // -------------------------------------------------------------------------
    console.log('\n[PUNKT 4: ZAHLUNGS- & GUTHABEN-SICHERHEIT]');
    console.log('  4.1 Benutzer A versucht eigenes Token-Guthaben direkt auf 999.999 € zu setzen:');
    await assertFails(userADb.collection('therapist_balances').doc('user_A_therapist_mueller').set({ balanceEur: 999999 }));
    console.log('      -> BESTANDEN: Direktes Client-Schreiben auf Guthaben blockiert (PERMISSION_DENIED).');

    console.log('  4.2 Angreifer B versucht fremden Zahlungsbeleg von A zu kapern:');
    await assertFails(userBDb.collection('billing_payments').doc('server_pay_9001').update({ therapistId: 'user_B_therapist_schmidt' }));
    console.log('      -> BESTANDEN: Besitzübernahme abgewiesen (PERMISSION_DENIED).');

    console.log('  4.3 Benutzer A versucht status von server_pay_9001 zu manipulieren oder zu löschen:');
    await assertFails(userADb.collection('billing_payments').doc('server_pay_9001').update({ amountEur: 10000 }));
    await assertFails(userADb.collection('billing_payments').doc('server_pay_9001').delete());
    console.log('      -> BESTANDEN: Revisionssicher gesperrt (PERMISSION_DENIED).');

    console.log('\n========================================================================');
    console.log(' ERGEBNIS: ALLE SICHERHEITSTESTS IM EMULATOR ERFOLGREICH BESTANDEN!     ');
    console.log('========================================================================\n');
  } finally {
    await testEnv.cleanup();
  }
}

runComprehensiveAudit().catch(err => {
  console.error("Fehler im umfassenden Audit:", err);
  process.exit(1);
});
