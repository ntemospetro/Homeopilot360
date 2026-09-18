import React, { useState, useMemo } from 'react';
import { 
  Check, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageCode } from '../types';
import { 
  CASCADE_PILLAR_DEFINITIONS, 
  CascadeCategory, 
  CascadeTier2Option, 
  CascadeTier3Option 
} from '../services/cascadeAnamnesisEngine';

// Helper to filter anatomical categories for location pillar based on complaint
function isAnatomicallyRelevant(complaint: string, catLabel: string): boolean {
  if (!complaint || !catLabel) return true;
  const c = complaint.toLowerCase();
  const l = catLabel.toLowerCase();

  const isHeadComplaint = c.includes('kopf') || c.includes('head') || c.includes('migräne') || c.includes('migraine') || c.includes('cepha');
  const isAbdomenComplaint = c.includes('bauch') || c.includes('abdom') || c.includes('magen') || c.includes('stomach') || c.includes('darm') || c.includes('ventr');
  const isChestComplaint = c.includes('brust') || c.includes('chest') || c.includes('herz') || c.includes('lunge') || c.includes('thorax');
  const isBackComplaint = c.includes('rück') || c.includes('back') || c.includes('lumb') || c.includes('wirbel') || c.includes('kreuz');

  if (isHeadComplaint) {
    return l.includes('kopf') || l.includes('head') || l.includes('stirn') || l.includes('nacken') || l.includes('neck') || l.includes('gesicht') || l.includes('face') || l.includes('auge') || l.includes('eye');
  }
  if (isAbdomenComplaint) {
    return l.includes('bauch') || l.includes('abdom') || l.includes('magen') || l.includes('epigastr') || l.includes('darm') || l.includes('becken');
  }
  if (isChestComplaint) {
    return l.includes('brust') || l.includes('chest') || l.includes('thorax') || l.includes('herz') || l.includes('lunge');
  }
  if (isBackComplaint) {
    return l.includes('rück') || l.includes('back') || l.includes('wirbel') || l.includes('lende') || l.includes('kreuz') || l.includes('nacken');
  }
  return true;
}

export interface SelectedCascadeItem {
  categoryId: string;
  categoryLabel: string;
  tier2Id: string;
  tier2Label: string;
  tier3Id?: string;
  tier3Label?: string;
  direction?: 'better' | 'worse' | 'neutral';
  remedyHints?: string[];
}

interface CascadeFunnelPillarSelectorProps {
  pillar: 'location' | 'sensation' | 'causa' | 'modalities' | 'concomitants' | 'mind';
  language: LanguageCode;
  chiefComplaint: string;
  existingValue: string;
  activeDirection?: 'better' | 'worse';
  onDirectionChange?: (dir: 'better' | 'worse') => void;
  onSelectionChange: (selectedItems: SelectedCascadeItem[], combinedSynthesizedText: string) => void;
}

