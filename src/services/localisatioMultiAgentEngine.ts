/**
 * Localisatio Multi-Agent & Gemini-only Engine
 * 
 * Beinhaltet:
 * 1. runGeminiOnlyLocalisatioDeepen (Standardmodus: Single-Call)
 * 2. runGeminiLocalisatioAnalysis (Instanz 1 für Hahnemann-Gegenprüfung)
 * 3. runGptLocalisatioAnalysis (Instanz 2 für Hahnemann-Gegenprüfung via Model-Emulation/OpenAI)
 * 4. runLocalisatioArbitration (Instanz 3: Schiedsrichter für Hahnemann-Gegenprüfung)
 */

import { GoogleGenAI } from "@google/genai";
import {
  LocalisatioDimensionId,
  LOCALISATIO_DIMENSION_NAMES,
  AtomicLocalisatioFact,
  SpatialRelation,
  SpatialDynamicVector
} from "../types/localisatioDeepDive";

export const LOCALISATIO_SYSTEM_SPEC = `Du bist ein hochpräziser Experten-Agent für die homöopathische Organon-Vertiefung LOCALISATIO („Wo?“, §§ 83–104).
Dein oberstes Gebot ist absolute Evidenztreue, strikte Vermeidung von Scheingenauigkeit und Halluzinationen sowie die Einhaltung des Ein-Fragen-Prinzips.

DIE 7 LOCALISATIO-DIMENSIONEN (L1–L7):
L1: Anatomische Hauptregion (Kopf, Thorax, Abdomen, Extremität etc.)
L2: Topographische Unterregion (Schläfe, Hinterkopf, Stirn, Fossa poplitea etc. - NUR bei konkretem Beleg!)
L3: Lateralität / Seitenbezug (Rechts, Links, Beidseits, Mittig, Unbestimmt)
L4: Wahrgenommene Tiefenlage (Phänomenologische Tiefe: oberflächlich, tief sitzend, „wie im Knochen“ - KEINE Gewebediagnose!)
L5: Räumliche Ausdehnung / Begrenzung (Punktuell mit Fingerspitze, umschrieben handtellergroß, diffus, flächig)
L6: Räumliche Multiplizität / Verteilung (Solitärer Herd, mehrere getrennte Punkte, disseminiert)
L7: Räumliche Dynamik / Ausbreitung (Ortsfest, Ausstrahlung, Wanderung, Wechselnd)

STRIKTE VALIDATOR-REGELN (VR-LOC-01 BIS VR-LOC-08):
- VR-LOC-01: Koexistenz zweier Schmerzorte (z. B. Nacken und Kopf) erzeugt NIEMALS automatisch eine Ausstrahlung.
- VR-LOC-02: Ausstrahlung oder Wanderung nur dann eintragen, wenn der Patient eine gerichtete Bewegung wörtlich belegt („zieht von X nach Y“).
- VR-LOC-03: „Mal rechts, mal links“ != gleichzeitig beidseits. L3 bleibt seitengetreu (oder alternierend), L7 wird WECHSELND.
- VR-LOC-04: Zeitliche Abfolge zweier Lokalisationen („erst Nacken, später Kopf“) != Ausstrahlung oder Wanderung.
- VR-LOC-05: Ungelöste Deixis („hier“, „da“, „genau hier“) darf niemals eine anatomische Region erfinden. Sie verlangt eine neutrale sprachliche Lokalisationsfrage.
- VR-LOC-06: Zwei oder mehr diskrete Punkte dürfen nicht zu einer Fläche verschmolzen werden (L5=punktuell, L6=multiple Herde).
- VR-LOC-07: L4 ist rein subjektiv wahrgenommene Tiefenlage, KEINE anatomische oder pathologische Gewebediagnose („wie im Knochen“ != Knochenentzündung).
- VR-LOC-08: Keine anatomische Scheingenauigkeit aus Alltagssprache („im Kreuz“ != L4/L5 Bandscheibensegment).

MULTI-SYMPTOM-REGEL:
Es wird immer genau EIN aktives Symptom vertieft (activeSymptomId). Alle Fragen und Dimensionsbewertungen gelten isoliert für dieses Symptom. Ist dieses geklärt oder erschöpft, wird zum nächsten gewechselt.
`;

