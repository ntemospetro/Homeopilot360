import { LanguageCode } from '../types';
import { RepertoriumSymptomInput, normalizeQuery } from './boerickeRepertoryService';
import { getLocalizedRemedies } from '../data/materiaMedicaData';

export interface AnamnesisDialogueStep {
  id: string;
  timestamp: number;
  question: string;
  answer: string;
  pillar: 'chiefComplaint' | 'location' | 'sensation' | 'modalities' | 'concomitants' | 'causa' | 'mind';
  depthLevel: number; // 1 = Orientation, 2 = Specification, 3 = Micro-deepening
  status?: string;
  direction?: 'worse' | 'better' | 'neutral';
  certainty?: 'high' | 'medium' | 'caution';
  optionId?: string;
}

export interface AdaptiveQuestionRecommendation {
  id: string;
  text: string;
  pillar: 'location' | 'sensation' | 'modalities' | 'concomitants' | 'causa' | 'mind';
  pillarLabel: string;
  reason: string;
  depthLevel: number;
}

export type AdaptiveInvestigationQuestion = AdaptiveQuestionRecommendation;

/**
 * Parses an initial spontaneous patient statement and extracts initial cues
 */
export function extractCuesFromInitialComplaint(complaint: string): {
  chiefComplaint: string;
  location?: string;
  sensation?: string;
  modalities?: string;
  concomitants?: string;
  causaEvent?: string;
  causaTemporal?: string;
  causaEffect?: 'worse' | 'better' | 'unchanged' | 'uncertain' | '';
} {
  const lower = complaint.toLowerCase();
  let chief = complaint.trim();
  let location = '';
  let sensation = '';
  let modalities = '';
  let causaEvent = '';
  let causaTemporal = '';

  // Extract location cues strictly as stated
  if (lower.includes('linker oberbauch') || (lower.includes('links') && lower.includes('oberbauch'))) {
    location = 'Linker Oberbauch';
  } else if (lower.includes('rechter oberbauch') || (lower.includes('rechts') && lower.includes('oberbauch'))) {
    location = 'Rechter Oberbauch';
  } else if (lower.includes('oberbauch')) {
    location = 'Oberbauch';
  } else if (lower.includes('magen') && !lower.includes('darm')) {
    location = 'Magen';
  } else {
    if (lower.includes('rechts')) location += 'rechts ';
    if (lower.includes('links')) location += 'links ';
    if (lower.includes('schläfe')) location += 'Schläfe ';
    if (lower.includes('stirn')) location += 'Stirn ';
    if (lower.includes('hinterkopf') || lower.includes('nacken')) location += 'Hinterkopf / Nacken ';
    if (lower.includes('scheitel')) location += 'Scheitel ';
    if (lower.includes('auge') || lower.includes('augen')) location += 'Augen ';
    if (lower.includes('unterbauch')) location += 'Unterbauch ';
    if (lower.includes('kreuz') || lower.includes('lende')) location += 'Lendenwirbelsäule / Kreuz ';
  }

  // Extract sensation cues
  if (lower.includes('berst') || lower.includes('platz') || lower.includes('zerspreng')) sensation += 'Berstend / wie platzend ';
  if (lower.includes('poch') || lower.includes('pulsier')) sensation += 'pochend / pulsierend ';
  if (lower.includes('stech')) sensation += 'stechend ';
  if (lower.includes('drück') || lower.includes('druck')) sensation += 'drückend ';
  if (lower.includes('brenn')) sensation += 'brennend ';
  if (lower.includes('krampf')) sensation += 'krampfartig ';
  if (lower.includes('dumpf')) sensation += 'dumpf ';
  if (lower.includes('reiß')) sensation += 'reißend ';
  if (lower.includes('zerschlag')) sensation += 'zerschlagen ';

  // Extract modality cues
  if (lower.includes('bewegung')) modalities += 'bei Bewegung ';
  if (lower.includes('ruhe')) modalities += 'in Ruhe ';
  if (lower.includes('frische luft') || lower.includes('lüften') || lower.includes('open air')) modalities += 'Frische Luft / Lüften ';
  if (lower.includes('kälte') || lower.includes('zugluft')) modalities += 'bei Kälte / Zugluft ';
  if (lower.includes('wärme')) modalities += 'bei Wärme ';
  if (lower.includes('bücken')) modalities += 'beim Bücken ';
  if (lower.includes('nacht') || lower.includes('abends')) modalities += 'nachts / abends ';
  if (lower.includes('morgen')) modalities += 'morgens ';

  // Extract temporal & causa cues
  if (lower.includes('seit gestern')) causaTemporal = 'seit gestern';
  if (lower.includes('heute früh') || lower.includes('heute morgen')) causaTemporal = 'heute früh';
  if (lower.includes('nach feier') || lower.includes('alkohol') || lower.includes('bier') || lower.includes('wein') || lower.includes('tabak') || lower.includes('rauch')) {
    causaEvent = 'Alkohol / Feier / Tabak';
  } else if (lower.includes('zugluft') || lower.includes('durchnässt') || lower.includes('kaltes wetter')) {
    causaEvent = 'Kälteeinwirkung / Zugluft';
  } else if (lower.includes('ärger') || lower.includes('streit') || lower.includes('aufregung')) {
    causaEvent = 'Ärger / Emotionale Erregung';
  } else if (lower.includes('schlafmangel') || lower.includes('übermüdung') || lower.includes('stress')) {
    causaEvent = 'Schlafmangel / Geistige Überarbeitung';
  }

  return {
    chiefComplaint: chief,
    location: location.trim() || undefined,
    sensation: sensation.trim() || undefined,
    modalities: modalities.trim() || undefined,
    causaEvent: causaEvent.trim() || undefined,
    causaTemporal: causaTemporal.trim() || undefined
  };
}

/**
 * Generates an anatomically tailored radiation question adapted to the patient's complaint
 */
export function getAdaptiveRadiationQuestion(
  chiefOrLocation: string,
  lang: LanguageCode
): string {
  const text = (chiefOrLocation || '').toLowerCase();

  // 1. Head / Migraine / Forehead / Vertex / Occiput / Temples
  if (
    text.includes('kopf') || text.includes('head') || text.includes('migrä') || text.includes('migrain') ||
    text.includes('stirn') || text.includes('forehead') || text.includes('schläf') || text.includes('temple') ||
    text.includes('scheitel') || text.includes('vertex') || text.includes('okzip') || text.includes('occip') ||
    text.includes('hinterkopf') || text.includes('céphal') || text.includes('testa')
  ) {
    switch (lang) {
      case 'de': return 'Bleibt der Schmerz punktuell dort oder strahlt er in benachbarte Bereiche (Auge, Stirn, Schläfen, Nacken) aus?';
      case 'en': return 'Does the pain stay in one spot or does it radiate into adjacent areas (eye, forehead, temples, neck)?';
      case 'es': return '¿El dolor se queda en un punto fijo o se irradia hacia zonas vecinas (ojo, frente, sienes, nuca)?';
      case 'fr': return 'La douleur reste-t-elle localisée ou irradie-t-elle vers les zones voisines (œil, front, tempes, nuque) ?';
      case 'it': return 'Il dolore resta localizzato o si irradia verso zone vicine (occhio, fronte, tempie, nuca)?';
      case 'el': return 'Ο πόνος παραμένει εντοπισμένος ή αντανακλά σε γειτονικές περιοχές (μάτι, μέτωπο, κροτάφους, αυχένα);';
      case 'ru': return 'Боль остается в одной точке или иррадиирует в соседние области (глаз, лоб, виски, шею)?';
    }
  }

  // 2. Neck / Cervical Spine
  if (
    text.includes('nacken') || text.includes('hws') || text.includes('halswirbel') || text.includes('neck') ||
    text.includes('cervic') || text.includes('nuque') || text.includes('collo') || text.includes('αυχέν') ||
    text.includes('шея') || text.includes('шейн')
  ) {
    switch (lang) {
      case 'de': return 'Bleibt der Schmerz im Nacken oder strahlt er in benachbarte Bereiche (Hinterkopf, Schultern, Arme, Schulterblätter) aus?';
      case 'en': return 'Does the pain stay focused in the neck or does it radiate into adjacent areas (occiput, shoulders, arms, shoulder blades)?';
      case 'es': return '¿El dolor se queda en la nuca o se irradia hacia zonas vecinas (occipucio, hombros, brazos, escápulas)?';
      case 'fr': return 'La douleur reste-t-elle dans la nuque ou irradie-t-elle vers les zones voisines (arrière de la tête, épaules, bras) ?';
      case 'it': return 'Il dolore resta nella nuca o si irradia verso zone vicine (nuca, spalle, braccia, scapole)?';
      case 'el': return 'Ο πόνος παραμένει στον αυχένα ή αντανακλά σε γειτονικές περιοχές (ινίο, ώμους, βραχίονες, ωμοπλάτες);';
      case 'ru': return 'Боль остается в шее или иррадиирует в соседние области (затылок, плечи, руки, лопатки)?';
    }
  }

  // 3. Throat / Swallowing / Pharynx / Tonsils
  if (
    text.includes('hals') || text.includes('rachen') || text.includes('mandel') || text.includes('schluck') ||
    text.includes('throat') || text.includes('pharyn') || text.includes('tonsil') || text.includes('gorge') ||
    text.includes('gola') || text.includes('λαρυγγ') || text.includes('горл')
  ) {
    switch (lang) {
      case 'de': return 'Bleibt der Schmerz punktuell im Hals oder strahlt er beim Schlucken in benachbarte Bereiche (Ohren, Kieferwinkel, Kehlkopf) aus?';
      case 'en': return 'Does the pain stay in the throat or does it radiate on swallowing into adjacent areas (ears, jaw angles, larynx)?';
      case 'es': return '¿El dolor se queda en la garganta o se irradia al tragar hacia zonas vecinas (oídos, mandíbula, laringe)?';
      case 'fr': return 'La douleur reste-t-elle dans la gorge ou irradie-t-elle en avalant vers les oreilles ou la mâchoire ?';
      case 'it': return 'Il dolore resta nella gola o si irradia deglutendo verso orecchie o mandibola?';
      case 'el': return 'Ο πόνος παραμένει στον λαιμό ή αντανακλά κατά την κατάποση προς τα αυτιά ή τη γνάθο;';
      case 'ru': return 'Боль остается в горле или при глотании отдает в соседние области (уши, угол челюсти, гортань)?';
    }
  }

  // 4. Teeth / Jaw / Mouth
  if (
    text.includes('zahn') || text.includes('zähn') || text.includes('kiefer') || text.includes('mund') ||
    text.includes('tooth') || text.includes('teeth') || text.includes('dental') || text.includes('jaw') ||
    text.includes('dent') || text.includes('dente') || text.includes('δόντ') || text.includes('зуб') || text.includes('челюст')
  ) {
    switch (lang) {
      case 'de': return 'Bleibt der Schmerz punktuell am Zahn/Kiefer oder strahlt er in benachbarte Bereiche (Wange, Ohr, Schläfe, Hals) aus?';
      case 'en': return 'Does the pain stay localized to the tooth/jaw or does it radiate into adjacent areas (cheek, ear, temple, neck)?';
      case 'es': return '¿El dolor se queda localizado en el diente/mandíbula o se irradia hacia mejilla, oído o sien?';
      case 'fr': return 'La douleur reste-t-elle localisée à la dent/mâchoire ou irradie-t-elle vers la joue, l\'oreille ou la tempe ?';
      case 'it': return 'Il dolore resta localizzato al dente/mandibola o si irradia verso guancia, orecchio o tempia?';
      case 'el': return 'Ο πόνος παραμένει στο δόντι/γνάθο ή αντανακλά προς την παρειά, το αυτί ή τον κρόταφο;';
      case 'ru': return 'Боль остается в зубе/челюсти или иррадиирует в соседние зоны (щеку, ухо, висок, шею)?';
    }
  }

  // 5. Ear
  if (
    text.includes('ohr') || text.includes('ear') || text.includes('oreille') || text.includes('orecchi') ||
    text.includes('αυτί') || text.includes('ух') || text.includes('уш')
  ) {
    switch (lang) {
      case 'de': return 'Bleibt der Schmerz punktuell im Ohr oder strahlt er in benachbarte Bereiche (Schläfe, Kiefer, Hals, Nacken) aus?';
      case 'en': return 'Does the pain stay in the ear or does it radiate into adjacent areas (temple, jaw, throat, neck)?';
      case 'es': return '¿El dolor se queda en el oído o se irradia hacia la sien, mandíbula o cuello?';
      case 'fr': return 'La douleur reste-t-elle dans l\'oreille ou irradie-t-elle vers la tempe, la mâchoire ou le cou ?';
      case 'it': return 'Il dolore resta nell\'orecchio o si irradia verso tempia, mandibola o collo?';
      case 'el': return 'Ο πόνος παραμένει στο αυτί ή αντανακλά προς τον κρόταφο, τη γνάθο ή τον λαιμό;';
      case 'ru': return 'Боль остается в ухе или отдает в висок, челюсть, горло или шею?';
    }
  }

  // 6. Chest / Heart / Thorax
  if (
    text.includes('brust') || text.includes('thorax') || text.includes('herz') || text.includes('rippe') ||
    text.includes('sternum') || text.includes('chest') || text.includes('heart') || text.includes('poitrine') ||
    text.includes('cœur') || text.includes('petto') || text.includes('cuore') || text.includes('θώρακ') ||
    text.includes('груд') || text.includes('сердц')
  ) {
    switch (lang) {
      case 'de': return 'Bleibt der Schmerz punktuell im Brustbereich oder strahlt er in benachbarte Bereiche (linker Arm, Schulter, Rücken, Hals) aus?';
      case 'en': return 'Does the pain stay in the chest or does it radiate into adjacent areas (left arm, shoulder, back, neck)?';
      case 'es': return '¿El dolor se queda en el pecho o se irradia hacia zonas vecinas (brazo izquierdo, hombro, espalda, cuello)?';
      case 'fr': return 'La douleur reste-t-elle dans la poitrine ou irradie-t-elle vers le bras gauche, l\'épaule, le dos ou le cou ?';
      case 'it': return 'Il dolore resta nel torace o si irradia verso braccio sinistro, spalla, schiena o collo?';
      case 'el': return 'Ο πόνος παραμένει στο στήθος ή αντανακλά προς το αριστερό χέρι, τον ώμο, την πλάτη ή τον λαιμό;';
      case 'ru': return 'Боль остается в груди или отдает в соседние зоны (левую руку, плечо, спину, шею)?';
    }
  }

  // 7. Stomach / Epigastrium / Upper Abdomen
  if (
    text.includes('magen') || text.includes('epigastr') || text.includes('oberbauch') || text.includes('sodbrenn') ||
    text.includes('stomach') || text.includes('gastric') || text.includes('estomac') || text.includes('stomaco') ||
    text.includes('στομάχ') || text.includes('желуд')
  ) {
    switch (lang) {
      case 'de': return 'Bleibt der Schmerz punktuell im Magenbereich oder strahlt er in benachbarte Bereiche (Rücken, Brustbein, Rippenbogen) aus?';
      case 'en': return 'Does the pain stay focused in the stomach or does it radiate into adjacent areas (back, sternum, rib margins)?';
      case 'es': return '¿El dolor se queda en el estómago o se irradia hacia la espalda, esternón o costillas?';
      case 'fr': return 'La douleur reste-t-elle à l\'estomac ou irradie-t-elle vers le dos, le sternum ou les côtes ?';
      case 'it': return 'Il dolore resta allo stomaco o si irradia verso schiena, sterno o costole?';
      case 'el': return 'Ο πόνος παραμένει στο στομάχι ή αντανακλά προς την πλάτη, το στέρνο ή τα πλευρά;';
      case 'ru': return 'Боль остается в области желудка или отдает в спину, грудину или подреберье?';
    }
  }

  // 8. Kidney / Flank
  if (
    text.includes('niere') || text.includes('flanke') || text.includes('kidney') || text.includes('rein') ||
    text.includes('rene') || text.includes('νεφρ') || text.includes('почк')
  ) {
    switch (lang) {
      case 'de': return 'Bleibt der Schmerz in der Flanke/Nierengegend oder strahlt er nach vorne/unten in benachbarte Bereiche (Leiste, Blase, Oberschenkel) aus?';
      case 'en': return 'Does the pain stay in the flank/kidney area or does it radiate downward into adjacent areas (groin, bladder, thigh)?';
      case 'es': return '¿El dolor se queda en la zona renal o se irradia hacia la ingle, vejiga o muslo?';
      case 'fr': return 'La douleur reste-t-elle dans la région rénale ou irradie-t-elle vers l\'aine, la vessie ou la cuisse ?';
      case 'it': return 'Il dolore resta nella regione renale o si irradia verso l\'inguine, vescica o coscia?';
      case 'el': return 'Ο πόνος παραμένει στα νεφρά/λαγόνια ή αντανακλά προς τη βουβωνική χώρα, την κύστη ή τον μηρό;';
      case 'ru': return 'Боль остается в области почек/боку или отдает вниз (в пах, мочевой пузырь, бедро)?';
    }
  }

  // 9. Abdomen / Bowel / Belly / Bladder
  if (
    text.includes('bauch') || text.includes('darm') || text.includes('unterbauch') || text.includes('nabel') ||
    text.includes('blase') || text.includes('abdomen') || text.includes('belly') || text.includes('bowel') ||
    text.includes('ventre') || text.includes('addome') || text.includes('κοιλ') || text.includes('живот') || text.includes('кишеч')
  ) {
    switch (lang) {
      case 'de': return 'Bleibt der Schmerz punktuell im Bauch oder strahlt er in benachbarte Bereiche (Rücken, Leiste, Brustraum, Oberschenkel) aus?';
      case 'en': return 'Does the pain stay in one spot in the abdomen or does it radiate into adjacent areas (back, groin, chest, thighs)?';
      case 'es': return '¿El dolor se queda localizado en el abdomen o se irradia hacia la espalda, ingle o muslos?';
      case 'fr': return 'La douleur reste-t-elle dans le ventre ou irradie-t-elle vers le dos, l\'aine ou les cuisses ?';
      case 'it': return 'Il dolore resta nell\'addome o si irradia verso schiena, inguine o cosce?';
      case 'el': return 'Ο πόνος παραμένει στην κοιλιά ή αντανακλά προς την πλάτη, τη βουβωνική χώρα ή τους μηρούς;';
      case 'ru': return 'Боль остается в одной точке живота или отдает в соседние зоны (спину, пах, бедра)?';
    }
  }

  // 10. Back / Lumbar Spine / Sacrum / Sciatica
  if (
    text.includes('rücken') || text.includes('lws') || text.includes('kreuz') || text.includes('lende') ||
    text.includes('ischias') || text.includes('back') || text.includes('lumbar') || text.includes('spine') ||
    text.includes('sciatica') || text.includes('dos') || text.includes('schiena') || text.includes('πλάτη') ||
    text.includes('μέση') || text.includes('спин') || text.includes('поясниц')
  ) {
    switch (lang) {
      case 'de': return 'Bleibt der Schmerz im Rücken oder strahlt er in benachbarte Bereiche (Gesäß, Oberschenkel, Wade, Fuß) aus?';
      case 'en': return 'Does the pain stay in the back or does it radiate into adjacent areas (glutes, thigh, calf, foot)?';
      case 'es': return '¿El dolor se queda en la espalda o se irradia hacia glúteos, muslo, pantorrilla o pie?';
      case 'fr': return 'La douleur reste-t-elle dans le dos ou irradie-t-elle vers la fesse, la cuisse, le mollet ou le pied ?';
      case 'it': return 'Il dolore resta nella schiena o si irradia verso glutei, coscia, polpaccio o piede?';
      case 'el': return 'Ο πόνος παραμένει στη μέση/πλάτη ή αντανακλά προς τους γλουτούς, τον μηρό, τη γάμπα ή το πόδι;';
      case 'ru': return 'Боль остается в спине или отдает в соседние области (ягодицу, бедро, икру, стопу)?';
    }
  }

  // 11. Shoulder / Arm / Elbow / Hand / Fingers
  if (
    text.includes('schulter') || text.includes('arm') || text.includes('ellbogen') || text.includes('hand') ||
    text.includes('finger') || text.includes('shoulder') || text.includes('wrist') || text.includes('épaule') ||
    text.includes('bras') || text.includes('spalla') || text.includes('braccio') || text.includes('ώμ') ||
    text.includes('χέρ') || text.includes('плеч') || text.includes('рук') || text.includes('кист')
  ) {
    switch (lang) {
      case 'de': return 'Bleibt der Schmerz punktuell in der Schulter/im Arm oder strahlt er in benachbarte Bereiche (Nacken, Oberarm, Ellbogen, Finger) aus?';
      case 'en': return 'Does the pain stay in the shoulder/arm or does it radiate into adjacent areas (neck, upper arm, elbow, fingers)?';
      case 'es': return '¿El dolor se queda en el hombro/brazo o se irradia hacia cuello, codo o dedos?';
      case 'fr': return 'La douleur reste-t-elle dans l\'épaule/le bras ou irradie-t-elle vers la nuque, le coude ou les doigts ?';
      case 'it': return 'Il dolore resta nella spalla/braccio o si irradia verso collo, gomito o dita?';
      case 'el': return 'Ο πόνος παραμένει στον ώμο/βραχίονα ή αντανακλά προς τον αυχένα, τον αγκώνα ή τα δάκτυλα;';
      case 'ru': return 'Боль остается в плече/руке или отдает в шею, предплечье, локоть или пальцы?';
    }
  }

  // 12. Hip / Pelvis / Groin
  if (
    text.includes('hüfte') || text.includes('becken') || text.includes('leiste') || text.includes('hip') ||
    text.includes('pelvis') || text.includes('groin') || text.includes('hanche') || text.includes('anca') ||
    text.includes('ισχί') || text.includes('бедρ') || text.includes('таз')
  ) {
    switch (lang) {
      case 'de': return 'Bleibt der Schmerz in der Hüfte/im Becken oder strahlt er in benachbarte Bereiche (Leiste, Gesäß, Oberschenkel, Knie) aus?';
      case 'en': return 'Does the pain stay in the hip/pelvis or does it radiate into adjacent areas (groin, glutes, thigh, knee)?';
      case 'es': return '¿El dolor se queda en la cadera/pelvis o se irradia hacia ingle, glúteo, muslo o rodilla?';
      case 'fr': return 'La douleur reste-t-elle dans la hanche/le bassin ou irradie-t-elle vers l\'aine, la fesse, la cuisse ou le genou ?';
      case 'it': return 'Il dolore resta nell\'anca/bacino o si irradia verso inguine, gluteo, coscia o ginocchio?';
      case 'el': return 'Ο πόνος παραμένει στο ισχίο/λεκάνη ή αντανακλά προς τη βουβωνική χώρα, τον γλουτό, τον μηρό ή το γόνατο;';
      case 'ru': return 'Боль остается в бедре/тазу или отдает в пах, ягодицу, бедро или колено?';
    }
  }

  // 13. Knee / Leg / Calf / Foot / Ankle
  if (
    text.includes('knie') || text.includes('bein') || text.includes('schenkel') || text.includes('fuß') ||
    text.includes('zehe') || text.includes('sprunggelenk') || text.includes('knee') || text.includes('leg') ||
    text.includes('foot') || text.includes('ankle') || text.includes('genou') || text.includes('jambe') ||
    text.includes('pied') || text.includes('ginocchio') || text.includes('gamba') || text.includes('piede') ||
    text.includes('γόνατ') || text.includes('πόδ') || text.includes('колен') || text.includes('ног') || text.includes('стоп')
  ) {
    switch (lang) {
      case 'de': return 'Bleibt der Schmerz punktuell im Knie/Bein oder strahlt er in benachbarte Bereiche (Oberschenkel, Unterschenkel, Wade, Fuß) aus?';
      case 'en': return 'Does the pain stay in the knee/leg or does it radiate into adjacent areas (thigh, lower leg, calf, foot)?';
      case 'es': return '¿El dolor se queda en la rodilla/pierna o se irradia hacia muslo, pantorrilla o pie?';
      case 'fr': return 'La douleur reste-t-elle dans le genou/la jambe ou irradie-t-elle vers la cuisse, le mollet ou le pied ?';
      case 'it': return 'Il dolore resta nel ginocchio/gamba o si irradia verso coscia, polpaccio o piede?';
      case 'el': return 'Ο πόνος παραμένει στο γόνατο/πόδι ή αντανακλά προς τον μηρό, τη γάμπα ή το πέλμα;';
      case 'ru': return 'Боль остается в колене/ноге или отдает в бедро, голень, икру или стопу?';
    }
  }

  // 14. Universal Clean Fallback
  switch (lang) {
    case 'de': return 'Bleibt der Schmerz punktuell an dieser Stelle oder strahlt er in benachbarte Bereiche aus?';
    case 'en': return 'Does the pain stay focused in that spot or does it radiate into adjacent areas?';
    case 'es': return '¿El dolor permanece localizado en ese punto o se irradia hacia zonas adyacentes?';
    case 'fr': return 'La douleur reste-t-elle localisée à cet endroit ou irradie-t-elle vers les zones voisines ?';
    case 'it': return 'Il dolore resta localizzato in quel punto o si irradia verso zone adiacenti?';
    case 'el': return 'Ο πόνος παραμένει εντοπισμένος σε εκείνο το σημείο ή αντανακλά σε γειτονικές περιοχές;';
    case 'ru': return 'Боль остается локализованной в этом месте или иррадиирует в соседние области?';
  }
}

