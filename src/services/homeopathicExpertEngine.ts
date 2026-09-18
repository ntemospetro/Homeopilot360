import { LanguageCode, HomeopathicExpertResult, DecisionTreeBranch, HomeopathicDecisionTree } from '../types';
import { getActiveTherapist } from './storage';

// ============================================================================
// HOMOEOPATHIC 5-STEP REPERTORISATION EXPERT ENGINE
// ============================================================================

interface ClassicalDomainConfig {
  keywords: string[];
  header: Record<LanguageCode, string>;
  rootQuestion: Record<LanguageCode, string>;
  branches: {
    label: Record<LanguageCode, string>;
    question: Record<LanguageCode, string>;
    yesRemedy: { name: string; rationale: Record<LanguageCode, string> };
    noRemedy: { name: string; rationale: Record<LanguageCode, string> };
    secondaryQuestion?: {
      question: Record<LanguageCode, string>;
      option1Label: Record<LanguageCode, string>;
      option1Remedy: { name: string; rationale: Record<LanguageCode, string> };
      option2Label: Record<LanguageCode, string>;
      option2Remedy: { name: string; rationale: Record<LanguageCode, string> };
    };
  }[];
  diagnosticQuestions: Record<LanguageCode, string[]>;
  primarySimile: {
    name: string;
    rationale: Record<LanguageCode, string>;
  };
  asciiDiagram: Record<LanguageCode, string>;
}

