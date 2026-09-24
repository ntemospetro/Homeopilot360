
import { MATERIA_MEDICA_PART1 } from './src/data/materiaMedicaPart1';
import { MATERIA_MEDICA_PART2 } from './src/data/materiaMedicaPart2';
import { MATERIA_MEDICA_PART3 } from './src/data/materiaMedicaPart3';
import { MATERIA_MEDICA_PART4 } from './src/data/materiaMedicaPart4';
import { MATERIA_MEDICA_PART5 } from './src/data/materiaMedicaPart5';
import { MATERIA_MEDICA_PART6 } from './src/data/materiaMedicaPart6';
import { MATERIA_MEDICA_PART7 } from './src/data/materiaMedicaPart7';
import { MATERIA_MEDICA_PART8 } from './src/data/materiaMedicaPart8';
import { MATERIA_MEDICA_PART9 } from './src/data/materiaMedicaPart9';
import { MATERIA_MEDICA_PART10 } from './src/data/materiaMedicaPart10';
import { MATERIA_MEDICA_PART11 } from './src/data/materiaMedicaPart11';
import { MATERIA_MEDICA_PART12 } from './src/data/materiaMedicaPart12';
import { MATERIA_MEDICA_PART13 } from './src/data/materiaMedicaPart13';
import { MATERIA_MEDICA_PART14 } from './src/data/materiaMedicaPart14';
import { MATERIA_MEDICA_PART15 } from './src/data/materiaMedicaPart15';
import { MATERIA_MEDICA_PART16 } from './src/data/materiaMedicaPart16';
import { MATERIA_MEDICA_PART17 } from './src/data/materiaMedicaPart17';
import { MATERIA_MEDICA_PART18 } from './src/data/materiaMedicaPart18';
import { MATERIA_MEDICA_PART19 } from './src/data/materiaMedicaPart19';
import { MATERIA_MEDICA_PART20 } from './src/data/materiaMedicaPart20';
import { MATERIA_MEDICA_PART21 } from './src/data/materiaMedicaPart21';
import { MATERIA_MEDICA_PART22 } from './src/data/materiaMedicaPart22';
import { MATERIA_MEDICA_PART23 } from './src/data/materiaMedicaPart23';
import { MATERIA_MEDICA_PART24 } from './src/data/materiaMedicaPart24';
import { MATERIA_MEDICA_PART25 } from './src/data/materiaMedicaPart25';
import { MATERIA_MEDICA_PART26 } from './src/data/materiaMedicaPart26';
import { MATERIA_MEDICA_PART27 } from './src/data/materiaMedicaPart27';
import { MATERIA_MEDICA_PART28 } from './src/data/materiaMedicaPart28';
import { MATERIA_MEDICA_PART29 } from './src/data/materiaMedicaPart29';
import { MATERIA_MEDICA_PART30 } from './src/data/materiaMedicaPart30';
import { MATERIA_MEDICA_PART31 } from './src/data/materiaMedicaPart31';
import { MATERIA_MEDICA_PART32 } from './src/data/materiaMedicaPart32';
import { MATERIA_MEDICA_PART33 } from './src/data/materiaMedicaPart33';
import { MATERIA_MEDICA_PART34 } from './src/data/materiaMedicaPart34';
import { MATERIA_MEDICA_PART35 } from './src/data/materiaMedicaPart35';
import { MATERIA_MEDICA_PART36 } from './src/data/materiaMedicaPart36';
import fs from 'fs';

