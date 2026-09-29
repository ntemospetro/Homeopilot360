import { describe, it } from 'node:test';
import assert from 'node:assert';
import { de } from '../src/i18n/locales/de.ts';
import { en } from '../src/i18n/locales/en.ts';
import { es } from '../src/i18n/locales/es.ts';
import { fr } from '../src/i18n/locales/fr.ts';
import { it as itLocale } from '../src/i18n/locales/it.ts';
import { el } from '../src/i18n/locales/el.ts';
import { ru } from '../src/i18n/locales/ru.ts';

describe('i18n 7-Sprachen Vollständigkeits- und Darstellungsprüfung', () => {
  const deKeys = Object.keys(de);
  const locales = { en, es, fr, it: itLocale, el, ru };

  it('1. Referenz DE besitzt über 4.000 lokalisierte UI-Schlüssel', () => {
    assert.ok(deKeys.length >= 4000, `DE keys (${deKeys.length}) must be at least 4000`);
  });

  for (const [lang, dict] of Object.entries(locales)) {
    it(`2. Sprache ${lang.toUpperCase()}: Keine fehlenden Schlüssel gegenüber DE`, () => {
      const currentKeys = new Set(Object.keys(dict));
      const missing = deKeys.filter(k => !currentKeys.has(k));
      assert.equal(missing.length, 0, `Sprache ${lang} hat ${missing.length} fehlende Schlüssel: ${missing.slice(0, 5).join(', ')}`);
    });

    it(`3. Sprache ${lang.toUpperCase()}: Keine leeren Übersetzungswerte`, () => {
      const empty = Object.entries(dict).filter(([_, v]) => !v || (v as string).trim() === '');
      assert.equal(empty.length, 0, `Sprache ${lang} enthält leere Texte in: ${empty.map(e => e[0]).slice(0, 5).join(', ')}`);
    });
  }

  it('4. Unicode- und Zeichensatz-Validierung für Griechisch (EL) und Russisch (RU)', () => {
    // Griechisch
    const greekRegex = /[\u0370-\u03FF]/;
    const greekCount = Object.values(el).filter(v => greekRegex.test(v as string)).length;
    assert.ok(greekCount > 2000, `Griechisch muss mindestens 2000 typische Zeichen aufweisen (gefunden: ${greekCount})`);

    // Russisch (Kyrillisch)
    const cyrillicRegex = /[\u0400-\u04FF]/;
    const cyrillicCount = Object.values(ru).filter(v => cyrillicRegex.test(v as string)).length;
    assert.ok(cyrillicCount > 2000, `Russisch muss mindestens 2000 kyrillische Zeichen aufweisen (gefunden: ${cyrillicCount})`);
  });
});
