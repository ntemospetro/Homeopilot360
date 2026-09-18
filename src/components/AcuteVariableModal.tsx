import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Sparkles, 
  Check, 
  HelpCircle,
  Stethoscope
} from 'lucide-react';
import { useTranslation, useLanguage } from '../i18n/LanguageContext';
import { LanguageCode } from '../types';
import { enrichClinicalText, stripClinicalPrefix } from '../utils/clinicalVariableFormatter';
import { 
  isSpeechRecognitionSupported, 
  startSpeechRecognition, 
  SpeechRecognitionSession,
  mergeWithOverlap,
  deduplicateRepeatedPhrases
} from '../services/speechService';

export type AcuteVariableType = 'hauptbeschwerde' | 'causa' | 'modalitaeten' | 'begleitsymptome';

interface AcuteVariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  variableKey: AcuteVariableType;
  currentValue: string;
  onSave: (variableKey: AcuteVariableType, newValue: string) => void;
}

export const AcuteVariableModal: React.FC<AcuteVariableModalProps> = ({
  isOpen,
  onClose,
  variableKey,
  currentValue,
  onSave,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionSession | null>(null);
  const recordingBaseTextRef = useRef<string>('');
  const lastSpokenTranscriptRef = useRef<string>('');
  const isFinalizingRef = useRef<boolean>(false);

  useEffect(() => {
    setIsSpeechSupported(isSpeechRecognitionSupported());
  }, []);

  // When opening modal, initialize input value
  useEffect(() => {
    if (isOpen) {
      // If the current value is a placeholder like "Unbekannt (Bitte erfragen)", start with empty string
      const lower = (currentValue || '').toLowerCase();
      if (
        lower.includes('unbekannt') ||
        lower.includes('erfragen') ||
        lower.includes('unknown') ||
        lower.includes('desconocido') ||
        lower.includes('inconnu') ||
        lower.includes('sconosciuto') ||
        lower.includes('άγνωστο') ||
        lower.includes('неизвестно') ||
        currentValue.trim() === '—' ||
        currentValue.trim() === '-'
      ) {
        setInputValue('');
      } else {
        const { coreText } = stripClinicalPrefix(currentValue);
        setInputValue(coreText || currentValue);
      }
      setIsRecording(false);
    }
  }, [isOpen, currentValue]);

  // Cleanup speech on unmount or close
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      isFinalizingRef.current = true;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const startVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
      return;
    }

    if (!isSpeechSupported) return;

    recordingBaseTextRef.current = inputValue;
    lastSpokenTranscriptRef.current = '';
    isFinalizingRef.current = false;
    setIsRecording(true);

    const session = startSpeechRecognition({
      language: language as any,
      continuous: true,
      interimResults: true,
      onResult: (transcript) => {
        if (isFinalizingRef.current) return;
        const clean = deduplicateRepeatedPhrases(transcript);
        lastSpokenTranscriptRef.current = clean;
        const merged = mergeWithOverlap(recordingBaseTextRef.current, clean);
        setInputValue(merged);
      },
      onError: (err) => {
        console.warn('Speech error in variable modal:', err);
        setIsRecording(false);
      },
      onEnd: () => {
        if (!isFinalizingRef.current && isRecording) {
          setIsRecording(false);
        }
      }
    });

    recognitionRef.current = session;
  };

  const enrichedPreview = useMemo(() => {
    return enrichClinicalText(variableKey, inputValue, language as LanguageCode);
  }, [variableKey, inputValue, language]);

  const handleSave = () => {
    stopVoiceRecording();
    const trimmed = inputValue.trim();
    if (trimmed) {
      // Use the clinically enriched formulation if available, or the trimmed raw input
      const finalValue = enrichedPreview || trimmed;
      onSave(variableKey, finalValue);
    }
    onClose();
  };

  if (!isOpen) return null;

  // Title and homoeopathic guidance text based on the variable
  const getVariableInfo = () => {
    switch (variableKey) {
      case 'hauptbeschwerde':
        return {
          title: t('step1ChiefComplaint'),
          hint: t('variableModalHintComplaint'),
          placeholder: t('variableModalPlaceholderComplaint'),
        };
      case 'causa':
        return {
          title: t('step1Causa'),
          hint: t('variableModalHintCausa'),
          placeholder: t('variableModalPlaceholderCausa'),
        };
      case 'modalitaeten':
        return {
          title: t('step1Modalities'),
          hint: t('variableModalHintModalities'),
          placeholder: t('variableModalPlaceholderModalities'),
        };
      case 'begleitsymptome':
        return {
          title: t('step1Concomitants'),
          hint: t('variableModalHintConcomitants'),
          placeholder: t('variableModalPlaceholderConcomitants'),
        };
    }
  };

  const info = getVariableInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {info.title}
              </h3>
              <p className="text-xs text-slate-500">
                {t('variableModalSub')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopVoiceRecording();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Classical Homeopathic Guideline Hint */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
            <HelpCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              {info.hint}
            </span>
          </div>

          {/* Input Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                {t('variableInputLabel')}
              </label>
              {isRecording && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  {t('variableVoiceRecording')}
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={info.placeholder}
                autoFocus
                className="w-full p-3.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-none"
              />

              {/* Voice button inside or beside */}
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  title={isRecording ? t('variableVoiceStop') : t('variableVoiceStart')}
                  className={`absolute right-3 top-3 p-2 rounded-lg transition-all cursor-pointer ${
                    isRecording 
                      ? 'bg-rose-600 text-white animate-pulse shadow-xs' 
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Clinical Formatting Live Preview */}
          {inputValue.trim().length > 0 && enrichedPreview && (
            <div className="p-3 bg-teal-50/70 border border-teal-200/90 rounded-xl space-y-1 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  {t('clinicalFormattingPreviewLabel')}
                </span>
                <span className="text-[10px] text-teal-700 font-semibold bg-teal-100/70 px-1.5 py-0.5 rounded">
                  {t('clinicalFormattingAppliedNotice')}
                </span>
              </div>
              <p className="text-xs font-semibold text-teal-950 leading-relaxed">
                {enrichedPreview}
              </p>
            </div>
          )}

          {/* Quick Voice Prompt Instruction */}
          <p className="text-[11px] text-slate-500 leading-normal">
            {t('variableModalFooterHelp')}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              stopVoiceRecording();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200/70 border border-slate-200 transition-colors cursor-pointer"
          >
            {t('variableModalCancelBtn')}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!inputValue.trim()}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{t('variableModalSaveBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
