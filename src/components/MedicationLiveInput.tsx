import React, { useState, useEffect, useRef } from 'react';
import {
  searchMedications,
  fetchMedicationDetails,
  MedicationSuggestion,
  COMMON_MEDICATIONS_DB,
  SideEffectsByFrequency,
  formatMedicationMonograph
} from '../services/medicationDatabase';
import {
  Pill,
  Search,
  Globe,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Loader2,
  Trash2,
  X,
  Database,
  CheckCircle2,
  PackageCheck,
  Check,
  Pencil,
  Info
} from 'lucide-react';
import { TranslationKey } from '../i18n/translations';
import { useLanguage } from '../i18n/LanguageContext';
import { MedicationMonographView } from './MedicationMonographView';
import { localizeStructuredMedication, localizeClinicalText } from '../services/medicationLocalization';

export interface MedicationData {
  name: string;
  dosierung: string;
  einnahmeart: string;
  isSaved?: boolean;
  grund?: string;
  wirkstoff?: string;
  kategorie?: string;
  packungsgroessen?: string[];
  nebenwirkungenGegliedert?: SideEffectsByFrequency;
  nebenwirkungen?: string[];
  wechselwirkungen?: string[];
  kontraindikationen?: {
    absolute?: string[];
    relative?: string[];
  };
  risiken?: string;
  monographText?: string;
  datenbankQuelle?: 'datenbank' | 'behoerden_recherche';
  authoritySource?: string;
}

interface MedicationLiveInputProps {
  index: number;
  med: MedicationData;
  onChange: (updated: MedicationData) => void;
  onRemove: () => void;
  t: (key: TranslationKey | any) => string;
  showResearchDetails?: boolean;
  onSaveItem?: (updated: MedicationData) => void;
}