/**
 * Returns movement questions tailored to the affected anatomical region
 */
export function getAdaptiveMotionQuestion(chiefOrLocation: string, lang: LanguageCode): string {
  const text = (chiefOrLocation || '').toLowerCase();
  const isHead = text.includes('kopf') || text.includes('stirn') || text.includes('migrä') || text.includes('head');
  const isKneeOrLeg = text.includes('knie') || text.includes('bein') || text.includes('fuß') || text.includes('knee') || text.includes('leg');
  const isBack = text.includes('rücken') || text.includes('lws') || text.includes('kreuz') || text.includes('back');

  if (isHead) {
    switch (lang) {
      case 'de': return 'Welche konkrete Bewegung verschlimmert es (z. B. Gehen, Treppensteigen, Bücken, Kopfwendung oder Erschütterung)?';
      case 'en': return 'Which specific movement worsens it (e.g. walking, climbing stairs, bending over, turning head, or jarring impact)?';
      case 'es': return '¿Qué movimiento específico lo empeora (caminar, subir escaleras, agacharse, girar la cabeza o sacudidas)?';
      case 'fr': return 'Quel mouvement précis l\'aggrave (marcher, monter les escaliers, se baisser, tourner la tête ou secousses) ?';
      case 'it': return 'Quale movimento specifico lo peggiora (camminare, salire le scale, chinarsi, girare la testa o sobbalzi)?';
      case 'el': return 'Ποια συγκεκριμένη κίνηση επιδεινώνει τον πόνο (περπάτημα, σκύψιμο, στρίψιμο κεφαλιού ή κραδασμοί);';
      case 'ru': return 'Какое движение ухудшает боль (ходьба, наклоны, повороты головы или сотрясение)?';
    }
  }

  if (isKneeOrLeg) {
    switch (lang) {
      case 'de': return 'Welche konkrete Bewegung verschlimmert es (z. B. Gehen, Treppenabsteigen, Aufstehen, Belastung oder Beugen)?';
      case 'en': return 'Which specific movement worsens it (e.g. walking, descending stairs, standing up, weight-bearing, or bending)?';
      case 'es': return '¿Qué movimiento específico lo empeora (caminar, bajar escaleras, levantarse, cargar peso o doblar)?';
      case 'fr': return 'Quel mouvement précis l\'aggrave (marcher, descendre les escaliers, se lever, appui ou flexion) ?';
      case 'it': return 'Quale movimento specifico lo peggiora (camminare, scendere le scale, alzarsi, carico o piegamento)?';
      case 'el': return 'Ποια συγκεκριμένη κίνηση επιδεινώνει τον πόνο (περπάτημα, κατέβασμα σκάλας, έγερση, φόρτιση ή κάμψη);';
      case 'ru': return 'Какое движение ухудшает боль (ходьба, спуск по лестнице, вставание, нагрузка или сгибание)?';
    }
  }

  if (isBack) {
    switch (lang) {
      case 'de': return 'Welche konkrete Bewegung verschlimmert es (z. B. Bücken, Aufrichten, langes Stehen, Sitzen oder erstes Losgehen)?';
      case 'en': return 'Which specific movement worsens it (e.g. bending, straightening up, prolonged standing, sitting, or initial movement)?';
      case 'es': return '¿Qué movimiento específico lo empeora (agacharse, erguirse, estar de pie, sentarse o iniciar la marcha)?';
      case 'fr': return 'Quel mouvement précis l\'aggrave (se baisser, se redresser, station debout, assis ou premier mouvement) ?';
      case 'it': return 'Quale movimento specifico lo peggiora (chinarsi, raddrizzarsi, stare in piedi, sedersi o primo movimento)?';
      case 'el': return 'Ποια συγκεκριμένη κίνηση επιδεινώνει τον πόνο (σκύψιμο, ίσιωμα, ορθοστασία, κάθισμα ή πρώτα βήματα);';
      case 'ru': return 'Какое движение ухудшает боль (наклоны, выпрямление, долгое стояние, сидение или начало ходьбы)?';
    }
  }

  switch (lang) {
    case 'de': return 'Welche konkrete Bewegung verschlimmert es (z. B. Gehen, Bücken, Lagewechsel, Anstrengung oder Erschütterung)?';
    case 'en': return 'Which specific movement worsens it (e.g. walking, bending, change of posture, exertion, or jarring)?';
    case 'es': return '¿Qué movimiento específico lo empeora (caminar, agacharse, cambiar de postura, esfuerzo o sacudidas)?';
    case 'fr': return 'Quel mouvement précis l\'aggrave (marcher, se baisser, changement de posture, effort ou secousses) ?';
    case 'it': return 'Quale movimento specifico lo peggiora (camminare, chinarsi, cambio di posizione, sforzo o sobbalzi)?';
    case 'el': return 'Ποια συγκεκριμένη κίνηση επιδεινώνει τον πόνο (περπάτημα, σκύψιμο, αλλαγή θέσης, κόπωση ή κραδασμοί);';
    case 'ru': return 'Какое движение ухудшает боль (ходьба, наклоны, смена позы, нагрузка или сотрясение)?';
  }
}

/**
 * Returns prioritized adaptive questions specifically for a given pillar,
 * guaranteeing high-quality, complaint-adapted Leitfragen on every step.
 */
