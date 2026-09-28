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

export interface CategoryDeepenTiming {
  geminiDurationMs?: number;
  openaiDurationMs?: number;
  fasterEngine?: string;
  selectedEngine?: string;
  durationMs?: number;
}

export interface CategoryDeepenState {
  category: string;
  dimensionStatus: Record<string, 'BELEGT' | 'OFFEN' | 'NICHT_ERINNERLICH' | 'VERNEINT'>;
  knownFacts: CategoryFact[];
  nextQuestion: CategoryQuestion | null;
  isFinished: boolean;
  summaryText: string;
  questionHistory: CategoryHistoryItem[];
  timing?: CategoryDeepenTiming;
}

// In-memory prefetch and cache store for category deepening
const initPromises = new Map<string, Promise<CategoryDeepenState>>();
const initCache = new Map<string, CategoryDeepenState>();

export function getCategoryDeepenCacheKey(params: {
  category: string;
  rawText: string;
  stage1Text?: string;
  language?: string;
  engine?: string;
}): string {
  const { category, rawText, stage1Text = '', language = 'de', engine = 'gemini' } = params;
  return `${category}|${engine}|${language}|${rawText.trim()}|${stage1Text.trim()}`;
}

export function isCategoryDeepenPrefetched(params: {
  category: string;
  rawText: string;
  stage1Text?: string;
  language?: string;
  engine?: string;
}): boolean {
  const key = getCategoryDeepenCacheKey(params);
  return initCache.has(key);
}

export function prefetchCategoryDeepen(
  params: Parameters<typeof requestCategoryDeepen>[0]
): Promise<CategoryDeepenState> {
  const key = getCategoryDeepenCacheKey(params);
  if (initCache.has(key)) {
    return Promise.resolve(initCache.get(key)!);
  }
  if (!initPromises.has(key)) {
    const promise = requestCategoryDeepen({ ...params, action: 'init' })
      .then((res) => {
        initCache.set(key, res);
        return res;
      })
      .catch((err) => {
        initPromises.delete(key);
        initCache.delete(key);
        throw err;
      });
    initPromises.set(key, promise);
  }
  return initPromises.get(key)!;
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
  engine?: 'gemini' | 'openai' | 'both';
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
    currentQuestion = null,
    engine = 'gemini'
  } = params;

  const cacheKey = getCategoryDeepenCacheKey({ category, rawText, stage1Text, language, engine });

  if (action === 'init') {
    if (initCache.has(cacheKey)) {
      return initCache.get(cacheKey)!;
    }
    if (initPromises.has(cacheKey)) {
      const res = await initPromises.get(cacheKey)!;
      initCache.set(cacheKey, res);
      return res;
    }
  }

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
        currentQuestion,
        engine
      })
    });

    if (res.ok) {
      const data = await res.json();
      const stateResult: CategoryDeepenState = {
        category,
        dimensionStatus: data.dimensionStatus || {},
        knownFacts: data.knownFacts || [],
        nextQuestion: data.nextQuestion || null,
        isFinished: Boolean(data.isFinished),
        summaryText: data.summaryText || stage1Text || '',
        questionHistory: data.questionHistory || questionHistory,
        timing: data.timing
      };
      if (action === 'init') {
        initCache.set(cacheKey, stateResult);
      }
      return stateResult;
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

  const fallbackResult: CategoryDeepenState = {
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

  if (action === 'init') {
    initCache.set(cacheKey, fallbackResult);
  }
  return fallbackResult;
}