export interface GeminiOnlyLocalisatioResult {
  activeSymptomId: string;
  isSymptomCompleted: boolean;
  completionReason?: string;
  atomicFacts: Array<{
    factId: string;
    dimensionId: LocalisatioDimensionId;
    symptomId: string;
    episodeId: string;
    factText: string;
    originalQuote: string;
    normalizedValue?: any;
    epistemicStatus: string;
    patientConfidence: string;
  }>;
  spatialRelations: SpatialRelation[];
  dynamicVectors: SpatialDynamicVector[];
  dimensionStates: Record<LocalisatioDimensionId, {
    completion: string;
    applicability: string;
    summaryNote?: string;
  }>;
  openAspects: Array<{ text: string; reason: string; dimension?: string; symptomId?: string }>;
  nextQuestion: {
    questionText: string;
    orientationExample: string;
    targetDimension: LocalisatioDimensionId;
    targetSymptomId: string;
    targetSymptomLabel: string;
    reason: string;
  } | null;
  isFinished: boolean;
  stoppingReason?: string;
  finalEvaluation?: {
    levelA_patientReported: string[];
    levelB_conservativeNormalizations: string[];
    levelC_unresolvedOrVague: string[];
    overallResult: string;
  } | null;
}

function parseAiJson(rawText: string, fallback: any = {}): any {
  if (!rawText || typeof rawText !== "string") return fallback;
  try {
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("[LocalisatioEngine] JSON-Parse-Fehler:", err);
    return fallback;
  }
}

/**
 * Single-Call Engine für Gemini-only Modus
 */
