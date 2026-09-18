import { LanguageCode } from '../types';
import { AcuteAnswers, AcuteClarificationOption, AcuteClarificationQuestion } from './acuteClarificationService';

interface PairDifferentialDef {
  title: Record<LanguageCode, string>;
  desc?: Record<LanguageCode, string>;
  opt1: Record<LanguageCode, string>;
  opt2: Record<LanguageCode, string>;
}

const CATEGORY_NAMES: Record<LanguageCode, string> = {
  de: 'Sich ergebende Fragen aus Antworten',
  en: 'Questions Arising from Answers',
  es: 'Preguntas derivadas de las respuestas',
  fr: 'Questions découlant des réponses',
  it: 'Domande derivate dalle risposte',
  el: 'Ερωτήσεις που προκύπτουν από τις απαντήσεις',
  ru: 'Вопросы, вытекающие из ответов'
};

const NEITHER_LABELS: Record<LanguageCode, string> = {
  de: 'Weder noch / Nicht sicher differenzierbar',
  en: 'Neither / Not clearly distinguishable',
  es: 'Ninguno de los dos / No diferenciable claramente',
  fr: 'Aucun des deux / Pas clairement différenciable',
  it: 'Nessuno dei due / Non chiaramente differenziabile',
  el: 'Κανένα από τα δύο / Μη σαφώς διακριτό',
  ru: 'Ни один из двух / Невозможно чётко различить'
};

