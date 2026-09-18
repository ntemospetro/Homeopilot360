import { EmailConfig, LanguageCode } from '../types';
import { getEmailConfig, getTherapists, getAdminCredentials } from './storage';

export interface EmailAttachment {
  filename: string;
  content: string; // base64 string
  contentType?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  displayName?: string;
  config?: EmailConfig;
  attachments?: EmailAttachment[];
}

export interface EmailTestResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Holt die Mailbox-Informationen (resourceId & address) von der Hostinger Mail API
 */
export async function getHostingerMailboxInfo(token: string): Promise<{ orderResourceId: string; mailboxResourceId: string; address: string }> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error('Kein Hostinger Mail API Token angegeben.');
  }

  const response = await fetch('https://api.mail.hostinger.com/api/v1/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${cleanToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hostinger API Fehler (${response.status}): ${errorText || response.statusText}`);
  }

  const json = await response.json();
  const data = json.data;
  if (!data || !data.mailboxes || data.mailboxes.length === 0) {
    throw new Error('Kein Postfach für diesen Hostinger API-Token gefunden.');
  }

  const primaryMailbox = data.mailboxes[0];
  return {
    orderResourceId: data.orderResourceId,
    mailboxResourceId: primaryMailbox.resourceId,
    address: primaryMailbox.address,
  };
}

/**
 * Sendet eine E-Mail direkt über die Hostinger Mail REST API
 */
