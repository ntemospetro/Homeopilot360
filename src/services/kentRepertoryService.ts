import { LanguageCode } from '../types';
import { Hahnemann6Pillars } from './hahnemannEngineService';

export interface KentRubricDefinition {
  id: string;
  chapter: string;
  rubricName: string; // Official Kent nomenclature e.g. "Generals - Cold - air, dry, agg."
  category: 'causa' | 'gemuet' | 'modalitaeten' | 'allgemein' | 'lokal';
  keywords: string[];
  remedyGrades: Record<string, 1 | 2 | 3>; // remedyKey -> 1, 2, or 3
}

export interface KentRubricMatch {
  id: string;
  chapter: string;
  rubricName: string;
  category: 'causa' | 'gemuet' | 'modalitaeten' | 'allgemein' | 'lokal';
  symptomOrigin: string;
  grades: Record<string, 0 | 1 | 2 | 3>;
}

export interface KentRemedySummary {
  key: string;
  latinName: string;
  shortName: string;
  hits: number;
  totalRubrics: number;
  totalScore: number;
  isSimile: boolean;
  gradesPerRubric: Record<string, 0 | 1 | 2 | 3>;
  materiaMedicaVerification: Record<LanguageCode, string>;
}

export interface KentRepertorisationMatrix {
  selectedSymptoms: Array<{
    category: 'causa' | 'gemuet' | 'modalitaeten' | 'allgemein' | 'lokal';
    text: string;
    rubricName: string;
  }>;
  rubrics: KentRubricMatch[];
  remedies: KentRemedySummary[];
  leadingSimile: KentRemedySummary | null;
  totalAnalyzedRubrics: number;
}