// Key format: sorted pair "idA___idB"
const PAIR_DEFINITIONS: Record<string, PairDifferentialDef> = {
  'aconitum-napellus___belladonna': {
    title: {
      de: 'Aconitum vs. Belladonna: Schweiß, Hautzustand und Pulsation',
      en: 'Aconitum vs. Belladonna: Sweat, skin condition, and pulsation',
      es: 'Aconitum vs. Belladonna: Sudor, estado cutáneo y pulsación',
      fr: 'Aconitum vs. Belladonna : Transpiration, état cutané et pulsation',
      it: 'Aconitum vs. Belladonna: Sudore, condizione cutanea e pulsazione',
      el: 'Aconitum vs. Belladonna: Ίδρωτας, δερματική κατάσταση και σφυγμός',
      ru: 'Aconitum vs. Belladonna: Пот, состояние кожи и пульсация'
    },
    opt1: {
      de: 'Trockene, glühend heiße Haut ohne Schweiß, plötzliche Todesangst und panische Unruhe (Aconitum)',
      en: 'Dry, burning hot skin without sweat, sudden fear of death and panic restlessness (Aconitum)',
      es: 'Piel seca y ardiente sin sudor, miedo súbito a la muerte y agitación (Aconitum)',
      fr: 'Peau sèche et brûlante sans sueur, angoisse brutale de mort et agitation (Aconitum)',
      it: 'Pelle secca e rovente senza sudore, paura improvvisa di morte e irrequietezza (Aconitum)',
      el: 'Ξηρό, καυτό δέρμα χωρίς ίδρωτα, ξαφνικός φόβος θανάτου και ανησυχία (Aconitum)',
      ru: 'Сухая, пылающая кожа без пота, внезапный страх смерти и тревожное беспокойство (Aconitum)'
    },
    opt2: {
      de: 'Heißer Kopf mit pulsierenden Schläfen, Schweißausbrüchen und Licht-/Geräuschempfindlichkeit (Belladonna)',
      en: 'Hot flushed head with throbbing temples, profuse sweating, sensitive to light and noise (Belladonna)',
      es: 'Cabeza caliente con sienes pulsantes, sudoración y sensibilidad a luz/ruido (Belladonna)',
      fr: 'Tête brûlante avec tempes battantes, sueurs abondantes et intolérance bruit/lumière (Belladonna)',
      it: 'Testa calda con tempie pulsanti, sudorazione e intolleranza a luce/rumore (Belladonna)',
      el: 'Καυτό κεφάλι με παλλόμενους κροτάφους, εφίδρωση και ευαισθησία στο φως/θόρυβο (Belladonna)',
      ru: 'Горячая голова с пульсацией в висках, приливы пота, гиперчувствительность к свету/шуму (Belladonna)'
    }
  },
  'bryonia-alba___rhus-toxicodendron': {
    title: {
      de: 'Bryonia vs. Rhus tox: Einfluss von Bewegung und Ruhe',
      en: 'Bryonia vs. Rhus tox: Influence of movement and rest',
      es: 'Bryonia vs. Rhus tox: Influencia del movimiento y el reposo',
      fr: 'Bryonia vs. Rhus tox : Influence du mouvement et du repos',
      it: 'Bryonia vs. Rhus tox: Influenza del movimento e del riposo',
      el: 'Bryonia vs. Rhus tox: Επίδραση κίνησης και ανάπαυσης',
      ru: 'Bryonia vs. Rhus tox: Влияние движения и покоя'
    },
    opt1: {
      de: 'Jede kleinste Bewegung verschlimmert unerträglich; Verlangen nach absolutem Stillliegen (Bryonia)',
      en: 'The slightest movement worsens intolerably; strong desire to lie completely still (Bryonia)',
      es: 'El menor movimiento empeora insoportablemente; deseo de reposo absoluto (Bryonia)',
      fr: 'Le moindre mouvement aggrave intolérablement ; désir de repos absolu (Bryonia)',
      it: 'Il minimo movimento peggiora insopportabilmente; desiderio di assoluta immobilità (Bryonia)',
      el: 'Η παραμικρή κίνηση χειροτερεύει ανυπόφορα· επιθυμία για απόλυτη ακινησία (Bryonia)',
      ru: 'Малейшее движение невыносимо ухудшает; потребность в абсолютном покое (Bryonia)'
    },
    opt2: {
      de: 'Steifigkeit bei erstem Bewegen, aber fortgesetzte Bewegung und warmes Einhüllen bessern (Rhus tox)',
      en: 'Initial stiffness on first motion, but continuous movement and warm wrapping relieve (Rhus tox)',
      es: 'Rigidez al inicio del movimiento, pero el movimiento continuo y el calor alivian (Rhus tox)',
      fr: 'Raideur au premier mouvement, mais le mouvement continu et la chaleur soulagent (Rhus tox)',
      it: 'Rigidità al primo movimento, ma il movimento continuato e il calore migliorano (Rhus tox)',
      el: 'Ακαμψία στην πρώτη κίνηση, αλλά η συνεχής κίνηση και η ζεστασιά βελτιώνουν (Rhus tox)',
      ru: 'Скованность в начале движения, но продолжительное движение и тепло облегчают (Rhus tox)'
    }
  },
  'chamomilla___nux-vomica': {
    title: {
      de: 'Nux vomica vs. Chamomilla: Schmerztoleranz, Gemüt und Kälte',
      en: 'Nux vomica vs. Chamomilla: Pain tolerance, temperament, and cold',
      es: 'Nux vomica vs. Chamomilla: Tolerancia al dolor, temperamento y frío',
      fr: 'Nux vomica vs. Chamomilla : Tolérance à la douleur, humeur et frilosité',
      it: 'Nux vomica vs. Chamomilla: Tolleranza al dolore, temperamento e freddo',
      el: 'Nux vomica vs. Chamomilla: Ανοχή στον πόνο, διάθεση και κρύο',
      ru: 'Nux vomica vs. Chamomilla: Непереносимость боли, характер и холод'
    },
    opt1: {
      de: 'Schmerzen völlig unerträglich, zornige Raserei, wehleidig, abweisend (Chamomilla)',
      en: 'Pains are completely unbearable, frantic rage, whining, refusing comfort (Chamomilla)',
      es: 'Dolores completamente insoportables, rabia histérica, quejumbroso, rechaza consuelo (Chamomilla)',
      fr: 'Douleurs intolérables, colère furieuse, gémissant, repousse le réconfort (Chamomilla)',
      it: 'Dolori insopportabili, rabbia frenetica, lagnoso, rifiuta consolazione (Chamomilla)',
      el: 'Πόνος εντελώς ανυπόφορος, οργισμένη αγανάκτηση, γκρίνια, απόρριψη παρηγοριάς (Chamomilla)',
      ru: 'Боль абсолютно невыносима, яростное раздражение, капризность, отвергает ласку (Chamomilla)'
    },
    opt2: {
      de: 'Überreizt durch Stress/Genussmittel, extrem fröstelig, zornig und ungeduldig (Nux vomica)',
      en: 'Overstressed, chilled to the bone, impatient, irritable after excess or stimulants (Nux vomica)',
      es: 'Hipersensible por estrés/excesos, muy friolero, impaciente e irritable (Nux vomica)',
      fr: 'Surmené, très frileux, impatient, irritable après stress ou excès (Nux vomica)',
      it: 'Ipersensibile per stress/eccessi, freddoloso, impaziente e irritabile (Nux vomica)',
      el: 'Υπερερεθισμένος από άγχος/διεγερτικά, έντονο ρίγος, ανυπόμονος και ευερέθιστος (Nux vomica)',
      ru: 'Перегружен стрессом/стимуляторами, зябкий, нетерпеливый, раздражительный (Nux vomica)'
    }
  },
  'arsenicum-album___pulsatilla-pratensis': {
    title: {
      de: 'Arsenicum vs. Pulsatilla: Wärme, Durst und Gemüt',
      en: 'Arsenicum vs. Pulsatilla: Warmth, thirst, and emotional state',
      es: 'Arsenicum vs. Pulsatilla: Calor, sed y estado anímico',
      fr: 'Arsenicum vs. Pulsatilla : Chaleur, soif et état émotionnel',
      it: 'Arsenicum vs. Pulsatilla: Calore, sete e stato emotivo',
      el: 'Arsenicum vs. Pulsatilla: Ζέστη, δίψα και ψυχική διάθεση',
      ru: 'Arsenicum vs. Pulsatilla: Тепло, жажда и душевное состояние'
    },
    opt1: {
      de: 'Brennende Schmerzen durch Wärme gebessert, ständiger Durst auf kleine Schlucke, ängstlich (Arsenicum)',
      en: 'Burning pains relieved by heat, continuous thirst for small sips, anxious restlessness (Arsenicum)',
      es: 'Dolores ardientes aliviados por calor, sed constante de pequeños sorbos, ansiedad (Arsenicum)',
      fr: 'Douleurs brûlantes soulagées par la chaleur, soif constante de petites gorgées, anxieux (Arsenicum)',
      it: 'Dolori brucianti alleviati dal calore, sete continua a piccoli sorsi, ansioso (Arsenicum)',
      el: 'Καυστικός πόνος που ανακουφίζεται με ζέστη, δίψα για μικρές γουλιές, ανήσυχο άγχος (Arsenicum)',
      ru: 'Жгучие боли облегчаются теплом, жажда маленькими глотками, тревожное беспокойство (Arsenicum)'
    },
    opt2: {
      de: 'Besserung durch kühle frische Luft, fast völlig durstlos, weinerlich, sucht Trost (Pulsatilla)',
      en: 'Relief in cool open air, virtually thirstless, tearful, craves sympathy and consolation (Pulsatilla)',
      es: 'Mejoría al aire fresco, sin sed, lloroso, busca afecto y consuelo (Pulsatilla)',
      fr: 'Mieux au grand air frais, aucune soif, larmoyant, recherche réconfort et douceur (Pulsatilla)',
      it: 'Miglioramento all\'aria fresca, senza sete, piagnucoloso, cerca conforto (Pulsatilla)',
      el: 'Βελτίωση στον δροσερό καθαρό αέρα, χωρίς δίψα, κλαψιάρης, αναζητά παρηγοριά (Pulsatilla)',
      ru: 'Улучшение на прохладном свежем воздухе, отсутствие жажды, плаксивость, ищет утешения (Pulsatilla)'
    }
  },
  'apis-mellifica___ledum-palustre': {
    title: {
      de: 'Apis vs. Ledum: Art der Schwellung und Kälteempfinden',
      en: 'Apis vs. Ledum: Type of swelling and sensation of cold',
      es: 'Apis vs. Ledum: Tipo de inflamación y sensación térmica',
      fr: 'Apis vs. Ledum : Type de gonflement et sensation thermique',
      it: 'Apis vs. Ledum: Tipo di gonfiore e sensazione termica',
      el: 'Apis vs. Ledum: Τύπος οιδήματος και αίσθηση θερμοκρασίας',
      ru: 'Apis vs. Ledum: Характер отека и реакция на холод'
    },
    opt1: {
      de: 'Hellrotes, glänzendes, heißes Ödem mit stechend-brennendem Schmerz; jede Wärme unerträglich (Apis)',
      en: 'Bright red, puffy, hot swelling with stinging burning pain; intolerant to heat (Apis)',
      es: 'Hinchazón roja, brillante y caliente con dolor punzante ardiente; calor insoportable (Apis)',
      fr: 'Œdème rouge vif, bouffi, brûlant avec piqûres cuisantes ; toute chaleur intolérable (Apis)',
      it: 'Gonfiore rosso vivo, lucido e rovente con punture brucianti; calore intollerabile (Apis)',
      el: 'Λαμπερό κόκκινο, καυτό οίδημα με τσιμπήματα και κάψιμο· ανυπόφορη ζέστη (Apis)',
      ru: 'Ярко-красный, горячий отек с колюще-жгучей болью; не переносит никакого тепла (Apis)'
    },
    opt2: {
      de: 'Punktuelle Wunde oder Insektenstich, Einstichstelle fühlt sich kalt an, nur Eiswasserauflagen bessern (Ledum)',
      en: 'Puncture wound or bite, site feels objectively cold, relieved only by icy water applications (Ledum)',
      es: 'Herida punzante o picadura, sitio frío al tacto, mejoría sólo con compresas heladas (Ledum)',
      fr: 'Plaie par piqûre ou dard, lésion froide au toucher, soulagée uniquement par eau glacée (Ledum)',
      it: 'Ferita puntiforme o puntura, zona fredda al tatto, sollievo solo con impacchi gelidi (Ledum)',
      el: 'Νυγμώδες τραύμα ή τσίμπημα, ψυχρό στην αφή, ανακούφιση μόνο με παγωμένο νερό (Ledum)',
      ru: 'Колотая рана или укус насекомого, место укуса холодное, облегчение только от ледяной воды (Ledum)'
    }
  },
  'arnica-montana___hypericum-perforatum': {
    title: {
      de: 'Arnica vs. Hypericum: Trauma-Art und Schmerzqualität',
      en: 'Arnica vs. Hypericum: Trauma type and pain quality',
      es: 'Arnica vs. Hypericum: Tipo de traumatismo y calidad del dolor',
      fr: 'Arnica vs. Hypericum : Type de traumatisme et qualité de la douleur',
      it: 'Arnica vs. Hypericum: Tipo di trauma e qualità del dolore',
      el: 'Arnica vs. Hypericum: Είδος τραύματος και χαρακτήρας πόνου',
      ru: 'Arnica vs. Hypericum: Тип травмы и характер боли'
    },
    opt1: {
      de: 'Dumpfe Zerschlagenheit, Hämatom, Weichteilprellung, Patient behauptet: "Mir fehlt nichts" (Arnica)',
      en: 'Sore bruised feeling, hematoma, blunt tissue trauma; patient says "I am fine" (Arnica)',
      es: 'Sensación de magulladura, hematoma, contusión; el paciente afirma que no le pasa nada (Arnica)',
      fr: 'Courbatures meurtris, hématome, contusion ; le patient dit « Je vais très bien » (Arnica)',
      it: 'Sensazione di indolenzimento contusivo, ematoma; il paziente dice "Non ho niente" (Arnica)',
      el: 'Αίσθημα μωλωπισμού, αιμάτωμα, θλάση μαλακών μορίων· λέει "δεν έχω τίποτα" (Arnica)',
      ru: 'Ощущение разбитости, гематома, ушиб мягких тканей; говорит "со мной всё в порядке" (Arnica)'
    },
    opt2: {
      de: 'Scharfer, schießender Nervenschmerz entlang von Nervenbahnen (Finger, Steißbein, Zähne) (Hypericum)',
      en: 'Sharp, shooting nerve pain traveling along nerve paths (fingertips, tailbone, teeth) (Hypericum)',
      es: 'Dolor nervioso agudo y punzante que irradia (dedos, cóccix, extracciones dentales) (Hypericum)',
      fr: 'Douleur nerveuse fulgurante irradiant le long des trajets nerveux (doigts, coccyx, dents) (Hypericum)',
      it: 'Dolore nevralgico acuto e lancinante lungo i nervi (dita, coccige, denti) (Hypericum)',
      el: 'Οξύς, διαξιφιστικός νευρικός πόνος κατά μήκος νεύρων (δάχτυλα, κόκκυγας, δόντια) (Hypericum)',
      ru: 'Острая, стреляющая нервная боль по ходу нервных стволов (пальцы, копчик, зубы) (Hypericum)'
    }
  },
  'bryonia-alba___gelsemium-sempervirens': {
    title: {
      de: 'Bryonia vs. Gelsemium: Schweregefühl, Benommenheit und Durst',
      en: 'Bryonia vs. Gelsemium: Heaviness, drowsiness, and thirst',
      es: 'Bryonia vs. Gelsemium: Pesadez, somnolencia y sed',
      fr: 'Bryonia vs. Gelsemium : Lourdeur, somnolence et soif',
      it: 'Bryonia vs. Gelsemium: Pesantezza, sonnolenza e sete',
      el: 'Bryonia vs. Gelsemium: Βάρος, υπνηλία και δίψα',
      ru: 'Bryonia vs. Gelsemium: Тяжесть, сонливость и жажда'
    },
    opt1: {
      de: 'Großer Durst auf große Mengen kaltes Wasser, stechende Schmerzen, jede Bewegung quält (Bryonia)',
      en: 'Huge thirst for large amounts of cold water, stitching pains, movement is agony (Bryonia)',
      es: 'Gran sed de grandes cantidades de agua fría, dolores punzantes, moverse es un suplicio (Bryonia)',
      fr: 'Grande soif de grandes quantités d\'eau froide, piqûres, tout mouvement fait souffrir (Bryonia)',
      it: 'Grande sete di grandi quantità d\'acqua fredda, dolori pungenti, muoversi fa soffrire (Bryonia)',
      el: 'Μεγάλη δίψα για άφθονο κρύο νερό, σουβλιές, κάθε κίνηση βασανίζει (Bryonia)',
      ru: 'Сильная жажда больших объемов холодной воды, колющие боли, движение мучительно (Bryonia)'
    },
    opt2: {
      de: 'Völlig durstlos, schwere Lider, Benommenheit, Zittrigkeit und motorische Schwäche (Gelsemium)',
      en: 'Thirstless, heavy droopy eyelids, drowsiness, trembling weakness and dullness (Gelsemium)',
      es: 'Sin sed, párpados pesados caídos, embotamiento mental, temblor y debilidad motora (Gelsemium)',
      fr: 'Absence de soif, paupières lourdes tombantes, engourdissement, tremblements et faiblesse (Gelsemium)',
      it: 'Senza sete, palpebre pesanti cadenti, torpore mentale, tremore e debolezza muscolare (Gelsemium)',
      el: 'Χωρίς δίψα, βαριά βλέφαρα, υπνηλία, τρέμουλο και κινητική αδυναμία (Gelsemium)',
      ru: 'Полное отсутствие жажды, тяжелые веки, оцепенение, дрожь и мышечная слабость (Gelsemium)'
    }
  },
  'colocynthis___magnesia-phosphorica': {
    title: {
      de: 'Colocynthis vs. Mag phos: Erleichterung von Krampferleichterung',
      en: 'Colocynthis vs. Mag phos: Cramp relief modalities',
      es: 'Colocynthis vs. Mag phos: Alivio de cólicos y calambres',
      fr: 'Colocynthis vs. Mag phos : Soulagement des crampes et coliques',
      it: 'Colocynthis vs. Mag phos: Sollievo da crampi e coliche',
      el: 'Colocynthis vs. Mag phos: Ανακούφιση από κράμπες και κολικούς',
      ru: 'Colocynthis vs. Mag phos: Модальности облегчения колик и спазмов'
    },
    opt1: {
      de: 'Besserung durch festes Zusammenkrümmen und harten mechanischen Gegendruck (Colocynthis)',
      en: 'Relief by bending double and pressing hard against the painful area (Colocynthis)',
      es: 'Alivio doblándose en dos y aplicando fuerte presión mecánica (Colocynthis)',
      fr: 'Soulagement en se pliant en deux et par une forte pression mécanique (Colocynthis)',
      it: 'Sollievo piegandosi in due e applicando una forte pressione meccanica (Colocynthis)',
      el: 'Ανακούφιση με δίπλωμα στα δύο και σκληρή μηχανική πίεση στην περιοχή (Colocynthis)',
      ru: 'Облегчение от сгибания пополам и сильного механического надавливания (Colocynthis)'
    },
    opt2: {
      de: 'Besserung spezifisch durch feuchte Hitze, heiße Umschläge oder Wärmflasche (Mag phos)',
      en: 'Relief specifically from radiant heat, hot compresses or hot water bottle (Mag phos)',
      es: 'Alivio específicamente con calor local intenso, paños calientes o bolsa de agua (Mag phos)',
      fr: 'Soulagement spécifiquement par la chaleur intense, compresses chaudes ou bouillotte (Mag phos)',
      it: 'Sollievo specificamente dal calore intenso, impacchi caldi o borsa d\'acqua calda (Mag phos)',
      el: 'Ανακούφιση ειδικά με έντονη θερμότητα, ζεστές κομπρέσες ή θερμοφόρα (Mag phos)',
      ru: 'Облегчение исключительно от сильного тепла, горячих компрессов или грелки (Mag phos)'
    }
  }
};

