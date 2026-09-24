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
  ChevronUp,
  MapPin,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { 
  LocalisatioVertiefungState, 
  LocalisatioAbCompareState 
} from '../types.localisatioVertiefung';
import {
  LOCALISATIO_DIMENSION_NAMES,
  LocalisatioDimensionId
} from '../types/localisatioDeepDive';
import { 
  initLocalisatioVertiefung, 
  submitLocalisatioAnswer, 
  finalizeLocalisatioVertiefung,
  initLocalisatioAbCompare,
  submitLocalisatioAbCompareAnswer,
  finalizeLocalisatioAbCompare
} from '../services/localisatioVertiefungService';
import { 
  isSpeechRecognitionSupported, 
  startSpeechRecognition, 
  SpeechRecognitionSession,
  mergeWithOverlap,
  deduplicateRepeatedPhrases
} from '../services/speechService';

interface LocalisatioVertiefungModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawText: string;
  existingLocalisatioText?: string;
  endprueferResult?: any | null;
  onAdoptLocalisatio?: (finalLocalisatioText: string) => void;
  hahnemannCrossCheck?: boolean;
  isEmbedded?: boolean;
  onWorkflowComplete?: (finalLocalisatioText: string) => void;
  onPartialChange?: (finalLocalisatioText: string) => void;
}

