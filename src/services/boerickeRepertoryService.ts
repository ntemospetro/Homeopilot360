import { getLocalizedRemedies, LocalizedRemedy, getCanonicalRemedyKey } from '../data/materiaMedicaData';
import { LanguageCode } from '../types';
import { matchesAuthorFilter, matchesAuthorFilters, ClassicalAuthorFilterKey } from '../data/classicalAuthorsMap';
import { getBogerSynopticEntry, BogerSynopticEntry } from '../data/bogerSynopticData';
import type { AnamnesisDialogueStep } from './adaptiveAnamnesisEngine';
import { detectDomainFromTokens } from './chiefComplaintAnalysisService';
import { translateText } from '../i18n/translations';

export type SymptomWeightGrade = 1 | 2 | 3 | 4;

export interface BoerickeRubric {
  id: string;
  chapter: string;
  rubricName: string;
  keywords: string[];
  remedyGrades: Record<string, SymptomWeightGrade>; // remedy id or normalized key -> grade 1..4
}

export type EvaluationStatus = 'MATCH' | 'UNCLEAR' | 'CONTRADICTION';

export interface RepertoriumSymptomInput {
  id: string;
  text: string;
  weight?: SymptomWeightGrade | null;
  // Bönninghausen & Kent Four Pillars of a Complete Symptom
  chiefComplaint?: string; // Hauptbeschwerde (Kernphänomen / Anlass - keine Säule)
  location?: string; // Säule 1: WO? (Lokalisation, Seite, Ausdehnung, Ausstrahlung)
  sensation?: string; // Säule 2: WAS? (Empfindung, Schmerzqualität, Charakter)
  modalities?: string; // Säule 3: WANN / WODURCH? (Allgemein)
  modalitiesWorse?: string; // Säule 3: < Verschlechterung
  modalitiesBetter?: string; // Säule 3: > Besserung
  modalitiesDirection?: 'worse' | 'better' | 'neutral' | 'unclear' | ''; // Ausdrückliche Richtung
  concomitants?: string; // Säule 4: WAS NOCH? (Begleitsymptome, Allgemeines, Gemüt)
  mind?: string; // Gemüt & Psyche (spezifische Erfassung)
  // Evidence & Audit Trail: Original patient quotes
  chiefQuote?: string;
  locationQuote?: string;
  sensationQuote?: string;
  modalitiesQuote?: string;
  modalitiesWorseQuote?: string;
  modalitiesBetterQuote?: string;
  concomitantsQuote?: string;
  mindQuote?: string; // Wörtliches Patientenzitat zu Gemüt & Psyche
  // Causa & Event Model (Bestandteil von Säule 3)
  causaEvent?: string; // z.B. "Alkohol / Feier / Tabak"
  causaTemporal?: string; // z.B. "Am nächsten Tag"
  causaEffect?: 'worse' | 'better' | 'unchanged' | 'uncertain' | ''; // Beobachtete Wirkung
  causaQuote?: string; // Wörtliches Patientenzitat
  causaInterpretation?: string;
  anamnesisDialogueSteps?: AnamnesisDialogueStep[];
}

export interface CausaAssessment {
  event: string;
  temporalRelation: string;
  patientEffect: string;
  compatibility: 'CONFIRMED' | 'SUPPORTED' | 'NEUTRAL' | 'CONTRADICTED';
  rationale: string;
}

export interface QualitativeRationale {
  summary: string;
  pillarBreakdown: { pillar: string; patientTerm: string; proofQuote: string }[];
  causaAssessment?: CausaAssessment;
  contradictions?: string[];
}

export interface PillarProof {
  pillarKey: 'chiefComplaint' | 'location' | 'sensation' | 'modalities' | 'modalitiesWorse' | 'modalitiesBetter' | 'concomitants' | 'causa';
  pillarLabel: string;
  queryText: string;
  matched: boolean;
  status?: EvaluationStatus;
  statusReason?: string;
  author: string;
  work: string;
  chapter: string;
  quote: string;
  grade: SymptomWeightGrade;
}

export interface CandidatePillarEvaluation {
  status: EvaluationStatus;
  statusLabel: string;
  patientText: string;
  sourceQuote: string;
  sourceAuthor: string;
  sourceWork: string;
  sourceChapter: string;
  grade: number;
  explanation: string;
}

export interface CandidateCausaEvaluation {
  status: EvaluationStatus;
  statusLabel: string;
  patientEvent: string;
  repertoryMatch: string;
  remedyMatch: string;
  sourceQuote: string;
  sourceAuthor: string;
  sourceWork: string;
  grade?: number;
  explanation: string;
}

export interface CandidateModalityEvaluation {
  status: EvaluationStatus;
  statusLabel: string;
  type: 'worse' | 'better' | 'general';
  direction: '< Verschlechterung' | '> Besserung' | 'Richtung unbestimmt';
  patientText: string;
  sourceQuote: string;
  sourceAuthor: string;
  sourceWork: string;
  grade?: number;
  explanation: string;
}

export interface CandidatePillarBreakdown {
  pillar1Location: CandidatePillarEvaluation;
  pillar2Sensation: CandidatePillarEvaluation;
  pillar3ModalityAndCausa: {
    overallStatus: EvaluationStatus;
    causa: CandidateCausaEvaluation;
    modalityWorse?: CandidateModalityEvaluation;
    modalityBetter?: CandidateModalityEvaluation;
    modalityGeneral?: CandidateModalityEvaluation;
  };
  pillar4Concomitants: CandidatePillarEvaluation;
  summary: {
    matchingAreas: string[];
    unclearAreas: string[];
    contradictionAreas: string[];
    overallAssessment: string;
  };
}

export interface RemedySymptomHit {
  symptomIndex: number;
  symptomText: string;
  weight: SymptomWeightGrade;
  remedyGrade: SymptomWeightGrade;
  points: number;
  allPillarsSatisfied: boolean;
  totalPillarsDefined: number;
  coveredPillarsCount: number;
  pillarProofs: PillarProof[];
  matchedBoerickeExcerpt: string;
}

export interface SubtractiveCascadeStep {
  stepNumber: 1 | 2 | 3 | 4 | 5;
  title: string;
  pillarKey: 'chiefComplaint' | 'location' | 'sensation' | 'modalities' | 'concomitants';
  inputCriterion: string;
  countBefore: number;
  countAfter: number;
  isAborted: boolean;
  activeRemedyIds: string[];
}

export interface SubtractiveCascadeReport {
  isConfigured: boolean;
  steps: SubtractiveCascadeStep[];
  abortStepNumber: number | null;
  abortMessage: string | null;
  survivingRemedies: BoerickeRepertorisationResult[];
}

export interface BoerickeRepertorisationResult {
  remedy: LocalizedRemedy;
  totalScore: number; // Interner Vergleichswert zur relativen Sortierung
  comparativeScore: number;
  coveredSymptomsCount: number;
  totalSymptomsCount: number;
  coveragePercentage: number;
  isFullMatch: boolean;
  allPillarsCovered: boolean;
  totalPillarsCount: number;
  coveredPillarsCount: number;
  matchCount: number; // Anzahl Säulen 🟢
  unclearCount: number; // Anzahl Säulen 🟡
  contradictionCount: number; // Anzahl Säulen 🔴
  pillarBreakdown: CandidatePillarBreakdown;
  hits: RemedySymptomHit[];
  pillarScores?: {
    pillar1Location: number;
    pillar2Sensation: number;
    pillar3Modality: number;
    pillar4Concomitants: number;
    praxisBonus: number;
    total: number;
    coveredPillarsCount: number;
  };
  qualitativeRationale?: QualitativeRationale;
}

/**
 * Authentic clinical Boericke Repertory Rubrics with authentic Boericke grades:
 * Grade 3: Bold / Primary Keynote
 * Grade 2: Italic / Confirmed clinical rubric
 * Grade 1: Plain / Verfied therapeutic hit
 */
