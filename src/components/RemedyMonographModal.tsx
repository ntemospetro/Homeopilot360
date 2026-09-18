import React, { useRef, useEffect } from 'react';
import { LocalizedRemedy, getLocalizedRemedies } from '../data/materiaMedicaData';
import { getRemedyClassicalAuthors } from '../data/classicalAuthorsMap';
import { getBogerSynopticEntry } from '../data/bogerSynopticData';
import { getAllenKeynoteEntry } from '../data/allenKeynotesData';
import { useTranslation } from '../i18n/LanguageContext';
import { 
  X, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  Pill, 
  HeartHandshake, 
  Snowflake, 
  Flame, 
  Tag, 
  ChevronRight, 
  Info,
  Plus,
  BookOpen
} from 'lucide-react';

// Comprehensive mapping of homeopathic abbreviations and common synonyms to database keys
export const REMEDY_ALIAS_MAP: Record<string, string> = {
  'rhus tox': 'rhus',
  'rhus toxicodendron': 'rhus',
  'aconitum': 'aconitum',
  'acon': 'aconitum',
  'belladonna': 'belladonna',
  'china': 'cinchona',
  'calc carb': 'calcarea carbonica',
  'calc. carb': 'calcarea carbonica',
  'calc fluor': 'calcarea fluorica',
  'calc phos': 'calcarea phosphorica',
  'calcarea carb': 'calcarea carbonica',
  'nat mur': 'natrium muriaticum',
  'natrum mur': 'natrium muriaticum',
  'natrium muriaticum': 'natrium muriaticum',
  'hepar sulfuris': 'hepar',
  'hepar sulph': 'hepar',
  'kali carb': 'kali carbonicum',
  'kali bich': 'kali bichromicum',
  'mag phos': 'magnesium phosphoricum',
  'carbo veg': 'carbo vegetabilis',
  'ant tart': 'antimonium tartaricum',
  'ant crud': 'antimonium crudum',
  'mercurius': 'mercurius',
  'phos ac': 'phosphoricum',
  'phosphoricum acidum': 'phosphoricum',
  'nitricum acidum': 'nitricum',
  'fluoricum': 'fluoricum',
  'fluoricum acidum': 'fluoricum',
  'lithium carb': 'lithium',
  'ferrum met': 'ferrum metallicum',
  'zincum met': 'zincum metallicum',
  'plumbum met': 'plumbum metallicum',
  'bryonia': 'bryonia',
  'apis': 'apis',
  'arnica': 'arnica',
  'hypericum': 'hypericum',
  'chamomilla': 'chamomilla',
  'ignatia': 'ignatia',
  'gelsemium': 'gelsemium',
  'thuja': 'thuja',
  'lachesis': 'lachesis',
  'pulsatilla': 'pulsatilla',
  'arsenicum': 'arsenicum',
  'lycopodium': 'lycopodium',
  'sepia': 'sepia',
  'silicea': 'silicea',
  'nux vomica': 'nux'
};

/**
 * Resolves a differential diagnosis string (e.g., "Rhus tox (better on motion)")
 * to a LocalizedRemedy in the active database.
 */
