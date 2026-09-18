import { MATERIA_MEDICA_ENTRIES, MateriaMedicaEntry, LocalizedRemedyContent } from '../../data/materiaMedicaData';
import { LanguageCode } from '../../types';

export interface MateriaMedicaImportRecord {
  import_id: string;
  dataset_id: string;
  source_author: string;
  source_work: string;
  source_page: string;
  source_reference: string;
  license_status: string;
  source_note: string;
  imported_entry: MateriaMedicaEntry;
  existing_entry?: MateriaMedicaEntry;
  is_new: boolean;
  conflict_detected: boolean;
  resolution_strategy: 'KEEP_EXISTING' | 'OVERWRITE' | 'MERGE' | 'MANUAL';
  resolved_entry?: MateriaMedicaEntry;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
}

export interface MateriaMedicaPreflightReport {
  total_rows: number;
  new_remedies: number;
  conflicting_remedies: number;
  valid_rows: number;
  invalid_rows: number;
  ready_for_import: boolean;
  errors: string[];
}

export class MateriaMedicaImportManager {
  private imports: MateriaMedicaImportRecord[] = [];
  private importedCustomEntries: MateriaMedicaEntry[] = [];

  public parseImportData(rawText: string, datasetId: string, meta: { source_author?: string; source_work?: string; license_status?: string }): MateriaMedicaImportRecord[] {
    const lines = rawText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];

    const firstLine = lines[0];
    const isCsv = firstLine.includes(',') || firstLine.includes(';');
    const records: MateriaMedicaImportRecord[] = [];

