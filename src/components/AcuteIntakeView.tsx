import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LocalizedRemedy, 
  getLocalizedRemedies 
} from '../data/materiaMedicaData';
import { 
  matchSymptomsToRemedies, 
  SymptomMatchResult,
  performDifferentialDiagnosis,
  DifferentialDiagnosisResult
} from '../services/quickSymptomMatcher';
import { 
  isSpeechRecognitionSupported, 
  startSpeechRecognition, 
  SpeechRecognitionSession,
  mergeWithOverlap,
  deduplicateRepeatedPhrases
} from '../services/speechService';
import { AcuteClarificationModal } from './AcuteClarificationModal';
import { extractRecognizedSymptoms, extractExtractionResult, RecognizedSymptom } from '../services/symptomExtractionService';
import { AcuteVariableModal, AcuteVariableType } from './AcuteVariableModal';
import { 
  formatClinicalVariableForDisplay, 
  enrichClinicalText 
} from '../utils/clinicalVariableFormatter';
import { AcuteAnswers } from '../services/acuteClarificationService';
import { OPTION_LABELS_I18N } from '../services/acuteClarificationOptionsI18n';
import { RemedyMonographModal } from './RemedyMonographModal';
import { ComplaintQuestionsWizardModal } from './ComplaintQuestionsWizardModal';
import { 
  Hahnemann6Pillars, 
  CaseType,
  runHahnemannAnalysis,
  HahnemannAnalysisResult
} from '../services/hahnemannEngineService';
import { KentRepertorySection } from './KentRepertorySection';
import { 
  performKentMathematicalRepertorisation,
  KentRemedySummary,
  KentRepertorisationMatrix,
} from '../services/kentRepertoryService';
import { useTranslation, useLanguage } from '../i18n/LanguageContext';
import { HomeopathicExpertResult, LanguageCode } from '../types';
import { analyzeAcuteCaseWithAIOrFallback } from '../services/homeopathicExpertEngine';
import { getRemedyClassicalAuthors } from '../data/classicalAuthorsMap';
import { getActiveTherapist, isFeatureLimitReached, incrementTherapistUsage } from '../services/storage';
import { 
  Mic, 
  MicOff, 
  Clock, 
  Sparkles, 
  RotateCcw, 
  Info, 
  ShieldAlert, 
  SlidersHorizontal, 
  ChevronRight,
  ChevronUp,
  ChevronDown, 
  Pill, 
  CheckCircle2, 
  BookOpen, 
  Copy, 
  Ban, 
  Eye, 
  EyeOff,
  ArrowRight,
  Plus,
  HelpCircle,
  Stethoscope,
  Lock,
  Edit3,
  AlertTriangle,
  Snowflake,
  Flame,
  Award,
  Trash2,
  Layers,
  Loader2,
  X
} from 'lucide-react';
import { splitMultipleComplaints } from '../services/complaintQuestionGenerator';

interface AcuteIntakeViewProps {
  onSelectRemedyForCase?: (remedyName: string, potency: string) => void;
  onGoToMateriaMedica?: () => void;
}

