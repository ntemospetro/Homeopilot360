import { LanguageCode } from '../types';

export const OPTION_LABELS_I18N: Record<string, Record<LanguageCode, string>> = {
  // Pain / Laterality
  pn_stabbing: {
    de: 'Stechend, nadelspitz, splitterartig, jede Erschütterung schmerzt',
    en: 'Stitching, sharp, needle-like or splinter-like pain; worse from slightest jar',
    es: 'Punzante, agudo, como astilla o agujas; peor con la menor sacudida',
    fr: 'Piquant, aigu, comme une écharde; aggravé par la moindre secousse',
    it: 'Pungente, acuto, come spine; peggiorato dalla minima scossa',
    el: 'Νυγμώδης, οξύς, σαν βελόνες ή αγκίδα, κάθε κραδασμός πονάει',
    ru: 'Колющая, острая боль, как от занозы; хуже от малейшего сотрясения'
  },
  pn_burning: {
    de: 'Brennend wie heißes Wasser oder glühende Kohlen',
    en: 'Burning like boiling water or glowing coals',
    es: 'Ardiente como agua hirviendo o carbones al rojo vivo',
    fr: 'Brûlant comme de l’eau bouillante ou des braises ardentes',
    it: 'Bruciante come acqua bollente o carboni ardenti',
    el: 'Καυστικός, σαν βραστό νερό ή αναμμένα κάρβουνα',
    ru: 'Жгучая боль, как от кипятка или раскаленных углей'
  },
  pn_cramping: {
    de: 'Krampfartig, schneidend, Zusammenkrümmen bringt Linderung',
    en: 'Cramping, cutting pain; doubling up gives relief',
    es: 'Espasmódico, cortante; doblarse en dos alivia',
    fr: 'Crampoïde, coupant; se plier en deux soulage',
    it: 'Crampiforme, tagliente; piegarsi in due dà sollievo',
    el: 'Σπασμωδικός, διαξιφιστικός, το δίπλωμα στα δύο φέρνει ανακούφιση',
    ru: 'Схваткообразная, режущая боль; сгибание пополам приносит облегчение'
  },
  pn_throbbing: {
    de: 'Pochend, pulsierend, hämmernd, Gesicht heiß/rot',
    en: 'Throbbing, pulsating, hammering; face hot and flushed',
    es: 'Pulsátil, martilleante; cara caliente y enrojecida',
    fr: 'Battant, pulsatile, martelant; visage chaud et rouge',
    it: 'Pulsante, martellante; viso caldo e arrossato',
    el: 'Σφυγμικός, παλλόμενος, σφυροκόπημα, πρόσωπο θερμό/ερυθρό',
    ru: 'Пульсирующая, бьющая боль; лицо горячее и красное'
  },
  pn_tearing: {
    de: 'Reißend, ziehend, schmerzhafte Unruhe, muss sich bewegen',
    en: 'Tearing, drawing pain; painful restlessness, driven to move',
    es: 'Desgarrante, tirante; inquietud dolorosa, necesita moverse',
    fr: 'Déchirant, tiraillant; agitation douloureuse, besoin de bouger',
    it: 'Lacerante, traente; irrequietezza dolorosa, bisogno di muoversi',
    el: 'Διαρρηκτικός, διατατικός, επώδυνη ανησυχία, ανάγκη συνεχούς κίνησης',
    ru: 'Рвущая, тянущая боль; двигательное беспокойство, вынужден двигаться'
  },
  lat_left: {
    de: 'Ausschließlich oder vorwiegend linksseitig beginnend',
    en: 'Exclusively or predominantly left-sided onset',
    es: 'Inicio exclusivo o predominantemente del lado izquierdo',
    fr: 'Début exclusivement ou principalement du côté gauche',
    it: 'Inizio esclusivamente o prevalentemente sul lato sinistro',
    el: 'Αποκλειστικά ή κυρίως αριστερόπλευρη έναρξη',
    ru: 'Исключительно или преимущественно левосторонняя локализация'
  },
  lat_right: {
    de: 'Ausschließlich oder vorwiegend rechtsseitig beginnend',
    en: 'Exclusively or predominantly right-sided onset',
    es: 'Inicio exclusivo o predominantemente del lado derecho',
    fr: 'Début exclusivement ou principalement du côté droit',
    it: 'Inizio esclusivamente o prevalentemente sul lato destro',
    el: 'Αποκλειστικά ή κυρίως δεξιόπλευρη έναρξη',
    ru: 'Исключительно или преимущественно правосторонняя локализация'
  },
  lat_wandering: {
    de: 'Wandernd von Gelenk zu Gelenk bzw. wechselnde Schmerzorte',
    en: 'Wandering from joint to joint or rapidly shifting locations',
    es: 'Errante de articulación en articulación o localizaciones cambiantes',
    fr: 'Erratique d’articulation en articulation ou changeant vite de siège',
    it: 'Vagante da un’articolazione all’altra o sedi mutevoli',
    el: 'Πλανώμενος από άρθρωση σε άρθρωση ή ταχέως μεταβαλλόμενος τόπος πόνου',
    ru: 'Блуждающая боль от сустава к суставу, быстро меняющая локализацию'
  },
  lat_radiating: {
    de: 'Kreuzweise oder blitzartig in andere Körperregionen ausstrahlend',
    en: 'Radiating crosswise or lightning-like into other regions',
    es: 'Irradiación cruzada o en forma de relámpago hacia otras regiones',
    fr: 'Irradiation croisée ou fulgurante vers d’autres régions',
    it: 'Irradiazione a croce o a lampo verso altre parti del corpo',
    el: 'Χιαστί ή αστραπιαία αντανάκλαση σε άλλες σωματικές περιοχές',
    ru: 'Иррадиирующая крест-накрест или молниеносно в другие части тела'
  },
  mod_press_bend: {
    de: 'Besser durch festen Gegendruck oder Zusammenkrümmen',
    en: 'Better from firm external pressure or bending double',
    es: 'Mejora con presión firme o doblándose en dos',
    fr: 'Amélioration par forte pression ou en se pliant en deux',
    it: 'Migliora con forte pressione o piegandosi in due',
    el: 'Καλύτερα με σταθερή εξωτερική πίεση ή δίπλωμα στα δύο',
    ru: 'Лучше от сильного давления или сгибания пополам'
  },
  mod_warmth_wrap: {
    de: 'Besser durch lokale Wärme, heiße Umschläge und Einhüllen',
    en: 'Better from heat, warm wraps and hot drinks',
    es: 'Mejora con calor local, compresas calientes y abrigo',
    fr: 'Amélioration par chaleur locale, compresses chaudes et emmaillotage',
    it: 'Migliora con calore locale, impacchi caldi e coperte',
    el: 'Καλύτερα με τοπική ζέστη, ζεστά επιθέματα και καλό τύλιγμα',
    ru: 'Лучше от сухого тепла, горячих компрессов и укутывания'
  },
  mod_cold_ice: {
    de: 'Besser durch eiskaltes Wasser, Eispackungen oder kühle Luft',
    en: 'Better from ice-cold water, cold compresses or cool open air',
    es: 'Mejora con agua helada, compresas frías o aire fresco',
    fr: 'Amélioration par eau glacée, poches de glace ou air frais',
    it: 'Migliora con acqua gelida, ghiaccio o aria fresca',
    el: 'Καλύτερα με παγωμένο νερό, πάγο ή δροσερό φρέσκο αέρα',
    ru: 'Лучше от ледяной воды, льда или прохладного свежего воздуха'
  },
  mod_absolute_rest: {
    de: 'Schlimmer bei geringster Bewegung (braucht absolute Ruhe)',
    en: 'Worse from the slightest movement (craves absolute stillness)',
    es: 'Peor con el más mínimo movimiento (necesita reposo absoluto)',
    fr: 'Pire au moindre mouvement (besoin d’un repos absolu)',
    it: 'Peggiora al minimo movimento (necessita di riposo assoluto)',
    el: 'Χειρότερα με την παραμικρή κίνηση (ανάγκη για απόλυτη ακινησία)',
    ru: 'Хуже от малейшего движения (требуется абсолютный покой)'
  },
  mod_continued_motion: {
    de: 'Besser durch fortgesetzte Bewegung (erste Bewegung schmerzt)',
    en: 'Better from continued motion (painful on first moving)',
    es: 'Mejora con el movimiento continuo (el primer movimiento duele)',
    fr: 'Amélioration par le mouvement continu (le premier mouvement est douloureux)',
    it: 'Migliora con il movimento continuato (il primo movimento fa male)',
    el: 'Καλύτερα με συνεχή κίνηση (επώδυνη η πρώτη κίνηση)',
    ru: 'Лучше от продолжительного движения (первое движение болезненно)'
  },

  // Gastrointestinal
  gi_colic_cramp: {
    de: 'Krampfartige, schneidende Koliken, muss sich vor Schmerz krümmen',
    en: 'Cramping, cutting colic; compelled to double up with pain',
    es: 'Cólicos espasmódicos y cortantes; obligado a doblarse por el dolor',
    fr: 'Coliques spasmodiques et coupantes; obligé de se plier en deux de douleur',
    it: 'Coliche crampiformi e taglienti; costretto a piegarsi in due dal dolore',
    el: 'Σπασμωδικοί, κοφτοί κολικοί, αναγκάζεται να διπλωθεί στα δύο από τον πόνο',
    ru: 'Схваткообразные режущие колики, вынужден сгибаться пополам от боли'
  },
  gi_burning_vomit: {
    de: 'Brennender Magenschmerz mit Erbrechen und brennendem Durchfall',
    en: 'Burning gastric pain with vomiting and burning diarrhoea',
    es: 'Dolor gástrico ardiente con vómitos y diarrea quemante',
    fr: 'Douleur gastrique brûlante avec vomissements et diarrhée brûlante',
    it: 'Dolore gastrico bruciante con vomito e diarrea bruciante',
    el: 'Καυστικός πόνος στο στομάχι με έμετο και καυστική διάρροια',
    ru: 'Жгучая боль в желудке со рвотой и жгучей диареей'
  },
  gi_bloat_gas: {
    de: 'Starke Blähungen, Völlegefühl schon nach wenigen Bissen',
    en: 'Severe abdominal bloating; fullness after only a few mouthfuls',
    es: 'Distensión abdominal intensa; plenitud tras pocos bocados',
    fr: 'Ballonnements sévères; réplétion dès les premières bouchées',
    it: 'Forte meteorismo addominale; sazietà precoce dopo pochi bocconi',
    el: 'Έντονος τυμπανισμός, αίσθημα πληρότητας μόλις μετά από λίγες μπουκιές',
    ru: 'Сильное вздутие живота, чувство переполнения после нескольких кусочков'
  },
  gi_constant_nausea: {
    de: 'Ständige quälende Übelkeit, die durch Erbrechen nicht gelindert wird',
    en: 'Persistent, distressing nausea unrelieved by vomiting',
    es: 'Náuseas constantes e intensas no aliviadas por el vómito',
    fr: 'Nausées tenaces et pénibles non soulagées par les vomissements',
    it: 'Nausea costante e tormentosa non alleviata dal vomito',
    el: 'Συνεχής βασανιστική ναυτία που δεν ανακουφίζεται από τον έμετο',
    ru: 'Постоянная мучительная тошнота, не проходящая после рвоты'
  },
  gi_food_poison: {
    de: 'Verdorbene Nahrung, Fleisch, Fisch oder Magen-Darm-Infekt',
    en: 'Spoiled food, meat, fish or gastrointestinal infection',
    es: 'Comida en mal estado, carne, pescado o infección gastrointestinal',
    fr: 'Aliments avariés, viande, poisson ou gastro-entérite',
    it: 'Cibo avariato, carne, pesce o infezione gastrointestinale',
    el: 'Αλλοιωμένη τροφή, κρέας, ψάρι ή γαστρεντερίτιδα',
    ru: 'Недоброкачественная пища, мясо, рыба или кишечная инфекция'
  },
  gi_fatty_food: {
    de: 'Fettes, schweres Essen, Torten, Gebäck oder Eis',
    en: 'Rich, fatty food, pastry, cakes or ice cream',
    es: 'Comidas grasas, pesadas, pasteles, repostería o helados',
    fr: 'Aliments gras, lourds, pâtisseries ou crèmes glacées',
    it: 'Cibo grasso, pesante, dolci o gelati',
    el: 'Λιπαρά, βαριά φαγητά, γλυκά, ζύμες ή παγωτό',
    ru: 'Жирная, тяжелая пища, торты, выпечка или мороженое'
  },
  gi_stress_coffee: {
    de: 'Ärger, Stress, Kaffee, Alkohol, Tabak oder Medikamente',
    en: 'Vexation, stress, coffee, alcohol, tobacco or medicines',
    es: 'Enojo, estrés, café, alcohol, tabaco o medicamentos',
    fr: 'Colère, stress, café, alcool, tabac ou médicaments',
    it: 'Rabbia, stress, caffè, alcol, fumo o farmaci',
    el: 'Θυμός, στρες, καφές, αλκοόλ, καπνός ή φαρμακευτική αγωγή',
    ru: 'Раздражение, стресс, кофе, алкоголь, табак или медикаменты'
  },
  gi_cold_drinks: {
    de: 'Eiskalte Getränke oder Unterkühlung des Bauches',
    en: 'Ice-cold beverages or chilling of the abdomen',
    es: 'Bebidas heladas o enfriamiento del abdomen',
    fr: 'Boissons glacées ou refroidissement de l’abdomen',
    it: 'Bevande ghiacciate o colpo di freddo all’addome',
    el: 'Παγωμένα ποτά ή ψύξη της κοιλιακής χώρας',
    ru: 'Ледяные напитки или переохлаждение живота'
  },
  gi_thirst_cold: {
    de: 'Großer Durst auf eiskaltes Wasser (wird aber oft wieder erbrochen)',
    en: 'Great thirst for ice-cold water (often vomited once warm in stomach)',
    es: 'Gran sed de agua helada (a menudo vomitada al calentarse)',
    fr: 'Grande soif d’eau glacée (souvent rejetée dès qu’elle se réchauffe)',
    it: 'Grande sete di acqua ghiacciata (spesso rigettata)',
    el: 'Έντονη δίψα για παγωμένο νερό (που συχνά αποβάλλεται με έμετο μόλις ζεσταθεί)',
    ru: 'Сильная жажда ледяной воды (которая часто извергается, согревшись в желудке)'
  },
  gi_thirst_sips: {
    de: 'Ständiger Durst auf häufige kleine Schlucke mit Unruhe',
    en: 'Frequent thirst for small sips, accompanied by restlessness',
    es: 'Sed frecuente a pequeños sorbos, con inquietud',
    fr: 'Soif fréquente de petites gorgées avec agitation',
    it: 'Sete frequente a piccoli sorsi con agitazione',
    el: 'Συνεχής δίψα για συχνές μικρές γουλιές με ανησυχία',
    ru: 'Частая жажда маленькими глотками в сочетании с беспокойством'
  },
  gi_no_thirst: {
    de: 'Völlige Durstlosigkeit trotz Übelkeit und Beschwerden',
    en: 'Complete lack of thirst despite nausea and complaints',
    es: 'Ausencia total de sed a pesar de las náuseas y molestias',
    fr: 'Absence totale de soif malgré nausées et malaise',
    it: 'Totale assenza di sete nonostante nausea e malessere',
    el: 'Πλήρης έλλειψη δίψας παρά τη ναυτία και τα ενοχλήματα',
    ru: 'Полное отсутствие жажды, несмотря на тошноту и недомогание'
  },
  gi_better_warm: {
    de: 'Deutliche Besserung durch heiße Getränke und Wärmflasche',
    en: 'Marked relief from hot drinks and warm applications (hot bottle)',
    es: 'Alivio notable con bebidas calientes y calor local (bolsa de agua)',
    fr: 'Amélioration nette par boissons chaudes et bouillotte',
    it: 'Netto sollievo con bevande calde e borsa dell’acqua calda',
    el: 'Σαφής ανακούφιση με ζεστά ροφήματα και θερμοφόρα',
    ru: 'Заметное улучшение от горячего питья и грелки'
  },

  // Respiratory
  resp_dry_barking: {
    de: 'Trockener, bellender, erstickender Husten (oft plötzlich nachts)',
    en: 'Dry, barking, suffocative cough (often sudden awakening at night)',
    es: 'Tos seca, perruna y sofocante (a menudo súbita por la noche)',
    fr: 'Toux sèche, aboyante et suffocante (souvent brutale la nuit)',
    it: 'Tosse secca, abbaiante e soffocante (spesso improvvisa di notte)',
    el: 'Ξηρός, γαβγιστικός, ασφυκτικός βήχας (συχνά ξαφνικός τη νύχτα)',
    ru: 'Сухой, лающий, удушающий кашель (часто внезапно ночью)'
  },
  resp_loose_rattling: {
    de: 'Lockerer, rasselnder Schleimhusten, Schleim schwer abhustbar',
    en: 'Loose, rattling mucosal cough; mucus difficult to expectorate',
    es: 'Tos productiva con estertores; mucosidad difícil de expectorar',
    fr: 'Toux grasse et râlante; mucosités difficiles à expectorer',
    it: 'Tosse grassa con rantoli; catarro difficile da espettorare',
    el: 'Υγρός, ραγώδης βήχας με βλέννα, βλέννες δύσκολο να αποβληθούν',
    ru: 'Влажный клокочущий кашель, мокрота откашливается с большим трудом'
  },
  resp_painful_hold: {
    de: 'Sehr schmerzhafter Husten, muss sich vor Schmerz die Brust halten',
    en: 'Extremely painful cough; compelled to hold chest with both hands',
    es: 'Tos muy dolorosa; debe sujetarse el pecho con las manos',
    fr: 'Toux très douloureuse; doit se tenir la poitrine à deux mains',
    it: 'Tosse molto dolorosa; deve tenersi il petto con le mani',
    el: 'Ιδιαίτερα επώδυνος βήχας, αναγκάζεται να κρατά το στήθος του από τον πόνο',
    ru: 'Очень болезненный кашель, приходится держаться руками за грудь'
  },
  resp_sore_throat: {
    de: 'Brennender, dunkelroter Hals mit starkem Schluckschmerz',
    en: 'Burning, dark-red inflamed throat with intense pain on swallowing',
    es: 'Garganta roja ardiente con dolor intenso al tragar',
    fr: 'Gorge brûlante rouge sombre avec vive douleur à la déglutition',
    it: 'Gola bruciante rosso scuro con forte dolore alla deglutizione',
    el: 'Καυστικός, βαθύκοκκος λαιμός με έντονο πόνο στην κατάποση',
    ru: 'Жгучее темно-красное горло с резкой болью при глотании'
  },
  resp_cold_wind: {
    de: 'Schlimmer nach kaltem, scharfem trockenem Wind',
    en: 'Aggravated after exposure to cold, dry wind',
    es: 'Peor tras exposición a viento frío y seco',
    fr: 'Aggravation après vent froid, sec et piquant',
    it: 'Peggiora dopo esposizione a vento freddo e asciutto',
    el: 'Χειρότερα μετά από έκθεση σε ψυχρό, ξηρό άνεμο',
    ru: 'Ухудшение после холодного, сухого резкого ветра'
  },
  resp_warm_room_bad: {
    de: 'Schlimmer im warmen Zimmer, Besserung an kühler frischer Luft',
    en: 'Worse in a warm room; relieved in cool open air',
    es: 'Peor en habitación caldeada; mejora al aire fresco',
    fr: 'Aggravation en chambre chaude; soulagement au grand air frais',
    it: 'Peggiora in ambiente caldo; sollievo all’aria fresca',
    el: 'Χειρότερα σε ζεστό δωμάτιο, ανακούφιση σε δροσερό φρέσκο αέρα',
    ru: 'Хуже в теплой комнате, улучшение на прохладном свежем воздухе'
  },
  resp_cold_air_bad: {
    de: 'Hustenanfall sofort beim Einatmen kalter Luft oder beim Entblößen',
    en: 'Cough triggered immediately by inhaling cold air or uncovering',
    es: 'Acceso de tos al inhalar aire frío o al destaparse',
    fr: 'Quinte de toux déclenchée par l’air froid ou le découvert',
    it: 'Accesso di tosse all’inalazione di aria fredda o scoprendosi',
    el: 'Κρίση βήχα αμέσως με την εισπνοή κρύου αέρα ή το ξεσκέπασμα',
    ru: 'Приступ кашля сразу при вдыхании холодного воздуха или раскрывании'
  },
  resp_warm_drinks_good: {
    de: 'Besserung durch warme Getränke und warmes Einhüllen des Halses',
    en: 'Relieved by hot drinks and wrapping throat warmly',
    es: 'Mejora con bebidas calientes y abrigando bien el cuello',
    fr: 'Soulagé par les boissons chaudes et le cou bien emmitouflé',
    it: 'Sollievo con bevande calde e gola ben coperta',
    el: 'Ανακούφιση με ζεστά ροφήματα και ζεστό περιτύλιγμα του λαιμού',
    ru: 'Улучшение от теплого питья и теплого укутывания шеи'
  },
  resp_empty_swallow: {
    de: 'Schlimmer beim Leerschlucken, Engegefühl (kann keinen engen Kragen ertragen)',
    en: 'Worse swallowing empty; throat constriction, cannot bear tight collar',
    es: 'Peor al tragar en vacío; constricción, no tolera cuello ajustado',
    fr: 'Pire en avalant à vide; sensation de constriction, col serré insupportable',
    it: 'Peggiora deglutendo a vuoto; senso di costrizione, insofferenza al colletto',
    el: 'Χειρότερα στην κενή κατάποση, αίσθημα σφιξίματος (δυσανεξία σε στενό γιακά)',
    ru: 'Хуже при пустом глотке; чувство сдавления, не переносит тесный воротник'
  },
  resp_splinter_throat: {
    de: 'Stechender Schmerz beim Schlucken wie ein Holzsplitter oder eine Gräte',
    en: 'Sticking pain on swallowing as from a splinter or fishbone',
    es: 'Dolor punzante al tragar como astilla o espina de pescado',
    fr: 'Douleur piquante à la déglutition comme une écharde ou arête',
    it: 'Dolore pungente deglutendo come una scheggia o lisca',
    el: 'Οξύς πόνος στην κατάποση σαν αγκίδα ή ψαροκόκαλο',
    ru: 'Колющая боль при глотании, словно от занозы или рыбьей кости'
  },
  resp_hoarseness: {
    de: 'Ausgeprägte Heiserkeit bis hin zu völligem Stimmverlust',
    en: 'Marked hoarseness progressing to complete loss of voice (aphonia)',
    es: 'Ronquera marcada que llega a pérdida total de la voz (afonía)',
    fr: 'Enrouement marqué pouvant aller jusqu’à l’aphonie totale',
    it: 'Marcata raucedine fino a completa afonia',
    el: 'Έντονη βραχνάδα έως πλήρης απώλεια φωνής (αφωνία)',
    ru: 'Выраженная охриплость вплоть до полной потери голоса (афония)'
  },
  resp_restless_anxious: {
    de: 'Große Angst, Atembeklemmung und quälende Unruhe',
    en: 'Intense anxiety, chest oppression and distressing restlessness',
    es: 'Gran ansiedad, opresión respiratoria e inquietud angustiosa',
    fr: 'Angoisse intense, oppression respiratoire et agitation',
    it: 'Forte ansia, oppressione respiratoria e tormentosa agitazione',
    el: 'Έντονη αγωνία, αναπνευστική δυσχέρεια και ανήσυχη ανυπομονησία',
    ru: 'Сильный страх, стеснение в груди и мучительное беспокойство'
  },

  // Headache
  hd_throbbing_hot: {
    de: 'Pochend, hämmernd, pulsierende Halsschlagadern, rotes Gesicht',
    en: 'Throbbing, hammering; pulsing carotids, hot flushed face',
    es: 'Pulsátil, martilleante; carótidas latiendo, cara roja y caliente',
    fr: 'Pulsatile, martelant; battements des carotides, visage congestionné',
    it: 'Pulsante, martellante; carotidi visibili, viso rosso e accaldato',
    el: 'Σφυγμικός, σφυροκόπημα, παλλόμενες καρωτίδες, ερυθρό καυτό πρόσωπο',
    ru: 'Пульсирующая, стучащая боль, пульсация сонных артерий, прилив крови к лицу'
  },
  hd_splitting_motion: {
    de: 'Stechend, berstend, als ob der Kopf zerspringt (jede Bewegung unerträglich)',
    en: 'Stitching, bursting pain; head feels like splitting (least motion unbearable)',
    es: 'Punzante, como si fuera a estallar; el menor movimiento es insoportable',
    fr: 'Piquant, éclatant; sensation d’explosion (le moindre mouvement est insoutenable)',
    it: 'Pungente, scoppiante; sembra che la testa esploda (insopportabile ogni movimento)',
    el: 'Νυγμώδης, διαρρηκτικός, σαν να σπάει το κεφάλι (ανυπόφορη η παραμικρή κίνηση)',
    ru: 'Колющая, распирающая боль; голова словно раскалывается (малейшее движение невыносимо)'
  },
  hd_dull_heavy_occiput: {
    de: 'Dumpf, schwer, vom Hinterkopf ausgehend, schwere Augenlider',
    en: 'Dull, heavy band across occiput; drooping heavy eyelids',
    es: 'Sordo, pesado, originado en el occipucio; párpados caídos y pesados',
    fr: 'Sourd, pesant, partant de l’occiput; paupières tombantes et lourdes',
    it: 'Sordo, pesante, con origine nucale; palpebre pesanti',
    el: 'Αμβλύς, βαρύς, με αφετηρία το ινίο, βαριά βλέφαρα',
    ru: 'Тупая, тяжелая боль из затылка, тяжелые отяжелевшие веки'
  },
  hd_one_sided_sharp: {
    de: 'Einseitig stechend über einem Auge (oft mit Augenflimmern)',
    en: 'Sharp, one-sided pain above one eye (often with visual scintillation)',
    es: 'Punzante unilateral sobre un ojo (con centelleo visual)',
    fr: 'Piquant unilatéral au-dessus d’un œil (avec scintillements)',
    it: 'Pungente unilaterale sopra un occhio (con scintillii visivi)',
    el: 'Μονόπλευρος οξύς πόνος πάνω από ένα μάτι (συχνά με οπτικά φωτάκια)',
    ru: 'Острая односторонняя боль над глазом (часто с мерцанием перед глазами)'
  },
  hd_jar_light_noise: {
    de: 'Erschütterung, Licht, Geräusche und Bücken sind unerträglich',
    en: 'Jarring, light, noise and stooping are completely intolerable',
    es: 'Sacudidas, luz, ruidos e inclinarse son intolerables',
    fr: 'Secousses, lumière, bruits et le fait de se pencher sont intolérables',
    it: 'Scosse, luce, rumori e chinarsi sono intollerabili',
    el: 'Κραδασμοί, φως, θόρυβοι και σκύψιμο είναι ανυπόφορα',
    ru: 'Сотрясения, яркий свет, шум и наклоны абсолютно невыносимы'
  },
  hd_eye_motion: {
    de: 'Jede kleinste Bewegung des Kopfes oder sogar der Augen verschlimmert',
    en: 'Every slight turn of the head or even eye movement worsens pain',
    es: 'Cualquier movimiento de la cabeza o de los ojos agrava',
    fr: 'Tout mouvement de tête ou des yeux aggrave',
    it: 'Ogni minimo movimento del capo o degli occhi peggiora il dolore',
    el: 'Κάθε ανεπαίσθητη κίνηση της κεφαλής ή ακόμη και των ματιών επιδεινώνει',
    ru: 'Малейшее движение головы или даже глаз резко ухудшает состояние'
  },
  hd_stress_morning: {
    de: 'Morgens beim Erwachen nach Stress, Schlafmangel oder Genussmitteln',
    en: 'Morning upon waking after mental stress, sleep deficit or stimulants',
    es: 'Por la mañana al despertar tras estrés, falta de sueño o excesos',
    fr: 'Le matin au réveil après stress, manque de sommeil ou stimulants',
    it: 'Al mattino al risveglio dopo stress, poco sonno o eccessi',
    el: 'Το πρωί κατά την έγερση μετά από στρες, στέρηση ύπνου ή διεγερτικά',
    ru: 'Утром при пробуждении после стресса, недосыпа или стимуляторов'
  },
  hd_sun_heat: {
    de: 'Nach starker Sonneneinstrahlung, Hitze oder Föhn',
    en: 'After intense sun exposure, overheating or warm wind',
    es: 'Tras exposición solar intensa, calor excesivo o viento cálido',
    fr: 'Après coup de soleil, chaleur intense ou vent chaud',
    it: 'Dopo forte esposizione solare, colpo di calore o vento caldo',
    el: 'Μετά από έντονη έκθεση στον ήλιο, υπερθέρμανση ή θερμό αέρα',
    ru: 'После пребывания на солнце, перегрева или душной жары'
  },
  hd_firm_bandage: {
    de: 'Besser durch festes Abbinden des Kopfes mit einem Tuch',
    en: 'Relieved by tying a tight band or scarf around the head',
    es: 'Alivio atando un pañuelo o venda apretada alrededor de la cabeza',
    fr: 'Soulagé en serrant un bandeau ou foulard fermement autour de la tête',
    it: 'Sollievo fasciando strettamente il capo con un foulard',
    el: 'Ανακούφιση με σφιχτό δέσιμο της κεφαλής με μαντήλι',
    ru: 'Облегчение от тугой повязки вокруг головы'
  },
  hd_cold_compress: {
    de: 'Besser durch eiskalte Kompressen auf Stirn oder Schläfen',
    en: 'Relieved by ice-cold compresses on forehead or temples',
    es: 'Alivio con compresas heladas sobre frente o sienes',
    fr: 'Soulagé par des compresses glacées sur le front ou les tempes',
    it: 'Sollievo con impacchi gelidi su fronte o tempie',
    el: 'Ανακούφιση με παγωμένες κομπρέσες στο μέτωπο ή τους κροτάφους',
    ru: 'Облегчение от ледяных компрессов на лоб или виски'
  },
  hd_warm_wrap: {
    de: 'Besser durch Wärme und warmes Einhüllen des Kopfes',
    en: 'Relieved by heat and wrapping the head warmly',
    es: 'Alivio con calor y abrigando cálidamente la cabeza',
    fr: 'Soulagé par la chaleur et en emmitouflant chaudement la tête',
    it: 'Sollievo con calore e coprendo calorosamente la testa',
    el: 'Ανακούφιση με ζέστη και ζεστό περιτύλιγμα της κεφαλής',
    ru: 'Облегчение от тепла и теплого укутывания головы'
  },
  hd_fresh_air_walk: {
    de: 'Besser durch langsames Umhergehen an kühler frischer Luft',
    en: 'Relieved by slow walking in cool, open fresh air',
    es: 'Alivio paseando lentamente al aire libre fresco',
    fr: 'Soulagé en marchant lentement au grand air frais',
    it: 'Sollievo camminando lentamente all’aria fresca aperta',
    el: 'Ανακούφιση με αργό περπάτημα σε δροσερό καθαρό αέρα',
    ru: 'Облегчение от медленной прогулки на прохладном свежем воздухе'
  },

  // Injury
  inj_blunt_hematoma: {
    de: 'Stumpfes Trauma, Prellung, Bluterguss, Muskelkater, wie zerschlagen',
    en: 'Blunt trauma, contusion, bruise, sore muscles; bruised all over',
    es: 'Traumatismo contuso, hematoma, agujetas; sensación de magulladura general',
    fr: 'Traumatisme contondant, ecchymose, courbatures; sensation de meurtrissure',
    it: 'Trauma contusivo, ematoma, indolenzimento; sensazione di pestaggio',
    el: 'Αμβλύ τραύμα, θλάση, αιμάτωμα, μυϊκός πόνος, αίσθημα συντριβής παντού',
    ru: 'Тупая травма, ушиб, гематома, крепатура; чувство разбитости во всем теле'
  },
  inj_sprain_ligaments: {
    de: 'Verstauchung, Zerrung von Bändern, Sehnen oder Überlastung',
    en: 'Sprain, strain of ligaments/tendons or physical overexertion',
    es: 'Esguince, distensión de ligamentos o tendones por sobreesfuerzo',
    fr: 'Entorse, élongation ligamentaire ou tendineuse par surmenage',
    it: 'Distorsione, stiramento di legamenti/tendini o sovraccarico',
    el: 'Διάστρεμμα, τέντωμα συνδέσμων ή τενόντων, σωματική υπερκόπωση',
    ru: 'Растяжение связок или сухожилий, перенапряжение мышц'
  },
  inj_nerve_crush: {
    de: 'Quetschung nervenreicher Gewebe (Fingerspitzen, Zehen, Steißbein)',
    en: 'Crush injury of nerve-rich parts (fingertips, toes, coccyx)',
    es: 'Aplastamiento de zonas ricas en nervios (puntas de dedos, cóccix)',
    fr: 'Écrasement de zones riches en nerfs (bouts des doigts, orteils, coccyx)',
    it: 'Schiacciamento di zone ricche di nervi (polpastrelli, dita, coccige)',
    el: 'Σύνθλιψη νευροβριθών ιστών (άκρα δακτύλων, κόκκυγας)',
    ru: 'Раздавливание богатых нервами тканей (кончики пальцев, копчик)'
  },
  inj_puncture_cut: {
    de: 'Stichwunde, Insektenstich, Nageltritt oder Schnittwunde',
    en: 'Puncture wound, insect sting, stepping on nail or sharp laceration',
    es: 'Herida punzante, picadura, clavo pisado o incisión cortante',
    fr: 'Plaie punctiforme, piqûre d’insecte, clou dans le pied ou coupure nette',
    it: 'Ferita da punta, puntura d’insetto, chiodo nel piede o taglio netto',
    el: 'Νυγμώδες τραύμα, τσίμπημα εντόμου, πάτημα καρφιού ή καθαρή τομή',
    ru: 'Колотая рана, укус насекомого, наступание на гвоздь или порез'
  },
  inj_motion_better: {
    de: 'Erste Bewegung sehr schmerzhaft, nach weiterem Bewegen spürbar besser',
    en: 'Painful on initial motion, distinctly improved on continued walking',
    es: 'El primer movimiento duele mucho, mejora al continuar moviéndose',
    fr: 'Très douloureux au début du mouvement, nettement mieux en marchant',
    it: 'Dolore al primo movimento, nettamente migliorato col cammino prolungato',
    el: 'Η πρώτη κίνηση είναι πολύ επώδυνη, αισθητή βελτίωση με τη συνέχιση',
    ru: 'Болезненно в начале движения, заметно легче при продолжении движения'
  },
  inj_motion_worse: {
    de: 'Jede geringste Bewegung ist unerträglich, will absolut ruhig lagern',
    en: 'Slightest motion is intolerable; insists on absolute resting posture',
    es: 'El menor movimiento es intolerable; exige reposo absoluto',
    fr: 'Le moindre mouvement est insoutenable; exige l’immobilité complète',
    it: 'Il minimo movimento è insopportabile; richiede immobilità assoluta',
    el: 'Η παραμικρή κίνηση είναι ανυπόφορη, θέλει απόλυτη ακινησία',
    ru: 'Малейшее движение невыносимо, стремится к полной неподвижности'
  },
  inj_nerve_shoot: {
    de: 'Schmerz schießt an den Nervenbahnen blitzartig empor',
    en: 'Pains shoot upward along nerve pathways like lightning',
    es: 'Dolores fulgurantes disparados hacia arriba por los trayectos nerviosos',
    fr: 'Douleurs fulgurantes remontant le long des trajets nerveux',
    it: 'Dolori a lampo che risalgono lungo i tragitti nervosi',
    el: 'Ο πόνος εκτινάσσεται αστραπιαία προς τα πάνω κατά μήκος των νεύρων',
    ru: 'Боль молниеносно стреляет вверх по ходу нервных стволов'
  },
  inj_cold_better: {
    de: 'Verletzte Stelle fühlt sich kalt an, aber Kälte lindert den Schmerz',
    en: 'Injured spot feels cold to touch, yet cold applications relieve',
    es: 'La zona se nota fría, pero las aplicaciones frías alivian',
    fr: 'La zone blessée est froide au toucher, pourtant le froid soulage',
    it: 'La parte ferita è fredda al tatto, eppure il freddo allevia',
    el: 'Το τραυματισμένο σημείο είναι κρύο στην αφή, αλλά το ψύχος ανακουφίζει',
    ru: 'Травмированное место холодное на ощупь, но холод облегчает боль'
  },
  inj_fear_touch: {
    de: 'Extrem berührungsempfindlich, fürchtet jede Annäherung („Mir fehlt nichts!“)',
    en: 'Averse to approach; fears touch, says "There is nothing wrong with me!"',
    es: 'Teme que se le acerquen o toquen; afirma "¡No me pasa nada!"',
    fr: 'Craint l’approche et le toucher; affirme "Je n’ai rien du tout !"',
    it: 'Teme l’avvicinamento e il contatto; dice "Non ho niente!"',
    el: 'Αποστρέφεται το άγγιγμα και την προσέγγιση, λέει: "Δεν έχω τίποτα!"',
    ru: 'Боится прикосновения и приближения; заявляет: "Со мной все в порядке!"'
  },
  inj_ice_relief: {
    de: 'Spürbare Linderung nur durch eiskaltes Wasser oder Eisauflagen',
    en: 'Distinct relief only from ice-cold water or ice packs',
    es: 'Alivio notable únicamente con agua helada o hielo local',
    fr: 'Soulagement net uniquement par eau glacée ou poches de glace',
    it: 'Netto sollievo solo con acqua gelata o borse del ghiaccio',
    el: 'Αισθητή ανακούφιση μόνο με παγωμένο νερό ή παγοκύστες',
    ru: 'Заметное облегчение только от ледяной воды или прикладывания льда'
  },
  inj_warmth_relief: {
    de: 'Linderung durch feuchte Wärme, warme Bäder oder Einhüllen',
    en: 'Relief from moist heat, warm soaks or warm wrapping',
    es: 'Alivio con calor húmedo, baños tibios o abrigo cálido',
    fr: 'Soulagement par chaleur humide, bains tièdes ou bon emmaillotage',
    it: 'Sollievo con calore umido, bagni caldi o coperte calde',
    el: 'Ανακούφιση με υγρή θερμότητα, ζεστά λουτρά ή ζεστό περιτύλιγμα',
    ru: 'Облегчение от влажного тепла, теплых ванн или теплого укутывания'
  },
  inj_intense_pain: {
    de: 'Unverhältnismäßig heftiger Schmerz, schlägt um sich vor Schmerz',
    en: 'Disproportionately intense pain; frantic and intolerant of pain',
    es: 'Dolor desproporcionadamente violento; frenético e intolerante',
    fr: 'Douleur démesurée et violente; insupportable, devient furieux',
    it: 'Dolore sproporzionatamente violento; frenetico e intollerante',
    el: 'Δυσανάλογα σφοδρός πόνος, εξαιρετικά ευερέθιστος από τον πόνο',
    ru: 'Несоразмерно сильная боль, теряет терпение от мучений'
  },

  // Fever
  fev_sudden_dry: {
    de: 'Plötzlich hohes Fieber nach Kälte/Wind, glühende trockene Haut, Schüttelfrost',
    en: 'Sudden high fever after exposure to cold wind; glowing dry skin, chills',
    es: 'Fiebre alta súbita tras viento frío; piel seca y ardiente, escalofríos',
    fr: 'Fièvre élevée brutale après vent froid; peau sèche et brûlante, frissons',
    it: 'Febbre alta improvvisa dopo vento freddo; pelle secca e rovente, brividi',
    el: 'Αιφνίδιος υψηλός πυρετός μετά από ψυχρό άνεμο, καυτό ξηρό δέρμα, ρίγος',
    ru: 'Внезапная высокая температура после холодного ветра; сухая пылающая кожа, озноб'
  },
  fev_hot_sweat_red: {
    de: 'Hohe Hitze, hochroter Kopf, weite Pupillen, Schweiß, pochende Schläfen',
    en: 'Intense heat, flushed red face, dilated pupils, profuse sweat, throbbing',
    es: 'Calor ardiente, cara roja congestionada, pupilas dilatadas, sudor, latidos',
    fr: 'Forte chaleur, visage écarlate, pupilles dilatées, sueurs, pulsations',
    it: 'Forte calore, viso rosso acceso, pupille dilatate, sudore, tempie pulsanti',
    el: 'Υψηλή θερμότητα, κατακόκκινο πρόσωπο, διεσταλμένες κόρες, ίδρωτας, σφυγμός',
    ru: 'Сильный жар, багровое лицо, расширенные зрачки, пот, пульсация в висках'
  },
  fev_slow_drowsy: {
    de: 'Schleichender Beginn, große Schläfrigkeit, Schwere, zittrige Schwäche',
    en: 'Slow, insidious onset; heavy drowsiness, tremulous weakness',
    es: 'Inicio insidioso; gran somnolencia, pesadez, debilidad temblorosa',
    fr: 'Début insidieux; lourde somnolence, pesanteur, faiblesse tremblante',
    it: 'Inizio lento e insidioso; forte sonnolenza, pesantezza, debolezza tremante',
    el: 'Ύπουλη, βραδεία έναρξη, έντονη υπνηλία, βαρύτητα, τρεμάμενη αδυναμία',
    ru: 'Медленное вялое начало, сильная сонливость, тяжесть, дрожащая слабость'
  },
  fev_bone_ache: {
    de: 'Hohes Fieber mit tiefem, quälendem Zerschlagenheitsgefühl in den Knochen',
    en: 'Fever with deep, agonizing bruised aching in bones as if broken',
    es: 'Fiebre con dolor profundo en los huesos como si estuvieran rotos',
    fr: 'Fièvre avec courbatures osseuses profondes, comme si les os étaient brisés',
    it: 'Febbre con profondo indolenzimento osseo, come se le ossa fossero rotte',
    el: 'Πυρετός με βαθύ, εξουθενωτικό πόνο στα οστά σαν να έχουν σπάσει',
    ru: 'Высокая температура с глубокой ломотой в костях, будто переломаны'
  },
  fev_huge_thirst: {
    de: 'Großer Durst auf große Mengen kaltes Wasser in langen Abständen',
    en: 'Large thirst for large quantities of cold water at long intervals',
    es: 'Gran sed de grandes cantidades de agua fría a largos intervalos',
    fr: 'Grande soif de grandes quantités d’eau froide à longs intervalles',
    it: 'Grande sete di abbondanti quantità di acqua fredda a lunghi intervalli',
    el: 'Μεγάλη δίψα για μεγάλες ποσότητες κρύου νερού σε αραιά διαστήματα',
    ru: 'Сильная жажда больших количеств холодной воды через длительные промежутки'
  },
  fev_sips_restless: {
    de: 'Häufiger Durst auf kleine Schlucke mit ängstlicher Ruhelosigkeit',
    en: 'Frequent sips of water with anxious motor restlessness',
    es: 'Sorbo a sorbo con frecuencia, acompañado de inquietud angustiosa',
    fr: 'Petites gorgées fréquentes accompagnées d’agitation angoissée',
    it: 'Frequenti piccoli sorsi con irrequietezza angosciosa',
    el: 'Συχνές μικρές γουλιές νερού με έντονη αγχώδη ανησυχία',
    ru: 'Частая жажда маленькими глотками в сочетании с тревожным беспокойством'
  },
  fev_thirstless: {
    de: 'Völlige Durstlosigkeit trotz Hitze und hohem Fieber',
    en: 'Complete absence of thirst despite high heat and fever',
    es: 'Ausencia total de sed a pesar del calor y la fiebre alta',
    fr: 'Absence complète de soif malgré la forte fièvre',
    it: 'Completa assenza di sete nonostante il calore e la febbre',
    el: 'Πλήρης έλλειψη δίψας παρά τη θερμότητα και τον υψηλό πυρετό',
    ru: 'Полное отсутствие жажды, несмотря на жар и высокую температуру'
  },
  fev_cold_drinks_crave: {
    de: 'Verlangen nach eiskalten Getränken oder säuerlichen Säften',
    en: 'Craving for ice-cold drinks or refreshing acidic juices',
    es: 'Deseo de bebidas heladas o zumos ácidos refrescantes',
    fr: 'Désir de boissons glacées ou de jus acidulés rafraîchissants',
    it: 'Desiderio di bevande ghiacciate o succhi aciduli',
    el: 'Επιθυμία για παγωμένα ποτά ή δροσερούς όξινους χυμούς',
    ru: 'Тяга к ледяным напиткам или кислым освежающим сокам'
  },
  fev_fear_agitation: {
    de: 'Große Todesangst, panische Unruhe, fürchtet die Nacht',
    en: 'Intense panic, fear of death, restless agitation; dreads the night',
    es: 'Gran miedo a la muerte, inquietud pánica; teme la noche',
    fr: 'Peur de la mort, agitation panique; redoute la nuit',
    it: 'Paura della morte, agitazione e panico; teme la notte',
    el: 'Έντονος φόβος θανάτου, πανικός, έντονη ανησυχία, φοβάται τη νύχτα',
    ru: 'Сильный страх смерти, паника, двигательное беспокойство; боится ночи'
  },
  fev_delirium_startle: {
    de: 'Phantasiert im Fieber, schreckhaft, Halluzinationen bei geschlossenen Augen',
    en: 'Delirium with fever, easily startled; vivid visions on closing eyes',
    es: 'Delirio febril, sobresaltos fáciles; alucinaciones al cerrar los ojos',
    fr: 'Délire fébrile, sursaute facilement; visions à la fermeture des yeux',
    it: 'Delirio febbrile, trasalimenti facili; visioni a occhi chiusi',
    el: 'Παραλήρημα στον πυρετό, ξαφνιάσματα, οπτικές ψευδαισθήσεις με κλειστά μάτια',
    ru: 'Бред при лихорадке, вздрагивания, галлюцинации при закрывании глаз'
  },
  fev_chill_uncover: {
    de: 'Fröstelt bei geringstem Entblößen, will fest zugedeckt schwitzen',
    en: 'Chilly on slightest uncovering; insists on being tightly covered',
    es: 'Escalofrío al menor destape; insiste en estar muy tapado',
    fr: 'Frilosité au moindre découvert; veut transpirer sous de chaudes couvertures',
    it: 'Brividi al minimo scoperto; vuole essere ben coperto',
    el: 'Ρίγος με το παραμικρό ξεσκέπασμα, θέλει να είναι καλά σκεπασμένος',
    ru: 'Озноб при малейшем раскрывании; стремится тепло укутаться'
  },
  fev_quiet_sleepy: {
    de: 'Völlig apathisch, will nur schlafen, liegt bewegungslos',
    en: 'Completely apathetic, wants only to sleep; lies motionless',
    es: 'Completamente apático, solo quiere dormir; permanece inmóvil',
    fr: 'Totalement apathique, ne demande qu’à dormir; reste immobile',
    it: 'Totalmente apatico, desidera solo dormire; resta immobile',
    el: 'Εντελώς απαθής, θέλει μόνο να κοιμάται, παραμένει ακίνητος',
    ru: 'Полная апатия, хочет только спать, лежит абсолютно неподвижно'
  },

  // Skin
  sk_bee_edema: {
    de: 'Glasige, blass-rosige Schwellung (wie Wespenstich), brennend und stechend',
    en: 'Glassy pale-rosy edema (like bee sting); burning and stinging pain',
    es: 'Edema pálido y rosado (como picadura de abeja); ardor y picor punzante',
    fr: 'Œdème rosé translucide (comme piqûre d’abeille); douleur piquante et brûlante',
    it: 'Edema rosato traslucido (come puntura d’ape); bruciore e fitte',
    el: 'Υαλώδες ρόδινο οίδημα (σαν τσίμπημα μέλισσας), καυστικό και νυγμώδες',
    ru: 'Стекловидный бледно-розовый отек (как от укуса пчелы), жгуче-колющая боль'
  },
  sk_burn_blister: {
    de: 'Verbrennung / Verbrühung mit schneller Blasenbildung und starkem Brennen',
    en: 'Thermal burn or scald with rapid vesicle formation and intense burning',
    es: 'Quemadura térmica con rápida formación de ampollas y ardor violento',
    fr: 'Brûlure thermique avec apparition rapide de cloques et cuisante brûlure',
    it: 'Ustione termica con rapida formazione di vescicole e forte bruciore',
    el: 'Έγκαυμα με ταχεία ανάπτυξη φυσαλίδων και έντονο κάψιμο',
    ru: 'Термический ожог с быстрым образованием пузырей и сильнейшим жжением'
  },
  sk_vesicles_itch: {
    de: 'Haufenweise kleine, intensiv juckende Bläschen auf geröteter Haut',
    en: 'Crops of tiny, intensely itchy vesicles on red inflamed skin',
    es: 'Múltiples vesículas diminutas muy pruriginosas sobre piel eritematosa',
    fr: 'Semis de petites vésicules extrêmement prurigineuses sur fond rouge',
    it: 'Miriadi di piccole vescicole intensamente pruriginose su cute rossa',
    el: 'Σμήνος μικρών φυσαλίδων με έντονο κνησμό πάνω σε ερυθηματώδες δέρμα',
    ru: 'Группы мелких зудящих пузырьков на воспаленной покрасневшей коже'
  },
  sk_pus_sensitive: {
    de: 'Schmerzhafte Eiterung (Abszess/Furunkel), extrem berührungsempfindlich',
    en: 'Painful suppuration (abscess/boil), exquisitely sensitive to slightest touch',
    es: 'Supuración dolorosa (absceso/forúnculo), hipersensible al menor contacto',
    fr: 'Suppuration douloureuse (abcès/furoncle), hypersensible au moindre contact',
    it: 'Suppurazione dolorosa (ascesso/foruncolo), ipersensibile al minimo tocco',
    el: 'Επώδυνη πυώδης συλλογή (απόστημα/δοθιήνας), εξαιρετικά ευαίσθητο στην αφή',
    ru: 'Болезненное нагноение (абсцесс/фурункул), гиперчувствительность к прикосновению'
  },
  sk_cold_ice_better: {
    de: 'Nur eiskaltes Wasser oder Eisauflagen bringen Erleichterung',
    en: 'Relief obtained only by ice-cold water or cold applications',
    es: 'Alivio obtenido exclusivamente con agua helada o compresas frías',
    fr: 'Soulagement obtenu uniquement par eau glacée ou applications froides',
    it: 'Sollievo ottenuto unicamente da acqua gelida o impacchi freddi',
    el: 'Ανακούφιση επιτυγχάνεται μόνο με παγωμένο νερό ή παγοκύστες',
    ru: 'Облегчение достигается исключительно ледяной водой или холодом'
  },
  sk_scalding_hot_better: {
    de: 'Linderung durch sehr heißes Wasser oder heiße Kompressen',
    en: 'Relief from application of very hot water or hot compresses',
    es: 'Alivio mediante agua muy caliente o compresas calientes',
    fr: 'Soulagement par l’eau très chaude ou compresses chaudes',
    it: 'Sollievo con acqua molto calda o impacchi caldi',
    el: 'Ανακούφιση με πολύ καυτό νερό ή θερμές κομπρέσες',
    ru: 'Облегчение от очень горячей воды или горячих компрессов'
  },
  sk_water_worse: {
    de: 'Jedes Waschen und Wasserberührung verschlimmert den Juckreiz massiv',
    en: 'Any washing or contact with water severely aggravates itching',
    es: 'Cualquier lavado o contacto con agua empeora mucho el picor',
    fr: 'Tout lavage ou contact avec l’eau aggrave considérablement le prurit',
    it: 'Ogni lavaggio o contatto con l’acqua peggiora notevolmente il prurito',
    el: 'Κάθε πλύσιμο ή επαφή με νερό επιδεινώνει δραματικά τον κνησμό',
    ru: 'Любое мытье и контакт с водой резко усиливают зуд'
  },
  sk_open_air_better: {
    de: 'Besser an kühler frischer Luft, unerträglich im warmen Bett',
    en: 'Relieved in cool fresh air; completely intolerable in warm bed',
    es: 'Mejora al aire fresco; intolerable con el calor de la cama',
    fr: 'Amélioration au grand air frais; insupportable dans un lit chaud',
    it: 'Migliora all’aria fresca; intollerabile nel letto caldo',
    el: 'Καλύτερα σε δροσερό καθαρό αέρα, ανυπόφορο στη ζέστη του κρεβατιού',
    ru: 'Лучше на прохладном воздухе; невыносимо в теплой постели'
  },
  sk_burning_needles: {
    de: 'Brennend-stechend wie glühende Nadeln, weinerlich-unruhig',
    en: 'Stinging, burning like red-hot needles; fretful and restless',
    es: 'Dolores ardientes y punzantes como agujas al rojo; lloroso e inquieto',
    fr: 'Piqûres brûlantes comme des aiguilles rougies au feu; geignard et agité',
    it: 'Fitte brucianti come aghi roventi; lamentoso e irrequieto',
    el: 'Καυστικός-νυγμώδης πόνος σαν πυρακτωμένες βελόνες, κλαψιάρης και ανήσυχος',
    ru: 'Жгуче-колющая боль, как от раскаленных игл; плаксивость и беспокойство'
  },
  sk_unbearable_scratch: {
    de: 'Unerträglicher Juckreiz, muss sich bis aufs Blut kratzen',
    en: 'Intolerable itching, driven to scratch until raw and bleeding',
    es: 'Picor insoportable que obliga a rascarse hasta sangrar',
    fr: 'Prurit intolérable poussant à se gratter jusqu’au sang',
    it: 'Prurito insopportabile con bisogno di grattarsi a sangue',
    el: 'Ανυπόφορος κνησμός, εξαναγκασμός σε ξύσιμο μέχρι αιμορραγίας',
    ru: 'Невыносимый зуд, вынужден расчесывать кожу до крови'
  },
  sk_hypersensitive_rage: {
    de: 'Überempfindlich gegen geringsten Schmerz, zornig und gereizt',
    en: 'Exquisitely hypersensitive to pain; irritable and bad-tempered',
    es: 'Hipersensible al menor dolor; irritable, enojado e impaciente',
    fr: 'Hypersensible à la moindre douleur; coléreux et irritable',
    it: 'Ipersensibile al minimo dolore; iroso e irritabile',
    el: 'Υπερευαίσθητος στον παραμικρό πόνο, οξύθυμος και ευερέθιστος',
    ru: 'Сверхчувствительность к малейшей боли; раздражительный и вспыльчивый'
  },
  sk_anxious_burning: {
    de: 'Brennender Schmerz mit nächtlicher Unruhe und Angst',
    en: 'Burning pains accompanied by nocturnal anxiety and restlessness',
    es: 'Dolores ardientes con angustia e inquietud nocturna',
    fr: 'Douleurs brûlantes avec angoisse et agitation nocturnes',
    it: 'Dolori brucianti con ansia e irrequietezza notturna',
    el: 'Καυστικός πόνος με νυχτερινή ανησυχία και άγχος',
    ru: 'Жгучая боль с ночной тревогой и беспокойством'
  },

  // General Fallback
  gen_sudden: {
    de: 'Plötzlich, heftig einsetzend (oft nach Kälte/Schreck)',
    en: 'Sudden, violent onset (often after cold dry wind or shock)',
    es: 'Inicio súbito y violento (tras viento frío o susto)',
    fr: 'Début brutal et violent (souvent après vent froid ou frayeur)',
    it: 'Inizio improvviso e violento (spesso dopo freddo o spavento)',
    el: 'Αιφνίδια, σφοδρή έναρξη (συχνά μετά από κρύο άνεμο ή σοκ)',
    ru: 'Внезапное, бурное начало (часто после переохлаждения или испуга)'
  },
  gen_cold_wet: {
    de: 'Nach Unterkühlung, Durchnässung oder Zugluft',
    en: 'After getting chilled, wet or exposed to drafts',
    es: 'Tras enfriamiento, mojarse o exposición a corrientes de aire',
    fr: 'Après refroidissement, avoir été mouillé ou courant d’air',
    it: 'Dopo colpo di freddo, essersi bagnati o correnti d’aria',
    el: 'Μετά από ψύξη, κατάβρεγμα ή έκθεση σε ρεύματα αέρα',
    ru: 'После переохлаждения, промокания или сквозняка'
  },
  gen_stress: {
    de: 'Nach Ärger, Zorn, Kränkung oder Stress',
    en: 'After anger, vexation, mortification or emotional stress',
    es: 'Tras ira, enfado, disgusto o estrés emocional',
    fr: 'Après colère, vexation, contrariété ou stress émotionnel',
    it: 'Dopo collera, risentimento, offesa o stress emotivo',
    el: 'Μετά από θυμό, οργή, προσβολή ή έντονο στρες',
    ru: 'После гнева, досады, обиды или эмоционального стресса'
  },
  gen_slow: {
    de: 'Schleichend / langsam zunehmend ohne klaren Auslöser',
    en: 'Gradual, insidious onset without an obvious sudden cause',
    es: 'Inicio insidioso o gradual sin causa súbita aparente',
    fr: 'Début progressif et insidieux sans cause brutale nette',
    it: 'Inizio graduale e subdolo senza causa evidente',
    el: 'Βαθμιαία, ύπουλη έναρξη χωρίς προφανή αιφνίδια αιτία',
    ru: 'Постепенное, вялое начало без явного пускового фактора'
  },
  mod_still_press: {
    de: 'Besser durch absolute Ruhe und festen Druck',
    en: 'Better from quiet rest and firm pressure',
    es: 'Mejora con reposo absoluto y presión firme',
    fr: 'Amélioration par le repos complet et une forte pression',
    it: 'Migliora con riposo assoluto e pressione ferma',
    el: 'Καλύτερα με απόλυτη ηρεμία και σταθερή πίεση',
    ru: 'Лучше от полного покоя и сильного давления'
  },
  mod_dark_cold: {
    de: 'Schlimmer durch Erschütterung, Licht und Geräusche',
    en: 'Worse from jarring, light and noise',
    es: 'Peor por sacudidas, luz y ruido',
    fr: 'Pire par les secousses, la lumière et le bruit',
    it: 'Peggiora per scosse, luce e rumori',
    el: 'Χειρότερα με κραδασμούς, φως και θορύβους',
    ru: 'Хуже от сотрясения, света и шума'
  },
  mod_fresh_air: {
    de: 'Besser an kühler frischer Luft, schlimmer im warmen Zimmer',
    en: 'Better in open fresh air, worse in warm room',
    es: 'Mejora al aire libre fresco, peor en habitación caliente',
    fr: 'Amélioration au grand air frais, pire en pièce chaude',
    it: 'Migliora all’aria fresca, peggiora nella stanza calda',
    el: 'Καλύτερα σε δροσερό καθαρό αέρα, χειρότερα σε ζεστό δωμάτιο',
    ru: 'Лучше на прохладном свежем воздухе, хуже в теплой комнате'
  },
  mod_warmth: {
    de: 'Besser durch Wärme, warme Auflagen und Einhüllen',
    en: 'Better from warm compresses and wrapping up warmly',
    es: 'Mejora con calor local, compresas calientes y abrigo',
    fr: 'Amélioration par la chaleur, compresses chaudes et emmitouflage',
    it: 'Migliora con calore, impacchi caldi e coperte',
    el: 'Καλύτερα με ζέστη, θερμά επιθέματα και καλό τύλιγμα',
    ru: 'Лучше от тепла, теплых компрессов и укутывания'
  },
  mod_cold_air: {
    de: 'Besser durch Kälte, kalte Umschläge & frische Luft',
    en: 'Better from cold, cool compresses & open fresh air',
    es: 'Mejora con frío, compresas frescas y aire libre',
    fr: 'Amélioration par le froid, compresses fraîches et grand air',
    it: 'Migliora col freddo, impacchi freschi e aria fresca',
    el: 'Καλύτερα με κρύο, δροσερές κομπρέσες και καθαρό αέρα',
    ru: 'Лучше от холода, прохладных компрессов и свежего воздуха'
  },
  mod_rest_still: {
    de: 'Schlimmer durch geringste Bewegung (Verlangen nach absoluter Ruhe)',
    en: 'Worse from least motion (desire for complete quiet & rest)',
    es: 'Peor con el más mínimo movimiento (deseo de reposo absoluto)',
    fr: 'Pire au moindre mouvement (désir de repos absolu)',
    it: 'Peggiora al minimo movimento (desiderio di riposo assoluto)',
    el: 'Χειρότερα με την παραμικρή κίνηση (επιθυμία για απόλυτη ηρεμία)',
    ru: 'Хуже от малейшего движения (потребность в абсолютном покое)'
  },
  mod_motion_restless: {
    de: 'Besser durch fortgesetzte Bewegung & Positionswechsel',
    en: 'Better from continued motion & changing posture (restless)',
    es: 'Mejora con movimiento continuo y cambio de postura (inquieto)',
    fr: 'Amélioration par le mouvement continu et le changement de position',
    it: 'Migliora col movimento continuato e il cambio di postura',
    el: 'Καλύτερα με συνεχή κίνηση και αλλαγή στάσης (ανησυχία)',
    ru: 'Лучше от постоянного движения и смены позы (беспокойство)'
  },
  mod_hard_pressure: {
    de: 'Besser durch starken Druck oder Zusammenkrümmen',
    en: 'Better from firm pressure or doubling up',
    es: 'Mejora con presión fuerte o doblándose en dos',
    fr: 'Amélioration par forte pression ou en se pliant en deux',
    it: 'Migliora con forte pressione o piegandosi in due',
    el: 'Καλύτερα με δυνατή πίεση ή δίπλωμα στα δύο',
    ru: 'Лучше от сильного давления или сгибания пополам'
  },
  sen_fear_restless: {
    de: 'Große ängstliche Unruhe, Angst, Herzklopfen',
    en: 'Great anxious restlessness, fear, panic, racing pulse',
    es: 'Gran inquietud angustiosa, miedo, palpitaciones',
    fr: 'Grande agitation anxieuse, peur, panique, palpitations',
    it: 'Forte irrequietezza ansiosa, paura, palpitazioni',
    el: 'Έντονη αγχώδης ανησυχία, φόβος, ταχυπαλμία',
    ru: 'Сильное тревожное беспокойство, страх, сердцебиение'
  },
  sen_angry_irritable: {
    de: 'Zornig, gereizt, ungeduldig, will in Ruhe gelassen werden',
    en: 'Irritable, angry, snappish, intolerant of disturbance',
    es: 'Iracundo, irritable, impaciente, quiere que lo dejen en paz',
    fr: 'Coléreux, irritable, impatient, veut qu’on le laisse en paix',
    it: 'Irascibile, irritabile, impaziente, vuole essere lasciato in pace',
    el: 'Οργισμένος, ευερέθιστος, ανυπόμονος, θέλει να τον αφήσουν ήσυχο',
    ru: 'Сердитый, раздражительный, нетерпеливый, требует оставить в покое'
  },
  sen_weepy_mild: {
    de: 'Weinerlich, anhänglich, sehnt sich nach Trost & Zuwendung',
    en: 'Weepy, clingy, craves consolation, gentle disposition',
    es: 'Lloroso, apegado, anhela consuelo y afecto',
    fr: 'Pleurard, attaché, recherche la consolation et la douceur',
    it: 'Piagnucoloso, bisognoso di affetto e consolazione',
    el: 'Κλαψιάρης, προσκολλητικός, αναζητά παρηγοριά και στοργή',
    ru: 'Плаксивый, ласковый, жаждет утешения и мягкого обращения'
  },
  sen_dull_heavy: {
    de: 'Benommen, schläfrig, wie betäubt, schwere Augenlider',
    en: 'Dull, drowsy, heavy eyelids, trembling weakness',
    es: 'Aturdido, somnoliento, como narcotizado, párpados pesados',
    fr: 'Engourdi, somnolent, comme hébété, paupières lourdes',
    it: 'Stordito, sonnolento, come intontito, palpebre pesanti',
    el: 'Ζαλισμένος, υπνηλέος, σαν ναρκωμένος, βαριά βλέφαρα',
    ru: 'Оглушенный, сонливый, отяжелевшие веки, слабость'
  },
  sen_burning_stinging: {
    de: 'Brennender oder stechender Schmerz wie glühende Nadeln',
    en: 'Burning, stinging sensation like red hot needles',
    es: 'Dolor ardiente o punzante como agujas al rojo vivo',
    fr: 'Douleur brûlante ou piquante comme des aiguilles rougies',
    it: 'Dolore bruciante o pungente come aghi arroventati',
    el: 'Καυστικός ή νυγμώδης πόνος σαν πυρακτωμένες βελόνες',
    ru: 'Жгучая или колющая боль, как от раскаленных игл'
  }
};
