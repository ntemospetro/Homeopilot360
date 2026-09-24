import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { 
  Search, 
  X, 
  Sparkles, 
  Save, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Info, 
  Layers, 
  Activity, 
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Filter,
  ArrowLeft,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { Therapist, PatientCase } from '../types';
import { getLocalizedRemedies, LocalizedRemedy } from '../data/materiaMedicaData';
import { RemedyMonographModal } from './RemedyMonographModal';

interface RepertoryViewProps {
  therapist?: Therapist;
  currentCase?: Partial<PatientCase> | PatientCase;
  onSaveCase?: (updatedCase: PatientCase) => void;
}

interface KentRubric {
  id: string;
  chapter: string;
  symptom: string;
  zusatz: string[];
  path: string;
  remedyCount: number;
}

interface KentRepertorizationResult {
  remedyKey: string;
  fullName: string;
  hits: number;
  score: number;
  gradesPerRubric: { [rubricId: string]: number };
  totalSelectedRubrics: number;
}

export const RepertoryView: React.FC<RepertoryViewProps> = ({
  therapist,
  currentCase,
  onSaveCase
}) => {
  const { t, language } = useTranslation();

  // Active Search Mode: 'drilldown' or 'keyword'
  const [searchMode, setSearchMode] = useState<'drilldown' | 'keyword'>('drilldown');

  // Selected Rubrics across both modes (the "cart")
  const [selectedRubrics, setSelectedRubrics] = useState<KentRubric[]>([]);

  // Repertorisation results for the "cart"
  const [remedyResults, setRemedyResults] = useState<KentRepertorizationResult[]>([]);
  const [isRepertorizing, setIsRepertorizing] = useState(false);
  const [remedyFilter, setRemedyFilter] = useState('');

  // UI notifications
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // ==========================================================================
  // STATE 1: HIERARCHICAL DRILL-DOWN MODE
  // ==========================================================================
  const [drillChapter, setDrillChapter] = useState('');
  const [drillSymptom, setDrillSymptom] = useState('');
  const [drillZusatz, setDrillZusatz] = useState<string[]>([]);
  
  const [drillOptions, setDrillOptions] = useState<string[]>([]);
  const [drillLevelType, setDrillLevelType] = useState<string>('chapter');
  const [drillLevelIndex, setDrillLevelIndex] = useState<number>(-1);
  const [drillRubrics, setDrillRubrics] = useState<KentRubric[]>([]);
  const [isDrillLoading, setIsDrillLoading] = useState(false);
  const [drillFilterQuery, setDrillFilterQuery] = useState('');
  const [drillError, setDrillError] = useState<string | null>(null);

  // Fallback list of 37 Kent chapters in case backend is briefly initializing
  const FALLBACK_CHAPTERS = useMemo(() => [
    "Allgemeines", "Atmung", "Auge", "Auswurf", "Bauch", "Blase", "Brust",
    "Extremitäten", "Fieber", "Frost", "Gehör", "Gemüt",
    "Geschlechtsorgane männlich", "Geschlechtsorgane weiblich", "Gesicht",
    "Hals", "Hals-Außenseite", "Harnröhre", "Haut", "Husten",
    "Kehlkopf und Luftröhre", "Kopf", "Magen", "Mastdarm", "Mund",
    "Nase", "Nieren", "Ohr", "Prostata", "Rücken", "Schlaf",
    "Schweiß", "Schwindel", "Sehen", "Stuhl", "Urin", "Zähne"
  ], []);

  // ==========================================================================
  // STATE 2: GLOBAL KEYWORD SEARCH MODE
  // ==========================================================================
  const [keywordQuery, setKeywordQuery] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [keywordChapterFilter, setKeywordChapterFilter] = useState('');
  const [keywordResults, setKeywordResults] = useState<KentRubric[]>([]);
  const [isKeywordSearching, setIsKeywordSearching] = useState(false);
  const [keywordSearchError, setKeywordSearchError] = useState<string | null>(null);

  // Chapters list for filter dropdown
  const [chapters, setChapters] = useState<string[]>([]);

  // ==========================================================================
  // STATE 3: ARZNEIMITTEL / REMEDY POPUP MODAL (MATERIA MEDICA)
  // ==========================================================================
  const [selectedRemedyForModal, setSelectedRemedyForModal] = useState<LocalizedRemedy | null>(null);
  const [modalHistory, setModalHistory] = useState<LocalizedRemedy[]>([]);
  const [isLoadingRemedy, setIsLoadingRemedy] = useState(false);

  // Load all Chapters on boot
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch('/api/kent/chapters');
        const data = await res.json();
        if (data.success && Array.isArray(data.chapters) && data.chapters.length > 0) {
          setChapters(data.chapters);
        } else {
          setChapters(FALLBACK_CHAPTERS);
        }
      } catch (err) {
        console.warn("Could not fetch chapters from API, using fallback list:", err);
        setChapters(FALLBACK_CHAPTERS);
      }
    };
    fetchChapters();
  }, [FALLBACK_CHAPTERS]);

  // Debounce free keyword search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keywordQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [keywordQuery]);

  // Handle free keyword search execution
  useEffect(() => {
    const executeKeywordSearch = async () => {
      if (!debouncedKeyword && !keywordChapterFilter) {
        setKeywordResults([]);
        return;
      }

      setIsKeywordSearching(true);
      setKeywordSearchError(null);

      try {
        const url = new URL('/api/kent/search', window.location.origin);
        url.searchParams.append('q', debouncedKeyword);
        if (keywordChapterFilter) {
          url.searchParams.append('chapter', keywordChapterFilter);
        }
        url.searchParams.append('limit', '80');

        const res = await fetch(url.toString());
        const data = await res.json();

        if (data.success && Array.isArray(data.rubrics)) {
          setKeywordResults(data.rubrics);
        } else {
          setKeywordSearchError(data.error || "Failed to search rubrics");
        }
      } catch (err) {
        console.error("Error searching rubrics:", err);
        setKeywordSearchError("Fehler bei der Symptomsuche.");
      } finally {
        setIsKeywordSearching(false);
      }
    };

    if (searchMode === 'keyword') {
      executeKeywordSearch();
    }
  }, [debouncedKeyword, keywordChapterFilter, searchMode]);

  // ==========================================================================
  // DRILL-DOWN LOGIC: Fetch children level based on current path
  // ==========================================================================
  const loadDrilldownData = async (chapter: string, symptom: string, zusatz: string[]) => {
    setIsDrillLoading(true);
    setDrillError(null);
    setDrillFilterQuery(''); // reset local filter query on step change
    
    // Quick fallback check: If we are at root (no chapter selected) and options are empty, initialize fallback immediately
    if (!chapter && drillOptions.length === 0) {
      setDrillOptions(FALLBACK_CHAPTERS);
      setDrillLevelType('chapter');
      setDrillLevelIndex(-1);
    }

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const res = await fetch('/api/kent/drilldown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapter, symptom, zusatz }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }

        const data = await res.json();
        if (data.success) {
          setDrillLevelType(data.nextLevelType);
          setDrillLevelIndex(data.nextLevelIndex);
          setDrillOptions(data.nextOptions || []);
          setDrillRubrics(data.rubrics || []);
          setDrillError(null);
          setIsDrillLoading(false);
          return;
        } else {
          throw new Error(data.error || "Drilldown failed");
        }
      } catch (err: any) {
        console.warn(`[Kent Drilldown] Attempt ${attempts} failed:`, err.message || err);
        if (attempts < maxAttempts) {
          // brief pause before retry in case server/cache was warming up
          await new Promise(r => setTimeout(r, 600));
        } else {
          // If all attempts failed
          if (!chapter) {
            // At root chapter level, seamlessly fallback to the standard 37 chapters
            setDrillLevelType('chapter');
            setDrillLevelIndex(-1);
            setDrillOptions(FALLBACK_CHAPTERS);
            setDrillError(null);
          } else {
            setDrillError("Die Rubriken konnten nicht geladen werden. Bitte versuchen Sie es erneut.");
          }
        }
      }
    }
    setIsDrillLoading(false);
  };

  // Run drill-down fetch whenever path state changes
  useEffect(() => {
    if (searchMode === 'drilldown') {
      loadDrilldownData(drillChapter, drillSymptom, drillZusatz);
    }
  }, [drillChapter, drillSymptom, drillZusatz, searchMode]);

  // Back navigation for Drill-down
  const handleDrillBack = () => {
    if (drillZusatz.length > 0) {
      // pop last zusatz
      setDrillZusatz(prev => prev.slice(0, -1));
    } else if (drillSymptom) {
      setDrillSymptom('');
    } else if (drillChapter) {
      setDrillChapter('');
    }
  };

  // Reset drilldown to starting point (Chapters list)
  const handleDrillReset = () => {
    setDrillChapter('');
    setDrillSymptom('');
    setDrillZusatz([]);
  };

  // Click on a breadcrumb element to jump directly to that level
  const handleJumpToLevel = (levelType: 'chapters' | 'symptom' | number) => {
    if (levelType === 'chapters') {
      handleDrillReset();
    } else if (levelType === 'symptom') {
      setDrillZusatz([]);
    } else if (typeof levelType === 'number') {
      setDrillZusatz(prev => prev.slice(0, levelType + 1));
    }
  };

  // Select an option at the current drilldown level
  const handleSelectDrillOption = (option: string) => {
    if (drillLevelType === 'chapter') {
      setDrillChapter(option);
    } else if (drillLevelType === 'symptom') {
      setDrillSymptom(option);
    } else if (drillLevelType === 'zusatz') {
      setDrillZusatz(prev => [...prev, option]);
    }
  };

  // Filter local drilldown list options based on user text input
  const filteredDrillOptions = useMemo(() => {
    const query = drillFilterQuery.toLowerCase().trim();
    if (!query) return drillOptions;
    return drillOptions.filter(opt => opt.toLowerCase().includes(query));
  }, [drillOptions, drillFilterQuery]);

  // ==========================================================================
  // REPERTORISATION & CART LOGIC
  // ==========================================================================
  useEffect(() => {
    const calculateRepertorisation = async () => {
      if (selectedRubrics.length === 0) {
        setRemedyResults([]);
        return;
      }

      setIsRepertorizing(true);
      try {
        const res = await fetch('/api/kent/repertorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rubricIds: selectedRubrics.map(r => r.id)
          })
        });

        const data = await res.json();
        if (data.success && Array.isArray(data.results)) {
          setRemedyResults(data.results);
        } else {
          console.error("Repertorisation calculation failed:", data.error);
        }
      } catch (err) {
        console.error("Error calculating repertorisation:", err);
      } finally {
        setIsRepertorizing(false);
      }
    };

    calculateRepertorisation();
  }, [selectedRubrics]);

  // Add rubric to active list ("Cart")
  const handleAddRubric = (rubric: KentRubric) => {
    if (selectedRubrics.some(r => r.id === rubric.id)) return;
    setSelectedRubrics(prev => [...prev, rubric]);
  };

  // Remove rubric from active list
  const handleRemoveRubric = (rubricId: string) => {
    setSelectedRubrics(prev => prev.filter(r => r.id !== rubricId));
  };

  // Clear all selected items
  const handleClearAll = () => {
    setSelectedRubrics([]);
  };

  // Filtered remedies results for search field
  const filteredRemedies = useMemo(() => {
    const cleanFilter = remedyFilter.toLowerCase().trim();
    if (!cleanFilter) return remedyResults;
    return remedyResults.filter(
      r => r.remedyKey.toLowerCase().includes(cleanFilter) || 
           r.fullName.toLowerCase().includes(cleanFilter)
    );
  }, [remedyResults, remedyFilter]);

  // Save the full Kent Repertorization into the current patient case
  const handleSaveToCase = () => {
    if (!currentCase || !onSaveCase) return;

    const symptomTexts = selectedRubrics
      .map((r, idx) => `[Symptom ${idx + 1}] Kent-Rubrik: ${r.path} (${r.chapter})`)
      .join('\n');

    const topRemedy = remedyResults[0];
    
    const updatedCase: PatientCase = {
      ...currentCase as PatientCase,
      anamneseSymptome: currentCase.anamneseSymptome 
        ? `${currentCase.anamneseSymptome}\n\n[Kent-Repertorisation]\n${symptomTexts}`
        : `[Kent-Repertorisation]\n${symptomTexts}`,
      repertorisationErgebnis: topRemedy 
        ? topRemedy.remedyKey 
        : (currentCase.repertorisationErgebnis || ''),
      updatedAt: new Date().toISOString()
    };

    onSaveCase(updatedCase);
    
    setSaveMessage(`Repertorisation mit ${selectedRubrics.length} Rubriken wurde erfolgreich im Fall von ${currentCase.patientName || 'Patient'} gespeichert!`);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 5000);
  };

  // ==========================================================================
  // ARZNEIMITTEL-KLICK-HANDLER (MATERIA MEDICA POPUP)
  // ==========================================================================
  const handleRemedyClick = async (remedyKey: string, fullName: string) => {
    setSelectedRemedyForModal(null);
    setModalHistory([]);
    
    // 1. Check in local classical polychrests and Materia Medica database
    const cleanKey = remedyKey.toLowerCase().replace(/\./g, '').trim();
    const localizedList = getLocalizedRemedies(language);
    
    // Comprehensive mapping of homeopathic abbreviations and common synonyms to database IDs
    const ALIAS_ID_MAP: Record<string, string> = {
      'arg-n': 'argentum-nitricum',
      'argn': 'argentum-nitricum',
      'arg-m': 'argentum-metallicum',
      'argm': 'argentum-metallicum',
      'arg': 'argentum-metallicum',
      'aur-m': 'aurum-metallicum',
      'aur': 'aurum-metallicum',
      'calc-c': 'calcarea-carbonica',
      'calc-carb': 'calcarea-carbonica',
      'calc': 'calcarea-carbonica',
      'calc-p': 'calcarea-phosphorica',
      'calc-f': 'calcarea-fluorica',
      'mag-p': 'magnesia-phosphorica',
      'mag-phos': 'magnesia-phosphorica',
      'nat-m': 'natrium-muriaticum',
      'nat-mur': 'natrium-muriaticum',
      'nat-c': 'natrium-carbonicum',
      'nat-s': 'natrium-sulphuricum',
      'hep': 'hepar',
      'hepar-s': 'hepar',
      'kali-c': 'kali-carbonicum',
      'kali-b': 'kali-bichromicum',
      'kali-bi': 'kali-bichromicum',
      'kali-p': 'kali-phosphoricum',
      'kali-s': 'kali-sulphuricum',
      'carb-v': 'carbo-vegetabilis',
      'ant-t': 'antimonium-tartaricum',
      'ant-c': 'antimonium-crudum',
      'merc': 'mercurius',
      'merc-c': 'mercurius-corrosivus',
      'phos-ac': 'phosphoricum-acidum',
      'ph-ac': 'phosphoricum-acidum',
      'nit-ac': 'nitricum-acidum',
      'flu-ac': 'fluoricum-acidum',
      'ferr-m': 'ferrum-metallicum',
      'ferr-p': 'ferrum-phosphoricum',
      'zinc-m': 'zincum-metallicum',
      'zinc': 'zincum-metallicum',
      'plumb-m': 'plumbum-metallicum',
      'plumb': 'plumbum-metallicum',
      'plb': 'plumbum-metallicum',
      'bry': 'bryonia',
      'bryo': 'bryonia',
      'puls': 'pulsatilla',
      'ars': 'arsenicum-album',
      'ars-a': 'arsenicum-album',
      'lyc': 'lycopodium',
      'sep': 'sepia',
      'sil': 'silicea',
      'nux-v': 'nux-vomica',
      'nux': 'nux-vomica',
      'phos': 'phosphorus',
      'lach': 'lachesis',
      'gel': 'gelsemium',
      'gels': 'gelsemium',
      'thu': 'thuja',
      'thuj': 'thuja',
      'ign': 'ignatia',
      'arn': 'arnica',
      'hyp': 'hypericum',
      'cham': 'chamomilla',
      'apis': 'apis',
      'staph': 'staphisagria',
      'caust': 'causticum',
      'graph': 'graphites',
      'rhus-t': 'rhus-toxicodendron',
      'rhus-tox': 'rhus-toxicodendron',
      'rhus': 'rhus-toxicodendron',
      'chin': 'cinchona-officinalis',
      'china': 'cinchona-officinalis',
      'coloc': 'colocynthis',
      'dros': 'drosera',
      'dulc': 'dulcamara',
      'ham': 'hamamelis',
      'hyos': 'hyoscyamus',
      'iod': 'iodum',
      'ip': 'ipecacuanha',
      'kreos': 'kreosotum',
      'med': 'medorrhinum',
      'op': 'opium',
      'petr': 'petroleum',
      'plat': 'platinum-metallicum',
      'psor': 'psorinum',
      'pyrog': 'pyrogenium',
      'ruta': 'ruta-graveolens',
      'sabad': 'sabadilla',
      'sabin': 'sabina',
      'samb': 'sambucus-nigra',
      'sang': 'sanguinaria',
      'sec': 'secale-cornutum',
      'spong': 'spongia',
      'stann': 'stannum-metallicum',
      'stram': 'stramonium',
      'sulph': 'sulphur',
      'symph': 'symphytum',
      'syph': 'syphilinum',
      'tab': 'tabacum',
      'tarent': 'tarentula',
      'tub': 'tuberculinum',
      'verat': 'veratrum-album'
    };

    const normalize = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const normKey = normalize(remedyKey);
    const normFull = normalize(fullName);

    const targetIdFromAlias = ALIAS_ID_MAP[cleanKey.replace(/\s+/g, '-')] || ALIAS_ID_MAP[normKey];

    const matched = localizedList.find(r => {
      const normId = normalize(r.id);
      const normLatin = normalize(r.latinName);
      const normCommon = normalize(r.commonName);

      // Direct match with alias map
      if (targetIdFromAlias && (r.id === targetIdFromAlias || normId === normalize(targetIdFromAlias))) return true;

      // Exact match with full name or ID
      if (normFull && (normLatin === normFull || normId === normFull)) return true;

      // Exact match with key
      if (normKey && (normId === normKey || normLatin === normKey)) return true;

      // Substring / prefix matches for Latin names
      if (normFull && normFull.length >= 4 && (normLatin.startsWith(normFull) || normFull.startsWith(normLatin) || normLatin.includes(normFull))) return true;

      // Aliases in remedy
      if (r.aliases && r.aliases.some(a => {
        const na = normalize(a);
        return na === normKey || na === normFull;
      })) return true;

      // Common name match
      if (normCommon && normFull && normCommon === normFull) return true;

      return false;
    });

    if (matched) {
      setSelectedRemedyForModal(matched);
      return;
    }

    // 2. Immediate instant profile for repertory remedies without freezing UI
    const searchName = fullName || remedyKey;
    const instantRemedy: LocalizedRemedy = {
      id: cleanKey,
      latinName: searchName,
      categoryKey: 'other',
      commonName: remedyKey,
      category: 'Homöopathisches Arzneimittel',
      origin: 'Klassisches Repertorium nach J. T. Kent.',
      essence: `Arzneimittel ${searchName} aus dem Kent-Repertorium.`,
      mainIndications: [`Klinische Symptomrubriken im Kent-Repertorium (${remedyKey})`],
      keynotes: [`Symptomenrubriken im Repertorium unter ${remedyKey}`],
      mindEmotional: 'Charakteristisches Gemüts- und Allgemeinbild nach Kent.',
      modalitiesBetter: ['Individuelle Modalitäten nach Prüfung'],
      modalitiesWorse: ['Individuelle Verschlimmerungen nach Prüfung'],
      potenciesAndDosage: 'D6, D12, C30, C200, 1M',
      sphereOfAction: ['Organsysteme entsprechend Kent-Rubriken'],
      differentialRemedies: [],
      searchKeywords: []
    };
    setSelectedRemedyForModal(instantRemedy);

    // Optional background enhancement (non-blocking)
    try {
      const res = await fetch(`/api/medications/details?name=${encodeURIComponent(searchName)}&lang=${encodeURIComponent(language)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.details) {
          const d = data.details;
          setSelectedRemedyForModal(prev => {
            if (!prev || prev.id !== cleanKey) return prev;
            return {
              ...prev,
              origin: d.origin || d.monographText || prev.origin,
              essence: d.essence || d.monographText || prev.essence,
              mainIndications: Array.isArray(d.mainIndications) && d.mainIndications.length > 0 ? d.mainIndications : prev.mainIndications,
              keynotes: Array.isArray(d.keynotes) && d.keynotes.length > 0 ? d.keynotes : prev.keynotes,
              mindEmotional: d.mindEmotional || prev.mindEmotional,
              modalitiesBetter: Array.isArray(d.modalitiesBetter) && d.modalitiesBetter.length > 0 ? d.modalitiesBetter : prev.modalitiesBetter,
              modalitiesWorse: Array.isArray(d.modalitiesWorse) && d.modalitiesWorse.length > 0 ? d.modalitiesWorse : prev.modalitiesWorse,
              potenciesAndDosage: d.potenciesAndDosage || prev.potenciesAndDosage,
              sphereOfAction: Array.isArray(d.sphereOfAction) && d.sphereOfAction.length > 0 ? d.sphereOfAction : prev.sphereOfAction,
              differentialRemedies: Array.isArray(d.differentialRemedies) && d.differentialRemedies.length > 0 ? d.differentialRemedies : prev.differentialRemedies
            };
          });
        }
      }
    } catch {
      // Ignore background fetch error since instant profile is already displayed
    }
  };

  const handleCloseModal = () => {
    setSelectedRemedyForModal(null);
    setModalHistory([]);
  };

  const handleBackModal = () => {
    if (modalHistory.length === 0) return;
    const previous = modalHistory[modalHistory.length - 1];
    setModalHistory(prev => prev.slice(0, -1));
    setSelectedRemedyForModal(previous);
  };

  const handleNavigateToRemedy = (targetRemedy: LocalizedRemedy) => {
    if (selectedRemedyForModal) {
      setModalHistory(prev => [...prev, selectedRemedyForModal]);
    }
    setSelectedRemedyForModal(targetRemedy);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1">
      {/* SUCCESS BANNER */}
      {showSaveSuccess && (
        <div className="bg-teal-50 border border-teal-200 text-slate-900 p-4 rounded-xl flex items-start gap-3 animate-fadeIn shadow-xs">
          <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-medium leading-relaxed">{saveMessage}</p>
        </div>
      )}

      {/* MODE SELECTOR TABS */}
      <div className="flex border-b border-slate-200/80 gap-1">
        <button
          onClick={() => setSearchMode('drilldown')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            searchMode === 'drilldown' 
              ? 'border-teal-500 text-teal-800 bg-teal-50/20' 
              : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          {t('kentSwitchToDrilldown')}
        </button>
        <button
          onClick={() => setSearchMode('keyword')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            searchMode === 'keyword' 
              ? 'border-teal-500 text-teal-800 bg-teal-50/20' 
              : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Search className="w-4 h-4" />
          {t('kentSwitchToSearch')}
        </button>
      </div>

      {/* 3. MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT: Search / Drill-Down Area (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* DRILLDOWN TAB CONTAINER */}
          {searchMode === 'drilldown' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[480px]">
              
              {/* Dynamic Drilldown Header (Selected Path / Breadcrumbs) */}
              <div className="bg-slate-50/80 border-b border-slate-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('kentDrilldownPath')}
                  </span>
                  {(drillChapter || drillSymptom) && (
                    <button
                      onClick={handleDrillReset}
                      className="text-[10px] font-bold text-teal-600 hover:text-teal-800 transition-all cursor-pointer flex items-center gap-1"
                    >
                      {t('kentResetPath')}
                    </button>
                  )}
                </div>

                {/* Path Segment Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-700">
                  <button 
                    onClick={() => handleJumpToLevel('chapters')}
                    className="hover:text-teal-600 transition-all cursor-pointer text-slate-500 hover:underline"
                  >
                    Repertorium
                  </button>

                  {drillChapter && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <button 
                        onClick={() => handleJumpToLevel('chapters')}
                        className="hover:text-teal-600 transition-all cursor-pointer text-slate-800 hover:underline bg-slate-200/60 px-2 py-0.5 rounded"
                      >
                        {drillChapter}
                      </button>
                    </>
                  )}

                  {drillSymptom && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <button 
                        onClick={() => handleJumpToLevel('symptom')}
                        className="hover:text-teal-600 transition-all cursor-pointer text-slate-800 hover:underline bg-teal-50 px-2 py-0.5 rounded border border-teal-100"
                      >
                        {drillSymptom}
                      </button>
                    </>
                  )}

                  {drillZusatz.map((zus, idx) => (
                    <React.Fragment key={idx}>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <button 
                        onClick={() => handleJumpToLevel(idx)}
                        className="hover:text-teal-600 transition-all cursor-pointer text-slate-700 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[11px]"
                      >
                        {zus}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Drilldown body (List of options of the current level) */}
              <div className="p-5 flex-1 flex flex-col space-y-4">
                
                {/* Level Title and Back Button */}
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="w-4 h-4 text-teal-600" />
                    {drillLevelType === 'chapter' && t('kentChapterTitle')}
                    {drillLevelType === 'symptom' && t('kentSymptomTitle')}
                    {drillLevelType === 'zusatz' && t('kentZusatzTitle', { index: drillLevelIndex + 1 })}
                    {drillLevelType === 'none' && t('kentNoOptions')}
                  </h3>

                  {(drillChapter || drillSymptom) && (
                    <button
                      onClick={handleDrillBack}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-all px-2 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      {t('kentBackBtn')}
                    </button>
                  )}
                </div>

                {/* Filter box for current level options */}
                {drillLevelType !== 'none' && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t('kentFilterOptions')}
                      value={drillFilterQuery}
                      onChange={(e) => setDrillFilterQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 text-slate-800"
                    />
                    {drillFilterQuery && (
                      <button
                        onClick={() => setDrillFilterQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Loading indicator */}
                {isDrillLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <span className="text-xs font-semibold">{t('kentSearching')}</span>
                  </div>
                ) : drillError ? (
                  /* Error state with retry */
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-500">
                    <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
                    <p className="text-xs font-medium text-rose-700 mb-3">{drillError}</p>
                    <button
                      onClick={() => loadDrilldownData(drillChapter, drillSymptom, drillZusatz)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Erneut versuchen
                    </button>
                  </div>
                ) : drillLevelType === 'none' ? (
                  /* No more levels */
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <CheckCircle className="w-12 h-12 text-teal-500/80 mb-3" />
                    <h4 className="text-sm font-bold text-slate-700 mb-1">
                      Detailtiefe erreicht
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                      Für die ausgewählte Kombination existieren keine weiteren Zusatzangaben. Sie können passende Symptome in der rechten Spalte auswählen.
                    </p>
                  </div>
                ) : filteredDrillOptions.length === 0 ? (
                  /* Empty options under filter */
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <Info className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-xs">Keine Optionen entsprechen Ihrem Filter.</p>
                  </div>
                ) : (
                  /* List of options with click triggers */
                  <div className="flex-1 max-h-[360px] overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/50 p-2 grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1">
                    {filteredDrillOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelectDrillOption(option)}
                        className="p-3 text-left bg-white border border-slate-200/60 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:border-teal-500 hover:bg-teal-50/30 hover:text-teal-950 transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
                      >
                        <span className="truncate pr-2">{option}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KEYWORD SEARCH TAB CONTAINER */}
          {searchMode === 'keyword' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                {t('kentSearchLabel')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Search input (8 cols) */}
                <div className="sm:col-span-8 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('kentSearchPlaceholder')}
                    value={keywordQuery}
                    onChange={(e) => setKeywordQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800 font-medium"
                  />
                  {keywordQuery && (
                    <button
                      onClick={() => setKeywordQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Chapter filter (4 cols) */}
                <div className="sm:col-span-4 relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={keywordChapterFilter}
                    onChange={(e) => setKeywordChapterFilter(e.target.value)}
                    className="w-full pl-8 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none text-slate-700"
                  >
                    <option value="">{t('kentAllChapters')}</option>
                    {chapters.map((chap) => (
                      <option key={chap} value={chap}>{chap}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* SEARCH RESULTS CONTAINER FOR KEYWORD SEARCH */}
              {(isKeywordSearching || keywordResults.length > 0 || keywordSearchError) && (
                <div className="border border-slate-100 rounded-xl bg-slate-50 max-h-[360px] overflow-y-auto divide-y divide-slate-100 pr-1">
                  {isKeywordSearching && (
                    <div className="p-4 text-center text-xs sm:text-sm text-slate-500 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      {t('kentSearching')}
                    </div>
                  )}

                  {keywordSearchError && (
                    <div className="p-4 text-center text-xs text-rose-500 flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {keywordSearchError}
                    </div>
                  )}

                  {!isKeywordSearching && keywordResults.length === 0 && keywordQuery && (
                    <div className="p-4 text-center text-xs sm:text-sm text-slate-400">
                      {t('kentNoResults')}
                    </div>
                  )}

                  {!isKeywordSearching && keywordResults.map((rubric) => {
                    const isAlreadySelected = selectedRubrics.some(r => r.id === rubric.id);
                    return (
                      <div
                        key={rubric.id}
                        onClick={() => !isAlreadySelected && handleAddRubric(rubric)}
                        className={`p-3 hover:bg-teal-50/60 transition-all flex items-start justify-between gap-3 text-left ${
                          isAlreadySelected ? 'opacity-50 cursor-not-allowed bg-slate-100/50' : 'cursor-pointer group'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                              {rubric.chapter}
                            </span>
                            <span className="text-[10px] text-slate-400">ID: {rubric.id}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 font-medium group-hover:text-teal-950 leading-relaxed">
                            {rubric.path}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full group-hover:bg-teal-100 group-hover:text-teal-800 transition-all">
                            {rubric.remedyCount} Mittel
                          </span>
                          {!isAlreadySelected ? (
                            <button className="p-1 rounded-md bg-teal-100 text-teal-800 opacity-0 group-hover:opacity-100 transition-all">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-semibold px-1">Ausgewählt</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* KEYWORD DRILLDOWN MATCHING RUBRICS VIEWER (ONLY FOR DRILLDOWN MODE) */}
          {searchMode === 'drilldown' && (drillChapter || drillSymptom) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-600" />
                {t('kentMatchingRubricsTitle')} ({drillRubrics.length})
              </h4>
              
              {drillRubrics.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Keine Rubriken entsprechen dem Pfad.</p>
              ) : (
                <div className="border border-slate-100 rounded-xl bg-slate-50 max-h-[280px] overflow-y-auto divide-y divide-slate-150 pr-1">
                  {drillRubrics.map((rubric) => {
                    const isAlreadySelected = selectedRubrics.some(r => r.id === rubric.id);
                    return (
                      <div
                        key={rubric.id}
                        onClick={() => !isAlreadySelected && handleAddRubric(rubric)}
                        className={`p-3 transition-all flex items-start justify-between gap-3 text-left ${
                          isAlreadySelected ? 'opacity-55 cursor-not-allowed bg-slate-100/50' : 'hover:bg-teal-50/60 cursor-pointer group'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-slate-200 text-slate-600">ID: {rubric.id}</span>
                            <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[200px]">
                              {rubric.chapter} ➔ {rubric.symptom}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 font-semibold leading-relaxed group-hover:text-teal-950">
                            {rubric.path}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-center">
                          <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full group-hover:bg-teal-100 group-hover:text-teal-800 transition-all">
                            {rubric.remedyCount} Mittel
                          </span>
                          {!isAlreadySelected ? (
                            <button className="p-1 rounded-md bg-teal-150 text-teal-900 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold px-1">Ausgewählt</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SELECTED SYMPTOMS CART */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-600" />
                  {t('kentSelectedSymptoms')}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {selectedRubrics.length} Symptome in die Gewichtung einbezogen
                </p>
              </div>

              <div className="flex items-center gap-2">
                {currentCase && selectedRubrics.length > 0 && (
                  <button
                    onClick={handleSaveToCase}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {t('kentSaveRepertorisation')}
                  </button>
                )}
                {selectedRubrics.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 border border-rose-100 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('kentClearAllBtn')}
                  </button>
                )}
              </div>
            </div>

            {selectedRubrics.length === 0 ? (
              <div className="py-12 px-6 border-2 border-dashed border-slate-200 rounded-xl text-center">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700 font-serif mb-1">
                  Keine Symptome ausgewählt
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Navigieren Sie oben durch die Kapitel oder nutzen Sie die Freisuche, um Symptome durch Anklicken zur Repertorisation hinzuzufügen.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {selectedRubrics.map((rubric, idx) => (
                  <div
                    key={rubric.id}
                    className="flex items-start justify-between gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-left"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wider bg-teal-100 text-teal-800 uppercase">
                          Symptom {idx + 1}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wider bg-slate-200 text-slate-600 uppercase">
                          {rubric.chapter}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">ID: {rubric.id}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                        {rubric.path}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveRubric(rubric.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shrink-0 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GRAD LEGENDS */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
            <span className="text-[10px] uppercase text-slate-400 w-full mb-1">Graduierung nach Kent:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px]">1</span>
              <span>{t('kentGrade1Legend')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-blue-100 border border-blue-200 text-blue-800 flex items-center justify-center font-bold text-[10px]">2</span>
              <span>{t('kentGrade2Legend')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-teal-500 text-white flex items-center justify-center font-bold text-[10px]">3</span>
              <span>{t('kentGrade3Legend')}</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Repertorisation Result (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col h-full min-h-[500px]">
            
            <div className="border-b border-slate-100 pb-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
                  {t('kentRemediesResult')}
                </h3>
                {isRepertorizing && (
                  <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin shrink-0" />
                )}
              </div>

              {selectedRubrics.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('kentRemedySearchPlaceholder')}
                    value={remedyFilter}
                    onChange={(e) => setRemedyFilter(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 text-slate-700"
                  />
                  {remedyFilter && (
                    <button
                      onClick={() => setRemedyFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {selectedRubrics.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <FileSpreadsheet className="w-12 h-12 text-slate-200 mb-2" />
                <p className="text-xs max-w-[240px] leading-relaxed">
                  Wählen Sie mindestens ein Symptom aus, um die Repertorisation zu berechnen.
                </p>
              </div>
            ) : filteredRemedies.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <HelpCircle className="w-10 h-10 text-slate-200 mb-2" />
                <p className="text-xs">
                  Keine Arzneimittel entsprechen dem Suchfilter.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto max-h-[640px] divide-y divide-slate-100 pr-1">
                {filteredRemedies.map((result, idx) => (
                  <div
                    key={result.remedyKey}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left group hover:bg-slate-50/60 px-2 rounded-lg transition-all"
                  >
                    {/* Left: Remedy abbreviation & full name */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span 
                          onClick={() => handleRemedyClick(result.remedyKey, result.fullName)}
                          className="text-sm font-extrabold text-teal-800 bg-teal-50/60 px-2.5 py-0.5 rounded-full border border-teal-100/80 group-hover:bg-teal-100 transition-all cursor-pointer hover:underline"
                          title="Klicken für Materia Medica Monographie"
                        >
                          {result.remedyKey}
                        </span>
                        
                        <span className="text-[10px] font-bold text-slate-400">
                          #{idx + 1}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 font-semibold truncate max-w-[200px]" title={result.fullName}>
                        {result.fullName}
                      </p>
                    </div>

                    {/* Right: Scores & Matrix */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      {/* Matrix representation of grades for each selected rubric */}
                      <div className="flex items-center gap-1.5" title="Symptomdeckung Matrix (Reihenfolge der ausgewählten Symptome)">
                        {selectedRubrics.map((rubric) => {
                          const grade = result.gradesPerRubric[rubric.id] || 0;
                          return (
                            <span
                              key={rubric.id}
                              className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[9px] transition-all ${
                                grade === 3 
                                  ? 'bg-teal-500 text-white' 
                                  : grade === 2 
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                    : grade === 1 
                                      ? 'bg-slate-200 text-slate-700' 
                                      : 'bg-slate-100 text-slate-300 border border-dashed border-slate-200'
                              }`}
                              title={`${rubric.path}\nGrad: ${grade === 0 ? 'Nicht vorhanden' : grade}`}
                            >
                              {grade > 0 ? grade : '•'}
                            </span>
                          );
                        })}
                      </div>

                      {/* Coverage and Total points */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Coverage Badge */}
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">
                            {t('kentSymptomCoverage')}
                          </span>
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md mt-0.5">
                            {result.hits}/{result.totalSelectedRubrics}
                          </span>
                        </div>

                        {/* Total Score Badge */}
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">
                            {t('kentTotalScore')}
                          </span>
                          <span className="text-xs font-extrabold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-md mt-0.5">
                            {result.score}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* COMPREHENSIVE REMEDY MONOGRAPH MODAL (MATCHING POPUP DESIGN IN MATERIA MEDICA) */}
      <RemedyMonographModal
        isOpen={!!selectedRemedyForModal}
        remedy={selectedRemedyForModal}
        onClose={handleCloseModal}
        modalHistory={modalHistory}
        onBackModal={handleBackModal}
        onNavigateToRemedy={handleNavigateToRemedy}
      />

      {/* Live Loading Overlay */}
      {isLoadingRemedy && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-extrabold text-slate-700 tracking-wide">Materia Medica Steckbrief wird geladen...</span>
          </div>
        </div>
      )}

    </div>
  );
};
