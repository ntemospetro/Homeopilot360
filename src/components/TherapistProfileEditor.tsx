import React, { useState, useEffect, useMemo } from 'react';
import { Therapist, LanguageCode } from '../types';
import { updateTherapist } from '../services/storage';
import { addNameChangeRequest } from '../services/storage';
import { Eye, EyeOff, KeyRound, X, Save, AlertCircle, CheckCircle2, ShieldCheck, Building2, Calendar, MapPin, History, Edit3, FileText, User, Mail, Phone, Lock, Globe, Check, Award, Compass, Users } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { useTerminology, ProfessionalRole, TerminologyChoice } from '../i18n/TerminologyContext';
import { LANGUAGES } from '../i18n/translations';
import { getLocalizedCountries, getCountryFlag } from '../data/countries';

interface TherapistProfileEditorProps {
  therapist: Therapist;
  onUpdated?: (therapist: Therapist) => void;
}

export const TherapistProfileEditor: React.FC<TherapistProfileEditorProps> = ({ therapist, onUpdated }) => {
  const { t, language, setLanguage } = useTranslation();
  const { role: contextRole, terminology: contextTerm, setRoleAndTerminology } = useTerminology();

  // Role & Terminology State
  const [selectedRole, setSelectedRole] = useState<ProfessionalRole>(therapist.professionalRole || contextRole || 'heilpraktiker');
  const [selectedTerminology, setSelectedTerminology] = useState<TerminologyChoice>(therapist.terminologyPreference || contextTerm || 'patient');
  const [roleSavedSuccess, setRoleSavedSuccess] = useState(false);

  // Contact State
  const [emailInput, setEmailInput] = useState(therapist.email || '');
  const [phoneInput, setPhoneInput] = useState(therapist.telefon || '');

  // Master Data State
  const [praxisName, setPraxisName] = useState(therapist.praxisName || '');
  const [adresse, setAdresse] = useState(therapist.adresse || '');
  const [land, setLand] = useState(therapist.land || 'Deutschland');

  // Synchronize state when therapist prop updates
  useEffect(() => {
    setEmailInput(therapist.email || '');
    setPhoneInput(therapist.telefon || '');
    setPraxisName(therapist.praxisName || '');
    setAdresse(therapist.adresse || '');
    setLand(therapist.land || 'Deutschland');
    if (therapist.professionalRole) setSelectedRole(therapist.professionalRole);
    if (therapist.terminologyPreference) setSelectedTerminology(therapist.terminologyPreference);
  }, [therapist]);

  // Security State
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modal State
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [nameChangeForm, setNameChangeForm] = useState({ vorname: therapist.vorname, nachname: therapist.nachname, reason: '' });
  const [nameChangeSuccess, setNameChangeSuccess] = useState(false);

  // Feedback State
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [langChangeSuccess, setLangChangeSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const localizedCountries = useMemo(() => getLocalizedCountries(language), [language]);

  const hasEmailChanged = (emailInput || '').trim().toLowerCase() !== (therapist.email || '').trim().toLowerCase();
  const hasPhoneChanged = (phoneInput || '').trim() !== (therapist.telefon || '').trim();
  const hasPasswordChanged = passwordInput.length > 0;
  const hasRoleChanged = 
    selectedRole !== (therapist.professionalRole || 'heilpraktiker') ||
    selectedTerminology !== (therapist.terminologyPreference || (selectedRole === 'berater' ? 'klient' : 'patient'));

  const hasOtherChanged = 
    (praxisName || '').trim() !== (therapist.praxisName || '').trim() ||
    (adresse || '').trim() !== (therapist.adresse || '').trim() ||
    (land || '').trim() !== (therapist.land || 'Deutschland').trim() ||
    hasRoleChanged;

  const hasAnyChanges = hasEmailChanged || hasPhoneChanged || hasOtherChanged || hasPasswordChanged;

  const handleLanguageChange = (code: LanguageCode) => {
    setLanguage(code, true);
    setLangChangeSuccess(true);
    setTimeout(() => setLangChangeSuccess(false), 3000);
  };

  const handleRoleQuickSelect = (newRole: ProfessionalRole) => {
    setSelectedRole(newRole);
    if (newRole === 'berater') {
      setSelectedTerminology('klient');
      setRoleAndTerminology(newRole, 'klient');
    } else {
      setRoleAndTerminology(newRole, selectedTerminology);
    }
    setRoleSavedSuccess(true);
    setTimeout(() => setRoleSavedSuccess(false), 3000);
  };

  const handleTerminologyQuickSelect = (newTerm: TerminologyChoice) => {
    setSelectedTerminology(newTerm);
    setRoleAndTerminology(selectedRole, newTerm);
    setRoleSavedSuccess(true);
    setTimeout(() => setRoleSavedSuccess(false), 3000);
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!(emailInput || '').trim() || !(emailInput || '').includes('@')) {
      setErrorMessage(t('profileErrValidEmail'));
      return;
    }
    if (!(phoneInput || '').trim()) {
      setErrorMessage(t('profileErrPhone'));
      return;
    }
    if (hasPasswordChanged) {
      if ((passwordInput || '').trim().length < 6) {
        setErrorMessage(t('profileErrPasswordLen'));
        return;
      }
      if (passwordInput !== confirmPasswordInput) {
        setErrorMessage(t('profileErrPasswordMismatch'));
        return;
      }
    }

    const updates: Partial<Therapist> = {
      praxisName: (praxisName || '').trim(),
      adresse: (adresse || '').trim(),
      land: (land || '').trim(),
      email: (emailInput || '').trim(),
      telefon: (phoneInput || '').trim(),
      professionalRole: selectedRole,
      terminologyPreference: selectedTerminology,
    };

    setRoleAndTerminology(selectedRole, selectedTerminology);

    if (hasPasswordChanged) {
      updates.password = passwordInput;
    }

    // Handle Histories
    if (hasEmailChanged) {
      updates.previousEmails = [{ value: therapist.email, changedAt: new Date().toISOString() }, ...(therapist.previousEmails || [])];
    }
    if (hasPhoneChanged) {
      updates.previousPhones = [{ value: therapist.telefon, changedAt: new Date().toISOString() }, ...(therapist.previousPhones || [])];
    }
    if ((praxisName || '').trim() !== (therapist.praxisName || '').trim()) {
      if (therapist.praxisName) {
        updates.previousPraxisNames = [{ value: therapist.praxisName, changedAt: new Date().toISOString() }, ...(therapist.previousPraxisNames || [])];
      }
    }
    
    const oldAddrStr = `${therapist.adresse || ''}, ${therapist.land || ''}`.trim();
    const newAddrStr = `${adresse}, ${land}`.trim();
    if (oldAddrStr !== newAddrStr && oldAddrStr !== ',') {
      if (therapist.adresse || therapist.land) {
        updates.previousAddresses = [{ value: oldAddrStr, changedAt: new Date().toISOString() }, ...(therapist.previousAddresses || [])];
      }
    }

    const updated = updateTherapist(therapist.id, updates);
    if (updated) {
      if (onUpdated) onUpdated(updated);
      setPasswordInput('');
      setConfirmPasswordInput('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const localeMap: Record<string, string> = {
        de: 'de-DE',
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        it: 'it-IT',
        el: 'el-GR',
        ru: 'ru-RU',
      };
      return new Date(isoString).toLocaleDateString(localeMap[language] || 'de-DE', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return isoString; }
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="therapist-profile-editor">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('tabTherapistProfile')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {therapist.vorname} {therapist.nachname}
            </h2>
            <p className="text-teal-100/80 text-sm mt-1 flex items-center gap-2 flex-wrap">
              <Building2 className="w-4 h-4 text-teal-400" />
              {therapist.praxisName || t('regPlaceholderPraxis')}
              <span className="text-slate-400">•</span>
              <Calendar className="w-4 h-4 text-teal-400" />
              {t('memberSince')} {formatDate(therapist.registeredAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={!hasAnyChanges}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-sm ${
                hasAnyChanges
                  ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold cursor-pointer shadow-teal-500/20'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              {t('profileSaveAllBtn')}
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-3 bg-teal-500/20 border border-teal-400/40 rounded-xl flex items-center gap-2 text-sm text-teal-200 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-teal-300 flex-shrink-0" />
            <span>{t('profileSaveSuccess')}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-400/40 rounded-xl flex items-center gap-2 text-sm text-red-200 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* 0. SPRACHEINSTELLUNGEN / LANGUAGE PREFERENCES */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm" id="profile-language-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-600" />
              {t('userPanelLanguageTitle')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('userPanelLanguageDesc')}
            </p>
          </div>
          {langChangeSuccess ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 shrink-0 animate-fadeIn">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              {t('languageSavedSuccess')}
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-100 shrink-0">
              {t('languagePersistHint')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {LANGUAGES.map((lang) => {
            const isActive = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                id={`profile-lang-btn-${lang.code}`}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span className="text-2xl shrink-0" role="img" aria-label={lang.nativeName}>
                  {lang.flag}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold truncate ${isActive ? 'text-teal-950' : 'text-slate-800'}`}>
                      {lang.nativeName}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 ml-1" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {lang.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 0.1 BERUFSGRUPPE & RECHTSSICHERE TERMINOLOGIE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm" id="profile-role-terminology-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-600" />
              {t('roleSectionTitle')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              {t('roleSectionDesc')}
            </p>
          </div>
          {roleSavedSuccess ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 shrink-0 animate-fadeIn">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              {t('terminologySavedSuccess')}
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-100 shrink-0 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              {t('therapistTabRoleTitle')}
            </span>
          )}
        </div>

        {/* Role Selection Grid */}
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
              {t('roleLabel')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(
                [
                  { id: 'heilpraktiker', labelKey: 'roleHeilpraktiker', descKey: 'roleHeilpraktikerDesc' },
                  { id: 'arzt', labelKey: 'roleArzt', descKey: 'roleArztDesc' },
                  { id: 'berater', labelKey: 'roleBerater', descKey: 'roleBeraterDesc' },
                  { id: 'therapeut', labelKey: 'roleTherapeut', descKey: 'roleTherapeutDesc' },
                  { id: 'tierheilpraktiker', labelKey: 'roleTierheilpraktiker', descKey: 'roleTierheilpraktikerDesc' },
                ] as const
              ).map((item) => {
                const isSelected = selectedRole === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    id={`profile-role-btn-${item.id}`}
                    onClick={() => handleRoleQuickSelect(item.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-sm font-bold ${isSelected ? 'text-teal-950' : 'text-slate-800'}`}>
                        {t(item.labelKey as any)}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 mt-1" />
                      )}
                    </div>
                    <span className="text-[11px] leading-relaxed text-slate-500">
                      {t(item.descKey as any)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Terminology Toggle (Patient vs Klient) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-teal-600" />
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {t('terminologyPreferenceLabel')}
              </label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              <button
                type="button"
                id="profile-term-patient-btn"
                onClick={() => handleTerminologyQuickSelect('patient')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedTerminology === 'patient'
                    ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-slate-900 mb-0.5">
                    {t('terminologyPatient')}
                  </div>
                  <div className="text-xs text-slate-500">
                    Patient • Patientenkartei • Fallberichte
                  </div>
                </div>
                {selectedTerminology === 'patient' && (
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 ml-2" />
                )}
              </button>

              <button
                type="button"
                id="profile-term-klient-btn"
                onClick={() => handleTerminologyQuickSelect('klient')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedTerminology === 'klient'
                    ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-slate-900 mb-0.5">
                    {t('terminologyKlient')}
                  </div>
                  <div className="text-xs text-slate-500">
                    Klient • Klientenkartei • Beratungsakte
                  </div>
                </div>
                {selectedTerminology === 'klient' && (
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 ml-2" />
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
              {t('terminologyAutoHint')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8">
        {/* 1. KONTAKTDATEN */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-teal-600" />
                {t('profileContactManagementTitle')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('profileContactManagementDesc')}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-100 shrink-0">
              {t('historyTracking')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* E-Mail Section */}
            <div className="space-y-4 relative">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-600" />
                {t('profileActiveEmailLabel')}
              </h4>
              <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 relative">
                <label className="block text-xs font-semibold text-teal-800 mb-1.5">
                  {t('profileNewEmailTitle')}
                </label>
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-700">
                    {t('profileActiveBadge')}
                  </span>
                </div>
                <div className="relative mt-2">
                  <Mail className="w-4 h-4 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-teal-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-bold shadow-sm"
                  />
                </div>
                <p className="text-[11px] text-teal-600/80 mt-2">
                  {t('profileEmailPurposeDesc')}
                </p>
              </div>

              {therapist.previousEmails && therapist.previousEmails.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <h5 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    {t('profilePreviousEmailsTitle')}
                  </h5>
                  <div className="space-y-2">
                    {therapist.previousEmails.map((hist, idx) => (
                      <div key={idx} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-slate-500 text-sm line-through">{hist.value}</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-600 uppercase tracking-wider">
                            {t('profileDeactivatedBadge')}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {t('profileChangedOn')}: {formatDate(hist.changedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Phone Section */}
            <div className="space-y-4 relative md:border-l md:border-slate-100 md:pl-8">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-600" />
                {t('profileActivePhoneLabel')}
              </h4>
              <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 relative">
                <label className="block text-xs font-semibold text-teal-800 mb-1.5">
                  {t('profileNewPhoneTitle')}
                </label>
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-700">
                    {t('profileActiveBadge')}
                  </span>
                </div>
                <div className="relative mt-2">
                  <Phone className="w-4 h-4 text-teal-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-teal-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-bold shadow-sm"
                  />
                </div>
                <p className="text-[11px] text-teal-600/80 mt-2">
                  {t('profilePhonePurposeDesc')}
                </p>
              </div>

              {therapist.previousPhones && therapist.previousPhones.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <h5 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    {t('profilePreviousPhonesTitle')}
                  </h5>
                  <div className="space-y-2">
                    {therapist.previousPhones.map((hist, idx) => (
                      <div key={idx} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-slate-500 text-sm line-through">{hist.value}</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-600 uppercase tracking-wider">
                            {t('profileDeactivatedBadge')}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {t('profileChangedOn')}: {formatDate(hist.changedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. PERSÖNLICHE STAMMDATEN & PRAXISDATEN */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                {t('profilePersonalDataTitle')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('profilePersonalDataDesc')}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-100 shrink-0">
              {t('historyTracking')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vorname */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('regFirstName')} *
              </label>
              <input
                type="text"
                value={therapist.vorname}
                readOnly
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            {/* Nachname */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  {t('regLastName')} *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setNameChangeForm({ vorname: therapist.vorname, nachname: therapist.nachname, reason: '' });
                    setIsNameModalOpen(true);
                  }}
                  className="text-[10px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded transition-colors border border-teal-200 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  {t('profileRequestNameChange')}
                </button>
              </div>
              <input
                type="text"
                value={therapist.nachname}
                readOnly
                disabled
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            {/* Praxisname */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('regPraxisName')}
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={praxisName}
                  onChange={(e) => setPraxisName(e.target.value)}
                  placeholder={t('regPlaceholderPraxis')}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            {/* Praxisadresse */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('regAddress')}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder={t('regPlaceholderAddress')}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            {/* Land */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('regCountry')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-base">
                  {getCountryFlag(land)}
                </div>
                <select
                  value={land}
                  onChange={(e) => setLand(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium cursor-pointer"
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
            </div>
          </div>

          {/* HISTORY SECTION FOR MASTER DATA */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-slate-400" />
              {t('profileLoggedChanges')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Names History */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-600">{t('profileFirstAndLastName')}</h5>
                {(!therapist.previousNames || therapist.previousNames.length === 0) ? (
                  <div className="text-[11px] text-slate-400 italic p-3 bg-slate-50 rounded-lg border border-slate-100">
                    {t('profileNoPreviousNames')}
                  </div>
                ) : (
                  therapist.previousNames.map((item, idx) => (
                    <div key={`name-${idx}`} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-mono line-through text-slate-500 text-xs">{item.value}</span>
                      <span className="text-[10px] text-slate-400">{t('profileChangedOn')}: {formatDate(item.changedAt)}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Praxis / Address History */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-600">{t('profilePraxisNameTitle')}</h5>
                  {(!therapist.previousPraxisNames || therapist.previousPraxisNames.length === 0) ? (
                    <div className="text-[11px] text-slate-400 italic p-3 bg-slate-50 rounded-lg border border-slate-100">
                      {t('profileNoPreviousPraxisNames')}
                    </div>
                  ) : (
                    therapist.previousPraxisNames.map((item, idx) => (
                      <div key={`praxis-${idx}`} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-mono line-through text-slate-500 text-xs">{item.value}</span>
                        <span className="text-[10px] text-slate-400">{t('profileChangedOn')}: {formatDate(item.changedAt)}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-600">{t('profileLocationAddressTitle')}</h5>
                  {(!therapist.previousAddresses || therapist.previousAddresses.length === 0) ? (
                    <div className="text-[11px] text-slate-400 italic p-3 bg-slate-50 rounded-lg border border-slate-100">
                      {t('profileNoPreviousAddresses')}
                    </div>
                  ) : (
                    therapist.previousAddresses.map((item, idx) => (
                      <div key={`addr-${idx}`} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-mono line-through text-slate-500 text-xs">{item.value}</span>
                        <span className="text-[10px] text-slate-400">{t('profileChangedOn')}: {formatDate(item.changedAt)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. SICHERHEIT */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-teal-600" />
              {t('profileSecurityTitle')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('profileSecurityDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('profileNewPasswordLabel')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder={t('profileMin6Chars')}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('regConfirmPassword')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder={t('regConfirmPassword')}
                  className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-sm text-slate-900 font-medium transition-colors ${
                    confirmPasswordInput && passwordInput !== confirmPasswordInput
                      ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-slate-300 focus:ring-teal-500 focus:border-teal-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={!hasAnyChanges}
            className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-sm ${
              hasAnyChanges
                ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-teal-600/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            {t('profileSaveAllBtn')}
          </button>
        </div>
      </form>

      {/* Name Change Modal */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-600" />
                {t('reqNameChangeModalTitle') || 'Namensänderung beantragen'}
              </h3>
              <button 
                onClick={() => { setIsNameModalOpen(false); setNameChangeSuccess(false); }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {nameChangeSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6 text-teal-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">{t('reqNameChangeSent') || 'Antrag erfolgreich gesendet'}</h4>
                  <p className="text-sm text-slate-500">
                    {t('reqNameChangeSentDesc') || 'Der Administrator wurde benachrichtigt und wird Ihre Namensänderung in Kürze prüfen.'}
                  </p>
                  <button
                    onClick={() => { setIsNameModalOpen(false); setNameChangeSuccess(false); }}
                    className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg text-sm transition-colors cursor-pointer"
                  >
                    {t('close')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>{t('reqNameChangeWarning') || 'Aus Sicherheits- und Rechnungsgründen müssen Namensänderungen durch einen Administrator bestätigt werden.'}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{t('reqNewFirstName') || 'Neuer Vorname'}</label>
                      <input 
                        type="text" 
                        value={nameChangeForm.vorname}
                        onChange={(e) => setNameChangeForm({...nameChangeForm, vorname: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{t('reqNewLastName') || 'Neuer Nachname'}</label>
                      <input 
                        type="text" 
                        value={nameChangeForm.nachname}
                        onChange={(e) => setNameChangeForm({...nameChangeForm, nachname: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{t('reqReason') || 'Grund der Änderung'}</label>
                      <textarea 
                        value={nameChangeForm.reason}
                        onChange={(e) => setNameChangeForm({...nameChangeForm, reason: e.target.value})}
                        placeholder={t('reqReasonPlaceholder') || 'z.B. Heirat, Namensänderung...'}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsNameModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="button"
                      disabled={!nameChangeForm.vorname || !nameChangeForm.nachname || !nameChangeForm.reason}
                      onClick={() => {
                        addNameChangeRequest({
                          therapistId: therapist.id,
                          therapistEmail: therapist.email,
                          oldVorname: therapist.vorname,
                          oldNachname: therapist.nachname,
                          requestedVorname: nameChangeForm.vorname,
                          requestedNachname: nameChangeForm.nachname,
                          reason: nameChangeForm.reason
                        });
                        setNameChangeSuccess(true);
                      }}
                      className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                    >
                      {t('reqSubmitBtn') || 'Antrag absenden'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
