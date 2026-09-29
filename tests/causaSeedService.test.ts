import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  determineFactStatusForStatement,
  detectEpistemicConfidence,
  createInitialDimensionStates,
  seedCausaStateFromOrganonEndpruefer,
  sanitizeCausaPatientText
} from '../src/services/causaSeedService.ts';
import { CAUSA_DIMENSION_KEYS } from '../src/types/causaDeepDive.ts';
import { EndprueferResult } from '../src/types.ts';

describe('Causa Deep-Dive - Paket 1 Basis & Invarianten', () => {

  it('1. C1–C13 Dimension Keys sind vollständig und exakt 13', () => {
    assert.equal(CAUSA_DIMENSION_KEYS.length, 13);
    const expected = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13'];
    assert.deepEqual(CAUSA_DIMENSION_KEYS, expected);
  });

  it('2. Regel: "nicht benennen können" darf NICHT AUSDRÜCKLICH_VERNEINT werden (Test A & B)', () => {
    // Test A: Unfähigkeit zu benennen -> NICHT_ERINNERLICH
    const resA1 = determineFactStatusForStatement('Ein bestimmtes Ereignis könne sie nicht nennen.');
    assert.equal(resA1, 'NICHT_ERINNERLICH');

    const resA2 = determineFactStatusForStatement('Ich kann keinen bestimmten Anlass nennen.');
    assert.equal(resA2, 'NICHT_ERINNERLICH');

    // Test B: Explizite Verneinung -> AUSDRÜCKLICH_VERNEINT
    const resB = determineFactStatusForStatement('Es gab definitiv keinen besonderen Anlass.');
    assert.equal(resB, 'AUSDRÜCKLICH_VERNEINT');
  });

  it('3. Epistemische Confidence: Trennung von Unsicherheit ("scheint") und Frequenz (Test C & D)', () => {
    // Test C: "scheint ... manchmal" trägt epistemische Unsicherheit
    const confC = detectEpistemicConfidence('Wenn die Kopfschmerzen bereits da sind, scheint kalte Luft sie manchmal zu verschlimmern.');
    assert.equal(confC, 'UNSICHER_SCHWANKEND');

    // Test D: Reine Frequenz ohne epistemischen Abschwächer -> SICHERE_BEOBACHTUNG
    const confD = detectEpistemicConfidence('Manchmal bekomme ich Kopfschmerzen nach kaltem Wind.');
    assert.equal(confD, 'SICHERE_BEOBACHTUNG');
  });

  it('4. Initiales Dimensions-Dictionary setzt alle C1–C13 auf UNERHOBEN & APPLIKABEL', () => {
    const dims = createInitialDimensionStates();
    for (const key of CAUSA_DIMENSION_KEYS) {
      assert.equal(dims[key].completion, 'UNERHOBEN');
      assert.equal(dims[key].applicability, 'APPLIKABEL');
    }
  });

  it('5. Seeding aus validiertem Endprüfer-Ergebnis überführt Claims diszipliniert', () => {
    const mockEndpruefer: EndprueferResult = {
      overall_status: 'PASS',
      total_categories_checked: 10,
      correct_count: 10,
      flagged_count: 0,
      audit_changes: [],
      final_corrected_output: 'Auswertung abgeschlossen.',
      category_checks: [
        {
          category: 'Causa (Möglicher Auslöser)',
          schiedsrichter_result: 'Kopfschmerz nach körperlicher Anstrengung.',
          raw_text_snippet: 'nach Anstrengung',
          decision: 'CORRECT',
          issue: null,
          reasoning: 'Belegt im Text',
          severity: null,
          minimal_correction: '',
          atomic_claims: [
            {
              claim: 'Körperliche Anstrengung ging voraus',
              raw_text_snippet: 'nach Anstrengung',
              is_supported: true,
              issue: null,
              decision: 'CORRECT'
            },
            {
              claim: 'Ein bestimmtes Ereignis konnte nicht genannt werden',
              raw_text_snippet: 'kann kein Ereignis nennen',
              is_supported: true,
              issue: null,
              decision: 'CORRECT'
            }
          ]
        }
      ]
    };

    const state = seedCausaStateFromOrganonEndpruefer(
      'Patientin berichtet nach Anstrengung... kann kein Ereignis nennen',
      mockEndpruefer
    );

    assert.equal(state.version, 2);
    assert.equal(state.facts.length, 2);

    // Prüfe Fact 1 (Anstrengung)
    const f1 = state.facts[0];
    assert.equal(f1.epistemicStatus, 'BELEGT_FAKTISCH');
    assert.equal(f1.patientConfidence, 'SICHERE_BEOBACHTUNG');

    // Prüfe Fact 2 (C3 Ereignis unbenannt)
    const f2 = state.facts[1];
    assert.equal(f2.dimensionId, 'C3');
    assert.equal(f2.epistemicStatus, 'NICHT_ERINNERLICH');
    assert.notEqual(f2.epistemicStatus, 'AUSDRÜCKLICH_VERNEINT');

    // C3 muss in Dimensions als TEILWEISE_ERHOBEN markiert sein
    assert.equal(state.dimensions.C3.completion, 'TEILWEISE_ERHOBEN');
    // Und als terminaler Pfad vermerkt sein
    assert.ok(state.terminalPaths.some(p => p.includes('C3')));
  });

  it('6. Seeding ohne belegte Causa halluziniert keine Causa', () => {
    const emptyEndpruefer: EndprueferResult = {
      overall_status: 'PASS',
      total_categories_checked: 10,
      correct_count: 10,
      flagged_count: 0,
      audit_changes: [],
      final_corrected_output: '',
      category_checks: [
        {
          category: 'Causa (Möglicher Auslöser)',
          schiedsrichter_result: 'Keine Angaben im Text vorhanden.',
          raw_text_snippet: null,
          decision: 'CORRECT',
          issue: null,
          reasoning: 'Keine Causa genannt',
          severity: null,
          minimal_correction: ''
        }
      ]
    };

    const state = seedCausaStateFromOrganonEndpruefer('Patientin hat diffuse Kopfschmerzen.', emptyEndpruefer);
    assert.equal(state.facts.length, 0);
    assert.equal(state.dimensions.C1.completion, 'UNERHOBEN');
    assert.equal(state.dimensions.C8.completion, 'UNERHOBEN');
    assert.equal(state.isFinished, false);
  });

  it('7. Benachbarte Zustände: Multiple Dimensionen gleichzeitig (C1, C3, C5, C8, C9) und Unberührte bleiben UNERHOBEN', () => {
    const multiEndpruefer: EndprueferResult = {
      overall_status: 'PASS',
      total_categories_checked: 10,
      correct_count: 10,
      flagged_count: 0,
      audit_changes: [],
      final_corrected_output: 'Komplexe Anamnese.',
      category_checks: [
        {
          category: 'Causa (Möglicher Auslöser)',
          schiedsrichter_result: 'Beginn vor 3 Wochen nach schwerem Autounfall. Kein Vorerkrankungsereignis erinnerlich.',
          raw_text_snippet: 'vor 3 Wochen nach Unfall',
          decision: 'CORRECT',
          issue: null,
          reasoning: 'Klar belegt',
          severity: null,
          minimal_correction: '',
          atomic_claims: [
            {
              claim: 'Beginn vor 3 Wochen',
              raw_text_snippet: 'vor 3 Wochen',
              is_supported: true,
              issue: null,
              decision: 'CORRECT'
            },
            {
              claim: 'Unfall ging den Symptomen voraus',
              raw_text_snippet: 'nach Autounfall',
              is_supported: true,
              issue: null,
              decision: 'CORRECT'
            },
            {
              claim: 'An ein früheres Ereignis erinnert sich die Patientin nicht',
              raw_text_snippet: 'erinnert sich nicht',
              is_supported: true,
              issue: null,
              decision: 'CORRECT'
            }
          ]
        },
        {
          category: 'Animus / Mens (Gemüt)',
          schiedsrichter_result: 'Starker beruflicher Stress und chronische Erschöpfung.',
          raw_text_snippet: 'Stress und Erschöpfung',
          decision: 'CORRECT',
          issue: null,
          reasoning: 'Belegt',
          severity: null,
          minimal_correction: '',
          atomic_claims: [
            {
              claim: 'Massiver beruflicher Stress vorhanden',
              raw_text_snippet: 'beruflicher Stress',
              is_supported: true,
              issue: null,
              decision: 'CORRECT'
            },
            {
              claim: 'Patientin fühlt sich völlig erschöpft und ausgelaugt',
              raw_text_snippet: 'ausgelaugt und erschöpft',
              is_supported: true,
              issue: null,
              decision: 'CORRECT'
            }
          ]
        }
      ]
    };

    const state = seedCausaStateFromOrganonEndpruefer(
      'Beginn vor 3 Wochen nach schwerem Autounfall. Starker Stress und Erschöpfung. Erinnert sich nicht an frühere Anlässe.',
      multiEndpruefer,
      'Zuschreibung durch Patientin: Überlastung'
    );

    // 1. Facts wurden für die verschiedenen Dimensionen korrekt extrahiert
    assert.ok(state.facts.length >= 4);

    // 2. Betroffene Dimensionen müssen exakt TEILWEISE_ERHOBEN sein (niemals UNERHOBEN, niemals voreilig AUSREICHEND)
    assert.equal(state.dimensions.C1.completion, 'TEILWEISE_ERHOBEN'); // Beginn vor 3 Wochen
    assert.equal(state.dimensions.C3.completion, 'TEILWEISE_ERHOBEN'); // Unfall / Erinnerungslücke
    assert.equal(state.dimensions.C9.completion, 'TEILWEISE_ERHOBEN'); // Stress / Belastung
    assert.equal(state.dimensions.C5.completion, 'TEILWEISE_ERHOBEN'); // Erschöpfung / Ausgangszustand

    // 3. Unberührte benachbarte Dimensionen MÜSSEN zwingend UNERHOBEN und APPLIKABEL bleiben
    const untouchedKeys = ['C2', 'C4', 'C6', 'C7', 'C10', 'C11', 'C12', 'C13'] as const;
    for (const key of untouchedKeys) {
      assert.equal(state.dimensions[key].completion, 'UNERHOBEN', `Dimension ${key} muss UNERHOBEN bleiben`);
      assert.equal(state.dimensions[key].applicability, 'APPLIKABEL', `Dimension ${key} muss APPLIKABEL bleiben`);
    }

    // 4. Nicht-erinnerlicher Sachverhalt muss in terminalPaths enthalten sein
    assert.ok(state.terminalPaths.some(p => p.includes('C3')));
  });

  it('8. Erweiterte Verneinungs- vs. Nicht-Erinnerlichkeits-Klassifikation', () => {
    // Echte Verneinungen / Ausschlüsse
    assert.equal(determineFactStatusForStatement('Ein Trauma schloss sie kategorisch aus.'), 'AUSDRÜCKLICH_VERNEINT');
    assert.equal(determineFactStatusForStatement('Definitiv nicht durch äußere Kälte verursacht.'), 'AUSDRÜCKLICH_VERNEINT');
    assert.equal(determineFactStatusForStatement('Ein seelischer Konflikt wurde ausdrücklich ausgeschlossen.'), 'AUSDRÜCKLICH_VERNEINT');
    assert.equal(determineFactStatusForStatement('Einen Unfall schloss er aus.'), 'AUSDRÜCKLICH_VERNEINT');

    // Mangelnde Erinnerung / Benennbarkeit (KEIN Ausschluss)
    assert.equal(determineFactStatusForStatement('Könne er nicht nennen.'), 'NICHT_ERINNERLICH');
    assert.equal(determineFactStatusForStatement('Erinnert sich nicht an den Auslöser.'), 'NICHT_ERINNERLICH');
    assert.equal(determineFactStatusForStatement('Wann das genau anfing, weiß er nicht mehr.'), 'NICHT_ERINNERLICH');
    assert.equal(determineFactStatusForStatement('Patientin hat keine Erinnerung an den Vorfall.'), 'NICHT_ERINNERLICH');
    assert.equal(determineFactStatusForStatement('Ihr fällt kein Grund ein.'), 'NICHT_ERINNERLICH');
  });

  it('9. Epistemische Confidence-Differenzierung & Abschwächer', () => {
    assert.equal(detectEpistemicConfidence('Ich glaube, es war der nasse Schirm.'), 'VERMUTUNG');
    assert.equal(detectEpistemicConfidence('Ich vermute eine Erkältung nach dem Baden.'), 'VERMUTUNG');
    assert.equal(detectEpistemicConfidence('Vielleicht war es Zugluft im Zug.'), 'UNSICHER_SCHWANKEND');
    assert.equal(detectEpistemicConfidence('Könnte eventuell mit Schlafmangel zusammenhängen.'), 'UNSICHER_SCHWANKEND');
    assert.equal(detectEpistemicConfidence('Ich weiß nicht, wie das kam.'), 'WEISS_NICHT');
    assert.equal(detectEpistemicConfidence('Oft habe ich das im Winter bei trockenem Frost.'), 'SICHERE_BEOBACHTUNG');
  });

  it('10. Bereinigung von Repertorisations-Artefakten aus Patiententexten', () => {
    const raw = 'Kopfschmerz drückend. (Homöopathische Interpretation: Belladonna Leitsymptom) Klassische Einzelfall-Repertorisation nach Sonnenstich.';
    const sanitized = sanitizeCausaPatientText(raw);
    assert.equal(sanitized.includes('Homöopathische Interpretation'), false);
    assert.equal(sanitized.includes('Klassische Einzelfall-Repertorisation'), false);
    assert.ok(sanitized.includes('Kopfschmerz drückend'));
    assert.ok(sanitized.includes('nach Sonnenstich'));
  });
});
