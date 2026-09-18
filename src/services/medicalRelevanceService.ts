/**
 * Medical Relevance Filter Service
 * 
 * Evaluates spoken statements to ensure only medically and health-relevant
 * information is accepted into anamnesis and clinical findings.
 */

import { getActiveTherapist } from './storage';

export interface MedicalRelevanceResult {
  isRelevant: boolean;
  reason?: string;
}

export async function checkMedicalRelevance(
  text: string,
  language: string = 'de'
): Promise<MedicalRelevanceResult> {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return { isRelevant: false, reason: 'empty' };
  }

  try {
    const activeTherapist = getActiveTherapist();
    const response = await fetch('/api/check-medical-relevance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: trimmed,
        language,
        therapistId: activeTherapist?.id || 'th-101',
        therapistName: activeTherapist ? `${activeTherapist.vorname} ${activeTherapist.nachname}` : undefined,
        therapistEmail: activeTherapist?.email
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        isRelevant: Boolean(data.isRelevant),
        reason: data.reason,
      };
    }
  } catch (err) {
    console.warn('Network error while checking medical relevance, using client fallback:', err);
  }

  // Client-side heuristic fallback if server is unreachable
  const lower = trimmed.toLowerCase();
  const obviousNonMedical = [
    /^test(\s+\d+|\s+eins|\s+zwei|\s+drei)?$/i,
    /^(hallo|hi|guten tag|guten morgen|servus|moin|ciao|hey)(\s+(wie gehts|wie geht es dir|wie geht's))?$/i,
    /^(geht das|funktioniert das|h[öo]rst du mich|kannst du mich h[öo]ren|mikrofon test|test test)$/i,
    /^(1\s*2\s*3|eins\s*zwei\s*drei|one\s*two\s*three)$/i,
    /^(blabla|bla bla|lalala|asdf)$/i,
  ];

  if (obviousNonMedical.some(p => p.test(lower))) {
    return { isRelevant: false, reason: 'client_heuristic_non_medical' };
  }

  return { isRelevant: true, reason: 'client_fallback_accepted' };
}
