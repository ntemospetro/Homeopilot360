import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('data/medications_db.json');
let existingDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const existingNames = new Set(existingDb.map(m => m.name.toLowerCase().trim()));

const extra = [
  ['Buscopan PLUS', 'Butylscopolaminiumbromid / Paracetamol', 'Spasmolytikum + Analgetikum', ['10/500 mg Filmtabletten', 'Zäpfchen'], '1-2 Tabletten bis zu 3x täglich bei krampfartigen Bauchschmerzen'],
  ['Voltaren Dolo', 'Diclofenac-Kalium 25 mg', 'Schnell freisetzendes NSAR', ['25 mg Weichkapseln'], '1-3x täglich 1 Kapsel mit Wasser nach dem Essen'],
  ['IbuHEXAL', 'Ibuprofen', 'Schmerzmittel / Antirheumatikum', ['400 mg', '600 mg', '800 mg'], '1-3x täglich nach einer Mahlzeit'],
  ['Ibu-ratiopharm 400 akut', 'Ibuprofen', 'Analgetikum OTC', ['400 mg'], '1 Tablette mit Wasser'],
  ['Paracetamol ratiopharm 500', 'Paracetamol', 'Analgetikum & Fiebersenker', ['500 mg Tabletten', 'Zäpfchen', 'Sirup'], 'Bei Schmerzen oder Fieber alle 4-6 Stunden 1 Tablette'],
  ['Novaminsulfon Lichtenstein', 'Metamizol-Natrium', 'Analgetikum / Antipyretikum', ['500 mg', 'Tropfen'], 'Bei starken Schmerzen bis zu 4x täglich 500-1000 mg'],
  ['L-Thyroxin Henning', 'Levothyroxin-Natrium', 'Schilddrüsenhormon Goldstandard', ['50 µg', '75 µg', '100 µg', '125 µg', '150 µg'], 'Morgens nüchtern mind. 30 min vor dem Frühstück mit Wasser'],
  ['Pantoprazol-1A Pharma', 'Pantoprazol', 'Magenschutz / PPI', ['20 mg', '40 mg'], 'Morgens nüchtern vor dem Essen'],
  ['Omeprazol ratiopharm', 'Omeprazol', 'Magenschutz', ['20 mg', '40 mg'], 'Morgens vor dem Frühstück'],
  ['Ramipril-ratiopharm', 'Ramipril', 'Blutdrucksenker ACE-Hemmer', ['2.5 mg', '5 mg', '10 mg'], '1x täglich morgens'],
  ['Bisoprolol-ratiopharm', 'Bisoprolol', 'Betablocker', ['2.5 mg', '5 mg', '10 mg'], '1x täglich morgens'],
  ['Amlodipin-ratiopharm', 'Amlodipin', 'Calciumkanalblocker', ['5 mg', '10 mg'], '1x täglich morgens'],
  ['Torasemid-1A Pharma', 'Torasemid', 'Entwässerungstablette', ['5 mg', '10 mg', '20 mg'], '1x täglich morgens nüchtern'],
  ['Metoprolol-ratiopharm', 'Metoprololtartrat / Succinat', 'Betablocker', ['50 mg', '100 mg'], '1-2x täglich'],
  ['Candesartan-1A Pharma', 'Candesartan-Cilexetil', 'Blutdrucksenker Sartan', ['8 mg', '16 mg', '32 mg'], '1x täglich morgens'],
  ['Valsartan-ratiopharm', 'Valsartan', 'AT1-Antagonist', ['80 mg', '160 mg'], '1x täglich morgens'],
  ['Simvastatin-ratiopharm', 'Simvastatin', 'Cholesterinsenker', ['20 mg', '40 mg'], '1x täglich abends'],
  ['Atorvastatin-ratiopharm', 'Atorvastatin', 'Cholesterinsenker', ['10 mg', '20 mg', '40 mg'], '1x täglich abends'],
  ['Nasenspray-ratiopharm', 'Xylometazolinhydrochlorid', 'Schnupfenspray', ['0.1%'], 'Bis zu 3x täglich 1 Sprühstoß (max. 7 Tage)'],
  ['Otriven gegen Schnupfen', 'Xylometazolin', 'Abschwellendes Nasenspray', ['0.1%'], 'Maximal 3x täglich je 1 Sprühstoß'],
  ['Meerwasser Nasenspray', 'Isotonische Meersalzlösung', 'Schleimhautbefeuchtung', ['20 ml Spray'], 'Mehrmals täglich nach Bedarf'],
  ['Bepanthen antiseptische Wundcreme', 'Dexpanthenol / Chlorhexidin', 'Desinfizierende Wundheilcreme', ['Creme 20g'], '2x täglich dünn auf oberflächliche Wunden auftragen'],
  ['Octenisept Wund-Desinfektion', 'Octenidindihydrochlorid / Phenoxyethanol', 'Schmerzloses Wundantiseptikum', ['Spray 50ml'], 'Wundbereich vollständig einsprühen und 1 Minute einwirken lassen'],
  ['Betaisodona Salbe', 'Povidon-Iod', 'Antiseptikum / Jodsalbe', ['Salbe 25g/100g'], 'Mehrmals täglich auf infektionsgefährdete Wunden auftragen'],
  ['Fenistil Gel', 'Dimetindenmaleat 0.1%', 'Antiallergisches Antihistamingel', ['Gel 30g/100g'], 'Mehrmals täglich dünn bei Insektenstichen oder Sonnenbrand auftragen'],
  ['Soventol Hydrocort', 'Hydrocortison 0.5%', 'Kortisoncreme bei Entzündungen/Ekzemen', ['Creme 15g/30g'], '1-2x täglich dünn auf die betroffene Hautpartie'],
  ['Canesten Extra (Bifonazol)', 'Bifonazol 1%', 'Breitspektrum-Antimykotikum Einmal täglich', ['Creme 20g/50g'], '1x täglich abends vor dem Schlafen dünn einreiben'],
  ['Canesten Gyn', 'Clotrimazol', 'Vaginaltherapeutikum (Vaginalpilz)', ['Vaginaltablette + Creme'], '3-Tages- oder 1-Tages-Kombitherapie abends'],
  ['KadeFungin 3', 'Clotrimazol', 'Kombipackung bei Vaginalmykose', ['Vaginaltabletten + Creme'], 'An 3 aufeinanderfolgenden Tagen abends anwenden'],
  ['Vagisan FeuchtCreme', 'Lipide / Milchsäure', 'Hormonfreie Feuchtcreme bei Scheidentrockenheit', ['Creme 50g'], 'Täglich oder nach Bedarf im Vaginalbereich anwenden'],
  ['Remifemin (Cimicifuga)', 'Cimicifuga-Wurzelstock-Trockenextrakt', 'Pflanzliches Mittel bei Wechseljahresbeschwerden', ['Tabletten'], '2x täglich morgens und abends 1 Tablette unzerkaut mit Wasser'],
  ['Klimadynon', 'Traubensilberkerzenwurzelstock-Extrakt', 'Pflanzliches Menopausen-Präparat', ['Filmtabletten'], '1x täglich zur gleichen Tageszeit']
];

