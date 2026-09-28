import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation, useLanguage } from '../i18n/LanguageContext';
import { useMateriaMedica } from '../contexts/MateriaMedicaContext';
import { 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  X, 
  Trash2, 
  Sliders, 
  Layers, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw,
  CheckCircle2,
  Table,
  BarChart3,
  HelpCircle,
  Folder,
  FolderOpen,
  FileText,
  BookmarkPlus,
  Filter,
  Users
} from 'lucide-react';
import { 
  matchesAuthorFilter, 
  matchesAuthorFilters, 
  ClassicalAuthorFilterKey 
} from '../data/classicalAuthorsMap';
import { 
  BOERICKE_TREE_DATA, 
  SYMPTOM_PALETTE, 
  BoerickeCategoryNode, 
  SelectedRepertorySymptom, 
  BoerickeRepertoryRankResult,
  calculateBoerickeRepertorisation 
} from '../services/repertory/boerickeInteractiveRepertoryData';
import { SymptomWeightGrade } from '../services/boerickeRepertoryService';
import { RemedyMonographModal } from './RemedyMonographModal';
import { LocalizedRemedy } from '../data/materiaMedicaData';

interface KentRubricItem {
  id: string;
  chapter: string;
  chapterTranslated?: string;
  symptom: string;
  symptomTranslated?: string;
  zusatz: string[];
  zusatzTranslated?: string[];
  path: string;
  pathTranslated?: string;
  remedyCount: number;
  remedies?: Record<string, number>;
}

const ALIAS_ID_MAP: Record<string, string> = {
  'acon': 'aconitum-napellus',
  'agar': 'agaricus-muscarius',
  'alum': 'alumen',
  'alumn': 'alumen',
  'apis': 'apis-mellifica',
  'arn': 'arnica-montana',
  'ars': 'arsenicum-album',
  'ars-a': 'arsenicum-album',
  'bell': 'belladonna',
  'bry': 'bryonia-alba',
  'bryo': 'bryonia-alba',
  'calc': 'calcarea-carbonica',
  'calc-c': 'calcarea-carbonica',
  'calc-p': 'calcarea-phosphorica',
  'calc-s': 'calcarea-sulphurica',
  'cann-i': 'cannabis-indica',
  'cann-s': 'cannabis-sativa',
  'canth': 'cantharis',
  'carb-v': 'carbo-vegetabilis',
  'caust': 'causticum',
  'cham': 'chamomilla',
  'chin': 'cinchona-officinalis',
  'china': 'cinchona-officinalis',
  'coloc': 'colocynthis',
  'dros': 'drosera',
  'dulc': 'dulcamara',
  'ferr': 'ferrum-metallicum',
  'ferr-m': 'ferrum-metallicum',
  'ferr-p': 'ferrum-phosphoricum',
  'gels': 'gelsemium-sempervirens',
  'gel': 'gelsemium-sempervirens',
  'graph': 'graphites',
  'ham': 'hamamelis-virginiana',
  'hep': 'hepar-sulfuris',
  'hyos': 'hyoscyamus-niger',
  'ign': 'ignatia-amara',
  'iod': 'iodum',
  'ip': 'ipecacuanha',
  'kali-ar': 'kali-arsenicosum',
  'kali-bi': 'kali-bichromicum',
  'kali-c': 'kali-carbonicum',
  'kali-p': 'kali-phosphoricum',
  'kali-s': 'kali-sulphuricum',
  'kreos': 'kreosotum',
  'lach': 'lachesis-muta',
  'led': 'ledum-palustre',
  'lyc': 'lycopodium-clavatum',
  'mag-c': 'magnesia-carbonica',
  'mag-m': 'magnesia-muriatica',
  'mag-p': 'magnesium-phosphoricum',
  'med': 'medorrhinum',
  'merc': 'mercurius-solubilis',
  'merc-c': 'mercurius-corrosivus',
  'mez': 'mezereum',
  'nat-c': 'natrium-carbonicum',
  'nat-m': 'natrium-muriaticum',
  'nat-s': 'natrium-sulphuricum',
  'nit-ac': 'nitricum-acidum',
  'nux-v': 'nux-vomica',
  'nux': 'nux-vomica',
  'op': 'opium',
  'petr': 'petroleum',
  'ph-ac': 'phosphoricum-acidum',
  'phos': 'phosphorus',
  'plat': 'platinum-metallicum',
  'plb': 'plumbum-metallicum',
  'psor': 'psorinum',
  'puls': 'pulsatilla-pratensis',
  'pyrog': 'pyrogenium',
  'rhus-t': 'rhus-toxicodendron',
  'ruta': 'ruta-graveolens',
  'sabad': 'sabadilla',
  'sabin': 'sabina',
  'samb': 'sambucus-nigra',
  'sang': 'sanguinaria-canadensis',
  'sec': 'secale-cornutum',
  'sep': 'sepia-officinalis',
  'sil': 'silicea',
  'spig': 'spigelia-anthelmia',
  'spong': 'spongia-tosta',
  'stann': 'stannum-metallicum',
  'staph': 'staphisagria',
  'stram': 'stramonium',
  'sulph': 'sulfur',
  'sulf': 'sulfur',
  'symph': 'symphytum-officinale',
  'syph': 'syphilinum',
  'tab': 'tabacum',
  'tarent': 'tarentula-hispanica',
  'thuj': 'thuja-occidentalis',
  'thu': 'thuja-occidentalis',
  'tub': 'tuberculinum',
  'verat': 'veratrum-album',
  'zinc': 'zincum-metallicum'
};

const FALLBACK_KENT_CHAPTERS = [
  "Allgemeines", "Atmung", "Auge", "Auswurf", "Bauch", "Blase", "Brust",
  "Extremitäten", "Fieber", "Frost", "Gehör", "Gemüt",
  "Geschlechtsorgane männlich", "Geschlechtsorgane weiblich", "Gesicht",
  "Hals", "Hals-Außenseite", "Harnröhre", "Haut", "Husten",
  "Kehlkopf und Luftröhre", "Kopf", "Magen", "Mastdarm", "Mund",
  "Nase", "Nieren", "Ohr", "Prostata", "Rücken", "Schlaf",
  "Schweiß", "Schwindel", "Sehen", "Stuhl", "Urin", "Zähne"
];

interface BoerickeRepertoryWizardViewProps {
  onSelectRemedyForCase?: (remedyName: string, potency: string) => void;
  onGoToMateriaMedica?: () => void;
}

