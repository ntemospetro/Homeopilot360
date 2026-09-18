import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageCode } from '../types';
import { RepertoriumSymptomInput } from '../services/boerickeRepertoryService';
import { analyzeChiefComplaint } from '../services/chiefComplaintAnalysisService';
import { startSpeechRecognition, SpeechRecognitionSession } from '../services/speechService';
import { 
  extractCuesFromInitialComplaint, 
  buildSynthesizedSymptomText,
  analyzeAnamnesisInformationNeeds
} from '../services/adaptiveAnamnesisEngine';
import { AdaptiveAnamnesisWizardModal } from './AdaptiveAnamnesisWizardModal';

interface AdaptiveSymptomArchitectProps {
  symptom: RepertoriumSymptomInput;
  onChange: (updated: RepertoriumSymptomInput) => void;
  onRemove?: () => void;
  index: number;
  isSingle: boolean;
  language: LanguageCode;
}

export const AdaptiveSymptomArchitect: React.FC<AdaptiveSymptomArchitectProps> = ({
  symptom,
  onChange,
  onRemove,
  index,
  isSingle,
  language
}) => {
  const { t } = useTranslation();

  // Starting open complaint input (Was führt Sie heute zu mir?)
  const [initialInput, setInitialInput] = useState('');
  const [selectedPrimaryComplaint, setSelectedPrimaryComplaint] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const speechSessionRef = useRef<SpeechRecognitionSession | null>(null);

  useEffect(() => {
    return () => {
      speechSessionRef.current?.stop();
    };
  }, []);

  const toggleSpeechRecognition = () => {
    if (isRecording) {
      speechSessionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      setIsRecording(true);
      speechSessionRef.current = startSpeechRecognition({
        language,
        continuous: true,
        interimResults: true,
        onResult: (transcript) => {
          if (transcript?.trim()) {
            setInitialInput(transcript);
          }
        },
        onError: (err) => {
          console.warn('Speech recognition error:', err);
          setIsRecording(false);
        },
        onEnd: () => {
          setIsRecording(false);
        }
      });
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  };

  const multiAnalysis = useMemo(() => {
    return analyzeChiefComplaint(initialInput, language);
  }, [initialInput, language]);

  const chiefAnalysis = useMemo(() => {
    const activeText = selectedPrimaryComplaint || initialInput;
    const res = analyzeChiefComplaint(activeText, language);
    return {
      ...res,
      detectedComplaints: multiAnalysis.detectedComplaints,
      hasMultipleComplaints: multiAnalysis.hasMultipleComplaints
    };
  }, [initialInput, selectedPrimaryComplaint, language, multiAnalysis]);

  // Direct manual pillar edit toggle
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  // Guided Step-by-Step Wizard Modal state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);

  const handleOpenWizard = (step = 0) => {
    setWizardStep(step);
    setIsWizardOpen(true);
  };

  // Determine if initial complaint has been captured
  const isStarted = Boolean(symptom.chiefComplaint?.trim() || symptom.chiefQuote?.trim());

  // Start Anamnesis with open chief complaint: save complaint & immediately open popup at Step 1 (WO)
  const handleStartAnamnesis = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = initialInput.trim();
    if (!text) return;

    // Strict validation: Do not accept input if not recognized as a complaint
    if (!chiefAnalysis.isRecognized) {
      return;
    }

    const chosenPrimary = selectedPrimaryComplaint || text;
    const cues = extractCuesFromInitialComplaint(chosenPrimary);

    let initialConcomitants = cues.concomitants || symptom.concomitants || '';
    if (selectedPrimaryComplaint && chiefAnalysis.hasMultipleComplaints) {
      const others = chiefAnalysis.detectedComplaints
        .filter(c => c.toLowerCase() !== selectedPrimaryComplaint.toLowerCase())
        .join(', ');
      if (others) {
        initialConcomitants = initialConcomitants ? `${initialConcomitants}, ${others}` : others;
      }
    }

    const updated: RepertoriumSymptomInput = {
      ...symptom,
      chiefComplaint: chosenPrimary,
      chiefQuote: text,
      location: cues.location || symptom.location || '',
      sensation: cues.sensation || symptom.sensation || '',
      modalities: cues.modalities || symptom.modalities || '',
      concomitants: initialConcomitants,
      causaEvent: cues.causaEvent || symptom.causaEvent || '',
      causaTemporal: cues.causaTemporal || symptom.causaTemporal || '',
      causaEffect: cues.causaEvent ? 'worse' : symptom.causaEffect || '',
      anamnesisDialogueSteps: [
        {
          id: `step-0-${Date.now()}`,
          timestamp: Date.now(),
          question: t('anamnesisOpeningQuestion'),
          answer: text,
          pillar: 'chiefComplaint',
          depthLevel: 1
        }
      ]
    };

    updated.text = buildSynthesizedSymptomText(updated);
    onChange(updated);
    setInitialInput('');
    setSelectedPrimaryComplaint(null);

    // Immediately open wizard popup for the pillars
    handleOpenWizard(1);
  };

  // Reset entire anamnesis
  const handleResetAnamnesis = () => {
    if (window.confirm(t('anamnesisResetConfirm'))) {
      const resetSymptom: RepertoriumSymptomInput = {
        id: symptom.id,
        text: '',
        weight: symptom.weight || null,
        chiefComplaint: '',
        location: '',
        sensation: '',
        modalities: '',
        concomitants: '',
        chiefQuote: '',
        locationQuote: '',
        sensationQuote: '',
        modalitiesQuote: '',
        concomitantsQuote: '',
        causaEvent: '',
        causaTemporal: '',
        causaEffect: '',
        causaQuote: '',
        causaInterpretation: '',
        anamnesisDialogueSteps: []
      };
      onChange(resetSymptom);
      setInitialInput('');
    }
  };

  // Direct manual field update
  const handleDirectFieldUpdate = (field: keyof RepertoriumSymptomInput, value: any) => {
    const updated = { ...symptom, [field]: value };
    updated.text = buildSynthesizedSymptomText(updated);
    onChange(updated);
  };

  if (!isStarted) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
        {/* Header Bar */}
        <div className="bg-teal-900 text-white px-4 py-3.5 flex items-start justify-between gap-3 border-b border-teal-950">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xs shadow-inner shrink-0 mt-0.5">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10.5px] font-bold tracking-wider uppercase text-teal-200/90 block leading-tight">
                {t('repertoriumStepNumber')} {index + 1}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-white whitespace-normal break-words leading-relaxed">
                {symptom.chiefComplaint || symptom.text || t('repertoriumSymptomPlaceholder')}
              </h4>
            </div>
          </div>

          {!isSingle && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 rounded-lg text-teal-200 hover:text-rose-300 hover:bg-white/10 transition-colors cursor-pointer"
              title={t('repertoriumRemoveSymptom')}
            >
              <span className="text-xs font-bold font-mono">X</span>
            </button>
          )}
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <span>{t('repertoriumPillarChiefComplaint')}</span>
          </div>
          <form onSubmit={handleStartAnamnesis} className="space-y-3">
            <div className="flex flex-row gap-2.5 items-stretch">
              <div className="relative flex-1">
                <textarea
                  id={`initial-complaint-input-${symptom.id}`}
                  rows={3}
                  value={initialInput}
                  onChange={(e) => setInitialInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleStartAnamnesis();
                    }
                  }}
                  placeholder={t('repertoriumSymptomPlaceholder')}
                  className="w-full h-full min-h-[85px] p-3 text-xs bg-slate-50/70 rounded-xl border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-500 text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium resize-none shadow-2xs"
                />
              </div>
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`w-24 sm:w-28 shrink-0 rounded-xl text-white flex flex-col items-center justify-center gap-1.5 p-2.5 transition-all shadow-xs cursor-pointer min-h-[85px] border ${
                  isRecording 
                    ? 'bg-rose-600 hover:bg-rose-700 animate-pulse border-rose-700' 
                    : 'bg-teal-700 hover:bg-teal-800 border-teal-800'
                }`}
                title={isRecording ? t('chiefComplaintListening') : t('chiefComplaintVoiceBtn')}
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shadow-inner text-[10px] font-black uppercase">
                  {isRecording ? 'Stop' : 'Rec'}
                </div>
                <span className="text-[11px] font-semibold text-white tracking-wide text-center leading-tight">
                  {isRecording ? t('voiceStopBtn') : t('voiceRecordCardLabel')}
                </span>
              </button>
            </div>

            {/* Live voice listening state */}
            {isRecording && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold animate-pulse px-1">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <span>{t('chiefComplaintListening')}</span>
              </div>
            )}

            {/* Multiple Complaints Disambiguation / Clarification Card */}
            {initialInput.trim() && chiefAnalysis.hasMultipleComplaints && chiefAnalysis.detectedComplaints.length > 1 && (
              <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2 text-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 text-teal-950 font-bold">
                  <span>{t('chiefComplaintMultipleDetectedTitle')}</span>
                </div>
                <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                  {t('chiefComplaintMultipleDetectedPrompt')}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {chiefAnalysis.detectedComplaints.map((complaint, idx) => {
                    const isSelected = selectedPrimaryComplaint === complaint;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPrimaryComplaint(complaint)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-semibold border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-800 ring-1 ring-teal-600'
                            : 'bg-white text-slate-800 border-teal-200 hover:bg-teal-50 hover:border-teal-300'
                        }`}
                      >
                        {isSelected && <span className="text-xs mr-0.5 font-bold">✓</span>}
                        <span>{complaint}</span>
                        {isSelected && (
                          <span className="text-[9px] bg-teal-800 px-1 py-0.5 rounded text-teal-100">
                            {t('chiefComplaintSelectPrimaryBadge')}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setSelectedPrimaryComplaint(null)}
                    className={`px-2 py-1 text-xs rounded-lg font-medium border transition-colors cursor-pointer ${
                      selectedPrimaryComplaint === null
                        ? 'bg-slate-700 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{t('chiefComplaintKeepCombinedOption')}</span>
                  </button>
                </div>
                {selectedPrimaryComplaint && (
                  <p className="text-[10px] text-teal-900 font-medium pt-0.5 flex items-center gap-1">
                    <span>{t('chiefComplaintOtherAsConcomitants')}</span>
                  </p>
                )}
              </div>
            )}

            {/* Real-time domain verification */}
            {initialInput.trim() && (
              <div className="space-y-2 pt-1">
                {chiefAnalysis.isRecognized && chiefAnalysis.organDomain ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-950 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span>{t('chiefComplaintVerified')}: <strong className="text-emerald-800">{chiefAnalysis.organDomain}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 text-xs text-amber-950">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                      <span>{t('chiefComplaintUnrecognized')}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-amber-800/90">
                      {t('chiefComplaintUnrecognizedPrompt')}
                    </p>
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={!chiefAnalysis.isRecognized}
                    className="w-full relative overflow-hidden py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-all border border-teal-800 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 disabled:border-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed text-white cursor-pointer group"
                  >
                    <span>{t('anamnesisStartBtn')}</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Adaptive Deepening Anamnesis Modal */}
        <AdaptiveAnamnesisWizardModal
          isOpen={isWizardOpen}
          initialStep={wizardStep}
          symptom={symptom}
          language={language}
          onSave={(updated) => onChange(updated)}
          onClose={() => setIsWizardOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
      {/* Header Bar: Restrained, elegant header matching the clean design */}
      <div className="bg-teal-900 text-white px-4 py-3.5 flex items-start justify-between gap-3 border-b border-teal-950">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xs shadow-inner shrink-0 mt-0.5">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10.5px] font-bold tracking-wider uppercase text-teal-200/90 block leading-tight">
              {t('repertoriumStepNumber')} {index + 1}
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-white whitespace-normal break-words leading-relaxed">
              {symptom.chiefComplaint || symptom.text || t('repertoriumSymptomPlaceholder')}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenWizard(1)}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20 shadow-2xs"
            title={t('anamnesisEditInWizard')}
          >
            <span>{t('anamnesisEditInWizard')}</span>
          </button>



          {!isSingle && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 rounded-lg text-teal-200 hover:text-rose-300 hover:bg-white/10 transition-colors cursor-pointer"
              title={t('repertoriumRemoveSymptom')}
            >
              <span className="text-xs font-bold font-mono">X</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3.5">
        {/* 2. WO (Lokalisation) */}
        <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3">
          <div className="space-y-0.5 flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-800 block">
              {t('anamnesisStepPillarWO')}
            </span>
            <p className="text-xs text-slate-600 truncate">
              {symptom.location?.trim() ? symptom.location : <span className="italic text-slate-400">{t('anamnesisPillarEmptyNotice')}</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenWizard(1)}
            className="text-xs font-medium text-teal-800 hover:text-teal-950 px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <span>{t('edit' as any) || 'Bearbeiten'}</span>
          </button>
        </div>

        {/* 3. WAS (Empfindung & Qualität) */}
        <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3">
          <div className="space-y-0.5 flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-800 block">
              {t('anamnesisStepPillarWAS')}
            </span>
            <p className="text-xs text-slate-600 truncate">
              {symptom.sensation?.trim() ? symptom.sensation : <span className="italic text-slate-400">{t('anamnesisPillarEmptyNotice')}</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenWizard(2)}
            className="text-xs font-medium text-teal-800 hover:text-teal-950 px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <span>{t('edit' as any) || 'Bearbeiten'}</span>
          </button>
        </div>

        {/* 4. Wodurch (Causa & Auslöser) */}
        <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3">
          <div className="space-y-0.5 flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-800 block">
              {t('anamnesisStepPillarCausa')}
            </span>
            <p className="text-xs text-slate-600 truncate">
              {symptom.causaEvent?.trim() ? symptom.causaEvent : <span className="italic text-slate-400">{t('anamnesisPillarEmptyNotice')}</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenWizard(3)}
            className="text-xs font-medium text-teal-800 hover:text-teal-950 px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <span>{t('edit' as any) || 'Bearbeiten'}</span>
          </button>
        </div>

        {/* 5. Wann: Besserung (> Linderung) */}
        <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3">
          <div className="space-y-0.5 flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-800 block">
              {t('anamnesisStepBetter') || 'Wann: Besserung (> Linderung)'}
            </span>
            <p className="text-xs text-slate-600 truncate">
              {symptom.modalitiesBetter?.trim() ? symptom.modalitiesBetter : <span className="italic text-slate-400">{t('anamnesisPillarEmptyNotice')}</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenWizard(4)}
            className="text-xs font-medium text-teal-800 hover:text-teal-950 px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <span>{t('edit' as any) || 'Bearbeiten'}</span>
          </button>
        </div>

        {/* 6. Wann: Verschlimmerung (< Verschlechterung) */}
        <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3">
          <div className="space-y-0.5 flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-800 block">
              {t('anamnesisStepWorse') || 'Wann: Verschlimmerung (< Verschlechterung)'}
            </span>
            <p className="text-xs text-slate-600 truncate">
              {symptom.modalitiesWorse?.trim() ? symptom.modalitiesWorse : <span className="italic text-slate-400">{t('anamnesisPillarEmptyNotice')}</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenWizard(4)}
            className="text-xs font-medium text-teal-800 hover:text-teal-950 px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <span>{t('edit' as any) || 'Bearbeiten'}</span>
          </button>
        </div>

        {/* 7. Was noch (Begleitsymptome & Gemüt) */}
        <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3">
          <div className="space-y-0.5 flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-800 block">
              {t('anamnesisStepPillarWASNOCH')}
            </span>
            <p className="text-xs text-slate-600 truncate">
              {symptom.concomitants?.trim() ? symptom.concomitants : <span className="italic text-slate-400">{t('anamnesisPillarEmptyNotice')}</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenWizard(6)}
            className="text-xs font-medium text-teal-800 hover:text-teal-950 px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <span>{t('edit' as any) || 'Bearbeiten'}</span>
          </button>
        </div>

      </div>

      {/* GUIDED ANAMNESIS STEP-BY-STEP MODAL */}
      <AdaptiveAnamnesisWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        symptom={symptom}
        onSave={(updated) => onChange(updated)}
        language={language}
        initialStep={wizardStep}
      />
    </div>
  );
};
