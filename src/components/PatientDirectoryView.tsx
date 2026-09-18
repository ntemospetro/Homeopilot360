import React, { useState, useMemo, useEffect } from 'react';
import { Therapist, PatientCase, FollowUpEntry } from '../types';
import { 
  getPatientCases, 
  savePatientCase, 
  updatePatientStammdatenAcrossCases,
  getRecentlyEditedPatientNames,
  deletePatientCase,
  deletePatientAndAllCases,
  isFeatureLimitReached
} from '../services/storage';
import { useTranslation } from '../i18n/LanguageContext';
import { VoiceInputButton } from './VoiceInputButton';
import { StammdatenModal } from './StammdatenModal';
import { 
  Users, 
  Search, 
  FileText, 
  Plus, 
  Edit3, 
  Activity, 
  CheckCircle2, 
  Mail, 
  Phone, 
  ArrowRight, 
  X, 
  ShieldCheck,
  Calendar,
  Sparkles,
  Pill,
  Clock,
  Trash2,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

interface PatientDirectoryViewProps {
  therapist: Therapist;
  onOpenCaseInWorkspace: (patientCase: PatientCase) => void;
  onNewCaseForPatient?: (patientName: string, stammdatenDefaults?: Partial<PatientCase>) => void;
  initialOpenAction?: 'new_patient' | 'select_patient' | null;
  onActionHandled?: () => void;
}

interface GroupedPatient {
  key: string;
  name: string;
  cases: PatientCase[];
  primaryCase: PatientCase;
  totalFollowUps: number;
  latestFollowUp?: FollowUpEntry;
}

// Helper to split full name into first and last name cleanly
function parsePatientName(fullName: string): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: '—', lastName: '—' };
  const trimmed = fullName.trim();
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(s => s.trim());
    return { lastName: parts[0] || '—', firstName: parts.slice(1).join(' ') || '—' };
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '—' };
  }
  const lastName = parts[parts.length - 1];
  const firstName = parts.slice(0, parts.length - 1).join(' ');
  return { firstName, lastName };
}

// Helper to format the relative/absolute last edit timestamp with full i18n
function formatLastActivity(timestamp: number, language: string, t: (key: any) => string): string {
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
}

