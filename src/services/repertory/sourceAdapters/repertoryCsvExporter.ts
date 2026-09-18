import { CanonicalCsvRow } from './canonicalRepertoryCsvTypes';

export const CANONICAL_CSV_HEADERS = [
  'dataset_id',
  'source_work',
  'source_author',
  'source_language',
  'source_page',
  'chapter',
  'rubric_id',
  'parent_rubric_id',
  'rubric_path',
  'rubric_text_original',
  'source_remedy_id',
  'canonical_remedy_id',
  'canonical_name',
  'grade',
  'grade_original',
  'source_reference',
  'license_status',
  'source_edition',
  'license_note',
  'source_file',
  'source_note'
];

export function exportRowsToCsvString(rows: CanonicalCsvRow[]): string {
  const lines: string[] = [];
  lines.push(CANONICAL_CSV_HEADERS.join(','));

  rows.forEach(r => {
    const vals = CANONICAL_CSV_HEADERS.map(h => {
      const val = (r as any)[h];
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    lines.push(vals.join(','));
  });

  return lines.join('\n');
}
