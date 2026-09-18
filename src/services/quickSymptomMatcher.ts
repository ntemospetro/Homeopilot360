import { getLocalizedRemedies, LocalizedRemedy } from '../data/materiaMedicaData';
import { LanguageCode } from '../types';
import {
  detectComplaintDomain,
  OPTION_REMEDY_MAP,
  AcuteAnswers,
  AcuteComplaintDomain
} from './acuteClarificationService';

export interface SymptomMatchResult {
  remedy: LocalizedRemedy;
  matchScore: number; // 0 - 100
  matchedKeywords: string[];
  matchedIndications: string[];
  matchedKeynotes: string[];
  matchedModalities: string[];
  clinicalRationale: string;
  differentialNote?: string;
  isPrimarySimile?: boolean;
}

export interface ExcludedRemedy {
  remedy: LocalizedRemedy;
  reason: string;
  triggeredByOptionId?: string;
}

export interface DifferentialDiagnosisResult {
  domain: AcuteComplaintDomain;
  domainName: string;
  candidatePool: LocalizedRemedy[];
  topRemedies: SymptomMatchResult[]; // Strictly 2 to 4 remedies
  excludedRemedies: ExcludedRemedy[];
  activeAnswers: AcuteAnswers;
}

/**
 * Standard classical homeopathic core remedies per acute complaint domain.
 * Prevents irrelevant remedies from unrelated pathologies (e.g. Veratrum album or Drosera in a fever case)
 * from crowding out true acute Similes.
 */
export const DOMAIN_CORE_REMEDIES: Record<AcuteComplaintDomain, string[]> = {
  fever: [
    'aconitum-napellus',
    'belladonna',
    'ferrum-phosphoricum',
    'gelsemium-sempervirens',
    'bryonia-alba',
    'rhus-toxicodendron',
    'eupatorium-perfoliatum',
    'arsenicum-album',
    'apis-mellifica',
    'pulsatilla-pratensis',
    'nux-vomica',
    'chamomilla'
  ],
  headache: [
    'belladonna',
    'bryonia-alba',
    'gelsemium-sempervirens',
    'glonoinum',
    'spigelia-anthelmia',
    'iris-versicolor',
    'sanguinaria-canadensis',
    'silicea',
    'nux-vomica',
    'natrium-muriaticum',
    'ignatia-amara',
    'arnica-montana',
    'natrium-sulphuricum',
    'hypericum-perforatum'
  ],
  injury: [
    'arnica-montana',
    'rhus-toxicodendron',
    'ruta-graveolens',
    'hypericum-perforatum',
    'ledum-palustre',
    'symphytum-officinale',
    'staphisagria',
    'bellis-perennis',
    'calendula-officinalis'
  ],
  respiratory: [
    'aconitum-napellus',
    'drosera-rotundifolia',
    'spongia-tosta',
    'hepar-sulfuris',
    'bryonia-alba',
    'ipecacuanha',
    'pulsatilla-pratensis',
    'phosphorus',
    'rumex-crispus',
    'causticum',
    'antimonium-tartaricum'
  ],
  gastrointestinal: [
    'nux-vomica',
    'arsenicum-album',
    'colocynthis',
    'magnesia-phosphorica',
    'ipecacuanha',
    'carbo-vegetabilis',
    'lycopodium-clavatum',
    'podophyllum-peltatum',
    'veratrum-album',
    'chamomilla',
    'phosphorus'
  ],
  skin: [
    'apis-mellifica',
    'cantharis-vesicatoria',
    'rhus-toxicodendron',
    'urtica-urens',
    'ledum-palustre',
    'hepar-sulfuris',
    'silicea',
    'sulphur'
  ],
  pain_laterality: [
    'lachesis-muta',
    'spigelia-anthelmia',
    'lycopodium-clavatum',
    'belladonna',
    'bryonia-alba',
    'colocynthis',
    'magnesia-phosphorica',
    'hypericum-perforatum',
    'pulsatilla-pratensis'
  ],
  mind_shock: [
    'aconitum-napellus',
    'arnica-montana',
    'ignatia-amara',
    'opium',
    'gelsemium-sempervirens',
    'chamomilla',
    'arsenicum-album'
  ],
  general: [
    'aconitum-napellus',
    'belladonna',
    'arnica-montana',
    'bryonia-alba',
    'rhus-toxicodendron',
    'nux-vomica',
    'pulsatilla-pratensis',
    'arsenicum-album',
    'chamomilla',
    'gelsemium-sempervirens'
  ]
};

