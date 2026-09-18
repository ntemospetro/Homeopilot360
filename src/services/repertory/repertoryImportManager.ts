import { CanonicalRepertoryRubric } from './canonicalTypes';
import { resolveRemedyIdentity } from './remedyIdentityResolver';
import { validateCanonicalRubric } from './repertoryValidator';

export type ImportStatus = 'UPLOADED' | 'DRY_RUN' | 'VALIDATED' | 'REJECTED' | 'ACTIVE' | 'ARCHIVED';
export type LicenseStatus = 'UNKNOWN' | 'VERIFIED_ALLOWED' | 'RESTRICTED';

export interface DatasetImportRecord {
  import_id: string;
  file_name: string;
  format: 'JSON' | 'CSV' | 'TSV';
  source_work: string;
  source_edition: string | null;
  source_language: string;
  license_status: LicenseStatus;
  license_note: string;
  uploaded_at: string;
  checksum: string;
  status: ImportStatus;
  rubric_count: number;
  remedy_mapping_count: number;
  active_since: string | null;
  dry_run_result: DryRunResult | null;
  audit_log: AuditLogEntry[];
  raw_items: any[];
}

export interface UnresolvedRemedyEntry {
  source_remedy_id: string;
  record_count: number;
  status: 'UNRESOLVED';
}

export interface ValidationErrorItem {
  record_index: number;
  rubric_id: string;
  error_code: string;
  description: string;
}

export interface DryRunResult {
  file_name: string;
  format: 'JSON' | 'CSV' | 'TSV';
  source_work: string;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  duplicate_records: number;
  unresolved_remedy_ids: UnresolvedRemedyEntry[];
  invalid_grades: ValidationErrorItem[];
  missing_required_fields: ValidationErrorItem[];
  broken_parent_references: ValidationErrorItem[];
  other_errors: ValidationErrorItem[];
  license_status: LicenseStatus;
  ready_for_activation: boolean;
  error_list: ValidationErrorItem[];
}

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  details: string;
}

export const REPERTORY_IMPORT_BUILD_MARKER = 'runtime-trace-v4';

