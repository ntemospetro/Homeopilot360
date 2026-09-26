import { MATERIA_MEDICA_PART1 } from './materiaMedicaPart1';
import { MATERIA_MEDICA_PART2 } from './materiaMedicaPart2';
import { MATERIA_MEDICA_PART3 } from './materiaMedicaPart3';
import { MATERIA_MEDICA_PART4 } from './materiaMedicaPart4';
import { MATERIA_MEDICA_PART5 } from './materiaMedicaPart5';
import { MATERIA_MEDICA_PART6 } from './materiaMedicaPart6';
import { MATERIA_MEDICA_PART7 } from './materiaMedicaPart7';
import { MATERIA_MEDICA_PART8 } from './materiaMedicaPart8';
import { MATERIA_MEDICA_PART9 } from './materiaMedicaPart9';
import { MATERIA_MEDICA_PART10 } from './materiaMedicaPart10';
import { MATERIA_MEDICA_PART11 } from './materiaMedicaPart11';
import { MATERIA_MEDICA_PART12 } from './materiaMedicaPart12';
import { MATERIA_MEDICA_PART13 } from './materiaMedicaPart13';
import { MATERIA_MEDICA_PART14 } from './materiaMedicaPart14';
import { MATERIA_MEDICA_PART15 } from './materiaMedicaPart15';
import { MATERIA_MEDICA_PART16 } from './materiaMedicaPart16';
import { MATERIA_MEDICA_PART17 } from './materiaMedicaPart17';
import { MATERIA_MEDICA_PART18 } from './materiaMedicaPart18';
import { MATERIA_MEDICA_PART19 } from './materiaMedicaPart19';
import { MATERIA_MEDICA_PART20 } from './materiaMedicaPart20';
import { MATERIA_MEDICA_PART21 } from './materiaMedicaPart21';
import { MATERIA_MEDICA_PART22 } from './materiaMedicaPart22';
import { MATERIA_MEDICA_PART23 } from './materiaMedicaPart23';
import { MATERIA_MEDICA_PART24 } from './materiaMedicaPart24';
import { MATERIA_MEDICA_PART25 } from './materiaMedicaPart25';
import { MATERIA_MEDICA_PART26 } from './materiaMedicaPart26';
import { MATERIA_MEDICA_PART27 } from './materiaMedicaPart27';
import { MATERIA_MEDICA_PART28 } from './materiaMedicaPart28';
import { MATERIA_MEDICA_PART29 } from './materiaMedicaPart29';
import { MATERIA_MEDICA_PART30 } from './materiaMedicaPart30';
import { MATERIA_MEDICA_PART31 } from './materiaMedicaPart31';
import { MATERIA_MEDICA_PART32 } from './materiaMedicaPart32';
import { MATERIA_MEDICA_PART33 } from './materiaMedicaPart33';
import { MATERIA_MEDICA_PART34 } from './materiaMedicaPart34';
import { MATERIA_MEDICA_PART35 } from './materiaMedicaPart35';
import { MATERIA_MEDICA_PART36 } from './materiaMedicaPart36';
import { 
  deduplicateAndMergeMateriaMedica, 
  MateriaMedicaEntry, 
  getLocalizedRemedy,
  LocalizedRemedy
} from './materiaMedicaData';
import { LanguageCode } from '../types';

export const MATERIA_MEDICA_ENTRIES: MateriaMedicaEntry[] = deduplicateAndMergeMateriaMedica([
  ...MATERIA_MEDICA_PART1,
  ...MATERIA_MEDICA_PART2,
  ...MATERIA_MEDICA_PART3,
  ...MATERIA_MEDICA_PART4,
  ...MATERIA_MEDICA_PART5,
  ...MATERIA_MEDICA_PART6,
  ...MATERIA_MEDICA_PART7,
  ...MATERIA_MEDICA_PART8,
  ...MATERIA_MEDICA_PART9,
  ...MATERIA_MEDICA_PART10,
  ...MATERIA_MEDICA_PART11,
  ...MATERIA_MEDICA_PART12,
  ...MATERIA_MEDICA_PART13,
  ...MATERIA_MEDICA_PART14,
  ...MATERIA_MEDICA_PART15,
  ...MATERIA_MEDICA_PART16,
  ...MATERIA_MEDICA_PART17,
  ...MATERIA_MEDICA_PART18,
  ...MATERIA_MEDICA_PART19,
  ...MATERIA_MEDICA_PART20,
  ...MATERIA_MEDICA_PART21,
  ...MATERIA_MEDICA_PART22,
  ...MATERIA_MEDICA_PART23,
  ...MATERIA_MEDICA_PART24,
  ...MATERIA_MEDICA_PART25,
  ...MATERIA_MEDICA_PART26,
  ...MATERIA_MEDICA_PART27,
  ...MATERIA_MEDICA_PART28,
  ...MATERIA_MEDICA_PART29,
  ...MATERIA_MEDICA_PART30,
  ...MATERIA_MEDICA_PART31,
  ...MATERIA_MEDICA_PART32,
  ...MATERIA_MEDICA_PART33,
  ...MATERIA_MEDICA_PART34,
  ...MATERIA_MEDICA_PART35,
  ...MATERIA_MEDICA_PART36
]);

const localizedRemediesCache = new Map<LanguageCode, LocalizedRemedy[]>();

export function getLocalizedRemedies(lang: LanguageCode): LocalizedRemedy[] {
  const cached = localizedRemediesCache.get(lang);
  if (cached) return cached;
  const remedies = MATERIA_MEDICA_ENTRIES.map((entry) => getLocalizedRemedy(entry, lang));
  localizedRemediesCache.set(lang, remedies);
  return remedies;
}
