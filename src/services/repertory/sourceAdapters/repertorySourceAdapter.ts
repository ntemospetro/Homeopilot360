import { CanonicalCsvRow } from './canonicalRepertoryCsvTypes';

export interface RepertorySourceAdapter {
  sourceName: string;
  defaultAuthor: string;
  defaultWork: string;
  defaultLanguage: string;
  resolveRemedy(sourceRemedyId: string): { canonical_id: string; canonical_name: string } | null;
  preprocessRawContent(rawText: string, datasetId: string, meta: { source_work?: string; source_author?: string; source_language?: string; license_status?: string }): CanonicalCsvRow[];
}
