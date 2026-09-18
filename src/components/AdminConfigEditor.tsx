import React, { useState, useEffect } from 'react';
import { 
  getAdminCredentials, 
  saveAdminCredentials, 
  resetAdminCredentials,
  getSiteConfig,
  saveSiteConfig,
  getEmailConfig,
  saveEmailConfig,
  resetEmailConfig,
  syncAdminCredentialsFromServer,
  syncSiteConfigFromServer,
  syncEmailConfigFromServer,
} from '../services/storage';
import { EmailConfig } from '../types';
import { executeEmailTest } from '../services/emailService';
import { useTranslation } from '../i18n/LanguageContext';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Server,
  Fingerprint,
  ImagePlus,
  Globe,
  Send,
  Sliders,
  Shield,
  Check,
  Zap,
  Radio
} from 'lucide-react';

interface AdminConfigEditorProps {
  onShowToast: (msg: string) => void;
}

export const AdminConfigEditor: React.FC<AdminConfigEditorProps> = ({ onShowToast }) => {
  const { t } = useTranslation();
  const [adminCreds, setAdminCreds] = useState(getAdminCredentials());
  const [siteConfig, setSiteConfig] = useState(getSiteConfig());
  const [emailConfig, setEmailConfigState] = useState<EmailConfig>(getEmailConfig());

  // Admin Credentials State
  const [email, setEmail] = useState(adminCreds.email);
  const [resetEmail, setResetEmail] = useState(adminCreds.resetEmailDestination);
  const [securityPin, setSecurityPin] = useState(adminCreds.securityPin || '360');
  const [showSecurityPin, setShowSecurityPin] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Site Branding State
  const [logoUrl, setLogoUrl] = useState(siteConfig.logoUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(siteConfig.faviconUrl || '');

  // Email / SMTP State
  const [sendMethod, setSendMethod] = useState<'api' | 'smtp'>(emailConfig.sendMethod || 'api');
  const [apiToken, setApiToken] = useState(emailConfig.apiToken || 'ca5694e04833ec07a5a65dbe06af56952c3e1fb04cc66e546b50fc5c84464aaf');
  const [showApiToken, setShowApiToken] = useState(false);
  const [mailboxId, setMailboxId] = useState(emailConfig.mailboxId || 'ACfb7e2a4063af9612b30d0a193ade');

  const [smtpHost, setSmtpHost] = useState(emailConfig.smtpHost);
  const [smtpPort, setSmtpPort] = useState(emailConfig.smtpPort);
  const [smtpSecure, setSmtpSecure] = useState(emailConfig.smtpSecure);
  const [smtpUser, setSmtpUser] = useState(emailConfig.smtpUser);
  const [smtpPassword, setSmtpPassword] = useState(emailConfig.smtpPassword);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [fromEmail, setFromEmail] = useState(emailConfig.fromEmail);
  const [fromName, setFromName] = useState(emailConfig.fromName);

  const [imapHost, setImapHost] = useState(emailConfig.imapHost || 'imap.hostinger.com');
  const [imapPort, setImapPort] = useState(emailConfig.imapPort || 993);
  const [imapSecure, setImapSecure] = useState(emailConfig.imapSecure !== undefined ? emailConfig.imapSecure : true);

  const [popHost, setPopHost] = useState(emailConfig.popHost || 'pop.hostinger.com');
  const [popPort, setPopPort] = useState(emailConfig.popPort || 995);
  const [popSecure, setPopSecure] = useState(emailConfig.popSecure !== undefined ? emailConfig.popSecure : true);

  // Email Testing State
  const [testRecipient, setTestRecipient] = useState(adminCreds.email || 'therapie@homeopilot360.com');
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);
  const [testErrorMessage, setTestErrorMessage] = useState<string | null>(null);

  // General Status Messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState<string | null>(null);
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const syncCreds = () => {
    const creds = getAdminCredentials();
    setAdminCreds(creds);
    setEmail(creds.email);
    setResetEmail(creds.resetEmailDestination);
    setSecurityPin(creds.securityPin || '360');
    
    const config = getSiteConfig();
    setSiteConfig(config);
    setLogoUrl(config.logoUrl || '');
    setFaviconUrl(config.faviconUrl || '');

    const eConfig = getEmailConfig();
    setEmailConfigState(eConfig);
    setSendMethod(eConfig.sendMethod || 'api');
    setApiToken(eConfig.apiToken || 'ca5694e04833ec07a5a65dbe06af56952c3e1fb04cc66e546b50fc5c84464aaf');
    setMailboxId(eConfig.mailboxId || 'ACfb7e2a4063af9612b30d0a193ade');
    setSmtpHost(eConfig.smtpHost);
    setSmtpPort(eConfig.smtpPort);
    setSmtpSecure(eConfig.smtpSecure);
    setSmtpUser(eConfig.smtpUser);
    setSmtpPassword(eConfig.smtpPassword);
    setFromEmail(eConfig.fromEmail);
    setFromName(eConfig.fromName);
    setImapHost(eConfig.imapHost || 'imap.hostinger.com');
    setImapPort(eConfig.imapPort || 993);
    setImapSecure(eConfig.imapSecure !== undefined ? eConfig.imapSecure : true);
    setPopHost(eConfig.popHost || 'pop.hostinger.com');
    setPopPort(eConfig.popPort || 995);
    setPopSecure(eConfig.popSecure !== undefined ? eConfig.popSecure : true);
  };

  useEffect(() => {
    Promise.all([
      syncAdminCredentialsFromServer(),
      syncSiteConfigFromServer(),
      syncEmailConfigFromServer()
    ]).then(() => {
      syncCreds();
    });
    syncCreds();
    window.addEventListener('homoeo_admin_credentials_changed', syncCreds);
    window.addEventListener('homoeo_email_config_changed', syncCreds);
    return () => {
      window.removeEventListener('homoeo_admin_credentials_changed', syncCreds);
      window.removeEventListener('homoeo_email_config_changed', syncCreds);
    };
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Bitte geben Sie eine gültige Administrator-Anmelde-E-Mail an.');
      return;
    }

    const cleanResetEmail = resetEmail.trim();
    if (!cleanResetEmail || !cleanResetEmail.includes('@')) {
      setErrorMessage('Bitte geben Sie eine gültige Wiederherstellungs-E-Mail-Adresse an.');
      return;
    }

    const cleanSecurityPin = securityPin.trim();
    if (!cleanSecurityPin) {
      setErrorMessage('Bitte geben Sie ein gültiges Sicherheitskennwort ein.');
      return;
    }

    if (newPassword.trim()) {
      if (newPassword.length < 6) {
        setErrorMessage('Das neue Passwort muss mindestens 6 Zeichen lang sein.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('Die eingegebenen Passwörter stimmen nicht überein.');
        return;
      }
    }

    setIsSaving(true);
    setTimeout(() => {
      const updates: { email: string; resetEmailDestination: string; securityPin: string; password?: string } = {
        email: cleanEmail,
        resetEmailDestination: cleanResetEmail,
        securityPin: cleanSecurityPin,
      };

      if (newPassword.trim()) {
        updates.password = newPassword;
      }

      const updated = saveAdminCredentials(updates);
      setAdminCreds(updated);
      setNewPassword('');
      setConfirmPassword('');
      setIsSaving(false);
      setSuccessMessage('Administrator-Zugangsdaten wurden erfolgreich aktualisiert.');
      onShowToast('Administrator-Zugangsdaten erfolgreich gespeichert');
      setTimeout(() => setSuccessMessage(null), 4500);
    }, 300);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Möchten Sie die Administrator-Zugangsdaten wirklich auf die System-Standardwerte zurücksetzen?\n\nStandard-E-Mail: p.stogian@yahoo.com\nStandard-Sicherheitskennwort: 360')) {
      const creds = resetAdminCredentials();
      setAdminCreds(creds);
      setEmail(creds.email);
      setResetEmail(creds.resetEmailDestination);
      setSecurityPin(creds.securityPin || '360');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Administrator-Zugangsdaten auf Standard zurückgesetzt.');
      onShowToast('Admin-Zugangsdaten auf Standardwerte zurückgesetzt');
      setTimeout(() => setSuccessMessage(null), 4500);
    }
  };

  const handleSaveSiteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setTimeout(() => {
      const updated = saveSiteConfig({
        logoUrl: logoUrl.trim(),
        faviconUrl: faviconUrl.trim()
      });
      setSiteConfig(updated);
      setIsSavingConfig(false);
      onShowToast('Seiten-Konfiguration erfolgreich gespeichert');
    }, 300);
  };

  // Save Email Config
  const handleSaveEmailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailErrorMessage(null);
    setEmailSuccessMessage(null);

    const cleanSmtpHost = smtpHost.trim();
    const cleanUser = smtpUser.trim();

    if (sendMethod === 'smtp') {
      if (!cleanSmtpHost) {
        setEmailErrorMessage('Bitte geben Sie einen gültigen SMTP-Server (Hostname) an.');
        return;
      }
      if (!smtpPort || smtpPort <= 0) {
        setEmailErrorMessage('Bitte geben Sie einen gültigen Port an (z.B. 465).');
        return;
      }
      if (!cleanUser) {
        setEmailErrorMessage('Bitte geben Sie einen Benutzernamen bzw. eine E-Mail-Adresse an.');
        return;
      }
    } else {
      if (!apiToken.trim()) {
        setEmailErrorMessage('Bitte geben Sie einen gültigen Hostinger Mail API Token ein.');
        return;
      }
    }

    setIsSavingEmail(true);
    setTimeout(() => {
      const updated = saveEmailConfig({
        sendMethod,
        apiToken: apiToken.trim(),
        mailboxId: mailboxId.trim(),
        smtpHost: cleanSmtpHost || 'smtp.hostinger.com',
        smtpPort: Number(smtpPort) || 465,
        smtpSecure: Boolean(smtpSecure),
        smtpUser: cleanUser || 'therapie@homeopilot360.com',
        smtpPassword,
        fromEmail: fromEmail.trim() || cleanUser || 'therapie@homeopilot360.com',
        fromName: fromName.trim() || 'HomeoPilot 360',
        imapHost: imapHost.trim(),
        imapPort: Number(imapPort),
        imapSecure: Boolean(imapSecure),
        popHost: popHost.trim(),
        popPort: Number(popPort),
        popSecure: Boolean(popSecure),
      });

      setEmailConfigState(updated);
      setIsSavingEmail(false);
      setEmailSuccessMessage(t('emailConfigSavedSuccess'));
      onShowToast(t('emailConfigSavedSuccess'));
      setTimeout(() => setEmailSuccessMessage(null), 4500);
    }, 300);
  };

  const handleResetEmailToDefault = () => {
    if (window.confirm('Möchten Sie die E-Mail-Einstellungen wirklich auf die Hostinger-Standardwerte zurücksetzen?')) {
      const defaultConf = resetEmailConfig();
      setEmailConfigState(defaultConf);
      setSendMethod(defaultConf.sendMethod || 'api');
      setApiToken(defaultConf.apiToken || 'ca5694e04833ec07a5a65dbe06af56952c3e1fb04cc66e546b50fc5c84464aaf');
      setMailboxId(defaultConf.mailboxId || 'ACfb7e2a4063af9612b30d0a193ade');
      setSmtpHost(defaultConf.smtpHost);
      setSmtpPort(defaultConf.smtpPort);
      setSmtpSecure(defaultConf.smtpSecure);
      setSmtpUser(defaultConf.smtpUser);
      setSmtpPassword(defaultConf.smtpPassword);
      setFromEmail(defaultConf.fromEmail);
      setFromName(defaultConf.fromName);
      setImapHost(defaultConf.imapHost);
      setImapPort(defaultConf.imapPort);
      setImapSecure(defaultConf.imapSecure);
      setPopHost(defaultConf.popHost);
      setPopPort(defaultConf.popPort);
      setPopSecure(defaultConf.popSecure);
      setEmailSuccessMessage(t('emailConfigResetDefault'));
      onShowToast(t('emailConfigResetDefault'));
      setTimeout(() => setEmailSuccessMessage(null), 4500);
    }
  };

  // Email Testing (Hostinger API direct or SMTP)
  const handleTestSmtpConnection = async (sendEmail: boolean) => {
    setTestSuccessMessage(null);
    setTestErrorMessage(null);

    if (sendEmail) {
      if (!testRecipient || !testRecipient.includes('@')) {
        setTestErrorMessage('Bitte geben Sie eine gültige Empfänger-E-Mail-Adresse für den Testversand an.');
        return;
      }
      setIsSendingTestEmail(true);
    } else {
      setIsTestingSmtp(true);
    }

    try {
      const result = await executeEmailTest({
        config: {
          sendMethod,
          apiToken: apiToken.trim(),
          mailboxId: mailboxId.trim(),
          smtpHost: smtpHost.trim(),
          smtpPort: Number(smtpPort),
          smtpSecure: Boolean(smtpSecure),
          smtpUser: smtpUser.trim(),
          smtpPassword,
          fromEmail: fromEmail.trim() || smtpUser.trim(),
          fromName: fromName.trim() || 'HomeoPilot 360',
          imapHost: imapHost.trim(),
          imapPort: Number(imapPort),
          imapSecure: Boolean(imapSecure),
          popHost: popHost.trim(),
          popPort: Number(popPort),
          popSecure: Boolean(popSecure),
        },
        recipientEmail: testRecipient.trim(),
        sendEmail,
      });

      if (result.success) {
        setTestSuccessMessage(result.message);
        onShowToast(sendEmail ? t('testEmailSentSuccess') : t('connectionTestSuccess'));
      } else {
        setTestErrorMessage(result.message);
      }
    } catch (err: any) {
      setTestErrorMessage(err?.message || 'Verbindung zum Server fehlgeschlagen.');
    } finally {
      setIsTestingSmtp(false);
      setIsSendingTestEmail(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="admin-config-editor">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                System-Konfiguration & Administrator-Zugangsdaten
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verwalten Sie die zentrale Anmelde-E-Mail, das Master-Passwort und E-Mail-Server-Einstellungen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-teal-950 text-teal-300 border border-teal-800 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Master-Account aktiv</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Credentials & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-teal-600" />
                  <span>Anmelde-E-Mail & Passwort ändern</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Änderungen werden sofort wirksam und für zukünftige Anmeldungen dauerhaft gespeichert.
                </p>
              </div>
            </div>

            {/* Alerts */}
            {successMessage && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">{t('adminConfigSuccess')}</span>
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">{t('adminConfigInputError')}</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5" id="admin-credentials-form">
              {/* 1. Anmelde-E-Mail */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="admin-config-email">
                  Administrator-Anmelde-E-Mail *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="admin-config-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="p.stogian@yahoo.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {t('adminEmailNotice')}
                </p>
              </div>

              {/* 2. Passwort-Verwaltung */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Lock className="w-4 h-4 text-teal-600" />
                    <span>{t('adminUpdatePassword')}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {t('adminPasswordLeaveBlank')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Neues Passwort */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="admin-config-new-password">
                      {t('profileNewPassword') || 'Neues Passwort'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="admin-config-new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t('profileNewPassword') || 'Neues Passwort (min. 6 Zeichen)'}
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Passwort anzeigen/ausblenden"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Passwort wiederholen */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="admin-config-confirm-password">
                      {t('regConfirmPassword') || 'Passwort wiederholen'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="admin-config-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('regConfirmPassword') || 'Passwort bestätigen'}
                        className={`w-full pl-10 pr-10 py-2.5 rounded-lg border bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                          confirmPassword && newPassword !== confirmPassword 
                            ? 'border-rose-300 focus:border-rose-500' 
                            : 'border-slate-300 focus:border-teal-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Passwort anzeigen/ausblenden"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {newPassword && confirmPassword && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {newPassword === confirmPassword ? (
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t('passwordsMatch') || 'Passwörter stimmen überein'}
                      </span>
                    ) : (
                      <span className="text-rose-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {t('passwordsDoNotMatch') || 'Passwörter stimmen noch nicht überein'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Wiederherstellungs-E-Mail (Yahoo Server Destination) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="admin-config-reset-email">
                  Passwort-Wiederherstellungs-E-Mail (Yahoo Destination) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="admin-config-reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="p.stogian@yahoo.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  An diese Zieladresse wird der Wiederherstellungs-Code bei &quot;Passwort vergessen&quot; gesendet.
                </p>
              </div>

              {/* 4. Sicherheitskennwort (Gate-PIN) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1" htmlFor="admin-config-security-pin">
                  {t('adminConfigSecurityPinLabel')} *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="admin-config-security-pin"
                    type={showSecurityPin ? 'text' : 'password'}
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value)}
                    required
                    placeholder="360"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors font-mono font-bold tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecurityPin(!showSecurityPin)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showSecurityPin ? 'Verbergen' : 'Anzeigen'}
                  >
                    {showSecurityPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {t('adminConfigSecurityPinDesc')}
                </p>
              </div>

              {/* Buttons */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  title={t('adminConfigResetToDefault')}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('adminConfigResetToDefault')}</span>
                </button>

                <button
                  id="admin-btn-save-credentials"
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Wird gespeichert...' : 'Zugangsdaten speichern'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Info Sidebar (1 Col) */}
        <div className="space-y-6">
          {/* Active Credentials Overview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Fingerprint className="w-4 h-4 text-teal-600" />
              <span>{t('adminCurrentAccessConfig')}</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                  {t('adminActiveLoginEmail')}
                </span>
                <span className="font-mono font-bold text-slate-900 break-all">
                  {adminCreds.email}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                  Wiederherstellungs-Server
                </span>
                <span className="font-mono text-teal-800 font-semibold break-all">
                  {adminCreds.resetEmailDestination}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                  {t('adminConfigSecurityPinLabel')}
                </span>
                <span className="font-mono text-teal-800 font-bold tracking-wider">
                  {adminCreds.securityPin || '360'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                  Letzte Änderung
                </span>
                <span className="text-slate-700 font-medium">
                  {adminCreds.updatedAt 
                    ? new Date(adminCreds.updatedAt).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })
                    : 'System-Standardvorgabe'}
                </span>
              </div>
            </div>
          </div>

          {/* Security Hints */}
          <div className="bg-teal-50/80 border border-teal-200 rounded-xl p-5 space-y-3 text-xs text-teal-950">
            <div className="flex items-center gap-2 font-bold text-teal-900">
              <Info className="w-4 h-4 text-teal-700 shrink-0" />
              <span>{t('adminConfigSecurityHint')}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-teal-900/90">
              Ihre Administrator-Zugangsdaten werden lokal im sicheren Browser-Speicher synchronisiert. Sie können das Passwort jederzeit ändern oder bei Bedarf mit dem Button &quot;Auf Standard zurücksetzen&quot; wiederherstellen.
            </p>
            <div className="pt-2 border-t border-teal-200/60 flex items-center gap-1.5 text-[11px] font-mono text-teal-800">
              <Server className="w-3.5 h-3.5 text-teal-600" />
              <span>SaaS-Session: Aktiv & geschützt</span>
            </div>
          </div>
        </div>
      </div>

      {/* NEW SECTION: E-Mail-Einstellungen (SMTP & Server) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6" id="admin-email-settings-section">
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-600" />
              <span>{t('emailSettingsTitle')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('emailSettingsSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-teal-50 text-teal-700 border border-teal-200 text-[11px] font-medium flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span>Hostinger SSL / TLS</span>
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Email Status Alerts */}
          {emailSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Erfolg</span>
                <span>{emailSuccessMessage}</span>
              </div>
            </div>
          )}

          {emailErrorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Fehler</span>
                <span>{emailErrorMessage}</span>
              </div>
            </div>
          )}

          {/* Hostinger Server Settings Overview Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/40">
            <div className="px-4 py-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('hostingerSettingsOverview')}</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">Hostinger Mail</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-4">{t('protocol')}</th>
                    <th className="py-2.5 px-4">{t('hostname')}</th>
                    <th className="py-2.5 px-4">{t('port')}</th>
                    <th className="py-2.5 px-4">{t('securityTlsSsl')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-mono text-[11px]">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                      {t('incomingServerImapShort')}
                    </td>
                    <td className="py-2.5 px-4 text-teal-700 font-semibold">{imapHost}</td>
                    <td className="py-2.5 px-4 text-slate-700">{imapPort}</td>
                    <td className="py-2.5 px-4">
                      {imapSecure ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-sans font-bold">
                          <Check className="w-3 h-3" /> SSL/TLS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-sans">
                          STARTTLS / Standard
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors bg-teal-50/20">
                    <td className="py-2.5 px-4 font-sans font-bold text-teal-900 flex items-center gap-1.5">
                      <span>{t('outgoingServerSmtpShort')}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-teal-600 text-white rounded font-normal">Aktiv</span>
                    </td>
                    <td className="py-2.5 px-4 text-teal-800 font-bold">{smtpHost}</td>
                    <td className="py-2.5 px-4 text-teal-800 font-bold">{smtpPort}</td>
                    <td className="py-2.5 px-4">
                      {smtpSecure ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-sans font-bold">
                          <Check className="w-3 h-3" /> SSL/TLS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-sans font-bold">
                          STARTTLS
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-700">
                      <span>{t('incomingServerPop3Short')}</span>
                      <span className="ml-1.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-sans">
                        {t('notRecommended')}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{popHost}</td>
                    <td className="py-2.5 px-4 text-slate-600">{popPort}</td>
                    <td className="py-2.5 px-4">
                      {popSecure ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-sans font-bold">
                          <Check className="w-3 h-3" /> SSL/TLS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-sans">
                          STARTTLS / Standard
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Email Settings Form */}
          <form onSubmit={handleSaveEmailConfig} className="space-y-6" id="admin-email-config-form">
            {/* Section 0: Versandmethode (Send Method Selection) */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-600" />
                  <span>{t('sendMethod')}</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Wählen Sie die bevorzugte Übertragungsart für den automatischen E-Mail-Versand.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  sendMethod === 'api'
                    ? 'border-teal-600 bg-teal-50/50 text-teal-950 ring-1 ring-teal-600 font-medium shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/80'
                }`}>
                  <input
                    type="radio"
                    name="sendMethod"
                    value="api"
                    checked={sendMethod === 'api'}
                    onChange={() => setSendMethod('api')}
                    className="mt-0.5 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>{t('sendMethodApi')}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Empfohlen</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                      Direkter Versand über Hostinger REST API (HTTPS). Ideal für Webhosting und statisches Deployment.
                    </p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  sendMethod === 'smtp'
                    ? 'border-teal-600 bg-teal-50/50 text-teal-950 ring-1 ring-teal-600 font-medium shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100/80'
                }`}>
                  <input
                    type="radio"
                    name="sendMethod"
                    value="smtp"
                    checked={sendMethod === 'smtp'}
                    onChange={() => setSendMethod('smtp')}
                    className="mt-0.5 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>{t('sendMethodSmtp')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                      Klassischer SMTP-Handshake über einen aktiven Node.js-Backend-Dienst.
                    </p>
                  </div>
                </label>
              </div>

              {/* Hostinger API Specific Inputs */}
              <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg space-y-3 pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Hostinger API Token */}
                  <div className="space-y-1">
                    <label htmlFor="email-api-token" className="text-xs font-bold text-slate-700 block">
                      {t('hostingerApiToken')} {sendMethod === 'api' ? '*' : ''}
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="email-api-token"
                        type={showApiToken ? 'text' : 'password'}
                        value={apiToken}
                        onChange={(e) => setApiToken(e.target.value)}
                        placeholder={t('hostingerApiTokenPlaceholder')}
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiToken(!showApiToken)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Token anzeigen/ausblenden"
                      >
                        {showApiToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Mailbox Resource ID */}
                  <div className="space-y-1">
                    <label htmlFor="email-mailbox-id" className="text-xs font-bold text-slate-700 block">
                      {t('hostingerMailboxId')}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="email-mailbox-id"
                        type="text"
                        value={mailboxId}
                        onChange={(e) => setMailboxId(e.target.value)}
                        placeholder={t('hostingerMailboxIdPlaceholder')}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: SMTP Outgoing Server */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-teal-600" />
                  <span>{t('smtpServerOutgoing')}</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t('smtpServerOutgoingDesc')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* SMTP Host */}
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="email-smtp-host" className="text-xs font-bold text-slate-700 block">
                    {t('smtpHostname')} *
                  </label>
                  <input
                    id="email-smtp-host"
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    required
                    placeholder={t('smtpHostnamePlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                  />
                </div>

                {/* SMTP Port */}
                <div className="space-y-1">
                  <label htmlFor="email-smtp-port" className="text-xs font-bold text-slate-700 block">
                    {t('smtpPort')} *
                  </label>
                  <input
                    id="email-smtp-port"
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    required
                    placeholder="465"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                  />
                </div>
              </div>

              {/* Encryption Selection */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {t('smtpEncryption')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                    smtpSecure 
                      ? 'border-teal-500 bg-teal-50/40 text-teal-950 font-semibold' 
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}>
                    <input
                      type="radio"
                      name="smtpSecurity"
                      checked={smtpSecure}
                      onChange={() => setSmtpSecure(true)}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>{t('encryptionSslTls')}</span>
                  </label>

                  <label className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                    !smtpSecure 
                      ? 'border-teal-500 bg-teal-50/40 text-teal-950 font-semibold' 
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}>
                    <input
                      type="radio"
                      name="smtpSecurity"
                      checked={!smtpSecure}
                      onChange={() => setSmtpSecure(false)}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>{t('encryptionStarttls')}</span>
                  </label>
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Username */}
                <div className="space-y-1">
                  <label htmlFor="email-smtp-user" className="text-xs font-bold text-slate-700 block">
                    {t('smtpUsername')} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="email-smtp-user"
                      type="email"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      required
                      placeholder="therapie@homeopilot360.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label htmlFor="email-smtp-password" className="text-xs font-bold text-slate-700 block">
                    {t('smtpPassword')} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="email-smtp-password"
                      type={showSmtpPassword ? 'text' : 'password'}
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      required
                      placeholder="Othonospet@19071963"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Passwort anzeigen/ausblenden"
                    >
                      {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label htmlFor="email-from-name" className="text-xs font-bold text-slate-700 block">
                    {t('smtpSenderName')}
                  </label>
                  <input
                    id="email-from-name"
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder={t('smtpSenderNamePlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="email-from-email" className="text-xs font-bold text-slate-700 block">
                    {t('smtpSenderEmail')}
                  </label>
                  <input
                    id="email-from-email"
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder={t('smtpSenderEmailPlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Incoming Servers (IMAP & POP3) */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-teal-600" />
                  <span>{t('incomingServerImap')} &amp; {t('incomingServerPop3')}</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* IMAP */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>{t('incomingServerImap')}</span>
                    <span className="text-[10px] text-emerald-700 font-normal">Standard (Empfohlen)</span>
                  </span>

                  <div className="space-y-1">
                    <label htmlFor="email-imap-host" className="text-[11px] font-semibold text-slate-600 block">
                      {t('imapHostname')}
                    </label>
                    <input
                      id="email-imap-host"
                      type="text"
                      value={imapHost}
                      onChange={(e) => setImapHost(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label htmlFor="email-imap-port" className="text-[11px] font-semibold text-slate-600 block">
                        Port
                      </label>
                      <input
                        id="email-imap-port"
                        type="number"
                        value={imapPort}
                        onChange={(e) => setImapPort(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="email-imap-secure" className="text-[11px] font-semibold text-slate-600 block">
                        SSL/TLS
                      </label>
                      <select
                        id="email-imap-secure"
                        value={imapSecure ? 'true' : 'false'}
                        onChange={(e) => setImapSecure(e.target.value === 'true')}
                        className="w-full px-2.5 py-2 rounded border border-slate-300 bg-white text-xs font-semibold text-teal-800 focus:outline-none focus:border-teal-600 cursor-pointer"
                      >
                        <option value="true">SSL / TLS (993)</option>
                        <option value="false">STARTTLS / Standard</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* POP3 */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>{t('incomingServerPop3')}</span>
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-normal">
                      {t('notRecommended')}
                    </span>
                  </span>

                  <div className="space-y-1">
                    <label htmlFor="email-pop-host" className="text-[11px] font-semibold text-slate-600 block">
                      {t('popHostname')}
                    </label>
                    <input
                      id="email-pop-host"
                      type="text"
                      value={popHost}
                      onChange={(e) => setPopHost(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label htmlFor="email-pop-port" className="text-[11px] font-semibold text-slate-600 block">
                        Port
                      </label>
                      <input
                        id="email-pop-port"
                        type="number"
                        value={popPort}
                        onChange={(e) => setPopPort(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="email-pop-secure" className="text-[11px] font-semibold text-slate-600 block">
                        SSL/TLS
                      </label>
                      <select
                        id="email-pop-secure"
                        value={popSecure ? 'true' : 'false'}
                        onChange={(e) => setPopSecure(e.target.value === 'true')}
                        className="w-full px-2.5 py-2 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
                      >
                        <option value="true">SSL / TLS (995)</option>
                        <option value="false">STARTTLS / Standard</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Test Connection Box */}
            <div className="p-4 sm:p-5 rounded-xl border border-teal-200 bg-teal-50/40 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center gap-2">
                  <Send className="w-4 h-4 text-teal-700" />
                  <span>{t('testConnectionTitle')}</span>
                </h4>
                <p className="text-[11px] text-teal-900/80 mt-0.5">
                  Testen Sie den SMTP-Server-Handshake und senden Sie optional eine formatierte Bestätigungs-E-Mail.
                </p>
              </div>

              {testSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{testSuccessMessage}</span>
                </div>
              )}

              {testErrorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-900 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">{t('connectionTestFailed')}</span>
                    <span className="font-mono text-[11px]">{testErrorMessage}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor="email-test-recipient" className="text-xs font-semibold text-slate-700 block">
                    {t('testRecipientEmail')}
                  </label>
                  <input
                    id="email-test-recipient"
                    type="email"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder={t('testRecipientEmailPlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestSmtpConnection(false)}
                    disabled={isTestingSmtp || isSendingTestEmail}
                    className="flex-1 px-3 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 text-center"
                    title={t('btnTestConnection')}
                  >
                    {isTestingSmtp ? t('testingConnection') : t('btnTestConnection')}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTestSmtpConnection(true)}
                    disabled={isTestingSmtp || isSendingTestEmail}
                    className="flex-1 px-3 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                    title={t('btnSendTestEmail')}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingTestEmail ? t('sendingTestEmail') : t('btnSendTestEmail')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Form Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetEmailToDefault}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                title={t('btnResetEmailDefaults')}
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('btnResetEmailDefaults')}</span>
              </button>

              <button
                id="admin-btn-save-email-config"
                type="submit"
                disabled={isSavingEmail}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingEmail ? 'Wird gespeichert...' : t('saveEmailConfigBtn')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Seiten-Konfiguration (Logo & Favicon) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-600" />
              <span>Seiten-Konfiguration (Branding)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Passen Sie das Logo und das Favicon der Plattform an. (Base64 oder URL)
            </p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <form onSubmit={handleSaveSiteConfig} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="admin-config-logo" className="text-xs font-bold text-slate-700 block">
                Logo URL oder Base64
              </label>
              <div className="relative">
                <ImagePlus className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="admin-config-logo"
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://.../logo.png oder data:image/png;base64,..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Leer lassen, um das Standardlogo ("H" / Homöopathie-SaaS) zu verwenden.
              </p>
            </div>

            <div className="space-y-1">
              <label htmlFor="admin-config-favicon" className="text-xs font-bold text-slate-700 block">
                Favicon URL oder Base64
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="admin-config-favicon"
                  type="text"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                  placeholder="https://.../favicon.ico oder data:image/x-icon;base64,..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Leer lassen, um das Standard-Favicon zu verwenden.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSavingConfig}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingConfig ? 'Wird gespeichert...' : 'Branding speichern'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