export function sanitizeRepertoryImportState(raw: any): {
  storage_schema_version: number;
  datasets: DatasetImportRecord[];
} {
  let datasetsRaw: any[] = [];
  if (Array.isArray(raw)) {
    datasetsRaw = raw;
  } else if (raw && typeof raw === 'object' && Array.isArray(raw.datasets)) {
    datasetsRaw = raw.datasets;
  } else if (raw && typeof raw === 'object' && raw.datasets && typeof raw.datasets === 'object') {
    datasetsRaw = Object.values(raw.datasets);
  } else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    // If raw is an object with dataset keys or similar
    const possibleDatasets = Object.values(raw).filter(val => val && typeof val === 'object');
    if (possibleDatasets.length > 0 && possibleDatasets.some((d: any) => d.import_id || d.file_name)) {
      datasetsRaw = possibleDatasets;
    }
  }

  const sanitizedDatasets: DatasetImportRecord[] = [];
  (Array.isArray(datasetsRaw) ? datasetsRaw : []).forEach((d: any) => {
    if (!d || typeof d !== 'object') return;
    const sanitizedRecord: DatasetImportRecord = {
      import_id: typeof d.import_id === 'string' ? d.import_id : 'imp_' + Math.random(),
      file_name: typeof d.file_name === 'string' ? d.file_name : 'unknown.json',
      format: d.format === 'CSV' || d.format === 'TSV' ? d.format : 'JSON',
      source_work: typeof d.source_work === 'string' ? d.source_work : 'Unknown Source',
      source_edition: typeof d.source_edition === 'string' ? d.source_edition : null,
      source_language: typeof d.source_language === 'string' ? d.source_language : 'en',
      license_status: d.license_status === 'VERIFIED_ALLOWED' || d.license_status === 'RESTRICTED' ? d.license_status : 'UNKNOWN',
      license_note: typeof d.license_note === 'string' ? d.license_note : '',
      uploaded_at: typeof d.uploaded_at === 'string' ? d.uploaded_at : new Date().toISOString(),
      checksum: typeof d.checksum === 'string' ? d.checksum : 'chk_unknown',
      status: ['UPLOADED', 'DRY_RUN', 'VALIDATED', 'REJECTED', 'ACTIVE', 'ARCHIVED'].includes(d.status) ? d.status : 'DRY_RUN',
      rubric_count: typeof d.rubric_count === 'number' ? d.rubric_count : 0,
      remedy_mapping_count: typeof d.remedy_mapping_count === 'number' ? d.remedy_mapping_count : 0,
      active_since: typeof d.active_since === 'string' ? d.active_since : null,
      dry_run_result: d.dry_run_result && typeof d.dry_run_result === 'object' ? {
        file_name: typeof d.dry_run_result.file_name === 'string' ? d.dry_run_result.file_name : 'unknown.json',
        format: d.dry_run_result.format === 'CSV' || d.dry_run_result.format === 'TSV' ? d.dry_run_result.format : 'JSON',
        source_work: typeof d.dry_run_result.source_work === 'string' ? d.dry_run_result.source_work : 'Unknown Source',
        total_records: typeof d.dry_run_result.total_records === 'number' ? d.dry_run_result.total_records : 0,
        valid_records: typeof d.dry_run_result.valid_records === 'number' ? d.dry_run_result.valid_records : 0,
        invalid_records: typeof d.dry_run_result.invalid_records === 'number' ? d.dry_run_result.invalid_records : 0,
        duplicate_records: typeof d.dry_run_result.duplicate_records === 'number' ? d.dry_run_result.duplicate_records : 0,
        unresolved_remedy_ids: Array.isArray(d.dry_run_result.unresolved_remedy_ids) ? d.dry_run_result.unresolved_remedy_ids : [],
        invalid_grades: Array.isArray(d.dry_run_result.invalid_grades) ? d.dry_run_result.invalid_grades : [],
        missing_required_fields: Array.isArray(d.dry_run_result.missing_required_fields) ? d.dry_run_result.missing_required_fields : [],
        broken_parent_references: Array.isArray(d.dry_run_result.broken_parent_references) ? d.dry_run_result.broken_parent_references : [],
        other_errors: Array.isArray(d.dry_run_result.other_errors) ? d.dry_run_result.other_errors : [],
        license_status: d.dry_run_result.license_status || 'UNKNOWN',
        ready_for_activation: Boolean(d.dry_run_result.ready_for_activation),
        error_list: Array.isArray(d.dry_run_result.error_list) ? d.dry_run_result.error_list : []
      } : null,
      audit_log: Array.isArray(d.audit_log) ? d.audit_log : [],
      raw_items: Array.isArray(d.raw_items) ? d.raw_items : []
    };
    sanitizedDatasets.push(sanitizedRecord);
  });

  return {
    storage_schema_version: 3,
    datasets: sanitizedDatasets
  };
}

export interface NormalizedRepertoryImport {
  source: {
    source_work?: string;
    source_edition?: string | null;
    source_language?: string;
    license_status?: LicenseStatus;
  };
  records: any[];
}

export function normalizeRepertoryJsonInput(parsed: any): NormalizedRepertoryImport {
  if (Array.isArray(parsed)) {
    const records = parsed;
    let sourceMeta: any = {};
    if (records.length > 0 && records[0]) {
      const first = records[0];
      sourceMeta = {
        source_work: first.source_work || first.sourceWork || first.provenance?.source_work,
        source_edition: first.source_edition || first.sourceEdition || first.provenance?.source_edition || null,
        source_language: first.source_language || first.sourceLanguage || first.provenance?.language || 'de',
        license_status: first.license_status || first.provenance?.license_status || 'UNKNOWN'
      };
    }
    return { source: sourceMeta, records };
  } else if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    if (Array.isArray(parsed.records)) {
      const records = parsed.records;
      const src = parsed.source || {};
      const sourceMeta = {
        source_work: src.source_work || src.sourceWork || src.work || src.title,
        source_edition: src.source_edition || src.sourceEdition || src.edition || null,
        source_language: src.source_language || src.language || 'de',
        license_status: src.license_status || src.licenseStatus || 'UNKNOWN'
      };
      return { source: sourceMeta, records };
    } else {
      throw new Error('INVALID_JSON_STRUCTURE');
    }
  } else {
    throw new Error('INVALID_JSON_STRUCTURE');
  }
}

