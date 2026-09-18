/**
 * Hahnemann & Bönninghausen Classical Homoeopathic 6-Pillars Analysis Engine
 * 
 * Implements strict NLP fragmentation, irrelevance filtering, 6-pillar matrix mapping,
 * interpretation/hallucination prohibition, single-question sequential loop,
 * and remedy differentiation.
 */

import { getActiveTherapist } from './storage';

export type CaseType = 'akut' | 'chronisch';

export interface Hahnemann6Pillars {
  causa: string | null;
  lokalisierung: string | null;
  empfindung: string | null;
  modalitaeten: string | null;
  begleitsymptome: string[];
  gemuet: string | null;
  strahlungsoptionen?: string | null;
  ursaechlicher_zusammenhang?: string | null;
  fruehere_behandlungen_und_historie?: string | null;
}

export interface HahnemannClarifyingQuestion {
  id: string;
  frage: string;
  grund: string;
  kategorie?: 'gemuet' | 'modalitaeten' | 'begleitsymptome' | 'empfindung' | 'causa' | 'zusammenhang' | 'historie';
  optionen: string[];
  beantwortet?: string;
}

export interface HahnemannAnalysisResult {
  analyse_status: 'in_progress' | 'completed';
  wichtige_symptom_fragmente: Hahnemann6Pillars;
  falltyp?: CaseType;
  mehrere_symptome_erkannt?: boolean;
  symptomkomplex_bestaetigt?: boolean;
  ignorierte_daten: string[];
  kontroll_und_nachfrage_logik: string;
  naechste_frage: string;
  auswahl_optionen?: string[];
  auswahl_typ?: 'single' | 'multiple';
  aktuelle_mittel_differenzierung: string[];
  end_analyse_zusammenfassung: string | null;
  sich_ergebende_fragen?: HahnemannClarifyingQuestion[];
}

/**
 * Call the server Gemini API endpoint, with fallback to deterministic local engine.
 */
export async function runHahnemannAnalysis(
  text: string,
  currentMatrix?: Partial<Hahnemann6Pillars>,
  conversationHistory: Array<{ question: string; answer: string }> = [],
  language: string = 'de',
  forceComplete: boolean = false,
  caseType: CaseType = 'akut'
): Promise<HahnemannAnalysisResult> {
  const trimmed = (text || '').trim();
  const activeTherapist = getActiveTherapist();

  try {
    const response = await fetch('/api/hahnemann-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: trimmed,
        currentMatrix: currentMatrix || null,
        conversationHistory,
        language,
        forceComplete,
        caseType,
        therapistId: activeTherapist?.id || 'th-101',
        therapistName: activeTherapist ? `${activeTherapist.vorname} ${activeTherapist.nachname}` : undefined,
        therapistEmail: activeTherapist?.email,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.result && data.result.wichtige_symptom_fragmente) {
        return data.result;
      }
    }
  } catch (err) {
    console.warn('Network error reaching /api/hahnemann-analysis, using local logic engine:', err);
  }

  // Fallback to local rule engine adhering strictly to Organon §§ 83–104
  return evaluateHahnemannLocally(trimmed, currentMatrix, conversationHistory, language, forceComplete, caseType);
}

interface LocalizedQuestionData {
  rationale: string;
  question: string;
  options: string[];
}