/**
 * Returns a decisive differential clarifying question if 2 top candidates are competing closely.
 * Never overwhelms the therapist (max 1 concise question), strictly matching classical homeopathic distinctions.
 */
export function getDerivedClarifyingQuestion(
  inputText: string,
  answers: AcuteAnswers,
  topRemedies: Array<{ remedy: { id: string; latinName: string; keynotes?: string[]; essence?: string }; matchScore: number }>,
  lang: LanguageCode = 'de'
): AcuteClarificationQuestion | null {
  if (!topRemedies || topRemedies.length < 2) {
    return null;
  }

  const r1 = topRemedies[0];
  const r2 = topRemedies[1];

  // If the user already answered a derived clarification, ensure we keep displaying it consistently
  const existingDerivedId = answers?.derivedClarification;
  const isAnswered = Boolean(existingDerivedId);

  // Check if competition is close or if an answer exists
  const scoreDiff = Math.abs(r1.matchScore - r2.matchScore);
  if (!isAnswered && scoreDiff > 28 && r1.matchScore >= 80) {
    // Winner is already overwhelmingly clear
    return null;
  }

  // Check predefined pair knowledge base
  const pairKey = [r1.remedy.id, r2.remedy.id].sort().join('___');
  const predefined = PAIR_DEFINITIONS[pairKey];

  const category = CATEGORY_NAMES[lang] || CATEGORY_NAMES.de;
  const neither = NEITHER_LABELS[lang] || NEITHER_LABELS.de;

  if (predefined) {
    // Determine which option corresponds to r1 vs r2
    const sortedIds = [r1.remedy.id, r2.remedy.id].sort();
    const isR1FirstInPair = sortedIds[0] === r1.remedy.id;

    const opt1Remedy = isR1FirstInPair ? r1.remedy : r2.remedy;
    const opt2Remedy = isR1FirstInPair ? r2.remedy : r1.remedy;

    return {
      id: 'derivedClarification',
      category,
      title: predefined.title[lang] || predefined.title.de,
      description: predefined.desc?.[lang] || predefined.desc?.de || (
        lang === 'de' ? 'Entscheidendes Kriterium zwischen den beiden führenden Mitteln:' :
        lang === 'en' ? 'Decisive criterion between the two leading remedies:' :
        lang === 'es' ? 'Criterio decisivo entre los dos remedios principales:' :
        lang === 'fr' ? 'Critère décisif entre les deux remèdes dominants :' :
        lang === 'it' ? 'Criterio decisivo tra i due rimedi principali:' :
        lang === 'el' ? 'Αποφασιστικό κριτήριο μεταξύ των δύο κύριων φαρμάκων:' :
        'Решающий критерий между двумя ведущими препаратами:'
      ),
      type: 'single',
      options: [
        {
          id: `derived_${opt1Remedy.id}`,
          label: predefined.opt1[lang] || predefined.opt1.de,
          remedyHint: opt1Remedy.latinName,
          remedyIds: [opt1Remedy.id],
          relevanceKeywords: [opt1Remedy.latinName]
        },
        {
          id: `derived_${opt2Remedy.id}`,
          label: predefined.opt2[lang] || predefined.opt2.de,
          remedyHint: opt2Remedy.latinName,
          remedyIds: [opt2Remedy.id],
          relevanceKeywords: [opt2Remedy.latinName]
        },
        {
          id: 'derived_neither',
          label: neither,
          remedyHint: '—',
          remedyIds: [],
          relevanceKeywords: []
        }
      ]
    };
  }

  // Dynamic fallback for any other pair
  const r1Keynote = r1.remedy.keynotes?.[0] || r1.remedy.essence || r1.remedy.latinName;
  const r2Keynote = r2.remedy.keynotes?.[0] || r2.remedy.essence || r2.remedy.latinName;

  const dynamicTitles: Record<LanguageCode, string> = {
    de: `Differenzialentscheidung: ${r1.remedy.latinName} oder ${r2.remedy.latinName}?`,
    en: `Differential Decision: ${r1.remedy.latinName} or ${r2.remedy.latinName}?`,
    es: `Decisión Diferencial: ${r1.remedy.latinName} o ${r2.remedy.latinName}?`,
    fr: `Décision Différentielle : ${r1.remedy.latinName} ou ${r2.remedy.latinName} ?`,
    it: `Decisione Differenziale: ${r1.remedy.latinName} o ${r2.remedy.latinName}?`,
    el: `Διαφορική Απόφαση: ${r1.remedy.latinName} ή ${r2.remedy.latinName};`,
    ru: `Дифференциальное решение: ${r1.remedy.latinName} или ${r2.remedy.latinName}?`
  };

  const dynamicDescs: Record<LanguageCode, string> = {
    de: 'Welches dieser Leitsymptome steht beim Patienten klarer im Vordergrund?',
    en: 'Which of these keynotes is more prominent in the patient?',
    es: '¿Cuál de estos síntomas clave predomina con mayor claridad en el paciente?',
    fr: 'Lequel de ces symptômes clés prédomine le plus nettement chez le patient ?',
    it: 'Quale di questi sintomi chiave predomina più chiaramente nel paziente?',
    el: 'Ποιο από αυτά τα βασικά συμπτώματα υπερισχύει σαφέστερα στον ασθενή;',
    ru: 'Какой из этих ключевых симптомов отчетливее выражен у пациента?'
  };

  return {
    id: 'derivedClarification',
    category,
    title: dynamicTitles[lang] || dynamicTitles.de,
    description: dynamicDescs[lang] || dynamicDescs.de,
    type: 'single',
    options: [
      {
        id: `derived_${r1.remedy.id}`,
        label: `${r1.remedy.latinName}: ${r1Keynote}`,
        remedyHint: r1.remedy.latinName,
        remedyIds: [r1.remedy.id],
        relevanceKeywords: [r1.remedy.latinName]
      },
      {
        id: `derived_${r2.remedy.id}`,
        label: `${r2.remedy.latinName}: ${r2Keynote}`,
        remedyHint: r2.remedy.latinName,
        remedyIds: [r2.remedy.id],
        relevanceKeywords: [r2.remedy.latinName]
      },
      {
        id: 'derived_neither',
        label: neither,
        remedyHint: '—',
        remedyIds: [],
        relevanceKeywords: []
      }
    ]
  };
}