export function getAdaptiveQuestionsForPillar(
  symptom: RepertoriumSymptomInput,
  pillar: 'location' | 'sensation' | 'modalities' | 'causa' | 'concomitants' | 'mind',
  history: AnamnesisDialogueStep[],
  lang: LanguageCode,
  modalitySubTab?: 'better' | 'worse'
): AdaptiveQuestionRecommendation[] {
  const chief = symptom.chiefComplaint || symptom.chiefQuote || '';
  const loc = symptom.location || '';
  const sens = symptom.sensation || '';
  const mod = symptom.modalities || '';
  const causa = symptom.causaEvent || '';
  const concom = symptom.concomitants || '';
  const anchor = loc || chief;

  const questions: AdaptiveQuestionRecommendation[] = [];

  if (pillar === 'location') {
    // 1. Complaint-adapted Radiation Question
    questions.push({
      id: 'q-loc-radiation',
      text: getAdaptiveRadiationQuestion(anchor, lang),
      pillar: 'location',
      pillarLabel: lang === 'de' ? 'WO? (Ausstrahlung & Ausdehnung)' : 'WHERE? (Radiation & extent)',
      reason: lang === 'de' ? 'Anatomisch angepasste Prüfung der Ausstrahlung' : 'Anatomically tailored radiation investigation',
      depthLevel: 2
    });

    // 2. Exact Anatomical Site & Laterality
    questions.push({
      id: 'q-loc-exact',
      text: lang === 'de' ? 'Wo genau befindet sich die Beschwerde (welche Seite, Region oder genaue Begrenzung)?'
        : lang === 'en' ? 'Where exactly is the complaint located (which side, region, or boundary)?'
        : lang === 'es' ? '¿Dónde se localiza exactamente la molestia (qué lado, región o límite)?'
        : lang === 'fr' ? 'Où se situe exactement la plainte (quel côté, région ou délimitation) ?'
        : lang === 'it' ? 'Dove si trova esattamente il disturbo (quale lato, regione o confine)?'
        : lang === 'el' ? 'Πού ακριβώς εντοπίζεται η ενόχληση (σε ποια πλευρά, περιοχή ή όριο);'
        : 'Где именно локализуется недомогание (сторона, область или границы)?',
      pillar: 'location',
      pillarLabel: lang === 'de' ? 'WO? (Lokalisation & Seitigkeit)' : 'WHERE? (Exact site & laterality)',
      reason: lang === 'de' ? 'Exakte anatomische Lokalisierung' : 'Exact anatomical localization',
      depthLevel: 1
    });
  } else if (pillar === 'sensation') {
    // Quality question
    questions.push({
      id: 'q-sens-quality',
      text: lang === 'de' ? 'Wie fühlt sich der Schmerz an dieser Stelle genau an (z. B. pochend, stechend, drückend, brennend, ziehend)?'
        : lang === 'en' ? 'How exactly does the pain feel in that location (e.g. throbbing, stitching, pressing, burning, tearing)?'
        : lang === 'es' ? '¿Cómo se siente exactamente el dolor en esa zona (pulsátil, punzante, opresivo, ardiente, tirante)?'
        : lang === 'fr' ? 'Comment se manifeste précisément la douleur à cet endroit (battante, piquante, pressive, brûlante, tiraillante) ?'
        : lang === 'it' ? 'Come si manifesta esattamente il dolore in quella zona (pulsante, pungente, compressivo, bruciante, traente)?'
        : lang === 'el' ? 'Πώς ακριβώς αισθάνεστε τον πόνο σε εκείνο το σημείο (παλμικός, οξύς, πιεστικός, καυστικός, διαξιφιστικός);'
        : 'Как именно ощущается боль в этом месте (пульсирующая, колющая, давящая, жгучая, тянущая)?',
      pillar: 'sensation',
      pillarLabel: lang === 'de' ? 'WAS? (Schmerzcharakter)' : 'WHAT? (Pain quality)',
      reason: lang === 'de' ? 'Charakterisierung der Empfindung am betroffenen Ort' : 'Characterize the sensation',
      depthLevel: 1
    });

    if (sens.toLowerCase().includes('poch') || sens.toLowerCase().includes('puls') || sens.toLowerCase().includes('throb')) {
      questions.push({
        id: 'q-sens-throb-wave',
        text: lang === 'de' ? 'Tritt dieses Pochen dauerhaft gleichmäßig auf oder kommt es in Wellen / Anfällen?'
          : lang === 'en' ? 'Does this throbbing occur constantly or does it come in waves / paroxysms?'
          : lang === 'es' ? '¿Este palpitar ocurre de forma continua o viene en oleadas / paroxismos?'
          : lang === 'fr' ? 'Ce battement est-il constant ou survient-il par vagues / crises ?'
          : lang === 'it' ? 'Questa pulsazione è continua o si manifesta a ondate / accessi?'
          : lang === 'el' ? 'Αυτός ο παλμός είναι συνεχής ή έρχεται κατά κύματα / κρίσεις;'
          : 'Эта пульсация постоянная или нарастает волнами / приступами?',
        pillar: 'sensation',
        pillarLabel: lang === 'de' ? 'WAS? (Rhythmus & Wellen)' : 'WHAT? (Rhythm & waves)',
        reason: lang === 'de' ? 'Vertiefung des Empfindungsrhythmus' : 'Deepening sensation rhythm',
        depthLevel: 2
      });
    }
  } else if (pillar === 'modalities') {
    const qBetter: AdaptiveInvestigationQuestion = {
      id: 'q-mod-better',
      text: lang === 'de' ? 'Was bringt Ihnen spürbare Linderung oder Besserung (>) (z. B. absolute Ruhe, Wärme, Zusammenkrümmen, frische Luft, Schlafen)?'
        : lang === 'en' ? 'What brings noticeable relief or amelioration (>) (e.g. absolute rest, warmth, bending double, fresh air, sleep)?'
        : lang === 'es' ? '¿Qué le aporta alivio o mejoría notable (>) (reposo absoluto, calor, doblarse en dos, aire fresco, dormir)?'
        : lang === 'fr' ? 'Qu\'est-ce qui procure un soulagement ou une amélioration notable (>) (repos absolu, chaleur, plié en deux, air frais, sommeil) ?'
        : lang === 'it' ? 'Cosa procura sollievo o miglioramento sensibile (>) (riposo assoluto, calore, piegarsi in due, aria fresca, sonno)?'
        : lang === 'el' ? 'Τι σας προσφέρει αισθητή ανακούφιση ή βελτίωση (>) (απόλυτη ηρεμία, ζέστη, δίπλωμα στα δύο, καθαρός αέρας, ύπνος);'
        : 'Что приносит ощутимое облегчение или улучшение (>) (полный покой, тепло, согнувшись пополам, свежий воздух, сон)?',
      pillar: 'modalities',
      pillarLabel: lang === 'de' ? 'Besserung (>)' : lang === 'el' ? 'Βελτίωση (>)' : lang === 'es' ? 'Mejoría (>)' : lang === 'fr' ? 'Amélioration (>)' : lang === 'it' ? 'Miglioramento (>)' : lang === 'ru' ? 'Улучшение (>)' : 'Amelioration (>)',
      reason: lang === 'de' ? 'Ermittlung lindernder Faktoren' : 'Relieving factors',
      depthLevel: 1
    };

    const qWorse: AdaptiveInvestigationQuestion = {
      id: 'q-mod-worse',
      text: lang === 'de' ? 'Wodurch verschlimmert sich die Beschwerde spürbar (<) (z. B. geringste Bewegung, Kälteeinwirkung, Erschütterung, nach dem Essen, Berührung)?'
        : lang === 'en' ? 'What noticeably worsens the complaint (<) (e.g. slightest motion, cold, jarring, after eating, light touch)?'
        : lang === 'es' ? '¿Qué empeora notablemente la molestia (<) (el menor movimiento, frío, sacudidas, después de comer, tacto ligero)?'
        : lang === 'fr' ? 'Qu\'est-ce qui aggrave nettement la plainte (<) (le moindre mouvement, le froid, les secousses, après le repas, le toucher) ?'
        : lang === 'it' ? 'Cosa peggiora sensibilmente il disturbo (<) (minimo movimento, freddo, scosse, dopo i pasti, contatto leggero)?'
        : lang === 'el' ? 'Τι επιδεινώνει αισθητά την ενόχληση (<) (παραμικρή κίνηση, κρύο, κραδασμοί, μετά το φαγητό, ελαφρύ άγγιγμα);'
        : 'Что заметно ухудшает состояние (<) (малейшее движение, холод, сотрясение, после еды, легкое прикосновение)?',
      pillar: 'modalities',
      pillarLabel: lang === 'de' ? 'Verschlechterung (<)' : lang === 'el' ? 'Επιδείνωση (<)' : lang === 'es' ? 'Empeoramiento (<)' : lang === 'fr' ? 'Aggravation (<)' : lang === 'it' ? 'Peggioramento (<)' : lang === 'ru' ? 'Ухудшение (<)' : 'Aggravation (<)',
      reason: lang === 'de' ? 'Ermittlung verschlimmernder Einflüsse' : 'Aggravating factors',
      depthLevel: 1
    };

    const qPosture: AdaptiveInvestigationQuestion = {
      id: 'q-mod-better-pos',
      text: lang === 'de' ? 'In welcher Körperhaltung oder Lage fühlen Sie sich deutlich erleichtert (z. B. flach liegen, auf schmerzhafter Seite liegen, Bücken)?'
        : lang === 'en' ? 'In which body posture or position do you feel noticeable relief (e.g. lying flat, lying on painful side, bending forward)?'
        : lang === 'es' ? '¿En qué postura corporal siente alivio (acostado boca arriba, sobre el lado doloroso, erguido)?'
        : lang === 'fr' ? 'Dans quelle posture corporelle ressentez-vous un soulagement (couché à plat, sur le côté douloureux, plié) ?'
        : lang === 'it' ? 'In quale postura corporea avverte sollievo (sdraiato piatto, sul lato dolente, chinato)?'
        : lang === 'el' ? 'Σε ποια στάση του σώματος αισθάνεστε ανακούφιση (ανάσκελα, ξάπλωμα στην επώδυνη πλευρά, σκύψιμο);'
        : 'В какой позе или положении тела наступает облегчение (лежа плашмя, на больной стороне, согнувшись)?',
      pillar: 'modalities',
      pillarLabel: lang === 'de' ? 'Körperhaltung & Lage' : lang === 'el' ? 'Στάση σώματος & Θέση' : lang === 'es' ? 'Postura y posición' : lang === 'fr' ? 'Posture & Position' : lang === 'it' ? 'Postura e posizione' : lang === 'ru' ? 'Поза и положение' : 'Posture & Position',
      reason: lang === 'de' ? 'Entlastende Haltungen erfassen' : 'Posture relief',
      depthLevel: 2
    };

    const qTime: AdaptiveInvestigationQuestion = {
      id: 'q-mod-worse-time',
      text: lang === 'de' ? 'Zu welcher Tages- oder Nachtzeit ist die Beschwerde am stärksten (z. B. morgens beim Aufstehen, nachmittags, nachts um 2–3 Uhr)?'
        : lang === 'en' ? 'At what time of day or night is the complaint most severe (e.g. morning on waking, afternoon, night at 2–3 AM)?'
        : lang === 'es' ? '¿A qué hora del día o de la noche es más intensa la molestia (por la mañana, por la tarde, 2–3 de la madrugada)?'
        : lang === 'fr' ? 'À quel moment de la journée ou de la nuit la douleur est-elle maximale (matin au réveil, après-midi, nuit vers 2h–3h) ?'
        : lang === 'it' ? 'In quale momento del giorno o della notte il disturbo è più intenso (mattino al risveglio, pomeriggio, notte verso le 2–3)?'
        : lang === 'el' ? 'Ποια ώρα της ημέρας ή της νύχτας είναι πιο έντονη η ενόχληση (το πρωί με το ξύπνημα, απόγευμα, νύχτα 2–3 π.μ.);'
        : 'В какое время суток боль сильнее всего (утром при подъеме, днем, ночью около 2–3 часов)?',
      pillar: 'modalities',
      pillarLabel: lang === 'de' ? 'Tageszeit & Rhythmus' : lang === 'el' ? 'Ώρα ημέρας & Ρυθμός' : lang === 'es' ? 'Momento y ritmo' : lang === 'fr' ? 'Moment & Rythme' : lang === 'it' ? 'Orario e ritmo' : lang === 'ru' ? 'Время суток и ритм' : 'Time & Rhythm',
      reason: lang === 'de' ? 'Zeitliche Aggravationsperioden' : 'Time aggravation',
      depthLevel: 2
    };

    if (modalitySubTab === 'better') {
      questions.push(qBetter, qPosture);
    } else if (modalitySubTab === 'worse') {
      questions.push(qWorse, qTime);
    } else {
      questions.push({
        id: 'q-mod-general',
        text: lang === 'de' ? 'Was verschlimmert die Beschwerde spürbar (<) und was verschafft Ihnen spürbare Linderung (>)?'
          : lang === 'en' ? 'What noticeably worsens the complaint (<) and what brings noticeable relief (>)?'
          : lang === 'es' ? '¿Qué empeora notablemente la molestia (<) y qué le proporciona alivio (>)?'
          : lang === 'fr' ? 'Qu\'est-ce qui aggrave nettement la plainte (<) et qu\'est-ce qui apporte un soulagement (>)?'
          : lang === 'it' ? 'Cosa peggiora sensibilmente il disturbo (<) e cosa dona sollievo (>)?'
          : lang === 'el' ? 'Τι επιδεινώνει αισθητά την ενόχληση (<) και τι σας ανακουφίζει (>);'
          : 'Что заметно ухудшает состояние (<), а что приносит ощутимое облегчение (>)?',
        pillar: 'modalities',
        pillarLabel: lang === 'de' ? 'Modalitäten (< / >)' : lang === 'el' ? 'Τροποποιητικοί παράγοντες (< / >)' : lang === 'es' ? 'Modalidades (< / >)' : lang === 'fr' ? 'Modalités (< / >)' : lang === 'it' ? 'Modalità (< / >)' : lang === 'ru' ? 'Модальности (< / >)' : 'Modalities (< / >)',
        reason: lang === 'de' ? 'Bönninghausen-Modalitäten (< / >)' : 'Modalities (< / >)',
        depthLevel: 1
      });
      questions.push(qBetter, qWorse, qPosture, qTime);

      questions.push({
        id: 'q-mod-motion',
        text: getAdaptiveMotionQuestion(anchor, lang),
        pillar: 'modalities',
        pillarLabel: lang === 'de' ? 'Bewegungsmodalität' : lang === 'el' ? 'Επίδραση κίνησης' : lang === 'es' ? 'Modalidad de movimiento' : lang === 'fr' ? 'Modalité de mouvement' : lang === 'it' ? 'Modalità di movimento' : lang === 'ru' ? 'Влияние движения' : 'Movement modality',
        reason: lang === 'de' ? 'Präzisierung der Bewegungseinflüsse' : 'Movement influence evaluation',
        depthLevel: 2
      });

      questions.push({
        id: 'q-mod-temp',
        text: lang === 'de' ? 'Wie reagiert die Beschwerde auf Kälte, Wärme, frische Luft oder ein warmes Zimmer?'
          : lang === 'en' ? 'How does the complaint react to cold, warmth, fresh air, or a warm room?'
          : lang === 'es' ? '¿Cómo reacciona la molestia al frío, calor, aire libre o habitación templada?'
          : lang === 'fr' ? 'Comment la plainte réagit-elle au froid, à la chaleur, à l\'air frais ou à une pièce chaude ?'
          : lang === 'it' ? 'Come reagisce il disturbo a freddo, caldo, aria fresca o stanza riscaldata?'
          : lang === 'el' ? 'Πώς αντιδρά η ενόχληση στο κρύο, τη ζέστη, τον καθαρό αέρα ή ένα ζεστό δωμάτιο;'
          : 'Как недомогание реагирует на холод, тепло, свежий воздух или теплую комнату?',
        pillar: 'modalities',
        pillarLabel: lang === 'de' ? 'Temperatur & Umwelt' : lang === 'el' ? 'Θερμοκρασία & Περιβάλλον' : lang === 'es' ? 'Temperatura y ambiente' : lang === 'fr' ? 'Température et environnement' : lang === 'it' ? 'Temperatura e ambiente' : lang === 'ru' ? 'Температура и среда' : 'Temperature & Environment',
        reason: lang === 'de' ? 'Thermisches Verhalten' : 'Thermal behavior',
        depthLevel: 2
      });
    }
  } else if (pillar === 'causa') {
    questions.push({
      id: 'q-causa-onset',
      text: lang === 'de' ? 'Wann genau begann die Beschwerde und was ging ihr unmittelbar oder am Vortag voraus (z. B. Kälte, Ärger, Überanstrengung)?'
        : lang === 'en' ? 'When exactly did the complaint begin and what preceded it directly or on the previous day (e.g. cold, anger, strain)?'
        : lang === 'es' ? '¿Cuándo comenzó exactamente la molestia y qué la precedió (frío, disgusto, fiesta, sobreesfuerzo)?'
        : lang === 'fr' ? 'Quand la plainte a-t-elle débuté exactement et qu\'est-ce qui l\'a précédée (froid, colère, surmenage) ?'
        : lang === 'it' ? 'Quando è iniziato esattamente il disturbo e cosa lo ha preceduto (freddo, collera, sforzo)?'
        : lang === 'el' ? 'Πότε ακριβώς ξεκίνησε η ενόχληση και τι προηγήθηκε άμεσα (κρύο, θυμός, κούραση);'
        : 'Когда именно началось недомогание и что предшествовало ему накануне (переохлаждение, гнев, переутомление)?',
      pillar: 'causa',
      pillarLabel: lang === 'de' ? 'WODURCH? (Causa / Auslöser)' : 'FROM WHAT? (Causa / Trigger)',
      reason: lang === 'de' ? 'Ermittlung vorausgegangener Ereignisse' : 'Preceding events assessment',
      depthLevel: 1
    });

    questions.push({
      id: 'q-causa-effect',
      text: lang === 'de' ? 'Wie war der genaue zeitliche Zusammenhang und hatten Sie den Eindruck, dass dies die Beschwerde verstärkt (<), gelindert (>) oder nicht beeinflusst hat?'
        : lang === 'en' ? 'What was the exact temporal sequence, and did you feel this worsened (<), eased (>), or had no effect?'
        : lang === 'es' ? '¿Cuál fue la relación temporal exacta y tuvo la impresión de que empeoró (<), mejoró (>) o no afectó?'
        : lang === 'fr' ? 'Quel a été le lien temporel exact et avez-vous eu l\'impression que cela a aggravé (<), soulagé (>) ou rien changé ?'
        : lang === 'it' ? 'Qual è stato l\'esatto nesso temporale e ha avuto l\'impressione che abbia peggiorato (<), alleviato (>) o non abbia influito?'
        : lang === 'el' ? 'Ποια ήταν η χρονική συσχέτιση και είχατε την εντύπωση ότι επιδείνωσε (<), ανακούφισε (>) ή δεν επηρέασε;'
        : 'Какова была точная хронологическая связь и усилило ли это (<), облегчило (>) или не повлияло?',
      pillar: 'causa',
      pillarLabel: lang === 'de' ? 'WODURCH? (Causa-Wirkungsprüfung)' : 'FROM WHAT? (Causality test)',
      reason: lang === 'de' ? 'Methodische Trennung von Zeitbezug und Kausalität' : 'Temporal vs causality distinction',
      depthLevel: 2
    });
  } else if (pillar === 'concomitants') {
    questions.push({
      id: 'q-concom-physical',
      text: lang === 'de' ? 'Welche körperlichen Begleiterscheinungen bemerken Sie (z. B. auffallender Durst oder Durstlosigkeit, Frösteln, Hitzegefühl, Schwitzen, Übelkeit)?'
        : lang === 'en' ? 'What physical accompanying symptoms do you notice (e.g. marked thirst or thirstlessness, chills, heat flushes, sweat, nausea)?'
        : lang === 'es' ? '¿Qué síntomas físicos acompañantes nota (sed intensa o falta de sed, escalofríos, oleadas de calor, sudor, náuseas)?'
        : lang === 'fr' ? 'Quels symptômes physiques concomitants remarquez-vous (soif marquée ou absence de soif, frissons, bouffées de chaleur, sueur, nausées) ?'
        : lang === 'it' ? 'Quali sintomi fisici d\'accompagnamento nota (sete intensa o assenza di sete, brividi, vampate di calore, sudore, nausea)?'
        : lang === 'el' ? 'Ποια σωματικά συνοδά συμπτώματα παρατηρείτε (έντονη δίψα ή έλλειψη δίψας, ρίγη, αίσθημα ζέστης, εφίδρωση, ναυτία);'
        : 'Какие физические сопутствующие симптомы вы замечаете (сильная жажда или отсутствие жажды, озноб, приливы жара, пот, тошнота)?',
      pillar: 'concomitants',
      pillarLabel: lang === 'de' ? 'KÖRPERLICHE BEGLEITSYMPTOME' : 'PHYSICAL CONCOMITANTS',
      reason: lang === 'de' ? 'Körperliche Begleitreaktionen erfassen' : 'Capture physical concomitants',
      depthLevel: 1
    });

    questions.push({
      id: 'q-concom-digestive',
      text: lang === 'de' ? 'Gibt es Veränderungen an Appetit, Geschmack im Mund, Zungenbelag oder Magen-Darm-Funktion während des Zustands?'
        : lang === 'en' ? 'Are there changes in appetite, taste in mouth, tongue coating, or digestive function during this state?'
        : lang === 'es' ? '¿Hay cambios en el apetito, sabor en la boca, saburra lingual o función digestiva durante este estado?'
        : lang === 'fr' ? 'Y a-t-il des modifications de l\'appétit, du goût, de l\'enduit lingual ou du transit digestif pendant cet état ?'
        : lang === 'it' ? 'Ci sono alterazioni di appetito, sapore in bocca, patina linguale o funzione digestiva durante questo stato?'
        : lang === 'el' ? 'Υπάρχουν αλλαγές στην όρεξη, γεύση στο στόμα, επίχρισμα γλώσσας ή πέψη κατά την κατάσταση αυτή;'
        : 'Есть ли изменения аппетита, привкуса во рту, налета на языке или работы желудочно-кишечного тракта?',
      pillar: 'concomitants',
      pillarLabel: lang === 'de' ? 'APPETIT & VERDAUUNG' : 'APPETITE & DIGESTION',
      reason: lang === 'de' ? 'Vegetative Reaktionen vertiefen' : 'Autonomic reactions assessment',
      depthLevel: 2
    });
  } else if (pillar === 'mind') {
    questions.push({
      id: 'q-mind-mood',
      text: lang === 'de' ? 'Wie ist Ihre seelische Verfassung und Stimmung während der Beschwerde (z. B. auffallend ängstlich und ruhelos, reizbar und zornig, weinerlich)?'
        : lang === 'en' ? 'What is your emotional state and mood during the complaint (e.g. anxious and restless, irritable and angry, tearful)?'
        : lang === 'es' ? '¿Cuál es su estado emocional y estado de ánimo durante la molestia (ansioso e inquieto, irritable y colérico, lloroso)?'
        : lang === 'fr' ? 'Quel est votre état émotionnel et votre humeur pendant la plainte (anxieux et agité, irritable et coléreux, larmoyant) ?'
        : lang === 'it' ? 'Qual è il suo stato d\'animo ed emotivo durante il disturbo (ansioso e irrequieto, irritabile e collerico, piagnucoloso)?'
        : lang === 'el' ? 'Ποια είναι η ψυχική σας κατάσταση και διάθεση κατά την ενόχληση (αγχώδης και ανήσυχος, ευερέθιστος και οργισμένος, κλαψιάρης);'
        : 'Каково ваше душевное состояние и настроение (тревожное и беспокойное, раздражительное и гневное, плаксивое)?',
      pillar: 'mind',
      pillarLabel: lang === 'de' ? 'GEMÜT & PSYCHE' : 'MIND & EMOTIONS',
      reason: lang === 'de' ? 'Seelische Grundstimmung erfassen' : 'Capture emotional state',
      depthLevel: 1
    });

    questions.push({
      id: 'q-mind-company',
      text: lang === 'de' ? 'Suchen Sie im Zustand der Beschwerde eher Gesellschaft und Trost oder möchten Sie vollkommen in Ruhe gelassen werden?'
        : lang === 'en' ? 'During the complaint, do you seek company and consolation, or do you prefer to be left completely alone?'
        : lang === 'es' ? 'Durante la molestia, ¿busca compañía y consuelo o prefiere que lo dejen completamente solo?'
        : lang === 'fr' ? 'Pendant la plainte, recherchez-vous de la compagnie et du réconfort ou préférez-vous être laissé seul ?'
        : lang === 'it' ? 'Durante il disturbo cerca compagnia e conforto oppure preferisce essere lasciato solo?'
        : lang === 'el' ? 'Κατά την ενόχληση αναζητάτε παρέα και παρηγοριά ή προτιμάτε να μείνετε εντελώς μόνος;'
        : 'Во время недомогания вы ищете общества и утешения или хотите остаться в полном одиночестве?',
      pillar: 'mind',
      pillarLabel: lang === 'de' ? 'GEMÜT (Sozialverhalten & Trost)' : 'MIND (Social & Consolation)',
      reason: lang === 'de' ? 'Verhalten zu Mitmenschen und Trost' : 'Reactions to consolation',
      depthLevel: 2
    });
  }

  return questions;
}