const LOCALIZED_QUESTIONS: Record<string, Record<string, LocalizedQuestionData>> = {
  causality: {
    de: {
      rationale: 'Mehrere Beschwerden angegeben. Nach Hahnemann muss zuerst geprüft werden, ob ein ursächlicher Zusammenhang (z. B. derselbe Infekt) besteht, um sie als zusammenhängenden Komplex zu erfassen.',
      question: 'Besteht zwischen Ihren angegebenen Beschwerden ein ursächlicher Zusammenhang (z. B. durch denselben Infekt, Auslöser oder Beginn)?',
      options: [
        'Ja, beide Beschwerden entstanden zeitgleich durch denselben Infekt / Auslöser (Symptomkomplex)',
        'Nein, es handelt sich um zwei voneinander unabhängige Beschwerden',
        'Die zweite Beschwerde trat nacheinander als Folge der Erstbeschwerde auf',
        'Zusammenhang noch unklar / wird separat beobachtet'
      ]
    },
    en: {
      rationale: 'Multiple complaints reported. According to Hahnemann, a causal connection must first be verified to assess whether they form a coherent symptom complex.',
      question: 'Is there a causal connection between your stated complaints (e.g. from the same infection, trigger, or simultaneous onset)?',
      options: [
        'Yes, both complaints arose simultaneously from the same infection / trigger (symptom complex)',
        'No, they are two independent complaints',
        'The second complaint developed consecutively as a consequence of the first',
        'Connection still unclear / being observed separately'
      ]
    },
    es: {
      rationale: 'Múltiples síntomas informados. Según Hahnemann, primero debe verificarse si existe una conexión causal para abordarlos como un complejo sintomático.',
      question: '¿Existe una conexión causal entre los síntomas indicados (p. ej., misma infección, desencadenante o inicio simultáneo)?',
      options: [
        'Sí, ambos síntomas surgieron al mismo tiempo por la misma causa/infección (complejo sintomático)',
        'No, se trata de dos dolencias independientes',
        'El segundo síntoma apareció consecutivamente como consecuencia del primero',
        'Relación aún incierta / se observa por separado'
      ]
    },
    fr: {
      rationale: 'Plusieurs plaintes signalées. Selon Hahnemann, un lien de causalité doit d\'abord être examiné pour les appréhender comme un ensemble cohérent.',
      question: 'Existe-t-il un lien de causalité entre vos troubles signalés (par ex. même infection, déclencheur ou début simultané) ?',
      options: [
        'Oui, les deux troubles sont apparus simultanément suite au même déclencheur (complexe de symptômes)',
        'Non, il s\'agit de deux affections indépendantes',
        'Le second trouble est apparu consécutivement comme suite du premier',
        'Lien encore indéterminé / observé séparément'
      ]
    },
    it: {
      rationale: 'Segnalati più disturbi. Secondo Hahnemann, occorre verificare prima se esiste un nesso causale per valutarli come complesso sintomatico.',
      question: 'Esiste un nesso causale tra i disturbi riferiti (es. stessa infezione, fattore scatenante o inizio simultaneo)?',
      options: [
        'Sì, entrambi i disturbi sono insorti contemporaneamente dallo stesso fattore (complesso sintomatico)',
        'No, si tratta di due disturbi reciprocamente indipendenti',
        'Il secondo disturbo è comparso successivamente come conseguenza del primo',
        'Nesso non ancora chiaro / da osservare separatamente'
      ]
    },
    el: {
      rationale: 'Αναφέρθηκαν πολλαπλά ενοχλήματα. Κατά τον Χάνεμαν πρέπει πρώτα να εξακριβωθεί αν υπάρχει αιτιώδης συνάφεια.',
      question: 'Υπάρχει αιτιώδης συνάφεια μεταξύ των ενοχλημάτων (π.χ. ίδια λοίμωξη, έναυσμα ή ταυτόχρονη έναρξη);',
      options: [
        'Ναι, και τα δύο ενοχλήματα προέκυψαν ταυτόχρονα από το ίδιο αίτιο (σύμπλεγμα συμπτωμάτων)',
        'Όχι, πρόκειται για δύο ανεξάρτητες ενοχλήσεις',
        'Το δεύτερο ενόχλημα εμφανίστηκε διαδοχικά ως επακόλουθο του πρώτου',
        'Η συνάφεια παραμένει ασαφής / παρακολουθείται χωριστά'
      ]
    },
    ru: {
      rationale: 'Указано несколько жалоб. По Ганеману сначала необходимо проверить наличие причинно-следственной связи.',
      question: 'Существует ли причинная связь между жалобами (например, одна инфекция, триггер или одновременное начало)?',
      options: [
        'Да, обе жалобы возникли одновременно от одного триггера/инфекции (симптомокомплекс)',
        'Нет, это две независимые жалобы',
        'Вторая жалоба возникла последовательно как следствие первой',
        'Связь пока не ясна / наблюдается отдельно'
      ]
    }
  },
  chronicHistory: {
    de: {
      rationale: 'Chronischer Fall (§§ 83–98 Organon): Die umfassende Historie inklusive früherer Behandlungen, Unterdrückungen und Dauer muss erforscht werden.',
      question: 'Wie lange bestehen diese chronischen Beschwerden bereits und welche früheren Behandlungen, Therapien oder Medikationen gab es?',
      options: [
        'Besteht seit vielen Monaten/Jahren mit wiederholten allopathischen Behandlungen',
        'Tritt seit längerer Zeit chronisch-schubweise auf, bisher keine Dauermedikation',
        'Folge einer früheren unterdrückten Erkrankung oder eines Hautausschlags',
        'Erstmaliges Auftreten in dieser Form, keine Vorbehandlungen'
      ]
    },
    en: {
      rationale: 'Chronic case (§§ 83–98 Organon): Comprehensive history including prior treatments, suppressions, and duration must be investigated.',
      question: 'How long have these chronic complaints existed and what previous treatments, therapies, or medications were used?',
      options: [
        'Has existed for many months/years with repeated conventional treatments',
        'Occurs chronically in episodes over a long time, no long-term medication so far',
        'Sequela of a previously suppressed illness or skin eruption',
        'First occurrence in this presentation, no previous treatments'
      ]
    },
    es: {
      rationale: 'Caso crónico (§§ 83–98 Organon): Debe investigarse el historial completo incluyendo tratamientos previos y supresiones.',
      question: '¿Cuánto tiempo llevan presentes estas dolencias crónicas y qué tratamientos o medicamentos previos ha recibido?',
      options: [
        'Presente desde hace meses/años con tratamientos convencionales repetidos',
        'Aparece de forma crónica por brotes desde hace tiempo, sin medicación continuada',
        'Consecuencia de una enfermedad o erupción cutánea suprimida en el pasado',
        'Primera aparición de esta forma, sin tratamientos previos'
      ]
    },
    fr: {
      rationale: 'Cas chronique (§§ 83–98 Organon) : L\'historique complet incluant traitements antérieurs, suppressions et durée doit être exploré.',
      question: 'Depuis combien de temps ces troubles chroniques persistent-ils et quels traitements ou médications antérieurs ont été suivis ?',
      options: [
        'Persiste depuis des mois/années avec traitements allopathiques répétés',
        'Évolue par poussées chroniques depuis longtemps, aucun traitement continu',
        'Suite d\'une maladie ou éruption cutanée précédemment supprimée',
        'Première survenue sous cette forme, aucun traitement antérieur'
      ]
    },
    it: {
      rationale: 'Caso cronico (§§ 83–98 Organon): Occorre indagare la storia completa comprensiva di terapie pregresse e soppressioni.',
      question: 'Da quanto tempo persistono questi disturbi cronici e quali terapie o farmaci precedenti sono stati assunti?',
      options: [
        'Presente da molti mesi/anni con ripetute cure convenzionali',
        'Si manifesta a fasi croniche da lungo tempo, finora nessuna terapia continuativa',
        'Conseguenza di una precedente malattia o eruzione cutanea soppressa',
        'Prima manifestazione in questa forma, nessun trattamento pregresso'
      ]
    },
    el: {
      rationale: 'Χρόνια περίπτωση (§§ 83–98 Όργανον): Πρέπει να διερευνηθεί το πλήρες ιστορικό, προηγούμενες θεραπείες και καταστολές.',
      question: 'Πόσο καιρό υφίστανται αυτά τα χρόνια ενοχλήματα και ποιες προηγούμενες θεραπείες ή αγωγές έχουν ληφθεί;',
      options: [
        'Υφίσταται εδώ και μήνες/χρόνια με επανειλημμένες συμβατικές αγωγές',
        'Εμφανίζεται σε χρόνια διαστήματα εξάρσεων, χωρίς μόνιμη αγωγή έως τώρα',
        'Επακόλουθο προηγούμενης κατασταλμένης νόσου ή δερματικού εξανθήματος',
        'Πρώτη εμφάνιση με αυτή τη μορφή, χωρίς προηγούμενες θεραπείες'
      ]
    },
    ru: {
      rationale: 'Хронический случай (§§ 83–98 Органон): Необходим сбор полного анамнеза, включая предшествующее лечение и подавления.',
      question: 'Как долго длятся эти хронические жалобы и какое лечение, терапия или лекарства применялись ранее?',
      options: [
        'Длится много месяцев/лет с неоднократным аллопатическим лечением',
        'Проявляется приступами на протяжении длительного времени, без постоянной терапии',
        'Следствие ранее подавленного заболевания или кожной сыпи',
        'Впервые в такой форме, предшествующего лечения не было'
      ]
    }
  },
  causa: {
    de: {
      rationale: 'Causa (§ 99 Organon): Unmittelbarer Auslöser (Causa) und akuter Beginn müssen exakt erfasst werden.',
      question: 'Gab es einen konkreten Auslöser oder Beginn für Ihre Beschwerden (z. B. kalte Luft/Wind, Durchnässung, Ärger, Schreck oder Überanstrengung)?',
      options: [
        'Kälteeinwirkung (kalter trockener Wind, Zugluft, Unterkühlung)',
        'Durchnässung, Nässe oder Baden in kaltem Wasser',
        'Plötzlicher Schreck, Schock oder akute Angst',
        'Ärger, Zorn, Kränkung oder emotionaler Stress',
        'Körperliche Überanstrengung oder Verheben',
        'Kein spezifischer Auslöser erinnerlich / schleichender Beginn'
      ]
    },
    en: {
      rationale: 'Causa (§ 99 Organon): Immediate exciting cause (causa) and onset must be recorded accurately.',
      question: 'Was there a specific trigger or onset for your complaints (e.g. cold dry wind, getting drenched, anger, fright, or overexertion)?',
      options: [
        'Exposure to cold (cold dry wind, drafts, chilling)',
        'Getting drenched, wet weather, or bathing in cold water',
        'Sudden fright, shock, or acute fear',
        'Anger, vexation, mortification, or emotional stress',
        'Physical overexertion or heavy lifting',
        'No specific trigger recalled / gradual onset'
      ]
    },
    es: {
      rationale: 'Causa (§ 99 Organon): Debe registrarse con precisión el factor desencadenante y el inicio agudo.',
      question: '¿Hubo un desencadenante o inicio concreto para sus síntomas (p. ej., viento frío, mojarse, enfado, susto o sobreesfuerzo)?',
      options: [
        'Exposición al frío (viento frío y seco, corrientes de aire, enfriamiento)',
        'Mojarse por lluvia, humedad o baño en agua fría',
        'Susto repentino, conmoción o miedo agudo',
        'Enojo, ira, disgusto o estrés emocional',
        'Sobreesfuerzo físico o levantar cargas pesadas',
        'Sin desencadenante específico recordado / inicio paulatino'
      ]
    },
    fr: {
      rationale: 'Causa (§ 99 Organon) : La cause déclenchante immédiate et le début doivent être précisément identifiés.',
      question: 'Y a-t-il eu un déclencheur ou un début précis pour vos troubles (par ex. vent froid, pluie, contrariété, frayeur ou surmenage) ?',
      options: [
        'Exposition au froid (vent froid et sec, courants d\'air, refroidissement)',
        'Pluie, humidité ou bain en eau froide',
        'Frayeur soudaine, choc ou anxiété aiguë',
        'Colère, vexation, contrariété ou stress émotionnel',
        'Surmenage physique ou port de charges lourdes',
        'Aucun déclencheur précis identifié / début progressif'
      ]
    },
    it: {
      rationale: 'Causa (§ 99 Organon): Il fattore scatenante immediato e l\'inizio devono essere rilevati esattamente.',
      question: 'C\'è stato un fattore scatenante o un inizio preciso per i disturbi (es. aria fredda/vento, bagnarsi, collera, spavento, sforzo)?',
      options: [
        'Esposizione al freddo (vento freddo e secco, correnti d\'aria, raffreddamento)',
        'Bagnarsi, umidità o bagno in acqua fredda',
        'Spavento improvviso, shock o paura acuta',
        'Rabbia, collera, dispiacere o stress emotivo',
        'Sovraffaticamento fisico o sollevamento pesi',
        'Nessun fattore scatenante ricordato / inizio graduale'
      ]
    },
    el: {
      rationale: 'Causa (§ 99 Όργανον): Το άμεσο έναυσμα και η έναρξη πρέπει να καταγραφούν με ακρίβεια.',
      question: 'Υπήρξε συγκεκριμένο έναυσμα για τα ενοχλήματά σας (π.χ. κρύος αέρας, βρέξιμο, θυμός, σοκ ή υπερκόπωση);',
      options: [
        'Έκθεση σε κρύο (κρύος ξηρός άνεμος, ρεύματα αέρα, υποθερμία)',
        'Βρέξιμο, υγρασία ή μπάνιο σε παγωμένο νερό',
        'Ξαφνικός φόβος, σοκ ή έντονη τρομάρα',
        'Θυμός, οργή, προσβολή ή συναισθηματικό στρες',
        'Σωματική καταπόνηση ή άρση βάρους',
        'Χωρίς συγκεκριμένο έναυσμα / σταδιακή έναρξη'
      ]
    },
    ru: {
      rationale: 'Causa (§ 99 Органон): Непосредственный пусковой фактор (Causa) и начало должны быть точно зафиксированы.',
      question: 'Был ли конкретный пусковой фактор (например, холодный сухой ветер, промокание, гнев, испуг или перенапряжение)?',
      options: [
        'Воздействие холода (холодный сухой ветер, сквозняк, переохлаждение)',
        'Промокание, сырость или купание в холодной воде',
        'Внезапный испуг, шок или острый страх',
        'Гнев, досада, обида или эмоциональный стресс',
        'Физическое перенапряжение или поднятие тяжестей',
        'Без конкретного пускового фактора / постепенное начало'
      ]
    }
  },
  lokalisierung: {
    de: {
      rationale: 'Lokalisation (Ort und Strahlungsoptionen): Der genaue anatomische Sitz und etwaige Ausstrahlungen müssen erfasst werden.',
      question: 'Wo genau manifestieren sich die Beschwerden – und strahlen sie in andere Körperregionen aus?',
      options: [
        'Kopf / Stirn / Schläfen mit Ausstrahlung in den Nacken',
        'Hals / Rachen / Mandeln mit Ausstrahlung in die Ohren',
        'Brustkorb / Lunge / Bronchien',
        'Magen-Darm-Trakt / Oberbauch mit Ausstrahlung in den Rücken',
        'Bewegungsapparat / Gelenke / Glieder',
        'Ganzkörperlich / Systemisch (Fieber, Frösteln)'
      ]
    },
    en: {
      rationale: 'Localization (Seat and Radiation): Exact anatomical seat and radiations must be established.',
      question: 'Where exactly do the symptoms manifest – and do they radiate to other body regions?',
      options: [
        'Head / forehead / temples radiating to the neck',
        'Throat / pharynx / tonsils radiating to the ears',
        'Chest / lungs / bronchi',
        'Gastrointestinal tract / upper abdomen radiating to the back',
        'Locomotor system / joints / limbs',
        'Whole body / systemic (fever, chills)'
      ]
    },
    es: {
      rationale: 'Localización: Debe determinarse la sede anatómica exacta y posibles irradiaciones.',
      question: '¿Dónde se localizan exactamente las molestias y hacia qué regiones irradian?',
      options: [
        'Cabeza / frente / sienes con irradiación hacia la nuca',
        'Garganta / faringe / amígdalas con irradiación hacia los oídos',
        'Tórax / pulmones / bronquios',
        'Aparato digestivo / abdomen superior con irradiación hacia la espalda',
        'Aparato locomotor / articulaciones / extremidades',
        'Todo el cuerpo / sistémico (fiebre, escalofríos)'
      ]
    },
    fr: {
      rationale: 'Localisation : Le siège anatomique précis et les irradiations éventuelles doivent être établis.',
      question: 'Où se situent exactement les troubles et irradient-ils vers d\'autres régions du corps ?',
      options: [
        'Tête / front / tempes irradiant vers la nuque',
        'Gorge / pharynx / amygdales irradiant vers les oreilles',
        'Poitrine / poumons / bronches',
        'Tractus gastro-intestinal / épigastre irradiant vers le dos',
        'Appareil locomoteur / articulations / membres',
        'Tout le corps / systémique (fièvre, frissons)'
      ]
    },
    it: {
      rationale: 'Localizzazione: Devono essere rilevate la sede anatomica esatta e le eventuali irradiazioni.',
      question: 'Dove si manifestano esattamente i disturbi e si irradiano verso altre parti del corpo?',
      options: [
        'Testa / fronte / tempie con irradiazione alla nuca',
        'Gola / faringe / tonsille con irradiazione alle orecchie',
        'Torace / polmoni / bronchi',
        'Apparato digerente / addome con irradiazione alla schiena',
        'Apparato locomotore / articolazioni / arti',
        'Tutto il corpo / sistemico (febbre, brividi)'
      ]
    },
    el: {
      rationale: 'Εντόπιση: Πρέπει να καθοριστεί η ακριβής ανατομική θέση και πιθανές αντανακλάσεις.',
      question: 'Πού ακριβώς εντοπίζονται τα ενοχλήματα και αντανακλούν σε άλλες περιοχές του σώματος;',
      options: [
        'Κεφάλι / μέτωπο / κρόταφοι με αντανάκλαση στον αυχένα',
        'Λαιμός / φάρυγγας / αμυγδαλές με αντανάκλαση στα αυτιά',
        'Θώρακας / πνεύμονες / βρόγχοι',
        'Γαστρεντερικό σύστημα / επιγάστριο με αντανάκλαση στην πλάτη',
        'Μυοσκελετικό σύστημα / αρθρώσεις / άκρα',
        'Ολόκληρο το σώμα / συστηματικά (πυρετός, ρίγη)'
      ]
    },
    ru: {
      rationale: 'Локализация: Необходимо выявить точное анатомическое расположение и иррадиацию.',
      question: 'Где именно локализуются симптомы и отдают ли они в другие части тела?',
      options: [
        'Голова / лоб / виски с иррадиацией в затылок и шею',
        'Горло / глотка / миндалины с иррадиацией в уши',
        'Грудная клетка / легкие / бронхи',
        'Желудочно-кишечный тракт / живот с иррадиацией в спину',
        'Опорно-двигательный аппарат / суставы / конечности',
        'Все тело / системно (жар, озноб)'
      ]
    }
  },
  empfindung: {
    de: {
      rationale: 'Sensation (Qualität der Beschwerde): Nach Hahnemann und Bönninghausen ist die Schmerz- bzw. Missempfindungsqualität entscheidend.',
      question: 'Wie fühlt sich die Beschwerde für Sie an – welche Schmerz- oder Empfindungsqualität beschreibt es am besten?',
      options: [
        'Klopfend, hämmernd und pulsierend (Belladonna)',
        'Stechend bei jeder geringsten Bewegung oder Einatmung (Bryonia)',
        'Dumpf, drückend oder wie eine schwere Last/Band um den Kopf (Gelsemium)',
        'Wie zerschlagen, wund in allen Gliedern (Eupatorium / Arnica)',
        'Brennende Hitze mit Ruhelosigkeit (Aconitum / Arsenicum)',
        'Ziehend und krampfartig (Colocynthis / Magnesia phosphorica)'
      ]
    },
    en: {
      rationale: 'Sensation (Quality of complaint): According to Hahnemann and Bönninghausen, the precise sensation is crucial.',
      question: 'How does the complaint feel – which pain or sensation quality best describes it?',
      options: [
        'Throbbing, pounding, and pulsating (Belladonna)',
        'Stitching with the slightest movement or breath (Bryonia)',
        'Dull, pressing, or like a heavy band around the head (Gelsemium)',
        'Bruised, aching, as if beaten all over (Eupatorium / Arnica)',
        'Burning heat with restless drive (Aconitum / Arsenicum)',
        'Tearing, drawing, or cramp-like (Colocynthis / Magnesia phosphorica)'
      ]
    },
    es: {
      rationale: 'Sensación (Calidad del dolor): Según Hahnemann y Bönninghausen, la cualidad de la sensación es clave.',
      question: '¿Cómo siente la molestia – qué tipo de dolor o sensación la describe mejor?',
      options: [
        'Pulsátil, martilleante y palpitante (Belladonna)',
        'Punzante con el menor movimiento o respiración (Bryonia)',
        'Sordo, opresivo o como una banda pesada alrededor de la cabeza (Gelsemium)',
        'Como magullado o golpeado en todo el cuerpo (Eupatorium / Arnica)',
        'Calor ardiente con inquietud (Aconitum / Arsenicum)',
        'Espasmódico, desgarrador o con calambres (Colocynthis / Magnesia phosphorica)'
      ]
    },
    fr: {
      rationale: 'Sensation (Qualité de la douleur) : Selon Hahnemann et Bönninghausen, la qualité de la sensation est déterminante.',
      question: 'Que ressentez-vous – quelle qualité de douleur ou de sensation décrit le mieux votre état ?',
      options: [
        'Battante, pulsatile et martelante (Belladonna)',
        'Piquante au moindre mouvement ou inspiration (Bryonia)',
        'Sourde, compressive ou comme un bandeau serré autour de la tête (Gelsemium)',
        'Courbaturé, meurtri dans tout le corps (Eupatorium / Arnica)',
        'Chaleur brûlante avec agitation anxieuse (Aconitum / Arsenicum)',
        'Tiraillante ou spasmodique (Colocynthis / Magnesia phosphorica)'
      ]
    },
    it: {
      rationale: 'Sensazione (Qualità del dolore): Secondo Hahnemann e Bönninghausen, la qualità della sensazione è fondamentale.',
      question: 'Come percepisce il disturbo – quale qualità del dolore descrive meglio la sensazione?',
      options: [
        'Pulsante, martellante e battente (Belladonna)',
        'Pungente al minimo movimento o respiro (Bryonia)',
        'Sordo, gravativo o come una fascia stretta attorno alla testa (Gelsemium)',
        'Come indolenzito, rotto in tutte le membra (Eupatorium / Arnica)',
        'Calore bruciante con irrequietezza (Aconitum / Arsenicum)',
        'Spasmodico o crampiforme (Colocynthis / Magnesia phosphorica)'
      ]
    },
    el: {
      rationale: 'Αίσθηση (Ποιότητα πόνου): Κατά Hahnemann και Bönninghausen, η ποιότητα της αίσθησης είναι καθοριστική.',
      question: 'Πώς νιώθετε την ενόχληση – ποια ποιότητα πόνου ή αίσθησης την περιγράφει καλύτερα;',
      options: [
        'Σφυγμικός, παλλόμενος και έντονος (Belladonna)',
        'Σουβλιστός με την παραμικρή κίνηση ή αναπνοή (Bryonia)',
        'Αμβλύς, πιεστικός σαν σφιχτό στεφάνι στο κεφάλι (Gelsemium)',
        'Σαν δαρμένος / εξουθενωμένος σε όλα τα μέλη (Eupatorium / Arnica)',
        'Καυστική θερμότητα με ανησυχία (Aconitum / Arsenicum)',
        'Σπασμωδικός και συσπαστικός (Colocynthis / Magnesia phosphorica)'
      ]
    },
    ru: {
      rationale: 'Ощущение (Характер боли): По Ганеману и Беннингхаузену, характер боли имеет решающее значение.',
      question: 'Как ощущается недомогание – какой характер боли или ощущения лучше всего его описывает?',
      options: [
        'Пульсирующая, стучащая и бьющая (Belladonna)',
        'Колющая при малейшем движении или вдохе (Bryonia)',
        'Тупая, давящая, как тяжелый обруч вокруг головы (Gelsemium)',
        'Как от побоев, разбитость во всем теле (Eupatorium / Arnica)',
        'Жгучий жар с двигательным беспокойством (Aconitum / Arsenicum)',
        'Спастическая или судорожная (Colocynthis / Magnesia phosphorica)'
      ]
    }
  },
  modalitaeten: {
    de: {
      rationale: 'Modalitäten (Verschlechterung / Besserung): Umfassende Bedingungen von Besserung und Verschlimmerung (Wärme, Kälte, Ruhe, Bewegung).',
      question: 'Was macht Ihren Zustand spürbar besser oder schlechter – reagieren Sie auf Wärme, Kälte, Ruhe oder Bewegung?',
      options: [
        'Besserung durch absolute Ruhe, geringste Bewegung verschlimmert',
        'Besserung durch feste Bandagierung oder festen Druck auf die Stelle',
        'Besserung durch kühle, frische Luft und Entblößen',
        'Besserung durch Wärme, warme Auflagen und Einhüllen (Kälte unerträglich)',
        'Verschlimmerung durch Licht, Geräusche und Erschütterung',
        'Verschlimmerung abends und nachts im Bett'
      ]
    },
    en: {
      rationale: 'Modalities (Aggravation / Amelioration): Conditions of improvement and aggravation (heat, cold, rest, motion).',
      question: 'What makes your condition noticeably better or worse – how do you react to heat, cold, rest, or movement?',
      options: [
        'Relief from absolute rest, slightest motion aggravates',
        'Relief from firm pressure or firm bandaging on the area',
        'Relief from cool fresh air and uncovering',
        'Relief from warmth, warm wraps, and covering (cold unbearable)',
        'Worse from light, noise, and jarring',
        'Worse in the evening and at night in bed'
      ]
    },
    es: {
      rationale: 'Modalidades (Mejoría / Empeoramiento): Condiciones de mejoría y empeoramiento (calor, frío, reposo, movimiento).',
      question: '¿Qué hace que su estado mejore o empeore notablemente – cómo reacciona al calor, frío, reposo o movimiento?',
      options: [
        'Mejoría con reposo absoluto, el menor movimiento empeora',
        'Mejoría con vendaje o presión firme sobre la zona',
        'Mejoría con aire fresco y descubriéndose',
        'Mejoría con calor, compresas calientes y abrigo (frío insoportable)',
        'Empeoramiento con la luz, ruidos y sacudidas',
        'Empeoramiento al atardecer y de noche en la cama'
      ]
    },
    fr: {
      rationale: 'Modalités (Amélioration / Aggravation) : Conditions d\'amélioration et d\'aggravation (chaleur, froid, repos, mouvement).',
      question: 'Qu\'est-ce qui améliore ou aggrave nettement votre état – réagissez-vous à la chaleur, au froid, au repos ou au mouvement ?',
      options: [
        'Amélioration par le repos absolu, le moindre mouvement aggrave',
        'Amélioration par bandage serré ou forte pression locale',
        'Amélioration par l\'air frais et en se découvrant',
        'Amélioration par la chaleur, enveloppements chauds (froid intolérable)',
        'Aggravation par la lumière, le bruit et les secousses',
        'Aggravation le soir et la nuit au lit'
      ]
    },
    it: {
      rationale: 'Modalità (Miglioramento / Peggioramento): Condizioni di miglioramento e aggravamento (calore, freddo, riposo, movimento).',
      question: 'Che cosa migliora o peggiora sensibilmente lo stato – come reagisce a caldo, freddo, riposo o movimento?',
      options: [
        'Miglioramento con riposo assoluto, il minimo movimento peggiora',
        'Miglioramento con fasciatura o forte pressione locale',
        'Miglioramento con aria fresca e scoprendosi',
        'Miglioramento con calore e coperte calde (freddo insopportabile)',
        'Peggioramento con luce, rumori e scuotimento',
        'Peggioramento la sera e di notte a letto'
      ]
    },
    el: {
      rationale: 'Τροποποιητικοί παράγοντες (Βελτίωση / Επιδείνωση): Συνθήκες μεταβολής (ζέστη, κρύο, ηρεμία, κίνηση).',
      question: 'Τι βελτιώνει ή επιδεινώνει αισθητά την κατάστασή σας – πώς αντιδράτε στη ζέστη, το κρύο, την ηρεμία ή την κίνηση;',
      options: [
        'Βελτίωση με απόλυτη ηρεμία, η παραμικρή κίνηση επιδεινώνει',
        'Βελτίωση με σταθερή επίδεση ή πίεση στο σημείο',
        'Βελτίωση με δροσερό καθαρό αέρα και ξεσκέπασμα',
        'Βελτίωση με ζέστη, ζεστά επιθέματα και τύλιγμα',
        'Επιδείνωση από φως, θορύβους και κραδασμούς',
        'Επιδείνωση το βράδυ και τη νύχτα στο κρεβάτι'
      ]
    },
    ru: {
      rationale: 'Модальности (Улучшение / Ухудшение): Факторы изменения состояния (тепло, холод, покой, движение).',
      question: 'Что заметно облегчает или ухудшает состояние – как вы реагируете на тепло, холод, покой или движение?',
      options: [
        'Улучшение в абсолютном покое, малейшее движение ухудшает',
        'Улучшение от тугой повязки или сильного давления на место',
        'Улучшение от прохладного свежего воздуха и раскрывания',
        'Улучшение от тепла, теплых укутываний (холод невыносим)',
        'Ухудшение от света, шума и сотрясения',
        'Ухудшение вечером и ночью в постели'
      ]
    }
  },
  begleitsymptome: {
    de: {
      rationale: 'Begleitsymptome (Concomitants): Durstverhalten, Schweißbildung und Allgemeinsymptome sichern die Mittelwahl ab.',
      question: 'Welche Begleitsymptome treten auf – wie verhalten sich Durst, Schweiß und Temperatur?',
      options: [
        'Großer, unstillbarer Durst auf eiskaltes Wasser',
        'Völlige Durstlosigkeit trotz Fieber oder Hitze',
        'Trockene, brennend heiße Haut ohne jede Schweißbildung',
        'Profuser, erleichternder Schweiß',
        'Schüttelfrost bei jeder geringsten Entblößung',
        'Rotes Gesicht beim Liegen, blass beim Aufrichten'
      ]
    },
    en: {
      rationale: 'Concomitant Symptoms: Thirst, perspiration, and general symptoms secure the remedy selection.',
      question: 'What accompanying symptoms occur – how do thirst, perspiration, and temperature behave?',
      options: [
        'Great unquenchable thirst for ice-cold water',
        'Complete thirstlessness despite fever or heat',
        'Dry, burning hot skin without any perspiration',
        'Profuse, relieving perspiration',
        'Chills at the slightest uncovering',
        'Red face when lying down, pale on rising'
      ]
    },
    es: {
      rationale: 'Síntomas concomitantes: La sed, sudoración y síntomas generales aseguran la elección del remedio.',
      question: '¿Qué síntomas acompañantes se presentan – cómo se comportan la sed, el sudor y la temperatura?',
      options: [
        'Gran sed insaciable de agua helada',
        'Ausencia total de sed a pesar de calor o fiebre',
        'Piel seca y ardiente sin nada de sudor',
        'Sudor profuso que produce alivio',
        'Escalofríos al menor destape',
        'Rostro rojo al estar acostado, pálido al incorporarse'
      ]
    },
    fr: {
      rationale: 'Symptômes concomitants : La soif, la transpiration et les symptômes généraux confirment le remède.',
      question: 'Quels symptômes concomitants apparaissent – comment se comportent la soif, la sueur et la température ?',
      options: [
        'Grande soif inextinguible d\'eau glacée',
        'Absence totale de soif malgré la fièvre ou la chaleur',
        'Peau sèche et brûlante sans aucune transpiration',
        'Transpiration abondante et soulageante',
        'Frissons au moindre dénuement',
        'Visage rouge couché, pâle en se redressant'
      ]
    },
    it: {
      rationale: 'Sintomi concomitanti: Sete, sudorazione e sintomi generali confermano la scelta del rimedio.',
      question: 'Quali sintomi concomitanti compaiono – come si comportano sete, sudore e temperatura?',
      options: [
        'Grande sete inestinguibile di acqua ghiacciata',
        'Assenza completa di sete nonostante febbre o calore',
        'Pelle secca e bollente senza sudorazione',
        'Sudore profuso che porta sollievo',
        'Brividi al minimo scoprimento',
        'Viso rosso da disteso, pallido quando si alza'
      ]
    },
    el: {
      rationale: 'Συνοδά συμπτώματα: Δίψα, εφίδρωση και γενικά συμπτώματα κατοχυρώνουν την επιλογή φαρμάκου.',
      question: 'Ποια συνοδά συμπτώματα εμφανίζονται – πώς συμπεριφέρονται η δίψα, ο ιδρώτας και η θερμοκρασία;',
      options: [
        'Μεγάλη άσβεστη δίψα για παγωμένο νερό',
        'Πλήρης απουσία δίψας παρά τον πυρετό ή τη ζέστη',
        'Ξηρό, καυτό δέρμα χωρίς ίχνος εφίδρωσης',
        'Άφθονος ιδρώτας που ανακουφίζει',
        'Ρίγη με το παραμικρό ξεσκέπασμα',
        'Κόκκινο πρόσωπο όταν είναι ξαπλωμένος, χλωμό όταν σηκώνεται'
      ]
    },
    ru: {
      rationale: 'Сопутствующие симптомы: Жажда, потливость и общие симптомы подтверждают выбор средства.',
      question: 'Какие сопутствующие симптомы возникают – как ведут себя жажда, пот и температура?',
      options: [
        'Сильная неутолимая жажда ледяной воды',
        'Полное отсутствие жажды несмотря на жар или лихорадку',
        'Сухая, горящая кожа без потоотделения',
        'Обильный пот, приносящий облегчение',
        'Озноб при малейшем раскрывании',
        'Красное лицо лежа, бледное при вставании'
      ]
    }
  },
  gemuet: {
    de: {
      rationale: 'Gemüt (Psychischer Zustand): Nach Hahnemann die Krone der Symptome und der wichtigste Wegweiser zum passenden Simile.',
      question: 'Wie ist Ihre seelische Verfassung / Ihr Gemütszustand während dieser Beschwerden?',
      options: [
        'Große Reizbarkeit und Zorn, will absolut in Ruhe gelassen werden (Bryonia)',
        'Ängstliche, getriebene Unruhe mit Todesfurcht und Herzklopfen (Aconitum)',
        'Apathisch, schläfrig, wie betäubt, verlangt nach Stille (Gelsemium)',
        'Weinerlich, verlangt nach Zuwendung, Trost und frischer Luft (Pulsatilla)',
        'Verzweifelt und ängstlich ruhelos, wandert umher (Arsenicum)',
        'Ausgeglichen und gefasst, keine spürbare Gemütsveränderung'
      ]
    },
    en: {
      rationale: 'Mind (Mental State): According to Hahnemann, the highest-ranking symptoms and prime guide to the simile.',
      question: 'What is your emotional state / mental disposition during these complaints?',
      options: [
        'Great irritability and anger, wants to be left completely alone (Bryonia)',
        'Anxious, restless drive with fear of death and palpitations (Aconitum)',
        'Apathetic, drowsy, as if benumbed, desires quiet (Gelsemium)',
        'Weepy, craves attention, consolation, and open air (Pulsatilla)',
        'Despairing and restlessly pacing about (Arsenicum)',
        'Calm and equable, no noticeable change of mood'
      ]
    },
    es: {
      rationale: 'Mente (Estado anímico): Según Hahnemann, los síntomas mentales son la guía principal hacia el simillimum.',
      question: '¿Cuál es su estado anímico o disposición mental durante estos síntomas?',
      options: [
        'Gran irritabilidad e ira, quiere que lo dejen completamente en paz (Bryonia)',
        'Inquietud motora ansiosa con temor a la muerte y palpitaciones (Aconitum)',
        'Apático, somnoliento, como aturdido, busca silencio (Gelsemium)',
        'Lloroso, necesita consuelo, afecto y aire libre (Pulsatilla)',
        'Desesperado e inquieto, camina de un lado a otro (Arsenicum)',
        'Sereno y equilibrado, sin cambios anímicos notorios'
      ]
    },
    fr: {
      rationale: 'Mental (État psychique) : Selon Hahnemann, les symptômes mentaux sont le guide suprême vers le simillimum.',
      question: 'Quel est votre état d\'esprit / votre humeur pendant ces troubles ?',
      options: [
        'Grande irritabilité et colère, veut qu\'on le laisse en paix (Bryonia)',
        'Agitation motrice anxieuse avec peur de la mort et palpitations (Aconitum)',
        'Apathique, somnolent, comme hébété, demande le calme (Gelsemium)',
        'Pleurant facilement, demande réconfort, affection et grand air (Pulsatilla)',
        'Désespéré et anxieusement agité, déambule (Arsenicum)',
        'Calme et serein, aucun changement psychique notable'
      ]
    },
    it: {
      rationale: 'Mente (Stato d\'animo): Secondo Hahnemann, i sintomi mentali sono la guida suprema verso il simile.',
      question: 'Qual è la sua disposizione d\'animo o stato emotivo durante questi disturbi?',
      options: [
        'Forte irritabilità e collera, desidera essere lasciato in pace (Bryonia)',
        'Irrequietezza motoria ansiosa con paura della morte e palpitazioni (Aconitum)',
        'Apatico, assonnato, come intontito, vuole quiete (Gelsemium)',
        'Piangevole, desidera consolazione, affetto e aria aperta (Pulsatilla)',
        'Disperato e ansiosamente irrequieto, cammina avanti e indietro (Arsenicum)',
        'Sereno ed equilibrato, nessun cambiamento evidente'
      ]
    },
    el: {
      rationale: 'Ψυχική διάθεση: Κατά τον Χάνεμαν, τα νοητικά συμπτώματα αποτελούν τον κορυφαίο οδηγό για το όμοιο.',
      question: 'Ποια είναι η ψυχική σας κατάσταση / διάθεση κατά τη διάρκεια των ενοχλημάτων;',
      options: [
        'Μεγάλη ευερεθιστότητα και οργή, επιθυμεί απόλυτη ηρεμία (Bryonia)',
        'Αγχώδης ανησυχία με φόβο θανάτου και ταχυπαλμία (Aconitum)',
        'Απαθής, υπνηλέος, σαν ναρκωμένος, ζητά ησυχία (Gelsemium)',
        'Κλαψιάρικη διάθεση, ανάγκη για παρηγοριά και καθαρό αέρα (Pulsatilla)',
        'Απελπισμένος και ανήσυχος, περιφέρεται συνεχώς (Arsenicum)',
        'Ήρεμος και ισόρροπος, χωρίς αξιοσημείωτη αλλαγή διάθεσης'
      ]
    },
    ru: {
      rationale: 'Душевное состояние: По Ганеману, ментальные симптомы — венец симптомов и главный ориентир к подобию.',
      question: 'Каково ваше эмоциональное состояние / расположение духа во время этих симптомов?',
      options: [
        'Сильная раздражительность и гнев, хочет, чтобы оставили в покое (Bryonia)',
        'Тревожное двигательное беспокойство со страхом смерти (Aconitum)',
        'Апатичный, сонный, оглушенный, требует тишины (Gelsemium)',
        'Плаксивый, ищет утешения, заботы и свежего воздуха (Pulsatilla)',
        'В отчаянии и тревожном беспокойстве, мечется (Arsenicum)',
        'Спокойный и уравновешенный, без изменений настроения'
      ]
    }
  }
};

