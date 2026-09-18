import fs from 'fs';
import path from 'path';
import { RawRemedy, buildEntry } from './buildRemedyUtils';
import { ALL_297_DEFINITIONS } from './all297Definitions';

const targetDir = path.join(process.cwd(), 'src', 'data');

console.log(`Starting compilation of ${ALL_297_DEFINITIONS.length} remedies into Materia Medica parts...`);

// Partition into 10 clean parts (~30 remedies each)
const PART_SIZE = 30;
const totalParts = Math.ceil(ALL_297_DEFINITIONS.length / PART_SIZE);

let currentIdx = 0;
const partExportNames: string[] = [];

for (let p = 1; p <= totalParts; p++) {
  const slice = ALL_297_DEFINITIONS.slice(currentIdx, currentIdx + PART_SIZE);
  currentIdx += PART_SIZE;
  
  const builtSlice = slice.map(buildEntry);
  const exportName = `MATERIA_MEDICA_PART${p}`;
  partExportNames.push(exportName);
  
  const filePath = path.join(targetDir, `materiaMedicaPart${p}.ts`);
  const content = `import { MateriaMedicaEntry } from './materiaMedicaData';\n\nexport const ${exportName}: MateriaMedicaEntry[] = ${JSON.stringify(builtSlice, null, 2)};\n`;
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Wrote part ${p}: materiaMedicaPart${p}.ts (${builtSlice.length} remedies)`);
}

// Now write updated materiaMedicaData.ts
const imports = partExportNames.map((name, idx) => `import { ${name} } from './materiaMedicaPart${idx + 1}';`).join('\n');
const spreadParts = partExportNames.map(name => `  ...${name},`).join('\n');

const materiaMedicaDataContent = `import { LanguageCode } from '../types';
${imports}

export type RemedyCategoryKey = 'plant' | 'mineral' | 'animal' | 'nosode' | 'acid' | 'other';

export interface LocalizedRemedyContent {
  commonName: string;
  category: string;
  origin: string;
  essence: string;
  mainIndications: string[];
  keynotes: string[];
  mindEmotional: string;
  modalitiesBetter: string[];
  modalitiesWorse: string[];
  potenciesAndDosage: string;
  defaultTagesdosis?: string;
  sphereOfAction: string[];
  differentialRemedies: string[];
  searchKeywords: string[];
}

export interface MateriaMedicaEntry {
  id: string;
  latinName: string;
  categoryKey: RemedyCategoryKey;
  isPolychrest?: boolean;
  importanceTier?: number; // 1 = Polychrest / Hauptmittel, 2 = Wichtiges Akut-/Organmittel, 3 = Spezifikum / Nosode
  translations: Record<LanguageCode, LocalizedRemedyContent>;
}

export interface LocalizedRemedy extends LocalizedRemedyContent {
  id: string;
  latinName: string;
  categoryKey: RemedyCategoryKey;
  isPolychrest?: boolean;
  importanceTier?: number;
}

export const MATERIA_MEDICA_ENTRIES: MateriaMedicaEntry[] = [
${spreadParts}
].sort((a, b) => a.latinName.localeCompare(b.latinName));

export const ALL_REMEDIES_DATABASE = MATERIA_MEDICA_ENTRIES;

export function getLocalizedRemedy(entry: MateriaMedicaEntry, lang: LanguageCode): LocalizedRemedy {
  const content = entry.translations[lang] || entry.translations.en || entry.translations.de;
  return {
    id: entry.id,
    latinName: entry.latinName,
    categoryKey: entry.categoryKey,
    isPolychrest: entry.isPolychrest,
    importanceTier: entry.importanceTier,
    ...content
  };
}

export function getLocalizedRemedies(lang: LanguageCode, filterPolychrestsOnly: boolean = false): LocalizedRemedy[] {
  const list = MATERIA_MEDICA_ENTRIES.map((entry) => getLocalizedRemedy(entry, lang));
  if (filterPolychrestsOnly) {
    return list.filter((r) => r.isPolychrest || r.importanceTier === 1);
  }
  return list;
}

/**
 * Returns remedies sorted so that Polychrests / Tier 1 (the most important remedies) are always listed first,
 * followed by Tier 2 and Tier 3 remedies.
 */
export function getRemediesPrioritized(lang: LanguageCode): LocalizedRemedy[] {
  const remedies = getLocalizedRemedies(lang);
  return remedies.sort((a, b) => {
    const tierA = a.importanceTier || (a.isPolychrest ? 1 : 2);
    const tierB = b.importanceTier || (b.isPolychrest ? 1 : 2);
    if (tierA !== tierB) {
      return tierA - tierB; // Tier 1 first, then Tier 2, then Tier 3
    }
    return a.latinName.localeCompare(b.latinName);
  });
}

export const LOCALIZED_PRESETS: Record<LanguageCode, string[]> = {
  de: [
    'Plötzliches Fieber nach Kaltwind',
    'Zerschlagenheit nach Sturz & Trauma',
    'Brennende Schmerzen besser durch Wärme',
    'Schlagartiger Reizdarm & Blähbauch',
    'Pochende Kopfschmerzen & Scharlach',
    'Stechender Husten schlimmer durch Bewegung',
    'Insektenstich mit heißer Schwellung',
    'Fließschnupfen mit scharfem Nasensekret',
    'Todesangst & panische Unruhe',
    'Heuschnupfen & Niesanfälle',
    'Bett fühlt sich überall zu hart an',
    'Durstlos bei starker Schwellung',
    'Erwacht um 3:00 Uhr mit Arbeitsgedanken',
    'Beckensenkungsgefühl & Tanzen bessert',
    'Warzen & Folgen von Impfungen',
    'Austreiben von Splittern & Eiterung'
  ],
  en: [
    'Sudden high fever after cold dry wind',
    'Bruised soreness after fall & blunt trauma',
    'Burning pains relieved by warm heat',
    'Sudden irritable bowel & bloating',
    'Throbbing violent headache & red face',
    'Stitching dry cough worse from any motion',
    'Insect sting with burning pink swelling',
    'Watery acrid coryza & burning nasal discharge',
    'Panic attacks with fear of death & restlessness',
    'Hay fever with violent sneezing bursts',
    'Bed feels too hard everywhere',
    'Completely thirstless despite fever & edema',
    'Wakes at 3:00 AM thinking about work',
    'Pelvic bearing down relieved by vigorous dancing',
    'Warts and post-vaccination ailments',
    'Expelling foreign body splinters and suppurations'
  ],
  es: [
    'Fiebre repentina tras viento frío seco',
    'Sensación de magulladura tras caída o golpe',
    'Dolores ardientes que mejoran con calor',
    'Cefalea pulsátil con cara roja como brasa',
    'Tos seca punzante peor al menor movimiento',
    'Picadura de insecto con hinchazón rosada',
    'Rinitis con secreción nasal corrosiva',
    'Ataque de pánico con miedo a la muerte',
    'Alergia y estornudos violentos',
    'La cama se siente demasiado dura',
    'Sin sed a pesar de la hinchazón y fiebre',
    'Despierta a las 3 de la madrugada pensando en trabajo',
    'Pesadez pélvica que mejora con baile enérgico',
    'Verrugas y trastornos posvacunales',
    'Expulsión de espinas y astillas'
  ],
  fr: [
    'Fièvre brutale après vent froid et sec',
    'Courbatures et contusions après chute ou choc',
    'Douleurs brûlantes soulagées par la chaleur',
    'Maux de tête pulsatiles et visage écarlate',
    'Toux sèche et piquante empirée par le mouvement',
    'Piqûre d’insecte avec œdème rosé brûlant',
    'Rhume avec écoulement nasal très irritant',
    'Panique avec angoisse de mort et agitation',
    'Rhume des foins et éternuements violents',
    'Le lit semble dur partout',
    'Absence totale de soif malgré la fièvre',
    'Réveil à 3h du matin avec ruminations de travail',
    'Pesanteur pelvienne améliorée par la danse',
    'Verrues et suites de vaccination',
    'Expulsion d’échardes et corps étrangers'
  ],
  el: [
    'Αιφνίδιος υψηλός πυρετός μετά από παγωμένο αέρα',
    'Αίσθημα συντριβής μετά από πτώση ή τραύμα',
    'Καυστικοί πόνοι που καλυτερεύουν με ζέστη',
    'Παλλόμενος πονοκέφαλος & κατακόκκινο πρόσωπο',
    'Ξηρός διαπεραστικός βήχας χειρότερος με την κίνηση',
    'Τσίμπημα εντόμου με ροζ πρήξιμο & κάψιμο',
    'Συνάχι με καυστική έκκριση που τσούζει τη μύτη',
    'Κρίση πανικού με αγωνία θανάτου & ανησυχία',
    'Αλλεργική ρινίτιδα & έντονα φτερνίσματα',
    'Το κρεβάτι φαίνεται υπερβολικά σκληρό',
    'Πλήρης έλλειψη δίψας παρά το πρήξιμο',
    'Αφύπνιση στις 03:00 π.μ. με σκέψεις δουλειάς',
    'Αίσθημα πτώσης μήτρας που βελτιώνεται με χορό',
    'Μυρμηγκιές και παρενέργειες εμβολιασμού',
    'Αποβολή αγκίδων και ξένων σωμάτων'
  ],
  it: [
    'Febbre improvvisa dopo vento freddo e secco',
    'Corpo indolenzito e contuso dopo caduta o trauma',
    'Dolori urenti alleviati dal calore intenso',
    'Cefalea pulsante e viso rosso acceso',
    'Tosse secca trafittiva peggiorata dal movimento',
    'Puntura d’insetto con gonfiore rosato urente',
    'Raffreddore con scolo nasale corrosivo',
    'Attacco di panico con terrore di morire',
    'Rinite allergica con raffiche di starnuti',
    'Il letto sembra duro ovunque',
    'Senza sete nonostante febbre e gonfiore',
    'Risveglio alle 3:00 con pensieri di lavoro',
    'Pesantezza pelvica migliorata dal ballo vigoroso',
    'Verruche e disturbi post-vaccinali',
    'Espulsione di schegge e corpi estranei'
  ],
  ru: [
    'Внезапная температура после холодного ветра',
    'Ощущение побитости после падения или травмы',
    'Жгучие боли, облегчаемые сухим теплом',
    'Пульсирующая головная боль и пылающее лицо',
    'Сухой колющий кашель, усиливающийся от движения',
    'Укус насекомого с горячим розовым отеком',
    'Едкий насморк с раздражающими выделениями',
    'Панический страх смерти и беспокойство',
    'Сенная лихорадка с приступами чихания',
    'Постель кажется твердой везде',
    'Полное отсутствие жажды при отеках и температуре',
    'Пробуждение в 3:00 ночи с мыслями о делах',
    'Чувство выпадения матки, проходящее от танцев',
    'Бородавки и последствия вакцинации',
    'Изгнание заноз и инородных тел'
  ]
};

export function getLocalizedPresets(lang: LanguageCode): string[] {
  return LOCALIZED_PRESETS[lang] || LOCALIZED_PRESETS.en || LOCALIZED_PRESETS.de;
}
`;

fs.writeFileSync(path.join(targetDir, 'materiaMedicaData.ts'), materiaMedicaDataContent, 'utf-8');
console.log('Updated materiaMedicaData.ts successfully!');