export const LocalisatioVertiefungModal: React.FC<LocalisatioVertiefungModalProps> = ({
  isOpen,
  onClose,
  rawText,
  existingLocalisatioText = '',
  endprueferResult = null,
  onAdoptLocalisatio,
  hahnemannCrossCheck = false,
  isEmbedded = false,
  onWorkflowComplete,
  onPartialChange
}) => {
  const { t, language } = useTranslation();
  const [state, setState] = useState<LocalisatioVertiefungState | null>(null);
  const [stateA, setStateA] = useState<LocalisatioVertiefungState | null>(null);
  const [stateB, setStateB] = useState<LocalisatioVertiefungState | null>(null);
  const [activeMode, setActiveMode] = useState<'gemini-only' | '3-tier' | 'ab-compare'>(
    hahnemannCrossCheck ? '3-tier' : 'gemini-only'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showEvidence, setShowEvidence] = useState<boolean>(false);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(false);
  const [showAgentProposals, setShowAgentProposals] = useState<boolean>(true);

  // Speech recording state & refs
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
      loadInitialState(mode);
    } else {
      stopRecording();
    }
  }, [isOpen, hahnemannCrossCheck]);

  const loadInitialState = async (mode: 'gemini-only' | '3-tier' | 'ab-compare') => {
    setLoading(true);
    try {
      if (mode === 'ab-compare') {
        const ab = await initLocalisatioAbCompare(rawText, existingLocalisatioText, language, endprueferResult);
        setStateA(ab.branchA);
        setStateB(ab.branchB);
        setState(ab.branchB);
      } else {
        const s = await initLocalisatioVertiefung(rawText, existingLocalisatioText, language, endprueferResult, mode);
        setState(s);
      }
    } catch (err) {
      console.error('[LocalisatioModal] Failed to load initial state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = async (newMode: 'gemini-only' | '3-tier' | 'ab-compare') => {
    if (newMode === activeMode) return;
    setActiveMode(newMode);
    loadInitialState(newMode);
  };

  const handleAnswerSubmit = async () => {
    if (!answerInput.trim() || loading) return;
    stopRecording();
    const currentAnswer = answerInput.trim();
    setAnswerInput('');
    setLoading(true);

    try {
      if (activeMode === 'ab-compare' && stateA && stateB) {
        const ab = await submitLocalisatioAbCompareAnswer(rawText, stateA, stateB, currentAnswer, language);
        setStateA(ab.branchA);
        setStateB(ab.branchB);
        setState(ab.branchB);
      } else if (state) {
        const nextState = await submitLocalisatioAnswer(rawText, state, currentAnswer, language, activeMode);
        setState(nextState);
        if (onPartialChange) {
          const finalSyms = Object.values(nextState.symptoms || {});
          const summaryText = nextState.finalSummary?.overallResult || finalSyms.map(s => {
            const fTexts = (s.facts || []).map(f => f.normalizedValue?.patientRawTerm || f.evidenceText).filter(Boolean);
            return `${s.symptomLabel}: ${fTexts.join(', ') || 'Keine genaue Lokalisation'}`;
          }).join('; ');
          if (summaryText) {
            onPartialChange(summaryText);
          }
        }
      }
    } catch (err) {
      console.error('[LocalisatioModal] Failed to submit answer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (loading) return;
    stopRecording();
    setLoading(true);

    try {
      if (activeMode === 'ab-compare' && stateA && stateB) {
        const ab = await finalizeLocalisatioAbCompare(rawText, stateA, stateB, language);
        setStateA(ab.branchA);
        setStateB(ab.branchB);
        setState(ab.branchB);
      } else if (state) {
        const nextState = await finalizeLocalisatioVertiefung(rawText, state, language, activeMode);
        setState(nextState);
      }
    } catch (err) {
      console.error('[LocalisatioModal] Failed to finalize:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdopt = () => {
    if (!state) return;
    const finalSyms = Object.values(state.symptoms || {});
    let summaryText = "";

    if (state.finalSummary?.overallResult) {
      summaryText = state.finalSummary.overallResult;
    } else {
      summaryText = finalSyms.map(s => {
        const fTexts = (s.facts || []).map(f => f.normalizedValue?.patientRawTerm || f.evidenceText).filter(Boolean);
        return `${s.symptomLabel}: ${fTexts.join(', ') || 'Keine genaue Lokalisation'}`;
      }).join('; ');
    }

    if (onAdoptLocalisatio) {
      onAdoptLocalisatio(summaryText);
    }
    if (onWorkflowComplete) {
      onWorkflowComplete(summaryText);
    }
    if (!isEmbedded) {
      onClose();
    }
  };

  // -------------------------------------------------------------
  // Speech Recording Setup (Voice Dictation)
  // -------------------------------------------------------------
  const startRecording = () => {
    if (!isSpeechSupported || isRecording) return;
    setIsRecording(true);
    setRecordSecondsLeft(60);
    recordingBaseTextRef.current = answerInput;
    lastSpokenTranscriptRef.current = '';
    isFinalizingRef.current = false;

    timerIntervalRef.current = window.setInterval(() => {
      setRecordSecondsLeft(prev => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    recognitionRef.current = startSpeechRecognition({
      language: (language as any) || 'de',
      continuous: true,
      interimResults: true,
      onResult: (text: string) => {
        lastSpokenTranscriptRef.current = text;
        const base = recordingBaseTextRef.current.trim();
        const combined = base ? mergeWithOverlap(base, text) : text;
        setAnswerInput(deduplicateRepeatedPhrases(combined));
      },
      onError: (err: any) => {
        console.warn('[LocalisatioModal] Speech Recognition error:', err);
        stopRecording();
      },
      onEnd: () => {
        if (isRecording && !isFinalizingRef.current) {
          stopRecording();
        }
      }
    });
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  if (!isOpen) return null;

  const activeSymptomId = state?.activeSymptomId || 'sym_1';
  const activeSymptom = state?.symptoms?.[activeSymptomId];
  const activeSymLabel = activeSymptom?.symptomLabel || 'Hauptbeschwerde';
  const symptomOrder = state?.symptomOrder || [activeSymptomId];

  const mainContent = (
    <>
      {/* Multi-Symptom Stepper Ribbon */}
      {symptomOrder.length > 0 && (
          <div id="localisatio-symptoms-ribbon" className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              {t('localisatioMultiSymptomWorkflow')}
            </span>
            <div className="flex items-center gap-2 flex-nowrap">
              {symptomOrder.map((symId, idx) => {
                const sym = state?.symptoms?.[symId];
                const isActive = symId === activeSymptomId;
                const isDone = sym?.isSymptomCompleted;

                return (
                  <div
                    key={symId}
                    id={`localisatio-step-${symId}`}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      isActive
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm'
                        : isDone
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700/40'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-900/60 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span>{sym?.symptomLabel || symId}</span>
                    {isDone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
                    ) : isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse ml-0.5" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Body */}
        <div id="localisatio-modal-body" className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading && !state && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-teal-400" />
              <p className="text-sm font-medium">{t('localisatioLoadingNext')}</p>
            </div>
          )}

          {/* If Vertiefung is Finished */}
          {state?.isFinished ? (
            <div id="localisatio-finished-container" className="space-y-6">
              <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-emerald-300">
                    {t('localisatioFinishedTitle')}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {state.stoppingReason || t('localisatioNoOpenAspects')}
                  </p>
                </div>
              </div>

              {/* 3-Level Evaluation */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    {t('localisatioLevelATitle')}
                  </h4>
                  <ul className="space-y-1 pl-4 list-disc text-xs text-slate-200">
                    {state.finalSummary?.levelA_patientReported?.map((item, i) => (
                      <li key={i}>{item}</li>
                    )) || <li>{t('localisatioNoKnownFacts')}</li>}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    {t('localisatioLevelBTitle')}
                  </h4>
                  <ul className="space-y-1 pl-4 list-disc text-xs text-slate-200">
                    {state.finalSummary?.levelB_conservativeNormalizations?.map((item, i) => (
                      <li key={i}>{item}</li>
                    )) || <li>{t('localisatioLevelBResolved')}</li>}
                  </ul>
                </div>

                {state.finalSummary?.levelC_unresolvedOrVague && state.finalSummary.levelC_unresolvedOrVague.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {t('localisatioLevelCTitle')}
                    </h4>
                    <ul className="space-y-1 pl-4 list-disc text-xs text-slate-300">
                      {state.finalSummary.levelC_unresolvedOrVague.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  id="localisatio-close-finish-btn"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  {t('localisatioCloseBtn')}
                </button>
                <button
                  id="localisatio-adopt-finish-btn"
                  onClick={handleAdopt}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-md transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {onWorkflowComplete ? t('stage2AdoptAndContinueBtn') : t('localisatioAdoptBtn')}
                </button>
              </div>
            </div>
          ) : (
            /* Active Vertiefung Flow */
            state?.currentQuestion && (
              <div id="localisatio-active-question-flow" className="space-y-5">
                {/* Active Question Card */}
                <div id="localisatio-question-card" className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-teal-500/30 shadow-lg space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                        {state.currentQuestion.targetDimension ? LOCALISATIO_DIMENSION_NAMES[state.currentQuestion.targetDimension as LocalisatioDimensionId] || state.currentQuestion.targetDimension : 'Lokalisation'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Fokus: <strong className="text-slate-200">{state.currentQuestion.targetSymptomLabel || activeSymLabel}</strong>
                      </span>
                    </div>

                    {state.turnDurations && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {((state.turnDurations.totalMs || 0) / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>

                  <p className="text-base font-medium text-slate-100 leading-relaxed">
                    {state.currentQuestion.questionText}
                  </p>

                  {state.currentQuestion.orientationExample && (
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 space-y-1">
                      <span className="font-semibold text-slate-300 block">
                        Orientierungshilfe für den Therapeuten:
                      </span>
                      <p className="italic text-slate-300">
                        {state.currentQuestion.orientationExample}
                      </p>
                    </div>
                  )}

                  {/* 3-Tier Arbitration Note */}
                  {state.currentQuestion.arbitrationNote && (
                    <div className="text-xs text-indigo-300/80 flex items-center gap-1.5 pt-1">
                      <Brain className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{state.currentQuestion.arbitrationNote}</span>
                    </div>
                  )}
                </div>

                {/* Patient Answer Box */}
                <div id="localisatio-answer-box" className="space-y-3">
                  <div className="relative">
                    <textarea
                      id="localisatio-patient-answer-input"
                      value={answerInput}
                      onChange={(e) => setAnswerInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAnswerSubmit();
                        }
                      }}
                      placeholder={t('localisatioAnswerPlaceholder')}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-sm resize-none"
                    />

                    {isRecording && (
                      <div className="absolute top-3 right-3 flex items-center gap-2 px-2 py-1 rounded-md bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-mono animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>{recordSecondsLeft}s</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isSpeechSupported && (
                        <button
                          id="localisatio-voice-dictation-btn"
                          type="button"
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                            isRecording
                              ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                        >
                          {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-teal-400" />}
                          <span>{isRecording ? t('causaStopDictationBtn') : t('causaDictateAnswerBtn')}</span>
                        </button>
                      )}

                      <button
                        id="localisatio-manual-finalize-btn"
                        type="button"
                        onClick={handleFinalize}
                        disabled={loading}
                        className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                      >
                        {t('localisatioFinishBtn')}
                      </button>
                    </div>

                    <button
                      id="localisatio-submit-answer-btn"
                      type="button"
                      onClick={handleAnswerSubmit}
                      disabled={!answerInput.trim() || loading}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center gap-2"
                    >
                      {loading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{t('localisatioSubmitAnswerBtn')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Accordion: 7 Localisatio-Dimensionen (L1–L7) */}
          <div id="localisatio-dimensions-accordion" className="border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
            <button
              id="localisatio-toggle-dimensions-btn"
              onClick={() => setShowDimensions(!showDimensions)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>{t('localisatioDimensionsTitle')}</span>
                <span className="text-slate-500 font-normal">({activeSymLabel})</span>
              </div>
              {showDimensions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDimensions && (
              <div className="p-4 border-t border-slate-800 space-y-2">
                <p className="text-[11px] text-slate-400 pb-2">
                  {t('localisatioDimensionsSubtitle')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'] as LocalisatioDimensionId[]).map((dimId) => {
                    const dimState = activeSymptom?.dimensions?.[dimId];
                    const comp = dimState?.completion || 'UNERHOBEN';
                    const isExplored = comp === 'AUSREICHEND_ERHOBEN';
                    const isPartial = comp === 'TEILWEISE_ERHOBEN';
                    const isTarget = state?.currentQuestion?.targetDimension === dimId;

                    return (
                      <div
                        key={dimId}
                        id={`localisatio-dim-card-${dimId}`}
                        className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-2 ${
                          isTarget
                            ? 'bg-teal-500/10 border-teal-500/40'
                            : isExplored
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : isPartial
                            ? 'bg-amber-950/20 border-amber-500/30'
                            : 'bg-slate-900/60 border-slate-800/80'
                        }`}
                      >
                        <div>
                          <span className="font-semibold text-slate-200 block">
                            {LOCALISATIO_DIMENSION_NAMES[dimId]}
                          </span>
                          {dimState?.summaryNote && (
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {dimState.summaryNote}
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                          isExplored
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isPartial
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {comp === 'AUSREICHEND_ERHOBEN' ? t('localisatioStatusAusreichend') : comp === 'TEILWEISE_ERHOBEN' ? t('localisatioStatusTeilweise') : t('localisatioStatusUnerhoben')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Accordion: Räumliche Vektoren & Dynamik (L7) */}
          <div id="localisatio-vectors-accordion" className="border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
            <button
              id="localisatio-toggle-vectors-btn"
              onClick={() => setShowVectors(!showVectors)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>{t('localisatioVectorsTitle')}</span>
              </div>
              {showVectors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showVectors && (
              <div className="p-4 border-t border-slate-800 space-y-2">
                {activeSymptom?.dynamicVectors && activeSymptom.dynamicVectors.length > 0 ? (
                  <div className="space-y-2">
                    {activeSymptom.dynamicVectors.map((vec, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-900 border border-indigo-500/30 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">{vec.originText}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-semibold text-slate-200">{vec.targetText || 'Stationär'}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px]">
                          {vec.vectorType}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    {t('localisatioVectorsEmpty')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Accordion: Belegte Evidenzen & Fakten */}
          <div id="localisatio-evidence-accordion" className="border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
            <button
              id="localisatio-toggle-evidence-btn"
              onClick={() => setShowEvidence(!showEvidence)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('localisatioEvidenceTitle')} ({state?.evidenceList?.length || 0})</span>
              </div>
              {showEvidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showEvidence && (
              <div className="p-4 border-t border-slate-800 space-y-2">
                {state?.evidenceList && state.evidenceList.length > 0 ? (
                  <div className="space-y-2">
                    {state.evidenceList.map((ev, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-200">{ev.content}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-mono">
                            {ev.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 italic">
                          „{ev.originalQuote}“
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    {t('localisatioNoKnownFacts')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Accordion: Frageverlauf (Historie) */}
          <div id="localisatio-history-accordion" className="border border-slate-800 rounded-xl bg-slate-950/40 overflow-hidden">
            <button
              id="localisatio-toggle-history-btn"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>{t('localisatioHistoryTitle')} ({state?.history?.length || 0})</span>
              </div>
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showHistory && (
              <div className="p-4 border-t border-slate-800 space-y-3">
                {state?.history && state.history.length > 0 ? (
                  state.history.map((h, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-400 font-semibold text-[11px]">
                        <span>Turn {h.step || i + 1}</span>
                        {h.dimension && <span>{h.dimension}</span>}
                      </div>
                      <p className="text-teal-300/90 font-medium">F: {h.question}</p>
                      <p className="text-slate-300 pl-3 border-l-2 border-slate-700">A: {h.answer}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    {t('localisatioNoHistoryYet')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
    </>
  );

  if (isEmbedded) {
    return (
      <div id="localisatio-embedded-view" className="w-full flex flex-col flex-1 bg-slate-900 text-slate-100 overflow-y-auto">
        <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-bold">{t('localisatioModalTitle')} (L1–L7)</span>
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
    <div id="localisatio-vertiefung-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        id="localisatio-vertiefung-modal-container"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div id="localisatio-modal-header" className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                  {t('localisatioModalTitle')}
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Stage 2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('localisatioModalSubtitle')}
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
              id="localisatio-modal-close-btn"
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
