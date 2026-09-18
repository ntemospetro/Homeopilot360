import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Table,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileText,
  HelpCircle,
  Info,
  X,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { Hahnemann6Pillars } from '../services/hahnemannEngineService';
import {
  performKentMathematicalRepertorisation,
  KentRubricMatch,
  KentRemedySummary,
  KentRepertorisationMatrix,
} from '../services/kentRepertoryService';

interface KentRepertorySectionProps {
  matrix: Hahnemann6Pillars | null;
  rawText?: string;
  defaultExpanded?: boolean;
  repertorisation?: KentRepertorisationMatrix;
}

export const KentRepertorySection: React.FC<KentRepertorySectionProps> = ({
  matrix,
  rawText = '',
  defaultExpanded = true,
  repertorisation: incomingRepertorisation,
}) => {
  const { t, language } = useTranslation();
  const currentLang = language || 'de';
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [activeOriginPopup, setActiveOriginPopup] = useState<string | null>(null);

  const repertorisation = useMemo(() => {
    if (incomingRepertorisation) {
      return incomingRepertorisation;
    }
    return performKentMathematicalRepertorisation(matrix, rawText, currentLang);
  }, [incomingRepertorisation, matrix, rawText, currentLang]);

  const { selectedSymptoms, rubrics, remedies, leadingSimile } = repertorisation;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden transition-all duration-200">
      {/* Header bar / Toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className="w-full flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-teal-50/40 to-slate-50 border-b border-slate-200/80 cursor-pointer hover:bg-teal-50/50 transition-colors text-left select-none"
      >
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-900 text-white shrink-0 shadow-xs">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {t('kentRepertoryTitle')}
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                § 153 Organon
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {t('kentNomenclatureBadge')}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {t('kentStrictInterpretationBadge')}
              </span>
              {leadingSimile && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  <Award className="w-3 h-3 text-amber-700" />
                  Simile: {leadingSimile.shortName} ({leadingSimile.totalScore} {t('kentPointsAbbr')})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('kentRepertorySubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-600">
            {isExpanded ? t('kentRepertoryBtnClose') : t('kentRepertoryBtnOpen')}
          </span>
          <div className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-6">
          {rubrics.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-teal-100 text-teal-900 mb-1 shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  {t('kentStrictInterpretationBadge')}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  {t('kentNomenclatureBadge')}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {t('kentStrictProhibitionTitle')}
              </h4>
              <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
                {t('kentStrictProhibitionDesc')}
              </p>
            </div>
          ) : (
            <>
              {/* STEP 1: Symptomen-Auswahl (§ 153) */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-900 text-white text-[10px]">
                    1
                  </span>
                  <span>{t('kentStep1Title')}</span>
                </div>
                <p className="text-xs text-slate-600 max-w-4xl leading-relaxed">
                  {t('kentStep1Desc')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                  {selectedSymptoms.map((sym, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          {sym.category}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      </div>
                      <div className="font-medium text-slate-800 text-[13px] line-clamp-2">
                        «{sym.text}»
                      </div>
                      <div className="text-[11px] text-teal-700 font-mono pt-1 border-t border-slate-200/60 truncate">
                        → {sym.rubricName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STEP 2 & 3: Graduierung & Auswertungstabelle (Matrix nach Kent) */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-900 text-white text-[10px]">
                      2+3
                    </span>
                    <span>{t('kentStep3Title')}</span>
                  </div>

                  {/* Legend for Kent Grades */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded border border-slate-300">
                      <span className="font-extrabold text-teal-950 underline decoration-2">3</span> = {t('kentGrade3Label')}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-blue-900 px-2 py-0.5 bg-blue-50 rounded border border-blue-200 italic">
                      <span>2</span> = {t('kentGrade2Label')}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-700 px-2 py-0.5 bg-slate-50 rounded border border-slate-200">
                      <span>1</span> = {t('kentGrade1Label')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  {t('kentStep2Desc')} • {t('kentStep3Desc')}
                </p>

                {/* Matrix Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/90 text-slate-800 border-b border-slate-200">
                        <th className="p-3 font-bold min-w-[240px] max-w-[320px]">
                          {t('kentTableColRubrics')}
                        </th>
                        <th className="p-3 font-semibold text-slate-600 min-w-[160px]">
                          {t('kentTableColOrigin')}
                        </th>
                        {remedies.map((rem: KentRemedySummary) => (
                          <th
                            key={rem.key}
                            className={`p-3 text-center min-w-[100px] border-l border-slate-200 ${
                              rem.isSimile
                                ? 'bg-amber-50/90 text-amber-950 font-black'
                                : 'font-bold text-slate-800'
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <span className="text-[13px]">{rem.shortName}</span>
                              <span className="text-[10px] font-normal text-slate-500 truncate max-w-[90px]">
                                {rem.latinName}
                              </span>
                              {rem.isSimile && (
                                <span className="mt-1 text-[9px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-bold tracking-tight">
                                  SIMILE
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80">
                      {rubrics.map((rubric: KentRubricMatch) => (
                        <tr key={rubric.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono text-[11px] text-teal-950 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                {rubric.chapter}
                              </span>
                              <span>{rubric.rubricName}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center border-l border-slate-200">
                            {rubric.symptomOrigin ? (
                              <button
                                type="button"
                                onClick={() => setActiveOriginPopup(rubric.symptomOrigin)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-semibold transition-colors border border-teal-200 cursor-pointer shadow-2xs"
                                title="Symptom-Inhaltstext anzeigen"
                              >
                                <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                <span>Info</span>
                              </button>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          {remedies.map((rem: KentRemedySummary) => {
                            const grade = rubric.grades[rem.key] || 0;
                            return (
                              <td
                                key={rem.key}
                                className={`p-3 text-center border-l border-slate-200 ${
                                  rem.isSimile ? 'bg-amber-50/30' : ''
                                }`}
                              >
                                {grade === 3 && (
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-teal-900 text-white font-black text-sm shadow-xs">
                                    3
                                  </span>
                                )}
                                {grade === 2 && (
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-900 font-bold italic text-sm border border-blue-200">
                                    2
                                  </span>
                                )}
                                {grade === 1 && (
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200">
                                    1
                                  </span>
                                )}
                                {grade === 0 && (
                                  <span className="text-slate-300 font-light text-base">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {/* Summary: Treffer / Rubriken */}
                      <tr className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-800">
                        <td colSpan={2} className="p-3 text-right text-xs uppercase tracking-wider">
                          {t('kentTableHitsRow')}
                        </td>
                        {remedies.map((rem: KentRemedySummary) => (
                          <td
                            key={rem.key}
                            className={`p-3 text-center border-l border-slate-200 text-xs ${
                              rem.isSimile ? 'bg-amber-50 font-black text-amber-950' : 'text-slate-800'
                            }`}
                          >
                            {rem.hits} / {rubrics.length}
                          </td>
                        ))}
                      </tr>

                      {/* Summary: Gesamtpunktzahl (Grad-Summe) */}
                      <tr className="bg-slate-100/90 font-black border-t border-slate-200 text-slate-900">
                        <td colSpan={2} className="p-3 text-right text-xs uppercase tracking-wider text-teal-950">
                          {t('kentTableTotalScoreRow')}
                        </td>
                        {remedies.map((rem: KentRemedySummary) => (
                          <td
                            key={rem.key}
                            className={`p-3 text-center border-l border-slate-200 text-sm ${
                              rem.isSimile
                                ? 'bg-amber-100 text-amber-950 font-black text-base shadow-inner'
                                : 'text-slate-800'
                            }`}
                          >
                            {rem.totalScore} {t('kentPointsAbbr')}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* STEP 4: Materia Medica Verifikation */}
              {leadingSimile && (
                <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                      <div className="p-1.5 rounded-lg bg-amber-200 text-amber-900 shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <span>{t('kentStep4Title')}: {leadingSimile.latinName}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-bold border border-amber-300">
                        {leadingSimile.totalScore} {t('kentPointsAbbr')} • {leadingSimile.hits}/{rubrics.length} {t('kentTableHitsRow')}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {t('kentSimileTotalityMatch')}
                    </span>
                  </div>

                  <div className="text-xs text-amber-950 leading-relaxed bg-white/80 p-3.5 rounded-lg border border-amber-200/70">
                    {leadingSimile.materiaMedicaVerification[currentLang] ||
                      leadingSimile.materiaMedicaVerification.de}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-amber-800 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      {t('kentVerificationNotice')}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Origin Text Popup Modal */}
      {activeOriginPopup && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                <Info className="w-4 h-4 text-teal-600" />
                <span>Symptom-Inhaltstext</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveOriginPopup(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-slate-700 italic bg-slate-50 p-4 rounded-xl border border-slate-200/80 leading-relaxed">
              «{activeOriginPopup}»
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveOriginPopup(null)}
                className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
