import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Activity, 
  MapPin, 
  Flame, 
  Sliders, 
  Award, 
  Clock, 
  Quote, 
  Sparkles, 
  Layers, 
  Info 
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageCode } from '../types';
import { RepertoriumSymptomInput } from '../services/boerickeRepertoryService';
import { generateAdaptiveQuestions } from '../services/adaptiveAnamnesisEngine';

interface SymptomAuditTrailCardProps {
  symptom: RepertoriumSymptomInput;
  language: LanguageCode;
}

export const SymptomAuditTrailCard: React.FC<SymptomAuditTrailCardProps> = ({
  symptom,
  language
}) => {
  const { t } = useTranslation();

  const hasChief = Boolean(symptom.chiefComplaint?.trim());
  const hasLoc = Boolean(symptom.location?.trim());
  const hasSens = Boolean(symptom.sensation?.trim());
  const hasMod = Boolean(symptom.modalities?.trim());
  const hasConcom = Boolean(symptom.concomitants?.trim());
  const hasCausa = Boolean(symptom.causaEvent?.trim());

  // Calculate individualization percentage
  let confirmedCount = 0;
  if (hasChief) confirmedCount++;
  if (hasLoc) confirmedCount++;
  if (hasSens) confirmedCount++;
  if (hasMod) confirmedCount++;
  if (hasConcom) confirmedCount++;
  if (hasCausa) confirmedCount++;

  const totalDimensions = 6;
  const individualizationPercent = Math.round((confirmedCount / totalDimensions) * 100);

  // Determine dynamic adaptive question recommendation using the engine
  const adaptiveQuestions = generateAdaptiveQuestions(symptom, symptom.anamnesisDialogueSteps || [], language);
  const primaryAdaptiveRec = adaptiveQuestions.length > 0 ? adaptiveQuestions[0] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{t('repertoriumAuditTrailTitle')}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-400/30">
                Audit-Trail
              </span>
            </h3>
            <p className="text-[11px] text-teal-200/80">
              {t('repertoriumAuditTrailDesc')}
            </p>
          </div>
        </div>

        {/* Individualization Level Progress */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-teal-300 font-semibold block">
              {t('repertoriumIndividualizationLevel')}
            </span>
            <span className="text-base font-extrabold text-white">
              {individualizationPercent}% ({confirmedCount}/{totalDimensions})
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-teal-400/40 flex items-center justify-center bg-teal-900/40 text-teal-200 font-bold text-xs shadow-inner">
            {individualizationPercent}%
          </div>
        </div>
      </div>

      {/* Adaptive Next Question Suggestion if not 100% */}
      {primaryAdaptiveRec && (
        <div className="p-3 bg-teal-50/70 border-b border-teal-100 flex items-center gap-2.5 text-xs text-teal-950">
          <HelpCircle className="w-4 h-4 text-teal-700 shrink-0" />
          <div className="flex-1">
            <span className="font-bold text-teal-900 mr-1.5">
              {t('repertoriumNextAdaptiveQuestion')}
            </span>
            <span className="text-teal-800 font-semibold">
              [{primaryAdaptiveRec.pillarLabel}]: &bdquo;{primaryAdaptiveRec.text}&ldquo;
            </span>
          </div>
        </div>
      )}

      {/* Structured Evidence Table */}
      <div className="p-4 space-y-3">
        {/* Hauptbeschwerde */}
        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-[140px]">
            <Activity className="w-4 h-4 text-teal-700 shrink-0" />
            <span className="text-xs font-bold text-slate-800">
              {t('repertoriumPillarChiefComplaint')}
            </span>
          </div>

          <div className="flex-1">
            {hasChief ? (
              <div>
                <span className="text-xs font-semibold text-slate-900">
                  {symptom.chiefComplaint}
                </span>
                {symptom.chiefQuote && (
                  <span className="block text-[11px] text-amber-800 italic mt-0.5 flex items-center gap-1">
                    <Quote className="w-3 h-3 text-amber-600 inline shrink-0" />
                    &bdquo;{symptom.chiefQuote}&ldquo;
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">
                {t('repertoriumStatusUnknown')}
              </span>
            )}
          </div>

          <div>
            {hasChief ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                <CheckCircle2 className="w-3 h-3 text-teal-600" />
                {t('repertoriumStatusConfirmed')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {t('repertoriumStatusUnknown')}
              </span>
            )}
          </div>
        </div>

        {/* Säule 1: Lokalisation */}
        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-[140px]">
            <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800">
              {t('repertoriumPillar1Loc')}
            </span>
          </div>

          <div className="flex-1">
            {hasLoc ? (
              <div>
                <span className="text-xs font-semibold text-slate-900">
                  {symptom.location}
                </span>
                {symptom.locationQuote && (
                  <span className="block text-[11px] text-amber-800 italic mt-0.5 flex items-center gap-1">
                    <Quote className="w-3 h-3 text-amber-600 inline shrink-0" />
                    &bdquo;{symptom.locationQuote}&ldquo;
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">
                {t('repertoriumStatusUnknown')}
              </span>
            )}
          </div>

          <div>
            {hasLoc ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                <CheckCircle2 className="w-3 h-3 text-sky-600" />
                {t('repertoriumStatusConfirmed')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {t('repertoriumStatusUnknown')}
              </span>
            )}
          </div>
        </div>

        {/* Säule 2: Empfindung */}
        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-[140px]">
            <Flame className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800">
              {t('repertoriumPillar2Sens')}
            </span>
          </div>

          <div className="flex-1">
            {hasSens ? (
              <div>
                <span className="text-xs font-semibold text-slate-900">
                  {symptom.sensation}
                </span>
                {symptom.sensationQuote && (
                  <span className="block text-[11px] text-amber-800 italic mt-0.5 flex items-center gap-1">
                    <Quote className="w-3 h-3 text-amber-600 inline shrink-0" />
                    &bdquo;{symptom.sensationQuote}&ldquo;
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">
                {t('repertoriumStatusUnknown')}
              </span>
            )}
          </div>

          <div>
            {hasSens ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                <CheckCircle2 className="w-3 h-3 text-amber-600" />
                {t('repertoriumStatusConfirmed')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {t('repertoriumStatusUnknown')}
              </span>
            )}
          </div>
        </div>

        {/* Säule 3: Modalitäten */}
        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-[140px]">
            <Sliders className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800">
              {t('repertoriumPillar3Mod')}
            </span>
          </div>

          <div className="flex-1">
            {hasMod ? (
              <div>
                <span className="text-xs font-semibold text-slate-900">
                  {symptom.modalities}
                </span>
                {symptom.modalitiesQuote && (
                  <span className="block text-[11px] text-amber-800 italic mt-0.5 flex items-center gap-1">
                    <Quote className="w-3 h-3 text-amber-600 inline shrink-0" />
                    &bdquo;{symptom.modalitiesQuote}&ldquo;
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">
                {t('repertoriumStatusUnknown')}
              </span>
            )}
          </div>

          <div>
            {hasMod ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {t('repertoriumStatusConfirmed')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {t('repertoriumStatusUnknown')}
              </span>
            )}
          </div>
        </div>

        {/* Causa & Ereignis-Aufschlüsselung */}
        <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-700 shrink-0" />
              <span className="text-xs font-bold text-indigo-950">
                {t('repertoriumCausaSectionTitle')}
              </span>
            </div>
            {hasCausa ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300">
                <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                {t('repertoriumStatusConfirmed')}
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400">
                {t('repertoriumStatusNotSpecified')}
              </span>
            )}
          </div>

          {hasCausa ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-white border border-indigo-100 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  CONFIRMED EVENT
                </span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {symptom.causaEvent}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-indigo-100 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  TEMPORAL RELATION
                </span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {symptom.causaTemporal || 'Nicht näher spezifiziert'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-indigo-100 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  PATIENT REPORTED EFFECT
                </span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {symptom.causaEffect === 'worse' ? '< Schmerzen verstärkt' :
                   symptom.causaEffect === 'better' ? '> Schmerzen gebessert' :
                   symptom.causaEffect === 'unchanged' ? '= Unverändert' : 'Ungewiss'}
                </span>
                {symptom.causaQuote && (
                  <span className="text-[10px] text-amber-800 italic block mt-0.5">
                    &bdquo;{symptom.causaQuote}&ldquo;
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 italic">
              Kein Auslöse-Ereignis (Causa) erfasst. Die Beschwerden werden primär über Lokalisation, Empfindung und Modalitäten repertorisiert.
            </p>
          )}
        </div>

        {/* Säule 4: Begleitsymptome */}
        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-[140px]">
            <Award className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800">
              {t('repertoriumPillar4Concom')}
            </span>
          </div>

          <div className="flex-1">
            {hasConcom ? (
              <div>
                <span className="text-xs font-semibold text-slate-900">
                  {symptom.concomitants}
                </span>
                {symptom.concomitantsQuote && (
                  <span className="block text-[11px] text-amber-800 italic mt-0.5 flex items-center gap-1">
                    <Quote className="w-3 h-3 text-amber-600 inline shrink-0" />
                    &bdquo;{symptom.concomitantsQuote}&ldquo;
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">
                {t('repertoriumStatusUnknown')}
              </span>
            )}
          </div>

          <div>
            {hasConcom ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                <CheckCircle2 className="w-3 h-3 text-purple-600" />
                {t('repertoriumStatusConfirmed')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {t('repertoriumStatusUnknown')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Notice: Evidenzkette */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-teal-700 shrink-0" />
        <span>{t('repertoriumClearAuditNotice')}</span>
      </div>
    </div>
  );
};
