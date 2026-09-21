/**
 * UI und API-Typen für die Localisatio-Vertiefung (Stage 2)
 */

import {
  LocalisatioDimensionId,
  CanonicalLocalisatioState,
  AtomicLocalisatioFact,
  SpatialRelation,
  SpatialDynamicVector
} from './types/localisatioDeepDive';

export interface LocalisatioQuestion {
  questionId: string;
  questionText: string;
  orientationExample?: string;
  reason: string;
  targetDimension: LocalisatioDimensionId;
  targetSymptomId: string;
  targetSymptomLabel: string;
  arbitrationNote?: string;
  agentOpinions?: {
    gemini?: { questionText: string; reason: string; targetDimension: string };
    gpt?: { questionText: string; reason: string; targetDimension: string };
  };
}

export interface LocalisatioHistoryEntry {
  step: number;
  question: string;
  orientationExample?: string;
  answer: string;
  extractedNotes?: string;
  symptomId?: string;
  dimension?: LocalisatioDimensionId;
}

export interface LocalisatioEvidenceItem {
  id: string;
  content: string;
  status: string;
  originalQuote: string;
  source: string;
  assignedSymptom: string;
  symptomId: string;
  episodeId: string;
  dimension: LocalisatioDimensionId;
  normalizedValue?: any;
  patientConfidence?: string;
}

export interface LocalisatioSummaryThreeLevels {
  levelA_patientReported: string[];
  levelB_conservativeNormalizations: string[];
  levelC_unresolvedOrVague: string[];
  overallResult: string;
}

export interface LocalisatioVertiefungState {
  activeSymptomId: string;
  symptomOrder: string[];
  symptoms: Record<string, {
    symptomId: string;
    symptomLabel: string;
    episodeId: string;
    facts: AtomicLocalisatioFact[];
    dimensions: Record<LocalisatioDimensionId, {
      completion: string;
      applicability: string;
      summaryNote?: string;
    }>;
    spatialRelations: SpatialRelation[];
    dynamicVectors: SpatialDynamicVector[];
    isSymptomCompleted: boolean;
    completionReason?: string;
  }>;
  knownFacts: Array<{ text: string; evidence: string; symptomId?: string; dimension?: string }>;
  openAspects: Array<{ text: string; reason: string; symptomId?: string; dimension?: string }>;
  evidenceList: LocalisatioEvidenceItem[];
  currentQuestion: LocalisatioQuestion | null;
  history: LocalisatioHistoryEntry[];
  isFinished: boolean;
  stoppingReason?: string;
  finalSummary: LocalisatioSummaryThreeLevels | null;
  canonicalState?: CanonicalLocalisatioState | null;
  turnDurations?: {
    geminiMs?: number;
    gptMs?: number;
    waitBothMs?: number;
    arbitratorMs?: number;
    totalMs?: number;
  };
  pipelineMode?: 'gemini-only' | '3-tier' | 'ab-compare';
  endprueferResult?: any | null;
}

export interface LocalisatioAbCompareState {
  branchA: LocalisatioVertiefungState;
  branchB: LocalisatioVertiefungState;
  pipelineMode: 'ab-compare';
}
