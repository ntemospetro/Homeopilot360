import { CANONICAL_KENT_CHAPTERS, FALLBACK_KENT_CHAPTERS, getCanonicalKentChapterTranslations } from '../../data/canonicalKentChapters';
import { getCanonicalKentTermTranslation } from '../../data/canonicalKentTerms';

export interface ClientKentRubricItem {
  id: string;
  chapter: string;
  chapterTranslated?: string;
  symptom: string;
  symptomTranslated?: string;
  zusatz: string[];
  zusatzTranslated?: string[];
  path: string;
  pathTranslated?: string;
  remedies: Record<string, number>;
  remedyCount: number;
}

export interface ClientKentDrilldownResult {
  success: boolean;
  nextLevelType: 'chapter' | 'symptom' | 'zusatz' | 'none';
  nextLevelIndex: number;
  nextOptions: string[];
  translatedOptions: Record<string, string>;
  pathTranslations: Record<string, string>;
  rubrics: ClientKentRubricItem[];
}

let cachedTranslations: Record<string, Record<string, string>> | null = null;
const cachedChapterRubrics: Record<string, ClientKentRubricItem[]> = {};

/**
 * Loads translations dictionary from static public directory if not yet loaded.
 */
export async function getClientKentTranslations(lang = 'de'): Promise<Record<string, string>> {
  if (lang === 'de') return {};

  if (!cachedTranslations) {
    try {
      const res = await fetch('/data/kent_translations.json');
      if (res.ok) {
        cachedTranslations = await res.json();
      }
    } catch (e) {
      console.warn('[KentClient] Could not fetch static translations:', e);
    }
  }

  return (cachedTranslations && cachedTranslations[lang]) || {};
}

/**
 * Loads static chapter rubrics from public/data/kent_chapters/[chapter].json
 */
export async function getClientChapterRubrics(chapter: string): Promise<ClientKentRubricItem[]> {
  if (!chapter) return [];
  if (cachedChapterRubrics[chapter]) return cachedChapterRubrics[chapter];

  try {
    const encoded = encodeURIComponent(chapter);
    const res = await fetch(`/data/kent_chapters/${encoded}.json`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        cachedChapterRubrics[chapter] = data;
        return data;
      }
    }
  } catch (e) {
    console.warn(`[KentClient] Could not fetch chapter data for ${chapter}:`, e);
  }

  return [];
}

/**
 * Translates a single term using static translations and canonical dictionaries
 */
function translateTerm(term: string, transMap: Record<string, string>, lang: string): string {
  if (!term) return '';
  if (lang === 'de') return term;

  // 1. Direct dictionary match
  if (transMap[term]) return transMap[term];
  const trimmed = term.trim();
  if (transMap[trimmed]) return transMap[trimmed];

  // 2. Canonical Kent Chapters dictionary
  if (CANONICAL_KENT_CHAPTERS[trimmed]?.[lang]) {
    return CANONICAL_KENT_CHAPTERS[trimmed][lang];
  }

  // 3. Canonical Kent Terms dictionary
  const canon = getCanonicalKentTermTranslation(trimmed, lang as any);
  if (canon) return canon;

  // 4. Case-insensitive lookup in transMap
  const lower = trimmed.toLowerCase();
  for (const [k, v] of Object.entries(transMap)) {
    if (k.toLowerCase() === lower && v) return v;
  }

  // 5. Tokenized fallback for compound terms
  if (trimmed.includes(' ') || trimmed.includes('-') || trimmed.includes(',')) {
    const parts = trimmed.split(/(\s+|-|,)/);
    let changed = false;
    const translatedParts = parts.map(part => {
      const pTrim = part.trim();
      if (!pTrim || part === ',' || part === '-') return part;
      const t = transMap[pTrim] || getCanonicalKentTermTranslation(pTrim, lang as any);
      if (t) {
        changed = true;
        return t;
      }
      return part;
    });
    if (changed) return translatedParts.join('');
  }

  return trimmed;
}

/**
 * Formats a localized rubric item
 */
function formatRubric(r: ClientKentRubricItem, transMap: Record<string, string>, lang: string): ClientKentRubricItem {
  const chapterTranslated = translateTerm(r.chapter, transMap, lang) || r.chapter;
  const symptomTranslated = translateTerm(r.symptom, transMap, lang) || r.symptom;
  const zusatzTranslated = (r.zusatz || []).map(z => translateTerm(z, transMap, lang) || z);

  const parts = [chapterTranslated, symptomTranslated, ...zusatzTranslated].filter(Boolean);
  const pathTranslated = parts.length > 0 ? parts.join(' ➔ ') : r.path;

  return {
    ...r,
    chapterTranslated,
    symptomTranslated,
    zusatzTranslated,
    pathTranslated
  };
}

/**
 * Autonomously executes hierarchical drilldown in the browser
 */