export async function runGeminiOnlyLocalisatioDeepen(
  ai: GoogleGenAI,
  rawText: string,
  activeEndprueferResult: any | null,
  existingLocalisatioText: string = "",
  canonicalState: any | null,
  history: Array<{ question: string; answer: string; orientationExample?: string }>,
  language: string = "de"
): Promise<GeminiOnlyLocalisatioResult> {
  const activeSymptomId = canonicalState?.activeSymptomId || 'sym_1';
  const symptomData = canonicalState?.symptoms?.[activeSymptomId] || null;
  const symptomLabel = symptomData?.symptomLabel || 'Hauptbeschwerde';
  const symptomOrder: string[] = canonicalState?.symptomOrder || [activeSymptomId];
  const allSymptomsOverview = Object.values(canonicalState?.symptoms || {}).map((s: any) => 
    `- [${s.symptomId === activeSymptomId ? 'AKTIV' : s.isSymptomCompleted ? 'ABGESCHLOSSEN' : 'OFFEN'}] ${s.symptomLabel} (${s.symptomId})`
  ).join('\n');

  const historyStr = history.map((h, i) => `Turn ${i+1}: Frage: "${h.question}" -> Antwort: "${h.answer}"`).join('\n');

  const prompt = `${LOCALISATIO_SYSTEM_SPEC}

AKTUELLER FALL-KONTEXT:
Ausgangs-Patiententext: "${rawText}"
Bisherige Organon-Localisatio: "${existingLocalisatioText}"

ALLE SYMPTOME IM FALL:
${allSymptomsOverview || '- Hauptbeschwerde (sym_1)'}

AKTIV ZU VERTIEfENDES SYMPTOM:
ID: "${activeSymptomId}" | Bezeichnung: "${symptomLabel}"
Bisherige Fakten zu diesem Symptom: ${JSON.stringify(symptomData?.facts || [])}
Bisherige räumliche Vektoren: ${JSON.stringify(symptomData?.dynamicVectors || [])}

VERLAUF DIESER VERTIEFUNG:
${historyStr || 'Noch keine Fragen gestellt. Dies ist der Initialschritt.'}

DEINE AUFGABE:
1. Extrahiere aus der letzten Patientenantwort atomare Fakten für L1–L7 bezüglich des AKTIVEN Symptoms "${symptomLabel}".
2. Prüfe strikt die Regeln VR-LOC-01 bis VR-LOC-08 (keine halluzinierte Ausstrahlung, Deixis markieren, L4 ist Phänomenologie).
3. Bestimme den aktuellen Status für alle Dimensionen L1 bis L7 des aktiven Symptoms ('UNERHOBEN' | 'TEILWEISE_ERHOBEN' | 'AUSREICHEND_ERHOBEN' | 'NICHT_WEITER_KLÄRBAR' | 'OBSOLET_DURCH_KONTEXT').
4. Prüfe, ob das aktive Symptom lokalisationstechnisch ausreichend geklärt ist (isSymptomCompleted).
   - Wenn ja: Prüfe, ob weitere offene Symptome in der Liste existieren. Falls alle erledigt sind, setze isFinished = true.
   - Wenn nein: Formuliere GENAU EINE EINZELNE, fokussierte Frage nach dem Ein-Fragen-Prinzip bezogen auf das aktive Symptom!

Antworte AUSSCHLIESSLICH als valides JSON:
{
  "activeSymptomId": "${activeSymptomId}",
  "isSymptomCompleted": false,
  "completionReason": "Begründung falls abgeschlossen",
  "atomicFacts": [
    {
      "factId": "loc_f1",
      "dimensionId": "L1",
      "symptomId": "${activeSymptomId}",
      "episodeId": "EP_INITIAL",
      "factText": "Kopfschmerz rechts temporal",
      "originalQuote": "Zitierte Patientenaussage",
      "normalizedValue": {
        "patientRawTerm": "an der rechten Schläfe",
        "conservativeAnatomicalTerm": "Schläfenregion",
        "bodySide": "RECHTS",
        "isDeicticUnresolved": false
      },
      "epistemicStatus": "BELEGT_FAKTISCH",
      "patientConfidence": "SICHERE_BEOBACHTUNG"
    }
  ],
  "spatialRelations": [],
  "dynamicVectors": [],
  "dimensionStates": {
    "L1": { "completion": "AUSREICHEND_ERHOBEN", "applicability": "APPLIKABEL", "summaryNote": "Kopf" },
    "L2": { "completion": "AUSREICHEND_ERHOBEN", "applicability": "APPLIKABEL", "summaryNote": "Schläfe" },
    "L3": { "completion": "AUSREICHEND_ERHOBEN", "applicability": "APPLIKABEL", "summaryNote": "Rechts" },
    "L4": { "completion": "UNERHOBEN", "applicability": "APPLIKABEL" },
    "L5": { "completion": "UNERHOBEN", "applicability": "APPLIKABEL" },
    "L6": { "completion": "UNERHOBEN", "applicability": "APPLIKABEL" },
    "L7": { "completion": "UNERHOBEN", "applicability": "APPLIKABEL" }
  },
  "openAspects": [
    { "text": "Tiefe und Ausdehnung", "reason": "Noch nicht präzisiert", "dimension": "L4", "symptomId": "${activeSymptomId}" }
  ],
  "nextQuestion": {
    "questionText": "Können Sie die Stelle an der rechten Schläfe noch genauer beschreiben – ist der Schmerz eher punktuell mit der Fingerspitze einzugrenzen oder breitet er sich aus?",
    "orientationExample": "Z. B. punktuell, handtellergroß oder in eine bestimmte Richtung ziehend.",
    "targetDimension": "L5",
    "targetSymptomId": "${activeSymptomId}",
    "targetSymptomLabel": "${symptomLabel}",
    "reason": "Klärung der Ausdehnung L5 und möglicher Ausstrahlung L7."
  },
  "isFinished": false,
  "stoppingReason": "",
  "finalEvaluation": null
}
`;

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.15,
        responseMimeType: "application/json"
      }
    });
  } catch (primaryErr) {
    console.warn("[LocalisatioEngine] Primary model failed, falling back to gemini-flash-latest:", primaryErr);
    response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        temperature: 0.15,
        responseMimeType: "application/json"
      }
    });
  }

  const parsed = parseAiJson(response.text || "{}", {});

  // Fallback absichern
  const result: GeminiOnlyLocalisatioResult = {
    activeSymptomId: parsed.activeSymptomId || activeSymptomId,
    isSymptomCompleted: Boolean(parsed.isSymptomCompleted),
    completionReason: parsed.completionReason,
    atomicFacts: Array.isArray(parsed.atomicFacts) ? parsed.atomicFacts : [],
    spatialRelations: Array.isArray(parsed.spatialRelations) ? parsed.spatialRelations : [],
    dynamicVectors: Array.isArray(parsed.dynamicVectors) ? parsed.dynamicVectors : [],
    dimensionStates: parsed.dimensionStates || {
      L1: { completion: "TEILWEISE_ERHOBEN", applicability: "APPLIKABEL" },
      L2: { completion: "UNERHOBEN", applicability: "APPLIKABEL" },
      L3: { completion: "UNERHOBEN", applicability: "APPLIKABEL" },
      L4: { completion: "UNERHOBEN", applicability: "APPLIKABEL" },
      L5: { completion: "UNERHOBEN", applicability: "APPLIKABEL" },
      L6: { completion: "UNERHOBEN", applicability: "APPLIKABEL" },
      L7: { completion: "UNERHOBEN", applicability: "APPLIKABEL" }
    },
    openAspects: Array.isArray(parsed.openAspects) ? parsed.openAspects : [],
    nextQuestion: parsed.isFinished ? null : (parsed.nextQuestion || {
      questionText: `An welcher genauen Stelle spüren Sie den ${symptomLabel} am deutlichsten?`,
      orientationExample: "Z. B. rechts, links, mittig, oberflächlich oder tief.",
      targetDimension: "L1",
      targetSymptomId: activeSymptomId,
      targetSymptomLabel: symptomLabel,
      reason: "Präzisierung des genauen Schmerzortes."
    }),
    isFinished: Boolean(parsed.isFinished),
    stoppingReason: parsed.stoppingReason,
    finalEvaluation: parsed.finalEvaluation || null
  };

  return result;
}

