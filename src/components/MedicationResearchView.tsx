import React, { useState, useEffect, useMemo } from 'react';
import { 
  Pill, 
  Search, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  Globe, 
  Layers, 
  Plus, 
  User, 
  Info, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink,
  Sparkles,
  Loader2,
  Calendar,
  Clock,
  ArrowRight,
  Mail,
  Phone,
  Scale,
  X,
  ArrowLeft
} from 'lucide-react';
import { PatientCase } from '../types';
import { TranslationKey } from '../i18n/translations';
import { useTranslation } from '../i18n/LanguageContext';
import { MedicationMonographView } from './MedicationMonographView';
import { MedicationMultiComparisonView } from './MedicationMultiComparisonView';
import { 
  searchMedications, 
  fetchMedicationDetails, 
  formatMedicationMonograph,
  MedicationSuggestion 
} from '../services/medicationDatabase';
import { 
  localizeStructuredMedication, 
  fetchLocalizedStructuredMedication, 
  LocalizedStructuredData 
} from '../services/medicationLocalization';
import { savePatientCase, isFeatureLimitReached, incrementTherapistUsage } from '../services/storage';

interface MedicationResearchViewProps {
  currentCase: Partial<PatientCase>;
  allCases?: PatientCase[];
  onSelectCase?: (caseId: string) => void;
  onOpenMedicationsModal?: (autoAddNew?: boolean) => void;
  onUpdateCase?: (updatedCase: Partial<PatientCase>) => void;
  onClose?: () => void;
}

