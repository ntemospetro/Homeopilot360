import { LocalizedRemedy } from '../data/materiaMedicaData';
import { BoerickeRepertorisationResult } from './boerickeRepertoryService';
import { LanguageCode } from '../types';

export interface GeniusCharacteristicProfile {
  remedyId: string;
  latinName: string;
  commonName: string;
  category: string;
  icon?: string;
  // 1. Der Kernunterschied (Das Wesen der Mittel)
  essenceText: string;
  // 2. Direkter Vergleich der 4 Säulen (Schnittstellen-Abweichung)
  pillar1Location: string;
  pillar2Sensation: string;
  pillar3Modalities: string;
  pillar4Concomitants: string;
  pillar5MindCausa: string;
  // Klinischer Prüfstein (Entscheidungskriterium)
  clinicalTouchstone: string;
}

// Curated profiles for the most significant classical remedies and polychrests
const CURATED_GENIUS_PROFILES_DE: Record<string, Partial<GeniusCharacteristicProfile>> = {
  'cantharis-vesicatoria': {
    icon: '🦂',
    essenceText: 'Hier liegt die Ursache in einer massiven Gewebeentzündung (Destruktion). Der Schmerz brennt wie Feuer, Gewebe ist heiß und geschwollen, und das Hauptzentrum liegt im Urogenitaltrakt (Blase/Niere).',
    pillar1Location: 'Magen-Darm + Blase. Der Schmerz strahlt fast immer in die Harnwege aus.',
    pillar2Sensation: 'Brennend wie Feuer, schneidend, unerträglich zerstörerisch.',
    pillar3Modalities: 'Schlimmer durch Trinken (Kaltwasser triggert Blasenkrämpfe) und beim Wasserlassen.',
    pillar4Concomitants: 'Quälender, ständiger Harndrang (tropfenweise, oft blutig) steht im Vordergrund.',
    pillar5MindCausa: 'Wütend und unruhig vor körperlicher Qual (Schmerzwahn).',
    clinicalTouchstone: 'Unaufhörlicher brennender Blasentenesmus mit tropfenweisem blutigem Urinieren.'
  },
  'cantharis': {
    icon: '🦂',
    essenceText: 'Hier liegt die Ursache in einer massiven Gewebeentzündung (Destruktion). Der Schmerz brennt wie Feuer, Gewebe ist heiß und geschwollen, und das Hauptzentrum liegt im Urogenitaltrakt (Blase/Niere).',
    pillar1Location: 'Magen-Darm + Blase. Der Schmerz strahlt fast immer in die Harnwege aus.',
    pillar2Sensation: 'Brennend wie Feuer, schneidend, unerträglich zerstörerisch.',
    pillar3Modalities: 'Schlimmer durch Trinken (Kaltwasser triggert Blasenkrämpfe) und beim Wasserlassen.',
    pillar4Concomitants: 'Quälender, ständiger Harndrang (tropfenweise, oft blutig) steht im Vordergrund.',
    pillar5MindCausa: 'Wütend und unruhig vor körperlicher Qual (Schmerzwahn).',
    clinicalTouchstone: 'Unaufhörlicher brennender Blasentenesmus mit tropfenweisem blutigem Urinieren.'
  },
  'chamomilla': {
    icon: '🌼',
    essenceText: 'Hier liegt die Ursache in einer massiven Nervenüberempfindlichkeit (Dysregulation). Der Schmerz entsteht meist durch Emotionen (Zorn, Ärger) oder das Nervensystem (Zahnung). Das Gewebe selbst ist oft intakt, aber der Patient hält den Schmerz nicht aus.',
    pillar1Location: 'Reiner Magen-Darm-Trakt. Keine zwingende Beteiligung der Harnwege.',
    pillar2Sensation: 'Krampfartig, reißend, wehenartig, unerträglich schmerzhaft.',
    pillar3Modalities: 'Besser durch ständige Bewegung (z. B. Umhertragen bei Kindern) oder feuchte Wärme.',
    pillar4Concomitants: 'Grünlicher Stuhl (wie gehackter Spinat), der nach faulen Eiern riecht. Eine Wange rot, eine blass.',
    pillar5MindCausa: 'Wütend, ungeduldig und bösartig durch Zorn / Kränkung.',
    clinicalTouchstone: 'Unerträglichkeit der Schmerzen, Zorn-Reaktion und momentane Besserung nur durch Umhertragen.'
  },
  'matricaria-chamomilla': {
    icon: '🌼',
    essenceText: 'Hier liegt die Ursache in einer massiven Nervenüberempfindlichkeit (Dysregulation). Der Schmerz entsteht meist durch Emotionen (Zorn, Ärger) oder das Nervensystem (Zahnung). Das Gewebe selbst ist oft intakt, aber der Patient hält den Schmerz nicht aus.',
    pillar1Location: 'Reiner Magen-Darm-Trakt. Keine zwingende Beteiligung der Harnwege.',
    pillar2Sensation: 'Krampfartig, reißend, wehenartig, unerträglich schmerzhaft.',
    pillar3Modalities: 'Besser durch ständige Bewegung (z. B. Umhertragen bei Kindern) oder feuchte Wärme.',
    pillar4Concomitants: 'Grünlicher Stuhl (wie gehackter Spinat), der nach faulen Eiern riecht. Eine Wange rot, eine blass.',
    pillar5MindCausa: 'Wütend, ungeduldig und bösartig durch Zorn / Kränkung.',
    clinicalTouchstone: 'Unerträglichkeit der Schmerzen, Zorn-Reaktion und momentane Besserung nur durch Umhertragen.'
  },
  'aconitum-napellus': {
    icon: '⚡',
    essenceText: 'Akuter, stürmischer Schockzustand nach Kälteeinwirkung oder Schreck. Arterielle Hyperämie mit massiver sympathischer Übererregung VOR Exsudation oder Gewebsschädigung.',
    pillar1Location: 'Herz-Kreislauf, Kopf, Atemwege, seröse Häute. Keine fokussierten Organeiterungen.',
    pillar2Sensation: 'Unerträglich reißend, brennend, schneidend, gefolgt von Kribbeln und Taubheitsgefühl.',
    pillar3Modalities: 'Schlimmer gegen Mitternacht, Kaltluft, Geräusche, Licht. Besser durch Ruhe und warmen Schweiß.',
    pillar4Concomitants: 'Heißes, trockenes Gesicht (wird beim Aufsetzen blass), großer Durst auf kaltes Wasser, harter schneller Puls.',
    pillar5MindCausa: 'Panische Todesangst, extreme motorische Unruhe, Vorhersage des Todeszeitpunkts.',
    clinicalTouchstone: 'Plötzlicher Beginn nach kaltem Wind + panische Todesangst + heiß-trockene Haut.'
  },
  'belladonna': {
    icon: '🔥',
    essenceText: 'Akute, hochgradige zerebrale und vaskuläre Kongestion mit pochender Hitze. Plötzliches Kommen und Gehen der Schmerzkrisen; rote, glühende Haut ohne Schweiß.',
    pillar1Location: 'Gehirn, Meninges, Rachen, rechte Seite. Starke Affinität zu Gefäßen und Kopf.',
    pillar2Sensation: 'Klopfend, pulsierend, hämmernd, brennend wie Feuer; Schmerz kommt und vergeht blitzartig.',
    pillar3Modalities: 'Schlimmer durch geringste Erschütterung, Licht, Geräusche, Kälte, Berührung. Besser durch aufrechtes Sitzen.',
    pillar4Concomitants: 'Glühend rotes Gesicht, weite Pupillen, pochende Karotiden, Erdbeerzunge, Schweiß nur am bedeckten Körper.',
    pillar5MindCausa: 'Wildes Delirium, Halluzinationen (schwarze Hunde, Gespenster), Beißlust, Fluchtversuche.',
    clinicalTouchstone: 'Pulsierende Schmerzen mit glühender Hitze, weiten Pupillen und Erschütterungsempfindlichkeit.'
  },
  'arsenicum-album': {
    icon: '❄️',
    essenceText: 'Tiefgreifender vitaler Verfall mit Zersetzungsprozessen und Gewebsnekrose. Paradoxie: Brennende Schmerzen, die durch äußere Hitze dramatisch gebessert werden.',
    pillar1Location: 'Magen-Darm-Trakt, Schleimhäute, Herz, rechte Lunge, Haut.',
    pillar2Sensation: 'Brennend wie glühende Kohlen, nagend, stechend.',
    pillar3Modalities: 'Schlimmer nach Mitternacht (1:00–2:00 Uhr), Kälte. Deutlich besser durch Hitze, heiße Umschläge und heiße Getränke.',
    pillar4Concomitants: 'Häufiger Durst auf kleine Schlückchen kalten Wassers (wird sofort erbrochen), stinkende wässrige Durchfälle, Kachexie.',
    pillar5MindCausa: 'Todesangst, quälende Ruhelosigkeit (treibt von Bett zu Bett), übertriebene Ordnungsliebe, Verzweiflung.',
    clinicalTouchstone: 'Brennende Schmerzen, gebessert durch Hitze + Durst auf kleine Schlucke + 1–2 Uhr Verschlimmerung.'
  },
  'nux-vomica': {
    icon: '☕',
    essenceText: 'Spastische Dysregulation und Überreizung des Nervensystems durch Stimulanzien, Genussmittel oder Stress. Ineffektiver, verkrampfter Drang auf allen vegetativen Ebenen.',
    pillar1Location: 'Magen-Darm-Kanal, Leber, vegetatives Nervensystem, Rückenmark.',
    pillar2Sensation: 'Krampfartig, kneifend, zusammenschnürend, dumpf drückend wie ein Stein.',
    pillar3Modalities: 'Schlimmer am frühen Morgen (4:00 Uhr), durch Kälte, Zugluft, nach dem Essen. Besser durch Wärme und kurzen Schlaf.',
    pillar4Concomitants: 'Vergeblicher Stuhldrang, ständiges Frösteln schon beim geringsten Entblößen, saures Aufstoßen.',
    pillar5MindCausa: 'Cholerisch, reizbar, ungeduldig, überempfindlich gegen Licht/Lärm, verträgt keinen Widerspruch.',
    clinicalTouchstone: 'Ineffektiver Stuhl- und Harndrang mit Frösteln und extrem gereiztem Gemüt.'
  },
  'bryonia-alba': {
    icon: '🌵',
    essenceText: 'Akute Entzündung seröser Häute mit ausgeprägter Trockenheit aller Schleimhäute. Jede noch so minimale Bewegung ist unerträglich schmerzhaft.',
    pillar1Location: 'Seröse Häute (Pleura, Peritonäum, Meningen), Gelenke, Leber, Lunge (vorwiegend rechts).',
    pillar2Sensation: 'Stechend, reißend, wie Nadelstiche bei der geringsten Bewegung.',
    pillar3Modalities: 'Schlimmer durch geringste Bewegung, Wärme, tiefes Einatmen. Besser durch absolute Ruhe und festen Druck (Liegen auf der schmerzhaften Seite).',
    pillar4Concomitants: 'Großer Durst auf große Mengen kalten Wassers in langen Abständen; trockener, wie verbrannter Stuhl; trockene Lippen.',
    pillar5MindCausa: 'Möchte nach Hause (auch wenn zu Hause), redet über geschäftliche Sorgen, will völlig in Ruhe gelassen werden.',
    clinicalTouchstone: 'Stechende Schmerzen bei geringster Bewegung, gebessert durch festen Druck und absolute Ruhe.'
  },
  'rhus-toxicodendron': {
    icon: '🌿',
    essenceText: 'Erkrankungen des fibrösen Gewebes infolge Durchnässung oder Verkühlung nach Überanstrengung. Beginn der Bewegung ist schmerzhaft, fortgesetzte Bewegung lindert.',
    pillar1Location: 'Sehnen, Bänder, Faszien, Gelenke, Haut (Bläschenausschlag).',
    pillar2Sensation: 'Steifheit, Zerschlagenheitsgefühl, wie verstaucht oder verrenkt.',
    pillar3Modalities: 'Schlimmer zu Beginn der Bewegung, in Ruhe, durch feuchte Kälte. Besser durch fortgesetzte Bewegung, Wärme, trockenes Wetter.',
    pillar4Concomitants: 'Rotes Dreieck an der Zungenspitze, juckende Bläschen auf der Haut, Schüttelfrost beim Entblößen.',
    pillar5MindCausa: 'Körperliche Unruhe, muss die Lage im Bett ständig wechseln, um Schmerzlinderung zu finden.',
    clinicalTouchstone: 'Schmerzhaftes Anlaufen, Besserung durch fortgesetzte Bewegung, Verlangen nach heißem Bad.'
  },
  'pulsatilla-pratensis': {
    icon: '🌸',
    essenceText: 'Venöse Stauung und katarrhalische Schleimhautentzündungen mit wechselhaftem Charakter. Milde, nachgiebige Natur mit starkem Trost- und Frischluftbedürfnis.',
    pillar1Location: 'Venensystem, Schleimhäute (Auge, Ohr, Nase, Genitaltrakt), wandernde Gelenkbeschwerden.',
    pillar2Sensation: 'Ziehend, reißend, plötzlich den Ort wechselnd; Schweregefühl und Stauungsschmerz.',
    pillar3Modalities: 'Schlimmer im warmen stickigen Raum, gegen Abend, nach fettem Essen. Besser an kühler frischer Luft und bei sanfter Bewegung.',
    pillar4Concomitants: 'Dicke, milde, gelb-grüne Absonderungen; völlige Durstlosigkeit bei allen Beschwerden; wandernde Symptome.',
    pillar5MindCausa: 'Sanftmütig, weint leicht, sucht Trost und wird durch Zuspruch gebessert; abneigend gegen Alleinsein.',
    clinicalTouchstone: 'Völlige Durstlosigkeit, Besserung an frischer Luft, Verschlimmerung im warmen Zimmer.'
  },
  'apis-mellifica': {
    icon: '🐝',
    essenceText: 'Plötzliche seröse Exsudation mit glasigen, ödematösen Schwellungen (wie Bienenstich). Brennend-stechende Schmerzen mit extremer Berührungsempfindlichkeit.',
    pillar1Location: 'Zellgewebe (Ödeme), seröse Häute, Kehlkopf, rechte Ovarie, Harnwege.',
    pillar2Sensation: 'Stechend wie glühende Nadeln, brennend, berührungsempfindlich wie wund.',
    pillar3Modalities: 'Schlimmer durch jede Form von Wärme, Berührung, Druck, Nachmittag (16 Uhr). Besser durch eiskalte Umschläge und Kaltwasser.',
    pillar4Concomitants: 'Wächserne blass-rosige Ödeme; spärlicher, heißer Urin; völlige Durstlosigkeit trotz Hitzegefühl.',
    pillar5MindCausa: 'Eifersüchtig, ungeschickt (lässt Dinge fallen), weinerlich ohne erkennbaren Grund, plötzliche Schreie im Schlaf.',
    clinicalTouchstone: 'Brennend-stechende Schmerzen, Ödeme, Durstlosigkeit und Besserung durch Eiskälte.'
  },
  'hepar-sulphuris': {
    icon: '🛡️',
    essenceText: 'Eiterungsbereitschaft und extreme Überempfindlichkeit gegen Kälte und Berührung. Jede Wunde eitert; Schmerz wie von einem Splitter.',
    pillar1Location: 'Lymphknoten, Mandeln, Atemwege, Haut, Bindegewebe.',
    pillar2Sensation: 'Stechend wie ein Holzsplitter oder eine Fischgräte; berührungsempfindlich.',
    pillar3Modalities: 'Schlimmer durch geringste Kälte, Zugluft, Entblößen. Besser durch Wärme, feucht-warmes Wetter, Einhüllen des Kopfes.',
    pillar4Concomitants: 'Saures, stinkendes Schwitzen ohne Besserung; dicke, käsige Eiterabsonderungen; Reizhusten bei Kaltluft.',
    pillar5MindCausa: 'Extrem reizbar, ungeduldig, gewalttätig, flucht bei Schmerz, verträgt keine Kälte.',
    clinicalTouchstone: 'Splitterschmerz, extreme Kälteüberempfindlichkeit und Eiterungsneigung.'
  },
  'mercurius-solubilis': {
    icon: '💧',
    essenceText: 'Subakute und chronische Zersetzungsprozesse mit Schleimhautulzerationen und profusen Ausscheidungen. Das Mittel des extremen Quecksilber-Prinzips: Weder Kälte noch Wärme wird vertragen.',
    pillar1Location: 'Schleimhäute, Mundhöhle, Speicheldrüsen, Lymphknoten, Knochen.',
    pillar2Sensation: 'Brennend, faulig, tief stechend, reißend in den Knochen.',
    pillar3Modalities: 'Schlimmer nachts, im warmen Bett, durch Schweiß, bei feuchter Kälte und Hitze. Kein Besserungsfaktor außer Mäßigung.',
    pillar4Concomitants: 'Starker Speichelfluss mit fauligem Mundgeruch, schlaffe Zunge mit Zahnabdrücken, nächtliche Schweiße.',
    pillar5MindCausa: 'Misstrauisch, ängstlich, hastig beim Sprechen, geistige Verlangsamung.',
    clinicalTouchstone: 'Nachtverschlimmerung, Speichelfluss mit Zahnabdrücken und Schweiß, der nicht erleichtert.'
  },
  'colocynthis': {
    icon: '🍈',
    essenceText: 'Heftigste krampfartige Spasmen der glatten Muskulatur, meist ausgelöst durch Zorn, Ärger oder Kränkung. Starkes Verlangen nach doppeltem Zusammenkrümmen.',
    pillar1Location: 'Magen-Darm-Trakt, N. ischiadicus, Beckenorgane.',
    pillar2Sensation: 'Krampfartig, schneidend wie mit Messern, einklemmend.',
    pillar3Modalities: 'Schlimmer durch Ärger, Aufrichten, Essen. Besser durch starkes Zusammenkrümmen, festen Druck und Wärme.',
    pillar4Concomitants: 'Wässrige Stühle nach dem geringsten Bissen oder Schluck, Erbrechen von Galle bei Zorn.',
    pillar5MindCausa: 'Zornig, indigniert, wirft Gegenstände weg, will nicht angesprochen werden.',
    clinicalTouchstone: 'Erleichterung der Schmerzkrämpfe nur durch festen Druck und Vorüberbeugen (Zusammenkrümmen).'
  },
  'arnica-montana': {
    icon: '🌻',
    essenceText: 'Traumafolge und kapilläre Blutungsneigung. Gefäßatonie mit Extravasaten; das Bett fühlt sich überall zu hart an.',
    pillar1Location: 'Blutkapillaren, Muskeln, Weichteile, Gehirn (nach Trauma).',
    pillar2Sensation: 'Wie zerschlagen, geprellt, lahm, wund.',
    pillar3Modalities: 'Schlimmer durch Berührung, Bewegung, Erschütterung. Besser durch Liegen mit tiefem Kopf, Ruhe.',
    pillar4Concomitants: 'Kopf heiß, Körper kalt; Hämatome; Bett ist zu hart; behauptet beharrlich, es fehle ihm nichts.',
    pillar5MindCausa: 'Reizbar, schickt den Arzt weg, will in Ruhe gelassen werden, Angst vor Annäherung.',
    clinicalTouchstone: 'Zerschlagenheitsgefühl, Bett ist zu hart + Traumaanamnese + Angst vor Berührung.'
  },
  'gelsemium-sempervirens': {
    icon: '🍂',
    essenceText: 'Paralytische Schwäche und motorisch-sensorische Lähmigkeit infolge von Schreck, schlechten Nachrichten oder Grippeinfekten. Schweregefühl und Zittern.',
    pillar1Location: 'Nervensystem, Hirnstamm, Augenmuskeln, Zirkulation.',
    pillar2Sensation: 'Dumpfe Schwere, wie ein Band um den Kopf, Muskelzittern.',
    pillar3Modalities: 'Schlimmer durch Emotionen, Schreck, feuchte Wärme, Vorfreude. Besser durch reichliches Wasserlassen, Bewegung.',
    pillar4Concomitants: 'Schwere Augenlider (kann Augen kaum offen halten), völlige Durstlosigkeit, Muskelzittern vor Erschöpfung.',
    pillar5MindCausa: 'Apathisch, stumpf, Prüfungsangst mit Durchfall, Verlangen nach Ruhe.',
    clinicalTouchstone: 'Schwere Augenlider, Benommenheit, motorisches Zittern und Durstlosigkeit.'
  },
  'ignatia-amara': {
    icon: '💔',
    essenceText: 'Hysterische und paradoxe Symptomwechsel nach akutem Kummer, Schock oder Enttäuschung. Spasmen der Hohlorgane mit tiefem Seufzen.',
    pillar1Location: 'Zentralnervensystem, emotionale Sphäre, Rachen (Globusgefühl).',
    pillar2Sensation: 'Kloßgefühl im Hals, krampfartig, paradox (Halsschmerz bessert sich beim Schlucken fester Nahrung).',
    pillar3Modalities: 'Schlimmer durch Trost, Kaffee, Tabakrauch, Kummer. Besser durch tiefes Seufzen, Lageveränderung.',
    pillar4Concomitants: 'Häufiges tiefes Seufzen, Schluckauf, paradoxe Reaktionen (Kopfschmerz gebessert durch Vorbeugen).',
    pillar5MindCausa: 'Stiller Kummer, weint heimlich, wechselhafte Stimmung von Weinen zu hysterischem Lachen.',
    clinicalTouchstone: 'Paradoxe Modalitäten, tiefes Seufzen und Beschwerden nach akutem Kummer.'
  },
  'veratrum-album': {
    icon: '🧊',
    essenceText: 'Akuter kardiovaskulärer Kollapszustand mit profusen Absonderungen auf allen Ebenen und eisiger Kälte. Kalter Schweiß auf der Stirn.',
    pillar1Location: 'Gastrointestinaltrakt, Kreislauf, sympathisches Nervensystem.',
    pillar2Sensation: 'Krampfartig, schneidend, brennend mit innerer Kälte.',
    pillar3Modalities: 'Schlimmer durch geringste Bewegung, Trinken, Kälte. Besser durch Wärme, Liegen.',
    pillar4Concomitants: 'Kalter Schweiß besonders auf der Stirn, unstillbares Erbrechen und wässriger Durchfall gleichzeitig, Heißhunger auf Eis.',
    pillar5MindCausa: 'Kollaps, Manie, religiöser Wahn, Fluchen, Gefühl von Wertlosigkeit.',
    clinicalTouchstone: 'Kalter Schweiß auf der Stirn + gleichzeitiges Erbrechen und Durchfall mit Kollapsneigung.'
  }
};

