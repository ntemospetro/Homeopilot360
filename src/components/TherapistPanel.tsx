import Markdown from 'react-markdown';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Therapist, PatientCase, PatientChild, AnamnesisQuestion, FullClinicalAnalysis } from '../types';
import { 
  getPatientCases, 
  savePatientCase, 
  deletePatientCase,
  incrementAnalysesUsed,
  checkTherapistLimit,
  getStoredTherapistTab,
  setStoredTherapistTab,
  getRecentlyEditedPatientNames,
  getTariffAccessForTherapist,
  isFeatureLimitReached,
  incrementTherapistUsage
} from '../services/storage';
import { navigateTo, openModal, closeModal } from '../services/navigation';
import { runHomeopathyAnalysis, HomeoRemedyResult } from '../services/homeopathyEngine';
import { generateFullClinicalAnalysis } from '../services/clinicalAnalysisService';
import { 
  generateQuestionsForComplaint, 
  summarizeQuestionsToAnamnese,
  splitMultipleComplaints,
  SCALE_LABELS_1_TO_4 
} from '../services/complaintQuestionGenerator';
import { useTranslation, useLanguage } from '../i18n/LanguageContext';
import { useTerminology } from '../i18n/TerminologyContext';
import { TranslationKey } from '../i18n/translations';
import { localizeStructuredMedication } from '../services/medicationLocalization';
import { COMMON_MEDICATIONS_DB } from '../services/medicationDatabase';
import { anamnesisSchema } from '../data/anamnesisSchema';
import { CaseAnalysisModal } from './CaseAnalysisModal';
import { ExtendedAnamnesisWizard } from './ExtendedAnamnesisWizard';
import { ComplaintQuestionsWizardModal } from './ComplaintQuestionsWizardModal';
import { runHahnemannAnalysis, HahnemannAnalysisResult, Hahnemann6Pillars } from '../services/hahnemannEngineService';
import { FindingsWizardModal } from './FindingsWizardModal';
import { MedicationsWizardModal } from './MedicationsWizardModal';
import { UpgradeModal } from './UpgradeModal';
import { PatientSelectionModal } from './PatientSelectionModal';
import { TherapistProfileEditor } from './TherapistProfileEditor';
import { TherapistTariffManager } from './TherapistTariffManager';
import { DynamicComplaintQuestions } from './DynamicComplaintQuestions';
import { VoiceInputButton } from './VoiceInputButton';
import { MedicationLiveInput } from './MedicationLiveInput';
import { ComprehensiveAnalysisView } from './ComprehensiveAnalysisView';
import { TherapyRecommendationsView } from './TherapyRecommendationsView';
import { PatientDirectoryView } from './PatientDirectoryView';
import { MateriaMedicaView } from './MateriaMedicaView';
import { RepertoriumView } from './RepertoriumView';
import { AcuteIntakeView } from './AcuteIntakeView';
import { MedicationResearchView } from './MedicationResearchView';
import { UserManualView } from './UserManualView';
import { StammdatenModal } from './StammdatenModal';
import { TherapistLogin } from './TherapistLogin';
import { getCountryFlag } from '../data/countries';
import { exportComprehensiveAnalysisToPDF } from '../services/pdfExportService';
import { 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  FileText, 
  User, 
  Calendar, 
  HeartHandshake, 
  Save, 
  Plus, 
  FolderOpen,
  Trash2, LayoutDashboard, Settings, LogOut, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  BookOpen, 
  Stethoscope,
  Clock,
  Zap,
  Search,
  Layers,
  ArrowRight,
  ArrowLeft,
  Check,
  Edit3,
  ListOrdered,
  Activity,
  Smile,
  Thermometer,
  Pill,
  Baby,
  Ruler,
  Users,
  UserX,
  MessageSquare,
  FileDown,
  Mail,
  Phone,
  Heart,
  UserCheck,
  UserPlus,
  Mic,
  X,
  PanelLeft,
  Loader2,
} from 'lucide-react';

interface TherapistPanelProps {
  therapist: Therapist | null;
  onGoToAdmin: () => void;
  onGoToRegister: () => void;
  onLogout?: () => void;
}

const COMMON_MEDICATIONS = [
  "Aspirin", "Ibuprofen", "Paracetamol", "Pantoprazol", "L-Thyroxin",
  "Ramipril", "Metoprolol", "Amlodipin", "Simvastatin", "Atorvastatin",
  "Metformin", "Novalgin", "Diclofenac", "Citalopram", "Sertralin",
  "Mirtazapin", "Omeprazol", "Bisoprolol", "Valsartan", "Candesartan",
  "Hydrochlorothiazid (HCT)", "Torasemid", "Furosemid", "Spironolacton",
  "Salbutamol", "Formoterol", "Budesonid", "Fluticason", "Levothyroxin",
  "Marcumar (Phenprocoumon)", "Eliquis (Apixaban)", "Xarelto (Rivaroxaban)",
  "Lixiana (Edoxaban)", "Clopidogrel", "ASS 100", "Allopurinol",
  "Pregabalin", "Gabapentin", "Amitriptylin", "Duloxetin", "Venlafaxin",
  "Escitalopram", "Fluoxetin", "Quetiapin", "Risperidon",
  "Lorazepam", "Diazepam", "Zopiclon", "Zolpidem", "Tamsulosin",
  "Finasterid", "Loperamid", "Macrogol", "Lactulose", "Domperidon",
  "MCP (Metoclopramid)", "Ondansetron", "Dimenhydrinat (Vomex)",
  "Cetirizin", "Loratadin", "Desloratadin", "Fexofenadin", "Prednisolon",
  "Dexamethason", "Hydrocortison", "Amoxicillin", "Cefuroxim", "Ciprofloxacin",
  "Doxycyclin", "Azithromycin", "Clindamycin", "Cotrimoxazol"
].sort();

const BLANK_PATIENT_CASE: Partial<PatientCase> = {
  patientName: '',
  patientAge: undefined,
  patientBirthDate: '',
  patientGender: 'weiblich',
  patientWeightKg: undefined,
  patientMaritalStatus: '',
  patientEmail: '',
  patientPhone: '',
  patientHeightCm: undefined,
  isPregnant: false,
  pregnancyMonth: undefined,
  hasChildren: false,
  childrenCount: 0,
  childrenList: [],
  customStammdaten: [],
  hauptbeschwerde: '',
  spontanbericht: '',
  anamnesisQuestions: [],
  modalitaetenBesser: '',
  modalitaetenSchlechter: '',
  gemuetPsyche: '',
  koerperAllgemein: '',
  lokalsymptome: '',
  bisherigeMittel: '',
  extendedAnamnesis: {},
  befundGewuenscht: false,
  befundText: '',
  befundDetails: undefined,
  nimmtMedikamente: false,
  medikamenteList: [],
  analyzedAt: undefined,
  remedySuggestions: [],
  analysisNotes: '',
  clinicalAnalysis: undefined,
  initialPrescription: undefined,
  followUps: [],
};

