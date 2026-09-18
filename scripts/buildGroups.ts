import fs from 'fs';
import path from 'path';

// Master data dictionary for all 297 remedies with complete homeopathic clinical facts
// Let's create the builder that outputs group files with full clinical depth.

const outDir = path.join(process.cwd(), 'scripts', 'remedyData');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Building remedy data groups...');
