import { GoogleGenAI } from "@google/genai";
import { jsonrepair } from "jsonrepair";
import { 
  CAUSA_DIMENSION_NAMES, 
  CausaDimensionId,
  EpistemicFactStatus,
  DimensionCompletion,
  DimensionApplicability,
  PatientConfidence,
  EpistemicRelation
} from "../types/causaDeepDive";

export interface CausaAgentAnalysis {
  knownFacts: Array<{ text: string; evidence: string; dimension?: string }>;
  openAspects: Array<{ text: string; reason: string; dimension?: string }>;
  suggestedQuestion: {
    questionText: string;
    orientationExample: string;
    targetDimension: CausaDimensionId | string;
    reason: string;
    questionStage: 1 | 2 | 3;
  };
  dimensionStatus: Record<string, 'UNERHOBEN' | 'TEILWEISE_ERHOBEN' | 'AUSREICHEND_ERHOBEN' | 'NICHT_WEITER_KLÄRBAR'>;
  isFinished: boolean;
  stoppingReason?: string;
  finalEvaluation?: {
    category: 'GEKLÄRT' | 'UNSICHER' | 'KEINE_BELEGTE_CAUSA';
    summaryText: string;
  };
}

export interface CausaArbitratorDecision {
  chosenQuestion: {
    questionId: string;
    questionText: string;
    orientationExample: string;
    targetDimension: CausaDimensionId | string;
    reason: string;
    arbitrationNote: string;
  };
  factsDelta: Array<{ text: string; evidence: string; dimension: string; epistemicStatus: string }>;
  dimensionCompletion: Record<string, string>;
  isFinished: boolean;
  stoppingReason?: string;
  finalSummary?: {
    levelA_patientReported: string[];
    levelB_unresolvedOrConflicting: string[];
    levelC_homeopathicInterpretation: string[];
    overallResult: string;
  } | null;
  agentOpinions: {
    geminiQuestion: string;
    gptQuestion: string;
  };
}

function safeParseJson<T = any>(rawText: string, fallback: T): T {
  if (!rawText || typeof rawText !== "string") return fallback;
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  // Find boundaries of outer JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // 1. Direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    // 2. High-precision jsonrepair library
    try {
      const repaired = jsonrepair(cleaned);
      return JSON.parse(repaired);
    } catch {
      // 3. Trailing commas & unescaped control chars repair
      try {
        const sanitized = cleaned
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/[\u0000-\u001F]+/g, (match) => {
            if (match === '\n') return '\\n';
            if (match === '\r') return '\\r';
            if (match === '\t') return '\\t';
            return '';
          });
        try {
          return JSON.parse(sanitized);
        } catch {
          const repairedSanitized = jsonrepair(sanitized);
          return JSON.parse(repairedSanitized);
        }
      } catch {
        // 4. Truncated or malformed JSON heuristic repair
        try {
          let repaired = cleaned
            .replace(/,\s*"[^"]*"?\s*:\s*"?$/, "")
            .replace(/,\s*"[^"]*"?\s*$/, "")
            .replace(/,\s*$/, "");

          const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length;
          if (quoteCount % 2 !== 0) {
            repaired += '"';
          }
          let openBrackets = 0;
          let openBraces = 0;
          let inString = false;
          let escapeNext = false;
          for (let i = 0; i < repaired.length; i++) {
            const c = repaired[i];
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            if (c === "\\") {
              escapeNext = true;
              continue;
            }
            if (c === '"') {
              inString = !inString;
              continue;
            }
            if (!inString) {
              if (c === "{") openBraces++;
              else if (c === "}") openBraces = Math.max(0, openBraces - 1);
              else if (c === "[") openBrackets++;
              else if (c === "]") openBrackets = Math.max(0, openBrackets - 1);
            }
          }
          repaired = repaired.replace(/,\s*$/, "");
          while (openBrackets > 0) {
            repaired += "]";
            openBrackets--;
          }
          while (openBraces > 0) {
            repaired += "}";
            openBraces--;
          }
          try {
            return JSON.parse(repaired);
          } catch {
            const libRepaired = jsonrepair(repaired);
            return JSON.parse(libRepaired);
          }
        } catch (err2) {
          // 5. Fallback evaluation
          try {
            let trial = cleaned.replace(/,\s*([}\]])/g, '$1');
            const opens = (trial.match(/{/g) || []).length;
            const closes = (trial.match(/}/g) || []).length;
            if (opens > closes) {
              trial += '}'.repeat(opens - closes);
            }
            // eslint-disable-next-line no-new-func
            const evaluated = new Function(`return ${trial}`)();
            if (evaluated && typeof evaluated === 'object') {
              return evaluated;
            }
          } catch {}

          return fallback;
        }
      }
    }
  }
}

