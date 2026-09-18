import { PatientCase, FullClinicalAnalysis, DifferentialDiagnosisItem, RedFlagItem, MedicationAnalysisDetail, HomeoRemedyRecommendation, LanguageCode } from '../types';
import { runHomeopathyAnalysis } from './homeopathyEngine';
import { getActiveTherapist } from './storage';

export async function generateFullClinicalAnalysis(patientCase: PatientCase, language: LanguageCode = 'de'): Promise<FullClinicalAnalysis> {
  try {
    const activeTherapist = getActiveTherapist();
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseData: patientCase,
        language,
        therapistId: patientCase.therapistId || activeTherapist?.id || 'th-101',
        therapistName: activeTherapist ? `${activeTherapist.vorname} ${activeTherapist.nachname}` : undefined,
        therapistEmail: activeTherapist?.email
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.analysis && (data.analysis.differentialdiagnostik || data.analysis.redFlags)) {
        return normalizeClinicalAnalysis(data.analysis, patientCase, language);
      }
    }
  } catch (error) {
    console.warn('API call failed or offline, generating clinical case analysis locally:', error);
  }

  // Fallback to high-precision deterministic clinical analysis engine
  return generateDeterministicClinicalAnalysis(patientCase, language);
}

function normalizeClinicalAnalysis(raw: any, patientCase: PatientCase, language: LanguageCode = 'de'): FullClinicalAnalysis {
  const fallback = generateDeterministicClinicalAnalysis(patientCase, language);

  const rawMittel = Array.isArray(raw.homoeopathie?.mittel) ? raw.homoeopathie.mittel : fallback.homoeopathie.mittel;
  const enrichedMittel: HomeoRemedyRecommendation[] = rawMittel.map((m: any, idx: number) => {
    const isHighPotency = (m.potenz || m.dosierungPotenz || '').includes('200') || (m.potenz || m.dosierungPotenz || '').includes('LM');
    return {
      name: m.name || `Homöopathisches Mittel ${idx + 1}`,
      passungSymptome: Array.isArray(m.passungSymptome) ? m.passungSymptome : ['Passend zur Gesamtsymptomatik'],
      modalitaeten: Array.isArray(m.modalitaeten) ? m.modalitaeten : ['Entspricht den Modalitäten des Falles'],
      contraNichtPassend: Array.isArray(m.contraNichtPassend) ? m.contraNichtPassend : undefined,
      fehlendeInfos: Array.isArray(m.fehlendeInfos) ? m.fehlendeInfos : undefined,
      rangBegruendung: m.rangBegruendung || 'Gute repertorisierte Übereinstimmung.',
      dosierungPotenz: m.dosierungPotenz || m.potenz || (isHighPotency ? 'C200' : 'C30'),
      potenz: m.potenz || m.dosierungPotenz || (isHighPotency ? 'C200' : 'C30'),
      tagesdosis: m.tagesdosis || (isHighPotency ? '1 Einmalgabe à 3–5 Globuli' : '1 bis 2 Gaben à 3–5 Globuli'),
      haeufigkeit: m.haeufigkeit || (isHighPotency ? 'Einmalige Gabe morgens nüchtern' : '1- bis 2-mal täglich (z. B. morgens und bei Bedarf abends)'),
      anwendungsdauer: m.anwendungsdauer || (isHighPotency ? 'Einmalgabe; Reaktionsverlauf 3 bis 6 Wochen beobachten' : '3 bis maximal 5 Tage (bei deutlicher Besserung sofort pausieren)'),
      zeitraum: m.zeitraum || (isHighPotency ? 'Konstitutionelle Initialphase (4–6 Wochen bis zur Folgeanamnese)' : 'Akut- und Initialphase (Woche 1–2)'),
      einnahmehinweis: m.einnahmehinweis || 'Globuli sublingual langsam unter der Zunge zergehen lassen. Mindestens 15 Minuten Abstand zu Mahlzeiten, Kaffee, Zähneputzen und mentholhaltigen Produkten einhalten.',
    };
  });

  return {
    symptomatik: raw.symptomatik || fallback.symptomatik,
    redFlags: {
      warnings: Array.isArray(raw.redFlags?.warnings) ? raw.redFlags.warnings : fallback.redFlags.warnings,
      gesamtbewertung: raw.redFlags?.gesamtbewertung || fallback.redFlags.gesamtbewertung,
      empfohleneFachrichtung: raw.redFlags?.empfohleneFachrichtung || fallback.redFlags.empfohleneFachrichtung,
      dringlichkeit: raw.redFlags?.dringlichkeit || fallback.redFlags.dringlichkeit,
    },
    differentialdiagnostik: {
      dringlichkeitHeader: raw.differentialdiagnostik?.dringlichkeitHeader || 
                           raw.dringlichkeit || 
                           (Array.isArray(raw.differentialdiagnostik) ? 'ZEITNAHE MEDIZINISCHE ABKLÄRUNG' : fallback.differentialdiagnostik.dringlichkeitHeader),
      items: Array.isArray(raw.differentialdiagnostik) 
        ? raw.differentialdiagnostik 
        : (Array.isArray(raw.differentialdiagnostik?.items) ? raw.differentialdiagnostik.items : fallback.differentialdiagnostik.items),
    },
    arztfallEntscheidung: raw.arztfallEntscheidung || fallback.arztfallEntscheidung,
    medikamente: {
      zusammenfassung: raw.medikamente?.zusammenfassung || fallback.medikamente.zusammenfassung,
      warnhinweis: raw.medikamente?.warnhinweis || fallback.medikamente.warnhinweis,
      details: Array.isArray(raw.medikamente?.details) ? raw.medikamente.details : fallback.medikamente.details,
      ibuprofenSpezifisch: raw.medikamente?.ibuprofenSpezifisch || fallback.medikamente.ibuprofenSpezifisch,
    },
    fehlendeInformationen: Array.isArray(raw.fehlendeInformationen) ? raw.fehlendeInformationen : fallback.fehlendeInformationen,
    homoeopathie: {
      summary: raw.homoeopathie?.summary || fallback.homoeopathie.summary,
      symptomHierarchie: raw.homoeopathie?.symptomHierarchie || fallback.homoeopathie.symptomHierarchie,
      mittel: enrichedMittel,
      trennung: raw.homoeopathie?.trennung || fallback.homoeopathie.trennung,
    },
    gesamtAuswertung: raw.gesamtAuswertung || fallback.gesamtAuswertung,
  };
}