export async function sendViaHostingerApi(options: SendEmailOptions): Promise<EmailTestResult> {
  const config = options.config || getEmailConfig();
  const token = (config.apiToken || 'ca5694e04833ec07a5a65dbe06af56952c3e1fb04cc66e546b50fc5c84464aaf').trim();
  
  if (!token) {
    throw new Error('Hostinger Mail API Token fehlt. Bitte tragen Sie diesen in den E-Mail-Einstellungen ein.');
  }

  let mailboxId = (config.mailboxId || '').trim();
  if (!mailboxId) {
    const info = await getHostingerMailboxInfo(token);
    mailboxId = info.mailboxResourceId;
  }

  const toList = Array.isArray(options.to) ? options.to : [options.to];
  const payload: any = {
    to: toList,
    displayName: options.displayName || config.fromName || 'HomeoPilot 360',
    subject: options.subject,
    text: options.text || (options.html ? options.html.replace(/<[^>]*>?/gm, '') : ''),
    html: options.html || `<p>${options.text || ''}</p>`,
  };

  if (options.attachments && options.attachments.length > 0) {
    payload.attachments = options.attachments.map(att => ({
      filename: att.filename,
      content: att.content,
      contentType: att.contentType || 'application/pdf',
    }));
  }

  const response = await fetch(`https://api.mail.hostinger.com/api/v1/mailboxes/${mailboxId}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 204 || response.status === 200 || response.status === 201) {
    return {
      success: true,
      message: 'E-Mail wurde erfolgreich über die Hostinger Mail API versendet.',
    };
  }

  const errText = await response.text();
  let errMsg = errText;
  try {
    const parsed = JSON.parse(errText);
    if (parsed.message) errMsg = parsed.message;
  } catch {
    // raw text
  }

  throw new Error(`Hostinger API Fehler (${response.status}): ${errMsg || 'Versand fehlgeschlagen'}`);
}

/**
 * Sendet eine Registrierungs-Bestätigungscode-E-Mail mit rechtlicher Vertragsakzeptanz (AGB)
 * im Nachrichtentext in der vom Nutzer gewählten Sprache (ohne PDF-Anhang, um Spamfilter zu vermeiden).
 */
export async function sendRegistrationVerificationCodeEmail(
  targetEmail: string,
  recipientName: string,
  code: string,
  lang: string = 'de'
): Promise<boolean> {
  const cleanEmail = targetEmail.trim().toLowerCase();
  if (!cleanEmail || !code) return false;

  const validLang = (['de', 'en', 'es', 'fr', 'it', 'el', 'ru'].includes(lang) ? lang : 'de') as LanguageCode;

  const titles: Record<
    LanguageCode,
    {
      subject: string;
      title: string;
      greeting: string;
      msg: string;
      codeLabel: string;
      legalHeader: string;
      legalText: string;
      note: string;
      footer: string;
    }
  > = {
    de: {
      subject: `HomeoPilot 360 - Ihr Bestätigungscode: ${code}`,
      title: 'E-Mail-Bestätigung für Ihre Registrierung',
      greeting: `Guten Tag ${recipientName || 'Therapeut'},`,
      msg: 'vielen Dank für Ihre Registrierung bei HomeoPilot 360. Bitte verwenden Sie den folgenden 6-stelligen Bestätigungscode, um Ihre E-Mail-Adresse zu verifizieren und Ihr Therapeutenkonto zu aktivieren:',
      codeLabel: 'Ihr persönlicher Bestätigungscode',
      legalHeader: 'Rechtlicher Hinweis & Vertragsakzeptanz',
      legalText: 'Mit Ihrer Registrierung und der Eingabe des Bestätigungscodes bestätigen Sie verbindlich, dass Sie die Allgemeinen Geschäftsbedingungen (AGB) und die Nutzungsbedingungen der Plattform HomeoPilot 360 sorgfältig gelesen, verstanden und vollumfänglich akzeptiert haben.',
      note: 'Geben Sie diesen Code in das Registrierungsfenster ein. Der Code ist für Ihre Registrierung gültig. Falls Sie diese Registrierung nicht veranlasst haben, können Sie diese E-Mail ignorieren.',
      footer: 'HomeoPilot 360 • Klinische Homöopathie & Praxismanagement',
    },
    en: {
      subject: `HomeoPilot 360 - Your Confirmation Code: ${code}`,
      title: 'Email Verification for Your Registration',
      greeting: `Hello ${recipientName || 'Therapist'},`,
      msg: 'Thank you for registering with HomeoPilot 360. Please use the following 6-digit confirmation code to verify your email address and activate your therapist account:',
      codeLabel: 'Your Confirmation Code',
      legalHeader: 'Legal Notice & Terms Acceptance',
      legalText: 'By completing your registration and submitting this confirmation code, you expressly confirm that you have carefully read, understood, and fully accepted the General Terms and Conditions (GTC) and Terms of Use of HomeoPilot 360.',
      note: 'Enter this code in the registration popup window. This code is valid for your registration. If you did not request this, please ignore this email.',
      footer: 'HomeoPilot 360 • Clinical Homeopathy & Practice Management',
    },
    es: {
      subject: `HomeoPilot 360 - Su código de confirmación: ${code}`,
      title: 'Verificación de correo electrónico para el registro',
      greeting: `Hola ${recipientName || 'Terapeuta'},`,
      msg: 'Gracias por registrarse en HomeoPilot 360. Utilice el siguiente código de confirmación de 6 dígitos para verificar su correo electrónico y activar su cuenta de terapeuta:',
      codeLabel: 'Su código de confirmación',
      legalHeader: 'Aviso Legal y Aceptación de Términos',
      legalText: 'Al completar su registro e ingresar este código de confirmación, usted confirma expresamente que ha leído detenidamente, comprendido y aceptado en su totalidad los Términos y Condiciones Generales (TyC) y las Condiciones de Uso de la plataforma HomeoPilot 360.',
      note: 'Introduzca este código en la ventana de registro. Si no realizó esta solicitud, puede ignorar este mensaje.',
      footer: 'HomeoPilot 360 • Homeopatía Clínica y Gestión de Consultas',
    },
    fr: {
      subject: `HomeoPilot 360 - Votre code de confirmation : ${code}`,
      title: "Vérification de l'e-mail pour votre inscription",
      greeting: `Bonjour ${recipientName || 'Thérapeute'},`,
      msg: "Merci de vous être inscrit sur HomeoPilot 360. Veuillez utiliser le code de confirmation à 6 chiffres ci-dessous pour valider votre adresse e-mail et activer votre compte praticien :",
      codeLabel: 'Votre code de confirmation',
      legalHeader: 'Mentions légales & Acceptation des conditions',
      legalText: "En finalisant votre inscription et en saisissant ce code de confirmation, vous confirmez expressément avoir lu attentivement, compris et accepté sans réserve les Conditions Générales d'Utilisation et de Vente (CGU) de la plateforme HomeoPilot 360.",
      note: "Saisissez ce code dans la fenêtre d'inscription. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.",
      footer: 'HomeoPilot 360 • Homéopathie Clinique & Gestion de Cabinet',
    },
    it: {
      subject: `HomeoPilot 360 - Il tuo codice di conferma: ${code}`,
      title: 'Verifica email per la registrazione',
      greeting: `Ciao ${recipientName || 'Terapeuta'},`,
      msg: 'Grazie per esserti registrato su HomeoPilot 360. Utilizza il seguente codice di conferma a 6 cifre per verificare la tua email e attivare il tuo account terapeuta:',
      codeLabel: 'Il tuo codice di conferma',
      legalHeader: 'Informativa Legale e Accettazione dei Termini',
      legalText: 'Completando la registrazione e inserendo questo codice di conferma, confermi espressamente di aver letto attentamente, compreso e accettato integralmente le Condizioni Generali di Contratto (CGC) e i Termini di Utilizzo della piattaforma HomeoPilot 360.',
      note: 'Inserisci questo codice nella finestra di registrazione. Se non hai richiesto tu la registrazione, ignora questa email.',
      footer: 'HomeoPilot 360 • Omeopatia Clinica e Gestione dello Studio',
    },
    el: {
      subject: `HomeoPilot 360 - Ο κωδικός επιβεβαίωσής σας: ${code}`,
      title: 'Επαλήθευση Email για την Εγγραφή σας',
      greeting: `Γεια σας ${recipientName || 'Θεραπευτή'},`,
      msg: 'Σας ευχαριστούμε για την εγγραφή σας στο HomeoPilot 360. Χρησιμοποιήστε τον παρακάτω 6ψήφιο κωδικό επιβεβαίωσης για να επαληθεύσετε τη διεύθυνση email σας και να ενεργοποιήσετε τον λογαριασμό θεραπευτή σας:',
      codeLabel: 'Ο κωδικός επιβεβαίωσής σας',
      legalHeader: 'Νομική Ενημέρωση & Αποδοχή Συμβατικών Όρων',
      legalText: 'Με την ολοκλήρωση της εγγραφής σας και την εισαγωγή του κωδικού επιβεβαίωσης, δηλώνετε και επιβεβαιώνετε ρητά ότι έχετε διαβάσει προσεκτικά, κατανοήσει και αποδεχτεί πλήρως τους Γενικούς Όρους Συναλλαγών (ΓΟΣ) και τους Όρους Χρήσης της πλατφόρμας HomeoPilot 360.',
      note: 'Εισαγάγετε αυτόν τον κωδικό στο παράθυρο εγγραφής. Εάν δεν κάνατε εσείς αυτό το αίτημα, παρακαλούμε αγνοήστε αυτό το μήνυμα.',
      footer: 'HomeoPilot 360 • Κλινική Ομοιοπαθητική & Διαχείριση Ιατρείου',
    },
    ru: {
      subject: `HomeoPilot 360 - Ваш код подтверждения: ${code}`,
      title: 'Подтверждение Email для регистрации',
      greeting: `Здравствуйте, ${recipientName || 'Терапевт'},`,
      msg: 'Благодарим вас за регистрацию в системе HomeoPilot 360. Пожалуйста, используйте следующий 6-значный код подтверждения для верификации адреса электронной почты и активации учетной записи:',
      codeLabel: 'Ваш код подтверждения',
      legalHeader: 'Юридическое уведомление и принятие условий',
      legalText: 'Завершая регистрацию и вводя данный код подтверждения, вы прямо подтверждаете, что внимательно прочитали, поняли и в полном объеме безоговорочно принимаете Общие условия сделок (ОУС) и Правила пользования платформой HomeoPilot 360.',
      note: 'Введите этот код в окне регистрации. Если вы не запрашивали регистрацию, проигнорируйте это письмо.',
      footer: 'HomeoPilot 360 • Клиническая Гомеопатия и Управление Практикой',
    },
  };

  const textDict = titles[validLang] || titles.de;

  const htmlBody = `
<!DOCTYPE html>
<html lang="${validLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${textDict.title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #0f766e 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
      <div style="font-size: 34px; line-height: 1; margin-bottom: 10px;">🛡️</div>
      <h1 style="font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.5px; color: #ffffff;">HomeoPilot 360</h1>
      <p style="font-size: 13px; color: #99f6e4; margin: 6px 0 0 0; font-weight: 500;">${textDict.title}</p>
    </div>

    <!-- Content Body -->
    <div style="padding: 32px 28px;">
      <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">${textDict.greeting}</h2>
      
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
        ${textDict.msg}
      </p>

      <!-- Code Box -->
      <div style="background-color: #f0fdfa; border: 2px solid #0d9488; border-radius: 12px; padding: 24px 20px; text-align: center; margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #0f766e; margin-bottom: 10px;">
          ${textDict.codeLabel}
        </div>
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0f766e; background: #ffffff; padding: 12px 20px; border-radius: 8px; border: 1px solid #99f6e4; display: inline-block;">
          ${code}
        </div>
      </div>

      <!-- Legal Notice & AGB Acceptance Box -->
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #0f766e; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
        <div style="font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 8px;">
          ⚖️ ${textDict.legalHeader}
        </div>
        <p style="font-size: 13px; line-height: 1.6; color: #334155; margin: 0;">
          ${textDict.legalText}
        </p>
      </div>

      <!-- Security Notice -->
      <div style="font-size: 12px; color: #64748b; line-height: 1.5; background: #f8fafc; padding: 14px 16px; border-radius: 8px; border: 1px solid #f1f5f9; margin-bottom: 10px;">
        <strong style="color: #334155;">Hinweis / Notice:</strong> ${textDict.note}
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748b;">${textDict.footer}</p>
      <p style="margin: 0;">Automated Security Notification • HomeoPilot 360</p>
    </div>

  </div>
</body>
</html>
  `;

  const textBody = `${textDict.title}
==================================================

${textDict.greeting}

${textDict.msg}

--------------------------------------------------
${textDict.codeLabel}: ${code}
--------------------------------------------------

${textDict.legalHeader}:
${textDict.legalText}

--------------------------------------------------
${textDict.note}

${textDict.footer}`;

  try {
    const config = getEmailConfig();
    const isApi = config.sendMethod === 'api' || (!config.sendMethod && (config.apiToken || 'ca5694e04833ec07a5a65dbe06af56952c3e1fb04cc66e546b50fc5c84464aaf'));

    if (isApi) {
      await sendViaHostingerApi({
        to: cleanEmail,
        subject: textDict.subject,
        html: htmlBody,
        text: textBody,
        displayName: config.fromName || 'HomeoPilot 360 Security',
        config,
      });
      return true;
    } else {
      // SMTP über Backend-API
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost: config.smtpHost,
          smtpPort: config.smtpPort,
          smtpSecure: config.smtpSecure,
          smtpUser: config.smtpUser,
          smtpPassword: config.smtpPassword,
          fromEmail: config.fromEmail,
          fromName: config.fromName || 'HomeoPilot 360 Security',
          to: cleanEmail,
          subject: textDict.subject,
          html: htmlBody,
          text: textBody,
        }),
      });
      return true;
    }
  } catch {
    try {
      const fallbackConfig = { ...getEmailConfig(), sendMethod: 'api' as const };
      await sendViaHostingerApi({
        to: cleanEmail,
        subject: textDict.subject,
        html: htmlBody,
        text: textBody,
        displayName: fallbackConfig.fromName || 'HomeoPilot 360 Security',
        config: fallbackConfig,
      });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Sendet eine Passwort-Wiederherstellungs-E-Mail auf Englisch
 */
export async function sendPasswordRecoveryEmail(targetEmail: string): Promise<boolean> {
  const cleanEmail = targetEmail.trim().toLowerCase();
  if (!cleanEmail) return false;

  const therapists = getTherapists();
  const foundTherapist = therapists.find(t => t.email.trim().toLowerCase() === cleanEmail);
  const adminCreds = getAdminCredentials();
  const isAdminMatch = adminCreds.email.trim().toLowerCase() === cleanEmail || 
                       (adminCreds.resetEmailDestination && adminCreds.resetEmailDestination.trim().toLowerCase() === cleanEmail);

  if (!foundTherapist && !isAdminMatch) {
    // E-Mail nicht im System vorhanden -> Laut Anforderung wird nichts angezeigt und einfach ignoriert
    return false;
  }

  const recipientName = foundTherapist 
    ? `${foundTherapist.vorname || ''} ${foundTherapist.nachname || ''}`.trim() || 'Therapist' 
    : 'Administrator';
  const accountRole = foundTherapist ? 'Registered Therapist Account' : 'System Administrator';
  const retrievedPassword = foundTherapist ? (foundTherapist.password || 'homoeo2025!') : adminCreds.password;
  const loginEmail = foundTherapist ? foundTherapist.email : adminCreds.email;

  const emailSubject = `HomeoPilot 360 - Account Password Recovery`;
  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Recovery</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.06);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #134e4a 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
      <div style="font-size: 32px; line-height: 1; margin-bottom: 10px;">🔐</div>
      <h1 style="font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.5px; color: #ffffff;">HomeoPilot 360</h1>
      <p style="font-size: 13px; color: #99f6e4; margin: 6px 0 0 0; font-weight: 500;">Account Credentials & Password Recovery</p>
    </div>

    <!-- Content Body -->
    <div style="padding: 32px 28px;">
      <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Hello ${recipientName},</h2>
      
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
        We received a request to retrieve your login credentials for your <strong>HomeoPilot 360</strong> account. Below you will find your registered access details:
      </p>

      <!-- Credentials Box -->
      <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; border-left: 4px solid #0d9488; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0f766e; margin-bottom: 14px;">
          Registered Account Credentials
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 130px;">Account Type:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600; text-align: right;">${accountRole}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Login Email:</td>
            <td style="padding: 6px 0; color: #0d9488; font-family: monospace; font-weight: 700; text-align: right;">${loginEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0 0 0; color: #64748b; font-weight: 600;">Password:</td>
            <td style="padding: 8px 0 0 0; text-align: right;">
              <span style="font-family: monospace; font-size: 14px; font-weight: 700; color: #042f2e; background: #ffffff; padding: 5px 12px; border-radius: 6px; border: 1px solid #99f6e4; display: inline-block;">${retrievedPassword}</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Security Notice -->
      <div style="font-size: 12px; color: #64748b; line-height: 1.5; background: #f8fafc; padding: 14px 16px; border-radius: 8px; border: 1px solid #f1f5f9; margin-bottom: 24px;">
        <strong style="color: #334155;">Security Notice:</strong> Please keep your password safe. If you did not request this recovery email, please log into your account and change your password or notify our support team immediately.
      </div>

      <!-- Button -->
      <div style="text-align: center; margin: 28px 0 10px 0;">
        <a href="https://homeopilot360.com" style="display: inline-block; background-color: #0d9488; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 13px; letter-spacing: 0.2px;">
          Log In to HomeoPilot 360 &rarr;
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748b;">HomeoPilot 360 • Clinical Homeopathy & Practice Management</p>
      <p style="margin: 0;">This is an automated security notice. Please do not reply directly to this email.</p>
    </div>

  </div>
</body>
</html>
  `;

  const textBody = `HomeoPilot 360 - Account Password Recovery\n\nHello ${recipientName},\n\nYour registered account credentials:\nAccount Type: ${accountRole}\nLogin Email: ${loginEmail}\nPassword: ${retrievedPassword}\n\nPlease keep your credentials secure.\n\nHomeoPilot 360 Team`;

  try {
    const config = getEmailConfig();
    const isApi = config.sendMethod === 'api' || (!config.sendMethod && (config.apiToken || 'ca5694e04833ec07a5a65dbe06af56952c3e1fb04cc66e546b50fc5c84464aaf'));

    if (isApi) {
      await sendViaHostingerApi({
        to: cleanEmail,
        subject: emailSubject,
        html: htmlBody,
        text: textBody,
        displayName: config.fromName || 'HomeoPilot 360 Security',
        config,
      });
      return true;
    } else {
      // SMTP fallback
      await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost: config.smtpHost,
          smtpPort: config.smtpPort,
          smtpSecure: config.smtpSecure,
          smtpUser: config.smtpUser,
          smtpPassword: config.smtpPassword,
          fromEmail: config.fromEmail,
          fromName: config.fromName || 'HomeoPilot 360 Security',
          toEmail: cleanEmail,
          subject: emailSubject,
          html: htmlBody,
          text: textBody,
        }),
      });
      return true;
    }
  } catch (err) {
    // API Fallback try
    try {
      const fallbackConfig = { ...getEmailConfig(), sendMethod: 'api' as const };
      await sendViaHostingerApi({
        to: cleanEmail,
        subject: emailSubject,
        html: htmlBody,
        text: textBody,
        displayName: fallbackConfig.fromName || 'HomeoPilot 360 Security',
        config: fallbackConfig,
      });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Testet die Verbindung oder versendet eine Test-Mail
 */
export async function executeEmailTest(params: {
  config: EmailConfig;
  recipientEmail?: string;
  sendEmail: boolean;
}): Promise<EmailTestResult> {
  const { config, recipientEmail, sendEmail } = params;
  const isApi = config.sendMethod === 'api' || (!config.sendMethod && (config.apiToken || 'ca5694e04833ec07a5a65dbe06af56952c3e1fb04cc66e546b50fc5c84464aaf'));

  if (isApi) {
    const token = (config.apiToken || 'ca5694e04833ec07a5a65dbe06af56952c3e1fb04cc66e546b50fc5c84464aaf').trim();
    
    // 1. Mailbox / Token prüfen
    const info = await getHostingerMailboxInfo(token);
    
    if (!sendEmail) {
      return {
        success: true,
        message: `Hostinger Mail API Verbindung erfolgreich! Authentifiziertes Postfach: ${info.address} (Mailbox-ID: ${info.mailboxResourceId})`,
        details: info,
      };
    }

    // 2. Test-E-Mail versenden
    if (!recipientEmail || !recipientEmail.trim()) {
      throw new Error('Bitte geben Sie eine Empfänger-E-Mail-Adresse für den Testversand an.');
    }

    const timestamp = new Date().toLocaleString('de-DE');
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #0f766e; margin: 0;">HomeoPilot 360</h2>
          <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Praxis- & Fallmanagement System</p>
        </div>
        <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #115e59; margin: 0 0 8px 0; font-size: 16px;">E-Mail-Versand erfolgreich eingerichtet!</h3>
          <p style="color: #134e4a; margin: 0; font-size: 14px; line-height: 1.5;">
            Diese Test-Nachricht bestätigt, dass Ihre E-Mail-Konfiguration über die <strong>Hostinger Mail API</strong> voll funktionsfähig ist.
          </p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; width: 140px;">Absender:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${config.fromName || 'HomeoPilot 360'} &lt;${info.address}&gt;</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Empfänger:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${recipientEmail.trim()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Versandart:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">Hostinger Mail API (REST / HTTPS)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Zeitpunkt:</td>
            <td style="padding: 8px 0;">${timestamp}</td>
          </tr>
        </table>
        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">Automatische Test-Nachricht von HomeoPilot 360</p>
        </div>
      </div>
    `;

    const res = await sendViaHostingerApi({
      to: recipientEmail.trim(),
      subject: `HomeoPilot 360 - E-Mail Testnachricht (${timestamp})`,
      html: htmlBody,
      text: `HomeoPilot 360 - E-Mail Testnachricht\n\nIhre E-Mail-Konfiguration über die Hostinger Mail API funktioniert einwandfrei!\nAbsender: ${info.address}\nEmpfänger: ${recipientEmail.trim()}\nZeitpunkt: ${timestamp}`,
      config,
    });

    return {
      success: true,
      message: `Test-E-Mail wurde erfolgreich an ${recipientEmail.trim()} über die Hostinger Mail API gesendet!`,
      details: res,
    };
  }

  // SMTP über Node.js Backend Server
  try {
    const response = await fetch('/api/email/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        smtpSecure: config.smtpSecure,
        smtpUser: config.smtpUser,
        smtpPassword: config.smtpPassword,
        fromEmail: config.fromEmail,
        fromName: config.fromName,
        toEmail: sendEmail ? (recipientEmail || '').trim() : undefined,
      }),
    });

    let data: any = {};
    const responseText = await response.text();
    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        success: false,
        error: response.ok ? 'Unerwartetes Server-Antwortformat.' : `Serverfehler (${response.status})`,
      };
    }

    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message || (sendEmail ? 'Test-E-Mail erfolgreich versendet.' : 'SMTP-Verbindungstest erfolgreich!'),
      };
    }

    throw new Error(data.error || 'SMTP-Verbindung fehlgeschlagen.');
  } catch (err: any) {
    // Wenn SMTP 404 wirft (z.B. bei statischem Hosting), auf Hostinger API hinweisen oder umschalten
    if (config.apiToken || 'ca5694e04833ec07a5a65dbe06af56952c3e1fb04cc66e546b50fc5c84464aaf') {
      try {
        const fallbackConfig = { ...config, sendMethod: 'api' as const };
        return await executeEmailTest({ config: fallbackConfig, recipientEmail, sendEmail });
      } catch (fallbackErr: any) {
        throw new Error(`SMTP fehlgeschlagen (${err.message}). API-Fallback Fehler: ${fallbackErr.message}`);
      }
    }
    throw err;
  }
}

/**
 * Sendet das Sicherheitskennwort an die hinterlegte Administrator-E-Mail (Standard: p.stogian@yahoo.com).
 * Sicherheitsfeature (Silent Protection):
 * Wenn die angegebene E-Mail NICHT der hinterlegten Wiederherstellungs-Adresse entspricht,
 * wird stillschweigend true zurückgegeben (keine Fehlermeldung, kein E-Mail-Versand),
 * damit unbefugte Dritte keine Information über gültige E-Mail-Adressen erhalten.
 */
export async function sendSecurityPinRecoveryEmail(inputEmail: string): Promise<boolean> {
  const cleanEmail = (inputEmail || '').trim().toLowerCase();
  const adminCreds = getAdminCredentials();
  const authorizedEmail = (adminCreds.resetEmailDestination || 'p.stogian@yahoo.com').trim().toLowerCase();

  // Silent protection: wenn falsche E-Mail, simuliere Erfolg ohne Versand
  if (!cleanEmail || cleanEmail !== authorizedEmail) {
    // Künstliche minimale Verzögerung für realistisches UI-Feedback
    await new Promise(res => setTimeout(res, 400));
    return true;
  }

  const pin = adminCreds.securityPin || '360';
  const emailSubject = 'Sicherheitskennwort';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sicherheitskennwort</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.06);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #134e4a 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
      <div style="font-size: 36px; line-height: 1; margin-bottom: 12px;">🛡️</div>
      <h1 style="font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.5px; color: #ffffff;">HomeoPilot 360</h1>
      <p style="font-size: 13px; color: #99f6e4; margin: 6px 0 0 0; font-weight: 500;">Sicherheitsabfrage & Zugriffsschutz</p>
    </div>

    <!-- Content Body -->
    <div style="padding: 32px 28px;">
      <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Sicherheitskennwort angefordert</h2>
      
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
        Sie haben das Sicherheitskennwort für den Login-Zugang von <strong>HomeoPilot 360</strong> angefordert:
      </p>

      <!-- PIN Box -->
      <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; border-left: 4px solid #0d9488; border-radius: 10px; padding: 20px; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #0f766e; margin-bottom: 8px;">
          Ihr aktuelles Sicherheitskennwort
        </div>
        <div style="font-family: monospace; font-size: 28px; font-weight: 800; color: #042f2e; letter-spacing: 4px; background: #ffffff; padding: 10px 24px; border-radius: 8px; border: 1px solid #99f6e4; display: inline-block;">
          ${pin}
        </div>
      </div>

      <!-- Security Notice -->
      <div style="font-size: 12px; color: #64748b; line-height: 1.5; background: #f8fafc; padding: 14px 16px; border-radius: 8px; border: 1px solid #f1f5f9; margin-bottom: 24px;">
        <strong style="color: #334155;">Hinweis:</strong> Geben Sie dieses Sicherheitskennwort in der Vorschalt-Abfrage ein, um zum Administrator-Loginformular zu gelangen. Sie können dieses Sicherheitskennwort jederzeit im Admin-Panel in der Konfiguration ändern.
      </div>

      <div style="text-align: center; margin: 24px 0 10px 0;">
        <a href="https://homeopilot360.com" style="display: inline-block; background-color: #0d9488; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 13px;">
          Zur Anwendung &rarr;
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #64748b;">HomeoPilot 360 • Administrations-Sicherheitsdienst</p>
      <p style="margin: 0;">Dies ist eine automatische Benachrichtigung. Bitte antworten Sie nicht direkt auf diese E-Mail.</p>
    </div>

  </div>
</body>
</html>
  `;

  const textBody = `HomeoPilot 360 - Sicherheitskennwort\n\nSicherheitskennwort: ${pin}\n\nGeben Sie dieses Sicherheitskennwort in der Vorschalt-Abfrage ein, um zum Administrator-Loginformular zu gelangen.\n\nHomeoPilot 360 Team`;

  try {
    const config = getEmailConfig();
    const isApi = config.sendMethod === 'api' || (!config.sendMethod && (config.apiToken || 'ca5694e04833ec07a5a65dbe06af56952c3e1fb04cc66e546b50fc5c84464aaf'));

    if (isApi) {
      await sendViaHostingerApi({
        to: authorizedEmail,
        subject: emailSubject,
        html: htmlBody,
        text: textBody,
        displayName: config.fromName || 'HomeoPilot 360 Security',
        config,
      });
      return true;
    } else {
      // SMTP fallback
      await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost: config.smtpHost,
          smtpPort: config.smtpPort,
          smtpSecure: config.smtpSecure,
          smtpUser: config.smtpUser,
          smtpPassword: config.smtpPassword,
          fromEmail: config.fromEmail,
          fromName: config.fromName || 'HomeoPilot 360 Security',
          toEmail: authorizedEmail,
          subject: emailSubject,
          html: htmlBody,
          text: textBody,
        }),
      });
      return true;
    }
  } catch {
    try {
      const fallbackConfig = { ...getEmailConfig(), sendMethod: 'api' as const };
      await sendViaHostingerApi({
        to: authorizedEmail,
        subject: emailSubject,
        html: htmlBody,
        text: textBody,
        displayName: fallbackConfig.fromName || 'HomeoPilot 360 Security',
        config: fallbackConfig,
      });
      return true;
    } catch {
      // Quiet fail to avoid disclosing delivery state to untrusted callers
      return true;
    }
  }
}

