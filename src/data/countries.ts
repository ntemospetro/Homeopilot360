import { LanguageCode } from '../types';

export interface CountryItem {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  group?: 'DACH' | 'Europa' | 'Weltweit' | 'Sonstige';
}

export const COUNTRIES: CountryItem[] = [
  // DACH & Deutschsprachiger Raum
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪', dialCode: '+49', group: 'DACH' },
  { code: 'AT', name: 'Österreich', flag: '🇦🇹', dialCode: '+43', group: 'DACH' },
  { code: 'CH', name: 'Schweiz', flag: '🇨🇭', dialCode: '+41', group: 'DACH' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮', dialCode: '+423', group: 'DACH' },
  { code: 'LU', name: 'Luxemburg', flag: '🇱🇺', dialCode: '+352', group: 'DACH' },
  { code: 'IT-BZ', name: 'Italien (Südtirol)', flag: '🇮🇹', dialCode: '+39', group: 'DACH' },

  // Europa
  { code: 'FR', name: 'Frankreich', flag: '🇫🇷', dialCode: '+33', group: 'Europa' },
  { code: 'IT', name: 'Italien', flag: '🇮🇹', dialCode: '+39', group: 'Europa' },
  { code: 'ES', name: 'Spanien', flag: '🇪🇸', dialCode: '+34', group: 'Europa' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351', group: 'Europa' },
  { code: 'NL', name: 'Niederlande', flag: '🇳🇱', dialCode: '+31', group: 'Europa' },
  { code: 'BE', name: 'Belgien', flag: '🇧🇪', dialCode: '+32', group: 'Europa' },
  { code: 'GB', name: 'Großbritannien', flag: '🇬🇧', dialCode: '+44', group: 'Europa' },
  { code: 'IE', name: 'Irland', flag: '🇮🇪', dialCode: '+353', group: 'Europa' },
  { code: 'DK', name: 'Dänemark', flag: '🇩🇰', dialCode: '+45', group: 'Europa' },
  { code: 'SE', name: 'Schweden', flag: '🇸🇪', dialCode: '+46', group: 'Europa' },
  { code: 'NO', name: 'Norwegen', flag: '🇳🇴', dialCode: '+47', group: 'Europa' },
  { code: 'FI', name: 'Finnland', flag: '🇫🇮', dialCode: '+358', group: 'Europa' },
  { code: 'IS', name: 'Island', flag: '🇮🇸', dialCode: '+354', group: 'Europa' },
  { code: 'PL', name: 'Polen', flag: '🇵🇱', dialCode: '+48', group: 'Europa' },
  { code: 'CZ', name: 'Tschechien', flag: '🇨🇿', dialCode: '+420', group: 'Europa' },
  { code: 'SK', name: 'Slowakei', flag: '🇸🇰', dialCode: '+421', group: 'Europa' },
  { code: 'HU', name: 'Ungarn', flag: '🇭🇺', dialCode: '+36', group: 'Europa' },
  { code: 'GR', name: 'Griechenland', flag: '🇬🇷', dialCode: '+30', group: 'Europa' },
  { code: 'CY', name: 'Zypern', flag: '🇨🇾', dialCode: '+357', group: 'Europa' },
  { code: 'HR', name: 'Kroatien', flag: '🇭🇷', dialCode: '+385', group: 'Europa' },
  { code: 'SI', name: 'Slowenien', flag: '🇸🇮', dialCode: '+386', group: 'Europa' },
  { code: 'RO', name: 'Rumänien', flag: '🇷🇴', dialCode: '+40', group: 'Europa' },
  { code: 'BG', name: 'Bulgarien', flag: '🇧🇬', dialCode: '+359', group: 'Europa' },
  { code: 'RS', name: 'Serbien', flag: '🇷🇸', dialCode: '+381', group: 'Europa' },
  { code: 'BA', name: 'Bosnien und Herzegowina', flag: '🇧🇦', dialCode: '+387', group: 'Europa' },
  { code: 'MK', name: 'Nordmazedonien', flag: '🇲🇰', dialCode: '+389', group: 'Europa' },
  { code: 'AL', name: 'Albanien', flag: '🇦🇱', dialCode: '+355', group: 'Europa' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪', dialCode: '+382', group: 'Europa' },
  { code: 'XK', name: 'Kosovo', flag: '🇽🇰', dialCode: '+383', group: 'Europa' },
  { code: 'EE', name: 'Estland', flag: '🇪🇪', dialCode: '+372', group: 'Europa' },
  { code: 'LV', name: 'Lettland', flag: '🇱🇻', dialCode: '+371', group: 'Europa' },
  { code: 'LT', name: 'Litauen', flag: '🇱🇹', dialCode: '+370', group: 'Europa' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', dialCode: '+380', group: 'Europa' },
  { code: 'RU', name: 'Russland', flag: '🇷🇺', dialCode: '+7', group: 'Europa' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', dialCode: '+356', group: 'Europa' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨', dialCode: '+377', group: 'Europa' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩', dialCode: '+376', group: 'Europa' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲', dialCode: '+378', group: 'Europa' },
  { code: 'VA', name: 'Vatikanstadt', flag: '🇻🇦', dialCode: '+379', group: 'Europa' },
  { code: 'TR', name: 'Türkei', flag: '🇹🇷', dialCode: '+90', group: 'Europa' },

  // Weltweit
  { code: 'US', name: 'USA', flag: '🇺🇸', dialCode: '+1', group: 'Weltweit' },
  { code: 'CA', name: 'Kanada', flag: '🇨🇦', dialCode: '+1', group: 'Weltweit' },
  { code: 'AU', name: 'Australien', flag: '🇦🇺', dialCode: '+61', group: 'Weltweit' },
  { code: 'NZ', name: 'Neuseeland', flag: '🇳🇿', dialCode: '+64', group: 'Weltweit' },
  { code: 'IN', name: 'Indien', flag: '🇮🇳', dialCode: '+91', group: 'Weltweit' },
  { code: 'BR', name: 'Brasilien', flag: '🇧🇷', dialCode: '+55', group: 'Weltweit' },
  { code: 'MX', name: 'Mexiko', flag: '🇲🇽', dialCode: '+52', group: 'Weltweit' },
  { code: 'AR', name: 'Argentinien', flag: '🇦🇷', dialCode: '+54', group: 'Weltweit' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56', group: 'Weltweit' },
  { code: 'CO', name: 'Kolumbien', flag: '🇨🇴', dialCode: '+57', group: 'Weltweit' },
  { code: 'ZA', name: 'Südafrika', flag: '🇿🇦', dialCode: '+27', group: 'Weltweit' },
  { code: 'EG', name: 'Ägypten', flag: '🇪🇬', dialCode: '+20', group: 'Weltweit' },
  { code: 'MA', name: 'Marokko', flag: '🇲🇦', dialCode: '+212', group: 'Weltweit' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', dialCode: '+972', group: 'Weltweit' },
  { code: 'AE', name: 'Vereinigte Arabische Emirate', flag: '🇦🇪', dialCode: '+971', group: 'Weltweit' },
  { code: 'SA', name: 'Saudi-Arabien', flag: '🇸🇦', dialCode: '+966', group: 'Weltweit' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81', group: 'Weltweit' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86', group: 'Weltweit' },
  { code: 'KR', name: 'Südkorea', flag: '🇰🇷', dialCode: '+82', group: 'Weltweit' },
  { code: 'SG', name: 'Singapur', flag: '🇸🇬', dialCode: '+65', group: 'Weltweit' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66', group: 'Weltweit' },

  // Sonstige
  { code: 'OTHER', name: 'Anderes Land', flag: '🌐', dialCode: '', group: 'Sonstige' }
];

const LOCALIZED_COUNTRY_NAMES: Record<string, Partial<Record<LanguageCode, string>>> = {
  DE: { en: 'Germany', fr: 'Allemagne', es: 'Alemania', it: 'Germania', el: 'Γερμανία', ru: 'Германия' },
  AT: { en: 'Austria', fr: 'Autriche', es: 'Austria', it: 'Austria', el: 'Αυστρία', ru: 'Австрия' },
  CH: { en: 'Switzerland', fr: 'Suisse', es: 'Suiza', it: 'Svizzera', el: 'Ελβετία', ru: 'Швейцария' },
  LI: { en: 'Liechtenstein', fr: 'Liechtenstein', es: 'Liechtenstein', it: 'Liechtenstein', el: 'Λιχτενστάιν', ru: 'Лихтенштейн' },
  LU: { en: 'Luxembourg', fr: 'Luxembourg', es: 'Luxemburgo', it: 'Lussemburgo', el: 'Λουξεμβούργο', ru: 'Люксембург' },
  'IT-BZ': { en: 'Italy (South Tyrol)', fr: 'Italie (Tyrol du Sud)', es: 'Italia (Tirol del Sur)', it: 'Italia (Alto Adige)', el: 'Ιταλία (Νότιο Τιρόλο)', ru: 'Италия (Южный Тироль)' },
  FR: { en: 'France', fr: 'France', es: 'Francia', it: 'Francia', el: 'Γαλλία', ru: 'Франция' },
  IT: { en: 'Italy', fr: 'Italie', es: 'Italia', it: 'Italia', el: 'Ιταλία', ru: 'Италия' },
  ES: { en: 'Spain', fr: 'Espagne', es: 'España', it: 'Spagna', el: 'Ισπανία', ru: 'Испания' },
  PT: { en: 'Portugal', fr: 'Portugal', es: 'Portugal', it: 'Portogallo', el: 'Πορτογαλία', ru: 'Португалия' },
  NL: { en: 'Netherlands', fr: 'Pays-Bas', es: 'Países Bajos', it: 'Paesi Bassi', el: 'Κάτω Χώρες', ru: 'Нидерланды' },
  BE: { en: 'Belgium', fr: 'Belgique', es: 'Bélgica', it: 'Belgio', el: 'Βέλγιο', ru: 'Бельгия' },
  GB: { en: 'United Kingdom', fr: 'Royaume-Uni', es: 'Reino Unido', it: 'Regno Unito', el: 'Ηνωμένο Βασίλειο', ru: 'Великобритания' },
  IE: { en: 'Ireland', fr: 'Irlande', es: 'Irlanda', it: 'Irlanda', el: 'Ιρλανδία', ru: 'Ирландия' },
  DK: { en: 'Denmark', fr: 'Danemark', es: 'Dinamarca', it: 'Danimarca', el: 'Δανία', ru: 'Дания' },
  SE: { en: 'Sweden', fr: 'Suède', es: 'Suecia', it: 'Svezia', el: 'Σουηδία', ru: 'Швеция' },
  NO: { en: 'Norway', fr: 'Norvège', es: 'Noruega', it: 'Norvegia', el: 'Νορβηγία', ru: 'Норвегия' },
  FI: { en: 'Finland', fr: 'Finlande', es: 'Finlandia', it: 'Finlandia', el: 'Φινλανδία', ru: 'Финляндия' },
  IS: { en: 'Iceland', fr: 'Islande', es: 'Islandia', it: 'Islanda', el: 'Ισλανδία', ru: 'Исландия' },
  PL: { en: 'Poland', fr: 'Pologne', es: 'Polonia', it: 'Polonia', el: 'Πολωνία', ru: 'Польша' },
  CZ: { en: 'Czech Republic', fr: 'République tchèque', es: 'República Checa', it: 'Repubblica Ceca', el: 'Τσεχία', ru: 'Чехия' },
  SK: { en: 'Slovakia', fr: 'Slovaquie', es: 'Eslovaquia', it: 'Slovacchia', el: 'Σλοβακία', ru: 'Словакия' },
  HU: { en: 'Hungary', fr: 'Hongrie', es: 'Hungría', it: 'Ungheria', el: 'Ουγγαρία', ru: 'Венгрия' },
  GR: { en: 'Greece', fr: 'Grèce', es: 'Grecia', it: 'Grecia', el: 'Ελλάδα', ru: 'Греция' },
  CY: { en: 'Cyprus', fr: 'Chypre', es: 'Chipre', it: 'Cipro', el: 'Κύπρος', ru: 'Кипр' },
  HR: { en: 'Croatia', fr: 'Croatie', es: 'Croacia', it: 'Croazia', el: 'Κροατία', ru: 'Хорватия' },
  SI: { en: 'Slovenia', fr: 'Slovénie', es: 'Eslovenia', it: 'Slovenia', el: 'Σλοβενία', ru: 'Словения' },
  RO: { en: 'Romania', fr: 'Roumanie', es: 'Rumania', it: 'Romania', el: 'Ρουμανία', ru: 'Румыния' },
  BG: { en: 'Bulgaria', fr: 'Bulgarie', es: 'Bulgaria', it: 'Bulgaria', el: 'Βουλγαρία', ru: 'Болгария' },
  RS: { en: 'Serbia', fr: 'Serbie', es: 'Serbia', it: 'Serbia', el: 'Σερβία', ru: 'Сербия' },
  BA: { en: 'Bosnia and Herzegovina', fr: 'Bosnie-Herzégovine', es: 'Bosnia y Herzegovina', it: 'Bosnia ed Erzegovina', el: 'Βοσνία και Ερζεγοβίνη', ru: 'Босния и Герцеговина' },
  MK: { en: 'North Macedonia', fr: 'Macédoine du Nord', es: 'Macedonia del Norte', it: 'Macedonia del Nord', el: 'Βόρεια Μακεδονία', ru: 'Северная Македония' },
  AL: { en: 'Albania', fr: 'Albanie', es: 'Albania', it: 'Albania', el: 'Αλβανία', ru: 'Албания' },
  ME: { en: 'Montenegro', fr: 'Monténégro', es: 'Montenegro', it: 'Montenegro', el: 'Μαυροβούνιο', ru: 'Черногория' },
  XK: { en: 'Kosovo', fr: 'Kosovo', es: 'Kosovo', it: 'Kosovo', el: 'Κόσοβο', ru: 'Косово' },
  EE: { en: 'Estonia', fr: 'Estonie', es: 'Estonia', it: 'Estonia', el: 'Εσθονία', ru: 'Эстония' },
  LV: { en: 'Latvia', fr: 'Lettonie', es: 'Letonia', it: 'Lettonia', el: 'Λετονία', ru: 'Латвия' },
  LT: { en: 'Lithuania', fr: 'Lituanie', es: 'Lituania', it: 'Lituania', el: 'Λιθουανία', ru: 'Литва' },
  UA: { en: 'Ukraine', fr: 'Ukraine', es: 'Ucrania', it: 'Ucraina', el: 'Ουκρανία', ru: 'Украина' },
  RU: { en: 'Russia', fr: 'Russie', es: 'Rusia', it: 'Russia', el: 'Ρωσία', ru: 'Россия' },
  MT: { en: 'Malta', fr: 'Malte', es: 'Malta', it: 'Malta', el: 'Μάλτα', ru: 'Мальта' },
  MC: { en: 'Monaco', fr: 'Monaco', es: 'Mónaco', it: 'Monaco', el: 'Μονακό', ru: 'Монако' },
  AD: { en: 'Andorra', fr: 'Andorre', es: 'Andorra', it: 'Andorra', el: 'Ανδόρρα', ru: 'Андорра' },
  SM: { en: 'San Marino', fr: 'Saint-Marin', es: 'San Marino', it: 'San Marino', el: 'Άγιος Μαρίνος', ru: 'Сан-Марино' },
  VA: { en: 'Vatican City', fr: 'Cité du Vatican', es: 'Ciudad del Vaticano', it: 'Città del Vaticano', el: 'Βατικανό', ru: 'Ватикан' },
  TR: { en: 'Turkey', fr: 'Turquie', es: 'Turquía', it: 'Turchia', el: 'Τουρκία', ru: 'Турция' },
  US: { en: 'USA', fr: 'États-Unis', es: 'EE. UU.', it: 'Stati Uniti', el: 'ΗΠΑ', ru: 'США' },
  CA: { en: 'Canada', fr: 'Canada', es: 'Canadá', it: 'Canada', el: 'Καναδάς', ru: 'Канада' },
  AU: { en: 'Australia', fr: 'Australie', es: 'Australia', it: 'Australia', el: 'Αυστραλία', ru: 'Австралия' },
  NZ: { en: 'New Zealand', fr: 'Nouvelle-Zélande', es: 'Nueva Zelanda', it: 'Nuova Zelanda', el: 'Νέα Ζηλανδία', ru: 'Новая Зеландия' },
  IN: { en: 'India', fr: 'Inde', es: 'India', it: 'India', el: 'Ινδία', ru: 'Индия' },
  BR: { en: 'Brazil', fr: 'Brésil', es: 'Brasil', it: 'Brasile', el: 'Βραζιλία', ru: 'Бразилия' },
  MX: { en: 'Mexico', fr: 'Mexique', es: 'México', it: 'Messico', el: 'Μεξικό', ru: 'Мексика' },
  AR: { en: 'Argentina', fr: 'Argentine', es: 'Argentina', it: 'Argentina', el: 'Αργεντινή', ru: 'Аргентина' },
  CL: { en: 'Chile', fr: 'Chili', es: 'Chile', it: 'Cile', el: 'Χιλή', ru: 'Чили' },
  CO: { en: 'Colombia', fr: 'Colombie', es: 'Colombia', it: 'Colombia', el: 'Κολομβία', ru: 'Колумбия' },
  ZA: { en: 'South Africa', fr: 'Afrique du Sud', es: 'Sudáfrica', it: 'Sudafrica', el: 'Νότια Αφρική', ru: 'Южная Африка' },
  EG: { en: 'Egypt', fr: 'Égypte', es: 'Egipto', it: 'Egitto', el: 'Αίγυπτος', ru: 'Египет' },
  MA: { en: 'Morocco', fr: 'Maroc', es: 'Marruecos', it: 'Marocco', el: 'Μαρόκο', ru: 'Марокко' },
  IL: { en: 'Israel', fr: 'Israël', es: 'Israel', it: 'Israele', el: 'Ισραήλ', ru: 'Израиль' },
  AE: { en: 'United Arab Emirates', fr: 'Émirats arabes unis', es: 'Emiratos Árabes Unidos', it: 'Emirati Arabi Uniti', el: 'Ηνωμένα Αραβικά Εμιράτα', ru: 'ОАЭ' },
  SA: { en: 'Saudi Arabia', fr: 'Arabie saoudite', es: 'Arabia Saudita', it: 'Arabia Saudita', el: 'Σαουδική Αραβία', ru: 'Саудовская Аравия' },
  JP: { en: 'Japan', fr: 'Japon', es: 'Japón', it: 'Giappone', el: 'Ιαπωνία', ru: 'Япония' },
  CN: { en: 'China', fr: 'Chine', es: 'China', it: 'Cina', el: 'Κίνα', ru: 'Китай' },
  KR: { en: 'South Korea', fr: 'Corée du Sud', es: 'Corea del Sur', it: 'Corea del Sud', el: 'Νότια Κορέα', ru: 'Южная Корея' },
  SG: { en: 'Singapore', fr: 'Singapour', es: 'Singapur', it: 'Singapore', el: 'Σιγκαπούρη', ru: 'Сингапур' },
  TH: { en: 'Thailand', fr: 'Thaïlande', es: 'Tailandia', it: 'Thailandia', el: 'Ταϊλάνδη', ru: 'Таиланд' },
  OTHER: { en: 'Other Country', fr: 'Autre pays', es: 'Otro país', it: 'Altro paese', el: 'Άλλη χώρα', ru: 'Другая страна' }
};

export function getLocalizedCountryName(code: string, lang: LanguageCode = 'de'): string {
  if (lang === 'de') {
    const item = COUNTRIES.find(c => c.code === code);
    return item ? item.name : code;
  }
  const translationsForCode = LOCALIZED_COUNTRY_NAMES[code];
  if (translationsForCode && translationsForCode[lang]) {
    return translationsForCode[lang]!;
  }
  const item = COUNTRIES.find(c => c.code === code);
  return item ? item.name : code;
}

export function getLocalizedCountries(lang: LanguageCode = 'de'): (CountryItem & { displayName: string })[] {
  return COUNTRIES.map(c => ({
    ...c,
    displayName: getLocalizedCountryName(c.code, lang)
  }));
}

export function getCountryFlag(countryNameOrCode?: string): string {
  if (!countryNameOrCode) return '🌐';
  const query = countryNameOrCode.trim().toLowerCase();
  
  const found = COUNTRIES.find(
    c => c.name.toLowerCase() === query || 
         c.code.toLowerCase() === query ||
         query.includes(c.name.toLowerCase()) ||
         c.name.toLowerCase().includes(query)
  );

  return found ? found.flag : '🌐';
}

export function getCountryDialCode(countryNameOrCode?: string): string {
  if (!countryNameOrCode) return '+49';
  const query = countryNameOrCode.trim().toLowerCase();
  
  const found = COUNTRIES.find(
    c => c.name.toLowerCase() === query || 
         c.code.toLowerCase() === query
  );

  return found ? found.dialCode : '';
}

export function formatCountryWithFlag(countryName?: string): string {
  if (!countryName) return '🌐 Unbekannt';
  const flag = getCountryFlag(countryName);
  return `${flag} ${countryName}`;
}

export function getDefaultCountryForLanguage(lang: LanguageCode = 'de'): string {
  switch (lang) {
    case 'de':
      return 'Deutschland';
    case 'en':
      return 'Großbritannien';
    case 'fr':
      return 'Frankreich';
    case 'it':
      return 'Italien';
    case 'es':
      return 'Spanien';
    case 'el':
      return 'Griechenland';
    case 'ru':
      return 'Russland';
    default:
      return 'Deutschland';
  }
}
