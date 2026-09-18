// scripts/checkMissing.ts
import { MATERIA_MEDICA_ENTRIES } from '../src/data/materiaMedicaData';

const existing = new Set(MATERIA_MEDICA_ENTRIES.map(e => e.id.toLowerCase()));
const existingLatin = new Set(MATERIA_MEDICA_ENTRIES.map(e => e.latinName.toLowerCase()));

console.log('Total existing:', existing.size);
