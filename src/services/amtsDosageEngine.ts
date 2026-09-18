/**
 * AMTS CLINICAL DOSAGE & TOXICOLOGY ENGINE (BfArM / Rote Liste / AkdÄ Reference)
 * 
 * Deterministic quantitative dosage extraction, daily dose summation,
 * maximum reference dose comparison, and multi-drug organ system classification.
 */

export interface ParsedDosage {
  originalText: string;
  singleDoseValue: number | null;
  singleDoseUnit: string;
  frequencyPer24h: number;
  calculatedDailyDoseMg: number | null;
  frequencyDescription: string;
  isPrn: boolean;
}

export interface DrugDosageEvaluation {
  drugName: string;
  substance: string;
  normalizedSubstance: string;
  substanceId: string;
  sourceReference: string;
  fachinfoVersion: string;
  isFullyValidated: boolean;
  ambiguousWarning?: string;
  singleDoseMg: number | null;
  frequencyPer24h: number;
  dailyDoseMg: number | null;
  maxDailyDoseMg: number | null;
  percentageExceeded: number | null;
  status: 'NORMAL' | 'TOXISCH_UEBERDOSIERT' | 'NICHT_BEURTEILBAR';
  targetOrgan: 'kardiovaskulaer' | 'renal' | 'gastrointestinal' | 'hepatisch' | 'zns' | 'allgemein';
  clinicalRiskSummary: string;
  emergencySign: string;
}

export interface AmtsEvaluationResult {
  hasToxicOverdose: boolean;
  highestPercentageExceeded: number;
  evaluations: DrugDosageEvaluation[];
  theoreticalPairCount: number;
  uniqueSubstancesCount: number;
  uniqueSubstances: string[];
  cumulativeOrganRisk: {
    gastrointestinal: 'KRITISCH' | 'HOCH' | 'MITTEL' | 'GERING' | 'NICHT_BEURTEILBAR';
    renal: 'KRITISCH' | 'HOCH' | 'MITTEL' | 'GERING' | 'NICHT_BEURTEILBAR';
    kardiovaskulaer: 'KRITISCH' | 'HOCH' | 'MITTEL' | 'GERING' | 'NICHT_BEURTEILBAR';
    hepatisch: 'KRITISCH' | 'HOCH' | 'MITTEL' | 'GERING' | 'NICHT_BEURTEILBAR';
    zns: 'KRITISCH' | 'HOCH' | 'MITTEL' | 'GERING' | 'NICHT_BEURTEILBAR';
  };
  organRiskReasons: {
    gastrointestinal?: string;
    renal?: string;
    kardiovaskulaer?: string;
    hepatisch?: string;
    zns?: string;
  };
}

/**
 * Standard adult clinical 24h maximum reference doses (in mg) according to BfArM, Rote Liste and AkdÄ guidelines.
 */
