import { describe, it } from 'node:test';
import assert from 'node:assert';
import nodemailer from 'nodemailer';

describe('Zahlungs- & E-Mail-Tests (Testmodus & Simulation)', () => {
  const BASE_URL = 'http://localhost:3000';

  it('1. Stripe Testmodus: Konfigurationsabfrage liefert Test-Modus und Webhook-URL', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/stripe/config`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.mode, 'test');
    assert.ok(data.webhookUrl.includes('/api/billing/webhook'));
  });

  it('2. Stripe Testmodus: Simulation einer Guthaben-Aufladung (Transaktions-Gutschrift)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/billing/simulate-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        therapistId: 'th_automated_test_therapist_99',
        type: 'manual_reload',
        amountEur: 50.0,
        note: 'Automatisierter Stripe-Test: Einzahlung 50 EUR'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.status, 'succeeded');
    assert.strictEqual(data.amountEur, 50.0);
  });

  it('3. Stripe Testmodus: Guthaben und Transaktionsprotokoll des Therapeuten abrufen', async () => {
    const res = await fetch(`${BASE_URL}/api/therapist/billing/th_automated_test_therapist_99`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.therapistId, 'th_automated_test_therapist_99');
    assert.ok(data.balanceEur >= 50.0);
    assert.ok(Array.isArray(data.recentPayments));
    assert.ok(data.recentPayments.length >= 1);
    assert.strictEqual(data.recentPayments[0].status, 'succeeded');
  });

  it('4. Stripe Testmodus: Validierung ohne konfigurierten Secret Key liefert sauberen Fehler 400', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/stripe/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes('Kein Stripe Secret Key'));
  });

  it('5. E-Mail-Test: Versand an simulierte Test-Mailbox (Ethereal SMTP) mit Empfangsbestätigung', async () => {
    const testAccount = await nodemailer.createTestAccount();
    assert.ok(testAccount.user, 'Ethereal Test-Account muss erzeugt werden');

    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: '"HomeoPilot 360" <noreply@homeopilot360.com>',
      to: 'patient-test@homeopilot360.local',
      subject: 'Prüfbericht: Automatisierte SMTP-Simulation',
      text: 'Erfolgreich zugestellte Test-Nachricht.',
      html: '<p>Erfolgreich zugestellte Test-Nachricht.</p>'
    });

    assert.ok(info.messageId, 'Message-ID muss vergeben sein');
    assert.ok(info.accepted.includes('patient-test@homeopilot360.local'), 'Empfänger muss akzeptiert sein');
    const previewUrl = nodemailer.getTestMessageUrl(info);
    assert.ok(typeof previewUrl === 'string' && previewUrl.startsWith('https://'), 'Vorschau-URL muss generiert werden');
  });
});
