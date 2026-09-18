import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Mic, MicOff, Loader2, AlertCircle, X, ShieldAlert, AlertTriangle, Clock, ArrowUpRight, Sparkles } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { TranslationKey } from '../i18n/translations';
import { 
  startSpeechRecognition, 
  isSpeechRecognitionSupported, 
  SpeechRecognitionSession,
  LANGUAGE_SPEECH_MAP
} from '../services/speechService';
import { checkMedicalRelevance } from '../services/medicalRelevanceService';
import { getVoiceRecordingLimitsForTherapist, VoiceRecordingLimits } from '../services/storage';

export type VoiceFieldContext = 'main_complaint' | 'question_answer' | 'general';

interface VoiceInputButtonProps {
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'card';
  mode?: 'append' | 'replace';
  title?: string;
  id?: string;
  disabled?: boolean;
  context?: VoiceFieldContext;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  value,
  onChange,
  className = '',
  size = 'sm',
  mode = 'append',
  title,
  id,
  disabled = false,
  context = 'general',
}) => {
  const { language, t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showRejectionNotice, setShowRejectionNotice] = useState(false);
  const [showAcceptedFeedback, setShowAcceptedFeedback] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showTimeLimitModal, setShowTimeLimitModal] = useState(false);
  const [showNotAllowedModal, setShowNotAllowedModal] = useState(false);

  const [voiceLimits, setVoiceLimits] = useState<VoiceRecordingLimits>(() => getVoiceRecordingLimitsForTherapist());
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [activeLimitSeconds, setActiveLimitSeconds] = useState(60);

  const sessionRef = useRef<SpeechRecognitionSession | null>(null);
  const valueRef = useRef(value);
  const sessionInitialTextRef = useRef<string>('');
  const recordedTranscriptRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);
  const rejectionTimerRef = useRef<number | null>(null);
  const acceptedTimerRef = useRef<number | null>(null);
  const maxDurationTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const secondsElapsedRef = useRef<number>(0);

  // Keep valueRef updated for closures
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Keep tariff limits updated when packages or active therapist change
  useEffect(() => {
    const handleUpdate = () => {
      setVoiceLimits(getVoiceRecordingLimitsForTherapist());
    };
    window.addEventListener('homoeo_packages_updated', handleUpdate);
    window.addEventListener('homoeo_active_therapist_changed', handleUpdate);
    return () => {
      window.removeEventListener('homoeo_packages_updated', handleUpdate);
      window.removeEventListener('homoeo_active_therapist_changed', handleUpdate);
    };
  }, []);

  const clearTimersAndCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
    secondsElapsedRef.current = 0;
    setSecondsElapsed(0);
  }, []);

  // Clean up recording session and timers on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.abort();
        sessionRef.current = null;
      }
      clearTimersAndCountdown();
      if (rejectionTimerRef.current) {
        clearTimeout(rejectionTimerRef.current);
      }
      if (acceptedTimerRef.current) {
        clearTimeout(acceptedTimerRef.current);
      }
    };
  }, [clearTimersAndCountdown]);

  const handleOpenUpgrade = () => {
    setShowTimeLimitModal(false);
    setShowNotAllowedModal(false);
    window.dispatchEvent(new CustomEvent('homoeo_action_set_modal', { detail: 'upgrade' }));
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  /**
   * Process the completed voice transcript after speech has ended.
   * Commits immediately to onChange without blocking latency or false rejections.
   */
  const processCompletedVoiceInput = useCallback((transcriptText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const trimmed = (transcriptText || '').trim();
    if (!trimmed) {
      isProcessingRef.current = false;
      return;
    }

    try {
      const base = mode === 'replace' ? '' : (sessionInitialTextRef.current || '').trim();
      if (mode === 'replace' || !base) {
        onChange(trimmed);
      } else if (base.toLowerCase().endsWith(trimmed.toLowerCase())) {
        onChange(base);
      } else {
        onChange(`${base} ${trimmed}`);
      }

      // Fast positive confirmation feedback
      setShowAcceptedFeedback(true);
      if (acceptedTimerRef.current) clearTimeout(acceptedTimerRef.current);
      acceptedTimerRef.current = window.setTimeout(() => {
        setShowAcceptedFeedback(false);
      }, 1500);
    } catch (err) {
      console.error('Error committing voice input:', err);
    } finally {
      setIsEvaluating(false);
      isProcessingRef.current = false;
      recordedTranscriptRef.current = '';
    }
  }, [mode, onChange]);

  const handleLimitReached = useCallback((limitSec: number) => {
    if (sessionRef.current) {
      sessionRef.current.stop();
      sessionRef.current = null;
    }
    clearTimersAndCountdown();
    setIsListening(false);
    setIsStarting(false);

    // Process spoken text immediately
    const textToProcess = recordedTranscriptRef.current;
    recordedTranscriptRef.current = '';
    if (textToProcess && textToProcess.trim() && !isProcessingRef.current) {
      processCompletedVoiceInput(textToProcess);
    }

    setActiveLimitSeconds(limitSec);
    setShowTimeLimitModal(true);
  }, [clearTimersAndCountdown, processCompletedVoiceInput]);

  const stopListening = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.stop();
      sessionRef.current = null;
    }
    clearTimersAndCountdown();
    setIsListening(false);
    setIsStarting(false);

    // Process spoken text once stopped
    const textToProcess = recordedTranscriptRef.current;
    recordedTranscriptRef.current = '';
    if (textToProcess && textToProcess.trim() && !isProcessingRef.current) {
      processCompletedVoiceInput(textToProcess);
    }
  }, [clearTimersAndCountdown, processCompletedVoiceInput]);

  const startListening = useCallback(() => {
    if (disabled || isEvaluating) return;

    if (!isSpeechRecognitionSupported()) {
      alert(
        t('voiceDictationUnsupported' as TranslationKey) ||
        'Spracherkennung wird in diesem Browser nicht unterstützt. Bitte Google Chrome, Microsoft Edge oder Safari verwenden.'
      );
      return;
    }

    const currentLimits = getVoiceRecordingLimitsForTherapist();
    setVoiceLimits(currentLimits);

    // Check if voice is forbidden for questions in this tariff
    if (context === 'question_answer' && !currentLimits.allowQuestionAnswer) {
      setShowNotAllowedModal(true);
      return;
    }

    // Determine limit based on context
    let limitSec = 60;
    if (context === 'main_complaint') {
      limitSec = currentLimits.maxMainComplaintSeconds || 180;
    } else if (context === 'question_answer') {
      limitSec = currentLimits.maxQuestionAnswerSeconds || 60;
    } else {
      limitSec = currentLimits.maxMainComplaintSeconds || 120;
    }

    setActiveLimitSeconds(limitSec);
    setIsStarting(true);
    setShowRejectionNotice(false);
    setShowPermissionModal(false);
    setShowTimeLimitModal(false);
    setShowNotAllowedModal(false);
    sessionInitialTextRef.current = valueRef.current || '';
    recordedTranscriptRef.current = '';
    isProcessingRef.current = false;
    secondsElapsedRef.current = 0;
    setSecondsElapsed(0);

    clearTimersAndCountdown();

    const session = startSpeechRecognition({
      language,
      continuous: true,
      interimResults: true,
      onStart: () => {
        setIsStarting(false);
        setIsListening(true);
        secondsElapsedRef.current = 0;
        setSecondsElapsed(0);

        countdownIntervalRef.current = window.setInterval(() => {
          secondsElapsedRef.current += 1;
          setSecondsElapsed(secondsElapsedRef.current);
          if (secondsElapsedRef.current >= limitSec) {
            handleLimitReached(limitSec);
          }
        }, 1000);

        maxDurationTimerRef.current = window.setTimeout(() => {
          handleLimitReached(limitSec);
        }, limitSec * 1000);
      },
      onResult: (transcript) => {
        if (transcript && transcript.trim()) {
          recordedTranscriptRef.current = transcript.trim();
          // Update live so user sees their words immediately
          const base = mode === 'replace' ? '' : (sessionInitialTextRef.current || '').trim();
          const liveText = base ? `${base} ${transcript.trim()}` : transcript.trim();
          onChange(liveText);
        }
      },
      onError: (err) => {
        setIsStarting(false);
        setIsListening(false);
        sessionRef.current = null;
        clearTimersAndCountdown();

        if (err === 'not-allowed' || err === 'permission-denied') {
          // Open custom modal with Cancel and Retry options instead of un-cancelable browser alert
          setShowPermissionModal(true);
        }
      },
      onEnd: () => {
        setIsStarting(false);
        setIsListening(false);
        sessionRef.current = null;
        clearTimersAndCountdown();

        // Process collected speech text if not already processing
        const textToProcess = recordedTranscriptRef.current;
        recordedTranscriptRef.current = '';
        if (textToProcess && textToProcess.trim() && !isProcessingRef.current) {
          processCompletedVoiceInput(textToProcess);
        }
      },
    });

    sessionRef.current = session;
  }, [clearTimersAndCountdown, context, disabled, handleLimitReached, isEvaluating, language, mode, onChange, processCompletedVoiceInput, t]);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || isEvaluating) return;

    if (isListening) {
      stopListening();
      return;
    }

    startListening();
  };

  const currentLangLabel = LANGUAGE_SPEECH_MAP[language] || 'de-DE';
  const tooltipText = isEvaluating
    ? t('medicalRelevanceFilterChecking' as TranslationKey)
    : isListening
    ? `${t('voiceDictationListening' as TranslationKey)} (${currentLangLabel}) - ${t('voiceDictationStop' as TranslationKey)}`
    : title || `${t('voiceDictationStart' as TranslationKey)} (${currentLangLabel})`;

  const isCard = size === 'card';

  const sizeClasses = {
    xs: 'w-6 h-6 p-1 text-xs',
    sm: 'w-7 h-7 p-1.5 text-xs',
    md: 'w-8 h-8 p-2 text-sm',
    card: 'w-full sm:w-32 md:w-36 shrink-0 min-h-[140px] p-4 text-xs rounded-xl flex-col gap-2.5 shadow-xs border',
  }[size];

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    card: 'w-5 h-5',
  }[size];

  return (
    <>
      <div className={isCard ? "relative flex items-stretch w-full sm:w-auto h-full" : "relative inline-flex items-center"}>
        <button
          type="button"
          id={id}
          onClick={toggleListening}
          disabled={disabled || isEvaluating}
          title={tooltipText}
          aria-label={tooltipText}
          className={`relative rounded-xl flex items-center justify-center transition-all cursor-pointer select-none ${sizeClasses} ${
            isCard
              ? isEvaluating
                ? 'bg-amber-500 text-white ring-4 ring-amber-200 animate-pulse shadow-md border-amber-500'
                : isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 animate-pulse shadow-md border-rose-700'
                : showAcceptedFeedback
                ? 'bg-teal-700 text-white ring-4 ring-teal-200 shadow-md border-teal-700'
                : isStarting
                ? 'bg-teal-700 text-white border-teal-700 animate-pulse shadow-xs'
                : 'bg-[#00897b] hover:bg-[#00796b] text-white border-teal-800/20 shadow-xs'
              : isEvaluating
              ? 'bg-amber-500 text-white ring-2 ring-amber-300 ring-offset-1 animate-pulse shadow-md'
              : isListening
              ? 'bg-rose-500 hover:bg-rose-600 text-white ring-2 ring-rose-300 ring-offset-1 animate-pulse shadow-md'
              : showAcceptedFeedback
              ? 'bg-teal-600 text-white ring-2 ring-teal-300 ring-offset-1 shadow-sm'
              : isStarting
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 hover:bg-teal-50 text-slate-500 hover:text-teal-700 hover:border-teal-300 border border-slate-200'
          } ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
        >
          {isCard ? (
            <div className="flex flex-col items-center justify-center gap-2.5 h-full w-full">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isListening 
                  ? 'bg-white/30 scale-110 shadow-md ring-2 ring-white/50' 
                  : isEvaluating
                  ? 'bg-white/30'
                  : 'bg-white/15'
              }`}>
                {isStarting || isEvaluating ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : isListening ? (
                  <MicOff className="w-5 h-5 text-white animate-bounce" />
                ) : (
                  <Mic className="w-5 h-5 text-white" />
                )}
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <span className="font-bold text-xs text-white tracking-wide leading-tight">
                  {isListening 
                    ? (t('voiceRecordCardStopLabel' as TranslationKey) || 'Stopp')
                    : isEvaluating
                    ? (t('medicalRelevanceFilterChecking' as TranslationKey) || 'Prüfe...')
                    : (t('voiceRecordCardLabel' as TranslationKey) || 'Aufnahme')}
                </span>
                {isListening ? (
                  <span className="text-[10px] font-mono font-bold text-rose-100 bg-rose-700/60 px-2 py-0.5 rounded-full border border-rose-400/40 animate-pulse mt-0.5">
                    {formatSeconds(secondsElapsed)} / {formatSeconds(activeLimitSeconds)}
                  </span>
                ) : (
                  <span className="text-[9px] text-white/80 font-mono mt-0.5">
                    max. {activeLimitSeconds}s
                  </span>
                )}
              </div>
            </div>
          ) : (
            <>
              {isStarting || isEvaluating ? (
                <Loader2 className={`${iconSizes} animate-spin ${isEvaluating ? 'text-white' : 'text-amber-700'}`} />
              ) : isListening ? (
                <MicOff className={`${iconSizes} text-white animate-bounce`} />
              ) : (
                <Mic className={`${iconSizes}`} />
              )}

              {isListening && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-600 rounded-full ring-2 ring-white animate-ping" />
              )}
            </>
          )}
        </button>

        {isListening && !isCard && (
          <span className="absolute -top-6 -right-2 bg-slate-900/90 text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow-md border border-slate-700 pointer-events-none whitespace-nowrap z-50 animate-pulse">
            {formatSeconds(Math.max(0, activeLimitSeconds - secondsElapsed))}
          </span>
        )}

        {isListening && (
          <span className="sr-only">
            Sprachaufnahme aktiv in {currentLangLabel}
          </span>
        )}
      </div>

      {/* Floating Medical Relevance Rejection Notification */}
      {showRejectionNotice && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed bottom-6 right-6 z-[99999] max-w-md w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border-2 border-rose-400 p-4 sm:p-5 animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-sm font-bold text-rose-900 leading-tight">
                  {t('medicalRelevanceFilterTitle' as TranslationKey)}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowRejectionNotice(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Schließen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {t('medicalRelevanceFilterRejected' as TranslationKey)}
              </p>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowRejectionNotice(false)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold rounded-lg transition-colors border border-rose-200 cursor-pointer"
                >
                  {t('btnOk')}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Time Limit Reached Upgrade Prompt Modal */}
      {showTimeLimitModal && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="voice-limit-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5 border border-amber-200">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 id="voice-limit-title" className="text-base font-bold text-slate-900 leading-tight">
                    {t('voiceLimitReachedTitle')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowTimeLimitModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Schließen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-500">{t('voiceLimitCurrentTariff', { tariff: '' }).replace(': ', '')}:</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{voiceLimits.tariffName}</span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-500">{t('adminVoiceLimitsTitle')}:</span>
                    <span className="font-mono font-bold text-amber-700">{activeLimitSeconds}s</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium mt-3">
                  {t('voiceLimitMaxReachedMsg', { seconds: activeLimitSeconds })}
                </p>

                <div className="mt-3 p-2.5 bg-amber-50/80 rounded-lg border border-amber-200/70 text-xs font-semibold text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{t('voiceLimitUpgradeHint')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTimeLimitModal(false)}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                {t('voiceLimitOkBtn')}
              </button>
              <button
                type="button"
                onClick={handleOpenUpgrade}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('voiceLimitChooseHigherPlanBtn')}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Voice Not Allowed in Current Tariff Modal */}
      {showNotAllowedModal && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="voice-not-allowed-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5 border border-rose-200">
                <MicOff className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 id="voice-not-allowed-title" className="text-base font-bold text-slate-900 leading-tight">
                    {t('voiceNotAllowedTitle')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowNotAllowedModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Schließen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-500">{t('voiceLimitCurrentTariff', { tariff: '' }).replace(': ', '')}:</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{voiceLimits.tariffName}</span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-500">{t('adminVoiceQuestionAnswerLimitLabel')}:</span>
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">{t('adminVoiceNotPermitted')}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium mt-3">
                  {t('voiceNotAllowedDesc', { tariff: voiceLimits.tariffName })}
                </p>

                <div className="mt-3 p-2.5 bg-amber-50/80 rounded-lg border border-amber-200/70 text-xs font-semibold text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{t('voiceNotAllowedUpgradeHint')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNotAllowedModal(false)}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleOpenUpgrade}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('voiceLimitChooseHigherPlanBtn')}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Microphone Permission Denied Modal with Cancel (Abbruch) & Retry */}
      {showPermissionModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mic-permission-modal-title"
        >
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0 border border-amber-200/70">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 id="mic-permission-modal-title" className="text-base font-bold text-slate-900 leading-tight">
                    {t('micPermissionDeniedTitle' as TranslationKey)}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPermissionModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label={t('micPermissionCancelBtn' as TranslationKey)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                  {t('micPermissionDeniedDesc' as TranslationKey)}
                </p>
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 leading-relaxed">
                  💡 <span className="font-semibold text-slate-700">{t('micPermissionDeniedHint' as TranslationKey)}</span>
                </div>
              </div>
            </div>

            {/* Action buttons: Clear Cancel ("Abbruch") & Retry */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                id="mic-permission-cancel-btn"
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
              >
                {t('micPermissionCancelBtn' as TranslationKey)}
              </button>
              <button
                type="button"
                id="mic-permission-retry-btn"
                onClick={() => {
                  setShowPermissionModal(false);
                  startListening();
                }}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {t('micPermissionRetryBtn' as TranslationKey)}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