export const CLINICAL_MAX_DAILY_DOSES_MG: Record<string, { maxMg: number; organ: DrugDosageEvaluation['targetOrgan']; reason: string }> = {
  // Beta-Blocker
  'metoprolol': { maxMg: 200, organ: 'kardiovaskulaer', reason: 'Kardiogener Schock, hochgradige Bradykardie, AV-Blockierungen, kritische Hypotonie' },
  'metoprololsuccinat': { maxMg: 200, organ: 'kardiovaskulaer', reason: 'Kardiogener Schock, hochgradige Bradykardie, AV-Blockierungen, kritische Hypotonie' },
  'metoprololtartrat': { maxMg: 200, organ: 'kardiovaskulaer', reason: 'Akute Bradykardie, Herzinsuffizienz-Dekompensation, Hypotonie' },
  'bisoprolol': { maxMg: 20, organ: 'kardiovaskulaer', reason: 'Schwere Bradykardie, kardiogener Schock, Bronchospasmus' },
  'atenolol': { maxMg: 100, organ: 'kardiovaskulaer', reason: 'Bradykardie, renale Akkumulation, AV-Überleitungsstörung' },
  'carvedilol': { maxMg: 100, organ: 'kardiovaskulaer', reason: 'Schwere Vasodilatation, orthostatischer Kollaps, Bradykardie' },
  'nebivolol': { maxMg: 10, organ: 'kardiovaskulaer', reason: 'Exzessive Bradykardie, periphere Durchblutungsstörung' },
  'propranolol': { maxMg: 320, organ: 'kardiovaskulaer', reason: 'Kardiodepression, Bronchokonstriktion, Hypoglykämie-Maskierung' },

  // Calciumantagonisten
  'amlodipin': { maxMg: 10, organ: 'kardiovaskulaer', reason: 'Schwere periphere Vasodilatation, therapierefraktäre Hypotonie, Reflex-Tachykardie' },
  'lercanidipin': { maxMg: 20, organ: 'kardiovaskulaer', reason: 'Kritische Hypotonie, Kopfschmerzen, Knöchelödeme' },
  'felodipin': { maxMg: 10, organ: 'kardiovaskulaer', reason: 'Extremer Blutdruckabfall, Flush' },
  'verapamil': { maxMg: 480, organ: 'kardiovaskulaer', reason: 'Kompletter AV-Block, Asystolie, Myokarddepression' },
  'diltiazem': { maxMg: 360, organ: 'kardiovaskulaer', reason: 'AV-Block, Bradykardie, kardiale Dekompensation' },

  // ACE-Hemmer & Sartane
  'ramipril': { maxMg: 10, organ: 'renal', reason: 'Akutes Nierenversagen, Hyperkaliämie, schwere Hypotonie' },
  'enalapril': { maxMg: 40, organ: 'renal', reason: 'Akute renale Dysfunktion, Hyperkaliämie' },
  'lisinopril': { maxMg: 40, organ: 'renal', reason: 'Renale Dekompensation, Reizhusten, Hyperkaliämie' },
  'candesartan': { maxMg: 32, organ: 'renal', reason: 'Akuter GFR-Abfall, Hyperkaliämie, Hypotonie' },
  'valsartan': { maxMg: 320, organ: 'renal', reason: 'Renale Ischämie, Hyperkaliämie, Schwindel' },
  'losartan': { maxMg: 100, organ: 'renal', reason: 'Hyperkaliämie, Hypotonie' },
  'olmesartan': { maxMg: 40, organ: 'gastrointestinal', reason: 'Sprue-artige Enteropathie, Nierenfunktionsverlust' },

  // NSAR / Schmerzmittel
  'ibuprofen': { maxMg: 2400, organ: 'gastrointestinal', reason: 'Gastrointestinale Massenblutung, Magendurchbruch, akutes Nierenversagen' },
  'diclofenac': { maxMg: 150, organ: 'kardiovaskulaer', reason: 'Kardiovaskuläre Thromboembolien, Myokardinfarkt, Magenulzera' },
  'naproxen': { maxMg: 1250, organ: 'gastrointestinal', reason: 'Magen-Darm-Blutung, Niereninsuffizienz' },
  'paracetamol': { maxMg: 4000, organ: 'hepatisch', reason: 'Akutes Leberversagen (zentrilobuläre Nekrose), Intoxikationsgefahr' },
  'acetylsalicylsaeure': { maxMg: 3000, organ: 'gastrointestinal', reason: 'Schwere Schleimhautläsionen, Hämorrhagien, Salizylismus' },
  'ass': { maxMg: 3000, organ: 'gastrointestinal', reason: 'Schwere Hämorrhagie, gastrointestinale Ulzerationen' },
  'celecoxib': { maxMg: 400, organ: 'kardiovaskulaer', reason: 'Thrombembolische Ereignisse, Hypertonie' },
  'etoricoxib': { maxMg: 120, organ: 'kardiovaskulaer', reason: 'Schwere hypertensive Krise, kardiovaskuläre Ereignisse' },

  // Diuretika
  'furosemid': { maxMg: 240, organ: 'renal', reason: 'Hypovolämischer Schock, prärenales Nierenversagen, massive Hypokaliämie' },
  'torasemid': { maxMg: 40, organ: 'renal', reason: 'Dehydratation, Elektrolytentgleisung, Thromboseneigung' },
  'hydrochlorothiazid': { maxMg: 50, organ: 'renal', reason: 'Hyponatriämie, Hypokaliämie, Hyperurikämie' },
  'hct': { maxMg: 50, organ: 'renal', reason: 'Elektrolytentgleisung, Hypokaliämie' },
  'spironolacton': { maxMg: 200, organ: 'renal', reason: 'Tödliche Hyperkaliämie, Arrhythmien' },
  'eplerenon': { maxMg: 50, organ: 'kardiovaskulaer', reason: 'Gefährliche Hyperkaliämie, Herzrhythmusstörungen' },

  // Statine / Lipidsenker
  'simvastatin': { maxMg: 80, organ: 'hepatisch', reason: 'Rhabdomyolyse mit Myoglobinurie, akutes Nierenversagen, Transaminasenanstieg' },
  'atorvastatin': { maxMg: 80, organ: 'hepatisch', reason: 'Rhabdomyolyse, Myopathie, schwere Hepatotoxizität' },
  'rosuvastatin': { maxMg: 40, organ: 'renal', reason: 'Proteinurie, Rhabdomyolyse, Nierenfunktionsstörung' },

  // PPI / Magenschutz
  'pantoprazol': { maxMg: 80, organ: 'gastrointestinal', reason: 'Elektrolytstörungen (Hypomagnesiämie), Neigung zu Clostridien-Enteritis' },
  'omeprazol': { maxMg: 80, organ: 'gastrointestinal', reason: 'Hypomagnesiämie, CYP2C19-Interaktionsüberlastung' },
  'esomeprazol': { maxMg: 80, organ: 'gastrointestinal', reason: 'Hypomagnesiämie, Frakturrisiko bei chronischer Überdosierung' },

  // Antidiabetika
  'metformin': { maxMg: 3000, organ: 'renal', reason: 'Lebensbedrohliche Laktatazidose, insbesondere bei Niereninsuffizienz' },
  'glimepirid': { maxMg: 6, organ: 'zns', reason: 'Schwere, protrahierte Hypoglykämie mit Koma' },

  // Psychopharmaka / ZNS
  'citalopram': { maxMg: 40, organ: 'kardiovaskulaer', reason: 'Dosisabhängige QTc-Verlängerung, Torsade de Pointes, Serotoninsyndrom' },
  'escitalopram': { maxMg: 20, organ: 'kardiovaskulaer', reason: 'QTc-Intervall-Verlängerung, ventrikuläre Tachykardien' },
  'sertralin': { maxMg: 200, organ: 'zns', reason: 'Serotoninsyndrom, Tremor, Krampfanfälle' },
  'venlafaxin': { maxMg: 375, organ: 'kardiovaskulaer', reason: 'Schwere Tachykardie, hypertensive Krise, Serotoninsyndrom' },
  'duloxetin': { maxMg: 120, organ: 'hepatisch', reason: 'Hepatotoxizität, Serotoninsyndrom, Blutdruckanstieg' },
  'mirtazapin': { maxMg: 45, organ: 'zns', reason: 'Exzessive Sedierung, Gewichtszunahme, Agranulozytose' },
  'amitriptylin': { maxMg: 150, organ: 'kardiovaskulaer', reason: 'Anticholinerges Delir, QRS-Verbreiterung, Kammerflimmern' },
  'diazepam': { maxMg: 30, organ: 'zns', reason: 'Schwere Atemdepression, Koma, ZNS-Dämpfung' },
  'lorazepam': { maxMg: 7.5, organ: 'zns', reason: 'Atemdepression, paradoxe Erregung, Sturzgefahr' },
  'zolpidem': { maxMg: 10, organ: 'zns', reason: 'Amnesie, Schlafwandeln, Somnolenz' },

  // Opioide & Analgetika
  'tramadol': { maxMg: 400, organ: 'zns', reason: 'Senkung der Krampfschwelle, Krampfanfälle, Atemdepression' },
  'tilidin': { maxMg: 600, organ: 'zns', reason: 'Atemdepression, Schwindel, Sedierung' },
  'pregabalin': { maxMg: 600, organ: 'zns', reason: 'ZNS-Depression, Myoklonien, Herzinsuffizienz-Verschlechterung' },
  'gabapentin': { maxMg: 3600, organ: 'zns', reason: 'Massive Somnolenz, Ataxie, Atemdepression' },

  // Glukokortikoide
  'prednisolon': { maxMg: 50, organ: 'gastrointestinal', reason: 'Akute Magenblutung, psychotische Episoden, Hyperglykämie' },
  'methylprednisolon': { maxMg: 64, organ: 'gastrointestinal', reason: 'Gastrointestinale Perforation, hypertone Entgleisung, Infektionsgefahr' },
  'medrol': { maxMg: 64, organ: 'gastrointestinal', reason: 'Schwere Schleimhautatrophie, gastrointestinale Ulzerationen' },

  // Antikoagulanzien
  'rivaroxaban': { maxMg: 20, organ: 'gastrointestinal', reason: 'Lebensbedrohliche Massenblutung (zerebral/gastrointestinal)' },
  'apixaban': { maxMg: 10, organ: 'gastrointestinal', reason: 'Schwere Blutungskomplikationen' },
  'edoxaban': { maxMg: 60, organ: 'gastrointestinal', reason: 'Hämorrhagien, Anämie' },
  'dabigatran': { maxMg: 300, organ: 'gastrointestinal', reason: 'Intrakranielle und gastrointestinale Blutungen' },
  'clopidogrel': { maxMg: 75, organ: 'gastrointestinal', reason: 'Blutungszeitverlängerung, Purpura' },

  // Schilddrüse & Gicht
  'levothyroxin': { maxMg: 0.3, organ: 'kardiovaskulaer', reason: 'Thyreotoxische Krise, Tachyarrhythmie, Angina pectoris' },
  'l-thyroxin': { maxMg: 0.3, organ: 'kardiovaskulaer', reason: 'Thyreotoxische Krise, Tachykardie, Vorhofflimmern' },
  'allopurinol': { maxMg: 800, organ: 'hepatisch', reason: 'Schwere Überempfindlichkeitsreaktion (DRESS), toxische Hepatitis' },

  // Kardiaka enge therapeutische Breite
  'digitoxin': { maxMg: 0.1, organ: 'kardiovaskulaer', reason: 'Tödliche Digitalis-Intoxikation, ventrikuläre Extrasystolen, AV-Block' },
  'digoxin': { maxMg: 0.5, organ: 'kardiovaskulaer', reason: 'Lebensbedrohliche Rhythmusstörungen, Sehstörungen (Gelbsehen)' },
  'theophyllin': { maxMg: 1200, organ: 'kardiovaskulaer', reason: 'Krampfanfälle, ventrikuläre Tachykardie, Schock' }
};

