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
  ChevronDown, 
  ChevronUp,
  Compass,
  FileText
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { 
  requestCategoryDeepen, 
  CategoryDeepenState,
  CategoryHistoryItem
} from '../services/stage2CategoryDeepenService';
import { 
  isSpeechRecognitionSupported, 
  startSpeechRecognition, 
  SpeechRecognitionSession,
  mergeWithOverlap,
  deduplicateRepeatedPhrases
} from '../services/speechService';
import { STAGE2_CATEGORIES_METADATA, Stage2Category } from '../types/organonStage2Workflow';

interface GenericCategoryDeepDiveModalProps {
  category: Stage2Category;
  rawText: string;
  stage1Text?: string;
  dimensions: Array<{ code: string; title: string; desc: string }>;
  endprueferResult?: any | null;
  hahnemannCrossCheck?: boolean;
  engine?: 'gemini' | 'openai' | 'both';
  onEngineChange?: (engine: 'gemini' | 'openai' | 'both') => void;
  onAdopt: (summaryText: string, details?: any) => void;
  onPartialChange?: (currentText: string, details?: any) => void;
  initialDetails?: any;
}

export const GenericCategoryDeepDiveModal: React.FC<GenericCategoryDeepDiveModalProps> = ({
  category,
  rawText,
  stage1Text = '',
  dimensions,
  endprueferResult = null,
  hahnemannCrossCheck = false,
  engine = 'gemini',
  onEngineChange,
  onAdopt,
  onPartialChange,
  initialDetails
}) => {
  const { t, language } = useTranslation();
  const meta = STAGE2_CATEGORIES_METADATA[category] || { labelKey: category, dimensionsCode: category };
  
  const [state, setState] = useState<CategoryDeepenState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showFacts, setShowFacts] = useState<boolean>(true);

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
    const detailsStr = JSON.stringify(initialDetails || {});
    const initKey = `${category}|${rawText}|${stage1Text}|${hahnemannCrossCheck}|${engine}|${detailsStr}`;
    if (prevInitKeyRef.current === initKey) return;
    prevInitKeyRef.current = initKey;
    setAnswerInput('');
    setShowHistory(true);
    setEditingIndex(null);
    setState(null);
    loadInitialState();
  }, [category, rawText, stage1Text, hahnemannCrossCheck, engine, initialDetails]);

  const loadInitialState = async () => {
    const thisId = ++initRequestIdRef.current;
    setLoading(true);
    try {
      const initialHistory = initialDetails?.questionHistory || [];
      const initialFacts = initialDetails?.knownFacts || [];

      const res = await requestCategoryDeepen({
        action: 'init',
        category,
        categoryTitle: t(meta.labelKey as any),
        rawText,
        stage1Text,
        dimensions,
        questionHistory: initialHistory,
        knownFacts: initialFacts,
        language,
        engine
      });
      if (thisId !== initRequestIdRef.current) return;
      setState(res);
    } catch (err) {
      if (thisId !== initRequestIdRef.current) return;
      console.error(`[GenericCategoryDeepDiveModal] Init error for ${category}:`, err);
    } finally {
      if (thisId === initRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleAnswerSubmit = async (customAnswer?: string) => {
    const ans = customAnswer !== undefined ? customAnswer : answerInput.trim();
    if (!ans || loading || !state) return;
    stopVoiceRecording();
    setAnswerInput('');
    setLoading(true);

    try {
      let nextHistory: CategoryHistoryItem[];
      if (editingIndex !== null) {
        nextHistory = [...(state.questionHistory || [])];
        nextHistory[editingIndex] = {
          ...nextHistory[editingIndex],
          answer: ans
        };
        setEditingIndex(null);
      } else {
        nextHistory = [
          ...(state.questionHistory || []),
          {
            question: state.nextQuestion?.text || 'Frage',
            answer: ans,
            targetDimension: state.nextQuestion?.targetDimension
          }
        ];
      }

      const res = await requestCategoryDeepen({
        action: 'step',
        category,
        categoryTitle: t(meta.labelKey as any),
        rawText,
        stage1Text,
        dimensions,
        questionHistory: nextHistory,
        knownFacts: state.knownFacts,
        latestAnswer: '', // Passing empty latestAnswer ensures the backend respects our nextHistory exactly as constructed
        language,
        engine
      });
      setState(res);
      const currentText = res.summaryText || (res.knownFacts || []).map(f => f.text).join('; ') || stage1Text;
      if (currentText && onPartialChange) {
        onPartialChange(currentText, {
          questionHistory: res.questionHistory,
          knownFacts: res.knownFacts,
          dimensionStatus: res.dimensionStatus
        });
      }
    } catch (err) {
      console.error(`[GenericCategoryDeepDiveModal] Step error for ${category}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditHistory = (idx: number) => {
    if (!state || !state.questionHistory || !state.questionHistory[idx]) return;
    setEditingIndex(idx);
    setAnswerInput(state.questionHistory[idx].answer || '');
    // Focus the answer textarea
    setTimeout(() => {
      const textarea = document.getElementById(`deepdive-answer-textarea-${category}`);
      if (textarea) {
        (textarea as HTMLTextAreaElement).focus();
      }
    }, 50);
  };

  const handleFinalize = async () => {
    if (loading || !state) return;
    stopVoiceRecording();
    setLoading(true);

    try {
      const res = await requestCategoryDeepen({
        action: 'finalize',
        category,
        categoryTitle: t(meta.labelKey as any),
        rawText,
        stage1Text,
        dimensions,
        questionHistory: state.questionHistory,
        knownFacts: state.knownFacts,
        language,
        engine
      });
      setState(res);
      const currentText = res.summaryText || (res.knownFacts || []).map(f => f.text).join('; ') || stage1Text;
      if (currentText && onPartialChange) {
        onPartialChange(currentText, {
          questionHistory: res.questionHistory,
          knownFacts: res.knownFacts,
          dimensionStatus: res.dimensionStatus
        });
      }
    } catch (err) {
      console.error(`[GenericCategoryDeepDiveModal] Finalize error for ${category}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdoptResult = () => {
    if (!state) return;
    const finalTxt = state.summaryText || (state.knownFacts || []).map(f => f.text).join('; ') || stage1Text;
    onAdopt(finalTxt, {
      questionHistory: state.questionHistory,
      knownFacts: state.knownFacts,
      dimensionStatus: state.dimensionStatus
    });
  };

  const startVoiceRecording = () => {
    if (!isSpeechSupported || isRecording) return;
    recordingBaseTextRef.current = answerInput;
    lastSpokenTranscriptRef.current = '';
    isFinalizingRef.current = false;
    setRecordSecondsLeft(60);
    setIsRecording(true);

    const session = startSpeechRecognition({
      language: (language as any) || 'de',
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
        console.warn('[GenericCategoryDeepDiveModal] Speech error:', err);
        stopVoiceRecording();
      },
      onEnd: () => {
        if (!isFinalizingRef.current && isRecording) {
          stopVoiceRecording();
        }
      }
    });
    recognitionRef.current = session;

    if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      setRecordSecondsLeft(prev => {
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
    setAnswerInput(prev => deduplicateRepeatedPhrases(prev));
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const curQ = state?.nextQuestion;
  const isFin = Boolean(state?.isFinished);

  return (
    <div id={`generic-deepdive-${category}`} className="w-full flex flex-col flex-1 bg-slate-900 text-slate-100 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Category Header Card matching Causa / Localisatio */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {t(meta.labelKey as any)}
              </h3>
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
                {meta.dimensionsCode}
              </span>
            </div>
            <p className="text-xs text-teal-200/80 italic mt-0.5">
              {t('causaSubtitle' as any)} (§§ 83–104)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timing & Benchmark badge */}
          {state?.timing && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/60 text-xs font-mono">
              {state.timing.selectedEngine === 'both' && state.timing.geminiDurationMs !== undefined && state.timing.openaiDurationMs !== undefined ? (
                <div className="flex items-center gap-2">
                  <span className="text-teal-300 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Gemini: {(state.timing.geminiDurationMs / 1000).toFixed(2)}s
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-indigo-300 font-semibold flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    GPT-4: {(state.timing.openaiDurationMs / 1000).toFixed(2)}s
                  </span>
                  <span className="text-[10px] text-teal-400 font-bold ml-1 bg-teal-500/10 px-1.5 py-0.5 rounded">
                    🚀 {state.timing.fasterEngine}
                  </span>
                </div>
              ) : state.timing.selectedEngine === 'openai' ? (
                <span className="text-indigo-300 font-semibold flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5" />
                  GPT-4: {((state.timing.openaiDurationMs || state.timing.durationMs || 0) / 1000).toFixed(2)}s
                </span>
              ) : (
                <span className="text-teal-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gemini Flash: {((state.timing.geminiDurationMs || state.timing.durationMs || 0) / 1000).toFixed(2)}s
                </span>
              )}
            </div>
          )}

          {/* Engine indicator */}
          <span className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
            engine === 'both'
              ? 'bg-gradient-to-r from-teal-950/80 to-indigo-950/80 text-teal-200 border-teal-500/30'
              : engine === 'openai'
              ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30'
              : 'bg-teal-950/60 text-teal-300 border border-teal-500/30'
          }`}>
            {engine === 'both' ? (
              <>
                <Layers className="w-3.5 h-3.5" />
                <span>{t('organonStage2EngineBothBadge')}</span>
              </>
            ) : engine === 'openai' ? (
              <>
                <Brain className="w-3.5 h-3.5" />
                <span>{t('organonEngineGpt')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('organonEngineGemini')}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Loading state */}
      {loading && !state && (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-400" />
          <span className="text-xs">{t('causaLoadingNext')}</span>
        </div>
      )}

      {/* Active Question Card (either normal next question, or the history question being edited) */}
      {state && !isFin && (
        editingIndex !== null ? (
          <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 ring-1 ring-indigo-500/30">
            <div className="flex items-center justify-between border-b border-indigo-950 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0">
                  <History className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Bisherige Antwort korrigieren / ergänzen (Frage {editingIndex + 1})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingIndex(null);
                  setAnswerInput('');
                }}
                className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer"
              >
                Korrektur abbrechen
              </button>
            </div>

            <p className="text-sm font-bold text-slate-100 leading-snug">
              „{state.questionHistory[editingIndex]?.question || 'Frage'}“
            </p>
            
            <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-2.5 text-xs text-indigo-200">
              <p className="leading-relaxed text-[11px]">
                Passen Sie Ihre Antwort unten im Textfeld an. Klicken Sie anschließend auf <strong>„Änderung übernehmen & neu berechnen“</strong>.
              </p>
            </div>
          </div>
        ) : (
          curQ && (
            <div className="bg-gradient-to-br from-slate-850 to-slate-900 border border-teal-500/30 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {t('causaQuestionLabel')}
                  </span>
                </div>
                {curQ.targetDimension && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded border border-teal-500/40">
                    {t('causaTargetDimensionLabel')} {curQ.targetDimension}
                  </span>
                )}
              </div>

              <p className="text-sm font-bold text-slate-100 leading-snug">
                „{curQ.text}“
              </p>

              {curQ.orientationExample && (
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-2.5 text-xs text-amber-200">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block mb-0.5">
                    {t('causaOrientationExampleLabel')}
                  </span>
                  <p className="italic leading-relaxed text-[11px] text-amber-300">„{curQ.orientationExample}“</p>
                </div>
              )}

              {curQ.reason && (
                <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    {t('causaReasonDimensionLabel')}
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-300">{curQ.reason}</p>
                </div>
              )}
            </div>
          )
        )
      )}

      {/* Finished Summary Card matching Causa */}
      {state && isFin && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{t('causaFinishedTitle')}</span>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-500/30 text-xs text-slate-200 leading-relaxed">
            <p className="font-semibold text-emerald-400 mb-1">Synthetisiertes Ergebnis:</p>
            <p>{state.summaryText || stage1Text || 'Keine Angabe'}</p>
          </div>

          <button
            type="button"
            onClick={handleAdoptResult}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>{t('stage2AdoptAndContinueBtn')}</span>
          </button>
        </div>
      )}

      {/* Shared Answer Input matching Causa */}
      {state && !isFin && (
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900 border border-teal-500/30 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wide">
              <Send className="w-4 h-4 text-teal-400" />
              <span>{t('causaPatientAnswerLabel')}</span>
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
              id={`deepdive-answer-textarea-${category}`}
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleAnswerSubmit();
                }
              }}
              placeholder={editingIndex !== null ? "Geben Sie hier die berichtigte oder ergänzte Antwort ein..." : t('causaSharedAnswerPlaceholder')}
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
                
                {editingIndex !== null ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingIndex(null);
                      setAnswerInput('');
                    }}
                    disabled={loading}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-rose-400 bg-rose-950/20 hover:bg-rose-950/30 border border-rose-500/30 cursor-pointer"
                  >
                    Korrektur abbrechen
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAnswerSubmit(t('stage2NoFurtherDetailsBtn'))}
                    disabled={loading}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700"
                  >
                    {t('stage2NoFurtherDetailsBtn')}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editingIndex === null && (
                  <button
                    type="button"
                    onClick={handleFinalize}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('causaFinalizeBtn')}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleAnswerSubmit()}
                  disabled={!answerInput.trim() || loading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>
                    {editingIndex !== null 
                      ? "Änderung übernehmen & neu berechnen" 
                      : t('causaSubmitAnswerBtn')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Questions & Answers History Accordion */}
      {state?.questionHistory && state.questionHistory.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-300 bg-slate-900/80 hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-teal-400" />
              <span>Fragenverlauf & Antworten ({state.questionHistory.length})</span>
            </span>
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHistory && (
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto divide-y divide-slate-800/60">
              {state.questionHistory.map((item, idx) => (
                <div key={idx} className={`pt-3 first:pt-0 flex flex-col md:flex-row md:items-start justify-between gap-4 group`}>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[9px] font-mono font-bold">
                        Frage {idx + 1}
                      </span>
                      {item.targetDimension && (
                        <span className="px-1.5 py-0.5 bg-teal-500/10 text-teal-300 border border-teal-500/20 rounded text-[9px] font-mono font-bold">
                          {item.targetDimension}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-300">„{item.question}“</p>
                    <div className="text-xs text-slate-200 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 mt-1 leading-relaxed italic">
                      <span className="text-[10px] text-teal-400/80 font-bold block not-italic mb-1">Antwort:</span>
                      {item.answer}
                    </div>
                  </div>
                  <div className="flex items-center shrink-0 self-end md:self-start pt-1">
                    <button
                      type="button"
                      onClick={() => handleStartEditHistory(idx)}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-750 text-teal-400 hover:text-teal-300 border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Berichtigen / Ergänzen</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dimensions Accordion matching Causa */}
      {dimensions && dimensions.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDimensions(!showDimensions)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-300 bg-slate-900/80 hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-400" />
              <span>Fachliche Dimensionen ({meta.dimensionsCode})</span>
            </span>
            {showDimensions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDimensions && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dimensions.map((dim) => {
                const status = state?.dimensionStatus?.[dim.code] || 'OFFEN';
                const isCurrent = curQ?.targetDimension === dim.code;
                return (
                  <div
                    key={dim.code}
                    className={`p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-teal-500/20 border-teal-500/50 shadow-xs'
                        : status === 'BELEGT'
                        ? 'bg-emerald-950/30 border-emerald-500/30'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold">
                          {dim.code}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{dim.title}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        status === 'BELEGT' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{dim.desc}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Known Facts / Evidence Accordion */}
      {state?.knownFacts && state.knownFacts.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowFacts(!showFacts)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-300 bg-slate-900/80 hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Erfasste Fakten ({state.knownFacts.length})</span>
            </span>
            {showFacts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFacts && (
            <div className="p-4 space-y-2">
              {state.knownFacts.map((kf, i) => (
                <div key={i} className="text-xs bg-slate-900/90 p-2.5 rounded-xl border border-emerald-500/30 text-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-mono font-bold">
                      {kf.dimension}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">{kf.status}</span>
                  </div>
                  <p className="font-medium text-slate-100">{kf.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