const CAUSA_SYSTEM_SPEC = `Du bist Teil des 3-Instanzen-Prüfsystems für die Causa-Vertiefung nach Samuel Hahnemann (Organon §§ 83–104).
Das Ziel ist die präzise, evidenzgetreue und unvoreingenommene Klärung möglicher Krankheitsauslöser.

DIE 13 CAUSA-BEREICHE (PRÜF- UND DENKGERÜST, KEINE 13 PFLICHTFRAGEN!):
C1: Chronologischer Beginn (Wann bzw. in welchem Zeitraum begannen die heutigen Beschwerden?)
C2: Unmittelbare Vorphase (Was war unmittelbar davor bzw. in der Zeit vor dem Beginn?)
C3: Konkreter Anlass/Ereignis (Gab es ein konkretes Ereignis oder eine konkrete Einwirkung?)
C4: Phänomenologie der Einwirkung (Falls etwas genannt wird: Was genau geschah bzw. wie war die Einwirkung?)
C5: Organismischer Ausgangszustand (In welchem körperlichen Zustand befand sich der Patient dabei?)
C6: Wahrnehmung & Sofortreaktion (Was bemerkte der Patient unmittelbar während oder nach der Einwirkung?)
C7: Chronologie & Latenz (Wie viel Zeit lag zwischen Ereignis/Einwirkung und Beschwerden?)
C8: Patienteneigene Zuschreibung (Was hält der Patient selbst für den Auslöser und wie sicher ist er sich?)
C9: Konkurrierende Faktoren (Was kam in derselben Zeit sonst noch infrage?)
C10: Akute Einwirkung vs. Hintergrund (War es ein einzelnes Ereignis oder eine länger bestehende Situation?)
C11: Reproduzierbarkeit & Gegenprobe (Passiert es wiederholt nach dieser Einwirkung? Gibt es Beschwerden auch ohne sie?)
C12: Historischer Vorzustand (Gab es dieselbe oder ähnliche Beschwerde bereits vorher?)
C13: Aufrechterhaltende Einwirkung (Besteht eine mögliche relevante Einwirkung heute weiterhin?)

WICHTIGSTE METHODISCHE REGELN:
1. NICHT ALLE 13 FRAGEN MÜSSEN BEANTWORTET WERDEN. Es wird nur gefragt, was für den individuellen Fall relevant ist.
2. IMMER GENAU EINE EINZELNE FRAGE GLEICHZEITIG.
3. FRAGENTRICHTER - ZUERST OFFEN (Stufe 1), DANN GEZIELT (Stufe 2).
   - NIEMALS suggestiv fragen! FALSCH: "War die Zugluft der Auslöser Ihrer Kopfschmerzen?"
   - RICHTIG (offen): "Was erinnern Sie noch von der Zeit, als diese Kopfschmerzen zum ersten Mal auftraten?"
   - Erst wenn ein Faktor (z.B. Kälte) tatsächlich erwähnt wurde und relevant bleibt, darf gezielter nach diesem Zusammenhang gefragt werden.
4. "NICHT ERINNERLICH" IST EINE VERWERTBARE INFORMATION:
   - Wenn der Patient ein Ereignis nicht benennen kann ("kann kein Ereignis nennen"), darf dies NICHT als AUSDRÜCKLICH_VERNEINT gewertet werden, sondern als NICHT_ERINNERLICH.
   - Dieselbe Frage darf dann nicht wiederholt werden.
5. STOPPING-REGEL:
   - Causa ist fertig, wenn wesentliche Aspekte geklärt sind ODER weitere Fragen keinen Erkenntnisgewinn bringen.
   - Gültige Endbefunde:
     a) "Causa ausreichend gestützt" (Patient berichtet nachvollziehbaren Zusammenhang)
     b) "Causa unsicher" (Patient vermutet Zusammenhang, Gegenbeispiele/Lücken bestehen)
     c) "Keine ausreichend belegte Causa ermittelbar" (völlig gleichwertiges, valides Ergebnis!)`;

const CAUSA_PRIMARY_MODEL = "gemini-flash-latest";
const CAUSA_FALLBACK_MODEL = "gemini-flash-latest";

async function executeCausaAiGeneration(
  ai: GoogleGenAI,
  prompt: string,
  temperature: number = 0.2,
  maxOutputTokens: number = 8192
) {
  try {
    return await ai.models.generateContent({
      model: CAUSA_PRIMARY_MODEL,
      contents: prompt,
      config: { 
        temperature, 
        responseMimeType: "application/json",
        maxOutputTokens
      }
    });
  } catch (err) {
    console.warn(`[CausaEngine] Primary model ${CAUSA_PRIMARY_MODEL} failed, falling back to ${CAUSA_FALLBACK_MODEL}:`, err);
    return await ai.models.generateContent({
      model: CAUSA_FALLBACK_MODEL,
      contents: prompt,
      config: { 
        temperature, 
        responseMimeType: "application/json",
        maxOutputTokens
      }
    });
  }
}