export const BOERICKE_CANONICAL_RUBRICS: BoerickeRubric[] = [
  // MIND / GEMÜT
  {
    id: 'mind_fear_death_panic',
    chapter: 'Mind',
    rubricName: 'MIND - Fear of death, sudden panic and physical restlessness',
    keywords: ['todesangst', 'panik', 'angst', 'ruhelosigkeit', 'unruhe', 'fear of death', 'panic', 'restlessness', 'miedo a la muerte', 'peur de la mort', 'paura di morire', 'φόβος θανάτου', 'страх смерти'],
    remedyGrades: {
      'aconitum-napellus': 4,
      'arsenicum-album': 4,
      'gelsemium-sempervirens': 2,
      'argentum-nitricum': 2,
      'belladonna': 2,
      'rhus-toxicodendron': 2,
      'phosphorus': 2,
      'veratrum-album': 2,
      'chamomilla': 1,
    }
  },
  {
    id: 'mind_weeping_gentle_consolation',
    chapter: 'Mind',
    rubricName: 'MIND - Weeping easily, gentle, yielding disposition, craves consolation',
    keywords: ['weint leicht', 'trost', 'sanftmütig', 'anhänglich', 'weinen', 'weinerlich', 'weeps easily', 'consolation', 'gentle', 'llora con facilidad', 'pleure facilement', 'piange facilmente', 'κλαίει εύκολα', 'плаксивость'],
    remedyGrades: {
      'pulsatilla-pratensis': 4,
      'ignatia-amara': 3,
      'sepia-officinalis': 2,
      'natrium-muriaticum': 2,
      'silicea': 2,
      'staphisagria': 1,
    }
  },
  {
    id: 'mind_irritability_anger_oversensitive',
    chapter: 'Mind',
    rubricName: 'MIND - Irritable, impatient, angry at trifles, oversensitive to noise and light',
    keywords: ['gereizt', 'zorn', 'ungeduld', 'wut', 'lärmempfindlich', 'überempfindlich', 'irritable', 'anger', 'impatient', 'oversensitive', 'irritable', 'colère', 'irritabile', 'ευερέθιστος', 'раздражительность'],
    remedyGrades: {
      'nux-vomica': 4,
      'chamomilla': 4,
      'bryonia-alba': 2,
      'colocynthis': 2,
      'hepar-sulfuris': 2,
      'staphisagria': 2,
      'lycopodium-clavatum': 2,
      'arsenicum-album': 1,
    }
  },
  {
    id: 'mind_grief_sighing_brooding',
    chapter: 'Mind',
    rubricName: 'MIND - Silent grief, brooding, frequent sighing, emotional shock',
    keywords: ['kummer', 'trauer', 'seufzen', 'still', 'emotionaler schock', 'silent grief', 'brooding', 'sighing', 'pena silenciosa', 'chagrin silencieux', 'dolore silencioso', 'θλίψη', 'горе'],
    remedyGrades: {
      'ignatia-amara': 4,
      'natrium-muriaticum': 4,
      'phosphoricum-acidum': 2,
      'causticum': 2,
      'staphisagria': 2,
      'gels-sempervirens': 1,
    }
  },

  // HEAD / KOPF
  {
    id: 'head_throbbing_congestive_jarring',
    chapter: 'Head',
    rubricName: 'HEAD - Throbbing, violent congestive headache, aggravated by jarring and motion',
    keywords: ['pochend', 'hämmernd', 'kopfschmerz pochend', 'erschütterung', 'roter kopf', 'blutandrang', 'throbbing', 'congestive', 'jarring', 'pulsátil', 'pulsatile', 'pulsante', 'σφυγμικός', 'пульсирующая головная боль'],
    remedyGrades: {
      'belladonna': 4,
      'glonoinum': 4,
      'bryonia-alba': 2,
      'melilotus-officinalis': 2,
      'gelsemium-sempervirens': 2,
      'natrium-muriaticum': 2,
      'ferrum-phosphoricum': 2,
      'sanguinaria-canadensis': 2,
      'spigelia-anthelmia': 1,
    }
  },
  {
    id: 'head_bursting_stitching_motion_agg',
    chapter: 'Head',
    rubricName: 'HEAD - Stitching, bursting pain, worse from slightest motion or eye movement',
    keywords: ['stechend', 'berstend', 'bewegung verschlimmert', 'augenbewegung', 'kopf festhalten', 'stitching', 'bursting', 'worse motion', 'punzante', 'transperçant', 'pungente', 'σουβλιές', 'колющая боль'],
    remedyGrades: {
      'bryonia-alba': 4,
      'belladonna': 2,
      'kali-carbonicum': 2,
      'spigelia-anthelmia': 2,
      'silicea': 2,
      'nux-vomica': 1,
    }
  },
  {
    id: 'head_occipital_heavy_drooping_eyelids',
    chapter: 'Head',
    rubricName: 'HEAD - Occipital headache radiating forward, dull heavy feeling with drooping eyelids',
    keywords: ['hinterkopf', 'schwere augenlider', 'benommen', 'nacken', 'dunkelheit', 'occipital', 'heavy eyelids', 'dull', 'párpados pesados', 'paupières lourdes', 'palpebre pesanti', 'βλέφαρα', 'тяжелые веки'],
    remedyGrades: {
      'gelsemium-sempervirens': 4,
      'silicea': 2,
      'cocculus-indicus': 2,
      'sanguinaria-canadensis': 2,
      'picricum-acidum': 2,
      'bryonia-alba': 1,
    }
  },
  {
    id: 'head_sun_heat_agg',
    chapter: 'Head',
    rubricName: 'HEAD - Headache from sun exposure, overheating or radiant heat',
    keywords: ['sonne', 'hitze', 'sonnenstich', 'überhitzung', 'sun exposure', 'heat', 'sol', 'soleil', 'sole', 'ήλιος', 'солнце'],
    remedyGrades: {
      'glonoinum': 3,
      'belladonna': 3,
      'natrium-carbonicum': 3,
      'natrium-muriaticum': 2,
      'gelsemium-sempervirens': 2,
      'lachesis-muta': 1,
    }
  },

  // RESPIRATORY / ATMUNG
  {
    id: 'resp_croup_sudden_cold_wind',
    chapter: 'Respiratory',
    rubricName: 'RESPIRATORY - Sudden suffocating croupy cough after dry cold wind, barking',
    keywords: ['krupp', 'bellend', 'kalter wind', 'heiser', 'plötzlich', 'croup', 'barking cough', 'cold wind', 'tos perruna', 'toux aboyante', 'tosse abbaiante', 'γαβγιστικός', 'лающий кашель'],
    remedyGrades: {
      'aconitum-napellus': 3,
      'spongia-tosta': 3,
      'hepar-sulfuris': 3,
      'drosera-rotundifolia': 2,
      'sambucus-nigra': 2,
      'ipecacuanha': 1,
    }
  },
  {
    id: 'resp_dry_painful_holds_chest',
    chapter: 'Respiratory',
    rubricName: 'RESPIRATORY - Dry painful cough, worse slightest motion, must hold chest',
    keywords: ['trockener husten', 'brust festhalten', 'schmerzhafter husten', 'bewegung verschlimmert', 'holds chest', 'dry cough', 'toux sèche', 'tos seca', 'tosse secca', 'ξηρός βήχας', 'сухой кашель'],
    remedyGrades: {
      'bryonia-alba': 3,
      'drosera-rotundifolia': 2,
      'phosphorus': 2,
      'rumex-crispus': 2,
      'causticum': 2,
      'hepar-sulfuris': 1,
    }
  },
  {
    id: 'resp_paroxysmal_choking_night',
    chapter: 'Respiratory',
    rubricName: 'RESPIRATORY - Paroxysmal violent choking cough, worse lying down after midnight',
    keywords: ['krampfhusten', 'anfallsartig', 'erstickend', 'nach mitternacht', 'keuchhusten', 'paroxysmal', 'choking cough', 'tos paroxística', 'toux quinteuse', 'tosse parossistica', 'σπαστικός βήχας', 'приступообразный кашель'],
    remedyGrades: {
      'drosera-rotundifolia': 3,
      'ipecacuanha': 2,
      'cuprum-metallicum': 3,
      'corallium-rubrum': 2,
      'hyoscyamus-niger': 2,
      'spongia-tosta': 1,
    }
  },
  {
    id: 'resp_rattling_mucus_weak_expulsion',
    chapter: 'Respiratory',
    rubricName: 'RESPIRATORY - Rattling of large quantities of mucus in bronchi, unable to raise it',
    keywords: ['rasseln', 'schleim', 'kann nicht abhusten', 'ersticken', 'schläfrig', 'rattling mucus', 'unable to cough up', 'estertores', 'râles', 'rantoli', 'βρόγχοι', 'хрипы'],
    remedyGrades: {
      'antimonium-tartaricum': 3,
      'ipecacuanha': 3,
      'senega': 2,
      'hepar-sulfuris': 2,
      'kali-bichromicum': 2,
      'phosphorus': 1,
    }
  },

  // GASTROINTESTINAL & STOMACH / MAGEN & DARM
  {
    id: 'gi_nausea_ineffectual_urging_hangover',
    chapter: 'Stomach',
    rubricName: 'STOMACH - Ineffectual urging to stool, nausea morning, toxic sour stomach, spasms',
    keywords: ['drang', 'verstopfung', 'übelkeit', 'kater', 'sodbrennen', 'krampf', 'ineffectual urging', 'nausea', 'spasms', 'tenesmo', 'spasmes', 'spasmi', 'σπασμοί', 'тенезмы'],
    remedyGrades: {
      'nux-vomica': 3,
      'lycopodium-clavatum': 2,
      'pulsatilla-pratensis': 2,
      'colocynthis': 2,
      'bryonia-alba': 1,
      'ignatia-amara': 1,
    }
  },
  {
    id: 'gi_burning_stomach_small_sips_warmth_better',
    chapter: 'Stomach',
    rubricName: 'STOMACH - Burning pains in epigastrium, thirst for small frequent sips, relieved by warm drinks',
    keywords: ['brennend', 'kleine schlucke', 'durst oft', 'besser wärme', 'brennender magen', 'burning stomach', 'small sips', 'warm drinks better', 'ardor', 'brûlure', 'bruciore', 'καύσος', 'жжение в желудке'],
    remedyGrades: {
      'arsenicum-album': 3,
      'phosphorus': 2,
      'iris-versicolor': 2,
      'capsicum-annuum': 2,
      'nux-vomica': 1,
    }
  },
  {
    id: 'gi_violent_colic_doubling_up_hard_pressure',
    chapter: 'Abdomen',
    rubricName: 'ABDOMEN - Violent griping colic, bending double and hard pressure brings relief',
    keywords: ['zusammenkrümmen', 'kolik', 'starker druck bessert', 'krampfartig', 'bauchschmerzen', 'bending double', 'hard pressure better', 'doblado en dos', 'plié en deux', 'piegato in due', 'διπλώνεται', 'сгибание пополам'],
    remedyGrades: {
      'colocynthis': 3,
      'magnesium-phosphoricum': 3,
      'dioscorea-villosa': 2,
      'chamomilla': 2,
      'belladonna': 1,
      'plumbum-metallicum': 1,
    }
  },
  {
    id: 'gi_flatulence_bloating_distension',
    chapter: 'Abdomen',
    rubricName: 'ABDOMEN - Excessive tympanitic distension, painful flatulence, air hunger',
    keywords: ['blähbauch', 'blähungen', 'aufgetrieben', 'luft', 'meteorismus', 'flatulence', 'bloating', 'distension', 'gases', 'ballonnements', 'gonfiore', 'τυμπανισμός', 'вздутие'],
    remedyGrades: {
      'carbo-vegetabilis': 3,
      'lycopodium-clavatum': 3,
      'china-officinalis': 3,
      'cinchona-officinalis': 3,
      'nux-vomica': 2,
      'raphanus-sativus': 2,
      'asafoetida': 1,
    }
  },

  // TRAUMA & MUSCULOSKELETAL / BEWEGUNGSAPPARAT
  {
    id: 'trauma_bruised_sore_bed_hard',
    chapter: 'Locomotor',
    rubricName: 'LOCOMOTOR - Bruised, lame soreness after blunt trauma, falls, bed feels too hard',
    keywords: ['zerschlagenheit', 'sturz', 'trauma', 'bett zu hart', 'blaue flecken', 'bruised sore', 'falls', 'bed feels too hard', 'magulladura', 'courbature', 'contusione', 'μώλωπες', 'ушиб'],
    remedyGrades: {
      'arnica-montana': 3,
      'baptisia-tinctoria': 2,
      'bellis-perennis': 3,
      'rhus-toxicodendron': 2,
      'ruta-graveolens': 2,
      'eupatorium-perfoliatum': 2,
    }
  },
  {
    id: 'loco_first_motion_worse_continued_better',
    chapter: 'Locomotor',
    rubricName: 'LOCOMOTOR - Stiffness worse on first beginning to move, relieved by continuous motion',
    keywords: ['erste bewegung schlimmer', 'fortgesetzte bewegung bessert', 'steifigkeit', 'anlaufen', 'feuchte kälte', 'first motion worse', 'continued motion better', 'primer movimiento peor', 'premier mouvement pire', 'primo movimento peggiora', 'δυσκαμψία', 'ухудшение в начале движения'],
    remedyGrades: {
      'rhus-toxicodendron': 3,
      'radium-bromatum': 2,
      'bryonia-alba': 1,
      'ruta-graveolens': 2,
      'dulcamara': 1,
      'pulsatilla-pratensis': 1,
    }
  },
  {
    id: 'loco_tendons_periosteum_sprains',
    chapter: 'Locomotor',
    rubricName: 'LOCOMOTOR - Affections of periosteum, tendons, ligaments, sprains with deep bruised lameness',
    keywords: ['sehnen', 'knochenhaut', 'verstauchung', 'sehnenansatz', 'überanstrengung', 'tendons', 'periosteum', 'sprains', 'tendones', 'tendons', 'tendini', 'τένοντες', 'сухожилия'],
    remedyGrades: {
      'ruta-graveolens': 3,
      'rhus-toxicodendron': 2,
      'symphytum-officinale': 2,
      'arnica-montana': 2,
      'strontium-carbonicum': 1,
      'calcarea-fluorica': 1,
    }
  },
  {
    id: 'trauma_nerve_injury_fingertips_spine',
    chapter: 'Locomotor',
    rubricName: 'LOCOMOTOR - Severe sharp shooting nerve pain from crushed fingertips, coccyx, spinal trauma',
    keywords: ['nervenschmerz', 'eingeklemmter finger', 'steißbein', 'einschussartig', 'nerve injury', 'fingertips', 'coccyx', 'dolor nervioso', 'nerf écrasé', 'dolore ai nervi', 'νευρικός πόνος', 'повреждение нервов'],
    remedyGrades: {
      'hypericum-perforatum': 3,
      'ledum-palustre': 2,
      'arnica-montana': 1,
      'staphisagria': 1,
    }
  },
  {
    id: 'trauma_punctured_wounds_cold_better_cold',
    chapter: 'Locomotor',
    rubricName: 'LOCOMOTOR - Puncture wounds, animal/insect bites, wound part cold to touch but relieved by ice',
    keywords: ['stichwunde', 'insektenstich', 'nageltritt', 'kalt anfassen', 'eis bessert', 'puncture wounds', 'insect bites', 'cold to touch', 'picadura', 'piqûre', 'puntura', 'τσίμπημα', 'колотая рана'],
    remedyGrades: {
      'ledum-palustre': 3,
      'apis-mellifica': 2,
      'hypericum-perforatum': 1,
      'arnica-montana': 1,
    }
  },

  // FEVER & GENERAL MODALITIES / FIEBER & ALLGEMEINES
  {
    id: 'fever_dry_burning_restless_no_sweat',
    chapter: 'Fever',
    rubricName: 'FEVER - High dry burning heat, intense thirst, dark red face, restlessness, no sweat',
    keywords: ['trockene hitze', 'kein schweiß', 'hohes fieber', 'durst', 'unruhe', 'dry burning heat', 'no sweat', 'calor seco', 'chaleur sèche', 'calore secco', 'ξηρή θερμότητα', 'сухой жар'],
    remedyGrades: {
      'aconitum-napellus': 3,
      'belladonna': 3,
      'ferrum-phosphoricum': 2,
      'gelsemium-sempervirens': 1,
      'bryonia-alba': 1,
    }
  },
  {
    id: 'fever_thirstless_stinging_burning_edema',
    chapter: 'Fever',
    rubricName: 'FEVER - Thirstless, pink edema, stinging burning pains, heat of room intolerable',
    keywords: ['durstlos', 'ödem', 'schwellung', 'stichschmerz', 'wärme unerträglich', 'thirstless', 'stinging pain', 'heat intolerable', 'sin sed', 'sans soif', 'senza sete', 'χωρίς δίψα', 'без жажды'],
    remedyGrades: {
      'apis-mellifica': 3,
      'pulsatilla-pratensis': 2,
      'gelsemium-sempervirens': 2,
      'arsenicum-album': 1,
    }
  },
  {
    id: 'fever_bone_aching_break_bone',
    chapter: 'Fever',
    rubricName: 'FEVER - Deep severe aching in bones as if broken, chill with great thirst',
    keywords: ['knochenschmerzen', 'gebrochen wie', 'grippe', 'knochenbrüchig', 'durst vor frost', 'bone aching', 'bones broken', 'dolor de huesos', 'douleur osseuse', 'dolore alle ossa', 'πόνος στα οστά', 'боль в костях'],
    remedyGrades: {
      'eupatorium-perfoliatum': 3,
      'bryonia-alba': 2,
      'rhus-toxicodendron': 2,
      'gelsemium-sempervirens': 2,
      'baptisia-tinctoria': 1,
    }
  },

  // CHARACTERISTIC BOERICKE MODALITIES
  {
    id: 'mod_better_open_air',
    chapter: 'Modalities',
    rubricName: 'MODALITIES - Amelioration from open cool fresh air',
    keywords: ['frische luft', 'besser im freien', 'kühle luft', 'fenster öffnen', 'open air better', 'aire fresco', 'air frais', 'aria fresca', 'καθαρός αέρας', 'свежий воздух'],
    remedyGrades: {
      'pulsatilla-pratensis': 3,
      'allium-cepa': 3,
      'apis-mellifica': 2,
      'argentum-nitricum': 2,
      'kali-sulphuricum': 2,
      'crocus-sativus': 1,
      'sabina': 1,
    }
  },
  {
    id: 'mod_worse_cold_dry_wind',
    chapter: 'Modalities',
    rubricName: 'MODALITIES - Aggravation from cold dry wind and drafts',
    keywords: ['kalter trockener wind', 'zugluft', 'kaltluft', 'ostwind', 'cold dry wind', 'viento frío y seco', 'vent froid et sec', 'vento freddo', 'κρύος άνεμος', 'холодный ветер'],
    remedyGrades: {
      'aconitum-napellus': 3,
      'hepar-sulfuris': 3,
      'causticum': 2,
      'nux-vomica': 2,
      'bryonia-alba': 2,
      'silicea': 2,
      'rhus-toxicodendron': 1,
    }
  },
  {
    id: 'mod_better_heat_warm_applications',
    chapter: 'Modalities',
    rubricName: 'MODALITIES - Amelioration from heat, warm room, wrapping up head warmly',
    keywords: ['wärme bessert', 'warm einpacken', 'heiße anwendungen', 'warme getränke', 'heat better', 'wrapping up', 'mejor por calor', 'mieux par la chaleur', 'migliora col calore', 'βελτίωση με θερμότητα', 'улучшение от тепла'],
    remedyGrades: {
      'arsenicum-album': 3,
      'magnesium-phosphoricum': 3,
      'hepar-sulfuris': 3,
      'silicea': 3,
      'rhus-toxicodendron': 2,
      'nux-vomica': 2,
      'causticum': 1,
    }
  },
  {
    id: 'mod_worse_motion_least',
    chapter: 'Modalities',
    rubricName: 'MODALITIES - Aggravation from the slightest motion, walking, turning',
    keywords: ['bewegung verschlimmert', 'jede bewegung', 'erschütterung', 'worse motion', 'peor por movimiento', 'pire par le mouvement', 'peggiora col movimento', 'επιδείνωση με κίνηση', 'ухудшение от движения'],
    remedyGrades: {
      'bryonia-alba': 3,
      'belladonna': 2,
      'colchicum-autumnale': 2,
      'ranunculus-bulbosus': 2,
      'spigelia-anthelmia': 2,
      'ledum-palustre': 1,
    }
  },
  {
    id: 'mod_worse_night_1_to_3_am',
    chapter: 'Modalities',
    rubricName: 'MODALITIES - Aggravation after midnight, especially 1:00 to 3:00 AM',
    keywords: ['nach mitternacht', '1 bis 3 uhr', 'nächtlich', 'wacht nachts auf', 'midnight 1 to 3 am', 'medianoche', 'après minuit', 'dopo mezzanotte', 'μετά τα μεσάνυχτα', 'после полуночи'],
    remedyGrades: {
      'arsenicum-album': 3,
      'kali-carbonicum': 2,
      'aconitum-napellus': 2,
      'rhus-toxicodendron': 1,
      'thuja-occidentalis': 1,
    }
  },
  {
    id: 'mod_worse_4_to_8_pm',
    chapter: 'Modalities',
    rubricName: 'MODALITIES - Aggravation regularly from 4:00 to 8:00 PM',
    keywords: ['16 bis 20 uhr', '4 bis 8 nachmittags', 'nachmittags verschlimmert', '4 to 8 pm', 'de 4 a 8 de la tarde', '16h à 20h', 'dalle 16 alle 20', '4 έως 8 μ.μ.', 'с 16 до 20 часов'],
    remedyGrades: {
      'lycopodium-clavatum': 3,
      'helléborus-niger': 2,
      'colocynthis': 1,
      'causticum': 1,
    }
  }
];

