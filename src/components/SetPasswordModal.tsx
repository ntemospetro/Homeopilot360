import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  Mail, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface SetPasswordModalProps {
  isOpen: boolean;
  email: string;
  therapistName: string;
  onClose: () => void;
  onConfirm: (password: string) => void;
  isSubmitting?: boolean;
}

export const SetPasswordModal: React.FC<SetPasswordModalProps> = ({
  isOpen,
  email,
  therapistName,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setError(null);
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 120);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (trimmedPassword.length < 6) {
      setError(t('regPasswordErrLength'));
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError(t('regPasswordErrMatch'));
      return;
    }

    onConfirm(trimmedPassword);
  };

  const isMatching = password.length >= 6 && confirmPassword.length >= 6 && password === confirmPassword;
  const isMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div
      id="modal-set-password-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="modal-set-password-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-lg w-full overflow-hidden relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-900 px-6 py-5 text-white flex items-center justify-between relative shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-teal-100 shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg leading-snug text-white tracking-tight">
                {t('regSetPasswordModalTitle')}
              </h3>
              <p className="text-teal-100/90 text-xs mt-0.5">
                {t('regSetPasswordPrompt')}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-set-password-modal"
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-2 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          {/* Personal Greeting & Fixed Username / Email Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
            {therapistName && (
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <UserCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span>
                  {t('regSetPasswordModalGreeting', { name: therapistName })}
                </span>
              </div>
            )}

            <div className="text-xs text-slate-600">
              <p className="mb-1.5 text-slate-600 leading-relaxed">
                {t('regSetPasswordModalSubtitle')}
              </p>
              <div className="flex items-center gap-2 bg-white border border-teal-200 rounded-lg px-3 py-2 text-teal-900 font-medium text-xs sm:text-sm">
                <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="truncate font-mono font-semibold">{email}</span>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Password Inputs */}
          <div className="space-y-4">
            {/* Field 1: Passwort eingeben */}
            <div>
              <label 
                className="block text-xs font-bold text-slate-600 uppercase mb-1.5" 
                htmlFor="reg-password-input"
              >
                {t('regPasswordLabel')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={passwordInputRef}
                  id="reg-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={t('regPasswordPlaceholder')}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg bg-white text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors h-[42px]"
                  required
                />
                <button
                  type="button"
                  id="btn-toggle-show-reg-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field 2: Passwort wiederholen */}
            <div>
              <label 
                className="block text-xs font-bold text-slate-600 uppercase mb-1.5" 
                htmlFor="reg-confirm-password-input"
              >
                {t('regConfirmPasswordLabel')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-confirm-password-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={t('regConfirmPasswordPlaceholder')}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg bg-white text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors h-[42px] ${
                    isMismatch ? 'border-amber-400 bg-amber-50/20' : 'border-slate-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  id="btn-toggle-show-reg-confirm-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Match / Mismatch status indicator */}
              {isMatching && (
                <p className="mt-1.5 text-xs text-emerald-700 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('passwordsMatch')}</span>
                </p>
              )}
              {isMismatch && (
                <p className="mt-1.5 text-xs text-amber-700 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('passwordsDoNotMatch')}</span>
                </p>
              )}
            </div>
          </div>

          {/* Action buttons: Abbrechen & Registrierung abschließen */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              id="btn-cancel-set-password"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {t('regPasswordCancelBtn')}
            </button>
            <button
              type="submit"
              id="btn-submit-set-password"
              disabled={isSubmitting || !password || !confirmPassword}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>{t('regSubmitting')}</span>
              ) : (
                <>
                  <span>{t('regPasswordSubmitBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