// Canonical Kent Repertory Rubrics with authentic Kent degrees (3=Bold, 2=Italic, 1=Plain)
// Strict adherence to J.T. Kent's Repertory of the Homeopathic Materia Medica
const CANONICAL_KENT_RUBRICS: KentRubricDefinition[] = [
  // 1. CAUSA & GENERALS
  {
    id: 'causa_cold_dry_wind',
    chapter: 'Generals',
    rubricName: 'GENERALS - COLD - air - dry, cold air agg.',
    category: 'causa',
    keywords: ['kalter wind', 'trockene kälte', 'ostwind', 'kaltem trockenem wind', 'trockener kälte', 'zugluft', 'cold dry wind', 'dry cold wind', 'viento frío y seco', 'vent froid et sec', 'vento freddo e secco', 'κρύο και ξηρό άνεμο', 'сухой холодный ветер'],
    remedyGrades: {
      acon: 3,
      bry: 2,
      hep: 3,
      caust: 2,
      nux_v: 2,
      bell: 1,
      rhus_t: 1,
      ars: 1,
      sil: 2,
    },
  },
  {
    id: 'causa_wet_getting',
    chapter: 'Generals',
    rubricName: 'GENERALS - WET - getting wet, agg.',
    category: 'causa',
    keywords: ['durchnässt', 'durchnässung', 'im regen', 'nass geworden', 'feuchte kälte', 'getting wet', 'drenched', 'mojado', 'mouillé', 'bagnato', 'βρέξιμο', 'промокание'],
    remedyGrades: {
      rhus_t: 3,
      dulc: 3,
      calc: 2,
      puls: 2,
      acon: 1,
      ant_c: 2,
      ars: 1,
    },
  },
  {
    id: 'causa_fright_shock',
    chapter: 'Mind',
    rubricName: 'MIND - FRIGHT - complaints from',
    category: 'causa',
    keywords: ['schreck', 'schock', 'plötzlicher schreck', 'trauma', 'fright', 'shock', 'susto', 'frayeur', 'spavento', 'τρομάρα', 'испуг'],
    remedyGrades: {
      acon: 3,
      ign: 3,
      op: 3,
      gels: 2,
      bell: 1,
      puls: 1,
      ars: 1,
      cham: 1,
    },
  },
  {
    id: 'causa_anger_vexation',
    chapter: 'Mind',
    rubricName: 'MIND - ANGER, vexation, ailments from',
    category: 'causa',
    keywords: ['ärger', 'wut', 'kränkung', 'zorn', 'anger', 'vexation', 'indignation', 'ira', 'colère', 'rabbia', 'θυμός', 'гнев', 'обида'],
    remedyGrades: {
      cham: 3,
      coloc: 3,
      staph: 3,
      nux_v: 3,
      bry: 2,
      acon: 1,
      ign: 2,
    },
  },
  {
    id: 'causa_heat_sun',
    chapter: 'Generals',
    rubricName: 'GENERALS - SUN - exposure to the sun, from',
    category: 'causa',
    keywords: ['sonnenstich', 'hitzschlag', 'sonnenhitze', 'sonnenexposition', 'sunstroke', 'heatstroke', 'exposure to sun', 'insolación', 'coup de soleil', 'colpo di sole', 'ηλίαση', 'солнечный удар'],
    remedyGrades: {
      glon: 3,
      bell: 3,
      nat_c: 3,
      gels: 2,
      bry: 1,
      acon: 1,
    },
  },
  {
    id: 'causa_injury_trauma',
    chapter: 'Generals',
    rubricName: 'GENERALS - INJURIES, blows, falls',
    category: 'causa',
    keywords: ['sturz', 'schlag', 'unfall', 'prellung', 'verletzung', 'blow', 'fall', 'injury', 'bruise', 'golpe', 'chute', 'trauma', 'τραύμα', 'травма', 'ушиб'],
    remedyGrades: {
      arn: 3,
      hyper: 3,
      rhus_t: 2,
      bry: 1,
      bell: 1,
    },
  },

  // 2. GEMÜT (MIND)
  {
    id: 'mind_fear_death',
    chapter: 'Mind',
    rubricName: 'MIND - FEAR - death, of',
    category: 'gemuet',
    keywords: ['todesangst', 'angst zu sterben', 'panik vor dem tod', 'fear of death', 'miedo a morir', 'peur de la mort', 'paura di morire', 'φόβος θανάτου', 'страх смерти'],
    remedyGrades: {
      acon: 3,
      ars: 3,
      bell: 1,
      calc: 2,
      nit_ac: 2,
      rhus_t: 1,
      gels: 1,
    },
  },
  {
    id: 'mind_restlessness',
    chapter: 'Mind',
    rubricName: 'MIND - RESTLESSNESS',
    category: 'gemuet',
    keywords: ['unruhe', 'rastlos', 'angstvolle unruhe', 'hin und her getrieben', 'körperliche unruhe', 'restlessness', 'restless', 'inquietud', 'agitation', 'irrequietezza', 'ανησυχία', 'беспокойство'],
    remedyGrades: {
      acon: 3,
      ars: 3,
      rhus_t: 3,
      bell: 2,
      cham: 2,
      merc: 1,
      bry: 1,
    },
  },
  {
    id: 'mind_irritability',
    chapter: 'Mind',
    rubricName: 'MIND - IRRITABILITY',
    category: 'gemuet',
    keywords: ['reizbar', 'zornig', 'will seine ruhe', 'ärgerlich', 'unleidlich', 'will in ruhe gelassen werden', 'irritability', 'irritable', 'irascible', 'irritabile', 'ευερεθιστότητα', 'раздражительность'],
    remedyGrades: {
      bry: 3,
      cham: 3,
      nux_v: 3,
      hep: 3,
      bell: 2,
      ars: 1,
      acon: 1,
    },
  },
  {
    id: 'mind_weeping_tearful',
    chapter: 'Mind',
    rubricName: 'MIND - WEEPING - tearful mood',
    category: 'gemuet',
    keywords: ['weinen', 'weinerlich', 'anhänglich', 'trostbedürftig', 'weinerliche stimmung', 'weeping', 'tearful', 'crying', 'llanto', 'pleurs', 'pianto', 'κλάμα', 'плаксивость'],
    remedyGrades: {
      puls: 3,
      ign: 2,
      nat_m: 2,
      sep: 2,
      rhus_t: 1,
      bell: 1,
    },
  },
  {
    id: 'mind_dullness_stupor',
    chapter: 'Mind',
    rubricName: 'MIND - DULLNESS, sluggishness',
    category: 'gemuet',
    keywords: ['benommen', 'schläfrig', 'dumpf', 'schwer', 'apathisch', 'dullness', 'sluggishness', 'drowsy', 'embotamiento', 'lourdeur', 'ottusita', 'λήθαργος', 'вялость', 'отупение'],
    remedyGrades: {
      gels: 3,
      bapt: 3,
      phos_ac: 3,
      bell: 2,
      op: 3,
      bry: 1,
      arn: 2,
    },
  },

  // 3. MODALITÄTEN (MODALITIES)
  {
    id: 'mod_motion_agg',
    chapter: 'Generals',
    rubricName: 'GENERALS - MOTION - agg.',
    category: 'modalitaeten',
    keywords: ['bewegung verschlimmert', 'bewegung schlechter', 'geringste bewegung verschlimmert', 'stillliegen', 'erschütterung verschlimmert', 'motion agg', 'movement worse', 'movimiento peor', 'mouvement aggrave', 'movimento peggiora', 'κίνηση επιδεινώνει', 'движение ухудшает'],
    remedyGrades: {
      bry: 3,
      bell: 2,
      colch: 2,
      arn: 1,
      acon: 1,
      hep: 1,
      ars: 1,
    },
  },
  {
    id: 'mod_motion_amel',
    chapter: 'Generals',
    rubricName: 'GENERALS - MOTION - continued motion amel.',
    category: 'modalitaeten',
    keywords: ['fortgesetzte bewegung bessert', 'bewegung bessert', 'bewegung besser', 'umhergehen bessert', 'lagewechsel bessert', 'motion amel', 'movement better', 'movimiento mejor', 'mouvement ameliore', 'movimento migliora', 'κίνηση βελτιώνει', 'движение улучшает'],
    remedyGrades: {
      rhus_t: 3,
      puls: 3,
      ferr: 2,
      ars: 1,
      acon: 1,
    },
  },
  {
    id: 'mod_rest_amel',
    chapter: 'Generals',
    rubricName: 'GENERALS - REST - amel.',
    category: 'modalitaeten',
    keywords: ['ruhe bessert', 'ruhe besser', 'absolute ruhe bessert', 'im bett ruhig liegen', 'rest amel', 'reposo mejora', 'repos améliore', 'riposo migliora', 'ηρεμία βελτιώνει', 'покой улучшает'],
    remedyGrades: {
      bry: 3,
      bell: 2,
      colch: 2,
      acon: 1,
      nux_v: 2,
      arn: 1,
    },
  },
  {
    id: 'mod_warmth_amel',
    chapter: 'Generals',
    rubricName: 'GENERALS - WARMTH - amel.',
    category: 'modalitaeten',
    keywords: ['wärme bessert', 'wärme besser', 'warm einpacken bessert', 'heiße anwendungen bessert', 'bettwärme bessert', 'warmth amel', 'heat relieves', 'calor mejora', 'chaleur améliore', 'calore migliora', 'ζέστη βελτιώνει', 'тепло улучшает'],
    remedyGrades: {
      ars: 3,
      hep: 3,
      rhus_t: 3,
      sil: 3,
      nux_v: 2,
      bell: 1,
      acon: 1,
    },
  },
  {
    id: 'mod_cold_amel',
    chapter: 'Generals',
    rubricName: 'GENERALS - COLD - applications, amel.',
    category: 'modalitaeten',
    keywords: ['kälte bessert', 'kälte besser', 'kalte umschläge bessert', 'frische luft bessert', 'entblößen bessert', 'cold amel', 'fresh air', 'frío mejora', 'froid améliore', 'freddo migliora', 'κρύο βελτιώνει', 'холод улучшает'],
    remedyGrades: {
      apis: 3,
      puls: 3,
      led: 3,
      sec: 2,
      bry: 2,
      acon: 1,
    },
  },
  {
    id: 'mod_pressure_amel',
    chapter: 'Generals',
    rubricName: 'GENERALS - PRESSURE - amel.',
    category: 'modalitaeten',
    keywords: ['druck bessert', 'druck besser', 'festes bandagieren bessert', 'auf schmerzhafter seite liegen bessert', 'pressure amel', 'presión mejora', 'pression améliore', 'pressione migliora', 'πίεση βελτιώνει', 'давление улучшает'],
    remedyGrades: {
      bry: 3,
      coloc: 3,
      mag_p: 3,
      bell: 2,
      puls: 1,
      sil: 2,
    },
  },
  {
    id: 'mod_night_agg',
    chapter: 'Generals',
    rubricName: 'GENERALS - NIGHT - agg.',
    category: 'modalitaeten',
    keywords: ['nacht verschlimmert', 'nachts schlechter', 'nach mitternacht schlechter', 'nachts schlimmer', 'night agg', 'midnight worse', 'noche peor', 'nuit aggrave', 'notte peggiora', 'νύχτα επιδεινώνει', 'ночь ухудшает'],
    remedyGrades: {
      ars: 3,
      merc: 3,
      rhus_t: 3,
      acon: 2,
      bell: 2,
      cham: 2,
      hep: 2,
    },
  },

  // 4. LOKALISATION, EMPFINDUNG & ALLGEMEINES
  {
    id: 'fever_heat_general',
    chapter: 'Fever',
    rubricName: 'FEVER - HEAT in general',
    category: 'allgemein',
    keywords: ['fieber', 'hohes fieber', 'erhöhte temperatur', 'fever', 'high fever', 'fièvre', 'fiebre', 'febbre', 'febbre alta', 'πυρετός', 'υψηλός πυρετός', 'жар', 'высокая температура', 'лихорадка'],
    remedyGrades: {
      acon: 3,
      bell: 3,
      bry: 3,
      ars: 3,
      rhus_t: 2,
      gels: 2,
      nux_v: 2,
      puls: 2,
      cham: 2,
      apis: 2,
      ferr_p: 2,
      chin: 2,
      arn: 2,
      hep: 2,
      merc: 2,
      phos: 2,
      sil: 2,
    },
  },
  {
    id: 'chill_general',
    chapter: 'Chill',
    rubricName: 'CHILL - CHILLINESS',
    category: 'allgemein',
    keywords: ['schüttelfrost', 'frösteln', 'frost', 'kältezittern', 'chill', 'chills', 'chilliness', 'frissons', 'escalofríos', 'brividi', 'ρίγος', 'озноб'],
    remedyGrades: {
      acon: 3,
      ars: 3,
      nux_v: 3,
      gels: 3,
      bry: 2,
      puls: 2,
      chin: 3,
      rhus_t: 2,
      bell: 1,
      cham: 1,
      hep: 2,
      sil: 2,
    },
  },
  {
    id: 'head_pain_general',
    chapter: 'Head',
    rubricName: 'HEAD - PAIN, in general',
    category: 'lokal',
    keywords: ['kopfschmerz', 'kopfweh', 'kopfschmerzen', 'stirnkopfschmerz', 'headache', 'head pain', 'maux de tête', 'mal de tête', 'dolor de cabeza', 'mal di testa', 'πονοκέφαλος', 'головная боль'],
    remedyGrades: {
      bell: 3,
      bry: 3,
      gels: 3,
      nux_v: 3,
      glon: 3,
      acon: 2,
      puls: 2,
      ars: 2,
      rhus_t: 2,
      sil: 2,
      chin: 2,
      merc: 2,
      spig: 3,
    },
  },
  {
    id: 'head_throbbing_pain',
    chapter: 'Head',
    rubricName: 'HEAD - PAIN - pulsating',
    category: 'lokal',
    keywords: ['pochender kopfschmerz', 'hämmernder kopfschmerz', 'pulsierender kopfschmerz', 'klopfen im kopf', 'throbbing headache', 'pulsating headache', 'dolor pulsátil de cabeza', 'maux de tête battants', 'mal di testa pulsante', 'σφυγμικός πονοκέφαλος', 'пульсирующая головная боль'],
    remedyGrades: {
      bell: 3,
      glon: 3,
      acon: 2,
      bry: 2,
      gels: 2,
      ars: 1,
      nux_v: 1,
    },
  },
  {
    id: 'throat_pain_swallowing',
    chapter: 'Throat',
    rubricName: 'THROAT - PAIN - swallowing, on',
    category: 'lokal',
    keywords: ['halsschmerz', 'halsweh', 'schluckbeschwerden', 'schmerzen beim schlucken', 'sore throat', 'throat pain on swallowing', 'mal de gorge', 'douleur en avalant', 'dolor de garganta', 'mal di gola', 'πονόλαιμος', 'πόνος στην κατάποση', 'боль в горле', 'боль при глотании'],
    remedyGrades: {
      bell: 3,
      hep: 3,
      merc: 3,
      apis: 3,
      lach: 3,
      acon: 2,
      phyt: 3,
      bry: 1,
      nux_v: 1,
    },
  },
  {
    id: 'cough_dry',
    chapter: 'Cough',
    rubricName: 'COUGH - DRY',
    category: 'lokal',
    keywords: ['trockener husten', 'reizhusten', 'trockenem husten', 'hustenanfall', 'dry cough', 'cough dry', 'toux sèche', 'tos seca', 'tosse secca', 'ξηρός βήχας', 'сухой кашель'],
    remedyGrades: {
      acon: 3,
      bell: 3,
      bry: 3,
      spong: 3,
      dros: 3,
      hep: 2,
      phos: 3,
      rumx: 3,
      nux_v: 2,
      puls: 1,
    },
  },
  {
    id: 'abdomen_pain_cramping',
    chapter: 'Abdomen',
    rubricName: 'ABDOMEN - PAIN - cramping, griping',
    category: 'lokal',
    keywords: ['bauchschmerz', 'bauchkrämpfe', 'magenkrämpfe', 'kolik', 'bauchkolik', 'cramping abdominal pain', 'stomach cramps', 'colic', 'dolor abdominal espasmódico', 'maux de ventre spasmodiques', 'crampi addominali', 'κοιλιακοί σπασμοί', 'спазмы в животе', 'колики'],
    remedyGrades: {
      coloc: 3,
      mag_p: 3,
      nux_v: 3,
      bell: 2,
      cham: 2,
      bry: 2,
      ars: 2,
      puls: 2,
    },
  },
  {
    id: 'stitching_pain',
    chapter: 'Generals',
    rubricName: 'GENERALS - PAIN - stitching, internally',
    category: 'lokal',
    keywords: ['stechende schmerzen', 'stechender schmerz', 'stiche wie nadeln', 'stitching pain', 'dolor punzante', 'douleur piquante', 'dolore pungente', 'σουβλιά', 'колющая боль'],
    remedyGrades: {
      bry: 3,
      kali_c: 3,
      apis: 3,
      bell: 2,
      acon: 1,
      spig: 2,
      hep: 2,
    },
  },
  {
    id: 'burning_pain_amel_heat',
    chapter: 'Generals',
    rubricName: 'GENERALS - PAIN - burning - heat amel.',
    category: 'allgemein',
    keywords: ['brennende schmerzen durch wärme gebessert', 'brennender schmerz wärme bessert', 'wie glühende kohlen wärme lindert', 'burning pain heat amel', 'dolor ardiente que mejora con calor', 'douleur brûlante améliorée par la chaleur', 'жгучая боль облегчается теплом'],
    remedyGrades: {
      ars: 3,
      rhus_t: 2,
      acon: 1,
      phos: 2,
      bell: 1,
    },
  },
  {
    id: 'stinging_burning_heat_agg',
    chapter: 'Generals',
    rubricName: 'GENERALS - PAIN - stinging - heat agg.',
    category: 'allgemein',
    keywords: ['stechend brennende schmerzen durch hitze verschlimmert', 'bienenstichartige schmerzen', 'stinging pain heat agg', 'dolor picante que empeora con calor', 'douleur piquante aggravée par la chaleur', 'колюще-жгучая боль от тепла хуже'],
    remedyGrades: {
      apis: 3,
      led: 2,
      puls: 1,
    },
  },
  {
    id: 'thirst_extreme_large_qty',
    chapter: 'Stomach',
    rubricName: 'STOMACH - THIRST - large quantities, for',
    category: 'allgemein',
    keywords: ['großer durst auf viel wasser', 'große mengen auf einmal', 'unstillbarer durst', 'thirst large quantities', 'sed de grandes cantidades', 'soif de grandes quantités', 'sete di grandi quantità', 'δίψα για μεγάλες ποσότητες', 'жажда большими глотками'],
    remedyGrades: {
      bry: 3,
      acon: 2,
      nat_m: 2,
      verat: 3,
      ars: 1,
      bell: 1,
    },
  },
  {
    id: 'thirst_small_quantities_often',
    chapter: 'Stomach',
    rubricName: 'STOMACH - THIRST - small quantities, for - often',
    category: 'allgemein',
    keywords: ['häufig kleine mengen trinken', 'schluckweise trinken', 'häufig kleine schlucke', 'thirst small quantities often', 'sed de pequeños sorbos frecuentes', 'soif de petites quantités souvent', 'sete a piccoli sorsi frequenti', 'δίψα για μικρές συχνές γουλιές', 'жажда часто маленькими глотками'],
    remedyGrades: {
      ars: 3,
      chin: 2,
      bell: 1,
      acon: 1,
    },
  },
  {
    id: 'thirstless_heat',
    chapter: 'Stomach',
    rubricName: 'STOMACH - THIRSTLESSNESS',
    category: 'allgemein',
    keywords: ['völlige durstlosigkeit', 'durstlos', 'kein durst', 'kein verlangen nach wasser', 'thirstlessness', 'thirstless', 'sin sed', 'sans soif', 'senza sete', 'ανδίψα', 'отсутствие жажды'],
    remedyGrades: {
      apis: 3,
      puls: 3,
      gels: 2,
      bell: 1,
    },
  },
  {
    id: 'fever_dry_heat_red_face',
    chapter: 'Fever',
    rubricName: 'FEVER - HEAT - dry heat',
    category: 'allgemein',
    keywords: ['trockene hitze', 'trockenes fieber', 'glühende haut ohne schweiß', 'dry heat', 'calor seco', 'chaleur sèche', 'calore secco', 'ξηρή θερμότητα', 'сухой жар'],
    remedyGrades: {
      bell: 3,
      acon: 3,
      ferr_p: 2,
      bry: 1,
      gels: 1,
    },
  },
];

