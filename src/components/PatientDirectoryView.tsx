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
import { useTerminology } from '../i18n/TerminologyContext';
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
  ArrowLeft,
  X, 
  Calendar, 
  Sparkles, 
  Pill, 
  Clock, 
  Trash2, 
  AlertTriangle, 
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Filter, 
  ArrowUpDown, 
  User, 
  Heart, 
  Baby, 
  Scale, 
  Ruler, 
  ExternalLink, 
  Check,
  MoreVertical,
  Eye
} from 'lucide-react';

interface PatientDirectoryViewProps {
  therapist: Therapist;
  onOpenCaseInWorkspace: (patientCase: PatientCase) => void;
  onOpenOrganonForCase?: (patientCase: PatientCase) => void;
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
  lastActivityTimestamp: number;
  lastActivityFormatted: string;
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

// Calculate BMI and appropriate category key
function calculateBMI(heightCm?: number, weightKg?: number): { bmi: number; categoryKey: string } | null {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  let categoryKey = 'bmiCategoryNormal';
  if (bmi < 18.5) categoryKey = 'bmiCategoryUnder';
  else if (bmi < 25) categoryKey = 'bmiCategoryNormal';
  else if (bmi < 30) categoryKey = 'bmiCategoryOver';
  else categoryKey = 'bmiCategoryObese';
  return { bmi, categoryKey };
}

// Stable deterministic numeric customer ID: e.g. 100261
function getPatientCustomerNumber(patient: GroupedPatient): string {
  if (patient.primaryCase.customStammdaten) {
    const customNr = patient.primaryCase.customStammdaten.find(
      d => {
        const key = ((d as any).label || d.name || '').toLowerCase();
        return key.includes('kundennummer') || key.includes('patientennummer') || key.includes('id');
      }
    );
    if (customNr?.value?.trim()) return customNr.value.trim();
  }
  let hash = 0;
  const str = patient.key || 'patient';
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 900000;
  }
  return (100000 + Math.abs(hash)).toString();
}

// Universal search matching across all patient attributes and treatment cases
function matchesPatientUniversalSearch(p: GroupedPatient, rawQuery: string): boolean {
  const q = rawQuery.toLowerCase().trim();
  if (!q) return true;

  const { firstName, lastName } = parsePatientName(p.name);
  const custNr = getPatientCustomerNumber(p);

  // Names, key & customer ID
  if (p.name.toLowerCase().includes(q)) return true;
  if (firstName.toLowerCase().includes(q)) return true;
  if (lastName.toLowerCase().includes(q)) return true;
  if (p.key.toLowerCase().includes(q)) return true;
  if (custNr.toLowerCase().includes(q)) return true;

  // Demographics from primary case
  if (p.primaryCase.patientBirthDate?.toLowerCase().includes(q)) return true;
  if (p.primaryCase.patientAge?.toString().includes(q)) return true;
  if (p.primaryCase.patientGender?.toLowerCase().includes(q)) return true;
  if (p.primaryCase.patientMaritalStatus?.toLowerCase().includes(q)) return true;

  // Contact info
  if (p.primaryCase.patientPhone?.toLowerCase().includes(q)) return true;
  if (p.primaryCase.patientEmail?.toLowerCase().includes(q)) return true;

  // Address fields (including legacy / arbitrary keys)
  const primaryAny = p.primaryCase as any;
  if (primaryAny.patientAddress?.toLowerCase().includes(q)) return true;
  if (primaryAny.address?.toLowerCase().includes(q)) return true;
  if (primaryAny.patientStreet?.toLowerCase().includes(q)) return true;
  if (primaryAny.patientCity?.toLowerCase().includes(q)) return true;
  if (primaryAny.patientZip?.toLowerCase().includes(q)) return true;
  if (primaryAny.strasse?.toLowerCase().includes(q)) return true;
  if (primaryAny.ort?.toLowerCase().includes(q)) return true;
  if (primaryAny.plz?.toLowerCase().includes(q)) return true;

  // Custom master data fields
  if (p.primaryCase.customStammdaten) {
    const matchedCustom = p.primaryCase.customStammdaten.some(cs => {
      const fieldName = ((cs as any).label || cs.name || '').toLowerCase();
      const val = (cs.value || '').toLowerCase();
      return fieldName.includes(q) || val.includes(q);
    });
    if (matchedCustom) return true;
  }

  // Children names
  if (p.primaryCase.childrenList && p.primaryCase.childrenList.some(ch => ch.name.toLowerCase().includes(q))) {
    return true;
  }

  // Cases, anamnesis, symptoms, modalities, remedies, medications, follow-ups
  return p.cases.some(c => {
    const cAny = c as any;
    if (c.patientEmail?.toLowerCase().includes(q)) return true;
    if (c.patientPhone?.toLowerCase().includes(q)) return true;
    if (c.patientBirthDate?.toLowerCase().includes(q)) return true;
    if (cAny.patientAddress?.toLowerCase().includes(q)) return true;
    if (cAny.address?.toLowerCase().includes(q)) return true;
    if (cAny.patientStreet?.toLowerCase().includes(q)) return true;
    if (cAny.patientCity?.toLowerCase().includes(q)) return true;
    if (cAny.patientZip?.toLowerCase().includes(q)) return true;
    if (cAny.strasse?.toLowerCase().includes(q)) return true;
    if (cAny.ort?.toLowerCase().includes(q)) return true;
    if (cAny.plz?.toLowerCase().includes(q)) return true;

    if (c.customStammdaten && c.customStammdaten.some(cs => {
      const fieldName = ((cs as any).label || cs.name || '').toLowerCase();
      const val = (cs.value || '').toLowerCase();
      return fieldName.includes(q) || val.includes(q);
    })) return true;

    if (c.hauptbeschwerde?.toLowerCase().includes(q)) return true;
    if (c.spontanbericht?.toLowerCase().includes(q)) return true;
    if (c.gemuetPsyche?.toLowerCase().includes(q)) return true;
    if (c.koerperAllgemein?.toLowerCase().includes(q)) return true;
    if (c.lokalsymptome?.toLowerCase().includes(q)) return true;
    if (c.modalitaetenBesser?.toLowerCase().includes(q)) return true;
    if (c.modalitaetenSchlechter?.toLowerCase().includes(q)) return true;
    if (c.bisherigeMittel?.toLowerCase().includes(q)) return true;
    if (c.anamneseDatum?.toLowerCase().includes(q)) return true;
    if (c.medikamenteList?.some(m => m.name.toLowerCase().includes(q) || m.dosierung.toLowerCase().includes(q) || (m.wirkstoff && m.wirkstoff.toLowerCase().includes(q)))) return true;
    if (c.remedySuggestions?.some(r => r.name.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q)))) return true;
    if (c.followUps?.some(fu => (fu.trend && fu.trend.toLowerCase().includes(q)) || (fu.notes && fu.notes.toLowerCase().includes(q)) || (fu.remedyRecommendations && fu.remedyRecommendations.toLowerCase().includes(q)))) return true;

    return false;
  });
}