// Classical knowledge domains with gapless exclusion trees
const EXPERT_DOMAINS: Record<string, ClassicalDomainConfig> = {
  headache_migraine: {
    keywords: [
      'kopfschmerz', 'kopfweh', 'migräne', 'migraene', 'schläfe', 'stirn', 'hinterkopf', 'halbseitig',
      'rechtsseitig', 'linksseitig', 'hämmernd', 'pochend', 'drückend', 'augen', 'nacken',
      'headache', 'migraine', 'temple', 'forehead', 'throbbing', 'right-sided', 'left-sided',
      'dolor de cabeza', 'jaqueca', 'cefalea', 'mal de tête', 'mal di testa', 'πονοκέφαλος', 'ημικρανία', 'головная боль', 'мигрень'
    ],
    header: {
      de: '[ RECHTSEITIGE MIGRÄNE & VERSCHLIMMERUNG ~20 UHR ]',
      en: '[ RIGHT-SIDED MIGRAINE & AGGRAVATION ~8 PM ]',
      es: '[ MIGRAÑA DERECHA Y AGRAVACIÓN ~20:00 H ]',
      fr: '[ MIGRAINE DU CÔTÉ DROIT & AGGRAVATION ~20H ]',
      it: '[ EMICRANIA DESTRA E AGGRAVAMENTO ORE ~20 ]',
      el: '[ ΔΕΞΙΟΣΤΡΟΦΗ ΗΜΙΚΡΑΝΙΑ & ΕΠΙΔΕΙΝΩΣΗ ~20:00 ]',
      ru: '[ ПРАВОСТОРОННЯЯ МИГРЕНЬ И УХУДШЕНИЕ ОКОЛО 20:00 ]'
    },
    rootQuestion: {
      de: 'Gibt es begleitende Organ- oder Verdauungssymptome?',
      en: 'Are there accompanying organ or digestive symptoms?',
      es: '¿Hay síntomas orgánicos o digestivos acompañantes?',
      fr: 'Y a-t-il des symptômes organiques ou digestifs associés ?',
      it: 'Ci sono sintomi d\'organo o digestivi concomitanti?',
      el: 'Υπάρχουν συνοδά συμπτώματα οργάνων ή του πεπτικού συστήματος;',
      ru: 'Присутствуют ли сопутствующие органные или пищеварительные симптомы?'
    },
    branches: [
      {
        label: {
          de: '[ VERDAUUNG / MAGEN ]',
          en: '[ DIGESTION / STOMACH ]',
          es: '[ DIGESTIÓN / ESTÓMAGO ]',
          fr: '[ DIGESTION / ESTOMAC ]',
          it: '[ DIGESTIONE / STOMACO ]',
          el: '[ ΠΕΨΗ / ΣΤΟΜΑΧΟΣ ]',
          ru: '[ ПИЩЕВАРЕНИЕ / ЖЕЛУДОК ]'
        },
        question: {
          de: 'Heißhunger auf Süßes? Blähbauch typisch um 16-20 Uhr?',
          en: 'Craving for sweets? Bloating typical around 4-8 PM?',
          es: '¿Deseo de dulces? ¿Distensión abdominal típica de 16 a 20 h?',
          fr: 'Désir de sucreries ? Ballonnement abdominal entre 16h et 20h ?',
          it: 'Bramosia di dolci? Gonfiore addominale tra le 16 e le 20?',
          el: 'Έντονη επιθυμία για γλυκά; Τυμπανισμός συνήθως 16:00-20:00;',
          ru: 'Тяга к сладкому? Метеоризм и вздутие живота с 16 до 20 часов?'
        },
        yesRemedy: {
          name: 'Lycopodium clavatum',
          rationale: {
            de: 'Klassische Trias: Rechtsseitigkeit, zeitliche Verschlimmerung 16-20 Uhr und meteoristische Begleitsymptome.',
            en: 'Classic triad: Right-sidedness, aggravation 4-8 PM and flatulent digestive concomitants.',
            es: 'Tríada clásica: Lateralidad derecha, agravación 16-20 h y meteorismo digestivo.',
            fr: 'Triade classique : Latéralité droite, aggravation 16h-20h et troubles digestifs gazeux.',
            it: 'Triade classica: Lateralità destra, peggioramento 16-20 e meteorismo digestivo.',
            el: 'Κλασική τριάδα: Δεξιά πλευρά, επιδείνωση 16:00-20:00 και μετεωρισμός.',
            ru: 'Классическая триада: правосторонность, ухудшение с 16 до 20 часов и метеоризм.'
          }
        },
        noRemedy: {
          name: 'Nux vomica',
          rationale: {
            de: 'Auffang-Mittel bei Magenüberlastung: Katergefühl, Reizbarkeit, Spasmen, Druck nach dem Essen.',
            en: 'Fallback remedy for stomach overload: Hangover feeling, irritability, spasms, pressure after eating.',
            es: 'Remedio compensador por sobrecarga gástrica: Resaca, irritabilidad, espasmos y pesadez.',
            fr: 'Remède de relais pour surcharge gastrique : Sensation de gueule de bois, spasmes et irritabilité.',
            it: 'Rimedio di riserva per sovraccarico gastrico: Postumi, irritabilità, spasmi e pesantezza.',
            el: 'Αντισταθμιστικό φάρμακο γαστρικής υπερφόρτωσης: Ευερεθιστότητα, σπασμοί και βάρος μετά το φαγητό.',
            ru: 'Компенсирующий препарат при желудочной перегрузке: раздражительность, спазмы, тяжесть после еды.'
          }
        }
      },
      {
        label: {
          de: '[ GALLE / LEBER ]',
          en: '[ BILE / LIVER ]',
          es: '[ BILIAR / HÍGADO ]',
          fr: '[ BIAIRE / FOIE ]',
          it: '[ VIE BILIARI / FEGATO ]',
          el: '[ ΧΟΛΗ / ΗΠΑΡ ]',
          ru: '[ ЖЕЛЧЬ / ПЕЧЕНЬ ]'
        },
        question: {
          de: 'Zieht der Schmerz charakteristisch zum rechten Schulterblattwinkel?',
          en: 'Does pain characteristically radiate to the right scapula angle?',
          es: '¿El dolor se irradia característicamente al ángulo del omóplato derecho?',
          fr: 'La douleur irradie-t-elle vers l\'angle de l\'omoplate droite ?',
          it: 'Il dolore si irradia tipicamente all\'angolo della scapola destra?',
          el: 'Αντανακλά ο πόνος χαρακτηριστικά στην κάτω γωνία της δεξιάς ωμοπλάτης;',
          ru: 'Иррадиирует ли боль характерно под правый угол лопатки?'
        },
        yesRemedy: {
          name: 'Chelidonium majus',
          rationale: {
            de: 'Leitsymptom-Simile: Rechtsseitige Schläfenschmerzen mit Ausstrahlung zum rechten Schulterblatt und Leberträgheit.',
            en: 'Keynote simile: Right-sided temple pain radiating to the right inferior scapula with biliary stasis.',
            es: 'Simile guía: Dolor temporal derecho con irradiación al omóplato derecho y congestión hepática.',
            fr: 'Simile clé : Céphalée temporale droite irradiant vers l\'omoplate droite et engorgement hépatique.',
            it: 'Simile guida: Cefalea temporale destra irradiata alla scapola destra e stasi biliare.',
            el: 'Βασικό simile: Δεξιόστροφος κροταφικός πόνος με αντανάκλαση στη δεξιά ωμοπλάτη.',
            ru: 'Ключевое симиле: правосторонняя боль в виске с иррадиацией под правую лопатку.'
          }
        },
        noRemedy: {
          name: 'Carduus marianus',
          rationale: {
            de: 'Auffang-Mittel bei Leber-Kopfschmerz: Dumpfe Stauung, Bitterkeit im Mund, venöser Druck.',
            en: 'Fallback remedy for hepatic headache: Dull venous congestion, bitter taste, portal heaviness.',
            es: 'Remedio compensador para cefalea hepática: Congestión venosa sorda, sabor amargo.',
            fr: 'Remède de relais pour céphalée hépatique : Congestion sourde, bouche amère, plénitude veineuse.',
            it: 'Rimedio di riserva per cefalea epatica: Congestione venosa sorda, sapore amaro in bocca.',
            el: 'Αντισταθμιστικό ηπατικής κεφαλαλγίας: Αμβλεία φλεβική συμφόρηση, πικρή γεύση στο στόμα.',
            ru: 'Компенсирующий препарат при печеночной головной боли: тупой застой, горький привкус во рту.'
          }
        }
      },
      {
        label: {
          de: '[ REINER NERVENSCHMERZ ]',
          en: '[ PURE NEURALGIA / VASCULAR ]',
          es: '[ DOLOR NEURÁLGICO PURO ]',
          fr: '[ NÉVRALGIE PURE / VASCULAIRE ]',
          it: '[ DOLORE NEURALGICO PURO ]',
          el: '[ ΑΜΙΓΗΣ ΝΕΥΡΑΛΓΙΚΟΣ ΠΟΝΟΣ ]',
          ru: '[ ЧИСТАЯ НЕВРАЛГИЯ / СОСУДИСТАЯ ]'
        },
        question: {
          de: 'Beginnt der Schmerz im Nacken und wandert über das rechte Auge?',
          en: 'Does pain start in the occiput/neck and settle over the right eye?',
          es: '¿Comienza el dolor en la nuca y se fija sobre el ojo derecho?',
          fr: 'La douleur commence-t-elle à la nuque pour se fixer sur l\'œil droit ?',
          it: 'Il dolore parte dalla nuca e si localizza sopra l\'occhio destro?',
          el: 'Ξεκινά ο πόνος από τον αυχένα και μεταναστεύει πάνω από το δεξί μάτι;',
          ru: 'Начинается ли боль в затылке/шее и поднимается к правому глазу?'
        },
        yesRemedy: {
          name: 'Sanguinaria canadensis',
          rationale: {
            de: 'Klassischer Sonnenverlauf: Beginn im Nacken, wandert nach vorn zum rechten Auge, Besserung durch Dunkelheit.',
            en: 'Classic suncourse: Starts in occiput, settles over right eye, relieved by quiet darkness.',
            es: 'Curso clásico: Comienza en nuca, avanza al ojo derecho, mejora en la oscuridad.',
            fr: 'Évolution solaire classique : Départ nuque, fixation œil droit, soulagement dans l\'obscurité.',
            it: 'Decorso solare classico: Inizio alla nuca, migra verso l\'occhio destro, migliora al buio.',
            el: 'Κλασική ηλιακή πορεία: Έναρξη από αυχένα προς το δεξί μάτι, βελτίωση στο σκοτάδι.',
            ru: 'Классический ход: начинается в затылке, переходит к правому глазу, облегчение в темноте.'
          }
        },
        noRemedy: {
          name: 'Spigelia anthelmia',
          rationale: {
            de: 'Auffang-Mittel bei Gesichts-/Augenneuralgie: Linksseitig oder stechend wie von heißen Nadeln.',
            en: 'Fallback remedy for severe ocular neuralgia: Often left-sided or violent needle-like stabbing.',
            es: 'Remedio compensador para neuralgia ocular: Izquierda o punzante como agujas ardientes.',
            fr: 'Remède de relais pour névralgie oculaire : Souvent côté gauche ou douleurs piquantes intenses.',
            it: 'Rimedio di riserva per nevralgia oculare: Spesso a sinistra o trafitture lancinanti.',
            el: 'Αντισταθμιστικό οφθαλμικής νευραλγίας: Συνήθως αριστερά ή σουβλιές σαν καυτές βελόνες.',
            ru: 'Компенсирующий препарат при глазной невралгии: чаще слева или колющие стреляющие боли.'
          }
        },
        secondaryQuestion: {
          question: {
            de: 'Wie wirkt lokale Wärme auf den Kopf?',
            en: 'How does applied heat affect the head pain?',
            es: '¿Cómo afecta el calor aplicado en la cabeza?',
            fr: 'Quel est l\'effet de la chaleur appliquée sur la tête ?',
            it: 'Qual è l\'effetto del calore locale sulla testa?',
            el: 'Πώς επιδρά η τοπική θερμότητα στον πονοκέφαλο;',
            ru: 'Как местное тепло влияет на головную боль?'
          },
          option1Label: {
            de: 'LINDERT',
            en: 'RELIEVES',
            es: 'ALIVIA',
            fr: 'SOULAGE',
            it: 'ALLEVIA',
            el: 'ΑΝΑΚΟΥΦΙΖΕΙ',
            ru: 'ОБЛЕГЧАЕТ'
          },
          option1Remedy: {
            name: 'Sanguinaria canadensis',
            rationale: {
              de: 'Schmerz bessert sich durch warmes Einhüllen, Schlafen und Liegen im Dunkeln.',
              en: 'Pain is relieved by warm wrapping, sleep, and resting in a dark room.',
              es: 'Mejora cubriéndose la cabeza con calor y descansando en oscuridad.',
              fr: 'Soulagement par enveloppement chaud et repos dans l\'obscurité.',
              it: 'Migliora avvolgendo caldo il capo e riposando al buio.',
              el: 'Ανακούφιση με ζεστό τύλιγμα της κεφαλής και ανάπαυση στο σκοτάδι.',
              ru: 'Облегчается теплым укутыванием головы и сном в темной комнате.'
            }
          },
          option2Label: {
            de: 'VERSCHLIMMERT',
            en: 'AGGRAVATES',
            es: 'AGRAVA',
            fr: 'AGGRAVE',
            it: 'PEGGIORA',
            el: 'ΕΠΙΔΕΙΝΩΝΕΙ',
            ru: 'УХУДШАЕТ'
          },
          option2Remedy: {
            name: 'Belladonna',
            rationale: {
              de: 'Pulsierender, hämmernder Blutandrang: Verschlimmert durch Wärme, Erschütterung, Licht.',
              en: 'Pulsating, throbbing vascular congestion: Aggravated by warmth, jarring, and bright light.',
              es: 'Congestión pulsátil y martilleante: Agravada por calor, sacudidas y luz intensa.',
              fr: 'Congestion battante et pulsatile : Aggravation par la chaleur, les secousses et la lumière.',
              it: 'Congestione pulsante e martellante: Peggiora col calore, scosse e luce intensa.',
              el: 'Σφύζουσα, παλλόμενη συμφόρηση: Επιδεινώνεται από τη ζέστη, τους κραδασμούς και το φως.',
              ru: 'Пульсирующий прилив крови: ухудшение от тепла, сотрясения и яркого света.'
            }
          }
        }
      }
    ],
    diagnosticQuestions: {
      de: [
        'Treten Blähungen oder Verschlimmerung typischerweise am späten Nachmittag (16–20 Uhr) auf?',
        'Strahlt der Schmerz in das rechte Schulterblatt oder die Lebergegend aus?',
        'Wird der Kopfschmerz durch feste Wärme oder Liegen im Dunkeln spürbar gelindert?'
      ],
      en: [
        'Do bloating or aggravation typically occur in the late afternoon (4–8 PM)?',
        'Does the pain radiate into the right shoulder blade or hepatic area?',
        'Is the headache significantly relieved by firm warmth or resting in the dark?'
      ],
      es: [
        '¿Aparece distensión abdominal o agravación típicamente por la tarde (16–20 h)?',
        '¿Se irradia el dolor hacia el omóplato derecho o la región hepática?',
        '¿El dolor de cabeza se alivia notablemente con calor firme o descansando en la oscuridad?'
      ],
      fr: [
        'Les ballonnements ou l\'aggravation surviennent-ils typiquement entre 16h et 20h ?',
        'La douleur irradie-t-elle vers l\'omoplate droite ou la région hépatique ?',
        'Le mal de tête est-il nettement soulagé par la chaleur enveloppante ou l\'obscurité ?'
      ],
      it: [
        'Il gonfiore o il peggioramento si manifestano tipicamente tra le 16 e le 20?',
        'Il dolore si irradia alla scapola destra o alla regione epatica?',
        'Il mal di testa viene notevolmente alleviato dal calore o riposando al buio?'
      ],
      el: [
        'Εμφανίζεται τυμπανισμός ή επιδείνωση συνήθως αργά το απόγευμα (16:00–20:00);',
        'Αντανακλά ο πόνος στη δεξιά ωμοπλάτη ή στην περιοχή του ήπατος;',
        'Ανακουφίζεται ο πονοκέφαλος αισθητά από σταθερή θερμότητα ή ξάπλωμα στο σκοτάδι;'
      ],
      ru: [
        'Возникает ли вздутие живота или ухудшение типично с 16 до 20 часов?',
        'Иррадиирует ли боль под правую лопатку или в область печени?',
        'Облегчается ли головная боль теплом или лежанием в темной комнате?'
      ]
    },
    primarySimile: {
      name: 'Lycopodium clavatum',
      rationale: {
        de: 'Passt exakt auf die rechtsseitige Lokalisation mit Verschlimmerung um 20 Uhr sowie die begleitende Stoffwechsel- und Magen-Darm-Symptomatik.',
        en: 'Matches precisely the right-sided localization with 8 PM aggravation and accompanying metabolic/digestive symptoms.',
        es: 'Coincide exactamente con la localización derecha, agravación a las 20:00 h y cortejo digestivo.',
        fr: 'Correspond exactement à la localisation droite avec aggravation vers 20h et symptômes digestifs.',
        it: 'Corrisponde esattamente alla lateralità destra con peggioramento alle ore 20 e sintomi digestivi.',
        el: 'Ταιριάζει απόλυτα στη δεξιόστροφη εντόπιση με επιδείνωση στις 20:00 και πεπτικά συμπτώματα.',
        ru: 'В точности соответствует правосторонней локализации с ухудшением около 20:00 и пищеварительным симптомам.'
      }
    },
    asciiDiagram: {
      de: `     [ RECHTSEITIGE MIGRÄNE & VERSCHLIMMERUNG ~20 UHR ]
                                       │
                Gibt es begleitende Organ- oder Verdauungssymptome?
             ┌─────────────────────────┼─────────────────────────┐
             ▼                         ▼                         ▼
      [ VERDAUUNG / MAGEN ]     [ GALLE / LEBER ]        [ REINER NERVENSCHMERZ ]
             │                         │                         │
             ▼                         ▼                         ▼
     Heißhunger auf Süßes?    Schmerz zieht zum rechten    Beginnt im Nacken &
    Blähbauch um 16-20 Uhr?        Schulterblatt?          wandert über das Auge?
       ┌─────┴─────┐             ┌─────┴─────┐             ┌─────┴─────┐
      JA          NEIN          JA          NEIN          JA          NEIN
       │           │             │           │             │           │
       ▼           ▼             ▼           ▼             ▼           ▼
  [LYCOPODIUM] [NUX VOMICA] [CHELIDONIUM] [CARDUUS MAR.]    Wie wirkt Wärme?
                                                           ┌─────┴─────┐
                                                        LINDERT     VERSCHLIMMERT
                                                           │           │
                                                           ▼           ▼
                                                     [SANGUINARIA]  [BELLADONNA]`,
      en: `     [ RIGHT-SIDED MIGRAINE & AGGRAVATION ~8 PM ]
                                       │
                Are there accompanying organ or digestive symptoms?
             ┌─────────────────────────┼─────────────────────────┐
             ▼                         ▼                         ▼
      [ DIGESTION / STOMACH ]    [ BILE / LIVER ]        [ PURE NEURALGIA ]
             │                         │                         │
             ▼                         ▼                         ▼
     Craving sweets?          Pain radiates to right       Starts in neck &
     Bloating 4-8 PM?              scapula?                settles over eye?
       ┌─────┴─────┐             ┌─────┴─────┐             ┌─────┴─────┐
      YES          NO           YES          NO           YES          NO
       │           │             │           │             │           │
       ▼           ▼             ▼           ▼             ▼           ▼
  [LYCOPODIUM] [NUX VOMICA] [CHELIDONIUM] [CARDUUS MAR.]    How does heat act?
                                                           ┌─────┴─────┐
                                                        RELIEVES    AGGRAVATES
                                                           │           │
                                                           ▼           ▼
                                                     [SANGUINARIA]  [BELLADONNA]`,
      es: `     [ MIGRAÑA DERECHA Y AGRAVACIÓN ~20:00 H ]
                                       │
                ¿Hay síntomas orgánicos o digestivos acompañantes?
             ┌─────────────────────────┼─────────────────────────┐
             ▼                         ▼                         ▼
      [ DIGESTIÓN / ESTÓMAGO ]   [ BILIAR / HÍGADO ]     [ DOLOR NEURÁLGICO PURO ]
             │                         │                         │
             ▼                         ▼                         ▼
     ¿Deseo de dulces?        ¿Dolor irradia a ángulo      ¿Inicia en la nuca y
    ¿Meteorismo 16-20h?          omóplato derecho?         avanza sobre el ojo?
       ┌─────┴─────┐             ┌─────┴─────┐             ┌─────┴─────┐
      SÍ           NO           SÍ           NO           SÍ           NO
       │           │             │           │             │           │
       ▼           ▼             ▼           ▼             ▼           ▼
  [LYCOPODIUM] [NUX VOMICA] [CHELIDONIUM] [CARDUUS MAR.]    ¿Efecto del calor?
                                                           ┌─────┴─────┐
                                                         ALIVIA       AGRAVA
                                                           │           │
                                                           ▼           ▼
                                                     [SANGUINARIA]  [BELLADONNA]`,
      fr: `     [ MIGRAINE DU CÔTÉ DROIT & AGGRAVATION ~20H ]
                                       │
                Y a-t-il des symptômes organiques ou digestifs associés ?
             ┌─────────────────────────┼─────────────────────────┐
             ▼                         ▼                         ▼
      [ DIGESTION / ESTOMAC ]    [ BILIAIRE / FOIE ]     [ NÉVRALGIE PURE ]
             │                         │                         │
             ▼                         ▼                         ▼
     Désir de sucreries ?     Douleur irradiant vers       Débute nuque et
    Ballonnement 16-20h ?       l'omoplate droite ?        va vers l'œil ?
       ┌─────┴─────┐             ┌─────┴─────┐             ┌─────┴─────┐
      OUI         NON           OUI         NON           OUI         NON
       │           │             │           │             │           │
       ▼           ▼             ▼           ▼             ▼           ▼
  [LYCOPODIUM] [NUX VOMICA] [CHELIDONIUM] [CARDUUS MAR.]    Effet de la chaleur ?
                                                           ┌─────┴─────┐
                                                        SOULAGE      AGGRAVE
                                                           │           │
                                                           ▼           ▼
                                                     [SANGUINARIA]  [BELLADONNA]`,
      it: `     [ EMICRANIA DESTRA E AGGRAVAMENTO ORE ~20 ]
                                       │
                Ci sono sintomi d'organo o digestivi concomitanti?
             ┌─────────────────────────┼─────────────────────────┐
             ▼                         ▼                         ▼
      [ DIGESTIONE / STOMACO ]   [ VIE BILIARI / FEGATO] [ DOLORE NEURALGICO ]
             │                         │                         │
             ▼                         ▼                         ▼
     Bramosia di dolci?       Dolore irradiato verso       Parte dalla nuca e
     Gonfiore ore 16-20?         la scapola destra?        sale sull'occhio?
       ┌─────┴─────┐             ┌─────┴─────┐             ┌─────┴─────┐
       SÌ          NO            SÌ          NO            SÌ          NO
       │           │             │           │             │           │
       ▼           ▼             ▼           ▼             ▼           ▼
  [LYCOPODIUM] [NUX VOMICA] [CHELIDONIUM] [CARDUUS MAR.]    Effetto del calore?
                                                           ┌─────┴─────┐
                                                        ALLEVIA      PEGGIORA
                                                           │           │
                                                           ▼           ▼
                                                     [SANGUINARIA]  [BELLADONNA]`,
      el: `     [ ΔΕΞΙΟΣΤΡΟΦΗ ΗΜΙΚΡΑΝΙΑ & ΕΠΙΔΕΙΝΩΣΗ ~20:00 ]
                                       │
                Υπάρχουν συνοδά συμπτώματα οργάνων ή του πεπτικού;
             ┌─────────────────────────┼─────────────────────────┐
             ▼                         ▼                         ▼
      [ ΠΕΨΗ / ΣΤΟΜΑΧΟΣ ]       [ ΧΟΛΗ / ΗΠΑΡ ]          [ ΑΜΙΓΗΣ ΝΕΥΡΑΛΓΙΑ ]
             │                         │                         │
             ▼                         ▼                         ▼
     Επιθυμία για γλυκά;       Πόνος προς δεξιά ωμοπλάτη;  Έναρξη από αυχένα
     Τυμπανισμός 16-20;                                    προς το δεξί μάτι;
       ┌─────┴─────┐             ┌─────┴─────┐             ┌─────┴─────┐
      ΝΑΙ         ΟΧΙ           ΝΑΙ         ΟΧΙ           ΝΑΙ         ΟΧΙ
       │           │             │           │             │           │
       ▼           ▼             ▼           ▼             ▼           ▼
  [LYCOPODIUM] [NUX VOMICA] [CHELIDONIUM] [CARDUUS MAR.]    Επίδραση ζέστης;
                                                           ┌─────┴─────┐
                                                       ΑΝΑΚΟΥΦΙΖΕΙ   ΕΠΙΔΕΙΝΩΝΕΙ
                                                           │           │
                                                           ▼           ▼
                                                     [SANGUINARIA]  [BELLADONNA]`,
      ru: `     [ ПРАВОСТОРОННЯЯ МИГРЕНЬ И УХУДШЕНИЕ ОКОЛО 20:00 ]
                                       │
                Присутствуют ли органные или пищеварительные симптомы?
             ┌─────────────────────────┼─────────────────────────┐
             ▼                         ▼                         ▼
      [ ПИЩЕВАРЕНИЕ / ЖЕЛУДОК ]  [ ЖЕЛЧЬ / ПЕЧЕНЬ ]      [ ЧИСТАЯ НЕВРАЛГИЯ ]
             │                         │                         │
             ▼                         ▼                         ▼
     Тяга к сладкому?         Боль отдает под правую       Боль начинается в шее
    Метеоризм 16-20 ч?               лопатку?              и идет к глазу?
       ┌─────┴─────┐             ┌─────┴─────┐             ┌─────┴─────┐
       ДА          НЕТ           ДА          НЕТ           ДА          НЕТ
       │           │             │           │             │           │
       ▼           ▼             ▼           ▼             ▼           ▼
  [LYCOPODIUM] [NUX VOMICA] [CHELIDONIUM] [CARDUUS MAR.]    Действие тепла?
                                                           ┌─────┴─────┐
                                                       ОБЛЕГЧАЕТ    УХУДШАЕТ
                                                           │           │
                                                           ▼           ▼
                                                     [SANGUINARIA]  [BELLADONNA]`
    }
  },

  fever_infection: {
    keywords: [
      'fieber', 'infekt', 'grippe', 'schüttelfrost', 'erkaeltung', 'erkältung', 'fever', 'flu', 'chills',
      'infection', 'fiebre', 'grippe', 'fièvre', 'febbre', 'πυρετός', 'γρίπη', 'лихорадка', 'температура'
    ],
    header: {
      de: '[ PLÖTZLICHER AKUTER INFEKT & FIEBER ]',
      en: '[ SUDDEN ACUTE INFECTION & FEVER ]',
      es: '[ INFECCIÓN AGUDA REPENTINA Y FIEBRE ]',
      fr: '[ INFECTION AIGUË SOUDAINE & FIÈVRE ]',
      it: '[ INFEZIONE ACUTA IMPROVVISA E FEBBRE ]',
      el: '[ ΑΙΦΝΙΔΙΑ ΟΞΕΙΑ ΛΟΙΜΩΞΗ & ΠΥΡΕΤΟΣ ]',
      ru: '[ ВНЕЗАПНАЯ ОСТРАЯ ИНФЕКЦИЯ И ЛИХОРАДКА ]'
    },
    rootQuestion: {
      de: 'Gab es eine Causa durch kalten trockenen Wind oder Unterkühlung?',
      en: 'Was there a causa from dry cold wind or exposure to chill?',
      es: '¿Hubo una causa por viento frío y seco o enfriamiento?',
      fr: 'Y a-t-il eu une exposition au vent froid et sec ou refroidissement ?',
      it: 'C\'è stata un\'esposizione a vento secco e freddo o raffreddamento?',
      el: 'Υπήρξε αιτία έκθεσης σε ξηρό ψυχρό άνεμο ή υποθερμία;',
      ru: 'Была ли причина в виде сухого холодного ветра или переохлаждения?'
    },
    branches: [
      {
        label: {
          de: '[ INITIAL-STADIUM / TROCKEN ]',
          en: '[ INITIAL STAGE / DRY ]',
          es: '[ FASE INICIAL / SECA ]',
          fr: '[ STADE INITIAL / SEC ]',
          it: '[ STADIO INIZIALE / ASCIUTTO ]',
          el: '[ ΑΡΧΙΚΟ ΣΤΑΔΙΟ / ΞΗΡΟ ]',
          ru: '[ НАЧАЛЬНАЯ СТАДИЯ / СУХО ]'
        },
        question: {
          de: 'Extreme Unruhe, Angst, schneller Puls ohne Schweiß?',
          en: 'Extreme restlessness, fear, rapid bounding pulse without sweat?',
          es: '¿Inquietud extrema, ansiedad, pulso rápido sin sudor?',
          fr: 'Agitation extrême, anxiété, pouls rapide sans sueur ?',
          it: 'Agitazione estrema, paura, polso rapido senza sudore?',
          el: 'Έντονη ανησυχία, φόβος, ταχύς σφυγμός χωρίς ίδρωτα;',
          ru: 'Крайнее беспокойство, тревога, частый пульс без пота?'
        },
        yesRemedy: {
          name: 'Aconitum napellus',
          rationale: {
            de: 'Stürmischer Beginn nach kaltem Ostwind, trockene heiße Haut, panische Unruhe.',
            en: 'Stormy onset after dry cold wind, hot dry skin, intense restless anxiety.',
            es: 'Inicio tempestuoso tras viento frío y seco, piel ardiente sin sudor.',
            fr: 'Début foudroyant après vent froid sec, peau chaude sans sueur, grande agitation.',
            it: 'Esordio fulmineo dopo vento freddo secco, pelle secca e calda, forte ansia.',
            el: 'Θυελλώδης έναρξη μετά από ξηρό κρύο αέρα, ξηρό θερμό δέρμα, ανησυχία.',
            ru: 'Букмекерское бурное начало после сухого ветра, сухая горячая кожа, тревога.'
          }
        },
        noRemedy: {
          name: 'Ferrum phosphoricum',
          rationale: {
            de: 'Auffang-Mittel im Frühstadium: Mäßiges Fieber, wechselnde Gesichtsblässe, weicher Puls.',
            en: 'Early fallback: Moderate fever, alternating flush/pallor, soft quick pulse.',
            es: 'Remedio inicial de reserva: Fiebre moderada, rubor alternante y congestión leve.',
            fr: 'Relais initial : Fièvre modérée, pâleur alternant avec rougeur, pouls souple.',
            it: 'Riserva iniziale: Febbre moderata, rossore alterno, polso morbido.',
            el: 'Αρχικό αντισταθμιστικό: Μέτριος πυρετός, εναλλασσόμενη ωχρότητα προσώπου.',
            ru: 'Начальный компенсирующий препарат: умеренная температура, мягкий пульс.'
          }
        }
      },
      {
        label: {
          de: '[ ENTZÜNDUNGS-KONGESTION ]',
          en: '[ CONGESTIVE STAGE ]',
          es: '[ FASE CONGESTIVA ]',
          fr: '[ STADE DE CONGESTION ]',
          it: '[ STADIO CONGESTIZIO ]',
          el: '[ ΣΥΜΦΟΡΗΤΙΚΟ ΣΤΑΔΙΟ ]',
          ru: '[ СТАДИЯ ЗАСТОЯ И ПРИЛИВА ]'
        },
        question: {
          de: 'Roter Kopf, weite Pupillen, klopfende Karotiden, feuchte Hitze?',
          en: 'Red face, dilated pupils, throbbing carotids, steaming hot skin?',
          es: '¿Rostro rojo, pupilas dilatadas, carótidas latiendo, calor sofocante?',
          fr: 'Visage rouge, pupilles dilatées, battements carotidiens, chaleur brûlante ?',
          it: 'Volto rosso, pupille dilatate, carotidi pulsanti, calore umido?',
          el: 'Κόκκινο πρόσωπο, διεσταλμένες κόρες, παλλόμενες καρωτίδες, καυτός ιδρώτας;',
          ru: 'Красное лицо, расширенные зрачки, пульсация сонных артерий, влажный жар?'
        },
        yesRemedy: {
          name: 'Belladonna',
          rationale: {
            de: 'Plötzliche hämmernde Gefäßkongestion, Lichtscheu, brennende Hitze mit Schweißneigung.',
            en: 'Sudden vascular throbbing, photophobia, intense burning heat with tendency to sweat.',
            es: 'Congestión violenta y pulsátil, fotofobia y calor ardiente.',
            fr: 'Congestion violente battante, photophobie, peau brûlante.',
            it: 'Violenta congestione pulsante, fotofobia, calore ardente.',
            el: 'Βίαιη σφύζουσα συμφόρηση, φωτοφοβία, καυστική θερμότητα.',
            ru: 'Внезапный пульсирующий прилив крови, светобоязнь, палящий жар.'
          }
        },
        noRemedy: {
          name: 'Gelsemium sempervirens',
          rationale: {
            de: 'Auffang-Mittel bei Infekt: Dumpfe Schwere, zittrige Schwäche, schwere Augenlider, Durstlosigkeit.',
            en: 'Infection fallback: Heavy dullness, trembling weakness, heavy droopy eyelids, thirstless.',
            es: 'Remedio infeccioso compensador: Pesadez, debilidad temblorosa, párpados pesados.',
            fr: 'Relais infectieux : Lourdeur, faiblesse tremblante, paupières lourdes, sans soif.',
            it: 'Riserva infettiva: Pesantezza ottusa, debolezza con tremori, palpebre cadenti.',
            el: 'Αντισταθμιστικό λοίμωξης: Βαρύ κεφάλι, τρέμουλο, βαριά βλέφαρα, έλλειψη δίψας.',
            ru: 'Инфекционный компенсирующий препарат: тяжесть, дрожащая слабость, тяжелые веки.'
          }
        }
      },
      {
        label: {
          de: '[ REINER BEWEGUNGSSCHMERZ ]',
          en: '[ MOTION-AGGRAVATED ]',
          es: '[ DOLOR POR MOVIMIENTO ]',
          fr: '[ AGGRAVATION PAR LE MOUVEMENT ]',
          it: '[ AGGRAVAMENTO DA MOVIMENTO ]',
          el: '[ ΕΠΙΔΕΙΝΩΣΗ ΑΠΟ ΚΙΝΗΣΗ ]',
          ru: '[ БОЛЬ ПРИ ДВИЖЕНИИ ]'
        },
        question: {
          de: 'Verschlimmert jede kleinste Bewegung? Großer Durst auf kaltes Wasser?',
          en: 'Aggravation from slightest movement? Great thirst for large quantities of cold water?',
          es: '¿Empeora con el más mínimo movimiento? ¿Gran sed de agua fría?',
          fr: 'Aggravation au moindre mouvement ? Grande soif de grandes quantités d\'eau froide ?',
          it: 'Peggiora al minimo movimento? Grande sete di abbondante acqua fredda?',
          el: 'Επιδεινώνεται από την παραμικρή κίνηση; Μεγάλη δίψα για κρύο νερό;',
          ru: 'Хуже от малейшего движения? Сильная жажда холодной воды?'
        },
        yesRemedy: {
          name: 'Bryonia alba',
          rationale: {
            de: 'Stechende Schmerzen, absolute Ruhebefriedigung, Schleimhauttrockenheit, Durst auf viel Wasser.',
            en: 'Stitching pains, absolute relief by complete immobility, intense mucosal dryness.',
            es: 'Dolores punzantes, alivio total por reposo absoluto y gran sed.',
            fr: 'Douleurs piquantes, soulagement complet par le repos absolu, soif intense.',
            it: 'Dolori pungenti, sollievo assoluto con l\'immobilità, secchezza delle mucose.',
            el: 'Σουβλιστοί πόνοι, απόλυτη ανακούφιση με ακινησία, έντονη ξηρότητα.',
            ru: 'Колющие боли, абсолютное облегчение в покое, сильная сухость слизистых.'
          }
        },
        noRemedy: {
          name: 'Rhus toxicodendron',
          rationale: {
            de: 'Auffang-Mittel bei Gliederschmerzen: Besserung durch kontinuierliche Bewegung, Ruhelosigkeit im Bett.',
            en: 'Body-ache fallback: Better by continued movement, must toss about in bed.',
            es: 'Remedio compensador para dolores musculares: Mejora con movimiento continuo.',
            fr: 'Relais courbatures : Soulagement par le mouvement continu, agitation nocturne.',
            it: 'Riserva dolori muscolari: Migliora col movimento continuo, irrequietezza a letto.',
            el: 'Αντισταθμιστικό μυαλγιών: Βελτίωση με συνεχή κίνηση, ανησυχία στο κρεβάτι.',
            ru: 'Компенсирующий препарат при ломоте: лучше от постоянного движения.'
          }
        }
      }
    ],
    diagnosticQuestions: {
      de: [
        'Begann das Fieber plötzlich und stürmisch nach kaltem trockenem Wind?',
        'Besteht brennende Hitze mit hochrotem Kopf und Schweißneigung (Belladonna) oder trockene Haut (Aconitum)?',
        'Verschlimmert die geringste Bewegung die Schmerzen oder fordert der Körper ständige Bewegung?'
      ],
      en: [
        'Did the fever begin suddenly and stormily after exposure to dry cold wind?',
        'Is there burning heat with flushed face and sweating tendency or hot dry skin?',
        'Does the slightest motion aggravate, or does the patient need continuous movement?'
      ],
      es: [
        '¿Comenzó la fiebre súbita y tempestuosamente tras viento frío y seco?',
        '¿Hay calor ardiente con rostro rojo y sudor o piel completamente seca?',
        '¿El menor movimiento empeora los dolores o necesita moverse constantemente?'
      ],
      fr: [
        'La fièvre a-t-elle débuté brutalement après exposition au vent froid sec ?',
        'Y a-t-il une chaleur brûlante avec visage rouge ou une peau totalement sèche ?',
        'Le moindre mouvement aggrave-t-il ou le patient doit-il bouger sans cesse ?'
      ],
      it: [
        'La febbre è iniziata improvvisamente dopo vento freddo secco?',
        'C\'è calore bruciante con viso rosso e sudore o pelle totalmente asciutta?',
        'Il minimo movimento peggiora o il paziente cerca continuo movimento?'
      ],
      el: [
        'Ξεκίνησε ο πυρετός ξαφνικά και ορμητικά μετά από ξηρό κρύο αέρα;',
        'Υπάρχει καυτή θερμότητα με κόκκινο πρόσωπο ή απόλυτα ξηρό δέρμα;',
        'Επιδεινώνει η παραμικρή κίνηση ή ανακουφίζει η συνεχής κίνηση;'
      ],
      ru: [
        'Началась ли температура внезапно и бурно после холодного ветра?',
        'Присутствует ли палящий жар с красным лицом или совершенно сухая кожа?',
        'Ухудшает ли малейшее движение или требуется постоянное движение?'
      ]
    },
    primarySimile: {
      name: 'Aconitum napellus',
      rationale: {
        de: 'Passt exakt auf das plötzliche stürmische Initialstadium mit Unruhe und Causa Kälteeinwirkung.',
        en: 'Matches precisely the stormy acute onset with anxiety and cold-exposure causa.',
        es: 'Coincide con el inicio fulminante, inquietud y causa por frío seco.',
        fr: 'Correspond exactement au début foudroyant avec anxiété et cause de froid sec.',
        it: 'Corrisponde esattamente all\'esordio fulmineo con ansia e causa da freddo.',
        el: 'Ταιριάζει απόλυτα στην αιφνίδια έναρξη με ανησυχία και αιτία το ψύχος.',
        ru: 'В точности соответствует внезапному началу с тревогой после переохлаждения.'
      }
    },
    asciiDiagram: {
      de: `     [ PLÖTZLICHER AKUTER INFEKT & FIEBER ]
                               │
            Gab es eine Causa durch Kälte oder Schreck?
      ┌────────────────────────┼────────────────────────┐
      ▼                        ▼                        ▼
[ INITIAL-STADIUM ]      [ CONGESTIV / HITZE ]    [ BEWEGUNGSSCHMERZ ]
      │                        │                        │
      ▼                        ▼                        ▼
Angst & Unruhe?          Roter Kopf, Schwitzen?   Jede Bewegung schmerzt?
Trockene Haut?           Klopfen der Schläfen?    Großer Durst auf Wasser?
  ┌───┴───┐                ┌───┴───┐                ┌───┴───┐
 JA      NEIN             JA      NEIN             JA      NEIN
  │       │                │       │                │       │
  ▼       ▼                ▼       ▼                ▼       ▼
[ACONIT] [FERRUM PHOS]  [BELLADONNA] [GELSEMIUM]  [BRYONIA] [RHUS TOX]`,
      en: `     [ SUDDEN ACUTE INFECTION & FEVER ]
                               │
            Was there exposure to cold wind or fright?
      ┌────────────────────────┼────────────────────────┐
      ▼                        ▼                        ▼
[ INITIAL STAGE ]        [ CONGESTIVE STAGE ]     [ MOTION AGGRAVATION ]
      │                        │                        │
      ▼                        ▼                        ▼
Fear & Restless?         Red face, sweating?      Any movement painful?
Dry hot skin?            Throbbing carotids?      Great thirst for water?
  ┌───┴───┐                ┌───┴───┐                ┌───┴───┐
 YES      NO              YES      NO              YES      NO
  │       │                │       │                │       │
  ▼       ▼                ▼       ▼                ▼       ▼
[ACONIT] [FERRUM PHOS]  [BELLADONNA] [GELSEMIUM]  [BRYONIA] [RHUS TOX]`,
      es: `     [ INFECCIÓN AGUDA REPENTINA Y FIEBRE ]
                               │
            ¿Hubo causa por viento frío o sobresalto?
      ┌────────────────────────┼────────────────────────┐
      ▼                        ▼                        ▼
[ FASE INICIAL ]         [ FASE CONGESTIVA ]      [ DOLOR AL MOVIMIENTO ]
      │                        │                        │
      ▼                        ▼                        ▼
¿Ansiedad e inquietud?   ¿Cara roja y sudor?      ¿Duele el menor movimiento?
¿Piel caliente y seca?   ¿Latidos fuertes?        ¿Gran sed de agua fría?
  ┌───┴───┐                ┌───┴───┐                ┌───┴───┐
 SÍ       NO              SÍ       NO              SÍ       NO
  │       │                │       │                │       │
  ▼       ▼                ▼       ▼                ▼       ▼
[ACONIT] [FERRUM PHOS]  [BELLADONNA] [GELSEMIUM]  [BRYONIA] [RHUS TOX]`,
      fr: `     [ INFECTION AIGUË SOUDAINE & FIÈVRE ]
                               │
            Exposition au vent froid sec ou frayeur ?
      ┌────────────────────────┼────────────────────────┐
      ▼                        ▼                        ▼
[ STADE INITIAL ]        [ STADE CONGESTIF ]      [ DOULEUR AU MOUVEMENT ]
      │                        │                        │
      ▼                        ▼                        ▼
Anxiété & agitation ?    Visage rouge, sueurs ?   Tout mouvement aggrave ?
Peau sèche et brûlante ? Battements carotides ?   Grande soif d'eau ?
  ┌───┴───┐                ┌───┴───┐                ┌───┴───┐
 OUI     NON              OUI     NON              OUI     NON
  │       │                │       │                │       │
  ▼       ▼                ▼       ▼                ▼       ▼
[ACONIT] [FERRUM PHOS]  [BELLADONNA] [GELSEMIUM]  [BRYONIA] [RHUS TOX]`,
      it: `     [ INFEZIONE ACUTA IMPROVVISA E FEBBRE ]
                               │
            Esposizione a freddo secco o spavento?
      ┌────────────────────────┼────────────────────────┐
      ▼                        ▼                        ▼
[ STADIO INIZIALE ]      [ CONGESTIONE ACUTA ]    [ DOLORE DA MOVIMENTO ]
      │                        │                        │
      ▼                        ▼                        ▼
Ansia e irrequietezza?   Viso rosso, sudore?      Ogni movimento fa male?
Pelle secca e calda?     Carotidi pulsanti?       Grande sete di acqua?
  ┌───┴───┐                ┌───┴───┐                ┌───┴───┐
  SÌ      NO               SÌ      NO               SÌ      NO
  │       │                │       │                │       │
  ▼       ▼                ▼       ▼                ▼       ▼
[ACONIT] [FERRUM PHOS]  [BELLADONNA] [GELSEMIUM]  [BRYONIA] [RHUS TOX]`,
      el: `     [ ΑΙΦΝΙΔΙΑ ΟΞΕΙΑ ΛΟΙΜΩΞΗ & ΠΥΡΕΤΟΣ ]
                               │
            Υπήρξε έκθεση σε ψύχος ή έντονος φόβος;
      ┌────────────────────────┼────────────────────────┐
      ▼                        ▼                        ▼
[ ΑΡΧΙΚΟ ΣΤΑΔΙΟ ]        [ ΣΥΜΦΟΡΗΤΙΚΟ ΣΤΑΔΙΟ ]   [ ΕΠΙΔΕΙΝΩΣΗ ΑΠΟ ΚΙΝΗΣΗ ]
      │                        │                        │
      ▼                        ▼                        ▼
Ανησυχία & φόβος;        Κόκκινο πρόσωπο, ιδρώτας; Κάθε κίνηση πονάει;
Ξηρό καυτό δέρμα;        Παλλόμενες καρωτίδες;    Μεγάλη δίψα για νερό;
  ┌───┴───┐                ┌───┴───┐                ┌───┴───┐
 ΝΑΙ     ΟΧΙ              ΝΑΙ     ΟΧΙ              ΝΑΙ     ΟΧΙ
  │       │                │       │                │       │
  ▼       ▼                ▼       ▼                ▼       ▼
[ACONIT] [FERRUM PHOS]  [BELLADONNA] [GELSEMIUM]  [BRYONIA] [RHUS TOX]`,
      ru: `     [ ВНЕЗАПНАЯ ОСТРАЯ ИНФЕКЦИЯ И ЛИХОРАДКА ]
                               │
            Было ли воздействие сухого холода или испуга?
      ┌────────────────────────┼────────────────────────┐
      ▼                        ▼                        ▼
[ НАЧАЛЬНАЯ СТАДИЯ ]     [ ПРИЛИВ КРОВИ / ЖАР ]   [ БОЛЬ ПРИ ДВИЖЕНИИ ]
      │                        │                        │
      ▼                        ▼                        ▼
Тревога, беспокойство?   Красное лицо, пот?       Любое движение причиняет боль?
Сухая горячая кожа?      Пульсация артерий?       Сильная жажда холодной воды?
  ┌───┴───┐                ┌───┴───┐                ┌───┴───┐
  ДА     НЕТ               ДА     НЕТ               ДА     НЕТ
  │       │                │       │                │       │
  ▼       ▼                ▼       ▼                ▼       ▼
[ACONIT] [FERRUM PHOS]  [BELLADONNA] [GELSEMIUM]  [BRYONIA] [RHUS TOX]`
    }
  },

  gastro_colic: {
    keywords: [
      'bauch', 'magen', 'krampf', 'kolik', 'blähung', 'übelkeit', 'erbrechen', 'durchfall', 'sodbrennen',
      'stomach', 'abdomen', 'belly', 'cramp', 'colic', 'nausea', 'vomiting', 'diarrhea', 'bloating',
      'dolor de estómago', 'cólico', 'vientre', 'nauseas', 'diarrea', 'douleur d\'estomac', 'colique',
      'ventre', 'nausée', 'diarrhée', 'mal di pancia', 'colica', 'stomaco', 'κοιλιά', 'στόμαχος', 'κολικός', 'διάρροια', 'живот', 'спазм', 'колика'
    ],
    header: {
      de: '[ AKUTE BAUCH- & MAGENKRÄMPFE / KOLIK ]',
      en: '[ ACUTE ABDOMINAL & GASTRIC COLIC ]',
      es: '[ CÓLICO Y ESPASMOS ABDOMINALES AGUDOS ]',
      fr: '[ COLIQUE ET CRAMPES ABDOMINALES AIGUËS ]',
      it: '[ COLICA E CRAMPI ADDOMINALI ACUTI ]',
      el: '[ ΟΞΕΙΕΣ ΚΟΙΛΙΑΚΕΣ ΚΡΑΜΠΕΣ & ΚΟΛΙΚΟΣ ]',
      ru: '[ ОСТРЫЕ СПАЗМЫ В ЖИВОТЕ И КОЛИКИ ]'
    },
    rootQuestion: {
      de: 'Welche Körperhaltung oder Wärmeeinwirkung bringt Erleichterung?',
      en: 'What body posture or thermal modality brings relief?',
      es: '¿Qué postura corporal o aplicación de calor proporciona alivio?',
      fr: 'Quelle posture corporelle ou application de chaleur apporte du soulagement ?',
      it: 'Quale postura o applicazione termica reca sollievo?',
      el: 'Ποια στάση σώματος ή θερμότητα προσφέρει ανακούφιση;',
      ru: 'Какое положение тела или действие тепла приносит облегчение?'
    },
    branches: [
      {
        label: {
          de: '[ ZUSAMMENKRÜMMEN / DRUCK ]',
          en: '[ BENDING DOUBLE / PRESSURE ]',
          es: '[ DOBLARSE EN DOS / PRESIÓN ]',
          fr: '[ PLIÉ EN DEUX / PRESSION ]',
          it: '[ PIEGARSI IN DUE / PRESSIONE ]',
          el: '[ ΔΙΠΛΩΜΑ ΣΤΑ ΔΥΟ / ΠΙΕΣΗ ]',
          ru: '[ СГИБАНИЕ ПОПОЛАМ / ДАВЛЕНИЕ ]'
        },
        question: {
          de: 'Krämpfe bessern sich drastisch durch starkes Zusammenkrümmen und festen Druck?',
          en: 'Cramps improve drastically by violent bending double and hard pressure?',
          es: '¿Los calambres mejoran doblando fuertemente el cuerpo y presionando con fuerza?',
          fr: 'Les crampes s\'améliorent-elles en se pliant en deux et par forte pression ?',
          it: 'I crampi migliorano piegandosi in due e premendo con forza?',
          el: 'Οι κράμπες βελτιώνονται δραστικά διπλώνοντας το σώμα και πιέζοντας δυνατά;',
          ru: 'Спазмы резко облегчаются сгибанием пополам и сильным давлением?'
        },
        yesRemedy: {
          name: 'Colocynthis',
          rationale: {
            de: 'Parade-Leitsymptom: Heftige krampfartige Schmerzen, Besserung nur durch starkes Vornüberbeugen und Druck.',
            en: 'Parade keynote: Violent cramping pains, relieved exclusively by bending double and pressure.',
            es: 'Síntoma guía primordial: Dolores espasmódicos aliviados al doblarse en dos y fuerte presión.',
            fr: 'Symptôme clé par excellence : Douleurs spasmodiques soulagées uniquement en se pliant en deux.',
            it: 'Sintomo guida fondamentale: Dolori crampiformi alleviati solo piegandosi in due.',
            el: 'Κορυφαίο σύμπτωμα-κλειδί: Βίαιοι σπασμοί που ανακουφίζονται μόνο με δίπλωμα στα δύο.',
            ru: 'Ведущий симптом: жестокие схваткообразные боли, облегчение только при сгибании пополам.'
          }
        },
        noRemedy: {
          name: 'Magnesia phosphorica',
          rationale: {
            de: 'Auffang-Mittel bei Nerven-/Muskelkrampf: Besserung durch heiße Umschläge und sanfte Wärme.',
            en: 'Spasmodic fallback: Relieved by radiating heat, warm compresses, and gentle friction.',
            es: 'Remedio espasmódico compensador: Alivio mediante compresas calientes y calor local.',
            fr: 'Relais antispasmodique : Soulagement par compresses chaudes et chaleur rayonnante.',
            it: 'Riserva antispasmodica: Migliora con calore radiante e impacchi caldi.',
            el: 'Αντισταθμιστικό σπασμών: Ανακούφιση με ζεστές κομπρέσες και τοπική ζέστη.',
            ru: 'Компенсирующий препарат при спазмах: облегчение горячими компрессами и теплом.'
          }
        }
      },
      {
        label: {
          de: '[ DIÄTISCHER REIZ / ÜBERLASTUNG ]',
          en: '[ DIETARY OVERLOAD / TOXIC ]',
          es: '[ SOBRECARGA ALIMENTARIA ]',
          fr: '[ SURCHARGE ALIMENTAIRE / EXCÈS ]',
          it: '[ SOVRACCARICO ALIMENTARE ]',
          el: '[ ΔΙΑΙΤΗΤΙΚΗ ΥΠΕΡΦΟΡΤΩΣΗ ]',
          ru: '[ ПЕРЕЕДАНИЕ / РАЗДРАЖЕНИЕ ]'
        },
        question: {
          de: 'Nach Kaffee, Alkohol, reichlichem Essen, vergeblichem Stuhldrang, ärgerlicher Reizbarkeit?',
          en: 'After coffee, alcohol, rich food, ineffectual urging to stool, angry irritability?',
          es: '¿Tras café, alcohol, comida copiosa, deseos ineficaces de defecar y cólera?',
          fr: 'Après café, alcool, excès de table, besoins inefficaces et colère ?',
          it: 'Dopo caffè, alcolici, eccessi a tavola, stimolo inefficace ed irritabilità?',
          el: 'Μετά από καφέ, αλκοόλ, βαρύ φαγητό, αναποτελεσματική τάση για κένωση;',
          ru: 'После кофе, алкоголя, обильной еды, безрезультатные позывы к стулу, раздражительность?'
        },
        yesRemedy: {
          name: 'Nux vomica',
          rationale: {
            de: 'Klassische Reiz- und Überlastungscausa: Krämpfe, Kälteempfindlichkeit, ständiger unvollständiger Drang.',
            en: 'Classic stimulant overload causa: Spasms, chilliness, ineffectual urging, quick temper.',
            es: 'Causa clásica por estimulantes: Espasmos, frialdad, tenesmo ineficaz e irritabilidad.',
            fr: 'Cause classique d\'excès de stimulants : Crampes, frilosité, besoins inefficaces.',
            it: 'Causa classica da eccessi e stimolanti: Crampi, freddolosità, tenesmo inefficace.',
            el: 'Κλασική αιτία υπερβολής σε διεγερτικά: Σπασμοί, ρίγος, αναποτελεσματικός τεινεσμός.',
            ru: 'Классическая причина злоупотребления: спазмы, зябкость, раздражительность.'
          }
        },
        noRemedy: {
          name: 'Carbo vegetabilis',
          rationale: {
            de: 'Auffang-Mittel bei schwerem Blähbauch: Obere Verdauungsschwäche, Bedürfnis nach Luftzug/Fächeln.',
            en: 'Flatulent fallback: Upper digestive paralysis, trapped gas, desires to be fanned.',
            es: 'Remedio compensador para distensión superior: Meteorismo, debilidad y necesidad de aire.',
            fr: 'Relais pour météorisme sévère : Distension gastrique, besoin d\'air frais et d\'éventail.',
            it: 'Riserva meteorismo addominale: Fermentazione gastrica, bisogno di aria fresca.',
            el: 'Αντισταθμιστικό τυμπανισμού: Ατονία πέψης, ανάγκη για ρεύμα φρέσκου αέρα.',
            ru: 'Компенсирующий препарат при вздутии: слабость пищеварения, жажда свежего воздуха.'
          }
        }
      },
      {
        label: {
          de: '[ VERGIFTUNG / GASTROENTERITIS ]',
          en: '[ FOOD POISONING / ENTERITIS ]',
          es: '[ GASTROENTERITIS / INTOXICACIÓN ]',
          fr: '[ INTOXICATION / GASTRO-ENTÉRITE ]',
          it: '[ TOSSINFEZIONE / GASTROENTERITE ]',
          el: '[ ΓΑΣΤΡΕΝΤΕΡΙΤΙΔΑ / ΔΗΛΗΤΗΡΙΑΣΗ ]',
          ru: '[ ТОКСИКОИНФЕКЦИЯ / ЭНТЕРИТ ]'
        },
        question: {
          de: 'Brennende Magen-/Darmschmerzen, extreme Schwäche, Durst auf kleine Schlucke?',
          en: 'Burning stomach/gut pains, prostration, thirst for frequent small sips of water?',
          es: '¿Dolores ardientes, debilidad extrema, sed de pequeños sorbos frecuentes?',
          fr: 'Douleurs brûlantes, prostration intense, soif de petites gorgées fréquentes ?',
          it: 'Dolori brucianti, prostrazione, sete di piccoli sorsi frequenti?',
          el: 'Καυστικός πόνος, έντονη καταβολή, δίψα για μικρές γουλιές νερού;',
          ru: 'Жгучая боль, сильная слабость, жажда пить часто маленькими глотками?'
        },
        yesRemedy: {
          name: 'Arsenicum album',
          rationale: {
            de: 'Brennende Schmerzen wie glühende Kohlen, Besserung durch lokale Hitze, ängstliche Ruhelosigkeit.',
            en: 'Burning pains like coals, relieved by external warmth, anxious restlessness.',
            es: 'Dolores ardientes aliviados por calor local, inquietud ansiosa.',
            fr: 'Douleurs brûlantes soulagées par la chaleur, grande anxiété.',
            it: 'Dolori brucianti alleviati dal calore esterno, ansia e inquietudine.',
            el: 'Καυστικοί πόνοι που ανακουφίζονται με τοπική ζέστη, ανησυχία.',
            ru: 'Жгучие боли, облегчаемые местным теплом, тревожное беспокойство.'
          }
        },
        noRemedy: {
          name: 'Veratrum album',
          rationale: {
            de: 'Auffang-Mittel bei akutem Kollaps: Eiskalter Schweiß auf der Stirn, Erbrechen und Durchfall.',
            en: 'Collapse fallback: Cold sweat on forehead, concurrent vomiting and purging.',
            es: 'Remedio compensador para colapso: Sudor helado en la frente, vómitos y diarrea.',
            fr: 'Relais en cas de collapsus : Sueur froide au front, vomissements et diarrhées profuses.',
            it: 'Riserva per collasso: Sudore gelato sulla fronte, vomito e diarrea contemporanei.',
            el: 'Αντισταθμιστικό εξάντλησης: Παγωμένος ιδρώτας στο μέτωπο, εμετός και διάρροια.',
            ru: 'Препарат резерва при упадке сил: ледяной пот на лбу, рвота и понос.'
          }
        }
      }
    ],
    diagnosticQuestions: {
      de: [
        'Bessern sich die Bauchkrämpfe nur durch kräftiges Vorüberbeugen (Zusammenkrümmen)?',
        'Besteht eine Verschlimmerung nach Kaffee, Schokolade, Alkohol oder schwerem Essen mit Reizbarkeit?',
        'Sind die Schmerzen brennend und verlangen heiße Getränke oder Umschläge?'
      ],
      en: [
        'Do the abdominal cramps improve only by forceful bending double and hard pressure?',
        'Is there aggravation after coffee, rich food, or alcohol with irritability?',
        'Are the pains burning and relieved by hot drinks or external warmth?'
      ],
      es: [
        '¿Se alivian los calambres únicamente al doblarse fuertemente hacia adelante?',
        '¿Empeora tras café, comida pesada o alcohol con marcada irritabilidad?',
        '¿Los dolores son ardientes y exigen bebidas calientes o calor local?'
      ],
      fr: [
        'Les crampes s\'améliorent-elles uniquement en se pliant fortement en deux ?',
        'Y a-t-il une aggravation après café, repas lourd ou alcool avec irritabilité ?',
        'Les douleurs sont-elles brûlantes et réclament-elles des boissons chaudes ?'
      ],
      it: [
        'I crampi migliorano solo piegandosi con forza in avanti e premendo?',
        'C\'è un peggioramento dopo caffè, pasti abbondanti o alcol con irritabilità?',
        'I dolori sono brucianti e richiedono bevande calde o impacchi caldi?'
      ],
      el: [
        'Βελτιώνονται οι κράμπες μόνο με δυνατό δίπλωμα του σώματος στα δύο;',
        'Υπάρχει επιδείνωση μετά από καφέ, βαρύ φαγητό ή αλκοόλ με ευερεθιστότητα;',
        'Είναι οι πόνοι καυστικοί και ανακουφίζονται με ζεστά ροφήματα ή κομπρέσες;'
      ],
      ru: [
        'Облегчаются ли спазмы исключительно при сильном сгибании пополам?',
        'Есть ли ухудшение от кофе, жирной пищи или алкоголя с раздражительностью?',
        'Носят ли боли жгучий характер и требуют ли горячих напитков или тепла?'
      ]
    },
    primarySimile: {
      name: 'Colocynthis',
      rationale: {
        de: 'Exakte Passung auf krampfartige schneidende Bauchkoliken mit Entlastung durch Zusammenkrümmen und Druck.',
        en: 'Exact match for spasmodic cutting colic with relief by bending double and pressure.',
        es: 'Ajuste exacto a cólicos espasmódicos con alivio al doblarse en dos.',
        fr: 'Correspondance exacte avec les coliques spasmodiques soulagées plié en deux.',
        it: 'Corrispondenza perfetta per coliche spasmodiche che migliorano piegandosi in due.',
        el: 'Απόλυτη συμφωνία με σπαστικούς κολικούς που βελτιώνονται διπλώνοντας στα δύο.',
        ru: 'Точное соответствие схваткообразным коликам с облегчением от сгибания пополам.'
      }
    },
    asciiDiagram: {
      de: `     [ AKUTE BAUCH- & MAGENKRÄMPFE / KOLIK ]
                               │
            Welche Haltung oder Modalität entlastet?
      ┌────────────────────────┼────────────────────────┐
      ▼                        ▼                        ▼
[ ZUSAMMENKRÜMMEN ]      [ REIZ / ÜBERLASTUNG ]   [ BRENNEN / INTOXIKATION ]
      │                        │                        │
      ▼                        ▼                        ▼
Starker Druck lindert?   Ärgerlicher Katerzustand? Brennender Schmerz?
Krämpfe unerträglich?    Stuhlverstopfung/Drang?   Kleine Schlucke Wasser?
  ┌───┴───┐                ┌───┴───┐                ┌───┴───┐
 JA      NEIN             JA      NEIN             JA      NEIN
  │       │                │       │                │       │
  ▼       ▼                ▼       ▼                ▼       ▼
[COLOCYNTH] [MAG PHOS]   [NUX VOMICA] [CARBO VEG]  [ARSENICUM] [VERATRUM ALB]`,
      en: `     [ ACUTE ABDOMINAL & GASTRIC COLIC ]
                               │
            Which posture or thermal modality relieves?
      ┌────────────────────────┼────────────────────────┐
      ▼                        ▼                        ▼
[ BENDING DOUBLE ]       [ DIETARY OVERLOAD ]     [ BURNING / PROSTRATION ]
      │                        │                        │
      ▼                        ▼                        ▼
Relieved by pressure?    Irritable hangover?      Burning pain?
Violent spasmodic?       Ineffectual urging?      Sips of water, anxiety?
  ┌───┴───┐                ┌───┴───┐                ┌───┴───┐
 YES      NO              YES      NO              YES      NO
  │       │                │       │                │       │
  ▼       ▼                ▼       ▼                ▼       ▼
[COLOCYNTH] [MAG PHOS]   [NUX VOMICA] [CARBO VEG]  [ARSENICUM] [VERATRUM ALB]`,
      es: `     [ CÓLICO Y ESPASMOS ABDOMINALES AGUDOS ]
                               │
            ¿Qué postura o modalidad produce alivio?
      ┌────────────────────────┼────────────────────────┐
      ▼                        ▼                        ▼
[ DOBLARSE EN DOS ]      [ SOBRECARGA / TÓXICA ]  [ DOLOR ARDIENTE ]
      │                        │                        │
      ▼                        ▼                        ▼
¿Presión alivia?         ¿Irritabilidad/resaca?   ¿Dolores ardientes?
¿Calambres violentos?    ¿Deseo ineficaz?         ¿Sorbos pequeños de agua?
  ┌───┴───┐                ┌───┴───┐                ┌───┴───┐
 SÍ       NO              SÍ       NO              SÍ       NO
  │       │                │       │                │       │
  ▼       ▼                ▼       ▼                ▼       ▼
[COLOCYNTH] [MAG PHOS]   [NUX VOMICA] [CARBO VEG]  [ARSENICUM] [VERATRUM ALB]`,
      fr: `     [ COLIQUE ET CRAMPES ABDOMINALES AIGUËS ]
                               │
            Quelle posture ou modalité soulage ?
      ┌────────────────────────┼────────────────────────┐
      ▼                        ▼                        ▼
[ PLIÉ EN DEUX ]         [ EXCÈS ALIMENTAIRES ]   [ DOULEUR BRÛLANTE ]
      │                        │                        │
      ▼                        ▼                        ▼
Pression forte soulage ? Irritabilité, réveils ?  Brûlures comme du feu ?
Crampes intenses ?       Besoins inefficaces ?    Boit par petites gorgées ?
  ┌───┴───┐                ┌───┴───┐                ┌───┴───┐
 OUI     NON              OUI     NON              OUI     NON
  │       │                │       │                │       │
  ▼       ▼                ▼       ▼                ▼       ▼
[COLOCYNTH] [MAG PHOS]   [NUX VOMICA] [CARBO VEG]  [ARSENICUM] [VERATRUM ALB]`,
      it: `     [ COLICA E CRAMPI ADDOMINALI ACUTI ]
                               │
            Quale postura o modalità dà sollievo?
      ┌────────────────────────┼────────────────────────┐
      ▼                        ▼                        ▼
[ PIEGARSI IN DUE ]      [ SOVRACCARICO ]         [ DOLORE BRUCIANTE ]
      │                        │                        │
      ▼                        ▼                        ▼
Pressione reca sollievo? Irritabile e intossicato? Bruciore intenso?
Crampi lancinanti?       Stimolo inefficace?      Piccoli sorsi frequenti?
  ┌───┴───┐                ┌───┴───┐                ┌───┴───┐
  SÌ      NO               SÌ      NO               SÌ      NO
  │       │                │       │                │       │
  ▼       ▼                ▼       ▼                ▼       ▼
[COLOCYNTH] [MAG PHOS]   [NUX VOMICA] [CARBO VEG]  [ARSENICUM] [VERATRUM ALB]`,
      el: `     [ ΟΞΕΙΕΣ ΚΟΙΛΙΑΚΕΣ ΚΡΑΜΠΕΣ & ΚΟΛΙΚΟΣ ]
                               │
            Ποια στάση σώματος ή τροποποίηση ανακουφίζει;
      ┌────────────────────────┼────────────────────────┐
      ▼                        ▼                        ▼
[ ΔΙΠΛΩΜΑ ΣΤΑ ΔΥΟ ]      [ ΥΠΕΡΦΟΡΤΩΣΗ ]          [ ΚΑΥΣΤΙΚΟΣ ΠΟΝΟΣ ]
      │                        │                        │
      ▼                        ▼                        ▼
Πίεση ανακουφίζει;       Ευερεθιστότητα, βάρος;   Καυστικός πόνος;
Βίαιοι σπασμοί;          Αναποτελεσματική τάση;   Μικρές γουλιές νερού;
  ┌───┴───┐                ┌───┴───┐                ┌───┴───┐
 ΝΑΙ     ΟΧΙ              ΝΑΙ     ΟΧΙ              ΝΑΙ     ΟΧΙ
  │       │                │       │                │       │
  ▼       ▼                ▼       ▼                ▼       ▼
[COLOCYNTH] [MAG PHOS]   [NUX VOMICA] [CARBO VEG]  [ARSENICUM] [VERATRUM ALB]`,
      ru: `     [ ОСТРЫЕ СПАЗМЫ В ЖИВОТЕ И КОЛИКИ ]
                               │
            Какая поза или модальность приносит облегчение?
      ┌────────────────────────┼────────────────────────┐
      ▼                        ▼                        ▼
[ СГИБАНИЕ ПОПОЛАМ ]     [ РАЗДРАЖЕНИЕ / ЕДА ]    [ ЖГУЧАЯ БОЛЬ ]
      │                        │                        │
      ▼                        ▼                        ▼
Сильное давление помогает? Раздражительность, похмелье? Жгучая боль?
Невыносимые спазмы?      Тщетные позывы к стулу?   Пьет воду мелкими глотками?
  ┌───┴───┐                ┌───┴───┐                ┌───┴───┐
  ДА     НЕТ               ДА     НЕТ               ДА     НЕТ
  │       │                │       │                │       │
  ▼       ▼                ▼       ▼                ▼       ▼
[COLOCYNTH] [MAG PHOS]   [NUX VOMICA] [CARBO VEG]  [ARSENICUM] [VERATRUM ALB]`
    }
  }
};