/**
 * Intelligently suggests the next focused clinical deepening questions
 * based on the 4-pillar model and information needs analysis.
 */
export function generateAdaptiveQuestions(
  symptom: RepertoriumSymptomInput,
  history: AnamnesisDialogueStep[],
  lang: LanguageCode
): AdaptiveQuestionRecommendation[] {
  const recommendations: AdaptiveQuestionRecommendation[] = [];
  const chief = (symptom.chiefComplaint || symptom.chiefQuote || '').toLowerCase();
  const loc = (symptom.location || '').toLowerCase();
  const sens = (symptom.sensation || '').toLowerCase();
  const mod = (symptom.modalities || '').toLowerCase();
  const modWorse = (symptom.modalitiesWorse || '').toLowerCase();
  const modBetter = (symptom.modalitiesBetter || '').toLowerCase();
  const causa = (symptom.causaEvent || '').toLowerCase();
  const concom = (symptom.concomitants || '').toLowerCase();

  // 1. Säule 1: WO? (Lokalisation & Seitigkeit)
  if (!loc) {
    recommendations.push({
      id: 'q-loc-where',
      text: lang === 'de' ? `Wo genau sitzt die Beschwerde und strahlt sie in andere Regionen aus?`
        : lang === 'en' ? `Where exactly is the complaint located and does it radiate to other areas?`
        : lang === 'es' ? `¿Dónde se localiza exactamente la molestia y se irradia a otras zonas?`
        : lang === 'fr' ? `Où se situe précisément la gêne et irradie-t-elle vers d'autres régions ?`
        : lang === 'it' ? `Dove si trova esattamente il disturbo e si irradia in altre regioni?`
        : lang === 'el' ? `Πού ακριβώς εντοπίζεται η ενόχληση και αν αντανακλά κάπου;`
        : `Где именно локализуется жалоба и куда она иррадиирует?`,
      pillar: 'location',
      pillarLabel: lang === 'de' ? '1. WO? (Lokalisation & Seite)' : '1. WHERE? (Location & laterality)',
      reason: lang === 'de' ? 'Anatomische Lokalisation und Seitigkeit erfassen' : 'Capture location & laterality',
      depthLevel: 1
    });
  }

  // 2. Säule 2: WAS? (Empfindung & Schmerzqualität)
  if (!sens) {
    recommendations.push({
      id: 'q-sens-quality',
      text: lang === 'de' ? `Wie fühlt sich der Schmerz an dieser Stelle genau an (z. B. berstend, pochend, stechend, drückend)?`
        : lang === 'en' ? `How exactly does the pain feel in that location (e.g. bursting, throbbing, stitching, pressing)?`
        : lang === 'es' ? `¿Cómo se siente exactamente el dolor en esa zona (como si fuera a estallar, pulsátil, punzante)?`
        : lang === 'fr' ? `Comment se manifeste précisément la douleur à cet endroit (éclatante, battante, piquante, pressive) ?`
        : lang === 'it' ? `Come si manifesta esattamente il dolore in quella zona (esplosivo, pulsante, pungente, compressivo)?`
        : lang === 'el' ? `Πώς ακριβώς αισθάνεστε τον πόνο σε εκείνο το σημείο (διαρρηκτικός, παλμικός, οξύς, πιεστικός);`
        : `Как именно ощущается боль в этом месте (распирающая, пульсирующая, колющая, давящая)?`,
      pillar: 'sensation',
      pillarLabel: lang === 'de' ? '2. WAS? (Empfindung)' : '2. WHAT? (Sensation)',
      reason: lang === 'de' ? 'Charakterisierung der Schmerzempfindung' : 'Characterize the sensation',
      depthLevel: 1
    });
  }

  // 3. Säule 3: WANN / WODURCH? (Modalitäten & Causa)
  if (!modWorse && !modBetter && !mod) {
    recommendations.push({
      id: 'q-mod-general',
      text: lang === 'de' ? `Was verschlimmert die Beschwerde spürbar (<) und was verschafft Ihnen spürbare Linderung (>)?`
        : lang === 'en' ? `What noticeably worsens the complaint (<) and what brings noticeable relief (>)?`
        : lang === 'es' ? `¿Qué empeora notablemente la molestia (<) y qué le proporciona alivio (>)?`
        : lang === 'fr' ? `Qu'est-ce qui aggrave nettement la plainte (<) et qu'est-ce qui apporte un soulagement (>)?`
        : lang === 'it' ? `Cosa peggiora sensibilmente il disturbo (<) e cosa dona sollievo (>)?`
        : lang === 'el' ? `Τι επιδεινώνει αισθητά την ενόχληση (<) και τι σας ανακουφίζει (>);`
        : `Что заметно ухудшает состояние (<), а что приносит ощутимое облегчение (>)?`,
      pillar: 'modalities',
      pillarLabel: lang === 'de' ? '3. WANN / WODURCH? (Modalitäten)' : '3. WHEN / FROM WHAT? (Modalities)',
      reason: lang === 'de' ? 'Klassische Bönninghausen-Modalitäten (< / >)' : 'Classical modalities (< / >)',
      depthLevel: 1
    });
  }

  if (!causa) {
    recommendations.push({
      id: 'q-causa-trigger',
      text: lang === 'de' ? `Wodurch oder nach welchem vorausgehenden Ereignis traten die Beschwerden erstmals auf (z. B. Alkohol, Feier, Kälte, Ärger)?`
        : lang === 'en' ? `What caused or preceded the complaint (e.g. alcohol, celebration, cold, anger)?`
        : lang === 'es' ? `¿A causa de qué o tras qué suceso aparecieron las molestias (alcohol, fiesta, frío, disgusto)?`
        : lang === 'fr' ? `À la suite de quoi ou après quel événement la plainte est-elle apparue (alcool, fête, froid, colère) ?`
        : lang === 'it' ? `A causa di cosa o dopo quale evento sono comparsi i disturbi (alcol, festa, freddo, collera)?`
        : lang === 'el' ? `Από τι ή μετά από ποιο γεγονός εμφανίστηκαν τα συμπτώματα (αλκοόλ, ξενύχτι, κρύο, θυμός);`
        : `От чего или после какого события возникло недомогание (алкоголь, праздник, холод, гнев)?`,
      pillar: 'causa',
      pillarLabel: lang === 'de' ? '3. WANN / WODURCH? (Causa / Auslöser)' : '3. FROM WHAT? (Causa)',
      reason: lang === 'de' ? 'Erfassung des Auslösers' : 'Identify trigger',
      depthLevel: 1
    });
  }

  // 4. Säule 4: WAS NOCH? (Begleitsymptome & Gemüt)
  if (!concom) {
    recommendations.push({
      id: 'q-concom-general',
      text: lang === 'de' ? `Treten zeitgleich weitere Begleitsymptome oder Veränderungen an Gemüt und Stimmung auf (z. B. Ängstlichkeit, Ruhelosigkeit, Durst)?`
        : lang === 'en' ? `Are there accompanying symptoms or emotional changes (e.g. anxiety, restlessness, thirst)?`
        : lang === 'es' ? `¿Aparecen síntomas concomitantes o cambios emocionales (ansiedad, inquietud, sed)?`
        : lang === 'fr' ? `D'autres symptômes concomitants ou émotionnels apparaissent-ils (anxiété, agitation, soif) ?`
        : lang === 'it' ? `Si manifestano sintomi concomitanti o cambiamenti emotivi (ansia, irrequietezza, sete)?`
        : lang === 'el' ? `Εμφανίζονται ταυτόχρονα συνοδά συμπτώματα ή ψυχικές αλλαγές (άγχος, ανησυχία, δίψα);`
        : `Возникают ли одновременно сопутствующие симптомы или изменения настроения (тревога, беспокойство, жажда)?`,
      pillar: 'concomitants',
      pillarLabel: lang === 'de' ? '4. WAS NOCH? (Begleitsymptome)' : '4. WHAT ELSE? (Concomitants)',
      reason: lang === 'de' ? 'Begleitsymptome erfassen' : 'Capture concomitants',
      depthLevel: 1
    });
  }

  return recommendations;
}

export interface AnamnesisInformationNeed {
  pillar: 'location' | 'sensation' | 'modalities' | 'concomitants' | 'causa' | 'mind';
  targetField: string;
  title: string;
  description: string;
  suggestedShortQuestion: string;
  priority: number;
}

export interface AnamnesisNeedsAnalysis {
  knownFacts: {
    label: string;
    value: string;
    pillarName: string;
  }[];
  missingNeeds: AnamnesisInformationNeed[];
  highestPriorityNeed?: AnamnesisInformationNeed;
  nextRecommendedQuestionText: string;
  rationale: string;
}

/**
 * Evaluates what information is strictly known from patient statements
 * and determines which specific piece of information is required next.
 */
export function analyzeAnamnesisInformationNeeds(
  symptom: RepertoriumSymptomInput,
  lang: LanguageCode
): AnamnesisNeedsAnalysis {
  const knownFacts: { label: string; value: string; pillarName: string }[] = [];
  const missingNeeds: AnamnesisInformationNeed[] = [];

  // 1. Known facts analysis
  if (symptom.chiefComplaint?.trim()) {
    knownFacts.push({
      label: lang === 'de' ? 'Hauptbeschwerde (Kernphänomen)' : 'Chief Complaint',
      value: symptom.chiefComplaint.trim(),
      pillarName: lang === 'de' ? 'Einstieg (Keine Säule)' : 'Entry'
    });
  }

  if (symptom.location?.trim()) {
    knownFacts.push({
      label: lang === 'de' ? 'Lokalisation / Seite' : 'Location / Side',
      value: symptom.location.trim(),
      pillarName: lang === 'de' ? 'Säule 1: WO' : 'Pillar 1: WHERE'
    });
  }

  if (symptom.sensation?.trim()) {
    knownFacts.push({
      label: lang === 'de' ? 'Empfindung / Schmerzqualität' : 'Sensation',
      value: symptom.sensation.trim(),
      pillarName: lang === 'de' ? 'Säule 2: WAS' : 'Pillar 2: WHAT'
    });
  }

  if (symptom.causaEvent?.trim()) {
    knownFacts.push({
      label: lang === 'de' ? 'Causa / Auslöser' : 'Causa / Trigger',
      value: symptom.causaEvent.trim(),
      pillarName: lang === 'de' ? 'Säule 3: WANN / WODURCH' : 'Pillar 3: WHEN'
    });
  }

  if (symptom.modalitiesWorse?.trim()) {
    knownFacts.push({
      label: lang === 'de' ? '< Verschlechterung' : '< Aggravation',
      value: symptom.modalitiesWorse.trim(),
      pillarName: lang === 'de' ? 'Säule 3: WANN / WODURCH' : 'Pillar 3: WHEN'
    });
  }

  if (symptom.modalitiesBetter?.trim()) {
    knownFacts.push({
      label: lang === 'de' ? '> Besserung' : '> Amelioration',
      value: symptom.modalitiesBetter.trim(),
      pillarName: lang === 'de' ? 'Säule 3: WANN / WODURCH' : 'Pillar 3: WHEN'
    });
  }

  if (!symptom.modalitiesWorse && !symptom.modalitiesBetter && symptom.modalities?.trim()) {
    knownFacts.push({
      label: lang === 'de' ? 'Modalität (Richtung noch unbestimmt)' : 'Modality (Direction unspecified)',
      value: symptom.modalities.trim(),
      pillarName: lang === 'de' ? 'Säule 3: WANN / WODURCH' : 'Pillar 3: WHEN'
    });
  }

  if (symptom.concomitants?.trim()) {
    knownFacts.push({
      label: lang === 'de' ? 'Begleitsymptome / Gemüt' : 'Concomitants / Mind',
      value: symptom.concomitants.trim(),
      pillarName: lang === 'de' ? 'Säule 4: WAS NOCH' : 'Pillar 4: WHAT ELSE'
    });
  }

  // 2. Missing needs analysis
  if (!symptom.location?.trim()) {
    missingNeeds.push({
      pillar: 'location',
      targetField: 'location',
      title: lang === 'de' ? 'Säule 1 (WO) fehlt' : 'Pillar 1 (WHERE) missing',
      description: lang === 'de' ? 'Genaue anatomische Lokalisation und Seitigkeit sind für die Rubrizierung noch unbestimmt.' : 'Exact anatomical site and laterality missing.',
      suggestedShortQuestion: lang === 'de'
        ? 'Wo genau spüren Sie die Beschwerde (auf welcher Seite oder in welchem Bereich)?'
        : 'Where exactly do you feel the complaint (on which side or region)?',
      priority: 1
    });
  }

  if (!symptom.sensation?.trim()) {
    missingNeeds.push({
      pillar: 'sensation',
      targetField: 'sensation',
      title: lang === 'de' ? 'Säule 2 (WAS) fehlt' : 'Pillar 2 (WHAT) missing',
      description: lang === 'de' ? 'Spezifischer Schmerzcharakter und Empfindung fehlen noch.' : 'Pain sensation and quality missing.',
      suggestedShortQuestion: lang === 'de'
        ? 'Wie fühlt sich der Schmerz an dieser Stelle genau an?'
        : 'How does the pain feel in that exact spot?',
      priority: 2
    });
  }

  // Check modality direction ambiguity
  if (!symptom.modalitiesWorse?.trim() && !symptom.modalitiesBetter?.trim() && symptom.modalities?.trim()) {
    missingNeeds.push({
      pillar: 'modalities',
      targetField: 'modalitiesDirection',
      title: lang === 'de' ? 'Säule 3: Modalitäten-Richtung fehlt' : 'Pillar 3: Modality direction missing',
      description: lang === 'de'
        ? `Für „${symptom.modalities.trim()}“ ist unklar, ob es verschlimmert (<) oder bessert (>). Richtung darf nicht erfunden werden.`
        : `Unclear whether "${symptom.modalities.trim()}" worsens (<) or relieves (>).`,
      suggestedShortQuestion: lang === 'de'
        ? `Bessert ${symptom.modalities.trim()} Ihre Beschwerde oder verschlimmert es diese eher?`
        : `Does ${symptom.modalities.trim()} relieve or worsen your complaint?`,
      priority: 1
    });
  } else if (!symptom.modalitiesWorse?.trim() && !symptom.modalitiesBetter?.trim() && !symptom.modalities?.trim()) {
    missingNeeds.push({
      pillar: 'modalities',
      targetField: 'modalities',
      title: lang === 'de' ? 'Säule 3 (Modalitäten) fehlt' : 'Pillar 3 (Modalities) missing',
      description: lang === 'de' ? 'Verschlimmernde (<) und lindernde (>) Bedingungen sind noch unbestimmt.' : 'Aggravating (<) and relieving (>) modalities missing.',
      suggestedShortQuestion: lang === 'de'
        ? 'Was verschlimmert die Beschwerde spürbar und was verschafft Ihnen Linderung?'
        : 'What noticeably worsens or relieves your complaint?',
      priority: 3
    });
  }

  if (!symptom.causaEvent?.trim()) {
    missingNeeds.push({
      pillar: 'causa',
      targetField: 'causaEvent',
      title: lang === 'de' ? 'Causa / Auslöser fehlt' : 'Causa / Trigger missing',
      description: lang === 'de' ? 'Vorausgehendes Ereignis (z. B. Genussmittel, Kälte, Gemütsbelastung) noch nicht erfasst.' : 'Preceding trigger not yet recorded.',
      suggestedShortQuestion: lang === 'de'
        ? 'Gab es vor Beginn der Beschwerde ein auslösendes Ereignis oder eine besondere Situation?'
        : 'Did a specific event or situation trigger the complaint?',
      priority: 4
    });
  }

  if (!symptom.concomitants?.trim()) {
    missingNeeds.push({
      pillar: 'concomitants',
      targetField: 'concomitants',
      title: lang === 'de' ? 'Körperliche Begleitsymptome fehlen' : 'Physical concomitants missing',
      description: lang === 'de' ? 'Synchrone körperliche Begleitsymptome oder Allgemeinsymptome fehlen noch.' : 'Synchronous physical concomitants missing.',
      suggestedShortQuestion: lang === 'de'
        ? 'Welche körperlichen Begleitsymptome bemerken Sie zeitgleich?'
        : 'What physical accompanying symptoms do you notice simultaneously?',
      priority: 5
    });
  }

  if (!symptom.mind?.trim()) {
    missingNeeds.push({
      pillar: 'mind',
      targetField: 'mind',
      title: lang === 'de' ? 'Gemüt & Psyche fehlt' : 'Mind & Emotions missing',
      description: lang === 'de' ? 'Seelische Verfassung, Stimmung und Verhalten im Leiden sind noch nicht erfasst.' : 'Emotional state and disposition not yet recorded.',
      suggestedShortQuestion: lang === 'de'
        ? 'Wie ist Ihre seelische Verfassung oder Stimmung während der Beschwerde?'
        : 'How is your emotional state or mood during the complaint?',
      priority: 6
    });
  }

  missingNeeds.sort((a, b) => a.priority - b.priority);
  const highest = missingNeeds[0];

  return {
    knownFacts,
    missingNeeds,
    highestPriorityNeed: highest,
    nextRecommendedQuestionText: highest ? highest.suggestedShortQuestion : (lang === 'de' ? 'Alle 4 Säulen sind präzise erhoben.' : 'All 4 pillars are fully recorded.'),
    rationale: highest
      ? (lang === 'de' ? `Bedarfsanalyse: ${highest.description}` : `Needs analysis: ${highest.description}`)
      : (lang === 'de' ? 'Belastbare Datenbasis für alle 4 Säulen vorhanden.' : 'Robust data basis available for all 4 pillars.')
  };
}

