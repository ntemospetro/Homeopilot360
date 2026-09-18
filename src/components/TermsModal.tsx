import React, { useState, useEffect } from 'react';
import { FileText, X, CheckCircle2, ShieldCheck, Scale, Globe } from 'lucide-react';
import { getTermsAndConditions } from '../services/storage';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageCode } from '../types';
import { LANGUAGES } from '../i18n/translations';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  const { language: currentLang, t } = useTranslation();
  const [modalLang, setModalLang] = useState<LanguageCode>(currentLang);

  // Sync modal language with app language when opened or when app language changes
  useEffect(() => {
    if (isOpen) {
      setModalLang(currentLang);
    }
  }, [isOpen, currentLang]);

  if (!isOpen) return null;

  const terms = getTermsAndConditions(modalLang);

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        return <div key={idx} className="h-3" />;
      }
      
      if (trimmed.startsWith('### ')) {
        const title = trimmed.replace('### ', '');
        return (
          <div key={idx} className="mt-5 mb-2.5 pb-1 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-teal-600 inline-block" />
              <span>{title}</span>
            </h3>
          </div>
        );
      }
      
      if (trimmed.startsWith('## ')) {
        const title = trimmed.replace('## ', '');
        return (
          <h2 key={idx} className="text-base font-bold text-slate-950 mt-6 mb-3">
            {title}
          </h2>
        );
      }

      if (trimmed === '---') {
        return <hr key={idx} className="my-4 border-slate-200" />;
      }

      if (trimmed.startsWith('- ')) {
        const item = trimmed.replace('- ', '');
        return (
          <li key={idx} className="ml-4 list-disc text-slate-700 text-xs leading-relaxed my-1">
            {renderInlineFormatting(item)}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs text-slate-700 leading-relaxed my-1.5">
          {renderInlineFormatting(trimmed)}
        </p>
      );
    });
  };

  const renderInlineFormatting = (text: string) => {
    // Process bold text like **bold**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        id="agb-modal-container"
        className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-xs"
      >
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {terms.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                <span>{t('termsModalStand', { date: terms.lastUpdated })}</span>
                <span>•</span>
                <span>{t('termsModalVersion', { version: terms.version })}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Switcher inside modal */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
              <select
                value={modalLang}
                onChange={(e) => setModalLang(e.target.value as LanguageCode)}
                className="bg-transparent text-[11px] font-medium text-slate-200 px-2 py-1 outline-none cursor-pointer"
                title={t('selectLanguage')}
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="bg-slate-800 text-white">
                    {l.flag} {l.nativeName}
                  </option>
                ))}
              </select>
            </div>

            <button
              id="close-agb-modal-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={t('termsModalClose')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Info Banner */}
        <div className="px-5 py-3 bg-teal-50/80 border-b border-teal-100 flex items-start gap-2.5 text-teal-950 shrink-0">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            {t('termsModalBanner')}
          </p>
        </div>

        {/* Scrollable AGB Body */}
        <div 
          id="agb-modal-scroll-body"
          className="p-5 sm:p-6 overflow-y-auto max-h-[60vh] space-y-1 bg-white select-text scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
        >
          {renderFormattedContent(terms.content)}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>{t('termsModalLegallyBinding')}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              {t('termsModalClose')}
            </button>
            {onAccept && (
              <button
                type="button"
                id="modal-accept-agb-btn"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('termsModalAccept')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
