import React, { useState } from 'react';
import { X, Award, Sparkles, Check, Calculator, Search } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { CLASSICAL_POLYCHREST_NAMES } from '../data/materiaMedicaData';

interface PraxisBonusInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PraxisBonusInfoModal: React.FC<PraxisBonusInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredPolychrests = CLASSICAL_POLYCHREST_NAMES.filter((name) =>
    name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="praxis-bonus-modal-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="praxis-bonus-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {t('repertoriumPraxisBonusModalTitle')}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[10px] font-extrabold uppercase tracking-wide">
                  +2 PKT
                </span>
              </div>
              <p className="text-xs text-teal-100/90 mt-0.5 leading-relaxed">
                {t('repertoriumPraxisBonusModalSubtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-teal-100 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm">
          {/* Section 1: Was ist der Praxis-Bonus? */}
          <div className="bg-teal-50/60 rounded-2xl p-4 border border-teal-200/70 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-teal-950 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
              <h3>{t('repertoriumPraxisBonusWhatTitle')}</h3>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs sm:text-[13px]">
              {t('repertoriumPraxisBonusWhatDesc')}
            </p>
          </div>

          {/* Section 2: Warum erhalten Polychreste einen Bonus? */}
          <div className="space-y-1.5 px-1">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              {t('repertoriumPraxisBonusWhyTitle')}
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs sm:text-[13px]">
              {t('repertoriumPraxisBonusWhyDesc')}
            </p>
          </div>

          {/* Section 3: Berechnungslogik & Algorithmus-Regeln */}
          <div className="space-y-3 pt-2 border-t border-slate-200/80">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
              <Calculator className="w-4 h-4 text-teal-700 shrink-0" />
              <h3>{t('repertoriumPraxisBonusAlgoTitle')}</h3>
            </div>

            <ul className="space-y-2 text-xs sm:text-[13px] text-slate-600">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t('repertoriumPraxisBonusAlgoRule1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t('repertoriumPraxisBonusAlgoRule2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t('repertoriumPraxisBonusAlgoRule3')}</span>
              </li>
            </ul>

            {/* Rechenbeispiel Cinchona Box */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-800 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-300 text-xs sm:text-sm">
                  {t('repertoriumPraxisBonusExampleTitle')}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  China
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/50">
                  {t('repertoriumPraxisBonusExampleS1')}
                </div>
                <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/50">
                  {t('repertoriumPraxisBonusExampleS2')}
                </div>
                <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/50 text-slate-400">
                  {t('repertoriumPraxisBonusExampleS3')}
                </div>
                <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/50">
                  {t('repertoriumPraxisBonusExampleS4')}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs sm:text-sm flex-wrap gap-2">
                <span className="text-amber-300 font-semibold font-mono">
                  {t('repertoriumPraxisBonusExampleBonus')}
                </span>
                <span className="font-bold text-white bg-teal-800 px-2.5 py-1 rounded-lg border border-teal-600 font-mono">
                  {t('repertoriumPraxisBonusExampleTotal')}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Die 64 klassischen Polychreste */}
          <div className="space-y-3 pt-2 border-t border-slate-200/80">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                {t('repertoriumPraxisBonusListTitle')} ({CLASSICAL_POLYCHREST_NAMES.length})
              </h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('repertoriumPolychrestSearchPlaceholder')}
                  className="pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none w-36 sm:w-48 bg-slate-50"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200/80">
              {filteredPolychrests.map((name) => (
                <span
                  key={name}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs hover:border-teal-300 hover:text-teal-900 transition-colors"
                >
                  {name}
                </span>
              ))}
              {filteredPolychrests.length === 0 && (
                <span className="text-xs text-slate-400 italic py-2">
                  {t('repertoriumNoPolychrestFound')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-bold bg-teal-800 hover:bg-teal-900 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
