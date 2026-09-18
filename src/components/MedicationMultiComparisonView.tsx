import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { TranslationKey } from '../i18n/translations';
import { PatientCase, PatientLifestyleData, MedicationRiskAnalysisResult, LanguageCode } from '../types';
import {
  generateDeterministicClinicalComparison,
  formatLocalizedTriageLabel,
  runClinicalMedicationComparison,
  evaluatePharmacokineticsAndConstitution,
  evaluateLifestyleInteractions,
} from '../services/clinicalPharmacologyEngine';
import { exportMedicationRiskComparisonPDF } from '../services/pdfExportService';
import { fetchTranslatedComparison } from '../services/medicationLocalization';
import { evaluateAmtsMedications } from '../services/amtsDosageEngine';
import { getPatientCases, getTariffAccessForTherapist } from '../services/storage';
import {
  Scale,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Flame,
  Wine,
  Baby,
  Activity,
  Pill,
  Copy,
  Check,
  Printer,
  ChevronDown,
  Loader2,
  HeartPulse,
  Ruler,
  Sparkles,
  FileDown,
  Globe,
  FileText,
  Minus,
  Plus,
  User,
  UserPlus,
  Search,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const cleanTriageLabel = (label?: string) => {
  if (!label) return '';
  return label
    .replace(/[🟢🔴🟡🟠⚪️⚫️🔵•·●]/g, '')
    .replace(/\[\s+/g, '[')
    .replace(/\s+\]/g, ']')
    .trim();
};

const sanitizeMarkdownContent = (content?: string) => {
  if (!content) return '';
  let text = content.replace(/\r\n/g, '\n');
  // Remove markdown code fences if wrapped
  text = text.replace(/^```(?:markdown)?\s*\n/i, '').replace(/\n```\s*$/i, '');
  // Clean up empty lines between table rows
  text = text.replace(/(\|\s*\n)\s*\n+(\s*\|)/g, '$1$2');

  // Filter out any orphan table delimiter rows (e.g. | :--- | :--- | :--- |) appearing outside a proper table
  const lines = text.split('\n');
  const sanitizedLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isDelimiter = /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(line);
    if (isDelimiter) {
      const prevLine = i > 0 ? lines[i - 1].trim() : '';
      const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
      const prevIsPipeRow = prevLine.includes('|') && !/^\|?(\s*:?-+:?\s*\|)+/.test(prevLine);
      const nextIsPipeRow = nextLine.includes('|');
      if (!prevIsPipeRow && !nextIsPipeRow) {
        continue;
      }
    }
    sanitizedLines.push(lines[i]);
  }
  return sanitizedLines.join('\n');
};

interface Props {
  currentCase: Partial<PatientCase>;
  onUpdateCase?: (updatedCase: Partial<PatientCase>) => void;
  onOpenMedicationsModal?: () => void;
  onClose?: () => void;
}