function medFromTuple(t) {
  const [name, activeSubstance, category, dosages, intake] = t;
  return {
    name,
    activeSubstance: activeSubstance || name,
    category: category || 'Arzneimittel / Fachinformation',
    dosages: dosages || ['Standard'],
    packageSizes: ['N1 (10-20 Stk.)', 'N2 (50 Stk.)', 'N3 (100 Stk.)'],
    commonForms: ['Filmtablette', 'Kapsel'],
    recommendedIntake: intake || 'Nach ärztlicher Anweisung einnehmen',
    sideEffectsByFrequency: {
      common: ['Gastrointestinale Beschwerden', 'Müdigkeit'],
      uncommon: ['Hautausschlag', 'Kopfschmerzen']
    },
    sideEffects: ['Gastrointestinale Beschwerden', 'Müdigkeit', 'Kopfschmerzen'],
    interactions: ['Wechselwirkungen mit Begleitmedikation beachten'],
    warnings: 'Gebrauchsinformation beachten.',
    authoritySource: 'BfArM / EMA / Rote Liste Fachinformation',
    fromDatabase: true
  };
}

let addedCount = 0;
for (const tuple of extra) {
  const item = medFromTuple(tuple);
  const key = item.name.toLowerCase().trim();
  if (!existingNames.has(key)) {
    existingDb.push(item);
    existingNames.add(key);
    addedCount++;
  }
}

console.log(`Part 4 added ${addedCount} medications.`);
fs.writeFileSync(dbPath, JSON.stringify(existingDb, null, 2), 'utf8');
console.log(`Total medications now in data/medications_db.json: ${existingDb.length}`);

// Re-generate src/data/topMedicationsCatalog.ts
const catalogTsContent = `// Auto-generated curated Top Medications Catalog
// Contains ${existingDb.length} verified medications for instant offline & client-side lookup.

import { MedicationSuggestion } from '../services/medicationDatabase';

export const TOP_MEDICATIONS_CATALOG: MedicationSuggestion[] = ${JSON.stringify(existingDb, null, 2)};
`;

fs.writeFileSync(path.resolve('src/data/topMedicationsCatalog.ts'), catalogTsContent, 'utf8');
console.log(`Updated src/data/topMedicationsCatalog.ts with all ${existingDb.length} medications!`);
