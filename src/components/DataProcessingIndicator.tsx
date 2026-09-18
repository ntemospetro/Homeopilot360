import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface DataProcessingIndicatorProps {
  title?: string;
  subtitle?: string;
  isOverlay?: boolean;
}

export const DataProcessingIndicator: React.FC<DataProcessingIndicatorProps> = ({
  title,
  subtitle,
  isOverlay = false,
}) => {
  const { t } = useTranslation();

  const displayTitle = title || t('dataProcessingTitle');
  const displaySubtitle = subtitle || t('dataProcessingSubtitle');

  const content = (
    <div
      id="data-processing-indicator"
      className="bg-white/95 backdrop-blur-md rounded-2xl border border-teal-200/80 shadow-lg p-6 max-w-md w-full mx-auto text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Animated Clock / Processing Emblem */}
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-700/20">
          <Clock className="w-7 h-7 animate-spin [animation-duration:3s]" />
        </div>
        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Text Hierarchy */}
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          {displayTitle}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
          {displaySubtitle}
        </p>
      </div>

      {/* High-Precision Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60 mt-1">
        <div className="h-full bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600 rounded-full animate-pulse w-full" />
      </div>
    </div>
  );

  if (isOverlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
        {content}
      </div>
    );
  }

  return content;
};
