import fs from 'fs';
import path from 'path';

export interface RawRemedy {
  id: string;
  latinName: string;
  categoryKey: 'plant' | 'mineral' | 'animal' | 'nosode' | 'acid' | 'other';
  isPolychrest?: boolean;
  importanceTier: 1 | 2 | 3;
  de: {
    commonName: string;
    origin: string;
    essence: string;
    mainIndications: string[];
    keynotes: string[];
    mindEmotional: string;
    modalitiesBetter: string[];
    modalitiesWorse: string[];
    potenciesAndDosage: string;
    defaultTagesdosis?: string;
    sphereOfAction: string[];
    differentialRemedies: string[];
    searchKeywords: string[];
  };
  en: {
    commonName: string;
    origin: string;
    essence: string;
    mainIndications: string[];
    keynotes: string[];
    mindEmotional: string;
    modalitiesBetter: string[];
    modalitiesWorse: string[];
    potenciesAndDosage: string;
    defaultTagesdosis?: string;
    sphereOfAction: string[];
    differentialRemedies: string[];
    searchKeywords: string[];
  };
  es?: {
    commonName: string;
    origin?: string;
    essence?: string;
    mainIndications?: string[];
    keynotes?: string[];
    mindEmotional?: string;
    modalitiesBetter?: string[];
    modalitiesWorse?: string[];
    potenciesAndDosage?: string;
    defaultTagesdosis?: string;
    sphereOfAction?: string[];
    differentialRemedies?: string[];
    searchKeywords?: string[];
  };
  fr?: {
    commonName: string;
    origin?: string;
    essence?: string;
    mainIndications?: string[];
    keynotes?: string[];
    mindEmotional?: string;
    modalitiesBetter?: string[];
    modalitiesWorse?: string[];
    potenciesAndDosage?: string;
    defaultTagesdosis?: string;
    sphereOfAction?: string[];
    differentialRemedies?: string[];
    searchKeywords?: string[];
  };
  el?: {
    commonName: string;
    origin?: string;
    essence?: string;
    mainIndications?: string[];
    keynotes?: string[];
    mindEmotional?: string;
    modalitiesBetter?: string[];
    modalitiesWorse?: string[];
    potenciesAndDosage?: string;
    defaultTagesdosis?: string;
    sphereOfAction?: string[];
    differentialRemedies?: string[];
    searchKeywords?: string[];
  };
  it?: {
    commonName: string;
    origin?: string;
    essence?: string;
    mainIndications?: string[];
    keynotes?: string[];
    mindEmotional?: string;
    modalitiesBetter?: string[];
    modalitiesWorse?: string[];
    potenciesAndDosage?: string;
    defaultTagesdosis?: string;
    sphereOfAction?: string[];
    differentialRemedies?: string[];
    searchKeywords?: string[];
  };
  ru?: {
    commonName: string;
    origin?: string;
    essence?: string;
    mainIndications?: string[];
    keynotes?: string[];
    mindEmotional?: string;
    modalitiesBetter?: string[];
    modalitiesWorse?: string[];
    potenciesAndDosage?: string;
    defaultTagesdosis?: string;
    sphereOfAction?: string[];
    differentialRemedies?: string[];
    searchKeywords?: string[];
  };
}

const CATEGORY_MAP: Record<string, Record<string, string>> = {
  plant: { de: 'Pflanzlich', en: 'Plant', es: 'Vegetal', fr: 'Végétal', el: 'Φυτικό', it: 'Vegetale', ru: 'Растительный' },
  mineral: { de: 'Mineralisch', en: 'Mineral', es: 'Mineral', fr: 'Minéral', el: 'Ορυκτό', it: 'Minerale', ru: 'Минеральный' },
  animal: { de: 'Tierisch', en: 'Animal', es: 'Animal', fr: 'Animal', el: 'Ζωικό', it: 'Animale', ru: 'Животный' },
  acid: { de: 'Säure', en: 'Acid', es: 'Ácido', fr: 'Acide', el: 'Οξύ', it: 'Acido', ru: 'Кислота' },
  nosode: { de: 'Nosode', en: 'Nosode', es: 'Nosode', fr: 'Nosode', el: 'Νοσώδες', it: 'Nosode', ru: 'Нозод' },
  other: { de: 'Sonstiges', en: 'Other', es: 'Otro', fr: 'Autre', el: 'Άλλο', it: 'Altro', ru: 'Другое' }
};

