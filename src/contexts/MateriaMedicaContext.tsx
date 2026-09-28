import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocalizedRemedy, getLocalizedRemedies } from '../data/materiaMedicaData';
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
  // Pre-initialize with synchronous local dataset so remedies are never empty
  const [allRemedies, setAllRemedies] = useState<LocalizedRemedy[]>(() => {
    return getLocalizedRemedies(language);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRemedies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/materia-medica?lang=${language}`);
      if (!response.ok) throw new Error('Failed to fetch Materia Medica data');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setAllRemedies(data);
      } else {
        setAllRemedies(getLocalizedRemedies(language));
      }
    } catch (err: any) {
      // Graceful fallback to bundled dataset (vital for Hostinger or static deployments)
      setAllRemedies(getLocalizedRemedies(language));
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setAllRemedies(getLocalizedRemedies(language));
    fetchRemedies();
  }, [language]);

  return (
    <MateriaMedicaContext.Provider value={{ allRemedies, isLoading, error, refresh: fetchRemedies }}>
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
