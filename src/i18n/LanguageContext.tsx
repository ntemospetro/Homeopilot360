import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LanguageCode, LanguageOption } from '../types';
import { LANGUAGES, translations, TranslationKey } from './translations';
import { getActiveTherapist, updateTherapist } from '../services/storage';
import {
  DetectedCountryInfo,
  getInstantDetectedLanguage,
  detectUserCountryAndLanguage,
  isUserManualLanguageSelected,
  setUserManualLanguageSelected,
  getCachedDetectedCountry,
} from '../services/countryLanguageDetector';

const STORAGE_LANG_KEY = 'homoeo_saas_language_v1';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode, persistForUser?: boolean) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  languages: LanguageOption[];
  currentLanguageOption: LanguageOption;
  detectedCountry: DetectedCountryInfo | null;
  isAutoDetected: boolean;
  resetToAutoLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [detectedCountry, setDetectedCountry] = useState<DetectedCountryInfo | null>(() => {
    return getCachedDetectedCountry() || getInstantDetectedLanguage();
  });

  const getInitialLanguage = (): LanguageCode => {
    try {
      const activeTh = getActiveTherapist();
      if (activeTh?.preferredLanguage && LANGUAGES.some(l => l.code === activeTh.preferredLanguage)) {
        return activeTh.preferredLanguage;
      }
      
      const isManual = isUserManualLanguageSelected();
      const stored = localStorage.getItem(STORAGE_LANG_KEY) as LanguageCode | null;
      if (isManual && stored && LANGUAGES.some(l => l.code === stored)) {
        return stored;
      }

      // Automatic country/location detection
      const instant = getInstantDetectedLanguage();
      if (instant && LANGUAGES.some(l => l.code === instant.language)) {
        return instant.language;
      }

      if (stored && LANGUAGES.some(l => l.code === stored)) {
        return stored;
      }
    } catch {
      // fallback
    }
    return 'de';
  };

  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage);
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(!isUserManualLanguageSelected());

  // Detect country asynchronously and apply if not manually overridden
  useEffect(() => {
    let isCancelled = false;
    detectUserCountryAndLanguage().then((info) => {
      if (!isCancelled && info) {
        setDetectedCountry(info);
        if (!isUserManualLanguageSelected()) {
          setLanguageState(info.language);
          setIsAutoDetected(true);
          try {
            localStorage.setItem(STORAGE_LANG_KEY, info.language);
          } catch {}
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Sync with active therapist preference on therapist change
  useEffect(() => {
    const handleTherapistChange = () => {
      const activeTh = getActiveTherapist();
      if (activeTh?.preferredLanguage && LANGUAGES.some(l => l.code === activeTh.preferredLanguage)) {
        setLanguageState(activeTh.preferredLanguage);
        setUserManualLanguageSelected(true);
        setIsAutoDetected(false);
        localStorage.setItem(STORAGE_LANG_KEY, activeTh.preferredLanguage);
      }
    };

    window.addEventListener('homoeo_active_therapist_changed', handleTherapistChange);
    return () => {
      window.removeEventListener('homoeo_active_therapist_changed', handleTherapistChange);
    };
  }, []);

  const setLanguage = useCallback((newLang: LanguageCode, persistForUser = true) => {
    setLanguageState(newLang);
    setUserManualLanguageSelected(true);
    setIsAutoDetected(false);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, newLang);
      if (persistForUser) {
        const activeTh = getActiveTherapist();
        if (activeTh) {
          updateTherapist(activeTh.id, { preferredLanguage: newLang });
        }
      }
    } catch {
      // storage error safe
    }
  }, []);

  const resetToAutoLanguage = useCallback(() => {
    setUserManualLanguageSelected(false);
    setIsAutoDetected(true);
    const instant = getInstantDetectedLanguage();
    setDetectedCountry(instant);
    setLanguageState(instant.language);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, instant.language);
    } catch {}
  }, []);

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.de;
    let template = (langDict as Record<string, string>)[key] || (translations.de as Record<string, string>)[key] || key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return template;
  }, [language]);

  const currentLanguageOption = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: LANGUAGES,
        currentLanguageOption,
        detectedCountry,
        isAutoDetected,
        resetToAutoLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export const useLanguage = useTranslation;