/**
 * Reconstructs the canonical Boericke repertory search text from 4 pillars & Causa (Wodurch)
 */
export function buildSynthesizedSymptomText(symptom: RepertoriumSymptomInput): string {
  const parts: string[] = [];
  if (symptom.chiefComplaint?.trim()) parts.push(symptom.chiefComplaint.trim());
  
  if (symptom.causaEvent?.trim()) {
    let causaStr = `Wodurch: ${symptom.causaEvent.trim()}`;
    if (symptom.causaTemporal?.trim()) causaStr += ` (${symptom.causaTemporal.trim()})`;
    if (symptom.causaEffect === 'worse') causaStr += ' <';
    else if (symptom.causaEffect === 'better') causaStr += ' >';
    parts.push(causaStr);
  }

  if (symptom.location?.trim()) parts.push(symptom.location.trim());
  if (symptom.sensation?.trim()) parts.push(symptom.sensation.trim());
  if (symptom.modalities?.trim()) parts.push(symptom.modalities.trim());
  if (symptom.concomitants?.trim()) parts.push(symptom.concomitants.trim());
  if (symptom.mind?.trim() && !symptom.concomitants?.includes(symptom.mind.trim())) {
    parts.push(symptom.mind.trim());
  }

  return parts.join(', ');
}

export interface StructuredOptionItem {
  id: string;
  label: string;
  category?: string;
  direction?: 'worse' | 'better' | 'neutral';
  statusCode?: 'EXPLICIT' | 'UNKNOWN' | 'NOT_OBSERVED' | 'NOT_STATED' | 'UNCLEAR' | 'OTHER';
}

/**
 * Anatomical and clinical relevance filter:
 * Prevents inappropriate organ systems (e.g. skin, warts, hair, brain, bladder, anus)
 * from appearing under abdominal complaints, and vice versa.
 */
function isAnatomicallyRelevantForComplaint(
  pillar: 'location' | 'sensation' | 'modalities' | 'concomitants' | 'causa' | 'mind',
  label: string,
  chiefComplaint: string
): boolean {
  if (!label || label.trim().length < 2) return false;
  const lText = label.toLowerCase();
  const cText = (chiefComplaint || '').toLowerCase();

  // A. GENERAL PILLAR RULE FOR "LOCATION" (WO?):
  // Fluids, systemic vascular tissues, metabolic terms and general categories are NOT anatomical sites or radiation zones.
  if (pillar === 'location') {
    const nonLocationTerms = [
      'blut', 'blood', 'sang', 'sangue', 'αιμα', 'кровь',
      'lymfe', 'lymphe', 'lymph', 'linfa', 'λεμφ', 'лимф',
      'gefäß', 'gefäss', 'vessels', 'vaisseaux', 'vasi', 'αγγει', 'сосуд',
      'kreislauf', 'circulation', 'циркуляц', 'κυκλοφορ',
      'nervensystem', 'nervous system', 'système nerveux', 'sistema nervoso', 'νευρικό σύστημα', 'нервная система',
      'vitalität', 'vitality', 'vitalite', 'vitalita',
      'gewebe', 'tissue', 'tissu', 'tessuto', 'ιστος', 'ткань',
      'zellulär', 'cellular', 'cellulaire', 'клеточн'
    ];
    for (const term of nonLocationTerms) {
      if (cText.includes(term)) continue;
      const regex = new RegExp(`\\b${term}\\b|${term}`, 'i');
      if (regex.test(lText)) {
        return false;
      }
    }
  }

  // B. COMPLAINT-SPECIFIC ANATOMICAL FILTERS:

  // 1. ABDOMEN / MAGEN / DARM / BAUCH
  const isAbdomenComplaint =
    cText.includes('bauch') || cText.includes('magen') || cText.includes('darm') ||
    cText.includes('abdomen') || cText.includes('belly') || cText.includes('ventre') ||
    cText.includes('stomach') || cText.includes('addom') || cText.includes('κοιλ') ||
    cText.includes('στομαχ') || cText.includes('живот') || cText.includes('желуд') ||
    cText.includes('kolik') || cText.includes('colic') || cText.includes('krampf');

  if (isAbdomenComplaint) {
    // Exclude completely unrelated organs/regions
    const forbiddenForAbdomen = [
      // Oral & cephalic structures (Zunge, Mund, etc. never belong into abdomen location)
      'zunge', 'tongue', 'langue', 'lingua', 'γλωσσ', 'язык',
      'mund', 'mouth', 'bouche', 'bocca', 'στομα', 'рот',
      'lippen', 'lippe', 'lips', 'lèvres', 'labbra', 'χειλη', 'губы',
      'zahn', 'zähne', 'teeth', 'tooth', 'dents', 'denti', 'δοντι', 'зубы',
      'gaumen', 'palate', 'palais', 'palato', 'ουρανισκος', 'небо',
      'rachen', 'pharynx', 'throat', 'gorge', 'gola', 'φαρυγγ', 'глотка',
      'mandeln', 'tonsils', 'amygdales', 'tonsille', 'αμυγδαλ', 'миндалины',

      // Head & sensory organs
      'schläfe', 'stirn', 'hinterkopf', 'okziput', 'vertex', 'scheitel',
      'gehirn', 'brain', 'cerveau', 'cervello', 'εγκεφαλ', 'мозг',
      'auge', 'augen', 'eyes', 'yeux', 'occhi', 'ματια', 'глаза',
      'ohr', 'ohren', 'ears', 'oreilles', 'orecchi', 'αυτια', 'уши',
      'nase', 'nose', 'nez', 'naso', 'μυτη', 'нос',

      // Pelvic floor, urogenital & perianal (unless explicitly stated)
      'after', 'anus', 'meatus', 'harnblase', 'blase', 'harnweg', 'urethra',

      // Skin & appendages
      'haut', 'skin', 'peau', 'pelle', 'δερμα', 'кожа',
      'warzen', 'warze', 'warts', 'verrues', 'verruche', 'μυρμηγκι', 'бородавк',
      'haare', 'haar', 'hair', 'cheveux', 'capelli', 'μαλλια', 'волосы',
      'schleimhautgrenzen', 'schleimhaut-grenzen',

      // Extremities and distant joints
      'knie', 'knee', 'genou', 'ginocchio', 'γονατο', 'колено',
      'knöchel', 'ankle', 'cheville', 'caviglia', 'αστραγαλ', 'лодыжк',
      'zehen', 'zehe', 'toes', 'orteils', 'dita dei piedi', 'δαχτυλα ποδιων', 'пальцы ног',
      'finger', 'fingers', 'doigts', 'dita', 'δαχτυλα', 'пальцы рук',
      'extremitäten', 'limbs', 'extremites', 'arti', 'ακρα', 'конечност',
      'hws', 'cervical', 'lunge', 'bronchien', 'bronchia'
    ];

    // Check if the label contains any forbidden terms
    for (const term of forbiddenForAbdomen) {
      // If user specifically asked about e.g. Anus/Hämorrhoiden, do not forbid it
      if (cText.includes(term)) continue;

      // Word-boundary or substring check
      const regex = new RegExp(`\\b${term}\\b|${term}`, 'i');
      if (regex.test(lText)) {
        return false;
      }
    }
  }

  // 2. KOPF / HEAD / MIGRÄNE
  const isHeadComplaint =
    cText.includes('kopf') || cText.includes('head') || cText.includes('tête') ||
    cText.includes('cabeza') || cText.includes('testa') || cText.includes('κεφάλ') ||
    cText.includes('голов') || cText.includes('migräne') || cText.includes('migraine');

  if (isHeadComplaint) {
    const forbiddenForHead = [
      'bauch', 'magen', 'darm', 'abdomen', 'belly', 'after', 'anus', 'harnblase',
      'blase', 'harnweg', 'warzen', 'unterbauch', 'oberbauch', 'nabel', 'knie', 'ferse', 'zehen'
    ];
    for (const term of forbiddenForHead) {
      if (cText.includes(term)) continue;
      const regex = new RegExp(`\\b${term}\\b|${term}`, 'i');
      if (regex.test(lText)) return false;
    }
  }

  // 3. RÜCKEN / BACK / WIRBELSÄULE
  const isBackComplaint =
    cText.includes('rücken') || cText.includes('back') || cText.includes('dos') ||
    cText.includes('schiena') || cText.includes('πλάτη') || cText.includes('спин') ||
    cText.includes('lws') || cText.includes('hws') || cText.includes('bws') || cText.includes('kreuzbein');

  if (isBackComplaint) {
    const forbiddenForBack = [
      'stirn', 'schläfe', 'zahn', 'zähne', 'augen', 'ohren', 'magen', 'darm', 'after', 'anus', 'warzen'
    ];
    for (const term of forbiddenForBack) {
      if (cText.includes(term)) continue;
      const regex = new RegExp(`\\b${term}\\b|${term}`, 'i');
      if (regex.test(lText)) return false;
    }
  }

  return true;
}

/**
 * Extracts specific 4-pillar options from classical Polychrests in Materia Medica
 * matching the patient's chief complaint and domain, strictly filtered by anatomical relevance.
 */
export function getMateriaMedicaPolychrestOptions(
  pillar: 'location' | 'sensation' | 'modalities' | 'concomitants' | 'causa' | 'mind',
  chiefComplaint: string,
  lang: LanguageCode,
  modalitySubTab?: 'better' | 'worse'
): StructuredOptionItem[] {
  const trimmed = (chiefComplaint || '').trim();
  const allRemedies = getLocalizedRemedies(lang);
  const polychrests = allRemedies.filter(r => Boolean(r.isPolychrest || r.ist_polychrest));

  // Find Polychrests whose spheres, indications or keynotes correlate with the complaint
  const normChief = normalizeQuery(trimmed);
  const tokens = normChief.split(/\s+/).filter(w => w.length >= 3);

  const scoredRemedies = polychrests.map(r => {
    let score = 0;
    const textBlob = normalizeQuery(
      [
        ...(r.sphereOfAction || []),
        ...(r.mainIndications || []),
        ...(r.keynotes || []),
        ...(r.searchKeywords || [])
      ].join(' ')
    );
    for (const tok of tokens) {
      if (textBlob.includes(tok)) score += 2;
    }
    return { remedy: r, score };
  });

  // Only take remedies that actually score for this complaint, or fallback to domain remedies
  let relevant = scoredRemedies.filter(sr => sr.score > 0).sort((a, b) => b.score - a.score).map(sr => sr.remedy);
  if (relevant.length === 0) {
    relevant = polychrests.slice(0, 8);
  }

  const items: StructuredOptionItem[] = [];
  const seenLabels = new Set<string>();

  const addOption = (label: string, direction?: 'better' | 'worse') => {
    const clean = label.trim();
    if (!clean || clean.length < 3 || clean.length > 80) return;

    // Strict clinical and anatomical filter: reject unrelated organ systems!
    if (!isAnatomicallyRelevantForComplaint(pillar, clean, trimmed)) {
      return;
    }

    const key = normalizeQuery(clean).slice(0, 35);
    if (!seenLabels.has(key)) {
      seenLabels.add(key);
      items.push({
        id: `poly-${pillar}-${items.length}-${key.slice(0, 10)}`,
        label: clean,
        direction
      });
    }
  };

  for (const rem of relevant.slice(0, 8)) {
    if (pillar === 'modalities') {
      if (modalitySubTab === 'better') {
        for (const m of (rem.modalitiesBetter || [])) {
          addOption(m, 'better');
        }
      } else if (modalitySubTab === 'worse') {
        for (const m of (rem.modalitiesWorse || [])) {
          addOption(m, 'worse');
        }
      } else {
        for (const m of (rem.modalitiesBetter || []).slice(0, 2)) addOption(m, 'better');
        for (const m of (rem.modalitiesWorse || []).slice(0, 2)) addOption(m, 'worse');
      }
    } else if (pillar === 'location') {
      // Split compound sphere entries (e.g. "Harnwege, Blase, Haut" -> individual items)
      for (const sp of (rem.sphereOfAction || [])) {
        const subParts = sp.split(/[,;/+]+/).map(s => s.trim()).filter(Boolean);
        for (const p of subParts) {
          addOption(p);
        }
      }
    } else if (pillar === 'sensation') {
      for (const kn of (rem.keynotes || [])) {
        addOption(kn);
      }
    } else if (pillar === 'concomitants') {
      for (const kn of (rem.keynotes || [])) {
        addOption(kn);
      }
    } else if (pillar === 'causa') {
      if (rem.essence) {
        addOption(rem.essence);
      }
    } else if (pillar === 'mind') {
      if (rem.mindEmotional) {
        addOption(rem.mindEmotional);
      }
    }
    if (items.length >= 8) break;
  }

  return items;
}

/**
 * Returns context-aware structured answer options tailored to the current pillar and question
 * fully localized across all 7 languages (de, en, es, fr, it, el, ru).
 */
