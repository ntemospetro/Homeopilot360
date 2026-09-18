import React, { createContext, useContext, useState, useEffect } from 'react';
import { getActiveTherapist, updateTherapist } from '../services/storage';
import { useTranslation } from './LanguageContext';
import { TranslationKey } from './translations';

export type ProfessionalRole = 'heilpraktiker' | 'arzt' | 'berater' | 'therapeut' | 'tierheilpraktiker';
export type TerminologyChoice = 'klient' | 'patient';

interface TerminologyContextType {
  role: ProfessionalRole;
  terminology: TerminologyChoice;
  setRoleAndTerminology: (role: ProfessionalRole, terminology: TerminologyChoice) => void;
  termPatient: string; // e.g. "Patient" or "Klient"
  termPatients: string; // e.g. "Patienten" or "Klienten"
  termPatientenkartei: string; // e.g. "Patientenkartei" or "Klientenkartei"
  termPatientCase: string; // e.g. "Patientenfall" or "Klientenfall"
  termPatientRecord: string; // e.g. "Patientenakte" or "Klientenakte"
}

const TerminologyContext = createContext<TerminologyContextType | undefined>(undefined);

export const TerminologyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, language } = useTranslation();

  const [role, setRole] = useState<ProfessionalRole>(() => {
    const active = getActiveTherapist();
    return active?.professionalRole || 'heilpraktiker';
  });

  const [terminology, setTerminology] = useState<TerminologyChoice>(() => {
    const active = getActiveTherapist();
    if (active?.terminologyPreference) return active.terminologyPreference;
    if (active?.professionalRole === 'berater') return 'klient';
    return 'patient';
  });

  // Listen for storage or therapist change
  useEffect(() => {
    const syncWithTherapist = () => {
      const active = getActiveTherapist();
      if (active) {
        if (active.professionalRole && active.professionalRole !== role) {
          setRole(active.professionalRole);
        }
        if (active.terminologyPreference && active.terminologyPreference !== terminology) {
          setTerminology(active.terminologyPreference);
        }
      }
    };

    window.addEventListener('homoeo_therapist_updated', syncWithTherapist);
    window.addEventListener('storage', syncWithTherapist);
    return () => {
      window.removeEventListener('homoeo_therapist_updated', syncWithTherapist);
      window.removeEventListener('storage', syncWithTherapist);
    };
  }, [role, terminology]);

  const setRoleAndTerminology = (newRole: ProfessionalRole, newTerm: TerminologyChoice) => {
    setRole(newRole);
    setTerminology(newTerm);
    const active = getActiveTherapist();
    if (active) {
      updateTherapist(active.id, {
        professionalRole: newRole,
        terminologyPreference: newTerm,
      });
      window.dispatchEvent(new Event('homoeo_therapist_updated'));
    }
  };

  // Compute terms according to language and terminologyChoice
  const isKlient = terminology === 'klient';

  const termPatient = isKlient
    ? (language === 'de' ? 'Klient' : language === 'en' ? 'Client' : language === 'fr' ? 'Client' : language === 'es' ? 'Cliente' : language === 'it' ? 'Cliente' : language === 'el' ? 'Πελάτης' : 'Клиент')
    : (language === 'de' ? 'Patient' : language === 'en' ? 'Patient' : language === 'fr' ? 'Patient' : language === 'es' ? 'Paciente' : language === 'it' ? 'Paziente' : language === 'el' ? 'Ασθενής' : 'Пациент');

  const termPatients = isKlient
    ? (language === 'de' ? 'Klienten' : language === 'en' ? 'Clients' : language === 'fr' ? 'Clients' : language === 'es' ? 'Clientes' : language === 'it' ? 'Clienti' : language === 'el' ? 'Πελάτες' : 'Клиенты')
    : (language === 'de' ? 'Patienten' : language === 'en' ? 'Patients' : language === 'fr' ? 'Patients' : language === 'es' ? 'Pacientes' : language === 'it' ? 'Pazienti' : language === 'el' ? 'Ασθενείς' : 'Пациенты');

  const termPatientenkartei = isKlient
    ? (language === 'de' ? 'Klientenkartei' : language === 'en' ? 'Client Directory' : language === 'fr' ? 'Répertoire des clients' : language === 'es' ? 'Directorio de clientes' : language === 'it' ? 'Archivio clienti' : language === 'el' ? 'Αρχείο Πελατών' : 'Картотека клиентов')
    : (language === 'de' ? 'Patientenkartei' : language === 'en' ? 'Patient Directory' : language === 'fr' ? 'Répertoire des patients' : language === 'es' ? 'Directorio de pacientes' : language === 'it' ? 'Archivio pazienti' : language === 'el' ? 'Αρχείο Ασθενών' : 'Картотека пациентов');

  const termPatientCase = isKlient
    ? (language === 'de' ? 'Klientenfall' : language === 'en' ? 'Client Case' : language === 'fr' ? 'Cas client' : language === 'es' ? 'Caso de cliente' : language === 'it' ? 'Caso cliente' : language === 'el' ? 'Υπόθεση Πελάτη' : 'Случай клиента')
    : (language === 'de' ? 'Patientenfall' : language === 'en' ? 'Patient Case' : language === 'fr' ? 'Cas patient' : language === 'es' ? 'Caso de paciente' : language === 'it' ? 'Caso paziente' : language === 'el' ? 'Υπόθεση Ασθενούς' : 'Случай пациента');

  const termPatientRecord = isKlient
    ? (language === 'de' ? 'Klientenakte' : language === 'en' ? 'Client Record' : language === 'fr' ? 'Dossier client' : language === 'es' ? 'Expediente del cliente' : language === 'it' ? 'Cartella cliente' : language === 'el' ? 'Φάκελος Πελάτη' : 'Карточка клиента')
    : (language === 'de' ? 'Patientenakte' : language === 'en' ? 'Patient Record' : language === 'fr' ? 'Dossier patient' : language === 'es' ? 'Expediente del paciente' : language === 'it' ? 'Cartella paziente' : language === 'el' ? 'Φάκελος Ασθενούς' : 'Карточка пациента');

  return (
    <TerminologyContext.Provider
      value={{
        role,
        terminology,
        setRoleAndTerminology,
        termPatient,
        termPatients,
        termPatientenkartei,
        termPatientCase,
        termPatientRecord,
      }}
    >
      {children}
    </TerminologyContext.Provider>
  );
};

export const useTerminology = (): TerminologyContextType => {
  const context = useContext(TerminologyContext);
  if (!context) {
    // Fallback safe defaults if used outside provider
    return {
      role: 'heilpraktiker',
      terminology: 'patient',
      setRoleAndTerminology: () => {},
      termPatient: 'Patient',
      termPatients: 'Patienten',
      termPatientenkartei: 'Patientenkartei',
      termPatientCase: 'Patientenfall',
      termPatientRecord: 'Patientenakte',
    };
  }
  return context;
};
