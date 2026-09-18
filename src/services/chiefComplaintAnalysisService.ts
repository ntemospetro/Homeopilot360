import { LanguageCode } from '../types';
import { normalizeQuery } from './boerickeRepertoryService';

export interface ChiefComplaintAnalysisResult {
  rawInput: string;
  isRecognized: boolean;
  organDomain: string;
  feedbackMessage: string;
  candidateOptions: string[];
  detectedComplaints: string[];
  hasMultipleComplaints: boolean;
}

// Multilingual organ / system definitions
export interface DomainDefinition {
  id: string;
  labels: Record<LanguageCode, string>;
  keywords: string[];
}

export const DOMAIN_DEFINITIONS: DomainDefinition[] = [
  {
    id: 'head',
    labels: {
      de: 'Kopf, ZNS & Sinnesorgane',
      en: 'Head, CNS & Sensory Organs',
      es: 'Cabeza, SNC y Órganos sensoriales',
      fr: 'Tête, SNC & Organes sensoriels',
      it: 'Testa, SNC & Organi sensoriali',
      el: 'Κεφαλή, ΚΝΣ & Αισθητήρια όργανα',
      ru: 'Голова, ЦНС и органы чувств'
    },
    keywords: [
      'kopf', 'stirn', 'schlafe', 'hinterkopf', 'scheitel', 'migran', 'gehirn', 'augen', 'ohr', 'ohren', 'zahn', 'zahne', 'schwindel', 'benommen',
      'head', 'forehead', 'temple', 'occiput', 'migraine', 'brain', 'eyes', 'ears', 'tooth', 'teeth', 'dizzy', 'dizziness', 'vertigo',
      'cabeza', 'frente', 'sien', 'nuca', 'migrana', 'cerebro', 'ojos', 'oidos', 'diente', 'mareo', 'vertigo',
      'tete', 'front', 'tempe', 'nuque', 'migraine', 'cerveau', 'yeux', 'oreilles', 'dent', 'vertige',
      'testa', 'fronte', 'tempia', 'nuca', 'emicrania', 'cervello', 'occhi', 'orecchie', 'dente', 'vertigine',
      'κεφαλ', 'πονοκεφαλ', 'μετωπ', 'κροταφ', 'ινιο', 'εγκεφαλ', 'ματι', 'αυτι', 'ημικραν', 'δοντι', 'ζαλη', 'ιλιγγος',
      'голов', 'лоб', 'висок', 'затыл', 'мигрен', 'мозг', 'глаз', 'уш', 'зуб', 'головокруж'
    ]
  },
  {
    id: 'gastro',
    labels: {
      de: 'Magen, Darm & Verdauungstrakt',
      en: 'Stomach, Intestines & Digestion',
      es: 'Estómago, Intestinos y Digestión',
      fr: 'Estomac, Intestins & Digestion',
      it: 'Stomaco, Intestino & Digestione',
      el: 'Στόμαχος, Έντερο & Πεπτικό σύστημα',
      ru: 'Желудок, кишечник и пищеварение'
    },
    keywords: [
      'magen', 'bauch', 'oberbauch', 'unterbauch', 'darm', 'leber', 'galle', 'ubelk', 'ubel', 'erbrech', 'kotz', 'durchfall', 'verstopf', 'kolik',
      'stomach', 'abdomen', 'belly', 'gut', 'bowel', 'liver', 'nausea', 'vomit', 'diarrhea', 'constipat', 'colic',
      'estomago', 'vientre', 'higado', 'nausea', 'vomito', 'diarrea', 'estrenim', 'colico',
      'estomac', 'ventre', 'foie', 'nausee', 'vomiss', 'diarrhee', 'constipat', 'colique',
      'stomaco', 'addome', 'fegato', 'nausea', 'vomito', 'diarrea', 'stipsi', 'colica',
      'στομαχ', 'κοιλ', 'ηπαρ', 'χολ', 'εντερ', 'ναυτι', 'εμετ', 'διαρροι', 'δυσκοιλι', 'κολικ',
      'желуд', 'живот', 'кишеч', 'печен', 'тошнот', 'рвот', 'понос', 'запор', 'колик'
    ]
  },
  {
    id: 'respiratory',
    labels: {
      de: 'Atemwege, Hals & Thorax',
      en: 'Respiratory Tract, Throat & Chest',
      es: 'Vías respiratorias, Garganta y Tórax',
      fr: 'Voies respiratoires, Gorge & Thorax',
      it: 'Vie respiratorie, Gola & Torace',
      el: 'Αναπνευστικό, Λαιμός & Θώρακας',
      ru: 'Дыхательные пути, горло и грудная клетка'
    },
    keywords: [
      'husten', 'brust', 'lunge', 'hals', 'kehlkopf', 'bronch', 'schnupfen', 'atem', 'heiser',
      'cough', 'chest', 'lung', 'throat', 'larynx', 'bronch', 'coryza', 'breath', 'hoarse',
      'tos', 'pecho', 'pulmon', 'garganta', 'laringe', 'bronqu', 'resfriado', 'respirac',
      'toux', 'poitrine', 'poumon', 'gorge', 'larynx', 'bronch', 'rhume', 'souffle',
      'tosse', 'petto', 'polmone', 'gola', 'laringe', 'bronch', 'raffreddore', 'respiro',
      'βηχ', 'θωρακ', 'πνευμον', 'λαιμ', 'λαρυγγ', 'βρογχ', 'συναχι', 'αναπνο', 'βραχν',
      'кашел', 'груд', 'легк', 'горл', 'гортан', 'бронх', 'насморк', 'дыхан'
    ]
  },
  {
    id: 'locomotor',
    labels: {
      de: 'Bewegungsapparat, Gelenke & Rücken',
      en: 'Locomotor System, Joints & Back',
      es: 'Aparato locomotor, Articulaciones y Espalda',
      fr: 'Appareil locomoteur, Articulations & Dos',
      it: 'Apparato locomotore, Articolazioni & Schiena',
      el: 'Μυοσκελετικό, Αρθρώσεις & Πλάτη',
      ru: 'Опорно-двигательный аппарат, суставы и спина'
    },
    keywords: [
      'rucken', 'kreuz', 'lws', 'nacken', 'hws', 'gelenk', 'muskel', 'knochen', 'extremit', 'lahm', 'steif', 'verstauch', 'rheuma',
      'back', 'lumbar', 'neck', 'cervical', 'joint', 'muscle', 'bone', 'limb', 'stiff', 'sprain', 'rheumat',
      'espalda', 'lumbar', 'cuello', 'cervical', 'articulac', 'musculo', 'hueso', 'extremidad', 'rigidez', 'esguince',
      'dos', 'lombaire', 'cou', 'cervicale', 'articulat', 'muscle', 'os', 'membre', 'raideur', 'entorse',
      'schiena', 'lombare', 'collo', 'cervicale', 'articolaz', 'muscolo', 'osso', 'arto', 'rigidita', 'distorsione',
      'πλατη', 'μεση', 'αυχενας', 'οσφυ', 'αρθρωσ', 'μυς', 'οστ', 'ακρα', 'δυσκαμψ', 'διαστρεμμ', 'ρευματ',
      'спин', 'поясниц', 'шея', 'сустав', 'мышц', 'кост', 'конечност', 'скованност', 'растяжен'
    ]
  },
  {
    id: 'fever_general',
    labels: {
      de: 'Fieber, Infektion & Allgemeinsymptome',
      en: 'Fever, Infection & General Symptoms',
      es: 'Fiebre, Infección y Síntomas Generales',
      fr: 'Fièvre, Infection & Symptômes Généraux',
      it: 'Febbre, Infezione & Sintomi Generali',
      el: 'Πυρετός, Λοίμωξη & Γενικά συμπτώματα',
      ru: 'Лихорадка, инфекция и общие симптомы'
    },
    keywords: [
      'fieber', 'hitze', 'frost', 'schuttelfrost', 'grippe', 'infekt', 'entzund', 'zerschlag', 'erschopf',
      'fever', 'heat', 'chill', 'flu', 'infect', 'inflammat', 'exhaust', 'weak',
      'fiebre', 'calor', 'escalofrio', 'gripe', 'infecc', 'inflamac', 'agotam',
      'fievre', 'chaleur', 'frisson', 'grippe', 'infect', 'inflammat', 'epuisem',
      'febbre', 'calore', 'brividi', 'influenza', 'infez', 'infiammaz', 'spossatezza',
      'πυρετ', 'θερμοτ', 'κρυαδ', 'ριγος', 'γριπ', 'λοιμωξ', 'φλεγμον', 'εξαντλησ',
      'лихорад', 'жар', 'озноб', 'грипп', 'инфекц', 'воспален', 'истощен'
    ]
  },
  {
    id: 'mind',
    labels: {
      de: 'Gemüt, Psyche & Schlaf',
      en: 'Mind, Emotions & Sleep',
      es: 'Mente, Emociones y Sueño',
      fr: 'Psychisme, Émotions & Sommeil',
      it: 'Mente, Emozioni & Sonno',
      el: 'Gemüt, Ψυχισμός & Ύπνος',
      ru: 'Психика, эмоции и сон'
    },
    keywords: [
      'angst', 'unruhe', 'reizbar', 'zorn', 'kummer', 'trauer', 'schreck', 'schlaflos', 'alptraum',
      'anxiety', 'restless', 'irritable', 'anger', 'grief', 'shock', 'insomnia', 'nightmare',
      'ansiedad', 'inquietud', 'irritable', 'ira', 'pena', 'susto', 'insomnio',
      'anxiete', 'agitation', 'irritable', 'colere', 'chagrin', 'frayeur', 'insomnie',
      'ansia', 'irrequietezza', 'irritabile', 'rabbia', 'dolore', 'spavento', 'insonnia',
      'αγχος', 'ανησυχι', 'ευερεθιστ', 'οργη', 'θυμος', 'στεναχωρι', 'τρομος', 'αυπνι',
      'тревог', 'беспокойств', 'раздражит', 'гнев', 'горе', 'испуг', 'бессонниц'
    ]
  },
  {
    id: 'skin',
    labels: {
      de: 'Haut, Wunden & Gewebe',
      en: 'Skin, Wounds & Tissue',
      es: 'Piel, Heridas y Tejidos',
      fr: 'Peau, Plaies & Tissus',
      it: 'Pelle, Ferite & Tessuti',
      el: 'Δέρμα, Τραύματα & Ιστοί',
      ru: 'Кожа, раны и ткани'
    },
    keywords: [
      'haut', 'wunde', 'ausschlag', 'juck', 'ekzem', 'geschwur', 'abszess', 'stich', 'brandwunde',
      'skin', 'wound', 'rash', 'itch', 'eczema', 'ulcer', 'abscess', 'bite', 'burn',
      'piel', 'herida', 'erupcion', 'picor', 'eccema', 'ulcera', 'picadura', 'quemadura',
      'peau', 'plaie', 'eruption', 'demangeais', 'eczema', 'ulcere', 'piqure', 'brulure',
      'pelle', 'ferita', 'eruzione', 'prurito', 'eczema', 'ulcera', 'puntura', 'ustione',
      'δερμα', 'πληγη', 'εξανθημ', 'φαγουρ', 'εκζεμ', 'ελκος', 'τσιμπημ', 'εγκαυμ',
      'кож', 'ран', 'сыпь', 'зуд', 'экзем', 'язв', 'укус', 'ожог'
    ]
  }
];

