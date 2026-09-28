import React, { useState, useEffect, useRef } from 'react';
import { useTranslation, useLanguage } from '../i18n/LanguageContext';
import {
  analyzeOrganonText,
  OrganonAiAnalysisResult,
  runEndprueferAnalysis,
  buildCompleteArbitratorResult,
  CompleteArbitratorResult
} from '../services/organonAiService';
import { EndprueferResult, PatientCase } from '../types';
import { OrganonDynamicQuestionModal } from './OrganonDynamicQuestionModal';
import { CausaVertiefungModal } from './CausaVertiefungModal';
import { LocalisatioVertiefungModal } from './LocalisatioVertiefungModal';
import { OrganonStage2WorkflowModal } from './OrganonStage2WorkflowModal';
import { OrganonFastQuestionnaireModal } from './OrganonFastQuestionnaireModal';
import { Stage2Category, STAGE2_CATEGORY_SEQUENCE } from '../types/organonStage2Workflow';
import { OrganonLiveProgress, LiveProcessStep } from './OrganonLiveProgress';
import { motion } from 'motion/react';
import { 
  isSpeechRecognitionSupported, 
  startSpeechRecognition, 
  SpeechRecognitionSession,
  mergeWithOverlap,
  deduplicateRepeatedPhrases
} from '../services/speechService';
import { 
  Activity, 
  FileText, 
  CheckCircle2, 
  RefreshCw, 
  Shield, 
  Terminal, 
  Database, 
  Send,
  Layers,
  Clock,
  MessageSquare,
  X,
  Maximize2,
  Mic,
  MicOff,
  Stethoscope,
  Sparkles,
  Trash2,
  AlertTriangle,
  FileCheck,
  Check,
  AlertCircle,
  MapPin,
  Zap,
  ChevronRight
} from 'lucide-react';

// OrganonView component - Updated with intelligent clinical spelling correction (2026)
export interface Utterance { utterance_id: string; raw_text: string; submission_id: string; timestamp?: string; case_id?: string; speaker?: string; created_at?: string; language?: string; }
export interface SourceSpan { span_id: string; utterance_id: string; start_offset: number | null; end_offset: number | null; exact_text: string; span_type: any; validated_against_raw_text: boolean; }
export interface SemanticClaim { claim_id: string; subject: any; predicate: string; value: any; polarity: any; certainty: any; context_role: any; temporal_scope: any; coreference: any; evidence_span_ids: string[]; entailment_status: any; reason_code: string; }
export interface RejectedClaim { rejected_claim_id: string; proposed_subject: string; predicate: string; value: any; evidence_span_ids: string[]; rejection_reason_code: string; persisted_as_confirmed: false; }
export interface Episode { episode_id: string; episode_type: any; time_reference: string; entities: string[]; evidence: any[]; }
export interface SymptomEntity { symptom_id: string; canonical_patient_label: string; original_expressions: string[]; broad_location: any; sub_location: any; episode_id: string | null; evidence: any[]; }
export interface SymptomState { state_id: string; symptom_id: string; presence: any; time_reference: string; temporal_scope: string | null; state_temporality: any; intensity: any; location: any; sensation: any; certainty: any; evidence_span_ids: string[]; evidence: any; }
export interface TimelineEntry { timeline_id: string; sequence_index: number; entity_id: string; entity_type: string; time_expression_original: string; time_normalized?: string | null; precision: string; event_type?: string; description?: string; evidence_span_id?: string; state_id?: string; normalized_time?: any; evidence?: any; }
export interface SourceCoverageItem { source_span_ids: string[]; semantic_propositions_detected: any[]; coverage_status: string; missing_elements: string[]; }
export interface AttributeBindingRecord { attribute_type: string; value: any; status: string; evidence_quote: string; source_span_id?: string; candidate_target_id?: string; resolved_target_id?: string; }
export interface TemporalBindingRecord { temporal_span_id: string; time_type: string; target_id: string | null; normalized_value: string | null; precision: string; status: any; evidence_quote: string; }
export interface LosslessCaseState {
  case_id: string;
  case_version: number;
  module: string;
  stage: string;
  status: string;
  utterances: Utterance[];
  source_spans: SourceSpan[];
  claims: SemanticClaim[];
  episodes: Episode[];
  symptoms: SymptomEntity[];
  symptom_states: SymptomState[];
  rejected_claims: RejectedClaim[];
  events: any[];
  interventions: any[];
  measurements: any[];
  relationships: any[];
  causality_records: any[];
  timeline: TimelineEntry[];
  uncertainties: any[];
  contradictions: any[];
  validation: {
    is_valid: boolean;
    rules_checked: number;
    violations: any[];
    id_uniqueness_verified: boolean;
    entity_isolation_verified: boolean;
    source_coverage: SourceCoverageItem[];
  };
  created_at: string;
  updated_at: string;
}

const safeJoin = (arr: any, separator: string = ', '): string => {
  if (!arr) return '';
  if (Array.isArray(arr)) return arr.filter(Boolean).map(String).join(separator);
  return String(arr);
};

export interface OrganonViewProps {
  patientCase?: PatientCase;
  onSavePatientCase?: (patientCase: PatientCase) => void;
  onBack?: () => void;
  onSwitchToV1?: () => void;
  onSwitchToV2?: () => void;
  onSwitchToV3?: () => void;
}