export const MedicationLiveInput: React.FC<MedicationLiveInputProps> = ({
  index,
  med,
  onChange,
  onRemove,
  t,
  showResearchDetails = false,
  onSaveItem
}) => {
  const { language } = useLanguage();
  const [query, setQuery] = useState(med.name || '');
  const [suggestions, setSuggestions] = useState<MedicationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<MedicationSuggestion | null>(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'fluid' | 'structured'>('fluid');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<any>(null);

  // Sync internal query with prop if updated externally
  useEffect(() => {
    if (med.name !== query) {
      setQuery(med.name || '');
    }
    if (!med.name || med.name.trim() === '') {
      setSelectedSuggestion(null);
      setIsDetailsExpanded(false);
      setSuggestions([]);
      setIsOpen(false);
      setIsSearching(false);
    }
  }, [med.name]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When medication name is present but details are missing, fetch them in background
  useEffect(() => {
    if (med.name && med.name.trim().length >= 2 && !med.nebenwirkungen && !med.wechselwirkungen) {
      let isMounted = true;
      fetchMedicationDetails(med.name, language).then(details => {
        if (isMounted && details) {
          setSelectedSuggestion(details);
          onChange({
            ...med,
            wirkstoff: med.wirkstoff || details.activeSubstance,
            kategorie: med.kategorie || details.category,
            packungsgroessen: med.packungsgroessen || details.packageSizes,
            nebenwirkungenGegliedert: med.nebenwirkungenGegliedert || details.sideEffectsByFrequency,
            nebenwirkungen: med.nebenwirkungen || details.sideEffects,
            wechselwirkungen: med.wechselwirkungen || details.interactions,
            kontraindikationen: med.kontraindikationen || details.contraindications,
            risiken: med.risiken || details.warnings,
            monographText: med.monographText || details.monographText,
            datenbankQuelle: details.fromDatabase ? 'datenbank' : 'behoerden_recherche',
            authoritySource: details.authoritySource,
          });
        }
      });
      return () => { isMounted = false; };
    }
  }, [med.name]);

  const executeSearch = async (val: string, forceLive: boolean = false) => {
    if (!val || val.trim().length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setIsOpen(true);
    try {
      const results = await searchMedications(val, forceLive, language);
      setSuggestions(results);
      setIsOpen(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (val: string) => {
    setQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (val.trim().length >= 1) {
      onChange({ ...med, name: val, isSaved: false });
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        executeSearch(val, false);
      }, 150);
    } else {
      setSelectedSuggestion(null);
      setIsDetailsExpanded(false);
      setSuggestions([]);
      setIsOpen(false);
      setIsSearching(false);
      onChange({
        ...med,
        name: '',
        isSaved: false,
        wirkstoff: undefined,
        kategorie: undefined,
        packungsgroessen: undefined,
        nebenwirkungenGegliedert: undefined,
        nebenwirkungen: undefined,
        wechselwirkungen: undefined,
        risiken: undefined,
        datenbankQuelle: undefined,
        authoritySource: undefined,
      });
    }
  };

  const handleSelectMedication = (suggestion: MedicationSuggestion) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setIsSearching(false);
    setQuery(suggestion.name);
    setSelectedSuggestion(suggestion);
    setIsOpen(false);

    // Auto-select first dosage if not set yet
    const dosagesList = (suggestion.defaultDosages && suggestion.defaultDosages.length > 0)
      ? suggestion.defaultDosages
      : (suggestion.dosages && suggestion.dosages.length > 0 ? suggestion.dosages : []);
    const newDosage = med.dosierung || (dosagesList.length > 0 ? dosagesList[0] : '');
    const newIntake = med.einnahmeart || '';

    // Sofortige Übernahme der Basisdaten (Name, Dosierung, Wirkstoff, Kategorie) - 0 Millisekunden Wartezeit!
    onChange({
      ...med,
      name: suggestion.name,
      dosierung: newDosage,
      einnahmeart: newIntake,
      isSaved: false,
      wirkstoff: suggestion.activeSubstance || '',
      kategorie: suggestion.category || '',
      packungsgroessen: suggestion.packageSizes,
      nebenwirkungenGegliedert: suggestion.sideEffectsByFrequency,
      nebenwirkungen: suggestion.sideEffects || [],
      wechselwirkungen: suggestion.interactions || [],
      kontraindikationen: suggestion.contraindications,
      risiken: suggestion.warnings || '',
      monographText: suggestion.monographText,
      datenbankQuelle: suggestion.fromDatabase ? 'datenbank' : 'behoerden_recherche',
      authoritySource: suggestion.authoritySource,
    });

    // Lautlose Hintergrundabfrage der vollständigen Fachinformationen (Monographie, Neben- & Wechselwirkungen),
    // falls diese noch nicht vollständig vorliegen. Komplett ohne blockierenden UI-Spinner oder störende Statusbalken!
    const hasFullData = (suggestion.sideEffects && suggestion.sideEffects.length > 0) || Boolean(suggestion.monographText);
    if (!hasFullData) {
      fetchMedicationDetails(suggestion.name, language)
        .then(fullDetails => {
          if (fullDetails) {
            setSelectedSuggestion(fullDetails);
            const intakeTranslated = fullDetails.recommendedIntake
              ? localizeClinicalText(fullDetails.recommendedIntake, language)
              : '';
            onChange({
              ...med,
              name: suggestion.name,
              dosierung: med.dosierung || newDosage,
              einnahmeart: med.einnahmeart || '',
              isSaved: false,
              wirkstoff: fullDetails.activeSubstance || suggestion.activeSubstance || '',
              kategorie: fullDetails.category || suggestion.category || '',
              packungsgroessen: fullDetails.packageSizes || suggestion.packageSizes,
              nebenwirkungenGegliedert: fullDetails.sideEffectsByFrequency || suggestion.sideEffectsByFrequency,
              nebenwirkungen: fullDetails.sideEffects || [],
              wechselwirkungen: fullDetails.interactions || [],
              kontraindikationen: fullDetails.contraindications || suggestion.contraindications,
              risiken: fullDetails.warnings || '',
              monographText: fullDetails.monographText || suggestion.monographText,
              datenbankQuelle: fullDetails.fromDatabase ? 'datenbank' : 'behoerden_recherche',
              authoritySource: fullDetails.authoritySource,
            });
          }
        })
        .catch(() => {
          // Lautlos ignorieren, keine Fehlermeldung aufdrängen
        });
    }
  };

  // Find matching suggestion from DB if valid name exists
  const hasValidName = Boolean(med.name && med.name.trim().length > 0);
  const currentDbMatch = hasValidName
    ? (selectedSuggestion || COMMON_MEDICATIONS_DB.find(
        m => m.name.toLowerCase() === (med.name || '').trim().toLowerCase()
      ))
    : null;

  const activeSubstance = hasValidName ? (med.wirkstoff || currentDbMatch?.activeSubstance) : undefined;
  const category = hasValidName ? (med.kategorie || currentDbMatch?.category) : undefined;
  const packageSizes = hasValidName ? (med.packungsgroessen || currentDbMatch?.packageSizes) : undefined;
  const sideEffectsByFreq = hasValidName ? (med.nebenwirkungenGegliedert || currentDbMatch?.sideEffectsByFrequency) : undefined;
  const sideEffects = hasValidName ? (med.nebenwirkungen || currentDbMatch?.sideEffects || []) : [];
  const interactions = hasValidName ? (med.wechselwirkungen || currentDbMatch?.interactions || []) : [];
  const warnings = hasValidName ? (med.risiken || currentDbMatch?.warnings) : undefined;
  const isFromDatabase = med.datenbankQuelle === 'datenbank' || currentDbMatch?.fromDatabase;
  const isAuthorityResearched = med.datenbankQuelle === 'behoerden_recherche' || (!isFromDatabase && (hasValidName && Boolean(activeSubstance || sideEffects.length > 0)));

  const computedMonograph = med.monographText || currentDbMatch?.monographText || (hasValidName ? formatMedicationMonograph(currentDbMatch || {
    name: med.name,
    activeSubstance,
    category,
    dosages: med.dosierung ? [med.dosierung] : undefined,
    packageSizes,
    recommendedIntake: med.einnahmeart,
    sideEffectsByFrequency: sideEffectsByFreq,
    sideEffects,
    interactions,
    contraindications: med.kontraindikationen,
    warnings
  }, language) : '');

  // Localize structured fields for "Vista compatta" / "Kompaktansicht"
  const localizedStructured = React.useMemo(() => {
    return localizeStructuredMedication({
      name: med.name,
      activeSubstance,
      category,
      packageSizes,
      sideEffectsByFrequency: sideEffectsByFreq,
      sideEffects,
      interactions,
      warnings,
      contraindications: med.kontraindikationen || currentDbMatch?.contraindications,
      monographText: computedMonograph
    }, language);
  }, [
    med.name,
    activeSubstance,
    category,
    packageSizes,
    sideEffectsByFreq,
    sideEffects,
    interactions,
    warnings,
    med.kontraindikationen,
    currentDbMatch,
    computedMonograph,
    language
  ]);

  const displayedActiveSubstance = localizedStructured.activeSubstance || activeSubstance;
  const displayedCategory = localizedStructured.category || category;
  const displayedPackageSizes = localizedStructured.packageSizes || packageSizes;
  const displayedSideEffectsByFreq = localizedStructured.sideEffectsByFrequency || sideEffectsByFreq;
  const displayedSideEffects = localizedStructured.sideEffects || sideEffects;
  const displayedInteractions = localizedStructured.interactions || interactions;
  const displayedWarnings = localizedStructured.warnings || warnings;

  const hasResearchData = hasValidName && Boolean(
    computedMonograph ||
    activeSubstance || 
    (packageSizes && packageSizes.length > 0) ||
    sideEffectsByFreq ||
    (sideEffects && sideEffects.length > 0) || 
    (interactions && interactions.length > 0) || 
    warnings
  );

  const isSaved = med.isSaved !== undefined ? med.isSaved : Boolean(med.name?.trim());
  const isComplete = Boolean(med.name?.trim() && med.dosierung?.trim() && med.einnahmeart?.trim());

  const handleSaveThisMedication = () => {
    const savedMed: MedicationData = {
      ...med,
      isSaved: true
    };
    if (onSaveItem) {
      onSaveItem(savedMed);
    } else {
      onChange(savedMed);
    }
  };

  const inputBorderClasses = !isSaved
    ? "border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
    : "border-slate-300 focus:ring-teal-500/20 focus:border-teal-600 bg-white";

  return (
    <div
      className={`p-4 rounded-2xl border-2 space-y-3.5 relative group transition-all duration-200 ${
        !isSaved
          ? "bg-emerald-50/50 border-emerald-400/90 shadow-sm"
          : "bg-white border-slate-200 shadow-2xs hover:border-teal-300"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold font-mono transition-colors ${
              !isSaved
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {index + 1}
          </span>
          <span className="text-xs font-bold text-slate-800">
            {t('medication' as TranslationKey) || 'Medikament'}
          </span>

          {!isSaved ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-900 border border-emerald-300 shadow-2xs">
              <Pencil className="w-2.5 h-2.5 text-emerald-700" />
              <span>{t('medStatusInEditing' as TranslationKey) || 'Wird bearbeitet / Neu'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700 border border-slate-200 shadow-2xs">
              <Check className="w-2.5 h-2.5 text-emerald-600" />
              <span>{t('medStatusSaved' as TranslationKey) || 'Gespeichert'}</span>
            </span>
          )}

          {isAuthorityResearched && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[10px] font-semibold text-blue-700 border border-blue-200/80 shadow-2xs">
              <CheckCircle2 className="w-2.5 h-2.5 text-blue-600" />
              <span>{t('medStepAuthoritySearch' as TranslationKey) || 'Behörden-Recherche'}</span>
            </span>
          )}
        </div>
        <button
          type="button"
          id={`btn-delete-medication-${index}`}
          onClick={onRemove}
          title={t('deleteMedication' as TranslationKey) || 'Medikament löschen'}
          className="flex items-center gap-1 text-slate-400 hover:text-rose-600 text-xs font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t('deleteMedication' as TranslationKey) || 'Medikament löschen'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
        {/* Name with Live Search */}
        <div className="sm:col-span-5 relative" ref={containerRef}>
          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center justify-between">
            <span>{t('medication' as TranslationKey) || 'Medikament'}</span>
            {isSearching && (
              <span className="text-[10px] font-normal text-teal-600 flex items-center gap-1 lowercase">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                <span>online...</span>
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={t('medLiveSearchPlaceholder' as TranslationKey) || "z.B. Ibuprofen, Paracetamol..."}
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (query.trim().length >= 1) {
                  executeSearch(query);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (query.trim().length >= 1) {
                    executeSearch(query, true);
                  }
                }
              }}
              className={`w-full pl-8 pr-12 py-2 border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition-shadow ${inputBorderClasses}`}
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query.trim().length > 0 && (
                <button
                  type="button"
                  id={`btn-clear-med-query-${index}`}
                  onClick={() => handleInputChange('')}
                  title={t('clearBtn' as TranslationKey) || 'Eingabe löschen'}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-teal-600 animate-spin" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-slate-300" />
              )}
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {isOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-lg border border-slate-200 shadow-xl max-h-64 overflow-y-auto py-1 animate-in fade-in-50 duration-100 divide-y divide-slate-100">
              <div className="px-3 py-1 bg-teal-50/70 border-b border-teal-100 flex items-center justify-between text-[10px] text-teal-800 font-semibold">
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-teal-600" />
                  <span>{t('medStepDbMatch' as TranslationKey) || 'Praxis-Datenbank & Fachinformation'}</span>
                </span>
                <span>{suggestions.length} {t('recommendationsCountBadge' as TranslationKey) || 'Treffer'}</span>
              </div>
              {suggestions.map((s, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => handleSelectMedication(s)}
                  className="w-full text-left px-3 py-2 hover:bg-teal-50/80 transition-colors flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900">{s.name}</span>
                      {s.fromDatabase ? (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold">
                          DB
                        </span>
                      ) : (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold">
                          Live
                        </span>
                      )}
                    </div>
                    {s.activeSubstance && s.activeSubstance !== s.name && (
                      <span className="text-[10px] text-slate-500 block">
                        {t('medActiveSubstance' as TranslationKey) || 'Wirkstoff'}: {s.activeSubstance}
                      </span>
                    )}
                    {s.category && (
                      <span className="text-[10px] text-teal-700 block font-medium">{s.category}</span>
                    )}
                  </div>
                  {s.defaultDosages && s.defaultDosages.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold shrink-0">
                      {s.defaultDosages[0]}
                    </span>
                  )}
                </button>
              ))}

              {/* Explicit Live Search Button in dropdown */}
              {query.trim().length >= 2 && (
                <button
                  type="button"
                  id={`btn-force-live-search-${index}`}
                  onClick={() => executeSearch(query, true)}
                  disabled={isSearching}
                  className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-teal-50 transition-colors flex items-center justify-between text-xs text-teal-800 font-medium cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {isSearching ? (
                      <Loader2 className="w-3.5 h-3.5 text-teal-600 animate-spin shrink-0" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    )}
                    <span className="truncate">
                      {isSearching
                        ? (t('medSearchingLive' as TranslationKey) || 'Recherchiere Fachinformationen live...')
                        : (t('medForceLiveSearch' as TranslationKey) || 'Im Internet & Fachinformation recherchieren')}: <span className="font-bold text-slate-900">"{query}"</span>
                    </span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold shrink-0 ml-2">
                    LIVE
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Empty state with Live Research Option */}
          {isOpen && suggestions.length === 0 && query.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-lg border border-slate-200 shadow-xl p-3 animate-in fade-in-50 duration-100 space-y-2">
              {isSearching ? (
                <div className="flex items-center gap-2 text-xs text-teal-800 font-medium">
                  <Loader2 className="w-4 h-4 text-teal-600 animate-spin shrink-0" />
                  <span>{t('medSearchingLive' as TranslationKey) || 'Recherchiere behördliche Fachinformationen live...'}</span>
                </div>
              ) : (
                <>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('noResultsFound' as TranslationKey) || 'Nicht in der Praxis-Datenbank gefunden.'}</span>
                  </div>
                  <button
                    type="button"
                    id={`btn-empty-live-search-${index}`}
                    onClick={() => executeSearch(query, true)}
                    className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-md transition-colors flex items-center justify-between text-xs border border-blue-200 cursor-pointer font-medium"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">
                        {t('medForceLiveSearch' as TranslationKey) || 'Im Internet & Fachinformation recherchieren'}: <strong>"{query}"</strong>
                      </span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold shrink-0 ml-2">
                      LIVE
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Dosage with quick dosage selection badges */}
        <div className="sm:col-span-3">
          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
            {t('dosage' as TranslationKey) || 'Dosierung'}
          </label>
          <input
            type="text"
            placeholder={t('medDosagePlaceholder' as TranslationKey) || "z.B. 400 mg"}
            value={med.dosierung || ''}
            onChange={(e) => onChange({ ...med, dosierung: e.target.value, isSaved: false })}
            className={`w-full px-3 py-2 border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition-shadow ${inputBorderClasses}`}
          />

          {/* Quick Dosage Badges */}
          {(() => {
            const dosagesToShow = (selectedSuggestion?.defaultDosages && selectedSuggestion.defaultDosages.length > 0)
              ? selectedSuggestion.defaultDosages
              : (selectedSuggestion?.dosages && selectedSuggestion.dosages.length > 0)
              ? selectedSuggestion.dosages
              : (currentDbMatch?.defaultDosages && currentDbMatch.defaultDosages.length > 0)
              ? currentDbMatch.defaultDosages
              : (currentDbMatch?.dosages || []);
            if (!dosagesToShow || dosagesToShow.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {dosagesToShow.map((d, dIdx) => (
                  <button
                    key={dIdx}
                    type="button"
                    onClick={() => onChange({ ...med, dosierung: d, isSaved: false })}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                      med.dosierung === d
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Intake Method */}
        <div className="sm:col-span-4">
          {(() => {
            const timesDailyLabel = t('medFreqTimesDaily' as TranslationKey) || 'täglich';
            const cleanUnit = timesDailyLabel.replace(/^[xX×\s]+/i, '').trim();
            const numMatch = (med.einnahmeart || '').match(/^(\d+)/);
            const curCount = numMatch ? parseInt(numMatch[1], 10) : 1;

            const formatFrequency = (count: number) => {
              if (language === 'ru') {
                const word = count === 1 ? 'раз в день' : (count >= 2 && count <= 4 ? 'раза в день' : 'раз в день');
                return `${count} ${word}`;
              }
              if (language === 'de') {
                return `${count} x ${cleanUnit || 'täglich'}`;
              }
              return `${count}x ${cleanUnit || 'daily'}`;
            };

            const isDailySelected = Boolean(
              med.einnahmeart && (
                numMatch ||
                med.einnahmeart.includes('ημερησίως') ||
                med.einnahmeart.includes('täglich') ||
                med.einnahmeart.includes('daily') ||
                med.einnahmeart.includes('jour') ||
                med.einnahmeart.includes('giorno') ||
                med.einnahmeart.includes('día') ||
                med.einnahmeart.includes('день')
              )
            );

            const asNeededLabel = t('medFreqAsNeeded' as TranslationKey) || 'Bei Bedarf';
            const isAsNeededSelected = med.einnahmeart === asNeededLabel;

            return (
              <>
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase">
                    {t('intake' as TranslationKey) || 'Einnahmeart / Häufigkeit'}
                  </label>

                  {/* Frequenz-Schnellwahl & Bei Bedarf nach oben verschoben, dezente neutrale Farbgebung passend zu den Feldern (nicht grün) */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <div
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[11px] transition-colors ${
                        isDailySelected
                          ? 'bg-slate-100 border-slate-400 text-slate-900 shadow-2xs font-semibold'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="inline-flex items-center rounded border border-slate-300 bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => {
                            const next = Math.max(1, curCount - 1);
                            onChange({ ...med, einnahmeart: formatFrequency(next), isSaved: false });
                          }}
                          className="px-1.5 py-0.5 hover:bg-slate-100 text-slate-700 font-bold border-r border-slate-200 cursor-pointer select-none text-[11px] transition-colors"
                          title="-"
                        >
                          -
                        </button>
                        <span className="px-1.5 py-0.5 font-bold text-slate-800 min-w-[18px] text-center select-none text-[11px]">
                          {numMatch ? numMatch[1] : '1'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = numMatch ? Math.min(12, curCount + 1) : 2;
                            onChange({ ...med, einnahmeart: formatFrequency(next), isSaved: false });
                          }}
                          className="px-1.5 py-0.5 hover:bg-slate-100 text-slate-700 font-bold border-l border-slate-200 cursor-pointer select-none text-[11px] transition-colors"
                          title="+"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onChange({ ...med, einnahmeart: formatFrequency(curCount), isSaved: false });
                        }}
                        className="font-medium text-slate-700 hover:text-slate-900 cursor-pointer text-[11px] select-none px-0.5"
                      >
                        {cleanUnit || timesDailyLabel}
                      </button>
                    </div>

                    {/* Bei Bedarf */}
                    <button
                      type="button"
                      onClick={() => onChange({ ...med, einnahmeart: asNeededLabel, isSaved: false })}
                      className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer border ${
                        isAsNeededSelected
                          ? 'bg-slate-100 text-slate-900 border-slate-400 font-semibold shadow-2xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      {asNeededLabel}
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder={t('medIntakePlaceholder' as TranslationKey) || "z.B. 1-2x täglich, bei Bedarf"}
                  value={med.einnahmeart || ''}
                  onChange={(e) => onChange({ ...med, einnahmeart: e.target.value, isSaved: false })}
                  className={`w-full px-3 py-2 border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition-shadow ${inputBorderClasses}`}
                />
              </>
            );
          })()}
        </div>
      </div>

      {/* Save Button & Status Row when !isSaved */}
      {!isSaved && (
        <div className="pt-2.5 border-t border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          {isComplete ? (
            <>
              <div className="flex items-center gap-2 text-xs text-emerald-950 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('allFieldsFilledReadyToSave' as TranslationKey) || 'Alle Felder ausgefüllt – bereit zum Speichern'}</span>
              </div>
              <button
                type="button"
                id={`btn-save-medication-${index}`}
                onClick={handleSaveThisMedication}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>{t('saveMedicationEntry' as TranslationKey) || 'Medikament speichern'}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-[11px] text-emerald-900/80 font-medium">
              <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{t('fillAllFieldsToSave' as TranslationKey) || 'Bitte Medikament, Dosierung und Einnahmeart ausfüllen zum Speichern'}</span>
            </div>
          )}
        </div>
      )}

      {/* Internet Research Toggle & Profile Bar (only shown when showResearchDetails=true, hidden in quick entry popup) */}
      {showResearchDetails && (hasResearchData || (hasValidName && med.name)) && (
        <div className="pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsDetailsExpanded(prev => !prev)}
            className="w-full flex items-center justify-between text-left py-1.5 px-2.5 rounded-lg bg-teal-50/50 hover:bg-teal-50 border border-teal-100/80 text-teal-900 text-xs font-semibold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>
                {isDetailsExpanded 
                  ? (t('medHideDetails' as TranslationKey) || 'Recherche einklappen')
                  : (t('medViewDetails' as TranslationKey) || 'Internet-Recherche anzeigen (Wirkstoff, Neben- & Wechselwirkungen)')
                }
              </span>
            </div>
            {isDetailsExpanded ? (
              <ChevronUp className="w-4 h-4 text-teal-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-teal-600" />
            )}
          </button>

          {/* Expanded Research Details */}
          {isDetailsExpanded && (
            <div className="mt-2.5 space-y-2.5 animate-in fade-in duration-150">
              {/* View Switcher: Fließtext-Monographie (default) vs Kompaktansicht */}
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('fluid')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      viewMode === 'fluid'
                        ? 'bg-white text-teal-900 shadow-2xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('medViewModeFluid' as TranslationKey) || 'Fließtext-Monographie'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('structured')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      viewMode === 'structured'
                        ? 'bg-white text-teal-900 shadow-2xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('medViewModeStructured' as TranslationKey) || 'Kompaktansicht'}
                  </button>
                </div>
              </div>

              {viewMode === 'fluid' && computedMonograph ? (
                <MedicationMonographView
                  monographText={computedMonograph}
                  medName={med.name}
                  activeSubstance={activeSubstance}
                  authoritySource={med.authoritySource || currentDbMatch?.authoritySource}
                  t={t}
                />
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-teal-200/70 space-y-3">
                  {/* Active Substance & Category Header */}
                  {(displayedActiveSubstance || displayedCategory) && (
                    <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200/70">
                      {displayedActiveSubstance && (
                        <span className="text-xs text-slate-700">
                          <strong className="text-slate-900 font-bold">{t('medActiveSubstance' as TranslationKey) || 'Wirkstoff'}:</strong> {displayedActiveSubstance}
                        </span>
                      )}
                      {displayedCategory && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-semibold">
                          {displayedCategory}
                        </span>
                      )}
                      {isFromDatabase ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                          <Database className="w-3 h-3 text-emerald-600" />
                          <span>{t('medStepDbMatch' as TranslationKey) || 'Praxis-DB'}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          <span>{t('medSourceSavedToDb' as TranslationKey) || 'In Praxisdatenbank gesichert'}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Package sizes */}
                  {displayedPackageSizes && displayedPackageSizes.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <PackageCheck className="w-3.5 h-3.5 text-teal-600" />
                        <span>{t('medPackageSizes' as TranslationKey) || 'Verfügbare Packungsgrößen'}:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {displayedPackageSizes.map((pkg, pIdx) => (
                          <span key={pIdx} className="text-xs px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-medium shadow-2xs">
                            {pkg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Graded Side Effects by Frequency */}
                  {displayedSideEffectsByFreq && Object.values(displayedSideEffectsByFreq).some(arr => Array.isArray(arr) && arr.length > 0) ? (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t('medSideEffectsByFrequency' as TranslationKey) || 'Nebenwirkungen nach Häufigkeit (Fachinformation)'}:</span>
                      </div>
                      
                      <div className="space-y-1.5 text-xs pl-1">
                        {displayedSideEffectsByFreq.veryCommon && displayedSideEffectsByFreq.veryCommon.length > 0 && (
                          <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-200/60">
                            <span className="font-bold text-rose-900 block mb-0.5 text-[11px]">{t('medFreqVeryCommon' as TranslationKey) || 'Sehr häufig (≥ 1/10)'}:</span>
                            <p className="text-slate-700 leading-relaxed">{displayedSideEffectsByFreq.veryCommon.join(', ')}</p>
                          </div>
                        )}
                        {displayedSideEffectsByFreq.common && displayedSideEffectsByFreq.common.length > 0 && (
                          <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/60">
                            <span className="font-bold text-amber-900 block mb-0.5 text-[11px]">{t('medFreqCommon' as TranslationKey) || 'Häufig (≥ 1/100 bis < 1/10)'}:</span>
                            <p className="text-slate-700 leading-relaxed">{displayedSideEffectsByFreq.common.join(', ')}</p>
                          </div>
                        )}
                        {displayedSideEffectsByFreq.uncommon && displayedSideEffectsByFreq.uncommon.length > 0 && (
                          <div className="p-2 rounded-lg bg-yellow-50/70 border border-yellow-200/60">
                            <span className="font-bold text-yellow-900 block mb-0.5 text-[11px]">{t('medFreqUncommon' as TranslationKey) || 'Gelegentlich (≥ 1/1.000 bis < 1/100)'}:</span>
                            <p className="text-slate-700 leading-relaxed">{displayedSideEffectsByFreq.uncommon.join(', ')}</p>
                          </div>
                        )}
                        {displayedSideEffectsByFreq.rare && displayedSideEffectsByFreq.rare.length > 0 && (
                          <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-200/60">
                            <span className="font-bold text-blue-900 block mb-0.5 text-[11px]">{t('medFreqRare' as TranslationKey) || 'Selten (≥ 1/10.000 bis < 1/1.000)'}:</span>
                            <p className="text-slate-700 leading-relaxed">{displayedSideEffectsByFreq.rare.join(', ')}</p>
                          </div>
                        )}
                        {displayedSideEffectsByFreq.veryRare && displayedSideEffectsByFreq.veryRare.length > 0 && (
                          <div className="p-2 rounded-lg bg-purple-50/70 border border-purple-200/60">
                            <span className="font-bold text-purple-900 block mb-0.5 text-[11px]">{t('medFreqVeryRare' as TranslationKey) || 'Sehr selten (< 1/10.000)'}:</span>
                            <p className="text-slate-700 leading-relaxed">{displayedSideEffectsByFreq.veryRare.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Fallback Side Effects */
                    displayedSideEffects && displayedSideEffects.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>{t('medSideEffects' as TranslationKey) || 'Bekannte Nebenwirkungen'}:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-700 pl-1">
                          {displayedSideEffects.map((effect, effIdx) => (
                            <li key={effIdx} className="leading-relaxed">{effect}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}

                  {/* Interactions */}
                  {displayedInteractions && displayedInteractions.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>{t('medInteractions' as TranslationKey) || 'Relevante Wechselwirkungen (Interaktionen)'}:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-700 pl-1">
                        {displayedInteractions.map((inter, intIdx) => (
                          <li key={intIdx} className="leading-relaxed">{inter}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings & Contraindications */}
                  {displayedWarnings && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/80 text-xs text-rose-900 leading-relaxed">
                      <span className="font-bold block mb-0.5">{t('medWarnings' as TranslationKey) || 'Wichtige Warnhinweise & Kontraindikationen'}:</span>
                      {displayedWarnings}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

