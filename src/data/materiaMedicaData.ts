import { LanguageCode } from '../types';
import { MATERIA_MEDICA_PART1 } from './materiaMedicaPart1';
import { MATERIA_MEDICA_PART2 } from './materiaMedicaPart2';
import { MATERIA_MEDICA_PART3 } from './materiaMedicaPart3';
import { MATERIA_MEDICA_PART4 } from './materiaMedicaPart4';
import { MATERIA_MEDICA_PART5 } from './materiaMedicaPart5';
import { MATERIA_MEDICA_PART6 } from './materiaMedicaPart6';
import { MATERIA_MEDICA_PART7 } from './materiaMedicaPart7';
import { MATERIA_MEDICA_PART8 } from './materiaMedicaPart8';
import { MATERIA_MEDICA_PART9 } from './materiaMedicaPart9';
import { MATERIA_MEDICA_PART10 } from './materiaMedicaPart10';
import { MATERIA_MEDICA_PART11 } from './materiaMedicaPart11';
import { MATERIA_MEDICA_PART12 } from './materiaMedicaPart12';
import { MATERIA_MEDICA_PART13 } from './materiaMedicaPart13';
import { MATERIA_MEDICA_PART14 } from './materiaMedicaPart14';
import { MATERIA_MEDICA_PART15 } from './materiaMedicaPart15';
import { MATERIA_MEDICA_PART16 } from './materiaMedicaPart16';
import { MATERIA_MEDICA_PART17 } from './materiaMedicaPart17';
import { MATERIA_MEDICA_PART18 } from './materiaMedicaPart18';
import { MATERIA_MEDICA_PART19 } from './materiaMedicaPart19';
import { MATERIA_MEDICA_PART20 } from './materiaMedicaPart20';
import { MATERIA_MEDICA_PART21 } from './materiaMedicaPart21';
import { MATERIA_MEDICA_PART22 } from './materiaMedicaPart22';
import { MATERIA_MEDICA_PART23 } from './materiaMedicaPart23';
import { MATERIA_MEDICA_PART24 } from './materiaMedicaPart24';
import { MATERIA_MEDICA_PART25 } from './materiaMedicaPart25';
import { MATERIA_MEDICA_PART26 } from './materiaMedicaPart26';


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
  ist_polychrest?: boolean;
  importanceTier?: number;
  aliases?: string[];
  translations: Record<LanguageCode, LocalizedRemedyContent>;
}

export interface LocalizedRemedy extends LocalizedRemedyContent {
  id: string;
  latinName: string;
  categoryKey: RemedyCategoryKey;
  isPolychrest?: boolean;
  ist_polychrest?: boolean;
  importanceTier?: number;
  aliases?: string[];
}

/**
 * Kanonische Liste der 64 klassischen Polychreste nach Hahnemann, Kent, Bönninghausen & Boericke
 */
export const CLASSICAL_POLYCHREST_NAMES: string[] = [
  'Aconitum napellus',
  'Agaricus muscarius',
  'Ailanthus glandulosa',
  'Allium cepa',
  'Aloe socotrina',
  'Alumina',
  'Ammonium carbonicum',
  'Anacardium orientale',
  'Antimonium crudum',
  'Antimonium tartaricum',
  'Apis mellifica',
  'Argentum nitricum',
  'Arnica montana',
  'Arsenicum album',
  'Aurum metallicum',
  'Baryta carbonica',
  'Belladonna',
  'Borax veneta',
  'Bryonia cretica',
  'Caladium seguinum',
  'Calcium carbonicum',
  'Calcium fluoricum',
  'Calcium phosphoricum',
  'Calendula officinalis',
  'Camphora',
  'Cannabis sativa',
  'Cantharis vesicatoria',
  'Carbo vegetabilis',
  'Causticum',
  'Chamomilla',
  'Chelidonium majus',
  'Cinchona pubescens',
  'Cicuta virosa',
  'Cina maritima',
  'Cocculus indicus',
  'Coffea cruda',
  'Colchicum autumnale',
  'Colocynthis',
  'Conium maculatum',
  'Crotalus horridus',
  'Cuprum metallicum',
  'Digitalis purpurea',
  'Drosera rotundifolia',
  'Dulcamara',
  'Ferrum metallicum',
  'Gelsemium sempervirens',
  'Graphites',
  'Helleborus niger',
  'Hepar sulfuris',
  'Hyoscyamus niger',
  'Ignatia amara',
  'Ipecacuanha',
  'Kali carbonicum',
  'Kreosotum',
  'Lachesis muta',
  'Ledum palustre',
  'Lycopodium clavatum',
  'Magnesium carbonicum',
  'Magnesium phosphoricum',
  'Mercurius solubilis',
  'Natrium muriaticum',
  'Natrium sulfuricum',
  'Nitricum acidum',
  'Nux vomica',
  // Weitere klassische Haupt-Polychreste
  'Phosphorus',
  'Pulsatilla pratensis',
  'Rhus toxicodendron',
  'Sepia officinalis',
  'Silicea',
  'Sulfur',
  'Thuja occidentalis',
  'Veratrum album',
  'Staphysagria',
  'Opium'
];

