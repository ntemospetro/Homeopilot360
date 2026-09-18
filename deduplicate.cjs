const fs = require('fs');

let lines = fs.readFileSync('src/i18n/translations.ts', 'utf8').split('\n');
let out = [];
let seen = new Set();
let inLang = false;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  if (line.match(/^  [a-z]{2}: \{/)) {
    inLang = true;
    seen.clear();
    out.push(line);
    continue;
  }
  
  if (inLang && (line === '  },' || line === '};')) {
    inLang = false;
    out.push(line);
    continue;
  }
  
  if (inLang) {
    let m = line.match(/^\s+([a-zA-Z0-9_]+):/);
    if (m) {
      let key = m[1];
      if (seen.has(key)) {
        continue; // skip duplicate
      }
      seen.add(key);
    }
  }
  
  out.push(line);
}

fs.writeFileSync('src/i18n/translations.ts', out.join('\n'));
