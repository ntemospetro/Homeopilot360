import { LanguageCode } from '../types';
import { MATERIA_MEDICA_ENTRIES, LocalizedRemedy, getLocalizedRemedy } from './materiaMedicaData';
import { ALLEN_KEYNOTES_DATA } from './allenKeynotesData';
import { BOGER_SYNOPTIC_KEY_DATA } from './bogerSynopticData';

export interface AuthorDataSource {
  authorId: string;
  authorName: string;
  getRemedyContributions: (queryTokens: string[], lang: LanguageCode) => AuthorRemedyMatch[];
}

export interface AuthorRemedyMatch {
  remedyId: string;
  remedyName: string;
  score: number;
  locations: string[];
  sensations: string[];
  modalitiesBetter: string[];
  modalitiesWorse: string[];
  concomitants: string[];
  mindEmotions: string[];
}

export interface DomainQuestionSet {
  domainKey: string;
  keywords: string[];
  pillar1LocationQuestions: Record<LanguageCode, { text: string; hint: string }>;
  pillar2SensationQuestions: Record<LanguageCode, { text: string; hint: string }>;
  pillar3ModalityQuestions: Record<LanguageCode, { text: string; hint: string }>;
  pillar4ConcomitantQuestions: Record<LanguageCode, { text: string; hint: string }>;
  mindQuestions: Record<LanguageCode, { text: string; hint: string }>;
}

// Extensible Registry for all Materia Medica Authors (Hahnemann, Boericke, Kent, Allen, Boger, and any future authors)
const registeredAuthors: AuthorDataSource[] = [];

export function registerAuthorDataSource(source: AuthorDataSource) {
  const exists = registeredAuthors.some(a => a.authorId === source.authorId);
  if (!exists) {
    registeredAuthors.push(source);
  }
}

// 1. Core Materia Medica Entries Provider (Boericke, Kent, Hahnemann Polychrests)
const coreMateriaMedicaAuthor: AuthorDataSource = {
  authorId: 'core_polychrests',
  authorName: 'Hahnemann, Kent & Boericke Core Materia Medica',
  getRemedyContributions: (queryTokens: string[], lang: LanguageCode): AuthorRemedyMatch[] => {
    const matches: AuthorRemedyMatch[] = [];
    if (!queryTokens.length) return matches;

    for (const entry of MATERIA_MEDICA_ENTRIES) {
      const loc = getLocalizedRemedy(entry, lang);
      if (!loc) continue;

      let score = 0;
      const allText = [
        loc.commonName,
        loc.origin,
        loc.essence,
        ...(loc.sphereOfAction || []),
        ...(loc.keynotes || []),
        ...(loc.modalitiesWorse || []),
        ...(loc.modalitiesBetter || []),
        loc.mindEmotional || '',
        ...(loc.mainIndications || []),
        ...(loc.searchKeywords || [])
      ].join(' ').toLowerCase();

      for (const token of queryTokens) {
        if (allText.includes(token)) {
          score += 3;
        }
      }

      if (score > 0) {
        matches.push({
          remedyId: entry.id,
          remedyName: entry.latinName,
          score,
          locations: loc.sphereOfAction || [],
          sensations: loc.keynotes?.slice(0, 3) || [],
          modalitiesBetter: loc.modalitiesBetter || [],
          modalitiesWorse: loc.modalitiesWorse || [],
          concomitants: loc.keynotes?.slice(0, 4) || [],
          mindEmotions: loc.mindEmotional ? [loc.mindEmotional] : []
        });
      }
    }
    return matches.sort((a, b) => b.score - a.score);
  }
};
registerAuthorDataSource(coreMateriaMedicaAuthor);

// 2. Allen's Keynotes Provider
const allenKeynotesAuthor: AuthorDataSource = {
  authorId: 'allen_keynotes',
  authorName: "Allen's Keynotes of Leading Remedies",
  getRemedyContributions: (queryTokens: string[], _lang: LanguageCode): AuthorRemedyMatch[] => {
    const matches: AuthorRemedyMatch[] = [];
    if (!queryTokens.length) return matches;

    for (const item of Object.values(ALLEN_KEYNOTES_DATA)) {
      const text = [
        item.title,
        ...(item.keynotes || []),
        ...(item.modalitiesWorse || []),
        ...(item.modalitiesBetter || [])
      ].join(' ').toLowerCase();

      let score = 0;
      for (const token of queryTokens) {
        if (text.includes(token)) score += 2;
      }

      if (score > 0) {
        matches.push({
          remedyId: item.remedyId,
          remedyName: item.title,
          score,
          locations: [],
          sensations: item.keynotes?.slice(0, 2) || [],
          modalitiesBetter: item.modalitiesBetter || [],
          modalitiesWorse: item.modalitiesWorse || [],
          concomitants: item.keynotes?.slice(2, 4) || [],
          mindEmotions: []
        });
      }
    }
    return matches.sort((a, b) => b.score - a.score);
  }
};
registerAuthorDataSource(allenKeynotesAuthor);

// 3. Boger Synoptic Key Provider
const bogerAuthor: AuthorDataSource = {
  authorId: 'boger_synoptic',
  authorName: "C.M. Boger's Synoptic Key",
  getRemedyContributions: (queryTokens: string[], _lang: LanguageCode): AuthorRemedyMatch[] => {
    const matches: AuthorRemedyMatch[] = [];
    if (!queryTokens.length) return matches;

    for (const item of Object.values(BOGER_SYNOPTIC_KEY_DATA)) {
      const text = [
        item.latinName,
        item.region || '',
        ...(item.worse || []),
        ...(item.better || []),
        ...(item.highlights || [])
      ].join(' ').toLowerCase();

      let score = 0;
      for (const token of queryTokens) {
        if (text.includes(token)) score += 2;
      }

      if (score > 0) {
        matches.push({
          remedyId: item.remedyId,
          remedyName: item.latinName,
          score,
          locations: item.region ? [item.region] : [],
          sensations: item.highlights?.slice(0, 2) || [],
          modalitiesBetter: item.better || [],
          modalitiesWorse: item.worse || [],
          concomitants: item.highlights?.slice(2, 4) || [],
          mindEmotions: []
        });
      }
    }
    return matches.sort((a, b) => b.score - a.score);
  }
};
registerAuthorDataSource(bogerAuthor);

/**
 * Clean & tokenize user input into searching stems (handling German compounds like Bauchschmerzen -> bauch, schmerz)
 */
