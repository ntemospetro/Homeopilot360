export type IdentityStatus = 'RESOLVED' | 'UNRESOLVED' | 'CONFLICT';

export interface SourceReferenceEntry {
  file: string;
  record_id: string;
}

export interface RemedySources {
  materia_medica: SourceReferenceEntry[];
  allen_keynotes: SourceReferenceEntry[];
  medications_db: SourceReferenceEntry[];
  medications_catalog: SourceReferenceEntry[];
  repertory: SourceReferenceEntry[];
}

export interface CanonicalRemedyMasterRecord {
  canonical_id: string;
  latin_name: string;
  display_name: string;
  abbreviation: string;

  alternative_ids: string[];
  source_specific_ids: Record<string, string>;

  sources: RemedySources;

  identity_status: IdentityStatus;

  provenance: {
    derived_from_existing_sources: boolean;
    audit_notes: string;
  };
}

export interface CrossSourceCoverageStats {
  total_canonical_remedies: number;
  with_materia_medica: number;
  with_allen_keynotes: number;
  with_medications_db: number;
  with_repertory: number;
  with_multiple_sources: number;
}