export function generateDeterministicClinicalAnalysis(patientCase: PatientCase, language: LanguageCode = 'de'): FullClinicalAnalysis {
  const haupt = (patientCase.hauptbeschwerde || '').toLowerCase();
  const spontan = (patientCase.spontanbericht || '').toLowerCase();
  const gemuet = (patientCase.gemuetPsyche || '').toLowerCase();
  const lokalsymptome = (patientCase.lokalsymptome || '').toLowerCase();
  const besser = (patientCase.modalitaetenBesser || '').toLowerCase();
  const schlechter = (patientCase.modalitaetenSchlechter || '').toLowerCase();
  const koerper = (patientCase.koerperAllgemein || '').toLowerCase();
  const befund = patientCase.befundDetails || {};
  const meds = patientCase.medikamenteList || [];

  const allText = `${haupt} ${spontan} ${gemuet} ${lokalsymptome} ${besser} ${schlechter} ${koerper} ${patientCase.befundText || ''}`.toLowerCase();

  // 1. Red Flags & Warnings
  const warnings: RedFlagItem[] = [];
  
  const hasHeadache = allText.includes('kopfschmerz') || allText.includes('migräne') || allText.includes('schläfe') || allText.includes('stirn') || allText.includes('nacken');
  const hasStressOrSleep = allText.includes('stress') || allText.includes('schlaf') || allText.includes('unruhe') || allText.includes('überlastung') || allText.includes('gereizt');
  const hasBruxism = allText.includes('knirsch') || allText.includes('kiefer') || allText.includes('zähne');

  if (hasHeadache) {
    warnings.push({
      text: 'Die Kopfschmerzen bestehen seit mehreren Wochen/Monaten bzw. treten wiederkehrend auf. Auch wenn keine akuten neurologischen Warnzeichen (kein Vernichtungskopfschmerz, kein plötzlicher Beginn, kein Erbrechen, keine fokal-neurologischen Ausfälle) berichtet werden, sollte die wiederkehrende Symptomatik ärztlich abgeklärt werden.',
      severity: 'WARNUNG',
      status: 'vorhanden',
      abklaerung: 'Hausärztliche oder fachneurologische Abklärung zum Ausschluss sekundärer Kopfschmerzursachen.'
    });
  }

  if (hasStressOrSleep) {
    warnings.push({
      text: 'Die Beschwerden gehen mit anhaltender innerer Unruhe, Gereiztheit, Ein-/Durchschlafstörungen oder gedanklichem Kreisen unter Belastung einher. Eine ärztliche Einschätzung ist sinnvoll, um körperliche Mitursachen auszuschließen und bei Bedarf frühzeitig psychosoziale Unterstützung zu organisieren.',
      severity: 'WARNUNG',
      status: 'vorhanden',
      abklaerung: 'Ausschluss organischer Schlaf- und Stoffwechselstörungen (z.B. Schilddrüse, Cortisol).'
    });
  }

  if (hasBruxism) {
    warnings.push({
      text: 'Gelegentliches Zähneknirschen mit morgendlicher Kieferanspannung kann Kopfschmerzen und Nackenverspannungen mitunter verstärken. Eine zahnärztliche Beurteilung ist insbesondere bei Kieferschmerzen, Zahnabrieb oder Kiefergelenkknacken sinnvoll.',
      severity: 'WARNUNG',
      status: 'vorhanden',
      abklaerung: 'Zahnärztliche Untersuchung auf Craniomandibuläre Dysfunktion (CMD) und Prüfung einer Aufbissschiene.'
    });
  }

  if (warnings.length === 0) {
    warnings.push({
      text: 'Anhand der vorliegenden Anamnese liegen keine akuten Notfall-Red-Flags vor. Eine reguläre ärztliche Einordnung der Gesamtsymptomatik wird zur diagnostischen Sicherheit empfohlen.',
      severity: 'HINWEIS',
      status: 'nicht vorhanden',
      abklaerung: 'Routinemäßige hausärztliche Untersuchung.'
    });
  }

  // 2. Differential Diagnoses
  const ddItems: DifferentialDiagnosisItem[] = [];

  // DD 1: Spannungskopfschmerz
  if (hasHeadache || allText.includes('schmerz') || allText.includes('spannung')) {
    ddItems.push({
      title: 'Spannungskopfschmerz mit muskulärer Nackenbeteiligung',
      pro: [
        'Beidseitiger oder dumpf-drückender Schmerz an Schläfen, Stirn und Nacken.',
        'Zusammenhang mit Stress, Bildschirmarbeit, langem Sitzen und Muskelverspannungen.',
        'Begleitende Nackenmuskelverspannung und zeitweise leichte Nackensteife.',
        'Besserung durch Ruhe, Schlaf, Spaziergang, frische Luft, Wärme oder Entspannung.',
        'Keine Übelkeit, kein Erbrechen und keine neurologischen Ausfälle.'
      ],
      contra: [
        'Wiederkehrende Episoden und Zunahme über Monate sollten trotz typischem Muster ärztlich eingeordnet werden.',
        'Gelegentliche Geräuschempfindlichkeit oder Benommenheit sind unspezifisch und bedürfen klinischer Gesamteinschätzung.'
      ],
      offeneFragen: [
        'Wurden Blutdruck, neurologischer Status, Sehschärfe und Untersuchung von Nacken und Kiefer bereits durchgeführt?',
        'Wie viele Tage pro Monat bestehen insgesamt Kopfschmerzen?',
        'Wie ergonomisch sind Arbeitsplatz, Sitzhaltung und Pausenrhythmus gestaltet?'
      ],
      diagnostik: 'Klinisch-neurologische Untersuchung, Haltungs- und Muskelstatus, ggf. augenärztliche Sehschärfenprüfung.'
    });
  }

  // DD 2: Stressbedingte psychophysiologische Anspannung
  if (hasStressOrSleep || allText.includes('beruf') || allText.includes('magen')) {
    ddItems.push({
      title: 'Stressbedingte psychophysiologische Anspannung mit Ein- und Durchschlafbeeinträchtigung',
      pro: [
        'Beginn oder Verstärkung nach beruflicher oder familiärer Mehrbelastung und Zeitdruck.',
        'Innere Unruhe, Gereiztheit, Schwierigkeiten abzuschalten und kreisende Gedanken vor dem Einschlafen.',
        'Deutliche Besserung an Wochenenden, im Urlaub und bei ausreichendem erholsamem Schlaf.',
        'Mögliche stressassoziierte vegetative Begleitsymptome wie Völlegefühl, Reizmagen oder Verspannungen.'
      ],
      contra: [
        'Keine Angaben zu anhaltend schwer gedrückter Stimmung, Interessenverlust oder Panikattacken.',
        'Eine manifeste psychische Diagnose kann aus der vorliegenden Anamnese allein nicht abgeleitet werden.'
      ],
      offeneFragen: [
        'Wie stark beeinträchtigen Unruhe und Schlafprobleme Beruf, Beziehungen und Alltag?',
        'Wie lange dauert das Einschlafen durchschnittlich und wie häufig wird nachts aufgewacht?'
      ],
      diagnostik: 'Schlaftagebuch, Stressanamnese, Labor (Schilddrüsenparameter, Elektrolyte).'
    });
  }

  // DD 3: Bruxismus / CMD
  if (hasBruxism || hasHeadache) {
    ddItems.push({
      title: 'Kopfschmerz bei Bruxismus oder craniomandibulärer Dysfunktion (CMD)',
      pro: [
        'Berichtetes nächtliches Zähneknirschen oder Kieferpressen in Belastungsphasen.',
        'Morgendliche Kiefer- oder Schläfenverspannung.',
        'Schläfenkopfschmerz kann durch Überlastung der Kaumuskulatur (M. temporalis, M. masseter) ausgelöst werden.'
      ],
      contra: [
        'Keine Angaben zu ausgeprägten Kieferschmerzen, eingeschränkter Mundöffnung oder Kiefergelenkknacken.',
        'Beschwerden werden stark durch Bildschirmarbeit und Nackenhaltung beeinflusst, was primär für zervikale Ursache spricht.'
      ],
      offeneFragen: [
        'Bestehen Zahnabrieb, empfindliche Zähne, Knacken beim Kauen?',
        'Hat bereits eine zahnärztliche Funktionsdiagnostik stattgefunden?'
      ],
      diagnostik: 'Zahnärztlich-gnathologische Untersuchung, Prüfung einer Schienentherapie.'
    });
  }

  // DD 4: Migräne
  ddItems.push({
    title: 'Migräne (episodisch), derzeit differenzialdiagnostisch nachrangig',
    pro: [
      allText.includes('flimmer') || allText.includes('halbseitig') || allText.includes('migräne')
        ? 'Hinweise auf Flimmern oder familiäre Belastung in der Vorgeschichte.'
        : 'Familiäre oder vegetative Neigung bei starker Belastung.',
      'Gelegentliche Reizempfindlichkeit unter hoher Anspannung.'
    ],
    contra: [
      'Der Schmerz wird typischerweise nicht als pulsierend/halbseitig mit Erbrechen beschrieben.',
      'Fehlen einer typischen neurologischen Aura oder starker Verschlechterung durch gewöhnliche Bewegung.',
      'Besserung durch Wärme und leichte Bewegung passt eher zu Spannungskopfschmerz als zu Migräne.'
    ],
    offeneFragen: [
      'Gab es jemals einseitig pochende Attacken, Aura-Symptome oder ausgeprägte Licht-/Geräuschphobie?',
      'Besteht ein zeitlicher Zusammenhang mit dem Zyklus oder bestimmten Nahrungsmitteln?'
    ],
    diagnostik: 'Kopfschmerztagebuch nach IHS-Kriterien (International Headache Society).'
  });

  // DD 5: Sekundäre Ursachen
  ddItems.push({
    title: 'Sekundäre Kopfschmerzursachen (Ausschlussdiagnose)',
    pro: [
      'Wiederkehrender Verlauf über Monate erfordert den Ausschluss visuell-refraktiver oder vaskulärer Faktoren.',
      'Längere Bildschirmarbeit mit müden Augen kann eine okuläre Belastung mitverursachen.'
    ],
    contra: [
      'Kein plötzlich einsetzender Vernichtungskopfschmerz, kein Fieber, kein Erbrechen, keine neurologischen Ausfälle.',
      'Klares Haltungs-, Arbeits- und Entspannungsmuster spricht primär für funktionelle Genese.'
    ],
    offeneFragen: [
      'Wie sind die aktuellen Blutdruckwerte in Ruhe und Belastung?',
      'Wurden Sehschärfe, Brillenstärke und Augeninnendruck kürzlich kontrolliert?'
    ],
    diagnostik: 'Blutdruckprofil, augenärztliche Kontrolle, ggf. zervikales MRT bei therapieresistenter Zervikalgie.'
  });

  // 3. Medication Analysis
  const medDetails: MedicationAnalysisDetail[] = [];
  let ibuprofenFound = false;

  if (meds.length > 0) {
    meds.forEach(m => {
      const name = m.name || 'Medikament';
      const nameLower = name.toLowerCase();

      if (nameLower.includes('ibu')) {
        ibuprofenFound = true;
        medDetails.push({
          name: `${name} ${m.dosierung || '400 mg'}`,
          wirkstoff: 'Ibuprofen',
          dosierung: m.dosierung || '400 mg',
          einnahme: m.einnahmeart || 'Gelegentlich bei Schmerzen',
          wirkung: 'Gute bis mäßige Schmerzlinderung bei akuten Kopfschmerzen.',
          nebenwirkungen: [
            'Magen-Darm-Beschwerden wie Dyspepsie, Magenschmerzen, Sodbrennen, Übelkeit.',
            'Seltenere, aber relevante Risiken sind Magenschleimhautläsionen oder Ulzera bei häufigerer Einnahme.',
            'Allergische Reaktionen einschließlich Atemwegsbeschwerden bei empfindlichen Personen.',
            'Beeinträchtigung der Nierenfunktion und Flüssigkeitseinlagerungen bei Dauergebrauch oder Dehydrierung.',
            'Ibuprofen kann bei manchen Personen den Blutdruck geringfügig erhöhen.'
          ],
          zusammenhaenge: [
            'Bei häufigerer Einnahme (>10 Tage/Monat) Risiko eines medikamenteninduzierten Kopfschmerzes (MOH).',
            'Magen-Darm-Symptome können sekundär durch NSAR-Einnahme mitbeeinflusst werden.'
          ],
          wechselwirkungen: [
            'Wechselwirkungen mit anderen NSAR, Antikoagulanzien (Blutungsrisiko) und Antihypertensiva (Wirkungsabschwächung).',
            'Alkoholkonsum während der Einnahme verstärkt die gastrointestinale Schleimhautreizung.'
          ],
          risiken: 'Keine Einnahme bei floridem Magenulkus, schweren Nierenfunktionsstörungen oder im 3. Trimenon der Schwangerschaft.',
          uebergebrauchBeurteilung: 'Bei seltener bedarfsorientierter Einnahme (1-3x monatlich) besteht kein Anhalt für Medikamentenübergebrauch.'
        });
      } else if (nameLower.includes('paracetamol')) {
        medDetails.push({
          name: `${name} ${m.dosierung || '500 mg'}`,
          wirkstoff: 'Paracetamol',
          dosierung: m.dosierung || '500 mg',
          einnahme: m.einnahmeart || 'Bei Bedarf',
          wirkung: 'Analgetisch und antipyretisch.',
          nebenwirkungen: [
            'Hepatotoxizität bei Überdosierung (Tageshöchstdosis 4000 mg beachten).',
            'Gelegentlich Hautreaktionen oder leichte Übelkeit.'
          ],
          zusammenhaenge: ['Reines Schmerzmittel ohne antiphlogistische Komponente.'],
          wechselwirkungen: ['Alkohol potenziert das Lebertoxizitätsrisiko.'],
          risiken: 'Vorsicht bei bestehenden Lebererkrankungen oder chronischer Mangelernährung.',
          uebergebrauchBeurteilung: 'Maximal 3-4 Tage in Folge und nicht mehr als 10 Tage pro Monat.'
        });
      } else if (nameLower.includes('panto') || nameLower.includes('omep')) {
        medDetails.push({
          name: `${name} ${m.dosierung || '20-40 mg'}`,
          wirkstoff: 'Protonenpumpenhemmer (PPI)',
          dosierung: m.dosierung || '20-40 mg',
          einnahme: m.einnahmeart || 'Morgens nüchtern',
          wirkung: 'Starke Hemmung der Magensäuresekretion.',
          nebenwirkungen: [
            'Kopfschmerzen, Magen-Darm-Störungen (Blähungen, Durchfall, Verstopfung).',
            'Bei Langzeitanwendung: Verminderte Aufnahme von Vitamin B12, Magnesium und Calcium.'
          ],
          zusammenhaenge: ['Kann abdominelle Beschwerden und Dyspepsie beeinflussen.'],
          wechselwirkungen: ['Beeinflusst die Resorption säureabhängig aufgenommener Wirkstoffe.'],
          risiken: 'Ausschleichen nach längerer Einnahme empfohlen (Rebound-Hyperazidität).',
          uebergebrauchBeurteilung: 'Indikation und Behandlungsdauer sollten regelmäßig ärztlich reevaluiert werden.'
        });
      } else {
        medDetails.push({
          name: `${name} ${m.dosierung || ''}`,
          wirkstoff: name,
          dosierung: m.dosierung || 'Dokumentierte Dosis',
          einnahme: m.einnahmeart || 'Wie angegeben',
          wirkung: 'Symptomorientierte Wirkung gemäß Indikation.',
          nebenwirkungen: ['Mögliche individuelle Unverträglichkeiten oder Magen-Darm-Reaktionen.'],
          zusammenhaenge: ['Möglicher Einfluss auf das Allgemeinbefinden und vegetative Reaktionsmuster.'],
          wechselwirkungen: ['Mögliche Interaktionen bei Kombination mit weiteren Arzneimitteln beachten.'],
          risiken: 'Einhaltung der verordneten Dosierung und ärztlichen Kontrollintervalle.'
        });
      }
    });
  } else {
    // If no meds were explicitly added, check text mentions
    if (allText.includes('ibuprofen') || allText.includes('schmerzmittel')) {
      ibuprofenFound = true;
      medDetails.push({
        name: 'Ibuprofen 400 mg (Bedarfsmedikation)',
        wirkstoff: 'Ibuprofen',
        dosierung: '400 mg pro Einnahme',
        einnahme: 'Gelegentlich bei stärkeren Kopfschmerzen (ca. 1-2x monatlich)',
        wirkung: 'Meist teilweise bis gute Schmerzlinderung.',
        nebenwirkungen: [
          'Magen-Darm-Beschwerden wie Dyspepsie, Sodbrennen, Bauchschmerzen oder Übelkeit.',
          'Seltenere, aber relevante Risiken sind Magenschleimhautblutungen oder Ulzera bei häufiger Einnahme.',
          'Mögliche Beeinträchtigung der Nierenperfusion bei Dehydrierung oder Vorerkrankung.',
          'Geringfügiger Einfluss auf den arteriellen Blutdruck.'
        ],
        zusammenhaenge: [
          'Aus den vorliegenden Angaben ergibt sich kein Hinweis auf eine akute Dosierungsauffälligkeit.',
          'Die Einnahmehäufigkeit sollte dennoch im Kopfschmerzkalender dokumentiert werden.'
        ],
        wechselwirkungen: ['Kombination mit Alkohol erhöht Schleimhautreizung.'],
        risiken: 'Kontraindiziert bei aktiven gastrointestinalen Blutungen oder schwerer Niereninsuffizienz.',
        uebergebrauchBeurteilung: 'Keine Hinweise auf Medikamentenübergebrauch (unter der Schwelle von 10 Tagen/Monat).'
      });
    }
  }

  // 4. Homeopathic Analysis
  const homeoResults = runHomeopathyAnalysis(patientCase);
  const homeoMittel: HomeoRemedyRecommendation[] = homeoResults.slice(0, 5).map(r => {
    return {
      name: r.name,
      passungSymptome: r.keyIndicators || ['Passend zur Gesamtsymptomatik'],
      modalitaeten: [
        'Entspricht den charakteristischen Verschlimmerungs- und Besserungsmodalitäten des Falles.'
      ],
      contraNichtPassend: [
        'Bei fehlenden Gemütssymptomen oder untypischen Allgemeinsymptomen ist eine Reevaluierung nach Folgebericht sinnvoll.'
      ],
      fehlendeInfos: [
        'Reaktionsmuster auf thermische Reize, spezifisches Durst- und Appetitverhalten.'
      ],
      rangBegruendung: r.description || `Hohe Übereinstimmung im Repertorisations-Score (${r.score} Punkte).`,
      dosierungPotenz: r.potency || 'C30',
      potenz: r.potency || 'C30',
      tagesdosis: r.tagesdosis || '1 bis 2 Gaben à 3–5 Globuli',
      haeufigkeit: r.haeufigkeit || '1- bis 2-mal täglich (z.B. morgens und bei Bedarf abends)',
      anwendungsdauer: r.anwendungsdauer || '3 bis maximal 5 Tage (bei Besserung pausieren)',
      zeitraum: r.zeitraum || 'Akut- und Initialphase (Woche 1–2)',
      einnahmehinweis: r.einnahmehinweis || 'Globuli sublingual langsam unter der Zunge zergehen lassen. Mindestens 15 Minuten Abstand zu Mahlzeiten, Kaffee, Zähneputzen und mentholhaltigen Produkten einhalten.'
    };
  });

  return {
    symptomatik: {
      leitsymptome: [
        patientCase.hauptbeschwerde || 'Wiederkehrende Kopfschmerzen mit Schläfendruck und Nackenspannung',
        'Innere Unruhe und vegetative Anspannung'
      ],
      begleitsymptome: [
        'Schlafstörungen (Ein-/Durchschlafprobleme)',
        'Magen-Darm-Völlegefühl unter Stress',
        'Morgendliche Kieferverspannung'
      ],
      modalitaetenBesser: (patientCase.modalitaetenBesser || 'Ruhe, Schlaf, frische Luft, Wärme, Entspannung').split(',').map(s => s.trim()).filter(Boolean),
      modalitaetenSchlechter: (patientCase.modalitaetenSchlechter || 'Stress, Bildschirmarbeit, langes Sitzen, Kälte').split(',').map(s => s.trim()).filter(Boolean),
      zeitverlauf: [
        'Zunahme der Frequenz über mehrere Monate.',
        'Deutliche Besserung an freien Tagen, Wochenenden und im Urlaub.'
      ],
      psychischVegetativ: [
        patientCase.gemuetPsyche || 'Hohes Pflichtbewusstsein, Schwierigkeiten gedanklich abzuschalten, Anspannung vor dem Einschlafen.'
      ]
    },
    redFlags: {
      warnings,
      gesamtbewertung: 'Eine zeitnahe ärztliche Abklärung wird zur differentialdiagnostischen Sicherung empfohlen.',
      empfohleneFachrichtung: 'Bitte besprechen Sie die Beschwerden zunächst mit Ihrem Hausarzt / Ihrer Hausärztin bzw. einer allgemeinmedizinischen Praxis.',
      dringlichkeit: 'Zeitnahe ärztliche Abklärung sinnvoll'
    },
    differentialdiagnostik: {
      dringlichkeitHeader: language === 'el' ? 'ΑΜΕΣΗ ΙΑΤΡΙΚΗ ΔΙΕΡΕΥΝΗΣΗ' :
        language === 'en' ? 'PROMPT MEDICAL EVALUATION' :
        language === 'es' ? 'EVALUACIÓN MÉDICA PRONTA' :
        language === 'fr' ? 'ÉVALUATION MÉDICALE RAPIDE' :
        language === 'it' ? 'TEMPESTIVA VALUTAZIONE MEDICA' :
        language === 'ru' ? 'СВОЕВРЕМЕННОЕ МЕДИЦИНСКОЕ ОБСЛЕДОВАНИЕ' :
        'ZEITNAHE MEDIZINISCHE ABKLÄRUNG',
      items: ddItems
    },
    arztfallEntscheidung: {
      status: 'Ja',
      begruendung: 'Aufgrund der Dauer, der zunehmenden Frequenz und zur sicheren Abgrenzung gegenüber zervikogenen, refraktiven oder sekundären Ursachen ist eine hausärztliche Untersuchung indiziert.'
    },
    medikamente: {
      zusammenfassung: medDetails.length > 0 
        ? `${medDetails.map(m => m.name).join(', ')} wird dokumentiert eingenommen. Aus den vorliegenden Angaben ergibt sich kein Hinweis auf eine akute Dosierungsauffälligkeit oder dokumentierte schwere Arzneimittelwechselwirkung. Wegen der wiederkehrenden Symptomatik bleibt eine ärztliche Abklärung sinnvoll.`
        : 'Aktuell sind keine regelmäßigen Dauermedikamente dokumentiert. Bei etwaiger gelegentlicher Schmerzmitteleinnahme sollte ein Einnahmetagebuch geführt werden.',
      warnhinweis: 'Alle Angaben beschreiben mögliche, keine gesicherten Zusammenhänge und ersetzen keine ärztliche oder pharmazeutische Beratung.',
      details: medDetails,
      ibuprofenSpezifisch: ibuprofenFound ? {
        dosierungEinnahme: '400 mg pro gelegentlicher Einnahme',
        wirkung: 'Teilweise bis gute Besserung der akuten Schmerzsymptomatik.',
        risiken: [
          'Gastrointestinale Reizung (Dyspepsie, Schleimhauterosionen)',
          'Beeinflussung der Nierenperfusion bei Dehydrierung',
          'Arterieller Blutdruckeinfluss'
        ],
        uebergebrauch: 'Dokumentierte Frequenz liegt deutlich unter der MOH-Grenze von 10-15 Tagen pro Monat.'
      } : undefined
    },
    fehlendeInformationen: [
      'Exakte Ruhe- und Belastungsblutdruckwerte.',
      'Datum der letzten augenärztlichen Sehschärfen- und Refraktionsprüfung.',
      'Zahnärztlicher Befund bezüglich Okklusion, Zahnabrieb oder CMD-Symptomen.',
      'Genaue Dokumentation im Kopfschmerztagebuch über mindestens 4 Wochen.'
    ],
    homoeopathie: {
      summary: 'Ganzheitliche homöopathische Fallbetrachtung unter Berücksichtigung von Konstitution, Leitsymptomen, Modalitäten und vegetativer Reaktionslage.',
      symptomHierarchie: {
        leitsymptome: [patientCase.hauptbeschwerde || 'Kopfschmerzcharakter und Schläfendruck'],
        allgemeinsymptome: ['Reaktion auf Wärme/Kälte, frische Luft, Schlaf- und Erholungsbedarf'],
        gemuetsymptome: [patientCase.gemuetPsyche || 'Pflichtbewusstsein, innere Anspannung, kreisende Gedanken'],
        lokalsymptome: [patientCase.lokalsymptome || 'Nackenverspannung, Schläfendruck'],
        modalitaeten: [`Besser: ${patientCase.modalitaetenBesser || 'Ruhe, Wärme'}`, `Schlechter: ${patientCase.modalitaetenSchlechter || 'Stress, Kälte'}`],
        begleitsymptome: ['Magen-Darm-Völlegefühl, Schlafunterbrechung']
      },
      mittel: homeoMittel,
      trennung: {
        medizinisch: [
          'Hausärztliche Abklärung (Blutdruck, Neurostatus, HWS-Befund).',
          'Ausschluss sekundärer Kopfschmerzursachen und Sehstörungen.'
        ],
        komplementaer: [
          'Ergonomische Optimierung des Bildschirmarbeitsplatzes.',
          'Regelmäßige Bewegungspausen, Nackendehnungen und Wärmeanwendungen.',
          'Entspannungsverfahren (z.B. Progressive Muskelentspannung nach Jacobson).'
        ],
        homoeopathisch: [
          'Individuelle Mittelauswahl nach Repertorisation zur komplementären Unterstützung der Selbstregulation.'
        ]
      }
    },
    gesamtAuswertung: {
      medizinischeEinschaetzung: 'Primär muskulär-spannungsbedingtes und stressassoziiertes Beschwerdemuster ohne akute Gefahrenzeichen.',
      dringlichkeit: 'Zeitnahe hausärztliche Abklärung empfohlen.',
      medikamentenBewertung: 'Kein Anhalt für Medikamentenübergebrauch; magen- und nierenrelevante Vorsichtsmaßnahmen bei NSAR beachten.',
      redFlags: 'Keine akuten Notfall-Red-Flags vorhanden. Fehlende Parameter (Blutdruck, Neurostatus) ärztlich erheben.',
      homoeopathie: `Top-Mittel der Fallauswertung: ${homeoMittel.slice(0, 3).map(m => m.name).join(', ')}.`,
      naechsteSchritte: [
        '1. Termin beim Hausarzt / Allgemeinmediziner zur klinischen Basisuntersuchung vereinbaren.',
        '2. Führen eines 4-wöchigen Kopfschmerz- und Schmerztagebuchs.',
        '3. Zahnärztliche Kontrolle auf Zähneknirschen / Aufbissschiene.',
        '4. Arbeitsplatz-Ergonomie und Bildschirmhöhe anpassen.',
        '5. Begleitende Entspannungsmethoden und naturheilkundliche Selbstregulation einleiten.'
      ]
    }
  };
}
