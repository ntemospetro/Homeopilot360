import { LanguageCode } from '../types';
import { QUESTION_META_BY_DOMAIN } from './acuteClarificationTranslations';
import { OPTION_LABELS_I18N } from './acuteClarificationOptionsI18n';

export interface AcuteClarificationOption {
  id: string;
  label: string;
  remedyHint?: string; // e.g. 'Lachesis / Spigelia'
  remedyIds?: string[]; // Direct mapping to localized remedy IDs
  relevanceKeywords: string[]; // Added to matching text
}

export interface AcuteClarificationQuestion {
  id: string;
  category: string;
  title: string;
  description: string;
  type: 'single' | 'scale';
  options?: AcuteClarificationOption[];
  scaleMin?: number;
  scaleMax?: number; // 4 (strictly Hahnemannian 1-4 scale)
}

export interface AcuteAnswers {
  onset?: string;
  modality?: string;
  sensationMind?: string;
  intensity?: number; // 1 to 4
  [key: string]: any;
}

export type AcuteComplaintDomain =
  | 'pain_laterality'
  | 'gastrointestinal'
  | 'respiratory'
  | 'headache'
  | 'injury'
  | 'fever'
  | 'skin'
  | 'mind_shock'
  | 'general';

/**
 * Dynamically detects the acute complaint domain based on the user's input text in all 7 languages.
 */
export function detectComplaintDomain(inputText: string): AcuteComplaintDomain {
  const norm = (inputText || '').toLowerCase();

  // 1. Gastrointestinal / Abdomen / Stomach / Nausea / Colic / Diarrhea
  // Check FIRST to avoid collision with words like 'durchfall' containing 'fall'
  if (
    norm.includes('durchfall') || norm.includes('bauch') || norm.includes('magen') || norm.includes('darm') ||
    norm.includes('übel') || norm.includes('uebel') || norm.includes('erbrech') || norm.includes('blähung') ||
    norm.includes('kolik') || norm.includes('verstopfung') || norm.includes('stomach') || norm.includes('belly') ||
    norm.includes('abdomen') || norm.includes('nausea') || norm.includes('vomit') || norm.includes('diarrhea') ||
    norm.includes('bloat') || norm.includes('estómago') || norm.includes('estomago') || norm.includes('vientre') ||
    norm.includes('náusea') || norm.includes('vómit') || norm.includes('diarrea') || norm.includes('estomac') ||
    norm.includes('ventre') || norm.includes('nausée') || norm.includes('vomir') || norm.includes('diarrhée') ||
    norm.includes('stomaco') || norm.includes('pancia') || norm.includes('vomito') || norm.includes('κοιλιά') ||
    norm.includes('στομάχι') || norm.includes('ναυτία') || norm.includes('εμετός') || norm.includes('διάρροια') ||
    norm.includes('живот') || norm.includes('желудок') || norm.includes('тошнот') || norm.includes('рвот') ||
    norm.includes('понос')
  ) {
    return 'gastrointestinal';
  }

  // 2. Injury / Trauma / Sprain / Bruise (Using precise trauma terms so 'durchfall' is not caught)
  const hasEnglishFall = /\b(fall|falls|fell|falling)\b/i.test(norm);
  if (
    hasEnglishFall ||
    norm.includes('verletz') || norm.includes('sturz') || norm.includes('stürzte') || norm.includes('gestürzt') ||
    norm.includes('trauma') || norm.includes('prell') || norm.includes('wunde') || norm.includes('zerr') ||
    norm.includes('verstauch') || norm.includes('unfall') || norm.includes('umgeknick') || norm.includes('ausrutsch') ||
    norm.includes('gebrochen') || norm.includes('fraktur') || norm.includes('injur') || norm.includes('sprain') ||
    norm.includes('bruis') || norm.includes('wound') || norm.includes('lesión') || norm.includes('lesion') ||
    norm.includes('caída') || norm.includes('caida') || norm.includes('esguince') || norm.includes('bless') ||
    norm.includes('chute') || norm.includes('entorse') || norm.includes('ferita') || norm.includes('caduta') ||
    norm.includes('distorsione') || norm.includes('τραύμα') || norm.includes('τραυμα') || norm.includes('διάστρεμμα') ||
    norm.includes('травм') || norm.includes('ушиб') || norm.includes('растяжен') || norm.includes('вывих') ||
    norm.includes('stoß') || norm.includes('stoss') || norm.includes('gestoß') || norm.includes('gestoss') ||
    norm.includes('aufprall') || norm.includes('erschütter') || norm.includes('erschuetter') || norm.includes('schlag') ||
    norm.includes('bump') || norm.includes('hit') || norm.includes('concussion') || norm.includes('golpe') ||
    norm.includes('choc') || norm.includes('colpo') || norm.includes('χτύπημα') || norm.includes('удар')
  ) {
    return 'injury';
  }

  // 3. Skin / Rash / Insect Bite / Burn / Blister
  if (
    norm.includes('haut') || norm.includes('ausschlag') || norm.includes('juck') || norm.includes('stich') ||
    norm.includes('insekten') || norm.includes('wespen') || norm.includes('bienen') || norm.includes('brand') ||
    norm.includes('verbrenn') || norm.includes('bläschen') || norm.includes('blaeschen') || norm.includes('skin') ||
    norm.includes('rash') || norm.includes('itch') || norm.includes('sting') || norm.includes('insect') ||
    norm.includes('burn') || norm.includes('blister') || norm.includes('piel') || norm.includes('erupción') ||
    norm.includes('erupcion') || norm.includes('picadura') || norm.includes('quemadura') || norm.includes('peau') ||
    norm.includes('éruption') || norm.includes('eruption') || norm.includes('piqûre') || norm.includes('piqure') ||
    norm.includes('brûlure') || norm.includes('brulure') || norm.includes('pelle') || norm.includes('prurito') ||
    norm.includes('puntura') || norm.includes('ustione') || norm.includes('δέρμα') || norm.includes('δερμα') ||
    norm.includes('εξάνθημα') || norm.includes('εξανθημα') || norm.includes('φαγούρα') || norm.includes('τσίμπημα') ||
    norm.includes('έγκαυμα') || norm.includes('кож') || norm.includes('сыпь') || norm.includes('зуд') ||
    norm.includes('укус') || norm.includes('ожог')
  ) {
    return 'skin';
  }

  // 4. Headache / Migraine / Temples
  if (
    norm.includes('kopf') || norm.includes('migrän') || norm.includes('migraen') || norm.includes('stirn') ||
    norm.includes('schläf') || norm.includes('schlaef') || norm.includes('hinterkopf') || norm.includes('head') ||
    norm.includes('headache') || norm.includes('migraine') || norm.includes('temple') || norm.includes('cabeza') ||
    norm.includes('jaqueca') || norm.includes('migraña') || norm.includes('tête') || norm.includes('tete') ||
    norm.includes('céphalée') || norm.includes('cephalee') || norm.includes('testa') || norm.includes('emicrania') ||
    norm.includes('κεφάλ') || norm.includes('κεφαλ') || norm.includes('ημικραν') || norm.includes('голов') ||
    norm.includes('мигрен')
  ) {
    return 'headache';
  }

  // 5. Respiratory / Cough / Throat / Hoarse
  if (
    norm.includes('husten') || norm.includes('hals') || norm.includes('heiser') || norm.includes('bronch') ||
    norm.includes('schnupf') || norm.includes('schluck') || norm.includes('kehlkopf') || norm.includes('cough') ||
    norm.includes('throat') || norm.includes('hoarse') || norm.includes('swallow') || norm.includes('breath') ||
    norm.includes('tos') || norm.includes('garganta') || norm.includes('ronquera') || norm.includes('tragar') ||
    norm.includes('toux') || norm.includes('gorge') || norm.includes('enroué') || norm.includes('enroue') ||
    norm.includes('avaler') || norm.includes('tosse') || norm.includes('gola') || norm.includes('raucedine') ||
    norm.includes('βήχ') || norm.includes('βηχ') || norm.includes('λαιμ') || norm.includes('βραχν') ||
    norm.includes('κατάποση') || norm.includes('καταποση') || norm.includes('кашел') || norm.includes('кашл') ||
    norm.includes('горл') || norm.includes('охрип') || norm.includes('глота')
  ) {
    return 'respiratory';
  }

  // 6. Fever / Chills / Grippe
  if (
    norm.includes('fieber') || norm.includes('schüttelfrost') || norm.includes('schuettelfrost') || norm.includes('gripp') ||
    norm.includes('fever') || norm.includes('chills') || norm.includes('flu') || norm.includes('fiebre') ||
    norm.includes('escalofrío') || norm.includes('escalofrio') || norm.includes('gripe') || norm.includes('fièvre') ||
    norm.includes('fievre') || norm.includes('frissons') || norm.includes('febbre') || norm.includes('brividi') ||
    norm.includes('influenza') || norm.includes('πυρετ') || norm.includes('ρίγος') || norm.includes('ριγος') ||
    norm.includes('γρίπ') || norm.includes('лихорад') || norm.includes('жар') || norm.includes('озноб') ||
    norm.includes('грипп')
  ) {
    return 'fever';
  }

  // 7. Mind / Emotional Shock / Panic / Fear
  if (
    norm.includes('schreck') || norm.includes('schock') || norm.includes('panik') || norm.includes('todesangst') ||
    norm.includes('trauer') || norm.includes('kummer') || norm.includes('shock') || norm.includes('fright') ||
    norm.includes('panic') || norm.includes('grief') || norm.includes('susto') || norm.includes('pánico') ||
    norm.includes('duelo') || norm.includes('frayeur') || norm.includes('panique') || norm.includes('chagrin') ||
    norm.includes('spavento') || norm.includes('lutto') || norm.includes('τρόμος') || norm.includes('πανικός') ||
    norm.includes('πένθος') || norm.includes('испуг') || norm.includes('паник') || norm.includes('горе')
  ) {
    return 'mind_shock';
  }

  // 8. Pain & Laterality (Links / Rechts / Schmerzen / Wehtun / Stechen / Brennen / Ziehen / Krämpfe)
  // This explicitly catches complaints like "ich hatte plötzlich Schmerzen am linken" or localized pains!
  if (
    norm.includes('schmerz') || norm.includes('weh') || norm.includes('stich') || norm.includes('stechen') ||
    norm.includes('brenn') || norm.includes('zieh') || norm.includes('krampf') ||
    norm.includes('pochen') || norm.includes('links') || norm.includes('rechts') || norm.includes('einseitig') ||
    norm.includes('pain') || norm.includes('hurt') || norm.includes('ache') || norm.includes('left') ||
    norm.includes('right') || norm.includes('dolor') || norm.includes('duele') || norm.includes('izquierd') ||
    norm.includes('derech') || norm.includes('douleur') || norm.includes('mal') || norm.includes('gauche') ||
    norm.includes('droit') || norm.includes('dolore') || norm.includes('sinistr') || norm.includes('destr') ||
    norm.includes('πόνος') || norm.includes('πονο') || norm.includes('αριστερ') || norm.includes('δεξι') ||
    norm.includes('боль') || norm.includes('болит') || norm.includes('лев') || norm.includes('прав')
  ) {
    return 'pain_laterality';
  }

  return 'general';
}