/**
 * German number word converter for frequency strings (e.g. "elfmal" -> 11, "dreimal" -> 3)
 */
const TEXT_NUMBER_MAP: Record<string, number> = {
  'einmal': 1,
  'zweimal': 2,
  'dreimal': 3,
  'viermal': 4,
  'fünfmal': 5,
  'sechsmal': 6,
  'siebenmal': 7,
  'achtmal': 8,
  'neunmal': 9,
  'zehnmal': 10,
  'elfmal': 11,
  'zwölfmal': 12,
  '1x': 1,
  '2x': 2,
  '3x': 3,
  '4x': 4,
  '5x': 5,
  '6x': 6,
  '7x': 7,
  '8x': 8,
  '9x': 9,
  '10x': 10,
  '11x': 11,
  '12x': 12,
};

/**
 * Parses dosage and frequency from raw strings with high clinical robustness.
 */
export function parseDoseAndFrequency(rawDose: string = '', rawIntake: string = ''): ParsedDosage {
  const combined = `${rawDose} ${rawIntake}`.trim().toLowerCase();
  const isPrn = combined.includes('bedarf') || combined.includes('prn') || combined.includes('bei schmerzen');

  // 1. Single dose numeric extraction
  let singleDoseValue: number | null = null;
  let singleDoseUnit = 'mg';

  // Matches e.g. "32 mg", "47.5mg", "1,5 g", "100 µg", "100 ug", "500mg"
  const doseMatch = combined.match(/(\d+([.,]\d+)?)\s*(mg|g|µg|ug|ml|ie)\b/i);
  if (doseMatch) {
    const rawVal = parseFloat(doseMatch[1].replace(',', '.'));
    const unit = doseMatch[3].toLowerCase();
    singleDoseUnit = unit;

    if (unit === 'g') {
      singleDoseValue = rawVal * 1000;
      singleDoseUnit = 'mg';
    } else if (unit === 'µg' || unit === 'ug') {
      singleDoseValue = rawVal / 1000;
      singleDoseUnit = 'mg';
    } else {
      singleDoseValue = rawVal;
    }
  } else {
    // Isolated number like "32"
    const numberOnlyMatch = combined.match(/(\d+([.,]\d+)?)/);
    if (numberOnlyMatch) {
      singleDoseValue = parseFloat(numberOnlyMatch[1].replace(',', '.'));
    }
  }

  // 2. Frequency extraction (Digits or German words: "elfmal", "11x", "3x täglich", "alle 6 Stunden")
  let frequencyPer24h = 1;
  let frequencyDescription = '1x täglich';

  // Check for German text words e.g. "elfmal", "dreimal", "fünfmal"
  for (const [word, count] of Object.entries(TEXT_NUMBER_MAP)) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(combined)) {
      frequencyPer24h = count;
      frequencyDescription = `${count}x täglich (${word})`;
      break;
    }
  }

  // Check for digit-based e.g. "11-mal", "11 mal", "11 x", "11x"
  const timesMatch = combined.match(/(\d+)\s*(-?\s*mal|x)\b/i);
  if (timesMatch) {
    const count = parseInt(timesMatch[1], 10);
    if (!isNaN(count) && count > 0 && count <= 48) {
      frequencyPer24h = count;
      frequencyDescription = `${count}x täglich`;
    }
  }

  // Check schema e.g. "1-1-1-1" (4x), "1-0-1" (2x), "1-1-1" (3x)
  const schemaMatch = combined.match(/\b([0-9])-([0-9])-([0-9])(-([0-9]))?\b/);
  if (schemaMatch) {
    const morning = parseInt(schemaMatch[1], 10) || 0;
    const noon = parseInt(schemaMatch[2], 10) || 0;
    const evening = parseInt(schemaMatch[3], 10) || 0;
    const night = schemaMatch[5] ? parseInt(schemaMatch[5], 10) || 0 : 0;
    const sum = morning + noon + evening + night;
    if (sum > 0) {
      frequencyPer24h = sum;
      frequencyDescription = `Schema ${schemaMatch[0]} (${sum} Einnahmen/Tag)`;
    }
  }

  // Check hourly intervals e.g. "alle 4 stunden" (6x), "alle 6 stunden" (4x), "alle 8 stunden" (3x)
  const hourMatch = combined.match(/alle\s+(\d+)\s+stunde/i);
  if (hourMatch) {
    const intervalHours = parseInt(hourMatch[1], 10);
    if (intervalHours > 0 && intervalHours <= 24) {
      const calculatedFreq = Math.round(24 / intervalHours);
      frequencyPer24h = calculatedFreq;
      frequencyDescription = `alle ${intervalHours}h (${calculatedFreq}x/Tag)`;
    }
  }

  const calculatedDailyDoseMg = singleDoseValue !== null ? parseFloat((singleDoseValue * frequencyPer24h).toFixed(2)) : null;

  return {
    originalText: combined,
    singleDoseValue,
    singleDoseUnit,
    frequencyPer24h,
    calculatedDailyDoseMg,
    frequencyDescription,
    isPrn,
  };
}

export interface DrugMappingRecord {
  substanceId: string;
  substanceKey: string;
  activeSubstanceName: string;
  sourceReference: string;
  fachinfoVersion: string;
  isFullyValidated: boolean;
}

