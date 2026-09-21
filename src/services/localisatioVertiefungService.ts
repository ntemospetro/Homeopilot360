/**
 * Client-Service für die Stage-2-Localisatio-Vertiefung
 * Kommuniziert mit /api/organon/localisatio-deepen und bietet robuste Fallbacks.
 */

import { LocalisatioVertiefungState, LocalisatioAbCompareState } from '../types.localisatioVertiefung';
import { EndprueferResult } from '../types';
import { seedLocalisatioStateFromOrganonEndpruefer } from './localisatioSeedService';

export async function initLocalisatioVertiefung(
  rawText: string,
  existingLocalisatioText: string = '',
  language: string = 'de',
  endprueferResult?: EndprueferResult | null,
  mode: 'gemini-only' | '3-tier' | 'ab-compare' = 'gemini-only'
): Promise<LocalisatioVertiefungState> {
  const canonicalSeed = seedLocalisatioStateFromOrganonEndpruefer(rawText, endprueferResult || null, existingLocalisatioText);

  try {
    const res = await fetch('/api/organon/localisatio-deepen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'init',
        rawText,
        existingLocalisatioText,
        language,
        mode,
        endprueferResult: endprueferResult || null,
        canonicalState: canonicalSeed
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.state) {
        return {
          ...data.state,
          pipelineMode: data.state.pipelineMode || mode,
          endprueferResult: endprueferResult || null,
          canonicalState: data.state.canonicalState || canonicalSeed
        };
      }
    }
    console.warn(`[initLocalisatioVertiefung] API returned ${res.status}, using local fallback initialization.`);
  } catch (err) {
    console.warn('[initLocalisatioVertiefung] Network error, using local fallback:', err);
  }

  // Lokaler Fallback
  const activeSym = canonicalSeed.symptoms[canonicalSeed.activeSymptomId] || null;
  const activeLabel = activeSym?.symptomLabel || 'Hauptbeschwerde';

  return {
    activeSymptomId: canonicalSeed.activeSymptomId,
    symptomOrder: canonicalSeed.symptomOrder,
    symptoms: canonicalSeed.symptoms as any,
    knownFacts: activeSym?.facts.map(f => ({
      text: f.normalizedValue?.patientRawTerm || f.evidenceText,
      evidence: f.evidenceText,
      symptomId: f.symptomId,
      dimension: f.dimensionId
    })) || [],
    openAspects: [
      { text: 'Genaue Unterregion & Begrenzung', reason: 'Präzisierung erforderlich', dimension: 'L2', symptomId: canonicalSeed.activeSymptomId },
      { text: 'Lateralität / Seitenbezug', reason: 'Seitenangabe noch unbestimmt', dimension: 'L3', symptomId: canonicalSeed.activeSymptomId }
    ],
    evidenceList: activeSym?.facts.map((f, idx) => ({
      id: f.factId || `ev_${idx + 1}`,
      content: f.normalizedValue?.patientRawTerm || f.evidenceText,
      status: f.epistemicStatus,
      originalQuote: f.evidenceText,
      source: 'Organon-Voranalyse',
      assignedSymptom: activeLabel,
      symptomId: f.symptomId,
      episodeId: f.episodeId,
      dimension: f.dimensionId,
      patientConfidence: f.patientConfidence
    })) || [],
    currentQuestion: {
      questionId: 'q_loc_init',
      questionText: `An welcher genauen Stelle spüren Sie den ${activeLabel} am deutlichsten?`,
      orientationExample: 'Zum Beispiel rechts, links, mittig, an einer bestimmten Stelle oder umschrieben?',
      reason: 'Offene, neutrale Erfassung der Lokalisation ohne voreilige Scheingenauigkeit.',
      targetDimension: 'L1',
      targetSymptomId: canonicalSeed.activeSymptomId,
      targetSymptomLabel: activeLabel
    },
    history: [],
    isFinished: false,
    finalSummary: null,
    canonicalState: canonicalSeed,
    pipelineMode: mode
  };
}

