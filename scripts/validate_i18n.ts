import { de } from '../src/i18n/locales/de';
import { en } from '../src/i18n/locales/en';
import { es } from '../src/i18n/locales/es';
import { fr } from '../src/i18n/locales/fr';
import { it } from '../src/i18n/locales/it';
import { el } from '../src/i18n/locales/el';
import { ru } from '../src/i18n/locales/ru';

interface LocaleAudit {
  lang: string;
  totalKeys: number;
  missingKeys: string[];
  extraKeys: string[];
  emptyValues: string[];
  untranslatedVsGerman: string[];
  encodingCheck: {
    passed: boolean;
    sampleChars: string[];
    sampleSnippet: string;
  };
}

const locales: Record<string, Record<string, string>> = {
  de: de as Record<string, string>,
  en: en as Record<string, string>,
  es: es as Record<string, string>,
  fr: fr as Record<string, string>,
  it: it as Record<string, string>,
  el: el as Record<string, string>,
  ru: ru as Record<string, string>,
};

const deKeys = Object.keys(de);
console.log(`[I18N_AUDIT] Referenz-Sprache: DE mit ${deKeys.length} Schlüsseln.`);

// Whitelist of universal technical terms or short tokens that can legitimately be identical across languages
const UNIVERSAL_TOKENS = new Set([
  'OK', 'Email', 'E-Mail', 'ID', 'UUID', 'JSON', 'CSV', 'PDF', 'Stripe', 'Kent', 'Hahnemann',
  'Organon', 'Boericke', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13',
  'EUR', 'USD', 'API', 'URL', 'Hostinger', 'SMTP', 'HTML', 'CSS', 'App', 'AI', 'KI', 'v1', 'v2', 'FAQ'
]);

const results: Record<string, LocaleAudit> = {};

for (const [lang, dict] of Object.entries(locales)) {
  if (lang === 'de') continue;

  const currentKeys = new Set(Object.keys(dict));
  const missing = deKeys.filter(k => !currentKeys.has(k));
  const extra = Object.keys(dict).filter(k => !deKeys.includes(k));
  const empty = Object.entries(dict).filter(([k, v]) => !v || v.trim() === '').map(([k]) => k);

  const untranslated: string[] = [];
  for (const k of deKeys) {
    if (currentKeys.has(k)) {
      const deVal = de[k as keyof typeof de]?.trim();
      const val = dict[k]?.trim();
      if (deVal && val && deVal === val && deVal.length > 5 && !UNIVERSAL_TOKENS.has(deVal)) {
        untranslated.push(`${k} ("${val}")`);
      }
    }
  }

  // Encoding & alphabet verification
  let encodingPassed = true;
  const sampleChars: string[] = [];
  let sampleSnippet = '';

  if (lang === 'el') {
    // Greek Unicode range \u0370-\u03FF
    const greekRegex = /[\u0370-\u03FF]/;
    const greekMatches = Object.values(dict).filter(v => greekRegex.test(v));
    encodingPassed = greekMatches.length > 100;
    sampleChars.push('α', 'β', 'γ', 'Ω', 'θ', 'Ψ');
    sampleSnippet = dict['saveChanges'] || dict['approve'] || greekMatches[0] || '';
  } else if (lang === 'ru') {
    // Cyrillic range \u0400-\u04FF
    const cyrillicRegex = /[\u0400-\u04FF]/;
    const cyrillicMatches = Object.values(dict).filter(v => cyrillicRegex.test(v));
    encodingPassed = cyrillicMatches.length > 100;
    sampleChars.push('ж', 'щ', 'ы', 'ю', 'я', 'Б');
    sampleSnippet = dict['saveChanges'] || dict['approve'] || cyrillicMatches[0] || '';
  } else if (lang === 'es') {
    const esMatches = Object.values(dict).filter(v => /[áéíóúüñ¿¡]/i.test(v));
    encodingPassed = esMatches.length > 20;
    sampleChars.push('á', 'é', 'í', 'ó', 'ú', 'ñ', '¿', '¡');
    sampleSnippet = dict['saveChanges'] || dict['wizardDiscardDesc'] || esMatches[0] || '';
  } else if (lang === 'fr') {
    const frMatches = Object.values(dict).filter(v => /[àâéèêëîïôùûüçœæ]/i.test(v));
    encodingPassed = frMatches.length > 20;
    sampleChars.push('é', 'è', 'ê', 'à', 'ç', 'ù');
    sampleSnippet = dict['saveChanges'] || dict['wizardDiscardDesc'] || frMatches[0] || '';
  } else if (lang === 'it') {
    const itMatches = Object.values(dict).filter(v => /[àèéìíîòóùú]/i.test(v));
    encodingPassed = itMatches.length > 10;
    sampleChars.push('à', 'è', 'é', 'ì', 'ò', 'ù');
    sampleSnippet = dict['saveChanges'] || dict['wizardDiscardDesc'] || itMatches[0] || '';
  } else if (lang === 'en') {
    encodingPassed = dict['saveChanges'] === 'Save Changes' || dict['saveChanges']?.toLowerCase().includes('save');
    sampleChars.push('A-Z', 'a-z');
    sampleSnippet = dict['saveChanges'] || '';
  }

  results[lang] = {
    lang,
    totalKeys: Object.keys(dict).length,
    missingKeys: missing,
    extraKeys: extra,
    emptyValues: empty,
    untranslatedVsGerman: untranslated,
    encodingCheck: {
      passed: encodingPassed,
      sampleChars,
      sampleSnippet
    }
  };
}

console.log('================================================================');
console.log('              I18N 7-SPRACHEN QUALITÄTS-AUDIT                   ');
console.log('================================================================');
console.log(`Referenz DE Keys: ${deKeys.length}\n`);

for (const [lang, data] of Object.entries(results)) {
  console.log(`[${lang.toUpperCase()}]`);
  console.log(`  - Vorhandene Keys:     ${data.totalKeys} / ${deKeys.length}`);
  console.log(`  - Fehlende Keys:       ${data.missingKeys.length}`);
  if (data.missingKeys.length > 0) {
    console.log(`    Beispiele fehlend:   ${data.missingKeys.slice(0, 8).join(', ')}...`);
  }
  console.log(`  - Leere Werte:         ${data.emptyValues.length}`);
  console.log(`  - Noch auf Deutsch:    ${data.untranslatedVsGerman.length} Texte`);
  if (data.untranslatedVsGerman.length > 0) {
    console.log(`    Beispiele unübersetzt: ${data.untranslatedVsGerman.slice(0, 4).join(', ')}...`);
  }
  console.log(`  - Kodierung / Zeichensatz: ${data.encodingCheck.passed ? 'BESTANDEN' : 'FEHLER'}`);
  console.log(`    Beispielzeichen:     ${data.encodingCheck.sampleChars.join(' ')}`);
  console.log(`    Beispieltext:        "${data.encodingCheck.sampleSnippet}"`);
  console.log('----------------------------------------------------------------');
}