const parts = [
  { name: 'PART1', data: MATERIA_MEDICA_PART1, path: './src/data/materiaMedicaPart1.ts' },
  { name: 'PART2', data: MATERIA_MEDICA_PART2, path: './src/data/materiaMedicaPart2.ts' },
  { name: 'PART3', data: MATERIA_MEDICA_PART3, path: './src/data/materiaMedicaPart3.ts' },
  { name: 'PART4', data: MATERIA_MEDICA_PART4, path: './src/data/materiaMedicaPart4.ts' },
  { name: 'PART5', data: MATERIA_MEDICA_PART5, path: './src/data/materiaMedicaPart5.ts' },
  { name: 'PART6', data: MATERIA_MEDICA_PART6, path: './src/data/materiaMedicaPart6.ts' },
  { name: 'PART7', data: MATERIA_MEDICA_PART7, path: './src/data/materiaMedicaPart7.ts' },
  { name: 'PART8', data: MATERIA_MEDICA_PART8, path: './src/data/materiaMedicaPart8.ts' },
  { name: 'PART9', data: MATERIA_MEDICA_PART9, path: './src/data/materiaMedicaPart9.ts' },
  { name: 'PART10', data: MATERIA_MEDICA_PART10, path: './src/data/materiaMedicaPart10.ts' },
  { name: 'PART11', data: MATERIA_MEDICA_PART11, path: './src/data/materiaMedicaPart11.ts' },
  { name: 'PART12', data: MATERIA_MEDICA_PART12, path: './src/data/materiaMedicaPart12.ts' },
  { name: 'PART13', data: MATERIA_MEDICA_PART13, path: './src/data/materiaMedicaPart13.ts' },
  { name: 'PART14', data: MATERIA_MEDICA_PART14, path: './src/data/materiaMedicaPart14.ts' },
  { name: 'PART15', data: MATERIA_MEDICA_PART15, path: './src/data/materiaMedicaPart15.ts' },
  { name: 'PART16', data: MATERIA_MEDICA_PART16, path: './src/data/materiaMedicaPart16.ts' },
  { name: 'PART17', data: MATERIA_MEDICA_PART17, path: './src/data/materiaMedicaPart17.ts' },
  { name: 'PART18', data: MATERIA_MEDICA_PART18, path: './src/data/materiaMedicaPart18.ts' },
  { name: 'PART19', data: MATERIA_MEDICA_PART19, path: './src/data/materiaMedicaPart19.ts' },
  { name: 'PART20', data: MATERIA_MEDICA_PART20, path: './src/data/materiaMedicaPart20.ts' },
  { name: 'PART21', data: MATERIA_MEDICA_PART21, path: './src/data/materiaMedicaPart21.ts' },
  { name: 'PART22', data: MATERIA_MEDICA_PART22, path: './src/data/materiaMedicaPart22.ts' },
  { name: 'PART23', data: MATERIA_MEDICA_PART23, path: './src/data/materiaMedicaPart23.ts' },
  { name: 'PART24', data: MATERIA_MEDICA_PART24, path: './src/data/materiaMedicaPart24.ts' },
  { name: 'PART25', data: MATERIA_MEDICA_PART25, path: './src/data/materiaMedicaPart25.ts' },
  { name: 'PART26', data: MATERIA_MEDICA_PART26, path: './src/data/materiaMedicaPart26.ts' },
  { name: 'PART27', data: MATERIA_MEDICA_PART27, path: './src/data/materiaMedicaPart27.ts' },
  { name: 'PART28', data: MATERIA_MEDICA_PART28, path: './src/data/materiaMedicaPart28.ts' },
  { name: 'PART29', data: MATERIA_MEDICA_PART29, path: './src/data/materiaMedicaPart29.ts' },
  { name: 'PART30', data: MATERIA_MEDICA_PART30, path: './src/data/materiaMedicaPart30.ts' },
  { name: 'PART31', data: MATERIA_MEDICA_PART31, path: './src/data/materiaMedicaPart31.ts' },
  { name: 'PART32', data: MATERIA_MEDICA_PART32, path: './src/data/materiaMedicaPart32.ts' },
  { name: 'PART33', data: MATERIA_MEDICA_PART33, path: './src/data/materiaMedicaPart33.ts' },
  { name: 'PART34', data: MATERIA_MEDICA_PART34, path: './src/data/materiaMedicaPart34.ts' },
  { name: 'PART35', data: MATERIA_MEDICA_PART35, path: './src/data/materiaMedicaPart35.ts' },
  { name: 'PART36', data: MATERIA_MEDICA_PART36, path: './src/data/materiaMedicaPart36.ts' },
];

function containsEnglish(text: string): boolean {
  if (!text) return false;
  const englishWords = ['better', 'worse', 'indicated', 'remedy', 'pressure', 'cold', 'heat', 'pain', 'symptoms'];
  return englishWords.some(word => text.toLowerCase().includes(word));
}

async function fixTranslations() {
  for (const part of parts) {
    let modified = false;
    for (const entry of part.data) {
      if (entry.isPolychrest || entry.importanceTier === 1) {
        // Check Greek
        const el = entry.translations.el;
        if (el && (containsEnglish(el.essence) || el.mainIndications.some(containsEnglish) || el.keynotes.some(containsEnglish))) {
          console.log(`Polychrest with English in Greek: ${entry.id} in ${part.name}`);
        }
      }
    }
  }
}

fixTranslations();
