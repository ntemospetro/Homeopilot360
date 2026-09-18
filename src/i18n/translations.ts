import { LanguageCode, LanguageOption } from '../types';
import { de } from './locales/de';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { it } from './locales/it';
import { el } from './locales/el';
import { ru } from './locales/ru';

export const LANGUAGES: LanguageOption[] = [
  { code: 'de', label: 'Deutsch', nativeName: 'Deutsch', englishName: 'German', flag: '🇩🇪' },
  { code: 'en', label: 'Englisch', nativeName: 'English', englishName: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Französisch', nativeName: 'Français', englishName: 'French', flag: '🇫🇷' },
  { code: 'el', label: 'Griechisch', nativeName: 'Ελληνικά', englishName: 'Greek', flag: '🇬🇷' },
  { code: 'it', label: 'Italienisch', nativeName: 'Italiano', englishName: 'Italian', flag: '🇮🇹' },
  { code: 'ru', label: 'Russisch', nativeName: 'Русский', englishName: 'Russian', flag: '🇷🇺' },
  { code: 'es', label: 'Spanisch', nativeName: 'Español', englishName: 'Spanish', flag: '🇪🇸' },
];

export const translations = {
  de,
  en,
  fr,
  el,
  it,
  ru,
  es,
};

export type TranslationKey = keyof typeof de;

export function translateText(
  lang: LanguageCode,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const langDict = translations[lang] || translations.de;
  let template = (langDict as Record<string, string>)[key] || (translations.de as Record<string, string>)[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }

  return template;
}