export function resolveDifferentialRemedy(diffStr: string, remedies: LocalizedRemedy[]): LocalizedRemedy | null {
  if (!diffStr || !remedies) return null;
  // 1. Strip notes in parentheses or brackets
  let raw = diffStr.replace(/\s*\([^)]*\)/g, '').replace(/\s*\[[^\]]*\]/g, '').trim();
  if (!raw) raw = diffStr.trim();
  raw = raw.replace(/[.,:;!?-]+$/, '').trim();
  const clean = raw.toLowerCase();

  // 2. Direct exact match on latinName or id
  let found = remedies.find(r => 
    r.latinName.toLowerCase() === clean || 
    r.id === clean.replace(/\s+/g, '-') ||
    r.id === clean.replace(/\s+/g, '_')
  );
  if (found) return found;

  // 3. Known aliases check
  for (const [alias, target] of Object.entries(REMEDY_ALIAS_MAP)) {
    if (clean === alias || clean.startsWith(alias) || alias.startsWith(clean)) {
      found = remedies.find(r => 
        r.latinName.toLowerCase().includes(target) || 
        r.id.includes(target)
      );
      if (found) return found;
    }
  }

  // 4. Starts with match
  found = remedies.find(r => r.latinName.toLowerCase().startsWith(clean));
  if (found) return found;

  // 5. First word match
  const firstWord = clean.split(/\s+/)[0];
  if (firstWord && firstWord.length >= 3) {
    found = remedies.find(r => {
      const entryFirstWord = r.latinName.toLowerCase().split(/\s+/)[0];
      return entryFirstWord === firstWord || r.id.startsWith(firstWord);
    });
    if (found) return found;
  }

  // 6. Contains match
  found = remedies.find(r => r.latinName.toLowerCase().includes(clean));
  if (found) return found;

  // 7. Common name / search keywords match
  found = remedies.find(r => 
    r.commonName.toLowerCase() === clean ||
    r.commonName.toLowerCase().includes(clean) ||
    (r.searchKeywords && r.searchKeywords.some(k => k.toLowerCase() === clean || k.toLowerCase().includes(clean)))
  );
  return found || null;
}

export interface RemedyMonographModalProps {
  isOpen?: boolean;
  remedy: LocalizedRemedy | null;
  onClose: () => void;
  allRemedies?: LocalizedRemedy[];
  modalHistory?: LocalizedRemedy[];
  onBackModal?: () => void;
  onNavigateToRemedy?: (remedy: LocalizedRemedy) => void;
  onSelectRemedyForCase?: (remedyName: string, potency: string) => void;
}