export async function submitLocalisatioAnswer(
  rawText: string,
  currentState: LocalisatioVertiefungState,
  latestAnswer: string,
  language: string = 'de',
  mode?: 'gemini-only' | '3-tier' | 'ab-compare'
): Promise<LocalisatioVertiefungState> {
  const activeMode = mode || currentState.pipelineMode || 'gemini-only';

  try {
    const res = await fetch('/api/organon/localisatio-deepen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'step',
        rawText,
        state: currentState,
        latestAnswer,
        language,
        mode: activeMode,
        endprueferResult: currentState.endprueferResult || null
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.state) {
        if (Array.isArray(data.state.history)) {
          data.state.history = data.state.history.map((h: any, idx: number) => ({
            step: h.step || idx + 1,
            question: h.question || h.questionText || currentState?.history?.[idx]?.question || currentState?.currentQuestion?.questionText || '',
            orientationExample: h.orientationExample || currentState?.currentQuestion?.orientationExample || '',
            answer: h.answer || h.patientAnswer || h.extractedNotes || latestAnswer || '',
            extractedNotes: h.extractedNotes || h.answer || latestAnswer || '',
            symptomId: h.symptomId || currentState.activeSymptomId,
            dimension: h.dimension || currentState.currentQuestion?.targetDimension
          }));
        }
        return {
          ...data.state,
          pipelineMode: data.state.pipelineMode || activeMode,
          endprueferResult: data.state.endprueferResult || currentState.endprueferResult || null
        };
      }
    }
    console.warn(`[submitLocalisatioAnswer] API returned ${res.status}, using local fallback transition.`);
  } catch (err) {
    console.warn('[submitLocalisatioAnswer] Network error, using local fallback transition:', err);
  }

  // Lokale Fallback-Transition
  const stepNumber = currentState.history.length + 1;
  const prevQ = currentState.currentQuestion;
  const cleanAns = latestAnswer.trim();

  const newHistory = [
    ...currentState.history,
    {
      step: stepNumber,
      question: prevQ?.questionText || 'Lokalisationsfrage',
      orientationExample: prevQ?.orientationExample,
      answer: cleanAns,
      extractedNotes: cleanAns,
      symptomId: currentState.activeSymptomId,
      dimension: prevQ?.targetDimension
    }
  ];

  const updatedKnown = [
    ...currentState.knownFacts,
    {
      text: cleanAns,
      evidence: `Patientenaussage Frage ${stepNumber}`,
      symptomId: currentState.activeSymptomId,
      dimension: prevQ?.targetDimension || 'L1'
    }
  ];

  // Prüfen, ob wir zum nächsten Symptom wechseln müssen
  const currentSymIdx = currentState.symptomOrder.indexOf(currentState.activeSymptomId);
  const nextSymId = currentState.symptomOrder[currentSymIdx + 1] || null;

  if (stepNumber >= 2 && nextSymId) {
    // Wechsle zum nächsten Symptom
    const nextSym = currentState.symptoms[nextSymId];
    return {
      ...currentState,
      activeSymptomId: nextSymId,
      knownFacts: updatedKnown,
      history: newHistory,
      currentQuestion: {
        questionId: `q_loc_${stepNumber + 1}`,
        questionText: `Wie verhält es sich mit dem ${nextSym?.symptomLabel || 'zweiten Symptom'} – wo genau tritt dieser auf?`,
        orientationExample: 'Bitte beschreiben Sie die genaue Stelle und ob der Schmerz ausstrahlt.',
        reason: 'Symptomwechsel im Multi-Symptom-Workflow nach Abschluss des ersten Symptoms.',
        targetDimension: 'L1',
        targetSymptomId: nextSymId,
        targetSymptomLabel: nextSym?.symptomLabel || 'Zweitsymptom'
      }
    };
  }

  const isFinished = stepNumber >= 3 || (!nextSymId && stepNumber >= 2);

  return {
    ...currentState,
    knownFacts: updatedKnown,
    history: newHistory,
    currentQuestion: isFinished ? null : {
      questionId: `q_loc_${stepNumber + 1}`,
      questionText: 'Breitet sich der Schmerz von dort in eine andere Richtung aus, oder bleibt er an dieser Stelle?',
      orientationExample: 'Zum Beispiel zieht er in den Nacken, die Stirn oder bleibt er ortsfest?',
      reason: 'Klärung der räumlichen Dynamik L7.',
      targetDimension: 'L7',
      targetSymptomId: currentState.activeSymptomId,
      targetSymptomLabel: currentState.symptoms[currentState.activeSymptomId]?.symptomLabel || 'Hauptbeschwerde'
    },
    isFinished,
    finalSummary: isFinished ? {
      levelA_patientReported: updatedKnown.map(k => k.text),
      levelB_conservativeNormalizations: ['Konservative anatomische Erfassung abgeschlossen'],
      levelC_unresolvedOrVague: [],
      overallResult: 'Localisatio-Vertiefung abgeschlossen.'
    } : null
  };
}