/**
 * Builds a comprehensive Genius profile for a remedy.
 * It first checks if a curated profile exists.
 * If not, it intelligently extracts and synthesizes the Genius characteristic
 * from the remedy's Materia Medica data (essence, keynotes, modalities, sphereOfAction, mindEmotional)
 * and the specific repertorisation hits.
 */
export function buildGeniusProfile(
  remedyResult: BoerickeRepertorisationResult,
  language: LanguageCode = 'de'
): GeniusCharacteristicProfile {
  const remedy = remedyResult.remedy;
  const id = remedy.id;
  const normalizedId = id.toLowerCase();

  const curated = CURATED_GENIUS_PROFILES_DE[normalizedId];

  // Derive base fields
  const latinName = remedy.latinName;
  const commonName = remedy.commonName || remedy.latinName;
  const category = remedy.category || 'Homöopathisches Mittel';

  // 1. Essence / Wesen (genius_charakteristik)
  let essenceText = curated?.essenceText;
  if (!essenceText) {
    if (remedy.essence && remedy.essence.trim().length > 10) {
      essenceText = remedy.essence.trim();
    } else if (remedy.mainIndications && remedy.mainIndications.length > 0) {
      essenceText = `Klinisches Wirkzentrum liegt in ${remedy.mainIndications.slice(0, 2).join(' sowie ')}. Reagiert primär mit funktioneller und struktureller Irritation.`;
    } else {
      essenceText = `Arzneidynamischer Genius nach den klassischen Prüfungen: Spezifische Affinität mit charakteristischer Reaktionsweise.`;
    }
  }

  // 2. Pillar 1: Location / Organfokus
  let pillar1Location = curated?.pillar1Location;
  if (!pillar1Location) {
    if (remedy.sphereOfAction && remedy.sphereOfAction.length > 0) {
      pillar1Location = remedy.sphereOfAction.join(' • ');
    } else {
      pillar1Location = 'Allgemeine vegetative und organische Affinität nach den klassischen Autoren.';
    }
  }

  // 3. Pillar 2: Sensation / Schmerzcharakter
  let pillar2Sensation = curated?.pillar2Sensation;
  if (!pillar2Sensation) {
    if (remedy.keynotes && remedy.keynotes.length > 0) {
      pillar2Sensation = remedy.keynotes.slice(0, 3).join('; ');
    } else {
      pillar2Sensation = 'Charakteristische Leitempfindungen und Schmerzphänomene nach Boericke/Kent.';
    }
  }

  // 4. Pillar 3: Modalities / Schlüssel-Modalitäten
  let pillar3Modalities = curated?.pillar3Modalities;
  if (!pillar3Modalities) {
    const worse = remedy.modalitiesWorse && remedy.modalitiesWorse.length > 0
      ? `< Schlimmer: ${remedy.modalitiesWorse.slice(0, 2).join(', ')}`
      : '';
    const better = remedy.modalitiesBetter && remedy.modalitiesBetter.length > 0
      ? `> Besser: ${remedy.modalitiesBetter.slice(0, 2).join(', ')}`
      : '';
    
    if (worse && better) {
      pillar3Modalities = `${worse} | ${better}`;
    } else if (worse) {
      pillar3Modalities = worse;
    } else if (better) {
      pillar3Modalities = better;
    } else {
      pillar3Modalities = 'Charakteristische Besserungs- und Verschlimmerungsfaktoren.';
    }
  }

  // 5. Pillar 4: Concomitants / Begleitsymptome
  let pillar4Concomitants = curated?.pillar4Concomitants;
  if (!pillar4Concomitants) {
    if (remedy.mainIndications && remedy.mainIndications.length > 0) {
      pillar4Concomitants = remedy.mainIndications.slice(0, 2).join('; ');
    } else {
      pillar4Concomitants = 'Typische vegetative und somatische Begleitphänomene.';
    }
  }

  // 6. Pillar 5: Mind & Causa / Gemütszustand
  let pillar5MindCausa = curated?.pillar5MindCausa;
  if (!pillar5MindCausa) {
    if (remedy.mindEmotional && remedy.mindEmotional.trim().length > 3) {
      pillar5MindCausa = remedy.mindEmotional.trim();
    } else {
      pillar5MindCausa = 'Spezifischer Gemütszustand und affektive Reaktionsmuster.';
    }
  }

  // 7. Touchstone
  let clinicalTouchstone = curated?.clinicalTouchstone;
  if (!clinicalTouchstone) {
    if (remedy.keynotes && remedy.keynotes.length > 0) {
      clinicalTouchstone = remedy.keynotes[0];
    } else if (remedy.modalitiesBetter && remedy.modalitiesBetter.length > 0) {
      clinicalTouchstone = `Eindeutige Besserung durch: ${remedy.modalitiesBetter[0]}`;
    } else {
      clinicalTouchstone = `Typische Simile-Gesamtheit nach Hahnemann & Kent.`;
    }
  }

  return {
    remedyId: id,
    latinName,
    commonName,
    category,
    icon: curated?.icon || '⚖️',
    essenceText,
    pillar1Location,
    pillar2Sensation,
    pillar3Modalities,
    pillar4Concomitants,
    pillar5MindCausa,
    clinicalTouchstone
  };
}

/**
 * Builds all profiles for the full match results in the current repertorisation.
 */
export function buildAllGeniusProfiles(
  fullMatchResults: BoerickeRepertorisationResult[],
  language: LanguageCode = 'de'
): GeniusCharacteristicProfile[] {
  return fullMatchResults.map(res => buildGeniusProfile(res, language));
}