    if (isCsv) {
      const delimiter = firstLine.includes(';') ? ';' : ',';
      const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = cols[idx] !== undefined ? cols[idx] : '';
        });

        const id = (row.id || row.remedy_id || row.latinname || `remedy_${i}`).toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const latinName = row.latinname || row.latin_name || row.name || id;
        const commonDe = row.commonname_de || row.commonname || row.german_name || '';
        const essence = row.essence || row.description || '';
        const categoryKey = row.categorykey || row.category || 'plant';

        const importedEntry: MateriaMedicaEntry = {
          id,
          latinName,
          categoryKey: ['plant', 'mineral', 'animal', 'nosode', 'acid', 'other'].includes(categoryKey) ? categoryKey : 'plant',
          importanceTier: Number(row.importancetier) || 2,
          aliases: row.aliases ? row.aliases.split(',').map((s: string) => s.trim()) : [],
          translations: {
            de: {
              commonName: commonDe || latinName,
              category: categoryKey,
              origin: row.origin || 'Imported origin',
              essence: essence || 'Imported essence description.',
              mainIndications: row.indications ? row.indications.split(',').map((s: string) => s.trim()) : ['General condition'],
              keynotes: row.keynotes ? row.keynotes.split(',').map((s: string) => s.trim()) : ['Imported keynote'],
              mindEmotional: row.mind || 'Imported mind state.',
              modalitiesBetter: row.better ? row.better.split(',').map((s: string) => s.trim()) : [],
              modalitiesWorse: row.worse ? row.worse.split(',').map((s: string) => s.trim()) : [],
              potenciesAndDosage: row.dosage || 'D3 - D30',
              sphereOfAction: ['General'],
              differentialRemedies: [],
              searchKeywords: [latinName, commonDe]
            },
            en: {
              commonName: latinName,
              category: categoryKey,
              origin: 'Imported origin',
              essence: essence || 'Imported essence.',
              mainIndications: ['General condition'],
              keynotes: ['Imported keynote'],
              mindEmotional: 'Imported mind state.',
              modalitiesBetter: [],
              modalitiesWorse: [],
              potenciesAndDosage: '3X - 30C',
              sphereOfAction: ['General'],
              differentialRemedies: [],
              searchKeywords: [latinName]
            },
            es: { commonName: latinName, category: categoryKey, origin: '', essence: '', mainIndications: [], keynotes: [], mindEmotional: '', modalitiesBetter: [], modalitiesWorse: [], potenciesAndDosage: '', sphereOfAction: [], differentialRemedies: [], searchKeywords: [] },
            fr: { commonName: latinName, category: categoryKey, origin: '', essence: '', mainIndications: [], keynotes: [], mindEmotional: '', modalitiesBetter: [], modalitiesWorse: [], potenciesAndDosage: '', sphereOfAction: [], differentialRemedies: [], searchKeywords: [] },
            el: { commonName: latinName, category: categoryKey, origin: '', essence: '', mainIndications: [], keynotes: [], mindEmotional: '', modalitiesBetter: [], modalitiesWorse: [], potenciesAndDosage: '', sphereOfAction: [], differentialRemedies: [], searchKeywords: [] },
            it: { commonName: latinName, category: categoryKey, origin: '', essence: '', mainIndications: [], keynotes: [], mindEmotional: '', modalitiesBetter: [], modalitiesWorse: [], potenciesAndDosage: '', sphereOfAction: [], differentialRemedies: [], searchKeywords: [] },
            ru: { commonName: latinName, category: categoryKey, origin: '', essence: '', mainIndications: [], keynotes: [], mindEmotional: '', modalitiesBetter: [], modalitiesWorse: [], potenciesAndDosage: '', sphereOfAction: [], differentialRemedies: [], searchKeywords: [] }
          }
        };

        const existing = MATERIA_MEDICA_ENTRIES.find(e => e.id === id || e.latinName.toLowerCase() === latinName.toLowerCase());
        const isNew = !existing;
        const conflict = Boolean(existing);

        records.push({
          import_id: `imp_${Date.now()}_${i}`,
          dataset_id: datasetId,
          source_author: row.source_author || meta.source_author || 'Unknown Author',
          source_work: row.source_work || meta.source_work || 'Imported Monograph Work',
          source_page: row.source_page || '1',
          source_reference: row.source_reference || 'Imported Reference',
          license_status: row.license_status || meta.license_status || 'UNKNOWN',
          source_note: row.source_note || '',
          imported_entry: importedEntry,
          existing_entry: existing,
          is_new: isNew,
          conflict_detected: conflict,
          resolution_strategy: conflict ? 'KEEP_EXISTING' : 'OVERWRITE',
          resolved_entry: existing || importedEntry,
          status: 'PENDING_REVIEW'
        });
      }
    } else {
      // JSON format fallback
      try {
        const parsed = JSON.parse(rawText);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        items.forEach((item, idx) => {
          const id = (item.id || `remedy_${idx}`).toLowerCase().replace(/[^a-z0-9-]/g, '-');
          const latinName = item.latinName || id;
          const importedEntry: MateriaMedicaEntry = {
            id,
            latinName,
            categoryKey: item.categoryKey || 'plant',
            importanceTier: item.importanceTier || 2,
            aliases: item.aliases || [],
            translations: item.translations || MATERIA_MEDICA_ENTRIES[0].translations
          };
          const existing = MATERIA_MEDICA_ENTRIES.find(e => e.id === id);
          records.push({
            import_id: `imp_${Date.now()}_${idx}`,
            dataset_id: datasetId,
            source_author: item.source_author || meta.source_author || 'Unknown',
            source_work: item.source_work || meta.source_work || 'JSON Import Work',
            source_page: '1',
            source_reference: 'JSON Ref',
            license_status: meta.license_status || 'UNKNOWN',
            source_note: '',
            imported_entry: importedEntry,
            existing_entry: existing,
            is_new: !existing,
            conflict_detected: Boolean(existing),
            resolution_strategy: existing ? 'KEEP_EXISTING' : 'OVERWRITE',
            resolved_entry: existing || importedEntry,
            status: 'PENDING_REVIEW'
          });
        });
      } catch (err) {
        console.error('JSON parse error in MM import:', err);
      }
    }

    this.imports = records;
    return records;
  }

  public runPreflight(): MateriaMedicaPreflightReport {
    const total_rows = this.imports.length;
    const new_remedies = this.imports.filter(r => r.is_new).length;
    const conflicting_remedies = this.imports.filter(r => r.conflict_detected).length;
    const errors: string[] = [];

    this.imports.forEach((imp, idx) => {
      if (!imp.imported_entry.id) errors.push(`Row ${idx}: Missing remedy ID`);
      if (!imp.imported_entry.latinName) errors.push(`Row ${idx}: Missing Latin Name`);
    });

    return {
      total_rows,
      new_remedies,
      conflicting_remedies,
      valid_rows: total_rows - errors.length,
      invalid_rows: errors.length,
      ready_for_import: errors.length === 0 && total_rows > 0,
      errors
    };
  }

  public setResolutionStrategy(importId: string, strategy: 'KEEP_EXISTING' | 'OVERWRITE' | 'MERGE' | 'MANUAL', customResolved?: MateriaMedicaEntry) {
    const item = this.imports.find(r => r.import_id === importId);
    if (!item) return;
    item.resolution_strategy = strategy;
    if (customResolved) {
      item.resolved_entry = customResolved;
    } else if (strategy === 'KEEP_EXISTING') {
      item.resolved_entry = item.existing_entry || item.imported_entry;
    } else if (strategy === 'OVERWRITE') {
      item.resolved_entry = item.imported_entry;
    } else if (strategy === 'MERGE' && item.existing_entry) {
      // Merge strategy: combine aliases, longest strings, union arrays
      const ex = item.existing_entry;
      const imp = item.imported_entry;
      item.resolved_entry = {
        ...ex,
        aliases: Array.from(new Set([...(ex.aliases || []), ...(imp.aliases || [])])),
        translations: {
          ...ex.translations,
          de: {
            ...ex.translations.de,
            essence: (imp.translations.de.essence.length > ex.translations.de.essence.length) ? imp.translations.de.essence : ex.translations.de.essence,
            keynotes: Array.from(new Set([...ex.translations.de.keynotes, ...imp.translations.de.keynotes])),
            mainIndications: Array.from(new Set([...ex.translations.de.mainIndications, ...imp.translations.de.mainIndications]))
          }
        }
      };
    }
  }

  public approveImport(): { addedCount: number; updatedCount: number } {
    let addedCount = 0;
    let updatedCount = 0;

    this.imports.forEach(imp => {
      if (imp.status === 'APPROVED') return;
      if (imp.is_new && imp.resolution_strategy !== 'KEEP_EXISTING') {
        this.importedCustomEntries.push(imp.resolved_entry!);
        addedCount++;
      } else if (!imp.is_new && imp.resolution_strategy !== 'KEEP_EXISTING') {
        updatedCount++;
      }
      imp.status = 'APPROVED';
    });

    return { addedCount, updatedCount };
  }

  public getImportedCustomEntries(): MateriaMedicaEntry[] {
    return this.importedCustomEntries;
  }
}

export const materiaMedicaImportManager = new MateriaMedicaImportManager();