export async function finalizeLocalisatioVertiefung(
  rawText: string,
  currentState: LocalisatioVertiefungState,
  language: string = 'de',
  mode?: 'gemini-only' | '3-tier' | 'ab-compare'
): Promise<LocalisatioVertiefungState> {
  const activeMode = mode || currentState.pipelineMode || 'gemini-only';

  try {
    const res = await fetch('/api/organon/localisatio-deepen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'finalize',
        rawText,
        state: currentState,
        latestAnswer: '',
        language,
        mode: activeMode,
        endprueferResult: currentState.endprueferResult || null
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.state) {
        return {
          ...data.state,
          isFinished: true,
          pipelineMode: data.state.pipelineMode || activeMode,
          endprueferResult: data.state.endprueferResult || currentState.endprueferResult || null
        };
      }
    }
  } catch (err) {
    console.warn('[finalizeLocalisatioVertiefung] Error:', err);
  }

  return {
    ...currentState,
    isFinished: true,
    currentQuestion: null,
    finalSummary: currentState.finalSummary || {
      levelA_patientReported: currentState.knownFacts.map(k => k.text),
      levelB_conservativeNormalizations: ['Manuell abgeschlossen.'],
      levelC_unresolvedOrVague: [],
      overallResult: 'Localisatio-Vertiefung abgeschlossen.'
    }
  };
}

export async function initLocalisatioAbCompare(
  rawText: string,
  existingLocalisatioText: string = '',
  language: string = 'de',
  endprueferResult?: EndprueferResult | null
): Promise<LocalisatioAbCompareState> {
  const [bA, bB] = await Promise.all([
    initLocalisatioVertiefung(rawText, existingLocalisatioText, language, endprueferResult, '3-tier'),
    initLocalisatioVertiefung(rawText, existingLocalisatioText, language, endprueferResult, 'gemini-only')
  ]);
  return {
    branchA: bA,
    branchB: bB,
    pipelineMode: 'ab-compare'
  };
}

export async function submitLocalisatioAbCompareAnswer(
  rawText: string,
  currentStateA: LocalisatioVertiefungState,
  currentStateB: LocalisatioVertiefungState,
  latestAnswer: string,
  language: string = 'de'
): Promise<LocalisatioAbCompareState> {
  const [bA, bB] = await Promise.all([
    submitLocalisatioAnswer(rawText, currentStateA, latestAnswer, language, '3-tier'),
    submitLocalisatioAnswer(rawText, currentStateB, latestAnswer, language, 'gemini-only')
  ]);
  return {
    branchA: bA,
    branchB: bB,
    pipelineMode: 'ab-compare'
  };
}

export async function finalizeLocalisatioAbCompare(
  rawText: string,
  currentStateA: LocalisatioVertiefungState,
  currentStateB: LocalisatioVertiefungState,
  language: string = 'de'
): Promise<LocalisatioAbCompareState> {
  const [bA, bB] = await Promise.all([
    finalizeLocalisatioVertiefung(rawText, currentStateA, language, '3-tier'),
    finalizeLocalisatioVertiefung(rawText, currentStateB, language, 'gemini-only')
  ]);
  return {
    branchA: bA,
    branchB: bB,
    pipelineMode: 'ab-compare'
  };
}
