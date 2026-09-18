import { TranslationKey } from '../i18n/translations';
import { TherapyRecommendations, TherapyRemedyItem } from '../types';

export function getLocalizedPresetValue(
  val: string | undefined,
  type: 'dose' | 'freq' | 'dur' | 'phase' | 'note',
  t: (k: TranslationKey) => string
): string {
  if (!val || !val.trim()) {
    if (type === 'dose') return t('dosePreset1');
    if (type === 'freq') return t('freqPreset1');
    if (type === 'dur') return t('durPreset1');
    if (type === 'phase') return t('phasePreset1');
    return '';
  }

  const clean = val.trim();

  if (type === 'dose') {
    // 3 Tropfen in Wasser / 3 drops / 3 gotas / 3 gouttes / 3 σταγόνες / 3 gocce / 3 капли
    if (/^(3\s*(tropfen|drops|gotas|gouttes|σταγόνες|gocce|капли))/i.test(clean)) {
      return t('dosePreset4');
    }
    // 2 bis 3 Gaben à 3 Globuli / 2 to 3 / 2 a 3 / 2 à 3 / 2 έως 3 / 2 - 3 / 2–3
    if (/^(2\s*(bis|to|a|à|έως|до|-|–)\s*3)/i.test(clean)) {
      return t('dosePreset3');
    }
    // 1 bis 2 Gaben à 3-5 Globuli / 1 to 2 / 1 a 2 / 1 à 2 / 1 έως 2 / 1 - 2 / 1–2
    if (/^(1\s*(bis|to|a|à|έως|до|-|–)\s*2\s*(gaben|doses|tomas|prises|δόσεις|dosi|somministrazioni|приема)?|1\s*bis\s*2|1\s*έως\s*2)/i.test(clean)) {
      return t('dosePreset1');
    }
    // 1 Gabe / 1 Einmalgabe / 1 dose / 1 toma / 1 prise / 1 δόση / 1 somministrazione / 1 прием
    if (/^(1\s*(einmalgabe|gabe|dose|toma|prise|δόση|dosi|somministrazione|прием|tl))/i.test(clean)) {
      return t('dosePreset2');
    }
  } else if (type === 'freq') {
    if (/bedarf|needed|necesidad|besoin|περίπτωση|ανάγκη|bisogno|необходим/i.test(clean)) {
      return t('freqPreset5');
    }
    if (/3\s*[-–/]\s*4\s*(stunden|hours|horas|heures|ώρες|ore|часа|ч)/i.test(clean)) {
      return t('freqPreset4');
    }
    if (/abends|evening|noche|soir|βράδυ|sera|вечером/i.test(clean)) {
      return t('freqPreset3');
    }
    if (/morgens|morning|mañana|matin|πρωί|mattina|утром/i.test(clean)) {
      return t('freqPreset2');
    }
    if (/^(1\s*[-–]?\s*(bis|to|a|à|έως|до|-|–)\s*2|1\s*[-–]\s*2|1\s*bis\s*2|1\s*έως\s*2)/i.test(clean)) {
      return t('freqPreset1');
    }
  } else if (type === 'dur') {
    if (/einmal|single|única|unica|unique|εφάπαξ|singola|однократн/i.test(clean)) {
      return t('durPreset4');
    }
    if (/([4-8]\s*(bis|to|a|à|έως|до|-|–)\s*[6-8]\s*(wochen|weeks|semanas|semaines|εβδομάδες|settimane|недель|нед))/i.test(clean)) {
      return t('durPreset5');
    }
    if (/^([45]\s*(bis|to|a|à|έως|до|-|–)\s*(maximal|max|το πολύ|максимум|massimo)?\s*7)/i.test(clean)) {
      return t('durPreset3');
    }
    if (/^(1\s*(bis|to|a|à|έως|до|-|–)\s*(maximal|max|το πολύ|максимум|massimo)?\s*3)/i.test(clean)) {
      return t('durPreset2');
    }
    if (/^(3\s*(bis|to|a|à|έως|до|-|–)\s*(maximal|max|το πολύ|максимум|massimo)?\s*5|3\s*bis\s*maximal|3\s*έως\s*το\s*πολύ)/i.test(clean)) {
      return t('durPreset1');
    }
  } else if (type === 'phase') {
    if (/regenerat|régénérat|αναγέννηση|rigeneraz|регенерат|erholung|entlastung/i.test(clean)) {
      return t('phasePreset5');
    }
    if (/konstitut|constitut|constituc|ιδιοσυγκρασιακή|συνταγματική|costituz|конституц/i.test(clean)) {
      return t('phasePreset4');
    }
    if (/akut.*init|acute.*init|aguda.*init|aigu.*init|οξεία.*αρχική|acuta.*iniz|острая.*нач/i.test(clean)) {
      return t('phasePreset1');
    }
    if (/^init|^initial|^αρχική|^iniz|^нач/i.test(clean)) {
      return t('phasePreset3');
    }
    if (/^akut|^acute|^aguda|^aigu|^οξεία|^acuta|^острая/i.test(clean)) {
      return t('phasePreset2');
    }
  } else if (type === 'note') {
    if (/20\s*(minuten|minutes|minutos|min|λεπτά|минут).*(speisen|getränken|food|drinks|comidas|repas|γεύματα|pasti|еды)/i.test(clean)) {
      return t('intakeNote20MinMeals');
    }
    if (/zähneputzen|toothbrushing|cepillado|brossage|βούρτσισμα|denti|чистки\s*зубов|mentholfrei|menthol-free|sin\s*mentol|sans\s*menthol|χωρίς\s*μενθόλη|senza\s*mentolo|избегать\s*ментола|μέντα/i.test(clean)) {
      return t('intakeNoteToothbrushing');
    }
    if (/kaffee.*stimulan|coffee.*stimulant|café.*estimul|café.*stimulant|καφέ.*διεγερτικά|καφεΐνη|caffè.*stimol|кофе.*стимулятор/i.test(clean)) {
      return t('intakeNoteCoffeeStimulants');
    }
    if (/ruhe\s*und\s*entlastung|rest\s*and\s*relief|descanso\s*y\s*alivio|repos\s*suffisant|ανάπαυση\s*και\s*αποφόρτιση|adeguato\s*riposo|отдыхом\s*и\s*разгрузкой/i.test(clean)) {
      return t('intakeNoteRestRelief');
    }
    if (/schmerzlinderung.*strecken|pain\s*relief.*extend|alivio.*dolor.*espaciar|soulagement.*douleur.*espacer|ανακούφιση.*πόνο.*αραιώστε|sollievo.*dolore.*distanziare|облегчении\s*боли.*увеличьте/i.test(clean)) {
      return t('intakeNotePainReliefStop');
    }
    if (/zubettgehen.*alkohol|bedtime.*alcohol|acostarse.*alcohol|coucher.*alcool|ύπνο.*αλκοόλ|coricarsi.*alcol|сном.*алкогол/i.test(clean)) {
      return t('intakeNoteBedtimeAlcohol');
    }
    if (/frische\s*luft|fresh\s*air|aire\s*fresco|aération|καθαρό\s*αέρα|aria\s*fresca|свежего\s*воздуха/i.test(clean)) {
      return t('intakeNoteFreshAir');
    }
    if (/wärme\s*und\s*ruhe|warmth\s*and\s*rest|calor\s*y\s*el\s*reposo|chaleur\s*et\s*le\s*repos|ζέστη\s*και\s*η\s*ηρεμία|calore\s*e\s*il\s*riposo|тепло\s*и\s*покой/i.test(clean)) {
      return t('intakeNoteWarmthRest');
    }
    if (/voreilige\s*wiederholung|prematurely|prematuramente|prématurément|πρόωρα|преждевременно/i.test(clean)) {
      return t('intakeNoteNoPrematureRepeat');
    }
    if (/15\s*(minuten|minutes|minutos|min|λεπτά|минут)/i.test(clean)) {
      return t('intakeNote15MinMeals');
    }
  }

  return clean;
}

