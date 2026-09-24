import fs from 'fs';
import path from 'path';

const MEDICATIONS_DB_FILE = path.join(process.cwd(), 'data', 'medications_db.json');

const cleanupPatterns = [
  /gem\.\s*§\s*38\/39\s*AMG/gi,
  /BfArM/g,
  /MedDRA/g,
  /behördlichen Fach-/g,
  /Fach- und Gebrauchsinformationen/g,
  /registriertes homöopathisches Arzneimittel/gi,
  /χωρίς ένδειξη/gi,
  /θεραπευτική ένδειξη/gi
];

function cleanText(text) {
  if (!text || typeof text !== 'string') return text;
  let cleaned = text;
  
  // Remove full sentences containing regulatory boilerplate
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const filteredSentences = sentences.filter(s => {
    return !cleanupPatterns.some(p => p.test(s));
  });
  
  cleaned = filteredSentences.join(' ');
  
  // Also do a direct replace for any remaining fragments
  cleanupPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  return cleaned.trim();
}

try {
  if (fs.existsSync(MEDICATIONS_DB_FILE)) {
    const data = JSON.parse(fs.readFileSync(MEDICATIONS_DB_FILE, 'utf-8'));
    if (Array.isArray(data)) {
      const cleanedData = data.map(item => {
        if (item.monographText) {
          item.monographText = cleanText(item.monographText);
        }
        if (item.warnings) {
          item.warnings = cleanText(item.warnings);
        }
        return item;
      });
      fs.writeFileSync(MEDICATIONS_DB_FILE, JSON.stringify(cleanedData, null, 2), 'utf-8');
      console.log('Successfully cleaned medications_db.json');
    }
  } else {
    console.log('medications_db.json does not exist');
  }
} catch (err) {
  console.error('Error cleaning medications_db.json:', err);
}
