import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  X,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Brain,
  Layers,
  ArrowRight,
  Compass,
  HeartPulse,
  Activity,
  FileText,
  CheckCircle2,
  Clock,
  RotateCcw,
  Send,
  Mic,
  MicOff
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Stage2Category,
  STAGE2_CATEGORY_SEQUENCE,
  STAGE2_CATEGORIES_METADATA
} from '../types/organonStage2Workflow';
import { CausaVertiefungModal } from './CausaVertiefungModal';
import { LocalisatioVertiefungModal } from './LocalisatioVertiefungModal';
import { GenericCategoryDeepDiveModal } from './GenericCategoryDeepDiveModal';
import { OrganonGlobalReviewView } from './OrganonGlobalReviewView';
import {
  requestCategoryDeepen,
  CategoryDeepenState
} from '../services/stage2CategoryDeepenService';
import {
  isSpeechRecognitionSupported,
  startSpeechRecognition,
  SpeechRecognitionSession,
  mergeWithOverlap,
  deduplicateRepeatedPhrases
} from '../services/speechService';

// Dimension lists for the 8 frozen Stage 2 categories
const FROZEN_DIMENSIONS_MAP: Record<string, { code: string; title: string; desc: string }[]> = {
  SENSATIO: [
    { code: 'S1', title: 'Basale Schmerz- & Empfindungsqualität', desc: 'Brennend, stechend, dumpf, krampfend, pochend, reißend' },
    { code: 'S2', title: 'Metaphorische Vergleiche', desc: '„Wie ein enges Band“, „wie glühende Kohlen“, „wie zersplittertes Glas“' },
    { code: 'S3', title: 'Sensorische Begleitwahrnehmungen', desc: 'Kribbeln, Taubheit, Kälte-/Hitzegefühl im Areal' },
    { code: 'S4', title: 'Intensität & zeitlicher Verlauf', desc: 'Plötzlich einschießend vs. allmählich ansteigend, wellenförmig' },
    { code: 'S5', title: 'Subjektive Eigenartigkeit', desc: 'Ungewöhnliche, paradoxe oder seltene Empfindungsausprägungen (§ 153)' }
  ],
  SYMPTOMA: [
    { code: 'Y1', title: 'Phänomenologische Kernstruktur', desc: 'Primäre pathologische Manifestation im Wortlaut des Patienten' },
    { code: 'Y2', title: 'Funktionsbeeinträchtigung', desc: 'Einschränkung von Bewegung, Sprache, Schlaf, Organfunktionen' },
    { code: 'Y3', title: 'Sichtbare / messbare Zeichen', desc: 'Schwellung, Rötung, Absonderungen, Vitalzeichen' },
    { code: 'Y4', title: 'Rhythmik & Periodizität', desc: 'Auftretensmuster, tägliche/monatliche Wiederkehr, Anfallscharakter' },
    { code: 'Y5', title: 'Systemische Reaktionen', desc: 'Fieber, Schüttelfrost, allgemeine Erschöpfung, Schwäche' }
  ],
  MODALITATES_BESSERUNG: [
    { code: 'MB1', title: 'Thermisch & Klimatisch', desc: 'Wärme, Kälte, frische Luft, Zimmerwärme, Einhüllen' },
    { code: 'MB2', title: 'Haltung & Bewegung', desc: 'Ruhe, Gehen, Liegen auf schmerzhafter Seite, Zusammenkrümmen' },
    { code: 'MB3', title: 'Zeitlich & Zirkadian', desc: 'Morgens, abends, nach dem Schlaf, bestimmte Uhrzeiten' },
    { code: 'MB4', title: 'Physiologisch & Ernährung', desc: 'Essen, Trinken warm/kalt, Fasten, Entleerung' },
    { code: 'MB5', title: 'Umgebung & Sensorisch', desc: 'Dunkelheit, Stille, Druck/Massage, Alleinsein' },
    { code: 'MB6', title: 'Psychisch & Emotional', desc: 'Ablenkung, Trost, Zuspruch, Beschäftigung' }
  ],
  MODALITATES_VERSCHLECHTERUNG: [
    { code: 'MV1', title: 'Thermisch & Klimatisch', desc: 'Kälte, Zugluft, Nässe, Wetterwechsel, Sommerhitze' },
    { code: 'MV2', title: 'Haltung & Bewegung', desc: 'Erste Bewegung, fortgesetzte Bewegung, Bücken, Erschütterung' },
    { code: 'MV3', title: 'Zeitlich & Zirkadian', desc: 'Nachts (z.B. 2–4 Uhr), nachmittags, beim Erwachen' },
    { code: 'MV4', title: 'Physiologisch & Ernährung', desc: 'Nach dem Essen, bestimmte Nahrungsmittel, Berührung' },
    { code: 'MV5', title: 'Umgebung & Sensorisch', desc: 'Lärm, Licht, Gerüche, Gesellschaft, Gewitterstimmung' },
    { code: 'MV6', title: 'Psychisch & Emotional', desc: 'Ärger, Kummer, Widerspruch, Trost, Schreck' }
  ],
  SYMPTOMATA_CONCOMITANTIA: [
    { code: 'SC1', title: 'Körperliche Begleiterscheinungen', desc: 'Gleichzeitig auftretende körperliche Phänomene an anderen Orten' },
    { code: 'SC2', title: 'Mentale Begleitreaktionen', desc: 'Geistige Trägheit, Reizbarkeit oder Ängstlichkeit während der Attacke' },
    { code: 'SC3', title: 'Zeitliches Kopplungsmuster', desc: 'Synchrones vs. alternierendes Auftreten zum Leitsymptom' },
    { code: 'SC4', title: 'Physiologische Begleitachsen', desc: 'Schwitzen, Durstveränderung, Übelkeit, Harndrang' },
    { code: 'SC5', title: 'Polarität & Diskrepanz', desc: 'Auffällige, scheinbar paradoxe Symptomenkombinationen (§ 153)' }
  ],
  COMORBIDITAS: [
    { code: 'CO1', title: 'Chronische Vorerkrankungen', desc: 'Bestehende Diagnosen, Grundleiden, Organdysfunktionen' },
    { code: 'CO2', title: 'Frühere Akuterkrankungen', desc: 'Frühere schwere Infektionen, Operationen, Traumata' },
    { code: 'CO3', title: 'Miasmatischer & familiärer Hintergrund', desc: 'Hautleiden, hereditäre Belastungen, konstitutionelle Neigung' },
    { code: 'CO4', title: 'Medikamentöse Vorbehandlung', desc: 'Dauermedikation, Unterdrückungen, vorangegangene Therapien' }
  ],
  MENS: [
    { code: 'ME1', title: 'Kognitive Klarheit & Konzentration', desc: 'Benommenheit, Verwirrtheit, Konzentrationsschwäche, geistige Frische' },
    { code: 'ME2', title: 'Gedankengeschwindigkeit & Ideenfluss', desc: 'Flüchtige Gedanken, Gedankenverlangsamung, Zwangsgedanken' },
    { code: 'ME3', title: 'Gedächtnis & Orientierung', desc: 'Vergesslichkeit für Namen/Worte, zeitliche Desorientierung' },
    { code: 'ME4', title: 'Entscheidungsfähigkeit & Willensregung', desc: 'Unentschlossenheit, Willensschwäche, Impulsivität' }
  ],
  ANIMUS: [
    { code: 'AN1', title: 'Grundstimmung & Affektlage', desc: 'Traurigkeit, Weinen, Gleichgültigkeit, Heiterkeit, Niedergeschlagenheit' },
    { code: 'AN2', title: 'Reaktionsmuster & Reizbarkeit', desc: 'Jähzorn, Empfindlichkeit gegen Widerspruch, Ungeduld' },
    { code: 'AN3', title: 'Ängste & Befürchtungen', desc: 'Todesangst, Angst vor Alleinsein, Dunkelheit, Krankheitsangst' },
    { code: 'AN4', title: 'Soziales Kontaktverhalten', desc: 'Verlangen nach Gesellschaft vs. Abneigung gegen Menschen' },
    { code: 'AN5', title: 'Eigenwahrnehmung des Gemüts', desc: 'Selbsteinschätzung der seelischen Veränderung seit Krankheitsbeginn' }
  ]
};