// In-memory or localStorage-backed registry for admin import module
class RepertoryImportManagerService {
  private datasets: Map<string, DatasetImportRecord> = new Map();

  constructor() {
    this.loadFromStorage();
    if (this.datasets.size === 0) {
      // Seed initial sample dataset for testing
      this.seedSampleDataset();
    }
  }

  private loadFromStorage() {
    let current_stage = 'LOAD_STORAGE';
    try {
      current_stage = 'LOAD_STORAGE';
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('homoeo_repertory_datasets') : null;
      const versionStored = typeof localStorage !== 'undefined' ? localStorage.getItem('homoeo_repertory_schema_version') : null;
      const version = versionStored ? Number(versionStored) : 1;

      let raw = stored ? JSON.parse(stored) : null;
      const sanitized = sanitizeRepertoryImportState(raw);
      sanitized.datasets.forEach(d => this.datasets.set(d.import_id, d));

      if (version < 3 || !stored) {
        this.saveToStorage();
      }
    } catch (e: any) {
      console.error('[REPERTORY_IMPORT_STORAGE_ERROR]', {
        current_stage,
        error_name: e.name,
        error_message: e.message,
        error_stack: e.stack
      });
      // Safe reset fallback: remove only repertory keys
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('homoeo_repertory_datasets');
          localStorage.removeItem('homoeo_repertory_schema_version');
        }
      } catch (err) {}
    }
  }

  private saveToStorage() {
    let current_stage = 'SAVE_DRY_RUN';
    try {
      current_stage = 'SAVE_DRY_RUN';
      const arr = Array.from(this.datasets.values());
      const state = {
        storage_schema_version: 3,
        datasets: arr
      };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('homoeo_repertory_datasets', JSON.stringify(state));
        localStorage.setItem('homoeo_repertory_schema_version', '3');
      }
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('homoeo_repertory_datasets_updated'));
      }
    } catch (e: any) {
      console.error('[REPERTORY_IMPORT_STORAGE_ERROR]', {
        current_stage,
        error_name: e.name,
        error_message: e.message,
        error_stack: e.stack
      });
    }
  }

  private seedSampleDataset() {
    const sampleId = 'ds_sample_kent_subset';
    const sampleDataset: DatasetImportRecord = {
      import_id: sampleId,
      file_name: 'kent_curated_sample.json',
      format: 'JSON',
      source_work: 'J.T. Kent Repertory (Sample)',
      source_edition: '1st Edition',
      source_language: 'de',
      license_status: 'VERIFIED_ALLOWED',
      license_note: 'Standard public domain homeopathic sample',
      uploaded_at: new Date().toISOString(),
      checksum: 'sha256_sample_checksum_abc123',
      status: 'ACTIVE',
      rubric_count: 5,
      remedy_mapping_count: 12,
      active_since: new Date().toISOString(),
      dry_run_result: {
        file_name: 'kent_curated_sample.json',
        format: 'JSON',
        source_work: 'J.T. Kent Repertory (Sample)',
        total_records: 5,
        valid_records: 5,
        invalid_records: 0,
        duplicate_records: 0,
        unresolved_remedy_ids: [],
        invalid_grades: [],
        missing_required_fields: [],
        broken_parent_references: [],
        other_errors: [],
        license_status: 'VERIFIED_ALLOWED',
        ready_for_activation: true,
        error_list: []
      },
      audit_log: [
        { timestamp: new Date().toISOString(), action: 'UPLOAD', details: 'Sample dataset uploaded' },
        { timestamp: new Date().toISOString(), action: 'DRY_RUN', details: 'Dry run passed successfully' },
        { timestamp: new Date().toISOString(), action: 'ACTIVATE', details: 'Dataset activated by admin' }
      ],
      raw_items: []
    };
    this.datasets.set(sampleId, sampleDataset);
    this.saveToStorage();
  }

  public getAllDatasets(): DatasetImportRecord[] {
    return Array.from(this.datasets.values());
  }

  public getDataset(importId: string): DatasetImportRecord | undefined {
    return this.datasets.get(importId);
  }

  public computeChecksum(content: any): string {
    const str = typeof content === 'string' ? content : (typeof content === 'object' ? JSON.stringify(content) : String(content || ''));
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'chk_' + Math.abs(hash).toString(16);
  }

  public parseInputContent(content: string, format: 'JSON' | 'CSV' | 'TSV'): any[] {
    if (format === 'JSON') {
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e: any) {
        throw new Error('INVALID_JSON_STRUCTURE');
      }
      const normalized = normalizeRepertoryJsonInput(parsed);
      return normalized.records;
    }
    // Simple CSV/TSV parser line by line
    const delimiter = format === 'TSV' ? '\t' : ',';
    const lines = content.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 2) return [];
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
    const items: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h] = vals[idx] || '';
      });
      items.push(obj);
    }
    return items;
  }

  public runDryRun(
    fileName: string,
    format: 'JSON' | 'CSV' | 'TSV',
    rawText: string,
    meta: {
      source_work: string;
      source_edition: string | null;
      source_language: string;
      license_status: LicenseStatus;
      license_note: string;
    }
  ): { dataset: DatasetImportRecord; dryRun: DryRunResult } {
    let rawItems: any[] = [];
    const errors: ValidationErrorItem[] = [];
    const unresolvedMap: Map<string, number> = new Map();
    let duplicateCount = 0;
    const seenRubricIds = new Set<string>();
    const allRubricIds = new Set<string>();

    try {
      if (format === 'JSON') {
        const parsedJson = typeof rawText === 'string' ? JSON.parse(rawText) : rawText;
        const normalized = normalizeRepertoryJsonInput(parsedJson);
        console.log('[REPERTORY_IMPORT_DIAGNOSTIC]', {
          REPERTORY_IMPORT_BUILD_MARKER,
          normalized_is_array: Array.isArray(normalized.records),
          normalized_record_count: normalized.records?.length,
          first_record_rubric_id: normalized.records?.[0]?.rubric_id
        });
        rawItems = Array.isArray(normalized.records) ? normalized.records : [];
        if (normalized.source) {
          if (!meta.source_work && normalized.source.source_work) meta.source_work = normalized.source.source_work;
          if (!meta.source_edition && normalized.source.source_edition) meta.source_edition = normalized.source.source_edition;
          if (!meta.source_language && normalized.source.source_language) meta.source_language = normalized.source.source_language;
          if ((!meta.license_status || meta.license_status === 'UNKNOWN') && normalized.source.license_status) meta.license_status = normalized.source.license_status;
        }
      } else {
        rawItems = this.parseInputContent(rawText, format);
      }
    } catch (e: any) {
      const errCode = e.message === 'INVALID_JSON_STRUCTURE' ? 'INVALID_JSON_STRUCTURE' : 'PARSING_ERROR';
      errors.push({
        record_index: 0,
        rubric_id: 'GLOBAL',
        error_code: errCode,
        description: `Failed to parse file content: ${e.message}`
      });
    }

    rawItems.forEach((item, index) => {
      const rId = item.rubric_id || item.id || `rec_${index}`;
      const chapter = item.chapter || item.CHAPTER;
      const text = item.rubric_text_original || item.text || item.RUBRIC_NAME;
      const parentId = item.parent_rubric_id || item.parentId || null;
      const remedies = item.remedies || item.remedyGrades || {};

      if (!item.rubric_id && !item.id) {
        errors.push({ record_index: index, rubric_id: rId, error_code: 'MISSING_RUBRIC_ID', description: 'Rubric ID is required' });
      }
      if (!meta.source_work) {
        errors.push({ record_index: index, rubric_id: rId, error_code: 'MISSING_SOURCE_WORK', description: 'Source work metadata is required' });
      }
      if (!chapter) {
        errors.push({ record_index: index, rubric_id: rId, error_code: 'MISSING_CHAPTER', description: 'Chapter is required' });
      }
      if (!text) {
        errors.push({ record_index: index, rubric_id: rId, error_code: 'MISSING_RUBRIC_TEXT', description: 'Rubric text original is required' });
      }
      if (seenRubricIds.has(rId)) {
        duplicateCount++;
        errors.push({ record_index: index, rubric_id: rId, error_code: 'DUPLICATE_RUBRIC_ID', description: `Duplicate rubric ID found: ${rId}` });
      } else {
        seenRubricIds.add(rId);
        allRubricIds.add(rId);
      }

      // Check remedies safely
      let normalizedRemedies: Array<{ remKey: any; gradeVal: any }> = [];
      const remediesSafe = remedies !== null && remedies !== undefined ? remedies : {};
      if (Array.isArray(remediesSafe)) {
        remediesSafe.forEach((r: any) => {
          if (Array.isArray(r) && r.length >= 2) {
            normalizedRemedies.push({ remKey: r[0], gradeVal: r[1] });
          } else if (r && typeof r === 'object') {
            const rId = r.remedy_id || r.id || r.key || r.code;
            const gVal = r.grade !== undefined ? r.grade : (r.value !== undefined ? r.value : 1);
            if (rId) {
              normalizedRemedies.push({ remKey: rId, gradeVal: gVal });
            }
          } else if (typeof r === 'string') {
            normalizedRemedies.push({ remKey: r, gradeVal: 1 });
          }
        });
      } else if (typeof remediesSafe === 'object') {
        Object.entries(remediesSafe).forEach(([k, v]) => {
          normalizedRemedies.push({ remKey: k, gradeVal: v });
        });
      }

      normalizedRemedies.forEach(({ remKey, gradeVal }) => {
        const remId = typeof remKey === 'string' ? remKey : (remKey?.remedy_id || remKey?.id || String(remKey || ''));
        const g = typeof gradeVal === 'number' ? gradeVal : Number(gradeVal);
        if (isNaN(g) || g < 1 || g > 3) {
          errors.push({ record_index: index, rubric_id: rId, error_code: 'INVALID_GRADE', description: `Invalid remedy grade: ${gradeVal}` });
        }
        const resolved = resolveRemedyIdentity(remId);
        if (resolved.status === 'UNRESOLVED') {
          const count = unresolvedMap.get(remId) || 0;
          unresolvedMap.set(remId, count + 1);
          errors.push({ record_index: index, rubric_id: rId, error_code: 'UNRESOLVED_REMEDY_ID', description: `Unresolved remedy ID: ${remId}` });
        }
      });

      if (!meta.license_status) {
        errors.push({ record_index: index, rubric_id: rId, error_code: 'INVALID_LICENSE_STATUS', description: 'License status must be specified' });
      }
    });

    // Check parent references
    rawItems.forEach((item, index) => {
      const rId = item.rubric_id || item.id || `rec_${index}`;
      const parentId = item.parent_rubric_id || item.parentId || null;
      if (parentId && !allRubricIds.has(parentId)) {
        errors.push({ record_index: index, rubric_id: rId, error_code: 'BROKEN_PARENT_REFERENCE', description: `Parent rubric ID not found in dataset: ${parentId}` });
      }
    });

    const totalRecords = rawItems.length;
    const invalidRecords = new Set(errors.map(e => e.record_index)).size;
    const validRecords = Math.max(0, totalRecords - invalidRecords);
    const unresolvedArray: UnresolvedRemedyEntry[] = Array.from(unresolvedMap.entries()).map(([source_remedy_id, record_count]) => ({
      source_remedy_id,
      record_count,
      status: 'UNRESOLVED'
    }));

    const hasCriticalErrors = errors.some(e => ['MISSING_RUBRIC_ID', 'MISSING_SOURCE_WORK', 'MISSING_CHAPTER', 'MISSING_RUBRIC_TEXT', 'DUPLICATE_RUBRIC_ID', 'BROKEN_PARENT_REFERENCE'].includes(e.error_code));
    const hasUnresolvedRemedies = unresolvedArray.length > 0;
    const hasInvalidGrades = errors.some(e => e.error_code === 'INVALID_GRADE');

    const readyForActivation = totalRecords > 0 && !hasCriticalErrors && !hasUnresolvedRemedies && !hasInvalidGrades && Boolean(meta.source_work) && Boolean(meta.license_status);

    const dryRunResult: DryRunResult = {
      file_name: fileName,
      format,
      source_work: meta.source_work,
      total_records: totalRecords,
      valid_records: validRecords,
      invalid_records: invalidRecords,
      duplicate_records: duplicateCount,
      unresolved_remedy_ids: unresolvedArray,
      invalid_grades: errors.filter(e => e.error_code === 'INVALID_GRADE'),
      missing_required_fields: errors.filter(e => ['MISSING_RUBRIC_ID', 'MISSING_SOURCE_WORK', 'MISSING_CHAPTER', 'MISSING_RUBRIC_TEXT', 'MISSING_PROVENANCE'].includes(e.error_code)),
      broken_parent_references: errors.filter(e => e.error_code === 'BROKEN_PARENT_REFERENCE'),
      other_errors: errors.filter(e => !['INVALID_GRADE', 'MISSING_RUBRIC_ID', 'MISSING_SOURCE_WORK', 'MISSING_CHAPTER', 'MISSING_RUBRIC_TEXT', 'MISSING_PROVENANCE', 'BROKEN_PARENT_REFERENCE'].includes(e.error_code)),
      license_status: meta.license_status,
      ready_for_activation: readyForActivation,
      error_list: errors
    };

    const importId = 'imp_' + Date.now();
    const checksum = this.computeChecksum(rawText);

    const datasetRecord: DatasetImportRecord = {
      import_id: importId,
      file_name: fileName,
      format,
      source_work: meta.source_work,
      source_edition: meta.source_edition,
      source_language: meta.source_language,
      license_status: meta.license_status,
      license_note: meta.license_note,
      uploaded_at: new Date().toISOString(),
      checksum,
      status: readyForActivation ? 'VALIDATED' : 'DRY_RUN',
      rubric_count: totalRecords,
      remedy_mapping_count: rawItems.reduce((acc, it) => acc + Object.keys(it.remedies || it.remedyGrades || {}).length, 0),
      active_since: null,
      dry_run_result: dryRunResult,
      audit_log: [
        { timestamp: new Date().toISOString(), action: 'UPLOAD', details: `Uploaded file ${fileName}` },
        { timestamp: new Date().toISOString(), action: 'DRY_RUN', details: `Completed dry run with ${validRecords} valid records` }
      ],
      raw_items: rawItems
    };

    this.datasets.set(importId, datasetRecord);
    this.saveToStorage();

    return { dataset: datasetRecord, dryRun: dryRunResult };
  }

  public activateDataset(importId: string): boolean {
    const ds = this.datasets.get(importId);
    if (!ds || !ds.dry_run_result || !ds.dry_run_result.ready_for_activation) {
      return false;
    }
    ds.status = 'ACTIVE';
    ds.active_since = new Date().toISOString();
    ds.audit_log.push({
      timestamp: new Date().toISOString(),
      action: 'ACTIVATE',
      details: 'Dataset explicitly activated by admin'
    });
    this.datasets.set(importId, ds);
    this.saveToStorage();
    return true;
  }

  public archiveDataset(importId: string): boolean {
    const ds = this.datasets.get(importId);
    if (!ds) return false;
    ds.status = 'ARCHIVED';
    ds.audit_log.push({
      timestamp: new Date().toISOString(),
      action: 'ARCHIVE',
      details: 'Dataset archived by admin'
    });
    this.datasets.set(importId, ds);
    this.saveToStorage();
    return true;
  }

  public rejectDataset(importId: string): boolean {
    const ds = this.datasets.get(importId);
    if (!ds) return false;
    ds.status = 'REJECTED';
    ds.audit_log.push({
      timestamp: new Date().toISOString(),
      action: 'REJECT',
      details: 'Dataset rejected due to validation issues'
    });
    this.datasets.set(importId, ds);
    this.saveToStorage();
    return true;
  }
}

export const repertoryImportManager = new RepertoryImportManagerService();