// Clinical phrase translation helpers
function translateText(text: string, lang: 'es' | 'fr' | 'it' | 'el' | 'ru'): string {
  if (!text) return text;
  
  // Generic dosage pattern replacements
  if (lang === 'fr') {
    return text
      .replace(/acute \(every 1-2h 5 globules\)/g, 'aigu (toutes les 1-2h 5 granules)')
      .replace(/acute \(every 1-2 hours 5 globules\)/g, 'aigu (toutes les 1-2h 5 granules)')
      .replace(/single dose/g, 'dose unique')
      .replace(/globules/g, 'granules')
      .replace(/daily/g, 'par jour')
      .replace(/sublingual/g, 'sublingual')
      .replace(/Gastric remedy for canine hunger with stomach sinking and craving for heavy food/g, 'Remède gastrique pour faim canine avec sensation de vide à l\'estomac et désir d\'aliments lourds')
      .replace(/Leading remedy for acute sudden fever, terror, panic and restless anxiety after cold wind exposure/g, 'Grand remède de fièvre aiguë soudaine, terreur, panique et agitation anxieuse après exposition au vent froid');
  }
  if (lang === 'es') {
    return text
      .replace(/acute \(every 1-2h 5 globules\)/g, 'agudo (cada 1-2h 5 glóbulos)')
      .replace(/acute \(every 1-2 hours 5 globules\)/g, 'agudo (cada 1-2h 5 glóbulos)')
      .replace(/single dose/g, 'dosis única')
      .replace(/globules/g, 'glóbulos')
      .replace(/daily/g, 'al día')
      .replace(/Gastric remedy for canine hunger with stomach sinking and craving for heavy food/g, 'Medicamento gástrico para hambre voraz con sensación de vacío estomacal y deseo de comida pesada')
      .replace(/Leading remedy for acute sudden fever, terror, panic and restless anxiety after cold wind exposure/g, 'Gran medicamento para fiebre repentina aguda, terror, pánico e inquietud ansiosa tras viento frío');
  }
  if (lang === 'it') {
    return text
      .replace(/acute \(every 1-2h 5 globules\)/g, 'acuto (ogni 1-2h 5 globuli)')
      .replace(/acute \(every 1-2 hours 5 globules\)/g, 'acuto (ogni 1-2h 5 globuli)')
      .replace(/single dose/g, 'dose singola')
      .replace(/globules/g, 'globuli')
      .replace(/daily/g, 'al giorno')
      .replace(/Gastric remedy for canine hunger with stomach sinking and craving for heavy food/g, 'Rimedio gastrico per fame canina con senso di vuoto allo stomaco e desiderio di cibi pesanti')
      .replace(/Leading remedy for acute sudden fever, terror, panic and restless anxiety after cold wind exposure/g, 'Grande rimedio per febbre acuta improvvisa, terrore, panico e irrequietezza ansiosa dopo vento freddo');
  }
  if (lang === 'el') {
    return text
      .replace(/acute \(every 1-2h 5 globules\)/g, 'οξύ (κάθε 1-2 ώρες 5 σφαιρίδια)')
      .replace(/acute \(every 1-2 hours 5 globules\)/g, 'οξύ (κάθε 1-2 ώρες 5 σφαιρίδια)')
      .replace(/single dose/g, 'εφάπαξ δόση')
      .replace(/globules/g, 'σφαιρίδια')
      .replace(/daily/g, 'ημερησίως')
      .replace(/Gastric remedy for canine hunger with stomach sinking and craving for heavy food/g, 'Γαστρικό φάρμακο για βουλιμική πείνα με αίσθημα κενού στο στομάχι και επιθυμία για βαριά φαγητά')
      .replace(/Leading remedy for acute sudden fever, terror, panic and restless anxiety after cold wind exposure/g, 'Κορυφαίο φάρμακο για οξύ αιφνίδιο πυρετό, τρόμο, πανικό και ανήσυχο άγχος μετά από έκθεση σε παγωμένο άνεμο');
  }
  if (lang === 'ru') {
    return text
      .replace(/acute \(every 1-2h 5 globules\)/g, 'остро (каждые 1-2 ч по 5 гранул)')
      .replace(/acute \(every 1-2 hours 5 globules\)/g, 'остро (каждые 1-2 ч по 5 гранул)')
      .replace(/single dose/g, 'однократная доза')
      .replace(/globules/g, 'гранул')
      .replace(/daily/g, 'в день')
      .replace(/Gastric remedy for canine hunger with stomach sinking and craving for heavy food/g, 'Желудочное средство при волчьем голоде с ощущением пустоты в желудке и тягой к тяжелой пище')
      .replace(/Leading remedy for acute sudden fever, terror, panic and restless anxiety after cold wind exposure/g, 'Главное средство при внезапной острой лихорадке, панике, страхе и двигательном беспокойстве после холодного ветра');
  }
  return text;
}

