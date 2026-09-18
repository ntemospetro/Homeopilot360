import { materiaMedicaImportManager } from './materiaMedicaImportManager';
import { MATERIA_MEDICA_ENTRIES } from '../../data/materiaMedicaData';

export function runMateriaMedicaImportTests(): { testName: string; passed: boolean; message: string }[] {
  const results = [];

  // Test 1: Parse CSV data with new and existing remedies
  try {
    const csvContent = `id,latinname,commonname_de,essence,indications,keynotes,source_author
aconitum-napellus,Aconitum napellus,Sturmhut,Updated essence for test,Fever,Anxiety,Hahnemann
brandnew-remedy,Brandnew remedy,Brandneu,Brandnew essence,Cough,Dry cough,Kent`;

    const records = materiaMedicaImportManager.parseImportData(csvContent, 'dataset_test_mm', { source_author: 'Hahnemann' });
    
    const existingRec = records.find(r => r.imported_entry.id === 'aconitum-napellus');
    const newRec = records.find(r => r.imported_entry.id === 'brandnew-remedy');

    results.push({
      testName: 'MM_PARSE_EXISTING_AND_NEW',
      passed: records.length === 2 && Boolean(existingRec?.conflict_detected) && Boolean(newRec?.is_new),
      message: `Parsed ${records.length} records, existing conflict: ${existingRec?.conflict_detected}, new: ${newRec?.is_new}`
    });

    // Test 2: Preflight
    const preflight = materiaMedicaImportManager.runPreflight();
    results.push({
      testName: 'MM_PREFLIGHT_VALIDATION',
      passed: preflight.total_rows === 2 && preflight.ready_for_import === true,
      message: `Total: ${preflight.total_rows}, ready: ${preflight.ready_for_import}`
    });

    // Test 3: Conflict strategy KEEP_EXISTING vs OVERWRITE vs MERGE
    if (existingRec) {
      materiaMedicaImportManager.setResolutionStrategy(existingRec.import_id, 'KEEP_EXISTING');
      const kept = existingRec.resolved_entry?.translations.de.essence !== 'Updated essence for test';

      materiaMedicaImportManager.setResolutionStrategy(existingRec.import_id, 'OVERWRITE');
      const overwritten = existingRec.resolved_entry?.translations.de.essence === 'Updated essence for test';

      materiaMedicaImportManager.setResolutionStrategy(existingRec.import_id, 'MERGE');
      const merged = existingRec.resolved_entry !== undefined;

      results.push({
        testName: 'MM_CONFLICT_STRATEGIES',
        passed: kept && overwritten && merged,
        message: `Keep existing: ${kept}, overwrite: ${overwritten}, merge: ${merged}`
      });
    } else {
      results.push({ testName: 'MM_CONFLICT_STRATEGIES', passed: false, message: 'Existing rec not found' });
    }

  } catch (e: any) {
    results.push({ testName: 'MM_IMPORT_PIPELINE_ERROR', passed: false, message: e.message });
  }

  // Test 4: Verify 670 MM entries preserved
  try {
    results.push({
      testName: 'MM_670_ENTRIES_PRESERVED',
      passed: MATERIA_MEDICA_ENTRIES.length === 670,
      message: `MM entries count: ${MATERIA_MEDICA_ENTRIES.length}`
    });
  } catch (e: any) {
    results.push({ testName: 'MM_670_ENTRIES_PRESERVED', passed: false, message: e.message });
  }

  return results;
}
