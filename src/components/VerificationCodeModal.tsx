import React, { useState, useEffect, useRef } from 'react';
import { Mail, CheckCircle2, AlertCircle, X, ShieldCheck, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface VerificationCodeModalProps {
  isOpen: boolean;
  email: string;
  expectedCode: string;
  onSuccess: () => void;
  onResendCode: () => Promise<string | null>;
  onClose: () => void;
}

export const VerificationCodeModal: React.FC<VerificationCodeModalProps> = ({
  isOpen,
  email,
  expectedCode,
  onSuccess,
  onResendCode,
  onClose,
}) => {
  const { t } = useTranslation();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize and focus first box when modal opens
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setError(null);
      setIsVerifying(false);
      setResendSuccess(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    setError(null);
    setResendSuccess(false);

    // Only allow numeric characters
    const cleanVal = value.replace(/[^0-9]/g, '');

    if (!cleanVal) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // If single digit typed
    const singleDigit = cleanVal.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = singleDigit;
    setDigits(newDigits);

    // Auto advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if full code has been entered
    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      verifyCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    setResendSuccess(false);

    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);

    // Focus last filled or next empty box
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();

    if (pastedData.length === 6) {
      verifyCode(pastedData);
    }
  };

  const verifyCode = (codeToVerify?: string) => {
    const code = codeToVerify || digits.join('');
    if (code.length < 6) {
      setError(t('regVerifyInvalidCode'));
      return;
    }

    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      if (code.trim() === expectedCode.trim()) {
        setIsVerifying(false);
        onSuccess();
      } else {
        setIsVerifying(false);
        setError(t('regVerifyInvalidCode'));
        // Focus first box for quick re-entry
        inputRefs.current[0]?.focus();
      }
    }, 350);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode();
  };

  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return;
    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const newCode = await onResendCode();
      if (newCode) {
        setResendSuccess(true);
        setResendCooldown(30);
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError(t('regVerifyInvalidCode'));
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = digits.every(d => d.length === 1);

  // Parse message with highlighted email
  const rawMessage = t('regVerifyModalMessage', { email: '{{EMAIL}}' });
  const messageParts = rawMessage.split('{{EMAIL}}');

  return (
    <div
      id="modal-verify-code-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
    >
      <div
        id="modal-verify-code-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 max-w-lg w-full overflow-hidden relative animate-scaleUp"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-900 px-6 py-5 text-white flex items-center justify-between relative shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-teal-100 shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg leading-snug text-white tracking-tight">
                {t('regVerifyModalTitle')}
              </h3>
              <p className="text-teal-100/90 text-xs mt-0.5">
                {t('regVerifyModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-verify-code-modal"
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-2 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <form onSubmit={handleManualSubmit} className="p-6 sm:p-7 space-y-6">
          {/* Main instruction message with email highlight */}
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4 text-xs text-slate-700 leading-relaxed space-y-2">
            <div className="flex items-center gap-2 text-teal-900 font-semibold mb-1">
              <Mail className="w-4 h-4 text-teal-700 shrink-0" />
              <span>{t('regVerifyCodeLabel')}</span>
            </div>
            <p className="text-slate-600">
              {messageParts[0]}
              <span className="font-mono font-bold text-teal-800 bg-white px-2 py-0.5 rounded-md border border-teal-300 inline-block my-0.5 mx-1 shadow-2xs">
                {email}
              </span>
              {messageParts[1]}
            </p>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800 font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{t('regVerifyResentSuccess')}</span>
            </div>
          )}

          {/* 6 Digit Input Boxes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
              {t('regVerifyCodeLabel')}
            </label>
            <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  id={`input-verify-digit-${idx}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl border transition-all shadow-xs outline-hidden ${
                    digit
                      ? 'border-teal-600 bg-teal-50/40 text-teal-900 shadow-teal-500/10'
                      : error
                      ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100'
                  }`}
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

          {/* Resend Code Action */}
          <div className="flex items-center justify-center pt-1 text-xs">
            <button
              type="button"
              id="btn-resend-verification-code"
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
              className="text-teal-700 hover:text-teal-900 font-semibold hover:underline inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin text-teal-600' : ''}`} />
              <span>
                {t('regVerifyResendBtn')}
                {resendCooldown > 0 ? ` (${resendCooldown}s)` : ''}
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              id="btn-cancel-verify-code"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {t('regVerifyCancelBtn')}
            </button>
            <button
              type="submit"
              id="btn-confirm-verify-code"
              disabled={isVerifying || !isComplete}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('regVerifySending')}</span>
                </>
              ) : (
                <>
                  <span>{t('regVerifyConfirmBtn')}</span>
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