export const OPTION_REMEDY_MAP: Record<string, string[]> = {
  // Fever
  fev_sudden_dry: ['aconitum-napellus', 'belladonna'],
  fev_hot_sweat_red: ['belladonna', 'glonoinum'],
  fev_slow_drowsy: ['gelsemium-sempervirens', 'ferrum-phosphoricum'],
  fev_bone_ache: ['eupatorium-perfoliatum'],
  fev_huge_thirst: ['bryonia-alba', 'aconitum-napellus'],
  fev_sips_restless: ['arsenicum-album'],
  fev_thirstless: ['pulsatilla-pratensis', 'apis-mellifica', 'gelsemium-sempervirens'],
  fev_cold_drinks_crave: ['phosphorus', 'belladonna'],
  fev_fear_agitation: ['aconitum-napellus', 'arsenicum-album'],
  fev_delirium_startle: ['belladonna', 'stramonium'],
  fev_chill_uncover: ['nux-vomica', 'arsenicum-album'],
  fev_quiet_sleepy: ['gelsemium-sempervirens', 'bryonia-alba'],

  // Headache
  hd_throbbing_hot: ['belladonna', 'glonoinum'],
  hd_splitting_motion: ['bryonia-alba'],
  hd_dull_heavy_occiput: ['gelsemium-sempervirens'],
  hd_one_sided_sharp: ['spigelia-anthelmia', 'iris-versicolor'],
  hd_jar_light_noise: ['belladonna'],
  hd_eye_motion: ['bryonia-alba'],
  hd_stress_morning: ['nux-vomica'],
  hd_sun_heat: ['glonoinum', 'belladonna'],
  hd_firm_bandage: ['silicea', 'argentum-nitricum'],
  hd_cold_compress: ['belladonna', 'apis-mellifica'],
  hd_warm_wrap: ['silicea', 'arsenicum-album'],
  hd_fresh_air_walk: ['pulsatilla-pratensis'],

  // Injury
  inj_blunt_hematoma: ['arnica-montana', 'bellis-perennis'],
  inj_blunt: ['arnica-montana', 'bellis-perennis'],
  inj_sprain_ligaments: ['rhus-toxicodendron', 'ruta-graveolens'],
  inj_sprain: ['rhus-toxicodendron', 'ruta-graveolens'],
  inj_nerve_crush: ['hypericum-perforatum'],
  inj_nerve: ['hypericum-perforatum'],
  inj_puncture_cut: ['ledum-palustre', 'staphisagria'],
  inj_cut: ['ledum-palustre', 'staphisagria'],
  inj_motion_better: ['rhus-toxicodendron'],
  inj_motion_worse: ['bryonia-alba', 'arnica-montana'],
  inj_cold_better: ['ledum-palustre', 'arnica-montana'],
  inj_warmth_better: ['rhus-toxicodendron', 'ruta-graveolens'],

  // Respiratory
  resp_barking_croup: ['aconitum-napellus', 'spongia-tosta', 'hepar-sulfuris'],
  resp_spasmodic_fit: ['drosera-rotundifolia', 'ipecacuanha'],
  resp_painful_hold: ['bryonia-alba'],
  resp_rattling_mucus: ['antimonium-tartaricum', 'ipecacuanha'],
  resp_empty_swallow: ['lachesis-muta'],
  resp_splinter_throat: ['hepar-sulfuris', 'acidum-nitricum'],
  resp_hoarseness: ['phosphorus', 'causticum'],
  resp_restless_anxious: ['aconitum-napellus', 'arsenicum-album'],

  // Gastrointestinal
  gi_colic_cramp: ['colocynthis', 'magnesia-phosphorica'],
  gi_burning_vomit: ['arsenicum-album'],
  gi_bloat_gas: ['carbo-vegetabilis', 'lycopodium-clavatum'],
  gi_constant_nausea: ['ipecacuanha'],
  gi_food_poison: ['arsenicum-album', 'nux-vomica'],
  gi_cold_drinks: ['arsenicum-album', 'pulsatilla-pratensis'],
  gi_stress_overindulge: ['nux-vomica'],
  gi_doubling_pressure: ['colocynthis', 'magnesia-phosphorica'],
  gi_warmth_drinks: ['arsenicum-album', 'magnesia-phosphorica'],
  gi_cold_air_fan: ['carbo-vegetabilis', 'pulsatilla-pratensis'],
  gi_irritable_anger: ['nux-vomica', 'chamomilla'],

  // Skin
  sk_bee_edema: ['apis-mellifica'],
  sk_burn_blister: ['cantharis-vesicatoria', 'urtica-urens'],
  sk_vesicles_itch: ['rhus-toxicodendron'],
  sk_pus_sensitive: ['hepar-sulfuris', 'silicea'],
  sk_cold_ice_better: ['apis-mellifica', 'ledum-palustre'],
  sk_scalding_hot_better: ['rhus-toxicodendron', 'arsenicum-album'],
  sk_water_worse: ['sulphur'],
  sk_open_air_better: ['pulsatilla-pratensis', 'sulphur'],
  sk_burning_needles: ['apis-mellifica'],
  sk_unbearable_scratch: ['sulphur'],
  sk_hypersensitive_rage: ['chamomilla', 'hepar-sulfuris'],
  sk_anxious_burning: ['arsenicum-album'],

  // Pain / Laterality
  pn_stabbing: ['bryonia-alba', 'acidum-nitricum', 'apis-mellifica'],
  pn_burning: ['arsenicum-album', 'apis-mellifica', 'cantharis-vesicatoria'],
  pn_cramping: ['colocynthis', 'magnesia-phosphorica'],
  pn_throbbing: ['belladonna', 'glonoinum'],
  pn_tearing: ['rhus-toxicodendron', 'pulsatilla-pratensis'],
  lat_left: ['lachesis-muta', 'spigelia-anthelmia'],
  lat_right: ['lycopodium-clavatum', 'belladonna', 'bryonia-alba'],
  lat_wandering: ['pulsatilla-pratensis'],
  lat_radiating: ['colocynthis', 'chamomilla', 'hypericum-perforatum'],
  mod_press_bend: ['colocynthis', 'bryonia-alba'],
  mod_warmth_wrap: ['arsenicum-album', 'rhus-toxicodendron', 'magnesia-phosphorica'],
  mod_cold_ice: ['apis-mellifica', 'ledum-palustre', 'pulsatilla-pratensis'],
  mod_absolute_rest: ['bryonia-alba'],
  mod_continued_motion: ['rhus-toxicodendron'],
  mod_hard_pressure: ['colocynthis', 'bryonia-alba'],
  mod_cold_air: ['apis-mellifica', 'pulsatilla-pratensis'],
  mod_rest_still: ['bryonia-alba'],
  mod_motion_restless: ['rhus-toxicodendron'],

  // General
  gen_sudden: ['aconitum-napellus', 'belladonna'],
  gen_cold_wet: ['rhus-toxicodendron', 'dulcamara'],
  gen_stress: ['chamomilla', 'nux-vomica', 'colocynthis'],
  gen_slow: ['bryonia-alba', 'gelsemium-sempervirens'],
  sen_fear_restless: ['aconitum-napellus', 'arsenicum-album'],
  sen_angry_irritable: ['chamomilla', 'nux-vomica', 'bryonia-alba'],
  sen_weepy_mild: ['pulsatilla-pratensis'],
  sen_dull_heavy: ['gelsemium-sempervirens'],
  sen_burning_stinging: ['apis-mellifica', 'cantharis-vesicatoria'],

  // Mind Shock
  shk_panic_fear: ['aconitum-napellus', 'arsenicum-album'],
  shk_trauma_denial: ['arnica-montana'],
  shk_grief_sob: ['ignatia-amara'],
  shk_trembling_paralyzed: ['gelsemium-sempervirens', 'opium']
};

