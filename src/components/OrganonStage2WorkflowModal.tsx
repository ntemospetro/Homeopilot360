import React, { useState, useEffect, useMemo } from 'react';
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
  RotateCcw
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Stage2Category,
  STAGE2_CATEGORY_SEQUENCE,
  STAGE2_CATEGORIES_METADATA
} from '../types/organonStage2Workflow';
import { CausaVertiefungModal } from './CausaVertiefungModal';
import { LocalisatioVertiefungModal } from './LocalisatioVertiefungModal';
import { OrganonGlobalReviewView } from './OrganonGlobalReviewView';

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
  onAdoptCategoryResult,
  onWorkflowCompleted
}) => {
  const { t } = useTranslation();

  // Active step index: 0..9 (Stage 2 categories) or 10 (Global Review)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

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
      initial[cat] = {
        category: cat,
        status: 'PENDING',
        text: stage1Values[cat] || ''
      };
    });
    return initial as Record<Stage2Category, CategoryResultRecord>;
  });

  // Local editing text for slot categories (S3..S10)
  const [slotNoteInput, setSlotNoteInput] = useState<string>('');
  const [confirmExitOpen, setConfirmExitOpen] = useState<boolean>(false);

  // When workflow opens or resets
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setConfirmExitOpen(false);
      // Initialize seed values only on initial modal open - status is PENDING until deepened or confirmed
      setRecords(() => {
        const initial: Record<Stage2Category, CategoryResultRecord> = {} as any;
        STAGE2_CATEGORY_SEQUENCE.forEach((cat) => {
          const s1Text = stage1Values[cat] || '';
          initial[cat] = {
            category: cat,
            status: 'PENDING',
            text: s1Text
          };
        });
        return initial;
      });
    }
  }, [isOpen]); // Only react to isOpen changes, NOT stage1Values updates!

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
    }
  }, [activeCategory]);

  // Handler when a category finishes and adopts findings
  const handleCompleteCategory = (cat: Stage2Category, summaryText: string, skipped = false) => {
    setRecords((prev) => ({
      ...prev,
      [cat]: {
        category: cat,
        status: skipped ? 'SKIPPED_SUFFICIENT' : 'COMPLETED',
        text: summaryText,
        timestamp: new Date().toISOString()
      }
    }));

    if (onAdoptCategoryResult && summaryText) {
      onAdoptCategoryResult(cat, summaryText);
    }

    // Advance automatically to the next step
    setCurrentStepIndex((prev) => Math.min(prev + 1, STAGE2_CATEGORY_SEQUENCE.length));
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

    if (onWorkflowCompleted) {
      onWorkflowCompleted(resultMap as Record<Stage2Category, string>);
    }
    onClose();
  };

  const handleSafeCloseRequest = () => {
    const hasAnyProgress = Object.values(records).some(
      (r) => r.status === 'COMPLETED' || r.status === 'SKIPPED_SUFFICIENT'
    );
    if (hasAnyProgress) {
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
        <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800/80 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-thin">
          {STAGE2_CATEGORY_SEQUENCE.map((cat, idx) => {
            const meta = STAGE2_CATEGORIES_METADATA[cat];
            const rec = records[cat];
            const isCurrent = idx === currentStepIndex;
            const isDone = rec?.status === 'COMPLETED';
            const isSkipped = rec?.status === 'SKIPPED_SUFFICIENT';

            return (
              <button
                type="button"
                key={cat}
                id={`organon-step-indicator-${cat}`}
                onClick={() => setCurrentStepIndex(idx)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? 'bg-teal-600 text-white font-bold shadow-xs border border-teal-400/40 ring-1 ring-teal-400/40'
                    : isDone
                    ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/40 font-medium'
                    : isSkipped
                    ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900/40 font-medium'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0">
                  {isDone ? (
                    <Check className="w-3 h-3 text-emerald-300" />
                  ) : isSkipped ? (
                    '—'
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
            />
          )}

          {/* STEPS 3..10: FROZEN CATEGORIES (Sensatio ... Animus) */}
          {activeCategory && activeCategory !== 'CAUSA' && activeCategory !== 'LOCALISATIO' && (
            <div
              id={`stage2-category-slot-${activeCategory}`}
              className="w-full flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-900"
            >
              {/* Category Header Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-850 border border-slate-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {t(STAGE2_CATEGORIES_METADATA[activeCategory].labelKey)}
                      </h3>
                      <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
                        {STAGE2_CATEGORIES_METADATA[activeCategory].dimensionsCode}
                      </span>
                    </div>
                    <p className="text-xs text-teal-200/80 italic mt-0.5">
                      {t(STAGE2_CATEGORIES_METADATA[activeCategory].questionKey)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">
                    Kategorie {currentStepIndex + 1} von 10 im geführten Gesamtprozess
                  </span>
                </div>
              </div>

              {/* Stage 1 Seed Data Card */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-teal-400">
                    <FileText className="w-3.5 h-3.5" />
                    {t('stage2Stage1SeedData')}
                  </span>
                  {stage1Values[activeCategory] && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      Erfasst in Stage 1
                    </span>
                  )}
                </div>
                {stage1Values[activeCategory] ? (
                  <p className="text-xs text-slate-200 bg-slate-900/90 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans">
                    {stage1Values[activeCategory]}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    {t('stage2NoStage1SeedData')}
                  </p>
                )}
              </div>

              {/* Frozen Specification Dimensions Grid */}
              {FROZEN_DIMENSIONS_MAP[activeCategory] && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Fachliche Dimensionen ({STAGE2_CATEGORIES_METADATA[activeCategory].dimensionsCode})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {FROZEN_DIMENSIONS_MAP[activeCategory].map((dim) => (
                      <div
                        key={dim.code}
                        className="p-3 rounded-xl bg-slate-850 border border-slate-800 space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold">
                            {dim.code}
                          </span>
                          <span className="text-xs font-bold text-slate-200">
                            {dim.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {dim.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patient Text & Findings Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Ergebnis / Vertiefungstext für {t(STAGE2_CATEGORIES_METADATA[activeCategory].labelKey)}:
                </label>
                <textarea
                  id={`stage2-input-${activeCategory}`}
                  value={slotNoteInput}
                  onChange={(e) => setSlotNoteInput(e.target.value)}
                  placeholder={`Erfasste Phänomene, Nuancen und Patientenaussagen zu ${t(STAGE2_CATEGORIES_METADATA[activeCategory].labelKey)} hier eingeben...`}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-sm resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <button
                  id={`stage2-skip-btn-${activeCategory}`}
                  type="button"
                  onClick={() => handleCompleteCategory(activeCategory, slotNoteInput.trim() || stage1Values[activeCategory] || '', true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
                >
                  {t('stage2SkipCategoryBtn')}
                </button>

                <button
                  id={`stage2-adopt-btn-${activeCategory}`}
                  type="button"
                  onClick={() => handleCompleteCategory(activeCategory, slotNoteInput.trim() || stage1Values[activeCategory] || '')}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('stage2AdoptAndContinueBtn')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
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

      {/* Confirmation Exit Modal */}
      {confirmExitOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl max-w-md w-full space-y-4 shadow-2xl text-slate-100">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Workflow beenden?</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('stage2CloseWorkflowConfirm')}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmExitOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
              >
                Fortsetzen
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmExitOpen(false);
                  onClose();
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Beenden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