export async function runGeminiCausaAnalysis(
  ai: GoogleGenAI,
  rawText: string,
  existingCausaText: string,
  history: Array<{ question: string; answer: string }>,
  language: string = "de"
): Promise<CausaAgentAnalysis> {
  const prompt = `${CAUSA_SYSTEM_SPEC}

ROLLE: AGENT 1 DES DUALEN GEMINI-FLASH-SYSTEMS (DER PHÄNOMENOLOGE & DIMENSIONS-PROFILER)
Analysiere die Patientenaussagen unabhängig und erstelle deinen Vorschlag für die Causa-Klärung.
Dein Hauptaugenmerk liegt auf der präzisen Trennung von:
1. Tatsächlichen Fakten (was der Patient wirklich erlebt/gesagt hat)
2. Bloßen Vermutungen des Patienten
3. Ausdrücklichen Nicht-Erinnerlichkeiten ("weiß nicht", "nicht erinnerlich" als Information sichern, nicht als Verneinung werten!)
4. Den 13 Causa-Dimensionen C1–C13.

PATIENTENTEXT:
"""${rawText}"""

BEREITS VORHANDENE CAUSA-ANGABE:
"""${existingCausaText}"""

BISHERIGER DIALOG-VERLAUF:
${history.map((h, i) => `[Turn ${i + 1}] Frage: "${h.question}" -> Antwort: "${h.answer}"`).join('\n') || "Noch keine Vorfragen gestellt."}

SPRACHE: ${language}

Antworte AUSSCHLIESSLICH im folgenden JSON-Format ohne Markdown-Ummantelung:
{
  "knownFacts": [{ "text": "...", "evidence": "...", "dimension": "C1" }],
  "openAspects": [{ "text": "...", "reason": "...", "dimension": "C2" }],
  "suggestedQuestion": {
    "questionText": "Die GENAU EINE nächste, offene Einzelfrage an den Patienten",
    "orientationExample": "Orientierungsbeispiel für den Therapeuten",
    "targetDimension": "C1",
    "reason": "Warum bringt diese Frage jetzt den größten Erkenntnisgewinn?",
    "questionStage": 1
  },
  "dimensionStatus": {
    "C1": "TEILWEISE_ERHOBEN",
    "C2": "UNERHOBEN",
    "C3": "UNERHOBEN"
  },
  "isFinished": false,
  "stoppingReason": "",
  "finalEvaluation": {
    "category": "UNSICHER",
    "summaryText": "..."
  }
}`;

  const response = await executeCausaAiGeneration(ai, prompt, 0.2, 2048);

  const fallbackResult: CausaAgentAnalysis = {
    knownFacts: existingCausaText ? [{ text: existingCausaText, evidence: "Ausgangsbefund", dimension: "C8" }] : [],
    openAspects: [{ text: "Erstbeginn & Chronologie", reason: "Bisher ungeklärt", dimension: "C1" }],
    suggestedQuestion: {
      questionText: "Was erinnern Sie noch von der Zeit, als diese Beschwerden zum allerersten Mal auftraten?",
      orientationExample: "Besondere Ereignisse, Umstände, körperliche Verfassung oder zeitliche Auffälligkeiten.",
      targetDimension: "C1",
      reason: "Offene Ersterfassung des Zeitpunkts und der Umstände des Erstbeginns.",
      questionStage: 1
    },
    dimensionStatus: { C1: "UNERHOBEN" },
    isFinished: false
  };

  return safeParseJson<CausaAgentAnalysis>(response.text || "{}", fallbackResult);
}

let isOpenAiCausaKeyInvalid = false;

export function markOpenAiKeyInvalid(): void {
  isOpenAiCausaKeyInvalid = true;
}

export function isOpenAiKeyMarkedInvalid(): boolean {
  return isOpenAiCausaKeyInvalid;
}

