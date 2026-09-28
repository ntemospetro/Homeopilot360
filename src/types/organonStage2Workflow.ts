/**
 * Organon Stage-2 Unified Workflow & Orchestrator Type Definitions
 * Based on Organon §§ 83–104
 */

import type { TranslationKey } from '../i18n/translations';

export type Stage2Category =
  | 'CAUSA'
  | 'LOCALISATIO'
  | 'SENSATIO'
  | 'SYMPTOMA'
  | 'MODALITATES_BESSERUNG'
  | 'MODALITATES_VERSCHLECHTERUNG'
  | 'SYMPTOMATA_CONCOMITANTIA'
  | 'COMORBIDITAS'
  | 'MENS'
  | 'ANIMUS';

export type Stage2WorkflowState =
  | 'NOT_STARTED'
  | Stage2Category
  | 'GLOBAL_REVIEW'
  | 'RESIDUAL_CLARIFICATION'
  | 'COMPLETED';

export type CategoryCompletionStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'SKIPPED_SUFFICIENT'
  | 'OBSOLETE';

export interface CategoryResultRecord {
  category: Stage2Category;
  status: CategoryCompletionStatus;
  summaryText?: string;
  text?: string;
  timestamp?: string;
  completedAt?: string;
  details?: any;
}

export interface Stage2CategoryMetadata {
  id: Stage2Category;
  code: string;
  organonIndex: number;
  labelKey: TranslationKey;
  questionKey: TranslationKey;
  dimensionsCode: string;
  dimensionCount: number;
  dimensionsSummary: string;
}

export const STAGE2_CATEGORY_SEQUENCE: Stage2Category[] = [
  'CAUSA',
  'LOCALISATIO',
  'SENSATIO',
  'SYMPTOMA',
  'MODALITATES_BESSERUNG',
  'MODALITATES_VERSCHLECHTERUNG',
  'SYMPTOMATA_CONCOMITANTIA',
  'COMORBIDITAS',
  'MENS',
  'ANIMUS'
];

