import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { TranslationKey } from '../i18n/translations';
import { Check, RefreshCw } from 'lucide-react';

export type LiveProcessStepStatus = 'pending' | 'active' | 'done';

export interface LiveProcessStep {
  id: string;
  labelKey: TranslationKey;
  status: LiveProcessStepStatus;
}

interface OrganonLiveProgressProps {
  steps: LiveProcessStep[];
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  titleKey?: TranslationKey;
  subTitleKey?: TranslationKey;
}

export const OrganonLiveProgress: React.FC<OrganonLiveProgressProps> = ({
  steps,
  className = '',
  orientation = 'vertical',
  titleKey = 'organonLiveProcessTitle',
  subTitleKey = 'organonLiveProcessSub'
}) => {
  const { t } = useTranslation();

  if (orientation === 'horizontal') {
    return (
      <div 
        id="organon-live-progress-horizontal"
        className={`p-4 rounded-xl bg-slate-900/95 border border-teal-500/30 shadow-lg backdrop-blur-xs transition-all ${className}`}
      >
        {/* Compact Header */}
        <div className="flex items-center gap-2.5 pb-2.5 mb-3 border-b border-slate-800">
          <div className="relative w-6 h-6 rounded-full border border-teal-500/30 flex items-center justify-center bg-teal-500/10 shrink-0">
            <RefreshCw className="w-3.5 h-3.5 text-teal-400 animate-spin" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-slate-100 tracking-tight">
              {t(titleKey)}
            </h4>
            <span className="text-[11px] text-slate-400">
              • {t(subTitleKey)}
            </span>
          </div>
        </div>

        {/* Horizontal Process Steps Flow from Left to Right */}
        <div className="flex flex-row items-center gap-2 sm:gap-3 w-full overflow-x-auto pb-1 pt-0.5">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const isActive = step.status === 'active';
            const isDone = step.status === 'done';
            const isPending = step.status === 'pending';

            return (
              <div key={step.id} className="flex items-center gap-2 shrink-0">
                {/* Status Indicator */}
                <div className="relative z-10 shrink-0">
                  {isDone && (
                    <div 
                      id={`step-indicator-${step.id}-done`}
                      className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  )}

                  {isActive && (
                    <div 
                      id={`step-indicator-${step.id}-active`}
                      className="relative w-5 h-5 rounded-full border-2 border-red-500/70 bg-red-500/10 flex items-center justify-center shadow-xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_6px_rgba(220,38,38,0.85)]" />
                    </div>
                  )}

                  {isPending && (
                    <div 
                      id={`step-indicator-${step.id}-pending`}
                      className="w-5 h-5 rounded-full border-2 border-slate-700 bg-transparent flex items-center justify-center"
                    />
                  )}
                </div>

                {/* Step Label */}
                <span 
                  className={`text-[11px] sm:text-xs whitespace-nowrap transition-colors ${
                    isActive 
                      ? 'font-bold text-white' 
                      : isDone 
                        ? 'font-medium text-slate-300' 
                        : 'text-slate-500 font-normal'
                  }`}
                >
                  {t(step.labelKey)}
                </span>

                {/* Horizontal connecting line to next step */}
                {!isLast && (
                  <div 
                    className={`w-3 sm:w-6 h-0.5 mx-1 transition-colors ${
                      isDone ? 'bg-emerald-500/50' : 'bg-slate-800'
                    }`} 
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div 
      id="organon-live-progress-container"
      className={`p-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-xs transition-all ${className}`}
    >
      {/* Header with quiet, continuous activity spinner */}
      <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="relative w-8 h-8 rounded-full border border-teal-500/30 flex items-center justify-center bg-teal-500/10 shrink-0">
          <RefreshCw className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-spin" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t(titleKey)}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {t(subTitleKey)}
          </p>
        </div>
      </div>

      {/* Ordered real-state execution steps */}
      <div className="mt-4 space-y-3">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isActive = step.status === 'active';
          const isDone = step.status === 'done';
          const isPending = step.status === 'pending';

          return (
            <div key={step.id} className="relative flex items-center gap-3">
              {/* Vertical connector line */}
              {!isLast && (
                <div 
                  className={`absolute left-[9.5px] top-6 bottom-[-14px] w-0.5 transition-colors ${
                    isDone ? 'bg-emerald-400/40 dark:bg-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}

              {/* Status Indicator:
                  - Done: Emerald circle with checkmark
                  - Active: Circle with inner pulsating red dot ("der punkt ist innen in einem kreis und pulsiert in roter farbe")
                  - Pending: Discreet grey circle
              */}
              <div className="relative z-10 shrink-0">
                {isDone && (
                  <div 
                    id={`step-indicator-${step.id}-done`}
                    className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                )}

                {isActive && (
                  <div 
                    id={`step-indicator-${step.id}-active`}
                    className="relative w-5 h-5 rounded-full border-2 border-red-500/70 bg-red-500/10 flex items-center justify-center shadow-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_6px_rgba(220,38,38,0.85)]" />
                  </div>
                )}

                {isPending && (
                  <div 
                    id={`step-indicator-${step.id}-pending`}
                    className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-transparent flex items-center justify-center"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                  </div>
                )}
              </div>

              {/* Step Label */}
              <div className="flex-1 min-w-0">
                <span 
                  className={`text-xs transition-colors block ${
                    isActive 
                      ? 'font-semibold text-slate-900 dark:text-white' 
                      : isDone 
                        ? 'font-medium text-slate-700 dark:text-slate-300' 
                        : 'text-slate-400 dark:text-slate-500 font-normal'
                  }`}
                >
                  {t(step.labelKey)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
