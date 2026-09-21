/**
 * Localisatio-Deep-Dive Spezifikation (Gefrorene Endspezifikation L1–L7)
 * 
 * L1: Anatomische Hauptregion
 * L2: Topographische Unterregion
 * L3: Lateralität / Seitenbezug
 * L4: Wahrgenommene Tiefenlage (Keine unbelegte Gewebediagnose!)
 * L5: Räumliche Ausdehnung / Begrenzung
 * L6: Räumliche Multiplizität / Verteilung
 * L7: Räumliche Dynamik / Ausbreitung
 */

import {
  EpistemicFactStatus,
  DimensionCompletion,
  DimensionApplicability,
  PatientConfidence
} from './causaDeepDive';

// ============================================================
// 1. DIE 7 LOCALISATIO-DIMENSIONEN (L1–L7)
// ============================================================

export type LocalisatioDimensionId =
  | 'L1'  // Anatomische Hauptregion
  | 'L2'  // Topographische Unterregion
  | 'L3'  // Lateralität / Seitenbezug
  | 'L4'  // Wahrgenommene Tiefenlage
  | 'L5'  // Räumliche Ausdehnung / Begrenzung
  | 'L6'  // Räumliche Multiplizität / Verteilung
  | 'L7'; // Räumliche Dynamik / Ausbreitung

export const LOCALISATIO_DIMENSION_KEYS: LocalisatioDimensionId[] = [
  'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'
];

export const LOCALISATIO_DIMENSION_NAMES: Record<LocalisatioDimensionId, string> = {
  L1: 'Anatomische Hauptregion',
  L2: 'Topographische Unterregion',
  L3: 'Lateralität / Seitenbezug',
  L4: 'Wahrgenommene Tiefenlage',
  L5: 'Räumliche Ausdehnung / Begrenzung',
  L6: 'Räumliche Multiplizität / Verteilung',
  L7: 'Räumliche Dynamik / Ausbreitung'
};

// ============================================================
// 2. RÄUMLICHE RELATIONEN & VEKTOREN
// ============================================================

export type SpatialRelationType =
  | 'HINTER'
  | 'VOR'
  | 'OBERHALB'
  | 'UNTERHALB'
  | 'ZWISCHEN'
  | 'ENTLANG'
  | 'UM_HERUM'
  | 'INNEN_IN';

export interface SpatialRelation {
  relationId: string;
  relationType: SpatialRelationType;
  primaryLandmark: string;       // Original-Evidenz: z. B. "rechtes Auge"
  normalizedLandmark?: string;  // Konservativ
  secondaryLandmark?: string;    // z. B. "den Schulterblättern" bei ZWISCHEN
  evidenceQuote: string;
}

export type DynamicVectorType =
  | 'ORTSFEST'
  | 'AUSSTRAHLUNG'
  | 'WANDERUNG'
  | 'WECHSELND';

export interface SpatialDynamicVector {
  vectorId: string;
  vectorType: DynamicVectorType;
  originText: string;            // z. B. "Nacken"
  targetText?: string;           // z. B. "Hinterkopf"
  originStillActive?: boolean;   // Eigenes Beobachtungsfaktum, kein Zwang!
  directionQuality?: string;     // z. B. "aufsteigend", "nach unten ziehend"
  evidenceQuote: string;
}

// ============================================================
// 3. ATOMARE LOCALISATIO-FAKTEN & NORMALISIERUNG
// ============================================================

export interface LocalisatioNormalizedValue {
  patientRawTerm: string;              // Wortgetreuer Ausdruck: z. B. "im Kreuz", "Schläfe"
  conservativeAnatomicalTerm?: string; // z. B. "Lumbo-Sakral-Bereich (unspezifisch)"
  bodySide?: 'RECHTS' | 'LINKS' | 'BEIDSEITS' | 'MITTIG' | 'UNBESTIMMT';
  depthLevel?: string;                 // Phänomenologische Wahrnehmung: "tief", "oberflächlich", "wie im Knochen"
  spreadPattern?: 'PUNKTUELL' | 'UMSCHRIEBEN' | 'DIFFUS_FLÄCHIG' | 'GROSSFLÄCHIG';
  focusMultiplicity?: 'SOLITÄR' | 'MULTIPLE_GETRENNT' | 'DISSEMINIERT';
  dynamicsType?: DynamicVectorType;
  isDeicticUnresolved?: boolean;       // true bei "hier", "da", "genau hier" ohne verbale Anatomie
  [key: string]: any;
}

export interface AtomicLocalisatioFact {
  factId: string;
  dimensionId: LocalisatioDimensionId;
  symptomId: string;                   // Strikte Bindung an Symptom
  episodeId: string;                   // Strikte Bindung an Episode
  evidenceText: string;                // Wortgetreues Patientenzitat
  sourceTurn: number;                  // 0 = Voranalyse, 1..n = Vertiefungs-Turn
  normalizedValue: LocalisatioNormalizedValue;
  epistemicStatus: EpistemicFactStatus;
  patientConfidence: PatientConfidence;
}

// ============================================================
// 4. DIMENSIONS-STATUS & SYMPTOM-STATE
// ============================================================

export interface LocalisatioDimensionState {
  completion: DimensionCompletion;
  applicability: DimensionApplicability;
  summaryNote?: string;
  lastUpdatedTurn?: number;
}

export interface SymptomLocalisatioState {
  symptomId: string;
  symptomLabel: string;
  episodeId: string;
  facts: AtomicLocalisatioFact[];
  dimensions: Record<LocalisatioDimensionId, LocalisatioDimensionState>;
  spatialRelations: SpatialRelation[];
  dynamicVectors: SpatialDynamicVector[];
  isSymptomCompleted: boolean;
  completionReason?: string;
}

// ============================================================
// 5. KANONISCHER GESAMTSTATE
// ============================================================

export interface CanonicalLocalisatioState {
  version: 1;
  activeSymptomId: string;
  symptomOrder: string[];
  symptoms: Record<string, SymptomLocalisatioState>;
  currentTurn: number;
  isFinished: boolean;
  stoppingReason?: string;
  finalSummary?: {
    levelA_patientReported: string[];
    levelB_conservativeNormalizations: string[];
    levelC_unresolvedOrVague: string[];
    synthesizedOrganonSnippet: string;
  } | null;
}