interface CategoryResultRecord {
  category: Stage2Category;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED_SUFFICIENT';
  text: string;
  timestamp?: string;
  details?: any;
}

export interface OrganonStage2WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawText: string;
  endprueferResult?: any | null;
  initialHahnemannCrossCheck?: boolean;
  hahnemannCrossCheck?: boolean;
  onHahnemannCrossCheckChange?: (enabled: boolean) => void;
  stage1Values?: Record<string, string>;
  initialRecords?: Record<string, any>;
  onRecordsChange?: (records: Record<Stage2Category, CategoryResultRecord>) => void;
  onAdoptCategoryResult?: (category: Stage2Category, text: string) => void;
  onWorkflowCompleted?: (allResults: Record<Stage2Category, string>) => void;
}

export const OrganonStage2WorkflowModal: React.FC<OrganonStage2WorkflowModalProps> = ({
  isOpen,
  onClose,
  rawText,
  endprueferResult = null,
  initialHahnemannCrossCheck = false,
  hahnemannCrossCheck,
  onHahnemannCrossCheckChange,
  stage1Values = {},
  initialRecords = {},
  onRecordsChange,
  onAdoptCategoryResult,
  onWorkflowCompleted
}) => {
  const { t, language } = useTranslation();

  // Active step index: 0..9 (Stage 2 categories) or 10 (Global Review)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const stepperRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active stepper pill smoothly into view without native scrollbar
  useEffect(() => {
    if (stepperRef.current) {
      const activeEl = stepperRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentStepIndex]);

  // Global Hahnemann Cross-Check switch (persists across all 10 modules!)
  const [globalHahnemannCrossCheck, setGlobalHahnemannCrossCheck] = useState<boolean>(
    hahnemannCrossCheck ?? initialHahnemannCrossCheck ?? false
  );

  useEffect(() => {
    if (hahnemannCrossCheck !== undefined) {
      setGlobalHahnemannCrossCheck(hahnemannCrossCheck);
    }
  }, [hahnemannCrossCheck]);

  // Completed records map
  const [records, setRecords] = useState<Record<Stage2Category, CategoryResultRecord>>(() => {
    const initial: Partial<Record<Stage2Category, CategoryResultRecord>> = {};
    STAGE2_CATEGORY_SEQUENCE.forEach((cat) => {
      const existing = initialRecords?.[cat];
      const s1Text = stage1Values[cat] || '';
      initial[cat] = {
        category: cat,
        status: existing?.status || (existing?.text ? 'IN_PROGRESS' : 'PENDING'),
        text: existing?.text !== undefined ? existing.text : s1Text,
        timestamp: existing?.timestamp
      };
    });
    return initial as Record<Stage2Category, CategoryResultRecord>;
  });

  // Local editing text for slot categories (S3..S10)
  const [slotNoteInput, setSlotNoteInput] = useState<string>('');
  const [confirmExitOpen, setConfirmExitOpen] = useState<boolean>(false);
  const [confirmNoSaveOpen, setConfirmNoSaveOpen] = useState<boolean>(false);
  const [initialSessionRecords, setInitialSessionRecords] = useState<Record<Stage2Category, CategoryResultRecord> | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  const hasSessionChanges = useMemo(() => {
    if (!initialSessionRecords) return false;
    return STAGE2_CATEGORY_SEQUENCE.some((cat) => {
      const init = initialSessionRecords[cat];
      const curr = records[cat];
      const initText = (init?.text || '').trim();
      const currText = (curr?.text || '').trim();
      const initStatus = init?.status || 'PENDING';
      const currStatus = curr?.status || 'PENDING';
      return initText !== currText || initStatus !== currStatus;
    });
  }, [records, initialSessionRecords]);

  // Interactive Question Engine states for S3..S10 (Sensatio, Symptoma, Modalitäten, Concomitantia, Comorbiditas, Mens, Animus)
  const [catDeepenStates, setCatDeepenStates] = useState<Record<string, CategoryDeepenState>>({});
  const [catLoading, setCatLoading] = useState<boolean>(false);
  const [catAnswerInput, setCatAnswerInput] = useState<string>('');

  // Speech recognition for category questioning
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecondsLeft, setRecordSecondsLeft] = useState(60);
  const isSpeechSupported = isSpeechRecognitionSupported();
  const recognitionRef = useRef<SpeechRecognitionSession | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const recordingBaseTextRef = useRef<string>('');
  const lastSpokenTranscriptRef = useRef<string>('');

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Speech stop error:', err);
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const startRecording = () => {
    if (!isSpeechSupported) return;
    if (isRecording) {
      stopRecording();
      return;
    }

    recordingBaseTextRef.current = catAnswerInput;
    lastSpokenTranscriptRef.current = '';
    setRecordSecondsLeft(60);
    setIsRecording(true);

    try {
      const session = startSpeechRecognition({
        language: ((language as string) || 'de') as any,
        continuous: true,
        interimResults: true,
        onResult: (transcript: string, isFinal: boolean) => {
          if (isFinal) {
            lastSpokenTranscriptRef.current = transcript;
            const merged = mergeWithOverlap(recordingBaseTextRef.current, transcript);
            const cleanText = deduplicateRepeatedPhrases(merged);
            setCatAnswerInput(cleanText);
            recordingBaseTextRef.current = cleanText;
          } else {
            const combined = mergeWithOverlap(recordingBaseTextRef.current, transcript);
            setCatAnswerInput(combined);
          }
        },
        onError: (errorMsg: string) => {
          console.warn('Speech recognition warning:', errorMsg);
          stopRecording();
        }
      });
      recognitionRef.current = session;

      timerIntervalRef.current = window.setInterval(() => {
        setRecordSecondsLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Speech start error:', err);
      stopRecording();
    }
  };

  // When workflow opens or resets
  useEffect(() => {
    if (!isOpen) {
      isInitializedRef.current = false;
      setInitialSessionRecords(null);
      return;
    }

    if (isOpen && !isInitializedRef.current) {
      isInitializedRef.current = true;
      setConfirmExitOpen(false);
      setConfirmNoSaveOpen(false);
      
      const initial: Record<Stage2Category, CategoryResultRecord> = {} as any;
      STAGE2_CATEGORY_SEQUENCE.forEach((cat) => {
        const existing = initialRecords?.[cat];
        const s1Text = stage1Values[cat] || '';
        if (existing && (existing.text !== undefined || existing.status === 'COMPLETED' || existing.status === 'SKIPPED_SUFFICIENT' || existing.status === 'IN_PROGRESS')) {
          initial[cat] = {
            category: cat,
            status: existing.status || (existing.text ? 'IN_PROGRESS' : 'PENDING'),
            text: existing.text !== undefined ? existing.text : s1Text,
            timestamp: existing.timestamp
          };
        } else {
          initial[cat] = {
            category: cat,
            status: 'PENDING',
            text: s1Text
          };
        }
      });
      setRecords(initial);
      setInitialSessionRecords(initial);
    }
  }, [isOpen, initialRecords, stage1Values]);

  // Current active category
  const activeCategory: Stage2Category | null = useMemo(() => {
    if (currentStepIndex >= 0 && currentStepIndex < STAGE2_CATEGORY_SEQUENCE.length) {
      return STAGE2_CATEGORY_SEQUENCE[currentStepIndex];
    }
    return null;
  }, [currentStepIndex]);

  const isGlobalReview = currentStepIndex === STAGE2_CATEGORY_SEQUENCE.length;

  // Sync slot note input when category changes
  useEffect(() => {
    if (activeCategory) {
      const existingText = records[activeCategory]?.text || stage1Values[activeCategory] || '';
      setSlotNoteInput(existingText);
      setCatAnswerInput('');
    }
  }, [activeCategory]);

  // Cleanup speech recording on unmount or category switch
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [activeCategory]);

  // Initialize interactive question engine for S3..S10
  const handleInitCategory = async (cat: Stage2Category, forceRefresh = false) => {
    const dims = FROZEN_DIMENSIONS_MAP[cat];
    if (!dims) return;
    setCatLoading(true);
    try {
      const res = await requestCategoryDeepen({
        action: 'init',
        category: cat,
        categoryTitle: t(STAGE2_CATEGORIES_METADATA[cat].labelKey),
        rawText,
        stage1Text: stage1Values[cat] || '',
        dimensions: dims,
        language: (language as string) || 'de'
      });
      setCatDeepenStates((prev) => ({ ...prev, [cat]: res }));
      if (res.summaryText && (!slotNoteInput.trim() || forceRefresh)) {
        setSlotNoteInput(res.summaryText);
      }
    } catch (err) {
      console.warn('Failed to init category deepen:', err);
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => {
    if (
      activeCategory &&
      activeCategory !== 'CAUSA' &&
      activeCategory !== 'LOCALISATIO' &&
      !catDeepenStates[activeCategory]
    ) {
      handleInitCategory(activeCategory);
    }
  }, [activeCategory, catDeepenStates]);

  // Submit answer to the active question
  const handleAnswerCategory = async (overrideAnswer?: string) => {
    if (!activeCategory) return;
    const answer = (overrideAnswer !== undefined ? overrideAnswer : catAnswerInput).trim();
    if (!answer) return;

    if (isRecording) {
      stopRecording();
    }

    const dims = FROZEN_DIMENSIONS_MAP[activeCategory];
    if (!dims) return;

    const currentState = catDeepenStates[activeCategory];
    setCatLoading(true);
    try {
      const res = await requestCategoryDeepen({
        action: 'step',
        category: activeCategory,
        categoryTitle: t(STAGE2_CATEGORIES_METADATA[activeCategory].labelKey),
        rawText,
        stage1Text: stage1Values[activeCategory] || '',
        dimensions: dims,
        questionHistory: currentState?.questionHistory || [],
        knownFacts: currentState?.knownFacts || [],
        latestAnswer: answer,
        language: (language as string) || 'de'
      });
      setCatDeepenStates((prev) => ({ ...prev, [activeCategory]: res }));
      setCatAnswerInput('');
      if (res.summaryText) {
        setSlotNoteInput(res.summaryText);
        handlePartialCategoryChange(activeCategory, res.summaryText);
      }
    } catch (err) {
      console.warn('Failed to submit category answer:', err);
    } finally {
      setCatLoading(false);
    }
  };

  // Handler when a category finishes and adopts findings
  const handleCompleteCategory = (cat: Stage2Category, summaryText: string, skipped = false, details?: any) => {
    const updated: Record<Stage2Category, CategoryResultRecord> = {
      ...records,
      [cat]: {
        category: cat,
        status: skipped ? 'SKIPPED_SUFFICIENT' : 'COMPLETED',
        text: summaryText,
        timestamp: new Date().toISOString(),
        details: details || records[cat]?.details
      }
    };
    setRecords(updated);
    onRecordsChange?.(updated);

    if (onAdoptCategoryResult && summaryText) {
      onAdoptCategoryResult(cat, summaryText);
    }

    // Advance automatically to the next step
    setCurrentStepIndex((prev) => Math.min(prev + 1, STAGE2_CATEGORY_SEQUENCE.length));
  };

  // Handler when a category has partial findings typed or submitted
  const handlePartialCategoryChange = (cat: Stage2Category, partialText: string, details?: any) => {
    if (!partialText.trim()) return;
    const current = records[cat];
    const updated: Record<Stage2Category, CategoryResultRecord> = {
      ...records,
      [cat]: {
        category: cat,
        status: current?.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
        text: partialText,
        timestamp: new Date().toISOString(),
        details: details || current?.details
      }
    };
    setRecords(updated);
    onRecordsChange?.(updated);
  };

  const handleFinalizeWorkflow = (customRecords?: Record<Stage2Category, CategoryResultRecord>) => {
    const targetRecords = customRecords || records;
    const resultMap: Partial<Record<Stage2Category, string>> = {};
    STAGE2_CATEGORY_SEQUENCE.forEach((cat) => {
      const txt = targetRecords[cat]?.text || '';
      resultMap[cat] = txt;
      if (onAdoptCategoryResult && txt) {
        onAdoptCategoryResult(cat, txt);
      }
    });

    onRecordsChange?.(targetRecords);

    if (onWorkflowCompleted) {
      onWorkflowCompleted(resultMap as Record<Stage2Category, string>);
    }
    onClose();
  };

  const handleSafeCloseRequest = () => {
    if (hasSessionChanges) {
      setConfirmExitOpen(true);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="organon-stage2-workflow-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-6xl h-[94vh] flex flex-col overflow-hidden text-slate-100"
      >
        {/* ================= MASTER WORKFLOW HEADER ================= */}
        <header className="px-5 py-3.5 bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 shadow-xs">
          {/* Left: Workflow Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {t('organonStage2ModalTitle')}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  §§ 83–104
                </span>
              </div>
              <p className="text-xs text-teal-200/70 hidden sm:block">
                {t('organonStage2ModalSub')}
              </p>
            </div>
          </div>

          {/* Right: Persistent Hahnemann Cross-Check Switch & Close Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Global Hahnemann-Gegenprüfung persistent status (Zentral gesteuert) */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline font-medium">{t('organonHahnemannCrossCheckLabel')}:</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  globalHahnemannCrossCheck
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                }`}
              >
                {globalHahnemannCrossCheck ? t('causaHahnemannActiveBadge') : t('causaHahnemannInactiveBadge')}
              </span>
            </div>

            {/* Close Button */}
            <button
              id="organon-stage2-close-btn"
              type="button"
              onClick={handleSafeCloseRequest}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Workflow schließen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ================= STEPPER PROGRESS BAR ================= */}
        <div 
          ref={stepperRef}
          className="px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 overflow-x-auto flex items-center gap-1.5 shrink-0 no-scrollbar scroll-smooth"
        >
          {STAGE2_CATEGORY_SEQUENCE.map((cat, idx) => {
            const meta = STAGE2_CATEGORIES_METADATA[cat];
            const rec = records[cat];
            const isCurrent = idx === currentStepIndex;
            const isDone = rec?.status === 'COMPLETED';
            const isSkipped = rec?.status === 'SKIPPED_SUFFICIENT';
            const isInProgress = !isDone && !isSkipped && (rec?.status === 'IN_PROGRESS' || Boolean(rec?.text && rec.text.trim()));

            return (
              <button
                type="button"
                key={cat}
                id={`organon-step-indicator-${cat}`}
                data-active={isCurrent ? "true" : "false"}
                onClick={() => setCurrentStepIndex(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? 'bg-teal-600 text-white font-bold shadow-xs border border-teal-400/40 ring-1 ring-teal-400/40'
                    : isDone
                    ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/40 font-medium'
                    : isSkipped
                    ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900/40 font-medium'
                    : isInProgress
                    ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/40 font-medium'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0">
                  {isDone ? (
                    <Check className="w-3 h-3 text-emerald-300" />
                  ) : isSkipped ? (
                    '—'
                  ) : isInProgress ? (
                    '✎'
                  ) : (
                    idx + 1
                  )}
                </span>
                <span className="text-[11px]">{t(meta.labelKey)}</span>
                <span className="text-[9px] opacity-70 font-mono">({meta.dimensionsCode})</span>
              </button>
            );
          })}

          {/* Abschlussprüfungs-Instanz (Keine 11. Kategorie) */}
          <button
            type="button"
            id="organon-step-indicator-review"
            data-active={isGlobalReview ? "true" : "false"}
            onClick={() => setCurrentStepIndex(STAGE2_CATEGORY_SEQUENCE.length)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all whitespace-nowrap cursor-pointer ${
              isGlobalReview
                ? 'bg-indigo-600 text-white font-bold shadow-xs border border-indigo-400/40 ring-1 ring-indigo-400/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
            <span className="text-[11px] font-semibold">{t('stage2StepGlobalReview')}</span>
          </button>
        </div>

        {/* ================= WORKFLOW BODY ================= */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-900">
          {/* STEP 1: CAUSA VERTIEFUNG */}
          {activeCategory === 'CAUSA' && (
            <CausaVertiefungModal
              isOpen={true}
              onClose={() => {}}
              rawText={rawText}
              existingCausaText={records.CAUSA?.text || stage1Values.causa || ''}
              endprueferResult={endprueferResult}
              hahnemannCrossCheck={globalHahnemannCrossCheck}
              isEmbedded={true}
              onAdoptCausa={(causaSummary) => {
                handleCompleteCategory('CAUSA', causaSummary);
              }}
              onPartialChange={(partialCausaText) => {
                handlePartialCategoryChange('CAUSA', partialCausaText);
              }}
            />
          )}

          {/* STEP 2: LOCALISATIO VERTIEFUNG */}
          {activeCategory === 'LOCALISATIO' && (
            <LocalisatioVertiefungModal
              isOpen={true}
              onClose={() => {}}
              rawText={rawText}
              existingLocalisatioText={records.LOCALISATIO?.text || stage1Values.localisatio || ''}
              endprueferResult={endprueferResult}
              hahnemannCrossCheck={globalHahnemannCrossCheck}
              isEmbedded={true}
              onAdoptLocalisatio={(locSummary) => {
                handleCompleteCategory('LOCALISATIO', locSummary);
              }}
              onPartialChange={(partialLocText) => {
                handlePartialCategoryChange('LOCALISATIO', partialLocText);
              }}
            />
          )}

          {/* STEPS 3..10: FROZEN CATEGORIES (Sensatio ... Animus) using GenericCategoryDeepDiveModal */}
          {activeCategory && activeCategory !== 'CAUSA' && activeCategory !== 'LOCALISATIO' && (
            <GenericCategoryDeepDiveModal
              category={activeCategory}
              rawText={rawText}
              stage1Text={records[activeCategory]?.text || stage1Values[activeCategory] || ''}
              dimensions={FROZEN_DIMENSIONS_MAP[activeCategory] || []}
              endprueferResult={endprueferResult}
              hahnemannCrossCheck={globalHahnemannCrossCheck}
              initialDetails={records[activeCategory]?.details}
              onAdopt={(summary, details) => {
                handleCompleteCategory(activeCategory, summary, false, details);
              }}
              onPartialChange={(partialText, details) => {
                handlePartialCategoryChange(activeCategory, partialText, details);
              }}
            />
          )}

          {/* ORGANON-GESAMTPRÜFUNG & DYNAMISCHE RESTKLÄRUNG (Prüf- und Klärungsinstanz) */}
          {isGlobalReview && (
            <OrganonGlobalReviewView
              rawText={rawText}
              stage1Values={stage1Values}
              endprueferResult={endprueferResult}
              records={records}
              hahnemannCrossCheck={globalHahnemannCrossCheck}
              onUpdateRecords={(newRecords) => {
                setRecords(newRecords);
                onRecordsChange?.(newRecords);
                if (onAdoptCategoryResult) {
                  STAGE2_CATEGORY_SEQUENCE.forEach((cat) => {
                    const txt = newRecords[cat]?.text;
                    if (txt && txt !== records[cat]?.text) {
                      onAdoptCategoryResult(cat, txt);
                    }
                  });
                }
              }}
              onFinalizeWorkflow={handleFinalizeWorkflow}
              onNavigateToCategory={(cat) => {
                const targetIdx = STAGE2_CATEGORY_SEQUENCE.indexOf(cat);
                if (targetIdx >= 0) {
                  setCurrentStepIndex(targetIdx);
                }
              }}
            />
          )}
        </div>
      </motion.div>

      {/* 1. Confirmation Exit Modal (Save / Don't Save / Cancel) */}
      {confirmExitOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700/80 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{t('stage2ConfirmExitTitle')}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('stage2ConfirmExitDesc')}
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmExitOpen(false)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
              >
                {t('stage2ConfirmExitCancelBtn')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmExitOpen(false);
                  setConfirmNoSaveOpen(true);
                }}
                className="px-3 py-2 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-lg text-xs font-medium cursor-pointer"
              >
                {t('stage2ConfirmExitDiscardBtn')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmExitOpen(false);
                  handleFinalizeWorkflow(records);
                }}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t('stage2ConfirmExitSaveBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Secondary Modal (Are you sure you don't want to save?) */}
      {confirmNoSaveOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700/80 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>{t('stage2ConfirmNoSaveTitle')}</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              {t('stage2ConfirmNoSaveDesc')}
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmNoSaveOpen(false);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
              >
                {t('stage2ConfirmNoSaveBackBtn')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmNoSaveOpen(false);
                  if (initialSessionRecords) {
                    setRecords(initialSessionRecords);
                    onRecordsChange?.(initialSessionRecords);
                  }
                  onClose();
                }}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                {t('stage2ConfirmNoSaveDiscardBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