export function extractMateriaMedicaQueryTokens(input: string): string[] {
  const norm = (input || '').toLowerCase()
    .replace(/[.,;!?()]/g, ' ')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .trim();

  const words = norm.split(/\s+/).filter(w => w.length >= 3);
  const stems = new Set<string>();

  for (const w of words) {
    stems.add(w);
    // Decomposition for medical compound words
    if (w.includes('bauch')) { stems.add('bauch'); stems.add('magen'); stems.add('leber'); stems.add('darm'); }
    if (w.includes('magen')) { stems.add('magen'); stems.add('epigastr'); stems.add('bauch'); }
    if (w.includes('kopf')) { stems.add('kopf'); stems.add('stirn'); stems.add('schlaefe'); stems.add('hinterkopf'); }
    if (w.includes('hals')) { stems.add('hals'); stems.add('kehle'); stems.add('rachen'); stems.add('schluck'); }
    if (w.includes('rueck') || w.includes('ruck')) { stems.add('rueck'); stems.add('kreuz'); stems.add('lws'); stems.add('wirbel'); }
    if (w.includes('hust')) { stems.add('hust'); stems.add('bronch'); stems.add('lunge'); stems.add('auswurf'); }
    if (w.includes('brust')) { stems.add('brust'); stems.add('thorax'); stems.add('herz'); stems.add('lunge'); }
    if (w.includes('schwind')) { stems.add('schwind'); stems.add('vertigo'); stems.add('taumel'); }
    if (w.includes('ohren') || w.includes('ohr')) { stems.add('ohr'); stems.add('gehoer'); stems.add('tinnitus'); }
    if (w.includes('auge')) { stems.add('auge'); stems.add('seh'); stems.add('traenen'); }
    if (w.includes('gelenk')) { stems.add('gelenk'); stems.add('rheum'); stems.add('knie'); stems.add('schulter'); }
    if (w.includes('haut')) { stems.add('haut'); stems.add('juck'); stems.add('ekzem'); stems.add('ausschlag'); }
    if (w.includes('schlaf')) { stems.add('schlaf'); stems.add('traum'); stems.add('unruhe'); stems.add('erwach'); }
    if (w.includes('harndrang') || w.includes('blase')) { stems.add('blase'); stems.add('urin'); stems.add('harn'); }
    if (w.includes('fieber')) { stems.add('fieber'); stems.add('frost'); stems.add('schwitz'); stems.add('hitze'); }
  }

  return Array.from(stems);
}

/**
 * Searches across all registered classical authors to aggregate top matching remedies and differential criteria
 */
export function queryMateriaMedicaAuthors(complaintText: string, lang: LanguageCode = 'de'): AuthorRemedyMatch[] {
  const tokens = extractMateriaMedicaQueryTokens(complaintText);
  if (!tokens.length) return [];

  const combinedMap = new Map<string, AuthorRemedyMatch>();

  for (const author of registeredAuthors) {
    try {
      const results = author.getRemedyContributions(tokens, lang);
      for (const res of results) {
        const existing = combinedMap.get(res.remedyId);
        if (existing) {
          existing.score += res.score;
          existing.locations = Array.from(new Set([...existing.locations, ...res.locations])).slice(0, 6);
          existing.sensations = Array.from(new Set([...existing.sensations, ...res.sensations])).slice(0, 6);
          existing.modalitiesBetter = Array.from(new Set([...existing.modalitiesBetter, ...res.modalitiesBetter])).slice(0, 6);
          existing.modalitiesWorse = Array.from(new Set([...existing.modalitiesWorse, ...res.modalitiesWorse])).slice(0, 6);
          existing.concomitants = Array.from(new Set([...existing.concomitants, ...res.concomitants])).slice(0, 6);
          existing.mindEmotions = Array.from(new Set([...existing.mindEmotions, ...res.mindEmotions])).slice(0, 6);
        } else {
          combinedMap.set(res.remedyId, { ...res });
        }
      }
    } catch {
      // Continue safely with other authors
    }
  }

  return Array.from(combinedMap.values()).sort((a, b) => b.score - a.score);
}

/**
 * Specialized Clinical Domain Questions mapped to the Materia Medica symptom pools
 */
