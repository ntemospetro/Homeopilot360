export interface CanonicalCsvRow {
  dataset_id: string;
  source_work: string;
  source_author: string;
  source_language: string;
  source_page: string | number;
  chapter: string;
  rubric_id: string;
  parent_rubric_id: string | null;
  rubric_path: string;
  rubric_text_original: string;
  source_remedy_id: string;
  canonical_remedy_id: string;
  canonical_name: string;
  grade: number;
  grade_original: string;
  source_reference: string;
  license_status: string;
  source_edition?: string | null;
  license_note?: string | null;
  source_file?: string | null;
  source_note?: string | null;
}

export interface PreflightReport {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  unresolved_source_remedy_ids: string[];
  unknown_canonical_remedy_ids: string[];
  missing_parent_rubrics: string[];
  duplicate_rows: number;
  invalid_grades: string[];
  missing_provenance: string[];
  invalid_rubric_ids: string[];
  parent_loops: string[];
  ready_for_import: boolean;
  errors: Array<{ row_index: number; rubric_id: string; error_code: string; message: string }>;
}
