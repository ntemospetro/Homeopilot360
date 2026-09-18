import { repertoryImportManager, DryRunResult, sanitizeRepertoryImportState } from './repertoryImportManager';

export interface TestCaseResult {
  test_id: string;
  test_name: string;
  expected: string;
  actual: string;
  passed: boolean;
  details: string;
}

export function runRepertoryImportTests(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  // TEST A: gültige kleine JSON-Datei -> Dry Run PASS
  try {
    const validJson = JSON.stringify([
      {
        rubric_id: 'test_rub_1',
        chapter: 'GENERALS',
        rubric_text_original: 'Test pain',
        remedies: { bry: 3, acon: 2 }
      }
    ]);
    const resA = repertoryImportManager.runDryRun('test_a.json', 'JSON', validJson, {
      source_work: 'Test Work A',
      source_edition: '1st',
      source_language: 'en',
      license_status: 'VERIFIED_ALLOWED',
      license_note: 'Verified'
    });
    const passed = resA.dryRun.ready_for_activation && resA.dryRun.invalid_records === 0;
    results.push({
      test_id: 'TEST_A',
      test_name: 'Gültige kleine JSON-Datei -> Dry Run PASS',
      expected: 'ready_for_activation: true, invalid_records: 0',
      actual: `ready_for_activation: ${resA.dryRun.ready_for_activation}, invalid: ${resA.dryRun.invalid_records}`,
      passed,
      details: passed ? 'Passed successfully' : 'Failed'
    });
  } catch (e: any) {
    results.push({ test_id: 'TEST_A', test_name: 'Test A', expected: 'PASS', actual: 'ERROR', passed: false, details: e.message });
  }

  // TEST B: fehlende rubric_id -> REJECTED
  try {
    const invalidJsonB = JSON.stringify([
      {
        chapter: 'GENERALS',
        rubric_text_original: 'Missing ID pain',
        remedies: { bry: 3 }
      }
    ]);
    const resB = repertoryImportManager.runDryRun('test_b.json', 'JSON', invalidJsonB, {
      source_work: 'Test Work B',
      source_edition: null,
      source_language: 'en',
      license_status: 'VERIFIED_ALLOWED',
      license_note: 'Verified'
    });
    const hasMissingIdError = resB.dryRun.error_list.some(e => e.error_code === 'MISSING_RUBRIC_ID');
    const passed = !resB.dryRun.ready_for_activation && hasMissingIdError;
    results.push({
      test_id: 'TEST_B',
      test_name: 'Fehlende rubric_id -> REJECTED',
      expected: 'ready_for_activation: false, error: MISSING_RUBRIC_ID',
      actual: `ready_for_activation: ${resB.dryRun.ready_for_activation}, error_found: ${hasMissingIdError}`,
      passed,
      details: passed ? 'Correctly rejected' : 'Failed'
    });
  } catch (e: any) {
    results.push({ test_id: 'TEST_B', test_name: 'Test B', expected: 'REJECTED', actual: 'ERROR', passed: false, details: e.message });
  }

  // TEST C: unresolved remedy ID -> nicht aktivierbar
  try {
    const invalidJsonC = JSON.stringify([
      {
        rubric_id: 'test_rub_c',
        chapter: 'GENERALS',
        rubric_text_original: 'Unresolved remedy pain',
        remedies: { unknown_fake_remedy_xyz: 3 }
      }
    ]);
    const resC = repertoryImportManager.runDryRun('test_c.json', 'JSON', invalidJsonC, {
      source_work: 'Test Work C',
      source_edition: null,
      source_language: 'en',
      license_status: 'VERIFIED_ALLOWED',
      license_note: 'Verified'
    });
    const hasUnresolved = resC.dryRun.unresolved_remedy_ids.length > 0;
    const passed = !resC.dryRun.ready_for_activation && hasUnresolved;
    results.push({
      test_id: 'TEST_C',
      test_name: 'Unresolved remedy ID -> nicht aktivierbar',
      expected: 'ready_for_activation: false, unresolved_remedy_ids > 0',
      actual: `ready_for_activation: ${resC.dryRun.ready_for_activation}, unresolved_count: ${resC.dryRun.unresolved_remedy_ids.length}`,
      passed,
      details: passed ? 'Correctly prevented activation' : 'Failed'
    });
  } catch (e: any) {
    results.push({ test_id: 'TEST_C', test_name: 'Test C', expected: 'NOT ACTIVATABLE', actual: 'ERROR', passed: false, details: e.message });
  }

  // TEST D: ungültiger grade -> nicht aktivierbar
  try {
    const invalidJsonD = JSON.stringify([
      {
        rubric_id: 'test_rub_d',
        chapter: 'GENERALS',
        rubric_text_original: 'Invalid grade pain',
        remedies: { bry: 5 } // Grade 5 is invalid (max is 3)
      }
    ]);
    const resD = repertoryImportManager.runDryRun('test_d.json', 'JSON', invalidJsonD, {
      source_work: 'Test Work D',
      source_edition: null,
      source_language: 'en',
      license_status: 'VERIFIED_ALLOWED',
      license_note: 'Verified'
    });
    const hasInvalidGrade = resD.dryRun.invalid_grades.length > 0;
    const passed = !resD.dryRun.ready_for_activation && hasInvalidGrade;
    results.push({
      test_id: 'TEST_D',
      test_name: 'Ungültiger grade -> nicht aktivierbar',
      expected: 'ready_for_activation: false, invalid_grades > 0',
      actual: `ready_for_activation: ${resD.dryRun.ready_for_activation}, invalid_grades: ${resD.dryRun.invalid_grades.length}`,
      passed,
      details: passed ? 'Correctly prevented activation' : 'Failed'
    });
  } catch (e: any) {
    results.push({ test_id: 'TEST_D', test_name: 'Test D', expected: 'NOT ACTIVATABLE', actual: 'ERROR', passed: false, details: e.message });
  }

  // TEST E: license_status UNKNOWN -> Dry Run erlaubt, Aktivierung nur nach Prüfung
  try {
    const validJsonE = JSON.stringify([
      {
        rubric_id: 'test_rub_e',
        chapter: 'GENERALS',
        rubric_text_original: 'Unknown license pain',
        remedies: { bry: 3 }
      }
    ]);
    const resE = repertoryImportManager.runDryRun('test_e.json', 'JSON', validJsonE, {
      source_work: 'Test Work E',
      source_edition: null,
      source_language: 'en',
      license_status: 'UNKNOWN', // UNKNOWN
      license_note: ''
    });
    const dryRunAllowed = resE.dryRun !== null;
    const notReadyForActivation = resE.dryRun.ready_for_activation === false; // because license_status is UNKNOWN
    const passed = dryRunAllowed && notReadyForActivation;
    results.push({
      test_id: 'TEST_E',
      test_name: 'License status UNKNOWN -> Dry Run allowed, activation blocked',
      expected: 'dryRun: allowed, ready_for_activation: false',
      actual: `dryRun: ${dryRunAllowed}, ready_for_activation: ${resE.dryRun.ready_for_activation}`,
      passed,
      details: passed ? 'Correctly blocked activation on UNKNOWN license' : 'Failed'
    });
  } catch (e: any) {
    results.push({ test_id: 'TEST_E', test_name: 'Test E', expected: 'BLOCKED', actual: 'ERROR', passed: false, details: e.message });
  }

  // TEST F: duplicate rubric_id -> Fehler
  try {
    const invalidJsonF = JSON.stringify([
      {
        rubric_id: 'dup_id',
        chapter: 'GENERALS',
        rubric_text_original: 'Pain 1',
        remedies: { bry: 3 }
      },
      {
        rubric_id: 'dup_id',
        chapter: 'GENERALS',
        rubric_text_original: 'Pain 2',
        remedies: { acon: 2 }
      }
    ]);
    const resF = repertoryImportManager.runDryRun('test_f.json', 'JSON', invalidJsonF, {
      source_work: 'Test Work F',
      source_edition: null,
      source_language: 'en',
      license_status: 'VERIFIED_ALLOWED',
      license_note: 'Verified'
    });
    const hasDuplicateError = resF.dryRun.error_list.some(e => e.error_code === 'DUPLICATE_RUBRIC_ID');
    const passed = !resF.dryRun.ready_for_activation && hasDuplicateError;
    results.push({
      test_id: 'TEST_F',
      test_name: 'Duplicate rubric_id -> Fehler',
      expected: 'ready_for_activation: false, error: DUPLICATE_RUBRIC_ID',
      actual: `ready_for_activation: ${resF.dryRun.ready_for_activation}, duplicate_error: ${hasDuplicateError}`,
      passed,
      details: passed ? 'Correctly flagged duplicate rubric ID' : 'Failed'
    });
  } catch (e: any) {
    results.push({ test_id: 'TEST_F', test_name: 'Test F', expected: 'ERROR', actual: 'ERROR', passed: false, details: e.message });
  }

  // TEST G: broken parent_rubric_id -> Fehler
  try {
    const invalidJsonG = JSON.stringify([
      {
        rubric_id: 'child_rub',
        parent_rubric_id: 'non_existent_parent',
        chapter: 'GENERALS',
        rubric_text_original: 'Child pain',
        remedies: { bry: 3 }
      }
    ]);
    const resG = repertoryImportManager.runDryRun('test_g.json', 'JSON', invalidJsonG, {
      source_work: 'Test Work G',
      source_edition: null,
      source_language: 'en',
      license_status: 'VERIFIED_ALLOWED',
      license_note: 'Verified'
    });
    const hasBrokenParentError = resG.dryRun.error_list.some(e => e.error_code === 'BROKEN_PARENT_REFERENCE');
    const passed = !resG.dryRun.ready_for_activation && hasBrokenParentError;
    results.push({
      test_id: 'TEST_G',
      test_name: 'Broken parent_rubric_id -> Fehler',
      expected: 'ready_for_activation: false, error: BROKEN_PARENT_REFERENCE',
      actual: `ready_for_activation: ${resG.dryRun.ready_for_activation}, broken_parent: ${hasBrokenParentError}`,
      passed,
      details: passed ? 'Correctly flagged broken parent reference' : 'Failed'
    });
  } catch (e: any) {
    results.push({ test_id: 'TEST_G', test_name: 'Test G', expected: 'ERROR', actual: 'ERROR', passed: false, details: e.message });
  }

  // JSON NORM TESTS (1-5)
  // Test 1: Wrapper JSON with records[] (10 records)
  try {
    const records10 = Array.from({ length: 10 }, (_, i) => ({
      rubric_id: `rub_${i}`,
      chapter: 'GENERALS',
      rubric_text_original: `Pain ${i}`,
      remedies: { bry: 3 }
    }));
    const wrapperJson = JSON.stringify({
      dataset_id: 'test_ds',
      source: { source_work: 'Test Wrapper' },
      records: records10
    });
    const resW = repertoryImportManager.runDryRun('wrapper.json', 'JSON', wrapperJson, {
      source_work: '', source_edition: null, source_language: 'en', license_status: 'VERIFIED_ALLOWED', license_note: ''
    });
    const passed = resW.dryRun.total_records === 10;
    results.push({
      test_id: 'JSON_NORM_1',
      test_name: 'Wrapper JSON with records[] -> 10 records',
      expected: 'total_records: 10',
      actual: `total_records: ${resW.dryRun.total_records}`,
      passed,
      details: passed ? 'Passed' : 'Failed'
    });
  } catch (e: any) {
    results.push({ test_id: 'JSON_NORM_1', test_name: 'Wrapper JSON', expected: '10', actual: 'ERROR', passed: false, details: e.message });
  }

  // Test 2: Top-Level Array (10 records)
  try {
    const records10 = Array.from({ length: 10 }, (_, i) => ({
      rubric_id: `rub_${i}`,
      chapter: 'GENERALS',
      rubric_text_original: `Pain ${i}`,
      remedies: { bry: 3 }
    }));
    const flatJson = JSON.stringify(records10);
    const resF = repertoryImportManager.runDryRun('flat.json', 'JSON', flatJson, {
      source_work: 'Test Flat', source_edition: null, source_language: 'en', license_status: 'VERIFIED_ALLOWED', license_note: ''
    });
    const passed = resF.dryRun.total_records === 10;
    results.push({
      test_id: 'JSON_NORM_2',
      test_name: 'Top-Level Array -> 10 records',
      expected: 'total_records: 10',
      actual: `total_records: ${resF.dryRun.total_records}`,
      passed,
      details: passed ? 'Passed' : 'Failed'
    });
  } catch (e: any) {
    results.push({ test_id: 'JSON_NORM_2', test_name: 'Top-Level Array', expected: '10', actual: 'ERROR', passed: false, details: e.message });
  }

  // Test 3: Top-Level single rubric object without array -> INVALID_JSON_STRUCTURE
  try {
    const singleObjJson = JSON.stringify({
      rubric_id: 'rub_single',
      chapter: 'GENERALS',
      rubric_text_original: 'Single pain',
      remedies: { bry: 3 }
    });
    const res3 = repertoryImportManager.runDryRun('single.json', 'JSON', singleObjJson, {
      source_work: 'Test', source_edition: null, source_language: 'en', license_status: 'VERIFIED_ALLOWED', license_note: ''
    });
    const hasInvalidStruct = res3.dryRun.error_list.some(e => e.error_code === 'INVALID_JSON_STRUCTURE');
    const passed = hasInvalidStruct;
    results.push({
      test_id: 'JSON_NORM_3',
      test_name: 'Top-Level single object -> INVALID_JSON_STRUCTURE',
      expected: 'error: INVALID_JSON_STRUCTURE',
      actual: `has_error: ${hasInvalidStruct}`,
      passed,
      details: passed ? 'Passed' : 'Failed'
    });
  } catch (e: any) {
    results.push({ test_id: 'JSON_NORM_3', test_name: 'Single object', expected: 'INVALID_JSON_STRUCTURE', actual: 'ERROR', passed: false, details: e.message });
  }

  // Test 4: Wrapper without records array -> INVALID_JSON_STRUCTURE
  try {
    const wrapperNoRec = JSON.stringify({
      dataset_id: 'test',
      source: { source_work: 'Test' }
    });
    const res4 = repertoryImportManager.runDryRun('norec.json', 'JSON', wrapperNoRec, {
      source_work: 'Test', source_edition: null, source_language: 'en', license_status: 'VERIFIED_ALLOWED', license_note: ''
    });
    const hasInvalidStruct = res4.dryRun.error_list.some(e => e.error_code === 'INVALID_JSON_STRUCTURE');
    const passed = hasInvalidStruct;
    results.push({
      test_id: 'JSON_NORM_4',
      test_name: 'Wrapper without records array -> INVALID_JSON_STRUCTURE',
      expected: 'error: INVALID_JSON_STRUCTURE',
      actual: `has_error: ${hasInvalidStruct}`,
      passed,
      details: passed ? 'Passed' : 'Failed'
    });
  } catch (e: any) {
    results.push({ test_id: 'JSON_NORM_4', test_name: 'Wrapper without records', expected: 'INVALID_JSON_STRUCTURE', actual: 'ERROR', passed: false, details: e.message });
  }

  // Test 5: records = {} (not an array) -> INVALID_JSON_STRUCTURE
  try {
    const wrapperObjRec = JSON.stringify({
      dataset_id: 'test',
      source: { source_work: 'Test' },
      records: { rubric_id: 'rub_1' }
    });
    const res5 = repertoryImportManager.runDryRun('objrec.json', 'JSON', wrapperObjRec, {
      source_work: 'Test', source_edition: null, source_language: 'en', license_status: 'VERIFIED_ALLOWED', license_note: ''
    });
    const hasInvalidStruct = res5.dryRun.error_list.some(e => e.error_code === 'INVALID_JSON_STRUCTURE');
    const passed = hasInvalidStruct;
    results.push({
      test_id: 'JSON_NORM_5',
      test_name: 'records = object -> INVALID_JSON_STRUCTURE',
      expected: 'error: INVALID_JSON_STRUCTURE',
      actual: `has_error: ${hasInvalidStruct}`,
      passed,
      details: passed ? 'Passed' : 'Failed'
    });
  } catch (e: any) {
    results.push({ test_id: 'JSON_NORM_5', test_name: 'records = object', expected: 'INVALID_JSON_STRUCTURE', actual: 'ERROR', passed: false, details: e.message });
  }

  // Test 6: Old broken storage state sanitization (Item 9)
  try {
    const brokenState = {
      "datasets": {},
      "audit_log": {},
      "unresolved_remedy_ids": {},
      "error_list": null,
      "invalid_grades": "bad"
    };
    const sanitized = sanitizeRepertoryImportState(brokenState);
    const passed = Array.isArray(sanitized.datasets) && sanitized.datasets.length === 0;
    results.push({
      test_id: 'BROKEN_STORAGE_TEST',
      test_name: 'Old broken storage state sanitization',
      expected: 'datasets = [], audit_log = [], etc. no exception',
      actual: `datasets is Array: ${Array.isArray(sanitized.datasets)}, length: ${sanitized.datasets.length}`,
      passed,
      details: passed ? 'Passed - successfully sanitized broken storage without exception' : 'Failed'
    });
  } catch (e: any) {
    results.push({ test_id: 'BROKEN_STORAGE_TEST', test_name: 'Old broken storage state sanitization', expected: 'PASS', actual: 'ERROR', passed: false, details: e.message });
  }

  return results;
}
