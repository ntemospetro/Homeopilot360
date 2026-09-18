import { RepertorySourceAdapter } from './repertorySourceAdapter';
import { KENT_REMEDY_ALIASES } from './kentRemedyAliases';
import { executeCanonicalRemedyMasterAudit } from '../../remedy/canonicalRemedyMaster';
import { CanonicalCsvRow } from './canonicalRepertoryCsvTypes';
import { resolveRemedyIdentity } from '../remedyIdentityResolver';

export class KentSourceAdapter implements RepertorySourceAdapter {
  public sourceName = 'Kent';
  public defaultAuthor = 'James Tyler Kent';
  public defaultWork = 'Repertory of the Homoeopathic Materia Medica';
  public defaultLanguage = 'en';

  private validCanonicalIds: Set<string> = new Set();
  private canonicalNameMap: Map<string, string> = new Map();

  constructor() {
    // Audit master to build valid set & names
    try {
      const audit = executeCanonicalRemedyMasterAudit();
      // Since executeCanonicalRemedyMasterAudit returns sample records or total count, let's load full records or check resolver.
      // Alternatively, we can use resolveRemedyIdentity from '../remedyIdentityResolver'.
    } catch (e) {}

    // Populate from known identities or resolveRemedyIdentity
  }

  public resolveRemedy(sourceRemedyId: string): { canonical_id: string; canonical_name: string } | null {
    const cleanId = sourceRemedyId.trim().toLowerCase();
    const mappedCanonicalId = KENT_REMEDY_ALIASES[cleanId];
    if (!mappedCanonicalId) return null;

    // Verify against identity resolver or master
    const resolved = resolveRemedyIdentity(mappedCanonicalId);
    if (resolved && resolved.status === 'RESOLVED') {
      return {
        canonical_id: resolved.canonical_id,
        canonical_name: resolved.latin_name || resolved.canonical_id
      };
    }
    return null;
  }

  public preprocessRawContent(
    rawText: string, 
    datasetId: string, 
    meta: { source_work?: string; source_author?: string; source_language?: string; license_status?: string }
  ): CanonicalCsvRow[] {
    // Parses CSV or JSON input lines into CanonicalCsvRow[]
    const lines = rawText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];

    // Check if CSV header exists
    const firstLine = lines[0];
    const isCsv = firstLine.includes(',') || firstLine.includes(';');
    const rows: CanonicalCsvRow[] = [];

    if (isCsv) {
      const delimiter = firstLine.includes(';') ? ';' : ',';
      const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
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
          chapter: rowObj.chapter || 'EXTREMITIES',
          rubric_id: rowObj.rubric_id || `rub_${i}`,
          parent_rubric_id: rowObj.parent_rubric_id || null,
          rubric_path: rowObj.rubric_path || 'EXTREMITIES',
          rubric_text_original: rowObj.rubric_text_original || 'Rubric',
          source_remedy_id: sourceRemId,
          canonical_remedy_id: resolvedRem ? resolvedRem.canonical_id : (rowObj.canonical_remedy_id || sourceRemId),
          canonical_name: resolvedRem ? resolvedRem.canonical_name : (rowObj.canonical_name || sourceRemId),
          grade: Number(rowObj.grade) || 1,
          grade_original: rowObj.grade_original || 'ROMAN',
          source_reference: rowObj.source_reference || `${this.sourceName} p. 1`,
          license_status: rowObj.license_status || meta.license_status || 'UNKNOWN',
          source_edition: rowObj.source_edition || null,
          license_note: rowObj.license_note || '',
          source_file: rowObj.source_file || null,
          source_note: rowObj.source_note || ''
        });
      }
    } else {
      // Try JSON parse
      try {
        const parsed = JSON.parse(rawText);
        const rawItems = Array.isArray(parsed) ? parsed : (parsed.records || []);
        rawItems.forEach((item: any, i: number) => {
          const sourceRemId = item.source_remedy_id || item.remedy_id || '';
          const resolvedRem = this.resolveRemedy(sourceRemId);
          rows.push({
            dataset_id: item.dataset_id || datasetId,
            source_work: item.source_work || meta.source_work || this.defaultWork,
            source_author: item.source_author || meta.source_author || this.defaultAuthor,
            source_language: item.source_language || meta.source_language || this.defaultLanguage,
            source_page: item.source_page || '1',
            chapter: item.chapter || 'EXTREMITIES',
            rubric_id: item.rubric_id || item.id || `rub_${i}`,
            parent_rubric_id: item.parent_rubric_id || item.parentId || null,
            rubric_path: item.rubric_path || 'EXTREMITIES',
            rubric_text_original: item.rubric_text_original || item.text || 'Rubric',
            source_remedy_id: sourceRemId,
            canonical_remedy_id: resolvedRem ? resolvedRem.canonical_id : (item.canonical_remedy_id || sourceRemId),
            canonical_name: resolvedRem ? resolvedRem.canonical_name : (item.canonical_name || sourceRemId),
            grade: Number(item.grade) || 1,
            grade_original: item.grade_original || 'ROMAN',
            source_reference: item.source_reference || `${this.sourceName} p. 1`,
            license_status: item.license_status || meta.license_status || 'UNKNOWN',
            source_edition: item.source_edition || null,
            license_note: item.license_note || '',
            source_file: item.source_file || null,
            source_note: item.source_note || ''
          });
        });
      } catch (e) {}
    }

    return rows;
  }
}