export const DOMAIN_QUESTION_SETS: Record<string, DomainQuestionSet> = {
  abdomen: {
    domainKey: 'abdomen',
    keywords: ['bauch', 'magen', 'stomach', 'belly', 'abdomen', 'ventre', 'pancia', 'addom', 'κοιλια', 'στομαχ', 'живот', 'желудок', 'krampf', 'blaeh', 'kolik', 'colic'],
    pillar1LocationQuestions: {
      de: { text: "Wo im Bauchraum ist der Schmerz genau lokalisiert (z. B. Magengrube/Oberbauch, um den Bauchnabel, rechter Unterbauch oder ganzer Bauch aufgebläht)?", hint: "Wichtig zur Differenzierung zwischen Nux vomica, Colocynthis, Belladonna, Lycopodium." },
      en: { text: "Where exactly in the abdomen is the pain centered (e.g. pit of stomach, around the navel, lower right abdomen, or whole abdomen bloated)?", hint: "Essential to differentiate between Nux vomica, Colocynthis, Belladonna, Lycopodium." },
      es: { text: "¿En qué parte exacta del abdomen se localiza el dolor (boca del estómago, ombligo, fosa ilíaca derecha o abdomen distendido)?", hint: "Clave para diferenciar entre Nux vomica, Colocynthis, Belladonna, Lycopodium." },
      fr: { text: "Où précisément dans l'abdomen la douleur est-elle localisée (creux de l'estomac, nombril, bas-ventre droit ou ballonnement généralisé) ?", hint: "Crucial pour différencier Nux vomica, Colocynthis, Belladonna, Lycopodium." },
      it: { text: "In quale punto esatto dell'addome è localizzato il dolore (bocca dello stomaco, attorno all'ombelico, fossa iliaca destra o pancia gonfia)?", hint: "Fondamentale per differenziare tra Nux vomica, Colocynthis, Belladonna, Lycopodium." },
      el: { text: "Πού ακριβώς στην κοιλιά εντοπίζεται ο πόνος (στομάχι/επιγάστριο, γύρω από τον ομφαλό, δεξιό κάτω μέρος ή γενικό φούσκωμα);", hint: "Κρίσιμο για διαφοροποίηση μεταξύ Nux vomica, Colocynthis, Belladonna, Lycopodium." },
      ru: { text: "Где именно в животе локализуется боль (под ложечкой/в желудке, вокруг пупка, внизу справа или вздут весь живот)?", hint: "Важно для дифференциации Nux vomica, Colocynthis, Belladonna, Lycopodium." }
    },
    pillar2SensationQuestions: {
      de: { text: "Welcher Schmerzcharakter beschreibt Ihre Bauchbeschwerden am besten (z. B. krampfartig zusammenziehend, stechend, brennend wie Feuer oder Völlegefühl wie ein Stein)?", hint: "Colocynthis & Mag-p = heftige Krämpfe; Arsenicum = brennend; Bryonia = stechend; Nux-v = Druck." },
      en: { text: "Which sensation best characterizes your abdominal pain (e.g. violent cramping, sharp stitching, burning like fire, or heaviness like a stone)?", hint: "Colocynthis/Mag-p = cramping; Arsenicum = burning; Bryonia = stitching; Nux-v = stone-like pressure." },
      es: { text: "¿Qué sensación describe mejor el dolor abdominal (calambres espasmódicos, punzadas, ardor como fuego o pesadez como una piedra)?", hint: "Colocynthis/Mag-p = calambres; Arsenicum = ardor; Bryonia = punzante." },
      fr: { text: "Quelle sensation décrit le mieux vos maux de ventre (crampes violentes, piqûres aiguës, brûlures intenses ou sensation de pierre pesante) ?", hint: "Colocynthis/Mag-p = crampes; Arsenicum = brûlures; Bryonia = piqûres." },
      it: { text: "Quale sensazione descrive meglio il dolore addominale (crampi spasmodici, fitte pungenti, bruciore come fuoco o pesantezza come una pietra)?", hint: "Colocynthis/Mag-p = crampi; Arsenicum = bruciore; Bryonia = fitte." },
      el: { text: "Ποια αίσθηση περιγράφει καλύτερα τον κοιλιακό πόνο (σπασμοί, τσουξίματα/διαξιφιστικός πόνος, κάψιμο σαν φωτιά ή βάρος σαν πέτρα);", hint: "Colocynthis/Mag-p = σπασμοί, Arsenicum = κάψιμο, Bryonia = σουβλιές." },
      ru: { text: "Какое ощущение точнее всего описывает боль в животе (схваткообразные спазмы, колющая боль, жжение как от огня или тяжесть как камень)?", hint: "Colocynthis/Mag-p = спазмы; Arsenicum = жжение; Bryonia = колющая." }
    },
    pillar3ModalityQuestions: {
      de: { text: "Wodurch bessern oder verschlimmern sich die Bauchschmerzen (z. B. besser durch festen Druck & Zusammenkrümmen, Wärme, Abgehen von Gasen – oder schlechter durch jede Bewegung/Berührung)?", hint: "Colocynthis = besser durch festen Druck & Doppelbiegen; Belladonna = unerträglich bei geringster Erschütterung." },
      en: { text: "What relieves or aggravates the abdominal pain (e.g. relief from firm pressure & bending double, warmth, passing gas – or worse from slightest motion/touch)?", hint: "Colocynthis = better bending double & pressure; Belladonna = worse slightest touch/jarring." },
      es: { text: "¿Qué alivia o empeora el dolor abdominal (mejora al doblarse en dos y presión fuerte, calor, expulsar gases – o empeora al menor roce)?", hint: "Colocynthis = mejora doblado en dos; Belladonna = intolerancia al roce." },
      fr: { text: "Qu'est-ce qui soulage ou aggrave la douleur abdominale (mieux en se pliant en deux et pression forte, chaleur, gaz – ou pire au moindre frôlement) ?", hint: "Colocynthis = soulagé plié en deux; Belladonna = intolérance au toucher." },
      it: { text: "Cosa allevia o aggrava i dolori addominali (migliora piegandosi in due e premendo forte, col calore – o peggiora al minimo contatto)?", hint: "Colocynthis = migliora piegandosi in due; Belladonna = intolleranza al contatto." },
      el: { text: "Τι ανακουφίζει ή επιδεινώνει τον κοιλιακό πόνο (καλύτερα διπλώνοντας στα δύο και με δυνατή πίεση, ζέστη – ή χειρότερα με το παραμικρό άγγιγμα);", hint: "Colocynthis = καλύτερα διπλώνοντας στα δύο; Belladonna = χειρότερα με άγγιγμα." },
      ru: { text: "Что облегчает или ухудшает боли в животе (лучше согнувшись пополам и от сильного давления, от тепла – или хуже от малейшего прикосновения)?", hint: "Colocynthis = облегчение согнувшись пополам и при давлении; Belladonna = хуже от прикосновения." }
    },
    pillar4ConcomitantQuestions: {
      de: { text: "Gibt es einen Auslöser (z. B. Ärger, Kälteeinwirkung, Diätfehler, schweres Essen) oder Begleitsymptome (Übelkeit, bitterer Geschmack, Schüttelfrost)?", hint: "Chamomilla/Colocynthis = nach Ärger/Zorn; Nux vomica = nach Diätfehlern & Stimulanzien; Pulsatilla = nach fettem Essen." },
      en: { text: "Is there a trigger (e.g. anger, exposure to cold, dietary indiscretion, rich food) or concomitants (nausea, bitter taste, chills)?", hint: "Chamomilla/Colocynthis = after anger; Nux vomica = dietary indiscretion/coffee/alcohol; Pulsatilla = rich/fatty food." },
      es: { text: "¿Hay un desencadenante (enojo, frío, exceso alimentario) o síntomas asociados (náuseas, sabor amargo, escalofríos)?", hint: "Chamomilla/Colocynthis = tras cólera; Nux vomica = excesos; Pulsatilla = comidas grasas." },
      fr: { text: "Y a-t-il un facteur déclenchant (colère, coup de froid, excès alimentaire) ou des symptômes associés (nausées, goût amer, frissons) ?", hint: "Chamomilla/Colocynthis = colère; Nux vomica = excès; Pulsatilla = aliments gras." },
      it: { text: "C'è una causa scatenante (arrabbiatura, freddo, eccessi alimentari) o sintomi concomitanti (nausea, sapore amaro, brividi)?", hint: "Chamomilla/Colocynthis = collera; Nux vomica = eccessi; Pulsatilla = cibi grassi." },
      el: { text: "Υπάρχει κάποιο αίτιο (θυμός, κρυολόγημα, βαριά γεύματα) ή συνοδά συμπτώματα (ναυτία, πικρή γεύση, ρίγη);", hint: "Chamomilla/Colocynthis = θυμός; Nux vomica = υπερφαγία/διεγερτικά; Pulsatilla = λιπαρά." },
      ru: { text: "Был ли провоцирующий фактор (гнев, переохлаждение, погрешность в еде) или спутники (тошнота, горечь во рту, озноб)?", hint: "Chamomilla/Colocynthis = после гнева; Nux vomica = переедание/кофе/алкоголь; Pulsatilla = жирная пища." }
    },
    mindQuestions: {
      de: { text: "Wie ist die seelische Verfassung während der Bauchschmerzen (z. B. extrem gereizt & ungeduldig, ängstlich-unruhig, weinerlich oder will seine Ruhe)?", hint: "Nux-v/Chamomilla = aufbrausend & zornig; Arsenicum = Todesangst & Unruhe; Pulsatilla = sanft & weinerlich." },
      en: { text: "What is your mental state during the abdominal pain (e.g. extremely irritable & impatient, anxious-restless, tearful, or wanting quiet)?", hint: "Nux-v/Chamomilla = angry & irritable; Arsenicum = severe anxiety & restlessness; Pulsatilla = weeping & mild." },
      es: { text: "¿Cuál es el estado de ánimo durante el dolor (extremadamente irritable, inquieto con ansiedad, lloroso o desea tranquilidad)?", hint: "Nux-v/Chamomilla = ira e impaciencia; Arsenicum = angustia e inquietud; Pulsatilla = llorosa." },
      fr: { text: "Quel est votre état d'esprit pendant la crise (extrêmement irritable, anxieux et agité, larmoyant ou besoin de calme absolu) ?", hint: "Nux-v/Chamomilla = irritable/colère; Arsenicum = grande angoisse; Pulsatilla = larmoyant." },
      it: { text: "Qual è lo stato emotivo durante i dolori addominali (molto irritabile e impaziente, ansioso-irrequieto, piagnucoloso o cerca pace)?", hint: "Nux-v/Chamomilla = collerico; Arsenicum = ansia e irrequietezza; Pulsatilla = bisognoso di conforto." },
      el: { text: "Ποια είναι η ψυχική σας διάθεση κατά τον πόνο (έντονα ευερέθιστος/ανυπόμονος, ανήσυχος με φόβο, κλαψιάρης ή θέλει ησυχία);", hint: "Nux-v/Chamomilla = οργή/ανυπομονησία; Arsenicum = ανησυχία & φόβος θανάτου; Pulsatilla = ανάγκη για παρηγοριά." },
      ru: { text: "Каково душевное состояние во время боли (крайне раздражителен и нетерпелив, тревожен и беспокоен, плаксив или хочет покоя)?", hint: "Nux-v/Chamomilla = гнев и раздражение; Arsenicum = страх и беспокойство; Pulsatilla = кроткий, плачет." }
    }
  },
  head: {
    domainKey: 'head',
    keywords: ['kopf', 'head', 'tete', 'tête', 'cabeza', 'testa', 'κεφαλ', 'голов', 'migraen', 'migraine', 'stirn', 'schlaefe'],
    pillar1LocationQuestions: {
      de: { text: "An welcher Stelle des Kopfes sitzt der Hauptschmerz (z. B. Stirn, über einem Auge, Schläfen, Scheitel oder Hinterkopf bis in den Nacken)?", hint: "Belladonna = Stirn & Schläfen; Gelsemium/Silicea = Hinterkopf in Stirn; Spigelia = links über dem Auge; Sanguinaria = rechts." },
      en: { text: "Where on the head is the main pain located (e.g. forehead, over one eye, temples, vertex, or occiput extending down into neck)?", hint: "Belladonna = forehead/temples; Gelsemium = occiput to forehead; Spigelia = left eye; Sanguinaria = right side." },
      es: { text: "¿En qué zona de la cabeza se ubica el dolor principal (frente, sobre un ojo, sienes, coronilla o nuca irradiando hacia adelante)?", hint: "Belladonna = frente/sienes; Spigelia = ojo izquierdo; Sanguinaria = lado derecho." },
      fr: { text: "À quel endroit précis de la tête la douleur siège-t-elle (front, au-dessus d'un œil, tempes, sommet du crâne ou occiput irradiant dans le cou) ?", hint: "Belladonna = front/tempes; Spigelia = œil gauche; Sanguinaria = côté droit." },
      it: { text: "In quale punto della testa è localizzato il dolore (fronte, sopra un occhio, tempie, vertice o nuca che irradia in avanti)?", hint: "Belladonna = fronte e tempie; Spigelia = occhio sinistro; Sanguinaria = lato destro." },
      el: { text: "Σε ποιο σημείο του κεφαλιού εστιάζεται ο κύριος πόνος (μέτωπο, πάνω από το ένα μάτι, κρόταφοι, κορυφή ή ινίο/αυχένας);", hint: "Belladonna = μέτωπο/κρόταφοι; Spigelia = αριστερό μάτι; Sanguinaria = δεξιά." },
      ru: { text: "В какой части головы сосредоточена основная боль (лоб, над одним глазом, виски, макушка или затылок с отдачей в шею)?", hint: "Belladonna = лоб и виски; Gelsemium = от затылка ко лбу; Spigelia = левый глаз; Sanguinaria = справа." }
    },
    pillar2SensationQuestions: {
      de: { text: "Welcher Schmerzcharakter beschreibt den Kopfschmerz (z. B. hämmernd/pochend wie Herzschläge, drückend wie ein enges Band, stechend oder brennend)?", hint: "Belladonna/Glonoinum = heftig pochend; Natrium mur = wie mit Hämmern; Gelsemium = dumpfe Schwere; Ignatia = wie ein Nagel." },
      en: { text: "What sensation characterizes the headache (e.g. throbbing like hammers, band-like constriction, sharp stabbing, or heavy dull ache)?", hint: "Belladonna = throbbing; Nat-m = hammering; Gelsemium = dull heavy band; Ignatia = nail driven in." },
      es: { text: "¿Qué sensación describe el dolor de cabeza (palpitante como martillos, constricción en banda, punzante o pesadez)?", hint: "Belladonna = pulsátil; Nat-m = martilleo; Gelsemium = pesadez embotada." },
      fr: { text: "Quelle sensation caractérise le mal de tête (battements comme des marteaux, étau serré, piqûres aiguës ou lourdeur pesante) ?", hint: "Belladonna = battements pulsátiles; Nat-m = marteaux; Gelsemium = lourdeur." },
      it: { text: "Quale sensazione caratterizza il mal di testa (martellante e pulsante, fascia stretta, fitte o pesantezza ottusa)?", hint: "Belladonna = pulsante; Nat-m = martellante; Gelsemium = peso ottuso." },
      el: { text: "Ποια αίσθηση χαρακτηρίζει τον πονοκέφαλο (σφυροκόπημα/σφύζων, σφίξιμο σαν στεφάνι, σουβλιές ή βαρύ κεφάλι);", hint: "Belladonna = σφυγμικός πόνος; Nat-m = σφυροκόπημα; Gelsemium = βαρύτητα." },
      ru: { text: "Каков характер головной боли (пульсирующая как молотом, сжимающая как обручем, пронзающая или тяжелая тупая)?", hint: "Belladonna = пульсация; Nat-m = удары молоточков; Gelsemium = тяжесть." }
    },
    pillar3ModalityQuestions: {
      de: { text: "Was bessert oder verschlechtert die Kopfschmerzen (z. B. schlechter durch Licht, Lärm, Erschütterung, Bücken – oder besser durch Kälte, Druck oder Ruhe im Dunkeln)?", hint: "Belladonna/Bryonia = schlechter durch geringste Erschütterung & Bewegung; Bryonia = besser durch festen Druck; Nat-m = schlechter durch Sonne/Licht." },
      en: { text: "What relieves or worsens the headache (e.g. worse light, noise, motion, stooping – or better cold, hard pressure, quiet dark room)?", hint: "Belladonna/Bryonia = worse slightest motion/jar; Bryonia = better firm pressure; Nat-m = worse sun/light." },
      es: { text: "¿Qué alivia o empeora el dolor (empeora por luz, ruido, agacharse – o mejora con presión firme, frío o reposo a oscuras)?", hint: "Belladonna/Bryonia = peor al movimiento; Nat-m = peor sol/luz." },
      fr: { text: "Qu'est-ce qui améliore ou aggrave le mal de tête (pire lumière, bruit, mouvement – ou mieux par pression forte, froid, repos dans l'obscurité) ?", hint: "Belladonna/Bryonia = pire au moindre choc; Nat-m = pire soleil." },
      it: { text: "Cosa migliora o peggiora il mal di testa (peggio luce, rumore, movimento – o meglio pressione forte, freddo, buio)?", hint: "Belladonna/Bryonia = peggio al minimo scotimento; Nat-m = peggio col sole." },
      el: { text: "Τι βελτιώνει ή επιδεινώνει τον πονοκέφαλο (χειρότερα με φως, θόρυβο, σκύψιμο – ή καλύτερα με πίεση, κρύο επίθεμα, σκοτεινό δωμάτιο);", hint: "Belladonna/Bryonia = χειρότερα με κίνηση/κραδασμό; Nat-m = χειρότερα με ήλιο." },
      ru: { text: "Что облегчает или ухудшает головную боль (хуже от света, шума, наклона – или лучше от тугой повязки, холода, темноты и покоя)?", hint: "Belladonna/Bryonia = хуже от малейшего движения; Nat-m = хуже от солнца." }
    },
    pillar4ConcomitantQuestions: {
      de: { text: "Treten Begleitsymptome auf (z. B. Übelkeit, Sehstörungen/Flimmern vor den Augen, roter heißer Kopf oder kalte Füße)?", hint: "Iris versicolor/Sanguinaria = mit saurem Erbrechen; Belladonna = roter Kopf & kalte Extremitäten; Gelsemium = schwere Augenlider." },
      en: { text: "Are there associated symptoms (e.g. nausea, visual aura/flashes, red hot face with cold hands/feet)?", hint: "Iris/Sanguinaria = with vomiting; Belladonna = hot flushed face, cold feet; Gelsemium = heavy droopy eyelids." },
      es: { text: "¿Presenta síntomas asociados (náuseas, visión borrosa/destellos, cara roja y caliente con pies fríos)?", hint: "Iris/Sanguinaria = vómitos; Belladonna = congestión facial y pies fríos." },
      fr: { text: "Avez-vous des symptômes associés (nausées, troubles visuels, visage rouge brûlant avec extrémités froides) ?", hint: "Iris/Sanguinaria = vomissements; Belladonna = visage congestif et pieds froids." },
      it: { text: "Ci sono sintomi concomitanti (nausea, disturbi visivi/scintille, viso congestionato con piedi freddi)?", hint: "Iris/Sanguinaria = vomito; Belladonna = testa calda e piedi freddi." },
      el: { text: "Υπάρχουν συνοδά συμπτώματα (ναυτία, θολή όραση/λάμψεις, κατακόκκινο κεφάλι με παγωμένα άκρα);", hint: "Iris/Sanguinaria = με εμετό; Belladonna = κόκκινο πρόσωπο & κρύα πόδια." },
      ru: { text: "Есть ли спутники (тошнота, мерцание перед глазами, горячее красное лицо при холодных ногах)?", hint: "Iris/Sanguinaria = со рвотой; Belladonna = прилив крови к голове и холодные ноги." }
    },
    mindQuestions: {
      de: { text: "Wie reagiert das Gemüt während des Kopfschmerzes (z. B. unerträglich gereizt gegen jede Störung, ängstlich, apathisch-benommen)?", hint: "Bryonia/Nux-v = will völlig ungestört sein; Aconitum = panisch; Gelsemium = schläfrig & apathisch." },
      en: { text: "How is the mood during the headache (e.g. extremely irritable from any disturbance, anxious, dull-drowsy)?", hint: "Bryonia/Nux-v = irritable, wants solitude; Aconitum = panic; Gelsemium = drowsy and dull." },
      es: { text: "¿Cómo se siente anímicamente (muy irritable ante cualquier ruido, con pánico o aletargado y aturdido)?", hint: "Bryonia/Nux-v = irritable; Aconitum = pánico; Gelsemium = somnoliento." },
      fr: { text: "Quel est votre comportement psychique (extrême irritation au moindre dérangement, panique ou somnolence apathique) ?", hint: "Bryonia/Nux-v = irritable; Aconitum = panique; Gelsemium = apathie." },
      it: { text: "Qual è lo stato emotivo (irritabile al massimo, ansioso o assopito e intorpidito)?", hint: "Bryonia/Nux-v = irritabile; Aconitum = panico; Gelsemium = sonnolento." },
      el: { text: "Πώς είναι η ψυχική σας διάθεση (ευερεθιστότητα στον παραμικρό θόρυβο, πανικός ή υπνηλία και αποχαύνωση);", hint: "Bryonia/Nux-v = δεν αντέχει όχληση; Aconitum = πανικός; Gelsemium = λήθαργος." },
      ru: { text: "Каково настроение во время головной боли (раздражение от малейшего шума, страх/паника или тупая сонливость)?", hint: "Bryonia/Nux-v = раздражителен, хочет покоя; Aconitum = паника; Gelsemium = сонливость." }
    }
  },
  back: {
    domainKey: 'back',
    keywords: ['rucken', 'rücken', 'kreuz', 'lws', 'back', 'spine', 'dos', 'espalda', 'schiena', 'πλατη', 'μεση', 'спин', 'поясниц', 'ischias', 'lumbago', 'wirbel'],
    pillar1LocationQuestions: {
      de: { text: "Wo genau am Rücken liegt das Schmerzzentrum (Lendenwirbelsäule/Kreuzbein, BWS zwischen Schulterblättern, Nacken oder Ausstrahlung ins Bein/Gesäß)?", hint: "Rhus tox/Kali carb = LWS & Kreuz; Chelidonium = rechter Schulterblattwinkel; Colocynthis = Ischias." },
      en: { text: "Where exactly in the back is the epicenter (lumbar spine/sacrum, between shoulder blades, neck, or radiating down the leg/buttock)?", hint: "Rhus-t/Kali-c = lumbar/sacrum; Chelidonium = right shoulder blade; Colocynthis = sciatica." },
      es: { text: "¿En qué punto exacto de la espalda se concentra el dolor (zona lumbar/sacro, entre omóplatos, cervicales o irradiado a la pierna)?", hint: "Rhus-t/Kali-c = lumbar; Chelidonium = omóplato derecho; Colocynthis = ciática." },
      fr: { text: "Où précisément dans le dos se situe la douleur (lombaires/sacrum, entre les omoplates, nuque ou sciatique dans la jambe) ?", hint: "Rhus-t/Kali-c = lombaires; Chelidonium = omoplate droite; Colocynthis = sciatique." },
      it: { text: "In quale punto esatto della schiena è localizzato il dolore (zona lombare/sacro, tra le scapole, cervicale o irradiazione alla gamba)?", hint: "Rhus-t/Kali-c = lombare; Chelidonium = scapola destra; Colocynthis = sciatica." },
      el: { text: "Σε ποιο σημείο της πλάτης/μέσης εστιάζεται ο πόνος (οσφύς/ιερό οστό, ανάμεσα στις ωμοπλάτες, αυχένας ή ισχιαλγία στο πόδι);", hint: "Rhus-t/Kali-c = μέση/ιερό οστό; Chelidonium = δεξιά ωμοπλάτη; Colocynthis = ισχιαλγία." },
      ru: { text: "В каком отделе позвоночника сосредоточена боль (поясница/крестец, между лопатками, шея или иррадиация в ногу/ягодицу)?", hint: "Rhus-t/Kali-c = поясница; Chelidonium = правая лопатка; Colocynthis = ишиас." }
    },
    pillar2SensationQuestions: {
      de: { text: "Wie fühlt sich der Rückenschmerz an (z. B. wie zerschlagen/gebrochen, reißend-stechend, brennend oder steif und unbeweglich)?", hint: "Arnica = wie zerschlagen; Rhus tox = steif wie eingerostet; Bryonia = scharf stechend; Kali bich = punktuell." },
      en: { text: "How does the back pain feel (e.g. bruised as if broken, tearing/stitching, burning, or stiff and locked)?", hint: "Arnica = bruised/broken; Rhus tox = stiff and rusty; Bryonia = sharp stitching; Kali-c = stitching/weakness." },
      es: { text: "¿Cómo se siente el dolor de espalda (como golpeado/roto, punzante desgarrante, quemante o rígido y bloqueado)?", hint: "Arnica = magullado; Rhus tox = rigidez dolorosa; Bryonia = punzante agudo." },
      fr: { text: "Quelle est la nature de la douleur de dos (comme brisé/meurtri, piqûre déchirante, brûlure ou raideur bloquée) ?", hint: "Arnica = courbaturé; Rhus tox = raideur douloureuse; Bryonia = piqûre vive." },
      it: { text: "Come percepisce il dolore alla schiena (come contuso/rotto, lacerante-pungente, bruciante o bloccato e rigido)?", hint: "Arnica = contuso; Rhus tox = rigido arrugginito; Bryonia = fitte acute." },
      el: { text: "Πώς νιώθετε τον πόνο στη μέση/πλάτη (σαν σπασμένη/χτυπημένη, διαξιφιστικός, καυστικός ή άκαμπτος/πιασμένος);", hint: "Arnica = σαν χτυπημένος; Rhus tox = πιάσιμο & δυσκαμψία; Bryonia = σουβλιές." },
      ru: { text: "Как ощущается боль в спине (как разбитая/переломанная, рвущая-колющая, жгучая или скованная и неподвижная)?", hint: "Arnica = как избитый; Rhus tox = скованность и тугоподвижность; Bryonia = резкая колющая." }
    },
    pillar3ModalityQuestions: {
      de: { text: "Was bessert oder verschlechtert den Rücken (z. B. schlimmer bei Beginn der Bewegung aber besser nach längerem Gehen, besser durch harte Unterlage oder Wärme)?", hint: "Rhus tox = schlechter bei erster Bewegung, besser bei fortgesetzter Bewegung & Wärme; Bryonia = absolute Ruhe; Kali carb = schlechter 3 Uhr nachts." },
      en: { text: "What relieves or aggravates the back (e.g. worse at beginning of motion but better after continued walking, better firm surface or heat)?", hint: "Rhus tox = worse first motion, better continued motion & heat; Bryonia = worse any motion; Nat-m/Rhus = better hard lying." },
      es: { text: "¿Qué alivia o agrava la espalda (peor al empezar a moverse pero mejor al caminar un rato, mejor en superficie dura o calor)?", hint: "Rhus tox = mejor en movimiento continuo y calor; Bryonia = reposo absoluto." },
      fr: { text: "Qu'est-ce qui soulage ou aggrave le dos (pire au premier mouvement mais mieux en marchant, mieux sur plan dur ou par la chaleur) ?", hint: "Rhus tox = mieux par le mouvement continu et la chaleur; Bryonia = repos absolu." },
      it: { text: "Cosa migliora o peggiora la schiena (peggio al primo movimento ma meglio continuando a camminare, meglio sul duro o col calore)?", hint: "Rhus tox = meglio col movimento continuato e calore; Bryonia = riposo assoluto." },
      el: { text: "Τι βελτιώνει ή επιδεινώνει τη μέση (χειρότερα στην αρχή της κίνησης αλλά καλύτερα μετά από περπάτημα, καλύτερα σε σκληρή επιφάνεια ή ζέστη);", hint: "Rhus tox = καλύτερα με συνεχή κίνηση & ζέστη; Bryonia = απόλυτη ακινησία." },
      ru: { text: "Что облегчает или ухудшает боль в спине (хуже в начале движения, но лучше при расхаживании, лучше на твердом или от тепла)?", hint: "Rhus tox = хуже при первых движениях, лучше при движении и от тепла; Bryonia = покой." }
    },
    pillar4ConcomitantQuestions: {
      de: { text: "Gab es eine Causa (Verheben, Verkühlung bei Schwitzen, nasskaltes Wetter, Sturz) oder Begleitsymptome (Taubheitsgefühl, Schwäche)?", hint: "Rhus tox = Nässe & Überanstrengung; Arnica = Sturz/Trauma; Dulcamara = nasskalt." },
      en: { text: "Was there a cause (lifting strain, getting chilled while sweating, damp cold weather, fall) or numbness/weakness?", hint: "Rhus tox = strain + wet cold; Arnica = trauma/injury; Dulcamara = damp cold." },
      es: { text: "¿Hubo una causa (esfuerzo, enfriamiento tras sudar, humedad, caída) o entumecimiento?", hint: "Rhus tox = sobreesfuerzo y humedad; Arnica = golpe; Dulcamara = frío húmedo." },
      fr: { text: "Y a-t-il une cause (faux mouvement, coup de froid après avoir transpiré, temps humide, chute) ou engourdissement ?", hint: "Rhus tox = effort et froid humide; Arnica = choc/traumatisme." },
      it: { text: "C'è stata una causa (sforzo nel sollevare, raffreddamento dopo sudorazione, umido, caduta) o intorpidimento?", hint: "Rhus tox = sforzo e umidità; Arnica = trauma." },
      el: { text: "Υπήρξε κάποιο αίτιο (άρση βάρους, ψύξη μετά από εφίδρωση, υγρασία, πτώση) ή μούδιασμα;", hint: "Rhus tox = καταπόνηση & υγρό κρύο; Arnica = τραυματισμός." },
      ru: { text: "Была ли причина (поднятие тяжести, переохлаждение после потоотделения, сырость, падение) или онемение?", hint: "Rhus tox = перенапряжение и сырость; Arnica = ушиб/травма." }
    },
    mindQuestions: {
      de: { text: "Wie wirkt sich der Schmerz auf das Gemüt aus (z. B. unruhiges Hin- und Herwälzen, mutlos wegen Bewegungseinschränkung)?", hint: "Rhus tox = unruhig, kann nicht stillsitzen; Bryonia = will absolut seine Ruhe; Arnica = behauptet, es fehle ihm nichts." },
      en: { text: "How does the pain affect your mood (e.g. tossing about restlessly, irritable from helplessness)?", hint: "Rhus tox = restless, cannot sit still; Bryonia = hates being disturbed; Arnica = says nothing is wrong." },
      es: { text: "¿Cómo afecta el dolor al estado de ánimo (agitación constante sin encontrar postura, desánimo)?", hint: "Rhus tox = inquietud motora; Bryonia = no quiere que le hablen." },
      fr: { text: "Quel est le retentissement moral (agitation incessante, découragement ou irritabilité) ?", hint: "Rhus tox = agitation physique continuelle; Bryonia = veut la paix." },
      it: { text: "Come influisce il dolore sull'umore (irrequietezza continua, sconforto o irritabilità)?", hint: "Rhus tox = irrequieto, non trova pace; Bryonia = non vuole essere disturbato." },
      el: { text: "Πώς επηρεάζει ο πόνος την ψυχολογία σας (έντονη κινητική ανησυχία, δυσφορία από την ακινησία);", hint: "Rhus tox = δεν μπορεί να μείνει ακίνητος; Bryonia = θέλει απόλυτη ησυχία." },
      ru: { text: "Как боль влияет на настроение (постоянное беспокойное метание в постели, раздражение от беспомощности)?", hint: "Rhus tox = крайнее беспокойство; Bryonia = раздражение от любого контакта." }
    }
  }
};

