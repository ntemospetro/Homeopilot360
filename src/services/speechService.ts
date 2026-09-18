import { LanguageCode } from '../types';

export const LANGUAGE_SPEECH_MAP: Record<LanguageCode, string> = {
  de: 'de-DE',
  en: 'en-US',
  fr: 'fr-FR',
  el: 'el-GR',
  it: 'it-IT',
  ru: 'ru-RU',
  es: 'es-ES',
};

export const LANGUAGE_DISPLAY_NAMES: Record<LanguageCode, string> = {
  de: 'Deutsch (de-DE)',
  en: 'English (en-US)',
  fr: 'Français (fr-FR)',
  el: 'Ελληνικά (el-GR)',
  it: 'Italiano (it-IT)',
  ru: 'Русский (ru-RU)',
  es: 'Español (es-ES)',
};

export interface SpeechRecognitionOptions {
  language: LanguageCode;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface SpeechRecognitionSession {
  stop: () => void;
  abort: () => void;
}

// Window typing for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function deduplicateRepeatedPhrases(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  // 1. Punctuation-based sentence deduplication
  const sentences = trimmed.split(/(?<=[.?!;])\s+/);
  let cleanSentences: string[] = [];
  for (const s of sentences) {
    const sTrimmed = s.trim();
    if (!sTrimmed) continue;
    const norm = sTrimmed.toLowerCase().replace(/[.,!?;:]/g, '').trim();
    const last = cleanSentences[cleanSentences.length - 1];
    const lastNorm = last ? last.toLowerCase().replace(/[.,!?;:]/g, '').trim() : '';
    if (last && norm === lastNorm) continue;
    cleanSentences.push(sTrimmed);
  }

  let words = cleanSentences.join(' ').split(/\s+/).filter(Boolean);
  if (words.length <= 1) return words.join(' ');

  // 2. Multi-word n-gram deduplication (eliminates repeated phrases of length 1 to words.length / 2)
  let modified = true;
  let iterations = 0;
  while (modified && iterations < 20) {
    modified = false;
    iterations++;
    const maxN = Math.min(Math.floor(words.length / 2), 12);
    for (let n = maxN; n >= 1; n--) {
      for (let i = 0; i <= words.length - 2 * n; i++) {
        const chunk1 = words.slice(i, i + n).map(w => w.toLowerCase().replace(/[.,!?;:]/g, '')).join(' ');
        const chunk2 = words.slice(i + n, i + 2 * n).map(w => w.toLowerCase().replace(/[.,!?;:]/g, '')).join(' ');
        if (chunk1 && chunk1 === chunk2) {
          // Remove second duplicate chunk
          words.splice(i + n, n);
          modified = true;
          break;
        }
      }
      if (modified) break;
    }
  }

  return words.join(' ');
}

export function mergeWithOverlap(base: string, next: string): string {
  const b = base.trim();
  const n = next.trim();
  if (!b) return deduplicateRepeatedPhrases(n);
  if (!n) return deduplicateRepeatedPhrases(b);

  const bLower = b.toLowerCase().replace(/[.,!?;:]/g, '');
  const nLower = n.toLowerCase().replace(/[.,!?;:]/g, '');

  // If one already fully contains the other
  if (bLower === nLower) {
    return deduplicateRepeatedPhrases(b);
  }
  if (nLower.startsWith(bLower)) {
    return deduplicateRepeatedPhrases(n);
  }
  if (bLower.endsWith(nLower) || bLower.includes(nLower)) {
    return deduplicateRepeatedPhrases(b);
  }

  // Word-level boundary overlap detection (from longest to 1 word)
  const bWords = b.split(/\s+/).filter(Boolean);
  const nWords = n.split(/\s+/).filter(Boolean);
  const maxCheck = Math.min(bWords.length, nWords.length, 12);

  for (let len = maxCheck; len >= 1; len--) {
    const bSlice = bWords.slice(-len).map(w => w.toLowerCase().replace(/[.,!?;:]/g, '')).join(' ');
    const nSlice = nWords.slice(0, len).map(w => w.toLowerCase().replace(/[.,!?;:]/g, '')).join(' ');
    if (bSlice && bSlice === nSlice) {
      const remainingN = nWords.slice(len).join(' ');
      return deduplicateRepeatedPhrases(remainingN ? `${b} ${remainingN}` : b);
    }
  }

  return deduplicateRepeatedPhrases(`${b} ${n}`);
}

