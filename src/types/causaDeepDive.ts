/**
 * Causa-Deep-Dive & Multi-Agent Spezifikation (Paket 1: Datenmodell & Invarianten)
 * 
 * Beinhaltet:
 * - Die 13 verbindlichen Causa-Dimensionen (C1–C13)
 * - Epistemischer Fact-Status (BELEGT_FAKTISCH, NICHT_ERINNERLICH, etc.)
 * - Dimension Completion & Applicability
 * - Patient Confidence (SICHERE_BEOBACHTUNG, VERMUTUNG, etc.)
 * - Epistemische Relation (ZEITLICHE_KOINZIDENZ, SUBJEKTIVE_HYPOTHESE, etc.)
 * - Atomares Fact-Modell (AtomicCausaFact) mit Qualifikatoren, Episodenzuordnung und Evidence Ceiling
 * - OrganonAugmentationCandidate
 * - Kanonischer CausaState & Multi-Agent CausaTurnDelta
 */

// ============================================================
// 1. DIE 13 CAUSA-DIMENSIONEN (C1–C13)
// ============================================================

export type CausaDimensionId =
  | 'C1'  // Chronologischer Beginn
  | 'C2'  // Unmittelbare Vorphase
  | 'C3'  // Konkreter Anlass/Ereignis
  | 'C4'  // Phänomenologie der Einwirkung
  | 'C5'  // Organismischer Ausgangszustand
  | 'C6'  // Wahrnehmung & Sofortreaktion
  | 'C7'  // Chronologie & Latenz
  | 'C8'  // Patienteneigene Zuschreibung
  | 'C9'  // Konkurrierende Faktoren
  | 'C10' // Akute Einwirkung vs. Hintergrund
  | 'C11' // Reproduzierbarkeit & Gegenprobe
  | 'C12' // Historischer Vorzustand
  | 'C13'; // Aufrechterhaltende Einwirkung

export const CAUSA_DIMENSION_KEYS: CausaDimensionId[] = [
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13'
];

export const CAUSA_DIMENSION_NAMES: Record<CausaDimensionId, string> = {
  C1: 'Chronologischer Beginn',
  C2: 'Unmittelbare Vorphase',
  C3: 'Konkreter Anlass/Ereignis',
  C4: 'Phänomenologie der Einwirkung',
  C5: 'Organismischer Ausgangszustand',
  C6: 'Wahrnehmung & Sofortreaktion',
  C7: 'Chronologie & Latenz',
  C8: 'Patienteneigene Zuschreibung',
  C9: 'Konkurrierende Faktoren',
  C10: 'Akute Einwirkung vs. Hintergrund',
  C11: 'Reproduzierbarkeit & Gegenprobe',
  C12: 'Historischer Vorzustand',
  C13: 'Aufrechterhaltende Einwirkung'
};

// ============================================================
// 2. EPISTEMISCHER FACT-STATUS
// ============================================================

/**
 * BELEGT_FAKTISCH: Patient hat die Tatsache ausdrücklich berichtet.
 * (Bedeutet NICHT: die medizinische oder kausale Interpretation sei bewiesen!)
 * 
 * NICHT_ERINNERLICH: Patient erinnert den Sachverhalt nicht („kann kein Ereignis nennen“, „weiß nicht mehr“).
 * (Bedeutet NICHT: AUSDRÜCKLICH_VERNEINT!)
 */
export type EpistemicFactStatus =
  | 'UNERHOBEN'
  | 'BELEGT_FAKTISCH'
  | 'UNSICHER'
  | 'MEHRDEUTIG'
  | 'WIDERSPRÜCHLICH'
  | 'NICHT_ERINNERLICH'
  | 'AUSDRÜCKLICH_VERNEINT';

// ============================================================
// 3. DIMENSION COMPLETION & ANWENDBARKEIT
// ============================================================

export type DimensionCompletion =
  | 'UNERHOBEN'
  | 'TEILWEISE_ERHOBEN'
  | 'AUSREICHEND_ERHOBEN'
  | 'NICHT_WEITER_KLÄRBAR';

export type DimensionApplicability =
  | 'APPLIKABEL'
  | 'OBSOLET_DURCH_KONTEXT';

export interface CausaDimensionState {
  completion: DimensionCompletion;
  applicability: DimensionApplicability;
  summaryNote?: string;
  lastUpdatedTurn?: number;
}

// ============================================================
// 4. PATIENT CONFIDENCE
// ============================================================

/**
 * Trennt strikt epistemische Unsicherheit (vielleicht, scheint, könnte)
 * von rein deskriptiven Frequenzmarkern (manchmal, oft).
 */
export type PatientConfidence =
  | 'SICHERE_BEOBACHTUNG'
  | 'VERMUTUNG'
  | 'UNSICHER_SCHWANKEND'
  | 'WEISS_NICHT';

