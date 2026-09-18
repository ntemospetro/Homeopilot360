import { CanonicalRemedyMasterRecord } from './canonicalRemedyTypes';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateCanonicalRemedyMaster(records: CanonicalRemedyMasterRecord[]): ValidationResult {
  const errors: string[] = [];
  const idSet = new Set<string>();
  const abbrSet = new Map<string, string>();
  const latinSet = new Map<string, string>();

  for (const rec of records) {
    if (!rec.canonical_id || rec.canonical_id.trim() === '') {
      errors.push(`EMPTY_CANONICAL_ID for record: ${JSON.stringify(rec)}`);
      continue;
    }
    if (idSet.has(rec.canonical_id)) {
      errors.push(`DUPLICATE_CANONICAL_ID: ${rec.canonical_id}`);
    }
    idSet.add(rec.canonical_id);

    const abbrKey = rec.abbreviation.toLowerCase();
    if (abbrSet.has(abbrKey)) {
      errors.push(`ABBREVIATION_COLLISION: '${rec.abbreviation}' shared by ${abbrSet.get(abbrKey)} and ${rec.canonical_id}`);
    } else {
      abbrSet.set(abbrKey, rec.canonical_id);
    }

    const latinKey = rec.latin_name.toLowerCase();
    if (latinKey && latinSet.has(latinKey)) {
      errors.push(`LATIN_NAME_COLLISION: '${rec.latin_name}' shared by ${latinSet.get(latinKey)} and ${rec.canonical_id}`);
    } else if (latinKey) {
      latinSet.set(latinKey, rec.canonical_id);
    }

    if (rec.identity_status === 'UNRESOLVED' && rec.canonical_id.includes('unknown')) {
      // Allowed if marked unresolved
    }
    if (rec.identity_status === 'CONFLICT') {
      errors.push(`UNRESOLVED_CONFLICT_RECORD: ${rec.canonical_id}`);
    }

    // Check sources
    const allSources = [
      ...rec.sources.materia_medica,
      ...rec.sources.allen_keynotes,
      ...rec.sources.medications_db,
      ...rec.sources.medications_catalog,
      ...rec.sources.repertory
    ];
    for (const src of allSources) {
      if (!src.file || !src.record_id) {
        errors.push(`INVALID_SOURCE_REFERENCE in ${rec.canonical_id}: ${JSON.stringify(src)}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