export function cleanTranscriptDuplicates(finalText: string, interimText: string): string {
  return mergeWithOverlap(finalText, interimText);
}

export function startSpeechRecognition(
  options: SpeechRecognitionOptions
): SpeechRecognitionSession {
  const SpeechRecognitionClass =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  if (!SpeechRecognitionClass) {
    if (options.onError) {
      options.onError('not_supported');
    }
    return {
      stop: () => {},
      abort: () => {},
    };
  }

  let recognition: any;
  try {
    recognition = new SpeechRecognitionClass();
  } catch (err: any) {
    if (options.onError) {
      options.onError(err?.message || 'init_failed');
    }
    return {
      stop: () => {},
      abort: () => {},
    };
  }

  const locale = LANGUAGE_SPEECH_MAP[options.language] || 'de-DE';
  recognition.lang = locale;
  recognition.continuous = options.continuous !== false;
  recognition.interimResults = options.interimResults !== false;
  recognition.maxAlternatives = 1;

  let isManualStop = false;
  let restartTimeout: any = null;

  const initAndStart = () => {
    try {
      recognition = new SpeechRecognitionClass();
    } catch (err: any) {
      if (options.onError) {
        options.onError(err?.message || 'init_failed');
      }
      return;
    }

    recognition.lang = locale;
    recognition.continuous = options.continuous !== false;
    recognition.interimResults = options.interimResults !== false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (options.onStart) options.onStart();
    };

    recognition.onresult = (event: any) => {
      let sessionFinal = '';
      let sessionInterim = '';

      const results = event.results;
      if (!results) return;

      for (let i = 0; i < results.length; ++i) {
        const item = results[i];
        const transcript = item[0]?.transcript || '';
        const trimmed = transcript.trim();
        if (!trimmed) continue;

        if (item.isFinal) {
          sessionFinal += (sessionFinal ? ' ' : '') + trimmed;
        } else {
          sessionInterim += (sessionInterim ? ' ' : '') + trimmed;
        }
      }

      let combined = sessionFinal;
      if (sessionInterim) {
        if (!combined) {
          combined = sessionInterim;
        } else {
          combined = mergeWithOverlap(combined, sessionInterim);
        }
      }

      const cleaned = deduplicateRepeatedPhrases(combined);
      if (cleaned.trim()) {
        options.onResult(cleaned.trim(), sessionInterim.length === 0);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Ignorable non-fatal events when user takes a natural pause
        return;
      }
      if (options.onError) {
        options.onError(event.error || 'speech_error');
      }
    };

    recognition.onend = () => {
      if (!isManualStop) {
        // Natural speech pause: auto-restart immediately to keep dictation fluid
        clearTimeout(restartTimeout);
        restartTimeout = setTimeout(() => {
          if (!isManualStop) {
            initAndStart();
          }
        }, 80);
        return;
      }

      if (options.onEnd) {
        options.onEnd();
      }
    };

    try {
      recognition.start();
    } catch (err: any) {
      // If already started or browser blocked, wait briefly and retry if still active
      if (!isManualStop) {
        clearTimeout(restartTimeout);
        restartTimeout = setTimeout(() => {
          if (!isManualStop) initAndStart();
        }, 200);
      }
    }
  };

  initAndStart();

  return {
    stop: () => {
      isManualStop = true;
      clearTimeout(restartTimeout);
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
      if (options.onEnd) options.onEnd();
    },
    abort: () => {
      isManualStop = true;
      clearTimeout(restartTimeout);
      try {
        recognition.abort();
      } catch (e) {
        // ignore
      }
      if (options.onEnd) options.onEnd();
    },
  };
}