export const MedicationResearchView: React.FC<MedicationResearchViewProps> = ({
  currentCase,
  allCases = [],
  onSelectCase,
  onOpenMedicationsModal,
  onUpdateCase,
  onClose,
}) => {
  const { t, language } = useTranslation();

  // Search query for research in database
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MedicationSuggestion[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Selected medication for detailed view (either from current patient list or search result)
  const patientMeds = currentCase.medikamenteList || [];
  const [selectedMedIndex, setSelectedMedIndex] = useState<number>(0);
  const [researchedMedDetail, setResearchedMedDetail] = useState<MedicationSuggestion | null>(null);
  const [viewMode, setViewMode] = useState<'structured' | 'fluid' | 'comparison'>('structured');
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isComparisonModalOpen) {
        setIsComparisonModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isComparisonModalOpen]);

  // Ensure comparison tab gracefully resets if medication count falls to 1 or 0
  useEffect(() => {
    if (patientMeds.length <= 1) {
      if (viewMode === 'comparison') setViewMode('structured');
      if (isComparisonModalOpen) setIsComparisonModalOpen(false);
    }
  }, [patientMeds.length, viewMode, isComparisonModalOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getGenderLabel = (gender?: string) => {
    if (!gender) return '—';
    switch (gender) {
      case 'weiblich': return t('genderFemale' as TranslationKey) || 'Weiblich';
      case 'männlich': return t('genderMale' as TranslationKey) || 'Männlich';
      case 'divers': return t('genderOther' as TranslationKey) || 'Divers';
      default: return gender;
    }
  };

  const getMaritalStatusLabel = (status?: string) => {
    if (!status) return '';
    switch (status) {
      case 'ledig': return t('maritalSingle' as TranslationKey) || 'Ledig';
      case 'verheiratet': return t('maritalMarried' as TranslationKey) || 'Verheiratet';
      case 'in Partnerschaft': return t('maritalPartnership' as TranslationKey) || 'In Partnerschaft';
      case 'geschieden': return t('maritalDivorced' as TranslationKey) || 'Geschieden';
      case 'getrennt lebend': return t('maritalSeparated' as TranslationKey) || 'Getrennt lebend';
      case 'verwitwet': return t('maritalWidowed' as TranslationKey) || 'Verwitwet';
      case 'sonstiges': return t('maritalOther' as TranslationKey) || 'Sonstiges';
      default: return status;
    }
  };

  const patientCasesCount = useMemo(() => {
    if (!currentCase.patientName) return 1;
    const norm = currentCase.patientName.trim().toLowerCase();
    const matches = allCases.filter(c => c.patientName && c.patientName.trim().toLowerCase() === norm);
    return matches.length > 0 ? matches.length : 1;
  }, [currentCase.patientName, allCases]);

  const patientInitials = useMemo(() => {
    return (currentCase.patientName || 'P')
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
      : (t('unknownDate' as TranslationKey) || '—');
  }, [currentCase.anamneseDatum, language, t]);

  // Perform search in medical database with debounce and request abortion
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const abortController = new AbortController();

    const timer = setTimeout(async () => {
      const therapistId = currentCase.therapistId || '';
      if (therapistId) {
        const limitCheck = isFeatureLimitReached(therapistId, 'maxMedResearch', 1);
        if (limitCheck.reached) {
          window.dispatchEvent(new CustomEvent('homoeo_action_limit_reached', {
            detail: { feature: t('tariffLimitMedResearchLabel'), limit: limitCheck.limit }
          }));
          return;
        }
      }

      setIsSearching(true);
      try {
        const results = await searchMedications(trimmed, false, language, abortController.signal);
        if (!abortController.signal.aborted) {
          setSearchResults(results);
          setHasSearched(true);
          if (therapistId) {
            incrementTherapistUsage(therapistId, 'med_research');
          }
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          console.warn('Error during medication research search:', e);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [searchQuery, language]);

  // Determine active medication item to display
  const activePatientMed = patientMeds.length > 0 && selectedMedIndex >= 0 && selectedMedIndex < patientMeds.length
    ? patientMeds[selectedMedIndex]
    : null;

  // If a searched med is actively selected, it overrides activePatientMed
  const activeDisplayItem = researchedMedDetail || (activePatientMed ? {
    name: activePatientMed.name,
    category: activePatientMed.kategorie,
    activeSubstance: activePatientMed.wirkstoff,
    packageSizes: activePatientMed.packungsgroessen,
    dosages: activePatientMed.dosierung ? [activePatientMed.dosierung] : [],
    recommendedIntake: activePatientMed.einnahmeart,
    sideEffectsByFrequency: activePatientMed.nebenwirkungenGegliedert,
    sideEffects: activePatientMed.nebenwirkungen,
    interactions: activePatientMed.wechselwirkungen,
    contraindications: activePatientMed.kontraindikationen,
    warnings: activePatientMed.risiken,
    monographText: activePatientMed.monographText,
    authoritySource: activePatientMed.authoritySource || 'Geprüfte Fachinformation (BfArM / EMA / Rote Liste)',
    fromDatabase: true,
  } as MedicationSuggestion : null);

  // When active item lacks full structured details or monographText, auto-fetch in background
  useEffect(() => {
    const medName = activeDisplayItem?.name?.trim();
    if (!medName || medName.length < 2) return;

    // Check if we need to fetch deeper monograph text
    if (!activeDisplayItem.monographText) {
      const abortController = new AbortController();
      setIsLoadingDetail(true);

      fetchMedicationDetails(medName, language, abortController.signal)
        .then((detail) => {
          if (abortController.signal.aborted || !detail) return;
          if (researchedMedDetail && researchedMedDetail.name === medName) {
            setResearchedMedDetail(detail);
          } else if (activePatientMed && activePatientMed.name === detail.name) {
            // Update current case with enriched data
            const updatedList = patientMeds.map((m, idx) => {
              if (idx === selectedMedIndex) {
                return {
                  ...m,
                  wirkstoff: detail.activeSubstance || m.wirkstoff,
                  kategorie: detail.category || m.kategorie,
                  packungsgroessen: detail.packageSizes || m.packungsgroessen,
                  nebenwirkungenGegliedert: detail.sideEffectsByFrequency || m.nebenwirkungenGegliedert,
                  nebenwirkungen: detail.sideEffects || m.nebenwirkungen,
                  wechselwirkungen: detail.interactions || m.wechselwirkungen,
                  kontraindikationen: detail.contraindications || m.kontraindikationen,
                  risiken: detail.warnings || m.risiken,
                  monographText: detail.monographText || formatMedicationMonograph(detail, language as any),
                  authoritySource: detail.authoritySource || m.authoritySource
                };
              }
              return m;
            });
            const updatedCase = {
              ...currentCase,
              medikamenteList: updatedList
            };
            if (currentCase.id) {
              savePatientCase(updatedCase as PatientCase);
            }
            if (onUpdateCase) onUpdateCase(updatedCase);
          }
        })
        .catch((err: any) => {
          if (err?.name !== 'AbortError') {
            console.warn('Error fetching medication detail:', err);
          }
        })
        .finally(() => {
          if (!abortController.signal.aborted) {
            setIsLoadingDetail(false);
          }
        });

      return () => {
        abortController.abort();
      };
    }
  }, [activeDisplayItem?.name, language]);

  // Localized version of the active item for compact structured view
  const [localizedDisplayItem, setLocalizedDisplayItem] = useState<LocalizedStructuredData | null>(null);
  const [isTranslatingStructured, setIsTranslatingStructured] = useState<boolean>(false);

  // Loading progress bar state
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [isFinishingLoad, setIsFinishingLoad] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoadingDetail) {
      setLoadProgress(6);
      setIsFinishingLoad(false);
      interval = setInterval(() => {
        setLoadProgress(prev => {
          // Organic, steady forward movement that never freezes throughout the entire loading duration
          if (prev < 25) {
            // Stage 1: Initializing & querying database (~3.5-4s)
            return Math.min(25, prev + (0.45 + Math.random() * 0.45));
          }
          if (prev < 50) {
            // Stage 2: Authority monographs (~4s)
            return Math.min(50, prev + (0.28 + Math.random() * 0.32));
          }
          if (prev < 75) {
            // Stage 3: Pharmacology & dosages (~5s)
            return Math.min(75, prev + (0.18 + Math.random() * 0.24));
          }
          if (prev < 90) {
            // Stage 4: Interactions & warnings (~5s)
            return Math.min(90, prev + (0.12 + Math.random() * 0.16));
          }
          if (prev < 97.5) {
            // Stage 5: Assembling data - continuously creeps forward smoothly, never stops!
            return Math.min(97.5, prev + (0.04 + Math.random() * 0.05));
          }
          return Math.min(98.8, prev + 0.015);
        });
      }, 90);
    } else if (loadProgress > 0) {
      // Completed! Shoot smoothly to 100% and finish smoothly with green checkmark
      setLoadProgress(100);
      setIsFinishingLoad(true);
      const timer = setTimeout(() => {
        setIsFinishingLoad(false);
        setLoadProgress(0);
      }, 550);
      return () => clearTimeout(timer);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoadingDetail]);

  useEffect(() => {
    if (!activeDisplayItem) {
      setLocalizedDisplayItem(null);
      setIsTranslatingStructured(false);
      return;
    }

    if (language === 'de') {
      setLocalizedDisplayItem(activeDisplayItem as any);
      setIsTranslatingStructured(false);
      return;
    }

    // Step 1: Immediate local dictionary translation
    const immediate = localizeStructuredMedication(activeDisplayItem as any, language);
    setLocalizedDisplayItem(immediate);

    // Step 2: Full asynchronous translation from AI / server
    let isCancelled = false;
    setIsTranslatingStructured(true);
    fetchLocalizedStructuredMedication(activeDisplayItem as any, language)
      .then((translated) => {
        if (!isCancelled && translated) {
          setLocalizedDisplayItem(translated);
        }
      })
      .catch((err) => {
        console.warn('[MedicationResearchView] Error localizing structured item:', err);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsTranslatingStructured(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeDisplayItem?.name, language]);

  const displayItem = (language === 'de' ? activeDisplayItem : (localizedDisplayItem || activeDisplayItem)) as (MedicationSuggestion | LocalizedStructuredData | null);

  // Add a searched medication directly to the active patient's case
  const handleAddSearchedMedToPatient = async (med: MedicationSuggestion) => {
    let detail = med;
    if (!med.monographText) {
      const fetched = await fetchMedicationDetails(med.name, language);
      if (fetched) detail = fetched;
    }

    const newMedItem = {
      name: detail.name,
      dosierung: (detail.dosages && detail.dosages[0]) || (detail.defaultDosages && detail.defaultDosages[0]) || 'Standard',
      einnahmeart: '',
      wirkstoff: detail.activeSubstance,
      kategorie: detail.category,
      packungsgroessen: detail.packageSizes,
      nebenwirkungenGegliedert: detail.sideEffectsByFrequency,
      nebenwirkungen: detail.sideEffects,
      wechselwirkungen: detail.interactions,
      kontraindikationen: detail.contraindications,
      risiken: detail.warnings,
      monographText: detail.monographText || formatMedicationMonograph(detail, language as any),
      authoritySource: detail.authoritySource || 'Geprüfte Fachinformation (BfArM / EMA / Rote Liste)',
      datenbankQuelle: 'datenbank' as const
    };

    const therapistId = currentCase.therapistId || '';
    if (therapistId) {
      const limitCheck = isFeatureLimitReached(therapistId, 'maxMedsPerCase', 1, currentCase.id);
      if (limitCheck.reached) {
        window.dispatchEvent(new CustomEvent('homoeo_action_limit_reached', {
          detail: { feature: t('tariffLimitMedsPerCaseLabel'), limit: limitCheck.limit }
        }));
        return;
      }
    }

    const updatedList = [...patientMeds, newMedItem];
    const updatedCase = {
      ...currentCase,
      nimmtMedikamente: true,
      medikamenteList: updatedList
    };

    if (currentCase.id) {
      savePatientCase(updatedCase as PatientCase);
    }
    if (onUpdateCase) onUpdateCase(updatedCase);
    setSelectedMedIndex(updatedList.length - 1);
    setResearchedMedDetail(null);
    setSearchQuery('');
    showToast(`${t('medAddedSuccess' as TranslationKey) || 'Medikament hinzugefügt'}: ${detail.name}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full md:overflow-hidden bg-slate-50 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 bg-teal-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className={`bg-white border-b border-slate-200 shrink-0 shadow-2xs ${onClose ? 'px-4 py-2.5' : 'px-6 py-4'}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className={`rounded-lg bg-teal-50 text-teal-700 border border-teal-200/70 ${onClose ? 'p-1' : 'p-1.5'}`}>
                  <Pill className={onClose ? 'w-4 h-4' : 'w-5 h-5'} />
                </span>
                <h1 className={`font-bold text-slate-900 tracking-tight ${onClose ? 'text-sm' : 'text-xl'}`}>
                  {t('medPageTitle' as TranslationKey) || 'Medikamente & Arzneimittelrecherche'}
                </h1>
              </div>
            </div>
            {!onClose && (
              <p className="text-xs text-slate-500 max-w-3xl mt-1">
                {t('medPageSubtitle' as TranslationKey) || 'Vollständige klinische Monographien, Wechselwirkungen, Nebenwirkungen und Fachdaten der aktuellen Patientenmedikation.'}
              </p>
            )}
          </div>

          {onClose && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                id="btn-medication-research-close"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label={t('closeModalBtn' as TranslationKey) || 'Schließen'}
                title={t('closeModalBtn' as TranslationKey) || 'Schließen'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer Header & Stammdaten Panel (Full Width, Vertically Flush with Grids) - Hidden in Pop-up Modal to maximize screen space */}
      {!onClose && (
        <div className="w-full bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                {patientInitials}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900 font-serif">
                    {currentCase.patientName || t('unnamedPatient' as TranslationKey) || 'Unbenannt'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                    {patientCasesCount === 1 
                      ? (t('registeredCaseSingle' as TranslationKey) || '1 Fall registriert') 
                      : (t('registeredCases' as TranslationKey) || '{count} Fälle registriert').replace('{count}', patientCasesCount.toString())}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('patientRecord' as TranslationKey) || 'Patientenakte'} • {t('lastConsultation' as TranslationKey) || 'Letzte Konsultation'}: {lastConsultationFormatted}
                </p>
              </div>
            </div>
          </div>

          {/* Structured Stammdaten Grid (Full Width) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-3.5 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-medium">{t('birthdateAndAge' as TranslationKey) || 'Geburtsdatum & Alter'}</span>
              <span className="font-semibold text-slate-800">
                {currentCase.patientBirthDate || '—'} 
                {currentCase.patientAge ? ` (${currentCase.patientAge} ${t('yearsOld' as TranslationKey) || 'Jahre'})` : ''}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-medium">{t('genderAndStatus' as TranslationKey) || 'Geschlecht & Status'}</span>
              <span className="font-semibold text-slate-800">
                {getGenderLabel(currentCase.patientGender)}
                {currentCase.patientMaritalStatus ? ` • ${getMaritalStatusLabel(currentCase.patientMaritalStatus)}` : ''}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-medium">{t('heightAndWeight' as TranslationKey) || 'Größe & Gewicht'}</span>
              <span className="font-semibold text-slate-800">
                {currentCase.patientHeightCm ? `${currentCase.patientHeightCm} cm` : '—'} 
                {currentCase.patientWeightKg ? ` / ${currentCase.patientWeightKg} kg` : ''}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="block text-[10px] text-slate-400 font-medium">{t('hasChildren' as TranslationKey) || 'Haben Sie Kinder?'}</span>
              <span className="font-semibold text-slate-800">
                {currentCase.hasChildren 
                  ? (t('childrenCountLabel' as TranslationKey) || '{count} Kind(er)').replace('{count}', (currentCase.childrenCount || currentCase.childrenList?.length || 1).toString()) 
                  : (t('noChildren' as TranslationKey) || 'Keine')}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
              <span className="block text-[10px] text-slate-400 font-medium">{t('contactData' as TranslationKey) || 'Kontaktdaten (Telefon & E-Mail)'}</span>
              <div className="flex flex-col gap-0.5 font-semibold text-slate-800 mt-0.5 truncate">
                {currentCase.patientPhone && (
                  <a href={`tel:${currentCase.patientPhone}`} className="hover:text-teal-700 flex items-center gap-1 truncate text-[11px]">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{currentCase.patientPhone}</span>
                  </a>
                )}
                {currentCase.patientEmail && (
                  <a href={`mailto:${currentCase.patientEmail}`} className="hover:text-teal-700 flex items-center gap-1 truncate text-[11px]">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{currentCase.patientEmail}</span>
                  </a>
                )}
                {!currentCase.patientPhone && !currentCase.patientEmail && (
                  <span className="text-slate-400">{t('noContactData' as TranslationKey) || 'Keine Kontaktdaten hinterlegt'}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden min-h-0">
        {/* Left Column: Patient Med List & Search Results (38% width) */}
        <div className="w-full md:w-[380px] lg:w-[420px] bg-white md:border-r border-b md:border-b-0 border-slate-200 flex flex-col overflow-visible md:overflow-hidden shrink-0">
          {/* If there are search results, show them on top */}
          {hasSearched && (
            <div className="border-b border-slate-200 bg-teal-50/40 p-3 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>{t('medSearchResultsCount' as TranslationKey, { count: searchResults.length })}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  {t('btnClose' as TranslationKey) || 'Schließen'}
                </button>
              </div>

              {searchResults.length === 0 ? (
                <p className="text-xs text-slate-500 py-2 text-center">
                  {t('medNoSearchResultFound' as TranslationKey) || 'Kein passendes Präparat in der Fachdatenbank gefunden.'}
                </p>
              ) : (
                <div className="space-y-1.5">
                  {searchResults.map((res, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-teal-200/80 bg-white hover:border-teal-400 transition-all flex items-start justify-between gap-2 shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setResearchedMedDetail(res);
                        }}
                        className="text-left flex-1 cursor-pointer"
                      >
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{res.name}</span>
                          {res.fromDatabase && (
                            <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-teal-100 text-teal-800">
                              DB
                            </span>
                          )}
                        </div>
                        {res.activeSubstance && (
                          <div className="text-[10px] text-teal-700 font-medium">
                            {res.activeSubstance}
                          </div>
                        )}
                        {res.category && (
                          <div className="text-[10px] text-slate-500 truncate">
                            {res.category}
                          </div>
                        )}
                      </button>

                      <button
                        type="button"
                        title={t('medAddResearchedToPatient' as TranslationKey) || 'Zur Patientenmedikation hinzufügen'}
                        onClick={() => handleAddSearchedMedToPatient(res)}
                        className="px-2 py-1 bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-800 rounded text-[10px] font-bold border border-teal-200 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{t('medAddBtn' as TranslationKey) || 'Hinzufügen'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Patient Medication List Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              <span>{t('medPatientCurrentList' as TranslationKey) || 'Erfasste Medikation'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                {patientMeds.length}
              </span>
            </h2>
          </div>

          {/* List of Medications */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* Comparison Shortcut if more than 1 medication - positioned directly ABOVE Add Medication button */}
            {patientMeds.length > 1 && (
              <button
                type="button"
                id="btn-comparison-modal-shortcut"
                onClick={() => setIsComparisonModalOpen(true)}
                className="w-full p-2.5 rounded-xl border border-[#fa657c] text-xs font-semibold flex items-center justify-between transition-all cursor-pointer bg-[#FF788C] hover:bg-[#fa657c] active:bg-[#f05970] text-white shadow-xs group"
                title={t('medComparisonModalFullWidthTitle' as TranslationKey) || 'Kombinations- & Risikovergleich in Vollansicht öffnen'}
              >
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white">
                    {t('medViewModeComparison' as TranslationKey) || 'Kombinations- & Risikovergleich'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white text-[#e11d48] shadow-2xs">
                    {patientMeds.length}
                  </span>
                  <span className="text-[10px] text-white/95 font-medium">Popup</span>
                </div>
              </button>
            )}

            {/* Add Medication Button */}
            {onOpenMedicationsModal && (
              <button
                type="button"
                id="btn-add-patient-medication-list"
                onClick={() => onOpenMedicationsModal(true)}
                className="w-full p-2.5 rounded-xl border border-teal-600 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer group"
                title={t('addMedication' as TranslationKey) || 'Medikament hinzufügen'}
              >
                <Plus className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <span>{t('addMedication' as TranslationKey) || 'Medikament hinzufügen'}</span>
              </button>
            )}

            {patientMeds.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Pill className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 mb-1">
                  {t('medNoMedsRecorded' as TranslationKey) || 'Keine Medikamente hinterlegt'}
                </h3>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                  {t('medNoMedsRecordedDesc' as TranslationKey) || 'Erfassen Sie Medikamente schnell über das Eingabefenster oder recherchieren Sie beliebige Präparate direkt im Suchfeld.'}
                </p>
              </div>
            ) : (
              patientMeds.map((m, idx) => {
                  const isSelected = !researchedMedDetail && selectedMedIndex === idx && viewMode !== 'comparison';
                  const hasInteractions = !!(m.wechselwirkungen?.length || m.risiken);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setResearchedMedDetail(null);
                        setSelectedMedIndex(idx);
                        if (viewMode === 'comparison') {
                          setViewMode('structured');
                        }
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50/70 border-teal-500 shadow-2xs ring-2 ring-teal-500/10'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5 truncate">
                            <span>{m.name}</span>
                            {hasInteractions && (
                              <span title={t('medInteractionsRecordedTooltip' as TranslationKey) || 'Interaktionen/Risiken erfasst'}>
                                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                              </span>
                            )}
                          </div>
                          {m.wirkstoff && (
                            <div className="text-[10px] text-teal-700 font-medium truncate">
                              {m.wirkstoff}
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-600">
                            {m.dosierung && (
                              <span className="font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                                {m.dosierung}
                              </span>
                            )}
                            {m.einnahmeart && (
                              <span className="font-medium text-slate-600 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {m.einnahmeart}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-transform ${isSelected ? 'text-teal-700 translate-x-0.5' : 'text-slate-300'}`} />
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Monograph & Authority Research (62% width) */}
        <div className="flex-1 flex flex-col bg-slate-50 overflow-visible md:overflow-hidden">
          {activeDisplayItem ? (
            <div className="flex-1 flex flex-col h-full overflow-visible md:overflow-hidden">
              {/* Detail Header */}
              <div className="bg-white border-b border-slate-200 p-4 shrink-0 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                        {viewMode === 'comparison'
                          ? (t('medComparisonHeading' as TranslationKey) || 'Mehrfachmedikations-Vergleich & Kumulative Risikoanalyse')
                          : (displayItem?.name || activeDisplayItem.name)}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                        {viewMode === 'comparison' ? (
                          <>
                            <Scale className="w-3 h-3" />
                            <span>{t('medComparisonBadge' as TranslationKey) || 'Klinische Pharmakologie & Arzneimittelsicherheit'}</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3 h-3" />
                            <span>{t('medStrictAuthorityBadge' as TranslationKey) || 'Geprüfte Fachinformation'}</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                      {viewMode === 'comparison' ? (
                        <span>
                          {(t('medComparisonPrescribedCountNotice' as TranslationKey) || '{count} verordnete Medikamente im patientenspezifischen Risikovergleich').replace('{count}', patientMeds.length.toString())}
                        </span>
                      ) : (
                        <>
                          {displayItem?.activeSubstance && (
                            <span>
                              <strong className="text-slate-800">{t('medActiveSubstanceLabel' as TranslationKey) || 'Wirkstoff'}:</strong> {displayItem.activeSubstance}
                            </span>
                          )}
                          {displayItem?.category && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span>
                                <strong className="text-slate-800">{t('medCategoryLabel' as TranslationKey) || 'Kategorie'}:</strong> {displayItem.category}
                              </span>
                            </>
                          )}
                          {isTranslatingStructured && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 ml-1">
                              <Loader2 className="w-3 h-3 animate-spin text-teal-600" />
                              <span>{t('medMonographTranslating' as TranslationKey) || 'Fachinformation wird übersetzt...'}</span>
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* View Mode Toggle: Kompaktansicht vs. Fließtext-Monographie vs. Kombinations- & Risikovergleich */}
                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setViewMode('structured')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        viewMode === 'structured'
                          ? 'bg-white text-teal-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{t('medViewModeStructured' as TranslationKey) || 'Kompaktansicht'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('fluid')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        viewMode === 'fluid'
                          ? 'bg-white text-teal-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{t('medViewModeFluid' as TranslationKey) || 'Fließtext-Monographie'}</span>
                    </button>
                  </div>
                </div>

                {/* If researched item is currently displayed, offer one-click add to patient */}
                {researchedMedDetail && viewMode !== 'comparison' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-teal-800 font-medium">
                      {t('medResearchedNotYetAddedNote' as TranslationKey) || 'Dieses recherchierte Präparat ist noch nicht der Patientenakte hinzugefügt.'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddSearchedMedToPatient(researchedMedDetail)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('medAddResearchedToPatient' as TranslationKey) || 'Zur Patientenmedikation hinzufügen'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {viewMode === 'comparison' ? (
                  <MedicationMultiComparisonView
                    currentCase={currentCase}
                    onUpdateCase={onUpdateCase}
                    onOpenMedicationsModal={onOpenMedicationsModal}
                  />
                ) : (isLoadingDetail && !activeDisplayItem.monographText) || isFinishingLoad ? (
                  <div className="py-12 px-4 flex flex-col items-center justify-center">
                    <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center animate-in fade-in-50 duration-200">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-4 text-teal-600 shadow-2xs">
                        {loadProgress >= 100 ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 animate-in zoom-in-50 duration-200" />
                        ) : (
                          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 mb-1 truncate px-2">
                        {activeDisplayItem?.name}
                      </h4>

                      <p className="text-xs font-medium text-slate-600 min-h-[34px] flex items-center justify-center px-2 mb-4 transition-all duration-300">
                        {loadProgress >= 100
                          ? (t('medLoadingComplete' as TranslationKey) || 'Fachinformation vollständig geladen')
                          : loadProgress >= 90
                          ? (t('medDataCollectedAssembling' as TranslationKey) || 'Alle Daten gesammelt, werden nun zusammengestellt...')
                          : loadProgress >= 75
                          ? (t('medLoadingInteractions' as TranslationKey) || 'Wechselwirkungen & Gegenanzeigen prüfen...')
                          : loadProgress >= 50
                          ? (t('medLoadingPharmacology' as TranslationKey) || 'Pharmakologische Parameter & Dosierungen analysieren...')
                          : loadProgress >= 25
                          ? (t('medLoadingAuthorityData' as TranslationKey) || 'Behördliche Monographien (BfArM / EMA) werden abgerufen...')
                          : (t('medLoadingDbInit' as TranslationKey) || 'Fachdatenbank wird initialisiert & durchsucht...')}
                      </p>

                      {/* Ladebalken with continuous motion and shimmer */}
                      <div className="space-y-1.5">
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5 relative">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-150 ease-out relative overflow-hidden"
                            style={{ width: `${Math.min(100, Math.max(loadProgress, 6))}%` }}
                          >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-progress-shimmer" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-0.5">
                          <span>{Math.min(100, Math.round(loadProgress))}%</span>
                          <span className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
                            {loadProgress >= 100 ? (
                              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{t('saved' as TranslationKey) || 'Bereit'}</span>
                              </span>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                <span>{t('medStatusOnline' as TranslationKey) || 'online...'}</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : viewMode === 'fluid' ? (
                  <MedicationMonographView
                    monographText={displayItem?.monographText || activeDisplayItem.monographText || formatMedicationMonograph(activeDisplayItem, language as any)}
                    medName={activeDisplayItem.name}
                    activeSubstance={displayItem?.activeSubstance || activeDisplayItem.activeSubstance}
                    authoritySource={activeDisplayItem.authoritySource}
                    t={t}
                  />
                ) : (
                  /* Professional Structured Compact View */
                  <div className="space-y-4 max-w-4xl">
                    {/* Authority notice */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100/80 px-3 py-2 rounded-lg border border-slate-200">
                      <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>
                        {t('medNoHallucinationNotice' as TranslationKey) || 'Strikte behördliche Datenbasis: Es werden keine Daten erfunden oder abgeleitet.'}
                      </span>
                    </div>

                    {/* Section 1: Dosierung, Darreichung & Packungsgrößen */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-teal-600" />
                        <span>{t('medDosageAndPackagesTitle' as TranslationKey) || 'Dosierung & Packungsgrößen'}</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {activePatientMed && (
                          <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-100">
                            <span className="font-bold block text-teal-900 mb-0.5">
                              {t('medCurrentPrescriptionForPatient' as TranslationKey) || 'Aktuelle Verordnung für diesen Patienten'}:
                            </span>
                            <div className="text-slate-800">
                              <strong>{t('medDosageLabel' as TranslationKey) || 'Dosierung'}:</strong> {activePatientMed.dosierung || (t('medNotSpecified' as TranslationKey) || 'Nicht angegeben')}
                            </div>
                            <div className="text-slate-800">
                              <strong>{t('medFrequencyLabel' as TranslationKey) || 'Häufigkeit'}:</strong> {activePatientMed.einnahmeart || (t('medNotSpecified' as TranslationKey) || 'Nicht angegeben')}
                            </div>
                          </div>
                        )}

                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="font-bold block text-slate-900 mb-0.5">
                            {t('medAvailableStrengths' as TranslationKey) || 'Verfügbare Stärken'}:
                          </span>
                          <div className="text-slate-700">
                            {Array.isArray(displayItem?.dosages) && displayItem.dosages.length > 0
                              ? displayItem.dosages.join(', ')
                              : Array.isArray(activeDisplayItem.dosages) && activeDisplayItem.dosages.length > 0
                              ? activeDisplayItem.dosages.join(', ')
                              : (activeDisplayItem.defaultDosages?.join(', ') || (t('medStandardDosageNotice' as TranslationKey) || 'Standarddosierung laut Fachinformation'))}
                          </div>
                        </div>

                        {Array.isArray(displayItem?.packageSizes) && displayItem.packageSizes.length > 0 ? (
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 sm:col-span-2">
                            <span className="font-bold block text-slate-900 mb-0.5">
                              {t('medPackageSizesLabel' as TranslationKey) || 'Packungsgrößen (N1, N2, N3)'}:
                            </span>
                            <div className="text-slate-700">
                              {displayItem.packageSizes.join(' • ')}
                            </div>
                          </div>
                        ) : Array.isArray(activeDisplayItem.packageSizes) && activeDisplayItem.packageSizes.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 sm:col-span-2">
                            <span className="font-bold block text-slate-900 mb-0.5">
                              {t('medPackageSizesLabel' as TranslationKey) || 'Packungsgrößen (N1, N2, N3)'}:
                            </span>
                            <div className="text-slate-700">
                              {activeDisplayItem.packageSizes.join(' • ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 2: Nebenwirkungen gegliedert nach Häufigkeit */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>{t('medSideEffects' as TranslationKey) || 'Unerwünschte Wirkungen (Nebenwirkungen)'}</span>
                      </h3>

                      {displayItem?.sideEffectsByFrequency && (
                        (displayItem.sideEffectsByFrequency.veryCommon && displayItem.sideEffectsByFrequency.veryCommon.length > 0) ||
                        (displayItem.sideEffectsByFrequency.common && displayItem.sideEffectsByFrequency.common.length > 0) ||
                        (displayItem.sideEffectsByFrequency.uncommon && displayItem.sideEffectsByFrequency.uncommon.length > 0) ||
                        (displayItem.sideEffectsByFrequency.rare && displayItem.sideEffectsByFrequency.rare.length > 0) ||
                        (displayItem.sideEffectsByFrequency.veryRare && displayItem.sideEffectsByFrequency.veryRare.length > 0)
                      ) ? (
                        <div className="space-y-2">
                          {displayItem.sideEffectsByFrequency.veryCommon && displayItem.sideEffectsByFrequency.veryCommon.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs">
                              <span className="font-bold text-amber-950 block mb-0.5">
                                {t('medFreqVeryCommon' as TranslationKey) || 'Sehr häufig (≥ 1/10)'}:
                              </span>
                              <div className="text-slate-800 leading-relaxed">
                                {displayItem.sideEffectsByFrequency.veryCommon.join(', ')}
                              </div>
                            </div>
                          )}

                          {displayItem.sideEffectsByFrequency.common && displayItem.sideEffectsByFrequency.common.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-amber-50/30 border border-amber-200/60 text-xs">
                              <span className="font-bold text-amber-900 block mb-0.5">
                                {t('medFreqCommon' as TranslationKey) || 'Häufig (≥ 1/100 bis < 1/10)'}:
                              </span>
                              <div className="text-slate-800 leading-relaxed">
                                {displayItem.sideEffectsByFrequency.common.join(', ')}
                              </div>
                            </div>
                          )}

                          {displayItem.sideEffectsByFrequency.uncommon && displayItem.sideEffectsByFrequency.uncommon.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                              <span className="font-bold text-slate-800 block mb-0.5">
                                {t('medFreqUncommon' as TranslationKey) || 'Gelegentlich (≥ 1/1.000 bis < 1/100)'}:
                              </span>
                              <div className="text-slate-700 leading-relaxed">
                                {displayItem.sideEffectsByFrequency.uncommon.join(', ')}
                              </div>
                            </div>
                          )}

                          {displayItem.sideEffectsByFrequency.rare && displayItem.sideEffectsByFrequency.rare.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                              <span className="font-bold text-slate-800 block mb-0.5">
                                {t('medFreqRare' as TranslationKey) || 'Selten (≥ 1/10.000 bis < 1/1.000)'}:
                              </span>
                              <div className="text-slate-700 leading-relaxed">
                                {displayItem.sideEffectsByFrequency.rare.join(', ')}
                              </div>
                            </div>
                          )}

                          {displayItem.sideEffectsByFrequency.veryRare && displayItem.sideEffectsByFrequency.veryRare.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                              <span className="font-bold text-slate-800 block mb-0.5">
                                {t('medFreqVeryRare' as TranslationKey) || 'Sehr selten (< 1/10.000)'}:
                              </span>
                              <div className="text-slate-700 leading-relaxed">
                                {displayItem.sideEffectsByFrequency.veryRare.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : displayItem?.sideEffects && displayItem.sideEffects.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-xs text-slate-800 pl-1 leading-relaxed">
                          {displayItem.sideEffects.map((se, sIdx) => (
                            <li key={sIdx}>{se}</li>
                          ))}
                        </ul>
                      ) : activeDisplayItem.sideEffectsByFrequency ? (
                        <div className="space-y-2">
                          {activeDisplayItem.sideEffectsByFrequency.veryCommon && activeDisplayItem.sideEffectsByFrequency.veryCommon.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs">
                              <span className="font-bold text-amber-950 block mb-0.5">
                                {t('medFreqVeryCommon' as TranslationKey) || 'Sehr häufig (≥ 1/10)'}:
                              </span>
                              <div className="text-slate-800 leading-relaxed">
                                {activeDisplayItem.sideEffectsByFrequency.veryCommon.join(', ')}
                              </div>
                            </div>
                          )}
                          {activeDisplayItem.sideEffectsByFrequency.common && activeDisplayItem.sideEffectsByFrequency.common.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-amber-50/30 border border-amber-200/60 text-xs">
                              <span className="font-bold text-amber-900 block mb-0.5">
                                {t('medFreqCommon' as TranslationKey) || 'Häufig (≥ 1/100 bis < 1/10)'}:
                              </span>
                              <div className="text-slate-800 leading-relaxed">
                                {activeDisplayItem.sideEffectsByFrequency.common.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">
                          {t('medNoSpecificSideEffects' as TranslationKey) || 'Keine spezifischen Nebenwirkungen in der behördlichen Kurzinformation aufgeführt.'}
                        </p>
                      )}
                    </div>

                    {/* Section 3: Wechselwirkungen & Gefahren */}
                    {((displayItem?.interactions && displayItem.interactions.length > 0) || (activeDisplayItem.interactions && activeDisplayItem.interactions.length > 0)) && (
                      <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-2xs space-y-3">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-rose-900 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <span>{t('medInteractions' as TranslationKey) || 'Relevante Wechselwirkungen (Interaktionen)'}</span>
                        </h3>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-800 pl-1 leading-relaxed">
                          {((displayItem?.interactions && displayItem.interactions.length > 0) ? displayItem.interactions : activeDisplayItem.interactions || []).map((inter, iIdx) => (
                            <li key={iIdx} className="leading-relaxed">{inter}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Section 4: Kontraindikationen & Warnungen */}
                    {(displayItem?.contraindications || displayItem?.warnings || activeDisplayItem.contraindications || activeDisplayItem.warnings) && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                          <span>{t('medWarnings' as TranslationKey) || 'Kontraindikationen & Warnhinweise'}</span>
                        </h3>

                        {/* Absolute Contraindications */}
                        {(() => {
                          const cItem = displayItem?.contraindications || activeDisplayItem.contraindications;
                          if (cItem && typeof cItem === 'object' && cItem.absolute && cItem.absolute.length > 0) {
                            return (
                              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-950">
                                <span className="font-bold block mb-1">
                                  {t('medAbsoluteContraindicationsLabel' as TranslationKey) || 'Absolute Gegenanzeigen (Anwendung ausgeschlossen)'}:
                                </span>
                                <ul className="list-disc list-inside space-y-0.5 text-slate-800">
                                  {cItem.absolute.map((c, cIdx) => (
                                    <li key={cIdx}>{c}</li>
                                  ))}
                                </ul>
                              </div>
                            );
                          }
                          if (typeof cItem === 'string' && cItem.trim()) {
                            return (
                              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-950">
                                <span className="font-bold block mb-1">
                                  {t('medAbsoluteContraindicationsLabel' as TranslationKey) || 'Absolute Gegenanzeigen (Anwendung ausgeschlossen)'}:
                                </span>
                                <div className="text-slate-800 leading-relaxed">{cItem}</div>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* Relative Contraindications */}
                        {(() => {
                          const cItem = displayItem?.contraindications || activeDisplayItem.contraindications;
                          if (cItem && typeof cItem === 'object' && cItem.relative && cItem.relative.length > 0) {
                            return (
                              <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-950">
                                <span className="font-bold block mb-1">
                                  {t('medRelativeContraindicationsLabel' as TranslationKey) || 'Relative Gegenanzeigen (Besondere Vorsicht erforderlich)'}:
                                </span>
                                <ul className="list-disc list-inside space-y-0.5 text-slate-800">
                                  {cItem.relative.map((c, cIdx) => (
                                    <li key={cIdx}>{c}</li>
                                  ))}
                                </ul>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* Warnings */}
                        {(displayItem?.warnings || activeDisplayItem.warnings) && (
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed">
                            <span className="font-bold block mb-0.5 text-slate-900">
                              {t('medOfficialWarningsLabel' as TranslationKey) || 'Behördliche Warnhinweise'}:
                            </span>
                            {displayItem?.warnings || activeDisplayItem.warnings}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">
                {t('medDetailAnalysis' as TranslationKey) || 'Fachinformation & Klinische Monographie'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {t('medSelectMedPrompt' as TranslationKey) || 'Wählen Sie links ein Medikament aus der Liste oder recherchieren Sie ein beliebiges Präparat im Suchfeld.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL-WIDTH POPUP MODAL: KOMBINATIONS- & RISIKOVERGLEICH                  */}
      {/* ========================================================================= */}
      {isComparisonModalOpen && (
        <div
          id="comparison-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsComparisonModalOpen(false);
          }}
        >
          <div
            id="comparison-modal-container"
            className="bg-slate-50 w-full h-[94vh] max-h-[96vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Modal Top Header Bar */}
            <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 shadow-2xs">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      {t('medComparisonHeading' as TranslationKey) || 'Mehrfachmedikations-Vergleich & Kumulative Risikoanalyse'}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                      <span>{patientMeds.length} {t('medComparisonCountBadge' as TranslationKey) || 'Medikamente erfasst'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {currentCase.patientName ? `${currentCase.patientName} • ` : ''}
                    {currentCase.patientAge ? `${currentCase.patientAge} ${t('yearsOld' as TranslationKey) || 'Jahre'} • ` : ''}
                    {getGenderLabel(currentCase.patientGender)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-close-comparison-modal"
                  onClick={() => setIsComparisonModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title={t('medComparisonModalClose' as TranslationKey) || 'Schließen (Esc)'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50/70">
              <MedicationMultiComparisonView
                currentCase={currentCase}
                onUpdateCase={onUpdateCase}
                onOpenMedicationsModal={onOpenMedicationsModal}
                onClose={() => setIsComparisonModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
