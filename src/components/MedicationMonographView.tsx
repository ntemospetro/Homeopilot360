import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  ShieldCheck,
  FileText,
  Globe,
  Loader2,
  Pill,
  Clock,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { TranslationKey } from '../i18n/translations';
import { useLanguage } from '../i18n/LanguageContext';
import { localizeMonograph, fetchTranslatedMonograph } from '../services/medicationLocalization';

interface MedicationMonographViewProps {
  monographText: string;
  medName: string;
  activeSubstance?: string;
  authoritySource?: string;
  t: (key: TranslationKey | any) => string;
}

interface MonographSection {
  id: string;
  title: string;
  iconType: 'indication' | 'dosage' | 'sideEffects' | 'contraindications' | 'interactions' | 'general';
  paragraphs: string[];
}

// Helper to strip any corrupted replacement characters (U+FFFD), orphaned surrogates, or stray variation selectors
export const cleanMonographText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\uFFFD/g, '')
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
    .replace(/(?<![\u2600-\u27BF\uD83C-\uD83F])[\uFE0E\uFE0F]/g, '');
};

export const MedicationMonographView: React.FC<MedicationMonographViewProps> = ({
  monographText,
  medName,
  activeSubstance,
  authoritySource,
  t
}) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Keep a reference to the base German text so translations to any language are always accurate
  const baseTextRef = useRef<string>(cleanMonographText(monographText));
  if (
    monographText &&
    (monographText.includes('Wirkstoff') ||
      monographText.includes('Inhaltsstoffe') ||
      !baseTextRef.current)
  ) {
    baseTextRef.current = cleanMonographText(monographText);
  }

  // Initialize with immediate structural localization
  const [currentMonograph, setCurrentMonograph] = useState<string>(() => {
    if (!monographText) return '';
    const cleaned = cleanMonographText(monographText);
    return language === 'de' ? cleaned : cleanMonographText(localizeMonograph(cleaned, language));
  });

  // Whenever monographText or language changes, synchronize immediately and fetch complete translation
  useEffect(() => {
    const sourceText = cleanMonographText(baseTextRef.current || monographText);
    if (!sourceText) {
      setCurrentMonograph('');
      return;
    }

    if (language === 'de') {
      setCurrentMonograph(sourceText);
      setIsTranslating(false);
      return;
    }

    // Step 1: Instant localization with zero flicker
    const immediate = cleanMonographText(localizeMonograph(sourceText, language));
    setCurrentMonograph(immediate);

    // Step 2: Asynchronous AI translation via backend
    let isCancelled = false;
    setIsTranslating(true);

    fetchTranslatedMonograph(medName, sourceText, language)
      .then((translated) => {
        if (!isCancelled && translated) {
          setCurrentMonograph(cleanMonographText(translated));
        }
      })
      .catch((err) => {
        console.warn('[MedicationMonographView] Translation error:', err);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsTranslating(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [monographText, medName, language]);

  const activeText = cleanMonographText(currentMonograph || monographText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanMonographText(activeText));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  // Parse narrative monograph text into clean, structured sections matching Kompaktansicht
  const parseMonographText = (rawText: string): { intro: string; sections: MonographSection[] } => {
    const sanitized = cleanMonographText(rawText);
    if (!sanitized || !sanitized.trim()) {
      return { intro: '', sections: [] };
    }

    const lines = sanitized.split('\n');
    let intro = '';
    const sections: MonographSection[] = [];
    let currentSection: MonographSection | null = null;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = cleanMonographText(rawLine).trim();

      if (!trimmed) continue;

      // Check for introductory overview sentence before any section
      if (sections.length === 0 && !currentSection) {
        const isIntro =
          trimmed.startsWith('Hier ist die komplette Übersicht') ||
          trimmed.startsWith('Here is the complete') ||
          trimmed.startsWith('Εδώ είναι η πλήρης') ||
          trimmed.startsWith('Aquí está el resumen') ||
          trimmed.startsWith('Voici la vue') ||
          trimmed.startsWith('Ecco la panoramica') ||
          trimmed.startsWith('Вот полный обзор') ||
          (trimmed.toLowerCase().includes('vollständige fachinformation') && !trimmed.match(/^\d+\./));

        if (isIntro) {
          intro = cleanMonographText(trimmed);
          continue;
        }
      }

      // Detect section header:
      // Pattern 1: Numbered line (e.g. "1. Indikation und Pharmakologie: ...")
      // Pattern 2: Emoji marker (e.g. "📝 1. Wirkstoff...")
      // Pattern 3: Markdown heading (e.g. "## 1. ...")
      const isNumbered = /^\d+\.\s/.test(trimmed);
      const isEmoji = /^(?:[📝💊⚠️🚫❌]|\u26A0\uFE0F?)/u.test(trimmed);
      const isMd = /^#{1,4}\s/.test(trimmed);
      const isKnownSection =
        /^(Indikation|Wirkstoff|Dosierung|Verabreichung|Gegenanzeigen|Kontraindikationen|Warnhinweise|Nebenwirkungen|Toxikologie|Wechselwirkungen|Pharmakokinetik|Indication|Dosage|Side effects|Contraindications|Interactions)/i.test(
          trimmed
        ) && trimmed.length < 80;

      if (isNumbered || isEmoji || isMd || isKnownSection) {
        const cleanHeaderLine = cleanMonographText(
          trimmed
            .replace(/^#{1,4}\s*/, '')
            .replace(/^(?:[📝💊🚫❌]|⚠️|\u26A0\uFE0F?|\uFE0F|\uFFFD)\s*/u, '')
        ).trim();

        let title = cleanHeaderLine;
        let inlineContent = '';

        // If title and content are separated by colon (e.g. "1. Indikation und Pharmakologie: Magnesium ist...")
        const colonIdx = cleanHeaderLine.indexOf(':');
        if (colonIdx > 0 && colonIdx < 55) {
          title = cleanMonographText(cleanHeaderLine.slice(0, colonIdx)).trim();
          inlineContent = cleanMonographText(cleanHeaderLine.slice(colonIdx + 1)).trim();
        }

        // Determine icon type from title
        const lower = title.toLowerCase();
        let iconType: MonographSection['iconType'] = 'general';
        if (
          lower.includes('indikation') ||
          lower.includes('wirkstoff') ||
          lower.includes('inhaltsstoff') ||
          lower.includes('pharmakolog') ||
          lower.includes('indication') ||
          lower.includes('substance') ||
          lower.includes('ουσί') ||
          lower.includes('ένδειξ')
        ) {
          iconType = 'indication';
        } else if (
          lower.includes('dosier') ||
          lower.includes('anwend') ||
          lower.includes('verabreich') ||
          lower.includes('dosage') ||
          lower.includes('administr') ||
          lower.includes('δοσολογ') ||
          lower.includes('posologie')
        ) {
          iconType = 'dosage';
        } else if (
          lower.includes('nebenwirkung') ||
          lower.includes('toxikolog') ||
          lower.includes('adverse') ||
          lower.includes('side effect') ||
          lower.includes('indésirables') ||
          lower.includes('ανεπιθύμητ')
        ) {
          iconType = 'sideEffects';
        } else if (
          lower.includes('kontraindikation') ||
          lower.includes('gegenanzeig') ||
          lower.includes('warnhinweis') ||
          lower.includes('contraindication') ||
          lower.includes('warning') ||
          lower.includes('mise en garde') ||
          lower.includes('αντένδειξ')
        ) {
          iconType = 'contraindications';
        } else if (
          lower.includes('wechselwirkung') ||
          lower.includes('interaktion') ||
          lower.includes('pharmakokinetik') ||
          lower.includes('interaction') ||
          lower.includes('αλληλεπίδρασ')
        ) {
          iconType = 'interactions';
        }

        currentSection = {
          id: `sec-${sections.length + 1}`,
          title,
          iconType,
          paragraphs: inlineContent ? [inlineContent] : []
        };
        sections.push(currentSection);
      } else if (currentSection) {
        currentSection.paragraphs.push(cleanMonographText(trimmed));
      } else {
        if (!intro) {
          intro = cleanMonographText(trimmed);
        } else {
          currentSection = {
            id: 'sec-general',
            title: t('medMonographOverview' as TranslationKey) || 'Fachinformation & Monographie',
            iconType: 'general',
            paragraphs: [cleanMonographText(trimmed)]
          };
          sections.push(currentSection);
        }
      }
    }

    // Fallback if no structured sections could be parsed
    if (sections.length === 0) {
      const fallbackParas = sanitized
        .split(/\n\s*\n/)
        .map((p) => cleanMonographText(p).trim())
        .filter(Boolean);
      sections.push({
        id: 'sec-fallback',
        title: t('medMonographOverview' as TranslationKey) || 'Fachinformation & Monographie',
        iconType: 'general',
        paragraphs: fallbackParas
      });
      intro = '';
    }

    return { intro, sections };
  };

  const { intro, sections } = parseMonographText(activeText);

  // Render individual paragraph inside section card matching Kompaktansicht font and styling
  const renderParagraph = (pText: string, pIdx: number) => {
    const trimmed = cleanMonographText(pText).trim();
    if (!trimmed) return null;

    // Bullet point item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      const clean = trimmed.replace(/^[-*•]\s*/, '');
      return (
        <div key={pIdx} className="flex items-start gap-2 pl-0.5 text-slate-700">
          <span className="text-teal-600 font-bold mt-0.5 select-none">•</span>
          <span className="font-normal text-xs sm:text-[13px] leading-relaxed">{clean}</span>
        </div>
      );
    }

    // Label with colon prefix (e.g. "Hauptwirkstoff: Magnesium" or "Sehr häufig: Diarrhö")
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0 && colonIdx <= 55) {
      const prefix = trimmed.slice(0, colonIdx + 1);
      const rest = trimmed.slice(colonIdx + 1).trim();

      return (
        <div key={pIdx} className="text-xs sm:text-[13px] text-slate-700 leading-relaxed pl-0.5">
          <strong className="font-semibold text-slate-900">{prefix} </strong>
          <span className="font-normal text-slate-700">{rest}</span>
        </div>
      );
    }

    // Normal text paragraph: clean, normal weight, identical font family and size to Kompaktansicht
    return (
      <p key={pIdx} className="text-xs sm:text-[13px] text-slate-700 font-normal leading-relaxed pl-0.5">
        {trimmed}
      </p>
    );
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Top Header Card: Title, substance badge, translation indicator & Copy action */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FileText className="w-4 h-4 text-teal-700 shrink-0" />
          <span className="font-bold text-xs sm:text-sm text-slate-800">
            {t('medMonographOverview' as TranslationKey) || 'Vollständige Fachinformation & Monographie'}
          </span>
          {activeSubstance && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80 font-medium">
              {activeSubstance}
            </span>
          )}
          {language !== 'de' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-semibold flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-600" />
              <span>{t('medTranslatedBadge' as TranslationKey) || 'Lokalisiert'}</span>
            </span>
          )}
          {isTranslating && (
            <span className="text-[10px] text-teal-700 font-medium flex items-center gap-1 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{t('medMonographTranslating' as TranslationKey) || 'Übersetzung wird synchronisiert...'}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title={t('medCopyMonograph' as TranslationKey) || 'Volltext kopieren'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">
                  {t('medMonographCopied' as TranslationKey) || 'Kopiert!'}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>{t('medCopyMonograph' as TranslationKey) || 'Volltext kopieren'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Authority Notice Banner (Identical to Kompaktansicht) */}
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100/80 px-3.5 py-2.5 rounded-xl border border-slate-200">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
        <span>
          {t('medNoHallucinationNotice' as TranslationKey) ||
            'Strikte behördliche Datenbasis: Es werden keine Daten erfunden oder abgeleitet.'}
        </span>
      </div>

      {/* Intro Summary Note if present */}
      {intro && (
        <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/70 text-xs sm:text-[13px] text-teal-950 font-normal leading-relaxed">
          {intro}
        </div>
      )}

      {/* Structured Section Cards: Formatted, spaced, and styled identical to Kompaktansicht */}
      {sections.map((sec, sIdx) => {
        const isInteractions = sec.iconType === 'interactions';
        const isContraindications = sec.iconType === 'contraindications';
        const isSideEffects = sec.iconType === 'sideEffects';
        const isDosage = sec.iconType === 'dosage';

        return (
          <div
            key={sec.id || sIdx}
            className={`bg-white p-4 rounded-xl border shadow-2xs space-y-3 ${
              isInteractions ? 'border-rose-200/80' : 'border-slate-200'
            }`}
          >
            {/* Header with uppercase tracking-wider label & matching icon */}
            <h3
              className={`font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${
                isInteractions ? 'text-rose-900' : 'text-slate-700'
              }`}
            >
              {isDosage && <Clock className="w-4 h-4 text-teal-600 shrink-0" />}
              {isSideEffects && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
              {isContraindications && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
              {isInteractions && <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />}
              {!isDosage && !isSideEffects && !isContraindications && !isInteractions && (
                <Pill className="w-4 h-4 text-teal-600 shrink-0" />
              )}
              <span>{sec.title}</span>
            </h3>

            {/* Paragraphs in clean, normal-weight text */}
            <div className="space-y-2.5 text-xs sm:text-[13px] text-slate-700 font-normal leading-relaxed">
              {sec.paragraphs.map((para, pIdx) => renderParagraph(para, pIdx))}
            </div>
          </div>
        );
      })}

      {/* Footer Authority Badge (Identical to Kompaktansicht) */}
      <div className="px-3.5 py-2.5 bg-slate-100/70 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {t('medStrictAuthorityBadge' as TranslationKey) || 'Geprüfte Fachinformation (ohne freie Ergänzungen)'}
          </span>
        </div>
        {authoritySource && (
          <span className="text-slate-500 font-mono text-[10px]">
            {authoritySource}
          </span>
        )}
      </div>
    </div>
  );
};