export function localizeRemedyItem(
  item: TherapyRemedyItem,
  t: (k: TranslationKey) => string
): TherapyRemedyItem {
  return {
    ...item,
    tagesdosis: getLocalizedPresetValue(item.tagesdosis, 'dose', t),
    haeufigkeit: getLocalizedPresetValue(item.haeufigkeit, 'freq', t),
    anwendungsdauer: getLocalizedPresetValue(item.anwendungsdauer, 'dur', t),
    zeitraum: getLocalizedPresetValue(item.zeitraum, 'phase', t),
    therapistNotes: getLocalizedPresetValue(item.therapistNotes, 'note', t),
  };
}

const KNOWN_DEFAULT_GENERAL_NOTES = [
  'Ausreichende Trinkmenge (stilles Wasser), Reizmilderung, Verzicht auf starke ätherische Öle (Kampfer, Menthol) während der Globuli-Einnahme.',
  'Adequate fluid intake (still water), stimulus reduction, avoid strong essential oils (camphor, menthol) during globule intake.',
  'Ingesta suficiente de agua sin gas, reducción de estímulos, evitar aceites esenciales fuertes (alcanfor, mentol) durante la toma de glóbulos.',
  'Ingesta suficiente de agua sin gas, evitar estímulos fuertes y aceites esenciales durante la toma de glóbulos.',
  'Boire suffisamment d’eau plate, réduire les stimuli, éviter les huiles essentielles fortes pendant la prise.',
  'Boire suffisamment d’eau plate, réduire les stimuli, éviter les huiles essentielles fortes (camphre, menthol) pendant la prise des granules.',
  'Boire suffisamment d\'eau plate, réduire les stimuli, éviter les huiles essentielles fortes (camphre, menthol) pendant la prise des granules.',
  'Επαρκής πρόσληψη υγρών (μη ανθρακούχο νερό), μείωση ερεθισμάτων, αποφυγή ισχυρών αιθέριων ελαίων (καμφορά, μενθόλη) κατά τη λήψη σφαιριδίων.',
  'Επαρκής πρόσληψη νερού, αποφυγή έντονων ερεθισμάτων και αιθέριων ελαίων κατά τη λήψη.',
  'Λήψη σύμφωνα με τις οδηγίες. Αποφύγετε ισχυρά αιθέρια έλαια (μέντα, καμφορά) και καφεΐνη πλησίον της λήψης.',
  'Bere abbondante acqua naturale, ridurre gli stimoli, evitare oli essenziali forti durante l’assunzione dei globuli.',
  'Bere abbondante acqua naturale, ridurre gli stimoli, evitare oli essenziali forti (canfora, mentolo) durante l\'assunzione dei globuli.',
  'Достаточное количество чистой воды (без газа), щадящий режим, исключение эфирных масел (камфора, ментол) во время приема крупинок.',
  'Достаточное количество чистой воды, щадящий режим, исключение эфирных масел при приеме крупинок.',
];

