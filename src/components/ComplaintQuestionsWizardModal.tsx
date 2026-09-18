import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Send, 
  CheckCircle2, 
  HelpCircle,
  Stethoscope,
  Activity,
  Layers,
  MapPin,
  Flame,
  Sliders,
  HeartPulse,
  Brain,
  FilterX,
  CheckSquare,
  History,
  GitBranch,
  ShieldAlert,
  Radio,
  FileText,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  GripVertical
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { VoiceInputButton } from './VoiceInputButton';
import { 
  Hahnemann6Pillars, 
  HahnemannAnalysisResult, 
  runHahnemannAnalysis,
  CaseType
} from '../services/hahnemannEngineService';
import { extractSymptomsDeterministically } from '../services/homeopathicExpertEngine';

interface ComplaintQuestionsWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  chiefComplaint: string;
  patientName?: string;
  initialCaseType?: CaseType;
  initialMatrix?: Partial<Hahnemann6Pillars>;
  preloadedAnalysis?: HahnemannAnalysisResult | null;
  inline?: boolean;
  onTransferToAnamnese: (data: {
    matrix: Hahnemann6Pillars;
    summaryText: string;
    differentialRemedies: string[];
    caseType?: CaseType;
  }) => void;
}

export const ComplaintQuestionsWizardModal: React.FC<ComplaintQuestionsWizardModalProps> = ({
  isOpen,
  onClose,
  chiefComplaint,
  patientName,
  initialCaseType = 'akut',
  initialMatrix,
  preloadedAnalysis,
  inline = false,
  onTransferToAnamnese,
}) => {
  const { t, language } = useTranslation();

  const [caseType, setCaseType] = useState<CaseType>(initialCaseType);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ question: string; answer: string }>>([]);
  const [analysisResult, setAnalysisResult] = useState<HahnemannAnalysisResult | null>(null);
  const [clarifyingAnswers, setClarifyingAnswers] = useState<Record<string, string>>({});
  const [customClarifyingInput, setCustomClarifyingInput] = useState<Record<string, string>>({});
  const [pendingReflection, setPendingReflection] = useState<string | null>(null);
  const [snapshotHistory, setSnapshotHistory] = useState<Array<{
    analysisResult: HahnemannAnalysisResult | null;
    conversationHistory: Array<{ question: string; answer: string }>;
    currentAnswer: string;
    selectedOptions: string[];
    clarifyingAnswers: Record<string, string>;
  }>>([]);

  const initialParsedRef = useRef(false);
  const initialAnalysisRef = useRef<HahnemannAnalysisResult | null>(null);

  const [customSequenceItems, setCustomSequenceItems] = useState<string[]>([]);
  const [isCustomSequenceActive, setIsCustomSequenceActive] = useState<boolean>(false);

  const isSequenceQuestion = useMemo(() => {
    const q = analysisResult?.naechste_frage || '';
    const isForegroundQuestion = /vordergrund|hauptbeschwerde|schwerpunkt|dominant/i.test(q);
    const hasSequenceKeywords = /nacheinander|reihenfolge|zuerst|danach|zeitlicher ablauf/i.test(q);
    return hasSequenceKeywords && !isForegroundQuestion;
  }, [analysisResult?.naechste_frage]);

  const customSequenceLabel = language === 'de'
    ? `Individuelle Reihenfolge: ${customSequenceItems.map((item, idx) => `${idx + 1}. ${item}`).join(', ')}`
    : `Custom sequence: ${customSequenceItems.map((item, idx) => `${idx + 1}. ${item}`).join(', ')}`;

  useEffect(() => {
    if (isSequenceQuestion) {
      const qText = analysisResult?.naechste_frage || '';
      const matches = qText.match(/(?:Magenschmerzen|Kopfschmerzen|Fieber|Erbrechen|Bauchschmerzen|Knieschmerzen|Husten|Halsweh|Schwindel|Übelkeit)/gi);
      if (matches && matches.length > 0) {
        const unique = Array.from(new Set(matches.map(m => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase())));
        setCustomSequenceItems(unique);
      } else {
        const parts = chiefComplaint.split(/,|\s+und\s+|\s+sowie\s+/i).map(p => p.trim()).filter(p => p.length > 2);
        setCustomSequenceItems(parts.length > 0 ? parts : ['Magenschmerzen', 'Kopfschmerzen', 'Fieber']);
      }
      setIsCustomSequenceActive(false);
    }
  }, [isSequenceQuestion, analysisResult?.naechste_frage, chiefComplaint]);

  useEffect(() => {
    if (isSequenceQuestion && isCustomSequenceActive) {
      setSelectedOptions(prev => [
        ...prev.filter(o => !o.startsWith('Individuelle Reihenfolge') && !o.startsWith('Custom sequence')),
        customSequenceLabel
      ]);
    }
  }, [customSequenceItems, isCustomSequenceActive, isSequenceQuestion, customSequenceLabel]);

  const moveSequenceItem = (index: number, direction: 'up' | 'down') => {
    const newArr = [...customSequenceItems];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newArr.length) return;
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setCustomSequenceItems(newArr);
  };

  // Initialize analysis on modal open with chief complaint text, existing matrix and selected caseType
  useEffect(() => {
    if (isOpen && !initialParsedRef.current) {
      initialParsedRef.current = true;
      const activeType = initialCaseType || 'akut';
      setCaseType(activeType);

      if (preloadedAnalysis) {
        initialAnalysisRef.current = JSON.parse(JSON.stringify(preloadedAnalysis));
        setAnalysisResult(preloadedAnalysis);
        setIsProcessing(false);
        return;
      }

      setIsProcessing(true);
      const textToAnalyze = chiefComplaint && chiefComplaint.trim().length > 0 ? chiefComplaint.trim() : 'Akute Beschwerden';
      
      const seedMatrix: Hahnemann6Pillars | undefined = initialMatrix ? {
        causa: initialMatrix.causa || null,
        lokalisierung: initialMatrix.lokalisierung || null,
        empfindung: initialMatrix.empfindung || null,
        modalitaeten: initialMatrix.modalitaeten || null,
        begleitsymptome: initialMatrix.begleitsymptome ? [...initialMatrix.begleitsymptome] : [],
        gemuet: initialMatrix.gemuet || null,
        strahlungsoptionen: initialMatrix.strahlungsoptionen || null,
        ursaechlicher_zusammenhang: initialMatrix.ursaechlicher_zusammenhang || null,
        fruehere_behandlungen_und_historie: initialMatrix.fruehere_behandlungen_und_historie || null,
      } : undefined;

      runHahnemannAnalysis(textToAnalyze, seedMatrix, [], language, false, activeType)
        .then((res) => {
          initialAnalysisRef.current = JSON.parse(JSON.stringify(res));
          setAnalysisResult(res);
        })
        .catch((err) => {
          console.error('Error initializing Hahnemann analysis, using local fallback matrix:', err);
          // Resilient fallback with initialMatrix preserved
          const fallbackRes: HahnemannAnalysisResult = {
            analyse_status: 'in_progress',
            naechste_frage: activeType === 'akut'
              ? 'Beschreiben Sie bitte die genauen Empfindungen und was die Beschwerden bessert oder verschlimmert.'
              : 'Seit wann bestehen diese Beschwerden und wie verlaufen sie über die Zeit?',
            kontroll_und_nachfrage_logik: 'Erfassung der vollständigen Symptomgesamtheit gemäß Organon §§ 83–104.',
            wichtige_symptom_fragmente: seedMatrix || {
              causa: null,
              lokalisierung: textToAnalyze,
              empfindung: null,
              modalitaeten: null,
              begleitsymptome: [],
              gemuet: null,
              strahlungsoptionen: null,
              ursaechlicher_zusammenhang: null,
              fruehere_behandlungen_und_historie: null,
            },
            falltyp: activeType,
            ignorierte_daten: [],
            aktuelle_mittel_differenzierung: [],
            end_analyse_zusammenfassung: null,
          };
          initialAnalysisRef.current = JSON.parse(JSON.stringify(fallbackRes));
          setAnalysisResult(fallbackRes);
        })
        .finally(() => {
          setIsProcessing(false);
        });
    }

    if (!isOpen) {
      initialParsedRef.current = false;
      initialAnalysisRef.current = null;
    }
  }, [isOpen, chiefComplaint, language, initialCaseType, initialMatrix, preloadedAnalysis]);

  if (!isOpen) return null;

  const matrix: Hahnemann6Pillars = {
    causa: analysisResult?.wichtige_symptom_fragmente?.causa || initialMatrix?.causa || null,
    lokalisierung: analysisResult?.wichtige_symptom_fragmente?.lokalisierung || initialMatrix?.lokalisierung || null,
    empfindung: analysisResult?.wichtige_symptom_fragmente?.empfindung || initialMatrix?.empfindung || null,
    modalitaeten: analysisResult?.wichtige_symptom_fragmente?.modalitaeten || initialMatrix?.modalitaeten || null,
    begleitsymptome: (analysisResult?.wichtige_symptom_fragmente?.begleitsymptome && analysisResult.wichtige_symptom_fragmente.begleitsymptome.length > 0)
      ? analysisResult.wichtige_symptom_fragmente.begleitsymptome
      : (initialMatrix?.begleitsymptome || []),
    gemuet: analysisResult?.wichtige_symptom_fragmente?.gemuet || initialMatrix?.gemuet || null,
    strahlungsoptionen: analysisResult?.wichtige_symptom_fragmente?.strahlungsoptionen || initialMatrix?.strahlungsoptionen || null,
    ursaechlicher_zusammenhang: analysisResult?.wichtige_symptom_fragmente?.ursaechlicher_zusammenhang || initialMatrix?.ursaechlicher_zusammenhang || null,
    fruehere_behandlungen_und_historie: analysisResult?.wichtige_symptom_fragmente?.fruehere_behandlungen_und_historie || initialMatrix?.fruehere_behandlungen_und_historie || null,
  };

  const hasCausa = Boolean(matrix.causa && matrix.causa !== 'Noch nicht genannt' && matrix.causa.trim().length > 0);
  const hasLokalisierung = Boolean(matrix.lokalisierung && matrix.lokalisierung !== 'Noch nicht genannt' && matrix.lokalisierung.trim().length > 0);
  const hasEmpfindung = Boolean(matrix.empfindung && matrix.empfindung !== 'Noch nicht genannt' && matrix.empfindung.trim().length > 0);
  const hasModalitaeten = Boolean(matrix.modalitaeten && matrix.modalitaeten !== 'Noch nicht genannt' && matrix.modalitaeten.trim().length > 0);
  const hasBegleitsymptome = Boolean(Array.isArray(matrix.begleitsymptome) && matrix.begleitsymptome.length > 0);
  const hasGemuet = Boolean(matrix.gemuet && matrix.gemuet !== 'Noch nicht genannt' && matrix.gemuet.trim().length > 0);

  const pillarsCount = [
    hasCausa,
    hasLokalisierung,
    hasEmpfindung,
    hasModalitaeten,
    hasBegleitsymptome,
    hasGemuet,
  ].filter(Boolean).length;

  const all6PillarsFilled = hasCausa && hasLokalisierung && hasEmpfindung && hasModalitaeten && hasBegleitsymptome && hasGemuet;

  // Toggle caseType: Akut (§ 99) vs Chronisch (§§ 83–98)
  const handleSwitchCaseType = async (newType: CaseType) => {
    if (newType === caseType || isProcessing) return;
    setCaseType(newType);
    setIsProcessing(true);
    try {
      const queryText = currentAnswer.trim() || chiefComplaint || 'Symptombeschreibung';
      const updatedRes = await runHahnemannAnalysis(
        queryText,
        matrix,
        conversationHistory,
        language,
        false,
        newType
      );
      setAnalysisResult(updatedRes);
    } catch (err) {
      console.error('Failed to switch case type:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (snapshotHistory.length === 0) return;
    const lastState = snapshotHistory[snapshotHistory.length - 1];
    setSnapshotHistory(prev => prev.slice(0, prev.length - 1));
    setAnalysisResult(lastState.analysisResult);
    setConversationHistory(lastState.conversationHistory);
    setCurrentAnswer(lastState.currentAnswer);
    setSelectedOptions(lastState.selectedOptions);
    setClarifyingAnswers(lastState.clarifyingAnswers);
  };

  const handleSendAnswer = (answerTextToSend?: string) => {
    const textToSubmit = (answerTextToSend !== undefined ? answerTextToSend : currentAnswer).trim();
    if (!textToSubmit || !analysisResult || isProcessing) return;

    // Organon strict reflection and interpretation prohibition (§§ 83–84):
    // Reflect back to patient before finalizing into structured info (Level 2)
    setPendingReflection(textToSubmit);
  };

  const executeFinalSubmission = async (textToSubmit: string) => {
    if (!analysisResult || isProcessing) return;

    // Save snapshot for Back button
    setSnapshotHistory(prev => [
      ...prev,
      {
        analysisResult: analysisResult ? JSON.parse(JSON.stringify(analysisResult)) : null,
        conversationHistory: [...conversationHistory],
        currentAnswer,
        selectedOptions: [...selectedOptions],
        clarifyingAnswers: { ...clarifyingAnswers },
      }
    ]);

    setIsProcessing(true);
    const updatedHistory = [
      ...conversationHistory,
      { question: analysisResult.naechste_frage, answer: textToSubmit }
    ];
    setConversationHistory(updatedHistory);

    const isLastStep = all6PillarsFilled || updatedHistory.length >= 8;

    try {
      const nextResult = await runHahnemannAnalysis(
        textToSubmit,
        matrix,
        updatedHistory,
        language,
        isLastStep,
        caseType
      );
      setAnalysisResult(nextResult);
      setCurrentAnswer('');
      setSelectedOptions([]);
    } catch (err) {
      console.error('Failed to process answer:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForceComplete = async () => {
    if (!analysisResult || isProcessing) return;
    setIsProcessing(true);
    try {
      const textToSubmit = currentAnswer.trim() || 'Abschluss der Anamnese nach Organon';
      const nextResult = await runHahnemannAnalysis(
        textToSubmit,
        matrix,
        conversationHistory,
        language,
        true,
        caseType
      );
      setAnalysisResult(nextResult);
      setCurrentAnswer('');
      setSelectedOptions([]);
    } catch (err) {
      console.error('Failed to complete analysis:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnswerClarifyingQuestion = (qId: string, answerText: string, category?: string) => {
    if (!answerText.trim() || !analysisResult) return;
    const cleanAnswer = answerText.trim();
    
    // Save into answers map
    setClarifyingAnswers(prev => ({
      ...prev,
      [qId]: cleanAnswer,
    }));

    // Update matrix dynamically based on explicit category first
    const updatedMatrix: Hahnemann6Pillars = { 
      ...matrix,
      begleitsymptome: [...matrix.begleitsymptome]
    };
    
    const cat = (category || '').toLowerCase();
    const id = qId.toLowerCase();

    if (cat === 'gemuet' || id.includes('gemuet') || id.includes('mind') || id.includes('psyc')) {
      updatedMatrix.gemuet = cleanAnswer;
    } else if (cat === 'modalitaeten' || id.includes('modalitaet') || id.includes('modali')) {
      updatedMatrix.modalitaeten = updatedMatrix.modalitaeten 
        ? `${updatedMatrix.modalitaeten}; ${cleanAnswer}` 
        : cleanAnswer;
    } else if (cat === 'begleitsymptome' || id.includes('begleit') || id.includes('concomit')) {
      if (!updatedMatrix.begleitsymptome.includes(cleanAnswer)) {
        updatedMatrix.begleitsymptome.push(cleanAnswer);
      }
    } else if (cat === 'empfindung' || id.includes('empfind') || id.includes('sensation')) {
      updatedMatrix.empfindung = cleanAnswer;
    } else if (cat === 'lokalisierung' || id.includes('lokal') || id.includes('locat')) {
      updatedMatrix.lokalisierung = cleanAnswer;
    } else if (cat === 'causa' || id.includes('causa') || id.includes('ausloes') || id.includes('trigger')) {
      updatedMatrix.causa = cleanAnswer;
    } else {
      // Fallback only if no category specified
      if (
        cleanAnswer.toLowerCase().includes('ruhe') || 
        cleanAnswer.toLowerCase().includes('bewegung') || 
        cleanAnswer.toLowerCase().includes('wärme') || 
        cleanAnswer.toLowerCase().includes('kälte')
      ) {
        updatedMatrix.modalitaeten = updatedMatrix.modalitaeten 
          ? `${updatedMatrix.modalitaeten}; ${cleanAnswer}` 
          : cleanAnswer;
      } else {
        if (!updatedMatrix.gemuet || updatedMatrix.gemuet === 'Noch nicht genannt') {
          updatedMatrix.gemuet = cleanAnswer;
        } else if (!updatedMatrix.begleitsymptome.includes(cleanAnswer)) {
          updatedMatrix.begleitsymptome.push(cleanAnswer);
        }
      }
    }

    // Update summary text
    let updatedSummary = analysisResult.end_analyse_zusammenfassung || '';
    if (updatedSummary) {
      if (cat === 'gemuet' || id.includes('gemuet') || updatedMatrix.gemuet === cleanAnswer) {
        const regex = /(•\s*(?:Gemüt|Mind|Mental|Psique|Stato d'animo|Ψυχική διάθεση|Душевное состояние)[^:\n]*:)(.*)/i;
        if (regex.test(updatedSummary)) {
          updatedSummary = updatedSummary.replace(regex, `$1 ${cleanAnswer}`);
        } else {
          updatedSummary += `\n• ${t('hahnemannPillarGemuet')}: ${cleanAnswer}`;
        }
      } else if (cat === 'modalitaeten' || id.includes('modalitaet')) {
        const regex = /(•\s*(?:Modalitäten|Modalities|Modalités|Modalità|Modalidades|Τροποποιητικοί παράγοντες|Модальности)[^:\n]*:)(.*)/i;
        if (regex.test(updatedSummary)) {
          updatedSummary = updatedSummary.replace(regex, `$1 ${updatedMatrix.modalitaeten}`);
        }
      } else if (cat === 'begleitsymptome' || id.includes('begleit')) {
        const regex = /(•\s*(?:Begleitsymptome|Concomitants|Concomitanti|Concomitantes|Συνοδά συμπτώματα|Сопутствующие симптомы)[^:\n]*:)(.*)/i;
        if (regex.test(updatedSummary)) {
          updatedSummary = updatedSummary.replace(regex, `$1 ${updatedMatrix.begleitsymptome.join(', ')}`);
        }
      }
    }

    setAnalysisResult({
      ...analysisResult,
      wichtige_symptom_fragmente: updatedMatrix,
      end_analyse_zusammenfassung: updatedSummary,
    });
  };

  const handleSaveAndTransfer = () => {
    if (!analysisResult) return;
    const summary = analysisResult.end_analyse_zusammenfassung || 
      `• Fall-Charakter: ${caseType === 'chronisch' ? 'Chronischer Fall (§§ 83–98 Organon)' : 'Akuter Fall (§ 99 Organon)'}\n` +
      `• Causa: ${matrix.causa || '—'}\n` +
      `• Lokalisation: ${matrix.lokalisierung || '—'}${matrix.strahlungsoptionen ? ` (${t('hahnemannRadiationLabel')} ${matrix.strahlungsoptionen})` : ''}\n` +
      `• Empfindung: ${matrix.empfindung || '—'}\n` +
      `• Modalitäten: ${matrix.modalitaeten || '—'}\n` +
      `• Begleitsymptome: ${matrix.begleitsymptome.join(', ') || '—'}\n` +
      `• Gemüt: ${matrix.gemuet || '—'}` +
      (matrix.ursaechlicher_zusammenhang ? `\n• Symptomkomplex: ${matrix.ursaechlicher_zusammenhang}` : '') +
      (matrix.fruehere_behandlungen_und_historie ? `\n• Historie / Behandlungen: ${matrix.fruehere_behandlungen_und_historie}` : '');

    onTransferToAnamnese({
      matrix,
      summaryText: summary,
      differentialRemedies: analysisResult.aktuelle_mittel_differenzierung || [],
      caseType,
    });
    onClose();
  };

  // Predefined options based on missing dimensions
  const getFallbackOptions = () => {
    if (!matrix.causa || matrix.causa === 'Noch nicht genannt') {
      return [
        'Kälteeinwirkung (kalter Wind, Zugluft, Durchnässung)',
        'Plötzlicher Schreck / Schock oder akute Angst',
        'Ärger, Zorn oder emotionale Kränkung',
        'Körperliche Überanstrengung oder Verheben',
        'Nahrungsfehler oder Verdorbenes',
        'Kein spezifischer äußerer Auslöser bekannt'
      ];
    }
    if (!matrix.lokalisierung || matrix.lokalisierung === 'Noch nicht genannt') {
      return [
        'Kopf / Stirn / Schläfen / Augen (Ausstrahlung in Nacken)',
        'Hals / Rachen / Mandeln (Ausstrahlung zu den Ohren)',
        'Brustkorb / Bronchien (Ausstrahlung in Rücken)',
        'Magen-Darm-Trakt / Oberbauch (Ausstrahlung um den Nabel)',
        'Gelenke / Bewegungsapparat (Ausstrahlung entlang der Nerven)',
        'Systemisch / Ganzkörperlich (Fieber, Schüttelfrost)'
      ];
    }
    if (!matrix.empfindung || matrix.empfindung === 'Noch nicht genannt') {
      return [
        'Brennend wie glühende Kohlen',
        'Klopfend, hämmernd und pulsierend wie Herztakte',
        'Stechend wie Nadeln bei jeder Bewegung',
        'Dumpf drückend wie ein schweres Gewicht',
        'Wund, zerschlagen und empfindlich gegen Berührung'
      ];
    }
    if (!matrix.modalitaeten || matrix.modalitaeten === 'Noch nicht genannt') {
      return [
        'Besser durch Wärme und Zudecken, schlechter durch Kälte',
        'Besser an kühler Frischluft, Zimmerwärme ist unerträglich',
        'Besser bei absoluter Ruhe und Bewegungslosigkeit',
        'Schlechter durch die geringste Erschütterung und Bewegung',
        'Besser durch festen Druck oder Gegenstemmen'
      ];
    }
    if (!matrix.begleitsymptome || matrix.begleitsymptome.length === 0) {
      return [
        'Großer Durst auf große Mengen kaltes Wasser, trockene Hitze',
        'Völlige Durstlosigkeit trotz hohem Fieber',
        'Starker Schweiß, der nicht erleichtert',
        'Frösteln und Schüttelfrost bei der geringsten Entblößung',
        'Kopfschmerz bei Fieberanstieg'
      ];
    }
    if (!matrix.gemuet || matrix.gemuet === 'Noch nicht genannt') {
      return [
        'Ängstliche motorische Unruhe, Furcht vor dem Alleinsein',
        'Apathisch, schläfrig, will in Ruhe gelassen werden',
        'Sehr gereizt und ärgerlich über jede Ansprache',
        'Weinend, sucht Trost, Zuneigung und Gesellschaft',
        'Gefasst und unauffällig'
      ];
    }
    return [];
  };

  const activeOptions = (analysisResult?.auswahl_optionen && analysisResult.auswahl_optionen.length > 0)
    ? analysisResult.auswahl_optionen
    : getFallbackOptions();

  const contentNode = (
    <div 
      className={`bg-white rounded-2xl ${inline ? 'shadow-sm border border-slate-200' : 'shadow-2xl border border-slate-200 max-w-4xl max-h-[92vh]'} w-full flex flex-col overflow-hidden`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-6 py-4 bg-linear-to-r from-teal-800 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-teal-600/30 border border-teal-500/40 text-teal-200 shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold truncate leading-tight flex items-center gap-2">
              <span>{t('hahnemannOrganonTitle')}</span>
            </h3>
            <p className="text-xs text-teal-200/90 truncate">
              {t('hahnemannOrganonSubtitle')}
              {patientName ? ` • ${patientName}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-teal-700/60 text-teal-100 border border-teal-500/50 text-xs font-semibold">
            {pillarsCount} / 6 {t('activeSectionCompletedBadge')}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={t('termsModalClose')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

        {/* Top Control Bar: Case Type Selector (§ 99 Akut vs §§ 83–98 Chronisch) */}
        <div className="px-6 py-3 bg-teal-50/70 border-b border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-950 flex items-center gap-1.5 shrink-0">
              <Radio className="w-3.5 h-3.5 text-teal-700" />
              {t('hahnemannCaseTypeLabel')}
            </span>
            <div className="inline-flex rounded-lg border border-teal-200 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => handleSwitchCaseType('akut')}
                disabled={isProcessing}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  caseType === 'akut'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-teal-900 hover:bg-teal-50'
                }`}
              >
                {t('hahnemannCaseTypeAcuteShort')}
              </button>
              <button
                type="button"
                onClick={() => handleSwitchCaseType('chronisch')}
                disabled={isProcessing}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  caseType === 'chronisch'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-indigo-900 hover:bg-indigo-50'
                }`}
              >
                {t('hahnemannCaseTypeChronicShort')}
              </button>
            </div>
          </div>

          <div className="text-[11px] text-teal-900/80 italic">
            {caseType === 'akut' 
              ? t('hahnemannCaseTypeAcuteDesc')
              : t('hahnemannCaseTypeChronicDesc')}
          </div>
        </div>

        {/* 6-Pillar Stepper Progress Line */}
        <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-1 overflow-x-auto text-[11px]">
          {[
            { key: 'causa', label: t('hahnemannPillarShortCausa'), isFilled: Boolean(matrix.causa && matrix.causa !== 'Noch nicht genannt'), icon: Activity },
            { key: 'lok', label: t('hahnemannPillarShortLokalisation'), isFilled: Boolean(matrix.lokalisierung && matrix.lokalisierung !== 'Noch nicht genannt'), icon: MapPin },
            { key: 'empf', label: t('hahnemannPillarShortSensation'), isFilled: Boolean(matrix.empfindung && matrix.empfindung !== 'Noch nicht genannt'), icon: Flame },
            { key: 'mod', label: t('hahnemannPillarShortModalitaeten'), isFilled: Boolean(matrix.modalitaeten && matrix.modalitaeten !== 'Noch nicht genannt'), icon: Sliders },
            { key: 'begleit', label: t('hahnemannPillarShortBegleit'), isFilled: Boolean(matrix.begleitsymptome && matrix.begleitsymptome.length > 0), icon: HeartPulse },
            { key: 'gemuet', label: t('hahnemannPillarShortGemuet'), isFilled: Boolean(matrix.gemuet && matrix.gemuet !== 'Noch nicht genannt'), icon: Brain },
          ].map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={pillar.key} 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0 font-medium transition-colors ${
                  pillar.isFilled 
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 font-semibold' 
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${pillar.isFilled ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{idx + 1}. {pillar.label}</span>
                {pillar.isFilled ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* SECTION 1: WAS BISHER VERSTANDEN WURDE (Hahnemann-Symptomstruktur) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-700" />
                  {t('hahnemannWhatWasUnderstood')}
                </h4>
                <p className="text-xs text-slate-500">
                  {t('hahnemannUnderstoodSub')}
                </p>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-50 text-teal-900 border border-teal-200 text-[11px] font-medium self-start sm:self-auto">
                <Check className="w-3.5 h-3.5 text-teal-700" />
                {caseType === 'chronisch' ? t('hahnemannCaseTypeChronicShort') : t('hahnemannCaseTypeAcuteShort')}
              </span>
            </div>

            {/* Separate Chief Complaint / Patient Spontaneous Report */}
            {chiefComplaint && chiefComplaint.trim().length > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-3 text-xs">
                <FileText className="w-4.5 h-4.5 text-teal-700 shrink-0 mt-0.5" />
                <div className="space-y-1.5 w-full">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                    {t('hahnemannPatientOTonTitle')}
                  </span>
                  <p className="text-slate-900 font-medium leading-relaxed italic bg-white p-3 rounded-xl border border-slate-200/60 shadow-3xs">
                    „{chiefComplaint}“
                  </p>
                </div>
              </div>
            )}

            {/* Prüfung auf ursächlichen Zusammenhang bei mehreren Beschwerden (§§ 83–104) */}
            {(analysisResult?.mehrere_symptome_erkannt || matrix.ursaechlicher_zusammenhang) && (
              <div className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                matrix.ursaechlicher_zusammenhang && (matrix.ursaechlicher_zusammenhang.toLowerCase().includes('ja') || matrix.ursaechlicher_zusammenhang.toLowerCase().includes('zeitgleich'))
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-sky-50/80 border-sky-300 text-sky-950'
              }`}>
                <GitBranch className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">
                    {t('hahnemannCausalityCheckTitle')}
                  </span>
                  <p className="text-slate-700">
                    {matrix.ursaechlicher_zusammenhang ? (
                      <span className="font-semibold text-emerald-800">
                        {t('hahnemannCausalityConfirmed')}: {matrix.ursaechlicher_zusammenhang}
                      </span>
                    ) : (
                      t('hahnemannCausalityCheckDesc')
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Chronischer Fall: Historie & frühere Behandlungen Box */}
            {caseType === 'chronisch' && (
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-3">
                <History className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">
                    {t('hahnemannChronicHistoryTitle')}
                  </span>
                  <p className={matrix.fruehere_behandlungen_und_historie ? 'font-medium text-slate-800' : 'italic text-slate-400'}>
                    {matrix.fruehere_behandlungen_und_historie || t('hahnemannNotSpecifiedYet')}
                  </p>
                </div>
              </div>
            )}

            {/* Matrix 6-Pillar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              
              {/* 1. Causa (Auslöser oder Beginn) */}
              <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  {t('hahnemannPillarCausa')}
                </span>
                <p className={`text-xs ${matrix.causa ? 'text-slate-900 font-semibold' : 'text-slate-400 italic'}`}>
                  {matrix.causa || t('hahnemannNotSpecifiedYet')}
                </p>
              </div>

              {/* 2. Lokalisation (Ort & Strahlungsoptionen) */}
              <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  {t('hahnemannPillarLokalisation')}
                </span>
                <p className={`text-xs ${matrix.lokalisierung ? 'text-slate-900 font-semibold' : 'text-slate-400 italic'}`}>
                  {matrix.lokalisierung || t('hahnemannNotSpecifiedYet')}
                </p>
                {matrix.strahlungsoptionen && (
                  <p className="text-[11px] text-teal-800 font-medium">
                    <span className="font-semibold">{t('hahnemannRadiationLabel')} </span>
                    {matrix.strahlungsoptionen}
                  </p>
                )}
              </div>

              {/* 3. Sensation (Qualität der Beschwerde) */}
              <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  {t('hahnemannPillarSensation')}
                </span>
                <p className={`text-xs ${matrix.empfindung ? 'text-slate-900 font-semibold' : 'text-slate-400 italic'}`}>
                  {matrix.empfindung || t('hahnemannNotSpecifiedYet')}
                </p>
              </div>

              {/* 4. Modalitäten (Verschlechterung / Besserung) */}
              <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  {t('hahnemannPillarModalitaeten')}
                </span>
                <p className={`text-xs ${matrix.modalitaeten ? 'text-slate-900 font-semibold' : 'text-slate-400 italic'}`}>
                  {matrix.modalitaeten || t('hahnemannNotSpecifiedYet')}
                </p>
              </div>

              {/* 5. Begleitsymptome (Concomitants) */}
              <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  {t('hahnemannPillarBegleit')}
                </span>
                {matrix.begleitsymptome && matrix.begleitsymptome.length > 0 ? (
                  <ul className="text-xs text-slate-900 font-semibold list-disc list-inside space-y-0.5">
                    {matrix.begleitsymptome.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    {t('hahnemannNotSpecifiedYet')}
                  </p>
                )}
              </div>

              {/* 6. Gemüt (Psychischer Zustand / Seelische Verfassung) */}
              <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  {t('hahnemannPillarGemuet')}
                </span>
                <p className={`text-xs ${matrix.gemuet ? 'text-slate-900 font-semibold' : 'text-slate-400 italic'}`}>
                  {matrix.gemuet || t('hahnemannNotSpecifiedYet')}
                </p>
              </div>
            </div>

            {/* Filterung / Ignorierte Daten falls vorhanden */}
            {analysisResult?.ignorierte_daten && analysisResult.ignorierte_daten.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-100/70 border border-slate-200 text-xs flex items-start gap-2.5">
                <FilterX className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-700 block">
                    {t('hahnemannIgnoredData')}:
                  </span>
                  <span className="text-slate-600">
                    {analysisResult.ignorierte_daten.map(item => `"${item}"`).join(', ')}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {t('hahnemannIgnoredDataDesc')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: DYNAMISCHE EINZELFRAGE-KONTROLLSCHLEIFE */}
          {analysisResult?.analyse_status !== 'completed' && analysisResult?.naechste_frage ? (
            <div className="bg-linear-to-b from-teal-50/80 to-white rounded-xl border-2 border-teal-600/30 p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100 pb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-teal-700" />
                    {t('hahnemannNextQuestionTitle')}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[11px] font-semibold">
                    {t('hahnemannStepIndicator', { current: conversationHistory.length + 1, max: 6 })}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleForceComplete}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  title={t('hahnemannCompleteNowBtn')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>{t('hahnemannCompleteNowBtn')}</span>
                </button>
              </div>

              {/* The Single Question */}
              <div className="p-4 rounded-xl bg-white border border-teal-200 shadow-xs space-y-2">
                <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                  {analysisResult.naechste_frage}
                </p>
                {analysisResult.kontroll_und_nachfrage_logik && (
                  <p className="text-xs text-slate-500 italic">
                    <span className="font-semibold text-slate-600 not-italic">{t('hahnemannRationaleTitle')} </span>
                    {analysisResult.kontroll_und_nachfrage_logik}
                  </p>
                )}
              </div>

              {/* ORGANON REFLECTION & CONFIRMATION DIALOG (§§ 83–84) */}
              {pendingReflection ? (
                <div className="p-5 rounded-xl bg-amber-50/95 border-2 border-amber-300 space-y-3 text-xs text-amber-950 shadow-md animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 font-bold text-amber-900 border-b border-amber-200 pb-2 text-sm">
                    <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
                    <span>Organon-Überprüfung & Spiegelung (§§ 83–84):</span>
                  </div>
                  <p className="font-medium text-slate-900 leading-relaxed text-sm sm:text-base">
                    „Ich habe verstanden: <span className="italic font-bold text-teal-950 bg-white px-2.5 py-1 rounded-md border border-amber-200 block my-2">„{pendingReflection}“</span>. Ist das richtig?“
                  </p>
                  <p className="text-xs text-slate-600 leading-normal">
                    Gemäß Hahnemanns striktem Interpretationsverbot dürfen Angaben niemals ungeprüft als Tatsache angenommen werden. Bitte bestätigen Sie diese Angabe, oder korrigieren Sie sie bei Bedarf mit Ihren eigenen Worten.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200">
                    <button
                      type="button"
                      onClick={() => {
                        const stmt = pendingReflection;
                        setPendingReflection(null);
                        executeFinalSubmission(stmt);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-teal-700 text-white font-bold hover:bg-teal-800 transition-colors shadow-xs cursor-pointer flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Ja, das ist richtig (Als gesichert übernehmen)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentAnswer(pendingReflection);
                        setPendingReflection(null);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white text-slate-700 font-bold border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer text-xs sm:text-sm"
                    >
                      <span>Nein / Korrigieren / Eigene Beschreibung</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* VERBINDLICHES FREITEXTFELD (MANDATORY FREE-TEXT FIELD) MIT VOICE-BUTTON */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                        {t('hahnemannMandatoryFreeText')}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {t('hahnemannFreeTextRequired')}
                      </span>
                    </div>

                    <div className="relative flex items-end gap-2">
                      <textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            const combined = selectedOptions.length > 0
                              ? (currentAnswer.trim() ? `${selectedOptions.join(', ')}. ${currentAnswer.trim()}` : selectedOptions.join(', '))
                              : currentAnswer.trim();
                            handleSendAnswer(combined);
                          }
                        }}
                        disabled={isProcessing}
                        placeholder={t('hahnemannMandatoryFreeTextPlaceholder')}
                        rows={2}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:border-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 resize-none shadow-2xs"
                      />

                      {/* Direct Voice Input Button */}
                      <div className="shrink-0 pb-0.5">
                        <VoiceInputButton
                          size="sm"
                          context="question_answer"
                          value={currentAnswer}
                          onChange={(spokenText) => {
                            setCurrentAnswer(spokenText);
                          }}
                        />
                      </div>
                    </div>

                    {/* Live Extraction Preview (Erkannte Extraktion / Live-Vorschau) */}
                    {currentAnswer.trim().length > 1 && (() => {
                      const previewExt = extractSymptomsDeterministically(currentAnswer, language);
                      return (
                        <div className="p-3 rounded-xl bg-teal-50/90 border border-teal-200 space-y-1.5 text-xs text-slate-800 shadow-xs animate-in fade-in duration-200 mt-2">
                          <div className="flex items-center gap-1.5 font-bold text-teal-900 border-b border-teal-200 pb-1">
                            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                            <span>Erkannte Extraktion (Live-Vorschau nach Organon §§ 83–104):</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div><strong className="text-teal-950">Hauptbeschwerde:</strong> {previewExt.hauptbeschwerde || 'Noch nicht angegeben'}</div>
                            <div><strong className="text-teal-950">Causa:</strong> {previewExt.causa || 'Noch nicht angegeben'}</div>
                            <div><strong className="text-teal-950">Modalitäten:</strong> {previewExt.modalitaeten || 'Noch nicht angegeben'}</div>
                            <div><strong className="text-teal-950">Begleitsymptome:</strong> {previewExt.begleitsymptome || 'Noch nicht angegeben'}</div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="pt-0.5">
                      <span className="text-[11px] text-slate-400">
                        {selectedOptions.length > 0 
                          ? t('hahnemannOptionsSelectedAndFreeText', { count: selectedOptions.length })
                          : t('hahnemannSelectOptionsOrFreeText')}
                      </span>
                    </div>
                  </div>

                  {/* INTERAKTIVE CHRONOLOGISCHE REIHENFOLGE (1, 2, 3...) WENN MEHRERE BESCHWERDEN VORLIEGEN */}
                  {isSequenceQuestion && customSequenceItems.length > 0 && (
                    <div className="p-4 rounded-xl bg-teal-50/80 border-2 border-teal-300 space-y-2.5 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5 uppercase tracking-wide">
                          <GitBranch className="w-4 h-4 text-teal-700" />
                          {language === 'de' ? 'Chronologische Reihenfolge flexibel bestimmen (1, 2, 3...):' : 'Define flexible chronological sequence (1, 2, 3...):'}
                        </span>
                      </div>
                      <p className="text-xs text-teal-900 italic">
                        {language === 'de' ? 'Verschieben Sie die Symptome mit den Pfeilen in die genaue Reihenfolge, in der sie nacheinander auftraten:' : 'Move symptoms using the arrows into the exact sequential order:'}
                      </p>
                      <div className="space-y-1.5 pt-1">
                        {customSequenceItems.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-teal-200 text-xs shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-900 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {iIdx + 1}
                              </span>
                              <span className="font-semibold text-slate-900">{item}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={iIdx === 0}
                                onClick={() => {
                                  moveSequenceItem(iIdx, 'up');
                                  if (!isCustomSequenceActive) {
                                    setIsCustomSequenceActive(true);
                                  }
                                }}
                                className="p-1 rounded hover:bg-teal-100 disabled:opacity-30 disabled:hover:bg-transparent text-teal-900 transition-colors"
                                title={language === 'de' ? 'Nach oben' : 'Move up'}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                disabled={iIdx === customSequenceItems.length - 1}
                                onClick={() => {
                                  moveSequenceItem(iIdx, 'down');
                                  if (!isCustomSequenceActive) {
                                    setIsCustomSequenceActive(true);
                                  }
                                }}
                                className="p-1 rounded hover:bg-teal-100 disabled:opacity-30 disabled:hover:bg-transparent text-teal-900 transition-colors"
                                title={language === 'de' ? 'Nach unten' : 'Move down'}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (isCustomSequenceActive) {
                              setIsCustomSequenceActive(false);
                              setSelectedOptions(prev => prev.filter(o => !o.startsWith('Individuelle Reihenfolge') && !o.startsWith('Custom sequence')));
                            } else {
                              setIsCustomSequenceActive(true);
                              setSelectedOptions(prev => [
                                ...prev.filter(o => !o.startsWith('Individuelle Reihenfolge') && !o.startsWith('Custom sequence')),
                                customSequenceLabel
                              ]);
                            }
                          }}
                          className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            isCustomSequenceActive
                              ? 'bg-teal-700 text-white shadow-sm ring-1 ring-teal-700'
                              : 'bg-white border-2 border-teal-400 text-teal-950 hover:bg-teal-50'
                          }`}
                        >
                          <Check className={`w-4 h-4 ${isCustomSequenceActive ? 'opacity-100' : 'opacity-40'}`} />
                          <span>
                            {isCustomSequenceActive
                              ? (language === 'de' ? 'Individuelle Reihenfolge (1, 2, 3...) übernommen ✓' : 'Custom sequence selected ✓')
                              : (language === 'de' ? 'Diese individuelle Reihenfolge (1, 2, 3...) als Antwort übernehmen' : 'Apply this custom sequence as answer')}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* VORDEFINIERTE ANKLICKBARE OPTIONEN (Auswahlkästen) */}
                  {activeOptions && activeOptions.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-teal-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-teal-700" />
                          {t('hahnemannSelectionBoxesTitle')}
                        </span>
                        {selectedOptions.length > 0 && (
                          <span className="text-[11px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full border border-teal-200">
                            {t('hahnemannOptionsSelectedCount', { count: selectedOptions.length })}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeOptions.map((opt, oIdx) => {
                          const isSelected = selectedOptions.includes(opt);
                          return (
                            <div
                              key={oIdx}
                              onClick={() => {
                                if (analysisResult?.auswahl_typ === 'single') {
                                  setSelectedOptions(prev => prev.includes(opt) ? [] : [opt]);
                                } else {
                                  setSelectedOptions(prev =>
                                    prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]
                                  );
                                }
                              }}
                              className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                                isSelected
                                  ? 'border-teal-600 bg-teal-50/90 text-teal-950 shadow-xs ring-1 ring-teal-600/30'
                                  : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50/90 text-slate-800'
                              }`}
                            >
                              <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-teal-700 border-teal-700 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className={`text-xs leading-snug ${isSelected ? 'font-bold' : 'font-medium'}`}>
                                {opt}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* SECTION 3: ABSCHLUSS & ZUSAMMENFASSUNG */
            <div className="bg-emerald-50/80 rounded-xl border-2 border-emerald-300 p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 text-emerald-900 border-b border-emerald-200 pb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm sm:text-base leading-tight">
                    {t('hahnemannStatusComplete')}
                  </h4>
                  <p className="text-xs text-emerald-700">
                    {t('hahnemannCompleteNotice')}
                  </p>
                </div>
              </div>

              {/* Zusammenfassung */}
              {analysisResult?.end_analyse_zusammenfassung && (
                <div className="p-4 rounded-xl bg-white border border-emerald-200 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed shadow-2xs font-sans">
                  <span className="font-bold text-slate-900 block mb-1">
                    {t('hahnemannTherapistSummary')}
                  </span>
                  {analysisResult.end_analyse_zusammenfassung}
                </div>
              )}

              {/* Differenzial-Mittel */}
              {analysisResult?.aktuelle_mittel_differenzierung && analysisResult.aktuelle_mittel_differenzierung.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">
                    {t('hahnemannRemedyDiff')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.aktuelle_mittel_differenzierung.map((remedy, rIdx) => (
                      <span
                        key={rIdx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-teal-950 border border-emerald-300 shadow-2xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        {remedy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SICH ERGEBENDE KLÄRENDE KONTROLLFRAGEN AUS DEN ANTWORTEN (STRENG BEGRENZT AUF MAX 3) */}
              {(() => {
                const clarifyingQuestions = (analysisResult?.sich_ergebende_fragen && analysisResult.sich_ergebende_fragen.length > 0)
                  ? analysisResult.sich_ergebende_fragen.slice(0, 3)
                  : [];

                if (clarifyingQuestions.length === 0) return null;

                return (
                  <div className="rounded-xl bg-teal-50/70 border-2 border-teal-300 p-4 sm:p-5 shadow-xs space-y-3.5">
                    <div className="border-b border-teal-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
                        <h5 className="font-bold text-sm sm:text-base text-teal-950">
                          {t('hahnemannArisingQuestionsTitle')}
                        </h5>
                      </div>
                      <p className="text-xs text-teal-800 mt-1">
                        {t('hahnemannArisingQuestionsSubtitle')}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {clarifyingQuestions.map((q, qIndex) => {
                        const isAnswered = Boolean(clarifyingAnswers[q.id]);
                        const currentAnswerText = clarifyingAnswers[q.id] || '';
                        const customText = customClarifyingInput[q.id] || '';

                        return (
                          <div
                            key={q.id}
                            className={`p-3.5 rounded-xl border transition-all ${
                              isAnswered
                                ? 'bg-white/95 border-emerald-400 shadow-xs ring-1 ring-emerald-500/20'
                                : 'bg-white border-teal-200 shadow-2xs hover:border-teal-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 border border-teal-200 uppercase tracking-wider">
                                    {qIndex + 1}. {q.kategorie === 'gemuet' ? t('hahnemannPillarGemuet') : q.kategorie === 'modalitaeten' ? t('hahnemannPillarModalitaeten') : q.kategorie === 'begleitsymptome' ? t('hahnemannPillarBegleit') : t('step1Title')}
                                  </span>
                                  {isAnswered && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      {t('hahnemannQuestionAnswered')}
                                    </span>
                                  )}
                                </div>
                                <h6 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                  {q.frage}
                                </h6>
                                {q.grund && (
                                  <p className="text-[11px] text-slate-500 italic">
                                    <span className="font-semibold text-slate-600 not-italic">{t('hahnemannClarifyingQuestionRationale')} </span>
                                    {q.grund}
                                  </p>
                                )}
                              </div>

                              {isAnswered && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setClarifyingAnswers(prev => {
                                      const updated = { ...prev };
                                      delete updated[q.id];
                                      return updated;
                                    });
                                  }}
                                  className="text-xs text-slate-500 hover:text-teal-700 underline shrink-0 cursor-pointer font-medium"
                                >
                                  {t('hahnemannEditAnswerBtn')}
                                </button>
                              )}
                            </div>

                            {/* If Answered */}
                            {isAnswered ? (
                              <div className="mt-2.5 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs font-semibold text-emerald-950 flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{currentAnswerText}</span>
                              </div>
                            ) : (
                              /* If Not Answered: Predefined Options + Free-Text with Voice */
                              <div className="mt-2.5 space-y-2">
                                <div className="flex flex-wrap gap-1.5">
                                  {q.optionen.map((opt, oIdx) => (
                                    <button
                                      key={oIdx}
                                      type="button"
                                      onClick={() => handleAnswerClarifyingQuestion(q.id, opt, q.kategorie)}
                                      className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-800 hover:text-teal-950 transition-colors font-medium cursor-pointer"
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>

                                {/* Mandatory Free-Text Field for Clarifying Question + Voice Button */}
                                <div className="flex items-center gap-1.5 pt-0.5">
                                  <input
                                    type="text"
                                    value={customText}
                                    onChange={(e) => setCustomClarifyingInput(prev => ({ ...prev, [q.id]: e.target.value }))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && customText.trim()) {
                                        handleAnswerClarifyingQuestion(q.id, customText, q.kategorie);
                                      }
                                    }}
                                    placeholder={t('hahnemannMandatoryFreeTextPlaceholder')}
                                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-600 shadow-2xs"
                                  />
                                  <VoiceInputButton
                                    size="sm"
                                    context="question_answer"
                                    value={customText}
                                    onChange={(val) => setCustomClarifyingInput(prev => ({ ...prev, [q.id]: val }))}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (customText.trim()) {
                                        handleAnswerClarifyingQuestion(q.id, customText, q.kategorie);
                                      }
                                    }}
                                    disabled={!customText.trim()}
                                    className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer shadow-2xs"
                                  >
                                    {t('hahnemannConfirmAnswerBtn')}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {snapshotHistory.length > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Zurück</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              {t('btnCancelModal')}
            </button>
          </div>

          <div>
            {analysisResult?.analyse_status !== 'completed' && analysisResult?.naechste_frage ? (
              <button
                type="button"
                onClick={() => {
                  const combined = selectedOptions.length > 0
                    ? (currentAnswer.trim() ? `${selectedOptions.join(', ')}. ${currentAnswer.trim()}` : selectedOptions.join(', '))
                    : currentAnswer.trim();
                  handleSendAnswer(combined);
                }}
                disabled={(!currentAnswer.trim() && selectedOptions.length === 0) || isProcessing}
                className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('regVerifySending')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('hahnemannSubmitAnswerBtn')}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAndTransfer}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{t('hahnemannBtnTransferToCase')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
  );

  if (inline) {
    return contentNode;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl my-auto">
        {contentNode}
      </div>
    </div>
  );
};
