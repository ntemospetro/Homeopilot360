import { AnamnesisQuestion, QuestionType } from '../types';

export interface ComplaintCategoryDef {
  keywords: string[];
  title: string;
  generateQuestions: (complaintName: string) => AnamnesisQuestion[];
}

export const SCALE_LABELS_1_TO_4: { [key: number]: string } = {
  1: '1 (Normal / Leicht)',
  2: '2 (Mäßig)',
  3: '3 (Stark)',
  4: '4 (Extrem / Unerträglich)',
};

/**
 * Knowledge base of tailored question templates according to classical homeopathic anamnesis.
 */
export const COMPLAINT_ARCHETYPES: Record<string, ComplaintCategoryDef> = {
  kopfschmerz: {
    keywords: ['kopf', 'migräne', 'cephalgie', 'stirn', 'schläfe', 'hinterkopf', 'halbseitig', 'spannungskopfschmerz', 'cluster', 'scheitel'],
    title: 'Kopfschmerzen & Migräne',
    generateQuestions: (complaintName) => [
      {
        id: 'q_kopf_beginn',
        category: 'Zeitverlauf & Beginn',
        question: `Seit wann bestehen die Beschwerden bezüglich "${complaintName}" und beginnen sie plötzlich oder schleichend?`,
        type: 'choice',
        options: [
          'Plötzlich einschießend (akut)',
          'Schleichend / langsam zunehmend',
          'Periodisch / anfallsartig (z.B. wöchentlich/monatlich)',
          'Nach konkretem Auslöser (Stress, Kälte, Sonne, Schlafmangel)',
        ],
        helpText: 'Erfasst die Dynamik des Auftretens (akuter Beginn vs. chronisch-schleichender Verlauf).',
      },
      {
        id: 'q_kopf_ort',
        category: 'Lokalisation & Seitigkeit',
        question: `Wo genau im Kopf spüren Sie "${complaintName}"?`,
        type: 'multi_choice',
        options: [
          'Stirn & über den Augen (Frontal)',
          'Schläfe rechts (einseitig rechts)',
          'Schläfe links (einseitig links)',
          'Hinterkopf & Nacken',
          'Scheitelpunkt (wie ein schwerer Deckel)',
          'Tief hinter den Augen / Augenhöhlen',
        ],
        helpText: 'Genaue anatomische Lokalisation und Seitigkeit (rechts/links) im Kopfbereich.',
      },
      {
        id: 'q_kopf_ausstrahlung',
        category: 'Ausstrahlung & Wanderung',
        question: `Wohin strahlen die Kopfschmerzen aus oder wandern sie?`,
        type: 'multi_choice',
        options: [
          'Bleibt fest punktuell / keine Ausstrahlung',
          'Zieht vom Nacken nach vorne zur Stirn / Auge',
          'Strahlt in Kiefer, Zähne oder Gesicht aus',
          'Strahlt nach unten in die Schultern aus',
          'Wandert von einer Seite zur anderen',
        ],
        helpText: 'Ausstrahlungsrichtung und Wanderung der Schmerzen sind entscheidende homöopathische Leitsymptome.',
      },
      {
        id: 'q_kopf_charakter',
        category: 'Schmerzcharakter',
        question: `Wie würden Sie die Empfindung bei "${complaintName}" beschreiben? Eher drückend, stechend, ziehend, pulsierend oder anders?`,
        type: 'multi_choice',
        options: [
          'Pulsierend, pochend, klopfend (wie Herzhämmern)',
          'Drückend (wie ein enges Band oder Schraubstock)',
          'Stechend / nadelartig / messerscharf',
          'Ziehend, reißend oder wandernd',
          'Brennend wie glühende Kohlen',
          'Dumpf, schwer und benebelnd',
          'Berührungsempfindliche Kopfhaut / Haare schmerzen',
        ],
        helpText: 'Präzise Differenzierung der Schmerzempfindung und sensorischen Qualität.',
      },
      {
        id: 'q_kopf_skala',
        category: 'Intensität & Skala (1-4)',
        question: `Wie stark sind die Beschwerden bezüglich "${complaintName}" aktuell und im schlimmsten Fall auf der Skala von 1 bis 4?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 4,
        scaleLabels: SCALE_LABELS_1_TO_4,
        helpText: 'Klicken Sie auf 1 bis 4 für den aktuellen Status und den maximalen Spitzenwert.',
      },
      {
        id: 'q_kopf_verlauf',
        category: 'Episoden & Rhythmus',
        question: `Treten die Beschwerden bezüglich "${complaintName}" dauerhaft oder in einzelnen Episoden/Attacken auf?`,
        type: 'choice',
        options: [
          'In einzelnen episodischen Attacken (mit schmerzfreien Tagen)',
          'Dauerhafter täglicher Dauerkopfschmerz',
          'Schubweise mit Zunahme zu bestimmten Uhrzeiten (z.B. 10:00 Uhr oder 15:00 Uhr)',
          'Zyklusabhängig (prämenstruell / Menstruation)',
          'Wochenend-Migräne (nach Abfall von Arbeitsstress)',
        ],
        helpText: 'Modalität der Periodizität und Rhythmik.',
      },
      {
        id: 'q_kopf_begleitsymptome',
        category: 'Begleitsymptome',
        question: `Gibt es begleitende Symptome bei "${complaintName}" (z.B. Übelkeit, Licht- oder Geräuschempfindlichkeit, Sehstörungen)?`,
        type: 'multi_choice',
        options: [
          'Übelkeit / Erbrechen bei Schmerzhöhepunkt',
          'Ausgeprägte Lichtempfindlichkeit (Photophobie)',
          'Geräuschempfindlichkeit (Lärm unerträglich)',
          'Sehstörungen / Flimmerskotom / Zickzacklinien vorher',
          'Schwindel beim Aufrichten oder Gehen',
          'Geruchsempfindlichkeit (z.B. Parfüm, Kochen)',
          'Rotes, heißes Gesicht mit kalten Extremitäten',
        ],
        helpText: 'Begleitende vegetative und sensorische Symptome.',
      },
      {
        id: 'q_kopf_modalitaeten',
        category: 'Modalitäten (Besser / Schlechter)',
        question: `Was lindert oder verschlimmert "${complaintName}"?`,
        type: 'multi_choice',
        options: [
          'Besser durch: Dunkles, ruhiges Zimmer & Schlafen',
          'Besser durch: Fester Druck / enges Tuch um die Stirn',
          'Besser durch: Kalte Umschläge auf Kopf / Stirn',
          'Besser durch: Wärme & heiße Dusche',
          'Besser durch: Frische kühle Luft & Spaziergang',
          'Schlechter durch: Geringste Erschütterung & Schritte',
          'Schlechter durch: Bücken & Kopfbewegung',
          'Schlechter durch: Wärme, Sonne & heiße Räume',
        ],
        helpText: 'Modalitäten sind das Herzstück der homöopathischen Differenzierung.',
      },
    ],
  },

  magen_darm: {
    keywords: ['magen', 'bauch', 'darm', 'sodbrennen', 'übelkeit', 'erbrechen', 'blähung', 'reizdarm', 'kolik', 'durchfall', 'obstipation', 'verstopfung', 'krämpfe', 'gastro', 'oberbauch', 'unterbauch', 'verdauung', 'magenschmerzen', 'bauchschmerzen', 'leib'],
    title: 'Magen-Darm & Verdauung',
    generateQuestions: (complaintName) => [
      {
        id: 'q_magen_beginn',
        category: 'Zeitverlauf & Beginn',
        question: `Seit wann bestehen die Beschwerden bezüglich "${complaintName}" und traten sie plötzlich oder schleichend auf?`,
        type: 'choice',
        options: [
          'Plötzlich nach bestimmten Speisen / verdorbenem Essen',
          'Schleichend / chronisch über Wochen oder Monate',
          'Periodisch / anfallsartig bei Stress & Ärger',
          'Nach Medikamenteneinnahme (Antibiotika, Schmerzmittel)',
        ],
        helpText: 'Auslöser und zeitlicher Verlauf der gastrointestinalen Beschwerden.',
      },
      {
        id: 'q_magen_ort',
        category: 'Lokalisation & Region',
        question: `Wo genau im Bauchbereich spüren Sie "${complaintName}"?`,
        type: 'multi_choice',
        options: [
          'Oberbauch / Magengegend (Druck unter dem Brustbein)',
          'Rechter Oberbauch (Leber- & Gallebereich)',
          'Linker Oberbauch (Milz- & Magenbereich)',
          'Rund um den Bauchnabel (Nabelkolik)',
          'Unterbauch rechts (Blinddarmbereich)',
          'Unterbauch links (Sigma / Darm)',
          'Diffus im gesamten Abdomen wandernd',
        ],
        helpText: 'Genaue anatomische Region im Bauchraum.',
      },
      {
        id: 'q_magen_ausstrahlung',
        category: 'Ausstrahlung & Richtung',
        question: `Wohin strahlt der Bauchschmerz aus (oder bleibt er fest begrenzt)?`,
        type: 'multi_choice',
        options: [
          'Bleibt streng lokal / keine Ausstrahlung',
          'Strahlt nach hinten in den Rücken oder Schulterblatt',
          'Zieht nach oben hinter das Brustbein / Speiseröhre',
          'Zieht nach unten in den Unterbauch / Leisten / Beine',
          'Strahlt quer durch das gesamte Abdomen aus',
        ],
        helpText: 'Ausstrahlungsrichtung ist ein hochspezifisches Leitsymptom für Magen-, Leber- und Darmarzneien.',
      },
      {
        id: 'q_magen_charakter',
        category: 'Schmerzcharakter',
        question: `Wie würden Sie die Empfindung bei "${complaintName}" beschreiben (z.B. Krämpfe, Brennen, Völlegefühl, schneidend, bohrend)?`,
        type: 'multi_choice',
        options: [
          'Krampfartig / zusammenschnürend (wie Krallen)',
          'Brennend wie Säure / Feuer im Magen & Speiseröhre',
          'Dumpfes, schweres Völlegefühl (wie Stein im Magen)',
          'Schneidend wie mit Messern / Kolik',
          'Völlegefühl bereits nach wenigen Bissen',
          'Gluckern, Gärung und starker Blähungsdruck',
        ],
        helpText: 'Erfassung der Art der Magen-Darm-Empfindung.',
      },
      {
        id: 'q_magen_skala',
        category: 'Intensität & Skala (1-4)',
        question: `Wie stark sind die Beschwerden bezüglich "${complaintName}" aktuell und im Alltag auf der Skala von 1 bis 4?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 4,
        scaleLabels: SCALE_LABELS_1_TO_4,
        helpText: '1 = Leicht/Normal, 2 = Mäßig, 3 = Stark, 4 = Extrem/Krampfkolik.',
      },
      {
        id: 'q_magen_begleitsymptome',
        category: 'Begleitsymptome & Verdauung',
        question: `Welche Begleitsymptome treten bei "${complaintName}" auf (z.B. Sodbrennen, Aufstoßen, Übelkeit, Stuhlunregelmäßigkeiten)?`,
        type: 'multi_choice',
        options: [
          'Saures Sodbrennen & saures Aufstoßen',
          'Ständige Übelkeit (Erbrechen bringt KEINE Erleichterung)',
          'Übelkeit (Erleichterung NACH Erbrechen)',
          'Starke Blähungen mit Völlegefühl (schlechter 16-20 Uhr)',
          'Neigung zu krampfhafter Verstopfung / ständiger Stuhldrang',
          'Wässriger oder schmerzhafter Durchfall',
          'Appetitlosigkeit oder Heißhunger mit schnellem Sättigungsgefühl',
        ],
        helpText: 'Zusätzliche Verdauungs- und vegetative Begleiterscheinungen.',
      },
      {
        id: 'q_magen_modalitaeten',
        category: 'Modalitäten (Besser / Schlechter)',
        question: `Was bessert oder verschlimmert "${complaintName}"?`,
        type: 'multi_choice',
        options: [
          'Besser durch: Zusammenkrümmen & harter Druck auf Bauch',
          'Besser durch: Wärmflasche & heiße Wickel',
          'Besser durch: Kleine Schlucke warmes Wasser/Tee',
          'Besser durch: Essen (Nüchternschmerz bessert sich)',
          'Schlechter durch: 1-2 Stunden nach dem Essen',
          'Schlechter durch: Fettiges, Süßes oder Kaffee/Alkohol',
          'Schlechter durch: Kälte, Kaltgetränke & Eis',
          'Schlechter durch: Enge Kleidung am Bund / Berührung',
        ],
      },
    ],
  },

  ruecken_gelenke: {
    keywords: ['rücken', 'wirbelsäule', 'lenden', 'kreuz', 'ischias', 'gelenk', 'knie', 'hüfte', 'schulter', 'nacken', 'halswirbel', 'arthrose', 'arthritis', 'rheuma', 'bandscheibe', 'muskel', 'hand', 'hände', 'handgelenk', 'finger', 'daumen', 'arm', 'unterarm', 'oberarm', 'ellenbogen', 'bein', 'fuß', 'füße', 'sprunggelenk', 'ferse', 'fersensporn', 'sehne', 'sehnenscheide', 'karpaltunnel', 'ziehen', 'verspannung', 'steifigkeit', 'knieschmerzen', 'rückenschmerzen'],
    title: 'Rücken, Gelenke & Bewegungsapparat',
    generateQuestions: (complaintName) => [
      {
        id: 'q_ruecken_beginn',
        category: 'Zeitverlauf & Beginn',
        question: `Seit wann bestehen die Beschwerden bezüglich "${complaintName}" und wie traten sie auf?`,
        type: 'choice',
        options: [
          'Plötzlich nach Heben, Verheben oder Fehlbewegung',
          'Nach Durchnässung, Kälteeinwirkung oder Zugluft',
          'Schleichend entwickelnd / chronisch verschleißbedingt',
          'Schubweise mit entzündlichen Schwellungen',
        ],
        helpText: 'Ursache und auslösendes Ereignis der Gelenk- und Rückenbeschwerden.',
      },
      {
        id: 'q_ruecken_ort',
        category: 'Lokalisation & Region',
        question: `Wo genau am Bewegungsapparat spüren Sie "${complaintName}"?`,
        type: 'multi_choice',
        options: [
          'Hand / Handgelenk / Finger (rechts oder links)',
          'Kniegelenk / Unterschenkel (rechts oder links)',
          'Lendenwirbelsäule / Kreuzbein (LWS)',
          'Halswirbelsäule / Nacken / Schultergürtel',
          'Brustwirbelsäule / zwischen den Schulterblättern',
          'Arm / Ellenbogen (Tennisarm / Golferellenbogen)',
          'Hüfte / Becken / Iliosakralgelenk (ISG)',
        ],
        helpText: 'Genaue anatomische Lokalisation am Bewegungsapparat.',
      },
      {
        id: 'q_ruecken_ausstrahlung',
        category: 'Ausstrahlung & Wanderung',
        question: `Wohin strahlt der Schmerz aus oder wandert er?`,
        type: 'multi_choice',
        options: [
          'Bleibt streng lokal am Gelenk / Wirbel fixiert',
          'Ausstrahlung ins Gesäß und das Bein hinab (Ischias-Nerv)',
          'Ausstrahlung über die Schulter in den Arm / Finger',
          'Zieht gürtelförmig um den Rumpf nach vorne',
          'Wandernd von einem Gelenk zum nächsten (springende Schmerzen)',
        ],
        helpText: 'Ausstrahlungsrichtung (z.B. Ischiasbahn) und Springen von Gelenk zu Gelenk sind fundamentale homöopathische Leitsymptome.',
      },
      {
        id: 'q_ruecken_charakter',
        category: 'Schmerz- & Steifigkeitscharakter',
        question: `Wie fühlt sich die Empfindung bei "${complaintName}" an (z.B. ziehend, reißend, stechend, steif, brennend, zerschlagen)?`,
        type: 'multi_choice',
        options: [
          'Ziehend, reißend entlang der Sehnen & Nervenbahnen',
          'Gefühl wie zerschlagen, geprellt oder wund',
          'Ausgeprägte Steifigkeit (wie eingerostet)',
          'Stechend, jede Bewegung wie mit Messern',
          'Brennend in den Gelenken mit Hitzegefühl',
          'Taubheitsgefühl, Kribbeln oder Ameisenlaufen',
          'Schwächegefühl oder Kraftlosigkeit beim Greifen/Auftreten',
        ],
        helpText: 'Spezifischer Charakter der Beschwerden im Bewegungsapparat.',
      },
      {
        id: 'q_ruecken_skala',
        category: 'Intensität & Skala (1-4)',
        question: `Wie hoch ist die Intensität bei "${complaintName}" auf der Skala von 1 bis 4 (1 = leicht, 4 = extrem)?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 4,
        scaleLabels: SCALE_LABELS_1_TO_4,
      },
      {
        id: 'q_ruecken_modalitaeten',
        category: 'Bewegungs- & Temperaturmodalitäten',
        question: `Wie reagiert "${complaintName}" auf Bewegung, Ruhe und Temperatur?`,
        type: 'multi_choice',
        options: [
          'Schlechter beim ersten Anlaufen, Besser bei fortgesetzter Bewegung',
          'Schlechter bei jeder kleinsten Bewegung, Besser bei absoluter Ruhe',
          'Besser durch lokale Wärme, Heizkissen & heißes Bad',
          'Besser durch Kühlung & kalte Umschläge',
          'Schlechter bei feuchtkaltem Wetter & Wetterumschwung',
          'Schlechter morgens nach dem Aufstehen (Morgensteifigkeit)',
          'Besser durch sanftes Ausstreichen / lockere Bewegung',
          'Schlimmer nachts im warmen Bett',
        ],
      },
    ],
  },

  husten_atemwege: {
    keywords: ['husten', 'bronchitis', 'atem', 'lunge', 'asthma', 'heiserkeit', 'kehlkopf', 'kurzatmig', 'atemnot', 'hals', 'grippe', 'erkältung', 'schnupfen', 'sinusitis', 'nasennebenhöhlen', 'rachen', 'halsschmerzen'],
    title: 'Atemwege, Husten & Lunge',
    generateQuestions: (complaintName) => [
      {
        id: 'q_husten_charakter',
        category: 'Husten- & Atemcharakter',
        question: `Um welche Art von Beschwerden handelt es sich bei "${complaintName}" (trocken, rasselnd, krampfartig, mit Auswurf)?`,
        type: 'multi_choice',
        options: [
          'Trockener, bellender, harter Reizhusten',
          'Lockerer, feuchter Husten mit viel Schleim/Auswurf',
          'Krampfartiger Husten bis zum Würgen/Erbrechen',
          'Pfeifendes, rasselndes Atmen (Giemen)',
          'Heiserkeit & Stimmlosigkeit (Kehlkopfkitzeln)',
          'Kratzen, Brennen und Stechen im Hals / Rachen',
          'Kurzatmigkeit bei kleinster Anstrengung',
        ],
        helpText: 'Klinische Differenzierung der Atem- und Hustenqualität.',
      },
      {
        id: 'q_husten_skala',
        category: 'Intensität & Skala (1-4)',
        question: `Wie stark ist die Beeinträchtigung durch "${complaintName}" auf der Skala von 1 bis 4?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 4,
        scaleLabels: SCALE_LABELS_1_TO_4,
      },
      {
        id: 'q_husten_auswurf',
        category: 'Schleim & Auswurf (Modalität)',
        question: `Falls Auswurf oder Schleim besteht bei "${complaintName}": Welche Farbe und Beschaffenheit hat das Sekret?`,
        type: 'choice',
        options: [
          'Kein Auswurf (völlig trockener Reizhusten)',
          'Gelblich-grünlich, dick, mild (nicht reizend)',
          'Klar, zäh, fädenziehend (schwer abhustbar)',
          'Weißlich, schaumig oder wässrig',
          'Blutig gestreift oder rostfarben',
        ],
        helpText: 'Beschaffenheit und Farbe des Sekrets.',
      },
      {
        id: 'q_husten_modalitaeten',
        category: 'Auslöser & Modalitäten',
        question: `Wann tritt "${complaintName}" verstärkt auf und was lindert die Beschwerden?`,
        type: 'multi_choice',
        options: [
          'Schlimmer beim Hinlegen / nachts im Bett',
          'Schlimmer beim Übergang von kalter Luft in warme Räume',
          'Schlimmer durch Sprechen, Lachen oder tiefes Einatmen',
          'Besser durch Trinken von kaltem Wasser',
          'Besser durch Trinken von warmen Getränken',
          'Besser im aufrechten Sitzen',
        ],
      },
    ],
  },

  haut_allergie: {
    keywords: ['haut', 'ausschlag', 'ekzem', 'neurodermitis', 'juckreiz', 'psoriasis', 'schuppen', 'urtikaria', 'nesselsucht', 'bläschen', 'herpes', 'akne', 'warzen', 'allergie', 'heuschnupfen', 'rötung'],
    title: 'Haut, Allergien & Dermatologie',
    generateQuestions: (complaintName) => [
      {
        id: 'q_haut_charakter',
        category: 'Hautbild & Empfindung',
        question: `Wie äußern sich die Hauterscheinungen und Empfindungen bei "${complaintName}"?`,
        type: 'multi_choice',
        options: [
          'Unerträglicher Juckreiz (brennt nach dem Kratzen)',
          'Trockene, schuppige, rissige Hautstellen',
          'Nässende Ekzeme mit klebriger / honigartiger Flüssigkeit',
          'Bläschenbildung (wie bei Herpes oder Kontaktekzem)',
          'Quaddeln / Nesselsucht mit starker Schwellung (wie von Brennnesseln)',
          'Überwärmung, Rötung und Stechen (wie Bienenstich)',
        ],
        helpText: 'Erscheinungsbild der Effloreszenzen und subjektive Hautreaktion.',
      },
      {
        id: 'q_haut_skala',
        category: 'Intensität & Skala (1-4)',
        question: `Wie intensiv ist der Juckreiz / Schmerz bei "${complaintName}" auf der Skala von 1 bis 4?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 4,
        scaleLabels: SCALE_LABELS_1_TO_4,
      },
      {
        id: 'q_haut_modalitaeten',
        category: 'Reaktion auf Wasser, Wärme & Kleidung',
        question: `Wie reagiert "${complaintName}" auf äußere Einflüsse (Wasser, Wärme, Kleidung)?`,
        type: 'multi_choice',
        options: [
          'Schlechter durch Wasser / Waschen / Baden',
          'Schlechter durch Bettwärme & Zudecken (nachts unerträglicher Juckreiz)',
          'Besser durch eiskalte Umschläge & Kälte',
          'Besser durch heiße Anwendungen / Föhnen',
          'Schlechter durch Wollkleidung oder Schweiß',
        ],
      },
    ],
  },

  psyche_gemuet_stress: {
    keywords: [
      'psyche', 'psychisch', 'seelisch', 'stress', 'überlastung', 'überfordert', 'überlastet', 'zu viel',
      'haus', 'haushalt', 'familie', 'familiär', 'mann', 'ehemann', 'frau', 'ehefrau', 'partner', 'partnerin', 'ehe',
      'kinder', 'kind', 'schimpfen', 'geschimpft', 'streit', 'konflikt', 'krach', 'vorwurf', 'vorwürfe',
      'burnout', 'erschöpfung', 'ausgebrannt', 'kraftlos', 'angst', 'panik', 'sorgen', 'depression', 'depressiv',
      'niedergeschlagen', 'trauer', 'kummer', 'kränkung', 'ärger', 'wut', 'reizbar', 'zorn', 'weinen', 'weinerlich',
      'hilflos', 'einsam', 'allein', 'schuldgefühl', 'versagen', 'druck', 'nervös', 'unruhe', 'trauma',
      'seelischer druck', 'gedankenkreisen', 'grübeln', 'kränkung', 'unterdrückt',
      'vergesslich', 'vergesslichkeit', 'konzentration', 'konzentrationsschwäche', 'gedächtnis', 'demenz', 'dement',
      'unmotiviert', 'antriebslos', 'lustlos', 'lethargisch', 'apathisch', 'teilnahmslos', 'burn-out',
      'verwirrt', 'zerstreut', 'geistesabwesend', 'traurig', 'verzweifelt', 'hoffnungslos', 'aggressiv', 'aggressivität'
    ],
    title: 'Gemüt, Seelische Belastung & Familiärer Stress',
    generateQuestions: (complaintName) => [
      {
        id: 'q_psyche_causa',
        category: 'Auslösende Causa & Lebenssituation',
        question: `Welche seelischen Belastungen, familiären Konflikte oder Auslöser stehen im Hintergrund von "${complaintName}"?`,
        type: 'choice',
        options: [
          'Häusliche Dauerbelastung & Überforderung (Familie, Haushalt, Erziehung wächst über den Kopf)',
          'Ständige Konflikte, Vorwürfe oder Schimpfen durch Partner / Angehörige',
          'Gefühl des Alleingelassenseins & fehlende emotionale Unterstützung im Haus',
          'Beruflicher Dauerstress, Leistungsdruck oder Mobbing',
          'Stiller Kummer, Kränkung oder unterdrückter Ärger (muss Gefühle herunterschlucken)',
          'Akuter Schreck, Schockerlebnis oder Verlusterlebnis / Trauer',
          'Existenzielle Zukunfts- & Versagensängste',
          'Ohne erkennbare äußere Ursache schleichend entstanden',
        ],
        helpText: '§ 210–230 Organon: Die Gemütssphäre und auslösende Lebenskonflikte (Causa) sind in der Homöopathie von höchster hierarchischer Bedeutung für die dauerhafte Heilung.',
      },
      {
        id: 'q_psyche_erleben',
        category: 'Subjektives Gemütserleben & Stimmung',
        question: `Wie äußert sich Ihr seelisches Empfinden und Gemüt bei "${complaintName}" im Alltag?`,
        type: 'multi_choice',
        options: [
          'Innerlich völlig ausgelaugt, erschöpft und gleichgültig gegenüber Familie/Pflichten',
          'Ständige Reizbarkeit, Dünnhäutigkeit, schneller Jähzorn bei kleinsten Störungen/Lärm',
          'Ängstliche innere Unruhe & Getriebenheit (kann nicht stillsitzen/abschalten)',
          'Große Traurigkeit, Weinen bei geringstem Anlass oder Zuspruch',
          'Stiller Rückzug, Verschlossenheit, weint heimlich oder kann gar nicht mehr weinen',
          'Gefühl der Hilflosigkeit, Ohnmacht und ständigen Überforderung',
          'Ständiges Grübeln und Gedankenkreisen (besonders nachts / im Bett)',
          'Ausgeprägter Perfektionismus mit Angst vor Fehlern und Schuldgefühlen',
        ],
        helpText: 'Das genaue emotionale Reaktionsmuster führt direkt zur homöopathischen Mittelwahl (z.B. Sepia, Staphisagria, Ignatia, Natrium muriaticum).',
      },
      {
        id: 'q_psyche_skala',
        category: 'Intensität & Belastungsskala (1-4)',
        question: `Wie stark empfinden Sie die seelische Belastung bezüglich "${complaintName}" aktuell und in Spitzenzeiten auf der Skala von 1 bis 4?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 4,
        scaleLabels: SCALE_LABELS_1_TO_4,
        helpText: '1 = spürbar/leicht, 4 = extrem / kaum mehr zu ertragen.',
      },
      {
        id: 'q_psyche_sozial',
        category: 'Soziale Modalität & Verhalten bei Trost / Widerspruch',
        question: `Wie reagieren Sie in belastenden Momenten von "${complaintName}" auf Zuwendung, Trost und Gesellschaft?`,
        type: 'choice',
        options: [
          'Trost & gut gemeinte Ratschläge verschlimmern den Zustand / machen wütend oder weinerlich',
          'Großes Bedürfnis nach Trost, Nähe, Berührung und liebevollem Beistand (braucht Zuspruch)',
          'Starkes Verlangen nach alleinigem Rückzug und absoluter Stille (will niemanden sehen)',
          'Extrem empfindlich gegen Widerspruch oder Kritik (explodiert schnell / gekränkt)',
          'Fluchtgedanken / Wunsch, einfach allem zu entfliehen und wegzulaufen',
          'Gleichgültigkeit gegenüber den engsten Angehörigen trotz tiefer Verbundenheit',
        ],
        helpText: 'Das Verhalten bei Trost und Widerspruch ist eines der wichtigsten Differenzierungsmerkmale der klassischen Homöopathie.',
      },
      {
        id: 'q_psyche_psychosomatik',
        category: 'Psychosomatische Begleitsymptome',
        question: `Welche körperlichen Beschwerden werden durch die seelische Belastung bei "${complaintName}" ausgelöst oder verstärkt?`,
        type: 'multi_choice',
        options: [
          'Spannungskopfschmerzen / Migräneanfälle bei häuslichem Stress & Streit',
          'Magendrücken, Magenkrämpfe, Sodbrennen oder Übelkeit',
          'Kloßgefühl im Hals (Globusgefühl) oder Engegefühl in der Brust / Kurzatmigkeit',
          'Herzrasen, Herzstolpern oder inneres Zittern bei Aufregung/Konflikten',
          'Starke Nacken-, Schulter- oder Rückenverspannungen',
          'Einschlafstörungen, unruhiger Schlaf oder frühes Erwachen mit Grübeln (03:00–04:00 Uhr)',
          'Völliger Appetitverlust oder Heißhungerattacken / Verlangen nach Süßem',
        ],
        helpText: 'Verknüpfung von Geist und Körper (Psychosomatik) zur ganzheitlichen Krankheitserfassung.',
      },
      {
        id: 'q_psyche_modalitaeten',
        category: 'Gemüts-Modalitäten (Besser / Schlechter)',
        question: `Was bringt Ihnen seelische Entlastung (Besserung) oder verschlimmert die Belastung bei "${complaintName}"?`,
        type: 'multi_choice',
        options: [
          'Besser durch Weinen und offenes Aussprechen der Sorgen',
          'Besser durch zügige Bewegung an frischer Luft / Sport / Spaziergang alleine',
          'Besser durch geistige oder körperliche Ablenkung und Beschäftigung',
          'Besser durch warme Bäder, Gemütlichkeit und absolute Ruhe',
          'Schlechter durch Vorwürfe, Schimpfen, Streit und Kritik in der Familie',
          'Schlechter durch Lärm, Hektik und ständiges Durcheinander im Haus',
          'Schlechter durch Trost oder Mitleid',
          'Schlechter morgens beim Erwachen (morgendliches Stimmungstief)',
          'Schlechter abends / bei Dämmerung und Alleinsein',
        ],
      },
    ],
  },

  psyche_schlaf: {
    keywords: ['schlaf', 'schlaflos', 'schlaflosigkeit', 'einschlafen', 'durchschlafen', 'albtraum', 'albträume', 'aufwachen', 'nachtschweiß'],
    title: 'Schlafstörungen & Nächtlicher Rhythmus',
    generateQuestions: (complaintName) => [
      {
        id: 'q_schlaf_ursache',
        category: 'Auslösende Causa & Schlafrhythmus',
        question: `Was ist der Hauptauslöser für die Schlafstörungen bei "${complaintName}"?`,
        type: 'choice',
        options: [
          'Gedankenkreisen über Alltagssorgen, Familie oder Beruf',
          'Körperliche Schmerzen oder Ruhelosigkeit in den Beinen / Körper',
          'Nächtliches Erwachen durch Herzklopfen, Schweiß oder Atemnot',
          'Erwachen wie durch Weckruf zur festen Uhrzeit (z.B. 03:00 - 04:00 Uhr)',
          'Einschlafstörung trotz großer Müdigkeit (Kopf kommt nicht zur Ruhe)',
          'Kein erkennbarer äußerer Grund (seit längerer Zeit bestehend)',
        ],
      },
      {
        id: 'q_schlaf_skala',
        category: 'Intensität & Beeinträchtigung (1-4)',
        question: `Wie stark beeinträchtigt der Schlafmangel bei "${complaintName}" Ihre Tagesform auf der Skala von 1 bis 4?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 4,
        scaleLabels: SCALE_LABELS_1_TO_4,
      },
      {
        id: 'q_schlaf_muster',
        category: 'Schlafphänomene & Träume',
        question: `Welche Phänomene treten während der Nacht bei "${complaintName}" auf?`,
        type: 'multi_choice',
        options: [
          'Sehr unruhiger Schlaf mit ständigem Umherwälzen im Bett',
          'Frösteln im Bett trotz Zudecken',
          'Brennend heiße Füße / müssen unter der Decke hervorgestreckt werden',
          'Lebhafte, beängstigende Träume, Albträume oder Fallen im Traum',
          'Schweißausbrüche nachts (am Kopf oder am ganzen Körper)',
          'Völlige Erschöpfung und wie gerädert am Morgen',
        ],
      },
      {
        id: 'q_schlaf_modalitaeten',
        category: 'Schlaf-Modalitäten',
        question: `Was hilft oder verschlechtert den Schlaf bei "${complaintName}"?`,
        type: 'multi_choice',
        options: [
          'Besser bei geöffnetem Fenster / kühlem Raum',
          'Besser durch warme Milch / kleine Mahlzeit vor dem Schlafen',
          'Schlechter nach geistiger Anstrengung oder Bildschirmarbeit am Abend',
          'Schlechter durch geringste Geräusche oder Licht',
          'Schlechter nach Genussmitteln (Kaffee, Alkohol, spätes Essen)',
        ],
      },
    ],
  },

  fieber_infekt: {
    keywords: ['fieber', 'infekt', 'grippal', 'schüttelfrost', 'entzündung', 'hitze', 'schweiß', 'grippe'],
    title: 'Fieber & Akuter Infekt',
    generateQuestions: (complaintName) => [
      {
        id: 'q_fieber_anstieg',
        category: 'Temperaturverlauf & Beginn',
        question: `Wie entwickelte sich das Fieber / der Infekt bei "${complaintName}"?`,
        type: 'choice',
        options: [
          'Plötzlich hochschießend (innerhalb weniger Stunden nach Kälte/Wind)',
          'Allmählich / wellenförmig ansteigend über 1-2 Tage',
          'Mit starkem Schüttelfrost und Zähneklappern',
        ],
      },
      {
        id: 'q_fieber_skala',
        category: 'Intensität & Krankheitsgefühl (1-4)',
        question: `Wie schwer ist das Krankheitsgefühl bei "${complaintName}" auf der Skala von 1 bis 4?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 4,
        scaleLabels: SCALE_LABELS_1_TO_4,
      },
      {
        id: 'q_fieber_durst_schweiss',
        category: 'Durst- & Schweißverhalten',
        question: `Wie verhalten sich Durst und Schweißbildung bei "${complaintName}"?`,
        type: 'multi_choice',
        options: [
          'Trockene, glühende Hitze OHNE Schweißbildung',
          'Reichlicher, schwächender Schweiß bei geringster Bewegung',
          'Großer Durst auf große Mengen kaltes Wasser',
          'Durst auf häufige kleine Schlucke',
          'Völlige Durstlosigkeit trotz hohem Fieber',
        ],
      },
    ],
  },

  schwindel: {
    keywords: ['schwindel', 'vertigo', 'gleichgewicht', 'benommen', 'drehschwindel', 'schwankschwindel', 'gangunsicherheit'],
    title: 'Schwindel & Gleichgewicht',
    generateQuestions: (complaintName) => [
      {
        id: 'q_schwindel_art',
        category: 'Schwindelcharakter',
        question: `Welche Art von Schwindel liegt bei "${complaintName}" vor?`,
        type: 'choice',
        options: [
          'Drehschwindel (alles dreht sich im Kreis wie im Karussell)',
          'Schwankschwindel (wie auf einem schwankenden Schiff)',
          'Liftschwindel / Gefühl des Absackens',
          'Benommenheit & Leeregefühl im Kopf',
        ],
      },
      {
        id: 'q_schwindel_skala',
        category: 'Intensität auf der Skala (1-4)',
        question: `Wie stark beeinträchtigt der Schwindel bei "${complaintName}" auf der Skala von 1 bis 4?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 4,
        scaleLabels: SCALE_LABELS_1_TO_4,
      },
      {
        id: 'q_schwindel_ausloeser',
        category: 'Auslöser & Begleiterscheinungen',
        question: `Wann wird der Schwindel ausgelöst und welche Begleitsymptome bestehen bei "${complaintName}"?`,
        type: 'multi_choice',
        options: [
          'Beim Aufstehen aus dem Liegen / Sitzen (orthostatisch)',
          'Beim Drehen des Kopfes oder Umdrehen im Bett',
          'Beim Schließen der Augen / im Dunkeln schlimmer',
          'Begleitet von Übelkeit oder kaltem Schweiß',
          'Begleitet von Tinnitus oder Ohrdruck',
        ],
      },
    ],
  },
};

/**
 * Fallback generic generator for any custom complaint (e.g. "Tinnitus", "Zahnschmerzen", "Fersensporn")
 */
export function generateGenericQuestions(complaintName: string): AnamnesisQuestion[] {
  const cleanName = complaintName.trim() || 'Hauptbeschwerde';
  return [
    {
      id: `q_gen_beginn_${Date.now()}_1`,
      category: 'Zeitverlauf & Beginn',
      question: `Seit wann bestehen die Beschwerden bezüglich "${cleanName}" und begannen sie plötzlich oder schleichend?`,
      type: 'choice',
      options: [
        'Plötzlich einschießend (akut)',
        'Schleichend / langsam zunehmend',
        'In wiederkehrenden Episoden / Attacken',
        'Nach einem konkreten auslösenden Ereignis',
      ],
      helpText: 'Homöopathische Causa und Verlaufsform.',
    },
    {
      id: `q_gen_ort_${Date.now()}_2`,
      category: 'Lokalisation & Region',
      question: `Wo genau am Körper spüren Sie "${cleanName}"?`,
      type: 'text',
      answerText: '',
      helpText: 'Genaue anatomische Lokalisation, Region und Seitigkeit (rechts/links).',
    },
    {
      id: `q_gen_ausstrahlung_${Date.now()}_2b`,
      category: 'Ausstrahlung & Ausdehnung',
      question: `Wohin strahlen die Beschwerden bei "${cleanName}" aus (oder bleiben sie punktuell fest)?`,
      type: 'text',
      answerText: '',
      helpText: 'Genaue Ausstrahlungsrichtung, Wanderung oder punktuelle Fixierung.',
    },
    {
      id: `q_gen_charakter_${Date.now()}_3`,
      category: 'Empfindungs- & Schmerzcharakter',
      question: `Wie würden Sie die Empfindung bei "${cleanName}" beschreiben (z.B. drückend, stechend, ziehend, pulsierend, brennend)?`,
      type: 'multi_choice',
      options: [
        'Drückend / Völlegefühl',
        'Stechend / nadelartig',
        'Ziehend / reißend',
        'Pulsierend / pochend',
        'Brennend wie Feuer',
        'Krampfartig / zusammenschnürend',
        'Dumpf / taub / schwer',
      ],
      helpText: 'Der subjektive Schmerzcharakter ist ein primäres homöopathisches Leitsymptom.',
    },
    {
      id: `q_gen_skala_${Date.now()}_4`,
      category: 'Intensität & Skala (1 bis 4)',
      question: `Wie stark sind die Beschwerden bezüglich "${cleanName}" auf der Skala von 1 bis 4 (1 = normal/leicht, 4 = extrem)?`,
      type: 'scale',
      scaleMin: 1,
      scaleMax: 4,
      scaleLabels: SCALE_LABELS_1_TO_4,
      helpText: 'Wählen Sie 1 bis 4 für den aktuellen Status und den Maximalwert.',
    },
    {
      id: `q_gen_episoden_${Date.now()}_5`,
      category: 'Episoden & Rhythmus',
      question: `Treten die Symptome bezüglich "${cleanName}" dauerhaft oder in einzelnen Episoden/Schüben auf?`,
      type: 'choice',
      options: [
        'Dauerhaft durchgehend spürbar',
        'In anfallsartigen Episoden / Attacken',
        'Tageszeitabhängig (z.B. morgens nach Aufstehen oder abends)',
        'Zyklus- oder wetterabhängig',
      ],
    },
    {
      id: `q_gen_begleit_${Date.now()}_6`,
      category: 'Begleitsymptome & Begleiterscheinungen',
      question: `Gibt es begleitende Symptome bei "${cleanName}" (z.B. Übelkeit, vegetative Reaktionen, Schlaf- oder Gemütsveränderungen)?`,
      type: 'text',
      answerText: '',
      helpText: 'Begleitende Phänomene komplettieren das homöopathische Gesamtbild.',
    },
    {
      id: `q_gen_modalitaeten_${Date.now()}_7`,
      category: 'Modalitäten (Besser / Schlechter)',
      question: `Was lindert (Besserung) oder verstärkt (Verschlimmerung) die Beschwerden bei "${cleanName}"?`,
      type: 'multi_choice',
      options: [
        'Besser durch Wärme & warme Anwendungen',
        'Besser durch Kälte & Kaltanwendungen',
        'Besser durch Ruhe & Liegen',
        'Besser durch Bewegung & frische Luft',
        'Besser durch Druck / Festhalten',
        'Schlechter durch Kälte, Zugluft & Nässe',
        'Schlechter durch Bewegung & Erschütterung',
        'Schlechter durch Stress & emotionale Aufregung',
      ],
    },
  ];
}

/**
 * Cleans conversational and spoken speech filler phrases from an individual complaint entity.
 * Turns "ich habe Magenschmerzen leichte" -> "Magenschmerzen"
 * Turns "Ziehen an der rechten Hand" -> "Ziehen an der rechten Hand"
 * Turns "das linke Knie tut mir weh manchmal morgen" -> "Linkes Knie (Schmerzen / Ziehen)"
 */
export function cleanComplaintEntity(rawText: string): string {
  if (!rawText || !rawText.trim()) return '';

  let text = rawText.trim();

  // Strip leading punctuation, bullets, quotes, numbers
  text = text.replace(/^["'„“«»`\d+.)\-•*#\s,;:/\\|]+/, '').trim();

  // Iteratively strip leading conversational filler
  const leadingFillers = [
    /^(?:danach\s+habe\s+ich(?:\s+auch)?(?:\s+schon)?|danach\s+hab\s+ich(?:\s+auch)?|danach|daraufhin|anschließend|später|zuvor)\s+/i,
    /^(?:und\s+aber\s+irgendwie(?:\s+ist)?|und\s+aber|aber\s+irgendwie(?:\s+ist)?|irgendwie\s+ist(?:\s+das\s+ganze)?|irgendwie)\s+/i,
    /^(?:dann\s+habe\s+ich(?:\s+auch)?(?:\s+schon)?|dann\s+hab\s+ich(?:\s+auch)?|dann|aber\s+dann\s+habe\s+ich|aber\s+dann|aber)\s+/i,
    /^(?:manchmal\s+habe\s+ich(?:\s+auch)?(?:\s+schon)?|manchmal\s+hab\s+ich|manchmal\s+ist|manchmal\s+sind|manchmal\s+habe|manchmal)\s+/i,
    /^(?:zeitweise\s+habe\s+ich(?:\s+auch)?|zeitweise\s+hab\s+ich|zeitweise|ab\s+und\s+zu\s+habe\s+ich|ab\s+und\s+zu|hin\s+und\s+wieder)\s+/i,
    /^(?:oft\s+habe\s+ich(?:\s+auch)?|oft\s+hab\s+ich|oft|häufig\s+habe\s+ich|häufig|regelmäßig|immer\s+wieder)\s+/i,
    /^(?:morgens\s+habe\s+ich|morgens|morgen|abends\s+habe\s+ich|abends|abend|mittags\s+habe\s+ich|mittags|mittag|nachts\s+habe\s+ich|nachts|nacht|tagsüber)\s+/i,
    /^(?:ich\s+habe|ich\s+hab|habe\s+ich|hab\s+ich|ich\s+leide\s+an|ich\s+leide\s+unter|leide\s+an|leide\s+unter|ich\s+spüre|ich\s+verspüre|ich\s+fühle|ich\s+bemerke|bei\s+mir\s+ist|mir\s+tut|es\s+tut\s+mir|mir\s+schmerzt|habe\s+auch\s+schon|habe\s+auch|habe|spüre|verspüre|fühle|auch\s+schon|auch|schon)\s+/i,
    /^(?:dazu\s+kommt(?:\s+noch)?|dazu\s+habe\s+ich|dazu|zudem\s+habe\s+ich|zudem|außerdem\s+habe\s+ich|außerdem|zusätzlich\s+habe\s+ich|zusätzlich|ebenso\s+habe\s+ich|ebenso|weiterhin|weiters|des\s+weiteren|ferner)\s+/i,
    /^(?:sowie\s+auch|sowie|und\s+auch\s+schon|und\s+auch|und\s+dann|und|plus)\s+/i,
    /^(?:seit\s+gestern|seit\s+einigen\s+tagen|seit\s+tagen|seit\s+wochen|seit\s+monaten|seit\s+jahren|schon\s+lange|aktuell|derzeit)\s+/i,
    /^(?:ein|eine|einen|einem|einer|eines|das|die|der|dem|den|des|mein|meine|meinen|meinem|meiner|meines)\s+/i,
    /^(?:am\s+rechten|am\s+linken|an\s+der\s+rechten|an\s+der\s+linken|im\s+rechten|im\s+linken|an\s+der|an\s+dem|an\s+den|im|in\s+der|in\s+dem|in\s+den|am|beim|unter\s+dem|über\s+dem)\s+(?=(?:knie|hand|schulter|fuss|fuß|arm|bein|ruecken|rücken|bauch|magen|kopf|hals|gelenk|huefte|hüfte|ohr|auge|brust))/i,
  ];

  let changed = true;
  let iterations = 0;
  while (changed && iterations < 10) {
    changed = false;
    iterations++;
    for (const pattern of leadingFillers) {
      if (pattern.test(text)) {
        text = text.replace(pattern, '').trim();
        changed = true;
      }
    }
  }

  // Iteratively strip trailing conversational verbs, periods, adverbs and filler
  const trailingFillers = [
    /[\.,;:\-—!\?"'„“«»`]+$/,
    /\s+(?:tut\s+mir\s+sehr\s+weh|tut\s+mir\s+weh|tut\s+weh|schmerzt\s+sehr|schmerzt\s+stark|schmerzt|schmerzen|weh|zieht\s+sehr|zieht|drückt|brennt|sticht|pocht|macht\s+mir\s+zu\s+schaffen|stört\s+mich|quält\s+mich|plagt\s+mich|habe\s+ich\s+auch|habe\s+ich|hab\s+ich)$/i,
    /\s+(?:manchmal\s+morgens?|morgens?\s+manchmal|morgens?|morgen|abends?|abend|mittags?|mittag|nachts?\s+im\s+bett|nachts?|nacht|tagsüber|in\s+der\s+früh)$/i,
    /\s+(?:oft|häufig|immer\s+wieder|ständig|dauernd|zeitweise|immer|regelmäßig|gelegentlich|ab\s+und\s+zu|hin\s+und\s+wieder|manchmal|wiederholt)$/i,
    /\s+(?:schon\s+lange|schon\s+seit\s+tagen|seit\s+gestern|seit\s+tagen|seit\s+wochen|seit\s+monaten|seit\s+jahren|seitdem|danach)$/i,
    /\s+(?:ein\s+bisschen|etwas|leicht|leichte|leichter|stark|starke|stärker|sehr\s+stark|extrem|unerträglich|ziemlich)$/i,
    /\s+(?:sehr|extrem|total|den\s+ganzen\s+tag|ständig|pausenlos)$/i,
    /[\.,;:\-—!\?"'„“«»`]+$/,
  ];

  changed = true;
  iterations = 0;
  while (changed && iterations < 10) {
    changed = false;
    iterations++;
    for (const pattern of trailingFillers) {
      if (pattern.test(text)) {
        text = text.replace(pattern, '').trim();
        changed = true;
      }
    }
  }

  if (!text) return '';

  // Canonical refinements for Psychological, Family, Domestic, Relational & Stress Complaints
  if (/zu\s+viel\s+im\s+haus/i.test(text) || /alles\s+zu\s+viel/i.test(text) || /überlastung\s+im\s+haus/i.test(text) || /überforderung\s+im\s+haushalt/i.test(text) || /das\s+ganze\s+ist.*zu\s+viel/i.test(text)) {
    text = 'Häusliche Überlastung & Seelischer Druck (alles zu viel im Haus)';
  } else if (/mann.*schimpf/i.test(text) || /ehemann.*schimpf/i.test(text) || /partner.*schimpf/i.test(text) || /mann.*streit/i.test(text) || /konflikt.*mann/i.test(text)) {
    text = 'Familiäre Konflikte & Vorwürfe durch Partner (Mann schimpft)';
  } else if (/frau.*schimpf/i.test(text) || /partnerin.*schimpf/i.test(text) || /frau.*streit/i.test(text)) {
    text = 'Familiäre Konflikte & Vorwürfe durch Partnerin';
  } else if (/kinder.*stress/i.test(text) || /stress.*kinder/i.test(text) || /kind.*stress/i.test(text) || /kinder.*überforder/i.test(text)) {
    text = 'Dauerstress & Überforderung durch Kinder';
  } else if (/burnout/i.test(text) || /ausgebrannt/i.test(text) || /völlig\s+erschöpft/i.test(text) || /chronische\s+erschöpfung/i.test(text)) {
    text = 'Erschöpfung & Burnout';
  } else if (/panik/i.test(text) || /angstzuständ/i.test(text) || /panikattack/i.test(text) || /^angst$/i.test(text)) {
    text = 'Angstzustände & Panikattacken';
  } else if (/depression/i.test(text) || /depressiv/i.test(text) || /niedergeschlagen/i.test(text) || /schwermut/i.test(text)) {
    text = 'Depressive Verstimmung & Niedergeschlagenheit';
  } else if (/reizbar/i.test(text) || /jähzorn/i.test(text) || /wutausbr/i.test(text) || /schnell\s+wütend/i.test(text)) {
    text = 'Reizbarkeit & Wutausbrüche / Dünnhäutigkeit';
  } else if (/einsam/i.test(text) || /alleingelassen/i.test(text) || /keine\s+unterstützung/i.test(text)) {
    text = 'Gefühl der Einsamkeit & fehlende Unterstützung';
  } else if (/kummer/i.test(text) || /kränkung/i.test(text) || /herzeleid/i.test(text) || /stiller\s+schmerz/i.test(text)) {
    text = 'Kummer, Kränkung & seelischer Schmerz';
  } else if (/grübeln/i.test(text) || /gedankenkreisen/i.test(text) || /kopf\s+schaltet\s+nicht\s+ab/i.test(text)) {
    text = 'Ständiges Grübeln & Gedankenkreisen';
  } else if (/vergesslich/i.test(text) || /gedächtnis/i.test(text) || /konzentration/i.test(text) || /zerstreut/i.test(text) || /verwirrt/i.test(text)) {
    text = 'Vergesslichkeit & Konzentrationsschwäche';
  } else if (/antriebslos/i.test(text) || /unmotiviert/i.test(text) || /lustlos/i.test(text) || /apathisch/i.test(text) || /teilnahmslos/i.test(text)) {
    text = 'Antriebslosigkeit & Lustlosigkeit';
  }

  // Canonical refinements for common clinical anatomy and physical symptoms
  else if (/^linke[s]?\s+knie/i.test(text) || /^knie\s+links/i.test(text)) {
    text = 'Linkes Knie (Schmerzen / Ziehen)';
  } else if (/^rechte[s]?\s+knie/i.test(text) || /^knie\s+rechts/i.test(text)) {
    text = 'Rechtes Knie (Schmerzen / Ziehen)';
  } else if (/^knieschmerz(?:en)?/i.test(text) || /^knie$/i.test(text)) {
    text = 'Knieschmerzen';
  } else if (/^linke[rn]?\s+hand/i.test(text) || /^hand\s+links/i.test(text)) {
    text = 'Linke Hand (Schmerzen / Ziehen)';
  } else if (/^rechte[rn]?\s+hand/i.test(text) || /^hand\s+rechts/i.test(text)) {
    text = 'Rechte Hand (Schmerzen / Ziehen)';
  } else if (/^linke[rn]?\s+schulter/i.test(text) || /^schulter\s+links/i.test(text)) {
    text = 'Linke Schulter (Schmerzen)';
  } else if (/^rechte[rn]?\s+schulter/i.test(text) || /^schulter\s+rechts/i.test(text)) {
    text = 'Rechte Schulter (Schmerzen)';
  } else if (/^linke[rn]?\s+fu[ßs]/i.test(text) || /^fu[ßs]\s+links/i.test(text)) {
    text = 'Linker Fuß (Schmerzen)';
  } else if (/^rechte[rn]?\s+fu[ßs]/i.test(text) || /^fu[ßs]\s+rechts/i.test(text)) {
    text = 'Rechter Fuß (Schmerzen)';
  } else if (/^schlafstörung(?:en)?/i.test(text) || /^schlaflosigkeit/i.test(text) || /^kann\s+nicht\s+schlafen/i.test(text) || /^durchschlafstörung(?:en)?/i.test(text) || /^einschlafstörung(?:en)?/i.test(text)) {
    text = 'Schlafstörungen';
  } else if (/^kopfschmerz(?:en)?/i.test(text) || /^kopf$/i.test(text)) {
    text = 'Kopfschmerzen';
  } else if (/^hals(?:schmerz(?:en)?|weh|kratzen)?$/i.test(text)) {
    text = 'Halsschmerzen';
  } else if (/^magen(?:schmerz(?:en)?|krämpfe|brennen)?$/i.test(text)) {
    text = 'Magenschmerzen';
  } else if (/^rücken(?:schmerz(?:en)?)?$/i.test(text) || /^ruecken(?:schmerz(?:en)?)?$/i.test(text) || /^kreuzschmerz(?:en)?$/i.test(text)) {
    text = 'Rückenschmerzen';
  } else if (/^bauch(?:schmerz(?:en)?|krämpfe)?$/i.test(text)) {
    text = 'Bauchschmerzen';
  } else if (/^sodbrennen$/i.test(text)) {
    text = 'Sodbrennen';
  } else if (/^blähungen$/i.test(text)) {
    text = 'Blähungen';
  } else if (/^schwindel(?:gefühl)?$/i.test(text)) {
    text = 'Schwindel';
  } else if (/^übelkeit$/i.test(text) || /^uebelkeit$/i.test(text)) {
    text = 'Übelkeit';
  } else if (/^erbrechen$/i.test(text)) {
    text = 'Erbrechen';
  } else if (/^durchfall$/i.test(text)) {
    text = 'Durchfall';
  } else if (/^verstopfung$/i.test(text)) {
    text = 'Verstopfung';
  } else if (/^husten(?:reiz)?$/i.test(text)) {
    text = 'Husten';
  } else if (/^schnupfen$/i.test(text)) {
    text = 'Schnupfen';
  } else if (/^herzrasen$/i.test(text) || /^herzklopfen$/i.test(text)) {
    text = 'Herzrasen / Herzklopfen';
  } else if (/^atemnot$/i.test(text) || /^kurzatmig(?:keit)?$/i.test(text)) {
    text = 'Atemnot';
  } else if (/^haut(?:ausschlag|ekzem)?$/i.test(text) || /^juckreiz$/i.test(text)) {
    text = 'Hautausschlag / Juckreiz';
  }

  // Capitalize first letter
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Splits a composite chief complaint into distinct individual complaints.
 * Handles spoken natural language, commas, semicolons, newlines, bullet points,
 * and spoken conjunctions (e.g., "aber dann habe ich auch schon...", "danach habe ich auch Knieschmerzen", "und das linke Knie...").
 */
export function splitMultipleComplaints(input: string): string[] {
  if (!input || !input.trim()) {
    return [];
  }

  const text = input.trim();

  // Multi-layer split token replacements for spoken phrases, sequential connectors, and transitions
  const splitPhrases = [
    // 1. Conversational & psychological / family transitions ("und aber irgendwie...", "aber irgendwie ist...", "mein Mann der schimpft...", "die Kinder stressen...")
    /(?:\b|\s)(?:und\s+aber\s+irgendwie(?:\s+ist)?|und\s+aber|aber\s+irgendwie\s+ist|aber\s+irgendwie|irgendwie\s+ist\s+das\s+ganze(?:\s+für\s+mich)?(?:\s+auch)?|irgendwie\s+ist|irgendwie)(?=\s+|$)/gi,
    /(?:\b|\s)(?:das\s+ganze\s+ist(?:\s+für\s+mich)?(?:\s+auch)?\s+zu\s+viel|alles\s+ist(?:\s+für\s+mich)?(?:\s+auch)?\s+zu\s+viel|alles\s+wächst\s+mir\s+über\s+den\s+kopf)(?=\s+|$)/gi,
    /(?:\b|\s)(?:mein\s+mann\s+der|mein\s+mann|meine\s+frau\s+die|meine\s+frau|mein\s+partner\s+der|mein\s+partner|meine\s+partnerin|die\s+kinder\s+stressen(?:\s+mich)?(?:\s+sehr)?|die\s+kinder)(?=\s+|$)/gi,
    /(?:\b|\s)(?:im\s+haus\s+ist\s+es|zu\s+hause\s+ist\s+es|auf\s+der\s+arbeit|im\s+beruf|in\s+der\s+familie|in\s+der\s+ehe)(?=\s+|$)/gi,

    // 2. Sequential & temporal connectors ("danach habe ich auch...", "daraufhin...", "anschließend...", "später...")
    /(?:\b|\s)(?:danach\s+habe\s+ich(?:\s+auch)?(?:\s+schon)?|danach\s+hab\s+ich(?:\s+auch)?|danach|daraufhin|im\s+anschluss|anschließend|später\s+habe\s+ich|später|zuvor)(?=\s+|$)/gi,

    // 3. Spoken transitions with "aber" / "dann" / "außerdem" / "dazu" / "zusätzlich"
    /(?:\b|\s)(?:aber\s+dann\s+habe\s+ich(?:\s+auch)?(?:\s+schon)?|dann\s+habe\s+ich(?:\s+auch)?(?:\s+schon)?|dann\s+hab\s+ich(?:\s+auch)?(?:\s+schon)?|aber\s+ich\s+habe(?:\s+auch)?|aber\s+auch|aber\s+dann|aber)(?=\s+|$)/gi,
    /(?:\b|\s)(?:dazu\s+kommt(?:\s+noch)?|dazu\s+habe\s+ich|dazu\s+hab\s+ich|dazu)(?=\s+|$)/gi,
    /(?:\b|\s)(?:außerdem\s+habe\s+ich|außerdem\s+hab\s+ich|außerdem|zusätzlich\s+habe\s+ich|zusätzlich|zudem\s+habe\s+ich|zudem|ebenso\s+habe\s+ich|ebenso|weiterhin\s+habe\s+ich|weiterhin|des\s+weiteren\s+habe\s+ich|des\s+weiteren|weiters|ferner)(?=\s+|$)/gi,
    
    // 4. Frequency & time phrases introducing new clauses: "manchmal habe ich...", "zeitweise...", "oft..."
    /(?:\b|\s)(?:manchmal\s+habe\s+ich(?:\s+auch)?(?:\s+schon)?|manchmal\s+hab\s+ich|manchmal\s+spüre\s+ich|manchmal\s+habe|zeitweise\s+habe\s+ich(?:\s+auch)?|zeitweise\s+hab\s+ich|oft\s+habe\s+ich(?:\s+auch)?|oft\s+hab\s+ich|häufig\s+habe\s+ich(?:\s+auch)?)(?=\s+|$)/gi,

    // 5. Conjunctions with pronouns / articles: "und das ...", "und die ...", "und an der ..."
    /(?:\b|\s)(?:und\s+dann\s+habe\s+ich(?:\s+auch)?(?:\s+schon)?|und\s+dann|und\s+auch\s+schon|und\s+auch|und\s+ich\s+habe\s+auch|und\s+ich\s+habe|und\s+ich\s+hab|und\s+manchmal\s+habe\s+ich(?:\s+auch)?|und\s+manchmal|und\s+zeitweise|und\s+oft)(?=\s+|$)/gi,
    /(?:\b|\s)(?:und\s+(?:das|die|der|dem|den|ein|eine|einen|einem|mein|meine|meinen|meinem|am|an\s+der|an\s+dem|im|in\s+der|in\s+dem))(?=\s+)/gi,
    
    // 6. Simple conjunctions
    /(?:\b|\s)(?:und|sowie\s+auch|sowie|sowohl\s+.*?\s+als\s+auch|plus|&|\+|and|y|et|και|и)(?=\s+|$)/gi,
    
    // 7. Structural delimiters: newlines, semicolons, bullets, slashes, pipes
    /[\n\r;•*|/\\+]+/g,
    
    // 8. Commas separating phrases or words
    /(?<=\w)\s*,\s*(?=\w)/g,
    
    // 9. Numbered lists: 1. / 2. / 1) / 2)
    /(?:^|\s+)\d+[\.\)]\s+/g,
    
    // 10. Sentence full-stops between words
    /(?<=\w)\s*\.\s+(?=[A-ZÄÖÜa-zäöü])/g,
  ];

  let normalized = text;
  splitPhrases.forEach((regex) => {
    normalized = normalized.replace(regex, ' ###SPLIT### ');
  });

  const rawSegments = normalized
    .split('###SPLIT###')
    .map((s) => s.trim())
    .filter(Boolean);

  const results: string[] = [];

  rawSegments.forEach((segment) => {
    const cleaned = cleanComplaintEntity(segment);
    // Discard empty or single-character noise
    if (cleaned && cleaned.length >= 2) {
      // Avoid exact duplicates
      const alreadyPresent = results.some(
        (existing) => existing.toLowerCase() === cleaned.toLowerCase()
      );
      if (!alreadyPresent) {
        results.push(cleaned);
      }
    }
  });

  if (results.length > 0) {
    return results;
  }

  const fallbackClean = cleanComplaintEntity(input);
  return fallbackClean ? [fallbackClean] : [input.trim()];
}

/**
 * Generates tailored questions for a single specific complaint.
 */
export function generateQuestionsForSingleComplaint(
  complaintName: string,
  complaintIndex: number = 0,
  existingQuestions?: AnamnesisQuestion[]
): AnamnesisQuestion[] {
  if (!complaintName || !complaintName.trim()) {
    return [];
  }

  const cleanName = cleanComplaintEntity(complaintName) || complaintName.trim();
  const raw = cleanName.toLowerCase();
  const matchedCategories: { key: string; def: ComplaintCategoryDef }[] = [];

  for (const [key, def] of Object.entries(COMPLAINT_ARCHETYPES)) {
    const isMatch = def.keywords.some((kw) => raw.includes(kw));
    if (isMatch) {
      matchedCategories.push({ key, def });
    }
  }

  let generated: AnamnesisQuestion[] = [];

  if (matchedCategories.length > 0) {
    // Generate archetype specific questions
    matchedCategories.forEach((match) => {
      const qs = match.def.generateQuestions(cleanName);
      generated = [...generated, ...qs];
    });
  } else {
    // Generate generic homeopathy questions tailored to this complaint name
    generated = generateGenericQuestions(cleanName);
  }

  // Tag questions with complaint metadata and unique ID prefix for this complaint index
  generated = generated.map((q, idx) => ({
    ...q,
    id: `c${complaintIndex}_${q.id}`,
    complaintName: cleanName,
    complaintIndex,
  }));

  // Preserve existing answers if matching question IDs or text are present
  if (existingQuestions && existingQuestions.length > 0) {
    const existingMap = new Map<string, AnamnesisQuestion>();
    existingQuestions.forEach((eq) => {
      existingMap.set(eq.id, eq);
      existingMap.set(eq.question, eq);
    });

    generated = generated.map((q) => {
      const match = existingMap.get(q.id) || existingMap.get(q.question);
      if (match) {
        return {
          ...q,
          answerChoice: match.answerChoice !== undefined ? match.answerChoice : q.answerChoice,
          answerMultiChoice: match.answerMultiChoice !== undefined ? match.answerMultiChoice : q.answerMultiChoice,
          answerScaleCurrent: match.answerScaleCurrent !== undefined ? match.answerScaleCurrent : q.answerScaleCurrent,
          answerScaleWorst: match.answerScaleWorst !== undefined ? match.answerScaleWorst : q.answerScaleWorst,
          answerText: match.answerText !== undefined ? match.answerText : q.answerText,
        };
      }
      return q;
    });

    // Also keep custom added questions for this complaint
    const customQuestions = existingQuestions.filter(
      (q) => q.id.startsWith('custom_') && (q.complaintIndex === complaintIndex || q.complaintName === cleanName)
    );
    if (customQuestions.length > 0) {
      generated = [...generated, ...customQuestions];
    }
  }

  return generated;
}

/**
 * Analyzes the user-entered Chief Complaint, splits into individual complaints if multiple are detected,
 * and generates separate sets of questions for each individual complaint.
 */
export function generateQuestionsForComplaint(
  chiefComplaint: string,
  existingQuestions?: AnamnesisQuestion[]
): AnamnesisQuestion[] {
  if (!chiefComplaint || !chiefComplaint.trim()) {
    return [];
  }

  const individualComplaints = splitMultipleComplaints(chiefComplaint);

  if (individualComplaints.length <= 1) {
    return generateQuestionsForSingleComplaint(individualComplaints[0] || chiefComplaint.trim(), 0, existingQuestions);
  }

  // Multiple complaints detected: generate questions for each one separately!
  let allQuestions: AnamnesisQuestion[] = [];
  individualComplaints.forEach((complaintItem, index) => {
    const questionsForThis = generateQuestionsForSingleComplaint(complaintItem, index, existingQuestions);
    allQuestions = [...allQuestions, ...questionsForThis];
  });

  return allQuestions;
}

/**
 * Summarizes the structured answers into text blocks for spontaneous report,
 * modalities better/worse, local symptoms, and Gemüt/Psyche.
 */
export function summarizeQuestionsToAnamnese(questions: AnamnesisQuestion[]): {
  summaryReport: string;
  modalitiesBetter: string;
  modalitiesWorse: string;
  localSymptoms: string;
  gemuetPsyche: string;
  chiefComplaintSummary?: string;
} {
  const reportParts: string[] = [];
  const betterParts: string[] = [];
  const worseParts: string[] = [];
  const localParts: string[] = [];
  const gemuetParts: string[] = [];

  // Group questions by complaint if there are multiple complaints
  const complaintGroups = new Map<string, AnamnesisQuestion[]>();
  questions.forEach((q) => {
    const compName = q.complaintName || 'Hauptbeschwerde';
    if (!complaintGroups.has(compName)) {
      complaintGroups.set(compName, []);
    }
    complaintGroups.get(compName)!.push(q);
  });

  complaintGroups.forEach((compQuestions, compName) => {
    const compReport: string[] = [];
    const compLocal: string[] = [];
    const compGemuet: string[] = [];
    const isMulti = complaintGroups.size > 1;

    compQuestions.forEach((q) => {
      const hasScale = q.answerScaleCurrent !== undefined || q.answerScaleWorst !== undefined;
      const hasChoice = !!q.answerChoice;
      const hasMultiChoice = q.answerMultiChoice && q.answerMultiChoice.length > 0;
      const hasText = q.answerText && q.answerText.trim().length > 0;

      if (!hasScale && !hasChoice && !hasMultiChoice && !hasText) {
        return; // not answered
      }

      // Psychological & Emotional Sphere (Gemüt / Psyche)
      const isPsycheCategory = 
        q.category?.includes('Gemüt') || 
        q.category?.includes('Psyche') || 
        q.category?.includes('Causa') || 
        q.category?.includes('Soziale') || 
        q.category?.includes('Stimmung') || 
        q.category?.includes('Belastung') ||
        q.category?.includes('Lebenssituation') ||
        q.category?.includes('Psychosomatik');

      if (isPsycheCategory) {
        if (hasChoice) compGemuet.push(`${q.category}: ${q.answerChoice}`);
        if (hasMultiChoice) compGemuet.push(`${q.category}: ${q.answerMultiChoice!.join(', ')}`);
        if (hasText) compGemuet.push(q.answerText!);
        if (hasScale) {
          const cur = q.answerScaleCurrent ? `${q.answerScaleCurrent}/4 (${SCALE_LABELS_1_TO_4[q.answerScaleCurrent]})` : '';
          const wst = q.answerScaleWorst ? `Spitze: ${q.answerScaleWorst}/4 (${SCALE_LABELS_1_TO_4[q.answerScaleWorst]})` : '';
          const scaleStr = [cur ? `Aktuell: ${cur}` : '', wst].filter(Boolean).join(' | ');
          if (scaleStr) compGemuet.push(`Seelische Belastungsskala: ${scaleStr}`);
        }
      }

      if (q.category?.includes('Zeitverlauf') || q.category?.includes('Episoden') || q.category?.includes('Ursache')) {
        if (hasChoice) compReport.push(`Verlauf: ${q.answerChoice}`);
        if (hasText) compReport.push(q.answerText!);
      }

      if (q.category?.includes('Lokalisation') || q.category?.includes('Schmerzcharakter') || q.category?.includes('Hautbild')) {
        if (hasMultiChoice) compLocal.push(`${q.category}: ${q.answerMultiChoice!.join(', ')}`);
        if (hasChoice) compLocal.push(q.answerChoice!);
        if (hasText) compLocal.push(q.answerText!);
      }

      if (q.category?.includes('Intensität') || q.category?.includes('Skala')) {
        const cur = q.answerScaleCurrent ? `${q.answerScaleCurrent}/4 (${SCALE_LABELS_1_TO_4[q.answerScaleCurrent]})` : '';
        const wst = q.answerScaleWorst ? `Spitze: ${q.answerScaleWorst}/4 (${SCALE_LABELS_1_TO_4[q.answerScaleWorst]})` : '';
        const scaleStr = [cur ? `Aktuell: ${cur}` : '', wst].filter(Boolean).join(' | ');
        if (scaleStr) compReport.push(`Intensität: ${scaleStr}`);
      }

      if (q.category?.includes('Begleitsymptome') || q.category?.includes('Auslöser') || q.category?.includes('Schlafrhythmus') || q.category?.includes('Schlafphänomene')) {
        if (hasMultiChoice) compReport.push(`${q.category}: ${q.answerMultiChoice!.join(', ')}`);
        if (hasChoice) compReport.push(`${q.category}: ${q.answerChoice}`);
        if (hasText) compReport.push(q.answerText!);
      }

      if (q.category?.includes('Modalitäten')) {
        if (hasMultiChoice) {
          q.answerMultiChoice!.forEach((opt) => {
            const prefix = isMulti ? `(${compName}) ` : '';
            if (opt.toLowerCase().includes('besser')) {
              betterParts.push(`${prefix}${opt.replace(/besser durch:?/i, '').trim()}`);
            } else if (opt.toLowerCase().includes('schlechter') || opt.toLowerCase().includes('schlimmer')) {
              worseParts.push(`${prefix}${opt.replace(/schlechter durch:?/i, '').replace(/schlimmer/i, '').trim()}`);
            } else {
              compReport.push(`Modalität: ${opt}`);
            }
          });
        }
      }
    });

    if (compReport.length > 0) {
      if (isMulti) {
        reportParts.push(`--- ${compName} ---`);
      }
      reportParts.push(compReport.join('\n'));
    }

    if (compLocal.length > 0) {
      if (isMulti) {
        localParts.push(`--- ${compName} ---`);
      }
      localParts.push(compLocal.join('\n'));
    }

    if (compGemuet.length > 0) {
      if (isMulti) {
        gemuetParts.push(`--- ${compName} ---`);
      }
      gemuetParts.push(compGemuet.join('\n'));
    }
  });

  return {
    summaryReport: reportParts.join('\n\n'),
    modalitiesBetter: betterParts.join(', '),
    modalitiesWorse: worseParts.join(', '),
    localSymptoms: localParts.join('\n\n'),
    gemuetPsyche: gemuetParts.join('\n\n'),
  };
}

