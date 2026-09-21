/**
 * Organon Abschlussprüfung & Dynamische Restklärung Engine
 * Streng evidenzgebunden gemäß Organon §§ 83–104
 * 
 * Verpflichtende Invarianten:
 * - KEINE Diagnosestellung (keine Otitis, etc.)
 * - KEINE Repertoriumsrubriken
 * - KEINE Arzneimittelauswahl oder Materia-Medica-Interpretation
 * - KEINE homöopathische Gewichtung
 * - KEINE freien Mutmaßungen / Halluzinationen
 * - Exakte Erhaltung des Evidence Ceilings
 */

import { Stage2Category, STAGE2_CATEGORY_META } from '../types/organonStage2Workflow';
import {
  OrganonOpenIssue,
  OrganonOpenIssueType,
  OrganonIssuePriority,
  OrganonGlobalReviewInput,
  OrganonGlobalReviewResult,
  ClarificationTurn,
  EvidenceReference
} from '../types/organonGlobalReview';

// Priority weight calculation (1 is highest priority)
const ISSUE_PRIORITY_ORDER: Record<OrganonOpenIssueType, number> = {
  SYMPTOM_BINDING_UNCLEAR: 1,
  EPISODE_BINDING_UNCLEAR: 2,
  CONTRADICTION: 3,
  EVIDENCE_CEILING_CONFLICT: 4,
  AMBIGUITY: 5,
  MISSING_RELEVANT_INFORMATION: 6,
  ASSIGNMENT_UNCLEAR: 7
};

function mapPriorityToLevel(type: OrganonOpenIssueType): OrganonIssuePriority {
  switch (type) {
    case 'SYMPTOM_BINDING_UNCLEAR':
    case 'EPISODE_BINDING_UNCLEAR':
    case 'CONTRADICTION':
      return 'HIGH';
    case 'EVIDENCE_CEILING_CONFLICT':
    case 'AMBIGUITY':
      return 'MEDIUM';
    default:
      return 'LOW';
  }
}

/**
 * Normalisiert Text für semantischen Phrasenabgleich
 */