export async function performClientKentDrilldown(params: {
  chapter?: string;
  symptom?: string;
  zusatz?: string[];
  lang?: string;
}): Promise<ClientKentDrilldownResult> {
  const { chapter, symptom, zusatz = [], lang = 'de' } = params;
  const transMap = await getClientKentTranslations(lang);
  const pathTranslations: Record<string, string> = {};

  // Level 1: Chapters
  if (!chapter) {
    const translatedOptions: Record<string, string> = {};
    const chapterMap = getCanonicalKentChapterTranslations(lang);
    for (const ch of FALLBACK_KENT_CHAPTERS) {
      translatedOptions[ch] = chapterMap[ch] || translateTerm(ch, transMap, lang) || ch;
    }

    const sortedChapters = [...FALLBACK_KENT_CHAPTERS].sort((a, b) => {
      const tA = translatedOptions[a] || a;
      const tB = translatedOptions[b] || b;
      return tA.localeCompare(tB, lang);
    });

    return {
      success: true,
      nextLevelType: 'chapter',
      nextLevelIndex: -1,
      nextOptions: sortedChapters,
      translatedOptions,
      pathTranslations,
      rubrics: []
    };
  }

  // Pre-seed chapter path translation
  pathTranslations[chapter] = translateTerm(chapter, transMap, lang) || chapter;

  // Load all rubrics for this chapter
  const chapterRubrics = await getClientChapterRubrics(chapter);

  // Level 2: Symptoms for selected chapter
  if (!symptom) {
    const symptomsSet = new Set<string>();
    for (const r of chapterRubrics) {
      if (r.symptom) symptomsSet.add(r.symptom);
    }
    const symptomsList = Array.from(symptomsSet);
    const translatedOptions: Record<string, string> = {};

    for (const s of symptomsList) {
      translatedOptions[s] = translateTerm(s, transMap, lang) || s;
    }

    symptomsList.sort((a, b) => {
      const tA = translatedOptions[a] || a;
      const tB = translatedOptions[b] || b;
      return tA.localeCompare(tB, lang);
    });

    return {
      success: true,
      nextLevelType: 'symptom',
      nextLevelIndex: 0,
      nextOptions: symptomsList,
      translatedOptions,
      pathTranslations,
      rubrics: chapterRubrics.slice(0, 100).map(r => formatRubric(r, transMap, lang))
    };
  }

  // Pre-seed symptom path translation
  pathTranslations[symptom] = translateTerm(symptom, transMap, lang) || symptom;

  // Filter rubrics by symptom
  const symptomLower = symptom.toLowerCase().trim();
  let matching = chapterRubrics.filter(r => (r.symptom || '').toLowerCase().trim() === symptomLower);

  // Filter by zusatz levels
  const depth = zusatz.length;
  for (let i = 0; i < depth; i++) {
    const zVal = zusatz[i];
    const zLower = zVal.toLowerCase().trim();
    matching = matching.filter(r => r.zusatz && r.zusatz[i] && r.zusatz[i].toLowerCase().trim() === zLower);
    pathTranslations[zVal] = translateTerm(zVal, transMap, lang) || zVal;
  }

  // Extract next zusatz options at current depth
  const nextOptionsSet = new Set<string>();
  for (const r of matching) {
    if (r.zusatz && r.zusatz[depth]) {
      nextOptionsSet.add(r.zusatz[depth]);
    }
  }

  const nextOptions = Array.from(nextOptionsSet);
  const translatedOptions: Record<string, string> = {};

  for (const opt of nextOptions) {
    translatedOptions[opt] = translateTerm(opt, transMap, lang) || opt;
  }

  nextOptions.sort((a, b) => {
    const tA = translatedOptions[a] || a;
    const tB = translatedOptions[b] || b;
    return tA.localeCompare(tB, lang);
  });

  return {
    success: true,
    nextLevelType: nextOptions.length > 0 ? 'zusatz' : 'none',
    nextLevelIndex: depth,
    nextOptions,
    translatedOptions,
    pathTranslations,
    rubrics: matching.slice(0, 150).map(r => formatRubric(r, transMap, lang))
  };
}

/**
 * Client-side search across rubrics
 */
export async function searchClientKentRubrics(params: {
  query: string;
  chapter?: string;
  lang?: string;
  limit?: number;
}): Promise<ClientKentRubricItem[]> {
  const { query, chapter, lang = 'de', limit = 100 } = params;
  if (!query || !query.trim()) return [];

  const transMap = await getClientKentTranslations(lang);
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

  let pool: ClientKentRubricItem[] = [];
  if (chapter) {
    pool = await getClientChapterRubrics(chapter);
  } else {
    // Search in currently cached chapters, or load common chapters
    const chaptersToSearch = Object.keys(cachedChapterRubrics).length > 0
      ? Object.keys(cachedChapterRubrics)
      : ['Kopf', 'Magen', 'Gemüt', 'Allgemeines', 'Extremitäten'];

    for (const ch of chaptersToSearch) {
      const rubrics = await getClientChapterRubrics(ch);
      pool.push(...rubrics);
    }
  }

  const results: ClientKentRubricItem[] = [];
  for (const r of pool) {
    const pathLower = (r.path || '').toLowerCase();
    const symLower = (r.symptom || '').toLowerCase();
    const formatted = formatRubric(r, transMap, lang);
    const pathTransLower = (formatted.pathTranslated || '').toLowerCase();
    const symTransLower = (formatted.symptomTranslated || '').toLowerCase();

    const matchesAll = tokens.every(token => {
      return pathLower.includes(token) ||
        symLower.includes(token) ||
        pathTransLower.includes(token) ||
        symTransLower.includes(token);
    });

    if (matchesAll) {
      results.push(formatted);
      if (results.length >= limit) break;
    }
  }

  return results;
}
