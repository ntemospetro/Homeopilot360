import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Send,
  RotateCcw,
  Check,
  Sparkles,
  Info,
  Clock,
  Layers,
  BookOpen
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { Stage2Category, STAGE2_CATEGORY_SEQUENCE, STAGE2_CATEGORIES_METADATA } from '../types/organonStage2Workflow';
import {
  OrganonGlobalReviewResult,
  OrganonOpenIssue,
  ClarificationTurn,
  GlobalReviewStepState,
  OrganonOpenIssueType
} from '../types/organonGlobalReview';
import { runOrganonGlobalReview, processClarificationResponse } from '../services/organonGlobalReviewService';
import { OrganonProcessingStatus } from './OrganonProcessingStatus';

export interface OrganonGlobalReviewViewProps {
  rawText: string;
  stage1Values?: Record<string, string>;
  endprueferResult?: any | null;
  records: Record<Stage2Category, { category: Stage2Category; status: string; text: string; details?: any }>;
  hahnemannCrossCheck: boolean;
  onUpdateRecords: (records: Record<Stage2Category, any>) => void;
  onFinalizeWorkflow: () => void;
}

export const OrganonGlobalReviewView: React.FC<OrganonGlobalReviewViewProps> = ({
  rawText,
  stage1Values = {},
  endprueferResult = null,
  records,
  hahnemannCrossCheck,
  onUpdateRecords,
  onFinalizeWorkflow
}) => {
  const { t } = useTranslation();

  const [reviewStepState, setReviewStepState] = useState<GlobalReviewStepState>('IDLE');
  const [reviewResult, setReviewResult] = useState<OrganonGlobalReviewResult | null>(null);
  const [clarificationHistory, setClarificationHistory] = useState<ClarificationTurn[]>([]);
  const [clarificationInput, setClarificationInput] = useState<string>('');
  const [activeIssue, setActiveIssue] = useState<OrganonOpenIssue | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState<boolean>(false);
  const [isClarificationSubmitting, setIsClarificationSubmitting] = useState<boolean>(false);

  // Trigger review execution
  const executeReview = async (
    targetRecords = records,
    history = clarificationHistory
  ) => {
    setIsReviewLoading(true);
    setReviewStepState('GLOBAL_REVIEW_RUNNING');
    try {
      const result = await runOrganonGlobalReview({
        rawText,
        stage1Values,
        endprueferResult,
        stage2Records: targetRecords as any,
        clarificationHistory: history,
        hahnemannCrossCheck
      });

      setReviewResult(result);

      if (result.openIssues.length > 0 && result.nextAction === 'ASK_CLARIFICATION') {
        setActiveIssue(result.currentIssue || result.openIssues[0]);
        setReviewStepState('GLOBAL_REVIEW_COMPLETE');
      } else {
        setActiveIssue(null);
        setReviewStepState('COMPLETED');
      }
    } catch (err) {
      console.error('[OrganonGlobalReviewView] Review execution failed:', err);
      setReviewStepState('COMPLETED');
    } finally {
      setIsReviewLoading(false);
    }
  };

  // Initial trigger on mount
  useEffect(() => {
    if (reviewStepState === 'IDLE') {
      executeReview();
    }
  }, []);

  // Handle Clarification submission
  const handleSubmitClarification = async (customAnswer?: string) => {
    const answerToUse = customAnswer !== undefined ? customAnswer : clarificationInput;
    if (!activeIssue || (!answerToUse.trim() && customAnswer === undefined)) return;

    setIsClarificationSubmitting(true);
    try {
      const { updatedRecords, clarificationTurn } = processClarificationResponse(
        records as any,
        activeIssue,
        answerToUse
      );

      const nextHistory = [...clarificationHistory, clarificationTurn];
      onUpdateRecords(updatedRecords);
      setClarificationHistory(nextHistory);
      setClarificationInput('');

      // Re-check after updating state
      await executeReview(updatedRecords as any, nextHistory);
    } finally {
      setIsClarificationSubmitting(false);
    }
  };

  const getIssueTypeLabel = (type: OrganonOpenIssueType): string => {
    switch (type) {
      case 'CONTRADICTION':
        return t('stage2IssueContradiction');
      case 'SYMPTOM_BINDING_UNCLEAR':
        return t('stage2IssueSymptomBinding');
      case 'EPISODE_BINDING_UNCLEAR':
        return t('stage2IssueEpisodeBinding');
      case 'EVIDENCE_CEILING_CONFLICT':
        return t('stage2IssueEvidenceCeiling');
      case 'MISSING_RELEVANT_INFORMATION':
        return t('stage2IssueMissingInfo');
      case 'AMBIGUITY':
        return t('stage2IssueAmbiguity');
      default:
        return t('stage2IssueAssignmentUnclear');
    }
  };

  const getPriorityBadgeClass = (priority: string): string => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      default:
        return 'bg-slate-700/60 text-slate-300 border border-slate-600/30';
    }
  };

  return (
    <div id="organon-stage2-global-review" className="w-full flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-900">
      {/* ================= STATE 1: GLOBAL REVIEW RUNNING ================= */}
      {reviewStepState === 'GLOBAL_REVIEW_RUNNING' && (
        <OrganonProcessingStatus
          title={t('organonProcessingGlobalReviewTitle')}
          subtitle={t('organonProcessingGlobalReviewSubtitle')}
          steps={[
            {
              id: 'global-review-eval',
              label: isReviewLoading ? t('organonProcessingGlobalReviewStep') : t('organonProcessingGlobalReviewStepDone'),
              status: isReviewLoading ? 'active' : 'completed',
              subtext: t('stage2ReviewRunningDesc')
            }
          ]}
          methodologicalNote={t('organonProcessingMethodNote2')}
          fallbackNotice={reviewResult?.meta?.isLocalFallback ? t('organonProcessingFallbackNotice') : undefined}
          theme="dark"
        />
      )}

      {/* ================= STATE 2: GLOBAL REVIEW COMPLETE (ISSUES DETECTED) ================= */}
      {reviewStepState === 'GLOBAL_REVIEW_COMPLETE' && reviewResult && (
        <div className="space-y-6">
          {reviewResult.meta?.isLocalFallback && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-amber-200/90 text-xs">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{t('organonProcessingFallbackNotice')}</span>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-850 to-amber-950/30 border border-amber-500/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {t('stage2ReviewCompletedTitle')}
                </h3>
                <p className="text-xs text-amber-200/90 mt-0.5">
                  {t('stage2ReviewIssuesFound', { count: reviewResult.openIssues.length })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                id="organon-start-clarification-btn"
                type="button"
                onClick={() => setReviewStepState('RESIDUAL_CLARIFICATION')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{t('stage2StartClarificationBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List of Identified Open Issues */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Identifizierte Klärungsbedarfe ({reviewResult.openIssues.length})
            </h4>
            <div className="space-y-2.5">
              {reviewResult.openIssues.map((issue, idx) => {
                const catMeta = issue.affectedCategory ? STAGE2_CATEGORIES_METADATA[issue.affectedCategory] : null;
                return (
                  <div
                    key={issue.id}
                    id={`organon-open-issue-${idx}`}
                    className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-100">
                          {getIssueTypeLabel(issue.issueType)}
                        </span>
                        {catMeta && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                            {t(catMeta.labelKey)} ({catMeta.dimensionsCode})
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getPriorityBadgeClass(issue.priority)}`}>
                        {issue.priority === 'HIGH'
                          ? t('stage2IssuePriorityHigh')
                          : issue.priority === 'MEDIUM'
                          ? t('stage2IssuePriorityMedium')
                          : t('stage2IssuePriorityLow')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {issue.description}
                    </p>

                    {issue.evidenceRefs.length > 0 && (
                      <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 italic">
                        <span className="font-semibold text-slate-300 not-italic mr-1.5">Evidenz:</span>
                        {issue.evidenceRefs.map((ref, rIdx) => (
                          <span key={rIdx} className="mr-2">
                            „{ref.textSnippet}“
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= STATE 3: DYNAMIC RESIDUAL CLARIFICATION ================= */}
      {reviewStepState === 'RESIDUAL_CLARIFICATION' && activeIssue && (
        <div id="organon-residual-clarification-view" className="space-y-5">
          {/* Header & Progress Indicator */}
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {t('stage2ClarificationTitle')}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {t('stage2ClarificationProgress', {
                    current: clarificationHistory.filter(t => t.resolvedIssue).length + 1,
                    total: clarificationHistory.filter(t => t.resolvedIssue).length + (reviewResult?.openIssues.length || 1)
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getPriorityBadgeClass(activeIssue.priority)}`}>
                {getIssueTypeLabel(activeIssue.issueType)}
              </span>
            </div>
          </div>

          {/* Context & Affected Category */}
          <div className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <span className="text-slate-400 font-medium">{t('stage2AffectedCategoryLabel')}</span>
            {activeIssue.affectedCategory && (
              <span className="font-bold text-teal-300">
                {t(STAGE2_CATEGORIES_METADATA[activeIssue.affectedCategory].labelKey)} ({STAGE2_CATEGORIES_METADATA[activeIssue.affectedCategory].dimensionsCode})
              </span>
            )}
          </div>

          {/* Conflicting Evidence References */}
          {activeIssue.evidenceRefs.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t('stage2ClarificationEvidenceTitle')}
              </span>
              <div className="space-y-1">
                {activeIssue.evidenceRefs.map((ref, idx) => (
                  <div key={idx} className="text-xs text-slate-300 italic pl-3 border-l-2 border-teal-500/60">
                    „{ref.textSnippet}“
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Question Box */}
          <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-500/40 space-y-2">
            <div className="flex items-center gap-2 text-teal-300">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {t('stage2ClarificationQuestionTitle')}
              </span>
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed">
              {activeIssue.proposedQuestion || activeIssue.description}
            </p>
          </div>

          {/* Input & Action Area or Processing Status */}
          {isClarificationSubmitting ? (
            <OrganonProcessingStatus
              title={t('organonProcessingClarificationTitle')}
              subtitle={t('organonProcessingClarificationSubtitle')}
              steps={[
                {
                  id: 'clarification-step',
                  label: t('organonProcessingClarificationStep'),
                  status: 'active'
                }
              ]}
              methodologicalNote={t('organonProcessingMethodNote1')}
              theme="dark"
            />
          ) : (
            <div className="space-y-3">
              <textarea
                id="organon-clarification-input"
                rows={3}
                value={clarificationInput}
                onChange={(e) => setClarificationInput(e.target.value)}
                placeholder={t('stage2ClarificationInputPlaceholder')}
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none leading-relaxed"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  {/* Das weiß ich nicht mehr / Nicht erinnerlich */}
                  <button
                    id="organon-clarification-not-remembered-btn"
                    type="button"
                    onClick={() => handleSubmitClarification('Das weiß ich nicht mehr')}
                    className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                    title="Weg als nicht weiter klärbar schließen und als Restunsicherheit dokumentieren"
                  >
                    {t('stage2NotRememberedBtn')}
                  </button>

                  {/* Als Restunsicherheit belassen */}
                  <button
                    id="organon-clarification-skip-btn"
                    type="button"
                    onClick={() => handleSubmitClarification('Als unlösbare Restunsicherheit belassen')}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {t('stage2SkipClarificationBtn')}
                  </button>
                </div>

                {/* Submit Answer & Re-Check */}
                <button
                  id="organon-clarification-submit-btn"
                  type="button"
                  disabled={!clarificationInput.trim()}
                  onClick={() => handleSubmitClarification()}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{t('stage2SubmitClarificationBtn')}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= STATE 4: COMPLETED ================= */}
      {reviewStepState === 'COMPLETED' && (
        <div id="organon-stage2-completed-view" className="space-y-6">
          {/* Completion Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-850 to-emerald-950/40 border border-emerald-500/30 shadow-lg space-y-2">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {t('stage2AnamnesisCompletedTitle')}
                </h3>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  {t('stage2AnamnesisCompletedDesc')}
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-300 leading-relaxed pl-14">
              {reviewResult?.unresolvedIssues && reviewResult.unresolvedIssues.length > 0 ? (
                <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-xs">
                  {t('stage2ReviewUnresolvedDoc')}
                </div>
              ) : (
                <div className="text-emerald-200/90">
                  {t('stage2ReviewNoIssues')}
                </div>
              )}
            </div>
          </div>

          {/* Clarification turns log (if any points were clarified) */}
          {clarificationHistory.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('stage2ResolvedIssuesCount', { count: clarificationHistory.filter(t => t.resolvedIssue).length })}
              </h4>
              <div className="space-y-2">
                {clarificationHistory.map((turn, tIdx) => (
                  <div key={turn.id || tIdx} className="p-3 rounded-xl bg-slate-850/80 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-teal-300">{turn.appliedUpdateSnippet}</span>
                      <span>{new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-300 italic">„{turn.answer}“</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overview Table of All 10 Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Übersicht aller 10 Organon-Kategorien (§§ 83–104)
            </h4>
            <div className="space-y-2">
              {STAGE2_CATEGORY_SEQUENCE.map((cat, idx) => {
                const meta = STAGE2_CATEGORIES_METADATA[cat];
                const rec = records[cat];
                const isDone = rec?.status === 'COMPLETED';
                const isSkipped = rec?.status === 'SKIPPED_SUFFICIENT';

                return (
                  <div
                    key={cat}
                    className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100">{t(meta.labelKey)}</span>
                          <span className="text-[10px] font-mono text-slate-400">({meta.dimensionsCode})</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                          {rec?.text || '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isSkipped
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isDone
                          ? t('stage2StatusCompleted')
                          : isSkipped
                          ? t('stage2StatusSkipped')
                          : t('stage2StatusPending')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Finish Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              id="organon-stage2-finalize-btn"
              type="button"
              onClick={onFinalizeWorkflow}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('stage2FinalizeAndSaveBtn')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
