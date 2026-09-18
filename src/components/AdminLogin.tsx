import React, { useState, useEffect } from 'react';
import { getAdminCredentials, setAdminLoggedIn, syncAdminCredentialsFromServer } from '../services/storage';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { useTranslation } from '../i18n/LanguageContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff
} from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const [adminCreds, setAdminCreds] = useState(getAdminCredentials());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    syncAdminCredentialsFromServer().then((creds) => {
      if (creds) setAdminCreds(creds);
    });
    const handleCredsChange = () => {
      setAdminCreds(getAdminCredentials());
    };
    window.addEventListener('homoeo_admin_credentials_changed', handleCredsChange);
    return () => window.removeEventListener('homoeo_admin_credentials_changed', handleCredsChange);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password; // exact password matching required
      const currentCreds = getAdminCredentials();

      if (cleanEmail === currentCreds.email.toLowerCase() && cleanPassword === currentCreds.password) {
        setAdminLoggedIn(true);
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('Ungültige Administrator-Zugangsdaten. Bitte prüfen Sie E-Mail und Passwort.');
      }
    }, 350);
  };

  const handleAutoFill = () => {
    const currentCreds = getAdminCredentials();
    setEmail(currentCreds.email);
    setPassword(currentCreds.password);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6">
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-8 text-center relative">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t('adminLoginTitle')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('adminLoginSubtitle')}
          </p>
        </div>

        {/* Form */}
        <div className="p-6 sm:p-8">
          <form id="admin-login-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">{t('adminLoginAccessDenied')}</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1" htmlFor="admin-input-email">
                {t('adminLoginEmailLabel')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="admin-input-email"
                  type="email"
                  placeholder="Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-500 uppercase" htmlFor="admin-input-password">
                  {t('adminLoginPasswordLabel')}
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold transition-colors cursor-pointer"
                >
                  {t('adminLoginForgotPw')}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="admin-input-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-md border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                id="admin-login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-md bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-medium text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span>{t('adminLoginChecking')}</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span>{t('adminLoginBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
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
