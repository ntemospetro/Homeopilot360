import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft 
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { getAdminCredentials, syncAdminCredentialsFromServer } from '../services/storage';
import { sendSecurityPinRecoveryEmail } from '../services/emailService';

interface AdminSecurityGateProps {
  onUnlock: () => void;
  onCancel: () => void;
}

export const AdminSecurityGate: React.FC<AdminSecurityGateProps> = ({
  onUnlock,
  onCancel
}) => {
  const { t } = useTranslation();
  const [adminCreds, setAdminCreds] = useState(getAdminCredentials());
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  useEffect(() => {
    syncAdminCredentialsFromServer().then(creds => {
      if (creds) setAdminCreds(creds);
    });
    const handleCredsChange = () => {
      setAdminCreds(getAdminCredentials());
    };
    window.addEventListener('homoeo_admin_credentials_changed', handleCredsChange);
    return () => window.removeEventListener('homoeo_admin_credentials_changed', handleCredsChange);
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanInput = pin.trim();
      const currentPin = (adminCreds.securityPin || '360').trim();

      if (cleanInput === currentPin) {
        setIsLoading(false);
        onUnlock();
      } else {
        setIsLoading(false);
        setError(t('securityGateInvalidPin'));
      }
    }, 280);
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim() || isSendingRecovery) return;

    setIsSendingRecovery(true);
    try {
      await sendSecurityPinRecoveryEmail(recoveryEmail.trim());
      setRecoverySuccess(true);
    } catch {
      setRecoverySuccess(true);
    } finally {
      setIsSendingRecovery(false);
    }
  };

  return (
    <div id="admin-security-gate-wrapper" className="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div id="admin-security-gate-card" className="card overflow-hidden shadow-xl border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-8 text-center relative border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <KeyRound className="w-7 h-7 text-teal-400" />
          </div>
          <h1 id="security-gate-heading" className="text-xl font-bold text-white tracking-tight">
            {showRecovery ? t('securityGateRecoveryTitle') : t('securityGateTitle')}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {showRecovery ? t('securityGateRecoveryDesc') : t('securityGateSubtitle')}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 bg-white">
          {!showRecovery ? (
            /* PIN Verification Form */
            <form id="security-gate-form" onSubmit={handleVerify} className="space-y-4">
              {error && (
                <div id="security-gate-error" className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">{t('securityGateInvalidPin')}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5" htmlFor="security-gate-pin-input">
                  {t('securityGatePinLabel')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    id="security-gate-pin-input"
                    type="password"
                    autoFocus
                    placeholder={t('securityGatePinPlaceholder')}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  id="btn-security-gate-forgot"
                  onClick={() => {
                    setShowRecovery(true);
                    setError(null);
                    setRecoverySuccess(false);
                  }}
                  className="text-xs text-teal-700 hover:text-teal-900 font-semibold transition-colors cursor-pointer"
                >
                  {t('securityGateForgotLink')}
                </button>
              </div>

              <div className="pt-3 space-y-2">
                <button
                  id="security-gate-submit-btn"
                  type="submit"
                  disabled={isLoading || !pin.trim()}
                  className="w-full py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('securityGateChecking')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('securityGateSubmitBtn')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  id="security-gate-cancel-btn"
                  type="button"
                  onClick={onCancel}
                  className="w-full py-2 px-4 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('securityGateBackToLanding')}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Recovery Email Form (Silent Protection) */
            <form id="security-gate-recovery-form" onSubmit={handleRecoverySubmit} className="space-y-4">
              {recoverySuccess ? (
                <div id="security-gate-recovery-success" className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-teal-900 leading-relaxed font-medium">
                      {t('securityGateRecoverySent')}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      id="btn-recovery-back-to-pin"
                      onClick={() => {
                        setShowRecovery(false);
                        setRecoverySuccess(false);
                      }}
                      className="text-xs font-semibold text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{t('securityGateBackToGate')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5" htmlFor="security-gate-recovery-email">
                      {t('securityGateRecoveryEmailLabel')}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        id="security-gate-recovery-email"
                        type="email"
                        autoFocus
                        placeholder={t('securityGateRecoveryEmailPlaceholder')}
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-600 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      id="security-gate-send-recovery-btn"
                      type="submit"
                      disabled={isSendingRecovery || !recoveryEmail.trim()}
                      className="w-full py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSendingRecovery ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('securityGateRecoverySending')}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('securityGateRecoverySendBtn')}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      id="security-gate-back-btn"
                      type="button"
                      onClick={() => {
                        setShowRecovery(false);
                        setRecoverySuccess(false);
                      }}
                      className="w-full py-2 px-4 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{t('securityGateBackToGate')}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>

        {/* Card Footer info */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>HomeoPilot 360 • Multi-Level Security Gate</span>
        </div>

      </div>
    </div>
  );
};
