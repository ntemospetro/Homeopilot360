import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation, useLanguage } from '../i18n/LanguageContext';
import { TranslationKey } from '../i18n/translations';
import { LocalizedRemedy, getLocalizedRemedies } from '../data/materiaMedicaData';
import { RemedyMonographModal } from './RemedyMonographModal';
import { FunnelStageRemediesModal } from './FunnelStageRemediesModal';
import { GeniusDifferentialModal } from './GeniusDifferentialModal';
import { AdaptiveSymptomArchitect } from './AdaptiveSymptomArchitect';
import { PatientSelectionModal } from './PatientSelectionModal';
import { PraxisBonusInfoModal } from './PraxisBonusInfoModal';
import { getPatientCases, savePatientCase } from '../services/storage';
import { 
  findGuidedAnamnesisTopic, 
  GuidedAnamnesisTopic 
} from '../data/guidedAnamnesisQuestions';
import { 
  RepertoriumSymptomInput, 
  SymptomWeightGrade, 
  performBoerickeRepertorisation,
  performSubtractiveFunnelCascade,
  BoerickeRepertorisationResult,
  SubtractiveCascadeReport,
  SubtractiveCascadeStep 
} from '../services/boerickeRepertoryService';
import { 
  matchesAuthorFilter, 
  ClassicalAuthorFilterKey 
} from '../data/classicalAuthorsMap';
import { Therapist, PatientCase } from '../types';

interface RepertoriumViewProps {
  therapist?: Therapist;
  onSelectRemedyForCase?: (remedyName: string, potency: string) => void;
  onGoToMateriaMedica?: () => void;
  currentCase?: Partial<PatientCase> | PatientCase;
  onSaveCase?: (updatedCase: PatientCase) => void;
}