export const REMEDY_METADATA: Record<
  string,
  {
    latinName: string;
    shortName: string;
    materiaMedicaVerification: Record<LanguageCode, string>;
  }
> = {
  acon: {
    latinName: 'Aconitum napellus',
    shortName: 'Acon.',
    materiaMedicaVerification: {
      de: 'Aconitum napellus deckt die Gesamtheit der §§ 83–104 Leitsymptome nach Hahnemann und Kent am exaktesten ab: Plötzlicher Beginn nach kaltem, trockenem Wind, panische Angst & Todesangst (Grad 3), heftige motorische Unruhe (Grad 3) sowie stürmische, trockene Hitze ohne Schweiß. Nach § 153 stimmen Causa, Gemüt und Modalität lückenlos überein.',
      en: 'Aconitum napellus covers the totality of the §§ 83–104 keynote symptoms according to Hahnemann and Kent with highest precision: Sudden onset following exposure to cold, dry wind, panic & fear of death (Grade 3), violent physical restlessness (Grade 3), and tempestuous dry heat without perspiration.',
      es: 'Aconitum napellus cubre la totalidad de los síntomas clave de los §§ 83–104 según Hahnemann y Kent con la más estricta precisión: Inicio súbito tras viento frío y seco, pánico y miedo a la muerte (Grado 3), extrema inquietud física (Grado 3) y calor seco y ardiente sin sudor.',
      fr: 'Aconitum napellus couvre avec la plus grande exactitude la totalité des symptômes clés (§§ 83–104) selon Hahnemann et Kent : Début soudain après exposition au vent froid et sec, angoisse panique et peur de la mort (Degré 3), vive agitation physique (Degré 3) et fièvre sèche brûlante.',
      it: 'Aconitum napellus copre con la massima precisione la totalità dei sintomi guida dei §§ 83–104 secondo Hahnemann e Kent: Esordio improvviso dopo vento freddo e asciutto, angoscia e paura della morte (Grado 3), irrequietezza motoria marcata (Grado 3) e calore secco senza sudore.',
      el: 'Το Aconitum napellus καλύπτει με τη μέγιστη ακρίβεια το σύνολο των συμπτωμάτων-κλειδιών των §§ 83–104: Ξαφνική έναρξη μετά από έκθεση σε κρύο ξηρό αέρα, πανικός και φόβος θανάτου (Βαθμός 3), έντονη κινητική ανησυχία (Βαθμός 3) και καυτός ξηρός πυρετός χωρίς ίδρωτα.',
      ru: 'Aconitum napellus максимально точно покрывает совокупность ключевых симптомов §§ 83–104 по Ганеману и Кенту: Внезапное бурное начало после сухого холодного ветра, панический страх смерти (Степень 3), выраженное двигательное беспокойство (Степень 3) и сухой жар без пота.',
    },
  },
  bell: {
    latinName: 'Belladonna',
    shortName: 'Bell.',
    materiaMedicaVerification: {
      de: 'Belladonna ist durch plötzliche, heftige Kongestion zum Kopf charakterisiert: Glühend rote, heiße Haut, weitgestellte Pupillen, hämmernd-pulsierende Schmerzen (Grad 3), Verschlimmerung durch geringste Erschütterung oder Licht. Gemüt: Delirant oder erregt, Durst variabel.',
      en: 'Belladonna is characterized by sudden, violent cerebral congestion: Red hot face, dilated pupils, throbbing pulsating pains (Grade 3), aggravated by least jar or light. Mind: Excitable or delirious.',
      es: 'Belladonna se caracteriza por congestión súbita y violenta en la cabeza: Cara roja y ardiente, pupilas dilatadas, dolores pulsátiles y martilleantes (Grado 3), agravación por sacudida o luz.',
      fr: 'Belladonna est caractérisée par une congestion céphalique violente et subite : Visage rouge et brûlant, pupilles dilatées, douleurs battantes et pulsatiles (Degré 3), aggravation par la moindre secousse.',
      it: 'Belladonna è caratterizzata da congestione improvvisa e violenta: Volto rosso e ardente, pupille dilatate, dolori martellanti e pulsanti (Grado 3), peggioramento con la minima scossa.',
      el: 'Η Belladonna χαρακτηρίζεται από ξαφνική αιφνίδια συμφόρηση στην κεφαλή: Κόκκινο καυτό πρόσωπο, διεσταλμένες κόρες, σφυγμικός παλλόμενος πόνος (Βαθμός 3), επιδείνωση με την ελάχιστη δόνηση.',
      ru: 'Belladonna характеризуется внезапным бурным приливом крови к голове: Горячее красное лицо, расширенные зрачки, пульсирующая стучащая боль (Степень 3), ухудшение от малейшего сотрясения.',
    },
  },
  bry: {
    latinName: 'Bryonia alba',
    shortName: 'Bry.',
    materiaMedicaVerification: {
      de: 'Bryonia alba passt vollkommen bei absoluter Verschlimmerung durch jede geringste Bewegung (Grad 3), Besserung durch vollkommene Ruhe und festen Druck auf die schmerzhafte Stelle (Grad 3). Großes Verlangen nach reichlich kaltem Wasser (Grad 3) und Reizbarkeit (Grad 3).',
      en: 'Bryonia alba corresponds strictly to absolute aggravation from the least motion (Grade 3), amelioration from absolute rest and firm pressure (Grade 3), excessive thirst for large quantities of cold water (Grade 3), and irritable mood (Grade 3).',
      es: 'Bryonia alba corresponde a la agravación absoluta por el más mínimo movimiento (Grado 3), mejoría por reposo absoluto y presión firme (Grado 3), gran sed de grandes cantidades de agua fría (Grado 3) e irritabilidad (Grado 3).',
      fr: 'Bryonia alba correspond à l\'aggravation absolue par le moindre mouvement (Degré 3), amélioration par le repos absolu et la pression forte (Degré 3), soif intense de grandes quantités d\'eau froide (Degré 3).',
      it: 'Bryonia alba si distingue per il netto peggioramento con il minimo movimento (Grado 3), miglioramento con il riposo assoluto e forte pressione (Grado 3), grande sete di abbondante acqua fredda (Grado 3).',
      el: 'Η Bryonia alba αντιστοιχεί στην απόλυτη επιδείνωση με την παραμικρή κίνηση (Βαθμός 3), βελτίωση με την απόλυτη ηρεμία και πίεση (Βαθμός 3), άσβεστη δίψα για μεγάλες ποσότητες κρύου νερού (Βαθμός 3).',
      ru: 'Bryonia alba строго соответствует абсолютному ухудшению от малейшего движения (Степень 3), улучшению в полном покое и от сильного давления (Степень 3), сильной жажде большими объемами (Степень 3).',
    },
  },
  ars: {
    latinName: 'Arsenicum album',
    shortName: 'Ars.',
    materiaMedicaVerification: {
      de: 'Arsenicum album deckt quälende Todesangst (Grad 3) mit extremer Erschöpfung und Ruhelosigkeit ab (Patient wandert trotz Schwäche von Bett zu Bett). Brennende Schmerzen, die paradoxerweise durch Wärme gebessert werden (Grad 3), Durst auf häufige kleine Schlucke (Grad 3). Verschlimmerung nachts (1–2 Uhr).',
      en: 'Arsenicum album covers agonizing fear of death (Grade 3) with extreme exhaustion and restlessness (Grade 3), burning pains ameliorated by heat (Grade 3), and thirst for small sips frequently (Grade 3). Night aggravation (1–2 AM).',
      es: 'Arsenicum album cubre la angustia de muerte (Grado 3) con extrema postración e inquietud (Grado 3), dolores ardientes mejorados por el calor (Grado 3) y sed de pequeños sorbos frecuentes (Grado 3).',
      fr: 'Arsenicum album couvre l\'angoisse de mort (Degré 3) avec épuisement et agitation motrice (Degré 3), douleurs brûlantes soulagées par la chaleur (Degré 3) et soif de petites gorgées fréquentes (Degré 3).',
      it: 'Arsenicum album copre l\'angoscia di morte (Grado 3) con estrema debolezza e irrequietezza (Grado 3), dolori brucianti migliorati dal calore (Grado 3) e sete a piccoli sorsi frequenti (Grado 3).',
      el: 'Το Arsenicum album καλύπτει αγωνιώδη φόβο θανάτου (Βαθμός 3) με εξάντληση και ανησυχία (Βαθμός 3), καυστικούς πόνους που βελτιώνονται με τη ζέστη (Βαθμός 3) και δίψα για συχνές μικρές γουλιές (Βαθμός 3).',
      ru: 'Arsenicum album покрывает мучительный страх смерти (Степень 3) с упадком сил и двигательным беспокойством (Степень 3), жгучие боли, облегчаемые теплом (Степень 3), и жажду частыми мелкими глотками (Степень 3).',
    },
  },
  rhus_t: {
    latinName: 'Rhus toxicodendron',
    shortName: 'Rhus-t.',
    materiaMedicaVerification: {
      de: 'Rhus toxicodendron entspricht Beschwerden nach Durchnässung oder Verkühlung in feuchter Kälte (Grad 3). Typische Dreiecks-Modalität: Verschlimmerung zu Beginn der Bewegung und in Ruhe (Grad 3), deutliche Besserung durch fortgesetzte Bewegung und Wärme (Grad 3). Ständige motorische Unruhe.',
      en: 'Rhus toxicodendron matches ailments from getting wet or cold damp exposure (Grade 3). Classic modality: Aggravation on first motion and at rest (Grade 3), marked relief from continued motion and warmth (Grade 3). Restlessness.',
      es: 'Rhus toxicodendron responde a trastornos tras mojarse o frío húmedo (Grado 3). Modalidad clave: Agravación al inicio del movimiento y en reposo (Grado 3), mejoría por movimiento continuado y calor (Grado 3).',
      fr: 'Rhus toxicodendron correspond aux suites d\'exposition au froid humide ou pluie (Degré 3). Aggravation au début du mouvement et au repos (Degré 3), nette amélioration par le mouvement continu et la chaleur (Degré 3).',
      it: 'Rhus toxicodendron risponde a disturbi dopo essersi bagnati o per freddo umido (Grado 3). Aggravamento all\'inizio del movimento e a riposo (Grado 3), sollievo con il movimento continuo e calore (Grado 3).',
      el: 'Το Rhus toxicodendron ανταποκρίνεται σε παθήσεις μετά από βρέξιμο ή υγρό κρύο (Βαθμός 3). Επιδείνωση στην αρχή της κίνησης και στην ηρεμία, ανακούφιση με τη συνεχή κίνηση και τη ζέστη (Βαθμός 3).',
      ru: 'Rhus toxicodendron показан при последствиях промокания или сырого холода (Степень 3). Ухудшение в начале движения и в покое (Степень 3), явное улучшение от продолжающегося движения и тепла (Степень 3).',
    },
  },
  puls: {
    latinName: 'Pulsatilla pratensis',
    shortName: 'Puls.',
    materiaMedicaVerification: {
      de: 'Pulsatilla pratensis ist das Leitmittel für sanfte, weinerliche Gemüter mit großem Verlangen nach Trost und frischer Luft (Grad 3). Durstlosigkeit selbst bei Hitze (Grad 3), Verschlimmerung in warmen, geschlossenen Räumen, Besserung durch langsame Bewegung im Freien (Grad 3).',
      en: 'Pulsatilla pratensis is the keynote for gentle, tearful mood seeking consolation and open fresh air (Grade 3). Complete thirstlessness even with heat (Grade 3), aggravated in warm stuffy rooms, amel. by slow motion in open air (Grade 3).',
      es: 'Pulsatilla pratensis es el remedio clave para temperamentos suaves y llorosos que buscan consuelo y aire libre (Grado 3). Ausencia de sed incluso con calor (Grado 3), agravación en habitaciones calientes.',
      fr: 'Pulsatilla pratensis est le remède clé pour l\'humeur douce et pleureuse demandant consolation et grand air frais (Degré 3). Absence de soif (Degré 3), aggravation en chambre chaude.',
      it: 'Pulsatilla pratensis è il rimedio chiave per soggetti dolci e piangenti che cercano consolazione e aria fresca (Grado 3). Assenza di sete anche con la febbre (Grado 3), peggioramento nelle stanze calde.',
      el: 'Η Pulsatilla pratensis είναι το κύριο φάρμακο για ήπια κλαψιάρικη διάθεση που αναζητά παρηγοριά και καθαρό αέρα (Βαθμός 3). Απουσία δίψας (Βαθμός 3), επιδείνωση σε ζεστούς κλειστούς χώρους.',
      ru: 'Pulsatilla pratensis показана мягким, плаксивым пациентам, ищущим утешения и свежего воздуха (Степень 3). Полная жажда (Степень 3), ухудшение в теплых душных комнатах, облегчение на воздухе.',
    },
  },
  gels: {
    latinName: 'Gelsemium sempervirens',
    shortName: 'Gels.',
    materiaMedicaVerification: {
      de: 'Gelsemium sempervirens steht für dumpfe Benommenheit, schwere Augenlider, zittrige Schwäche und Apathie (Grad 3). Völlige Durstlosigkeit (Grad 2), langsamer, schleichender Beginn eines Infekts oder Folge von Lampenfieber und Erwartungsangst.',
      en: 'Gelsemium sempervirens stands for dull stupor, heavy eyelids, trembling muscular weakness, and apathy (Grade 3). Total thirstlessness (Grade 2), slow insidious onset or ailments from anticipation/bad news.',
      es: 'Gelsemium sempervirens destaca por embotamiento, párpados pesados, debilidad temblorosa y apatía (Grado 3). Ausencia de sed (Grado 2), inicio lento e insidioso o secuelas de ansiedad de anticipación.',
      fr: 'Gelsemium sempervirens est marqué par la somnolence, paupières lourdes, tremblements, faiblesse et apathie (Degré 3). Absence totale de soif (Degré 2), début progressif.',
      it: 'Gelsemium sempervirens si distingue per ottusità, palpebre pesanti, tremore e debolezza muscolare (Grado 3). Assenza totale di sete (Grado 2), esordio graduale.',
      el: 'Το Gelsemium sempervirens υποδεικνύεται από βαρύτητα στα βλέφαρα, υπνηλία, τρέμουλο, αδυναμία και απάθεια (Βαθμός 3). Πλήρης απουσία δίψας (Βαθμός 2), αργή σταδιακή έναρξη.',
      ru: 'Gelsemium sempervirens характеризуется отупением, тяжестью век, дрожательной слабостью и апатией (Степень 3). Полное отсутствие жажды (Степень 2), медленное постепенное начало.',
    },
  },
  apis: {
    latinName: 'Apis mellifica',
    shortName: 'Apis',
    materiaMedicaVerification: {
      de: 'Apis mellifica deckt stechend-brennende Schmerzen wie von Bienenstichen ab, die sich durch Hitze dramatisch verschlimmern und durch eiskalte Umschläge gebessert werden (Grad 3). Ödematöse Schwellungen, Durstlosigkeit bei Hitze (Grad 3).',
      en: 'Apis mellifica covers stinging burning pains like bee stings, severely aggravated by heat and relieved by ice-cold applications (Grade 3). Rosy oedema, complete thirstlessness with heat (Grade 3).',
      es: 'Apis mellifica cubre dolores ardientes y punzantes como picaduras de abeja, agravados fuertemente por el calor y aliviados por aplicaciones heladas (Grado 3). Ausencia de sed (Grado 3).',
      fr: 'Apis mellifica couvre les douleurs piquantes et brûlantes comme des piqûres d\'abeille, fortement aggravées par la chaleur et améliorées par les compresses froides (Degré 3). Absence de soif (Degré 3).',
      it: 'Apis mellifica copre dolori pungenti e brucianti come punture d\'ape, peggiorati dal calore e migliorati da impacchi freddissimi (Grado 3). Gonfiore edematoso, assenza di sete (Grado 3).',
      el: 'Το Apis mellifica καλύπτει σουβλιστούς καυστικούς πόνους σαν τσιμπήματα μέλισσας, έντονη επιδείνωση με τη ζέστη και ανακούφιση με παγωμένα επιθέματα (Βαθμός 3). Ανδίψα (Βαθμός 3).',
      ru: 'Apis mellifica покрывает колюще-жгучие боли как от укуса пчелы, резкое ухудшение от тепла и облегчение от ледяных компрессов (Степень 3). Отечность, полное отсутствие жажды (Степень 3).',
    },
  },
  nux_v: {
    latinName: 'Nux vomica',
    shortName: 'Nux-v.',
    materiaMedicaVerification: {
      de: 'Nux vomica passt bei überreizten, zornigen Patienten (Grad 3), oft nach Überarbeitung, Stress, Genussmitteln oder Kälte. Extreme Kälteempfindlichkeit: Frösteln bei geringster Entblößung oder Bewegung im Bett (Grad 2). Besserung durch Wärme und Ruhe.',
      en: 'Nux vomica suits irritable, impatient, angry patients (Grade 3), often after overwork, stress, or cold. Extreme sensitivity to cold air: Chilly from the least uncovering (Grade 2). Ameliorated by warmth.',
      es: 'Nux vomica corresponde a pacientes hiperirritables, impacientes y coléricos (Grado 3), friolentos al mínimo destape (Grado 2). Mejoría por calor y descanso.',
      fr: 'Nux vomica convient aux patients irritables, colériques et hypersensibles (Degré 3), très frileux dès le moindre découvert (Degré 2). Amélioration par la chaleur.',
      it: 'Nux vomica si adatta a pazienti iperattivi, collerici e intolleranti (Grado 3), freddolosi al minimo scoprirsi (Grado 2). Miglioramento con il calore.',
      el: 'Το Nux vomica ταιριάζει σε υπερευερέθιστους, θυμωμένους ασθενείς (Βαθμός 3), έντονη ριγοφοβία με το παραμικρό ξεσκέπασμα (Βαθμός 2). Ανακούφιση με τη ζέστη.',
      ru: 'Nux vomica подходит раздражительным, гневливым пациентам (Степень 3), зябким при малейшем раскрывании (Степень 2). Облегчение от тепла и покоя.',
    },
  },
  cham: {
    latinName: 'Chamomilla',
    shortName: 'Cham.',
    materiaMedicaVerification: {
      de: 'Chamomilla zeichnet sich durch unerträgliche Schmerzüberempfindlichkeit und zornige, streitsüchtige Erregung aus (Grad 3). Schmerzen treiben zur Verzweiflung. Eine Wange rot und heiß, die andere blass.',
      en: 'Chamomilla is distinguished by intolerable pain hypersensitivity and angry, irritable distress (Grade 3). Pains drive to despair. One cheek red and hot, the other pale.',
      es: 'Chamomilla se distingue por hipersensibilidad intolerable al dolor y agitación colérica (Grado 3). Los dolores desesperan al paciente.',
      fr: 'Chamomilla se distingue par une intolérance totale à la douleur et une humeur irritable et coléreuse (Degré 3). Douleurs rendant fou.',
      it: 'Chamomilla è caratterizzata da intolleranza estrema al dolore e irrequietezza collerica (Grado 3). Dolori disperanti.',
      el: 'Η Chamomilla ξεχωρίζει από αφόρητη υπερευαισθησία στον πόνο και οργισμένη ευερεθιστότητα (Βαθμός 3). Το ένα μάγουλο κόκκινο, το άλλο χλωμό.',
      ru: 'Chamomilla отличается невыносимой сверхчувствительностью к боли и сердитым, капризным беспокойством (Степень 3). Боли доводят до отчаяния.',
    },
  },
};

