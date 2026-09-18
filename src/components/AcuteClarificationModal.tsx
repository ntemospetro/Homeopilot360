import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Check, 
  X, 
  RotateCcw, 
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Ban,
  CheckCircle2,
  ListFilter,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { 
  AcuteClarificationQuestion, 
  AcuteAnswers, 
  getAcuteClarificationQuestions,
  getDerivedClarifyingQuestion 
} from '../services/acuteClarificationService';
import { 
  performDifferentialDiagnosis, 
  DifferentialDiagnosisResult 
} from '../services/quickSymptomMatcher';

interface AcuteClarificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  symptomText: string;
  initialAnswers: AcuteAnswers;
  onApplyAnswers: (answers: AcuteAnswers) => void;
}

export const AcuteClarificationModal: React.FC<AcuteClarificationModalProps> = ({
  isOpen,
  onClose,
  symptomText,
  initialAnswers,
  onApplyAnswers
}) => {
  const { language, t } = useTranslation();
  const [answers, setAnswers] = useState<AcuteAnswers>(initialAnswers);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showExcluded, setShowExcluded] = useState<boolean>(false);
  const [isCompletedConfirmed, setIsCompletedConfirmed] = useState<boolean>(false);

  // Sync initialAnswers when opening
  useEffect(() => {
    if (isOpen) {
      setAnswers(initialAnswers);
      setCurrentStep(0);
      setShowExcluded(false);
      setIsCompletedConfirmed(false);
    }
  }, [isOpen, initialAnswers]);

  const questions: AcuteClarificationQuestion[] = useMemo(() => {
    return getAcuteClarificationQuestions(symptomText, language);
  }, [symptomText, language]);

  // Live differential diagnosis outcome at current answers state
  const diffResult: DifferentialDiagnosisResult = useMemo(() => {
    return performDifferentialDiagnosis(symptomText, language, answers);
  }, [symptomText, language, answers]);

  // Crucial single derived clarifying question if 2 leading remedies are competing
  const derivedQuestion: AcuteClarificationQuestion | null = useMemo(() => {
    if (diffResult && diffResult.topRemedies.length >= 2) {
      return getDerivedClarifyingQuestion(symptomText, answers, diffResult.topRemedies, language);
    }
    return null;
  }, [diffResult, symptomText, answers, language]);

  const allQuestions = useMemo(() => {
    if (derivedQuestion) {
      return [...questions, derivedQuestion];
    }
    return questions;
  }, [questions, derivedQuestion]);

  if (!isOpen) return null;

  const totalSteps = allQuestions.length > 0 ? allQuestions.length : 4;
  const activeQuestion = allQuestions[currentStep] || allQuestions[0];

  const handleSelectOption = (questionId: string, optionId: string) => {
    setIsCompletedConfirmed(false);
    setAnswers((prev) => {
      const current = (prev as any)[questionId];
      return {
        ...prev,
        [questionId]: current === optionId ? undefined : optionId
      };
    });
  };

  const handleSetIntensity = (grade: number) => {
    setIsCompletedConfirmed(false);
    setAnswers((prev) => ({
      ...prev,
      intensity: prev.intensity === grade ? undefined : grade
    }));
  };

  const handleSetCustomText = (questionId: string, text: string) => {
    setIsCompletedConfirmed(false);
    setAnswers((prev) => ({
      ...prev,
      [`${questionId}_ownText`]: text
    }));
  };

  const handleReset = () => {
    setIsCompletedConfirmed(false);
    setAnswers({});
    setCurrentStep(0);
  };

  const handleApply = () => {
    onApplyAnswers(answers);
    onClose();
  };

  const answeredCount = [
    Boolean(answers.onset) || Boolean(answers.onset_ownText?.trim()),
    Boolean(answers.sensationMind) || Boolean(answers.sensationMind_ownText?.trim()),
    Boolean(answers.modality) || Boolean(answers.modality_ownText?.trim()),
    Boolean(answers.intensity) || Boolean(answers.intensity_ownText?.trim()),
    Boolean(answers.derivedClarification) || Boolean(answers.derivedClarification_ownText?.trim())
  ].filter(Boolean).length;

  const scaleLabels: Record<number, string> = {
    1: t('acuteScaleGrade1'),
    2: t('acuteScaleGrade2'),
    3: t('acuteScaleGrade3'),
    4: t('acuteScaleGrade4'),
  };

  const stepTitles = [
    t('diffDiagStep1Title'),
    t('diffDiagStep2Title'),
    t('diffDiagStep3Title'),
    t('diffDiagStep4Title'),
    ...(derivedQuestion ? [t('diffDiagStep5Title')] : [])
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        role="dialog"
        aria-modal="true"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {t('diffDiagTitle')}
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/40">
                  {t('diffDiagStepProgress', { step: currentStep + 1, total: totalSteps })}
                </span>
                {diffResult.domainName && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-700/80 text-teal-200 border border-slate-600">
                    {diffResult.domainName}
                  </span>
                )}
              </div>
              <p className="text-xs text-teal-100/80 mt-0.5">
                {t('diffDiagSubtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label={t('closeBtn')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Navigation Bar */}
        <div className="bg-slate-100/80 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-1 overflow-x-auto shrink-0">
          {stepTitles.map((stTitle, idx) => {
            const isCurrent = idx === currentStep;
            const isCompleted = (
              (idx === 0 && (Boolean(answers.onset) || Boolean(answers.onset_ownText?.trim()))) ||
              (idx === 1 && (Boolean(answers.sensationMind) || Boolean(answers.sensationMind_ownText?.trim()))) ||
              (idx === 2 && (Boolean(answers.modality) || Boolean(answers.modality_ownText?.trim()))) ||
              (idx === 3 && (Boolean(answers.intensity) || Boolean(answers.intensity_ownText?.trim()))) ||
              (idx === 4 && (Boolean(answers.derivedClarification) || Boolean(answers.derivedClarification_ownText?.trim())))
            );
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? 'bg-teal-700 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-teal-600'}`} />
                ) : (
                  <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    isCurrent ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {idx + 1}
                  </span>
                )}
                <span className="truncate max-w-[130px] sm:max-w-none">
                  {stTitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Important Notice */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-amber-950 block">
                {t('acuteQuestionsDisclaimer')}
              </span>
            </div>
          </div>

          {/* Live Differential Diagnosis Status Card */}
          <div className="bg-gradient-to-br from-slate-50 to-teal-50/40 rounded-xl border border-teal-200/80 p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-slate-900">
                  {t('diffDiagCandidatePool')} ({diffResult.topRemedies.length} {t('diffDiagActiveCandidatesCount')})
                </span>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                  • {t('diffDiagMaxRemediesNote')}
                </span>
              </div>
              {diffResult.excludedRemedies.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowExcluded((prev) => !prev)}
                  className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {showExcluded ? (
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
              )}
            </div>

            {/* Leading differential remedies chips */}
            <div className="flex flex-wrap gap-2">
              {diffResult.topRemedies.map((tr, index) => (
                <div
                  key={tr.remedy.id}
                  className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${
                    index === 0
                      ? 'bg-teal-700 text-white border-teal-800 shadow-2xs'
                      : 'bg-white text-slate-800 border-slate-300'
                  }`}
                >
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    index === 0 ? 'bg-teal-900/60 text-teal-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="font-bold">{tr.remedy.latinName}</span>
                  <span className={`text-[11px] font-extrabold ${index === 0 ? 'text-teal-200' : 'text-teal-700'}`}>
                    {tr.matchScore}%
                  </span>
                </div>
              ))}
            </div>

            {/* Collapsible excluded remedies list */}
            {showExcluded && diffResult.excludedRemedies.length > 0 && (
              <div className="pt-2 border-t border-slate-200/80 space-y-1.5 animate-in fade-in duration-100">
                <span className="text-[11px] font-bold text-rose-800 block">
                  {t('diffDiagExcludedTitle')} ({diffResult.excludedRemedies.length}):
                </span>
                <div className="space-y-1">
                  {diffResult.excludedRemedies.map((ex) => (
                    <div
                      key={ex.remedy.id}
                      className="text-xs bg-rose-50/70 border border-rose-200 rounded-lg p-2 flex items-start gap-2 text-rose-950"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold line-through text-slate-700">
                          {ex.remedy.latinName}
                        </span>
                        <p className="text-[11px] text-rose-800 mt-0.5">
                          {ex.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current Step Question */}
          {activeQuestion && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-2xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200/60">
                  {t('diffDiagStepProgress', { step: currentStep + 1, total: totalSteps })}: {activeQuestion.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {activeQuestion.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeQuestion.description || t('diffDiagSelectHint')}
                </p>
              </div>

              {/* Verbindliches Freitextfeld (Ergänzungen / Originalaussagen - Organon §§ 83–104) */}
              <div className="pt-2">
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <label 
                    htmlFor={`patient-own-desc-${activeQuestion.id}`} 
                    className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
                  >
                    <span>{t('diffDiagPatientOwnDescriptionLabel')}</span>
                  </label>
                  <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                    {t('diffDiagPatientOwnDescriptionOptional')}
                  </span>
                </div>
                <textarea
                  id={`patient-own-desc-${activeQuestion.id}`}
                  rows={2}
                  value={(answers as any)[`${activeQuestion.id}_ownText`] || ''}
                  onChange={(e) => handleSetCustomText(activeQuestion.id, e.target.value)}
                  placeholder={t('diffDiagPatientOwnDescriptionPlaceholder')}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-900 placeholder:text-slate-400 resize-none transition-all shadow-2xs"
                />
              </div>

              {/* Oder passende Kategorie zur Orientierung wählen */}
              <div className="pt-3 border-t border-slate-200/70">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  {t('diffDiagOrSelectCategory')}
                </span>

                {/* Single choice question options */}
                {activeQuestion.type === 'single' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeQuestion.options?.map((opt) => {
                      const isSelected = (answers as any)[activeQuestion.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(activeQuestion.id, opt.id)}
                          className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-teal-50/90 border-teal-600 text-teal-950 ring-2 ring-teal-600/40 shadow-xs'
                              : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-semibold leading-snug text-slate-900">
                              {opt.label}
                            </span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                          {opt.remedyHint && (
                            <span className="text-[10px] font-semibold text-teal-700 mt-2 block">
                              {t('acuteKeynoteRemedies')}: {opt.remedyHint}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Scale question options (1 to 4) */}
                {activeQuestion.type === 'scale' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[1, 2, 3, 4].map((grade) => {
                        const isSelected = answers.intensity === grade;
                        return (
                          <button
                            key={grade}
                            type="button"
                            onClick={() => handleSetIntensity(grade)}
                            className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-teal-700 text-white border-teal-800 shadow-xs ring-2 ring-teal-600/40'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            <span className="text-lg font-extrabold">
                              {grade}
                            </span>
                            <span className={`text-[10px] leading-tight font-medium ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                              {scaleLabels[grade]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500 italic text-center">
                      {t('acuteScaleHint')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Differential Decision Note for Position #2 / #3 / #4 */}
          {diffResult.topRemedies.length > 1 && (
            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 text-xs text-teal-950 space-y-1">
              <span className="font-bold text-teal-900 block text-[11px] uppercase tracking-wider">
                {t('diffDiagDistinctionToPrimary')}:
              </span>
              {diffResult.topRemedies.slice(1).map((tr) => (
                <p key={tr.remedy.id} className="text-xs text-teal-900/90 pl-1 border-l-2 border-teal-400">
                  <strong className="text-teal-950">{tr.remedy.latinName}:</strong> {tr.differentialNote || tr.clinicalRationale}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer with Stepper Controls */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {answeredCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('diffDiagReset')}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsCompletedConfirmed(false);
                  setCurrentStep((prev) => Math.max(0, prev - 1));
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('diffDiagPrevStep')}</span>
              </button>
            )}

            {currentStep < totalSteps - 1 ? (
              <button
                type="button"
                onClick={() => {
                  setIsCompletedConfirmed(false);
                  setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
                }}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('diffDiagConfirmAndNext')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : !isCompletedConfirmed ? (
              <button
                type="button"
                onClick={() => setIsCompletedConfirmed(true)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 text-teal-200" />
                <span>{t('diffDiagConfirmAndFinish')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm ring-2 ring-emerald-500/40 flex items-center gap-1.5 cursor-pointer animate-in fade-in"
              >
                <Sparkles className="w-4 h-4 text-emerald-100" />
                <span>{t('acuteQuestionsApplyBtn')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
