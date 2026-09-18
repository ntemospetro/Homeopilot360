import { RepertorySourceAdapter } from './repertorySourceAdapter';
import { CanonicalCsvRow } from './canonicalRepertoryCsvTypes';
import { resolveRemedyIdentity } from '../remedyIdentityResolver';

export class GenericCsvSourceAdapter implements RepertorySourceAdapter {
  public sourceName = 'Generic CSV';
  public defaultAuthor = 'Unknown Author';
  public defaultWork = 'Generic Repertory Dataset';
  public defaultLanguage = 'en';

  public resolveRemedy(sourceRemedyId: string): { canonical_id: string; canonical_name: string } | null {
    const cleanId = sourceRemedyId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const resolved = resolveRemedyIdentity(cleanId);
    if (resolved && resolved.status === 'RESOLVED') {
      return {
        canonical_id: resolved.canonical_id,
        canonical_name: resolved.latin_name || resolved.canonical_id
      };
    }
    return {
      canonical_id: cleanId,
      canonical_name: sourceRemedyId
    };
  }

  public preprocessRawContent(
    rawText: string, 
    datasetId: string, 
    meta: { source_work?: string; source_author?: string; source_language?: string; license_status?: string }
  ): CanonicalCsvRow[] {
    const lines = rawText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];

    const firstLine = lines[0];
    const isCsv = firstLine.includes(',') || firstLine.includes(';');
    const rows: CanonicalCsvRow[] = [];

    if (isCsv) {
      const delimiter = firstLine.includes(';') ? ';' : ',';
      const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = cols[idx] !== undefined ? cols[idx] : '';
        });

        const sourceRemId = rowObj.source_remedy_id || rowObj.remedy_id || '';
        const resolvedRem = this.resolveRemedy(sourceRemId);

        rows.push({
          dataset_id: rowObj.dataset_id || datasetId,
          source_work: rowObj.source_work || meta.source_work || this.defaultWork,
          source_author: rowObj.source_author || meta.source_author || this.defaultAuthor,
          source_language: rowObj.source_language || meta.source_language || this.defaultLanguage,
          source_page: rowObj.source_page || '1',
          chapter: rowObj.chapter || 'GENERAL',
          rubric_id: rowObj.rubric_id || `gen_rub_${i}`,
          parent_rubric_id: rowObj.parent_rubric_id || null,
          rubric_path: rowObj.rubric_path || 'GENERAL',
          rubric_text_original: rowObj.rubric_text_original || 'Rubric',
          source_remedy_id: sourceRemId,
          canonical_remedy_id: resolvedRem ? resolvedRem.canonical_id : sourceRemId,
          canonical_name: resolvedRem ? resolvedRem.canonical_name : sourceRemId,
          grade: Number(rowObj.grade) || 1,
          grade_original: rowObj.grade_original || 'NUMERIC',
          source_reference: rowObj.source_reference || `${this.sourceName} p. 1`,
          license_status: rowObj.license_status || meta.license_status || 'UNKNOWN'
        });
      }
    }
    return rows;
  }
}