/**
 * Deterministic Fallback Parser that extracts symptoms cleanly into 4 classical variables
 */
export function extractSymptomsDeterministically(
  inputText: string,
  lang: LanguageCode = 'de'
): {
  hauptbeschwerde: string;
  causa: string;
  modalitaeten: string;
  begleitsymptome: string;
} {
  const lower = inputText.toLowerCase();

  // 1. Hauptbeschwerde / Leitsymptom(e)
  const primaryComplaints: string[] = [];

  if (lower.includes('migrän') || lower.includes('migraen') || lower.includes('migraine') || lower.includes('ημικραν') || lower.includes('мигрен')) {
    primaryComplaints.push(
      lang === 'de' ? 'Rechtsseitige Migräne mit Schläfenbeteiligung' :
      lang === 'en' ? 'Right-sided migraine with temple pain' :
      lang === 'es' ? 'Migraña derecha con dolor temporal' :
      lang === 'fr' ? 'Migraine temporale droite' :
      lang === 'it' ? 'Emicrania temporale destra' :
      lang === 'el' ? 'Δεξιόστροφη ημικρανία κροτάφου' : 'Правосторонняя мигрень'
    );
  } else if (lower.includes('kopf') || lower.includes('headache') || lower.includes('cabeza') || lower.includes('tête') || lower.includes('testa') || lower.includes('πονοκέφαλ')) {
    const isThrobbing = lower.includes('puls') || lower.includes('klopf') || lower.includes('throb') || lower.includes('battant');
    primaryComplaints.push(
      isThrobbing
        ? (lang === 'de' ? 'Akute pulsierende Kopfschmerzen' :
           lang === 'en' ? 'Acute throbbing headache' :
           lang === 'es' ? 'Cefalea punzante aguda' :
           lang === 'fr' ? 'Maux de tête battants aigus' :
           lang === 'it' ? 'Cefalea pulsante acuta' :
           lang === 'el' ? 'Οξύς σφύζων πονοκέφαλος' : 'Острая пульсирующая головная боль')
        : (lang === 'de' ? 'Kopfschmerzen' :
           lang === 'en' ? 'Headache' :
           lang === 'es' ? 'Dolor de cabeza' :
           lang === 'fr' ? 'Maux de tête' :
           lang === 'it' ? 'Mal di testa' :
           lang === 'el' ? 'Πονοκέφαλος' : 'Головная боль')
    );
  }

  if (
    lower.includes('popo') ||
    lower.includes('hämorrhoid') ||
    lower.includes('haemorrhoid') ||
    lower.includes('after') ||
    lower.includes('gesäß') ||
    lower.includes('gesaess') ||
    lower.includes('anal') ||
    lower.includes('rektal') ||
    lower.includes('rectal') ||
    lower.includes('hemorroid') ||
    lower.includes('αιμορροΐδ') ||
    lower.includes('геморро')
  ) {
    primaryComplaints.push(
      lang === 'de' ? 'Anal- & Gesäßschmerzen (Hämorrhoidalbeschwerden)' :
      lang === 'en' ? 'Anal and rectal pain (Hemorrhoidal complaints)' :
      lang === 'es' ? 'Dolor anal y rectal (Hemorroides)' :
      lang === 'fr' ? 'Douleur anale et hémorroïdaire' :
      lang === 'it' ? 'Dolore anale ed emorroidario' :
      lang === 'el' ? 'Πόνος στον πρωκτό & αιμορροΐδες' : 'Анальные и геморроидальные боли'
    );
  }

  if (lower.includes('fieber') || lower.includes('fever') || lower.includes('fiebre') || lower.includes('fièvre') || lower.includes('febbre') || lower.includes('πυρετ') || lower.includes('лихорад')) {
    const isSudden = lower.includes('plötzlich') || lower.includes('sudden') || lower.includes('repent') || lower.includes('soudain') || lower.includes('improvvis') || lower.includes('αιφνίδι') || lower.includes('внезапн');
    const isHigh = lower.includes('hoch') || lower.includes('high') || lower.includes('alta') || lower.includes('élevé') || lower.includes('υψηλ') || lower.includes('высок');
    
    if (isSudden && isHigh) {
      primaryComplaints.push(
        lang === 'de' ? 'Plötzliches hohes Fieber' :
        lang === 'en' ? 'Sudden high fever' :
        lang === 'es' ? 'Fiebre alta repentina' :
        lang === 'fr' ? 'Fièvre élevée soudaine' :
        lang === 'it' ? 'Febbre alta improvvisa' :
        lang === 'el' ? 'Αιφνίδιος υψηλός πυρετός' : 'Внезапная высокая температура'
      );
    } else if (isHigh) {
      primaryComplaints.push(
        lang === 'de' ? 'Hohes Fieber' :
        lang === 'en' ? 'High fever' :
        lang === 'es' ? 'Fiebre alta' :
        lang === 'fr' ? 'Forte fièvre' :
        lang === 'it' ? 'Febbre alta' :
        lang === 'el' ? 'Υψηλός πυρετός' : 'Высокая температура'
      );
    } else if (isSudden) {
      primaryComplaints.push(
        lang === 'de' ? 'Plötzliches Fieber' :
        lang === 'en' ? 'Sudden fever' :
        lang === 'es' ? 'Fiebre repentina' :
        lang === 'fr' ? 'Fièvre soudaine' :
        lang === 'it' ? 'Febbre improvvisa' :
        lang === 'el' ? 'Αιφνίδιος πυρετός' : 'Внезапная температура'
      );
    } else {
      primaryComplaints.push(
        lang === 'de' ? 'Fieber' :
        lang === 'en' ? 'Fever' :
        lang === 'es' ? 'Fiebre' :
        lang === 'fr' ? 'Fièvre' :
        lang === 'it' ? 'Febbre' :
        lang === 'el' ? 'Πυρετός' : 'Лихорадка / температура'
      );
    }
  }

  if (lower.includes('bauch') || lower.includes('magen') || lower.includes('stomach') || lower.includes('krampf') || lower.includes('kolik') || lower.includes('cramp') || lower.includes('colic') || lower.includes('κοιλ') || lower.includes('живот')) {
    const isSpasm = lower.includes('krampf') || lower.includes('kolik') || lower.includes('cramp') || lower.includes('colic') || lower.includes('spasm');
    primaryComplaints.push(
      isSpasm
        ? (lang === 'de' ? 'Akute krampfartige Bauchschmerzen (Kolik)' :
           lang === 'en' ? 'Acute spasmodic abdominal colic' :
           lang === 'es' ? 'Cólico abdominal espasmódico agudo' :
           lang === 'fr' ? 'Coliques abdominales spasmodiques aiguës' :
           lang === 'it' ? 'Colica addominale crampiforme acuta' :
           lang === 'el' ? 'Οξείες σπαστικές κοιλιακές κράμπες' : 'Острые спастические боли в животе')
        : (lang === 'de' ? 'Bauchschmerzen' :
           lang === 'en' ? 'Abdominal pain' :
           lang === 'es' ? 'Dolor abdominal' :
           lang === 'fr' ? 'Douleurs abdominales' :
           lang === 'it' ? 'Dolori addominali' :
           lang === 'el' ? 'Κοιλιακός πόνος' : 'Боль в животе')
    );
  }

  let leitsymptom = '';
  if (primaryComplaints.length >= 2) {
    leitsymptom = primaryComplaints.map((item, idx) => `${idx + 1}. ${item}`).join(' | ');
  } else if (primaryComplaints.length === 1) {
    leitsymptom = primaryComplaints[0];
  } else {
    // Default fallback to the main text snippet
    leitsymptom = inputText.slice(0, 70);
  }

  // 2. Causa (Auslöser/Ursache) - Striktes Interpretationsverbot: Nur übernehmen, wenn im Text explizit genannt.
  let causa = lang === 'de' ? 'Unbekannt / Nicht angegeben (Bitte erfragen)' :
              lang === 'en' ? 'Unknown / Not specified (Please inquire)' :
              lang === 'es' ? 'Desconocido / No especificado (Por favor consultar)' :
              lang === 'fr' ? 'Inconnu / Non spécifié (À demander)' :
              lang === 'it' ? 'Sconosciuto / Non specificato (Da chiedere)' :
              lang === 'el' ? 'Άγνωστο / Μη καθορισμένο (Παρακαλώ ρωτήστε)' : 'Неизвестно / Не указано (Уточнить)';

  // Check if explicit causa indicator exists in input text
  const explicitCausaMatch = inputText.match(/\b(nach|durch|ausgelöst durch|wegen|due to|after|because of|debido a|après|par|a causa di|μετά|από|после|из-за)\s+([^,.;]+)/i);
  if (explicitCausaMatch && explicitCausaMatch[2]) {
    causa = explicitCausaMatch[2].trim();
  }

  // 3. Modalitäten - Striktes Interpretationsverbot: Nur übernehmen, wenn im Text explizit genannt.
  let modalitaeten = lang === 'de' ? 'Unbekannt / Nicht angegeben (Bitte erfragen)' :
                     lang === 'en' ? 'Unknown / Not specified (Please inquire)' :
                     lang === 'es' ? 'Desconocido / No especificado (Por favor consultar)' :
                     lang === 'fr' ? 'Inconnu / Non spécifié (À demander)' :
                     lang === 'it' ? 'Sconosciuto / Non specificato (Da chiedere)' :
                     lang === 'el' ? 'Άγνωστο / Μη καθορισμένο (Παρακαλώ ρωτήστε)' : 'Неизвестно / Не указано (Уточнить)';

  const indicatesBetter = /\b(besser|gebessert|besserung|erleichter|linderung|better|amelior|relie|mejora|mejor|soulag|mieux|miglior|meglio|βελτίωσ|βελτιωσ|καλύτερ|улучш|лучше)\b/i.test(lower);
  const indicatesWorse = /\b(schlimmer|schlechter|verschlimm|verschlecht|unerträglich|verstärkt|worse|aggravat|peor|empeor|agrava|pire|peggior|peggio|χειρότερ|επιδείνωσ|хуже|ухудш)\b/i.test(lower);

  if (indicatesBetter || indicatesWorse) {
    // If explicit modality phrasing exists, capture relevant snippet or general mention
    const modSnippets: string[] = [];
    if (indicatesBetter) modSnippets.push(lang === 'de' ? 'Besserung genannt' : 'Amelioration stated');
    if (indicatesWorse) modSnippets.push(lang === 'de' ? 'Verschlimmerung genannt' : 'Aggravation stated');
    modalitaeten = modSnippets.join(' | ');
  }

  // 4. Begleitsymptome & Gemüt
  let begleitsymptome = '';
  if (lower.includes('süß') || lower.includes('sweet') || lower.includes('dulce') || lower.includes('sucre') || lower.includes('bläh') || lower.includes('bloat') || lower.includes('γλυκ')) {
    begleitsymptome = lang === 'de' ? 'Heißhunger auf Süßes, Völlegefühl, Meteorismus (Blähbauch) und Reizbarkeit' :
                      lang === 'en' ? 'Craving for sweets, abdominal fullness, bloating and irritability' :
                      lang === 'es' ? 'Deseo de dulces, plenitud gástrica, meteorismo e irritabilidad' :
                      lang === 'fr' ? 'Envie de sucreries, plénitude gastrique, gaz et irritabilité' :
                      lang === 'it' ? 'Voglia di dolci, gonfiore addominale, flatulenza e irritabilità' :
                      lang === 'el' ? 'Λιγούρα για γλυκά, φούσκωμα, μετεωρισμός και εκνευρισμός' :
                      'Тяга к сладкому, метеоризм, вздутие живота и раздражительность';
  } else if (lower.includes('schulterblatt') || lower.includes('leber') || lower.includes('galle') || lower.includes('liver') || lower.includes('hígado') || lower.includes('foie') || lower.includes('fegato') || lower.includes('ήπαρ')) {
    begleitsymptome = lang === 'de' ? 'Ausstrahlung in das rechte Schulterblatt, Druckgefühl im rechten Oberbauch' :
                      lang === 'en' ? 'Radiation to right scapula, pressure in right hypochondrium' :
                      lang === 'es' ? 'Irradiación al omóplato derecho y presión en hipocondrio derecho' :
                      lang === 'fr' ? 'Irradiation vers l\'omoplate droite, pesanteur hépatique' :
                      lang === 'it' ? 'Irradiazione alla scapola destra e pesantezza all\'ipocondrio destro' :
                      lang === 'el' ? 'Αντανάκλαση στη δεξιά ωμοπλάτη, πίεση στο δεξιό υποχόνδριο' :
                      'Иррадиация под правую лопатку, тяжесть в правом подреберье';
  } else if (lower.includes('durst') || lower.includes('thirst') || lower.includes('sed') || lower.includes('soif') || lower.includes('sete') || lower.includes('δίψ')) {
    begleitsymptome = lang === 'de' ? 'Auffällige Durstmodalität (großer Durst auf kaltes Wasser oder Durstlosigkeit)' :
                      lang === 'en' ? 'Marked thirst modality (great thirst for cold water or thirstlessness)' :
                      lang === 'es' ? 'Modalidad de sed marcada (gran sed o adipsia)' :
                      lang === 'fr' ? 'Modalité de soif marquée (grande soif ou absence de soif)' :
                      lang === 'it' ? 'Marcata modalità della sete (grande sete o assenza di sete)' :
                      lang === 'el' ? 'Έντονη τροποποίηση δίψας (μεγάλη δίψα ή έλλειψη δίψας)' :
                      'Выраженная жажда холодной воды или полное отсутствие жажды';
  } else if (lower.includes('unruhe') || lower.includes('angst') || lower.includes('reizbar') || lower.includes('restless') || lower.includes('irritable')) {
    begleitsymptome = lang === 'de' ? 'Psychovegetative Begleiterscheinungen: Ausgeprägte Unruhe und Reizbarkeit' :
                      lang === 'en' ? 'Psychovegetative concomitants: Marked restlessness and irritability' :
                      lang === 'es' ? 'Concomitantes psicovegetativos: Inquietud e irritabilidad marcadas' :
                      lang === 'fr' ? 'Concomitants psychovégétatifs : Agitation et irritabilité marquées' :
                      lang === 'it' ? 'Concomitanti psicovegetativi: Irrequietezza e irritabilità marcate' :
                      lang === 'el' ? 'Ψυχοσωματικά συνοδά: Έντονη ανησυχία και ευερεθιστότητα' :
                      'Психовегетативные спутники: выраженное беспокойство и раздражительность';
  } else {
    // Strikt nach Vorgabe: wenn im Text nicht genannt, Unbekannt (Bitte erfragen)
    begleitsymptome = lang === 'de' ? 'Unbekannt (Bitte erfragen)' :
                      lang === 'en' ? 'Unknown (Please inquire)' :
                      lang === 'es' ? 'Desconocido (Por favor consultar)' :
                      lang === 'fr' ? 'Inconnu (À demander)' :
                      lang === 'it' ? 'Sconosciuto (Da chiedere)' :
                      lang === 'el' ? 'Άγνωστο (Παρακαλώ ρωτήστε)' : 'Неизвестно (Уточнить)';
  }

  return {
    hauptbeschwerde: leitsymptom,
    causa,
    modalitaeten,
    begleitsymptome
  };
}

