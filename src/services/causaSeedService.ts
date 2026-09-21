import { 
  CanonicalCausaState, 
  AtomicCausaFact, 
  CausaDimensionState, 
  CAUSA_DIMENSION_KEYS,
  CausaDimensionId,
  EpistemicFactStatus,
  PatientConfidence,
  EpistemicRelation
} from '../types/causaDeepDive';
import { EndprueferResult, EndprueferCategoryDecision, EndprueferAtomicClaim } from '../types';

/**
 * Initialisiert ein leeres Dimensions-Dictionary mit Status UNERHOBEN und APPLIKABEL.
 */
export function createInitialDimensionStates(): Record<CausaDimensionId, CausaDimensionState> {
  const dims = {} as Record<CausaDimensionId, CausaDimensionState>;
  for (const key of CAUSA_DIMENSION_KEYS) {
    dims[key] = {
      completion: 'UNERHOBEN',
      applicability: 'APPLIKABEL'
    };
  }
  return dims;
}

/**
 * Hilfsfunktion: Bestimmt, ob eine Aussage epistemische Unsicherheitsmarker trägt.
 */
export function detectEpistemicConfidence(text: string): PatientConfidence {
  const lower = text.toLowerCase();
  if (lower.includes('weiß nicht') || lower.includes('weiss nicht') || lower.includes('nicht erinnerlich') || lower.includes('keine erinnerung')) {
    return 'WEISS_NICHT';
  }
  if (
    lower.includes('scheint') ||
    lower.includes('vielleicht') ||
    lower.includes('könnte') ||
    lower.includes('koennte') ||
    lower.includes('kann sein') ||
    lower.includes('nicht sicher') ||
    lower.includes('unsicher') ||
    lower.includes('bilde ich mir') ||
    lower.includes('vermute') ||
    lower.includes('glaube')
  ) {
    return lower.includes('vermute') || lower.includes('glaube') ? 'VERMUTUNG' : 'UNSICHER_SCHWANKEND';
  }
  return 'SICHERE_BEOBACHTUNG';
}

/**
 * Hilfsfunktion: Erkennt, ob eine Äußerung über ein Ereignis lediglich die Unfähigkeit zur Benennung/Erinnerung
 * darstellt oder einen echten expliziten Ausschluss.
 * 
 * BINDENDE REGEL: NICHT BENENNBAR != VERNEINT
 * "kann kein Ereignis nennen" -> NICHT_ERINNERLICH / UNSICHER
 * "gab definitiv kein Ereignis" -> AUSDRÜCKLICH_VERNEINT
 */
export function determineFactStatusForStatement(text: string): EpistemicFactStatus {
  const lower = text.toLowerCase();

  // Echter expliziter Ausschluss
  if (
    lower.includes('definitiv kein') ||
    lower.includes('ausdrücklich verneint') ||
    lower.includes('überhaupt kein anlass') ||
    lower.includes('keinerlei ereignis vorhanden') ||
    lower.includes('gab sicher kein')
  ) {
    return 'AUSDRÜCKLICH_VERNEINT';
  }

  // Unfähigkeit zur Benennung / Erinnerung
  if (
    lower.includes('kann kein') ||
    lower.includes('könne kein') ||
    lower.includes('kann keinen') ||
    lower.includes('könne sie nicht nennen') ||
    lower.includes('kann nicht nennen') ||
    lower.includes('fällt kein') ||
    lower.includes('nicht erinnerlich') ||
    lower.includes('erinnert sich nicht') ||
    lower.includes('weiß nicht mehr') ||
    lower.includes('weiss nicht mehr')
  ) {
    return 'NICHT_ERINNERLICH';
  }

  if (lower.includes('vielleicht') || lower.includes('scheint') || lower.includes('nicht sicher')) {
    return 'UNSICHER';
  }

  if (lower.includes('widersprüchlich') || lower.includes('widerspricht')) {
    return 'WIDERSPRÜCHLICH';
  }

  return 'BELEGT_FAKTISCH';
}

/**
 * Bereinigt Fallback-Text von homöopathischen Interpretationen oder Repertorisationstexten.
 * Reines Patientenmaterial darf nicht mit Repertorisationen vermengt werden.
 */
