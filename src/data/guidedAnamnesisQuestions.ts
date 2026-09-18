import { LanguageCode } from '../types';

export interface AnamnesisOption {
  id: string;
  label: Record<LanguageCode, string>;
  pillarValue: string; // The canonical clinical terms transferred into the pillar
  remediesHint: string; // e.g. "(Belladonna, Sanguinaria, Glonoinum)"
}

export interface PillarQuestion {
  pillarNumber: 1 | 2 | 3 | 4;
  pillarKey: 'locationAndSensation' | 'modalities' | 'concomitants' | 'mind';
  title: Record<LanguageCode, string>;
  question: Record<LanguageCode, string>;
  options: AnamnesisOption[];
}

export interface GuidedAnamnesisTopic {
  id: string;
  keywords: string[];
  chiefComplaint: Record<LanguageCode, string>;
  pillar1: PillarQuestion; // Wo & Wie?
  pillar2: PillarQuestion; // Besser / Schlechter?
  pillar3: PillarQuestion; // Begleitsymptome?
  pillar4: PillarQuestion; // Gemüt / Geist?
}

export const GUIDED_ANAMNESIS_TOPICS: GuidedAnamnesisTopic[] = [
  // 1. KOPFSCHMERZEN / MIGRAENE
  {
    id: 'headache',
    keywords: ['kopf', 'kopfschmerz', 'migräne', 'migraine', 'headache', 'céphalée', 'mal di testa', 'cefalea', 'κεφαλαλγία', 'πονοκέφαλος', 'головная боль'],
    chiefComplaint: {
      de: 'Kopfschmerzen',
      en: 'Headache',
      es: 'Dolor de cabeza',
      fr: 'Maux de tête',
      it: 'Mal di testa',
      el: 'Πονοκέφαλος',
      ru: 'Головная боль'
    },
    pillar1: {
      pillarNumber: 1,
      pillarKey: 'locationAndSensation',
      title: {
        de: 'Säule 1: Lokalisierung & Schmerzart',
        en: 'Pillar 1: Location & Sensation',
        es: 'Pilar 1: Localización y Tipo de Dolor',
        fr: 'Pilier 1 : Localisation et Sensation',
        it: 'Pilastro 1: Localizzazione e Tipo di Dolore',
        el: 'Πυλώνας 1: Εντόπιση & Τύπος Πόνου',
        ru: 'Столп 1: Локализация и Характер Боли'
      },
      question: {
        de: 'An welcher Stelle des Kopfes sitzt der Schmerz und wie fühlt er sich an?',
        en: 'Where is the pain located and how does it feel?',
        es: '¿Dónde se ubica el dolor y cómo se siente exactamente?',
        fr: 'Où se situe la douleur et comment se manifeste-t-elle ?',
        it: 'Dove è localizzato il dolore e come si manifesta esattamente?',
        el: 'Σε ποιο σημείο της κεφαλής εντοπίζεται ο πόνος και πώς ακριβώς εκδηλώνεται;',
        ru: 'В какой части головы локализуется боль и как она ощущается?'
      },
      options: [
        {
          id: 'head-p1-opt1',
          label: {
            de: 'Stirn / Schläfen rechts, pulsierend, hämmernd, wie berstend',
            en: 'Forehead / temples right, pulsating, hammering, bursting sensation',
            es: 'Frente / sienes derecha, pulsátil, martilleante, como si fuera a estallar',
            fr: 'Front / tempes droite, pulsatile, martelante, sensation d\'éclatement',
            it: 'Fronte / tempie destra, pulsante, martellante, sensazione di scoppio',
            el: 'Μέτωπο / κρόταφοι δεξιά, σφυγμικός, σφυροκοπώντας, σαν να εκρήγνυται',
            ru: 'Лоб / виски справа, пульсирующая, стучащая, распирающая'
          },
          pillarValue: 'Stirn Schläfen rechts pulsierend hämmernd berstend',
          remediesHint: '(Belladonna, Sanguinaria, Glonoinum)'
        },
        {
          id: 'head-p1-opt2',
          label: {
            de: 'Hinterkopf & Nacken, zieht über den Scheitel ins rechte Auge',
            en: 'Occiput & nape, radiating over vertex into right eye',
            es: 'Occipucio y nuca, sube por la coronilla hasta el ojo derecho',
            fr: 'Occiput & nuque, remontant vers le sommet jusqu\'à l\'œil droit',
            it: 'Occipite e nuca, si irradia al vertice fino all\'occhio destro',
            el: 'Ινίο & αυχένας, αντανακλά στην κορυφή μέχρι το δεξί μάτι',
            ru: 'Затылок и шея, поднимается через темя в правый глаз'
          },
          pillarValue: 'Hinterkopf Nacken Scheitel rechtes Auge ziehend',
          remediesHint: '(Gelsemium, Silicea, Sanguinaria)'
        },
        {
          id: 'head-p1-opt3',
          label: {
            de: 'Schläfen / Stirn links, stechend oder schneidend wie ein Nagel',
            en: 'Left temple / forehead, stitching or stabbing like a nail',
            es: 'Sien / frente izquierda, punzante o cortante como un clavo',
            fr: 'Tempe / front gauche, piquant ou transperçant comme un clou',
            it: 'Tempia / fronte sinistra, pungente o penetrante come un chiodo',
            el: 'Κρόταφος / μέτωπο αριστερά, σουβλιστικός σαν καρφί',
            ru: 'Висок / лоб слева, колющая или сверлящая как гвоздь'
          },
          pillarValue: 'Schläfen Stirn links stechend schneidend wie ein Nagel',
          remediesHint: '(Spigelia, Sepia, Thuja)'
        },
        {
          id: 'head-p1-opt4',
          label: {
            de: 'Scheitel / Vertex, brennend oder drückende Hitze, wie schweres Gewicht',
            en: 'Vertex / top of head, burning or pressing heat, heavy weight',
            es: 'Coronilla / vertex, calor ardiente o peso opresivo aplastante',
            fr: 'Sommet du crâne, chaleur brûlante ou poids lourd oppressant',
            it: 'Vertice della testa, calore bruciante o peso opprimente gravoso',
            el: 'Κορυφή κεφαλής, καυστική θερμότητα ή αίσθημα βαριού βάρους',
            ru: 'Темя, жгучий жар или давящая тяжесть, ощущение груза'
          },
          pillarValue: 'Scheitel Vertex brennend drückend schweres Gewicht',
          remediesHint: '(Sulphur, Lachesis, Calcarea carbonica)'
        },
        {
          id: 'head-p1-opt5',
          label: {
            de: 'Stirn über den Augen, dumpf, bandförmig wie zu enger Reifen',
            en: 'Forehead over eyes, dull, constricted like a tight band or hoop',
            es: 'Frente sobre los ojos, sordo, constricción en banda apretada',
            fr: 'Front au-dessus des yeux, sourd, sensation de bandeau serré',
            it: 'Fronte sopra gli occhi, sordo, senso di cerchio stretto',
            el: 'Μέτωπο πάνω από τα μάτια, αμβλύς, σαν σφιχτή στεφάνη',
            ru: 'Лоб над глазами, тупая, ощущение сжимающего обруча'
          },
          pillarValue: 'Stirn über den Augen dumpf eingeschnürt enger Reifen',
          remediesHint: '(Gelsemium, Anacardium, Nitricum acidum)'
        }
      ]
    },
    pillar2: {
      pillarNumber: 2,
      pillarKey: 'modalities',
      title: {
        de: 'Säule 2: Modalitäten',
        en: 'Pillar 2: Modalities',
        es: 'Pilar 2: Modalidades',
        fr: 'Pilier 2 : Modalités',
        it: 'Pilastro 2: Modalità',
        el: 'Πυλώνας 2: Τροποποιητικοί Παράγοντες',
        ru: 'Столп 2: Модальности'
      },
      question: {
        de: 'Wodurch wird der Kopfschmerz typischerweise besser oder schlechter?',
        en: 'What typically makes the headache better or worse?',
        es: '¿Qué mejora o empeora típicamente el dolor de cabeza?',
        fr: 'Qu\'est-ce qui améliore ou aggrave typiquement le mal de tête ?',
        it: 'Cosa migliora o peggiora tipicamente il mal di testa?',
        el: 'Τι βελτιώνει ή επιδεινώνει χαρακτηριστικά τον πονοκέφαλο;',
        ru: 'Что обычно улучшает или ухудшает головную боль?'
      },
      options: [
        {
          id: 'head-p2-opt1',
          label: {
            de: '< Bewegung, Erschütterung, Licht, Lärm; > Absolute Ruhe, Dunkelheit, fester Druck',
            en: '< Motion, jar, light, noise; > Absolute rest, darkness, hard pressure',
            es: '< Movimiento, sacudida, luz, ruido; > Reposo absoluto, oscuridad, presión firme',
            fr: '< Mouvement, secousse, lumière, bruit ; > Repos absolu, obscurité, pression forte',
            it: '< Movimento, scosse, luce, rumore; > Riposo assoluto, buio, pressione decisa',
            el: '< Κίνηση, κραδασμοί, φως, θόρυβος· > Απόλυτη ηρεμία, σκοτάδι, ισχυρή πίεση',
            ru: '< Движение, сотрясение, свет, шум; > Полный покой, темнота, тугая повязка'
          },
          pillarValue: '< Bewegung Erschütterung Licht Lärm > absolute Ruhe Dunkelheit Druck',
          remediesHint: '(Bryonia, Belladonna, Silicea)'
        },
        {
          id: 'head-p2-opt2',
          label: {
            de: '< Wärme, warme Zimmerluft, Bücken, Sonne; > Kühle frische Luft, kalte Umschläge',
            en: '< Warmth, stuffy room, stooping, sun; > Cool open air, cold compresses',
            es: '< Calor, habitación cerrada, agacharse, sol; > Aire fresco, compresas frías',
            fr: '< Chaleur, pièce confinée, se baisser, soleil ; > Air frais, compresses froides',
            it: '< Calore, stanza chiusa, chinarsi, sole; > Aria fresca, impacchi freddi',
            el: '< Ζέστη, κλειστοί χώροι, σκύψιμο, ήλιος· > Δροσερός καθαρός αέρας, κρύες κομπρέσες',
            ru: '< Тепло, душная комната, наклон, солнце; > Прохладный свежий воздух, холодные компрессы'
          },
          pillarValue: '< Wärme warmes Zimmer Bücken Sonne > frische Luft Kälte',
          remediesHint: '(Pulsatilla, Natrium muriaticum, Glonoinum)'
        },
        {
          id: 'head-p2-opt3',
          label: {
            de: '< Kälte, Zugluft, Entblößen des Kopfes; > Warmes Einhüllen des Kopfes',
            en: '< Cold, drafts, uncovering head; > Wrapping head warmly',
            es: '< Frío, corrientes de aire, destaparse la cabeza; > Envolver la cabeza calurosamente',
            fr: '< Froid, courants d\'air, se découvrir la tête ; > Envelopper chaudement la tête',
            it: '< Freddo, correnti d\'aria, scoprirsi il capo; > Avvolgere caldamente la testa',
            el: '< Κρύο, ρεύματα αέρα, ακάλυπτο κεφάλι· > Ζεστό τύλιγμα της κεφαλής',
            ru: '< Холод, сквозняк, раскрывание головы; > Теплое укутывание головы'
          },
          pillarValue: '< Kälte Zugluft Entblößen > warmes Einhüllen des Kopfes',
          remediesHint: '(Silicea, Arsenicum album, Hepar sulphuris)'
        },
        {
          id: 'head-p2-opt4',
          label: {
            de: '< Geistige Anstrengung, Kaffee, morgens beim Erwachen; > Im Liegen, durch Schlaf',
            en: '< Mental exertion, coffee, waking in morning; > Lying down, sleep',
            es: '< Esfuerzo mental, café, al despertar por la mañana; > Acostado, sueño',
            fr: '< Effort mental, café, au réveil le matin ; > Allongé, par le sommeil',
            it: '< Sforzo mentale, caffè, al risveglio mattutino; > Sdraiati, dormendo',
            el: '< Πνευματική κόπωση, καφές, πρωινό ξύπνημα· > Κατάκλιση, ύπνος',
            ru: '< Умственное напряжение, кофе, утром при пробуждении; > Лежа, короткий сон'
          },
          pillarValue: '< geistige Anstrengung Kaffee morgens > Liegen Ruhe Schlaf',
          remediesHint: '(Nux vomica, Lycopodium, Ignatia)'
        }
      ]
    },
    pillar3: {
      pillarNumber: 3,
      pillarKey: 'concomitants',
      title: {
        de: 'Säule 3: Begleitsymptome',
        en: 'Pillar 3: Concomitants',
        es: 'Pilar 3: Síntomas Concomitantes',
        fr: 'Pilier 3 : Symptômes Concomitants',
        it: 'Pilastro 3: Sintomi Concomitanti',
        el: 'Πυλώνας 3: Συνοδά Συμπτώματα',
        ru: 'Столп 3: Сопутствующие Симптомы'
      },
      question: {
        de: 'Welche körperlichen Begleiterscheinungen treten gleichzeitig mit dem Schmerz auf?',
        en: 'Which physical symptoms occur synchronously with the headache?',
        es: '¿Qué síntomas físicos acompañan simultáneamente al dolor de cabeza?',
        fr: 'Quels symptômes physiques accompagnent simultanément le mal de tête ?',
        it: 'Quali sintomi fisici accompagnano contemporaneamente il mal di testa?',
        el: 'Ποια σωματικά συμπτώματα συνοδεύουν ταυτόχρονα τον πονοκέφαλο;',
        ru: 'Какие физические симптомы возникают одновременно с головной болью?'
      },
      options: [
        {
          id: 'head-p3-opt1',
          label: {
            de: 'Übelkeit, Erbrechen von saurem Schleim / Galle, Magenflauheit',
            en: 'Nausea, vomiting of sour mucus / bile, empty faint feeling',
            es: 'Náuseas, vómitos de moco ácido / bilis, desvanecimiento gástrico',
            fr: 'Nausées, vomissements de glaires acides / bile, estomac défaillant',
            it: 'Nausea, vomito di muco acido / bile, sensazione di vuoto gastrico',
            el: 'Ναυτία, έμετος όξινης βλέννας / χολής, στομαχική ατονία',
            ru: 'Тошнота, рвота кислым содержимым / желчью, дурнота под ложечкой'
          },
          pillarValue: 'Übelkeit Erbrechen Galle sauer Magenflauheit',
          remediesHint: '(Iris versicolor, Ipecacuanha, Nux vomica)'
        },
        {
          id: 'head-p3-opt2',
          label: {
            de: 'Heißer roter Kopf, klopfende Halsschlagadern bei kalten Händen & Füßen',
            en: 'Hot flushed red head, throbbing carotids with icy cold hands & feet',
            es: 'Cabeza caliente y roja, carótidas latiendo con pies y manos fríos',
            fr: 'Tête chaude et congestionnée, carotides battantes avec mains/pieds froids',
            it: 'Capo caldo e arrossato, carotidi pulsanti con mani e piedi gelidi',
            el: 'Θερμή ερυθρή κεφαλή, σφυγμός στις καρωτίδες με παγωμένα άκρα',
            ru: 'Горячая покрасневшая голова, пульсация сонных артерий при холодных ногах'
          },
          pillarValue: 'Heißer roter Kopf klopfende Halsschlagadern kalte Füße Hände',
          remediesHint: '(Belladonna, Glonoinum, Calcarea carbonica)'
        },
        {
          id: 'head-p3-opt3',
          label: {
            de: 'Sehstörungen, Flimmern oder Halbsichtigkeit vor Schmerzbeginn',
            en: 'Visual disturbances, flickering or hemiopia preceding pain',
            es: 'Trastornos visuales, centelleos o visión parcial antes del dolor',
            fr: 'Troubles visuels, scintillements ou hémianopsie précédant la céphalée',
            it: 'Disturbi visivi, scintillii o emianopsia prima dell\'attacco',
            el: 'Διαταραχές όρασης, τρεμόπαιγμα ή ημιανοψία πριν την έναρξη του πόνου',
            ru: 'Нарушения зрения, мерцание перед глазами или выпадение полей зрения перед приступом'
          },
          pillarValue: 'Sehstörung Flimmern Halbsichtigkeit vor Schmerzbeginn',
          remediesHint: '(Iris versicolor, Gelsemium, Natrium muriaticum)'
        },
        {
          id: 'head-p3-opt4',
          label: {
            de: 'Kopfschmerz löst sich mit reichlicher, klarer Urinausscheidung auf',
            en: 'Headache resolves with profuse, clear urination',
            es: 'El dolor de cabeza cede con micción copiosa y clara',
            fr: 'Le mal de tête se dissipe après une miction abondante et claire',
            it: 'Il mal di testa si risolve con minzione abbondante e chiara',
            el: 'Ο πονοκέφαλος υποχωρεί με άφθονη, διαυγή ούρηση',
            ru: 'Головная боль облегчается обильным выделением прозрачной мочи'
          },
          pillarValue: 'reichliche klare Urinausscheidung lindert Kopfschmerz',
          remediesHint: '(Gelsemium, Ignatia, Silicea)'
        },
        {
          id: 'head-p3-opt5',
          label: {
            de: 'Völlige Durstlosigkeit trotz Hitzegefühl oder trockenen Schleimhäuten',
            en: 'Complete thirstlessness despite sensation of heat or dry lips',
            es: 'Ausencia total de sed a pesar del calor o mucosas secas',
            fr: 'Absence totale de soif malgré la sensation de chaleur',
            it: 'Completa assenza di sete nonostante calore e bocca secca',
            el: 'Πλήρης έλλειψη δίψας παρά την αίσθηση θερμότητας ή ξηρότητας',
            ru: 'Полное отсутствие жажды несмотря на жар и сухость во рту'
          },
          pillarValue: 'völlige Durstlosigkeit trocken Hitzegefühl',
          remediesHint: '(Pulsatilla, Gelsemium, Apis mellifica)'
        }
      ]
    },
    pillar4: {
      pillarNumber: 4,
      pillarKey: 'mind',
      title: {
        de: 'Säule 4: Gemüt & Geist',
        en: 'Pillar 4: Mind & Emotional State',
        es: 'Pilar 4: Mente y Estado Emocional',
        fr: 'Pilier 4 : Esprit et État Émotionnel',
        it: 'Pilastro 4: Mente e Stato Emotivo',
        el: 'Πυλώνας 4: Ψυχική & Νοητική Διάθεση',
        ru: 'Столп 4: Психика и Настроение'
      },
      question: {
        de: 'Wie ist die innere Stimmung und das Verhalten während der Schmerzattacke?',
        en: 'What is the patient\'s inner mood and behaviour during the episode?',
        es: '¿Cuál es el estado de ánimo y comportamiento durante el ataque?',
        fr: 'Quelle est la disposition d\'esprit et l\'humeur pendant la crise ?',
        it: 'Qual è lo stato d\'animo e il comportamento durante la crisi dolorosa?',
        el: 'Ποια είναι η ψυχική διάθεση και η συμπεριφορά κατά την κρίση;',
        ru: 'Каково эмоциональное состояние и поведение во время приступа?'
      },
      options: [
        {
          id: 'head-p4-opt1',
          label: {
            de: 'Überaus gereizt, jähzornig, duldet keinen Widerspruch, lichtempfindlich',
            en: 'Extremely irritable, fiery, cannot bear contradiction or noise',
            es: 'Sumamente irritable, colérico, no tolera contradicción ni ruido',
            fr: 'Extrêmement irritable, coléreux, ne supporte aucune contradiction',
            it: 'Estremamente irritabile, collerico, non tollera la minima contraddizione',
            el: 'Εξαιρετικά ευερέθιστος, οξύθυμος, δεν ανέχεται αντίρρηση ή θόρυβο',
            ru: 'Крайне раздражителен, вспыльчив, не терпит возражений и шума'
          },
          pillarValue: 'reizbar jähzornig ungeduldig geräuschempfindlich',
          remediesHint: '(Nux vomica, Colocynthis, Chamomilla)'
        },
        {
          id: 'head-p4-opt2',
          label: {
            de: 'Ängstlich, motorisch ruhelos, getrieben von Verzweiflung / Todesfurcht',
            en: 'Anxious, physically restless, driven by despair / fear of death',
            es: 'Ansioso, inquietud motora, desesperación o temor a la muerte',
            fr: 'Anxieux, agité physiquement, désespéré avec peur de mourir',
            it: 'Ansioso, irrequieto motoriamente, disperato con paura della morte',
            el: 'Αγχώδης, κινητική ανησυχία, απόγνωση ή φόβος θανάτου',
            ru: 'Тревожен, двигательно беспокоен, охвачен страхом смерти и отчаянием'
          },
          pillarValue: 'ängstlich unruhig Ruhelosigkeit Todesfurcht Verzweiflung',
          remediesHint: '(Aconitum, Arsenicum album)'
        },
        {
          id: 'head-p4-opt3',
          label: {
            de: 'Weinerlich, verlangt Trost & Zuneigung, wechselhafte empfindsame Stimmung',
            en: 'Weepy, craves consolation & company, gentle changeable mood',
            es: 'Lloroso, busca consuelo y compañía, humor suave y cambiante',
            fr: 'Pleurard, cherche réconfort et compagnie, humeur douce et changeante',
            it: 'Piagnucoloso, cerca consolazione e affetto, umore mutevole',
            el: 'Κλαψιάρικη διάθεση, επιζητά παρηγοριά, ευμετάβλητη ψυχολογία',
            ru: 'Плаксив, ищет утешения и сочувствия, мягкое переменчивое настроение'
          },
          pillarValue: 'weinerlich Trost verlangt Zuwendung sanft wechselhaft',
          remediesHint: '(Pulsatilla, Phosphorus)'
        },
        {
          id: 'head-p4-opt4',
          label: {
            de: 'Völlig apathisch, schwerfällig, schläfrig, will nur ungestört liegen',
            en: 'Completely apathetic, drowsy, dull, wants to lie quietly undisturbed',
            es: 'Apático, embotado, somnoliento, sólo quiere descansar sin molestias',
            fr: 'Totalement apathique, engourdi, somnolent, veut rester couché sans être dérangé',
            it: 'Completamente apatico, intontito, sonnolento, desidera solo riposare indisturbato',
            el: 'Εντελώς απαθής, υπνηλία, βαρύτητα, επιθυμεί μόνο ησυχία στο κρεβάτι',
            ru: 'Полная апатия, отупение, сонливость, хочет только лежать без движения'
          },
          pillarValue: 'apathisch benommen schläfrig schwer will Ruhe',
          remediesHint: '(Gelsemium, Bryonia, Opium)'
        },
        {
          id: 'head-p4-opt5',
          label: {
            de: 'Verschlossen, zieht sich zurück, Trost verschlimmert die Wut & Kränkung',
            en: 'Closed, withdrawn, consolation aggravates anger & grief',
            es: 'Reservado, retraído, el consuelo agrava la indignación y el rencor',
            fr: 'Fermé, replié sur soi, la consolation aggrave la colère et la peine',
            it: 'Chiuso, introverso, la consolazione peggiora la rabbia o il dolore',
            el: 'Κλειστός, αποτραβηγμένος, η παρηγοριά επιδεινώνει τον θυμό και τη θλίψη',
            ru: 'Замкнут, уходит в себя, утешение лишь усиливает раздражение и обиду'
          },
          pillarValue: 'verschlossen zurückgezogen Trost verschlimmert Ärger Kränkung',
          remediesHint: '(Natrium muriaticum, Ignatia, Sepia)'
        }
      ]
    }
  },

  // 2. BAUCHSCHMERZEN / GASTROINTESTINAL
  {
    id: 'abdomen',
    keywords: ['bauch', 'magen', 'darm', 'abdomen', 'stomach', 'belly', 'ventre', 'kolik', 'colic', 'estomac', 'stomaco', 'κοιλιά', 'στομάχι', 'живот', 'желудок'],
    chiefComplaint: {
      de: 'Bauchschmerzen',
      en: 'Abdominal pain',
      es: 'Dolor abdominal',
      fr: 'Douleurs abdominales',
      it: 'Dolori addominali',
      el: 'Κοιλιακό άλγος',
      ru: 'Боль в животе'
    },
    pillar1: {
      pillarNumber: 1,
      pillarKey: 'locationAndSensation',
      title: {
        de: 'Säule 1: Lokalisierung & Schmerzart',
        en: 'Pillar 1: Location & Sensation',
        es: 'Pilar 1: Localización y Tipo de Dolor',
        fr: 'Pilier 1 : Localisation et Sensation',
        it: 'Pilastro 1: Localizzazione e Tipo di Dolore',
        el: 'Πυλώνας 1: Εντόπιση & Τύπος Πόνου',
        ru: 'Столп 1: Локализация и Характер Боли'
      },
      question: {
        de: 'Wo genau im Bauch sitzt der Schmerz und wie fühlt er sich an?',
        en: 'Where exactly in the abdomen is the pain and how does it feel?',
        es: '¿En qué zona del abdomen se sitúa el dolor y cómo se siente?',
        fr: 'Où se situe exactement la douleur abdominale et comment se manifeste-t-elle ?',
        it: 'Dove si localizza il dolore all\'addome e come si percepisce?',
        el: 'Πού ακριβώς στην κοιλιά εντοπίζεται ο πόνος και πώς εκδηλώνεται;',
        ru: 'Где именно в животе ощущается боль и каков её характер?'
      },
      options: [
        {
          id: 'abd-p1-opt1',
          label: {
            de: 'Rechter Unterbauch (Ileozökalregion), heiß, klopfend, berührungsempfindlich',
            en: 'Right lower quadrant (ileocecal), hot, throbbing, tender to touch',
            es: 'Fosa ilíaca derecha, caliente, pulsátil, sensible al menor toque',
            fr: 'Fosse iliaque droite, chaud, battant, douloureux au moindre effleurement',
            it: 'Fossa iliaca destra, caldo, pulsante, sensibile al tocco',
            el: 'Δεξιός λαγόνιος βόθρος, θερμός, σφυγμικός, ευαίσθητος στην αφή',
            ru: 'Правая подвздошная область, горячая, пульсирующая, гиперчувствительная к прикосновению'
          },
          pillarValue: 'rechter Unterbauch Ileozökalregion heiß klopfend berührungsempfindlich',
          remediesHint: '(Belladonna, Bryonia)'
        },
        {
          id: 'abd-p1-opt2',
          label: {
            de: 'Nabelgegend / krampfartige Kolik, wie von Krallen zusammengezogen',
            en: 'Umbilical region / cramping colic, clawing constriction',
            es: 'Región periumbilical / cólico espasmódico, como desgarrado por garras',
            fr: 'Région ombilicale / colique spasmodique, comme broyé par des serres',
            it: 'Zona ombelicale / colica spastica, costrizione a morsa',
            el: 'Περιομφαλική χώρα / σπαστικός κολικός, αίσθημα αρπαγής από νύχια',
            ru: 'Околопупочная область / спастическая колика, ощущение сжимающих когтей'
          },
          pillarValue: 'Nabelgegend krampfartig Kolik Krallen zusammengezogen',
          remediesHint: '(Colocynthis, Magnesia phosphorica, Belladonna)'
        },
        {
          id: 'abd-p1-opt3',
          label: {
            de: 'Magen & Oberbauch, intensives Brennen wie glühende Kohlen',
            en: 'Stomach & epigastrium, intense burning like red-hot coals',
            es: 'Epigastrio y estómago, ardor abrasador como carbones encendidos',
            fr: 'Estomac & épigastre, brûlure cuisante comme des charbons ardents',
            it: 'Stomaco ed epigastrio, bruciore intenso come carboni ardenti',
            el: 'Στόμαχος & επιγάστριο, καυστικό άλγος σαν αναμμένα κάρβουνα',
            ru: 'Желудок и эпигастрий, жгучая боль как от раскаленных углей'
          },
          pillarValue: 'Magen Oberbauch brennend wie glühende Kohlen',
          remediesHint: '(Arsenicum album, Phosphorus)'
        },
        {
          id: 'abd-p1-opt4',
          label: {
            de: 'Unterbauch & Darm, dumpfer Druck mit starker Blähung & Völlegefühl',
            en: 'Lower abdomen, dull pressure with severe tympanitic distension',
            es: 'Vientre bajo, presión sorda con meteorismo y gran distensión',
            fr: 'Bas-ventre, pression sourde avec tympanisme et flatulences extrêmes',
            it: 'Basso ventre, pressione sorda con forte meteorismo e gonfiore',
            el: 'Κάτω κοιλία, αμβλύ βάρος με έντονο τυμπανισμό και φούσκωμα',
            ru: 'Низ живота, тупое давление с выраженным метеоризмом и вздутием'
          },
          pillarValue: 'Unterbauch Darm Druck Blähung Meteorismus Völle',
          remediesHint: '(Lycopodium, Carbo vegetabilis, Nux vomica)'
        }
      ]
    },
    pillar2: {
      pillarNumber: 2,
      pillarKey: 'modalities',
      title: {
        de: 'Säule 2: Modalitäten',
        en: 'Pillar 2: Modalities',
        es: 'Pilar 2: Modalidades',
        fr: 'Pilier 2 : Modalités',
        it: 'Pilastro 2: Modalità',
        el: 'Πυλώνας 2: Τροποποιητικοί Παράγοντες',
        ru: 'Столп 2: Модальности'
      },
      question: {
        de: 'Wodurch verändern sich die Bauchschmerzen (besser oder schlechter)?',
        en: 'What makes the abdominal pain better or worse?',
        es: '¿Qué alivia o empeora el dolor abdominal?',
        fr: 'Qu\'est-ce qui soulage ou aggrave les douleurs abdominales ?',
        it: 'Cosa migliora o peggiora il dolore addominale?',
        el: 'Τι βελτιώνει ή επιδεινώνει το κοιλιακό άλγος;',
        ru: 'Что облегчает или усиливает боль в животе?'
      },
      options: [
        {
          id: 'abd-p2-opt1',
          label: {
            de: '> Doppelkrümmen, starker Gegendruck, heiße Auflagen; < Kälte, Ausstrecken',
            en: '> Bending double, hard pressure, hot applications; < Cold, stretching out',
            es: '> Doblarse en dos, fuerte presión, calor local; < Frío, estirarse',
            fr: '> Plié en deux, forte pression, applications chaudes ; < Froid, extension',
            it: '> Piegarsi in due, forte pressione esterna, calore; < Freddo, distendersi',
            el: '> Δίπλωμα στα δύο, ισχυρή πίεση, ζεστά επιθέματα· < Κρύο, έκταση',
            ru: '> Сгибание пополам, сильное надавливание, сухое тепло; < Холод, выпрямление'
          },
          pillarValue: '> Doppelkrümmen starker Druck Wärme < Kälte Ausstrecken',
          remediesHint: '(Colocynthis, Magnesia phosphorica)'
        },
        {
          id: 'abd-p2-opt2',
          label: {
            de: '< Erschütterung, Gehen, geringste Berührung; > Absolutes Stillliegen auf dem Rücken',
            en: '< Jar, walking, slight touch; > Absolute rest lying on back',
            es: '< Sacudida, caminar, mínimo roce; > Reposo absoluto boca arriba',
            fr: '< Secousse, marche, moindre contact ; > Repos absolu couché sur le dos',
            it: '< Scosse, camminare, sfioramento; > Riposo assoluto supino',
            el: '< Κραδασμοί, βάδισμα, ελάχιστο άγγιγμα· > Απόλυτη ηρεμία ανάσκελα',
            ru: '< Сотрясение, ходьба, легчайшее прикосновение; > Полный покой на спине'
          },
          pillarValue: '< Erschütterung Gehen Berührung > Stillliegen Ruhe',
          remediesHint: '(Belladonna, Bryonia)'
        },
        {
          id: 'abd-p2-opt3',
          label: {
            de: '> Heiße Getränke, warme Umschläge; < Kalte Speisen, Kalttrinken, Mitternacht (1-3 Uhr)',
            en: '> Hot drinks, warm wraps; < Cold food/drinks, midnight (1-3 am)',
            es: '> Bebidas calientes, calor; < Comidas frías, agua fría, madrugada (1-3 h)',
            fr: '> Boissons chaudes, compresses chaudes ; < Aliments froids, nuit (1-3h)',
            it: '> Bevande calde, impacchi caldi; < Cibi freddi, notte (ore 1-3)',
            el: '> Ζεστά ροφήματα, ζεστά επιθέματα· < Κρύα τροφή, μεσάνυχτα (1-3 π.μ.)',
            ru: '> Горячее питье, тепло; < Холодная пища, холодная вода, ночь (1-3 ч)'
          },
          pillarValue: '> heiße Getränke Wärme < kalte Speisen Trinken Mitternacht',
          remediesHint: '(Arsenicum album, Lycopodium)'
        },
        {
          id: 'abd-p2-opt4',
          label: {
            de: '< Nach dem Essen, beengende Kleidung; > Nach Stuhlgang, kurzes Nickerchen',
            en: '< After eating, tight clothes; > After bowel movement, short nap',
            es: '< Después de comer, ropa ceñida; > Tras evacuar, siesta corta',
            fr: '< Après le repas, vêtements serrés ; > Après évacuation, courte sieste',
            it: '< Dopo mangiato, abiti stretti; > Dopo evacuazione, breve sonnellino',
            el: '< Μετά το φαγητό, στενά ρούχα· > Μετά την κένωση, σύντομος ύπνος',
            ru: '< После еды, тесная одежда; > После дефекации, короткий сон'
          },
          pillarValue: '< nach dem Essen enge Kleidung > nach Stuhlgang Schlaf',
          remediesHint: '(Nux vomica, Lycopodium)'
        }
      ]
    },
    pillar3: {
      pillarNumber: 3,
      pillarKey: 'concomitants',
      title: {
        de: 'Säule 3: Begleitsymptome',
        en: 'Pillar 3: Concomitants',
        es: 'Pilar 3: Síntomas Concomitantes',
        fr: 'Pilier 3 : Symptômes Concomitants',
        it: 'Pilastro 3: Sintomi Concomitanti',
        el: 'Πυλώνας 3: Συνοδά Συμπτώματα',
        ru: 'Столп 3: Сопутствующие Симптомы'
      },
      question: {
        de: 'Welche Begleitsymptome treten synchron zu den Bauchschmerzen auf?',
        en: 'Which physical symptoms occur concurrently with the belly pain?',
        es: '¿Qué síntomas físicos acompañan concurrentemente al dolor de vientre?',
        fr: 'Quels symptômes accompagnent simultanément les maux de ventre ?',
        it: 'Quali disturbi si presentano contemporaneamente al dolore?',
        el: 'Ποια συμπτώματα συνυπάρχουν ταυτόχρονα με τους πόνους στην κοιλιά;',
        ru: 'Какие симптомы сопровождают абдоминальные боли?'
      },
      options: [
        {
          id: 'abd-p3-opt1',
          label: {
            de: 'Vergeblicher Stuhldrang, ständiges erfolgloses Drängen auf Toilette',
            en: 'Frequent ineffectual urging for stool, constant straining',
            es: 'Tenesmo rectal ineficaz, urgencia continua sin éxito',
            fr: 'Ténesme rectal inefficace, besoins fréquents sans résultat',
            it: 'Tenesmo inefficace, stimolo continuo senza evacuazione completa',
            el: 'Ατελέσφορος τεινεσμός, συνεχής μάταιη τάση για αφόδευση',
            ru: 'Безрезультатные позывы на дефекацию, постоянные тенезмы'
          },
          pillarValue: 'vergeblicher Stuhldrang Tenesmus Drängen',
          remediesHint: '(Nux vomica, Mercurius solubilis)'
        },
        {
          id: 'abd-p3-opt2',
          label: {
            de: 'Wässriger, brennender Durchfall mit Schwäche & Kältegefühl',
            en: 'Watery burning diarrhea with extreme prostration & chilliness',
            es: 'Diarrea acuosa y abrasadora con postración y escalofríos',
            fr: 'Diarrhée aqueuse brûlante avec grand épuisement et frilosité',
            it: 'Diarrea acquosa bruciante con prostrazione e sensazione di freddo',
            el: 'Υδαρής, καυστική διάρροια με έντονη καταβολή και κρυάδες',
            ru: 'Водянистый жгучий понос с резкой слабостью и зябкостью'
          },
          pillarValue: 'wässriger brennender Durchfall Schwäche Kälte',
          remediesHint: '(Arsenicum album, Veratrum album)'
        },
        {
          id: 'abd-p3-opt3',
          label: {
            de: 'Meteorismus, lautes Gluckern, Völlegefühl schon nach wenigen Bissen',
            en: 'Flatulence, loud rumbling, fullness after only a few mouthfuls',
            es: 'Meteorismo, borborigmos sonoros, saciedad con pocos bocados',
            fr: 'Météorisme, gargouillements bruyants, satiété après quelques bouchées',
            it: 'Meteorismo, gorgoglii udibili, pienezza dopo pochi bocconi',
            el: 'Τυμπανισμός, έντονοι γουργουρητοί, κορεσμός μετά από λίγες μπουκιές',
            ru: 'Метеоризм, громкое урчание, чувство сытости после пары кусочков'
          },
          pillarValue: 'Meteorismus lautes Gluckern Völlegefühl nach wenigen Bissen',
          remediesHint: '(Lycopodium, Carbo vegetabilis, Nux moschata)'
        },
        {
          id: 'abd-p3-opt4',
          label: {
            de: 'Kalter Schweiß auf der Stirn, Kollapsgefühl, Erbrechen',
            en: 'Cold sweat on forehead, collapse state, vomiting',
            es: 'Sudor frío en la frente, colapso inminente, vómitos',
            fr: 'Sueurs froides sur le front, sensation de collapsus, vomissements',
            it: 'Sudore freddo sulla fronte, senso di collasso, vomito',
            el: 'Κρύος ιδρώτας στο μέτωπο, τάση λιποθυμίας, έμετος',
            ru: 'Холодный пот на лбу, чувство коллапса, рвота'
          },
          pillarValue: 'kalter Schweiß Stirn Kollaps Erbrechen',
          remediesHint: '(Veratrum album, Camphora)'
        }
      ]
    },
    pillar4: {
      pillarNumber: 4,
      pillarKey: 'mind',
      title: {
        de: 'Säule 4: Gemüt & Geist',
        en: 'Pillar 4: Mind & Emotional State',
        es: 'Pilar 4: Mente y Estado Emocional',
        fr: 'Pilier 4 : Esprit et État Émotionnel',
        it: 'Pilastro 4: Mente e Stato Emotivo',
        el: 'Πυλώνας 4: Ψυχική & Νοητική Διάθεση',
        ru: 'Столп 4: Психика и Настроение'
      },
      question: {
        de: 'Wie reagiert der Patient emotional während der Kolik oder Schmerzen?',
        en: 'How does the patient react emotionally during the colic or pain?',
        es: '¿Cómo reacciona anímicamente el paciente ante el dolor?',
        fr: 'Comment réagit le patient sur le plan émotionnel pendant la crise ?',
        it: 'Qual è la reazione emotiva durante la colica o il dolore?',
        el: 'Πώς αντιδρά ψυχολογικά ο ασθενής κατά τη διάρκεια του κολικού;',
        ru: 'Какова эмоциональная реакция во время боли или колики?'
      },
      options: [
        {
          id: 'abd-p4-opt1',
          label: {
            de: 'Wütend, ungeduldig, empört; Schmerzen ausgelöst nach Zorn / Entrüstung',
            en: 'Furious, impatient, indignant; colic caused by anger or indignation',
            es: 'Furioso, impaciente; cólico desencadenado por ira o indignación',
            fr: 'Furieux, impatient ; colique déclenchée par la colère ou l\'indignation',
            it: 'Furioso, spazientito; dolori scatenati da collera o indignazione',
            el: 'Εξοργισμένος, ανυπόμονος· πόνος που προκλήθηκε από θυμό ή αγανάκτηση',
            ru: 'Ярость, нетерпение; боли спровоцированы гневом или возмущением'
          },
          pillarValue: 'wütend ungeduldig nach Zorn Entrüstung',
          remediesHint: '(Colocynthis, Chamomilla, Staphisagria)'
        },
        {
          id: 'abd-p4-opt2',
          label: {
            de: 'Todesangst, quälende Unruhe, kann nicht still im Bett bleiben',
            en: 'Agonizing anxiety, fear of death, cannot keep still in bed',
            es: 'Angustia mortal, inquietud torturante, incapaz de estar quieto',
            fr: 'Angoisse mortelle, agitation perpétuelle, ne peut rester en place',
            it: 'Ansia estrema, paura della morte, irrequietezza continua',
            el: 'Αγωνία θανάτου, αφόρητη ανησυχία, αδυνατεί να μείνει ακίνητος',
            ru: 'Страх смерти, мучительное беспокойство, мечется в постели'
          },
          pillarValue: 'Todesangst Unruhe ruhelos Verzweiflung',
          remediesHint: '(Arsenicum album, Aconitum)'
        },
        {
          id: 'abd-p4-opt3',
          label: {
            de: 'Reizbar, empfindlich gegen Geräusche und Störung, will allein sein',
            en: 'Irritable, oversensitive to noise and interruption, desires solitude',
            es: 'Irritable, hipersensible a ruidos y molestias, prefiere soledad',
            fr: 'Irritable, hypersensible aux bruits et dérangements, veut être seul',
            it: 'Irritabile, ipersensibile a stimoli e rumori, vuole stare solo',
            el: 'Ευερέθιστος, υπερευαίσθητος στους ήχους, επιθυμεί απομόνωση',
            ru: 'Раздражителен, гиперчувствителен к шуму, хочет остаться один'
          },
          pillarValue: 'reizbar empfindlich Geräusche will allein sein',
          remediesHint: '(Nux vomica, Bryonia)'
        }
      ]
    }
  },

  // 3. HUSTEN / ATEMWEGE
  {
    id: 'cough',
    keywords: ['husten', 'bronchien', 'lunge', 'hals', 'cough', 'toux', 'tosse', 'tos', 'βήχας', 'кашель', 'бронхи'],
    chiefComplaint: {
      de: 'Husten & Atemwege',
      en: 'Cough & Respiratory',
      es: 'Tos y Vías Respiratorias',
      fr: 'Toux et Voies Respiratoires',
      it: 'Tosse e Vie Respiratorie',
      el: 'Βήχας & Αναπνευστικό',
      ru: 'Кашель и Дыхательные Пути'
    },
    pillar1: {
      pillarNumber: 1,
      pillarKey: 'locationAndSensation',
      title: {
        de: 'Säule 1: Lokalisierung & Schmerzart',
        en: 'Pillar 1: Location & Sensation',
        es: 'Pilar 1: Localización y Tipo de Dolor',
        fr: 'Pilier 1 : Localisation et Sensation',
        it: 'Pilastro 1: Localizzazione e Tipo di Dolore',
        el: 'Πυλώνας 1: Εντόπιση & Τύπος Πόνου',
        ru: 'Столп 1: Локализация и Характер Боли'
      },
      question: {
        de: 'Wo sitzt der Hustenreiz und wie klingt / fühlt sich der Husten an?',
        en: 'Where is the tickling located and how does the cough sound / feel?',
        es: '¿Dónde se origina el cosquilleo y cómo suena / se siente la tos?',
        fr: 'Où se situe l\'irritation et quelle est la tonalité / sensation de la toux ?',
        it: 'Dove si origina lo stimolo e come risuona la tosse?',
        el: 'Πού εντοπίζεται ο ερεθισμός και πώς ακούγεται / εκδηλώνεται ο βήχας;',
        ru: 'Где ощущается щекотание и каков звук / характер кашля?'
      },
      options: [
        {
          id: 'cough-p1-opt1',
          label: {
            de: 'Trocken, bellend, krampfartig wie eine Säge durch Holz; Kehlkopf brennend',
            en: 'Dry, barking, croupy like a saw through pine; larynx burning',
            es: 'Seca, perruna, crupal como sierra en madera; laringe ardiente',
            fr: 'Sèche, aboyante, rauque comme une scie dans le bois ; larynx brûlant',
            it: 'Secca, abbaiante, metallica come una sega nel legno; laringe bruciante',
            el: 'Ξηρός, υλακτικός, λαρυγγικός σαν πριόνι σε ξύλο· καυστικός λάρυγγας',
            ru: 'Сухой, лающий, хриплый как пила по дереву; жжение в гортани'
          },
          pillarValue: 'trocken bellend krampfartig wie Säge Kehlkopf brennend',
          remediesHint: '(Spongia tosta, Aconitum, Hepar sulphuris)'
        },
        {
          id: 'cough-p1-opt2',
          label: {
            de: 'Brustschmerz stechend, muss die Brust mit beiden Händen festhalten',
            en: 'Stitching chest pain, must hold chest firmly with both hands',
            es: 'Puntadas en el pecho, debe sujetarse el tórax con ambas manos',
            fr: 'Point de côté piquant dans la poitrine, doit maintenir son thorax des deux mains',
            it: 'Dolore toracico pungente, deve trattenere il petto con entrambe le mani',
            el: 'Σουβλιστικός πόνος στο θώρακα, κρατά το στήθος και με τα δύο χέρια',
            ru: 'Колющая боль в груди, вынужден прижимать грудную клетку обеими руками'
          },
          pillarValue: 'Brustschmerz stechend Brust festhalten Hände',
          remediesHint: '(Bryonia, Drosera)'
        },
        {
          id: 'cough-p1-opt3',
          label: {
            de: 'Rasselnder Schleim in den Bronchien, kann aber kaum abhusten (Erschöpfung)',
            en: 'Loose rattling mucus in bronchi, too weak to expectorate',
            es: 'Estertores bronquiales abundantes pero incapaz de expectorar por debilidad',
            fr: 'Râles muqueux bronchiques intenses, trop faible pour expectorer',
            it: 'Muco rantolante nei bronchi, troppo debole per espettorare',
            el: 'Βρογχικοί ρόγχοι βλέννας, αλλά αδυναμία αποβολής λόγω εξάντλησης',
            ru: 'Клокочущая мокрота в бронхах, слишком слаб чтобы откашлять'
          },
          pillarValue: 'rasselnder Schleim Bronchien kann nicht abhusten Schwäche',
          remediesHint: '(Antimonium tartaricum, Ipecacuanha)'
        },
        {
          id: 'cough-p1-opt4',
          label: {
            de: 'Kitzelhusten in der Drosselgrube, trocken, hart, anhaltend erschöpfend',
            en: 'Tickling in throat-pit, dry, teasing, relentlessly exhausting',
            es: 'Cosquilleo en el hueco supraesternal, seco, incesante y agotador',
            fr: 'Chatouillement dans la fossette sus-sternale, sec, harassant',
            it: 'Solletico alla fossetta giugulare, secca, insistente e spossante',
            el: 'Γαργαλητό στη σφαγή, ξηρός, επίμονος και εξαντλητικός',
            ru: 'Щекотание в яремной ямке, сухой, изнуряющий непрерывный кашель'
          },
          pillarValue: 'Kitzelhusten Drosselgrube trocken hart erschöpfend',
          remediesHint: '(Rumex crispus, Phosphorus, Drosera)'
        }
      ]
    },
    pillar2: {
      pillarNumber: 2,
      pillarKey: 'modalities',
      title: {
        de: 'Säule 2: Modalitäten',
        en: 'Pillar 2: Modalities',
        es: 'Pilar 2: Modalidades',
        fr: 'Pilier 2 : Modalités',
        it: 'Pilastro 2: Modalità',
        el: 'Πυλώνας 2: Τροποποιητικοί Παράγοντες',
        ru: 'Столп 2: Модальности'
      },
      question: {
        de: 'Wodurch wird der Husten ausgelöst oder gelindert?',
        en: 'What triggers or relieves the cough?',
        es: '¿Qué desencadena o alivia los accesos de tos?',
        fr: 'Qu\'est-ce qui déclenche ou soulage les quintes de toux ?',
        it: 'Cosa scatena o allevia gli accessi di tosse?',
        el: 'Τι πυροδοτεί ή ανακουφίζει τις κρίσεις βήχα;',
        ru: 'Что провоцирует или облегчает приступы кашля?'
      },
      options: [
        {
          id: 'cough-p2-opt1',
          label: {
            de: '< Einatmen kalter Luft, Entblößen; > Warme Getränke, warmes Zimmer',
            en: '< Inhaling cold air, uncovering; > Warm drinks, warm room',
            es: '< Respirar aire frío, destaparse; > Bebidas calientes, cuarto cálido',
            fr: '< Inspirer de l\'air froid, se découvrir ; > Boissons chaudes, pièce tiède',
            it: '< Ispirare aria fredda, scoprirsi; > Bevande calde, ambiente caldo',
            el: '< Εισπνοή κρύου αέρα, ξεσκέπασμα· > Ζεστά ροφήματα, ζεστός χώρος',
            ru: '< Вдыхание холодного воздуха, раскрывание; > Теплое питье, теплая комната'
          },
          pillarValue: '< kalte Luft einatmen Entblößen > warme Getränke warmes Zimmer',
          remediesHint: '(Hepar sulphuris, Rumex crispus, Spongia tosta)'
        },
        {
          id: 'cough-p2-opt2',
          label: {
            de: '< Sobald der Kopf das Kissen berührt / Hinlegen, nach Mitternacht',
            en: '< As soon as head touches pillow / lying down, after midnight',
            es: '< En cuanto la cabeza toca la almohada / acostarse, pasada la medianoche',
            fr: '< Dès que la tête touche l\'oreiller / couché, après minuit',
            it: '< Appena la testa tocca il cuscino / coricandosi, dopo mezzanotte',
            el: '< Μόλις το κεφάλι αγγίξει το μαξιλάρι / κατάκλιση, μετά τα μεσάνυχτα',
            ru: '< Как только голова касается подушки / лежа, после полуночи'
          },
          pillarValue: '< Hinlegen Kopf auf Kissen nach Mitternacht',
          remediesHint: '(Drosera, Hyoscyamus, Conium)'
        },
        {
          id: 'cough-p2-opt3',
          label: {
            de: '< Betreten eines warmen Raumes aus der Kälte, tiefes Atmen; > Ruhiges Sitzen',
            en: '< Entering warm room from cold air, deep breath; > Sitting quietly',
            es: '< Pasar del frío a un cuarto cálido, respirar hondo; > Reposo sentado',
            fr: '< Passer du froid dans une pièce chauffée, inspiration profonde ; > Assis calme',
            it: '< Entrare al caldo dal freddo, respirare a fondo; > Seduti tranquilli',
            el: '< Μετάβαση από το κρύο σε ζεστό δωμάτιο, βαθιά ανάσα· > Ήρεμη καθιστή στάση',
            ru: '< Вход с холода в теплое помещение, глубокий вдох; > Спокойно сидя'
          },
          pillarValue: '< warmer Raum aus Kälte tiefes Atmen > Ruhe Sitzen',
          remediesHint: '(Bryonia, Phosphorus)'
        }
      ]
    },
    pillar3: {
      pillarNumber: 3,
      pillarKey: 'concomitants',
      title: {
        de: 'Säule 3: Begleitsymptome',
        en: 'Pillar 3: Concomitants',
        es: 'Pilar 3: Síntomas Concomitantes',
        fr: 'Pilier 3 : Symptômes Concomitants',
        it: 'Pilastro 3: Sintomi Concomitanti',
        el: 'Πυλώνας 3: Συνοδά Συμπτώματα',
        ru: 'Столп 3: Сопутствующие Симптомы'
      },
      question: {
        de: 'Welche Begleitsymptome treten synchron beim Husten auf?',
        en: 'Which physical concomitants occur along with the cough?',
        es: '¿Qué síntomas concomitantes acompañan al toser?',
        fr: 'Quels symptômes concomitants se manifestent lors des quintes ?',
        it: 'Quali sintomi concomitanti si manifestano con la tosse?',
        el: 'Ποια συνοδά συμπτώματα εκδηλώνονται κατά το βήχα;',
        ru: 'Какие сопутствующие симптомы возникают при кашле?'
      },
      options: [
        {
          id: 'cough-p3-opt1',
          label: {
            de: 'Hustenanfall führt unweigerlich zu Würgen und Erbrechen von Schleim',
            en: 'Coughing paroxysm invariably leads to gagging and vomiting of phlegm',
            es: 'El acceso de tos provoca arcadas y vómitos de flemas',
            fr: 'La quinte provoque inévitablement des nausées et vomissements de glaires',
            it: 'L\'accesso porta immancabilmente a conati e vomito di muco',
            el: 'Η κρίση βήχα οδηγεί αναπόφευκτα σε τάση εμέτου και αποβολή βλέννας',
            ru: 'Приступ кашля неизбежно заканчивается позывами на рвоту слизью'
          },
          pillarValue: 'Würgen Erbrechen Schleim bei Husten',
          remediesHint: '(Ipecacuanha, Drosera)'
        },
        {
          id: 'cough-p3-opt2',
          label: {
            de: 'Unwillkürlicher Harnabgang beim Hustenstoß',
            en: 'Involuntary urination with cough',
            es: 'Pérdida involuntaria de orina al toser',
            fr: 'Fuite urinaire involontaire lors des secousses de toux',
            it: 'Perdita involontaria di urina col colpo di tosse',
            el: 'Ακούσια απώλεια ούρων με το βήχα',
            ru: 'Непроизвольное мочеиспускание при кашлевом толчке'
          },
          pillarValue: 'unwillkürlicher Harnabgang Urin Hustenstoß',
          remediesHint: '(Causticum, Pulsatilla, Natrium muriaticum)'
        },
        {
          id: 'cough-p3-opt3',
          label: {
            de: 'Große Kälteschauer, Heiserkeit, Schweiß ohne Erleichterung',
            en: 'Severe chills, hoarseness, profuse sweat without relief',
            es: 'Escalofríos intensos, ronquera, sudor que no alivia',
            fr: 'Frissons marqués, enrouement, sueurs sans soulagement',
            it: 'Brividi intensi, raucedine, sudorazione senza sollievo',
            el: 'Έντονα ρίγη, βραχνάδα, ιδρώτας χωρίς ανακούφιση',
            ru: 'Сильный озноб, охриплость, пот не приносящий облегчения'
          },
          pillarValue: 'Kälteschauer Heiserkeit Schweiß ohne Linderung',
          remediesHint: '(Hepar sulphuris, Mercurius)'
        }
      ]
    },
    pillar4: {
      pillarNumber: 4,
      pillarKey: 'mind',
      title: {
        de: 'Säule 4: Gemüt & Geist',
        en: 'Pillar 4: Mind & Emotional State',
        es: 'Pilar 4: Mente y Estado Emocional',
        fr: 'Pilier 4 : Esprit et État Émotionnel',
        it: 'Pilastro 4: Mente e Stato Emotivo',
        el: 'Πυλώνας 4: Ψυχική & Νοητική Διάθεση',
        ru: 'Столп 4: Психика и Настроение'
      },
      question: {
        de: 'Wie ist die seelische Verfassung während der Erkrankung?',
        en: 'What is the emotional disposition during the illness?',
        es: '¿Cuál es la disposición anímica durante la afección respiratoria?',
        fr: 'Quelle est la disposition d\'esprit pendant l\'affection ?',
        it: 'Qual è lo stato d\'animo durante la malattia?',
        el: 'Ποια είναι η ψυχική κατάσταση κατά τη διάρκεια της ασθένειας;',
        ru: 'Каково душевное состояние во время болезни?'
      },
      options: [
        {
          id: 'cough-p4-opt1',
          label: {
            de: 'Äußerst ängstlich bei Atemnot, Panik vor dem Ersticken in der Nacht',
            en: 'Severe anxiety with dyspnea, panic of suffocating at night',
            es: 'Ansiedad intensa con disnea, pánico a asfixiarse de noche',
            fr: 'Anxiété majeure avec dyspnée, panique d\'étouffer la nuit',
            it: 'Ansia marcata con dispnea, panico di soffocare di notte',
            el: 'Έντονο άγχος με δύσπνοια, πανικός ασφυξίας τη νύχτα',
            ru: 'Сильная тревога при одышке, панический страх удушья по ночам'
          },
          pillarValue: 'Atemnot Erstickungsangst Panik nachts',
          remediesHint: '(Aconitum, Spongia tosta, Arsenicum album)'
        },
        {
          id: 'cough-p4-opt2',
          label: {
            de: 'Verlangt Zuwendung, weint beim Husten, will getragen werden (Kinder)',
            en: 'Wants comfort, weeps when coughing, must be carried (children)',
            es: 'Pide consuelo, llora al toser, pide que lo alcen en brazos (niños)',
            fr: 'Demande du réconfort, pleure en toussant, veut être porté (enfants)',
            it: 'Chiede conforto, piange tossendo, vuole essere preso in braccio (bambini)',
            el: 'Ζητά παρηγοριά, κλαίει με το βήχα, θέλει αγκαλιά (παιδιά)',
            ru: 'Требует ласки, плачет при кашле, хочет быть на руках (дети)'
          },
          pillarValue: 'weint beim Husten verlangt getragen zu werden Zuwendung',
          remediesHint: '(Chamomilla, Pulsatilla)'
        }
      ]
    }
  }
];

/**
 * Finds the matching guided anamnesis topic for a free-text chief complaint
 */
export function findGuidedAnamnesisTopic(query: string): GuidedAnamnesisTopic | null {
  if (!query || query.trim().length === 0) return null;
  const q = query.toLowerCase();
  
  for (const topic of GUIDED_ANAMNESIS_TOPICS) {
    if (topic.keywords.some(kw => q.includes(kw) || kw.includes(q))) {
      return topic;
    }
  }
  return null;
}
