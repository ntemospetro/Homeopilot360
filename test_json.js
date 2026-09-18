import fs from 'fs';
const dicts = JSON.parse(fs.readFileSync('./src/data/anamnesisTranslations.json', 'utf-8'));
console.log(Object.keys(dicts));
console.log(dicts['en']['1. Gesundheitszustand']);
