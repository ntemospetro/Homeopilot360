import { LanguageCode } from '../types';

export interface DetectedCountryInfo {
  countryCode: string;
  countryName: string;
  language: LanguageCode;
  source: 'timezone' | 'browser_locale' | 'ip_geolocation' | 'fallback';
}

const STORAGE_MANUAL_OVERRIDE_KEY = 'homoeo_saas_language_manual_override';
const STORAGE_DETECTED_COUNTRY_KEY = 'homoeo_saas_detected_country';

// Accurate country-to-language mapping for our 7 supported languages:
// de (Deutsch), en (English), es (Español), fr (Français), it (Italiano), el (Ελληνικά), ru (Русский)
const COUNTRY_TO_LANGUAGE_MAP: Record<string, { language: LanguageCode; name: string }> = {
  // Greek
  GR: { language: 'el', name: 'Ελλάδα (Greece)' },
  CY: { language: 'el', name: 'Κύπρος (Cyprus)' },

  // German
  DE: { language: 'de', name: 'Deutschland' },
  AT: { language: 'de', name: 'Österreich' },
  CH: { language: 'de', name: 'Schweiz' },
  LI: { language: 'de', name: 'Liechtenstein' },

  // French
  FR: { language: 'fr', name: 'France' },
  BE: { language: 'fr', name: 'Belgique' },
  MC: { language: 'fr', name: 'Monaco' },
  LU: { language: 'fr', name: 'Luxembourg' },

  // Spanish
  ES: { language: 'es', name: 'España' },
  MX: { language: 'es', name: 'México' },
  AR: { language: 'es', name: 'Argentina' },
  CO: { language: 'es', name: 'Colombia' },
  CL: { language: 'es', name: 'Chile' },
  PE: { language: 'es', name: 'Perú' },
  VE: { language: 'es', name: 'Venezuela' },
  EC: { language: 'es', name: 'Ecuador' },
  GT: { language: 'es', name: 'Guatemala' },
  CU: { language: 'es', name: 'Cuba' },
  BO: { language: 'es', name: 'Bolivia' },
  DO: { language: 'es', name: 'República Dominicana' },
  HN: { language: 'es', name: 'Honduras' },
  PY: { language: 'es', name: 'Paraguay' },
  SV: { language: 'es', name: 'El Salvador' },
  NI: { language: 'es', name: 'Nicaragua' },
  CR: { language: 'es', name: 'Costa Rica' },
  PA: { language: 'es', name: 'Panamá' },
  UY: { language: 'es', name: 'Uruguay' },

  // Italian
  IT: { language: 'it', name: 'Italia' },
  SM: { language: 'it', name: 'San Marino' },
  VA: { language: 'it', name: 'Vaticano' },

  // Russian
  RU: { language: 'ru', name: 'Россия (Russia)' },
  BY: { language: 'ru', name: 'Беларусь (Belarus)' },
  KZ: { language: 'ru', name: 'Казахстан (Kazakhstan)' },
  KG: { language: 'ru', name: 'Кыргызстан' },

  // English (default international)
  GB: { language: 'en', name: 'United Kingdom' },
  US: { language: 'en', name: 'United States' },
  CA: { language: 'en', name: 'Canada' },
  AU: { language: 'en', name: 'Australia' },
  NZ: { language: 'en', name: 'New Zealand' },
  IE: { language: 'en', name: 'Ireland' },
  ZA: { language: 'en', name: 'South Africa' },
  IN: { language: 'en', name: 'India' },
  SG: { language: 'en', name: 'Singapore' },
  MT: { language: 'en', name: 'Malta' },
};