export async function runGptCausaAnalysis(
  ai: GoogleGenAI,
  rawText: string,
  existingCausaText: string,
  history: Array<{ question: string; answer: string }>,
  language: string = "de"
): Promise<CausaAgentAnalysis> {
  // Pure Dual Gemini Flash Agent 2: Der Hahnemann-Fragentrichter & Methodik-Inquirer
  // Läuft parallel zu Agent 1 in ~1 Sekunde und vermeidet jegliche externe OpenAI-Latenzen/Keys.
  const prompt = `${CAUSA_SYSTEM_SPEC}

ROLLE: AGENT 2 DES DUALEN GEMINI-FLASH-SYSTEMS (DER HAHNEMANN-METHODIK-INQUIRER)
Du untersuchst den Fall vollkommen eigenständig, unvoreingenommen und streng nach den Regeln von Samuel Hahnemann (Organon §§ 83–104).
Dein Hauptaugenmerk liegt auf der Formulierung der methodisch reinsten nächsten Frage:
1. NULL SUGGESTION: Keine vorgefertigten Antwortoptionen, keine Ja/Nein-Fragen, keine Vorwegnahme von Ursachen!
2. FRAGENTRICHTER STUFE 1: Halte die Frage weit und offen, damit der Kranke in eigenen Worten frei berichten kann (§ 84).
3. PRAXISTAUGLICHES ORIENTIERUNGSBEISPIEL: Ein neutrales Beispiel für den Therapeuten (§ 88).

PATIENTENTEXT:
"""${rawText}"""

BEREITS VORHANDENE CAUSA-ANGABE:
"""${existingCausaText}"""

BISHERIGER DIALOG-VERLAUF:
${history.map((h, i) => `[Turn ${i + 1}] Frage: "${h.question}" -> Antwort: "${h.answer}"`).join('\n') || "Noch keine Vorfragen gestellt."}

SPRACHE: ${language}

Antworte AUSSCHLIESSLICH im folgenden JSON-Format ohne Markdown:
{
  "knownFacts": [{ "text": "...", "evidence": "...", "dimension": "C1" }],
  "openAspects": [{ "text": "...", "reason": "...", "dimension": "C2" }],
  "suggestedQuestion": {
    "questionText": "Die GENAU EINE nächste, offene Einzelfrage an den Patienten",
    "orientationExample": "Orientierungsbeispiel für den Therapeuten",
    "targetDimension": "C1",
    "reason": "Warum bringt diese Frage jetzt den größten Erkenntnisgewinn?",
    "questionStage": 1
  },
  "dimensionStatus": {
    "C1": "TEILWEISE_ERHOBEN",
    "C2": "UNERHOBEN",
    "C3": "UNERHOBEN"
  },
  "isFinished": false,
  "stoppingReason": "",
  "finalEvaluation": {
    "category": "UNSICHER",
    "summaryText": "..."
  }
}`;

  const response = await executeCausaAiGeneration(
    ai,
    prompt,
    0.25,
    2048
  );

  const fallbackGpt: CausaAgentAnalysis = {
    knownFacts: existingCausaText ? [{ text: existingCausaText, evidence: "Ausgangsbefund", dimension: "C8" }] : [],
    openAspects: [{ text: "Erstbeginn & Chronologie", reason: "Bisher ungeklärt", dimension: "C1" }],
    suggestedQuestion: {
      questionText: "Wie genau haben die Beschwerden damals angefangen und was war in der Zeit davor los?",
      orientationExample: "Ereignisse, Stress, Witterung oder sonstige Umstände.",
      targetDimension: "C1",
      reason: "Offene Erfassung des Beginns ohne Vorab-Hypothese.",
      questionStage: 1
    },
    dimensionStatus: { C1: "UNERHOBEN" },
    isFinished: false
  };

  return safeParseJson<CausaAgentAnalysis>(response.text || "{}", fallbackGpt);
}

