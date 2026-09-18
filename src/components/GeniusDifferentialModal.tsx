import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  X, 
  Copy, 
  Check, 
  BookOpen, 
  MapPin, 
  Activity, 
  Sliders, 
  Layers, 
  Sparkles, 
  Award, 
  Info,
  ChevronRight,
  ArrowRightLeft
} from 'lucide-react';
import { useTranslation, useLanguage } from '../i18n/LanguageContext';
import { BoerickeRepertorisationResult } from '../services/boerickeRepertoryService';
import { 
  GeniusCharacteristicProfile, 
  buildAllGeniusProfiles 
} from '../services/geniusDifferentialService';

interface GeniusDifferentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullMatchResults: BoerickeRepertorisationResult[];
  onOpenRemedyMonograph?: (remedyId: string) => void;
}

export const GeniusDifferentialModal: React.FC<GeniusDifferentialModalProps> = ({
  isOpen,
  onClose,
  fullMatchResults,
  onOpenRemedyMonograph
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [copied, setCopied] = useState<boolean>(false);

  // Generate profiles for all remedies in the full match
  const allProfiles = useMemo(() => {
    return buildAllGeniusProfiles(fullMatchResults, language);
  }, [fullMatchResults, language]);

  // Selected remedies to contrast: default to first two
  const [selectedPair, setSelectedPair] = useState<[string, string]>(() => {
    if (allProfiles.length >= 2) {
      return [allProfiles[0].remedyId, allProfiles[1].remedyId];
    }
    return [allProfiles[0]?.remedyId || '', allProfiles[1]?.remedyId || ''];
  });

  // Mode: either 'pair' (2 remedies contrasted) or 'all' (all full-match remedies side-by-side)
  const [viewMode, setViewMode] = useState<'pair' | 'all'>('pair');

  // Active profiles to display in the contrast table
  const displayedProfiles = useMemo(() => {
    if (viewMode === 'all') {
      return allProfiles;
    }
    const [idA, idB] = selectedPair;
    const profA = allProfiles.find(p => p.remedyId === idA) || allProfiles[0];
    const profB = allProfiles.find(p => p.remedyId === idB) || allProfiles[1] || allProfiles[0];
    return [profA, profB].filter(Boolean);
  }, [viewMode, selectedPair, allProfiles]);

  if (!isOpen || allProfiles.length < 2) {
    return null;
  }

  // Copy contrast table as text for patient records
  const handleCopyTable = async () => {
    try {
      let text = `=== ${t('geniusDifferentialAnalysis')} ===\n\n`;
      text += `1. ${t('geniusSection1Title')}\n`;
      displayedProfiles.forEach(p => {
        text += `• ${p.latinName} (${p.commonName}):\n  ${p.essenceText}\n\n`;
      });
      text += `2. ${t('geniusSection2Title')}\n`;
      displayedProfiles.forEach(p => {
        text += `\n--- ${p.latinName} ---\n`;
        text += `• ${t('geniusPillarLocation')}: ${p.pillar1Location}\n`;
        text += `• ${t('geniusPillarSensation')}: ${p.pillar2Sensation}\n`;
        text += `• ${t('geniusPillarModalities')}: ${p.pillar3Modalities}\n`;
        text += `• ${t('geniusPillarConcomitants')}: ${p.pillar4Concomitants}\n`;
        text += `• ${t('geniusPillarMindCausa')}: ${p.pillar5MindCausa}\n`;
        text += `• ${t('geniusKeyDifferentiator')}: ${p.clinicalTouchstone}\n`;
      });

      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy table:', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-6xl max-h-[94vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-teal-50/30 to-emerald-50/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {t('geniusDifferentialAnalysis')}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                  {allProfiles.length} {t('repertoriumRemediesUnit')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {t('geniusModalSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopyTable}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title={t('geniusCopyTable')}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">{t('geniusCopied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">{t('geniusCopyTable')}</span>
                </>
              )}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              aria-label={t('geniusClose')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Remedy Pair Selector (if more than 2 remedies in full match) */}
        {allProfiles.length > 2 && (
          <div className="px-5 py-2.5 sm:px-6 bg-slate-50/80 border-b border-slate-200/70 flex items-center justify-between gap-3 flex-wrap text-xs shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-600">{t('geniusComparePair')}</span>
              
              {/* Select Remedy A */}
              <select
                value={selectedPair[0]}
                onChange={(e) => setSelectedPair([e.target.value, selectedPair[1]])}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {allProfiles.map(p => (
                  <option key={p.remedyId} value={p.remedyId} disabled={p.remedyId === selectedPair[1]}>
                    {p.latinName}
                  </option>
                ))}
              </select>

              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />

              {/* Select Remedy B */}
              <select
                value={selectedPair[1]}
                onChange={(e) => setSelectedPair([selectedPair[0], e.target.value])}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {allProfiles.map(p => (
                  <option key={p.remedyId} value={p.remedyId} disabled={p.remedyId === selectedPair[0]}>
                    {p.latinName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-200/80 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('pair')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  viewMode === 'pair' 
                    ? 'bg-white text-teal-800 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fokus-Paar (2)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  viewMode === 'all' 
                    ? 'bg-white text-teal-800 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('geniusAllInIntersection', { count: allProfiles.length })}
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. Der Kernunterschied (Das Wesen der Mittel) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {t('geniusSection1Title')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('geniusSection1Desc')}
                </p>
              </div>
            </div>

            {/* Profile Cards Grid */}
            <div className={`grid gap-3 sm:gap-4 ${displayedProfiles.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {displayedProfiles.map((p, idx) => (
                <div 
                  key={p.remedyId}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                    idx === 0 
                      ? 'bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 border-amber-200/80 shadow-xs' 
                      : idx === 1
                      ? 'bg-gradient-to-br from-teal-50/50 via-white to-emerald-50/30 border-teal-200/80 shadow-xs'
                      : 'bg-gradient-to-br from-slate-50/60 via-white to-indigo-50/30 border-slate-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" role="img" aria-label={p.latinName}>
                        {p.icon || '⚖️'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {p.latinName}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {p.commonName}
                        </span>
                      </div>
                    </div>

                    {onOpenRemedyMonograph && (
                      <button
                        type="button"
                        onClick={() => onOpenRemedyMonograph(p.remedyId)}
                        className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                        title={t('geniusOpenRemedy')}
                      >
                        <BookOpen className="w-3 h-3" />
                        <span className="hidden sm:inline">{t('geniusOpenRemedy')}</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white/70 p-3 rounded-xl border border-slate-200/60">
                    {p.essenceText}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Direkter Vergleich der 4 Säulen (Schnittstellen-Abweichung) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {t('geniusSection2Title')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('geniusSection2Desc')}
                </p>
              </div>
            </div>

            {/* Contrast Table Matrix */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-xs bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-700">
                    <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-500 w-1/4 sm:w-1/5 min-w-[160px] bg-slate-100/70">
                      {t('geniusTableColAreaPillar')}
                    </th>
                    {displayedProfiles.map((p, idx) => (
                      <th 
                        key={p.remedyId}
                        className={`py-3 px-4 font-bold text-xs min-w-[220px] ${
                          idx === 0 
                            ? 'text-amber-950 bg-amber-50/50' 
                            : idx === 1
                            ? 'text-teal-950 bg-teal-50/50'
                            : 'text-slate-900 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{p.icon || '⚖️'}</span>
                          <span>{p.latinName}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {/* Säule 1: Fokus der Lokalisation */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 bg-slate-50/50 align-top">
                      <div className="flex items-center gap-1.5 text-teal-800">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{t('geniusPillarLocation')}</span>
                      </div>
                    </td>
                    {displayedProfiles.map((p) => (
                      <td key={p.remedyId} className="py-3.5 px-4 text-slate-700 align-top leading-relaxed">
                        {p.pillar1Location}
                      </td>
                    ))}
                  </tr>

                  {/* Säule 2: Schmerzcharakter */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 bg-slate-50/50 align-top">
                      <div className="flex items-center gap-1.5 text-rose-800">
                        <Activity className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{t('geniusPillarSensation')}</span>
                      </div>
                    </td>
                    {displayedProfiles.map((p) => (
                      <td key={p.remedyId} className="py-3.5 px-4 text-slate-700 align-top leading-relaxed">
                        {p.pillar2Sensation}
                      </td>
                    ))}
                  </tr>

                  {/* Säule 3: Modalitäten */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 bg-slate-50/50 align-top">
                      <div className="flex items-center gap-1.5 text-indigo-800">
                        <Sliders className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{t('geniusPillarModalities')}</span>
                      </div>
                    </td>
                    {displayedProfiles.map((p) => (
                      <td key={p.remedyId} className="py-3.5 px-4 text-slate-700 align-top leading-relaxed font-medium">
                        {p.pillar3Modalities}
                      </td>
                    ))}
                  </tr>

                  {/* Säule 4: Begleitsymptome */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 bg-slate-50/50 align-top">
                      <div className="flex items-center gap-1.5 text-amber-800">
                        <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{t('geniusPillarConcomitants')}</span>
                      </div>
                    </td>
                    {displayedProfiles.map((p) => (
                      <td key={p.remedyId} className="py-3.5 px-4 text-slate-700 align-top leading-relaxed">
                        {p.pillar4Concomitants}
                      </td>
                    ))}
                  </tr>

                  {/* Gemütszustand & Causa */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 bg-slate-50/50 align-top">
                      <div className="flex items-center gap-1.5 text-purple-800">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{t('geniusPillarMindCausa')}</span>
                      </div>
                    </td>
                    {displayedProfiles.map((p) => (
                      <td key={p.remedyId} className="py-3.5 px-4 text-slate-700 align-top leading-relaxed">
                        {p.pillar5MindCausa}
                      </td>
                    ))}
                  </tr>

                  {/* Entscheidender klinischer Prüfstein */}
                  <tr className="bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-emerald-950 bg-emerald-100/50 align-top">
                      <div className="flex items-center gap-1.5 text-emerald-800">
                        <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{t('geniusKeyDifferentiator')}</span>
                      </div>
                    </td>
                    {displayedProfiles.map((p) => (
                      <td key={p.remedyId} className="py-3.5 px-4 text-emerald-900 align-top font-bold text-[11px] leading-relaxed">
                        {p.clinicalTouchstone}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Klassische Differenzialanalyse nach Bönninghausen, Boger & Hahnemann.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTable}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? t('geniusCopied') : t('geniusCopyTable')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {t('geniusClose')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
