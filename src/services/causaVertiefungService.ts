import { CausaVertiefungState, CausaAbCompareState } from '../types.causaVertiefung';
import { EndprueferResult } from '../types';
import { seedCausaStateFromOrganonEndpruefer } from './causaSeedService';

export async function initCausaVertiefung(
  rawText: string,
  existingCausaText: string = '',
  language: string = 'de',
  endprueferResult?: EndprueferResult | null,
  mode: 'gemini-only' | '3-tier' | 'ab-compare' = 'gemini-only'
): Promise<CausaVertiefungState> {
  const canonicalSeed = seedCausaStateFromOrganonEndpruefer(rawText, endprueferResult || null, existingCausaText);

  try {
    const res = await fetch('/api/organon/causa-deepen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'init',
        rawText,
        existingCausaText,
        language,
        mode,
        endprueferResult: endprueferResult || null
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
    console.warn(`[initCausaVertiefung] API returned ${res.status}, using local fallback initialization.`);
  } catch (err) {
    console.warn('[initCausaVertiefung] Network error, using local fallback:', err);
  }

  // Local fallback adhering strictly to Rule 3, 5, 6, 7, 8, 9, 12
  const clean = (rawText || '').trim();
  const hasExisting = Boolean(existingCausaText && existingCausaText.trim() && !existingCausaText.toLowerCase().includes('nicht angegeben') && !existingCausaText.toLowerCase().includes('keine angabe'));

  const knownFacts = hasExisting ? [
    {
      text: existingCausaText.trim(),
      evidence: 'Aus Organon-Analyse übernommen'
    }
  ] : [];

  const openAspects = [
    {
      text: 'Zeitlicher Zusammenhang und Beginn der Beschwerden',
      reason: 'Noch nicht präzise nach Organon §§ 83–104 charakterisiert'
    },
    {
      text: 'Möglicher körperlicher oder psychosozialer Auslöser',
      reason: 'Muss neutral und ohne voreilige psychologische Interpretation erfragt werden'
    },
    {
      text: 'Eigene Ursachenzuschreibung des Patienten',
      reason: 'Wurde vom Patienten noch nicht ausdrücklich genannt oder bestätigt'
    }
  ];

  return {
    knownFacts,
    openAspects,
    evidenceList: hasExisting ? [
      {
        id: 'ev_init_1',
        content: existingCausaText.trim(),
        status: 'EXPLICIT',
        originalQuote: clean.slice(0, 100),
        source: 'Organon-Voranalyse',
        assignedSymptom: 'Hauptbeschwerde'
      }
    ] : [],
    currentQuestion: {
      questionId: 'q_causa_init',
      questionText: 'Was war in der Zeit unmittelbar vor dem erstmaligen Auftreten der Beschwerden in deinem Leben oder körperlich anders als sonst?',
      orientationExample: 'Zum Beispiel ein besonderes Ereignis, eine Erkrankung, körperliche Belastung, Veränderung der Lebenssituation oder etwas anderes, das zeitlich auffällt.',
      reason: 'Offene, neutrale Erfassung zeitlich vorausgehender Ereignisse ohne Halluzination oder voreilige Kausalitätsannahme.',
      targetDimension: 'vorausgehendes_ereignis'
    },
    history: [],
    isFinished: false,
    finalSummary: null,
    canonicalState: canonicalSeed
  };
}

export async function submitCausaAnswer(
  rawText: string,
  currentState: CausaVertiefungState,
  latestAnswer: string,
  language: string = 'de',
  mode?: 'gemini-only' | '3-tier' | 'ab-compare'
): Promise<CausaVertiefungState> {
  const activeMode = mode || currentState.pipelineMode || 'gemini-only';
  try {
    const res = await fetch('/api/organon/causa-deepen', {
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
            extractedNotes: h.extractedNotes || h.answer || latestAnswer || ''
          }));
        }
        return {
          ...data.state,
          pipelineMode: data.state.pipelineMode || activeMode,
          endprueferResult: data.state.endprueferResult || currentState.endprueferResult || null
        };
      }
    }
    console.warn(`[submitCausaAnswer] API returned ${res.status}, using local state transition.`);
  } catch (err) {
    console.warn('[submitCausaAnswer] Network error, using local fallback transition:', err);
  }

  // Local fallback transition
  const stepNumber = currentState.history.length + 1;
  const prevQ = currentState.currentQuestion;
  const cleanAns = latestAnswer.trim();

  const newHistory = [
    ...currentState.history,
    {
      step: stepNumber,
      question: prevQ?.questionText || 'Causa-Vertiefungsfrage',
      orientationExample: prevQ?.orientationExample,
      answer: cleanAns,
      extractedNotes: cleanAns
    }
  ];

  // Determine status based on answer wording
  let status: any = 'EXPLICIT';
  const lower = cleanAns.toLowerCase();
  if (lower.includes('nein') || lower.includes('gar nichts') || lower.includes('überhaupt nicht') || lower.includes('keinesfalls')) {
    status = 'DENIED';
  } else if (lower.includes('weiß nicht') || lower.includes('unsicher') || lower.includes('vielleicht') || lower.includes('kann sein')) {
    status = 'UNCERTAIN';
  }

  const newEvidence = [
    ...currentState.evidenceList,
    {
      id: `ev_step_${stepNumber}`,
      content: cleanAns,
      status: status,
      originalQuote: cleanAns,
      source: `Antwort Frage ${stepNumber}`,
      assignedSymptom: 'Hauptbeschwerde',
      dimension: prevQ?.targetDimension || 'allgemein'
    }
  ];

  const updatedKnown = [
    ...currentState.knownFacts,
    {
      text: cleanAns,
      evidence: `Patientenaussage Frage ${stepNumber}`
    }
  ];

  // If 3 or more questions have been answered, wrap up or ask specific attribution question
  if (stepNumber >= 3) {
    return {
      ...currentState,
      knownFacts: updatedKnown,
      evidenceList: newEvidence,
      history: newHistory,
      currentQuestion: null,
      isFinished: true,
      finalSummary: {
        levelA_patientReported: updatedKnown.map(k => k.text),
        levelB_unresolvedOrConflicting: currentState.openAspects.map(o => o.text),
        levelC_homeopathicInterpretation: [
          'Auf Basis der Patientenangaben liegt ein plausibler Auslöserkomplex vor. Relevante Rubriken der Causa nach Bönninghausen & Hahnemann können zur Repertorisation herangezogen werden.'
        ]
      }
    };
  }

  // Next question
  let nextQ = {
    questionId: `q_causa_${stepNumber + 1}`,
    questionText: 'Siehst du selbst einen direkten Zusammenhang zwischen diesem Ereignis und deinen Beschwerden? Wenn ja: Was genau war daran für dich am spürbarsten oder belastendsten?',
    orientationExample: 'Zum Beispiel die körperliche Kälte, die anhaltende Anstrengung, die seelische Kränkung oder das Gefühl der Überforderung.',
    reason: 'Erhebung der eigenen Ursachenzuschreibung des Patienten ohne suggestive Interpretation.',
    targetDimension: 'eigene_zuschreibung'
  };

  if (stepNumber === 1) {
    nextQ = {
      questionId: `q_causa_2`,
      questionText: 'Wie viel Zeit lag genau zwischen diesem Ereignis und den ersten spürbaren Symptomen?',
      orientationExample: 'Zum Beispiel unmittelbar danach (wenige Minuten bis Stunden), am nächsten Morgen oder erst nach mehreren Tagen.',
      reason: 'Präzisierung des zeitlichen Abstands und der Latenzzeit nach Organon.',
      targetDimension: 'zeitlicher_abstand'
    };
  }

  return {
    ...currentState,
    knownFacts: updatedKnown,
    evidenceList: newEvidence,
    history: newHistory,
    currentQuestion: nextQ,
    isFinished: false,
    finalSummary: null
  };
}

