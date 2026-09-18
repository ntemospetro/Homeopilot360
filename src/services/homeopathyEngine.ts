import { PatientCase } from '../types';

export interface HomeoRemedyResult {
  name: string;
  potency: string;
  score: number;
  grade: 'Erstmittel' | 'Folgemittel' | 'Differenzialmittel';
  keyIndicators: string[];
  description: string;
  modalitiesMatch: string[];
  materiaMedicaHint: string;
  tagesdosis?: string;
  haeufigkeit?: string;
  anwendungsdauer?: string;
  zeitraum?: string;
  einnahmehinweis?: string;
}

// Modular Repertorisation Database & Matcher
export function runHomeopathyAnalysis(caseData: Partial<PatientCase>): HomeoRemedyResult[] {
  const questionsText = (caseData.anamnesisQuestions || [])
    .map((q) => {
      const parts = [
        q.question,
        q.answerChoice || '',
        (q.answerMultiChoice || []).join(' '),
        q.answerText || '',
        q.answerScaleCurrent ? `Skala aktuell ${q.answerScaleCurrent}` : '',
        q.answerScaleWorst ? `Skala schlimmsten Fall ${q.answerScaleWorst}` : '',
      ];
      return parts.join(' ');
    })
    .join(' ');

  const combinedText = `
    ${caseData.hauptbeschwerde || ''} 
    ${caseData.spontanbericht || ''} 
    ${caseData.modalitaetenBesser || ''} 
    ${caseData.modalitaetenSchlechter || ''} 
    ${caseData.gemuetPsyche || ''} 
    ${caseData.koerperAllgemein || ''} 
    ${caseData.lokalsymptome || ''}
    ${questionsText}
  `.toLowerCase();

  const results: HomeoRemedyResult[] = [];

  // Match rules for common polychrests and psychological/constitutional remedies
  if (combinedText.includes('sepia') || combinedText.includes('haus') || combinedText.includes('haushalt') || combinedText.includes('familie') || combinedText.includes('kinder') || combinedText.includes('ausgelaugt') || combinedText.includes('überlastung') || combinedText.includes('gleichgültig') || (combinedText.includes('kopf') && combinedText.includes('stress'))) {
    results.push({
      name: 'Sepia officinalis (Tintenfisch)',
      potency: 'C200 oder LM VI',
      score: 96,
      grade: 'Erstmittel',
      keyIndicators: [
        'Häusliche Überlastung & Erschöpfung durch Familie/Pflichten',
        'Gefühl, dass alles im Haus zu viel ist / Verlangen nach Alleinsein',
        'Reizbarkeit & Dünnhäutigkeit gegenüber den Liebsten',
        'Spannungskopfschmerz & psychosomatische Erschöpfung',
      ],
      description: 'Haupthomöopathisches Mittel bei chronischer Überforderung im häuslichen Umfeld, Müttern/Partnern mit Dauerstress durch Kinder und Haushalt, emotionaler Abstumpfung und körperlicher Erschöpfung.',
      modalitiesMatch: [
        'Besser durch zügige Bewegung, Sport & Alleinsein',
        'Schlechter durch Trost, häusliche Routine & vor der Menstruation',
      ],
      materiaMedicaHint: 'Klassisches Tiefenmittel nach Samuel Hahnemann für seelische und hormonelle Erschöpfungszustände.',
      tagesdosis: '1 Einmalgabe à 3–5 Globuli (bzw. bei LM-Potenz 3 Tropfen in 1 Glas Wasser)',
      haeufigkeit: 'Einmalige Gabe morgens nüchtern (oder 1x täglich 1 TL der Wasserverdünnung)',
      anwendungsdauer: 'Einmalgabe (bei LM-Potenz: 7–14 Tage, bei spürbarer Besserung pausieren)',
      zeitraum: 'Initialphase (Reaktionsbeobachtung über 4–6 Wochen bis zur Folgeanamnese)',
      einnahmehinweis: 'Globuli sublingual langsam unter der Zunge zergehen lassen. Mindestens 15 Minuten Abstand zu Mahlzeiten, Kaffee und Pfefferminze/Menthol.',
    });
  }

  if (combinedText.includes('staphisagria') || combinedText.includes('schimpf') || combinedText.includes('streit') || combinedText.includes('kränkung') || combinedText.includes('unterdrückt') || combinedText.includes('vorwurf') || combinedText.includes('ärger') || combinedText.includes('wut') || combinedText.includes('demütigung')) {
    results.push({
      name: 'Staphisagria (Stephanskraut)',
      potency: 'C30 bis C200',
      score: 94,
      grade: 'Erstmittel',
      keyIndicators: [
        'Folgen von Schimpfen, Vorwürfen, Kränkung und Demütigung',
        'Unterdrückter Zorn & Empörung (muss Ärger herunterschlucken)',
        'Kopfschmerzen & Zittern nach Streit oder ungerechter Behandlung',
        'Hochgradige Kränkbarkeit bei Kritik',
      ],
      description: 'Zentrales Heilmittel bei Beschwerden durch partnerschaftliche Konflikte, andauernde Vorwürfe ("Mann schimpft den ganzen Tag"), unterdrückte Wut und psychosomatische Kopf- oder Magenschmerzen.',
      modalitiesMatch: [
        'Schlechter durch Streit, Zurechtweisung, Demütigung & Berührung',
        'Besser durch Ruhe, Wärme & ungestörten Schlaf',
      ],
      materiaMedicaHint: 'Spezifisches Heilmittel für somatisierte seelische Verletzungen und gestautes Ehrgefühl.',
      tagesdosis: '1 Gabe à 3–5 Globuli (bei C30) bzw. Einmalgabe (bei C200)',
      haeufigkeit: '1-mal täglich (vorzugsweise abends oder unmittelbar nach akuter Belastung)',
      anwendungsdauer: '3 bis maximal 5 Tage (nach Hahnemann: bei spürbarer Entlastung sofort absetzen)',
      zeitraum: 'Akutphase / Konfliktverarbeitungsphase über 1–2 Wochen',
      einnahmehinweis: 'Sublingual einnehmen. Nicht unmittelbar vor oder nach dem Zähneputzen (mentholfrei halten).',
    });
  }

  if (combinedText.includes('ignatia') || combinedText.includes('kummer') || combinedText.includes('trauer') || combinedText.includes('kloß') || combinedText.includes('seufz') || combinedText.includes('enttäusch') || combinedText.includes('stiller')) {
    results.push({
      name: 'Ignatia amara (Ignatiusbohne)',
      potency: 'C30 oder C200',
      score: 92,
      grade: 'Erstmittel',
      keyIndicators: [
        'Stiller Kummer & Liebeskummer / Enttäuschung in der Beziehung',
        'Kloßgefühl im Hals (Globusgefühl) & häufiges tiefes Seufzen',
        'Widersprüchliche & paradoxe Symptome',
        'Stimmungsschwankungen (Lachen wechselt rasch mit Weinen)',
      ],
      description: 'Hauptmittel bei akutem emotionalem Stress, Trauer, partnerbezogenen Enttäuschungen und nervöser Überreizung.',
      modalitiesMatch: [
        'Schlechter durch Trost, Kaffee & Tabakrauch',
        'Besser durch Ablenkung, Essen fester Nahrung & tiefes Einatmen',
      ],
      materiaMedicaHint: 'Akutes Gemütsmittel ersten Ranges; führt zu rascher emotionaler Stabilisierung.',
      tagesdosis: '1 bis maximal 2 Gaben à 3 Globuli',
      haeufigkeit: '1- bis 2-mal täglich bei akuter emotionaler Krise / Seufzen',
      anwendungsdauer: '3 bis 5 Tage (nur solange akute Überreizung besteht)',
      zeitraum: 'Akutintervention (Tag 1–7)',
      einnahmehinweis: 'Unter der Zunge zergehen lassen. Kaffee und andere Stimulanzien meiden.',
    });
  }

  if (combinedText.includes('cocculus') || combinedText.includes('pflege') || combinedText.includes('schlafmangel') || combinedText.includes('nachtwache') || combinedText.includes('schwindel') || combinedText.includes('sorgen um andere')) {
    results.push({
      name: 'Cocculus indicus (Kockelskörner)',
      potency: 'C30',
      score: 87,
      grade: 'Differenzialmittel',
      keyIndicators: [
        'Erschöpfung nach Schlafmangel und Aufopferung für die Familie',
        'Schwindel und Schweregefühl im Hinterkopf',
        'Körperliche Schwäche mit innerem Zittern',
      ],
      description: 'Ideal bei pflegenden Angehörigen oder Eltern, die durch Schlafmangel und ununterbrochene Fürsorge für Kinder/Angehörige ausgebrannt sind.',
      modalitiesMatch: ['Schlechter durch Schlafmangel & Bewegung', 'Besser im Liegen & durch Wärme'],
      materiaMedicaHint: 'Spezifisch für vegetative Dystonie nach chronischem Schlafmangel.',
      tagesdosis: '1 Gabe à 3–5 Globuli',
      haeufigkeit: '1-mal täglich morgens nach unruhiger Nacht',
      anwendungsdauer: '4 bis 7 Tage',
      zeitraum: 'Erholungsphase (Woche 1–2)',
      einnahmehinweis: 'Sublinguale Einnahme; mit ausreichender Ruhe und Entlastung kombinieren.',
    });
  }

  if (combinedText.includes('migräne') || combinedText.includes('salz') || combinedText.includes('trost') || combinedText.includes('sonne') || combinedText.includes('zurückhaltend') || combinedText.includes('verschlossen')) {
    results.push({
      name: 'Natrium muriaticum',
      potency: 'C200 oder LM VI',
      score: 90,
      grade: 'Erstmittel',
      keyIndicators: ['Rechtsseitige periodische Schmerzen', 'Salzhunger', 'Abneigung gegen Trost', 'Lichtempfindlichkeit'],
      description: 'Häufiges Konstitutionsmittel bei chronischen Kopfschmerzen, Trauer, emotionaler Verschlossenheit und Lichtempfindlichkeit.',
      modalitiesMatch: ['Schlechter durch Sonne & Hitze', 'Besser durch Liegen im Dunkeln & festen Druck'],
      materiaMedicaHint: 'Klassisches Tiefenmittel nach Hahnemann. Passt besonders zu sensiblen, pflichtbewussten Patienten.',
      tagesdosis: '1 Einmalgabe à 3–5 Globuli (C200) bzw. tägl. 1 TL Wasserverdünnung (LM VI)',
      haeufigkeit: 'Einmalige Gabe morgens (oder nach LM-Verordnung)',
      anwendungsdauer: 'Einmalgabe; Verlauf 3 bis 6 Wochen beobachten',
      zeitraum: 'Konstitutionsintervall (4–8 Wochen bis zum Kontrolltermin)',
      einnahmehinweis: 'Sublingual zergehen lassen. 20 Minuten Abstand zu Speisen und Getränken.',
    });
  }

  if (combinedText.includes('plötzlich') || combinedText.includes('rot') || combinedText.includes('pulsier') || combinedText.includes('hitze') || combinedText.includes('pochend') || combinedText.includes('fieber')) {
    results.push({
      name: 'Belladonna (Atropa belladonna)',
      potency: 'C30',
      score: 88,
      grade: 'Erstmittel',
      keyIndicators: ['Plötzlicher Beginn', 'Klopfende Schmerzen', 'Heißer Kopf', 'Weite Pupillen'],
      description: 'Akutes Hauptmittel bei stürmischem Krankheitsbeginn, starker Kongestion und Überempfindlichkeit aller Sinne.',
      modalitiesMatch: ['Schlechter durch Erschütterung, Licht, Geräusche', 'Besser in aufrechter Haltung & Ruhe'],
      materiaMedicaHint: 'Tollkirsche; erfordert rasche Reevaluation nach Akutgabe.',
      tagesdosis: '2 bis 3 Gaben à 3 Globuli',
      haeufigkeit: 'Alle 3–4 Stunden bei akut pochendem Schmerz',
      anwendungsdauer: '1 bis maximal 3 Tage (nur in der Akutphase)',
      zeitraum: 'Akutstadium (Tag 1–3)',
      einnahmehinweis: 'Bei erster spürbarer Schmerzlinderung Einnahmeintervalle sofort strecken oder beenden.',
    });
  }

  if (combinedText.includes('reizbar') || combinedText.includes('magen') || combinedText.includes('kaffee') || combinedText.includes('stress') || combinedText.includes('leber') || combinedText.includes('arbeit')) {
    results.push({
      name: 'Nux vomica (Brechnuss)',
      potency: 'C30 bis C200',
      score: 84,
      grade: 'Differenzialmittel',
      keyIndicators: ['Ungeduld & Ehrgeiz', 'Kälteempfindlichkeit', 'Magen-Darm-Krämpfe', 'Überarbeitung'],
      description: 'Leitsubstanz für gestresste, überarbeitete Personen mit Schlafstörungen um 3:00 Uhr morgens und Reizdarmsymptomen.',
      modalitiesMatch: ['Schlechter morgens, Kälte, Genussmittel', 'Besser durch Wärme, Ruhe, feuchte Wärme'],
      materiaMedicaHint: 'Sehr wirksam bei Lebensstil-bedingten Intoxikationen und Krämpfen.',
      tagesdosis: '1 Gabe à 3–5 Globuli',
      haeufigkeit: '1-mal täglich abends vor dem Schlafengehen',
      anwendungsdauer: '3 bis maximal 5 Tage',
      zeitraum: 'Entlastungsphase (1. bis 2. Woche)',
      einnahmehinweis: 'Vor dem Zubettgehen sublingual einnehmen. Verzicht auf Kaffee und Alkohol unterstützt die Wirkung.',
    });
  }

  if (combinedText.includes('sanft') || combinedText.includes('weinen') || combinedText.includes('luft') || combinedText.includes('durstlos') || combinedText.includes('wechselhaft')) {
    results.push({
      name: 'Pulsatilla pratensis (Küchenschelle)',
      potency: 'C30 oder C200',
      score: 81,
      grade: 'Differenzialmittel',
      keyIndicators: ['Weinerliche Stimmung', 'Verlangen nach Zuneigung/Frischluft', 'Durstlosigkeit', 'Wandernde Symptome'],
      description: 'Ideal bei milden, nachgiebigen Gemütern und Beschwerden mit stark wechselhaftem Charakter.',
      modalitiesMatch: ['Besser im Freien & bei langsamer Bewegung', 'Schlechter in warmen, geschlossenen Räumen'],
      materiaMedicaHint: 'Klassisches Polychrest, ausgeprägte Besserung durch Trost und Gesellschaft.',
      tagesdosis: '1 Gabe à 3–5 Globuli',
      haeufigkeit: '1-mal täglich morgens oder abends',
      anwendungsdauer: '3 bis 5 Tage',
      zeitraum: 'Harmonisierungsphase (Woche 1–2)',
      einnahmehinweis: 'Sublingual einnehmen; für reichlich frische Luft im Raum sorgen.',
    });
  }

  if (combinedText.includes('bewegung') || combinedText.includes('ruhe') || combinedText.includes('durst') || combinedText.includes('trocken') || combinedText.includes('druck') || combinedText.includes('stich')) {
    results.push({
      name: 'Bryonia alba (Zaunrübe)',
      potency: 'C30',
      score: 79,
      grade: 'Differenzialmittel',
      keyIndicators: ['Strikte Verschlimmerung durch geringste Bewegung', 'Starker Durst auf große Mengen', 'Trockene Schleimhäute'],
      description: 'Entzündungs- und Schmerzmittel für stechende Schmerzen, bei denen jede Erschütterung schmerzt.',
      modalitiesMatch: ['Besser durch absolute Ruhe & Liegen auf der schmerzhaften Seite', 'Schlechter durch jede Bewegung'],
      materiaMedicaHint: 'Ausgeprägtes Verlangen nach Stille und geschäftlicher Sicherheit.',
      tagesdosis: '2 bis 3 Gaben à 3 Globuli',
      haeufigkeit: '2- bis 3-mal täglich bei akuten Bewegungsschmerzen',
      anwendungsdauer: '2 bis maximal 4 Tage',
      zeitraum: 'Akutphase (Tag 1–4)',
      einnahmehinweis: 'In Ruhephasen einnehmen; bei Besserung sofort absetzen.',
    });
  }

  if (combinedText.includes('angst') || combinedText.includes('unruhe') || combinedText.includes('brennen') || combinedText.includes('mitternacht') || combinedText.includes('ordnung') || combinedText.includes('kalt')) {
    results.push({
      name: 'Arsenicum album',
      potency: 'C200',
      score: 78,
      grade: 'Folgemittel',
      keyIndicators: ['Große nächtliche Unruhe (01:00-03:00)', 'Brennende Schmerzen gebessert durch Hitze', 'Todesangst/Sorge'],
      description: 'Tiefenwirksames Mittel bei Erschöpfung, Perfektionismus, Kältegefühl und ängstlicher Getriebenheit.',
      modalitiesMatch: ['Besser durch äußere Wärme & warme Getränke', 'Schlechter nach Mitternacht & Kälte'],
      materiaMedicaHint: 'Eines der drei großen brennenden Mittel in der klassischen Homöopathie.',
      tagesdosis: '1 Einmalgabe à 3 Globuli',
      haeufigkeit: 'Einmalige Gabe am Vormittag',
      anwendungsdauer: 'Einmalgabe; Wirkung 3 bis 5 Wochen beobachten',
      zeitraum: 'Konstitutionelle Stabilisierungsphase (4–6 Wochen)',
      einnahmehinweis: 'Sublingual zergehen lassen. Wärme und Ruhe fördern den Reaktionsverlauf.',
    });
  }

  // Fallback if no specific triggers hit
  if (results.length === 0) {
    results.push(
      {
        name: 'Sulphur (Schwefelblüte)',
        potency: 'C30 / C200',
        score: 75,
        grade: 'Erstmittel',
        keyIndicators: ['Allgemeine Reaktionslosigkeit', 'Wärmeintoleranz', 'Haut- & Schleimhautaffinität'],
        description: 'Reaktionsförderndes Hauptmittel zur Einleitung chronischer Konstitutionsbehandlungen.',
        modalitiesMatch: ['Schlechter durch Bettwärme & Stehen', 'Besser an frischer Luft'],
        materiaMedicaHint: 'Zentrales antipsorisches Mittel nach Samuel Hahnemann.',
        tagesdosis: '1 Einmalgabe à 3–5 Globuli',
        haeufigkeit: 'Einmalig morgens nüchtern',
        anwendungsdauer: 'Einmalgabe; 4–6 Wochen abwarten',
        zeitraum: 'Reaktionsanstoß (Initialphase über 4 Wochen)',
        einnahmehinweis: 'Sublingual einnehmen; keine voreilige Wiederholung.',
      },
      {
        name: 'Phosphorus',
        potency: 'C30',
        score: 72,
        grade: 'Differenzialmittel',
        keyIndicators: ['Offener Charakter', 'Großer Durst auf eiskalte Getränke', 'Überempfindlichkeit'],
        description: 'Breites Wirkspektrum auf Nervensystem, Atemwege und Kreislauf.',
        modalitiesMatch: ['Besser durch Kälte im Magen & Schlaf', 'Schlechter bei Dämmerung & Gewitter'],
        materiaMedicaHint: 'Klassisches Konstitutionsmittel für lebhafte, sensible Patienten.',
        tagesdosis: '1 Gabe à 3–5 Globuli',
        haeufigkeit: '1-mal täglich morgens',
        anwendungsdauer: '3 bis 5 Tage',
        zeitraum: 'Initialphase (1–2 Wochen)',
        einnahmehinweis: 'Sublingual zergehen lassen; 15 Minuten Abstand zu Mahlzeiten einhalten.',
      }
    );
  }

  return results.sort((a, b) => b.score - a.score);
}