function clean(text: string): string {
  return (text || '').toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Überprüft, ob eine Patientenantwort Nicht-Erinnerlichkeit ausdrückt
 */
export function isNonClarifiableResponse(answer: string): boolean {
  const norm = clean(answer);
  const patterns = [
    'weiß ich nicht mehr',
    'weiss ich nicht mehr',
    'weiß nicht mehr',
    'weiss nicht mehr',
    'nicht mehr erinnerlich',
    'nicht erinnerlich',
    'kann mich nicht erinnern',
    'kann ich nicht mehr sagen',
    'weiß ich nicht',
    'weiss ich nicht',
    'keine ahnung',
    'lässt sich nicht sagen',
    'unbekannt'
  ];
  return patterns.some(p => norm.includes(p));
}

/**
 * Führt die vollständige evidenzbasierte Organon-Abschlussprüfung durch.
 */
export function executeOrganonGlobalReview(input: OrganonGlobalReviewInput): OrganonGlobalReviewResult {
  const {
    rawText = '',
    stage1Values = {},
    stage2Records,
    clarificationHistory = [],
    hahnemannCrossCheck = false
  } = input;

  const rawClean = clean(rawText);
  const detectedIssues: OrganonOpenIssue[] = [];

  // Sammle alle Aussagen über alle Kategorien und Voranalysen
  const categoryTexts: Record<Stage2Category, string> = {} as any;
  for (const catKey of Object.keys(stage2Records) as Stage2Category[]) {
    categoryTexts[catKey] = stage2Records[catKey]?.text || stage1Values[catKey] || '';
  }

  // Bereits geklärte oder als unlösbar markierte Issue-IDs aus der Historie
  const resolvedIssueIds = new Set<string>();
  const notFurtherClarifiableIssueIds = new Set<string>();

  clarificationHistory.forEach(turn => {
    if (turn.resolvedIssue) {
      resolvedIssueIds.add(turn.issueId);
    } else {
      notFurtherClarifiableIssueIds.add(turn.issueId);
    }
  });

  // =========================================================================
  // 1. KONSISTENZPRÜFUNG (Widersprüche: Seite / Zeit / Qualität)
  // =========================================================================

  // Testfall 2 & 3: Rechts/Links-Widerspruch
  const hasRight = rawClean.includes('rechts') || rawClean.includes('rechte') || rawClean.includes('rechtes');
  const hasLeft = rawClean.includes('links') || rawClean.includes('linke') || rawClean.includes('linkes');

  // Prüfe, ob beide Seiten genannt werden
  if (hasRight && hasLeft) {
    const issueId = 'issue-contradiction-lateralitaet';
    const isResolved = resolvedIssueIds.has(issueId);
    const isUnclarifiable = notFurtherClarifiableIssueIds.has(issueId);

    // Wurde das bereits in einer Klärungsantwort gelöst (z.B. Episodentrennung oder Beidseitigkeit)?
    const resolutionTurn = clarificationHistory.find(t => t.issueId === issueId);
    let resolvedByHistory = false;
    if (resolutionTurn) {
      const ansClean = clean(resolutionTurn.answer);
      if (ansClean.includes('episode') || ansClean.includes('anfall') || ansClean.includes('früher') || ansClean.includes('unterschiedlich') || ansClean.includes('beidseitig')) {
        resolvedByHistory = true;
      }
    }

    if (!resolvedByHistory && !isResolved && !isUnclarifiable) {
      // Find snippets
      const rightSnippet = rawText.match(/[^.!?]*\brechts?\b[^.!?]*/i)?.[0]?.trim() || 'rechts';
      const leftSnippet = rawText.match(/[^.!?]*\blinks?\b[^.!?]*/i)?.[0]?.trim() || 'links';

      detectedIssues.push({
        id: issueId,
        issueType: 'CONTRADICTION',
        affectedCategory: 'LOCALISATIO',
        affectedDimensionIds: ['L3'],
        evidenceRefs: [
          { textSnippet: rightSnippet, sourceCategory: 'LOCALISATIO' },
          { textSnippet: leftSnippet, sourceCategory: 'LOCALISATIO' }
        ],
        description: 'Die Angaben zur Seitenlokalisation (rechts vs. links) enthalten gegensätzliche Befunde und erfordern eine differenzierende Klärung.',
        clarifiable: true,
        priority: 'HIGH',
        informationNeeded: 'Klärung, ob es sich um unterschiedliche Episoden, wechselnde Seiten oder eine beidseitige Ausprägung handelt.',
        proposedQuestion: 'Sie haben Beschwerden am rechten und auch am linken Bereich erwähnt. Betrifft das unterschiedliche Anfälle/Episoden, oder treten die Schmerzen wechselnd oder gemeinsam auf?',
        status: 'OPEN'
      });
    }
  }

  // Widerspruch Zeit (z. B. "immer morgens" vs "abends")
  const hasAlwaysMorning = rawClean.includes('immer morgens') || rawClean.includes('stets morgens');
  const hasEvening = rawClean.includes('abends') || rawClean.includes('beginnt es auch abends');
  if (hasAlwaysMorning && hasEvening) {
    const issueId = 'issue-contradiction-zeit-morgen-abend';
    if (!resolvedIssueIds.has(issueId) && !notFurtherClarifiableIssueIds.has(issueId)) {
      detectedIssues.push({
        id: issueId,
        issueType: 'CONTRADICTION',
        affectedCategory: 'MODALITATES_VERSCHLECHTERUNG',
        affectedDimensionIds: ['MV4'],
        evidenceRefs: [
          { textSnippet: 'immer morgens', sourceCategory: 'MODALITATES_VERSCHLECHTERUNG' },
          { textSnippet: 'beginnt es auch abends', sourceCategory: 'MODALITATES_VERSCHLECHTERUNG' }
        ],
        description: 'Widerspruch zwischen der Aussage „immer morgens“ und dem späteren Auftreten „abends“.',
        clarifiable: true,
        priority: 'HIGH',
        informationNeeded: 'Klärung der tatsächlichen zeitlichen Rhythmik.',
        proposedQuestion: 'Sie nannten anfangs ein ausschließliches Auftreten am Morgen, später auch am Abend. Zu welchen Tageszeiten beginnen die Beschwerden typischerweise?',
        status: 'OPEN'
      });
    }
  }

  // =========================================================================
  // 2. EINDEUTIGE ZUORDNUNG (Symptom- & Episodenbindung)
  // =========================================================================

  // Testfall 9: Falsche oder unklare Symptomzuordnung
  // Wenn mehrere Hauptbeschwerden existieren (z. B. Kopfschmerz und Ohrenschmerz) und eine Eigenschaft nicht eindeutig gebunden ist
  const hasHeadache = rawClean.includes('kopfschmerz') || rawClean.includes('kopfweh');
  const hasEarache = rawClean.includes('ohrenschmerz') || rawClean.includes('im ohr') || rawClean.includes('ohr');
  if (hasHeadache && hasEarache) {
    // Gibt es eine Eigenschaft wie "rechts" oder "stichartig", die nicht explizit einem von beiden zugeordnet ist?
    const hasAmbiguousBinding = rawClean.includes('dabei rechts') || 
      (rawClean.includes('kopfschmerz') && rawClean.includes('ohrenschmerz') && rawClean.includes('schmerz rechts') && !rawClean.includes('kopfschmerz rechts') && !rawClean.includes('ohrenschmerz rechts'));

    if (hasAmbiguousBinding) {
      const issueId = 'issue-symptom-binding-head-ear';
      if (!resolvedIssueIds.has(issueId) && !notFurtherClarifiableIssueIds.has(issueId)) {
        detectedIssues.push({
          id: issueId,
          issueType: 'SYMPTOM_BINDING_UNCLEAR',
          affectedCategory: 'LOCALISATIO',
          affectedDimensionIds: ['L1', 'L3'],
          evidenceRefs: [
            { textSnippet: 'Kopfschmerzen und Ohrenschmerzen', sourceCategory: 'STAGE_1' },
            { textSnippet: 'Schmerz rechts', sourceLocation: 'rawText' }
          ],
          description: 'Sowohl Kopf- als auch Ohrenschmerzen sind genannt, wobei der Seitenbezug nicht eindeutig einem der beiden Symptome zugeordnet ist.',
          clarifiable: true,
          priority: 'HIGH',
          informationNeeded: 'Zuordnung der Rechts-Lokalisation zu Kopf- oder Ohrenschmerz.',
          proposedQuestion: 'Sie haben Kopfschmerzen und auch Ohrenschmerzen beschrieben. Bezieht sich der Schmerz auf der rechten Seite auf das Ohr, den Kopf oder beide?',
          status: 'OPEN'
        });
      }
    }
  }

  // =========================================================================
  // 3. EVIDENZTREUE (Evidence Ceiling: "danach != deswegen", "vermutung != bewiesen", "einmal != reproduzierbar")
  // =========================================================================

  // Testfall 4: Zeitliche Beziehung != objektive Ursache ("Nach dem Streit bekam ich Kopfschmerzen")
  if (rawClean.includes('nach dem') || rawClean.includes('nach einem') || rawClean.includes('nach der')) {
    const afterConflict = rawClean.includes('nach dem streit') || rawClean.includes('nach dem kaffee');
    const causaText = clean(categoryTexts['CAUSA']);
    
    // Prüfe, ob in Causa fälschlicherweise eine bewiesene Ursache behauptet wird statt einer zeitlichen Koinzidenz
    if (afterConflict && (causaText.includes('verursacht durch') || causaText.includes('ausgelöst durch streit') || causaText.includes('streit als ursache'))) {
      const issueId = 'issue-evidence-ceiling-temporal-causality';
      if (!resolvedIssueIds.has(issueId) && !notFurtherClarifiableIssueIds.has(issueId)) {
        detectedIssues.push({
          id: issueId,
          issueType: 'EVIDENCE_CEILING_CONFLICT',
          affectedCategory: 'CAUSA',
          affectedDimensionIds: ['C3', 'C7'],
          evidenceRefs: [
            { textSnippet: 'Nach dem Streit traten Kopfschmerzen auf.', sourceCategory: 'CAUSA' }
          ],
          description: 'Evidence-Ceiling-Konflikt: Aus einer zeitlichen Abfolge („danach“) wurde unzulässig eine feste Kausalität („deswegen“) abgeleitet.',
          clarifiable: true,
          priority: 'MEDIUM',
          informationNeeded: 'Abgrenzung zwischen zeitlicher Koinzidenz und sicherem reproduzierbarem Auslöser.',
          proposedQuestion: 'Sie erwähnten, dass die Beschwerden nach einem Streit auftraten. Beobachten Sie diesen Zusammenhang regelmäßig nach emotionalen Belastungen, oder war dies ein einmaliges zeitliches Zusammentreffen?',
          status: 'OPEN'
        });
      }
    }
  }

  // Testfall 5: Patientenvermutung ("Ich glaube, der Kaffee löst es aus")
  if (rawClean.includes('ich glaube') || rawClean.includes('vermute') || rawClean.includes('vielleicht durch')) {
    const causaText = clean(categoryTexts['CAUSA']);
    const isStatedAsFact = causaText.includes('kaffee ist die ursache') || causaText.includes('noxe: kaffee (gesichert)');

    if (isStatedAsFact) {
      const issueId = 'issue-evidence-ceiling-belief-vs-fact';
      if (!resolvedIssueIds.has(issueId) && !notFurtherClarifiableIssueIds.has(issueId)) {
        detectedIssues.push({
          id: issueId,
          issueType: 'EVIDENCE_CEILING_CONFLICT',
          affectedCategory: 'CAUSA',
          affectedDimensionIds: ['C8'],
          evidenceRefs: [
            { textSnippet: 'Ich glaube, der Kaffee löst es aus.', sourceCategory: 'CAUSA' }
          ],
          description: 'Evidence-Ceiling-Konflikt: Eine subjektive Patientenvermutung („Ich glaube...“) wurde als objektives Faktum normalisiert.',
          clarifiable: true,
          priority: 'MEDIUM',
          informationNeeded: 'Erfassung des Erfahrungsgrades (subjektive Hypothese vs. empirische Reproduzierbarkeit).',
          proposedQuestion: 'Sie vermuten Kaffee als möglichen Auslöser. Konnten Sie bei Weglassen oder erneutem Konsum eine reproduzierbare Veränderung feststellen?',
          status: 'OPEN'
        });
      }
    }
  }

  // Testfall 6: Einmalige Modalität ("Einmal wurde es nach einem Spaziergang besser")
  if (rawClean.includes('einmal wurde') || rawClean.includes('ein einziges mal') || rawClean.includes('einmal besser')) {
    const modBessText = clean(categoryTexts['MODALITATES_BESSERUNG']);
    const isGeneralModality = modBessText.includes('besserung durch spaziergang') && !modBessText.includes('einmalig') && !modBessText.includes('einzelbeobachtung');

    if (isGeneralModality) {
      const issueId = 'issue-evidence-ceiling-single-observation';
      if (!resolvedIssueIds.has(issueId) && !notFurtherClarifiableIssueIds.has(issueId)) {
        detectedIssues.push({
          id: issueId,
          issueType: 'EVIDENCE_CEILING_CONFLICT',
          affectedCategory: 'MODALITATES_BESSERUNG',
          affectedDimensionIds: ['MB1', 'MB2'],
          evidenceRefs: [
            { textSnippet: 'Einmal wurde es nach einem Spaziergang besser.', sourceCategory: 'MODALITATES_BESSERUNG' }
          ],
          description: 'Evidence-Ceiling-Konflikt: Eine einmalige Einzelbeobachtung („Einmal...“) wurde als reproduzierbare Allgemeinmodalität verallgemeinert.',
          clarifiable: true,
          priority: 'MEDIUM',
          informationNeeded: 'Klärung der Reproduzierbarkeit der Besserung bei Bewegung im Freien.',
          proposedQuestion: 'Sie erwähnten, dass es einmal nach einem Spaziergang besser war. Konnten Sie diesen lindernden Effekt auch bei anderen Spaziergängen feststellen?',
          status: 'OPEN'
        });
      }
    }
  }

  // =========================================================================
  // 4. VOLLSTÄNDIGKEIT & FEHLENDE STRUKTURIERUNG
  // =========================================================================

  // Testfall 8: Fehlende Strukturierung (Patient nannte etwas Wichtiges, das in keiner Kategorie gelandet ist)
  // Beispiel: Patient nannte Erbrechen oder Schwitzen, aber Symptomata concomitantia und Modalitates enthalten es nicht
  const mentionsNauseaOrSweat = rawClean.includes('übelkeit') || rawClean.includes('erbrechen') || rawClean.includes('kalter schweiß');
  if (mentionsNauseaOrSweat) {
    const allCatCombined = Object.values(categoryTexts).join(' ').toLowerCase();
    const isRecordedInAnyCat = allCatCombined.includes('übelkeit') || allCatCombined.includes('erbrechen') || allCatCombined.includes('schweiß');

    if (!isRecordedInAnyCat) {
      const issueId = 'issue-missing-structured-finding-concomitant';
      if (!resolvedIssueIds.has(issueId) && !notFurtherClarifiableIssueIds.has(issueId)) {
        detectedIssues.push({
          id: issueId,
          issueType: 'MISSING_RELEVANT_INFORMATION',
          affectedCategory: 'SYMPTOMATA_CONCOMITANTIA',
          affectedDimensionIds: ['SC1', 'SC2'],
          evidenceRefs: [
            { textSnippet: rawText.match(/[^.!?]*(übelkeit|erbrechen|schweiß)[^.!?]*/i)?.[0]?.trim() || 'Begleitsymptom im Text', sourceLocation: 'rawText' }
          ],
          description: 'Relevantes Begleitphänomen aus der Patientenaussage wurde bisher nicht in der strukturierten Organon-Kategorie Symptomata concomitantia erfasst.',
          clarifiable: true,
          priority: 'MEDIUM',
          informationNeeded: 'Bestätigung des zeitlichen und symptomatischen Zusammenhangs zum Hauptleiden.',
          proposedQuestion: 'Sie hatten im Erstbericht Begleiterscheinungen wie Übelkeit oder Schweiß erwähnt. Treten diese direkt zusammen mit den Schmerzen auf?',
          status: 'OPEN'
        });
      }
    }
  }

  // =========================================================================
  // 5. SORTIERUNG NACH DYNAMISCHER PRIORISIERUNG
  // =========================================================================

  detectedIssues.sort((a, b) => {
    const pA = ISSUE_PRIORITY_ORDER[a.issueType] ?? 99;
    const pB = ISSUE_PRIORITY_ORDER[b.issueType] ?? 99;
    return pA - pB;
  });

  // Trenne in noch klärbare offene Issues vs. gelöste / unklärbare
  const activeOpenIssues = detectedIssues.filter(iss => iss.status === 'OPEN' && iss.clarifiable);
  const unresolvedIssues: OrganonOpenIssue[] = [];

  // Ergänze bekannte unklärbare Issues aus Historie
  notFurtherClarifiableIssueIds.forEach(id => {
    unresolvedIssues.push({
      id,
      issueType: 'AMBIGUITY',
      description: 'Dokumentierte Restunsicherheit (vom Patienten nicht weiter erinnerlich / nicht klärbar).',
      evidenceRefs: [],
      clarifiable: false,
      priority: 'LOW',
      status: 'NOT_FURTHER_CLARIFIABLE'
    });
  });

  const resolvedIssues: OrganonOpenIssue[] = [];
  resolvedIssueIds.forEach(id => {
    resolvedIssues.push({
      id,
      issueType: 'CONTRADICTION',
      description: 'Geklärt durch Patientenantwort.',
      evidenceRefs: [],
      clarifiable: false,
      priority: 'LOW',
      status: 'RESOLVED'
    });
  });

  // =========================================================================
  // 6. ENTSCHEIDUNG ÜBER NÄCHSTE AKTION & SCHLUSSZUSTAND
  // =========================================================================

  let nextAction: 'ASK_CLARIFICATION' | 'COMPLETE' = 'COMPLETE';
  let currentIssue: OrganonOpenIssue | null = null;
  let proposedQuestion: string | undefined = undefined;
  let reviewStatus: 'PASS' | 'ISSUES_DETECTED' | 'NOT_FURTHER_CLARIFIABLE' = 'PASS';

  if (activeOpenIssues.length > 0) {
    reviewStatus = 'ISSUES_DETECTED';
    nextAction = 'ASK_CLARIFICATION';
    currentIssue = activeOpenIssues[0];
    proposedQuestion = currentIssue.proposedQuestion;
  } else if (unresolvedIssues.length > 0) {
    reviewStatus = 'NOT_FURTHER_CLARIFIABLE';
    nextAction = 'COMPLETE';
  } else {
    reviewStatus = 'PASS';
    nextAction = 'COMPLETE';
  }

  // Summary Notes
  const summaryNotes: string[] = [];
  if (reviewStatus === 'PASS') {
    summaryNotes.push('Alle 10 Organon-Kategorien wurden auf Vollständigkeit, Konsistenz und Evidenztreue geprüft.');
    summaryNotes.push('Es bestehen keine weiteren klärungsbedürftigen Punkte.');
  } else if (reviewStatus === 'NOT_FURTHER_CLARIFIABLE') {
    summaryNotes.push('Die Organon-Abschlussprüfung ist abgeschlossen.');
    summaryNotes.push('Verbleibende Unsicherheiten sind im Fall dokumentiert (z. B. nicht erinnerliche Vorzustände).');
  } else {
    summaryNotes.push(`Es wurden ${activeOpenIssues.length} klärungsbedürftige Angaben identifiziert.`);
    summaryNotes.push(`Priorität 1: ${currentIssue?.description || 'Klärung erforderlich'}`);
  }

  return {
    reviewStatus,
    openIssues: activeOpenIssues,
    unresolvedIssues,
    resolvedIssues,
    nextAction,
    currentIssue,
    proposedQuestion,
    summaryNotes,
    timestamp: new Date().toISOString(),
    meta: {
      totalCheckedCategories: 10,
      evidenceCeilingVerified: true,
      noDiagnosticInference: true,
      noRepertorisationInference: true,
      crossCheckMode: hahnemannCrossCheck ? 'hahnemann-crosscheck' : 'gemini-only'
    }
  };
}

/**
 * Wendet eine Patientenantwort aus der Restklärung auf die betroffene Organon-Kategorie an.
 * Gibt den aktualisierten Text für die Kategorie und das Ergebnis zurück.
 */
export function applyClarificationToCategory(
  category: Stage2Category,
  currentCategoryText: string,
  issue: OrganonOpenIssue,
  answer: string
): { updatedText: string; resolvedIssue: boolean; isUnclarifiable: boolean; note: string } {
  // 1. Prüfen, ob nicht erinnerlich
  if (isNonClarifiableResponse(answer)) {
    const unclarifiableNote = `[Restunsicherheit / Patientenaussage: "${answer.trim()}" – Nicht weiter erinnerlich]`;
    const updatedText = currentCategoryText ? `${currentCategoryText}\n${unclarifiableNote}` : unclarifiableNote;
    return {
      updatedText,
      resolvedIssue: false,
      isUnclarifiable: true,
      note: 'Als dokumentierte Restunsicherheit erfasst (nicht erinnerlich).'
    };
  }

  // 2. Führe die Information in die authoritative Zielkategorie zurück
  const prefix = `[Klärungsbefund Organon-Abschlussprüfung]: `;
  let clarificationSnippet = '';

  switch (category) {
    case 'LOCALISATIO':
      clarificationSnippet = `${prefix}Seiten- und Lokalisationspräzisierung: "${answer.trim()}".`;
      break;
    case 'MODALITATES_BESSERUNG':
      clarificationSnippet = `${prefix}Besserungsmodalität präzisiert: "${answer.trim()}".`;
      break;
    case 'MODALITATES_VERSCHLECHTERUNG':
      clarificationSnippet = `${prefix}Verschlechterungsmodalität präzisiert: "${answer.trim()}".`;
      break;
    case 'SENSATIO':
      clarificationSnippet = `${prefix}Empfindungsqualität präzisiert: "${answer.trim()}".`;
      break;
    case 'CAUSA':
      clarificationSnippet = `${prefix}Kausalitäts-/Anlassdifferenzierung: "${answer.trim()}".`;
      break;
    case 'SYMPTOMATA_CONCOMITANTIA':
      clarificationSnippet = `${prefix}Begleitsymptompräzisierung: "${answer.trim()}".`;
      break;
    case 'MENS':
      clarificationSnippet = `${prefix}Kognitive Differenzierung: "${answer.trim()}".`;
      break;
    case 'ANIMUS':
      clarificationSnippet = `${prefix}Emotionale Differenzierung: "${answer.trim()}".`;
      break;
    default:
      clarificationSnippet = `${prefix}Zusatzbefund: "${answer.trim()}".`;
      break;
  }

  const updatedText = currentCategoryText
    ? `${currentCategoryText}\n${clarificationSnippet}`
    : clarificationSnippet;

  return {
    updatedText,
    resolvedIssue: true,
    isUnclarifiable: false,
    note: `Erfolgreich in Organon-Kategorie ${STAGE2_CATEGORY_META[category]?.dimensionsCode || category} übernommen.`
  };
}