/**
 * Detect the best-matching classical domain or return headache/migraine as standard default
 */
export function getExpertHomeopathicResult(
  inputText: string,
  lang: LanguageCode = 'de'
): HomeopathicExpertResult {
  const lower = inputText.toLowerCase();
  let domainKey = 'headache_migraine';

  if (
    lower.includes('fieber') || lower.includes('fever') || lower.includes('grippe') || lower.includes('schüttelfrost') ||
    lower.includes('infekt') || lower.includes('fièvre') || lower.includes('febbre') || lower.includes('πυρετ')
  ) {
    domainKey = 'fever_infection';
  } else if (
    lower.includes('bauch') || lower.includes('kolik') || lower.includes('magen') || lower.includes('stomach') ||
    lower.includes('cramp') || lower.includes('durchfall') || lower.includes('erbrechen') || lower.includes('κοιλ')
  ) {
    domainKey = 'gastro_colic';
  }

  const domain = EXPERT_DOMAINS[domainKey] || EXPERT_DOMAINS.headache_migraine;
  const extracted = extractSymptomsDeterministically(inputText, lang);

  const branches: DecisionTreeBranch[] = domain.branches.map((b, idx) => ({
    id: `branch_${idx + 1}`,
    branchLabel: b.label[lang] || b.label.de,
    subQuestion: b.question[lang] || b.question.de,
    yesRemedy: {
      name: b.yesRemedy.name,
      rationale: b.yesRemedy.rationale[lang] || b.yesRemedy.rationale.de
    },
    noRemedy: {
      name: b.noRemedy.name,
      rationale: b.noRemedy.rationale[lang] || b.noRemedy.rationale.de
    },
    secondaryQuestion: b.secondaryQuestion ? {
      question: b.secondaryQuestion.question[lang] || b.secondaryQuestion.question.de,
      option1Label: b.secondaryQuestion.option1Label[lang] || b.secondaryQuestion.option1Label.de,
      option1Remedy: {
        name: b.secondaryQuestion.option1Remedy.name,
        rationale: b.secondaryQuestion.option1Remedy.rationale[lang] || b.secondaryQuestion.option1Remedy.rationale.de
      },
      option2Label: b.secondaryQuestion.option2Label[lang] || b.secondaryQuestion.option2Label.de,
      option2Remedy: {
        name: b.secondaryQuestion.option2Remedy.name,
        rationale: b.secondaryQuestion.option2Remedy.rationale[lang] || b.secondaryQuestion.option2Remedy.rationale.de
      }
    } : undefined
  }));

  const textFlowchart = domain.asciiDiagram[lang] || domain.asciiDiagram.de;
  const diagQuestions = domain.diagnosticQuestions[lang] || domain.diagnosticQuestions.de;

  const decisionTree: HomeopathicDecisionTree = {
    header: domain.header[lang] || domain.header.de,
    rootQuestion: domain.rootQuestion[lang] || domain.rootQuestion.de,
    branches,
    textFlowchart
  };

  const isCausaUnknown = extracted.causa.toLowerCase().includes('unbekannt') || extracted.causa.toLowerCase().includes('unknown') || extracted.causa.toLowerCase().includes('desconocido') || extracted.causa.toLowerCase().includes('inconnu') || extracted.causa.toLowerCase().includes('sconosciuto') || extracted.causa.toLowerCase().includes('άγνωστο') || extracted.causa.toLowerCase().includes('неизвестно');
  const isModalitaetenUnknown = extracted.modalitaeten.toLowerCase().includes('unbekannt') || extracted.modalitaeten.toLowerCase().includes('unknown') || extracted.modalitaeten.toLowerCase().includes('desconocido') || extracted.modalitaeten.toLowerCase().includes('inconnu') || extracted.modalitaeten.toLowerCase().includes('sconosciuto') || extracted.modalitaeten.toLowerCase().includes('άγνωστο') || extracted.modalitaeten.toLowerCase().includes('неизвестно');
  const isBegleitUnknown = extracted.begleitsymptome.toLowerCase().includes('unbekannt') || extracted.begleitsymptome.toLowerCase().includes('unknown') || extracted.begleitsymptome.toLowerCase().includes('desconocido') || extracted.begleitsymptome.toLowerCase().includes('inconnu') || extracted.begleitsymptome.toLowerCase().includes('sconosciuto') || extracted.begleitsymptome.toLowerCase().includes('άγνωστο') || extracted.begleitsymptome.toLowerCase().includes('неизвестно');

  const hasMissingVariables = isCausaUnknown || isModalitaetenUnknown || isBegleitUnknown;

  // 5-Step Backend Engine Data Structures
  const extraktion = {
    hauptbeschwerde: extracted.hauptbeschwerde,
    causa: extracted.causa,
    modalitaeten: extracted.modalitaeten,
    begleitsymptome: extracted.begleitsymptome
  };

  const missingExplanation = lang === 'de'
    ? `Zur eindeutigen Simile-Differenzierung fehlen noch Kern-Informationen: ${[isCausaUnknown ? 'Auslöser/Causa' : '', isModalitaetenUnknown ? 'Modalitäten (Besserung/Verschlimmerung)' : '', isBegleitUnknown ? 'Begleitsymptome & Gemüt' : ''].filter(Boolean).join(', ')}. Bitte nutzen Sie die Diagnosefragen.`
    : lang === 'en'
    ? `Core variables needed for definitive simile differentiation are still missing: ${[isCausaUnknown ? 'Trigger/Causa' : '', isModalitaetenUnknown ? 'Modalities' : '', isBegleitUnknown ? 'Concomitants & Mind' : ''].filter(Boolean).join(', ')}. Please refer to the diagnostic questions.`
    : lang === 'es'
    ? `Faltan variables para la diferenciación definitiva del símile: ${[isCausaUnknown ? 'Causa' : '', isModalitaetenUnknown ? 'Modalidades' : '', isBegleitUnknown ? 'Concomitantes' : ''].filter(Boolean).join(', ')}.`
    : lang === 'fr'
    ? `Variables essentielles manquantes pour la différenciation du simile : ${[isCausaUnknown ? 'Causa' : '', isModalitaetenUnknown ? 'Modalités' : '', isBegleitUnknown ? 'Concomitants' : ''].filter(Boolean).join(', ')}.`
    : lang === 'it'
    ? `Variabili essenziali mancanti per la differenziazione del simile: ${[isCausaUnknown ? 'Causa' : '', isModalitaetenUnknown ? 'Modalità' : '', isBegleitUnknown ? 'Concomitanti' : ''].filter(Boolean).join(', ')}.`
    : lang === 'el'
    ? `Λείπουν βασικές πληροφορίες για τη διαφοροδιάγνωση του ομοίου.`
    : `Недостает ключевых данных для точной дифференциации симилиума.`;

  const app_layout_daten = {
    optimales_simile: hasMissingVariables
      ? (lang === 'de' ? 'Fehlende Daten für Empfehlung' :
         lang === 'en' ? 'Missing data for recommendation' :
         lang === 'es' ? 'Datos insuficientes para recomendación' :
         lang === 'fr' ? 'Données manquantes pour la recommandation' :
         lang === 'it' ? 'Dati mancanti per la raccomandazione' :
         lang === 'el' ? 'Ελλιπή δεδομένα για σύσταση' : 'Недостаточно данных для рекомендации')
      : domain.primarySimile.name,
    begruendung: hasMissingVariables
      ? missingExplanation
      : (domain.primarySimile.rationale[lang] || domain.primarySimile.rationale.de)
  };

  const diagnose_fragen_fuer_therapeut = {
    frage_1: diagQuestions[0] || (lang === 'de' ? 'Welche genauen Einflüsse verbessern oder verschlimmern den Zustand?' : 'Which specific influences ameliorate or aggravate the condition?'),
    frage_2: diagQuestions[1] || (lang === 'de' ? 'Welche Gemütsverfassung oder körperlichen Begleitsymptome liegen vor?' : 'What mental state or physical concomitants are present?')
  };

  const waitString = lang === 'de' ? 'Warte auf Eingabe der fehlenden Daten' :
                     lang === 'en' ? 'Awaiting entry of missing data' :
                     lang === 'es' ? 'Esperando datos faltantes' :
                     lang === 'fr' ? 'En attente des données manquantes' :
                     lang === 'it' ? 'In attesa dei dati mancanti' :
                     lang === 'el' ? 'Αναμονή εισαγωγής στοιχείων' : 'Ожидание ввода недостающих данных';

  const incompleteString = lang === 'de' ? 'Unvollständig (Warte auf Eingabe)' :
                          lang === 'en' ? 'Incomplete (Awaiting input)' :
                          lang === 'es' ? 'Incompleto (Esperando datos)' :
                          lang === 'fr' ? 'Incomplet (En attente)' :
                          lang === 'it' ? 'Incompleto (In attesa)' :
                          lang === 'el' ? 'Ημιτελές (Αναμονή)' : 'Не завершено (Ожидание данных)';

  const baumstruktur_popup_daten = {
    start_knoten: `${extracted.hauptbeschwerde} [${extracted.causa}]`,
    haupt_differenzierungs_frage: domain.rootQuestion[lang] || domain.rootQuestion.de,
    pfad_ja: {
      bedingung: lang === 'de' ? 'Zutreffend / Spezifische Modalitäten vorhanden' : 'Applicable / Specific modalities present',
      folge_frage: hasMissingVariables ? waitString : (domain.branches[0]?.question[lang] || domain.branches[0]?.question.de || waitString),
      ergebnis_ja: hasMissingVariables ? incompleteString : domain.branches[0]?.yesRemedy.name || domain.primarySimile.name,
      ergebnis_nein: hasMissingVariables ? incompleteString : domain.branches[0]?.noRemedy.name || 'Nux vomica'
    },
    pfad_nein: {
      bedingung: lang === 'de' ? 'Nicht zutreffend / Andere Modalität' : 'Not applicable / Other modality',
      folge_frage: hasMissingVariables ? waitString : (domain.branches[1]?.question[lang] || domain.branches[1]?.question.de || waitString),
      ergebnis_ja: hasMissingVariables ? incompleteString : domain.branches[1]?.yesRemedy.name || 'Chelidonium majus',
      ergebnis_nein: hasMissingVariables ? incompleteString : domain.branches[1]?.noRemedy.name || 'Ferrum phosphoricum'
    }
  };

  const recommendedSimile = {
    remedyName: app_layout_daten.optimales_simile,
    rationale: app_layout_daten.begruendung
  };

  const formattedMarkdown = `### 1. Extrahierte Fall-Analyse
- **Hauptbeschwerde:** ${extraktion.hauptbeschwerde}
- **Auslöser (Causa):** ${extraktion.causa}
- **Modalitäten:** ${extraktion.modalitaeten}
- **Begleitsymptome:** ${extraktion.begleitsymptome}

### 2. Diagnose-Fragen für den Therapeuten
1. ${diagnose_fragen_fuer_therapeut.frage_1}
2. ${diagnose_fragen_fuer_therapeut.frage_2}

### 3. Empfohlenes Simile (Das Ergebnis)
- **Hauptempfehlung:** ${recommendedSimile.remedyName}
- **Begründung:** ${recommendedSimile.rationale}`;

  return {
    extraktion,
    app_layout_daten,
    diagnose_fragen_fuer_therapeut,
    baumstruktur_popup_daten,
    extractedAnalysis: extraktion,
    startPool: [
      'Lycopodium clavatum', 'Chelidonium majus', 'Sanguinaria canadensis', 'Belladonna',
      'Nux vomica', 'Carduus marianus', 'Spigelia anthelmia', 'Bryonia alba'
    ],
    decisionTree,
    diagnosticQuestions: [
      diagnose_fragen_fuer_therapeut.frage_1,
      diagnose_fragen_fuer_therapeut.frage_2
    ],
    recommendedSimile,
    formattedMarkdown
  };
}

/**
 * Calls Gemini server endpoint /api/acute-repertorise with full 5-step prompt,
 * falling back seamlessly to the deterministic homeopathic expert engine.
 */
export async function analyzeAcuteCaseWithAIOrFallback(
  symptomText: string,
  lang: LanguageCode = 'de'
): Promise<HomeopathicExpertResult> {
  // Always obtain instant fallback state first
  const fallback = getExpertHomeopathicResult(symptomText, lang);

  if (!symptomText || symptomText.trim().length < 3) {
    return fallback;
  }

  try {
    const activeTherapist = getActiveTherapist();
    const res = await fetch('/api/acute-repertorise', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        symptomText: symptomText.trim(),
        language: lang,
        therapistId: activeTherapist?.id || 'th-101',
        therapistName: activeTherapist ? `${activeTherapist.vorname} ${activeTherapist.nachname}` : undefined,
        therapistEmail: activeTherapist?.email
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.result && (data.result.extraktion || data.result.extractedAnalysis)) {
        return data.result as HomeopathicExpertResult;
      }
    }
  } catch (err) {
    console.warn('[HomeopathicExpertEngine] AI API call failed or offline, using deterministic repertorisation:', err);
  }

  return fallback;
}
