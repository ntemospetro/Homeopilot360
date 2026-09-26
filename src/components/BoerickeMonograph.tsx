import React, { useState, useEffect } from 'react';
import { 
  fetchBoerickeRemedyInfo, 
  fetchBoerickeMonograph, 
  BoerickeMonograph as IBoerickeMonograph,
  BoerickeSection
} from '../services/boerickeService';
import { useTranslation } from '../i18n/LanguageContext';
import { Loader2, BookOpen, AlertCircle, Info, Flame, Snowflake, HeartPulse, Brain, Tag } from 'lucide-react';

interface BoerickeMonographProps {
  remedyAbbrev: string;
  remedyName?: string;
  remedyId?: number;
}

export const BoerickeMonograph: React.FC<BoerickeMonographProps> = ({ remedyAbbrev, remedyName, remedyId: initialId }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monograph, setMonograph] = useState<IBoerickeMonograph | null>(null);
  const [activeRid, setActiveRid] = useState<number | null>(initialId || null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    async function loadData() {
      console.log(`[BoerickeMonograph] Loading data for:`, { remedyAbbrev, remedyName, initialId });
      setLoading(true);
      setError(null);
      try {
        let rid = initialId;
        
        if (!rid) {
          if (remedyName) {
            console.log(`[BoerickeMonograph] Trying lookup by name: ${remedyName}`);
            const info = await fetchBoerickeRemedyInfo(remedyName);
            if (info) {
              rid = info.id;
              console.log(`[BoerickeMonograph] Found ID by name: ${rid}`);
            }
          }
          
          if (!rid && remedyAbbrev) {
            console.log(`[BoerickeMonograph] Trying lookup by abbrev/slug: ${remedyAbbrev}`);
            const info = await fetchBoerickeRemedyInfo(String(remedyAbbrev));
            if (info) {
              rid = info.id;
              console.log(`[BoerickeMonograph] Found ID by abbrev/slug: ${rid}`);
            }
          }
        }

        if (isMounted) setActiveRid(rid || null);

        if (rid) {
          console.log(`[BoerickeMonograph] Fetching monograph for ID: ${rid}`);
          const data = await fetchBoerickeMonograph(rid);
          console.log(`[BoerickeMonograph] Monograph data received:`, data ? `Yes (${data.sections.length} sections)` : 'No');
          
          if (isMounted) {
            if (data && data.sections && data.sections.length > 0) {
              setMonograph(data);
            } else {
              setError('HISTORICAL_NOT_FOUND');
            }
          }
      } else {
        console.log(`[BoerickeMonograph] No ID found for remedy.`);
        if (isMounted) {
          setError('HISTORICAL_NOT_FOUND');
        }
      }
    } catch (err) {
      console.error("[BoerickeMonograph] Error loading data:", err);
      if (isMounted) setError('Fehler beim Laden der Boericke-Daten.');
    } finally {
      if (isMounted) setLoading(false);
    }
  }

  loadData();
  return () => { isMounted = false; };
}, [remedyAbbrev, remedyName, initialId, t, retryCount]);

if (loading) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      <p className="text-sm text-slate-500 font-medium">{t('boerickeLoading') || 'Boericke-Daten werden geladen...'}</p>
    </div>
  );
}

if (error === 'HISTORICAL_NOT_FOUND' || (activeRid && !monograph)) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
        <Info className="w-6 h-6 text-slate-400" />
      </div>
      <div className="space-y-2 max-w-sm">
        <p className="text-sm text-slate-900 font-bold">Nicht im Boericke-Handbuch enthalten</p>
        <p className="text-xs text-slate-600 leading-relaxed">
          Das historische Pocket Manual von William Boericke enthält ausführliche Beschreibungen für ca. 700 Arzneien. 
          Dieses Mittel ({remedyName || remedyAbbrev}) ist in diesem speziellen Werk nicht detailliert beschrieben.
        </p>
        <div className="pt-2">
          <p className="text-xs font-semibold text-teal-700 bg-teal-50 py-1.5 px-3 rounded-lg inline-block">
            Nutzen Sie den Tab "Standard" für die modernen Daten.
          </p>
        </div>
      </div>
    </div>
  );
}

if (error || !monograph) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-slate-400" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-slate-600 font-semibold">{error || 'Materia Medica nicht verfügbar.'}</p>
          <p className="text-xs text-slate-400">Arznei: {remedyName || remedyAbbrev || 'Unbekannt'}</p>
        </div>
        <button 
          onClick={() => setRetryCount(prev => prev + 1)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  const getIconForSection = (heading: string) => {
    const h = heading.toLowerCase();
    if (h.includes('mind') || h.includes('mental')) return <Brain className="w-4 h-4 text-purple-500" />;
    if (h.includes('head') || h.includes('eyes') || h.includes('ears')) return <Info className="w-4 h-4 text-blue-500" />;
    if (h.includes('heart') || h.includes('respiratory') || h.includes('chest')) return <HeartPulse className="w-4 h-4 text-rose-500" />;
    if (h.includes('modalit')) return <Flame className="w-4 h-4 text-amber-500" />;
    if (h.includes('relation')) return <BookOpen className="w-4 h-4 text-teal-500" />;
    if (h.includes('dose')) return <Tag className="w-4 h-4 text-slate-500" />;
    return <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-serif">{monograph.title}</h3>
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">William Boericke Pocket Manual</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {monograph.sections.map((section, idx) => {
            // Skip the first section if it's just the remedy name (depth 0)
            if (section.depth === 0 && idx === 0) return null;
            
            const isMainCategory = section.depth === 1;

            return (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border transition-all ${
                  isMainCategory 
                    ? 'bg-white border-slate-200 shadow-sm' 
                    : 'bg-slate-50/50 border-slate-100 ml-4'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isMainCategory && getIconForSection(section.heading)}
                  <h4 className={`font-bold text-slate-900 ${isMainCategory ? 'text-xs uppercase tracking-wider' : 'text-sm'}`}>
                    {section.heading}
                  </h4>
                </div>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </div>
              </div>
            );
        })}
      </div>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-800 leading-relaxed italic">
        <strong>Hinweis:</strong> William Boericke's Pocket Manual ist ein historisches Werk der klinischen Homöopathie. Die Angaben dienen der Information für qualifizierte Therapeuten.
      </div>
    </div>
  );
};
