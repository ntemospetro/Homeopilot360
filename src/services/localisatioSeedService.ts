/**
 * Localisatio-Seed-Service:
 * Überführt das Endprüfer-Ergebnis und Vorbefunde in einen konsistenten CanonicalLocalisatioState.
 * Unterstützt strikte Symptom-Trennung (Multi-Symptom-Workflow) und strikte Evidenzgrenzen (L1–L7).
 */

import {
  CanonicalLocalisatioState,
  SymptomLocalisatioState,
  LocalisatioDimensionId,
  LOCALISATIO_DIMENSION_KEYS,
  LocalisatioDimensionState,
  AtomicLocalisatioFact,
  SpatialRelation,
  SpatialDynamicVector
} from '../types/localisatioDeepDive';
import { EndprueferResult, EndprueferCategoryDecision } from '../types';
import { detectEpistemicConfidence, determineFactStatusForStatement } from './causaSeedService';

/**
 * Erstellt leere L1–L7 Dimensions-Zustände
 */
export function createInitialLocalisatioDimensions(): Record<LocalisatioDimensionId, LocalisatioDimensionState> {
  const dims = {} as Record<LocalisatioDimensionId, LocalisatioDimensionState>;
  for (const key of LOCALISATIO_DIMENSION_KEYS) {
    dims[key] = {
      completion: 'UNERHOBEN',
      applicability: 'APPLIKABEL'
    };
  }
  return dims;
}

/**
 * Hilfsfunktion: Erkennt deiktische ungelöste Ausdrücke („hier“, „da“, „genau hier“)
 */
export function containsDeicticReference(text: string): boolean {
  const lower = text.toLowerCase();
  const deicticPatterns = [
    /\bhier\b/,
    /\bda\b/,
    /\bgenau hier\b/,
    /\ban dieser stelle\b/,
    /\bhier vorne\b/,
    /\bhier hinten\b/,
    /\bhier oben\b/,
    /\bhier unten\b/
  ];
  return deicticPatterns.some(p => p.test(lower));
}

/**
 * Hilfsfunktion: Identifiziert distinkte Symptome aus Rohtext, Endprüfer oder Vorbefund
 */
export function identifySymptomsFromContext(
  rawText: string,
  endprueferResult: EndprueferResult | null,
  fallbackText: string = ''
): Array<{ id: string; label: string; rawSnippet?: string }> {
  const combinedText = `${rawText} ${fallbackText}`.toLowerCase();
  const symptoms: Array<{ id: string; label: string; rawSnippet?: string }> = [];

  // 1. Suche nach typischen distinkten Beschwerde-Entitäten
  const candidatePatterns = [
    { id: 'sym_kopfschmerz', label: 'Kopfschmerz', regex: /\b(kopfschmerz\w*|kopfweh|schmerzen im kopf|drücken im kopf)\b/i },
    { id: 'sym_nackenschmerz', label: 'Nackenschmerz', regex: /\b(nackenschmerz\w*|nackenweh|steifer nacken|schmerzen im nacken)\b/i },
    { id: 'sym_rueckenschmerz', label: 'Rückenschmerz', regex: /\b(rücken\w*|kreuzschmerz\w*|lenden\w*)\b/i },
    { id: 'sym_halsschmerz', label: 'Halsschmerz', regex: /\b(hals\w*|schluckbeschwerd\w*)\b/i },
    { id: 'sym_bauchschmerz', label: 'Bauchschmerz', regex: /\b(bauch\w*|magen\w*|unterleib\w*)\b/i },
    { id: 'sym_knieschmerz', label: 'Knieschmerz', regex: /\b(knie\w*)\b/i },
    { id: 'sym_schulterschmerz', label: 'Schulterschmerz', regex: /\b(schulter\w*)\b/i },
    { id: 'sym_ohrenschmerz', label: 'Ohrenschmerz', regex: /\b(ohr\w*)\b/i },
    { id: 'sym_zahnschmerz', label: 'Zahnschmerz', regex: /\b(zahn\w*)\b/i },
    { id: 'sym_brustschmerz', label: 'Brustschmerz', regex: /\b(brust\w*|thorax\w*)\b/i }
  ];

  for (const cand of candidatePatterns) {
    const match = cand.regex.exec(combinedText);
    if (match) {
      symptoms.push({
        id: cand.id,
        label: cand.label,
        rawSnippet: match[0]
      });
    }
  }

  // Falls keine spezifische Entität erkannt wurde, Standard-Hauptbeschwerde anlegen
  if (symptoms.length === 0) {
    symptoms.push({
      id: 'sym_hauptbeschwerde',
      label: 'Hauptbeschwerde'
    });
  }

  return symptoms;
}

