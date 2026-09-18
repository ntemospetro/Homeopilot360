import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageCode } from '../types';
import { Globe, Check, ChevronDown, Sparkles, MapPin, RotateCcw } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'compact' | 'dropdown' | 'full-card';
  showLabel?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  showLabel = false,
  className = '',
}) => {
  const {
    language,
    setLanguage,
    languages,
    currentLanguageOption,
    detectedCountry,
    isAutoDetected,
    resetToAutoLanguage,
    t,
  } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code, true);
    setIsOpen(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleResetToAuto = () => {
    resetToAutoLanguage();
    setIsOpen(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  // 1. FULL CARD VARIANT FOR USERPANEL / THERAPIST SETTINGS
  if (variant === 'full-card') {
    return (
      <div id="userpanel-language-settings-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 flex-wrap">
                <span>{t('userPanelLanguageTitle')}</span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {currentLanguageOption.label}
                </span>
                {detectedCountry && (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isAutoDetected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{detectedCountry.countryName}</span>
                    {isAutoDetected && <span className="text-[9px] font-bold">({t('autoLanguageDetectedBadge')})</span>}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {detectedCountry && isAutoDetected
                  ? t('autoLanguageDetectedDesc', { country: detectedCountry.countryName, language: currentLanguageOption.nativeName })
                  : t('userPanelLanguageDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAutoDetected && (
              <button
                type="button"
                onClick={handleResetToAuto}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
                title={t('btnAutoDetectLanguage')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('btnAutoDetectLanguage')}</span>
              </button>
            )}

            {showSavedToast && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">{t('languageSavedSuccess')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Language Grid (Ordered with Flag & Native + German/English label) */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                id={`lang-btn-${lang.code}`}
                onClick={() => handleSelectLanguage(lang.code)}
                type="button"
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isSelected
                    ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xl leading-none" role="img" aria-label={lang.label}>
                    {lang.flag}
                  </span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <div className={`text-xs font-bold ${isSelected ? 'text-teal-950' : 'text-slate-800'}`}>
                    {lang.nativeName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {lang.label} ({lang.code.toUpperCase()})
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-400 bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{t('languagePersistHint')}</span>
          </div>
          <span className="font-mono font-medium text-slate-500">
            {currentLanguageOption.flag} {currentLanguageOption.nativeName}
          </span>
        </div>
      </div>
    );
  }

  // 2. COMPACT SELECTOR (e.g. for Test Navigation or small toolbars)
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {showLabel && <span className="text-slate-400 text-xs">{t('language')}:</span>}
        <select
          id="compact-language-select"
          value={language}
          onChange={(e) => handleSelectLanguage(e.target.value as LanguageCode)}
          className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-teal-500 cursor-pointer"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.nativeName} ({l.label})
            </option>
          ))}
        </select>
      </div>
    );
  }

  // 3. DROPDOWN (Default for Header & Frontseite)
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        id="header-language-dropdown-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">{currentLanguageOption.flag}</span>
        <span className="font-bold text-slate-800">{currentLanguageOption.code.toUpperCase()}</span>
        <span className="hidden md:inline text-slate-600 text-[11px]">({currentLanguageOption.nativeName})</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
      </button>

      {isOpen && (
        <div 
          id="header-language-menu"
          className="absolute right-0 mt-1.5 w-60 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('selectLanguage')}
            </span>
            <span className="text-[10px] text-teal-600 font-medium">7 Sprachen</span>
          </div>

          {detectedCountry && (
            <div className="px-3 py-1.5 mx-1.5 mb-1 bg-teal-50/70 border border-teal-100 rounded-lg flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-teal-900 truncate">
                <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                <span className="truncate">{detectedCountry.countryName}</span>
              </div>
              {!isAutoDetected ? (
                <button
                  type="button"
                  onClick={handleResetToAuto}
                  className="text-[10px] font-bold text-teal-700 hover:text-teal-900 underline ml-2 shrink-0 cursor-pointer"
                >
                  {t('btnAutoDetectLanguage')}
                </button>
              ) : (
                <span className="text-[9px] font-bold text-teal-600 shrink-0">
                  {t('autoLanguageDetectedBadge')}
                </span>
              )}
            </div>
          )}

          <div className="max-h-64 overflow-y-auto py-0.5">
            {languages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  id={`dropdown-lang-${lang.code}`}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 text-teal-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg leading-none">{lang.flag}</span>
                    <div>
                      <div className="font-medium leading-snug">{lang.nativeName}</div>
                      <div className="text-[10px] text-slate-400">{lang.label}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="px-3 pt-2 pb-1 border-t border-slate-100 mt-1 text-[10px] text-slate-400 text-center">
            {t('languagePersistHint')}
          </div>
        </div>
      )}
    </div>
  );
};