export const RemedyMonographModal: React.FC<RemedyMonographModalProps> = ({
  isOpen,
  remedy: passedRemedy,
  onClose,
  allRemedies,
  modalHistory = [],
  onBackModal,
  onNavigateToRemedy,
  onSelectRemedyForCase,
}) => {
  const { t, language } = useTranslation();
  const modalBodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTop = 0;
    }
  }, [passedRemedy]);

  if (isOpen === false || !passedRemedy) return null;

  const remediesList = allRemedies || getLocalizedRemedies(language);
  const remedy = remediesList.find(r => r.id === passedRemedy.id) || passedRemedy;

  const authorsInfo = getRemedyClassicalAuthors(remedy.id);
  const hasAnyAuthors = authorsInfo.hahnemann || authorsInfo.kent || authorsInfo.hering || authorsInfo.boericke || authorsInfo.boger || authorsInfo.allen;

  const handleSelectDifferentialRemedy = (diffString: string) => {
    const targetRemedy = resolveDifferentialRemedy(diffString, remediesList);
    if (targetRemedy && onNavigateToRemedy) {
      onNavigateToRemedy(targetRemedy);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header: Latin Name as Headline + Localized name subtitle + Navigation Back */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1.5 flex-1 min-w-0">
            {modalHistory.length > 0 && onBackModal && (
              <button
                type="button"
                onClick={onBackModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white text-xs font-semibold mb-1 transition-colors cursor-pointer border border-slate-700 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('btnBackToPreviousRemedy', { remedy: modalHistory[modalHistory.length - 1].latinName })}</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {remedy.category}
              </span>
              <span className="text-xs text-slate-400">{t('remedyRepositoryBadge')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-serif truncate">
              {remedy.latinName}
            </h2>
            <p className="text-sm font-medium text-teal-300 truncate">
              {remedy.commonName}
            </p>
            {hasAnyAuthors && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-slate-400 mr-0.5">{t('filterAuthorLabel')}:</span>
                {authorsInfo.hahnemann && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Samuel Hahnemann
                  </span>
                )}
                {authorsInfo.kent && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    James Tyler Kent
                  </span>
                )}
                {authorsInfo.hering && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Constantine Hering
                  </span>
                )}
                {authorsInfo.boericke && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    William Boericke
                  </span>
                )}
                {authorsInfo.boger && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Cyrus Maxwell Boger
                  </span>
                )}
                {authorsInfo.allen && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40" title="Henry C. Allen">
                    Henry C. Allen
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div 
          ref={modalBodyRef}
          className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm"
        >
          {/* 1. Herkunft & Rohstoff */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Info className="w-4 h-4 text-teal-600" />
              <span>{t('secOriginTitle')}:</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
              {remedy.origin}
            </p>
          </div>

          {/* 2. Wesenskern & Charakteristik */}
          <div className="space-y-2 bg-teal-50/60 p-4 rounded-xl border border-teal-100">
            <div className="flex items-center gap-2 text-teal-950 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>{t('secEssenceTitle')}:</span>
            </div>
            <p className="text-slate-800 leading-relaxed text-xs sm:text-sm font-medium">
              {remedy.essence}
            </p>
          </div>

          {/* 3. Haupt-Anwendungsgebiete */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Pill className="w-4 h-4 text-teal-600" />
              <span>{t('secIndicationsTitle')}:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {remedy.mainIndications.map((ind, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span className="font-medium text-slate-800">{ind}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Leitsymptome nach Samuel Hahnemann */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t('secKeynotesTitle')}:</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside bg-amber-50/40 p-4 rounded-xl border border-amber-100 text-xs sm:text-sm text-slate-800">
              {remedy.keynotes.map((kn, idx) => (
                <li key={idx} className="leading-relaxed">
                  <span className="font-semibold text-slate-900">{kn}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 5. Gemüt & Psyche */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <HeartHandshake className="w-4 h-4 text-indigo-600" />
              <span>{t('secMindTitle')}:</span>
            </div>
            <p className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs sm:text-sm text-slate-800 leading-relaxed">
              {remedy.mindEmotional}
            </p>
          </div>

          {/* 6. Modalitäten */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                <Snowflake className="w-4 h-4 text-emerald-700" />
                <span>{t('secModalitiesBetterTitle')}:</span>
              </div>
              <ul className="space-y-1 text-xs text-emerald-950">
                {remedy.modalitiesBetter.map((mb, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="font-bold text-emerald-700">•</span>
                    <span>{mb}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 bg-rose-50/60 p-4 rounded-xl border border-rose-100">
              <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs uppercase tracking-wider">
                <Flame className="w-4 h-4 text-rose-700" />
                <span>{t('secModalitiesWorseTitle')}:</span>
              </div>
              <ul className="space-y-1 text-xs text-rose-950">
                {remedy.modalitiesWorse.map((mw, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="font-bold text-rose-700">•</span>
                    <span>{mw}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 7. Dosierung & Potenzen */}
          <div className="space-y-2 bg-slate-900 text-white p-4 rounded-xl">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
              <Tag className="w-4 h-4" />
              <span>{t('secDosageTitle')}:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {remedy.potenciesAndDosage}
            </p>
            {remedy.defaultTagesdosis && (
              <div className="text-xs text-teal-300 pt-1">
                {t('secDefaultDailyDose')}: {remedy.defaultTagesdosis}
              </div>
            )}
          </div>

          {/* 8. Verwandte Mittel & Differenzialdiagnose (ANKLICKBAR mit Direkt-Navigation) */}
          {remedy.differentialRemedies.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>{t('secDifferentialTitle')}:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {remedy.differentialRemedies.map((diff, idx) => {
                  const matched = resolveDifferentialRemedy(diff, remediesList);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectDifferentialRemedy(diff)}
                      title={matched ? t('clickToOpenRemedy', { remedy: matched.latinName }) : diff}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer group shadow-2xs hover:shadow-xs ${
                        matched
                          ? 'bg-teal-50/80 hover:bg-teal-600 hover:text-white text-teal-900 border-teal-200/90 hover:border-teal-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Pill className={`w-3.5 h-3.5 ${matched ? 'text-teal-600 group-hover:text-white' : 'text-slate-400'} shrink-0`} />
                      <span className="font-semibold">{diff}</span>
                      <ChevronRight className={`w-3.5 h-3.5 ${matched ? 'text-teal-500 group-hover:text-white group-hover:translate-x-0.5' : 'text-slate-300'} transition-transform shrink-0`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 9. C. M. Boger Synoptic Key & Charakteristika */}
          {(() => {
            const bogerData = getBogerSynopticEntry(remedy.id);
            if (!bogerData) return null;
            return (
              <div className="space-y-3 bg-purple-50/50 p-4 rounded-xl border border-purple-200/70 mt-4">
                <div className="flex items-center gap-2 text-purple-950 font-bold text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-purple-700" />
                  <span>{t('secBogerSynopticTitle')}</span>
                </div>

                {/* Region / Sphere of Action */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                    {t('secBogerRegion')}:
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-purple-100">
                    {bogerData.region}
                  </p>
                </div>

                {/* Boger Modalities: Worse / Better */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="bg-white/80 p-2.5 rounded-lg border border-rose-100">
                    <div className="flex items-center gap-1.5 text-rose-800 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-600" />
                      <span>{t('secBogerWorse')}</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                      {bogerData.worse.map((w, wIdx) => (
                        <li key={wIdx} className="leading-snug">{w}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-teal-100">
                    <div className="flex items-center gap-1.5 text-teal-800 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                      <Snowflake className="w-3.5 h-3.5 text-teal-600" />
                      <span>{t('secBogerBetter')}</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                      {bogerData.better.map((b, bIdx) => (
                        <li key={bIdx} className="leading-snug">{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Boger Highlights */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                    {t('secBogerKeynotes')}:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-800 list-disc list-inside bg-white/70 p-2.5 rounded-lg border border-purple-100">
                    {bogerData.highlights.map((hl, hlIdx) => (
                      <li key={hlIdx} className="leading-relaxed font-medium">
                        {hl}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()}

          {/* 10. H. C. Allen Keynotes & Charakteristika */}
          {(() => {
            const allenData = getAllenKeynoteEntry(remedy.id);
            if (!allenData) return null;
            return (
              <div className="space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200/70 mt-4">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <span>{t('secAllenKeynotesTitle')}</span>
                </div>

                {/* Allen Keynotes */}
                {allenData.keynotes.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                      {t('secAllenKeynotes')}:
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-800 list-disc list-inside bg-white/80 p-2.5 rounded-lg border border-amber-100">
                      {allenData.keynotes.map((kn, kIdx) => (
                        <li key={kIdx} className="leading-relaxed font-medium">
                          {kn}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Modalities: Worse / Better */}
                {(allenData.modalitiesWorse.length > 0 || allenData.modalitiesBetter.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {allenData.modalitiesWorse.length > 0 && (
                      <div className="bg-white/80 p-2.5 rounded-lg border border-rose-100">
                        <div className="flex items-center gap-1.5 text-rose-800 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                          <Flame className="w-3.5 h-3.5 text-rose-600" />
                          <span>{t('secAllenWorse')}</span>
                        </div>
                        <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                          {allenData.modalitiesWorse.map((w, wIdx) => (
                            <li key={wIdx} className="leading-snug">{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {allenData.modalitiesBetter.length > 0 && (
                      <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] uppercase tracking-wider mb-1.5">
                          <Snowflake className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('secAllenBetter')}</span>
                        </div>
                        <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                          {allenData.modalitiesBetter.map((b, bIdx) => (
                            <li key={bIdx} className="leading-snug">{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Relationships & Comparisons */}
                {allenData.relations.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                      {t('secAllenRelations')}:
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside bg-white/70 p-2.5 rounded-lg border border-amber-100">
                      {allenData.relations.map((rel, rIdx) => (
                        <li key={rIdx} className="leading-snug">{rel}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {modalHistory.length > 0 && onBackModal && (
              <button
                type="button"
                onClick={onBackModal}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('btnBackToPreviousRemedy', { remedy: modalHistory[modalHistory.length - 1].latinName })}</span>
              </button>
            )}
            <span className="text-xs text-slate-500 hidden sm:inline">
              {t('monographHeader')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onSelectRemedyForCase && (
              <button
                type="button"
                onClick={() => {
                  const defaultPotency = remedy.potenciesAndDosage.match(/[CDLM]\s*\d+/i)?.[0] || 'C30';
                  onSelectRemedyForCase(remedy.latinName, defaultPotency);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>{t('btnApplyToCase')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              {t('closeBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
