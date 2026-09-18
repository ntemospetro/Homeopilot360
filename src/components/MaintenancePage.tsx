import React, { useState } from 'react';
import { getSiteConfig, getAdminCredentials, STORAGE_KEYS, safeLocalStorageSetItem } from '../services/storage';
import { Wrench, ShieldCheck, Lock, KeyRound, Sparkles, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MaintenancePageProps {
  onAdminLoginSuccess: () => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ onAdminLoginSuccess }) => {
  const siteConfig = getSiteConfig();
  const adminCreds = getAdminCredentials();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pinOrPassword, setPinOrPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const title = siteConfig.maintenanceTitle || 'System Maintenance & Upgrades';
  const message = siteConfig.maintenanceMessage || 'We are currently performing scheduled maintenance and updates to improve your clinical experience. Our systems will be back online shortly. Thank you for your patience.';
  const eta = siteConfig.maintenanceEta || 'Estimated completion: Shortly';

  const handleAdminBypassLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const input = pinOrPassword.trim();
    if (!input) {
      setLoginError('Please enter your security PIN or admin password.');
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      const correctPin = adminCreds.securityPin || '360';
      const correctPassword = adminCreds.password || 'Othonospet@19071963';

      if (input === correctPin || input === correctPassword || input === adminCreds.email) {
        safeLocalStorageSetItem(STORAGE_KEYS.ADMIN_LOGGED_IN, 'true');
        window.dispatchEvent(new Event('homoeo_admin_auth_changed'));
        onAdminLoginSuccess();
      } else {
        setLoginError('Invalid PIN or password. Please try again.');
        setIsLoggingIn(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Brand */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-900/40">
          <Wrench className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wide text-white">HomeoPilot 360</h1>
          <p className="text-[11px] text-teal-400 font-medium">Clinical SaaS Infrastructure</p>
        </div>
      </div>

      {/* Top Right Admin Login Trigger */}
      <div className="absolute top-6 right-6">
        <button
          type="button"
          onClick={() => setShowLoginModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-md cursor-pointer backdrop-blur-sm"
        >
          <Lock className="w-3.5 h-3.5 text-teal-400" />
          <span>Admin Access (PIN 360)</span>
        </button>
      </div>

      {/* Main Maintenance Card */}
      <div className="max-w-xl w-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/60 text-center relative z-10 my-auto">
        <div className="w-20 h-20 rounded-2xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Wrench className="w-10 h-10 text-teal-400 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Scheduled System Upgrades</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
          {title}
        </h2>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-lg mx-auto">
          {message}
        </p>

        {eta && (
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center gap-2.5 text-xs font-medium text-slate-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span>{eta}</span>
          </div>
        )}

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Secure Clinical Environment</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} HomeoPilot 360. All rights reserved.
          </div>
        </div>
      </div>

      {/* Admin Bypass Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600/20 border border-teal-500/30 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-teal-400" />
                </div>
                <h3 className="text-sm font-bold text-white">Administrator Bypass</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Enter your Administrator Security PIN (e.g. <strong className="text-teal-400">360</strong>) or administrator password to bypass maintenance mode and log in securely.
            </p>

            <form onSubmit={handleAdminBypassLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin PIN / Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    autoFocus
                    value={pinOrPassword}
                    onChange={(e) => setPinOrPassword(e.target.value)}
                    placeholder="Enter PIN (e.g. 360)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 shadow-lg shadow-teal-900/30"
                >
                  <span>{isLoggingIn ? 'Verifying...' : 'Unlock & Login'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
