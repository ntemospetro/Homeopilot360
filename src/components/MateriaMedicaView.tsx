import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Mic, 
  MicOff, 
  Sparkles, 
  Pill, 
  CheckCircle2, 
  Clock, 
  X, 
  Copy, 
  RotateCcw, 
  Tag, 
  ChevronRight, 
  Info, 
  Flame, 
  Snowflake, 
  HeartHandshake,
  ArrowLeft,
  SlidersHorizontal,
  ShieldAlert,
  Ban,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  getLocalizedRemedies, 
  LocalizedRemedy 
} from '../data/materiaMedicaData';
import { 
  matchesAuthorFilter, 
  getRemedyClassicalAuthors, 
  ClassicalAuthorFilterKey 
} from '../data/classicalAuthorsMap';
import { 
  getBogerSynopticEntry 
} from '../data/bogerSynopticData';
import { 
  getAllenKeynoteEntry 
} from '../data/allenKeynotesData';
import { 
  matchSymptomsToRemedies, 
  SymptomMatchResult,
  performDifferentialDiagnosis,
  DifferentialDiagnosisResult
} from '../services/quickSymptomMatcher';
import { useTranslation } from '../i18n/LanguageContext';
import { getActiveTherapist, isFeatureLimitReached, incrementTherapistUsage } from '../services/storage';
import { 
  isSpeechRecognitionSupported, 
  startSpeechRecognition, 
  SpeechRecognitionSession,
  mergeWithOverlap,
  deduplicateRepeatedPhrases
} from '../services/speechService';
import { AcuteClarificationModal } from './AcuteClarificationModal';
import { 
  AcuteAnswers, 
  getAcuteClarificationQuestions, 
  buildEnhancedSymptomQuery 
} from '../services/acuteClarificationService';

// Comprehensive mapping of homeopathic abbreviations and common synonyms to database keys
const REMEDY_ALIAS_MAP: Record<string, string> = {
  'rhus tox': 'rhus',
  'rhus toxicodendron': 'rhus',
  'aconitum': 'aconitum',
  'acon': 'aconitum',
  'belladonna': 'belladonna',
  'china': 'cinchona',
  'calc carb': 'calcarea carbonica',
  'calc. carb': 'calcarea carbonica',
  'calc fluor': 'calcarea fluorica',
  'calc phos': 'calcarea phosphorica',
  'calcarea carb': 'calcarea carbonica',
  'nat mur': 'natrium muriaticum',
  'natrum mur': 'natrium muriaticum',
  'natrium muriaticum': 'natrium muriaticum',
  'hepar sulfuris': 'hepar',
  'hepar sulph': 'hepar',
  'kali carb': 'kali carbonicum',
  'kali bich': 'kali bichromicum',
  'mag phos': 'magnesium phosphoricum',
  'carbo veg': 'carbo vegetabilis',
  'ant tart': 'antimonium tartaricum',
  'ant crud': 'antimonium crudum',
  'mercurius': 'mercurius',
  'phos ac': 'phosphoricum',
  'phosphoricum acidum': 'phosphoricum',
  'nitricum acidum': 'nitricum',
  'fluoricum': 'fluoricum',
  'fluoricum acidum': 'fluoricum',
  'lithium carb': 'lithium',
  'ferrum met': 'ferrum metallicum',
  'zincum met': 'zincum metallicum',
  'plumbum met': 'plumbum metallicum',
  'bryonia': 'bryonia',
  'apis': 'apis',
  'arnica': 'arnica',
  'hypericum': 'hypericum',
  'chamomilla': 'chamomilla',
  'ignatia': 'ignatia',
  'gelsemium': 'gelsemium',
  'thuja': 'thuja',
  'lachesis': 'lachesis',
  'pulsatilla': 'pulsatilla',
  'arsenicum': 'arsenicum',
  'lycopodium': 'lycopodium',
  'sepia': 'sepia',
  'silicea': 'silicea',
  'nux vomica': 'nux'
};

/**
 * Resolves a differential diagnosis string (e.g., "Rhus tox (better on motion)")
 * to a LocalizedRemedy in the active database.
 */
function resolveDifferentialRemedy(diffStr: string, remedies: LocalizedRemedy[]): LocalizedRemedy | null {
  if (!diffStr) return null;
  // 1. Strip notes in parentheses or brackets
  let raw = diffStr.replace(/\s*\([^)]*\)/g, '').replace(/\s*\[[^\]]*\]/g, '').trim();
  if (!raw) raw = diffStr.trim();
  raw = raw.replace(/[.,:;!?-]+$/, '').trim();
  const clean = raw.toLowerCase();

  // 2. Direct exact match on latinName or id
  let found = remedies.find(r => 
    r.latinName.toLowerCase() === clean || 
    r.id === clean.replace(/\s+/g, '-') ||
    r.id === clean.replace(/\s+/g, '_')
  );
  if (found) return found;

  // 3. Known aliases check
  for (const [alias, target] of Object.entries(REMEDY_ALIAS_MAP)) {
    if (clean === alias || clean.startsWith(alias) || alias.startsWith(clean)) {
      found = remedies.find(r => 
        r.latinName.toLowerCase().includes(target) || 
        r.id.includes(target)
      );
      if (found) return found;
    }
  }

  // 4. Starts with match
  found = remedies.find(r => r.latinName.toLowerCase().startsWith(clean));
  if (found) return found;

  // 5. First word match
  const firstWord = clean.split(/\s+/)[0];
  if (firstWord && firstWord.length >= 3) {
    found = remedies.find(r => {
      const entryFirstWord = r.latinName.toLowerCase().split(/\s+/)[0];
      return entryFirstWord === firstWord || r.id.startsWith(firstWord);
    });
    if (found) return found;
  }

  // 6. Contains match
  found = remedies.find(r => r.latinName.toLowerCase().includes(clean));
  if (found) return found;

  // 7. Common name / search keywords match
  found = remedies.find(r => 
    r.commonName.toLowerCase() === clean ||
    r.commonName.toLowerCase().includes(clean) ||
    (r.searchKeywords && r.searchKeywords.some(k => k.toLowerCase() === clean || k.toLowerCase().includes(clean)))
  );
  return found || null;
}