/**
 * Performs strict Kent Mathematical Repertorisation based on § 153 Organon.
 * Extracts ONLY documented symptoms from the 6-pillars Hahnemann matrix (or acute text).
 * Does not hallucinate or invent non-existent rubrics.
 */
export function performKentMathematicalRepertorisation(
  matrix: Hahnemann6Pillars | null,
  rawAcuteText: string = '',
  _language: LanguageCode = 'de'
): KentRepertorisationMatrix {
  const selectedRubricMatches: KentRubricMatch[] = [];
  const selectedSymptomsList: Array<{
    category: 'causa' | 'gemuet' | 'modalitaeten' | 'allgemein' | 'lokal';
    text: string;
    rubricName: string;
  }> = [];

  const matchedRubricIds = new Set<string>();

  // Helper to check if text is empty or a mere placeholder
  const isPlaceholderOrEmpty = (str: string): boolean => {
    if (!str) return true;
    const trimmed = str.trim().toLowerCase();
    if (trimmed.length === 0) return true;
    const placeholders = [
      'unbekannt', 'nicht angegeben', 'noch nicht genannt', 'nicht genannt',
      'noch unklar', 'bitte erfragen', 'keine angabe', 'keine', 'kein',
      'ohne befund', 'ohne', 'nichts', 'unknown', 'none', 'n/a', 'not specified',
      'sin datos', 'desconocido', 'ninguno', 'inconnu', 'non spécifié', 'aucun',
      'sconosciuto', 'nessuno', 'άγνωστο', 'κανένα', 'неизвестно', 'нет данных'
    ];
    return placeholders.some((p) => trimmed === p || trimmed.startsWith(p + ' ') || trimmed.endsWith(' ' + p));
  };

  // Helper to match text against rubric keywords respecting strict Hahnemann categories
  const evaluateTextForRubric = (
    text: string,
    targetCategory: 'causa' | 'gemuet' | 'modalitaeten' | 'allgemein' | 'lokal'
  ) => {
    if (isPlaceholderOrEmpty(text)) return;
    const lower = text.toLowerCase();

    for (const rubricDef of CANONICAL_KENT_RUBRICS) {
      if (matchedRubricIds.has(rubricDef.id)) continue;

      // Category strictness filter:
      // Causa text only matches Causa rubrics; Gemüt only matches Gemüt; Modalitäten only matches Modalitäten
      if (targetCategory === 'causa' && rubricDef.category !== 'causa') continue;
      if (targetCategory === 'gemuet' && rubricDef.category !== 'gemuet') continue;
      if (targetCategory === 'modalitaeten' && rubricDef.category !== 'modalitaeten') continue;
      if ((targetCategory === 'lokal' || targetCategory === 'allgemein') &&
          (rubricDef.category === 'causa' || rubricDef.category === 'gemuet' || rubricDef.category === 'modalitaeten')) {
        continue;
      }

      // Check if keyword matches
      const hasKeyword = rubricDef.keywords.some((kw) => lower.includes(kw.toLowerCase()));
      if (hasKeyword) {
        matchedRubricIds.add(rubricDef.id);

        const gradesObj: Record<string, 0 | 1 | 2 | 3> = {};
        for (const remKey of Object.keys(REMEDY_METADATA)) {
          gradesObj[remKey] = rubricDef.remedyGrades[remKey] || 0;
        }

        selectedRubricMatches.push({
          id: rubricDef.id,
          chapter: rubricDef.chapter,
          rubricName: rubricDef.rubricName,
          category: rubricDef.category,
          symptomOrigin: text.trim(),
          grades: gradesObj,
        });

        selectedSymptomsList.push({
          category: rubricDef.category,
          text: text.trim(),
          rubricName: rubricDef.rubricName,
        });
      }
    }
  };

  // Rule 1 (§§ 83–84 & § 153): Select ONLY from documented Hahnemann 6-pillars
  if (matrix) {
    if (matrix.causa) {
      evaluateTextForRubric(matrix.causa, 'causa');
    }
    if (matrix.gemuet) {
      evaluateTextForRubric(matrix.gemuet, 'gemuet');
    }
    if (matrix.modalitaeten) {
      evaluateTextForRubric(matrix.modalitaeten, 'modalitaeten');
    }
    if (matrix.empfindung) {
      evaluateTextForRubric(matrix.empfindung, 'lokal');
    }
    if (matrix.lokalisierung) {
      evaluateTextForRubric(matrix.lokalisierung, 'lokal');
    }
    if (matrix.begleitsymptome && matrix.begleitsymptome.length > 0) {
      matrix.begleitsymptome.forEach((bg) => evaluateTextForRubric(bg, 'allgemein'));
    }
  }

  // Fallback if matrix was sparse but raw text exists (evaluate general/local symptoms explicitly stated by patient)
  if (selectedRubricMatches.length < 2 && rawAcuteText && !isPlaceholderOrEmpty(rawAcuteText)) {
    evaluateTextForRubric(rawAcuteText, 'allgemein');
  }

  // NOTE: In strict accordance with Organon §§ 83–84 (strict prohibition of interpretation & hallucination),
  // we do NOT inject any artificial default sample rubrics. If the patient has not named matching symptoms,
  // the repertorisation matrix remains strictly empty until explicit symptoms are recorded.

  // Calculate scores for each candidate remedy across all matched rubrics
  const candidateScores: KentRemedySummary[] = [];

  for (const [remKey, meta] of Object.entries(REMEDY_METADATA)) {
    let hits = 0;
    let totalScore = 0;
    const gradesPerRubric: Record<string, 0 | 1 | 2 | 3> = {};

    for (const rubric of selectedRubricMatches) {
      const grade = rubric.grades[remKey] || 0;
      gradesPerRubric[rubric.id] = grade;
      if (grade > 0) {
        hits += 1;
        totalScore += grade;
      }
    }

    // Only include remedies with at least 1 hit
    if (hits > 0) {
      candidateScores.push({
        key: remKey,
        latinName: meta.latinName,
        shortName: meta.shortName,
        hits,
        totalRubrics: selectedRubricMatches.length,
        totalScore,
        isSimile: false,
        gradesPerRubric,
        materiaMedicaVerification: meta.materiaMedicaVerification,
      });
    }
  }

  // Sort candidates by total score descending, then by hits descending
  candidateScores.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return b.hits - a.hits;
  });

  // Pick leading candidates (Top 5-6)
  const topRemedies = candidateScores.slice(0, 6);

  // Mark the leading Simile (#1)
  if (topRemedies.length > 0) {
    topRemedies[0].isSimile = true;
  }

  const leadingSimile = topRemedies.length > 0 ? topRemedies[0] : null;

  return {
    selectedSymptoms: selectedSymptomsList,
    rubrics: selectedRubricMatches,
    remedies: topRemedies,
    leadingSimile,
    totalAnalyzedRubrics: selectedRubricMatches.length,
  };
}
