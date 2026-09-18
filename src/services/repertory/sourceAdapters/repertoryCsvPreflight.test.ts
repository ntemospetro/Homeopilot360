import { runRepertoryCsvPreflight } from './repertoryCsvPreflight';
import { CanonicalCsvRow } from './canonicalRepertoryCsvTypes';
import { exportRowsToCsvString } from './repertoryCsvExporter';
import { repertoryImportManager } from '../repertoryImportManager';

export interface TestCaseResult {
  testName: string;
  passed: boolean;
  message: string;
}

export function runSourceAdapterTests(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  const validRow: CanonicalCsvRow = {
    dataset_id: 'kent-test-v1',
    source_work: 'Repertory of the Homoeopathic Materia Medica',
    source_author: 'James Tyler Kent',
    source_language: 'en',
    source_page: 1084,
    chapter: 'EXTREMITIES',
    rubric_id: 'rub_1',
    parent_rubric_id: null,
    rubric_path: 'EXTREMITIES > PAIN',
    rubric_text_original: 'Pain',
    source_remedy_id: 'bry',
    canonical_remedy_id: 'bryonia-alba',
    canonical_name: 'Bryonia alba',
    grade: 1,
    grade_original: 'ROMAN',
    source_reference: 'Kent p. 1084',
    license_status: 'UNKNOWN'
  };

  // Test A
  try {
    const preflightA = runRepertoryCsvPreflight([validRow]);
    results.push({
      testName: 'TEST_A',
      passed: preflightA.ready_for_import === true && preflightA.invalid_rows === 0,
      message: `Ready: ${preflightA.ready_for_import}, invalid: ${preflightA.invalid_rows}`
    });
  } catch (e: any) {
    results.push({ testName: 'TEST_A', passed: false, message: e.message });
  }

  // Test B: Unknown source remedy ID
  try {
    const rowB = { ...validRow, source_remedy_id: 'unknown_rem_xyz' };
    const preflightB = runRepertoryCsvPreflight([rowB]);
    results.push({
      testName: 'TEST_B',
      passed: preflightB.ready_for_import === false && preflightB.unresolved_source_remedy_ids.length > 0,
      message: `Ready: ${preflightB.ready_for_import}, unresolved: ${preflightB.unresolved_source_remedy_ids.join(',')}`
    });
  } catch (e: any) {
    results.push({ testName: 'TEST_B', passed: false, message: e.message });
  }

  // Test C: Unknown canonical remedy ID
  try {
    const rowC = { ...validRow, canonical_remedy_id: 'nonexistent-remedy-id' };
    const preflightC = runRepertoryCsvPreflight([rowC]);
    results.push({
      testName: 'TEST_C',
      passed: preflightC.ready_for_import === false,
      message: `Ready: ${preflightC.ready_for_import}`
    });
  } catch (e: any) {
    results.push({ testName: 'TEST_C', passed: false, message: e.message });
  }

  // Test D: Parent missing
  try {
    const rowD = { ...validRow, rubric_id: 'child_rub', parent_rubric_id: 'missing_parent' };
    const preflightD = runRepertoryCsvPreflight([rowD]);
    results.push({
      testName: 'TEST_D',
      passed: preflightD.ready_for_import === false && preflightD.missing_parent_rubrics.length > 0,
      message: `Ready: ${preflightD.ready_for_import}, missing parent: ${preflightD.missing_parent_rubrics.join(',')}`
    });
  } catch (e: any) {
    results.push({ testName: 'TEST_D', passed: false, message: e.message });
  }

  // Test E: Parent loop (self-parent)
  try {
    const rowE = { ...validRow, rubric_id: 'self_loop', parent_rubric_id: 'self_loop' };
    const preflightE = runRepertoryCsvPreflight([rowE]);
    results.push({
      testName: 'TEST_E',
      passed: preflightE.ready_for_import === false && preflightE.parent_loops.length > 0,
      message: `Ready: ${preflightE.ready_for_import}, loops: ${preflightE.parent_loops.join(',')}`
    });
  } catch (e: any) {
    results.push({ testName: 'TEST_E', passed: false, message: e.message });
  }

  // Test F: Grade = 4
  try {
    const rowF = { ...validRow, grade: 4 };
    const preflightF = runRepertoryCsvPreflight([rowF]);
    results.push({
      testName: 'TEST_F',
      passed: preflightF.ready_for_import === false && preflightF.invalid_grades.length > 0,
      message: `Ready: ${preflightF.ready_for_import}, grades: ${preflightF.invalid_grades.join(',')}`
    });
  } catch (e: any) {
    results.push({ testName: 'TEST_F', passed: false, message: e.message });
  }

  // Test G: source_work missing
  try {
    const rowG = { ...validRow, source_work: '' };
    const preflightG = runRepertoryCsvPreflight([rowG]);
    results.push({
      testName: 'TEST_G',
      passed: preflightG.ready_for_import === false && preflightG.missing_provenance.length > 0,
      message: `Ready: ${preflightG.ready_for_import}`
    });
  } catch (e: any) {
    results.push({ testName: 'TEST_G', passed: false, message: e.message });
  }

  // Test H: source_reference missing
  try {
    const rowH = { ...validRow, source_reference: '' };
    const preflightH = runRepertoryCsvPreflight([rowH]);
    results.push({
      testName: 'TEST_H',
      passed: preflightH.ready_for_import === false && preflightH.missing_provenance.length > 0,
      message: `Ready: ${preflightH.ready_for_import}`
    });
  } catch (e: any) {
    results.push({ testName: 'TEST_H', passed: false, message: e.message });
  }

  // Test I: Duplicate row
  try {
    const preflightI = runRepertoryCsvPreflight([validRow, validRow]);
    results.push({
      testName: 'TEST_I',
      passed: preflightI.ready_for_import === false && preflightI.duplicate_rows > 0,
      message: `Ready: ${preflightI.ready_for_import}, duplicates: ${preflightI.duplicate_rows}`
    });
  } catch (e: any) {
    results.push({ testName: 'TEST_I', passed: false, message: e.message });
  }

  // Test J: Ready CSV compatible with admin dry run
  try {
    const csvStr = exportRowsToCsvString([validRow]);
    const dryRun = repertoryImportManager.runDryRun('test_ready.csv', 'CSV', csvStr, {
      source_work: 'Repertory of the Homoeopathic Materia Medica',
      source_edition: '',
      source_language: 'en',
      license_status: 'UNKNOWN',
      license_note: ''
    });
    results.push({
      testName: 'TEST_J',
      passed: dryRun.dryRun.ready_for_activation === true && dryRun.dryRun.invalid_records === 0,
      message: `Admin dry run ready: ${dryRun.dryRun.ready_for_activation}`
    });
  } catch (e: any) {
    results.push({ testName: 'TEST_J', passed: false, message: e.message });
  }

  return results;
}