// Formatted Date & Time for Table: e.g. 28.05.2025 13:23
function formatActivityDateTime(timestamp: number, lang: string): string {
  if (!timestamp || timestamp <= 0) return '—';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '—';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch {
    return '—';
  }
}

export const PatientDirectoryView: React.FC<PatientDirectoryViewProps> = ({
  therapist,
  onOpenCaseInWorkspace,
  onOpenOrganonForCase,
  onNewCaseForPatient,
  initialOpenAction,
  onActionHandled,
}) => {
  const { t, language } = useTranslation();
  const { termPatient, termPatients, termPatientenkartei } = useTerminology();
  const [cases, setCases] = useState<PatientCase[]>(() => getPatientCases(therapist.id));
  const [recentEditsRev, setRecentEditsRev] = useState(0);
  const [selectedPatientKey, setSelectedPatientKey] = useState<string | null>(null);
  const [activeCaseTabId, setActiveCaseTabId] = useState<string | null>(null);
  
  // Directory Search, Filter & Sort State
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'recent' | 'with_cases' | 'no_cases'>('all');
  const [sortField, setSortField] = useState<'name_asc' | 'name_desc' | 'activity_desc' | 'activity_asc' | 'cases_desc' | 'age_desc'>('activity_desc');
  
  // Pagination & Multi-Selection State (max 10 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPatientKeys, setSelectedPatientKeys] = useState<Set<string>>(new Set());
  const [actionMenuOpenKey, setActionMenuOpenKey] = useState<string | null>(null);

  useEffect(() => {
    const handleCloseMenu = () => setActionMenuOpenKey(null);
    if (actionMenuOpenKey) {
      document.addEventListener('click', handleCloseMenu);
      return () => document.removeEventListener('click', handleCloseMenu);
    }
  }, [actionMenuOpenKey]);

  // Quick Customer Entry Form State (on top of directory, closed by default upon page opening)
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  // Recent Patients Table State (collapsed by default upon page opening)
  const [isRecentPatientsOpen, setIsRecentPatientsOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickBirthDate, setQuickBirthDate] = useState('');
  const [quickAge, setQuickAge] = useState<number | undefined>(undefined);
  const [quickGender, setQuickGender] = useState<'weiblich' | 'männlich' | 'divers'>('weiblich');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickMaritalStatus, setQuickMaritalStatus] = useState('');
  const [quickHeightCm, setQuickHeightCm] = useState<number | undefined>(undefined);
  const [quickWeightKg, setQuickWeightKg] = useState<number | undefined>(undefined);
  const [quickHasChildren, setQuickHasChildren] = useState(false);
  const [quickChildrenCount, setQuickChildrenCount] = useState<number>(0);
  const [quickIsPregnant, setQuickIsPregnant] = useState(false);
  const [quickPregnancyMonth, setQuickPregnancyMonth] = useState<number | undefined>(undefined);
  const [quickChiefComplaint, setQuickChiefComplaint] = useState('');
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // Case Search & Accordion State within Active Customer Page
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [expandedCaseIds, setExpandedCaseIds] = useState<Set<string>>(new Set());

  // Reset case search and expand first case when changing selected patient
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

  // Modals & Editors
  const [isEditStammdatenOpen, setIsEditStammdatenOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  // Automatically open modal if requested by forward action
  useEffect(() => {
    if (initialOpenAction === 'new_patient') {
      setIsNewPatientModalOpen(true);
      onActionHandled?.();
    } else if (initialOpenAction === 'select_patient') {
      setSelectedPatientKey(null);
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

  useEffect(() => {
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

  // Helper to compute patient's last edited/consulted timestamp
  const getPatientLastActivityTimestamp = (patientCases: PatientCase[], patientName: string): number => {
    let latest = 0;
    
    // Check recorded edit timestamps in storage
    const recentList = getRecentlyEditedPatientNames();
    const found = recentList.find(r => r.name.toLowerCase() === patientName.toLowerCase());
    if (found && found.timestamp > latest) {
      latest = found.timestamp;
    }

    // Check case timestamps
    for (const c of patientCases) {
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

      const patientName = primaryCase.patientName || t('patientNameLabel') || 'Patient';
      const timestamp = getPatientLastActivityTimestamp(sortedCases, patientName);

      result.push({
        key,
        name: patientName,
        cases: sortedCases,
        primaryCase,
        totalFollowUps,
        latestFollowUp: sortedFollowUps[0],
        lastActivityTimestamp: timestamp,
        lastActivityFormatted: formatLastActivity(timestamp, language, t)
      });
    });

    return result;
  }, [cases, recentEditsRev, language, t]);

  // Filter and sort patients for the main directory view
  const filteredAndSortedPatients = useMemo(() => {
    let list = [...groupedPatients];

    // 1. Text Search Filter across ALL fields (Name, Vorname, Geburtsdatum, Kundennummer, Adresse, Telefon, E-Mail, Fälle, Symptome etc.)
    if (directorySearchQuery.trim()) {
      list = list.filter(p => matchesPatientUniversalSearch(p, directorySearchQuery));
    }

    // 2. Category Filter
    if (filterCategory === 'recent') {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      list = list.filter(p => p.lastActivityTimestamp >= sevenDaysAgo);
    } else if (filterCategory === 'with_cases') {
      list = list.filter(p => p.cases.length > 0 && p.cases.some(c => !!c.hauptbeschwerde || (c.remedySuggestions && c.remedySuggestions.length > 0)));
    } else if (filterCategory === 'no_cases') {
      list = list.filter(p => p.cases.length === 0 || p.cases.every(c => !c.hauptbeschwerde));
    }

    // 3. Sorting
    list.sort((a, b) => {
      switch (sortField) {
        case 'name_asc':
          return a.name.localeCompare(b.name, language);
        case 'name_desc':
          return b.name.localeCompare(a.name, language);
        case 'activity_desc':
          return (b.lastActivityTimestamp || 0) - (a.lastActivityTimestamp || 0);
        case 'activity_asc':
          return (a.lastActivityTimestamp || 0) - (b.lastActivityTimestamp || 0);
        case 'cases_desc':
          return b.cases.length - a.cases.length;
        case 'age_desc':
          return (b.primaryCase.patientAge || 0) - (a.primaryCase.patientAge || 0);
        default:
          return 0;
      }
    });

    return list;
  }, [groupedPatients, directorySearchQuery, filterCategory, sortField, language]);

  // Table 1: Recent patients (most recently active, up to 5)
  const recentPatients = useMemo(() => {
    let recent = [...groupedPatients].sort((a, b) => (b.lastActivityTimestamp || 0) - (a.lastActivityTimestamp || 0));
    
    if (directorySearchQuery.trim()) {
      recent = recent.filter(p => matchesPatientUniversalSearch(p, directorySearchQuery));
    }
    
    return recent.slice(0, 5);
  }, [groupedPatients, directorySearchQuery]);

  // Table 2: All patients pagination calculations (max 10 per page default)
  const totalPages = Math.ceil(filteredAndSortedPatients.length / itemsPerPage) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedPatients = useMemo(() => {
    const start = (validCurrentPage - 1) * itemsPerPage;
    return filteredAndSortedPatients.slice(start, start + itemsPerPage);
  }, [filteredAndSortedPatients, validCurrentPage, itemsPerPage]);

  const startRecord = filteredAndSortedPatients.length === 0 ? 0 : (validCurrentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(validCurrentPage * itemsPerPage, filteredAndSortedPatients.length);

  // Multi-selection helpers
  const toggleSelectPatient = (key: string) => {
    setSelectedPatientKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSelectAllOnPage = (patientsOnPage: GroupedPatient[]) => {
    const allSelected = patientsOnPage.length > 0 && patientsOnPage.every(p => selectedPatientKeys.has(p.key));
    setSelectedPatientKeys(prev => {
      const next = new Set(prev);
      if (allSelected) {
        patientsOnPage.forEach(p => next.delete(p.key));
      } else {
        patientsOnPage.forEach(p => next.add(p.key));
      }
      return next;
    });
  };

  // Status badge helper (Art der Registrierung)
  const getRegistrationTypeBadge = (patient: GroupedPatient) => {
    const hasFullData = (!!patient.primaryCase.patientEmail || !!patient.primaryCase.patientPhone) && patient.cases.length > 0;
    if (hasFullData) {
      return {
        label: t('regTypeFull'),
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
      };
    }
    if (patient.cases.length > 0) {
      return {
        label: t('regTypeDevice'),
        className: 'bg-slate-100 text-slate-700 border border-slate-200/80'
      };
    }
    return {
      label: t('regTypeQuick'),
      className: 'bg-teal-50 text-teal-700 border border-teal-200/60'
    };
  };

  // Active patient based purely on explicit user selection
  const activePatient = useMemo(() => {
    if (!selectedPatientKey) return null;
    return groupedPatients.find(p => p.key === selectedPatientKey) || null;
  }, [groupedPatients, selectedPatientKey]);

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

  // Handle Quick Customer Registration directly from the page form
  const handleSaveQuickCustomer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pName = quickName.trim();
    if (!pName) return;

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
    const isFemale = quickGender === 'weiblich';
    const created = savePatientCase({
      therapistId: therapist.id,
      patientName: pName,
      patientBirthDate: quickBirthDate || '',
      patientAge: quickAge,
      patientGender: quickGender,
      patientHeightCm: quickHeightCm,
      patientWeightKg: quickWeightKg,
      patientMaritalStatus: quickMaritalStatus || '',
      anamneseDatum: new Date().toISOString().split('T')[0],
      patientEmail: quickEmail || '',
      patientPhone: quickPhone || '',
      isPregnant: isFemale ? quickIsPregnant : false,
      pregnancyMonth: isFemale && quickIsPregnant ? quickPregnancyMonth : undefined,
      hasChildren: quickHasChildren,
      childrenCount: quickHasChildren ? (quickChildrenCount || 1) : 0,
      childrenList: [],
      customStammdaten: [],
      hauptbeschwerde: quickChiefComplaint.trim(),
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

    // Reset Form Fields
    setQuickName('');
    setQuickBirthDate('');
    setQuickAge(undefined);
    setQuickGender('weiblich');
    setQuickPhone('');
    setQuickEmail('');
    setQuickMaritalStatus('');
    setQuickHeightCm(undefined);
    setQuickWeightKg(undefined);
    setQuickHasChildren(false);
    setQuickChildrenCount(0);
    setQuickIsPregnant(false);
    setQuickPregnancyMonth(undefined);
    setQuickChiefComplaint('');

    refreshData();
    setSelectedPatientKey(pName.toLowerCase());
    setActiveCaseTabId(created.id || newCaseId);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3500);
  };

  const handleSaveModalPatient = (data: Partial<PatientCase>) => {
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
    if (!status) return '—';
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

  // Open Stammdaten Editor Modal
  const handleOpenEditStammdaten = () => {
    if (!activePatient) return;
    setIsEditStammdatenOpen(true);
  };

  // Quick BMI Preview for form
  const quickBmi = calculateBMI(quickHeightCm, quickWeightKg);

  return (
    <div className="space-y-6">
      {/* Toast Notification on Save */}
      {saveSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-teal-600 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-7 h-7 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs sm:text-sm font-semibold">{t('customerSavedSuccessToast')}</span>
        </div>
      )}

      {/* VIEW 1: WHEN NO CUSTOMER IS SELECTED -> FULL DIRECTORY WITH LIVE ENTRY & STRUCTURED SEARCH/SORT */}
      {!activePatient ? (
        <div className="space-y-6">
          {/* 1. DIRECT CUSTOMER ENTRY FORM ("wo die Kunden eingegeben werden") */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Header / Collapse Trigger */}
            <div 
              onClick={() => setIsQuickEntryOpen(!isQuickEntryOpen)}
              className={`flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-teal-50/70 via-slate-50/40 to-white cursor-pointer hover:bg-slate-50/60 transition-colors select-none ${
                isQuickEntryOpen ? 'border-b border-slate-100' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 font-serif">
                      {t('customerEntryHeader')}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800">
                      {t('customerDirectInputBadge')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {t('customerEntrySubtitle')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <span>{isQuickEntryOpen ? t('quickInputCollapse') : t('quickInputExpand')}</span>
                {isQuickEntryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {/* Entry Form Body */}
            {isQuickEntryOpen && (
              <form onSubmit={handleSaveQuickCustomer} className="p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Name (Vor- & Nachname) */}
                  <div className="lg:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide text-[11px]">
                      {t('patientName')} *
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={quickName}
                        onChange={(e) => setQuickName(e.target.value)}
                        placeholder={t('patientNamePlaceholder')}
                        className="w-full pl-8 pr-9 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 h-[38px] transition-all bg-white"
                      />
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                        <VoiceInputButton
                          value={quickName}
                          onChange={(val) => setQuickName(val)}
                          size="xs"
                          mode="append"
                          id="quick-voice-customer-name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Geburtsdatum */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide text-[11px]">
                      {t('patientBirthDate')}
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="date"
                        value={quickBirthDate}
                        onChange={(e) => {
                          const bDate = e.target.value;
                          let calcAge = quickAge;
                          if (bDate) {
                            const diff = Date.now() - new Date(bDate).getTime();
                            const ageDate = new Date(diff);
                            calcAge = Math.abs(ageDate.getUTCFullYear() - 1970);
                          }
                          setQuickBirthDate(bDate);
                          if (calcAge !== undefined && !isNaN(calcAge) && calcAge >= 0 && calcAge <= 125) {
                            setQuickAge(calcAge);
                          }
                        }}
                        className="w-full pl-8 pr-2 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 h-[38px] transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Alter */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide text-[11px]">
                      {t('patientAge')}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={125}
                      value={quickAge ?? ''}
                      onChange={(e) => setQuickAge(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder={t('patientAgePlaceholder')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 h-[38px] transition-all bg-white"
                    />
                  </div>

                  {/* Geschlecht */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide text-[11px]">
                      {t('patientGender')}
                    </label>
                    <select
                      value={quickGender}
                      onChange={(e) => setQuickGender(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 h-[38px] transition-all bg-white"
                    >
                      <option value="weiblich">{t('genderFemale')}</option>
                      <option value="männlich">{t('genderMale')}</option>
                      <option value="divers">{t('genderOther')}</option>
                    </select>
                  </div>

                  {/* Familienstand */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide text-[11px]">
                      {t('patientMaritalStatus')}
                    </label>
                    <select
                      value={quickMaritalStatus}
                      onChange={(e) => setQuickMaritalStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 h-[38px] transition-all bg-white"
                    >
                      <option value="">{t('maritalOther')}</option>
                      <option value="ledig">{t('maritalSingle')}</option>
                      <option value="verheiratet">{t('maritalMarried')}</option>
                      <option value="in Partnerschaft">{t('maritalPartnership')}</option>
                      <option value="geschieden">{t('maritalDivorced')}</option>
                      <option value="getrennt lebend">{t('maritalSeparated')}</option>
                      <option value="verwitwet">{t('maritalWidowed')}</option>
                    </select>
                  </div>

                  {/* Telefonnummer */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide text-[11px]">
                      {t('patientPhone')}
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="tel"
                        value={quickPhone}
                        onChange={(e) => setQuickPhone(e.target.value)}
                        placeholder={t('patientPhonePlaceholder')}
                        className="w-full pl-8 pr-2 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 h-[38px] transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* E-Mail */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide text-[11px]">
                      {t('patientEmail')}
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="email"
                        value={quickEmail}
                        onChange={(e) => setQuickEmail(e.target.value)}
                        placeholder={t('patientEmailPlaceholder')}
                        className="w-full pl-8 pr-2 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 h-[38px] transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Größe (cm) */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide text-[11px]">
                      {t('patientHeight')}
                    </label>
                    <div className="relative">
                      <Ruler className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="number"
                        min={30}
                        max={260}
                        value={quickHeightCm ?? ''}
                        onChange={(e) => setQuickHeightCm(e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder={t('patientHeightPlaceholder')}
                        className="w-full pl-8 pr-2 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 h-[38px] transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Gewicht (kg) */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide text-[11px]">
                      {t('patientWeight')}
                    </label>
                    <div className="relative">
                      <Scale className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="number"
                        min={1}
                        max={300}
                        step={0.1}
                        value={quickWeightKg ?? ''}
                        onChange={(e) => setQuickWeightKg(e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder={t('patientWeightPlaceholder')}
                        className="w-full pl-8 pr-2 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 h-[38px] transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* BMI Vorschau */}
                  {quickBmi && (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                      <span className="font-bold text-slate-600">{t('bmiLabel')}:</span>
                      <span className="font-mono font-bold text-slate-900">{quickBmi.bmi}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800">
                        {t(quickBmi.categoryKey as any)}
                      </span>
                    </div>
                  )}

                  {/* Kinder & Schwangerschaft Toggles */}
                  <div className="flex items-center gap-4 flex-wrap pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={quickHasChildren}
                        onChange={(e) => {
                          setQuickHasChildren(e.target.checked);
                          if (e.target.checked && !quickChildrenCount) setQuickChildrenCount(1);
                        }}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-xs">{t('hasChildren')}</span>
                    </label>

                    {quickHasChildren && (
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={quickChildrenCount}
                        onChange={(e) => setQuickChildrenCount(parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-xs"
                      />
                    )}

                    {quickGender === 'weiblich' && (
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 ml-2">
                        <input
                          type="checkbox"
                          checked={quickIsPregnant}
                          onChange={(e) => setQuickIsPregnant(e.target.checked)}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-semibold text-xs">{t('pregnantYes')}</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Optional Erste Hauptbeschwerde */}
                <div className="pt-1">
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wide text-[11px]">
                    {t('caseChiefComplaint')} ({t('firstAdmission')})
                  </label>
                  <div className="relative flex items-center">
                    <Activity className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={quickChiefComplaint}
                      onChange={(e) => setQuickChiefComplaint(e.target.value)}
                      placeholder={t('patientDataDesc')}
                      className="w-full pl-8 pr-9 py-2 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 h-[38px] transition-all bg-white"
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                      <VoiceInputButton
                        value={quickChiefComplaint}
                        onChange={(val) => setQuickChiefComplaint(val)}
                        size="xs"
                        mode="append"
                        id="quick-voice-complaint"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('btnSaveCustomer')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 2. CUSTOMER LIST & SEARCH CONTROLS */}
          <div className="space-y-5">
            {/* Search Bar & Controls Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search Field */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={directorySearchQuery}
                    onChange={(e) => {
                      setDirectorySearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={t('universalSearchPlaceholder')}
                    className="w-full pl-10 pr-20 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all shadow-2xs"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {directorySearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setDirectorySearchQuery('');
                          setCurrentPage(1);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                        title={t('clearBtn')}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <VoiceInputButton
                      value={directorySearchQuery}
                      onChange={(val) => {
                        setDirectorySearchQuery(val);
                        setCurrentPage(1);
                      }}
                      size="xs"
                      mode="append"
                      id="directory-voice-search"
                    />
                  </div>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 self-end lg:self-auto shrink-0 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500 font-medium hidden sm:inline">{t('sortByLabel')}:</span>
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value as any)}
                      className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer text-xs"
                    >
                      <option value="activity_desc">{t('sortActivityDesc')}</option>
                      <option value="activity_asc">{t('sortActivityAsc')}</option>
                      <option value="name_asc">{t('sortNameAsc')}</option>
                      <option value="name_desc">{t('sortNameDesc')}</option>
                      <option value="cases_desc">{t('sortCasesDesc')}</option>
                      <option value="age_desc">{t('sortAgeDesc')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Filter Tabs / Badges */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory('all');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterCategory === 'all'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {t('filterAllCustomers')} ({groupedPatients.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory('recent');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterCategory === 'recent'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {t('filterRecentActive')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory('with_cases');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterCategory === 'with_cases'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {t('filterWithCases')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterCategory('no_cases');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterCategory === 'no_cases'
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {t('filterWithoutCases')}
                </button>

                <div className="ml-auto text-slate-400 text-[11px] hidden sm:block">
                  {t('paginationShowing', { start: startRecord, end: endRecord, total: filteredAndSortedPatients.length })}
                </div>
              </div>
            </div>

            {/* TABELLE 1: LETZTE KUNDEN / PATIENTEN / KLIENTEN (COLLAPSIBLE / DEFAULT CLOSED) */}
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setIsRecentPatientsOpen(!isRecentPatientsOpen)}
                className={`w-full flex items-center justify-between px-4 sm:px-5 py-3.5 bg-gradient-to-r from-slate-50/80 via-white to-white hover:bg-slate-50 transition-colors cursor-pointer select-none text-left ${
                  isRecentPatientsOpen ? 'border-b border-slate-200/90' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-teal-700" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                    {t('recentCustomersTitle', { term: termPatients })}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {recentPatients.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <span>{isRecentPatientsOpen ? t('recentPatientsCollapse') : t('recentPatientsExpand')}</span>
                  {isRecentPatientsOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
              </button>

              {isRecentPatientsOpen && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200/90 text-[11px] uppercase tracking-wider font-semibold select-none">
                    <tr>
                      <th className="w-10 px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={recentPatients.length > 0 && recentPatients.every(p => selectedPatientKeys.has(p.key))}
                          onChange={() => toggleSelectAllOnPage(recentPatients)}
                          className="rounded border-slate-300 text-teal-700 focus:ring-teal-600 cursor-pointer w-4 h-4"
                          title={t('selectAllTooltip')}
                        />
                      </th>
                      <th 
                        onClick={() => setSortField(sortField === 'name_asc' ? 'name_desc' : 'name_asc')}
                        className="py-3.5 px-4 font-semibold text-slate-700 cursor-pointer hover:text-slate-900 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t('patientName')}</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3.5 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span>{t('colRegistrationType')}</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3.5 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span>{t('colCustomerNumber')}</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3.5 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span>{t('patientEmail')}</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th 
                        onClick={() => setSortField(sortField === 'activity_desc' ? 'activity_asc' : 'activity_desc')}
                        className="py-3.5 px-4 font-semibold text-slate-700 cursor-pointer hover:text-slate-900 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t('colLastActivity')}</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th 
                        onClick={() => setSortField(sortField === 'cases_desc' ? 'name_asc' : 'cases_desc')}
                        className="py-3.5 px-4 font-semibold text-slate-700 cursor-pointer hover:text-slate-900 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t('colScorePoints')}</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="w-12 px-4 py-3.5 text-center font-semibold text-slate-700">
                        {t('colActions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {recentPatients.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 px-4 text-center text-slate-400 text-xs">
                          {t('noRecentCustomers')}
                        </td>
                      </tr>
                    ) : (
                      recentPatients.map((p) => {
                        const isSelected = selectedPatientKeys.has(p.key);
                        const badge = getRegistrationTypeBadge(p);
                        const custNr = getPatientCustomerNumber(p);
                        const points = p.cases.length > 0 ? (p.cases.length * 20 + p.totalFollowUps * 10) : 10;
                        const initials = p.name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'K';

                        return (
                          <tr
                            key={p.key}
                            onClick={() => {
                              setSelectedPatientKey(p.key);
                              if (p.cases.length > 0) setActiveCaseTabId(p.cases[0].id);
                            }}
                            className={`hover:bg-slate-50/80 cursor-pointer transition-colors border-b border-slate-100 last:border-0 group select-none ${
                              isSelected ? 'bg-teal-50/30' : ''
                            }`}
                          >
                            <td 
                              className="w-10 px-4 py-3.5 text-center" 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectPatient(p.key);
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="rounded border-slate-300 text-teal-700 focus:ring-teal-600 cursor-pointer w-4 h-4"
                              />
                            </td>

                            <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-teal-700/10 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/50">
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 group-hover:text-teal-800 transition-colors block truncate">
                                    {p.name}
                                  </span>
                                  {p.primaryCase.patientBirthDate && (
                                    <span className="text-[10px] text-slate-400 block font-normal">
                                      * {p.primaryCase.patientBirthDate}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${badge.className}`}>
                                {badge.label}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600 text-xs font-semibold">
                              {custNr}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                              <span className="truncate max-w-[200px] block" title={p.primaryCase.patientEmail || ''}>
                                {p.primaryCase.patientEmail || '—'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                              {formatActivityDateTime(p.lastActivityTimestamp, language)}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 text-xs font-semibold">
                              {points}
                            </td>

                            <td 
                              className="w-12 px-4 py-3.5 text-center relative whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => setActionMenuOpenKey(actionMenuOpenKey === `recent-${p.key}` ? null : `recent-${p.key}`)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                title={t('colActions')}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {actionMenuOpenKey === `recent-${p.key}` && (
                                <div className="absolute right-4 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs animate-in fade-in duration-100 text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuOpenKey(null);
                                      setSelectedPatientKey(p.key);
                                      if (p.cases.length > 0) setActiveCaseTabId(p.cases[0].id);
                                    }}
                                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-teal-600" />
                                    <span>{t('actionViewCustomerRecord')}</span>
                                  </button>

                                  {onNewCaseForPatient && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionMenuOpenKey(null);
                                        onNewCaseForPatient(p.name, p.primaryCase);
                                      }}
                                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5 text-teal-600" />
                                      <span>{t('actionNewCaseForCustomer')}</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuOpenKey(null);
                                      setSelectedPatientKey(p.key);
                                      setIsEditStammdatenOpen(true);
                                    }}
                                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{t('actionEditStammdaten')}</span>
                                  </button>

                                  <div className="my-1 border-t border-slate-100" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuOpenKey(null);
                                      handleRequestDeleteCustomer(p);
                                    }}
                                    className="w-full px-3.5 py-2 text-left hover:bg-rose-50 flex items-center gap-2.5 text-rose-600 font-semibold cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{t('actionDeleteCustomer')}</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

            {/* TABELLE 2: ALLE KUNDEN / PATIENTEN / KLIENTEN (MIT PAGINIERUNG) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-700" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                    {t('allCustomersTitle', { term: termPatients })}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {filteredAndSortedPatients.length}
                  </span>
                </div>

                {selectedPatientKeys.size > 0 && (
                  <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                    {t('selectedCountLabel', { count: selectedPatientKeys.size })}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200/90 text-[11px] uppercase tracking-wider font-semibold select-none">
                    <tr>
                      <th className="w-10 px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={paginatedPatients.length > 0 && paginatedPatients.every(p => selectedPatientKeys.has(p.key))}
                          onChange={() => toggleSelectAllOnPage(paginatedPatients)}
                          className="rounded border-slate-300 text-teal-700 focus:ring-teal-600 cursor-pointer w-4 h-4"
                          title={t('selectAllTooltip')}
                        />
                      </th>
                      <th 
                        onClick={() => setSortField(sortField === 'name_asc' ? 'name_desc' : 'name_asc')}
                        className="py-3.5 px-4 font-semibold text-slate-700 cursor-pointer hover:text-slate-900 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t('patientName')}</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3.5 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span>{t('colRegistrationType')}</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3.5 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span>{t('colCustomerNumber')}</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3.5 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span>{t('patientEmail')}</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th 
                        onClick={() => setSortField(sortField === 'activity_desc' ? 'activity_asc' : 'activity_desc')}
                        className="py-3.5 px-4 font-semibold text-slate-700 cursor-pointer hover:text-slate-900 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t('colLastActivity')}</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th 
                        onClick={() => setSortField(sortField === 'cases_desc' ? 'name_asc' : 'cases_desc')}
                        className="py-3.5 px-4 font-semibold text-slate-700 cursor-pointer hover:text-slate-900 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{t('colScorePoints')}</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="w-12 px-4 py-3.5 text-center font-semibold text-slate-700">
                        {t('colActions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {paginatedPatients.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 px-4 text-center text-slate-400 text-xs">
                          {t('noCustomersInTable')}
                        </td>
                      </tr>
                    ) : (
                      paginatedPatients.map((p) => {
                        const isSelected = selectedPatientKeys.has(p.key);
                        const badge = getRegistrationTypeBadge(p);
                        const custNr = getPatientCustomerNumber(p);
                        const points = p.cases.length > 0 ? (p.cases.length * 20 + p.totalFollowUps * 10) : 10;
                        const initials = p.name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'K';

                        return (
                          <tr
                            key={p.key}
                            onClick={() => {
                              setSelectedPatientKey(p.key);
                              if (p.cases.length > 0) setActiveCaseTabId(p.cases[0].id);
                            }}
                            className={`hover:bg-slate-50/80 cursor-pointer transition-colors border-b border-slate-100 last:border-0 group select-none ${
                              isSelected ? 'bg-teal-50/30' : ''
                            }`}
                          >
                            <td 
                              className="w-10 px-4 py-3.5 text-center" 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectPatient(p.key);
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="rounded border-slate-300 text-teal-700 focus:ring-teal-600 cursor-pointer w-4 h-4"
                              />
                            </td>

                            <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-teal-700/10 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200/50">
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 group-hover:text-teal-800 transition-colors block truncate">
                                    {p.name}
                                  </span>
                                  {p.primaryCase.patientBirthDate && (
                                    <span className="text-[10px] text-slate-400 block font-normal">
                                      * {p.primaryCase.patientBirthDate}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${badge.className}`}>
                                {badge.label}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600 text-xs font-semibold">
                              {custNr}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                              <span className="truncate max-w-[200px] block" title={p.primaryCase.patientEmail || ''}>
                                {p.primaryCase.patientEmail || '—'}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                              {formatActivityDateTime(p.lastActivityTimestamp, language)}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 text-xs font-semibold">
                              {points}
                            </td>

                            <td 
                              className="w-12 px-4 py-3.5 text-center relative whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => setActionMenuOpenKey(actionMenuOpenKey === `all-${p.key}` ? null : `all-${p.key}`)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                title={t('colActions')}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {actionMenuOpenKey === `all-${p.key}` && (
                                <div className="absolute right-4 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs animate-in fade-in duration-100 text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuOpenKey(null);
                                      setSelectedPatientKey(p.key);
                                      if (p.cases.length > 0) setActiveCaseTabId(p.cases[0].id);
                                    }}
                                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-teal-600" />
                                    <span>{t('actionViewCustomerRecord')}</span>
                                  </button>

                                  {onNewCaseForPatient && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActionMenuOpenKey(null);
                                        onNewCaseForPatient(p.name, p.primaryCase);
                                      }}
                                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5 text-teal-600" />
                                      <span>{t('actionNewCaseForCustomer')}</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuOpenKey(null);
                                      setSelectedPatientKey(p.key);
                                      setIsEditStammdatenOpen(true);
                                    }}
                                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{t('actionEditStammdaten')}</span>
                                  </button>

                                  <div className="my-1 border-t border-slate-100" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionMenuOpenKey(null);
                                      handleRequestDeleteCustomer(p);
                                    }}
                                    className="w-full px-3.5 py-2 text-left hover:bg-rose-50 flex items-center gap-2.5 text-rose-600 font-semibold cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>{t('actionDeleteCustomer')}</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/70 border-t border-slate-200/90 text-xs text-slate-600">
                  <div>
                    <span>
                      {startRecord}–{endRecord} {t('paginationOf')} {filteredAndSortedPatients.length} {termPatients}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-1.5">
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none shadow-2xs hover:border-slate-300"
                      >
                        <option value={10}>10 {t('itemsPerPageLabel')}</option>
                        <option value={25}>25 {t('itemsPerPageLabel')}</option>
                        <option value={50}>50 {t('itemsPerPageLabel')}</option>
                      </select>
                    </div>

                    {/* Page navigation */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={validCurrentPage <= 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                        title={t('prevPageBtn')}
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-600" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          if (totalPages <= 7) return true;
                          if (page === 1 || page === totalPages) return true;
                          return Math.abs(page - validCurrentPage) <= 1;
                        })
                        .map((page, idx, arr) => {
                          const prev = arr[idx - 1];
                          const hasGap = prev && page - prev > 1;
                          return (
                            <React.Fragment key={page}>
                              {hasGap && <span className="px-1 text-slate-400">...</span>}
                              <button
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  validCurrentPage === page
                                    ? 'bg-teal-900 text-white shadow-xs'
                                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button
                        type="button"
                        disabled={validCurrentPage >= totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                        title={t('nextPageBtn')}
                      >
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: DEDICATED CUSTOMER PAGE ("wenn man den Kunden dann anklickt... dann sollte das zu der Kundenseite gehen. In der Kundenseite selbst gibt es den Kunden komplett, man sieht also alle Daten, wie man sie eben auch sieht im in dem Pop-up, aber schöner alles gebaut und dann eben, was bis jetzt hier passiert ist") */
        <div className="space-y-6">
          {/* Top Breadcrumb & Navigation Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:px-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <button
              type="button"
              onClick={() => setSelectedPatientKey(null)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-teal-700" />
              <span>{t('backToCustomerDirectory')}</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium">{t('patientDirectoryTitle')}</span>
              <span>/</span>
              <span className="font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                {activePatient.name}
              </span>
            </div>
          </div>

          {/* 1. CUSTOMER HERO PROFILE CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-slate-100">
              {/* Profile Details */}
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">{activePatient.name}</h2>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {activePatient.cases.length === 1 
                      ? t('registeredCaseSingle') 
                      : t('registeredCases').replace('{count}', activePatient.cases.length.toString())}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span>{t('patientRecord')}: <strong className="text-slate-700 font-semibold">{activePatient.key}</strong></span>
                  <span>•</span>
                  <span>{t('lastConsultation')}: {activePatient.primaryCase.anamneseDatum ? new Date(activePatient.primaryCase.anamneseDatum).toLocaleDateString(language) : t('unknownDate')}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {onNewCaseForPatient && (
                  <button
                    type="button"
                    onClick={() => onNewCaseForPatient(activePatient.name, activePatient.primaryCase)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('actionNewCaseForCustomer')}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOpenEditStammdaten}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('editMasterData')}</span>
                </button>

                {onOpenOrganonForCase && activePatient.primaryCase && (
                  <button
                    type="button"
                    onClick={() => onOpenOrganonForCase(activePatient.primaryCase)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                    title={t('btnOrganonAnalysis') || 'Organon'}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>{t('btnOrganonAnalysis') || 'Organon'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRequestDeleteCustomer(activePatient)}
                  className="p-2 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                  title={t('btnDeleteCustomer')}
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                </button>
              </div>
            </div>

            {/* 2. COMPLETE STAMMDATEN BENTO GRID ("man sieht also alle Daten, wie man sie eben auch sieht im in dem Pop-up, aber schöner alles gebaut") */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 text-xs">
              {/* Card A: Demografie & Basisdaten */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>{t('personalDataSection')}</span>
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-400">{t('patientBirthDate')}:</span>
                    <span className="font-semibold text-slate-800">{activePatient.primaryCase.patientBirthDate || '—'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-400">{t('patientAge')}:</span>
                    <span className="font-semibold text-slate-800">{activePatient.primaryCase.patientAge ? `${activePatient.primaryCase.patientAge} ${t('yearsOld')}` : '—'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-400">{t('patientGender')}:</span>
                    <span className="font-semibold text-slate-800">{getGenderLabel(activePatient.primaryCase.patientGender)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('patientMaritalStatus')}:</span>
                    <span className="font-semibold text-slate-800">{getMaritalStatusLabel(activePatient.primaryCase.patientMaritalStatus)}</span>
                  </div>
                </div>
              </div>

              {/* Card B: Körpermaße & BMI */}
              {(() => {
                const bmiData = calculateBMI(activePatient.primaryCase.patientHeightCm, activePatient.primaryCase.patientWeightKg);
                return (
                  <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-teal-600" />
                      <span>{t('bodyDataSection')}</span>
                    </span>
                    <div className="space-y-1.5">
                      <div className="flex justify-between border-b border-slate-200/50 pb-1">
                        <span className="text-slate-400">{t('patientHeight')}:</span>
                        <span className="font-semibold text-slate-800">
                          {activePatient.primaryCase.patientHeightCm ? `${activePatient.primaryCase.patientHeightCm} cm` : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/50 pb-1">
                        <span className="text-slate-400">{t('patientWeight')}:</span>
                        <span className="font-semibold text-slate-800">
                          {activePatient.primaryCase.patientWeightKg ? `${activePatient.primaryCase.patientWeightKg} kg` : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-slate-400">{t('bmiLabel')}:</span>
                        {bmiData ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold font-mono text-slate-900">{bmiData.bmi}</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 text-teal-800">
                              {t(bmiData.categoryKey as any)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Card C: Familie, Kinder & Schwangerschaft */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5 text-teal-600" />
                  <span>{t('familyLifeSection')}</span>
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between border-b border-slate-200/50 pb-1">
                    <span className="text-slate-400">{t('hasChildren')}:</span>
                    <span className="font-semibold text-slate-800">
                      {activePatient.primaryCase.hasChildren 
                        ? t('childrenCountLabel', { count: activePatient.primaryCase.childrenCount || activePatient.primaryCase.childrenList?.length || 1 })
                        : t('noChildren')}
                    </span>
                  </div>

                  {activePatient.primaryCase.isPregnant && (
                    <div className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span className="text-slate-400">{t('pregnantYes')}:</span>
                      <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                        {activePatient.primaryCase.pregnancyMonth 
                          ? `${activePatient.primaryCase.pregnancyMonth}. ${t('pregnantMonthLabel')}`
                          : t('pregnantYes')}
                      </span>
                    </div>
                  )}

                  {activePatient.primaryCase.childrenList && activePatient.primaryCase.childrenList.length > 0 && (
                    <div className="pt-1 space-y-1">
                      {activePatient.primaryCase.childrenList.slice(0, 3).map((ch) => (
                        <div key={ch.id} className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 truncate">
                          {ch.name || t('childrenDetailsTitle')} {ch.age ? `(${ch.age} ${t('yearsOld')})` : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card D: Kontakt & Erreichbarkeit */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>{t('contactData')}</span>
                </span>
                <div className="space-y-2">
                  {activePatient.primaryCase.patientPhone ? (
                    <a
                      href={`tel:${activePatient.primaryCase.patientPhone}`}
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-700 transition-colors"
                    >
                      <span className="font-semibold truncate">{activePatient.primaryCase.patientPhone}</span>
                      <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold shrink-0">
                        {t('callPhoneAction')}
                      </span>
                    </a>
                  ) : (
                    <div className="text-slate-400 text-[11px]">{t('noContactData')}</div>
                  )}

                  {activePatient.primaryCase.patientEmail && (
                    <a
                      href={`mailto:${activePatient.primaryCase.patientEmail}`}
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-700 transition-colors"
                    >
                      <span className="font-semibold truncate">{activePatient.primaryCase.patientEmail}</span>
                      <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold shrink-0">
                        {t('sendEmailAction')}
                      </span>
                    </a>
                  )}
                </div>
              </div>

              {/* Custom Stammdaten / Extra Fields (Full Width) */}
              {activePatient.primaryCase.customStammdaten && activePatient.primaryCase.customStammdaten.length > 0 && (
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 col-span-1 md:col-span-2 lg:col-span-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t('extraFields')}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activePatient.primaryCase.customStammdaten.map((cs) => (
                      <span key={cs.id} className="inline-block bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs">
                        <strong className="text-slate-700 font-semibold">{cs.name}:</strong> {cs.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. TREATMENT PROGRESSION & CASE TIMELINE ("und dann eben, was bis jetzt hier passiert ist") */}
          <div className="space-y-4">
            {/* Header & Case Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-serif">
                    {t('treatmentHistoryTitle')} ({activePatient.cases.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('treatmentHistorySubtitle')}
                  </p>
                </div>
              </div>

              {/* Search Within Patient Cases */}
              <div className="flex items-center gap-2.5 flex-1 max-w-md md:justify-end">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={caseSearchQuery}
                    onChange={(e) => setCaseSearchQuery(e.target.value)}
                    placeholder={t('searchCasesPlaceholder')}
                    className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all shadow-2xs"
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
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('actionNewCaseForCustomer')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Cases Timeline List */}
            {activePatient.cases.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-xs shadow-xs space-y-3">
                <FileText className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-700 text-sm">{t('noCasesForCustomerPrompt')}</p>
                {onNewCaseForPatient && (
                  <button
                    type="button"
                    onClick={() => onNewCaseForPatient(activePatient.name, activePatient.primaryCase)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('btnStartFirstCase')}</span>
                  </button>
                )}
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-2 shadow-xs">
                <Search className="w-8 h-8 mx-auto text-slate-300" />
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
              <div className="space-y-4">
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
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-5 cursor-pointer select-none hover:bg-slate-50/70 transition-colors ${
                          isExpanded ? 'border-b border-slate-100 bg-slate-50/40' : ''
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

                        {/* Action Buttons: Workspace / Organon / Delete */}
                        <div 
                          className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleRequestDeleteCase(c, caseNum, activePatient.name)}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                            title={t('btnDeleteCase')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t('btnDeleteCase')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenCaseInWorkspace(c)}
                            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                            title={t('repertorisationBtn')}
                          >
                            <ArrowRight className="w-3.5 h-3.5 text-white" />
                            <span>{t('repertorisationBtn')}</span>
                          </button>

                          {onOpenOrganonForCase && (
                            <button
                              type="button"
                              onClick={() => onOpenOrganonForCase(c)}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                              title={t('btnOrganonAnalysis') || 'Organon'}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-white" />
                              <span>{t('btnOrganonAnalysis') || 'Organon'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Case Details Body (Always visible or expanded) */}
                      {isExpanded && (
                        <div className="p-5 sm:p-6 pt-4 space-y-4 text-xs animate-in fade-in slide-in-from-top-1 duration-150 border-t border-slate-100">
                          {/* Hauptbeschwerde */}
                          <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-teal-600" />
                              <span>{t('caseChiefComplaint')}</span>
                            </span>
                            <p className="text-slate-900 text-sm font-semibold leading-relaxed">
                              {c.hauptbeschwerde || t('noChiefComplaint')}
                            </p>
                          </div>

                          {/* Modalitäten, Symptome & Medikation Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Modalitäten */}
                            {hasModalities && (
                              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2 shadow-2xs">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                  {t('caseModalities')}
                                </span>
                                {c.modalitaetenBesser && (
                                  <div className="text-slate-700 text-xs">
                                    <strong className="text-emerald-700">{t('betterPrefix')}</strong> {c.modalitaetenBesser}
                                  </div>
                                )}
                                {c.modalitaetenSchlechter && (
                                  <div className="text-slate-700 text-xs">
                                    <strong className="text-rose-700">{t('worsePrefix')}</strong> {c.modalitaetenSchlechter}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Spontanbericht & Notizen */}
                            {hasNotes && (
                              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2 shadow-2xs">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                  {t('caseNotes')}
                                </span>
                                {c.spontanbericht && (
                                  <p className="text-slate-700 text-xs line-clamp-3 leading-relaxed">
                                    {c.spontanbericht}
                                  </p>
                                )}
                                {c.gemuetPsyche && !c.spontanbericht && (
                                  <p className="text-slate-700 text-xs line-clamp-3 leading-relaxed">
                                    {c.gemuetPsyche}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Medikation */}
                            {hasMedications && (
                              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-2 shadow-2xs">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                                  <Pill className="w-3.5 h-3.5 text-teal-600" />
                                  <span>{t('caseMedications')}</span>
                                </span>
                                {c.medikamenteList && c.medikamenteList.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {c.medikamenteList.map((m, mIdx) => (
                                      <span key={mIdx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium">
                                        {m.name}{m.dosierung ? ` (${m.dosierung})` : ''}
                                      </span>
                                    ))}
                                  </div>
                                ) : c.bisherigeMittel ? (
                                  <p className="text-slate-700 text-xs line-clamp-2">
                                    {c.bisherigeMittel}
                                  </p>
                                ) : null}
                              </div>
                            )}
                          </div>

                          {/* Top-Mittel / Repertorisations-Ergebnisse */}
                          {hasRemedies && (
                            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2 text-xs font-bold text-teal-950">
                                <Sparkles className="w-4 h-4 text-teal-600" />
                                <span>{t('caseTopRemedies')}:</span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {c.remedySuggestions?.slice(0, 4).map((r, rIdx) => (
                                  <span
                                    key={rIdx}
                                    className="px-3 py-1 rounded-xl bg-white border border-teal-200 text-teal-900 font-bold text-xs shadow-2xs"
                                  >
                                    {r.name} <span className="text-teal-600 font-normal">({r.score}%)</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Follow-ups List */}
                          {c.followUps && c.followUps.length > 0 && (
                            <div className="space-y-2 pt-2">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-teal-600" />
                                <span>{t('followUpsSubtitle')} ({c.followUps.length})</span>
                              </span>
                              <div className="space-y-2">
                                {c.followUps.map((fu, fuIdx) => (
                                  <div key={fu.id || fuIdx} className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-bold text-slate-800">
                                        {fu.dateDisplay || (fu.createdAt ? new Date(fu.createdAt).toLocaleDateString(language) : `${t('followUpSingle')} ${fuIdx + 1}`)}
                                      </span>
                                      {fu.trend && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                                          {fu.trend}
                                        </span>
                                      )}
                                    </div>
                                    {fu.befindenVerlauf && (
                                      <p className="text-slate-700 leading-relaxed">{fu.befindenVerlauf}</p>
                                    )}
                                    {fu.notes && (
                                      <p className="text-slate-500 italic">{fu.notes}</p>
                                    )}
                                  </div>
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

      {/* EDIT STAMMDATEN MODAL */}
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

      {/* NEW PATIENT MODAL (FALLBACK / TRIGGERED BY ACTIONS) */}
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
        onSave={handleSaveModalPatient}
      />

      {/* DELETION CONFIRMATION DIALOG (WITH SECURITY CODE '360') */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header with warning badge */}
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