/**
 * Deterministic local classical homoeopathic logic engine (Hahnemann Organon §§ 83–104)
 */
export function evaluateHahnemannLocally(
  newText: string,
  existingMatrix?: Partial<Hahnemann6Pillars>,
  _history: Array<{ question: string; answer: string }> = [],
  _language: string = 'de',
  forceComplete: boolean = false,
  caseType: CaseType = 'akut'
): HahnemannAnalysisResult {
  const langKey = (_language || 'de').toLowerCase();
  const lang = ['de', 'en', 'es', 'fr', 'it', 'el', 'ru'].includes(langKey) ? langKey : 'de';

  const matrix: Hahnemann6Pillars = {
    causa: existingMatrix?.causa || null,
    lokalisierung: existingMatrix?.lokalisierung || null,
    empfindung: existingMatrix?.empfindung || null,
    modalitaeten: existingMatrix?.modalitaeten || null,
    begleitsymptome: Array.isArray(existingMatrix?.begleitsymptome) ? [...existingMatrix.begleitsymptome] : [],
    gemuet: existingMatrix?.gemuet || null,
    strahlungsoptionen: existingMatrix?.strahlungsoptionen || null,
    ursaechlicher_zusammenhang: existingMatrix?.ursaechlicher_zusammenhang || null,
    fruehere_behandlungen_und_historie: existingMatrix?.fruehere_behandlungen_und_historie || null,
  };

  const ignored: string[] = [];
  const textLower = newText.toLowerCase();

  // 1. Fragmentierung & Filterung unbedeutender Drittpersonen/Gegenstände
  const thirdPartyRegex = /\b(der\s+[A-ZÄÖÜ][a-zäöü]+|die\s+[A-ZÄÖÜ][a-zäöü]+|hans|peter|klaus|anna|maria|nachbar|chef|kollege|kugelschreiber|tisch|stuhl|fenster|wetter\s+ist\s+schön|hallo|guten\s+tag)\b/gi;
  let match;
  while ((match = thirdPartyRegex.exec(newText)) !== null) {
    const rawFragment = match[0].trim();
    if (rawFragment && !ignored.includes(rawFragment)) {
      ignored.push(rawFragment);
    }
  }

  // Detect if multiple distinct complaints are present
  const hasFever = textLower.includes('fieber') || textLower.includes('temperatur') || textLower.includes('schüttelfrost') || textLower.includes('fever') || textLower.includes('fièvre') || textLower.includes('fiebre') || textLower.includes('febbre');
  const hasHeadache = textLower.includes('kopfschmerz') || textLower.includes('kopfweh') || textLower.includes('migräne') || textLower.includes('stirn') || textLower.includes('headache') || textLower.includes('céphalée') || textLower.includes('dolor de cabeza');
  const hasThroatOrCough = textLower.includes('hals') || textLower.includes('husten') || textLower.includes('schlucken') || textLower.includes('throat') || textLower.includes('cough') || textLower.includes('toux') || textLower.includes('gorge') || textLower.includes('tos');
  const hasAbdomen = textLower.includes('bauch') || textLower.includes('magen') || textLower.includes('darm') || textLower.includes('übel') || textLower.includes('stomach') || textLower.includes('belly') || textLower.includes('ventre') || textLower.includes('estómago');
  
  const symptomKeywordsCount = [hasFever, hasHeadache, hasThroatOrCough, hasAbdomen].filter(Boolean).length;
  const multipleComplaints = symptomKeywordsCount >= 2;

  // 2. Flexible, fehlertolerante Zuordnung von Patienteneingaben:
  // Führe immer eine semantische Extraktion auf dem Eingabetext durch, um bereits genannte Symptome / Auslöser zu erfassen
  if (newText.trim().length > 0) {
    // Causa
    if (!matrix.causa) {
      if (textLower.includes('kalt') || textLower.includes('cold') || textLower.includes('wind') || textLower.includes('froid') || textLower.includes('frío') || textLower.includes('freddo') || textLower.includes('холод') || textLower.includes('κρύο')) {
        matrix.causa = lang === 'en' ? 'Exposure to cold / wind' : (lang === 'fr' ? 'Exposition au froid / vent' : (lang === 'es' ? 'Exposición al frío / viento' : (lang === 'it' ? 'Esposizione al freddo / vento' : (lang === 'el' ? 'Έκθεση σε κρύο / άνεμο' : (lang === 'ru' ? 'Воздействие холода / ветра' : 'Kälteeinwirkung (kalter Wind / Unterkühlung)')))));
      } else if (textLower.includes('schreck') || textLower.includes('angst') || textLower.includes('fright') || textLower.includes('shock') || textLower.includes('peur') || textLower.includes('miedo') || textLower.includes('paura') || textLower.includes('φόβος') || textLower.includes('испуг')) {
        matrix.causa = lang === 'en' ? 'Fright / sudden shock' : (lang === 'fr' ? 'Frayeur / choc soudain' : (lang === 'es' ? 'Susto / conmoción aguda' : (lang === 'it' ? 'Spavento / shock acuto' : (lang === 'el' ? 'Ξαφνικός φόβος / σοκ' : (lang === 'ru' ? 'Внезапный испуг / шок' : 'Schreck / plötzlicher Schock')))));
      } else if (textLower.includes('nass') || textLower.includes('durchnässt') || textLower.includes('wet') || textLower.includes('drenched') || textLower.includes('mouillé') || textLower.includes('mojado') || textLower.includes('bagnato') || textLower.includes('βρεγμένο') || textLower.includes('промокание')) {
        matrix.causa = lang === 'en' ? 'Getting wet / drenched' : (lang === 'fr' ? 'Humidité / pluie' : (lang === 'es' ? 'Mojarse / humedad' : (lang === 'it' ? 'Bagnarsi / umidità' : (lang === 'el' ? 'Βρέξιμο / υγρασία' : (lang === 'ru' ? 'Промокание / сырость' : 'Durchnässung / Feuchtigkeit')))));
      }
    }

    // Lokalisierung
    if (!matrix.lokalisierung) {
      if (hasFever) {
        matrix.lokalisierung = lang === 'en' ? 'Systemic / Whole body (Fever)' : (lang === 'fr' ? 'Systémique / Corps entier (Fièvre)' : (lang === 'es' ? 'Sistémico / Todo el cuerpo (Fiebre)' : (lang === 'it' ? 'Sistemico / Tutto il corpo (Febbre)' : (lang === 'el' ? 'Συστηματικά / Ολόκληρο το σώμα (Πυρετός)' : (lang === 'ru' ? 'Системно / Все тело (Жар)' : 'Ganzkörper / Systemisch (Fieber)')))));
      } else if (hasHeadache) {
        matrix.lokalisierung = lang === 'en' ? 'Head / Forehead' : (lang === 'fr' ? 'Tête / Front' : (lang === 'es' ? 'Cabeza / Frente' : (lang === 'it' ? 'Testa / Fronte' : (lang === 'el' ? 'Κεφάλι / Μέτωπο' : (lang === 'ru' ? 'Голова / Лоб' : 'Kopf / Stirn')))));
      } else if (hasThroatOrCough) {
        matrix.lokalisierung = lang === 'en' ? 'Throat / Respiratory tract' : (lang === 'fr' ? 'Gorge / Voies respiratoires' : (lang === 'es' ? 'Garganta / Vías respiratorias' : (lang === 'it' ? 'Gola / Vie respiratorie' : (lang === 'el' ? 'Λαιμός / Αναπνευστικό' : (lang === 'ru' ? 'Горло / Дыхательные пути' : 'Hals / Atemwege')))));
      } else if (hasAbdomen) {
        matrix.lokalisierung = lang === 'en' ? 'Gastrointestinal tract' : (lang === 'fr' ? 'Tractus gastro-intestinal' : (lang === 'es' ? 'Tracto gastrointestinal' : (lang === 'it' ? 'Tratto gastrointestinale' : (lang === 'el' ? 'Γαστρεντερικό σύστημα' : (lang === 'ru' ? 'Желудочно-кишечный тракт' : 'Magen-Darm-Trakt')))));
      } else if (_history.length === 0 && newText.trim().length > 2) {
        matrix.lokalisierung = newText.trim();
      }
    }

    // Empfindung
    if (!matrix.empfindung) {
      if (textLower.includes('klopf') || textLower.includes('throb') || textLower.includes('puls') || textLower.includes('battement') || textLower.includes('pulsat') || textLower.includes('пульс')) {
        matrix.empfindung = lang === 'en' ? 'Pulsating, throbbing' : (lang === 'fr' ? 'Battante, pulsatile' : (lang === 'es' ? 'Pulsátil, palpitante' : (lang === 'it' ? 'Pulsante, martellante' : (lang === 'el' ? 'Σφυγμώδης, παλλόμενος' : (lang === 'ru' ? 'Пульсирующий, стучащий' : 'Klopfend und pulsierend')))));
      } else if (textLower.includes('stech') || textLower.includes('stitch') || textLower.includes('piquant') || textLower.includes('punzante') || textLower.includes('pungente') || textLower.includes('σουβλιά') || textLower.includes('колющ')) {
        matrix.empfindung = lang === 'en' ? 'Stitching pain' : (lang === 'fr' ? 'Douleur piquante' : (lang === 'es' ? 'Dolor punzante' : (lang === 'it' ? 'Dolore pungente' : (lang === 'el' ? 'Σουβλιά / οξύς διαπεραστικός πόνος' : (lang === 'ru' ? 'Колющая боль' : 'Stechend')))));
      } else if (textLower.includes('brenn') || textLower.includes('burn') || textLower.includes('brûl') || textLower.includes('ardien') || textLower.includes('bruciore') || textLower.includes('καύσος') || textLower.includes('жгуч')) {
        matrix.empfindung = lang === 'en' ? 'Burning heat' : (lang === 'fr' ? 'Chaleur brûlante' : (lang === 'es' ? 'Calor ardiente' : (lang === 'it' ? 'Calore bruciante' : (lang === 'el' ? 'Καυστική θερμότητα' : (lang === 'ru' ? 'Жгучий жар' : 'Brennende Hitze')))));
      } else if (textLower.includes('zerschlag') || textLower.includes('bruis') || textLower.includes('courbatur') || textLower.includes('magullad') || textLower.includes('spezzat') || textLower.includes('πονεμέν') || textLower.includes('ломот')) {
        matrix.empfindung = lang === 'en' ? 'Bruised, aching in limbs' : (lang === 'fr' ? 'Courbaturé, brisé' : (lang === 'es' ? 'Como magullado' : (lang === 'it' ? 'Dolori ossei, come pestato' : (lang === 'el' ? 'Αίσθημα καταπόνησης / πόνου στα μέλη' : (lang === 'ru' ? 'Ломота, разбитость во всем теле' : 'Wie zerschlagen in allen Gliedern')))));
      }
    }

    // Modalitäten
    if (!matrix.modalitaeten) {
      if (textLower.includes('ruhe') || textLower.includes('rest') || textLower.includes('repos') || textLower.includes('riposo') || textLower.includes('ανάπαυση') || textLower.includes('покое')) {
        matrix.modalitaeten = lang === 'en' ? 'Better from absolute rest' : (lang === 'fr' ? 'Amélioration par le repos' : (lang === 'es' ? 'Mejor con reposo absoluto' : (lang === 'it' ? 'Miglioramento con riposo assoluto' : (lang === 'el' ? 'Βελτίωση με απόλυτη ανάπαυση' : (lang === 'ru' ? 'Улучшение в абсолютном покое' : 'Besserung durch absolute Ruhe')))));
      } else if (textLower.includes('wärme') || textLower.includes('warm') || textLower.includes('chaleur') || textLower.includes('calor') || textLower.includes('caldo') || textLower.includes('θερμότητα') || textLower.includes('тепло')) {
        matrix.modalitaeten = lang === 'en' ? 'Better from warmth' : (lang === 'fr' ? 'Amélioration par la chaleur' : (lang === 'es' ? 'Mejor con calor' : (lang === 'it' ? 'Miglioramento con il calore' : (lang === 'el' ? 'Βελτίωση με τη θερμότητα' : (lang === 'ru' ? 'Улучшение от тепла' : 'Besserung durch Wärme')))));
      } else if (textLower.includes('kälte') || textLower.includes('cold') || textLower.includes('froid') || textLower.includes('frío') || textLower.includes('freddo') || textLower.includes('κρύο') || textLower.includes('холод')) {
        matrix.modalitaeten = lang === 'en' ? 'Better from cool fresh air' : (lang === 'fr' ? 'Amélioration à l\'air frais' : (lang === 'es' ? 'Mejor al aire fresco' : (lang === 'it' ? 'Miglioramento all\'aria fresca' : (lang === 'el' ? 'Βελτίωση στον καθαρό αέρα' : (lang === 'ru' ? 'Улучшение на свежем воздухе' : 'Besserung durch frische Luft')))));
      }
    }

    // Begleitsymptome
    if (matrix.begleitsymptome.length === 0) {
      if (textLower.includes('durst') || textLower.includes('thirst') || textLower.includes('soif') || textLower.includes('sed') || textLower.includes('sete') || textLower.includes('δίψα') || textLower.includes('жажд')) {
        matrix.begleitsymptome.push(lang === 'en' ? 'Thirst for cold drinks' : (lang === 'fr' ? 'Soif de boissons fraîches' : (lang === 'es' ? 'Sed de bebidas frías' : (lang === 'it' ? 'Sete di bevande fredde' : (lang === 'el' ? 'Έντονη δίψα για κρύο νερό' : (lang === 'ru' ? 'Сильная жажда холодной воды' : 'Großer Durst auf kaltes Wasser'))))));
      }
      if (textLower.includes('schweiß') || textLower.includes('sweat') || textLower.includes('sueur') || textLower.includes('sudor') || textLower.includes('sudore') || textLower.includes('ιδρώτας') || textLower.includes('пот')) {
        matrix.begleitsymptome.push(lang === 'en' ? 'Relieving sweat' : (lang === 'fr' ? 'Sueur soulageante' : (lang === 'es' ? 'Sudor que alivia' : (lang === 'it' ? 'Sudorazione che dà sollievo' : (lang === 'el' ? 'Ιδρώτας που ανακουφίζει' : (lang === 'ru' ? 'Облегчающий пот' : 'Erleichternder Schweiß'))))));
      }
    }

    // Gemüt
    if (!matrix.gemuet) {
      if (textLower.includes('unruhe') || textLower.includes('restless') || textLower.includes('agitation') || textLower.includes('inquiet') || textLower.includes('irrequiet') || textLower.includes('ανησυχ') || textLower.includes('беспокой')) {
        matrix.gemuet = lang === 'en' ? 'Anxious restlessness' : (lang === 'fr' ? 'Agitation anxieuse' : (lang === 'es' ? 'Inquietud ansiosa' : (lang === 'it' ? 'Inquietudine ansiosa' : (lang === 'el' ? 'Αγχώδης ανησυχία' : (lang === 'ru' ? 'Тревожное беспокойство' : 'Ängstliche Unruhe')))));
      } else if (textLower.includes('reizbar') || textLower.includes('irritable') || textLower.includes('zorn') || textLower.includes('anger') || textLower.includes('colère') || textLower.includes('ira') || textLower.includes('θυμός') || textLower.includes('раздраж')) {
        matrix.gemuet = lang === 'en' ? 'Irritable, wants to be left alone' : (lang === 'fr' ? 'Irritable, veut être laissé seul' : (lang === 'es' ? 'Irritable, quiere estar solo' : (lang === 'it' ? 'Irritabile, vuole essere lasciato solo' : (lang === 'el' ? 'Ευερέθιστος, θέλει να μείνει μόνος' : (lang === 'ru' ? 'Раздражительный, хочет покоя' : 'Reizbar, will in Ruhe gelassen werden')))));
      } else if (textLower.includes('apath') || textLower.includes('müde') || textLower.includes('drowsy') || textLower.includes('somnol') || textLower.includes('sonnol') || textLower.includes('υπνηλία') || textLower.includes('апати')) {
        matrix.gemuet = lang === 'en' ? 'Apathetic, drowsy' : (lang === 'fr' ? 'Apathique, somnolent' : (lang === 'es' ? 'Apático, somnoliento' : (lang === 'it' ? 'Apatico, sonnolento' : (lang === 'el' ? 'Απαθής, υπνηλικός' : (lang === 'ru' ? 'Апатичный, сонливый' : 'Apathisch, schläfrig')))));
      }
    }

    // Wenn der Benutzer auf eine explizite Frage geantwortet hat (_history > 0):
    if (_history.length > 0) {
      if (multipleComplaints && !existingMatrix?.ursaechlicher_zusammenhang) {
        matrix.ursaechlicher_zusammenhang = newText.trim();
      } else if (caseType === 'chronisch' && !existingMatrix?.fruehere_behandlungen_und_historie) {
        matrix.fruehere_behandlungen_und_historie = newText.trim();
      } else if (!existingMatrix?.causa) {
        matrix.causa = newText.trim();
      } else if (!existingMatrix?.lokalisierung) {
        matrix.lokalisierung = newText.trim();
      } else if (!existingMatrix?.empfindung) {
        matrix.empfindung = newText.trim();
      } else if (!existingMatrix?.modalitaeten) {
        matrix.modalitaeten = newText.trim();
      } else if (!existingMatrix?.begleitsymptome || existingMatrix.begleitsymptome.length === 0) {
        matrix.begleitsymptome = [newText.trim()];
      } else if (!existingMatrix?.gemuet) {
        matrix.gemuet = newText.trim();
      }
    }
  }

  // Check state of 6 pillars
  const hasCausa = Boolean(matrix.causa && matrix.causa !== 'Noch nicht genannt' && matrix.causa.trim().length > 0);
  const hasLokalisierung = Boolean(matrix.lokalisierung && matrix.lokalisierung !== 'Noch nicht genannt' && matrix.lokalisierung.trim().length > 0);
  const hasEmpfindung = Boolean(matrix.empfindung && matrix.empfindung !== 'Noch nicht genannt' && matrix.empfindung.trim().length > 0);
  const hasModalitaeten = Boolean(matrix.modalitaeten && matrix.modalitaeten !== 'Noch nicht genannt' && matrix.modalitaeten.trim().length > 0);
  const hasBegleitsymptome = Boolean(Array.isArray(matrix.begleitsymptome) && matrix.begleitsymptome.length > 0);
  const hasGemuet = Boolean(matrix.gemuet && matrix.gemuet !== 'Noch nicht genannt' && matrix.gemuet.trim().length > 0);
  const hasCausalityCheck = !multipleComplaints || Boolean(matrix.ursaechlicher_zusammenhang);
  const hasChronicHistoryCheck = caseType !== 'chronisch' || Boolean(matrix.fruehere_behandlungen_und_historie);

  const allPillarsCompleted = hasCausa && hasLokalisierung && hasEmpfindung && hasModalitaeten && hasBegleitsymptome && hasGemuet && hasCausalityCheck && hasChronicHistoryCheck;

  let nextQuestion = '';
  let rationale = '';
  let status: 'in_progress' | 'completed' = 'in_progress';
  let auswahlOptionen: string[] = [];
  let auswahlTyp: 'single' | 'multiple' = 'single';
  const diffRemedies: string[] = [];

  const getQ = (key: string): LocalizedQuestionData => {
    const group = LOCALIZED_QUESTIONS[key];
    return group?.[lang] || group?.['de'];
  };

  // Extract human-readable symptom hint to formulate customized, non-generic questions
  const symptomHint = (matrix.lokalisierung || newText || '').trim();
  const displaySymptom = symptomHint.length > 40 ? symptomHint.substring(0, 40) + '...' : symptomHint;

  const personalize = (baseQ: string, key: string): string => {
    if (!displaySymptom || displaySymptom.length < 3) return baseQ;
    if (key === 'causa') {
      if (lang === 'en') return `Regarding your complaint (${displaySymptom}): ${baseQ}`;
      if (lang === 'fr') return `Concernant vos troubles (${displaySymptom}) : ${baseQ}`;
      if (lang === 'es') return `Con respecto a sus molestias (${displaySymptom}): ${baseQ}`;
      if (lang === 'it') return `Riguardo ai suoi disturbi (${displaySymptom}): ${baseQ}`;
      if (lang === 'el') return `Σχετικά με τα συμπτώματά σας (${displaySymptom}): ${baseQ}`;
      if (lang === 'ru') return `Относительно ваших жалоб (${displaySymptom}): ${baseQ}`;
      return `Zu Ihren Beschwerden (${displaySymptom}): ${baseQ}`;
    }
    if (key === 'lokalisierung') {
      if (lang === 'en') return `Regarding (${displaySymptom}): ${baseQ}`;
      if (lang === 'fr') return `Concernant (${displaySymptom}) : ${baseQ}`;
      if (lang === 'es') return `En relación con (${displaySymptom}): ${baseQ}`;
      if (lang === 'it') return `In merito a (${displaySymptom}): ${baseQ}`;
      if (lang === 'el') return `Σχετικά με (${displaySymptom}): ${baseQ}`;
      if (lang === 'ru') return `В отношении (${displaySymptom}): ${baseQ}`;
      return `Bezüglich (${displaySymptom}): ${baseQ}`;
    }
    if (key === 'empfindung') {
      if (lang === 'en') return `Regarding the pain sensation in (${displaySymptom}): ${baseQ}`;
      if (lang === 'fr') return `Concernant la sensation liée à (${displaySymptom}) : ${baseQ}`;
      if (lang === 'es') return `Respecto a la sensación de dolor en (${displaySymptom}): ${baseQ}`;
      if (lang === 'it') return `Riguardo alla sensazione dolorosa in (${displaySymptom}): ${baseQ}`;
      if (lang === 'el') return `Σχετικά με την αίσθηση του πόνου στο σύμπτωμα (${displaySymptom}): ${baseQ}`;
      if (lang === 'ru') return `Относительно ощущений при (${displaySymptom}): ${baseQ}`;
      return `Bezüglich der Schmerzempfindung bei (${displaySymptom}): ${baseQ}`;
    }
    if (key === 'modalitaeten') {
      if (lang === 'en') return `For your condition (${displaySymptom}): ${baseQ}`;
      if (lang === 'fr') return `Pour vos troubles (${displaySymptom}) : ${baseQ}`;
      if (lang === 'es') return `Para su afección (${displaySymptom}): ${baseQ}`;
      if (lang === 'it') return `Per il suo disturbo (${displaySymptom}): ${baseQ}`;
      if (lang === 'el') return `Για τα ενοχλήματά σας (${displaySymptom}): ${baseQ}`;
      if (lang === 'ru') return `Для вашей жалобы (${displaySymptom}): ${baseQ}`;
      return `Bezüglich der Besserung oder Verschlechterung bei (${displaySymptom}): ${baseQ}`;
    }
    return baseQ;
  };

  if (forceComplete || allPillarsCompleted || (_history.length >= 6 && hasEmpfindung && hasModalitaeten && hasGemuet)) {
    status = 'completed';
    nextQuestion = '';
    auswahlOptionen = [];
    rationale = lang === 'en' 
      ? 'All pillars of the homoeopathic intake according to Hahnemann (Organon §§ 83–104) have been completely recorded.'
      : (lang === 'fr' 
        ? 'Tous les piliers de l\'anamnèse homéopathique selon Hahnemann (Organon §§ 83–104) ont été intégralement recueillis.'
        : (lang === 'es'
          ? 'Todos los pilares de la anamnesis según Hahnemann (Organon §§ 83–104) se han registrado por completo.'
          : (lang === 'it'
            ? 'Tutti i pilastri dell\'anamnesi omeopatica secondo Hahnemann (Organon §§ 83–104) sono stati completamente registrati.'
            : (lang === 'el'
              ? 'Όλοι οι πυλώνες της ομοιοπαθητικής λήψης ιστορικού κατά Χάνεμαν (Όργανον §§ 83–104) έχουν καταγραφεί πλήρως.'
              : (lang === 'ru'
                ? 'Все столпы гомеопатического анамнеза по Ганеману (Органон §§ 83–104) полностью зафиксированы.'
                : 'Alle Säulen der homöopathischen Anamnese nach Hahnemann (Organon §§ 83–104) wurden vollständig erfasst.')))));

    if (matrix.modalitaeten?.toLowerCase().includes('ruhe') || matrix.modalitaeten?.toLowerCase().includes('rest') || matrix.modalitaeten?.toLowerCase().includes('druck')) {
      diffRemedies.push('Bryonia alba', 'Silicea', 'Belladonna');
    } else if (matrix.gemuet?.toLowerCase().includes('unruhe') || matrix.gemuet?.toLowerCase().includes('restless') || matrix.causa?.toLowerCase().includes('kält') || matrix.causa?.toLowerCase().includes('cold')) {
      diffRemedies.push('Aconitum napellus', 'Belladonna', 'Arsenicum album');
    } else {
      diffRemedies.push('Aconitum napellus', 'Belladonna', 'Ferrum phosphoricum', 'Apis mellifica');
    }
  } else if (multipleComplaints && !matrix.ursaechlicher_zusammenhang) {
    const qData = getQ('causality');
    rationale = qData.rationale;
    nextQuestion = personalize(qData.question, 'causality');
    auswahlOptionen = qData.options;
    auswahlTyp = 'single';
    diffRemedies.push('Aconitum napellus', 'Belladonna', 'Bryonia alba');
  } else if (caseType === 'chronisch' && !matrix.fruehere_behandlungen_und_historie) {
    const qData = getQ('chronicHistory');
    rationale = qData.rationale;
    nextQuestion = personalize(qData.question, 'chronicHistory');
    auswahlOptionen = qData.options;
    auswahlTyp = 'single';
    diffRemedies.push('Sulphur', 'Calcarea carbonica', 'Lycopodium clavatum', 'Silicea');
  } else if (!hasCausa) {
    const qData = getQ('causa');
    rationale = qData.rationale;
    nextQuestion = personalize(qData.question, 'causa');
    auswahlOptionen = qData.options;
    auswahlTyp = 'single';
    diffRemedies.push('Aconitum napellus', 'Belladonna', 'Bryonia alba', 'Rhus toxicodendron');
  } else if (!hasLokalisierung) {
    const qData = getQ('lokalisierung');
    rationale = qData.rationale;
    nextQuestion = personalize(qData.question, 'lokalisierung');
    auswahlOptionen = qData.options;
    auswahlTyp = 'single';
    diffRemedies.push('Belladonna', 'Bryonia alba', 'Gelsemium sempervirens');
  } else if (!hasEmpfindung) {
    const qData = getQ('empfindung');
    rationale = qData.rationale;
    nextQuestion = personalize(qData.question, 'empfindung');
    auswahlOptionen = qData.options;
    auswahlTyp = 'single';
    diffRemedies.push('Aconitum napellus', 'Belladonna', 'Bryonia alba', 'Ferrum phosphoricum');
  } else if (!hasModalitaeten) {
    const qData = getQ('modalitaeten');
    rationale = qData.rationale;
    nextQuestion = personalize(qData.question, 'modalitaeten');
    auswahlOptionen = qData.options;
    auswahlTyp = 'multiple';
    diffRemedies.push('Bryonia alba', 'Silicea', 'Belladonna', 'Aconitum napellus');
  } else if (!hasBegleitsymptome) {
    const qData = getQ('begleitsymptome');
    rationale = qData.rationale;
    nextQuestion = personalize(qData.question, 'begleitsymptome');
    auswahlOptionen = qData.options;
    auswahlTyp = 'multiple';
    diffRemedies.push('Aconitum napellus', 'Belladonna', 'Apis mellifica', 'Gelsemium sempervirens');
  } else if (!hasGemuet) {
    const qData = getQ('gemuet');
    rationale = qData.rationale;
    nextQuestion = personalize(qData.question, 'gemuet');
    auswahlOptionen = qData.options;
    auswahlTyp = 'single';
    diffRemedies.push('Bryonia alba', 'Aconitum napellus', 'Belladonna', 'Pulsatilla');
  }

  let summary: string | null = null;
  const clarifyingQuestions: HahnemannClarifyingQuestion[] = [];

  if (status === 'completed') {
    if (lang === 'en') {
      summary = `Therapist Summary:\nClassical in-depth intake according to Samuel Hahnemann (Organon §§ 83–104):\n• 1. Causa (Trigger / Onset): ${matrix.causa || 'No specific trigger recorded'}\n• 2. Localization & Radiation: ${matrix.lokalisierung || 'Systemic'}\n• 3. Sensation (Quality): ${matrix.empfindung || 'Not further specified'}\n• 4. Modalities (Better / Worse): ${matrix.modalitaeten || 'No specific modalities recorded'}\n• 5. Concomitants: ${matrix.begleitsymptome?.length ? matrix.begleitsymptome.join(', ') : 'No prominent concomitants'}\n• 6. Mind (Mental state): ${matrix.gemuet || 'Equable / balanced'}\n\nLeading remedy recommendation: ${diffRemedies[0] || 'Bryonia alba'} based on totality of the 6 pillars.`;
    } else if (lang === 'fr') {
      summary = `Synthèse pour le thérapeute :\nAnamnèse approfondie selon Samuel Hahnemann (Organon §§ 83–104) :\n• 1. Causa (Déclencheur / Début) : ${matrix.causa || 'Aucun déclencheur précis'}\n• 2. Localisation & Rayonnement : ${matrix.lokalisierung || 'Systémique'}\n• 3. Sensation (Qualité) : ${matrix.empfindung || 'Non spécifiée'}\n• 4. Modalités (Amélioration / Aggravation) : ${matrix.modalitaeten || 'Aucune modalité notée'}\n• 5. Concomitants : ${matrix.begleitsymptome?.length ? matrix.begleitsymptome.join(', ') : 'Aucun concomitant notable'}\n• 6. Mental (État psychique) : ${matrix.gemuet || 'Équilibré'}\n\nSimilé homéopathique prédominant : ${diffRemedies[0] || 'Bryonia alba'} selon la totalité des 6 piliers.`;
    } else if (lang === 'es') {
      summary = `Resumen para el terapeuta:\nAnamnesis profunda según Samuel Hahnemann (Organon §§ 83–104):\n• 1. Causa (Desencadenante / Inicio): ${matrix.causa || 'Sin desencadenante específico'}\n• 2. Localización y Radiación: ${matrix.lokalisierung || 'Sistémica'}\n• 3. Sensación (Calidad): ${matrix.empfindung || 'No especificada'}\n• 4. Modalidades (Mejoría / Empeoramiento): ${matrix.modalitaeten || 'Sin modalidades específicas'}\n• 5. Síntomas concomitantes: ${matrix.begleitsymptome?.length ? matrix.begleitsymptome.join(', ') : 'Sin concomitantes destacados'}\n• 6. Mente (Estado anímico): ${matrix.gemuet || 'Equilibrado'}\n\nSimillimum principal: ${diffRemedies[0] || 'Bryonia alba'} basado en la totalidad de los 6 pilares.`;
    } else if (lang === 'it') {
      summary = `Sintesi per il terapeuta:\nAnamnesi approfondita secondo Samuel Hahnemann (Organon §§ 83–104):\n• 1. Causa (Fattore scatenante / Inizio): ${matrix.causa || 'Nessun fattore specifico'}\n• 2. Localizzazione e Irradiazione: ${matrix.lokalisierung || 'Sistemica'}\n• 3. Sensazione (Qualità): ${matrix.empfindung || 'Non specificata'}\n• 4. Modalità (Miglioramento / Peggioramento): ${matrix.modalitaeten || 'Nessuna modalità rilevata'}\n• 5. Sintomi concomitanti: ${matrix.begleitsymptome?.length ? matrix.begleitsymptome.join(', ') : 'Nessun sintomo concomitante'}\n• 6. Mente (Stato d\'animo): ${matrix.gemuet || 'Equilibrato'}\n\nSimillimum principale: ${diffRemedies[0] || 'Bryonia alba'} basato sulla totalità dei 6 pilastri.`;
    } else if (lang === 'el') {
      summary = `Σύνοψη για τον θεραπευτή:\nΕμπεριστατωμένη λήψη κατά Samuel Hahnemann (Organon §§ 83–104):\n• 1. Causa (Έναυσμα / Έναρξη): ${matrix.causa || 'Χωρίς συγκεκριμένο έναυσμα'}\n• 2. Εντόπιση & Αντανάκλαση: ${matrix.lokalisierung || 'Συστηματική'}\n• 3. Αίσθηση (Ποιότητα πόνου): ${matrix.empfindung || 'Μη καθορισμένη'}\n• 4. Τροποποιητικοί παράγοντες (Βελτίωση / Επιδείνωση): ${matrix.modalitaeten || 'Χωρίς καταγεγραμμένους παράγοντες'}\n• 5. Συνοδά συμπτώματα: ${matrix.begleitsymptome?.length ? matrix.begleitsymptome.join(', ') : 'Χωρίς αξιοσημείωτα συνοδά'}\n• 6. Ψυχισμός (Διάθεση): ${matrix.gemuet || 'Ισορροπημένος'}\n\nΚύριο όμοιο φάρμακο: ${diffRemedies[0] || 'Bryonia alba'} βάσει της ολότητας των 6 πυλώνων.`;
    } else if (lang === 'ru') {
      summary = `Сводка для терапевта:\nКлассический углубленный опрос по Самуэлю Ганеману (Органон §§ 83–104):\n• 1. Causa (Триггер / Начало): ${matrix.causa || 'Специфический триггер не указан'}\n• 2. Локализация и иррадиация: ${matrix.lokalisierung || 'Системно'}\n• 3. Ощущение (Качество боли): ${matrix.empfindung || 'Не уточнено'}\n• 4. Модальности (Улучшение / Ухудшение): ${matrix.modalitaeten || 'Без явных модальностей'}\n• 5. Сопутствующие симптомы: ${matrix.begleitsymptome?.length ? matrix.begleitsymptome.join(', ') : 'Без выраженных сопутствующих'}\n• 6. Психика (Настроение): ${matrix.gemuet || 'Спокойное'}\n\nВедущее подобие (Симилиум): ${diffRemedies[0] || 'Bryonia alba'} на основе совокупности 6 столпов.`;
    } else {
      summary = `Zusammenfassung für den Therapeuten:
Die homöopathische Vertiefungs-Anamnese nach Hahnemann & Bönninghausen ergibt auf Basis der 6-Säulen-Matrix (Organon §§ 83–104):
• 1. Causa (Auslöser): ${matrix.causa || 'Kein spezifischer Auslöser genannt'}
• 2. Lokalisierung (Ort / Gewebe): ${matrix.lokalisierung || 'Systemisch / Ganzkörperlich'}
• 3. Empfindung (Sensation / Qualität): ${matrix.empfindung || 'Nicht näher spezifiziert'}
• 4. Modalitäten (Besser / Schlechter): ${matrix.modalitaeten || 'Keine Modalitäten genannt'}
• 5. Begleitsymptome (Concomitants): ${matrix.begleitsymptome && matrix.begleitsymptome.length > 0 ? matrix.begleitsymptome.join(', ') : 'Keine Begleitsymptome genannt'}
• 6. Gemüt (Psychischer Zustand): ${matrix.gemuet || 'Ausgeglichen / unauffällig'}

Homöopathische Simile-Differenzierung: Führendes Simile ist ${diffRemedies[0] || 'Bryonia alba'} basierend auf der exakten Gesamtheit der erhobenen 6 Säulen.`;
    }

    if (lang === 'en') {
      clarifyingQuestions.push({
        id: 'q_modalitaet',
        frage: 'How does the pain respond to firm pressure or bandaging versus motion?',
        grund: 'Differentiates pressure relief (Silicea, Bryonia) from touch sensitivity (Belladonna)',
        kategorie: 'modalitaeten',
        optionen: [
          'Firm pressure and bandaging relieve noticeably',
          'Slightest motion and jarring worsen',
          'Relief from gentle motion in open fresh air',
          'Neither pressure nor motion affects the pain'
        ]
      });
      clarifyingQuestions.push({
        id: 'q_begleit',
        frage: 'How do thirst and temperature preferences behave during the condition?',
        grund: 'Important general symptom according to Bönninghausen to secure the simile',
        kategorie: 'begleitsymptome',
        optionen: [
          'Great thirst for large amounts of cold water',
          'Complete thirstlessness despite heat/pain',
          'Marked chilliness, desires warm wrapping',
          'Aversion to fresh air and cold'
        ]
      });
    } else if (lang === 'fr') {
      clarifyingQuestions.push({
        id: 'q_modalitaet',
        frage: 'Comment la douleur réagit-elle à une pression ferme ou un bandage par rapport au mouvement ?',
        grund: 'Différencie le soulagement par la pression (Silicea, Bryonia) de l\'hypersensibilité au toucher (Belladonna)',
        kategorie: 'modalitaeten',
        optionen: [
          'Une pression ferme et un bandage soulagent nettement',
          'Le moindre mouvement ou secousse aggrave',
          'Soulagement par le mouvement doux au grand air',
          'Ni la pression ni le mouvement ne modifient la douleur'
        ]
      });
      clarifyingQuestions.push({
        id: 'q_begleit',
        frage: 'Comment se manifestent la soif et la sensibilité thermique pendant l\'épisode ?',
        grund: 'Symptôme général essentiel selon Bönninghausen pour confirmer le similé',
        kategorie: 'begleitsymptome',
        optionen: [
          'Grande soif de grandes quantités d\'eau froide',
          'Absence totale de soif malgré la chaleur',
          'Frilosité marquée, besoin de se couvrir chaudement',
          'Aversion pour l\'air frais et le froid'
        ]
      });
    } else if (lang === 'es') {
      clarifyingQuestions.push({
        id: 'q_modalitaet',
        frage: '¿Cómo responde el dolor a la presión firme o vendaje frente al movimiento?',
        grund: 'Diferencia el alivio por presión (Silicea, Bryonia) de la sensibilidad al tacto (Belladonna)',
        kategorie: 'modalitaeten',
        optionen: [
          'La presión firme y el vendaje alivian notablemente',
          'El menor movimiento y sacudida empeoran',
          'Alivio con el movimiento suave al aire libre',
          'Ni la presión ni el movimiento modifican el dolor'
        ]
      });
      clarifyingQuestions.push({
        id: 'q_begleit',
        frage: '¿Cómo se comportan la sed y la temperatura durante el cuadro agudo?',
        grund: 'Síntoma general clave según Bönninghausen para asegurar el simillimum',
        kategorie: 'begleitsymptome',
        optionen: [
          'Gran sed de abundantes cantidades de agua fría',
          'Ausencia total de sed a pesar del calor o dolor',
          'Frialdad marcada, deseo de abrigarse bien',
          'Aversión al aire fresco y al frío'
        ]
      });
    } else if (lang === 'it') {
      clarifyingQuestions.push({
        id: 'q_modalitaet',
        frage: 'Come risponde il dolore alla pressione decisa o al bendaggio rispetto al movimento?',
        grund: 'Differenzia il sollievo da pressione (Silicea, Bryonia) dall\'ipersensibilità al contatto (Belladonna)',
        kategorie: 'modalitaeten',
        optionen: [
          'Pressione forte e fasciatura migliorano sensibilmente',
          'Il minimo movimento e le scosse peggiorano',
          'Sollievo con il movimento dolce all\'aria aperta',
          'Né la pressione né il movimento modificano il dolore'
        ]
      });
      clarifyingQuestions.push({
        id: 'q_begleit',
        frage: 'Come si manifestano la sete e le preferenze di temperatura durante il disturbo?',
        grund: 'Importante sintomo generale secondo Bönninghausen per verificare il rimedio',
        kategorie: 'begleitsymptome',
        optionen: [
          'Grande sete di molta acqua fredda',
          'Completa assenza di sete nonostante il calore',
          'Marcata freddolosità, desiderio di coprirsi caldamente',
          'Avversione all\'aria fresca e al freddo'
        ]
      });
    } else if (lang === 'el') {
      clarifyingQuestions.push({
        id: 'q_modalitaet',
        frage: 'Πώς ανταποκρίνεται ο πόνος στη σταθερή πίεση ή επίδεση σε σχέση με την κίνηση;',
        grund: 'Διαφοροποίηση της βελτίωσης από πίεση (Silicea, Bryonia) από την ευαισθησία στο άγγιγμα (Belladonna)',
        kategorie: 'modalitaeten',
        optionen: [
          'Η σταθερή πίεση και η σφιχτή επίδεση ανακουφίζουν αισθητά',
          'Η παραμικρή κίνηση και οι κραδασμοί επιδεινώνουν',
          'Ανακούφιση με ήπια κίνηση στον καθαρό αέρα',
          'Ούτε η πίεση ούτε η κίνηση επηρεάζουν τον πόνο'
        ]
      });
      clarifyingQuestions.push({
        id: 'q_begleit',
        frage: 'Πώς συμπεριφέρεται η δίψα και η επιθυμία θερμοκρασίας κατά τη διάρκεια της κατάστασης;',
        grund: 'Σημαντικό γενικό σύμπτωμα κατά Bönninghausen για επιβεβαίωση του ομοίου',
        kategorie: 'begleitsymptome',
        optionen: [
          'Έντονη δίψα για μεγάλες ποσότητες κρύου νερού',
          'Πλήρης απουσία δίψας παρά τη θερμότητα / πόνο',
          'Έντονο ρίγος, ανάγκη για ζεστό τύλιγμα',
          'Αποστροφή στον καθαρό αέρα και το κρύο'
        ]
      });
    } else if (lang === 'ru') {
      clarifyingQuestions.push({
        id: 'q_modalitaet',
        frage: 'Как боль реагирует на сильное давление или тугую повязку в сравнении с движением?',
        grund: 'Дифференцирует облегчение от давления (Silicea, Bryonia) от гиперчувствительности к прикосновению (Belladonna)',
        kategorie: 'modalitaeten',
        optionen: [
          'Сильное давление и тугая повязка заметно облегчают',
          'Малейшее движение и сотрясение ухудшают',
          'Облегчение от плавного движения на свежем воздухе',
          'Ни давление, ни движение не меняют характер боли'
        ]
      });
      clarifyingQuestions.push({
        id: 'q_begleit',
        frage: 'Как ведет себя жажда и отношение к температуре во время приступа?',
        grund: 'Важный общий симптом по Беннингхаузену для подтверждения симилиума',
        kategorie: 'begleitsymptome',
        optionen: [
          'Сильная жажда больших количеств холодной воды',
          'Полное отсутствие жажды несмотря на жар/боль',
          'Выраженная зябкость, желание тепло укутаться',
          'Отвращение к свежему воздуху и холоду'
        ]
      });
    } else {
      clarifyingQuestions.push({
        id: 'q_modalitaet',
        frage: 'Wie reagieren die Schmerzen auf feste Bandagierung oder Druck versus Bewegung?',
        grund: 'Differenziert Druckbesserung (Silicea, Bryonia) von Berührungsüberempfindlichkeit (Belladonna)',
        kategorie: 'modalitaeten',
        optionen: [
          'Fester Druck und Bandagierung bessern deutlich',
          'Geringste Bewegung und Erschütterung verschlimmern',
          'Besserung durch sanfte Bewegung an der frischen Luft',
          'Weder Druck noch Bewegung verändern die Schmerzen'
        ]
      });
      clarifyingQuestions.push({
        id: 'q_begleit',
        frage: 'Wie verhält sich das Durst- und Temperaturverlangen während des Zustands?',
        grund: 'Wichtiges Generalsymptom nach Bönninghausen zur Absicherung des Mittels',
        kategorie: 'begleitsymptome',
        optionen: [
          'Großer Durst auf große Mengen kaltes Wasser',
          'Völlige Durstlosigkeit trotz Hitze/Schmerz',
          'Ausgeprägtes Frösteln, Verlangen nach warmer Einhüllung',
          'Abneigung gegen frische Luft und Kälte'
        ]
      });
    }
  }

  return {
    analyse_status: status,
    wichtige_symptom_fragmente: matrix,
    falltyp: caseType,
    mehrere_symptome_erkannt: multipleComplaints,
    symptomkomplex_bestaetigt: Boolean(matrix.ursaechlicher_zusammenhang && (matrix.ursaechlicher_zusammenhang.toLowerCase().includes('ja') || matrix.ursaechlicher_zusammenhang.toLowerCase().includes('zeitgleich'))),
    ignorierte_daten: ignored,
    kontroll_und_nachfrage_logik: rationale,
    naechste_frage: nextQuestion,
    auswahl_optionen: auswahlOptionen,
    auswahl_typ: auswahlTyp,
    aktuelle_mittel_differenzierung: diffRemedies,
    end_analyse_zusammenfassung: summary,
    sich_ergebende_fragen: clarifyingQuestions.slice(0, 3),
  };
}
