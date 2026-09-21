import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Send, 
  RefreshCw, 
  History, 
  ShieldCheck, 
  Layers, 
  Info,
  Clock,
  Check,
  AlertTriangle,
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
  CausaEvidenceStatus,
  CausaAbCompareState
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
  isEmbedded?: boolean;
  onWorkflowComplete?: (finalCausaText: string) => void;
}

export const CausaVertiefungModal: React.FC<CausaVertiefungModalProps> = ({
  isOpen,
  onClose,
  rawText,
  existingCausaText = '',
  endprueferResult = null,
  onAdoptCausa,
  hahnemannCrossCheck = false,
  isEmbedded = false,
  onWorkflowComplete
}) => {
  const { t, language } = useTranslation();
  const [state, setState] = useState<CausaVertiefungState | null>(null);
  const [stateA, setStateA] = useState<CausaVertiefungState | null>(null);
  const [stateB, setStateB] = useState<CausaVertiefungState | null>(null);
  const [activeMode, setActiveMode] = useState<'gemini-only' | '3-tier' | 'ab-compare'>(
    hahnemannCrossCheck ? '3-tier' : 'gemini-only'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showEvidence, setShowEvidence] = useState<boolean>(false);
  const [showAgentProposals, setShowAgentProposals] = useState<boolean>(true);
  const [show13Dimensions, setShow13Dimensions] = useState<boolean>(false);

  // Speech recording state & refs (Organon Layout)
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecondsLeft, setRecordSecondsLeft] = useState(60);
  const isSpeechSupported = isSpeechRecognitionSupported();
  const recognitionRef = useRef<SpeechRecognitionSession | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const recordingBaseTextRef = useRef<string>('');
  const lastSpokenTranscriptRef = useRef<string>('');
  const isFinalizingRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const mode = hahnemannCrossCheck ? '3-tier' : 'gemini-only';
      setActiveMode(mode);
      setAnswerInput('');
      setShowHistory(false);
      setShowEvidence(false);
      setShowAgentProposals(true);
      loadInitialState(mode);
    }
  }, [isOpen, rawText, existingCausaText, endprueferResult, hahnemannCrossCheck]);

  const loadInitialState = async (modeToUse: 'gemini-only' | '3-tier' | 'ab-compare' = activeMode) => {
    setLoading(true);
    try {
      if (modeToUse === 'ab-compare') {
        const abRes = await initCausaAbCompare(rawText, existingCausaText, language, endprueferResult);
        setStateA(abRes.branchA);
        setStateB(abRes.branchB);
      } else {
        const res = await initCausaVertiefung(rawText, existingCausaText, language, endprueferResult, modeToUse);
        setState(res);
        if (res.pipelineMode) {
          setActiveMode(res.pipelineMode);
        }
      }
    } catch (err) {
      console.error('[CausaVertiefungModal] Error loading initial state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = async (newMode: 'gemini-only' | '3-tier' | 'ab-compare') => {
    if (newMode === activeMode || loading) return;
    setActiveMode(newMode);
    loadInitialState(newMode);
  };

  const startVoiceRecording = () => {
    if (!isSpeechSupported) return;

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
    try {
      if (activeMode === 'ab-compare') {
        if (!stateA || !stateB) return;
        const nextAb = await submitCausaAbCompareAnswer(rawText, stateA, stateB, answer, language);
        setStateA(nextAb.branchA);
        setStateB(nextAb.branchB);
      } else {
        if (!state) return;
        const nextState = await submitCausaAnswer(rawText, state, answer, language, activeMode);
        setState(nextState);
        if (nextState.pipelineMode) {
          setActiveMode(nextState.pipelineMode);
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
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {t('causaStatusExplicit')}
          </span>
        );
      case 'DENIED':
      case 'AUSDRÜCKLICH_VERNEINT':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            {t('causaStatusDenied')}
          </span>
        );
      case 'UNCERTAIN':
      case 'UNSICHER':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {t('causaStatusUncertain')}
          </span>
        );
      case 'NICHT_ERINNERLICH':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300">
            {t('stage2NotRememberedBtn')}
          </span>
        );
      case 'AMBIGUOUS':
      case 'MEHRDEUTIG':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            {t('causaStatusAmbiguous')}
          </span>
        );
      case 'CONFLICT':
      case 'WIDERSPRÜCHLICH':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
            {t('causaStatusConflict')}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
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
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
                    ? 'bg-teal-600 text-white border-teal-700 font-bold shadow-2xs'
                    : isExplored
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
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
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[320px] text-slate-400 space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
          <span className="text-xs">{t('causaLoadingNext')}</span>
        </div>
      );
    }

    const isFin = Boolean(branchState.isFinished);
    const curQ = branchState.currentQuestion;

    return (
      <div className={`bg-white border rounded-xl p-4 sm:p-5 shadow-xs flex flex-col space-y-4 transition-all ${
        branchKey === 'A' ? 'border-slate-300 ring-1 ring-slate-200' : 'border-teal-300 ring-1 ring-teal-200'
      }`}>
        {/* Branch Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {branchKey === 'A' ? (
              <Layers className="w-4 h-4 text-slate-700 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
            )}
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              {title}
            </h4>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Status Badge */}
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
              isFin 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                : 'bg-teal-50 text-teal-900 border-teal-200'
            }`}>
              {isFin ? t('causaStatusStopped') : t('causaStatusContinue')}
            </span>

            {/* Laufzeit */}
            {branchState.turnDurations?.totalMs != null && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{t('causaTurnRuntimeSeconds', { seconds: (branchState.turnDurations.totalMs / 1000).toFixed(2) })}</span>
              </span>
            )}
          </div>
        </div>

        {/* Detaillierte Laufzeitaufschlüsselung bei Branch A */}
        {branchKey === 'A' && branchState.turnDurations?.geminiMs != null && (
          <div className="text-[10px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between flex-wrap gap-1">
            <span>Gemini: {((branchState.turnDurations.geminiMs || 0) / 1000).toFixed(1)}s</span>
            <span>•</span>
            <span>GPT: {((branchState.turnDurations.gptMs || 0) / 1000).toFixed(1)}s</span>
            <span>•</span>
            <span>Arb: {((branchState.turnDurations.arbitratorMs || 0) / 1000).toFixed(1)}s</span>
          </div>
        )}

        {/* Frage oder Abschluss-Zusammenfassung */}
        {!isFin && curQ ? (
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {t('causaQuestionLabel')}
              </span>
              {curQ.targetDimension && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-teal-100 text-teal-900 rounded border border-teal-200">
                  {t('causaTargetDimensionLabel')} {curQ.targetDimension}
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-slate-900 leading-snug">
              „{curQ.questionText}“
            </p>

            {curQ.orientationExample && (
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2 text-xs text-amber-950">
                <span className="text-[10px] font-bold text-amber-800 uppercase block mb-0.5">
                  {t('causaOrientationExampleLabel')}
                </span>
                <p className="italic leading-relaxed text-[11px]">„{curQ.orientationExample}“</p>
              </div>
            )}

            {/* Begründung / Note */}
            <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                {t('causaReasonDimensionLabel')}
              </span>
              <p className="text-[11px] leading-relaxed">
                {branchKey === 'A' ? (curQ.arbitrationNote || curQ.reason) : curQ.reason}
              </p>
            </div>
          </div>
        ) : isFin && branchState.finalSummary ? (
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t('causaFinishedTitle')}</span>
              </div>
              {branchState.stoppingReason && (
                <span className="text-[10px] bg-white text-emerald-900 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                  {branchState.stoppingReason}
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                  {t('causaLevelATitle')}
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-800">
                  {(branchState.finalSummary.levelA_patientReported || []).map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
                  {t('causaLevelBTitle')}
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-800">
                  {(branchState.finalSummary.levelB_unresolvedOrConflicting || []).map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAdoptBranch(branchState)}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{onWorkflowComplete ? t('stage2AdoptAndContinueBtn') : t('causaAdoptToAnalysisBtn')} ({branchKey === 'A' ? t('causaBranchATitle') : t('causaBranchBTitle')})</span>
            </button>
          </div>
        ) : null}

        {/* C1–C13 Status */}
        {renderCompactDimensions(curQ?.targetDimension, branchState.evidenceList, branchState.knownFacts)}

        {/* Bekannte Fakten & Offene Aspekte */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          {/* Bekannte Fakten */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">
              {t('causaKnownTitle')} ({(branchState.knownFacts || []).length})
            </span>
            {(branchState.knownFacts || []).length > 0 ? (
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {(branchState.knownFacts || []).map((kf, i) => (
                  <div key={i} className="text-[11px] bg-white p-1.5 rounded border border-emerald-100 text-slate-800">
                    <p className="font-medium">{kf.text}</p>
                    {kf.evidence && (
                      <p className="text-[9px] text-emerald-700 italic">„{kf.evidence}“</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic">{t('causaNoKnownFacts')}</p>
            )}
          </div>

          {/* Offene Aspekte */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">
              {t('causaOpenTitle')} ({(branchState.openAspects || []).length})
            </span>
            {(branchState.openAspects || []).length > 0 ? (
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {(branchState.openAspects || []).map((oa, i) => (
                  <div key={i} className="text-[11px] bg-white p-1.5 rounded border border-amber-100 text-slate-800">
                    <p className="font-medium">{oa.text}</p>
                    {oa.reason && (
                      <p className="text-[9px] text-amber-800 italic">{oa.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
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
      <div className="bg-white border border-teal-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wide">
            <Send className="w-4 h-4 text-teal-600" />
            <span>{t('causaPatientAnswerLabel')} ({t('causaSharedInputForBoth')})</span>
          </div>
          {isRecording && (
            <span className="text-[11px] font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
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
            className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[90px] resize-y"
            disabled={loading}
          />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    isRecording 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-teal-600" />}
                  <span>{isRecording ? t('causaStopDictationBtn') : t('causaDictateAnswerBtn')}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFinalize}
                disabled={loading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t('causaFinalizeBtn')}</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={!answerInput.trim() || loading}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
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
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <span>{t('causaHistoryTitle')} ({maxSteps} {t('causaTurnsUnitLabel')})</span>
          </div>
          <span className="text-[11px] text-slate-500 font-normal">
            {showHistory ? '▲ Verbergen' : '▼ Anzeigen'}
          </span>
        </button>

        {showHistory && (
          <div className="p-4 space-y-4">
            {Array.from({ length: maxSteps }).map((_, idx) => {
              const hA = historyA[idx];
              const hB = historyB[idx];
              const sharedAnswer = (hA as any)?.answer || (hB as any)?.answer || (hA as any)?.patientAnswer || (hB as any)?.patientAnswer || '';
              const qA = (hA as any)?.question || (hA as any)?.questionText || '';
              const qB = (hB as any)?.question || (hB as any)?.questionText || '';

              return (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
                    <span>{t('causaQuestionCount', { current: idx + 1 })}</span>
                  </div>

                  {/* Fragen Gegenüberstellung */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 block uppercase">
                        {t('causaBranchATitle')}
                      </span>
                      {qA ? (
                        <p className="font-medium text-slate-900 leading-relaxed">„{qA}“</p>
                      ) : (
                        <p className="text-slate-400 italic">{t('causaNoQuestionRecorded')}</p>
                      )}
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-teal-200 space-y-1">
                      <span className="text-[10px] font-bold text-teal-700 block uppercase">
                        {t('causaBranchBTitle')}
                      </span>
                      {qB ? (
                        <p className="font-medium text-slate-900 leading-relaxed">„{qB}“</p>
                      ) : (
                        <p className="text-slate-400 italic">{t('causaNoQuestionRecorded')}</p>
                      )}
                    </div>
                  </div>

                  {/* Geteilte Patientenantwort */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                      {t('causaPatientAnswerLabel')}:
                    </span>
                    {sharedAnswer ? (
                      <span className="text-slate-800 leading-relaxed whitespace-pre-wrap">{sharedAnswer}</span>
                    ) : (
                      <span className="text-slate-400 italic">{t('causaNoAnswerRecorded')}</span>
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

  const modalBody = (
    <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
      {/* Causa-Prüfmodus Toggle & Status Banner */}
          <div className="bg-gradient-to-r from-teal-50 via-slate-50 to-emerald-50 border border-teal-200/90 rounded-xl p-3.5 shadow-2xs space-y-2.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Modus-Umschalter (Pill-Buttons für Hahnemann-Gegenprüfung) */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                  {t('causaModeToggleLabel')}
                </span>
                <div className="inline-flex p-1 bg-white/90 rounded-lg border border-teal-200 shadow-2xs gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('gemini-only')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeMode === 'gemini-only'
                        ? 'bg-teal-600 text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-teal-50/60'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('organonHahnemannCrossCheckLabel')}: {t('causaHahnemannInactiveBadge')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('3-tier')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeMode === '3-tier'
                        ? 'bg-teal-600 text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-teal-50/60'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('organonHahnemannCrossCheckLabel')}: {t('causaHahnemannActiveBadge')}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: 13-Dimensionen-Toggle */}
              <button
                type="button"
                onClick={() => setShow13Dimensions(!show13Dimensions)}
                className="self-start md:self-auto px-3 py-1.5 bg-white hover:bg-teal-100/60 border border-teal-300 text-teal-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Brain className="w-3.5 h-3.5 text-teal-700" />
                <span>{t('causa13DimensionsTitle')}</span>
                {show13Dimensions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Modus-Details & Laufzeitanzeige */}
            <div className="pt-2 border-t border-teal-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {activeMode === 'gemini-only' ? (
                  <>
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-slate-600" />
                      {t('organonHahnemannCrossCheckLabel')}: {t('causaHahnemannInactiveBadge')}
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium">
                      {t('causaGeminiOnlyBannerDesc')}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-teal-100 text-teal-900 border border-teal-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-teal-700" />
                      {t('organonHahnemannCrossCheckLabel')}: {t('causaHahnemannActiveBadge')}
                    </span>
                    <span className="text-[11px] text-teal-900/90 font-medium">
                      {t('causa3TierBannerDesc')}
                    </span>
                  </>
                )}
              </div>

              {/* Laufzeit-Anzeige pro Turn (Single Mode) */}
              {activeMode !== 'ab-compare' && state?.turnDurations?.totalMs != null && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-mono bg-white/80 px-2.5 py-1 rounded-md border border-teal-200/80 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                  <span className="font-semibold text-slate-900">{t('causaTurnRuntimeLabel')}</span>
                  <span className="font-bold text-teal-800">
                    {t('causaTurnRuntimeSeconds', { seconds: (state.turnDurations.totalMs / 1000).toFixed(2) })}
                  </span>
                  {activeMode === '3-tier' && state.turnDurations.geminiMs != null && (
                    <span className="text-[10px] text-slate-500 font-normal ml-1">
                      (Gemini: {((state.turnDurations.geminiMs || 0) / 1000).toFixed(1)}s | GPT: {((state.turnDurations.gptMs || 0) / 1000).toFixed(1)}s | Arb: {((state.turnDurations.arbitratorMs || 0) / 1000).toFixed(1)}s)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Ausklappbares Denkgerüst der 13 Causa-Dimensionen */}
            {show13Dimensions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2 border-t border-teal-100 text-xs text-slate-700 space-y-2"
              >
                <p className="text-[11px] text-teal-900/90 italic">
                  {t('causa13DimensionsDesc')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                  {(Object.keys(CAUSA_DIMENSION_NAMES) as CausaDimensionId[]).map((dimId) => {
                    const isCurrent = state?.currentQuestion?.targetDimension === dimId;
                    const isExplored = state?.evidenceList?.some(e => e.dimension === dimId);
                    return (
                      <div
                        key={dimId}
                        className={`p-2 rounded-lg border text-xs flex items-start gap-2 transition-all ${
                          isCurrent
                            ? 'bg-teal-100 border-teal-400 font-bold text-teal-950 shadow-2xs ring-1 ring-teal-400/50'
                            : isExplored
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-700 opacity-80'
                        }`}
                      >
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isCurrent ? 'bg-teal-600 text-white' : isExplored ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {dimId}
                        </span>
                        <div className="flex-1 leading-tight">
                          <span className="block">{CAUSA_DIMENSION_NAMES[dimId]}</span>
                          <span className="text-[9px] font-normal opacity-75">
                            {isCurrent ? t('causaDimInFocus') : isExplored ? t('causaDimExplored') : t('causaDimPending')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Content Area: A/B Comparison vs Single Mode */}
          {activeMode === 'ab-compare' ? (
            <div className="space-y-6">
              {/* Dual-Column Parallel Branch Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                {renderBranchColumn(stateA, 'A', t('causaBranchATitle'))}
                {renderBranchColumn(stateB, 'B', t('causaBranchBTitle'))}
              </div>

              {/* Geteilte Patientenantwort-Eingabe */}
              {renderSharedAnswerInput()}

              {/* Parallele Gesprächshistorie */}
              {renderAbHistory()}
            </div>
          ) : (
            <>
              {/* Top Section: Rule 5 - Known vs Open */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bereits bekannt */}
                <div className="bg-white border border-emerald-200/80 rounded-xl p-4 shadow-2xs flex flex-col">
                  <div className="flex items-center gap-2 pb-2 mb-2 border-b border-emerald-100 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t('causaKnownTitle')}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    {state && (state.knownFacts || []).length > 0 ? (
                      (state.knownFacts || []).map((fact, idx) => (
                        <div key={idx} className="text-xs text-slate-700 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                          <p className="font-medium text-slate-900 leading-relaxed">{fact.text}</p>
                          {fact.evidence && (
                            <p className="text-[10px] text-emerald-700 italic mt-1 flex items-center gap-1">
                              <span className="font-semibold">{t('causaOriginalQuoteLabel')}</span> „{fact.evidence}“
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">
                        {t('causaNoKnownFacts')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Noch offen */}
                <div className="bg-white border border-amber-200/80 rounded-xl p-4 shadow-2xs flex flex-col">
                  <div className="flex items-center gap-2 pb-2 mb-2 border-b border-amber-100 text-amber-800 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{t('causaOpenTitle')}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    {state && (state.openAspects || []).length > 0 ? (
                      (state.openAspects || []).map((aspect, idx) => (
                        <div key={idx} className="text-xs text-slate-700 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                          <p className="font-medium text-slate-900 leading-relaxed">{aspect.text}</p>
                          {aspect.reason && (
                            <p className="text-[10px] text-amber-800 italic mt-1">
                              {aspect.reason}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-emerald-700 font-medium py-2 flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        {t('causaNoOpenAspects')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

          {/* Active Question or Final Summary */}
          {state && !state.isFinished && state.currentQuestion && (
            <div className="bg-white border border-teal-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                  <span>{t('causaQuestionCount', { current: state.history.length + 1 })}</span>
                </div>
                {state.currentQuestion.targetDimension && (
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                    {state.currentQuestion.targetDimension}
                  </span>
                )}
              </div>

              {/* The Single Question */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  {t('causaQuestionLabel')}
                </label>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  „{state.currentQuestion.questionText}“
                </h4>
              </div>

              {/* Begründung / Schiedsrichter-Vermerk je nach Prüfmodus */}
              {activeMode === 'gemini-only' ? (
                <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-3 text-xs text-teal-950 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-teal-900 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                      <span>{t('causaModeGeminiOnly')}</span>
                    </div>
                    {state.turnDurations?.totalMs != null && (
                      <span className="text-[11px] font-mono font-semibold text-teal-800 bg-white/90 px-2 py-0.5 rounded border border-teal-200">
                        {t('causaTurnRuntimeLabel')} {t('causaTurnRuntimeSeconds', { seconds: (state.turnDurations.totalMs / 1000).toFixed(2) })}
                      </span>
                    )}
                  </div>
                  {state.currentQuestion.reason && (
                    <p className="text-teal-900 leading-relaxed pl-5">
                      {state.currentQuestion.reason}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-teal-50/90 via-slate-50 to-indigo-50/60 border border-teal-200/90 rounded-xl p-3.5 text-xs text-teal-950 space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-teal-900 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-teal-700" />
                      <span>{t('causaArbitrationNote')}</span>
                    </div>
                    {state.currentQuestion.agentOpinions && (
                      <button
                        type="button"
                        onClick={() => setShowAgentProposals(!showAgentProposals)}
                        className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 underline flex items-center gap-1 cursor-pointer ml-auto"
                      >
                        <span>{showAgentProposals ? t('causaAgentOpinionsHide') : t('causaAgentOpinionsBtn')}</span>
                      </button>
                    )}
                  </div>
                  {(state.currentQuestion.arbitrationNote || state.currentQuestion.reason) && (
                    <p className="text-teal-950 font-medium leading-relaxed pl-5">
                      {state.currentQuestion.arbitrationNote || state.currentQuestion.reason}
                    </p>
                  )}

                  {/* Transparente Anzeige der unabhängigen Vorschläge (Gemini & GPT) */}
                  {showAgentProposals && state.currentQuestion.agentOpinions && (
                    <div className="mt-2.5 pt-2.5 border-t border-teal-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                      <div className="bg-white/90 p-3 rounded-lg border border-teal-200 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-teal-900 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                            {t('causaGeminiProposal')}
                          </span>
                          {state.turnDurations?.geminiMs != null && (
                            <span className="text-[10px] font-mono text-slate-500">
                              {((state.turnDurations.geminiMs || 0) / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                        <p className="italic text-slate-900 font-medium leading-relaxed">
                          „{state.currentQuestion.agentOpinions.geminiQuestion}“
                        </p>
                      </div>
                      <div className="bg-white/90 p-3 rounded-lg border border-indigo-200 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-indigo-900 flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-indigo-600" />
                            {t('causaGptProposal')}
                          </span>
                          {state.turnDurations?.gptMs != null && (
                            <span className="text-[10px] font-mono text-slate-500">
                              {((state.turnDurations.gptMs || 0) / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                        <p className="italic text-slate-900 font-medium leading-relaxed">
                          „{state.currentQuestion.agentOpinions.gptQuestion}“
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Rule 6: Orientation example for therapist */}
              {state.currentQuestion.orientationExample && (
                <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 text-xs text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-900 uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t('causaOrientationExampleLabel')}</span>
                  </div>
                  <p className="text-amber-900/90 italic pl-5 leading-relaxed">
                    „{state.currentQuestion.orientationExample}“
                  </p>
                </div>
              )}

              {/* Answer Input Field & Voice Recording (Organon Layout) */}
              <div className="space-y-2 pt-1">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  <div className="relative flex-1">
                    <textarea
                      id="causa-patient-answer-input"
                      rows={5}
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
                      className="w-full h-full min-h-[130px] p-4 bg-slate-50/50 focus:bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-y shadow-2xs"
                    />
                  </div>

                  {/* Vertical Aufnahme Button like in Organon */}
                  <button
                    type="button"
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    disabled={!isSpeechSupported || loading}
                    className={`w-full sm:w-32 md:w-36 shrink-0 rounded-xl text-white flex flex-col items-center justify-center gap-2 p-3 transition-all shadow-xs cursor-pointer min-h-[130px] border ${
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
                      <span>{t('causaMicActive')}</span>
                      <span>{recordSecondsLeft}s</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleFinalize}
                    disabled={loading}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {t('causaFinishVertiefungBtn')}
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={!answerInput.trim() || loading}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer ml-auto"
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
            </div>
          )}

          {/* Rule 11: Final Summary on 3 Levels */}
          {state && state.isFinished && state.finalSummary && (
            <div className="bg-white border border-teal-300 rounded-xl p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-teal-100 pb-3">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  <span>{t('causaFinishedTitle')}</span>
                </div>
                {state.stoppingReason && (
                  <span className="text-[11px] font-medium bg-teal-100/70 text-teal-900 px-2.5 py-1 rounded-lg border border-teal-200">
                    <strong className="font-semibold">{t('causaStoppingReasonLabel')}</strong> {state.stoppingReason}
                  </span>
                )}
              </div>

              {/* Ebene A */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2">
                <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>{t('causaLevelATitle')}</span>
                </h5>
                <ul className="list-disc list-inside text-xs text-emerald-950 space-y-1 pl-1">
                  {(state.finalSummary.levelA_patientReported || []).map((item, idx) => (
                    <li key={idx} className="leading-relaxed font-medium">{item}</li>
                  ))}
                </ul>
              </div>

              {/* Ebene B */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
                <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>{t('causaLevelBTitle')}</span>
                </h5>
                <ul className="list-disc list-inside text-xs text-amber-950 space-y-1 pl-1">
                  {(state.finalSummary.levelB_unresolvedOrConflicting || []).map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>

              {/* Ebene C */}
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 space-y-2">
                <h5 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-700" />
                  <span>{t('causaLevelCTitle')}</span>
                </h5>
                <ul className="list-disc list-inside text-xs text-purple-950 space-y-1 pl-1">
                  {(state.finalSummary.levelC_homeopathicInterpretation || []).map((item, idx) => (
                    <li key={idx} className="leading-relaxed italic">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleAdopt}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{onWorkflowComplete ? t('stage2AdoptAndContinueBtn') : t('causaAdoptToAnalysisBtn')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Collapsible: Evidence List (Rule 9) */}
          {state && (state.evidenceList || []).length > 0 && (
            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setShowEvidence(!showEvidence)}
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>{t('causaEvidenceTitle')} ({(state.evidenceList || []).length})</span>
                </div>
                <span className="text-[11px] text-slate-500 font-normal">
                  {showEvidence ? '▲ Verbergen' : '▼ Anzeigen'}
                </span>
              </button>

              {showEvidence && (
                <div className="p-3 space-y-2 divide-y divide-slate-100">
                  {(state.evidenceList || []).map((ev, idx) => (
                    <div key={idx} className="pt-2 first:pt-0 text-xs flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(ev.status)}
                          <span className="font-semibold text-slate-900">{ev.content}</span>
                        </div>
                        {ev.originalQuote && (
                          <p className="text-[11px] text-slate-600 italic">
                            <span className="text-slate-400 not-italic">{t('causaOriginalQuoteLabel')}</span> „{ev.originalQuote}“
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400">
                          {ev.source} • {t('causaAssignedSymptomLabel')} {ev.assignedSymptom}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Collapsible: History */}
          {state && (state.history || []).length > 0 && (
            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-600" />
                  <span>{t('causaHistoryTitle')} ({(state.history || []).length})</span>
                </div>
                <span className="text-[11px] text-slate-500 font-normal">
                  {showHistory ? '▲ Verbergen' : '▼ Anzeigen'}
                </span>
              </button>

              {showHistory && (
                <div className="p-3 space-y-3">
                  {(state.history || []).map((h, idx) => {
                    const qText = (h as any).question || (h as any).questionText || (h as any).text || '';
                    const aText = (h as any).answer || (h as any).patientAnswer || (h as any).extractedNotes || '';
                    const stepNum = h.step || idx + 1;
                    return (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
                          <span>{t('causaQuestionCount', { current: stepNum })}</span>
                        </div>
                        {qText ? (
                          <p className="font-medium text-slate-800">„{qText}“</p>
                        ) : (
                          <p className="font-medium text-slate-500 italic">„{t('causaQuestionCount', { current: stepNum })}“</p>
                        )}
                        <div className="bg-white p-2.5 rounded-md border border-slate-200 text-slate-900 text-xs mt-1">
                          <span className="text-[10px] font-bold text-teal-700 block uppercase mb-0.5">Antwort:</span>
                          {aText ? (
                            <span className="text-slate-800 leading-relaxed whitespace-pre-wrap">{aText}</span>
                          ) : (
                            <span className="text-slate-400 italic">{t('causaNoAnswerRecorded')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
            </>
          )}
        </div>
  );

  if (isEmbedded) {
    return (
      <div id="causa-embedded-view" className="w-full flex flex-col flex-1 bg-slate-50/50 overflow-y-auto">
        {modalBody}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className={`bg-white w-full ${activeMode === 'ab-compare' ? 'max-w-6xl' : 'max-w-4xl'} rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden transition-all`}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{t('causaModalTitle')}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-teal-400/20 text-teal-300 border border-teal-400/30 rounded-full">
                  §§ 83–104
                </span>
              </h3>
              <p className="text-xs text-teal-200/80 mt-0.5">
                {t('causaModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label={t('causaCloseBtn')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {modalBody}

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Organon §§ 83–104 • Hahnemann & Bönninghausen</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors cursor-pointer"
          >
            {t('causaCloseBtn')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