/**
 * Returns tailored Materia Medica questions derived dynamically from the active complaint and author pool
 */
export function getTailoredQuestionsForComplaint(complaintText: string, lang: LanguageCode = 'de'): {
  locationQuestion: { text: string; hint: string };
  sensationQuestion: { text: string; hint: string };
  modalityQuestion: { text: string; hint: string };
  concomitantQuestion: { text: string; hint: string };
  mindQuestion: { text: string; hint: string };
  matchedDomain?: string;
  topRemedies: AuthorRemedyMatch[];
} {
  const norm = (complaintText || '').toLowerCase();
  const topRemedies = queryMateriaMedicaAuthors(norm, lang);

  // Check matched curated domain
  let matchedSet: DomainQuestionSet | null = null;
  for (const set of Object.values(DOMAIN_QUESTION_SETS)) {
    for (const kw of set.keywords) {
      if (norm.includes(kw)) {
        matchedSet = set;
        break;
      }
    }
    if (matchedSet) break;
  }

  if (matchedSet) {
    return {
      locationQuestion: matchedSet.pillar1LocationQuestions[lang] || matchedSet.pillar1LocationQuestions.de,
      sensationQuestion: matchedSet.pillar2SensationQuestions[lang] || matchedSet.pillar2SensationQuestions.de,
      modalityQuestion: matchedSet.pillar3ModalityQuestions[lang] || matchedSet.pillar3ModalityQuestions.de,
      concomitantQuestion: matchedSet.pillar4ConcomitantQuestions[lang] || matchedSet.pillar4ConcomitantQuestions.de,
      mindQuestion: matchedSet.mindQuestions[lang] || matchedSet.mindQuestions.de,
      matchedDomain: matchedSet.domainKey,
      topRemedies
    };
  }

  // Dynamic Synthesis from the Author Materia Medica Pool if outside curated domains
  const topRemedyNames = topRemedies.slice(0, 4).map(r => r.remedyName).join(', ');
  const remedyHint = topRemedyNames ? `Leitende Arzneien: ${topRemedyNames}` : '';

  const cleanComplaint = complaintText.trim() || 'Hauptbeschwerde';

  const dynamicLocation: Record<LanguageCode, { text: string; hint: string }> = {
    de: { text: `Wo genau am Körper ist ${cleanComplaint} spürbar und gibt es eine Ausstrahlung oder Seitigkeit (links/rechts)?`, hint: remedyHint },
    en: { text: `Where exactly on the body is ${cleanComplaint} located, and is there radiation or laterality (left/right)?`, hint: remedyHint },
    es: { text: `¿En qué parte exacta del cuerpo se localiza ${cleanComplaint} y existe irradiación o lateralidad (izquierda/derecha)?`, hint: remedyHint },
    fr: { text: `Où précisément dans le corps se situe ${cleanComplaint} et y a-t-il une irradiation ou latéralité (gauche/droite) ?`, hint: remedyHint },
    it: { text: `In quale punto esatto del corpo è localizzato ${cleanComplaint} e c'è irradiazione o lateralità (sinistra/destra)?`, hint: remedyHint },
    el: { text: `Πού ακριβώς στο σώμα εντοπίζεται: ${cleanComplaint} και υπάρχει αντανάκλαση ή πλευρικότητα (αριστερά/δεξιά);`, hint: remedyHint },
    ru: { text: `Где именно на теле ощущается: ${cleanComplaint} и есть ли иррадиация или сторона (слева/справа)?`, hint: remedyHint }
  };

  const dynamicSensation: Record<LanguageCode, { text: string; hint: string }> = {
    de: { text: `Welcher Schmerzcharakter beschreibt ${cleanComplaint} am genauesten (z. B. stechend, brennend, pochend, krampfartig oder dumpf)?`, hint: remedyHint },
    en: { text: `Which sensation best describes ${cleanComplaint} (e.g. sharp, burning, throbbing, cramping, or dull ache)?`, hint: remedyHint },
    es: { text: `¿Qué sensación describe mejor: ${cleanComplaint} (punzante, ardiente, pulsátil, espasmódico o sordo)?`, hint: remedyHint },
    fr: { text: `Quelle sensation décrit le mieux : ${cleanComplaint} (piqûre, brûlure, battements, crampe ou sourd) ?`, hint: remedyHint },
    it: { text: `Quale sensazione descrive meglio: ${cleanComplaint} (pungente, bruciante, pulsante, crampiforme o sordo)?`, hint: remedyHint },
    el: { text: `Ποια αίσθηση περιγράφει ακριβέστερα: ${cleanComplaint} (σουβλιές, κάψιμο, σφυγμός, σπασμός ή βύθιος πόνος);`, hint: remedyHint },
    ru: { text: `Какое ощущение точнее всего описывает: ${cleanComplaint} (колющая, жгучая, пульсирующая, схваткообразная или тупая)?`, hint: remedyHint }
  };

  const dynamicModality: Record<LanguageCode, { text: string; hint: string }> = {
    de: { text: `Wodurch wird ${cleanComplaint} spürbar gebessert (>) oder verschlimmert (<) – z. B. Bewegung, Ruhe, Wärme, Kälte, Druck oder Tageszeit?`, hint: remedyHint },
    en: { text: `What distinctly ameliorates (>) or aggravates (<) ${cleanComplaint} – e.g. motion, rest, warmth, cold, pressure, or time of day?`, hint: remedyHint },
    es: { text: `¿Qué alivia (>) o empeora (<) perceptiblemente: ${cleanComplaint} – movimiento, reposo, calor, frío, presión u hora del día?`, hint: remedyHint },
    fr: { text: `Qu'est-ce qui améliore (>) ou aggrave (<) nettement : ${cleanComplaint} – mouvement, repos, chaleur, froid, pression ou horaire ?`, hint: remedyHint },
    it: { text: `Cosa migliora (>) o aggrava (<) sensibilmente: ${cleanComplaint} – movimento, riposo, calore, freddo, pressione o orario?`, hint: remedyHint },
    el: { text: `Τι ανακουφίζει (>) ή επιδεινώνει (<) αισθητά: ${cleanComplaint} – κίνηση, ηρεμία, ζέστη, κρύο, πίεση ή ώρα ημέρας;`, hint: remedyHint },
    ru: { text: `Что заметно облегчает (>) или ухудшает (<): ${cleanComplaint} – движение, покой, тепло, холод, давление или время суток?`, hint: remedyHint }
  };

  const dynamicConcomitant: Record<LanguageCode, { text: string; hint: string }> = {
    de: { text: `Gibt es einen klaren Auslöser (Causa) oder körperliche Begleiterscheinungen, die gleichzeitig mit ${cleanComplaint} auftreten?`, hint: remedyHint },
    en: { text: `Is there an identifiable trigger (cause) or physical concomitants that occur alongside ${cleanComplaint}?`, hint: remedyHint },
    es: { text: `¿Existe un desencadenante claro (causa) o síntomas físicos concomitantes que acompañan a ${cleanComplaint}?`, hint: remedyHint },
    fr: { text: `Y a-t-il une cause déclenchante nette ou des symptômes physiques concomitants associés à ${cleanComplaint} ?`, hint: remedyHint },
    it: { text: `C'è una chiara causa scatenante o sintomi fisici concomitanti che si manifestano con ${cleanComplaint}?`, hint: remedyHint },
    el: { text: `Υπάρχει σαφές αίτιο (Causa) ή σωματικά συνοδά συμπτώματα που συνοδεύουν: ${cleanComplaint};`, hint: remedyHint },
    ru: { text: `Есть ли четкая причина (causa) или физические сопутствующие симптомы, возникающие вместе с: ${cleanComplaint}?`, hint: remedyHint }
  };

  const dynamicMind: Record<LanguageCode, { text: string; hint: string }> = {
    de: { text: `Wie verändert sich Ihr seelisches Befinden oder Ihre Stimmung während ${cleanComplaint} (z. B. Unruhe, Reizbarkeit, Wunsch nach Trost oder Rückzug)?`, hint: remedyHint },
    en: { text: `How does your emotional state or mood change during ${cleanComplaint} (e.g. restlessness, irritability, desire for consolation or solitude)?`, hint: remedyHint },
    es: { text: `¿Cómo cambia su estado de ánimo durante: ${cleanComplaint} (inquietud, irritabilidad, deseo de consuelo o aislamiento)?`, hint: remedyHint },
    fr: { text: `Comment change votre humeur pendant : ${cleanComplaint} (agitation, irritabilité, besoin de consolation ou d'isolement) ?`, hint: remedyHint },
    it: { text: `Come cambia il suo stato d'animo durante: ${cleanComplaint} (irrequietezza, irritabilità, desiderio di consolazione o isolamento)?`, hint: remedyHint },
    el: { text: `Πώς μεταβάλλεται η διάθεσή σας κατά: ${cleanComplaint} (ανησυχία, ευερεθιστότητα, ανάγκη για παρηγοριά ή απομόνωση);`, hint: remedyHint },
    ru: { text: `Как меняется ваше душевное состояние во время: ${cleanComplaint} (беспокойство, раздражительность, желание утешения или уединения)?`, hint: remedyHint }
  };

  return {
    locationQuestion: dynamicLocation[lang] || dynamicLocation.de,
    sensationQuestion: dynamicSensation[lang] || dynamicSensation.de,
    modalityQuestion: dynamicModality[lang] || dynamicModality.de,
    concomitantQuestion: dynamicConcomitant[lang] || dynamicConcomitant.de,
    mindQuestion: dynamicMind[lang] || dynamicMind.de,
    topRemedies
  };
}