// Stopwords in all 7 languages to avoid false matches on common grammatical words
const STOPWORDS: Record<LanguageCode, Set<string>> = {
  de: new Set([
    'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'mein', 'meine', 'meinen', 'meinem', 'meiner', 'meines',
    'mich', 'mir', 'dich', 'dir', 'ihn', 'ihm', 'uns', 'euch', 'ihnen', 'ihr', 'ihre', 'ihren', 'ihrem',
    'habe', 'hast', 'hat', 'haben', 'habt', 'hatte', 'hattest', 'hatten', 'hattet',
    'bin', 'bist', 'ist', 'sind', 'seid', 'war', 'warst', 'waren', 'wart', 'gewesen', 'sein',
    'werde', 'wirst', 'wird', 'werden', 'werdet', 'wurde', 'wurdest', 'wurden', 'wurdet',
    'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines',
    'und', 'oder', 'aber', 'denn', 'doch', 'sondern', 'weil', 'wenn', 'dass', 'daß', 'wie', 'als', 'so',
    'an', 'am', 'in', 'im', 'auf', 'aus', 'bei', 'beim', 'mit', 'nach', 'von', 'vom', 'zu', 'zum', 'zur',
    'vor', 'über', 'unter', 'durch', 'für', 'um', 'ohne', 'gegen', 'wieder', 'ab',
    'nicht', 'noch', 'schon', 'nur', 'auch', 'sehr', 'etwas', 'viel', 'viele', 'mehr', 'hier', 'da', 'dort',
    'man', 'kann', 'konnte', 'können', 'muss', 'musste', 'müssen', 'soll', 'sollte', 'wollen', 'will', 'wollte'
  ]),
  en: new Set([
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their',
    'have', 'has', 'had', 'having', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'do', 'does', 'did', 'doing', 'would', 'should', 'could', 'can', 'will',
    'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while',
    'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just'
  ]),
  es: new Set([
    'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas', 'me', 'te', 'se', 'nos', 'os', 'le', 'les',
    'mi', 'mis', 'tu', 'tus', 'su', 'sus', 'nuestro', 'nuestra',
    'he', 'has', 'ha', 'hemos', 'habéis', 'han', 'había', 'habías', 'tenía', 'tuve', 'tengo', 'tiene',
    'soy', 'eres', 'es', 'somos', 'sois', 'son', 'era', 'eras', 'éramos', 'fui', 'fue',
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
    'y', 'e', 'o', 'u', 'pero', 'mas', 'aunque', 'porque', 'como', 'si', 'cuando',
    'de', 'del', 'a', 'al', 'en', 'con', 'por', 'para', 'hacia', 'desde', 'hasta', 'sobre', 'entre', 'sin', 'tras',
    'no', 'ya', 'muy', 'más', 'mucho', 'poco', 'también', 'aquí', 'allí', 'así'
  ]),
  fr: new Set([
    'je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles', 'me', 'te', 'se', 'lui', 'leur',
    'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'nos', 'votre', 'vos',
    'ai', 'as', 'a', 'avons', 'avez', 'ont', 'avais', 'avait', 'avions', 'aviez', 'avaient', 'eu',
    'suis', 'es', 'est', 'sommes', 'êtes', 'sont', 'étais', 'était', 'étions', 'étiez', 'étaient', 'été',
    'le', 'la', 'les', 'l', 'un', 'une', 'des', 'du', 'de', 'd',
    'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'comme', 'si', 'quand', 'lorsque', 'parce', 'que',
    'dans', 'en', 'sur', 'sous', 'avec', 'sans', 'pour', 'par', 'vers', 'chez', 'après', 'avant',
    'ne', 'pas', 'plus', 'très', 'aussi', 'ici', 'là', 'bien', 'tout', 'tous', 'fait'
  ]),
  it: new Set([
    'io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro', 'mi', 'ti', 'si', 'ci', 'vi', 'gli', 'le',
    'mio', 'mia', 'miei', 'mie', 'tuo', 'tua', 'suo', 'sua', 'nostro', 'vostro',
    'ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno', 'avevo', 'aveva', 'avuto',
    'sono', 'sei', 'è', 'siamo', 'siete', 'era', 'erano', 'stato', 'stata',
    'il', 'lo', 'la', 'i', 'gli', 'le', 'l', 'un', 'uno', 'una',
    'e', 'ed', 'o', 'ma', 'però', 'quindi', 'perché', 'come', 'se', 'quando',
    'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'del', 'della', 'dei', 'delle', 'al', 'alla', 'nel', 'nella',
    'non', 'più', 'molto', 'poco', 'anche', 'qui', 'lì', 'così', 'dopo', 'prima'
  ]),
  el: new Set([
    'εγώ', 'εσύ', 'αυτός', 'αυτή', 'αυτό', 'εμείς', 'εσείς', 'αυτοί', 'μου', 'σου', 'του', 'της', 'μας', 'σας', 'τους',
    'έχω', 'έχει', 'έχουν', 'είχα', 'είχε', 'είμαι', 'είσαι', 'είναι', 'ήμουν', 'ήταν',
    'ο', 'η', 'το', 'οι', 'τα', 'τον', 'την', 'των', 'τους', 'τις', 'ένας', 'μία', 'ένα',
    'και', 'κι', 'ή', 'αλλά', 'όμως', 'γιατί', 'επειδή', 'αν', 'όταν', 'πως', 'ότι',
    'σε', 'στο', 'στη', 'στον', 'στην', 'στα', 'στις', 'από', 'για', 'με', 'χωρίς', 'προς', 'μετά', 'πριν',
    'δε', 'δεν', 'μη', 'μην', 'πιο', 'πολύ', 'λίγο', 'επίσης', 'εδώ', 'εκεί', 'έτσι'
  ]),
  ru: new Set([
    'я', 'ты', 'он', 'она', 'оно', 'мы', 'вы', 'они', 'меня', 'тебя', 'его', 'ее', 'нас', 'вас', 'их', 'мне', 'тебе', 'ему', 'ей', 'нам', 'вам', 'им',
    'мой', 'моя', 'мое', 'мои', 'твой', 'свой', 'наш', 'ваш',
    'был', 'была', 'было', 'были', 'быть', 'есть', 'будет', 'будут',
    'и', 'а', 'но', 'или', 'да', 'как', 'так', 'что', 'чтобы', 'если', 'когда', 'потому',
    'в', 'во', 'на', 'с', 'со', 'к', 'ко', 'по', 'из', 'изо', 'от', 'до', 'у', 'о', 'об', 'обо', 'за', 'под', 'над', 'перед', 'при', 'через', 'после',
    'не', 'ни', 'уже', 'еще', 'ещё', 'только', 'также', 'тоже', 'очень', 'здесь', 'там', 'тут', 'где', 'куда'
  ])
};

const BETTER_TRIGGERS: Record<LanguageCode, string[]> = {
  de: ['besser', 'bessert', 'lindert', 'erleichtert', 'nachlassen', 'linderung', 'angenehm'],
  en: ['better', 'relieved', 'ameliorated', 'improves', 'soothed', 'relief', 'eased'],
  es: ['mejor', 'mejora', 'alivia', 'calma', 'disminuye', 'alivio'],
  fr: ['mieux', 'soulagé', 'amélioré', 'diminue', 'apaise', 'soulagement'],
  el: ['καλύτερα', 'βελτιώνεται', 'ανακουφίζει', 'υποχωρεί', 'καταπραΰνει', 'ανακούφιση'],
  it: ['meglio', 'migliora', 'allevia', 'attenua', 'calma', 'sollievo'],
  ru: ['лучше', 'облегчает', 'улучшается', 'проходит', 'стихает', 'облегчение']
};

const WORSE_TRIGGERS: Record<LanguageCode, string[]> = {
  de: ['schlechter', 'verschlimmert', 'schlimmer', 'steigert', 'verschlechtert', 'unerträglich', 'aggraviert'],
  en: ['worse', 'aggravated', 'worsened', 'intensified', 'unbearable', 'aggravation'],
  es: ['peor', 'empeora', 'agrava', 'aumenta', 'intolerable', 'agravación'],
  fr: ['pire', 'aggravé', 'augmente', 'intolérable', 'amplifie', 'aggravation'],
  el: ['χειρότερα', 'επιδεινώνεται', 'χειροτερεύει', 'εντείνεται', 'ανυπόφορο'],
  it: ['peggio', 'peggiora', 'aggrava', 'aumenta', 'insopportabile', 'aggravamento'],
  ru: ['хуже', 'ухудшается', 'усиливается', 'обостряется', 'невыносимо']
};