export function getStructuredAnswerOptions(
  pillar: 'location' | 'sensation' | 'modalities' | 'concomitants' | 'causa' | 'mind',
  _question: string,
  chiefComplaint: string,
  lang: LanguageCode,
  modalitySubTab?: 'better' | 'worse'
): { options: StructuredOptionItem[]; standardOptions: StructuredOptionItem[] } {
  const chief = (chiefComplaint || '').toLowerCase();
  const isHead = chief.includes('kopf') || chief.includes('head') || chief.includes('tête') || chief.includes('cabeza') || chief.includes('testa') || chief.includes('κεφάλ') || chief.includes('голов') || chief.includes('migräne') || chief.includes('migraine');
  const isAbdomen = chief.includes('bauch') || chief.includes('magen') || chief.includes('darm') || chief.includes('leber') || chief.includes('stomach') || chief.includes('abdomen') || chief.includes('belly') || chief.includes('ventre') || chief.includes('addome') || chief.includes('κοιλ') || chief.includes('στομαχ') || chief.includes('живот') || chief.includes('желуд');
  const isChestOrBack = chief.includes('brust') || chief.includes('rücken') || chief.includes('chest') || chief.includes('back') || chief.includes('poitrine') || chief.includes('dos') || chief.includes('petto') || chief.includes('schiena') || chief.includes('θώρακ') || chief.includes('πλάτη') || chief.includes('груд') || chief.includes('спин');

  const l = (translations: Record<LanguageCode, string>): string => {
    return translations[lang] || translations.de || translations.en;
  };

  let options: StructuredOptionItem[] = [];

  if (pillar === 'location') {
    if (isHead) {
      options = [
        { id: 'loc-temple-r', label: l({ de: 'Rechte Schläfe', en: 'Right temple', es: 'Sien derecha', fr: 'Tempe droite', it: 'Tempia destra', el: 'Δεξιός κρόταφος', ru: 'Правый висок' }) },
        { id: 'loc-temple-l', label: l({ de: 'Linke Schläfe', en: 'Left temple', es: 'Sien izquierda', fr: 'Tempe gauche', it: 'Tempia sinistra', el: 'Αριστερός κρόταφος', ru: 'Левый висок' }) },
        { id: 'loc-forehead', label: l({ de: 'Stirn (mittig)', en: 'Forehead (center)', es: 'Frente (centro)', fr: 'Front (milieu)', it: 'Fronte (centro)', el: 'Μέτωπο (κέντρο)', ru: 'Лоб (по центру)' }) },
        { id: 'loc-forehead-eyes', label: l({ de: 'Über den Augen', en: 'Above the eyes', es: 'Sobre los ojos', fr: 'Au-dessus des yeux', it: 'Sopra gli occhi', el: 'Πάνω από τα μάτια', ru: 'Над глазами' }) },
        { id: 'loc-vertex', label: l({ de: 'Scheitel / Vertex', en: 'Vertex / Crown', es: 'Vértice / Coronilla', fr: 'Sommet du crâne', it: 'Vertice cranico', el: 'Κορυφή κεφαλής', ru: 'Макушка / темя' }) },
        { id: 'loc-occiput', label: l({ de: 'Hinterkopf / Okziput', en: 'Occiput', es: 'Occipucio / Nuca posterior', fr: 'Occiput', it: 'Occipite', el: 'Ινίο / Πίσω μέρος κεφαλής', ru: 'Затылок' }) },
        { id: 'loc-neck', label: l({ de: 'Nacken / HWS', en: 'Neck / Cervical spine', es: 'Nuca / Cuello', fr: 'Nuque / Rachis cervical', it: 'Cervicale / Collo', el: 'Αυχένας / Τράχηλος', ru: 'Шея / затылочная область' }) },
        { id: 'loc-eyes', label: l({ de: 'Tief in den Augen', en: 'Deep in the eyes', es: 'Profundo en los ojos', fr: 'Profondément dans les yeux', it: 'Profondo negli occhi', el: 'Βαθιά μέσα στα μάτια', ru: 'Глубоко в глазах' }) },
        { id: 'loc-whole-head', label: l({ de: 'Ganze Kopfregion (diffus)', en: 'Entire head region (diffuse)', es: 'Toda la cabeza (difuso)', fr: 'Toute la tête (diffus)', it: 'Tutto il capo (diffuso)', el: 'Ολόκληρη η κεφαλή (διάχυτα)', ru: 'Вся голова (диффузно)' }) },
      ];
    } else if (isAbdomen) {
      options = [
        { id: 'loc-epigastrium', label: l({ de: 'Oberbauch mittig / Magengrube', en: 'Epigastrium / Pit of stomach', es: 'Boca del estómago / Epigastrio', fr: 'Épigastre / Creux de l\'estomac', it: 'Bocca dello stomaco / Epigastrio', el: 'Επιγάστριο / Στομάχι', ru: 'Подложечная область / желудок' }) },
        { id: 'loc-upper-r', label: l({ de: 'Rechter Oberbauch (Leber / Galle)', en: 'Right upper quadrant (Liver / Gallbladder)', es: 'Hipocondrio derecho (Hígado / Vesícula)', fr: 'Hypochondre droit (Foie / Vésicule)', it: 'Ipocondrio destro (Fegato / Cistifellea)', el: 'Δεξιό υποχόνδριο (Ήπαρ / Χολή)', ru: 'Правое подреберье (печень / желчный пузырь)' }) },
        { id: 'loc-upper-l', label: l({ de: 'Linker Oberbauch (Milz / Magen)', en: 'Left upper quadrant (Spleen / Stomach)', es: 'Hipocondrio izquierdo (Bazo / Estómago)', fr: 'Hypochondre gauche (Rate / Estomac)', it: 'Ipocondrio sinistro (Milza / Stomaco)', el: 'Αριστερό υποχόνδριο (Σπλήνας / Στόμαχος)', ru: 'Левое подреберье (селезенка / желудок)' }) },
        { id: 'loc-umbilical', label: l({ de: 'Um den Bauchnabel', en: 'Around the navel', es: 'Alrededor del ombligo', fr: 'Autour du nombril', it: 'Intorno all\'ombelico', el: 'Γύρω από τον αφαλό', ru: 'Вокруг пупка' }) },
        { id: 'loc-lower-r', label: l({ de: 'Rechter Unterbauch (Ileozökal)', en: 'Right lower quadrant (Ileocecal)', es: 'Fosa ilíaca derecha', fr: 'Fosse iliaque droite', it: 'Fossa iliaca destra', el: 'Δεξιός λαγόνιος βόθρος (τυφλό)', ru: 'Правая подвздошная область' }) },
        { id: 'loc-lower-l', label: l({ de: 'Linker Unterbauch', en: 'Left lower quadrant', es: 'Fosa ilíaca izquierda', fr: 'Fosse iliaque gauche', it: 'Fossa iliaca sinistra', el: 'Αριστερός λαγόνιος βόθρος', ru: 'Левая подвздошная область' }) },
        { id: 'loc-hypogastrium', label: l({ de: 'Unterbauch mittig (Blasenregion)', en: 'Hypogastrium (Bladder region)', es: 'Hipogastrio (Región vesical)', fr: 'Hypogastre (Région vésicale)', it: 'Ipogastrio (Regione vescicale)', el: 'Υπογάστριο (Περιοχή ουροδόχου)', ru: 'Низ живота (область мочевого пузыря)' }) },
        { id: 'loc-whole-abdomen', label: l({ de: 'Gesamter Bauchraum', en: 'Entire abdomen', es: 'Todo el abdomen', fr: 'Tout l\'abdomen', it: 'Tutto l\'addome', el: 'Ολόκληρη η κοιλιακή χώρα', ru: 'Вся брюшная полость' }) },
      ];
    } else if (isChestOrBack) {
      options = [
        { id: 'loc-lumbar', label: l({ de: 'Lendenwirbelsäule / Kreuzbein', en: 'Lumbar spine / Sacrum', es: 'Columna lumbar / Sacro', fr: 'Rachis lombaire / Sacrum', it: 'Rachide lombare / Sacro', el: 'Οσφυϊκή μοίρα / Ιερό οστούν', ru: 'Поясничный отдел / крестец' }) },
        { id: 'loc-dorsal', label: l({ de: 'Brustwirbelsäule (zwischen Schulterblättern)', en: 'Thoracic spine (between shoulder blades)', es: 'Dorsal (entre omóplatos)', fr: 'Rachis dorsal (entre les omoplates)', it: 'Dorsale (tra le scapole)', el: 'Θωρακική μοίρα (μεταξύ ωμοπλατών)', ru: 'Грудной отдел (между лопатками)' }) },
        { id: 'loc-neck', label: l({ de: 'Nacken / Schultergürtel', en: 'Neck / Shoulder girdle', es: 'Cuello / Hombros', fr: 'Nuque / Épaules', it: 'Collo / Spalle', el: 'Αυχένας / Ώμοι', ru: 'Шея / плечевой пояс' }) },
        { id: 'loc-chest-center', label: l({ de: 'Brustbein / retrosternal', en: 'Sternum / retrosternal', es: 'Esternón / retroesternal', fr: 'Sternum / rétrosternal', it: 'Sterno / retrosternale', el: 'Στέρνο / οπισθοστερνικά', ru: 'Грудина / загрудинно' }) },
        { id: 'loc-chest-r', label: l({ de: 'Rechte Thoraxseite', en: 'Right thorax', es: 'Tórax derecho', fr: 'Thorax droit', it: 'Torace destro', el: 'Δεξιός θώρακας', ru: 'Правая сторона груди' }) },
        { id: 'loc-chest-l', label: l({ de: 'Linke Thoraxseite / Herzregion', en: 'Left thorax / Heart region', es: 'Tórax izquierdo / Región cardíaca', fr: 'Thorax gauche / Région cardiaque', it: 'Torace sinistro / Regione cardiaca', el: 'Αριστερός θώρακας / Καρδιακή περιοχή', ru: 'Левая сторона груди / область сердца' }) },
      ];
    } else {
      options = [
        { id: 'loc-gen-head', label: l({ de: 'Kopf / Stirn / Schläfen', en: 'Head / Forehead / Temples', es: 'Cabeza / Frente / Sienes', fr: 'Tête / Front / Tempes', it: 'Capo / Fronte / Tempie', el: 'Κεφάλι / Μέτωπο / Κρόταφοι', ru: 'Голова / лоб / виски' }) },
        { id: 'loc-gen-neck', label: l({ de: 'Hals / Nacken', en: 'Throat / Neck', es: 'Garganta / Cuello', fr: 'Gorge / Cou', it: 'Gola / Collo', el: 'Λαιμός / Αυχένας', ru: 'Горло / шея' }) },
        { id: 'loc-gen-chest', label: l({ de: 'Brustbereich', en: 'Chest area', es: 'Área del pecho', fr: 'Zone thoracique', it: 'Area toracica', el: 'Θωρακική περιοχή', ru: 'Грудная клетка' }) },
        { id: 'loc-gen-epigastrium', label: l({ de: 'Oberbauch', en: 'Upper abdomen', es: 'Abdomen superior', fr: 'Abdomen supérieur', it: 'Addome superiore', el: 'Άνω κοιλία', ru: 'Верхняя часть живота' }) },
        { id: 'loc-gen-hypogastrium', label: l({ de: 'Unterbauch', en: 'Lower abdomen', es: 'Abdomen inferior', fr: 'Abdomen inférieur', it: 'Addome inferiore', el: 'Κάτω κοιλία', ru: 'Низ живота' }) },
        { id: 'loc-gen-back', label: l({ de: 'Rücken / LWS', en: 'Back / Lumbar', es: 'Espalda / Lumbar', fr: 'Dos / Lombaire', it: 'Schiena / Lombare', el: 'Πλάτη / Μέση', ru: 'Спина / поясница' }) },
        { id: 'loc-gen-limbs-r', label: l({ de: 'Rechte Extremitäten', en: 'Right limbs', es: 'Extremidades derechas', fr: 'Membres droits', it: 'Arti destri', el: 'Δεξιά άκρα', ru: 'Правые конечности' }) },
        { id: 'loc-gen-limbs-l', label: l({ de: 'Linke Extremitäten', en: 'Left limbs', es: 'Extremidades izquierdas', fr: 'Membres gauches', it: 'Arti sinistri', el: 'Αριστερά άκρα', ru: 'Левые конечности' }) },
        { id: 'loc-gen-diffuse', label: l({ de: 'Ganzkörper / diffus', en: 'Whole body / diffuse', es: 'Cuerpo entero / difuso', fr: 'Corps entier / diffus', it: 'Tutto il corpo / diffuso', el: 'Ολόκληρο το σώμα / διάχυτο', ru: 'Все тело / диффузно' }) },
      ];
    }
  } else if (pillar === 'sensation') {
    options = [
      { id: 'sens-stitching', label: l({ de: 'Stechend (wie Nadeln / Messer)', en: 'Stitching (needle/knife)', es: 'Punzante (como agujas / cuchillada)', fr: 'Piquant (aiguille / coup de couteau)', it: 'Pungente (aghi / pugnalata)', el: 'Οξύς / Σαν βελόνες ή μαχαίρι', ru: 'Колющая (как иглы или нож)' }) },
      { id: 'sens-throbbing', label: l({ de: 'Pochend / pulsierend', en: 'Throbbing / pulsating', es: 'Pulsátil / palpitante', fr: 'Battant / pulsatile', it: 'Pulsante / palpitante', el: 'Παλμικός / Σφύζων', ru: 'Пульсирующая / бьющаяся' }) },
      { id: 'sens-pressing', label: l({ de: 'Drückend (von innen oder außen)', en: 'Pressing (from within or outward)', es: 'Opresivo / de presión', fr: 'Pressif / oppressant', it: 'Compressivo / premente', el: 'Πιεστικός / Βάρος', ru: 'Давящая (изнутри или снаружи)' }) },
      { id: 'sens-burning', label: l({ de: 'Brennend (wie Feuer / Glut)', en: 'Burning (like fire / hot coals)', es: 'Ardiente / quemante (como fuego)', fr: 'Brûlant (comme du feu)', it: 'Bruciante (come fuoco)', el: 'Καυστικός / Σαν φωτιά', ru: 'Жгучая (как огонь / угли)' }) },
      { id: 'sens-drawing', label: l({ de: 'Ziehend / spannend', en: 'Drawing / tensive', es: 'Tirante / espasmódico', fr: 'Tiraillant / tendu', it: 'Traente / tensivo', el: 'Διαξιφιστικός / Τραβηχτικός', ru: 'Тянущая / напряженная' }) },
      { id: 'sens-cramping', label: l({ de: 'Krampfartig / kolikartig', en: 'Cramping / colicky', es: 'Cólico / espasmódico', fr: 'Spasmodique / colique', it: 'Crampiforme / colico', el: 'Σπασμωδικός / Κολικοειδής', ru: 'Спастическая / коликообразная' }) },
      { id: 'sens-cutting', label: l({ de: 'Schneidend', en: 'Cutting', es: 'Cortante', fr: 'Coupant', it: 'Tagliente', el: 'Κοφτερός', ru: 'Режущая' }) },
      { id: 'sens-dull', label: l({ de: 'Dumpf / drückend', en: 'Dull / aching', es: 'Sordo / constante', fr: 'Sourd / pesant', it: 'Sordo / pesante', el: 'Αμβλύς / Βουβός', ru: 'Тупая / ноющая' }) },
      { id: 'sens-bruised', label: l({ de: 'Wie zerschlagen / wund', en: 'Bruised / sore', es: 'Magullado / adolorido', fr: 'Courbaturé / meurtri', it: 'Indolenzito / contuso', el: 'Σαν χτυπημένος / επώδυνος', ru: 'Как от ушиба / разбитость' }) },
      { id: 'sens-bursting', label: l({ de: 'Berstend / wie platzend', en: 'Bursting / splitting', es: 'Como si fuera a estallar', fr: 'Éclatant / comme fendu', it: 'Esplosivo / come spezzato', el: 'Διαρρηκτικός / Σαν να σπάει', ru: 'Распирающая / раскалывающая' }) },
      { id: 'sens-numb', label: l({ de: 'Taub / pelzig / kribbelnd', en: 'Numb / tingling', es: 'Entumecido / hormigueo', fr: 'Engourdi / picotements', it: 'Intorpidito / formicolio', el: 'Μούδιασμα / Μυρμήγκιασμα', ru: 'Онемение / покалывание' }) },
      { id: 'sens-tearing', label: l({ de: 'Reißend', en: 'Tearing', es: 'Desgarrante', fr: 'Déchirant', it: 'Lacerante', el: 'Σχιστικός', ru: 'Рвущая' }) },
    ];
  } else if (pillar === 'modalities') {
    if (modalitySubTab === 'better') {
      options = [
        { id: 'mod-rest-better', label: l({ de: 'Absolute Ruhe', en: 'Absolute rest', es: 'Reposo absoluto', fr: 'Repos absolu', it: 'Riposo assoluto', el: 'Απόλυτη ηρεμία', ru: 'Полный покой' }), direction: 'better' },
        { id: 'mod-warmth', label: l({ de: 'Wärme / warme Umschläge', en: 'Warmth / hot wraps', es: 'Calor / compresas calientes', fr: 'Chaleur / compresses chaudes', it: 'Calore / impacchi caldi', el: 'Ζέστη / ζεστά επιθέματα', ru: 'Тепло / теплые компрессы' }), direction: 'better' },
        { id: 'mod-stoop-bend-better', label: l({ de: 'Zusammenkrümmen / Vorneigen', en: 'Bending double / forward', es: 'Doblado en dos / hacia adelante', fr: 'Plié en deux / vers l\'avant', it: 'Piegarsi in due / in avanti', el: 'Δίπλωμα στα δύο / προς τα εμπρός', ru: 'Сгибание пополам / вперед' }), direction: 'better' },
        { id: 'mod-pressure-hard', label: l({ de: 'Starker äußerer Druck / Gegendruck', en: 'Hard external pressure', es: 'Fuerte presión externa', fr: 'Forte pression externe', it: 'Forte pressione esterna', el: 'Έντονη εξωτερική πίεση', ru: 'Сильное внешнее давление' }), direction: 'better' },
        { id: 'mod-fresh-air', label: l({ de: 'Frische Luft / Lüften', en: 'Fresh open air', es: 'Aire libre / ventilación', fr: 'Air frais / aération', it: 'Aria fresca / ventilazione', el: 'Καθαρός αέρας / αερισμός', ru: 'Свежий воздух / проветривание' }), direction: 'better' },
        { id: 'mod-lying-pain-side', label: l({ de: 'Liegen auf der schmerzhaften Seite', en: 'Lying on painful side', es: 'Acostado sobre lado doloroso', fr: 'Couché sur le côté douloureux', it: 'Sdraiato sul lato dolente', el: 'Ξάπλωμα στην επώδυνη πλευρά', ru: 'Лежа на больной стороне' }), direction: 'better' },
        { id: 'mod-lying-painless-side', label: l({ de: 'Liegen auf schmerzfreier Seite', en: 'Lying on painless side', es: 'Acostado sobre lado sano', fr: 'Couché sur le côté sain', it: 'Sdraiato sul lato sano', el: 'Ξάπλωμα στην υγιή πλευρά', ru: 'Лежа на здоровой стороне' }), direction: 'better' },
        { id: 'mod-stretching', label: l({ de: 'Ausstrecken / Aufrichten', en: 'Stretching / Erect posture', es: 'Estirarse / erguirse', fr: 'S\'étirer / se redresser', it: 'Stendersi / raddrizzarsi', el: 'Τέντωμα / όρθια στάση', ru: 'Вытягивание / выпрямление' }), direction: 'better' },
        { id: 'mod-cold-packs', label: l({ de: 'Kälte / kalte Umschläge', en: 'Cold / cold packs', es: 'Frío / compresas frías', fr: 'Froid / compresses froides', it: 'Freddo / impacchi freddi', el: 'Κρύο / κρύα επιθέματα', ru: 'Холод / холодные компрессы' }), direction: 'better' },
        { id: 'mod-dark-sleep', label: l({ de: 'Dunkles Zimmer / Schlafen', en: 'Dark room / Sleep', es: 'Habitación oscura / Dormir', fr: 'Chambre sombre / Sommeil', it: 'Stanza buia / Sonno', el: 'Σκοτεινό δωμάτιο / Ύπνος', ru: 'Темная комната / сон' }), direction: 'better' },
        { id: 'mod-warm-drinks', label: l({ de: 'Warme Getränke / Trinken', en: 'Warm drinks / warm food', es: 'Bebidas calientes', fr: 'Boissons chaudes', it: 'Bevande calde', el: 'Ζεστά ροφήματα', ru: 'Горячие напитки' }), direction: 'better' },
      ];
    } else if (modalitySubTab === 'worse') {
      options = [
        { id: 'mod-motion-worse', label: l({ de: 'Geringste Bewegung / Erschütterung', en: 'Slightest motion / jarring', es: 'El menor movimiento / sacudida', fr: 'Le moindre mouvement / secousse', it: 'Minimo movimento / scossa', el: 'Παραμικρή κίνηση / κραδασμός', ru: 'Малейшее движение / сотрясение' }), direction: 'worse' },
        { id: 'mod-cold-worse', label: l({ de: 'Kälte / kalte Luft / Entblößen', en: 'Cold / cold air / uncovering', es: 'Frío / aire frío / destaparse', fr: 'Froid / air froid / se découvrir', it: 'Freddo / aria fredda / scoprirsi', el: 'Κρύο / κρύος αέρας / ξεσκέπασμα', ru: 'Холод / холодный воздух / раскрывание' }), direction: 'worse' },
        { id: 'mod-stooping-worse', label: l({ de: 'Bücken / Vorbeugen', en: 'Stooping / Bending forward', es: 'Agacharse / inclinarse hacia adelante', fr: 'Se baisser / se pencher en avant', it: 'Chinarsi / piegarsi in avanti', el: 'Σκύψιμο / κλίση εμπρός', ru: 'Наклоны / сгибание вперед' }), direction: 'worse' },
        { id: 'mod-touch-light', label: l({ de: 'Leichte Berührung / Kleidung', en: 'Light touch / tight clothes', es: 'Tacto ligero / ropa ajustada', fr: 'Toucher léger / vêtements serrés', it: 'Tocco leggero / abiti stretti', el: 'Ελαφριά επαφή / στενά ρούχα', ru: 'Легкое прикосновение / одежда' }), direction: 'worse' },
        { id: 'mod-after-eating', label: l({ de: 'Nach dem Essen / schwere Kost', en: 'After eating / heavy food', es: 'Después de comer / comida pesada', fr: 'Après avoir mangé / repas lourd', it: 'Dopo mangiato / cibi pesanti', el: 'Μετά το φαγητό / βαριά γεύματα', ru: 'После еды / тяжелая пища' }), direction: 'worse' },
        { id: 'mod-fasting', label: l({ de: 'Nüchtern / Vor dem Essen', en: 'Fasting / Before eating', es: 'En ayunas / antes de comer', fr: 'À jeun / avant le repas', it: 'A digiuno / prima di mangiare', el: 'Νηστικός / πριν το φαγητό', ru: 'Натощак / до еды' }), direction: 'worse' },
        { id: 'mod-warm-room', label: l({ de: 'Warmes, geschlossenes Zimmer', en: 'Warm, closed room', es: 'Habitación caliente y cerrada', fr: 'Pièce chaude et fermée', it: 'Stanza calda e chiusa', el: 'Ζεστό, κλειστό δωμάτιο', ru: 'Теплая закрытая комната' }), direction: 'worse' },
        { id: 'mod-morning', label: l({ de: 'Morgens beim Erwachen / Aufstehen', en: 'Morning on waking / rising', es: 'Por la mañana al despertar', fr: 'Le matin au réveil / lever', it: 'Al mattino al risveglio', el: 'Το πρωί με το ξύπνημα', ru: 'Утром при пробуждении' }), direction: 'worse' },
        { id: 'mod-evening-bed', label: l({ de: 'Abends im Bett / Bettwärme', en: 'Evening in bed / bed warmth', es: 'Por la noche en la cama / calor de la cama', fr: 'Le soir au lit / chaleur du lit', it: 'La sera a letto / calore del letto', el: 'Το βράδυ στο κρεβάτι / ζέστη κρεβατιού', ru: 'Вечером в постели / тепло постели' }), direction: 'worse' },
        { id: 'mod-night-2-3', label: l({ de: 'Nachts (2:00 – 3:00 Uhr)', en: 'Night (2:00 – 3:00 AM)', es: 'Por la noche (2:00 – 3:00)', fr: 'La nuit (2h00 – 3h00)', it: 'Di notte (2:00 – 3:00)', el: 'Τη νύχτα (2:00 – 3:00 π.μ.)', ru: 'Ночью (2:00 – 3:00)' }), direction: 'worse' },
        { id: 'mod-noise-light', label: l({ de: 'Lärm / helles Licht / Geräusche', en: 'Noise / bright light', es: 'Ruido / luz intensa', fr: 'Bruit / lumière vive', it: 'Rumore / luce intensa', el: 'Θόρυβος / έντονο φως', ru: 'Шум / яркий свет' }), direction: 'worse' },
      ];
    } else {
      options = [
        { id: 'mod-rest-better', label: l({ de: 'Absolute Ruhe', en: 'Absolute rest', es: 'Reposo absoluto', fr: 'Repos absolu', it: 'Riposo assoluto', el: 'Απόλυτη ηρεμία', ru: 'Полный покой' }), direction: 'better' },
        { id: 'mod-motion-worse', label: l({ de: 'Bewegung allgemein', en: 'Motion in general', es: 'Movimiento general', fr: 'Mouvement en général', it: 'Movimento generale', el: 'Κίνηση γενικά', ru: 'Движение в целом' }), direction: 'worse' },
        { id: 'mod-warmth', label: l({ de: 'Wärme / warme Umschläge', en: 'Warmth / hot wraps', es: 'Calor / compresas calientes', fr: 'Chaleur / compresses chaudes', it: 'Calore / impacchi caldi', el: 'Ζέστη / ζεστά επιθέματα', ru: 'Тепло / теплые компрессы' }), direction: 'better' },
        { id: 'mod-cold-worse', label: l({ de: 'Kälte / kalte Luft', en: 'Cold / cold air', es: 'Frío / aire frío', fr: 'Froid / air froid', it: 'Freddo / aria fredda', el: 'Κρύο / κρύος αέρας', ru: 'Холод / холодный воздух' }), direction: 'worse' },
        { id: 'mod-stooping-worse', label: l({ de: 'Bücken / Vorbeugen', en: 'Stooping / Bending forward', es: 'Agacharse', fr: 'Se baisser', it: 'Chinarsi', el: 'Σκύψιμο', ru: 'Наклоны' }), direction: 'worse' },
        { id: 'mod-pressure-hard', label: l({ de: 'Harter äußerer Druck', en: 'Hard external pressure', es: 'Fuerte presión externa', fr: 'Forte pression externe', it: 'Forte pressione esterna', el: 'Έντονη εξωτερική πίεση', ru: 'Сильное внешнее давление' }), direction: 'better' },
        { id: 'mod-fresh-air', label: l({ de: 'Frische Luft / Lüften', en: 'Fresh open air', es: 'Aire libre', fr: 'Air frais', it: 'Aria fresca', el: 'Καθαρός αέρας', ru: 'Свежий воздух' }), direction: 'better' },
        { id: 'mod-after-eating', label: l({ de: 'Nach dem Essen', en: 'After eating', es: 'Después de comer', fr: 'Après avoir mangé', it: 'Dopo mangiato', el: 'Μετά το φαγητό', ru: 'После еды' }), direction: 'worse' },
        { id: 'mod-night-2-3', label: l({ de: 'Nachts (2:00 – 3:00 Uhr)', en: 'Night (2:00 – 3:00 AM)', es: 'Por la noche (2:00 – 3:00)', fr: 'La nuit (2h00 – 3h00)', it: 'Di notte (2:00 – 3:00)', el: 'Τη νύχτα (2:00 – 3:00)', ru: 'Ночью (2:00 – 3:00)' }), direction: 'worse' },
      ];
    }
  } else if (pillar === 'causa') {
    options = [
      { id: 'causa-heavy-meal', label: l({ de: 'Schwere Mahlzeit / fettiges Essen', en: 'Heavy meal / fatty food', es: 'Comida pesada / alimentos grasos', fr: 'Repas lourd / aliments gras', it: 'Pasto pesante / cibi grassi', el: 'Βαρύ γεύμα / λιπαρά φαγητά', ru: 'Тяжелая еда / жирная пища' }) },
      { id: 'causa-alcohol', label: l({ de: 'Alkohol / Feier / Tabak', en: 'Alcohol / party / tobacco', es: 'Alcohol / fiesta / tabaco', fr: 'Alcool / fête / tabac', it: 'Alcol / festa / tabacco', el: 'Αλκοόλ / ξενύχτι / καπνός', ru: 'Алкоголь / праздник / табак' }) },
      { id: 'causa-cold-draft', label: l({ de: 'Kälteeinwirkung / Zugluft', en: 'Exposure to cold / draft', es: 'Exposición al frío / corrientes de aire', fr: 'Exposition au froid / courants d\'air', it: 'Esposizione al freddo / correnti d\'aria', el: 'Έκθεση σε κρύο / ρεύματα αέρα', ru: 'Воздействие холода / сквозняк' }) },
      { id: 'causa-wetness', label: l({ de: 'Durchnässung / Kaltes feuchtes Wetter', en: 'Getting wet / cold damp weather', es: 'Haberse mojado / tiempo húmedo', fr: 'Avoir été trempé / temps humide', it: 'Bagnarsi / tempo freddo umido', el: 'Βρέξιμο / κρύος υγρός καιρός', ru: 'Промокание / сырая погода' }) },
      { id: 'causa-anger', label: l({ de: 'Ärger / Zorn / emotionaler Streit', en: 'Anger / vexation / emotional strife', es: 'Ira / cólera / disgusto emocional', fr: 'Colère / contrariété / conflit émotionnel', it: 'Rabbia / collera / lite emotiva', el: 'Θυμός / οργή / συναισθηματική σύγκρουση', ru: 'Гнев / ссора / эмоциональный стресс' }) },
      { id: 'causa-fright', label: l({ de: 'Schreck / plötzliche Angst', en: 'Fright / sudden fear', es: 'Susto / miedo repentino', fr: 'Frayeur / peur soudaine', it: 'Spavento / paura improvvisa', el: 'Τρόμος / ξαφνικός φόβος', ru: 'Испуг / внезапный страх' }) },
      { id: 'causa-physical-strain', label: l({ de: 'Körperliche Überanstrengung / Heben', en: 'Physical exertion / lifting', es: 'Sobreesfuerzo físico / levantar peso', fr: 'Surmenage physique / soulever des charges', it: 'Sforzo fisico / sollevamento pesi', el: 'Σωματική καταπόνηση / άρση βάρους', ru: 'Физическое перенапряжение / поднятие тяжестей' }) },
      { id: 'causa-injury', label: l({ de: 'Verletzung / Trauma / Prellung', en: 'Injury / trauma / contusion', es: 'Lesión / traumatismo / contusión', fr: 'Blessure / traumatisme / contusion', it: 'Lesione / trauma / contusione', el: 'Τραυματισμός / τραύμα / μώλωπας', ru: 'Травма / ушиб' }) },
      { id: 'causa-sun-heat', label: l({ de: 'Sonnenhitze / Überhitzung', en: 'Sun heat / overheating', es: 'Calor solar / sobrecalentamiento', fr: 'Chaleur solaire / coup de chaud', it: 'Calore solare / surriscaldamento', el: 'Ηλιακή ζέστη / υπερθέρμανση', ru: 'Солнечный жар / перегрев' }) },
      { id: 'causa-sleep-deprivation', label: l({ de: 'Schlafmangel / geistige Nachtarbeit', en: 'Sleep deprivation / night work', es: 'Falta de sueño / trasnochar', fr: 'Manque de sommeil / travail de nuit', it: 'Mancanza di sonno / lavoro notturno', el: 'Έλλειψη ύπνου / νυχτερινή εργασία', ru: 'Недосыпание / ночная работа' }) },
      { id: 'causa-infection', label: l({ de: 'Infekt / Erkältungsvorstufe', en: 'Infection / cold onset', es: 'Infección / inicio de resfriado', fr: 'Infection / début de rhume', it: 'Infezione / esordio di raffreddore', el: 'Λοίμωξη / πρόδρομος κρυολογήματος', ru: 'Инфекция / простуда' }) },
      { id: 'causa-medication', label: l({ de: 'Medikamenteneinnahme', en: 'Medication intake', es: 'Toma de medicamentos', fr: 'Prise de médicaments', it: 'Assunzione di farmaci', el: 'Λήψη φαρμάκων', ru: 'Прием лекарств' }) },
      { id: 'causa-no-event', label: l({ de: 'Kein erinnerliches Ereignis', en: 'No memorable event', es: 'Sin evento recordable', fr: 'Aucun événement mémorable', it: 'Nessun evento memorabile', el: 'Κανένα αξιοσημείωτο γεγονός', ru: 'Без видимой причины' }) },
    ];
  } else if (pillar === 'concomitants') {
    options = [
      { id: 'con-thirst-large', label: l({ de: 'Großer Durst auf kaltes Wasser', en: 'Great thirst for cold water', es: 'Gran sed de agua fría', fr: 'Grande soif d\'eau froide', it: 'Grande sete di acqua fredda', el: 'Έντονη δίψα για κρύο νερό', ru: 'Сильная жажда холодной воды' }) },
      { id: 'con-thirstless', label: l({ de: 'Völlige Durstlosigkeit', en: 'Complete thirstlessness', es: 'Ausencia total de sed', fr: 'Absence totale de soif', it: 'Assenza totale di sete', el: 'Πλήρης έλλειψη δίψας', ru: 'Полное отсутствие жажды' }) },
      { id: 'con-chills', label: l({ de: 'Frösteln trotz warmer Kleidung', en: 'Chilly despite warm clothes', es: 'Escalofríos a pesar del abrigo', fr: 'Frissons malgré vêtements chauds', it: 'Brividi nonostante vestiti caldi', el: 'Ρίγος παρά τα ζεστά ρούχα', ru: 'Озноб, несмотря на теплую одежду' }) },
      { id: 'con-heat-sweat', label: l({ de: 'Hitzegefühl mit Schweißausbrüchen', en: 'Heat with bursts of sweat', es: 'Calor con accesos de sudor', fr: 'Chaleur avec bouffées de sueur', it: 'Calore con scatti di sudore', el: 'Αίσθημα ζέστης με εφιδρώσεις', ru: 'Приливы жара с приступами пота' }) },
      { id: 'con-nausea', label: l({ de: 'Übelkeit / Ekel vor Gerüchen', en: 'Nausea / aversion to food odors', es: 'Náuseas / aversión a olores de comida', fr: 'Nausées / dégoût des odeurs de cuisine', it: 'Nausea / avversione agli odori di cibo', el: 'Ναυτία / αποστροφή σε μυρωδιές φαγητού', ru: 'Тошнота / отвращение к запахам' }) },
      { id: 'con-vertigo', label: l({ de: 'Schwindel beim Aufrichten', en: 'Vertigo upon rising', es: 'Vértigo al incorporarse', fr: 'Vertige en se levant', it: 'Vertigini nell\'alzarsi', el: 'Ίλιγγος στο σήκωμα', ru: 'Головокружение при подъеме' }) },
      { id: 'con-bitter-taste', label: l({ de: 'Bitterer Geschmack im Mund', en: 'Bitter taste in mouth', es: 'Sabor amargo en la boca', fr: 'Goût amer dans la bouche', it: 'Gusto amaro in bocca', el: 'Πικρή γεύση στο στόμα', ru: 'Горький привкус во рту' }) },
      { id: 'con-tongue-coated', label: l({ de: 'Dick belegte Zunge', en: 'Thickly coated tongue', es: 'Lengua con saburra gruesa', fr: 'Langue très chargée', it: 'Lingua patinosa', el: 'Έντονα επιχρισμένη γλώσσα', ru: 'Сильно обложенный язык' }) },
      { id: 'con-insomnia', label: l({ de: 'Schlaflosigkeit trotz Müdigkeit', en: 'Sleeplessness despite fatigue', es: 'Insomnio a pesar del cansancio', fr: 'Insomnie malgré la fatigue', it: 'Insonnia nonostante la stanchezza', el: 'Αϋπνία παρά την κούραση', ru: 'Бессонница, несмотря на усталость' }) },
    ];
  } else if (pillar === 'mind') {
    options = [
      { id: 'mind-anxiety-restless', label: l({ de: 'Große Angst & Ruhelosigkeit (Todesfurcht)', en: 'Great anxiety & restlessness (fear of death)', es: 'Gran ansiedad e inquietud (miedo a morir)', fr: 'Grande anxiété et agitation (peur de la mort)', it: 'Forte ansia e irrequietezza (paura della morte)', el: 'Έντονο άγχος & ανησυχία (φόβος θανάτου)', ru: 'Сильная тревога и беспокойство (страх смерти)' }) },
      { id: 'mind-irritability', label: l({ de: 'Ausgeprägte Reizbarkeit / Zorn & Ärger', en: 'Marked irritability / anger & rage', es: 'Marcada irritabilidad / cólera e ira', fr: 'Irritabilité marquée / colère et rage', it: 'Marcata irritabilità / collera e rabbia', el: 'Έντονος εκνευρισμός / θυμός και οργή', ru: 'Выраженная раздражительность / гнев' }) },
      { id: 'mind-weeping-consolation', label: l({ de: 'Weinerlichkeit / Suche nach Trost', en: 'Weeping / seeks consolation', es: 'Llantos frecuentes / busca consuelo', fr: 'Larmes faciles / recherche de consolation', it: 'Pianto facile / cerca consolazione', el: 'Κλάμα εύκολο / αναζητά παρηγοριά', ru: 'Плаксивость / ищет утешения' }) },
      { id: 'mind-aversion-consolation', label: l({ de: 'Abneigung gegen Trost / Möchte allein sein', en: 'Aversion to consolation / wants to be alone', es: 'Aversión al consuelo / desea estar solo', fr: 'Aversion pour la consolation / veut être seul', it: 'Avversione alla consolazione / vuole stare solo', el: 'Απέχθεια για παρηγοριά / θέλει να είναι μόνος', ru: 'Неприязнь к утешению / хочет быть один' }) },
      { id: 'mind-apathy', label: l({ de: 'Apathie / Gleichgültigkeit / Wortkargheit', en: 'Apathy / indifference / taciturn', es: 'Apatía / indiferencia / taciturno', fr: 'Apathie / indifférence / taciturne', it: 'Apatia / indifferenza / taciturno', el: 'Απάθεια / αδιαφορία / λιγομίλητος', ru: 'Апатия / безразличие / молчаливость' }) },
      { id: 'mind-despair', label: l({ de: 'Verzweiflung an Genesung / Pessimismus', en: 'Despair of recovery / pessimism', es: 'Desesperación de curarse / pesimismo', fr: 'Désespoir de guérir / pessimisme', it: 'Disperazione di guarire / pessimismo', el: 'Απελπισία για ανάρρωση / απαισιοδοξία', ru: 'Отчаяние в выздоровлении / пессимизм' }) },
      { id: 'mind-fright-startle', label: l({ de: 'Schreckhaftigkeit bei geringstem Geräusch', en: 'Startled easily at slightest noise', es: 'Sobresalto fácil con el menor ruido', fr: 'Sursaute facilement au moindre bruit', it: 'Spavento facile al minimo rumore', el: 'Τρομάζει εύκολα με τον παραμικρό θόρυβο', ru: 'Вздрагивает от малейшего звука' }) },
    ];
  }

  const standardOptions: StructuredOptionItem[] = [
    { id: 'std-unknown', label: l({ de: 'Weiß ich nicht', en: "I don't know", es: 'No lo sé', fr: 'Je ne sais pas', it: 'Non lo so', el: 'Δεν γνωρίζω', ru: 'Не знаю' }), statusCode: 'UNKNOWN' },
    { id: 'std-not-observed', label: l({ de: 'Nicht beobachtet', en: 'Not observed', es: 'No observado', fr: 'Non observé', it: 'Non osservato', el: 'Δεν έχει παρατηρηθεί', ru: 'Не наблюдалось' }), statusCode: 'NOT_OBSERVED' },
    { id: 'std-not-stated', label: l({ de: 'Nicht angegeben', en: 'Not stated', es: 'No indicado', fr: 'Non mentionné', it: 'Non specificato', el: 'Δεν αναφέρεται', ru: 'Не указано' }), statusCode: 'NOT_STATED' },
    { id: 'std-unclear', label: l({ de: 'Keine eindeutige Zuordnung', en: 'No clear assignment', es: 'Sin asignación clara', fr: 'Pas d\'attribution claire', it: 'Nessuna attribuzione chiara', el: 'Χωρίς σαφή κατηγοριοποίηση', ru: 'Нет четкой классификации' }), statusCode: 'UNCLEAR' },
    { id: 'std-other', label: l({ de: 'Andere', en: 'Other', es: 'Otro', fr: 'Autre', it: 'Altro', el: 'Άλλο', ru: 'Другое' }), statusCode: 'OTHER' },
  ];

  const polychrestOptions = getMateriaMedicaPolychrestOptions(
    pillar,
    chiefComplaint,
    lang,
    modalitySubTab
  );

  const mergedOptions: StructuredOptionItem[] = [];
  const seenLabels = new Set<string>();

  // Prioritize primary domain-specific options first, followed by relevant Materia Medica suggestions
  for (const item of [...options, ...polychrestOptions]) {
    if (!isAnatomicallyRelevantForComplaint(pillar, item.label, chiefComplaint)) {
      continue;
    }
    const key = normalizeQuery(item.label).slice(0, 30);
    if (!seenLabels.has(key)) {
      seenLabels.add(key);
      mergedOptions.push(item);
    }
  }

  return { options: mergedOptions, standardOptions };
}