export const STAGE2_CATEGORY_META: Record<Stage2Category, Stage2CategoryMetadata> = {
  CAUSA: {
    id: 'CAUSA',
    code: 'causa',
    organonIndex: 1,
    labelKey: 'stage2StepCausa',
    questionKey: 'stage2CausaQuestion',
    dimensionsCode: 'C1–C13',
    dimensionCount: 13,
    dimensionsSummary: 'Chronologie, Noxe, Psychisch, Physisch, Miasmatisch'
  },
  LOCALISATIO: {
    id: 'LOCALISATIO',
    code: 'localisatio',
    organonIndex: 2,
    labelKey: 'stage2StepLocalisatio',
    questionKey: 'stage2LocalisatioQuestion',
    dimensionsCode: 'L1–L7',
    dimensionCount: 7,
    dimensionsSummary: 'Hauptregion, Unterregion, Lateralität, Tiefe, Ausdehnung, Verteilung, Dynamik'
  },
  SENSATIO: {
    id: 'SENSATIO',
    code: 'sensatio',
    organonIndex: 3,
    labelKey: 'stage2StepSensatio',
    questionKey: 'stage2SensatioQuestion',
    dimensionsCode: 'S1–S5',
    dimensionCount: 5,
    dimensionsSummary: 'Basale Schmerzqualität, Metaphorische Vergleiche, Begleitwahrnehmungen, Intensität/Verlauf, Eigenartigkeit'
  },
  SYMPTOMA: {
    id: 'SYMPTOMA',
    code: 'symptoma',
    organonIndex: 4,
    labelKey: 'stage2StepSymptoma',
    questionKey: 'stage2SymptomaQuestion',
    dimensionsCode: 'Y1–Y5',
    dimensionCount: 5,
    dimensionsSummary: 'Morphologie/Läsion, Funktionseinschränkung, Absonderung, Rhythmik/Periodizität, Zeitlicher Verlauf'
  },
  MODALITATES_BESSERUNG: {
    id: 'MODALITATES_BESSERUNG',
    code: 'modalitates_besserung',
    organonIndex: 5,
    labelKey: 'stage2StepModalitatesBesserung',
    questionKey: 'stage2ModBesserungQuestion',
    dimensionsCode: 'MB1–MB6',
    dimensionCount: 6,
    dimensionsSummary: 'Thermisch/Witterung, Mechanisch/Haltung, Physiologisch, Zeit/Periodik, Umwelt/Atmosphäre, Spezifische Einflüsse'
  },
  MODALITATES_VERSCHLECHTERUNG: {
    id: 'MODALITATES_VERSCHLECHTERUNG',
    code: 'modalitates_verschlechterung',
    organonIndex: 6,
    labelKey: 'stage2StepModalitatesVerschlechterung',
    questionKey: 'stage2ModVerschlechterungQuestion',
    dimensionsCode: 'MV1–MV6',
    dimensionCount: 6,
    dimensionsSummary: 'Thermisch/Witterung, Mechanisch/Haltung, Physiologisch, Zeit/Periodik, Umwelt/Atmosphäre, Spezifische Belastungen'
  },
  SYMPTOMATA_CONCOMITANTIA: {
    id: 'SYMPTOMATA_CONCOMITANTIA',
    code: 'symptomata_concomitantia',
    organonIndex: 7,
    labelKey: 'stage2StepConcomitantia',
    questionKey: 'stage2ConcomitantiaQuestion',
    dimensionsCode: 'SC1–SC5',
    dimensionCount: 5,
    dimensionsSummary: 'Körperliche Begleitsymptome, Vegetative Reaktionen, Affektive/Kognitive Kopplung, Dissoziierte Phänomene, Patientenhypothesen'
  },
  COMORBIDITAS: {
    id: 'COMORBIDITAS',
    code: 'comorbiditas',
    organonIndex: 8,
    labelKey: 'stage2StepComorbiditas',
    questionKey: 'stage2ComorbiditasQuestion',
    dimensionsCode: 'CO1–CO4',
    dimensionCount: 4,
    dimensionsSummary: 'Parallele chronische Erkrankungen, Vorerkrankungen/Biografie, Medikamentöse Vorbehandlung, Familienanamnese'
  },
  MENS: {
    id: 'MENS',
    code: 'mens',
    organonIndex: 9,
    labelKey: 'stage2StepMens',
    questionKey: 'stage2MensQuestion',
    dimensionsCode: 'ME1–ME4',
    dimensionCount: 4,
    dimensionsSummary: 'Kognitive Klarheit, Denkgeschwindigkeit, Wahrnehmungsverzerrungen/Illusionen, Sprach-/Gedankenfluss'
  },
  ANIMUS: {
    id: 'ANIMUS',
    code: 'animus',
    organonIndex: 10,
    labelKey: 'stage2StepAnimus',
    questionKey: 'stage2AnimusQuestion',
    dimensionsCode: 'AN1–AN5',
    dimensionCount: 5,
    dimensionsSummary: 'Grundstimmung, Affektive Reaktivität, Ängste/Phobien, Interpersonelles Verhalten, Willensimpulse/Antrieb'
  }
};

export const STAGE2_CATEGORIES_METADATA = STAGE2_CATEGORY_META;

