import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnamnesisQuestion, QuestionType } from '../types';
import { splitMultipleComplaints } from '../services/complaintQuestionGenerator';
import { 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Plus, 
  Trash2, 
  RotateCcw, 
  FileText, 
  Check, 
  Flame, 
  Info,
  ChevronRight,
  ChevronLeft,
  Layers,
  CornerDownRight
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { VoiceInputButton } from './VoiceInputButton';

interface DynamicComplaintQuestionsProps {
  chiefComplaint: string;
  questions: AnamnesisQuestion[];
  onUpdateQuestion: (questionId: string, updates: Partial<AnamnesisQuestion>) => void;
  onAddCustomQuestion: (question: AnamnesisQuestion) => void;
  onRemoveQuestion: (questionId: string) => void;
  onRegenerateQuestions: () => void;
  onTransferToAnamnese: () => void;
}

export const DynamicComplaintQuestions: React.FC<DynamicComplaintQuestionsProps> = ({
  chiefComplaint,
  questions,
  onUpdateQuestion,
  onAddCustomQuestion,
  onRemoveQuestion,
  onRegenerateQuestions,
  onTransferToAnamnese,
}) => {
  const { t } = useTranslation();
  const [activeComplaintIndex, setActiveComplaintIndex] = useState<number>(0);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('scale');
  const [newQuestionOptions, setNewQuestionOptions] = useState('');
  const [expandedHelp, setExpandedHelp] = useState<{ [id: string]: boolean }>({});

  const scaleLabels: { [key: number]: string } = {
    1: t('scale1Label') || '1 (Normal / Leicht)',
    2: t('scale2Label') || '2 (Mäßig)',
    3: t('scale3Label') || '3 (Stark)',
    4: t('scale4Label') || '4 (Extrem / Unerträglich)',
  };

  const toggleHelp = (id: string) => {
    setExpandedHelp((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isInitialMount = useRef(true);

  // Smoothly scroll to the top of Question 1 with 10px offset
  const scrollToFirstQuestion = () => {
    setTimeout(() => {
      const firstCard =
        document.getElementById('dynamic-complaint-first-question') ||
        document.querySelector('[data-question-index="0"]');

      if (firstCard) {
        const rect = firstCard.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetTop = rect.top + scrollTop - 10;

        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth',
        });
      } else {
        const container = document.getElementById('dynamic-complaint-questions-container');
        if (container) {
          const rect = container.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const targetTop = rect.top + scrollTop - 10;
          window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: 'smooth',
          });
        }
      }
    }, 70);
  };

  const handleSelectComplaintIndex = (newIndex: number) => {
    setActiveComplaintIndex(newIndex);
    scrollToFirstQuestion();
  };

  // Extract detected distinct complaints list
  const detectedComplaints = useMemo(() => {
    const split = splitMultipleComplaints(chiefComplaint);
    if (split.length > 0) return split;
    const names = Array.from(new Set(questions.map((q) => q.complaintName).filter(Boolean))) as string[];
    return names.length > 0 ? names : [chiefComplaint.trim()];
  }, [chiefComplaint, questions]);

  const isMultiComplaint = detectedComplaints.length > 1;
  const safeIndex = Math.min(Math.max(0, activeComplaintIndex), Math.max(0, detectedComplaints.length - 1));
  const currentComplaintName = detectedComplaints[safeIndex] || chiefComplaint;

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    scrollToFirstQuestion();
  }, [safeIndex]);

  // Active questions for the currently selected complaint
  const currentQuestions = useMemo(() => {
    if (!isMultiComplaint) {
      return questions;
    }
    const matched = questions.filter(
      (q) => q.complaintIndex === safeIndex || q.complaintName === currentComplaintName
    );
    return matched.length > 0 ? matched : questions;
  }, [questions, safeIndex, currentComplaintName, isMultiComplaint]);

  // Overall answered count across all complaints
  const totalAnsweredCount = questions.filter((q) => {
    return (
      q.answerScaleCurrent !== undefined ||
      q.answerScaleWorst !== undefined ||
      (q.answerChoice && q.answerChoice.trim().length > 0) ||
      (q.answerMultiChoice && q.answerMultiChoice.length > 0) ||
      (q.answerText && q.answerText.trim().length > 0)
    );
  }).length;

  const totalQuestionsCount = questions.length;
  const overallProgressPercent = totalQuestionsCount > 0 ? Math.round((totalAnsweredCount / totalQuestionsCount) * 100) : 0;

  // Active complaint stats
  const activeAnsweredCount = currentQuestions.filter((q) => {
    return (
      q.answerScaleCurrent !== undefined ||
      q.answerScaleWorst !== undefined ||
      (q.answerChoice && q.answerChoice.trim().length > 0) ||
      (q.answerMultiChoice && q.answerMultiChoice.length > 0) ||
      (q.answerText && q.answerText.trim().length > 0)
    );
  }).length;
  const activeTotalCount = currentQuestions.length;
  const activeProgressPercent = activeTotalCount > 0 ? Math.round((activeAnsweredCount / activeTotalCount) * 100) : 0;

  // Helper for complaint tab stats
  const getComplaintStats = (compName: string, compIdx: number) => {
    const compQs = questions.filter((q) => q.complaintIndex === compIdx || q.complaintName === compName);
    const answered = compQs.filter(
      (q) =>
        q.answerScaleCurrent !== undefined ||
        q.answerScaleWorst !== undefined ||
        (q.answerChoice && q.answerChoice.trim().length > 0) ||
        (q.answerMultiChoice && q.answerMultiChoice.length > 0) ||
        (q.answerText && q.answerText.trim().length > 0)
    ).length;
    return { answered, total: compQs.length };
  };

  const handleCreateCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const parsedOptions = newQuestionOptions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const customQ: AnamnesisQuestion = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      complaintName: currentComplaintName,
      complaintIndex: safeIndex,
      category: newQuestionCategory.trim() || t('complaintQuestionsCustom') || 'Individuell',
      question: newQuestionText.trim(),
      type: newQuestionType,
      options: parsedOptions.length > 0 ? parsedOptions : (newQuestionType === 'choice' || newQuestionType === 'multi_choice' ? ['Option 1', 'Option 2'] : undefined),
      scaleMin: 1,
      scaleMax: 4,
      scaleLabels: scaleLabels,
    };

    onAddCustomQuestion(customQ);
    setNewQuestionText('');
    setNewQuestionCategory('');
    setNewQuestionOptions('');
    setShowAddCustom(false);
  };

  const toggleMultiChoiceOption = (question: AnamnesisQuestion, option: string) => {
    const current = question.answerMultiChoice || [];
    const exists = current.includes(option);
    const updated = exists ? current.filter((o) => o !== option) : [...current, option];
    onUpdateQuestion(question.id, { answerMultiChoice: updated });
  };

  if (!chiefComplaint || !chiefComplaint.trim()) {
    return (
      <div className="p-5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-slate-500 text-xs">
        <Sparkles className="w-6 h-6 text-slate-400 mx-auto mb-2 opacity-50" />
        <span className="font-semibold block text-slate-700">{t('complaintQuestionsReady')}</span>
        <span className="text-[11px] text-slate-500">
          {t('complaintQuestionsReadyDesc')}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200" id="dynamic-complaint-questions-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-teal-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-200 border border-teal-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-300" />
                {t('complaintQuestionsTitle')}
              </span>
              {isMultiComplaint ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-300" />
                  {t('complaintsDetectedCount', { count: detectedComplaints.length })}
                </span>
              ) : null}
              <span className="text-xs text-teal-200/80 font-mono">
                {totalAnsweredCount} / {totalQuestionsCount} {t('complaintQuestionsAnswered')} ({overallProgressPercent}%)
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>
                {isMultiComplaint
                  ? t('complaintCurrentOfTotal', { current: safeIndex + 1, total: detectedComplaints.length, name: currentComplaintName })
                  : `${t('complaintQuestionsTitle')} "${currentComplaintName}"`}
              </span>
            </h3>
            <p className="text-xs text-teal-100/80 max-w-2xl leading-relaxed">
              {isMultiComplaint
                ? t('complaintMultiHelp')
                : t('complaintQuestionsSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-regenerate-complaint-questions"
              onClick={onRegenerateQuestions}
              className="px-3 py-2 bg-teal-950/60 hover:bg-teal-950 text-teal-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-teal-700/60 cursor-pointer"
              title={t('complaintQuestionsRegenerate')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('complaintQuestionsRegenerate')}</span>
            </button>

            <button
              type="button"
              id="btn-transfer-answers-header"
              onClick={onTransferToAnamnese}
              disabled={totalAnsweredCount === 0}
              className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('complaintQuestionsTransfer')}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('complaintQuestionsTransfer')}</span>
            </button>
          </div>
        </div>

        {/* Multi-Complaint Stepper Tab Bar */}
        {isMultiComplaint && (
          <div className="mt-4 pt-3.5 border-t border-teal-700/50">
            <div className="text-[11px] font-bold text-teal-200/90 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{t('detectedComplaintsHeader', { count: detectedComplaints.length })}</span>
              <span className="text-teal-300 font-mono text-[10px]">
                {t('complaintCurrentSlashTotal', { current: safeIndex + 1, total: detectedComplaints.length })}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {detectedComplaints.map((compName, idx) => {
                const isActive = idx === safeIndex;
                const stats = getComplaintStats(compName, idx);
                const isDone = stats.total > 0 && stats.answered === stats.total;
                const isPartial = stats.total > 0 && stats.answered > 0 && stats.answered < stats.total;

                return (
                  <button
                    key={idx}
                    type="button"
                    id={`btn-tab-complaint-${idx}`}
                    onClick={() => handleSelectComplaintIndex(idx)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-teal-400 text-slate-950 border-teal-300 font-bold shadow-md ring-2 ring-teal-200'
                        : isDone
                        ? 'bg-teal-950/80 text-emerald-300 border-emerald-500/40 hover:bg-teal-900/80'
                        : isPartial
                        ? 'bg-amber-950/70 text-amber-200 border-amber-500/50 hover:bg-amber-900/60'
                        : 'bg-teal-950/50 text-teal-100 border-teal-700/60 hover:bg-teal-900/60'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                        isActive
                          ? 'bg-slate-900 text-teal-300'
                          : isDone
                          ? 'bg-emerald-500/30 text-emerald-200'
                          : isPartial
                          ? 'bg-amber-500/30 text-amber-200'
                          : 'bg-teal-800 text-teal-200'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-[180px] sm:max-w-[240px]">{compName}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950'
                          : isDone
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : isPartial
                          ? 'bg-amber-900/60 text-amber-300'
                          : 'bg-teal-900/60 text-teal-300'
                      }`}
                    >
                      {stats.answered}/{stats.total}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress Bar for Active Complaint */}
        <div className="mt-3 pt-2.5 border-t border-teal-700/30">
          <div className="flex items-center justify-between text-[11px] text-teal-200/80 mb-1">
            <span>
              {t('progressFor')} {isMultiComplaint ? `"${currentComplaintName}"` : t('mainComplaint')}:
            </span>
            <span className="font-mono font-bold">
              {t('answeredOutOf', { answered: activeAnsweredCount, total: activeTotalCount, percent: activeProgressPercent })}
            </span>
          </div>
          <div className="w-full h-2 bg-teal-950/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-300 transition-all duration-300 rounded-full"
              style={{ width: `${activeProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* List of Dynamic Questions for Active Complaint */}
      <div className="space-y-4">
        {currentQuestions.map((q, index) => {
          const isAnswered =
            q.answerScaleCurrent !== undefined ||
            q.answerScaleWorst !== undefined ||
            (q.answerChoice && q.answerChoice.trim().length > 0) ||
            (q.answerMultiChoice && q.answerMultiChoice.length > 0) ||
            (q.answerText && q.answerText.trim().length > 0);

          const isCustom = q.id.startsWith('custom_');

          return (
            <div
              key={q.id}
              id={index === 0 ? 'dynamic-complaint-first-question' : `question-card-${q.id}`}
              data-question-index={index}
              className={`p-5 rounded-2xl border transition-all scroll-mt-4 ${
                isAnswered
                  ? 'bg-white border-teal-200/90 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center font-mono shrink-0">
                      {index + 1}
                    </span>
                    {q.category && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wide">
                        {q.category}
                      </span>
                    )}
                    {isMultiComplaint && q.complaintName && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {q.complaintName}
                      </span>
                    )}
                    {isAnswered ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" /> {t('complaintQuestionsStatusDone')}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                        {t('complaintQuestionsStatusOpen')}
                      </span>
                    )}
                    {isCustom && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                        {t('complaintQuestionsCustom')}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug pt-0.5">
                    {q.question}
                  </h4>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {q.helpText && (
                    <button
                      type="button"
                      onClick={() => toggleHelp(q.id)}
                      className="text-slate-400 hover:text-teal-600 p-1 rounded-md transition-colors cursor-pointer"
                      title={t('therapistHintLabel')}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  )}
                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => onRemoveQuestion(q.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                      title={t('btnDelete') || 'Löschen'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Help Text dropdown */}
              {q.helpText && expandedHelp[q.id] && (
                <div className="mb-3.5 p-3 rounded-lg bg-teal-50/80 border border-teal-100 text-teal-900 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                  <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="font-semibold">{t('therapistHintLabel')} </strong>
                    {q.helpText}
                  </div>
                </div>
              )}

              {/* QUESTION INPUT TYPES */}
              <div className="mt-3.5 space-y-3">
                {/* 1. SCALE (1 BIS 4) */}
                {q.type === 'scale' && (
                  <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    {/* Part A: Aktuelle / Normale Stärke */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span>{t('complaintQuestionsCurrentIntensity')}</span>
                          <span className="text-[11px] font-mono text-slate-500 font-normal">
                            (1 - 4)
                          </span>
                        </label>
                        {q.answerScaleCurrent && (
                          <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                            {scaleLabels[q.answerScaleCurrent]}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((num) => {
                          const isSelected = q.answerScaleCurrent === num;
                          return (
                            <button
                              key={`cur_${num}`}
                              type="button"
                              id={`btn-scale-current-${q.id}-${num}`}
                              onClick={() =>
                                onUpdateQuestion(q.id, {
                                  answerScaleCurrent: isSelected ? undefined : num,
                                })
                              }
                              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                                isSelected
                                  ? num === 1
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-300'
                                    : num === 2
                                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-300'
                                      : num === 3
                                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs ring-2 ring-orange-300'
                                        : 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-300'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                              }`}
                            >
                              <span className="text-sm font-extrabold">{num}</span>
                              <span className="text-[11px] font-medium opacity-90">
                                {scaleLabels[num]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Part B: Spitzenwert im schlimmsten Fall (Maximum) */}
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-rose-500" />
                          <span>{t('complaintQuestionsWorstIntensity')}</span>
                          <span className="text-[11px] font-mono text-slate-500 font-normal">
                            (1 - 4)
                          </span>
                        </label>
                        {q.answerScaleWorst && (
                          <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                            {scaleLabels[q.answerScaleWorst]}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((num) => {
                          const isSelected = q.answerScaleWorst === num;
                          return (
                            <button
                              key={`wst_${num}`}
                              type="button"
                              id={`btn-scale-worst-${q.id}-${num}`}
                              onClick={() =>
                                onUpdateQuestion(q.id, {
                                  answerScaleWorst: isSelected ? undefined : num,
                                })
                              }
                              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                                isSelected
                                  ? num === 1
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-300'
                                    : num === 2
                                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-300'
                                      : num === 3
                                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs ring-2 ring-orange-300'
                                        : 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-300'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                              }`}
                            >
                              <span className="text-sm font-extrabold">{num}</span>
                              <span className="text-[11px] font-medium opacity-90">
                                {scaleLabels[num]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SINGLE CHOICE */}
                {q.type === 'choice' && q.options && (() => {
                  const isYesNo = q.options.length === 2 && 
                    ((q.options.includes('Ja') && q.options.includes('Nein')) ||
                     (q.options.includes('Nein') && q.options.includes('Ja')));
                  const displayOpts = isYesNo ? ['Nein', 'Ja'] : q.options;
                  const isShortNumbered = displayOpts.length === 4;

                  const gridClass = isYesNo
                    ? "grid grid-cols-2 gap-3"
                    : isShortNumbered
                      ? "grid grid-cols-4 gap-2"
                      : "space-y-1.5";

                  return (
                    <div className={gridClass}>
                      {displayOpts.map((opt, oIdx) => {
                        const isSelected = q.answerChoice === opt;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            id={`btn-choice-${q.id}-${oIdx}`}
                            onClick={() =>
                              onUpdateQuestion(q.id, {
                                answerChoice: isSelected ? '' : opt,
                              })
                            }
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between sm:justify-start gap-2.5 ${
                              isSelected
                                ? 'bg-teal-50 border-teal-600 text-teal-950 font-semibold shadow-2xs ring-1 ring-teal-500/20'
                                : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'border-teal-600 bg-teal-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="leading-snug font-medium truncate">{opt}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* 3. MULTI CHOICE */}
                {q.type === 'multi_choice' && q.options && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-slate-500 font-medium mb-1 flex items-center gap-1">
                      <span>{t('multiChoiceHint')}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = (q.answerMultiChoice || []).includes(opt);
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            id={`btn-multichoice-${q.id}-${oIdx}`}
                            onClick={() => toggleMultiChoiceOption(q, opt)}
                            className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2 ${
                              isSelected
                                ? 'bg-teal-50/90 border-teal-600 text-teal-950 font-semibold shadow-2xs ring-1 ring-teal-600'
                                : 'bg-white border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected
                                  ? 'border-teal-600 bg-teal-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="leading-snug">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. OPTIONAL / COMPLEMENTARY FREE TEXT + VOICE INPUT FOR EVERY QUESTION */}
                {(() => {
                  const isYesNo = q.type === 'choice' && q.options && q.options.length === 2 && 
                    ((q.options.includes('Ja') && q.options.includes('Nein')) || (q.options.includes('Nein') && q.options.includes('Ja')));
                  const isYesSelected = isYesNo && q.answerChoice === 'Ja';

                  if (isYesNo) {
                    if (!isYesSelected) return null;
                    return (
                      <div className="rounded-xl border border-teal-200/90 bg-teal-50/40 p-3.5 sm:p-4 mt-2.5 space-y-2 relative shadow-2xs animate-in fade-in-50 slide-in-from-top-1 duration-200">
                        <div className="flex items-center gap-2 text-xs font-bold text-teal-900 border-b border-teal-100/80 pb-2">
                          <CornerDownRight className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>{t('additionalDetails') || 'Zusatzangaben / Details'}</span>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            id={`input-freetext-${q.id}`}
                            placeholder={t('complaintQuestionsFreeTextPlaceholder')}
                            value={q.answerText || ''}
                            onChange={(e) => onUpdateQuestion(q.id, { answerText: e.target.value })}
                            className="w-full px-3 py-2 pr-10 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-500/20 transition-colors"
                          />
                          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                            <VoiceInputButton
                              value={q.answerText || ''}
                              onChange={(val) => onUpdateQuestion(q.id, { answerText: val })}
                              size="xs"
                              mode="append"
                              context="question_answer"
                              id={`btn-voice-q-${q.id}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="pt-2">
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          id={`input-freetext-${q.id}`}
                          placeholder={t('complaintQuestionsFreeTextPlaceholder')}
                          value={q.answerText || ''}
                          onChange={(e) => onUpdateQuestion(q.id, { answerText: e.target.value })}
                          className="w-full px-3 py-2 pr-10 text-xs border border-slate-300 rounded-xl bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors"
                        />
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                          <VoiceInputButton
                            value={q.answerText || ''}
                            onChange={(val) => onUpdateQuestion(q.id, { answerText: val })}
                            size="xs"
                            mode="append"
                            context="question_answer"
                            id={`btn-voice-q-${q.id}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* MULTI-COMPLAINT NAVIGATION STEPPER BAR */}
      {isMultiComplaint && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-teal-950 text-white border border-teal-800/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {safeIndex > 0 ? (
              <button
                type="button"
                id="btn-complaint-step-prev"
                onClick={() => handleSelectComplaintIndex(safeIndex - 1)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('btnPreviousComplaint', { name: detectedComplaints[safeIndex - 1] })}</span>
              </button>
            ) : (
              <div className="text-xs text-teal-300/80 font-medium">
                {t('firstComplaint', { total: detectedComplaints.length })}
              </div>
            )}
          </div>

          <div className="text-xs text-center font-medium text-teal-100/90">
            {t('complaintCurrentSlashTotal', { current: safeIndex + 1, total: detectedComplaints.length })} ({activeAnsweredCount}/{activeTotalCount} {t('filledStatus')})
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {safeIndex < detectedComplaints.length - 1 ? (
              <button
                type="button"
                id="btn-complaint-step-next"
                onClick={() => handleSelectComplaintIndex(safeIndex + 1)}
                className="w-full sm:w-auto px-5 py-2.5 bg-teal-400 hover:bg-teal-300 active:bg-teal-500 text-slate-950 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>{t('btnNextComplaint', { name: detectedComplaints[safeIndex + 1] })}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                id="btn-complaint-step-finish"
                onClick={onTransferToAnamnese}
                disabled={totalAnsweredCount === 0}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 text-slate-950 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('btnTransferAllToAnamnese')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Action Controls & Custom Question Creator */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
        <button
          type="button"
          id="btn-add-custom-question-toggle"
          onClick={() => setShowAddCustom(!showAddCustom)}
          className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('complaintQuestionsAddCustom')}</span>
        </button>

        {/* Custom Question Dialog / Form */}
        {showAddCustom && (
          <form
            onSubmit={handleCreateCustomQuestion}
            className="w-full p-4 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-3 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-teal-900">
                {t('complaintQuestionsCreateTitle')}
                {isMultiComplaint ? ` (zu ${currentComplaintName})` : ''}
              </h5>
              <button
                type="button"
                onClick={() => setShowAddCustom(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-medium cursor-pointer"
              >
                {t('complaintQuestionsCancel')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  {t('complaintQuestionsPrompt')}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="z.B. Strahlen die Schmerzen bis in den Nacken aus?"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="w-full px-3 py-2 pr-9 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <VoiceInputButton
                      value={newQuestionText}
                      onChange={(val) => setNewQuestionText(val)}
                      size="xs"
                      mode="append"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  {t('complaintQuestionsType')}
                </label>
                <select
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value as QuestionType)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-teal-600"
                >
                  <option value="scale">{t('complaintQuestionsTypeScale')}</option>
                  <option value="choice">{t('complaintQuestionsTypeChoice')}</option>
                  <option value="multi_choice">{t('complaintQuestionsTypeMultiChoice')}</option>
                  <option value="text">{t('complaintQuestionsTypeText')}</option>
                </select>
              </div>

              {(newQuestionType === 'choice' || newQuestionType === 'multi_choice') && (
                <div className="sm:col-span-12">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    {t('complaintQuestionsOptionsLabel')}
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      placeholder={'Option 1\nOption 2\nOption 3'}
                      value={newQuestionOptions}
                      onChange={(e) => setNewQuestionOptions(e.target.value)}
                      className="w-full px-3 py-2 pr-9 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                    <div className="absolute right-2 top-2">
                      <VoiceInputButton
                        value={newQuestionOptions}
                        onChange={(val) => setNewQuestionOptions(val)}
                        size="xs"
                        mode="append"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {t('complaintQuestionsSave')}
              </button>
            </div>
          </form>
        )}

        {/* Transfer Button */}
        <button
          type="button"
          id="btn-transfer-answers-footer"
          onClick={onTransferToAnamnese}
          disabled={totalAnsweredCount === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('complaintQuestionsTransfer')}</span>
        </button>
      </div>
    </div>
  );
};
