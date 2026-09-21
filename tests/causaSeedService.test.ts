import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  determineFactStatusForStatement,
  detectEpistemicConfidence,
  createInitialDimensionStates,
  seedCausaStateFromOrganonEndpruefer
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
});