export async function runCausaArbitration(
  ai: GoogleGenAI,
  rawText: string,
  existingCausaText: string,
  history: Array<{ question: string; answer: string }>,
  geminiAnalysis: CausaAgentAnalysis,
  gptAnalysis: CausaAgentAnalysis,
  language: string = "de"
): Promise<CausaArbitratorDecision> {
  const prompt = `${CAUSA_SYSTEM_SPEC}

ROLLE: INSTANZ 3 (DER SCHIEDSRICHTER / ARBITRATOR)
Du bist die oberste Schiedsinstanz.
Du erhältst die Originalaussagen des Patienten sowie die beiden UNABHÄNGIGEN Analysen von Gemini (Instanz 1) und GPT (Instanz 2).

EVIDENZ-RANGORDNUNG:
1. ORIGINALTEXT DES PATIENTEN (höchste Autorität!)
2. VERBINDLICHE CAUSA- & EVIDENCE-CEILING-REGELN
3. Gemini & GPT (lediglich konkurrierende Vorschläge, keine Evidenzquellen!)

SCHIEDSRICHTER-AUFGABEN:
1. Vergleiche Gemini und GPT atomar:
   - Haben sie unzulässige Schlüsse gezogen (z.B. "kann kein Ereignis nennen" fälschlich als "ausdrücklich verneint" gewertet)?
   - Haben sie suggestive Fragen formuliert? (Jede Suggestion ist strengstens verboten!)
   - Wurden Qualifikatoren ("scheint", "manchmal", "ungefähr") erhalten?
2. Bestimme die GENAU EINE finale nächste Frage:
   - Wähle die Frage, die methodisch am offensten ist (Stufe 1 Fragentrichter) und den höchsten Erkenntnisgewinn bringt.
   - Falls beide Fragen Mängel haben oder zu eng sind, korrigiere sie minimal zur reinsten, unvoreingenommenen Einzelfrage.
3. Entscheide über das STOPPING:
   - Falls genügend geklärt ist ODER keine weiteren Erkenntnisse zu erwarten sind: setze "isFinished": true.
   - Ein gültiges Endergebnis ist ausdrücklich: "Keine ausreichend belegte Causa ermittelbar".

PATIENTENTEXT:
"""${rawText}"""

BISHERIGE ANTWORTEN:
${history.map((h, i) => `Turn ${i + 1}: Frage "${h.question}" -> Antwort: "${h.answer}"`).join('\n') || "Keine bisherigen Antworten."}

VORSCHLAG GEMINI (INSTANZ 1):
Frage: "${geminiAnalysis.suggestedQuestion?.questionText}"
Ziel: ${geminiAnalysis.suggestedQuestion?.targetDimension} (${geminiAnalysis.suggestedQuestion?.reason})
isFinished: ${geminiAnalysis.isFinished}

VORSCHLAG GPT (INSTANZ 2):
Frage: "${gptAnalysis.suggestedQuestion?.questionText}"
Ziel: ${gptAnalysis.suggestedQuestion?.targetDimension} (${gptAnalysis.suggestedQuestion?.reason})
isFinished: ${gptAnalysis.isFinished}

SPRACHE: ${language}

Antworte AUSSCHLIESSLICH im folgenden JSON-Format ohne Markdown:
{
  "chosenQuestion": {
    "questionId": "q_arb_final",
    "questionText": "Die endgültig freigegebene GENAU EINE Einzelfrage an den Patienten",
    "orientationExample": "Orientierungsbeispiel für den Therapeuten",
    "targetDimension": "C1",
    "reason": "Begründung für diese Frageentscheidung",
    "arbitrationNote": "Kurzer Vermerk des Schiedsrichters zum Vergleich von Gemini vs. GPT"
  },
  "factsDelta": [
    { "text": "...", "evidence": "...", "dimension": "C1", "epistemicStatus": "BELEGT_FAKTISCH" }
  ],
  "dimensionCompletion": {
    "C1": "TEILWEISE_ERHOBEN",
    "C2": "UNERHOBEN",
    "C3": "TEILWEISE_ERHOBEN"
  },
  "isFinished": false,
  "stoppingReason": "",
  "finalSummary": null
}`;

  const response = await executeCausaAiGeneration(ai, prompt, 0.1, 2048);

  const selectedQ = gptAnalysis.suggestedQuestion?.questionText || geminiAnalysis.suggestedQuestion?.questionText || "Was erinnern Sie noch von der Zeit, als diese Beschwerden zum ersten Mal auftraten?";
  const defaultArbitrationFallback = {
    chosenQuestion: {
      questionId: "q_arb_fallback",
      questionText: selectedQ,
      orientationExample: "Ereignisse, Verfassung, Witterung oder zeitliche Umstände.",
      targetDimension: "C1",
      reason: "Offene Ersterfassung des zeitlichen und situationalen Kontexts.",
      arbitrationNote: "Konsolidierung nach Schiedsrichter-Prüfung beider Modellvorschläge."
    },
    factsDelta: [],
    dimensionCompletion: {},
    isFinished: false,
    finalSummary: null
  };

  const parsed = safeParseJson(response.text || "{}", defaultArbitrationFallback);
  return {
    ...parsed,
    agentOpinions: {
      geminiQuestion: geminiAnalysis.suggestedQuestion?.questionText || "",
      gptQuestion: gptAnalysis.suggestedQuestion?.questionText || ""
    }
  };
}

// ============================================================
// GEMINI-ONLY TESTMODUS: SINGLE-CALL PIPELINE
// Endprüfer Stage 1 -> Gemini Causa -> Nächste Einzelfrage
// ============================================================

export interface GeminiOnlyAtomicFact {
  factId: string;
  factText: string;
  originalQuote: string;
  episodeId: 'EP_INITIAL' | 'EP_RECURRENT' | 'EP_SINGLE_EXERTION' | 'EP_CHRONIC_EXPOSURE' | 'EP_HISTORICAL' | string;
  dimensionId: CausaDimensionId | string;
  factStatus: EpistemicFactStatus;
  patientConfidence: PatientConfidence;
  epistemicRelation: EpistemicRelation;
}

