// scripts/generateClassicParts.ts
import * as fs from 'fs';
import * as path from 'path';

// Load existing remedies
import { MATERIA_MEDICA_ENTRIES } from '../src/data/materiaMedicaData';

console.log('Existing entries:', MATERIA_MEDICA_ENTRIES.length);