function translateList(arr: string[], lang: 'es' | 'fr' | 'it' | 'el' | 'ru'): string[] {
  if (!arr || !Array.isArray(arr)) return [];
  return arr.map(item => translateText(item, lang));
}

export function buildEntry(r: RawRemedy) {
  const cat = r.categoryKey;
  const langs = ['de', 'en', 'es', 'fr', 'el', 'it', 'ru'] as const;
  
  const translations: any = {};
  
  for (const lang of langs) {
    const rawLang = (r as any)[lang];
    const deContent = r.de;
    const enContent = r.en;
    
    const catName = CATEGORY_MAP[cat]?.[lang] || CATEGORY_MAP[cat]?.en || 'Pflanzlich';
    
    if (lang === 'de') {
      translations.de = {
        category: catName,
        ...deContent
      };
    } else if (lang === 'en') {
      translations.en = {
        category: catName,
        ...enContent
      };
    } else if (rawLang && rawLang.commonName) {
      translations[lang] = {
        commonName: rawLang.commonName,
        category: catName,
        origin: rawLang.origin || translateText(enContent.origin, lang),
        essence: rawLang.essence || translateText(enContent.essence, lang),
        mainIndications: rawLang.mainIndications || translateList(enContent.mainIndications, lang),
        keynotes: rawLang.keynotes || translateList(enContent.keynotes, lang),
        mindEmotional: rawLang.mindEmotional || translateText(enContent.mindEmotional, lang),
        modalitiesBetter: rawLang.modalitiesBetter || translateList(enContent.modalitiesBetter, lang),
        modalitiesWorse: rawLang.modalitiesWorse || translateList(enContent.modalitiesWorse, lang),
        potenciesAndDosage: rawLang.potenciesAndDosage || translateText(enContent.potenciesAndDosage, lang),
        defaultTagesdosis: rawLang.defaultTagesdosis || translateText(enContent.defaultTagesdosis || '3x täglich 5 Globuli', lang),
        sphereOfAction: rawLang.sphereOfAction || translateList(enContent.sphereOfAction, lang),
        differentialRemedies: rawLang.differentialRemedies || enContent.differentialRemedies,
        searchKeywords: rawLang.searchKeywords || [rawLang.commonName.toLowerCase(), r.latinName.toLowerCase()]
      };
    } else {
      // Fallback with translated commonName template or en
      translations[lang] = {
        commonName: enContent.commonName,
        category: catName,
        origin: translateText(enContent.origin, lang),
        essence: translateText(enContent.essence, lang),
        mainIndications: translateList(enContent.mainIndications, lang),
        keynotes: translateList(enContent.keynotes, lang),
        mindEmotional: translateText(enContent.mindEmotional, lang),
        modalitiesBetter: translateList(enContent.modalitiesBetter, lang),
        modalitiesWorse: translateList(enContent.modalitiesWorse, lang),
        potenciesAndDosage: translateText(enContent.potenciesAndDosage, lang),
        defaultTagesdosis: translateText(enContent.defaultTagesdosis || '3x daily 5 globules', lang),
        sphereOfAction: translateList(enContent.sphereOfAction, lang),
        differentialRemedies: enContent.differentialRemedies,
        searchKeywords: [r.latinName.toLowerCase(), enContent.commonName.toLowerCase()]
      };
    }
  }

  return {
    id: r.id,
    latinName: r.latinName,
    categoryKey: r.categoryKey,
    isPolychrest: r.isPolychrest ?? false,
    importanceTier: r.importanceTier,
    translations
  };
}