export const EXPLICIT_DRUG_DICTIONARY: Record<string, DrugMappingRecord> = {
  'medrol': { substanceId: 'sub_methylprednisolon_01', substanceKey: 'methylprednisolon', activeSubstanceName: 'Methylprednisolon', sourceReference: 'BfArM Fachinformation Medrol® 16mg', fachinfoVersion: '2024/05', isFullyValidated: true },
  'urbason': { substanceId: 'sub_methylprednisolon_02', substanceKey: 'methylprednisolon', activeSubstanceName: 'Methylprednisolon', sourceReference: 'BfArM Fachinformation Urbason', fachinfoVersion: '2024/01', isFullyValidated: true },
  'methylprednisolon': { substanceId: 'sub_methylprednisolon_03', substanceKey: 'methylprednisolon', activeSubstanceName: 'Methylprednisolon', sourceReference: 'BfArM Standardmonographie Methylprednisolon', fachinfoVersion: '2024/03', isFullyValidated: true },
  'decortin': { substanceId: 'sub_prednisolon_01', substanceKey: 'prednisolon', activeSubstanceName: 'Prednisolon', sourceReference: 'BfArM Fachinformation Decortin', fachinfoVersion: '2024/02', isFullyValidated: true },
  'prednisolon': { substanceId: 'sub_prednisolon_02', substanceKey: 'prednisolon', activeSubstanceName: 'Prednisolon', sourceReference: 'BfArM Standardmonographie Prednisolon', fachinfoVersion: '2024/03', isFullyValidated: true },
  'ibuprofen': { substanceId: 'sub_ibuprofen_01', substanceKey: 'ibuprofen', activeSubstanceName: 'Ibuprofen', sourceReference: 'BfArM / Rote Liste Ibuprofen', fachinfoVersion: '2024/01', isFullyValidated: true },
  'aspirin': { substanceId: 'sub_ass_01', substanceKey: 'acetylsalicylsaeure', activeSubstanceName: 'Acetylsalicylsäure (ASS)', sourceReference: 'BfArM Aspirin Fachinformation', fachinfoVersion: '2024/01', isFullyValidated: true },
  'ass': { substanceId: 'sub_ass_02', substanceKey: 'acetylsalicylsaeure', activeSubstanceName: 'Acetylsalicylsäure (ASS)', sourceReference: 'BfArM Standard ASS', fachinfoVersion: '2024/01', isFullyValidated: true },
  'metoprolol': { substanceId: 'sub_metoprolol_01', substanceKey: 'metoprolol', activeSubstanceName: 'Metoprolol', sourceReference: 'BfArM Fachinformation Metoprolol', fachinfoVersion: '2024/02', isFullyValidated: true },
  'propranolol': { substanceId: 'sub_propranolol_01', substanceKey: 'propranolol', activeSubstanceName: 'Propranolol', sourceReference: 'BfArM Fachinformation Propranolol', fachinfoVersion: '2024/02', isFullyValidated: true },
  'hydrocortison': { substanceId: 'sub_hydrocortison_01', substanceKey: 'hydrocortison', activeSubstanceName: 'Hydrocortison', sourceReference: 'BfArM Fachinformation Hydrocortison', fachinfoVersion: '2024/01', isFullyValidated: true },
  'cortison': { substanceId: 'sub_cortison_01', substanceKey: 'cortison', activeSubstanceName: 'Cortison', sourceReference: 'BfArM Fachinformation Cortison', fachinfoVersion: '2024/01', isFullyValidated: true },
  'clonazepam': { substanceId: 'sub_clonazepam_01', substanceKey: 'clonazepam', activeSubstanceName: 'Clonazepam', sourceReference: 'BfArM Fachinformation Clonazepam', fachinfoVersion: '2024/02', isFullyValidated: true },
  'clonidin': { substanceId: 'sub_clonidin_01', substanceKey: 'clonidin', activeSubstanceName: 'Clonidin', sourceReference: 'BfArM Fachinformation Clonidin', fachinfoVersion: '2024/02', isFullyValidated: true },
};

/**
 * Strict resolution with Trade Name -> Preparation -> Substance ID -> Active Substance mapping,
 * consistency checks, and ambiguity handling.
 */
export function resolveSubstanceMapping(rawInput: string): {
  substanceKey: string;
  substanceId: string;
  activeSubstanceName: string;
  sourceReference: string;
  fachinfoVersion: string;
  isFullyValidated: boolean;
  ambiguousWarning?: string;
} {
  const s = (rawInput || '').toLowerCase()
    .replace(/[^a-z0-9äöüß]/g, ' ')
    .trim();

  // 1. Exact dictionary match
  if (EXPLICIT_DRUG_DICTIONARY[s]) {
    const rec = EXPLICIT_DRUG_DICTIONARY[s];
    if (s.includes('medrol') && rec.substanceKey !== 'methylprednisolon') {
      throw new Error('Consistency check failed: Medrol must resolve to methylprednisolon');
    }
    return { ...rec };
  }

  // 2. Substring / Trade name lookup with explicit priority
  for (const [key, rec] of Object.entries(EXPLICIT_DRUG_DICTIONARY)) {
    if (s.includes(key)) {
      if (s.includes('medrol') && rec.substanceKey !== 'methylprednisolon') continue;
      return { ...rec };
    }
  }

  // 3. Fallback to clinical max daily doses table sorted by length descending
  const sortedKeys = Object.keys(CLINICAL_MAX_DAILY_DOSES_MG).sort((a, b) => b.length - a.length);
  const matches: string[] = [];

  for (const key of sortedKeys) {
    if (s.includes(key)) {
      matches.push(key);
    }
  }

  // Ambiguity check: If multiple matches without clear winner
  if (matches.length > 1) {
    return {
      substanceKey: 'nicht_eindeutig',
      substanceId: 'sub_ambiguous',
      activeSubstanceName: rawInput,
      sourceReference: 'Keine eindeutige Fachinformation',
      fachinfoVersion: 'k. A.',
      isFullyValidated: false,
      ambiguousWarning: 'Wirkstoff nicht eindeutig identifiziert – Interaktionsprüfung nicht freigegeben.',
    };
  }

  if (matches.length === 1) {
    const matchedKey = matches[0];
    return {
      substanceId: `sub_${matchedKey}_fallback`,
      substanceKey: matchedKey,
      activeSubstanceName: matchedKey.charAt(0).toUpperCase() + matchedKey.slice(1),
      sourceReference: 'BfArM / Rote Liste Standard (Fallback-Zuordnung)',
      fachinfoVersion: '2024/03',
      isFullyValidated: false,
    };
  }

  return {
    substanceId: `sub_unknown_${Date.now()}`,
    substanceKey: s.split(' ')[0] || s,
    activeSubstanceName: rawInput,
    sourceReference: 'Nicht in der verifizierten AMTS-Datenbank gefunden',
    fachinfoVersion: 'k. A.',
    isFullyValidated: false,
    ambiguousWarning: 'Wirkstoff nicht in der verifizierten Datenbank gefunden – Interaktionsprüfung nicht freigegeben.',
  };
}

/**
 * Normalizes drug name or substance to match standard database key via strict resolveSubstanceMapping
 */
export function normalizeSubstanceKey(raw: string): string {
  return resolveSubstanceMapping(raw).substanceKey;
}

/**
 * Full AMTS v5.0 Quantitative Check for an entire medication list with strict ID mapping and traceability.
 */