export function isClassicalPolychrest(id: string, latinName?: string): boolean {
  if (!id && !latinName) return false;
  const normId = (id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normLatin = (latinName || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const name of CLASSICAL_POLYCHREST_NAMES) {
    const normName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const firstWord = name.toLowerCase().split(/\s+/)[0];
    const normFirst = firstWord.replace(/[^a-z0-9]/g, '');

    if (normId === normName || normLatin === normName) return true;
    if (normId.startsWith(normName) || normLatin.startsWith(normName)) return true;

    // Synonyme & Abkürzungen
    if (name.includes('Cinchona') && (normId.includes('china') || normId.includes('cinchona') || normLatin.includes('china') || normLatin.includes('cinchona'))) return true;
    if (name.includes('Calcium carbonicum') && (normId.includes('calcarea') || normLatin.includes('calcarea') || normId.includes('calciumcarb') || normLatin.includes('calciumcarb'))) return true;
    if (name.includes('Hepar') && (normId.includes('hepar') || normLatin.includes('hepar'))) return true;
    if (name.includes('Mercurius') && (normId.includes('mercurius') || normLatin.includes('mercurius'))) return true;
    if (name.includes('Sulfur') && (normId.includes('sulfur') || normId.includes('sulphur') || normLatin.includes('sulfur') || normLatin.includes('sulphur'))) return true;
    if (name.includes('Nitricum') && (normId.includes('nitricum') || normLatin.includes('nitricum') || normId.includes('nitac'))) return true;
    if (name.includes('Bryonia') && (normId.includes('bryonia') || normLatin.includes('bryonia'))) return true;
    if (name.includes('Rhus') && (normId.includes('rhus') || normLatin.includes('rhus'))) return true;
    if (name.includes('Antimonium') && (normId.includes('antimonium') || normLatin.includes('antimonium'))) return true;
    if (name.includes('Baryta') && (normId.includes('baryta') || normLatin.includes('baryta'))) return true;
    if (name.includes('Magnesium') && (normId.includes('magnesium') || normLatin.includes('magnesium') || normId.includes('magnesia') || normLatin.includes('magnesia'))) return true;

    if (normFirst.length >= 4 && (normId.startsWith(normFirst) || normLatin.startsWith(normFirst))) {
      return true;
    }
  }
  return false;
}

/**
 * Canonical key for remedy deduplication.
 * Strips acidum prefixes/suffixes and punctuation so that "Acidum nitricum" and "Nitricum acidum"
 * map to the exact same canonical key.
 */
export function getCanonicalRemedyKey(entryOrName: { id?: string; latinName?: string } | string): string {
  const str = typeof entryOrName === 'string' 
    ? entryOrName 
    : (entryOrName.latinName || entryOrName.id || '');
  if (!str) return '';
  let s = str.toLowerCase().trim();
  s = s.replace(/^(acidum|ac\.)\s+/, '');
  s = s.replace(/\s+(acidum|ac\.)$/, '');
  s = s.replace(/[^a-z0-9]/g, '');
  if (s === 'nitricum') return 'acidum-nitricum';
  if (s === 'phosphoricum') return 'acidum-phosphoricum';
  return (typeof entryOrName === 'string' ? entryOrName : (entryOrName.latinName || entryOrName.id || '')).toLowerCase().trim();
}

/**
 * Deduplicates and merges Materia Medica entries that share the same canonical remedy key.
 * Guarantees that remedies like Acidum nitricum and Acidum phosphoricum are synthesized into
 * a single, comprehensive monograph without duplicate listings in the repertory.
 */
export function deduplicateAndMergeMateriaMedica(entries: MateriaMedicaEntry[]): MateriaMedicaEntry[] {
  const map = new Map<string, MateriaMedicaEntry>();

  for (const entry of entries) {
    const key = getCanonicalRemedyKey(entry);
    if (!map.has(key)) {
      map.set(key, {
        ...entry,
        aliases: entry.aliases ? [...entry.aliases] : [entry.id]
      });
    } else {
      const existing = map.get(key)!;
      // Merge all aliases into the surviving entry
      const allAliases = Array.from(new Set([
        ...(existing.aliases || [existing.id]),
        entry.id,
        ...(entry.aliases || [])
      ]));
      existing.aliases = allAliases;

      // Merge polychrest status and tier
      if (entry.isPolychrest || entry.ist_polychrest) {
        existing.isPolychrest = true;
        existing.ist_polychrest = true;
      }
      if (entry.importanceTier && (!existing.importanceTier || entry.importanceTier < existing.importanceTier)) {
        existing.importanceTier = entry.importanceTier;
      }

      // Merge translations across all supported languages
      const langs = Object.keys(entry.translations) as LanguageCode[];
      for (const lang of langs) {
        const t1 = existing.translations[lang];
        const t2 = entry.translations[lang];
        if (!t1 && t2) {
          existing.translations[lang] = t2;
        } else if (t1 && t2) {
          const mergeArr = (a?: string[], b?: string[]) => Array.from(new Set([...(a || []), ...(b || [])]));
          existing.translations[lang] = {
            ...t1,
            origin: (t2.origin && t2.origin.length > (t1.origin?.length || 0)) ? t2.origin : t1.origin,
            essence: (t2.essence && t2.essence.length > (t1.essence?.length || 0)) ? t2.essence : t1.essence,
            mindEmotional: (t2.mindEmotional && t2.mindEmotional.length > (t1.mindEmotional?.length || 0)) ? t2.mindEmotional : t1.mindEmotional,
            potenciesAndDosage: (t2.potenciesAndDosage && t2.potenciesAndDosage.length > (t1.potenciesAndDosage?.length || 0)) ? t2.potenciesAndDosage : t1.potenciesAndDosage,
            defaultTagesdosis: t1.defaultTagesdosis || t2.defaultTagesdosis,
            mainIndications: mergeArr(t1.mainIndications, t2.mainIndications),
            keynotes: mergeArr(t1.keynotes, t2.keynotes),
            modalitiesBetter: mergeArr(t1.modalitiesBetter, t2.modalitiesBetter),
            modalitiesWorse: mergeArr(t1.modalitiesWorse, t2.modalitiesWorse),
            sphereOfAction: mergeArr(t1.sphereOfAction, t2.sphereOfAction),
            differentialRemedies: mergeArr(t1.differentialRemedies, t2.differentialRemedies),
            searchKeywords: mergeArr(t1.searchKeywords, t2.searchKeywords),
          };
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.latinName.localeCompare(b.latinName));
}

export const MATERIA_MEDICA_ENTRIES: MateriaMedicaEntry[] = deduplicateAndMergeMateriaMedica([
  ...MATERIA_MEDICA_PART1,
  ...MATERIA_MEDICA_PART2,
  ...MATERIA_MEDICA_PART3,
  ...MATERIA_MEDICA_PART4,
  ...MATERIA_MEDICA_PART5,
  ...MATERIA_MEDICA_PART6,
  ...MATERIA_MEDICA_PART7,
  ...MATERIA_MEDICA_PART8,
  ...MATERIA_MEDICA_PART9,
  ...MATERIA_MEDICA_PART10,
  ...MATERIA_MEDICA_PART11,
  ...MATERIA_MEDICA_PART12,
  ...MATERIA_MEDICA_PART13,
  ...MATERIA_MEDICA_PART14,
  ...MATERIA_MEDICA_PART15,
  ...MATERIA_MEDICA_PART16,
  ...MATERIA_MEDICA_PART17,
  ...MATERIA_MEDICA_PART18,
  ...MATERIA_MEDICA_PART19,
  ...MATERIA_MEDICA_PART20,
  ...MATERIA_MEDICA_PART21,
  ...MATERIA_MEDICA_PART22,
  ...MATERIA_MEDICA_PART23,
  ...MATERIA_MEDICA_PART24,
  ...MATERIA_MEDICA_PART25,
  ...MATERIA_MEDICA_PART26
]);

export const ALL_REMEDIES_DATABASE = MATERIA_MEDICA_ENTRIES;

export function getLocalizedRemedy(entry: MateriaMedicaEntry, lang: LanguageCode): LocalizedRemedy {
  const content = entry.translations[lang] || entry.translations.en || entry.translations.de;
  const isPoly = Boolean(entry.isPolychrest || entry.ist_polychrest || isClassicalPolychrest(entry.id, entry.latinName));
  return {
    id: entry.id,
    latinName: entry.latinName,
    categoryKey: entry.categoryKey,
    isPolychrest: isPoly,
    ist_polychrest: isPoly,
    importanceTier: entry.importanceTier,
    aliases: entry.aliases || [entry.id],
    ...content
  };
}

export function getLocalizedRemedies(lang: LanguageCode): LocalizedRemedy[] {
  return MATERIA_MEDICA_ENTRIES.map((entry) => getLocalizedRemedy(entry, lang));
}

/**
 * Resolves a remedy from a list by either its primary ID or any of its known aliases.
 */
export function findRemedyByAnyId(remedies: LocalizedRemedy[], idOrAlias: string): LocalizedRemedy | undefined {
  if (!idOrAlias) return undefined;
  const target = idOrAlias.toLowerCase().trim();
  return remedies.find(r => r.id === target || (r.aliases && r.aliases.includes(target)));
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