export const CascadeFunnelPillarSelector: React.FC<CascadeFunnelPillarSelectorProps> = ({
  pillar,
  language,
  chiefComplaint,
  existingValue,
  activeDirection,
  onDirectionChange,
  onSelectionChange
}) => {
  const { t } = useTranslation();
  const pillarDef = CASCADE_PILLAR_DEFINITIONS[pillar];

  // Selected Level 1 Category ID
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Selected Level 2 Items (Multi-select enabled: map tier2Id -> SelectedCascadeItem)
  const [selectedTier2Map, setSelectedTier2Map] = useState<Record<string, SelectedCascadeItem>>({});

  // Helper to extract localized text
  const getLoc = (record?: Record<string, string>): string => {
    if (!record) return '';
    return record[language] || record.de || record.en || Object.values(record)[0] || '';
  };

  // Filter categories by anatomical relevance if pillar is location
  const filteredCategories = useMemo(() => {
    if (!pillarDef) return [];
    if (pillar !== 'location' || !chiefComplaint) return pillarDef.categories;

    return pillarDef.categories.filter((cat) => {
      const catLabel = getLoc(cat.label);
      return isAnatomicallyRelevant(chiefComplaint, catLabel);
    });
  }, [pillarDef, pillar, chiefComplaint, language]);

  // Set default active category if none selected
  const activeCategory = useMemo(() => {
    if (filteredCategories.length === 0) return null;
    const found = filteredCategories.find(c => c.id === selectedCategoryId);
    return found || filteredCategories[0];
  }, [filteredCategories, selectedCategoryId]);

  // If activeCategory changed and selectedCategoryId is empty, initialize it
  React.useEffect(() => {
    if (activeCategory && !selectedCategoryId) {
      setSelectedCategoryId(activeCategory.id);
    }
  }, [activeCategory, selectedCategoryId]);

  // Reconstruct initial selection state from existingValue on mount or external update
  React.useEffect(() => {
    if (!existingValue || !pillarDef) return;
    const existingParts = existingValue.split(',').map(s => s.trim().toLowerCase());
    if (existingParts.length === 0) return;

    const newMap: Record<string, SelectedCascadeItem> = {};
    let matchedCatId = '';

    pillarDef.categories.forEach(cat => {
      cat.tier2Options.forEach(t2 => {
        const t2Label = getLoc(t2.label).toLowerCase();
        const cleanT2Label = t2Label.replace(/^[<>]\s*/, '').trim();

        const match = existingParts.some(part => {
          const cleanPart = part.replace(/^[<>]\s*/, '').trim();
          return cleanPart === cleanT2Label || cleanPart.includes(cleanT2Label) || cleanT2Label.includes(cleanPart);
        });

        if (match) {
          matchedCatId = cat.id;
          newMap[t2.id] = {
            categoryId: cat.id,
            categoryLabel: getLoc(cat.label),
            tier2Id: t2.id,
            tier2Label: getLoc(t2.label),
            direction: t2.direction,
            remedyHints: t2.remedyHints
          };
        }
      });
    });

    if (Object.keys(newMap).length > 0) {
      setSelectedTier2Map(newMap);
      if (matchedCatId) {
        setSelectedCategoryId(matchedCatId);
      }
    }
  }, [existingValue, pillarDef]);

  // Synthesize formatted text from selected items
  const synthesizeText = (itemsMap: Record<string, SelectedCascadeItem>, forcedDir?: 'better' | 'worse'): string => {
    const items = Object.values(itemsMap);
    if (items.length === 0) return '';

    return items.map(it => {
      let label = it.tier2Label;
      const effectiveDir = it.direction || (pillar === 'modalities' ? (forcedDir || activeDirection) : undefined);
      if (it.tier3Label) {
        label = `${it.tier2Label} (${it.tier3Label})`;
      } else if (effectiveDir === 'better' && !label.startsWith('>')) {
        label = `> ${label}`;
      } else if (effectiveDir === 'worse' && !label.startsWith('<')) {
        label = `< ${label}`;
      }
      return label;
    }).join(', ');
  };

  // Synchronize direction changes for modalities without explicit Tier 3 qualification
  React.useEffect(() => {
    if (pillar === 'modalities' && activeDirection) {
      setSelectedTier2Map(prev => {
        const items = Object.values(prev);
        if (items.length === 0) return prev;
        let changed = false;
        const next: Record<string, SelectedCascadeItem> = {};
        for (const [id, it] of Object.entries(prev)) {
          if (!it.tier3Id && it.direction !== activeDirection) {
            next[id] = { ...it, direction: activeDirection };
            changed = true;
          } else {
            next[id] = it;
          }
        }
        if (!changed) return prev;
        const synthesized = synthesizeText(next, activeDirection);
        onSelectionChange(Object.values(next), synthesized);
        return next;
      });
    }
  }, [activeDirection, pillar]);

  // Toggle Tier 2 selection (MULTI-SELECT)
  const handleToggleTier2 = (t2: CascadeTier2Option, cat: CascadeCategory) => {
    setSelectedTier2Map(prev => {
      const next = { ...prev };
      if (next[t2.id]) {
        // Deselect
        delete next[t2.id];
      } else {
        // Select (default direction to activeDirection for modalities)
        const initialDirection = t2.direction || (pillar === 'modalities' ? activeDirection : undefined);
        next[t2.id] = {
          categoryId: cat.id,
          categoryLabel: getLoc(cat.label),
          tier2Id: t2.id,
          tier2Label: getLoc(t2.label),
          direction: initialDirection,
          remedyHints: t2.remedyHints
        };
      }
      const synthesized = synthesizeText(next);
      onSelectionChange(Object.values(next), synthesized);
      return next;
    });
  };

  // Set explicit direction for a single selected modality item (e.g. > vs <)
  const handleSetItemDirection = (tier2Id: string, dir: 'better' | 'worse') => {
    setSelectedTier2Map(prev => {
      const current = prev[tier2Id];
      if (!current) return prev;
      const next = {
        ...prev,
        [tier2Id]: {
          ...current,
          direction: dir
        }
      };
      const synthesized = synthesizeText(next);
      onSelectionChange(Object.values(next), synthesized);
      return next;
    });
  };

  // Select or toggle Tier 3 for a specific Tier 2 option
  const handleSelectTier3 = (t2: CascadeTier2Option, t3: CascadeTier3Option, cat: CascadeCategory) => {
    setSelectedTier2Map(prev => {
      const current = prev[t2.id];
      const isSameT3 = current?.tier3Id === t3.id;

      const next = { ...prev };
      if (isSameT3) {
        // Deselect Tier 3 qualification, revert to base Tier 2
        next[t2.id] = {
          categoryId: cat.id,
          categoryLabel: getLoc(cat.label),
          tier2Id: t2.id,
          tier2Label: getLoc(t2.label),
          direction: t2.direction,
          remedyHints: t2.remedyHints
        };
      } else {
        // Apply Tier 3 qualification
        next[t2.id] = {
          categoryId: cat.id,
          categoryLabel: getLoc(cat.label),
          tier2Id: t2.id,
          tier2Label: getLoc(t2.label),
          tier3Id: t3.id,
          tier3Label: getLoc(t3.label),
          direction: t3.direction || t2.direction,
          remedyHints: t2.remedyHints
        };
      }
      const synthesized = synthesizeText(next);
      onSelectionChange(Object.values(next), synthesized);
      return next;
    });
  };

  const handleClearAll = () => {
    setSelectedTier2Map({});
    onSelectionChange([], '');
  };

  const selectedCount = Object.keys(selectedTier2Map).length;

  if (!pillarDef) return null;

  return (
    <div className="space-y-4">
      {/* Lead Question Indicator */}
      <div className="p-3 bg-teal-900/10 border border-teal-600/30 rounded-xl space-y-2">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-teal-700 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider block">
              {t('anamnesisDepthInvestigationTitle')}
            </span>
            {pillar === 'location' && pillarDef.leadQuestionRadiation ? (
              <div className="mt-1 space-y-1.5 text-xs text-slate-800">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-teal-800 shrink-0">1.</span>
                  <p className="font-semibold leading-snug">
                    {getLoc(pillarDef.leadQuestionLocation || pillarDef.leadQuestion)}
                  </p>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-teal-800 shrink-0">2.</span>
                  <p className="font-semibold leading-snug">
                    {getLoc(pillarDef.leadQuestionRadiation)}
                  </p>
                </div>
              </div>
            ) : pillar === 'modalities' && activeDirection === 'better' ? (
              <p className="text-xs font-semibold text-emerald-950 leading-snug mt-0.5">
                {t('cascadeFunnelModalitiesLeadBetter')}
              </p>
            ) : pillar === 'modalities' && activeDirection === 'worse' ? (
              <p className="text-xs font-semibold text-rose-950 leading-snug mt-0.5">
                {t('cascadeFunnelModalitiesLeadWorse')}
              </p>
            ) : (
              <p className="text-xs font-semibold text-slate-800 leading-snug mt-0.5">
                {getLoc(pillarDef.leadQuestion)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* DIRECTION BANNER FOR MODALITIES (nur anzeigen, wenn nicht fest durch activeDirection fixiert) */}
      {pillar === 'modalities' && onDirectionChange && !activeDirection && (
        <div className="p-3 bg-white rounded-xl border border-teal-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>{t('anamnesisModalitiesDirectionLabel')}</span>
            </label>
            <span className="text-[10px] text-slate-500 font-medium">
              {activeDirection === 'better' ? t('anamnesisDirectionBetter') : t('anamnesisDirectionWorse')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onDirectionChange('better')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeDirection === 'better'
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/30'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                &gt;
              </span>
              <span>{t('anamnesisModalitiesImprovementLong')}</span>
              {activeDirection === 'better' && <Check className="w-4 h-4 text-emerald-200 ml-auto" />}
            </button>

            <button
              type="button"
              onClick={() => onDirectionChange('worse')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeDirection === 'worse'
                  ? 'bg-rose-700 text-white shadow-sm ring-2 ring-rose-500/30'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-rose-50 hover:border-rose-300'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-black text-xs">
                &lt;
              </span>
              <span>{t('anamnesisModalitiesWorseningLong')}</span>
              {activeDirection === 'worse' && <Check className="w-4 h-4 text-rose-200 ml-auto" />}
            </button>
          </div>
        </div>
      )}

      {/* LEVEL 1: GROBE ORIENTIERUNG / HAUPTKATEGORIE */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-teal-700 text-white text-[10px] flex items-center justify-center font-bold">1</span>
            <span>{t('cascadeFunnelLevel1Title')}</span>
          </label>
          <span className="text-[10px] text-slate-500 font-medium">
            {t('cascadeFunnelLevel1Hint')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {filteredCategories.map((cat) => {
            const isCatActive = activeCategory?.id === cat.id;
            const itemsInCatCount = Object.values(selectedTier2Map).filter(it => it.categoryId === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isCatActive
                    ? 'bg-teal-800 text-white border-teal-900 shadow-xs ring-2 ring-teal-600/30'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                }`}
              >
                <span className="line-clamp-2">{getLoc(cat.label)}</span>
                {itemsInCatCount > 0 && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${
                    isCatActive ? 'bg-teal-600 text-white' : 'bg-teal-100 text-teal-800'
                  }`}>
                    {itemsInCatCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* LEVEL 2 & LEVEL 3: FEIN-DIFFERENZIERUNG & QUALIFIZIERUNG */}
      {activeCategory && (
        <div className="space-y-3 pt-2 border-t border-slate-200 animate-in fade-in duration-150">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-teal-700 text-white text-[10px] flex items-center justify-center font-bold">2</span>
              <label className="text-xs font-bold text-slate-800">
                {pillar === 'location'
                  ? t('cascadeFunnelLocationLevel2Title')
                  : pillar === 'mind'
                  ? t('cascadeFunnelMindLevel2Title')
                  : t('cascadeFunnelLevel2Title')}
              </label>
              <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md font-semibold border border-teal-200">
                {t('cascadeFunnelMultiSelectBadge')}
              </span>
            </div>

            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-teal-800 font-bold">
                  {t('cascadeFunnelSelectedCount', { count: selectedCount.toString() })}
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('cascadeFunnelClearLevel2')}</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {activeCategory.tier2Options.map((t2) => {
              const isSelected = !!selectedTier2Map[t2.id];
              const selectedEntry = selectedTier2Map[t2.id];
              const hasTier3 = t2.tier3Options && t2.tier3Options.length > 0;

              return (
                <div
                  key={t2.id}
                  className={`rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-teal-50/80 border-teal-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Tier 2 Option Checkbox / Button */}
                  <div
                    onClick={() => handleToggleTier2(t2, activeCategory)}
                    className="p-3 flex items-start gap-3 cursor-pointer select-none"
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? 'bg-teal-700 border-teal-800 text-white'
                        : 'border-slate-300 bg-white hover:border-teal-500'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-semibold ${
                          isSelected ? 'text-teal-950 font-bold' : 'text-slate-800'
                        }`}>
                          {getLoc(t2.label)}
                        </span>
                        {t2.direction === 'worse' && (
                          <span className="text-[11px] font-bold text-rose-600 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200">
                            &lt; {t('anamnesisModalitiesWorseTab')}
                          </span>
                        )}
                        {t2.direction === 'better' && (
                          <span className="text-[11px] font-bold text-emerald-600 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                            &gt; {t('anamnesisModalitiesBetterTab')}
                          </span>
                        )}
                      </div>

                      {t2.remedyHints && t2.remedyHints.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[10px] text-slate-400">Repertorium-Affinität:</span>
                          {t2.remedyHints.slice(0, 3).map((rem, idx) => (
                            <span key={idx} className="text-[9.5px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {rem}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* INLINE DIRECTION SWITCHER FOR MODALITIES (nur anzeigen, wenn nicht fest vorgegeben) */}
                      {pillar === 'modalities' && isSelected && !activeDirection && (
                        <div
                          className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-teal-200/60"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[10.5px] text-slate-600 font-semibold">{t('cascadeFunnelItemDirectionLabel')}</span>
                          <button
                            type="button"
                            onClick={() => handleSetItemDirection(t2.id, 'better')}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border flex items-center gap-1 cursor-pointer transition-all ${
                              (selectedEntry?.direction || activeDirection) === 'better'
                                ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                            }`}
                          >
                            <span className="font-black text-xs">&gt;</span>
                            <span>{t('anamnesisModalitiesBetterTab')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetItemDirection(t2.id, 'worse')}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border flex items-center gap-1 cursor-pointer transition-all ${
                              (selectedEntry?.direction || activeDirection) === 'worse'
                                ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50'
                            }`}
                          >
                            <span className="font-black text-xs">&lt;</span>
                            <span>{t('anamnesisModalitiesWorseTab')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* LEVEL 3: QUALIFIZIERUNG / AUSPRÄGUNG (Erscheint wenn Tier 2 aktiv ist und Tier 3 Optionen existieren) */}
                  {isSelected && hasTier3 && (
                    <div className="px-3 pb-3 pt-1 border-t border-teal-200/70 mt-1 space-y-1.5 bg-white/70 rounded-b-xl">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-teal-900">
                        <span className="w-3.5 h-3.5 rounded-full bg-teal-800 text-white text-[9px] flex items-center justify-center font-bold">3</span>
                        <span>
                          {pillar === 'location'
                            ? t('cascadeFunnelLocationLevel3Title')
                            : pillar === 'mind'
                            ? t('cascadeFunnelMindLevel3Title')
                            : t('cascadeFunnelLevel3Title')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {pillar === 'location'
                          ? t('cascadeFunnelLocationLevel3Hint')
                          : pillar === 'mind'
                          ? t('cascadeFunnelMindLevel3Hint')
                          : t('cascadeFunnelLevel3Hint')}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {t2.tier3Options!
                          .filter((t3) => {
                            if (pillar === 'modalities' && activeDirection) {
                              return !t3.direction || t3.direction === activeDirection;
                            }
                            return true;
                          })
                          .map((t3) => {
                          const isT3Active = selectedEntry?.tier3Id === t3.id;
                          return (
                            <button
                              key={t3.id}
                              type="button"
                              onClick={() => handleSelectTier3(t2, t3, activeCategory)}
                              className={`text-left p-2 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                                isT3Active
                                  ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/40'
                              }`}
                            >
                              <span className="text-[11px] leading-snug">{getLoc(t3.label)}</span>
                              {isT3Active && <Check className="w-3 h-3 text-teal-200 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
