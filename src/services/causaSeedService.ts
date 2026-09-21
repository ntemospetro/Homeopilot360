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
 * Überführt ein validiertes Organon-Endprüfer-Ergebnis (und den unveränderten Patienten-Rohtext)
 * in einen initialen, konsistenten CanonicalCausaState (Causa-Seed).
 * 
 * WICHTIG (Evidence Ceiling & No-Hallucination):
 * - Nur Claims, die vom Endprüfer als gestützt (is_supported !== false bzw. freigegeben) bewertet wurden,
 *   werden als belegte Facts übernommen.
 * - Liegt in der Voranalyse noch keine belegte Causa vor, wird ein sauberer Causa-State mit C1-C13
 *   initialisiert, ohne eine Ursache zu halluzinieren.
 * - C3 bleibt bei Unbenennbarkeit ("kann kein Ereignis nennen") TEILWEISE_ERHOBEN / NICHT_ERINNERLICH.
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

  // 1. Suche die Causa-Kategorie im Endprüfer
  let causaCategoryDecision: EndprueferCategoryDecision | null = null;
  if (endprueferResult && Array.isArray(endprueferResult.category_checks)) {
    causaCategoryDecision = endprueferResult.category_checks.find((c) => {
      const catLower = (c.category || '').toLowerCase();
      return catLower.includes('causa') || catLower.includes('auslöser') || catLower.includes('ursache');
    }) || null;
  }

  // 2. Extrahiere validierte atomare Claims oder nutze die freigegebene/korrigierte Causa
  if (causaCategoryDecision) {
    const isCorrectionReq = causaCategoryDecision.decision === 'CORRECTION_REQUIRED';
    const approvedText = isCorrectionReq && causaCategoryDecision.minimal_correction
      ? causaCategoryDecision.minimal_correction
      : causaCategoryDecision.schiedsrichter_result;

    const atomicClaims = causaCategoryDecision.atomic_claims || [];
    const supportedClaims = atomicClaims.filter(ac => ac.is_supported !== false && ac.decision === 'CORRECT');

    if (supportedClaims.length > 0) {
      // Wenn der Endprüfer bereits atomare Claims validiert hat:
      supportedClaims.forEach((ac, idx) => {
        const snippet = ac.raw_text_snippet || cleanRaw.slice(0, 80);
        const status = determineFactStatusForStatement(ac.claim + ' ' + (snippet || ''));
        const confidence = detectEpistemicConfidence(ac.claim + ' ' + (snippet || ''));

        // C3-Check: Wenn unbenennbar, C3 teil-erheben
        const isC3Mention = ac.claim.toLowerCase().includes('ereignis') || ac.claim.toLowerCase().includes('anlass');
        const dimId: CausaDimensionId = isC3Mention ? 'C3' : 'C8';

        facts.push({
          factId: `SEED_F0${idx + 1}`,
          dimensionId: dimId,
          factType: isC3Mention ? 'konkretes_ereignis' : 'voranalyse_causa_claim',
          evidenceText: snippet || ac.claim,
          sourceTurn: 0,
          episodeId: 'EP_INITIAL',
          normalizedValue: {
            text: ac.claim,
            epistemischerQualifikator: confidence === 'UNSICHER_SCHWANKEND' ? 'unsicher' : undefined
          },
          epistemicStatus: status,
          patientConfidence: confidence,
          epistemicLink: status === 'BELEGT_FAKTISCH' ? 'ZEITLICHE_KOINZIDENZ' : 'SUBJEKTIVE_HYPOTHESE'
        });

        if (status === 'NICHT_ERINNERLICH') {
          terminalPaths.push(`${dimId}: Konkreter Anlass/Ereignis vom Patienten nicht erinnerlich / nicht benennbar.`);
        }
      });
    } else if (approvedText && !approvedText.toLowerCase().includes('keine angabe') && !approvedText.toLowerCase().includes('nicht angegeben')) {
      // Einzelner validierter Causa-Text aus Endprüfer
      const snippet = causaCategoryDecision.raw_text_snippet || cleanRaw.slice(0, 100);
      const status = determineFactStatusForStatement(approvedText + ' ' + (snippet || ''));
      const confidence = detectEpistemicConfidence(approvedText + ' ' + (snippet || ''));

      facts.push({
        factId: 'SEED_F01',
        dimensionId: 'C8',
        factType: 'organon_voranalyse_befund',
        evidenceText: snippet || approvedText,
        sourceTurn: 0,
        episodeId: 'EP_INITIAL',
        normalizedValue: {
          text: approvedText
        },
        epistemicStatus: status,
        patientConfidence: confidence,
        epistemicLink: status === 'BELEGT_FAKTISCH' ? 'ZEITLICHE_KOINZIDENZ' : 'SUBJEKTIVE_HYPOTHESE'
      });
    }
  } else if (existingCausaFallbackText && !existingCausaFallbackText.toLowerCase().includes('nicht angegeben') && !existingCausaFallbackText.toLowerCase().includes('keine angabe')) {
    // Fallback: Text aus vorheriger Organon-Stufe vorhanden
    const status = determineFactStatusForStatement(existingCausaFallbackText);
    const confidence = detectEpistemicConfidence(existingCausaFallbackText);

    facts.push({
      factId: 'SEED_FALLBACK_F01',
      dimensionId: 'C8',
      factType: 'organon_voranalyse_fallback',
      evidenceText: existingCausaFallbackText,
      sourceTurn: 0,
      episodeId: 'EP_INITIAL',
      normalizedValue: {
        text: existingCausaFallbackText
      },
      epistemicStatus: status,
      patientConfidence: confidence,
      epistemicLink: 'SUBJEKTIVE_HYPOTHESE'
    });
  }

  // 3. Dimension Completion anhand der Seed-Facts aktualisieren
  for (const fact of facts) {
    const dim = dimensions[fact.dimensionId];
    if (dim) {
      if (dim.completion === 'UNERHOBEN') {
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