interface MateriaMedicaViewProps {
  onSelectRemedyForCase?: (remedyName: string, potency: string) => void;
  onGoToAcuteIntake?: () => void;
}

export const MateriaMedicaView: React.FC<MateriaMedicaViewProps> = ({
  onSelectRemedyForCase,
  onGoToAcuteIntake,
}) => {
  const { t, language } = useTranslation();
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'lexicon' | 'quickIntake'>(() => {
    try {
      const saved = localStorage.getItem('homoeo_mm_tab') || sessionStorage.getItem('homoeo_mm_tab');
      if (saved === 'lexicon' || saved === 'quickIntake') {
        return saved;
      }
    } catch (e) {}
    return 'lexicon';
  });

  useEffect(() => {
    try {
      localStorage.setItem('homoeo_mm_tab', activeTab);
      sessionStorage.setItem('homoeo_mm_tab', activeTab);
    } catch (e) {}
  }, [activeTab]);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Perform Materia Medica quota check and usage increment on search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    const timer = setTimeout(() => {
      const activeTherapist = getActiveTherapist();
      if (activeTherapist) {
        const limitCheck = isFeatureLimitReached(activeTherapist.id, 'maxMateriaMedicaSearch', 1);
        if (limitCheck.reached) {
          window.dispatchEvent(new CustomEvent('homoeo_action_limit_reached', {
            detail: { feature: t('tariffLimitMateriaMedicaSearchLabel'), limit: limitCheck.limit }
          }));
          // Reset query to prevent locking up or infinite triggers
          setSearchQuery('');
          return;
        }
        incrementTherapistUsage(activeTherapist.id, 'materia_search');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<ClassicalAuthorFilterKey>('all');
  const [selectedRemedyForModal, setSelectedRemedyForModal] = useState<LocalizedRemedy | null>(null);
  const [modalHistory, setModalHistory] = useState<LocalizedRemedy[]>([]);

  // Quick Intake & Voice State
  const [symptomText, setSymptomText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecondsLeft, setRecordSecondsLeft] = useState(60);
  const [recommendations, setRecommendations] = useState<SymptomMatchResult[]>([]);
  const [isSpeechSupported] = useState<boolean>(() => isSpeechRecognitionSupported());
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [acuteAnswers, setAcuteAnswers] = useState<AcuteAnswers>({});
  const [diffResult, setDiffResult] = useState<DifferentialDiagnosisResult | null>(null);
  const [showExcludedInView, setShowExcludedInView] = useState<boolean>(false);

  // Pagination for Lexicon to ensure sub-millisecond tab switching & instant rendering
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 24;

  const recognitionRef = useRef<SpeechRecognitionSession | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const recordingBaseTextRef = useRef<string>('');
  const lastSpokenTranscriptRef = useRef<string>('');
  const isFinalizingRef = useRef<boolean>(false);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);

  // Fetch localized remedies based on active language
  const localizedRemedies = useMemo(() => {
    return getLocalizedRemedies(language);
  }, [language]);

  // Update recommendations & differential diagnosis whenever symptom text, acute clarification answers, or language changes
  useEffect(() => {
    if (symptomText.trim().length >= 3) {
      const results = matchSymptomsToRemedies(symptomText, language, acuteAnswers);
      setRecommendations(results);
      const diff = performDifferentialDiagnosis(symptomText, language, acuteAnswers);
      setDiffResult(diff);
    } else {
      setRecommendations([]);
      setDiffResult(null);
    }
  }, [symptomText, acuteAnswers, language]);

  // Keep open modal in sync with language change
  useEffect(() => {
    if (selectedRemedyForModal) {
      const updated = localizedRemedies.find((r) => r.id === selectedRemedyForModal.id);
      if (updated) {
        setSelectedRemedyForModal(updated);
      }
    }
  }, [language, localizedRemedies]);

  // Clean up speech and timers on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Voice recording handler (Max 60s) with duplicate deposit prevention & automatic clarification popup
  const startVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording(true);
      return;
    }

    setRecordSecondsLeft(60);
    setIsRecording(true);
    isFinalizingRef.current = false;
    lastSpokenTranscriptRef.current = '';
    recordingBaseTextRef.current = symptomText.trim();

    try {
      const session = startSpeechRecognition({
        language: language as any,
        continuous: true,
        interimResults: true,
        onResult: (transcript) => {
          if (isFinalizingRef.current) return;
          const trimmed = transcript.trim();
          if (!trimmed) return;
          lastSpokenTranscriptRef.current = trimmed;

          const base = recordingBaseTextRef.current;
          if (!base) {
            setSymptomText(deduplicateRepeatedPhrases(trimmed));
          } else {
            setSymptomText(mergeWithOverlap(base, trimmed));
          }
        },
        onError: (err) => {
          console.warn('Speech recognition notice:', err);
        },
        onEnd: () => {
          if (!isFinalizingRef.current && isRecording) {
            stopVoiceRecording(true);
          }
        }
      });

      recognitionRef.current = session;

      // Start 60s countdown timer
      const interval = window.setInterval(() => {
        setRecordSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            stopVoiceRecording(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timerIntervalRef.current = interval;
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = (openModalIfContent = true) => {
    if (isFinalizingRef.current) return;
    isFinalizingRef.current = true;

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRecording(false);

    // Prevent duplicate voice deposit: atomically commit single deduplicated text
    const finalSpoken = lastSpokenTranscriptRef.current.trim();
    let currentSymptomResult = '';
    setSymptomText((current) => {
      const base = recordingBaseTextRef.current;
      if (finalSpoken) {
        if (!base) {
          currentSymptomResult = deduplicateRepeatedPhrases(finalSpoken);
        } else {
          currentSymptomResult = mergeWithOverlap(base, finalSpoken);
        }
        return currentSymptomResult;
      }
      currentSymptomResult = current;
      return current;
    });

    // Automatically trigger logical follow-up questions popup
    if (openModalIfContent) {
      setTimeout(() => {
        const textToCheck = currentSymptomResult || symptomText || finalSpoken;
        if (textToCheck && textToCheck.trim().length >= 3) {
          setShowClarificationModal(true);
        }
      }, 250);
    }
  };

  const handleClearSymptomText = () => {
    stopVoiceRecording(false);
    setSymptomText('');
    setAcuteAnswers({});
    setRecommendations([]);
    setRecordSecondsLeft(15);
  };

  const handleOpenRemedyModal = (remedy: LocalizedRemedy) => {
    setModalHistory([]);
    setSelectedRemedyForModal(remedy);
    setTimeout(() => {
      if (modalBodyRef.current) {
        modalBodyRef.current.scrollTop = 0;
      }
    }, 10);
  };

  const handleSelectDifferentialRemedy = (diffStr: string) => {
    const matched = resolveDifferentialRemedy(diffStr, localizedRemedies);
    if (matched) {
      if (selectedRemedyForModal) {
        setModalHistory(prev => [...prev, selectedRemedyForModal]);
      }
      setSelectedRemedyForModal(matched);
      setTimeout(() => {
        if (modalBodyRef.current) {
          modalBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    } else {
      // If not directly in standard 126 DB, fallback to searching in Lexicon
      const raw = diffStr.replace(/\s*\([^)]*\)/g, '').trim();
      setSearchQuery(raw);
      setSelectedRemedyForModal(null);
      setActiveTab('lexicon');
    }
  };

  const handleBackModal = () => {
    if (modalHistory.length === 0) return;
    const previous = modalHistory[modalHistory.length - 1];
    setModalHistory(prev => prev.slice(0, -1));
    setSelectedRemedyForModal(previous);
    setTimeout(() => {
      if (modalBodyRef.current) {
        modalBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleCopyRecommendation = (item: SymptomMatchResult) => {
    const text = `${item.remedy.latinName} (${item.remedy.commonName})\n${t('matchScoreLabel')}: ${item.matchScore}%\n${t('rationaleHeader')}: ${item.clinicalRationale}\n${t('materiaDosageLabel')}: ${item.remedy.potenciesAndDosage}`;
    navigator.clipboard.writeText(text);
    setCopySuccess(item.remedy.id);
    setTimeout(() => setCopySuccess(null), 2500);
  };

  // Filter Remedies for Lexicon
  const filteredRemedies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return localizedRemedies.filter((remedy) => {
      // Search filter across Latin name, localized common name, essence, indications, keynotes and search keywords
      const matchesSearch =
        !q ||
        remedy.latinName.toLowerCase().includes(q) ||
        remedy.commonName.toLowerCase().includes(q) ||
        remedy.essence.toLowerCase().includes(q) ||
        remedy.mainIndications.some((ind) => ind.toLowerCase().includes(q)) ||
        remedy.keynotes.some((kn) => kn.toLowerCase().includes(q)) ||
        remedy.searchKeywords.some((kw) => kw.toLowerCase().includes(q));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || remedy.categoryKey === selectedCategory;

      // Author filter (Hahnemann, Kent, Hering)
      const matchesAuthor = matchesAuthorFilter(remedy.id, selectedAuthor);

      return matchesSearch && matchesCategory && matchesAuthor;
    });
  }, [localizedRemedies, searchQuery, selectedCategory, selectedAuthor]);

  // Reset pagination to page 1 whenever filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedAuthor]);

  const totalPages = Math.max(1, Math.ceil(filteredRemedies.length / pageSize));
  const currentSafePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedRemedies = useMemo(() => {
    const start = (currentSafePage - 1) * pageSize;
    return filteredRemedies.slice(start, start + pageSize);
  }, [filteredRemedies, currentSafePage, pageSize]);

  const authors = [
    { key: 'all' as ClassicalAuthorFilterKey, label: t('filterAuthorAll') },
    { key: 'hahnemann' as ClassicalAuthorFilterKey, label: t('filterAuthorHahnemann') },
    { key: 'kent' as ClassicalAuthorFilterKey, label: t('filterAuthorKent') },
    { key: 'hering' as ClassicalAuthorFilterKey, label: t('filterAuthorHering') },
    { key: 'boericke' as ClassicalAuthorFilterKey, label: t('filterAuthorBoericke') },
    { key: 'boger' as ClassicalAuthorFilterKey, label: t('filterAuthorBoger' as any) || 'Boger' },
    { key: 'allen' as ClassicalAuthorFilterKey, label: t('filterAuthorAllen' as any) || 'H. C. Allen' }
  ];

  const categories = [
    { key: 'all', label: t('filterAll') },
    { key: 'plant', label: t('filterPlant') },
    { key: 'mineral', label: t('filterMineral') },
    { key: 'animal', label: t('filterAnimal') }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Header Card */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 font-serif">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 font-serif">
                  {t('materiaMedicaTitle')}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs">
                  {filteredRemedies.length} {t('registeredRemediesCount')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('materiaMedicaSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onGoToAcuteIntake && (
              <button
                type="button"
                onClick={onGoToAcuteIntake}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Mic className="w-3.5 h-3.5 text-teal-700" />
                <span>{t('tabQuickIntake')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: MATERIA MEDICA LEXICON */}
      {activeTab === 'lexicon' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Search, Filter & Alphabet Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col gap-3">
              {/* Search Bar Row */}
              <div className="relative w-full">
                <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-400 absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all" />
                <input
                  type="text"
                  id="materia-medica-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('materiaSearchPlaceholder')}
                  className="w-full pl-9 sm:pl-10 md:pl-12 pr-8 sm:pr-9 md:pr-11 py-2.5 sm:py-3 md:py-3.5 bg-white border border-slate-300 md:border-slate-300/90 rounded-xl md:rounded-2xl text-sm md:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-600 transition-all shadow-2xs md:shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    id="materia-medica-clear-search-btn"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 md:right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 md:p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title={t('clearBtn') || 'Löschen'}
                  >
                    <X className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                  </button>
                )}
              </div>

              {/* Filter Grid for Authors and Remedies (Categories) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 pt-1">
                {/* Autoren Grid (5 items) */}
                <div className="xl:col-span-7 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] md:text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-teal-700" />
                      {t('filterAuthorLabel')}:
                    </span>
                    {selectedAuthor !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSelectedAuthor('all')}
                        className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
                      >
                        {t('resetFilters')}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {authors.map((auth) => (
                      <button
                        key={auth.key}
                        type="button"
                        onClick={() => setSelectedAuthor(auth.key)}
                        className={`w-full py-2 px-2 md:py-2.5 md:px-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer text-center truncate shadow-2xs ${
                          selectedAuthor === auth.key
                            ? 'bg-teal-700 text-white shadow-xs font-bold'
                            : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 border border-slate-200/70'
                        }`}
                        title={auth.label}
                      >
                        <span className="truncate">{auth.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mittel / Herkunft Grid (4 items) */}
                <div className="xl:col-span-5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] md:text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-teal-700" />
                      {t('filterToggle')}:
                    </span>
                    {selectedCategory !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('all')}
                        className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
                      >
                        {t('resetFilters')}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setSelectedCategory(cat.key)}
                        className={`w-full py-2 px-2.5 md:py-2.5 md:px-3 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer text-center truncate shadow-2xs ${
                          selectedCategory === cat.key
                            ? 'bg-teal-700 text-white shadow-xs font-bold'
                            : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 border border-slate-200/70'
                        }`}
                        title={cat.label}
                      >
                        <span className="truncate">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              {t('showingRemediesCount')}: <strong className="text-slate-800">{filteredRemedies.length}</strong> /{' '}
              {localizedRemedies.length}
              {totalPages > 1 && (
                <span className="ml-2 text-teal-800 font-semibold">
                  • {t('materiaPageIndicator', { current: String(currentSafePage), total: String(totalPages) })}
                </span>
              )}
            </span>
            {(searchQuery || selectedAuthor !== 'all' || selectedCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedAuthor('all');
                }}
                className="text-teal-700 hover:text-teal-900 font-semibold cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                {t('resetFilters')}
              </button>
            )}
          </div>

          {/* Remedies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedRemedies.map((remedy) => (
              <div
                key={remedy.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-teal-300"
              >
                <div className="space-y-3.5">
                  {/* Latin Name as Headline + Localized Name Subtitle */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors font-serif">
                        {remedy.latinName}
                      </h3>
                      <div className="text-xs font-medium text-teal-800 mt-0.5">
                        {remedy.commonName}
                      </div>
                      {(() => {
                        const authorsInfo = getRemedyClassicalAuthors(remedy.id);
                        const hasAny = authorsInfo.hahnemann || authorsInfo.kent || authorsInfo.hering || authorsInfo.boericke || authorsInfo.boger || authorsInfo.allen;
                        if (!hasAny) return null;
                        return (
                          <div className="flex flex-wrap items-center gap-1 mt-1.5">
                            {authorsInfo.hahnemann && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200/60" title="Samuel Hahnemann">
                                S. Hahnemann
                              </span>
                            )}
                            {authorsInfo.kent && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-800 border border-indigo-200/60" title="James Tyler Kent">
                                J. T. Kent
                              </span>
                            )}
                            {authorsInfo.hering && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200/60" title="Constantine Hering">
                                C. Hering
                              </span>
                            )}
                            {authorsInfo.boericke && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60" title="William Boericke">
                                W. Boericke
                              </span>
                            )}
                            {authorsInfo.boger && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-purple-50 text-purple-800 border border-purple-200/60" title="Cyrus Maxwell Boger">
                                C. M. Boger
                              </span>
                            )}
                            {authorsInfo.allen && (
                              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-300/80" title="Henry C. Allen">
                                H. C. Allen
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                        remedy.categoryKey === 'plant'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : remedy.categoryKey === 'mineral'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}
                    >
                      {remedy.category}
                    </span>
                  </div>

                  {/* Localized Essence */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {remedy.essence}
                  </p>

                  {/* Localized Keynotes */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      <span>{t('remedyKeynotesTitle')}</span>
                    </div>
                    <div className="space-y-1">
                      {remedy.keynotes.slice(0, 2).map((kn, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{kn}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Localized Modalities */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-100/60 text-[11px] text-emerald-900">
                      <span className="font-bold flex items-center gap-1 text-emerald-800">
                        <Snowflake className="w-2.5 h-2.5" /> {t('remedyBetter')}:
                      </span>
                      <p className="truncate mt-0.5">{remedy.modalitiesBetter[0]}</p>
                    </div>
                    <div className="bg-rose-50/70 p-2 rounded-lg border border-rose-100/60 text-[11px] text-rose-900">
                      <span className="font-bold flex items-center gap-1 text-rose-800">
                        <Flame className="w-2.5 h-2.5" /> {t('remedyWorse')}:
                      </span>
                      <p className="truncate mt-0.5">{remedy.modalitiesWorse[0]}</p>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
                    {remedy.potenciesAndDosage.split('.')[0]}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenRemedyModal(remedy)}
                    className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 group-hover:translate-x-0.5 transition-all cursor-pointer"
                  >
                    <span>{t('viewMonograph')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {filteredRemedies.length > pageSize && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
              <div className="text-xs text-slate-500 font-medium">
                {t('materiaPaginationShowing', {
                  from: String((currentSafePage - 1) * pageSize + 1),
                  to: String(Math.min(currentSafePage * pageSize, filteredRemedies.length)),
                  total: String(filteredRemedies.length)
                })}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  type="button"
                  id="mm-pagination-prev-btn"
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentSafePage <= 1}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                    currentSafePage <= 1
                      ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('materiaPaginationPrev')}</span>
                </button>

                {/* Page Numbers */}
                {(() => {
                  const pages: (number | string)[] = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (currentSafePage > 3) pages.push('ellipsis-start');
                    const start = Math.max(2, currentSafePage - 1);
                    const end = Math.min(totalPages - 1, currentSafePage + 1);
                    for (let i = start; i <= end; i++) pages.push(i);
                    if (currentSafePage < totalPages - 2) pages.push('ellipsis-end');
                    pages.push(totalPages);
                  }

                  return pages.map((p, idx) => {
                    if (typeof p === 'string') {
                      return (
                        <span key={`el-${idx}`} className="px-2 py-1 text-slate-400 text-xs font-semibold select-none">
                          ...
                        </span>
                      );
                    }
                    const isCurrent = p === currentSafePage;
                    return (
                      <button
                        key={`page-${p}`}
                        id={`mm-pagination-page-${p}`}
                        type="button"
                        onClick={() => {
                          setCurrentPage(p);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  });
                })()}

                <button
                  type="button"
                  id="mm-pagination-next-btn"
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentSafePage >= totalPages}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                    currentSafePage >= totalPages
                      ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs'
                  }`}
                >
                  <span>{t('materiaPaginationNext')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {filteredRemedies.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">{t('noRemediesFoundTitle')}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t('noRemediesFoundDesc')}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedAuthor('all');
                }}
                className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 cursor-pointer"
              >
                {t('showAllRemediesBtn')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SCHNELLAUFNAHME & VOICE 30s */}
      {activeTab === 'quickIntake' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Left Column: Recording & Input Area */}
          <div className="lg:col-span-6 space-y-5">
            {/* 30s Recording Hub */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${isRecording ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-teal-50 text-teal-700'}`}>
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {t('quickIntakeTitle')}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {t('quickIntakeSubtitle')}
                    </p>
                  </div>
                </div>

                {/* 30s Timer Display */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                  isRecording 
                    ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' 
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>00:{recordSecondsLeft < 10 ? `0${recordSecondsLeft}` : recordSecondsLeft}</span>
                </div>
              </div>

              {/* Progress Bar for 60 Seconds */}
              {isRecording && (
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${((60 - recordSecondsLeft) / 60) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>{t('voiceRecordingStatus')}</span>
                    <span>{t('voiceMaxSeconds')}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  disabled={!isSpeechSupported}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                      : 'bg-teal-700 hover:bg-teal-800 text-white'
                  } ${!isSpeechSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>{t('voiceStopBtn')} ({recordSecondsLeft}s)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>{t('voiceStartBtn')}</span>
                    </>
                  )}
                </button>

                {symptomText && (
                  <button
                    type="button"
                    onClick={handleClearSymptomText}
                    className="px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                    title={t('clearBtn')}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t('clearBtn')}</span>
                  </button>
                )}
              </div>

              {!isSpeechSupported && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    {t('speechNotSupportedMsg')}
                  </span>
                </div>
              )}

              {/* Symptom Input Textarea */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-slate-700">
                  {t('recordedSymptomsLabel')}:
                </label>
                <textarea
                  rows={4}
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  placeholder={t('recordedSymptomsPlaceholder')}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
              </div>

              {/* Disclaimer: Not a case documentation */}
              <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {t('acuteQuestionsDisclaimer')}
                </span>
              </div>

              {/* Clarifying Questions trigger button */}
              {symptomText.trim().length >= 3 && (
                <button
                  type="button"
                  onClick={() => setShowClarificationModal(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-teal-50/90 hover:bg-teal-100 border border-teal-200 text-teal-950 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-slate-900">{t('diffDiagTitle')}</span>
                      <span className="text-[10px] font-normal text-slate-600">
                        {diffResult?.domainName ? `${diffResult.domainName} • ` : ''}
                        {t('diffDiagStepByStep')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[acuteAnswers.onset, acuteAnswers.modality, acuteAnswers.sensationMind, acuteAnswers.intensity].filter(Boolean).length > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-200/70 text-teal-900">
                        {[acuteAnswers.onset, acuteAnswers.modality, acuteAnswers.sensationMind, acuteAnswers.intensity].filter(Boolean).length}/4 {t('acuteQuestionsAnsweredCount')}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-teal-700" />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Instant Remedy Recommendations */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    {t('materiaRecsTitle')}
                  </h2>
                </div>
                {recommendations.length > 0 && (
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                    {recommendations.length} {t('recommendationsMatchesFound')}
                  </span>
                )}
              </div>

              {recommendations.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                    <Pill className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {t('readyForAnalysisTitle')}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    {t('readyForAnalysisDesc')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div
                      key={rec.remedy.id}
                      className={`p-4 rounded-xl border transition-all ${
                        index === 0
                          ? 'bg-gradient-to-br from-teal-50/70 to-emerald-50/40 border-teal-200 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Header with Latin name as primary */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-700 text-white">
                              #{index + 1}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 font-serif">
                              {rec.remedy.latinName}
                            </h3>
                            {index === 0 ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-800 text-teal-100 border border-teal-700">
                                {t('diffDiagPrimarySimile')}
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {t('diffDiagAlternative')}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-medium text-teal-800 mt-0.5">
                            {rec.remedy.commonName}
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                            <Sparkles className="w-3 h-3" />
                            {rec.matchScore}%
                          </span>
                        </div>
                      </div>

                      {/* Clinical Rationale in active language */}
                      <div className="mt-2.5 p-2.5 rounded-lg bg-white/80 border border-slate-200/80 text-xs text-slate-700 space-y-1">
                        <div className="font-semibold text-teal-900 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>{t('rationaleHeader')}:</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {rec.clinicalRationale}
                        </p>
                      </div>

                      {/* Differential Note (Distinction vs Top Remedy) */}
                      {rec.differentialNote && (
                        <div className="mt-2 p-2.5 rounded-lg bg-teal-50/70 border border-teal-200/80 text-xs text-teal-950 space-y-1">
                          <div className="font-semibold text-teal-900 flex items-center gap-1">
                            <SlidersHorizontal className="w-3 h-3 text-teal-700" />
                            <span>{t('diffDiagDistinctionToPrimary')}:</span>
                          </div>
                          <p className="text-teal-900/90 leading-relaxed">
                            {rec.differentialNote}
                          </p>
                        </div>
                      )}

                      {/* Dosage Guidance */}
                      <div className="mt-2 text-[11px] text-slate-500">
                        <strong className="text-slate-700">{t('materiaDosageLabel')}:</strong> {rec.remedy.potenciesAndDosage}
                      </div>

                      {/* Action Bar */}
                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenRemedyModal(rec.remedy)}
                          className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{t('viewInLexicon')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyRecommendation(rec)}
                          className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copySuccess === rec.remedy.id ? t('copiedBtn') : t('copyBtn')}</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Differential Excluded Remedies Section */}
                  {diffResult && diffResult.excludedRemedies.length > 0 && (
                    <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Ban className="w-4 h-4 text-rose-600" />
                          <span className="text-xs font-bold text-slate-800">
                            {t('diffDiagExcludedTitle')} ({diffResult.excludedRemedies.length})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowExcludedInView((prev) => !prev)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                        >
                          {showExcludedInView ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>{t('diffDiagHideExcluded')}</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>{t('diffDiagViewExcluded', { count: diffResult.excludedRemedies.length })}</span>
                            </>
                          )}
                        </button>
                      </div>
                      {showExcludedInView && (
                        <div className="pt-2 border-t border-slate-200 space-y-1.5 animate-in fade-in duration-100">
                          {diffResult.excludedRemedies.map((ex) => (
                            <div
                              key={ex.remedy.id}
                              className="text-xs bg-white border border-rose-100 rounded-lg p-2 flex items-start gap-2 text-rose-950"
                            >
                              <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold line-through text-slate-600">
                                  {ex.remedy.latinName}
                                </span>
                                <p className="text-[11px] text-rose-800 mt-0.5">
                                  {ex.reason}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DETAILED REMEDY MONOGRAPH MODAL */}
      {selectedRemedyForModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            {/* Modal Header: Latin Name as Headline + Localized name subtitle + Navigation Back */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1.5 flex-1 min-w-0">
                {modalHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBackModal}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white text-xs font-semibold mb-1 transition-colors cursor-pointer border border-slate-700 shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t('btnBackToPreviousRemedy', { remedy: modalHistory[modalHistory.length - 1].latinName })}</span>
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {selectedRemedyForModal.category}
                  </span>
                  <span className="text-xs text-slate-400">{t('remedyRepositoryBadge')}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-serif truncate">
                  {selectedRemedyForModal.latinName}
                </h2>
                <p className="text-sm font-medium text-teal-300 truncate">
                  {selectedRemedyForModal.commonName}
                </p>
                {(() => {
                  const authorsInfo = getRemedyClassicalAuthors(selectedRemedyForModal.id);
                  const hasAny = authorsInfo.hahnemann || authorsInfo.kent || authorsInfo.hering || authorsInfo.boericke || authorsInfo.boger || authorsInfo.allen;
                  if (!hasAny) return null;
                  return (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs text-slate-400 mr-0.5">{t('filterAuthorLabel')}:</span>
                      {authorsInfo.hahnemann && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Samuel Hahnemann
                        </span>
                      )}
                      {authorsInfo.kent && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          James Tyler Kent
                        </span>
                      )}
                      {authorsInfo.hering && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          Constantine Hering
                        </span>
                      )}
                      {authorsInfo.boericke && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          William Boericke
                        </span>
                      )}
                      {authorsInfo.boger && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Cyrus Maxwell Boger
                        </span>
                      )}
                      {authorsInfo.allen && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40">
                          Henry C. Allen
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedRemedyForModal(null);
                  setModalHistory([]);
                }}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div 
              ref={modalBodyRef}
              className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm"
            >
              {/* 1. Herkunft & Rohstoff */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <Info className="w-4 h-4 text-teal-600" />
                  <span>{t('secOriginTitle')}:</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                  {selectedRemedyForModal.origin}
                </p>
              </div>

              {/* 2. Wesenskern & Charakteristik */}
              <div className="space-y-2 bg-teal-50/60 p-4 rounded-xl border border-teal-100">
                <div className="flex items-center gap-2 text-teal-950 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>{t('secEssenceTitle')}:</span>
                </div>
                <p className="text-slate-800 leading-relaxed text-xs sm:text-sm font-medium">
                  {selectedRemedyForModal.essence}
                </p>
              </div>

              {/* 3. Haupt-Anwendungsgebiete */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <Pill className="w-4 h-4 text-teal-600" />
                  <span>{t('secIndicationsTitle')}:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRemedyForModal.mainIndications.map((ind, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-800">{ind}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Leitsymptome nach Samuel Hahnemann */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>{t('secKeynotesTitle')}:</span>
                </div>
                <ul className="space-y-1.5 list-disc list-inside bg-amber-50/40 p-4 rounded-xl border border-amber-100 text-xs sm:text-sm text-slate-800">
                  {selectedRemedyForModal.keynotes.map((kn, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span className="font-semibold text-slate-900">{kn}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 5. Gemüt & Psyche */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <HeartHandshake className="w-4 h-4 text-indigo-600" />
                  <span>{t('secMindTitle')}:</span>
                </div>
                <p className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  {selectedRemedyForModal.mindEmotional}
                </p>
              </div>

              {/* 6. Modalitäten */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                    <Snowflake className="w-4 h-4 text-emerald-700" />
                    <span>{t('secModalitiesBetterTitle')}:</span>
                  </div>
                  <ul className="space-y-1 text-xs text-emerald-950">
                    {selectedRemedyForModal.modalitiesBetter.map((mb, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="font-bold text-emerald-700">•</span>
                        <span>{mb}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 bg-rose-50/60 p-4 rounded-xl border border-rose-100">
                  <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-rose-700" />
                    <span>{t('secModalitiesWorseTitle')}:</span>
                  </div>
                  <ul className="space-y-1 text-xs text-rose-950">
                    {selectedRemedyForModal.modalitiesWorse.map((mw, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="font-bold text-rose-700">•</span>
                        <span>{mw}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 7. Dosierung & Potenzen */}
              <div className="space-y-2 bg-slate-900 text-white p-4 rounded-xl">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                  <Tag className="w-4 h-4" />
                  <span>{t('secDosageTitle')}:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {selectedRemedyForModal.potenciesAndDosage}
                </p>
                {selectedRemedyForModal.defaultTagesdosis && (
                  <div className="text-xs text-teal-300 pt-1">
                    {t('secDefaultDailyDose')}: {selectedRemedyForModal.defaultTagesdosis}
                  </div>
                )}
              </div>

              {/* 8. Verwandte Mittel & Differenzialdiagnose (ANKLICKBAR mit Direkt-Navigation) */}
              {selectedRemedyForModal.differentialRemedies.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>{t('secDifferentialTitle')}:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRemedyForModal.differentialRemedies.map((diff, idx) => {
                      const matched = resolveDifferentialRemedy(diff, localizedRemedies);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectDifferentialRemedy(diff)}
                          title={matched ? t('clickToOpenRemedy', { remedy: matched.latinName }) : diff}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer group shadow-2xs hover:shadow-xs ${
                            matched
                              ? 'bg-teal-50/80 hover:bg-teal-600 hover:text-white text-teal-900 border-teal-200/90 hover:border-teal-600'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Pill className={`w-3.5 h-3.5 ${matched ? 'text-teal-600 group-hover:text-white' : 'text-slate-400'} shrink-0`} />
                          <span className="font-semibold">{diff}</span>
                          <ChevronRight className={`w-3.5 h-3.5 ${matched ? 'text-teal-500 group-hover:text-white group-hover:translate-x-0.5' : 'text-slate-300'} transition-transform shrink-0`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 9. C. M. Boger Synoptic Key & Charakteristika */}
              {(() => {
                const bogerData = getBogerSynopticEntry(selectedRemedyForModal.id);
                if (!bogerData) return null;
                return (
                  <div className="space-y-3 bg-purple-50/50 p-4 rounded-xl border border-purple-200/70 mt-4">
                    <div className="flex items-center gap-2 text-purple-950 font-bold text-xs uppercase tracking-wider">
                      <BookOpen className="w-4 h-4 text-purple-700" />
                      <span>{t('secBogerSynopticTitle')}</span>
                    </div>

                    {/* Region / Sphere of Action */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                        {t('secBogerRegion')}:
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-purple-100">
                        {bogerData.region}
                      </p>
                    </div>

                    {/* Boger Modalities: Worse / Better */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="bg-white/80 p-2.5 rounded-lg border border-rose-100">
                        <div className="flex items-center gap-1.5 text-rose-800 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                          <Flame className="w-3.5 h-3.5 text-rose-600" />
                          <span>{t('secBogerWorse')}</span>
                        </div>
                        <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                          {bogerData.worse.map((w, wIdx) => (
                            <li key={wIdx} className="leading-snug">{w}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white/80 p-2.5 rounded-lg border border-teal-100">
                        <div className="flex items-center gap-1.5 text-teal-800 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                          <Snowflake className="w-3.5 h-3.5 text-teal-600" />
                          <span>{t('secBogerBetter')}</span>
                        </div>
                        <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                          {bogerData.better.map((b, bIdx) => (
                            <li key={bIdx} className="leading-snug">{b}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Boger Highlights */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                        {t('secBogerKeynotes')}:
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-800 list-disc list-inside bg-white/70 p-2.5 rounded-lg border border-purple-100">
                        {bogerData.highlights.map((hl, hlIdx) => (
                          <li key={hlIdx} className="leading-relaxed font-medium">
                            {hl}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}

              {/* 10. H. C. Allen Keynotes & Charakteristika */}
              {(() => {
                const allenData = getAllenKeynoteEntry(selectedRemedyForModal.id);
                if (!allenData) return null;
                return (
                  <div className="space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200/70 mt-4">
                    <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
                      <BookOpen className="w-4 h-4 text-amber-700" />
                      <span>{t('secAllenKeynotesTitle')}</span>
                    </div>

                    {/* Allen Keynotes */}
                    {allenData.keynotes.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                          {t('secAllenKeynotes')}:
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-800 list-disc list-inside bg-white/80 p-2.5 rounded-lg border border-amber-100">
                          {allenData.keynotes.map((kn, kIdx) => (
                            <li key={kIdx} className="leading-relaxed font-medium">
                              {kn}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Modalities: Worse / Better */}
                    {(allenData.modalitiesWorse.length > 0 || allenData.modalitiesBetter.length > 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {allenData.modalitiesWorse.length > 0 && (
                          <div className="bg-white/80 p-2.5 rounded-lg border border-rose-100">
                            <div className="flex items-center gap-1.5 text-rose-800 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                              <Flame className="w-3.5 h-3.5 text-rose-600" />
                              <span>{t('secAllenWorse')}</span>
                            </div>
                            <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                              {allenData.modalitiesWorse.map((w, wIdx) => (
                                <li key={wIdx} className="leading-snug">{w}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {allenData.modalitiesBetter.length > 0 && (
                          <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                              <Snowflake className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t('secAllenBetter')}</span>
                            </div>
                            <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                              {allenData.modalitiesBetter.map((b, bIdx) => (
                                <li key={bIdx} className="leading-snug">{b}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Relationships & Comparisons */}
                    {allenData.relations.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                          {t('secAllenRelations')}:
                        </div>
                        <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside bg-white/70 p-2.5 rounded-lg border border-amber-100">
                          {allenData.relations.map((rel, rIdx) => (
                            <li key={rIdx} className="leading-snug">{rel}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                {modalHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBackModal}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('btnBackToPreviousRemedy', { remedy: modalHistory[modalHistory.length - 1].latinName })}</span>
                  </button>
                )}
                <span className="text-xs text-slate-500 hidden sm:inline">
                  {t('monographHeader')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRemedyForModal(null);
                  setModalHistory([]);
                }}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                {t('closeBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logical Acute Clarification Questions Popup */}
      <AcuteClarificationModal
        isOpen={showClarificationModal}
        onClose={() => setShowClarificationModal(false)}
        symptomText={symptomText}
        initialAnswers={acuteAnswers}
        onApplyAnswers={(answers) => setAcuteAnswers(answers)}
      />
    </div>
  );
};