export const AcuteIntakeView: React.FC<AcuteIntakeViewProps> = ({
  onSelectRemedyForCase,
  onGoToMateriaMedica,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Quick Intake & Voice State
  const [symptomText, setSymptomText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecondsLeft, setRecordSecondsLeft] = useState(60);
  const [recommendations, setRecommendations] = useState<SymptomMatchResult[]>([]);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [acuteAnswers, setAcuteAnswers] = useState<AcuteAnswers>({});
  const [diffResult, setDiffResult] = useState<DifferentialDiagnosisResult | null>(null);
  const [showExcludedInView, setShowExcludedInView] = useState<boolean>(false);

  // Extracted symptoms and timeline in real-time
  const extractionResult = useMemo(() => {
    return extractExtractionResult(symptomText, language);
  }, [symptomText, language]);
  const recognizedSymptoms = extractionResult.symptoms;
  const recognizedTimeline = extractionResult.timeline;

  const [customSymptomOrder, setCustomSymptomOrder] = useState<string[]>([]);
  
  const orderedSymptoms = useMemo(() => {
    if (!recognizedSymptoms || recognizedSymptoms.length === 0) return [];
    if (customSymptomOrder.length === 0) return recognizedSymptoms;
    const map = new Map(recognizedSymptoms.map(s => [s.id, s]));
    const result: RecognizedSymptom[] = [];
    customSymptomOrder.forEach(id => {
      if (map.has(id)) {
        result.push(map.get(id)!);
        map.delete(id);
      }
    });
    map.forEach(s => result.push(s));
    return result;
  }, [recognizedSymptoms, customSymptomOrder]);

  const handleMoveSymptom = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...orderedSymptoms];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setCustomSymptomOrder(newOrder.map(s => s.id));
  };

  // Classical Homeopathic Expert State
  const [expertResult, setExpertResult] = useState<HomeopathicExpertResult | null>(null);
  const [isCalculatingExpert, setIsCalculatingExpert] = useState(false);

  // 4-Box Variable State & Overrides
  const [variableOverrides, setVariableOverrides] = useState<{
    hauptbeschwerde?: string;
    causa?: string;
    modalitaeten?: string;
    begleitsymptome?: string;
  }>({});
  const [editingVariable, setEditingVariable] = useState<AcuteVariableType | null>(null);

  // Gating State: Differential analysis completed and answers applied
  const [isClarificationApplied, setIsClarificationApplied] = useState<boolean>(false);

  // Hahnemann Organon §§ 83-104 Evaluation State (transferred from wizard)
  const [hahnemannData, setHahnemannData] = useState<{
    matrix: Hahnemann6Pillars;
    summaryText: string;
    differentialRemedies: string[];
    caseType?: CaseType;
  } | null>(null);

  // Modal State
  const [selectedRemedyForModal, setSelectedRemedyForModal] = useState<LocalizedRemedy | null>(null);
  const [modalHistory, setModalHistory] = useState<LocalizedRemedy[]>([]);
  const [isHahnemannWizardOpen, setIsHahnemannWizardOpen] = useState<boolean>(false);
  const [isPreloadingHahnemann, setIsPreloadingHahnemann] = useState<boolean>(false);
  const [preloadedHahnemannAnalysis, setPreloadedHahnemannAnalysis] = useState<HahnemannAnalysisResult | null>(null);

  const recognitionRef = useRef<SpeechRecognitionSession | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const recordingBaseTextRef = useRef<string>('');
  const lastSpokenTranscriptRef = useRef<string>('');
  const isFinalizingRef = useRef<boolean>(false);

  useEffect(() => {
    setIsSpeechSupported(isSpeechRecognitionSupported());
  }, []);

  // Fetch localized remedies based on active language
  const localizedRemedies = useMemo(() => {
    return getLocalizedRemedies(language);
  }, [language]);

  const currentLang = (language as LanguageCode) || 'de';

  // Helper: check if a variable string is missing, empty, or unknown
  const isVarMissing = (val: string | undefined | null): boolean => {
    if (!val) return true;
    const trimmed = val.trim();
    if (trimmed === '' || trimmed === '—' || trimmed === '-') return true;
    const lower = trimmed.toLowerCase();
    return (
      lower.includes('unbekannt') ||
      lower.includes('erfragen') ||
      lower.includes('unknown') ||
      lower.includes('inquire') ||
      lower.includes('desconocido') ||
      lower.includes('consultar') ||
      lower.includes('inconnu') ||
      lower.includes('demander') ||
      lower.includes('sconosciuto') ||
      lower.includes('chiedere') ||
      lower.includes('άγνωστο') ||
      lower.includes('ρωτήστε') ||
      lower.includes('неизвестно') ||
      lower.includes('уточнить')
    );
  };

  // Resolve the 4 variables from user manual overrides OR 5-step expert engine extractions
  const activeHauptbeschwerde = useMemo(() => {
    if (variableOverrides.hauptbeschwerde) return variableOverrides.hauptbeschwerde;
    if (expertResult?.extraktion?.hauptbeschwerde) return expertResult.extraktion.hauptbeschwerde;
    if (symptomText.trim().length >= 3) return symptomText.trim();
    return '';
  }, [variableOverrides.hauptbeschwerde, expertResult, symptomText]);

  const activeCausa = useMemo(() => {
    if (variableOverrides.causa) return variableOverrides.causa;
    if (expertResult?.extraktion?.causa) return expertResult.extraktion.causa;
    return '';
  }, [variableOverrides.causa, expertResult]);

  const activeModalitaeten = useMemo(() => {
    if (variableOverrides.modalitaeten) return variableOverrides.modalitaeten;
    if (expertResult?.extraktion?.modalitaeten) return expertResult.extraktion.modalitaeten;
    return '';
  }, [variableOverrides.modalitaeten, expertResult]);

  const activeBegleitsymptome = useMemo(() => {
    if (variableOverrides.begleitsymptome) return variableOverrides.begleitsymptome;
    if (expertResult?.extraktion?.begleitsymptome) return expertResult.extraktion.begleitsymptome;
    return '';
  }, [variableOverrides.begleitsymptome, expertResult]);

  // Count how many of the 4 variables are present and known
  const completedVariablesCount = useMemo(() => {
    let count = 0;
    if (!isVarMissing(activeHauptbeschwerde)) count++;
    if (!isVarMissing(activeCausa)) count++;
    if (!isVarMissing(activeModalitaeten)) count++;
    if (!isVarMissing(activeBegleitsymptome)) count++;
    return count;
  }, [activeHauptbeschwerde, activeCausa, activeModalitaeten, activeBegleitsymptome]);

  const isAllFourComplete = completedVariablesCount === 4;

  // Build a comprehensive case narrative incorporating all clinical inputs:
  // 1. Raw spoken/entered symptom text
  // 2. Extracted 4-column case analysis (Hauptbeschwerde, Causa, Modalitäten, Begleitsymptome)
  // 3. Recognized symptoms (Erkannte Symptome)
  // 4. Answers entered in the step-by-step differential diagnosis (acuteAnswers)
  const comprehensiveCaseText = useMemo(() => {
    const parts: string[] = [];
    const lowerJoined = () => parts.join(' ').toLowerCase();

    // 1. Primary symptom text
    if (symptomText.trim()) {
      parts.push(symptomText.trim());
    }

    // 2. 4-Box Extracted Case Analysis (Hauptbeschwerde, Causa, Modalitäten, Begleitsymptome)
    if (activeHauptbeschwerde && !isVarMissing(activeHauptbeschwerde)) {
      const formatted = formatClinicalVariableForDisplay(activeHauptbeschwerde, 'hauptbeschwerde', language);
      if (formatted && !lowerJoined().includes(formatted.toLowerCase())) {
        parts.push(`${t('step1ChiefComplaint')}: ${formatted}`);
      }
    }

    if (activeCausa && !isVarMissing(activeCausa)) {
      const formatted = formatClinicalVariableForDisplay(activeCausa, 'causa', language);
      if (formatted && !lowerJoined().includes(formatted.toLowerCase())) {
        parts.push(`${t('step1Causa')}: ${formatted}`);
      }
    }

    if (activeModalitaeten && !isVarMissing(activeModalitaeten)) {
      const formatted = formatClinicalVariableForDisplay(activeModalitaeten, 'modalitaeten', language);
      if (formatted && !lowerJoined().includes(formatted.toLowerCase())) {
        parts.push(`${t('step1Modalities')}: ${formatted}`);
      }
    }

    if (activeBegleitsymptome && !isVarMissing(activeBegleitsymptome)) {
      const formatted = formatClinicalVariableForDisplay(activeBegleitsymptome, 'begleitsymptome', language);
      if (formatted && !lowerJoined().includes(formatted.toLowerCase())) {
        parts.push(`${t('step1Concomitants')}: ${formatted}`);
      }
    }

    // 3. Erkannte Symptome (Recognized symptoms)
    if (recognizedSymptoms && recognizedSymptoms.length > 0) {
      const newSyms = recognizedSymptoms
        .filter((s) => s.label && !lowerJoined().includes(s.label.toLowerCase()))
        .map((s) => s.label);
      if (newSyms.length > 0) {
        parts.push(`${t('recognizedSymptomsTitle')}: ${newSyms.join(', ')}`);
      }
    }

    // 4. In der Schritt-für-Schritt Differenzialdiagnose eingegebene Antworten (acuteAnswers)
    if (acuteAnswers && Object.keys(acuteAnswers).length > 0) {
      const answerLabels: string[] = [];
      Object.entries(acuteAnswers).forEach(([k, optVal]) => {
        if (k.endsWith('_ownText') && typeof optVal === 'string' && optVal.trim()) {
          answerLabels.push(`${t('diffDiagPatientOwnDescriptionLabel')} "${optVal.trim()}"`);
        } else if (typeof optVal === 'string') {
          const optLabel = OPTION_LABELS_I18N[optVal]?.[language] || OPTION_LABELS_I18N[optVal]?.de;
          if (optLabel) {
            answerLabels.push(optLabel);
          }
        }
      });
      if (answerLabels.length > 0) {
        parts.push(`${t('diffDiagStepByStep')}: ${answerLabels.join('; ')}`);
      }
    }

    return parts.join('\n');
  }, [
    symptomText,
    activeHauptbeschwerde,
    activeCausa,
    activeModalitaeten,
    activeBegleitsymptome,
    recognizedSymptoms,
    acuteAnswers,
    language,
    t
  ]);

  // Perform Quick Intake limit check and usage increment on search/intake
  useEffect(() => {
    const query = comprehensiveCaseText || symptomText;
    const trimmed = query.trim();
    if (trimmed.length < 3) return;

    const timer = setTimeout(() => {
      const activeTherapist = getActiveTherapist();
      if (activeTherapist) {
        const limitCheck = isFeatureLimitReached(activeTherapist.id, 'maxQuickIntake', 1);
        if (limitCheck.reached) {
          window.dispatchEvent(new CustomEvent('homoeo_action_limit_reached', {
            detail: { feature: t('tariffLimitQuickIntakeLabel'), limit: limitCheck.limit }
          }));
          // Reset input to prevent locking up or infinite triggers
          setSymptomText('');
          return;
        }
        incrementTherapistUsage(activeTherapist.id, 'quick_intake');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [symptomText, comprehensiveCaseText]);

  // Handle saving a variable from the AcuteVariableModal
  const handleSaveVariable = (varKey: AcuteVariableType, newValue: string) => {
    const trimmed = newValue.trim();
    // Ensure the saved variable is clinically enriched in the active language
    const enrichedValue = enrichClinicalText(varKey, trimmed, language);
    const finalVal = enrichedValue || trimmed;

    setVariableOverrides((prev) => ({
      ...prev,
      [varKey]: finalVal
    }));

    // Reset clarification applied because the case facts were modified
    setIsClarificationApplied(false);

    // Enrich symptom text with the new information so that AI and matchers have the full narrative
    setSymptomText((prev) => {
      const label = 
        varKey === 'hauptbeschwerde' ? t('step1ChiefComplaint') :
        varKey === 'causa' ? t('step1Causa') :
        varKey === 'modalitaeten' ? t('step1Modalities') :
        t('step1Concomitants');

      if (!prev.toLowerCase().includes(finalVal.toLowerCase())) {
        if (!prev.trim()) {
          return finalVal;
        }
        return `${prev.trim()}\n${label}: ${finalVal}`;
      }
      return prev;
    });
  };

  // Build complete Hahnemann 6-Pillars matrix from all recognized symptoms and structured variables
  const buildCurrentMatrix = (): Hahnemann6Pillars => {
    const causaItems = recognizedSymptoms.filter(s => s.category === 'causa').map(s => s.label);
    const modItems = recognizedSymptoms.filter(s => s.category === 'modalitaet').map(s => s.label);
    const empfItems = recognizedSymptoms.filter(s => s.category === 'empfindung').map(s => s.label);
    const gemuetItems = recognizedSymptoms.filter(s => s.category === 'gemuet').map(s => s.label);
    const leitItems = recognizedSymptoms.filter(s => s.category === 'leit').map(s => s.label);
    const begleitItems = recognizedSymptoms.filter(s => s.category === 'begleit').map(s => s.label);

    const baseLokal = activeHauptbeschwerde && !isVarMissing(activeHauptbeschwerde) ? activeHauptbeschwerde : (symptomText.trim() || null);
    const allLokal = Array.from(new Set([baseLokal, ...leitItems].filter(Boolean))).join(', ');

    const baseCausa = activeCausa && !isVarMissing(activeCausa) ? activeCausa : null;
    const allCausa = Array.from(new Set([baseCausa, ...causaItems].filter(Boolean))).join(', ');

    const baseMod = activeModalitaeten && !isVarMissing(activeModalitaeten) ? activeModalitaeten : null;
    const allMod = Array.from(new Set([baseMod, ...modItems].filter(Boolean))).join(', ');

    const allBegleit = Array.from(new Set([
      ...(activeBegleitsymptome && !isVarMissing(activeBegleitsymptome) ? [activeBegleitsymptome] : []),
      ...begleitItems
    ].filter(Boolean))) as string[];

    return {
      lokalisierung: allLokal || null,
      causa: allCausa || null,
      modalitaeten: allMod || null,
      begleitsymptome: allBegleit,
      empfindung: empfItems.join(', ') || null,
      gemuet: gemuetItems.join(', ') || null,
      strahlungsoptionen: null,
      ursaechlicher_zusammenhang: null,
      fruehere_behandlungen_und_historie: null,
    };
  };

  // Preload Hahnemann Organon §§ 83-104 analysis before opening modal
  const handleStartHahnemannAnalysis = async () => {
    if (isPreloadingHahnemann) return;
    setIsPreloadingHahnemann(true);

    const textToAnalyze = (symptomText && symptomText.trim().length > 0)
      ? symptomText.trim()
      : (activeHauptbeschwerde || 'Akute Beschwerden');

    const seedMatrix = buildCurrentMatrix();

    try {
      const res = await runHahnemannAnalysis(
        textToAnalyze,
        seedMatrix,
        [],
        language,
        false,
        'akut'
      );
      setPreloadedHahnemannAnalysis(res);
      setIsHahnemannWizardOpen(true);
    } catch (err) {
      console.error('Error preloading Hahnemann analysis:', err);
      // Fallback: open wizard modal anyway so the user is never blocked
      setIsHahnemannWizardOpen(true);
    } finally {
      setIsPreloadingHahnemann(false);
    }
  };

  // Update recommendations & differential diagnosis whenever case text, acute answers, or language changes
  useEffect(() => {
    const query = comprehensiveCaseText || symptomText;
    if (query.trim().length >= 3) {
      const results = matchSymptomsToRemedies(query, language, acuteAnswers);
      setRecommendations(results);
      const diff = performDifferentialDiagnosis(query, language, acuteAnswers);
      setDiffResult(diff);
    } else {
      setRecommendations([]);
      setDiffResult(null);
    }
  }, [comprehensiveCaseText, symptomText, acuteAnswers, language]);

  // Execute 5-Step Homoeopathic Algorithm & Decision Tree
  useEffect(() => {
    let isCancelled = false;
    const query = comprehensiveCaseText || symptomText;
    if (query.trim().length >= 3) {
      setIsCalculatingExpert(true);
      const timer = setTimeout(async () => {
        try {
          const result = await analyzeAcuteCaseWithAIOrFallback(query, language);
          if (!isCancelled) {
            setExpertResult(result);
          }
        } catch (err) {
          console.error('5-step analysis error:', err);
        } finally {
          if (!isCancelled) {
            setIsCalculatingExpert(false);
          }
        }
      }, 350);

      return () => {
        isCancelled = true;
        clearTimeout(timer);
      };
    } else {
      setExpertResult(null);
      setIsCalculatingExpert(false);
    }
  }, [comprehensiveCaseText, symptomText, language]);

  // Keep open modal in sync with language change
  useEffect(() => {
    if (selectedRemedyForModal) {
      const updated = localizedRemedies.find((r) => r.id === selectedRemedyForModal.id);
      if (updated) {
        setSelectedRemedyForModal(updated);
      }
    }
  }, [language, localizedRemedies]);

  // 1. Calculate the Kent Mathematical Repertorisation (§ 153 Organon)
  // Evaluates characteristic rubrics, grades (1, 2, 3), Gesamtpunktzahl (Grad-Summe), Treffer and Leading Simile
  const kentRepertorisation: KentRepertorisationMatrix = useMemo(() => {
    return performKentMathematicalRepertorisation(
      hahnemannData?.matrix || null,
      comprehensiveCaseText || symptomText,
      currentLang
    );
  }, [hahnemannData?.matrix, comprehensiveCaseText, symptomText, currentLang]);

  // Displayed remedies: Synchronized 1:1 with Kent Mathematical Repertorisation & Kennrubriken
  const displayedRemedies = useMemo(() => {
    if (!isClarificationApplied && !hahnemannData) {
      return [];
    }

    // Always prioritize the Kent Mathematical Repertorisation (§ 153 Organon)
    // so that remedies, order, points (Gesamtpunktzahl / Grad-Summe), hits and Simile match 100%
    if (kentRepertorisation && kentRepertorisation.remedies.length > 0) {
      const matchedFromKent: Array<{
        remedy: LocalizedRemedy;
        rec: SymptomMatchResult;
        isRecommended: boolean;
        index: number;
        kentSummary: KentRemedySummary;
      }> = [];

      kentRepertorisation.remedies.forEach((kentRem, idx) => {
        const targetLatin = kentRem.latinName.toLowerCase().trim();
        const targetShort = kentRem.shortName.toLowerCase().replace(/\./g, '').trim();
        const targetKey = kentRem.key.toLowerCase().replace(/_/g, '-').trim();

        let found = localizedRemedies.find((r) => r.latinName.toLowerCase().trim() === targetLatin);
        if (!found) {
          found = localizedRemedies.find(
            (r) => r.id.toLowerCase() === targetKey || r.id.toLowerCase().replace(/-/g, '_') === kentRem.key
          );
        }
        if (!found) {
          found = localizedRemedies.find((r) => {
            const rLatin = r.latinName.toLowerCase().trim();
            return rLatin.startsWith(targetLatin) || targetLatin.startsWith(rLatin);
          });
        }
        if (!found) {
          const firstWord = targetLatin.split(' ')[0];
          if (firstWord && firstWord.length >= 4) {
            found = localizedRemedies.find((r) => r.latinName.toLowerCase().startsWith(firstWord));
          }
        }
        if (!found && targetShort.length >= 3) {
          found = localizedRemedies.find((r) => r.id.toLowerCase().includes(targetShort));
        }

        const remedy: LocalizedRemedy = found || {
          id: kentRem.key.replace(/_/g, '-'),
          latinName: kentRem.latinName,
          commonName: kentRem.shortName,
          categoryKey: 'plant',
          category: 'Klassisches Einzelmittel',
          origin: 'Kent Repertory § 153',
          essence: kentRem.materiaMedicaVerification[currentLang] || kentRem.materiaMedicaVerification.de,
          mainIndications: [kentRem.latinName],
          keynotes: [
            `${kentRem.totalScore} ${t('kentPointsAbbr')} ${t('kentTableTotalScoreRow')}`,
            `${kentRem.hits}/${kentRem.totalRubrics} ${t('kentTableHitsRow')}`,
          ],
          mindEmotional: '',
          modalitiesBetter: [],
          modalitiesWorse: [],
          potenciesAndDosage: 'C30 oder D12 (akut)',
          sphereOfAction: [],
          differentialRemedies: [],
          searchKeywords: [kentRem.latinName, kentRem.shortName],
        };

        const existingRec = recommendations.find((rec) => rec.remedy.id === remedy.id);

        const maxScorePossible = Math.max(1, kentRepertorisation.totalAnalyzedRubrics * 3);
        const relativeRatio = kentRem.totalScore / maxScorePossible;
        const calculatedMatchScore =
          idx === 0 ? 98 : Math.min(94, Math.max(68, Math.round(relativeRatio * 100)));

        const verificationText =
          kentRem.materiaMedicaVerification[currentLang] || kentRem.materiaMedicaVerification.de;
        const matrix = hahnemannData?.matrix;

        const rationale =
          idx === 0
            ? verificationText ||
              (matrix
                ? t('hahnemannSimileMatchesTotality', {
                    name: remedy.latinName,
                    causa: matrix.causa || 'akut',
                    lokalisierung: matrix.lokalisierung || 'spezifisch',
                    empfindung: matrix.empfindung || 'charakteristisch',
                    modalitaeten: matrix.modalitaeten || 'prägnant',
                  })
                : `${kentRem.totalScore} ${t('kentPointsAbbr')} - ${t('kentTableTotalScoreRow')}`)
            : existingRec?.clinicalRationale || verificationText || t('hahnemannDiffAlternativeNote');

        const matchResult: SymptomMatchResult = {
          remedy,
          matchScore: calculatedMatchScore,
          matchedKeywords:
            existingRec?.matchedKeywords ||
            (matrix
              ? [matrix.lokalisierung || '', matrix.empfindung || ''].filter(Boolean)
              : [kentRem.latinName]),
          matchedIndications: existingRec?.matchedIndications || remedy.mainIndications.slice(0, 2),
          matchedKeynotes: existingRec?.matchedKeynotes || remedy.keynotes.slice(0, 2),
          matchedModalities:
            existingRec?.matchedModalities ||
            [remedy.modalitiesBetter[0], remedy.modalitiesWorse[0]].filter(Boolean),
          clinicalRationale: rationale,
          differentialNote:
            idx > 0
              ? existingRec?.differentialNote ||
                t('hahnemannDiffVersusPrimaryNote', {
                  primary: kentRepertorisation.remedies[0]?.latinName || '',
                })
              : undefined,
          isPrimarySimile: idx === 0,
        };

        matchedFromKent.push({
          remedy,
          rec: matchResult,
          isRecommended: idx === 0,
          index: idx,
          kentSummary: kentRem,
        });
      });

      return matchedFromKent;
    }

    if (recommendations.length > 0) {
      return recommendations.map((rec, index) => ({
        remedy: rec.remedy,
        rec,
        isRecommended: index === 0,
        index,
        kentSummary: undefined as any,
      }));
    }
    return [];
  }, [isClarificationApplied, hahnemannData, kentRepertorisation, localizedRemedies, recommendations, currentLang, t]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Handle Speech Recording (60s Max for Acute Focus)
  const startVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
      return;
    }

    if (!isSpeechSupported) return;

    recordingBaseTextRef.current = symptomText;
    lastSpokenTranscriptRef.current = '';
    isFinalizingRef.current = false;
    setRecordSecondsLeft(60);
    setIsRecording(true);

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
          stopVoiceRecording();
        }
      },
    });

    recognitionRef.current = session;

    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = window.setInterval(() => {
      setRecordSecondsLeft((prev) => {
        if (prev <= 1) {
          stopVoiceRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopVoiceRecording = () => {
    isFinalizingRef.current = true;
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setSymptomText((prev) => deduplicateRepeatedPhrases(prev));
  };

  const handleClearSymptomText = () => {
    setSymptomText('');
    setVariableOverrides({});
    setRecommendations([]);
    setDiffResult(null);
    setAcuteAnswers({});
    setExpertResult(null);
    setIsClarificationApplied(false);
    setHahnemannData(null);
  };

  const handleCopyRecommendation = (rec: SymptomMatchResult) => {
    const textToCopy = `${rec.remedy.latinName} (${rec.remedy.commonName})\n${t('rationaleHeader')}: ${rec.clinicalRationale}\n${t('materiaDosageLabel')}: ${rec.remedy.potenciesAndDosage}`;
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(rec.remedy.id);
    setTimeout(() => {
      setCopySuccess(null);
    }, 2000);
  };

  const handleOpenRemedyModal = (remedy: LocalizedRemedy) => {
    setModalHistory([]);
    setSelectedRemedyForModal(remedy);
  };

  const handleNavigateToRemedy = (targetRemedy: LocalizedRemedy) => {
    if (selectedRemedyForModal) {
      setModalHistory((prev) => [...prev, selectedRemedyForModal]);
    }
    setSelectedRemedyForModal(targetRemedy);
  };

  const handleBackModal = () => {
    if (modalHistory.length > 0) {
      const prev = modalHistory[modalHistory.length - 1];
      setModalHistory((history) => history.slice(0, history.length - 1));
      setSelectedRemedyForModal(prev);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header Card (Uniform Falldokumentation Design) */}
      {!isHahnemannWizardOpen && (
        <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 font-serif">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900 font-serif">
                    {t('tabQuickIntake')}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs">
                    {t('acuteIntakeBadge')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('quickIntakePageSubtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onGoToMateriaMedica && (
                <button
                  type="button"
                  onClick={onGoToMateriaMedica}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                  <span>{t('tabMateriaMedica')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Structured 3-Column Meta Grid (Exact match with Falldokumentation's metadata row) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100/80">
                <Mic className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-slate-400 font-medium">{t('acuteFeatureVoice')}</span>
                <span className="font-semibold text-slate-800 text-xs truncate block">{t('acuteFeatureVoiceSub')}</span>
              </div>
            </div>
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100/80">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-slate-400 font-medium">{t('acuteFeatureAnalysis')}</span>
                <span className="font-semibold text-slate-800 text-xs truncate block">{t('acuteFeatureAnalysisSub')}</span>
              </div>
            </div>
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100/80">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-slate-400 font-medium">{t('acuteFeatureRemedies')}</span>
                <span className="font-semibold text-slate-800 text-xs truncate block">{t('acuteFeatureRemediesSub')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Intake Card: Single Full-Width Voice & Text Recording Hub */}
      <div className="w-full animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col space-y-4 relative overflow-hidden">
          {isHahnemannWizardOpen ? (
            <ComplaintQuestionsWizardModal
              isOpen={true}
              inline={true}
              onClose={() => {
                setIsHahnemannWizardOpen(false);
                setPreloadedHahnemannAnalysis(null);
              }}
              chiefComplaint={symptomText || activeHauptbeschwerde || ''}
              initialCaseType="akut"
              preloadedAnalysis={preloadedHahnemannAnalysis}
              initialMatrix={buildCurrentMatrix()}
              onTransferToAnamnese={(data) => {
                setHahnemannData(data);
                setIsHahnemannWizardOpen(false);
                setPreloadedHahnemannAnalysis(null);
                setIsClarificationApplied(true);
                const matrix = data.matrix;
                setVariableOverrides(prev => ({
                  ...prev,
                  causa: matrix.causa || prev.causa,
                  modalitaeten: matrix.modalitaeten || prev.modalitaeten,
                  begleitsymptome: (matrix.begleitsymptome && matrix.begleitsymptome.length > 0) 
                    ? matrix.begleitsymptome.join(', ') 
                    : prev.begleitsymptome,
                  hauptbeschwerde: matrix.lokalisierung 
                    ? (matrix.empfindung ? `${matrix.lokalisierung} - ${matrix.empfindung}` : matrix.lokalisierung) 
                    : prev.hauptbeschwerde,
                }));

                if (data.summaryText) {
                  setSymptomText(prev => prev ? `${prev}\n\n[${t('hahnemannOrganonTitle')}]\n${data.summaryText}` : data.summaryText);
                }
              }}
            />
          ) : (
            <>
          {/* Header Row: HAUPTBESCHWERDE & LEITSYMPTOM * on left, Eingabe löschen on right */}
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
              {t('mainComplaintTitle')}
            </label>

            {symptomText && (
              <button
                type="button"
                onClick={handleClearSymptomText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold cursor-pointer transition-colors"
                title={t('clearHauptbeschwerdeBtn')}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>{t('clearHauptbeschwerdeBtn')}</span>
              </button>
            )}
          </div>

          {/* Side-by-Side: Textarea on the left, Vertical Aufnahme Button on the right */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            {/* Textarea container */}
            <div className="relative flex-1">
              <textarea
                rows={5}
                value={symptomText}
                onChange={(e) => {
                  setSymptomText(e.target.value);
                  setIsClarificationApplied(false);
                }}
                placeholder={t('recordedSymptomsPlaceholder')}
                className="w-full h-full min-h-[140px] p-4 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-none pr-9 shadow-2xs"
              />
              {symptomText && (
                <button
                  type="button"
                  onClick={handleClearSymptomText}
                  className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer transition-colors"
                  title={t('clearHauptbeschwerdeBtn')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Vertical Aufnahme Button matching image.png */}
            <button
              type="button"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              disabled={!isSpeechSupported}
              className={`w-full sm:w-32 md:w-36 shrink-0 rounded-xl text-white flex flex-col items-center justify-center gap-2.5 p-4 transition-all shadow-xs cursor-pointer min-h-[140px] border ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-700 animate-pulse border-rose-700'
                  : 'bg-[#00897b] hover:bg-[#00796b] border-teal-800/20'
              } ${!isSpeechSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white shadow-inner">
                {isRecording ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                {isRecording ? `${t('voiceStopBtn')} (${recordSecondsLeft}s)` : t('voiceRecordCardLabel')}
              </span>
            </button>
          </div>

          {/* Progress Bar for 60 Seconds when recording */}
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

          {!isSpeechSupported && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>{t('speechNotSupportedMsg')}</span>
            </div>
          )}

          {/* Single/Multiple Detected Complaints Separation Panel (ERKANNTES EINZELSYMPTOM) */}
          {symptomText.trim() && (() => {
            const detectedComplaints = splitMultipleComplaints(symptomText);
            if (detectedComplaints.length === 0) return null;
            return (
              <div className="p-4 bg-[#f0fdf9] rounded-2xl border border-teal-200/90 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-teal-700" />
                    {detectedComplaints.length > 1
                      ? t('separateComplaintsDetected', { count: detectedComplaints.length })
                      : t('singleSymptomDetected')}
                  </span>
                  <span className="text-xs text-teal-700 font-normal">
                    {t('autoComplaintSeparation')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {detectedComplaints.map((complaint, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-teal-300 text-xs font-semibold text-slate-800 shadow-2xs"
                    >
                      <span className="w-4 h-4 rounded-full bg-teal-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-900">{complaint}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Erkannte Symptome (Symptom Extraction Panel) matching image.png layout */}
          <div className="p-4 bg-slate-50/40 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {t('recognizedSymptomsTitle')}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 italic leading-relaxed">
                  {t('acuteVoiceAnalysisSubtitle')}
                </p>
              </div>

              {recognizedSymptoms.length > 0 ? (
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-md shrink-0 self-start sm:self-center">
                  {recognizedSymptoms.length} {t('recognizedSymptomsTitle')}
                </span>
              ) : (
                <span className="text-xs text-slate-400 shrink-0 self-start sm:self-center">
                  {t('noRecognizedSymptomsYet')}
                </span>
              )}
            </div>

            {orderedSymptoms.length > 0 && (
              <div className="pt-2 border-t border-slate-200/60 space-y-2">
                {orderedSymptoms.length > 1 && (
                  <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between bg-teal-50/60 px-2.5 py-1.5 rounded-lg border border-teal-100">
                    <span>
                      {language === 'de' ? 'Chronologische Reihenfolge anpassen (Reihenfolge bei Nacheinander):' : 'Adjust chronological order:'}
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  {orderedSymptoms.map((sym, idx) => (
                    <div
                      key={sym.id}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        {orderedSymptoms.length > 1 && (
                          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                        )}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          sym.category === 'leit' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                          sym.category === 'causa' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                          sym.category === 'modalitaet' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                          sym.category === 'empfindung' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                          sym.category === 'gemuet' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' :
                          'bg-teal-100 text-teal-900 border border-teal-200'
                        }`}>
                          {sym.categoryLabel}
                        </span>
                        <span className="font-semibold text-slate-900">{sym.label}</span>
                      </div>

                      {orderedSymptoms.length > 1 && (
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSymptom(idx, 'up')}
                            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-colors"
                            title={language === 'de' ? 'Nach oben verschieben' : 'Move up'}
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === orderedSymptoms.length - 1}
                            onClick={() => handleMoveSymptom(idx, 'down')}
                            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-colors"
                            title={language === 'de' ? 'Nach unten verschieben' : 'Move down'}
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recognizedTimeline && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-blue-50/85 border border-blue-200 text-xs text-blue-950 flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[11px] uppercase tracking-wider text-blue-900 mb-0.5">
                    {language === 'de' ? 'Erkannter zeitlicher Verlauf' : 'Recognized Timeline'}
                  </span>
                  <span>{recognizedTimeline}</span>
                </div>
              </div>
            )}
          </div>

          {/* Hahnemann Organon §§ 83-104 Anamnesis Launch or Completed Banner */}
          {(symptomText.trim().length > 0 || hahnemannData) && (
            !hahnemannData ? (
              <div className="w-full space-y-1.5 animate-in fade-in duration-200">
                <button
                  type="button"
                  disabled={isPreloadingHahnemann}
                  onClick={handleStartHahnemannAnalysis}
                  className={`w-full relative overflow-hidden py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-all border ${
                    isPreloadingHahnemann
                      ? 'bg-[#004e40] border-[#003d33] cursor-wait text-teal-100'
                      : 'bg-[#006655] hover:bg-[#005544] text-white border-[#005544] cursor-pointer'
                  }`}
                >
                  {isPreloadingHahnemann ? (
                    <>
                      <Loader2 className="w-4 h-4 text-teal-200 animate-spin shrink-0" />
                      <span className="truncate">{t('hahnemannAnalyzingPrompt')}</span>
                    </>
                  ) : (
                    <>
                      <Stethoscope className="w-4 h-4 text-teal-200 shrink-0" />
                      <span>{t('hahnemannLaunchFromAcuteVoice')}</span>
                    </>
                  )}

                  {/* Discreet, professional progress bar at the bottom of the button during evaluation */}
                  {isPreloadingHahnemann && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 overflow-hidden">
                      <div className="h-full bg-linear-to-r from-teal-300 via-emerald-200 to-teal-300 w-1/2 rounded-full animate-progress-shimmer" />
                    </div>
                  )}
                </button>

                {isPreloadingHahnemann && (
                  <p className="text-[11px] text-teal-800 text-center font-medium animate-pulse">
                    {t('hahnemannAnalyzingSub')}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-teal-50/90 border border-teal-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-teal-950 block">
                      {t('hahnemannAnamnesisCompletedBadge')}
                    </span>
                    <span className="text-[11px] text-teal-700">
                      {hahnemannData.caseType === 'chronisch' ? t('hahnemannCaseTypeChronicShort') : t('hahnemannCaseTypeAcuteShort')} • {hahnemannData.differentialRemedies?.slice(0, 3).join(', ')}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHahnemannWizardOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-teal-300 hover:bg-teal-100/50 text-teal-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-teal-700" />
                  <span>{t('hahnemannReopenBtn')}</span>
                </button>
              </div>
            )
          )}

          {/* Disclaimer: Not a case documentation matching image.png */}
          <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="leading-snug">
              {t('acuteQuestionsDisclaimer')}
            </span>
          </div>
            </>
          )}
        </div>
      </div>

      {/* Full-Width Remedies Grid (DRUNTER wie auf Bild 1) - ONLY rendered when isClarificationApplied === true and displayedRemedies.length > 0 */}
      {isClarificationApplied && displayedRemedies.length > 0 && (
        <div className="space-y-4 pt-2 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-3 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {hahnemannData ? t('hahnemannOrganonTitle') : t('evaluatedRemediesSectionTitle')}
                </h2>
                <p className="text-xs text-slate-500">
                  {hahnemannData ? t('hahnemannEvaluationSubtitle') : t('evaluatedRemediesSectionDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-3 py-1 rounded-full">
                {displayedRemedies.length} {t('recommendationsMatchesFound')}
              </span>
            </div>
          </div>

          {/* Clinical factors integrated confirmation bar / Hahnemann Organon §§ 83-104 Auswertung */}
          {hahnemannData ? (
            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-teal-950">
                  <Stethoscope className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>{t('hahnemannStructurePillars')}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    hahnemannData.caseType === 'chronisch'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-teal-100 text-teal-900 border border-teal-200'
                  }`}>
                    {hahnemannData.caseType === 'chronisch' ? t('hahnemannCaseTypeChronicShort') : t('hahnemannCaseTypeAcuteShort')}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-teal-800 bg-white border border-teal-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                  {t('hahnemannClinicalNoCustomerData')}
                </span>
              </div>

              {/* 6 Hahnemann Pillars Chips (Strictly symptom-based, no patient personal data) */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {hahnemannData.matrix.causa && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] text-slate-800 shadow-2xs font-medium">
                    <span className="font-bold text-blue-700 text-[10px] uppercase">{t('hahnemannPillarShortCausa')}:</span>
                    <span className="truncate max-w-[220px]">{hahnemannData.matrix.causa}</span>
                  </span>
                )}
                {hahnemannData.matrix.lokalisierung && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] text-slate-800 shadow-2xs font-medium">
                    <span className="font-bold text-teal-700 text-[10px] uppercase">{t('hahnemannPillarShortLokalisation')}:</span>
                    <span className="truncate max-w-[220px]">{hahnemannData.matrix.lokalisierung}</span>
                    {hahnemannData.matrix.strahlungsoptionen && (
                      <span className="text-slate-500 text-[10px]">({hahnemannData.matrix.strahlungsoptionen})</span>
                    )}
                  </span>
                )}
                {hahnemannData.matrix.empfindung && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] text-slate-800 shadow-2xs font-medium">
                    <span className="font-bold text-rose-700 text-[10px] uppercase">{t('hahnemannPillarShortSensation')}:</span>
                    <span className="truncate max-w-[220px]">{hahnemannData.matrix.empfindung}</span>
                  </span>
                )}
                {hahnemannData.matrix.modalitaeten && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] text-slate-800 shadow-2xs font-medium">
                    <span className="font-bold text-purple-700 text-[10px] uppercase">{t('hahnemannPillarShortModalitaeten')}:</span>
                    <span className="truncate max-w-[220px]">{hahnemannData.matrix.modalitaeten}</span>
                  </span>
                )}
                {hahnemannData.matrix.gemuet && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] text-slate-800 shadow-2xs font-medium">
                    <span className="font-bold text-indigo-700 text-[10px] uppercase">{t('hahnemannPillarShortGemuet')}:</span>
                    <span className="truncate max-w-[220px]">{hahnemannData.matrix.gemuet}</span>
                  </span>
                )}
                {hahnemannData.matrix.begleitsymptome && hahnemannData.matrix.begleitsymptome.length > 0 && (
                  <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] text-slate-800 shadow-2xs font-medium">
                    <span className="font-bold text-amber-700 text-[10px] uppercase">{t('hahnemannPillarShortBegleit')}:</span>
                    <span className="truncate max-w-[220px]">{hahnemannData.matrix.begleitsymptome.join(', ')}</span>
                  </span>
                )}
                {hahnemannData.matrix.ursaechlicher_zusammenhang && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] text-emerald-800 font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {t('hahnemannCausalityConfirmed')}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-wrap items-center gap-2 text-xs text-slate-700">
              <span className="font-bold text-teal-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                {t('step1Title')}:
              </span>
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px] text-slate-700 font-medium">
                {t('step1ChiefComplaint')}
              </span>
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px] text-slate-700 font-medium">
                {t('step1Causa')}
              </span>
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px] text-slate-700 font-medium">
                {t('step1Modalities')}
              </span>
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px] text-slate-700 font-medium">
                {t('step1Concomitants')}
              </span>
              {recognizedSymptoms.length > 0 && (
                <span className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md text-[11px] text-teal-800 font-medium">
                  {recognizedSymptoms.length} {t('recognizedSymptomsTitle')}
                </span>
              )}
              {Object.keys(acuteAnswers).length > 0 && (
                <span className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md text-[11px] text-teal-800 font-medium">
                  {Object.keys(acuteAnswers).length} {t('acuteQuestionsAnsweredCount')}
                </span>
              )}
            </div>
          )}

          {/* Mathematical Repertorisation (§ 153 nach Kent) */}
          <KentRepertorySection 
            matrix={hahnemannData?.matrix || null} 
            rawText={symptomText} 
            repertorisation={kentRepertorisation}
            defaultExpanded={true} 
          />

        {/* 3-Column Responsive Cards Grid matching Bild 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedRemedies.map(({ remedy, rec, isRecommended, index, kentSummary }) => {
            const authorsInfo = getRemedyClassicalAuthors(remedy.id);
            const hasAnyAuthors = authorsInfo.hahnemann || authorsInfo.kent || authorsInfo.hering || authorsInfo.boericke || authorsInfo.boger || authorsInfo.allen;

            return (
              <div
                key={remedy.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                  isRecommended && index === 0
                    ? 'border-teal-500 ring-2 ring-teal-500/25 bg-gradient-to-b from-teal-50/20 to-white hover:border-teal-600'
                    : 'border-slate-200/80 hover:border-teal-300'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Line: Latin Name + Category Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          index === 0 ? 'bg-teal-700 text-white' : 'bg-slate-700 text-white'
                        }`}>
                          #{index + 1}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors font-serif">
                          {remedy.latinName}
                        </h3>
                        {isRecommended && index === 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-700 text-white shadow-2xs tracking-wide">
                            <Sparkles className="w-3 h-3 text-teal-200" />
                            {t('step4RecommendedLabel')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-teal-800">
                        {remedy.commonName}
                      </div>
                      {hasAnyAuthors && (
                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          {authorsInfo.hahnemann && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60" title="Samuel Hahnemann">
                              S. Hahnemann
                            </span>
                          )}
                          {authorsInfo.kent && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200/60" title="James Tyler Kent">
                              J. T. Kent
                            </span>
                          )}
                          {authorsInfo.hering && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200/60" title="Constantine Hering">
                              C. Hering
                            </span>
                          )}
                          {authorsInfo.boericke && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60" title="William Boericke">
                              W. Boericke
                            </span>
                          )}
                          {authorsInfo.boger && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200/60" title="Cyrus Maxwell Boger">
                              C. M. Boger
                            </span>
                          )}
                          {authorsInfo.allen && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300/80" title="Henry C. Allen">
                              H. C. Allen
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                          remedy.categoryKey === 'plant'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : remedy.categoryKey === 'mineral'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}
                      >
                        {remedy.category}
                      </span>
                      {kentSummary ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                          <Award className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>{kentSummary.totalScore} {t('kentPointsAbbr')}</span>
                          <span className="text-[10px] text-amber-700 font-normal">({kentSummary.hits}/{kentSummary.totalRubrics})</span>
                        </span>
                      ) : rec ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                          <Sparkles className="w-3 h-3" />
                          {rec.matchScore}%
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* If Recommended Match, show Simile Status Badge for alternatives */}
                  {rec && index > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {t('diffDiagAlternative')}
                      </span>
                    </div>
                  )}

                  {/* Localized Essence */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {remedy.essence}
                  </p>

                  {/* Clinical Rationale (Prominently highlighted for recommended simile) */}
                  {(rec?.clinicalRationale || (index === 0 && expertResult?.recommendedSimile?.rationale)) && (
                    <div className={`p-3 rounded-xl text-xs space-y-1.5 ${
                      index === 0
                        ? 'bg-teal-50/90 border-2 border-teal-300/80 text-teal-950 shadow-2xs'
                        : 'bg-slate-50 border border-slate-200/80 text-slate-700'
                    }`}>
                      <div className="font-bold flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-teal-900">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="uppercase tracking-wider">
                            {index === 0 ? t('step4RationaleLabel') : t('rationaleHeader')}:
                          </span>
                        </div>
                        {index === 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-700 text-white">
                            {t('diffDiagPrimarySimile')}
                          </span>
                        )}
                      </div>
                      <p className="leading-relaxed text-[11px] text-slate-700">
                        {rec?.clinicalRationale ||
                          (index === 0 && expertResult?.recommendedSimile?.remedyName?.toLowerCase().includes(remedy.latinName.toLowerCase().split(' ')[0])
                            ? expertResult.recommendedSimile.rationale
                            : remedy.essence)}
                      </p>
                    </div>
                  )}

                  {/* Keynotes */}
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

                  {/* Modalities (Besser / Schlechter) */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-100/60 text-[11px] text-emerald-900">
                      <span className="font-bold flex items-center gap-1 text-emerald-800">
                        <Snowflake className="w-2.5 h-2.5" /> {t('remedyBetter')}:
                      </span>
                      <p className="truncate mt-0.5">{remedy.modalitiesBetter[0] || '—'}</p>
                    </div>
                    <div className="bg-rose-50/70 p-2 rounded-lg border border-rose-100/60 text-[11px] text-rose-900">
                      <span className="font-bold flex items-center gap-1 text-rose-800">
                        <Flame className="w-2.5 h-2.5" /> {t('remedyWorse')}:
                      </span>
                      <p className="truncate mt-0.5">{remedy.modalitiesWorse[0] || '—'}</p>
                    </div>
                  </div>

                  {/* Differential Note (Distinction to primary) */}
                  {rec?.differentialNote && (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-0.5">
                      <span className="font-semibold text-slate-900 text-[11px] block">
                        {t('diffDiagDistinctionToPrimary')}:
                      </span>
                      <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px]">
                        {rec.differentialNote}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Action Bar */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[130px]">
                    {remedy.potenciesAndDosage.split('.')[0]}
                  </span>

                  <div className="flex items-center gap-2">
                    {onSelectRemedyForCase && (
                      <button
                        type="button"
                        onClick={() => {
                          const defaultPotency = remedy.potenciesAndDosage.match(/[CDLM]\s*\d+/i)?.[0] || 'C30';
                          onSelectRemedyForCase(remedy.latinName, defaultPotency);
                        }}
                        className="text-xs font-semibold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded-md border border-teal-200 flex items-center gap-1 transition-colors cursor-pointer"
                        title={t('btnApplyToCase')}
                      >
                        <Plus className="w-3 h-3 text-teal-600" />
                        <span className="hidden sm:inline">{t('btnApplyToCase')}</span>
                      </button>
                    )}

                    {rec && (
                      <button
                        type="button"
                        onClick={() => handleCopyRecommendation(rec)}
                        className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                        title={t('copyBtn')}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}

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
              </div>
            );
          })}
        </div>

        {/* Differential Excluded Remedies Section */}
        {diffResult && diffResult.excludedRemedies.length > 0 && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
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

      {/* When clarification has been applied but no remedy candidates matched */}
      {isClarificationApplied && displayedRemedies.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
          <div className="text-sm font-bold text-slate-800">
            {t('noRemediesFoundTitle')}
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t('noRemediesFoundDesc')}
          </p>
        </div>
      )}

      {/* DETAILED REMEDY MONOGRAPH MODAL */}
      <RemedyMonographModal
        isOpen={Boolean(selectedRemedyForModal)}
        remedy={selectedRemedyForModal}
        onClose={() => {
          setSelectedRemedyForModal(null);
          setModalHistory([]);
        }}
        allRemedies={localizedRemedies}
        modalHistory={modalHistory}
        onBackModal={handleBackModal}
        onNavigateToRemedy={handleNavigateToRemedy}
        onSelectRemedyForCase={onSelectRemedyForCase}
      />

      {/* Logical Acute Clarification Questions Popup */}
      <AcuteClarificationModal
        isOpen={showClarificationModal}
        onClose={() => setShowClarificationModal(false)}
        symptomText={comprehensiveCaseText || symptomText || activeHauptbeschwerde || ''}
        initialAnswers={acuteAnswers}
        onApplyAnswers={(answers) => {
          setAcuteAnswers(answers);
          setIsClarificationApplied(true);
        }}
      />

      {/* Acute Variable Editing Modal (per Voice or Text) */}
      {editingVariable && (
        <AcuteVariableModal
          isOpen={Boolean(editingVariable)}
          variableKey={editingVariable}
          currentValue={
            editingVariable === 'hauptbeschwerde' ? activeHauptbeschwerde :
            editingVariable === 'causa' ? activeCausa :
            editingVariable === 'modalitaeten' ? activeModalitaeten :
            editingVariable === 'begleitsymptome' ? activeBegleitsymptome : ''
          }
          onClose={() => setEditingVariable(null)}
          onSave={(varKey, val) => handleSaveVariable(varKey, val)}
        />
      )}
    </div>
  );
};
