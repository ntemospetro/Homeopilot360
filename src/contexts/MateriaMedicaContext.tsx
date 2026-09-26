import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocalizedRemedy } from '../data/materiaMedicaData';
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
  const [allRemedies, setAllRemedies] = useState<LocalizedRemedy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRemedies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/materia-medica?lang=${language}`);
      if (!response.ok) throw new Error('Failed to fetch Materia Medica data');
      const data = await response.json();
      setAllRemedies(data);
    } catch (err: any) {
      console.error('Materia Medica fetch error:', err);
      setError(err.message || 'Error loading remedies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