export function evaluateAmtsMedications(
  meds: Array<{ name: string; dosierung?: string; einnahmeart?: string; wirkstoff?: string; singleDoseMg?: number; frequencyPerDay?: number; dosageText?: string }>,
  patientAge?: number | null,
  patientWeightKg: number = 70
): AmtsEvaluationResult {
  const evaluations: DrugDosageEvaluation[] = [];
  const uniqueSubstancesSet = new Set<string>();

  let hasToxicOverdose = false;
  let highestPercentageExceeded = 0;

  const organHits: Record<'gastrointestinal' | 'renal' | 'kardiovaskulaer' | 'hepatisch' | 'zns', string[]> = {
    gastrointestinal: [],
    renal: [],
    kardiovaskulaer: [],
    hepatisch: [],
    zns: [],
  };

  for (const m of meds) {
    const rawName = m.name || '';
    const rawSubstance = m.wirkstoff || rawName;
    const resolved = resolveSubstanceMapping(`${rawName} ${rawSubstance}`);
    const normalizedKey = resolved.substanceKey;
    const substanceId = resolved.substanceId;
    const sourceReference = resolved.sourceReference;
    const fachinfoVersion = resolved.fachinfoVersion;
    const isFullyValidated = resolved.isFullyValidated;
    const ambiguousWarning = resolved.ambiguousWarning;

    uniqueSubstancesSet.add(normalizedKey);

    // Fallback search in name if dosierung is empty
    const doseSource = (m.dosierung && m.dosierung.trim().length > 0) ? m.dosierung : rawName;
    const intakeSource = `${m.einnahmeart || ''} ${m.dosageText || ''} ${rawName}`.trim();

    const parsed = parseDoseAndFrequency(doseSource, intakeSource);

    // Explicit overrides if passed as numbers
    if (m.singleDoseMg !== undefined && m.singleDoseMg !== null) {
      parsed.singleDoseValue = m.singleDoseMg;
      parsed.singleDoseUnit = 'mg';
    }
    if (m.frequencyPerDay !== undefined && m.frequencyPerDay !== null && m.frequencyPerDay > 0) {
      parsed.frequencyPer24h = m.frequencyPerDay;
      parsed.frequencyDescription = `${m.frequencyPerDay}x täglich`;
    }
    if (parsed.singleDoseValue !== null && parsed.frequencyPer24h > 0) {
      parsed.calculatedDailyDoseMg = parseFloat((parsed.singleDoseValue * parsed.frequencyPer24h).toFixed(2));
    }

    const refData = CLINICAL_MAX_DAILY_DOSES_MG[normalizedKey];

    let status: 'NORMAL' | 'TOXISCH_UEBERDOSIERT' | 'NICHT_BEURTEILBAR' = 'NORMAL';
    let percentageExceeded: number | null = null;
    let targetOrgan: DrugDosageEvaluation['targetOrgan'] = refData ? refData.organ : 'allgemein';
    let clinicalRiskSummary = 'Dosis im üblichen klinischen Bereich.';
    let emergencySign = 'Keine akute Überdosierung erkennbar.';

    if (ambiguousWarning) {
      status = 'NICHT_BEURTEILBAR';
      clinicalRiskSummary = `⚠️ ${ambiguousWarning} [Quelle: ${sourceReference}, Stand: ${fachinfoVersion}]`;
      emergencySign = 'Interaktionsprüfung wegen unklarer Wirkstoffidentität gesperrt.';
    } else if (refData && parsed.calculatedDailyDoseMg !== null) {
      const maxMg = refData.maxMg;
      const dailyMg = parsed.calculatedDailyDoseMg;

      if (dailyMg > maxMg) {
        status = 'TOXISCH_UEBERDOSIERT';
        hasToxicOverdose = true;
        percentageExceeded = parseFloat((((dailyMg / maxMg) - 1) * 100).toFixed(1));
        if (percentageExceeded > highestPercentageExceeded) {
          highestPercentageExceeded = percentageExceeded;
        }

        clinicalRiskSummary = `MASSIVE ÜBERDOSIERUNG: Berechnete Tagesdosis von ${dailyMg} mg/Tag übersteigt die klinische Standard-Höchstdosis (${maxMg} mg/Tag) um +${percentageExceeded}%. ${refData.reason}. [Quelle: ${sourceReference}, Stand: ${fachinfoVersion}]`;
        emergencySign = `Lebensgefahr durch akute Wirkstoffüberlastung (${refData.reason})!`;

        if (refData.organ !== 'allgemein') {
          organHits[refData.organ].push(`${m.name}: ${dailyMg} mg/d (+${percentageExceeded}%)`);
        }
      } else {
        status = 'NORMAL';
        clinicalRiskSummary = `Tagesdosis ${dailyMg} mg/Tag liegt innerhalb der maximalen Referenzdosis (${maxMg} mg/Tag). [Quelle: ${sourceReference}, Stand: ${fachinfoVersion}]`;
      }
    } else if (!refData && parsed.calculatedDailyDoseMg !== null) {
      status = 'NICHT_BEURTEILBAR';
      clinicalRiskSummary = `Tagesdosis von ${parsed.calculatedDailyDoseMg} mg berechnet, jedoch keine eindeutige deutsche Referenz-Höchstdosis hinterlegt. [Quelle: ${sourceReference}]`;
    } else {
      status = 'NICHT_BEURTEILBAR';
      clinicalRiskSummary = `Unvollständige Dosierungsangabe oder nicht quantifizierbar. [Quelle: ${sourceReference}]`;
    }

    evaluations.push({
      drugName: m.name,
      substance: rawSubstance,
      normalizedSubstance: normalizedKey,
      substanceId,
      sourceReference,
      fachinfoVersion,
      isFullyValidated,
      ambiguousWarning,
      singleDoseMg: parsed.singleDoseValue,
      frequencyPer24h: parsed.frequencyPer24h,
      dailyDoseMg: parsed.calculatedDailyDoseMg,
      maxDailyDoseMg: refData ? refData.maxMg : null,
      percentageExceeded,
      status,
      targetOrgan,
      clinicalRiskSummary,
      emergencySign,
    });
  }

  // Calculate theoretical external pairwise interactions: n * (n - 1) / 2
  const uniqueSubstances = Array.from(uniqueSubstancesSet);
  const n = uniqueSubstances.length;
  const theoreticalPairCount = n >= 2 ? Math.round((n * (n - 1)) / 2) : 0;

  // Cumulative Organ Risk classification
  const organRiskLevels: AmtsEvaluationResult['cumulativeOrganRisk'] = {
    gastrointestinal: organHits.gastrointestinal.length > 0 ? 'KRITISCH' : 'GERING',
    renal: organHits.renal.length > 0 ? 'KRITISCH' : 'GERING',
    kardiovaskulaer: organHits.kardiovaskulaer.length > 0 ? 'KRITISCH' : 'GERING',
    hepatisch: organHits.hepatisch.length > 0 ? 'KRITISCH' : 'GERING',
    zns: organHits.zns.length > 0 ? 'KRITISCH' : 'GERING',
  };

  // Cross-drug synergy checks for organs (e.g. NSAR + Antikoagulant = GI HOCH/KRITISCH)
  const hasNsaid = uniqueSubstances.some(s => s.includes('ibuprofen') || s.includes('diclofenac') || s.includes('naproxen') || s.includes('ass') || s.includes('acetylsalicyl'));
  const hasAnticoag = uniqueSubstances.some(s => s.includes('rivaroxaban') || s.includes('apixaban') || s.includes('edoxaban') || s.includes('dabigatran') || s.includes('marcumar') || s.includes('phenprocoumon'));
  const hasAceArb = uniqueSubstances.some(s => s.includes('ramipril') || s.includes('enalapril') || s.includes('candesartan') || s.includes('valsartan'));
  const hasDiuretic = uniqueSubstances.some(s => s.includes('furosemid') || s.includes('torasemid') || s.includes('hydrochlorothiazid') || s.includes('hct'));
  const hasBetaBlocker = uniqueSubstances.some(s => s.includes('metoprolol') || s.includes('bisoprolol') || s.includes('carvedilol') || s.includes('atenolol'));
  const hasSedative = uniqueSubstances.some(s => s.includes('diazepam') || s.includes('lorazepam') || s.includes('zolpidem') || s.includes('pregabalin') || s.includes('gabapentin') || s.includes('tramadol') || s.includes('tilidin'));

  if (hasNsaid && hasAnticoag) {
    organRiskLevels.gastrointestinal = 'KRITISCH';
  }
  if (hasNsaid && hasAceArb && hasDiuretic) {
    organRiskLevels.renal = 'KRITISCH'; // Triple Whammy
  } else if (hasNsaid && hasAceArb) {
    if (organRiskLevels.renal !== 'KRITISCH') organRiskLevels.renal = 'HOCH';
  }
  if (hasBetaBlocker && organHits.kardiovaskulaer.length > 0) {
    organRiskLevels.kardiovaskulaer = 'KRITISCH';
  }
  if (hasSedative && uniqueSubstances.filter(s => s.includes('diazepam') || s.includes('lorazepam') || s.includes('tramadol') || s.includes('pregabalin')).length >= 2) {
    organRiskLevels.zns = 'HOCH';
  }

  const organReasons: AmtsEvaluationResult['organRiskReasons'] = {
    gastrointestinal: organHits.gastrointestinal.length > 0
      ? `Toxische Überdosierung: ${organHits.gastrointestinal.join(', ')}.`
      : hasNsaid && hasAnticoag
      ? 'Kombination aus NSAR und Antikoagulans steigert das gastrointestinale Blutungs- und Ulkusrisiko drastisch.'
      : 'Keine kumulative gastrointestinale Überlastung identifiziert.',
    renal: organHits.renal.length > 0
      ? `Toxische Überdosierung renaler Wirkstoffe: ${organHits.renal.join(', ')}.`
      : hasNsaid && hasAceArb && hasDiuretic
      ? 'Triple Whammy: NSAR + RAAS-Blocker + Diuretikum kompromittieren die glomeruläre Autoregulation massiv (akutes Nierenversagen).'
      : 'Renale Belastung im überprüfbaren Normbereich.',
    kardiovaskulaer: organHits.kardiovaskulaer.length > 0
      ? `AKUT KRITISCH: Toxische Überdosierung kardiovaskulärer Substanzen: ${organHits.kardiovaskulaer.join(', ')}.`
      : 'Kardiovaskuläres System ohne akute toxische Einzelsubstanz-Überlastung.',
    hepatisch: organHits.hepatisch.length > 0
      ? `Toxische Belastung der Leber: ${organHits.hepatisch.join(', ')}.`
      : 'Hepatische Metabolisierungslast im verifizierbaren Rahmen.',
    zns: organHits.zns.length > 0
      ? `Zentrale Überlastung: ${organHits.zns.join(', ')}.`
      : hasSedative
      ? 'Zentral dämpfende Wirkstoffkomponente vorhanden.'
      : 'Keine kumulative ZNS-Toxizität identifiziert.',
  };

  return {
    hasToxicOverdose,
    highestPercentageExceeded,
    evaluations,
    theoreticalPairCount,
    uniqueSubstancesCount: uniqueSubstances.length,
    uniqueSubstances,
    cumulativeOrganRisk: organRiskLevels,
    organRiskReasons: organReasons,
  };
}

