import React from 'react';
import { HomeoRemedyResult } from '../services/homeopathyEngine';
import { PatientCase } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { getLocalizedPresetValue } from '../utils/remedyLocalization';
import { Sparkles, X, CheckCircle2, Pill, FileText } from 'lucide-react';

interface CaseAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: HomeoRemedyResult[];
  patientCase: Partial<PatientCase>;
  remainingAnalyses: number;
}

export const CaseAnalysisModal: React.FC<CaseAnalysisModalProps> = ({
  isOpen,
  onClose,
  results,
  patientCase,
  remainingAnalyses,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-900/70 border border-teal-700/60 text-teal-300 text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>{t('modalAnalysisBadge')}</span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            {t('modalAnalysisTitle')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('modalAnalysisSubtitle', {
              name: patientCase.patientName || t('patientName'),
              date: patientCase.anamneseDatum || new Date().toLocaleDateString()
            })}
            {patientCase.patientAge ? ` • ${patientCase.patientAge} J.` : ''}
            {patientCase.patientGender ? ` • ${patientCase.patientGender}` : ''}
            {patientCase.patientHeightCm ? ` • ${patientCase.patientHeightCm} cm` : ''}
            {patientCase.patientGender === 'weiblich' && patientCase.isPregnant ? ` • Schwanger (${patientCase.pregnancyMonth ? `${patientCase.pregnancyMonth}. Monat` : 'Ja'})` : ''}
            {patientCase.hasChildren && patientCase.childrenList && patientCase.childrenList.length > 0 ? ` • ${patientCase.childrenList.length} ${patientCase.childrenList.length === 1 ? 'Kind' : 'Kinder'}` : ''}
          </p>
        </div>

        {/* Quota Banner */}
        <div className="bg-teal-50 border-b border-teal-100 px-6 py-2.5 flex items-center justify-between text-xs text-teal-950">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>{t('modalAnalysisSuccess')}</span>
          </span>
          <span className="font-bold bg-white text-teal-900 px-2 py-0.5 rounded border border-teal-200 font-mono text-[11px]">
            {t('modalAnalysisRemaining', { count: remainingAnalyses })}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6 text-slate-800 text-sm">
          {/* Summary Box */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider text-slate-500">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>{t('modalRecordedSymptoms')}</span>
            </h4>
            <p className="text-slate-800">
              <strong>{t('mainComplaintTitle')}</strong> {patientCase.hauptbeschwerde || '-'}
            </p>

            {patientCase.anamnesisQuestions && patientCase.anamnesisQuestions.length > 0 && (
              <div className="pt-2 border-t border-slate-200 mt-2 space-y-1.5">
                <span className="font-bold text-slate-700 text-[11px] block">
                  Erfasste Beschwerde-Details &amp; Skalenbewertungen:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {patientCase.anamnesisQuestions
                    .filter(
                      (q) =>
                        q.answerScaleCurrent !== undefined ||
                        q.answerScaleWorst !== undefined ||
                        (q.answerChoice && q.answerChoice.trim()) ||
                        (q.answerMultiChoice && q.answerMultiChoice.length > 0) ||
                        (q.answerText && q.answerText.trim())
                    )
                    .map((q) => (
                      <div
                        key={q.id}
                        className="p-1.5 bg-white rounded border border-slate-200 text-[11px] leading-snug"
                      >
                        <strong className="text-slate-800 block text-[10px] uppercase">
                          {q.category || q.question.slice(0, 30)}
                        </strong>
                        <div className="text-slate-600">
                          {q.answerScaleCurrent && (
                            <span className="inline-block font-bold text-teal-800 bg-teal-50 px-1 rounded mr-1">
                              Aktuell: {q.answerScaleCurrent}/4
                            </span>
                          )}
                          {q.answerScaleWorst && (
                            <span className="inline-block font-bold text-rose-800 bg-rose-50 px-1 rounded mr-1">
                              Spitze: {q.answerScaleWorst}/4
                            </span>
                          )}
                          {q.answerChoice && <span>{q.answerChoice} </span>}
                          {q.answerMultiChoice && q.answerMultiChoice.length > 0 && (
                            <span>{q.answerMultiChoice.join(', ')} </span>
                          )}
                          {q.answerText && <span className="italic text-slate-500">({q.answerText})</span>}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {patientCase.modalitaetenBesser && (
              <p className="text-slate-600 pt-1">
                <strong>{t('modalitaetenBetterTitle')}</strong> {patientCase.modalitaetenBesser}
              </p>
            )}
            {patientCase.modalitaetenSchlechter && (
              <p className="text-slate-600">
                <strong>{t('modalitaetenWorseTitle')}</strong> {patientCase.modalitaetenSchlechter}
              </p>
            )}
          </div>

          {/* Remedy Match Cards */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Pill className="w-4 h-4 text-teal-600" />
              <span>{t('modalPrioritizedRemedies')}</span>
            </h3>

            <div className="space-y-3">
              {results.map((remedy, idx) => (
                <div
                  key={remedy.name}
                  className={`p-4 rounded-lg border transition-all ${
                    idx === 0
                      ? 'bg-teal-50/40 border-teal-300 ring-1 ring-teal-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">
                        {remedy.name}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono font-medium">
                        {remedy.potency}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        idx === 0 ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {remedy.grade}
                      </span>
                      <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                        {remedy.score}% {t('modalMatchScore')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {remedy.description}
                  </p>

                  {/* Dosierungsplan */}
                  {(remedy.tagesdosis || remedy.haeufigkeit || remedy.anwendungsdauer) && (
                    <div className="mb-3 p-2.5 bg-teal-50/70 rounded-md border border-teal-100 text-xs space-y-1.5">
                      <span className="font-bold text-teal-900 block text-[11px] uppercase tracking-wide">
                        {t('dosageScheduleHeader')}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                        {remedy.tagesdosis && (
                          <div>
                            <span className="text-slate-500">{t('dosagePerDayLabel')}: </span>
                            <strong className="text-slate-900">{getLocalizedPresetValue(remedy.tagesdosis, 'dose', t)}</strong>
                          </div>
                        )}
                        {remedy.haeufigkeit && (
                          <div>
                            <span className="text-slate-500">{t('frequencyLabel')}: </span>
                            <strong className="text-slate-900">{getLocalizedPresetValue(remedy.haeufigkeit, 'freq', t)}</strong>
                          </div>
                        )}
                        {remedy.anwendungsdauer && (
                          <div>
                            <span className="text-slate-500">{t('durationLabel')}: </span>
                            <strong className="text-slate-900">{getLocalizedPresetValue(remedy.anwendungsdauer, 'dur', t)}</strong>
                          </div>
                        )}
                        {remedy.zeitraum && (
                          <div>
                            <span className="text-slate-500">{t('applicationPhaseLabel')}: </span>
                            <strong className="text-slate-900">{getLocalizedPresetValue(remedy.zeitraum, 'phase', t)}</strong>
                          </div>
                        )}
                      </div>
                      {remedy.einnahmehinweis && (
                        <p className="text-[10.5px] text-slate-600 pt-1 border-t border-teal-100/60">
                          <strong>{t('therapistNoteLabel')}:</strong> {getLocalizedPresetValue(remedy.einnahmehinweis, 'note', t)}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1 uppercase">
                        {t('modalMatchingSymptoms')}
                      </span>
                      <ul className="space-y-0.5">
                        {remedy.keyIndicators.map((ind, i) => (
                          <li key={i} className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                            <span>{ind}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1 uppercase">
                        {t('modalModalityFit')}
                      </span>
                      <ul className="space-y-0.5">
                        {remedy.modalitiesMatch.map((mod, i) => (
                          <li key={i} className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                            <span>{mod}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {remedy.materiaMedicaHint && (
                    <div className="mt-3 text-[11px] text-slate-500 italic bg-white/80 p-2 rounded border border-slate-100">
                      <strong>Materia Medica:</strong> {remedy.materiaMedicaHint}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            {t('btnCloseAndAccept')}
          </button>
        </div>
      </div>
    </div>
  );
};
