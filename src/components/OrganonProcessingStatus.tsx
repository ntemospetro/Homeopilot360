import React from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export type OrganonTimelineStepStatus = 'pending' | 'active' | 'completed' | 'error';

export interface OrganonTimelineStep {
  id: string;
  label: string;
  status: OrganonTimelineStepStatus;
  subtext?: string;
}

export interface OrganonProcessingStatusProps {
  title: string;
  subtitle?: string;
  steps: OrganonTimelineStep[];
  error?: string | null;
  methodologicalNote?: string;
  fallbackNotice?: string;
  theme?: 'dark' | 'light';
  className?: string;
}

/**
 * OrganonProcessingStatus
 * 
 * Zentrale, wiederverwendbare Processing-/Warteanzeige für den gesamten Organon-Workflow:
 * - Stage 1
 * - Alle Stage-2-Kategorien
 * - Organon-Abschlussprüfung
 * - Restklärungsantworten
 * 
 * Visuelle Spezifikation:
 * - Kleiner, klarer roter Mittelpunkt (bleibt stabil an fester Position)
 * - Dünner roter Pulsring (expandiert ruhig nach außen und löst sich kontinuierlich bei Opacity 0 auf)
 * - Ruhige vertikale Status-Timeline (aktiv, abgeschlossen, ausstehend, fehler)
 * - Reale Statusankopplung (keine Fake-Timer, keine Fake-Prozente)
 * - Barrierefrei (aria-live="polite", sr-only Texte, Kontrast, prefers-reduced-motion)
 * - Keinerlei Layout-Shift durch absolute Ring-Positionierung im festen Container
 */
export const OrganonProcessingStatus: React.FC<OrganonProcessingStatusProps> = ({
  title,
  subtitle,
  steps,
  error,
  methodologicalNote,
  fallbackNotice,
  theme = 'dark',
  className = ''
}) => {
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full rounded-2xl border transition-all ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 to-slate-850 border-slate-700/80 shadow-xl text-slate-100'
          : 'bg-white border-slate-200/90 shadow-lg text-slate-800'
      } p-5 sm:p-6 space-y-5 ${className}`}
    >
      {/* Header Bereich */}
      <div className="space-y-1">
        <h3
          className={`text-base font-bold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className={`text-xs leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Fehleranzeige (Puls stoppt bei Fehlerzustand) */}
      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block">{t('organonProcessingStatusError')}</span>
            <span className="text-slate-300 block">{error}</span>
          </div>
        </div>
      )}

      {/* Fallback-Hinweis (Wahrheitsgemäße Darstellung bei lokalem Ausweichmodus) */}
      {fallbackNotice && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-amber-200/90 text-xs">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{fallbackNotice}</span>
        </div>
      )}

      {/* Vertikale Status-Timeline (Repräsentiert Status, nicht Zeit) */}
      <div className="space-y-0 relative py-1">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;

          // Status Badge Label für Screenreader
          const getStatusText = (status: OrganonTimelineStepStatus): string => {
            switch (status) {
              case 'active':
                return t('organonProcessingStatusActive');
              case 'completed':
                return t('organonProcessingStatusCompleted');
              case 'error':
                return t('organonProcessingStatusError');
              case 'pending':
              default:
                return t('organonProcessingStatusPending');
            }
          };

          return (
            <div key={step.id || idx} className="relative flex items-start gap-3.5 pb-4 last:pb-0">
              {/* Dünne vertikale Verbindungslinie zwischen Schritten */}
              {!isLast && (
                <div
                  className={`absolute left-3 top-6 w-0.5 -ml-[1px] bottom-0 ${
                    step.status === 'completed'
                      ? 'bg-emerald-500/40'
                      : isDark
                      ? 'bg-slate-700/60'
                      : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Status-Indikator Container (Feste 24x24 px Box verhindert Layout-Shifts) */}
              <div
                className="relative w-6 h-6 flex items-center justify-center shrink-0 overflow-visible z-10"
                aria-hidden="true"
              >
                {step.status === 'active' && (
                  <>
                    {/* Expandierender, kontinuierlich nach außen auflösender roter Pulsring */}
                    <span className="absolute w-3.5 h-3.5 rounded-full border border-rose-500/80 pointer-events-none animate-organon-pulse-ring" />
                    {/* Stabiler roter Mittelpunkt (bleibt an exakter Position) */}
                    <span className="relative w-2.5 h-2.5 rounded-full bg-rose-600 shadow-[0_0_6px_rgba(225,29,72,0.4)] animate-organon-dot" />
                  </>
                )}

                {step.status === 'completed' && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                )}

                {step.status === 'pending' && (
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isDark ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                  />
                )}

                {step.status === 'error' && (
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
                    <AlertCircle className="w-3 h-3 stroke-[2.5]" />
                  </div>
                )}
              </div>

              {/* Textuelle Beschreibung des Schritts */}
              <div className="flex-1 pt-0.5 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-xs font-semibold leading-snug ${
                      step.status === 'active'
                        ? isDark
                          ? 'text-white'
                          : 'text-slate-900'
                        : step.status === 'completed'
                        ? isDark
                          ? 'text-slate-300'
                          : 'text-slate-700'
                        : isDark
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="sr-only">({getStatusText(step.status)})</span>
                </div>
                {step.subtext && (
                  <p
                    className={`text-[11px] mt-0.5 leading-normal ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {step.subtext}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodischer Hinweis (Reine Information, kein Fake-Prozessschritt) */}
      {methodologicalNote && (
        <div
          className={`pt-3 border-t text-[11px] leading-relaxed flex items-center gap-2 ${
            isDark
              ? 'border-slate-800 text-slate-400'
              : 'border-slate-100 text-slate-500'
          }`}
        >
          <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>{methodologicalNote}</span>
        </div>
      )}
    </div>
  );
};
