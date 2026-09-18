const fs = require('fs');

let lines = fs.readFileSync('src/i18n/translations.ts', 'utf8').split('\n');

let out = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  if (line.includes('modalAnalysisRemaining:')) {
    // Determine language by looking backwards for `XX: {`
    let lang = 'de';
    for(let j=i; j>=0; j--) {
      let m = lines[j].match(/^  ([a-z]{2}): \{/);
      if (m) { lang = m[1]; break; }
    }
    
    const rem = {
        'de': "Verbleibende Analysen: {count}",
        'en': "Remaining analyses: {count}",
        'es': "Análisis restantes: {count} de 3",
        'fr': "Analyses restantes : {count} sur 3",
        'el': "Απομένουσες αναλύσεις: {count} από 3",
        'it': "Analisi rimanenti: {count} di 3",
        'ru': "Осталось анализов: {count} из 3"
    };
    
    out.push(`    modalAnalysisRemaining: '${rem[lang]}',`);
    skip = true;
  } else if (skip && line.includes('modalRecordedSymptoms:')) {
    skip = false;
    out.push(line);
  } else if (!skip) {
    out.push(line);
  }
}

fs.writeFileSync('src/i18n/translations.ts', out.join('\n'));