export const RepertoriumView: React.FC<RepertoriumViewProps> = ({
  therapist,
  onSelectRemedyForCase,
  onGoToMateriaMedica,
  currentCase,
  onSaveCase
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Patient / Client Management State
  const [cases, setCases] = useState<PatientCase[]>(() => getPatientCases());
  const [activeClient, setActiveClient] = useState<PatientCase | null>(() => {
    if (currentCase && currentCase.patientName && currentCase.id) return currentCase as PatientCase;
    return null;
  });

  useEffect(() => {
    const handleCasesUpdate = () => setCases(getPatientCases());
    window.addEventListener('homoeo_cases_updated', handleCasesUpdate);
    return () => window.removeEventListener('homoeo_cases_updated', handleCasesUpdate);
  }, []);

  useEffect(() => {
    if (currentCase && currentCase.patientName && currentCase.id) {
      setActiveClient(currentCase as PatientCase);
    }
  }, [currentCase]);

  const [isPatientSelectionModalOpen, setIsPatientSelectionModalOpen] = useState<boolean>(false);
  const [isSavePromptOpen, setIsSavePromptOpen] = useState<boolean>(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientBirthDate, setNewClientBirthDate] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Praxis-Bonus for Polychrests (+2 points) - default ACTIVE
  const [praxisBonusActive, setPraxisBonusActive] = useState<boolean>(true);
  const [showBonusModal, setShowBonusModal] = useState<boolean>(false);

  // Symptoms list for repertorisation
  const [symptoms, setSymptoms] = useState<RepertoriumSymptomInput[]>([
    { id: 'sym-1', text: '', weight: null },
  ]);

  // Track unlocked pillar stage for each symptom (0: Chief only, 1: Location, 2: Sensation, 3: Modalities, 4: Concomitants)
  const [unlockedPillars, setUnlockedPillars] = useState<Record<string, number>>({});
  // Track symptoms toggled to manual free-text mode instead of guided dropdown assistant
  const [manualModeSymptomIds, setManualModeSymptomIds] = useState<Record<string, boolean>>({});

  const getSymptomLevel = (sym: RepertoriumSymptomInput) => {
    const manual = unlockedPillars[sym.id] ?? 0;
    const contentLevel = sym.concomitants?.trim() ? 4 :
      sym.modalities?.trim() ? 3 :
      sym.sensation?.trim() ? 2 :
      sym.location?.trim() ? 1 : 0;
    return Math.max(manual, contentLevel);
  };

  const handleUpdatePillar = (
    id: string,
    field: 'chiefComplaint' | 'location' | 'sensation' | 'modalities' | 'concomitants',
    value: string
  ) => {
    setSymptoms(prev => prev.map(s => {
      if (s.id !== id) return s;
      let updated = { ...s, [field]: value };

      // If chiefComplaint changed to a different guided topic, reset old pillar answers
      if (field === 'chiefComplaint') {
        const oldTopic = findGuidedAnamnesisTopic(s.chiefComplaint || '');
        const newTopic = findGuidedAnamnesisTopic(value);
        if (oldTopic && newTopic && oldTopic.id !== newTopic.id) {
          updated = {
            ...updated,
            location: '',
            sensation: '',
            modalities: '',
            concomitants: '',
          };
          setUnlockedPillars(p => ({ ...p, [id]: 0 }));
        }
      }

      // Compose canonical symptom text according to Bönninghausen & Kent
      const parts: string[] = [];
      if (updated.chiefComplaint?.trim()) parts.push(updated.chiefComplaint.trim());
      if (updated.location?.trim()) parts.push(updated.location.trim());
      if (updated.sensation?.trim()) parts.push(updated.sensation.trim());
      if (updated.modalities?.trim()) parts.push(updated.modalities.trim());
      if (updated.concomitants?.trim()) parts.push(updated.concomitants.trim());
      
      const newText = parts.length > 0 ? parts.join(', ') : '';
      return {
        ...updated,
        text: newText
      };
    }));
  };

  // Debounced symptoms state so typing into inputs is instantaneous and silky-smooth
  const [debouncedSymptoms, setDebouncedSymptoms] = useState<RepertoriumSymptomInput[]>(symptoms);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSymptoms(symptoms);
    }, 250);
    return () => clearTimeout(handler);
  }, [symptoms]);

  // Filter mode: strict intersection (ALL conditions must be covered, always active per user instruction)
  const strictOnly = true;

  // Funnel collapsible state: auto-expanded when there is no full pillar match
  const [isFunnelOpen, setIsFunnelOpen] = useState<boolean>(false);

  // Selected stage for full-screen paginated modal
  const [selectedFunnelStep, setSelectedFunnelStep] = useState<SubtractiveCascadeStep | null>(null);

  // Filter by classical authors (All, Hahnemann, Kent, Hering, Boericke) supporting multi-select
  const [selectedAuthors, setSelectedAuthors] = useState<ClassicalAuthorFilterKey[]>(['all']);

  const handleAuthorClick = (key: ClassicalAuthorFilterKey) => {
    if (key === 'all') {
      setSelectedAuthors(['all']);
    } else {
      let next: ClassicalAuthorFilterKey[];
      if (selectedAuthors.includes('all')) {
        next = [key];
      } else if (selectedAuthors.includes(key)) {
        next = selectedAuthors.filter(k => k !== key);
        if (next.length === 0) {
          next = ['all'];
        }
      } else {
        next = [...selectedAuthors, key];
      }
      setSelectedAuthors(next);
    }
  };

  const isAuthorActive = (key: ClassicalAuthorFilterKey) => {
    if (key === 'all') return selectedAuthors.includes('all') || selectedAuthors.length === 0;
    return selectedAuthors.includes(key);
  };

  // Selected remedy for Materia Medica monograph modal
  const [selectedRemedy, setSelectedRemedy] = useState<LocalizedRemedy | null>(null);

  // Toggle for showing full detail cards (citations, proofs, rationale) vs compact view
  const [showAllDetailCards, setShowAllDetailCards] = useState<boolean>(false);
  const [isDetailCardsModalOpen, setIsDetailCardsModalOpen] = useState<boolean>(false);

  // Copied state for individual remedy 4-pillar report
  const [copiedReportId, setCopiedReportId] = useState<string | null>(null);

  const copyPillarReport = (res: BoerickeRepertorisationResult) => {
    const lines: string[] = [
      `- Name des Mittels: ${res.remedy.latinName} (${res.remedy.commonName})`,
      `- Echte Deckung: ${res.allPillarsCovered ? t('repertoriumFullPillarsQualified') : t('repertoriumPillarsPartialQualified', { covered: res.coveredPillarsCount, total: res.totalPillarsCount })}`,
      `- Mathematischer Score: ${res.totalScore}`,
      `- Buchbelege & Zitate für diesen Fall:`,
    ];

    res.hits.forEach((hit) => {
      hit.pillarProofs.forEach((proof) => {
        const heading = 
          proof.pillarKey === 'chiefComplaint' ? t('repertoriumChiefAndLocHeading') :
          proof.pillarKey === 'location' ? t('repertoriumChiefAndLocHeading') :
          proof.pillarKey === 'sensation' ? t('repertoriumPillar2ReportHeading') :
          proof.pillarKey === 'modalities' ? t('repertoriumPillar3ReportHeading') :
          t('repertoriumPillar4ReportHeading');

        if (proof.matched) {
          lines.push(`  * ${heading}: ${t('repertoriumCitationLabel')}: "${proof.quote}" (${proof.author}, ${proof.work}, ${proof.chapter})`);
        } else {
          lines.push(`  * ${heading}: ${t('repertoriumNoProofInSources')} [${proof.queryText}]`);
        }
      });
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedReportId(res.remedy.id);
    setTimeout(() => setCopiedReportId(null), 2500);
  };

  // All remedies for monograph navigation
  const allRemedies = useMemo(() => getLocalizedRemedies(language), [language]);

  // Authors filter definition
  const authors = [
    { key: 'all' as ClassicalAuthorFilterKey, label: t('filterAuthorAll') },
    { key: 'hahnemann' as ClassicalAuthorFilterKey, label: t('filterAuthorHahnemann') },
    { key: 'kent' as ClassicalAuthorFilterKey, label: t('filterAuthorKent') },
    { key: 'hering' as ClassicalAuthorFilterKey, label: t('filterAuthorHering') },
    { key: 'boericke' as ClassicalAuthorFilterKey, label: t('filterAuthorBoericke') },
    { key: 'boger' as ClassicalAuthorFilterKey, label: t('filterAuthorBoger' as any) || 'Boger' },
    { key: 'allen' as ClassicalAuthorFilterKey, label: t('filterAuthorAllen' as any) || 'H. C. Allen' }
  ];

  // Compute live repertorisation using Classical Repertory Engine (Hahnemann, Kent, Hering, Boericke)
  const results = useMemo(() => {
    return performBoerickeRepertorisation(debouncedSymptoms, language, strictOnly, selectedAuthors, praxisBonusActive);
  }, [debouncedSymptoms, language, strictOnly, selectedAuthors, praxisBonusActive]);

  // Compute subtractive funnel cascade for primary structured symptom
  const funnelReport: SubtractiveCascadeReport = useMemo(() => {
    const primarySymptom = debouncedSymptoms.find(s => 
      Boolean(s.chiefComplaint?.trim() || s.text?.trim())
    );
    if (!primarySymptom) {
      return {
        isConfigured: false,
        steps: [],
        abortStepNumber: null,
        abortMessage: null,
        survivingRemedies: []
      };
    }
    return performSubtractiveFunnelCascade(primarySymptom, language, selectedAuthors);
  }, [debouncedSymptoms, language, selectedAuthors]);

  const handleAddSymptom = () => {
    const nextId = `sym-${Date.now()}`;
    setSymptoms(prev => [
      ...prev,
      { id: nextId, text: '', weight: null }
    ]);
    setUnlockedPillars(prev => ({ ...prev, [nextId]: 0 }));
  };

  const handleUpdateSymptom = (id: string, updates: Partial<RepertoriumSymptomInput>) => {
    setSymptoms(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleRemoveSymptom = (id: string) => {
    if (symptoms.length <= 1) {
      setSymptoms([{ id: `sym-${Date.now()}`, text: '', weight: null }]);
      setUnlockedPillars({});
      return;
    }
    setSymptoms(prev => prev.filter(s => s.id !== id));
  };

  const handleReset = () => {
    setSymptoms([
      { id: `sym-${Date.now()}-1`, text: '', weight: null },
    ]);
    setUnlockedPillars({});
  };

  const handleNewCase = () => {
    setActiveClient(null);
    handleReset();
  };

  const executeSaveToClient = (clientToSave: PatientCase) => {
    const symptomTexts = symptoms
      .map((s, idx) => {
        const parts: string[] = [];
        if (s.causaEvent?.trim()) parts.push(`Causa: ${s.causaEvent.trim()}`);
        if (s.location?.trim()) parts.push(`Lokalisation: ${s.location.trim()}`);
        if (s.sensation?.trim()) parts.push(`Empfindung: ${s.sensation.trim()}`);
        if (s.modalities?.trim()) parts.push(`Modalitäten: ${s.modalities.trim()}`);
        if (s.concomitants?.trim()) parts.push(`Begleitsymptome: ${s.concomitants.trim()}`);
        if (parts.length === 0 && s.text.trim()) parts.push(s.text.trim());
        return parts.length > 0 ? `[Symptom ${idx + 1}]\n${parts.join('\n')}` : '';
      })
      .filter(t => t.trim().length > 0)
      .join('\n\n');

    const chief = symptoms[0]?.chiefQuote || symptoms[0]?.chiefComplaint || symptoms[0]?.text || '';
    const topRemedy = results.find(r => r.isFullMatch)?.remedy?.latinName || results[0]?.remedy?.latinName || '';

    const updatedCase: PatientCase = {
      ...clientToSave,
      hauptbeschwerde: chief || clientToSave.hauptbeschwerde || '',
      anamneseSymptome: symptomTexts || clientToSave.anamneseSymptome || '',
      repertorisationErgebnis: topRemedy || clientToSave.repertorisationErgebnis || '',
      updatedAt: new Date().toISOString()
    };

    const saved = savePatientCase(updatedCase);
    setActiveClient(saved);
    onSaveCase?.(saved);
    setSaveToast(t('repertoriumSavedToClientSuccess', { name: saved.patientName }));
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleSaveClientClick = () => {
    if (activeClient) {
      executeSaveToClient(activeClient);
    } else {
      setIsSavePromptOpen(true);
    }
  };

  const handleCreateNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    const newCase: PatientCase = {
      id: `case-${Date.now()}`,
      therapistId: therapist?.id || 'therapist-1',
      patientName: newClientName.trim(),
      patientBirthDate: newClientBirthDate || undefined,
      patientPhone: newClientPhone || undefined,
      anamneseDatum: new Date().toISOString().split('T')[0],
      hauptbeschwerde: symptoms[0]?.chiefQuote || symptoms[0]?.chiefComplaint || symptoms[0]?.text || '',
      spontanbericht: '',
      modalitaetenBesser: '',
      modalitaetenSchlechter: '',
      gemuetPsyche: '',
      koerperAllgemein: '',
      lokalsymptome: '',
      bisherigeMittel: ''
    };
    setIsNewClientModalOpen(false);
    setNewClientName('');
    setNewClientBirthDate('');
    setNewClientPhone('');
    executeSaveToClient(newCase);
  };

  const hasAnyEnteredSymptom = useMemo(() => {
    return symptoms.some(s => 
      (s.text && s.text.trim().length > 0) || 
      (s.chiefComplaint && s.chiefComplaint.trim().length > 0) ||
      (s.chiefQuote && s.chiefQuote.trim().length > 0)
    );
  }, [symptoms]);

  const fullMatchResults = useMemo(() => results.filter(r => r.isFullMatch), [results]);
  const fullMatchCount = fullMatchResults.length;
  const [isGeniusModalOpen, setIsGeniusModalOpen] = useState<boolean>(false);

  // Top candidate remedies for score summary and comparison chart
  const topCandidateRemedies = useMemo(() => {
    return results.slice(0, 8);
  }, [results]);

  const maxScore = useMemo(() => {
    if (topCandidateRemedies.length === 0) return 1;
    return Math.max(...topCandidateRemedies.map(r => r.totalScore), 1);
  }, [topCandidateRemedies]);

  // Automatically open the Subtractive Funnel (aufgeklappt) when no complete 4-pillar match is found
  useEffect(() => {
    if (hasAnyEnteredSymptom && results.length === 0) {
      setIsFunnelOpen(true);
    }
  }, [hasAnyEnteredSymptom, results.length]);

  return (
    <div id="repertorium-view-root" className="w-full space-y-5">
      {/* Top Client Management Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {t('repertoriumActiveClientLabel')}
            </div>
            <div className="text-sm font-bold text-slate-900 truncate">
              {activeClient ? activeClient.patientName : t('repertoriumNoClientAssigned')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            id="repertorium-assign-client-top-btn"
            onClick={() => setIsPatientSelectionModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-teal-500 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center transition-colors cursor-pointer"
          >
            <span>{activeClient ? t('repertoriumChangeClientBtn') : t('repertoriumAssignExistingClientBtn')}</span>
          </button>

          <button
            type="button"
            id="repertorium-save-client-top-btn"
            onClick={handleSaveClientClick}
            disabled={!hasAnyEnteredSymptom}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center transition-all shadow-xs ${
              hasAnyEnteredSymptom
                ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <span>{t('repertoriumSaveClientBtn')}</span>
          </button>

          <button
            type="button"
            id="repertorium-new-case-btn"
            onClick={handleNewCase}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            title={t('repertoriumNewCaseBtn')}
          >
            <span>{t('repertoriumNewCaseBtn')}</span>
          </button>
        </div>
      </div>

      {/* Classical Authors Selector Bar (Clean primary header matching image.png) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 md:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-bold text-slate-900">
              {t('filterAuthorLabel')}
            </span>
            <span className="text-xs text-slate-500">
              — {selectedAuthors.includes('all') || selectedAuthors.length === 0
                ? t('repertoriumScopeAll') 
                : `${t('repertoriumScopeAuthor')} ${selectedAuthors.map(k => authors.find(a => a.key === k)?.label).filter(Boolean).join(', ')}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 w-full">
          {authors.map((auth) => {
            const active = isAuthorActive(auth.key);
            return (
              <button
                key={auth.key}
                type="button"
                id={`repertorium-filter-author-${auth.key}`}
                onClick={() => handleAuthorClick(auth.key)}
                className={`py-2 px-2 md:py-2.5 md:px-3 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer text-center truncate shadow-2xs ${
                  active
                    ? 'bg-teal-700 text-white font-bold shadow-xs ring-1 ring-teal-800'
                    : 'bg-slate-100 hover:bg-slate-200/90 text-slate-700 border border-slate-200/80'
                }`}
              >
                {auth.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left = Symptoms Input, Right = Repertory Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Symptom Input (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Symptoms List with Adaptive Symptom Architect */}
          <div className="space-y-4">
            {symptoms.map((symptom, index) => (
              <AdaptiveSymptomArchitect
                key={symptom.id}
                symptom={symptom}
                onChange={(updated) => handleUpdateSymptom(symptom.id, updated)}
                onRemove={() => handleRemoveSymptom(symptom.id)}
                index={index}
                isSingle={symptoms.length <= 1}
                language={language}
              />
            ))}
          </div>

          {/* Classical Authors Guidance Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 text-xs text-slate-600 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span>
                {selectedAuthors.includes('all') || selectedAuthors.length === 0
                  ? t('repertoriumBoerickeNotice') 
                  : `${t('repertoriumScopeAuthor')} ${selectedAuthors.map(k => authors.find(a => a.key === k)?.label).filter(Boolean).join(', ')}`}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t('repertoriumBoerickeGuidance')}
            </p>
          </div>
        </div>

        {/* Right Column: Narrowed Results List (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Results Summary Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-xs">
                  <span className="text-slate-500">{t('repertoriumFoundRemedies')}: </span>
                  <span className="font-bold text-slate-900 text-sm">{hasAnyEnteredSymptom ? results.length : 0}</span>
                </div>
                <span className="text-slate-300">|</span>
                <div className="text-xs">
                  <span className="text-emerald-700 font-semibold">{t('repertoriumFullCoverage')}: </span>
                  <span className="font-bold text-emerald-800 text-sm">{hasAnyEnteredSymptom ? fullMatchCount : 0} {t('repertoriumRemediesUnit')}</span>
                </div>
                {hasAnyEnteredSymptom && fullMatchCount > 1 && (
                  <>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      id="repertorium-genius-diff-summary-btn"
                      onClick={() => setIsGeniusModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
                      title={t('geniusButtonTooltip', { count: fullMatchCount })}
                    >
                      <span>{t('geniusDifferentialAnalysis')}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-white/25 text-white text-[10px] font-extrabold">
                        {fullMatchCount}
                      </span>
                    </button>
                  </>
                )}
                {/* Client save/assign action button right next to results */}
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  id="repertorium-save-case-results-btn"
                  onClick={handleSaveClientClick}
                  disabled={!hasAnyEnteredSymptom}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all ${
                    hasAnyEnteredSymptom
                      ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer hover:shadow'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                  title={t('repertoriumSaveClientBtn')}
                >
                  <span>{activeClient ? t('repertoriumSaveClientBtn') : t('repertoriumAssignExistingClientBtn')}</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>{t('repertoriumSortLabel')}</span>
              </div>
            </div>
          </div>

          {/* Subtractive Funnel Filter Visualization (Permanente Reduktion nach Stufen) - Aufklappbar, default geschlossen */}
          {hasAnyEnteredSymptom && funnelReport.isConfigured && funnelReport.steps.length > 0 && (
            <div 
              id="repertorium-subtractive-funnel-card"
              className="bg-white rounded-2xl border border-teal-200/90 shadow-xs overflow-hidden transition-all"
            >
              {/* Collapsible Header Accordion Toggle */}
              <button
                type="button"
                id="repertorium-funnel-collapse-toggle"
                onClick={() => setIsFunnelOpen(prev => !prev)}
                className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-3 hover:bg-teal-50/40 transition-colors cursor-pointer"
                aria-expanded={isFunnelOpen}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs md:text-sm font-bold text-slate-900">
                        {t('repertoriumFunnelTitle')}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300">
                        {t('repertoriumFunnelActiveBadge')}
                      </span>
                      {funnelReport.survivingRemedies.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {funnelReport.survivingRemedies.length} {t('repertoriumRemediesUnit')}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {t('repertoriumFunnelSubtitle')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-teal-700">
                    {isFunnelOpen ? t('repertoriumFunnelToggleClose') : t('repertoriumFunnelToggleOpen')}
                  </span>
                </div>
              </button>

              {/* Collapsible Content Area */}
              {isFunnelOpen && (
                <div className="px-4 pb-4 md:px-5 md:pb-5 space-y-3.5 border-t border-slate-100 pt-3.5 animate-in fade-in duration-200">
                  <div className="text-[11px] text-slate-500 bg-teal-50/60 border border-teal-100/90 rounded-xl px-3 py-2 flex items-center gap-2">
                    <span>
                      {t('repertoriumFunnelClickStageHint', { count: funnelReport.steps[0]?.countAfter || 0 })}
                    </span>
                  </div>

                  {/* Cascade Stages Flow - Clickable for Fullscreen Modal */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {funnelReport.steps.map((step) => {
                      const eliminated = step.countBefore - step.countAfter;
                      return (
                        <button
                          type="button"
                          key={step.stepNumber}
                          id={`repertorium-funnel-step-btn-${step.stepNumber}`}
                          onClick={() => setSelectedFunnelStep(step)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer group hover:shadow-sm ${
                            step.isAborted
                              ? 'bg-rose-50/70 hover:bg-rose-50 border-rose-300 text-rose-900'
                              : 'bg-slate-50/80 hover:bg-teal-50/50 border-slate-200 hover:border-teal-300 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                step.isAborted 
                                  ? 'bg-rose-200 text-rose-800' 
                                  : 'bg-teal-700 text-white'
                              }`}>
                                {step.stepNumber}
                              </span>
                              <span className="text-xs font-bold group-hover:text-teal-900 transition-colors">
                                {step.stepNumber === 1 ? t('repertoriumFunnelStage1Title') :
                                 step.stepNumber === 2 ? t('repertoriumFunnelStage2Title') :
                                 step.stepNumber === 3 ? t('repertoriumFunnelStage3Title') :
                                 step.stepNumber === 4 ? t('repertoriumFunnelStage4Title') :
                                 step.stepNumber === 5 ? t('repertoriumFunnelStage5Title') : step.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              {eliminated > 0 && (
                                <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-md">
                                  {t('repertoriumFunnelEliminatedCount', { count: eliminated })}
                                </span>
                              )}
                              <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 ${
                                step.countAfter > 0 
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                                  : 'bg-rose-100 text-rose-900 border border-rose-300'
                              }`}>
                                <span>{t('repertoriumFunnelRemediesCount', { count: step.countAfter })}</span>
                              </span>
                            </div>
                          </div>

                          <div className="mt-1.5 pl-7 text-[11px] flex items-center justify-between text-slate-600">
                            <span>
                              <span className="font-semibold text-slate-500">{t('repertoriumCriterionLabel')}: </span>
                              <span className="italic font-medium text-slate-800">„{step.inputCriterion}“</span>
                            </span>
                            <span className="text-[10px] text-teal-700 font-semibold group-hover:underline">
                              {t('repertoriumFunnelShowListBtn')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Abort Banner */}
                  {funnelReport.abortStepNumber !== null && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 flex items-start gap-2.5 text-rose-900">
                      <div className="text-xs">
                        <div className="font-bold">{t('repertoriumFunnelAbortHeading')}</div>
                        <div className="font-medium mt-0.5">{funnelReport.abortMessage}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Results List */}
          {!hasAnyEnteredSymptom ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
              <h3 className="text-base font-semibold text-slate-800 mb-1">
                {t('repertoriumEmptyStateTitle')}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
                {t('repertoriumEmptyStateDesc')}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
              <h3 className="text-base font-semibold text-slate-800 mb-1">
                {t('repertoriumNoFullPillarMatch')}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
                {t('repertoriumNoFullPillarMatch')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Genius-Differenzialanalyse Highlight Callout Banner when fullMatchCount > 1 */}
              {fullMatchCount > 1 && (
                <div 
                  id="repertorium-genius-highlight-banner"
                  className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-300/80 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs text-xs font-black uppercase tracking-wider px-2">
                      Genius
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">
                          {t('geniusDifferentialAnalysis')}
                        </h4>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {fullMatchCount} {t('repertoriumRemediesUnit')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {t('geniusModalSubtitle')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="repertorium-open-genius-banner-btn"
                    onClick={() => setIsGeniusModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
                  >
                    <span>{t('geniusDifferentialAnalysis')}</span>
                  </button>
                </div>
              )}
              {/* Mathematical Ranking & Score Comparison Chart */}
              {results.length > 0 && (
                <div 
                  id="repertorium-score-ranking-card"
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 md:p-5 shadow-xs space-y-4"
                >
                  {/* Top Score Summary Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs md:text-sm font-bold text-slate-900">
                          {t('repertoriumScoreOverviewTitle')}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {results.length} {t('repertoriumRemediesUnit')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {t('repertoriumScoreOverviewSubtitle')}
                      </p>
                    </div>

                    {/* Top Winner Remedy Pill */}
                    {results[0] && (
                      <div className="flex items-center gap-2.5 bg-teal-50/70 border border-teal-200/80 rounded-xl px-3.5 py-2 shrink-0">
                        <div className="w-6 h-6 rounded-full bg-teal-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          #1
                        </div>
                        <div className="text-left">
                          <div className="text-[10px] font-semibold text-teal-800 uppercase tracking-wide">
                            {t('repertoriumScoreTopCandidate')}
                          </div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{results[0].remedy.latinName}</span>
                            <span className="text-[11px] font-semibold text-teal-800 bg-teal-100/90 px-1.5 py-0.2 rounded">
                              {results[0].totalScore} Pkt
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Decent Praxis-Bonus Toggle Card matching the image */}
                  <div className="bg-white border border-teal-200/80 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-xs shadow-xs">
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={praxisBonusActive}
                          onChange={(e) => setPraxisBonusActive(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-700"></div>
                      </label>
                      <span className="font-bold text-slate-800">
                        {t('repertoriumPraxisBonusToggle')}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        praxisBonusActive 
                          ? 'bg-teal-50 text-teal-800 border-teal-200' 
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {praxisBonusActive ? t('repertoriumPraxisBonusActive') : t('repertoriumPraxisBonusInactive')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowBonusModal(true)}
                        className="w-5 h-5 rounded-full border border-teal-300 text-teal-800 flex items-center justify-center text-[10px] font-bold hover:bg-teal-50 transition-colors cursor-pointer"
                        title="Info"
                      >
                        i
                      </button>
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 shrink-0 flex items-center gap-1">
                      <span className="text-amber-600">✦</span> Polychrest: <span className="font-bold text-slate-700">64 Mittel</span>
                    </div>
                  </div>

                  {/* Horizontal Bar Chart: Clean, quiet, and subtle styling */}
                  <div className="space-y-2.5">
                    {topCandidateRemedies.map((cand, idx) => {
                      const scorePct = Math.round((cand.totalScore / maxScore) * 100);
                      const isWinner = idx === 0;
                      return (
                        <div 
                          key={cand.remedy.id}
                          onClick={() => setSelectedRemedy(cand.remedy)}
                          className="flex items-center gap-2 sm:gap-3 group text-xs hover:bg-teal-50/50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title={`Arzneimittel-Bild von ${cand.remedy.latinName} öffnen`}
                        >
                          {/* Rank & Remedy Label */}
                          <div className="w-36 sm:w-44 shrink-0 flex items-center gap-1.5 truncate">
                            <span className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center shrink-0 ${
                              isWinner 
                                ? 'bg-teal-700 text-white' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className={`truncate text-xs ${isWinner ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                              {cand.remedy.latinName}
                            </span>
                          </div>

                          {/* Progress Bar Container */}
                          <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden flex items-center">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                isWinner
                                  ? 'bg-teal-600'
                                  : cand.isFullMatch
                                  ? 'bg-emerald-600/85'
                                  : 'bg-slate-400'
                              }`}
                              style={{ width: `${Math.max(scorePct, 6)}%` }}
                            />
                          </div>

                          {/* Numeric Score and Pillars */}
                          <div className="w-24 sm:w-28 shrink-0 flex items-center justify-end gap-1.5 text-[11px]">
                            <span className="font-bold text-slate-900">
                              {cand.totalScore} Pkt
                            </span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {cand.coveredPillarsCount}/4
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Toggle Button for All Detailed Remedy Cards */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <span className="text-[11px] text-slate-500">
                      {t('repertoriumFunnelStageModalRemediesCount', { count: results.length })}
                    </span>
                    <button
                      type="button"
                      id="repertorium-toggle-detail-cards-btn"
                      onClick={() => setIsDetailCardsModalOpen(true)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-all cursor-pointer shadow-2xs"
                    >
                      <span>{t('repertoriumScoreToggleShowAll', { count: results.length })}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Scrollable Popup (Modal) for All Detailed Remedy Cards */}
              {isDetailCardsModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {t('repertoriumFunnelSurvivingHeading')}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {results.length} {t('repertoriumRemediesUnit')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDetailCardsModalOpen(false)}
                        className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                      >
                        {t('closeModalBtn' as TranslationKey) || 'Schließen'}
                      </button>
                    </div>

                    {/* Scrollable Content Container */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {results.map((res, index) => {
                        const isTopSimile = index === 0 && res.isFullMatch;
                        return (
                          <div
                            key={res.remedy.id}
                            className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all ${
                              isTopSimile
                                ? 'border-teal-300 shadow-md ring-1 ring-teal-500/10'
                                : 'border-slate-200/80 shadow-xs'
                            }`}
                          >
                            {/* Topline Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-slate-500">#{index + 1}</span>
                                  <h4 
                                    onClick={() => {
                                      setSelectedRemedy(res.remedy);
                                      setIsDetailCardsModalOpen(false);
                                    }}
                                    className="text-sm sm:text-base font-bold text-slate-900 hover:text-teal-700 hover:underline cursor-pointer transition-colors"
                                  >
                                    {res.remedy.latinName}
                                  </h4>
                                  {res.remedy.commonName && (
                                    <span className="text-xs text-slate-500">({res.remedy.commonName})</span>
                                  )}
                                  {res.remedy.isPolychrest && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                      Polychrest
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 italic">
                                  {res.remedy.essence}
                                </p>
                              </div>

                              <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                  res.isFullMatch 
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}>
                                  {res.isFullMatch ? t('repertoriumRemedyFullMatch' as TranslationKey) : t('repertoriumRemedyPartialMatch' as TranslationKey, { count: res.coveredPillarsCount })}
                                </span>
                                <div className="text-[11px] font-medium text-slate-500">
                                  {t('repertoriumRemedyMathScore' as TranslationKey)}: <span className="font-bold text-slate-900">{res.totalScore} Pkt</span>
                                </div>
                              </div>
                            </div>

                            {/* Orange progress bar underneath header */}
                            <div className="mt-2.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-amber-500 h-full rounded-full transition-all" 
                                style={{ width: `${Math.max(15, Math.min(100, (res.totalScore / 15) * 100))}%` }}
                              />
                            </div>

                            {/* 4-Pillar Score breakdown bar */}
                            <div className="mt-3 py-2 px-3 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-bold text-slate-700">4-Säulen-Score:</span>
                              <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">S1: {res.pillarScores?.pillar1Location || 0} Pkt</span>
                              <span className="px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-medium">S2: +{res.pillarScores?.pillar2Sensation || 0} Pkt</span>
                              <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">S3: {res.pillarScores?.pillar3Modality || 0} Pkt</span>
                              <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">S4: {res.pillarScores?.pillar4Concomitants || 0} Pkt</span>
                              <span className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-medium">+{res.pillarScores?.praxisBonus || 2} Praxis-Bonus</span>
                              <span className="ml-auto font-bold text-slate-900">= {res.totalScore} Punkte ({res.coveredPillarsCount}/{res.totalPillarsCount || 4})</span>
                            </div>

                            {/* Section header: Buchbelege & Zitate für diesen Fall */}
                            <div className="mt-4 flex items-center justify-between">
                              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Buchbelege & Zitate für diesen Fall
                              </h5>
                              <button
                                type="button"
                                onClick={() => copyPillarReport(res)}
                                className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                {copiedReportId === res.remedy.id ? '✓ Befund kopiert' : 'Befund im 4-Säulen-Format kopieren'}
                              </button>
                            </div>

                            {/* Breakdown by Pillars */}
                            <div className="mt-2.5 space-y-3">
                              {/* Pillar 1: Location */}
                              {res.pillarBreakdown?.pillar1Location && res.pillarBreakdown.pillar1Location.sourceQuote && (
                                <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-3 text-xs">
                                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-2">
                                    <span className="font-bold text-slate-800">
                                      {t('symptomColumnTitle1' as TranslationKey) || 'Lokalisation'}: {res.pillarBreakdown.pillar1Location.patientText}
                                    </span>
                                    <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                                      Grad {res.pillarBreakdown.pillar1Location.grade || 3}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 leading-relaxed italic">
                                    "{res.pillarBreakdown.pillar1Location.sourceQuote}" <span className="text-[10px] text-slate-400">({res.pillarBreakdown.pillar1Location.sourceAuthor}, {res.pillarBreakdown.pillar1Location.sourceWork})</span>
                                  </p>
                                </div>
                              )}

                              {/* Pillar 2: Sensation */}
                              {res.pillarBreakdown?.pillar2Sensation && res.pillarBreakdown.pillar2Sensation.sourceQuote && (
                                <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-3 text-xs">
                                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-2">
                                    <span className="font-bold text-slate-800">
                                      {t('symptomColumnTitle2' as TranslationKey) || 'Empfindung'}: {res.pillarBreakdown.pillar2Sensation.patientText}
                                    </span>
                                    <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                                      Grad {res.pillarBreakdown.pillar2Sensation.grade || 3}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 leading-relaxed italic">
                                    "{res.pillarBreakdown.pillar2Sensation.sourceQuote}" <span className="text-[10px] text-slate-400">({res.pillarBreakdown.pillar2Sensation.sourceAuthor}, {res.pillarBreakdown.pillar2Sensation.sourceWork})</span>
                                  </p>
                                </div>
                              )}

                              {/* Pillar 3: Modality / Causa */}
                              {res.pillarBreakdown?.pillar3ModalityAndCausa && (
                                <>
                                  {res.pillarBreakdown.pillar3ModalityAndCausa.modalityWorse?.sourceQuote && (
                                    <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-3 text-xs">
                                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-2">
                                        <span className="font-bold text-slate-800">
                                          {t('symptomColumnTitle3' as TranslationKey) || 'Modalität (Schlechter)'}: {res.pillarBreakdown.pillar3ModalityAndCausa.modalityWorse.patientText}
                                        </span>
                                        <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                                          Grad {res.pillarBreakdown.pillar3ModalityAndCausa.modalityWorse.grade || 3}
                                        </span>
                                      </div>
                                      <p className="text-slate-600 leading-relaxed italic">
                                        "{res.pillarBreakdown.pillar3ModalityAndCausa.modalityWorse.sourceQuote}" <span className="text-[10px] text-slate-400">({res.pillarBreakdown.pillar3ModalityAndCausa.modalityWorse.sourceAuthor}, {res.pillarBreakdown.pillar3ModalityAndCausa.modalityWorse.sourceWork})</span>
                                      </p>
                                    </div>
                                  )}
                                  {res.pillarBreakdown.pillar3ModalityAndCausa.modalityBetter?.sourceQuote && (
                                    <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-3 text-xs">
                                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-2">
                                        <span className="font-bold text-slate-800">
                                          {t('symptomColumnTitle3' as TranslationKey) || 'Modalität (Besser)'}: {res.pillarBreakdown.pillar3ModalityAndCausa.modalityBetter.patientText}
                                        </span>
                                        <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                                          Grad {res.pillarBreakdown.pillar3ModalityAndCausa.modalityBetter.grade || 3}
                                        </span>
                                      </div>
                                      <p className="text-slate-600 leading-relaxed italic">
                                        "{res.pillarBreakdown.pillar3ModalityAndCausa.modalityBetter.sourceQuote}" <span className="text-[10px] text-slate-400">({res.pillarBreakdown.pillar3ModalityAndCausa.modalityBetter.sourceAuthor}, {res.pillarBreakdown.pillar3ModalityAndCausa.modalityBetter.sourceWork})</span>
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}

                              {/* Pillar 4: Concomitants */}
                              {res.pillarBreakdown?.pillar4Concomitants && res.pillarBreakdown.pillar4Concomitants.sourceQuote && (
                                <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-3 text-xs">
                                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-2">
                                    <span className="font-bold text-slate-800">
                                      {t('symptomColumnTitle4' as TranslationKey) || 'Begleitsymptome'}: {res.pillarBreakdown.pillar4Concomitants.patientText}
                                    </span>
                                    <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                                      Grad {res.pillarBreakdown.pillar4Concomitants.grade || 3}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 leading-relaxed italic">
                                    "{res.pillarBreakdown.pillar4Concomitants.sourceQuote}" <span className="text-[10px] text-slate-400">({res.pillarBreakdown.pillar4Concomitants.sourceAuthor}, {res.pillarBreakdown.pillar4Concomitants.sourceWork})</span>
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Actions / Footer of Card */}
                            <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                {onSelectRemedyForCase && (
                                  <button
                                    type="button"
                                    onClick={() => onSelectRemedyForCase(res.remedy.latinName, 'C30')}
                                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                                  >
                                    {t('repertoriumApplyToCase')}
                                  </button>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRemedy(res.remedy);
                                  setIsDetailCardsModalOpen(false);
                                }}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 shadow-xs transition-colors cursor-pointer"
                              >
                                Arzneimittel-Bild öffnen
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsDetailCardsModalOpen(false)}
                        className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                      >
                        {t('closeModalBtn' as TranslationKey) || 'Schließen'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Monograph Detail Modal */}
      {selectedRemedy && (
        <RemedyMonographModal
          isOpen={Boolean(selectedRemedy)}
          remedy={selectedRemedy}
          onClose={() => setSelectedRemedy(null)}
          allRemedies={allRemedies}
          onSelectRemedyForCase={(remName, pot) => {
            if (onSelectRemedyForCase) {
              onSelectRemedyForCase(remName, pot);
            }
            setSelectedRemedy(null);
          }}
        />
      )}

      {/* Full-Screen Paginated Funnel Stage Remedies Modal */}
      {selectedFunnelStep && (
        <FunnelStageRemediesModal
          isOpen={Boolean(selectedFunnelStep)}
          step={selectedFunnelStep}
          allRemedies={allRemedies}
          onClose={() => setSelectedFunnelStep(null)}
          onOpenMonograph={(remedy) => {
            setSelectedRemedy(remedy);
          }}
          onSelectRemedyForCase={onSelectRemedyForCase}
        />
      )}

      {/* Genius-Differenzialanalyse (Kontrast-Tabelle) Full-Page Modal */}
      {isGeniusModalOpen && fullMatchResults.length > 1 && (
        <GeniusDifferentialModal
          isOpen={isGeniusModalOpen}
          onClose={() => setIsGeniusModalOpen(false)}
          fullMatchResults={fullMatchResults}
          onOpenRemedyMonograph={(remedyId) => {
            const found = allRemedies.find(r => r.id === remedyId || r.aliases?.includes(remedyId));
            if (found) {
              setSelectedRemedy(found);
            }
          }}
        />
      )}

      {/* Patient Selection Modal */}
      <PatientSelectionModal
        isOpen={isPatientSelectionModalOpen}
        onClose={() => setIsPatientSelectionModalOpen(false)}
        onSelectPatient={(selectedCase) => {
          setIsPatientSelectionModalOpen(false);
          executeSaveToClient(selectedCase);
        }}
        cases={cases}
        activePatientName={activeClient?.patientName}
      />

      {/* Prompt Modal: Save or Assign to Client */}
      {isSavePromptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900">
                  {t('repertoriumSavePromptTitle')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSavePromptOpen(false)}
                className="text-slate-400 hover:text-slate-600 px-2 py-1 text-xs font-bold cursor-pointer"
              >
                {t('closeModalBtn' as TranslationKey) || 'Schließen'}
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('repertoriumSavePromptDesc')}
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                id="repertorium-prompt-assign-btn"
                onClick={() => {
                  setIsSavePromptOpen(false);
                  setIsPatientSelectionModalOpen(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <span>{t('repertoriumAssignExistingClientBtn')}</span>
              </button>

              <button
                type="button"
                id="repertorium-prompt-create-btn"
                onClick={() => {
                  setIsSavePromptOpen(false);
                  setIsNewClientModalOpen(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{t('repertoriumCreateNewClientBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Client Creation Modal */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900">
                  {t('repertoriumNewClientModalTitle')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewClientModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 px-2 py-1 text-xs font-bold cursor-pointer"
              >
                {t('closeModalBtn' as TranslationKey) || 'Schließen'}
              </button>
            </div>

            <form onSubmit={handleCreateNewClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('repertoriumClientNameLabel')} *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="z. B. Anna Schmidt"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('repertoriumClientBirthDateLabel')}
                </label>
                <input
                  type="date"
                  value={newClientBirthDate}
                  onChange={(e) => setNewClientBirthDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('repertoriumClientPhoneLabel')}
                </label>
                <input
                  type="tel"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="z. B. +49 170 1234567"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!newClientName.trim()}
                  className="px-4 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {t('repertoriumCreateAndSaveBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Save Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="text-xs sm:text-sm font-semibold">{saveToast}</span>
        </div>
      )}

      {/* Praxis-Bonus & Polychrest Information Modal */}
      <PraxisBonusInfoModal
        isOpen={showBonusModal}
        onClose={() => setShowBonusModal(false)}
      />
    </div>
  );
};