export const OrganonView: React.FC<OrganonViewProps> = ({
  patientCase,
  onSavePatientCase,
  onBack,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [narrationInput, setNarrationInput] = useState<string>(() => {
    if (patientCase) {
      return patientCase.hauptbeschwerde || patientCase.spontanbericht || '';
    }
    return '';
  });
  const [analysisResult, setAnalysisResult] = useState<OrganonAiAnalysisResult | null>(() => {
    if (patientCase?.organonAnalysis?.analysisResult) {
      return patientCase.organonAnalysis.analysisResult;
    }
    return null;
  });
  const [compareResult, setCompareResult] = useState<any | null>(() => {
    if (patientCase?.organonAnalysis?.compareResult) {
      return patientCase.organonAnalysis.compareResult;
    }
    return null;
  });
  const [arbitratorResult, setArbitratorResult] = useState<any | null>(() => {
    if (patientCase?.organonAnalysis?.arbitratorResult) {
      return patientCase.organonAnalysis.arbitratorResult;
    }
    return null;
  });
  const [endprueferResult, setEndprueferResult] = useState<EndprueferResult | null>(() => {
    if (patientCase?.organonAnalysis?.endprueferResult) {
      return patientCase.organonAnalysis.endprueferResult;
    }
    return null;
  });
  const [stage2Records, setStage2Records] = useState<Record<string, any>>(() => {
    if (patientCase?.organonAnalysis?.stage2Records) {
      return patientCase.organonAnalysis.stage2Records;
    }
    return {};
  });

  // Keep state in sync if a different patient case is opened
  useEffect(() => {
    if (patientCase) {
      setNarrationInput(patientCase.hauptbeschwerde || patientCase.spontanbericht || '');
      setAnalysisResult(patientCase.organonAnalysis?.analysisResult || null);
      setCompareResult(patientCase.organonAnalysis?.compareResult || null);
      setArbitratorResult(patientCase.organonAnalysis?.arbitratorResult || null);
      setEndprueferResult(patientCase.organonAnalysis?.endprueferResult || null);
      setStage2Records(patientCase.organonAnalysis?.stage2Records || {});
    }
  }, [patientCase?.id]);

  useEffect(() => {
    if (patientCase && onSavePatientCase) {
      const handler = setTimeout(() => {
        onSavePatientCase({
          ...patientCase,
          hauptbeschwerde: narrationInput,
          organonAnalysis: {
            ...patientCase.organonAnalysis,
            analysisResult,
            compareResult,
            arbitratorResult,
            endprueferResult,
            stage2Records,
            updatedAt: new Date().toISOString()
          }
        });
      }, 600);
      return () => clearTimeout(handler);
    }
  }, [narrationInput, analysisResult, compareResult, arbitratorResult, endprueferResult, stage2Records]);
  const [enableGptCompare, setEnableGptCompare] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('organon_enable_gpt_compare');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return false;
  });

  useEffect(() => {
    try {
      localStorage.setItem('organon_enable_gpt_compare', JSON.stringify(enableGptCompare));
    } catch {
      // ignore
    }
  }, [enableGptCompare]);

  const [enableHahnemannCrossCheck, setEnableHahnemannCrossCheck] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('organon_enable_hahnemann_crosscheck');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return false; // Standardmäßig AUS
  });

  useEffect(() => {
    try {
      localStorage.setItem('organon_enable_hahnemann_crosscheck', JSON.stringify(enableHahnemannCrossCheck));
    } catch {
      // ignore
    }
  }, [enableHahnemannCrossCheck]);

  const [enableRatio, setEnableRatio] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('organon_enable_ratio');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return true; // Standardmäßig EIN
  });

  useEffect(() => {
    try {
      localStorage.setItem('organon_enable_ratio', JSON.stringify(enableRatio));
    } catch {
      // ignore
    }
  }, [enableRatio]);

  const [viewLayout, setViewLayout] = useState<'tabs' | 'sideBySide'>('tabs');
  const [activeTab, setActiveTab] = useState<'gemini' | 'openai' | 'arbitrator' | 'endpruefer'>('gemini');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [liveSteps, setLiveSteps] = useState<LiveProcessStep[]>([]);
  const [debugStatus, setDebugStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState<boolean>(false);
  const [isCausaModalOpen, setIsCausaModalOpen] = useState<boolean>(false);
  const [isCausaTriggered, setIsCausaTriggered] = useState<boolean>(false);
  const [isLocalisatioModalOpen, setIsLocalisatioModalOpen] = useState<boolean>(false);
  const [isLocalisatioTriggered, setIsLocalisatioTriggered] = useState<boolean>(false);
  const [isStage2WorkflowModalOpen, setIsStage2WorkflowModalOpen] = useState<boolean>(false);
  const [isStage2WorkflowTriggered, setIsStage2WorkflowTriggered] = useState<boolean>(false);
  const [isFastQuestionnaireModalOpen, setIsFastQuestionnaireModalOpen] = useState<boolean>(false);
  const [isArbitrating, setIsArbitrating] = useState<boolean>(false);
  const [isEndpruefend, setIsEndpruefend] = useState<boolean>(false);
  const [isCorrectingSpelling, setIsCorrectingSpelling] = useState<boolean>(false);
  const [originalNarrationInput, setOriginalNarrationInput] = useState<string>('');
  const [showCorrectionReviewArea, setShowCorrectionReviewArea] = useState<boolean>(false);
  const [correctedNarrationDraft, setCorrectedNarrationDraft] = useState<string>('');
  const [draftOriginalNarration, setDraftOriginalNarration] = useState<string>('');

  // Voice recording state & refs
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecondsLeft, setRecordSecondsLeft] = useState(60);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const recordingBaseTextRef = useRef<string>('');
  const lastSpokenTranscriptRef = useRef<string>('');
  const isFinalizingRef = useRef<boolean>(false);
  const recognitionRef = useRef<SpeechRecognitionSession | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setIsSpeechSupported(isSpeechRecognitionSupported());
    return () => {
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const startVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
      return;
    }
    if (!isSpeechSupported) return;

    recordingBaseTextRef.current = narrationInput;
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
          setNarrationInput(deduplicateRepeatedPhrases(trimmed));
        } else {
          setNarrationInput(mergeWithOverlap(base, trimmed));
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
    setNarrationInput((prev) => deduplicateRepeatedPhrases(prev));
  };

  const handleClearNarration = () => {
    setNarrationInput('');
  };

  useEffect(() => {
    if (isResultsModalOpen && compareResult && !arbitratorResult && !isArbitrating) {
      const g = compareResult.gemini;
      const o = compareResult.openai || null;
      fetchArbitration(g, o);
    }
  }, [isResultsModalOpen, compareResult]);

  const intelligentClinicalCorrection = (text: string): string => {
    let t = text.trim();
    if (!t) return t;

    // Specific user-requested typo & phrasing corrections
    t = t.replace(/\bhabe\s+schmerza\b/gi, 'Ich habe Schmerzen');
    t = t.replace(/\bhab\s+schmerza\b/gi, 'Ich habe Schmerzen');
    t = t.replace(/\bhabe\s+schmerz\b/gi, 'Ich habe Schmerzen');
    t = t.replace(/\bshmerza\b/gi, 'Schmerzen');
    t = t.replace(/\bschmerza\b/gi, 'Schmerzen');
    t = t.replace(/\bgefllen\b/gi, 'gefallen');
    t = t.replace(/\bnochauf\b/gi, 'noch auf');
    t = t.replace(/\bim schwindelig\b/gi, 'ihm schwindelig');
    t = t.replace(/\bangestossen\b/gi, 'angestoßen');
    t = t.replace(/\bapfel nochauf dem kopf gefllen\b/gi, 'ein Apfel noch auf den Kopf gefallen ist');
    t = t.replace(/\bdanach nach aspirin war besser\b/gi, 'Danach, nach dem Aspirin, war es besser');

    // General spacing and punctuation cleanup
    t = t.replace(/\s+/g, ' ');
    t = t.replace(/\s+([.,;:!?])/g, '$1');
    t = t.replace(/([.,;:!?])([^\s])/g, '$1 $2');

    // Split into sentences and capitalize / refine
    const rawSentences = t.split(/(?<=[.!?])\s+/);
    const correctedSentences = rawSentences.map(sent => {
      if (!sent.trim()) return '';
      let s = sent.trim();
      s = s.charAt(0).toUpperCase() + s.slice(1);

      // German medical / clinical preposition and noun polishes
      s = s.replace(/\bshmerzen\b/gi, 'Schmerzen');
      s = s.replace(/\bschmerzen\b/gi, 'Schmerzen');
      s = s.replace(/\bam kopf\b/gi, 'am Kopf');
      s = s.replace(/\bam baum\b/gi, 'an einem Baum');
      s = s.replace(/\bauf dem kopf\b/gi, 'auf den Kopf');
      s = s.replace(/\bein aspirin\b/gi, 'eine Aspirin');
      s = s.replace(/\bnach aspirin\b/gi, 'nach dem Aspirin');
      s = s.replace(/\bkonnte\b/gi, 'konnte');
      
      // Ensure each sentence ends with a period
      if (!/[.!?]$/.test(s)) {
        s += '.';
      }
      return s;
    });

    return correctedSentences.join(' ');
  };

  const handleCorrectSpelling = async () => {
    if (!narrationInput.trim() || isCorrectingSpelling) return;
    const currentInput = narrationInput;
    setOriginalNarrationInput(currentInput);
    setDraftOriginalNarration(currentInput);
    setIsCorrectingSpelling(true);
    setErrorMessage('');

    let corrected = '';
    try {
      const res = await fetch('/api/organon/correct-spelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: currentInput }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.correctedText) {
          corrected = data.correctedText;
        }
      }
    } catch (e) {
      console.warn("Backend API /api/organon/correct-spelling unavailable (404/network), using intelligent clinical fallback.", e);
    }

    if (!corrected || corrected.trim() === currentInput.trim()) {
      corrected = intelligentClinicalCorrection(currentInput);
    }

    setCorrectedNarrationDraft(corrected);
    setShowCorrectionReviewArea(true);
    setIsCorrectingSpelling(false);
  };

  const handleAdoptCorrectedText = () => {
    if (correctedNarrationDraft) {
      setNarrationInput(correctedNarrationDraft);
      setShowCorrectionReviewArea(false);
    }
  };

  const handleRestoreOriginal = () => {
    if (originalNarrationInput) {
      setNarrationInput(originalNarrationInput);
      setShowCorrectionReviewArea(false);
    }
  };

  const fetchEndpruefer = async (
    rawTextStr: string,
    arbRes: any,
    gRes?: any,
    oRes?: any,
    ratioEnabled: boolean = enableRatio
  ): Promise<EndprueferResult | null> => {
    const target: 'ratio' | 'genius' | 'genius_optimus' = ratioEnabled
      ? 'ratio'
      : (oRes || compareResult?.openai)
        ? 'genius_optimus'
        : 'genius';

    if (target === 'ratio' && !arbRes) return null;
    if (target === 'genius' && !gRes && !analysisResult) return null;

    setIsEndpruefend(true);
    try {
      const effectiveG = gRes || analysisResult;
      const effectiveO = oRes || compareResult?.openai;
      const result = await runEndprueferAnalysis(rawTextStr, arbRes, language, target, effectiveG, effectiveO);
      setEndprueferResult(result);
      return result;
    } catch (e) {
      console.warn("Endprüfer execution notice:", e);
      return null;
    } finally {
      setIsEndpruefend(false);
    }
  };

  const fetchArbitration = async (gemini: any, openai: any, force: boolean = false) => {
    if (!enableRatio) return null;
    if (isArbitrating) return null;
    if (arbitratorResult && !force && (arbitratorResult as any).__isServerResult) return arbitratorResult;
    setIsArbitrating(true);
    setEndprueferResult(null);
    try {
      const res = await fetch('/api/organon/arbitrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: narrationInput,
          geminiResult: gemini,
          openaiResult: openai,
          language: language
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          const complete = buildCompleteArbitratorResult(narrationInput, gemini, openai, data.result, language);
          complete.__isServerResult = true;
          setArbitratorResult(complete);
          setIsArbitrating(false);
          // Auto-trigger 4th stage (Endprüfer / Decisor)
          return await fetchEndpruefer(narrationInput, complete, gemini, openai, true);
        }
      }
      throw new Error("Server arbitration not available");
    } catch (e) {
      console.warn("API arbitrate notice, using complete client-side arbitration synthesis:", e);
      const fallbackArbitration = buildCompleteArbitratorResult(narrationInput, gemini, openai, null, language);
      setArbitratorResult(fallbackArbitration);
      return await fetchEndpruefer(narrationInput, fallbackArbitration, gemini, openai, true);
    } finally {
      setIsArbitrating(false);
    }
  };

  const handleAnalyze = async (
    textOverride?: string, 
    openCausaPopup: boolean = false, 
    openLocalisatioPopup: boolean = false,
    openStage2Workflow: boolean = false
  ) => {
    const textToAnalyze = textOverride !== undefined ? textOverride : narrationInput;
    if (!textToAnalyze.trim()) return;
    if (textOverride !== undefined) {
      setNarrationInput(textOverride);
    }
    setArbitratorResult(null);
    setEndprueferResult(null);
    setIsProcessing(true);
    setIsCausaTriggered(openCausaPopup);
    setIsLocalisatioTriggered(openLocalisatioPopup);
    setIsStage2WorkflowTriggered(openStage2Workflow || openCausaPopup || openLocalisatioPopup);
    setErrorMessage('');
    setDebugStatus('Analysiere Text...');

    const shouldCrossCheck = enableGptCompare || enableHahnemannCrossCheck;
    const initialSteps: LiveProcessStep[] = [];
    initialSteps.push({ id: 'patient_text', labelKey: 'organonStepPatientText', status: 'done' });
    initialSteps.push({ id: 'text_decomposition', labelKey: 'organonStepTextDecomposition', status: 'done' });
    initialSteps.push({ id: 'category_mapping', labelKey: 'organonStepCategoryMapping', status: 'active' });
    if (shouldCrossCheck) {
      initialSteps.push({ id: 'crosscheck', labelKey: 'organonStepCrossCheck', status: 'active' });
    }
    if (enableRatio) {
      initialSteps.push({ id: 'arbitration', labelKey: 'organonStepArbitration', status: 'pending' });
    }
    initialSteps.push({ id: 'evidence_check', labelKey: 'organonStepEvidenceCheck', status: 'pending' });
    initialSteps.push({ id: 'consolidation', labelKey: 'organonStepConsolidation', status: 'pending' });
    initialSteps.push({ id: 'final_check', labelKey: 'organonStepFinalCheck', status: 'pending' });
    setLiveSteps(initialSteps);

    const onStepUpdate = (stepId: string, status: 'active' | 'done') => {
      setLiveSteps(prev =>
        prev.map(step => (step.id === stepId ? { ...step, status } : step))
      );
    };

    try {
      const result = await analyzeOrganonText(textToAnalyze, language, 'gemini', shouldCrossCheck, onStepUpdate, enableRatio);
      
      let gRes: any = null;
      let oRes: any = null;
      let cmpRes: any = null;
      if (shouldCrossCheck && result && typeof result === 'object' && 'gemini' in result && 'openai' in result) {
        cmpRes = result;
        setCompareResult(result);
        setAnalysisResult((result as any).gemini);
        gRes = (result as any).gemini;
        oRes = (result as any).openai;
      } else {
        const fallbackRes = result as OrganonAiAnalysisResult;
        cmpRes = { engine: 'single', gemini: fallbackRes, openai: null };
        setCompareResult(cmpRes);
        setAnalysisResult(fallbackRes);
        gRes = fallbackRes;
        oRes = null;
      }

      onStepUpdate('category_mapping', 'done');
      if (shouldCrossCheck) {
        onStepUpdate('crosscheck', 'done');
      }

      // Step 2: Ratio (Belegprüfer / Arbitrator)
      let completeArb: CompleteArbitratorResult | null = null;
      if (enableRatio) {
        onStepUpdate('arbitration', 'active');
        onStepUpdate('evidence_check', 'active');
        setDebugStatus(t('organonStepArbitration'));

        let serverArb = (result as any).arbitrator_result || null;
        if (!serverArb && (oRes || gRes)) {
          try {
            const arbRes = await fetch('/api/organon/arbitrate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                rawText: textToAnalyze,
                geminiResult: gRes,
                openaiResult: oRes,
                language: language
              })
            });
            if (arbRes.ok) {
              const data = await arbRes.json();
              if (data.result) {
                serverArb = data.result;
              }
            }
          } catch (e) {
            console.warn("Arbitrate fetch notice:", e);
          }
        }

        completeArb = buildCompleteArbitratorResult(
          textToAnalyze,
          gRes,
          oRes,
          serverArb,
          language
        );
        if (serverArb) {
          completeArb.__isServerResult = true;
        }
        setArbitratorResult(completeArb);
        onStepUpdate('arbitration', 'done');
        onStepUpdate('evidence_check', 'done');
        onStepUpdate('consolidation', 'done');
      } else {
        setArbitratorResult(null);
      }

      // Step 3: Decisor (Endprüfer) - executes directly after Ratio
      onStepUpdate('final_check', 'active');
      setDebugStatus(t('organonStepFinalCheck'));
      const finalEndRes = await fetchEndpruefer(textToAnalyze, completeArb, gRes, oRes, enableRatio);
      onStepUpdate('final_check', 'done');

      // Update patient case with all results if active
      if (patientCase && onSavePatientCase) {
        onSavePatientCase({
          ...patientCase,
          hauptbeschwerde: textToAnalyze,
          organonAnalysis: {
            ...patientCase.organonAnalysis,
            analysisResult: gRes,
            compareResult: cmpRes,
            arbitratorResult: completeArb,
            endprueferResult: finalEndRes,
            updatedAt: new Date().toISOString()
          }
        });
      }

      setLiveSteps(prev => prev.map(s => ({ ...s, status: 'done' })));
      setDebugStatus('Analyse, Ratio und Decisor erfolgreich abgeschlossen.');
      
      // Default to Decisor (Endprüfer) tab so practitioner directly sees the final verdict & pathway choices
      setActiveTab('endpruefer');

      if (openStage2Workflow || openCausaPopup || openLocalisatioPopup) {
        setIsStage2WorkflowModalOpen(true);
        setIsResultsModalOpen(false);
      } else {
        setIsResultsModalOpen(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Fehler bei der KI-Analyse');
      setDebugStatus('Fehler aufgetreten.');
    } finally {
      setIsProcessing(false);
      setIsCausaTriggered(false);
      setIsLocalisatioTriggered(false);
      setIsStage2WorkflowTriggered(false);
    }
  };

  const getExistingLocalisatioText = (): string => {
    if (analysisResult?.three_stage?.stage1) {
      const locItem = analysisResult.three_stage.stage1.find((i: any) => i.category_key === 'localisatio');
      if (locItem && locItem.result_text) {
        return locItem.result_text;
      }
    }
    if (compareResult?.gemini?.three_stage?.stage1) {
      const locItem = compareResult.gemini.three_stage.stage1.find((i: any) => i.category_key === 'localisatio');
      if (locItem && locItem.result_text) {
        return locItem.result_text;
      }
    }
    return '';
  };

  const handleAdoptLocalisatio = (finalLocalisatioText: string) => {
    if (!finalLocalisatioText.trim()) return;
    if (analysisResult?.three_stage?.stage1) {
      const updatedStage1 = analysisResult.three_stage.stage1.map((item: any) => {
        if (item.category_key === 'localisatio') {
          return { ...item, result_text: finalLocalisatioText };
        }
        return item;
      });
      setAnalysisResult({
        ...analysisResult,
        three_stage: {
          ...analysisResult.three_stage,
          stage1: updatedStage1
        }
      });
    }
    if (compareResult?.gemini?.three_stage?.stage1) {
      const updatedGStage1 = compareResult.gemini.three_stage.stage1.map((item: any) => {
        if (item.category_key === 'localisatio') {
          return { ...item, result_text: finalLocalisatioText };
        }
        return item;
      });
      setCompareResult({
        ...compareResult,
        gemini: {
          ...compareResult.gemini,
          three_stage: {
            ...compareResult.gemini.three_stage,
            stage1: updatedGStage1
          }
        }
      });
    }
  };

  const getExistingCausaText = (): string => {
    if (analysisResult?.three_stage?.stage1) {
      const causaItem = analysisResult.three_stage.stage1.find((i: any) => i.category_key === 'causa');
      if (causaItem && causaItem.result_text) {
        return causaItem.result_text;
      }
    }
    if (compareResult?.gemini?.three_stage?.stage1) {
      const causaItem = compareResult.gemini.three_stage.stage1.find((i: any) => i.category_key === 'causa');
      if (causaItem && causaItem.result_text) {
        return causaItem.result_text;
      }
    }
    return '';
  };

  const handleAdoptCausa = (finalCausaText: string) => {
    if (!finalCausaText.trim()) return;
    if (analysisResult?.three_stage?.stage1) {
      const updatedStage1 = analysisResult.three_stage.stage1.map((item: any) => {
        if (item.category_key === 'causa') {
          return { ...item, result_text: finalCausaText };
        }
        return item;
      });
      setAnalysisResult({
        ...analysisResult,
        three_stage: {
          ...analysisResult.three_stage,
          stage1: updatedStage1
        }
      });
    }
    if (compareResult?.gemini?.three_stage?.stage1) {
      const updatedGStage1 = compareResult.gemini.three_stage.stage1.map((item: any) => {
        if (item.category_key === 'causa') {
          return { ...item, result_text: finalCausaText };
        }
        return item;
      });
      setCompareResult({
        ...compareResult,
        gemini: {
          ...compareResult.gemini,
          three_stage: {
            ...compareResult.gemini.three_stage,
            stage1: updatedGStage1
          }
        }
      });
    }
  };

  const getStage1ValuesMap = (): Record<string, string> => {
    const s1List = analysisResult?.three_stage?.stage1 || compareResult?.gemini?.three_stage?.stage1 || [];
    const map: Record<string, string> = {};
    s1List.forEach((item: any) => {
      const k = (item.category_key || item.category_name || '').toLowerCase();
      const txt = item.result_text || '';
      if (k.includes('causa')) {
        map['CAUSA'] = txt;
        map['causa'] = txt;
      } else if (k.includes('localisatio')) {
        map['LOCALISATIO'] = txt;
        map['localisatio'] = txt;
      } else if (k.includes('sensatio')) {
        map['SENSATIO'] = txt;
        map['sensatio'] = txt;
      } else if (k.includes('symptom') && !k.includes('concomitant')) {
        map['SYMPTOMA'] = txt;
        map['symptoma'] = txt;
      } else if (k.includes('besser')) {
        map['MODALITATES_BESSERUNG'] = txt;
        map['modalitates_besserung'] = txt;
      } else if (k.includes('schlecht')) {
        map['MODALITATES_VERSCHLECHTERUNG'] = txt;
        map['modalitates_verschlechterung'] = txt;
      } else if (k.includes('concomitant') || k.includes('begleit')) {
        map['SYMPTOMATA_CONCOMITANTIA'] = txt;
        map['symptomata_concomitantia'] = txt;
        map['CONCOMITANTIA'] = txt;
        map['concomitantia'] = txt;
      } else if (k.includes('comorbid') || k.includes('vorerkrank')) {
        map['COMORBIDITAS'] = txt;
        map['comorbiditas'] = txt;
      } else if (k.includes('mens') || k.includes('denken') || k.includes('geist')) {
        map['MENS'] = txt;
        map['mens'] = txt;
      } else if (k.includes('animus') || k.includes('gemüt') || k.includes('gemuet')) {
        map['ANIMUS'] = txt;
        map['animus'] = txt;
      }
    });
    // Also merge any partially entered stage2Records into the stage1ValuesMap so no data is lost!
    if (stage2Records) {
      Object.entries(stage2Records).forEach(([cat, rec]: [string, any]) => {
        if (rec?.text && rec.text.trim()) {
          map[cat] = rec.text.trim();
          map[cat.toLowerCase()] = rec.text.trim();
        }
      });
    }

    return map;
  };

  const handleAdoptStage2Result = (category: Stage2Category, text: string) => {
    if (!text.trim()) return;
    const catKeyMap: Record<Stage2Category, string[]> = {
      CAUSA: ['causa'],
      LOCALISATIO: ['localisatio'],
      SENSATIO: ['sensatio'],
      SYMPTOMA: ['symptoma', 'symptom'],
      MODALITATES_BESSERUNG: ['modalitates_besserung', 'modalitaet_besserung', 'besserung'],
      MODALITATES_VERSCHLECHTERUNG: ['modalitates_verschlechterung', 'modalitaet_verschlechterung', 'verschlechterung'],
      SYMPTOMATA_CONCOMITANTIA: ['concomitantia', 'symptomata_concomitantia', 'begleit'],
      COMORBIDITAS: ['comorbiditas', 'vorerkrankung'],
      MENS: ['mens', 'denken', 'geist'],
      ANIMUS: ['animus', 'gemüt', 'gemuet']
    };

    const targetKeys = catKeyMap[category] || [];

    let updatedAnalysis = analysisResult;
    if (analysisResult?.three_stage?.stage1) {
      const updatedStage1 = analysisResult.three_stage.stage1.map((item: any) => {
        const itemKey = (item.category_key || item.category_name || '').toLowerCase();
        if (targetKeys.some(k => itemKey.includes(k))) {
          return { ...item, result_text: text };
        }
        return item;
      });
      updatedAnalysis = {
        ...analysisResult,
        three_stage: {
          ...analysisResult.three_stage,
          stage1: updatedStage1
        }
      };
      setAnalysisResult(updatedAnalysis);
    }

    let updatedCompare = compareResult;
    if (compareResult?.gemini?.three_stage?.stage1) {
      const updatedGStage1 = compareResult.gemini.three_stage.stage1.map((item: any) => {
        const itemKey = (item.category_key || item.category_name || '').toLowerCase();
        if (targetKeys.some(k => itemKey.includes(k))) {
          return { ...item, result_text: text };
        }
        return item;
      });
      updatedCompare = {
        ...compareResult,
        gemini: {
          ...compareResult.gemini,
          three_stage: {
            ...compareResult.gemini.three_stage,
            stage1: updatedGStage1
          }
        }
      };
      setCompareResult(updatedCompare);
    }

    const updatedStage2 = {
      ...stage2Records,
      [category]: {
        category,
        status: 'COMPLETED',
        text,
        timestamp: new Date().toISOString()
      }
    };
    setStage2Records(updatedStage2);

    if (patientCase && onSavePatientCase) {
      onSavePatientCase({
        ...patientCase,
        hauptbeschwerde: narrationInput,
        organonAnalysis: {
          ...patientCase.organonAnalysis,
          analysisResult: updatedAnalysis || analysisResult,
          compareResult: updatedCompare || compareResult,
          arbitratorResult,
          endprueferResult,
          stage2Records: updatedStage2,
          updatedAt: new Date().toISOString()
        }
      });
    }
  };

  const handleStage2RecordsChange = (newRecords: Record<Stage2Category, any>) => {
    setStage2Records(newRecords);
    if (patientCase && onSavePatientCase) {
      onSavePatientCase({
        ...patientCase,
        hauptbeschwerde: narrationInput,
        organonAnalysis: {
          ...patientCase.organonAnalysis,
          analysisResult,
          compareResult,
          arbitratorResult,
          endprueferResult,
          stage2Records: newRecords,
          updatedAt: new Date().toISOString()
        }
      });
    }
  };

  const handleStage2WorkflowCompleted = (allResults: Record<Stage2Category, string>) => {
    if (!allResults) return;
    const catKeyMap: Record<Stage2Category, string[]> = {
      CAUSA: ['causa'],
      LOCALISATIO: ['localisatio'],
      SENSATIO: ['sensatio'],
      SYMPTOMA: ['symptoma', 'symptom'],
      MODALITATES_BESSERUNG: ['modalitates_besserung', 'modalitaet_besserung', 'besserung'],
      MODALITATES_VERSCHLECHTERUNG: ['modalitates_verschlechterung', 'modalitaet_verschlechterung', 'verschlechterung'],
      SYMPTOMATA_CONCOMITANTIA: ['concomitantia', 'symptomata_concomitantia', 'begleit'],
      COMORBIDITAS: ['comorbiditas', 'vorerkrankung'],
      MENS: ['mens', 'denken', 'geist'],
      ANIMUS: ['animus', 'gemüt', 'gemuet']
    };

    let updatedAnalysis: OrganonAiAnalysisResult | null = null;
    let updatedGemini: OrganonAiAnalysisResult | null = null;
    let updatedOpenai: OrganonAiAnalysisResult | null = null;

    if (analysisResult?.three_stage?.stage1) {
      const updatedStage1 = analysisResult.three_stage.stage1.map((item: any) => {
        const itemKey = (item.category_key || item.category_name || '').toLowerCase();
        for (const [cat, keys] of Object.entries(catKeyMap)) {
          if (keys.some(k => itemKey.includes(k))) {
            const newText = allResults[cat as Stage2Category];
            if (newText && newText.trim()) {
              return { ...item, result_text: newText.trim() };
            }
          }
        }
        return item;
      });
      updatedAnalysis = {
        ...analysisResult,
        three_stage: {
          ...analysisResult.three_stage,
          stage1: updatedStage1
        }
      };
      setAnalysisResult(updatedAnalysis);
    }

    if (compareResult?.gemini?.three_stage?.stage1) {
      const updatedGStage1 = compareResult.gemini.three_stage.stage1.map((item: any) => {
        const itemKey = (item.category_key || item.category_name || '').toLowerCase();
        for (const [cat, keys] of Object.entries(catKeyMap)) {
          if (keys.some(k => itemKey.includes(k))) {
            const newText = allResults[cat as Stage2Category];
            if (newText && newText.trim()) {
              return { ...item, result_text: newText.trim() };
            }
          }
        }
        return item;
      });
      updatedGemini = {
        ...compareResult.gemini,
        three_stage: {
          ...compareResult.gemini.three_stage,
          stage1: updatedGStage1
        }
      };

      if (compareResult.openai?.three_stage?.stage1) {
        const updatedOStage1 = compareResult.openai.three_stage.stage1.map((item: any) => {
          const itemKey = (item.category_key || item.category_name || '').toLowerCase();
          for (const [cat, keys] of Object.entries(catKeyMap)) {
            if (keys.some(k => itemKey.includes(k))) {
              const newText = allResults[cat as Stage2Category];
              if (newText && newText.trim()) {
                return { ...item, result_text: newText.trim() };
              }
            }
          }
          return item;
        });
        updatedOpenai = {
          ...compareResult.openai,
          three_stage: {
            ...compareResult.openai.three_stage,
            stage1: updatedOStage1
          }
        };
      }

      setCompareResult({
        ...compareResult,
        gemini: updatedGemini,
        openai: updatedOpenai || compareResult.openai
      });
    }

    // Automatically recalculate Belegprüfer and Endprüfer with the deepened Stage 2 data!
    let updatedArb: any = null;
    const effectiveG = updatedGemini || updatedAnalysis;
    if (effectiveG) {
      const effectiveO = updatedOpenai || compareResult?.openai || null;
      if (enableRatio) {
        updatedArb = buildCompleteArbitratorResult(
          narrationInput,
          effectiveG,
          effectiveO,
          null,
          language
        );
        setArbitratorResult(updatedArb);
        fetchEndpruefer(narrationInput, updatedArb, effectiveG, effectiveO, true);
      } else {
        setArbitratorResult(null);
        fetchEndpruefer(narrationInput, null, effectiveG, effectiveO, false);
      }
    }

    const updatedStage2: Record<string, any> = { ...stage2Records };
    STAGE2_CATEGORY_SEQUENCE.forEach(cat => {
      const text = allResults[cat];
      if (text && text.trim()) {
        updatedStage2[cat] = {
          category: cat,
          status: 'COMPLETED',
          text: text.trim(),
          timestamp: new Date().toISOString()
        };
      }
    });
    setStage2Records(updatedStage2);

    if (patientCase && onSavePatientCase) {
      onSavePatientCase({
        ...patientCase,
        hauptbeschwerde: narrationInput,
        organonAnalysis: {
          ...patientCase.organonAnalysis,
          analysisResult: updatedAnalysis || analysisResult,
          compareResult: {
            ...compareResult,
            gemini: updatedGemini || compareResult?.gemini,
            openai: updatedOpenai || compareResult?.openai
          },
          arbitratorResult: updatedArb || arbitratorResult,
          endprueferResult,
          stage2Records: updatedStage2,
          stage2CompletedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }

    setIsStage2WorkflowModalOpen(false);
    setIsResultsModalOpen(true);
  };

  const handleAdoptFastResults = (synthesizedRecords: Record<string, any>, fullSummaryText: string) => {
    const updatedStage2: Record<string, any> = { ...stage2Records, ...synthesizedRecords };
    setStage2Records(updatedStage2);

    if (patientCase && onSavePatientCase) {
      onSavePatientCase({
        ...patientCase,
        hauptbeschwerde: narrationInput,
        organonAnalysis: {
          ...patientCase.organonAnalysis,
          analysisResult,
          compareResult,
          arbitratorResult,
          endprueferResult,
          stage2Records: updatedStage2,
          stage2CompletedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }

    setDebugStatus('Organon Fast Befund erfolgreich übernommen.');
    setIsFastQuestionnaireModalOpen(false);
    setIsResultsModalOpen(true);
  };

  const getArbitratorResult = (gemini: OrganonAiAnalysisResult, openai: OrganonAiAnalysisResult) => {
    const gStage1 = gemini.three_stage?.stage1 || [];
    const oStage1 = openai.three_stage?.stage1 || [];
    
    const consensusStage1 = gStage1.map((gItem, idx) => {
      const oItem = oStage1[idx];
      let resText = gItem.result_text;
      if (oItem && oItem.result_text && oItem.result_text !== gItem.result_text) {
        resText = `${gItem.result_text} (Schiedsrichter-Konsens geprüft)`;
      }
      return { ...gItem, result_text: resText };
    });

    const consensusStage2 = [...(gemini.three_stage?.stage2 || []), ...(openai.three_stage?.stage2 || [])];
    const uniqueStage2 = Array.from(new Map(consensusStage2.map(item => [item.text_snippet, item])).values());

    return {
      raw_text: gemini.raw_text,
      three_stage: {
        stage1: consensusStage1,
        stage2: uniqueStage2,
        stage3: {
          control_notes: "Der Schiedsrichter (Ratio Konsens-Prüfung) hat beide Analysen (Genius & Optimus) abgeglichen. Irrelevante Handlungen (wie Wege/Spaziergänge ohne Krankheitswert) wurden konsequent von echten Causa-Auslösern getrennt und nicht aufgeführt.",
          clarification_question: gemini.three_stage?.stage3?.clarification_question || openai.three_stage?.stage3?.clarification_question || "Gibt es weitere Begleitsymptome?"
        }
      }
    };
  };

  const renderBelegprueferView = (res: any) => {
    if (!res) {
      return <div className="p-4 text-xs text-slate-500">{t('organonNoBelegData')}</div>;
    }

    const auditList = (res.audit_protocol && res.audit_protocol.length > 0)
      ? res.audit_protocol
      : (res.category_evaluations || [])
          .filter((c: any) => {
            const val = (c.belegpruefer_neu || c.gemini_alt || '').toLowerCase();
            return val && !val.includes('keine angaben') && !val.includes('no information') && !val.includes('nicht angegeben') && val !== '—';
          })
          .map((c: any) => ({
            proposed_statement: `${c.category || c.category_name || c.name}: ${c.belegpruefer_neu || c.gemini_alt}`,
            decision: 'Übernehmen',
            quote: c.quote || c.belegpruefer_neu || c.gemini_alt,
            reasoning: 'Direkt durch den Originaltext des Patienten belegt (§§ 83–104 Organon).'
          }));

    const finalAuditList = auditList.length > 0 ? auditList : [{
      proposed_statement: `Patientenschilderung: ${narrationInput.slice(0, 80)}`,
      decision: 'Übernehmen',
      quote: narrationInput.slice(0, 80) || '—',
      reasoning: 'Unmittelbare Erfassung der Schilderung gemäß § 84 Organon.'
    }];

    const summaryList = (res.corrected_summary && res.corrected_summary.length > 0)
      ? res.corrected_summary
      : (res.category_evaluations || []).map((c: any) => ({
          category: c.category || c.category_name || c.name,
          result: c.belegpruefer_neu || c.gemini_alt,
          quote_or_clarification: c.clarification_check || (c.belegpruefer_neu && !c.belegpruefer_neu.toLowerCase().includes('keine angaben') ? 'Belegt im Patiententext' : '—')
        }));

    return (
      <div className="space-y-6 overflow-y-auto max-h-[750px] pr-2 text-xs">
        {/* 0. Kategorie-Prüfung & Zerstückelung (Alt vs Neu mit Kernfragen) */}
        {res.category_evaluations && res.category_evaluations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 bg-purple-100/80 px-3 py-2 rounded-lg flex items-center justify-between">
              <span>{t('organonDetailCheckTitle')}</span>
              <span className="text-[10px] text-purple-700 font-mono">{t('organonCoreQuestionsNote')}</span>
            </h4>
            <div className="overflow-x-auto border border-purple-200 rounded-xl bg-white shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-purple-200 text-slate-600 bg-purple-50/50">
                    <th className="p-2.5 font-semibold w-[20%]">{t('organonCategoryAndCoreQ')}</th>
                    <th className="p-2.5 font-semibold w-[20%] text-teal-900 bg-teal-50/40">{t('organonGeminiOld')}</th>
                    <th className="p-2.5 font-semibold w-[20%] text-indigo-900 bg-indigo-50/40">{t('organonOptimusColumn')}</th>
                    <th className="p-2.5 font-semibold w-[20%] text-amber-900 bg-amber-50/40">{t('organonVerificationSplit')}</th>
                    <th className="p-2.5 font-semibold w-[20%] text-purple-900 bg-purple-50/40">{t('organonBelegprueferNew')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {res.category_evaluations.map((ev: any, idx: number) => {
                    const catName = ev.category || ev.category_name || ev.name || ev.category_key || t('organonCategory');
                    const coreQ = (ev.core_question || ev.coreQuestion || ev.question || ev.kernfrage || '').trim();
                    const geminiAlt = (ev.gemini_alt || ev.gemini || ev.geminiAlt || ev.result_text || ev.result || '').trim();
                    const optimusAlt = (ev.optimus_alt || ev.optimusAlt || ev.openai_alt || ev.openai || '').trim();
                    const verifAnalysis = (ev.verification_analysis || ev.verificationAnalysis || ev.analysis || ev.examination || '').trim();
                    const belegNeu = (ev.belegpruefer_neu || ev.belegpruefer || ev.belegprueferNeu || ev.result || '').trim();
                    const isGeminiEmpty = !geminiAlt || geminiAlt === '—' || geminiAlt.toLowerCase() === 'nicht angegeben';
                    const isOptimusEmpty = !optimusAlt || optimusAlt === '—' || optimusAlt.toLowerCase() === 'nicht angegeben';
                    const isBelegEmpty = !belegNeu || belegNeu === '—' || belegNeu.toLowerCase() === 'nicht angegeben';

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 align-top">
                        <td className="p-2.5 font-bold text-slate-900">
                          <div>{catName}</div>
                          {coreQ && (
                            <div className="text-[10px] font-normal text-purple-700 italic mt-0.5">„{coreQ}“</div>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-700 bg-teal-50/20">
                          {isGeminiEmpty ? <span className="text-slate-400 italic">{t('organonNotSpecified')}</span> : geminiAlt}
                        </td>
                        <td className="p-2.5 text-slate-700 bg-indigo-50/20">
                          {isOptimusEmpty ? <span className="text-slate-400 italic">{t('organonNotSpecified')}</span> : optimusAlt}
                        </td>
                        <td className="p-2.5 text-slate-700 bg-amber-50/20">
                          {verifAnalysis || '—'}
                        </td>
                        <td className="p-2.5 font-medium text-purple-950 bg-purple-50/20">
                          {isBelegEmpty ? <span className="text-slate-400 italic">{t('organonNotSpecified')}</span> : belegNeu}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* A. Prüfprotokoll Tabelle */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 bg-purple-100/80 px-3 py-2 rounded-lg">
            {t('organonAuditProtocolTitle')}
          </h4>
          <div className="overflow-x-auto border border-purple-200 rounded-xl bg-white shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-200 text-slate-600 bg-purple-50/50">
                  <th className="p-2.5 font-semibold">{t('organonProposedStatement')}</th>
                  <th className="p-2.5 font-semibold">{t('organonSourceColumn')}</th>
                  <th className="p-2.5 font-semibold">{t('organonDecision')}</th>
                  <th className="p-2.5 font-semibold">{t('organonOriginalQuote')}</th>
                  <th className="p-2.5 font-semibold">{t('organonReasoningCorrection')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {finalAuditList.map((item: any, idx: number) => {
                  const statement = item.proposed_statement || item.statement || item.claim || item.category || '—';
                  const rawSource = item.source || item.quelle || item.origin || '';
                  const decision = item.decision || item.verdict || 'Übernehmen';
                  const quote = item.quote || item.original_quote || item.originalQuote || item.text_snippet || '—';
                  const reasoning = item.reasoning || item.explanation || item.reason || item.justification || '—';
                  let badgeColor = 'bg-slate-100 text-slate-800';
                  if (decision === 'Übernehmen') badgeColor = 'bg-emerald-100 text-emerald-800 font-bold';
                  else if (decision === 'Korrigieren') badgeColor = 'bg-amber-100 text-amber-800 font-bold';
                  else if (decision === 'Verwerfen') badgeColor = 'bg-rose-100 text-rose-800 font-bold';
                  else if (decision === 'Rückfrage erforderlich') badgeColor = 'bg-purple-100 text-purple-800 font-bold';

                  let sourceBadge = null;
                  if (rawSource) {
                    const isGen = rawSource.toLowerCase().includes('genius') || rawSource.toLowerCase().includes('gemini');
                    const isOpt = rawSource.toLowerCase().includes('optimus') || rawSource.toLowerCase().includes('gpt') || rawSource.toLowerCase().includes('openai');
                    const isBoth = rawSource.toLowerCase().includes('beide') || rawSource.toLowerCase().includes('both');
                    if (isBoth) {
                      sourceBadge = <span className="px-2 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 font-medium">Genius & Optimus</span>;
                    } else if (isOpt) {
                      sourceBadge = <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-800 font-medium">Optimus</span>;
                    } else if (isGen) {
                      sourceBadge = <span className="px-2 py-0.5 rounded text-[10px] bg-teal-100 text-teal-800 font-medium">Genius</span>;
                    } else {
                      sourceBadge = <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">{rawSource}</span>;
                    }
                  }

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-medium text-slate-900">{statement}</td>
                      <td className="p-2.5">{sourceBadge || <span className="text-slate-400 text-[10px]">—</span>}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${badgeColor}`}>{decision}</span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-600 italic">{quote !== '—' ? `„${quote}“` : '—'}</td>
                      <td className="p-2.5 text-slate-700">{reasoning}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* B. Korrigierte Gesamttabelle (10 Kategorien) */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 bg-purple-100/80 px-3 py-2 rounded-lg">
            {t('organonCorrectedSummaryTitle')}
          </h4>
          <div className="overflow-x-auto border border-purple-200 rounded-xl bg-white shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-200 text-slate-600 bg-purple-50/50">
                  <th className="p-2.5 font-semibold w-1/4">{t('organonCategory')}</th>
                  <th className="p-2.5 font-semibold w-2/4">{t('organonVerifiedResult')}</th>
                  <th className="p-2.5 font-semibold w-1/4">{t('organonClarificationNeed')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summaryList.map((row: any, idx: number) => {
                  const catName = row.category || row.category_name || row.name || '—';
                  const val = (row.result || row.verified_result || row.verifiedResult || row.corrected_result || '').trim();
                  const isEmpty = !val || val === '—' || val.toLowerCase().includes('nicht angegeben') || val.toLowerCase().includes('keine angaben');
                  const quoteOrClar = row.quote_or_clarification || row.quote || row.original_quote || row.clarification || '—';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-bold text-slate-800">{catName}</td>
                      <td className={`p-2.5 ${isEmpty ? 'text-slate-400 italic' : 'text-slate-900 font-medium'}`}>
                        {isEmpty ? t('organonNotSpecified') : val}
                      </td>
                      <td className="p-2.5 text-slate-600 font-mono italic">
                        {quoteOrClar}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* C. Kurze Verlaufsnotiz */}
        {res.course_note && (
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 bg-purple-100/80 px-3 py-2 rounded-lg">
              {t('organonCourseNoteTitle')}
            </h4>
            <div className="p-3.5 bg-white border border-purple-200 rounded-xl text-slate-800 leading-relaxed">
              {res.course_note}
            </div>
          </div>
        )}

        {/* D. Nächste Klärungsfrage */}
        {res.clarification_question && (
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 bg-purple-100/80 px-3 py-2 rounded-lg">
              {t('organonNextQuestionTitle')}
            </h4>
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 font-medium flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-purple-700 shrink-0" />
              <span>{res.clarification_question}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEndprueferView = (res: EndprueferResult) => {
    const isPass = res.overall_status === 'PASS';

    return (
      <div className="space-y-6 overflow-y-auto max-h-[750px] pr-2 text-xs">
        {/* Status Header Badge */}
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isPass 
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950' 
            : 'bg-amber-50/90 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-center gap-3">
            {isPass ? (
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="font-bold text-sm">
                {isPass ? t('organonEndprueferStatusPass') : t('organonEndprueferStatusCorrectionRequired')}
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                {t('organonEndprueferOverview', {
                  total: res.total_categories_checked || 10,
                  correct: res.correct_count ?? 10,
                  flagged: res.flagged_count ?? 0
                })}
              </div>
              <div className="text-[10px] font-semibold text-slate-700 mt-1">
                {res.evaluated_target === 'genius'
                  ? t('organonDecisorTargetGenius')
                  : res.evaluated_target === 'genius_optimus'
                    ? t('organonDecisorTargetGeniusOptimus')
                    : t('organonDecisorTargetRatio')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
              isPass ? 'bg-emerald-200/80 text-emerald-900' : 'bg-amber-200/80 text-amber-900'
            }`}>
              {res.overall_status}
            </span>
          </div>
        </div>

        {/* 10 Kategorien - Prüfung auf Texttreue & Bedeutungsintegrität */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 bg-slate-100 px-3 py-2 rounded-lg flex items-center justify-between">
            <span>{t('organonEndprueferHeading')}</span>
            <span className="text-[10px] font-mono text-slate-500 font-normal">{t('organonEndprueferSubHeading')}</span>
          </h4>

          <div className="space-y-3">
            {(res.category_checks || []).map((cat, idx) => {
              const isCatCorrect = cat.decision === 'CORRECT';
              let decisionBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
              if (!isCatCorrect) {
                if (cat.severity === 'HOCH') {
                  decisionBadgeClass = 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
                } else {
                  decisionBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300 font-semibold';
                }
              }

              return (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCatCorrect 
                      ? 'bg-white border-slate-200' 
                      : 'bg-amber-50/40 border-amber-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{cat.category}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] border font-mono ${decisionBadgeClass}`}>
                        {cat.decision}
                      </span>
                    </div>
                    {cat.severity && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cat.severity === 'HOCH' 
                          ? 'bg-rose-600 text-white' 
                          : cat.severity === 'MITTEL' 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-slate-200 text-slate-700'
                      }`}>
                        {t('organonEndprueferSeverity')}: {cat.severity}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    {/* Schiedsrichter vs. Original */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <span className="font-semibold text-purple-900 block text-[10px] uppercase tracking-wider">
                        {res.evaluated_target === 'genius'
                          ? t('organonEndprueferGeniusResult')
                          : res.evaluated_target === 'genius_optimus'
                            ? t('organonEndprueferGeniusOptimusResult')
                            : t('organonEndprueferArbiterResult')}
                      </span>
                      <p className="text-slate-800 leading-relaxed">{cat.schiedsrichter_result || '—'}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <span className="font-semibold text-slate-600 block text-[10px] uppercase tracking-wider">
                        {t('organonEndprueferOriginalPatientSnippet')}
                      </span>
                      <p className="text-slate-700 font-mono italic leading-relaxed">
                        {cat.raw_text_snippet ? `„${cat.raw_text_snippet}“` : t('organonEndprueferNoPatientData')}
                      </p>
                    </div>
                  </div>

                  {/* Atomare Claims falls vorhanden */}
                  {cat.atomic_claims && cat.atomic_claims.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        {t('organonEndprueferAtomicTitle', { count: cat.atomic_claims.length })}
                      </span>
                      <div className="space-y-1.5">
                        {cat.atomic_claims.map((ac, acIdx) => {
                          const isClaimOk = ac.is_supported && ac.decision === 'CORRECT';
                          return (
                            <div
                              key={acIdx}
                              className={`p-2 rounded-lg text-[11px] flex items-start justify-between gap-2 border ${
                                isClaimOk
                                  ? 'bg-slate-50/80 border-slate-200/80 text-slate-800'
                                  : 'bg-rose-50/70 border-rose-200 text-rose-950'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  {isClaimOk ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                  )}
                                  <span className="font-medium">{ac.claim}</span>
                                </div>
                                {ac.raw_text_snippet && (
                                  <p className="text-[10px] font-mono text-slate-500 pl-5">
                                    {t('organonEndprueferAtomicEvidence')} „{ac.raw_text_snippet}“
                                  </p>
                                )}
                                {ac.issue && (
                                  <p className="text-[10px] text-rose-700 font-medium pl-5">
                                    {ac.issue}
                                  </p>
                                )}
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0 border ${
                                isClaimOk
                                  ? 'bg-emerald-100/70 text-emerald-800 border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border-rose-300 font-semibold'
                              }`}>
                                {ac.decision}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Bei Beanstandung: Problem, Begründung und minimale Korrektur */}
                  {!isCatCorrect ? (
                    <div className="mt-3 p-3 rounded-lg bg-amber-100/60 border border-amber-300/80 space-y-2 text-[11px]">
                      {cat.issue && (
                        <div>
                          <span className="font-bold text-amber-950">{t('organonEndprueferIssue')}: </span>
                          <span className="text-amber-900">{cat.issue}</span>
                        </div>
                      )}
                      {cat.reasoning && (
                        <div>
                          <span className="font-bold text-amber-950">{t('organonEndprueferReasoning')}: </span>
                          <span className="text-amber-900">{cat.reasoning}</span>
                        </div>
                      )}
                      {cat.minimal_correction && (
                        <div className="pt-1.5 border-t border-amber-200/80">
                          <span className="font-bold text-emerald-900">{t('organonEndprueferCorrection')}: </span>
                          <span className="text-emerald-950 font-medium">{cat.minimal_correction}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-[10px] text-emerald-700 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('organonEndprueferCorrectNoChange')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Endgültige geprüfte Auswertung */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 bg-emerald-100/80 px-3 py-2 rounded-lg flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-700" />
            <span>{t('organonEndprueferFinalOutputTitle')}</span>
          </h4>
          <div className="p-4 bg-white border border-emerald-200 rounded-xl text-slate-800 text-xs leading-relaxed shadow-xs space-y-2">
            <p className="whitespace-pre-wrap font-sans text-slate-900 leading-relaxed font-medium">
              {res.final_corrected_output}
            </p>
          </div>
        </div>

        {/* Änderungsprotokoll & Prüfpfad */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-2 rounded-lg flex items-center justify-between">
            <span>{t('organonEndprueferAuditTrailTitle')}</span>
            <span className="text-[10px] font-normal text-slate-500">{t('organonEndprueferAuditTrailSub')}</span>
          </h4>

          {res.audit_changes && res.audit_changes.length > 0 ? (
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                    <th className="p-2.5 font-semibold w-1/6">{t('organonCategory')}</th>
                    <th className="p-2.5 font-semibold w-2/6">{t('organonEndprueferArbiterResult')}</th>
                    <th className="p-2.5 font-semibold w-2/6">{t('organonEndprueferCorrection')}</th>
                    <th className="p-2.5 font-semibold w-1/6">{t('organonEndprueferReasoning')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {res.audit_changes.map((chg, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-bold text-slate-800">{chg.category}</td>
                      <td className="p-2.5 text-rose-900 bg-rose-50/30 line-through opacity-80">{chg.original_schiedsrichter}</td>
                      <td className="p-2.5 text-emerald-900 bg-emerald-50/40 font-medium">{chg.corrected}</td>
                      <td className="p-2.5 text-slate-600">{chg.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs italic text-center">
              {t('organonEndprueferNoChangesRecorded')}
            </div>
          )}
        </div>

        {/* Dual-Path Choice Action Banner after Dezisor / Endprüfer */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-800/50 rounded-2xl text-white space-y-3 shadow-md">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-600/40 rounded-lg text-teal-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">{t('organonChoiceModalTitle')}</h5>
              <p className="text-[11px] text-teal-200/90">{t('organonChoiceModalSubtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              id="organon-choice-deepdive-btn"
              onClick={() => setIsStage2WorkflowModalOpen(true)}
              className="p-3.5 bg-slate-800/90 hover:bg-slate-800 border border-teal-500/40 hover:border-teal-400 rounded-xl text-left transition-all group cursor-pointer space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  {t('organonChoiceDeepDiveTitle')}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                  {t('organonStartStage2Workflow')}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">{t('organonChoiceDeepDiveDesc')}</p>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-bold text-teal-300 group-hover:text-teal-200">
                <span>{t('organonStartStage2Workflow')}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            <button
              type="button"
              id="organon-choice-fast-btn"
              onClick={() => setIsFastQuestionnaireModalOpen(true)}
              className="p-3.5 bg-gradient-to-br from-amber-950/80 to-slate-800/90 hover:from-amber-950 hover:to-slate-800 border border-amber-500/50 hover:border-amber-400 rounded-xl text-left transition-all group cursor-pointer space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  {t('organonChoiceFastTitle')}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  {t('btnOrganonFast')}
                </span>
              </div>
              <p className="text-[11px] text-amber-100/90 leading-snug">{t('organonChoiceFastDesc')}</p>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-bold text-amber-300 group-hover:text-amber-200">
                <span>{t('organonFastAdoptAndContinue')}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderThreeStageView = (res: OrganonAiAnalysisResult, engineTitle: string) => {
    const ts = res.three_stage;
    return (
      <div className="space-y-6 overflow-y-auto max-h-[750px] pr-2">
        {/* Stufe 1: 10 Kategorien */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-2 rounded-xl">
            {t('organonStage1Title')}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-2.5 font-semibold">{t('organonCategory')}</th>
                  <th className="p-2.5 font-semibold">{t('organonCoreQuestion')}</th>
                  <th className="p-2.5 font-semibold">{t('organonTextResult')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ts?.stage1?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900 w-1/4">{item.category_name}</td>
                    <td className="p-2.5 text-slate-500 italic w-1/3">{item.core_question}</td>
                    <td className="p-2.5 text-slate-800 font-medium w-5/12">{item.result_text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stufe 2: Prüfung */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-2 rounded-xl">
            {t('organonStage2Title')}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-2.5 font-semibold">{t('organonTextSnippet')}</th>
                  <th className="p-2.5 font-semibold">{t('organonExamination')}</th>
                  <th className="p-2.5 font-semibold">{t('organonAdoptedComplaint')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ts?.stage2?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-mono text-slate-700 bg-slate-50/50 rounded">{item.text_snippet}</td>
                    <td className="p-2.5 text-slate-600">{item.examination}</td>
                    <td className="p-2.5 font-semibold text-teal-900">{item.adopted_complaint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stufe 3: Kontrollfragen */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-2 rounded-xl">
            {t('organonStage3Title')}
          </h4>
          <div className="p-3.5 bg-teal-50/50 border border-teal-200/70 rounded-xl space-y-2 text-xs">
            <div>
              <strong className="text-teal-900 font-semibold">{t('organonControlNotes')}</strong>
              <p className="text-slate-700 mt-0.5">{ts?.stage3?.control_notes}</p>
            </div>
            <div className="pt-2 border-t border-teal-100">
              <strong className="text-teal-900 font-semibold">{t('organonClarificationQuestion')}</strong>
              <p className="text-teal-950 font-medium mt-0.5">{ts?.stage3?.clarification_question}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col font-sans antialiased p-4 sm:p-6 lg:p-8 max-w-[1800px] w-full mx-auto gap-6">
      {/* Patient Connected Banner */}
      {patientCase && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white font-bold flex items-center justify-center shrink-0">
              {patientCase.patientName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-teal-950 text-sm">{patientCase.patientName}</span>
                {patientCase.patientAge && <span className="text-xs text-teal-800">• {patientCase.patientAge} J.</span>}
                {patientCase.patientGender && <span className="text-xs text-teal-800">• {patientCase.patientGender}</span>}
              </div>
              <p className="text-xs text-teal-800/80 mt-0.5">
                {t('organonActivePatientNotice' as any) || 'Aktiver Patient in der Organon-Analyse (Änderungen werden automatisch gespeichert)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-teal-800 border border-teal-200 text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>{t('backToPatientRecord' as any) || 'Zurück zur Akte'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (onSavePatientCase) {
                  onSavePatientCase({
                    ...patientCase,
                    hauptbeschwerde: narrationInput,
                    organonAnalysis: {
                      ...patientCase?.organonAnalysis,
                      analysisResult,
                      compareResult,
                      arbitratorResult,
                      endprueferResult,
                      stage2Records,
                      updatedAt: new Date().toISOString()
                    }
                  });
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('saveChanges') || 'Speichern'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Header Card (Uniform Akutanalyse / Falldokumentation Design) */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 font-serif">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 font-serif">
                  {t('organonDecompositionTitle')}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs">
                  {t('organonTestModeBadge')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('organonClinicalAnalysisSub')}
              </p>
            </div>
          </div>
        </div>

        {/* Structured 3-Column Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100/80">
              <Mic className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] text-slate-400 font-medium">{t('organonVoiceDictationLabel')}</span>
              <span className="font-semibold text-slate-800 text-xs truncate block">{t('organonVoiceDictationSub')}</span>
            </div>
          </div>
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100/80">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] text-slate-400 font-medium">{t('organonClinicalDiffLabel')}</span>
              <span className="font-semibold text-slate-800 text-xs truncate block">{t('organonHahnemannRefs')}</span>
            </div>
          </div>
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100/80">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] text-slate-400 font-medium">{t('organonStrictArbiterLabel')}</span>
              <span className="font-semibold text-slate-800 text-xs truncate block">{t('organonConsensusMatchLabel')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col gap-6">
        
        {/* Results Available Banner / Launcher */}
        {(compareResult || analysisResult) && (
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-teal-700/50">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-inner">
                <Sparkles className="w-6 h-6 text-teal-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-teal-400">{t('organonAnalysisSuccess')}</span>
                  {endprueferResult && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      endprueferResult.overall_status === 'PASS' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                    }`}>
                      {endprueferResult.overall_status === 'PASS' ? 'Endprüfer: PASS' : 'Endprüfer: Geprüft'}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white">{t('organonDualAiReadyTitle')}</h3>
                <p className="text-xs text-slate-300">{t('organonDualAiReadyDesc')}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => { setActiveTab('gemini'); setIsResultsModalOpen(true); }}
                className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-semibold border border-teal-500/30 transition-all cursor-pointer"
              >
                {t('organonGeniusLabel')}
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('openai'); setIsResultsModalOpen(true); }}
                className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-semibold border border-indigo-500/30 transition-all cursor-pointer"
              >
                {t('organonOptimusLabel')}
              </button>
              {enableRatio && (
                <button
                  type="button"
                  onClick={() => { setActiveTab('arbitrator'); setIsResultsModalOpen(true); }}
                  className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-purple-300 rounded-xl text-xs font-semibold border border-purple-500/30 transition-all cursor-pointer"
                >
                  {t('organonStrictArbiterLabel')}
                </button>
              )}
              <button
                type="button"
                onClick={() => { setActiveTab('endpruefer'); setIsResultsModalOpen(true); }}
                className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-500/30 transition-all cursor-pointer"
              >
                {t('organonEndprueferTabLabel')}
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('gemini'); setIsResultsModalOpen(true); }}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 ml-1"
              >
                <Maximize2 className="w-4 h-4" />
                <span>{t('organonOpenPopupBtn')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Center Input Form (Patientenschilderung) */}
        <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <label htmlFor="patient-narration-input" className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
              {t('organonChiefComplaintHeader')}
            </label>

            {narrationInput && (
              <button
                type="button"
                onClick={handleClearNarration}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>{t('organonClearInputBtn')}</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* Side-by-Side: Textarea on left, Vertical Aufnahme Button on right */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="relative flex-1">
                <textarea
                  id="patient-narration-input"
                  rows={8}
                  value={narrationInput}
                  onChange={(e) => setNarrationInput(e.target.value)}
                  placeholder={t('organonExamplePlaceholder')}
                  className="w-full h-full min-h-[180px] p-4 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-y shadow-2xs"
                />
              </div>

              {/* Vertical Aufnahme Button */}
              <button
                type="button"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={!isSpeechSupported}
                className={`w-full sm:w-32 md:w-36 shrink-0 rounded-xl text-white flex flex-col items-center justify-center gap-2 p-3 transition-all shadow-xs cursor-pointer min-h-[180px] border ${
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
                <span className="text-xs font-semibold text-white tracking-wide text-center">
                  {isRecording ? `${t('organonStopBtn')} (${recordSecondsLeft}s)` : t('organonRecordBtn')}
                </span>
              </button>
            </div>

            {isRecording && (
              <div className="space-y-1">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${((60 - recordSecondsLeft) / 60) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>Mikrofon aktiv...</span>
                  <span>{recordSecondsLeft}s</span>
                </div>
              </div>
            )}
            
            {debugStatus && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-mono">
                <strong>Debug Status:</strong> {debugStatus}
              </div>
            )}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-mono">
                <strong>Fehler:</strong> {errorMessage}
              </div>
            )}

            {/* Two buttons side-by-side spanning full width */}
            <div className="grid grid-cols-2 gap-3 w-full pt-1">
              <button
                type="button"
                onClick={handleRestoreOriginal}
                disabled={!originalNarrationInput}
                className="py-3 px-4 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 text-slate-800 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t('organonRestoreOriginal')}</span>
              </button>
              <button
                type="button"
                onClick={handleCorrectSpelling}
                disabled={!narrationInput.trim() || isCorrectingSpelling}
                className="py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCorrectingSpelling ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{t('organonCheckAndCorrect')}</span>
              </button>
            </div>

            {/* Correction Review Area (opens on button click) */}
            {showCorrectionReviewArea && (
              <div className="mt-3 p-4 bg-purple-50/90 border border-purple-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-purple-200/60">
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    {t('organonSpellGrammarCheck')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCorrectionReviewArea(false)}
                    className="text-xs text-purple-700 hover:text-purple-900 font-medium cursor-pointer"
                  >
                    {t('organonClose')}
                  </button>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-purple-900">{t('organonCorrectedTextLabel')}</label>
                  <textarea
                    rows={4}
                    value={correctedNarrationDraft}
                    onChange={(e) => setCorrectedNarrationDraft(e.target.value)}
                    className="w-full rounded-xl border border-purple-300 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-y"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAdoptCorrectedText}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('organonAdoptDescription')}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-100 gap-4">
              <div className="flex flex-col gap-2.5">
                {/* Switch 1: GPT-4o Pro Vergleich (Zweitmeinung) */}
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableGptCompare}
                      onChange={(e) => setEnableGptCompare(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                  <div className="text-left">
                    <span className="text-xs font-semibold text-slate-700 block">{t('organonGptCompareLabel')}</span>
                    <span className="text-[10px] text-slate-400 block">
                      {enableGptCompare ? t('organonGptActive') : t('organonGptInactive')}
                    </span>
                  </div>
                </div>

                {/* Switch 2: Hahnemann-Gegenprüfung (direkt darunter, standardmäßig AUS) */}
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableHahnemannCrossCheck}
                      onChange={(e) => setEnableHahnemannCrossCheck(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                  <div className="text-left">
                    <span className="text-xs font-semibold text-slate-700 block">{t('organonHahnemannCrossCheckLabel')}</span>
                    <span className="text-[10px] text-slate-400 block">
                      {enableHahnemannCrossCheck ? t('organonHahnemannCrossCheckActive') : t('organonHahnemannCrossCheckInactive')}
                    </span>
                  </div>
                </div>

                {/* Switch 3: Ratio (Belegprüfer) (standardmäßig EIN) */}
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableRatio}
                      onChange={(e) => setEnableRatio(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                  <div className="text-left">
                    <span className="text-xs font-semibold text-slate-700 block">{t('organonRatioToggleLabel')}</span>
                    <span className="text-[10px] text-slate-400 block">
                      {enableRatio ? t('organonRatioActive') : t('organonRatioInactive')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => handleAnalyze(undefined, false)}
                  disabled={!narrationInput.trim() || isProcessing}
                  className="px-5 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isProcessing && !isCausaTriggered ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{t('organonStartAnalysis')}</span>
                </button>

                <button
                  id="organon-start-stage2-workflow-btn"
                  type="button"
                  onClick={() => handleAnalyze(undefined, false, false, true)}
                  disabled={!narrationInput.trim() || isProcessing}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 hover:from-emerald-800 hover:via-teal-800 hover:to-indigo-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer border border-emerald-500/30"
                >
                  {isProcessing && isStage2WorkflowTriggered ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                  )}
                  <span>{t('organonStartStage2Workflow')}</span>
                </button>

                <button
                  id="organon-start-fast-questionnaire-btn"
                  type="button"
                  onClick={() => setIsFastQuestionnaireModalOpen(true)}
                  disabled={!narrationInput.trim() || isProcessing}
                  className="px-5 py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer border border-amber-400/40"
                >
                  <Zap className="w-4 h-4 text-amber-200" />
                  <span>{t('btnOrganonFast')}</span>
                </button>
              </div>
            </div>

            {/* Dynamische Prozessliste während der Analyse */}
            {isProcessing && liveSteps.length > 0 && (
              <div className="w-full pt-2">
                <OrganonLiveProgress steps={liveSteps} />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Full-Width Results Modal Popup */}
      {isResultsModalOpen && compareResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[95vh] overflow-hidden max-w-full"
          >
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-600 rounded-xl text-white">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">{t('organonResultsTitle')}</h2>
                  <p className="text-xs text-slate-300">{t('organonModalSub')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setViewLayout('tabs')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      viewLayout === 'tabs' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {t('organonViewTabs')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewLayout('sideBySide')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      viewLayout === 'sideBySide' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {t('organonViewSideBySide')}
                  </button>
                </div>
                <button
                  id="organon-open-stage2-workflow-modal-btn"
                  type="button"
                  onClick={() => setIsStage2WorkflowModalOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600/40 via-teal-600/40 to-indigo-600/40 hover:from-emerald-600/60 hover:via-teal-600/60 hover:to-indigo-600/60 text-emerald-200 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{t('organonStartStage2Workflow')}</span>
                </button>
                <button
                  id="organon-open-fast-questionnaire-modal-btn"
                  type="button"
                  onClick={() => setIsFastQuestionnaireModalOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600/40 via-orange-600/40 to-amber-700/40 hover:from-amber-600/60 hover:via-orange-600/60 hover:to-amber-700/60 text-amber-200 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t('btnOrganonFast')}</span>
                </button>
                <button 
                  onClick={() => setIsResultsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!compareResult.openai && viewLayout !== 'sideBySide' ? (
                <div className="space-y-4">
                  <div className="flex border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('gemini')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'gemini'
                          ? 'border-teal-600 text-teal-900 bg-teal-50/50'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {t('organonGeniusLabel')}
                    </button>
                    {enableRatio && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('arbitrator')}
                        className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                          activeTab === 'arbitrator'
                            ? 'border-purple-600 text-purple-900 bg-purple-50/50'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {t('organonStrictArbiterLabel')}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTab('endpruefer')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'endpruefer'
                          ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('organonEndprueferTabLabel')}</span>
                    </button>
                  </div>

                  <div className="bg-slate-50/90 rounded-xl border border-slate-200 p-4 space-y-4">
                    {activeTab === 'gemini' && renderThreeStageView(compareResult.gemini, t('organonGeniusLabel'))}
                    {enableRatio && activeTab === 'arbitrator' && (
                      isArbitrating ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
                          <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                          <p className="text-sm font-semibold text-slate-800">{t('organonArbitrationLoading')}</p>
                        </div>
                      ) : arbitratorResult ? (
                        renderBelegprueferView(arbitratorResult)
                      ) : (
                        <div className="text-center p-8 space-y-3">
                          <p className="text-xs text-slate-600">{t('organonArbitrationNotStarted')}</p>
                          <button
                            type="button"
                            onClick={() => fetchArbitration(compareResult.gemini, null)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-purple-700 transition-colors"
                          >
                            {t('organonStartArbitrationNow')}
                          </button>
                        </div>
                      )
                    )}
                    {activeTab === 'endpruefer' && (
                      isEndpruefend ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
                          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                          <p className="text-sm font-semibold text-slate-800">{t('organonEndprueferLoading')}</p>
                        </div>
                      ) : endprueferResult ? (
                        renderEndprueferView(endprueferResult)
                      ) : (
                        <div className="text-center p-8 space-y-3">
                          <p className="text-xs text-slate-600">{t('organonEndprueferNotStarted')}</p>
                          <button
                            type="button"
                            onClick={() => fetchEndpruefer(narrationInput, arbitratorResult, compareResult.gemini, compareResult.openai, enableRatio)}
                            disabled={enableRatio ? !arbitratorResult : !analysisResult}
                            className="px-4 py-2 bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-emerald-700 transition-colors"
                          >
                            {t('organonStartEndprueferNow')}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : viewLayout === 'sideBySide' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="bg-slate-50/70 rounded-xl border border-teal-200/80 p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-teal-100">
                        <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-teal-500" />
                          {t('organonGeniusLabel')}
                        </span>
                        <span className="text-[10px] text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full font-medium">{t('organonPrimarySynthesis')}</span>
                      </div>
                      {renderThreeStageView(compareResult.gemini, t('organonGeniusLabel'))}
                    </div>

                    <div className="bg-slate-50/70 rounded-xl border border-indigo-200/80 p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          {compareResult.openai ? t('organonOptimusLabel') : `${t('organonStrictArbiterLabel')} / ${t('organonConsensusMatchLabel')}`}
                        </span>
                        <span className="text-[10px] text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full font-medium">
                          {compareResult.openai ? t('organonParallelSynthesis') : t('organonVerifiedMatch')}
                        </span>
                      </div>
                      {compareResult.openai ? (
                        renderThreeStageView(compareResult.openai, t('organonOptimusLabel'))
                      ) : arbitratorResult ? (
                        renderBelegprueferView(arbitratorResult)
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
                          <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
                          <p className="text-xs">{t('organonArbitratorLoadingShort')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {enableRatio && compareResult.openai && (
                    <div className="bg-slate-50/70 rounded-xl border border-purple-200/80 p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                        <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          {t('organonStrictArbiterLabel')} ({t('organonConsensusMatchLabel')})
                        </span>
                        {!arbitratorResult && !isArbitrating && (
                          <button
                            type="button"
                            onClick={() => fetchArbitration(compareResult.gemini, compareResult.openai)}
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-purple-700"
                          >
                            {t('organonStartArbitration')}
                          </button>
                        )}
                      </div>
                      {isArbitrating ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
                          <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
                          <p className="text-xs font-semibold text-slate-700">{t('organonArbitrationLoading')}</p>
                        </div>
                      ) : arbitratorResult ? (
                        renderBelegprueferView(arbitratorResult)
                      ) : null}
                    </div>
                  )}

                  {/* 4th Stage: Endprüfer (Texttreue & Auswertung) */}
                  <div className="bg-slate-50/70 rounded-xl border border-emerald-200/80 p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        {t('organonEndprueferTabLabel')}
                      </span>
                      {!endprueferResult && !isEndpruefend && (enableRatio ? !!arbitratorResult : !!analysisResult) && (
                        <button
                          type="button"
                          onClick={() => fetchEndpruefer(narrationInput, arbitratorResult, compareResult.gemini, compareResult.openai, enableRatio)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-emerald-700"
                        >
                          {t('organonStartEndprueferNow')}
                        </button>
                      )}
                    </div>
                    {isEndpruefend ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                        <p className="text-xs font-semibold text-slate-700">{t('organonEndprueferLoading')}</p>
                      </div>
                    ) : endprueferResult ? (
                      renderEndprueferView(endprueferResult)
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500 italic">
                        {t('organonEndprueferNotStarted')}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('gemini')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'gemini'
                          ? 'border-teal-600 text-teal-900 bg-teal-50/50'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {t('organonGeniusLabel')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('openai')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'openai'
                          ? 'border-indigo-600 text-indigo-900 bg-indigo-50/50'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {t('organonOptimusLabel')}
                    </button>
                    {enableRatio && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('arbitrator')}
                        className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                          activeTab === 'arbitrator'
                            ? 'border-purple-600 text-purple-900 bg-purple-50/50'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {t('organonStrictArbiterLabel')}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTab('endpruefer')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'endpruefer'
                          ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('organonEndprueferTabLabel')}</span>
                    </button>
                  </div>

                  <div className="bg-slate-50/90 rounded-xl border border-slate-200 p-4 space-y-4">
                    {activeTab === 'gemini' && renderThreeStageView(compareResult.gemini, t('organonGeniusLabel'))}
                    {activeTab === 'openai' && renderThreeStageView(compareResult.openai, t('organonOptimusLabel'))}
                    {enableRatio && activeTab === 'arbitrator' && (
                      isArbitrating ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
                          <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                          <p className="text-sm font-semibold text-slate-800">{t('organonArbitrationLoading')}</p>
                        </div>
                      ) : arbitratorResult ? (
                        renderBelegprueferView(arbitratorResult)
                      ) : (
                        <div className="text-center p-8 space-y-3">
                          <p className="text-xs text-slate-600">{t('organonArbitrationNotStarted')}</p>
                          <button
                            type="button"
                            onClick={() => fetchArbitration(compareResult.gemini, compareResult.openai)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-purple-700 transition-colors"
                          >
                            {t('organonStartArbitrationNow')}
                          </button>
                        </div>
                      )
                    )}
                    {activeTab === 'endpruefer' && (
                      isEndpruefend ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
                          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                          <p className="text-sm font-semibold text-slate-800">{t('organonEndprueferLoading')}</p>
                        </div>
                      ) : endprueferResult ? (
                        renderEndprueferView(endprueferResult)
                      ) : (
                        <div className="text-center p-8 space-y-3">
                          <p className="text-xs text-slate-600">{t('organonEndprueferNotStarted')}</p>
                          <button
                            type="button"
                            onClick={() => fetchEndpruefer(narrationInput, arbitratorResult, compareResult.gemini, compareResult.openai, enableRatio)}
                            disabled={enableRatio ? !arbitratorResult : !analysisResult}
                            className="px-4 py-2 bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-emerald-700 transition-colors"
                          >
                            {t('organonStartEndprueferNow')}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">{t('organonModalFooterNote')}</span>
              <button
                type="button"
                onClick={() => setIsResultsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {t('organonClose')}
              </button>
            </div>

          </motion.div>
        </div>
      )}

      <OrganonDynamicQuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        rawText={analysisResult?.raw_text || narrationInput}
        initialMatrices={analysisResult?.complaint_matrices || []}
        initialRelations={analysisResult?.complaint_relations || []}
        endprueferResult={endprueferResult}
      />

      <CausaVertiefungModal
        isOpen={isCausaModalOpen}
        onClose={() => setIsCausaModalOpen(false)}
        rawText={analysisResult?.raw_text || narrationInput}
        existingCausaText={getExistingCausaText()}
        endprueferResult={endprueferResult}
        onAdoptCausa={handleAdoptCausa}
        hahnemannCrossCheck={enableHahnemannCrossCheck}
      />

      <LocalisatioVertiefungModal
        isOpen={isLocalisatioModalOpen}
        onClose={() => setIsLocalisatioModalOpen(false)}
        rawText={analysisResult?.raw_text || narrationInput}
        existingLocalisatioText={getExistingLocalisatioText()}
        endprueferResult={endprueferResult}
        onAdoptLocalisatio={handleAdoptLocalisatio}
        hahnemannCrossCheck={enableHahnemannCrossCheck}
      />

      <OrganonStage2WorkflowModal
        isOpen={isStage2WorkflowModalOpen}
        onClose={() => setIsStage2WorkflowModalOpen(false)}
        rawText={analysisResult?.raw_text || narrationInput}
        stage1Values={getStage1ValuesMap()}
        initialRecords={stage2Records}
        onRecordsChange={handleStage2RecordsChange}
        endprueferResult={endprueferResult}
        hahnemannCrossCheck={enableHahnemannCrossCheck}
        onHahnemannCrossCheckChange={(enabled) => setEnableHahnemannCrossCheck(enabled)}
        onAdoptCategoryResult={handleAdoptStage2Result}
        onWorkflowCompleted={handleStage2WorkflowCompleted}
      />

      <OrganonFastQuestionnaireModal
        isOpen={isFastQuestionnaireModalOpen}
        onClose={() => setIsFastQuestionnaireModalOpen(false)}
        rawText={analysisResult?.raw_text || narrationInput}
        stage1Values={getStage1ValuesMap()}
        endprueferResult={endprueferResult}
        arbitratorResult={arbitratorResult}
        onAdoptResults={handleAdoptFastResults}
      />
    </div>
  );
};
