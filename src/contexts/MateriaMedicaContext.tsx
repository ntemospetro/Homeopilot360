import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocalizedRemedy } from '../data/materiaMedicaData';
import { getLocalizedRemedies } from '../data/materiaMedicaDatabase';
import { useTranslation } from '../i18n/LanguageContext';

interface MateriaMedicaContextType {
  allRemedies: LocalizedRemedy[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const MateriaMedicaContext = createContext<MateriaMedicaContextType | undefined>(undefined);

export const MateriaMedicaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { language } = useTranslation();
  // Always synchronously initialized and updated with the complete 702-remedy dataset
  const [allRemedies, setAllRemedies] = useState<LocalizedRemedy[]>(() => {
    return getLocalizedRemedies(language);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Instantly sync remedies when language changes - zero latency, zero network requests, zero 404 errors
  useEffect(() => {
    const local = getLocalizedRemedies(language);
    if (local && local.length > 0) {
      setAllRemedies(local);
    }
  }, [language]);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const local = getLocalizedRemedies(language);
      if (local && local.length > 0) {
        setAllRemedies(local);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MateriaMedicaContext.Provider value={{ allRemedies, isLoading, error, refresh }}>
      {children}
    </MateriaMedicaContext.Provider>
  );
};

export const useMateriaMedica = () => {
  const context = useContext(MateriaMedicaContext);
  if (context === undefined) {
    throw new Error('useMateriaMedica must be used within a MateriaMedicaProvider');
  }
  return context;
};