// ============================================================
// 5. EPISTEMISCHE RELATION
// ============================================================

export type EpistemicRelation =
  | 'ZEITLICHE_KOINZIDENZ'
  | 'SUBJEKTIVE_HYPOTHESE'
  | 'KONSISTENTE_ASSOZIATION'
  | 'AUSGESCHLOSSEN';

// ============================================================
// 6. EPISODEN-MODELL
// ============================================================

/**
 * Jeder Fact ist an eine Episode bzw. Phänomenidentität gebunden.
 * Verhindert das unzulässige Vermengen von Erstbeginn, Einzelepisoden
 * und fortbestehender Exposition.
 */
export type CausaEpisodeId =
  | 'EP_INITIAL'           // Erstbeginn der Beschwerden
  | 'EP_RECURRENT'         // Spätere / wiederkehrende Anfälle
  | 'EP_SINGLE_EXERTION'   // Einzelepisode (z. B. nach Anstrengung/Schwitzen)
  | 'EP_CHRONIC_EXPOSURE'  // Dauerhafte / fortbestehende Exposition (z. B. kühler Arbeitsplatz)
  | 'EP_HISTORICAL'        // Historischer Vorzustand / frühere andere Beschwerden
  | string;                // Freie Id für dynamische Einzelepisoden

// ============================================================
// 7. QUALIFIKATOREN & ATOMARES VALUE-MODELL
// ============================================================

export interface CausaNormalizedValue {
  // Primäre Inhaltsfelder
  reiz?: string;
  wirkung?: string;
  zustand?: string;
  voraktivitaet?: string;
  arbeitsumgebung?: string;
  sensation?: string;
  lokalisation?: string;

  // Zeitliche Felder
  zeitpunkt?: string;
  intervall?: string;
  latenz?: string;

  // Streng zu erhaltende Qualifikatoren (Evidence Ceiling)
  epistemischerQualifikator?: string; // z.B. "scheint", "vielleicht", "könnte", "vermutlich"
  frequenz?: string;                 // z.B. "manchmal", "oft", "gelegentlich", "immer"
  praezision?: string;               // z.B. "ungefähr", "unscharf", "exakt"

  // Strukturierte Flags
  konkretesEreignisBenennbar?: boolean;
  schmerzOhneNoxe?: boolean;
  zweifelAnKausalitaet?: boolean;
  fruehereBeschwerdenVorhanden?: boolean;
  identitaetMitErstbeginn?: boolean | null;

  // Beliebig erweiterbar für domänenspezifische atomare Attribute
  [key: string]: any;
}

// ============================================================
// 8. ATOMARER CAUSA-FACT
// ============================================================

export interface AtomicCausaFact {
  factId: string;
  dimensionId: CausaDimensionId;
  factType: string;
  evidenceText: string;              // Wortgetreues Zitat aus Patiententext
  sourceTurn: number;                // 0 = Voranalyse/Ersttext, 1..n = Causa-Turn
  episodeId: CausaEpisodeId;
  normalizedValue: CausaNormalizedValue;
  epistemicStatus: EpistemicFactStatus;
  patientConfidence?: PatientConfidence;
  epistemicLink?: EpistemicRelation;
  relatedSymptomField?: 'lokalisation_und_sensatio' | 'modalitaet' | 'ausloeser' | 'zeit' | 'begleitsymptom' | string;
}

// ============================================================
// 9. ORGANON-AUGMENTATION-CANDIDATES
// ============================================================

export interface OrganonAugmentationCandidate {
  field: 'Localisatio' | 'Sensatio' | 'Modalitaet_Verschlechterung' | 'Modalitaet_Besserung' | 'Begleitsymptom' | 'Gemuet' | string;
  text: string;
  qualifier?: string;                // z.B. "gelegentlich bei heutigen Anfällen" oder "scheint manchmal"
  sourceFactId?: string;
  confidence: 'SICHER' | 'UNSICHER' | 'VERMUTUNG';
  isApprovedForOrganon?: boolean;
}

// ============================================================
// 10. KANONISCHER CAUSA-STATE
// ============================================================

export interface CanonicalCausaState {
  version: 2;
  facts: AtomicCausaFact[];
  dimensions: Record<CausaDimensionId, CausaDimensionState>;
  openAmbiguities: string[];
  terminalPaths: string[];           // z.B. "F02: Exakter Tag des Erstbeginns nicht erinnerlich"
  organonAugmentationCandidates: OrganonAugmentationCandidate[];
  currentTurn: number;
  isFinished: boolean;
  stoppingReason?: string;
  finalCausaSummary?: {
    belegteCausaGefunden: boolean;
    primaereCausa?: string;
    modalitaetenAbgrenzung?: string;
    aufrechterhaltendeFaktoren?: string;
    zusammenfassungFuerOrganon: string;
  } | null;
}