/**
 * Base domain questions with German default texts and domain-specific options.
 */
function getBaseDomainQuestions(domain: AcuteComplaintDomain): AcuteClarificationQuestion[] {
  if (domain === 'pain_laterality') {
      return [
        {
          id: 'onset',
          category: 'Schmerzqualität & Empfindung',
          title: '1. Welcher Schmerzcharakter beschreibt die Beschwerde am besten?',
          description: 'Die genaue Empfindung ist das führende Symptom zur Auswahl des Akutmittels.',
          type: 'single',
          options: [
            { id: 'pn_stabbing', label: 'Stechend wie Nadeln, Glassplitter oder Messer (schlimmer bei Bewegung)', remedyHint: 'Bryonia / Nitricum acidum / Apis', relevanceKeywords: ['stechender Schmerz', 'Splitter', 'Bryonia', 'Nitricum acidum'] },
            { id: 'pn_burning', label: 'Brennend wie heißes Feuer oder glühende Kohlen (oft Linderung durch Wärme)', remedyHint: 'Arsenicum album / Apis / Cantharis', relevanceKeywords: ['brennender Schmerz', 'wie Feuer', 'Arsenicum album', 'Apis'] },
            { id: 'pn_cramping', label: 'Krampfartig, kolikartig, zusammenschnürend (Linderung durch Zusammenkrümmen)', remedyHint: 'Colocynthis / Magnesium phosphoricum', relevanceKeywords: ['Krämpfe', 'Zusammenkrümmen', 'Colocynthis', 'Magnesium phosphoricum'] },
            { id: 'pn_throbbing', label: 'Pochend, hämmernd, pulsierend mit Hitzegefühl und rotem Kopf', remedyHint: 'Belladonna / Glonoinum', relevanceKeywords: ['pochender Schmerz', 'pulsierend', 'Belladonna', 'Glonoinum'] },
            { id: 'pn_tearing', label: 'Ziehend, reißend, wandert von Stelle zu Stelle (Unruhe)', remedyHint: 'Rhus toxicodendron / Pulsatilla', relevanceKeywords: ['ziehender Schmerz', 'wandert', 'Rhus toxicodendron', 'Pulsatilla'] }
          ]
        },
        {
          id: 'modality',
          category: 'Seitigkeit & Ausstrahlung',
          title: '2. Auf welcher Körperseite liegt der Schmerz bzw. wie strahlt er aus?',
          description: 'Die Seitigkeit (Links vs. Rechts) ist ein zentrales Kriterium der homöopathischen Differenzierung.',
          type: 'single',
          options: [
            { id: 'lat_left', label: 'Streng linksseitig oder zieht von links nach rechts', remedyHint: 'Lachesis / Spigelia / Thuja', relevanceKeywords: ['linksseitig', 'von links nach rechts', 'Lachesis', 'Spigelia'] },
            { id: 'lat_right', label: 'Streng rechtsseitig oder zieht von rechts nach links', remedyHint: 'Lycopodium / Belladonna / Bryonia', relevanceKeywords: ['rechtsseitig', 'von rechts nach links', 'Lycopodium', 'Belladonna'] },
            { id: 'lat_wandering', label: 'Wechselt ständig die Seite oder wandert zwischen Gelenken', remedyHint: 'Pulsatilla / Lac caninum', relevanceKeywords: ['Seitenwechsel', 'wandernd', 'Pulsatilla', 'Lac caninum'] },
            { id: 'lat_radiating', label: 'Lokaler Schmerzherd mit schießender Ausstrahlung in die Umgebung', remedyHint: 'Colocynthis / Chamomilla / Hypericum', relevanceKeywords: ['ausstrahlender Schmerz', 'Colocynthis', 'Chamomilla'] }
          ]
        },
        {
          id: 'sensationMind',
          category: 'Gemütszustand & Schmerzreaktion',
          title: '3. Wie ist der Gemütszustand und die seelische Reaktion auf den Schmerz?',
          description: 'Die Gemütssymptome im Akutzustand sind nach Hahnemann der entscheidende Wegweiser zum Simile.',
          type: 'single',
          options: [
            { id: 'sen_fear_restless', label: 'Große ängstliche Unruhe, Angst, Herzklopfen, Verzweiflung', remedyHint: 'Aconitum / Arsenicum album', relevanceKeywords: ['ängstliche Unruhe', 'Todesangst', 'Aconitum', 'Arsenicum'] },
            { id: 'sen_angry_irritable', label: 'Zornig, extrem gereizt, ungeduldig, schlägt um sich vor Schmerz', remedyHint: 'Chamomilla / Nux vomica / Colocynthis', relevanceKeywords: ['zornig', 'gereizt', 'Chamomilla', 'Nux vomica'] },
            { id: 'sen_weepy_mild', label: 'Weinerlich, trostbedürftig, sanftmütig, sucht Beistand', remedyHint: 'Pulsatilla', relevanceKeywords: ['weinerlich', 'trostbedürftig', 'Pulsatilla'] },
            { id: 'sen_dull_heavy', label: 'Benommen, apathisch, wie betäubt, will nur absolute Ruhe', remedyHint: 'Gelsemium / Bryonia', relevanceKeywords: ['benommen', 'schläfrig', 'Gelsemium', 'Bryonia'] }
          ]
        },
        {
          id: 'intensity',
          category: 'Intensitätsgrad (1 bis 4)',
          title: '4. Wie stark ist der Akutschmerz ausgeprägt?',
          description: 'Homöopathische Gradeinstufung von 1 bis 4 nach Samuel Hahnemann (keine 1–10 Skala).',
          type: 'scale',
          scaleMin: 1,
          scaleMax: 4
        }
      ];
    }

    if (domain === 'gastrointestinal') {
      return [
        {
          id: 'onset',
          category: 'Art der Magen-Darm-Beschwerden',
          title: '1. Welche Symptome stehen im Vordergrund?',
          description: 'Charakteristische Zeichen der Verdauungsorgane grenzen die Leitmittel ein.',
          type: 'single',
          options: [
            { id: 'gi_colic_cramp', label: 'Krampfartige, schneidende Koliken, muss sich vor Schmerz krümmen', remedyHint: 'Colocynthis / Mag phos', relevanceKeywords: ['Krämpfe', 'Koliken', 'Zusammenkrümmen', 'Colocynthis'] },
            { id: 'gi_burning_vomit', label: 'Brennender Magenschmerz mit Erbrechen und brennendem Durchfall', remedyHint: 'Arsenicum album', relevanceKeywords: ['Brennen', 'Erbrechen', 'wässriger Durchfall', 'Arsenicum album'] },
            { id: 'gi_bloat_gas', label: 'Starke Blähungen, Völlegefühl schon nach wenigen Bissen', remedyHint: 'Carbo vegetabilis / Lycopodium', relevanceKeywords: ['Blähungen', 'Völlegefühl', 'Carbo vegetabilis', 'Lycopodium'] },
            { id: 'gi_constant_nausea', label: 'Ständige quälende Übelkeit, die durch Erbrechen nicht gelindert wird', remedyHint: 'Ipecacuanha', relevanceKeywords: ['Übelkeit', 'saubere Zunge', 'Ipecacuanha'] }
          ]
        },
        {
          id: 'modality',
          category: 'Möglicher Auslöser',
          title: '2. Was ging den Beschwerden voraus bzw. war der Auslöser?',
          description: 'Die Causa ist ein zentraler Wegweiser im Magen-Darm-Bereich.',
          type: 'single',
          options: [
            { id: 'gi_food_poison', label: 'Verdorbene Nahrung, Fleisch, Fisch oder Magen-Darm-Infekt', remedyHint: 'Arsenicum album', relevanceKeywords: ['verdorbene Nahrung', 'Infekt', 'Arsenicum album'] },
            { id: 'gi_fatty_food', label: 'Fettes, schweres Essen, Torten, Gebäck oder Eis', remedyHint: 'Pulsatilla', relevanceKeywords: ['fettes Essen', 'schwer verdaulich', 'Pulsatilla'] },
            { id: 'gi_stress_coffee', label: 'Ärger, Stress, Kaffee, Alkohol, Tabak oder Medikamente', remedyHint: 'Nux vomica', relevanceKeywords: ['Stress', 'Kaffee', 'Alkohol', 'Nux vomica'] },
            { id: 'gi_cold_drinks', label: 'Eiskalte Getränke oder Unterkühlung des Bauches', remedyHint: 'Dulcamara / Arsenicum album', relevanceKeywords: ['Kaltgetränke', 'Unterkühlung', 'Dulcamara'] }
          ]
        },
        {
          id: 'sensationMind',
          category: 'Gemütszustand & emotionale Verfassung',
          title: '3. Wie ist der Gemütszustand bei den Magen-Darm-Beschwerden?',
          description: 'Große Unruhe mit Angst, Reizbarkeit oder Wehleidigkeit weisen direkt auf das Mittel.',
          type: 'single',
          options: [
            { id: 'sen_angry_irritable', label: 'Zornig, extrem gereizt, ungeduldig, ärgerlich (Nux vomica / Chamomilla)', remedyHint: 'Nux vomica / Chamomilla', relevanceKeywords: ['zornig', 'gereizt', 'Nux vomica', 'Chamomilla'] },
            { id: 'sen_fear_restless', label: 'Ängstliche Unruhe, Angst vor Krankheit, Herzklopfen (Arsenicum album)', remedyHint: 'Arsenicum album', relevanceKeywords: ['ängstliche Unruhe', 'Todesangst', 'Arsenicum album'] },
            { id: 'sen_weepy_mild', label: 'Weinerlich, trostsuchend, sanftmütig, mag nicht allein sein (Pulsatilla)', remedyHint: 'Pulsatilla', relevanceKeywords: ['weinerlich', 'trostbedürftig', 'Pulsatilla'] },
            { id: 'sen_dull_heavy', label: 'Völlige Erschöpfung, apathisch, schwach, Verlangen nach Luft (Carbo veg)', remedyHint: 'Carbo vegetabilis', relevanceKeywords: ['Erschöpfung', 'Carbo vegetabilis'] }
          ]
        },
        {
          id: 'intensity',
          category: 'Intensitätsgrad (1 bis 4)',
          title: '4. Wie stark beeinträchtigen die Magen-Darm-Beschwerden?',
          description: 'Homöopathische Gradeinstufung von 1 bis 4 nach Samuel Hahnemann.',
          type: 'scale',
          scaleMin: 1,
          scaleMax: 4
        }
      ];
    }

    if (domain === 'respiratory') {
      return [
        {
          id: 'onset',
          category: 'Husten- & Halscharakter',
          title: '1. Wie äußert sich der Husten bzw. die Halsbeschwerde?',
          description: 'Akustik des Hustens und Empfindung im Hals führen zur Arznei.',
          type: 'single',
          options: [
            { id: 'resp_dry_barking', label: 'Trockener, bellender, erstickender Husten (oft plötzlich nachts)', remedyHint: 'Aconitum / Spongia', relevanceKeywords: ['trockener Husten', 'bellend', 'Aconitum', 'Spongia'] },
            { id: 'resp_loose_rattling', label: 'Lockerer, rasselnder Schleimhusten, Schleim schwer abhustbar', remedyHint: 'Antimonium tartaricum / Ipecacuanha', relevanceKeywords: ['Rasseln', 'Schleim', 'Antimonium tartaricum'] },
            { id: 'resp_painful_hold', label: 'Sehr schmerzhafter Husten, muss sich vor Schmerz die Brust halten', remedyHint: 'Bryonia', relevanceKeywords: ['Brust halten', 'schmerzhafter Husten', 'Bryonia'] },
            { id: 'resp_sore_throat', label: 'Brennender, dunkelroter Hals mit starkem Schluckschmerz', remedyHint: 'Belladonna / Apis / Lachesis', relevanceKeywords: ['Halsschmerz', 'Schlucken', 'Belladonna', 'Lachesis'] }
          ]
        },
        {
          id: 'modality',
          category: 'Luft- & Raummodalität',
          title: '2. Wie reagiert die Atmung auf Raum- und Umgebungsluft?',
          description: 'Temperatur und Frischluft sind Schlüsselfaktoren bei Atemwegsinfekten.',
          type: 'single',
          options: [
            { id: 'resp_cold_wind', label: 'Schlimmer nach kaltem, scharfem trockenem Wind', remedyHint: 'Aconitum / Hepar sulfuris', relevanceKeywords: ['kalter Wind', 'Aconitum', 'Hepar sulfuris'] },
            { id: 'resp_warm_room_bad', label: 'Schlimmer im warmen Zimmer, Besserung an kühler frischer Luft', remedyHint: 'Pulsatilla', relevanceKeywords: ['warmes Zimmer', 'frische Luft', 'Pulsatilla'] },
            { id: 'resp_cold_air_bad', label: 'Hustenanfall sofort beim Einatmen kalter Luft oder beim Entblößen', remedyHint: 'Rumex / Hepar sulfuris', relevanceKeywords: ['kalte Luft', 'Rumex', 'Hepar sulfuris'] },
            { id: 'resp_warm_drinks_good', label: 'Besserung durch warme Getränke und warmes Einhüllen des Halses', remedyHint: 'Arsenicum album / Spongia', relevanceKeywords: ['warme Getränke', 'Arsenicum album', 'Spongia'] }
          ]
        },
        {
          id: 'sensationMind',
          category: 'Gemütszustand & seelische Verfassung',
          title: '3. Wie ist der Gemütszustand während des Hustens oder Infekts?',
          description: 'Ängstlichkeit, Atemnot-Panik, Reizbarkeit oder Weinen leiten das Atemwegsmittel.',
          type: 'single',
          options: [
            { id: 'resp_restless_anxious', label: 'Große ängstliche Unruhe, Erstickungsangst, Panik nachts (Aconitum / Arsenicum)', remedyHint: 'Aconitum / Arsenicum album', relevanceKeywords: ['Atembeklemmung', 'Angst', 'Aconitum', 'Arsenicum album'] },
            { id: 'sen_angry_irritable', label: 'Gereizt, mürrisch, will absolut nicht angesprochen oder gestört werden (Bryonia / Nux vomica)', remedyHint: 'Bryonia / Nux vomica', relevanceKeywords: ['gereizt', 'mürrisch', 'Bryonia', 'Nux vomica'] },
            { id: 'sen_weepy_mild', label: 'Weinerlich, anhänglich, sehnt sich nach Trost und frischer Luft (Pulsatilla)', remedyHint: 'Pulsatilla', relevanceKeywords: ['weinerlich', 'trostbedürftig', 'Pulsatilla'] },
            { id: 'sen_dull_heavy', label: 'Schläfrig, erschöpft, zittrig, kraftlos (Gelsemium / Antimonium tartaricum)', remedyHint: 'Gelsemium / Antimonium tartaricum', relevanceKeywords: ['schläfrig', 'Gelsemium', 'Antimonium tartaricum'] }
          ]
        },
        {
          id: 'intensity',
          category: 'Intensitätsgrad (1 bis 4)',
          title: '4. Wie stark ist der Hustenreiz bzw. Halsschmerz?',
          description: 'Klassische homöopathische Einstufung von 1 bis 4 nach Samuel Hahnemann.',
          type: 'scale',
          scaleMin: 1,
          scaleMax: 4
        }
      ];
    }

    if (domain === 'headache') {
      return [
        {
          id: 'onset',
          category: 'Schmerztyp des Kopfschmerzes',
          title: '1. Wie fühlt sich der Kopfschmerz genau an?',
          description: 'Die Schmerzqualität im Kopf ist eines der sichersten Leitsymptome.',
          type: 'single',
          options: [
            { id: 'hd_throbbing_hot', label: 'Pochend, hämmernd, pulsierende Halsschlagadern, rotes Gesicht', remedyHint: 'Belladonna / Glonoinum', relevanceKeywords: ['pochend', 'hämmernd', 'rotes Gesicht', 'Belladonna', 'Glonoinum'] },
            { id: 'hd_splitting_motion', label: 'Stechend, berstend, als ob der Kopf zerspringt (jede Bewegung unerträglich)', remedyHint: 'Bryonia', relevanceKeywords: ['berstender Kopfschmerz', 'jede Bewegung', 'Bryonia'] },
            { id: 'hd_dull_heavy_occiput', label: 'Dumpf, schwer, vom Hinterkopf ausgehend, schwere Augenlider', remedyHint: 'Gelsemium', relevanceKeywords: ['Hinterkopf', 'schwere Lider', 'Gelsemium'] },
            { id: 'hd_one_sided_sharp', label: 'Einseitig stechend über einem Auge (oft mit Augenflimmern)', remedyHint: 'Spigelia / Iris versicolor', relevanceKeywords: ['einseitig über Auge', 'Spigelia', 'Iris versicolor'] }
          ]
        },
        {
          id: 'modality',
          category: 'Einfluss von Bewegung & Reizen',
          title: '2. Was verschlimmert den Kopfschmerz am stärksten?',
          description: 'Erschütterungs- und Reizempfindlichkeit trennen Belladonna, Bryonia und Co.',
          type: 'single',
          options: [
            { id: 'hd_jar_light_noise', label: 'Erschütterung, Licht, Geräusche und Bücken sind unerträglich', remedyHint: 'Belladonna', relevanceKeywords: ['Erschütterung', 'Lichtscheu', 'Belladonna'] },
            { id: 'hd_eye_motion', label: 'Jede kleinste Bewegung des Kopfes oder sogar der Augen verschlimmert', remedyHint: 'Bryonia', relevanceKeywords: ['Augenbewegung', 'Stillliegen', 'Bryonia'] },
            { id: 'hd_stress_morning', label: 'Morgens beim Erwachen nach Stress, Schlafmangel oder Genussmitteln', remedyHint: 'Nux vomica', relevanceKeywords: ['Katerkopfschmerz', 'Stress', 'Nux vomica'] },
            { id: 'hd_sun_heat', label: 'Nach starker Sonneneinstrahlung, Hitze oder Föhn', remedyHint: 'Belladonna / Glonoinum', relevanceKeywords: ['Sonneneinstrahlung', 'Hitze', 'Glonoinum'] }
          ]
        },
        {
          id: 'sensationMind',
          category: 'Gemütszustand & Verhalten',
          title: '3. Wie ist der Gemütszustand während des Kopfschmerzes?',
          description: 'Gereiztheit, Angst, Jammern oder Verlangen nach Ruhe entscheiden das Kopfschmerzmittel.',
          type: 'single',
          options: [
            { id: 'sen_angry_irritable', label: 'Zornig, gereizt, ungeduldig, extrem empfindlich gegen Lärm und Störungen', remedyHint: 'Nux vomica / Chamomilla / Bryonia', relevanceKeywords: ['zornig', 'gereizt', 'Nux vomica', 'Chamomilla'] },
            { id: 'sen_fear_restless', label: 'Große ängstliche Unruhe, Angst, Herzklopfen, Besorgnis', remedyHint: 'Aconitum / Arsenicum album', relevanceKeywords: ['ängstlich', 'ruhelos', 'Aconitum', 'Arsenicum'] },
            { id: 'sen_weepy_mild', label: 'Weinerlich, anhänglich, sehnt sich nach Trost, Zuwendung und frischer Luft', remedyHint: 'Pulsatilla', relevanceKeywords: ['weinerlich', 'trostbedürftig', 'Pulsatilla'] },
            { id: 'sen_dull_heavy', label: 'Benommen, schläfrig, dumpf, will nur die Augen schließen und absolute Ruhe', remedyHint: 'Gelsemium / Bryonia', relevanceKeywords: ['schläfrig', 'benommen', 'Gelsemium', 'Bryonia'] }
          ]
        },
        {
          id: 'intensity',
          category: 'Intensitätsgrad (1 bis 4)',
          title: '4. Wie stark ist der Kopfschmerz ausgeprägt?',
          description: 'Klassische Einstufung von 1 bis 4 nach Samuel Hahnemann.',
          type: 'scale',
          scaleMin: 1,
          scaleMax: 4
        }
      ];
    }

    if (domain === 'injury') {
      return [
        {
          id: 'onset',
          category: 'Art der Verletzung (Trauma)',
          title: '1. Welche Verletzungsform liegt vor?',
          description: 'Gewebetyp und Traumamechanismus bestimmen das homöopathische Wundmittel.',
          type: 'single',
          options: [
            { id: 'inj_blunt_hematoma', label: 'Stumpfes Trauma, Prellung, Bluterguss, Muskelkater, wie zerschlagen', remedyHint: 'Arnica', relevanceKeywords: ['Arnica', 'Prellung', 'Bluterguss', 'Zerschlagenheit'] },
            { id: 'inj_sprain_ligaments', label: 'Verstauchung, Zerrung von Bändern, Sehnen oder Überlastung', remedyHint: 'Rhus toxicodendron / Ruta', relevanceKeywords: ['Rhus tox', 'Ruta', 'Verstauchung', 'Bänderdehnung'] },
            { id: 'inj_nerve_crush', label: 'Quetschung nervenreicher Gewebe (Fingerspitzen, Zehen, Steißbein)', remedyHint: 'Hypericum', relevanceKeywords: ['Hypericum', 'Nervenverletzung', 'Quetschung', 'Steißbein'] },
            { id: 'inj_puncture_cut', label: 'Stichwunde, Insektenstich, Nageltritt oder Schnittwunde', remedyHint: 'Ledum / Staphisagria', relevanceKeywords: ['Ledum', 'Staphisagria', 'Stichwunde', 'Nageltritt'] }
          ]
        },
        {
          id: 'modality',
          category: 'Bewegungsmodalität',
          title: '2. Wie verhält sich der Schmerz bei Bewegung der verletzten Stelle?',
          description: 'Das Anlauf- und Ruheverhalten grenzt Rhus tox von Bryonia ab.',
          type: 'single',
          options: [
            { id: 'inj_motion_better', label: 'Erste Bewegung sehr schmerzhaft, nach weiterem Bewegen spürbar besser', remedyHint: 'Rhus toxicodendron', relevanceKeywords: ['Einlaufen', 'besser durch Bewegung', 'Rhus toxicodendron'] },
            { id: 'inj_motion_worse', label: 'Jede geringste Bewegung ist unerträglich, will absolut ruhig lagern', remedyHint: 'Bryonia', relevanceKeywords: ['schlechter bei Bewegung', 'Ruhelagerung', 'Bryonia'] },
            { id: 'inj_nerve_shoot', label: 'Schmerz schießt an den Nervenbahnen blitzartig empor', remedyHint: 'Hypericum', relevanceKeywords: ['schießender Schmerz', 'Nervenbahnen', 'Hypericum'] },
            { id: 'inj_cold_better', label: 'Verletzte Stelle fühlt sich kalt an, aber Kälte lindert den Schmerz', remedyHint: 'Ledum', relevanceKeywords: ['Kälte lindert', 'Ledum'] }
          ]
        },
        {
          id: 'sensationMind',
          category: 'Gemütszustand & Traumareaktion',
          title: '3. Wie ist der Gemütszustand nach der Verletzung?',
          description: 'Verleugnung des Schmerzes („Mir fehlt nichts!“), Zorn oder Schockangst kennzeichnen das Wundmittel.',
          type: 'single',
          options: [
            { id: 'inj_fear_touch', label: 'Sagt „Mir fehlt nichts, lasst mich in Ruhe!“, fürchtet jede Berührung/Annäherung', remedyHint: 'Arnica', relevanceKeywords: ['Arnica', 'Mir fehlt nichts', 'fürchtet Berührung'] },
            { id: 'inj_intense_pain', label: 'Unerträglicher Schmerz, zornig, schlägt um sich, gereizt vor Schmerz', remedyHint: 'Chamomilla / Hypericum', relevanceKeywords: ['heftiger Schmerz', 'Chamomilla', 'Hypericum', 'zornig'] },
            { id: 'sen_fear_restless', label: 'Großer Schock, zittrig, ängstliche Unruhe, Herzklopfen', remedyHint: 'Aconitum / Hypericum', relevanceKeywords: ['Schock', 'Aconitum', 'ängstlich', 'Zittern'] },
            { id: 'sen_weepy_mild', label: 'Weinerlich, hilflos, sehnt sich nach tröstendem Beistand', remedyHint: 'Pulsatilla', relevanceKeywords: ['weinerlich', 'trostbedürftig', 'Pulsatilla'] }
          ]
        },
        {
          id: 'intensity',
          category: 'Intensitätsgrad (1 bis 4)',
          title: '4. Wie stark ist die Schmerzintensität der Verletzung?',
          description: 'Hahnemannsche Einstufung von 1 bis 4.',
          type: 'scale',
          scaleMin: 1,
          scaleMax: 4
        }
      ];
    }

    if (domain === 'fever') {
      return [
        {
          id: 'onset',
          category: 'Fieberverlauf & Beginn',
          title: '1. Wie hat das Fieber begonnen und wie verläuft es?',
          description: 'Temperaturkurve und Hautzustand entscheiden im Fieberstadium.',
          type: 'single',
          options: [
            { id: 'fev_sudden_dry', label: 'Plötzlich hohes Fieber nach Kälte/Wind, glühende trockene Haut, Schüttelfrost', remedyHint: 'Aconitum', relevanceKeywords: ['Aconitum', 'trockene Haut', 'plötzliches Fieber', 'Schüttelfrost'] },
            { id: 'fev_hot_sweat_red', label: 'Hohe Hitze, hochroter Kopf, weite Pupillen, Schweiß, pochende Schläfen', remedyHint: 'Belladonna', relevanceKeywords: ['Belladonna', 'roter Kopf', 'Schweiß', 'pochend'] },
            { id: 'fev_slow_drowsy', label: 'Schleichender Beginn, große Schläfrigkeit, Schwere, zittrige Schwäche', remedyHint: 'Gelsemium', relevanceKeywords: ['Gelsemium', 'Schläfrigkeit', 'Schwere', 'Zittern'] },
            { id: 'fev_bone_ache', label: 'Hohes Fieber mit tiefem, quälendem Zerschlagenheitsgefühl in den Knochen', remedyHint: 'Eupatorium perfoliatum', relevanceKeywords: ['Eupatorium perfoliatum', 'Knochenschmerz', 'Gliederschmerz'] }
          ]
        },
        {
          id: 'modality',
          category: 'Durst & Trinkverhalten',
          title: '2. Wie ist das Durstverhalten während des Fiebers?',
          description: 'Durstlosigkeit oder Gier nach Eiswasser sind hochgradige Differenzierer.',
          type: 'single',
          options: [
            { id: 'fev_huge_thirst', label: 'Großer Durst auf große Mengen kaltes Wasser in langen Abständen', remedyHint: 'Bryonia', relevanceKeywords: ['großer Durst', 'große Mengen', 'Bryonia'] },
            { id: 'fev_sips_restless', label: 'Häufiger Durst auf kleine Schlucke mit ängstlicher Ruhelosigkeit', remedyHint: 'Arsenicum album', relevanceKeywords: ['kleine Schlucke', 'Unruhe', 'Arsenicum album'] },
            { id: 'fev_thirstless', label: 'Völlige Durstlosigkeit trotz Hitze und hohem Fieber', remedyHint: 'Pulsatilla / Apis / Gelsemium', relevanceKeywords: ['durstlos', 'Pulsatilla', 'Apis', 'Gelsemium'] },
            { id: 'fev_cold_drinks_crave', label: 'Verlangen nach eiskalten Getränken oder säuerlichen Säften', remedyHint: 'Phosphorus / Belladonna', relevanceKeywords: ['eiskaltes Wasser', 'Phosphorus'] }
          ]
        },
        {
          id: 'sensationMind',
          category: 'Gemüt & Schweiß',
          title: '3. Wie ist die Gemütsverfassung und Schweißbildung?',
          description: 'Verhalten im Fieberwahn oder Zustand des Nervensystems.',
          type: 'single',
          options: [
            { id: 'fev_fear_agitation', label: 'Große Todesangst, panische Unruhe, fürchtet die Nacht', remedyHint: 'Aconitum', relevanceKeywords: ['Todesangst', 'Unruhe', 'Aconitum'] },
            { id: 'fev_delirium_startle', label: 'Phantasiert im Fieber, schreckhaft, Halluzinationen bei geschlossenen Augen', remedyHint: 'Belladonna', relevanceKeywords: ['Fieberwahn', 'schreckhaft', 'Belladonna'] },
            { id: 'fev_chill_uncover', label: 'Fröstelt bei geringstem Entblößen, will fest zugedeckt schwitzen', remedyHint: 'Nux vomica / Arsenicum album', relevanceKeywords: ['Frösteln', 'zugedeckt', 'Nux vomica'] },
            { id: 'fev_quiet_sleepy', label: 'Völlig apathisch, will nur schlafen, liegt bewegungslos', remedyHint: 'Gelsemium / Bryonia', relevanceKeywords: ['apathisch', 'schlafen', 'Gelsemium'] }
          ]
        },
        {
          id: 'intensity',
          category: 'Intensitätsgrad (1 bis 4)',
          title: '4. Wie hoch bzw. beeinträchtigend ist der Fieberzustand?',
          description: 'Hahnemannsche Einstufung von 1 bis 4.',
          type: 'scale',
          scaleMin: 1,
          scaleMax: 4
        }
      ];
    }

    if (domain === 'skin') {
      return [
        {
          id: 'onset',
          category: 'Hauterscheinung & Schwellung',
          title: '1. Wie sieht die betroffene Hautstelle aus?',
          description: 'Morphologie und Entzündungszeichen der Haut führen zum Simile.',
          type: 'single',
          options: [
            { id: 'sk_bee_edema', label: 'Glasige, blass-rosige Schwellung (wie Wespenstich), brennend und stechend', remedyHint: 'Apis mellifica', relevanceKeywords: ['Insektenstich', 'ödematös', 'brennend stechend', 'Apis'] },
            { id: 'sk_burn_blister', label: 'Verbrennung / Verbrühung mit schneller Blasenbildung und starkem Brennen', remedyHint: 'Cantharis / Urtica urens', relevanceKeywords: ['Verbrennung', 'Blasenbildung', 'Cantharis', 'Urtica'] },
            { id: 'sk_vesicles_itch', label: 'Haufenweise kleine, intensiv juckende Bläschen auf geröteter Haut', remedyHint: 'Rhus toxicodendron', relevanceKeywords: ['juckende Bläschen', 'Rhus toxicodendron'] },
            { id: 'sk_pus_sensitive', label: 'Schmerzhafte Eiterung (Abszess/Furunkel), extrem berührungsempfindlich', remedyHint: 'Hepar sulfuris / Silicea', relevanceKeywords: ['Eiterung', 'berührungsempfindlich', 'Hepar sulfuris'] }
          ]
        },
        {
          id: 'modality',
          category: 'Lokale Temperaturmodalität',
          title: '2. Was bringt der Hautstelle spürbare Linderung?',
          description: 'Die Reaktion auf Kälte vs. Hitze ist der Hauptschlüssel bei Hautsymptomen.',
          type: 'single',
          options: [
            { id: 'sk_cold_ice_better', label: 'Nur eiskaltes Wasser oder Eisauflagen bringen Erleichterung', remedyHint: 'Apis mellifica / Ledum', relevanceKeywords: ['Eisauflage', 'Kälte lindert', 'Apis', 'Ledum'] },
            { id: 'sk_scalding_hot_better', label: 'Linderung durch sehr heißes Wasser oder heiße Kompressen', remedyHint: 'Rhus toxicodendron / Arsenicum album', relevanceKeywords: ['heißes Wasser', 'Wärme lindert', 'Rhus tox', 'Arsenicum album'] },
            { id: 'sk_water_worse', label: 'Jedes Waschen und Wasserberührung verschlimmert den Juckreiz massiv', remedyHint: 'Sulphur', relevanceKeywords: ['Wasser verschlimmert', 'Sulphur'] },
            { id: 'sk_open_air_better', label: 'Besser an kühler frischer Luft, unerträglich im warmen Bett', remedyHint: 'Pulsatilla / Sulphur', relevanceKeywords: ['Bettwärme verschlimmert', 'Pulsatilla', 'Sulphur'] }
          ]
        },
        {
          id: 'sensationMind',
          category: 'Schmerzgefühl & Gemüt',
          title: '3. Welche Empfindung quält am meisten?',
          description: 'Gemütszustand und Schmerztyp vervollständigen das Hautbild.',
          type: 'single',
          options: [
            { id: 'sk_burning_needles', label: 'Brennend-stechend wie glühende Nadeln, weinerlich-unruhig', remedyHint: 'Apis mellifica', relevanceKeywords: ['glühende Nadeln', 'Apis mellifica'] },
            { id: 'sk_unbearable_scratch', label: 'Unerträglicher Juckreiz, muss sich bis aufs Blut kratzen', remedyHint: 'Sulphur', relevanceKeywords: ['Juckreiz', 'Kratzen', 'Sulphur'] },
            { id: 'sk_hypersensitive_rage', label: 'Überempfindlich gegen geringsten Schmerz, zornig und gereizt', remedyHint: 'Chamomilla / Hepar sulfuris', relevanceKeywords: ['Zorn', 'Überempfindlichkeit', 'Chamomilla', 'Hepar sulfuris'] },
            { id: 'sk_anxious_burning', label: 'Brennender Schmerz mit nächtlicher Unruhe und Angst', remedyHint: 'Arsenicum album', relevanceKeywords: ['Brennen', 'Todesangst', 'Arsenicum album'] }
          ]
        },
        {
          id: 'intensity',
          category: 'Intensitätsgrad (1 bis 4)',
          title: '4. Wie stark ist das Hautsymptom ausgeprägt?',
          description: 'Hahnemannsche Einstufung von 1 bis 4.',
          type: 'scale',
          scaleMin: 1,
          scaleMax: 4
        }
      ];
    }

    // Default Fallback: Allgemeine Akutsymptomatik
    return [
      {
        id: 'onset',
        category: 'Auslöser & Beginn (Causa)',
        title: '1. Wie haben die Beschwerden begonnen und was war der Auslöser?',
        description: 'Der Auslöser ist eines der wichtigsten Differenzierungskriterien in der Homöopathie.',
        type: 'single',
        options: [
          { id: 'gen_sudden', label: 'Plötzlich, heftig einsetzend (oft nach Kälte/Schreck)', remedyHint: 'Aconitum / Belladonna', relevanceKeywords: ['Aconitum', 'Belladonna', 'plötzlich einsetzend', 'heftig'] },
          { id: 'gen_cold_wet', label: 'Nach Unterkühlung, Durchnässung oder Zugluft', remedyHint: 'Rhus tox / Dulcamara', relevanceKeywords: ['Rhus tox', 'Unterkühlung', 'Zugluft', 'Durchnässung'] },
          { id: 'gen_stress', label: 'Nach Ärger, Zorn, Kränkung oder Stress', remedyHint: 'Chamomilla / Nux vomica / Colocynthis', relevanceKeywords: ['Chamomilla', 'Nux vomica', 'Colocynthis', 'Ärger', 'Stress'] },
          { id: 'gen_slow', label: 'Schleichend / langsam zunehmend ohne klaren Auslöser', remedyHint: 'Bryonia / Gelsemium', relevanceKeywords: ['Bryonia', 'Gelsemium', 'schleichend'] }
        ]
      },
      {
        id: 'modality',
        category: 'Modalitäten (Besser / Schlechter)',
        title: '2. Was bringt Linderung oder führt zur Verschlechterung?',
        description: 'Modalitäten sind entscheidend, um zwischen eng verwandten Akutmitteln zu unterscheiden.',
        type: 'single',
        options: [
          { id: 'mod_warmth_wrap', label: 'Besser durch lokale Wärme, heiße Getränke & Einhüllen', remedyHint: 'Arsenicum album / Rhus tox', relevanceKeywords: ['besser durch Wärme', 'besser durch Einhüllen', 'besser durch heiße Getränke'] },
          { id: 'mod_cold_air', label: 'Besser durch Kälte, kalte Umschläge & frische Luft', remedyHint: 'Apis / Pulsatilla', relevanceKeywords: ['besser durch Kälte', 'besser durch kalte Umschläge', 'besser durch frische Luft'] },
          { id: 'mod_rest_still', label: 'Schlimmer durch geringste Bewegung (Verlangen nach absoluter Ruhe)', remedyHint: 'Bryonia', relevanceKeywords: ['schlechter durch Bewegung', 'besser durch Ruhe', 'Bryonia'] },
          { id: 'mod_motion_restless', label: 'Besser durch fortgesetzte Bewegung & Positionswechsel', remedyHint: 'Rhus tox', relevanceKeywords: ['besser durch Bewegung', 'körperliche Unruhe', 'Rhus tox'] },
          { id: 'mod_hard_pressure', label: 'Besser durch starken Druck oder Zusammenkrümmen', remedyHint: 'Colocynthis / Bryonia', relevanceKeywords: ['besser durch festen Druck', 'besser durch Zusammenkrümmen', 'Colocynthis'] }
        ]
      },
      {
        id: 'sensationMind',
        category: 'Gemüt & Hauptempfindung',
        title: '3. Wie ist die Gemütsstimmung und die Schmerzqualität?',
        description: 'Das Verhalten und Gemüt im Akutzustand zeigt das charakteristische Mittelbild.',
        type: 'single',
        options: [
          { id: 'sen_fear_restless', label: 'Große ängstliche Unruhe, Angst, Herzklopfen', remedyHint: 'Aconitum / Arsenicum', relevanceKeywords: ['ängstliche Unruhe', 'Todesangst', 'Aconitum', 'Arsenicum'] },
          { id: 'sen_angry_irritable', label: 'Zornig, gereizt, ungeduldig, will in Ruhe gelassen werden', remedyHint: 'Chamomilla / Nux vomica / Bryonia', relevanceKeywords: ['zornig', 'gereizt', 'Nux vomica', 'Chamomilla'] },
          { id: 'sen_weepy_mild', label: 'Weinerlich, anhänglich, sehnt sich nach Trost & Zuwendung', remedyHint: 'Pulsatilla', relevanceKeywords: ['weinerlich', 'trostsuchend', 'Pulsatilla', 'sanftmütig'] },
          { id: 'sen_dull_heavy', label: 'Benommen, schläfrig, wie betäubt, schwere Augenlider', remedyHint: 'Gelsemium', relevanceKeywords: ['benommen', 'schläfrig', 'Gelsemium', 'schwere Glieder'] },
          { id: 'sen_burning_stinging', label: 'Brennender oder stechender Schmerz wie glühende Nadeln', remedyHint: 'Apis / Cantharis', relevanceKeywords: ['brennender Schmerz', 'stechender Schmerz', 'Apis'] }
        ]
      },
      {
        id: 'intensity',
        category: 'Intensitätsgrad (1 bis 4)',
        title: '4. Wie stark ist das Leitsymptom ausgeprägt?',
        description: 'Homöopathische Gradeinstufung von 1 bis 4 nach Samuel Hahnemann (keine 1–10 Skala).',
        type: 'scale',
        scaleMin: 1,
        scaleMax: 4
      }
    ];
}