/**
 * Instanz 1 (Gemini) für die Hahnemann-Gegenprüfung
 */
export async function runGeminiLocalisatioAnalysis(
  ai: GoogleGenAI,
  rawText: string,
  existingLocalisatioText: string,
  canonicalState: any | null,
  history: Array<{ question: string; answer: string; orientationExample?: string }>,
  language: string = "de"
) {
  return runGeminiOnlyLocalisatioDeepen(ai, rawText, null, existingLocalisatioText, canonicalState, history, language);
}

/**
 * Instanz 2 (GPT) für die Hahnemann-Gegenprüfung
 */
export async function runGptLocalisatioAnalysis(
  ai: GoogleGenAI,
  rawText: string,
  existingLocalisatioText: string,
  canonicalState: any | null,
  history: Array<{ question: string; answer: string; orientationExample?: string }>,
  language: string = "de"
) {
  const activeSymptomId = canonicalState?.activeSymptomId || 'sym_1';
  const symptomData = canonicalState?.symptoms?.[activeSymptomId] || null;
  const symptomLabel = symptomData?.symptomLabel || 'Hauptbeschwerde';

  const prompt = `${LOCALISATIO_SYSTEM_SPEC}
DU BIST INSTANZ 2 (GPT-4o PRO ARCHITEKTUR-EMULATION).
Prüfe den Fall streng nach klassischer Homöopathie (Hahnemann § 84: Der Patient schildert seine Beschwerden, Angehörige berichten, der Arzt beobachtet).
Achte besonders darauf, dass phänomenologische Schmerzangaben nicht in moderne anatomische Fachtermini überinterpretiert werden!

Fall: "${rawText}"
Bisherige Localisatio: "${existingLocalisatioText}"
Aktives Symptom: "${symptomLabel}" (${activeSymptomId})
Bisherige Fakten: ${JSON.stringify(symptomData?.facts || [])}
Historie: ${JSON.stringify(history)}

Erzeuge einen Vorschlag für die nächste Frage und die erkannten Fakten.
Antworte als valides JSON:
{
  "activeSymptomId": "${activeSymptomId}",
  "atomicFacts": [],
  "nextQuestion": {
    "questionText": "Frage von Instanz 2",
    "orientationExample": "Orientierungshilfe",
    "targetDimension": "L1",
    "targetSymptomId": "${activeSymptomId}",
    "targetSymptomLabel": "${symptomLabel}",
    "reason": "Begründung"
  },
  "isFinished": false,
  "isSymptomCompleted": false
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.25,
        responseMimeType: "application/json"
      }
    });
    return parseAiJson(response.text || "{}", {});
  } catch (err) {
    console.warn("[LocalisatioEngine] Instanz 2 Call fehlgeschlagen:", err);
    return null;
  }
}

/**
 * Instanz 3 (Schiedsrichter) für die Hahnemann-Gegenprüfung
 */
export async function runLocalisatioArbitration(
  ai: GoogleGenAI,
  rawText: string,
  existingLocalisatioText: string,
  history: Array<{ question: string; answer: string; orientationExample?: string }>,
  geminiRes: any,
  gptRes: any,
  language: string = "de"
) {
  const prompt = `${LOCALISATIO_SYSTEM_SPEC}
DU BIST INSTANZ 3 (DER STRENGE SCHIEDSRICHTER).
Deine Aufgabe ist es, die Vorschläge von Instanz 1 (Gemini) und Instanz 2 (GPT) abzugleichen.
Entscheide unerbittlich nach den Regeln VR-LOC-01 bis VR-LOC-08:
- Hat eine Instanz eine unzulässige Ausstrahlung erfunden? (Verwerfen!)
- Wurde Deixis als echte anatomische Lage gewertet? (Verwerfen!)
- Wähle die Frage, die am unvoreingenommensten und patientennächsten ist!

Instanz 1 Vorschlag:
${JSON.stringify(geminiRes?.nextQuestion || {})}

Instanz 2 Vorschlag:
${JSON.stringify(gptRes?.nextQuestion || {})}

Antworte als valides JSON:
{
  "chosenQuestion": {
    "questionId": "q_arb_1",
    "questionText": "Die ausgewählte oder konsolidierte Frage",
    "orientationExample": "Orientierungshilfe",
    "targetDimension": "L1",
    "targetSymptomId": "${geminiRes?.activeSymptomId || 'sym_1'}",
    "targetSymptomLabel": "Hauptbeschwerde",
    "reason": "Begründung",
    "arbitrationNote": "Schiedsrichter-Urteil"
  },
  "factsDelta": [],
  "isFinished": false,
  "isSymptomCompleted": false,
  "stoppingReason": "",
  "finalSummary": null
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    });
    return parseAiJson(response.text || "{}", {
      chosenQuestion: geminiRes?.nextQuestion || gptRes?.nextQuestion,
      factsDelta: geminiRes?.atomicFacts || [],
      isFinished: false
    });
  } catch (err) {
    console.warn("[LocalisatioEngine] Schiedsrichter-Call fehlgeschlagen:", err);
    return {
      chosenQuestion: geminiRes?.nextQuestion || gptRes?.nextQuestion,
      factsDelta: geminiRes?.atomicFacts || [],
      isFinished: false
    };
  }
}
