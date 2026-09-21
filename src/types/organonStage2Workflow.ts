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

export function getNextStage2Category(current: Stage2Category): Stage2Category | 'GLOBAL_REVIEW' {
  const currentIndex = STAGE2_CATEGORY_SEQUENCE.indexOf(current);
  if (currentIndex >= 0 && currentIndex < STAGE2_CATEGORY_SEQUENCE.length - 1) {
    return STAGE2_CATEGORY_SEQUENCE[currentIndex + 1];
  }
  return 'GLOBAL_REVIEW';
}
