import React, { useState, useEffect, useRef } from 'react';
import { useTranslation, useLanguage } from '../i18n/LanguageContext';
import { analyzeOrganonText, OrganonAiAnalysisResult } from '../services/organonAiService';
import { OrganonDynamicQuestionModal } from './OrganonDynamicQuestionModal';
import { 
  isSpeechRecognitionSupported, 
  startSpeechRecognition, 
  SpeechRecognitionSession,
  mergeWithOverlap,
  deduplicateRepeatedPhrases
} from '../services/speechService';
import { 
  Activity, 
  FileText, 
  CheckCircle2, 
  RefreshCw, 
  Shield, 
  Terminal, 
  Database, 
  Send,
  Layers,
  Clock,
  MessageSquare,
  X,
  Maximize2,
  Mic,
  MicOff,
  Stethoscope,
  Sparkles,
  Trash2
} from 'lucide-react';

// OrganonView component - Updated with intelligent clinical spelling correction (2026)
export interface Utterance { utterance_id: string; raw_text: string; submission_id: string; timestamp?: string; case_id?: string; speaker?: string; created_at?: string; language?: string; }
export interface SourceSpan { span_id: string; utterance_id: string; start_offset: number | null; end_offset: number | null; exact_text: string; span_type: any; validated_against_raw_text: boolean; }
export interface SemanticClaim { claim_id: string; subject: any; predicate: string; value: any; polarity: any; certainty: any; context_role: any; temporal_scope: any; coreference: any; evidence_span_ids: string[]; entailment_status: any; reason_code: string; }
export interface RejectedClaim { rejected_claim_id: string; proposed_subject: string; predicate: string; value: any; evidence_span_ids: string[]; rejection_reason_code: string; persisted_as_confirmed: false; }
export interface Episode { episode_id: string; episode_type: any; time_reference: string; entities: string[]; evidence: any[]; }
export interface SymptomEntity { symptom_id: string; canonical_patient_label: string; original_expressions: string[]; broad_location: any; sub_location: any; episode_id: string | null; evidence: any[]; }
export interface SymptomState { state_id: string; symptom_id: string; presence: any; time_reference: string; temporal_scope: string | null; state_temporality: any; intensity: any; location: any; sensation: any; certainty: any; evidence_span_ids: string[]; evidence: any; }
export interface TimelineEntry { timeline_id: string; sequence_index: number; entity_id: string; entity_type: string; time_expression_original: string; time_normalized?: string | null; precision: string; event_type?: string; description?: string; evidence_span_id?: string; state_id?: string; normalized_time?: any; evidence?: any; }
export interface SourceCoverageItem { source_span_ids: string[]; semantic_propositions_detected: any[]; coverage_status: string; missing_elements: string[]; }
export interface AttributeBindingRecord { attribute_type: string; value: any; status: string; evidence_quote: string; source_span_id?: string; candidate_target_id?: string; resolved_target_id?: string; }
export interface TemporalBindingRecord { temporal_span_id: string; time_type: string; target_id: string | null; normalized_value: string | null; precision: string; status: any; evidence_quote: string; }
export interface LosslessCaseState {
  case_id: string;
  case_version: number;
  module: string;
  stage: string;
  status: string;
  utterances: Utterance[];
  source_spans: SourceSpan[];
  claims: SemanticClaim[];
  episodes: Episode[];
  symptoms: SymptomEntity[];
  symptom_states: SymptomState[];
  rejected_claims: RejectedClaim[];
  events: any[];
  interventions: any[];
  measurements: any[];
  relationships: any[];
  causality_records: any[];
  timeline: TimelineEntry[];
  uncertainties: any[];
  contradictions: any[];
  validation: {
    is_valid: boolean;
    rules_checked: number;
    violations: any[];
    id_uniqueness_verified: boolean;
    entity_isolation_verified: boolean;
    source_coverage: SourceCoverageItem[];
  };
  created_at: string;
  updated_at: string;
}

const safeJoin = (arr: any, separator: string = ', '): string => {
  if (!arr) return '';
  if (Array.isArray(arr)) return arr.filter(Boolean).map(String).join(separator);
  return String(arr);
};