/**
 * Generates clarification questions localized according to the specified language.
 */
function generateRawAcuteQuestions(domain: AcuteComplaintDomain, lang: LanguageCode): AcuteClarificationQuestion[] {
  const baseQuestions = getBaseDomainQuestions(domain);
  if (lang === 'de') {
    return baseQuestions;
  }

  const domainKey = domain in QUESTION_META_BY_DOMAIN ? domain : 'general';
  const meta = QUESTION_META_BY_DOMAIN[domainKey] || QUESTION_META_BY_DOMAIN['general'];

  return baseQuestions.map(q => {
    const qKey = q.id as 'onset' | 'modality' | 'sensationMind' | 'intensity';
    const qMeta = meta[qKey];

    const localizedCategory = qMeta?.category[lang] || qMeta?.category['en'] || q.category;
    const localizedTitle = qMeta?.title[lang] || qMeta?.title['en'] || q.title;
    const localizedDescription = qMeta?.description[lang] || qMeta?.description['en'] || q.description;

    const localizedOptions = q.options?.map(opt => {
      const locLabel = OPTION_LABELS_I18N[opt.id]?.[lang] || OPTION_LABELS_I18N[opt.id]?.['en'] || opt.label;
      return {
        ...opt,
        label: locLabel
      };
    });

    return {
      ...q,
      category: localizedCategory,
      title: localizedTitle,
      description: localizedDescription,
      options: localizedOptions
    };
  });
}

