import React, { useState } from 'react';
import { 
  Stethoscope, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  UserPlus
} from 'lucide-react';
import { Therapist } from '../types';
import { 
  authenticateTherapist 
} from '../services/storage';
import { useTranslation } from '../i18n/LanguageContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface TherapistLoginProps {
  onLoginSuccess: (therapist: Therapist) => void;
  onGoToRegister: () => void;
}

export const TherapistLogin: React.FC<TherapistLoginProps> = ({
  onLoginSuccess,
  onGoToRegister,
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError(t('therapistLoginErrRequired'));
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateTherapist(cleanEmail, cleanPassword);

      if (result.success && result.therapist) {
        setIsLoading(false);
        onLoginSuccess(result.therapist);
      } else {
        setIsLoading(false);
        if (result.error === 'not_found') {
          setError(t('therapistLoginErrNotFound'));
        } else {
          setError(t('therapistLoginErrInvalid'));
        }
      }
    }, 300);
  };

  const handleSelectDemoTherapist = (th: Therapist) => {
    setEmail(th.email);
    setPassword(th.password || 'homoeo2025!');
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-6 sm:p-8 text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
            <Stethoscope className="w-7 h-7 text-teal-200" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-serif">
            {t('therapistLoginTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xs mx-auto">
            {t('therapistLoginSubtitle')}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <form id="therapist-login-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Error Notification */}
            {error && (
              <div 
                id="therapist-login-error"
                className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-fadeIn"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="font-medium">
                  {error}
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label 
                className="block text-xs font-bold text-slate-600 uppercase mb-1.5" 
                htmlFor="therapist-login-email"
              >
                {t('therapistLoginEmailLabel')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="therapist-login-email"
                  type="email"
                  placeholder={t('therapistLoginEmailPlaceholder')}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors h-[42px]"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  className="block text-xs font-bold text-slate-600 uppercase" 
                  htmlFor="therapist-login-password"
                >
                  {t('therapistLoginPasswordLabel')} <span className="text-rose-500">*</span>
                </label>
                <button
                  id="btn-therapist-forgot-password"
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold transition-colors cursor-pointer"
                >
                  {t('forgotPwLink')}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="therapist-login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('therapistLoginPasswordPlaceholder')}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors h-[42px]"
                  required
                />
                <button
                  type="button"
                  id="btn-toggle-therapist-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                id="therapist-login-submit-btn"
                type="submit"
                disabled={isLoading || !email.trim() || !password.trim()}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span>{t('therapistLoginChecking')}</span>
                ) : (
                  <>
                    <Stethoscope className="w-4 h-4 text-teal-100" />
                    <span>{t('therapistLoginBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Registration Prompt Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600 mb-2">
              {t('therapistLoginNoAccount')}
            </p>
            <button
              type="button"
              id="btn-switch-to-register"
              onClick={onGoToRegister}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('therapistLoginRegisterLink')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={email}
      />
    </div>
  );
};

