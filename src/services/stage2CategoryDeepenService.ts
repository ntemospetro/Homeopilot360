/**
 * Service for Stage 2 Category Deepening (Sensatio, Symptoma, Modalitäten, Concomitantia, Comorbiditas, Mens, Animus)
 * Communicates with /api/organon/category-deepen
 */

export interface CategoryQuestion {
  text: string;
  targetDimension: string;
  orientationExample: string;
  reason?: string;
}

export interface CategoryFact {
  text: string;
  dimension: string;
  status: 'BELEGT' | 'OFFEN' | 'NICHT_ERINNERLICH' | 'VERNEINT';
}

export interface CategoryHistoryItem {
  question: string;
  answer: string;
  targetDimension?: string;
}

export interface CategoryDeepenState {
  category: string;
  dimensionStatus: Record<string, 'BELEGT' | 'OFFEN' | 'NICHT_ERINNERLICH' | 'VERNEINT'>;
  knownFacts: CategoryFact[];
  nextQuestion: CategoryQuestion | null;
  isFinished: boolean;
  summaryText: string;
  questionHistory: CategoryHistoryItem[];
}

export async function requestCategoryDeepen(params: {
  action: 'init' | 'step' | 'finalize';
  category: string;
  categoryTitle?: string;
  rawText: string;
  stage1Text?: string;
  dimensions: Array<{ code: string; title: string; desc: string }>;
  questionHistory?: CategoryHistoryItem[];
  knownFacts?: CategoryFact[];
  latestAnswer?: string;
  language?: string;
  currentQuestion?: CategoryQuestion | null;
}): Promise<CategoryDeepenState> {
  const {
    action,
    category,
    categoryTitle = category,
    rawText,
    stage1Text = '',
    dimensions,
    questionHistory = [],
    knownFacts = [],
    latestAnswer = '',
    language = 'de',
    currentQuestion = null
  } = params;

  try {
    const res = await fetch('/api/organon/category-deepen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        category,
        categoryTitle,
        rawText,
        stage1Text,
        dimensions,
        questionHistory,
        knownFacts,
        latestAnswer,
        language,
        currentQuestion
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        category,
        dimensionStatus: data.dimensionStatus || {},
        knownFacts: data.knownFacts || [],
        nextQuestion: data.nextQuestion || null,
        isFinished: Boolean(data.isFinished),
        summaryText: data.summaryText || stage1Text || '',
        questionHistory: data.questionHistory || questionHistory
      };
    }
    console.warn(`[/api/organon/category-deepen] Server responded with status ${res.status}`);
  } catch (err) {
    console.warn('[/api/organon/category-deepen] Network error, using fallback:', err);
  }

  // Graceful client-side fallback if offline / error
  const dimCodes = dimensions.map(d => d.code);
  const fallbackStatus: Record<string, 'BELEGT' | 'OFFEN'> = {};
  dimCodes.forEach((c, idx) => {
    fallbackStatus[c] = idx === 0 && stage1Text.trim().length > 0 ? 'BELEGT' : 'OFFEN';
  });

  const nextDim = dimensions.find(d => fallbackStatus[d.code] === 'OFFEN') || dimensions[0];

  return {
    category,
    dimensionStatus: fallbackStatus,
    knownFacts: stage1Text ? [{ text: stage1Text, dimension: dimCodes[0], status: 'BELEGT' }] : [],
    nextQuestion: nextDim ? {
      text: `Können Sie die Ausprägung bezüglich „${nextDim.title}“ näher beschreiben?`,
      targetDimension: nextDim.code,
      orientationExample: nextDim.desc,
      reason: 'Organon §§ 84–90 Differenzierung'
    } : null,
    isFinished: false,
    summaryText: stage1Text,
    questionHistory: questionHistory
  };
}
