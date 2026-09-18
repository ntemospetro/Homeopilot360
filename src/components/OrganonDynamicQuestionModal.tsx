import React, { useState, useEffect } from 'react';
import { OrganonComplaintMatrix, OrganonComplaintRelation } from '../services/organonAiService';
import { 
  initDynamicQuestions, 
  submitAnswerAndGetNext, 
  OrganonQuestionEngineState, 
  QuestionHistoryItem 
} from '../services/organonQuestionEngine';
import { MessageSquare, Clock, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, X, ChevronDown, ChevronUp } from 'lucide-react';

interface OrganonDynamicQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawText: string;
  initialMatrices: OrganonComplaintMatrix[];
  initialRelations: OrganonComplaintRelation[];
}

export const OrganonDynamicQuestionModal: React.FC<OrganonDynamicQuestionModalProps> = ({
  isOpen,
  onClose,
  rawText,
  initialMatrices,
  initialRelations
}) => {
  const [engineState, setEngineState] = useState<OrganonQuestionEngineState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [showOriginalText, setShowOriginalText] = useState<boolean>(false);
  const [editableRawText, setEditableRawText] = useState<string>(rawText || '');

  useEffect(() => {
    setEditableRawText(rawText || '');
    if (isOpen) {
      setEngineState(null);
      setError(null);
      if (rawText && rawText.trim()) {
        startEngine(rawText, initialMatrices, initialRelations);
      }
    }
  }, [isOpen, rawText]);

  const startEngine = async (textToUse: string, matrices: OrganonComplaintMatrix[], relations: OrganonComplaintRelation[]) => {
    if (!textToUse || !textToUse.trim()) {
      setError('Bitte geben Sie zuerst eine Anamnese / Patienten-Schilderung ein.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const state = await initDynamicQuestions(textToUse, matrices, relations);
      setEngineState(state);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Starten der Frageengine');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!engineState || !engineState.next_question || !answerInput.trim()) return;

    const currentQText = engineState.next_question.text;
    const ans = answerInput.trim();
    setAnswerInput('');
    setLoading(true);
    setError(null);

    try {
      const updatedState = await submitAnswerAndGetNext(
        editableRawText,
        engineState.complaint_matrices,
        engineState.complaint_relations,
        engineState.question_history,
        ans,
        currentQText
      );
      setEngineState(updatedState);
    } catch (err: any) {
      setError(err.message || 'Fehler bei der Antwortverarbeitung');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-600 rounded-xl text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Organon: Dynamische Fallaufnahme (§§ 83–104)</h2>
              <p className="text-xs text-slate-300">Schrittweiser Einzelfragen-Dialog auf Basis der Symptommatrix</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
              <button 
                onClick={() => startEngine(editableRawText, initialMatrices, initialRelations)}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] transition-colors"
              >
                Erneut versuchen
              </button>
            </div>
          )}

          {/* Loading State without engineState */}
          {loading && !engineState && (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
              <p className="text-xs font-medium text-slate-600">Initialisiere dynamische Fallaufnahme & Symptommatrix...</p>
            </div>
          )}

          {/* Input state if no engineState and not loading (e.g. initial empty text or error) */}
          {!engineState && !loading && (
            <div className="max-w-xl mx-auto py-8 space-y-4 text-center">
              <div className="p-3 bg-teal-50 w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-teal-700">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Patienten-O-Ton / Anamnese eingeben</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Geben Sie die Schilderung des Patienten ein, um den strukturierten Einzelfragen-Dialog nach Hahnemann & Bönninghausen zu starten.
              </p>
              <textarea
                rows={5}
                value={editableRawText}
                onChange={(e) => setEditableRawText(e.target.value)}
                placeholder="Hier Fallbeschreibung / Patienten-O-Ton einfügen..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => startEngine(editableRawText, initialMatrices, initialRelations)}
                disabled={!editableRawText.trim()}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors shadow flex items-center justify-center gap-2"
              >
                <span>Dynamische Fallaufnahme starten</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Engine State */}
          {engineState && (
            <div className="space-y-6">
              
              {/* Original Patient Text Accordion */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <button 
                  onClick={() => setShowOriginalText(!showOriginalText)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wide"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                    Originaler Patienten-O-Ton (Unverändert)
                  </span>
                  <span className="flex items-center gap-1 text-teal-700">
                    {showOriginalText ? 'Ausblenden' : 'Anzeigen'}
                    {showOriginalText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>
                {showOriginalText && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-slate-800 text-xs italic font-serif leading-relaxed">
                    „{editableRawText}“
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Complaint Matrices & History */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Complaint Matrices */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>Aktuelle Beschwerdematrizen ({engineState.complaint_matrices.length})</span>
                    </h3>

                    <div className="space-y-3">
                      {engineState.complaint_matrices.map((comp) => (
                        <div key={comp.complaint_id} className="bg-teal-50/30 p-4 rounded-xl border border-teal-200/80 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-teal-900 text-sm">{comp.patient_label}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-bold text-[10px]">
                                {comp.temporal_status}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                                {comp.complaint_type}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-teal-100">
                            <div><span className="text-slate-400 font-mono">Onset:</span> {comp.onset || 'Unbekannt'}</div>
                            <div><span className="text-slate-400 font-mono">Dauer:</span> {comp.duration || 'Unbekannt'}</div>
                            <div><span className="text-slate-400 font-mono">Intensität:</span> {comp.intensity || 'Unbekannt'}</div>
                            <div><span className="text-slate-400 font-mono">Verlauf:</span> {comp.course || 'Akut'}</div>
                          </div>

                          <div className="flex flex-wrap gap-2 text-[10px]">
                            {comp.location && <span className="px-2 py-0.5 rounded bg-white border border-teal-100 text-teal-900"><b>Lokalisation:</b> {comp.location}</span>}
                            {comp.sensation && <span className="px-2 py-0.5 rounded bg-white border border-teal-100 text-teal-900"><b>Sensation:</b> {comp.sensation}</span>}
                            {comp.causa && <span className="px-2 py-0.5 rounded bg-white border border-teal-100 text-teal-900"><b>Causa:</b> {comp.causa}</span>}
                          </div>

                          {comp.modalities && (Array.isArray(comp.modalities) ? comp.modalities.length > 0 : Boolean(comp.modalities)) && (
                            <div className="text-[11px] text-slate-700 bg-white/60 p-2 rounded border border-teal-100/50">
                              <b>Modalitäten:</b> {Array.isArray(comp.modalities) ? comp.modalities.filter(Boolean).join(', ') : String(comp.modalities)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Question History */}
                  {engineState.question_history.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Fragehistorie & Verlauf</h3>
                      <div className="space-y-2">
                        {engineState.question_history.map((hist) => (
                          <div key={hist.step} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                            <div className="flex items-center justify-between text-slate-500 font-mono text-[10px]">
                              <span>Schritt {hist.step}</span>
                              <span className="text-emerald-700 font-bold">Aktualisiert</span>
                            </div>
                            <div className="font-semibold text-slate-900">F: {hist.question}</div>
                            <div className="text-slate-700 bg-white p-2 rounded border border-slate-100">A: {hist.answer}</div>
                            {hist.extracted_updates && (
                              <div className="text-[10px] text-teal-800 font-mono">Status: {hist.extracted_updates}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Col: Active Question & Input */}
                <div className="space-y-4">
                  
                  <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-4">
                    <div className="flex items-center justify-between border-b border-teal-800/60 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-300">Aktuelle Einzelfrage</span>
                      <span className="px-2 py-0.5 rounded bg-teal-800 text-teal-100 font-mono text-[10px]">
                        Schritt {engineState.question_history.length + 1}
                      </span>
                    </div>

                    {engineState.is_finished ? (
                      <div className="space-y-3 py-4 text-center">
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-sm text-white">Fallaufnahme ausreichend strukturiert</h4>
                        <p className="text-xs text-teal-200 leading-relaxed">
                          Die wesentlichen aktuellen Beschwerden, Modalitäten und zeitlichen Bezüge wurden erfasst. Der Fall ist bereit für die Repertorisation.
                        </p>
                        <button
                          onClick={onClose}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow"
                        >
                          Aufnahme abschließen & übernehmen
                        </button>
                      </div>
                    ) : engineState.next_question ? (
                      <form onSubmit={handleSubmitAnswer} className="space-y-4">
                        <div className="space-y-1.5">
                          <p className="text-sm font-semibold text-white leading-snug">
                            {engineState.next_question.text}
                          </p>
                          {engineState.next_question.reason && (
                            <p className="text-[10px] text-teal-300 italic">
                              Ziel: {engineState.next_question.reason}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={answerInput}
                            onChange={(e) => setAnswerInput(e.target.value)}
                            placeholder="Antwort des Patienten eingeben..."
                            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
                          />
                          <button
                            type="submit"
                            disabled={loading || !answerInput.trim()}
                            className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow"
                          >
                            {loading ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <span>Antwort übermitteln & nächste Frage</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="py-6 text-center text-xs text-teal-200">
                        Keine weiteren offenen Fragen erforderlich.
                      </div>
                    )}
                  </div>

                  {/* Summary / Status */}
                  {engineState.summary && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                      <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">Letzte Aktualisierung</span>
                      <p className="text-slate-600">{engineState.summary}</p>
                    </div>
                  )}

                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
