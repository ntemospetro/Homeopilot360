import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Scissors, 
  CheckCircle2, 
  Pill,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { LocalizedRemedy } from '../data/materiaMedicaData';
import { SubtractiveCascadeStep } from '../services/boerickeRepertoryService';
import { getRemedyClassicalAuthors } from '../data/classicalAuthorsMap';
import { useTranslation } from '../i18n/LanguageContext';

interface FunnelStageRemediesModalProps {
  isOpen: boolean;
  step: SubtractiveCascadeStep | null;
  allRemedies: LocalizedRemedy[];
  onClose: () => void;
  onOpenMonograph: (remedy: LocalizedRemedy) => void;
  onSelectRemedyForCase?: (remedyName: string, potency: string) => void;
}

const ITEMS_PER_PAGE = 24;

export const FunnelStageRemediesModal: React.FC<FunnelStageRemediesModalProps> = ({
  isOpen,
  step,
  allRemedies,
  onClose,
  onOpenMonograph,
  onSelectRemedyForCase
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page and search when opened or step changes
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setCurrentPage(1);
    }
  }, [isOpen, step?.stepNumber]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Match remedy objects by activeRemedyIds
  const stageRemedies = useMemo(() => {
    if (!step) return [];
    const idSet = new Set(step.activeRemedyIds);
    return allRemedies.filter(r => idSet.has(r.id));
  }, [step, allRemedies]);

  // Filter by search query (instant client-side search across this stage)
  const filteredRemedies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return stageRemedies;
    return stageRemedies.filter(r => 
      r.latinName.toLowerCase().includes(q) ||
      r.commonName.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  }, [stageRemedies, searchQuery]);

  // Pagination calculations: ensures fast rendering without freezing
  const totalPages = Math.max(1, Math.ceil(filteredRemedies.length / ITEMS_PER_PAGE));
  
  // Safe bounds check
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedRemedies = useMemo(() => {
    const start = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredRemedies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRemedies, validCurrentPage]);

  const getStageTitle = (stepNumber: number, fallbackTitle: string) => {
    switch (stepNumber) {
      case 1: return t('repertoriumFunnelStage1Title');
      case 2: return t('repertoriumFunnelStage2Title');
      case 3: return t('repertoriumFunnelStage3Title');
      case 4: return t('repertoriumFunnelStage4Title');
      case 5: return t('repertoriumFunnelStage5Title');
      default: return fallbackTitle;
    }
  };

  if (!isOpen || !step) return null;

  const eliminatedCount = Math.max(0, step.countBefore - step.countAfter);

  return (
    <div 
      id="funnel-stage-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-md flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-200"
    >
      {/* Top Header Bar */}
      <div className="shrink-0 bg-white border-b border-slate-200/90 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 shadow-2xs">
            <Scissors className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-5 h-5 rounded-full bg-teal-700 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                {step.stepNumber}
              </span>
              <h2 className="text-sm md:text-base font-bold text-slate-900 truncate">
                {getStageTitle(step.stepNumber, step.title)}
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
                {t('repertoriumFunnelStageModalRemediesCount', { count: step.countAfter })}
              </span>
              {eliminatedCount > 0 && (
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/70 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                  {t('repertoriumFunnelEliminatedCount', { count: eliminatedCount })}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              <span className="font-semibold text-slate-700">{t('repertoriumCriterionLabel')}: </span>
              <span className="italic text-teal-900 font-medium">„{step.inputCriterion}“</span>
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          id="funnel-stage-modal-close-btn"
          onClick={onClose}
          className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0 border border-slate-200/60"
          title={t('repertoriumFunnelStageModalClose')}
          aria-label={t('repertoriumFunnelStageModalClose')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Sub-Header: Search & Pagination Controls */}
      <div className="shrink-0 bg-slate-50 border-b border-slate-200/80 px-4 md:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search inside this stage */}
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            id="funnel-stage-search-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t('repertoriumFunnelStageModalSearchPlaceholder')}
            className="w-full pl-9 pr-8 py-1.5 text-xs md:text-sm bg-white rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-900 placeholder:text-slate-400 outline-none shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Pagination Info & Controls */}
        <div className="flex items-center gap-2.5 text-xs text-slate-600 w-full sm:w-auto justify-between sm:justify-end">
          <span className="font-medium whitespace-nowrap">
            {t('materiaPaginationShowing', { 
              from: filteredRemedies.length > 0 ? (validCurrentPage - 1) * ITEMS_PER_PAGE + 1 : 0,
              to: Math.min(validCurrentPage * ITEMS_PER_PAGE, filteredRemedies.length),
              total: filteredRemedies.length
            })}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              id="funnel-stage-pagination-prev"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors shadow-2xs"
              title={t('materiaPaginationPrev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-900 px-2">
              {t('materiaPageIndicator', { current: validCurrentPage, total: totalPages })}
            </span>
            <button
              type="button"
              id="funnel-stage-pagination-next"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors shadow-2xs"
              title={t('materiaPaginationNext')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View of Remedies for this Stage */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100/70">
        {filteredRemedies.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-slate-200">
            <Layers className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {t('repertoriumFunnelStageModalEmpty')}
            </h3>
            {searchQuery && (
              <p className="text-xs text-slate-500 mt-1">
                Keine Treffer für den Suchbegriff „{searchQuery}“.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-7xl mx-auto">
            {paginatedRemedies.map((remedy, idx) => {
              const authors = getRemedyClassicalAuthors(remedy.id);
              const globalIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE + idx + 1;

              return (
                <div
                  key={remedy.id}
                  id={`funnel-stage-remedy-card-${remedy.id}`}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-teal-400 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          #{globalIndex}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-900 transition-colors truncate">
                          {remedy.latinName}
                        </h4>
                      </div>
                      {remedy.isPolychrest && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                          {t('repertoriumPraxisBonusBadgeSimple')}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 italic truncate">
                      {remedy.commonName}
                    </p>

                    {/* Classical Authors tags */}
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      {authors.hahnemann && (
                        <span className="text-[9px] font-medium px-1 rounded bg-amber-50 text-amber-800 border border-amber-200/60" title="Samuel Hahnemann">
                          S. Hahnemann
                        </span>
                      )}
                      {authors.kent && (
                        <span className="text-[9px] font-medium px-1 rounded bg-sky-50 text-sky-800 border border-sky-200/60" title="James Tyler Kent">
                          J. T. Kent
                        </span>
                      )}
                      {authors.hering && (
                        <span className="text-[9px] font-medium px-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60" title="Constantine Hering">
                          C. Hering
                        </span>
                      )}
                      {authors.boericke && (
                        <span className="text-[9px] font-medium px-1 rounded bg-teal-50 text-teal-800 border border-teal-200/60" title="William Boericke">
                          W. Boericke
                        </span>
                      )}
                      {authors.boger && (
                        <span className="text-[9px] font-medium px-1 rounded bg-purple-50 text-purple-800 border border-purple-200/60" title="Cyrus Maxwell Boger">
                          C. M. Boger
                        </span>
                      )}
                      {authors.allen && (
                        <span className="text-[9px] font-medium px-1 rounded bg-amber-50 text-amber-900 border border-amber-300/80" title="Henry C. Allen">
                          H. C. Allen
                        </span>
                      )}
                    </div>

                    {/* Main Indications preview */}
                    {remedy.mainIndications && remedy.mainIndications.length > 0 && (
                      <div className="text-[11px] text-slate-600 line-clamp-2 pt-1 border-t border-slate-100">
                        <span className="font-semibold text-slate-700">{t('secKeynotesTitle')}: </span>
                        {remedy.mainIndications.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {onSelectRemedyForCase && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectRemedyForCase(remedy.latinName, 'C30');
                          onClose();
                        }}
                        className="text-[11px] font-semibold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg border border-teal-200 transition-colors cursor-pointer"
                      >
                        {t('repertoriumApplyToCase')}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenMonograph(remedy)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-teal-700 hover:bg-teal-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs ml-auto"
                      title={t('repertoriumFunnelStageModalOpenMonograph')}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{t('repertoriumFunnelStageModalOpenMonograph')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Footer Bar */}
      <div className="shrink-0 bg-white border-t border-slate-200/90 px-4 md:px-8 py-2.5 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>{t('repertoriumFunnelStageModalTotalInStage')} </span>
          <span className="font-bold text-slate-900">{step?.countAfter} {t('repertoriumFunnelStageModalRemediesSuffix')}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-slate-400">{t('repertoriumFunnelStageModalEscToClose')}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors cursor-pointer"
          >
            {t('repertoriumFunnelStageModalClose')}
          </button>
        </div>
      </div>
    </div>
  );
};