export async function finalizeCausaVertiefung(
  rawText: string,
  currentState: CausaVertiefungState,
  language: string = 'de'
): Promise<CausaVertiefungState> {
  try {
    const res = await fetch('/api/organon/causa-deepen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'finalize',
        rawText,
        state: currentState,
        language
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.state) {
        return data.state;
      }
    }
  } catch (err) {
    console.warn('[finalizeCausaVertiefung] Network error, creating local final summary:', err);
  }

  return {
    ...currentState,
    isFinished: true,
    finalSummary: {
      levelA_patientReported: currentState.knownFacts.length > 0
        ? currentState.knownFacts.map(k => k.text)
        : ['Keine spezifische Causa ausdrücklich vom Patienten angegeben.'],
      levelB_unresolvedOrConflicting: currentState.openAspects.length > 0
        ? currentState.openAspects.map(o => o.text)
        : ['Keine offenen Widersprüche verblieben.'],
      levelC_homeopathicInterpretation: [
        'Klassische Simile-Differenzierung: Erfasste Zeit- und Auslöserbeziehungen für die Mittelwahl und Causa-Rubriken des Organon heranziehen.'
      ]
    }
  };
}

export async function initCausaAbCompare(
  rawText: string,
  existingCausaText: string = '',
  language: string = 'de',
  endprueferResult?: EndprueferResult | null
): Promise<CausaAbCompareState> {
  const canonicalSeed = seedCausaStateFromOrganonEndpruefer(rawText, endprueferResult || null, existingCausaText);

  try {
    const res = await fetch('/api/organon/causa-deepen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'init',
        rawText,
        existingCausaText,
        language,
        mode: 'ab-compare',
        endprueferResult: endprueferResult || null
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.stateA && data.stateB) {
        return {
          branchA: {
            ...data.stateA,
            pipelineMode: '3-tier',
            endprueferResult: endprueferResult || null,
            canonicalState: data.stateA.canonicalState || canonicalSeed
          },
          branchB: {
            ...data.stateB,
            pipelineMode: 'gemini-only',
            endprueferResult: endprueferResult || null,
            canonicalState: data.stateB.canonicalState || canonicalSeed
          }
        };
      }
    }
    console.warn(`[initCausaAbCompare] API returned ${res.status}, using parallel fallback.`);
  } catch (err) {
    console.warn('[initCausaAbCompare] Network error, using parallel fallback:', err);
  }

  const [initA, initB] = await Promise.all([
    initCausaVertiefung(rawText, existingCausaText, language, endprueferResult, '3-tier'),
    initCausaVertiefung(rawText, existingCausaText, language, endprueferResult, 'gemini-only')
  ]);
  return { branchA: initA, branchB: initB };
}