export interface AmtsPairInteraction {
  substanceA: string;
  substanceB: string;
  severityGrade: 'Grad 4 (Kontraindiziert)' | 'Grad 3 (Schwerwiegend)' | 'Grad 2 (Mittelschwer)' | 'Grad 1 (Gering)' | 'Keine relevante Interaktion';
  mechanism: string;
  clinicalConsequence: string;
  recommendedAction: string;
}

/**
 * Deterministic Pairwise Evaluation for all pairs n * (n - 1) / 2
 */
export function evaluateAmtsPairs(uniqueSubstances: string[]): AmtsPairInteraction[] {
  const pairs: AmtsPairInteraction[] = [];
  const n = uniqueSubstances.length;
  if (n < 2) return pairs;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = uniqueSubstances[i];
      const b = uniqueSubstances[j];
      const combined = `${a} + ${b}`;

      let severityGrade: AmtsPairInteraction['severityGrade'] = 'Keine relevante Interaktion';
      let mechanism = 'Keine direkte pharmakokinetische oder pharmakodynamische Kreuzreaktion dokumentiert.';
      let clinicalConsequence = 'Kombination im klinischen Routinebereich unauffällig.';
      let recommendedAction = 'Standard-Therapieüberwachung.';

      const isA = (key: string) => a.includes(key);
      const isB = (key: string) => b.includes(key);
      const hasBoth = (k1: string, k2: string) => (isA(k1) && isB(k2)) || (isA(k2) && isB(k1));

      // 1. Beta-Blocker + Verapamil/Diltiazem
      if (hasBoth('metoprolol', 'verapamil') || hasBoth('bisoprolol', 'verapamil') || hasBoth('carvedilol', 'verapamil') || hasBoth('metoprolol', 'diltiazem')) {
        severityGrade = 'Grad 4 (Kontraindiziert)';
        mechanism = 'Synergistische negativ dromotrope und inotrope Wirkung auf den AV-Knoten und das Myokard.';
        clinicalConsequence = 'Gefahr von schwerer Bradykardie, komplettem AV-Block (Grad III) und kardiogenem Schock bis hin zur Asystolie.';
        recommendedAction = 'STRIKTE KONTRAINDIKATION: Kombination vermeiden; Dihydropyridin-Calciumantagonisten erwägen.';
      }
      // 2. NSAR + Antikoagulans / DOAK
      else if (
        (isA('ibuprofen') || isA('diclofenac') || isA('naproxen') || isA('ass') || isA('acetylsalicyl')) &&
        (isB('rivaroxaban') || isB('apixaban') || isB('edoxaban') || isB('dabigatran') || isB('marcumar') || isB('phenprocoumon'))
      ) {
        severityGrade = 'Grad 4 (Kontraindiziert)';
        mechanism = 'Addition von Thrombozytenfunktionshemmung, Schleimhauterosion (COX-1-Hemmung) und systemischer Antikoagulation.';
        clinicalConsequence = 'Dramatisch erhöhtes Risiko massiver gastrointestinaler und intrakranieller Hämorrhagien.';
        recommendedAction = 'Kombination dringend vermeiden. Falls unvermeidbar, zwingend hochdosierte PPI-Gabe und Hb-Monitoring.';
      }
      // 3. NSAR + ACE-Hemmer/Sartan
      else if (
        (isA('ibuprofen') || isA('diclofenac') || isA('naproxen')) &&
        (isB('ramipril') || isB('enalapril') || isB('candesartan') || isB('valsartan') || isB('losartan'))
      ) {
        severityGrade = 'Grad 3 (Schwerwiegend)';
        mechanism = 'NSAR hemmen Vasodilatation der Vas afferens (Prostaglandinsynthese); ACE-Hemmer dilatieren Vas efferens -> Abfall des Filtrationsdrucks.';
        clinicalConsequence = 'Akute GFR-Reduktion bis zum prärenalen Nierenversagen; Abschwächung der antihypertensiven Wirkung.';
        recommendedAction = 'Nierenretentionsparameter (Kreatinin, GFR, Kalium) engmaschig kontrollieren; Schmerzmittel-Alternative wählen.';
      }
      // 4. Statin + CYP3A4
      else if (
        (isA('simvastatin') || isA('atorvastatin')) &&
        (isB('amiodaron') || isB('verapamil') || isB('diltiazem'))
      ) {
        severityGrade = 'Grad 3 (Schwerwiegend)';
        mechanism = 'Kompetitive Inhibition des CYP3A4-Stoffwechsels führt zu massiver Statin-Akkumulation.';
        clinicalConsequence = 'Hohes Risiko für Rhabdomyolyse mit Myoglobinurie und akutem tubulärem Nierenversagen.';
        recommendedAction = 'Statindosis auf Maximaldosis limitieren oder auf Rosuvastatin/Pravastatin umstellen; CK kontrollieren.';
      }
      // 5. Spironolacton + ACE-Hemmer/Sartan
      else if (
        (isA('spironolacton') || isA('eplerenon')) &&
        (isB('ramipril') || isB('enalapril') || isB('candesartan') || isB('valsartan'))
      ) {
        severityGrade = 'Grad 3 (Schwerwiegend)';
        mechanism = 'Additive Hemmung der renalen Kaliumexkretion durch Aldosteron-Antagonismus und RAAS-Blockade.';
        clinicalConsequence = 'Gefahr lebensbedrohlicher Hyperkaliämie mit ventrikulären Herzrhythmusstörungen.';
        recommendedAction = 'Serumkalium engmaschig monitorieren; Kaliumzufuhr und kaliumhaltige Salzersatzmittel meiden.';
      }
      // 6. QTc-Verlängerung
      else if (
        (isA('citalopram') || isA('escitalopram')) &&
        (isB('amiodaron') || isB('moxifloxacin') || isB('venlafaxin') || isB('amitriptylin'))
      ) {
        severityGrade = 'Grad 3 (Schwerwiegend)';
        mechanism = 'Additive Verlängerung der myokardialen Repolarisationszeit (hERG-Kaliumkanal-Blockade).';
        clinicalConsequence = 'Erhöhtes Risiko für Torsade-de-Pointes-Tachykardien und plötzlichen Herztod.';
        recommendedAction = 'Ruhe-EKG zur Messung der QTc-Zeit zwingend; Elektrolyte (Kalium, Magnesium) im oberen Normbereich halten.';
      }
      // 7. Mehrere Sedativa
      else if (
        (isA('diazepam') || isA('lorazepam') || isA('zolpidem')) &&
        (isB('tramadol') || isB('tilidin') || isB('pregabalin') || isB('gabapentin'))
      ) {
        severityGrade = 'Grad 3 (Schwerwiegend)';
        mechanism = 'Potenzierung der GABAergen und zentralen Neurotransmissionshemmung.';
        clinicalConsequence = 'Schwere Sedierung, Atemdepression, psychomotorische Verlangsamung und erhebliche Sturzgefahr.';
        recommendedAction = 'Dosisreduktion; Patienten und Angehörige über Überhang und Sturzrisiko aufklären; Vigilanz überwachen.';
      }

      pairs.push({
        substanceA: a,
        substanceB: b,
        severityGrade,
        mechanism,
        clinicalConsequence,
        recommendedAction,
      });
    }
  }

  return pairs;
}

