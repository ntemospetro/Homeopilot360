import fs from 'fs';
import path from 'path';
import { buildEntry } from './buildRemedyUtils';
import { REMEDIES_PART1_A } from './remediesPart1';
import { REMEDIES_PART2_BC } from './remediesPart2';
import { REMEDIES_PART3_DEFG } from './remediesPart3';
import { REMEDIES_PART4_HIJ } from './remediesPart4';
import { REMEDIES_PART5_KL } from './remediesPart5';
import { REMEDIES_PART6_MN } from './remediesPart6';
import { REMEDIES_PART7_OPQ } from './remediesPart7';
import { REMEDIES_PART8_RS } from './remediesPart8';
import { REMEDIES_PART9_TUVWXYZ } from './remediesPart9';

const parts = [
  { name: 'materiaMedicaPart1', exportName: 'MATERIA_MEDICA_PART1', list: REMEDIES_PART1_A },
  { name: 'materiaMedicaPart2', exportName: 'MATERIA_MEDICA_PART2', list: REMEDIES_PART2_BC },
  { name: 'materiaMedicaPart3', exportName: 'MATERIA_MEDICA_PART3', list: REMEDIES_PART3_DEFG },
  { name: 'materiaMedicaPart4', exportName: 'MATERIA_MEDICA_PART4', list: REMEDIES_PART4_HIJ },
  { name: 'materiaMedicaPart5', exportName: 'MATERIA_MEDICA_PART5', list: REMEDIES_PART5_KL },
  { name: 'materiaMedicaPart6', exportName: 'MATERIA_MEDICA_PART6', list: REMEDIES_PART6_MN },
  { name: 'materiaMedicaPart7', exportName: 'MATERIA_MEDICA_PART7', list: REMEDIES_PART7_OPQ },
  { name: 'materiaMedicaPart8', exportName: 'MATERIA_MEDICA_PART8', list: REMEDIES_PART8_RS },
  { name: 'materiaMedicaPart9', exportName: 'MATERIA_MEDICA_PART9', list: REMEDIES_PART9_TUVWXYZ },
];

const targetDir = path.join(process.cwd(), 'src', 'data');

console.log('Writing Materia Medica Part files to:', targetDir);

let totalRemedies = 0;

for (const part of parts) {
  const builtEntries = part.list.map(buildEntry);
  totalRemedies += builtEntries.length;
  const filePath = path.join(targetDir, `${part.name}.ts`);
  const content = `import { MateriaMedicaEntry } from './materiaMedicaData';\n\nexport const ${part.exportName}: MateriaMedicaEntry[] = ${JSON.stringify(builtEntries, null, 2)};\n`;
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Generated ${part.name}.ts with ${builtEntries.length} remedies.`);
}

console.log(`Successfully generated all parts! Total remedies: ${totalRemedies}`);