export const BoerickeRepertoryWizardView: React.FC<BoerickeRepertoryWizardViewProps> = ({
  onSelectRemedyForCase,
  onGoToMateriaMedica
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { allRemedies } = useMateriaMedica();

  // Wizard Stage State: 1 = Symptome wählen, 2 = Gewichtung, 3 = Repertorisation & Analyse
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Selected Symptoms (Repertory Basket) - start empty as requested
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedRepertorySymptom[]>([]);

  // Tree expanded state
  const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>({});
  const [treeLoading, setTreeLoading] = useState<Record<string, boolean>>({});
  const [treeChildren, setTreeChildren] = useState<Record<string, {
    options: string[];
    translatedOptions: Record<string, string>;
    rubrics: KentRubricItem[];
    nextLevelType?: string;
  }>>({});

  // Search filter inside tree & tab mode
  const [treeSearchQuery, setTreeSearchQuery] = useState('');
  const [activeTabMode, setActiveTabMode] = useState<'tree' | 'steps' | 'search' | 'favorites'>('tree');

  // Stufen-Drilldown State (wie bei der Repertory-Seite)
  const [chapters, setChapters] = useState<string[]>(FALLBACK_KENT_CHAPTERS);
  const [chapterTranslations, setChapterTranslations] = useState<Record<string, string>>({});
  const [drillChapter, setDrillChapter] = useState<string>('');
  const [drillSymptom, setDrillSymptom] = useState<string>('');
  const [drillZusatz, setDrillZusatz] = useState<string[]>([]);
  const [drillLevelType, setDrillLevelType] = useState<string>('chapter');
  const [drillLevelIndex, setDrillLevelIndex] = useState<number>(-1);
  const [drillOptions, setDrillOptions] = useState<string[]>(FALLBACK_KENT_CHAPTERS);
  const [drillTranslatedOptions, setDrillTranslatedOptions] = useState<Record<string, string>>({});
  const [drillPathTranslations, setDrillPathTranslations] = useState<Record<string, string>>({});
  const [drillRubrics, setDrillRubrics] = useState<KentRubricItem[]>([]);
  const [isDrillLoading, setIsDrillLoading] = useState(false);
  const [drillFilterQuery, setDrillFilterQuery] = useState('');

  // Live search state
  const [keywordResults, setKeywordResults] = useState<KentRubricItem[]>([]);
  const [isKeywordSearching, setIsKeywordSearching] = useState(false);

  // Selected Remedy for Monograph Modal
  const [monographRemedy, setMonographRemedy] = useState<LocalizedRemedy | null>(null);

  // Result Sub-Tab: 'ergebnis' | 'matrix' | 'vergleich'
  const [resultSubTab, setResultSubTab] = useState<'ergebnis' | 'matrix' | 'vergleich' | 'analyse'>('ergebnis');
  const [selectedTopRemedyKey, setSelectedTopRemedyKey] = useState<string>('nux-vomica');

  // Filter by classical authors (Multi-select)
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

  const authors = [
    { key: 'all' as ClassicalAuthorFilterKey, label: t('filterAuthorAll') },
    { key: 'hahnemann' as ClassicalAuthorFilterKey, label: t('filterAuthorHahnemann') },
    { key: 'kent' as ClassicalAuthorFilterKey, label: t('filterAuthorKent') },
    { key: 'hering' as ClassicalAuthorFilterKey, label: t('filterAuthorHering') },
    { key: 'boericke' as ClassicalAuthorFilterKey, label: t('filterAuthorBoericke') },
    { key: 'boger' as ClassicalAuthorFilterKey, label: t('filterAuthorBoger') },
    { key: 'allen' as ClassicalAuthorFilterKey, label: t('filterAuthorAllen') }
  ];

  // Calculation of Repertorisation
  const calculationResults = useMemo(() => {
    return calculateBoerickeRepertorisation(selectedSymptoms, allRemedies, selectedAuthors);
  }, [selectedSymptoms, allRemedies, selectedAuthors]);

  // Fetch chapters list on mount / language switch
  useEffect(() => {
    let isCancelled = false;
    const fetchChapters = async () => {
      try {
        const res = await fetch('/api/kent/drilldown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lang: language })
        });
        const data = await res.json();
        if (!isCancelled && data.success && Array.isArray(data.nextOptions)) {
          setChapters(data.nextOptions);
          if (data.translatedOptions) {
            setChapterTranslations(data.translatedOptions);
          }
        }
      } catch {
        if (!isCancelled) {
          setChapters(FALLBACK_KENT_CHAPTERS);
        }
      }
    };
    fetchChapters();
    return () => { isCancelled = true; };
  }, [language]);

  // Load drilldown data for Stufenansicht
  const loadDrilldownData = async (chap: string, sym: string, zus: string[]) => {
    setIsDrillLoading(true);
    setDrillFilterQuery('');

    if (!chap && drillOptions.length === 0) {
      setDrillOptions(chapters.length > 0 ? chapters : FALLBACK_KENT_CHAPTERS);
      setDrillLevelType('chapter');
      setDrillLevelIndex(-1);
    }

    try {
      const res = await fetch('/api/kent/drilldown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter: chap || undefined,
          symptom: sym || undefined,
          zusatz: zus.length > 0 ? zus : undefined,
          lang: language
        })
      });
      const data = await res.json();
      if (data.success) {
        setDrillLevelType(data.nextLevelType || 'none');
        setDrillLevelIndex(typeof data.nextLevelIndex === 'number' ? data.nextLevelIndex : -1);
        setDrillOptions(data.nextOptions || []);
        if (data.translatedOptions) {
          setDrillTranslatedOptions(prev => ({ ...prev, ...data.translatedOptions }));
        }
        if (data.pathTranslations) {
          setDrillPathTranslations(prev => ({ ...prev, ...data.pathTranslations }));
        }
        setDrillRubrics(data.rubrics || []);
      }
    } catch (err) {
      console.error('Error loading drilldown:', err);
    } finally {
      setIsDrillLoading(false);
    }
  };

  // Trigger drilldown data load on path or language changes
  useEffect(() => {
    loadDrilldownData(drillChapter, drillSymptom, drillZusatz);
  }, [drillChapter, drillSymptom, drillZusatz, language]);

  // Live free keyword search
  useEffect(() => {
    if (!treeSearchQuery.trim()) {
      setKeywordResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsKeywordSearching(true);
      try {
        const res = await fetch(`/api/kent/search?q=${encodeURIComponent(treeSearchQuery.trim())}&limit=80&lang=${encodeURIComponent(language)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.rubrics)) {
          setKeywordResults(data.rubrics);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsKeywordSearching(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [treeSearchQuery, language]);

  // Stage selection handlers for Stufenansicht
  const handleSelectDrillOption = (option: string) => {
    if (drillLevelType === 'chapter') {
      setDrillChapter(option);
      setDrillSymptom('');
      setDrillZusatz([]);
    } else if (drillLevelType === 'symptom') {
      setDrillSymptom(option);
      setDrillZusatz([]);
    } else if (drillLevelType === 'zusatz') {
      setDrillZusatz(prev => [...prev, option]);
    }
  };

  const handleDrillBack = () => {
    if (drillZusatz.length > 0) {
      setDrillZusatz(prev => prev.slice(0, -1));
    } else if (drillSymptom) {
      setDrillSymptom('');
    } else if (drillChapter) {
      setDrillChapter('');
    }
  };

  const handleDrillReset = () => {
    setDrillChapter('');
    setDrillSymptom('');
    setDrillZusatz([]);
    setDrillFilterQuery('');
  };

  const handleJumpToLevel = (target: 'root' | 'chapters' | 'chapter' | 'symptom' | number) => {
    if (target === 'root' || target === 'chapters') {
      handleDrillReset();
    } else if (target === 'chapter') {
      setDrillSymptom('');
      setDrillZusatz([]);
      setDrillFilterQuery('');
    } else if (target === 'symptom') {
      setDrillZusatz([]);
      setDrillFilterQuery('');
    } else if (typeof target === 'number') {
      setDrillZusatz(prev => prev.slice(0, target + 1));
      setDrillFilterQuery('');
    }
  };

  // Title of the current drilldown stage in Stufenansicht (Stufe 1, 2, 3, 4, 5, 6...)
  const drillLevelTitle = useMemo(() => {
    if (drillLevelType === 'chapter') {
      return t('kentChapterTitle') || 'Stufe 1: Kapitel auswählen';
    }
    if (drillLevelType === 'symptom') {
      return t('kentSymptomTitle') || 'Stufe 2: Hauptsymptom auswählen';
    }
    if (drillLevelType === 'zusatz') {
      const zusatzIndex = drillZusatz.length;
      return t('kentZusatzTitle', { index: zusatzIndex + 1 }) || `Stufe ${zusatzIndex + 3}: Zusatz / Modalität auswählen`;
    }
    return t('kentDepthReached') || 'Maximale Tiefe erreicht';
  }, [drillLevelType, drillZusatz, t]);

  // Filtered options in the current drilldown stage
  const filteredDrillOptions = useMemo(() => {
    if (!drillFilterQuery.trim()) return drillOptions;
    const q = drillFilterQuery.toLowerCase();
    return drillOptions.filter(opt => {
      const trans = (drillTranslatedOptions[opt] || chapterTranslations[opt] || opt).toLowerCase();
      return trans.includes(q) || opt.toLowerCase().includes(q);
    });
  }, [drillOptions, drillFilterQuery, drillTranslatedOptions, chapterTranslations]);

  // Handpicked clinical favorites from Kent rubrics
  const favoriteRubrics = useMemo<KentRubricItem[]>(() => {
    return [
      { id: 'fav-1', chapter: 'Magen', symptom: 'Schmerz', zusatz: ['brennend'], path: 'Magen, Schmerz, brennend', remedyCount: 84 },
      { id: 'fav-2', chapter: 'Magen', symptom: 'Schmerz', zusatz: ['krampfartig'], path: 'Magen, Schmerz, krampfartig', remedyCount: 78 },
      { id: 'fav-3', chapter: 'Gemüt', symptom: 'Furcht', zusatz: ['Tod, vor dem'], path: 'Gemüt, Furcht, Tod, vor dem', remedyCount: 65 },
      { id: 'fav-4', chapter: 'Kopf', symptom: 'Schmerz', zusatz: ['pulsierend'], path: 'Kopf, Schmerz, pulsierend', remedyCount: 92 },
      { id: 'fav-5', chapter: 'Allgemeines', symptom: 'Schwäche', zusatz: ['plötzlich'], path: 'Allgemeines, Schwäche, plötzlich', remedyCount: 45 },
      { id: 'fav-6', chapter: 'Schlaf', symptom: 'Schlaflosigkeit', zusatz: ['Mitternacht, nach'], path: 'Schlaf, Schlaflosigkeit, Mitternacht, nach', remedyCount: 52 },
      { id: 'fav-7', chapter: 'Hals', symptom: 'Schmerz', zusatz: ['Schlucken, beim'], path: 'Hals, Schmerz, Schlucken, beim', remedyCount: 68 },
      { id: 'fav-8', chapter: 'Haut', symptom: 'Jucken', zusatz: ['Bettwärme, durch'], path: 'Haut, Jucken, Bettwärme, durch', remedyCount: 54 }
    ];
  }, []);

  // Universal rubric adder
  const handleAddRubric = (item: any, parentPath: string = '') => {
    const rubricId = String(item.id || item.rubricKey || `rub-${Date.now()}`);
    const exists = selectedSymptoms.some(s => s.rubricId === rubricId);
    if (exists) return;

    const rubricPath = item.pathTranslated || item.path || parentPath || 'Repertorium';
    const rubricTitle = item.symptomTranslated || item.symptom || item.name || rubricPath;

    const remedyGrades: Record<string, SymptomWeightGrade> = {};

    if (item.remedies && typeof item.remedies === 'object') {
      Object.entries(item.remedies).forEach(([k, g]) => {
        const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const mappedKey = ALIAS_ID_MAP[cleanKey] || cleanKey;
        remedyGrades[mappedKey] = Math.min(4, Math.max(1, Number(g))) as SymptomWeightGrade;
      });
    } else if (item.remedyGrades) {
      Object.entries(item.remedyGrades).forEach(([k, g]) => {
        const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        const mappedKey = ALIAS_ID_MAP[cleanKey] || cleanKey;
        remedyGrades[mappedKey] = Math.min(4, Math.max(1, Number(g))) as SymptomWeightGrade;
      });
    }

    const newSymptom: SelectedRepertorySymptom = {
      id: `sym-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      rubricId,
      rubricName: rubricTitle,
      path: rubricPath,
      chapter: item.chapterTranslated || item.chapter || (rubricPath.includes('>') ? rubricPath.split('>')[0].trim() : 'Repertorium'),
      weight: 1,
      patientNote: rubricPath,
      color: '#0f766e',
      remedyGrades
    };

    setSelectedSymptoms(prev => [...prev, newSymptom]);
  };

  // Remove symptom
  const handleRemoveSymptom = (id: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s.id !== id));
  };

  // Clear all
  const handleClearAll = () => {
    setSelectedSymptoms([]);
  };

  // Update symptom weight
  const handleUpdateWeight = (id: string, weight: number) => {
    setSelectedSymptoms(prev => prev.map(s => s.id === id ? { ...s, weight } : s));
  };

  // Update symptom custom patient note
  const handleUpdateNote = (id: string, note: string) => {
    setSelectedSymptoms(prev => prev.map(s => s.id === id ? { ...s, patientNote: note } : s));
  };

  // Active top remedy for detail view
  const currentDetailRemedy = useMemo(() => {
    if (!calculationResults.length) return null;
    const found = calculationResults.find(r => r.remedyKey === selectedTopRemedyKey);
    return found || calculationResults[0];
  }, [calculationResults, selectedTopRemedyKey]);

  // Find local remedy object for Materia Medica modal
  const openMonographModalForKey = (key: string) => {
    const remedyObj = allRemedies.find(r => r.id === key);
    if (remedyObj) {
      setMonographRemedy(remedyObj);
    }
  };

  // Dynamic Tree Node Renderer for Baumansicht (supporting all 5-6 stages just like Repertory)
  const renderKentTreeNode = (chapter: string, symptom?: string, zusatz: string[] = [], depth: number = 0, explicitTranslatedLabel?: string) => {
    const nodeKey = [chapter, symptom, ...zusatz].filter(Boolean).join('::');
    const isExpanded = Boolean(treeExpanded[nodeKey]);
    const isLoading = Boolean(treeLoading[nodeKey]);
    const childrenData = treeChildren[nodeKey];

    let rawLabel = '';
    if (zusatz.length > 0) {
      rawLabel = zusatz[zusatz.length - 1];
    } else if (symptom) {
      rawLabel = symptom;
    } else {
      rawLabel = chapter;
    }

    const translatedLabel = explicitTranslatedLabel
      || (childrenData?.translatedOptions && childrenData.translatedOptions[rawLabel]) 
      || drillPathTranslations[rawLabel]
      || drillTranslatedOptions[rawLabel] 
      || chapterTranslations[rawLabel] 
      || rawLabel;

    const handleToggle = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const nextState = !isExpanded;
      setTreeExpanded(prev => ({ ...prev, [nodeKey]: nextState }));

      if (nextState && !childrenData && !isLoading) {
        setTreeLoading(prev => ({ ...prev, [nodeKey]: true }));
        try {
          const res = await fetch('/api/kent/drilldown', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chapter,
              symptom: symptom || undefined,
              zusatz: zusatz.length > 0 ? zusatz : undefined,
              lang: language
            })
          });
          const data = await res.json();
          if (data.success) {
            if (data.translatedOptions) {
              setDrillTranslatedOptions(prev => ({ ...prev, ...data.translatedOptions }));
            }
            if (data.pathTranslations) {
              setDrillPathTranslations(prev => ({ ...prev, ...data.pathTranslations }));
            }
            setTreeChildren(prev => ({
              ...prev,
              [nodeKey]: {
                options: data.nextOptions || [],
                translatedOptions: data.translatedOptions || {},
                rubrics: data.rubrics || [],
                nextLevelType: data.nextLevelType
              }
            }));
          }
        } catch (err) {
          console.error('Error fetching tree branch:', err);
        } finally {
          setTreeLoading(prev => ({ ...prev, [nodeKey]: false }));
        }
      }
    };

    return (
      <div key={nodeKey} className="space-y-1">
        <button
          type="button"
          onClick={handleToggle}
          className="w-full flex items-center justify-between py-1.5 px-2 rounded-xl text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 truncate min-w-0 pr-2">
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-teal-700 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <span className="truncate">{translatedLabel}</span>
          </div>
        </button>

        {isExpanded && childrenData && (
          <div className="pl-3.5 border-l border-slate-200 ml-2.5 space-y-1">
            {/* Sub-level options for deeper stages (Stufe 2, 3, 4, 5, 6, ...) */}
            {childrenData.options.map(opt => {
              const optTrans = childrenData.translatedOptions?.[opt] || drillTranslatedOptions[opt];
              if (!symptom) {
                return renderKentTreeNode(chapter, opt, [], depth + 1, optTrans);
              } else {
                return renderKentTreeNode(chapter, symptom, [...zusatz, opt], depth + 1, optTrans);
              }
            })}

            {/* Rubrics at this level with Mittel count and + button - only show terminating rubrics at this exact depth so each appears only once! */}
            {symptom && childrenData.rubrics && childrenData.rubrics.length > 0 && (() => {
              const currentDepth = zusatz.length;
              const terminatingRubrics = childrenData.rubrics.filter(r => {
                const rZusatzLen = (r.zusatz || []).length;
                if (childrenData.options.length === 0) {
                  return true;
                }
                return rZusatzLen === currentDepth;
              });

              if (terminatingRubrics.length === 0) return null;

              return (
                <div className="space-y-1 pt-1">
                  {terminatingRubrics.map(rubric => {
                    const isSelected = selectedSymptoms.some(s => s.rubricId === String(rubric.id));
                    const rubricPath = rubric.pathTranslated || rubric.path;
                    const rubricTitle = (rubric.zusatz && rubric.zusatz.length > 0)
                      ? (rubric.zusatzTranslated ? rubric.zusatzTranslated.join(', ') : rubric.zusatz.join(', '))
                      : (rubric.symptomTranslated || rubric.symptom || rubricPath);

                    return (
                      <div
                        key={rubric.id}
                        className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl text-xs transition-colors group ${
                          isSelected 
                            ? 'bg-teal-50/80 border border-teal-200 text-teal-900 font-semibold' 
                            : 'hover:bg-slate-100/90 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-teal-600' : 'bg-slate-300 group-hover:bg-teal-600'}`} />
                            <span className="truncate font-medium">{rubricTitle}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal truncate pl-3.5" title={rubricPath}>
                            {rubricPath}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {rubric.remedyCount > 0 && (
                            <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.2 rounded bg-slate-100">
                              {rubric.remedyCount} {t('repertoriumRemediesUnit') || 'Mittel'}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => isSelected ? handleRemoveSymptom(selectedSymptoms.find(s => s.rubricId === String(rubric.id))!.id) : handleAddRubric(rubric, rubricPath)}
                            className={`p-1 rounded-lg transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-rose-100 hover:bg-rose-200 text-rose-700' 
                                : 'bg-teal-700 hover:bg-teal-800 text-white'
                            }`}
                            title={isSelected ? t('repertoryRemoveSymptom') : t('repertoryAddSymptom')}
                          >
                            {isSelected ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {childrenData.options.length === 0 && (!childrenData.rubrics || childrenData.rubrics.length === 0) && (
              <div className="py-1 px-2 text-[11px] text-slate-400 italic">
                {t('kentDepthReachedDesc') || 'Keine weiteren Unterstufen auf dieser Ebene.'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="boericke-wizard-root" className="w-full space-y-6">
      {/* 1. TOP PROCESS NAVIGATION BAR (4-Step Boericke Process Flow) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Step 1: Symptome wählen */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-teal-700 text-white border-teal-800 shadow-xs ring-1 ring-teal-800'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep === 1 ? 'bg-white text-teal-800' : selectedSymptoms.length > 0 ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'
            }`}>
              1
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold opacity-75">
                {t('repertoryStepLabel' as any) || 'Schritt 1'} {selectedSymptoms.length > 0 ? `(${selectedSymptoms.length})` : ''}
              </div>
              <div className="text-xs font-bold truncate">{t('repertoryStep1Title' as any) || 'Fallaufnahme & Suche'}</div>
            </div>
          </button>

          {/* Step 2: Repertorisation (Rangliste) */}
          <button
            type="button"
            onClick={() => {
              if (selectedSymptoms.length > 0) {
                setCurrentStep(3);
                setResultSubTab('ergebnis');
              }
            }}
            disabled={selectedSymptoms.length === 0}
            className={`flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl border text-left transition-all ${
              currentStep === 3 && resultSubTab === 'ergebnis'
                ? 'bg-teal-700 text-white border-teal-800 shadow-xs ring-1 ring-teal-800 cursor-pointer'
                : selectedSymptoms.length > 0
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 cursor-pointer'
                : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep === 3 && resultSubTab === 'ergebnis' ? 'bg-white text-teal-800' : 'bg-slate-200 text-slate-700'
            }`}>
              2
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold opacity-75">{t('repertoryStepLabel' as any) || 'Schritt 2'}</div>
              <div className="text-xs font-bold truncate">{t('repertoryStep4Title' as any) || 'Repertorisation'}</div>
            </div>
          </button>

          {/* Step 3: Rubriken-Matrix */}
          <button
            type="button"
            onClick={() => {
              if (selectedSymptoms.length > 0) {
                setCurrentStep(3);
                setResultSubTab('matrix');
              }
            }}
            disabled={selectedSymptoms.length === 0}
            className={`flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl border text-left transition-all ${
              currentStep === 3 && resultSubTab === 'matrix'
                ? 'bg-teal-700 text-white border-teal-800 shadow-xs ring-1 ring-teal-800 cursor-pointer'
                : selectedSymptoms.length > 0
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 cursor-pointer'
                : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep === 3 && resultSubTab === 'matrix' ? 'bg-white text-teal-800' : 'bg-slate-200 text-slate-700'
            }`}>
              3
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold opacity-75">{t('repertoryStepLabel' as any) || 'Schritt 3'}</div>
              <div className="text-xs font-bold truncate">{t('repertoryStep5Title' as any) || 'Rubriken-Matrix'}</div>
            </div>
          </button>

          {/* Step 4: Materia Medica Detail */}
          <button
            type="button"
            onClick={() => {
              if (selectedSymptoms.length > 0) {
                setCurrentStep(3);
                setResultSubTab('vergleich');
              }
            }}
            disabled={selectedSymptoms.length === 0}
            className={`flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl border text-left transition-all ${
              currentStep === 3 && resultSubTab === 'vergleich'
                ? 'bg-teal-700 text-white border-teal-800 shadow-xs ring-1 ring-teal-800 cursor-pointer'
                : selectedSymptoms.length > 0
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 cursor-pointer'
                : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep === 3 && resultSubTab === 'vergleich' ? 'bg-white text-teal-800' : 'bg-slate-200 text-slate-700'
            }`}>
              4
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold opacity-75">{t('repertoryStepLabel' as any) || 'Schritt 4'}</div>
              <div className="text-xs font-bold truncate">{t('repertoryStep6Title' as any) || 'Materia Medica'}</div>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STUFE 1: SYMPTOME EINGEBEN & AUSWÄHLEN (Baumansicht + Gesammelte Liste) */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Linke Spalte: Symptome eingeben & Baumansicht (7 cols auf lg) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 md:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {t('repertorySymptomInputTitle' as any) || 'Symptome eingeben'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t('repertorySymptomInputSubtitle' as any) || 'Repertorium nach William Boericke durchsuchen'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Suchleiste */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={treeSearchQuery}
                  onChange={(e) => setTreeSearchQuery(e.target.value)}
                  placeholder={t('repertorySearchPlaceholder' as any) || 'z. B. Stomach pain, cold, evening, nausea ...'}
                  className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
                />
                {treeSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setTreeSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Tabs: Baumansicht, Stufenansicht, Suche, Favoriten */}
              <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTabMode('tree')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTabMode === 'tree'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>{t('repertoryTabTreeView')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabMode('steps')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTabMode === 'steps'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>{t('repertoryTabSteps')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabMode('search')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTabMode === 'search'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{t('repertoryTabSearch')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabMode('favorites')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTabMode === 'favorites'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('repertoryTabFavorites')}</span>
                </button>
              </div>

              {/* TAB 1: BAUMANSICHT (dynamisch über alle 5-6 Stufen wie bei Repertory) */}
              {activeTabMode === 'tree' && !treeSearchQuery && (
                <div className="max-h-[500px] overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/40 animate-in fade-in duration-150">
                  {chapters.map(chap => renderKentTreeNode(chap, undefined, [], 0))}
                </div>
              )}

              {/* TAB 2: STUFENANSICHT (geführt über alle 5-6 Stufen wie bei Repertory) */}
              {activeTabMode === 'steps' && !treeSearchQuery && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  {/* Stufen-Pfad (Breadcrumbs) */}
                  <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {t('kentDrilldownPath') || 'Pfad:'}
                      </span>
                      {(drillChapter || drillSymptom) && (
                        <button
                          type="button"
                          onClick={handleDrillReset}
                          className="text-[10px] font-bold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{t('kentResetPath') || 'Pfad zurücksetzen'}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold text-slate-700">
                      <button
                        type="button"
                        onClick={() => handleJumpToLevel('root')}
                        className={`transition-colors cursor-pointer px-2 py-0.5 rounded text-[11px] ${
                          !drillChapter
                            ? 'bg-teal-700 text-white font-bold'
                            : 'text-slate-600 hover:text-teal-800 hover:bg-slate-200/60'
                        }`}
                      >
                        {t('repertoryRootPath') || 'Repertorium'}
                      </button>

                      {drillChapter && (
                        <>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <button
                            type="button"
                            onClick={() => handleJumpToLevel('chapter')}
                            className={`transition-colors cursor-pointer px-2 py-0.5 rounded truncate max-w-[160px] text-[11px] ${
                              !drillSymptom
                                ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                                : 'text-slate-600 hover:text-teal-800 hover:bg-slate-200/60'
                            }`}
                          >
                            {drillPathTranslations[drillChapter] || chapterTranslations[drillChapter] || drillTranslatedOptions[drillChapter] || drillChapter}
                          </button>
                        </>
                      )}

                      {drillSymptom && (
                        <>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <button
                            type="button"
                            onClick={() => handleJumpToLevel('symptom')}
                            className={`transition-colors cursor-pointer px-2 py-0.5 rounded truncate max-w-[160px] text-[11px] ${
                              drillZusatz.length === 0
                                ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                                : 'text-slate-600 hover:text-teal-800 hover:bg-slate-200/60'
                            }`}
                          >
                            {drillPathTranslations[drillSymptom] || drillTranslatedOptions[drillSymptom] || drillSymptom}
                          </button>
                        </>
                      )}

                      {drillZusatz.map((zus, idx) => {
                        const isLast = idx === drillZusatz.length - 1;
                        return (
                          <React.Fragment key={idx}>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <button
                              type="button"
                              onClick={() => handleJumpToLevel(idx)}
                              className={`transition-colors cursor-pointer px-2 py-0.5 rounded truncate max-w-[160px] text-[11px] ${
                                isLast
                                  ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                                  : 'text-slate-600 hover:text-teal-800 hover:bg-slate-200/60'
                              }`}
                            >
                              {drillPathTranslations[zus] || drillTranslatedOptions[zus] || zus}
                            </button>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Level Header mit Stufentitel & Zurück-Button */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                      <Filter className="w-3.5 h-3.5 text-teal-700" />
                      <span>{drillLevelTitle}</span>
                    </div>

                    {(drillChapter || drillSymptom) && (
                      <button
                        type="button"
                        onClick={handleDrillBack}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-teal-900 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>{t('kentBackBtn') || 'Eine Stufe zurück'}</span>
                      </button>
                    )}
                  </div>

                  {/* Filterleiste innerhalb der aktuellen Stufe */}
                  {drillLevelType !== 'none' && (
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={drillFilterQuery}
                        onChange={(e) => setDrillFilterQuery(e.target.value)}
                        placeholder={t('kentFilterOptions') || 'In aktueller Stufe filtern...'}
                        className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition-all"
                      />
                      {drillFilterQuery && (
                        <button
                          type="button"
                          onClick={() => setDrillFilterQuery('')}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Stufen-Optionen (Kacheln / Buttons) */}
                  {isDrillLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
                      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">{t('kentSearching') || 'Laden...'}</span>
                    </div>
                  ) : drillLevelType === 'none' ? (
                    <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
                      <div className="text-xs font-bold text-slate-800">
                        {t('kentDepthReached') || 'Maximale Tiefe erreicht'}
                      </div>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        {t('kentDepthReachedDesc') || 'Für diese Kombination gibt es keine weiteren Unterstufen. Wählen Sie aus den passenden Rubriken unten.'}
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/40">
                      {filteredDrillOptions.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                          {t('kentNoFilterMatches') || 'Keine Optionen auf dieser Stufe gefunden.'}
                        </div>
                      ) : (
                        filteredDrillOptions.map((opt) => {
                          const transName = drillTranslatedOptions[opt] || chapterTranslations[opt] || opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectDrillOption(opt)}
                              className="w-full p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-teal-50/50 hover:border-teal-300 text-left transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 group-hover:bg-teal-700 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                                  <Folder className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-xs font-bold text-slate-800 group-hover:text-teal-950 truncate">
                                  {transName}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 transition-colors shrink-0" />
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Passende Rubriken der aktuellen Stufe (Matching Rubrics) */}
                  {drillRubrics.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-teal-700" />
                          <span>{t('kentMatchingRubricsTitle') || 'Passende Rubriken der aktuellen Stufe'}</span>
                        </div>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200">
                          {drillRubrics.length}
                        </span>
                      </div>

                      <div className="max-h-[220px] overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/40 divide-y divide-slate-100">
                        {drillRubrics.map((rubric) => {
                          const isSelected = selectedSymptoms.some(s => s.rubricId === String(rubric.id));
                          const rubricPath = rubric.pathTranslated || rubric.path;
                          const rubricTitle = (rubric.zusatz && rubric.zusatz.length > 0)
                            ? (rubric.zusatzTranslated ? rubric.zusatzTranslated.join(', ') : rubric.zusatz.join(', '))
                            : (rubric.symptomTranslated || rubric.symptom || rubricPath);

                          return (
                            <div
                              key={rubric.id}
                              className={`pt-1.5 first:pt-0 pb-1.5 flex items-center justify-between gap-2 text-left ${
                                isSelected ? 'opacity-60 bg-teal-50/30' : 'hover:bg-slate-100/50'
                              } px-2 rounded-lg transition-colors`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="text-xs font-bold text-slate-800 truncate" title={rubricTitle}>
                                  {rubricTitle}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium truncate" title={rubricPath}>
                                  {rubricPath}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {rubric.remedyCount > 0 && (
                                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                    {rubric.remedyCount} {t('repertoriumRemediesUnit') || 'Mittel'}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      const item = selectedSymptoms.find(s => s.rubricId === String(rubric.id));
                                      if (item) handleRemoveSymptom(item.id);
                                    } else {
                                      handleAddRubric(rubric, rubricPath);
                                    }
                                  }}
                                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-rose-100 hover:bg-rose-200 text-rose-700'
                                      : 'bg-teal-700 hover:bg-teal-800 text-white'
                                  }`}
                                  title={isSelected ? t('repertoryRemoveSymptom') : t('repertoryAddSymptom')}
                                >
                                  {isSelected ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3 / LIVE SUCHE (wenn Suchfeld ausgefüllt oder Suche-Tab aktiv) */}
              {(activeTabMode === 'search' || treeSearchQuery) && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{t('repertoryTabSearch')}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200">
                      {isKeywordSearching ? (t('kentSearching') || 'Suchen...') : `${keywordResults.length} ${t('repertoriumRemediesUnit') || 'Treffer'}`}
                    </span>
                  </div>

                  {isKeywordSearching ? (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
                      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">{t('kentSearching') || 'Suchen...'}</span>
                    </div>
                  ) : (
                    <div className="max-h-[460px] overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/40 divide-y divide-slate-100">
                      {keywordResults.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                          {treeSearchQuery ? (t('kentNoResults') || 'Keine passenden Symptome gefunden.') : (t('kentSearchPlaceholder') || 'Geben Sie oben einen Suchbegriff ein.')}
                        </div>
                      ) : (
                        keywordResults.map((rubric) => {
                          const isSelected = selectedSymptoms.some(s => s.rubricId === String(rubric.id));
                          const rubricPath = rubric.pathTranslated || rubric.path;
                          const rubricTitle = rubric.symptomTranslated || rubric.symptom || rubricPath;

                          return (
                            <div
                              key={rubric.id}
                              className={`pt-2 first:pt-0 pb-2 flex items-center justify-between gap-2 text-left ${
                                isSelected ? 'opacity-60 bg-teal-50/30' : 'hover:bg-slate-100/50'
                              } px-2 rounded-lg transition-colors`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                                    {rubric.chapterTranslated || rubric.chapter}
                                  </span>
                                  <span className="text-[10px] text-slate-400">ID: {rubric.id}</span>
                                </div>
                                <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
                                  {rubricTitle}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium truncate">
                                  {rubricPath}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {rubric.remedyCount > 0 && (
                                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                    {rubric.remedyCount} {t('repertoriumRemediesUnit') || 'Mittel'}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      const item = selectedSymptoms.find(s => s.rubricId === String(rubric.id));
                                      if (item) handleRemoveSymptom(item.id);
                                    } else {
                                      handleAddRubric(rubric, rubricPath);
                                    }
                                  }}
                                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-rose-100 hover:bg-rose-200 text-rose-700'
                                      : 'bg-teal-700 hover:bg-teal-800 text-white'
                                  }`}
                                  title={isSelected ? t('repertoryRemoveSymptom') : t('repertoryAddSymptom')}
                                >
                                  {isSelected ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: FAVORITEN */}
              {activeTabMode === 'favorites' && !treeSearchQuery && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                      <span>{t('repertoryTabFavorites')}</span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200">
                      {favoriteRubrics.length}
                    </span>
                  </div>

                  <div className="max-h-[460px] overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/40 divide-y divide-slate-100">
                    {favoriteRubrics.map((rubric) => {
                      const isSelected = selectedSymptoms.some(s => s.rubricId === String(rubric.id));
                      const rubricPath = rubric.pathTranslated || rubric.path;
                      const rubricTitle = rubric.symptomTranslated || rubric.symptom || rubricPath;

                      return (
                        <div
                          key={rubric.id}
                          className={`pt-2 first:pt-0 pb-2 flex items-center justify-between gap-2 text-left ${
                            isSelected ? 'opacity-60 bg-teal-50/30' : 'hover:bg-slate-100/50'
                          } px-2 rounded-lg transition-colors`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                                {rubric.chapter}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
                              {rubricTitle}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium truncate">
                              {rubricPath}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {rubric.remedyCount > 0 && (
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {rubric.remedyCount} {t('repertoriumRemediesUnit') || 'Mittel'}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  const item = selectedSymptoms.find(s => s.rubricId === String(rubric.id));
                                  if (item) handleRemoveSymptom(item.id);
                                } else {
                                  handleAddRubric(rubric, rubricPath);
                                }
                              }}
                              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-rose-100 hover:bg-rose-200 text-rose-700'
                                  : 'bg-teal-700 hover:bg-teal-800 text-white'
                              }`}
                              title={isSelected ? t('repertoryRemoveSymptom') : t('repertoryAddSymptom')}
                            >
                              {isSelected ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rechte Spalte: Ausgewählte Symptome (Korb) (6 cols auf lg) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 md:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {t('repertorySelectedSymptomsTitle' as any) || 'Ausgewählte Symptome'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedSymptoms.length} {t('repertorySymptomsCount' as any) || 'Symptome im Fall gesammelt'}
                    </p>
                  </div>
                </div>

                {selectedSymptoms.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('repertoryClearAllBtn' as any) || 'Alle löschen'}</span>
                  </button>
                )}
              </div>

              {/* Symptom Cards Liste */}
              {selectedSymptoms.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                  <BookmarkPlus className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    {t('repertoryNoSymptomsYetTitle' as any) || 'Noch keine Symptome ausgewählt'}
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    {t('repertoryNoSymptomsYetDesc' as any) || 'Wählen Sie links aus den Boericke-Rubriken die passenden Beschwerden des Patienten aus.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                  {selectedSymptoms.map((sym, index) => (
                    <div
                      key={sym.id}
                      className="p-3 rounded-2xl border border-slate-200/90 hover:border-teal-300 bg-white shadow-2xs transition-all flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-teal-50 border border-teal-200/80 text-teal-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {sym.rubricName}
                          </h4>
                        </div>
                        <input
                          type="text"
                          value={sym.patientNote || ''}
                          onChange={(e) => handleUpdateNote(sym.id, e.target.value)}
                          placeholder={t('repertoryPatientNotePlaceholder' as any) || 'Individuelle Beschwerde des Patienten...'}
                          className="w-full text-xs text-slate-700 font-medium italic border-b border-transparent hover:border-slate-300 focus:border-teal-600 focus:bg-slate-50 rounded px-1 outline-none transition-colors"
                        />
                        <div className="text-[10px] text-slate-400 pl-1 font-mono">
                          Boericke: {sym.path}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSymptom(sym.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                        title={t('repertoryRemoveSymptom' as any) || 'Entfernen'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation Action Buttons (Direkt zur Repertorisation & Auswertung) */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {selectedSymptoms.length > 0 
                    ? `${selectedSymptoms.length} ${t('repertorySymptomsCount' as any) || 'Symptome bereit'}` 
                    : 'Mindestens 1 Symptom erforderlich'}
                </span>

                <button
                  type="button"
                  id="repertory-go-to-weighting-btn"
                  disabled={selectedSymptoms.length === 0}
                  onClick={() => setCurrentStep(3)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all ${
                    selectedSymptoms.length > 0
                      ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer hover:shadow'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <span>{t('repertoryPerformRepertorisationBtn' as any) || 'Repertorisation berechnen & auswerten'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STUFE 2: GEWICHTUNG DER SYMPTOME (Regler & Priorisierung) */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-bold text-slate-900">
                    {t('repertoryWeightingTitle' as any) || 'Gewichtung der Symptome'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('repertoryWeightingSubtitle' as any) || 'Bestimmen Sie die klinische Wertigkeit (1–4) vor der gemeinsamen Synthese'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <Sliders className="w-4 h-4 text-teal-700" />
                <span>1 = schwach | 2 = mäßig | 3 = stark / Leitsymptom | 4 = eliminierend</span>
              </div>
            </div>

            {/* Slider Liste */}
            <div className="space-y-4">
              {selectedSymptoms.map((sym, sIdx) => (
                <div
                  key={sym.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-teal-50 border border-teal-200/80 text-teal-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {sIdx + 1}
                        </span>
                        <h4 className="text-xs md:text-sm font-bold text-slate-900 truncate">
                          {sym.patientNote || sym.rubricName}
                        </h4>
                      </div>
                      <div className="text-[11px] text-slate-500 pl-7 italic">
                        {sym.rubricName} ({sym.path})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-white border border-slate-300 font-bold text-xs flex items-center justify-center text-teal-800 shadow-2xs">
                        {sym.weight}
                      </span>
                    </div>
                  </div>

                  {/* Schieberegler */}
                  <div className="flex items-center gap-4 pl-5">
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={1}
                      value={sym.weight}
                      onChange={(e) => handleUpdateWeight(sym.id, parseInt(e.target.value, 10))}
                      className="w-full accent-teal-700 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                    <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-slate-700">
                      <span>Wertigkeit {sym.weight}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation & Ausführen Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('repertoryBackToSymptoms' as any) || 'Zurück zu Symptomen'}</span>
              </button>

              <button
                type="button"
                id="repertory-calculate-results-btn"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all hover:shadow cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-teal-300" />
                <span>{t('repertoryPerformRepertorisationBtn' as any) || 'Repertorisation berechnen & auswerten'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STUFE 3: REPERTORISATIONSERGEBNIS, MATRIX & MATERIA MEDICA */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Sub-Tabs: 4. Ergebnisliste | 5. Rubriken-Matrix | 6. Top-Arznei Detail */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setResultSubTab('ergebnis')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  resultSubTab === 'ergebnis'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">4</div>
                <span>{t('repertoryTabRanking' as any) || 'Rangliste (Abdeckung)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setResultSubTab('analyse')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  resultSubTab === 'analyse'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                <span>Boericke-Analyse (Punkte)</span>
              </button>

              <button
                type="button"
                onClick={() => setResultSubTab('matrix')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  resultSubTab === 'matrix'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">5</div>
                <Table className="w-3.5 h-3.5" />
                <span>{t('repertoryTabRubricMatrix' as any) || 'Rubriken-Abdeckung (Matrix)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setResultSubTab('vergleich')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  resultSubTab === 'vergleich'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">6</div>
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t('repertoryTabMateriaMedicaDetail' as any) || 'Top-Arznei im Detail (Boericke)'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('repertoryAddMoreSymptoms' as any) || 'Symptome bearbeiten'}</span>
              </button>
            </div>
          </div>

          {/* Author Filter in Wizard Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs flex items-center justify-between gap-3">
             <div className="flex items-center gap-2 flex-wrap">
               <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 px-1">
                 <Users className="w-3.5 h-3.5 text-teal-700" />
                 {t('filterAuthorLabel')}:
               </span>
               <div className="flex flex-wrap gap-1.5">
                  {authors.map((auth) => (
                    <button
                      key={auth.key}
                      type="button"
                      onClick={() => handleAuthorClick(auth.key)}
                      className={`py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-2xs border ${
                        isAuthorActive(auth.key)
                          ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      {auth.label}
                    </button>
                  ))}
               </div>
             </div>
             {!selectedAuthors.includes('all') && (
                <button
                  type="button"
                  onClick={() => setSelectedAuthors(['all'])}
                  className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold cursor-pointer px-2"
                >
                  {t('resetFilters')}
                </button>
             )}
          </div>

          {/* 4. REPERTORISATION TABELLEN-RANGLISTE */}
          {resultSubTab === 'ergebnis' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Haupt-Rangliste (8 cols auf lg) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm md:text-base font-bold text-slate-900">
                        {t('repertoryRankingTitle' as any) || 'Repertorisation (nach Boericke)'}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900">
                        {calculationResults.length} Mittel ausgewertet
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      Sortiert nach Abdeckung & Gesamtpunktzahl
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                          <th className="py-2.5 px-3">Rang</th>
                          <th className="py-2.5 px-3">Arzneimittel</th>
                          <th className="py-2.5 px-3 text-center">Gradsumme</th>
                          <th className="py-2.5 px-3 text-center">Abdeckung</th>
                          <th className="py-2.5 px-3 text-center">Abgedeckte Symptome</th>
                          <th className="py-2.5 px-3 text-right">Aktion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {calculationResults.slice(0, 15).map((res, idx) => {
                          const isWinner = idx === 0;
                          return (
                            <tr
                              key={res.remedyKey}
                              onClick={() => setSelectedTopRemedyKey(res.remedyKey)}
                              className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                                selectedTopRemedyKey === res.remedyKey ? 'bg-teal-50/50' : ''
                              }`}
                            >
                              <td className="py-3 px-3 font-bold text-slate-700">
                                #{idx + 1}
                              </td>

                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{res.latinName}</span>
                                  {res.isPolychrest && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                      Polychrest
                                    </span>
                                  )}
                                </div>
                                {res.commonName && (
                                  <div className="text-[11px] text-slate-400">
                                    {res.commonName}
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-3 text-center">
                                <span className="inline-block px-3 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 font-extrabold text-xs">
                                  {res.totalScore}
                                </span>
                              </td>

                              <td className="py-3 px-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${
                                  res.isFullCoverage 
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {res.coverageCount}/{res.totalSymptoms}
                                </span>
                              </td>

                              <td className="py-3 px-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-[200px] mx-auto">
                                    {selectedSymptoms.map((sym, sIdx) => {
                                      const hit = res.rubricHits[sym.id];
                                      return (
                                        <span
                                          key={sym.id}
                                          title={`${sIdx + 1}. ${sym.patientNote || sym.rubricName}: ${hit ? `Boericke Grad ${hit.grade}` : 'Nicht abgedeckt'}`}
                                          className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center transition-all ${
                                            hit
                                              ? 'bg-teal-700 text-white shadow-2xs font-extrabold'
                                              : 'bg-slate-100 text-slate-300 border border-slate-200/50'
                                          }`}
                                        >
                                          {sIdx + 1}
                                        </span>
                                      );
                                    })}
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 justify-center max-w-[250px]">
                                    {selectedSymptoms.filter(sym => res.rubricHits[sym.id]).slice(0, 3).map((sym) => (
                                      <span key={sym.id} className="text-[9px] text-teal-700 truncate max-w-[80px]">
                                        • {sym.patientNote || sym.rubricName.split(',')[0]}
                                      </span>
                                    ))}
                                    {res.coverageCount > 3 && (
                                      <span className="text-[9px] text-slate-400">+{res.coverageCount - 3}</span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openMonographModalForKey(res.remedyKey);
                                  }}
                                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-teal-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                                >
                                  Materia Medica
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Seiten-Panel: Top-Arznei Kurzfassung (4 cols auf lg) */}
              <div className="lg:col-span-4 space-y-4">
                {currentDetailRemedy && (
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 sticky top-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800">
                          Führendes Mittel
                        </span>
                        <h4 className="text-base font-bold text-slate-900">
                          {currentDetailRemedy.latinName}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-teal-100 text-teal-900 font-extrabold text-xs">
                        {currentDetailRemedy.totalScore} Pkt
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Symptom-Abdeckung:</span>
                        <span className="font-bold text-slate-800">
                          {currentDetailRemedy.coverageCount} von {currentDetailRemedy.totalSymptoms} ({Math.round((currentDetailRemedy.coverageCount / currentDetailRemedy.totalSymptoms) * 100)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Volle Deckung:</span>
                        <span className={`font-bold ${currentDetailRemedy.isFullCoverage ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {currentDetailRemedy.isFullCoverage ? 'Ja (Vollständig)' : 'Teilweise'}
                        </span>
                      </div>
                    </div>

                    {/* Rubriken Breakdown */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-800">Abgedeckte Rubriken:</div>
                      <div className="space-y-1.5">
                        {selectedSymptoms.map((sym, sIdx) => {
                          const hit = currentDetailRemedy.rubricHits[sym.id];
                          return (
                            <div key={sym.id} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                              <div className="flex items-center gap-2 truncate pr-2">
                                <span className="w-5 h-5 rounded bg-teal-50 border border-teal-200/80 text-teal-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {sIdx + 1}
                                </span>
                                <span className="truncate text-slate-700">{sym.patientNote || sym.rubricName}</span>
                              </div>
                              <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                                hit ? 'bg-teal-100 text-teal-900 border border-teal-200' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {hit ? `Grad ${hit.grade}` : '—'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => openMonographModalForKey(currentDetailRemedy.remedyKey)}
                        className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                      >
                        <BookOpen className="w-4 h-4 text-teal-200" />
                        <span>Vollständige Boericke-Monographie</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. BOERICKE-ANALYSE (SORTIERT NACH PUNKTEN) */}
          {resultSubTab === 'analyse' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900">Punkte-Analyse (Sortierung nach Gradsumme)</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Diese Ansicht priorisiert die Summe der Boericke-Grade. Ideal um zu sehen, welches Mittel die höchste Intensität bei den vorhandenen Treffern aufweist.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-4 font-bold">Arzneimittel</th>
                      <th className="py-2.5 px-4 font-bold">Berechnungsformel (Grade)</th>
                      <th className="py-2.5 px-4 text-center font-bold">Summe (Σ)</th>
                      <th className="py-2.5 px-4 text-center font-bold">Abdeckung</th>
                      <th className="py-2.5 px-4 text-right font-bold">Aktion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...calculationResults]
                      .sort((a, b) => b.totalScore - a.totalScore || b.coverageCount - a.coverageCount)
                      .slice(0, 50)
                      .map((res) => (
                        <tr 
                          key={res.remedyKey} 
                          onClick={() => setSelectedTopRemedyKey(res.remedyKey)}
                          className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                            selectedTopRemedyKey === res.remedyKey ? 'bg-teal-50/50' : ''
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-900 text-sm">{res.latinName}</div>
                            <div className="text-[10px] text-slate-500 italic">{res.commonName}</div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1.5 max-w-[300px]">
                              {selectedSymptoms.map((sym, idx) => {
                                const hit = res.rubricHits[sym.id];
                                return (
                                  <div 
                                    key={sym.id} 
                                    className={`flex items-start gap-2 px-2 py-1 rounded border text-[10px] ${
                                      hit 
                                        ? 'bg-teal-50 border-teal-200 text-teal-800 shadow-3xs' 
                                        : 'bg-slate-50 border-slate-100 text-slate-300 opacity-50'
                                    }`}
                                  >
                                    <span className={`font-bold shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${hit ? 'bg-teal-700 text-white' : 'bg-slate-200'}`}>
                                      {idx + 1}
                                    </span>
                                    <div className="flex flex-col min-w-0">
                                      <span className="truncate font-medium">{sym.patientNote || sym.rubricName}</span>
                                      {hit && (
                                        <span className="text-[9px] font-bold text-teal-600">
                                          Grad {hit.grade}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-teal-700 text-white font-black text-sm shadow-sm ring-4 ring-teal-50">
                              {res.totalScore}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <div className="text-xs font-bold text-slate-700">
                              {res.coverageCount} / {selectedSymptoms.length}
                            </div>
                            <div className="w-16 h-1 bg-slate-100 rounded-full mt-1.5 mx-auto overflow-hidden">
                              <div 
                                className="h-full bg-teal-500" 
                                style={{ width: `${(res.coverageCount / selectedSymptoms.length) * 100}%` }}
                              />
                            </div>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTopRemedyKey(res.remedyKey);
                                setResultSubTab('vergleich');
                              }}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-700 transition-colors"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. RUBRIKEN-ABDECKUNG MATRIX TAB */}
          {resultSubTab === 'matrix' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm md:text-base font-bold text-slate-900">
                    {t('repertoryRubricMatrixTitle' as any) || 'Rubriken-Abdeckung (Matrix-Übersicht)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('repertoryRubricMatrixSubtitle' as any) || 'Visuelle Gegenüberstellung aller gewählten Symptome gegen die Top-10 Arzneien'}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-sky-700 inline-block" />
                    <span className="text-slate-600">Starke Übereinstimmung (Grad 3–4)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-sky-400 inline-block" />
                    <span className="text-slate-600">Mäßige Übereinstimmung (Grad 2)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-sky-200 inline-block" />
                    <span className="text-slate-600">Schwache Übereinstimmung (Grad 1)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200 inline-block" />
                    <span className="text-slate-600">Keine</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/50">
                      <th className="py-3 px-4 font-bold min-w-[180px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200">Arzneimittel</th>
                      {selectedSymptoms.map((sym, idx) => (
                        <th key={sym.id} className="py-3 px-2 text-center min-w-[100px] group relative" title={sym.rubricName}>
                          <div className="text-[10px] text-slate-400 font-bold mb-1">S{idx + 1}</div>
                          <div className="text-[11px] font-bold text-slate-700 line-clamp-2 leading-tight">
                            {sym.patientNote || sym.rubricName.split(',').slice(-1)[0].trim() || sym.rubricName}
                          </div>
                        </th>
                      ))}
                      <th className="py-3 px-4 text-center font-bold min-w-[80px] border-l border-slate-200">Abdeckung</th>
                      <th className="py-3 px-4 text-center font-bold min-w-[70px]">Summe (Σ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {calculationResults.slice(0, 30).map((cand) => (
                      <tr 
                        key={cand.remedyKey} 
                        onClick={() => setSelectedTopRemedyKey(cand.remedyKey)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          selectedTopRemedyKey === cand.remedyKey ? 'bg-teal-50/50' : ''
                        } ${cand.coverageCount === selectedSymptoms.length ? 'bg-emerald-50/10' : ''}`}
                      >
                        <td className="py-3 px-4 sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                          <div className="flex flex-col">
                            <span className={`font-bold ${cand.coverageCount === selectedSymptoms.length ? 'text-emerald-700' : 'text-slate-900'}`}>
                              {cand.latinName}
                            </span>
                            <span className="text-[10px] text-slate-400 italic truncate max-w-[150px]">{cand.commonName}</span>
                          </div>
                        </td>

                        {selectedSymptoms.map((sym) => {
                          const hit = cand.rubricHits[sym.id];
                          const grade = hit ? hit.grade : 0;
                          return (
                            <td key={sym.id} className="py-3 px-2 text-center">
                              <div className="flex items-center justify-center">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs transition-transform hover:scale-110 shadow-2xs ${
                                    grade >= 3
                                      ? 'bg-sky-700 text-white ring-2 ring-sky-100'
                                      : grade === 2
                                      ? 'bg-sky-400 text-white'
                                      : grade === 1
                                      ? 'bg-sky-100 text-sky-800'
                                      : 'bg-slate-50 text-slate-200 opacity-40'
                                  }`}
                                  title={`${cand.latinName} - ${sym.rubricName}: ${grade > 0 ? `Grad ${grade}` : 'Nicht erwähnt'}`}
                                >
                                  {grade > 0 ? grade : '0'}
                                </div>
                              </div>
                            </td>
                          );
                        })}

                        <td className="py-3 px-4 text-center border-l border-slate-100">
                          <div className={`text-xs font-black ${cand.coverageCount === selectedSymptoms.length ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {cand.coverageCount} / {selectedSymptoms.length}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg bg-slate-100 font-bold text-slate-900 shadow-3xs border border-slate-200/50">
                            {cand.totalScore}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. TOP-ARZNEIMITTEL IM DETAIL & MATERIA MEDICA */}
          {resultSubTab === 'vergleich' && currentDetailRemedy && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
                    #1
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {currentDetailRemedy.latinName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {currentDetailRemedy.commonName || 'Materia Medica Homoeopathica (nach Dr. William Boericke)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openMonographModalForKey(currentDetailRemedy.remedyKey)}
                    className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-teal-200" />
                    <span>Gesamte Monographie lesen</span>
                  </button>
                </div>
              </div>

              {/* Auszug & Leitsymptome nach Boericke */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    <span>Wesen & Charakteristik (Boericke)</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Ehrgeizig, reizbar, empfindlich. Typische Folgen von geistiger Überarbeitung, sitzender Lebensweise und Genussmitteln (Kaffee, Alkohol, Tabak, Medikamente).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    <span>Magen- & Verdauungssymptome</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside leading-relaxed">
                    <li>Schmerzen im Magen, krampfartig und drückend.</li>
                    <li>Schlimmer abends und nach dem Essen.</li>
                    <li>Besser morgens und durch Ruhe.</li>
                    <li>Verschlimmerung durch Kälte und Genussmittel.</li>
                    <li>Ständige Übelkeit mit erfolglosem Brechreiz.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monograph Modal */}
      {monographRemedy && (
        <RemedyMonographModal
          isOpen={Boolean(monographRemedy)}
          remedy={monographRemedy}
          onClose={() => setMonographRemedy(null)}
          allRemedies={allRemedies}
          onSelectRemedyForCase={(name, pot) => {
            onSelectRemedyForCase?.(name, pot);
            setMonographRemedy(null);
          }}
        />
      )}
    </div>
  );
};