export async function submitCausaAbCompareAnswer(
  rawText: string,
  stateA: CausaVertiefungState,
  stateB: CausaVertiefungState,
  latestAnswer: string,
  language: string = 'de'
): Promise<CausaAbCompareState> {
  try {
    const res = await fetch('/api/organon/causa-deepen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'step',
        rawText,
        stateA,
        stateB,
        latestAnswer,
        language,
        mode: 'ab-compare',
        endprueferResult: stateA.endprueferResult || stateB.endprueferResult || null
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.stateA && data.stateB) {
        return {
          branchA: {
            ...data.stateA,
            pipelineMode: '3-tier',
            endprueferResult: stateA.endprueferResult || null
          },
          branchB: {
            ...data.stateB,
            pipelineMode: 'gemini-only',
            endprueferResult: stateB.endprueferResult || null
          }
        };
      }
    }
    console.warn(`[submitCausaAbCompareAnswer] API returned ${res.status}, using client parallel fallback.`);
  } catch (err) {
    console.warn('[submitCausaAbCompareAnswer] Network error, using client parallel fallback:', err);
  }

  const [nextA, nextB] = await Promise.all([
    submitCausaAnswer(rawText, stateA, latestAnswer, language, '3-tier'),
    submitCausaAnswer(rawText, stateB, latestAnswer, language, 'gemini-only')
  ]);
  return { branchA: nextA, branchB: nextB };
}

export async function finalizeCausaAbCompare(
  rawText: string,
  stateA: CausaVertiefungState,
  stateB: CausaVertiefungState,
  language: string = 'de'
): Promise<CausaAbCompareState> {
  const [finA, finB] = await Promise.all([
    finalizeCausaVertiefung(rawText, stateA, language),
    finalizeCausaVertiefung(rawText, stateB, language)
  ]);
  return { branchA: finA, branchB: finB };
}
