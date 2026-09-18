import { CanonicalCsvRow, PreflightReport } from './canonicalRepertoryCsvTypes';
import { resolveRemedyIdentity } from '../remedyIdentityResolver';

export function runRepertoryCsvPreflight(rows: CanonicalCsvRow[]): PreflightReport {
  const errors: Array<{ row_index: number; rubric_id: string; error_code: string; message: string }> = [];
  
  const allRubricIds = new Set<string>();
  const seenRowKeys = new Set<string>();

  const unresolvedRemediesSet = new Set<string>();
  const unknownCanonicalSet = new Set<string>();
  const missingParentsSet = new Set<string>();
  const invalidGradesSet = new Set<string>();
  const missingProvenanceSet = new Set<string>();
  const invalidRubricIdsSet = new Set<string>();
  const parentLoopsSet = new Set<string>();
  let duplicate_rows = 0;

  // First pass: collect IDs and check duplicates
  rows.forEach((row, index) => {
    const rId = row.rubric_id?.trim();
    if (!rId) {
      invalidRubricIdsSet.add(`row_${index}`);
      errors.push({ row_index: index, rubric_id: 'MISSING', error_code: 'INVALID_RUBRIC_ID', message: 'Rubric ID is missing' });
    } else {
      allRubricIds.add(rId);
    }
  });

  // Second pass: validate each row
  rows.forEach((row, index) => {
    const rId = row.rubric_id?.trim() || `row_${index}`;
    const parentId = row.parent_rubric_id?.trim() || null;

    // Check duplicate rubric + remedy
    const rowKey = `${rId}|${row.source_remedy_id}`;
    if (seenRowKeys.has(rowKey)) {
      duplicate_rows++;
      errors.push({ row_index: index, rubric_id: rId, error_code: 'DUPLICATE_ROW', message: `Duplicate rubric-remedy assignment: ${rId} / ${row.source_remedy_id}` });
    } else {
      seenRowKeys.add(rowKey);
    }

    // Check parent reference
    if (parentId && parentId !== '' && parentId !== 'null') {
      if (parentId === rId) {
        parentLoopsSet.add(rId);
        errors.push({ row_index: index, rubric_id: rId, error_code: 'PARENT_LOOP', message: `Self parent reference: ${rId}` });
      } else if (!allRubricIds.has(parentId)) {
        missingParentsSet.add(parentId);
        errors.push({ row_index: index, rubric_id: rId, error_code: 'MISSING_PARENT_RUBRIC', message: `Parent rubric ID not found in dataset: ${parentId}` });
      }
    }

    // Check Grade (1, 2, 3)
    const gradeNum = Number(row.grade);
    if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 3) {
      invalidGradesSet.add(String(row.grade));
      errors.push({ row_index: index, rubric_id: rId, error_code: 'INVALID_GRADE', message: `Invalid grade: ${row.grade} (must be 1, 2, or 3)` });
    }

    // Check Provenance
    if (!row.source_work || !row.source_author || !row.source_language || !row.source_page || !row.source_reference || !row.license_status) {
      missingProvenanceSet.add(rId);
      errors.push({ row_index: index, rubric_id: rId, error_code: 'MISSING_PROVENANCE', message: 'Missing required provenance field(s)' });
    }

    // Check Remedy Resolution against Master / Resolver
    const sourceRem = row.source_remedy_id?.trim();
    const canonRem = row.canonical_remedy_id?.trim();

    if (!sourceRem) {
      unresolvedRemediesSet.add('MISSING_SOURCE_REMEDY');
      errors.push({ row_index: index, rubric_id: rId, error_code: 'UNRESOLVED_SOURCE_REMEDY', message: 'Source remedy ID is missing' });
    } else {
      const resolved = resolveRemedyIdentity(sourceRem);
      if (resolved.status === 'UNRESOLVED') {
        unresolvedRemediesSet.add(sourceRem);
        errors.push({ row_index: index, rubric_id: rId, error_code: 'UNRESOLVED_SOURCE_REMEDY', message: `Unresolved source remedy ID: ${sourceRem}` });
      } else if (canonRem && resolved.canonical_id !== canonRem) {
        unknownCanonicalSet.add(canonRem);
        errors.push({ row_index: index, rubric_id: rId, error_code: 'UNKNOWN_CANONICAL_REMEDY', message: `Canonical remedy ID mismatch: expected ${resolved.canonical_id}, got ${canonRem}` });
      }
    }
  });

  const total_rows = rows.length;
  const invalidRowsSet = new Set(errors.map(e => e.row_index));
  const invalid_rows = invalidRowsSet.size;
  const valid_rows = Math.max(0, total_rows - invalid_rows);

  const unresolved_source_remedy_ids = Array.from(unresolvedRemediesSet);
  const unknown_canonical_remedy_ids = Array.from(unknownCanonicalSet);
  const missing_parent_rubrics = Array.from(missingParentsSet);
  const invalid_grades = Array.from(invalidGradesSet);
  const missing_provenance = Array.from(missingProvenanceSet);
  const invalid_rubric_ids = Array.from(invalidRubricIdsSet);
  const parent_loops = Array.from(parentLoopsSet);

  const ready_for_import = 
    total_rows > 0 &&
    invalid_rows === 0 &&
    unresolved_source_remedy_ids.length === 0 &&
    unknown_canonical_remedy_ids.length === 0 &&
    missing_parent_rubrics.length === 0 &&
    duplicate_rows === 0 &&
    invalid_grades.length === 0 &&
    missing_provenance.length === 0 &&
    invalid_rubric_ids.length === 0 &&
    parent_loops.length === 0;

  return {
    total_rows,
    valid_rows,
    invalid_rows,
    unresolved_source_remedy_ids,
    unknown_canonical_remedy_ids,
    missing_parent_rubrics,
    duplicate_rows,
    invalid_grades,
    missing_provenance,
    invalid_rubric_ids,
    parent_loops,
    ready_for_import,
    errors
  };
}