export function isDefaultGeneralNotes(str: string | undefined): boolean {
  if (!str || !str.trim()) return true;
  const trimmed = str.trim();
  return (
    KNOWN_DEFAULT_GENERAL_NOTES.some(note => note.trim() === trimmed) ||
    trimmed.startsWith('Ausreichende Trinkmenge') ||
    trimmed.startsWith('Adequate fluid intake') ||
    trimmed.startsWith('Ingesta suficiente') ||
    trimmed.startsWith('Boire suffisamment') ||
    trimmed.startsWith('Επαρκής πρόσληψη') ||
    trimmed.startsWith('Λήψη σύμφωνα') ||
    trimmed.startsWith('Bere abbondante') ||
    trimmed.startsWith('Достаточное количество')
  );
}

export function localizeDoctorField(
  val: string | undefined,
  field: 'notes' | 'specialty' | 'reason',
  t: (k: TranslationKey) => string
): string {
  if (!val || !val.trim()) return '';
  const clean = val.trim();

  if (field === 'notes') {
    if (/verschlechterung.*3|worsening.*3|empeoramiento.*3|aggravation.*3|επιδείνωσ.*3|peggioramento.*3|ухудшени.*3/i.test(clean)) {
      return t('doctorNotesWorsening3Days');
    }
    if (/routine|routinekontrolle|routine\s*check-up|control\s*de\s*rutina|contrôle\s*de\s*routine|προληπτικός\s*έλεγχος|τακτικός\s*επανέλεγχος|controllo\s*di\s*routine|планового\s*наблюдения/i.test(clean)) {
      return t('doctorNotesRoutineSufficient');
    }
  } else if (field === 'specialty') {
    if (/allgemeinmedizin|general\s*medicine|medicina\s*general|médecine\s*générale|γενική\s*ιατρική|παθολόγος|общая\s*терапия/i.test(clean)) {
      return t('specialtyGeneralOrSpecialist');
    }
    if (/hausarzt|general\s*practitioner|médico\s*de\s*cabecera|médecin\s*traitant|οικογενειακός\s*ιατρός|γενικός\s*ιατρός|medico\s*di\s*base|терапевт/i.test(clean)) {
      return t('specialtyGpOptional');
    }
  } else if (field === 'reason') {
    if (/keine\s*akuten|no\s*acute|no\s*se\s*detectaron|aucun\s*signal|δεν\s*διαπιστώθηκαν|δεν\s*υπάρχουν|nessun\s*segnale|острых\s*тревожных|острых\s*неотложных/i.test(clean)) {
      return t('noAcuteDoctorReason');
    }
    if (/warnhinweise|warnings|señales\s*de\s*advertencia|signes\s*d’alerte|signes\s*d'alerte|προειδοποιητικά|segnali\s*di\s*allarme|предупреждающие|настораживающие/i.test(clean)) {
      return t('redFlagsWarningReason');
    }
  }

  return clean;
}

export function localizeTherapyRecommendations(
  recs: TherapyRecommendations,
  t: (k: TranslationKey) => string
): TherapyRecommendations {
  return {
    ...recs,
    generalTherapyNotes: isDefaultGeneralNotes(recs.generalTherapyNotes)
      ? t('generalTherapyNoticeDefault')
      : recs.generalTherapyNotes,
    doctorConsultationSpecialty: localizeDoctorField(recs.doctorConsultationSpecialty, 'specialty', t),
    doctorConsultationNotes: localizeDoctorField(recs.doctorConsultationNotes, 'notes', t),
    doctorConsultationReason: localizeDoctorField(recs.doctorConsultationReason, 'reason', t),
    remedies: (recs.remedies || []).map(r => localizeRemedyItem(r, t)),
  };
}
