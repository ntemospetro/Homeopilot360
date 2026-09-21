export type CausaEvidenceStatus = 
  | 'EXPLICIT' 
  | 'DENIED' 
  | 'UNCERTAIN' 
  | 'AMBIGUOUS' 
  | 'UNKNOWN' 
  | 'CONFLICT'
  | 'BELEGT_FAKTISCH'
  | 'UNSICHER'
  | 'NICHT_ERINNERLICH'
  | 'AUSDRÜCKLICH_VERNEINT'
  | 'WIDERSPRÜCHLICH'
  | 'MEHRDEUTIG'
  | 'UNERHOBEN';

export interface CausaEvidenceItem {
  id: string;
  content: string;
  status: CausaEvidenceStatus;
  originalQuote: string;
  source: string;
  assignedSymptom: string;
  dimension?: string;
  dimensionId?: string;
  episodeId?: string;
  patientConfidence?: string;
  epistemicRelation?: string;
  semanticTarget?: string;
}

export interface CausaKnownItem {
  text: string;
  evidence: string;
  dimension?: string;
  dimensionId?: string;
  factId?: string;
  semanticTarget?: string;
  status?: CausaEvidenceStatus;
}

export interface CausaOpenItem {
  id?: string;
  text: string;
  reason: string;
  dimensionId?: string;
  dimension?: string;
  semanticTarget?: string;
  clarifiable?: boolean;
  priority?: 'HOCH' | 'MITTEL' | 'NIEDRIG';
  existingEvidenceSnippet?: string;
}

export interface CausaQuestion {
  questionId: string;
  questionText: string;
  orientationExample: string;
  reason: string;
  targetDimension?: string;
  arbitrationNote?: string;
  agentOpinions?: {
    geminiQuestion: string;
    gptQuestion: string;
  };
}

export interface CausaHistoryEntry {
  step: number;
  question: string;
  orientationExample?: string;
  answer: string;
  extractedNotes?: string;
}

export interface CausaSummaryThreeLevels {
  levelA_patientReported: string[]; // Ebene A: Tatsächlich vom Patienten angegeben
  levelB_unresolvedOrConflicting: string[]; // Ebene B: Nicht geklärt / unsicher / widersprüchlich
  levelC_homeopathicInterpretation: string[]; // Ebene C: Spätere homöopathische Interpretation
  overallResult?: string;
}

export interface CausaVertiefungState {
  knownFacts: CausaKnownItem[];
  openAspects: CausaOpenItem[];
  evidenceList: CausaEvidenceItem[];
  currentQuestion: CausaQuestion | null;
  history: CausaHistoryEntry[];
  isFinished: boolean;
  stoppingReason?: string;
  finalSummary: CausaSummaryThreeLevels | null;
  /** Kanonischer CausaState nach Spezifikation V2 (Paket 1) */
  canonicalState?: import('./types/causaDeepDive').CanonicalCausaState;
  /** Laufzeitmessungen pro Turn */
  turnDurations?: {
    geminiMs?: number;
    gptMs?: number;
    waitBothMs?: number;
    arbitratorMs?: number;
    totalMs?: number;
  };
  /** Aktiver Prüfmodus: 'gemini-only' (Testmodus), '3-tier' (Original 3-Instanzen-Prüfung) oder 'ab-compare' (Paralleler A/B-Vergleich) */
  pipelineMode?: 'gemini-only' | '3-tier' | 'ab-compare';
  endprueferResult?: any;
}

export interface CausaAbCompareState {
  branchA: CausaVertiefungState; // Zweig A: 3-Instanzen-Pipeline (Gemini + GPT + Schiedsrichter)
  branchB: CausaVertiefungState; // Zweig B: Gemini-only (Single-Call)
}

// Re-export aller neuen Causa-Deep-Dive Typen für nahtlose Abwärtskompatibilität
export * from './types/causaDeepDive';