function cleanNorm(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Classical homeopathic exclusion rules based on contradictory keynotes & modalities.
 * When a specific option is chosen (e.g. cold compress ameliorates), remedies that are
 * classically aggravated by cold (e.g. Silicea, Arsenicum) are eliminated.
 */
export const EXCLUSION_RULES: Record<string, { excludeRemedies: string[]; reasonKey: string }> = {
  // Cold compress ameliorates (e.g. Belladonna / Apis)
  hd_cold_compress: {
    excludeRemedies: ['silicea', 'arsenicum-album', 'magnesia-phosphorica'],
    reasonKey: 'cold_ameliorates_contra_warmth'
  },
  mod_cold_ice: {
    excludeRemedies: ['silicea', 'arsenicum-album', 'magnesia-phosphorica', 'rhus-toxicodendron'],
    reasonKey: 'cold_ice_contra_warmth'
  },
  sk_cold_ice_better: {
    excludeRemedies: ['rhus-toxicodendron', 'arsenicum-album', 'silicea'],
    reasonKey: 'skin_cold_better_contra'
  },
  inj_cold_better: {
    excludeRemedies: ['rhus-toxicodendron', 'ruta-graveolens'],
    reasonKey: 'injury_cold_better_contra'
  },

  // Warmth ameliorates (e.g. Silicea, Arsenicum, Mag phos, Rhus tox)
  hd_warm_wrap: {
    excludeRemedies: ['belladonna', 'glonoinum', 'apis-mellifica', 'pulsatilla-pratensis'],
    reasonKey: 'warm_wrap_contra_heat'
  },
  mod_warmth_wrap: {
    excludeRemedies: ['apis-mellifica', 'ledum-palustre', 'pulsatilla-pratensis', 'glonoinum'],
    reasonKey: 'warmth_wrap_contra_heat'
  },
  sk_scalding_hot_better: {
    excludeRemedies: ['apis-mellifica'],
    reasonKey: 'skin_heat_better_contra_apis'
  },
  inj_warmth_better: {
    excludeRemedies: ['ledum-palustre', 'apis-mellifica'],
    reasonKey: 'injury_warmth_better_contra'
  },

  // Motion vs Rest
  mod_absolute_rest: {
    excludeRemedies: ['rhus-toxicodendron'],
    reasonKey: 'absolute_rest_contra_rhus'
  },
  hd_splitting_motion: {
    excludeRemedies: ['rhus-toxicodendron'],
    reasonKey: 'splitting_motion_contra_rhus'
  },
  inj_motion_worse: {
    excludeRemedies: ['rhus-toxicodendron'],
    reasonKey: 'motion_worse_contra_rhus'
  },
  mod_continued_motion: {
    excludeRemedies: ['bryonia-alba', 'arnica-montana'],
    reasonKey: 'motion_better_contra_bryonia'
  },
  inj_motion_better: {
    excludeRemedies: ['bryonia-alba'],
    reasonKey: 'motion_better_contra_bryonia'
  },

  // Laterality
  lat_left: {
    excludeRemedies: ['belladonna', 'lycopodium-clavatum'],
    reasonKey: 'left_sided_contra_right'
  },
  lat_right: {
    excludeRemedies: ['lachesis-muta', 'spigelia-anthelmia'],
    reasonKey: 'right_sided_contra_left'
  },
  hd_one_sided_sharp: {
    excludeRemedies: ['belladonna'],
    reasonKey: 'one_sided_sharp_contra_bell'
  },

  // Thirst
  fev_huge_thirst: {
    excludeRemedies: ['apis-mellifica', 'pulsatilla-pratensis', 'gelsemium-sempervirens'],
    reasonKey: 'huge_thirst_contra_thirstless'
  },
  fev_thirstless: {
    excludeRemedies: ['bryonia-alba', 'aconitum-napellus'],
    reasonKey: 'thirstless_contra_thirst'
  },

  // Pressure
  gi_doubling_pressure: {
    excludeRemedies: ['belladonna', 'arsenicum-album'],
    reasonKey: 'hard_pressure_contra_sensitive'
  },
  gi_cold_air_fan: {
    excludeRemedies: ['arsenicum-album', 'nux-vomica'],
    reasonKey: 'cold_air_fan_contra_chilly'
  }
};

export const EXCLUSION_REASONS: Record<string, Record<LanguageCode, string>> = {
  cold_ameliorates_contra_warmth: {
    de: 'Widerspruch: Dieses Mittel wird durch Kälte stark verschlimmert und verlangt Wärme.',
    en: 'Contradiction: This remedy is severely aggravated by cold and requires warmth.',
    es: 'Contradicción: Este medicamento empeora con el frío y mejora con el calor.',
    fr: 'Contradiction : Ce remède est fortement aggravé par le froid et exige de la chaleur.',
    it: 'Contraddizione: Questo rimedio è fortemente aggravato dal freddo e richiede calore.',
    el: 'Αντίφαση: Αυτό το φάρμακο επιδεινώνεται έντονα από το κρύο και απαιτεί ζέστη.',
    ru: 'Противоречие: Это средство сильно ухудшается от холода и требует тепла.'
  },
  cold_ice_contra_warmth: {
    de: 'Widerspruch: Kälte- und Eisauflagen verschlimmern dieses Mittel.',
    en: 'Contradiction: Cold and ice applications aggravate this remedy.',
    es: 'Contradicción: Las aplicaciones de frío o hielo agravan este remedio.',
    fr: 'Contradiction : Les applications froides ou glacées aggravent ce remède.',
    it: 'Contraddizione: Gli impacchi freddi o di ghiaccio aggravano questo rimedio.',
    el: 'Αντίφαση: Οι κρύες κομπρέσες και ο πάγος επιδεινώνουν αυτό το φάρμακο.',
    ru: 'Противоречие: Холодные компрессы и лёд ухудшают состояние этого средства.'
  },
  skin_cold_better_contra: {
    de: 'Widerspruch: Verlangt heiße Waschungen, Kälte verschlechtert das Hautbild.',
    en: 'Contradiction: Demands hot water/warmth; cold worsens the skin eruption.',
    es: 'Contradicción: Requiere aplicaciones calientes; el frío empeora la piel.',
    fr: 'Contradiction : Exige de la chaleur ; le froid aggrave l\'éruption cutanée.',
    it: 'Contraddizione: Richiede applicazioni calde; il freddo peggiora la cute.',
    el: 'Αντίφαση: Απαιτεί ζεστές πλύσεις, το κρύο επιδεινώνει το εξάνθημα.',
    ru: 'Противоречие: Требует горячих примочек, холод ухудшает высыпания.'
  },
  injury_cold_better_contra: {
    de: 'Widerspruch: Verletzung verlangt Wärme; Kälte verschlechtert Schmerzen und Steifheit.',
    en: 'Contradiction: Injury demands warmth; cold worsens pain and stiffness.',
    es: 'Contradicción: La lesión mejora con calor; el frío agrava rigidez y dolor.',
    fr: 'Contradiction : La lésion requiert de la chaleur ; le froid aggrave la raideur.',
    it: 'Contraddizione: Il trauma richiede calore; il freddo aggrava dolore e rigidità.',
    el: 'Αντίφαση: Ο τραυματισμός απαιτεί ζέστη, το κρύο επιδεινώνει τον πόνο.',
    ru: 'Противоречие: Травма требует тепла; холод усиливает боль и тугоподвижность.'
  },
  warm_wrap_contra_heat: {
    de: 'Widerspruch: Dieses Mittel erträgt keine Hitze oder warmes Einhüllen des Kopfes.',
    en: 'Contradiction: This remedy cannot tolerate heat or warm wrapping of the head.',
    es: 'Contradicción: Este remedio no tolera el calor ni envolverse la cabeza con calor.',
    fr: 'Contradiction : Ce remède ne supporte pas la chaleur ni l\'enveloppement chaud de la tête.',
    it: 'Contraddizione: Questo rimedio non sopporta il calore né avvolgere la testa al caldo.',
    el: 'Αντίφαση: Αυτό το φάρμακο δεν ανέχεται τη ζέστη ούτε το ζεστό τύλιγμα του κεφαλιού.',
    ru: 'Противоречие: Это средство не переносит тепла и укутывания головы.'
  },
  warmth_wrap_contra_heat: {
    de: 'Widerspruch: Hitze und Wärme verschlimmern die Beschwerden drastisch.',
    en: 'Contradiction: Heat and warmth drastically aggravate the complaints.',
    es: 'Contradicción: El calor empeora drásticamente los síntomas.',
    fr: 'Contradiction : La chaleur aggrave considérablement les symptômes.',
    it: 'Contraddizione: Il calore aggrava drasticamente i disturbi.',
    el: 'Αντίφαση: Η ζέστη επιδεινώνει δραστικά τα συμπτώματα.',
    ru: 'Противоречие: Тепло резко усиливает болезненные симптомы.'
  },
  skin_heat_better_contra_apis: {
    de: 'Widerspruch: Apis hat rosige brennende Schwellungen; jegliche Hitze ist unerträglich.',
    en: 'Contradiction: Apis features stinging puffy swelling; any heat is intolerable.',
    es: 'Contradicción: Apis presenta edema ardiente; cualquier calor resulta intolerable.',
    fr: 'Contradiction : Apis présente un œdème brûlant ; toute chaleur est insupportable.',
    it: 'Contraddizione: Apis presenta gonfiore bruciante; qualsiasi calore è intollerabile.',
    el: 'Αντίφαση: Ο Apis έχει τσιμπηματικό καυστικό οίδημα, κάθε ζέστη είναι ανυπόφορη.',
    ru: 'Противоречие: Для Apis характерен жгучий отёк, любое тепло невыносимо.'
  },
  injury_warmth_better_contra: {
    de: 'Widerspruch: Ledum/Apis verlangen eiskalte Umschläge; Wärme verschlimmert akut.',
    en: 'Contradiction: Ledum/Apis demand ice-cold applications; warmth severely aggravates.',
    es: 'Contradicción: Ledum/Apis requieren compresas heladas; el calor agrava.',
    fr: 'Contradiction : Ledum/Apis réclament des compresses glacées ; la chaleur aggrave.',
    it: 'Contraddizione: Ledum/Apis richiedono impacchi ghiacciati; il calore aggrava.',
    el: 'Αντίφαση: Ledum/Apis απαιτούν παγωμένες κομπρέσες, η ζέστη επιδεινώνει.',
    ru: 'Противоречие: Ledum/Apis требуют ледяных компрессов; тепло сильно ухудшает.'
  },
  absolute_rest_contra_rhus: {
    de: 'Widerspruch: Rhus toxicodendron hat drängende Ruhelosigkeit und bessert sich durch Bewegung.',
    en: 'Contradiction: Rhus tox has driven physical restlessness and improves from continued motion.',
    es: 'Contradicción: Rhus tox tiene marcada inquietud y mejora con el movimiento continuo.',
    fr: 'Contradiction : Rhus tox présente une agitation physique et s\'améliore par le mouvement continu.',
    it: 'Contraddizione: Rhus tox ha continua irrequietezza e migliora con il movimento prolungato.',
    el: 'Αντίφαση: Το Rhus tox έχει έντονη ανησυχία και βελτιώνεται με τη συνεχή κίνηση.',
    ru: 'Противоречие: Rhus tox испытывает беспокойство и улучшается от постоянного движения.'
  },
  splitting_motion_contra_rhus: {
    de: 'Widerspruch: Rhus toxicodendron verlangt ständige Bewegung; Ruhe verschlimmert die Schmerzen.',
    en: 'Contradiction: Rhus tox demands motion; rest aggravates the pains.',
    es: 'Contradicción: Rhus tox requiere movimiento; el reposo empeora los dolores.',
    fr: 'Contradiction : Rhus tox a besoin de mouvement ; le repos aggrave les douleurs.',
    it: 'Contraddizione: Rhus tox richiede movimento; il riposo peggiora i dolori.',
    el: 'Αντίφαση: Το Rhus tox χρειάζεται κίνηση, η ακινησία επιδεινώνει τους πόνους.',
    ru: 'Противоречие: Rhus tox требует движения; покой усиливает боль.'
  },
  motion_worse_contra_rhus: {
    de: 'Widerspruch: Schmerz verschlimmert bei Bewegung; Rhus tox bessert sich durch Bewegung.',
    en: 'Contradiction: Pain worse from motion; Rhus tox characteristically improves from movement.',
    es: 'Contradicción: Dolor peor por movimiento; Rhus tox mejora típicamente con el movimiento.',
    fr: 'Contradiction : Douleur aggravée par le mouvement ; Rhus tox est amélioré par le mouvement.',
    it: 'Contraddizione: Dolore peggiorato dal movimento; Rhus tox migliora tipicamente muovendosi.',
    el: 'Αντίφαση: Πόνος χειρότερος με την κίνηση, ενώ το Rhus tox βελτιώνεται με την κίνηση.',
    ru: 'Противоречие: Боль усиливается от движения; Rhus tox улучшается при движении.'
  },
  motion_better_contra_bryonia: {
    de: 'Widerspruch: Bryonia und Arnica verlangen absolute Ruhe; geringste Bewegung ist Qual.',
    en: 'Contradiction: Bryonia and Arnica demand absolute rest; slightest motion is agonizing.',
    es: 'Contradicción: Bryonia y Arnica exigen reposo absoluto; el menor movimiento es un tormento.',
    fr: 'Contradiction : Bryonia et Arnica exigent un repos absolu ; le moindre mouvement est intolérable.',
    it: 'Contraddizione: Bryonia e Arnica esigono riposo assoluto; il minimo movimento è tormento.',
    el: 'Αντίφαση: Bryonia και Arnica απαιτούν απόλυτη ηρεμία, η παραμικρή κίνηση πονά.',
    ru: 'Противоречие: Bryonia и Arnica требуют абсолютного покоя; малейшее движение мучительно.'
  },
  left_sided_contra_right: {
    de: 'Widerspruch: Typischerweise rechtsseitiges Beschwerdebild.',
    en: 'Contradiction: Characteristically right-sided symptom manifestation.',
    es: 'Contradicción: Cuadro sintomático típicamente derecho.',
    fr: 'Contradiction : Manifestation symptomatique typiquement droite.',
    it: 'Contraddizione: Quadro sintomatico prevalentemente destro.',
    el: 'Αντίφαση: Τυπικά δεξιόπλευρη εκδήλωση συμπτωμάτων.',
    ru: 'Противоречие: Характерна правосторонняя локализация симптомов.'
  },
  right_sided_contra_left: {
    de: 'Widerspruch: Typischerweise linksseitiges Beschwerdebild.',
    en: 'Contradiction: Characteristically left-sided symptom manifestation.',
    es: 'Contradicción: Cuadro sintomático típicamente izquierdo.',
    fr: 'Contradiction : Manifestation symptomatique typiquement gauche.',
    it: 'Contraddizione: Quadro sintomatico prevalentemente sinistro.',
    el: 'Αντίφαση: Τυπικά αριστερόπλευρη εκδήλωση συμπτωμάτων.',
    ru: 'Противоречие: Характерна левосторонняя локализация симптомов.'
  },
  one_sided_sharp_contra_bell: {
    de: 'Widerspruch: Belladonna hat beidseitige pulsierende Klopfschmerzen.',
    en: 'Contradiction: Belladonna presents with bilateral throbbing/congestive pain.',
    es: 'Contradicción: Belladonna presenta dolor pulsátil y congestivo bilateral.',
    fr: 'Contradiction : Belladonna présente une douleur battante et congestive bilatérale.',
    it: 'Contraddizione: Belladonna presenta dolore pulsante e congestizio bilaterale.',
    el: 'Αντίφαση: Η Belladonna παρουσιάζει αμφοτερόπλευρο παλλόμενο πόνο συμφόρησης.',
    ru: 'Противоречие: У Belladonna двусторонняя пульсирующая застойная боль.'
  },
  huge_thirst_contra_thirstless: {
    de: 'Widerspruch: Im Akutzustand klassisch völlig durstlos.',
    en: 'Contradiction: In acute fever classically completely thirstless.',
    es: 'Contradicción: En estado febril agudo presenta ausencia total de sed.',
    fr: 'Contradiction : Dans l\'état fébrile aigu est classiquement sans soif.',
    it: 'Contraddizione: Nello stato febbrile acuto è classicamente senza sete.',
    el: 'Αντίφαση: Στην οξεία κατάσταση χαρακτηρίζεται από παντελή έλλειψη δίψας.',
    ru: 'Противоречие: В остром состоянии классически полностью отсутствует жажда.'
  },
  thirstless_contra_thirst: {
    de: 'Widerspruch: Unstillbarer Riesendurst auf große Mengen ist Kardinalsymptom.',
    en: 'Contradiction: Unquenchable thirst for large quantities is a cardinal keynote.',
    es: 'Contradicción: La sed insaciable de grandes cantidades es un síntoma cardinal.',
    fr: 'Contradiction : Une soif inextinguible de grandes quantités d\'eau est un symptôme cardinal.',
    it: 'Contraddizione: La sete inestinguibile di grandi quantità è un sintomo cardinale.',
    el: 'Αντίφαση: Η ακατάσχετη έντονη δίψα για μεγάλες ποσότητες είναι βασικό σύμπτωμα.',
    ru: 'Противоречие: Неутолимая сильная жажда к большим порциям воды является ведущим симптомом.'
  },
  hard_pressure_contra_sensitive: {
    de: 'Widerspruch: Kann keinen Druck oder kleinste Berührung am Bauch ertragen.',
    en: 'Contradiction: Cannot bear firm pressure or touch on the abdomen.',
    es: 'Contradicción: No tolera presión firme ni contacto en el abdomen.',
    fr: 'Contradiction : Ne supporte aucune pression ferme ni toucher sur l\'abdomen.',
    it: 'Contraddizione: Non sopporta pressione né tocco sull\'addome.',
    el: 'Αντίφαση: Δεν ανέχεται πίεση ή άγγιγμα στην κοιλιά.',
    ru: 'Противоречие: Не переносит давления или прикосновения к животу.'
  },
  cold_air_fan_contra_chilly: {
    de: 'Widerspruch: Extrem kälteempfindlich, verabscheut Durchzug und kühle Luft.',
    en: 'Contradiction: Extremely chilly, abhors drafts and cool moving air.',
    es: 'Contradicción: Extremadamente friolento, detesta las corrientes y el aire fresco.',
    fr: 'Contradiction : Extrêmement frileux, craint les courants d\'air et l\'air frais.',
    it: 'Contraddizione: Estremamente freddoloso, teme correnti d\'aria e aria fresca.',
    el: 'Αντίφαση: Εξαιρετικά κρυουλιάρικο, αποστρέφεται τα ρεύματα και τον δροσερό αέρα.',
    ru: 'Противоречие: Чрезвычайно зябкий, не переносит сквозняков и прохладного воздуха.'
  }
};

export const DOMAIN_TITLES: Record<AcuteComplaintDomain, Record<LanguageCode, string>> = {
  headache: {
    de: 'Kopfschmerz & Migräne',
    en: 'Headache & Migraine',
    es: 'Cefalea y Migraña',
    fr: 'Céphalée et Migraine',
    it: 'Cefalea ed Emicrania',
    el: 'Κεφαλαλγία & Ημικρανία',
    ru: 'Головная боль и мигрень'
  },
  fever: {
    de: 'Fieber & Infekt',
    en: 'Fever & Infection',
    es: 'Fiebre e Infección',
    fr: 'Fièvre et Infection',
    it: 'Febbre e Infezione',
    el: 'Πυρετός & Λοίμωξη',
    ru: 'Лихорадка и инфекция'
  },
  injury: {
    de: 'Verletzung & Trauma',
    en: 'Injury & Trauma',
    es: 'Lesión y Traumatismo',
    fr: 'Traumatisme et Lésion',
    it: 'Trauma e Lesione',
    el: 'Τραύμα & Κακώσεις',
    ru: 'Травма и ушиб'
  },
  respiratory: {
    de: 'Atemwege & Husten',
    en: 'Respiratory & Cough',
    es: 'Vías Respiratorias y Tos',
    fr: 'Voies Respiratoires et Toux',
    it: 'Vie Respiratorie e Tosse',
    el: 'Αναπνευστικό & Βήχας',
    ru: 'Дыхательные пути и кашель'
  },
  gastrointestinal: {
    de: 'Magen & Darm (Akut)',
    en: 'Gastrointestinal (Acute)',
    es: 'Gastrointestinal (Agudo)',
    fr: 'Gastro-intestinal (Aigu)',
    it: 'Gastrointestinale (Acuto)',
    el: 'Γαστρεντερικό (Οξύ)',
    ru: 'Желудочно-кишечный тракт'
  },
  skin: {
    de: 'Haut & Insektenstich',
    en: 'Skin & Insect Bite',
    es: 'Piel y Picaduras',
    fr: 'Peau et Piqûres',
    it: 'Pelle e Punture',
    el: 'Δέρμα & Τσιμπήματα',
    ru: 'Кожа и укусы насекомых'
  },
  pain_laterality: {
    de: 'Schmerz & Seitigkeit',
    en: 'Pain & Laterality',
    es: 'Dolor y Lateralidad',
    fr: 'Douleur et Latéralité',
    it: 'Dolore e Lateralità',
    el: 'Πόνος & Πλευρικότητα',
    ru: 'Боль и латеральность'
  },
  mind_shock: {
    de: 'Schreck & Gemütszustand',
    en: 'Shock & Emotional State',
    es: 'Susto y Estado Emocional',
    fr: 'Choc et État Émotionnel',
    it: 'Spavento e Stato Emotivo',
    el: 'Σοκ & Ψυχική Κατάσταση',
    ru: 'Шок и душевное состояние'
  },
  general: {
    de: 'Allgemeine Akutsymptome',
    en: 'General Acute Symptoms',
    es: 'Síntomas Agudos Generales',
    fr: 'Symptômes Aigus Généraux',
    it: 'Sintomi Acuti Generali',
    el: 'Γενικά Οξέα Συμπτώματα',
    ru: 'Общие острые симптомы'
  }
};

/**
 * Generates a targeted clinical differential distinction note between a candidate remedy and the primary Simile.
 */
function getDifferentialNote(
  candidate: LocalizedRemedy,
  primary: LocalizedRemedy,
  candidateKeynotes: string[],
  lang: LanguageCode
): string {
  const cKey = candidateKeynotes[0] || candidate.keynotes[0] || candidate.mainIndications[0] || '';
  const pName = primary.latinName;
  const cName = candidate.latinName;

  if (lang === 'de') {
    return `Differenzierung zu #1 (${pName}): Wählen Sie ${cName}, wenn folgendes Leitsymptom im Vordergrund steht: "${cKey}".`;
  }
  if (lang === 'en') {
    return `Differential distinction from #1 (${pName}): Choose ${cName} if the following keynote predominates: "${cKey}".`;
  }
  if (lang === 'es') {
    return `Diferenciación respecto a #1 (${pName}): Elija ${cName} si predomina el síntoma guía: "${cKey}".`;
  }
  if (lang === 'fr') {
    return `Différenciation par rapport à #1 (${pName}) : Choisir ${cName} si le symptôme clé prédomine : "${cKey}".`;
  }
  if (lang === 'it') {
    return `Differenziazione rispetto a #1 (${pName}): Scegliere ${cName} se predomina il sintomo guida: "${cKey}".`;
  }
  if (lang === 'el') {
    return `Διαφοροποίηση έναντι του #1 (${pName}): Επιλέξτε ${cName} εάν υπερισχύει το βασικό σύμπτωμα: "${cKey}".`;
  }
  return `Отличие от #1 (${pName}): Выбирайте ${cName}, если преобладает ключевой симптом: "${cKey}".`;
}

/**
 * Checks if target word shares root or exact prefix with search token.
 * Prevents false substring matches on opposites/unrelated compounds (e.g. "eiskaltem" matching "kalten").
 */
function wordMatchesToken(targetWord: string, searchWord: string): boolean {
  if (targetWord === searchWord) return true;
  if (targetWord.length >= 4 && searchWord.length >= 4) {
    if (targetWord.startsWith(searchWord.slice(0, 4))) return true;
    if (searchWord.startsWith(targetWord.slice(0, 4))) return true;
  }
  return false;
}

/**
 * Checks if any individual word in target text matches the search token.
 */
function matchesTextWords(targetTextClean: string, tokenClean: string): boolean {
  if (tokenClean.length < 3) return false;
  const words = targetTextClean.split(/[^a-z0-9]+/);
  return words.some((w) => wordMatchesToken(w, tokenClean));
}

/**
 * Matches recorded acute symptoms and clarification answers to the best-fitting homeopathic remedies.
 * Returns only the top 2 to 5 clinically relevant remedies ("einige, vielleicht zwei, drei, vier, fünf"),
 * preventing massive lists of 500+ irrelevant matches or false evaluations.
 */
export function matchSymptomsToRemedies(
  inputText: string,
  lang: LanguageCode = 'de',
  answers?: AcuteAnswers
): SymptomMatchResult[] {
  if (!inputText || inputText.trim().length < 3) {
    return [];
  }

  const normalizedInput = inputText.toLowerCase();
  const cleanInput = cleanNorm(inputText);
  const stopwords = STOPWORDS[lang] || STOPWORDS.en;

  // Detect acute domain (e.g. fever, headache, injury, respiratory, etc.)
  const domain = detectComplaintDomain(inputText);
  const coreRemedies = DOMAIN_CORE_REMEDIES[domain] || DOMAIN_CORE_REMEDIES.general;

  // Extract substantive tokens excluding stopwords and short words (< 3 chars)
  const rawTokens = normalizedInput
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'«»\[\]0-9]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);

  const tokens = rawTokens.filter((t) => !stopwords.has(t));
  const cleanTokens = tokens.map(cleanNorm);

  if (cleanTokens.length === 0 && !answers) {
    return [];
  }

  const remedies = getLocalizedRemedies(lang);
  const candidates: {
    remedy: LocalizedRemedy;
    rawScore: number;
    matchedKeywords: string[];
    matchedIndications: string[];
    matchedKeynotes: string[];
    matchedModalities: string[];
    hasDirectNameMatch: boolean;
  }[] = [];

  const betterWords = BETTER_TRIGGERS[lang] || BETTER_TRIGGERS.en;
  const worseWords = WORSE_TRIGGERS[lang] || WORSE_TRIGGERS.en;
  const isBetterMentioned = betterWords.some((bw) => normalizedInput.includes(bw));
  const isWorseMentioned = worseWords.some((ww) => normalizedInput.includes(ww));

  // Intensity factor from acute clarification questions (1 to 4 scale)
  const intensity = answers?.intensity || 2;
  const intensityFactor =
    intensity === 4 ? 1.6 : intensity === 3 ? 1.35 : intensity === 2 ? 1.05 : 0.85;

  // Determine remedies ruled out by classical contradictions in acute clarification answers
  const excludedRemedyIds = new Set<string>();
  if (answers) {
    Object.values(answers).forEach((val) => {
      if (typeof val === 'string' && EXCLUSION_RULES[val]) {
        EXCLUSION_RULES[val].excludeRemedies.forEach((rId) => excludedRemedyIds.add(rId));
      }
    });
  }

  for (const remedy of remedies) {
    // Ruled out by differential exclusion criterion (contradictory modality or keynote)
    if (excludedRemedyIds.has(remedy.id)) {
      continue;
    }

    let score = 0;
    const matchedKeywords: string[] = [];
    const matchedIndications: string[] = [];
    const matchedKeynotes: string[] = [];
    const matchedModalities: string[] = [];
    let hasDirectNameMatch = false;

    const isCore = coreRemedies.includes(remedy.id);

    // If domain is specific (e.g. fever, injury), non-core remedies must have an explicit indication match
    // to avoid false evaluations from incidental word overlap
    if (domain !== 'general' && !isCore) {
      // Check if remedy has any indication or keyword explicitly containing the core domain keyword
      const hasDomainIndication = remedy.mainIndications.some((ind) => {
        const indClean = cleanNorm(ind);
        return cleanTokens.some((ct) => matchesTextWords(indClean, ct));
      });
      if (!hasDomainIndication) {
        continue; // Exclude non-matching cross-domain remedy
      }
    }

    // 1. Domain affinity base bonus for core remedies
    if (isCore) {
      score += 30;
    }

    // 2. Direct Latin name, ID, or common name match in query
    const latinClean = cleanNorm(remedy.latinName);
    const commonClean = cleanNorm(remedy.commonName);
    const idClean = cleanNorm(remedy.id);

    if (
      cleanInput.includes(latinClean) ||
      cleanInput.includes(commonClean) ||
      cleanInput.includes(idClean)
    ) {
      score += 65;
      hasDirectNameMatch = true;
      matchedKeywords.push(remedy.latinName);
    } else {
      const firstLatinWord = latinClean.split(/\s+/)[0];
      if (firstLatinWord.length >= 4 && cleanInput.includes(firstLatinWord)) {
        score += 50;
        hasDirectNameMatch = true;
        matchedKeywords.push(remedy.latinName);
      }
    }

    // 3. Search keywords matching (specific homeopathic rubrics)
    for (const kw of remedy.searchKeywords) {
      const kwClean = cleanNorm(kw);
      if (kwClean.length >= 3 && !stopwords.has(kwClean)) {
        if (cleanTokens.some((ct) => matchesTextWords(kwClean, ct))) {
          score += 18;
          if (!matchedKeywords.includes(kw)) {
            matchedKeywords.push(kw);
          }
        }
      }
    }

    // 4. Main Indications matching (requires substantive overlap)
    for (const ind of remedy.mainIndications) {
      const indClean = cleanNorm(ind);
      let hitCount = 0;
      for (const ct of cleanTokens) {
        if (matchesTextWords(indClean, ct)) {
          hitCount++;
        }
      }

      if (hitCount >= 2 || (cleanTokens.length === 1 && hitCount === 1)) {
        score += 32;
        if (!matchedIndications.includes(ind)) {
          matchedIndications.push(ind);
        }
      } else if (hitCount === 1) {
        score += 14;
      }
    }

    // 5. Keynotes matching (characteristic clinical symptoms)
    for (const kn of remedy.keynotes) {
      const knClean = cleanNorm(kn);
      let hitCount = 0;
      for (const ct of cleanTokens) {
        if (matchesTextWords(knClean, ct)) {
          hitCount++;
        }
      }

      if (hitCount >= 2) {
        score += 26;
        if (!matchedKeynotes.includes(kn)) {
          matchedKeynotes.push(kn);
        }
      } else if (hitCount === 1) {
        score += 12;
      }
    }

    // 6. Modalities Better
    if (isBetterMentioned) {
      for (const mb of remedy.modalitiesBetter) {
        const mbClean = cleanNorm(mb);
        if (cleanTokens.some((ct) => matchesTextWords(mbClean, ct))) {
          score += 18;
          matchedModalities.push(`(+) ${mb}`);
        }
      }
    }

    // 7. Modalities Worse
    if (isWorseMentioned) {
      for (const mw of remedy.modalitiesWorse) {
        const mwClean = cleanNorm(mw);
        if (cleanTokens.some((ct) => matchesTextWords(mwClean, ct))) {
          score += 18;
          matchedModalities.push(`(-) ${mw}`);
        }
      }
    }

    // 8. Mind / Emotional state
    const mindClean = cleanNorm(remedy.mindEmotional);
    if (cleanTokens.some((ct) => matchesTextWords(mindClean, ct))) {
      score += 16;
      matchedKeywords.push(remedy.mindEmotional.slice(0, 35));
    }

    // 9. Acute Clarification Answers Integration (all answered questions including derived clarification)
    if (answers) {
      Object.entries(answers).forEach(([qKey, optId]) => {
        if (typeof optId === 'string') {
          if (optId.startsWith('derived_')) {
            const targetRemedyId = optId.replace('derived_', '');
            if (targetRemedyId === remedy.id) {
              score += Math.round(55 * intensityFactor);
              if (!matchedKeywords.includes(optId)) {
                matchedKeywords.push(optId);
              }
            } else if (targetRemedyId !== 'neither' && targetRemedyId !== 'none') {
              score -= 10;
            }
          } else if (OPTION_REMEDY_MAP[optId]) {
            const targetRemedyIds = OPTION_REMEDY_MAP[optId];
            if (targetRemedyIds[0] === remedy.id) {
              // First choice for this modality
              score += Math.round(50 * intensityFactor);
              if (!matchedKeywords.includes(optId)) {
                matchedKeywords.push(optId);
              }
            } else if (targetRemedyIds.includes(remedy.id)) {
              // Secondary choice for this modality
              score += Math.round(28 * intensityFactor);
            }
          }
        }
      });
    }

    // Filter by clinical threshold
    const hasFacets =
      hasDirectNameMatch ||
      matchedKeynotes.length > 0 ||
      matchedIndications.length > 0 ||
      matchedModalities.length > 0 ||
      matchedKeywords.length >= 1;

    if (score >= 25 && hasFacets) {
      candidates.push({
        remedy,
        rawScore: score,
        matchedKeywords,
        matchedIndications,
        matchedKeynotes,
        matchedModalities,
        hasDirectNameMatch
      });
    }
  }

  // If no candidates meet the clinical relevance threshold, return empty
  if (candidates.length === 0) {
    return [];
  }

  // Sort descending by raw score
  candidates.sort((a, b) => b.rawScore - a.rawScore);

  const topRawScore = candidates[0].rawScore;

  // Filter to remedies that are clinically close to the top match
  // and cap at strictly 2 to 4 remedies max ("vielleicht maximal zwei, drei oder vier Mittel")
  const filteredCandidates = candidates
    .filter((c, idx) => {
      if (idx === 0) return true;
      // Always include position 2 if it has clinical weight
      if (idx === 1 && c.rawScore >= 25) return true;
      // Position 3: must have solid score close to the top candidate (within 45%)
      if (idx === 2 && c.rawScore >= Math.max(28, topRawScore * 0.45)) {
        return true;
      }
      // Position 4: only if very relevant (within 55%)
      if (idx === 3 && c.rawScore >= Math.max(35, topRawScore * 0.55)) {
        return true;
      }
      return false;
    })
    .slice(0, 4); // STRICT CEILING: At most 4 remedies, never more!

  // Map to final SymptomMatchResult with differentiated percentage scores (e.g. 96%, 88%, 78%...)
  return filteredCandidates.map((c, index) => {
    let matchScore: number;
    if (index === 0) {
      matchScore = Math.min(98, Math.max(88, Math.round((c.rawScore / (topRawScore + 10)) * 98)));
    } else {
      const ratio = c.rawScore / topRawScore;
      const baseTop = Math.min(98, Math.max(88, Math.round((topRawScore / (topRawScore + 10)) * 98)));
      matchScore = Math.min(baseTop - (index * 6), Math.max(48, Math.round(baseTop * ratio)));
    }

    // Localized clinical rationale in all 7 supported languages
    let rationale = '';
    if (lang === 'de') {
      if (c.matchedKeynotes.length > 0) {
        rationale = `Leitsymptom-Übereinstimmung: ${c.matchedKeynotes[0]}`;
      } else if (c.matchedIndications.length > 0) {
        rationale = `Deckungsgleich mit Hauptindikation: ${c.matchedIndications[0]}`;
      } else if (c.matchedModalities.length > 0) {
        rationale = `Charakteristische Modalität: ${c.matchedModalities[0]}`;
      } else {
        rationale = `Symptommuster und Modalitäten weisen auf ${c.remedy.latinName} hin.`;
      }
    } else if (lang === 'en') {
      if (c.matchedKeynotes.length > 0) {
        rationale = `Keynote correlation: ${c.matchedKeynotes[0]}`;
      } else if (c.matchedIndications.length > 0) {
        rationale = `Congruent with primary indication: ${c.matchedIndications[0]}`;
      } else if (c.matchedModalities.length > 0) {
        rationale = `Characteristic modality: ${c.matchedModalities[0]}`;
      } else {
        rationale = `Symptom picture and modalities indicate ${c.remedy.latinName}.`;
      }
    } else if (lang === 'es') {
      if (c.matchedKeynotes.length > 0) {
        rationale = `Concordancia con síntomas guía: ${c.matchedKeynotes[0]}`;
      } else if (c.matchedIndications.length > 0) {
        rationale = `Coincidente con indicación principal: ${c.matchedIndications[0]}`;
      } else if (c.matchedModalities.length > 0) {
        rationale = `Modalidad característica: ${c.matchedModalities[0]}`;
      } else {
        rationale = `El cuadro sintomático orienta hacia ${c.remedy.latinName}.`;
      }
    } else if (lang === 'fr') {
      if (c.matchedKeynotes.length > 0) {
        rationale = `Concordance avec les symptômes clés : ${c.matchedKeynotes[0]}`;
      } else if (c.matchedIndications.length > 0) {
        rationale = `Conforme à l'indication principale : ${c.matchedIndications[0]}`;
      } else if (c.matchedModalities.length > 0) {
        rationale = `Modalité caractéristique : ${c.matchedModalities[0]}`;
      } else {
        rationale = `Le tableau clinique correspond à ${c.remedy.latinName}.`;
      }
    } else if (lang === 'el') {
      if (c.matchedKeynotes.length > 0) {
        rationale = `Συμφωνία με βασικά συμπτώματα: ${c.matchedKeynotes[0]}`;
      } else if (c.matchedIndications.length > 0) {
        rationale = `Συμβατό με κύρια ένδειξη: ${c.matchedIndications[0]}`;
      } else if (c.matchedModalities.length > 0) {
        rationale = `Χαρακτηριστική τροποποίηση: ${c.matchedModalities[0]}`;
      } else {
        rationale = `Η κλινική εικόνα υποδεικνύει ${c.remedy.latinName}.`;
      }
    } else if (lang === 'it') {
      if (c.matchedKeynotes.length > 0) {
        rationale = `Corrispondenza con i sintomi guida: ${c.matchedKeynotes[0]}`;
      } else if (c.matchedIndications.length > 0) {
        rationale = `Coerente con indicazione principale: ${c.matchedIndications[0]}`;
      } else if (c.matchedModalities.length > 0) {
        rationale = `Modalità caratteristica: ${c.matchedModalities[0]}`;
      } else {
        rationale = `Il quadro clinico orienta verso ${c.remedy.latinName}.`;
      }
    } else {
      if (c.matchedKeynotes.length > 0) {
        rationale = `Совпадение с ключевыми симптомами: ${c.matchedKeynotes[0]}`;
      } else if (c.matchedIndications.length > 0) {
        rationale = `Соответствие главному показанию: ${c.matchedIndications[0]}`;
      } else if (c.matchedModalities.length > 0) {
        rationale = `Характерная модальность: ${c.matchedModalities[0]}`;
      } else {
        rationale = `Картина симптомов указывает на ${c.remedy.latinName}.`;
      }
    }

    const isPrimarySimile = index === 0;
    let differentialNote: string | undefined;

    if (!isPrimarySimile && filteredCandidates[0]) {
      const primaryRemedy = filteredCandidates[0].remedy;
      differentialNote = getDifferentialNote(c.remedy, primaryRemedy, c.matchedKeynotes, lang);
    }

    return {
      remedy: c.remedy,
      matchScore,
      matchedKeywords: c.matchedKeywords,
      matchedIndications: c.matchedIndications,
      matchedKeynotes: c.matchedKeynotes,
      matchedModalities: c.matchedModalities,
      clinicalRationale: rationale,
      differentialNote,
      isPrimarySimile
    };
  });
}

/**
 * Performs a comprehensive homeopathic differential diagnosis step-by-step.
 * Returns the candidate pool, active eliminations with explicit contradiction rationale,
 * and strictly the top 2 to 4 remedies with comparative differentiation notes.
 */
export function performDifferentialDiagnosis(
  inputText: string,
  lang: LanguageCode = 'de',
  answers?: AcuteAnswers
): DifferentialDiagnosisResult {
  const domain = detectComplaintDomain(inputText);
  const domainName =
    DOMAIN_TITLES[domain]?.[lang] ||
    DOMAIN_TITLES[domain]?.en ||
    DOMAIN_TITLES.general[lang] ||
    DOMAIN_TITLES.general.en;

  const remedies = getLocalizedRemedies(lang);
  const coreIds = DOMAIN_CORE_REMEDIES[domain] || DOMAIN_CORE_REMEDIES.general;
  const candidatePool = coreIds
    .map((id) => remedies.find((r) => r.id === id))
    .filter((r): r is LocalizedRemedy => Boolean(r));

  // Determine active exclusions
  const excludedMap = new Map<string, { remedy: LocalizedRemedy; reason: string; triggeredByOptionId: string }>();
  if (answers) {
    Object.entries(answers).forEach(([, optId]) => {
      if (typeof optId === 'string' && EXCLUSION_RULES[optId]) {
        const rule = EXCLUSION_RULES[optId];
        const reasonText =
          EXCLUSION_REASONS[rule.reasonKey]?.[lang] ||
          EXCLUSION_REASONS[rule.reasonKey]?.en ||
          'Ausschluss durch Modalitäten-Widerspruch';
        rule.excludeRemedies.forEach((remId) => {
          const rem = remedies.find((r) => r.id === remId);
          if (rem && !excludedMap.has(remId)) {
            excludedMap.set(remId, {
              remedy: rem,
              reason: reasonText,
              triggeredByOptionId: optId
            });
          }
        });
      }
    });
  }

  // Get ranked remedies (strictly 2 to 4 remedies)
  const topRemedies = matchSymptomsToRemedies(inputText, lang, answers);

  const excludedRemedies: ExcludedRemedy[] = Array.from(excludedMap.values()).map((e) => ({
    remedy: e.remedy,
    reason: e.reason,
    triggeredByOptionId: e.triggeredByOptionId
  }));

  return {
    domain,
    domainName,
    candidatePool,
    topRemedies,
    excludedRemedies,
    activeAnswers: answers || {}
  };
}