export const MedicationMultiComparisonView: React.FC<Props> = ({
  currentCase,
  onUpdateCase,
  onOpenMedicationsModal,
}) => {
  const { t, language } = useTranslation();
  const tariffAccess = getTariffAccessForTherapist();
  const meds = currentCase.medikamenteList || [];
  const [pdfBlockedError, setPdfBlockedError] = useState(false);

  // Parse birth year or age
  const patientAge = useMemo(() => {
    if (currentCase.patientAge !== undefined && currentCase.patientAge !== null) {
      return currentCase.patientAge;
    }
    if (!currentCase.patientBirthDate) return null;
    const birth = new Date(currentCase.patientBirthDate);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age >= 0 && age <= 130 ? age : null;
  }, [currentCase.patientAge, currentCase.patientBirthDate]);

  // Initial lifestyle state extracted from patientCase or defaults
  const [lifestyle, setLifestyle] = useState<PatientLifestyleData>(() => {
    const existing = currentCase.lifestyleData;
    const initialWeight = existing?.bodyWeightKg || currentCase.patientWeightKg || (() => {
      const gStr = currentCase.befundDetails?.gewicht || '';
      const m = gStr.match(/(\d+([.,]\d+)?)/);
      return m ? Math.round(parseFloat(m[1].replace(',', '.'))) : 70;
    })();

    const initialHeight = existing?.bodyHeightCm || currentCase.patientHeightCm || (() => {
      const hStr = currentCase.befundDetails?.groesse || '';
      const m = hStr.match(/(\d+([.,]\d+)?)/);
      return m ? Math.round(parseFloat(m[1].replace(',', '.'))) : 170;
    })();

    const initialBmi = initialHeight > 0 && initialWeight > 0
      ? parseFloat((initialWeight / ((initialHeight / 100) ** 2)).toFixed(1))
      : undefined;

    const isSmokerBool = existing?.isSmoker !== undefined 
      ? existing.isSmoker 
      : existing?.smokingStatus === 'smoker';

    const isAlcoholDailyBool = existing?.alcoholDaily !== undefined 
      ? existing.alcoholDaily 
      : existing?.alcoholFrequency === 'daily';

    return {
      smokingStatus: isSmokerBool ? 'smoker' : 'non-smoker',
      isSmoker: isSmokerBool,
      cigarettesPerDay: 0,
      alcoholFrequency: isAlcoholDailyBool ? 'daily' : 'never',
      alcoholDaily: isAlcoholDailyBool,
      alcoholBeverageType: 'wine',
      alcoholAmount: isAlcoholDailyBool ? 1 : 0,
      alcoholUnit: 'glasses',
      alcoholVolumePercent: 12,
      alcoholPureMgPerDay: 0,
      alcoholSummaryText: isAlcoholDailyBool 
        ? 'Alkoholkonsum angegeben' 
        : 'Kein Alkoholkonsum',
      isPregnant: existing?.isPregnant !== undefined ? existing.isPregnant : Boolean(currentCase.isPregnant),
      pregnancyMonth: existing?.pregnancyMonth || currentCase.pregnancyMonth || 1,
      bodyWeightKg: initialWeight,
      bodyHeightCm: initialHeight,
      bmi: initialBmi,
    };
  });

  // Analysis & pending change state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MedicationRiskAnalysisResult | null>(
    currentCase.medicationRiskAnalysis || null
  );
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Save changes back to parent case and mark pending changes
  const saveLifestyleChanges = (updated: PatientLifestyleData) => {
    const w = updated.bodyWeightKg || 70;
    const h = updated.bodyHeightCm || 170;
    const computedBmi = (h > 0 && w > 0)
      ? parseFloat((w / ((h / 100) ** 2)).toFixed(1))
      : undefined;

    const finalData: PatientLifestyleData = {
      ...updated,
      bmi: computedBmi,
    };

    setLifestyle(finalData);
    setHasPendingChanges(true);
    if (onUpdateCase) {
      onUpdateCase({
        ...currentCase,
        patientWeightKg: finalData.bodyWeightKg,
        patientHeightCm: finalData.bodyHeightCm,
        isPregnant: finalData.isPregnant,
        pregnancyMonth: finalData.pregnancyMonth,
        lifestyleData: finalData,
      });
    }
  };

  // Immediate deterministic baseline evaluation
  const baselineTriage = useMemo(() => {
    return generateDeterministicClinicalComparison(currentCase, lifestyle, language as LanguageCode);
  }, [currentCase, lifestyle, language]);

  const currentWeight = lifestyle.bodyWeightKg || 70;
  const currentHeight = lifestyle.bodyHeightCm || 170;

  const bmiDetails = useMemo(() => {
    if (!currentHeight || !currentWeight || currentHeight <= 0) return null;
    const heightM = currentHeight / 100;
    const value = parseFloat((currentWeight / (heightM * heightM)).toFixed(1));

    let categoryKey: TranslationKey = 'medComparisonBmiNormal';
    let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

    if (value < 18.5) {
      categoryKey = 'medComparisonBmiUnderweight';
      badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (value < 25.0) {
      categoryKey = 'medComparisonBmiNormal';
      badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (value < 30.0) {
      categoryKey = 'medComparisonBmiOverweight';
      badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
    } else {
      categoryKey = 'medComparisonBmiObese';
      badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
    }

    return {
      value,
      categoryKey,
      badgeClass,
    };
  }, [currentWeight, currentHeight]);

  // Pharmacokinetic impact based on constitution and prescribed drugs
  const pkEvaluation = useMemo(() => {
    return evaluatePharmacokineticsAndConstitution(
      meds.map(m => ({ name: m.name, substance: m.wirkstoff, dosierung: m.dosierung })),
      currentWeight,
      currentHeight,
      bmiDetails?.value,
      language as LanguageCode
    );
  }, [meds, currentWeight, currentHeight, bmiDetails?.value, language]);

  // Binary lifestyle interactions evaluation (alcohol, smoking, pregnancy)
  const lifestyleEvaluation = useMemo(() => {
    const isSmk = Boolean(lifestyle.isSmoker || lifestyle.smokingStatus === 'smoker');
    const hasAlc = Boolean(lifestyle.alcoholDaily || lifestyle.alcoholFrequency === 'daily' || (lifestyle.alcoholFrequency && lifestyle.alcoholFrequency !== 'never'));
    return evaluateLifestyleInteractions(
      meds.map(m => ({ name: m.name, substance: m.wirkstoff, dosierung: m.dosierung })),
      isSmk,
      hasAlc,
      Boolean(lifestyle.isPregnant),
      lifestyle.pregnancyMonth || 1,
      language as LanguageCode
    );
  }, [meds, lifestyle.isSmoker, lifestyle.smokingStatus, lifestyle.alcoholDaily, lifestyle.alcoholFrequency, lifestyle.isPregnant, lifestyle.pregnancyMonth, language]);

  // Detect external changes to medications list
  const prevMedsRef = useRef(JSON.stringify(meds));
  useEffect(() => {
    const currentSerialized = JSON.stringify(meds);
    if (prevMedsRef.current !== currentSerialized) {
      prevMedsRef.current = currentSerialized;
      setHasPendingChanges(true);
    }
  }, [meds]);

  // Quantitative AMTS Dosage Evaluation (Overdose, Organ Impact, Standard Max Doses)
  const amtsEvaluation = useMemo(() => {
    return evaluateAmtsMedications(meds, patientAge, currentWeight);
  }, [meds, patientAge, currentWeight]);

  // Patient Selection & Simulation modal states
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: 45,
    gender: 'weiblich' as 'männlich' | 'weiblich' | 'divers',
  });

  const storedPatients = useMemo(() => {
    return getPatientCases();
  }, [isPatientModalOpen]);

  const filteredPatients = useMemo(() => {
    if (!patientSearchTerm.trim()) return storedPatients;
    const q = patientSearchTerm.toLowerCase();
    return storedPatients.filter(p =>
      (p.patientName || '').toLowerCase().includes(q) ||
      (p.hauptbeschwerde || '').toLowerCase().includes(q)
    );
  }, [storedPatients, patientSearchTerm]);

  const handleSelectPatient = (p: PatientCase) => {
    if (onUpdateCase) {
      onUpdateCase(p);
    }
    setIsPatientModalOpen(false);
    setHasPendingChanges(true);
  };

  const handleCreateNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.name.trim()) return;
    const newCase: Partial<PatientCase> = {
      id: `sim-${Date.now()}`,
      patientName: newPatientForm.name.trim(),
      patientAge: Number(newPatientForm.age) || 45,
      patientGender: newPatientForm.gender,
      medikamenteList: [...meds],
      lifestyleData: {
        ...lifestyle,
      },
    };
    if (onUpdateCase) {
      onUpdateCase(newCase);
    }
    setIsNewPatientModalOpen(false);
    setNewPatientForm({ name: '', age: 45, gender: 'weiblich' });
    setHasPendingChanges(true);
  };

  // Active result displayed
  const activeResult: MedicationRiskAnalysisResult = analysisResult || baselineTriage;

  // Ensure report matches the active UI language
  useEffect(() => {
    const text = activeResult?.markdownContent;
    if (!text) return;

    if (language === 'de') {
      const isForeign = text.includes('⚠️ ΣΗΜΑΝΤΙΚΗ') || text.includes('⚠️ IMPORTANT') || text.includes('1. ΚΛΙΝΙΚΗ') || text.includes('1. CLINICAL');
      if (isForeign) {
        const localized = generateDeterministicClinicalComparison(currentCase, lifestyle, 'de');
        setAnalysisResult(localized);
      }
      return;
    }

    // Check if the current report contains German headers while non-German UI is active
    const hasGermanHeaders = text.includes('Evidenzbasierte') || 
                             text.includes('Risikobewertung') || 
                             text.includes('Klinische') ||
                             text.includes('WICHTIGER MEDIZINISCHER WARNHINWEIS') ||
                             text.includes('ARZNEIMITTEL-WECHSELWIRKUNGEN') ||
                             text.includes('DIAGNOSTISCHE CHECKLISTE');
    if (hasGermanHeaders) {
      // Instantly generate localized clinical comparison in the active language
      const localized = generateDeterministicClinicalComparison(currentCase, lifestyle, language as LanguageCode);
      setAnalysisResult(localized);
    }
  }, [language, activeResult?.analyzedAt, currentCase, lifestyle]);

  // Trigger deep clinical analysis
  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await runClinicalMedicationComparison(currentCase, lifestyle, language as LanguageCode);
      setAnalysisResult(res);
      if (onUpdateCase) {
        onUpdateCase({
          ...currentCase,
          lifestyleData: lifestyle,
          medicationRiskAnalysis: res,
        });
      }
      setHasPendingChanges(false);
    } catch (err) {
      console.error('Analysis error:', err);
      setHasPendingChanges(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyAnalysis = () => {
    if (!activeResult?.markdownContent) return;
    navigator.clipboard.writeText(activeResult.markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    if (tariffAccess.pagePermissions.pdfExport === false) {
      setPdfBlockedError(true);
      return;
    }
    setIsExportingPdf(true);
    try {
      await exportMedicationRiskComparisonPDF({
        patientCase: currentCase,
        lifestyle,
        result: activeResult,
        language: language as LanguageCode,
        download: true,
      });
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Trimester info
  const trimesterInfo = useMemo(() => {
    const month = lifestyle.pregnancyMonth || 1;
    if (month <= 3) {
      return {
        number: 1,
        title: t('medComparisonPregnancyMonth1' as TranslationKey) || '1. Trimenon (Monat 1–3)',
        phaseKey: 'medComparisonTrimesterOrgano' as TranslationKey,
        badgeColor: 'bg-red-50 text-red-700 border-red-200',
      };
    } else if (month <= 6) {
      return {
        number: 2,
        title: t('medComparisonPregnancyMonth4' as TranslationKey) || '2. Trimenon (Monat 4–6)',
        phaseKey: 'medComparisonTrimesterGrowth' as TranslationKey,
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    } else {
      return {
        number: 3,
        title: t('medComparisonPregnancyMonth7' as TranslationKey) || '3. Trimenon (Monat 7–9)',
        phaseKey: 'medComparisonTrimesterPerinatal' as TranslationKey,
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    }
  }, [lifestyle.pregnancyMonth, t]);

  return (
    <div className="w-full space-y-6 max-w-7xl mx-auto pb-12">
      {/* ========================================================================= */}
      {/* 0. TOP ACTION BAR (MATCHING Πλήρης Μονογραφία & Επίσημες Πληροφορίες)     */}
      {/* ========================================================================= */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Scale className="w-4 h-4 text-teal-700 shrink-0" />
          <span className="font-bold text-xs sm:text-sm text-slate-800">
            {t('medComparisonHeading' as TranslationKey) || 'Mehrfachmedikations-Vergleich & Kumulative Risikoanalyse'}
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80 font-semibold">
            {meds.length} {t('medComparisonCountBadge' as TranslationKey) || 'Medikamente erfasst'}
          </span>
          {language !== 'de' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-semibold flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-600" />
              <span>{t('medTranslatedBadge' as TranslationKey) || 'Lokalisiert'}</span>
            </span>
          )}
          {isTranslating && (
            <span className="text-[10px] text-teal-700 font-medium flex items-center gap-1 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{t('medComparisonAnalysisTranslating' as TranslationKey) || 'Übersetzung wird synchronisiert...'}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Copy Action */}
          <button
            type="button"
            onClick={handleCopyAnalysis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title={t('medComparisonCopyBtn' as TranslationKey) || 'Ergebnis kopieren'}
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
                <span>{t('medComparisonCopyBtn' as TranslationKey) || 'Kopieren'}</span>
              </>
            )}
          </button>

          {/* PDF Export Action */}
          <button
            type="button"
            id="btn-export-medication-pdf"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title={t('medComparisonExportPdf' as TranslationKey) || 'PDF-Bericht exportieren'}
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span>{t('medComparisonGeneratingPdf' as TranslationKey) || 'PDF wird erstellt...'}</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-teal-700" />
                <span>{t('medComparisonExportPdf' as TranslationKey) || 'PDF exportieren'}</span>
              </>
            )}
          </button>

          {/* Print Action */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title={t('medComparisonPrintBtn' as TranslationKey) || 'Drucken'}
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>{t('medComparisonPrintBtn' as TranslationKey) || 'Drucken'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 0. NOTFALL-ALARM: TOXISCHE ÜBERDOSIERUNG (AMTS v5.0)                       */}
      {/* ========================================================================= */}
      {amtsEvaluation.hasToxicOverdose && (
        <div className="rounded-2xl border-2 border-red-500 bg-red-50/95 p-4 sm:p-5 shadow-sm text-red-950 flex flex-col sm:flex-row items-start gap-4 animate-in fade-in duration-200">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-red-900">
                {t('medComparisonToxicOverdoseAlert' as TranslationKey) || '🚨 NOTFALL-ALARM: Toxische Überdosierung festgestellt!'}
              </h3>
            </div>
            <p className="text-xs text-red-800 mt-1 font-medium leading-relaxed">
              {t('medComparisonOverdoseDetail' as TranslationKey) || 'Die berechnete 24h-Gesamttagesdosis übersteigt die behördliche Standard-Höchstdosis (BfArM / Rote Liste). Akute Intoxikationsgefahr!'}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {amtsEvaluation.evaluations
                .filter(e => e.status === 'TOXISCH_UEBERDOSIERT')
                .map((e, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-100 border border-red-300 text-xs font-bold text-red-900 shadow-2xs"
                  >
                    <span>{e.drugName}:</span>
                    <span className="font-mono text-red-700">{e.dailyDoseMg} mg/d</span>
                    <span className="text-red-500">|</span>
                    <span className="text-[11px] text-red-600">Max: {e.maxDailyDoseMg} mg/d</span>
                    <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-extrabold">
                      +{e.percentageExceeded}%
                    </span>
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PATIENTENPROFIL & RISIKOFAKTOREN (5 EINFLUSSFAKTOREN)                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">
              {t('medComparisonPatientProfile' as TranslationKey) || 'Patientenprofil & Risikofaktoren'}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-800">{currentCase.patientName || t('unnamedPatient' as TranslationKey) || 'Patient/in'}</span>
              {patientAge ? (
                <>
                  <span className="text-slate-300">•</span>
                  <span>{patientAge} {t('yearsOld' as TranslationKey) || 'Jahre'}</span>
                </>
              ) : null}
              <span className="text-slate-300">•</span>
              <span className="capitalize">{currentCase.patientGender ? t(`gender${currentCase.patientGender.charAt(0).toUpperCase() + currentCase.patientGender.slice(1)}` as TranslationKey) || currentCase.patientGender : ''}</span>
            </div>
            {bmiDetails && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-800">BMI {bmiDetails.value}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${bmiDetails.badgeClass}`}>
                  {t(bmiDetails.categoryKey)}
                </span>
              </div>
            )}

            {/* Patient Switch & Simulation Buttons */}
            <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
              <button
                type="button"
                onClick={() => setIsPatientModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                title={t('medComparisonSelectPatient' as TranslationKey) || 'Patient wählen / suchen'}
              >
                <Search className="w-3 h-3 text-slate-400" />
                <span>{t('medComparisonSelectPatient' as TranslationKey) || 'Patient wählen'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNewPatientModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors shadow-2xs cursor-pointer"
                title={t('medComparisonNewPatient' as TranslationKey) || 'Neuer Patient / Simulation'}
              >
                <UserPlus className="w-3 h-3 text-teal-600" />
                <span>{t('medComparisonNewPatient' as TranslationKey) || '+ Neu / Simulation'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5 Clinical Risk Factor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Body Weight */}
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('medComparisonWeight' as TranslationKey) || 'Gewicht'}</span>
              </label>
              {pkEvaluation.hasDosageRelevance ? (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {t('medComparisonDosageRelevant' as TranslationKey) || 'Dosierungsrelevant'}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">{t('medComparisonPatientClearance' as TranslationKey) || 'Clearance'}</span>
              )}
            </div>

            <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden h-8">
              <button
                type="button"
                onClick={() => saveLifestyleChanges({ ...lifestyle, bodyWeightKg: Math.max(30, (lifestyle.bodyWeightKg || 70) - 1) })}
                className="w-7 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border-r border-slate-100"
                title="-1 kg"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min={30}
                max={250}
                value={lifestyle.bodyWeightKg || 70}
                onChange={e => saveLifestyleChanges({ ...lifestyle, bodyWeightKg: parseInt(e.target.value, 10) || 70 })}
                className="flex-1 text-center font-bold text-slate-900 text-xs py-1 bg-transparent outline-none"
              />
              <span className="text-[10px] font-semibold text-slate-400 pr-2 select-none">kg</span>
              <button
                type="button"
                onClick={() => saveLifestyleChanges({ ...lifestyle, bodyWeightKg: Math.min(250, (lifestyle.bodyWeightKg || 70) + 1) })}
                className="w-7 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border-l border-slate-100"
                title="+1 kg"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {pkEvaluation.hasDosageRelevance ? (
              <p className="text-[10px] text-amber-800 font-semibold truncate" title={pkEvaluation.dosageRecommendation}>
                ⚠️ {pkEvaluation.badgeText}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 truncate">
                {t('medComparisonStandardDoseOk' as TranslationKey) || 'Standard-Dosierung adäquat'}
              </p>
            )}
          </div>

          {/* 2. Body Height & BMI */}
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('medComparisonHeight' as TranslationKey) || 'Körpergröße'}</span>
              </label>
              <span className="text-[10px] text-slate-400">KOF</span>
            </div>

            <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden h-8">
              <button
                type="button"
                onClick={() => saveLifestyleChanges({ ...lifestyle, bodyHeightCm: Math.max(50, (lifestyle.bodyHeightCm || 170) - 1) })}
                className="w-7 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border-r border-slate-100"
                title="-1 cm"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min={50}
                max={250}
                value={lifestyle.bodyHeightCm || 170}
                onChange={e => saveLifestyleChanges({ ...lifestyle, bodyHeightCm: parseInt(e.target.value, 10) || 170 })}
                className="flex-1 text-center font-bold text-slate-900 text-xs py-1 bg-transparent outline-none"
              />
              <span className="text-[10px] font-semibold text-slate-400 pr-2 select-none">cm</span>
              <button
                type="button"
                onClick={() => saveLifestyleChanges({ ...lifestyle, bodyHeightCm: Math.min(250, (lifestyle.bodyHeightCm || 170) + 1) })}
                className="w-7 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border-l border-slate-100"
                title="+1 cm"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
              <span>BMI: {bmiDetails ? `${bmiDetails.value} kg/m²` : '—'}</span>
            </div>
          </div>

          {/* 3. Pregnancy & Gestational Month (Larger & Fitting Select Box) */}
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Baby className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('medComparisonPregnancyTitle' as TranslationKey) || 'Schwanger'}</span>
              </label>
              {lifestyle.isPregnant && (
                <span className="text-[10px] font-bold text-teal-800">{trimesterInfo.number}. Trim.</span>
              )}
            </div>

            <div className="inline-flex w-full rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs h-8 items-center">
              <button
                type="button"
                onClick={() => saveLifestyleChanges({ ...lifestyle, isPregnant: false })}
                className={`flex-1 h-full rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                  !lifestyle.isPregnant ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('medComparisonNo' as TranslationKey) || 'Nein'}
              </button>
              <button
                type="button"
                onClick={() => saveLifestyleChanges({ ...lifestyle, isPregnant: true })}
                className={`flex-1 h-full rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                  lifestyle.isPregnant ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('medComparisonYes' as TranslationKey) || 'Ja'}
              </button>
            </div>

            {lifestyle.isPregnant ? (
              <div className="space-y-1.5 pt-1">
                {/* Noticeably larger, spacious & fitting select dropdown for pregnancy months */}
                <div className="relative">
                  <select
                    id="select-pregnancy-month"
                    value={lifestyle.pregnancyMonth || 1}
                    onChange={(e) => saveLifestyleChanges({ ...lifestyle, pregnancyMonth: parseInt(e.target.value, 10) || 1 })}
                    className="w-full h-10 px-3 py-1.5 text-xs sm:text-[13px] font-bold text-teal-950 bg-white border border-teal-400/90 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer appearance-none pr-8 transition-colors"
                  >
                    <option value={1}>{t('medComparisonPregnancyMonth1' as TranslationKey) || '1. Monat (1. Trimenon)'}</option>
                    <option value={2}>{t('medComparisonPregnancyMonth2' as TranslationKey) || '2. Monat (1. Trimenon)'}</option>
                    <option value={3}>{t('medComparisonPregnancyMonth3' as TranslationKey) || '3. Monat (1. Trimenon)'}</option>
                    <option value={4}>{t('medComparisonPregnancyMonth4' as TranslationKey) || '4. Monat (2. Trimenon)'}</option>
                    <option value={5}>{t('medComparisonPregnancyMonth5' as TranslationKey) || '5. Monat (2. Trimenon)'}</option>
                    <option value={6}>{t('medComparisonPregnancyMonth6' as TranslationKey) || '6. Monat (2. Trimenon)'}</option>
                    <option value={7}>{t('medComparisonPregnancyMonth7' as TranslationKey) || '7. Monat (3. Trimenon)'}</option>
                    <option value={8}>{t('medComparisonPregnancyMonth8' as TranslationKey) || '8. Monat (3. Trimenon)'}</option>
                    <option value={9}>{t('medComparisonPregnancyMonth9' as TranslationKey) || '9. Monat (3. Trimenon)'}</option>
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-teal-700">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-teal-900 font-semibold px-0.5">
                  <span>SSW {lifestyle.pregnancyMonth ? `${(lifestyle.pregnancyMonth - 1) * 4 + 1}–${lifestyle.pregnancyMonth * 4}` : '1–4'}</span>
                  <span>{t(trimesterInfo.phaseKey)}</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 font-medium py-1">
                {t('medComparisonPregnancyNone' as TranslationKey) || 'Keine Teratogenität'}
              </p>
            )}
          </div>

          {/* 4. Smoking Status (Binary) */}
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('medComparisonSmokerQuestion' as TranslationKey) || 'Raucher'}</span>
              </label>
              <span className="text-[10px] text-slate-400">Status</span>
            </div>

            <div className="inline-flex w-full rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs h-8 items-center">
              <button
                type="button"
                onClick={() => saveLifestyleChanges({ 
                  ...lifestyle, 
                  isSmoker: false, 
                  smokingStatus: 'non-smoker',
                  cigarettesPerDay: 0 
                })}
                className={`flex-1 h-full rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                  !lifestyle.isSmoker && lifestyle.smokingStatus !== 'smoker' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('medComparisonNo' as TranslationKey) || 'Nein'}
              </button>
              <button
                type="button"
                onClick={() => saveLifestyleChanges({ 
                  ...lifestyle, 
                  isSmoker: true, 
                  smokingStatus: 'smoker',
                  cigarettesPerDay: 0 
                })}
                className={`flex-1 h-full rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                  lifestyle.isSmoker || lifestyle.smokingStatus === 'smoker' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('medComparisonYes' as TranslationKey) || 'Ja'}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 truncate">
              {lifestyle.isSmoker || lifestyle.smokingStatus === 'smoker' ? (
                lifestyle.isPregnant ? (
                  <span className="text-amber-800 font-bold">⚠️ {t('medComparisonPregnancyDangerNotice' as TranslationKey) || 'Plazentar-/Fetalrisiko'}</span>
                ) : lifestyleEvaluation.hasSmokingInteraction ? (
                  <span className="text-amber-800 font-semibold">⚠️ {t('medComparisonDrugInteractionNotice' as TranslationKey) || 'Wechselwirkung mit Medikation'}</span>
                ) : (
                  <span className="text-slate-500">{t('medComparisonNoInteractionNotice' as TranslationKey) || 'Keine direkte Wechselwirkung'}</span>
                )
              ) : (
                t('medComparisonSmokingNone' as TranslationKey) || 'Nichtraucher'
              )}
            </p>
          </div>

          {/* 5. Alcohol Consumption (Binary) */}
          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Wine className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('medComparisonAlcoholPerDayTitle' as TranslationKey) || 'Alkohol'}</span>
              </label>
              <span className="text-[10px] text-slate-400">Status</span>
            </div>

            <div className="inline-flex w-full rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs h-8 items-center">
              <button
                type="button"
                onClick={() => saveLifestyleChanges({ 
                  ...lifestyle, 
                  alcoholDaily: false, 
                  alcoholFrequency: 'never',
                  alcoholAmount: 0,
                  alcoholPureMgPerDay: 0,
                  alcoholSummaryText: 'Kein Alkoholkonsum'
                })}
                className={`flex-1 h-full rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                  !lifestyle.alcoholDaily && lifestyle.alcoholFrequency === 'never' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('medComparisonNo' as TranslationKey) || 'Nein'}
              </button>
              <button
                type="button"
                onClick={() => saveLifestyleChanges({ 
                  ...lifestyle, 
                  alcoholDaily: true, 
                  alcoholFrequency: 'daily',
                  alcoholAmount: 1,
                  alcoholPureMgPerDay: 0,
                  alcoholSummaryText: 'Alkoholkonsum angegeben'
                })}
                className={`flex-1 h-full rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                  lifestyle.alcoholDaily || lifestyle.alcoholFrequency === 'daily' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('medComparisonYes' as TranslationKey) || 'Ja'}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 truncate">
              {lifestyle.alcoholDaily || lifestyle.alcoholFrequency === 'daily' ? (
                lifestyle.isPregnant ? (
                  <span className="text-red-700 font-bold">🚨 {t('medComparisonPregnancyDangerNotice' as TranslationKey) || 'FASD- & Fehlbildungsrisiko'}</span>
                ) : lifestyleEvaluation.hasAlcoholInteraction ? (
                  <span className="text-amber-800 font-semibold">⚠️ {t('medComparisonDrugInteractionNotice' as TranslationKey) || 'Wechselwirkung mit Medikation'}</span>
                ) : (
                  <span className="text-slate-500">{t('medComparisonNoInteractionNotice' as TranslationKey) || 'Keine direkte Wechselwirkung'}</span>
                )
              ) : (
                t('medComparisonAlcoholNone' as TranslationKey) || 'Kein Alkoholkonsum'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ZU VERGLEICHENDE MEDIKATION (ÜBERSICHTSTABELLE ÜBER RISIKO-ANALYSE)     */}
      {/* (NO Indikation / Grund column as explicitly requested)                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">
              {t('medComparisonMedsToCompareTitle' as TranslationKey) || 'Zu vergleichende Medikation'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 font-bold text-[11px]">
              {meds.length} {t('medComparisonCountBadge' as TranslationKey) || 'Medikamente'}
            </span>
          </div>

          {onOpenMedicationsModal && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenMedicationsModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('medComparisonAddMedicationQuick' as TranslationKey) || '+ Medikament hinzufügen'}</span>
              </button>
              <button
                type="button"
                onClick={onOpenMedicationsModal}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {t('medComparisonEditMedsBtn' as TranslationKey) || 'Medikamente bearbeiten / ergänzen'}
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                <th className="py-2.5 px-3.5 w-10 text-center">#</th>
                <th className="py-2.5 px-3.5">{t('medComparisonColDrugName' as TranslationKey) || 'Präparat / Handelsname'}</th>
                <th className="py-2.5 px-3.5">{t('medComparisonColActiveSubstance' as TranslationKey) || 'Wirkstoff'}</th>
                <th className="py-2.5 px-3.5">{t('medComparisonColDosage' as TranslationKey) || 'Dosierung'}</th>
                <th className="py-2.5 px-3.5">{t('medComparisonSingleDose' as TranslationKey) || 'Einzeldosis'}</th>
                <th className="py-2.5 px-3.5">{t('medComparisonDailyDose' as TranslationKey) || 'Tagesdosis'}</th>
                <th className="py-2.5 px-3.5">{t('medComparisonMaxDose' as TranslationKey) || 'Max. Dosis'}</th>
                <th className="py-2.5 px-3.5">{t('medComparisonColAdministration' as TranslationKey) || 'Einnahmeart'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meds.map((m, idx) => {
                const evalItem = amtsEvaluation.evaluations[idx];
                const isOverdosed = evalItem?.status === 'TOXISCH_UEBERDOSIERT';
                return (
                  <tr key={idx} className={`transition-colors ${isOverdosed ? 'bg-red-50/70 hover:bg-red-100/60' : 'hover:bg-slate-50/70'}`}>
                    <td className="py-2.5 px-3.5 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{m.name}</span>
                        {isOverdosed && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white shadow-2xs">
                            +{evalItem.percentageExceeded}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700 font-medium">{m.wirkstoff || '—'}</td>
                    <td className="py-2.5 px-3.5 font-bold text-teal-900">{m.dosierung || t('medNotSpecified' as TranslationKey) || 'Nicht angegeben'}</td>
                    <td className="py-2.5 px-3.5 text-slate-700 font-mono">
                      {evalItem?.singleDoseMg !== null && evalItem?.singleDoseMg !== undefined
                        ? `${evalItem.singleDoseMg} mg`
                        : '—'}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-bold">
                      {evalItem?.dailyDoseMg !== null && evalItem?.dailyDoseMg !== undefined ? (
                        <span className={isOverdosed ? 'text-red-700' : 'text-slate-800'}>
                          {evalItem.dailyDoseMg} mg/Tag
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600 font-mono">
                      {evalItem?.maxDailyDoseMg ? `${evalItem.maxDailyDoseMg} mg/Tag` : '—'}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600">{m.einnahmeart || 'oral'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DEDIZIERTER ANALYSE-ACTION-BEREICH (RISIKO-ANALYSE GRID)               */}
      {/* Erscheint wenn etwas geändert wird, und verschwindet nach Klick!          */}
      {/* ========================================================================= */}
      {(hasPendingChanges || isAnalyzing) && (
        <div className="bg-gradient-to-r from-teal-50/90 via-slate-50 to-white border border-teal-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {t('medComparisonRiskAnalysisGridTitle' as TranslationKey) || 'Risiko-Analyse'}
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {t('medComparisonRiskAnalysisGridDesc' as TranslationKey) || 'Berechnet synergistische Arzneimittelwechselwirkungen, kumulative Toxizität und fötale Gefahrenpotenziale.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-run-clinical-comparison"
            onClick={handleStartAnalysis}
            disabled={isAnalyzing || meds.length < 2}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('medComparisonAnalyzingBtn' as TranslationKey) || 'Pharmakologische Auswertung läuft...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-teal-200" />
                <span>{t('medComparisonStartAnalysisBtn' as TranslationKey) || 'Risiko Analyse starten'}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading state during analysis */}
      {isAnalyzing && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-6 shadow-xs flex items-center justify-center gap-3 text-teal-900 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin text-teal-700" />
          <span className="text-sm font-bold">
            {t('medComparisonAnalyzingBtn' as TranslationKey) || 'Pharmakologische Auswertung läuft...'}
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. KLINISCHE DRINGLICHKEITS-EINSTUFUNG (TRIAGE)                           */}
      {/* Verschwindet wenn etwas geändert wird, erscheint nach Klick auf Analyse!  */}
      {/* Berücksichtigt ALLE Daten (Medikamente, Konstitution, Trimenon, Lifestyle)*/}
      {/* ========================================================================= */}
      {!hasPendingChanges && !isAnalyzing && (
        <div 
          id="section-clinical-triage"
          className={`rounded-2xl border p-5 sm:p-6 shadow-sm transition-all ${
            activeResult.triageLevel === 'critical'
              ? 'bg-red-50/90 border-red-300 text-red-950'
              : activeResult.triageLevel === 'high'
              ? 'bg-amber-50/90 border-amber-300 text-amber-950'
              : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
          }`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    activeResult.triageLevel === 'critical'
                      ? 'bg-red-600 text-white animate-pulse'
                      : activeResult.triageLevel === 'high'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {activeResult.triageLevel === 'critical' ? (
                    <ShieldAlert className="w-7 h-7" />
                  ) : activeResult.triageLevel === 'high' ? (
                    <AlertTriangle className="w-7 h-7" />
                  ) : (
                    <ShieldCheck className="w-7 h-7" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 border border-current/20">
                      {t('medComparisonTriageTitle' as TranslationKey) || 'Klinische Dringlichkeits-Einstufung (Triage)'}
                    </span>
                    <span className="text-xs font-semibold opacity-75">
                      {meds.length} {t('medComparisonCountBadge' as TranslationKey) || 'Medikamente erfasst'}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold tracking-tight">
                    {formatLocalizedTriageLabel(
                      activeResult.triageLevel,
                      meds.length,
                      meds.map(m => m.name),
                      Boolean(lifestyle.isPregnant),
                      lifestyle.pregnancyMonth || 1,
                      lifestyle.bodyWeightKg || 70,
                      bmiDetails?.value,
                      language as LanguageCode
                    )}
                  </h2>

                  <p className="text-xs opacity-90 leading-relaxed max-w-3xl">
                    {activeResult.triageLevel === 'critical'
                      ? (t('medComparisonTriageLevelCritical' as TranslationKey) || 'Kritische toxikologische Wechselwirkung oder schwere Kontraindikation identifiziert. Sofortiges ärztliches Eingreifen und Absetzen der Eigenmedikation zwingend angeraten.')
                      : activeResult.triageLevel === 'high'
                      ? (t('medComparisonTriageLevelHigh' as TranslationKey) || 'Signifikante pharmakodynamische Interaktionen, gesteigerte Organbelastung oder CYP-Enzymkonkurrenz. Zeitnahe ärztliche Rücksprache und Dosiskorrektur erforderlich.')
                      : (t('medComparisonTriageLevelLow' as TranslationKey) || 'Keine akut lebensbedrohlichen Kontraindikationen festgestellt. Die Kombination ist unter klinischer Routine-Überwachung und Einhaltung der Einnahmeabstände vertretbar.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Holistic Multi-Factor Evaluation Grid: Covers ALL DATA SIMULTANEOUSLY */}
            <div className="border-t border-current/15 pt-3 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                {t('medComparisonTriageAllDataNotice' as TranslationKey) || 'Ganzheitliche klinische Beurteilung aller erfassten Parameter:'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {/* 1. Meds */}
                <div className="p-2.5 bg-white/85 rounded-xl border border-current/15 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                    <Pill className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{t('medComparisonTriageFactorMeds' as TranslationKey) || 'Medikation & Interaktionen'}</span>
                  </div>
                  <div className="text-xs text-slate-800 font-medium truncate" title={meds.map(m => m.name).join(', ')}>
                    {meds.map(m => m.name).join(', ')}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-semibold">
                    {meds.length} {t('medComparisonCountBadge' as TranslationKey) || 'Präparate'}
                  </div>
                </div>

                {/* 2. Constitution & Pharmacokinetics */}
                <div className="p-2.5 bg-white/85 rounded-xl border border-current/15 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                    <Scale className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{t('medComparisonTriageFactorProfile' as TranslationKey) || 'Konstitution & Dosierung'}</span>
                  </div>
                  <div className="text-xs text-slate-800 font-medium">
                    {lifestyle.bodyWeightKg || 70} kg • {lifestyle.bodyHeightCm || 170} cm
                    {bmiDetails ? ` • BMI ${bmiDetails.value}` : ''}
                  </div>
                  <div className="text-[10px] mt-1 font-semibold truncate" title={pkEvaluation.hasDosageRelevance ? pkEvaluation.dosageRecommendation : undefined}>
                    {pkEvaluation.hasDosageRelevance ? (
                      <span className="text-amber-800 font-bold">⚠️ {pkEvaluation.badgeText}</span>
                    ) : (
                      <span className="text-slate-500">{t('medComparisonStandardDoseOk' as TranslationKey) || 'Standard-Dosis adäquat'}</span>
                    )}
                  </div>
                </div>

                {/* 3. Pregnancy */}
                <div className="p-2.5 bg-white/85 rounded-xl border border-current/15 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                    <Baby className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{t('medComparisonTriageFactorPregnancy' as TranslationKey) || 'Schwangerschaft & Fötus'}</span>
                  </div>
                  <div className="text-xs text-slate-800 font-medium">
                    {lifestyle.isPregnant 
                      ? (t(`medComparisonPregnancyMonth${lifestyle.pregnancyMonth || 1}` as TranslationKey) || `${lifestyle.pregnancyMonth || 1}. Monat`)
                      : (t('medComparisonPregnancyNone' as TranslationKey) || 'Nicht schwanger')}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-semibold">
                    {lifestyle.isPregnant ? t(trimesterInfo.phaseKey) : (t('medComparisonPregnancyNone' as TranslationKey) || 'Keine Teratogenitätsrisiken')}
                  </div>
                </div>

                {/* 4. Lifestyle & Interaktionsfokus */}
                <div className="p-2.5 bg-white/85 rounded-xl border border-current/15 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                    <Wine className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{t('medComparisonTriageFactorLifestyle' as TranslationKey) || 'Lebensstil & Interaktionen'}</span>
                  </div>
                  <div className="text-xs text-slate-800 font-medium truncate">
                    {lifestyle.smokingStatus === 'smoker' || lifestyle.isSmoker ? (t('medComparisonSmokingStatus' as TranslationKey) || 'Raucher: Ja') : (t('medComparisonSmokingNone' as TranslationKey) || 'Raucher: Nein')}
                    {' • '}
                    {lifestyle.alcoholDaily || lifestyle.alcoholFrequency === 'daily' ? (t('medComparisonAlcoholStatus' as TranslationKey) || 'Alkohol: Ja') : (t('medComparisonAlcoholNone' as TranslationKey) || 'Alkohol: Nein')}
                  </div>
                  <div className="text-[10px] mt-1 font-semibold truncate">
                    {lifestyle.isPregnant && (lifestyle.isSmoker || lifestyle.smokingStatus === 'smoker' || lifestyle.alcoholDaily || lifestyle.alcoholFrequency === 'daily') ? (
                      <span className="text-red-700 font-bold">🚨 {t('medComparisonPregnancyDangerNotice' as TranslationKey) || 'Hohe Gefährdung in Schwangerschaft'}</span>
                    ) : lifestyleEvaluation.hasAlcoholInteraction || lifestyleEvaluation.hasSmokingInteraction ? (
                      <span className="text-amber-800 font-bold">⚠️ {t('medComparisonDrugInteractionNotice' as TranslationKey) || 'Wechselwirkung mit Medikation'}</span>
                    ) : (lifestyle.isSmoker || lifestyle.smokingStatus === 'smoker' || lifestyle.alcoholDaily || lifestyle.alcoholFrequency === 'daily') ? (
                      <span className="text-slate-500">{t('medComparisonNoInteractionNotice' as TranslationKey) || 'Keine direkte Wechselwirkung'}</span>
                    ) : (
                      <span className="text-slate-500">{t('medComparisonAlcoholNone' as TranslationKey) || 'Kein Risikokonsum'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PHARMAKOLOGISCHE RISIKOMATRIX & KUMULATIVE TOXIZITÄT                    */}
      {/* Clean rendered markdown without strange delimiter characters               */}
      {/* ========================================================================= */}
      {!hasPendingChanges && !isAnalyzing && activeResult && activeResult.markdownContent && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Clinical Report Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {t('medComparisonReportTitle' as TranslationKey) || 'Evidenzbasierte pharmakologische Risikobewertung & Kumulative Toxizitätsmatrix'}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {t('medComparisonValidatedBadge' as TranslationKey) || 'Validiert'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('medComparisonReportSubtitle' as TranslationKey) || 'Klinische Multikomponenten-Analyse nach Arzneistoff-Clearance, CYP-Interaktion & Fötosicherheit'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs font-mono shrink-0">
              <span>{t('medComparisonDateAsOf' as TranslationKey) || 'Stand'}: {new Date(activeResult.analyzedAt || Date.now()).toLocaleDateString(language === 'el' ? 'el-GR' : language === 'de' ? 'de-DE' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'it' ? 'it-IT' : language === 'ru' ? 'ru-RU' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Rendered Clinical Pharmacology Report */}
          <div className="p-5 sm:p-7">
            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed overflow-x-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-200 flex items-center gap-2">
                      <span className="w-2 h-5 bg-teal-600 rounded-full inline-block"></span>
                      <span>{children}</span>
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-5 mb-2.5 text-teal-950 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-teal-500 rounded-full inline-block"></span>
                      <span>{children}</span>
                    </h2>
                  ),
                  h3: ({ children }) => {
                    const str = String(children || '');
                    const isWarn = str.includes('WARNHINWEIS') || str.includes('⚠️') || str.includes('WARNUNG') || str.includes('WARNING');
                    if (isWarn) {
                      return (
                        <div className="my-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-2.5 shadow-2xs">
                          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                              {children}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 mt-4 mb-2 pb-1 border-b border-slate-100">
                        {children}
                      </h3>
                    );
                  },
                  table: ({ children }) => (
                    <div className="my-5 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                      <table className="w-full text-left text-xs border-collapse">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                      {children}
                    </thead>
                  ),
                  th: ({ children }) => (
                    <th className="py-3 px-3.5 font-bold border-r border-slate-200 last:border-r-0 bg-slate-100/90 text-slate-800 text-left">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => {
                    const text = String(children || '');
                    const isCriticalCell = text.includes('SOFORTIGE') || text.includes('Lebensgefahr') || text.includes('Extrem hohes Risiko') || text.includes('DRINGEND') || text.includes('ΑΜΕΣΗ') || text.includes('Κίνδυνος') || text.includes('Κρίσιμος') || text.includes('IMMEDIATE') || text.includes('CRITICAL');
                    return (
                      <td className={`py-3 px-3.5 border-r border-b border-slate-100 last:border-r-0 align-top ${isCriticalCell ? 'bg-rose-50/40 text-slate-900 font-medium' : ''}`}>
                        {children}
                      </td>
                    );
                  },
                  tr: ({ children }) => (
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      {children}
                    </tr>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 my-2.5 space-y-1.5 text-slate-700">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 my-2.5 space-y-1.5 text-slate-700">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">
                      {children}
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-teal-600 pl-4 py-2.5 my-3 bg-teal-50/40 rounded-r-xl text-slate-700 italic text-xs leading-relaxed">
                      {children}
                    </blockquote>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-slate-900">
                      {children}
                    </strong>
                  ),
                }}
              >
                {sanitizeMarkdownContent(activeResult.markdownContent)}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PATIENT AUSWÄHLEN / DURCHSUCHEN                                   */}
      {/* ========================================================================= */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {t('medComparisonSelectPatient' as TranslationKey) || 'Patient wählen / suchen'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPatientModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={patientSearchTerm}
                  onChange={e => setPatientSearchTerm(e.target.value)}
                  placeholder={t('medComparisonSearchPatientPlaceholder' as TranslationKey) || 'Patienten nach Name suchen...'}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {t('medComparisonNoPatientsFound' as TranslationKey) || 'Keine gespeicherten Patienten gefunden'}
                </div>
              ) : (
                filteredPatients.map(p => {
                  const isCurrent = p.id === currentCase.id || p.patientName === currentCase.patientName;
                  return (
                    <button
                      key={p.id || p.patientName}
                      type="button"
                      onClick={() => handleSelectPatient(p)}
                      className={`w-full text-left p-3 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                        isCurrent ? 'bg-teal-50/80 text-teal-900 font-bold border border-teal-200' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 font-bold text-xs">
                          {(p.patientName || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{p.patientName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            {p.patientAge && <span>{p.patientAge} {t('yearsOld' as TranslationKey) || 'Jahre'}</span>}
                            {p.patientGender && <span>• {p.patientGender}</span>}
                            {p.medikamenteList && (
                              <span>• {p.medikamenteList.length} {t('medComparisonCountBadge' as TranslationKey) || 'Medikamente'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                          {t('activeFilter' as TranslationKey) || 'Aktiv'}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50/70 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPatientModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                {t('medComparisonCancel' as TranslationKey) || 'Abbrechen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NEUER PATIENT / SIMULATION                                        */}
      {/* ========================================================================= */}
      {isNewPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <form onSubmit={handleCreateNewPatient}>
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    {t('medComparisonNewPatientTitle' as TranslationKey) || 'Neuen Patienten für Analyse erfassen'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewPatientModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('medComparisonPatientNameLabel' as TranslationKey) || 'Name des Patienten'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newPatientForm.name}
                    onChange={e => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                    placeholder="z. B. Max Mustermann (Simulation)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('medComparisonPatientAgeLabel' as TranslationKey) || 'Alter (Jahre)'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={130}
                      value={newPatientForm.age}
                      onChange={e => setNewPatientForm({ ...newPatientForm, age: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t('medComparisonPatientGenderLabel' as TranslationKey) || 'Geschlecht'}
                    </label>
                    <select
                      value={newPatientForm.gender}
                      onChange={e => setNewPatientForm({ ...newPatientForm, gender: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="weiblich">{t('genderFemale' as TranslationKey) || 'Weiblich'}</option>
                      <option value="männlich">{t('genderMale' as TranslationKey) || 'Männlich'}</option>
                      <option value="divers">{t('genderDiverse' as TranslationKey) || 'Divers'}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPatientModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  {t('medComparisonCancel' as TranslationKey) || 'Abbrechen'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {t('medComparisonSavePatient' as TranslationKey) || 'Patient übernehmen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pdfBlockedError && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                {t('tariffPdfLockedTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                {t('tariffPdfLockedDesc')}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPdfBlockedError(false)}
                className="w-full px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                {t('btnCancelModal')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