/**
 * Generates dynamic, highly specific clarification questions based on the complaint text and language.
 * Adheres strictly to the classical 1-4 intensity scale and gives targeted remedies for fast differentiation.
 */
export function getAcuteClarificationQuestions(
  inputText: string,
  lang: LanguageCode = 'de'
): AcuteClarificationQuestion[] {
  const domain = detectComplaintDomain(inputText);
  const rawQuestions = generateRawAcuteQuestions(domain, lang);

  // Attach remedyIds to options based on OPTION_REMEDY_MAP
  rawQuestions.forEach((q) => {
    if (q.options) {
      q.options.forEach((opt) => {
        opt.remedyIds = OPTION_REMEDY_MAP[opt.id] || [];
      });
    }
  });

  return rawQuestions;
}

/**
 * Combines original symptom text with selected answers to feed into matchSymptomsToRemedies.
 */
export function buildEnhancedSymptomQuery(
  baseSymptomText: string,
  answers: AcuteAnswers,
  questions: AcuteClarificationQuestion[]
): string {
  const parts: string[] = [baseSymptomText.trim()];

  questions.forEach((q) => {
    if (q.type === 'single' && q.options) {
      const selectedId = (answers as any)[q.id];
      if (selectedId) {
        const found = q.options.find((opt) => opt.id === selectedId);
        if (found) {
          parts.push(found.label);
          if (found.relevanceKeywords && found.relevanceKeywords.length > 0) {
            parts.push(found.relevanceKeywords.join(' '));
          }
        }
      }
    } else if (q.type === 'scale' && answers.intensity) {
      parts.push(`[${answers.intensity}/4]`);
    }
  });

  return parts.filter(Boolean).join(' ');
}

export { getDerivedClarifyingQuestion } from './acuteDerivedClarificationService';