export interface StatementAiAnalysis {
  informationDomain: string;
  triggerOrQuality: string;
  direction: 'worse' | 'better' | 'neutral';
  status: 'explicit' | 'denied' | 'unknown' | 'not_observed' | 'not_stated' | 'unclear';
  source: string;
  certainty: 'high' | 'medium' | 'caution';
  noGeneralizationNotice: string;
}

/**
 * Analyzes patient statement strictly without unwarranted generalizations
 */
export function analyzePatientStatement(
  pillar: 'location' | 'sensation' | 'modalities' | 'concomitants' | 'causa' | 'mind',
  statement: string,
  selectedOptionLabel?: string,
  lang: LanguageCode = 'de'
): StatementAiAnalysis {
  const text = (statement || selectedOptionLabel || '').trim();
  const lower = text.toLowerCase();

  let domain = lang === 'de' ? 'Modalität' : 'Modality';
  if (pillar === 'location') domain = lang === 'de' ? 'Lokalisation (WO?)' : 'Location (WHERE?)';
  if (pillar === 'sensation') domain = lang === 'de' ? 'Empfindung (WAS?)' : 'Sensation (WHAT?)';
  if (pillar === 'causa') domain = lang === 'de' ? 'Causa / Auslöser (WODURCH?)' : 'Causa / Trigger';
  if (pillar === 'concomitants') domain = lang === 'de' ? 'Begleiterscheinung (WAS NOCH?)' : 'Concomitant (WHAT ELSE?)';
  if (pillar === 'mind') domain = lang === 'de' ? 'Gemüt & Psyche' : 'Mind & Emotions';

  let direction: 'worse' | 'better' | 'neutral' = 'neutral';
  if (lower.includes('schlimm') || lower.includes('worse') || lower.includes('<') || lower.includes('verstärk') || lower.includes('peor')) {
    direction = 'worse';
  } else if (lower.includes('besser') || lower.includes('better') || lower.includes('>') || lower.includes('linder') || lower.includes('hilft') || lower.includes('mejor')) {
    direction = 'better';
  }

  let status: 'explicit' | 'denied' | 'unknown' | 'not_observed' | 'not_stated' | 'unclear' = 'explicit';
  if (lower.includes('weiß nicht') || lower.includes('unknown') || lower.includes("don't know")) status = 'unknown';
  else if (lower.includes('nicht beobachtet') || lower.includes('not observed')) status = 'not_observed';
  else if (lower.includes('nicht angegeben') || lower.includes('not stated')) status = 'not_stated';
  else if (lower.includes('keinesfalls') || lower.includes('nein') || lower.includes('gar nicht') || lower.includes('denied')) status = 'denied';

  let trigger = text;
  if (selectedOptionLabel && (!statement || statement.length < 3)) {
    trigger = selectedOptionLabel;
  }

  const certainty: 'high' | 'medium' | 'caution' = statement.trim().length > 5 ? 'high' : 'medium';

  const noGenNotice = lang === 'de'
    ? `Wichtig: Die Aussage bezieht sich strikt auf "${trigger}". Keine automatische Ableitung auf Allgemeinzustand oder entgegengesetzte Bedingungen.`
    : `Important: The statement applies strictly to "${trigger}". No automatic generalization to other states or opposites.`;

  return {
    informationDomain: domain,
    triggerOrQuality: trigger || (lang === 'de' ? 'Nicht spezifiziert' : 'Unspecified'),
    direction,
    status,
    source: statement.trim().length > 0 ? (lang === 'de' ? 'Originalaussage des Patienten' : "Patient's original quote") : (lang === 'de' ? 'Strukturierte Auswahlhilfe' : 'Structured selection guide'),
    certainty,
    noGeneralizationNotice: noGenNotice
  };
}

