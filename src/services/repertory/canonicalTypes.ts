export type LicenseStatus = 'UNKNOWN' | 'VERIFIED_ALLOWED' | 'RESTRICTED';

export interface CanonicalRemedyReference {
  remedy_id: string; // resolved canonical id or source-specific id
  grade: number | null;
  grade_original: string | null;
  source_reference?: string | null;
}

export interface SourceReference {
  page?: number | null;
  section?: string | null;
  record_number?: string | number | null;
}

export interface ProvenanceInfo {
  import_source: string;
  imported_at: string;
  checksum: string;
  license_status: LicenseStatus;
  license_note: string;
}

export interface CanonicalRepertoryRubric {
  rubric_id: string;
  source_id: string;
  source_work: string;
  source_edition: string;
  source_language: string;

  chapter: string;
  rubric_path: string[];

  rubric_text_original: string;
  rubric_text_normalized: string;

  parent_rubric_id: string | null;

  keywords: string[];
  synonyms: string[];

  remedies: CanonicalRemedyReference[];

  source_reference: SourceReference;
  provenance: ProvenanceInfo;
}

export interface CanonicalRemedyIdentity {
  canonical_id: string;
  abbreviation: string;
  latin_name: string;
  alternative_ids: string[];
  source_specific_ids: Record<string, string>;
  status: 'RESOLVED' | 'UNRESOLVED';
}
