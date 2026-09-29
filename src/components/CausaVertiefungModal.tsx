import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  RefreshCw, 
  History, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Check, 
  Mic, 
  MicOff, 
  Brain, 
  GitCompare, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { 
  CausaVertiefungState, 
  CausaEvidenceStatus 
} from '../types.causaVertiefung';
import { 
  CAUSA_DIMENSION_NAMES, 
  CausaDimensionId 
} from '../types/causaDeepDive';
import { 
  initCausaVertiefung, 
  submitCausaAnswer, 
  finalizeCausaVertiefung,
  initCausaAbCompare,
  submitCausaAbCompareAnswer,
  finalizeCausaAbCompare
} from '../services/causaVertiefungService';
import { OrganonLiveProgress, LiveProcessStep, LiveProcessStepStatus } from './OrganonLiveProgress';
import { 
  isSpeechRecognitionSupported, 
  startSpeechRecognition, 
  SpeechRecognitionSession,
  mergeWithOverlap,
  deduplicateRepeatedPhrases
} from '../services/speechService';

interface CausaVertiefungModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawText: string;
  existingCausaText?: string;
  endprueferResult?: any | null;
  onAdoptCausa?: (finalCausaText: string) => void;
  hahnemannCrossCheck?: boolean;
  mode?: 'gemini-only' | '3-tier' | 'ab-compare';
  isEmbedded?: boolean;
  onWorkflowComplete?: (finalCausaText: string) => void;
  onPartialChange?: (causaText: string) => void;
}