// Immediate, zero-permission, synchronous timezone mapping
const TIMEZONE_TO_COUNTRY_MAP: Record<string, string> = {
  // Greece & Cyprus
  'Europe/Athens': 'GR',
  'Asia/Nicosia': 'CY',
  'Asia/Famagusta': 'CY',

  // Germany, Austria, Switzerland
  'Europe/Berlin': 'DE',
  'Europe/Busingen': 'DE',
  'Europe/Vienna': 'AT',
  'Europe/Zurich': 'CH',
  'Europe/Vaduz': 'LI',

  // France & Belgium
  'Europe/Paris': 'FR',
  'Europe/Brussels': 'BE',
  'Europe/Monaco': 'MC',
  'Europe/Luxembourg': 'LU',

  // Spain & Latin America
  'Europe/Madrid': 'ES',
  'Africa/Ceuta': 'ES',
  'Atlantic/Canary': 'ES',
  'America/Mexico_City': 'MX',
  'America/Cancun': 'MX',
  'America/Monterrey': 'MX',
  'America/Tijuana': 'MX',
  'America/Bogota': 'CO',
  'America/Argentina/Buenos_Aires': 'AR',
  'America/Argentina/Cordoba': 'AR',
  'America/Santiago': 'CL',
  'America/Lima': 'PE',
  'America/Caracas': 'VE',
  'America/Guayaquil': 'EC',

  // Italy
  'Europe/Rome': 'IT',
  'Europe/San_Marino': 'SM',
  'Europe/Vatican': 'VA',

  // Russia & CIS
  'Europe/Moscow': 'RU',
  'Europe/Kaliningrad': 'RU',
  'Europe/Samara': 'RU',
  'Asia/Yekaterinburg': 'RU',
  'Asia/Omsk': 'RU',
  'Asia/Novosibirsk': 'RU',
  'Asia/Krasnoyarsk': 'RU',
  'Asia/Irkutsk': 'RU',
  'Asia/Yakutsk': 'RU',
  'Asia/Vladivostok': 'RU',
  'Asia/Magadan': 'RU',
  'Asia/Kamchatka': 'RU',
  'Europe/Minsk': 'BY',
  'Asia/Almaty': 'KZ',
  'Asia/Qyzylorda': 'KZ',

  // English countries
  'Europe/London': 'GB',
  'Europe/Belfast': 'GB',
  'Europe/Dublin': 'IE',
  'America/New_York': 'US',
  'America/Detroit': 'US',
  'America/Kentucky/Louisville': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Phoenix': 'US',
  'America/Los_Angeles': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Montreal': 'CA',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU',
  'Pacific/Auckland': 'NZ',
};

/**
 * Returns instant synchronous detected language based on browser environment
 */
export function getInstantDetectedLanguage(): DetectedCountryInfo {
  try {
    // 1. Check Intl timezone
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && TIMEZONE_TO_COUNTRY_MAP[tz]) {
        const cCode = TIMEZONE_TO_COUNTRY_MAP[tz];
        const match = COUNTRY_TO_LANGUAGE_MAP[cCode];
        if (match) {
          return {
            countryCode: cCode,
            countryName: match.name,
            language: match.language,
            source: 'timezone',
          };
        }
      }
    }

    // 2. Check browser languages (e.g. "el-GR", "de-DE", "fr-FR")
    if (typeof navigator !== 'undefined') {
      const browserLangs = navigator.languages || [navigator.language];
      for (const rawLang of browserLangs) {
        if (!rawLang) continue;
        const parts = rawLang.split('-');
        const primaryCode = parts[0]?.toLowerCase();
        const countrySub = parts[1]?.toUpperCase();

        if (countrySub && COUNTRY_TO_LANGUAGE_MAP[countrySub]) {
          const match = COUNTRY_TO_LANGUAGE_MAP[countrySub];
          return {
            countryCode: countrySub,
            countryName: match.name,
            language: match.language,
            source: 'browser_locale',
          };
        }

        if (primaryCode === 'el') return { countryCode: 'GR', countryName: 'Ελλάδα', language: 'el', source: 'browser_locale' };
        if (primaryCode === 'de') return { countryCode: 'DE', countryName: 'Deutschland', language: 'de', source: 'browser_locale' };
        if (primaryCode === 'fr') return { countryCode: 'FR', countryName: 'France', language: 'fr', source: 'browser_locale' };
        if (primaryCode === 'es') return { countryCode: 'ES', countryName: 'España', language: 'es', source: 'browser_locale' };
        if (primaryCode === 'it') return { countryCode: 'IT', countryName: 'Italia', language: 'it', source: 'browser_locale' };
        if (primaryCode === 'ru') return { countryCode: 'RU', countryName: 'Россия', language: 'ru', source: 'browser_locale' };
        if (primaryCode === 'en') return { countryCode: 'US', countryName: 'English', language: 'en', source: 'browser_locale' };
      }
    }
  } catch {
    // ignore
  }

  return {
    countryCode: 'DE',
    countryName: 'Deutschland',
    language: 'de',
    source: 'fallback',
  };
}

/**
 * Asynchronously detects the user's country and language
 */
export async function detectUserCountryAndLanguage(): Promise<DetectedCountryInfo> {
  const cached = getCachedDetectedCountry();
  if (cached && cached.countryCode && cached.language) {
    return cached;
  }

  const instant = getInstantDetectedLanguage();
  try {
    localStorage.setItem(STORAGE_DETECTED_COUNTRY_KEY, JSON.stringify(instant));
  } catch {}
  return instant;
}

export function isUserManualLanguageSelected(): boolean {
  try {
    return localStorage.getItem(STORAGE_MANUAL_OVERRIDE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setUserManualLanguageSelected(isManual: boolean): void {
  try {
    if (isManual) {
      localStorage.setItem(STORAGE_MANUAL_OVERRIDE_KEY, 'true');
    } else {
      localStorage.removeItem(STORAGE_MANUAL_OVERRIDE_KEY);
    }
  } catch {}
}

export function getCachedDetectedCountry(): DetectedCountryInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_DETECTED_COUNTRY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}
