import { AnamnesisQuestion, QuestionType, LanguageCode } from '../types';
import { SCALE_LABELS } from './complaintQuestionGeneratorData';

export const SCALE_LABELS_1_TO_4 = SCALE_LABELS;

export interface ComplaintCategoryDef {
  keywords: string[];
  title: string;
  generateQuestions: (complaintName: string, lang: LanguageCode) => AnamnesisQuestion[];
}

/**
 * Knowledge base of tailored question templates according to classical homeopathic anamnesis.
 */
export const COMPLAINT_ARCHETYPES: Record<string, ComplaintCategoryDef> = {
  kopfschmerz: {
    keywords: ['kopf', 'migräne', 'cephalgie', 'stirn', 'schläfe', 'hinterkopf', 'halbseitig', 'spannungskopfschmerz', 'cluster', 'scheitel', 'head', 'migraine', 'frontal', 'temple', 'occiput', 'vertex', 'tête', 'front', 'tempe', 'occiput', 'dolor de cabeza', 'frente', 'sien', 'nuca', 'mal di testa', 'testa', 'tempia', 'πονοκέφαλος', 'κεφάλι', 'ημικρανία', 'μέτωπο', 'κρόταφος', 'ινίο', 'голова', 'мигрень', 'затылок', 'висок', 'темя'],
    title: 'Kopfschmerzen & Migräne',
    generateQuestions: (complaintName, lang) => [
      {
        id: 'q_kopf_beginn',
        category: lang === 'de' ? 'Zeitverlauf & Beginn' : (lang === 'el' ? 'Χρόνος & Έναρξη' : 'Onset & Timeline'),
        question: lang === 'de' ? `Seit wann bestehen die Beschwerden bezüglich "${complaintName}" und beginnen sie plötzlich oder schleichend?` :
                  lang === 'el' ? `Από πότε υπάρχουν τα ενοχλήματα σχετικά με "${complaintName}" και αρχίζουν ξαφνικά ή σταδιακά;` :
                  `How long have you had complaints regarding "${complaintName}" and do they start suddenly or gradually?`,
        type: 'choice',
        options: lang === 'de' ? [
          'Plötzlich einschießend (akut)',
          'Schleichend / langsam zunehmend',
          'Periodisch / anfallsartig (z.B. wöchentlich/monatlich)',
          'Nach konkretem Auslöser (Stress, Kälte, Sonne, Schlafmangel)',
        ] : lang === 'el' ? [
          'Ξαφνική έναρξη (οξεία)',
          'Σταδιακή / αργή αύξηση',
          'Περιοδικά / κατά κρίσεις (π.χ. εβδομαδιαία/μηνιαία)',
          'Μετά από συγκεκριμένο έναυσμα (στρες, κρύο, ήλιος, έλλειψη ύπνου)',
        ] : [
          'Sudden onset (acute)',
          'Gradual / slowly increasing',
          'Periodic / paroxysmal (e.g. weekly/monthly)',
          'After a specific trigger (stress, cold, sun, lack of sleep)',
        ],
        helpText: lang === 'de' ? 'Erfasst die Dynamik des Auftretens (akuter Beginn vs. chronisch-schleichender Verlauf).' : 'Records the dynamics of occurrence.',
      },
      {
        id: 'q_kopf_ort',
        category: lang === 'de' ? 'Lokalisation & Seitigkeit' : (lang === 'el' ? 'Εντόπιση & Πλευρικότητα' : 'Location & Sidedness'),
        question: lang === 'de' ? `Wo genau im Kopf spüren Sie "${complaintName}"?` :
                  lang === 'el' ? `Πού ακριβώς στο κεφάλι αισθάνεστε "${complaintName}";` :
                  `Where exactly in the head do you feel "${complaintName}"?`,
        type: 'multi_choice',
        options: lang === 'de' ? [
          'Stirn & über den Augen (Frontal)',
          'Schläfe rechts (einseitig rechts)',
          'Schläfe links (einseitig links)',
          'Hinterkopf & Nacken',
          'Scheitelpunkt (wie ein schwerer Deckel)',
          'Tief hinter den Augen / Augenhöhlen',
        ] : lang === 'el' ? [
          'Μέτωπο & πάνω από τα μάτια (Μετωπιαία)',
          'Δεξιός κρόταφος (δεξιά πλευρά)',
          'Αριστερός κρόταφος (αριστερή πλευρά)',
          'Ινίο & αυχένας',
          'Κορυφή (σαν βαρύ καπάκι)',
          'Βαθιά πίσω από τα μάτια / οφθαλμικοί κόγχοι',
        ] : [
          'Forehead & above the eyes (Frontal)',
          'Right temple (right-sided)',
          'Left temple (left-sided)',
          'Back of head & neck',
          'Vertex (like a heavy lid)',
          'Deep behind the eyes / eye sockets',
        ],
        helpText: lang === 'de' ? 'Genaue anatomische Lokalisation und Seitigkeit (rechts/links) im Kopfbereich.' : 'Precise anatomical location.',
      },
      {
        id: 'q_kopf_charakter',
        category: lang === 'de' ? 'Schmerzcharakter' : (lang === 'el' ? 'Χαρακτήρας πόνου' : 'Pain Character'),
        question: lang === 'de' ? `Wie würden Sie die Empfindung bei "${complaintName}" beschreiben? Eher drückend, stechend, ziehend, pulsierend oder anders?` :
                  lang === 'el' ? `Πώς θα περιγράφατε την αίσθηση στο "${complaintName}"; Περισσότερο σαν πίεση, τσίμπημα, τράβηγμα, παλμό ή κάτι άλλο;` :
                  `How would you describe the sensation of "${complaintName}"? More pressing, stinging, pulling, pulsating or otherwise?`,
        type: 'multi_choice',
        options: lang === 'de' ? [
          'Pulsierend, pochend, klopfend (wie Herzhämmern)',
          'Drückend (wie ein enges Band oder Schraubstock)',
          'Stechend / nadelartig / messerscharf',
          'Ziehend, reißend oder wandernd',
          'Brennend wie glühende Kohlen',
          'Dumpf, schwer und benebelnd',
        ] : lang === 'el' ? [
          'Παλλόμενος, σφύζων, κτυπώδης (σαν κτύπος καρδιάς)',
          'Πιεστικός (σαν σφικτή ζώνη ή μέγγενη)',
          'Νυγματώδης / σαν βελόνα / κοφτερός',
          'Ελκτικός, σχιστικός ή μετακινούμενος',
          'Καυσαλγικός σαν αναμμένα κάρβουνα',
          'Αμβλύς, βαρύς και θολωτικός',
        ] : [
          'Pulsating, throbbing, pounding (like heart hammering)',
          'Pressing (like a tight band or vise)',
          'Stinging / needle-like / sharp',
          'Pulling, tearing or wandering',
          'Burning like glowing coals',
          'Dull, heavy and numbing',
        ],
        helpText: lang === 'de' ? 'Präzise Differenzierung der Schmerzempfindung.' : 'Precise differentiation of sensation.',
      },
      {
        id: 'q_kopf_skala',
        category: lang === 'de' ? 'Intensität & Skala (1-4)' : (lang === 'el' ? 'Ένταση & Κλίμακα (1-4)' : 'Intensity & Scale (1-4)'),
        question: lang === 'de' ? `Wie stark sind die Beschwerden bezüglich "${complaintName}" aktuell und im schlimmsten Fall auf der Skala von 1 bis 4?` :
                  lang === 'el' ? `Πόσο έντονα είναι τα ενοχλήματα σχετικά με "${complaintName}" τώρα και στη χειρότερη περίπτωση στην κλίμακα από το 1 έως το 4;` :
                  `How strong are the complaints regarding "${complaintName}" currently and in the worst case on a scale of 1 to 4?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 4,
        scaleLabels: SCALE_LABELS[lang] || SCALE_LABELS['de'],
        helpText: lang === 'de' ? 'Klicken Sie auf 1 bis 4 für den aktuellen Status und den maximalen Spitzenwert.' : 'Click 1 to 4 for status.',
      }
    ]
  },
  generic: {
    keywords: [],
    title: 'Allgemeine Beschwerde',
    generateQuestions: (complaintName, lang) => [
      {
        id: 'q_gen_beginn',
        category: lang === 'de' ? 'Zeitverlauf' : (lang === 'el' ? 'Χρονική πορεία' : 'Timeline'),
        question: lang === 'de' ? `Seit wann genau leiden Sie unter "${complaintName}"?` :
                  lang === 'el' ? `Από πότε ακριβώς υποφέρετε από "${complaintName}";` :
                  `Exactly since when have you been suffering from "${complaintName}"?`,
        type: 'text',
        helpText: lang === 'de' ? 'Erfasst den zeitlichen Rahmen.' : 'Timeline.',
      },
      {
        id: 'q_gen_charakter',
        category: lang === 'de' ? 'Empfindung' : (lang === 'el' ? 'Αίσθηση' : 'Sensation'),
        question: lang === 'de' ? `Wie genau fühlt sich "${complaintName}" an?` :
                  lang === 'el' ? `Πώς ακριβώς αισθάνεστε το "${complaintName}";` :
                  `How exactly does "${complaintName}" feel?`,
        type: 'multi_choice',
        options: lang === 'de' ? [
          'Stechend', 'Brennend', 'Drückend', 'Ziehend', 'Taubheitsgefühl', 'Pulsierend', 'Krampfartig'
        ] : lang === 'el' ? [
          'Νυγματώδες', 'Καυσαλγικό', 'Πιεστικό', 'Ελκτικό', 'Μούδιασμα', 'Σφύζων', 'Σπασμωδικό'
        ] : [
          'Stinging', 'Burning', 'Pressing', 'Pulling', 'Numbness', 'Pulsating', 'Cramping'
        ],
      },
      {
        id: 'q_gen_skala',
        category: lang === 'de' ? 'Intensität' : (lang === 'el' ? 'Ένταση' : 'Intensity'),
        question: lang === 'de' ? `Auf einer Skala von 1 bis 4: Wie stark ist "${complaintName}"?` :
                  lang === 'el' ? `Σε μια κλίμακα από το 1 έως το 4: Πόσο έντονο είναι το "${complaintName}";` :
                  `On a scale from 1 to 4: How strong is "${complaintName}"?`,
        type: 'scale',
        scaleMin: 1,
        scaleMax: 4,
        scaleLabels: SCALE_LABELS[lang] || SCALE_LABELS['de'],
      }
    ]
  }
};

/**
 * Standard questions if no archetype matches.
 */
export function generateGenericQuestions(complaintName: string, lang: LanguageCode = 'de'): AnamnesisQuestion[] {
  return COMPLAINT_ARCHETYPES.generic.generateQuestions(complaintName, lang);
}

/**
 * Heuristic to clean and normalize a raw complaint text into a core entity.
 */
export function cleanComplaintEntity(rawText: string): string {
  if (!rawText) return '';
  let clean = rawText.toLowerCase().trim();
  
  // Multi-language common fillers
  const fillers = [
    'ich habe', 'i have', 'j\'ai', 'tengo', 'ho', 'έχω', 'у меня',
    'meine', 'my', 'mon', 'mi', 'il mio', 'μου', 'мой',
    'beschwerden', 'complaints', 'maux', 'molestias', 'disturbi', 'ενοχλήματα', 'жалобы',
    'seit', 'since', 'depuis', 'desde', 'da', 'από', 'с',
    'schmerzen', 'pains', 'douleurs', 'dolores', 'dolori', 'πόνοι', 'боли'
  ];

  fillers.forEach(f => {
    const reg = new RegExp(`^${f}\\s+`, 'i');
    clean = clean.replace(reg, '');
  });

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/**
 * Splits a potentially complex user statement into multiple distinct complaint entities.
 */
export function splitMultipleComplaints(input: string): string[] {
  if (!input) return [];
  
  // Multi-language separators
  const separators = /und|and|et|y|e|και|и|,|\.|\/|;|plus|\+/i;
  const parts = input.split(separators);
  
  return parts
    .map(p => cleanComplaintEntity(p))
    .filter(p => p.length > 3);
}

/**
 * High-level service that analyzes the user's input and returns a set of tailored questions.
 * Supports merging with existing questions to preserve answers.
 */
export function generateQuestionsForComplaint(
  complaintName: string, 
  existingQuestions: AnamnesisQuestion[] = [],
  lang: LanguageCode = 'de'
): AnamnesisQuestion[] {
  if (!complaintName) return [];

  const lower = complaintName.toLowerCase();
  let baseQuestions: AnamnesisQuestion[] = [];
  
  let found = false;
  for (const key in COMPLAINT_ARCHETYPES) {
    if (key === 'generic') continue;
    const def = COMPLAINT_ARCHETYPES[key];
    if (def.keywords.some(k => lower.includes(k))) {
      baseQuestions = def.generateQuestions(complaintName, lang);
      found = true;
      break;
    }
  }

  if (!found) {
    baseQuestions = generateGenericQuestions(complaintName, lang);
  }

  // Merge logic: prefer existing answers if IDs match
  return baseQuestions.map(nq => {
    const existing = existingQuestions.find(eq => eq.id === nq.id && eq.complaintName === complaintName);
    if (existing) {
      return { ...nq, ...existing };
    }
    return { ...nq, complaintName };
  });
}

/**
 * @deprecated Use generateQuestionsForComplaint instead.
 */
export function generateQuestionsForSingleComplaint(
  complaintName: string, 
  existingQuestions: AnamnesisQuestion[] = [],
  lang: LanguageCode = 'de'
): AnamnesisQuestion[] {
  return generateQuestionsForComplaint(complaintName, existingQuestions, lang);
}

export function summarizeQuestionsToAnamnese(questions: AnamnesisQuestion[], lang: LanguageCode = 'de'): {
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

  const labels = SCALE_LABELS[lang] || SCALE_LABELS['de'];

  // Group questions by complaint
  const complaintGroups = new Map<string, AnamnesisQuestion[]>();
  questions.forEach((q) => {
    const compName = q.complaintName || (lang === 'de' ? 'Hauptbeschwerde' : 'Chief Complaint');
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
        return;
      }

      const cat = (q.category || '').toLowerCase();
      const isPsyche = cat.includes('gemüt') || cat.includes('psyche') || cat.includes('mind') || cat.includes('ψυχισμός');

      if (isPsyche) {
        if (hasChoice) compGemuet.push(`${q.category}: ${q.answerChoice}`);
        if (hasMultiChoice) compGemuet.push(`${q.category}: ${q.answerMultiChoice!.join(', ')}`);
        if (hasText) compGemuet.push(q.answerText!);
        if (hasScale) {
          const cur = q.answerScaleCurrent ? `${q.answerScaleCurrent}/4 (${labels[q.answerScaleCurrent]})` : '';
          const wst = q.answerScaleWorst ? `Peak: ${q.answerScaleWorst}/4 (${labels[q.answerScaleWorst]})` : '';
          const scaleStr = [cur ? `Cur: ${cur}` : '', wst].filter(Boolean).join(' | ');
          if (scaleStr) compGemuet.push(scaleStr);
        }
      } else if (cat.includes('lokalisation') || cat.includes('location') || cat.includes('εντόπιση') || cat.includes('charakter') || cat.includes('χαρακτήρας')) {
        if (hasMultiChoice) compLocal.push(`${q.category}: ${q.answerMultiChoice!.join(', ')}`);
        if (hasChoice) compLocal.push(q.answerChoice!);
        if (hasText) compLocal.push(q.answerText!);
      } else if (hasScale) {
        const cur = q.answerScaleCurrent ? `${q.answerScaleCurrent}/4 (${labels[q.answerScaleCurrent]})` : '';
        const wst = q.answerScaleWorst ? `Peak: ${q.answerScaleWorst}/4 (${labels[q.answerScaleWorst]})` : '';
        const scaleStr = [cur ? `Cur: ${cur}` : '', wst].filter(Boolean).join(' | ');
        if (scaleStr) compReport.push(`${q.category}: ${scaleStr}`);
      } else {
        if (hasChoice) compReport.push(`${q.category}: ${q.answerChoice}`);
        if (hasMultiChoice) compReport.push(`${q.category}: ${q.answerMultiChoice!.join(', ')}`);
        if (hasText) compReport.push(q.answerText!);
      }
    });

    if (compReport.length > 0) {
      if (isMulti) reportParts.push(`--- ${compName} ---`);
      reportParts.push(compReport.join('\n'));
    }

    if (compLocal.length > 0) {
      if (isMulti) localParts.push(`--- ${compName} ---`);
      localParts.push(compLocal.join('\n'));
    }

    if (compGemuet.length > 0) {
      if (isMulti) gemuetParts.push(`--- ${compName} ---`);
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