/**
 * Checks a therapist's custom question for suggestiveness and repertorial value
 */
export function evaluateTherapistQuestion(
  questionText: string,
  targetPillar: 'location' | 'sensation' | 'modalities' | 'concomitants' | 'causa' | 'mind',
  lang: LanguageCode = 'de'
): {
  target: string;
  suggestivity: 'low' | 'medium' | 'high';
  suggestivityAdvice?: string;
  repertoryRelevance: 'likely' | 'possible' | 'unclear';
} {
  const q = questionText.toLowerCase();

  // Target identification
  let target = lang === 'de' ? 'Modalität (< / >)' : 'Modality (< / >)';
  if (targetPillar === 'location') target = lang === 'de' ? 'Lokalisation & Anatomie' : 'Localization & Anatomy';
  if (targetPillar === 'sensation') target = lang === 'de' ? 'Empfindung & Qualität' : 'Sensation & Quality';
  if (targetPillar === 'causa') target = lang === 'de' ? 'Causa & Auslösendes Ereignis' : 'Causa & Triggering Event';
  if (targetPillar === 'concomitants') target = lang === 'de' ? 'Begleiterscheinung & Allgemeines' : 'Concomitants & Generalities';
  if (targetPillar === 'mind') target = lang === 'de' ? 'Gemüt & Emotionale Verfassung' : 'Mind & Emotional State';

  // Suggestivity detection: Does it ask "Ist es stechend?" (yes/no leading) vs "Wie fühlt es sich an?"
  let suggestivity: 'low' | 'medium' | 'high' = 'low';
  let advice: string | undefined;

  const isLeadingYesNo = q.startsWith('ist ') || q.startsWith('haben sie ') || q.startsWith('tut es ') || q.startsWith('wird es ') || q.startsWith('is ') || q.startsWith('do you ');
  const containsSpecificQuality = q.includes('stechend') || q.includes('brennend') || q.includes('rechts') || q.includes('stitching') || q.includes('burning');

  if (isLeadingYesNo && containsSpecificQuality) {
    suggestivity = 'high';
    advice = lang === 'de' 
      ? `Frage führt den Patienten möglicherweise („Ist es ...?“). Empfohlene neutrale Variante: „Wie genau fühlt sich die Empfindung für Sie an?“`
      : `Question may lead the patient. Neutral alternative: "How exactly does the sensation feel to you?"`;
  } else if (isLeadingYesNo) {
    suggestivity = 'medium';
    advice = lang === 'de'
      ? `Bevorzugen Sie offene W-Fragen („Was“, „Wo“, „Wie“, „Wann“) statt geschlossener Ja/Nein-Fragen.`
      : `Prefer open W-questions ("What", "Where", "How", "When") rather than closed yes/no queries.`;
  }

  // Repertory relevance
  let repertoryRelevance: 'likely' | 'possible' | 'unclear' = 'possible';
  if (q.includes('wie') || q.includes('wann') || q.includes('wo') || q.includes('besser') || q.includes('schlimm') || q.includes('how') || q.includes('when') || q.includes('where')) {
    repertoryRelevance = 'likely';
  }

  return {
    target,
    suggestivity,
    suggestivityAdvice: advice,
    repertoryRelevance
  };
}

/**
 * Returns dynamic micro-deepening questions after an answer was given
 */
export function generateFollowUpDeepenings(
  pillar: 'location' | 'sensation' | 'modalities' | 'concomitants' | 'causa' | 'mind',
  patientAnswer: string,
  lang: LanguageCode
): string[] {
  const ans = patientAnswer.toLowerCase();
  const questions: string[] = [];

  if (pillar === 'modalities') {
    if (ans.includes('wärme') || ans.includes('warm') || ans.includes('heat')) {
      questions.push(
        lang === 'de' ? 'Wie genau beeinflusst Wärme die Beschwerden?' : 'How exactly does warmth affect the complaints?',
        lang === 'de' ? 'Wie schnell tritt die Besserung / Veränderung ein?' : 'How quickly does relief / change set in?',
        lang === 'de' ? 'Welche Art von Wärme hilft (trockene Wärme, Wärmflasche, warmes Zimmer)?' : 'What kind of warmth helps (dry heat, hot water bottle, warm room)?'
      );
    } else if (ans.includes('bück') || ans.includes('vorbeug') || ans.includes('stoop')) {
      questions.push(
        lang === 'de' ? 'Verschlimmert nur das Vorbeugen oder auch das Wiederaufrichten?' : 'Does only bending forward worsen it, or also straightening up?',
        lang === 'de' ? 'Macht tiefes Einatmen beim Bücken einen Unterschied?' : 'Does deep breathing while stooping make a difference?'
      );
    } else if (ans.includes('beweg') || ans.includes('motion')) {
      questions.push(
        lang === 'de' ? 'Ist der erste Beginn der Bewegung am schlimmsten oder fortgesetzte Bewegung?' : 'Is the first onset of motion worst, or continued motion?',
        lang === 'de' ? 'Bessert sich etwas nach längerem Gehen?' : 'Does prolonged walking bring any relief?'
      );
    }
  } else if (pillar === 'sensation') {
    if (ans.includes('poch') || ans.includes('puls') || ans.includes('throb')) {
      questions.push(
        lang === 'de' ? 'Synchronisiert sich das Pochen mit dem Herzschlag?' : 'Does the throbbing synchronize with the heartbeat?',
        lang === 'de' ? 'Wird das Pochen durch Bücken oder Husten heftiger?' : 'Does the throbbing intensify upon stooping or coughing?'
      );
    } else if (ans.includes('stech') || ans.includes('stitch')) {
      questions.push(
        lang === 'de' ? 'Bleibt der Stich an einem punktuellen Ort oder schießt er weg?' : 'Does the stitch remain in one focal point or does it shoot away?',
        lang === 'de' ? 'Behindert der Stich das Einatmen?' : 'Does the stitch impede deep inhalation?'
      );
    }
  } else if (pillar === 'causa') {
    questions.push(
      lang === 'de' ? 'Wie viele Stunden nach dem Ereignis traten die ersten Symptome auf?' : 'How many hours after the event did the first symptoms emerge?',
      lang === 'de' ? 'Haben Sie seither ähnliche Situationen erlebt, die dieselbe Beschwerde auslösten?' : 'Have you experienced similar situations since that triggered the same complaint?'
    );
  } else if (pillar === 'mind') {
    questions.push(
      lang === 'de' ? 'Wie wirkt sich Gesellschaft oder Alleinsein auf Ihre Stimmung aus?' : 'How does company or being alone affect your mood?',
      lang === 'de' ? 'Bemerken Sie bestimmte Tageszeiten, an denen Ängste oder Reizbarkeit zunehmen?' : 'Do you notice specific times of day when anxiety or irritability increases?'
    );
  }

  return questions;
}