export const TherapistPanel: React.FC<TherapistPanelProps> = ({
  therapist,
  onGoToAdmin,
  onGoToRegister,
  onLogout,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { t, language } = useTranslation();
  const { termPatientenkartei, termPatient, termPatients } = useTerminology();
  const [panelTab, setPanelTab] = useState<'cases' | 'patients' | 'materiamedica' | 'repertorium' | 'quickintake' | 'medications' | 'documentation' | 'profile' | 'tariff'>(() => getStoredTherapistTab());
  const [patientDirectoryAction, setPatientDirectoryAction] = useState<'new_patient' | 'select_patient' | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [lockedPageAttempt, setLockedPageAttempt] = useState<{ key: string; name: string } | null>(null);

  // Compute tariff access permissions & feature quotas
  const tariffAccess = useMemo(() => {
    return getTariffAccessForTherapist(therapist);
  }, [therapist]);

  const getPagePermissionKeyForTab = (tab: string): keyof import('../types').TariffPagePermissions | null => {
    switch (tab) {
      case 'cases':
        return 'cases';
      case 'patients':
        return 'patients';
      case 'quickintake':
        return 'quickintake';
      case 'materiamedica':
        return 'materiamedica';
      case 'repertorium':
        return 'repertorium';
      case 'medications':
        return 'medications';
      case 'documentation':
        return 'documentation';
      default:
        return null;
    }
  };

  const getPageDisplayName = (tab: string): string => {
    switch (tab) {
      case 'cases':
        return t('tabCaseManagement');
      case 'patients':
        return termPatientenkartei;
      case 'quickintake':
        return t('tabQuickIntake');
      case 'materiamedica':
        return t('tabMateriaMedica');
      case 'repertorium':
        return t('tabRepertorium');
      case 'medications':
        return t('tabMedications');
      case 'documentation':
        return t('tabDocumentation');
      default:
        return tab;
    }
  };

  const isTabAllowed = (tab: string): boolean => {
    const pageKey = getPagePermissionKeyForTab(tab);
    if (!pageKey) return true; // Profile, tariff always allowed
    return tariffAccess.isPageAllowed(pageKey);
  };

  const isTabHidden = (tab: string): boolean => {
    const pageKey = getPagePermissionKeyForTab(tab);
    if (!pageKey) return false;
    return tariffAccess.isPageHidden(pageKey);
  };

  const handleSelectTab = (tab: 'cases' | 'patients' | 'materiamedica' | 'repertorium' | 'quickintake' | 'medications' | 'documentation' | 'profile' | 'tariff') => {
    if (!isTabAllowed(tab)) {
      setLockedPageAttempt({ key: tab, name: getPageDisplayName(tab) });
      return;
    }
    setPanelTab(tab);
    navigateTo('therapist', { therapistTab: tab });
  };

  // Fallback if current active tab gets locked
  useEffect(() => {
    if (!isTabAllowed(panelTab)) {
      const allowedFallback = (['patients', 'cases', 'tariff', 'profile'] as const).find(t => isTabAllowed(t)) || 'tariff';
      setPanelTab(allowedFallback);
    }
  }, [tariffAccess, panelTab]);

  const handleForwardToNewPatient = () => {
    setPatientDirectoryAction('new_patient');
    handleSelectTab('patients');
  };

  const handleForwardToPatientDirectorySelection = () => {
    setPatientDirectoryAction('select_patient');
    handleSelectTab('patients');
  };

  useEffect(() => {
    setStoredTherapistTab(panelTab);
    window.dispatchEvent(new CustomEvent('homoeo_therapist_tab_changed', { detail: panelTab }));
  }, [panelTab]);
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [caseSearchQuery, setCaseSearchQuery] = useState('');

  // Form State - initialized completely blank
  const [currentCase, setCurrentCase] = useState<Partial<PatientCase>>({
    ...BLANK_PATIENT_CASE,
    anamneseDatum: new Date().toISOString().split('T')[0],
  });

  // Modal states
  const [isStammdatenModalOpen, setIsStammdatenModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isExtendedAnamnesisWizardOpen, setIsExtendedAnamnesisWizardOpen] = useState(false);
  const [isComplaintWizardModalOpen, setIsComplaintWizardModalOpen] = useState(false);
  const [isPreloadingWizard, setIsPreloadingWizard] = useState(false);
  const [wizardProgress, setWizardProgress] = useState(0);
  const [wizardStatusText, setWizardStatusText] = useState('');
  const [wizardPreloadedAnalysis, setWizardPreloadedAnalysis] = useState<HahnemannAnalysisResult | null>(null);
  const [isFindingsModalOpen, setIsFindingsModalOpen] = useState(false);
  const [isMedicationsModalOpen, setIsMedicationsModalOpen] = useState(false);
  const [medicationsModalAutoAddNew, setMedicationsModalAutoAddNew] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [limitExceededError, setLimitExceededError] = useState<{ featureName: string; limitValue: number } | null>(null);
  const [isNoMasterDataModalOpen, setIsNoMasterDataModalOpen] = useState(false);
  const [isPatientSelectionModalOpen, setIsPatientSelectionModalOpen] = useState(false);
  const [caseToDeleteId, setCaseToDeleteId] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<HomeoRemedyResult[]>([]);
  const [clinicalAnalysis, setClinicalAnalysis] = useState<FullClinicalAnalysis | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [deleteMedConfirmIndex, setDeleteMedConfirmIndex] = useState<number | null>(null);

  const handleDeleteMedicationFromCase = (indexToDelete: number) => {
    setCurrentCase(prev => {
      const currentList = prev.medikamenteList || [];
      const validMeds = currentList.filter(m => m.name && m.name.trim() !== '');
      const targetMed = validMeds[indexToDelete];
      const updatedList = currentList.filter(m => m !== targetMed);
      const updatedCase: Partial<PatientCase> = {
        ...prev,
        medikamenteList: updatedList,
        nimmtMedikamente: updatedList.some(m => m.name && m.name.trim() !== '')
      };
      if (prev.id) {
        const fullCaseToSave = {
          ...prev,
          ...updatedCase,
          therapistId: prev.therapistId || therapist.id,
          patientName: prev.patientName || '',
          anamneseDatum: prev.anamneseDatum || new Date().toISOString().split('T')[0],
          id: prev.id
        } as PatientCase;
        savePatientCase(fullCaseToSave);
        setCases(prevCases => prevCases.map(c => c.id === prev.id ? { ...c, ...updatedCase } as PatientCase : c));
      }
      return updatedCase;
    });
    setSaveToast(t('medListUpdatedSuccess' as TranslationKey) || t('toastExtendedAnamnesisSaved'));
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleStartComplaintWizard = async () => {
    if (!currentCase.hauptbeschwerde?.trim()) return;

    setIsPreloadingWizard(true);
    setWizardProgress(15);
    setWizardStatusText(t('wizardLoadingProgress'));

    const chief = currentCase.hauptbeschwerde.trim();
    const fullText = [
      chief,
      currentCase.spontanbericht ? `Spontanbericht: ${currentCase.spontanbericht}` : '',
      currentCase.lokalsymptome ? `Lokalsymptome: ${currentCase.lokalsymptome}` : '',
      currentCase.modalitaetenBesser ? `Besser durch: ${currentCase.modalitaetenBesser}` : '',
      currentCase.modalitaetenSchlechter ? `Schlechter durch: ${currentCase.modalitaetenSchlechter}` : '',
      currentCase.gemuetPsyche ? `Gemüt/Zustand: ${currentCase.gemuetPsyche}` : '',
    ].filter(Boolean).join('\n');

    const seedMatrix: Hahnemann6Pillars = {
      causa: null,
      lokalisierung: currentCase.lokalsymptome?.trim() || currentCase.hauptbeschwerde?.trim() || null,
      empfindung: null,
      modalitaeten: [
        currentCase.modalitaetenBesser ? `Besser: ${currentCase.modalitaetenBesser}` : '',
        currentCase.modalitaetenSchlechter ? `Schlechter: ${currentCase.modalitaetenSchlechter}` : '',
      ].filter(Boolean).join(', ') || null,
      begleitsymptome: [],
      gemuet: currentCase.gemuetPsyche?.trim() || null,
      strahlungsoptionen: null,
      ursaechlicher_zusammenhang: null,
      fruehere_behandlungen_und_historie: null,
    };

    const timer1 = setTimeout(() => {
      setWizardProgress(50);
      setWizardStatusText(t('wizardLoadingAnalyzing'));
    }, 280);

    const timer2 = setTimeout(() => {
      setWizardProgress(85);
    }, 600);

    try {
      const res = await runHahnemannAnalysis(
        fullText,
        seedMatrix,
        [],
        language,
        false,
        'akut'
      );
      clearTimeout(timer1);
      clearTimeout(timer2);
      setWizardProgress(100);
      setWizardStatusText(t('wizardLoadingReady'));
      setWizardPreloadedAnalysis(res);

      setTimeout(() => {
        setIsPreloadingWizard(false);
        openModal('complaint-wizard');
        setIsComplaintWizardModalOpen(true);
      }, 250);
    } catch (err) {
      console.error('Error preloading Hahnemann wizard:', err);
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsPreloadingWizard(false);
      openModal('complaint-wizard');
      setIsComplaintWizardModalOpen(true);
    }
  };

  const hauptbeschwerdeRef = useRef<HTMLTextAreaElement>(null);

  // Collapsible sidebar user menu state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(() => 
    ['profile', 'tariff', 'documentation'].includes(getStoredTherapistTab())
  );
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Step 6 (Summary) Accordion & Section Confirmation States
  const [summaryAccordionOpen, setSummaryAccordionOpen] = useState<{
    stammdaten: boolean;
    hauptbeschwerde: boolean;
    fragebogen: boolean;
    befund: boolean;
    medikamente: boolean;
  }>({
    stammdaten: false,
    hauptbeschwerde: false,
    fragebogen: false,
    befund: false,
    medikamente: false,
  });

  const [summaryConfirmedSections, setSummaryConfirmedSections] = useState<{
    stammdaten: boolean;
    hauptbeschwerde: boolean;
    fragebogen: boolean;
    befund: boolean;
    medikamente: boolean;
  }>({
    stammdaten: false,
    hauptbeschwerde: false,
    fragebogen: false,
    befund: false,
    medikamente: false,
  });

  const [isUnconfirmedSummaryModalOpen, setIsUnconfirmedSummaryModalOpen] = useState(false);
  const [isAnalysisAlreadyCreatedModalOpen, setIsAnalysisAlreadyCreatedModalOpen] = useState(false);
  const [adoptionBlockedSection, setAdoptionBlockedSection] = useState<'stammdaten' | 'hauptbeschwerde' | null>(null);
  const [isCasesDrawerOpen, setIsCasesDrawerOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);

  const toggleSummaryAccordion = (section: 'stammdaten' | 'hauptbeschwerde' | 'fragebogen' | 'befund' | 'medikamente') => {
    setSummaryAccordionOpen(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const hasAnalysis = Boolean(
    clinicalAnalysis ||
    currentCase.clinicalAnalysis ||
    (currentCase.remedySuggestions && currentCase.remedySuggestions.length > 0) ||
    (analysisResults && analysisResults.length > 0) ||
    currentCase.analyzedAt
  );

  const hasRecordedMedications = useMemo(() => {
    const fromCaseList = currentCase.medikamenteList && currentCase.medikamenteList.some(m => m.name && m.name.trim() !== '');
    const fromExtList = currentCase.extendedAnamnesis?.medikamente_liste && 
      Array.isArray(currentCase.extendedAnamnesis.medikamente_liste) && 
      currentCase.extendedAnamnesis.medikamente_liste.some((m: any) => m.name && m.name.trim() !== '');
    const isExplicitlyYes = (currentCase.nimmtMedikamente || currentCase.extendedAnamnesis?.nimmt_medikamente === 'Ja') && 
      ((currentCase.medikamenteList && currentCase.medikamenteList.length > 0) || 
       (currentCase.extendedAnamnesis?.medikamente_liste && Array.isArray(currentCase.extendedAnamnesis.medikamente_liste) && currentCase.extendedAnamnesis.medikamente_liste.length > 0));
    return Boolean(fromCaseList || fromExtList || isExplicitlyYes);
  }, [currentCase.medikamenteList, currentCase.extendedAnamnesis, currentCase.nimmtMedikamente]);

  type WizardStepId = 'stammdaten' | 'hauptbeschwerde' | 'fragebogen' | 'medikamente' | 'befund' | 'uebersicht' | 'analyse' | 'empfehlungen';

  interface WizardStepConfig {
    id: WizardStepId;
    name: string;
    shortName: string;
  }

  const wizardSteps: WizardStepConfig[] = useMemo(() => {
    return [
      { id: 'stammdaten', name: t('step1Name'), shortName: t('step1ShortName') || 'Stammdaten' },
      { id: 'hauptbeschwerde', name: t('step2Name'), shortName: t('step2ShortName') || 'Hauptbeschwerde' },
      { id: 'fragebogen', name: t('tpStep3Name') || '3. Fragebogen', shortName: t('step3ShortName') || 'Fragebogen' },
      { id: 'medikamente', name: `4. ${t('tpStepMedications') || 'Medikamente'}`, shortName: t('tpStepMedications') || 'Medikamente' },
      { id: 'befund', name: `5. ${t('tpStepFindings') || 'Befund'}`, shortName: t('tpStepFindings') || 'Befund' },
      { id: 'uebersicht', name: `6. ${t('tpStepOverview') || 'Übersicht'}`, shortName: t('tpStepSummary') || 'Übersicht' },
      { id: 'analyse', name: `7. ${t('tpStepAnalysis') || 'Analyse & Auswertung'}`, shortName: t('step7ShortName') || 'Analyse' },
      { id: 'empfehlungen', name: `8. ${t('tpStepRecommendations') || 'Empfehlungen & Verordnung'}`, shortName: t('step8ShortName') || 'Empfehlungen' },
    ];
  }, [language, t]);

  const totalWizardSteps = wizardSteps.length;
  const stepNames = useMemo(() => wizardSteps.map(s => s.name), [wizardSteps]);
  const currentStepConfig = wizardSteps[currentStep - 1] || wizardSteps[0] || { id: 'stammdaten' as WizardStepId, name: '1. Stammdaten', shortName: 'Stammdaten' };

  const goToStepById = (stepId: WizardStepId) => {
    const idx = wizardSteps.findIndex(s => s.id === stepId);
    if (idx !== -1) {
      setCurrentStep(idx + 1);
    }
  };

  const areAllSummarySectionsConfirmed = 
    summaryConfirmedSections.stammdaten &&
    summaryConfirmedSections.hauptbeschwerde &&
    summaryConfirmedSections.fragebogen &&
    summaryConfirmedSections.befund &&
    (!hasRecordedMedications || summaryConfirmedSections.medikamente);

  const confirmedSummaryCount = [
    summaryConfirmedSections.stammdaten,
    summaryConfirmedSections.hauptbeschwerde,
    summaryConfirmedSections.fragebogen,
    summaryConfirmedSections.befund,
    ...(hasRecordedMedications ? [summaryConfirmedSections.medikamente] : [])
  ].filter(Boolean).length;

  const getStepInfo = (stepNum: number): { status: 'empty' | 'partial' | 'complete'; percent: number } => {
    const stepConfig = wizardSteps[stepNum - 1];
    if (!stepConfig) return { status: 'empty', percent: 0 };

    switch (stepConfig.id) {
      case 'stammdaten': { // Stammdaten
        const hasName = Boolean(currentCase.patientName && currentCase.patientName.trim());
        const hasAgeOrBirth = currentCase.patientAge !== undefined || Boolean(currentCase.patientBirthDate && currentCase.patientBirthDate.trim());
        const hasGender = Boolean(currentCase.patientGender);
        const hasHeight = currentCase.patientHeightCm !== undefined && currentCase.patientHeightCm > 0;
        const hasWeight = currentCase.patientWeightKg !== undefined && currentCase.patientWeightKg > 0;
        const hasContact = Boolean(currentCase.patientEmail && currentCase.patientEmail.trim()) || Boolean(currentCase.patientPhone && currentCase.patientPhone.trim());
        const hasMaritalOrCustom = Boolean(currentCase.patientMaritalStatus) || Boolean(currentCase.customStammdaten && currentCase.customStammdaten.length > 0);
        
        const isFemale = (currentCase.patientGender || 'weiblich') === 'weiblich';
        const pregnancyOk = !isFemale || !currentCase.isPregnant || Boolean(currentCase.pregnancyMonth);
        const childrenOk = !currentCase.hasChildren || (Boolean(currentCase.childrenList && currentCase.childrenList.length > 0) && currentCase.childrenList!.every(c => c.name && c.name.trim()));

        if (!hasName && !hasAgeOrBirth && !hasGender && !hasHeight && !hasWeight && !hasContact && !hasMaritalOrCustom) {
          return { status: 'empty', percent: 0 };
        }

        let pts = 0;
        if (hasName) pts += 25;
        if (hasAgeOrBirth) pts += 25;
        if (hasGender) pts += 15;
        if (hasHeight) pts += 7.5;
        if (hasWeight) pts += 7.5;
        if (hasContact) pts += 10;
        if (hasMaritalOrCustom || (currentCase.patientGender && pregnancyOk && childrenOk)) pts += 10;

        const calculated = Math.min(100, Math.round(pts));
        if (calculated >= 95 && hasName && hasAgeOrBirth && pregnancyOk && childrenOk) {
          return { status: 'complete', percent: 100 };
        }
        return { status: calculated > 0 ? 'partial' : 'empty', percent: calculated };
      }

      case 'hauptbeschwerde': { // Hauptbeschwerde & Dynamische Fragen
        const complaint = currentCase.hauptbeschwerde?.trim() || '';
        const questions = currentCase.anamnesisQuestions || [];
        const answeredQuestions = questions.filter(q => 
          q.answerScaleCurrent !== undefined ||
          q.answerScaleWorst !== undefined ||
          Boolean(q.answerChoice && q.answerChoice.trim()) ||
          Boolean(q.answerMultiChoice && q.answerMultiChoice.length > 0) ||
          Boolean(q.answerText && q.answerText.trim())
        ).length;

        if (!complaint && answeredQuestions === 0) {
          return { status: 'empty', percent: 0 };
        }

        let complaintScore = 0;
        if (complaint.length >= 25) {
          complaintScore = 40;
        } else if (complaint.length >= 10) {
          complaintScore = 25;
        } else if (complaint.length > 0) {
          complaintScore = 15;
        }

        let questionsScore = 0;
        if (questions.length > 0) {
          questionsScore = Math.round((answeredQuestions / questions.length) * 60);
        } else if (complaint.length >= 40) {
          questionsScore = 20;
        }

        const total = Math.min(100, complaintScore + questionsScore);
        if (total >= 95 || (complaint.length >= 15 && questions.length > 0 && answeredQuestions === questions.length)) {
          return { status: 'complete', percent: 100 };
        }
        return { status: total > 0 ? 'partial' : 'empty', percent: Math.max(10, total) };
      }

      case 'fragebogen': { // Fragebogen (Erweiterte Homöopathische Anamnese)
        const ext = currentCase.extendedAnamnesis || {};
        
        const answeredKeys = Object.entries(ext).filter(([_, v]) => {
          if (v === undefined || v === null || v === '') return false;
          if (Array.isArray(v)) return v.length > 0;
          return true;
        });

        const schemaStepsWithAnswers = anamnesisSchema.filter(step => 
          step.fields.some(f => {
            const val = ext[f.id];
            if (val === undefined || val === null || val === '') return false;
            if (Array.isArray(val)) return val.length > 0;
            return true;
          })
        ).length;

        const legacyCount = [
          currentCase.spontanbericht,
          currentCase.modalitaetenBesser,
          currentCase.modalitaetenSchlechter,
          currentCase.gemuetPsyche,
          currentCase.koerperAllgemein,
          currentCase.lokalsymptome,
          currentCase.bisherigeMittel
        ].filter(v => typeof v === 'string' && v.trim().length > 0).length;

        if (answeredKeys.length === 0 && legacyCount === 0) {
          return { status: 'empty', percent: 0 };
        }

        const effectiveCategories = Math.max(schemaStepsWithAnswers, Math.min(10, legacyCount * 2));
        const categoryScore = Math.min(60, Math.round((effectiveCategories / 16) * 60));

        const totalItems = answeredKeys.length + legacyCount;
        const depthScore = Math.min(40, Math.round((totalItems / 25) * 40));

        const totalPercent = Math.min(100, Math.max(5, categoryScore + depthScore));

        if (totalPercent >= 90 || (schemaStepsWithAnswers >= 14 && answeredKeys.length >= 20)) {
          return { status: 'complete', percent: 100 };
        }
        return { status: 'partial', percent: totalPercent };
      }

      case 'medikamente': { // Medikamente
        const list = currentCase.medikamenteList || [];
        const validMeds = list.filter(m => m.name && m.name.trim().length > 0);
        if (validMeds.length === 0) {
          return { status: 'empty', percent: 0 };
        }
        const fullySpecifiedMeds = validMeds.filter(m => Boolean(m.dosierung && m.dosierung.trim()) && Boolean(m.einnahmeart && m.einnahmeart.trim())).length;
        if (fullySpecifiedMeds === validMeds.length) {
          return { status: 'complete', percent: 100 };
        }
        const percent = Math.max(30, Math.round((fullySpecifiedMeds / validMeds.length) * 100));
        return { status: 'partial', percent };
      }

      case 'befund': { // Befund (Klinische Untersuchung)
        const bd = currentCase.befundDetails || {};
        const customCount = bd.customFelder?.filter((cf: any) => cf.name?.trim() || cf.value?.trim()).length || 0;
        
        const vitals = [bd.blutdruck, bd.puls, bd.temperatur, bd.spo2, bd.gewicht].filter(v => typeof v === 'string' && v.trim().length > 0).length;
        const hasAssessment = Boolean((bd.gesamtbeurteilung && bd.gesamtbeurteilung.trim()) || (currentCase.befundText && currentCase.befundText.trim()));
        const organExam = [
          bd.allgemeinzustand,
          bd.herzLunge,
          bd.abdomen,
          bd.hautSchleimhaeute,
          bd.neurologisch,
          bd.weitereBefunde
        ].filter(v => typeof v === 'string' && v.trim().length > 0).length + customCount;

        if (vitals === 0 && !hasAssessment && organExam === 0) {
          return { status: 'empty', percent: 0 };
        }

        let pts = 0;
        if (hasAssessment) pts += 35;
        pts += Math.min(35, vitals * 8);
        pts += Math.min(30, organExam * 10);

        const calculated = Math.min(100, Math.max(15, Math.round(pts)));
        if (calculated >= 85 || (hasAssessment && vitals >= 2 && organExam >= 1)) {
          return { status: 'complete', percent: 100 };
        }
        return { status: 'partial', percent: calculated };
      }

      case 'uebersicht': { // Übersicht & Bestätigung
        const totalChecklist = hasRecordedMedications ? 5 : 4;
        const confirmedCount = [
          summaryConfirmedSections.stammdaten,
          summaryConfirmedSections.hauptbeschwerde,
          summaryConfirmedSections.fragebogen,
          summaryConfirmedSections.befund,
          ...(hasRecordedMedications ? [summaryConfirmedSections.medikamente] : [])
        ].filter(Boolean).length;

        if (confirmedCount === totalChecklist) {
          return { status: 'complete', percent: 100 };
        }
        if (confirmedCount > 0) {
          const p = Math.round((confirmedCount / totalChecklist) * 100);
          return { status: 'partial', percent: p };
        }

        const s1 = getStepInfo(1).percent;
        const s2 = getStepInfo(2).percent;
        const s3 = getStepInfo(3).percent;
        const priorAvg = Math.round((s1 + s2 + s3) / 3);
        if (priorAvg > 0) {
          return { status: 'partial', percent: Math.round(priorAvg * 0.4) };
        }
        return { status: 'empty', percent: 0 };
      }

      case 'analyse': { // Analyse & Repertorisation
        if (clinicalAnalysis || (currentCase.remedySuggestions && currentCase.remedySuggestions.length > 0)) {
          return { status: 'complete', percent: 100 };
        }
        if (isAnalyzing) {
          return { status: 'partial', percent: 50 };
        }
        return { status: 'empty', percent: 0 };
      }

      case 'empfehlungen': { // Empfehlungen & Verordnung
        const hasInitialPrescription = Boolean(
          currentCase.initialPrescription?.remedy && 
          currentCase.initialPrescription.remedy.trim().length > 0
        );
        const rec = currentCase.therapyRecommendations;
        const hasSelectedRemedy = Boolean(rec?.remedies && rec.remedies.some(r => r.isSelected));

        if (hasInitialPrescription || hasSelectedRemedy) {
          return { status: 'complete', percent: 100 };
        }
        if (rec) {
          return { status: 'partial', percent: 50 };
        }
        return { status: 'empty', percent: 0 };
      }

      default:
        return { status: 'empty', percent: 0 };
    }
  };

  const getActiveSectionHint = (id: WizardStepId): string => {
    switch (id) {
      case 'stammdaten':
        return t('sectionHintStammdaten');
      case 'hauptbeschwerde':
        return t('sectionHintHauptbeschwerde');
      case 'fragebogen':
        return t('sectionHintFragebogen');
      case 'medikamente':
        return t('sectionHintMedikamente');
      case 'befund':
        return t('sectionHintBefund');
      case 'uebersicht':
        return t('sectionHintUebersicht');
      case 'analyse':
        return t('sectionHintAnalyse');
      case 'empfehlungen':
        return t('sectionHintEmpfehlungen');
      default:
        return '';
    }
  };

  const patientCasesCount = useMemo(() => {
    if (!currentCase.patientName) return 1;
    const norm = currentCase.patientName.trim().toLowerCase();
    const matches = cases.filter(c => c.patientName && c.patientName.trim().toLowerCase() === norm);
    return matches.length > 0 ? matches.length : 1;
  }, [currentCase.patientName, cases]);

  const patientInitials = useMemo(() => {
    return (currentCase.patientName || 'P')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'P';
  }, [currentCase.patientName]);

  const lastConsultationFormatted = useMemo(() => {
    return currentCase.anamneseDatum
      ? new Date(currentCase.anamneseDatum).toLocaleDateString(language)
      : (currentCase.patientName ? new Date().toLocaleDateString(language) : (t('unknownDate' as TranslationKey) || '—'));
  }, [currentCase.anamneseDatum, currentCase.patientName, language, t]);

  const activePatientCases = useMemo(() => {
    if (!currentCase.patientName) return [];
    const norm = currentCase.patientName.trim().toLowerCase();
    return cases.filter(c => c.patientName && c.patientName.trim().toLowerCase() === norm);
  }, [currentCase.patientName, cases]);

  const activeCaseNumber = useMemo(() => {
    if (!selectedCaseId || activePatientCases.length === 0) return 1;
    const idx = activePatientCases.findIndex(c => c.id === selectedCaseId);
    return idx >= 0 ? activePatientCases.length - idx : 1;
  }, [selectedCaseId, activePatientCases]);

  const overallProgress = useMemo(() => {
    if (!totalWizardSteps || totalWizardSteps === 0) return 0;
    let totalPercent = 0;
    for (let i = 1; i <= totalWizardSteps; i++) {
      totalPercent += getStepInfo(i).percent;
    }
    const avg = Math.round(totalPercent / totalWizardSteps);
    return Math.min(100, Math.max(0, avg));
  }, [currentCase, totalWizardSteps, wizardSteps, summaryConfirmedSections]);

  const getMissingStammdatenFields = (): string[] => {
    const missing: string[] = [];
    if (!currentCase.patientName || !currentCase.patientName.trim()) {
      missing.push(t('missingFieldPatientName'));
    }
    if (currentCase.patientAge === undefined && (!currentCase.patientBirthDate || !currentCase.patientBirthDate.trim())) {
      missing.push(t('missingFieldBirthDateOrAge'));
    }
    const isFemale = (currentCase.patientGender || 'weiblich') === 'weiblich';
    if (isFemale && currentCase.isPregnant && !currentCase.pregnancyMonth) {
      missing.push(t('missingFieldPregnancyMonth'));
    }
    if (currentCase.hasChildren && (!currentCase.childrenList || currentCase.childrenList.length === 0 || currentCase.childrenList.some(c => !c.name || !c.name.trim()))) {
      missing.push(t('missingFieldChildrenList'));
    }
    return missing;
  };

  const getMissingHauptbeschwerdeFields = (): string[] => {
    const missing: string[] = [];
    if (!currentCase.hauptbeschwerde || currentCase.hauptbeschwerde.trim().length < 5) {
      missing.push(t('missingFieldHauptbeschwerde'));
    }
    const questions = currentCase.anamnesisQuestions || [];
    if (questions.length > 0) {
      const answeredQuestions = questions.filter(q => 
        Boolean(q.answerScaleCurrent !== undefined) ||
        Boolean(q.answerScaleWorst !== undefined) ||
        Boolean(q.answerChoice && q.answerChoice.trim()) ||
        Boolean(q.answerMultiChoice && q.answerMultiChoice.length > 0) ||
        Boolean(q.answerText && q.answerText.trim())
      ).length;
      if (answeredQuestions < questions.length) {
        missing.push(t('missingFieldAnamnesisQuestions'));
      }
    } else if (currentCase.hauptbeschwerde && currentCase.hauptbeschwerde.trim().length < 15) {
      missing.push(t('missingFieldHauptbeschwerde'));
    }
    return missing;
  };

  const toggleSectionConfirmation = (section: 'stammdaten' | 'hauptbeschwerde' | 'fragebogen' | 'befund' | 'medikamente', confirmed?: boolean) => {
    const willConfirm = confirmed !== undefined ? confirmed : !summaryConfirmedSections[section];

    if (willConfirm) {
      if (section === 'stammdaten') {
        const missing = getMissingStammdatenFields();
        if (missing.length > 0 || getStepInfo(1).status !== 'complete') {
          setAdoptionBlockedSection('stammdaten');
          return;
        }
      }
      if (section === 'hauptbeschwerde') {
        const missing = getMissingHauptbeschwerdeFields();
        if (missing.length > 0 || getStepInfo(2).status !== 'complete') {
          setAdoptionBlockedSection('hauptbeschwerde');
          return;
        }
      }
    }

    setSummaryConfirmedSections(prev => ({
      ...prev,
      [section]: willConfirm,
    }));
  };

  const handleAdoptAllSections = () => {
    const missingStamm = getMissingStammdatenFields();
    if (missingStamm.length > 0 || getStepInfo(1).status !== 'complete') {
      setAdoptionBlockedSection('stammdaten');
      return;
    }
    const missingHaupt = getMissingHauptbeschwerdeFields();
    if (missingHaupt.length > 0 || getStepInfo(2).status !== 'complete') {
      setAdoptionBlockedSection('hauptbeschwerde');
      return;
    }

    setSummaryConfirmedSections({
      stammdaten: true,
      hauptbeschwerde: true,
      fragebogen: true,
      befund: true,
      medikamente: true,
    });
  };

  const renderSummarySectionBadge = (stepNum: number, isConfirmed: boolean) => {
    if (isConfirmed) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5 shadow-2xs">
          <Check className="w-3.5 h-3.5 text-teal-600 stroke-[2]" />
          <span>{t('summaryAdoptedBadge')}</span>
        </span>
      );
    }

    const { status, percent } = getStepInfo(stepNum);

    if (status === 'complete') {
      return (
        <span className="relative px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1.5 shadow-2xs overflow-hidden">
          <Check className="w-3.5 h-3.5 text-teal-700 stroke-[2]" />
          <span>{t('summaryPendingBadge')} (100%)</span>
        </span>
      );
    }

    if (status === 'partial') {
      return (
        <span className="relative px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1.5 shadow-2xs overflow-hidden">
          <div
            className="absolute inset-y-0 right-0 bg-amber-300/55 border-l border-amber-400/60 pointer-events-none transition-all duration-300"
            style={{ width: `${100 - percent}%` }}
          />
          <Clock className="relative z-10 w-3.5 h-3.5 text-teal-800" />
          <span className="relative z-10">{t('summaryPendingBadge')} ({percent}%)</span>
        </span>
      );
    }

    return (
      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1.5 shadow-2xs">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>{t('summaryPendingBadge')} (0%)</span>
      </span>
    );
  };

  // Auto-resize hauptbeschwerde textarea based on content
  useEffect(() => {
    if (hauptbeschwerdeRef.current && currentStep === 2) {
      hauptbeschwerdeRef.current.style.height = 'auto';
      const scrollH = hauptbeschwerdeRef.current.scrollHeight;
      hauptbeschwerdeRef.current.style.height = `${Math.max(130, scrollH)}px`;
    }
  }, [currentCase.hauptbeschwerde, currentStep]);

  const refreshCases = () => {
    if (therapist) {
      const allCases = getPatientCases(therapist.id);
      setCases(allCases);
    }
  };

  useEffect(() => {
    refreshCases();
    window.addEventListener('homoeo_cases_updated', refreshCases);
    return () => {
      window.removeEventListener('homoeo_cases_updated', refreshCases);
    };
  }, [therapist?.id]);

  if (!therapist) {
    return (
      <TherapistLogin
        onLoginSuccess={() => {
          window.dispatchEvent(new Event('homoeo_active_therapist_changed'));
        }}
        onGoToRegister={onGoToRegister}
      />
    );
  }

  const limitStatus = checkTherapistLimit(therapist);
  const isUnlimited = !!therapist.isUnlimited || therapist.tarif === 'pro_unlimited' || therapist.maxAnalyses >= 900000;
  const isLocked = !isUnlimited && limitStatus.isLocked;
  const remainingCount = isUnlimited ? 999999 : limitStatus.remainingAnalyses;

  const checkLimitAndTriggerError = (
    feature: 'maxPatients' | 'maxCases' | 'maxAnalysesPerCase' | 'maxMedsPerCase' | 'maxMedsPerResearch' | 'maxMedResearch' | 'maxMateriaMedicaSearch' | 'maxRepertoriumSearch' | 'maxRepertoriumSymptoms' | 'maxQuickIntake' | 'maxQuickIntakeSymptoms' | 'maxRiskAnalyses' | 'maxReports' | 'maxAiRequests',
    additionalCount: number = 1,
    contextId?: string
  ): boolean => {
    const res = isFeatureLimitReached(therapist.id, feature, additionalCount, contextId);
    if (res.reached) {
      const featureKeyMap: Record<string, string> = {
        maxPatients: t('tariffLimitPatientsLabel'),
        maxCases: t('tariffLimitCasesLabel'),
        maxAnalysesPerCase: t('tariffLimitAnalysesPerCaseLabel'),
        maxMedsPerCase: t('tariffLimitMedsPerCaseLabel'),
        maxMedsPerResearch: t('tariffLimitMedsPerResearchLabel'),
        maxMedResearch: t('tariffLimitMedResearchLabel'),
        maxMateriaMedicaSearch: t('tariffLimitMateriaMedicaSearchLabel'),
        maxRepertoriumSearch: t('tariffLimitRepertoriumSearchLabel'),
        maxRepertoriumSymptoms: t('tariffLimitRepertoriumSymptomsLabel'),
        maxQuickIntake: t('tariffLimitQuickIntakeLabel'),
        maxQuickIntakeSymptoms: t('tariffLimitQuickIntakeSymptomsLabel'),
        maxRiskAnalyses: t('tariffLimitRiskAnalysesLabel'),
        maxReports: t('tariffLimitReportsLabel'),
        maxAiRequests: t('tariffLimitAiRequestsLabel'),
      };
      setLimitExceededError({
        featureName: featureKeyMap[feature] || feature,
        limitValue: res.limit
      });
      return true;
    }
    return false;
  };

  const hasPatientData = Boolean(currentCase.patientName && currentCase.patientName.trim());

  // Group cases by patient identity (case-insensitive name) for stats and quick selection
  const groupedPatients = useMemo(() => {
    const map = new Map<string, PatientCase[]>();

    cases.forEach(c => {
      const cleanName = (c.patientName || t('patientNameLabel') || 'Patient').trim();
      const key = cleanName.toLowerCase();
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(c);
    });

    const result: Array<{
      key: string;
      name: string;
      cases: PatientCase[];
      primaryCase: PatientCase;
      lastActivityTimestamp?: number;
      lastActivityFormatted?: string;
    }> = [];

    map.forEach((patientCases, key) => {
      const sortedCases = [...patientCases].sort((a, b) => {
        const da = new Date(a.anamneseDatum || a.analyzedAt || 0).getTime();
        const db = new Date(b.anamneseDatum || b.analyzedAt || 0).getTime();
        return db - da;
      });

      const primaryCase = sortedCases[0];
      result.push({
        key,
        name: primaryCase.patientName || t('patientNameLabel') || 'Patient',
        cases: sortedCases,
        primaryCase,
      });
    });

    return result.sort((a, b) => a.name.localeCompare(b.name, language));
  }, [cases, language, t]);

  const getPatientLastActivityTimestamp = (pCases: PatientCase[], pName: string): number => {
    let latest = 0;
    const recentList = getRecentlyEditedPatientNames();
    const found = recentList.find(r => r.name.toLowerCase() === pName.toLowerCase());
    if (found && found.timestamp > latest) {
      latest = found.timestamp;
    }

    for (const c of pCases) {
      if (c.updatedAt) {
        const time = new Date(c.updatedAt).getTime();
        if (!isNaN(time) && time > latest) latest = time;
      }
      if (c.analyzedAt) {
        const time = new Date(c.analyzedAt).getTime();
        if (!isNaN(time) && time > latest) latest = time;
      }
      if (c.therapyRecommendations?.updatedAt) {
        const time = new Date(c.therapyRecommendations.updatedAt).getTime();
        if (!isNaN(time) && time > latest) latest = time;
      }
      if (c.initialPrescription?.prescribedAt) {
        const time = new Date(c.initialPrescription.prescribedAt).getTime();
        if (!isNaN(time) && time > latest) latest = time;
      }
      if (c.followUps && c.followUps.length > 0) {
        for (const fu of c.followUps) {
          if (fu.createdAt) {
            const time = new Date(fu.createdAt).getTime();
            if (!isNaN(time) && time > latest) latest = time;
          }
        }
      }
      if (c.anamneseDatum) {
        const time = new Date(c.anamneseDatum).getTime();
        if (!isNaN(time) && time > latest) latest = time;
      }
    }
    return latest;
  };

  const formatPatientLastActivity = (timestamp: number): string => {
    if (!timestamp || timestamp <= 0) return '';
    const now = Date.now();
    const diffMs = now - timestamp;
    if (diffMs < 0) return '';
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 2) return t('justNow');
    if (diffMinutes < 60) return `${diffMinutes} ${t('minutesAgo')}`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;

    try {
      return new Date(timestamp).toLocaleDateString(language, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return new Date(timestamp).toISOString().split('T')[0];
    }
  };

  // 3 Most recently edited patients for start view
  const recentEditedPatients = useMemo(() => {
    if (groupedPatients.length === 0) return [];
    
    const enriched = groupedPatients.map(p => {
      const timestamp = getPatientLastActivityTimestamp(p.cases, p.name);
      return {
        ...p,
        lastActivityTimestamp: timestamp,
        lastActivityFormatted: formatPatientLastActivity(timestamp)
      };
    });

    enriched.sort((a, b) => {
      if (b.lastActivityTimestamp !== a.lastActivityTimestamp) {
        return (b.lastActivityTimestamp || 0) - (a.lastActivityTimestamp || 0);
      }
      return a.name.localeCompare(b.name, language);
    });

    return enriched.slice(0, 3);
  }, [groupedPatients, language, t]);

  const handleSelectCase = (patientCase: PatientCase) => {
    setSelectedCaseId(patientCase.id);
    let questions = patientCase.anamnesisQuestions;
    if ((!questions || questions.length === 0) && patientCase.hauptbeschwerde) {
      questions = generateQuestionsForComplaint(patientCase.hauptbeschwerde);
    }
    setCurrentCase({
      ...patientCase,
      anamnesisQuestions: questions || [],
    });
    setClinicalAnalysis(patientCase.clinicalAnalysis || null);
    if (patientCase.remedySuggestions && patientCase.remedySuggestions.length > 0) {
      setAnalysisResults(patientCase.remedySuggestions.map(r => ({
        name: r.name,
        potency: r.potency,
        score: r.score,
        grade: (r.score >= 85 ? '1. Grad' : r.score >= 70 ? '2. Grad' : '3. Grad') as any,
        keyIndicators: r.keyIndicators || [],
        modalitiesMatch: [],
        description: r.description,
        materiaMedicaHint: '',
      })));
    } else {
      setAnalysisResults([]);
    }
    setCurrentStep(1);
    setPanelTab('cases');
    navigateTo('therapist', { therapistTab: 'cases', modal: null, replace: true });
  };

  const handleStartNewPatient = () => {
    if (checkLimitAndTriggerError('maxPatients', 1)) {
      return;
    }
    setClinicalAnalysis(null);
    setAnalysisResults([]);
    setSelectedCaseId(null);
    setCurrentCase({
      ...BLANK_PATIENT_CASE,
      anamneseDatum: new Date().toISOString().split('T')[0],
    });
    setCurrentStep(1);
    openModal('stammdaten');
    setIsStammdatenModalOpen(true);
  };

  const handleNewCase = () => {
    setClinicalAnalysis(null);
    setAnalysisResults([]);

    const hasPatientMasterData = Boolean(currentCase.patientName && currentCase.patientName.trim());

    if (hasPatientMasterData) {
      if (checkLimitAndTriggerError('maxPatients', 1, currentCase.patientName)) {
        return;
      }
      if (checkLimitAndTriggerError('maxCases', 1)) {
        return;
      }
      
      const isFemale = (currentCase.patientGender || 'weiblich') === 'weiblich';
      const today = new Date().toISOString().split('T')[0];

      // Immediately create and persist the new case for this patient
      const newCaseData: Omit<PatientCase, 'id'> = {
        therapistId: therapist.id,
        anamneseDatum: today,
        patientName: currentCase.patientName.trim(),
        patientAge: currentCase.patientAge,
        patientBirthDate: currentCase.patientBirthDate,
        patientGender: currentCase.patientGender,
        patientHeightCm: currentCase.patientHeightCm,
        patientWeightKg: currentCase.patientWeightKg,
        patientMaritalStatus: currentCase.patientMaritalStatus,
        patientEmail: currentCase.patientEmail,
        patientPhone: currentCase.patientPhone,
        isPregnant: isFemale ? !!currentCase.isPregnant : false,
        pregnancyMonth: isFemale && currentCase.isPregnant ? currentCase.pregnancyMonth : undefined,
        hasChildren: !!currentCase.hasChildren,
        childrenCount: currentCase.hasChildren ? (currentCase.childrenList?.length || 0) : 0,
        childrenList: currentCase.hasChildren ? (currentCase.childrenList ? [...currentCase.childrenList] : []) : [],
        customStammdaten: currentCase.customStammdaten ? [...currentCase.customStammdaten] : [],
        hauptbeschwerde: '',
        anamnesisQuestions: [],
        spontanbericht: '',
        modalitaetenBesser: '',
        modalitaetenSchlechter: '',
        gemuetPsyche: '',
        koerperAllgemein: '',
        lokalsymptome: '',
        bisherigeMittel: '',
      };

      const created = savePatientCase(newCaseData);
      setSelectedCaseId(created.id);
      setCurrentCase(created);
      refreshCases();
      // Advance to step 2 (Hauptbeschwerde) so the therapist can directly start recording the new complaint
      setCurrentStep(2);
    } else {
      // Completely blank admission
      handleStartNewPatient();
      return;
    }

    showToast(t('toastNewCaseCreated'));
  };

  const handleNewCaseRef = useRef(handleNewCase);
  handleNewCaseRef.current = handleNewCase;

  useEffect(() => {
    const handleNewPatientEvent = () => {
      setPatientDirectoryAction('new_patient');
      handleSelectTab('patients');
    };
    const handleOpenDirectoryEvent = () => {
      setPatientDirectoryAction('select_patient');
      handleSelectTab('patients');
    };
    const handleSetTabEvent = (e: Event) => {
      const customEvent = e as CustomEvent<'cases' | 'patients' | 'materiamedica' | 'quickintake' | 'medications' | 'documentation' | 'profile' | 'tariff'>;
      if (customEvent.detail) {
        setPanelTab(customEvent.detail);
      }
    };
    const handleModalEvent = (e: Event) => {
      const modalId = (e as CustomEvent<string | null>).detail;
      setIsStammdatenModalOpen(modalId === 'stammdaten');
      setIsAnalysisModalOpen(modalId === 'analysis');
      setIsExtendedAnamnesisWizardOpen(modalId === 'wizard');
      setIsFindingsModalOpen(modalId === 'findings');
      setIsMedicationsModalOpen(modalId === 'medications');
      setIsPatientSelectionModalOpen(modalId === 'patient_select');
      setIsUpgradeModalOpen(modalId === 'upgrade');
    };
    const handleLogoutEvent = () => {
      if (onLogout) {
        onLogout();
      }
    };
    const handleLimitReachedEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ feature: string; limit: number }>;
      if (customEvent.detail) {
        setLimitExceededError({
          featureName: customEvent.detail.feature,
          limitValue: customEvent.detail.limit,
        });
      }
    };

    window.addEventListener('homoeo_action_new_patient', handleNewPatientEvent);
    window.addEventListener('homoeo_action_open_patient_directory', handleOpenDirectoryEvent);
    window.addEventListener('homoeo_action_set_therapist_tab', handleSetTabEvent);
    window.addEventListener('homoeo_action_set_modal', handleModalEvent);
    window.addEventListener('homoeo_action_therapist_logout', handleLogoutEvent);
    window.addEventListener('homoeo_action_limit_reached', handleLimitReachedEvent);
    return () => {
      window.removeEventListener('homoeo_action_new_patient', handleNewPatientEvent);
      window.removeEventListener('homoeo_action_open_patient_directory', handleOpenDirectoryEvent);
      window.removeEventListener('homoeo_action_set_therapist_tab', handleSetTabEvent);
      window.removeEventListener('homoeo_action_set_modal', handleModalEvent);
      window.removeEventListener('homoeo_action_therapist_logout', handleLogoutEvent);
      window.removeEventListener('homoeo_action_limit_reached', handleLimitReachedEvent);
    };
  }, [onLogout]);

  const handleAddChild = () => {
    const newChild: PatientChild = {
      id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: '',
      age: undefined,
      gender: 'weiblich',
    };
    const updatedList = [...(currentCase.childrenList || []), newChild];
    setCurrentCase(prev => ({
      ...prev,
      hasChildren: true,
      childrenCount: updatedList.length,
      childrenList: updatedList,
    }));
  };

  const handleUpdateChild = (id: string, field: keyof PatientChild, value: any) => {
    const updatedList = (currentCase.childrenList || []).map(ch => {
      if (ch.id === id) {
        return { ...ch, [field]: value };
      }
      return ch;
    });
    setCurrentCase(prev => ({
      ...prev,
      childrenList: updatedList,
      childrenCount: updatedList.length,
    }));
  };

  const handleRemoveChild = (id: string) => {
    const updatedList = (currentCase.childrenList || []).filter(ch => ch.id !== id);
    setCurrentCase(prev => ({
      ...prev,
      childrenCount: updatedList.length,
      childrenList: updatedList,
      hasChildren: updatedList.length > 0 ? prev.hasChildren : false,
    }));
  };

  const handleToggleChildren = (has: boolean) => {
    if (has) {
      if (!currentCase.childrenList || currentCase.childrenList.length === 0) {
        const initialChild: PatientChild = {
          id: `child_${Date.now()}_1`,
          name: '',
          age: undefined,
          gender: 'weiblich',
        };
        setCurrentCase(prev => ({
          ...prev,
          hasChildren: true,
          childrenCount: 1,
          childrenList: [initialChild],
        }));
      } else {
        setCurrentCase(prev => ({
          ...prev,
          hasChildren: true,
          childrenCount: prev.childrenList?.length || 1,
        }));
      }
    } else {
      setCurrentCase(prev => ({
        ...prev,
        hasChildren: false,
        childrenCount: 0,
      }));
    }
  };

  const handleAddCustomStammdaten = (defaultName = '') => {
    const newField = {
      id: `sd_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: defaultName,
      value: '',
    };
    setCurrentCase(prev => ({
      ...prev,
      customStammdaten: [...(prev.customStammdaten || []), newField],
    }));
  };

  const handleUpdateCustomStammdaten = (id: string, field: 'name' | 'value', value: string) => {
    setCurrentCase(prev => ({
      ...prev,
      customStammdaten: (prev.customStammdaten || []).map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleRemoveCustomStammdaten = (id: string) => {
    setCurrentCase(prev => ({
      ...prev,
      customStammdaten: (prev.customStammdaten || []).filter(item => item.id !== id),
    }));
  };

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const getGenderLabel = (gender?: string) => {
    if (!gender) return '—';
    if (gender === 'weiblich') return t('genderFemale');
    if (gender === 'männlich') return t('genderMale');
    if (gender === 'divers') return t('genderOther');
    return gender;
  };

  const getMaritalStatusLabel = (status?: string) => {
    if (!status) return '';
    if (status === 'ledig') return t('maritalSingle');
    if (status === 'verheiratet') return t('maritalMarried');
    if (status === 'in Partnerschaft') return t('maritalPartnership');
    if (status === 'geschieden') return t('maritalDivorced');
    if (status === 'getrennt lebend') return t('maritalSeparated');
    if (status === 'verwitwet') return t('maritalWidowed');
    if (status === 'sonstiges') return t('maritalOther');
    return status;
  };

  const handleUpdateHauptbeschwerde = (newComplaint: string) => {
    const updatedQuestions = generateQuestionsForComplaint(newComplaint, currentCase.anamnesisQuestions);
    setCurrentCase(prev => ({
      ...prev,
      hauptbeschwerde: newComplaint,
      anamnesisQuestions: updatedQuestions,
    }));
  };

  const handleUpdateAnamnesisQuestion = (questionId: string, updates: Partial<AnamnesisQuestion>) => {
    setCurrentCase(prev => {
      const updatedList = (prev.anamnesisQuestions || []).map(q => {
        if (q.id === questionId) {
          return { ...q, ...updates };
        }
        return q;
      });
      return {
        ...prev,
        anamnesisQuestions: updatedList,
      };
    });
  };

  const handleAddCustomQuestion = (newQuestion: AnamnesisQuestion) => {
    setCurrentCase(prev => ({
      ...prev,
      anamnesisQuestions: [...(prev.anamnesisQuestions || []), newQuestion],
    }));
    showToast(t('toastCustomQuestionAdded'));
  };

  const handleRemoveAnamnesisQuestion = (questionId: string) => {
    setCurrentCase(prev => ({
      ...prev,
      anamnesisQuestions: (prev.anamnesisQuestions || []).filter(q => q.id !== questionId),
    }));
  };

  const handleRegenerateQuestions = () => {
    if (!currentCase.hauptbeschwerde?.trim()) return;
    const freshQuestions = generateQuestionsForComplaint(currentCase.hauptbeschwerde);
    setCurrentCase(prev => ({
      ...prev,
      anamnesisQuestions: freshQuestions,
    }));
    showToast(t('toastQuestionsRegenerated'));
  };

  const handleTransferAnswersToAnamnese = () => {
    if (!currentCase.anamnesisQuestions || currentCase.anamnesisQuestions.length === 0) return;
    const summary = summarizeQuestionsToAnamnese(currentCase.anamnesisQuestions);

    setCurrentCase(prev => {
      const newSpontan = [prev.spontanbericht?.trim(), summary.summaryReport?.trim()]
        .filter(Boolean)
        .join('\n\n');

      const newLokalsymptome = [prev.lokalsymptome?.trim(), summary.localSymptoms?.trim()]
        .filter(Boolean)
        .join('\n');

      const newBesser = [prev.modalitaetenBesser?.trim(), summary.modalitiesBetter?.trim()]
        .filter(Boolean)
        .join(', ');

      const newSchlechter = [prev.modalitaetenSchlechter?.trim(), summary.modalitiesWorse?.trim()]
        .filter(Boolean)
        .join(', ');

      const newGemuet = [prev.gemuetPsyche?.trim(), summary.gemuetPsyche?.trim()]
        .filter(Boolean)
        .join('\n\n');

      return {
        ...prev,
        spontanbericht: newSpontan,
        lokalsymptome: newLokalsymptome,
        modalitaetenBesser: newBesser,
        modalitaetenSchlechter: newSchlechter,
        gemuetPsyche: newGemuet,
      };
    });

    showToast(t('toastAnswersImported'));
  };

  const handleSaveCase = () => {
    if (!currentCase.patientName?.trim()) {
      setIsNoMasterDataModalOpen(true);
      return;
    }

    const isFemale = (currentCase.patientGender || 'weiblich') === 'weiblich';

    const saved = savePatientCase({
      ...currentCase,
      therapistId: therapist.id,
      patientName: currentCase.patientName.trim(),
      anamneseDatum: currentCase.anamneseDatum || new Date().toISOString().split('T')[0],
      patientHeightCm: currentCase.patientHeightCm,
      isPregnant: isFemale ? !!currentCase.isPregnant : false,
      pregnancyMonth: isFemale && currentCase.isPregnant ? currentCase.pregnancyMonth : undefined,
      hasChildren: !!currentCase.hasChildren,
      childrenCount: currentCase.hasChildren ? (currentCase.childrenList?.length || 0) : 0,
      childrenList: currentCase.hasChildren ? (currentCase.childrenList || []) : [],
      hauptbeschwerde: currentCase.hauptbeschwerde || '',
      anamnesisQuestions: currentCase.anamnesisQuestions || [],
      spontanbericht: currentCase.spontanbericht || '',
      modalitaetenBesser: currentCase.modalitaetenBesser || '',
      modalitaetenSchlechter: currentCase.modalitaetenSchlechter || '',
      gemuetPsyche: currentCase.gemuetPsyche || '',
      koerperAllgemein: currentCase.koerperAllgemein || '',
      lokalsymptome: currentCase.lokalsymptome || '',
      bisherigeMittel: currentCase.bisherigeMittel || '',
      id: selectedCaseId || undefined,
    });

    setSelectedCaseId(saved.id);
    refreshCases();
    showToast(t('toastCaseSaved'));
  };

  const handleExportRecommendationsPDF = () => {
    if (!currentCase) return;
    if (tariffAccess.pagePermissions.pdfExport === false) {
      setLockedPageAttempt({ key: 'pdfExport', name: t('tariffPagePdfExportLabel') || 'PDF-Fallexport & Berichte' });
      return;
    }
    const analysisToExport = clinicalAnalysis || {
      redFlags: { warnings: [], gesamtbewertung: '', empfohleneFachrichtung: '', dringlichkeit: '' },
      differentialdiagnostik: { items: [] },
      medikamente: { zusammenfassung: '', details: [] },
      homoeopathie: { mittel: [] }
    };
    exportComprehensiveAnalysisToPDF(currentCase as PatientCase, analysisToExport, language, 'empfehlungen');
  };

  const handleExportFullAnalysisPDF = () => {
    if (!currentCase) return;
    if (tariffAccess.pagePermissions.pdfExport === false) {
      setLockedPageAttempt({ key: 'pdfExport', name: t('tariffPagePdfExportLabel') || 'PDF-Fallexport & Berichte' });
      return;
    }
    const analysisToExport = clinicalAnalysis || {
      redFlags: { warnings: [], gesamtbewertung: '', empfohleneFachrichtung: '', dringlichkeit: '' },
      differentialdiagnostik: { items: [] },
      medikamente: { zusammenfassung: '', details: [] },
      homoeopathie: { mittel: [] }
    };
    exportComprehensiveAnalysisToPDF(currentCase as PatientCase, analysisToExport, language);
  };

  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCaseToDeleteId(id);
  };

  const handleConfirmDeleteCase = () => {
    if (!caseToDeleteId) return;
    const id = caseToDeleteId;
    deletePatientCase(id);
    if (selectedCaseId === id) {
      const remainingCases = cases.filter(c => c.id !== id);
      const currentPatientName = (currentCase.patientName || '').trim().toLowerCase();
      const otherPatientCase = remainingCases.find(
        c => (c.patientName || '').trim().toLowerCase() === currentPatientName
      );
      if (otherPatientCase) {
        handleSelectCase(otherPatientCase);
      } else {
        handleNewCase();
      }
    }
    refreshCases();
    setCaseToDeleteId(null);
  };

  const handleRunAnalysis = async () => {
    if (checkLimitAndTriggerError('maxAnalysesPerCase', 1, currentCase.id)) {
      return;
    }

    if (hasAnalysis) {
      setIsAnalysisAlreadyCreatedModalOpen(true);
      return;
    }

    if (isLocked) {
      setIsUpgradeModalOpen(true);
      return;
    }

    if (!currentCase.hauptbeschwerde && !currentCase.spontanbericht && !currentCase.gemuetPsyche) {
      alert(t('mainComplaintTitle'));
      setCurrentStep(2);
      return;
    }

    // Attempt to decrement quota
    const res = incrementAnalysesUsed(therapist.id);
    if (!res.success) {
      setIsUpgradeModalOpen(true);
      return;
    }

    setIsAnalyzing(true);
    goToStepById('analyse');

    // Run modular homeopathy repertorisation engine
    const results = runHomeopathyAnalysis(currentCase);
    setAnalysisResults(results);

    try {
      const fullAnalysis = await generateFullClinicalAnalysis(currentCase as PatientCase, language);
      setClinicalAnalysis(fullAnalysis);

      // Save case with analysis
      if (currentCase.patientName) {
        const isFemale = (currentCase.patientGender || 'weiblich') === 'weiblich';
        const saved = savePatientCase({
          ...currentCase,
          therapistId: therapist.id,
          patientName: currentCase.patientName,
          anamneseDatum: currentCase.anamneseDatum || new Date().toISOString().split('T')[0],
          patientHeightCm: currentCase.patientHeightCm,
          isPregnant: isFemale ? !!currentCase.isPregnant : false,
          pregnancyMonth: isFemale && currentCase.isPregnant ? currentCase.pregnancyMonth : undefined,
          hasChildren: !!currentCase.hasChildren,
          childrenCount: currentCase.hasChildren ? (currentCase.childrenList?.length || 0) : 0,
          childrenList: currentCase.hasChildren ? (currentCase.childrenList || []) : [],
          hauptbeschwerde: currentCase.hauptbeschwerde || '',
          anamnesisQuestions: currentCase.anamnesisQuestions || [],
          spontanbericht: currentCase.spontanbericht || '',
          modalitaetenBesser: currentCase.modalitaetenBesser || '',
          modalitaetenSchlechter: currentCase.modalitaetenSchlechter || '',
          gemuetPsyche: currentCase.gemuetPsyche || '',
          koerperAllgemein: currentCase.koerperAllgemein || '',
          lokalsymptome: currentCase.lokalsymptome || '',
          bisherigeMittel: currentCase.bisherigeMittel || '',
          id: selectedCaseId || undefined,
          analyzedAt: new Date().toISOString(),
          clinicalAnalysis: fullAnalysis,
          remedySuggestions: results.map(r => ({
            name: r.name,
            potency: r.potency,
            score: r.score,
            keyIndicators: r.keyIndicators,
            description: r.description,
          })),
        });
        setSelectedCaseId(saved.id);
        refreshCases();
      }
    } catch (error) {
      console.error("Clinical analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const goToNextStep = () => {
    if (!hasPatientData) {
      openModal('stammdaten');
      setIsStammdatenModalOpen(true);
      return;
    }
    if (currentStep < totalWizardSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  useEffect(() => {
    if (!hasPatientData && currentStep !== 1) {
      setCurrentStep(1);
    }
  }, [hasPatientData, currentStep]);

  const renderCasesListContent = (isDrawerMode = false) => {
    let displayCases: PatientCase[] = [];

    if (caseSearchQuery.trim()) {
      const q = caseSearchQuery.toLowerCase();
      displayCases = cases.filter(
        (c) =>
          (c.patientName && c.patientName.toLowerCase().includes(q)) ||
          (c.hauptbeschwerde && c.hauptbeschwerde.toLowerCase().includes(q)) ||
          (c.spontanbericht && c.spontanbericht.toLowerCase().includes(q))
      );
    } else if (selectedCaseId) {
      const activeCaseObj = cases.find((c) => c.id === selectedCaseId);
      const activePatientName = (activeCaseObj?.patientName || currentCase.patientName || '').trim().toLowerCase();
      if (activePatientName) {
        displayCases = cases.filter(
          (c) => c.patientName && c.patientName.trim().toLowerCase() === activePatientName
        );
      } else {
        displayCases = cases.filter((c) => c.id === selectedCaseId);
      }
    } else if (currentCase.patientName && currentCase.patientName.trim()) {
      const activePatientName = currentCase.patientName.trim().toLowerCase();
      const matchingCases = cases.filter(
        (c) => c.patientName && c.patientName.trim().toLowerCase() === activePatientName
      );
      if (matchingCases.length > 0) {
        displayCases = matchingCases;
      }
    }

    if (displayCases.length === 0) {
      if (caseSearchQuery.trim()) {
        return (
          <div className="mt-3 text-center py-6 text-slate-400 text-xs">
            <span>{t('noMatchingCasesFound')}</span>
          </div>
        );
      }

      const hasCustomerData = Boolean(
        (currentCase.patientName && currentCase.patientName.trim()) ||
        currentCase.patientBirthDate ||
        (currentCase.patientPhone && currentCase.patientPhone.trim()) ||
        (currentCase.patientEmail && currentCase.patientEmail.trim()) ||
        selectedCaseId
      );

      if (!hasCustomerData) {
        return (
          <div className="mt-3 text-center py-6 px-3 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-xs space-y-2.5">
            <p className="text-slate-400 text-xs">{t('noCasesRecordedYet' as TranslationKey) || 'Noch keine Fälle vorhanden'}</p>
          </div>
        );
      }

      return (
        <div className="mt-3 text-center py-6 px-3 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-xs space-y-2.5">
          <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 mx-auto flex items-center justify-center border border-teal-100">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-xs">{t('newAdmissionActive')}</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              {t('newAdmissionEmptyDesc')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              openModal('patient_select');
              setIsPatientSelectionModalOpen(true);
              if (isDrawerMode) setIsCasesDrawerOpen(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-teal-800 hover:border-teal-300 shadow-2xs transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>{t('selectExistingPatientBtn')}</span>
          </button>
        </div>
      );
    }

    const patientMap = new Map<string, PatientCase[]>();
    displayCases.forEach(c => {
      const nameKey = (c.patientName || 'Unbenannter Patient').trim();
      if (!patientMap.has(nameKey)) {
        patientMap.set(nameKey, []);
      }
      patientMap.get(nameKey)!.push(c);
    });

    patientMap.forEach((pList) => {
      pList.sort((a, b) => {
        const da = new Date(a.anamneseDatum || a.analyzedAt || 0).getTime();
        const db = new Date(b.anamneseDatum || b.analyzedAt || 0).getTime();
        if (db !== da) return db - da;
        return (b.id || '').localeCompare(a.id || '');
      });
    });

    return (
      <div className={`mt-3 space-y-3 ${isDrawerMode ? 'max-h-[calc(100vh-280px)]' : 'max-h-[480px]'} overflow-y-auto pr-1 custom-scrollbar`}>
        {Array.from(patientMap.entries()).map(([patientName, pCases]) => {
          const hasManyCases = pCases.length > 10;

          return (
            <div key={patientName} className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-200/60">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0 font-serif">
                    {patientName.split(' ').map(n => n[0]).slice(0, 2).join('') || 'P'}
                  </div>
                  <span className="font-bold text-slate-900 text-xs truncate">
                    {patientName}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                    {pCases.length} {pCases.length === 1 ? t('singleCase') : t('multipleCases')}
                  </span>
                </div>
              </div>

              <div className={`space-y-1 ${hasManyCases ? 'max-h-[300px] overflow-y-auto pr-1 custom-scrollbar border border-slate-200/60 p-1 rounded-lg bg-white/70' : ''}`}>
                {pCases.map((c, cIdx) => {
                  const isSelected = selectedCaseId === c.id;
                  const dateFormatted = c.anamneseDatum 
                    ? new Date(c.anamneseDatum).toLocaleDateString(language) 
                    : t('admissionPending');

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        handleSelectCase(c);
                        if (isDrawerMode) setIsCasesDrawerOpen(false);
                      }}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between group ${
                        isSelected
                          ? 'bg-teal-50/90 border-teal-300 text-teal-950 font-medium shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-bold text-teal-800">
                            {t('caseNumber').replace('{num}', pCases.length > 1 ? String(pCases.length - cIdx) : '1')}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 font-medium">
                            {t('admissionDatePrefix')}: {dateFormatted}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-700 line-clamp-1 font-normal">
                          {c.hauptbeschwerde || t('caseNotAnalyzed')}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        {c.analyzedAt && (
                          <span className="w-2 h-2 rounded-full bg-teal-500" title="Analysiert" />
                        )}
                        <button
                          onClick={(e) => handleDeleteCase(c.id, e)}
                          title="Löschen"
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-4rem)] bg-slate-50 w-full">
      {/* Sidebar (Sticky on desktop, bottom-aligned with viewport) */}
      <div className="hidden md:flex w-full md:w-64 bg-slate-100 border-r border-slate-200 flex-col flex-shrink-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:max-h-[calc(100vh-4rem)] md:self-start z-20 shadow-xs">
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 mb-8 px-2">
            <Stethoscope className="w-6 h-6 text-teal-600" />
            <span className="font-bold text-lg text-slate-800">{t('practice')}</span>
          </div>
          
          <div className="space-y-1">
            {/* 1. Patienten- & Kundenkartei */}
            {!isTabHidden('patients') && (
              <button
                type="button"
                onClick={() => handleSelectTab('patients')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  panelTab === 'patients'
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-100/50'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${isTabAllowed('patients') ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className={!isTabAllowed('patients') ? 'text-slate-500' : ''}>{termPatientenkartei}</span>
                </div>
                {!isTabAllowed('patients') && (
                  <span title={t('tariffPageLockedTooltip')}>
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </span>
                )}
              </button>
            )}

            {/* 2. Akutanalyse */}
            {!isTabHidden('quickintake') && (
              <button
                type="button"
                id="sidebar-nav-tab-quickintake"
                onClick={() => handleSelectTab('quickintake')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  panelTab === 'quickintake'
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-100/50'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Mic className={`w-4 h-4 ${isTabAllowed('quickintake') ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className={!isTabAllowed('quickintake') ? 'text-slate-500' : ''}>{t('tabQuickIntake')}</span>
                </div>
                {!isTabAllowed('quickintake') && (
                  <span title={t('tariffPageLockedTooltip')}>
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </span>
                )}
              </button>
            )}


            {/* 3. Repertorium */}
            {!isTabHidden('repertorium') && (
              <button
                type="button"
                id="sidebar-nav-tab-repertorium"
                onClick={() => handleSelectTab('repertorium')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  panelTab === 'repertorium'
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-100/50'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className={`w-4 h-4 ${isTabAllowed('repertorium') ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className={!isTabAllowed('repertorium') ? 'text-slate-500' : ''}>{t('tabRepertorium')}</span>
                </div>
                {!isTabAllowed('repertorium') && (
                  <span title={t('tariffPageLockedTooltip')}>
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </span>
                )}
              </button>
            )}

            {/* 4. Repertorisation */}
            {!isTabHidden('cases') && (
              <button
                type="button"
                onClick={() => handleSelectTab('cases')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  panelTab === 'cases'
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-100/50'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className={`w-4 h-4 ${isTabAllowed('cases') ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className={!isTabAllowed('cases') ? 'text-slate-500' : ''}>{t('tabCaseManagement')}</span>
                </div>
                {!isTabAllowed('cases') && (
                  <span title={t('tariffPageLockedTooltip')}>
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </span>
                )}
              </button>
            )}

            {/* 5. Materia Medica */}
            {!isTabHidden('materiamedica') && (
              <button
                type="button"
                id="sidebar-nav-tab-materiamedica"
                onClick={() => handleSelectTab('materiamedica')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  panelTab === 'materiamedica'
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-100/50'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className={`w-4 h-4 ${isTabAllowed('materiamedica') ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className={!isTabAllowed('materiamedica') ? 'text-slate-500' : ''}>{t('tabMateriaMedica')}</span>
                </div>
                {!isTabAllowed('materiamedica') && (
                  <span title={t('tariffPageLockedTooltip')}>
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </span>
                )}
              </button>
            )}

            {/* 6. Medikamente & Analyse */}
            {!isTabHidden('medications') && (
              <button
                type="button"
                id="sidebar-nav-tab-medications"
                onClick={() => handleSelectTab('medications')}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  panelTab === 'medications'
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-100/50'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Pill className={`w-4 h-4 ${isTabAllowed('medications') ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className={!isTabAllowed('medications') ? 'text-slate-500' : ''}>{t('tabMedications')}</span>
                </div>
                {!isTabAllowed('medications') && (
                  <span title={t('tariffPageLockedTooltip')}>
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Sidebar Footer - User Profile & Collapsible Menu */}
        <div ref={userMenuRef} className="p-3 border-t border-slate-200 bg-slate-100 mt-auto shrink-0 relative">
          <button
            type="button"
            id="sidebar-user-menu-trigger"
            onClick={() => setIsUserMenuOpen(prev => !prev)}
            className={`w-full flex items-center gap-2.5 p-2 rounded-xl border transition-all text-left cursor-pointer group select-none ${
              isUserMenuOpen
                ? 'bg-white border-teal-400/80 shadow-xs ring-2 ring-teal-500/10'
                : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
            }`}
            aria-expanded={isUserMenuOpen}
            aria-controls="sidebar-user-submenu"
            aria-label={t('navProfile' as TranslationKey)}
          >
            <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              {therapist.vorname[0]}{therapist.nachname[0]}
            </div>
            <div className="overflow-hidden min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate group-hover:text-teal-900 transition-colors">
                {therapist.vorname} {therapist.nachname}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {therapist.email}
              </div>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform duration-250 shrink-0 ${
                isUserMenuOpen ? 'rotate-180 text-teal-600' : ''
              }`} 
            />
          </button>
          
          {/* Klappt nach unten auf */}
          <div
            id="sidebar-user-submenu"
            className={`overflow-hidden transition-all duration-250 ease-in-out ${
              isUserMenuOpen
                ? 'max-h-64 opacity-100 mt-2 space-y-1'
                : 'max-h-0 opacity-0 pointer-events-none mt-0'
            }`}
          >
            <button 
              type="button"
              id="sidebar-nav-tab-profile"
              onClick={() => handleSelectTab('profile')}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${
                panelTab === 'profile'
                  ? 'bg-teal-50 text-teal-900 font-bold border border-teal-100/50'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>{t('navProfile' as TranslationKey)}</span>
            </button>
            
            <button 
              type="button"
              id="sidebar-nav-tab-tariff"
              onClick={() => handleSelectTab('tariff')}
              className={`w-full text-left px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${
                panelTab === 'tariff'
                  ? 'bg-teal-50 text-teal-900 font-bold border border-teal-100/50'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>{t('navSettings' as TranslationKey)}</span>
            </button>

            {!isTabHidden('documentation') && (
              <button
                type="button"
                id="sidebar-nav-tab-documentation"
                onClick={() => handleSelectTab('documentation')}
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  panelTab === 'documentation'
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-100/50'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={`w-4 h-4 ${isTabAllowed('documentation') ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className={!isTabAllowed('documentation') ? 'text-slate-500' : ''}>{t('tabDocumentation')}</span>
                </div>
                {!isTabAllowed('documentation') && (
                  <span title={t('tariffPageLockedTooltip')}>
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </span>
                )}
              </button>
            )}
            
            <button 
              type="button"
              id="sidebar-nav-logout"
              onClick={() => onLogout && onLogout()}
              className="w-full text-left px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('navLogout' as TranslationKey)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto w-full">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* TAB CONTENT 1: THERAPIST PROFILE & MASTER DATA WITH CONTACT HISTORY */}
      {panelTab === 'profile' && (
        <TherapistProfileEditor 
          therapist={therapist} 
          onUpdated={() => showToast(t('profileSaveSuccess'))}
        />
      )}

      {/* TAB CONTENT 2: TARIFF OVERVIEW & SWITCHER */}
      {panelTab === 'tariff' && (
        <TherapistTariffManager 
          therapist={therapist} 
          onTariffChanged={() => showToast(t('tariffSwitchSuccess'))}
        />
      )}

      {/* TAB CONTENT 3: PATIENT DIRECTORY & CUSTOMER RECORDS */}
      {panelTab === 'patients' && (
        <PatientDirectoryView
          therapist={therapist}
          initialOpenAction={patientDirectoryAction}
          onActionHandled={() => setPatientDirectoryAction(null)}
          onOpenCaseInWorkspace={(selectedCase) => {
            handleSelectCase(selectedCase);
            handleSelectTab('cases');
          }}
          onNewCaseForPatient={(patientName, defaults) => {
            handleNewCase();
            setCurrentCase(prev => ({
              ...prev,
              patientName,
              ...defaults,
            }));
            handleSelectTab('cases');
          }}
        />
      )}

      {/* TAB CONTENT 4: MATERIA MEDICA */}
      {panelTab === 'materiamedica' && (
        <MateriaMedicaView
          onSelectRemedyForCase={(remedyName, potency) => {
            handleSelectTab('cases');
            setCurrentCase(prev => ({
              ...prev,
              repertorisationErgebnis: remedyName,
              verordnungPotenz: potency,
            }));
          }}
          onGoToAcuteIntake={() => handleSelectTab('quickintake')}
        />
      )}

      {/* TAB CONTENT: REPERTORIUM (BOERICKE & KENT) */}
      {panelTab === 'repertorium' && (
        <RepertoriumView
          therapist={therapist}
          currentCase={currentCase}
          onSaveCase={(saved) => setCurrentCase(saved)}
          onSelectRemedyForCase={(remedyName, potency) => {
            handleSelectTab('cases');
            setCurrentCase(prev => ({
              ...prev,
              repertorisationErgebnis: remedyName,
              verordnungPotenz: potency,
            }));
          }}
          onGoToMateriaMedica={() => handleSelectTab('materiamedica')}
        />
      )}

      {/* TAB CONTENT 5: AKUTAUFNAHME & VOICE-ANALYSE */}
      {panelTab === 'quickintake' && (
        <AcuteIntakeView
          onSelectRemedyForCase={(remedyName, potency) => {
            handleSelectTab('cases');
            setCurrentCase(prev => ({
              ...prev,
              repertorisationErgebnis: remedyName,
              verordnungPotenz: potency,
            }));
          }}
          onGoToMateriaMedica={() => handleSelectTab('materiamedica')}
        />
      )}

      {/* TAB CONTENT: MEDIKAMENTE & ARZNEIMITTELRECHERCHE */}
      {panelTab === 'medications' && (
        <MedicationResearchView
          currentCase={currentCase}
          allCases={cases}
          onSelectCase={(caseId) => {
            const targetCase = cases.find(c => c.id === caseId);
            if (targetCase) {
              setSelectedCaseId(targetCase.id);
              setCurrentCase(targetCase);
            }
          }}
          onOpenMedicationsModal={(autoAddNew) => {
            setMedicationsModalAutoAddNew(Boolean(autoAddNew));
            setIsMedicationsModalOpen(true);
          }}
          onUpdateCase={(updatedCase) => {
            setCurrentCase(updatedCase);
            refreshCases();
          }}
        />
      )}

      {/* TAB CONTENT 5: USER MANUAL & DOCUMENTATION */}
      {panelTab === 'documentation' && (
        <UserManualView
          onNavigateTab={(tab) => handleSelectTab(tab)}
          onGoToAdmin={onGoToAdmin}
        />
      )}

      {/* TAB CONTENT 5: CASE RECORDS & SEQUENTIAL REPERTORISATION WORKFLOW */}
      {panelTab === 'cases' && (
        <div className="space-y-6">
          {!hasPatientData ? (
            /* START-LAYOUT WIE IM BILD (ohne Erfolgsleiste, mit oberem Teil, Auswahlkarte und zuletzt bearbeiteten Kunden) */
            <div className="space-y-6">
              {/* Prompt Card: Wählen Sie einen Patienten aus */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4 mx-auto shadow-2xs">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 font-serif mb-2">
                  {t('selectPatientPrompt')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                  {t('selectPatientPromptSub')}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    id="btn-case-doc-new-patient"
                    onClick={handleStartNewPatient}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('btnNewPatientAdmission')}</span>
                  </button>

                  <button
                    type="button"
                    id="btn-case-doc-select-patient"
                    onClick={() => {
                      openModal('patient_select');
                      setIsPatientSelectionModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-teal-600" />
                    <span>{t('btnOpenPatientSelectionModal')}</span>
                  </button>
                </div>
              </div>

              {/* Zuletzt bearbeitete Kunden (3) */}
              {recentEditedPatients.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span>{t('recentEditedPatientsHeader')} ({recentEditedPatients.length})</span>
                    </h4>

                    <div className="flex items-center gap-3">
                      {groupedPatients.length > 3 && (
                        <button
                          type="button"
                          onClick={() => {
                            openModal('patient_select');
                            setIsPatientSelectionModalOpen(true);
                          }}
                          className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>{t('viewAllPatientsLink', { count: groupedPatients.length })}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className="text-[11px] text-slate-400">{t('clickOpensFileBadge')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentEditedPatients.map((p) => {
                      const initials = p.name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
                      const caseCount = p.cases.length;

                      return (
                        <div
                          key={p.key}
                          onClick={() => {
                            handleSelectCase(p.primaryCase);
                          }}
                          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-400 hover:shadow-md transition-all cursor-pointer space-y-3 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-teal-600 group-hover:bg-teal-700 text-white font-bold text-sm flex items-center justify-center shrink-0 transition-colors shadow-xs">
                                {initials || 'P'}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors truncate">
                                  {p.name}
                                </h4>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  {p.primaryCase.patientAge && <span>{p.primaryCase.patientAge} {t('yearsOld')}</span>}
                                  {p.primaryCase.patientGender && <span>• {getGenderLabel(p.primaryCase.patientGender)}</span>}
                                </div>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/60 shrink-0">
                              {caseCount} {caseCount === 1 ? t('caseSingle') : t('casePlural')}
                            </span>
                          </div>

                          {p.lastActivityFormatted && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                              <Clock className="w-3 h-3 text-teal-600 shrink-0" />
                              <span className="truncate">
                                {t('lastEdited')}: <strong className="font-semibold text-slate-700">{p.lastActivityFormatted}</strong>
                              </span>
                            </div>
                          )}

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="truncate">
                              {p.primaryCase.patientPhone || p.primaryCase.patientEmail || t('noContactData')}
                            </span>
                            <span className="text-teal-700 font-semibold flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                              <span>{t('patientRecord')}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ACTIVE PATIENT WORKSPACE (hasPatientData === true) */
            <>
              {/* DISCREET FLOATING TAB (Left Edge): 1-click access to cases */}
          {!isSidebarPinned && (
            <button
              type="button"
              id="btn-floating-cases-tab"
              onClick={() => setIsCasesDrawerOpen(true)}
              className="fixed left-0 top-1/2 -translate-y-1/2 z-30 bg-teal-700 hover:bg-teal-800 text-white py-3 px-2 rounded-r-xl shadow-lg flex flex-col items-center gap-2 cursor-pointer transition-all hover:pl-3 group select-none border-y border-r border-teal-600/70"
              title={t('viewAllCases' as TranslationKey) || 'Patientenfälle anzeigen'}
            >
              <FileText className="w-4 h-4 text-teal-100 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold tracking-wider uppercase [writing-mode:vertical-lr] rotate-180 text-teal-50">
                {t('patientCasesTab' as TranslationKey) || 'Fälle'} ({patientCasesCount})
              </span>
            </button>
          )}

          {/* DISCREET SLIDE-OVER CASES DRAWER (Modal Drawer) */}
          {isCasesDrawerOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in-50 duration-150">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
                onClick={() => setIsCasesDrawerOpen(false)}
              />

              <div className="fixed inset-y-0 left-0 max-w-full flex">
                <div className="w-screen max-w-sm sm:max-w-md bg-white shadow-2xl border-r border-slate-200 flex flex-col animate-in slide-in-from-left duration-200">
                  {/* Drawer Header */}
                  <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs font-serif font-bold text-sm shrink-0">
                        {patientInitials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                          {t('patientCasesTab' as TranslationKey) || 'Patientenfälle'} ({patientCasesCount})
                        </h3>
                        <p className="text-[11px] text-slate-500 truncate">
                          {currentCase.patientName || t('unnamedPatient')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Pin / Unpin Split-View */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSidebarPinned(true);
                          setIsCasesDrawerOpen(false);
                        }}
                        className="p-2 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-slate-200/70 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title={t('pinSidebar' as TranslationKey) || 'Seitenleiste anheften'}
                      >
                        <PanelLeft className="w-4 h-4" />
                        <span className="hidden sm:inline text-[11px] font-semibold">{t('pinSidebar' as TranslationKey) || 'Anheften'}</span>
                      </button>

                      {/* Close Button */}
                      <button
                        type="button"
                        onClick={() => setIsCasesDrawerOpen(false)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
                        title={t('closeCases' as TranslationKey) || 'Schließen'}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Drawer Body */}
                  <div className="p-4 sm:p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                    {/* Action buttons */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        id="btn-drawer-new-case"
                        onClick={() => {
                          handleNewCase();
                          setIsCasesDrawerOpen(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 py-2 px-3 rounded-xl transition-colors cursor-pointer border border-teal-200/70 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('newCaseBtn')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          openModal('patient_select');
                          setIsPatientSelectionModalOpen(true);
                          setIsCasesDrawerOpen(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-2 px-3 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                      >
                        <Users className="w-3.5 h-3.5 text-teal-700" />
                        <span>{t('patientFilesTab')}</span>
                      </button>
                    </div>

                    {/* Search box */}
                    <div className="relative flex items-center">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={t('searchExistingPatientPlaceholder')}
                        value={caseSearchQuery}
                        onChange={(e) => setCaseSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 h-[38px] shadow-2xs"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <VoiceInputButton
                          value={caseSearchQuery}
                          onChange={(val) => setCaseSearchQuery(val)}
                          size="xs"
                          mode="append"
                          id="btn-voice-drawer-case-search"
                        />
                      </div>
                    </div>

                    {/* Render Cases */}
                    {renderCasesListContent(true)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MAIN WORKSPACE LAYOUT (Full Width matching header, flush grid) */}
          <div className={isSidebarPinned ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full" : "w-full space-y-5"}>
            {/* Left Column (ONLY displayed if user chose to pin sidebar) */}
            {isSidebarPinned && (
              <div className="lg:col-span-4 space-y-5">
                <div className="card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span>
                        {selectedCaseId
                          ? t('patientCasesCount').replace('{count}', String(cases.filter(c => c.patientName && currentCase.patientName && c.patientName.trim().toLowerCase() === currentCase.patientName.trim().toLowerCase()).length || 1))
                          : caseSearchQuery.trim()
                          ? t('searchResultsCount').replace('{count}', String(cases.length))
                          : t('patientCasesNewAdmission')}
                      </span>
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {Boolean(selectedCaseId) && (
                        <button
                          id="btn-new-case"
                          onClick={handleNewCase}
                          title={t('btnNewPatientAdmission')}
                          className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-teal-200/60"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t('newCaseBtn')}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        id="btn-open-patient-selection-modal"
                        onClick={() => {
                          openModal('patient_select');
                          setIsPatientSelectionModalOpen(true);
                        }}
                        title={t('patientFilesTab')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors cursor-pointer border border-slate-200"
                      >
                        <Users className="w-3.5 h-3.5 text-teal-700" />
                        <span>{t('patientFilesTab')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSidebarPinned(false)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title={t('unpinSidebar' as TranslationKey) || 'Seitenleiste minimieren'}
                      >
                        <PanelLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Search Cases */}
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t('searchExistingPatientPlaceholder')}
                      value={caseSearchQuery}
                      onChange={(e) => setCaseSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 h-[38px] shadow-2xs"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <VoiceInputButton
                        value={caseSearchQuery}
                        onChange={(val) => setCaseSearchQuery(val)}
                        size="xs"
                        mode="append"
                        id="btn-voice-case-search"
                      />
                    </div>
                  </div>

                  {renderCasesListContent(false)}
                </div>
              </div>
            )}

            {/* Right Column: SEQUENTIAL CASE INPUT WIZARD */}
            <div className={isSidebarPinned ? "lg:col-span-8 space-y-5" : "space-y-5 w-full"}>
              {/* 1. KUNDENDATEN / PATIENT HEADER CARD (Clean single-row card matching layout in reference image) */}
              {hasPatientData && (
                <div className="w-full bg-white rounded-2xl border border-slate-200/80 px-5 py-4 shadow-xs relative">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-[#005f56] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 font-serif">
                        {patientInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-xl font-bold text-slate-900 font-serif">
                            {currentCase.patientName || t('unnamedPatient')}
                          </h2>
                          {/* Interactive discreet case count badge */}
                          <button
                            type="button"
                            id="btn-header-cases-badge"
                            onClick={() => setIsCasesDrawerOpen(true)}
                            className="px-3 py-0.5 rounded-full text-xs font-medium bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/90 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                            title={t('viewAllCases' as TranslationKey) || 'Patientenfälle anzeigen'}
                          >
                            <span>
                              {patientCasesCount === 1
                                ? t('registeredCaseSingle')
                                : t('registeredCases').replace('{count}', String(patientCasesCount))}
                            </span>
                            <ChevronDown className="w-3 h-3 text-teal-600" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {t('patientRecord')} • {t('lastConsultation')}: {lastConsultationFormatted}
                        </p>
                      </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Active case indicator */}
                      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-slate-500 font-normal">{t('activeCasePrefix')}:</span>
                        <span className="font-bold text-slate-900">
                          {t('caseNumber').replace('{num}', String(activeCaseNumber))}
                        </span>
                      </div>

                      {/* Master data edit button */}
                      <button
                        type="button"
                        id="btn-edit-master-data"
                        onClick={() => {
                          openModal('stammdaten');
                          setIsStammdatenModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t('editMasterData')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. STEP NAVIGATION BAR: Uniform gray for inactive, green for active */}
              {hasPatientData && (
                <div className={`w-full grid grid-cols-4 ${totalWizardSteps >= 8 ? 'sm:grid-cols-8' : totalWizardSteps === 7 ? 'sm:grid-cols-7' : totalWizardSteps === 6 ? 'sm:grid-cols-6' : 'sm:grid-cols-5'} gap-2 pb-1`}>
                  {wizardSteps.map((step, index) => {
                    const stepNum = index + 1;
                    const isActive = currentStep === stepNum;
                    const { status } = getStepInfo(stepNum);
                    const isComplete = status === 'complete';
                    const isPartial = status === 'partial';
                    const showCheckmark = isComplete || stepNum >= 7;

                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setCurrentStep(stepNum)}
                        className={`group relative flex flex-col items-center justify-center p-2.5 rounded-2xl text-center transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#00897b] text-white font-bold border border-[#00796b] shadow-xs after:content-[""] after:absolute after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:border-solid after:border-t-[#00897b] after:border-t-[8px] after:border-x-transparent after:border-x-[6px] after:border-b-0 after:z-20'
                            : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                        }`}
                        title={
                          isComplete
                            ? t('stepTooltipComplete', { name: step.name })
                            : isPartial
                            ? t('stepTooltipPartial', { name: step.name })
                            : t('stepTooltipEmpty', { name: step.name })
                        }
                      >
                        <div
                          className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] mb-1 font-mono font-bold ${
                            isActive
                              ? 'bg-[#00695c] text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {showCheckmark ? (
                            <Check className={`w-3.5 h-3.5 stroke-[2.5] ${isActive ? 'text-white' : 'text-slate-500'}`} />
                          ) : (
                            <span>{stepNum}</span>
                          )}
                        </div>
                        <span className={`text-[11px] leading-tight truncate w-full block ${isActive ? 'font-bold text-white' : 'font-medium text-slate-700'}`}>
                          {step.shortName || step.name.split('. ')[1] || step.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* If step 1 (Stammdaten) is active, show the structured 5-column overview card above the active step form card (matches reference image) */}
              {currentStepConfig.id === 'stammdaten' && hasPatientData && (
                <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex flex-col justify-center">
                      <span className="block text-[11px] text-slate-400 font-medium">{t('birthdateAndAge')}</span>
                      <span className="font-semibold text-slate-800 text-xs mt-1">
                        {currentCase.patientBirthDate || '—'} 
                        {currentCase.patientAge ? ` (${currentCase.patientAge} ${t('years')})` : ''}
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex flex-col justify-center">
                      <span className="block text-[11px] text-slate-400 font-medium">{t('genderAndStatus')}</span>
                      <span className="font-semibold text-slate-800 text-xs mt-1 truncate" title={currentCase.patientGender}>
                        {getGenderLabel(currentCase.patientGender)}
                        {currentCase.isPregnant 
                          ? ` • ${t('isPregnantYes')}${currentCase.pregnancyMonth ? ` (${currentCase.pregnancyMonth}. ${t('pregnancyMonthLabel')})` : ''}` 
                          : (currentCase.patientMaritalStatus ? ` • ${getMaritalStatusLabel(currentCase.patientMaritalStatus)}` : '')}
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex flex-col justify-center">
                      <span className="block text-[11px] text-slate-400 font-medium">{t('heightAndWeight')}</span>
                      <span className="font-semibold text-slate-800 text-xs mt-1">
                        {currentCase.patientHeightCm ? `${currentCase.patientHeightCm} cm` : '—'} 
                        {currentCase.patientWeightKg ? ` / ${currentCase.patientWeightKg} kg` : ''}
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 flex flex-col justify-center">
                      <span className="block text-[11px] text-slate-400 font-medium">{t('hasChildren')}</span>
                      <span className="font-semibold text-slate-800 text-xs mt-1 truncate">
                        {currentCase.hasChildren 
                          ? (currentCase.childrenCount !== undefined && currentCase.childrenCount > 0
                              ? t('childrenCountLabel').replace('{count}', String(currentCase.childrenCount))
                              : (currentCase.childrenList && currentCase.childrenList.length > 0
                                  ? t('childrenCountLabel').replace('{count}', String(currentCase.childrenList.length))
                                  : t('hasChildrenYes')))
                          : t('noChildren')}
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 sm:col-span-2 lg:col-span-1 flex flex-col justify-center">
                      <span className="block text-[11px] text-slate-400 font-medium">{t('contactData')}</span>
                      <div className="flex flex-col gap-1 font-semibold text-slate-800 mt-1 text-xs truncate">
                        {currentCase.patientPhone && (
                          <a href={`tel:${currentCase.patientPhone}`} className="hover:text-teal-700 flex items-center gap-1.5 truncate text-xs">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{currentCase.patientPhone}</span>
                          </a>
                        )}
                        {currentCase.patientEmail && (
                          <a href={`mailto:${currentCase.patientEmail}`} className="hover:text-teal-700 flex items-center gap-1.5 truncate text-xs">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{currentCase.patientEmail}</span>
                          </a>
                        )}
                        {!currentCase.patientPhone && !currentCase.patientEmail && (
                          <span className="text-slate-400">{t('noContactData')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Step Form Card */}
              <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
                {/* SEQUENTIAL STEP BODIES */}
                <div className="min-h-[120px]">
                {/* 1. STAMMDATEN */}
                {currentStepConfig.id === 'stammdaten' && (
                  <div className="space-y-6 animate-in fade-in-50 duration-150">
                    <div className="p-6 bg-white border border-teal-200/90 rounded-2xl">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base">{t('patientMasterData')}</h4>
                          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                            {t('sectionHintStammdaten')}
                          </p>
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              id="btn-step-stammdaten-edit"
                              onClick={() => {
                                openModal('stammdaten');
                                setIsStammdatenModalOpen(true);
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>{t('editMasterData')}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Supplementary details if present: children details or custom fields */}
                    {((currentCase.childrenList && currentCase.childrenList.length > 0) || (currentCase.customStammdaten && currentCase.customStammdaten.length > 0)) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentCase.hasChildren && currentCase.childrenList && currentCase.childrenList.length > 0 && (
                          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-2">
                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <Baby className="w-4 h-4 text-teal-600" />
                              <span>{t('hasChildren')} ({currentCase.childrenList.length})</span>
                            </h4>
                            <div className="space-y-1.5">
                              {currentCase.childrenList.map((ch, idx) => (
                                <div key={ch.id || idx} className="text-xs bg-white px-3 py-2 rounded-lg border border-slate-100 flex items-center justify-between">
                                  <span className="font-semibold text-slate-800">{ch.name || t('childEntryLabel', { index: idx + 1 })}</span>
                                  <span className="text-slate-500">
                                    {ch.birthDate ? `${ch.birthDate}${ch.age ? ` (${ch.age} J.)` : ''}` : (ch.age ? `${ch.age} Jahre` : '')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {currentCase.customStammdaten && currentCase.customStammdaten.length > 0 && (
                          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-2">
                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <Layers className="w-4 h-4 text-teal-600" />
                              <span>{t('extraFields')} ({currentCase.customStammdaten.length})</span>
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {currentCase.customStammdaten.map((cs) => (
                                <div key={cs.id} className="text-xs bg-white px-3 py-2 rounded-lg border border-slate-100">
                                  <strong className="text-slate-600">{cs.name}: </strong>
                                  <span className="text-slate-800 font-semibold">{cs.value || '—'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. HAUPTBESCHWERDE & DYNAMISCHE FRAGEN */}
                {currentStepConfig.id === 'hauptbeschwerde' && (
                  <div className="space-y-6 animate-in fade-in-50 duration-150">
                    {/* Main Intake Card: Styled exactly like Akutanalyse Bild 2 */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col space-y-4 relative overflow-hidden">
                      {/* Header Row: HAUPTBESCHWERDE & LEITSYMPTOM * on left, Eingabe löschen on right */}
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider" htmlFor="input-hauptbeschwerde">
                          {t('mainComplaintTitle')}
                        </label>
                        {currentCase.hauptbeschwerde?.trim() && (
                          <button
                            type="button"
                            id="btn-clear-hauptbeschwerde"
                            onClick={() => {
                              handleUpdateHauptbeschwerde('');
                              if (hauptbeschwerdeRef.current) {
                                hauptbeschwerdeRef.current.focus();
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold cursor-pointer transition-colors"
                            title={t('clearHauptbeschwerdeBtn')}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>{t('clearHauptbeschwerdeBtn')}</span>
                          </button>
                        )}
                      </div>

                      {/* Side-by-Side: Textarea on the left, Vertical Aufnahme Button on the right */}
                      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                        <div className="relative flex-1 min-w-0">
                          <textarea
                            id="input-hauptbeschwerde"
                            ref={hauptbeschwerdeRef}
                            rows={5}
                            placeholder={t('mainComplaintPlaceholder')}
                            value={currentCase.hauptbeschwerde || ''}
                            onChange={(e) => handleUpdateHauptbeschwerde(e.target.value)}
                            className="w-full h-full min-h-[140px] p-4 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-none pr-9 shadow-2xs"
                          />
                          {currentCase.hauptbeschwerde?.trim() && (
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateHauptbeschwerde('');
                                if (hauptbeschwerdeRef.current) {
                                  hauptbeschwerdeRef.current.focus();
                                }
                              }}
                              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer transition-colors"
                              title={t('clearHauptbeschwerdeBtn')}
                              aria-label={t('clearHauptbeschwerdeBtn')}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="w-full sm:w-32 md:w-36 shrink-0 flex items-stretch">
                          <VoiceInputButton
                            value={currentCase.hauptbeschwerde || ''}
                            onChange={(val) => handleUpdateHauptbeschwerde(val)}
                            size="card"
                            mode="append"
                            context="main_complaint"
                            id="btn-voice-hauptbeschwerde"
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                    </div>

                      {/* Visual Live Tags for Detected Complaints */}
                      {currentCase.hauptbeschwerde?.trim() && (() => {
                        const detected = splitMultipleComplaints(currentCase.hauptbeschwerde || '');
                        if (detected.length === 0) return null;
                        return (
                          <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-teal-700" />
                                {detected.length > 1
                                  ? t('separateComplaintsDetected', { count: detected.length })
                                  : t('singleSymptomDetected')}
                              </span>
                              <span className="text-[10px] text-teal-700 font-medium">
                                {t('autoComplaintSeparation')}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {detected.map((complaint, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-800 border border-teal-300 shadow-2xs"
                                >
                                  <span className="w-4 h-4 rounded-full bg-teal-700 text-white text-[10px] font-bold flex items-center justify-center font-mono shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span className="font-bold text-teal-950">{complaint}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                    {/* Homoeopathic In-Depth Anamnesis (Popup Card matching Medikamente layout) */}
                    {(() => {
                      const hasQuestionsAnswered = (currentCase.anamnesisQuestions || []).some(q => (q.answerText && q.answerText.trim().length > 0) || (q.answerChoice && q.answerChoice.trim().length > 0));
                      const answeredCount = (currentCase.anamnesisQuestions || []).filter(q => (q.answerText && q.answerText.trim().length > 0) || (q.answerChoice && q.answerChoice.trim().length > 0)).length;

                      return (
                        <div className="p-6 bg-[#f0fdfa]/40 border border-teal-200/90 rounded-2xl">
                          <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-teal-100/70 text-teal-600 flex items-center justify-center shrink-0">
                              <Stethoscope className="w-5 h-5 text-teal-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                                  {t('complaintWizardCardTitle')}
                                </h4>
                                {hasQuestionsAnswered && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-semibold border border-teal-200">
                                    {answeredCount} {t('activeSectionCompletedBadge')}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                                {t('complaintWizardCardDesc')}
                              </p>
                              <div className="mt-4 flex flex-col gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    id="btn-open-complaint-wizard"
                                    onClick={handleStartComplaintWizard}
                                    disabled={!currentCase.hauptbeschwerde?.trim() || isPreloadingWizard}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00897b] hover:bg-[#00796b] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                                  >
                                    {isPreloadingWizard ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        <span>{wizardStatusText || t('wizardLoadingProgress')}</span>
                                      </>
                                    ) : hasQuestionsAnswered ? (
                                      <>
                                        <FolderOpen className="w-4 h-4" />
                                        <span>{t('btnResumeComplaintWizard')}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-4 h-4" />
                                        <span>{t('btnOpenComplaintWizard')}</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                {/* Professional, subtle loading bar while analyzing before opening the popup */}
                                {isPreloadingWizard && (
                                  <div className="max-w-md bg-white/95 border border-teal-200 p-3.5 rounded-xl shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                      <span className="font-semibold text-teal-950 flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
                                        </span>
                                        {wizardStatusText}
                                      </span>
                                      <span className="font-bold text-teal-700 font-mono text-xs">{wizardProgress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-teal-100/80 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 rounded-full transition-all duration-300 ease-out shadow-xs"
                                        style={{ width: `${wizardProgress}%` }}
                                      />
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                                      <span>6-Säulen-Matrix: Causa, Lokalisation, Sensation, Modalitäten, Begleitsymptome, Gemüt</span>
                                      <span className="font-medium text-teal-700">Organon §§ 83–104</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 3. FRAGEBOGEN */}
                {currentStepConfig.id === 'fragebogen' && (() => {
                  const ext = currentCase.extendedAnamnesis || {};
                  const hasExtAnamnesis = Object.entries(ext).some(([_, v]) => 
                    v !== undefined && v !== null && v !== '' && (!Array.isArray(v) || v.length > 0)
                  );

                  return (
                    <div className="space-y-6 animate-in fade-in-50 duration-150">
                      <div className="p-6 bg-[#f0fdfa]/40 border border-teal-200/90 rounded-2xl">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl bg-teal-100/70 text-teal-600 flex items-center justify-center shrink-0">
                            <Stethoscope className="w-5 h-5 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-sm sm:text-base">{t('extAnamnesisTitle' as TranslationKey)}</h4>
                            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                              {t('extAnamnesisDesc' as TranslationKey)}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                id="btn-open-extended-anamnesis-wizard"
                                onClick={() => {
                                  openModal('wizard');
                                  setIsExtendedAnamnesisWizardOpen(true);
                                }}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                              >
                                {hasExtAnamnesis ? (
                                  <>
                                    <FolderOpen className="w-4 h-4" />
                                    <span>{t('btnOpenQuestionnaire' as TranslationKey)}</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4" />
                                    <span>{t('btnStartQuestionnaire' as TranslationKey)}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* BEFUND */}
                {currentStepConfig.id === 'befund' && (() => {
                  const bd = currentCase.befundDetails || {};
                  const hasBefund = Boolean(
                    (bd.gesamtbeurteilung && bd.gesamtbeurteilung.trim() !== '') ||
                    (bd.blutdruck && bd.blutdruck.trim() !== '') ||
                    (bd.puls && bd.puls.trim() !== '') ||
                    (bd.temperatur && bd.temperatur.trim() !== '') ||
                    (bd.spo2 && bd.spo2.trim() !== '') ||
                    (bd.gewicht && bd.gewicht.trim() !== '') ||
                    (bd.allgemeinzustand && bd.allgemeinzustand.trim() !== '') ||
                    (bd.herzLunge && bd.herzLunge.trim() !== '') ||
                    (bd.abdomen && bd.abdomen.trim() !== '') ||
                    (bd.hautSchleimhaeute && bd.hautSchleimhaeute.trim() !== '') ||
                    (bd.neurologisch && bd.neurologisch.trim() !== '') ||
                    (bd.weitereBefunde && bd.weitereBefunde.trim() !== '') ||
                    (bd.customFelder && bd.customFelder.some(f => f.name?.trim() || f.value?.trim())) ||
                    (currentCase.befundText && currentCase.befundText.trim() !== '')
                  );

                  return (
                    <div className="space-y-6 animate-in fade-in-50 duration-150">
                      <div className="p-6 bg-[#f0fdfa]/40 border border-teal-200/90 rounded-2xl">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl bg-teal-100/70 text-teal-600 flex items-center justify-center shrink-0">
                            <Activity className="w-5 h-5 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-sm sm:text-base">{t('clinicalFindings' as TranslationKey)}</h4>
                            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                              {t('clinicalFindingsDesc' as TranslationKey)}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                id="btn-open-findings-modal"
                                onClick={() => {
                                  openModal('findings');
                                  setIsFindingsModalOpen(true);
                                }}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                              >
                                {hasBefund ? (
                                  <>
                                    <FolderOpen className="w-4 h-4" />
                                    <span>{t('btnOpenQuestionnaire' as TranslationKey)}</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4" />
                                    <span>{t('btnStartQuestionnaire' as TranslationKey)}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* MEDIKAMENTENEINNAHME */}
                {currentStepConfig.id === 'medikamente' && (() => {
                  const list = currentCase.medikamenteList || [];
                  const validMeds = list.filter(m => m.name && m.name.trim() !== '');
                  const hasMeds = validMeds.length > 0;

                  return (
                    <div className="space-y-6 animate-in fade-in-50 duration-150">
                      <div className="p-6 bg-[#f0fdfa]/40 border border-teal-200/90 rounded-2xl">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl bg-teal-100/70 text-teal-600 flex items-center justify-center shrink-0">
                            <Pill className="w-5 h-5 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-sm sm:text-base">{t('medicationIntakeTitle' as TranslationKey)}</h4>
                            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                              {t('medicationIntakeDesc' as TranslationKey)}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                id="btn-open-medications-wizard"
                                onClick={() => {
                                  openModal('medications');
                                  setIsMedicationsModalOpen(true);
                                }}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                              >
                                {hasMeds ? (
                                  <>
                                    <FolderOpen className="w-4 h-4" />
                                    <span>{t('btnOpenQuestionnaire' as TranslationKey)}</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4" />
                                    <span>{t('btnStartQuestionnaire' as TranslationKey)}</span>
                                  </>
                                )}
                              </button>

                              {hasMeds && (
                                <button
                                  type="button"
                                  id="btn-add-another-medication"
                                  onClick={() => {
                                    openModal('medications');
                                    setIsMedicationsModalOpen(true);
                                  }}
                                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-teal-700 border border-teal-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{t('addMedication' as TranslationKey)}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ausgewählte Medikamente (wird nur angezeigt, wenn bereits Medikamente erfasst wurden) */}
                      {hasMeds && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
                                <Pill className="w-4 h-4" />
                              </div>
                              <h4 className="font-bold text-slate-900 text-sm">
                                {t('selectedMedicationsTitle' as TranslationKey, { count: validMeds.length })}
                              </h4>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                openModal('medications');
                                setIsMedicationsModalOpen(true);
                              }}
                              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>{t('medManageBtn' as TranslationKey)}</span>
                            </button>
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600 select-none">
                                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                                  <th className="py-2.5 px-3">{t('medication' as TranslationKey) || 'Medikament'}</th>
                                  <th className="py-2.5 px-3">{t('dosage' as TranslationKey) || 'Dosierung'}</th>
                                  <th className="py-2.5 px-3">{t('intake' as TranslationKey) || 'Einnahme'}</th>
                                  <th className="py-2.5 px-3">{t('medReasonLabel' as TranslationKey) || 'Grund / Indikation'}</th>
                                  <th className="py-2.5 px-3 text-right w-24">{t('medTableColActions' as TranslationKey) || 'Aktionen'}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {validMeds.map((med, idx) => {
                                  const dbMatch = COMMON_MEDICATIONS_DB.find(dbMed =>
                                    dbMed.name.toLowerCase() === med.name.trim().toLowerCase() ||
                                    med.name.toLowerCase().includes(dbMed.name.toLowerCase()) ||
                                    dbMed.name.toLowerCase().includes(med.name.toLowerCase())
                                  );
                                  const rawActive = med.wirkstoff || dbMatch?.activeSubstance;
                                  const localized = localizeStructuredMedication({
                                    name: med.name,
                                    activeSubstance: rawActive,
                                  }, language as any);

                                  const hasInteractions = Boolean(
                                    (med.wechselwirkungen && med.wechselwirkungen.length > 0) ||
                                    med.risiken ||
                                    (med.nebenwirkungen && med.nebenwirkungen.length > 0)
                                  );

                                  // Clean up any double "x x" in intake if present
                                  const cleanedIntake = (med.einnahmeart || '').replace(/\b(\d+)\s*[xX×]\s+[xX×]\s*/g, '$1x ');

                                  return (
                                    <tr
                                      key={(med as any)._id || (med as any).id || idx}
                                      className="hover:bg-slate-50/70 transition-colors"
                                    >
                                      <td className="py-2.5 px-3 text-center text-[11px] text-slate-400 font-mono">
                                        {idx + 1}
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-bold text-slate-900 text-xs">
                                            {med.name}
                                          </span>
                                          {hasInteractions && (
                                            <span
                                              title={t('medInteractionsRecordedTooltip' as TranslationKey) || 'Risiken/Interaktionen erfasst'}
                                              className="inline-flex items-center text-amber-600"
                                            >
                                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                            </span>
                                          )}
                                        </div>
                                        {(localized.activeSubstance || rawActive) && (
                                          <div className="text-[11px] text-slate-500 font-normal truncate max-w-xs mt-0.5">
                                            {localized.activeSubstance || rawActive}
                                          </div>
                                        )}
                                      </td>
                                      <td className="py-2.5 px-3 whitespace-nowrap text-xs font-medium text-slate-800">
                                        {med.dosierung || <span className="text-slate-400 font-normal">-</span>}
                                      </td>
                                      <td className="py-2.5 px-3 whitespace-nowrap text-xs font-medium text-slate-700">
                                        {cleanedIntake || <span className="text-slate-400 font-normal">-</span>}
                                      </td>
                                      <td className="py-2.5 px-3 text-xs text-slate-600">
                                        {med.grund || <span className="text-slate-400 font-normal">-</span>}
                                      </td>
                                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              openModal('medications');
                                              setIsMedicationsModalOpen(true);
                                            }}
                                            title={t('btnEditMedication' as TranslationKey)}
                                            className="p-1 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                          </button>

                                          {deleteMedConfirmIndex === idx ? (
                                            <div className="flex items-center gap-1 bg-red-50 p-0.5 rounded border border-red-200">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  handleDeleteMedicationFromCase(idx);
                                                  setDeleteMedConfirmIndex(null);
                                                }}
                                                className="px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                              >
                                                {t('yes' as TranslationKey)}
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setDeleteMedConfirmIndex(null)}
                                                className="px-1.5 py-0.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-medium cursor-pointer"
                                              >
                                                {t('no' as TranslationKey)}
                                              </button>
                                            </div>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={() => setDeleteMedConfirmIndex(idx)}
                                              title={t('btnDelete' as TranslationKey)}
                                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ÜBERSICHT */}
                {currentStepConfig.id === 'uebersicht' && (
                  <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-5 animate-in fade-in-50 duration-150">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm sm:text-base">{t('stepSummaryTitle')}</h3>
                      <p className="text-xs text-slate-500 mt-1">{t('stepSummaryDesc')}</p>
                    </div>

                    <div className="space-y-3.5 text-sm">
                      {/* 1. Stammdaten Accordion */}
                      <div className={`rounded-xl border bg-white shadow-xs overflow-hidden transition-all duration-200 ${
                        summaryConfirmedSections.stammdaten ? 'border-teal-300 ring-1 ring-teal-200/50' : 'border-slate-200'
                      }`}>
                        {/* Accordion Header */}
                        <div
                          onClick={() => toggleSummaryAccordion('stammdaten')}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer select-none transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="text-slate-400">
                              {summaryAccordionOpen.stammdaten ? (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-slate-700 text-xs sm:text-sm truncate">
                              {t('summaryAccordionStammdaten')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            {renderSummarySectionBadge(1, summaryConfirmedSections.stammdaten)}

                            <button
                              type="button"
                              id="btn-edit-section-stammdaten"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentStep(1);
                              }}
                              className="text-slate-600 hover:text-teal-800 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-200 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 text-xs transition-colors cursor-pointer shadow-2xs"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                              <span>{t('stepEditSection')}</span>
                            </button>

                            <button
                              type="button"
                              id="btn-adopt-section-stammdaten"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSectionConfirmation('stammdaten');
                              }}
                              className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 text-xs transition-all cursor-pointer shadow-2xs border ${
                                summaryConfirmedSections.stammdaten
                                  ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-700'
                                  : 'bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-800 border-slate-200 hover:border-teal-200'
                              }`}
                            >
                              <Check className={`w-3.5 h-3.5 ${summaryConfirmedSections.stammdaten ? 'text-white' : 'text-slate-400'}`} />
                              <span>{t('summaryAdoptCheckbox')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Accordion Content */}
                        {summaryAccordionOpen.stammdaten && (
                          <div className="p-5 border-t border-slate-100 bg-white animate-in fade-in-50 duration-150">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                              <div>
                                <span className="block text-slate-500 mb-1">{t('patientBirthDate' as any) || 'Geburtsdatum'}</span>
                                <span className="text-slate-900 font-medium">{currentCase.patientBirthDate || '-'}</span>
                              </div>
                              <div>
                                <span className="block text-slate-500 mb-1">{t('patientAge')}</span>
                                <span className="text-slate-900 font-medium">{currentCase.patientAge !== undefined ? `${currentCase.patientAge} Jahre` : '-'}</span>
                              </div>
                              <div>
                                <span className="block text-slate-500 mb-1">{t('patientHeight' as any) || 'Größe (cm)'}</span>
                                <span className="text-slate-900 font-medium">{currentCase.patientHeightCm ? `${currentCase.patientHeightCm} cm` : '-'}</span>
                              </div>
                              <div>
                                <span className="block text-slate-500 mb-1">{t('patientWeight' as any) || 'Gewicht (kg)'}</span>
                                <span className="text-slate-900 font-medium">{currentCase.patientWeightKg ? `${currentCase.patientWeightKg} kg` : '-'}</span>
                              </div>
                              <div>
                                <span className="block text-slate-500 mb-1">{t('patientGender' as any) || 'Geschlecht'}</span>
                                <span className="text-slate-900 font-medium">
                                  {currentCase.patientGender === 'weiblich' ? t('genderFemale' as any) : 
                                   (currentCase.patientGender === 'männlich' ? t('genderMale' as any) : 
                                   (currentCase.patientGender === 'divers' ? t('genderOther' as any) : '-'))}
                                </span>
                              </div>
                              <div>
                                <span className="block text-slate-500 mb-1">{t('patientMaritalStatus' as any) || 'Familienstand'}</span>
                                <span className="text-slate-900 font-medium">
                                  {currentCase.patientMaritalStatus === 'ledig' ? t('maritalSingle' as any) : 
                                   (currentCase.patientMaritalStatus === 'verheiratet' ? t('maritalMarried' as any) : 
                                   (currentCase.patientMaritalStatus === 'in Partnerschaft' ? (t('maritalPartnership' as any) || 'In Partnerschaft') :
                                   (currentCase.patientMaritalStatus === 'geschieden' ? t('maritalDivorced' as any) : 
                                   (currentCase.patientMaritalStatus === 'getrennt lebend' ? (t('maritalSeparated' as any) || 'Getrennt lebend') :
                                   (currentCase.patientMaritalStatus === 'verwitwet' ? t('maritalWidowed' as any) : 
                                   (currentCase.patientMaritalStatus === 'sonstiges' ? t('maritalOther' as any) : (currentCase.patientMaritalStatus || '-')))))))}
                                </span>
                              </div>
                              <div>
                                <span className="block text-slate-500 mb-1">{t('patientEmail')}</span>
                                <span className="text-slate-900 font-medium">{currentCase.patientEmail || '-'}</span>
                              </div>
                              <div>
                                <span className="block text-slate-500 mb-1">{t('patientPhone')}</span>
                                <span className="text-slate-900 font-medium">{currentCase.patientPhone || '-'}</span>
                              </div>
                              <div>
                                <span className="block text-slate-500 mb-1">{t('hasChildrenLabel' as any) || 'Haben Sie Kinder?'}</span>
                                <span className="text-slate-900 font-medium">
                                  {currentCase.hasChildren ? (
                                    <span>{t('yes')} ({currentCase.childrenList?.length || currentCase.childrenCount || 1} Kinder)</span>
                                  ) : t('no')}
                                </span>
                              </div>
                            </div>

                            {/* Custom Stammdaten in Summary */}
                            {currentCase.customStammdaten && currentCase.customStammdaten.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-slate-100">
                                <span className="block text-slate-500 text-xs font-bold uppercase mb-2">
                                  {t('customStammdatenTitle')}:
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {currentCase.customStammdaten.map((cs) => (
                                    <div key={cs.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                      <span className="block text-slate-500 text-xs font-medium">{cs.name || 'Feld'}:</span>
                                      <span className="text-slate-900 font-semibold text-sm">{cs.value || '-'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 2. Hauptbeschwerde Accordion */}
                      <div className={`rounded-xl border bg-white shadow-xs overflow-hidden transition-all duration-200 ${
                        summaryConfirmedSections.hauptbeschwerde ? 'border-teal-300 ring-1 ring-teal-200/50' : 'border-slate-200'
                      }`}>
                        {/* Accordion Header */}
                        <div
                          onClick={() => toggleSummaryAccordion('hauptbeschwerde')}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer select-none transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="text-slate-400">
                              {summaryAccordionOpen.hauptbeschwerde ? (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 shrink-0">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-slate-700 text-xs sm:text-sm truncate">
                              {t('summaryAccordionHauptbeschwerde')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            {renderSummarySectionBadge(2, summaryConfirmedSections.hauptbeschwerde)}

                            <button
                              type="button"
                              id="btn-edit-section-hauptbeschwerde"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentStep(2);
                              }}
                              className="text-slate-600 hover:text-teal-800 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-200 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 text-xs transition-colors cursor-pointer shadow-2xs"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                              <span>{t('stepEditSection')}</span>
                            </button>

                            <button
                              type="button"
                              id="btn-adopt-section-hauptbeschwerde"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSectionConfirmation('hauptbeschwerde');
                              }}
                              className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 text-xs transition-all cursor-pointer shadow-2xs border ${
                                summaryConfirmedSections.hauptbeschwerde
                                  ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-700'
                                  : 'bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-800 border-slate-200 hover:border-teal-200'
                              }`}
                            >
                              <Check className={`w-3.5 h-3.5 ${summaryConfirmedSections.hauptbeschwerde ? 'text-white' : 'text-slate-400'}`} />
                              <span>{t('summaryAdoptCheckbox')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Accordion Content */}
                        {summaryAccordionOpen.hauptbeschwerde && (
                          <div className="p-5 border-t border-slate-100 bg-white animate-in fade-in-50 duration-150">
                            <p className="text-slate-900 font-medium mb-4 whitespace-pre-wrap">
                              {currentCase.hauptbeschwerde || '-'}
                            </p>
                            
                            {currentCase.anamnesisQuestions && currentCase.anamnesisQuestions.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                {currentCase.anamnesisQuestions.map((q, idx) => (
                                  <div key={q.id} className="text-sm">
                                    <span className="block text-slate-500 mb-1">{idx + 1}. {q.question}</span>
                                    <span className="text-slate-900 font-medium">
                                      {q.type === 'scale' ? `${q.answerScaleCurrent || '-'} (Aktuell) / ${q.answerScaleWorst || '-'} (Schlimmste)` : 
                                       (q.type === 'choice' ? q.answerChoice : 
                                       (q.type === 'multi_choice' ? q.answerMultiChoice?.join(', ') : q.answerText)) || '-'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 3. Fragebogen Accordion */}
                      <div className={`rounded-xl border bg-white shadow-xs overflow-hidden transition-all duration-200 ${
                        summaryConfirmedSections.fragebogen ? 'border-teal-300 ring-1 ring-teal-200/50' : 'border-slate-200'
                      }`}>
                        {/* Accordion Header */}
                        <div
                          onClick={() => toggleSummaryAccordion('fragebogen')}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer select-none transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="text-slate-400">
                              {summaryAccordionOpen.fragebogen ? (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 shrink-0">
                              <Stethoscope className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-slate-700 text-xs sm:text-sm truncate">
                              {t('summaryAccordionFragebogen')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            {renderSummarySectionBadge(3, summaryConfirmedSections.fragebogen)}

                            <button
                              type="button"
                              id="btn-edit-section-fragebogen"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentStep(3);
                              }}
                              className="text-slate-600 hover:text-teal-800 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-200 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 text-xs transition-colors cursor-pointer shadow-2xs"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                              <span>{t('stepEditSection')}</span>
                            </button>

                            <button
                              type="button"
                              id="btn-adopt-section-fragebogen"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSectionConfirmation('fragebogen');
                              }}
                              className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 text-xs transition-all cursor-pointer shadow-2xs border ${
                                summaryConfirmedSections.fragebogen
                                  ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-700'
                                  : 'bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-800 border-slate-200 hover:border-teal-200'
                              }`}
                            >
                              <Check className={`w-3.5 h-3.5 ${summaryConfirmedSections.fragebogen ? 'text-white' : 'text-slate-400'}`} />
                              <span>{t('summaryAdoptCheckbox')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Accordion Content */}
                        {summaryAccordionOpen.fragebogen && (
                          <div className="p-5 border-t border-slate-100 bg-white animate-in fade-in-50 duration-150">
                            {currentCase.extendedAnamnesis && Object.keys(currentCase.extendedAnamnesis).length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(currentCase.extendedAnamnesis).map(([key, val]) => {
                                  if (!val || (Array.isArray(val) && val.length === 0)) return null;
                                  return (
                                    <div key={key} className="text-sm">
                                      <span className="block text-slate-500 mb-1 truncate">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                      <span className="text-slate-900 font-medium break-words">
                                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-slate-600">{t('noData')}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 4. Befund Accordion */}
                      <div className={`rounded-xl border bg-white shadow-xs overflow-hidden transition-all duration-200 ${
                        summaryConfirmedSections.befund ? 'border-teal-300 ring-1 ring-teal-200/50' : 'border-slate-200'
                      }`}>
                        {/* Accordion Header */}
                        <div
                          onClick={() => toggleSummaryAccordion('befund')}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer select-none transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="text-slate-400">
                              {summaryAccordionOpen.befund ? (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 shrink-0">
                              <Activity className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-slate-700 text-xs sm:text-sm truncate">
                              {t('summaryAccordionBefund')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            {renderSummarySectionBadge(5, summaryConfirmedSections.befund)}

                            <button
                              type="button"
                              id="btn-edit-section-befund"
                              onClick={(e) => {
                                e.stopPropagation();
                                goToStepById('befund');
                              }}
                              className="text-slate-600 hover:text-teal-800 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-200 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 text-xs transition-colors cursor-pointer shadow-2xs"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                              <span>{t('stepEditSection')}</span>
                            </button>

                            <button
                              type="button"
                              id="btn-adopt-section-befund"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSectionConfirmation('befund');
                              }}
                              className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 text-xs transition-all cursor-pointer shadow-2xs border ${
                                summaryConfirmedSections.befund
                                  ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-700'
                                  : 'bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-800 border-slate-200 hover:border-teal-200'
                              }`}
                            >
                              <Check className={`w-3.5 h-3.5 ${summaryConfirmedSections.befund ? 'text-white' : 'text-slate-400'}`} />
                              <span>{t('summaryAdoptCheckbox')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Accordion Content */}
                        {summaryAccordionOpen.befund && (
                          <div className="p-5 border-t border-slate-100 bg-white animate-in fade-in-50 duration-150">
                            {Boolean(
                              (currentCase.befundDetails && Object.keys(currentCase.befundDetails).length > 0 && Object.values(currentCase.befundDetails).some(v => v && (typeof v !== 'object' || (Array.isArray(v) && v.length > 0)))) ||
                              (currentCase.befundText && currentCase.befundText.trim())
                            ) ? (
                              <div className="space-y-4">
                                {currentCase.befundDetails && Object.keys(currentCase.befundDetails).length > 0 && (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                    {Object.entries(currentCase.befundDetails).map(([key, val]) => {
                                      if (!val) return null;
                                      if (key === 'customFelder' && Array.isArray(val)) {
                                        return val.map((cf: any) => (
                                          <div key={cf.id || cf.name}>
                                            <span className="block text-slate-500 mb-1 capitalize">{cf.name || 'Feld'}</span>
                                            <span className="text-slate-900 font-medium">{String(cf.value || '-')}</span>
                                          </div>
                                        ));
                                      }
                                      return (
                                        <div key={key}>
                                          <span className="block text-slate-500 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                          <span className="text-slate-900 font-medium">{String(val)}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                {currentCase.befundText && (
                                  <div className="text-sm">
                                    <span className="block text-slate-500 mb-1">Text</span>
                                    <span className="text-slate-900 font-medium whitespace-pre-wrap">{currentCase.befundText}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-slate-600">{t('noData')}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 5. Medikamenteneinnahme Accordion (nur wenn Medikamente erfasst wurden) */}
                      {hasRecordedMedications && (
                        <div className={`rounded-xl border bg-white shadow-xs overflow-hidden transition-all duration-200 ${
                          summaryConfirmedSections.medikamente ? 'border-teal-300 ring-1 ring-teal-200/50' : 'border-slate-200'
                        }`}>
                          {/* Accordion Header */}
                          <div
                            onClick={() => toggleSummaryAccordion('medikamente')}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer select-none transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="text-slate-400">
                                {summaryAccordionOpen.medikamente ? (
                                  <ChevronDown className="w-4 h-4 text-slate-500" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 shrink-0">
                                <Pill className="w-4 h-4" />
                              </div>
                              <span className="font-medium text-slate-700 text-xs sm:text-sm truncate">
                                {t('summaryAccordionMedikamente')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              {renderSummarySectionBadge(4, summaryConfirmedSections.medikamente)}

                              <button
                                type="button"
                                id="btn-edit-section-medikamente"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToStepById('medikamente');
                                }}
                                className="text-slate-600 hover:text-teal-800 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-200 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 text-xs transition-colors cursor-pointer shadow-2xs"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                                <span>{t('stepEditSection')}</span>
                              </button>

                              <button
                                type="button"
                                id="btn-adopt-section-medikamente"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSectionConfirmation('medikamente');
                                }}
                                className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 text-xs transition-all cursor-pointer shadow-2xs border ${
                                  summaryConfirmedSections.medikamente
                                    ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-700'
                                    : 'bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-800 border-slate-200 hover:border-teal-200'
                                }`}
                              >
                                <Check className={`w-3.5 h-3.5 ${summaryConfirmedSections.medikamente ? 'text-white' : 'text-slate-400'}`} />
                                <span>{t('summaryAdoptCheckbox')}</span>
                              </button>
                            </div>
                          </div>

                          {/* Accordion Content */}
                          {summaryAccordionOpen.medikamente && (
                            <div className="p-5 border-t border-slate-100 bg-white animate-in fade-in-50 duration-150">
                              {currentCase.medikamenteList && currentCase.medikamenteList.some(m => m.name && m.name.trim() !== '') ? (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                    {currentCase.medikamenteList.filter(m => m.name && m.name.trim() !== '').map((m, idx) => (
                                      <div key={(m as any).id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                        <span className="block font-bold text-slate-800 mb-1">{m.name}</span>
                                        {m.dosierung && <span className="block text-xs text-slate-600 mb-0.5">{t('dosage' as TranslationKey)}: {m.dosierung}</span>}
                                        {m.einnahmeart && <span className="block text-xs text-slate-600">{t('intake' as TranslationKey)}: {m.einnahmeart}</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-slate-600">{t('noData')}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ANALYSE & AUSWERTUNG */}
                {currentStepConfig.id === 'analyse' && (
                  <div className="animate-in fade-in-50 duration-150">
                    {isAnalyzing ? (
                      <div className="bg-white p-12 rounded-xl shadow-xs border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-12 h-12 rounded-full border-3 border-teal-600 border-t-transparent animate-spin"></div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{t('analysisCalculatingTitle')}</h3>
                          <p className="text-xs text-slate-500 mt-1 max-w-md">
                            {t('analysisCalculatingDesc')}
                          </p>
                        </div>
                      </div>
                    ) : clinicalAnalysis ? (
                      <ComprehensiveAnalysisView
                        patientCase={currentCase as PatientCase}
                        analysis={clinicalAnalysis}
                        onEditSection={(stepIdx) => setCurrentStep(stepIdx)}
                        isAnalyzing={isAnalyzing}
                        allCases={cases}
                        onOpenMedicationsModal={(autoAddNew) => {
                          setMedicationsModalAutoAddNew(Boolean(autoAddNew));
                          setIsMedicationsModalOpen(true);
                        }}
                        onUpdateCase={(updatedCase) => {
                          setCurrentCase(updatedCase);
                          refreshCases();
                        }}
                      />
                    ) : (
                      <div className="bg-white p-12 rounded-2xl shadow-2xs border border-slate-200/90 text-center space-y-4">
                        <Sparkles className="w-12 h-12 text-teal-600 mx-auto" />
                        <h3 className="text-lg font-bold text-slate-900">{t('analysisNotYetCalculated')}</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          {t('analysisNotYetCalculatedDesc')}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (hasAnalysis) {
                              setIsAnalysisAlreadyCreatedModalOpen(true);
                              return;
                            }
                            handleRunAnalysis();
                          }}
                          className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer mx-auto"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{t('btnRunAnalysis')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* EMPFEHLUNGEN & VERORDNUNG */}
                {currentStepConfig.id === 'empfehlungen' && (
                  <div className="animate-in fade-in-50 duration-150">
                    <TherapyRecommendationsView
                      patientCase={currentCase as PatientCase}
                      analysis={clinicalAnalysis || {
                        redFlags: {
                          warnings: [],
                          gesamtbewertung: '',
                          empfohleneFachrichtung: '',
                          dringlichkeit: 'Kein akuter Warnhinweis anhand der vorliegenden Angaben'
                        },
                        differentialdiagnostik: { items: [] },
                        medikamente: {
                          zusammenfassung: '',
                          details: []
                        },
                        homoeopathie: {
                          mittel: (currentCase.remedySuggestions || []).map(r => ({
                            name: r.name,
                            potenz: r.potency || 'C30',
                            dosierungPotenz: r.potency || 'C30',
                            tagesdosis: '1 bis 2 Gaben à 3–5 Globuli',
                            haeufigkeit: '1- bis 2-mal täglich',
                            anwendungsdauer: '3 bis maximal 5 Tage',
                            zeitraum: 'Akut- und Initialphase',
                            einnahmehinweis: '',
                            score: r.score,
                            rangBegruendung: r.description || '',
                            passungSymptome: r.keyIndicators || [],
                            modalitaeten: []
                          }))
                        }
                      }}
                      onUpdateCase={(updates) => setCurrentCase(prev => ({ ...prev, ...updates }))}
                      onSaveCase={handleSaveCase}
                      onPreviousStep={() => goToStepById('analyse')}
                    />
                  </div>
                )}
              </div>

              {/* SEQUENTIAL NAVIGATION BUTTONS DIRECTLY UNDER EACH SECTION */}
              <div className="mt-8 pt-5 border-t border-dashed border-slate-200/90 flex flex-wrap items-center justify-between gap-3 print:hidden">
                {/* Back Navigation */}
                <div className="flex items-center gap-2">
                  {currentStep > 1 ? (
                    <button
                      id="btn-step-back"
                      type="button"
                      onClick={goToPreviousStep}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
                      title={t('btnStepBack')}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{t('btnStepBack')}</span>
                    </button>
                  ) : (
                    <button
                      id="btn-back-to-patient-directory"
                      type="button"
                      onClick={() => handleSelectTab('patients')}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
                      title={t('btnBackToPatientDirectory') || 'Zurück zur Patienten- & Klientenkartei'}
                    >
                      <Users className="w-4 h-4 text-slate-700" />
                      <span className="inline">{t('btnBackToPatientDirectory') || 'Zurück zur Patienten- & Klientenkartei'}</span>
                    </button>
                  )}
                </div>

                {/* Center: Step Indicator & Auto-Save Status */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span className="font-semibold text-slate-800">
                    {stepNames[currentStep - 1] || currentStepConfig.name} ({currentStep} / {totalWizardSteps})
                  </span>
                  {hasPatientData && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/80 font-medium">
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                      <span>{t('btnAutoSaved')}</span>
                    </span>
                  )}
                </div>

                {/* Next / Action Buttons */}
                <div className="flex items-center gap-2">
                  {!hasPatientData ? null : currentStepConfig.id === 'uebersicht' ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveCase}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-slate-300 shadow-2xs"
                        title={t('btnSaveCase')}
                      >
                        <Save className="w-4 h-4 text-slate-500" />
                        <span className="inline">{t('btnSaveCase')}</span>
                      </button>

                      <button
                        type="button"
                        id="btn-run-homeopathy-analysis"
                        onClick={() => {
                          if (hasAnalysis) {
                            goToStepById('analyse');
                            return;
                          }
                          if (!areAllSummarySectionsConfirmed) {
                            setIsUnconfirmedSummaryModalOpen(true);
                            return;
                          }
                          handleRunAnalysis();
                        }}
                        disabled={isAnalyzing}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAnalyzing && <Sparkles className="w-4 h-4 text-white animate-spin" />}
                        <span>{isAnalyzing ? t('analysisCalculating') : t('goToAnalysisBtn')}</span>
                      </button>
                    </>
                  ) : currentStepConfig.id === 'analyse' ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveCase}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-slate-300 shadow-2xs"
                        title={t('btnSaveCase')}
                      >
                        <Save className="w-4 h-4 text-slate-500" />
                        <span className="hidden sm:inline">{t('btnSaveCase')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={goToNextStep}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
                      >
                        <span>{t('goToRecommendationsBtn')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : currentStepConfig.id === 'empfehlungen' ? (
                    <>
                      <div className="flex items-center gap-1.5 mr-1">
                        <button
                          type="button"
                          onClick={handleExportRecommendationsPDF}
                          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                          title={t('downloadRecommendationsPDF')}
                        >
                          <FileDown className="w-3.5 h-3.5 text-teal-700" />
                          <span className="hidden md:inline">{t('downloadRecommendationsPDF')}</span>
                          <span className="md:hidden">PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleExportFullAnalysisPDF}
                          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                          title={t('downloadFullAnalysisPDF')}
                        >
                          <FileDown className="w-3.5 h-3.5 text-slate-500" />
                          <span className="hidden md:inline">{t('downloadFullAnalysisPDF')}</span>
                          <span className="md:hidden">Voll-PDF</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveCase}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        <Save className="w-4 h-4" />
                        <span>{t('finishAndSaveCaseBtn' as any) || t('btnSaveCase')}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      id="btn-step-next"
                      type="button"
                      onClick={goToNextStep}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
                    >
                      <span>{t('btnStepNext')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  )}

      {/* Homoeopathic In-Depth 6-Pillars Wizard Modal */}
      <ComplaintQuestionsWizardModal
        isOpen={isComplaintWizardModalOpen}
        onClose={() => {
          closeModal();
          setIsComplaintWizardModalOpen(false);
          setWizardPreloadedAnalysis(null);
        }}
        chiefComplaint={currentCase.hauptbeschwerde || ''}
        patientName={currentCase.patientName}
        preloadedAnalysis={wizardPreloadedAnalysis}
        onTransferToAnamnese={(data) => {
          const matrix = data.matrix;
          const updatedQuestions: AnamnesisQuestion[] = [
            ...(matrix.ursaechlicher_zusammenhang ? [{ id: 'q_ursaechlich', question: 'Ursächlicher Zusammenhang (Symptomkomplex)', type: 'text' as const, answerText: matrix.ursaechlicher_zusammenhang }] : []),
            ...(matrix.fruehere_behandlungen_und_historie ? [{ id: 'q_historie', question: 'Krankheitshistorie & Frühere Behandlungen', type: 'text' as const, answerText: matrix.fruehere_behandlungen_und_historie }] : []),
            ...(matrix.causa ? [{ id: 'q_causa', question: 'Auslöser / Ursache (Causa)', type: 'text' as const, answerText: matrix.causa }] : []),
            ...(matrix.lokalisierung ? [{ id: 'q_lok', question: 'Genaue Lokalisierung / Gewebe', type: 'text' as const, answerText: matrix.strahlungsoptionen ? `${matrix.lokalisierung} (Ausstrahlung: ${matrix.strahlungsoptionen})` : matrix.lokalisierung }] : []),
            ...(matrix.empfindung ? [{ id: 'q_empf', question: 'Empfindung & Schmerzcharakter', type: 'text' as const, answerText: matrix.empfindung }] : []),
            ...(matrix.modalitaeten ? [{ id: 'q_mod', question: 'Modalitäten (Besser / Schlechter)', type: 'text' as const, answerText: matrix.modalitaeten }] : []),
            ...(matrix.begleitsymptome && matrix.begleitsymptome.length > 0 ? [{ id: 'q_begleit', question: 'Begleitsymptome (Concomitants)', type: 'text' as const, answerText: matrix.begleitsymptome.join(', ') }] : []),
            ...(matrix.gemuet ? [{ id: 'q_gemuet', question: 'Gemüt & Psychischer Zustand', type: 'text' as const, answerText: matrix.gemuet }] : []),
          ];

          setCurrentCase(prev => {
            const updated: Partial<PatientCase> = {
              ...prev,
              anamnesisQuestions: updatedQuestions,
              spontanbericht: prev.spontanbericht ? `${prev.spontanbericht}\n\n[Hahnemann Organon Anamnese]\n${data.summaryText}` : `[Hahnemann Organon Anamnese]\n${data.summaryText}`,
              modalitaetenBesser: matrix.modalitaeten?.includes('>') ? matrix.modalitaeten : prev.modalitaetenBesser,
              modalitaetenSchlechter: matrix.modalitaeten?.includes('<') ? matrix.modalitaeten : prev.modalitaetenSchlechter,
              gemuetPsyche: matrix.gemuet || prev.gemuetPsyche,
              lokalsymptome: matrix.strahlungsoptionen ? `${matrix.lokalisierung} (Ausstrahlung: ${matrix.strahlungsoptionen})` : (matrix.lokalisierung || prev.lokalsymptome),
            };

            if (prev.id) {
              const fullCaseToSave = {
                ...prev,
                ...updated,
                therapistId: prev.therapistId || therapist.id,
                patientName: prev.patientName || '',
                anamneseDatum: prev.anamneseDatum || new Date().toISOString().split('T')[0],
                id: prev.id
              } as PatientCase;
              savePatientCase(fullCaseToSave);
              setCases(prevCases => prevCases.map(c => c.id === prev.id ? { ...c, ...updated } as PatientCase : c));
            }
            return updated;
          });

          setSummaryConfirmedSections(prev => ({
            ...prev,
            hauptbeschwerde: true,
          }));

          setSaveToast(t('toastCaseSaved'));
          setTimeout(() => setSaveToast(null), 3000);
        }}
      />

      {/* Extended Anamnesis Questionnaire Modal */}
      <ExtendedAnamnesisWizard
        isOpen={isExtendedAnamnesisWizardOpen}
        onClose={() => {
          closeModal();
          setIsExtendedAnamnesisWizardOpen(false);
        }}
        initialData={currentCase.extendedAnamnesis || {}}
        nimmtMedikamente={currentCase.nimmtMedikamente}
        medikamenteList={currentCase.medikamenteList || []}
        onSave={(data, updatedMeds) => {
          setCurrentCase(prev => {
            const hasMeds = updatedMeds && updatedMeds.length > 0;
            const updatedCase: Partial<PatientCase> = {
              ...prev,
              extendedAnamnesis: data,
              ...(updatedMeds !== undefined ? {
                medikamenteList: updatedMeds,
                nimmtMedikamente: hasMeds
              } : {})
            };
            if (prev.id) {
              const fullCaseToSave = {
                ...prev,
                ...updatedCase,
                therapistId: prev.therapistId || therapist.id,
                patientName: prev.patientName || '',
                anamneseDatum: prev.anamneseDatum || new Date().toISOString().split('T')[0],
                id: prev.id
              } as PatientCase;
              savePatientCase(fullCaseToSave);
              setCases(prevCases => prevCases.map(c => c.id === prev.id ? { ...c, ...updatedCase } as PatientCase : c));
            }
            return updatedCase;
          });
          setSaveToast(t('toastExtendedAnamnesisSaved'));
          setTimeout(() => setSaveToast(null), 3000);
        }}
        patientName={currentCase.patientName}
      />

      {/* Clinical Findings Wizard Modal */}
      <FindingsWizardModal
        isOpen={isFindingsModalOpen}
        onClose={() => {
          closeModal();
          setIsFindingsModalOpen(false);
        }}
        befundDetails={currentCase.befundDetails || {}}
        onSave={(data) => {
          setCurrentCase(prev => ({
            ...prev,
            befundGewuenscht: true,
            befundDetails: data
          }));
          setSaveToast(t('toastExtendedAnamnesisSaved'));
          setTimeout(() => setSaveToast(null), 3000);
        }}
        patientName={currentCase.patientName}
      />

      {/* Medications Wizard Modal */}
      <MedicationsWizardModal
        isOpen={isMedicationsModalOpen}
        autoAddNew={medicationsModalAutoAddNew}
        onClose={() => {
          closeModal();
          setIsMedicationsModalOpen(false);
          setMedicationsModalAutoAddNew(false);
        }}
        nimmtMedikamente={currentCase.nimmtMedikamente}
        medikamenteList={currentCase.medikamenteList || []}
        onSave={(data) => {
          setMedicationsModalAutoAddNew(false);
          setCurrentCase(prev => {
            const updatedCase: Partial<PatientCase> = {
              ...prev,
              nimmtMedikamente: data.nimmtMedikamente,
              medikamenteList: data.medikamenteList
            };
            if (prev.id) {
              const fullCaseToSave = {
                ...prev,
                ...updatedCase,
                therapistId: prev.therapistId || therapist.id,
                patientName: prev.patientName || '',
                anamneseDatum: prev.anamneseDatum || new Date().toISOString().split('T')[0],
                id: prev.id
              } as PatientCase;
              savePatientCase(fullCaseToSave);
              setCases(prevCases => prevCases.map(c => c.id === prev.id ? { ...c, ...updatedCase } as PatientCase : c));
            }
            return updatedCase;
          });
          setSaveToast(t('medListUpdatedSuccess' as TranslationKey) || t('toastExtendedAnamnesisSaved'));
          setTimeout(() => setSaveToast(null), 3000);
        }}
        patientName={currentCase.patientName}
      />

      <CaseAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => {
          closeModal();
          setIsAnalysisModalOpen(false);
        }}
        results={analysisResults}
        patientCase={currentCase}
        remainingAnalyses={remainingCount}
      />

      {/* Upgrade / Quota Lockout Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => {
          closeModal();
          setIsUpgradeModalOpen(false);
        }}
        onGoToAdmin={onGoToAdmin}
        lockReason={limitStatus.reason}
        therapist={therapist}
      />

      {/* Limit Exceeded Error Modal */}
      {limitExceededError && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-950">
                  {t('tariffLimitReachedAlertTitle' as TranslationKey) || 'Limit erreicht'}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t('tariffLimitReachedAlertDesc' as TranslationKey, {
                    feature: limitExceededError.featureName,
                    limit: limitExceededError.limitValue
                  }) || `Sie haben das Limit für "${limitExceededError.featureName}" (${limitExceededError.limitValue}) in Ihrem aktuellen Tarif erreicht. Bitte kontaktieren Sie den Administrator für ein Upgrade.`}
                </p>
              </div>
              <button
                onClick={() => setLimitExceededError(null)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition duration-150 shadow-xs cursor-pointer"
              >
                {t('commonClose' as TranslationKey) || 'Schließen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient / Customer Selection Modal */}
      <PatientSelectionModal
        isOpen={isPatientSelectionModalOpen}
        onClose={() => {
          closeModal();
          setIsPatientSelectionModalOpen(false);
        }}
        onSelectPatient={(patientCase) => {
          handleSelectCase(patientCase);
          closeModal();
          setIsPatientSelectionModalOpen(false);
          showToast(t('toastPatientSelected', { name: patientCase.patientName || 'Patient' }) || `${patientCase.patientName || 'Patient'} geladen`);
        }}
        cases={cases}
        activePatientName={currentCase.patientName}
      />

      {/* Modal: Fall löschen Bestätigung (Ja / Nein) */}
      {caseToDeleteId && (
        <div
          id="modal-delete-case-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            id="modal-delete-case-container"
            className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                {t('deleteCaseConfirm')}
              </h3>
              {(() => {
                const targetCase = cases.find((c) => c.id === caseToDeleteId);
                if (targetCase) {
                  return (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left text-xs space-y-1 mt-2">
                      <div className="font-bold text-slate-900">
                        {targetCase.patientName || t('unnamedPatient')}
                      </div>
                      <div className="text-slate-500">
                        {t('admissionDatePrefix')}: {targetCase.anamneseDatum || targetCase.analyzedAt?.split('T')[0] || '—'}
                      </div>
                      {targetCase.hauptbeschwerde && (
                        <div className="text-slate-700 line-clamp-2 italic pt-0.5">
                          „{targetCase.hauptbeschwerde}“
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                id="btn-confirm-delete-case-no"
                onClick={() => setCaseToDeleteId(null)}
                className="w-full sm:w-1/2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                {t('no')}
              </button>

              <button
                type="button"
                id="btn-confirm-delete-case-yes"
                onClick={handleConfirmDeleteCase}
                className="w-full sm:w-1/2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('yes')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Keine Stammdaten vorhanden */}
      {isNoMasterDataModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <UserX className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                {t('noMasterDataTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                {t('noMasterDataMsg')}
              </p>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsNoMasterDataModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                {t('btnCancelModal')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsNoMasterDataModalOpen(false);
                  setCurrentStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>{t('btnGoToMasterData')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Abschnitte müssen erst übernommen / bestätigt werden */}
      {isUnconfirmedSummaryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                {t('summaryConfirmAllRequiredModalTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                {t('summaryConfirmAllRequiredModalDesc')}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                {t('summaryConfirmAllRequiredModalDetail')}
              </p>
            </div>

            {/* List of unconfirmed sections */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2 text-xs">
              <span className="font-bold text-slate-700 block mb-1">
                {t('summaryMissingSections')}
              </span>
              <div className="space-y-1.5">
                {!summaryConfirmedSections.stammdaten && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span>{t('summaryAccordionStammdaten')}</span>
                  </div>
                )}
                {!summaryConfirmedSections.hauptbeschwerde && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span>{t('summaryAccordionHauptbeschwerde')}</span>
                  </div>
                )}
                {!summaryConfirmedSections.fragebogen && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span>{t('summaryAccordionFragebogen')}</span>
                  </div>
                )}
                {!summaryConfirmedSections.befund && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span>{t('summaryAccordionBefund')}</span>
                  </div>
                )}
                {!summaryConfirmedSections.medikamente && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span>{t('summaryAccordionMedikamente')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center">
              <button
                type="button"
                id="btn-close-unconfirmed-modal"
                onClick={() => setIsUnconfirmedSummaryModalOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {t('btnCancelModal')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Analyse bereits erstellt */}
      {isAnalysisAlreadyCreatedModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                {t('analysisAlreadyCreatedModalTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                {t('analysisAlreadyCreatedModalDesc')}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                id="btn-close-already-created-modal"
                onClick={() => setIsAnalysisAlreadyCreatedModalOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
              >
                {t('btnCancelModal')}
              </button>

              <button
                type="button"
                id="btn-new-case-from-already-created-modal"
                onClick={() => {
                  setIsAnalysisAlreadyCreatedModalOpen(false);
                  handleNewCase();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('newCaseBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Übernahme nicht möglich wegen fehlender Pflichtangaben */}
      {adoptionBlockedSection && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                {t('summaryAdoptionBlockedTitle')}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-amber-700">
                {t('summaryAdoptionBlockedDesc')}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                {adoptionBlockedSection === 'stammdaten'
                  ? t('summaryAdoptionBlockedStammdatenDetail')
                  : t('summaryAdoptionBlockedHauptbeschwerdeDetail')}
              </p>
            </div>

            {/* Liste der fehlenden Pflichtangaben */}
            {(() => {
              const missingFields = adoptionBlockedSection === 'stammdaten'
                ? getMissingStammdatenFields()
                : getMissingHauptbeschwerdeFields();
              if (missingFields.length === 0) return null;
              return (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-left space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">
                    {t('summaryMissingSections')}
                  </span>
                  <ul className="space-y-1.5">
                    {missingFields.map((field, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                        <span>{field}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                id="btn-close-adoption-blocked-modal"
                onClick={() => setAdoptionBlockedSection(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                {t('btnCancelModal')}
              </button>

              <button
                type="button"
                id="btn-goto-incomplete-section"
                onClick={() => {
                  const targetStep = adoptionBlockedSection === 'stammdaten' ? 1 : 2;
                  setAdoptionBlockedSection(null);
                  setCurrentStep(targetStep);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>{t('summaryAdoptionBlockedEditBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stammdaten Modal */}
      <StammdatenModal
        isOpen={isStammdatenModalOpen}
        onClose={() => {
          closeModal();
          setIsStammdatenModalOpen(false);
        }}
        initialData={currentCase as PatientCase}
        onSave={(data) => {
          setCurrentCase(prev => ({
            ...prev,
            ...data,
          }));
        }}
      />

      {/* MODAL: SEITE IN DIESEM TARIF GESPERRT */}
      {lockedPageAttempt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                {t('tariffPageLockedModalTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                {t('tariffPageLockedModalDesc', { page: lockedPageAttempt.name, tariff: therapist.tarifLabel || therapist.tarif || 'Standard' })}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Aktueller Tarif:</span>
              <span className="font-bold text-slate-900">{therapist.tarifLabel || therapist.tarif || 'Standard'}</span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setLockedPageAttempt(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                {t('btnCancelModal')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLockedPageAttempt(null);
                  setPanelTab('tariff');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>{t('tariffUpgradeNowBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};
