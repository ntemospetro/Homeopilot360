import { LanguageCode, AnamnesisQuestion } from '../types';

export const SCALE_LABELS: Record<LanguageCode, Record<number, string>> = {
  de: {
    1: '1 (Normal / Leicht)',
    2: '2 (Mäßig)',
    3: '3 (Stark)',
    4: '4 (Extrem / Unerträglich)',
  },
  en: {
    1: '1 (Normal / Mild)',
    2: '2 (Moderate)',
    3: '3 (Strong)',
    4: '4 (Extreme / Unbearable)',
  },
  es: {
    1: '1 (Normal / Leve)',
    2: '2 (Moderado)',
    3: '3 (Fuerte)',
    4: '4 (Extremo / Insoportable)',
  },
  fr: {
    1: '1 (Normal / Léger)',
    2: '2 (Modéré)',
    3: '3 (Fort)',
    4: '4 (Extrême / Insupportable)',
  },
  it: {
    1: '1 (Normale / Lieve)',
    2: '2 (Moderato)',
    3: '3 (Forte)',
    4: '4 (Estremo / Insopportabile)',
  },
  el: {
    1: '1 (Φυσιολογικό / Ήπιο)',
    2: '2 (Μέτριο)',
    3: '3 (Έντονο)',
    4: '4 (Εξαιρετικά έντονο / Ανυπόφορο)',
  },
  ru: {
    1: '1 (Нормально / Легко)',
    2: '2 (Умеренно)',
    3: '3 (Сильно)',
    4: '4 (Экстремально / Невыносимо)',
  }
};

export const ARCHETYPE_TITLES: Record<string, Record<LanguageCode, string>> = {
  kopfschmerz: {
    de: 'Kopfschmerzen & Migräne',
    en: 'Headaches & Migraine',
    es: 'Dolor de cabeza y migraña',
    fr: 'Maux de tête et migraine',
    it: 'Mal di testa e emicrania',
    el: 'Πονοκέφαλοι & Ημικρανία',
    ru: 'Головные боли и мигрень'
  },
  magen_darm: {
    de: 'Magen-Darm & Verdauung',
    en: 'Gastrointestinal & Digestion',
    es: 'Gastrointestinal y digestión',
    fr: 'Gastro-intestinal et digestion',
    it: 'Gastrointestinale e digestione',
    el: 'Γαστρεντερικό & Πέψη',
    ru: 'Желудочно-кишечный тракт и пищеварение'
  },
  ruecken_gelenke: {
    de: 'Rücken, Gelenke & Bewegungsapparat',
    en: 'Back, Joints & Musculoskeletal System',
    es: 'Espalda, articulaciones y sistema musculoesquelético',
    fr: 'Dos, articulations et système musculosquelettique',
    it: 'Schiena, articolazioni e sistema muscoloscheletrico',
    el: 'Πλάτη, Αρθρώσεις & Μυοσκελετικό Σύστημα',
    ru: 'Спина, суставы и опорно-двигательный аппарат'
  },
  husten_atemwege: {
    de: 'Atemwege, Husten & Lunge',
    en: 'Respiratory Tract, Cough & Lungs',
    es: 'Vías respiratorias, tos y pulmones',
    fr: 'Voies respiratoires, toux et poumons',
    it: 'Vie respiratorie, tosse e polmonι',
    el: 'Αναπνευστικό Σύστημα, Βήχας & Πνεύμονες',
    ru: 'Дыхательные пути, кашель и легкие'
  },
  haut_allergie: {
    de: 'Haut, Allergien & Dermatologie',
    en: 'Skin, Allergies & Dermatology',
    es: 'Piel, alergias y dermatología',
    fr: 'Peau, allergies et dermatologie',
    it: 'Pelle, allergie e dermatologia',
    el: 'Δέρμα, Αλλεργίες & Δερματολογία',
    ru: 'Кожа, аллергия и дерматология'
  },
  psyche_gemuet_stress: {
    de: 'Gemüt, Seelische Belastung & Familiärer Stress',
    en: 'Mind, Emotional Burden & Family Stress',
    es: 'Mente, carga emocional y estrés familiar',
    fr: 'Esprit, charge émotionnelle et stress familial',
    it: 'Mente, carico emotivo e stress familiare',
    el: 'Ψυχισμός, Συναισθηματική Επιβάρυνση & Οικογενειακό Στρες',
    ru: 'Психика, эмоциональная нагрузка и семейный стресс'
  },
  psyche_schlaf: {
    de: 'Schlafstörungen & Nächtlicher Rhythmus',
    en: 'Sleep Disorders & Nightly Rhythm',
    es: 'Trastornos del sueño y ritmo nocturno',
    fr: 'Troubles du sommeil et rythme nocturne',
    it: 'Disturbi del sonno e ritmo notturno',
    el: 'Διαταραχές Ύπνου & Νυχτερινός Ρυθμός',
    ru: 'Нарушения сна и ночной ритм'
  },
  fieber_infekt: {
    de: 'Fieber & Akuter Infekt',
    en: 'Fever & Acute Infection',
    es: 'Fiebre e infección aguda',
    fr: 'Fièvre et infection aiguë',
    it: 'Febbre e infezione acuta',
    el: 'Πυρετός & Οξεία Λοίμωξη',
    ru: 'Лихорадка и острая инфекция'
  },
  schwindel: {
    de: 'Schwindel & Gleichgewicht',
    en: 'Dizziness & Balance',
    es: 'Mareo y equilibrio',
    fr: 'Vertiges et équilibre',
    it: 'Vertigini ed equilibrio',
    el: 'Ζάλη & Ισορροπία',
    ru: 'Головокружение и равновесие'
  }
};
