import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, X, KeyRound, Loader2 } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { sendPasswordRecoveryEmail } from '../services/emailService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail || '');
      setIsSending(false);
    }
  }, [isOpen, defaultEmail]);

  if (!isOpen) return null;

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSending) return;

    setIsSending(true);
    try {
      // Send the recovery email in background (or quietly succeed if not found)
      await sendPasswordRecoveryEmail(email.trim());
    } catch {
      // Quiet fail to protect privacy
    } finally {
      setIsSending(false);
      onClose();
    }
  };

  return (
    <div 
      id="modal-forgot-password-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div 
        id="modal-forgot-password-container"
        className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800 text-xs"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative border-b border-slate-800">
          <button
            id="btn-close-forgot-pw-modal"
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-3">
            <KeyRound className="w-5 h-5 text-teal-400" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {t('forgotPwTitle')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('forgotPwSubtitle')}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSendReset} className="space-y-4">
            <p className="text-slate-600 leading-relaxed text-xs">
              {t('forgotPwInstructions')}
            </p>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>{t('forgotPwDestination')}</span>
                <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-mono text-[10px]">
                  {t('forgotPwMailServer')}
                </span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="input-forgot-pw-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('forgotPwEmailPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-confirm-send-reset-email"
                type="submit"
                disabled={isSending || !email.trim()}
                className="w-full py-2.5 px-4 rounded-md bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('forgotPwSending')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('forgotPwSendBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
