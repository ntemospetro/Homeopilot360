import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  PatientCase,
  FullClinicalAnalysis,
  TherapyRecommendations,
  TherapyRemedyItem
} from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import {
  searchHomeopathicRemedies,
  HomeopathicRemedyInfo,
  COMMON_HOMEO_REMEDIES_DB
} from '../services/homeopathyDatabase';
import {
  getLocalizedPresetValue,
  localizeTherapyRecommendations,
} from '../utils/remedyLocalization';
import {
  getLocalizedRemedies,
  LocalizedRemedy
} from '../data/materiaMedicaData';
import {
  RemedyMonographModal,
  resolveDifferentialRemedy
} from './RemedyMonographModal';
import {
  AlertTriangle,
  CheckCircle2,
  Pill,
  Plus,
  Trash2,
  Search,
  Check,
  Stethoscope,
  BookOpen,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface TherapyRecommendationsViewProps {
  patientCase: PatientCase;
  analysis: FullClinicalAnalysis;
  onUpdateCase: (updatedFields: Partial<PatientCase>) => void;
  onSaveCase?: () => void;
  onPreviousStep?: () => void;
}

function getNextStepValue(currentVal: string, presets: string[], direction: 1 | -1): string {
  if (!presets || presets.length === 0) return currentVal || '';
  
  const trimmed = (currentVal || '').trim().toLowerCase();
  const currentIndex = presets.findIndex(p => p.trim().toLowerCase() === trimmed);
  
  if (currentIndex !== -1) {
    let nextIdx = currentIndex + direction;
    if (nextIdx >= presets.length) nextIdx = 0;
    if (nextIdx < 0) nextIdx = presets.length - 1;
    return presets[nextIdx];
  }

  // If user entered custom text with a number (e.g. "4 Tage" or "2 Gaben" or "5"):
  const matchNum = (currentVal || '').match(/(\d+)/);
  if (matchNum) {
    const num = parseInt(matchNum[1], 10);
    const newNum = Math.max(1, num + direction);
    return currentVal.replace(/\d+/, String(newNum));
  }

  return direction === 1 ? presets[0] : presets[presets.length - 1];
}

interface StepperInputProps {
  value: string;
  onChange: (val: string) => void;
  presets: string[];
  placeholder?: string;
  className?: string;
}

const StepperInput: React.FC<StepperInputProps> = ({
  value,
  onChange,
  presets,
  placeholder,
  className = '',
}) => {
  const handleStep = (direction: 1 | -1) => {
    const nextVal = getNextStepValue(value, presets, direction);
    onChange(nextVal);
  };

  return (
    <div className="relative flex items-center w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-3 pr-7 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 shadow-2xs ${className}`}
      />
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={() => handleStep(1)}
          className="p-0.5 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          title="▲"
          tabIndex={-1}
        >
          <ChevronUp className="w-3 h-3 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onClick={() => handleStep(-1)}
          className="p-0.5 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          title="▼"
          tabIndex={-1}
        >
          <ChevronDown className="w-3 h-3 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

export const TherapyRecommendationsView: React.FC<TherapyRecommendationsViewProps> = ({
  patientCase,
  analysis,
  onUpdateCase,
}) => {
  const { t, language } = useTranslation();

  // Presets for the 4 Intake Schedule Fields
  const tagesdosisPresets = useMemo(() => [
    t('dosePreset1'),
    t('dosePreset2'),
    t('dosePreset3'),
    t('dosePreset4'),
  ], [t]);

  const haeufigkeitPresets = useMemo(() => [
    t('freqPreset1'),
    t('freqPreset2'),
    t('freqPreset3'),
    t('freqPreset4'),
    t('freqPreset5'),
  ], [t]);

  const dauerPresets = useMemo(() => [
    t('durPreset1'),
    t('durPreset2'),
    t('durPreset3'),
    t('durPreset4'),
    t('durPreset5'),
  ], [t]);

  const zeitraumPresets = useMemo(() => [
    t('phasePreset1'),
    t('phasePreset2'),
    t('phasePreset3'),
    t('phasePreset4'),
    t('phasePreset5'),
  ], [t]);

  // Determine initial doctor recommendation from red flags
  const redFlagList = analysis.redFlags?.warnings || [];
  const redFlagsCount = redFlagList.filter(r => r.severity === 'AKUT' || r.severity === 'WARNUNG').length;
  const isArztfall = analysis.arztfallEntscheidung?.status === 'Ja';
  const initialDoctorRequired = redFlagsCount > 0 || isArztfall || Boolean(analysis.redFlags?.gesamtbewertung && analysis.redFlags.gesamtbewertung.length > 5);
  
  const initialDoctorUrgency = redFlagsCount > 0 ? 'Dringend' : (initialDoctorRequired ? 'Empfohlen' : 'Keine');
  const initialDoctorReason = redFlagsCount > 0 
    ? (redFlagList.map(r => r.text).join('; ') || t('redFlagsWarningReason'))
    : (analysis.redFlags?.gesamtbewertung || analysis.arztfallEntscheidung?.begruendung || t('noAcuteDoctorReason'));

  // Initialize recommendations state
  const [recommendations, setRecommendations] = useState<TherapyRecommendations>(() => {
    if (patientCase.therapyRecommendations) {
      return localizeTherapyRecommendations(patientCase.therapyRecommendations, t);
    }

    // Build initial remedy list from analysis.homoeopathie.mittel
    const initialRemedies: TherapyRemedyItem[] = (analysis.homoeopathie?.mittel || []).map((m, idx) => ({
      id: `remedy_init_${idx}_${Date.now()}`,
      name: m.name,
      potency: m.potenz || m.dosierungPotenz || 'C30',
      tagesdosis: getLocalizedPresetValue(m.tagesdosis, 'dose', t),
      haeufigkeit: getLocalizedPresetValue(m.haeufigkeit, 'freq', t),
      anwendungsdauer: getLocalizedPresetValue(m.anwendungsdauer, 'dur', t),
      zeitraum: getLocalizedPresetValue(m.zeitraum, 'phase', t),
      therapistNotes: getLocalizedPresetValue(m.einnahmehinweis, 'note', t),
      isSelected: idx === 0, // Select top remedy by default
      isCustom: false,
      score: m.score,
      grade: m.rangBegruendung,
    }));

    return {
      doctorConsultationRequired: initialDoctorRequired,
      doctorConsultationUrgency: initialDoctorUrgency,
      doctorConsultationSpecialty: redFlagsCount > 0 ? t('specialtyGeneralOrSpecialist') : t('specialtyGpOptional'),
      doctorConsultationReason: initialDoctorReason,
      doctorConsultationNotes: initialDoctorRequired
        ? t('doctorNotesWorsening3Days')
        : t('doctorNotesRoutineSufficient'),
      remedies: initialRemedies,
      generalTherapyNotes: t('generalTherapyNoticeDefault'),
      updatedAt: new Date().toISOString(),
    };
  });

  // Live search state for custom remedy addition
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HomeopathicRemedyInfo[]>([]);
  const [, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDbRemedy, setSelectedDbRemedy] = useState<HomeopathicRemedyInfo | null>(null);

  // Remedy Monograph Modal State
  const [selectedRemedyForModal, setSelectedRemedyForModal] = useState<LocalizedRemedy | null>(null);
  const [isMonographModalOpen, setIsMonographModalOpen] = useState(false);

  const localizedRemedies = useMemo(() => getLocalizedRemedies(language), [language]);

  const handleOpenMonograph = (remedyName: string) => {
    const matched = resolveDifferentialRemedy(remedyName, localizedRemedies);
    if (matched) {
      setSelectedRemedyForModal(matched);
    } else {
      setSelectedRemedyForModal({
        id: remedyName.toLowerCase().replace(/\s+/g, '-'),
        latinName: remedyName,
        commonName: remedyName,
        categoryKey: 'other',
        category: t('homeoRemedyLabel'),
        origin: t('secOriginTitle'),
        essence: `${remedyName} (${t('remedyRepositoryBadge')})`,
        mainIndications: [remedyName],
        keynotes: [remedyName],
        mindEmotional: '-',
        modalitiesBetter: [],
        modalitiesWorse: [],
        potenciesAndDosage: 'C30 / D12 / LM VI',
        sphereOfAction: [],
        differentialRemedies: [],
        searchKeywords: [remedyName]
      });
    }
    setIsMonographModalOpen(true);
  };

  const [customPotency, setCustomPotency] = useState('C30');
  const [customTagesdosis, setCustomTagesdosis] = useState(() => t('dosePreset1'));
  const [customHaeufigkeit, setCustomHaeufigkeit] = useState(() => t('freqPreset1'));
  const [customAnwendungsdauer, setCustomAnwendungsdauer] = useState(() => t('durPreset1'));
  const [customZeitraum, setCustomZeitraum] = useState(() => t('phasePreset1'));
  const [customNote, setCustomNote] = useState('');

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync with parent patientCase
  useEffect(() => {
    onUpdateCase({ therapyRecommendations: recommendations });
  }, [recommendations]);

  // Keep defaults and remedy presets updated when language changes
  useEffect(() => {
    setRecommendations(prev => localizeTherapyRecommendations(prev, t));
    setCustomTagesdosis(prev => getLocalizedPresetValue(prev, 'dose', t));
    setCustomHaeufigkeit(prev => getLocalizedPresetValue(prev, 'freq', t));
    setCustomAnwendungsdauer(prev => getLocalizedPresetValue(prev, 'dur', t));
    setCustomZeitraum(prev => getLocalizedPresetValue(prev, 'phase', t));
    setCustomNote(prev => getLocalizedPresetValue(prev, 'note', t));
  }, [language, t]);

  // Auto-populate remedies if empty when analysis is available
  useEffect(() => {
    if (recommendations.remedies.length === 0) {
      const sourceMittel = analysis?.homoeopathie?.mittel || [];
      const sourceSuggestions = patientCase?.remedySuggestions || [];

      if (sourceMittel.length > 0) {
        const loadedRemedies: TherapyRemedyItem[] = sourceMittel.map((m, idx) => ({
          id: `remedy_analysis_${idx}_${Date.now()}`,
          name: m.name,
          potency: m.potenz || m.dosierungPotenz || 'C30',
          tagesdosis: getLocalizedPresetValue(m.tagesdosis, 'dose', t),
          haeufigkeit: getLocalizedPresetValue(m.haeufigkeit, 'freq', t),
          anwendungsdauer: getLocalizedPresetValue(m.anwendungsdauer, 'dur', t),
          zeitraum: getLocalizedPresetValue(m.zeitraum, 'phase', t),
          therapistNotes: m.einnahmehinweis || '',
          isSelected: idx === 0,
          isCustom: false,
          score: m.score,
          grade: m.rangBegruendung,
        }));
        setRecommendations(prev => ({ ...prev, remedies: loadedRemedies }));
      } else if (sourceSuggestions.length > 0) {
        const loadedRemedies: TherapyRemedyItem[] = sourceSuggestions.map((r, idx) => ({
          id: `remedy_sugg_${idx}_${Date.now()}`,
          name: r.name,
          potency: r.potency || 'C30',
          tagesdosis: t('dosePreset1'),
          haeufigkeit: t('freqPreset1'),
          anwendungsdauer: t('durPreset1'),
          zeitraum: t('phasePreset1'),
          therapistNotes: '',
          isSelected: idx === 0,
          isCustom: false,
          score: r.score,
          grade: r.description,
        }));
        setRecommendations(prev => ({ ...prev, remedies: loadedRemedies }));
      }
    }
  }, [analysis?.homoeopathie?.mittel, patientCase?.remedySuggestions, t]);

  // Live search effect
  useEffect(() => {
    let active = true;
    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      searchHomeopathicRemedies(searchQuery).then(res => {
        if (active) {
          setSearchResults(res);
          setIsSearching(false);
        }
      });
    } else {
      setSearchResults(COMMON_HOMEO_REMEDIES_DB.slice(0, 12));
    }
    return () => {
      active = false;
    };
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDbRemedy = (r: HomeopathicRemedyInfo) => {
    setSelectedDbRemedy(r);
    setSearchQuery(r.name);
    setCustomPotency(r.defaultPotencies[0] || 'C30');
    setCustomTagesdosis(getLocalizedPresetValue(r.defaultTagesdosis, 'dose', t));
    setCustomHaeufigkeit(getLocalizedPresetValue(r.defaultHaeufigkeit, 'freq', t));
    setCustomAnwendungsdauer(getLocalizedPresetValue(r.defaultAnwendungsdauer, 'dur', t));
    setCustomZeitraum(getLocalizedPresetValue(r.defaultZeitraum, 'phase', t));
    setCustomNote(getLocalizedPresetValue(r.standardNote, 'note', t));
    setIsDropdownOpen(false);
  };

  const handleAddCustomRemedy = () => {
    if (!searchQuery.trim()) return;

    const newRemedy: TherapyRemedyItem = {
      id: `remedy_custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: selectedDbRemedy ? selectedDbRemedy.name : searchQuery.trim(),
      potency: customPotency.trim() || 'C30',
      tagesdosis: customTagesdosis.trim() || t('dosePreset1'),
      haeufigkeit: customHaeufigkeit.trim() || t('freqPreset1'),
      anwendungsdauer: customAnwendungsdauer.trim() || t('durPreset1'),
      zeitraum: customZeitraum.trim() || t('phasePreset1'),
      therapistNotes: customNote.trim(),
      isSelected: true,
      isCustom: true,
    };

    setRecommendations(prev => ({
      ...prev,
      remedies: [...prev.remedies, newRemedy],
      updatedAt: new Date().toISOString(),
    }));

    // Reset input fields
    setSearchQuery('');
    setSelectedDbRemedy(null);
    setCustomPotency('C30');
    setCustomTagesdosis(t('dosePreset1'));
    setCustomHaeufigkeit(t('freqPreset1'));
    setCustomAnwendungsdauer(t('durPreset1'));
    setCustomZeitraum(t('phasePreset1'));
    setCustomNote('');
    setIsDropdownOpen(false);
  };

  const handleUpdateRemedy = (id: string, updates: Partial<TherapyRemedyItem>) => {
    setRecommendations(prev => ({
      ...prev,
      remedies: prev.remedies.map(r => (r.id === id ? { ...r, ...updates } : r)),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleRemoveRemedy = (id: string) => {
    setRecommendations(prev => ({
      ...prev,
      remedies: prev.remedies.filter(r => r.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* SECTION 1: ÄRZTLICHE ABKLÄRUNG (RED FLAGS & WARNHINWEISE) */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('doctorConsultationTitle')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('doctorConsultationSubtitle')}
              </p>
            </div>
          </div>

          <label className="text-xs font-semibold text-slate-600 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={recommendations.doctorConsultationRequired}
              onChange={(e) => setRecommendations(prev => ({
                ...prev,
                doctorConsultationRequired: e.target.checked,
                doctorConsultationUrgency: e.target.checked
                  ? (prev.doctorConsultationUrgency === 'Keine' ? 'Empfohlen' : prev.doctorConsultationUrgency)
                  : 'Keine'
              }))}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
            />
            <span>{t('doctorConsultationRecommended')}</span>
          </label>
        </div>

        {/* Status Box */}
        <div className={`p-4 rounded-xl border ${
          recommendations.doctorConsultationRequired 
            ? 'bg-rose-50/60 border-rose-200 text-rose-950' 
            : 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
        }`}>
          <div className="flex items-center gap-2 font-bold text-sm">
            {recommendations.doctorConsultationRequired ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span className="text-slate-900 font-bold">
              {recommendations.doctorConsultationRequired ? t('doctorConsultationRecommended') : t('doctorConsultationNone')}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
              {recommendations.doctorConsultationUrgency === 'Notfall' ? t('urgencyEmergency') :
               recommendations.doctorConsultationUrgency === 'Dringend' ? t('urgencyUrgent') :
               recommendations.doctorConsultationUrgency === 'Empfohlen' ? t('urgencyRecommended') :
               recommendations.doctorConsultationUrgency === 'Optional' ? t('urgencyOptional') :
               t('urgencyNone')}
            </span>
          </div>
          <p className="text-slate-700 text-xs mt-1.5 pl-7">
            <strong>{t('doctorConsultationReasonLabel')}</strong>{' '}
            {recommendations.doctorConsultationReason || t('noCriticalRedFlags')}
          </p>
        </div>

        {/* Doctor Notes / Individual Advice */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            {t('doctorNotesLabel')}
          </label>
          <textarea
            rows={2}
            value={recommendations.doctorConsultationNotes}
            onChange={(e) => setRecommendations(prev => ({ ...prev, doctorConsultationNotes: e.target.value }))}
            placeholder={t('doctorNotesPlaceholder')}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-2xs resize-y"
          />
        </div>
      </section>

      {/* SECTION 2: HOMÖOPATHISCHE MITTEL-EMPFEHLUNGEN & VERORDNUNGSPLAN */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('homeoPrescriptionTitle')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('homeoPrescriptionDesc')}
              </p>
            </div>
          </div>

          <span className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            {t('remediesSelectedCount', {
              count: recommendations.remedies.filter(r => r.isSelected).length,
              selected: recommendations.remedies.filter(r => r.isSelected).length,
              total: recommendations.remedies.length
            })}
          </span>
        </div>

        {/* List of Remedy Cards */}
        <div className="space-y-4">
          {recommendations.remedies.map((remedy, idx) => (
            <div
              key={remedy.id}
              className="p-4 sm:p-5 rounded-2xl border border-teal-400/90 bg-white shadow-xs space-y-3.5"
            >
              {/* Remedy Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleUpdateRemedy(remedy.id, { isSelected: !remedy.isSelected })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      remedy.isSelected
                        ? 'bg-[#00897b] hover:bg-[#00796b] text-white shadow-2xs'
                        : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {remedy.isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    <span>{remedy.isSelected ? t('remedySelected') : t('remedyNotSelected')}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 text-base">
                      {remedy.name}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {remedy.isCustom ? (
                    <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-medium border border-teal-200/80">
                      {t('manuallyAdded')}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-medium border border-teal-200/80">
                      {t('suggestedFromAnalysis')}{remedy.score ? ` (${remedy.score}% ${t('scoreMatch')})` : ''}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenMonograph(remedy.name)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-teal-800 bg-white hover:bg-teal-50 border border-teal-300 transition-all cursor-pointer"
                    title={t('viewMonograph')}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{t('viewMonograph')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveRemedy(remedy.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
                    title={t('removeRemedyTitle')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Potency Row */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <label className="font-bold text-slate-700 shrink-0">
                  {t('potencyLabel')}
                </label>
                <input
                  type="text"
                  value={remedy.potency}
                  onChange={(e) => handleUpdateRemedy(remedy.id, { potency: e.target.value })}
                  placeholder="C30"
                  className="w-20 px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-1 focus:ring-teal-500 text-xs"
                />
                <div className="flex flex-wrap gap-1">
                  {['C30', 'C200', 'LM VI', 'D12', 'D6', '1M', 'Q-Potenz'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleUpdateRemedy(remedy.id, { potency: p })}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer ${
                        remedy.potency === p
                          ? 'bg-[#00897b] text-white border-[#00796b]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Required Intake Schedule Fields with Stepper Arrows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* 1. Empfohlene Dosis am Tag */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">
                    {t('dosagePerDayLabel')}
                  </label>
                  <StepperInput
                    value={remedy.tagesdosis}
                    onChange={(val) => handleUpdateRemedy(remedy.id, { tagesdosis: val })}
                    presets={tagesdosisPresets}
                    placeholder={t('dosagePerDayPlaceholder')}
                  />
                </div>

                {/* 2. Wie oft (Häufigkeit) */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">
                    {t('frequencyLabel')}
                  </label>
                  <StepperInput
                    value={remedy.haeufigkeit}
                    onChange={(val) => handleUpdateRemedy(remedy.id, { haeufigkeit: val })}
                    presets={haeufigkeitPresets}
                    placeholder={t('frequencyPlaceholder')}
                  />
                </div>

                {/* 3. Wie lange (Dauer) */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">
                    {t('durationLabel')}
                  </label>
                  <StepperInput
                    value={remedy.anwendungsdauer}
                    onChange={(val) => handleUpdateRemedy(remedy.id, { anwendungsdauer: val })}
                    presets={dauerPresets}
                    placeholder={t('durationPlaceholder')}
                  />
                </div>

                {/* 4. Zeitraum / Anwendungsphase */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">
                    {t('applicationPhaseLabel')}
                  </label>
                  <StepperInput
                    value={remedy.zeitraum}
                    onChange={(val) => handleUpdateRemedy(remedy.id, { zeitraum: val })}
                    presets={zeitraumPresets}
                    placeholder={t('applicationPhasePlaceholder')}
                  />
                </div>
              </div>

              {/* Therapist Note / Specific Einnahmehinweis */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700 block text-[11px]">
                  {t('therapistNoteLabel')}
                </label>
                <input
                  type="text"
                  value={remedy.therapistNotes || ''}
                  onChange={(e) => handleUpdateRemedy(remedy.id, { therapistNotes: e.target.value })}
                  placeholder={t('therapistNotePlaceholder')}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 3: WEITERES MITTEL SELBST EMPFEHLEN (LIVE-SEARCH & + HINZUFÜGEN) */}
        <div className="p-5 rounded-2xl bg-white border-2 border-dashed border-teal-300/90 space-y-3">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-teal-900 text-sm">
              {t('addCustomRemedyBtn')}
            </h4>
          </div>

          {/* Live Search Input & Autocomplete Dropdown */}
          <div className="relative" ref={searchContainerRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomRemedy();
                  }
                }}
                placeholder={t('searchRemedyPlaceholder')}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDbRemedy(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl divide-y divide-slate-100 text-xs">
                {searchResults.length > 0 ? (
                  searchResults.map((r, rIdx) => (
                    <div
                      key={rIdx}
                      onClick={() => handleSelectDbRemedy(r)}
                      className="p-3 hover:bg-teal-50/80 cursor-pointer transition-colors flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                          <span>{r.name}</span>
                          {r.category && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                              {r.category}
                            </span>
                          )}
                        </div>
                        {Array.isArray(r.keyIndications) && r.keyIndications.length > 0 && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {t('keyIndicationsPrefix')}: {r.keyIndications.join(' • ')}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {r.defaultPotencies[0]}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    {t('noRemedyFoundInDb')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Config Fields for Custom Remedy with Stepper Arrows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('potencyLabel')}</label>
              <input
                type="text"
                value={customPotency}
                onChange={(e) => setCustomPotency(e.target.value)}
                placeholder="C30"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('dosagePerDayLabel')}</label>
              <StepperInput
                value={customTagesdosis}
                onChange={setCustomTagesdosis}
                presets={tagesdosisPresets}
                placeholder={t('dosagePerDayPlaceholder')}
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('frequencyLabel')}</label>
              <StepperInput
                value={customHaeufigkeit}
                onChange={setCustomHaeufigkeit}
                presets={haeufigkeitPresets}
                placeholder={t('frequencyPlaceholder')}
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('durationLabel')}</label>
              <StepperInput
                value={customAnwendungsdauer}
                onChange={setCustomAnwendungsdauer}
                presets={dauerPresets}
                placeholder={t('durationPlaceholder')}
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t('applicationPhaseLabel')}</label>
              <StepperInput
                value={customZeitraum}
                onChange={setCustomZeitraum}
                presets={zeitraumPresets}
                placeholder={t('applicationPhasePlaceholder')}
              />
            </div>
          </div>

          {/* Note field & Add Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder={t('therapistNotePlaceholder')}
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
            />

            <button
              type="button"
              onClick={handleAddCustomRemedy}
              disabled={!searchQuery.trim()}
              className={`px-5 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                searchQuery.trim()
                  ? 'bg-[#00897b] hover:bg-[#00796b] text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{t('addRemedyConfirmBtn')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: ALLGEMEINE HINWEISE & VERORDNUNGSNOTIZEN */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-700" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            {t('generalTherapyNotesLabel')}
          </h3>
        </div>
        <textarea
          rows={3}
          value={recommendations.generalTherapyNotes || ''}
          onChange={(e) => setRecommendations(prev => ({ ...prev, generalTherapyNotes: e.target.value }))}
          placeholder={t('generalTherapyNotesPlaceholder')}
          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-2xs resize-y"
        />
      </section>

      {/* Remedy Monograph Popup Modal */}
      <RemedyMonographModal
        isOpen={isMonographModalOpen}
        onClose={() => setIsMonographModalOpen(false)}
        remedy={selectedRemedyForModal}
        allRemedies={localizedRemedies}
      />
    </div>
  );
};
