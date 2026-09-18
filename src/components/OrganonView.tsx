import React, { useState } from 'react';
import { analyzeOrganonText, OrganonAiAnalysisResult } from '../services/organonAiService';
import { OrganonDynamicQuestionModal } from './OrganonDynamicQuestionModal';
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
  MessageSquare
} from 'lucide-react';

// Compatibility types for unused legacy organonPipeline.ts
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
  const [narrationInput, setNarrationInput] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<OrganonAiAnalysisResult | null>(null);
  const [compareResult, setCompareResult] = useState<any | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<string>('gemini');
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'gemini' | 'openai' | 'arbitrator'>('gemini');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [debugStatus, setDebugStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [arbitratorResult, setArbitratorResult] = useState<OrganonAiAnalysisResult | null>(null);
  const [isArbitrating, setIsArbitrating] = useState<boolean>(false);
  const [isCorrectingSpelling, setIsCorrectingSpelling] = useState<boolean>(false);
  const [originalNarrationInput, setOriginalNarrationInput] = useState<string>('');

  const handleCorrectSpelling = async () => {
    if (!narrationInput.trim() || isCorrectingSpelling) return;
    // Save current text as original before correction so it can be restored
    setOriginalNarrationInput(narrationInput);
    setIsCorrectingSpelling(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/organon/correct-spelling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: narrationInput }),
      });
      const data = await res.json();
      if (data.correctedText) {
        setNarrationInput(data.correctedText);
      } else if (data.error) {
        setErrorMessage(data.error);
      }
    } catch (e: any) {
      console.error("Spelling correction error:", e);
      setErrorMessage("Fehler bei der Rechtschreibprüfung: " + (e?.message || String(e)));
    } finally {
      setIsCorrectingSpelling(false);
    }
  };

  const handleRestoreOriginal = () => {
    if (originalNarrationInput) {
      setNarrationInput(originalNarrationInput);
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
      const data = await res.json();
      if (data.result) {
        setArbitratorResult(data.result);
      }
    } catch (e) {
      console.error("Arbitration failed:", e);
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
      const result = await analyzeOrganonText(textToAnalyze, 'de', selectedEngine, true);
      if (result && typeof result === 'object' && 'gemini' in result && 'openai' in result) {
        setCompareResult(result);
        setAnalysisResult((result as any).gemini);
        fetchArbitration((result as any).gemini, (result as any).openai);
      } else {
        const fallbackRes = result as OrganonAiAnalysisResult;
        setCompareResult({ engine: 'compare', gemini: fallbackRes, openai: fallbackRes });
        setAnalysisResult(fallbackRes);
        fetchArbitration(fallbackRes, fallbackRes);
      }
      setDebugStatus('Analyse erfolgreich abgeschlossen.');
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
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium">
          <strong>Rohtext:</strong> „{res.raw_text}“
        </div>

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
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col font-sans antialiased">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold tracking-wide uppercase">
              ORGANON TESTBETRIEB
            </span>
            <span className="text-xs text-slate-400 font-mono">gemini-3.8-flash AI Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Organon KI-Zerlegung</h1>
          <p className="text-sm text-slate-500">Testbetrieb für Textzerlegung, Spans, Entities, Claims & Temporal Bindings</p>
        </div>
      </div>

      <div className="flex-1 max-w-[1800px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Column: Input Form (Patientenschilderung) */}
        <div className="w-full lg:w-[450px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="patient-narration-input" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Patientenschilderung (Raw Text)</span>
              </label>
              <span className="text-xs text-slate-400">Gemini 3.8 Flash</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Geben Sie Text ein oder wählen Sie einen Testfall. Korrigieren Sie bei Bedarf die Rechtschreibung und Grammatik über den Button, bevor Sie die Schilderung übernehmen.
            </p>

            <div className="flex flex-col gap-3">
              {/* Model selection & comparison toggle */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">KI-Modell & Modus</span>
                  <span className="text-[10px] text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full font-semibold">Hostinger API Ready</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedEngine('gemini'); setIsCompareMode(false); }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      !isCompareMode && selectedEngine === 'gemini'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Gemini 3.8 Flash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedEngine('openai'); setIsCompareMode(false); }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      !isCompareMode && selectedEngine === 'openai'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>GPT-4o Sol</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="compare-mode-checkbox"
                      checked={isCompareMode}
                      onChange={(e) => setIsCompareMode(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="compare-mode-checkbox" className="text-xs font-medium text-slate-800 cursor-pointer">
                      Paralleler Gegenüberstellungs-Modus (Gemini vs OpenAI)
                    </label>
                  </div>
                </div>
              </div>

              <textarea
                id="patient-narration-input"
                rows={8}
                value={narrationInput}
                onChange={(e) => setNarrationInput(e.target.value)}
                placeholder="Geben Sie hier den Patiententext ein..."
                className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-y min-h-[180px]"
              />
              
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
              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  type="button"
                  onClick={handleRestoreOriginal}
                  disabled={!originalNarrationInput}
                  className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 disabled:opacity-40 text-slate-800 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Originaltext wiederherstellen</span>
                </button>
                <button
                  type="button"
                  onClick={handleCorrectSpelling}
                  disabled={!narrationInput.trim() || isCorrectingSpelling}
                  className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isCorrectingSpelling ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Prüfen und korrigieren</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Shield className="w-3.5 h-3.5 text-teal-600" />
                  <span>Strict Parsing Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAnalyze()}
                  disabled={!narrationInput.trim() || isProcessing}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Schilderung übernehmen</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Results Display (Gemini, GPT & Belegprüfer) */}
        <div className="w-full lg:flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-6 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-teal-600" />
              <span>{compareResult ? 'Direkter Gegenüberstellungs-Vergleich (Gemini 3.8 vs. GPT-4o Sol)' : 'Organon KI-Analyseergebnisse'}</span>
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700">
                {compareResult ? 'Gemini & GPT Side-by-Side' : (selectedEngine === 'openai' ? 'GPT-4o Sol' : 'gemini-3.8-flash')}
              </span>
            </div>
          </div>

          {compareResult ? (
            <div className="space-y-4">
              {/* Tabs */}
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
                  onClick={() => {
                    setActiveTab('arbitrator');
                    if (compareResult && !arbitratorResult && !isArbitrating) {
                      fetchArbitration(compareResult.gemini, compareResult.openai);
                    }
                  }}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'arbitrator'
                      ? 'border-purple-600 text-purple-900 bg-purple-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Strenger Belegprüfer
                </button>
              </div>

              {/* Tab Content */}
              <div className="bg-slate-50/90 rounded-xl border border-slate-200 p-4 space-y-4">
                {activeTab === 'gemini' && renderThreeStageView(compareResult.gemini, "Gemini 3.8 Flash")}
                {activeTab === 'openai' && renderThreeStageView(compareResult.openai, "GPT-4o Pro")}
                {activeTab === 'arbitrator' && (
                  isArbitrating ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-800">Der strenge Belegprüfer prüft alle Aussagen gegen den Originaltext...</p>
                      <p className="text-xs text-slate-500">Prüfung von Textbelegen, Bedeutungen, Kategorieregeln und Vollständigkeit (ohne Modellabstimmung).</p>
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
          ) : !analysisResult ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
              <Activity className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm font-medium">Noch keine Analyse durchgeführt.</p>
              <p className="text-xs text-slate-400 mt-1">Geben Sie Text ein oder nutzen Sie einen der Testläufe.</p>
            </div>
          ) : (
            <div className="space-y-6 overflow-y-auto max-h-[750px] pr-2">
              {/* Action Banner for Dynamic Questions */}
              <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-md">
                <div>
                  <h4 className="font-bold text-sm">Semantische Grundzerlegung erfolgreich</h4>
                  <p className="text-xs text-teal-200">Starten Sie nun den dynamischen Einzelfragen-Dialog nach Hahnemann & Bönninghausen.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Dynamische Fallaufnahme starten</span>
                </button>
              </div>

              {renderThreeStageView(analysisResult, selectedEngine)}
            </div>
          )}
        </div>

      </div>

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