export const PatientDirectoryView: React.FC<PatientDirectoryViewProps> = ({
  therapist,
  onOpenCaseInWorkspace,
  onNewCaseForPatient,
  initialOpenAction,
  onActionHandled,
}) => {
  const { t, language } = useTranslation();
  const [cases, setCases] = useState<PatientCase[]>(() => getPatientCases(therapist.id));
  const [recentEditsRev, setRecentEditsRev] = useState(0);
  const [selectedPatientKey, setSelectedPatientKey] = useState<string | null>(null);
  const [activeCaseTabId, setActiveCaseTabId] = useState<string | null>(null);
  
  // Case Search & Accordion State
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [expandedCaseIds, setExpandedCaseIds] = useState<Set<string>>(new Set());

  // Reset case search and collapse all cases when changing selected patient
  useEffect(() => {
    setCaseSearchQuery('');
    setExpandedCaseIds(new Set());
  }, [selectedPatientKey]);

  const toggleCaseExpanded = (caseId: string) => {
    setExpandedCaseIds(prev => {
      const next = new Set(prev);
      if (next.has(caseId)) {
        next.delete(caseId);
      } else {
        next.add(caseId);
      }
      return next;
    });
  };

  // Patient / Customer Selection Modal
  const [isSelectPatientModalOpen, setIsSelectPatientModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // Modals & Editors
  const [isEditStammdatenOpen, setIsEditStammdatenOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  // Automatically open modal if requested by forward action
  useEffect(() => {
    if (initialOpenAction === 'new_patient') {
      setIsNewPatientModalOpen(true);
      onActionHandled?.();
    } else if (initialOpenAction === 'select_patient') {
      setModalSearchQuery('');
      setIsSelectPatientModalOpen(true);
      onActionHandled?.();
    }
  }, [initialOpenAction, onActionHandled]);

  // Deletion Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'case'; caseItem: PatientCase; caseNum: number; patientName: string }
    | { type: 'customer'; patientKey: string; patientName: string; casesCount: number; sampleComplaint?: string }
    | null
  >(null);
  const [securityCodeInput, setSecurityCodeInput] = useState('');

  const refreshData = () => {
    const updated = getPatientCases(therapist.id);
    setCases(updated);
  };

  const handleRequestDeleteCase = (caseItem: PatientCase, caseNum: number, patientName: string) => {
    setDeleteTarget({
      type: 'case',
      caseItem,
      caseNum,
      patientName,
    });
    setSecurityCodeInput('');
  };

  const handleRequestDeleteCustomer = (patient: GroupedPatient) => {
    setDeleteTarget({
      type: 'customer',
      patientKey: patient.key,
      patientName: patient.name,
      casesCount: patient.cases.length,
      sampleComplaint: patient.primaryCase.hauptbeschwerde || undefined,
    });
    setSecurityCodeInput('');
  };

  const handleConfirmDelete = () => {
    if (securityCodeInput.trim() !== '360' || !deleteTarget) return;

    if (deleteTarget.type === 'case') {
      deletePatientCase(deleteTarget.caseItem.id);
      refreshData();
      setDeleteTarget(null);
      setSecurityCodeInput('');
    } else if (deleteTarget.type === 'customer') {
      deletePatientAndAllCases(deleteTarget.patientName, therapist.id);
      if (selectedPatientKey === deleteTarget.patientKey) {
        setSelectedPatientKey(null);
      }
      refreshData();
      setDeleteTarget(null);
      setSecurityCodeInput('');
    }
  };

  React.useEffect(() => {
    const handleCasesUpdated = () => {
      refreshData();
    };
    const handlePatientEdited = () => {
      setRecentEditsRev(r => r + 1);
    };
    window.addEventListener('homoeo_cases_updated', handleCasesUpdated);
    window.addEventListener('homoeo_patient_edited', handlePatientEdited);
    return () => {
      window.removeEventListener('homoeo_cases_updated', handleCasesUpdated);
      window.removeEventListener('homoeo_patient_edited', handlePatientEdited);
    };
  }, [therapist.id]);

  const handleSaveNewPatient = (data: Partial<PatientCase>) => {
    const pName = data.patientName?.trim() || '';
    const checkPatients = isFeatureLimitReached(therapist.id, 'maxPatients', 1, pName);
    if (checkPatients.reached) {
      window.dispatchEvent(new CustomEvent('homoeo_action_limit_reached', {
        detail: { feature: t('tariffLimitPatientsLabel'), limit: checkPatients.limit }
      }));
      return;
    }

    const checkCases = isFeatureLimitReached(therapist.id, 'maxCases', 1);
    if (checkCases.reached) {
      window.dispatchEvent(new CustomEvent('homoeo_action_limit_reached', {
        detail: { feature: t('tariffLimitCasesLabel'), limit: checkCases.limit }
      }));
      return;
    }

    const newCaseId = 'case-' + Date.now();
    const isFemale = (data.patientGender || 'weiblich') === 'weiblich';
    const created = savePatientCase({
      therapistId: therapist.id,
      patientName: data.patientName?.trim() || '',
      patientBirthDate: data.patientBirthDate || '',
      patientAge: data.patientAge,
      patientGender: data.patientGender || 'weiblich',
      patientHeightCm: data.patientHeightCm,
      patientWeightKg: data.patientWeightKg,
      patientMaritalStatus: data.patientMaritalStatus || '',
      anamneseDatum: data.anamneseDatum || new Date().toISOString().split('T')[0],
      patientEmail: data.patientEmail || '',
      patientPhone: data.patientPhone || '',
      isPregnant: isFemale ? !!data.isPregnant : false,
      pregnancyMonth: isFemale && data.isPregnant ? data.pregnancyMonth : undefined,
      hasChildren: !!data.hasChildren,
      childrenCount: data.hasChildren ? (data.childrenList?.length || 0) : 0,
      childrenList: data.hasChildren ? (data.childrenList ? [...data.childrenList] : []) : [],
      customStammdaten: data.customStammdaten ? [...data.customStammdaten] : [],
      hauptbeschwerde: '',
      anamnesisQuestions: [],
      spontanbericht: '',
      modalitaetenBesser: '',
      modalitaetenSchlechter: '',
      gemuetPsyche: '',
      koerperAllgemein: '',
      lokalsymptome: '',
      bisherigeMittel: '',
      id: newCaseId,
    });
    setIsNewPatientModalOpen(false);
    refreshData();
    if (data.patientName) {
      setSelectedPatientKey(data.patientName.trim().toLowerCase());
      setActiveCaseTabId(created.id || newCaseId);
      onOpenCaseInWorkspace(created);
    }
  };

  const getGenderLabel = (gender?: string) => {
    if (!gender) return '—';
    switch (gender) {
      case 'weiblich': return t('genderFemale');
      case 'männlich': return t('genderMale');
      case 'divers': return t('genderOther');
      default: return gender;
    }
  };

  const getMaritalStatusLabel = (status?: string) => {
    if (!status) return '';
    switch (status) {
      case 'ledig': return t('maritalSingle');
      case 'verheiratet': return t('maritalMarried');
      case 'in Partnerschaft': return t('maritalPartnership');
      case 'geschieden': return t('maritalDivorced');
      case 'getrennt lebend': return t('maritalSeparated');
      case 'verwitwet': return t('maritalWidowed');
      case 'sonstiges': return t('maritalOther');
      default: return status;
    }
  };

  // Group cases by patient identity (case-insensitive name)
  const groupedPatients = useMemo<GroupedPatient[]>(() => {
    const map = new Map<string, PatientCase[]>();

    cases.forEach(c => {
      const cleanName = (c.patientName || t('patientNameLabel') || 'Patient').trim();
      const key = cleanName.toLowerCase();
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(c);
    });

    const result: GroupedPatient[] = [];
    map.forEach((patientCases, key) => {
      const sortedCases = [...patientCases].sort((a, b) => {
        const da = new Date(a.anamneseDatum || a.analyzedAt || 0).getTime();
        const db = new Date(b.anamneseDatum || b.analyzedAt || 0).getTime();
        return db - da;
      });

      const primaryCase = sortedCases[0];
      const allFollowUps = sortedCases.flatMap(c => c.followUps || []);
      const totalFollowUps = allFollowUps.length;

      const sortedFollowUps = [...allFollowUps].sort((a, b) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      result.push({
        key,
        name: primaryCase.patientName || t('patientNameLabel') || 'Patient',
        cases: sortedCases,
        primaryCase,
        totalFollowUps,
        latestFollowUp: sortedFollowUps[0],
      });
    });

    return result.sort((a, b) => a.name.localeCompare(b.name, language));
  }, [cases, language, t]);

  // Active patient based purely on explicit user selection
  const activePatient = useMemo(() => {
    if (!selectedPatientKey) return null;
    return groupedPatients.find(p => p.key === selectedPatientKey) || null;
  }, [groupedPatients, selectedPatientKey]);

  // Filter patients for the popup modal
  const modalFilteredPatients = useMemo(() => {
    if (!modalSearchQuery.trim()) return groupedPatients;
    const q = modalSearchQuery.toLowerCase().trim();
    return groupedPatients.filter(p => {
      const { firstName, lastName } = parsePatientName(p.name);
      if (p.name.toLowerCase().includes(q)) return true;
      if (firstName.toLowerCase().includes(q)) return true;
      if (lastName.toLowerCase().includes(q)) return true;
      if (p.primaryCase.patientBirthDate?.toLowerCase().includes(q)) return true;
      if (p.primaryCase.patientPhone?.toLowerCase().includes(q)) return true;
      if (p.primaryCase.patientEmail?.toLowerCase().includes(q)) return true;
      return p.cases.some(c => 
        (c.hauptbeschwerde && c.hauptbeschwerde.toLowerCase().includes(q)) ||
        (c.spontanbericht && c.spontanbericht.toLowerCase().includes(q))
      );
    });
  }, [groupedPatients, modalSearchQuery]);

  // Active selected case within the active patient
  const activeCase = useMemo(() => {
    if (!activePatient || activePatient.cases.length === 0) return null;
    if (activeCaseTabId) {
      const found = activePatient.cases.find(c => c.id === activeCaseTabId);
      if (found) return found;
    }
    return activePatient.cases[0];
  }, [activePatient, activeCaseTabId]);

  // Filtered cases for active patient based on search query (all contents & dates)
  const filteredCases = useMemo(() => {
    if (!activePatient) return [];
    const q = caseSearchQuery.trim().toLowerCase();
    if (!q) return activePatient.cases;

    return activePatient.cases.filter((c, idx) => {
      const caseNum = (activePatient.cases.length - idx).toString();
      const caseNumText = `fall ${caseNum}`;

      // Dates: raw ISO, formatted in current language, short format
      const rawDate = (c.anamneseDatum || '').toLowerCase();
      let formattedDate = '';
      let formattedDateShort = '';
      if (c.anamneseDatum) {
        try {
          formattedDate = new Date(c.anamneseDatum).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase();
          formattedDateShort = new Date(c.anamneseDatum).toLocaleDateString(language, { year: 'numeric', month: '2-digit', day: '2-digit' }).toLowerCase();
        } catch {
          // ignore
        }
      }

      // Complaints, notes, modalities, symptoms
      const hauptbeschwerde = (c.hauptbeschwerde || '').toLowerCase();
      const spontanbericht = (c.spontanbericht || '').toLowerCase();
      const gemuetPsyche = (c.gemuetPsyche || '').toLowerCase();
      const lokalsymptome = (c.lokalsymptome || '').toLowerCase();
      const koerperAllgemein = (c.koerperAllgemein || '').toLowerCase();
      const modalitaetenBesser = (c.modalitaetenBesser || '').toLowerCase();
      const modalitaetenSchlechter = (c.modalitaetenSchlechter || '').toLowerCase();
      const bisherigeMittel = (c.bisherigeMittel || '').toLowerCase();

      // Medications
      const medsText = (c.medikamenteList || []).map(m => `${m.name} ${m.dosierung || ''}`).join(' ').toLowerCase();

      // Remedy suggestions
      const remediesText = (c.remedySuggestions || []).map(r => `${r.name} ${r.potency || ''} ${r.description || ''}`).join(' ').toLowerCase();

      // Follow-ups
      const followUpsText = (c.followUps || []).map(f => `${f.notes || ''} ${f.trend || ''} ${f.befindenVerlauf || ''} ${f.remedyRecommendations || ''} ${f.dateDisplay || ''}`).join(' ').toLowerCase();

      return (
        caseNum === q ||
        caseNumText.includes(q) ||
        rawDate.includes(q) ||
        formattedDate.includes(q) ||
        formattedDateShort.includes(q) ||
        hauptbeschwerde.includes(q) ||
        spontanbericht.includes(q) ||
        gemuetPsyche.includes(q) ||
        lokalsymptome.includes(q) ||
        koerperAllgemein.includes(q) ||
        modalitaetenBesser.includes(q) ||
        modalitaetenSchlechter.includes(q) ||
        bisherigeMittel.includes(q) ||
        medsText.includes(q) ||
        remediesText.includes(q) ||
        followUpsText.includes(q)
      );
    });
  }, [activePatient, caseSearchQuery, language]);

  // Helper to compute patient's last edited/consulted timestamp
  const getPatientLastActivityTimestamp = (patient: GroupedPatient): number => {
    let latest = 0;
    
    // Check recorded edit timestamps in storage
    const recentList = getRecentlyEditedPatientNames();
    const found = recentList.find(r => r.name.toLowerCase() === patient.name.toLowerCase());
    if (found && found.timestamp > latest) {
      latest = found.timestamp;
    }

    // Check case timestamps
    for (const c of patient.cases) {
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

  // 3 Most recently edited patients
  const recentEditedPatients = useMemo(() => {
    if (groupedPatients.length === 0) return [];
    
    const enriched = groupedPatients.map(p => {
      const timestamp = getPatientLastActivityTimestamp(p);
      return {
        ...p,
        lastActivityTimestamp: timestamp,
        lastActivityFormatted: formatLastActivity(timestamp, language, t)
      };
    });

    enriched.sort((a, b) => {
      if (b.lastActivityTimestamp !== a.lastActivityTimestamp) {
        return b.lastActivityTimestamp - a.lastActivityTimestamp;
      }
      return a.name.localeCompare(b.name, language);
    });

    return enriched.slice(0, 3);
  }, [groupedPatients, recentEditsRev, language, t]);

  // Open Stammdaten Editor Modal
  const handleOpenEditStammdaten = () => {
    if (!activePatient) return;
    setIsEditStammdatenOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 font-serif">{t('patientDirectoryTitle')}</h1>
              <p className="text-xs text-slate-500">
                {t('patientDirectorySubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-center">
            <span className="block text-xs font-bold text-slate-800">{groupedPatients.length}</span>
            <span className="block text-[10px] text-slate-400 font-medium">{t('patientsCountLabel')}</span>
          </div>
          <div className="bg-teal-50 border border-teal-200/60 px-3.5 py-1.5 rounded-xl text-center">
            <span className="block text-xs font-bold text-teal-800">{cases.length}</span>
            <span className="block text-[10px] text-teal-600 font-medium">{t('casesTotalLabel')}</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN PATIENT WORKSPACE (FULL WIDTH) */}
      {!activePatient ? (
        <div className="space-y-6">
          {/* Prompt card when no patient is active */}
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
                id="btn-new-patient-directory-empty"
                onClick={() => setIsNewPatientModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('btnNewPatientAdmission')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalSearchQuery('');
                  setIsSelectPatientModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Users className="w-4 h-4 text-teal-600" />
                <span>{t('btnOpenPatientSelectionModal')}</span>
              </button>
            </div>
          </div>

          {/* Quick Picker: 3 most recently edited customers */}
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
                        setModalSearchQuery('');
                        setIsSelectPatientModalOpen(true);
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
                        setSelectedPatientKey(p.key);
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
        <div className="space-y-6">
          {/* 1. CUSTOMER / PATIENT HEADER & STAMMDATEN CARD (FULL WIDTH) */}
          <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                  {activePatient.name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900 font-serif">{activePatient.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                      {activePatient.cases.length === 1 
                        ? t('registeredCaseSingle') 
                        : t('registeredCases').replace('{count}', activePatient.cases.length.toString())}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('patientRecord')} • {t('lastConsultation')}: {activePatient.primaryCase.anamneseDatum ? new Date(activePatient.primaryCase.anamneseDatum).toLocaleDateString(language) : t('unknownDate')}
                  </p>
                </div>
              </div>

              {/* Actions: Stammdaten bearbeiten & Auswahl aufheben & Kunde löschen */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatientKey(null);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title={t('unselectPatientBtn')}
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('switchPatient')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenEditStammdaten}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('editMasterData')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRequestDeleteCustomer(activePatient)}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  title={t('btnDeleteCustomer')}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t('btnDeleteCustomer')}</span>
                </button>
              </div>
            </div>

            {/* Structured Stammdaten Grid (Full Width) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-4 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="block text-[10px] text-slate-400 font-medium">{t('birthdateAndAge')}</span>
                <span className="font-semibold text-slate-800">
                  {activePatient.primaryCase.patientBirthDate || '—'} 
                  {activePatient.primaryCase.patientAge ? ` (${activePatient.primaryCase.patientAge} ${t('yearsOld')})` : ''}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="block text-[10px] text-slate-400 font-medium">{t('genderAndStatus')}</span>
                <span className="font-semibold text-slate-800">
                  {getGenderLabel(activePatient.primaryCase.patientGender)}
                  {activePatient.primaryCase.patientMaritalStatus ? ` • ${getMaritalStatusLabel(activePatient.primaryCase.patientMaritalStatus)}` : ''}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="block text-[10px] text-slate-400 font-medium">{t('heightAndWeight')}</span>
                <span className="font-semibold text-slate-800">
                  {activePatient.primaryCase.patientHeightCm ? `${activePatient.primaryCase.patientHeightCm} cm` : '—'} 
                  {activePatient.primaryCase.patientWeightKg ? ` / ${activePatient.primaryCase.patientWeightKg} kg` : ''}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="block text-[10px] text-slate-400 font-medium">{t('hasChildren')}</span>
                <span className="font-semibold text-slate-800">
                  {activePatient.primaryCase.hasChildren 
                    ? t('childrenCountLabel').replace('{count}', (activePatient.primaryCase.childrenCount || activePatient.primaryCase.childrenList?.length || 1).toString()) 
                    : t('noChildren')}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                <span className="block text-[10px] text-slate-400 font-medium">{t('contactData')}</span>
                <div className="flex flex-col gap-0.5 font-semibold text-slate-800 mt-0.5 truncate">
                  {activePatient.primaryCase.patientPhone && (
                    <a href={`tel:${activePatient.primaryCase.patientPhone}`} className="hover:text-teal-700 flex items-center gap-1 truncate text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{activePatient.primaryCase.patientPhone}</span>
                    </a>
                  )}
                  {activePatient.primaryCase.patientEmail && (
                    <a href={`mailto:${activePatient.primaryCase.patientEmail}`} className="hover:text-teal-700 flex items-center gap-1 truncate text-[11px]">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{activePatient.primaryCase.patientEmail}</span>
                    </a>
                  )}
                  {!activePatient.primaryCase.patientPhone && !activePatient.primaryCase.patientEmail && (
                    <span className="text-slate-400">{t('noContactData')}</span>
                  )}
                </div>
              </div>

              {/* Custom Stammdaten / Extra Fields */}
              {activePatient.primaryCase.customStammdaten && activePatient.primaryCase.customStammdaten.length > 0 && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-3 lg:col-span-5">
                  <span className="block text-[10px] text-slate-400 font-medium">{t('extraFields')}</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {activePatient.primaryCase.customStammdaten.map((cs) => (
                      <span key={cs.id} className="inline-block bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                        <strong className="text-slate-600">{cs.name}:</strong> {cs.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. CASES UNDER CUSTOMER (FULL WIDTH ACCORDION WITH SEARCH & SCROLL) */}
          <div className="w-full space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {t('casesOfPatient').replace('{count}', activePatient.cases.length.toString())}
                </h3>
              </div>

              <div className="flex items-center gap-2.5 flex-1 max-w-lg md:justify-end">
                {/* Search input for cases */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={caseSearchQuery}
                    onChange={(e) => setCaseSearchQuery(e.target.value)}
                    placeholder={t('searchCasesPlaceholder')}
                    className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/30 transition-all shadow-2xs"
                  />
                  {caseSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCaseSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title={t('clearBtn')}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {onNewCaseForPatient && (
                  <button
                    type="button"
                    onClick={() => onNewCaseForPatient(activePatient.name, activePatient.primaryCase)}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('btnNewPatientAdmission')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Cases list or empty states */}
            {activePatient.cases.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-700">{t('noCasesForPatient')}</p>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-2">
                <Search className="w-7 h-7 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-700">{t('noCasesFoundForSearch')}</p>
                <button
                  type="button"
                  onClick={() => setCaseSearchQuery('')}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold cursor-pointer hover:bg-teal-100 transition-colors"
                >
                  {t('clearBtn')}
                </button>
              </div>
            ) : (
              <div className={filteredCases.length > 5 ? "max-h-[580px] overflow-y-auto pr-1.5 space-y-3 scrollbar-thin" : "space-y-3"}>
                {filteredCases.map((c, idx) => {
                  const originalIndex = activePatient.cases.findIndex(item => item.id === c.id);
                  const caseNum = originalIndex !== -1 ? activePatient.cases.length - originalIndex : activePatient.cases.length - idx;
                  const dateFormatted = c.anamneseDatum 
                    ? new Date(c.anamneseDatum).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })
                    : t('unknownDate');

                  const hasModalities = !!(c.modalitaetenBesser?.trim() || c.modalitaetenSchlechter?.trim());
                  const hasNotes = !!(c.spontanbericht?.trim() || c.gemuetPsyche?.trim() || c.lokalsymptome?.trim() || c.koerperAllgemein?.trim());
                  const hasMedications = !!(c.medikamenteList && c.medikamenteList.length > 0) || !!c.bisherigeMittel?.trim();
                  const hasRemedies = !!(c.remedySuggestions && c.remedySuggestions.length > 0);
                  const isExpanded = expandedCaseIds.has(c.id);

                  return (
                    <div
                      key={c.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
                    >
                      {/* Case Card Header Row (Clickable Accordion Trigger) */}
                      <div
                        onClick={() => toggleCaseExpanded(c.id)}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer select-none hover:bg-slate-50/70 transition-colors ${
                          isExpanded ? 'border-b border-slate-100 bg-slate-50/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <div
                            className={`p-1 rounded-md text-slate-400 hover:text-slate-700 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-teal-700' : ''
                            }`}
                            title={isExpanded ? t('collapseCase') : t('expandCase')}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </div>

                          <span className="px-3 py-1 rounded-xl bg-teal-50 text-teal-900 border border-teal-200/80 font-bold text-xs">
                            {t('caseAdmission').replace('{num}', caseNum.toString())}
                          </span>
                          
                          <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t('admissionOn').replace('{date}', dateFormatted)}</span>
                          </span>

                          {hasRemedies && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{t('fullyAnalyzed')}</span>
                            </span>
                          )}

                          {c.followUps && c.followUps.length > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium flex items-center gap-1">
                              <Activity className="w-3 h-3 text-teal-600" />
                              <span>{c.followUps.length} {c.followUps.length === 1 ? t('followUpSingle') : t('followUpPlural')}</span>
                            </span>
                          )}
                        </div>

                        {/* Action Buttons: Fall löschen & Repertorisation (compact with icons) */}
                        <div 
                          className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleRequestDeleteCase(c, caseNum, activePatient.name)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                            title={t('btnDeleteCase')}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t('btnDeleteCase')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenCaseInWorkspace(c)}
                            className="px-3 py-1.5 rounded-lg bg-[#00897b] hover:bg-[#00796b] active:bg-[#00695c] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                            title={t('repertorisationBtn')}
                          >
                            <ArrowRight className="w-3.5 h-3.5 text-white" />
                            <span>{t('repertorisationBtn')}</span>
                          </button>
                        </div>
                      </div>

                      {/* Case Details Body - Accordion style (expanded only) */}
                      {isExpanded && (
                        <div className="p-5 pt-4 space-y-3 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                          {/* Hauptbeschwerde */}
                          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-teal-600" />
                              <span>{t('caseChiefComplaint')}</span>
                            </span>
                            <p className="text-slate-900 text-sm font-medium leading-relaxed">
                              {c.hauptbeschwerde || t('noChiefComplaint')}
                            </p>
                          </div>

                          {/* Modalities, Symptoms & Medications Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {/* Modalitäten */}
                            {hasModalities && (
                              <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1.5 shadow-2xs">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                  {t('caseModalities')}
                                </span>
                                {c.modalitaetenBesser && (
                                  <div className="text-slate-700 text-[11px]">
                                    <strong className="text-emerald-700">{t('betterPrefix')}</strong> {c.modalitaetenBesser}
                                  </div>
                                )}
                                {c.modalitaetenSchlechter && (
                                  <div className="text-slate-700 text-[11px]">
                                    <strong className="text-rose-700">{t('worsePrefix')}</strong> {c.modalitaetenSchlechter}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Spontanbericht & Symptomnotizen */}
                            {hasNotes && (
                              <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1 shadow-2xs">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                  {t('caseNotes')}
                                </span>
                                {c.spontanbericht && (
                                  <p className="text-slate-700 text-[11px] line-clamp-3 leading-relaxed">
                                    {c.spontanbericht}
                                  </p>
                                )}
                                {c.gemuetPsyche && !c.spontanbericht && (
                                  <p className="text-slate-700 text-[11px] line-clamp-3 leading-relaxed">
                                    {c.gemuetPsyche}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Medikation & Bisherige Mittel */}
                            {hasMedications && (
                              <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1.5 shadow-2xs">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                                  <Pill className="w-3 h-3 text-teal-600" />
                                  <span>{t('caseMedications')}</span>
                                </span>
                                {c.medikamenteList && c.medikamenteList.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {c.medikamenteList.map((m, mIdx) => (
                                      <span key={mIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-medium">
                                        {m.name}{m.dosierung ? ` (${m.dosierung})` : ''}
                                      </span>
                                    ))}
                                  </div>
                                ) : c.bisherigeMittel ? (
                                  <p className="text-slate-700 text-[11px] line-clamp-2">
                                    {c.bisherigeMittel}
                                  </p>
                                ) : null}
                              </div>
                            )}
                          </div>

                          {/* Top-Mittel / Repertorisations-Empfehlungen */}
                          {hasRemedies && (
                            <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-950">
                                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                                <span>{t('caseTopRemedies')}:</span>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {c.remedySuggestions?.slice(0, 4).map((r, rIdx) => (
                                  <span
                                    key={rIdx}
                                    className="px-2.5 py-0.5 rounded-lg bg-white border border-teal-200 text-teal-900 font-bold text-xs shadow-2xs"
                                  >
                                    {r.name} <span className="text-teal-600 font-normal">({r.score}%)</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT STAMMDATEN MODAL */}
      {activePatient && (
        <StammdatenModal
          isOpen={isEditStammdatenOpen}
          onClose={() => setIsEditStammdatenOpen(false)}
          initialData={activePatient.primaryCase}
          onSave={(data) => {
            updatePatientStammdatenAcrossCases(therapist.id, activePatient.name, data);
            setIsEditStammdatenOpen(false);
            refreshData();
          }}
        />
      )}

      {/* 5. PATIENT / CUSTOMER SELECTION POPUP MODAL */}
      {isSelectPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50/50 to-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-serif">
                    {t('patientSelectionModalTitle')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('patientSelectionModalSubtitle')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSelectPatientModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder={t('searchCustomerModalPlaceholder')}
                  autoFocus
                  className="w-full pl-10 pr-20 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {modalSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setModalSearchQuery('')}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <VoiceInputButton
                    value={modalSearchQuery}
                    onChange={(val) => setModalSearchQuery(val)}
                    size="xs"
                    mode="append"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
                <span>{modalFilteredPatients.length} {t('patientsCountLabel')}</span>
                <span>{t('clickOpensFileBadge')}</span>
              </div>
            </div>

            {/* Patients Table */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {modalFilteredPatients.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-700 text-sm">{t('noPatientsFound')}</p>
                  <p className="text-xs text-slate-400 mt-1">{t('noPatientsFoundSub')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4">{t('colLastName')}</th>
                        <th className="py-3 px-4">{t('colFirstName')}</th>
                        <th className="py-3 px-4">{t('colBirthDate')}</th>
                        <th className="py-3 px-4">{t('colPhone')}</th>
                        <th className="py-3 px-3 text-center">{t('colCasesCount')}</th>
                        <th className="py-3 px-4 text-right">{t('colAction')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {modalFilteredPatients.map((p) => {
                        const { firstName, lastName } = parsePatientName(p.name);
                        const isSelected = activePatient?.key === p.key;

                        return (
                          <tr
                            key={p.key}
                            onClick={() => {
                              setSelectedPatientKey(p.key);
                              setActiveCaseTabId(p.cases[0].id);
                              setIsSelectPatientModalOpen(false);
                            }}
                            className={`cursor-pointer transition-colors group ${
                              isSelected 
                                ? 'bg-teal-50/80 font-medium' 
                                : 'hover:bg-teal-50/40'
                            }`}
                          >
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {lastName}
                            </td>
                            <td className="py-3 px-4 text-slate-800">
                              {firstName}
                            </td>
                            <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                              {p.primaryCase.patientBirthDate ? (
                                <span>
                                  {p.primaryCase.patientBirthDate}
                                  {p.primaryCase.patientAge ? ` (${p.primaryCase.patientAge} ${t('yearsOld')})` : ''}
                                </span>
                              ) : p.primaryCase.patientAge ? (
                                <span>{p.primaryCase.patientAge} {t('yearsOld')}</span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                              {p.primaryCase.patientPhone ? (
                                <span className="flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{p.primaryCase.patientPhone}</span>
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                                {p.cases.length}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPatientKey(p.key);
                                    setActiveCaseTabId(p.cases[0].id);
                                    setIsSelectPatientModalOpen(false);
                                    if (p.cases && p.cases.length > 0) {
                                      onOpenCaseInWorkspace(p.cases[0]);
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-teal-600 group-hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{t('btnSelectAndTransfer')}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRequestDeleteCustomer(p);
                                  }}
                                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer"
                                  title={t('btnDeleteCustomer')}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {modalFilteredPatients.length} {t('patientsListHeader')}
              </span>
              <button
                type="button"
                onClick={() => setIsSelectPatientModalOpen(false)}
                className="px-4 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer transition-colors"
              >
                {t('cancelBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW PATIENT MODAL */}
      <StammdatenModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        initialData={{
          id: '',
          therapistId: therapist.id,
          patientName: '',
          patientGender: 'weiblich',
          anamneseDatum: new Date().toISOString().split('T')[0],
          hauptbeschwerde: '',
          spontanbericht: '',
          modalitaetenBesser: '',
          modalitaetenSchlechter: '',
          gemuetPsyche: '',
          koerperAllgemein: '',
          lokalsymptome: '',
          bisherigeMittel: '',
        }}
        onSave={handleSaveNewPatient}
      />

      {/* DELETION CONFIRMATION DIALOG (WITH SECURITY CODE '360') */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header with red warning badge */}
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 leading-snug font-serif">
                  {deleteTarget.type === 'case'
                    ? t('confirmDeleteCaseTitle')
                    : t('confirmDeleteCustomerTitle')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {deleteTarget.type === 'case'
                    ? t('confirmDeleteCaseQuestion')
                    : t('confirmDeleteCustomerQuestion')}
                </p>
              </div>
            </div>

            {/* Structured Details Box */}
            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5 text-xs">
              {/* Kundenname */}
              <div className="flex items-baseline justify-between gap-2 border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">{t('confirmDeleteCustomerLabel')}:</span>
                <span className="font-bold text-slate-900 text-sm">{deleteTarget.patientName}</span>
              </div>

              {/* If Case: Fall-Nummer & Datum */}
              {deleteTarget.type === 'case' && (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium">{t('confirmDeleteCaseLabel')}:</span>
                    <span className="font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200 text-xs">
                      {t('caseAdmission').replace('{num}', deleteTarget.caseNum.toString())}
                      {deleteTarget.caseItem.anamneseDatum ? ` (${new Date(deleteTarget.caseItem.anamneseDatum).toLocaleDateString(language)})` : ''}
                    </span>
                  </div>

                  {/* Beschwerde kurz aufzeigen */}
                  <div className="space-y-1 pt-1">
                    <span className="text-slate-500 font-medium block">{t('confirmDeleteComplaintLabel')}:</span>
                    <p className="text-slate-800 italic bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-medium">
                      "{deleteTarget.caseItem.hauptbeschwerde || t('confirmDeleteNoComplaint')}"
                    </p>
                  </div>
                </>
              )}

              {/* If Customer: Total cases count & sample complaint */}
              {deleteTarget.type === 'customer' && (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-medium">{t('casesOfPatient').replace('{count}', '')}:</span>
                    <span className="font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200 text-xs">
                      {t('confirmDeleteCustomerCasesCount').replace('{count}', deleteTarget.casesCount.toString())}
                    </span>
                  </div>

                  {deleteTarget.sampleComplaint && (
                    <div className="space-y-1 pt-1">
                      <span className="text-slate-500 font-medium block">{t('confirmDeleteComplaintLabel')}:</span>
                      <p className="text-slate-800 italic bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-medium">
                        "{deleteTarget.sampleComplaint}"
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Irreversible warning */}
              <div className="text-[11px] text-rose-600 font-medium flex items-center gap-1.5 pt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{t('confirmDeleteWarningIrreversible')}</span>
              </div>
            </div>

            {/* Security code entry requirement */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                {t('confirmDeleteCodeInstruction')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={securityCodeInput}
                  onChange={(e) => setSecurityCodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && securityCodeInput.trim() === '360') {
                      handleConfirmDelete();
                    }
                  }}
                  placeholder={t('confirmDeleteCodePlaceholder')}
                  maxLength={6}
                  className={`w-full px-4 py-2.5 text-center text-lg font-mono font-bold tracking-widest rounded-xl border transition-all focus:outline-none ${
                    securityCodeInput.trim() === '360'
                      ? 'border-rose-500 bg-rose-50/40 text-rose-700 ring-2 ring-rose-200'
                      : 'border-slate-300 bg-white text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-200'
                  }`}
                />
              </div>
            </div>

            {/* Action Buttons: Nein (Cancel) & Ja (Confirm) */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setSecurityCodeInput('');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                {t('confirmDeleteNoButton')}
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={securityCodeInput.trim() !== '360'}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
                  securityCodeInput.trim() === '360'
                    ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white cursor-pointer shadow-rose-200'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('confirmDeleteYesButton')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