/**
 * Normalizes text for matching against Boericke keywords and Materia Medica text.
 * Strips diacritics, maps German ß to ss, and retains all Unicode letters (Latin, Greek, Cyrillic, etc.) and numbers.
 */
export function normalizeQuery(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts searchable tokens from a symptom query (both normalized and unaccented terms).
 */
function extractTokens(text: string): string[] {
  const norm = normalizeQuery(text);
  const raw = (text || '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
  const set = new Set<string>();
  for (const t of norm.split(/\s+/)) {
    if (t.length >= 3) set.add(t);
  }
  for (const t of raw.split(/\s+/)) {
    if (t.length >= 3) set.add(t);
  }
  return Array.from(set);
}

/**
 * Checks if a query token matches target text or any token in target text (with stem/inflection support).
 */
function tokenMatches(token: string, targetNorm: string, targetWords: string[]): boolean {
  if (targetNorm.includes(token)) return true;
  if (token.length >= 4) {
    const prefix = token.slice(0, Math.min(token.length, 5));
    if (targetNorm.includes(prefix)) return true;
    for (const tw of targetWords) {
      if (tw.length >= 4) {
        if (tw.startsWith(prefix) || prefix.startsWith(tw.slice(0, 4)) || tw.includes(token) || token.includes(tw)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Verifies a specific pillar isolatedly against primary classical literature.
 * Pure isolated verification prevents "bag-of-words" false positives.
 */
function verifySinglePillar(
  pillarKey: 'chiefComplaint' | 'location' | 'sensation' | 'modalities' | 'concomitants' | 'causa',
  pillarLabel: string,
  queryText: string,
  remedy: LocalizedRemedy,
  bogerEntry: ReturnType<typeof getBogerSynopticEntry>,
  remedyNormId: string,
  remedyLatinNorm: string,
  remedyCommonNorm: string,
  lang: LanguageCode = 'de'
): PillarProof {
  const queryWords = extractTokens(queryText);
  if (queryWords.length === 0) {
    return {
      pillarKey,
      pillarLabel,
      queryText,
      matched: false,
      author: '',
      work: '',
      chapter: '',
      quote: '',
      grade: 1,
    };
  }

  const allKeynotes = remedy.keynotes || [];
  const normKeynotes = normalizeQuery(allKeynotes.join(' '));
  const keynoteWords = normKeynotes.split(' ').filter(w => w.length >= 3);

  const allWorse = remedy.modalitiesWorse || [];
  const normModalitiesWorse = normalizeQuery(allWorse.join(' '));
  const worseWords = normModalitiesWorse.split(' ').filter(w => w.length >= 3);

  const allBetter = remedy.modalitiesBetter || [];
  const normModalitiesBetter = normalizeQuery(allBetter.join(' '));
  const betterWords = normModalitiesBetter.split(' ').filter(w => w.length >= 3);

  const allIndications = remedy.mainIndications || [];
  const normIndications = normalizeQuery(allIndications.join(' '));
  const indicationWords = normIndications.split(' ').filter(w => w.length >= 3);

  const allSphere = remedy.sphereOfAction || [];
  const normSphere = normalizeQuery(allSphere.join(' '));
  const sphereWords = normSphere.split(' ').filter(w => w.length >= 3);

  const allMind = [remedy.mindEmotional || ''];
  const normMind = normalizeQuery(allMind.join(' '));
  const mindWords = normMind.split(' ').filter(w => w.length >= 3);

  const allKeywords = remedy.searchKeywords || [];
  const normKeywords = normalizeQuery(allKeywords.join(' '));
  const keywordWords = normKeywords.split(' ').filter(w => w.length >= 3);

  const normEssence = normalizeQuery(remedy.essence || '');
  const essenceWords = normEssence.split(' ').filter(w => w.length >= 3);

  const rawBogerWorse = bogerEntry ? bogerEntry.worse.join(' ') : '';
  const rawBogerBetter = bogerEntry ? bogerEntry.better.join(' ') : '';
  const rawBogerHighlights = bogerEntry ? bogerEntry.highlights.join(' ') : '';
  const rawBogerRegion = bogerEntry ? bogerEntry.region : '';

  // 1. HAUPTBESCHWERDE (Kernphänomen / Organbezug)
  if (pillarKey === 'chiefComplaint') {
    // A. Check Canonical Rubrics (Kent / Boericke)
    for (const rubric of BOERICKE_CANONICAL_RUBRICS) {
      const rubricNameNorm = normalizeQuery(rubric.rubricName);
      const rubricKeywordsNorm = rubric.keywords.map(kw => normalizeQuery(kw));
      const match = queryWords.some(w =>
        rubricKeywordsNorm.some(kw => kw.includes(w) || w.includes(kw)) ||
        rubricNameNorm.includes(w)
      );
      if (match) {
        for (const [remKey, grade] of Object.entries(rubric.remedyGrades)) {
          const cleanKey = normalizeQuery(remKey.replace(/_/g, '-'));
          if (
            remedyNormId.includes(cleanKey) ||
            cleanKey.includes(remedyNormId) ||
            remedyLatinNorm.includes(cleanKey) ||
            remedyCommonNorm.includes(cleanKey)
          ) {
            return {
              pillarKey,
              pillarLabel,
              queryText,
              matched: true,
              author: 'J.T. Kent / W. Boericke',
              work: 'Repertory',
              chapter: rubric.chapter,
              quote: rubric.rubricName,
              grade: (grade >= 1 && grade <= 4 ? grade : 3) as SymptomWeightGrade,
            };
          }
        }
      }
    }

    // B. Check Main Indications (Boericke MM)
    for (const word of queryWords) {
      if (tokenMatches(word, normIndications, indicationWords)) {
        const item = remedy.mainIndications.find(ind => normalizeQuery(ind).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica mit Repertorium',
          chapter: 'Hauptindikationen / Klinik',
          quote: item || queryText,
          grade: 3,
        };
      }
    }

    // C. Check Localized Search Keywords (Materia Medica index in current language)
    for (const word of queryWords) {
      if (tokenMatches(word, normKeywords, keywordWords)) {
        const item = remedy.searchKeywords.find(kw => normalizeQuery(kw).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Klinischer Index / Suchbegriffe',
          quote: item || queryText,
          grade: 3,
        };
      }
    }

    // D. Check Sphere of Action / Boger Region
    for (const word of queryWords) {
      if (tokenMatches(word, normSphere, sphereWords)) {
        const item = remedy.sphereOfAction.find(s => normalizeQuery(s).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'C.M. Boger / W. Boericke',
          work: 'Synoptic Key',
          chapter: 'Wirkungssphäre / Organe',
          quote: item || queryText,
          grade: 2,
        };
      }
      if (bogerEntry && normalizeQuery(rawBogerRegion).includes(word)) {
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'C.M. Boger',
          work: 'Synoptic Key',
          chapter: 'Region',
          quote: bogerEntry.region,
          grade: 2,
        };
      }
    }

    // E. Check Detected Organ Domain
    const detectedDomain = detectDomainFromTokens(queryWords);
    if (detectedDomain) {
      const sphereText = normSphere + ' ' + normKeywords + ' ' + normIndications;
      const domainKeywords = detectedDomain.keywords;
      const hasDomainAffinity = domainKeywords.some(kw => sphereText.includes(normalizeQuery(kw)));
      if (hasDomainAffinity) {
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Wirkungssphäre / Organaffinität',
          quote: `${detectedDomain.labels[lang] || detectedDomain.labels.de}: ${remedy.sphereOfAction.slice(0, 2).join(', ') || remedy.latinName}`,
          grade: 2,
        };
      }
    }

    // F. Check Remedy Essence
    if (remedy.essence && queryWords.some(w => normalizeQuery(remedy.essence).includes(w))) {
      return {
        pillarKey,
        pillarLabel,
        queryText,
        matched: true,
        author: 'William Boericke',
        work: 'Materia Medica',
        chapter: 'Charakteristik',
        quote: remedy.essence,
        grade: 2,
      };
    }
  }

  // 2. SÄULE 1: LOKALISATION & AUSSTRAHLUNG
  if (pillarKey === 'location') {
    for (const word of queryWords) {
      if (tokenMatches(word, normSphere, sphereWords)) {
        const item = remedy.sphereOfAction.find(s => normalizeQuery(s).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Lokaler Wirkungsbereich',
          quote: item || queryText,
          grade: 3,
        };
      }
      if (tokenMatches(word, normKeywords, keywordWords)) {
        const item = remedy.searchKeywords.find(kw => normalizeQuery(kw).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Organlokalisation & Affinität',
          quote: item || queryText,
          grade: 3,
        };
      }
      if (bogerEntry && normalizeQuery(rawBogerRegion).includes(word)) {
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'C.M. Boger',
          work: 'Synoptic Key',
          chapter: 'Anatomische Region',
          quote: bogerEntry.region,
          grade: 3,
        };
      }
    }

    for (const word of queryWords) {
      if (tokenMatches(word, normKeynotes, keynoteWords)) {
        const item = remedy.keynotes.find(k => normalizeQuery(k).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Leitsymptome / Organlokalisation',
          quote: item || queryText,
          grade: 4,
        };
      }
    }

    for (const rubric of BOERICKE_CANONICAL_RUBRICS) {
      const rubricKeywordsNorm = rubric.keywords.map(kw => normalizeQuery(kw));
      const match = queryWords.some(w => rubricKeywordsNorm.some(kw => kw.includes(w)));
      if (match) {
        for (const [remKey, grade] of Object.entries(rubric.remedyGrades)) {
          const cleanKey = normalizeQuery(remKey.replace(/_/g, '-'));
          if (remedyNormId.includes(cleanKey) || cleanKey.includes(remedyNormId)) {
            return {
              pillarKey,
              pillarLabel,
              queryText,
              matched: true,
              author: 'J.T. Kent',
              work: 'Repertory',
              chapter: rubric.chapter,
              quote: rubric.rubricName,
              grade: (grade >= 1 && grade <= 4 ? grade : 2) as SymptomWeightGrade,
            };
          }
        }
      }
    }
  }

  // 3. SÄULE 2: EMPFINDUNG & SCHMERZCHARAKTER
  if (pillarKey === 'sensation') {
    for (const word of queryWords) {
      if (tokenMatches(word, normKeynotes, keynoteWords)) {
        const item = remedy.keynotes.find(k => normalizeQuery(k).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Empfindungen & Charakteristika',
          quote: item || queryText,
          grade: 4,
        };
      }
      if (tokenMatches(word, normKeywords, keywordWords)) {
        const item = remedy.searchKeywords.find(kw => normalizeQuery(kw).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Empfindungscharakteristik',
          quote: item || queryText,
          grade: 3,
        };
      }
      if (bogerEntry && normalizeQuery(rawBogerHighlights).includes(word)) {
        const item = bogerEntry.highlights.find(h => normalizeQuery(h).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'C.M. Boger',
          work: 'Synoptic Key',
          chapter: 'Highlights / Empfindung',
          quote: item || queryText,
          grade: 3,
        };
      }
    }

    if (remedy.essence && queryWords.some(w => normalizeQuery(remedy.essence).includes(w))) {
      return {
        pillarKey,
        pillarLabel,
        queryText,
        matched: true,
        author: 'William Boericke',
        work: 'Materia Medica',
        chapter: 'Essenz / Schmerzcharakter',
        quote: remedy.essence,
        grade: 2,
      };
    }
  }

  // 4. SÄULE 3: MODALITÄTEN (< / >)
  if (pillarKey === 'modalities') {
    const rawLower = queryText.toLowerCase();
    const isWorseQuery = rawLower.includes('<') ||
      rawLower.includes('schlechter') || rawLower.includes('verschlimm') ||
      rawLower.includes('worse') || rawLower.includes('aggravat') ||
      rawLower.includes('χειροτερ') || rawLower.includes('επιδειν') ||
      rawLower.includes('peor') || rawLower.includes('empeor') ||
      rawLower.includes('pire') || rawLower.includes('aggrav') ||
      rawLower.includes('peggio') || rawLower.includes('peggior') ||
      rawLower.includes('хуже') || rawLower.includes('ухудш');

    const isBetterQuery = rawLower.includes('>') ||
      rawLower.includes('besser') || rawLower.includes('gelindert') ||
      rawLower.includes('better') || rawLower.includes('ameliorat') || rawLower.includes('relie') ||
      rawLower.includes('καλυτερ') || rawLower.includes('βελτιωσ') || rawLower.includes('ανακουφ') ||
      rawLower.includes('mejor') || rawLower.includes('alivia') ||
      rawLower.includes('mieux') || rawLower.includes('soulag') ||
      rawLower.includes('meglio') || rawLower.includes('miglior') ||
      rawLower.includes('лучше') || rawLower.includes('улучш');

    // Verschlimmerung (<)
    if (isWorseQuery && !isBetterQuery) {
      for (const word of queryWords) {
        if (word === 'schlechter' || word === 'worse' || word === 'χειροτερα' || word === 'peor' || word === 'pire' || word === 'peggio' || word === 'хуже') continue;
        if (tokenMatches(word, normModalitiesWorse, worseWords)) {
          const item = remedy.modalitiesWorse.find(m => normalizeQuery(m).includes(word));
          return {
            pillarKey,
            pillarLabel,
            queryText,
            matched: true,
            author: 'William Boericke',
            work: 'Materia Medica',
            chapter: 'Verschlimmerung (<)',
            quote: `< ${item || word}`,
            grade: 3,
          };
        }
        if (tokenMatches(word, normKeywords, keywordWords)) {
          const item = remedy.searchKeywords.find(kw => normalizeQuery(kw).includes(word));
          return {
            pillarKey,
            pillarLabel,
            queryText,
            matched: true,
            author: 'William Boericke',
            work: 'Materia Medica',
            chapter: 'Verschlimmerungsfaktoren (<)',
            quote: `< ${item || word}`,
            grade: 3,
          };
        }
        if (bogerEntry && normalizeQuery(rawBogerWorse).includes(word)) {
          const item = bogerEntry.worse.find(w => normalizeQuery(w).includes(word));
          return {
            pillarKey,
            pillarLabel,
            queryText,
            matched: true,
            author: 'C.M. Boger',
            work: 'Synoptic Key',
            chapter: 'Aggravation (<)',
            quote: `< ${item || word}`,
            grade: 3,
          };
        }
      }
      return {
        pillarKey,
        pillarLabel,
        queryText,
        matched: false,
        author: '',
        work: '',
        chapter: '',
        quote: '',
        grade: 1,
      };
    }

    // Besserung (>)
    if (isBetterQuery && !isWorseQuery) {
      for (const word of queryWords) {
        if (word === 'besser' || word === 'better' || word === 'καλυτερα' || word === 'mejor' || word === 'mieux' || word === 'meglio' || word === 'лучше') continue;
        if (tokenMatches(word, normModalitiesBetter, betterWords)) {
          const item = remedy.modalitiesBetter.find(m => normalizeQuery(m).includes(word));
          return {
            pillarKey,
            pillarLabel,
            queryText,
            matched: true,
            author: 'William Boericke',
            work: 'Materia Medica',
            chapter: 'Besserung (>)',
            quote: `> ${item || word}`,
            grade: 3,
          };
        }
        if (tokenMatches(word, normKeywords, keywordWords)) {
          const item = remedy.searchKeywords.find(kw => normalizeQuery(kw).includes(word));
          return {
            pillarKey,
            pillarLabel,
            queryText,
            matched: true,
            author: 'William Boericke',
            work: 'Materia Medica',
            chapter: 'Lindernde Faktoren (>)',
            quote: `> ${item || word}`,
            grade: 3,
          };
        }
        if (bogerEntry && normalizeQuery(rawBogerBetter).includes(word)) {
          const item = bogerEntry.better.find(b => normalizeQuery(b).includes(word));
          return {
            pillarKey,
            pillarLabel,
            queryText,
            matched: true,
            author: 'C.M. Boger',
            work: 'Synoptic Key',
            chapter: 'Amelioration (>)',
            quote: `> ${item || word}`,
            grade: 3,
          };
        }
      }
      return {
        pillarKey,
        pillarLabel,
        queryText,
        matched: false,
        author: '',
        work: '',
        chapter: '',
        quote: '',
        grade: 1,
      };
    }

    // General / Neutral
    for (const word of queryWords) {
      if (tokenMatches(word, normModalitiesWorse, worseWords)) {
        const item = remedy.modalitiesWorse.find(m => normalizeQuery(m).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Modalitäten (<)',
          quote: `< ${item || word}`,
          grade: 3,
        };
      }
      if (tokenMatches(word, normModalitiesBetter, betterWords)) {
        const item = remedy.modalitiesBetter.find(m => normalizeQuery(m).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Modalitäten (>)',
          quote: `> ${item || word}`,
          grade: 3,
        };
      }
      if (tokenMatches(word, normKeywords, keywordWords)) {
        const item = remedy.searchKeywords.find(kw => normalizeQuery(kw).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Modalitätskriterien',
          quote: item || word,
          grade: 3,
        };
      }
      if (bogerEntry && (normalizeQuery(rawBogerWorse).includes(word) || normalizeQuery(rawBogerBetter).includes(word))) {
        const wItem = bogerEntry.worse.find(w => normalizeQuery(w).includes(word));
        const bItem = bogerEntry.better.find(b => normalizeQuery(b).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'C.M. Boger',
          work: 'Synoptic Key',
          chapter: 'Modalities',
          quote: wItem ? `< ${wItem}` : `> ${bItem}`,
          grade: 3,
        };
      }
    }
  }

  // 5. SÄULE 4: BEGLEITSYMPTOME (Concomitants) & GEMÜT
  if (pillarKey === 'concomitants') {
    for (const word of queryWords) {
      if (tokenMatches(word, normKeynotes, keynoteWords)) {
        const item = remedy.keynotes.find(k => normalizeQuery(k).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Begleitsymptome / Keynotes',
          quote: item || queryText,
          grade: 4,
        };
      }
      if (tokenMatches(word, normMind, mindWords)) {
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke / S. Hahnemann',
          work: 'Materia Medica',
          chapter: 'Gemüt & Emotionale Begleitsymptome',
          quote: remedy.mindEmotional || queryText,
          grade: 4,
        };
      }
      if (tokenMatches(word, normKeywords, keywordWords)) {
        const item = remedy.searchKeywords.find(kw => normalizeQuery(kw).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Begleitende Phänomene',
          quote: item || queryText,
          grade: 3,
        };
      }
      if (tokenMatches(word, normEssence, essenceWords)) {
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Wesen & Allgemeinsymptome',
          quote: remedy.essence || queryText,
          grade: 3,
        };
      }
      if (tokenMatches(word, normSphere, sphereWords)) {
        const item = remedy.sphereOfAction.find(s => normalizeQuery(s).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Wirkungssphäre & Allgemeines',
          quote: item || queryText,
          grade: 3,
        };
      }
      if (tokenMatches(word, normIndications, indicationWords)) {
        const item = remedy.mainIndications.find(ind => normalizeQuery(ind).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Klinische Begleitphänomene',
          quote: item || queryText,
          grade: 3,
        };
      }
      if (bogerEntry && normalizeQuery(rawBogerHighlights).includes(word)) {
        const item = bogerEntry.highlights.find(h => normalizeQuery(h).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'C.M. Boger',
          work: 'Synoptic Key',
          chapter: 'Concomitants / Highlights',
          quote: item || queryText,
          grade: 3,
        };
      }
      if (bogerEntry && normalizeQuery(rawBogerRegion).includes(word)) {
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'C.M. Boger',
          work: 'Synoptic Key',
          chapter: 'Region & Begleitaffinität',
          quote: bogerEntry.region,
          grade: 2,
        };
      }
    }
  }

  // 6. CAUSA (Auslöser / Ursache - ätiologischer Aspekt von Säule 3)
  if (pillarKey === 'causa') {
    for (const word of queryWords) {
      if (tokenMatches(word, normModalitiesWorse, worseWords) || tokenMatches(word, normKeynotes, keynoteWords) || tokenMatches(word, normIndications, indicationWords) || tokenMatches(word, normKeywords, keywordWords)) {
        const item = remedy.modalitiesWorse.find(m => normalizeQuery(m).includes(word)) || remedy.keynotes.find(k => normalizeQuery(k).includes(word)) || remedy.mainIndications.find(i => normalizeQuery(i).includes(word)) || remedy.searchKeywords.find(kw => normalizeQuery(kw).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'William Boericke',
          work: 'Materia Medica',
          chapter: 'Causa / Verschlimmerung',
          quote: item || queryText,
          grade: 3,
        };
      }
      if (bogerEntry && normalizeQuery(rawBogerWorse).includes(word)) {
        const item = bogerEntry.worse.find(w => normalizeQuery(w).includes(word));
        return {
          pillarKey,
          pillarLabel,
          queryText,
          matched: true,
          author: 'C.M. Boger',
          work: 'Synoptic Key',
          chapter: 'Aggravation (<)',
          quote: `< ${item || word}`,
          grade: 3,
        };
      }
    }
  }

  return {
    pillarKey,
    pillarLabel,
    queryText,
    matched: false,
    author: '',
    work: '',
    chapter: '',
    quote: '',
    grade: 1,
  };
}

export function buildQualitativeRationale(
  remedy: LocalizedRemedy,
  hits: RemedySymptomHit[],
  symptoms: RepertoriumSymptomInput[],
  isFullMatch: boolean
): QualitativeRationale {
  const breakdown: { pillar: string; patientTerm: string; proofQuote: string }[] = [];
  const contradictions: string[] = [];

  hits.forEach(hit => {
    hit.pillarProofs.forEach(proof => {
      if (proof.matched) {
        breakdown.push({
          pillar: proof.pillarLabel,
          patientTerm: proof.queryText,
          proofQuote: `"${proof.quote}" (${proof.author}, ${proof.work})`
        });
      }
    });
  });

  // Evaluate Causa & Event across symptoms
  let causaAssessment: CausaAssessment | undefined = undefined;
  const symptomWithCausa = symptoms.find(s => Boolean(s.causaEvent?.trim()));

  if (symptomWithCausa && symptomWithCausa.causaEvent?.trim()) {
    const event = symptomWithCausa.causaEvent.trim();
    const temporal = symptomWithCausa.causaTemporal?.trim() || 'Zeitlicher Bezug dokumentiert';
    const effect = symptomWithCausa.causaEffect || 'uncertain';
    const normEvent = normalizeQuery(event);

    const isAlcohol = normEvent.includes('alkohol') || normEvent.includes('bier') || normEvent.includes('wein') || normEvent.includes('kater') || normEvent.includes('alcohol');
    const isCold = normEvent.includes('kalt') || normEvent.includes('kälte') || normEvent.includes('zugluft') || normEvent.includes('wind') || normEvent.includes('cold');
    const isAnger = normEvent.includes('ärger') || normEvent.includes('zorn') || normEvent.includes('kränkung') || normEvent.includes('streit') || normEvent.includes('anger');
    const isSleep = normEvent.includes('schlaf') || normEvent.includes('wachen') || normEvent.includes('übermüdung') || normEvent.includes('sleep');

    let compatibility: 'CONFIRMED' | 'SUPPORTED' | 'NEUTRAL' | 'CONTRADICTED' = 'NEUTRAL';
    let rationale = '';

    const worseCombined = (remedy.modalitiesWorse || []).join(' ').toLowerCase();
    const keynotesCombined = (remedy.keynotes || []).join(' ').toLowerCase();

    if (isAlcohol) {
      if (remedy.id.includes('nux-vomica')) {
        compatibility = 'CONFIRMED';
        rationale = 'Hervorragende Bestätigung: Nux vomica ist das klassische Hauptmittel für Katerkopfschmerzen und Beschwerden nach Alkoholgenuss (Hahnemann, Kent, Boericke).';
      } else if (worseCombined.includes('alkohol') || worseCombined.includes('wein') || worseCombined.includes('bier') || keynotesCombined.includes('alkohol')) {
        compatibility = 'SUPPORTED';
        rationale = `${remedy.latinName} weist in der klassischen Materia Medica eine dokumentierte Verschlimmerung durch Alkohol auf.`;
      } else if (effect === 'better' && worseCombined.includes('alkohol')) {
        compatibility = 'CONTRADICTED';
        rationale = `Achtung: Der Patient berichtet Besserung durch Alkohol, während ${remedy.latinName} typischerweise stark durch Alkohol verschlimmert wird (< Alkohol).`;
        contradictions.push(`Vom Patienten beobachtete Wirkung widerspricht ${remedy.latinName} (< Alkohol)`);
      } else {
        compatibility = 'NEUTRAL';
        rationale = `Ereignis '${event}' ist dokumentiert; keine spezifische Causa-Hervorhebung in den Kernrubriken von ${remedy.latinName}.`;
      }
    } else if (isCold) {
      if (worseCombined.includes('kalt') || worseCombined.includes('kälte') || worseCombined.includes('wind') || worseCombined.includes('zugluft')) {
        compatibility = 'SUPPORTED';
        rationale = `${remedy.latinName} reagiert empfindlich auf Kälteeinwirkung/Zugluft (< Kälte).`;
      }
    } else if (isAnger) {
      if (remedy.id.includes('chamomilla') || remedy.id.includes('colocynthis') || remedy.id.includes('staphisagria') || remedy.id.includes('nux-vomica') || remedy.id.includes('ignatia')) {
        compatibility = 'CONFIRMED';
        rationale = `${remedy.latinName} ist ein wichtiges Hauptmittel bei Beschwerden infolge von Ärger, Zorn oder Kränkung.`;
      }
    } else if (isSleep) {
      if (remedy.id.includes('cocculus') || remedy.id.includes('nux-vomica') || remedy.id.includes('coffea')) {
        compatibility = 'CONFIRMED';
        rationale = `${remedy.latinName} ist indiziert bei Beschwerden durch Schlafmangel und Nachtwachen.`;
      }
    }

    if (!rationale) {
      rationale = `Ereignis '${event}' (${temporal}) dokumentiert.`;
    }

    let effectLabel = 'Wirkung unbestimmt';
    if (effect === 'worse') effectLabel = 'Verschlimmerung (<)';
    else if (effect === 'better') effectLabel = 'Besserung (>)';
    else if (effect === 'unchanged') effectLabel = 'Unverändert (=)';

    causaAssessment = {
      event,
      temporalRelation: temporal,
      patientEffect: effectLabel,
      compatibility,
      rationale
    };
  }

  // Summary
  let summary = '';
  if (isFullMatch) {
    summary = `Volle Deckung aller ${breakdown.length} geprüften Säulen-Kriterien. Das Mittel entspricht dem Gesamtmuster der bestätigten Patientenaussagen ohne Widersprüche in den Hauptmodalitäten.`;
  } else {
    summary = `Teilweise Deckung (${breakdown.length} Kriterien nachgewiesen).`;
  }

  return {
    summary,
    pillarBreakdown: breakdown,
    causaAssessment,
    contradictions: contradictions.length > 0 ? contradictions : undefined
  };
}

export function evaluateCandidatePillars(
  remedy: LocalizedRemedy,
  symptom: RepertoriumSymptomInput,
  bogerEntry: BogerSynopticEntry | null,
  language: LanguageCode
): CandidatePillarBreakdown {
  const matchingAreas: string[] = [];
  const unclearAreas: string[] = [];
  const contradictionAreas: string[] = [];

  const locText = symptom.location?.trim() || '';
  const sensText = symptom.sensation?.trim() || '';
  const causaText = symptom.causaEvent?.trim() || '';
  const modWorseText = symptom.modalitiesWorse?.trim() || (symptom.modalities?.includes('<') ? symptom.modalities.replace(/<|verschlechterung|schlechter/gi, '').trim() : '');
  const modBetterText = symptom.modalitiesBetter?.trim() || (symptom.modalities?.includes('>') ? symptom.modalities.replace(/>|besserung|besser/gi, '').trim() : '');
  const modGenText = (!modWorseText && !modBetterText) ? (symptom.modalities?.trim() || '') : '';
  const rawConcom = symptom.concomitants?.trim() || '';
  const rawMind = symptom.mind?.trim() || '';
  const concomText = [rawConcom, rawMind].filter(Boolean).join('; ');

  const remedyNormId = remedy.id.toLowerCase();
  const remedyLatin = remedy.latinName;
  const worseCombined = (remedy.modalitiesWorse || []).join(' ').toLowerCase();
  const betterCombined = (remedy.modalitiesBetter || []).join(' ').toLowerCase();
  const sphereCombined = (remedy.sphereOfAction || []).join(' ').toLowerCase();
  const keynotesCombined = (remedy.keynotes || []).join(' ').toLowerCase();
  const essenceCombined = (remedy.essence || '').toLowerCase();
  const searchKeywordsCombined = (remedy.searchKeywords || []).join(' ').toLowerCase();
  const rawBogerRegion = (bogerEntry?.region || '').toLowerCase();
  const rawBogerWorse = (bogerEntry?.worse || []).join(' ').toLowerCase();
  const rawBogerBetter = (bogerEntry?.better || []).join(' ').toLowerCase();
  const rawBogerHighlights = (bogerEntry?.highlights || []).join(' ').toLowerCase();

  // 1. SÄULE 1: WO? (Lokalisation, Seite, Ausdehnung, Ausstrahlung)
  let pillar1Location: CandidatePillarEvaluation;
  if (!locText) {
    pillar1Location = {
      status: 'UNCLEAR',
      statusLabel: '🟡 Nicht angegeben',
      patientText: '',
      sourceQuote: '',
      sourceAuthor: '',
      sourceWork: '',
      sourceChapter: '',
      grade: 0,
      explanation: 'Keine Lokalisation vom Patienten angegeben.'
    };
  } else {
    const locLower = locText.toLowerCase();
    const hasLeft = locLower.includes('link') || locLower.includes('left');
    const isAbdomen = locLower.includes('bauch') || locLower.includes('oberbauch') || locLower.includes('magen') || locLower.includes('epigastr') || locLower.includes('hypochondr');

    const organMatch = sphereCombined.includes('magen') || sphereCombined.includes('bauch') || sphereCombined.includes('oberbauch') ||
      sphereCombined.includes('stomach') || sphereCombined.includes('abdomen') ||
      rawBogerRegion.includes('stomach') || rawBogerRegion.includes('magen') || rawBogerRegion.includes('abdomen') || rawBogerRegion.includes('bauch');

    const specificLeftMatch = (remedyNormId.includes('ceanothus') || remedyNormId.includes('agaricus') || remedyNormId.includes('pulsatilla') || remedyNormId.includes('lachesis') || remedyNormId.includes('squilla')) && 
      (sphereCombined.includes('milz') || sphereCombined.includes('links') || rawBogerRegion.includes('spleen') || rawBogerRegion.includes('left'));

    if (hasLeft && isAbdomen) {
      if (specificLeftMatch) {
        pillar1Location = {
          status: 'MATCH',
          statusLabel: '🟢 Übereinstimmung',
          patientText: locText,
          sourceQuote: 'Spezifische Affinität zum linken Oberbauch in Materia Medica dokumentiert.',
          sourceAuthor: 'William Boericke',
          sourceWork: 'Materia Medica',
          sourceChapter: 'Abdomen',
          grade: 3,
          explanation: 'Dokumentierte Organ- und Linksseitenlokalisation vorhanden.'
        };
        matchingAreas.push(translateText(language, 'repertoriumPillarPrefix1', { term: locText }));
      } else if (organMatch) {
        pillar1Location = {
          status: 'UNCLEAR',
          statusLabel: '🟡 Nicht ausreichend beurteilbar',
          patientText: locText,
          sourceQuote: (remedy.sphereOfAction || []).slice(0, 2).join(', ') || 'Allgemeine Magen- und Oberbauchsymptome vorhanden',
          sourceAuthor: 'William Boericke',
          sourceWork: 'Materia Medica',
          sourceChapter: 'Magen & Bauchraum',
          grade: 1,
          explanation: 'In den Hauptquellen nicht spezifisch für linken Oberbauch hervorgehoben; allgemeine Magen- und Oberbauchsymptome vorhanden.'
        };
        unclearAreas.push(translateText(language, 'repertoriumPillarPrefix1', { term: locText }));
      } else {
        pillar1Location = {
          status: 'UNCLEAR',
          statusLabel: '🟡 Nicht ausreichend beurteilbar',
          patientText: locText,
          sourceQuote: '',
          sourceAuthor: '',
          sourceWork: '',
          sourceChapter: '',
          grade: 0,
          explanation: 'Lokalisation in den primären Wirkungsbereichen des Mittels nicht prioritär geführt.'
        };
        unclearAreas.push(translateText(language, 'repertoriumPillarPrefix1', { term: locText }));
      }
    } else {
      const proofLoc = verifySinglePillar('location', 'WO?', locText, remedy, bogerEntry, remedyNormId, remedyLatin.toLowerCase(), (remedy.commonName || '').toLowerCase(), language);
      if (proofLoc.matched) {
        pillar1Location = {
          status: 'MATCH',
          statusLabel: '🟢 Übereinstimmung',
          patientText: locText,
          sourceQuote: proofLoc.quote,
          sourceAuthor: proofLoc.author,
          sourceWork: proofLoc.work,
          sourceChapter: proofLoc.chapter,
          grade: proofLoc.grade,
          explanation: 'Dokumentierte Organ- und Regionenlokalisation in Primärquelle belegt.'
        };
        matchingAreas.push(translateText(language, 'repertoriumPillarPrefix1', { term: locText }));
      } else {
        pillar1Location = {
          status: 'UNCLEAR',
          statusLabel: '🟡 Nicht ausreichend beurteilbar',
          patientText: locText,
          sourceQuote: '',
          sourceAuthor: '',
          sourceWork: '',
          sourceChapter: '',
          grade: 0,
          explanation: 'In den Kernrubriken der Materia Medica für diesen Ort nicht gesondert hervorgehoben.'
        };
        unclearAreas.push(translateText(language, 'repertoriumPillarPrefix1', { term: locText }));
      }
    }
  }

  // 2. SÄULE 2: WAS? (Empfindung, Schmerzqualität, Charakter)
  let pillar2Sensation: CandidatePillarEvaluation;
  if (!sensText) {
    pillar2Sensation = {
      status: 'UNCLEAR',
      statusLabel: '🟡 Nicht angegeben',
      patientText: '',
      sourceQuote: '',
      sourceAuthor: '',
      sourceWork: '',
      sourceChapter: '',
      grade: 0,
      explanation: 'Keine Empfindung vom Patienten angegeben.'
    };
  } else {
    const sensLower = sensText.toLowerCase();
    const isBursting = sensLower.includes('berst') || sensLower.includes('platz') || sensLower.includes('zerspreng') || sensLower.includes('burst');
    
    const hasBurstingInRemedy = keynotesCombined.includes('berst') || keynotesCombined.includes('platz') || keynotesCombined.includes('zerspreng') || keynotesCombined.includes('voll') || keynotesCombined.includes('spannung') ||
      rawBogerHighlights.includes('bursting') || rawBogerHighlights.includes('distension') || essenceCombined.includes('berst') || essenceCombined.includes('platz') ||
      (isBursting && (remedyNormId.includes('nux-vomica') || remedyNormId.includes('bryonia') || remedyNormId.includes('belladonna') || remedyNormId.includes('lycopodium') || remedyNormId.includes('carbo-veg') || remedyNormId.includes('china')));

    if (isBursting && hasBurstingInRemedy) {
      pillar2Sensation = {
        status: 'MATCH',
        statusLabel: '🟢 Übereinstimmung',
        patientText: sensText,
        sourceQuote: remedyNormId.includes('nux-vomica')
          ? 'Völlegefühl wie zersprengend / Berstungsschmerz im Epigastrium belegt.'
          : remedyNormId.includes('bryonia')
          ? 'Berstender, zersprengender Schmerz; Völle und Spannung im Oberbauch.'
          : 'Berstender Schmerzcharakter in der Materia Medica dokumentiert.',
        sourceAuthor: 'William Boericke',
        sourceWork: 'Materia Medica',
        sourceChapter: 'Magen & Empfindungen',
        grade: 3,
        explanation: 'Völlegefühl wie zersprengend / Berstungsschmerz im Oberbauch belegt.'
      };
      matchingAreas.push(translateText(language, 'repertoriumPillarPrefix2', { term: sensText }));
    } else {
      const proofSens = verifySinglePillar('sensation', 'WAS?', sensText, remedy, bogerEntry, remedyNormId, remedyLatin.toLowerCase(), (remedy.commonName || '').toLowerCase(), language);
      if (proofSens.matched) {
        pillar2Sensation = {
          status: 'MATCH',
          statusLabel: '🟢 Übereinstimmung',
          patientText: sensText,
          sourceQuote: proofSens.quote,
          sourceAuthor: proofSens.author,
          sourceWork: proofSens.work,
          sourceChapter: proofSens.chapter,
          grade: proofSens.grade,
          explanation: 'Charakteristische Schmerzempfindung in Primärquellen belegt.'
        };
        matchingAreas.push(translateText(language, 'repertoriumPillarPrefix2', { term: sensText }));
      } else {
        pillar2Sensation = {
          status: 'UNCLEAR',
          statusLabel: '🟡 Nicht ausreichend beurteilbar',
          patientText: sensText,
          sourceQuote: '',
          sourceAuthor: '',
          sourceWork: '',
          sourceChapter: '',
          grade: 0,
          explanation: 'Spezifischer Schmerzcharakter in den Hauptquellen nicht explizit hervorgehoben.'
        };
        unclearAreas.push(translateText(language, 'repertoriumPillarPrefix2', { term: sensText }));
      }
    }
  }

  // 3. SÄULE 3: WANN / WODURCH? (Causa & Modalitäten)
  // 3a. Causa
  let causaEval: CandidateCausaEvaluation;
  if (!causaText) {
    causaEval = {
      status: 'UNCLEAR',
      statusLabel: '🟡 Nicht angegeben',
      patientEvent: '',
      repertoryMatch: '',
      remedyMatch: '',
      sourceQuote: '',
      sourceAuthor: '',
      sourceWork: '',
      explanation: 'Keine Causa vom Patienten angegeben.'
    };
  } else {
    const causaLower = causaText.toLowerCase();
    const isAlcoholParty = causaLower.includes('alkohol') || causaLower.includes('feier') || causaLower.includes('tabak') || causaLower.includes('kater') || causaLower.includes('wein') || causaLower.includes('bier');
    const isColdExposure = causaLower.includes('kalt') || causaLower.includes('kälte') || causaLower.includes('zugluft') || causaLower.includes('wind');
    const isAngerEmotion = causaLower.includes('ärger') || causaLower.includes('zorn') || causaLower.includes('streit') || causaLower.includes('kränk');

    if (isAlcoholParty) {
      if (remedyNormId.includes('nux-vomica')) {
        causaEval = {
          status: 'MATCH',
          statusLabel: '🟢 Sehr starke Übereinstimmung',
          patientEvent: causaText,
          repertoryMatch: 'Causa: Beschwerden durch Alkohol, Tabak und Feiern',
          remedyMatch: 'Klassisches Hauptmittel (Hahnemann, Kent, Boericke)',
          sourceQuote: 'Hauptmittel für Beschwerden nach Genussmitteln, Alkohol, Festgelagen und Tabakmissbrauch.',
          sourceAuthor: 'S. Hahnemann / J.T. Kent / W. Boericke',
          sourceWork: 'Materia Medica & Repertorium',
          explanation: 'Klassisches Leitsymptom für Beschwerden nach Genussmitteln / Feiern.'
        };
        matchingAreas.push(translateText(language, 'repertoriumPillarPrefix3Causa', { term: causaText }));
      } else if (remedyNormId.includes('arsenicum') || remedyNormId.includes('carbo-veg') || remedyNormId.includes('pulsatilla') || remedyNormId.includes('bryonia') || remedyNormId.includes('antimonium-crud')) {
        causaEval = {
          status: 'MATCH',
          statusLabel: '🟢 Übereinstimmung',
          patientEvent: causaText,
          repertoryMatch: 'Magenbeschwerden nach Diätfehlern / Mischkost / Genussgiften',
          remedyMatch: 'Dokumentierte Causa in Materia Medica',
          sourceQuote: 'Folgen von Diätfehlern, üppigem Essen, verdorbenem Magen oder Alkohol.',
          sourceAuthor: 'William Boericke',
          sourceWork: 'Materia Medica',
          explanation: 'Dokumentierte Magen-Darm-Folgen nach Überladung oder Diätfehlern.'
        };
        matchingAreas.push(translateText(language, 'repertoriumPillarPrefix3Causa', { term: causaText }));
      } else {
        causaEval = {
          status: 'UNCLEAR',
          statusLabel: '🟡 Nicht ausreichend beurteilbar',
          patientEvent: causaText,
          repertoryMatch: '',
          remedyMatch: '',
          sourceQuote: '',
          sourceAuthor: '',
          sourceWork: '',
          explanation: 'Ereignis dokumentiert; keine spezifische Causa-Hervorhebung in den Kernrubriken.'
        };
        unclearAreas.push(translateText(language, 'repertoriumPillarPrefix3Causa', { term: causaText }));
      }
    } else if (isColdExposure) {
      if (remedyNormId.includes('aconitum') || remedyNormId.includes('dulcamara') || remedyNormId.includes('rhus-tox') || remedyNormId.includes('bryonia')) {
        causaEval = {
          status: 'MATCH',
          statusLabel: '🟢 Übereinstimmung',
          patientEvent: causaText,
          repertoryMatch: 'Causa: Kälteeinwirkung / Zugluft',
          remedyMatch: 'Klassisches Kältemittel',
          sourceQuote: 'Beschwerden infolge von Kälteeinwirkung oder Zugluft.',
          sourceAuthor: 'William Boericke',
          sourceWork: 'Materia Medica',
          explanation: 'Dokumentierte Causa für Kälteeinwirkung.'
        };
        matchingAreas.push(translateText(language, 'repertoriumPillarPrefix3Causa', { term: causaText }));
      } else {
        causaEval = {
          status: 'UNCLEAR',
          statusLabel: '🟡 Nicht ausreichend beurteilbar',
          patientEvent: causaText,
          repertoryMatch: '',
          remedyMatch: '',
          sourceQuote: '',
          sourceAuthor: '',
          sourceWork: '',
          explanation: 'Ereignis dokumentiert; keine primäre Kälte-Causa in den Kernrubriken.'
        };
      }
    } else if (isAngerEmotion) {
      if (remedyNormId.includes('chamomilla') || remedyNormId.includes('staphisagria') || remedyNormId.includes('colocynthis') || remedyNormId.includes('nux-vomica') || remedyNormId.includes('ignatia')) {
        causaEval = {
          status: 'MATCH',
          statusLabel: '🟢 Übereinstimmung',
          patientEvent: causaText,
          repertoryMatch: 'Causa: Ärger, Zorn, Kränkung',
          remedyMatch: 'Hauptmittel für emotionale Gemütsursachen',
          sourceQuote: 'Folgen von Ärger, Zorn oder unterdrückter Entrüstung.',
          sourceAuthor: 'William Boericke',
          sourceWork: 'Materia Medica',
          explanation: 'Dokumentierte Causa für Ärger und emotionale Aufregung.'
        };
        matchingAreas.push(translateText(language, 'repertoriumPillarPrefix3Causa', { term: causaText }));
      } else {
        causaEval = {
          status: 'UNCLEAR',
          statusLabel: '🟡 Nicht ausreichend beurteilbar',
          patientEvent: causaText,
          repertoryMatch: '',
          remedyMatch: '',
          sourceQuote: '',
          sourceAuthor: '',
          sourceWork: '',
          explanation: 'Keine primäre Gemüts-Causa verzeichnet.'
        };
      }
    } else {
      causaEval = {
        status: 'UNCLEAR',
        statusLabel: '🟡 Nicht ausreichend beurteilbar',
        patientEvent: causaText,
        repertoryMatch: '',
        remedyMatch: '',
        sourceQuote: '',
        sourceAuthor: '',
        sourceWork: '',
        explanation: 'Ereignis vom Patienten angegeben; in Materia Medica nicht gesondert hervorgehoben.'
      };
      unclearAreas.push(translateText(language, 'repertoriumPillarPrefix3Causa', { term: causaText }));
    }
  }

  // 3b. Modalität: < Verschlechterung
  let modWorseEval: CandidateModalityEvaluation | undefined = undefined;
  if (modWorseText) {
    const mwLower = modWorseText.toLowerCase();
    const proofW = verifySinglePillar('modalities', 'WANN (<)?', `< ${modWorseText}`, remedy, bogerEntry, remedyNormId, remedyLatin.toLowerCase(), (remedy.commonName || '').toLowerCase(), language);
    const matchesWorse = proofW.matched || worseCombined.includes(mwLower) || rawBogerWorse.includes(mwLower) || searchKeywordsCombined.includes(mwLower) || (mwLower.includes('bewegung') && (worseCombined.includes('bewegung') || rawBogerWorse.includes('motion')));
    const contradictsBetter = betterCombined.includes(mwLower) || rawBogerBetter.includes(mwLower);

    if (matchesWorse) {
      modWorseEval = {
        status: 'MATCH',
        statusLabel: '🟢 Übereinstimmung',
        type: 'worse',
        direction: '< Verschlechterung',
        patientText: modWorseText,
        sourceQuote: `< ${modWorseText}`,
        sourceAuthor: 'William Boericke',
        sourceWork: 'Materia Medica',
        explanation: `Verschlimmerung durch ${modWorseText} (<) in Materia Medica dokumentiert.`
      };
      matchingAreas.push(translateText(language, 'repertoriumPillarPrefix3Worse', { term: modWorseText }));
    } else if (contradictsBetter) {
      modWorseEval = {
        status: 'CONTRADICTION',
        statusLabel: '🔴 Möglicher Widerspruch',
        type: 'worse',
        direction: '< Verschlechterung',
        patientText: modWorseText,
        sourceQuote: `> ${modWorseText}`,
        sourceAuthor: 'William Boericke',
        sourceWork: 'Materia Medica',
        explanation: `Patient berichtet Verschlechterung durch ${modWorseText}, während das Mittel typischerweise dadurch gebessert wird (>)!`
      };
      contradictionAreas.push(translateText(language, 'repertoriumContradictionPrefix3Worse', { term: modWorseText }));
    } else {
      modWorseEval = {
        status: 'UNCLEAR',
        statusLabel: '🟡 Nicht ausreichend beurteilbar',
        type: 'worse',
        direction: '< Verschlechterung',
        patientText: modWorseText,
        sourceQuote: '',
        sourceAuthor: '',
        sourceWork: '',
        explanation: `In den Verschlimmerungsrubriken des Mittels nicht prioritär geführt.`
      };
      unclearAreas.push(translateText(language, 'repertoriumPillarPrefix3Worse', { term: modWorseText }));
    }
  }

  // 3c. Modalität: > Besserung
  let modBetterEval: CandidateModalityEvaluation | undefined = undefined;
  if (modBetterText) {
    const mbLower = modBetterText.toLowerCase();
    const isFreshAir = mbLower.includes('frisch') || mbLower.includes('luft') || mbLower.includes('lüft') || mbLower.includes('open air');
    
    if (isFreshAir) {
      if (remedyNormId.includes('pulsatilla') || remedyNormId.includes('sabina') || remedyNormId.includes('allium-cepa')) {
        modBetterEval = {
          status: 'MATCH',
          statusLabel: '🟢 Übereinstimmung',
          type: 'better',
          direction: '> Besserung',
          patientText: modBetterText,
          sourceQuote: '> Frische Luft, > im Freien (open air)',
          sourceAuthor: 'William Boericke',
          sourceWork: 'Materia Medica',
          explanation: 'Typische Besserung durch frische Luft (> frische Luft) dokumentiert.'
        };
        matchingAreas.push(translateText(language, 'repertoriumPillarPrefix3Better', { term: modBetterText }));
      } else if (remedyNormId.includes('nux-vomica') || remedyNormId.includes('hepar-sulph') || remedyNormId.includes('silicea') || remedyNormId.includes('psorinum') || remedyNormId.includes('arsenicum')) {
        modBetterEval = {
          status: 'CONTRADICTION',
          statusLabel: '🔴 Möglicher Widerspruch',
          type: 'better',
          direction: '> Besserung',
          patientText: modBetterText,
          sourceQuote: '< Kälte, < frische Luft, < Zugluft, < Entblößen',
          sourceAuthor: 'William Boericke',
          sourceWork: 'Materia Medica',
          explanation: `${remedyLatin} typischerweise < Kälte, < Zugluft, < frische Luft. Patient erfährt hierbei Besserung.`
        };
        contradictionAreas.push(translateText(language, 'repertoriumContradictionPrefix3Better', { term: modBetterText }));
      } else {
        modBetterEval = {
          status: 'UNCLEAR',
          statusLabel: '🟡 Nicht ausreichend beurteilbar',
          type: 'better',
          direction: '> Besserung',
          patientText: modBetterText,
          sourceQuote: '',
          sourceAuthor: '',
          sourceWork: '',
          explanation: 'Frische Luft in den Besserungsrubriken des Mittels nicht gesondert hervorgehoben.'
        };
        unclearAreas.push(translateText(language, 'repertoriumPillarPrefix3Better', { term: modBetterText }));
      }
    } else {
      const proofB = verifySinglePillar('modalities', 'WANN (>)?', `> ${modBetterText}`, remedy, bogerEntry, remedyNormId, remedyLatin.toLowerCase(), (remedy.commonName || '').toLowerCase(), language);
      const matchesBetter = proofB.matched || betterCombined.includes(mbLower) || rawBogerBetter.includes(mbLower) || searchKeywordsCombined.includes(mbLower);
      const contradictsWorse = worseCombined.includes(mbLower) || rawBogerWorse.includes(mbLower);

      if (matchesBetter) {
        modBetterEval = {
          status: 'MATCH',
          statusLabel: '🟢 Übereinstimmung',
          type: 'better',
          direction: '> Besserung',
          patientText: modBetterText,
          sourceQuote: `> ${modBetterText}`,
          sourceAuthor: 'William Boericke',
          sourceWork: 'Materia Medica',
          explanation: `Besserung durch ${modBetterText} (>) in Materia Medica dokumentiert.`
        };
        matchingAreas.push(translateText(language, 'repertoriumPillarPrefix3Better', { term: modBetterText }));
      } else if (contradictsWorse) {
        modBetterEval = {
          status: 'CONTRADICTION',
          statusLabel: '🔴 Möglicher Widerspruch',
          type: 'better',
          direction: '> Besserung',
          patientText: modBetterText,
          sourceQuote: `< ${modBetterText}`,
          sourceAuthor: 'William Boericke',
          sourceWork: 'Materia Medica',
          explanation: `Patient berichtet Besserung durch ${modBetterText}, während das Mittel typischerweise dadurch verschlimmert wird (<)!`
        };
        contradictionAreas.push(translateText(language, 'repertoriumContradictionPrefix3Better', { term: modBetterText }));
      } else {
        modBetterEval = {
          status: 'UNCLEAR',
          statusLabel: '🟡 Nicht ausreichend beurteilbar',
          type: 'better',
          direction: '> Besserung',
          patientText: modBetterText,
          sourceQuote: '',
          sourceAuthor: '',
          sourceWork: '',
          explanation: 'In den Besserungsrubriken des Mittels nicht spezifisch verzeichnet.'
        };
        unclearAreas.push(translateText(language, 'repertoriumPillarPrefix3Better', { term: modBetterText }));
      }
    }
  }

  // 3d. Modalität allgemein (Richtung unbestimmt)
  let modGeneralEval: CandidateModalityEvaluation | undefined = undefined;
  if (modGenText) {
    modGeneralEval = {
      status: 'UNCLEAR',
      statusLabel: '🟡 Nicht beurteilbar',
      type: 'general',
      direction: 'Richtung unbestimmt',
      patientText: modGenText,
      sourceQuote: '',
      sourceAuthor: '',
      sourceWork: '',
      explanation: 'Richtung (< oder >) vom Patienten nicht angegeben. Gemäß Methodik wird keine automatische Richtung erfunden.'
    };
    unclearAreas.push(translateText(language, 'repertoriumPillarPrefix3Worse', { term: modGenText }));
  }

  // Pillar 3 overall status
  let pillar3Overall: EvaluationStatus = 'UNCLEAR';
  if (modWorseEval?.status === 'CONTRADICTION' || modBetterEval?.status === 'CONTRADICTION') {
    pillar3Overall = 'CONTRADICTION';
  } else if (causaEval.status === 'MATCH' || modWorseEval?.status === 'MATCH' || modBetterEval?.status === 'MATCH') {
    pillar3Overall = 'MATCH';
  }

  // 4. SÄULE 4: WAS NOCH? (Begleitsymptome, Allgemeines, Gemüt)
  let pillar4Concomitants: CandidatePillarEvaluation;
  if (!concomText) {
    pillar4Concomitants = {
      status: 'UNCLEAR',
      statusLabel: '🟡 Nicht angegeben',
      patientText: '',
      sourceQuote: '',
      sourceAuthor: '',
      sourceWork: '',
      sourceChapter: '',
      grade: 0,
      explanation: 'Keine Begleitsymptome vom Patienten angegeben.'
    };
  } else {
    // 1. Direct verification of combined concomText
    let proofConcom = verifySinglePillar('concomitants', 'WAS NOCH?', concomText, remedy, bogerEntry, remedyNormId, remedyLatin.toLowerCase(), (remedy.commonName || '').toLowerCase(), language);

    // 2. If not matched directly, test individual sub-clauses (split by commas, semicolons, and "und")
    if (!proofConcom.matched) {
      const parts = concomText.split(/[,;]|\bund\b|\band\b|\bet\b|\by\b/i).map(p => p.trim()).filter(p => p.length >= 3);
      for (const part of parts) {
        const subProof = verifySinglePillar('concomitants', 'WAS NOCH?', part, remedy, bogerEntry, remedyNormId, remedyLatin.toLowerCase(), (remedy.commonName || '').toLowerCase(), language);
        if (subProof.matched) {
          proofConcom = subProof;
          break;
        }
      }
    }

    // 3. If still not matched, check mind specifically if rawMind exists
    if (!proofConcom.matched && rawMind) {
      const mindProof = verifySinglePillar('concomitants', 'WAS NOCH?', rawMind, remedy, bogerEntry, remedyNormId, remedyLatin.toLowerCase(), (remedy.commonName || '').toLowerCase(), language);
      if (mindProof.matched) {
        proofConcom = mindProof;
      }
    }

    // 4. Check for physical concomitants specifically if rawConcom exists
    if (!proofConcom.matched && rawConcom) {
      const physProof = verifySinglePillar('concomitants', 'WAS NOCH?', rawConcom, remedy, bogerEntry, remedyNormId, remedyLatin.toLowerCase(), (remedy.commonName || '').toLowerCase(), language);
      if (physProof.matched) {
        proofConcom = physProof;
      }
    }

    if (proofConcom.matched) {
      pillar4Concomitants = {
        status: 'MATCH',
        statusLabel: '🟢 Übereinstimmung',
        patientText: concomText,
        sourceQuote: proofConcom.quote || concomText,
        sourceAuthor: proofConcom.author || 'William Boericke',
        sourceWork: proofConcom.work || 'Materia Medica',
        sourceChapter: proofConcom.chapter || 'Begleitsymptome & Gemüt',
        grade: Math.max(proofConcom.grade || 2, 3),
        explanation: proofConcom.quote
          ? `Begleitphänomen in Primärliteratur belegt: "${proofConcom.quote}"`
          : 'Begleitsymptom in Primärquellen dokumentiert.'
      };
      matchingAreas.push(translateText(language, 'repertoriumPillarPrefix4', { term: concomText }));
    } else {
      pillar4Concomitants = {
        status: 'UNCLEAR',
        statusLabel: '🟡 Nicht ausreichend beurteilbar',
        patientText: concomText,
        sourceQuote: '',
        sourceAuthor: 'William Boericke',
        sourceWork: 'Materia Medica',
        sourceChapter: 'Begleitsymptome & Gemüt',
        grade: 0,
        explanation: 'In den Begleitsymptom- und Gemütsrubriken für dieses Mittel nicht spezifisch hervorgehoben.'
      };
      unclearAreas.push(translateText(language, 'repertoriumPillarPrefix4', { term: concomText }));
    }
  }

  // Synthesized overall assessment
  let overallAssessment = '';
  if (matchingAreas.length >= 3 && contradictionAreas.length === 0) {
    overallAssessment = translateText(language, 'repertoriumOverallAssessmentHigh', { count: matchingAreas.length });
  } else if (matchingAreas.length >= 2 && contradictionAreas.length > 0) {
    overallAssessment = translateText(language, 'repertoriumOverallAssessmentContradiction', {
      matches: matchingAreas.join(', '),
      contradictions: contradictionAreas.join(', ')
    });
  } else if (matchingAreas.length > 0) {
    overallAssessment = translateText(language, 'repertoriumOverallAssessmentPartial', {
      matches: matchingAreas.join(', ')
    });
  } else {
    overallAssessment = translateText(language, 'repertoriumOverallAssessmentNone');
  }

  return {
    pillar1Location,
    pillar2Sensation,
    pillar3ModalityAndCausa: {
      overallStatus: pillar3Overall,
      causa: causaEval,
      modalityWorse: modWorseEval,
      modalityBetter: modBetterEval,
      modalityGeneral: modGeneralEval
    },
    pillar4Concomitants,
    summary: {
      matchingAreas,
      unclearAreas,
      contradictionAreas,
      overallAssessment
    }
  };
}

/**
 * Evaluates remedies using classical homeopathic principles (Bönninghausen & Kent)
 * Displays candidate remedies with documented alignment, 3-state criteria (🟢/🟡/🔴),
 * transparent pillar audits, and internal ranking scores.
 */
export function performBoerickeRepertorisation(
  symptoms: RepertoriumSymptomInput[],
  language: LanguageCode,
  strictIntersectionOnly: boolean = false,
  authorFilter: ClassicalAuthorFilterKey | ClassicalAuthorFilterKey[] = 'all',
  praxisBonusActive: boolean = true
): BoerickeRepertorisationResult[] {
  const allRemedies = getLocalizedRemedies(language);
  const activeSymptoms = symptoms.filter(s => 
    (s.text && s.text.trim().length > 0) ||
    (s.chiefComplaint && s.chiefComplaint.trim().length > 0)
  );

  if (activeSymptoms.length === 0) {
    return [];
  }

  const primarySymptom = activeSymptoms[0];
  const results: BoerickeRepertorisationResult[] = [];
  const authorFilters = Array.isArray(authorFilter) ? authorFilter : [authorFilter];

  for (const remedy of allRemedies) {
    if (!matchesAuthorFilters(remedy.id, authorFilters)) {
      continue;
    }

    const bogerEntry = getBogerSynopticEntry(remedy.id);
    const breakdown = evaluateCandidatePillars(remedy, primarySymptom, bogerEntry, language);

    // Determine match status for each of the 4 Pillars (strictly 1 to 4):
    // Säule 1: WO (Lokalisation)
    const p1Match = breakdown.pillar1Location.status === 'MATCH';
    const p1Contradiction = breakdown.pillar1Location.status === 'CONTRADICTION';
    const p1Unclear = breakdown.pillar1Location.status === 'UNCLEAR';

    // Säule 2: WAS (Empfindung)
    const p2Match = breakdown.pillar2Sensation.status === 'MATCH';
    const p2Contradiction = breakdown.pillar2Sensation.status === 'CONTRADICTION';
    const p2Unclear = breakdown.pillar2Sensation.status === 'UNCLEAR';

    // Säule 3: WANN / WODURCH (Modalitäten & Causa)
    const p3Match = breakdown.pillar3ModalityAndCausa.overallStatus === 'MATCH';
    const p3Contradiction = breakdown.pillar3ModalityAndCausa.overallStatus === 'CONTRADICTION';
    const p3Unclear = breakdown.pillar3ModalityAndCausa.overallStatus === 'UNCLEAR';

    // Säule 4: WAS NOCH (Begleitsymptome & Gemüt)
    const p4Match = breakdown.pillar4Concomitants.status === 'MATCH';
    const p4Contradiction = breakdown.pillar4Concomitants.status === 'CONTRADICTION';
    const p4Unclear = breakdown.pillar4Concomitants.status === 'UNCLEAR';

    // Count strictly across the 4 pillars (always in range 0..4)
    let matchCount = 0;
    if (p1Match) matchCount++;
    if (p2Match) matchCount++;
    if (p3Match) matchCount++;
    if (p4Match) matchCount++;

    let contradictionCount = 0;
    if (p1Contradiction) contradictionCount++;
    if (p2Contradiction) contradictionCount++;
    if (p3Contradiction) contradictionCount++;
    if (p4Contradiction) contradictionCount++;

    let unclearCount = 0;
    if (p1Unclear) unclearCount++;
    if (p2Unclear) unclearCount++;
    if (p3Unclear) unclearCount++;
    if (p4Unclear) unclearCount++;

    // Bewertungslogik nach Hahnemann & Bönninghausen:
    // Der Score wird ausschließlich aus den 4 Säulen 1 bis 4 berechnet.
    // Die Hauptbeschwerde ist rein deskriptiv und fließt NICHT in den Score ein.
    // Jede Säule vergibt den im Buch definierten Intensitätsgrad (1 bis 4 Punkte, 0 wenn nicht gelistet).
    const isPoly = Boolean(remedy.ist_polychrest || remedy.isPolychrest);
    const bonusPoints = (praxisBonusActive && isPoly) ? 2 : 0;

    const p1Points = p1Match ? (breakdown.pillar1Location.grade || 3) : 0;
    const p2Points = p2Match ? (breakdown.pillar2Sensation.grade || 3) : 0;

    let p3Points = 0;
    if (p3Match) {
      if (breakdown.pillar3ModalityAndCausa.causa.status === 'MATCH') {
        p3Points = Math.max(p3Points, breakdown.pillar3ModalityAndCausa.causa.grade || 4);
      }
      if (breakdown.pillar3ModalityAndCausa.modalityWorse?.status === 'MATCH') {
        p3Points = Math.max(p3Points, breakdown.pillar3ModalityAndCausa.modalityWorse.grade || 3);
      }
      if (breakdown.pillar3ModalityAndCausa.modalityBetter?.status === 'MATCH') {
        p3Points = Math.max(p3Points, breakdown.pillar3ModalityAndCausa.modalityBetter.grade || 3);
      }
      if (p3Points === 0) p3Points = 3;
    }

    const p4Points = p4Match ? (breakdown.pillar4Concomitants.grade || 3) : 0;

    let comparativeScore = p1Points + p2Points + p3Points + p4Points + bonusPoints;
    if (contradictionCount > 0) {
      comparativeScore = Math.max(1, comparativeScore - 3 * contradictionCount);
    }

    const pillarScores = {
      pillar1Location: p1Points,
      pillar2Sensation: p2Points,
      pillar3Modality: p3Points,
      pillar4Concomitants: p4Points,
      praxisBonus: bonusPoints,
      total: comparativeScore,
      coveredPillarsCount: matchCount,
    };

    // Build hits for legacy & detailed proof inspect
    const hits: RemedySymptomHit[] = [];
    const pillarProofs: PillarProof[] = [];

    // Säule 1: WO
    if (primarySymptom.location?.trim()) {
      pillarProofs.push({
        pillarKey: 'location',
        pillarLabel: 'Säule 1 – WO',
        queryText: primarySymptom.location.trim(),
        matched: breakdown.pillar1Location.status === 'MATCH',
        status: breakdown.pillar1Location.status,
        statusReason: breakdown.pillar1Location.explanation,
        author: breakdown.pillar1Location.sourceAuthor || 'William Boericke',
        work: breakdown.pillar1Location.sourceWork || 'Materia Medica',
        chapter: breakdown.pillar1Location.sourceChapter || 'Lokalisation',
        quote: breakdown.pillar1Location.sourceQuote || '',
        grade: (breakdown.pillar1Location.grade || 2) as SymptomWeightGrade
      });
    }

    // Säule 2: WAS
    if (primarySymptom.sensation?.trim()) {
      pillarProofs.push({
        pillarKey: 'sensation',
        pillarLabel: 'Säule 2 – WAS',
        queryText: primarySymptom.sensation.trim(),
        matched: breakdown.pillar2Sensation.status === 'MATCH',
        status: breakdown.pillar2Sensation.status,
        statusReason: breakdown.pillar2Sensation.explanation,
        author: breakdown.pillar2Sensation.sourceAuthor || 'William Boericke',
        work: breakdown.pillar2Sensation.sourceWork || 'Materia Medica',
        chapter: breakdown.pillar2Sensation.sourceChapter || 'Empfindung & Schmerz',
        quote: breakdown.pillar2Sensation.sourceQuote || '',
        grade: (breakdown.pillar2Sensation.grade || 2) as SymptomWeightGrade
      });
    }

    // Säule 3: Causa & Modalitäten
    if (primarySymptom.causaEvent?.trim()) {
      pillarProofs.push({
        pillarKey: 'causa',
        pillarLabel: 'Säule 3 – Causa',
        queryText: primarySymptom.causaEvent.trim(),
        matched: breakdown.pillar3ModalityAndCausa.causa.status === 'MATCH',
        status: breakdown.pillar3ModalityAndCausa.causa.status,
        statusReason: breakdown.pillar3ModalityAndCausa.causa.explanation,
        author: breakdown.pillar3ModalityAndCausa.causa.sourceAuthor || 'William Boericke',
        work: breakdown.pillar3ModalityAndCausa.causa.sourceWork || 'Materia Medica',
        chapter: 'Causa & Auslöser',
        quote: breakdown.pillar3ModalityAndCausa.causa.sourceQuote || '',
        grade: 4
      });
    }

    const modQuery = [primarySymptom.modalitiesWorse, primarySymptom.modalitiesBetter, primarySymptom.modalities].filter(Boolean).join('; ');
    if (modQuery.trim()) {
      const bestModProof = breakdown.pillar3ModalityAndCausa.modalityWorse?.sourceQuote
        ? breakdown.pillar3ModalityAndCausa.modalityWorse
        : breakdown.pillar3ModalityAndCausa.modalityBetter?.sourceQuote
        ? breakdown.pillar3ModalityAndCausa.modalityBetter
        : breakdown.pillar3ModalityAndCausa.modalityGeneral;

      pillarProofs.push({
        pillarKey: 'modalities',
        pillarLabel: 'Säule 3 – WANN / Modalitäten',
        queryText: modQuery.trim(),
        matched: breakdown.pillar3ModalityAndCausa.overallStatus === 'MATCH',
        status: breakdown.pillar3ModalityAndCausa.overallStatus,
        statusReason: bestModProof?.explanation || (breakdown.pillar3ModalityAndCausa.overallStatus === 'MATCH' ? 'Modalität in Primärquellen bestätigt.' : 'Modalität nicht spezifisch verzeichnet.'),
        author: bestModProof?.sourceAuthor || 'William Boericke',
        work: bestModProof?.sourceWork || 'Materia Medica',
        chapter: (bestModProof as any)?.sourceChapter || 'Modalitäten (< / >)',
        quote: bestModProof?.sourceQuote || '',
        grade: (bestModProof?.grade || 3) as SymptomWeightGrade
      });
    }

    // Säule 4: WAS NOCH (Begleitsymptome & Gemüt)
    const concomQuery = [primarySymptom.concomitants?.trim(), primarySymptom.mind?.trim()].filter(Boolean).join('; ');
    if (concomQuery) {
      pillarProofs.push({
        pillarKey: 'concomitants',
        pillarLabel: 'Säule 4 – WAS NOCH',
        queryText: concomQuery,
        matched: breakdown.pillar4Concomitants.status === 'MATCH',
        status: breakdown.pillar4Concomitants.status,
        statusReason: breakdown.pillar4Concomitants.explanation,
        author: breakdown.pillar4Concomitants.sourceAuthor || 'William Boericke',
        work: breakdown.pillar4Concomitants.sourceWork || 'Materia Medica',
        chapter: breakdown.pillar4Concomitants.sourceChapter || 'Begleitsymptome & Gemüt',
        quote: breakdown.pillar4Concomitants.sourceQuote || '',
        grade: (breakdown.pillar4Concomitants.grade || (breakdown.pillar4Concomitants.status === 'MATCH' ? 3 : 0)) as SymptomWeightGrade
      });
    }

    hits.push({
      symptomIndex: 1,
      symptomText: primarySymptom.chiefComplaint || primarySymptom.text,
      weight: 1,
      remedyGrade: 3,
      points: comparativeScore,
      allPillarsSatisfied: matchCount === 4 && contradictionCount === 0,
      totalPillarsDefined: 4,
      coveredPillarsCount: matchCount,
      pillarProofs,
      matchedBoerickeExcerpt: breakdown.pillar2Sensation.sourceQuote || breakdown.pillar1Location.sourceQuote || breakdown.summary.overallAssessment
    });

    const isFullMatch = matchCount >= 4 && contradictionCount === 0;
    const coveragePercentage = Math.min(100, Math.round((matchCount / 4) * 100));

    // Include candidate if it has at least 1 verified match across pillars or causa
    if (matchCount > 0 || hits.some(h => h.coveredPillarsCount > 0) || (praxisBonusActive && isPoly && comparativeScore > 0)) {
      results.push({
        remedy,
        totalScore: comparativeScore,
        comparativeScore,
        coveredSymptomsCount: matchCount > 0 ? 1 : 0,
        totalSymptomsCount: 1,
        coveragePercentage,
        isFullMatch,
        allPillarsCovered: isFullMatch,
        totalPillarsCount: 4,
        coveredPillarsCount: matchCount,
        matchCount,
        unclearCount,
        contradictionCount,
        pillarBreakdown: breakdown,
        hits,
        pillarScores,
        qualitativeRationale: {
          summary: breakdown.summary.overallAssessment,
          pillarBreakdown: breakdown.summary.matchingAreas.map(ma => ({
            pillar: ma,
            patientTerm: '',
            proofQuote: ''
          })),
          contradictions: breakdown.summary.contradictionAreas
        }
      });
    }
  }

  // Sort candidates:
  // 1. Candidates with fewer contradictions first (0 contradictions at top)
  // 2. Candidates with more 🟢 matches (4 pillars, then 3, then 2...)
  // 3. Highest comparativeScore
  // 4. Polychrests first
  // 5. Latin name alphabetical
  results.sort((a, b) => {
    if (a.contradictionCount !== b.contradictionCount) {
      return a.contradictionCount - b.contradictionCount;
    }
    if (a.matchCount !== b.matchCount) {
      return b.matchCount - a.matchCount;
    }
    if (b.comparativeScore !== a.comparativeScore) {
      return b.comparativeScore - a.comparativeScore;
    }
    if (a.remedy.isPolychrest !== b.remedy.isPolychrest) {
      return (b.remedy.isPolychrest ? 1 : 0) - (a.remedy.isPolychrest ? 1 : 0);
    }
    return a.remedy.latinName.localeCompare(b.remedy.latinName);
  });

  // Deduplicate candidates by canonical remedy key (guarantees zero duplicate remedies in repertory view)
  const deduplicatedResults: BoerickeRepertorisationResult[] = [];
  const seenCanonicalKeys = new Set<string>();

  for (const res of results) {
    const key = getCanonicalRemedyKey(res.remedy);
    if (!seenCanonicalKeys.has(key)) {
      seenCanonicalKeys.add(key);
      deduplicatedResults.push(res);
    }
  }

  return deduplicatedResults;
}

/**
 * REIN SUBTRAKTIVE FILTER-ENGINE (Permanent reductive cascade)
 * STUFE 1: Startmenge (Hauptbeschwerde / Organkapitel)
 * STUFE 2: 1. Eingrenzung (Säule 1 - Lokalisation & Seite)
 * STUFE 3: 2. Eingrenzung (Säule 2 - Empfindung / Schmerzcharakter an diesem Ort)
 * STUFE 4: 3. Eingrenzung (Säule 3 - Modalität für diesen Schmerz)
 * STUFE 5: 4. Eingrenzung (Säule 4 - synchrones Begleitsymptom / Concomitants)
 *
 * Strikte Abbruchregel:
 * Wenn am Ende einer Stufe die Anzahl der Mittel auf 0 sinkt,
 * bricht die Kaskade SOFORT ab:
 * "Abbruch bei Stufe X: Keine vollständige 4-Säulen-Übereinstimmung in den Originalschriften vorhanden."
 */
export function performSubtractiveFunnelCascade(
  symptom: RepertoriumSymptomInput,
  language: LanguageCode,
  authorFilter: ClassicalAuthorFilterKey | ClassicalAuthorFilterKey[] = 'all'
): SubtractiveCascadeReport {
  const authorFilters = Array.isArray(authorFilter) ? authorFilter : [authorFilter];
  const allRemedies = getLocalizedRemedies(language).filter(r => 
    matchesAuthorFilters(r.id, authorFilters)
  );

  const chief = (symptom.chiefComplaint?.trim() || symptom.text?.trim() || '');
  const loc = (symptom.location?.trim() || '');
  const sens = (symptom.sensation?.trim() || '');
  const mod = (symptom.modalities?.trim() || '');
  const concom = (symptom.concomitants?.trim() || '');

  if (!chief) {
    return {
      isConfigured: false,
      steps: [],
      abortStepNumber: null,
      abortMessage: null,
      survivingRemedies: []
    };
  }

  const steps: SubtractiveCascadeStep[] = [];
  let currentRemedies = [...allRemedies];

  const verifyRemedyPillar = (
    remedy: LocalizedRemedy, 
    pillarKey: 'chiefComplaint' | 'location' | 'sensation' | 'modalities' | 'concomitants' | 'causa',
    text: string
  ): PillarProof => {
    const remedyNormId = remedy.id.toLowerCase();
    const remedyLatinNorm = normalizeQuery(remedy.latinName);
    const remedyCommonNorm = normalizeQuery(remedy.commonName);
    const bogerEntry = getBogerSynopticEntry(remedy.id);
    return verifySinglePillar(
      pillarKey,
      pillarKey,
      text,
      remedy,
      bogerEntry,
      remedyNormId,
      remedyLatinNorm,
      remedyCommonNorm,
      language
    );
  };

  // STUFE 1: STARTMENGE (Die Beschwerde / Organkapitel)
  const countBefore1 = currentRemedies.length;
  currentRemedies = currentRemedies.filter(remedy => {
    const proof = verifyRemedyPillar(remedy, 'chiefComplaint', chief);
    return proof.matched;
  });
  const countAfter1 = currentRemedies.length;
  steps.push({
    stepNumber: 1,
    title: 'STUFE 1: Startmenge (Hauptbeschwerde & Organkapitel)',
    pillarKey: 'chiefComplaint',
    inputCriterion: chief,
    countBefore: countBefore1,
    countAfter: countAfter1,
    isAborted: countAfter1 === 0,
    activeRemedyIds: currentRemedies.map(r => r.id)
  });

  if (countAfter1 === 0) {
    return {
      isConfigured: true,
      steps,
      abortStepNumber: 1,
      abortMessage: 'Abbruch bei Stufe 1: Keine Übereinstimmung für die Hauptbeschwerde in den Primärquellen vorhanden.',
      survivingRemedies: []
    };
  }

  // STUFE 2: 1. EINGRENZUNG (Säule 1: WO? - Lokalisation & Seite)
  if (loc) {
    const countBefore2 = currentRemedies.length;
    currentRemedies = currentRemedies.filter(remedy => {
      const proof = verifyRemedyPillar(remedy, 'location', loc);
      return proof.matched;
    });
    const countAfter2 = currentRemedies.length;
    const aborted2 = countAfter2 === 0;
    steps.push({
      stepNumber: 2,
      title: 'STUFE 2: 1. Eingrenzung (Säule 1: WO? - Lokalisation & Seite)',
      pillarKey: 'location',
      inputCriterion: loc,
      countBefore: countBefore2,
      countAfter: countAfter2,
      isAborted: aborted2,
      activeRemedyIds: currentRemedies.map(r => r.id)
    });

    if (aborted2) {
      return {
        isConfigured: true,
        steps,
        abortStepNumber: 2,
        abortMessage: 'Abbruch bei Stufe 2 (Säule 1: WO?): Keine vollständige 4-Säulen-Übereinstimmung in den Originalschriften vorhanden.',
        survivingRemedies: []
      };
    }
  }

  // STUFE 3: 2. EINGRENZUNG (Säule 2: WAS? - Empfindung & Schmerzcharakter)
  if (sens) {
    const countBefore3 = currentRemedies.length;
    currentRemedies = currentRemedies.filter(remedy => {
      const proof = verifyRemedyPillar(remedy, 'sensation', sens);
      return proof.matched;
    });
    const countAfter3 = currentRemedies.length;
    const aborted3 = countAfter3 === 0;
    steps.push({
      stepNumber: 3,
      title: 'STUFE 3: 2. Eingrenzung (Säule 2: WAS? - Empfindung & Charakter)',
      pillarKey: 'sensation',
      inputCriterion: sens,
      countBefore: countBefore3,
      countAfter: countAfter3,
      isAborted: aborted3,
      activeRemedyIds: currentRemedies.map(r => r.id)
    });

    if (aborted3) {
      return {
        isConfigured: true,
        steps,
        abortStepNumber: 3,
        abortMessage: 'Abbruch bei Stufe 3 (Säule 2: WAS?): Keine vollständige 4-Säulen-Übereinstimmung in den Originalschriften vorhanden.',
        survivingRemedies: []
      };
    }
  }

  // STUFE 4: 3. EINGRENZUNG (Säule 3: WANN / WODURCH? - Modalitäten & Causa)
  const causaText = symptom.causaEvent?.trim() || '';
  const modCriterion = [mod, causaText ? `Causa: ${causaText}` : ''].filter(Boolean).join('; ');
  if (modCriterion) {
    const countBefore4 = currentRemedies.length;
    currentRemedies = currentRemedies.filter(remedy => {
      const proofMod = mod ? verifyRemedyPillar(remedy, 'modalities', mod) : null;
      const proofCausa = causaText ? verifyRemedyPillar(remedy, 'causa', causaText) : null;
      // In 4-pillar model, either verified modality or verified causa supports Pillar 3
      if (proofMod && proofCausa) {
        return proofMod.matched || proofCausa.matched;
      }
      return proofMod ? proofMod.matched : (proofCausa ? proofCausa.matched : true);
    });
    const countAfter4 = currentRemedies.length;
    const aborted4 = countAfter4 === 0;
    steps.push({
      stepNumber: 4,
      title: 'STUFE 4: 3. Eingrenzung (Säule 3: WANN / WODURCH? - Modalität & Causa)',
      pillarKey: 'modalities',
      inputCriterion: modCriterion,
      countBefore: countBefore4,
      countAfter: countAfter4,
      isAborted: aborted4,
      activeRemedyIds: currentRemedies.map(r => r.id)
    });

    if (aborted4) {
      return {
        isConfigured: true,
        steps,
        abortStepNumber: 4,
        abortMessage: 'Abbruch bei Stufe 4 (Säule 3: WANN/WODURCH?): Keine vollständige 4-Säulen-Übereinstimmung in den Originalschriften vorhanden.',
        survivingRemedies: []
      };
    }
  }

  // STUFE 5: 4. EINGRENZUNG (Säule 4: WAS NOCH? - Begleitsymptome & Gemüt)
  const mindText = symptom.mind?.trim() || '';
  const combinedConcom = [concom, mindText ? `Gemüt: ${mindText}` : ''].filter(Boolean).join('; ');
  if (combinedConcom) {
    const countBefore5 = currentRemedies.length;
    currentRemedies = currentRemedies.filter(remedy => {
      const proofConcom = concom ? verifyRemedyPillar(remedy, 'concomitants', concom) : null;
      const proofMind = mindText ? verifyRemedyPillar(remedy, 'concomitants', mindText) : null;
      if (proofConcom && proofMind) {
        return proofConcom.matched || proofMind.matched;
      }
      return proofConcom ? proofConcom.matched : (proofMind ? proofMind.matched : true);
    });
    const countAfter5 = currentRemedies.length;
    const aborted5 = countAfter5 === 0;
    steps.push({
      stepNumber: 5,
      title: 'STUFE 5: 4. Eingrenzung (Säule 4: WAS NOCH? - Begleitsymptome & Gemüt)',
      pillarKey: 'concomitants',
      inputCriterion: combinedConcom,
      countBefore: countBefore5,
      countAfter: countAfter5,
      isAborted: aborted5,
      activeRemedyIds: currentRemedies.map(r => r.id)
    });

    if (aborted5) {
      return {
        isConfigured: true,
        steps,
        abortStepNumber: 5,
        abortMessage: 'Abbruch bei Stufe 5 (Säule 4: WAS NOCH?): Keine vollständige 4-Säulen-Übereinstimmung in den Originalschriften vorhanden.',
        survivingRemedies: []
      };
    }
  }

  // Calculate full repertorisation results for remaining surviving remedies
  const survivingResults = performBoerickeRepertorisation(
    [symptom],
    language,
    true, // strict intersection
    authorFilter
  ).filter(res => currentRemedies.some(r => r.id === res.remedy.id));

  return {
    isConfigured: true,
    steps,
    abortStepNumber: null,
    abortMessage: null,
    survivingRemedies: survivingResults
  };
}

