import { CanonicalRepertoryRubric } from './canonicalTypes';
import { validateCanonicalRubric } from './repertoryValidator';
import { resolveRemedyIdentity } from './remedyIdentityResolver';

export interface ImportReport {
  total: number;
  importable: number;
  fully_valid: number;
  records_with_unresolved_remedies: number;
  unresolved_remedy_ids: string[];
  duplicates: number;
  errors: string[];
}

export function importLegacyKentRubric(legacy: any, checksum: string): { rubric: CanonicalRepertoryRubric | null; report: ImportReport } {
  const errors: string[] = [];
  const unresolvedRemedyIds: string[] = [];
  const remedies = Object.entries(legacy.remedyGrades || {}).map(([rem, grade]) => {
    const resolved = resolveRemedyIdentity(rem);
    if (resolved.status === 'UNRESOLVED') {
      unresolvedRemedyIds.push(rem);
    }
    return {
      remedy_id: resolved.status === 'RESOLVED' ? resolved.canonical_id : rem,
      grade: typeof grade === 'number' ? grade : 1,
      grade_original: String(grade),
      source_reference: null
    };
  });

  const rubric: CanonicalRepertoryRubric = {
    rubric_id: legacy.id,
    source_id: legacy.id,
    source_work: 'J.T. Kent Repertory (Curated Subset)',
    source_edition: null,
    source_language: 'de/en',
    chapter: legacy.chapter || 'General',
    rubric_path: [legacy.chapter || 'General', legacy.rubricName],
    rubric_text_original: legacy.rubricName,
    rubric_text_normalized: legacy.rubricName.toLowerCase(),
    parent_rubric_id: null,
    keywords: legacy.keywords || [],
    synonyms: [],
    remedies,
    source_reference: { page: null, section: null, record_number: legacy.id },
    provenance: {
      import_source: 'src/services/kentRepertoryService.ts',
      imported_at: new Date().toISOString(),
      checksum,
      license_status: 'UNKNOWN',
      license_note: 'Unverified dataset license status'
    }
  };

  const val = validateCanonicalRubric(rubric);
  const hasUnresolved = unresolvedRemedyIds.length > 0;
  return {
    rubric: val.valid ? rubric : null,
    report: {
      total: 1,
      importable: val.valid ? 1 : 0,
      fully_valid: (val.valid && !hasUnresolved) ? 1 : 0,
      records_with_unresolved_remedies: hasUnresolved ? 1 : 0,
      unresolved_remedy_ids: unresolvedRemedyIds,
      duplicates: 0,
      errors: val.errors
    }
  };
}

export function importLegacyBoerickeRubric(legacy: any, checksum: string): { rubric: CanonicalRepertoryRubric | null; report: ImportReport } {
  const rubric: CanonicalRepertoryRubric = {
    rubric_id: legacy.id || legacy.rubricName.substring(0, 20).replace(/\s+/g, '_'),
    source_id: legacy.id || 'boericke_rec',
    source_work: 'William Boericke Materia Medica & Repertory',
    source_edition: null,
    source_language: 'de/en',
    chapter: legacy.chapter || 'General',
    rubric_path: [legacy.chapter || 'General', legacy.rubricName],
    rubric_text_original: legacy.rubricName,
    rubric_text_normalized: legacy.rubricName.toLowerCase(),
    parent_rubric_id: null,
    keywords: legacy.keywords || [],
    synonyms: [],
    remedies: [],
    source_reference: { page: null, section: null, record_number: legacy.id },
    provenance: {
      import_source: 'src/services/boerickeRepertoryService.ts',
      imported_at: new Date().toISOString(),
      checksum,
      license_status: 'UNKNOWN',
      license_note: 'Unverified dataset license status'
    }
  };

  const val = validateCanonicalRubric(rubric);
  return {
    rubric: val.valid ? rubric : null,
    report: {
      total: 1,
      importable: val.valid ? 1 : 0,
      fully_valid: val.valid ? 1 : 0,
      records_with_unresolved_remedies: 0,
      unresolved_remedy_ids: [],
      duplicates: 0,
      errors: val.errors
    }
  };
}

export function importLegacyBogerRubric(key: string, legacy: any, checksum: string): { rubric: CanonicalRepertoryRubric | null; report: ImportReport } {
  const unresolvedRemedyIds: string[] = [];
  const remedies = Object.keys(legacy.grades || {}).map(rem => {
    const resolved = resolveRemedyIdentity(rem);
    if (resolved.status === 'UNRESOLVED') {
      unresolvedRemedyIds.push(rem);
    }
    return {
      remedy_id: resolved.status === 'RESOLVED' ? resolved.canonical_id : rem,
      grade: legacy.grades[rem],
      grade_original: String(legacy.grades[rem]),
      source_reference: null
    };
  });

  const rubric: CanonicalRepertoryRubric = {
    rubric_id: key,
    source_id: key,
    source_work: 'C.M. Boger Synoptic Keynotes',
    source_edition: null,
    source_language: 'de/en',
    chapter: 'Synoptic Keynotes',
    rubric_path: ['Synoptic Keynotes', legacy.remedyId || key],
    rubric_text_original: legacy.remedyId || key,
    rubric_text_normalized: (legacy.remedyId || key).toLowerCase(),
    parent_rubric_id: null,
    keywords: [],
    synonyms: [],
    remedies,
    source_reference: { page: null, section: null, record_number: key },
    provenance: {
      import_source: 'src/data/bogerSynopticData.ts',
      imported_at: new Date().toISOString(),
      checksum,
      license_status: 'UNKNOWN',
      license_note: 'Unverified dataset license status'
    }
  };

  const val = validateCanonicalRubric(rubric);
  const hasUnresolved = unresolvedRemedyIds.length > 0;
  return {
    rubric: val.valid ? rubric : null,
    report: {
      total: 1,
      importable: val.valid ? 1 : 0,
      fully_valid: (val.valid && !hasUnresolved) ? 1 : 0,
      records_with_unresolved_remedies: hasUnresolved ? 1 : 0,
      unresolved_remedy_ids: unresolvedRemedyIds,
      duplicates: 0,
      errors: val.errors
    }
  };
}