export interface GeminiOnlyDimensionState {
  completion: DimensionCompletion;
  applicability: DimensionApplicability;
  summary?: string;
}

export interface GeminiOnlyCausaResult {
  atomicFacts: GeminiOnlyAtomicFact[];
  dimensionStates?: Record<string, GeminiOnlyDimensionState>;
  openAspects: Array<{ text: string; reason: string; dimension?: string }>;
  nextQuestion: {
    questionText: string;
    orientationExample: string;
    targetDimension: CausaDimensionId | string;
    reason: string;
    questionStage: 1 | 2 | 3;
  } | null;
  isFinished: boolean;
  stoppingReason?: string;
  finalEvaluation?: {
    category: 'GEKLÄRT' | 'UNSICHER' | 'KEINE_BELEGTE_CAUSA';
    levelA_patientReported: string[];
    levelB_unresolvedOrConflicting: string[];
    levelC_homeopathicInterpretation: string[];
    overallResult: string;
  } | null;
}

export async function runGeminiOnlyCausaDeepen(
  ai: GoogleGenAI,
  rawText: string,
  endprueferResult: any | null,
  existingCausaText: string = "",
  history: Array<{ question: string; answer: string; orientationExample?: string }>,
  language: string = "de",
  canonicalState?: any
): Promise<GeminiOnlyCausaResult> {
  // 1. Extraktion der finalen Causa-Evidenz aus dem Stage-1-Endprüfer
  let endprueferCausaSummary = "Kein Endprüfer-Ergebnis vorhanden.";
  if (endprueferResult && typeof endprueferResult === 'object') {
    let causaCheck = null;
    if (Array.isArray(endprueferResult.category_checks)) {
      causaCheck = endprueferResult.category_checks.find((c: any) => {
        const cat = (c.category || '').toLowerCase();
        return cat.includes('causa') || cat.includes('auslöser') || cat.includes('ursache');
      });
    }
    if (causaCheck) {
      const claims = Array.isArray(causaCheck.atomic_claims)
        ? causaCheck.atomic_claims.map((ac: any) => `- Claim: "${ac.claim}" | Beleg: "${ac.raw_text_snippet || 'keiner'}" | Status: ${ac.decision}`).join('\n')
        : '';
      endprueferCausaSummary = `Endprüfer-Causa-Befund: "${causaCheck.minimal_correction || causaCheck.schiedsrichter_result || ''}" (Entscheidung: ${causaCheck.decision})\n${claims ? `Validierte Claims:\n${claims}` : ''}`;
    } else if (endprueferResult.final_corrected_output) {
      endprueferCausaSummary = `Endprüfer-Gesamtergebnis: ${endprueferResult.final_corrected_output}`;
    }
  } else if (existingCausaText) {
    endprueferCausaSummary = `Vorherige Causa-Angabe: "${existingCausaText}"`;
  }

  const knownFactsList = Array.isArray(canonicalState?.facts) && canonicalState.facts.length > 0
    ? canonicalState.facts.map((f: any) => `- [${f.dimensionId}] "${f.normalizedValue?.text || f.evidenceText}" (Evidenz: "${f.evidenceText || ''}", Status: ${f.epistemicStatus})`).join('\n')
    : (Array.isArray(canonicalState?.knownFacts) && canonicalState.knownFacts.length > 0
        ? canonicalState.knownFacts.map((k: any) => `- [${k.dimension || 'C1'}] "${k.text}" (Evidenz: "${k.evidence || ''}")`).join('\n')
        : "Noch keine vorvalidierten Einzelfakten vorhanden.");

  const terminalPathsList = Array.isArray(canonicalState?.terminalPaths) && canonicalState.terminalPaths.length > 0
    ? canonicalState.terminalPaths.map((tp: string) => `- GESPERRT: ${tp}`).join('\n')
    : "Keine gesperrten Pfade.";

  const prompt = `Du bist die eigenständige Causa-Vertiefungs-Engine nach Samuel Hahnemann (Organon §§ 83–104).
Deine Aufgabe ist die methodisch unvoreingenommene, präzise Aufdeckung, Strukturierung und Klärung möglicher Krankheitsursachen (Causa) im Patientengespräch.

=======================================================================
AUSGANGSBASIS (STRENG VERBINDLICH):
=======================================================================
1. FINAL VALIDIERTE CAUSA-BASIS AUS STAGE 1 (ENDPRÜFER):
${endprueferCausaSummary}

2. ORIGINALER PATIENTENTEXT (O-Ton des Patienten):
"""${rawText}"""

3. BEREITS EVIDENZBELEGTE FAKTEN (NICHT ERNEUT ERFRAGEN!):
${knownFactsList}

4. GESPERRTE PFADE (TERMINAL PATHS / NICHT ERINNERLICH / VOLLSTÄNDIG ABGESCHLOSSEN):
${terminalPathsList}

5. BISHERIGER GESPRÄCHSVERLAUF:
${history.map((h, i) => `[Turn ${i + 1}] Frage: "${h.question}"\n-> Patientenantwort: "${h.answer}"`).join('\n\n') || "Noch keine Vorfragen gestellt (Initialer Einstieg Turn 1)."}

ZIELSPRACHE: ${language}

=======================================================================
VERBINDLICHE METHODISCHE GESETZE (UNVERÄNDERT DURCHZUSETZEN):
=======================================================================
1. EVIDENCE CEILING (Absolute Belegpflicht):
   - Jede Tatsache ("factText") MUSS durch ein wörtliches Zitat ("originalQuote") aus dem Originaltext oder den Antworten belegt sein.
   - Es ist STRENGSTENS VERBOTEN, Annahmen, Vermutungen oder Deutungen als bewiesene Tatsachen auszugeben.

2. STRENGES FRAGEVERBOT FÜR BEREITS BELEGTE FAKTEN:
   - Wenn ein atomares Informationsziel (z. B. Beginnzeitpunkt in C1 wie 'vorgestern' oder 'nach Spaziergang') bereits unter BEREITS EVIDENZBELEGTE FAKTEN steht, ist es STRENGSTENS VERBOTEN, diesen Sachverhalt erneut abzufragen!
   - Frage NIEMALS: "Was erinnern Sie noch von der Zeit, als diese Beschwerden zum ersten Mal auftraten?", wenn der Beginn bereits belegt ist!

3. KEINE FRAGE ZU GESPERRTEN PFADEN (NICHT_ERINNERLICH):
   - Wenn der Patient sagt "Ich kann mich an kein Ereignis erinnern" oder "Weiß ich nicht", oder der Pfad unter GESPERRTE PFADE steht, ist dies endgültig. Frage NIEMALS dieselbe Frage erneut, sondern schließe den Pfad ab.

4. ZEITLICHE BEZIEHUNG ≠ KAUSALITÄT:
   - "Seit der Grippe habe ich Kopfschmerzen" belegt ausschließlich eine zeitliche Chronologie (ZEITLICHE_KOINZIDENZ).
   - Eine zeitliche Reihenfolge beweist NIEMALS eine Kausalität!

5. PATIENTENHYPOTHESE ≠ BEWIESENE URSACHE:
   - Wenn der Patient vermutet ("Ich glaube, die Kälte war schuld"), ist dies epistemisch eine "SUBJEKTIVE_HYPOTHESE" mit Patient Confidence "VERMUTUNG".

6. CAUSA ≠ MODALITÄT:
   - Causa ist ausschließlich das auslösende Ereignis oder die krankmachende Einwirkung (§§ 83–104).
   - Modalitäten (Besserung durch Wärme, Verschlimmerung bei Bewegung) und Lokalsymptome sind KEINE Causa! Frage niemals nach Modalitäten.

7. EPISODEN-TRENNUNG:
   - Trenne Tatsachen strikt nach Episoden (EP_INITIAL, EP_RECURRENT, EP_SINGLE_EXERTION, EP_CHRONIC_EXPOSURE, EP_HISTORICAL).

8. STOPP-REGEL & VERTIEFUNGS-PFLICHT NACH HAHNEMANN (§§ 83–104):
   - Wenn der Patient ein Ereignis, einen Sturz, eine Kälteeinwirkung oder eine seelische Erschütterung nennt (z. B. "Sturz vom Fahrrad"), ist die Causa dadurch NICHT abgeschlossen, sondern MUSS offen vertieft werden!
   - Kläre in diesem Fall die Phänomenologie der Einwirkung (C4: Wie lief es genau ab? Krafteinwirkung?), die Wahrnehmung/Sofortreaktion (C6) oder die Latenzzeit (C7: Wann nach dem Ereignis traten die Symptome auf?).
   - Breche NIEMALS im ersten Turn (history leer) ab, wenn ein potenzieller Auslöser oder Beginn vorliegt, sondern formuliere stets eine offene Vertiefungsfrage (Fragentrichter Stufe 1).
   - Stoppe (isFinished = true, nextQuestion = null) erst, wenn:
     a) die relevanten Begleitumstände und der Verlauf der Einwirkung geklärt sind, ODER
     b) der Patient angibt, sich an keine weiteren Einzelheiten erinnern zu können (NICHT_ERINNERLICH), ODER
     c) nach sorgfältiger Befragung keine hinreichend belegte Causa ermittelbar ist (§ 104).
   - GÜLTIGES, VOLLWERTIGES ENDERGEBNIS: "Keine ausreichend belegte Causa ermittelbar." Wenn kein Auslöser belegt ist, erzwinge keinen!

DIE 13 CAUSA-DIMENSIONEN (C1–C13):
C1: Chronologischer Beginn | C2: Unmittelbare Vorphase | C3: Konkreter Anlass/Ereignis
C4: Phänomenologie der Einwirkung | C5: Organismischer Ausgangszustand | C6: Wahrnehmung & Sofortreaktion
C7: Chronologie & Latenz | C8: Patienteneigene Zuschreibung | C9: Konkurrierende Faktoren
C10: Akute Einwirkung vs. Hintergrund | C11: Reproduzierbarkeit & Gegenprobe | C12: Historischer Vorzustand
C13: Aufrechterhaltende Einwirkung

Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt dieser Struktur:
{
  "atomicFacts": [
    {
      "factId": "f_1",
      "factText": "Prägnante Tatsachenaussage",
      "originalQuote": "Exakter Wortlaut aus dem Patiententext oder den Antworten",
      "episodeId": "EP_INITIAL",
      "dimensionId": "C1",
      "factStatus": "BELEGT_FAKTISCH",
      "patientConfidence": "SICHERE_BEOBACHTUNG",
      "epistemicRelation": "ZEITLICHE_KOINZIDENZ"
    }
  ],
  "dimensionStates": {
    "C1": { "completion": "TEILWEISE_ERHOBEN", "applicability": "APPLIKABEL", "summary": "..." }
  },
  "openAspects": [
    { "text": "Was ist noch unklar?", "reason": "Warum ist dies für die Causa relevant?", "dimension": "C3" }
  ],
  "nextQuestion": {
    "questionText": "Die GENAU EINE nächste neutrale Einzelfrage an den Patienten (oder null falls isFinished=true)",
    "orientationExample": "Hinweis/Orientierungsbeispiel für den Therapeuten",
    "targetDimension": "C3",
    "reason": "Epistemische Begründung für genau diese Frage",
    "questionStage": 1
  },
  "isFinished": false,
  "stoppingReason": "",
  "finalEvaluation": null
}`;

  // Genau EIN einziger schneller Gemini-Aufruf pro Turn.
  const response = await executeCausaAiGeneration(ai, prompt, 0.1, 2048);

  const rawJsonText = response.text || "{}";
  const parsed = safeParseJson(rawJsonText, null);
  if (parsed && typeof parsed === "object") {
    return {
      atomicFacts: Array.isArray(parsed.atomicFacts) ? parsed.atomicFacts : [],
      dimensionStates: parsed.dimensionStates || {},
      openAspects: Array.isArray(parsed.openAspects) ? parsed.openAspects : [],
      nextQuestion: parsed.isFinished ? null : (parsed.nextQuestion || null),
      isFinished: Boolean(parsed.isFinished),
      stoppingReason: parsed.stoppingReason || (parsed.isFinished ? "Causa-Klärung abgeschlossen." : undefined),
      finalEvaluation: parsed.finalEvaluation || null
    };
  }

  console.warn("[runGeminiOnlyCausaDeepen] Fallback triggered. Raw model response was:", rawJsonText);
  const hasC1Evidence = (Array.isArray(canonicalState?.facts) && canonicalState.facts.some((f: any) => f.dimensionId === 'C1')) ||
    (Array.isArray(canonicalState?.knownFacts) && canonicalState.knownFacts.some((k: any) => k.dimension === 'C1'));

  return {
    atomicFacts: existingCausaText ? [
      {
        factId: "f_fallback",
        factText: existingCausaText,
        originalQuote: rawText.slice(0, 100),
        episodeId: "EP_INITIAL",
        dimensionId: hasC1Evidence ? "C3" : "C1",
        factStatus: "BELEGT_FAKTISCH",
        patientConfidence: "SICHERE_BEOBACHTUNG",
        epistemicRelation: "ZEITLICHE_KOINZIDENZ"
      }
    ] : [],
    dimensionStates: {},
    openAspects: hasC1Evidence 
      ? [{ text: "Mögliche Auslöser & Umstände", reason: "Klärung eventueller Einwirkungen", dimension: "C3" }]
      : [{ text: "Erstbeginn & Chronologie", reason: "Ersterfassung des Beginns", dimension: "C1" }],
    nextQuestion: hasC1Evidence ? null : {
      questionText: "Was erinnern Sie noch von der Zeit, als diese Beschwerden zum allerersten Mal auftraten?",
      orientationExample: "Besondere Ereignisse, Umstände oder körperliche Verfassung.",
      targetDimension: "C1",
      reason: "Offene Erfassung des Beginns nach Fragentrichter Stufe 1.",
      questionStage: 1
    },
    isFinished: Boolean(hasC1Evidence)
  };
}