export const CausaVertiefungModal: React.FC<CausaVertiefungModalProps> = ({
  isOpen,
  onClose,
  rawText,
  existingCausaText = '',
  endprueferResult = null,
  onAdoptCausa,
  hahnemannCrossCheck = false,
  mode: propMode,
  isEmbedded = false,
  onWorkflowComplete,
  onPartialChange
}) => {
  const { t, language } = useTranslation();
  const [state, setState] = useState<CausaVertiefungState | null>(null);
  const [stateA, setStateA] = useState<CausaVertiefungState | null>(null);
  const [stateB, setStateB] = useState<CausaVertiefungState | null>(null);
  const [activeMode, setActiveMode] = useState<'gemini-only' | '3-tier' | 'ab-compare'>(
    propMode || (hahnemannCrossCheck ? '3-tier' : 'gemini-only')
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showEvidence, setShowEvidence] = useState<boolean>(false);
  const [showAgentProposals, setShowAgentProposals] = useState<boolean>(true);
  const [show13Dimensions, setShow13Dimensions] = useState<boolean>(false);
  const [causaLiveSteps, setCausaLiveSteps] = useState<LiveProcessStep[]>([]);

  const getInitialCausaSteps = (mode: 'gemini-only' | '3-tier' | 'ab-compare'): LiveProcessStep[] => {
    if (mode === 'gemini-only') {
      return [
        { id: 'causa_analysis_dimensions', labelKey: 'causaStepAnalysisDimensions', status: 'active' },
        { id: 'causa_next_question', labelKey: 'causaStepProcessAndNext', status: 'pending' }
      ];
    }
    return [
      { id: 'causa_analysis_dimensions', labelKey: 'causaStepAnalysisDimensions', status: 'active' },
      { id: 'causa_hahnemann_check', labelKey: 'causaStepHahnemannCheck', status: 'pending' },
      { id: 'causa_next_question', labelKey: 'causaStepProcessAndNext', status: 'pending' }
    ];
  };

  // Speech recording state & refs
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecondsLeft, setRecordSecondsLeft] = useState(60);
  const isSpeechSupported = isSpeechRecognitionSupported();
  const recognitionRef = useRef<SpeechRecognitionSession | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const recordingBaseTextRef = useRef<string>('');
  const lastSpokenTranscriptRef = useRef<string>('');
  const isFinalizingRef = useRef<boolean>(false);
  const initRequestIdRef = useRef<number>(0);
  const prevInitKeyRef = useRef<string>('');

  useEffect(() => {
    if (isOpen) {
      const mode = propMode || (hahnemannCrossCheck ? '3-tier' : 'gemini-only');
      const initKey = `${mode}|${rawText}|${existingCausaText}|${Boolean(endprueferResult)}|${isOpen}`;
      if (prevInitKeyRef.current === initKey) {
        return;
      }
      prevInitKeyRef.current = initKey;
      setActiveMode(mode);
      setAnswerInput('');
      setShowHistory(false);
      setShowEvidence(false);
      setShowAgentProposals(true);
      setShow13Dimensions(false);
      loadInitialState(mode);
    } else {
      prevInitKeyRef.current = '';
    }
  }, [isOpen, rawText, existingCausaText, Boolean(endprueferResult), hahnemannCrossCheck, propMode]);

  const loadInitialState = async (modeToUse: 'gemini-only' | '3-tier' | 'ab-compare' = activeMode) => {
    const thisRequestId = ++initRequestIdRef.current;
    setLoading(true);
    setCausaLiveSteps(getInitialCausaSteps(modeToUse));
    try {
      if (modeToUse === 'ab-compare') {
        const abRes = await initCausaAbCompare(rawText, existingCausaText, language, endprueferResult);
        if (thisRequestId !== initRequestIdRef.current) return;
        setStateA(abRes.branchA);
        setStateB(abRes.branchB);
      } else {
        const res = await initCausaVertiefung(rawText, existingCausaText, language, endprueferResult, modeToUse);
        if (thisRequestId !== initRequestIdRef.current) return;
        setState(res);
        if (res.pipelineMode) {
          setActiveMode(res.pipelineMode);
        }
      }
    } catch (err) {
      if (thisRequestId !== initRequestIdRef.current) return;
      console.error('[CausaVertiefungModal] Error loading initial state:', err);
    } finally {
      if (thisRequestId === initRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSwitchMode = async (newMode: 'gemini-only' | '3-tier' | 'ab-compare') => {
    if (newMode === activeMode || loading) return;
    setActiveMode(newMode);
    prevInitKeyRef.current = `${newMode}|${rawText}|${existingCausaText}|${Boolean(endprueferResult)}|${isOpen}`;
    loadInitialState(newMode);
  };

  const startVoiceRecording = () => {
    if (!isSpeechSupported || isRecording) return;

    recordingBaseTextRef.current = answerInput;
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
          setAnswerInput(deduplicateRepeatedPhrases(trimmed));
        } else {
          setAnswerInput(mergeWithOverlap(base, trimmed));
        }
      },
      onError: (err) => {
        console.warn('[CausaVertiefungModal] Speech recognition notice:', err);
        stopVoiceRecording();
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
    setAnswerInput((prev) => deduplicateRepeatedPhrases(prev));
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen && isRecording) {
      stopVoiceRecording();
    }
  }, [isOpen]);

  const handleSubmitAnswer = async () => {
    if (isRecording) {
      stopVoiceRecording();
    }
    if (!answerInput.trim() || loading) return;
    const answer = answerInput.trim();
    setAnswerInput('');
    setLoading(true);

    const initialSteps = getInitialCausaSteps(activeMode);
    setCausaLiveSteps(initialSteps);

    const onStepUpdate = (stepId: string, status: LiveProcessStepStatus) => {
      setCausaLiveSteps((prev) => {
        const steps = prev.length > 0 ? prev : initialSteps;
        return steps.map((s) => (s.id === stepId ? { ...s, status } : s));
      });
    };

    try {
      if (activeMode === 'ab-compare') {
        if (!stateA || !stateB) return;
        const nextAb = await submitCausaAbCompareAnswer(rawText, stateA, stateB, answer, language, onStepUpdate);
        setStateA(nextAb.branchA);
        setStateB(nextAb.branchB);
      } else {
        if (!state) return;
        const nextState = await submitCausaAnswer(rawText, state, answer, language, activeMode, onStepUpdate);
        setState(nextState);
        if (nextState.pipelineMode) {
          setActiveMode(nextState.pipelineMode);
        }
        if (onPartialChange) {
          const summaryA = (nextState.finalSummary?.levelA_patientReported || []).join('; ');
          const rawC = (nextState.finalSummary?.levelC_homeopathicInterpretation || [])
            .filter(c => c && !c.includes('Klassische Einzelfall-Repertorisation'))
            .join('; ');
          const partialText = rawC ? `${summaryA} (${rawC})` : (summaryA || (nextState.knownFacts || []).map(f => f.text).filter(Boolean).join('; '));
          if (partialText) {
            onPartialChange(partialText);
          }
        }
      }
    } catch (err) {
      console.error('[CausaVertiefungModal] Error submitting answer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (loading) return;
    if (isRecording) {
      stopVoiceRecording();
    }
    setLoading(true);
    try {
      if (activeMode === 'ab-compare') {
        if (!stateA || !stateB) return;
        const finalAb = await finalizeCausaAbCompare(rawText, stateA, stateB, language);
        setStateA(finalAb.branchA);
        setStateB(finalAb.branchB);
      } else {
        if (!state) return;
        const finalState = await finalizeCausaVertiefung(rawText, state, language);
        setState(finalState);
      }
    } catch (err) {
      console.error('[CausaVertiefungModal] Error finalizing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdopt = () => {
    if (state?.finalSummary) {
      const summaryA = (state.finalSummary.levelA_patientReported || []).join('; ');
      const rawC = (state.finalSummary.levelC_homeopathicInterpretation || [])
        .filter(c => c && !c.includes('Klassische Einzelfall-Repertorisation'))
        .join('; ');
      const textToAdopt = rawC ? `${summaryA} (${rawC})` : summaryA;
      if (onAdoptCausa) {
        onAdoptCausa(textToAdopt);
      }
      if (onWorkflowComplete) {
        onWorkflowComplete(textToAdopt);
      }
    }
    if (!isEmbedded) {
      onClose();
    }
  };

  const handleAdoptBranch = (branchState: CausaVertiefungState | null) => {
    if (branchState?.finalSummary) {
      const summaryA = (branchState.finalSummary.levelA_patientReported || []).join('; ');
      const rawC = (branchState.finalSummary.levelC_homeopathicInterpretation || [])
        .filter(c => c && !c.includes('Klassische Einzelfall-Repertorisation'))
        .join('; ');
      const textToAdopt = rawC ? `${summaryA} (${rawC})` : summaryA;
      if (onAdoptCausa) {
        onAdoptCausa(textToAdopt);
      }
      if (onWorkflowComplete) {
        onWorkflowComplete(textToAdopt);
      }
    }
    if (!isEmbedded) {
      onClose();
    }
  };

  const renderStatusBadge = (status: CausaEvidenceStatus) => {
    switch (status) {
      case 'EXPLICIT':
      case 'BELEGT_FAKTISCH':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            {t('causaStatusExplicit')}
          </span>
        );
      case 'DENIED':
      case 'AUSDRÜCKLICH_VERNEINT':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            {t('causaStatusDenied')}
          </span>
        );
      case 'UNCERTAIN':
      case 'UNSICHER':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {t('causaStatusUncertain')}
          </span>
        );
      case 'NICHT_ERINNERLICH':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {t('stage2NotRememberedBtn')}
          </span>
        );
      case 'AMBIGUOUS':
      case 'MEHRDEUTIG':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            {t('causaStatusAmbiguous')}
          </span>
        );
      case 'CONFLICT':
      case 'WIDERSPRÜCHLICH':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
            {t('causaStatusConflict')}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            {t('causaStatusUnknown')}
          </span>
        );
    }
  };

  const renderCompactDimensions = (
    currentTarget?: string,
    evidenceList: any[] = [],
    knownFacts: any[] = []
  ) => {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>{t('causaDimensionsOverviewLabel')}</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
          {(Object.keys(CAUSA_DIMENSION_NAMES) as CausaDimensionId[]).map((dimId) => {
            const isCurrent = currentTarget === dimId;
            const isExplored = evidenceList.some(e => e.dimension === dimId) || knownFacts.some((k: any) => k.dimension === dimId);
            return (
              <div
                key={dimId}
                title={`${dimId}: ${CAUSA_DIMENSION_NAMES[dimId]}`}
                className={`px-1.5 py-1 rounded text-[10px] font-mono flex items-center justify-between border transition-all ${
                  isCurrent
                    ? 'bg-teal-500/30 text-teal-200 border-teal-400 font-bold shadow-xs'
                    : isExplored
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 font-semibold'
                    : 'bg-slate-900/60 text-slate-500 border-slate-800'
                }`}
              >
                <span>{dimId}</span>
                <span className="text-[8px] ml-0.5">
                  {isCurrent ? '●' : isExplored ? '✓' : '○'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBranchColumn = (
    branchState: CausaVertiefungState | null,
    branchKey: 'A' | 'B',
    title: string
  ) => {
    if (!branchState) {
      return (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[320px] text-slate-400 space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin text-teal-400" />
          <span className="text-xs">{t('causaLoadingNext')}</span>
        </div>
      );
    }

    const isFin = Boolean(branchState.isFinished);
    const curQ = branchState.currentQuestion;

    return (
      <div className={`bg-gradient-to-br from-slate-800/90 to-slate-900 border rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col space-y-4 transition-all ${
        branchKey === 'A' ? 'border-slate-700/80' : 'border-teal-500/30'
      }`}>
        {/* Branch Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {branchKey === 'A' ? (
              <Layers className="w-4 h-4 text-slate-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
            )}
            <h4 className="font-bold text-xs sm:text-sm text-slate-100">
              {title}
            </h4>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
              isFin 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
            }`}>
              {isFin ? t('causaStatusStopped') : t('causaStatusContinue')}
            </span>

            {branchState.turnDurations?.totalMs != null && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-950/60 text-slate-300 border border-slate-800 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{t('causaTurnRuntimeSeconds', { seconds: (branchState.turnDurations.totalMs / 1000).toFixed(2) })}</span>
              </span>
            )}
          </div>
        </div>

        {branchKey === 'A' && branchState.turnDurations?.geminiMs != null && (
          <div className="text-[10px] text-slate-400 font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between flex-wrap gap-1">
            <span>Genius: {((branchState.turnDurations.geminiMs || 0) / 1000).toFixed(1)}s</span>
            <span>•</span>
            <span>Optimus: {((branchState.turnDurations.gptMs || 0) / 1000).toFixed(1)}s</span>
            <span>•</span>
            <span>Arb: {((branchState.turnDurations.arbitratorMs || 0) / 1000).toFixed(1)}s</span>
          </div>
        )}

        {!isFin && curQ ? (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t('causaQuestionLabel')}
              </span>
              {curQ.targetDimension && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded border border-teal-500/40">
                  {t('causaTargetDimensionLabel')} {curQ.targetDimension}
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-slate-100 leading-snug">
              „{curQ.questionText}“
            </p>

            {curQ.orientationExample && (
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-2.5 text-xs text-amber-200">
                <span className="text-[10px] font-bold text-amber-400 uppercase block mb-0.5">
                  {t('causaOrientationExampleLabel')}
                </span>
                <p className="italic leading-relaxed text-[11px] text-amber-300">„{curQ.orientationExample}“</p>
              </div>
            )}

            <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                {t('causaReasonDimensionLabel')}
              </span>
              <p className="text-[11px] leading-relaxed text-slate-300">
                {branchKey === 'A' ? (curQ.arbitrationNote || curQ.reason) : curQ.reason}
              </p>
            </div>
          </div>
        ) : isFin && branchState.finalSummary ? (
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t('causaFinishedTitle')}</span>
              </div>
              {branchState.stoppingReason && (
                <span className="text-[10px] bg-slate-900 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-medium">
                  {branchState.stoppingReason}
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-emerald-500/30">
                <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">
                  {t('causaLevelATitle')}
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-200">
                  {(branchState.finalSummary.levelA_patientReported || []).map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-amber-500/30">
                <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
                  {t('causaLevelBTitle')}
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-200">
                  {(branchState.finalSummary.levelB_unresolvedOrConflicting || []).map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAdoptBranch(branchState)}
              className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{onWorkflowComplete ? t('stage2AdoptAndContinueBtn') : t('causaAdoptToAnalysisBtn')} ({branchKey === 'A' ? t('causaBranchATitle') : t('causaBranchBTitle')})</span>
            </button>
          </div>
        ) : null}

        {renderCompactDimensions(curQ?.targetDimension, branchState.evidenceList, branchState.knownFacts)}

        <div className="grid grid-cols-1 gap-2 pt-1">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-400 uppercase block">
              {t('causaKnownTitle')} ({(branchState.knownFacts || []).length})
            </span>
            {(branchState.knownFacts || []).length > 0 ? (
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {(branchState.knownFacts || []).map((kf, i) => (
                  <div key={i} className="text-[11px] bg-slate-900/80 p-2 rounded-lg border border-emerald-500/20 text-slate-200">
                    <p className="font-medium text-slate-100">{kf.text}</p>
                    {kf.evidence && (
                      <p className="text-[9px] text-emerald-300 italic mt-0.5">„{kf.evidence}“</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 italic">{t('causaNoKnownFacts')}</p>
            )}
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-amber-400 uppercase block">
              {t('causaOpenTitle')} ({(branchState.openAspects || []).length})
            </span>
            {(branchState.openAspects || []).length > 0 ? (
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {(branchState.openAspects || []).map((oa, i) => (
                  <div key={i} className="text-[11px] bg-slate-900/80 p-2 rounded-lg border border-amber-500/20 text-slate-200">
                    <p className="font-medium text-slate-100">{oa.text}</p>
                    {oa.reason && (
                      <p className="text-[9px] text-amber-300 italic mt-0.5">{oa.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>{t('causaNoOpenAspects')}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSharedAnswerInput = () => {
    const isBothFinished = Boolean(stateA?.isFinished && stateB?.isFinished);
    if (isBothFinished) return null;

    return (
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900 border border-teal-500/30 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wide">
            <Send className="w-4 h-4 text-teal-400" />
            <span>{t('causaPatientAnswerLabel')} ({t('causaSharedInputForBoth')})</span>
          </div>
          {isRecording && (
            <span className="text-[11px] font-mono text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/40 flex items-center gap-1 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {recordSecondsLeft}s
            </span>
          )}
        </div>

        <div className="space-y-3">
          <textarea
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSubmitAnswer();
              }
            }}
            placeholder={t('causaSharedAnswerPlaceholder')}
            className="w-full text-xs p-3.5 rounded-xl border border-slate-700/80 bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 min-h-[90px] resize-y"
            disabled={loading}
          />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  disabled={loading}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border ${
                    isRecording 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-teal-400" />}
                  <span>{isRecording ? t('causaStopDictationBtn') : t('causaDictateAnswerBtn')}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFinalize}
                disabled={loading}
                className="px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t('causaFinalizeBtn')}</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={!answerInput.trim() || loading}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-md cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('causaSubmittingAnswer')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('causaSubmitBothBtn')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAbHistory = () => {
    const historyA = stateA?.history || [];
    const historyB = stateB?.history || [];
    const maxSteps = Math.max(historyA.length, historyB.length);
    if (maxSteps === 0) return null;

    return (
      <div className="border border-slate-800 rounded-2xl bg-slate-950/40 overflow-hidden shadow-md">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full px-4 py-3 bg-slate-900/80 hover:bg-slate-850 flex items-center justify-between text-xs font-bold text-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-400" />
            <span>{t('causaHistoryTitle')} ({maxSteps})</span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal">
            {showHistory ? '▲ Verbergen' : '▼ Anzeigen'}
          </span>
        </button>

        {showHistory && (
          <div className="p-3 space-y-3">
            {Array.from({ length: maxSteps }).map((_, idx) => {
              const hA = historyA[idx];
              const hB = historyB[idx];
              const sharedAnswer = (hA as any)?.answer || (hB as any)?.answer || '';
              const qA = (hA as any)?.question || (hA as any)?.questionText || '';
              const qB = (hB as any)?.question || (hB as any)?.questionText || '';

              return (
                <div key={idx} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span className="font-bold text-slate-300">{t('causaQuestionCount', { current: idx + 1 })}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {t('causaBranchATitle')}
                      </span>
                      {qA ? (
                        <p className="font-medium text-slate-100 leading-relaxed">„{qA}“</p>
                      ) : (
                        <p className="text-slate-500 italic">{t('causaNoQuestionRecorded')}</p>
                      )}
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-teal-500/20 space-y-1">
                      <span className="text-[10px] font-bold text-teal-400 block uppercase">
                        {t('causaBranchBTitle')}
                      </span>
                      {qB ? (
                        <p className="font-medium text-slate-100 leading-relaxed">„{qB}“</p>
                      ) : (
                        <p className="text-slate-500 italic">{t('causaNoQuestionRecorded')}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                      {t('causaPatientAnswerLabel')}:
                    </span>
                    {sharedAnswer ? (
                      <span className="text-slate-200 leading-relaxed whitespace-pre-wrap">{sharedAnswer}</span>
                    ) : (
                      <span className="text-slate-500 italic">{t('causaNoAnswerRecorded')}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // Main Content Assembly
  // -------------------------------------------------------------
  let mainContent: React.ReactNode = null;

  if (loading && !state && activeMode !== 'ab-compare') {
    mainContent = (
      <div id="causa-loading-state" className="p-6 flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
          <span>{t('causaLoadingNext')}</span>
        </div>
      </div>
    );
  } else if (loading && activeMode === 'ab-compare' && (!stateA || !stateB)) {
    mainContent = (
      <div id="causa-loading-state-ab" className="p-6 flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
          <span>{t('causaLoadingNext')}</span>
        </div>
      </div>
    );
  } else if (state?.isFinished) {
    mainContent = (
      <div id="causa-finished-container" className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900 text-slate-100">
        <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-emerald-300">
              {t('causaFinishedTitle')}
            </h3>
            <p className="text-xs text-slate-300">
              {state.stoppingReason || t('causaNoOpenAspects')}
            </p>
          </div>
        </div>

        {/* 3-Level Evaluation */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              {t('causaLevelATitle')}
            </h4>
            <ul className="space-y-1 pl-4 list-disc text-xs text-slate-200">
              {state.finalSummary?.levelA_patientReported && state.finalSummary.levelA_patientReported.length > 0 ? (
                state.finalSummary.levelA_patientReported.map((item, i) => (
                  <li key={i}>{item}</li>
                ))
              ) : (
                <li>{t('causaNoKnownFacts')}</li>
              )}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              {t('causaLevelBTitle')}
            </h4>
            <ul className="space-y-1 pl-4 list-disc text-xs text-slate-200">
              {state.finalSummary?.levelB_unresolvedOrConflicting && state.finalSummary.levelB_unresolvedOrConflicting.length > 0 ? (
                state.finalSummary.levelB_unresolvedOrConflicting.map((item, i) => (
                  <li key={i}>{item}</li>
                ))
              ) : (
                <li>{t('causaLevelBResolved')}</li>
              )}
            </ul>
          </div>

          {state.finalSummary?.levelC_homeopathicInterpretation && state.finalSummary.levelC_homeopathicInterpretation.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t('causaLevelCTitle')}
              </h4>
              <ul className="space-y-1 pl-4 list-disc text-xs text-slate-300">
                {state.finalSummary.levelC_homeopathicInterpretation.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            id="causa-close-finish-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors cursor-pointer"
          >
            {t('causaCloseBtn')}
          </button>
          <button
            id="causa-adopt-finish-btn"
            type="button"
            onClick={handleAdopt}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            {onWorkflowComplete ? t('stage2AdoptAndContinueBtn') : t('causaAdoptToAnalysisBtn')}
          </button>
        </div>
      </div>
    );
  } else if (activeMode === 'ab-compare') {
    mainContent = (
      <div id="causa-ab-container" className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900 text-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {renderBranchColumn(stateA, 'A', t('causaBranchATitle'))}
          {renderBranchColumn(stateB, 'B', t('causaBranchBTitle'))}
        </div>
        {renderSharedAnswerInput()}
        {renderAbHistory()}
      </div>
    );
  } else {
    // Active Question Workflow (Single Mode)
    mainContent = (
      <div id="causa-active-container" className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900 text-slate-100">
        {/* Question Card */}
        {state?.currentQuestion && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-teal-500/30 shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {state.currentQuestion.targetDimension ? `${state.currentQuestion.targetDimension}: ${CAUSA_DIMENSION_NAMES[state.currentQuestion.targetDimension as CausaDimensionId] || ''}` : t('stage2StepCausa')}
                </span>
                <span className="text-slate-400 text-xs">
                  {t('causaQuestionCount', { current: (state.history?.length || 0) + 1 })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {state.turnDurations?.totalMs != null && (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {((state.turnDurations.totalMs || 0) / 1000).toFixed(1)}s
                  </span>
                )}
                {activeMode === '3-tier' && state.currentQuestion.agentOpinions && (
                  <button
                    type="button"
                    onClick={() => setShowAgentProposals(!showAgentProposals)}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer ml-1"
                  >
                    {showAgentProposals ? t('causaAgentOpinionsHide') : t('causaAgentOpinionsBtn')}
                  </button>
                )}
              </div>
            </div>

            <p className="text-base font-medium text-slate-100 leading-relaxed">
              „{state.currentQuestion.questionText}“
            </p>

            {state.currentQuestion.orientationExample && (
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">
                  {t('causaOrientationTherapistLabel')}
                </span>
                <p className="italic text-slate-300">
                  {state.currentQuestion.orientationExample}
                </p>
              </div>
            )}

            {state.currentQuestion.arbitrationNote && !state.currentQuestion.arbitrationNote.toLowerCase().includes('undefined') && (
              <div className="text-xs text-indigo-300/80 flex items-center gap-1.5 pt-1">
                <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{state.currentQuestion.arbitrationNote}</span>
              </div>
            )}

            {showAgentProposals && state.currentQuestion.agentOpinions && activeMode === '3-tier' && (
              Boolean(state.currentQuestion.agentOpinions.geminiQuestion?.trim()) ||
              Boolean(state.currentQuestion.agentOpinions.gptQuestion?.trim())
            ) && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                {Boolean(state.currentQuestion.agentOpinions.geminiQuestion?.trim()) && (
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-teal-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                        {t('causaGeminiProposal')}
                      </span>
                      {state.turnDurations?.geminiMs != null && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {((state.turnDurations.geminiMs || 0) / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                    <p className="italic text-slate-200 font-medium leading-relaxed">
                      „{state.currentQuestion.agentOpinions.geminiQuestion}“
                    </p>
                  </div>
                )}
                {Boolean(state.currentQuestion.agentOpinions.gptQuestion?.trim()) && (
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-indigo-500/30 shadow-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-indigo-300 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        {t('causaGptProposal')}
                      </span>
                      {state.turnDurations?.gptMs != null && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {((state.turnDurations.gptMs || 0) / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                    <p className="italic text-slate-200 font-medium leading-relaxed">
                      „{state.currentQuestion.agentOpinions.gptQuestion}“
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Patient Answer Box */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              id="causa-patient-answer-input"
              rows={3}
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSubmitAnswer();
                }
              }}
              placeholder={t('causaAnswerPlaceholder')}
              disabled={loading}
              className="w-full p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/60 text-slate-100 text-xs resize-none placeholder:text-slate-500 transition-colors"
            />
            {isRecording && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>{recordSecondsLeft}s</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isSpeechSupported && (
                <button
                  id="causa-voice-record-btn"
                  type="button"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  disabled={loading}
                  className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all cursor-pointer ${
                    isRecording
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-teal-400" />}
                  <span>{isRecording ? t('causaStopDictationBtn') : t('causaDictateAnswerBtn')}</span>
                </button>
              )}

              <button
                id="causa-finish-early-btn"
                type="button"
                onClick={handleFinalize}
                disabled={loading}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 transition-colors cursor-pointer"
              >
                {t('causaFinishVertiefungBtn')}
              </button>
            </div>

            <button
              id="causa-submit-answer-btn"
              type="button"
              onClick={handleSubmitAnswer}
              disabled={loading || !answerInput.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('causaLoadingNext')}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t('causaSubmitAnswerBtn')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Accordion 1: 13 Causa-Dimensionen (C1–C13) */}
        <div id="causa-dimensions-accordion" className="border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
          <button
            id="causa-toggle-dimensions-btn"
            type="button"
            onClick={() => setShow13Dimensions(!show13Dimensions)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-teal-400" />
              <span>{t('causa13DimensionsTitle')}</span>
              <span className="text-slate-500 font-normal">({t('causaDimensionsOverviewLabel')})</span>
            </div>
            {show13Dimensions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {show13Dimensions && (
            <div className="p-4 border-t border-slate-800 space-y-2">
              <p className="text-[11px] text-slate-400 pb-2">
                {t('causa13DimensionsDesc')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {(Object.keys(CAUSA_DIMENSION_NAMES) as CausaDimensionId[]).map((dimId) => {
                  const isCurrent = state?.currentQuestion?.targetDimension === dimId;
                  const isExplored = (state?.evidenceList || []).some(e => e.dimension === dimId) || (state?.knownFacts || []).some((k: any) => k.dimension === dimId);
                  return (
                    <div
                      key={dimId}
                      id={`causa-dim-card-${dimId}`}
                      className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-2 transition-all ${
                        isCurrent
                          ? 'bg-teal-500/10 border-teal-500/40'
                          : isExplored
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-slate-900/60 border-slate-800/80'
                      }`}
                    >
                      <div>
                        <span className="font-semibold text-slate-200 block">
                          {dimId}: {CAUSA_DIMENSION_NAMES[dimId]}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {isCurrent ? t('causaDimInFocus') : isExplored ? t('causaDimExplored') : t('causaDimPending')}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                        isCurrent
                          ? 'bg-teal-500/20 text-teal-300 font-bold'
                          : isExplored
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isCurrent ? '● Im Fokus' : isExplored ? '✓ Erkundet' : 'Offen'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Accordion 2: Belegte Evidenzen & Fakten */}
        <div id="causa-evidence-accordion" className="border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
          <button
            id="causa-toggle-evidence-btn"
            type="button"
            onClick={() => setShowEvidence(!showEvidence)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('causaEvidenceTitle')} ({(state?.evidenceList?.length || 0) + (state?.knownFacts?.length || 0)})</span>
            </div>
            {showEvidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showEvidence && (
            <div className="p-4 border-t border-slate-800 space-y-3">
              {/* Bekannte Fakten */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  {t('causaKnownTitle')}
                </span>
                {state?.knownFacts && state.knownFacts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {state.knownFacts.map((kf, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <span className="font-medium text-slate-200 block">{kf.text}</span>
                        {kf.evidence && (
                          <p className="text-[11px] text-slate-400 italic">
                            „{kf.evidence}“
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">{t('causaNoKnownFacts')}</p>
                )}
              </div>

              {/* Offene Aspekte */}
              {state?.openAspects && state.openAspects.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    {t('causaOpenTitle')}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {state.openAspects.map((oa, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <span className="font-medium text-slate-200 block">{oa.text}</span>
                        {oa.reason && (
                          <p className="text-[11px] text-slate-400 italic">
                            {oa.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidenzliste mit Status */}
              {state?.evidenceList && state.evidenceList.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block">
                    {t('causaEvidenceTitle')}
                  </span>
                  <div className="space-y-1.5">
                    {state.evidenceList.map((ev, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-start justify-between gap-2">
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center gap-2">
                            {renderStatusBadge(ev.status)}
                            <span className="font-medium text-slate-200">{ev.content}</span>
                          </div>
                          {ev.originalQuote && (
                            <p className="text-[11px] text-slate-400 italic">
                              <span className="text-slate-500 not-italic">{t('causaOriginalQuoteLabel')}</span> „{ev.originalQuote}“
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accordion 3: Frageverlauf (Historie) */}
        <div id="causa-history-accordion" className="border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
          <button
            id="causa-toggle-history-btn"
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-slate-800/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>{t('causaHistoryTitle')} ({state?.history?.length || 0})</span>
            </div>
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHistory && (
            <div className="p-4 border-t border-slate-800 space-y-3">
              {state?.history && state.history.length > 0 ? (
                state.history.map((h, i) => {
                  const qText = (h as any).question || (h as any).questionText || (h as any).text || '';
                  const aText = (h as any).answer || (h as any).patientAnswer || (h as any).extractedNotes || '';
                  const stepNum = h.step || i + 1;
                  return (
                    <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px]">
                        <span>Turn {stepNum}</span>
                        {h.dimension && <span>{h.dimension}</span>}
                      </div>
                      <p className="text-teal-300/90 font-medium">F: {qText}</p>
                      <p className="text-slate-300 pl-3 border-l-2 border-slate-700">A: {aText}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {t('causaNoHistoryYet')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: Embedded View vs Full Modal
  // -------------------------------------------------------------
  if (isEmbedded) {
    return (
      <div id="causa-embedded-view" className="w-full flex flex-col flex-1 bg-slate-900 text-slate-100 overflow-y-auto">
        <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-bold">{t('causaModalTitle')} (C1–C13)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
            {activeMode === '3-tier' ? (
              <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                <Brain className="w-3.5 h-3.5" />
                {t('modeHahnemannBtn')}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-teal-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                {t('modeGeminiOnlyBtn')}
              </span>
            )}
          </div>
        </div>
        {mainContent}
      </div>
    );
  }

  return (
    <div id="causa-vertiefung-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        id="causa-vertiefung-modal-container"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full ${activeMode === 'ab-compare' ? 'max-w-6xl' : 'max-w-4xl'} max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100`}
      >
        {/* Header */}
        <div id="causa-modal-header" className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                  {t('causaModalTitle')}
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Stage 2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('causaModalSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Mode Badge (Zentral gesteuert vor Analyse-Start) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-medium">
              {activeMode === '3-tier' ? (
                <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                  <Brain className="w-3.5 h-3.5" />
                  {t('organonHahnemannCrossCheckLabel')}: {t('causaHahnemannActiveBadge')}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-teal-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('modeGeminiOnlyBtn')} ({t('causaHahnemannInactiveBadge')})
                </span>
              )}
            </div>

            <button
              id="causa-modal-close-btn"
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {mainContent}
      </motion.div>
    </div>
  );
};
