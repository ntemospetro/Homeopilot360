import { CanonicalRepertoryRubric } from './canonicalTypes';
import { resolveRemedyIdentity } from './remedyIdentityResolver';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateCanonicalRubric(rubric: CanonicalRepertoryRubric): ValidationResult {
  const errors: string[] = [];

  if (!rubric.rubric_id || rubric.rubric_id.trim() === '') {
    errors.push('MISSING_RUBRIC_ID');
  }
  if (!rubric.source_work || rubric.source_work.trim() === '') {
    errors.push('MISSING_SOURCE_WORK');
  }
  if (!rubric.chapter || rubric.chapter.trim() === '') {
    errors.push('MISSING_CHAPTER');
  }
  if (!rubric.rubric_text_original || rubric.rubric_text_original.trim() === '') {
    errors.push('MISSING_RUBRIC_TEXT_ORIGINAL');
  }
  if (!Array.isArray(rubric.rubric_path) || rubric.rubric_path.length === 0) {
    errors.push('EMPTY_RUBRIC_PATH');
  }
  if (!rubric.provenance || !rubric.provenance.import_source || !rubric.provenance.license_status) {
    errors.push('MISSING_PROVENANCE_OR_LICENSE');
  }
  if (rubric.provenance && rubric.provenance.license_status === 'VERIFIED_ALLOWED' && !rubric.provenance.license_note) {
    errors.push('VERIFIED_ALLOWED_WITHOUT_LICENSE_NOTE');
  }

  for (const rem of rubric.remedies || []) {
    if (!rem.remedy_id) {
      errors.push('INVALID_REMEDY_ID');
    } else {
      const resolved = resolveRemedyIdentity(rem.remedy_id);
      if (resolved.status === 'UNRESOLVED') {
        errors.push(`UNRESOLVED_REMEDY_ID: ${rem.remedy_id}`);
      }
    }
    if (rem.grade !== null && (typeof rem.grade !== 'number' || rem.grade < 1 || rem.grade > 3)) {
      errors.push(`INVALID_GRADE: ${rem.grade}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
