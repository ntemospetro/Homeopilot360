import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Tatsächlicher serverseitiger Zahlungs- & Guthabenablauf', () => {
  const BASE_URL = 'http://localhost:3000';
  const therapistId = 'th_audit_server_flow_' + Date.now();
  const sessionId = 'cs_test_webhook_' + Date.now();

  it('1. Initialen Saldo des Therapeuten abfragen', async () => {
    const res = await fetch(`${BASE_URL}/api/therapist/billing/${therapistId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.therapistId, therapistId);
    assert.strictEqual(typeof data.balanceEur, 'number');
  });

  it('2. Tatsächlicher Stripe Webhook-Aufruf: Gutschrift von 50.00 € wird autorisiert verbucht', async () => {
    // Vorheriger Kontostand
    const beforeRes = await fetch(`${BASE_URL}/api/therapist/billing/${therapistId}`);
    const beforeData = await beforeRes.json();
    const balanceBefore = beforeData.balanceEur;

    // Webhook Payload wie von Stripe gesendet
    const webhookPayload = {
      id: 'evt_test_' + Date.now(),
      type: 'checkout.session.completed',
      data: {
        object: {
          id: sessionId,
          client_reference_id: therapistId,
          amount_total: 5000, // 50.00 EUR in Cents
          customer_email: 'therapist@praxis-test.de',
          metadata: {
            therapistId: therapistId,
            therapistName: 'Dr. Test Audit',
            amountEur: '50.00',
            type: 'manual_reload'
          }
        }
      }
    };

    const webhookRes = await fetch(`${BASE_URL}/api/billing/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-simulation': 'true' // Autorisierter Simulations-Header
      },
      body: JSON.stringify(webhookPayload)
    });

    assert.strictEqual(webhookRes.status, 200);
    const webhookResult = await webhookRes.json();
    assert.strictEqual(webhookResult.received, true);

    // Nachprüfen, ob Saldo um exakt 50.00 € gestiegen ist
    const afterRes = await fetch(`${BASE_URL}/api/therapist/billing/${therapistId}`);
    const afterData = await afterRes.json();
    const expectedBalance = Math.round((balanceBefore + 50.00) * 100) / 100;
    assert.strictEqual(afterData.balanceEur, expectedBalance, `Saldo muss um exakt 50 € steigen (von ${balanceBefore} auf ${expectedBalance})`);

    // Beleg in recentPayments prüfen
    const recent = afterData.recentPayments;
    assert.ok(recent.length > 0);
    const creditedPayment = recent.find((p: any) => p.stripeSessionId === sessionId);
    assert.ok(creditedPayment, 'Zahlungsbeleg mit passender Session-ID muss hinterlegt sein');
    assert.strictEqual(creditedPayment.amountEur, 50.00);
    assert.strictEqual(creditedPayment.status, 'succeeded');
  });

  it('3. Schutz gegen doppelte Gutschriften (Idempotenz-Test bei identischem Webhook-Replay)', async () => {
    // Aktueller Kontostand vor dem Replay
    const currentRes = await fetch(`${BASE_URL}/api/therapist/billing/${therapistId}`);
    const currentData = await currentRes.json();
    const balanceBeforeReplay = currentData.balanceEur;

    // Genau derselbe Webhook-Aufruf mit derselben sessionId trifft erneut ein (z. B. Retry von Stripe)
    const duplicatePayload = {
      id: 'evt_test_retry_' + Date.now(),
      type: 'checkout.session.completed',
      data: {
        object: {
          id: sessionId, // Identische Session-ID!
          client_reference_id: therapistId,
          amount_total: 5000,
          customer_email: 'therapist@praxis-test.de',
          metadata: {
            therapistId: therapistId,
            amountEur: '50.00',
            type: 'manual_reload'
          }
        }
      }
    };

    const retryRes = await fetch(`${BASE_URL}/api/billing/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-simulation': 'true'
      },
      body: JSON.stringify(duplicatePayload)
    });

    assert.strictEqual(retryRes.status, 200);

    // Saldo nach Replay prüfen: Darf sich NICHT erneut erhöht haben!
    const afterReplayRes = await fetch(`${BASE_URL}/api/therapist/billing/${therapistId}`);
    const afterReplayData = await afterReplayRes.json();
    assert.strictEqual(
      afterReplayData.balanceEur,
      balanceBeforeReplay,
      `Schutz gegen Doppelgutschrift aktiv: Saldo muss unverändert bei ${balanceBeforeReplay} € bleiben!`
    );
  });

  it('4. Schutz vor unberechtigter Session-Verifikation (Sandbox-Sperre für normale Clients)', async () => {
    // Normaler Client versucht ohne Admin-Berechtigung eine Fake-Session zu verifizieren
    const res = await fetch(`${BASE_URL}/api/billing/verify-session?session_id=cs_sandbox_fake_attack&therapistId=${therapistId}`);
    assert.strictEqual(res.status, 403, 'Muss mit 403 Forbidden abgewiesen werden');
    const data = await res.json();
    assert.strictEqual(data.error, 'sandbox_disabled_for_clients');
  });
});