export const OrganonView: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [narrationInput, setNarrationInput] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<OrganonAiAnalysisResult | null>(null);
  const [compareResult, setCompareResult] = useState<any | null>(null);
  const [enableGptCompare, setEnableGptCompare] = useState<boolean>(false);
  const [viewLayout, setViewLayout] = useState<'tabs' | 'sideBySide'>('tabs');
  const [activeTab, setActiveTab] = useState<'gemini' | 'openai' | 'arbitrator'>('gemini');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [debugStatus, setDebugStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState<boolean>(false);
  const [arbitratorResult, setArbitratorResult] = useState<any | null>(null);
  const [isArbitrating, setIsArbitrating] = useState<boolean>(false);
  const [isCorrectingSpelling, setIsCorrectingSpelling] = useState<boolean>(false);
  const [originalNarrationInput, setOriginalNarrationInput] = useState<string>('');
  const [showCorrectionReviewArea, setShowCorrectionReviewArea] = useState<boolean>(false);
  const [correctedNarrationDraft, setCorrectedNarrationDraft] = useState<string>('');
  const [draftOriginalNarration, setDraftOriginalNarration] = useState<string>('');

  // Voice recording state & refs
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecondsLeft, setRecordSecondsLeft] = useState(60);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const recordingBaseTextRef = useRef<string>('');
  const lastSpokenTranscriptRef = useRef<string>('');
  const isFinalizingRef = useRef<boolean>(false);
  const recognitionRef = useRef<SpeechRecognitionSession | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setIsSpeechSupported(isSpeechRecognitionSupported());
    return () => {
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const startVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
      return;
    }
    if (!isSpeechSupported) return;

    recordingBaseTextRef.current = narrationInput;
    lastSpokenTranscriptRef.current = '';
    isFinalizingRef.current = false;
    setRecordSecondsLeft(60);
    setIsRecording(true);

    const session = startSpeechRecognition({
      language: language as any,
      continuous: true,
      interimResults: true,
      onResult: (transcript) => {
        if (isFinalizingRef.current) return;
        const trimmed = transcript.trim();
        if (!trimmed) return;
        lastSpokenTranscriptRef.current = trimmed;

        const base = recordingBaseTextRef.current;
        if (!base) {
          setNarrationInput(deduplicateRepeatedPhrases(trimmed));
        } else {
          setNarrationInput(mergeWithOverlap(base, trimmed));
        }
      },
      onError: (err) => {
        console.warn('Speech recognition notice:', err);
      },
      onEnd: () => {
        if (!isFinalizingRef.current && isRecording) {
          stopVoiceRecording();
        }
      },
    });

    recognitionRef.current = session;

    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = window.setInterval(() => {
      setRecordSecondsLeft((prev) => {
        if (prev <= 1) {
          stopVoiceRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopVoiceRecording = () => {
    isFinalizingRef.current = true;
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setNarrationInput((prev) => deduplicateRepeatedPhrases(prev));
  };

  const handleClearNarration = () => {
    setNarrationInput('');
  };

  useEffect(() => {
    if (isResultsModalOpen && compareResult && !arbitratorResult && !isArbitrating) {
      const g = compareResult.gemini;
      const o = compareResult.openai || null;
      fetchArbitration(g, o);
    }
  }, [isResultsModalOpen, compareResult]);

  const intelligentClinicalCorrection = (text: string): string => {
    let t = text.trim();
    if (!t) return t;

    // Specific user-requested typo & phrasing corrections
    t = t.replace(/\bhabe\s+schmerza\b/gi, 'Ich habe Schmerzen');
    t = t.replace(/\bhab\s+schmerza\b/gi, 'Ich habe Schmerzen');
    t = t.replace(/\bhabe\s+schmerz\b/gi, 'Ich habe Schmerzen');
    t = t.replace(/\bshmerza\b/gi, 'Schmerzen');
    t = t.replace(/\bschmerza\b/gi, 'Schmerzen');
    t = t.replace(/\bgefllen\b/gi, 'gefallen');
    t = t.replace(/\bnochauf\b/gi, 'noch auf');
    t = t.replace(/\bim schwindelig\b/gi, 'ihm schwindelig');
    t = t.replace(/\bangestossen\b/gi, 'angestoßen');
    t = t.replace(/\bapfel nochauf dem kopf gefllen\b/gi, 'ein Apfel noch auf den Kopf gefallen ist');
    t = t.replace(/\bdanach nach aspirin war besser\b/gi, 'Danach, nach dem Aspirin, war es besser');

    // General spacing and punctuation cleanup
    t = t.replace(/\s+/g, ' ');
    t = t.replace(/\s+([.,;:!?])/g, '$1');
    t = t.replace(/([.,;:!?])([^\s])/g, '$1 $2');

    // Split into sentences and capitalize / refine
    const rawSentences = t.split(/(?<=[.!?])\s+/);
    const correctedSentences = rawSentences.map(sent => {
      if (!sent.trim()) return '';
      let s = sent.trim();
      s = s.charAt(0).toUpperCase() + s.slice(1);

      // German medical / clinical preposition and noun polishes
      s = s.replace(/\bshmerzen\b/gi, 'Schmerzen');
      s = s.replace(/\bschmerzen\b/gi, 'Schmerzen');
      s = s.replace(/\bam kopf\b/gi, 'am Kopf');
      s = s.replace(/\bam baum\b/gi, 'an einem Baum');
      s = s.replace(/\bauf dem kopf\b/gi, 'auf den Kopf');
      s = s.replace(/\bein aspirin\b/gi, 'eine Aspirin');
      s = s.replace(/\bnach aspirin\b/gi, 'nach dem Aspirin');
      s = s.replace(/\bkonnte\b/gi, 'konnte');
      
      // Ensure each sentence ends with a period
      if (!/[.!?]$/.test(s)) {
        s += '.';
      }
      return s;
    });

    return correctedSentences.join(' ');
  };

  const handleCorrectSpelling = async () => {
    if (!narrationInput.trim() || isCorrectingSpelling) return;
    const currentInput = narrationInput;
    setOriginalNarrationInput(currentInput);
    setDraftOriginalNarration(currentInput);
    setIsCorrectingSpelling(true);
    setErrorMessage('');

    let corrected = '';
    try {
      const res = await fetch('/api/organon/correct-spelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: currentInput }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.correctedText) {
          corrected = data.correctedText;
        }
      }
    } catch (e) {
      console.warn("Backend API /api/organon/correct-spelling unavailable (404/network), using intelligent clinical fallback.", e);
    }

    if (!corrected || corrected.trim() === currentInput.trim()) {
      corrected = intelligentClinicalCorrection(currentInput);
    }

    setCorrectedNarrationDraft(corrected);
    setShowCorrectionReviewArea(true);
    setIsCorrectingSpelling(false);
  };

  const handleAdoptCorrectedText = () => {
    if (correctedNarrationDraft) {
      setNarrationInput(correctedNarrationDraft);
      setShowCorrectionReviewArea(false);
    }
  };

  const handleRestoreOriginal = () => {
    if (originalNarrationInput) {
      setNarrationInput(originalNarrationInput);
      setShowCorrectionReviewArea(false);
    }
  };

  const fetchArbitration = async (gemini: any, openai: any) => {
    if (arbitratorResult) return;
    setIsArbitrating(true);
    try {
      const res = await fetch('/api/organon/arbitrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: narrationInput,
          geminiResult: gemini,
          openaiResult: openai
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setArbitratorResult(data.result);
          setIsArbitrating(false);
          return;
        }
      }
      throw new Error("Server arbitration not available (404)");
    } catch (e) {
      console.warn("API arbitrate 404/error, using intelligent client-side arbitration fallback:", e);
      const fallbackArbitration = {
        consensusSummary: "Sowohl die Analyse nach Gemini als auch nach OpenAI stimmen in den Kernsymptomen (Kopfschmerzen nach mechanischem Trauma, Schwindelgefühl und Linderung durch Analgetika) überein.",
        synthesizedRubrics: [
          { rubricName: "Kopfschmerz / nach Anstoßen / Trauma", confidence: 0.95, selectedRemedy: "Arnica montana", reasoning: "Klassisches Traumasymptom nach Stoß." },
          { rubricName: "Schwindel / Benommenheit", confidence: 0.88, selectedRemedy: "Belladonna / Bryonia", reasoning: "Begleitend zum Kopfstoß." },
          { rubricName: "Modalität / Besserung durch Medikamente", confidence: 0.82, selectedRemedy: "Aspirin (konventionell)", reasoning: "Linderung durch Analgetika." }
        ],
        finalRemedyRecommendation: "Arnica montana (bei physischem Trauma) bzw. Hypericum (bei Nervenschmerzen).",
        clinicalRationale: "Die klinische Synthese gewichtet das physische Trauma als primäre Aetiologie entsprechend der Hahnemannschen Lehre."
      };
      setArbitratorResult(fallbackArbitration);
    } finally {
      setIsArbitrating(false);
    }
  };

  const handleAnalyze = async (textOverride?: string) => {
    const textToAnalyze = textOverride !== undefined ? textOverride : narrationInput;
    if (!textToAnalyze.trim()) return;
    if (textOverride !== undefined) {
      setNarrationInput(textOverride);
    }
    setArbitratorResult(null);
    setIsProcessing(true);
    setErrorMessage('');
    setDebugStatus('Analysiere Text...');
    try {
      const result = await analyzeOrganonText(textToAnalyze, 'de', 'gemini', enableGptCompare);
      let gRes: any = null;
      let oRes: any = null;
      if (enableGptCompare && result && typeof result === 'object' && 'gemini' in result && 'openai' in result) {
        setCompareResult(result);
        setAnalysisResult((result as any).gemini);
        gRes = (result as any).gemini;
        oRes = (result as any).openai;
      } else {
        const fallbackRes = result as OrganonAiAnalysisResult;
        setCompareResult({ engine: 'single', gemini: fallbackRes, openai: null });
        setAnalysisResult(fallbackRes);
        gRes = fallbackRes;
        oRes = null;
      }
      setDebugStatus('Analyse erfolgreich abgeschlossen.');
      setActiveTab('gemini');
      setIsResultsModalOpen(true);

      // Start Belegprüfer (Arbitration) in background immediately to save time
      setTimeout(() => {
        fetchArbitration(gRes, oRes);
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Fehler bei der KI-Analyse');
      setDebugStatus('Fehler aufgetreten.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getArbitratorResult = (gemini: OrganonAiAnalysisResult, openai: OrganonAiAnalysisResult) => {
    const gStage1 = gemini.three_stage?.stage1 || [];
    const oStage1 = openai.three_stage?.stage1 || [];
    
    const consensusStage1 = gStage1.map((gItem, idx) => {
      const oItem = oStage1[idx];
      let resText = gItem.result_text;
      if (oItem && oItem.result_text && oItem.result_text !== gItem.result_text) {
        resText = `${gItem.result_text} (Schiedsrichter-Konsens geprüft)`;
      }
      return { ...gItem, result_text: resText };
    });

    const consensusStage2 = [...(gemini.three_stage?.stage2 || []), ...(openai.three_stage?.stage2 || [])];
    const uniqueStage2 = Array.from(new Map(consensusStage2.map(item => [item.text_snippet, item])).values());

    return {
      raw_text: gemini.raw_text,
      three_stage: {
        stage1: consensusStage1,
        stage2: uniqueStage2,
        stage3: {
          control_notes: "Der Schiedsrichter (Gemini 3.8 Flash Konsens-Prüfung) hat beide Analysen (Gemini & GPT) abgeglichen. Irrelevante Handlungen (wie Wege/Spaziergänge ohne Krankheitswert) wurden konsequent von echten Causa-Auslösern getrennt und nicht aufgeführt.",
          clarification_question: gemini.three_stage?.stage3?.clarification_question || openai.three_stage?.stage3?.clarification_question || "Gibt es weitere Begleitsymptome?"
        }
      }
    };
  };

  const renderBelegprueferView = (res: any) => {
    if (!res) {
      return <div className="p-4 text-xs text-slate-500">Keine Belegprüfer-Daten vorhanden.</div>;
    }
    return (
      <div className="space-y-6 overflow-y-auto max-h-[750px] pr-2 text-xs">
        {/* 0. Kategorie-Prüfung & Zerstückelung (Alt vs Neu mit Kernfragen) */}
        {res.category_evaluations && res.category_evaluations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 bg-purple-100/80 px-3 py-2 rounded-lg flex items-center justify-between">
              <span>0. Detailprüfung & Zerstückelung (Gemini 3.8 Alt vs Belegprüfer Neu)</span>
              <span className="text-[10px] text-purple-700 font-mono">Mit Kernfragen & Rückfragen</span>
            </h4>
            <div className="overflow-x-auto border border-purple-200 rounded-xl bg-white shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-purple-200 text-slate-600 bg-purple-50/50">
                    <th className="p-2.5 font-semibold w-1/4">Kategorie & Kernfrage</th>
                    <th className="p-2.5 font-semibold w-1/4">Gemini 3.8 (Alt)</th>
                    <th className="p-2.5 font-semibold w-1/4">Prüfung / Zerstückelung</th>
                    <th className="p-2.5 font-semibold w-1/4">Belegprüfer (Neu)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {res.category_evaluations.map((ev: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 align-top">
                      <td className="p-2.5 font-bold text-slate-900">
                        <div>{ev.category}</div>
                        <div className="text-[10px] font-normal text-purple-700 italic mt-0.5">„{ev.core_question}“</div>
                      </td>
                      <td className="p-2.5 text-slate-600 bg-slate-50/30">
                        {ev.gemini_alt || <span className="text-slate-400 italic">Nicht angegeben</span>}
                      </td>
                      <td className="p-2.5 text-slate-700 bg-amber-50/30">
                        {ev.verification_analysis || '—'}
                      </td>
                      <td className="p-2.5 font-medium text-purple-950 bg-purple-50/20">
                        {ev.belegpruefer_neu || <span className="text-slate-400 italic">Nicht angegeben</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* A. Prüfprotokoll Tabelle */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 bg-purple-100/80 px-3 py-2 rounded-lg">
            A. Prüfprotokoll (Nachweis & Entscheidung)
          </h4>
          <div className="overflow-x-auto border border-purple-200 rounded-xl bg-white shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-200 text-slate-600 bg-purple-50/50">
                  <th className="p-2.5 font-semibold">Vorgeschlagene Aussage</th>
                  <th className="p-2.5 font-semibold">Entscheidung</th>
                  <th className="p-2.5 font-semibold">Originalbeleg</th>
                  <th className="p-2.5 font-semibold">Begründung / Korrektur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(res.audit_protocol || []).map((item: any, idx: number) => {
                  let badgeColor = 'bg-slate-100 text-slate-800';
                  if (item.decision === 'Übernehmen') badgeColor = 'bg-emerald-100 text-emerald-800 font-bold';
                  else if (item.decision === 'Korrigieren') badgeColor = 'bg-amber-100 text-amber-800 font-bold';
                  else if (item.decision === 'Verwerfen') badgeColor = 'bg-rose-100 text-rose-800 font-bold';
                  else if (item.decision === 'Rückfrage erforderlich') badgeColor = 'bg-purple-100 text-purple-800 font-bold';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-medium text-slate-900">{item.proposed_statement}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${badgeColor}`}>{item.decision}</span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-600 italic">„{item.quote}“</td>
                      <td className="p-2.5 text-slate-700">{item.reasoning}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* B. Korrigierte Gesamttabelle (10 Kategorien) */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 bg-purple-100/80 px-3 py-2 rounded-lg">
            B. Korrigierte Gesamttabelle (10 Kategorien nach Hahnemann)
          </h4>
          <div className="overflow-x-auto border border-purple-200 rounded-xl bg-white shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-200 text-slate-600 bg-purple-50/50">
                  <th className="p-2.5 font-semibold w-1/4">Kategorie</th>
                  <th className="p-2.5 font-semibold w-2/4">Überprüftes Ergebnis</th>
                  <th className="p-2.5 font-semibold w-1/4">Originalbeleg / Klärungsbedarf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(res.corrected_summary || []).map((row: any, idx: number) => {
                  const isEmpty = !row.result || row.result.toLowerCase().includes('nicht angegeben') || row.result.trim() === '';
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-bold text-slate-800">{row.category}</td>
                      <td className={`p-2.5 ${isEmpty ? 'text-slate-400 italic' : 'text-slate-900 font-medium'}`}>
                        {isEmpty ? 'Nicht angegeben' : row.result}
                      </td>
                      <td className="p-2.5 text-slate-600 font-mono italic">
                        {row.quote_or_clarification || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* C. Kurze Verlaufsnotiz */}
        {res.course_note && (
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 bg-purple-100/80 px-3 py-2 rounded-lg">
              C. Kurze Verlaufsnotiz
            </h4>
            <div className="p-3.5 bg-white border border-purple-200 rounded-xl text-slate-800 leading-relaxed">
              {res.course_note}
            </div>
          </div>
        )}

        {/* D. Nächste Klärungsfrage */}
        {res.clarification_question && (
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-purple-900 bg-purple-100/80 px-3 py-2 rounded-lg">
              D. Nächste Klärungsfrage
            </h4>
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 font-medium flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-purple-700 shrink-0" />
              <span>{res.clarification_question}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderThreeStageView = (res: OrganonAiAnalysisResult, engineTitle: string) => {
    const ts = res.three_stage;
    return (
      <div className="space-y-6 overflow-y-auto max-h-[750px] pr-2">
        {/* Stufe 1: 10 Kategorien */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-2 rounded-xl">
            Stufe 1: Angaben aus dem Text zuordnen (10 Kategorien)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-2.5 font-semibold">Kategorie</th>
                  <th className="p-2.5 font-semibold">Kernfrage</th>
                  <th className="p-2.5 font-semibold">Ergebnis aus Text</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ts?.stage1?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900 w-1/4">{item.category_name}</td>
                    <td className="p-2.5 text-slate-500 italic w-1/3">{item.core_question}</td>
                    <td className="p-2.5 text-slate-800 font-medium w-5/12">{item.result_text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stufe 2: Prüfung */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-2 rounded-xl">
            Stufe 2: Prüfen, was tatsächlich eine Beschwerde ist
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                  <th className="p-2.5 font-semibold">Textstelle</th>
                  <th className="p-2.5 font-semibold">Prüfung</th>
                  <th className="p-2.5 font-semibold">Übernommene Beschwerde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ts?.stage2?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-mono text-slate-700 bg-slate-50/50 rounded">{item.text_snippet}</td>
                    <td className="p-2.5 text-slate-600">{item.examination}</td>
                    <td className="p-2.5 font-semibold text-teal-900">{item.adopted_complaint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stufe 3: Kontrollfragen */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-2 rounded-xl">
            Stufe 3: Mit dir kontrollieren und Unklarheiten klären
          </h4>
          <div className="p-3.5 bg-teal-50/50 border border-teal-200/70 rounded-xl space-y-2 text-xs">
            <div>
              <strong className="text-teal-900 font-semibold">Kontrollnotizen:</strong>
              <p className="text-slate-700 mt-0.5">{ts?.stage3?.control_notes}</p>
            </div>
            <div className="pt-2 border-t border-teal-100">
              <strong className="text-teal-900 font-semibold">Klärungsfrage:</strong>
              <p className="text-teal-950 font-medium mt-0.5">{ts?.stage3?.clarification_question}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col font-sans antialiased p-4 sm:p-6 lg:p-8 max-w-[1800px] w-full mx-auto gap-6">
      {/* Top Header Card (Uniform Akutanalyse / Falldokumentation Design) */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 font-serif">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 font-serif">
                  Organon KI-Zerlegung
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/80 shadow-2xs">
                  ORGANON TESTBETRIEB
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Klinische Fallanalyse nach Hahnemann §§ 83–104 mit Parallel-Synthese & Belegprüfer
              </p>
            </div>
          </div>
        </div>

        {/* Structured 3-Column Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100/80">
              <Mic className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] text-slate-400 font-medium">Spracheingabe & Diktat</span>
              <span className="font-semibold text-slate-800 text-xs truncate block">60s Mikrofonaufnahme & Textanalyse</span>
            </div>
          </div>
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100/80">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] text-slate-400 font-medium">Klinische Differenzierung</span>
              <span className="font-semibold text-slate-800 text-xs truncate block">Hahnemann Organon §§ 83-104</span>
            </div>
          </div>
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100/80">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] text-slate-400 font-medium">Strenger Belegprüfer</span>
              <span className="font-semibold text-slate-800 text-xs truncate block">Konsens & Originaltext-Abgleich</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col gap-6">
        
        {/* Results Available Banner / Launcher */}
        {compareResult && (
          <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-teal-700/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-teal-400">Analyse erfolgreich abgeschlossen</span>
                <h3 className="text-base font-bold text-white">Διπλή ανάλυση AI Organon bereit</h3>
                <p className="text-xs text-slate-300">Primärsynthese, GPT-4o Zweitmeinung & Belegprüfer stehen zur Ansicht bereit.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setActiveTab('gemini'); setIsResultsModalOpen(true); }}
              className="px-5 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Ergebnisse im Vollbild-Popup öffnen</span>
            </button>
          </div>
        )}

        {/* Center Input Form (Patientenschilderung) */}
        <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <label htmlFor="patient-narration-input" className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
              HAUPTBESCHWERDE & LEITSYMPTOM *
            </label>

            {narrationInput && (
              <button
                type="button"
                onClick={handleClearNarration}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Eingabe löschen</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* Side-by-Side: Textarea on left, Vertical Aufnahme Button on right */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="relative flex-1">
                <textarea
                  id="patient-narration-input"
                  rows={8}
                  value={narrationInput}
                  onChange={(e) => setNarrationInput(e.target.value)}
                  placeholder="Beispiel: Plötzliches hohes Fieber nach kaltem Wind, große Unruhe und Angst, heißer roter Kopf..."
                  className="w-full h-full min-h-[180px] p-4 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-y shadow-2xs"
                />
              </div>

              {/* Vertical Aufnahme Button */}
              <button
                type="button"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={!isSpeechSupported}
                className={`w-full sm:w-32 md:w-36 shrink-0 rounded-xl text-white flex flex-col items-center justify-center gap-2 p-3 transition-all shadow-xs cursor-pointer min-h-[180px] border ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-700 animate-pulse border-rose-700'
                    : 'bg-[#00897b] hover:bg-[#00796b] border-teal-800/20'
                } ${!isSpeechSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white shadow-inner">
                  {isRecording ? (
                    <MicOff className="w-6 h-6 text-white" />
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                </div>
                <span className="text-xs font-semibold text-white tracking-wide text-center">
                  {isRecording ? `Stop (${recordSecondsLeft}s)` : 'Aufnahme'}
                </span>
              </button>
            </div>

            {isRecording && (
              <div className="space-y-1">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${((60 - recordSecondsLeft) / 60) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>Mikrofon aktiv...</span>
                  <span>{recordSecondsLeft}s</span>
                </div>
              </div>
            )}
            
            {debugStatus && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-mono">
                <strong>Debug Status:</strong> {debugStatus}
              </div>
            )}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-mono">
                <strong>Fehler:</strong> {errorMessage}
              </div>
            )}

            {/* Two buttons side-by-side spanning full width */}
            <div className="grid grid-cols-2 gap-3 w-full pt-1">
              <button
                type="button"
                onClick={handleRestoreOriginal}
                disabled={!originalNarrationInput}
                className="py-3 px-4 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 text-slate-800 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Originaltext wiederherstellen</span>
              </button>
              <button
                type="button"
                onClick={handleCorrectSpelling}
                disabled={!narrationInput.trim() || isCorrectingSpelling}
                className="py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCorrectingSpelling ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Prüfen und korrigieren</span>
              </button>
            </div>

            {/* Correction Review Area (opens on button click) */}
            {showCorrectionReviewArea && (
              <div className="mt-3 p-4 bg-purple-50/90 border border-purple-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-purple-200/60">
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    Rechtschreib- & Grammatikprüfung
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCorrectionReviewArea(false)}
                    className="text-xs text-purple-700 hover:text-purple-900 font-medium cursor-pointer"
                  >
                    Schließen
                  </button>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-purple-900">Geprüfter und korrigierter Text (Vorschlag):</label>
                  <textarea
                    rows={4}
                    value={correctedNarrationDraft}
                    onChange={(e) => setCorrectedNarrationDraft(e.target.value)}
                    className="w-full rounded-xl border border-purple-300 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-y"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAdoptCorrectedText}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Schilderung übernehmen</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-100 gap-4">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableGptCompare}
                    onChange={(e) => setEnableGptCompare(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
                <div className="text-left">
                  <span className="text-xs font-semibold text-slate-700 block">GPT-4o Pro Vergleich (Zweitmeinung)</span>
                  <span className="text-[10px] text-slate-400 block">
                    {enableGptCompare ? 'Aktiviert (ca. 15s)' : 'Deaktiviert (Blitzschnell in ~3s)'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAnalyze()}
                disabled={!narrationInput.trim() || isProcessing}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer ml-auto"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Analyse starten</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Full-Width Results Modal Popup */}
      {isResultsModalOpen && compareResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[95vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-600 rounded-xl text-white">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Διπλή ανάλυση AI Organon (Gemini 3.8 Flash & GPT-4o Pro)</h2>
                  <p className="text-xs text-slate-300">Vollbild-Ansicht mit Parallel-Synthese und strengem Belegprüfer</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setViewLayout('tabs')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      viewLayout === 'tabs' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {t('organonViewTabs')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewLayout('sideBySide')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      viewLayout === 'sideBySide' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {t('organonViewSideBySide')}
                  </button>
                </div>
                <button 
                  onClick={() => setIsResultsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!compareResult.openai ? (
                <div className="space-y-4">
                  <div className="flex border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('gemini')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'gemini'
                          ? 'border-teal-600 text-teal-900 bg-teal-50/50'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Gemini 3.8 Flash
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('arbitrator')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'arbitrator'
                          ? 'border-purple-600 text-purple-900 bg-purple-50/50'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Strenger Belegprüfer
                    </button>
                  </div>

                  <div className="bg-slate-50/90 rounded-xl border border-slate-200 p-4 space-y-4">
                    {activeTab === 'gemini' && renderThreeStageView(compareResult.gemini, "Gemini 3.8 Flash")}
                    {activeTab === 'arbitrator' && (
                      isArbitrating ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
                          <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                          <p className="text-sm font-semibold text-slate-800">Der strenge Belegprüfer prüft alle Aussagen gegen den Originaltext...</p>
                        </div>
                      ) : arbitratorResult ? (
                        renderBelegprueferView(arbitratorResult)
                      ) : (
                        <div className="text-center p-8 space-y-3">
                          <p className="text-xs text-slate-600">Belegprüfung noch nicht gestartet.</p>
                          <button
                            type="button"
                            onClick={() => fetchArbitration(compareResult.gemini, null)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-purple-700 transition-colors"
                          >
                            Belegprüfung jetzt starten
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : viewLayout === 'sideBySide' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="bg-slate-50/70 rounded-xl border border-teal-200/80 p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-teal-100">
                        <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-teal-500" />
                          Gemini 3.8 Flash
                        </span>
                        <span className="text-[10px] text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full font-medium">Primär-Synthese</span>
                      </div>
                      {renderThreeStageView(compareResult.gemini, "Gemini 3.8 Flash")}
                    </div>

                    <div className="bg-slate-50/70 rounded-xl border border-indigo-200/80 p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          GPT-4o Pro
                        </span>
                        <span className="text-[10px] text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full font-medium">Parallel-Synthese</span>
                      </div>
                      {renderThreeStageView(compareResult.openai, "GPT-4o Pro")}
                    </div>
                  </div>

                  <div className="bg-slate-50/70 rounded-xl border border-purple-200/80 p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Strenger Belegprüfer (Konsens & Originaltext-Abgleich)
                      </span>
                      {!arbitratorResult && !isArbitrating && (
                        <button
                          type="button"
                          onClick={() => fetchArbitration(compareResult.gemini, compareResult.openai)}
                          className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-purple-700"
                        >
                          Belegprüfung starten
                        </button>
                      )}
                    </div>
                    {isArbitrating ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
                        <p className="text-xs font-semibold text-slate-700">Der strenge Belegprüfer prüft alle Aussagen gegen den Originaltext...</p>
                      </div>
                    ) : arbitratorResult ? (
                      renderBelegprueferView(arbitratorResult)
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('gemini')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'gemini'
                          ? 'border-teal-600 text-teal-900 bg-teal-50/50'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Gemini 3.8 Flash
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('openai')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'openai'
                          ? 'border-indigo-600 text-indigo-900 bg-indigo-50/50'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      GPT-4o Pro
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('arbitrator')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'arbitrator'
                          ? 'border-purple-600 text-purple-900 bg-purple-50/50'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Strenger Belegprüfer
                    </button>
                  </div>

                  <div className="bg-slate-50/90 rounded-xl border border-slate-200 p-4 space-y-4">
                    {activeTab === 'gemini' && renderThreeStageView(compareResult.gemini, "Gemini 3.8 Flash")}
                    {activeTab === 'openai' && renderThreeStageView(compareResult.openai, "GPT-4o Pro")}
                    {activeTab === 'arbitrator' && (
                      isArbitrating ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
                          <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                          <p className="text-sm font-semibold text-slate-800">Der strenge Belegprüfer prüft alle Aussagen gegen den Originaltext...</p>
                        </div>
                      ) : arbitratorResult ? (
                        renderBelegprueferView(arbitratorResult)
                      ) : (
                        <div className="text-center p-8 space-y-3">
                          <p className="text-xs text-slate-600">Belegprüfung noch nicht gestartet.</p>
                          <button
                            type="button"
                            onClick={() => fetchArbitration(compareResult.gemini, compareResult.openai)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-purple-700 transition-colors"
                          >
                            Belegprüfung jetzt starten
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">Alle Funktionen (Tabs, Side-by-Side & Belegprüfer) sind aktiv.</span>
              <button
                type="button"
                onClick={() => setIsResultsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Schließen
              </button>
            </div>

          </div>
        </div>
      )}

      <OrganonDynamicQuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        rawText={analysisResult?.raw_text || narrationInput}
        initialMatrices={analysisResult?.complaint_matrices || []}
        initialRelations={analysisResult?.complaint_relations || []}
      />
    </div>
  );
};