/**
 * Seeding-Funktion für Localisatio aus dem Organon-Endprüfer
 */
export function seedLocalisatioStateFromOrganonEndpruefer(
  rawText: string,
  endprueferResult: EndprueferResult | null,
  existingLocalisatioFallbackText: string = ''
): CanonicalLocalisatioState {
  const cleanRaw = (rawText || '').trim();
  const detectedSymptoms = identifySymptomsFromContext(cleanRaw, endprueferResult, existingLocalisatioFallbackText);

  const symptomsRecord: Record<string, SymptomLocalisatioState> = {};
  const symptomOrder: string[] = [];

  // 1. Suche die Localisatio-Kategorie im Endprüfer
  let locCategoryDecision: EndprueferCategoryDecision | null = null;
  if (endprueferResult && Array.isArray(endprueferResult.category_checks)) {
    locCategoryDecision = endprueferResult.category_checks.find((c) => {
      const catLower = (c.category || '').toLowerCase();
      return catLower.includes('localisatio') || catLower.includes('ort') || catLower.includes('wo');
    }) || null;
  }

  const locText = locCategoryDecision
    ? (locCategoryDecision.minimal_correction || locCategoryDecision.schiedsrichter_result || '')
    : existingLocalisatioFallbackText;

  let seedFactCounter = 1;

  // 2. Initialisiere jedes Symptom mit isoliertem Dimensions-Zustand
  for (const sym of detectedSymptoms) {
    symptomOrder.push(sym.id);
    const dimensions = createInitialLocalisatioDimensions();
    const facts: AtomicLocalisatioFact[] = [];
    const spatialRelations: SpatialRelation[] = [];
    const dynamicVectors: SpatialDynamicVector[] = [];

    // Relevanten Text für dieses Symptom prüfen
    const symLower = sym.label.toLowerCase();
    const isMatchingContext = locText.toLowerCase().includes(symLower) || detectedSymptoms.length === 1;

    if (isMatchingContext && locText && !locText.toLowerCase().includes('nicht angegeben') && !locText.toLowerCase().includes('keine angabe')) {
      const isDeictic = containsDeicticReference(locText);
      const confidence = detectEpistemicConfidence(locText);
      const status = determineFactStatusForStatement(locText);

      // Anatomische Hauptregion (L1)
      let primaryRegion = '';
      if (sym.id === 'sym_kopfschmerz' || locText.toLowerCase().includes('kopf')) primaryRegion = 'Kopf';
      else if (sym.id === 'sym_nackenschmerz' || locText.toLowerCase().includes('nacken')) primaryRegion = 'Nacken';
      else if (sym.id === 'sym_rueckenschmerz' || locText.toLowerCase().includes('rücken')) primaryRegion = 'Rücken';
      else if (sym.id === 'sym_halsschmerz' || locText.toLowerCase().includes('hals')) primaryRegion = 'Hals';
      else if (sym.id === 'sym_bauchschmerz' || locText.toLowerCase().includes('bauch')) primaryRegion = 'Abdomen';
      else if (sym.id === 'sym_knieschmerz' || locText.toLowerCase().includes('knie')) primaryRegion = 'Knie';
      else primaryRegion = sym.label;

      facts.push({
        factId: `SEED_LOC_${seedFactCounter++}`,
        dimensionId: 'L1',
        symptomId: sym.id,
        episodeId: 'EP_INITIAL',
        evidenceText: locCategoryDecision?.raw_text_snippet || locText,
        sourceTurn: 0,
        normalizedValue: {
          patientRawTerm: locText,
          conservativeAnatomicalTerm: primaryRegion,
          isDeicticUnresolved: isDeictic
        },
        epistemicStatus: status,
        patientConfidence: confidence
      });

      dimensions.L1.completion = 'AUSREICHEND_ERHOBEN';
      dimensions.L1.summaryNote = primaryRegion;

      // Prüfe auf Unterregion (L2) - nur wenn EXPLIZIT genannt, niemals erfunden!
      const l2Matches = [
        { term: 'Schläfe', regex: /\bschläfe\w*\b/i },
        { term: 'Hinterkopf', regex: /\bhinterkopf\w*\b/i },
        { term: 'Stirn', regex: /\bstirn\w*\b/i },
        { term: 'Scheitel', regex: /\bscheitel\w*\b/i },
        { term: 'Okzipital', regex: /\bokzipit\w*\b/i },
        { term: 'Lendenwirbelbereich', regex: /\b(lws|lende\w*|kreuz\w*)\b/i }
      ];

      for (const l2 of l2Matches) {
        if (l2.regex.test(locText)) {
          facts.push({
            factId: `SEED_LOC_${seedFactCounter++}`,
            dimensionId: 'L2',
            symptomId: sym.id,
            episodeId: 'EP_INITIAL',
            evidenceText: locText,
            sourceTurn: 0,
            normalizedValue: {
              patientRawTerm: l2.term,
              conservativeAnatomicalTerm: l2.term
            },
            epistemicStatus: 'BELEGT_FAKTISCH',
            patientConfidence: 'SICHERE_BEOBACHTUNG'
          });
          dimensions.L2.completion = 'AUSREICHEND_ERHOBEN';
          dimensions.L2.summaryNote = l2.term;
          break;
        }
      }

      // Prüfe auf Lateralität (L3)
      let side: 'RECHTS' | 'LINKS' | 'BEIDSEITS' | 'MITTIG' | 'UNBESTIMMT' = 'UNBESTIMMT';
      if (/\brechts\b/i.test(locText) && !/\blinks\b/i.test(locText)) side = 'RECHTS';
      else if (/\blinks\b/i.test(locText) && !/\brechts\b/i.test(locText)) side = 'LINKS';
      else if (/\b(beidseits|beide seiten)\b/i.test(locText)) side = 'BEIDSEITS';
      else if (/\b(mittig|zentral|in der mitte)\b/i.test(locText)) side = 'MITTIG';

      if (side !== 'UNBESTIMMT') {
        facts.push({
          factId: `SEED_LOC_${seedFactCounter++}`,
          dimensionId: 'L3',
          symptomId: sym.id,
          episodeId: 'EP_INITIAL',
          evidenceText: locText,
          sourceTurn: 0,
          normalizedValue: {
            patientRawTerm: locText,
            bodySide: side
          },
          epistemicStatus: 'BELEGT_FAKTISCH',
          patientConfidence: 'SICHERE_BEOBACHTUNG'
        });
        dimensions.L3.completion = 'AUSREICHEND_ERHOBEN';
        dimensions.L3.summaryNote = side;
      }
    }

    symptomsRecord[sym.id] = {
      symptomId: sym.id,
      symptomLabel: sym.label,
      episodeId: 'EP_INITIAL',
      facts,
      dimensions,
      spatialRelations,
      dynamicVectors,
      isSymptomCompleted: false
    };
  }

  return {
    version: 1,
    activeSymptomId: symptomOrder[0] || 'sym_hauptbeschwerde',
    symptomOrder,
    symptoms: symptomsRecord,
    currentTurn: 0,
    isFinished: false,
    stoppingReason: undefined,
    finalSummary: null
  };
}