/**
 * Builds the complete clinical AMTS v5.0 Markdown report adhering to BfArM guidelines.
 */
export function generateAmtsReportMarkdown(
  amtsResult: AmtsEvaluationResult,
  pairs: AmtsPairInteraction[],
  patientDetails: {
    name?: string;
    age?: number | null;
    gender?: string;
    weightKg: number;
    heightCm: number;
    bmi?: number;
    isPregnant?: boolean;
    pregnancyMonth?: number;
    isSmoker?: boolean;
    hasAlcohol?: boolean;
  },
  language: string = 'de'
): { markdown: string; triageLevel: 'critical' | 'high' | 'low'; triageLabel: string } {
  const { hasToxicOverdose, evaluations, theoreticalPairCount, cumulativeOrganRisk, organRiskReasons } = amtsResult;

  const overdosedDrugs = evaluations.filter(e => e.status === 'TOXISCH_UEBERDOSIERT');
  const grade4Pairs = pairs.filter(p => p.severityGrade.includes('Grad 4'));
  const grade3Pairs = pairs.filter(p => p.severityGrade.includes('Grad 3'));

  let triageLevel: 'critical' | 'high' | 'low' = 'low';
  let triageLabel = '[GERING / ÜBERWACHUNG]';

  if (hasToxicOverdose || grade4Pairs.length > 0 || (patientDetails.isPregnant && patientDetails.hasAlcohol)) {
    triageLevel = 'critical';
    triageLabel = '[KRITISCH / AKUTE LEBENSGEFAHR]';
  } else if (grade3Pairs.length > 0 || evaluations.some(e => e.status === 'NICHT_BEURTEILBAR' && evaluations.length >= 3)) {
    triageLevel = 'high';
    triageLabel = '[HOCH]';
  }

  // Section 1: Triage narrative
  let triageExplanation = '';
  if (hasToxicOverdose) {
    const overdoseDetails = overdosedDrugs.map(d => 
      `**${d.drugName}** (berechnete Tagesdosis: **${d.dailyDoseMg} mg/Tag**, Standard-Höchstdosis: ${d.maxDailyDoseMg} mg/Tag, **+${d.percentageExceeded}% Überschreitung**)`
    ).join('; ');
    triageExplanation = `🚨 **NOTFALL-ALARM - TOXISCHE ÜBERDOSIERUNG IDENTIFIZIERT:** ${overdoseDetails}. Es besteht unmittelbare vitale Gefährdung für das Zielorgan (${overdosedDrugs.map(d => d.targetOrgan.toUpperCase()).join(', ')}). Sofortige ärztliche Notfallintervention und Einnahmestopp dieser toxischen Dosis erforderlich!`;
  } else if (grade4Pairs.length > 0) {
    triageExplanation = `🚨 **KONTRAINDIZIERTE KOMBINATION:** Mindestens eine Wirkstoffkombination ist absolut kontraindiziert (${grade4Pairs.map(p => `${p.substanceA} + ${p.substanceB}`).join(', ')}). Vitale Gefährdung durch pharmakodynamische Kreuztoxizität.`;
  } else if (grade3Pairs.length > 0) {
    triageExplanation = `⚠️ **ERHÖHTE KLINISCHE WACHSAMKEIT (Grad 3 Interaktion):** Schwerwiegende Wechselwirkungen zwischen den verordneten Wirkstoffen erfordern engmaschige Dosiskontrollen und Labormonitoring.`;
  } else {
    triageExplanation = `Die verordneten Einzeldosen liegen im üblichen Referenzrahmen. Es wurden keine vital bedrohlichen Wechselwirkungen identifiziert. Reguläre Verlaufsüberwachung.`;
  }

  // Section 2: Quantitative Dosage Table
  const dosageRows = evaluations.map(e => {
    const singleStr = e.singleDoseMg !== null ? `${e.singleDoseMg} mg` : 'k. A.';
    const dailyStr = e.dailyDoseMg !== null ? `**${e.dailyDoseMg} mg/Tag**` : 'Nicht berechenbar';
    const maxStr = e.maxDailyDoseMg !== null ? `${e.maxDailyDoseMg} mg/Tag` : '–';
    const percentStr = e.percentageExceeded !== null ? `**+${e.percentageExceeded}%**` : '0%';
    const statusBadge = e.status === 'TOXISCH_UEBERDOSIERT'
      ? `🚨 **TOXISCH_UEBERDOSIERT** <br>*(Ziel: ${e.targetOrgan})*`
      : e.status === 'NICHT_BEURTEILBAR'
      ? `⚪ **NICHT_BEURTEILBAR**`
      : `✅ **NORMAL**`;

    return `| **${e.drugName}** <br>*(${e.substance})* | ${singleStr} | ${e.frequencyPer24h}x / 24h | ${dailyStr} | ${maxStr} | ${percentStr} | ${statusBadge} | ${e.clinicalRiskSummary} |`;
  }).join('\n');

  // Section 3: Pairwise Interaction Table
  let pairsTable = '';
  if (pairs.length > 0) {
    const pairRows = pairs.map(p => {
      const badge = p.severityGrade.includes('Grad 4')
        ? `🛑 **${p.severityGrade}**`
        : p.severityGrade.includes('Grad 3')
        ? `⚠️ **${p.severityGrade}**`
        : p.severityGrade.includes('Grad 2')
        ? `🔶 **${p.severityGrade}**`
        : `🟢 **${p.severityGrade}**`;

      return `| **${p.substanceA.toUpperCase()}** + **${p.substanceB.toUpperCase()}** | ${badge} | ${p.mechanism} | ${p.clinicalConsequence} | ${p.recommendedAction} |`;
    }).join('\n');

    pairsTable = `| Analysierte Wirkstoff-Paarung | AMTS-Schweregrad | Biologischer Wirkmechanismus | Klinische Konsequenz | Priorisierte Handlungsempfehlung |
| :--- | :--- | :--- | :--- | :--- |
${pairRows}`;
  } else {
    pairsTable = `*Nur eine Einzelsubstanz erfasst (n = 1). Die theoretische Anzahl disjunkter Paare n * (n - 1) / 2 beträgt 0.*`;
  }

  // Section 4: Cumulative Organ Toxicity Table
  const organBadge = (lvl: string) => {
    if (lvl === 'KRITISCH') return '🚨 **KRITISCH**';
    if (lvl === 'HOCH') return '⚠️ **HOCH**';
    if (lvl === 'MITTEL') return '🔶 **MITTEL**';
    return '🟢 **GERING**';
  };

  const organTable = `| Ziel-Organsystem | Kumulative Risikostufe | Pathophysiologische Begründung & Leitlinien-Referenz |
| :--- | :--- | :--- |
| **Gastrointestinal** *(Blutungen, Ulzera)* | ${organBadge(cumulativeOrganRisk.gastrointestinal)} | ${organRiskReasons.gastrointestinal || 'Keine signifikante Überlastung.'} |
| **Renal** *(GFR, Tubulustoxizität, Elektrolyte)* | ${organBadge(cumulativeOrganRisk.renal)} | ${organRiskReasons.renal || 'Glomeruläre Autoregulation stabil.'} |
| **Kardiovaskulär** *(Rhythmus, Bradykardie, Schock)* | ${organBadge(cumulativeOrganRisk.kardiovaskulaer)} | ${organRiskReasons.kardiovaskulaer || 'Kardiodynamik im Normbereich.'} |
| **Hepatisch** *(Metabolisierung, Transaminasen)* | ${organBadge(cumulativeOrganRisk.hepatisch)} | ${organRiskReasons.hepatisch || 'Hepatische Clearance unauffällig.'} |
| **Zentralnervensystem** *(Sedierung, Vigilanz)* | ${organBadge(cumulativeOrganRisk.zns)} | ${organRiskReasons.zns || 'Keine akute Neurotoxizität.'} |`;

  // Section 5: Diagnostic Guide & Emergency Checklist
  const emergencyQuestions = overdosedDrugs.length > 0
    ? overdosedDrugs.map(d => `- "DRINGENDE FRAGE: Die berechnete Tagesdosis von ${d.drugName} beträgt ${d.dailyDoseMg} mg/Tag (Höchstdosis: ${d.maxDailyDoseMg} mg/Tag). Wurde diese Dosierung (${d.frequencyPer24h}x täglich) absichtlich verordnet oder liegt ein Übertragungsfehler vor?"`).join('\n')
    : `- "Besteht bei der aktuellen Kombination von ${evaluations.map(e => e.drugName).join(', ')} die Notwendigkeit einer Dosisanpassung an mein Körpergewicht (${patientDetails.weightKg} kg)?"`;

  const markdown = `### ⚠️ WICHTIGER MEDIZINISCHER WARNHINWEIS
"Dieses AMTS-Analysemodul dient der klinischen Risiko-Früherkennung und orientiert sich an den Richtlinien des BfArM und der Arzneimittelkommission der Deutschen Ärzteschaft (AkdÄ). Es stellt keine eigenständige Diagnose dar und ersetzt keinesfalls die persönliche ärztliche oder toxikologische Konsultation."

### 1. KLINISCHE DRINGLICHKEIT & AMTS-TRIAGE (v5.0)
${triageLabel}

${triageExplanation}

- **Analysierter Patient:** ${patientDetails.name || 'Patient/in'} (${patientDetails.age ? `${patientDetails.age} Jahre` : 'Alter nicht angegeben'}, ${patientDetails.gender || 'k. A.'}, ${patientDetails.weightKg} kg, ${patientDetails.heightCm} cm${patientDetails.bmi ? `, BMI ${patientDetails.bmi} kg/m²` : ''})
- **Schwangerschaftsstatus:** ${patientDetails.isPregnant ? `Ja, ${patientDetails.pregnancyMonth || 1}. Monat` : 'Nicht schwanger'}
- **Genussmittel:** Rauchen: ${patientDetails.isSmoker ? 'Ja' : 'Nein'} | Alkoholkonsum: ${patientDetails.hasAlcohol ? 'Ja' : 'Nein'}

### 2. QUANTITATIVE DOSIERUNGSBERECHNUNG & HOECHSTDOSIS-VERGLEICH (BfArM / Rote Liste)
*Mathematische Berechnung der 24h-Gesamttagesdosis: (Einzeldosis) x (Einnahmehäufigkeit pro Tag).*

| Wirkstoff / Handelsname | Einzeldosis | Frequenz (24h) | 24h-Tagesdosis | BfArM-Höchstdosis | Abweichung | Status & Zielorgan | Klinische Risikobewertung |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${dosageRows}

### 3. DETERMINISTISCHE PAARWEISE INTERAKTIONSMATRIX
*Theoretische Anzahl disjunkter 2er-Kombinationen n * (n - 1) / 2 = **${theoreticalPairCount}** Paare.*

${pairsTable}

### 4. KUMULATIVE MULTI-DRUG- & ORGAN-TOXIZITÄT (5 ZIELSYSTEME)

${organTable}

### 5. DIAGNOSTISCHER LEITFADEN FÜR DEN ARZTBESUCH & NOTFALL-CHECKLISTE
**Konkrete Fragen an den behandelnden Arzt:**
${emergencyQuestions}
- "Sollte ein Magenschutz (PPI) zur Entlastung der Schleimhaut verordnet werden?"
- "Welche Intervalle für Labor- und Vitalwertkontrollen sind indiziert?"

**Priorisierte Labor- und Diagnostik-Anforderungen:**
- **EKG-Diagnostik:** 12-Kanal-EKG zur Bestimmung der Herzfrequenz, PQ-Zeit (AV-Block-Ausschluss) und QTc-Zeit.
- **Vitalparameter:** Blutdruck- und Pulskontrolle in Ruhe und Belastung (Ausschluss schwerer Bradykardie/Hypotonie).
- **Klinische Chemie:** Serum-Kreatinin, eGFR (CKD-EPI), Elektrolyte (Kalium, Natrium), Transaminasen (GOT, GPT, GGT).

**🚨 ALARMSYMPTOME FÜR DEN SOFORTIGEN NOTRUF (112):**
- Extremer Schwindel, Ohnmachtsgefühl, Synkopen oder Pulsabfall unter 45 Schläge/Minute.
- Kardiogener Schock: Kaltschweißigkeit, Blässe, akute Verwirrtheit, Atemnot.
- Schwarzer Teerstuhl, Bluterbrechen oder plötzliche krampfartige Magen-Darm-Schmerzen.`;

  return {
    markdown,
    triageLevel,
    triageLabel,
  };
}