export function sanitizeCausaPatientText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\(?\s*Homöopathische Interpretation:[^)]*\)?/gi, '')
    .replace(/Klassische Einzelfall-Repertorisation/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Überführt ein validiertes Organon-Endprüfer-Ergebnis (und den unveränderten Patienten-Rohtext)
 * in einen initialen, konsistenten CanonicalCausaState (Causa-Seed).
 * 
 * BINDENDE REGELN:
 * 1. Vollständiger Datenimport: Liest alle relevanten Endprüfer-Kategorien (Causa, Localisatio,
 *    Modalitates, Comorbiditas, Symptomata concomitantia, Animus/Mens) aus.
 * 2. FactStatus und DimensionCompletion bleiben getrennt:
 *    Ein Fact kann BELEGT_FAKTISCH sein, die DimensionCompletion bleibt dennoch TEILWEISE_ERHOBEN.
 * 3. Keine Repertorisationstexte in Patientenfakten.
 * 4. NICHT_ERINNERLICH erzeugt einen Eintrag in terminalPaths.
 */
export function seedCausaStateFromOrganonEndpruefer(
  rawText: string,
  endprueferResult: EndprueferResult | null,
  existingCausaFallbackText: string = ''
): CanonicalCausaState {
  const dimensions = createInitialDimensionStates();
  const facts: AtomicCausaFact[] = [];
  const openAmbiguities: string[] = [];
  const terminalPaths: string[] = [];

  const cleanRaw = (rawText || '').trim();
  const sanitizedFallback = sanitizeCausaPatientText(existingCausaFallbackText);

  // Helper zum Hinzufügen von atomaren Fakten mit semantischer Deduplizierung
  const addFact = (
    dimId: CausaDimensionId,
    factType: string,
    evidenceText: string,
    claimText: string,
    semanticTarget: string,
    forceStatus?: EpistemicFactStatus
  ) => {
    if (!claimText || !claimText.trim()) return;
    const cleanClaim = claimText.trim();
    // Prüfen, ob für dieses semantische Ziel bereits ein identischer oder gleichwertiger Fakt vorliegt
    const isDuplicate = facts.some(f => 
      f.dimensionId === dimId && 
      (f.normalizedValue?.semanticTarget === semanticTarget || f.evidenceText === evidenceText || f.normalizedValue?.text === cleanClaim)
    );
    if (isDuplicate) return;

    const status = forceStatus || determineFactStatusForStatement(cleanClaim + ' ' + (evidenceText || ''));
    const confidence = detectEpistemicConfidence(cleanClaim + ' ' + (evidenceText || ''));

    facts.push({
      factId: `SEED_F0${facts.length + 1}`,
      dimensionId: dimId,
      factType,
      evidenceText: evidenceText || cleanClaim,
      sourceTurn: 0,
      episodeId: 'EP_INITIAL',
      normalizedValue: {
        text: cleanClaim,
        semanticTarget,
        epistemischerQualifikator: confidence === 'UNSICHER_SCHWANKEND' ? 'unsicher' : undefined
      },
      epistemicStatus: status,
      patientConfidence: confidence,
      epistemicLink: status === 'BELEGT_FAKTISCH' ? 'ZEITLICHE_KOINZIDENZ' : 'SUBJEKTIVE_HYPOTHESE'
    });

    if (status === 'NICHT_ERINNERLICH') {
      const termEntry = `${dimId}:${semanticTarget} - Patient erinnert den Sachverhalt nicht. Nicht erneut erfragen.`;
      if (!terminalPaths.includes(termEntry)) {
        terminalPaths.push(termEntry);
      }
    }
  };

  // 1. Kategorien aus Endprüfer analysieren
  if (endprueferResult && Array.isArray(endprueferResult.category_checks)) {
    for (const catDecision of endprueferResult.category_checks) {
      const catName = (catDecision.category || '').toLowerCase();
      const isCorrectionReq = catDecision.decision === 'CORRECTION_REQUIRED';
      const approvedText = isCorrectionReq && catDecision.minimal_correction
        ? catDecision.minimal_correction
        : catDecision.schiedsrichter_result;
      const snippet = catDecision.raw_text_snippet || cleanRaw.slice(0, 100);

      const atomicClaims = catDecision.atomic_claims || [];
      const supportedClaims = atomicClaims.filter(ac => ac.is_supported !== false && ac.decision === 'CORRECT');

      // A. CAUSA / AUSLÖSER
      if (catName.includes('causa') || catName.includes('auslöser') || catName.includes('ursache')) {
        if (supportedClaims.length > 0) {
          supportedClaims.forEach(ac => {
            const claimLower = ac.claim.toLowerCase();
            const snip = ac.raw_text_snippet || snippet;
            if (claimLower.includes('ereignis') || claimLower.includes('anlass') || claimLower.includes('vorfall')) {
              addFact('C3', 'konkretes_ereignis', snip, ac.claim, 'c3_ereignis');
            } else if (claimLower.includes('kälte') || claimLower.includes('wind') || claimLower.includes('nässe') || claimLower.includes('zugluft') || claimLower.includes('spaziergang')) {
              addFact('C4', 'phaenomenologie_einwirkung', snip, ac.claim, 'c4_einwirkung');
            } else if (claimLower.includes('glaube') || claimLower.includes('vermute') || claimLower.includes('unsicher')) {
              addFact('C8', 'patienteneigene_zuschreibung', snip, ac.claim, 'c8_zuschreibung');
            } else {
              addFact('C8', 'causa_voranalyse_claim', snip, ac.claim, 'c8_zuschreibung');
            }
          });
        } else if (approvedText && !approvedText.toLowerCase().includes('nicht angegeben') && !approvedText.toLowerCase().includes('keine angabe')) {
          addFact('C8', 'causa_voranalyse_befund', snippet, approvedText, 'c8_zuschreibung');
        }
      }

      // B. LOCALISATIO / SYMPTOM (Zeitlicher Beginn C1 & Chronologie C7)
      if (catName.includes('localisatio') || catName.includes('symptom') || catName.includes('hauptbeschwerde')) {
        const statementsToCheck = supportedClaims.length > 0 ? supportedClaims.map(ac => ({ text: ac.claim, snip: ac.raw_text_snippet || snippet })) : [{ text: approvedText, snip: snippet }];
        for (const stmt of statementsToCheck) {
          if (!stmt.text) continue;
          const textLower = stmt.text.toLowerCase();
          // C1: Chronologischer Erstbeginn
          if (
            textLower.includes('seit') ||
            textLower.includes('vorgestern') ||
            textLower.includes('gestern') ||
            textLower.includes('tage') ||
            textLower.includes('wochen') ||
            textLower.includes('monate') ||
            textLower.includes('stunden') ||
            textLower.includes('plötzlich') ||
            textLower.includes('allmählich') ||
            textLower.includes('beginn')
          ) {
            addFact('C1', 'chronologischer_beginn', stmt.snip, stmt.text, 'c1_zeitpunkt_beginn');
          }
          // C7: Chronologie & Latenz (Reihenfolge nach Einwirkung)
          if (
            textLower.includes('nach rückkehr') ||
            textLower.includes('nach dem spaziergang') ||
            textLower.includes('zeitlich danach') ||
            textLower.includes('danach') ||
            textLower.includes('später') ||
            textLower.includes('zunächst') ||
            textLower.includes('erst nach')
          ) {
            addFact('C7', 'chronologie_latenz', stmt.snip, stmt.text, 'c7_latenz_reihenfolge');
          }
        }
      }

      // C. MODALITATES (Einwirkung & Begleitumstände C4 / C2)
      if (catName.includes('modalit')) {
        const statementsToCheck = supportedClaims.length > 0 ? supportedClaims.map(ac => ({ text: ac.claim, snip: ac.raw_text_snippet || snippet })) : [{ text: approvedText, snip: snippet }];
        for (const stmt of statementsToCheck) {
          if (!stmt.text) continue;
          const textLower = stmt.text.toLowerCase();
          if (textLower.includes('kälte') || textLower.includes('wind') || textLower.includes('wetter') || textLower.includes('zugluft') || textLower.includes('spaziergang')) {
            addFact('C4', 'modalitaet_einwirkung', stmt.snip, stmt.text, 'c4_einwirkung');
          }
        }
      }

      // D. COMORBIDITAS / VORERKRANKUNGEN (Historischer Vorzustand C12)
      if (catName.includes('comorbidit') || catName.includes('vorerkrankung') || catName.includes('anamnese')) {
        const statementsToCheck = supportedClaims.length > 0 ? supportedClaims.map(ac => ({ text: ac.claim, snip: ac.raw_text_snippet || snippet })) : [{ text: approvedText, snip: snippet }];
        for (const stmt of statementsToCheck) {
          if (!stmt.text) continue;
          const textLower = stmt.text.toLowerCase();
          if (textLower.includes('früher') || textLower.includes('vorher') || textLower.includes('schon mal') || textLower.includes('erstmalig') || textLower.includes('noch nie')) {
            addFact('C12', 'historischer_vorzustand', stmt.snip, stmt.text, 'c12_fruehere_beschwerden');
          }
        }
      }

      // E. ANIMUS / MENS (Organismischer Ausgangszustand C5 / Konkurrierende Faktoren C9)
      if (catName.includes('animus') || catName.includes('mens') || catName.includes('gemüt')) {
        const statementsToCheck = supportedClaims.length > 0 ? supportedClaims.map(ac => ({ text: ac.claim, snip: ac.raw_text_snippet || snippet })) : [{ text: approvedText, snip: snippet }];
        for (const stmt of statementsToCheck) {
          if (!stmt.text) continue;
          const textLower = stmt.text.toLowerCase();
          if (textLower.includes('stress') || textLower.includes('belastung') || textLower.includes('ärger') || textLower.includes('überarbeitung')) {
            addFact('C9', 'konkurrierender_faktor_stress', stmt.snip, stmt.text, 'c9_stress_belastung');
          }
          if (textLower.includes('erschöpfung') || textLower.includes('müdigkeit') || textLower.includes('ausgelaugt')) {
            addFact('C5', 'organismischer_ausgangszustand', stmt.snip, stmt.text, 'c5_organismischer_zustand');
          }
        }
      }
    }
  }

  // 2. Bereinigten Fallback-Text berücksichtigen (falls noch keine Causa-Fakten vorliegen)
  if (sanitizedFallback && !sanitizedFallback.toLowerCase().includes('nicht angegeben') && !sanitizedFallback.toLowerCase().includes('keine angabe')) {
    addFact('C8', 'organon_voranalyse_fallback', sanitizedFallback, sanitizedFallback, 'c8_voranalyse_fallback');
  }

  // 3. Dimension Completion anhand der Seed-Facts aktualisieren
  // WICHTIGE REGEL: FactStatus und DimensionCompletion bleiben strikt getrennt!
  // Ein Fact kann BELEGT_FAKTISCH sein, die DimensionCompletion bleibt TEILWEISE_ERHOBEN.
  // NICHT_WEITER_KLÄRBAR ist nur zulässig, wenn alle Fakten in dieser Dimension NICHT_ERINNERLICH sind.
  for (const fact of facts) {
    const dim = dimensions[fact.dimensionId];
    if (dim) {
      if (fact.epistemicStatus === 'NICHT_ERINNERLICH') {
        const dimFacts = facts.filter(f => f.dimensionId === fact.dimensionId);
        const allNotRemembered = dimFacts.length > 0 && dimFacts.every(f => f.epistemicStatus === 'NICHT_ERINNERLICH');
        if (allNotRemembered) {
          dim.completion = 'NICHT_WEITER_KLÄRBAR';
        } else {
          dim.completion = 'TEILWEISE_ERHOBEN';
        }
      } else if (dim.completion === 'UNERHOBEN') {
        dim.completion = 'TEILWEISE_ERHOBEN';
      }
    }
  }

  return {
    version: 2,
    facts,
    dimensions,
    openAmbiguities,
    terminalPaths,
    organonAugmentationCandidates: [],
    currentTurn: 0,
    isFinished: false,
    stoppingReason: undefined,
    finalCausaSummary: null
  };
}