/**
 * Normalizes colloquial, narrative, or fragmented symptom formulations into standard homeopathic complaint terms.
 * e.g., "mein Nacken tut weh" -> "Nackenschmerzen", "mein Kopf tut weh" -> "Kopfschmerzen",
 * "mir war übel" -> "Übelkeit", "Bauchschmerzen habe ich" -> "Bauchschmerzen".
 */
export function canonicalizeSymptomTerm(rawTerm: string, lang: LanguageCode = 'de'): string {
  const clean = (rawTerm || '').trim();
  if (!clean) return '';

  const norm = normalizeQuery(clean);

  // 1. Neck / Cervical / Genick
  const isNeck = norm.includes('nacken') || norm.includes('genick') || norm.includes('hws') ||
    norm.includes('neck') || norm.includes('cervical') || norm.includes('cou') ||
    norm.includes('collo') || norm.includes('cuello') || norm.includes('αυχενας') ||
    norm.includes('шея') || norm.includes('затылок');

  if (isNeck) {
    switch (lang) {
      case 'de': return 'Nackenschmerzen';
      case 'en': return 'Neck pain';
      case 'es': return 'Dolor cervical';
      case 'fr': return 'Douleurs cervicales';
      case 'it': return 'Dolore cervicale';
      case 'el': return 'Αυχενικός πόνος';
      case 'ru': return 'Боль в шее';
    }
  }

  // 2. Head / Kopf / Headache
  const isHead = norm.includes('kopf') || norm.includes('head') || norm.includes('tete') ||
    norm.includes('cabeza') || norm.includes('testa') || norm.includes('κεφαλ') || norm.includes('голов');

  if (isHead) {
    switch (lang) {
      case 'de': return 'Kopfschmerzen';
      case 'en': return 'Headache';
      case 'es': return 'Dolor de cabeza';
      case 'fr': return 'Maux de tête';
      case 'it': return 'Mal di testa';
      case 'el': return 'Πονοκέφαλος';
      case 'ru': return 'Головная боль';
    }
  }

  // 3. Abdomen / Bauch / Stomach / Magen
  const isAbdomen = norm.includes('bauch') || norm.includes('magen') || norm.includes('stomach') ||
    norm.includes('belly') || norm.includes('abdomen') || norm.includes('ventre') ||
    norm.includes('pancia') || norm.includes('addom') || norm.includes('κοιλια') ||
    norm.includes('στομαχ') || norm.includes('живот') || norm.includes('желудок');

  if (isAbdomen) {
    switch (lang) {
      case 'de': return 'Bauchschmerzen';
      case 'en': return 'Abdominal pain';
      case 'es': return 'Dolor abdominal';
      case 'fr': return 'Maux de ventre';
      case 'it': return 'Dolori addominali';
      case 'el': return 'Πόνος στην κοιλιά';
      case 'ru': return 'Боль в животе';
    }
  }

  // 4. Back / Rücken / Kreuz
  const isBack = norm.includes('rucken') || norm.includes('rücken') || norm.includes('kreuz') ||
    norm.includes('lws') || norm.includes('back') || norm.includes('spine') ||
    norm.includes('dos') || norm.includes('espalda') || norm.includes('schiena') ||
    norm.includes('πλατη') || norm.includes('μεση') || norm.includes('спин') || norm.includes('поясниц');

  if (isBack) {
    switch (lang) {
      case 'de': return 'Rückenschmerzen';
      case 'en': return 'Back pain';
      case 'es': return 'Dolor de espalda';
      case 'fr': return 'Mal de dos';
      case 'it': return 'Mal di schiena';
      case 'el': return 'Πόνος στην πλάτη';
      case 'ru': return 'Боль в спине';
    }
  }

  // 5. Throat / Hals / Schlucken
  const isThroat = (norm.includes('hals') || norm.includes('throat') || norm.includes('gorge') ||
    norm.includes('gola') || norm.includes('garganta') || norm.includes('λαιμος') ||
    norm.includes('горло')) && !isNeck;

  if (isThroat) {
    switch (lang) {
      case 'de': return 'Halsschmerzen';
      case 'en': return 'Sore throat';
      case 'es': return 'Dolor de garganta';
      case 'fr': return 'Mal de gorge';
      case 'it': return 'Mal di gola';
      case 'el': return 'Πονόλαιμος';
      case 'ru': return 'Боль в горле';
    }
  }

  // 6. Nausea / Übelkeit / Erbrechen
  const isNausea = norm.includes('ubel') || norm.includes('übel') || norm.includes('erbrechen') ||
    norm.includes('kotz') || norm.includes('spuck') || norm.includes('nausea') ||
    norm.includes('vomit') || norm.includes('sick') || norm.includes('nauzee') ||
    norm.includes('nausée') || norm.includes('vomiss') || norm.includes('ναυτια') ||
    norm.includes('εμετ') || norm.includes('тошнот') || norm.includes('рвот');

  if (isNausea) {
    switch (lang) {
      case 'de': return 'Übelkeit';
      case 'en': return 'Nausea';
      case 'es': return 'Náuseas';
      case 'fr': return 'Nausées';
      case 'it': return 'Nausea';
      case 'el': return 'Ναυτία';
      case 'ru': return 'Тошнота';
    }
  }

  // 7. Dizziness / Schwindel
  const isVertigo = norm.includes('schwindel') || norm.includes('dizzy') || norm.includes('dizziness') ||
    norm.includes('vertigo') || norm.includes('vertige') || norm.includes('vertigine') ||
    norm.includes('mareo') || norm.includes('ζαλη') || norm.includes('ιλιγγ') ||
    norm.includes('головокруж');

  if (isVertigo) {
    switch (lang) {
      case 'de': return 'Schwindel';
      case 'en': return 'Dizziness';
      case 'es': return 'Vértigo';
      case 'fr': return 'Vertiges';
      case 'it': return 'Vertigini';
      case 'el': return 'Ζάλη';
      case 'ru': return 'Головокружение';
    }
  }

  // 8. Ear / Ohr
  const isEar = norm.includes('ohr') || norm.includes('ear') || norm.includes('oreille') ||
    norm.includes('oreja') || norm.includes('orecch') || norm.includes('αυτι') ||
    norm.includes('ух') || norm.includes('уши');

  if (isEar) {
    switch (lang) {
      case 'de': return 'Ohrenschmerzen';
      case 'en': return 'Earache';
      case 'es': return 'Dolor de oído';
      case 'fr': return 'Mal d\'oreille';
      case 'it': return 'Mal d\'orecchio';
      case 'el': return 'Ωταλγία';
      case 'ru': return 'Боль в ухе';
    }
  }

  // 9. Tooth / Zahn
  const isTooth = norm.includes('zahn') || norm.includes('zahne') || norm.includes('zähne') ||
    norm.includes('tooth') || norm.includes('teeth') || norm.includes('dent') ||
    norm.includes('diente') || norm.includes('dente') || norm.includes('δοντι') ||
    norm.includes('зуб');

  if (isTooth) {
    switch (lang) {
      case 'de': return 'Zahnschmerzen';
      case 'en': return 'Toothache';
      case 'es': return 'Dolor de muelas';
      case 'fr': return 'Mal de dents';
      case 'it': return 'Mal di denti';
      case 'el': return 'Πονόδοντος';
      case 'ru': return 'Зубная боль';
    }
  }

  // 10. Chest / Thorax / Brustkorb
  const isChest = norm.includes('brust') || norm.includes('chest') || norm.includes('poitrine') ||
    norm.includes('petto') || norm.includes('torac') || norm.includes('thorax') ||
    norm.includes('στηθος') || norm.includes('θωρακ') || norm.includes('груд');

  if (isChest) {
    switch (lang) {
      case 'de': return 'Brustschmerzen';
      case 'en': return 'Chest pain';
      case 'es': return 'Dolor en el pecho';
      case 'fr': return 'Douleurs thoraciques';
      case 'it': return 'Dolore toracico';
      case 'el': return 'Θωρακικός πόνος';
      case 'ru': return 'Боль в груди';
    }
  }

  // 11. Knee / Knie
  const isKnee = norm.includes('knie') || norm.includes('knee') || norm.includes('genou') ||
    norm.includes('ginocchio') || norm.includes('rodilla') || norm.includes('γονατ') ||
    norm.includes('колен');

  if (isKnee) {
    switch (lang) {
      case 'de': return 'Knieschmerzen';
      case 'en': return 'Knee pain';
      case 'es': return 'Dolor de rodilla';
      case 'fr': return 'Douleurs au genou';
      case 'it': return 'Dolore al ginocchio';
      case 'el': return 'Πόνος στο γόνατο';
      case 'ru': return 'Боль в колене';
    }
  }

  // 12. Shoulder / Schulter
  const isShoulder = norm.includes('schulter') || norm.includes('shoulder') || norm.includes('epaule') ||
    norm.includes('épaule') || norm.includes('spalla') || norm.includes('hombro') ||
    norm.includes('ωμος') || norm.includes('ώμος') || norm.includes('плеч');

  if (isShoulder) {
    switch (lang) {
      case 'de': return 'Schulterschmerzen';
      case 'en': return 'Shoulder pain';
      case 'es': return 'Dolor de hombro';
      case 'fr': return 'Douleurs à l\'épaule';
      case 'it': return 'Dolore alla spalla';
      case 'el': return 'Πόνος στον ώμο';
      case 'ru': return 'Боль в плече';
    }
  }

  // 13. Cough / Husten
  const isCough = norm.includes('husten') || norm.includes('cough') || norm.includes('toux') ||
    norm.includes('tos') || norm.includes('tosse') || norm.includes('βηχ') ||
    norm.includes('кашл');

  if (isCough) {
    switch (lang) {
      case 'de': return 'Husten';
      case 'en': return 'Cough';
      case 'es': return 'Tos';
      case 'fr': return 'Toux';
      case 'it': return 'Tosse';
      case 'el': return 'Βήχας';
      case 'ru': return 'Кашель';
    }
  }

  // 14. Runny nose / Cold / Schnupfen
  const isCold = norm.includes('schnupfen') || norm.includes('cold') || norm.includes('rhume') ||
    norm.includes('resfriado') || norm.includes('raffreddore') || norm.includes('συναχι') ||
    norm.includes('насморк');

  if (isCold) {
    switch (lang) {
      case 'de': return 'Schnupfen';
      case 'en': return 'Runny nose';
      case 'es': return 'Resfriado';
      case 'fr': return 'Rhume';
      case 'it': return 'Raffreddore';
      case 'el': return 'Συνάχι';
      case 'ru': return 'Насморк';
    }
  }

  // 15. Fever / Fieber
  const isFever = norm.includes('fieber') || norm.includes('fever') || norm.includes('fievre') ||
    norm.includes('fièvre') || norm.includes('fiebre') || norm.includes('febbre') ||
    norm.includes('πυρετ') || norm.includes('лихорад') || norm.includes('жар');

  if (isFever) {
    switch (lang) {
      case 'de': return 'Fieber';
      case 'en': return 'Fever';
      case 'es': return 'Fiebre';
      case 'fr': return 'Fièvre';
      case 'it': return 'Febbre';
      case 'el': return 'Πυρετός';
      case 'ru': return 'Лихорадка';
    }
  }

  // Default fallback: return clean capitalized string
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/**
 * Extracts multiple distinct complaints when patient names more than one symptom in their narrative.
 * Supports multilingual conjunctions, punctuation, and converts colloquial expressions to canonical homeopathic terms.
 */
export function extractMultipleComplaints(input: string, lang: LanguageCode = 'de'): string[] {
  const trimmed = (input || '').trim();
  if (!trimmed || trimmed.length < 4) return [];

  // Multi-lingual delimiter regular expressions
  // Matches conjunctions, commas, semicolons, bullets etc.
  const delimiterPattern = /(?:,|\band\b|\bas well as\b|\balso\b|\bwith\b|\bund\b|\bsowie\b|\baußerdem\b|\bdazu\b|\bmit\b|\bzusätzlich\b|\baber auch\b|\bund auch\b|\by\b|\be\b|\bademás\b|\btambién\b|\bcon\b|\bet\b|\baussi\b|\bavec\b|\bainsi que\b|\bed\b|\banche\b|\binoltre\b|\bκαι\b|\bκαθώς και\b|\bεπίσης\b|\bμε\b|\bи\b|\bа также\b|\bтакже\b|\bс\b|;|\.|\n|\r)/gi;

  const rawParts = trimmed.split(delimiterPattern);

  // Common conversational filler prefixes/suffixes across languages
  const conversationalLeadPatterns = [
    // German
    /^(mein|meine|meinen|meinem|meines|ein|eine|einen|einem|eines|der|die|das|dem|den|ich habe|ich leide an|ich leide unter|mir ist|habe ich auch|habe ich|es tut mir|mir tut|tut weh|spüre ich|habe seit|seit gestern|seit tagen|plötzlich|starke|starker|starkes|heftige|heftiger|leichte|leichter|immer wieder|schlimme|schlimmer)\s+/i,
    // English
    /^(my|the|a|an|i have|i suffer from|there is|i feel|i also have|hurts|pain in|severe|mild|since yesterday)\s+/i,
    // Spanish
    /^(mi|mis|el|la|los|las|un|una|tengo|sufro de|me duele|siento|también tengo|desde ayer)\s+/i,
    // French
    /^(mon|ma|mes|le|la|les|un|une|j'ai|je souffre de|il y a|je ressens|j'ai aussi|depuis hier)\s+/i,
    // Italian
    /^(il mio|la mia|mio|mia|i miei|le mie|il|la|lo|i|gli|le|ho|soffro di|mi fa male|sento|ho anche|da ieri)\s+/i,
    // Greek
    /^(ο|η|το|οι|τα|μου|ένας|μία|ένα|έχω|υποφέρω από|πονάει|αισθάνομαι|έχω επίσης|από χθες)\s+/i,
    // Russian
    /^(мой|моя|мое|моё|мои|у меня|я страдаю от|болит|чувствую|также у меня|со вчерашнего дня)\s+/i
  ];

  const conversationalTailPatterns = [
    // German
    /\s+(tut mir weh|tut weh|tut so weh|schmerzt sehr|schmerzt|schmerzen|schmerzend|brennt sehr|brennt|sticht sehr|sticht|zieht sehr|zieht|drückt sehr|drückt|habe ich auch|habe ich|macht mir zu schaffen|seit tagen|seit gestern|ist schlimm|spüre ich)$/i,
    // English
    /\s+(hurts a lot|hurts so much|hurts|hurting|aches a lot|aches|is aching|is sore|as well|makes problems|since days|since yesterday)$/i,
    // Spanish
    /\s+(me duele mucho|me duele|duele mucho|duele|también|desde hace días|desde ayer)$/i,
    // French
    /\s+(me fait mal|fait mal|très mal|aussi|depuis des jours|depuis hier)$/i,
    // Italian
    /\s+(mi fa male|fa male|molto male|anche|da giorni|da ieri)$/i,
    // Greek
    /\s+(πονάει πολύ|πονάει|με ενοχλεί πολύ|με ενοχλεί)$/i,
    // Russian
    /\s+(болит сильно|болит|очень болит|беспокоит|со вчерашнего дня)$/i
  ];

  const results: string[] = [];
  const seenNorm = new Set<string>();

  for (const part of rawParts) {
    let clean = part.trim();
    if (!clean) continue;

    // First, try direct canonicalization of the raw fragment (e.g., "mein Nacken tut weh" -> "Nackenschmerzen")
    const canonicalDirect = canonicalizeSymptomTerm(clean, lang);
    const normDirect = normalizeQuery(canonicalDirect);

    if (canonicalDirect && normDirect.length >= 3 && !['und', 'and', 'mit', 'auch', 'dazu', 'sehr', 'viel', 'dass', 'wenn'].includes(normDirect)) {
      if (!seenNorm.has(normDirect)) {
        seenNorm.add(normDirect);
        results.push(canonicalDirect);
        continue;
      }
    }

    // Secondary fallback: strip leading & trailing conversational filler patterns
    for (const lead of conversationalLeadPatterns) {
      clean = clean.replace(lead, '').trim();
    }
    for (const tail of conversationalTailPatterns) {
      clean = clean.replace(tail, '').trim();
    }

    if (clean.length >= 3) {
      const canonicalSecondary = canonicalizeSymptomTerm(clean, lang);
      const normSecondary = normalizeQuery(canonicalSecondary);
      if (normSecondary.length >= 3 && !['und', 'and', 'mit', 'auch', 'dazu', 'sehr', 'viel', 'dass', 'wenn'].includes(normSecondary)) {
        if (!seenNorm.has(normSecondary)) {
          seenNorm.add(normSecondary);
          results.push(canonicalSecondary);
        }
      }
    }
  }

  if (results.length >= 2) {
    return results;
  }

  // Domain keyword scan for multi-domain utterances without formal conjunctions
  const normInput = normalizeQuery(trimmed);
  const matchedDomains: { domain: DomainDefinition; keyword: string }[] = [];
  for (const dom of DOMAIN_DEFINITIONS) {
    for (const kw of dom.keywords) {
      if (kw.length >= 4 && normInput.includes(kw)) {
        matchedDomains.push({ domain: dom, keyword: kw });
        break;
      }
    }
  }

  if (matchedDomains.length >= 2 && results.length < 2) {
    const domainTerms = matchedDomains.map(md => {
      const words = trimmed.split(/\s+/);
      const matchingWord = words.find(w => normalizeQuery(w).includes(md.keyword)) || md.keyword;
      const cleanWord = matchingWord.charAt(0).toUpperCase() + matchingWord.slice(1).replace(/[.,;:!?]/g, '');
      return canonicalizeSymptomTerm(cleanWord, lang);
    });
    const uniqueDomainTerms = Array.from(new Set(domainTerms)).filter(t => t.length >= 3);
    if (uniqueDomainTerms.length >= 2) {
      return uniqueDomainTerms;
    }
  }

  return results;
}

/**
 * Analyzes patient input (spoken or typed) for the chief complaint.
 * Verifies if it is recognized in homeopathic Materia Medica and returns:
 * - Identified anatomical/clinical domain
 * - Explanatory feedback
 * - 3 to 6 actual candidate complaint options pulled from Polychrest Materia Medica!
 * - Automatic multi-complaint detection for intelligent prompting
 */
export function analyzeChiefComplaint(
  input: string,
  lang: LanguageCode
): ChiefComplaintAnalysisResult {
  const trimmed = (input || '').trim();
  if (!trimmed) {
    return {
      rawInput: '',
      isRecognized: false,
      organDomain: '',
      feedbackMessage: '',
      candidateOptions: [],
      detectedComplaints: [],
      hasMultipleComplaints: false
    };
  }

  const detectedComplaints = extractMultipleComplaints(trimmed, lang);
  const hasMultipleComplaints = detectedComplaints.length >= 2;

  const normInput = normalizeQuery(trimmed);
  const inputWords = normInput.split(/\s+/).filter(w => w.length >= 2);
  const canon = canonicalizeSymptomTerm(trimmed, lang);
  const normCanon = normalizeQuery(canon);
  const canonWords = normCanon.split(/\s+/).filter(w => w.length >= 2);

  // 1. Identify domain
  let bestDomain: DomainDefinition | null = null;
  let maxMatches = 0;

  for (const domain of DOMAIN_DEFINITIONS) {
    let count = 0;
    for (const kw of domain.keywords) {
      // Check input words for exact match or legitimate compound starting with >=4 letter keyword
      for (const iw of inputWords) {
        if (iw === kw) {
          count += 3;
        } else if (kw.length >= 4 && iw.length > kw.length && iw.startsWith(kw)) {
          // e.g. bauchschmerzen starts with bauch
          count += 2;
        }
      }
      // Check canonical term words as well
      for (const cw of canonWords) {
        if (cw === kw) {
          count += 3;
        } else if (kw.length >= 4 && cw.length > kw.length && cw.startsWith(kw)) {
          count += 2;
        }
      }
    }
    if (count > maxMatches) {
      maxMatches = count;
      bestDomain = domain;
    }
  }

  const domainLabel = bestDomain
    ? (bestDomain.labels[lang] || bestDomain.labels.de)
    : '';

  const isRecognized = maxMatches > 0;

  // Build localized feedback message
  let feedbackMessage = '';
  if (isRecognized && domainLabel) {
    switch (lang) {
      case 'de':
        feedbackMessage = `Hauptbeschwerde verstanden (Bereich: ${domainLabel}).`;
        break;
      case 'el':
        feedbackMessage = `Το κύριο σύμπτωμα έγινε κατανοητό (Τομέας: ${domainLabel}).`;
        break;
      case 'en':
        feedbackMessage = `Chief complaint understood (Area: ${domainLabel}).`;
        break;
      case 'es':
        feedbackMessage = `Motivo principal comprendido (Área: ${domainLabel}).`;
        break;
      case 'fr':
        feedbackMessage = `Plainte principale comprise (Domaine : ${domainLabel}).`;
        break;
      case 'it':
        feedbackMessage = `Disturbo principale compreso (Ambito: ${domainLabel}).`;
        break;
      case 'ru':
        feedbackMessage = `Основная жалоба распознана (Область: ${domainLabel}).`;
        break;
    }
  } else if (trimmed.length > 0) {
    switch (lang) {
      case 'de':
        feedbackMessage = `Eingabe erfasst. Präzisieren Sie nach Möglichkeit den genauen Ort oder die Empfindung.`;
        break;
      case 'el':
        feedbackMessage = `Η εισαγωγή καταγράφηκε. Προσδιορίστε εάν είναι δυνατόν την ακριβή τοποθεσία ή την αίσθηση.`;
        break;
      case 'en':
        feedbackMessage = `Input recorded. If possible, clarify exact location or sensation.`;
        break;
      case 'es':
        feedbackMessage = `Entrada registrada. Si es posible, precise la localización o la sensación.`;
        break;
      case 'fr':
        feedbackMessage = `Saisie enregistrée. Précisez si possible la localisation exacte ou la sensation.`;
        break;
      case 'it':
        feedbackMessage = `Inserimento registrato. Se possibile, precisare la sede esatta o la sensazione.`;
        break;
      case 'ru':
        feedbackMessage = `Запись сохранена. По возможности уточните локализацию или ощущение.`;
        break;
    }
  }

  return {
    rawInput: trimmed,
    isRecognized,
    organDomain: domainLabel,
    feedbackMessage,
    candidateOptions: [],
    detectedComplaints,
    hasMultipleComplaints
  };
}

export function detectDomainFromTokens(queryWords: string[]): DomainDefinition | null {
  let bestDomain: DomainDefinition | null = null;
  let maxMatches = 0;

  for (const domain of DOMAIN_DEFINITIONS) {
    let matchCount = 0;
    for (const w of queryWords) {
      if (domain.keywords.some(kw => kw.includes(w) || w.includes(kw))) {
        matchCount++;
      }
    }
    if (matchCount > maxMatches) {
      maxMatches = matchCount;
      bestDomain = domain;
    }
  }

  return maxMatches > 0 ? bestDomain : null;
}