export const STAGE2_FROZEN_DIMENSIONS_MAP: Record<string, { code: string; title: string; desc: string }[]> = {
  CAUSA: [
    { code: 'C1', title: 'Zeitlicher Erstbeginn & Chronologie', desc: 'Wann traten die Beschwerden zum allerersten Mal auf?' },
    { code: 'C2', title: 'Vorausgehende Lebenssituation & Vorphase', desc: 'Besondere Belastungen, Umstände oder körperliche Verfassung vor Beginn' },
    { code: 'C3', title: 'Konkrete auslösende Einwirkungen', desc: 'Kälte, Nässe, Zugluft, Schreck, Ärger, Verletzung, Infekt' },
    { code: 'C4', title: 'Eigene Ursachenzuschreibung des Patienten', desc: 'Was vermutet der Patient selbst als Ursache oder Auslöser?' },
    { code: 'C5', title: 'Organismischer Ausgangszustand', desc: 'Körperliche und seelische Verfassung unmittelbar vor Krankheitsausbruch' }
  ],
  LOCALISATIO: [
    { code: 'L1', title: 'Genaue anatomische Lokalisation', desc: 'Exakter Ort, Organ, Gewebe, Seite (rechts/links/einseitig)' },
    { code: 'L2', title: 'Ausdehnung & Schmerzausstrahlung', desc: 'Wohin strahlen die Beschwerden aus, Wanderungsrichtung' },
    { code: 'L3', title: 'Oberflächlich vs. Tiefenstruktur', desc: 'Haut, Muskel, Knochen, innere Organe, Tiefe des Schmerzes' },
    { code: 'L4', title: 'Seitigkeit & Seitenwechsel', desc: 'Rechts, links, beidseitig, diagonales Muster, Seitenwechsel' }
  ],
  SENSATIO: [
    { code: 'S1', title: 'Basale Schmerz- & Empfindungsqualität', desc: 'Brennend, stechend, dumpf, krampfend, pochend, reißend' },
    { code: 'S2', title: 'Metaphorische Vergleiche', desc: '„Wie ein enges Band“, „wie glühende Kohlen“, „wie zersplittertes Glas“' },
    { code: 'S3', title: 'Sensorische Begleitwahrnehmungen', desc: 'Kribbeln, Taubheit, Kälte-/Hitzegefühl im Areal' },
    { code: 'S4', title: 'Intensität & zeitlicher Verlauf', desc: 'Plötzlich einschießend vs. allmählich ansteigend, wellenförmig' },
    { code: 'S5', title: 'Subjektive Eigenartigkeit', desc: 'Ungewöhnliche, paradoxe oder seltene Empfindungsausprägungen (§ 153)' }
  ],
  SYMPTOMA: [
    { code: 'Y1', title: 'Phänomenologische Kernstruktur', desc: 'Primäre pathologische Manifestation im Wortlaut des Patienten' },
    { code: 'Y2', title: 'Funktionsbeeinträchtigung', desc: 'Einschränkung von Bewegung, Sprache, Schlaf, Organfunktionen' },
    { code: 'Y3', title: 'Sichtbare / messbare Zeichen', desc: 'Schwellung, Rötung, Absonderungen, Vitalzeichen' },
    { code: 'Y4', title: 'Rhythmik & Periodizität', desc: 'Auftretensmuster, tägliche/monatliche Wiederkehr, Anfallscharakter' },
    { code: 'Y5', title: 'Systemische Reaktionen', desc: 'Fieber, Schüttelfrost, allgemeine Erschöpfung, Schwäche' }
  ],
  MODALITATES_BESSERUNG: [
    { code: 'MB1', title: 'Thermisch & Klimatisch', desc: 'Wärme, Kälte, frische Luft, Zimmerwärme, Einhüllen' },
    { code: 'MB2', title: 'Haltung & Bewegung', desc: 'Ruhe, Gehen, Liegen auf schmerzhafter Seite, Zusammenkrümmen' },
    { code: 'MB3', title: 'Zeitlich & Zirkadian', desc: 'Morgens, abends, nach dem Schlaf, bestimmte Uhrzeiten' },
    { code: 'MB4', title: 'Physiologisch & Ernährung', desc: 'Essen, Trinken warm/kalt, Fasten, Entleerung' },
    { code: 'MB5', title: 'Umgebung & Sensorisch', desc: 'Dunkelheit, Stille, Druck/Massage, Alleinsein' },
    { code: 'MB6', title: 'Psychisch & Emotional', desc: 'Ablenkung, Trost, Zuspruch, Beschäftigung' }
  ],
  MODALITATES_VERSCHLECHTERUNG: [
    { code: 'MV1', title: 'Thermisch & Klimatisch', desc: 'Kälte, Zugluft, Nässe, Wetterwechsel, Sommerhitze' },
    { code: 'MV2', title: 'Haltung & Bewegung', desc: 'Erste Bewegung, fortgesetzte Bewegung, Bücken, Erschütterung' },
    { code: 'MV3', title: 'Zeitlich & Zirkadian', desc: 'Nachts (z.B. 2–4 Uhr), nachmittags, beim Erwachen' },
    { code: 'MV4', title: 'Physiologisch & Ernährung', desc: 'Nach dem Essen, bestimmte Nahrungsmittel, Berührung' },
    { code: 'MV5', title: 'Umgebung & Sensorisch', desc: 'Lärm, Licht, Gerüche, Gesellschaft, Gewitterstimmung' },
    { code: 'MV6', title: 'Psychisch & Emotional', desc: 'Ärger, Kummer, Widerspruch, Trost, Schreck' }
  ],
  SYMPTOMATA_CONCOMITANTIA: [
    { code: 'SC1', title: 'Körperliche Begleiterscheinungen', desc: 'Gleichzeitig auftretende körperliche Phänomene an anderen Orten' },
    { code: 'SC2', title: 'Mentale Begleitreaktionen', desc: 'Geistige Trägheit, Reizbarkeit oder Ängstlichkeit während der Attacke' },
    { code: 'SC3', title: 'Zeitliches Kopplungsmuster', desc: 'Synchrones vs. alternierendes Auftreten zum Leitsymptom' },
    { code: 'SC4', title: 'Physiologische Begleitachsen', desc: 'Schwitzen, Durstveränderung, Übelkeit, Harndrang' },
    { code: 'SC5', title: 'Polarität & Diskrepanz', desc: 'Auffällige, scheinbar paradoxe Symptomenkombinationen (§ 153)' }
  ],
  COMORBIDITAS: [
    { code: 'CO1', title: 'Chronische Vorerkrankungen', desc: 'Bestehende Diagnosen, Grundleiden, Organdysfunktionen' },
    { code: 'CO2', title: 'Frühere Akuterkrankungen', desc: 'Frühere schwere Infektionen, Operationen, Traumata' },
    { code: 'CO3', title: 'Miasmatischer & familiärer Hintergrund', desc: 'Hautleiden, hereditäre Belastungen, konstitutionelle Neigung' },
    { code: 'CO4', title: 'Medikamentöse Vorbehandlung', desc: 'Dauermedikation, Unterdrückungen, vorangegangene Therapien' }
  ],
  MENS: [
    { code: 'ME1', title: 'Kognitive Klarheit & Konzentration', desc: 'Benommenheit, Verwirrtheit, Konzentrationsschwäche, geistige Frische' },
    { code: 'ME2', title: 'Gedankengeschwindigkeit & Ideenfluss', desc: 'Flüchtige Gedanken, Gedankenverlangsamung, Zwangsgedanken' },
    { code: 'ME3', title: 'Gedächtnis & Orientierung', desc: 'Vergesslichkeit für Namen/Worte, zeitliche Desorientierung' },
    { code: 'ME4', title: 'Entscheidungsfähigkeit & Willensregung', desc: 'Unentschlossenheit, Willensschwäche, Impulsivität' }
  ],
  ANIMUS: [
    { code: 'AN1', title: 'Grundstimmung & Affektlage', desc: 'Traurigkeit, Weinen, Gleichgültigkeit, Heiterkeit, Niedergeschlagenheit' },
    { code: 'AN2', title: 'Reaktionsmuster & Reizbarkeit', desc: 'Jähzorn, Empfindlichkeit gegen Widerspruch, Ungeduld' },
    { code: 'AN3', title: 'Ängste & Befürchtungen', desc: 'Todesangst, Angst vor Alleinsein, Dunkelheit, Krankheitsangst' },
    { code: 'AN4', title: 'Soziales Kontaktverhalten', desc: 'Verlangen nach Gesellschaft vs. Abneigung gegen Menschen' },
    { code: 'AN5', title: 'Eigenwahrnehmung des Gemüts', desc: 'Selbsteinschätzung der seelischen Veränderung seit Krankheitsbeginn' }
  ]
};

export function getNextStage2Category(current: Stage2Category): Stage2Category | 'GLOBAL_REVIEW' {
  const currentIndex = STAGE2_CATEGORY_SEQUENCE.indexOf(current);
  if (currentIndex >= 0 && currentIndex < STAGE2_CATEGORY_SEQUENCE.length - 1) {
    return STAGE2_CATEGORY_SEQUENCE[currentIndex + 1];
  }
  return 'GLOBAL_REVIEW';
}
