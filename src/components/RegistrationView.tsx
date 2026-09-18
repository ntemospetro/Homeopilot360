import React, { useState, useEffect } from 'react';
import { createTherapist, getLocalizedRegistrationTrial } from '../services/storage';
import { Therapist, RegistrationTrialConfig } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { TermsModal } from './TermsModal';
import { SetPasswordModal } from './SetPasswordModal';
import { VerificationCodeModal } from './VerificationCodeModal';
import { sendRegistrationVerificationCodeEmail } from '../services/emailService';
import { getLocalizedCountries, getCountryFlag, getDefaultCountryForLanguage } from '../data/countries';
import { 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  FileText, 
  Scale 
} from 'lucide-react';

interface RegistrationViewProps {
  onSuccess: (newTherapist: Therapist) => void;
  onGoToAdmin: () => void;
}

export const RegistrationView: React.FC<RegistrationViewProps> = ({
  onSuccess,
  onGoToAdmin,
}) => {
  const { t, language } = useTranslation();
  const localizedCountries = getLocalizedCountries(language);
  const [trialConfig, setTrialConfig] = useState<RegistrationTrialConfig>(getLocalizedRegistrationTrial(language));

  useEffect(() => {
    setTrialConfig(getLocalizedRegistrationTrial(language));
    
    const handleUpdate = () => {
      setTrialConfig(getLocalizedRegistrationTrial(language));
    };
    
    window.addEventListener('homoeo_reg_trial_updated', handleUpdate);
    return () => window.removeEventListener('homoeo_reg_trial_updated', handleUpdate);
  }, [language]);

  const [formData, setFormData] = useState({
    vorname: '',
    nachname: '',
    praxisName: '',
    adresse: '',
    land: getDefaultCountryForLanguage(language),
    email: '',
    telefon: '',
  });

  // Automatically update default country when language changes, while still allowing user to change it
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      land: getDefaultCountryForLanguage(language)
    }));
  }, [language]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.vorname.trim()) errs.vorname = t('regErrFirstName');
    if (!formData.nachname.trim()) errs.nachname = t('regErrLastName');
    if (!formData.adresse.trim()) errs.adresse = t('regErrAddress');
    if (!formData.land.trim()) errs.land = t('regErrCountry');
    if (!formData.email.trim()) {
      errs.email = t('regErrEmail');
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = t('regErrEmailValid');
    }
    if (!formData.telefon.trim()) errs.telefon = t('regErrPhone');
    if (!agreedTerms) errs.terms = t('regErrTerms');

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Open the password setup step
    setIsPasswordModalOpen(true);
  };

  const handleConfirmPassword = async (password: string) => {
    setIsSubmitting(true);
    setPendingPassword(password);

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);

    try {
      // Send the 6-digit confirmation code via email
      await sendRegistrationVerificationCodeEmail(
        formData.email.trim(),
        `${formData.vorname} ${formData.nachname}`.trim(),
        code,
        language
      );
    } catch {
      // Proceed even if email network fluctuates, the code is ready in modal
    } finally {
      setIsSubmitting(false);
      setIsPasswordModalOpen(false);
      setIsVerificationModalOpen(true);
    }
  };

  const handleResendVerificationCode = async (): Promise<string | null> => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(newCode);

    try {
      await sendRegistrationVerificationCodeEmail(
        formData.email.trim(),
        `${formData.vorname} ${formData.nachname}`.trim(),
        newCode,
        language
      );
      return newCode;
    } catch {
      return newCode;
    }
  };

  const handleVerificationSuccess = () => {
    try {
      const created = createTherapist({
        vorname: formData.vorname.trim(),
        nachname: formData.nachname.trim(),
        praxisName: formData.praxisName.trim() || undefined,
        adresse: formData.adresse.trim(),
        land: formData.land.trim(),
        email: formData.email.trim().toLowerCase(),
        telefon: formData.telefon.trim(),
        password: pendingPassword.trim(),
        preferredLanguage: language,
      });

      setIsVerificationModalOpen(false);
      onSuccess(created);
    } catch {
      alert('Error creating therapist account');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
      <div className="card overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-md">
        {/* Left Hero & Plan Column (Teal panel) */}
        <div className="lg:col-span-5 bg-teal-600 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-xs">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-white leading-snug">
              {t('regHeroTitle')}
            </h1>
            <p className="text-teal-50 text-xs sm:text-sm leading-relaxed opacity-90 mb-6">
              {t('regHeroSubtitle')}
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            {/* Free Trial Card */}
            <div className="bg-teal-700/60 p-5 rounded-xl border border-teal-500/40 text-xs shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider bg-teal-800/80 px-2 py-0.5 rounded">
                  {trialConfig.badge}
                </span>
                <span className="font-bold text-white text-sm">{trialConfig.priceDisplay}</span>
              </div>
              <p className="text-teal-100 text-[11px] leading-relaxed mb-3">
                {trialConfig.description}
              </p>
              <div className="space-y-1.5 text-[11px] text-teal-50 border-t border-teal-600/60 pt-2.5">
                {(trialConfig.features || []).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    {idx === (trialConfig.features.length - 1) ? (
                      <Lock className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                    )}
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin hint */}
            <div className="flex items-center justify-between text-[11px] text-teal-100/90 pt-1">
              <span>{t('regSyncActive')}</span>
              <button
                type="button"
                onClick={onGoToAdmin}
                className="underline hover:text-white cursor-pointer font-medium"
              >
                {t('regGoToAdmin')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('regCreateAccount')}</h2>
            <p className="text-slate-500 text-xs mt-1">
              {t('regCreateAccountSub')}
            </p>
          </div>

          <form id="therapist-registration-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1" htmlFor="input-vorname">
                  {t('regFirstName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-vorname"
                  type="text"
                  placeholder={t('regPlaceholderFirstName')}
                  value={formData.vorname}
                  onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 transition-colors h-[38px] ${
                    errors.vorname ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300 bg-white'
                  }`}
                />
                {errors.vorname && <p className="mt-1 text-xs text-rose-600">{errors.vorname}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1" htmlFor="input-nachname">
                  {t('regLastName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-nachname"
                  type="text"
                  placeholder={t('regPlaceholderLastName')}
                  value={formData.nachname}
                  onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 transition-colors h-[38px] ${
                    errors.nachname ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300 bg-white'
                  }`}
                />
                {errors.nachname && <p className="mt-1 text-xs text-rose-600">{errors.nachname}</p>}
              </div>
            </div>

            {/* Praxisname (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1" htmlFor="input-praxis">
                {t('regPraxisName')}
              </label>
              <input
                id="input-praxis"
                type="text"
                placeholder={t('regPlaceholderPraxis')}
                value={formData.praxisName}
                onChange={(e) => setFormData({ ...formData, praxisName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 transition-colors h-[38px]"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1" htmlFor="input-email">
                {t('regEmail')} <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-email"
                type="email"
                placeholder={t('regPlaceholderEmail')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 transition-colors h-[38px] ${
                  errors.email ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300 bg-white'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1" htmlFor="input-adresse">
                {t('regAddress')} <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-adresse"
                type="text"
                placeholder={t('regPlaceholderAddress')}
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 transition-colors h-[38px] ${
                  errors.adresse ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300 bg-white'
                }`}
              />
              {errors.adresse && <p className="mt-1 text-xs text-rose-600">{errors.adresse}</p>}
            </div>

            {/* Country & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1" htmlFor="input-land">
                  {t('regCountry')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 pointer-events-none text-base">
                    {getCountryFlag(formData.land)}
                  </div>
                  <select
                    id="input-land"
                    value={formData.land}
                    onChange={(e) => setFormData(prev => ({ ...prev, land: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600 transition-colors cursor-pointer h-[38px] font-medium"
                  >
                    <optgroup label={t('countryGroupDach')}>
                      {localizedCountries.filter(c => c.group === 'DACH').map(c => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.displayName} {c.dialCode ? `(${c.dialCode})` : ''}
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label={t('countryGroupEurope')}>
                      {localizedCountries.filter(c => c.group === 'Europa').map(c => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.displayName} {c.dialCode ? `(${c.dialCode})` : ''}
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label={t('countryGroupWorldwide')}>
                      {localizedCountries.filter(c => c.group === 'Weltweit').map(c => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.displayName} {c.dialCode ? `(${c.dialCode})` : ''}
                        </option>
                      ))}
                    </optgroup>

                    <optgroup label={t('countryGroupOther')}>
                      {localizedCountries.filter(c => c.group === 'Sonstige').map(c => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.displayName}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                {errors.land && <p className="mt-1 text-xs text-rose-600">{errors.land}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1" htmlFor="input-telefon">
                  {t('regPhone')} <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-telefon"
                  type="tel"
                  placeholder={t('regPlaceholderPhone')}
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 transition-colors h-[38px] ${
                    errors.telefon ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300 bg-white'
                  }`}
                />
                {errors.telefon && <p className="mt-1 text-xs text-rose-600">{errors.telefon}</p>}
              </div>
            </div>

            {/* Terms checkbox & AGB Popup Trigger */}
            <div className="pt-2 p-3 bg-slate-50/80 rounded-lg border border-slate-200/80">
              <div className="flex items-start gap-2.5">
                <input
                  id="checkbox-terms"
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer h-4 w-4 shrink-0"
                />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <label htmlFor="checkbox-terms" className="cursor-pointer">
                    {t('regTermsAgreePrefix')}{' '}
                  </label>
                  <button
                    type="button"
                    id="btn-open-agb-modal"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTermsModalOpen(true);
                    }}
                    className="text-teal-700 hover:text-teal-900 font-semibold underline underline-offset-2 hover:bg-teal-50 px-1 py-0.5 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3 h-3 text-teal-600 inline" />
                    <span>{t('regTermsLink')}</span>
                  </button>
                  <span> {t('regTermsAgreeSuffix')}</span>
                  
                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={() => setIsTermsModalOpen(true)}
                      className="text-[11px] text-teal-600 hover:text-teal-800 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Scale className="w-3 h-3" />
                      <span>{t('regTermsModalOpenBtn')}</span>
                    </button>
                  </div>
                </div>
              </div>
              {errors.terms && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.terms}</p>}
            </div>

            {/* Submit Button */}
            <button
              id="submit-registration-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3 rounded-md text-sm font-semibold shadow-sm mt-2 cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <span>{t('regSubmitting')}</span>
              ) : (
                <>
                  <span>{t('regSubmitBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* AGB Popup Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => setAgreedTerms(true)}
      />

      {/* Set Password Modal */}
      <SetPasswordModal
        isOpen={isPasswordModalOpen}
        email={formData.email}
        therapistName={`${formData.vorname} ${formData.nachname}`.trim()}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={handleConfirmPassword}
        isSubmitting={isSubmitting}
      />

      {/* 6-Digit Email Verification Code Modal */}
      <VerificationCodeModal
        isOpen={isVerificationModalOpen}
        email={formData.email}
        expectedCode={verificationCode}
        onSuccess={handleVerificationSuccess}
        onResendCode={handleResendVerificationCode}
        onClose={() => setIsVerificationModalOpen(false)}
      />
    </div>
  );
};
