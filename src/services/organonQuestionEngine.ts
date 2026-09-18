import { OrganonComplaintMatrix, OrganonComplaintRelation } from './organonAiService';

export interface QuestionHistoryItem {
  step: number;
  question: string;
  answer: string;
  target_complaint_id?: string;
  extracted_updates?: string;
}

export interface OrganonQuestionEngineState {
  complaint_matrices: OrganonComplaintMatrix[];
  complaint_relations: OrganonComplaintRelation[];
  question_history: QuestionHistoryItem[];
  next_question: {
    question_id: string;
    text: string;
    target_complaint_id?: string;
    target_field?: string;
    reason: string;
  } | null;
  is_finished: boolean;
  summary: string;
}

export async function initDynamicQuestions(
  rawText: string,
  initialMatrices: OrganonComplaintMatrix[],
  initialRelations: OrganonComplaintRelation[]
): Promise<OrganonQuestionEngineState> {
  try {
    const res = await fetch('/api/organon/next-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawText,
        currentMatrices: initialMatrices,
        currentRelations: initialRelations,
        questionHistory: [],
        latestAnswer: null,
        currentQuestion: null
      })
    });
    if (res.ok) {
      const data = await res.json();
      return {
        complaint_matrices: data.updatedMatrices || initialMatrices,
        complaint_relations: data.updatedRelations || initialRelations,
        question_history: [],
        next_question: data.nextQuestion || null,
        is_finished: data.isFinished || false,
        summary: data.summary || ''
      };
    }
    console.warn(`[initDynamicQuestions] API returned ${res.status}, using local question step.`);
  } catch (err) {
    console.warn('[initDynamicQuestions] Network unavailable, using local question step:', err);
  }

  // Fallback initial question
  return {
    complaint_matrices: initialMatrices,
    complaint_relations: initialRelations,
    question_history: [],
    next_question: {
      question_id: 'q_1',
      text: 'Wann genau traten die Beschwerden zum ersten Mal auf und gab es einen konkreten Auslöser (z. B. Kälte, Nässe, Ärger, Verletzung)?',
      reason: 'Erfassung von Causa und Beginn nach Organon §§ 83–104.'
    },
    is_finished: false,
    summary: 'Bereit für Einzelfragen-Dialog'
  };
}

export async function submitAnswerAndGetNext(
  rawText: string,
  currentMatrices: OrganonComplaintMatrix[],
  currentRelations: OrganonComplaintRelation[],
  questionHistory: QuestionHistoryItem[],
  latestAnswer: string,
  currentQuestionText: string
): Promise<OrganonQuestionEngineState> {
  try {
    const res = await fetch('/api/organon/next-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawText,
        currentMatrices,
        currentRelations,
        questionHistory,
        latestAnswer,
        currentQuestion: currentQuestionText
      })
    });
    if (res.ok) {
      const data = await res.json();
      const newHistoryItem: QuestionHistoryItem = {
        step: questionHistory.length + 1,
        question: currentQuestionText,
        answer: latestAnswer,
        extracted_updates: data.summary || 'Matrix aktualisiert'
      };

      return {
        complaint_matrices: data.updatedMatrices || currentMatrices,
        complaint_relations: data.updatedRelations || currentRelations,
        question_history: [...questionHistory, newHistoryItem],
        next_question: data.nextQuestion || null,
        is_finished: data.isFinished || false,
        summary: data.summary || ''
      };
    }
    console.warn(`[submitAnswerAndGetNext] API returned ${res.status}, continuing locally.`);
  } catch (err) {
    console.warn('[submitAnswerAndGetNext] Network error, continuing locally:', err);
  }

  // Local rule-based progression
  const stepCount = questionHistory.length + 1;
  const newHistoryItem: QuestionHistoryItem = {
    step: stepCount,
    question: currentQuestionText,
    answer: latestAnswer,
    extracted_updates: `Angabe zu Schritt ${stepCount} dokumentiert: "${latestAnswer}"`
  };

  const updatedMatrices = currentMatrices.map((m, idx) => {
    if (idx === 0) {
      return {
        ...m,
        modalities: [...m.modalities, latestAnswer]
      };
    }
    return m;
  });

  const nextQuestionsByStep = [
    {
      text: 'Wie genau fühlt sich die Empfindung oder der Schmerz an (z. B. stechend, brennend, dumpf, pochend, krampfartig)?',
      reason: 'Präzisierung der Empfindung nach Bönninghausen.'
    },
    {
      text: 'Wodurch bessern sich die Beschwerden (z. B. Wärme, Kälte, Ruhe, fortgesetzte Bewegung, frische Luft) oder verschlechtern sie sich?',
      reason: 'Modalitäten-Erfassung nach Organon § 153.'
    },
    {
      text: 'Gibt es Begleitsymptome wie veränderten Durst, Frostigkeit/Hitzegefühl oder auffällige Gemütsverfassungen (Reizbarkeit, Weinerlichkeit, Unruhe)?',
      reason: 'Allgemein- und Gemütssymptome nach Hahnemann.'
    }
  ];

  const nextStepIdx = questionHistory.length;
  if (nextStepIdx < nextQuestionsByStep.length) {
    return {
      complaint_matrices: updatedMatrices,
      complaint_relations: currentRelations,
      question_history: [...questionHistory, newHistoryItem],
      next_question: {
        question_id: `q_${stepCount + 1}`,
        text: nextQuestionsByStep[nextStepIdx].text,
        reason: nextQuestionsByStep[nextStepIdx].reason
      },
      is_finished: false,
      summary: 'Patientenantwort in Symptommatrix integriert'
    };
  }

  return {
    complaint_matrices: updatedMatrices,
    complaint_relations: currentRelations,
    question_history: [...questionHistory, newHistoryItem],
    next_question: null,
    is_finished: true,
    summary: 'Organon-Anamnese erfolgreich abgeschlossen. Alle Leitsymptome und Modalitäten erfasst.'
  };
}
